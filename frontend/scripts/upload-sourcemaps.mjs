#!/usr/bin/env node
/**
 * Uploads Next.js sourcemaps to Datadog after a production build:
 *   1. Browser maps from .next/static  (minified-path-prefix=/_next/static)
 *   2. Server maps from .next/server   (minified-path-prefix=/var/task/frontend/.next/server)
 *
 * Deletes .map files after upload so they are not served or included in the lambda.
 *
 * Run automatically via the `postbuild` npm script on Vercel.
 * Skipped silently in non-production environments and when DATADOG_API_KEY is absent.
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'

const {
  VERCEL_ENV,
  VERCEL_GIT_COMMIT_SHA,
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  VERCEL_PROJECT_NAME,
  NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER,
  NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG,
  DATADOG_API_KEY,
  NEXT_PUBLIC_DD_SITE,
  SOURCEMAPS_DRY_RUN,
} = process.env

const dryRun = SOURCEMAPS_DRY_RUN === '1' || process.argv.includes('--dry-run')
if (dryRun) {
  console.log('[sourcemaps] DRY RUN — datadog-ci will validate but not upload. Map files will not be deleted.')
}

// Only upload on Vercel production deploys (skipped in dry-run mode so you can test locally)
if (!dryRun && VERCEL_ENV !== 'production') {
  console.log(`[sourcemaps] Skipping upload — VERCEL_ENV="${VERCEL_ENV ?? 'undefined'}" (production only)`)
  process.exit(0)
}

if (!DATADOG_API_KEY) {
  console.warn('[sourcemaps] DATADOG_API_KEY not set — skipping upload. Add it to Vercel project env vars.')
  process.exit(0)
}

if (!existsSync('.next/static')) {
  console.warn('[sourcemaps] .next/static not found — did the build run first?')
  process.exit(1)
}

const service = VERCEL_PROJECT_NAME ?? 'my-service'
const sha = NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? VERCEL_GIT_COMMIT_SHA
const version = sha ? sha.slice(0, 7) : 'local'
const site = NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com'

// Use repository URL from Vercel git env vars for Datadog's git integration.
// If not available (e.g. non-GitHub deploys), pass --disable-git to suppress the error.
const repoUrl =
  NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER && NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG
    ? `https://github.com/${NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER}/${NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG}`
    : null

const ddEnv = {
  ...process.env,
  DATADOG_SITE: site,
  DATADOG_API_KEY,
}

const gitFlag = repoUrl ? `--repository-url=${repoUrl}` : '--disable-git'

console.log(`[sourcemaps] service=${service} version=${version} site=${site} repo=${repoUrl ?? '(disabled)'}`)

const dryRunFlag = dryRun ? '--dry-run' : ''
let failed = false

// --- Browser sourcemaps ---
try {
  console.log('[sourcemaps] Uploading browser maps (.next/static)...')
  execSync(
    [
      'npx @datadog/datadog-ci sourcemaps upload .next/static',
      `--service=${service}-web`,
      `--release-version=${version}`,
      '--minified-path-prefix=/_next/static',
      gitFlag,
      dryRunFlag,
    ].filter(Boolean).join(' '),
    { stdio: 'inherit', env: ddEnv },
  )
  if (!dryRun) {
    execSync("find .next/static -name '*.map' -delete", { stdio: 'inherit' })
  }
  console.log(`[sourcemaps] Browser upload complete${dryRun ? ' (dry run)' : ''}.`)
} catch (err) {
  console.error('[sourcemaps] Browser upload failed (non-fatal):', err.message)
  failed = true
}

// --- Server sourcemaps ---
// On Vercel, server bundles run from /var/task/frontend/.next/server.
// This prefix must match the paths in server-side stack traces for Datadog
// to unminify them. Only attempt if .map files actually exist.
if (existsSync('.next/server')) {
  const hasServerMaps = (() => {
    try {
      return execSync("find .next/server -name '*.map' | head -1", { encoding: 'utf8' }).trim() !== ''
    } catch {
      return false
    }
  })()

  if (hasServerMaps) {
    try {
      console.log('[sourcemaps] Uploading server maps (.next/server)...')
      execSync(
        [
          'npx @datadog/datadog-ci sourcemaps upload .next/server',
          `--service=${service}`,
          `--release-version=${version}`,
          '--minified-path-prefix=/var/task/frontend/.next/server',
          gitFlag,
          dryRunFlag,
        ].filter(Boolean).join(' '),
        { stdio: 'inherit', env: ddEnv },
      )
      if (!dryRun) {
        execSync("find .next/server -name '*.map' -delete", { stdio: 'inherit' })
      }
      console.log(`[sourcemaps] Server upload complete${dryRun ? ' (dry run)' : ''}.`)
    } catch (err) {
      console.error('[sourcemaps] Server upload failed (non-fatal):', err.message)
      failed = true
    }
  } else {
    console.log('[sourcemaps] No server .map files found — skipping server upload.')
    console.log('[sourcemaps] To generate server maps, ensure next.config.ts webpack devtool=hidden-source-map is active (webpack builds only).')
  }
}

if (!failed) {
  console.log('[sourcemaps] All uploads complete.')
}
