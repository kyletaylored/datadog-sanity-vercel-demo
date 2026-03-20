'use client'

import {rumAddAction, rumAddError} from '@/lib/rum'

export type LabResult<T> = {
  data: T | null
  traceId: string
  durationMs: number
  error: string | null
}

export async function labFetch<T>(
  route: string,
  options?: RequestInit,
): Promise<LabResult<T>> {
  const start = Date.now()
  try {
    const res = await fetch(route, options)
    const durationMs = Date.now() - start
    const traceId = res.headers.get('x-trace-id') ?? ''
    const data = await res.json()
    rumAddAction('lab_trigger', {route, traceId, durationMs, status: res.status})
    if (!res.ok) {
      return {data: null, traceId, durationMs, error: data?.error ?? `HTTP ${res.status}`}
    }
    return {data, traceId, durationMs, error: null}
  } catch (err) {
    const durationMs = Date.now() - start
    const error = err instanceof Error ? err : new Error(String(err))
    rumAddError(error, {route})
    return {data: null, traceId: '', durationMs, error: error.message}
  }
}
