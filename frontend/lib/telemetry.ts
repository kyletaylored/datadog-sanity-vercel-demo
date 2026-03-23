import {trace, SpanStatusCode, SpanKind} from '@opentelemetry/api'
import {logs, SeverityNumber} from '@opentelemetry/api-logs'
import {SERVICE_NAME, DEPLOY_ENV, DEPLOY_REGION} from '@/lib/config'

const LAB_TRACER_NAME = `${SERVICE_NAME}.lab`
const LAB_LOGGER_NAME = `${SERVICE_NAME}.lab`

const SEVERITY: Record<'info' | 'warn' | 'error', SeverityNumber> = {
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
}

export function getLabTracer() {
  return trace.getTracer(LAB_TRACER_NAME)
}

export function getTraceContext(): {traceId: string; spanId: string} {
  const span = trace.getActiveSpan()
  if (!span) return {traceId: '', spanId: ''}
  const ctx = span.spanContext()
  return {traceId: ctx.traceId, spanId: ctx.spanId}
}

/**
 * Convert a 16-char hex string to an unsigned 64-bit decimal string.
 * Datadog APM stores trace/span IDs as 64-bit decimals, so log drain JSON
 * must use this format for log-trace correlation to work.
 * OTel trace IDs are 128-bit; Datadog uses the lower 64 bits (last 16 chars).
 */
function hexToDecimal(hex: string): string {
  if (!hex) return ''
  try {
    return BigInt(`0x${hex}`).toString(10)
  } catch {
    return ''
  }
}

export function structuredLog(
  level: 'info' | 'warn' | 'error',
  event: string,
  data: Record<string, unknown> = {},
): void {
  const {traceId, spanId} = getTraceContext()
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    service: SERVICE_NAME,
    env: DEPLOY_ENV,
    region: DEPLOY_REGION,
    traceId,
    spanId,
    // Datadog log-trace correlation: lower 64 bits of OTel trace ID as decimal
    'dd.trace_id': hexToDecimal(traceId.slice(-16)),
    'dd.span_id': hexToDecimal(spanId),
    ...data,
  }
  // Emit OTel log record — exported via OTLP to Datadog APM (correlated with active trace).
  logs.getLogger(LAB_LOGGER_NAME).emit({
    severityNumber: SEVERITY[level],
    severityText: level.toUpperCase(),
    body: event,
    attributes: entry,
  })

  // Also emit to console — Vercel log drain forwards these to Datadog Logs.
  if (level === 'error') console.error(JSON.stringify(entry))
  else if (level === 'warn') console.warn(JSON.stringify(entry))
  else console.log(JSON.stringify(entry))
}

/**
 * Set Datadog Error Tracking attributes on a span.
 * Must be called on the service entry span (SpanKind.SERVER) for Datadog to
 * surface the error in Error Tracking. Supplements span.recordException()
 * which only sets OTel's exception.* attributes.
 */
export function setSpanError(
  span: ReturnType<ReturnType<typeof getLabTracer>['startSpan']>,
  err: Error | string,
): void {
  const error = typeof err === 'string' ? new Error(err) : err
  span.recordException(error)
  span.setStatus({code: SpanStatusCode.ERROR, message: error.message})
  // Datadog Error Tracking requires these specific attribute names
  span.setAttribute('error.type', error.name ?? 'Error')
  span.setAttribute('error.message', error.message ?? '')
  span.setAttribute('error.stack', error.stack ?? '')
}

export async function withLabSpan<T>(
  name: string,
  attributes: Record<string, string | number | boolean>,
  fn: (span: ReturnType<ReturnType<typeof getLabTracer>['startSpan']>) => Promise<T>,
): Promise<T> {
  const tracer = getLabTracer()
  return tracer.startActiveSpan(
    name,
    {kind: SpanKind.SERVER, attributes: {'lab.trigger': 'manual', ...attributes}},
    async (span) => {
      try {
        const result = await fn(span)
        span.setStatus({code: SpanStatusCode.OK})
        return result
      } catch (err) {
        setSpanError(span, err as Error)
        throw err
      } finally {
        span.end()
      }
    },
  )
}
