/** Provider diagnostics deliberately exclude prompts, bodies, users and keys. */
const ERROR_TYPES = new Set([
  'invalid_request_error', 'authentication_error', 'permission_error', 'not_found_error',
  'request_too_large', 'rate_limit_error', 'api_error', 'overloaded_error',
])
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504, 529])
export const CHAT_HEADERS_TIMEOUT_MS = 30_000
export const CHAT_STREAM_IDLE_MS = 30_000
const MAX_RETRY_DELAY_MS = 2_000

export function providerErrorType(body: unknown): string {
  const error = body && typeof body === 'object' ? (body as { error?: unknown }).error : null
  const type = error && typeof error === 'object' ? (error as { type?: unknown }).type : null
  return typeof type === 'string' && ERROR_TYPES.has(type) ? type : 'upstream_error'
}

/** Classify invalid-request shape without retaining the provider message. */
function invalidRequestClass(body: unknown): string | null {
  const error = body && typeof body === 'object' ? (body as { error?: unknown }).error : null
  const message = error && typeof error === 'object' ? (error as { message?: unknown }).message : null
  if (typeof message !== 'string') return null
  const text = message.toLowerCase()
  if (text.includes('tool_use_id')) return 'tool_use_id'
  if (text.includes('tool_result')) return 'tool_result'
  if (text.includes('cache_control')) return 'cache_control'
  if (text.includes('tool_choice')) return 'tool_choice'
  if (text.includes('tools')) return 'tools'
  if (text.includes('messages')) return 'messages'
  if (text.includes('token') || text.includes('context')) return 'token_or_context'
  return 'other'
}

export function safeChatError(type = 'upstream_error') {
  const busy = type === 'rate_limit_error' || type === 'overloaded_error'
  const unavailable = type === 'authentication_error' || type === 'permission_error'
  return {
    type: 'error',
    error: {
      type,
      message: busy ? 'The reading companion is busy. Please try again in a moment.'
        : unavailable ? 'The reading companion is temporarily unavailable. Please try again later.'
          : 'The reply was interrupted. Please try again.',
    },
  }
}

export function logChatFailure(
  phase: 'http' | 'network' | 'stream' | 'route',
  type: string,
  response?: Response,
  extra?: { attempt?: number; retry?: boolean; partial_text?: boolean; invalid_request_class?: string | null },
): void {
  const id = response?.headers.get('request-id')
  console.warn(JSON.stringify({
    event: 'chat_upstream_failure', provider: 'anthropic', phase,
    status: response?.status ?? null,
    request_id: id && /^[A-Za-z0-9_-]{1,200}$/.test(id) ? id : null,
    error_type: type,
    ...extra,
  }))
}

export class ChatUpstreamError extends Error {
  constructor(public readonly errorType: string, public readonly status = 502) {
    super('Chat upstream failed')
  }
}

/** Bound each read as well as fetch headers; an open but stalled body must finish. */
export async function readChatChunk(reader: ReadableStreamDefaultReader<Uint8Array>) {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      reader.read(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new ChatUpstreamError('upstream_timeout', 504)), CHAT_STREAM_IDLE_MS)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

/** Error bodies can be HTML, malformed or huge. Never log them or pass them through. */
async function errorBody(response: Response): Promise<unknown> {
  if (!response.body) return null
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  let bytes = 0
  try {
    while (true) {
      const { done, value } = await readChatChunk(reader)
      if (done) return JSON.parse(text + decoder.decode())
      bytes += value.byteLength
      if (bytes > 16_384) return null
      text += decoder.decode(value, { stream: true })
    }
  } catch {
    return null
  } finally {
    void reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

function retryDelay(response: Response): number | null {
  const header = response.headers.get('retry-after')
  if (!header) return 350
  const seconds = Number(header)
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - Date.now()
  // Respect a long provider cooldown by returning an error instead of retrying early.
  return Number.isFinite(delay) && delay <= MAX_RETRY_DELAY_MS ? Math.max(0, delay) : null
}

export async function fetchChatUpstream(apiKey: string, payload: Record<string, unknown>, allowRetry = true): Promise<Response> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), CHAT_HEADERS_TIMEOUT_MS)
    let response: Response
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
    } catch {
      const type = controller.signal.aborted ? 'upstream_timeout' : 'upstream_connection_error'
      logChatFailure('network', type, undefined, { attempt, retry: false })
      // An ambiguous transport failure may have been accepted; never replay it.
      throw new ChatUpstreamError(type, controller.signal.aborted ? 504 : 502)
    } finally {
      clearTimeout(timer)
    }
    if (response.ok) return response
    const body = await errorBody(response)
    const type = providerErrorType(body)
    const delay = retryDelay(response)
    const retry = allowRetry && attempt === 1 && RETRY_STATUSES.has(response.status) && delay !== null
    logChatFailure('http', type, response, {
      attempt, retry,
      invalid_request_class: type === 'invalid_request_error' ? invalidRequestClass(body) : null,
    })
    if (retry) {
      await new Promise(resolve => setTimeout(resolve, delay!))
      continue
    }
    // Provider authentication failures are not the reader's authentication failures.
    const status = response.status === 429 || response.status === 529 ? 503 : 502
    return Response.json(safeChatError(type), { status })
  }
  throw new ChatUpstreamError('upstream_error')
}
