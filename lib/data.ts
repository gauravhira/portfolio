export const calendlyUrl = "https://calendly.com/gauravhira24/30";

export const services = [
  {
    id: "leadgen",
    name: "Lead Generation Pipeline",
    outcome: "A system that finds, enriches, and reaches your ideal customers — automatically.",
    includes: [
      "Targeted prospect scraping & enrichment",
      "Automated personalized outreach (email / LinkedIn)",
      "Meeting booking integration",
      "CRM sync & reply tracking",
    ],
    setup: "from $1,500",
    retainer: "from $500/mo",
  },
  {
    id: "automation",
    name: "Workflow & Task Automation",
    outcome: "Cut the repetitive busywork. Connect your tools and let processes run themselves.",
    includes: [
      "Multi-step n8n / API workflow builds",
      "Tool & data integration across your stack",
      "Automated reporting & internal pipelines",
      "AI-in-the-loop where it adds value",
    ],
    setup: "from $1,000",
    retainer: null,
  },
  {
    id: "social",
    name: "Social Media on Autopilot",
    outcome: "On-brand Instagram content — strategy, visuals, captions, and publishing — fully automated.",
    includes: [
      "Brand voice & content strategy setup",
      "AI-generated visuals & captions",
      "Automated scheduling & publishing",
      "Weekly performance analytics",
    ],
    setup: "from $800",
    retainer: "from $400/mo",
  },
  {
    id: "custom",
    name: "Custom AI / Automation Build",
    outcome: "Something bespoke? If it can be automated or AI-powered, I can build it.",
    includes: [
      "Discovery & scoping call",
      "Custom architecture & build",
      "Deployment & handover",
      "Optional ongoing support",
    ],
    setup: "Let's talk",
    retainer: null,
  },
];

export const projects = [
  {
    id: "gigafit",
    featured: true,
    name: "GigaFit Meals",
    tagline: "Live on Play Store",
    description:
      "Built and operated a complete D2C food-delivery platform solo — mobile apps, backend, cloud infra, and an AI-automated operations pipeline that scaled recipes, generated reports, and ran daily ops with zero manual touchpoints.",
    features: [
      "OTP Authentication",
      "Live order tracking",
      "PayU payment gateway",
      "AI-automated kitchen ops",
      "Meal plan subscriptions",
      "Zero-touchpoint SOP",
    ],
    tech: ["React Native", "Expo", "Next.js", "Node.js", "MongoDB", "AWS EC2", "Anthropic API", "n8n", "GitHub Actions"],
    links: [],
    appIcon: "https://play-lh.googleusercontent.com/seY5Xdph2GsXu3ft-q6xCusssJRHuMo98XQTq3ayaLJQxrmCtY7AcUixmaQZ82sc-PI=w240-h480",
  },
  {
    id: "automation-systems",
    name: "Automation & Workflow Systems",
    badge: "Automation Infrastructure",
    badgeColor: "cyan",
    icon: "⚙️",
    description:
      "Multi-step automation pipelines built on n8n — orchestrating APIs, AI models, databases, and third-party tools into systems that run without manual intervention. The architecture behind lead-gen, content, and ops automation.",
    tech: ["n8n", "Node.js", "REST APIs", "Anthropic API", "Supabase", "Webhooks"],
    links: [],
  },
  {
    id: "autopost",
    name: "AutoPost",
    badge: "Content Automation",
    badgeColor: "green",
    icon: "📸",
    description:
      "A production Instagram content-automation pipeline — a multi-workflow n8n system handling content strategy, AI image generation, caption writing, scheduled publishing via the Instagram Graph API, and a self-improving analytics loop.",
    tech: ["n8n", "Anthropic API", "Flux", "Ideogram", "Instagram Graph API", "Supabase", "AWS EC2"],
    links: [{ label: "getautopost.com ↗", href: "https://getautopost.com", primary: true }],
  },
  {
    id: "escapesaas",
    name: "EscapeSaaS",
    badge: "Web App",
    badgeColor: "gray",
    icon: "🗂️",
    description:
      "A community-governed directory of open-source and self-hostable alternatives to paid SaaS. Community voting, dynamic SEO-optimized tool/category pages, real-time rankings.",
    tech: ["Next.js", "Supabase", "TypeScript", "Vercel"],
    links: [{ label: "escapesaas.com ↗", href: "https://escapesaas.com", primary: true }],
  },
  {
    id: "razorpay-mcp",
    name: "Razorpay MCP Server",
    badge: "Dev Infrastructure",
    badgeColor: "amber",
    icon: "🔌",
    description:
      "A published Model Context Protocol server exposing Razorpay's API as 14 read-only tools for AI agents — payments, orders, subscriptions, refunds, analytics. Published to npm and listed on the official MCP registry.",
    tech: ["TypeScript", "MCP", "Node.js"],
    links: [
      { label: "npm ↗", href: "https://www.npmjs.com/package/@indiamcp/razorpay-mcp", primary: true },
      { label: "GitHub ↗", href: "https://github.com/indiamcp/razorpay-mcp", primary: false },
    ],
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
