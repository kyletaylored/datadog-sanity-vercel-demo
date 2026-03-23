import Link from 'next/link'

function H2({children}: {children: React.ReactNode}) {
  return <h2 className="text-xl font-semibold mt-10 mb-3 pb-2 border-b border-gray-200">{children}</h2>
}

function H3({children}: {children: React.ReactNode}) {
  return <h3 className="text-base font-semibold mt-6 mb-2">{children}</h3>
}

function Code({children}: {children: React.ReactNode}) {
  return <code className="bg-gray-100 text-gray-800 rounded px-1.5 py-0.5 text-sm font-mono">{children}</code>
}

function Pre({children}: {children: React.ReactNode}) {
  return (
    <pre className="bg-gray-950 text-gray-100 rounded-lg p-4 text-sm font-mono overflow-x-auto my-3 leading-relaxed">
      {children}
    </pre>
  )
}

function Note({children}: {children: React.ReactNode}) {
  return (
    <div className="border-l-4 border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-900 my-4 rounded-r">
      {children}
    </div>
  )
}

function EnvTable({rows}: {rows: [string, string, string][]}) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2 font-medium border border-gray-200 font-mono">Variable</th>
            <th className="px-3 py-2 font-medium border border-gray-200">Required</th>
            <th className="px-3 py-2 font-medium border border-gray-200">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, req, note]) => (
            <tr key={name} className="even:bg-gray-50">
              <td className="px-3 py-2 border border-gray-200 font-mono text-xs">{name}</td>
              <td className="px-3 py-2 border border-gray-200">{req}</td>
              <td className="px-3 py-2 border border-gray-200 text-gray-600">{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const metadata = {
  title: 'Setup Guide — Next.js + Vercel + Datadog',
}

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-2 text-sm font-mono text-gray-400">
          <Link href="/" className="hover:underline">Home</Link> / Setup
        </div>

        <h1 className="text-3xl font-bold mb-2">Next.js + Vercel + Datadog</h1>
        <p className="text-gray-500 mb-8">
          Minimum setup for full observability: APM traces, RUM, browser &amp; server logs,
          source code integration, and error tracking.
        </p>

        {/* ── Overview ───────────────────────────────────── */}
        <H2>What you get</H2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li><strong>Distributed traces</strong> — server-side spans via OTel, connected to Vercel&apos;s edge/runtime spans</li>
          <li><strong>RUM + Session Replay</strong> — browser performance, user interactions, and replays</li>
          <li><strong>Logs</strong> — structured JSON logs correlated to traces via <Code>dd.trace_id</Code> / <Code>dd.span_id</Code></li>
          <li><strong>Error Tracking</strong> — errors surfaced in Datadog with stack traces and source code links</li>
          <li><strong>Source maps</strong> — browser and server bundles unminified in Datadog</li>
        </ul>

        {/* ── Vercel Integration ─────────────────────────── */}
        <H2>Step 1 — Install the Vercel–Datadog integration</H2>
        <p className="text-sm text-gray-700 mb-3">
          Install the Datadog integration from the Vercel marketplace. This is the only step
          that requires no code. It:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mb-3">
          <li>Injects <Code>VERCEL_OTEL_ENDPOINTS</Code> at runtime, which spins up a local OTel collector sidecar on <Code>localhost:4318</Code></li>
          <li>Automatically creates parent spans for edge and serverless invocations</li>
          <li>Forwards console logs to Datadog Logs via log drain</li>
        </ul>
        <Note>
          <Code>VERCEL_OTEL_ENDPOINTS</Code> is <strong>not</strong> a direct Datadog URL — it configures a
          local sidecar collector. Send OTel signals to <Code>http://localhost:4318/v1/traces</Code> (traces)
          and <Code>http://localhost:4318/v1/logs</Code> (logs). <Code>@vercel/otel</Code> handles traces
          automatically; logs need manual wiring (see Step 3).
        </Note>

        {/* ── instrumentation.ts ────────────────────────── */}
        <H2>Step 2 — Create <code className="text-xl">instrumentation.ts</code></H2>
        <Note>
          This file <strong>must</strong> be at the project root (next to <Code>package.json</Code>),
          not inside <Code>app/</Code>. Next.js only auto-calls <Code>register()</Code> from the root.
          Placing it in <Code>app/</Code> silently does nothing — all spans will be no-ops.
        </Note>
        <Pre>{`// instrumentation.ts  ← project root, NOT app/instrumentation.ts
import { registerOTel } from '@vercel/otel'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'

export function register() {
  // Use Vercel's sidecar collector for logs (same path as traces).
  // Falls back to OTEL_EXPORTER_OTLP_LOGS_ENDPOINT outside Vercel.
  const collectorPort = process.env.VERCEL_OTEL_ENDPOINTS_PORT ?? '4318'
  const logExporter = process.env.VERCEL_OTEL_ENDPOINTS
    ? new OTLPLogExporter({ url: \`http://localhost:\${collectorPort}/v1/logs\` })
    : new OTLPLogExporter()

  registerOTel({
    serviceName: process.env.NEXT_PUBLIC_VERCEL_PROJECT_NAME ?? 'my-service',
    attributes: {
      'deployment.environment': process.env.VERCEL_ENV ?? 'development',
      'service.version': process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    },
    logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
  })
}`}</Pre>

        <H3>Required packages</H3>
        <Pre>{`npm install @vercel/otel @opentelemetry/api @opentelemetry/api-logs \\
  @opentelemetry/sdk-logs @opentelemetry/exporter-logs-otlp-http`}</Pre>

        {/* ── RUM ───────────────────────────────────────── */}
        <H2>Step 3 — Initialize Datadog RUM (browser)</H2>
        <p className="text-sm text-gray-700 mb-3">
          Create a client component and render it once in your root layout. It initializes
          both RUM and Browser Logs.
        </p>
        <Pre>{`// app/components/datadog-init.tsx
'use client'
import { datadogRum } from '@datadog/browser-rum'
import { datadogLogs } from '@datadog/browser-logs'

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID!,
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
  site: process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com',
  service: 'my-service-web',
  env: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
  version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackResources: true,
  trackUserInteractions: true,
  allowedTracingUrls: [(url) => url.includes(window.location.origin)],
})

datadogLogs.init({
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
  site: process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com',
  service: 'my-service-web',
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
})

export default function DatadogInit() { return null }`}</Pre>
        <Pre>{`npm install @datadog/browser-rum @datadog/browser-logs`}</Pre>

        {/* ── Log correlation ───────────────────────────── */}
        <H2>Step 4 — Correlate logs to traces</H2>
        <p className="text-sm text-gray-700 mb-3">
          Datadog Log Management requires <Code>dd.trace_id</Code> and <Code>dd.span_id</Code> as
          64-bit <em>decimal</em> integers. OTel trace IDs are 128-bit hex; take the lower 16 hex
          characters and convert.
        </p>
        <Pre>{`import { trace } from '@opentelemetry/api'

function hexToDecimal(hex: string): string {
  return hex ? BigInt(\`0x\${hex}\`).toString(10) : ''
}

function getTraceContext() {
  const ctx = trace.getActiveSpan()?.spanContext()
  return {
    traceId: ctx?.traceId ?? '',
    spanId: ctx?.spanId ?? '',
  }
}

export function structuredLog(level: 'info' | 'warn' | 'error', event: string, data = {}) {
  const { traceId, spanId } = getTraceContext()
  const entry = {
    timestamp: new Date().toISOString(),
    level, event,
    'dd.trace_id': hexToDecimal(traceId.slice(-16)), // lower 64 bits as decimal
    'dd.span_id': hexToDecimal(spanId),
    ...data,
  }
  if (level === 'error') console.error(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}`}</Pre>

        {/* ── Error Tracking ───────────────────────────── */}
        <H2>Step 5 — Error Tracking on spans</H2>
        <p className="text-sm text-gray-700 mb-3">
          For errors to appear in Datadog Error Tracking, they must be on a{' '}
          <Code>SpanKind.SERVER</Code> entry span and include all three attributes:
        </p>
        <Pre>{`import { SpanStatusCode } from '@opentelemetry/api'

function setSpanError(span, err: Error) {
  span.recordException(err)
  span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
  // All three are required for Datadog Error Tracking
  span.setAttribute('error.type', err.name)
  span.setAttribute('error.message', err.message)
  span.setAttribute('error.stack', err.stack ?? '')
}`}</Pre>

        {/* ── next.config.ts ────────────────────────────── */}
        <H2>Step 6 — Configure <code className="text-xl">next.config.ts</code></H2>
        <Pre>{`import type { NextConfig } from 'next'

const repoOwner = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER
const repoSlug  = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA
const gitRepoUrl = repoOwner && repoSlug
  ? \`https://github.com/\${repoOwner}/\${repoSlug}\`
  : undefined

const nextConfig: NextConfig = {
  // Generate browser .map files for Datadog upload.
  // The postbuild script deletes them after upload.
  productionBrowserSourceMaps: true,

  // Bake git metadata into the bundle for source code integration.
  // Works for both Turbopack and webpack builds.
  env: {
    ...(gitRepoUrl ? { DD_GIT_REPOSITORY_URL: gitRepoUrl } : {}),
    ...(commitSha  ? { DD_GIT_COMMIT_SHA: commitSha }      : {}),
  },

  // Required alongside any webpack config in Next.js 16+
  turbopack: {},
}

export default nextConfig`}</Pre>

        {/* ── Sourcemaps ───────────────────────────────── */}
        <H2>Step 7 — Upload sourcemaps (postbuild)</H2>
        <p className="text-sm text-gray-700 mb-3">
          Add a <Code>postbuild</Code> script that uploads browser and server maps then deletes
          them so they aren&apos;t served publicly.
        </p>
        <Pre>{`// package.json
"scripts": {
  "build": "next build",
  "postbuild": "node scripts/upload-sourcemaps.mjs"
}`}</Pre>
        <p className="text-sm text-gray-700 my-3">
          The upload script needs to run two commands — one for browser maps, one for server:
        </p>
        <Pre>{`# Browser maps
npx @datadog/datadog-ci sourcemaps upload .next/static \\
  --service=my-service-web \\
  --release-version=<commit-sha-7> \\
  --minified-path-prefix=/_next/static \\
  --repository-url=https://github.com/owner/repo

# Server maps (path must match runtime location on Vercel lambdas)
npx @datadog/datadog-ci sourcemaps upload .next/server \\
  --service=my-service \\
  --release-version=<commit-sha-7> \\
  --minified-path-prefix=/var/task/frontend/.next/server \\
  --repository-url=https://github.com/owner/repo`}</Pre>
        <Note>
          Server sourcemaps are only generated by webpack builds with{' '}
          <Code>devtool: &apos;hidden-source-map&apos;</Code>. Turbopack (default in Next.js 16)
          does not currently generate server <Code>.map</Code> files — the script skips the
          server upload silently if no <Code>.map</Code> files are found.
        </Note>

        {/* ── Environment Variables ─────────────────────── */}
        <H2>Environment variables</H2>
        <p className="text-sm text-gray-700 mb-3">
          Set these in your Vercel project settings. Variables without{' '}
          <Code>NEXT_PUBLIC_</Code> are server-only.
        </p>
        <EnvTable
          rows={[
            ['NEXT_PUBLIC_DD_APPLICATION_ID', 'Yes', 'RUM application ID from Datadog'],
            ['NEXT_PUBLIC_DD_CLIENT_TOKEN', 'Yes', 'RUM/Logs client token from Datadog'],
            ['NEXT_PUBLIC_DD_SITE', 'No', 'Defaults to datadoghq.com'],
            ['DATADOG_API_KEY', 'Yes (sourcemaps)', 'Server-only. Used only in postbuild script'],
            ['NEXT_PUBLIC_VERCEL_PROJECT_NAME', 'Recommended', 'Set manually — NEXT_PUBLIC_ makes it available at build time and in the browser. Vercel\'s built-in VERCEL_PROJECT_NAME is server-only'],
          ]}
        />
        <Note>
          <Code>VERCEL_OTEL_ENDPOINTS</Code> is injected automatically by the Vercel–Datadog
          integration. Do not set it manually. Its value contains a Datadog API key — avoid
          logging <Code>process.env</Code> in full.
        </Note>

        {/* ── Gotchas ───────────────────────────────────── */}
        <H2>Known gotchas</H2>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong>Fetch instrumentation is disabled by Vercel.</strong>{' '}
            <Code>NEXT_OTEL_FETCH_DISABLED=1</Code> and{' '}
            <Code>VERCEL_TRACING_DISABLE_AUTOMATIC_FETCH_INSTRUMENTATION=1</Code> are set at
            runtime. <Code>propagateContextUrls</Code> in <Code>instrumentationConfig.fetch</Code>{' '}
            has no effect — Vercel controls fetch propagation.
          </div>
          <div>
            <strong>Turbopack + webpack config.</strong>{' '}
            Next.js 16 uses Turbopack by default. Having a <Code>webpack</Code> config without a{' '}
            <Code>turbopack</Code> config is a hard build error. Add <Code>turbopack: {'{}'}</Code>{' '}
            to acknowledge the switch.
          </div>
          <div>
            <strong>Log-trace correlation IDs must be decimal.</strong>{' '}
            Datadog stores trace/span IDs as 64-bit unsigned integers, not hex. Convert the
            lower 16 hex chars of the OTel trace ID via <Code>BigInt(`0x${'{hex}'}`).toString(10)</Code>.
          </div>
          <div>
            <strong><Code>VERCEL_PROJECT_NAME</Code> is empty at build time.</strong>{' '}
            It&apos;s only available in the serverless runtime, not during the build phase.
            Use <Code>NEXT_PUBLIC_VERCEL_PROJECT_NAME</Code> (set manually) as the primary
            source and fall back to <Code>VERCEL_PROJECT_NAME</Code> at runtime.
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
          <span>Next.js 16 · Vercel · Datadog · OpenTelemetry</span>
          <Link href="/lab" className="hover:underline">⚡ Signal Lab →</Link>
        </div>
      </div>
    </div>
  )
}
