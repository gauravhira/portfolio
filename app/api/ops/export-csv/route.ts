import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const EXPORT_COLUMNS = [
  "name",
  "category",
  "website",
  "phone",
  "email",
  "rating",
  "reviews",
  "business_type",
  "location",
  "instagram_url",
  "business_summary",
  "service_fit",
  "confidence",
  "observation",
  "email_subject",
  "email_body",
  "linkedin_message",
  "status",
  "created_at",
  "drafted_at",
  "approved_at",
  "sent_at",
] as const;

function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows: Record<string, unknown>[]): string {
  const header = EXPORT_COLUMNS.join(",");
  const lines = rows.map((row) =>
    EXPORT_COLUMNS.map((col) => escapeCsvField(row[col])).join(",")
  );
  return [header, ...lines].join("\r\n");
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const confidence = params.get("confidence");
  const serviceFit = params.get("service_fit");
  const businessType = params.get("business_type");

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("leads")
    .select(EXPORT_COLUMNS.join(","))
    .order("created_at", { ascending: false });

  query = status ? query.eq("status", status) : query.in("status", ["new", "drafted", "approved"]);
  if (confidence) query = query.ilike("confidence", confidence);
  if (serviceFit) query = query.ilike("service_fit", `%${serviceFit}%`);
  if (businessType) query = query.eq("business_type", businessType);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = toCsv((data ?? []) as unknown as Record<string, unknown>[]);
  const filename = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
