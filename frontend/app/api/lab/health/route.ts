import {withLabSpan, structuredLog, getTraceContext} from '@/lib/telemetry'
import {SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION, DEPLOY_REGION} from '@/lib/config'
import {NextResponse} from 'next/server'

export async function GET() {
  return withLabSpan('lab.health_check', {'lab.route': '/api/lab/health'}, async (_span) => {
    const {traceId, spanId} = getTraceContext()
    const payload = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      region: DEPLOY_REGION,
      env: DEPLOY_ENV,
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      traceId,
    }
    structuredLog('info', 'health_check', {spanId})
    return NextResponse.json(payload)
  })
}
