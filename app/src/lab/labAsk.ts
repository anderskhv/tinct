import type { VoiceModeState } from '../voice/types'
import { storage } from '../services/storage'

export type LabConversationState = 'idle' | 'connecting' | 'listening' | 'speaking'

export interface LabAskTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
  source: 'typed' | 'voice'
}

export interface LabAskContext {
  bookTitle: string
  bookAuthor: string
  chapterLabel: string
  chapterNumber?: number
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

Hard spoiler rule: you only have the current chapter. Nothing after it exists for you — no later books, no Book 3, no ending, no plot that is not in this chapter. If asked for the ending or anything after this chapter, say you only have this chapter so far.

If they ask you to read a paragraph that is in the chapter payload below, read it from that payload. Do not ask them to paste. Do not say you lack the book.

Stay in the conversation. Do not resume an audiobook or hand control back to playback.

If they ask about coding, UI, stocks, news, or paste a note that is not about the chapter, say you are here to talk about the book and wait.`

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
    `Right now reading: ${input.bookTitle} by ${input.bookAuthor} — ${input.chapterLabel} (Butler).`,
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
      `Full current chapter with numbered paragraphs. This is the authoritative text. If they ask for the second paragraph of Book 1, read [2]. If they ask for a paragraph that is here, read it.\n${capped}`,
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
  if (input.starting || input.voiceState !== 'reading') return 'connecting'
  return 'idle'
}
