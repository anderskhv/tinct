import { describe, expect, it, vi } from 'vitest'
import { LAB_DEVICE_USER_KEY, reconcileLabDeviceIdentity, type LabDeviceIdentityDeps } from './labDeviceIdentity'

function deps(seed: Record<string, string> = {}) {
  const store = new Map(Object.entries(seed))
  const wipe = vi.fn(() => { store.clear() })
  const api: LabDeviceIdentityDeps = {
    read: key => store.get(key) ?? null,
    write: (key, value) => { store.set(key, value) },
    wipe,
  }
  return { api, store, wipe }
}

describe('reconcileLabDeviceIdentity', () => {
  it('signed out: nothing is recorded and nothing is wiped', () => {
    const d = deps({ [LAB_DEVICE_USER_KEY]: 'user-a' })
    expect(reconcileLabDeviceIdentity(null, d.api)).toBe('signed-out')
    expect(d.wipe).not.toHaveBeenCalled()
    expect(d.store.get(LAB_DEVICE_USER_KEY)).toBe('user-a')
  })

  it('first sign-in keeps the device: what is here was read signed out and is adoptable', () => {
    const d = deps({ 'tinct-lab-position': 'guest reading' })
    expect(reconcileLabDeviceIdentity('user-a', d.api)).toBe('first-sign-in')
    expect(d.wipe).not.toHaveBeenCalled()
    expect(d.store.get('tinct-lab-position')).toBe('guest reading')
    expect(d.store.get(LAB_DEVICE_USER_KEY)).toBe('user-a')
  })

  it('the same account returning changes nothing', () => {
    const d = deps({ [LAB_DEVICE_USER_KEY]: 'user-a', 'tinct-lab-position': 'their reading' })
    expect(reconcileLabDeviceIdentity('user-a', d.api)).toBe('same-account')
    expect(d.wipe).not.toHaveBeenCalled()
    expect(d.store.get('tinct-lab-position')).toBe('their reading')
  })

  it('a second provider (a second account) on the same device wipes before it reads', () => {
    const d = deps({ [LAB_DEVICE_USER_KEY]: 'user-a', 'tinct-lab-position': 'user a reading', 'tinct:chat-history:lab': 'user a chat' })
    expect(reconcileLabDeviceIdentity('user-github', d.api)).toBe('switched')
    expect(d.wipe).toHaveBeenCalledTimes(1)
    expect(d.store.get('tinct-lab-position')).toBeUndefined()
    expect(d.store.get('tinct:chat-history:lab')).toBeUndefined()
    // Re-recorded after the wipe cleared the key with the rest.
    expect(d.store.get(LAB_DEVICE_USER_KEY)).toBe('user-github')
  })

  it('a clean sign-out leaves the device adoptable again', () => {
    const d = deps({ [LAB_DEVICE_USER_KEY]: 'user-a' })
    d.api.wipe()
    expect(reconcileLabDeviceIdentity('user-b', d.api)).toBe('first-sign-in')
    expect(d.wipe).toHaveBeenCalledTimes(1)
  })
})
