import {registerOTel} from '@vercel/otel'

export function register() {
  registerOTel({
    serviceName: process.env.VERCEL_PROJECT_NAME ?? 'martech-pulse',
    attributes: {
      'deployment.environment': process.env.VERCEL_ENV ?? 'development',
      'service.version': process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      'deployment.region': process.env.VERCEL_REGION ?? 'unknown',
    },
  })
}
