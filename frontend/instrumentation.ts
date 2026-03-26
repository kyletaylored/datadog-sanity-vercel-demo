import { registerOTel } from '@vercel/otel'
import { RuntimeNodeInstrumentation } from '@opentelemetry/instrumentation-runtime-node'
import { SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION, DEPLOY_REGION, HOST_NAME, GIT_REPO_URL } from '@/lib/config'
import { buildMetricReaders, buildMetricViews } from '@/lib/metrics'

export function register() {

  registerOTel({
    serviceName: SERVICE_NAME,
    attributes: {
      'deployment.environment': DEPLOY_ENV,
      'service.version': SERVICE_VERSION,
      'deployment.region': DEPLOY_REGION,
      'host.name': HOST_NAME,
      'git.repository_url': GIT_REPO_URL,
    },

    // (experimental) RuntimeNodeInstrumentation collects event loop, GC, heap, and CPU metrics.
    metricReaders: buildMetricReaders(),
    views: buildMetricViews(),
    instrumentations: ['auto', new RuntimeNodeInstrumentation({ monitoringPrecision: 5000 })],
  })
}