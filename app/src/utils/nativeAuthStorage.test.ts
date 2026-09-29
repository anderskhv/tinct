import { describe, expect, it, vi } from 'vitest'
import { createNativeAuthStorage } from './nativeAuthStorage'
describe('native sign-in persistence', () => {
 it('waits for the durable write before removing the legacy copy', async () => {
  let finish!: () => void
  const legacy = { getItem: vi.fn(() => 'prior'), removeItem: vi.fn() }
  const native = { get: vi.fn(async () => ({ found: false })), set: vi.fn(() => new Promise<void>(resolve => { finish = resolve })), remove: vi.fn(async () => {}) }
  const storage = createNativeAuthStorage(native, legacy)
  const read = storage.getItem('key')
  await Promise.resolve()
  expect(legacy.removeItem).not.toHaveBeenCalled()
  finish()
  expect(await read).toBe('prior')
  expect(legacy.removeItem).toHaveBeenCalledWith('key')
 })
 it('preserves the existing session if migration fails', async () => {
  const legacy = { getItem: vi.fn(() => 'prior'), removeItem: vi.fn() }
  const native = { get: vi.fn(async () => ({ found: false })), set: vi.fn(async () => { throw new Error('disk full') }), remove: vi.fn(async () => {}) }
  await expect(createNativeAuthStorage(native, legacy).getItem('key')).rejects.toThrow('disk full')
  expect(legacy.removeItem).not.toHaveBeenCalled()
 })
 it('never resurrects a signed-out session from a stale WebView mirror', async () => {
  const legacy = { getItem: vi.fn(() => 'stale'), removeItem: vi.fn() }
  const native = { get: vi.fn(async () => ({ found: true, value: null })), set: vi.fn(async () => {}), remove: vi.fn(async () => {}) }
  expect(await createNativeAuthStorage(native, legacy).getItem('key')).toBeNull()
  expect(legacy.getItem).not.toHaveBeenCalled()
  expect(native.set).not.toHaveBeenCalled()
 })
})
