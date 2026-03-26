/**
 * Canonical runtime config shared across server (API routes, telemetry, OTel)
 * and client (RUM, datadog-init) code.
 *
 * VERCEL_PROJECT_NAME and VERCEL_ENV are server-only Vercel system vars.
 * next.config.ts inlines them into the client bundle at build time via the
 * `env` block, so the values below resolve correctly in both server and
 * browser contexts without any manual env var setup.
 *
 * Env: Vercel values are "production" / "preview" / "development". Falls back
 * to "local" when not on Vercel. Do not shorten — Vercel's drain and sidecar
 * emit "production" directly; mapping to "prod" creates a mismatch in Datadog.
 */

// VERCEL_PROJECT_NAME is a Vercel system var available at build time.
// next.config.ts inlines it into the client bundle via the `env` block,
// so this resolves correctly in both server and browser contexts.
export const SERVICE_NAME = process.env.VERCEL_PROJECT_NAME ?? 'my-service'

// NEXT_PUBLIC_VERCEL_ENV is baked by next.config.ts from VERCEL_ENV at build
// time so it is available in both server and client (browser) contexts.
// Vercel values: "production" | "preview" | "development". Falls back to
// "local" when not running on Vercel (i.e. local dev without Vercel CLI).
export const DEPLOY_ENV =
  process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? 'local'

export const SERVICE_VERSION =
  (
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA
  )?.slice(0, 7) ?? 'local'

export const DEPLOY_REGION = process.env.VERCEL_REGION ?? 'unknown'

// AWS_REGION is injected by Vercel's Lambda runtime (e.g. "us-east-1").
export const CLOUD_REGION = process.env.AWS_REGION ?? process.env.VERCEL_REGION ?? 'unknown'

// Unique ID for this deployment — useful for correlating metrics with a specific deploy.
export const DEPLOYMENT_ID = process.env.VERCEL_DEPLOYMENT_ID ?? undefined

// Repository URL for Datadog source code integration.
// DD_GIT_REPOSITORY_URL is baked in at build time by next.config.ts from VERCEL_GIT_* vars.
// Set GIT_REPO_URL in .env.local as a fallback for local dev.
// https://docs.datadoghq.com/integrations/guide/source-code-integration/
export const GIT_REPO_URL =
  process.env.DD_GIT_REPOSITORY_URL || process.env.GIT_REPO_URL || undefined
