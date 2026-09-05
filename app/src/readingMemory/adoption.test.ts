// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { clearLocalUserData } from '../services/storage'
import { adoptReadingMemoryOnSignIn, commitReadingMemoryAdoption, planReadingMemoryAdoption, stageReadingMemoryAdoption } from './adoption'
import { READING_MEMORY_DEVICE_KEY, deviceReadingMemoryQueue, readDeviceReadingMemory, writeDeviceReadingMemory } from './deviceStore'
import { chapterFixtures, fakeVersionedCloud, memoryStorage, sessionFor } from './fixtures.test-helpers'
import { applyReadingMemoryEvents, emptyReadingMemory, eventFromSession } from './sessions'
import type { ReadingSession } from './types'

const T0 = Date.UTC(2026, 8, 5, 8, 0)

afterEach(() => {
  localStorage.clear()
})

function deviceWith(sessions: ReadingSession[]) {
  return applyReadingMemoryEvents(emptyReadingMemory(), sessions.map(eventFromSession))
}

describe('sign-in adoption of signed-out reading', () => {
  it.each(chapterFixtures())('adopts owner:null sessions, keeps own, never adopts another account ($bookId ch$chapterNumber)', (fixture) => {
    const orphan = sessionFor(fixture, { id: 'orphan', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 60_000, owner: null })
    const own = sessionFor(fixture, { id: 'own', state: 'started', startedAt: T0 - 5000, owner: 'user-a' })
    const foreign = sessionFor(fixture, { id: 'foreign', state: 'completed', startedAt: T0 - 9000, owner: 'user-b' })
    const plan = planReadingMemoryAdoption(deviceWith([orphan, own, foreign]), 'user-a')
    expect(plan.adopted).toEqual([{ ...orphan, owner: 'user-a' }])
    expect(plan.kept).toEqual([own])
    expect(plan.dropped).toEqual([foreign])
    expect(Object.keys(plan.state.sessions).sort()).toEqual(['orphan', 'own'])
    expect(plan.state.sessions.orphan.owner).toBe('user-a')
    expect(plan.state.sessions.orphan.seq).toBe(orphan.seq)
  })

  it('merges adopted sessions into the cloud copy through the versioned commit: dedupe by id, higher seq wins', async () => {
    const fixture = chapterFixtures()[2]
    const storage = memoryStorage()
    const newerOnDevice = { ...sessionFor(fixture, { id: 'a', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 90_000, page: 2 }), seq: 3 }
    const olderOnDevice = sessionFor(fixture, { id: 'b', state: 'started', startedAt: T0, seq: 1 })
    writeDeviceReadingMemory(deviceWith([newerOnDevice, olderOnDevice]), storage)
    const cloudA = { ...sessionFor(fixture, { id: 'a', state: 'started', startedAt: T0, owner: 'user-a' }), seq: 1 }
    const cloudB = { ...sessionFor(fixture, { id: 'b', state: 'completed', startedAt: T0, lastActiveAt: T0 + 30_000, owner: 'user-a' }), seq: 4 }
    const remote = fakeVersionedCloud({ state: deviceWith([cloudA, cloudB]), rev: 5 })
    const result = await adoptReadingMemoryOnSignIn({ userId: 'user-a', storage, cloud: remote.cloud })
    expect(result.plan.adopted.map(session => session.id).sort()).toEqual(['a', 'b'])
    expect(result.drain?.status).toBe('applied')
    expect(remote.commits).toHaveLength(1)
    expect(remote.commits[0].expectedRev).toBe(5)
    const merged = remote.row()!.state.sessions
    expect(merged.a.seq).toBe(3)
    expect(merged.a.owner).toBe('user-a')
    expect(merged.a.anchor.page).toBe(2)
    expect(merged.b.seq).toBe(4)
    expect(merged.b.state).toBe('completed')
    expect(deviceReadingMemoryQueue(storage).pending()).toEqual([])
    // A second sign-in finds nothing left to adopt.
    const again = await adoptReadingMemoryOnSignIn({ userId: 'user-a', storage, cloud: remote.cloud })
    expect(again.plan.adopted).toEqual([])
    expect(remote.commits).toHaveLength(1)
  })

  it('adopts a version conflict by re-applying on the server row instead of overwriting it', async () => {
    const fixture = chapterFixtures()[0]
    const storage = memoryStorage()
    const orphan = sessionFor(fixture, { id: 'o', state: 'started', startedAt: T0 })
    writeDeviceReadingMemory(deviceWith([orphan]), storage)
    const remote = fakeVersionedCloud({ state: emptyReadingMemory(), rev: 1 })
    const original = remote.cloud.commit.bind(remote.cloud)
    let raced = false
    remote.cloud.commit = async (state, expectedRev) => {
      if (!raced) {
        raced = true
        remote.bump(deviceWith([sessionFor(fixture, { id: 'other-device', state: 'started', startedAt: T0 + 1, owner: 'user-a' })]))
      }
      return original(state, expectedRev)
    }
    const result = await adoptReadingMemoryOnSignIn({ userId: 'user-a', storage, cloud: remote.cloud })
    expect(result.drain?.status).toBe('applied')
    expect(Object.keys(remote.row()!.state.sessions).sort()).toEqual(['o', 'other-device'])
  })

  it('stages before the user-switch wipe and commits after it, so the wipe cannot take the orphans', () => {
    const fixture = chapterFixtures()[1]
    const orphan = sessionFor(fixture, { id: 'orphan', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 20_000, owner: null })
    const previousUser = sessionFor(fixture, { id: 'prev', state: 'started', startedAt: T0, owner: 'user-prev' })
    writeDeviceReadingMemory(deviceWith([orphan, previousUser]))
    deviceReadingMemoryQueue().push(eventFromSession(previousUser))
    localStorage.setItem('tinct:last-user-id', 'user-prev')
    localStorage.setItem('tinct:library', '["odyssey"]')

    // The exact sequence the app runs on a user switch.
    const staged = stageReadingMemoryAdoption('user-next')
    clearLocalUserData()
    expect(localStorage.getItem(READING_MEMORY_DEVICE_KEY)).toBeNull()
    expect(localStorage.getItem('tinct:library')).toBeNull()
    commitReadingMemoryAdoption(staged)

    const device = readDeviceReadingMemory()
    expect(Object.keys(device.sessions)).toEqual(['orphan'])
    expect(device.sessions.orphan.owner).toBe('user-next')
    const pending = deviceReadingMemoryQueue().pending()
    expect(pending.map(event => event.sessionId)).toEqual(['orphan'])
    expect(pending[0].session.owner).toBe('user-next')
  })

  it('leaves the device untouched when there is nothing to adopt or drop', () => {
    const fixture = chapterFixtures()[2]
    const storage = memoryStorage()
    const own = sessionFor(fixture, { id: 'own', state: 'started', startedAt: T0, owner: 'user-a' })
    writeDeviceReadingMemory(deviceWith([own]), storage)
    const before = storage.dump()
    commitReadingMemoryAdoption(stageReadingMemoryAdoption('user-a', storage), storage)
    expect(storage.dump()).toEqual(before)
    expect(deviceReadingMemoryQueue(storage).pending()).toEqual([])
  })
})
