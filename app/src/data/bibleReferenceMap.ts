/**
 * Edition-local chapter numbers are not Bible passage identities.
 * This adapter is intentionally independent of registry defaults and storage:
 * callers retain the original saved tuple if an exact reference is unavailable.
 */
export interface BibleChapterReference {
  chapterNumber: number
  bookCode: string
  biblicalChapter: number
}
export interface BibleEditionChapterMap {
  editionKey: string
  sourceSha256: string
  chapters: readonly BibleChapterReference[]
}
export interface BibleChapterLocation {
  editionKey: string
  sourceSha256: string
  chapterNumber: number
}
export type BibleChapterMapping =
  | { status: 'mapped'; source: BibleChapterLocation; target: BibleChapterLocation; bookCode: string; biblicalChapter: number }
  | { status: 'unavailable'; source: BibleChapterLocation; reason: 'invalid-map' | 'source-revision-mismatch' | 'source-chapter-missing' | 'target-chapter-missing' }

function validMap(map: BibleEditionChapterMap): boolean {
  if (!map.editionKey || !/^[a-f0-9]{64}$/.test(map.sourceSha256) || !map.chapters.length) return false
  const numbers = new Set<number>(), references = new Set<string>()
  for (const chapter of map.chapters) {
    const key = chapter.bookCode + '.' + chapter.biblicalChapter
    if (!Number.isSafeInteger(chapter.chapterNumber) || chapter.chapterNumber < 1
      || !Number.isSafeInteger(chapter.biblicalChapter) || chapter.biblicalChapter < 1
      || !/^[A-Z0-9]{3}$/.test(chapter.bookCode)
      || numbers.has(chapter.chapterNumber) || references.has(key)) return false
    numbers.add(chapter.chapterNumber)
    references.add(key)
  }
  return true
}

/** Exact source-native reference lookup; no ordinal, nearest-book or Genesis fallback. */
export function mapBibleChapter(
  source: BibleChapterLocation,
  sourceMap: BibleEditionChapterMap,
  targetMap: BibleEditionChapterMap,
): BibleChapterMapping {
  const unavailable = (reason: Extract<BibleChapterMapping, {status: 'unavailable'}>['reason']): BibleChapterMapping =>
    ({ status: 'unavailable', source: { ...source }, reason })
  if (!validMap(sourceMap) || !validMap(targetMap)) return unavailable('invalid-map')
  if (source.editionKey !== sourceMap.editionKey || source.sourceSha256 !== sourceMap.sourceSha256) return unavailable('source-revision-mismatch')
  const reference = sourceMap.chapters.find(chapter => chapter.chapterNumber === source.chapterNumber)
  if (!reference) return unavailable('source-chapter-missing')
  const target = targetMap.chapters.find(chapter => chapter.bookCode === reference.bookCode && chapter.biblicalChapter === reference.biblicalChapter)
  if (!target) return unavailable('target-chapter-missing')
  return {
    status: 'mapped', source: { ...source },
    target: { editionKey: targetMap.editionKey, sourceSha256: targetMap.sourceSha256, chapterNumber: target.chapterNumber },
    bookCode: reference.bookCode, biblicalChapter: reference.biblicalChapter,
  }
}
