import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import FeaturedProject from "@/components/FeaturedProject";
import ProjectGrid from "@/components/ProjectGrid";
import LatestBlogPosts from "@/components/LatestBlogPosts";
import HowIWork from "@/components/HowIWork";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

// Otherwise the "Latest from the Blog" section (and its "0 posts → hidden"
// check) would be frozen at build-time state until the next redeploy.
export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />

        <section id="projects" className="px-[5%] py-[90px]">
          <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-3">
            Proof
          </p>
          <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-[--navy] mb-10">
            Systems I&apos;ve built
          </h2>
          <FeaturedProject />

          <div className="mt-16">
            <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-3">
              More systems
            </p>
            <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-[--navy] mb-10">
              Everything I&apos;ve built
            </h2>
            <ProjectGrid />
          </div>
        </section>

        <LatestBlogPosts />

        <HowIWork />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
