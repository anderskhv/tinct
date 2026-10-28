import { describe, expect, it, vi } from 'vitest'
import type { LockFunc } from '@supabase/supabase-js'
import { serializeBrowserAuthLock } from './browserAuthLock'

function gate() {
  let resolve!: () => void
  const promise = new Promise<void>(done => { resolve = done })
  return { promise, resolve }
}

describe('browser auth lock acquisition', () => {
  it('queues same-document callers before starting their native acquisition timers', async () => {
    const first = gate()
    const calls: Array<{ name: string; timeout: number }> = []
    const acquire: LockFunc = async (name, timeout, fn) => {
      calls.push({ name, timeout })
      if (calls.length === 1) await first.promise
      return fn()
    }
    const lock = serializeBrowserAuthLock(acquire)
    const tasks = Array.from({ length: 8 }, (_, i) => lock('session', 5000, async () => i))
    await Promise.resolve()
    expect(calls).toEqual([{ name: 'session', timeout: 5000 }])
    first.resolve()
    expect(await Promise.all(tasks)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(calls).toHaveLength(8)
    expect(calls.every(call => call.timeout === 5000)).toBe(true)
  })

  it('keeps opportunistic refresh nonblocking while another caller is queued', async () => {
    const held = gate()
    const acquire: LockFunc = async (_name, _timeout, fn) => { await held.promise; return fn() }
    const lock = serializeBrowserAuthLock(acquire)
    const running = lock('session', 5000, async () => 'done')
    const callback = vi.fn(async () => 'refresh')
    await expect(lock('session', 0, callback)).rejects.toMatchObject({ isAcquireTimeout: true })
    expect(callback).not.toHaveBeenCalled()
    held.resolve()
    expect(await running).toBe('done')
  })

  it('propagates failure, runs no callback twice, and releases the queue', async () => {
    const failure = new Error('lock failed')
    let calls = 0
    const acquire: LockFunc = async (_name, _timeout, fn) => {
      if (++calls === 1) throw failure
      return fn()
    }
    const lock = serializeBrowserAuthLock(acquire)
    const callback = vi.fn(async () => 'next')
    const failed = lock('session', 5000, callback)
    const next = lock('session', 5000, callback)
    await expect(failed).rejects.toBe(failure)
    expect(await next).toBe('next')
    expect(callback).toHaveBeenCalledOnce()
    expect(await lock('session', 0, async () => 'idle refresh')).toBe('idle refresh')
  })

  it('does not block an unrelated lock name', async () => {
    const held = gate()
    const acquire: LockFunc = async (name, _timeout, fn) => {
      if (name === 'first') await held.promise
      return fn()
    }
    const lock = serializeBrowserAuthLock(acquire)
    const first = lock('first', 5000, async () => 1)
    expect(await lock('second', 5000, async () => 2)).toBe(2)
    held.resolve()
    expect(await first).toBe(1)
  })

  it('waits for a stolen lock callback to finish before running the next operation', async () => {
    const held = gate()
    const started = gate()
    const failure = new Error('stolen by another tab')
    let calls = 0
    const acquire: LockFunc = async (_name, _timeout, fn) => {
      if (++calls === 1) { void fn(); started.resolve(); throw failure }
      return fn()
    }
    const lock = serializeBrowserAuthLock(acquire)
    const first = lock('session', 5000, async () => { await held.promise; return 1 })
    const rejected = expect(first).rejects.toBe(failure)
    await started.promise
    const next = lock('session', 5000, async () => 2)
    await Promise.resolve()
    expect(calls).toBe(1)
    held.resolve()
    await rejected
    expect(await next).toBe(2)
  })
})
