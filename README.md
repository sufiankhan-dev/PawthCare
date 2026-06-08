# 🐾 PawthCare

**AI-powered pet health, from the palm of your hand to the clinic.**

PawthCare is a digital pet-health platform with two connected experiences: a **pet-owner app** for managing your animal's lifelong health record with AI assistance, and a **clinic suite** that gives veterinary teams an EMR, scheduling, and billing — all backed by the same shared data.

---

## ✨ Features

### For pet owners (`/app`)
- **AI photo screening** — Upload a photo and get an instant, structured health read: a risk score (0–100), urgency level, specific findings, and recommended next steps.
- **AI health assistant** — Chat about symptoms and care, grounded in your pet's real records, vaccinations, and history.
- **Digital pet passport** — One lifelong record per pet: profile, weight history, vaccinations, medications, visits, and AI analyses.
- **Reminders** — Track vaccination due dates and medication schedules.
- **Vet directory & appointments** — Browse partner vets and book visits, optionally sharing an AI screening with the clinic.

### For clinics (`/clinic`)
- **Patient EMR** — Records, diagnoses, and history per patient.
- **Scheduling** — Manage appointments with AI-flagged cases surfaced.
- **Billing** — Generate and track invoices.

---

## 🧱 Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com) + Radix UI, `motion` |
| Database | [Neon](https://neon.tech) Postgres |
| ORM | [Drizzle ORM](https://orm.drizzle.team) + Drizzle Kit |
| Auth | [better-auth](https://www.better-auth.com) (email/password + Google OAuth) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai) with OpenAI (`gpt-4o` vision, `gpt-4o-mini` chat) |
| Runtime | [Bun](https://bun.sh) |

---

## 🚀 Getting started

### Prerequisites
- [Bun](https://bun.sh) installed
- A [Neon](https://neon.tech) (or any Postgres) database
- An [OpenAI API key](https://platform.openai.com)
- (Optional) Google OAuth credentials for social login

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

Create a `.env` file in the project root:

```bash
# Postgres connection string (Neon, pg-compatible URL)
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# better-auth — generate a secret with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-generated-secret
BETTER_AUTH_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-...

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

> ⚠️ **Never commit real secrets.** Keep `.env` out of version control.

### 3. Set up the database

```bash
bun run db:push   # push the Drizzle schema to your database
bun run db:seed   # (optional) seed demo data
```

### 4. Run the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📜 Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the development server |
| `bun run build` | Production build |
| `bun run start` | Start the production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push the schema to the database |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:seed` | Seed the database with demo data |

---

## 📁 Project structure

```
my-app/
├── app/
│   ├── (auth)/            # Login & signup
│   ├── app/               # Pet-owner app (pets, appointments, vets, AI assistant)
│   ├── clinic/            # Clinic suite (patients, appointments, billing)
│   └── api/
│       ├── auth/[...all]/  # better-auth handler
│       └── ai/             # analyze (photo), chat, assistant routes
├── components/            # UI + feature components (shadcn/ui based)
├── db/
│   ├── schema.ts          # Drizzle schema (pets, records, AI analyses, etc.)
│   ├── index.ts           # DB client
│   └── seed.ts            # Demo seed data
├── lib/                   # auth, queries, AI config, helpers
└── drizzle.config.ts
```

---

## 🤖 AI endpoints

| Route | Purpose |
|---|---|
| `POST /api/ai/analyze` | Vision-based photo screening → structured risk score, findings, recommendations |
| `POST /api/ai/chat` | Streaming pet-care chat assistant, grounded in the user's pets |
| `POST /api/ai/assistant` | Pet-specific assistant grounded in a single pet's records |

All AI routes are authenticated and enforce role-based access (owners can access their own pets; clinicians can access patients).

> PawthCare's AI is a triage and education aid — **not** a substitute for a licensed veterinarian.

---

## 🚢 Deployment

The app deploys cleanly to [Vercel](https://vercel.com). Set the same environment variables in your project settings and point `DATABASE_URL` at your production database. Update `BETTER_AUTH_URL` to your deployed URL.
