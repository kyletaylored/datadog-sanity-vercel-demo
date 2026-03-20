export function rumAddAction(name: string, context: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  ;(window as any).DD_RUM?.addAction(name, context)
}

export function rumAddError(error: Error, context?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  ;(window as any).DD_RUM?.addError(error, context)
}
