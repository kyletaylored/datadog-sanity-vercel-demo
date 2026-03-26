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
if (typeof window !== 'undefined') {
    const DD_VERSION_KEY = '_dd_app_version'
    const storedVersion = localStorage.getItem(DD_VERSION_KEY)
    if (storedVersion !== null && storedVersion !== SERVICE_VERSION) {
        datadogRum.stopSession()
    }
    localStorage.setItem(DD_VERSION_KEY, SERVICE_VERSION)
}

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
