'use client'

import {useEffect} from 'react'
import {addNextjsError} from '@datadog/browser-rum-nextjs'

// Replaces the root layout when it throws, so it must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {digest?: string}
  reset: () => void
}) {
  useEffect(() => {
    addNextjsError(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div style={{maxWidth: 576, margin: '0 auto', padding: '160px 24px', textAlign: 'center'}}>
          <h2>Something went wrong</h2>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  )
}
