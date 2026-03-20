import {registerOTel} from '@vercel/otel'
import {BatchLogRecordProcessor} from '@opentelemetry/sdk-logs'
import {OTLPLogExporter} from '@opentelemetry/exporter-logs-otlp-http'
import {SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION, DEPLOY_REGION} from '@/lib/config'

export function register() {
  // When Vercel's OTel sidecar collector is active, @vercel/otel sends traces to
  // http://localhost:{port}/v1/traces. We send logs to the same collector so they
  // travel the same path to Datadog. Falls back to standard OTEL_EXPORTER_OTLP_*
  // env vars when running outside Vercel.
  const collectorPort = process.env.VERCEL_OTEL_ENDPOINTS_PORT ?? '4318'
  const logExporter = process.env.VERCEL_OTEL_ENDPOINTS
    ? new OTLPLogExporter({url: `http://localhost:${collectorPort}/v1/logs`})
    : new OTLPLogExporter() // falls back to OTEL_EXPORTER_OTLP_LOGS_ENDPOINT

  registerOTel({
    serviceName: SERVICE_NAME,
    attributes: {
      'deployment.environment': DEPLOY_ENV,
      'service.version': SERVICE_VERSION,
      'deployment.region': DEPLOY_REGION,
    },
    // Note: NEXT_OTEL_FETCH_DISABLED=1 and VERCEL_TRACING_DISABLE_AUTOMATIC_FETCH_INSTRUMENTATION=1
    // are set by Vercel's runtime — fetch propagation is controlled by Vercel, not us.
    logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
  })
}
