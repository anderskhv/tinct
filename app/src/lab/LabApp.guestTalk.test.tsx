// @vitest-environment jsdom
//
// A signed-out guest's Talk trial in the book reader (Anders, 16 Oct 2026):
// the first Talk of the day opens the call through Tinct's relay; at two
// minutes the call closes and the account sheet says "Create a free account
// to keep talking"; a second attempt that day goes straight to the sheet.
// Signed-in Talk is unchanged. The relay and xAI are fakes.
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'
import { LAB_TALK_TRIAL_KEY } from './labAccountPrompt'
import { LAB_COPY } from './labCopy'

let Controller: typeof import('../voice/GrokVoiceSessionController').GrokVoiceSessionController
beforeAll(async () => {
  Controller = (await import('../voice/GrokVoiceSessionController')).GrokVoiceSessionController
})

const sockets: FakeSocket[] = []
class FakeSocket extends EventTarget {
  readyState = 1
  constructor(public url: string, public protocols: string[]) {
    super()
    sockets.push(this)
    // The provider (through the relay) opens the session at once.
    setTimeout(() => { this.serve('session.created'); this.serve('session.updated') }, 0)
  }
  send() {}
  close() { this.readyState = 3 }
  serve(type: string) { this.dispatchEvent(Object.assign(new Event('message'), { data: JSON.stringify({ type }) })) }
  drop(code: number) { this.dispatchEvent(Object.assign(new Event('close'), { code })) }
}

function stubTalk() {
  sockets.length = 0
  const track = { stop: vi.fn(), enabled: true, onended: null }
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: async () => ({ getTracks: () => [track], getAudioTracks: () => [track] }) } })
  vi.stubGlobal('WebSocket', FakeSocket)
  // jsdom has no Web Audio: the capture graph is the one part left out.
  vi.spyOn(Controller.prototype as unknown as { startCapture: () => void }, 'startCapture').mockImplementation(() => {})
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.endsWith('/api/lab-voice-session')) return Response.json({ value: 'payload.mac', expires_at: 1, model: 'grok-voice-latest', relay: '/api/lab-voice-relay', max_seconds: 120 })
    if (url.endsWith('/api/voice-session')) return Response.json({ value: 'xai-secret', model: 'grok-voice-latest' })
    return new Response('{}', { status: 404 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const sessionCalls = (fetchMock: ReturnType<typeof stubTalk>, path: string) => fetchMock.mock.calls.filter(call => String(call[0]).endsWith(path)).length

function talk() {
  if (!screen.queryByTestId('lab-super-menu')) fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-talk'))
}

beforeEach(() => { localStorage.removeItem(LAB_TALK_TRIAL_KEY) })
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
})

for (const layout of ['phone', 'desktop'] as const) {
  it(`gives a ${layout} guest one Talk call, then the account sheet when the two minutes end, and the sheet straight away on a second try`, async () => {
    const fetchMock = stubTalk()
    render(<LabApp pathname={`/lab/${layout}`} source={fallbackLabSource()} online authToken={null} />)
    talk()
    await waitFor(() => expect(sockets).toHaveLength(1))
    expect(new URL(sockets[0].url).pathname).toBe('/api/lab-voice-relay')
    expect(sessionCalls(fetchMock, '/api/voice-session')).toBe(0)
    await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-chrome-state')).toBe('talking'))
    expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
    expect(localStorage.getItem(LAB_TALK_TRIAL_KEY)).toBe(new Date().toISOString().slice(0, 10))

    // The relay closes the call at two minutes.
    act(() => sockets[0].drop(4000))
    const sheet = await screen.findByTestId('lab-account-sheet')
    expect(sheet.getAttribute('data-action')).toBe('voice')
    expect(screen.getByText(LAB_COPY.accountTitleTalk)).toBeTruthy()
    expect(LAB_COPY.accountTitleTalk).toBe('Create a free account to keep talking')
    expect(screen.queryByTestId('lab-call')).toBeNull()
    expect(screen.queryByTestId('lab-voice-notice')).toBeNull()

    fireEvent.click(screen.getByTestId('lab-account-dismiss'))
    await waitFor(() => expect(screen.queryByTestId('lab-account-sheet')).toBeNull())

    // A second attempt that day: the sheet, with no session requested.
    talk()
    expect((await screen.findByTestId('lab-account-sheet')).getAttribute('data-action')).toBe('voice')
    expect(sessionCalls(fetchMock, '/api/lab-voice-session')).toBe(1)
    expect(sockets).toHaveLength(1)
  })
}

it('sends a guest whose trial the Worker already counted today (another device on this network) to the sheet', async () => {
  const fetchMock = stubTalk()
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => String(input).endsWith('/api/lab-voice-session')
    ? Response.json({ error: 'Create a free account to keep talking.', code: 'talk_trial_used' }, { status: 429 })
    : new Response('{}', { status: 404 }))
  render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} online authToken={null} />)
  talk()
  expect((await screen.findByTestId('lab-account-sheet')).getAttribute('data-action')).toBe('voice')
  await waitFor(() => expect(screen.queryByTestId('lab-call')).toBeNull())
  expect(screen.queryByTestId('lab-voice-notice')).toBeNull()
  expect(sockets).toHaveLength(0)
})

it('leaves signed-in Talk unchanged: the account route, the xAI secret, no sheet, no trial mark', async () => {
  const fetchMock = stubTalk()
  render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} online authToken="reader-token" />)
  talk()
  await waitFor(() => expect(sockets).toHaveLength(1))
  expect(sockets[0].url.startsWith('wss://api.x.ai/v1/realtime')).toBe(true)
  expect(sockets[0].protocols).toEqual(['xai-client-secret.xai-secret'])
  expect(sessionCalls(fetchMock, '/api/lab-voice-session')).toBe(0)
  await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())
  expect(screen.queryByTestId('lab-account-sheet')).toBeNull()
  expect(localStorage.getItem(LAB_TALK_TRIAL_KEY)).toBeNull()
})
