export type LeadStatus = "drafted" | "approved" | "sent" | "rejected";

export interface Lead {
  id: string;
  name: string;
  category: string | null;
  location: string | null;
  website: string | null;
  email: string | null;
  instagram_url: string | null;
  business_summary: string | null;
  service_fit: string | null;
  confidence: string | number | null;
  observation: string | null;
  email_subject: string | null;
  email_body: string | null;
  linkedin_message: string | null;
  status: LeadStatus;
  created_at: string;
  sent_at: string | null;
}
