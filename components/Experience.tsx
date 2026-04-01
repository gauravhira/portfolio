import { experience, education } from "@/lib/data";

export default function Experience() {
  return (
    <section id="experience" className="px-[5%] py-[90px]">
      <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-3">
        Experience
      </p>
      <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-[--navy] mb-12">
        Where I&apos;ve worked
      </h2>

      {/* Timeline */}
      <div className="max-w-[680px] mb-14">
        {experience.map((item, i) => (
          <div key={i} className="flex gap-6 pb-9 relative">
            {i < experience.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-black/[0.07]" />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] flex-shrink-0 mt-[2px] border-2 ${
                item.active
                  ? "border-[--cyan2] bg-[rgba(1,202,255,0.08)]"
                  : "border-black/[0.1] bg-white"
              }`}
            >
              {item.emoji}
            </div>
            <div>
              <h3 className="font-serif text-[18px] text-[--navy] mb-1">{item.role}</h3>
              <p className="text-[12px] text-[--muted] mb-2">{item.period}</p>
              <p className="text-[13px] text-[--muted] leading-[1.65]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Education */}
      <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-4">
        Education
      </p>
      <div className="flex flex-wrap gap-4">
        {education.map((e) => (
          <div key={e.degree}
            className="flex-1 min-w-[240px] bg-white rounded-2xl border border-black/[0.07] px-6 py-5">
            <p className="text-[11px] font-medium tracking-[0.5px] text-[--cyan2] mb-2">{e.year}</p>
            <h3 className="font-serif text-[17px] text-[--navy] mb-1">{e.degree}</h3>
            <p className="text-[13px] text-[--muted]">{e.institution} · {e.cgpa}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
