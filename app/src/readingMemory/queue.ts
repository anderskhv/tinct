import { applyReadingMemoryEvents, emptyReadingMemory, parseReadingMemoryEvent } from './sessions'
import type { ReadingMemoryEvent, ReadingMemoryState } from './types'

export interface ReadingMemoryQueueStorage {
  read(): unknown
  write(value: unknown): void
}

export interface ReadingMemoryQueue {
  push(event: ReadingMemoryEvent): void
  pending(): ReadingMemoryEvent[]
  /** Drop every queued event at or below the given seq for that session. */
  ack(acked: Array<{ sessionId: string; seq: number }>): void
  clear(): void
}

function normalise(events: ReadingMemoryEvent[]): ReadingMemoryEvent[] {
  // One entry per session: the newest snapshot supersedes older ones.
  const bySession = new Map<string, ReadingMemoryEvent>()
  for (const event of events) {
    const existing = bySession.get(event.sessionId)
    if (!existing || existing.seq < event.seq) bySession.set(event.sessionId, event)
  }
  return [...bySession.values()].sort((a, b) => a.sessionId.localeCompare(b.sessionId))
}

/** Persistent, idempotent write queue. Entries carry sessionId + seq. */
export function createReadingMemoryQueue(storage: ReadingMemoryQueueStorage): ReadingMemoryQueue {
  const load = (): ReadingMemoryEvent[] => {
    const raw = storage.read()
    if (!Array.isArray(raw)) return []
    return normalise(raw.map(parseReadingMemoryEvent).filter((event): event is ReadingMemoryEvent => event !== null))
  }
  const save = (events: ReadingMemoryEvent[]) => storage.write(events)
  return {
    push(event) {
      save(normalise([...load(), event]))
    },
    pending: load,
    ack(acked) {
      const remaining = load().filter(event => !acked.some(item => item.sessionId === event.sessionId && item.seq >= event.seq))
      save(remaining)
    },
    clear() {
      save([])
    },
  }
}

export interface VersionedCloudRow {
  state: ReadingMemoryState
  rev: number
}

export interface CloudCommitResult {
  applied: boolean
  conflict: boolean
  row: VersionedCloudRow | null
}

/** The versioned cloud path (commit_user_data behind an interface for tests). */
export interface ReadingMemoryCloud {
  read(): Promise<VersionedCloudRow | null>
  commit(state: ReadingMemoryState | null, expectedRev: number | null): Promise<CloudCommitResult>
}

export interface DrainResult {
  status: 'idle' | 'applied' | 'failed'
  state: ReadingMemoryState | null
}

/**
 * Replay queued events onto the cloud memory. Idempotent: applying the same
 * (sessionId, seq) twice changes nothing, and a version conflict adopts the
 * server row and re-applies rather than overwriting it.
 */
export async function drainReadingMemoryQueue(
  queue: ReadingMemoryQueue,
  cloud: ReadingMemoryCloud,
  maxAttempts = 3,
): Promise<DrainResult> {
  const events = queue.pending()
  if (events.length === 0) return { status: 'idle', state: null }
  let row: VersionedCloudRow | null
  try {
    row = await cloud.read()
  } catch {
    return { status: 'failed', state: null }
  }
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const base = row?.state ?? emptyReadingMemory()
    const merged = applyReadingMemoryEvents(base, events)
    if (merged === base) {
      // Everything queued is already in the cloud: nothing to write.
      queue.ack(events)
      return { status: 'applied', state: base }
    }
    let result: CloudCommitResult
    try {
      result = await cloud.commit(merged, row?.rev ?? null)
    } catch {
      return { status: 'failed', state: null }
    }
    if (result.applied) {
      queue.ack(events)
      return { status: 'applied', state: result.row?.state ?? merged }
    }
    if (!result.conflict) return { status: 'failed', state: null }
    row = result.row
  }
  return { status: 'failed', state: null }
}
