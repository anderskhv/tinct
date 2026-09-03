import type { VoiceModeState } from '../voice/types'
import { VOICE_TOOLS } from '../voice/context'
import { parseHearingSpeed } from './labHearing'
import { nextLabChapter, prevLabChapter, type LabChapter } from './labSource'
import { storage } from '../services/storage'
import { LAB_ASK_COMPANION_TOOL } from './labCompanion'

export type LabConversationState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'

export interface LabAskTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
  source: 'typed' | 'voice'
  chapterNumber?: number
  paragraphIndex?: number
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

export interface LabAskContext {
  bookTitle: string
  bookAuthor: string
  chapterLabel: string
  chapterNumber?: number
  editionLabel?: string
  paragraphs: string[]
  paragraphIndex: number
  readingAngle?: string
}

const LAB_CHAPTER_CAP = 30_000

export function labReadingAngle(): string | undefined {
  const prefs = storage.get<{ readingObjective?: string }>('preferences')
  const angle = prefs?.readingObjective?.trim()
  return angle || undefined
}

/** 1-based paragraph numbers so "second paragraph of Book 1" is in the payload. */
export function numberedLabChapter(paragraphs: string[]): string {
  return paragraphs
    .map((text, index) => `[${index + 1}] ${text.replace(/\s+/g, ' ').trim()}`)
    .filter(line => line.length > 4)
    .join('\n\n')
}

export const LAB_ASK_POLICY = `You are Tinct's reading companion beside the page on /lab. This is a conversation next to the open chapter, not an in-car interruption.

Do not greet. Do not say hello. Do not start with small talk. The app speaks the opening line.

Hard spoiler rule: you only have the current chapter. Nothing after it exists for you — no later books, no Book 3, no ending, no plot that is not in this chapter. If asked for the ending or anything after this chapter, say you only have this chapter so far.

If they ask you to read a paragraph that is in the chapter payload below, read it from that payload. Do not ask them to paste. Do not say you lack the book.

If the reader wants the book or the audiobook back, however they say it, call resume_audiobook. Never say you cannot control playback. One short goodbye is fine. On a typed reply, end with [[resume_audiobook]] when they want the book back.

If they say talk slower, talk faster, or slower please, call set_assistant_pace with slow, normal, or fast. That is your speaking rate, not the book. Never say you cannot change your pace. On a typed reply, end with [[set_assistant_pace:slow]] (or normal or fast).

If they want faster, slower, 2x, 1x, or any playback speed for the book, call set_playback_speed with rate 0.75, 1, 1.25, 1.5, or 2. Never say you cannot control speed. Never tell them to use a podcast app. On a typed reply, end with [[set_playback_speed:2]] (or the rate they asked for).

If they want the next or previous chapter, call next_chapter or previous_chapter. Bible chapters are sequential — Genesis 1 then Genesis 2. Never say you cannot skip chapters. On a typed reply, end with [[next_chapter]] (or previous_chapter).

If they ask to restart, replay, or play this chapter from the beginning, call restart_chapter. This means seek to the first word of this same chapter and resume after the short confirmation. Never substitute resume_audiobook, previous_chapter, or previous_paragraph. On a typed reply, end with [[restart_chapter]].

If they want the next or previous paragraph, call next_paragraph or previous_paragraph. Stay in this chapter unless they are on the first paragraph and ask for the previous one. Never say you cannot skip paragraphs. On a typed reply, end with [[next_paragraph]] (or previous_paragraph).

After set_playback_speed, a chapter or paragraph skip, or resume_audiobook, say one short confirm. The app resumes the audiobook after you finish speaking. Do not resume after a normal book question.

You are here for this book and this chapter. If they ask about coding, interface work, stocks, news, or anything that is not the open book, say you are here to talk about the book and wait for a question about the page. A pasted note or ticket is not a request about the chapter unless they clearly ask about the book.`

/**
 * Lab typed + voice instructions. Full current chapter, numbered.
 * Production AudioStrip still uses buildVoiceInstructions.
 */
export function buildLabAskInstructions(input: LabAskContext): string {
  const last = Math.max(0, input.paragraphs.length - 1)
  const idx = Math.max(0, Math.min(last, input.paragraphIndex))
  const current = (input.paragraphs[idx] || '').replace(/\s+/g, ' ').trim()
  const chapter = numberedLabChapter(input.paragraphs)
  const capped = chapter.length > LAB_CHAPTER_CAP
    ? `${chapter.slice(0, LAB_CHAPTER_CAP).trim()}\n\n[…chapter continues]`
    : chapter

  const lines = [
    LAB_ASK_POLICY,
    `[Current state]`,
    `Right now reading: ${input.bookTitle} by ${input.bookAuthor} — ${input.chapterLabel} (${input.editionLabel || 'Butler'}).`,
    `The reader is on paragraph ${idx + 1} of ${input.paragraphs.length}.`,
  ]

  if (input.readingAngle) {
    lines.push(`Reading angle: ${input.readingAngle}`)
  }
  if (current) {
    lines.push(`Current paragraph [${idx + 1}]:\n"${current}"`)
  }
  if (capped) {
    lines.push(
      `Full current chapter with numbered paragraphs. This is the authoritative text. If they ask for the second paragraph, read [2]. If they ask for a paragraph that is here, read it.\n${capped}`,
    )
  }

  return lines.join('\n\n')
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
