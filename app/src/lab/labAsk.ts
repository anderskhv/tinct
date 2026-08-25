import type { VoiceModeState } from '../voice/types'
import { storage } from '../services/storage'
import {
  buildLabAskInstructions as buildLabCompanionAskInstructions,
  numberedLabChapter,
  type LabAskContext,
} from './labCompanion'

export { numberedLabChapter }
export type { LabAskContext }

export type LabConversationState = 'idle' | 'connecting' | 'listening' | 'speaking'

export interface LabAskTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
  source: 'typed' | 'voice'
}

/** Voice restates replace the last same-role turn. Exact dupes are skipped. */
export function mergeLabVoiceTurn(turns: LabAskTurn[], incoming: LabAskTurn): LabAskTurn[] {
  const last = turns[turns.length - 1]
  if (last && last.role === incoming.role) {
    if (last.content === incoming.content) return turns
    return [...turns.slice(0, -1), { ...last, content: incoming.content, source: incoming.source }]
  }
  return [...turns, incoming]
}

export function labReadingAngle(): string | undefined {
  const prefs = storage.get<{ readingObjective?: string }>('preferences')
  const angle = prefs?.readingObjective?.trim()
  return angle || undefined
}

export const LAB_ASK_POLICY = `You are Tinct's reading companion beside the page on /lab. This is a conversation next to the open chapter, not an in-car interruption.

Hard spoiler rule: you only have the current chapter. Nothing after it exists for you — no later books, no Book 3, no ending, no plot that is not in this chapter. If asked for the ending or anything after this chapter, say you only have this chapter so far.

If they ask you to read a paragraph that is in the chapter payload below, read it from that payload. Do not ask them to paste. Do not say you lack the book.

Stay in the conversation. Do not resume an audiobook or hand control back to playback.

If they ask about coding, UI, stocks, news, or paste a note that is not about the chapter, say you are here to talk about the book and wait.`

/** Lab typed Chat uses the production companion prompt plus spoiler-safe chapter text. */
export function buildLabAskInstructions(input: LabAskContext): string {
  return buildLabCompanionAskInstructions(input)
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
