const points = [
  {
    title: "Fast",
    description: "AI-accelerated. Ships in days, not months.",
  },
  {
    title: "Direct",
    description: "You talk to the person building it — no account managers, no overhead.",
  },
  {
    title: "Outcome-first",
    description: "Paid to deliver leads and saved hours, not to write code.",
  },
];

export default function HowIWork() {
  return (
    <section className="px-[5%] py-[90px] border-t border-black/[0.07]">
      <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-3">
        How I work
      </p>
      <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-[--navy] mb-12">
        Why work with me directly
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {points.map((p, i) => (
          <div key={p.title}>
            <span className="font-serif text-[40px] leading-none text-[--cyan2]">
              0{i + 1}
            </span>
            <h3 className="font-serif text-[20px] text-[--navy] tracking-[-0.3px] mt-3 mb-2">
              {p.title}
            </h3>
            <p className="text-[13px] text-[--muted] leading-[1.65] max-w-[280px]">
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
