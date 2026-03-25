import type {NextConfig} from 'next'

// Resolve git metadata at build time from Vercel system env vars.
// Used for Datadog source code integration and server-side sourcemap upload.
const repoOwner =
  process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER ?? process.env.VERCEL_GIT_REPO_OWNER
const repoSlug =
  process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG ?? process.env.VERCEL_GIT_REPO_SLUG
const commitSha =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA

const gitRepoUrl =
  repoOwner && repoSlug ? `https://github.com/${repoOwner}/${repoSlug}` : undefined

const nextConfig: NextConfig = {
  // Generate browser sourcemaps in production so they can be uploaded to Datadog.
  // The postbuild script deletes them after upload so they are not served publicly.
  productionBrowserSourceMaps: true,

  env: {
    SC_DISABLE_SPEEDY: 'false',
    // Bake Datadog git metadata into the server bundle at build time.
    // DD_GIT_REPOSITORY_URL and DD_GIT_COMMIT_SHA are read by Datadog's backend
    // to correlate errors with source code. This is the Turbopack-compatible path
    // (env option works for both webpack and Turbopack builds); the webpack
    // BannerPlugin below is belt-and-suspenders for webpack builds.
    ...(gitRepoUrl ? {DD_GIT_REPOSITORY_URL: gitRepoUrl} : {}),
    ...(commitSha ? {DD_GIT_COMMIT_SHA: commitSha} : {}),
    // Bake Vercel system vars into the client bundle at build time.
    // VERCEL_PROJECT_NAME and VERCEL_ENV are server-only at runtime but are
    // available during the Vercel build. The next.config `env` block inlines
    // values into both server and client bundles, so no NEXT_PUBLIC_ prefix is
    // needed — client code can read process.env.VERCEL_PROJECT_NAME directly.
    ...(process.env.VERCEL_PROJECT_NAME
      ? {VERCEL_PROJECT_NAME: process.env.VERCEL_PROJECT_NAME}
      : {}),
    ...(process.env.VERCEL_ENV ? {NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV} : {}),
  },

  // Turbopack is the default in Next.js 16. The `env` option above handles
  // DD_GIT_* injection for Turbopack builds. An explicit turbopack config is
  // required alongside any webpack config to avoid a hard build error.
  turbopack: {},

  // webpack config only runs when building with --webpack flag explicitly.
  // Adds hidden sourcemaps and BannerPlugin for DD_GIT_* as belt-and-suspenders.
  webpack: (config, {isServer, dev, webpack}) => {
    if (isServer && !dev) {
      config.devtool = 'hidden-source-map'
      if (gitRepoUrl && commitSha) {
        config.plugins!.push(
          new webpack.BannerPlugin({
            raw: true,
            entryOnly: true,
            banner:
              `process.env.DD_GIT_REPOSITORY_URL=${JSON.stringify(gitRepoUrl)};` +
              `process.env.DD_GIT_COMMIT_SHA=${JSON.stringify(commitSha)};`,
          }),
        )
      }
    }
    return config
  },

  images: {
    remotePatterns: [new URL('https://cdn.sanity.io/**')],
  },
}

export default nextConfig
