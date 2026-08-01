export type LeadStatus = "new" | "drafted" | "approved" | "sent" | "rejected" | "send_failed";

export interface Lead {
  id: string;
  name: string;
  category: string | null;
  business_type: string | null;
  location: string | null;
  address: string | null;
  timezone: string | null;
  scheduled_send_at: string | null;
  last_error: string | null;
  website: string | null;
  email: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  business_summary: string | null;
  service_fit: string | null;
  confidence: string | number | null;
  observation: string | null;
  email_subject: string | null;
  email_body: string | null;
  linkedin_message: string | null;
  dm_draft: string | null;
  dm_sent: boolean;
  linkedin_sent: boolean;
  status: LeadStatus;
  created_at: string;
  sent_at: string | null;
}
