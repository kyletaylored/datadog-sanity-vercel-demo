# MarTech Pulse

A full-stack marketing platform demo built on **Next.js 16 App Router**, **Sanity CMS**, and **Vercel** — with end-to-end observability wired to **Datadog APM**, **RUM**, and **Logs** via the Vercel log drain.

## What's in the box

- **`/frontend`** — Next.js 16 App Router with Tailwind CSS
- **`/studio`** — Sanity Studio (local dev + `npx sanity deploy`)
- **Signal Lab** (`/lab`) — interactive control panel to trigger real API calls, generate traces, emit structured logs, and produce errors — all visible in Datadog
- **Mock auth** — sign in with any email to set a Gravatar avatar and identify the session in Datadog RUM via `setUser`

## Observability stack

| Signal | How it gets to Datadog |
|--------|----------------------|
| **APM traces** | `@vercel/otel` → Vercel OTLP export → Datadog APM |
| **RUM** | `@datadog/browser-rum` initialized in `datadog-init.tsx` |
| **Logs** | Structured JSON on stdout/stderr → Vercel log drain → Datadog Logs |
| **Sourcemaps** | `@datadog/datadog-ci` postbuild script → Datadog |

RUM is configured with `propagatorTypes: ['tracecontext', 'datadog']` so W3C `traceparent` headers are injected on same-origin fetch requests. This links browser sessions to backend OTel traces. A global `beforeSend` hook promotes any 500+ resource response into a RUM error automatically.

Source code integration is enabled via `git.repository_url` on every OTel span — baked in at build time from `VERCEL_GIT_*` env vars, with a `GIT_REPO_URL` fallback for local dev.

Trace IDs are injected into every API response as `x-trace-id` / `x-span-id` headers, and RUM actions fire on every lab trigger so frontend sessions correlate with backend traces.

## Getting started

### Prerequisites

- Node.js 20+
- A [Sanity](https://sanity.io) project (free tier works)
- A [Datadog](https://datadoghq.com) account with RUM and APM enabled

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp frontend/.env.example frontend/.env.local
```

Required variables:

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=

# Datadog RUM
NEXT_PUBLIC_DD_APPLICATION_ID=
NEXT_PUBLIC_DD_CLIENT_TOKEN=
NEXT_PUBLIC_DD_SITE=datadoghq.com    # or datadoghq.eu, etc.

# Datadog sourcemap upload (production builds only)
DATADOG_API_KEY=
```

Optional for local dev:

```bash
# Send APM traces directly to Datadog when running outside Vercel
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.datadoghq.com
OTEL_EXPORTER_OTLP_HEADERS=dd-api-key=<your-key>,dd-otlp-source=<your-value>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf

# Datadog source code integration (auto-set on Vercel via VERCEL_GIT_* vars)
GIT_REPO_URL=https://github.com/<owner>/<repo>
```

> The `VERCEL_*` environment variables (`VERCEL_ENV`, `VERCEL_PROJECT_NAME`, `VERCEL_REGION`, `VERCEL_GIT_COMMIT_SHA`) are injected automatically by Vercel at build and runtime — no manual configuration needed.

### 3. Run locally

```bash
npm run dev
```

- Next.js app: [http://localhost:3000](http://localhost:3000)
- Sanity Studio: [http://localhost:3333](http://localhost:3333)

### 4. Import sample content (optional)

```bash
cd studio
sanity dataset import ../studio/martech-pulse-sample-data/data.ndjson production --replace
```

See [`studio/martech-pulse-sample-data/IMPORT.md`](studio/martech-pulse-sample-data/IMPORT.md) for full instructions.

## Deploying to Vercel

1. Push this repo to GitHub
2. Create a new Vercel project and connect it to the repo
3. Set **Root Directory** to `frontend`
4. Add all environment variables from step 2 above in Vercel Project Settings → Environment Variables
5. Add a [Vercel log drain](https://vercel.com/docs/observability/log-drains) pointing at your Datadog HTTP endpoint to forward structured logs

The `postbuild` script runs automatically on Vercel production deploys and uploads sourcemaps to Datadog using `@datadog/datadog-ci`. It reads `VERCEL_GIT_REPO_OWNER` and `VERCEL_GIT_REPO_SLUG` to pass `--repository-url` for Datadog's git integration.

## Signal Lab routes

All routes under `/api/lab/` create named OTEL spans and emit structured JSON logs. See [`frontend/docs/LAB.md`](frontend/docs/LAB.md) for the full reference.

| Route | Method | Description |
|-------|--------|-------------|
| `/api/lab/health` | GET | Liveness check |
| `/api/lab/env-info` | GET | Safe Vercel env snapshot |
| `/api/lab/debug-env` | GET | Full env dump (requires `DEBUG_SECRET`) |
| `/api/lab/cms-fetch` | GET | Fetch latest posts from Sanity |
| `/api/lab/slow-query` | GET | Artificial latency (`?delay=ms`) |
| `/api/lab/handled-error` | GET | Throws + catches, returns 500 |
| `/api/lab/unhandled-error` | GET | Throws without catching |
| `/api/lab/chain` | GET | 3-hop chained fetch with trace propagation |
| `/api/lab/lead-capture` | POST | Form validation + structured log |
| `/api/lab/campaign-search` | GET | GROQ full-text search (`?q=`) |
| `/api/lab/proxy` | POST | Server-side outbound fetch with SSRF protection |
| `/api/lab/log-burst` | POST | Emit N structured log lines |
| `/api/lab/custom-attribute` | POST | Set a span attribute |
| `/api/lab/flags` | GET | Fetch feature flags from Sanity |
| `/api/lab/otel-direct` | POST | Send a trace directly to Datadog OTLP intake |
| `/api/lab/otlp-logs` | POST | Send a log directly to Datadog OTLP intake |

## Project structure

```
.
├── frontend/               # Next.js 16 App Router
│   ├── app/
│   │   ├── api/auth/       # Mock auth (login/logout) — sets Gravatar avatar + RUM user
│   │   ├── api/lab/        # 16 Signal Lab API routes
│   │   ├── components/     # Shared UI + lab components
│   │   ├── lab/            # Signal Lab page
│   │   ├── setup/          # Interactive setup guide
│   │   ├── platform/       # Static marketing page
│   │   ├── solutions/      # Static marketing page
│   │   ├── resources/      # Sanity-powered post listing
│   │   └── case-studies/   # Filtered post listing
│   ├── lib/
│   │   ├── brand.ts        # BRAND constants
│   │   ├── config.ts       # Canonical runtime config (service name, env, version, repo URL)
│   │   ├── git.ts          # Local git metadata helpers (sha, branch, remote URL)
│   │   ├── telemetry.ts    # OTel span + log helpers
│   │   └── rum.ts          # Client-side RUM helpers
│   ├── sanity/lib/         # Sanity client, queries, types
│   └── scripts/
│       └── upload-sourcemaps.mjs   # Postbuild sourcemap upload
└── studio/                 # Sanity Studio
    └── src/schemaTypes/    # Post, Page, Person, Settings schemas
```

## Resources

- [Datadog APM docs](https://docs.datadoghq.com/tracing/)
- [Datadog RUM docs](https://docs.datadoghq.com/real_user_monitoring/)
- [Vercel log drains](https://vercel.com/docs/observability/log-drains)
- [Sanity documentation](https://www.sanity.io/docs)
- [Next.js documentation](https://nextjs.org/docs)
