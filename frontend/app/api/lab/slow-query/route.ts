import {withLabSpan, structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

export async function GET(request: NextRequest) {
  const raw = Number(request.nextUrl.searchParams.get('delay') ?? '2000')
  const clamped = raw < 500 || isNaN(raw)
  const delay = Math.max(500, Math.min(8000, isNaN(raw) ? 2000 : raw))

  return withLabSpan(
    'lab.slow_query',
    {'lab.route': '/api/lab/slow-query', 'query.delay_ms': delay, 'query.clamped': clamped},
    async () => {
      await new Promise((r) => setTimeout(r, delay))
      const {traceId, spanId} = getTraceContext()
      structuredLog('warn', 'slow_query', {delayMs: delay, spanId})
      return NextResponse.json({requestedDelayMs: raw, actualDelayMs: delay, traceId})
    },
  )
}
