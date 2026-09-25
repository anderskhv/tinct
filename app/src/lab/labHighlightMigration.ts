import { projectEditionCoordinate, type CoordinateMigration } from '../data/editionCoordinateMigration'
import { tokenizeWithEmphasis } from './labEmphasis'
import type { LabHighlight } from './labHighlights'

export interface HighlightRecovery {
  contentRevision: string
  chapterNumber: number
  paragraphIndex: number
  fromWord: number
  endParagraphIndex: number
  toWord: number
  text?: string
}
export type MigratableHighlight = LabHighlight & {
  contentRevision?: string
  contentMigrationStatus?: 'exact' | 'unresolved'
  contentRecovery?: HighlightRecovery
}
const words = (text: string) => tokenizeWithEmphasis(text).map(word => word.text)

/** Retain every mark. Only relocate when its complete quote survives exactly.
 * Unresolved marks keep their old coordinates/quote/note for recovery and must
 * not be painted against the new edition by the caller.
 */
export function migrateLabHighlight(
  highlight: MigratableHighlight,
  migration: CoordinateMigration,
  currentParagraphs: string[],
): MigratableHighlight {
  if (highlight.bookId !== migration.bookId || !highlight.editionKey) return highlight
  const edition = migration.editions[highlight.editionKey]
  if (!edition || highlight.contentRevision === edition.afterSha256
    || highlight.contentRevision && highlight.contentRevision !== edition.beforeSha256) return highlight
  if (highlight.contentMigrationStatus === 'unresolved' && highlight.contentRecovery) return highlight
  const recovery: HighlightRecovery = highlight.contentRecovery || {
    contentRevision: edition.beforeSha256, chapterNumber: highlight.chapterNumber,
    paragraphIndex: highlight.paragraphIndex, fromWord: highlight.fromWord,
    endParagraphIndex: highlight.endParagraphIndex, toWord: highlight.toWord,
    ...(highlight.text === undefined ? {} : {text: highlight.text}),
  }
  const unresolved = (): MigratableHighlight => ({...highlight,
    contentRevision: edition.beforeSha256, contentMigrationStatus: 'unresolved',
    contentRecovery: recovery,
  })
  const {paragraphIndex: from, endParagraphIndex: to} = highlight
  const count = edition.paragraphCountsBefore[String(highlight.chapterNumber)]
  if (!count || !Number.isSafeInteger(from) || !Number.isSafeInteger(to)
    || from < 0 || to < from || to >= count
    || !Number.isSafeInteger(highlight.fromWord) || !Number.isSafeInteger(highlight.toWord)
    || highlight.fromWord < 0 || highlight.toWord < 0) return unresolved()
  const before: string[] = []
  for (let pi = from; pi <= to; pi++) {
    const entry = edition.entries[highlight.chapterNumber + '.' + pi]
    const text = entry ? entry.oldText : currentParagraphs[pi]
    if (text === undefined) return unresolved()
    const tokens = words(text), a = pi === from ? highlight.fromWord : 0
    const b = pi === to ? highlight.toWord : tokens.length
    if (a > b || b > tokens.length) return unresolved()
    before.push(...tokens.slice(a,b))
  }
  const quote = before.join(' ')
  if (!quote || highlight.text !== undefined && highlight.text !== quote) return unresolved()
  const start = projectEditionCoordinate(migration,highlight.editionKey,{
    chapterNumber:highlight.chapterNumber,paragraphIndex:from,offset:highlight.fromWord,
    contentRevision:highlight.contentRevision,
  },'words','right')
  const end = projectEditionCoordinate(migration,highlight.editionKey,{
    chapterNumber:highlight.chapterNumber,paragraphIndex:to,offset:highlight.toWord,
    contentRevision:highlight.contentRevision,
  },'words','left')
  if (start.status !== 'exact' || end.status !== 'exact'
    || start.point.chapterNumber !== highlight.chapterNumber
    || end.point.chapterNumber !== highlight.chapterNumber
    || start.point.paragraphIndex > end.point.paragraphIndex) return unresolved()
  const after: string[] = []
  for (let pi = start.point.paragraphIndex; pi <= end.point.paragraphIndex; pi++) {
    if (currentParagraphs[pi] === undefined) return unresolved()
    const tokens = words(currentParagraphs[pi])
    const a = pi === start.point.paragraphIndex ? start.point.offset : 0
    const b = pi === end.point.paragraphIndex ? end.point.offset : tokens.length
    if (a > b || b > tokens.length) return unresolved()
    after.push(...tokens.slice(a,b))
  }
  if (after.join(' ') !== quote) return unresolved()
  return {...highlight, paragraphIndex:start.point.paragraphIndex,fromWord:start.point.offset,
    endParagraphIndex:end.point.paragraphIndex,toWord:end.point.offset,
    text:highlight.text ?? quote,contentRevision:edition.afterSha256,
    contentMigrationStatus:'exact',contentRecovery:recovery}
}
