// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearLocalUserData } from '../services/storage'
import { chapterFixtures, sessionFor } from './fixtures.test-helpers'
import {
  READING_MEMORY_DEVICE_KEY,
  READING_MEMORY_QUEUE_KEY,
  deviceReadingMemoryQueue,
  readDeviceReadingMemory,
  writeDeviceReadingMemory,
} from './deviceStore'
import { applyReadingMemoryEvent, emptyReadingMemory, eventFromSession } from './sessions'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('device-only reading memory', () => {
  it('round-trips through the tinct: localStorage key and survives a reload', () => {
    const fixture = chapterFixtures()[0]
    const session = sessionFor(fixture, { state: 'started', startedAt: Date.UTC(2026, 8, 3, 9) })
    const state = applyReadingMemoryEvent(emptyReadingMemory(), eventFromSession(session))
    writeDeviceReadingMemory(state)
    expect(localStorage.getItem(READING_MEMORY_DEVICE_KEY)).not.toBeNull()
    expect(readDeviceReadingMemory()).toEqual(state)
  })

  it('is wiped by the existing sign-out rules (not on the preserve list)', () => {
    const fixture = chapterFixtures()[1]
    const session = sessionFor(fixture, { state: 'started', startedAt: Date.UTC(2026, 8, 3, 9) })
    writeDeviceReadingMemory(applyReadingMemoryEvent(emptyReadingMemory(), eventFromSession(session)))
    deviceReadingMemoryQueue().push(eventFromSession(session))
    localStorage.setItem('tinct:device-preferences', '{"theme":"dark"}')
    clearLocalUserData()
    expect(localStorage.getItem(READING_MEMORY_DEVICE_KEY)).toBeNull()
    expect(localStorage.getItem(READING_MEMORY_QUEUE_KEY)).toBeNull()
    expect(localStorage.getItem('tinct:device-preferences')).toBe('{"theme":"dark"}')
    expect(readDeviceReadingMemory()).toEqual(emptyReadingMemory())
  })

  it('tolerates malformed storage and a missing storage object', () => {
    localStorage.setItem(READING_MEMORY_DEVICE_KEY, '{not json')
    expect(readDeviceReadingMemory()).toEqual(emptyReadingMemory())
    expect(readDeviceReadingMemory(null)).toEqual(emptyReadingMemory())
    expect(() => writeDeviceReadingMemory(emptyReadingMemory(), null)).not.toThrow()
    expect(deviceReadingMemoryQueue(null).pending()).toEqual([])
  })
})
