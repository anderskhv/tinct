import { COMPANION_EFFORT_VOICE, COMPANION_MODEL } from '../companionModel'
import { apiUrl } from '../utils/apiUrl'
import { nearbyParagraphWindow } from '../voice/context'
import type { LabReadingTrailEntry } from './labReadingTrail'

export interface LabTalkContext {
  bookTitle: string
  bookAuthor: string
  chapterLabel: string
  chapterNumber?: number
  editionLabel?: string
  paragraphs: string[]
  paragraphIndex: number
  readingAngle?: string
  /** Registry book id + edition key; when both are set the companion hop carries `book` so the worker can read other chapters. */
  bookId?: string
  editionKey?: string
  /** Last few chapters the reader visited in this book, newest last (see labReadingTrail). */
  readingTrail?: LabReadingTrailEntry[]
}

/** Request-body fields that enable in-book retrieval on the worker. */
export function labCompanionBookFields(context: Pick<LabTalkContext, 'bookId' | 'editionKey' | 'chapterNumber' | 'readingTrail'>): {
  book?: { bookId: string; editionKey: string; chapterNumber?: number }
  readingTrail?: Array<{ chapterNumber: number }>
} {
  if (!context.bookId || !context.editionKey) return {}
  return {
    book: {
      bookId: context.bookId,
      editionKey: context.editionKey,
      ...(typeof context.chapterNumber === 'number' ? { chapterNumber: context.chapterNumber } : {}),
    },
    ...(context.readingTrail && context.readingTrail.length > 0
      ? { readingTrail: context.readingTrail.map(entry => ({ chapterNumber: entry.chapterNumber })) }
      : {}),
  }
}

export const ASK_COMPANION_TOOL = 'ask_companion'

/**
 * The only line the Realtime model may speak while a companion hop is pending.
 * No praise, no narration of the mechanism.
 */
export const LAB_HOLDING_LINE = "I'll look that up."
/** Spoken once if the hop is still pending after LAB_STILL_LOOKING_MS. */
export const LAB_STILL_LOOKING_LINE = 'Still looking, back in a moment.'
export const LAB_STILL_LOOKING_MS = 6_000

/** Realtime (V1 and V2) never navigates to answer; the companion reads earlier chapters. */
export const LAB_TALK_LOOKUP_POLICY = `Every question or remark about the book goes to ${ASK_COMPANION_TOOL}, however short or easy it seems: "what does the king want", "explain the ending", "who is he", all of them. Never answer a book question yourself. The companion has the whole book; you only see the current passage. Never say you cannot see earlier chapters, never say you only have what is here, never say you cannot explain what comes after, and never offer to go back a few chapters to have a look. "The ending" means the end of the chapter the reader is in unless they say otherwise. If you offered to look something up and the reader says yes, okay, or sure, call ${ASK_COMPANION_TOOL} with what you offered to look up. next_chapter, previous_chapter, and resume_audiobook move or play the book only when the reader explicitly asks to move or to hear it; never use them to answer a question, and a move never starts the audiobook by itself.`

/** Holding phase and no-praise rules shared by V1 and V2. */
export const LAB_TALK_HOLDING_POLICY = `While ${ASK_COMPANION_TOOL} is pending you may say only "${LAB_HOLDING_LINE}" and nothing else: no partial answer, no description of what you are doing, no mention of a companion, a tool, waiting, or a fuller explanation to come. When its answer arrives, speak it once as the one answer. Never praise the question or the reader and never open with an evaluative phrase (good question, good catch, great point, fair question). Start with the substance.`

export const LAB_ASK_COMPANION_TOOL = {
  type: 'function',
  name: ASK_COMPANION_TOOL,
  description: 'Ask Tinct\'s reading companion for a spoiler-safe book answer. Use only for meaning, theology, who, why, argument, comparison, or character. Speak a short looking-at-the-passage line first. Never use for skip, speed, next chapter, resume, play, or tiny confirms.',
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

/** Greetings and goodbyes stay with the Realtime model; everything about the book goes to the companion. */
const GREETING_OR_GOODBYE = /^(?:(?:ok|okay|alright|all right)[,\s]+)?(?:(?:hi|hello|hey)(?: there)?|good (?:morning|afternoon|evening)|bye|bye for now|goodbye|good bye|see you(?: later| next time)?|talk (?:to you )?later|thanks?(?: you)?(?: very much| a lot)?|thank you|that's (?:it|all)(?: for now)?|thats (?:it|all)(?: for now)?|i'm done(?: for now)?|im done|nothing else|end (?:the|this) conversation|end voice mode|stop talking)[\s.!?]*$/i

export const LAB_COVER_LINES = [
  LAB_HOLDING_LINE,
] as const

/** Words that mean the Realtime model is narrating the hop instead of holding. */
export const LAB_HOP_NARRATION = /\b(companion|waiting on|waiting for|full explanation|don't want to invent|do not want to invent|still waiting|second model|the answer I received)\b/i

/** The praise and evaluative openers struck everywhere, typed and spoken. */
export const LAB_BANNED_PRAISE = ['Good question', 'Great question', 'Good catch', 'Great catch', 'Great point', 'Good point', 'Fair question', 'Great insight'] as const

/** Declines the companion must never produce; with read_chapter / find_in_book it looks instead. */
export const LAB_BANNED_DECLINES = ["I only have what's here", "I can't explain what comes after this chapter", 'I only have this chapter in front of me'] as const

export function holdingLineInstructions(line: string): string {
  return `Say exactly this one short line and then stop: "${line}" Do not add anything else. Do not answer yet. Do not describe what you are doing, do not mention looking anything up beyond that line, and do not mention a companion, a tool, a model, or waiting. Do not call any tools.`
}

export const SPEAK_CLAUDE_VERBATIM = 'The reading companion answered. Speak that answer as your own, once, and nothing else. Do not invent a thinner substitute. Do not summarize it into a weaker reply. Do not add praise or an opener. Do not mention a tool, a hop, a second model, a cutoff, or "the answer I received". Never say the answer got cut off. If you only have part of an answer, do not narrate that — speak the complete sentences you were given, or wait.'

export function isLabPlaybackUtterance(text: string): boolean {
  return PLAYBACK_COMMAND.test(text.trim())
}

/**
 * Every reader utterance about the book goes to the companion. The Realtime
 * model keeps only playback commands, tiny confirms, greetings and goodbyes.
 * "But what does the king want?" is a book question however short it is.
 */
export function shouldEscalateToCompanion(text: string): boolean {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (!trimmed) return false
  if (TINY_CONFIRM.test(trimmed)) return false
  if (GREETING_OR_GOODBYE.test(trimmed)) return false
  if (isLabPlaybackUtterance(trimmed) && !HARD_QUESTION.test(trimmed) && !LITERARY_CONNECTION.test(trimmed) && !/\?$/.test(trimmed)) return false
  return true
}

export function pickLabCoverLine(index = 0): string {
  return LAB_COVER_LINES[Math.abs(index) % LAB_COVER_LINES.length]
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
    `You are Tinct's ear and mouth beside the page on /lab. You listen, handle barge-in, and run playback tools. You do not do the deep thinking.`,
    `Do not greet. Do not say hello. The app speaks the opening line.`,
    `Playback stays instant. For go faster, slower, skip, next chapter, previous chapter, next or previous paragraph, resume, or play, call the matching playback tool immediately. Never call ${ASK_COMPANION_TOOL} for those. Tiny confirms, greetings and goodbyes you answer yourself in one short line.`,
    `For anything else the reader says about the book — a question, a remark, a "what does he want", an "explain the ending" — say exactly "${LAB_HOLDING_LINE}" and immediately call ${ASK_COMPANION_TOOL}. Say nothing else before the tool call. Never answer a book question yourself, even an easy one. Never say you are thinking or will think about it.`,
    `After ${ASK_COMPANION_TOOL} returns, speak that answer as your own. Do not invent a thinner substitute. Never mention a tool, a hop, a cutoff, or "the answer I received". Never say an answer got cut off. If the hop is incomplete, wait rather than narrating the failure.`,
    LAB_TALK_HOLDING_POLICY,
    `Hard spoiler rule: you only have the current chapter. Nothing after it exists for you — no later books, no Book 3, no ending, no plot that is not in this chapter. If asked for the ending or anything after this chapter, say you only have this chapter so far.`,
    LAB_TALK_LOOKUP_POLICY,
    `If they want the book back, call resume_audiobook. One short goodbye is fine.`,
    `Speak in complete sentences. Warm, literary, and calm. Do not use the formula "it's not X, it's Y." Almost never use em dashes.`,
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

export const LAB_HOP_SPOKEN_LENGTH = 'Answer for the ear in a few spoken sentences unless the reader asked for more. Finish the thought. Do not write a long essay.'

export const LAB_HOP_MAX_TOKENS = 1024

export const LAB_HOP_FALLBACK = 'I could not get a reading of this passage just now.'

export type CompanionAskNotify = {
  onDelta?: (text: string) => void
  onFirstSpeakable?: (text: string) => void
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
      model: COMPANION_MODEL,
      max_tokens: LAB_HOP_MAX_TOKENS,
      stream: true,
      effort: COMPANION_EFFORT_VOICE,
      system: `${input.system}\n\n${LAB_HOP_SPOKEN_LENGTH}`,
      messages: [{
        role: 'user',
        content: buildCompanionHopUserContent({ ...input.context, question: input.question }),
      }],
      ...labCompanionBookFields(input.context),
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
}): Promise<string> {
  let notified = false
  const readHop = async () => {
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
  }

  let result = await readHop()
  if (companionHopLooksIncomplete(result.text, result.stopReason)) {
    const retry = await readHop()
    if (retry.text && !companionHopLooksIncomplete(retry.text, retry.stopReason)) {
      result = retry
    } else if (retry.text.length > result.text.length) {
      result = retry
    }
  }
  const spoken = spokenCompanionAnswer(result.text) || result.text.trim()
  if (!notified && spoken) input.onFirstSpeakable?.(spoken)
  return spoken
}

export async function runEscalatedCompanionTurn(input: {
  question: string
  alreadySpeaking: boolean
  speakCover: (line: string) => boolean
  query: (question: string) => Promise<string>
  coverLine?: string
}): Promise<{ answer: string; covered: boolean }> {
  const covered = input.alreadySpeaking
    ? true
    : input.speakCover(input.coverLine || pickLabCoverLine())
  const answer = await input.query(input.question)
  return { answer, covered }
}

export function companionSpeakInstructions(answer: string): string {
  return `${SPEAK_CLAUDE_VERBATIM}\n\n${answer}`
}
