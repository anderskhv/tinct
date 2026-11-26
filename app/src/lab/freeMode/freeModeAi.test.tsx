// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useLabAsk, type UseLabAskOptions } from '../useLabAsk'
import { LAB_AI_ACTIONS_KEY, LAB_FREE_AI_ACTIONS, readLabAiActionCount } from '../labAccountPrompt'
import { installFreeModeGuard } from './freeMode'

vi.mock('../../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }),
}))
vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }))

// The reader in free mode: a guest (main.tsx passes `authToken={null}`), behind the free-mode request guard.
const guest: UseLabAskOptions = {
  bookId: 'meditations',
  editionKey: 'modern-en',
  bookTitle: 'Meditations',
  bookAuthor: 'Marcus Aurelius',
  chapterLabel: 'Book 1',
  chapterNumber: 1,
  paragraphs: ['From my grandfather Verus I learned good morals.'],
  paragraphIndex: 0,
  signedIn: false,
  authToken: null,
  userId: null,
  voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'],
}

const answer = () => new Response(JSON.stringify({ content: [{ text: 'Verus taught him to keep his temper.' }] }), { headers: { 'Content-Type': 'application/json' } })

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks() })

describe('free reading mode offers a guest’s AI actions on the device’s free allowance', () => {
  it('sends Explain to the guest companion, counts each on the shared device counter, and shows the account sheet on the 11th', async () => {
    const network = vi.fn(async () => answer())
    // The network under the guard: the guard wraps whatever `fetch` the window has.
    const win = { location: { origin: window.location.origin }, fetch: network as unknown as typeof fetch, navigator: { sendBeacon: () => true } as unknown as Navigator }
    installFreeModeGuard(win)
    vi.stubGlobal('fetch', win.fetch)
    const onAccountPrompt = vi.fn()
    const { result } = renderHook(() => useLabAsk({ ...guest, onAccountPrompt }))

    for (let i = 1; i <= LAB_FREE_AI_ACTIONS; i += 1) {
      let text = ''
      await act(async () => {
        text = await result.current.explainSelection({ text: `Passage ${i}`, editionKey: 'modern-en', paragraphs: guest.paragraphs, paragraphIndex: 0 }, vi.fn())
      })
      expect(text, `action ${i}`).toContain('Verus')
      expect(readLabAiActionCount(), `action ${i}`).toBe(i)
    }
    expect(network).toHaveBeenCalledTimes(LAB_FREE_AI_ACTIONS)
    for (const call of network.mock.calls as unknown as Array<[string, RequestInit]>) {
      expect(String(call[0])).toMatch(/\/api\/lab-chat$/)
      expect(new Headers(call[1].headers).has('Authorization')).toBe(false)
    }
    expect(onAccountPrompt).not.toHaveBeenCalled()

    // The 11th: the account sheet, nothing sent, nothing counted.
    await act(async () => {
      await expect(result.current.explainSelection({ text: 'Passage 11', editionKey: 'modern-en', paragraphs: guest.paragraphs, paragraphIndex: 0 }, vi.fn())).rejects.toThrow()
    })
    expect(onAccountPrompt).toHaveBeenCalledWith({ action: 'chat', text: undefined })
    expect(network).toHaveBeenCalledTimes(LAB_FREE_AI_ACTIONS)
    expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe(String(LAB_FREE_AI_ACTIONS))
  })

  it('shares the allowance with the normal reader: actions already used there count here', async () => {
    localStorage.setItem(LAB_AI_ACTIONS_KEY, String(LAB_FREE_AI_ACTIONS - 1))
    const network = vi.fn(async () => answer())
    const win = { location: { origin: window.location.origin }, fetch: network as unknown as typeof fetch, navigator: { sendBeacon: () => true } as unknown as Navigator }
    installFreeModeGuard(win)
    vi.stubGlobal('fetch', win.fetch)
    const onAccountPrompt = vi.fn()
    const { result } = renderHook(() => useLabAsk({ ...guest, onAccountPrompt }))
    await act(async () => { await result.current.sendTyped('Who was Verus?') })
    expect(network).toHaveBeenCalledTimes(1)
    await act(async () => { await result.current.sendTyped('And Rusticus?') })
    expect(network).toHaveBeenCalledTimes(1)
    expect(onAccountPrompt).toHaveBeenCalledWith({ action: 'chat', text: 'And Rusticus?' })
  })
})
