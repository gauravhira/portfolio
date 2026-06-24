import { services, calendlyUrl } from "@/lib/data";

export default function Services() {
  return (
    <section id="services" className="bg-white px-[5%] py-[90px]">
      <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-3">
        Services
      </p>
      <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-[--navy] mb-12">
        Systems I can build for your business
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((s) => (
          <div
            key={s.id}
            className="hover-lift bg-white rounded-2xl border border-black/[0.07] p-7 flex flex-col"
          >
            <h3 className="font-serif text-[19px] text-[--navy] tracking-[-0.3px] mb-2">
              {s.name}
            </h3>
            <p className="text-[13px] text-[--muted] leading-[1.6] mb-5">
              {s.outcome}
            </p>

            <ul className="flex flex-col gap-2 mb-6 flex-1">
              {s.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12.5px] text-[--muted] leading-[1.5]">
                  <span
                    className="w-[5px] h-[5px] rounded-full flex-shrink-0 mt-[6px]"
                    style={{ background: "var(--cyan2)" }}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="pt-5 mb-4 border-t border-black/[0.07]">
              <p className="font-serif text-[20px] text-[--navy] mb-1">{s.setup}</p>
              {s.retainer && (
                <p className="text-[11px] font-medium tracking-[0.2px]" style={{ color: "var(--gold)" }}>
                  {s.retainer} retainer
                </p>
              )}
            </div>

            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-[9px] rounded-full bg-[--navy] text-white text-[12px] font-medium transition-all hover:-translate-y-[1px] hover:bg-[#1a2233]"
            >
              Book a call
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
