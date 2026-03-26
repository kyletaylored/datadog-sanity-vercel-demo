import {trace, SpanStatusCode} from '@opentelemetry/api'
import {getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'

// Triggers a RangeError via infinite recursion → stack overflow.
// Tests whether Datadog captures the truncated stack correctly.
function recurse(n: number): number {
  return recurse(n + 1)
}

export async function GET() {
  const span = trace.getActiveSpan()

  try {
    recurse(0)
  } catch (err) {
    const error = err as Error
    if (span) {
      span.recordException(error)
      span.setStatus({code: SpanStatusCode.ERROR, message: error.message})
      span.setAttribute('error.type', error.name)
      span.setAttribute('error.message', error.message)
      // Stack may be truncated or empty on stack overflow — record what we have
      span.setAttribute('error.stack', error.stack ?? '(stack unavailable)')
    }
    const {traceId} = getTraceContext()
    return NextResponse.json(
      {error: true, type: error.name, message: error.message, stack_truncated: true, traceId},
      {status: 500},
    )
  }
}
