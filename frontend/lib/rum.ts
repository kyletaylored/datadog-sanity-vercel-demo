type DDRumWindow = Window & {
  DD_RUM?: {
    addAction(name: string, context: Record<string, unknown>): void
    addError(error: Error, context?: Record<string, unknown>): void
  }
}

export function rumAddAction(name: string, context: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  ;(window as DDRumWindow).DD_RUM?.addAction(name, context)
}

export function rumAddError(error: Error, context?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  ;(window as DDRumWindow).DD_RUM?.addError(error, context)
}
