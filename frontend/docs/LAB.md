# Signal Lab — Route Reference

The Signal Lab at `/lab` provides interactive triggers for every telemetry signal type. All routes live under `/api/lab/`.

## Verifying in Datadog

### APM
- Filter: `resource_name:lab.*`
- Suggested saved view name: "MarTech Pulse — Lab"

### Logs
- Filter: `@event:lab_* @service:martech-pulse`
- Or: `source:vercel @service:martech-pulse`

### Vercel Log Drain Setup
1. Go to Vercel Project → Settings → Log Drains
2. Add a Datadog log drain endpoint
3. All `console.log`/`console.warn`/`console.error` JSON output is forwarded

---

## Routes

### `GET /api/lab/health`

| | |
|---|---|
| Span | `lab.health_check` |
| Log event | `health_check` |

**Response:**
```json
{ "status": "ok", "timestamp": "...", "region": "...", "env": "...", "service": "...", "version": "...", "traceId": "..." }
```

**APM search:** `resource_name:lab.health_check`

---

### `GET /api/lab/env-info`

| | |
|---|---|
| Span | `lab.env_info` |
| Log event | _(none — informational only)_ |

Returns safe Vercel env metadata (no secrets). Used by the Lab sidebar on page load.

---

### `GET /api/lab/cms-fetch`

| | |
|---|---|
| Span | `lab.cms_fetch` (parent) + `sanity.groq_query` (child) |
| Log event | `cms_fetch` with `documentCount` |

Fetches the 5 most recent Sanity posts. Look for the nested `sanity.groq_query` child span in the APM trace flamegraph.

---

### `GET /api/lab/slow-query?delay=<ms>`

| | |
|---|---|
| Span | `lab.slow_query` with `query.delay_ms`, `query.clamped` |
| Log event | `slow_query` (warn level) with `delayMs` |

Delay is clamped to 500–8000ms. Use this to trigger latency-based APM alerts.

**APM search:** `resource_name:lab.slow_query @duration:>2s`

---

### `GET /api/lab/handled-error`

| | |
|---|---|
| Span | `lab.handled_error` — ERROR status set |
| Log event | `handled_error` (error level) |

Returns HTTP 500. The span records the exception via `span.recordException`. Verify in APM error tracking.

---

### `GET /api/lab/unhandled-error`

| | |
|---|---|
| Span | `lab.unhandled_error` — Next.js runtime sets ERROR |
| Log event | _(none — route never completes)_ |

Throws without catching. Check Datadog APM error tracking and Vercel log drain for the uncaught exception.

---

### `GET /api/lab/chain`

| | |
|---|---|
| Span | `lab.chain` (parent) |
| Log event | `chain_request` with `hopCount: 3` |

Makes 3 sequential calls to `/api/lab/health` with W3C `traceparent` propagation. Look for a 4-span trace (1 parent + 3 health children) in APM.

---

### `POST /api/lab/lead-capture`

| | |
|---|---|
| Span | `lab.lead_capture` with `form.fields_submitted` |
| Log event | `lead_capture` with `company`, `interestedIn`, `fieldsCount` |

**Request body:**
```json
{ "name": "Jane", "email": "jane@example.com", "company": "Acme", "interestedIn": "CDP" }
```

Returns 422 for missing name or invalid email — use these to test Datadog error tracking.

---

### `GET /api/lab/campaign-search?q=<query>`

| | |
|---|---|
| Span | `lab.campaign_search` with `search.query_length` |
| Log event | `campaign_search` with `queryLength`, `resultCount` |

Searches Sanity posts by title and body content using GROQ `match` operator.

---

### `POST /api/lab/proxy`

| | |
|---|---|
| Span | `lab.proxy` with `proxy.target_host`, `proxy.inject_latency`, `proxy.force_error` |
| Log event | `proxy_request` with `targetHost`, `statusCode`, `durationMs` |

**Request body:**
```json
{ "url": "https://httpbin.org/json", "injectLatency": false, "forceError": false }
```

**Security controls:**
- Only `http://` and `https://` protocols
- Blocks private/loopback IP ranges (RFC1918, localhost, link-local)
- 100KB response cap
- 10-second timeout via `AbortController`

**Suggested test URLs:**
- `https://httpbin.org/json`
- `https://wttr.in/Austin?format=j1`

---

### `POST /api/lab/log-burst`

| | |
|---|---|
| Span | `lab.log_burst` with `burst.count`, `burst.level` |
| Log event | `log_burst` × N with `burst.sequence` |

**Request body:**
```json
{ "count": 10, "level": "warn" }
```

Count is clamped to 1–50.

---

### `POST /api/lab/custom-attribute`

| | |
|---|---|
| Span | `lab.custom_attribute` |
| Log event | `custom_attribute` with `key` |

**Request body:**
```json
{ "key": "lab.demo.tag", "value": "hello" }
```

Key must match `/^[a-z][a-z0-9_.]{0,63}$/`. The attribute is set on the active span via `span.setAttribute`.

---

### `GET /api/lab/flags`

| | |
|---|---|
| Span | `lab.flags_fetch` |
| Log event | _(none)_ |

Fetches `featureFlag` documents from Sanity. Returns `{ flags: [] }` if the schema type doesn't exist yet.

---

## Suggested Datadog Monitors

| Monitor | Query |
|---|---|
| Lab latency P95 > 3s | `avg:trace.lab.slow_query.duration{service:martech-pulse} > 3s` |
| Handled errors spike | `sum:log_burst.events{@event:handled_error}.as_count() > 5` |
| Log burst volume | `sum:logs.count{@event:log_burst @service:martech-pulse}.as_count() > 100` |
