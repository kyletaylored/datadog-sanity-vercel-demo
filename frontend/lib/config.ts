/**
 * Canonical runtime config shared across server (API routes, telemetry, OTel)
 * and client (RUM, datadog-init) code.
 *
 * All NEXT_PUBLIC_ values are baked into the client bundle at build time by
 * next.config.ts (which forwards Vercel system vars like VERCEL_PROJECT_NAME
 * and VERCEL_ENV). Server-only vars (OTEL_SERVICE_NAME, VERCEL_PROJECT_NAME)
 * only resolve in server contexts such as instrumentation.ts and API routes.
 *
 * Env: use the raw Vercel value ("production" / "preview" / "development").
 * Do not shorten — Vercel's drain and sidecar emit "production" directly, and
 * mapping to "prod" creates a mismatch in Datadog between RUM and APM/Logs.
 */

// OTEL_SERVICE_NAME is the standard OTel env var respected by @vercel/otel.
// Server-only; falls through to NEXT_PUBLIC_VERCEL_PROJECT_NAME on the client.
export const SERVICE_NAME =
  process.env.OTEL_SERVICE_NAME ??
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_NAME ??
  'my-service'

// NEXT_PUBLIC_VERCEL_ENV is baked by next.config.ts from VERCEL_ENV at build
// time so it is available in both server and client (browser) contexts.
export const DEPLOY_ENV =
  process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? 'development'

export const SERVICE_VERSION =
  (
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA
  )?.slice(0, 7) ?? 'local'

export const DEPLOY_REGION = process.env.VERCEL_REGION ?? 'unknown'
