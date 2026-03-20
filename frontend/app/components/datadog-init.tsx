"use client";

import { datadogRum } from "@datadog/browser-rum";

datadogRum.init({
    applicationId: 'd75cdf34-3db3-4467-bd86-1330834806c3',
    clientToken: 'puba7d8ea2c37c5a8bce3014c096576c8eb',
    site: 'datadoghq.com',
    service: 'nextjs-sanity-demo',
    env: 'prod',
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackResources: true,
    trackUserInteractions: true,
    trackLongTasks: true,
    allowedTracingUrls: [(url) => url.includes(window.location.origin)],
    defaultPrivacyLevel: 'mask-user-input',
});

export default function DatadogInit() {
    return null;
}

