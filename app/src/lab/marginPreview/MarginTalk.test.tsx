// @vitest-environment jsdom
/**
 * Talk in the margin reader, the wiring: the frame's start asks for the microphone in the tap and starts the book
 * reader's voice session once the place is in its options; each turn goes to the frame's Chat; End stops the session
 * and tells the frame; an own book sends no id or edition. The voice session is a mock.
 */
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const voice = vi.hoisted(() => ({ options: null as null | Record<string, unknown>, calls: [] as string[], error: null as string | null }))
vi.mock('../../hooks/useVoiceSession', () => ({
  useVoiceSession: (options: Record<string, unknown>) => {
    voice.options = options
    const call = (name: string) => () => { voice.calls.push(name) }
    return { connection: 'idle', activity: 'idle', micMuted: false, isActive: false, error: voice.error, getAssistantLevel: () => null, setMicMuted: call('mute'),
      start: async () => { voice.calls.push('start') }, stop: call('stop'), setAssistantSpeed: (speed: number) => { voice.calls.push(`speed:${speed}`) }, prime: call('prime'), unlockAudio: call('unlock'), releasePrimed: call('release') }
  },
}))
vi.mock('../labAuth', () => ({ readSupabaseAccessToken: () => Promise.resolve('token') }))

const { useMarginTalk } = await import('./MarginTalk')
const context = { bookTitle: 'Own', bookAuthor: 'A', chapterNumber: 3, chapterLabel: 'Three', paragraphs: ['One.', 'Two.', 'Three.'], paragraphIndex: 1, turns: [{ role: 'user' as const, content: 'Hello' }] }

afterEach(() => { voice.calls = []; voice.options = null; voice.error = null })

function mount(privateBook: boolean) {
  const frame = { TinctReaderTalk: { turn: vi.fn(), ended: vi.fn(), failed: vi.fn() }, document } as unknown as Window
  const pauseListen = vi.fn(), onAccount = vi.fn()
  const hook = renderHook(() => useMarginTalk({ bookId: privateBook ? 'userbook-abab' : 'frankenstein', editionKey: privateBook ? null : 'original-en', privateBook, frame: () => frame, signedIn: true, onAccount, pauseListen }))
  return { ...hook, frame, pauseListen, onAccount }
}

describe('useMarginTalk', () => {
  it('start: the microphone in the tap, the narration paused, then the session with the place', async () => {
    const { result, pauseListen } = mount(true)
    act(() => result.current.api.start(Promise.resolve(context)))
    expect(voice.calls.slice(0, 2)).toEqual(['unlock', 'prime'])
    expect(pauseListen).toHaveBeenCalled()
    await waitFor(() => expect(voice.calls).toContain('start'))
    expect(voice.options).toMatchObject({ chapterParagraphs: context.paragraphs, paragraphIndex: 1, chapterNumber: 3, bookTitle: 'Own', mode: 'conversation', editionKey: undefined })
    // An own book: neither its id nor an edition is in the reference.
    expect(String(voice.options!.reference)).not.toMatch(/userbook|abab/)
    expect(String(voice.options!.reference)).toContain('Two.')
    expect(result.current.surface).not.toBeNull()
  })

  it('each turn goes to the frame’s Chat; End stops the session and tells the frame', async () => {
    const { result, frame } = mount(false)
    act(() => result.current.api.start(context))
    await waitFor(() => expect(voice.calls).toContain('start'))
    act(() => (voice.options!.appendLocalMessage as (m: unknown) => void)({ role: 'assistant', content: 'An answer.' }))
    expect(frame.TinctReaderTalk!.turn).toHaveBeenCalledWith('assistant', 'An answer.')
    expect(voice.options).toMatchObject({ editionKey: 'original-en', bookId: 'frankenstein' })
    act(() => result.current.api.stop())
    expect(voice.calls).toContain('stop')
    expect(frame.TinctReaderTalk!.ended).toHaveBeenCalled()
    expect(result.current.surface).toBeNull()
  })

  it('Grok\u2019s voice failing ends the call and leaves Chat in text, never another voice', async () => {
    const { result, rerender, frame } = mount(true)
    act(() => result.current.api.start(context))
    await waitFor(() => expect(voice.calls).toContain('start'))
    voice.error = 'Voice could not reach Tinct.'
    rerender()
    expect(voice.calls).toContain('stop')
    expect(frame.TinctReaderTalk!.failed).toHaveBeenCalledWith('Voice could not reach Tinct.')
    expect(frame.TinctReaderTalk!.ended).not.toHaveBeenCalled()
    expect(result.current.surface).toBeNull()
  })

  it('Talk\u2019s speed is the reader\u2019s saved one, and a new one is saved and applied', async () => {
    localStorage.setItem('tinct-lab-prefs', JSON.stringify({ talkSpeed: 1.25 }))
    const { result } = mount(false)
    act(() => result.current.api.start(context))
    await waitFor(() => expect(voice.calls).toContain('start'))
    expect(voice.options).toMatchObject({ assistantSpeed: 1.25 })
    act(() => (voice.options!.onSetAssistantPace as (p: string) => void)('slower'))
    expect(JSON.parse(localStorage.getItem('tinct-lab-prefs')!)).toMatchObject({ shared: expect.objectContaining({ talkSpeed: expect.any(Number) }) })
    localStorage.clear()
  })

  it('a guest whose trial is used is sent to the account', () => {
    const { onAccount } = mount(false)
    act(() => (voice.options!.onGuestTrial as (e: string) => void)('refused'))
    expect(onAccount).toHaveBeenCalled()
  })
})
