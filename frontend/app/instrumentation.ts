import {registerOTel} from '@vercel/otel'
import {BatchLogRecordProcessor} from '@opentelemetry/sdk-logs'
import {OTLPLogExporter} from '@opentelemetry/exporter-logs-otlp-http'
import {SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION, DEPLOY_REGION} from '@/lib/config'

export function register() {
  registerOTel({
    serviceName: SERVICE_NAME,
    attributes: {
      'deployment.environment': DEPLOY_ENV,
      'service.version': SERVICE_VERSION,
      'deployment.region': DEPLOY_REGION,
    },
    // Propagate trace context to all outgoing fetch requests so chained
    // calls and Sanity fetches appear as child spans in Datadog APM.
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: ['*'],
      },
    },
    // Export log records via OTLP — same infrastructure as traces.
    // Vercel's Datadog integration configures OTEL_EXPORTER_OTLP_ENDPOINT automatically.
    logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
  })
}
