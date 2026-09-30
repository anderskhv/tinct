import type { ChapterChatAction } from '../types'
import type { VoiceModeState } from '../voice/types'
import { VOICE_TOOLS } from '../voice/context'
import { parseHearingSpeed } from './labHearing'
import { nextLabChapter, prevLabChapter, type LabChapter } from './labSource'
import { storage } from '../services/storage'
import { LAB_ASK_COMPANION_TOOL } from './labCompanion'

/** `checking` and `preparing` are Voice V2 only; V1 never produces them. */
export type LabConversationState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'checking' | 'preparing'

export interface LabAskTurn {
  bookId?: string
  chapterAction?: ChapterChatAction
  id: string
  role: 'user' | 'assistant'
  content: string
  source: 'typed' | 'voice'
  timestamp?: number
  chapterNumber?: number
  paragraphIndex?: number
  /** Passage the reader attached to this question. Kept separate from the visible question. */
  highlightedText?: string
  cancelled?: boolean
}

const LAB_GREETING_LINE = "I'm listening."

export function isLabGreetingTranscript(text: string): boolean {
  const next = text.replace(/\s+/g, ' ').trim()
  if (!next) return false
  if (next === LAB_GREETING_LINE) return true
  return /^I'm listening\.(?:\s*listening\.)+$/i.test(next)
}

/** Strip transcription noise before persisting or showing Talk bubbles. */
export function cleanLabVoiceTranscript(text: string): string {
  return text
    .replace(/\b(Ms|Us)\b/gi, '')
    .replace(/\b(?:uh+|um+|hmm+|ah+|er+|mhm+)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Same line finalized twice, or the same line stuck to itself with no separator. */
export function isStuckRepeatedLine(previous: string, incoming: string): boolean {
  const last = previous.trim()
  const next = incoming.trim()
  if (!last || !next) return false
  if (next === last) return true
  if (isLabGreetingTranscript(last) && isLabGreetingTranscript(next)) return true
  return next.startsWith(last) && next.slice(last.length) === last
}

export function applyLabVoiceTurn(current: LabAskTurn[], incoming: LabAskTurn): LabAskTurn[] {
  if (incoming.role === 'assistant' && isLabGreetingTranscript(incoming.content)) {
    const greetingIdx = current.findIndex(turn => turn.role === 'assistant' && isLabGreetingTranscript(turn.content))
    if (greetingIdx >= 0) {
      const existing = current[greetingIdx]
      if (incoming.cancelled && !existing.cancelled) {
        return current.map((turn, index) => (
          index === greetingIdx ? { ...existing, cancelled: true } : turn
        ))
      }
      return current
    }
  }
  const last = current[current.length - 1]
  if (!last || last.role !== incoming.role || last.source !== incoming.source) {
    return [...current, incoming]
  }
  // Finalized user turns append. Never replace "Hey, how are you?" with a later line,
  // and never drop a later line because it is shorter.
  if (incoming.role === 'user' && incoming.content !== last.content) {
    return [...current, incoming]
  }
  if (isStuckRepeatedLine(last.content, incoming.content)) {
    if (incoming.cancelled && !last.cancelled) {
      return [...current.slice(0, -1), { ...last, cancelled: true }]
    }
    if (isLabGreetingTranscript(last.content) || isLabGreetingTranscript(incoming.content)) {
      return [...current.slice(0, -1), { ...last, content: LAB_GREETING_LINE }]
    }
    return current
  }
  if (incoming.content.length < last.content.length) {
    return incoming.cancelled
      ? [...current.slice(0, -1), { ...last, cancelled: true }]
      : current
  }
  return [...current.slice(0, -1), {
    ...last,
    content: incoming.content,
    cancelled: incoming.cancelled ?? last.cancelled,
  }]
}

export {
  LAB_ASK_BOOK_TOOLS_RULE,
  LAB_ASK_LOOKUP_OFFER_RULE,
  LAB_ASK_NO_DECLINE_RULE,
  LAB_ASK_NO_PRAISE_RULE,
  LAB_ASK_POLICY,
  LAB_ASK_SYSTEM_CAP,
  buildLabAskInstructions,
  numberedLabChapter,
  renderLabReadingTrail,
  type LabAskContext,
} from '../companion/labAskPrompt'

export function labReadingAngle(): string | undefined {
  const prefs = storage.get<{ readingObjective?: string }>('preferences')
  const angle = prefs?.readingObjective?.trim()
  return angle || undefined
}

/**
 * Composer phase from the live voice machine, plus an immediate connecting
 * state so the filled-circle icon is alive before WebRTC is listening.
 */
export function labConversationState(input: {
  voiceState: VoiceModeState
  error?: string | null
  starting?: boolean
}): LabConversationState {
  if (input.error) return 'idle'
  if (input.voiceState === 'listening') return 'listening'
  if (input.voiceState === 'answering') return 'speaking'
  if (input.voiceState === 'conversation_idle' || input.voiceState === 'resume_pending') return 'thinking'
  if (input.starting || input.voiceState !== 'reading') return 'connecting'
  return 'idle'
}

const AFFIRMATIVE_WORDS = new Set([
  'yes', 'yeah', 'yep', 'yup', 'ya', 'sure', 'ok', 'okay', 'please', 'do', 'go', 'ahead',
  'absolutely', 'definitely', 'certainly', 'of', 'course', 'sounds', 'good', 'great', 'fine',
  'lets', "let's", 'it', 'that', 'would', 'be', 'yes!!', 'alright', 'right', 'thanks', 'thank', 'you',
])

/** "Yes", "ok sure", "yes please do", "go ahead" — nothing that names a place or an action. */
export function isBareAffirmative(text: string): boolean {
  const words = text.toLowerCase().replace(/[^a-z'\s]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  if (words.length === 0 || words.length > 6) return false
  if (!words.some(word => /^(yes|yeah|yep|yup|ya|sure|ok|okay|please|absolutely|definitely|certainly|alright)$/.test(word) || word === 'go' || word === 'do')) return false
  return words.every(word => AFFIRMATIVE_WORDS.has(word))
}

const OFFER_FORM = /\b(shall i|should i|want me to|would you like|do you want|i can|i could|we could|we can|could go|let'?s (?:go|have|take|look)|like me to|if you like|if you want|i'?ll (?:go|have|take|look|check))\b/i
const LOOKUP_VERB = /\b(look|check|read|see|find|go back|pull up|search|have a look|take a look|dig|revisit|glance|open|flip back|turn back)\b/i

/** Does the assistant's last line offer to look something up (or go back and check)? */
export function assistantOffersLookup(text: string): boolean {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return false
  const sentences = normalized.split(/(?<=[.!?])\s+/)
  const tail = sentences.slice(-2).join(' ')
  if (!LOOKUP_VERB.test(tail)) return false
  return OFFER_FORM.test(tail) || /\?\s*$/.test(tail)
}

/**
 * The transcript failure: the assistant offered "we could go back a few
 * chapters and have a look?", the reader said "Yes!!", and the app navigated
 * and started playback. A bare affirmative after a lookup offer is consent to
 * the lookup, never a move or a resume.
 */
export function affirmativeAnswersLookupOffer(userText: string, previousAssistantText: string | null | undefined): boolean {
  if (!previousAssistantText) return false
  return isBareAffirmative(userText) && assistantOffersLookup(previousAssistantText)
}

/** Self-contained question for the companion hop, which carries no conversation history. */
export function lookupQuestionFromOffer(offer: string, reply: string): string {
  const cleanOffer = offer.replace(/\s+/g, ' ').trim().slice(0, 600)
  const cleanReply = reply.replace(/\s+/g, ' ').trim().slice(0, 60)
  return `The reader answered "${cleanReply}" to this offer of yours: "${cleanOffer}". Do what you offered: look it up in the book and answer them directly, without moving them to another chapter.`
}

const RESUME_LISTEN_PHRASES = [
  'go back to the audiobook',
  'back to the audiobook',
  'return to the audiobook',
  'resume the audio',
  'resume the audiobook',
  'resume listening',
  'back to listening',
  'go back to listening',
  'no further questions',
]

function normalizeAskCommand(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function isResumeListenCommand(text: string): boolean {
  const normalized = normalizeAskCommand(text)
  if (!normalized) return false
  return RESUME_LISTEN_PHRASES.some(phrase => normalized === phrase || normalized.includes(phrase))
}

const LAB_RESUME_TAG = /\[\[resume_audiobook\]\]/i
const LAB_SPEED_TAG = /\[\[set_playback_speed:([^\]]+)\]\]/i
const LAB_PACE_TAG = /\[\[set_assistant_pace:(slow|normal|fast)\]\]/i
const LAB_SKIP_TAG = /\[\[(restart_chapter|previous_chapter|next_chapter|previous_paragraph|next_paragraph)\]\]/i

export type AssistantPace = 'slow' | 'normal' | 'fast'

export const ASSISTANT_PACE_SPEED: Record<AssistantPace, number> = {
  slow: 0.8,
  normal: 1,
  fast: 1.25,
}

export const LAB_SET_PLAYBACK_SPEED_TOOL = {
  type: 'function',
  name: 'set_playback_speed',
  description: 'Set audiobook playback speed. Call this whenever they want faster, slower, 2x, 1x, or any speed. Never say you cannot control speed. Never tell them to use a podcast app. rate must be 0.75, 1, 1.25, 1.5, or 2.',
  parameters: {
    type: 'object',
    properties: {
      rate: {
        type: 'number',
        enum: [0.75, 1, 1.25, 1.5, 2],
        description: 'Playback rate. 1 is normal. 2 is twice as fast.',
      },
    },
    required: ['rate'],
    additionalProperties: false,
  },
} as const

export const LAB_SET_ASSISTANT_PACE_TOOL = {
  type: 'function',
  name: 'set_assistant_pace',
  description: 'Change how you speak, not the audiobook. Call this when they say talk slower, talk faster, or slower please. Never say you cannot. pace must be slow, normal, or fast.',
  parameters: {
    type: 'object',
    properties: {
      pace: {
        type: 'string',
        enum: ['slow', 'normal', 'fast'],
        description: 'Your speaking rate. slow is unhurried. fast is brisk. normal is the default.',
      },
    },
    required: ['pace'],
    additionalProperties: false,
  },
} as const

export const LAB_PREVIOUS_CHAPTER_TOOL = {
  type: 'function',
  name: 'previous_chapter',
  description: 'Go to the previous sequential Bible chapter and start at its first paragraph. Call this when they want the previous chapter. Never say you cannot skip chapters.',
  parameters: { type: 'object', properties: {}, additionalProperties: false },
} as const

export const LAB_NEXT_CHAPTER_TOOL = {
  type: 'function',
  name: 'next_chapter',
  description: 'Go to the next sequential Bible chapter and start at its first paragraph. Call this when they want the next chapter. Genesis 1 then Genesis 2. Never say you cannot skip chapters.',
  parameters: { type: 'object', properties: {}, additionalProperties: false },
} as const

export const LAB_RESTART_CHAPTER_TOOL = {
  type: 'function',
  name: 'restart_chapter',
  description: 'Restart the open chapter from its first word. Call this when the reader says they missed something, asks to go back to the beginning, start the chapter again, or replay this chapter. The app seeks and resumes after your brief confirmation.',
  parameters: { type: 'object', properties: {}, additionalProperties: false },
} as const

export const LAB_PREVIOUS_PARAGRAPH_TOOL = {
  type: 'function',
  name: 'previous_paragraph',
  description: 'Go to the previous paragraph in this chapter. If they are already on the first paragraph, go to the last paragraph of the previous chapter. Never say you cannot skip paragraphs.',
  parameters: { type: 'object', properties: {}, additionalProperties: false },
} as const

export const LAB_NEXT_PARAGRAPH_TOOL = {
  type: 'function',
  name: 'next_paragraph',
  description: 'Go to the next paragraph in this chapter. If they are already on the last paragraph, stay there. Never say you cannot skip paragraphs.',
  parameters: { type: 'object', properties: {}, additionalProperties: false },
} as const

export const LAB_PLAYBACK_SKIP_TOOLS = [
  'restart_chapter',
  'previous_chapter',
  'next_chapter',
  'previous_paragraph',
  'next_paragraph',
] as const

export type LabPlaybackSkip = typeof LAB_PLAYBACK_SKIP_TOOLS[number]

export function isLabPlaybackSkip(name: string): name is LabPlaybackSkip {
  return (LAB_PLAYBACK_SKIP_TOOLS as readonly string[]).includes(name)
}

export function resolveLabPlaybackSkip(input: {
  kind: LabPlaybackSkip
  chapterNumber: number
  paragraphIndex: number
  paragraphCount: number
  chapters: LabChapter[]
}): { chapterNumber: number; paragraphIndex: number; landing: 'start' | 'end'; chapterChanged: boolean } {
  const last = Math.max(0, input.paragraphCount - 1)
  const idx = Math.max(0, Math.min(last, input.paragraphIndex))

  if (input.kind === 'restart_chapter') {
    return { chapterNumber: input.chapterNumber, paragraphIndex: 0, landing: 'start', chapterChanged: false }
  }

  if (input.kind === 'next_chapter') {
    const next = nextLabChapter(input.chapters, input.chapterNumber)
    if (next == null) {
      return { chapterNumber: input.chapterNumber, paragraphIndex: idx, landing: 'start', chapterChanged: false }
    }
    return { chapterNumber: next, paragraphIndex: 0, landing: 'start', chapterChanged: true }
  }

  if (input.kind === 'previous_chapter') {
    const prev = prevLabChapter(input.chapters, input.chapterNumber)
    if (prev == null) {
      return { chapterNumber: input.chapterNumber, paragraphIndex: 0, landing: 'start', chapterChanged: false }
    }
    return { chapterNumber: prev, paragraphIndex: 0, landing: 'start', chapterChanged: true }
  }

  if (input.kind === 'next_paragraph') {
    if (idx < last) {
      return { chapterNumber: input.chapterNumber, paragraphIndex: idx + 1, landing: 'start', chapterChanged: false }
    }
    return { chapterNumber: input.chapterNumber, paragraphIndex: last, landing: 'start', chapterChanged: false }
  }

  if (idx > 0) {
    return { chapterNumber: input.chapterNumber, paragraphIndex: idx - 1, landing: 'start', chapterChanged: false }
  }
  const prev = prevLabChapter(input.chapters, input.chapterNumber)
  if (prev != null) {
    return { chapterNumber: prev, paragraphIndex: 0, landing: 'end', chapterChanged: true }
  }
  return { chapterNumber: input.chapterNumber, paragraphIndex: 0, landing: 'start', chapterChanged: false }
}

export const LAB_VOICE_TOOLS = [
  ...VOICE_TOOLS,
  LAB_SET_PLAYBACK_SPEED_TOOL,
  LAB_SET_ASSISTANT_PACE_TOOL,
  LAB_PREVIOUS_CHAPTER_TOOL,
  LAB_NEXT_CHAPTER_TOOL,
  LAB_RESTART_CHAPTER_TOOL,
  LAB_PREVIOUS_PARAGRAPH_TOOL,
  LAB_NEXT_PARAGRAPH_TOOL,
  LAB_ASK_COMPANION_TOOL,
]

export function labTypedResume(text: string): { text: string; resume: boolean } {
  const resume = LAB_RESUME_TAG.test(text)
  return { text: text.replace(LAB_RESUME_TAG, '').trim(), resume }
}

export function labTypedSpeed(text: string): { text: string; speed: number | null } {
  const match = text.match(LAB_SPEED_TAG)
  const speed = match ? parseHearingSpeed(match[1]) : null
  return { text: text.replace(LAB_SPEED_TAG, '').trim(), speed }
}

export function parseSetPlaybackSpeedArguments(raw?: string): number | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { rate?: unknown }
    return parseHearingSpeed(parsed.rate)
  } catch {
    return parseHearingSpeed(raw)
  }
}

export function parseAssistantPace(raw?: string): AssistantPace | null {
  if (!raw) return null
  let value = raw.trim().toLowerCase()
  try {
    const parsed = JSON.parse(raw) as { pace?: unknown }
    if (parsed && parsed.pace != null) value = String(parsed.pace).trim().toLowerCase()
  } catch {
    /* plain slow|normal|fast */
  }
  if (value === 'slow' || value === 'normal' || value === 'fast') return value
  return null
}

export function labTypedPace(text: string): { text: string; pace: AssistantPace | null } {
  const match = text.match(LAB_PACE_TAG)
  const pace = match ? parseAssistantPace(match[1]) : null
  return { text: text.replace(LAB_PACE_TAG, '').trim(), pace }
}

export function labTypedSkip(text: string): { text: string; skip: LabPlaybackSkip | null } {
  const match = text.match(LAB_SKIP_TAG)
  const raw = match?.[1]?.toLowerCase() || ''
  const skip = isLabPlaybackSkip(raw) ? raw : null
  return { text: text.replace(LAB_SKIP_TAG, '').trim(), skip }
}
