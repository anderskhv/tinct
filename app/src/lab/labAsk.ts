import { nearbyParagraphWindow } from '../voice/context'
import type { VoicePhase, VoiceReaderContext } from '../voice/types'
import { storage } from '../services/storage'

export type LabConversationState = 'idle' | 'listening' | 'thinking' | 'speaking'

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

export function labVoiceContext(input: {
  bookTitle: string
  bookAuthor: string
  chapterLabel: string
  paragraphs: string[]
  paragraphIndex: number
  readingAngle?: string
}): VoiceReaderContext {
  const last = Math.max(0, input.paragraphs.length - 1)
  const idx = Math.max(0, Math.min(last, input.paragraphIndex))
  const current = input.paragraphs[idx] || ''
  const nearby = nearbyParagraphWindow(input.paragraphs, idx)
  return {
    bookTitle: input.bookTitle,
    bookAuthor: input.bookAuthor,
    chapterLabel: input.chapterLabel,
    readingAngle: input.readingAngle,
    currentParagraph: current,
    nearbyParagraphs: nearby,
    visibleText: [current, ...nearby].filter(Boolean).join('\n\n'),
  }
}

/** Map the live voice session onto the orb. Errors stay idle. */
export function labConversationState(input: {
  phase: VoicePhase
  starting?: boolean
  error?: string | null
}): LabConversationState {
  if (input.error) return 'idle'
  if (input.starting && input.phase === 'idle') return 'listening'
  return input.phase
}
