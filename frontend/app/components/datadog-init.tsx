'use client'
import {datadogRum} from '@datadog/browser-rum'
import {SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION} from '@/lib/config'

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID!,
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
  site: process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com',
  service: SERVICE_NAME + "-web",
  env: DEPLOY_ENV,
  version: SERVICE_VERSION,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackResources: true,
  trackUserInteractions: true,
  trackLongTasks: true,
  allowedTracingUrls: [(url) => url.includes(window.location.origin)],
  defaultPrivacyLevel: 'mask-user-input',
})

datadogRum.setGlobalContextProperty('app.projectName', SERVICE_NAME)
datadogRum.setGlobalContextProperty(
  'app.gitBranch',
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? 'unknown',
)

export default function DatadogInit() {
  return null
}
