/** Pure, versioned coordinate projection for accepted edition repairs.
 * The input map is generated and verified against pinned source bytes.
 * Callers must keep the returned recovery tuple and retain unresolved marks.
 */
export type CoordinateOp = ['equal' | 'replace' | 'delete' | 'insert', number, number, number, number]
export interface CoordinateEntry {
  chapter: number
  paragraph: number
  operation: string
  oldText?: string
  oldWords: number
  newWords: number
  oldChars: number
  newChars: number
  words: CoordinateOp[]
  chars: CoordinateOp[]
}
export interface CoordinateEdition {
  beforeSha256: string
  afterSha256: string
  paragraphCountsBefore: Record<string, number>
  paragraphCountsAfter: Record<string, number>
  entries: Record<string, CoordinateEntry>
}
export interface CoordinateMigration {
  revision: string
  bookId: string
  editions: Record<string, CoordinateEdition>
}
export interface EditionCoordinate {
  chapterNumber: number
  paragraphIndex: number
  offset: number
  contentRevision?: string
}
export interface ProjectedCoordinate {
  point: EditionCoordinate
  status: 'exact' | 'approximate' | 'unresolved'
  /** Never substitute this tuple with the new point during a second read/write. */
  recovery?: EditionCoordinate
}
const integer = (value: number) => Number.isSafeInteger(value) && value >= 0

/** Positions can land near rewritten wording; annotations must use exactRange. */
export function projectEditionCoordinate(
  migration: CoordinateMigration,
  editionKey: string,
  point: EditionCoordinate,
  unit: 'words' | 'chars',
  bias: 'left' | 'right' = 'right',
): ProjectedCoordinate {
  const edition = migration.editions[editionKey]
  if (!edition) return { point, status: 'unresolved' }
  if (point.contentRevision === edition.afterSha256) {
    const count = edition.paragraphCountsAfter[String(point.chapterNumber)]
    if (!integer(point.chapterNumber) || point.chapterNumber < 1 || !integer(point.paragraphIndex) || !integer(point.offset) || !count || point.paragraphIndex >= count) {
      return { point, status: 'unresolved' }
    }
    const targets = Object.values(edition.entries).filter(entry => entry.chapter === point.chapterNumber && entry.paragraph === point.paragraphIndex)
    if (targets.length && point.offset > Math.max(...targets.map(entry => unit === 'words' ? entry.newWords : entry.newChars))) {
      return { point, status: 'unresolved' }
    }
    return { point, status: 'exact' }
  }
  if (point.contentRevision && point.contentRevision !== edition.beforeSha256) return { point, status: 'unresolved' }
  const count = edition.paragraphCountsBefore[String(point.chapterNumber)]
  if (!integer(point.paragraphIndex) || !integer(point.offset) || !count || point.paragraphIndex >= count) {
    return { point, status: 'unresolved' }
  }
  const recovery = { ...point, contentRevision: edition.beforeSha256 }
  const entry = edition.entries[point.chapterNumber + '.' + point.paragraphIndex]
  if (!entry) return { point: { ...point, contentRevision: edition.afterSha256 }, status: 'exact', recovery }
  const limit = unit === 'words' ? entry.oldWords : entry.oldChars
  if (point.offset > limit) return { point, status: 'unresolved', recovery }
  const ops = entry[unit]
  // Equal spans own their interior. At boundaries, the caller chooses the
  // side of newly inserted text (selection start right, selection end left).
  const equal = ops.filter(([tag, a, b]) => tag === 'equal' && a <= point.offset && point.offset <= b)
  const exact = bias === 'left' ? equal[0] : equal.at(-1)
  const inserts = ops.filter(([tag, a]) => tag === 'insert' && a === point.offset)
  let offset: number | undefined
  let status: ProjectedCoordinate['status'] = 'exact'
  if (inserts.length) {
    offset = bias === 'left' ? inserts[0][3] : inserts[inserts.length - 1][4]
  } else if (exact) {
    offset = exact[3] + point.offset - exact[1]
  } else {
    const changed = ops.find(([, a, b]) => a <= point.offset && point.offset <= b)
    if (!changed) return { point, status: 'unresolved', recovery }
    const [, a, b, c, d] = changed
    offset = b === a ? (bias === 'left' ? c : d) : c + Math.floor((point.offset - a) * (d - c) / (b - a))
    status = 'approximate'
  }
  if (!integer(offset) || offset > (unit === 'words' ? entry.newWords : entry.newChars)) {
    return { point, status: 'unresolved', recovery }
  }
  return {
    point: { chapterNumber: entry.chapter, paragraphIndex: entry.paragraph, offset, contentRevision: edition.afterSha256 },
    status,
    recovery,
  }
}

/** Single-paragraph annotations are exact only within one unchanged interval.
 * A replaced or deleted range remains recoverable, never silently shortened.
 */
export function projectExactEditionRange(
  migration: CoordinateMigration,
  editionKey: string,
  start: EditionCoordinate,
  end: EditionCoordinate,
  unit: 'words' | 'chars',
): { start: EditionCoordinate; end: EditionCoordinate } | null {
  if (start.chapterNumber !== end.chapterNumber || start.paragraphIndex !== end.paragraphIndex || start.offset >= end.offset) return null
  const edition = migration.editions[editionKey]
  if (!edition || start.contentRevision !== end.contentRevision) return null
  if (start.contentRevision === edition.afterSha256) {
    const a = projectEditionCoordinate(migration, editionKey, start, unit)
    const b = projectEditionCoordinate(migration, editionKey, end, unit)
    return a.status === 'exact' && b.status === 'exact' ? { start, end } : null
  }
  if (start.contentRevision && start.contentRevision !== edition.beforeSha256) return null
  const entry = edition.entries[start.chapterNumber + '.' + start.paragraphIndex]
  if (entry && !entry[unit].some(([tag, a, b]) => tag === 'equal' && a <= start.offset && end.offset <= b)) return null
  const a = projectEditionCoordinate(migration, editionKey, start, unit, 'right')
  const b = projectEditionCoordinate(migration, editionKey, end, unit, 'left')
  if (a.status !== 'exact' || b.status !== 'exact') return null
  return { start: a.point, end: b.point }
}
