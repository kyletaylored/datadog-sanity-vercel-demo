import {trace, SpanStatusCode} from '@opentelemetry/api'
import {structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'

export async function GET() {
  // Capture the HTTP entry span BEFORE any child spans are created.
  // Datadog Error Tracking requires error.type/message/stack on the service entry span,
  // not on a nested child span. @vercel/otel auto-instrumentation sets http.status_code
  // but does NOT automatically populate error.* attributes from thrown JS errors.
  const span = trace.getActiveSpan()

  try {
    throw new Error('Intentional handled error from Signal Lab')
  } catch (err) {
    const error = err as Error

    if (span) {
      // OTel exception convention — sets exception.type/message/stacktrace
      span.recordException(error)
      span.setStatus({code: SpanStatusCode.ERROR, message: error.message})
      // Datadog Error Tracking convention — requires these specific attribute names
      span.setAttribute('error.type', error.name ?? 'Error')
      span.setAttribute('error.message', error.message ?? '')
      span.setAttribute('error.stack', error.stack ?? '')
    }

    structuredLog('error', 'handled_error', {
      errorMessage: error.message,
      errorType: error.name,
    })

    const {traceId} = getTraceContext()
    return NextResponse.json(
      {error: true, message: error.message, traceId},
      {status: 500},
    )
  }
}
