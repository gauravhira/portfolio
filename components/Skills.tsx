import { skills } from "@/lib/data";

export default function Skills() {
  return (
    <section id="skills" className="bg-white px-[5%] py-[90px]">
      <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-3">
        Technical skills
      </p>
      <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-[--navy] mb-12">
        What I work with
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((group) => (
          <div key={group.label} className="rounded-2xl p-6 border border-black/[0.07]"
            style={{ background: "var(--cream)" }}>
            <p className="text-[11px] font-medium tracking-[1px] uppercase text-[--cyan2] mb-4">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag) => (
                <span key={tag}
                  className="px-3 py-[5px] rounded-lg text-[12px] font-medium border"
                  style={
                    group.variant === "ai"
                      ? { background: "rgba(1,202,255,0.08)", borderColor: "rgba(1,202,255,0.2)", color: "#0490B8" }
                      : { background: "white", borderColor: "rgba(12,15,20,0.08)", color: "var(--navy)" }
                  }>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
