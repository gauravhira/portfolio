import { stats } from "@/lib/data";

export default function StatsStrip() {
  return (
    <div className="flex flex-wrap border-t border-b border-black/[0.07] bg-white">
      {stats.map((s, i) => (
        <div
          key={i}
          className={`flex-1 min-w-[150px] px-6 py-7 ${
            i < stats.length - 1 ? "border-r border-black/[0.07]" : ""
          }`}
        >
          <div className="font-serif text-[32px] text-[--navy] leading-none mb-1">
            {s.num.includes("+") || s.num.includes("%") || s.num.includes("–") ? (
              <>
                {s.num.replace(/[+%]$/, "")}
                <span className="text-[--cyan2]">
                  {s.num.match(/[+%]$/)?.[0] ?? ""}
                </span>
              </>
            ) : (
              <span>{s.num}</span>
            )}
          </div>
          <div className="text-[11px] font-medium text-[--muted] tracking-[0.3px] uppercase">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
