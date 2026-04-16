import {NextResponse} from 'next/server'

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'Datadog + Vercel Demo API',
    version: '1.0.0',
    description:
      'Signal Lab API — all routes create named OTel spans and emit structured JSON logs. Responses include a `traceId` field that can be used to look up the trace in Datadog APM.',
  },
  tags: [
    {name: 'Signal Lab', description: 'API endpoints for generating observability signals'},
    {name: 'Errors', description: 'Handled and unhandled error simulations for Error Tracking'},
    {name: 'OTLP Direct', description: 'Direct OTLP ingestion bypassing the Vercel sidecar'},
    {name: 'Auth', description: 'Session-based authentication'},
    {name: 'Forms', description: 'Lead capture form submissions'},
  ],
  paths: {
    '/api/lab/health': {
      get: {
        tags: ['Signal Lab'],
        summary: 'Health check',
        description: 'Basic liveness probe. Returns service metadata and a fresh trace ID.',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {type: 'string', example: 'ok'},
                    timestamp: {type: 'string', format: 'date-time'},
                    region: {type: 'string', example: 'iad1'},
                    env: {type: 'string', example: 'production'},
                    service: {type: 'string'},
                    version: {type: 'string'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/env-info': {
      get: {
        tags: ['Signal Lab'],
        summary: 'Deployment metadata',
        description: 'Returns current deployment context: environment, region, git commit, and branch.',
        responses: {
          '200': {
            description: 'Deployment info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    projectName: {type: 'string'},
                    env: {type: 'string', example: 'production'},
                    region: {type: 'string', example: 'iad1'},
                    gitCommitSha: {type: 'string'},
                    gitBranch: {type: 'string'},
                    gitRepoUrl: {type: 'string', nullable: true},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/slow-query': {
      get: {
        tags: ['Signal Lab'],
        summary: 'Slow query simulation',
        description: 'Simulates a slow database query with a configurable delay. Useful for testing APM latency dashboards and P99 alerts.',
        parameters: [
          {
            name: 'delay',
            in: 'query',
            description: 'Delay in milliseconds (clamped to 500–8000)',
            schema: {type: 'integer', default: 2000, minimum: 500, maximum: 8000},
          },
        ],
        responses: {
          '200': {
            description: 'Query completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    requestedDelayMs: {type: 'integer'},
                    actualDelayMs: {type: 'integer'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/chain': {
      get: {
        tags: ['Signal Lab'],
        summary: 'Chained span demo',
        description: 'Makes three sequential HTTP requests back to the health endpoint with W3C trace context propagation, producing a multi-hop trace.',
        responses: {
          '200': {
            description: 'Chain completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    hops: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          url: {type: 'string'},
                          status: {type: 'integer'},
                          durationMs: {type: 'integer'},
                        },
                      },
                    },
                    totalDurationMs: {type: 'integer'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/cms-fetch': {
      get: {
        tags: ['Signal Lab'],
        summary: 'CMS fetch',
        description: 'Fetches the latest posts from Sanity CMS. Produces a trace with an external GROQ query span.',
        responses: {
          '200': {
            description: 'CMS documents',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    documents: {type: 'array', items: {type: 'object'}},
                    count: {type: 'integer'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/campaign-search': {
      get: {
        tags: ['Signal Lab'],
        summary: 'Campaign search',
        description: 'Searches Sanity CMS for campaigns matching a query string. Adds `search.query` and `search.result_count` to the span.',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'Search query (max 100 chars)',
            schema: {type: 'string', maxLength: 100},
          },
        ],
        responses: {
          '200': {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: {type: 'array', items: {type: 'object'}},
                    resultCount: {type: 'integer'},
                    query: {type: 'string'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/flags': {
      get: {
        tags: ['Signal Lab'],
        summary: 'Feature flags',
        description: 'Returns feature flag state from Sanity CMS.',
        responses: {
          '200': {
            description: 'Feature flags',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    flags: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          key: {type: 'string'},
                          label: {type: 'string'},
                          enabled: {type: 'boolean'},
                          description: {type: 'string'},
                        },
                      },
                    },
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/proxy': {
      post: {
        tags: ['Signal Lab'],
        summary: 'HTTP proxy',
        description: 'Proxies an outbound HTTP request with optional latency injection and error simulation. Body is truncated to 50 KB.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['url'],
                properties: {
                  url: {type: 'string', description: 'Target URL (http/https only)'},
                  injectLatency: {type: 'boolean', default: false},
                  forceError: {type: 'boolean', default: false},
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Proxy response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {type: 'integer'},
                    contentType: {type: 'string'},
                    bodySizeBytes: {type: 'integer'},
                    body: {type: 'string'},
                    durationMs: {type: 'integer'},
                    targetHost: {type: 'string'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/log-burst': {
      post: {
        tags: ['Signal Lab'],
        summary: 'Log burst',
        description: 'Emits a batch of structured log records at the specified severity level.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  count: {type: 'integer', default: 5, minimum: 1, maximum: 50},
                  level: {type: 'string', enum: ['info', 'warn', 'error'], default: 'info'},
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Logs emitted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    emitted: {type: 'integer'},
                    level: {type: 'string'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/custom-attribute': {
      post: {
        tags: ['Signal Lab'],
        summary: 'Custom span attribute',
        description: 'Sets a custom key/value attribute on the active span. Key must match `^[a-z][a-z0-9_.]{0,63}$`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['key'],
                properties: {
                  key: {type: 'string', pattern: '^[a-z][a-z0-9_.]{0,63}$'},
                  value: {type: 'string'},
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Attribute set',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    key: {type: 'string'},
                    value: {type: 'string'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/runtime-metrics': {
      get: {
        tags: ['Signal Lab'],
        summary: 'Node.js runtime metrics',
        description: 'Returns a snapshot of Node.js runtime metrics: memory, CPU, heap spaces, event loop delay, and GC stats.',
        responses: {
          '200': {
            description: 'Runtime metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    memory: {type: 'object'},
                    cpu: {type: 'object'},
                    heap: {type: 'object'},
                    heap_spaces: {type: 'array', items: {type: 'object'}},
                    event_loop: {type: 'object'},
                    gc: {type: 'object'},
                    process: {type: 'object'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/lambda-context': {
      get: {
        tags: ['Signal Lab'],
        summary: 'AWS Lambda context',
        description: 'Queries the AWS Lambda Runtime API to return invocation context: ARN, X-Ray trace ID, request ID, and deadline. Only available when `AWS_LAMBDA_METADATA_API` is set.',
        responses: {
          '200': {
            description: 'Lambda context (available or unavailable)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    available: {type: 'boolean'},
                    arn: {type: 'string', nullable: true},
                    arn_parsed: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        partition: {type: 'string'},
                        region: {type: 'string'},
                        account_id: {type: 'string'},
                        function_name: {type: 'string'},
                        qualifier: {type: 'string'},
                      },
                    },
                    request_id: {type: 'string', nullable: true},
                    trace_id: {type: 'string', nullable: true},
                    trace_id_parsed: {type: 'object', nullable: true},
                    deadline_ms: {type: 'integer', nullable: true},
                    deadline_utc: {type: 'string', nullable: true},
                    runtime_api: {type: 'string', nullable: true},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/debug-env': {
      post: {
        tags: ['Signal Lab'],
        summary: 'Debug environment',
        description: 'Returns filtered, non-sensitive environment variables. Requires the `DEBUG_SECRET` env var to be set and matched.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  password: {type: 'string'},
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Filtered env vars',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    env: {type: 'object', additionalProperties: {type: 'string'}},
                    redacted: {type: 'string'},
                  },
                },
              },
            },
          },
          '401': {description: 'Wrong password'},
        },
      },
    },
    '/api/lab/handled-error': {
      get: {
        tags: ['Errors'],
        summary: 'Handled error (generic)',
        description: 'Throws a caught error, sets `error.*` span attributes for Datadog Error Tracking, and returns a 500 with the error details.',
        responses: {
          '500': {
            description: 'Handled error response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {type: 'string'},
                    message: {type: 'string'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/unhandled-error': {
      get: {
        tags: ['Errors'],
        summary: 'Unhandled error (generic)',
        description: 'Throws without a try/catch. Next.js catches it and returns a 500. The span is marked as error before the throw.',
        responses: {
          '500': {description: 'Unhandled error — no JSON body'},
        },
      },
    },
    '/api/lab/error/type-error': {
      get: {
        tags: ['Errors'],
        summary: 'Handled TypeError',
        description: 'Dereferences a null value to produce a TypeError, catches it, and returns error tracking attributes.',
        responses: {
          '500': {
            description: 'TypeError',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {type: 'string'},
                    type: {type: 'string', example: 'TypeError'},
                    message: {type: 'string'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/error/syntax-error': {
      get: {
        tags: ['Errors'],
        summary: 'Handled SyntaxError',
        description: 'Calls `JSON.parse` on malformed input to produce a SyntaxError.',
        responses: {
          '500': {
            description: 'SyntaxError',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {type: 'string'},
                    type: {type: 'string', example: 'SyntaxError'},
                    message: {type: 'string'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/error/custom-error': {
      get: {
        tags: ['Errors'],
        summary: 'Handled custom error',
        description: 'Throws a `DatabaseConnectionError` (custom class) with `code` and `host` span attributes for richer grouping in Error Tracking.',
        responses: {
          '500': {
            description: 'DatabaseConnectionError',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {type: 'string'},
                    type: {type: 'string', example: 'DatabaseConnectionError'},
                    message: {type: 'string'},
                    code: {type: 'string'},
                    host: {type: 'string'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/error/range-error': {
      get: {
        tags: ['Errors'],
        summary: 'Handled RangeError',
        description: 'Triggers a stack overflow via infinite recursion to produce a RangeError.',
        responses: {
          '500': {
            description: 'RangeError',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {type: 'string'},
                    type: {type: 'string', example: 'RangeError'},
                    message: {type: 'string'},
                    stack_truncated: {type: 'boolean'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/error/async-error': {
      get: {
        tags: ['Errors'],
        summary: 'Handled async error',
        description: 'Simulates an async rejection and wraps it using `Error(…, { cause })` to produce a cause chain visible in Datadog.',
        responses: {
          '500': {
            description: 'Chained async error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {type: 'string'},
                    type: {type: 'string'},
                    message: {type: 'string'},
                    cause: {type: 'string'},
                    traceId: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/error/unhandled-type-error': {
      get: {
        tags: ['Errors'],
        summary: 'Unhandled TypeError',
        description: 'Throws a TypeError without try/catch. Next.js catches and returns 500.',
        responses: {
          '500': {description: 'Unhandled TypeError — no JSON body'},
        },
      },
    },
    '/api/lab/error/unhandled-custom-error': {
      get: {
        tags: ['Errors'],
        summary: 'Unhandled custom error',
        description: 'Throws `UpstreamServiceError` with `upstream.service` and `upstream.status_code` span attributes, without catching it.',
        responses: {
          '500': {description: 'Unhandled UpstreamServiceError — no JSON body'},
        },
      },
    },
    '/api/lab/otel-direct': {
      get: {
        tags: ['OTLP Direct'],
        summary: 'Direct OTLP test',
        description:
          'Sends a trace, log, and metric directly to Datadog OTLP intake (and the Vercel sidecar if `VERCEL_OTEL_ENDPOINTS` is set). On Vercel uses `vercel.integrations.otlp.*`; locally falls back to `otlp.*` with `dd-otlp-source`.',
        responses: {
          '200': {
            description: 'OTLP submission results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sidecar: {
                      type: 'object',
                      properties: {
                        available: {type: 'boolean'},
                        traceId: {type: 'string'},
                        traces: {type: 'object'},
                        logs: {type: 'object'},
                      },
                    },
                    datadog: {
                      type: 'object',
                      properties: {
                        available: {type: 'boolean'},
                        endpoint: {type: 'string'},
                        traceId: {type: 'string'},
                        vercelIntegration: {type: 'boolean'},
                        traces: {type: 'object'},
                        logs: {type: 'object'},
                        metrics: {type: 'object'},
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lab/otlp-logs': {
      post: {
        tags: ['OTLP Direct'],
        summary: 'Direct OTLP log',
        description: 'Sends a single log record directly to Datadog OTLP logs intake. Includes trace context from the active span for log–trace correlation.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {type: 'string', default: 'Direct OTLP log test from Signal Lab'},
                  level: {type: 'string', enum: ['info', 'warn', 'error'], default: 'info'},
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Log submitted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    endpoint: {type: 'string'},
                    vercelIntegration: {type: 'boolean'},
                    status: {type: 'integer'},
                    ok: {type: 'boolean'},
                    response: {type: 'string'},
                    message: {type: 'string'},
                    level: {type: 'string'},
                  },
                },
              },
            },
          },
          '400': {description: 'DATADOG_API_KEY not set'},
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Creates a session cookie and returns user info with a Gravatar avatar URL derived from the email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: {type: 'string', format: 'email'},
                  name: {type: 'string'},
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: {type: 'string'},
                    name: {type: 'string'},
                    avatarUrl: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        description: 'Clears the session cookie.',
        responses: {
          '200': {
            description: 'Session cleared',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {ok: {type: 'boolean', example: true}},
                },
              },
            },
          },
        },
      },
    },
    '/api/forms/lead': {
      post: {
        tags: ['Forms'],
        summary: 'Lead capture',
        description: 'Saves a lead form submission to Sanity CMS. Requires `SANITY_API_WRITE_TOKEN`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: {type: 'string'},
                  email: {type: 'string', format: 'email'},
                  company: {type: 'string'},
                  interestedIn: {type: 'string'},
                  message: {type: 'string'},
                  source: {type: 'string'},
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Lead saved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {success: {type: 'boolean'}},
                },
              },
            },
          },
          '400': {description: 'Validation error'},
          '500': {description: 'Write token not set or Sanity error'},
        },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(spec, {
    headers: {'Cache-Control': 'public, max-age=3600'},
  })
}
