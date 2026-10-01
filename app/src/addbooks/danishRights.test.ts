import { describe, expect, it, vi } from 'vitest'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { danishRightsReview, eligibleInDenmark, type DanishRightsReview } from './danishRights'

const reviewed = danishRightsReview('pd-35', 'original-en')!
const person = (deathYear: number | null, role = 'author') => ({ name: 'Test contributor', role, deathYear, evidence: 'https://example.org/biography' })
const cases: Array<{ name: string; review: DanishRightsReview | undefined; year: number; allowed: boolean }> = [
  { name: 'pinned Wells edition', review: reviewed, year: 2026, allowed: true },
  { name: 'no review despite US availability', review: undefined, year: 2026, allowed: false },
  { name: '1955 death is eligible in 2026', review: { ...reviewed, contributors: [person(1955)] }, year: 2026, allowed: true },
  { name: '1956 death is still protected throughout 2026', review: { ...reviewed, contributors: [person(1956)] }, year: 2026, allowed: false },
  { name: '1956 death becomes eligible in 2027', review: { ...reviewed, contributors: [person(1956)] }, year: 2027, allowed: true },
  { name: 'latest joint author controls the term', review: { ...reviewed, contributors: [person(1900), person(1960)] }, year: 2026, allowed: false },
  { name: 'recent translator blocks ancient work', review: { ...reviewed, contributors: [person(-300), person(1980, 'translator')] }, year: 2026, allowed: false },
  { name: 'unknown death year', review: { ...reviewed, contributors: [person(null)] }, year: 2026, allowed: false },
  { name: 'missing contributors', review: { ...reviewed, contributors: [] }, year: 2026, allowed: false },
  { name: 'incomplete contributor list', review: { ...reviewed, contributorsComplete: false }, year: 2026, allowed: false },
  { name: 'unreviewed edition additions', review: { ...reviewed, editionAuditComplete: false }, year: 2026, allowed: false },
  { name: 'unresolved special term', review: { ...reviewed, specialCasesResolved: false }, year: 2026, allowed: false },
  { name: 'old date is insufficient without review', review: { ...reviewed, reviewStatus: 'pending' }, year: 2026, allowed: false },
  { name: 'US-only designation', review: { ...reviewed, basis: 'public-domain-in-USA' }, year: 2026, allowed: false },
  { name: 'free download is insufficient', review: { ...reviewed, basis: 'free-download' }, year: 2026, allowed: false },
  { name: 'no contributor evidence', review: { ...reviewed, contributors: [{ ...person(1900), evidence: '' }] }, year: 2026, allowed: false },
  { name: 'unreviewed cover or audio scope', review: { ...reviewed, scope: 'text-and-audio' }, year: 2026, allowed: false },
  { name: 'unpinned source', review: { ...reviewed, sourceSha256: '' }, year: 2026, allowed: false },
]

describe('Danish rights eligibility', () => {
  it.each(cases)('$name', ({ review, year, allowed }) => {
    expect(eligibleInDenmark(review, year)).toBe(allowed)
  })

  it('uses identical exclusion decisions in the Python builder and browser', () => {
    const result = execFileSync('python3', ['-c', `
import json, sys
sys.path.insert(0, '../addbooks/scripts')
from danish_rights import eligible
print(json.dumps([eligible(c.get('review'), c['year']) for c in json.load(sys.stdin)]))
`], { input: JSON.stringify(cases), encoding: 'utf8' })
    expect(JSON.parse(result)).toEqual(cases.map(c => c.allowed))
  })

  it('pins the review to the converted artifact and provenance', () => {
    const raw = fs.readFileSync('public/data/editions/pd-35-original-en.json')
    const provenance = JSON.parse(fs.readFileSync('public/data/imports/pd-35-provenance.json', 'utf8'))
    expect(createHash('sha256').update(raw).digest('hex')).toBe(reviewed.editionSha256)
    expect(provenance.sourceSha256).toBe(reviewed.sourceSha256)
    expect(provenance.danishRightsReview).toMatchObject(reviewed)
    expect(danishRightsReview('pd-35', 'modern-en')).toBeUndefined()
  })

  it('rejects a source substitution before downloading or writing any edition', () => {
    execFileSync('python3', ['-c', `
import sys
sys.path.insert(0, '../addbooks/scripts')
from danish_rights import require_review
for args in [('pd-35', 'original-en', 'https://example.org/other', '${reviewed.sourceSha256}'),
             ('pd-35', 'original-en', 'https://www.gutenberg.org/cache/epub/35/pg35-images.html', '0' * 64),
             ('pd-35', 'modern-en', '', '')]:
    try:
        require_review(*args)
    except ValueError:
        continue
    raise AssertionError('Unreviewed edition/source was admitted')
`])
  })

  it('removes a revoked review from Add, reader lookup and handoff', async () => {
    vi.resetModules()
    vi.doMock('./danishRights.json', () => ({ default: { policyVersion: 1, jurisdiction: 'DK', editions: [] } }))
    try {
      const { UNLISTED_READER_BOOKS, getReaderBook } = await import('../data/readerBooks')
      const { createOpenReaderIntent } = await import('./readerHandoff')
      expect(UNLISTED_READER_BOOKS).toEqual([])
      expect(getReaderBook('pd-35')).toBeUndefined()
      expect(createOpenReaderIntent({ bookId: 'pd-35', primaryEditionKey: 'original-en' })).toBeNull()
    } finally {
      vi.doUnmock('./danishRights.json')
      vi.resetModules()
    }
  })
})
