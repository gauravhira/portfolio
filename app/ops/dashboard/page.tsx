"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/lead-types";

const TABS: { label: string; value: LeadStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Drafted", value: "drafted" },
  { label: "Approved", value: "approved" },
  { label: "Sent", value: "sent" },
  { label: "Rejected", value: "rejected" },
];

type EditState = Record<string, { email_body: string; linkedin_message: string }>;
type SendResult = { ok: boolean; message: string };
type HunterQuota = { used: number; available: number; remaining: number };
type HunterUsage = {
  searches: HunterQuota | null;
  verifications: HunterQuota | null;
  calls: HunterQuota | null;
  reset_date: string | null;
};

function HunterUsageWidget() {
  const [usage, setUsage] = useState<HunterUsage | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/ops/hunter-usage")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setUsage(data);
      })
      .catch(() => setError("Could not load Hunter usage"));
  }, []);

  if (error) {
    return (
      <div className="bg-[#13171F] border border-white/10 rounded-xl px-4 py-3 text-sm text-red-400 mb-6 inline-block">
        Hunter credits: {error}
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="bg-[#13171F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/40 mb-6 inline-block">
        Loading Hunter credits…
      </div>
    );
  }

  const quota = usage.searches ?? usage.verifications ?? usage.calls;

  return (
    <div className="bg-[#13171F] border border-white/10 rounded-xl px-4 py-3 text-sm mb-6 inline-flex flex-wrap gap-x-4 gap-y-1 items-center">
      {usage.searches && (
        <span>
          <span className="text-white/40">Searches:</span>{" "}
          <span className="font-medium">{usage.searches.remaining}</span>
          <span className="text-white/30"> / {usage.searches.available}</span>
        </span>
      )}
      {usage.verifications && (
        <span>
          <span className="text-white/40">Verifications:</span>{" "}
          <span className="font-medium">{usage.verifications.remaining}</span>
          <span className="text-white/30"> / {usage.verifications.available}</span>
        </span>
      )}
      {!usage.searches && !usage.verifications && usage.calls && (
        <span>
          <span className="text-white/40">Hunter credits:</span>{" "}
          <span className="font-medium">{usage.calls.remaining}</span>
          <span className="text-white/30"> / {usage.calls.available}</span>
        </span>
      )}
      {!quota && <span className="text-white/40">Hunter credits: unavailable</span>}
      {usage.reset_date && (
        <span className="text-white/30 text-xs">Resets {usage.reset_date}</span>
      )}
    </div>
  );
}

export default function OpsDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edits, setEdits] = useState<EditState>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendResults, setSendResults] = useState<Record<string, SendResult>>({});

  const fetchLeads = useCallback(async (status: LeadStatus | "all") => {
    setLoading(true);
    setError("");
    try {
      const qs = status === "all" ? "" : `?status=${status}`;
      const res = await fetch(`/api/ops/leads${qs}`);
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads(data.leads ?? []);
    } catch {
      setError("Could not load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(filter);
  }, [filter, fetchLeads]);

  function editValue(lead: Lead, field: "email_body" | "linkedin_message") {
    return edits[lead.id]?.[field] ?? lead[field] ?? "";
  }

  function setEditValue(lead: Lead, field: "email_body" | "linkedin_message", value: string) {
    setEdits((prev) => ({
      ...prev,
      [lead.id]: {
        email_body: prev[lead.id]?.email_body ?? lead.email_body ?? "",
        linkedin_message: prev[lead.id]?.linkedin_message ?? lead.linkedin_message ?? "",
        [field]: value,
      },
    }));
  }

  async function patchLead(id: string, body: Record<string, string>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/ops/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === id ? data.lead : l)));
    } catch {
      setError("Update failed — please retry");
    } finally {
      setBusyId(null);
    }
  }

  async function sendLead(lead: Lead) {
    const confirmed = window.confirm(
      `Send this email to ${lead.email}? This sends a real message and can't be undone.`
    );
    if (!confirmed) return;

    setSendingId(lead.id);
    setSendResults((prev) => {
      const next = { ...prev };
      delete next[lead.id];
      return next;
    });

    try {
      const res = await fetch(`/api/ops/leads/${lead.id}/send`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendResults((prev) => ({
          ...prev,
          [lead.id]: { ok: false, message: data.error ?? "Failed to send" },
        }));
      } else {
        setSendResults((prev) => ({ ...prev, [lead.id]: { ok: true, message: "Email sent" } }));
        await fetchLeads(filter);
      }
    } catch {
      setSendResults((prev) => ({
        ...prev,
        [lead.id]: { ok: false, message: "Failed to send" },
      }));
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white px-6 py-10 md:px-10">
      <h1 className="text-2xl font-semibold mb-1">Ops Dashboard</h1>
      <p className="text-sm text-white/40 mb-4">ops.gauravhira.dev · Lead review</p>

      <HunterUsageWidget />

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filter === tab.value
                ? "bg-[#01CAFF] text-[#0C0F14] border-[#01CAFF] font-medium"
                : "border-white/15 text-white/70 hover:border-white/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {loading && <p className="text-white/40 text-sm">Loading…</p>}
      {!loading && leads.length === 0 && (
        <p className="text-white/40 text-sm">No leads in this view.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="bg-[#13171F] border border-white/10 rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-lg leading-tight">{lead.name}</h2>
                <p className="text-xs text-white/40">
                  {lead.category ?? "—"} · {lead.location ?? "—"}
                </p>
              </div>
              <span className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 whitespace-nowrap">
                {lead.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              {lead.website && (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#01CAFF] hover:underline"
                >
                  Website
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="text-[#01CAFF] hover:underline">
                  {lead.email}
                </a>
              )}
              {lead.instagram_url && (
                <a
                  href={lead.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#01CAFF] hover:underline"
                >
                  Instagram
                </a>
              )}
            </div>

            {lead.business_summary && (
              <p className="text-sm text-white/70">{lead.business_summary}</p>
            )}

            <div className="text-xs text-white/50 space-y-1">
              {lead.service_fit && <p><span className="text-white/30">Service fit:</span> {lead.service_fit}</p>}
              {lead.confidence !== null && lead.confidence !== undefined && (
                <p><span className="text-white/30">Confidence:</span> {lead.confidence}</p>
              )}
              {lead.observation && <p><span className="text-white/30">Observation:</span> {lead.observation}</p>}
            </div>

            {lead.email_subject && (
              <p className="text-sm">
                <span className="text-white/30 text-xs">Subject:</span> {lead.email_subject}
              </p>
            )}

            <label className="text-xs text-white/40">
              Email body
              <textarea
                value={editValue(lead, "email_body")}
                onChange={(e) => setEditValue(lead, "email_body", e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-sm text-white/90 outline-none focus:border-[#01CAFF]"
              />
            </label>

            <label className="text-xs text-white/40">
              LinkedIn message
              <textarea
                value={editValue(lead, "linkedin_message")}
                onChange={(e) => setEditValue(lead, "linkedin_message", e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-sm text-white/90 outline-none focus:border-[#01CAFF]"
              />
            </label>

            <div className="flex gap-2 pt-1">
              <button
                disabled={busyId === lead.id}
                onClick={() => patchLead(lead.id, { status: "approved" })}
                className="flex-1 rounded-lg bg-[#01CAFF] text-[#0C0F14] text-sm font-medium py-2 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={busyId === lead.id}
                onClick={() => patchLead(lead.id, { status: "rejected" })}
                className="flex-1 rounded-lg bg-white/5 border border-white/15 text-sm py-2 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                disabled={busyId === lead.id}
                onClick={() =>
                  patchLead(lead.id, {
                    email_body: editValue(lead, "email_body"),
                    linkedin_message: editValue(lead, "linkedin_message"),
                  })
                }
                className="flex-1 rounded-lg bg-white/5 border border-white/15 text-sm py-2 disabled:opacity-50"
              >
                Save Edits
              </button>
            </div>

            {lead.status === "approved" && (
              <div className="flex flex-col gap-2">
                <button
                  disabled={sendingId === lead.id}
                  onClick={() => sendLead(lead)}
                  className="rounded-lg bg-[#DA850B] text-[#0C0F14] text-sm font-medium py-2 disabled:opacity-50"
                >
                  {sendingId === lead.id ? "Sending…" : "Send"}
                </button>
                {sendResults[lead.id] && (
                  <p
                    className={`text-xs ${
                      sendResults[lead.id].ok ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {sendResults[lead.id].message}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
