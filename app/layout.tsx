import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaurav Hira — Full-Stack Engineer",
  description: "Full-Stack Engineer & Founder. Building GigaFit Meals. React Native, Next.js, Node.js, AWS. Based in Bengaluru.",
  openGraph: {
    title: "Gaurav Hira — Full-Stack Engineer",
    description: "Full-Stack Engineer & Founder. Building GigaFit Meals. Based in Bengaluru.",
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
