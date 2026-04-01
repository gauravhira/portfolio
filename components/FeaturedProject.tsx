import Image from "next/image";
import { projects } from "@/lib/data";

export default function FeaturedProject() {
  const p = projects.find((x) => x.featured)!;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden min-h-[500px]" style={{ background: "var(--navy)" }}>
      {/* Left */}
      <div className="flex flex-col justify-between p-10 md:p-14">
        <div>
          {/* Live badge */}
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium tracking-[0.5px] mb-5 border"
            style={{ background: "rgba(1,202,255,0.15)", borderColor: "rgba(1,202,255,0.3)", color: "var(--cyan)" }}>
            <span className="pulse-dot w-[6px] h-[6px] rounded-full" style={{ background: "var(--cyan)" }} />
            Live on Play Store
          </span>

          <h2 className="font-serif text-[38px] text-white leading-[1.1] tracking-[-1px] mb-4">
            {p.name}
          </h2>
          <p className="text-[14px] leading-[1.75]" style={{ color: "rgba(255,255,255,0.6)", maxWidth: 340 }}>
            {p.description}
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-2 my-6">
            {p.features?.map((f) => (
              <div key={f} className="flex items-center gap-2 text-[12px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: "var(--cyan2)" }} />
                {f}
              </div>
            ))}
          </div>

          {/* Tech pills */}
          <div className="flex flex-wrap gap-[6px] mb-8">
            {p.tech.map((t) => (
              <span key={t} className="px-[10px] py-[3px] rounded-full text-[11px] border"
                style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          {p.links.map((lnk) => (
            <a key={lnk.label} href={lnk.href} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-medium transition-all hover:-translate-y-[1px]"
              style={lnk.primary
                ? { background: "var(--cyan2)", color: "white" }
                : { border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }
              }>
              {lnk.primary && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76a2 2 0 0 0 2.14-.22l12.67-7.32-3.19-3.19-11.62 10.73zm-1.12-21.5v19.48l10.87-9.74-10.87-9.74zM20.44 9.3 16.7 7.2l-3.56 3.56 3.56 3.56 3.78-2.14a1.97 1.97 0 0 0 0-2.88zm-17.38-7.06 11.62 10.73 3.19-3.19L5.2.46A2 2 0 0 0 3.06 2.24z"/>
                </svg>
              )}
              {lnk.label}
            </a>
          ))}
        </div>
      </div>

      {/* Right — phone mockup */}
      <div className="hidden md:flex items-center justify-center p-10 relative overflow-hidden"
        style={{ background: "rgba(1,202,255,0.05)" }}>
        {/* Glow */}
        <div className="absolute bottom-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(1,202,255,0.18) 0%, transparent 70%)" }} />

        {/* Phone */}
        <div className="relative z-10 w-[200px] rounded-[28px] overflow-hidden"
          style={{ aspectRatio: "9/19", border: "6px solid rgba(255,255,255,0.12)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", background: "#111" }}>
          <div className="w-full h-full flex flex-col items-center justify-center gap-4"
            style={{ background: "linear-gradient(160deg, #0f1923 0%, #0a1520 100%)" }}>
            {p.appIcon && (
              <div className="w-[64px] h-[64px] rounded-[14px] overflow-hidden" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                <Image src={p.appIcon} alt="GigaFit App Icon" width={64} height={64} className="w-full h-full object-cover" unoptimized />
              </div>
            )}
            <span className="text-white text-[13px] font-medium">GigaFit Meals</span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Food Delivery</span>
            <div className="flex flex-col gap-[5px] w-[70%] mt-2">
              {[100, 75, 55].map((w) => (
                <div key={w} className="h-[5px] rounded-full" style={{ width: `${w}%`, background: `rgba(1,202,255,${w === 100 ? 0.3 : w === 75 ? 0.2 : 0.13})` }} />
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <span className="px-3 py-[4px] rounded-full text-[10px]" style={{ background: "rgba(1,202,255,0.2)", color: "var(--cyan)" }}>Lunch</span>
              <span className="px-3 py-[4px] rounded-full text-[10px]" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>Dinner</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
