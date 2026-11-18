import { describe, expect, it } from 'vitest'
import { LAB_TEXT_RETRY_MS, withTextRetries } from './labTextRetry'

const waits: number[] = []
const wait = async (ms: number) => { waits.push(ms) }

describe('the chapter text after a dropped connection', () => {
  it('is asked for again after 1, 2 and 4 s, and opens once the network is back', async () => {
    waits.length = 0
    let calls = 0
    const text = await withTextRetries(async () => { if (++calls < 3) throw new Error('Failed to fetch edition frankenstein-original-en: Load failed'); return 'chapter' }, () => true, wait)
    expect(text).toBe('chapter')
    expect(calls).toBe(3)
    expect(waits).toEqual([1000, 2000])
  })

  it('gives up after its three retries with the last error', async () => {
    waits.length = 0
    let calls = 0
    await expect(withTextRetries(async () => { calls++; throw new Error('HTTP 503') }, () => true, wait)).rejects.toThrow('HTTP 503')
    expect(calls).toBe(LAB_TEXT_RETRY_MS.length + 1)
    expect(waits).toEqual([...LAB_TEXT_RETRY_MS])
  })

  it('never retries an error that cannot pass', async () => {
    for (const message of ['Unknown published book: x', 'Unknown edition modern-en for x', 'Invalid compare edition y for x', 'Edition x-original-en has no readable chapter 9']) {
      let calls = 0
      await expect(withTextRetries(async () => { calls++; throw new Error(message) }, () => true, wait)).rejects.toThrow(message)
      expect(calls).toBe(1)
    }
  })

  it('stops when the reader has moved on (another chapter, book or edition)', async () => {
    let calls = 0, wanted = true
    await expect(withTextRetries(async () => { calls++; wanted = false; throw new Error('Load failed') }, () => wanted, wait)).rejects.toThrow('Load failed')
    expect(calls).toBe(1)
  })
})
