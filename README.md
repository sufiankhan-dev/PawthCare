# 🐾 PawthCare

AI-powered pet health — for owners and clinics.

PawthCare pairs a **pet-owner app** for managing your animal's lifelong health record with a **clinic suite** for veterinary teams, both backed by the same shared data.

## Features

**Owners** — AI photo screening, an AI health assistant grounded in your pet's records, a digital pet passport (profile, weight, vaccinations, medications, visits), reminders, and a vet directory with appointment booking.

**Clinics** — Patient EMR, scheduling with AI-flagged cases, and billing.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Drizzle ORM · Neon Postgres · better-auth · Vercel AI SDK (OpenAI) · Bun

## Setup

```bash
bun install
```

Create a `.env` file:

```bash
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
BETTER_AUTH_SECRET=your-secret          # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...                     # optional
GOOGLE_CLIENT_SECRET=...                 # optional
```

Push the schema, seed demo data, then start the dev server:

```bash
bun run db:push
bun run db:seed   # optional
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run start` | Start the production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to the database |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:seed` | Seed demo data |

## Structure

```
app/
  (auth)/        Login & signup
  app/           Pet-owner app
  clinic/        Clinic suite
  api/           Auth + AI routes
components/       UI & feature components
db/              Drizzle schema, client, seed
lib/             Auth, queries, AI config, helpers
```

## AI endpoints

| Route | Purpose |
|---|---|
| `POST /api/ai/analyze` | Photo screening → risk score, findings, recommendations |
| `POST /api/ai/chat` | Streaming pet-care assistant |
| `POST /api/ai/assistant` | Pet-specific assistant grounded in one pet's records |

All routes are authenticated with role-based access. PawthCare's AI is a triage and education aid — not a substitute for a licensed veterinarian.

## Deploy

Deploys to [Vercel](https://vercel.com). Set the same env vars, point `DATABASE_URL` at production, and update `BETTER_AUTH_URL` to your deployed URL.
