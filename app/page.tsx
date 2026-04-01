import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsStrip from "@/components/StatsStrip";
import FeaturedProject from "@/components/FeaturedProject";
import ProjectGrid from "@/components/ProjectGrid";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />

        <section id="projects" className="px-[5%] py-[90px]">
          <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-3">
            Featured project
          </p>
          <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-[--navy] mb-10">
            The one I built<br />from zero to live
          </h2>
          <FeaturedProject />

          <div className="mt-16">
            <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-3">
              All projects
            </p>
            <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-[--navy] mb-10">
              Everything I&apos;ve built
            </h2>
            <ProjectGrid />
          </div>
        </section>

        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
