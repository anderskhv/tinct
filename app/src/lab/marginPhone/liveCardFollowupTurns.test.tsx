// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { liveCardFollowupTurns, PhonePassageBody } from './LabPhoneCards'
import type { LabAskTurn } from '../labAsk'
import { cleanup, render, screen } from '@testing-library/react'
import { turnsFromConversations } from '../labChatHistory'
import { catalogueCardConversation } from '../sharedReader/sharedReaderCards'
afterEach(cleanup)
const turn = (id: string, role: 'user' | 'assistant', content: string): LabAskTurn => ({ id, role, content, timestamp: 1000, source: 'typed', conversationId: 'mc_react_1000' })
describe('live card saved answer projection', () => {
  it('does not duplicate a live answer after its saved conversation hydrates', () => {
    const saved = catalogueCardConversation({ source: { kind: 'catalogue', bookId: 'bible' }, id: 'react_1000',
      kind: 'factcheck', chapterNumber: 1, text: 'A source claim',
      turns: [{ role: 'assistant', content: 'A saved fact-check answer.' }], at: 1000, u: 1000 })!
    const { rerender } = render(<PhonePassageBody lead={<p>A saved fact-check answer.</p>} turns={[]} pending={false} />)
    rerender(<PhonePassageBody lead={<p>A saved fact-check answer.</p>}
      turns={liveCardFollowupTurns(turnsFromConversations([saved]), 1000)} pending={false} />)
    expect(screen.getAllByText('A saved fact-check answer.')).toHaveLength(1)
    expect(saved.messages.filter(message => message.role === 'assistant')).toHaveLength(1)
  })

  it('omits an owned initial answer while retaining discussion and saved data', () => {
    const turns = [turn('mc_react_1000:0', 'assistant', 'Evaluate answer'), turn('follow', 'user', 'Why?'), turn('reply', 'assistant', 'Because.')]
    expect(liveCardFollowupTurns(turns, 1000).map(t => t.content)).toEqual(['Why?', 'Because.'])
    expect(turns).toHaveLength(3)
  })
  it('omits catalogue synthetic action and answer but preserves repeated follow-ups', () => {
    const turns = [turn('mc_react_1000:0', 'user', 'Evaluate'), turn('mc_react_1000:1', 'assistant', 'Answer'), turn('u', 'user', 'Again'), turn('a', 'assistant', 'Answer')]
    expect(liveCardFollowupTurns(turns, 1000).map(t => t.id)).toEqual(['u', 'a'])
  })
})
