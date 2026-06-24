import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaurav Hira — AI & Automation Systems for Business",
  description: "I build AI and automation systems that get businesses more leads and fewer manual hours — lead generation, workflow automation, and content pipelines, shipped fast by a solo engineer.",
  openGraph: {
    title: "Gaurav Hira — AI & Automation Systems for Business",
    description: "AI and automation systems that get businesses more leads and fewer manual hours.",
    url: "https://gauravhira.dev",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
