/**
 * Voice V2 lab layer: instructions, tools, and the companion hop.
 *
 * Only `/lab/reader?voice=v2` selects these. Voice V1 keeps
 * `buildLabTalkInstructions`, `LAB_VOICE_TOOLS`, and `queryLabCompanion`
 * untouched in `labCompanion.ts` / `labAsk.ts`.
 */
import { apiUrl } from '../utils/apiUrl'
import { nearbyParagraphWindow, VOICE_TOOLS } from '../voice/context'
import type { VoiceActivityPhase } from '../voice/v2/voiceV2'
import {
  directCompanionAnswer,
  VOICE_V2_FAILURE_LINE,
  voiceV2StatusLabel,
  type CompanionAskFailureReason,
  type CompanionAskResult,
} from '../voice/v2/voiceV2'
import {
  LAB_NEXT_CHAPTER_TOOL,
  LAB_NEXT_PARAGRAPH_TOOL,
  LAB_PREVIOUS_CHAPTER_TOOL,
  LAB_PREVIOUS_PARAGRAPH_TOOL,
  LAB_RESTART_CHAPTER_TOOL,
  LAB_SET_ASSISTANT_PACE_TOOL,
  LAB_SET_PLAYBACK_SPEED_TOOL,
  type LabConversationState,
} from './labAsk'
import {
  ASK_COMPANION_TOOL,
  buildCompanionHopUserContent,
  companionHopLooksIncomplete,
  firstSpeakableChunk,
  readAnthropicStream,
  type AnthropicStreamResult,
  type LabTalkContext,
} from './labCompanion'

export const LAB_ASK_COMPANION_TOOL_V2 = {
  type: 'function',
  name: ASK_COMPANION_TOOL,
  description: 'Ask Tinct\'s reading companion for a spoiler-safe book answer. Use for meaning, theology, who, why, argument, comparison, or character. Call it immediately and say nothing until it returns. Never use it for skip, speed, next chapter, resume, play, goodbye, or tiny confirms.',
  parameters: {
    type: 'object',
    properties: {
      question: { type: 'string', description: 'The reader\'s book question, in their words.' },
    },
    required: ['question'],
    additionalProperties: false,
  },
} as const

export const LAB_VOICE_TOOLS_V2 = [
  ...VOICE_TOOLS,
  LAB_SET_PLAYBACK_SPEED_TOOL,
  LAB_SET_ASSISTANT_PACE_TOOL,
  LAB_PREVIOUS_CHAPTER_TOOL,
  LAB_NEXT_CHAPTER_TOOL,
  LAB_RESTART_CHAPTER_TOOL,
  LAB_PREVIOUS_PARAGRAPH_TOOL,
  LAB_NEXT_PARAGRAPH_TOOL,
  LAB_ASK_COMPANION_TOOL_V2,
]

/** Words V2 is never allowed to open with. Tests guard the instructions with this list. */
export const LAB_V2_BANNED_OPENERS = [
  'good question',
  'great question',
  'let me look',
  'let me think',
  'let me check',
  'looking at this with you',
] as const

export function buildLabTalkInstructionsV2(input: LabTalkContext): string {
  const last = Math.max(0, input.paragraphs.length - 1)
  const idx = Math.max(0, Math.min(last, input.paragraphIndex))
  const current = (input.paragraphs[idx] || '').replace(/\s+/g, ' ').trim()
  const nearby = nearbyParagraphWindow(input.paragraphs, idx)
  const edition = input.editionLabel || 'Butler'
  const lines = [
    `You are Tinct's concise reading companion beside the page on /lab. You listen, handle interruptions, and run playback tools.`,
    `Do not greet. Do not say hello. The app speaks the opening line.`,
    `Answer directly. Start with the substance. Never praise the question or the reader. Never narrate your process: do not say you are looking, checking, thinking, or about to answer. Do not read any prepared line before an answer.`,
    `Playback stays instant. For go faster, slower, skip, next chapter, previous chapter, next or previous paragraph, resume, or play, call the matching playback tool immediately. Never call ${ASK_COMPANION_TOOL} for those. Tiny confirms you answer yourself in one short line.`,
    `Easy questions you can answer from the passage below, answer yourself in one or two plain sentences. Literary connections to other books, authors, or traditions are welcome when they stay within what the reader could know from this chapter.`,
    `When the turn is a substantive book question that needs a mind (meaning, theology, who, why, argument, comparison, character) call ${ASK_COMPANION_TOOL} immediately and say nothing until it returns. No preface, no filler, no tool talk.`,
    `After ${ASK_COMPANION_TOOL} returns, speak its answer once, complete, as your own. Do not add a preamble, a summary, or a thinner substitute. Never mention a tool, a hop, a second model, waiting, or a cutoff. Never say an answer got cut off.`,
    `Hard spoiler rule: you only have the current chapter. Nothing after it exists for you. If asked for the ending or anything after this chapter, say you only have this chapter so far.`,
    `If they want the book back, call resume_audiobook and say one short closing sentence. If they clearly say goodbye or that the conversation is over, say one short goodbye and call end_voice_session. A bare thanks or thank you is not a goodbye; answer it in a word or two and keep listening.`,
    `Speak in complete sentences. Calm and direct. Short by default; go longer only when the question or the reader asks for depth, and then finish the thought. Do not use the formula "it's not X, it's Y." Almost never use em dashes.`,
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

export const SPEAK_COMPANION_VERBATIM_V2 = 'Speak only the answer below, once, complete, as your own. Do not add praise, a greeting, a preamble, a summary, or any description of your process. Do not mention tools, models, retrieval, waiting, or cutoffs. Do not call any tools.'

export function companionSpeakInstructionsV2(answer: string): string {
  return `${SPEAK_COMPANION_VERBATIM_V2}\n\n${answer}`
}

export function failureSpeakInstructionsV2(): string {
  return `Say exactly this one line and then stop. Do not add anything, do not apologise further, do not call any tools.\n\n${VOICE_V2_FAILURE_LINE}`
}

export function signOffInstructionsV2(): string {
  return 'The reader said goodbye. Say one short natural goodbye and then stop. Do not call any tools.'
}

export function closingLineInstructionsV2(): string {
  return 'Say one short closing sentence that the book is coming back, then stop. Do not call any tools.'
}

/** Appended to the Claude system prompt for the V2 hop. */
export const LAB_V2_COMPANION_POLICY = `Answer directly and concisely in complete sentences. Start with the substance. Never praise the question or the reader. Never say "good question", "great insight", "let me think", "let me check", or narrate your process. Do not say an answer is still working and do not ask the reader to retry.`

export const LAB_HOP_SPOKEN_LENGTH_V2 = 'Answer for the ear. Usually two to four spoken sentences; expand only when the reader explicitly asks for depth, and then finish the thought completely. Do not write an essay.'

/** Higher than V1 so a deliberately long answer is not cut mid-thought. */
export const LAB_HOP_MAX_TOKENS_V2 = 2048

export type CompanionAskNotifyV2 = {
  onDelta?: (text: string) => void
  onFirstSpeakable?: (text: string) => void
  onAttempt?: (attempt: number) => void
  onRetry?: (reason: CompanionAskFailureReason) => void
}

type CompanionResponse = {
  ok?: boolean
  body?: ReadableStream<Uint8Array> | null
  headers?: { get?: (name: string) => string | null }
  json?: () => Promise<unknown>
}

async function fetchLabCompanionHopV2(input: {
  authToken: string | null
  system: string
  question: string
  context: LabTalkContext
}): Promise<CompanionResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (input.authToken) headers.Authorization = `Bearer ${input.authToken}`
  return fetch(apiUrl(input.authToken ? '/api/chat' : '/api/lab-chat'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: LAB_HOP_MAX_TOKENS_V2,
      stream: true,
      system: `${input.system}\n\n${LAB_V2_COMPANION_POLICY}\n\n${LAB_HOP_SPOKEN_LENGTH_V2}`,
      messages: [{
        role: 'user',
        content: buildCompanionHopUserContent({ ...input.context, question: input.question }),
      }],
    }),
  })
}

function failureFor(result: AnthropicStreamResult): CompanionAskFailureReason {
  if (!result.text.trim()) return result.stopReason === 'error' ? 'request_failed' : 'empty'
  return 'incomplete'
}

/**
 * V2 hop: one retry, then a structured result. A completed result is always
 * a full, filler-free answer that ends on a sentence boundary; anything else
 * is `failed` so the controller can say so explicitly instead of speaking a
 * truncated or invented answer.
 */
export async function queryLabCompanionV2(input: {
  authToken: string | null
  system: string
  question: string
  context: LabTalkContext
} & CompanionAskNotifyV2): Promise<CompanionAskResult> {
  let notified = false
  const readHop = async (attempt: number): Promise<AnthropicStreamResult> => {
    input.onAttempt?.(attempt)
    try {
      const response = await fetchLabCompanionHopV2(input)
      if (!response.ok) return { text: '', stopReason: 'error', sawStop: false }
      return await readAnthropicStream(response, (accumulated) => {
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

  const complete = (result: AnthropicStreamResult, attempts: number): CompanionAskResult | null => {
    if (companionHopLooksIncomplete(result.text, result.stopReason)) return null
    const answer = directCompanionAnswer(result.text)
    if (!answer || companionHopLooksIncomplete(answer, result.stopReason)) return null
    if (!notified) input.onFirstSpeakable?.(answer)
    return { status: 'completed', answer, attempts, stopReason: result.stopReason }
  }

  let result = await readHop(1)
  const first = complete(result, 1)
  if (first) return first

  input.onRetry?.(failureFor(result))
  result = await readHop(2)
  const second = complete(result, 2)
  if (second) return second

  return {
    status: 'failed',
    answer: '',
    attempts: 2,
    stopReason: result.stopReason,
    failureReason: failureFor(result),
  }
}

/**
 * V2 composer phase. Driven by the controller's event-derived activity, plus
 * the immediate `starting` flag so the icon is alive before the first
 * snapshot arrives. A failure notice never hides the live state.
 */
export function labConversationStateV2(input: {
  activity: VoiceActivityPhase
  starting?: boolean
}): LabConversationState {
  switch (input.activity) {
    case 'connecting': return 'connecting'
    case 'listening': return 'listening'
    case 'checking_text': return 'checking'
    case 'preparing_answer': return 'preparing'
    case 'speaking': return 'speaking'
    default:
      return input.starting ? 'connecting' : 'idle'
  }
}

export function labVoicePhaseLabelV2(state: LabConversationState): string | null {
  switch (state) {
    case 'connecting': return voiceV2StatusLabel('connecting')
    case 'listening': return voiceV2StatusLabel('listening')
    case 'checking': return voiceV2StatusLabel('checking_text')
    case 'preparing': return voiceV2StatusLabel('preparing_answer')
    case 'speaking': return voiceV2StatusLabel('speaking')
    default: return null
  }
}
