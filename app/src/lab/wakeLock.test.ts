import { describe, expect, it, vi } from 'vitest'
import { holdScreenWakeLock } from './wakeLock'

function fakeEnv(visibility: 'visible' | 'hidden' = 'visible') {
  const listeners = new Set<() => void>()
  const sentinels: Array<{ released: boolean; release: ReturnType<typeof vi.fn>; onRelease?: () => void }> = []
  const request = vi.fn(async () => {
    const sentinel = {
      released: false,
      release: vi.fn(async () => { sentinel.released = true; sentinel.onRelease?.() }),
      addEventListener: (_type: 'release', listener: () => void) => { sentinel.onRelease = listener },
      onRelease: undefined as undefined | (() => void),
    }
    sentinels.push(sentinel)
    return sentinel
  })
  const doc = {
    visibilityState: visibility as DocumentVisibilityState,
    addEventListener: (_type: string, listener: () => void) => { listeners.add(listener) },
    removeEventListener: (_type: string, listener: () => void) => { listeners.delete(listener) },
  }
  const setVisibility = (next: DocumentVisibilityState) => {
    doc.visibilityState = next
    for (const listener of [...listeners]) listener()
  }
  // The browser drops the lock itself when the page is hidden.
  const browserRelease = () => { for (const s of sentinels) if (!s.released) { s.released = true; s.onRelease?.() } }
  return { env: { navigator: { wakeLock: { request } }, document: doc as unknown as Document }, request, sentinels, listeners, setVisibility, browserRelease }
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('holdScreenWakeLock', () => {
  it('requests a screen wake lock when held', async () => {
    const f = fakeEnv()
    holdScreenWakeLock(f.env)
    await flush()
    expect(f.request).toHaveBeenCalledWith('screen')
    expect(f.sentinels).toHaveLength(1)
  })

  it('releases the lock and stops listening on release', async () => {
    const f = fakeEnv()
    const hold = holdScreenWakeLock(f.env)
    await flush()
    hold.release()
    expect(f.sentinels[0].release).toHaveBeenCalledTimes(1)
    expect(f.listeners.size).toBe(0)
    f.setVisibility('visible')
    await flush()
    expect(f.request).toHaveBeenCalledTimes(1)
  })

  it('re-acquires when the page is visible again while still held', async () => {
    const f = fakeEnv()
    holdScreenWakeLock(f.env)
    await flush()
    f.setVisibility('hidden')
    f.browserRelease()
    await flush()
    expect(f.request).toHaveBeenCalledTimes(1)
    f.setVisibility('visible')
    await flush()
    expect(f.request).toHaveBeenCalledTimes(2)
    expect(f.sentinels[1].released).toBe(false)
  })

  it('does not stack a second lock while one is held', async () => {
    const f = fakeEnv()
    holdScreenWakeLock(f.env)
    await flush()
    f.setVisibility('visible')
    await flush()
    expect(f.request).toHaveBeenCalledTimes(1)
  })

  it('waits for visibility when started hidden', async () => {
    const f = fakeEnv('hidden')
    holdScreenWakeLock(f.env)
    await flush()
    expect(f.request).not.toHaveBeenCalled()
    f.setVisibility('visible')
    await flush()
    expect(f.request).toHaveBeenCalledTimes(1)
  })

  it('releases a lock that arrives after the hold ended', async () => {
    const f = fakeEnv()
    const hold = holdScreenWakeLock(f.env)
    hold.release()
    await flush()
    expect(f.sentinels).toHaveLength(1)
    expect(f.sentinels[0].release).toHaveBeenCalledTimes(1)
  })

  it('does not throw when the API is missing', () => {
    expect(() => holdScreenWakeLock({ navigator: {}, document: null }).release()).not.toThrow()
    expect(() => holdScreenWakeLock({ navigator: null, document: null }).release()).not.toThrow()
  })

  it('does not throw when the request is refused or throws', async () => {
    const rejected = { request: vi.fn(() => Promise.reject(new Error('NotAllowedError'))) }
    const thrown = { request: vi.fn(() => { throw new Error('boom') }) }
    expect(() => holdScreenWakeLock({ navigator: { wakeLock: rejected }, document: null }).release()).not.toThrow()
    expect(() => holdScreenWakeLock({ navigator: { wakeLock: thrown }, document: null }).release()).not.toThrow()
    await flush()
  })

  it('uses the global navigator by default and is silent without one', () => {
    expect(() => holdScreenWakeLock().release()).not.toThrow()
  })
})
