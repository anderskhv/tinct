// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { READING_MEMORY_DEVICE_KEY, READING_MEMORY_QUEUE_KEY } from '../readingMemory/deviceStore'
import { clearLocalUserData } from '../services/storage'
import { LAB_POSITION_DEVICE_KEY, LAB_POSITION_DIRTY_KEY, LAB_POSITION_STORAGE_KEY } from './labPosition'
import { LAB_PREFS_KEY } from './labPrefs'
import { LAB_AI_ACTIONS_KEY, LAB_SECOND_BOOK_NUDGE_KEY } from './labAccountPrompt'
import { wipeLabDeviceUserData } from './labSignOut'

/** What a signed-in reader leaves on a device, plus the device-level keys that must survive. */
const USER_KEYS: Record<string, string> = {
  [LAB_POSITION_STORAGE_KEY]: '{"books":{"bible":{"chapter":3}}}',
  [LAB_POSITION_DIRTY_KEY]: '1',
  'tinct-lab-highlights': '[{"id":"h1"}]',
  'tinct-lab-reading-seconds': '120',
  'tinct-lab-page-turns': '7',
  [READING_MEMORY_DEVICE_KEY]: '{"owner":"user-a","sessions":{}}',
  [READING_MEMORY_QUEUE_KEY]: '[{"type":"start"}]',
  'tinct:chat-history:lab': '[{"role":"user","content":"hi","bookId":"lab"}]',
  'tinct:lab-reader-handoff': '{"bookId":"bible"}',
  [LAB_AI_ACTIONS_KEY]: '1',
  [LAB_SECOND_BOOK_NUDGE_KEY]: '1',
  'tinct:library': '["odyssey"]',
}
const DEVICE_KEYS: Record<string, string> = {
  [LAB_PREFS_KEY]: '{"version":2,"shared":{"audioSpeed":1.5},"phone":{},"desktop":{}}',
  [LAB_POSITION_DEVICE_KEY]: 'device-1234',
  'tinct:device-preferences': '{"theme":"dark"}',
  'tinct:last-user-id': 'user-a',
  'tinct:tinct-tour-seen': 'true',
}

function seed() {
  for (const [key, value] of Object.entries({ ...USER_KEYS, ...DEVICE_KEYS })) localStorage.setItem(key, value)
  localStorage.setItem('sb-project-auth-token', '{"access_token":"x"}')
  localStorage.setItem('unrelated', 'keep')
}

function expectWiped() {
  for (const key of Object.keys(USER_KEYS)) expect(localStorage.getItem(key), key).toBeNull()
  for (const [key, value] of Object.entries(DEVICE_KEYS)) expect(localStorage.getItem(key), key).toBe(value)
  expect(localStorage.getItem('sb-project-auth-token')).toBe('{"access_token":"x"}')
  expect(localStorage.getItem('unrelated')).toBe('keep')
}

beforeEach(() => { localStorage.clear() })
afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('lab sign-out wipe', () => {
  it('clears every lab and reading-memory key while keeping device preferences and the device id', () => {
    seed()
    wipeLabDeviceUserData()
    expectWiped()
  })

  it('drops the IndexedDB position mirror when the browser has one', () => {
    const deleteDatabase = vi.fn()
    vi.stubGlobal('indexedDB', { deleteDatabase })
    seed()
    wipeLabDeviceUserData()
    expect(deleteDatabase).toHaveBeenCalledWith('tinct-lab')
    expectWiped()
  })

  it('still wipes localStorage when IndexedDB is unavailable or throws', () => {
    vi.stubGlobal('indexedDB', { deleteDatabase: () => { throw new Error('blocked') } })
    seed()
    expect(() => wipeLabDeviceUserData()).not.toThrow()
    expectWiped()
  })
})

describe('classic sign-out wipe (clearLocalUserData) and the lab keys', () => {
  it('covers tinct-lab-* and tinct:lab-* through the prefix rules and preserves the lab allowlist', () => {
    seed()
    clearLocalUserData()
    expectWiped()
  })
})
