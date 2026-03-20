'use client'
import {datadogRum} from '@datadog/browser-rum'

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID!,
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
  site: process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com',
  service: process.env.NEXT_PUBLIC_VERCEL_PROJECT_NAME ?? 'martech-pulse',
  env: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
  version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackResources: true,
  trackUserInteractions: true,
  trackLongTasks: true,
  allowedTracingUrls: [(url) => url.includes(window.location.origin)],
  defaultPrivacyLevel: 'mask-user-input',
})

datadogRum.setGlobalContextProperty(
  'app.projectName',
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_NAME ?? 'martech-pulse',
)
datadogRum.setGlobalContextProperty(
  'app.gitBranch',
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? 'unknown',
)

export default function DatadogInit() {
  return null
}
