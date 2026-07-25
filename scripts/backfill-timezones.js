// One-time backfill: populates `timezone` for every lead where it's still
// null, inferring it from the lead's address (falling back to `location`).
// Run with: node scripts/backfill-timezones.js
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (!match) return;
      const key = match[1].trim();
      const value = match[2].trim();
      if (!(key in process.env)) process.env[key] = value;
    });
}

loadEnvLocal();

const { createClient } = require("@supabase/supabase-js");
const { inferTimezone } = require("../lib/timezoneLookup");

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, address, location")
    .is("timezone", null);

  if (error) {
    console.error("Failed to fetch leads:", error.message);
    process.exit(1);
  }

  console.log(`Found ${leads.length} lead(s) missing timezone.`);

  let updated = 0;
  let failed = 0;
  const breakdown = {};

  for (const lead of leads) {
    const timezone = inferTimezone(lead.address, lead.location);
    const { error: updateError } = await supabase
      .from("leads")
      .update({ timezone })
      .eq("id", lead.id);

    if (updateError) {
      failed += 1;
      console.error(`  Failed to update lead ${lead.id}: ${updateError.message}`);
    } else {
      updated += 1;
      breakdown[timezone] = (breakdown[timezone] || 0) + 1;
    }
  }

  console.log(`Backfill complete: ${updated} updated, ${failed} failed.`);
  console.log("Breakdown by timezone:", breakdown);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
