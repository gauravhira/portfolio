import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-[100px] min-h-screen bg-[var(--cream)]">{children}</main>
      <Footer />
    </>
  );
}
