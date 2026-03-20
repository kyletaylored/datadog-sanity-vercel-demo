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
  },

  webpack: (config, {isServer, dev, webpack}) => {
    if (isServer && !dev) {
      // Generate sourcemaps for server bundles in production.
      // 'hidden-source-map' emits .map files without appending the //# sourceMappingURL
      // comment, so they are not served publicly but can be uploaded to Datadog.
      config.devtool = 'hidden-source-map'

      // BannerPlugin: inject DD_GIT_* at the top of each server entry bundle.
      // Combined with the env option above, this ensures the metadata is present
      // whether the binary is read via process.env at runtime or via dd-trace.
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
