import {trace, SpanStatusCode} from '@opentelemetry/api'
import {getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'

// Simulates an async operation that rejects — e.g. a timed-out external call.
// The error has a `cause` chain: tests whether Datadog surfaces nested causes.
async function fetchCampaignData(id: string): Promise<void> {
  await new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error(`Upstream timeout fetching campaign ${id}`)), 10),
  )
}

export async function GET() {
  const span = trace.getActiveSpan()

  try {
    await fetchCampaignData('camp_9f2a')
  } catch (cause) {
    const error = new Error('Failed to load campaign analytics', {cause})
    if (span) {
      span.recordException(error)
      span.setStatus({code: SpanStatusCode.ERROR, message: error.message})
      span.setAttribute('error.type', error.name)
      span.setAttribute('error.message', error.message)
      span.setAttribute('error.stack', error.stack ?? '')
      if (cause instanceof Error) {
        span.setAttribute('error.cause', cause.message)
      }
    }
    const {traceId} = getTraceContext()
    return NextResponse.json(
      {
        error: true,
        type: error.name,
        message: error.message,
        cause: cause instanceof Error ? cause.message : String(cause),
        traceId,
      },
      {status: 500},
    )
  }
}
