import {withLabSpan, getTraceContext} from '@/lib/telemetry'
import {SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION, DEPLOY_REGION, GIT_REPO_URL} from '@/lib/config'
import {getLocalGitMeta} from '@/lib/git'
import {NextResponse} from 'next/server'

export async function GET() {
  return withLabSpan('lab.env_info', {'lab.route': '/api/lab/env-info'}, async () => {
    const {traceId} = getTraceContext()

    const vercelSha =
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
    const vercelBranch =
      process.env.VERCEL_GIT_COMMIT_REF ?? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF

    // Fall back to local git when Vercel system vars are absent (local dev)
    const local = !vercelSha ? await getLocalGitMeta() : null

    return NextResponse.json({
      projectName: SERVICE_NAME,
      env: DEPLOY_ENV,
      region: DEPLOY_REGION,
      gitCommitSha: vercelSha ? SERVICE_VERSION : local?.sha ?? 'unknown',
      gitBranch: vercelBranch ?? local?.branch ?? 'unknown',
      gitRepoUrl: GIT_REPO_URL ?? local?.repoUrl,
      traceId,
    })
  })
}
