import {withLabSpan, structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {propagation, context} from '@opentelemetry/api'

export async function GET(request: NextRequest) {
  return withLabSpan('lab.chain', {'lab.route': '/api/lab/chain'}, async () => {
    const origin = request.nextUrl.origin
    const healthUrl = `${origin}/api/lab/health`
    const hops: {url: string; status: number; durationMs: number}[] = []
    const totalStart = Date.now()

    for (let i = 0; i < 3; i++) {
      const headers: Record<string, string> = {}
      propagation.inject(context.active(), headers)
      const start = Date.now()
      const res = await fetch(healthUrl, {headers})
      hops.push({url: healthUrl, status: res.status, durationMs: Date.now() - start})
    }

    const {traceId, spanId} = getTraceContext()
    structuredLog('info', 'chain_request', {hopCount: 3, spanId})
    return NextResponse.json({hops, totalDurationMs: Date.now() - totalStart, traceId})
  })
}
