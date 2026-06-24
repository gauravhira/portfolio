import { calendlyUrl } from "@/lib/data";

export default function Contact() {
  const links = [
    { label: "Book a call", href: calendlyUrl, variant: "primary" },
    { label: "gauravhira24@gmail.com", href: "mailto:gauravhira24@gmail.com", variant: "ghost" },
    { label: "LinkedIn",  href: "https://linkedin.com/in/gauravhira", variant: "ghost" },
    { label: "GitHub",    href: "https://github.com/gauravhira",      variant: "ghost" },
    { label: "+91 91632 36777", href: "tel:+919163236777",            variant: "ghost" },
  ];

  return (
    <section
      id="contact"
      className="px-[5%] py-[80px] text-center"
      style={{ background: "var(--navy)" }}
    >
      <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-3">
        About &amp; contact
      </p>
      <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-white mb-4">
        Let&apos;s work together
      </h2>
      <p className="text-[15px] max-w-[560px] mx-auto mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>
        I&apos;m Gaurav Hira — I design, build, and ship every system myself, end to end.
        Based in Bengaluru, working with businesses across the US and EU. Also open to
        full-stack and mobile engineering roles.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-medium transition-all hover:-translate-y-[2px]"
            style={
              l.variant === "primary"
                ? { background: "var(--cyan2)", color: "white" }
                : { border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }
            }
          >
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
