'use client'
import dynamic from 'next/dynamic'

// swagger-ui-react uses browser APIs — load client-side only
const SwaggerUIClient = dynamic(() => import('./SwaggerUI'), {ssr: false})

export default function ApiDocsClient() {
  return <SwaggerUIClient url="/api/openapi" />
}
