import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Lead } from "@/lib/lead-types";

function confidenceRank(confidence: Lead["confidence"]): number {
  if (confidence === null || confidence === undefined) return 3;
  const value = String(confidence).trim().toLowerCase();
  if (value === "high") return 0;
  if (value === "medium" || value === "med") return 1;
  if (value === "low") return 2;
  return 3;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const confidence = params.get("confidence");
  const serviceFit = params.get("service_fit");
  const businessType = params.get("business_type");
  const reachability = params.get("reachability");

  const parsedPage = parseInt(params.get("page") ?? "1", 10);
  const page = parsedPage > 0 ? parsedPage : 1;
  const parsedPageSize = parseInt(params.get("pageSize") ?? "25", 10);
  const pageSize = parsedPageSize > 0 ? parsedPageSize : 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  query = status ? query.eq("status", status) : query.in("status", ["new", "drafted", "approved"]);

  if (confidence) query = query.ilike("confidence", confidence);
  if (serviceFit) query = query.ilike("service_fit", `%${serviceFit}%`);
  if (businessType) query = query.eq("business_type", businessType);

  if (reachability === "has_email") {
    query = query.not("email", "is", null);
  } else if (reachability === "has_linkedin") {
    query = query.not("linkedin_url", "is", null);
  } else if (reachability === "reachable") {
    query = query.or("email.not.is.null,linkedin_url.not.is.null");
  }

  const [
    { data, error, count: filteredTotal },
    { count: withEmail, error: withEmailError },
    { count: withLinkedin, error: withLinkedinError },
    { count: needResearch, error: needResearchError },
  ] = await Promise.all([
    query,
    supabase.from("leads").select("*", { count: "exact", head: true }).not("email", "is", null),
    supabase.from("leads").select("*", { count: "exact", head: true }).not("linkedin_url", "is", null),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .is("email", null)
      .is("linkedin_url", null),
  ]);

  const firstError = error ?? withEmailError ?? withLinkedinError ?? needResearchError;
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  // Confidence re-sort only reorders leads within the page that .range()
  // already sliced by created_at — it never moves a lead across page
  // boundaries, so pagination stays consistent with this secondary sort.
  const sorted = [...(data ?? [])].sort(
    (a, b) => confidenceRank(a.confidence) - confidenceRank(b.confidence)
  );

  return NextResponse.json({
    leads: sorted,
    total: filteredTotal ?? sorted.length,
    page,
    pageSize,
    reachabilitySummary: {
      withEmail: withEmail ?? 0,
      withLinkedin: withLinkedin ?? 0,
      needResearch: needResearch ?? 0,
    },
  });
}
