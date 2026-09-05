import { browserKeyValueStorage, deviceReadingMemoryQueue, readDeviceReadingMemory, writeDeviceReadingMemory, type KeyValueStorage } from './deviceStore'
import { drainReadingMemoryQueue, type DrainResult, type ReadingMemoryCloud } from './queue'
import { READING_MEMORY_VERSION, eventFromSession } from './sessions'
import type { ReadingMemoryState, ReadingSession } from './types'

/**
 * Sign-in adoption.
 *
 * Sessions recorded while signed out carry `owner: null`. When an account
 * signs in on the device, those — and only those — become the account's:
 * they are retagged, merged into the account's versioned cloud copy through
 * the ordinary write queue (dedupe by session id, higher seq wins, conflicts
 * adopt server truth), and kept in the device mirror. Sessions owned by a
 * different account are never adopted; the device copy drops them, which is
 * what the existing user-switch wipe (`clearLocalUserData`) does to the rest
 * of the previous account's cache.
 *
 * The plan is staged synchronously so a caller can capture the adoptable
 * sessions BEFORE the wipe and commit them right after it.
 */
export interface ReadingMemoryAdoptionPlan {
  userId: string
  /** Signed-out sessions now owned by the account (same id, same seq). */
  adopted: ReadingSession[]
  /** Sessions the account already owned. */
  kept: ReadingSession[]
  /** Another account's sessions: dropped from the device, never adopted. */
  dropped: ReadingSession[]
  /** The device memory to write: kept + adopted. */
  state: ReadingMemoryState
}

export function planReadingMemoryAdoption(state: ReadingMemoryState, userId: string): ReadingMemoryAdoptionPlan {
  const adopted: ReadingSession[] = []
  const kept: ReadingSession[] = []
  const dropped: ReadingSession[] = []
  for (const session of Object.values(state.sessions)) {
    if (session.owner === null) adopted.push({ ...session, owner: userId })
    else if (session.owner === userId) kept.push(session)
    else dropped.push(session)
  }
  const sessions = Object.fromEntries([...kept, ...adopted].map(session => [session.id, session]))
  return {
    userId,
    adopted,
    kept,
    dropped,
    state: { v: READING_MEMORY_VERSION, sessions, updatedAt: state.updatedAt },
  }
}

/** Read the device memory and plan its adoption by `userId` (no writes). */
export function stageReadingMemoryAdoption(userId: string, storage: KeyValueStorage | null = browserKeyValueStorage()): ReadingMemoryAdoptionPlan {
  return planReadingMemoryAdoption(readDeviceReadingMemory(storage), userId)
}

/**
 * Write the planned device memory and queue the adopted sessions for the
 * cloud. Queue entries left by another account are dropped as well. Safe to
 * call after `clearLocalUserData()`; safe to call when nothing was adopted.
 */
export function commitReadingMemoryAdoption(plan: ReadingMemoryAdoptionPlan, storage: KeyValueStorage | null = browserKeyValueStorage()): void {
  const queue = deviceReadingMemoryQueue(storage)
  queue.retain(event => event.session.owner === plan.userId)
  if (Object.keys(plan.state.sessions).length > 0 || plan.dropped.length > 0) writeDeviceReadingMemory(plan.state, storage)
  for (const session of plan.adopted) queue.push(eventFromSession(session))
}

export interface ReadingMemoryAdoptionResult {
  plan: ReadingMemoryAdoptionPlan
  /** Null when there was no cloud (unconfigured) or nothing was queued. */
  drain: DrainResult | null
}

/**
 * Full sign-in adoption on a device: stage, commit locally, then drain the
 * queue to the account's cloud copy when a cloud is available. Idempotent:
 * a second call finds nothing to adopt.
 */
export async function adoptReadingMemoryOnSignIn(input: {
  userId: string
  storage?: KeyValueStorage | null
  cloud?: ReadingMemoryCloud | null
  /** Skip the drain (e.g. offline); the queue keeps the writes. */
  drain?: boolean
}): Promise<ReadingMemoryAdoptionResult> {
  const storage = input.storage === undefined ? browserKeyValueStorage() : input.storage
  const plan = stageReadingMemoryAdoption(input.userId, storage)
  commitReadingMemoryAdoption(plan, storage)
  if (!input.cloud || input.drain === false) return { plan, drain: null }
  const drain = await drainReadingMemoryQueue(deviceReadingMemoryQueue(storage), input.cloud).catch((): DrainResult => ({ status: 'failed', state: null }))
  return { plan, drain }
}
