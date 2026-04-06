# MarTech Pulse

A full-stack marketing platform demo built on **Next.js 16 App Router**, **Sanity CMS**, and **Vercel** — with end-to-end observability wired to **Datadog APM**, **RUM**, and **Logs** via the Vercel log drain.

## What's in the box

- **`/frontend`** — Next.js 16 App Router with Tailwind CSS
- **`/studio`** — Sanity Studio (local dev + `npx sanity deploy`)
- **Signal Lab** (`/lab`) — interactive control panel to trigger real API calls, generate traces, emit structured logs, and produce errors — all visible in Datadog
- **Setup Guide** (`/setup`) — interactive guide covering Vercel trace drain routing, OTel configuration, and sourcemap upload
- **Mock auth** — sign in with any email to set a Gravatar avatar and identify the session in Datadog RUM via `setUser`

## Observability stack

| Signal | How it gets to Datadog |
|--------|----------------------|
| **APM traces** | `@vercel/otel` → Vercel OTLP sidecar → all configured trace drains |
| **RUM** | `@datadog/browser-rum` initialized in `datadog-init.tsx` |
| **Logs** | Structured JSON on stdout/stderr → Vercel log drain → Datadog Logs |
| **Sourcemaps** | `@datadog/datadog-ci` postbuild script → Datadog |
| **Runtime metrics** | `RuntimeNodeInstrumentation` (event loop, GC, heap, CPU) via OTel |

RUM is configured with a global `beforeSend` hook that promotes any 500+ resource response into a RUM error automatically. A local storage version check calls `datadogRum.stopSession()` when the app version changes between deploys, ensuring sessions don't accumulate multiple version tags.

Source code integration is enabled via `git.repository_url` on every OTel span — baked in at build time from `VERCEL_GIT_*` env vars, with a `GIT_REPO_URL` fallback for local dev.

Trace IDs are injected into every API response as `x-trace-id` / `x-span-id` headers, and RUM actions fire on every lab trigger so frontend sessions correlate with backend traces.

### Vercel trace routing

`@vercel/otel` sends spans to a localhost OTLP sidecar. Vercel's platform routes those spans to all configured integrations (Datadog, etc.) without any `OTEL_EXPORTER_OTLP_*` env vars needed. `VERCEL_OTEL_ENDPOINTS` is only injected automatically when the Datadog integration "Traces (beta)" feature is explicitly enabled. See `/setup` for the full routing diagram.

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
# Send APM traces directly to Datadog when running outside Vercel.
# On Vercel, use vercel.integrations.otlp.{site} (no dd-otlp-source needed).
# Locally, dd-otlp-source is still required with the standard otlp.{site} endpoint.
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.datadoghq.com
OTEL_EXPORTER_OTLP_HEADERS=dd-api-key=<your-key>,dd-otlp-source=<your-value>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf

# Datadog source code integration (auto-set on Vercel via VERCEL_GIT_* vars)
GIT_REPO_URL=https://github.com/<owner>/<repo>

# Site URL for OG image metadata (falls back to VERCEL_URL on Vercel)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

> The `VERCEL_*` environment variables (`VERCEL_ENV`, `VERCEL_PROJECT_NAME`, `VERCEL_REGION`, `VERCEL_GIT_COMMIT_SHA`, `VERCEL_BRANCH_URL`, etc.) are injected automatically by Vercel at build and runtime — no manual configuration needed.

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

The `postbuild` script runs automatically on Vercel production deploys and uploads sourcemaps to Datadog using `@datadog/datadog-ci`. It reads `VERCEL_GIT_REPO_OWNER` and `VERCEL_GIT_REPO_SLUG` to pass `--repository-url` and `--project-path` for Datadog's git/source-code integration. Turbopack builds (Next.js 16 default) embed source paths as `turbopack:///[project]/<repo-slug>/...`; `--project-path` strips this prefix so Datadog can link errors to GitHub.

To test the upload locally without actually uploading:

```bash
npm run sourcemaps:dry-run
```

## Signal Lab routes

All routes under `/api/lab/` create named OTel spans and emit structured JSON logs.

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
| `/api/lab/runtime-metrics` | GET | V8 heap, GC pause, and event loop delay snapshot |
| `/api/lab/lambda-context` | GET | AWS Lambda invocation context (ARN, X-Ray trace ID, deadline) |
| `/api/lab/error/type-error` | GET | Handled TypeError (null dereference) |
| `/api/lab/error/syntax-error` | GET | Handled SyntaxError (bad JSON.parse) |
| `/api/lab/error/custom-error` | GET | Handled custom `DatabaseConnectionError` with span attributes |
| `/api/lab/error/range-error` | GET | Handled RangeError (stack overflow via infinite recursion) |
| `/api/lab/error/async-error` | GET | Handled async rejection with `Error(..., {cause})` chain |
| `/api/lab/error/unhandled-type-error` | GET | Unhandled TypeError |
| `/api/lab/error/unhandled-custom-error` | GET | Unhandled `UpstreamServiceError` with upstream span attributes |

## Project structure

```
.
├── frontend/               # Next.js 16 App Router
│   ├── app/
│   │   ├── api/auth/       # Mock auth (login/logout) — sets Gravatar avatar + RUM user
│   │   ├── api/lab/        # Signal Lab API routes (see table above)
│   │   ├── components/     # Shared UI + lab components
│   │   ├── lab/            # Signal Lab page
│   │   ├── setup/          # Interactive setup guide with trace routing diagram
│   │   ├── platform/       # Static marketing page
│   │   ├── solutions/      # Static marketing page
│   │   ├── resources/      # Sanity-powered post listing
│   │   └── case-studies/   # Filtered post listing
│   ├── lib/
│   │   ├── brand.ts        # BRAND constants
│   │   ├── config.ts       # Canonical runtime config (service name, env, version, host, repo URL)
│   │   ├── git.ts          # Local git metadata helpers (sha, branch, remote URL)
│   │   ├── metrics.ts      # OTel metric readers + views
│   │   ├── telemetry.ts    # OTel span + log helpers
│   │   └── rum.ts          # Client-side RUM helpers
│   ├── sanity/lib/         # Sanity client, queries, types
│   └── scripts/
│       └── upload-sourcemaps.mjs   # Postbuild sourcemap upload (supports --dry-run)
└── studio/                 # Sanity Studio
    └── src/schemaTypes/    # Post, Page, Person, Settings schemas
```

## Resources

- [Datadog APM docs](https://docs.datadoghq.com/tracing/)
- [Datadog RUM docs](https://docs.datadoghq.com/real_user_monitoring/)
- [Vercel log drains](https://vercel.com/docs/observability/log-drains)
- [Sanity documentation](https://www.sanity.io/docs)
- [Next.js documentation](https://nextjs.org/docs)
