import { describe, expect, it } from 'vitest'
import { parseByteRangeForTest } from './worker'

describe('audio byte ranges', () => {
  it('parses normal, open-ended, and suffix ranges', () => {
    expect(parseByteRangeForTest('bytes=0-1023', 10_000)).toEqual({ start: 0, end: 1023 })
    expect(parseByteRangeForTest('bytes=1024-', 10_000)).toEqual({ start: 1024, end: 9999 })
    expect(parseByteRangeForTest('bytes=-500', 10_000)).toEqual({ start: 9500, end: 9999 })
  })

  it('rejects invalid ranges', () => {
    expect(parseByteRangeForTest('items=0-10', 10_000)).toBeNull()
    expect(parseByteRangeForTest('bytes=900-100', 10_000)).toBeNull()
    expect(parseByteRangeForTest('bytes=10000-10001', 10_000)).toBeNull()
  })
})
