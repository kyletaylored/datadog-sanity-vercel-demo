import {withLabSpan, structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'

export async function GET() {
  return withLabSpan('lab.handled_error', {'lab.route': '/api/lab/handled-error'}, async () => {
    const {traceId, spanId} = getTraceContext()
    try {
      throw new Error('Intentional handled error from Signal Lab')
    } catch (err) {
      const message = (err as Error).message
      structuredLog('error', 'handled_error', {errorMessage: message, spanId})
      return NextResponse.json({error: true, message, traceId}, {status: 500})
    }
  })
}
