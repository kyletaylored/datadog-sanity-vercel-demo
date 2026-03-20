#!/usr/bin/env node
/**
 * Uploads Next.js browser sourcemaps to Datadog after a production build,
 * then deletes the .map files so they are not served publicly.
 *
 * Run automatically via the `postbuild` npm script on Vercel.
 * Skipped silently in non-production environments and when DATADOG_API_KEY is absent.
 *
 * Version string intentionally matches datadog-init.tsx:
 *   version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local'
 */

import {execSync} from 'child_process'
import {existsSync} from 'fs'

const {
  VERCEL_ENV,
  VERCEL_GIT_COMMIT_SHA,
  VERCEL_PROJECT_NAME,
  NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER,
  NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG,
  DATADOG_API_KEY,
  NEXT_PUBLIC_DD_SITE,
} = process.env

// Only upload on Vercel production deploys
if (VERCEL_ENV !== 'production') {
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

const service = VERCEL_PROJECT_NAME ?? 'martech-pulse'
const version = VERCEL_GIT_COMMIT_SHA ? VERCEL_GIT_COMMIT_SHA.slice(0, 7) : 'local'
const site = NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com'

// Use repository URL from Vercel git env vars for Datadog's git integration.
// If not available (e.g. non-GitHub deploys), pass --disable-git to suppress the error.
const repoUrl =
  NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER && NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG
    ? `https://github.com/${NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER}/${NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG}`
    : null

console.log(`[sourcemaps] Uploading — service=${service} version=${version} site=${site} repo=${repoUrl ?? '(disabled)'}`)

try {
  execSync(
    [
      'npx @datadog/datadog-ci sourcemaps upload .next/static',
      `--service=${service}`,
      `--release-version=${version}`,
      '--minified-path-prefix=/_next/static',
      repoUrl ? `--repository-url=${repoUrl}` : '--disable-git',
    ].join(' '),
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATADOG_SITE: site,
        DATADOG_API_KEY,
      },
    },
  )

  // Remove .map files — they've been uploaded; no need to serve them publicly
  execSync("find .next/static -name '*.map' -delete", {stdio: 'inherit'})
  console.log('[sourcemaps] Upload complete. .map files removed from build output.')
} catch (err) {
  // Log but don't fail the deployment — a missing sourcemap is better than a broken deploy
  console.error('[sourcemaps] Upload failed (non-fatal):', err.message)
  process.exit(0)
}
