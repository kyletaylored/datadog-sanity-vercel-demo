import {withLabSpan, structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

const VALID_KEY = /^[a-z][a-z0-9_.]{0,63}$/

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {key, value} = body ?? {}

  if (!key || !VALID_KEY.test(key)) {
    return NextResponse.json(
      {error: true, message: 'key must match /^[a-z][a-z0-9_.]{0,63}$/'},
      {status: 400},
    )
  }

  return withLabSpan(
    'lab.custom_attribute',
    {'lab.route': '/api/lab/custom-attribute'},
    async (span) => {
      span.setAttribute(key, String(value))
      const {traceId, spanId} = getTraceContext()
      structuredLog('info', 'custom_attribute', {key, spanId})
      return NextResponse.json({key, value, traceId})
    },
  )
}
