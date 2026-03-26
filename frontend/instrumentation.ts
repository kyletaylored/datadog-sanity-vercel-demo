import { registerOTel } from '@vercel/otel'
import { RuntimeNodeInstrumentation } from '@opentelemetry/instrumentation-runtime-node'
import { SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION, DEPLOY_REGION, CLOUD_REGION, GIT_REPO_URL } from '@/lib/config'
import { buildMetricReaders, buildMetricViews } from '@/lib/metrics'

export function register() {
  const metricReaders = buildMetricReaders()

  registerOTel({
    serviceName: SERVICE_NAME,
    attributes: {
      'deployment.environment': DEPLOY_ENV,
      'service.version': SERVICE_VERSION,
      'deployment.region': DEPLOY_REGION,
      'host.name': DEPLOY_REGION,
      'cloud.region': CLOUD_REGION,
      'git.repository_url': GIT_REPO_URL,
    },
    // (experimental) RuntimeNodeInstrumentation collects event loop lag, GC, heap, and CPU metrics.
    metricReaders,
    views: buildMetricViews(),
    instrumentations: metricReaders.length ? [new RuntimeNodeInstrumentation({ monitoringPrecision: 5000 })] : [],
  })
}