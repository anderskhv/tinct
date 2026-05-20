import { describe, expect, it } from 'vitest'
import {
  changedSegmentForTest,
  parseByteRangeForTest,
  tryCommentReplacementForTest,
  validateCorrectedParagraphForTest,
} from './worker'

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

describe('translation fix helpers', () => {
  it('turns a user comment into a full-paragraph replacement when AI omits one', () => {
    const paragraph = 'Han kunne svækes af kulden, men fortsatte.'
    expect(tryCommentReplacementForTest(paragraph, 'svækes', 'Svækkes')).toBe('Han kunne svækkes af kulden, men fortsatte.')
    expect(tryCommentReplacementForTest(paragraph, ' svækes ', 'svækkes?')).toBe('Han kunne svækkes af kulden, men fortsatte.')
  })

  it('extracts the changed segment from a full paragraph correction', () => {
    expect(changedSegmentForTest(
      'De sad i galleriets skygge.',
      'De sad i terrassens skygge.',
    )).toEqual({ oldText: 'galleriet', newText: 'terrassen' })
  })

  it('blocks fragment corrections and implausibly long rewrites', () => {
    expect(validateCorrectedParagraphForTest('a'.repeat(100), 'a'.repeat(49))).toContain('too short')
    expect(validateCorrectedParagraphForTest('a'.repeat(100), 'a'.repeat(151))).toContain('too long')
    expect(validateCorrectedParagraphForTest('a'.repeat(100), 'a'.repeat(100))).toBeNull()
  })
})
