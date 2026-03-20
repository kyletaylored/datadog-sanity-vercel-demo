'use client'

import {useEffect} from 'react'
import {rumAddError} from '@/lib/rum'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {digest?: string}
  reset: () => void
}) {
  useEffect(() => {
    rumAddError(error, {digest: error.digest})
  }, [error])

  return (
    <div className="container mx-auto max-w-xl px-6 py-40 text-center">
      <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-8 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-full px-6 py-3 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
