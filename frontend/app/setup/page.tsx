import Link from 'next/link'
import DocSidebar, { DocSidebarItem } from '@/app/components/DocSidebar'
import {
  DocH2,
  DocH3,
  DocH4,
  DocCode,
  DocPre,
  DocNote,
  DocEnvTable,
  DocStep,
} from '@/app/components/DocComponents'
import MermaidDiagram from '@/app/components/MermaidDiagram'
import Collapsible from '@/app/components/Collapsible'

const SIGNAL_FLOW_DIAGRAM = `
flowchart LR
  subgraph browser["Browser"]
    RUM["RUM + Browser Logs SDK"]
  end

  subgraph vercel["Vercel — Serverless Functions"]
    App["Next.js App"]
    OTel["@vercel/otel\\nOTel spans"]
    CLogs["console.log()\\nJSON logs"]
    Sidecar["OTel Sidecar\\nlocalhost:4318\\n(Path A only)"]
  end

  subgraph dd["Datadog"]
    DD_RUM["RUM /\\nSession Replay"]
    DD_APM["APM /\\nTraces"]
    DD_Logs["Log\\nManagement"]
  end

  RUM -->|"HTTPS direct"| DD_RUM
  App --> OTel & CLogs
  OTel -->|"Path A"| Sidecar --> DD_APM
  OTel -->|"Path B · C\\ndirect OTLP"| DD_APM
  CLogs -->|"Path A · B\\nlog drain"| DD_Logs
  RUM -.->|"traceparent header\\nlinks session to trace"| DD_APM
`

// Aliases so the JSX in this file stays readable
const H2 = DocH2
const H3 = DocH3
const H4 = DocH4
const Code = DocCode
const Pre = DocPre
const Note = DocNote
const EnvTable = DocEnvTable
const Step = DocStep

// ─── Sidebar sections ────────────────────────────────────────────────────────

const SECTIONS: DocSidebarItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'prerequisites', label: 'Prerequisites' },
  {
    id: 'paths',
    label: 'Choose Your Path',
    children: [
      { id: 'path-integration', label: 'A · Datadog Integration' },
      { id: 'path-drain', label: 'B · Manual Drain' },
      { id: 'path-direct', label: 'C · Direct OTLP' },
    ],
  },
  { id: 'rum', label: 'RUM' },
  { id: 'apm', label: 'APM / Traces' },
  { id: 'logs', label: 'Logs' },
  { id: 'sourcemaps', label: 'Source Maps' },
  { id: 'env-vars', label: 'Env Variables' },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Setup Guide — Next.js + Vercel + Datadog',
  description:
    'Step-by-step guide for wiring APM, RUM, and Logs into Datadog from a Next.js app on Vercel.',
}

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <p className="mb-8 text-sm font-mono text-gray-400">
          <Link href="/" className="hover:underline">
            Home
          </Link>{' '}
          /{' '}
          <span className="text-gray-600">Setup Guide</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 items-start">
          {/* Sidebar */}
          <aside className="hidden lg:block self-start sticky top-28">
            <DocSidebar sections={SECTIONS} />
          </aside>

          {/* Content */}
          <main className="min-w-0 max-w-2xl">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">
              Next.js + Vercel + Datadog
            </h1>
            <p className="text-gray-500 mb-12">
              Full observability in one afternoon. Pick the path that matches your Vercel plan, drop
              in the snippets, deploy.
            </p>

            {/* ── Overview ──────────────────────────────────────────── */}
            <H2 id="overview">Overview</H2>
            <p className="text-sm text-gray-600 mb-5">
              Three signals. One service map. Same <Code>instrumentation.ts</Code> regardless of
              which delivery path you choose — the path only changes which env vars you set and
              whether you configure a Vercel drain.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
              {[
                {
                  signal: 'APM',
                  desc: 'Distributed traces — server spans, edge spans, error tracking',
                },
                {
                  signal: 'RUM',
                  desc: 'Browser sessions, performance vitals, session replay',
                },
                {
                  signal: 'Logs',
                  desc: 'Structured JSON server logs correlated to traces',
                },
              ].map(({ signal, desc }) => (
                <div
                  key={signal}
                  className="rounded-lg border border-gray-200 p-4 bg-gray-50"
                >
                  <p className="font-semibold text-sm mb-1">{signal}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Also covered: source maps (browser + server) and Error Tracking span attributes.
            </p>
            <Collapsible summary="Signal flow diagram" defaultOpen={true}>
              <MermaidDiagram
                chart={SIGNAL_FLOW_DIAGRAM}
                caption="How APM, RUM, and Logs reach Datadog across the three delivery paths"
              />
            </Collapsible>

            {/* ── Prerequisites ─────────────────────────────────────── */}
            <H2 id="prerequisites">Prerequisites</H2>
            <ul className="text-sm space-y-2.5 text-gray-700">
              {[
                'Datadog account with APM, RUM, and Logs enabled',
                'Next.js 14+ app deployed to Vercel',
                'Node.js 18+',
              ].map((item) => (
                <li key={item} className="flex gap-2.5 items-start">
                  <span className="text-gray-300 mt-px">—</span>
                  {item}
                </li>
              ))}
              <li className="flex gap-2.5 items-start">
                <span className="text-gray-300 mt-px">—</span>
                <span>
                  <strong>Vercel Pro or Enterprise</strong> if using Path A or B — log drains
                  require a paid plan
                </span>
              </li>
            </ul>

            {/* ── Choose Your Path ──────────────────────────────────── */}
            <H2 id="paths">Choose Your Path</H2>
            <p className="text-sm text-gray-600 mb-6">
              All three paths use identical application code. They differ only in how traces and
              logs reach Datadog.
            </p>

            {/* Path comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                {
                  anchor: 'path-integration',
                  letter: 'A',
                  title: 'Datadog Integration',
                  badge: 'Simplest',
                  badgeColor: 'bg-green-100 text-green-800',
                  plan: 'Vercel Pro / Enterprise',
                  pros: [
                    'One-click marketplace install',
                    'Trace pipe auto-configured',
                    'Log drain included',
                    'Edge + serverless parent spans',
                  ],
                  cons: ['Vercel egress fees on trace data'],
                },
                {
                  anchor: 'path-drain',
                  letter: 'B',
                  title: 'Manual Drain',
                  badge: 'More control',
                  badgeColor: 'bg-blue-100 text-blue-800',
                  plan: 'Vercel Pro / Enterprise',
                  pros: [
                    'Custom drain headers',
                    'Tag drain source with dd-otlp-source',
                    'Use your own log receiver',
                  ],
                  cons: ['Manual drain setup', 'Vercel egress fees on trace data'],
                },
                {
                  anchor: 'path-direct',
                  letter: 'C',
                  title: 'Direct OTLP',
                  badge: 'Any plan',
                  badgeColor: 'bg-purple-100 text-purple-800',
                  plan: 'Hobby / Pro / Enterprise',
                  pros: [
                    'Works on Hobby plan',
                    'No Vercel egress fees',
                    'Env-var-only config',
                  ],
                  cons: ['No auto log drain', 'Log forwarding is manual'],
                },
              ].map(({ anchor, letter, title, badge, badgeColor, plan, pros, cons }) => (
                <div
                  key={anchor}
                  className="rounded-xl border border-gray-200 p-5 flex flex-col hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {letter}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}
                    >
                      {badge}
                    </span>
                  </div>
                  <p className="font-semibold text-sm mb-0.5">{title}</p>
                  <p className="text-xs text-gray-400 mb-4">{plan}</p>
                  <ul className="text-xs space-y-1.5 flex-1">
                    {pros.map((p) => (
                      <li key={p} className="flex gap-1.5 text-gray-600">
                        <span className="text-green-500 shrink-0">✓</span>
                        {p}
                      </li>
                    ))}
                    {cons.map((c) => (
                      <li key={c} className="flex gap-1.5 text-gray-400">
                        <span className="shrink-0">✗</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`#${anchor}`}
                    className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    See setup →
                  </a>
                </div>
              ))}
            </div>

            {/* ── Path A ────────────────────────────────────────────── */}
            <H3 id="path-integration">Path A — Datadog Integration (Marketplace)</H3>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 mb-4">
              <Step n={1}>
                Install the{' '}
                <a
                  href="https://vercel.com/marketplace/datadog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-black"
                >
                  Datadog integration
                </a>{' '}
                from the Vercel Marketplace. Follow the OAuth flow to connect your Datadog account.
                This auto-injects <Code>VERCEL_OTEL_ENDPOINTS</Code> at runtime, spins up a local
                OTel sidecar at <Code>localhost:4318</Code>, and creates a log drain.
              </Step>
              <Step n={2}>
                Install packages and create <Code>instrumentation.ts</Code> — see the{' '}
                <a href="#apm" className="underline hover:text-black">
                  APM section
                </a>
                .
              </Step>
              <Step n={3}>
                Add RUM — see the{' '}
                <a href="#rum" className="underline hover:text-black">
                  RUM section
                </a>
                .
              </Step>
              <Step n={4}>
                Deploy. Traces flow automatically via the sidecar. Logs flow via the drain.
              </Step>
            </div>
            <Note>
              The sidecar at <Code>localhost:4318</Code> only forwards <Code>/v1/traces</Code>.
              Sending logs via OTLP to the sidecar returns 503 — logs reach Datadog exclusively
              via the console → drain path.
            </Note>
            <Note variant="warning">
              <Code>VERCEL_OTEL_ENDPOINTS</Code> is injected by the integration and contains a
              Datadog API key embedded in JSON. Do not log <Code>process.env</Code> in full —
              key-name redaction won&apos;t catch values nested inside other variables.
            </Note>

            {/* ── Path B ────────────────────────────────────────────── */}
            <H3 id="path-drain">Path B — Manual Vercel Drain</H3>
            <p className="text-sm text-gray-600 mb-4">
              Use when you want explicit control over drain headers — for example, to set a custom{' '}
              <Code>dd-otlp-source</Code> value so you can distinguish this drain from the
              integration drain in Datadog.
            </p>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 mb-4">
              <Step n={1}>
                In Vercel Dashboard → Project → <strong>Settings → Log Drains → Add Drain</strong>.
                Set type to <strong>OTLP</strong>, endpoint to{' '}
                <Code>https://otlp.datadoghq.com/v1/traces</Code> (adjust for your{' '}
                <Code>DD_SITE</Code>).
              </Step>
              <Step n={2}>
                Add headers: <Code>dd-api-key: &lt;your-key&gt;</Code> and{' '}
                <Code>dd-otlp-source: &lt;your-value&gt;</Code> (required). The value is provided by your
                Datadog account team and also surfaces as <Code>otel.source</Code> on ingested spans.
              </Step>
              <Step n={3}>
                Set env vars so <Code>@vercel/otel</Code> sends directly to Datadog instead of a
                sidecar:
                <Pre lang="bash">{`OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.datadoghq.com
OTEL_EXPORTER_OTLP_HEADERS=dd-api-key=<your-dd-api-key>,dd-otlp-source=<your-value>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`}</Pre>
              </Step>
              <Step n={4}>
                Install packages and create <Code>instrumentation.ts</Code> — see the{' '}
                <a href="#apm" className="underline hover:text-black">
                  APM section
                </a>
                . Add RUM — see the{' '}
                <a href="#rum" className="underline hover:text-black">
                  RUM section
                </a>
                .
              </Step>
            </div>

            {/* ── Path C ────────────────────────────────────────────── */}
            <H3 id="path-direct">Path C — Direct OTLP</H3>
            <p className="text-sm text-gray-600 mb-4">
              No drain, no sidecar. Your serverless functions send traces directly to
              Datadog&apos;s OTLP intake. Works on Hobby plan.
            </p>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 mb-4">
              <Step n={1}>
                Set env vars — <Code>@vercel/otel</Code> reads these automatically:
                <Pre lang="bash">{`OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.datadoghq.com
OTEL_EXPORTER_OTLP_HEADERS=dd-api-key=<your-dd-api-key>,dd-otlp-source=<your-value>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`}</Pre>
                <strong>Note:</strong> <Code>dd-otlp-source</Code> is required — without it, spans can be silently dropped. The value is provided by
                your Datadog account team. Adjust the hostname for your Datadog site (e.g.{' '}
                <Code>otlp.us3.datadoghq.com</Code> for US3).
              </Step>
              <Step n={2}>
                Install packages and create <Code>instrumentation.ts</Code> — see the{' '}
                <a href="#apm" className="underline hover:text-black">
                  APM section
                </a>
                . The same file works for all three paths.
              </Step>
              <Step n={3}>Add RUM — see the <a href="#rum" className="underline hover:text-black">RUM section</a>.</Step>
            </div>
            <Note variant="info">
              <strong>Logs on Path C:</strong> Vercel is a managed platform — direct AWS access
              isn&apos;t available, so the Datadog Forwarder is not an option. Use one of the two
              approaches below.
            </Note>
            <H4>Option 1 — OTLP logs</H4>
            <p className="text-sm text-gray-600 mb-3">
              Datadog provides a <a
                href="https://docs.datadoghq.com/opentelemetry/setup/otlp_ingest/logs/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                dedicated OTLP logs
              </a> intake endpoint. Configure it with
              logs-specific env vars (separate from the traces endpoint):
            </p>
            <Pre lang="bash">{`OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=https://otlp.datadoghq.com/v1/logs
OTEL_EXPORTER_OTLP_LOGS_HEADERS=dd-api-key=<your-dd-api-key>,dd-otlp-source=<your-value>
OTEL_EXPORTER_OTLP_LOGS_PROTOCOL=http/protobuf`}</Pre>
            <p className="text-sm text-gray-600 mb-3">
              Then emit logs via <Code>@opentelemetry/api-logs</Code>:
            </p>
            <Pre lang="typescript">{`import { logs, SeverityNumber } from '@opentelemetry/api-logs'

logs.getLogger('my-service').emit({
  severityNumber: SeverityNumber.INFO,
  severityText: 'INFO',
  body: 'user.signed_up',
  attributes: { 'user.id': '123', 'plan': 'pro' },
})`}</Pre>
            <H4>Option 2 — Datadog Logs HTTP API</H4>
            <p className="text-sm text-gray-600 mb-3">
              POST directly to{' '}
              <Code>https://http-intake.logs.datadoghq.com/api/v2/logs</Code> with a{' '}
              <Code>DD-API-KEY</Code> header. Useful for sending logs from outside the OTel
              instrumentation path (e.g. a background job or edge function). See the{' '}
              <a
                href="https://docs.datadoghq.com/api/latest/logs/#send-logs"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-black"
              >
                Logs HTTP API docs
              </a>
              .
            </p>

            {/* ── RUM ───────────────────────────────────────────────── */}
            <H2 id="rum">RUM</H2>
            <p className="text-sm text-gray-600 mb-4">
              Create a client component and render it once in your root layout. It initializes both
              RUM and Browser Logs.
            </p>
            <Pre lang="bash">{`npm install @datadog/browser-rum @datadog/browser-logs`}</Pre>
            <Pre filename="app/components/datadog-init.tsx" lang="tsx">{`'use client'
import { datadogRum } from '@datadog/browser-rum'
import { datadogLogs } from '@datadog/browser-logs'

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID!,
  clientToken:   process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
  site:          process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com',
  service:       'my-app-web',
  env:           process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'local',
  version:       process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  sessionSampleRate:       100,
  sessionReplaySampleRate: 100,
  trackResources:          true,
  trackUserInteractions:   true,
  // Injects traceparent header on matched requests → connects browser session to server span.
  // Accepts strings (prefix match), RegExp, or predicate functions — mix as needed.
  allowedTracingUrls: [
    // Same-origin API calls (covers localhost, preview, and production automatically)
    (url) => url.startsWith(window.location.origin),
    // Example: explicit production domain
    // 'https://my-app.vercel.app',
    // Example: all subdomains via regex
    // /https:\/\/.*\.my-domain\.com/,
    // Example: specific API path prefix
    // (url) => new URL(url).pathname.startsWith('/api/'),
  ],
})

datadogLogs.init({
  clientToken:        process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
  site:               process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com',
  service:            'my-app-web',
  forwardErrorsToLogs: true,
  sessionSampleRate:   100,
})

export default function DatadogInit() { return null }`}</Pre>
            <Pre filename="app/layout.tsx (excerpt)" lang="tsx">{`import DatadogInit from '@/app/components/datadog-init'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <DatadogInit />
        {children}
      </body>
    </html>
  )
}`}</Pre>
            <Note variant="tip">
              <strong>allowedTracingUrls</strong> tells RUM to inject a <Code>traceparent</Code>{' '}
              header on fetch requests to your own origin. This links the browser RUM session to the
              server-side APM trace — enabling end-to-end waterfall views in Datadog.
            </Note>

            {/* ── APM ───────────────────────────────────────────────── */}
            <H2 id="apm">APM / Traces</H2>
            <p className="text-sm text-gray-600 mb-4">
              The same file works for all three paths. The path selection determines which env vars
              you set — the code is identical.
            </p>
            <Pre lang="bash">{`npm install @vercel/otel @opentelemetry/api @opentelemetry/api-logs`}</Pre>
            <Pre filename="instrumentation.ts  ← project root, not app/" lang="typescript">{`import { registerOTel } from '@vercel/otel'

export function register() {
  registerOTel({
    serviceName: process.env.VERCEL_PROJECT_NAME ?? 'my-service',
    attributes: {
      'deployment.environment': process.env.VERCEL_ENV ?? 'local',
      'service.version': process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      'cloud.provider': 'vercel',
    },
  })
}`}</Pre>
            <Note>
              <strong>File placement matters.</strong> <Code>instrumentation.ts</Code> must live at
              the Next.js project root next to <Code>package.json</Code>, not inside <Code>app/</Code>.
              Next.js only auto-calls <Code>register()</Code> from the root. Placing it in{' '}
              <Code>app/</Code> silently does nothing — all spans will be no-ops.
            </Note>
            <Note variant="info">
              <strong>Fetch instrumentation is disabled by Vercel.</strong> Vercel sets{' '}
              <Code>NEXT_OTEL_FETCH_DISABLED=1</Code> at runtime.{' '}
              <Code>propagateContextUrls</Code> in the instrument config has no effect — Vercel
              controls fetch propagation.
            </Note>

            <H3>Error Tracking on spans</H3>
            <p className="text-sm text-gray-600 mb-3">
              For errors to appear in Datadog Error Tracking, the error span must be on a{' '}
              <Code>SpanKind.SERVER</Code> entry span and include all three attributes:
            </p>
            <Pre lang="typescript">{`import { SpanStatusCode } from '@opentelemetry/api'

function recordSpanError(span: Span, err: Error) {
  span.recordException(err)
  span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
  // All three required for Datadog Error Tracking
  span.setAttribute('error.type',    err.name)
  span.setAttribute('error.message', err.message)
  span.setAttribute('error.stack',   err.stack ?? '')
}`}</Pre>

            {/* ── Logs ──────────────────────────────────────────────── */}
            <H2 id="logs">Logs</H2>
            <p className="text-sm text-gray-600 mb-4">
              Datadog Log Management correlates logs to traces via <Code>dd.trace_id</Code> and{' '}
              <Code>dd.span_id</Code> — both must be 64-bit decimal integers, not hex.
            </p>
            <Pre filename="lib/logger.ts" lang="typescript">{`import { trace } from '@opentelemetry/api'

// OTel trace IDs are 128-bit hex. Datadog wants the lower 64 bits as decimal.
function hexToDecimal(hex: string): string {
  return hex ? BigInt(\`0x\${hex}\`).toString(10) : ''
}

export function log(
  level: 'info' | 'warn' | 'error',
  event: string,
  data: Record<string, unknown> = {},
) {
  const ctx = trace.getActiveSpan()?.spanContext()
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    'dd.trace_id': hexToDecimal((ctx?.traceId ?? '').slice(-16)),
    'dd.span_id':  hexToDecimal(ctx?.spanId ?? ''),
    ...data,
  }
  if (level === 'error') console.error(JSON.stringify(entry))
  else                   console.log(JSON.stringify(entry))
}`}</Pre>
            <Note variant="tip">
              <Code>traceId.slice(-16)</Code> takes the lower 16 hex characters (64 bits) of the
              128-bit OTel trace ID, matching what Datadog stores. Without this conversion, log
              correlation will silently fail.
            </Note>

            {/* ── Source Maps ───────────────────────────────────────── */}
            <H2 id="sourcemaps">Source Maps</H2>
            <p className="text-sm text-gray-600 mb-4">
              Enables unminified stack traces in Datadog RUM and APM. Maps are uploaded at build
              time then deleted so they&apos;re never served publicly.
            </p>
            <Pre filename="next.config.ts (excerpt)" lang="typescript">{`const nextConfig: NextConfig = {
  // Required: generates browser .map files for upload
  productionBrowserSourceMaps: true,

  // Bake git metadata into the bundle for source code integration
  env: {
    DD_GIT_REPOSITORY_URL: \`https://github.com/\${process.env.VERCEL_GIT_REPO_OWNER}/\${process.env.VERCEL_GIT_REPO_SLUG}\`,
    DD_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
  },

  // Required in Next.js 16+ when webpack config is present
  turbopack: {},
}`}</Pre>
            <Pre filename="package.json (scripts)" lang="json">{`"build":     "next build",
"postbuild": "node scripts/upload-sourcemaps.mjs"`}</Pre>
            <Pre filename="scripts/upload-sourcemaps.mjs (excerpt)" lang="javascript">{`// Browser maps
await exec(\`npx @datadog/datadog-ci sourcemaps upload .next/static
  --service=my-service-web
  --release-version=\${sha}
  --minified-path-prefix=/_next/static\`)

// Server maps — generated by both Turbopack and webpack
// Script checks for .map files first and skips silently if none found
await exec(\`npx @datadog/datadog-ci sourcemaps upload .next/server
  --service=my-service
  --release-version=\${sha}
  --minified-path-prefix=/var/task/.next/server\`)`}</Pre>
            <Note variant="info">
              Turbopack (default in Next.js 15+) <strong>does</strong> generate server{' '}
              <Code>.map</Code> files — server code is minified with single-letter variable names.
              The upload script auto-detects and uploads them. If you switched to webpack via{' '}
              <Code>--webpack</Code>, add <Code>devtool: &apos;hidden-source-map&apos;</Code> to{' '}
              <Code>next.config.ts</Code> to generate server maps there too.
            </Note>

            {/* ── Env Variables ─────────────────────────────────────── */}
            <H2 id="env-vars">Env Variables</H2>
            <p className="text-sm text-gray-600 mb-3">
              Set in Vercel project settings. Variables without <Code>NEXT_PUBLIC_</Code> are
              server-only and never sent to the browser.
            </p>
            <EnvTable
              rows={[
                [
                  'NEXT_PUBLIC_DD_APPLICATION_ID',
                  'Yes',
                  'RUM application ID from Datadog → RUM & Session Replay → Application',
                ],
                [
                  'NEXT_PUBLIC_DD_CLIENT_TOKEN',
                  'Yes',
                  'RUM / Browser Logs client token from Datadog',
                ],
                ['NEXT_PUBLIC_DD_SITE', 'No', 'Defaults to datadoghq.com. Change for EU/US3/US5.'],
                [
                  'DATADOG_API_KEY',
                  'Yes (sourcemaps)',
                  'Server-only. Used by postbuild sourcemap upload script.',
                ],
                [
                  'OTEL_EXPORTER_OTLP_ENDPOINT',
                  'Paths B & C',
                  'e.g. https://otlp.datadoghq.com/v1/traces — sets the direct OTLP exporter target.',
                ],
                [
                  'OTEL_EXPORTER_OTLP_HEADERS',
                  'Paths B & C',
                  'e.g. dd-api-key=<key>,dd-otlp-source=<your-value>',
                ],
                [
                  'SANITY_API_WRITE_TOKEN',
                  'Lead forms',
                  'Sanity Editor-role token. Required for /api/forms/lead to write submissions.',
                ],
              ]}
            />
            <Note>
              <Code>VERCEL_OTEL_ENDPOINTS</Code> is auto-injected and managed by Vercel (Path A). Do not set it manually. Its JSON value embeds a Datadog API key
              — avoid logging <Code>process.env</Code> in full.
            </Note>

            {/* Footer */}
            <div className="mt-14 pt-6 border-t border-gray-100 text-xs text-gray-400 flex justify-between items-center">
              <span>Next.js · Vercel · Datadog · OpenTelemetry</span>
              <Link href="/lab" className="hover:text-gray-700 transition-colors">
                ⚡ Signal Lab →
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
