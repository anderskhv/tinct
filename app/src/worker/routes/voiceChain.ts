import type { VoiceEnv } from './voice'
import { jsonResponse } from '../lib/responses'

type AdminCheck = (env: any, request: Request) => Promise<boolean>
type RateCheck = (key: string, kv?: KVNamespace, max?: number) => Promise<boolean>
const MAX_BODY = 180_000
// Keep provider payloads private; expose only known configuration field names.
const TRANSCRIPTION_PARAMS = new Set([
  'session', 'session.type', 'session.audio', 'session.audio.input',
  'session.audio.input.noise_reduction', 'session.audio.input.noise_reduction.type',
  'session.audio.input.transcription', 'session.audio.input.transcription.model',
  'session.audio.input.transcription.prompt', 'session.audio.input.turn_detection',
  'session.audio.input.turn_detection.type', 'session.audio.input.turn_detection.threshold',
  'session.audio.input.turn_detection.prefix_padding_ms', 'session.audio.input.turn_detection.silence_duration_ms',
  'expires_after', 'expires_after.anchor', 'expires_after.seconds',
])
/** Admin-only experimental chain. No endpoint or model is supplied by the client. */
export async function handleVoiceChain(request: Request, env: VoiceEnv, admin: AdminCheck, rate: RateCheck): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!await admin(env, request)) return jsonResponse({ error: 'Administrator sign-in required' }, 403, request)
  if (!env.OPENAI_API_KEY) return jsonResponse({ error: 'Voice is not configured' }, 503, request)
  if (!await rate('voice-chain:' + (request.headers.get('cf-connecting-ip') || 'admin'), env.RATE_LIMIT, 180)) return jsonResponse({ error: 'Please wait before trying again' }, 429, request)
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return jsonResponse({ error: 'Request too large' }, 413, request)
  let raw = ''
  const reader = request.body?.getReader(), decoder = new TextDecoder()
  if (!reader) return jsonResponse({ error: 'Missing body' }, 400, request)
  let bytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.length
      if (bytes > MAX_BODY) { await reader.cancel(); return jsonResponse({ error: 'Request too large' }, 413, request) }
      raw += decoder.decode(value, { stream: true })
    }
    raw += decoder.decode()
  } finally { reader.releaseLock() }
  let body: any
  try { body = JSON.parse(raw) } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, request) }
  if (!body || typeof body !== 'object') return jsonResponse({ error: 'Invalid request' }, 400, request)
  let endpoint: string, payload: BodyInit, type: string, contentType = 'application/json'
  let transcriptionSession: Record<string, unknown> | undefined
  if (body.action === 'transcription' && typeof body.sdp === 'string' && body.sdp.length < 30_000) {
    transcriptionSession = {
      type: 'transcription',
      audio: { input: {
        noise_reduction: { type: 'near_field' },
        // This chain requires server VAD events and automatic turn commits.
        // gpt-live-transcribe rejected turn_detection in the real preview session.
        transcription: { model: 'gpt-4o-transcribe', prompt: 'A literary conversation about books. Names may include Tim Keller, Bildad, Dostoevsky and biblical figures.' },
        turn_detection: { type: 'server_vad', threshold: 0.6, prefix_padding_ms: 300, silence_duration_ms: 900 },
      } },
    }
    // /calls multipart session accepts RealtimeSessionCreateRequest, not a
    // transcription session. Configure transcription on /client_secrets first.
    endpoint = 'realtime/calls'; payload = body.sdp; contentType = 'application/sdp'; type = 'application/sdp'
  } else if (body.action === 'answer' && typeof body.instructions === 'string' && body.instructions.length <= 65_536 && Array.isArray(body.messages) && body.messages.length <= 100 && Array.isArray(body.tools) && body.tools.length <= 40) {
    // Only client-side function declarations; no arbitrary hosted tools, remote MCP or URLs.
    if (body.tools.some((t: any) => !t || t.type !== 'function' || typeof t.name !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(t.name))) return jsonResponse({ error: 'Invalid tools' }, 400, request)
    if (body.messages.some((m: any) => !m || !(
      (['user', 'assistant'].includes(m.role) && typeof m.content === 'string') ||
      (['function_call', 'function_call_output', 'reasoning', 'web_search_call', 'message'].includes(m.type))
    ))) return jsonResponse({ error: 'Invalid conversation' }, 400, request)
    endpoint = 'responses'; type = 'text/event-stream'
    payload = JSON.stringify({
      model: 'gpt-5.6-sol', reasoning: { effort: 'low' }, store: false, stream: true,
      instructions: body.instructions, input: body.messages,
      tools: [{ type: 'web_search', search_context_size: 'low' }, ...body.tools],
      max_output_tokens: 2000, parallel_tool_calls: false,
      include: ['reasoning.encrypted_content'],
    })
  } else if (body.action === 'speech' && typeof body.text === 'string' && body.text.trim() && body.text.length <= 4000) {
    endpoint = 'audio/speech'; type = 'audio/pcm'
    payload = JSON.stringify({
      model: 'gpt-4o-mini-tts', voice: 'marin', input: body.text,
      response_format: 'pcm', speed: body.pace === 'slow' ? 0.9 : body.pace === 'fast' ? 1.1 : 1,
      instructions: 'Read the provided text exactly. Warm, thoughtful, natural conversation. No additions, interjections, humming or filler sounds. Maintain a steady conversational tone.',
    })
  } else return jsonResponse({ error: 'Invalid voice request' }, 400, request)
  try {
    let credential = env.OPENAI_API_KEY
    if (transcriptionSession) {
      const created = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
        method: 'POST', headers: { Authorization: 'Bearer ' + credential, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expires_after: { anchor: 'created_at', seconds: 60 }, session: transcriptionSession }),
        signal: request.signal,
      })
      const session = await created.json().catch(() => null) as any
      if (!created.ok || typeof session?.value !== 'string') {
        console.error('voice-chain provider error', 'transcription_session', created.status, session?.error?.code, session?.error?.param)
        return jsonResponse({ error: 'Could not create the transcription session.', stage: 'transcription_session', code: String(session?.error?.code || 'session_creation_failed').slice(0, 100), ...(TRANSCRIPTION_PARAMS.has(session?.error?.param) ? { param: session.error.param } : {}) }, 502, request)
      }
      credential = session.value
    }
    const upstream = await fetch('https://api.openai.com/v1/' + endpoint, {
      method: 'POST', headers: { Authorization: 'Bearer ' + credential, ...(contentType ? { 'Content-Type': contentType } : {}) },
      body: payload, signal: request.signal,
    })
    if (!upstream.ok) {
      // Log only provider error classification, never credentials or private conversation.
      const detail = await upstream.json().catch(() => null) as any
      console.error('voice-chain provider error', endpoint, upstream.status, detail?.error?.code, detail?.error?.param)
      return jsonResponse({ error: 'Voice provider could not complete ' + body.action + '. Please try again.', stage: body.action === 'transcription' ? 'transcription_handshake' : body.action, code: String(detail?.error?.code || 'provider_request_failed').slice(0, 100) }, 502, request)
    }
    return new Response(upstream.body, { headers: { 'Content-Type': type, 'Cache-Control': 'no-store' } })
  } catch {
    return jsonResponse({ error: 'Voice connection interrupted. Please try again.' }, 502, request)
  }
}
