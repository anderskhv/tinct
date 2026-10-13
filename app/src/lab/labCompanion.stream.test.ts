import { describe, expect, it } from 'vitest'
import { readAnthropicResponse, readAnthropicStream } from './labCompanion'

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

  it('passes lookup status lines to the reader and keeps them out of the answer', async () => {
    const status = { type: 'tinct_status', text: 'Reading Jeremiah 32…' }
    const response = new Response([
      `event: tinct_status\ndata: ${JSON.stringify(status)}\n\n`,
      `event: content_block_delta\ndata: ${JSON.stringify(text)}\n\n`,
      `data: ${JSON.stringify({ type: 'message_delta', delta: { stop_reason: 'end_turn' } })}\n\n`,
      `data: ${JSON.stringify({ type: 'message_stop' })}\n\n`,
    ].join(''), { headers: { 'Content-Type': 'text/event-stream' } })
    const order: string[] = []
    const answer = await readAnthropicResponse(response, value => order.push(`text:${value}`), { onStatus: value => order.push(`status:${value}`) })
    expect(answer).toBe('A partial answer.')
    expect(order).toEqual(['status:Reading Jeremiah 32…', 'text:A partial answer.'])
  })

  it('ignores a status event when the caller does not listen for it', async () => {
    const shown: string[] = []
    const result = await readAnthropicStream(stream([
      { type: 'tinct_status', text: 'Checking sources…' }, text, { type: 'message_stop' },
    ]), value => shown.push(value))
    expect(result).toMatchObject({ text: 'A partial answer.', sawStop: true })
    expect(shown).toEqual(['A partial answer.'])
  })
})
