"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Lead, LeadStatus } from "@/lib/lead-types";

const STATUS_TABS: { label: string; value: LeadStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Drafted", value: "drafted" },
  { label: "Approved", value: "approved" },
  { label: "Sent", value: "sent" },
  { label: "Rejected", value: "rejected" },
];

const CONFIDENCE_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const SERVICE_FIT_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Leadgen", value: "leadgen" },
  { label: "Automation", value: "automation" },
  { label: "Social", value: "social" },
  { label: "Custom", value: "custom" },
];

type EditableField = "email_subject" | "email_body" | "linkedin_message";
type EditState = Record<
  string,
  { email_subject: string; email_body: string; linkedin_message: string }
>;
type SendResult = { ok: boolean; message: string };
type FieldSaveStatus = "idle" | "saving" | "saved" | "error";
type FieldSaveState = Record<string, Partial<Record<EditableField, FieldSaveStatus>>>;

const EDITABLE_FIELDS: EditableField[] = ["email_subject", "email_body", "linkedin_message"];
const AUTOSAVE_DELAY_MS = 2500;
const SAVED_FADE_MS = 2000;
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
      <div className="bg-[#13171F] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-red-400 whitespace-nowrap">
        Hunter API Usage: {error}
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="bg-[#13171F] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/40 whitespace-nowrap">
        Hunter API Usage: loading…
      </div>
    );
  }

  const quota = usage.searches ?? usage.verifications ?? usage.calls;

  return (
    <div className="bg-[#13171F] border border-white/10 rounded-xl px-4 py-2.5 whitespace-nowrap">
      <div className="flex items-center gap-2 text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-white/40 uppercase tracking-wide">Hunter API Usage</span>
      </div>
      <div className="mt-1 text-sm flex flex-wrap gap-x-3">
        {usage.searches && (
          <span className="font-medium">
            {usage.searches.remaining}{" "}
            <span className="text-white/40 font-normal">search credits remaining</span>
          </span>
        )}
        {usage.verifications && (
          <span className="font-medium">
            {usage.verifications.remaining}{" "}
            <span className="text-white/40 font-normal">verification credits remaining</span>
          </span>
        )}
        {!usage.searches && !usage.verifications && usage.calls && (
          <span className="font-medium">
            {usage.calls.remaining}{" "}
            <span className="text-white/40 font-normal">credits remaining</span>
          </span>
        )}
        {!quota && <span className="text-white/40">unavailable</span>}
      </div>
      {usage.reset_date && (
        <div className="text-[11px] text-white/30 mt-0.5">Resets {usage.reset_date}</div>
      )}
    </div>
  );
}

function SaveStatusLabel({ status }: { status: FieldSaveStatus | undefined }) {
  if (!status || status === "idle") return null;
  if (status === "saving") return <span className="text-white/40 normal-case">Saving…</span>;
  if (status === "saved") return <span className="text-emerald-400 normal-case">Saved</span>;
  return <span className="text-red-400 normal-case">Failed to save</span>;
}

export default function OpsDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0F14] text-white px-6 py-10 md:px-10 text-sm text-white/40">
          Loading…
        </div>
      }
    >
      <OpsDashboardContent />
    </Suspense>
  );
}

function OpsDashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">(
    () => (searchParams.get("status") as LeadStatus | null) || "all"
  );
  const [confidenceFilter, setConfidenceFilter] = useState<string>(
    () => searchParams.get("confidence") || "all"
  );
  const [serviceFitFilter, setServiceFitFilter] = useState<string>(
    () => searchParams.get("service_fit") || "all"
  );
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>(
    () => searchParams.get("business_type") || "all"
  );
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edits, setEdits] = useState<EditState>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendResults, setSendResults] = useState<Record<string, SendResult>>({});
  const [fieldSaveStatus, setFieldSaveStatus] = useState<FieldSaveState>({});
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  // Refs (not state) because timers and in-flight-edit tracking must be readable
  // synchronously from blur/unmount/beforeunload handlers without waiting on a render.
  const timersRef = useRef<Record<string, Partial<Record<EditableField, ReturnType<typeof setTimeout>>>>>({});
  const pendingRef = useRef<Record<string, Partial<Record<EditableField, string>>>>({});

  const fetchLeads = useCallback(
    async (filters: {
      status: LeadStatus | "all";
      confidence: string;
      serviceFit: string;
      businessType: string;
    }) => {
      setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams();
        if (filters.status !== "all") qs.set("status", filters.status);
        if (filters.confidence !== "all") qs.set("confidence", filters.confidence);
        if (filters.serviceFit !== "all") qs.set("service_fit", filters.serviceFit);
        if (filters.businessType !== "all") qs.set("business_type", filters.businessType);
        const query = qs.toString();
        const res = await fetch(`/api/ops/leads${query ? `?${query}` : ""}`);
        if (!res.ok) throw new Error("Failed to load leads");
        const data = await res.json();
        setLeads(data.leads ?? []);
        setTotal(data.total ?? 0);
      } catch {
        setError("Could not load leads");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLeads({
      status: statusFilter,
      confidence: confidenceFilter,
      serviceFit: serviceFitFilter,
      businessType: businessTypeFilter,
    });

    const qs = new URLSearchParams();
    if (statusFilter !== "all") qs.set("status", statusFilter);
    if (confidenceFilter !== "all") qs.set("confidence", confidenceFilter);
    if (serviceFitFilter !== "all") qs.set("service_fit", serviceFitFilter);
    if (businessTypeFilter !== "all") qs.set("business_type", businessTypeFilter);
    const query = qs.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [statusFilter, confidenceFilter, serviceFitFilter, businessTypeFilter, fetchLeads, router, pathname]);

  useEffect(() => {
    fetch("/api/ops/leads/business-types")
      .then((res) => res.json())
      .then((data) => setBusinessTypes(data.business_types ?? []))
      .catch(() => {});
  }, []);

  function editValue(lead: Lead, field: EditableField) {
    return edits[lead.id]?.[field] ?? lead[field] ?? "";
  }

  function setEditValue(lead: Lead, field: EditableField, value: string) {
    setEdits((prev) => ({
      ...prev,
      [lead.id]: {
        email_subject: prev[lead.id]?.email_subject ?? lead.email_subject ?? "",
        email_body: prev[lead.id]?.email_body ?? lead.email_body ?? "",
        linkedin_message: prev[lead.id]?.linkedin_message ?? lead.linkedin_message ?? "",
        [field]: value,
      },
    }));
  }

  function setFieldStatus(leadId: string, field: EditableField, status: FieldSaveStatus) {
    setFieldSaveStatus((prev) => ({ ...prev, [leadId]: { ...prev[leadId], [field]: status } }));
  }

  function sendFieldUpdate(leadId: string, field: EditableField, value: string, keepalive = false) {
    return fetch(`/api/ops/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
      keepalive,
    });
  }

  const flushField = useCallback(async (leadId: string, field: EditableField) => {
    const value = pendingRef.current[leadId]?.[field];
    if (value === undefined) return;

    const leadTimers = timersRef.current[leadId];
    if (leadTimers?.[field]) {
      clearTimeout(leadTimers[field]);
      delete leadTimers[field];
    }

    setFieldStatus(leadId, field, "saving");
    try {
      const res = await sendFieldUpdate(leadId, field, value);
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));

      // Only clear "pending" if nothing newer overwrote it while this request was in flight.
      if (pendingRef.current[leadId]?.[field] === value) {
        delete pendingRef.current[leadId][field];
      }

      setFieldSaveStatus((prev) =>
        prev[leadId]?.[field] === "saving"
          ? { ...prev, [leadId]: { ...prev[leadId], [field]: "saved" } }
          : prev
      );
      setTimeout(() => {
        setFieldSaveStatus((prev) =>
          prev[leadId]?.[field] === "saved"
            ? { ...prev, [leadId]: { ...prev[leadId], [field]: "idle" } }
            : prev
        );
      }, SAVED_FADE_MS);
    } catch {
      setFieldStatus(leadId, field, "error");
    }
  }, []);

  function scheduleAutosave(lead: Lead, field: EditableField, value: string) {
    pendingRef.current[lead.id] = { ...pendingRef.current[lead.id], [field]: value };

    const leadTimers = timersRef.current[lead.id] ?? {};
    if (leadTimers[field]) clearTimeout(leadTimers[field]);
    leadTimers[field] = setTimeout(() => {
      flushField(lead.id, field);
    }, AUTOSAVE_DELAY_MS);
    timersRef.current[lead.id] = leadTimers;
  }

  function flushFieldOnBlur(lead: Lead, field: EditableField) {
    if (pendingRef.current[lead.id]?.[field] !== undefined) {
      flushField(lead.id, field);
    }
  }

  async function saveNow(lead: Lead) {
    EDITABLE_FIELDS.forEach((field) => {
      pendingRef.current[lead.id] = {
        ...pendingRef.current[lead.id],
        [field]: editValue(lead, field),
      };
    });
    await Promise.all(EDITABLE_FIELDS.map((field) => flushField(lead.id, field)));
  }

  function flushLeadPending(leadId: string) {
    EDITABLE_FIELDS.forEach((field) => {
      if (pendingRef.current[leadId]?.[field] !== undefined) {
        flushField(leadId, field);
      }
    });
  }

  function closeExpandedModal() {
    if (expandedLeadId) flushLeadPending(expandedLeadId);
    setExpandedLeadId(null);
  }

  useEffect(() => {
    if (!expandedLeadId) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeExpandedModal();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedLeadId]);

  useEffect(() => {
    function flushAllPendingKeepalive() {
      Object.entries(pendingRef.current).forEach(([leadId, fields]) => {
        (Object.keys(fields) as EditableField[]).forEach((field) => {
          const value = fields[field];
          if (value !== undefined) {
            sendFieldUpdate(leadId, field, value, true).catch(() => {});
          }
        });
      });
    }

    window.addEventListener("beforeunload", flushAllPendingKeepalive);
    return () => {
      window.removeEventListener("beforeunload", flushAllPendingKeepalive);
      flushAllPendingKeepalive();
      Object.values(timersRef.current).forEach((leadTimers) => {
        Object.values(leadTimers ?? {}).forEach((t) => t && clearTimeout(t));
      });
    };
  }, []);

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
        await fetchLeads({
          status: statusFilter,
          confidence: confidenceFilter,
          serviceFit: serviceFitFilter,
          businessType: businessTypeFilter,
        });
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

  const expandedLead = leads.find((l) => l.id === expandedLeadId) ?? null;

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white px-6 py-10 md:px-10">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Ops Dashboard</h1>
          <p className="text-sm text-white/40">ops.gauravhira.dev · Lead review</p>
        </div>
        <HunterUsageWidget />
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/30 mb-1.5">Status</p>
          <div className="flex gap-2 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  statusFilter === tab.value
                    ? "bg-[#01CAFF] text-[#0C0F14] border-[#01CAFF] font-medium"
                    : "border-white/15 text-white/70 hover:border-white/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/30 mb-1.5">Confidence</p>
          <div className="flex gap-2 flex-wrap">
            {CONFIDENCE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setConfidenceFilter(tab.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  confidenceFilter === tab.value
                    ? "bg-[#DA850B] text-[#0C0F14] border-[#DA850B] font-medium"
                    : "border-white/15 text-white/70 hover:border-white/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/30 mb-1.5">Service fit</p>
          <div className="flex gap-2 flex-wrap">
            {SERVICE_FIT_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setServiceFitFilter(tab.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  serviceFitFilter === tab.value
                    ? "bg-[#01CAFF] text-[#0C0F14] border-[#01CAFF] font-medium"
                    : "border-white/15 text-white/70 hover:border-white/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/30 mb-1.5">Business type</p>
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/15 px-3 py-1.5 text-sm text-white/90 outline-none focus:border-[#01CAFF]"
          >
            <option value="all">All</option>
            {businessTypes.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-white/40 mb-4">
        Showing {leads.length} of {total} leads
      </p>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {loading && <p className="text-white/40 text-sm">Loading…</p>}
      {!loading && leads.length === 0 && (
        <p className="text-white/40 text-sm">No leads in this view.</p>
      )}

      <div className="flex flex-col gap-4 max-w-5xl">
        {leads.map((lead, index) => (
          <div
            key={lead.id}
            className="bg-[#13171F] border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-start gap-3">
                <span className="text-white/30 font-mono text-sm pt-0.5">
                  #{index + 1}
                </span>
                <div>
                  <h2 className="font-semibold text-lg leading-tight">{lead.name}</h2>
                  <p className="text-xs text-white/40">
                    {lead.category ?? "—"} · {lead.business_type ?? "—"} · {lead.location ?? "—"}
                  </p>
                </div>
              </div>
              <span className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 whitespace-nowrap">
                {lead.status}
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
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

              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs text-white/40">
                  <div className="flex items-center justify-between">
                    <span>Email subject</span>
                    <SaveStatusLabel status={fieldSaveStatus[lead.id]?.email_subject} />
                  </div>
                  <input
                    type="text"
                    value={editValue(lead, "email_subject")}
                    onChange={(e) => {
                      setEditValue(lead, "email_subject", e.target.value);
                      scheduleAutosave(lead, "email_subject", e.target.value);
                    }}
                    onBlur={() => flushFieldOnBlur(lead, "email_subject")}
                    className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-sm text-white/90 outline-none focus:border-[#01CAFF]"
                  />
                </label>

                <label className="text-xs text-white/40">
                  <div className="flex items-center justify-between">
                    <span>Email body</span>
                    <div className="flex items-center gap-2">
                      <SaveStatusLabel status={fieldSaveStatus[lead.id]?.email_body} />
                      <button
                        type="button"
                        onClick={() => setExpandedLeadId(lead.id)}
                        className="text-[#01CAFF] hover:underline normal-case"
                      >
                        Expand
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={editValue(lead, "email_body")}
                    onChange={(e) => {
                      setEditValue(lead, "email_body", e.target.value);
                      scheduleAutosave(lead, "email_body", e.target.value);
                    }}
                    onBlur={() => flushFieldOnBlur(lead, "email_body")}
                    rows={4}
                    className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-sm text-white/90 outline-none focus:border-[#01CAFF]"
                  />
                </label>

                <label className="text-xs text-white/40">
                  <div className="flex items-center justify-between">
                    <span>LinkedIn message</span>
                    <SaveStatusLabel status={fieldSaveStatus[lead.id]?.linkedin_message} />
                  </div>
                  <textarea
                    value={editValue(lead, "linkedin_message")}
                    onChange={(e) => {
                      setEditValue(lead, "linkedin_message", e.target.value);
                      scheduleAutosave(lead, "linkedin_message", e.target.value);
                    }}
                    onBlur={() => flushFieldOnBlur(lead, "linkedin_message")}
                    rows={3}
                    className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-sm text-white/90 outline-none focus:border-[#01CAFF]"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-4 border-t border-white/10">
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
                disabled={EDITABLE_FIELDS.some(
                  (field) => fieldSaveStatus[lead.id]?.[field] === "saving"
                )}
                onClick={() => saveNow(lead)}
                className="flex-1 rounded-lg bg-white/5 border border-white/15 text-sm py-2 disabled:opacity-50"
              >
                Save now
              </button>
            </div>

            {lead.status === "approved" && (
              <div className="flex flex-col gap-2 mt-3">
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

      {expandedLead && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeExpandedModal();
          }}
        >
          <div className="bg-[#13171F] border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-semibold text-lg leading-tight">{expandedLead.name}</h2>
                <p className="text-xs text-white/40">
                  {expandedLead.category ?? "—"} · {expandedLead.location ?? "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeExpandedModal}
                className="text-white/50 hover:text-white text-sm rounded-lg border border-white/15 px-3 py-1.5"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto">
              <label className="text-xs text-white/40">
                <div className="flex items-center justify-between">
                  <span>Email subject</span>
                  <SaveStatusLabel status={fieldSaveStatus[expandedLead.id]?.email_subject} />
                </div>
                <input
                  type="text"
                  value={editValue(expandedLead, "email_subject")}
                  onChange={(e) => {
                    setEditValue(expandedLead, "email_subject", e.target.value);
                    scheduleAutosave(expandedLead, "email_subject", e.target.value);
                  }}
                  onBlur={() => flushFieldOnBlur(expandedLead, "email_subject")}
                  className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-sm text-white/90 outline-none focus:border-[#01CAFF]"
                />
              </label>

              <label className="text-xs text-white/40 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between">
                  <span>Email body</span>
                  <SaveStatusLabel status={fieldSaveStatus[expandedLead.id]?.email_body} />
                </div>
                <textarea
                  value={editValue(expandedLead, "email_body")}
                  onChange={(e) => {
                    setEditValue(expandedLead, "email_body", e.target.value);
                    scheduleAutosave(expandedLead, "email_body", e.target.value);
                  }}
                  onBlur={() => flushFieldOnBlur(expandedLead, "email_body")}
                  className="mt-1 w-full flex-1 min-h-[40vh] rounded-lg bg-white/5 border border-white/10 p-3 text-sm text-white/90 outline-none focus:border-[#01CAFF] resize-none"
                />
              </label>

              <label className="text-xs text-white/40">
                <div className="flex items-center justify-between">
                  <span>LinkedIn message</span>
                  <SaveStatusLabel status={fieldSaveStatus[expandedLead.id]?.linkedin_message} />
                </div>
                <textarea
                  value={editValue(expandedLead, "linkedin_message")}
                  onChange={(e) => {
                    setEditValue(expandedLead, "linkedin_message", e.target.value);
                    scheduleAutosave(expandedLead, "linkedin_message", e.target.value);
                  }}
                  onBlur={() => flushFieldOnBlur(expandedLead, "linkedin_message")}
                  rows={4}
                  className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 p-2 text-sm text-white/90 outline-none focus:border-[#01CAFF]"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
