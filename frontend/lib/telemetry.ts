import {trace, SpanStatusCode, SpanKind} from '@opentelemetry/api'
import {logs, SeverityNumber} from '@opentelemetry/api-logs'

const LAB_TRACER_NAME = 'martech-pulse.lab'
const LAB_LOGGER_NAME = 'martech-pulse.lab'

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
    service: process.env.VERCEL_PROJECT_NAME ?? 'martech-pulse',
    env: process.env.VERCEL_ENV ?? 'development',
    region: process.env.VERCEL_REGION ?? 'unknown',
    traceId,
    spanId,
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
        span.recordException(err as Error)
        span.setStatus({code: SpanStatusCode.ERROR, message: (err as Error).message})
        throw err
      } finally {
        span.end()
      }
    },
  )
}
