import { describe, expect, it } from 'vitest'
import { readAnthropicResponse } from './labCompanion'

function stream(events: unknown[]) {
  return new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join(''), {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
const text = { type: 'content_block_delta', delta: { type: 'text_delta', text: 'A partial answer.' } }

describe('typed answer stream recovery', () => {
  it('preserves a partial answer but rejects an abrupt end as incomplete', async () => {
    const shown: string[] = []
    await expect(readAnthropicResponse(stream([text]), value => shown.push(value))).rejects.toThrow('The answer was interrupted')
    expect(shown).toEqual(['A partial answer.'])
  })

  it('turns an overload event into a readable error without exposing provider text', async () => {
    await expect(readAnthropicResponse(stream([
      text,
      { type: 'error', error: { type: 'overloaded_error', message: 'provider internals' } },
    ]))).rejects.toThrow('The answer service is busy. Please try again shortly.')
  })

  it('accepts a completed response and does not replay it', async () => {
    await expect(readAnthropicResponse(stream([
      text, { type: 'message_delta', delta: { stop_reason: 'end_turn' } }, { type: 'message_stop' },
    ]))).resolves.toBe('A partial answer.')
  })
})
