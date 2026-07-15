import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { LeadStatus } from "@/lib/lead-types";

const ALLOWED_STATUSES: LeadStatus[] = ["drafted", "approved", "sent", "rejected"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: {
    status?: LeadStatus;
    email_subject?: string;
    email_body?: string;
    linkedin_message?: string;
    linkedin_url?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const update: Record<string, string | null> = {};

  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (body.email_subject !== undefined) update.email_subject = body.email_subject;
  if (body.email_body !== undefined) update.email_body = body.email_body;
  if (body.linkedin_message !== undefined) update.linkedin_message = body.linkedin_message;
  // Coerce blank input to null so "has LinkedIn" reachability filters/counts stay accurate.
  if (body.linkedin_url !== undefined) {
    const trimmed = body.linkedin_url.trim();
    update.linkedin_url = trimmed === "" ? null : trimmed;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead: data });
}
