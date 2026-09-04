import { apiUrl } from '../utils/apiUrl'
import { nearbyParagraphWindow } from '../voice/context'

export interface LabTalkContext {
  bookTitle: string
  bookAuthor: string
  chapterLabel: string
  chapterNumber?: number
  editionLabel?: string
  paragraphs: string[]
  paragraphIndex: number
  readingAngle?: string
}

export const ASK_COMPANION_TOOL = 'ask_companion'

export const LAB_ASK_COMPANION_TOOL = {
  type: 'function',
  name: ASK_COMPANION_TOOL,
  description: 'Ask Tinct\'s reading companion for a spoiler-safe book answer. Use only for meaning, theology, who, why, argument, comparison, or character. Call it immediately and stay silent until it returns. Never use it for skip, speed, next chapter, resume, play, or tiny confirms.',
  parameters: {
    type: 'object',
    properties: {
      question: { type: 'string', description: 'The reader\'s book question.' },
    },
    required: ['question'],
    additionalProperties: false,
  },
} as const

const PLAYBACK_COMMAND = /\b(go\s+faster|go\s+slower|speed\s+up|slow\s+down|faster|slower|\d+(\.\d+)?\s*x|next\s+chapter|previous\s+chapter|restart(\s+this)?\s+chapter|chapter\s+from\s+the\s+beginning|start\s+(this\s+)?chapter\s+again|skip(\s+(ahead|forward|back|this))?\b|next\s+paragraph|previous\s+paragraph|resume|continue|keep\s+going|back\s+to\s+the\s+book|play|pause|talk\s+slower|talk\s+faster|slower\s+please)\b/i

const HARD_QUESTION = /\b(what does (this|that|it) mean|mean(ing)?|theology|theological|compar(e|ison)|character|argument|who (is|are|was|were)|why (does|is|did|would|are)|theme|symbol|foreshadow|explain|interpret|notice|echo|remind|connect|parallel|resonat(e|es)|like\s+\w+|between\s+\w+\s+and)\b/i

const LITERARY_CONNECTION = /\b(echo|remind|connect|parallel|resonat(e|es)|like\s+\w+|between\s+\w+\s+and|how\s+does\s+this|what\s+does\s+this\s+have\s+to\s+do)\b/i

const TINY_CONFIRM = /^(ok|okay|yes|yeah|yep|no|nope|thanks|thank you|mm+|mhm|uh huh|got it|sure)\.?$/i

export const SPEAK_COMPANION_VERBATIM = 'Speak only the answer below, once, as your own complete answer. Do not add praise, a greeting, a preamble, a summary, or a description of your process. Do not mention tools, models, retrieval, waiting, or cutoffs.'

export function isLabPlaybackUtterance(text: string): boolean {
  return PLAYBACK_COMMAND.test(text.trim())
}

/**
 * Cost gate: only hard book questions hop to Claude.
 * Playback, greetings, and thin confirms stay on Realtime.
 */
export function shouldEscalateToCompanion(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  if (TINY_CONFIRM.test(trimmed)) return false
  if (isLabPlaybackUtterance(trimmed) && !HARD_QUESTION.test(trimmed) && !LITERARY_CONNECTION.test(trimmed)) return false
  return HARD_QUESTION.test(trimmed) || LITERARY_CONNECTION.test(trimmed) || trimmed.length > 48
}

export function parseAskCompanionArguments(raw?: string): { question: string } {
  if (!raw) return { question: '' }
  try {
    const parsed = JSON.parse(raw) as { question?: unknown }
    return { question: typeof parsed.question === 'string' ? parsed.question.trim() : '' }
  } catch {
    return { question: raw.trim() }
  }
}

export function playbackToolForUtterance(text: string): string {
  if (/\b(restart(\s+this)?\s+chapter|chapter\s+from\s+the\s+beginning|start\s+(this\s+)?chapter\s+again|play\s+(this\s+)?chapter\s+from\s+the\s+beginning)\b/i.test(text)) return 'restart_chapter'
  if (/\b(next\s+chapter)\b/i.test(text)) return 'next_chapter'
  if (/\b(previous\s+chapter)\b/i.test(text)) return 'previous_chapter'
  if (/\b(talk\s+slower|slower\s+please|talk\s+faster)\b/i.test(text)) return 'set_assistant_pace'
  if (/\b(resume|continue|keep\s+going|back\s+to\s+the\s+book|play)\b/i.test(text)) return 'resume_audiobook'
  if (/\b(previous\s+paragraph|skip\s+back|go\s+back)\b/i.test(text)) return 'previous_paragraph'
  if (/\b(skip|next\s+paragraph)\b/i.test(text)) return 'next_paragraph'
  return 'set_playback_speed'
}

export function playbackArgsForUtterance(text: string): Record<string, unknown> {
  if (/\b(talk\s+slower|slower\s+please)\b/i.test(text)) return { pace: 'slow' }
  if (/\b(talk\s+faster)\b/i.test(text)) return { pace: 'fast' }
  if (/\b(previous\s+paragraph|skip\s+back|go\s+back)\b/i.test(text) && /\b(back|previous)\b/i.test(text)) {
    return {}
  }
  if (/\b(slow|slower)\b/i.test(text)) return { rate: 0.75 }
  if (/\b(fast|faster|speed\s+up)\b/i.test(text)) return { rate: 1.5 }
  return {}
}

export function buildLabTalkInstructions(input: LabTalkContext): string {
  const last = Math.max(0, input.paragraphs.length - 1)
  const idx = Math.max(0, Math.min(last, input.paragraphIndex))
  const current = (input.paragraphs[idx] || '').replace(/\s+/g, ' ').trim()
  const nearby = nearbyParagraphWindow(input.paragraphs, idx)
  const edition = input.editionLabel || 'Butler'
  const lines = [
    `You are Tinct's concise reading companion beside the page on /lab. You listen, handle barge-in, and run playback tools.`,
    `Do not greet. Do not say hello. The app speaks the opening line.`,
    `Playback stays instant. For go faster, slower, skip, next chapter, previous chapter, next or previous paragraph, resume, or play, call the matching playback tool immediately. Never call ${ASK_COMPANION_TOOL} for those. Tiny confirms you answer yourself in one short line.`,
    `Easy questions you can answer from the passage already below, answer directly in one or two natural sentences. Reasonable literary connections to other books, authors, or traditions are welcome when they stay within what the reader could know from this chapter — no spoilers from later in the book.`,
    `When the turn is a substantive book question — meaning, theology, who, why, argument, comparison, character — call ${ASK_COMPANION_TOOL} immediately and stay silent until it returns. Do not praise the question or narrate your process.`,
    `After ${ASK_COMPANION_TOOL} returns, speak its answer once as your own. Do not add a preamble or a thinner substitute. Never mention tools, models, retrieval, waiting, or cutoffs.`,
    `Hard spoiler rule: you only have the current chapter. Nothing after it exists for you — no later books, no Book 3, no ending, no plot that is not in this chapter. If asked for the ending or anything after this chapter, say you only have this chapter so far.`,
    `If they want the book back, call resume_audiobook. One short goodbye is fine.`,
    `Speak in complete sentences. Be calm, direct, and concise without becoming staccato. Never say "good question", "great insight", "let me think", "let me check", or similar praise or process filler. Do not use the formula "it's not X, it's Y." Almost never use em dashes.`,
    `[Current state]`,
    `Right now reading: ${input.bookTitle} by ${input.bookAuthor} — ${input.chapterLabel} (${edition}).`,
    `The reader is on paragraph ${idx + 1} of ${input.paragraphs.length}. Treat later chapters as unknown.`,
  ]

  if (input.readingAngle) lines.push(`Reading angle: ${input.readingAngle}`)
  if (current) lines.push(`Current paragraph [${idx + 1}]:\n"${current}"`)
  if (nearby.length > 0) {
    lines.push(`Nearby paragraphs:\n${nearby.map(text => `- "${text}"`).join('\n')}`)
  }

  return lines.join('\n\n')
}

export function buildCompanionHopUserContent(input: LabTalkContext & { question: string }): string {
  const last = Math.max(0, input.paragraphs.length - 1)
  const idx = Math.max(0, Math.min(last, input.paragraphIndex))
  const nearby = nearbyParagraphWindow(input.paragraphs, idx)
  return [
    input.question,
    `Book: ${input.bookTitle} by ${input.bookAuthor}`,
    `Chapter: ${input.chapterLabel}`,
    `How far read: paragraph ${idx + 1} of ${input.paragraphs.length}`,
    nearby.length ? `Nearby text:\n${nearby.map(text => `- ${text}`).join('\n')}` : '',
  ].filter(Boolean).join('\n')
}

export const LAB_HOP_SPOKEN_LENGTH = 'Answer directly for the ear. Usually use two to four spoken sentences; expand only when the reader explicitly asks for depth. Finish the thought. Do not praise the question, narrate your process, mention waiting, or say the answer is still working. Do not write a long essay.'

export const LAB_HOP_MAX_TOKENS = 1024

export const LAB_HOP_FALLBACK = 'I could not get a reading of this passage just now.'

export type CompanionAskNotify = {
  onDelta?: (text: string) => void
  onFirstSpeakable?: (text: string) => void
  onAttempt?: (attempt: number) => void
  onRetry?: (reason: CompanionAskFailureReason) => void
}

export type CompanionAskFailureReason = 'request_failed' | 'incomplete' | 'empty'

export type CompanionAskResult = {
  status: 'completed' | 'failed'
  answer: string
  attempts: number
  stopReason: string | null
  failureReason?: CompanionAskFailureReason
}

const SENTENCE_END = /^[\s\S]+?[.!?](?:["'\u201d\u2019)\]]+)?/

export function firstSpeakableChunk(buffer: string): string | null {
  const text = buffer.replace(/\s+/g, ' ').trim()
  if (!text) return null
  const match = text.match(SENTENCE_END)
  if (match && match[0].trim().split(/\s+/).length >= 4) return match[0].trim()
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length >= 12) return words.slice(0, 12).join(' ')
  return null
}

export function remainderAfterSpeakable(first: string, full: string): string {
  const spoken = first.replace(/\s+/g, ' ').trim()
  const all = full.replace(/\s+/g, ' ').trim()
  if (!spoken || !all) return ''
  if (all === spoken) return ''
  const spokenBare = spoken.replace(/[.!?…]+$/, '')
  if (all.startsWith(spoken) || (spokenBare && all.startsWith(spokenBare))) {
    const prefix = all.startsWith(spoken) ? spoken : spokenBare
    return all.slice(prefix.length).replace(/^[\s.!?…]+/, '').trim()
  }
  return ''
}

export function remainingCompanionSpeech(first: string, full: string): string {
  const rest = remainderAfterSpeakable(first, full)
  if (rest) return rest
  const spoken = first.replace(/\s+/g, ' ').trim()
  const all = full.replace(/\s+/g, ' ').trim()
  if (!spoken || !all || all === spoken) return ''
  return all
}

const SENTENCE_CLOSE = /[.!?…](?:["'\u201d\u2019)\]]+)?\s*$/

export function companionHopLooksIncomplete(text: string, stopReason?: string | null): boolean {
  if (stopReason === 'max_tokens' || stopReason === 'error') return true
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t) return true
  return !SENTENCE_CLOSE.test(t)
}

export function spokenCompanionAnswer(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t) return ''
  if (SENTENCE_CLOSE.test(t)) return t
  const ends = [...t.matchAll(/[.!?…](?:["'\u201d\u2019)\]]+)?/g)]
  if (ends.length === 0) return ''
  const last = ends[ends.length - 1]
  return t.slice(0, (last.index ?? 0) + last[0].length).trim()
}

const COMPANION_FILLER_PREFIXES = [
  /^(?:good|great|excellent|important|interesting)\s+(?:question|point|observation|insight)[.!,:-]*\s*/i,
  /^(?:absolutely|certainly|of course)[.!,:-]*\s*/i,
  /^(?:let me|i(?:'ll| will))\s+(?:think(?: about that)?|check|look(?: that)? up|take a closer look)[.!,:-]*\s*/i,
  /^it (?:looks|seems) like (?:the )?(?:answer|companion(?:'s response)?) (?:is )?(?:still )?(?:working|waiting|loading)[.!,:-]*\s*/i,
] as const

/** Remove model-added praise/process filler without rewriting the substantive answer. */
export function directCompanionAnswer(text: string): string {
  let next = text.replace(/\s+/g, ' ').trim()
  let previous = ''
  while (next && next !== previous) {
    previous = next
    for (const prefix of COMPANION_FILLER_PREFIXES) next = next.replace(prefix, '').trim()
  }
  return next
}

export function extractAnthropicSseStopReason(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return null
  const data = trimmed.slice(5).trim()
  if (!data || data === '[DONE]') return null
  try {
    const parsed = JSON.parse(data) as { type?: string; delta?: { stop_reason?: string | null } }
    if (parsed.type === 'message_delta' && parsed.delta?.stop_reason) {
      return parsed.delta.stop_reason
    }
  } catch { /* ignore partial/non-json SSE data */ }
  return null
}

export type AnthropicStreamResult = {
  text: string
  stopReason: string | null
  sawStop: boolean
}

export function extractAnthropicSseDelta(line: string): string {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return ''
  const data = trimmed.slice(5).trim()
  if (!data || data === '[DONE]') return ''
  try {
    const parsed = JSON.parse(data) as { type?: string; delta?: { type?: string; text?: string } }
    if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
      return parsed.delta.text || ''
    }
  } catch { /* ignore partial/non-json SSE data */ }
  return ''
}

export async function readAnthropicStream(
  response: { ok?: boolean; body?: ReadableStream<Uint8Array> | null; headers?: { get?: (name: string) => string | null }; json?: () => Promise<unknown> },
  onDelta?: (text: string) => void,
): Promise<AnthropicStreamResult> {
  const contentType = response.headers?.get?.('content-type') || ''
  const body = response.body
  if (body && contentType.includes('event-stream')) {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let text = ''
    let stopReason: string | null = null
    let sawStop = false
    const consume = (line: string) => {
      const reason = extractAnthropicSseStopReason(line)
      if (reason) {
        stopReason = reason
        sawStop = true
      }
      if (line.includes('message_stop')) sawStop = true
      const piece = extractAnthropicSseDelta(line)
      if (!piece) return
      text += piece
      onDelta?.(text)
    }
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() ?? ''
        for (const line of lines) consume(line)
      }
      consume(buffer + decoder.decode())
    } catch {
      return { text: text.trim(), stopReason: stopReason || 'error', sawStop: false }
    }
    return { text: text.trim(), stopReason, sawStop }
  }
  const data = await response.json?.().catch(() => ({})) as { content?: Array<{ text?: string }>; stop_reason?: string | null }
  const text = data.content?.[0]?.text?.trim() || ''
  if (text) onDelta?.(text)
  return { text, stopReason: data.stop_reason ?? null, sawStop: true }
}

export async function readAnthropicResponse(
  response: { ok?: boolean; body?: ReadableStream<Uint8Array> | null; headers?: { get?: (name: string) => string | null }; json?: () => Promise<unknown> },
  onDelta?: (text: string) => void,
): Promise<string> {
  return (await readAnthropicStream(response, onDelta)).text
}

async function fetchLabCompanionHop(input: {
  authToken: string | null
  system: string
  question: string
  context: LabTalkContext
}): Promise<{ ok?: boolean; body?: ReadableStream<Uint8Array> | null; headers?: { get?: (name: string) => string | null }; json?: () => Promise<unknown> }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (input.authToken) headers.Authorization = `Bearer ${input.authToken}`
  return fetch(apiUrl(input.authToken ? '/api/chat' : '/api/lab-chat'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: LAB_HOP_MAX_TOKENS,
      stream: true,
      system: `${input.system}\n\n${LAB_HOP_SPOKEN_LENGTH}`,
      messages: [{
        role: 'user',
        content: buildCompanionHopUserContent({ ...input.context, question: input.question }),
      }],
    }),
  })
}

export async function queryLabCompanion(input: {
  authToken: string | null
  system: string
  question: string
  context: LabTalkContext
  onDelta?: (text: string) => void
  onFirstSpeakable?: (text: string) => void
  onAttempt?: (attempt: number) => void
  onRetry?: (reason: CompanionAskFailureReason) => void
}): Promise<CompanionAskResult> {
  let notified = false
  const readHop = async (attempt: number) => {
    input.onAttempt?.(attempt)
    try {
      const response = await fetchLabCompanionHop(input)
      if (!response.ok) return { text: '', stopReason: 'error', sawStop: false }
      return readAnthropicStream(response, (accumulated) => {
        input.onDelta?.(accumulated)
        if (notified) return
        const speakable = firstSpeakableChunk(accumulated)
        if (!speakable) return
        notified = true
        input.onFirstSpeakable?.(speakable)
      })
    } catch {
      return { text: '', stopReason: 'error', sawStop: false }
    }
  }

  const failureFor = (result: AnthropicStreamResult): CompanionAskFailureReason => {
    if (!result.text.trim()) return result.stopReason === 'error' ? 'request_failed' : 'empty'
    return 'incomplete'
  }

  let result = await readHop(1)
  if (!companionHopLooksIncomplete(result.text, result.stopReason)) {
    const answer = directCompanionAnswer(result.text)
    if (answer && !companionHopLooksIncomplete(answer, result.stopReason)) {
      if (!notified) input.onFirstSpeakable?.(answer)
      return { status: 'completed', answer, attempts: 1, stopReason: result.stopReason }
    }
  }

  const firstFailure = failureFor(result)
  input.onRetry?.(firstFailure)
  result = await readHop(2)
  if (!companionHopLooksIncomplete(result.text, result.stopReason)) {
    const answer = directCompanionAnswer(result.text)
    if (answer && !companionHopLooksIncomplete(answer, result.stopReason)) {
      if (!notified) input.onFirstSpeakable?.(answer)
      return { status: 'completed', answer, attempts: 2, stopReason: result.stopReason }
    }
  }

  return {
    status: 'failed',
    answer: LAB_HOP_FALLBACK,
    attempts: 2,
    stopReason: result.stopReason,
    failureReason: failureFor(result),
  }
}

export function companionSpeakInstructions(answer: string): string {
  return `${SPEAK_COMPANION_VERBATIM}\n\n${answer}`
}
