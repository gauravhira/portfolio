import { createClient } from '@supabase/supabase-js';
import { computeNextSlot } from '@/lib/scheduling';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { leadIds } = await req.json(); // array, even for a single approve
    if (!leadIds?.length) {
      return Response.json({ error: 'No leadIds provided' }, { status: 400 });
    }

    const { data: leads, error: fetchErr } = await supabase
      .from('leads')
      .select('id, timezone, lat, lng')
      .in('id', leadIds);

    if (fetchErr) throw fetchErr;

    // Group by timezone so the cursor increments correctly within one bulk request
    const byTz = {};
    for (const lead of leads) {
      const tz = lead.timezone || 'America/New_York'; // fallback default
      if (!byTz[tz]) byTz[tz] = [];
      byTz[tz].push(lead);
    }

    const updates = [];

    for (const [tz, tzLeads] of Object.entries(byTz)) {
      // seed cursor with current max scheduled_send_at for this tz, among leads
      // already approved-but-unsent (so today's batch continues from wherever
      // a previous session left off). Excludes rows with no scheduled_send_at
      // yet (pre-dating this feature) — otherwise Postgres's default
      // NULLS-FIRST-on-DESC ordering would surface one of those instead of
      // the real max and incorrectly reset the cursor to "now".
      const { data: existingMax, error: maxErr } = await supabase
        .from('leads')
        .select('scheduled_send_at')
        .eq('timezone', tz)
        .eq('status', 'approved')
        .is('sent_at', null)
        .not('scheduled_send_at', 'is', null)
        .order('scheduled_send_at', { ascending: false })
        .limit(1);

      if (maxErr) throw maxErr;

      let cursor = existingMax?.[0]?.scheduled_send_at || null;

      for (const lead of tzLeads) {
        const slot = computeNextSlot(tz, cursor);
        cursor = slot;
        updates.push({ id: lead.id, scheduled_send_at: slot, status: 'approved' });
      }
    }

    // Supabase JS client has no bulk-update-with-different-values, so loop
    for (const u of updates) {
      const { error: updateErr } = await supabase
        .from('leads')
        .update({ scheduled_send_at: u.scheduled_send_at, status: u.status })
        .eq('id', u.id);
      if (updateErr) throw updateErr;
    }

    return Response.json({ scheduled: updates });
  } catch (err) {
    console.error('Approve/schedule error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
