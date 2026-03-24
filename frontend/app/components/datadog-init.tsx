'use client'
import { datadogRum } from '@datadog/browser-rum'
import { datadogLogs } from '@datadog/browser-logs';
import { SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION } from '@/lib/config'

const rumService = SERVICE_NAME + "-web"

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
    allowedTracingUrls: [(url) => url.includes(window.location.origin)],
    defaultPrivacyLevel: 'mask-user-input',
})

datadogRum.setGlobalContextProperty('app.projectName', SERVICE_NAME)
datadogRum.setGlobalContextProperty(
    'app.gitBranch',
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? 'unknown',
)

// Datadog Logs initialization
datadogLogs.init({
    clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
    site: process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com',
    service: rumService,
    env: DEPLOY_ENV,
    version: SERVICE_VERSION,
    forwardErrorsToLogs: true,
    sessionSampleRate: 100,
})

export default function DatadogInit() {
    return null
}
