"use client";
import { useState, useEffect } from "react";
import { calendlyUrl } from "@/lib/data";

// "/#x" (not bare "#x") so these still resolve correctly from routes other
// than the homepage, like /blog — a plain "#x" would just no-op there.
const navItems = [
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Experience", href: "/#experience" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] h-[62px] transition-all duration-300 ${
        scrolled
          ? "bg-[#F7F5F0]/90 backdrop-blur-md border-b border-black/[0.07] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <a href="/" className="font-serif text-[20px] text-[--navy] tracking-[-0.3px]">
        Gaurav Hira
      </a>
      <ul className="hidden md:flex gap-7 list-none">
        {navItems.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              className="text-[13px] font-medium text-[--muted] hover:text-[--navy] transition-colors duration-200"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <a
        href={calendlyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[--navy] text-white text-[13px] font-medium hover:bg-[#1a2233] transition-colors"
      >
        Book a call
      </a>
    </nav>
  );
}
