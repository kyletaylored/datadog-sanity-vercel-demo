import { registerOTel } from '@vercel/otel'
import { SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION, DEPLOY_REGION, GIT_REPO_URL } from '@/lib/config'

export function register() {
  // Vercel runs an OTel sidecar collector at localhost:4318 when VERCEL_OTEL_ENDPOINTS is set.
  // @vercel/otel sends traces there automatically. Logs are NOT forwarded by the sidecar
  // (it has no Datadog logs endpoint configured) — logs reach Datadog via the console
  // log drain instead.
  registerOTel({
    serviceName: SERVICE_NAME,
    attributes: {
      'deployment.environment': DEPLOY_ENV,
      'service.version': SERVICE_VERSION,
      'deployment.region': DEPLOY_REGION,
      'git.repository_url': GIT_REPO_URL,
    },
  })
}