/**
 * Canonical runtime config shared across server (API routes, telemetry, OTel)
 * and client (RUM, lab page) code.
 *
 * Service name: NEXT_PUBLIC_VERCEL_PROJECT_NAME is checked first — it can be
 * explicitly set in Vercel Project Settings and works in both server and client
 * contexts. VERCEL_PROJECT_NAME (Vercel system var) is the server-side fallback.
 *
 * Env names: Vercel uses "production"/"development"/"preview". We shorten these
 * to "prod"/"dev"/"preview" to match Datadog conventions.
 */

export const SERVICE_NAME =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_NAME ??
  process.env.VERCEL_PROJECT_NAME ??
  'martech-pulse'

const ENV_ALIASES: Record<string, string> = {
  production: 'prod',
  development: 'dev',
}

function toShortEnv(raw: string | undefined): string {
  const v = raw ?? 'development'
  return ENV_ALIASES[v] ?? v
}

export const DEPLOY_ENV = toShortEnv(
  process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV,
)

export const SERVICE_VERSION =
  (
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA
  )?.slice(0, 7) ?? 'local'

export const DEPLOY_REGION = process.env.VERCEL_REGION ?? 'unknown'
