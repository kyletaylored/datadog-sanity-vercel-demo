import {withLabSpan, getTraceContext} from '@/lib/telemetry'
import {SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION, DEPLOY_REGION} from '@/lib/config'
import {NextResponse} from 'next/server'

export async function GET() {
  return withLabSpan('lab.env_info', {'lab.route': '/api/lab/env-info'}, async () => {
    const {traceId} = getTraceContext()
    return NextResponse.json({
      projectName: SERVICE_NAME,
      env: DEPLOY_ENV,
      region: DEPLOY_REGION,
      gitCommitSha: SERVICE_VERSION,
      gitBranch: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? process.env.VERCEL_GIT_COMMIT_REF ?? 'unknown',
      traceId,
    })
  })
}
