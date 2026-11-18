// @vitest-environment jsdom
//
// A signed-out guest's Talk trial (Anders, 16 Oct 2026) on the session
// controller: the call goes through Tinct's relay with a ticket, ends
// gracefully at two minutes (the client's timer or the relay's close), and a
// used trial is a refusal for the account sheet, not an error. Signed-in Talk
// is unchanged. No real socket or provider is ever opened.
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StartVoiceSessionInput } from './session'

vi.mock('../utils/funnel', () => ({ trackFunnel: vi.fn(), trackFunnelOnce: vi.fn() }))
const { GrokVoiceSessionController, TALK_TRIAL_CLOSE_CODE, TALK_TRIAL_USED_CODE } = await import('./GrokVoiceSessionController')

const context = { bookId: 'bible', bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Genesis 1' }
const guest: StartVoiceSessionInput = { authToken: null, isAnonymous: true, labGuest: true, context, audio: { pausePlayback: () => null, resumePlayback: vi.fn() }, wasPlaying: false }
const reader: StartVoiceSessionInput = { ...guest, authToken: 'reader-token', isAnonymous: false }

const sockets: FakeSocket[] = []
class FakeSocket extends EventTarget {
  readyState = 1
  sent: string[] = []
  constructor(public url: string, public protocols: string[]) { super(); sockets.push(this) }
  send(data: string) { this.sent.push(data) }
  close() { this.readyState = 3 }
  serve(type: string) { this.dispatchEvent(Object.assign(new Event('message'), { data: JSON.stringify({ type }) })) }
  drop(code: number) { this.dispatchEvent(Object.assign(new Event('close'), { code })) }
}

function setup(reply: { status: number; body: Record<string, unknown> }) {
  vi.useFakeTimers()
  sockets.length = 0
  const track = { stop: vi.fn(), onended: null }
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track], getAudioTracks: () => [track] }) } })
  vi.stubGlobal('AudioContext', vi.fn())
  vi.stubGlobal('WebSocket', FakeSocket)
  const fetchMock = vi.fn(async () => ({ ok: reply.status === 200, status: reply.status, json: async () => reply.body }))
  vi.stubGlobal('fetch', fetchMock)
  const trial = vi.fn()
  const snapshots: Array<{ isActive: boolean; error: string | null }> = []
  const controller = new GrokVoiceSessionController({ onSnapshot: snapshot => snapshots.push(snapshot), onTurn: vi.fn(), onGuestTrial: trial })
  Object.assign(controller, { startCapture: vi.fn() })
  return { controller, fetchMock, trial, snapshots }
}

async function connect(controller: InstanceType<typeof GrokVoiceSessionController>, input: StartVoiceSessionInput) {
  const started = controller.start(input)
  await vi.advanceTimersByTimeAsync(0)
  const socket = sockets.at(-1)!
  socket.serve('session.created')
  socket.serve('session.updated')
  await vi.advanceTimersByTimeAsync(100)
  await started
  return socket
}

const ticketReply = { status: 200, body: { value: 'payload.mac', expires_at: 1, model: 'grok-voice-latest', relay: '/api/lab-voice-relay', max_seconds: 120 } }

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

describe('guest Talk trial in the session controller', () => {
  it('starts a guest call through the relay with the ticket, never an xAI secret or a bearer', async () => {
    const { controller, fetchMock, trial } = setup(ticketReply)
    const socket = await connect(controller, guest)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/lab-voice-session')
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined()
    expect(new URL(socket.url).pathname).toBe('/api/lab-voice-relay')
    expect(socket.url.startsWith('ws')).toBe(true)
    expect(socket.protocols).toEqual(['tinct-ticket.payload.mac'])
    expect(controller.getSnapshot()).toMatchObject({ isActive: true, connection: 'connected', error: null })
    expect(trial).toHaveBeenCalledWith('started')
  })

  it('ends the call gracefully at two minutes and tells the host the trial ended', async () => {
    const { controller, trial } = setup(ticketReply)
    await connect(controller, guest)
    await vi.advanceTimersByTimeAsync(119_000)
    expect(controller.getSnapshot().isActive).toBe(true)
    await vi.advanceTimersByTimeAsync(1_000)
    expect(controller.getSnapshot()).toMatchObject({ isActive: false, error: null })
    expect(trial.mock.calls.map(call => call[0])).toEqual(['started', 'ended'])
  })

  it("treats the relay's two-minute close as the trial's end, not a lost connection", async () => {
    const { controller, trial } = setup(ticketReply)
    const socket = await connect(controller, guest)
    socket.drop(TALK_TRIAL_CLOSE_CODE)
    expect(controller.getSnapshot()).toMatchObject({ isActive: false, error: null })
    expect(trial).toHaveBeenLastCalledWith('ended')
  })

  it('a used trial is a refusal for the account sheet: no socket, no error', async () => {
    const { controller, trial } = setup({ status: 429, body: { error: 'Create a free account to keep talking.', code: TALK_TRIAL_USED_CODE } })
    const started = controller.start(guest)
    await vi.advanceTimersByTimeAsync(0)
    await started
    expect(sockets).toHaveLength(0)
    expect(controller.getSnapshot()).toMatchObject({ isActive: false, error: null })
    expect(trial.mock.calls.map(call => call[0])).toEqual(['refused'])
  })

  it('leaves a signed-in reader unchanged: the account route, the xAI secret, no time limit', async () => {
    const { controller, fetchMock, trial } = setup({ status: 200, body: { value: 'xai-secret', model: 'grok-voice-latest' } })
    const socket = await connect(controller, reader)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/voice-session')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer reader-token')
    expect(socket.url.startsWith('wss://api.x.ai/v1/realtime')).toBe(true)
    expect(socket.protocols).toEqual(['xai-client-secret.xai-secret'])
    await vi.advanceTimersByTimeAsync(10 * 60_000)
    expect(controller.getSnapshot().isActive).toBe(true)
    // A 4000 close on the provider's own socket is a lost connection, as before.
    socket.drop(TALK_TRIAL_CLOSE_CODE)
    expect(controller.getSnapshot().error).toBeTruthy()
    expect(trial).not.toHaveBeenCalled()
  })
})
