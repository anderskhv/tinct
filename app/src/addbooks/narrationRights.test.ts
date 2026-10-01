import { describe, expect, it } from 'vitest'
import { importNarrationCleared, isAddImportBook, narrationRightsRecord } from './narrationRights'
import { danishRightsReview } from './danishRights'

describe('Add import narration rights', () => {
  const record = narrationRightsRecord('pd-35', 'original-en')!
  const text = danishRightsReview('pd-35', 'original-en')!

  it('clears only the reviewed Time Machine text, Grok and the four stock voices', () => {
    expect(importNarrationCleared('pd-35', 'original-en', 'grok')).toBe(true)
    for (const voice of ['ara', 'helios', 'orion', 'eve']) expect(importNarrationCleared('pd-35', 'original-en', 'grok', voice)).toBe(true)
    expect(importNarrationCleared('pd-35', 'original-en', 'grok', 'leo')).toBe(false)
    expect(importNarrationCleared('pd-35', 'original-en', 'google')).toBe(false)
    expect(importNarrationCleared('pd-35', 'original-en', undefined)).toBe(false)
    expect(importNarrationCleared('pd-35', 'modern-en', 'grok')).toBe(false)
    expect(importNarrationCleared('pd-36', 'original-en', 'grok')).toBe(false)
  })

  it('fails closed when the audio record or the text review it depends on is incomplete', () => {
    const cases = [
      { ...record, status: 'pending' },
      { ...record, scope: 'original-text-only' },
      { ...record, territories: [] },
      { ...record, evidence: [] },
      { ...record, disclosure: '' },
      { ...record, providerTerms: { ...record.providerTerms, outputOwnership: 'unknown' } },
      { ...record, textReview: { ...record.textReview, editionSha256: '0'.repeat(64) } },
    ]
    for (const changed of cases) expect(importNarrationCleared('pd-35', 'original-en', 'grok', 'ara', changed)).toBe(false)
    expect(importNarrationCleared('pd-35', 'original-en', 'grok', 'ara', record, { ...text, reviewStatus: 'revoked' })).toBe(false)
    expect(importNarrationCleared('pd-35', 'original-en', 'grok', 'ara', record, { ...text, scope: 'text-and-audio' })).toBe(false)
  })

  it('treats the pd namespace as imports and leaves catalogue books alone', () => {
    expect(isAddImportBook('pd-35')).toBe(true)
    expect(isAddImportBook('pd-9999')).toBe(true)
    expect(isAddImportBook('odyssey')).toBe(false)
    expect(isAddImportBook('bible')).toBe(false)
  })
})
