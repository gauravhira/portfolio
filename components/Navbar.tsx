"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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
      <a href="#" className="font-serif text-[20px] text-[--navy] tracking-[-0.3px]">
        Gaurav Hira
      </a>
      <ul className="hidden md:flex gap-7 list-none">
        {["Projects", "Skills", "Experience", "Contact"].map((item) => (
          <li key={item}>
            <a
              href={`#${item.toLowerCase()}`}
              className="text-[13px] font-medium text-[--muted] hover:text-[--navy] transition-colors duration-200"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
      <a
        href="mailto:gauravhira24@gmail.com"
        className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[--navy] text-white text-[13px] font-medium hover:bg-[#1a2233] transition-colors"
      >
        Hire me
      </a>
    </nav>
  );
}
