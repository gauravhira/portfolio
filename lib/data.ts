export const stats = [
  { num: "3+",    label: "Years shipping production code" },
  { num: "40–50", label: "Meals delivered daily" },
  { num: "20+",   label: "Active subscribers" },
  { num: "99.5%", label: "Latency reduction at ReVx" },
  { num: "0",     label: "Manual touchpoints in ops pipeline" },
];

export const projects = [
  {
    id: "gigafit",
    featured: true,
    name: "GigaFit Meals",
    tagline: "Live on Play Store",
    description:
      "D2C healthy meal subscription & delivery platform for busy professionals in Bengaluru. Built the full stack — mobile apps, backend, kitchen automation, and cloud infra — solo and with a team of ≤3.",
    features: [
      "OTP Authentication",
      "Live order tracking",
      "PayU payment gateway",
      "AI kitchen pipeline",
      "Meal plan subscriptions",
      "Zero-touchpoint SOP",
    ],
    tech: ["React Native", "Expo", "Next.js", "Node.js", "MongoDB", "AWS EC2", "Anthropic API", "GitHub Actions", "PayU", "Postmark"],
    links: [
      { label: "Play Store", href: "https://play.google.com/store/apps/details?id=com.GigaFitMealsApp", primary: true },
      { label: "gigafitmeals.com ↗", href: "https://gigafitmeals.com", primary: false },
    ],
    appIcon: "https://play-lh.googleusercontent.com/seY5Xdph2GsXu3ft-q6xCusssJRHuMo98XQTq3ayaLJQxrmCtY7AcUixmaQZ82sc-PI=w240-h480",
  },
  {
    id: "revx-studio",
    name: "ReVx BMS Studio",
    badge: "Windows Desktop",
    badgeColor: "amber",
    icon: "⚡",
    metrics: [
      { val: "99.5%", lbl: "Latency reduced" },
      { val: "85%",   lbl: "Faster transfer" },
    ],
    description:
      "Enterprise desktop application for real-time monitoring, configuration, and data download from Battery Management Systems. Adopted across all BMS product lines at ReVx Energy. Features LZ4-compressed data transfer over CAN, batch firmware upgrades, and custom packet protocols.",
    tech: ["C# .NET", "MAUI", "ASP.NET", "CAN Bus", "LZ4", "PCAN"],
    links: [{ label: "Microsoft Store ↗", href: "https://apps.microsoft.com/search?query=ReVx+BMS+Studio", primary: true }],
  },
  {
    id: "gigafit-dashboard",
    name: "GigaFit Outlet Dashboard",
    badge: "Web App",
    badgeColor: "gray",
    icon: "📊",
    metrics: [
      { val: "0",     lbl: "Manual steps in SOP" },
      { val: "Daily", lbl: "Auto reports" },
    ],
    description:
      "Outlet-level operations dashboard for GigaFit kitchen managers. Real-time order tracking, inventory management, and delivery partner monitoring with role-based authentication. Integrated with an AI-powered kitchen report pipeline that auto-scales recipes each morning and emails a PDF — zero manual intervention.",
    tech: ["Next.js", "Node.js", "MongoDB", "Anthropic API", "Postmark", "WebSockets"],
    links: [{ label: "gigafitmeals.com ↗", href: "https://gigafitmeals.com", primary: true }],
  },
  {
    id: "mailsync",
    name: "MailSync — AI Email Client",
    badge: "AI Prototype",
    badgeColor: "cyan",
    icon: "✉",
    description:
      "Single-file AI-powered email client where an Anthropic Claude-backed assistant drives the entire UI programmatically via natural language. Fills forms, navigates views, executes actions, and responds with animated effects — all without the user touching any controls. A demonstration of agentic UI control.",
    tech: ["Anthropic API", "JavaScript", "HTML/CSS", "Agentic AI"],
    links: [{ label: "GitHub ↗", href: "https://github.com/gauravhira", primary: false }],
  },
  {
    id: "revx-firmware",
    name: "ReVx BMS Firmware",
    badge: "Embedded / Firmware",
    badgeColor: "green",
    icon: "🔋",
    description:
      "Embedded C firmware for Battery Management Systems — client-specific builds with custom data transfer algorithms for parallel-mode BMS configurations. Implemented LZ4 compression at the firmware level for 85% faster SD card data transfer over CAN interface. Also began FOTA integration for remote update capability.",
    tech: ["C (Embedded)", "LZ4", "CAN Bus", "FOTA", "RTOS"],
    links: [{ label: "ReVx Energy ↗", href: "https://revxenergy.com", primary: false }],
  },
];

export const skills = [
  { label: "Mobile", tags: ["React Native", "Expo", "TypeScript", "Expo Router", "OTA Updates", "iOS + Android"], variant: "default" },
  { label: "Frontend / Web", tags: ["Next.js", "Vite.js", "Vue.js", "React", "Tailwind CSS"], variant: "default" },
  { label: "Backend", tags: ["Node.js", "Express.js", "MongoDB", "WebSockets", "REST APIs", "Redis"], variant: "default" },
  { label: "Cloud & DevOps", tags: ["AWS EC2", "Nginx", "PM2", "GitHub Actions", "CI/CD"], variant: "default" },
  { label: "AI & Automation", tags: ["Anthropic Claude API", "Claude Code", "GitHub Copilot", "Agentic workflows", "Prompt engineering"], variant: "ai" },
  { label: "Other Languages", tags: ["C# (.NET)", "C (Embedded)", "Python", "C++", "PyTorch"], variant: "default" },
];

export const experience = [
  {
    emoji: "🍱",
    active: true,
    role: "GigaFit Meals — Founder & Tech Lead",
    period: "2024 – Present · Bengaluru, India",
    description:
      "Built the full software stack of a live D2C food-delivery brand — mobile apps, web dashboards, Node.js backend, AWS infrastructure, and a fully automated kitchen operations pipeline. Currently delivering 40–50 meals/day to 20+ subscribers with zero manual touchpoints in the SOP.",
  },
  {
    emoji: "⚡",
    active: false,
    role: "ReVx Energy — C# Developer & Firmware Engineer",
    period: "Jan 2024 – Mar 2025 · Bengaluru, India",
    description:
      "Built enterprise desktop software (ReVx BMS Studio) in C# for real-time EV battery monitoring. Reduced latency by 99.5% and transfer times by 85%. Also wrote embedded C firmware for BMS client builds including parallel-mode configurations and FOTA integration.",
  },
];

export const education = [
  { degree: "M.Sc. Computer Science", institution: "St. Joseph's University, Bengaluru", year: "2022 – 2024", cgpa: "CGPA 8.025" },
  { degree: "B.Sc. (Hons) Computer Science", institution: "Delhi University · Minor in Mathematics", year: "2019 – 2022", cgpa: "CGPA 8.014" },
];
