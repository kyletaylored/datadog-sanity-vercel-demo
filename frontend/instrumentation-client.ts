// Runs in the browser before hydration (Next.js >= 15.3 `instrumentation-client` convention).
// See https://docs.datadoghq.com/integrations/rum-next-plugin/
import {datadogRum} from '@datadog/browser-rum'
import {datadogLogs} from '@datadog/browser-logs'
import {nextjsPlugin, onRouterTransitionStart} from '@datadog/browser-rum-nextjs'
import {SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION} from '@/lib/config'

// Next.js calls this on every App Router client-side navigation.
export {onRouterTransitionStart}

const rumService = SERVICE_NAME + '-web'

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID!,
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
  site: process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com',
  service: rumService,
  env: DEPLOY_ENV,
  version: SERVICE_VERSION,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackResources: true,
  trackUserInteractions: true,
  trackLongTasks: true,
  allowedTracingUrls: [(url) => url.startsWith(window.location.origin)],
  defaultPrivacyLevel: 'mask-user-input',
  // View names come from <DatadogAppRouter /> (e.g. /posts/[slug]) instead of raw URLs.
  plugins: [nextjsPlugin()],
  beforeSend: (event) => {
    if (event.type === 'resource' && (event.resource.status_code ?? 0) >= 500) {
      datadogRum.addError(
        new Error(`HTTP ${event.resource.status_code}: ${event.resource.url}`),
        {url: event.resource.url, status: event.resource.status_code},
      )
    }
    return true
  },
})

datadogRum.setGlobalContextProperty('app.projectName', SERVICE_NAME)
datadogRum.setGlobalContextProperty(
  'app.gitBranch',
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? 'unknown',
)

// Stop the RUM session when the app version changes so the new session starts
// with a consistent version tag. Without this, a long-lived session spans
// multiple deploys and accumulates multiple version values.
const DD_VERSION_KEY = '_dd_app_version'
try {
  const storedVersion = localStorage.getItem(DD_VERSION_KEY)
  if (storedVersion !== null && storedVersion !== SERVICE_VERSION) {
    datadogRum.stopSession()
  }
  localStorage.setItem(DD_VERSION_KEY, SERVICE_VERSION)
} catch {
  // localStorage unavailable (private mode / blocked storage)
}

datadogLogs.init({
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
  site: process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com',
  service: rumService,
  env: DEPLOY_ENV,
  version: SERVICE_VERSION,
  // v7: forwardErrorsToLogs only covers unhandled errors; keep console.error forwarding explicitly.
  forwardErrorsToLogs: true,
  forwardConsoleLogs: ['error'],
  sessionSampleRate: 100,
})
