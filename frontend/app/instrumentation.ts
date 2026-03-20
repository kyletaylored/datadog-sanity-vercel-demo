import {registerOTel} from '@vercel/otel'
import {BatchLogRecordProcessor} from '@opentelemetry/sdk-logs'
import {OTLPLogExporter} from '@opentelemetry/exporter-logs-otlp-http'

export function register() {
  registerOTel({
    serviceName: process.env.VERCEL_PROJECT_NAME ?? 'martech-pulse',
    attributes: {
      'deployment.environment': process.env.VERCEL_ENV ?? 'development',
      'service.version': process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      'deployment.region': process.env.VERCEL_REGION ?? 'unknown',
    },
    // Export log records via OTLP — same infrastructure as traces.
    // Vercel's Datadog integration configures OTEL_EXPORTER_OTLP_ENDPOINT automatically.
    logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
  })
}
