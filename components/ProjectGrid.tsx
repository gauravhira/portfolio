import { projects } from "@/lib/data";

const badgeStyles: Record<string, { bg: string; border: string; color: string }> = {
  amber: { bg: "rgba(218,133,11,0.1)", border: "rgba(218,133,11,0.25)", color: "#9B5C00" },
  gray:  { bg: "rgba(12,15,20,0.06)",  border: "rgba(12,15,20,0.1)",   color: "#6B7280" },
  cyan:  { bg: "rgba(1,202,255,0.08)", border: "rgba(1,202,255,0.2)",  color: "#0490B8" },
  green: { bg: "rgba(76,175,80,0.08)", border: "rgba(76,175,80,0.2)",  color: "#2E7D32" },
};

export default function ProjectGrid() {
  const nonFeatured = projects.filter((p) => !p.featured);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {nonFeatured.map((p) => {
        const badge = badgeStyles[p.badgeColor ?? "gray"];
        return (
          <div key={p.id} className="hover-lift bg-white rounded-2xl border border-black/[0.07] overflow-hidden flex flex-col">
            {/* Card header */}
            <div className="flex items-start justify-between gap-3 px-7 pt-7 pb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px]"
                style={{ background: badge.bg }}>{p.icon}</div>
              <span className="px-3 py-1 rounded-full text-[11px] font-medium border"
                style={{ background: badge.bg, borderColor: badge.border, color: badge.color }}>
                {p.badge}
              </span>
            </div>

            <div className="px-7 pb-7 flex flex-col flex-1">
              {/* Metrics */}
              {p.metrics && (
                <div className="flex gap-3 mb-4">
                  {p.metrics.map((m) => (
                    <div key={m.lbl} className="flex-1 rounded-xl px-4 py-3" style={{ background: "var(--cream)" }}>
                      <div className="font-serif text-[20px] text-[--navy]">{m.val}</div>
                      <div className="text-[10px] font-medium text-[--muted] uppercase tracking-[0.3px] mt-1">{m.lbl}</div>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="font-serif text-[20px] text-[--navy] tracking-[-0.3px] mb-2">{p.name}</h3>
              <p className="text-[13px] text-[--muted] leading-[1.65] mb-5 flex-1">{p.description}</p>

              {/* Pills */}
              <div className="flex flex-wrap gap-[6px] mb-5">
                {p.tech.map((t) => (
                  <span key={t} className="px-[10px] py-[3px] rounded-lg text-[11px] font-medium border"
                    style={{ background: "rgba(12,15,20,0.04)", borderColor: "rgba(12,15,20,0.08)", color: "var(--navy)" }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {p.links.map((lnk) => (
                  <a key={lnk.label} href={lnk.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-[7px] rounded-full text-[12px] font-medium transition-colors"
                    style={lnk.primary
                      ? { background: "var(--navy)", color: "white" }
                      : { border: "1px solid rgba(12,15,20,0.15)", color: "var(--navy)", background: "transparent" }
                    }>
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
