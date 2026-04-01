"use client";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center px-[5%] pt-[100px] pb-[80px] overflow-hidden">
      {/* Background radial glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 80% 40%, rgba(1,202,255,0.12) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 20% 70%, rgba(218,133,11,0.07) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-[760px]">
        {/* Badge */}
        <div className="fade-up delay-100 inline-flex items-center gap-2 px-4 py-[5px] rounded-full border border-[rgba(1,202,255,0.3)] bg-[rgba(1,202,255,0.1)] mb-7">
          <span className="pulse-dot w-[7px] h-[7px] rounded-full bg-[--cyan2]" />
          <span className="text-[12px] font-medium text-[#0490B8] tracking-[0.3px]">
            Available for full-stack &amp; mobile roles
          </span>
        </div>

        {/* Headline */}
        <h1
          className="fade-up delay-200 font-serif text-[clamp(46px,7vw,82px)] leading-[1.0] tracking-[-2px] text-[--navy] mb-6"
        >
          Full-stack
          <br />
          engineer &amp;
          <br />
          <em className="italic text-[--cyan2]">founder</em>
        </h1>

        {/* Sub */}
        <p className="fade-up delay-300 text-[17px] font-light text-[--muted] max-w-[520px] leading-[1.7] mb-9">
          I build end-to-end products — mobile apps, backends, cloud infra, and
          automated pipelines. Based in Bengaluru. Currently running GigaFit Meals.
        </p>

        {/* CTAs */}
        <div className="fade-up delay-400 flex flex-wrap gap-3">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[--navy] text-white text-[13px] font-medium hover:bg-[#1a2233] transition-all duration-200 hover:-translate-y-[1px]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            See my work
          </a>
          <a
            href="mailto:gauravhira24@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black/20 text-[--navy] text-[13px] font-medium hover:border-[--navy] transition-all duration-200 hover:-translate-y-[1px]"
          >
            Get in touch
          </a>
          <a
            href="https://linkedin.com/in/gauravhira"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black/20 text-[--navy] text-[13px] font-medium hover:border-[--navy] transition-all duration-200 hover:-translate-y-[1px]"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/gauravhira"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black/20 text-[--navy] text-[13px] font-medium hover:border-[--navy] transition-all duration-200 hover:-translate-y-[1px]"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
