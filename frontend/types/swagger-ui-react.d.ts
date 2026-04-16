declare module 'swagger-ui-react' {
  import type {ComponentType} from 'react'

  interface SwaggerUIProps {
    url?: string
    spec?: Record<string, unknown>
    docExpansion?: 'list' | 'full' | 'none'
    defaultModelsExpandDepth?: number
    tryItOutEnabled?: boolean
    deepLinking?: boolean
    filter?: boolean | string
    layout?: string
    persistAuthorization?: boolean
    requestInterceptor?: (req: object) => object
    responseInterceptor?: (res: object) => object
    onComplete?: () => void
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>
  export default SwaggerUI
}

declare module 'swagger-ui-react/swagger-ui.css'
