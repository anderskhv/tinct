import { expect, it } from 'vitest'
import { catalogueCardConversation } from './sharedReader/sharedReaderCards'
import { turnsFromConversations } from './labChatHistory'
import { readingChatTurns } from './readingChatTurns'

it('keeps standalone AI and quizzes in Notebook, then includes an entire discussed card without changing storage', () => {
  const rows = (['explain', 'simplify', 'quiz', 'ask'] as const).map(kind => catalogueCardConversation({
    source: { kind: 'catalogue', bookId: 'bible' }, id: kind, kind, chapterNumber: 1,
    text: 'Exact source words', turns: [{ role: 'assistant', content: `${kind} answer` }], at: 1000, u: 1000,
  })!)
  const turns = turnsFromConversations(rows)
  const before = JSON.stringify(rows)
  expect(readingChatTurns(turns, rows).map(turn => turn.conversationId)).toEqual(['mc_ask', 'mc_ask'])
  const followup = { id: 'follow', role: 'user' as const, content: 'Why?', source: 'typed' as const, conversationId: 'mc_explain', timestamp: 2000 }
  expect(readingChatTurns([...turns, followup], rows).map(turn => turn.id)).toEqual(['mc_ask:0', 'mc_explain:0', 'mc_ask:1', 'mc_explain:1', 'follow'])
  expect(JSON.stringify(rows)).toBe(before)
})
