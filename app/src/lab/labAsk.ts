import type { VoiceModeState } from '../voice/types'
import { storage } from '../services/storage'

export type LabConversationState = 'idle' | 'listening' | 'speaking'

export interface LabAskTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
  source: 'typed' | 'voice'
}

export function labReadingAngle(): string | undefined {
  const prefs = storage.get<{ readingObjective?: string }>('preferences')
  const angle = prefs?.readingObjective?.trim()
  return angle || undefined
}

export interface LabConversationContextInput {
  bookTitle: string
  bookAuthor: string
  chapterLabel: string
  paragraphs: string[]
  paragraphIndex: number
  readingAngle?: string
}

/**
 * Desk conversation beside the page. Not the in-car VOICE_AGENT_POLICY
 * (no 20–30s cap, no “return control to audiobook”, no no-follow-up).
 */
export const LAB_CONVERSATION_POLICY = `You are Tinct's reading companion beside this page. This is a conversation at the desk, not an in-car interruption.

You have the full current chapter below, with numbered paragraphs. Treat that payload as the book you have.

Rules:
- When the reader asks you to read a paragraph that is in the numbered chapter below, read that paragraph. Do not ask them to paste it. Do not say you lack the book. Do not say you only know “visible text.”
- Hard spoiler rule: nothing after the current chapter. No ending. No later books or chapters, including Book 3. Do not invent or recall plot that is not in this chapter. If they ask how the Odyssey ends, what happens next, or for a later book, say you only have this chapter so far.
- Stay with the reader. Answer fully enough to be useful. Do not try to return control to an audiobook. Do not close after one short answer. Do not invite them to get back to the book unless they ask.`

export function numberedChapterParagraphs(paragraphs: string[]): string {
  return paragraphs
    .map((text, index) => `${index + 1}. ${text.replace(/\s+/g, ' ').trim()}`)
    .filter(line => /\S/.test(line.slice(line.indexOf('.') + 1)))
    .join('\n\n')
}

export function buildLabConversationInstructions(input: LabConversationContextInput): string {
  const last = Math.max(0, input.paragraphs.length - 1)
  const idx = Math.max(0, Math.min(last, input.paragraphIndex))
  const lines = [
    LAB_CONVERSATION_POLICY,
    '',
    '[Current chapter]',
    `${input.bookTitle} by ${input.bookAuthor} — ${input.chapterLabel}`,
    `The reader is on paragraph ${idx + 1} of ${input.paragraphs.length}.`,
  ]

  if (input.readingAngle) {
    lines.push(`Reading angle: ${input.readingAngle}`)
  }

  lines.push('', 'Numbered paragraphs of this chapter:', numberedChapterParagraphs(input.paragraphs))
  return lines.join('\n')
}

/**
 * Orb / composer phase from the live voice machine.
 * Listening stays listening through speech_stopped. Speaking only after
 * the model is answering with audio. There is no timed thinking state.
 */
export function labConversationState(input: {
  voiceState: VoiceModeState
  error?: string | null
}): LabConversationState {
  if (input.error) return 'idle'
  if (input.voiceState === 'listening') return 'listening'
  if (input.voiceState === 'answering') return 'speaking'
  return 'idle'
}
