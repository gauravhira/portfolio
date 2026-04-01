# Gaurav Hira — Portfolio

Built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel (one-time setup)

### Option A — GitHub (recommended)

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import that repo.
3. Vercel auto-detects Next.js — click **Deploy**. Done.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

Follow the prompts. Your live URL appears at the end.

## Customising content

All text, projects, stats, skills, and experience live in one file:

```
lib/data.ts
```

Edit it and redeploy — no touching component code needed.

## Project structure

```
app/
  globals.css      # Brand variables, fonts, animations
  layout.tsx       # <html> shell + metadata
  page.tsx         # Assembles all sections
components/
  Navbar.tsx
  Hero.tsx
  StatsStrip.tsx
  FeaturedProject.tsx
  ProjectGrid.tsx
  Skills.tsx
  Experience.tsx
  Contact.tsx
  Footer.tsx
lib/
  data.ts          # ← edit this to update content
```
