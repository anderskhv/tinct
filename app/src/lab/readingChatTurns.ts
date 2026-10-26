import type { ChatConversation } from '../types'
import type { LabAskTurn } from './labAsk'

/** Presentation only: saved cards remain in Notebook, but join Chat only when discussed. */
export function readingChatTurns(turns: LabAskTurn[], conversations: ChatConversation[]): LabAskTurn[] {
  const hidden = new Set<string>()
  for (const row of conversations) {
    if (!row.card) continue
    if (row.card.kind === 'quiz') { hidden.add(row.id); continue }
    if (row.card.kind === 'ask') continue
    const firstAnswer = row.messages.findIndex(message => message.role === 'assistant')
    const seedIds = new Set(row.messages.slice(0, firstAnswer + 1).map(message => message.id))
    const discussed = row.messages.slice(firstAnswer + 1).some(message => message.role === 'user')
      || turns.some(turn => turn.conversationId === row.id && turn.role === 'user' && !seedIds.has(turn.id))
    if (!discussed) hidden.add(row.id)
  }
  // Legacy keepExplanation turns are created only by an explicit Chat/Talk handoff.
  return turns.filter(turn => !hidden.has(turn.conversationId ?? ''))
}

/** Prefer the latest question already in the live thread over a pre-send saved snapshot. */
export function readingChatFocusTurn(turns: LabAskTurn[], conversation: ChatConversation | null): string | undefined {
  if (!conversation) return undefined
  return [...turns].reverse().find(turn => turn.conversationId === conversation.id && turn.role === 'user')?.id
    ?? [...conversation.messages].reverse().find(message => message.role === 'user')?.id
}
