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

const REACHABILITY_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Has Email", value: "has_email" },
  { label: "Has LinkedIn", value: "has_linkedin" },
  { label: "Reachable", value: "reachable" },
];

// Shared pill style: light outline by default, solid navy when active — matches
// the portfolio's own "selected chip" convention (see ProjectGrid tech tags).
function pillClass(active: boolean) {
  return `px-3 py-1.5 rounded-full text-sm border transition-colors ${
    active
      ? "bg-[var(--navy)] text-white border-[var(--navy)] font-medium"
      : "border-black/20 text-[var(--navy)] hover:border-[var(--navy)]"
  }`;
}

type EditableField = "email_subject" | "email_body" | "linkedin_message" | "linkedin_url";
type EditState = Record<
  string,
  { email_subject: string; email_body: string; linkedin_message: string; linkedin_url: string }
>;
type SendResult = { ok: boolean; message: string };
type FieldSaveStatus = "idle" | "saving" | "saved" | "error";
type FieldSaveState = Record<string, Partial<Record<EditableField, FieldSaveStatus>>>;
type ReachabilitySummary = { withEmail: number; withLinkedin: number; needResearch: number };

const EDITABLE_FIELDS: EditableField[] = [
  "email_subject",
  "email_body",
  "linkedin_message",
  "linkedin_url",
];
const AUTOSAVE_DELAY_MS = 2500;
const SAVED_FADE_MS = 2000;
type HunterQuota = { used: number; available: number; remaining: number };
type HunterUsage = {
  searches: HunterQuota | null;
  verifications: HunterQuota | null;
  calls: HunterQuota | null;
  reset_date: string | null;
};

// Styled like Hero's "Open for new projects" badge — a small tinted accent box,
// not a whole dark panel, per the portfolio's actual light-theme convention.
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

  const boxClass =
    "rounded-xl px-4 py-2.5 whitespace-nowrap border border-[rgba(1,202,255,0.3)] bg-[rgba(1,202,255,0.08)]";

  if (error) {
    return (
      <div className={`${boxClass} text-xs text-red-600`}>Hunter API Usage: {error}</div>
    );
  }

  if (!usage) {
    return (
      <div className={`${boxClass} text-xs text-[var(--muted)]`}>Hunter API Usage: loading…</div>
    );
  }

  const quota = usage.searches ?? usage.verifications ?? usage.calls;

  return (
    <div className={boxClass}>
      <div className="flex items-center gap-2 text-xs">
        <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[var(--cyan2)]" />
        <span className="text-[var(--muted)] uppercase tracking-wide">Hunter API Usage</span>
      </div>
      <div className="mt-1 text-sm flex flex-wrap gap-x-3">
        {usage.searches && (
          <span className="font-serif text-[var(--navy)]">
            {usage.searches.remaining}{" "}
            <span className="text-[var(--muted)] font-sans font-normal text-sm">
              search credits remaining
            </span>
          </span>
        )}
        {usage.verifications && (
          <span className="font-serif text-[var(--navy)]">
            {usage.verifications.remaining}{" "}
            <span className="text-[var(--muted)] font-sans font-normal text-sm">
              verification credits remaining
            </span>
          </span>
        )}
        {!usage.searches && !usage.verifications && usage.calls && (
          <span className="font-serif text-[var(--navy)]">
            {usage.calls.remaining}{" "}
            <span className="text-[var(--muted)] font-sans font-normal text-sm">
              credits remaining
            </span>
          </span>
        )}
        {!quota && <span className="text-[var(--muted)]">unavailable</span>}
      </div>
      {usage.reset_date && (
        <div className="text-[11px] text-[var(--muted)] mt-0.5">Resets {usage.reset_date}</div>
      )}
    </div>
  );
}

function SaveStatusLabel({ status }: { status: FieldSaveStatus | undefined }) {
  if (!status || status === "idle") return null;
  if (status === "saving") return <span className="text-[var(--muted)] normal-case">Saving…</span>;
  if (status === "saved") return <span className="text-emerald-600 normal-case">Saved</span>;
  return <span className="text-red-600 normal-case">Failed to save</span>;
}

// Tinted-badge formula reused from FeaturedProject's "Live" badge, recolored for
// a light background (cyan2/gold text — same colors the homepage already uses
// as text directly on white, e.g. Services' eyebrow labels and retainer price).
const CONFIDENCE_BADGE_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  high: { bg: "rgba(1,202,255,0.12)", border: "rgba(1,202,255,0.35)", color: "var(--cyan2)" },
  medium: { bg: "rgba(218,133,11,0.12)", border: "rgba(218,133,11,0.35)", color: "var(--gold)" },
  low: { bg: "rgba(12,15,20,0.04)", border: "rgba(12,15,20,0.14)", color: "var(--muted)" },
};

function ConfidenceBadge({ confidence }: { confidence: Lead["confidence"] }) {
  if (confidence === null || confidence === undefined || confidence === "") return null;
  const key = String(confidence).trim().toLowerCase();
  const style = CONFIDENCE_BADGE_STYLES[key] ?? CONFIDENCE_BADGE_STYLES.low;
  return (
    <span
      className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-medium border uppercase tracking-wide"
      style={{ background: style.bg, borderColor: style.border, color: style.color }}
    >
      {confidence}
    </span>
  );
}

export default function OpsDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10 text-sm text-[var(--muted)]">
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
  const [reachabilityFilter, setReachabilityFilter] = useState<string>(
    () => searchParams.get("reachability") || "all"
  );
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [reachabilitySummary, setReachabilitySummary] = useState<ReachabilitySummary | null>(null);
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
      reachability: string;
    }) => {
      setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams();
        if (filters.status !== "all") qs.set("status", filters.status);
        if (filters.confidence !== "all") qs.set("confidence", filters.confidence);
        if (filters.serviceFit !== "all") qs.set("service_fit", filters.serviceFit);
        if (filters.businessType !== "all") qs.set("business_type", filters.businessType);
        if (filters.reachability !== "all") qs.set("reachability", filters.reachability);
        const query = qs.toString();
        const res = await fetch(`/api/ops/leads${query ? `?${query}` : ""}`);
        if (!res.ok) throw new Error("Failed to load leads");
        const data = await res.json();
        setLeads(data.leads ?? []);
        setTotal(data.total ?? 0);
        if (data.reachabilitySummary) setReachabilitySummary(data.reachabilitySummary);
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
      reachability: reachabilityFilter,
    });

    const qs = new URLSearchParams();
    if (statusFilter !== "all") qs.set("status", statusFilter);
    if (confidenceFilter !== "all") qs.set("confidence", confidenceFilter);
    if (serviceFitFilter !== "all") qs.set("service_fit", serviceFitFilter);
    if (businessTypeFilter !== "all") qs.set("business_type", businessTypeFilter);
    if (reachabilityFilter !== "all") qs.set("reachability", reachabilityFilter);
    const query = qs.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [
    statusFilter,
    confidenceFilter,
    serviceFitFilter,
    businessTypeFilter,
    reachabilityFilter,
    fetchLeads,
    router,
    pathname,
  ]);

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
        linkedin_url: prev[lead.id]?.linkedin_url ?? lead.linkedin_url ?? "",
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
          reachability: reachabilityFilter,
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

  async function logout() {
    await fetch("/api/ops/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  function exportCsv() {
    const qs = new URLSearchParams();
    if (statusFilter !== "all") qs.set("status", statusFilter);
    if (confidenceFilter !== "all") qs.set("confidence", confidenceFilter);
    if (serviceFitFilter !== "all") qs.set("service_fit", serviceFitFilter);
    if (businessTypeFilter !== "all") qs.set("business_type", businessTypeFilter);
    if (reachabilityFilter !== "all") qs.set("reachability", reachabilityFilter);
    const query = qs.toString();

    const link = document.createElement("a");
    link.href = `/api/ops/export-csv${query ? `?${query}` : ""}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const expandedLead = leads.find((l) => l.id === expandedLeadId) ?? null;
  const fieldInputClass =
    "mt-1 w-full rounded-xl bg-black/[0.03] border border-black/[0.12] p-2 text-sm text-[var(--navy)] outline-none focus:border-[var(--navy)]";

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl mb-1">Ops Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">ops.gauravhira.dev · Lead review</p>
        </div>
        <div className="flex items-start gap-3">
          <HunterUsageWidget />
          <button
            type="button"
            onClick={logout}
            className="text-sm text-[var(--navy)] border border-black/20 hover:border-[var(--navy)] rounded-full px-4 py-1.5 h-fit transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-[var(--cream)] pt-2 pb-3 mb-2 border-b border-black/[0.07] flex flex-row flex-nowrap md:flex-wrap items-start gap-x-6 md:gap-x-8 gap-y-2 w-full overflow-x-auto md:overflow-visible">
        <div className="flex-shrink-0">
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)] mb-1.5">Status</p>
          <div className="flex gap-2 flex-nowrap md:flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={pillClass(statusFilter === tab.value) + " whitespace-nowrap"}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0">
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)] mb-1.5">Confidence</p>
          <div className="flex gap-2 flex-nowrap md:flex-wrap">
            {CONFIDENCE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setConfidenceFilter(tab.value)}
                className={pillClass(confidenceFilter === tab.value) + " whitespace-nowrap"}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0">
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)] mb-1.5">Service fit</p>
          <div className="flex gap-2 flex-nowrap md:flex-wrap">
            {SERVICE_FIT_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setServiceFitFilter(tab.value)}
                className={pillClass(serviceFitFilter === tab.value) + " whitespace-nowrap"}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0">
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)] mb-1.5">Business type</p>
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="rounded-xl bg-white border border-black/20 px-3 py-1.5 text-sm text-[var(--navy)] outline-none focus:border-[var(--navy)]"
          >
            <option value="all">All</option>
            {businessTypes.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-shrink-0">
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)] mb-1.5">Reachability</p>
          <div className="flex gap-2 flex-nowrap md:flex-wrap">
            {REACHABILITY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setReachabilityFilter(tab.value)}
                className={pillClass(reachabilityFilter === tab.value) + " whitespace-nowrap"}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {reachabilitySummary && (
        <p className="text-xs text-[var(--muted)] mb-2">
          {reachabilitySummary.withEmail} with email · {reachabilitySummary.withLinkedin} with LinkedIn ·{" "}
          {reachabilitySummary.needResearch} need research
        </p>
      )}

      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <p className="text-xs text-[var(--muted)]">
          Showing {leads.length} of {total} leads
        </p>
        <button
          type="button"
          onClick={exportCsv}
          className="text-sm border border-black/20 text-[var(--navy)] hover:border-[var(--navy)] rounded-full px-4 py-1.5 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-[var(--muted)] text-sm">Loading…</p>}
      {!loading && leads.length === 0 && (
        <p className="text-[var(--muted)] text-sm">No leads in this view.</p>
      )}

      <div className="flex flex-col gap-4">
        {leads.map((lead, index) => (
          <div
            key={lead.id}
            className="bg-white border border-black/[0.07] rounded-2xl p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-start gap-3">
                <span className="text-[var(--muted)] text-sm pt-0.5">#{index + 1}</span>
                <div>
                  <h2 className="font-serif text-lg leading-tight text-[var(--navy)]">{lead.name}</h2>
                  <p className="text-xs text-[var(--muted)]">
                    {lead.category ?? "—"} · {lead.business_type ?? "—"} · {lead.location ?? "—"}
                  </p>
                </div>
              </div>
              <span className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-black/[0.04] border border-black/[0.08] text-[var(--navy)] whitespace-nowrap">
                {lead.status}
              </span>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Business info column */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3 text-sm items-center">
                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--cyan2)] hover:underline"
                    >
                      Website
                    </a>
                  )}
                  {lead.instagram_url && (
                    <a
                      href={lead.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--cyan2)] hover:underline"
                    >
                      Instagram
                    </a>
                  )}
                  {!lead.email && !lead.linkedin_url && (
                    <span className="text-[var(--muted)] italic">No contact info yet</span>
                  )}
                </div>

                {lead.business_summary && (
                  <p className="text-sm text-[var(--navy)]/80">{lead.business_summary}</p>
                )}

                <div className="text-xs text-[var(--muted)] space-y-1.5">
                  {lead.service_fit && <p><span className="text-[var(--muted)]">Service fit:</span> {lead.service_fit}</p>}
                  {lead.confidence !== null && lead.confidence !== undefined && lead.confidence !== "" && (
                    <p className="flex items-center gap-2">
                      <span className="text-[var(--muted)]">Confidence:</span>
                      <ConfidenceBadge confidence={lead.confidence} />
                    </p>
                  )}
                  {lead.observation && <p><span className="text-[var(--muted)]">Observation:</span> {lead.observation}</p>}
                </div>
              </div>

              {/* Email column */}
              <div className="flex flex-col gap-3">
                <p className="text-sm">
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="text-[var(--cyan2)] hover:underline">
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-[var(--muted)] italic">No email on file</span>
                  )}
                </p>

                <label className="text-xs text-[var(--muted)]">
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
                    className={fieldInputClass}
                  />
                </label>

                <label className="text-xs text-[var(--muted)]">
                  <div className="flex items-center justify-between">
                    <span>Email body</span>
                    <div className="flex items-center gap-2">
                      <SaveStatusLabel status={fieldSaveStatus[lead.id]?.email_body} />
                      <button
                        type="button"
                        onClick={() => setExpandedLeadId(lead.id)}
                        className="text-[var(--cyan2)] hover:underline normal-case"
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
                    rows={8}
                    className={fieldInputClass}
                  />
                </label>
              </div>

              {/* LinkedIn column */}
              <div className="flex flex-col gap-3">
                <label className="text-xs text-[var(--muted)]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      LinkedIn URL
                      {lead.linkedin_url && (
                        <a
                          href={lead.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--cyan2)] hover:underline normal-case"
                        >
                          Open ↗
                        </a>
                      )}
                    </span>
                    <SaveStatusLabel status={fieldSaveStatus[lead.id]?.linkedin_url} />
                  </div>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/…"
                    value={editValue(lead, "linkedin_url")}
                    onChange={(e) => {
                      setEditValue(lead, "linkedin_url", e.target.value);
                      scheduleAutosave(lead, "linkedin_url", e.target.value);
                    }}
                    onBlur={() => flushFieldOnBlur(lead, "linkedin_url")}
                    className={fieldInputClass}
                  />
                </label>

                <label className="text-xs text-[var(--muted)]">
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
                    rows={5}
                    className={fieldInputClass}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-4 border-t border-black/[0.07]">
              <button
                disabled={busyId === lead.id}
                onClick={() => patchLead(lead.id, { status: "approved" })}
                className="flex-1 rounded-full bg-[var(--navy)] text-white text-sm font-medium py-2 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={busyId === lead.id}
                onClick={() => patchLead(lead.id, { status: "rejected" })}
                className="flex-1 rounded-full border border-black/20 text-[var(--navy)] hover:border-[var(--navy)] text-sm py-2 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                disabled={EDITABLE_FIELDS.some(
                  (field) => fieldSaveStatus[lead.id]?.[field] === "saving"
                )}
                onClick={() => saveNow(lead)}
                className="flex-1 rounded-full border border-black/20 text-[var(--navy)] hover:border-[var(--navy)] text-sm py-2 disabled:opacity-50"
              >
                Save now
              </button>
            </div>

            {lead.status === "approved" && (
              <div className="flex flex-col gap-2 mt-3">
                <button
                  disabled={sendingId === lead.id}
                  onClick={() => sendLead(lead)}
                  className="rounded-full bg-[var(--navy)] text-white text-sm font-medium py-2 disabled:opacity-50"
                >
                  {sendingId === lead.id ? "Sending…" : "Send"}
                </button>
                {sendResults[lead.id] && (
                  <p
                    className={`text-xs ${
                      sendResults[lead.id].ok ? "text-emerald-600" : "text-red-600"
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
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeExpandedModal();
          }}
        >
          <div className="bg-white border border-black/[0.1] rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-serif text-lg leading-tight text-[var(--navy)]">{expandedLead.name}</h2>
                <p className="text-xs text-[var(--muted)]">
                  {expandedLead.category ?? "—"} · {expandedLead.location ?? "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeExpandedModal}
                className="text-[var(--navy)] text-sm rounded-full border border-black/20 hover:border-[var(--navy)] px-4 py-1.5"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto">
              <label className="text-xs text-[var(--muted)]">
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
                  className={fieldInputClass}
                />
              </label>

              <label className="text-xs text-[var(--muted)] flex flex-col flex-1 min-h-0">
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
                  className={`${fieldInputClass} flex-1 min-h-[40vh] resize-none`}
                />
              </label>

              <label className="text-xs text-[var(--muted)]">
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
                  className={fieldInputClass}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
