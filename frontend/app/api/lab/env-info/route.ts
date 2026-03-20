import {withLabSpan, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'

export async function GET() {
  return withLabSpan('lab.env_info', {'lab.route': '/api/lab/env-info'}, async () => {
    const {traceId} = getTraceContext()
    return NextResponse.json({
      projectName: process.env.VERCEL_PROJECT_NAME ?? 'martech-pulse',
      env: process.env.VERCEL_ENV ?? 'development',
      region: process.env.VERCEL_REGION ?? 'unknown',
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      gitBranch: process.env.VERCEL_GIT_COMMIT_REF ?? 'unknown',
      traceId,
    })
  })
}
