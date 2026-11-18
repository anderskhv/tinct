import { expect, it } from 'vitest'
import { staleReloadAllowed, STALE_RELOAD_KEY } from './staleChunkRecovery'

function memory() { const map = new Map<string, string>(); return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v) } } }

it('reloads at most twice in two minutes, then lets the error show', () => {
  const storage = memory()
  expect(staleReloadAllowed(storage, 1_000)).toBe(true)
  expect(staleReloadAllowed(storage, 2_000)).toBe(true)
  expect(staleReloadAllowed(storage, 3_000)).toBe(false)
  expect(staleReloadAllowed(storage, 1_000 + 2 * 60_000 + 1)).toBe(true)
  expect(JSON.parse(storage.getItem(STALE_RELOAD_KEY)!)).toHaveLength(2)
})

it('never reloads without storage to remember it by', () => {
  expect(staleReloadAllowed(null, 1)).toBe(false)
})
