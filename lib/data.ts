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
    id: "clearcycle",
    name: "ClearCycle",
    badge: "AI Healthcare",
    badgeColor: "cyan",
    icon: "🏥",
    metrics: [
      { val: "71,704", lbl: "ICD-10 codes" },
      { val: "~13×", lbl: "Cost reduction" },
    ],
    description:
      "Multi-agent AI claims-automation platform for Indian hospitals. Event-driven pipeline (5 SQS queues) converts discharge summaries into claim-ready ICD-10/CPT codes. Cost-aware LLM router sends most documents through Llama 3 8B, escalating to Claude only when confidence < 0.82. Hallucination guardrails validate every code against 71,704 WHO ICD-10 + 10,836 CPT entries in Postgres.",
    tech: ["Python", "TypeScript", "Next.js", "PostgreSQL", "Docker", "AWS Lambda", "AWS Bedrock", "SQS", "RDS", "CDK", "n8n", "GitHub Actions"],
    links: [{ label: "clearcycle.in ↗", href: "https://clearcycle.in", primary: true }],
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
  { label: "Frontend / Web", tags: ["Next.js", "Vue.js", "React", "Tailwind CSS"], variant: "default" },
  { label: "Backend & Data", tags: ["Node.js", "Express.js", "PostgreSQL", "MongoDB", "WebSockets", "REST APIs", "Redis", "SQL"], variant: "default" },
  { label: "Cloud & DevOps", tags: ["Docker", "AWS Lambda", "AWS EC2", "AWS Bedrock", "SQS", "RDS", "CDK", "S3", "IAM", "SSM", "Nginx", "PM2", "GitHub Actions", "CI/CD"], variant: "default" },
  { label: "AI & Automation", tags: ["Multi-agent systems", "LLM orchestration", "Model routing", "AWS Bedrock", "Anthropic Claude API", "MCP", "n8n", "Prompt engineering", "LLM output validation", "Claude Code"], variant: "ai" },
  { label: "Other Languages", tags: ["Python", "C# (.NET)", "C (Embedded)", "SQL"], variant: "default" },
];

export const experience = [
  {
    emoji: "🤖",
    active: true,
    role: "Black Loom Labs — Lead Engineer",
    period: "2026 – Present · Bengaluru, India",
    description:
      "Building ClearCycle — a multi-agent AI claims-automation platform for Indian hospitals. Event-driven pipeline (5 SQS queues) with a cost-aware LLM router (Llama 3 8B → Claude), hallucination guardrails against 71,704 ICD-10 and 10,836 CPT codes, and a self-learning policy engine. Deployed on AWS Lambda with 4 CDK stacks and GitHub Actions + SSM OIDC (no long-lived keys).",
  },
  {
    emoji: "🍱",
    active: false,
    role: "GigaFit Meals — Lead Engineer",
    period: "Apr 2025 – Apr 2026 · Bengaluru, India",
    description:
      "Built and ran the full software stack of a D2C healthy-meal subscription platform — 50 subscribers/month, 80–100 meals/day, INR 1L+ monthly revenue, team of 3. Automated the entire daily operations SOP with zero manual touchpoints: Claude API scaled recipes, cron-triggered n8n workflows generated and emailed kitchen reports. Shipped React Native apps for iOS and Android with OTP auth, PayU checkout, and live order tracking.",
  },
  {
    emoji: "⚡",
    active: false,
    role: "ReVx Energy — C# Developer & Firmware Engineer",
    period: "Jan 2024 – Mar 2025 · Bengaluru, India",
    description:
      "Built ReVx BMS Studio — an enterprise .NET desktop app on the Microsoft Store for real-time EV battery monitoring, adopted across every BMS product line. Reduced latency by 99.5% versus the legacy Python app. Cut SD-card transfer times by 85%+ with LZ4 compression over CAN. Also wrote embedded C firmware including parallel-mode data-transfer algorithms.",
  },
];

export const education = [
  { degree: "M.Sc. Computer Science", institution: "St. Joseph's University, Bengaluru", year: "2022 – 2024", cgpa: "CGPA 8.03/10" },
  { degree: "B.Sc. (Hons) Computer Science", institution: "University of Delhi · Minor in Mathematics", year: "2019 – 2022", cgpa: "CGPA 8.01/10" },
];

export const certifications = [
  { name: "Building and Optimizing AI Agent Workflows", issuer: "Coursera", icon: "🤖", href: "https://www.coursera.org/account/accomplishments/verify/2AQ2H2WUAB5Q" },
  { name: "AWS Cloud Foundations", issuer: "Amazon Web Services", icon: "☁️", href: "https://www.credly.com/badges/e25098f1-463f-4b22-81f9-b3847df0333e/linked_in_profile" },
  { name: "Algorithms Part 1", issuer: "Princeton University / Coursera", icon: "📐" },
];
