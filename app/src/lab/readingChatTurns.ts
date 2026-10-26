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
  return turns.filter(turn => !turn.shownExplanation && !hidden.has(turn.conversationId ?? ''))
}
