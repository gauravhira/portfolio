import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Lead } from "@/lib/lead-types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single<Lead>();

  if (fetchError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  if (!lead.email || !lead.email_subject || !lead.email_body) {
    return NextResponse.json(
      { error: "Lead is missing email, subject, or body" },
      { status: 400 }
    );
  }

  if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_APP_PASSWORD) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: "smtppro.zoho.in",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_EMAIL,
      pass: process.env.ZOHO_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: "Gaurav Hira <gaurav@gauravhira.dev>",
      to: lead.email,
      subject: lead.email_subject,
      text: lead.email_body,
    });
  } catch (err) {
    console.error("SMTP send failed:", err);
    const message = err instanceof Error ? err.message : "Unknown SMTP error";
    return NextResponse.json({ error: `Failed to send email: ${message}` }, { status: 502 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("leads")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ lead: updated });
}
