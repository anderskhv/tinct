// @vitest-environment jsdom
/**
 * A Chat answer cut off by its length bound (Bible chat, 21 Oct 2026) is never
 * shown or saved as finished: it carries Continue under it, keeps its copy
 * mark, and a continued answer replaces it in the saved history as one answer.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabAskPane } from './LabAskPane'
import type { LabAskTurn } from './labAsk'
import { appendLabChatTurn, readLabBookChat, turnsFromConversations } from './labChatHistory'
import { readAnthropicAnswer } from './labCompanion'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const question: LabAskTurn = { id: 'q1', role: 'user', content: 'Which ancient sources tell this story?', source: 'typed', timestamp: 1_790_000_000_000, bookId: 'bible' }
const cutOff: LabAskTurn = { id: 'a1', role: 'assistant', content: 'Polybius for the earlier background, then Diodorus Siculus, Justin/Trog', source: 'typed', timestamp: 1_790_000_000_001, bookId: 'bible', cutOff: true }

function pane(turns: LabAskTurn[], onContinue = vi.fn(), typedLoading = false) {
  return (
    <LabAskPane
      conversationState="idle"
      voiceActive={false}
      typedLoading={typedLoading}
      turns={turns}
      draft=""
      onDraftChange={vi.fn()}
      onSubmit={vi.fn()}
      onMic={vi.fn()}
      onContinue={onContinue}
    />
  )
}

describe('Continue under a cut-off answer', () => {
  it('shows Continue under a cut-off answer, keeps its copy mark, and continues that answer', () => {
    const onContinue = vi.fn()
    render(pane([question, cutOff], onContinue))
    const button = screen.getByTestId('lab-ask-continue')
    expect(button.textContent).toBe('Continue')
    expect(button.className).toContain('tc-older')
    const answer = screen.getAllByTestId('lab-ask-turn-assistant')[0]
    expect(answer.contains(button)).toBe(true)
    expect(answer.querySelector('[aria-label="Copy answer"]')).not.toBeNull()
    fireEvent.click(button)
    expect(onContinue).toHaveBeenCalledWith('a1')
  })

  it('shows no Continue under a finished answer, or while an answer is arriving', () => {
    const { rerender } = render(pane([question, { ...cutOff, cutOff: undefined }]))
    expect(screen.queryByTestId('lab-ask-continue')).toBeNull()
    rerender(pane([question, cutOff], vi.fn(), true))
    expect(screen.queryByTestId('lab-ask-continue')).toBeNull()
  })
})

describe('a cut-off answer in the stream and the saved history', () => {
  beforeEach(() => localStorage.clear())

  function stream(stopReason: string) {
    const body = [
      `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'Justin/Trog' } })}`,
      `data: ${JSON.stringify({ type: 'message_delta', delta: { stop_reason: stopReason } })}`,
      `data: ${JSON.stringify({ type: 'message_stop' })}`,
      '',
    ].join('\n')
    return new Response(body, { headers: { 'content-type': 'text/event-stream' } })
  }

  it('reads a stream that ends on max_tokens as cut off, and one that ends on end_turn as whole', async () => {
    expect(await readAnthropicAnswer(stream('max_tokens'))).toEqual({ text: 'Justin/Trog', cutOff: true })
    expect(await readAnthropicAnswer(stream('end_turn'))).toEqual({ text: 'Justin/Trog', cutOff: false })
  })

  it('saves a cut-off answer as incomplete, shows it with Continue on reload, and stores the continued answer once', () => {
    const at = 1_790_000_000_000
    appendLabChatTurn('bible', { id: 'q1', role: 'user', content: question.content, timestamp: at, bookId: 'bible', isComplete: true, source: 'text' }, 900, 0)
    appendLabChatTurn('bible', { id: 'a1', role: 'assistant', content: cutOff.content, timestamp: at + 1, bookId: 'bible', isComplete: false, cutOff: true, source: 'text' }, 900, 0)
    const saved = readLabBookChat('bible').flatMap(conversation => conversation.messages)
    expect(saved.find(message => message.id === 'a1')).toMatchObject({ isComplete: false, cutOff: true })
    const reloaded = turnsFromConversations(readLabBookChat('bible')).find(turn => turn.id === 'a1')
    expect(reloaded).toMatchObject({ cutOff: true })
    expect(reloaded?.cancelled).toBeUndefined()

    const joined = `${cutOff.content}us for the Seleucid side.`
    appendLabChatTurn('bible', { id: 'a1', role: 'assistant', content: joined, timestamp: at + 5_000, bookId: 'bible', isComplete: true, source: 'text' }, 900, 0)
    const messages = readLabBookChat('bible').flatMap(conversation => conversation.messages)
    expect(messages.filter(message => message.id === 'a1')).toHaveLength(1)
    const answer = messages.find(message => message.id === 'a1')!
    expect(answer.content).toBe(joined)
    expect(answer.isComplete).toBe(true)
    expect(answer.cutOff).toBeUndefined()
    // It keeps its place and time in the thread.
    expect(answer.timestamp).toBe(at + 1)
    expect(messages.map(message => message.id)).toEqual(['q1', 'a1'])
  })
})
