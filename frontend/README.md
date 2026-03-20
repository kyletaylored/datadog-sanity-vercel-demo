# MarTech Pulse — Frontend

> Next.js (App Router) + Sanity CMS + Vercel + `@vercel/otel` + Datadog RUM

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| CMS | Sanity (monorepo: `studio/`) |
| Deployment | Vercel |
| Tracing | `@vercel/otel` → Datadog APM |
| RUM | `@datadog/browser-rum` |
| Styling | Tailwind CSS v4 |

## Getting Started

### 1. Clone & install

```bash
git clone <repo-url>
cd datadog-sanity-vercel-demo/frontend
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` — usually `production`
- `SANITY_API_READ_TOKEN` — read token from Sanity project settings
- `NEXT_PUBLIC_DD_APPLICATION_ID` — Datadog RUM application ID
- `NEXT_PUBLIC_DD_CLIENT_TOKEN` — Datadog RUM client token

Vercel automatically injects `VERCEL_PROJECT_NAME`, `VERCEL_ENV`, `VERCEL_REGION`, `VERCEL_GIT_COMMIT_SHA`, and their `NEXT_PUBLIC_` variants.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Run Sanity Studio

From the `studio/` directory:

```bash
cd ../studio
npm run dev
```

Studio runs at [http://localhost:3333](http://localhost:3333).

## Key Directories

```
frontend/
├── app/
│   ├── api/lab/          ← 13 Signal Lab API routes
│   ├── components/lab/   ← Lab UI components
│   ├── lab/              ← /lab page + useLab hook
│   ├── solutions/        ← Solutions marketing page
│   ├── resources/        ← Resources (Sanity-powered)
│   ├── error.tsx         ← Global error boundary
│   └── not-found.tsx     ← 404 page
├── lib/
│   ├── brand.ts          ← Brand constants (name, nav, etc.)
│   ├── telemetry.ts      ← OTel span + structured log helpers
│   └── rum.ts            ← Client-side RUM helpers
└── sanity/lib/
    └── queries.ts        ← All GROQ queries including lab queries
```

## Signal Lab

Visit `/lab` to access the Signal Lab — an interactive panel for generating real traces, logs, and errors that flow into Datadog.

See [`docs/LAB.md`](./docs/LAB.md) for full route documentation.

## Observability Setup

1. **Traces** — `@vercel/otel` instruments every request. All lab routes wrap logic in named spans via `withLabSpan`. Verify in Datadog APM with filter `resource_name:lab.*`.

2. **Logs** — Every lab route emits structured JSON via `structuredLog`. Vercel log drain forwards these to Datadog Logs. Filter: `@event:lab_* @service:martech-pulse`.

3. **RUM** — `@datadog/browser-rum` is initialized in `app/components/datadog-init.tsx`. The `useLab.ts` hook fires `addAction('lab_trigger')` after each API call with the `traceId` for APM correlation.
