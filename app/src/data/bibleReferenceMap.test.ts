import { describe, expect, it } from 'vitest'
import { mapBibleChapter, type BibleEditionChapterMap } from './bibleReferenceMap'

// Deliberately small synthetic maps: the numbers are edition-local, not full canon counts.
const protestant: BibleEditionChapterMap = { editionKey: 'bsb-en', sourceSha256: 'a'.repeat(64), chapters: [
  {chapterNumber: 1, bookCode: 'GEN', biblicalChapter: 1},
  {chapterNumber: 2, bookCode: 'MAT', biblicalChapter: 1},
  {chapterNumber: 3, bookCode: 'REV', biblicalChapter: 22},
] }
const catholic: BibleEditionChapterMap = { editionKey: 'web-catholic-en', sourceSha256: 'b'.repeat(64), chapters: [
  {chapterNumber: 1, bookCode: 'GEN', biblicalChapter: 1},
  {chapterNumber: 2, bookCode: 'TOB', biblicalChapter: 1},
  {chapterNumber: 3, bookCode: 'MAT', biblicalChapter: 1},
  {chapterNumber: 4, bookCode: 'REV', biblicalChapter: 22},
] }
const location = (map: BibleEditionChapterMap, chapterNumber: number) => ({editionKey: map.editionKey, sourceSha256: map.sourceSha256, chapterNumber})
describe('edition-specific Bible chapter correspondence', () => {
  it('maps the reference despite different edition order without mutating maps or saved place', () => {
    const source = Object.freeze(location(protestant, 2))
    const before = JSON.stringify([protestant, catholic])
    expect(mapBibleChapter(source, protestant, catholic)).toEqual({
      status: 'mapped', source, target: location(catholic, 3), bookCode: 'MAT', biblicalChapter: 1,
    })
    expect(JSON.stringify([protestant, catholic])).toBe(before)
    expect(mapBibleChapter(location(catholic, 3), catholic, protestant)).toMatchObject({status: 'mapped', target: location(protestant, 2)})
  })
  it('returns explicit unavailable for a source book missing in the selected target', () => {
    const source = location(catholic, 2)
    expect(mapBibleChapter(source, catholic, protestant)).toEqual({status: 'unavailable', source, reason: 'target-chapter-missing'})
  })
  it('does not treat additional chapters within the same book as present', () => {
    const extended = {...catholic, chapters: [...catholic.chapters, {chapterNumber: 5, bookCode: 'DAN', biblicalChapter: 13}]}
    const shorter = {...protestant, chapters: [...protestant.chapters, {chapterNumber: 4, bookCode: 'DAN', biblicalChapter: 12}]}
    expect(mapBibleChapter(location(extended, 5), extended, shorter)).toMatchObject({status: 'unavailable', reason: 'target-chapter-missing'})
  })
  it('rejects stale or unscoped source identities instead of reinterpreting old ordinals', () => {
    expect(mapBibleChapter({...location(protestant, 2), sourceSha256: 'c'.repeat(64)}, protestant, catholic)).toMatchObject({status: 'unavailable', reason: 'source-revision-mismatch'})
    expect(mapBibleChapter({...location(protestant, 2), editionKey: ''}, protestant, catholic)).toMatchObject({status: 'unavailable', reason: 'source-revision-mismatch'})
    expect(mapBibleChapter(location(protestant, 999), protestant, catholic)).toMatchObject({status: 'unavailable', reason: 'source-chapter-missing'})
  })
  it('rejects ambiguous reference/ordinal maps and invalid chapters', () => {
    for (const bad of [
      {...catholic, chapters: [...catholic.chapters, {...catholic.chapters[1], chapterNumber: 10}]},
      {...catholic, chapters: [...catholic.chapters, {chapterNumber: 2, bookCode: 'DAN', biblicalChapter: 1}]},
      {...catholic, chapters: [{chapterNumber: 1, bookCode: 'MAT', biblicalChapter: 0}]},
    ]) expect(mapBibleChapter(location(protestant, 2), protestant, bad)).toMatchObject({status: 'unavailable', reason: 'invalid-map'})
  })
})
