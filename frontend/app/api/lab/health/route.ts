import {withLabSpan, structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'

export async function GET() {
  return withLabSpan('lab.health_check', {'lab.route': '/api/lab/health'}, async (span) => {
    const {traceId, spanId} = getTraceContext()
    const payload = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      region: process.env.VERCEL_REGION ?? 'unknown',
      env: process.env.VERCEL_ENV ?? 'development',
      service: process.env.VERCEL_PROJECT_NAME ?? 'martech-pulse',
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      traceId,
    }
    structuredLog('info', 'health_check', {spanId})
    return NextResponse.json(payload)
  })
}
