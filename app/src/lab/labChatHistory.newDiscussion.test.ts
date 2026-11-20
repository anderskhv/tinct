import { expect, it } from 'vitest'
import { appendLabChatTurnTo } from './labChatHistory'

it('starts independent selected-passage discussions and targets their later answers', () => {
  const user = { id: 'u1', role: 'user' as const, content: 'First passage?', timestamp: 1000, bookId: 'frankenstein' }
  const first = appendLabChatTurnTo([], 'frankenstein', user, 2, 3, 'first', true)
  const both = appendLabChatTurnTo(first, 'frankenstein', { ...user, id: 'u2', content: 'Second passage?', timestamp: 1001 }, 2, 6, 'second', true)
  expect(both.map(row => row.id)).toEqual(['first', 'second'])
  const answered = appendLabChatTurnTo(both, 'frankenstein', { ...user, id: 'a1', role: 'assistant', content: 'First answer', timestamp: 1002 }, 2, 3, 'first')
  expect(answered.find(row => row.id === 'first')?.messages.map(message => message.content)).toEqual(['First passage?', 'First answer'])
  expect(answered.find(row => row.id === 'second')?.messages.map(message => message.content)).toEqual(['Second passage?'])
  expect(appendLabChatTurnTo(both, 'frankenstein', user, 2, 3, 'missing')).toBe(both)
  expect(appendLabChatTurnTo(both, 'frankenstein', { ...user, role: 'assistant' }, 2, 3, 'missing', true)).toBe(both)
})
