import {trace, SpanStatusCode} from '@opentelemetry/api'
import {structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'

// Simulates accessing a property on null — the most common JS runtime error.
export async function GET() {
  const span = trace.getActiveSpan()

  try {
    const user: {name: string} | null = null
    // @ts-expect-error intentional null dereference
    void user.name
  } catch (err) {
    const error = err as Error
    if (span) {
      span.recordException(error)
      span.setStatus({code: SpanStatusCode.ERROR, message: error.message})
      span.setAttribute('error.type', error.name)
      span.setAttribute('error.message', error.message)
      span.setAttribute('error.stack', error.stack ?? '')
    }
    structuredLog('error', 'type_error', {errorMessage: error.message, errorType: error.name})
    const {traceId} = getTraceContext()
    return NextResponse.json({error: true, type: error.name, message: error.message, traceId}, {status: 500})
  }
}
