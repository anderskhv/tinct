import { describe, expect, it, vi } from 'vitest'
import { chapterFixtures, sessionFor } from './fixtures.test-helpers'
import { createReadingMemoryQueue, drainReadingMemoryQueue, type CloudCommitResult, type ReadingMemoryCloud, type VersionedCloudRow } from './queue'
import { applyReadingMemoryEvents, emptyReadingMemory, eventFromSession } from './sessions'
import type { ReadingMemoryState } from './types'

const T0 = Date.UTC(2026, 8, 3, 8, 0)

function memoryQueue() {
  let raw: unknown = []
  return createReadingMemoryQueue({ read: () => raw, write: (value) => { raw = value } })
}

/** A commit_user_data stand-in: rev-checked, conflicts return the server row. */
function fakeCloud(initial: VersionedCloudRow | null = null) {
  let row = initial
  const commits: Array<{ expectedRev: number | null; state: ReadingMemoryState | null }> = []
  const cloud: ReadingMemoryCloud = {
    read: vi.fn(async () => row),
    commit: vi.fn(async (state, expectedRev): Promise<CloudCommitResult> => {
      commits.push({ expectedRev, state })
      const currentRev = row?.rev ?? 0
      if (expectedRev !== null && expectedRev !== currentRev) {
        return { applied: false, conflict: true, row }
      }
      row = { state: state ?? emptyReadingMemory(), rev: currentRev + 1 }
      return { applied: true, conflict: false, row }
    }),
  }
  return { cloud, commits, row: () => row, bump: (state: ReadingMemoryState) => { row = { state, rev: (row?.rev ?? 0) + 1 } } }
}

describe('reading memory queue', () => {
  it('keeps one newest snapshot per session and acks by seq', () => {
    const fixture = chapterFixtures()[2]
    const queue = memoryQueue()
    const s1 = sessionFor(fixture, { id: 'a', state: 'started', startedAt: T0, seq: 1 })
    const s2 = { ...sessionFor(fixture, { id: 'a', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 1000, page: 2 }), seq: 2 }
    queue.push(eventFromSession(s1))
    queue.push(eventFromSession(s2))
    queue.push(eventFromSession(s1))
    expect(queue.pending()).toEqual([eventFromSession(s2)])
    queue.ack([{ sessionId: 'a', seq: 1 }])
    expect(queue.pending()).toHaveLength(1)
    queue.ack([{ sessionId: 'a', seq: 2 }])
    expect(queue.pending()).toHaveLength(0)
  })

  it('drains through the versioned commit with the expected rev and clears the queue', async () => {
    const fixture = chapterFixtures()[0]
    const queue = memoryQueue()
    const session = sessionFor(fixture, { id: 'g', state: 'started', startedAt: T0 })
    queue.push(eventFromSession(session))
    const { cloud, commits, row } = fakeCloud({ state: emptyReadingMemory(), rev: 7 })
    const result = await drainReadingMemoryQueue(queue, cloud)
    expect(result.status).toBe('applied')
    expect(commits).toEqual([{ expectedRev: 7, state: expect.objectContaining({ sessions: { g: session } }) }])
    expect(row()?.rev).toBe(8)
    expect(queue.pending()).toHaveLength(0)
  })

  it('replaying the same events is idempotent: no second commit, cloud unchanged', async () => {
    const fixture = chapterFixtures()[1]
    const session = sessionFor(fixture, { id: 'j', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 500 })
    const queue = memoryQueue()
    queue.push(eventFromSession(session))
    const { cloud, commits } = fakeCloud()
    await drainReadingMemoryQueue(queue, cloud)
    const afterFirst = (await cloud.read())!
    queue.push(eventFromSession(session))
    const second = await drainReadingMemoryQueue(queue, cloud)
    expect(second.status).toBe('applied')
    expect(commits).toHaveLength(1)
    expect(await cloud.read()).toEqual(afterFirst)
    expect(queue.pending()).toHaveLength(0)
  })

  it('adopts the server row on a version conflict and re-applies instead of overwriting', async () => {
    const [genesis, james] = chapterFixtures()
    const mine = sessionFor(genesis, { id: 'g', state: 'started', startedAt: T0 })
    const theirs = sessionFor(james, { id: 'j', state: 'completed', startedAt: T0 - 5000, completedAt: T0 - 1000 })
    const queue = memoryQueue()
    queue.push(eventFromSession(mine))
    const fake = fakeCloud({ state: emptyReadingMemory(), rev: 1 })
    // Another device commits between our read and our commit.
    const originalCommit = fake.cloud.commit
    let interfered = false
    fake.cloud.commit = async (state, expectedRev) => {
      if (!interfered) {
        interfered = true
        fake.bump(applyReadingMemoryEvents(emptyReadingMemory(), [eventFromSession(theirs)]))
      }
      return originalCommit(state, expectedRev)
    }
    const result = await drainReadingMemoryQueue(queue, fake.cloud)
    expect(result.status).toBe('applied')
    expect(fake.commits.map(c => c.expectedRev)).toEqual([1, 2])
    expect(Object.keys(fake.row()!.state.sessions).sort()).toEqual(['g', 'j'])
    expect(fake.row()!.state.sessions.j.state).toBe('completed')
    expect(queue.pending()).toHaveLength(0)
  })

  it('keeps the queue when the cloud is unreachable (offline) and retries later', async () => {
    const fixture = chapterFixtures()[2]
    const queue = memoryQueue()
    queue.push(eventFromSession(sessionFor(fixture, { id: 'p', state: 'started', startedAt: T0 })))
    const offline: ReadingMemoryCloud = {
      read: async () => { throw new Error('Failed to fetch') },
      commit: async () => { throw new Error('Failed to fetch') },
    }
    expect((await drainReadingMemoryQueue(queue, offline)).status).toBe('failed')
    expect(queue.pending()).toHaveLength(1)
    const { cloud } = fakeCloud()
    expect((await drainReadingMemoryQueue(queue, cloud)).status).toBe('applied')
    expect(queue.pending()).toHaveLength(0)
  })

  it('does nothing with an empty queue', async () => {
    const { cloud } = fakeCloud()
    expect((await drainReadingMemoryQueue(memoryQueue(), cloud)).status).toBe('idle')
    expect(cloud.read).not.toHaveBeenCalled()
  })

  it('retains only the events a predicate accepts (another account\'s writes are dropped on user switch)', () => {
    const fixture = chapterFixtures()[1]
    const queue = memoryQueue()
    queue.push(eventFromSession(sessionFor(fixture, { id: 'mine', state: 'started', startedAt: T0, owner: 'user-a' })))
    queue.push(eventFromSession(sessionFor(fixture, { id: 'theirs', state: 'started', startedAt: T0, owner: 'user-b' })))
    queue.retain(event => event.session.owner === 'user-a')
    expect(queue.pending().map(event => event.sessionId)).toEqual(['mine'])
  })
})
