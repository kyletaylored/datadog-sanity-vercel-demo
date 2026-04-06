import {PeriodicExportingMetricReader, AggregationType, InstrumentType} from '@opentelemetry/sdk-metrics'
import {OTLPMetricExporter, AggregationTemporalityPreference} from '@opentelemetry/exporter-metrics-otlp-http'

/**
 * Views to apply to the MeterProvider. Drops histogram instruments because
 * Datadog's OTLP metrics intake rejects histogram metric types entirely.
 * RuntimeNodeInstrumentation's event loop delay and GC pause histograms
 * are silently dropped; their gauge/counter equivalents still flow through.
 *
 * Returned as a function (not a top-level constant) to avoid Turbopack ESM
 * interop issues where enums aren't resolved at module evaluation time.
 */
export function buildMetricViews() {
  return [
    {aggregation: {type: AggregationType.DROP}, instrumentType: InstrumentType.HISTOGRAM},
  ]
}

/**
 * Builds the OTLP metric readers for use with registerOTel.
 * Returns an empty array when DATADOG_API_KEY is not set.
 *
 * Note: PeriodicExportingMetricReader works best on warm instances —
 * cold starts may not flush before the function exits.
 */
export function buildMetricReaders(): PeriodicExportingMetricReader[] {
  const ddApiKey = process.env.DATADOG_API_KEY
  if (!ddApiKey) return []

  const ddSite = process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com'
  // On Vercel, use the integration endpoint — no dd-otlp-source header required.
  const ddBase = process.env.VERCEL
    ? `https://vercel.integrations.otlp.${ddSite}`
    : `https://otlp.${ddSite}`
  const headers: Record<string, string> = {'dd-api-key': ddApiKey}
  if (!process.env.VERCEL && process.env.DD_OTLP_SOURCE) {
    headers['dd-otlp-source'] = process.env.DD_OTLP_SOURCE
  }

  return [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${ddBase}/v1/metrics`,
        headers,
        // Datadog rejects cumulative sums — delta required.
        temporalityPreference: AggregationTemporalityPreference.DELTA,
      }),
      exportIntervalMillis: 30_000,
    }),
  ]
}
