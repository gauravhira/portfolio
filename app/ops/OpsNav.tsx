"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// hrefs are the user-facing paths on the ops subdomain (proxy.ts rewrites
// these internally to /ops/*) — not the internal /ops/* route paths.
const TABS = [
  { label: "Leads", href: "/dashboard" },
  { label: "Blog Posts", href: "/blog" },
];

export default function OpsNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 mb-6">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              active
                ? "bg-[var(--navy)] text-white border-[var(--navy)] font-medium"
                : "border-black/20 text-[var(--navy)] hover:border-[var(--navy)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
