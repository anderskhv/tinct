import type { StorageProvider } from './storage'
import mapData from '../data/symposiumCoordinateMap.json'
import { projectEditionCoordinate, projectExactEditionRange, type CoordinateMigration } from '../data/editionCoordinateMigration'
import { CONTENT_RELEASES, writtenBeforeRelease } from '../data/editionContentRevisions'

const map = mapData as unknown as CoordinateMigration
type RecordValue = Record<string, any>
const isObject = (v: unknown): v is RecordValue => !!v && typeof v === 'object' && !Array.isArray(v)

/** Preserve the source tuple and quotation, including records too ambiguous to move.
 * This runs at the synchronous storage boundary, before legacy bounds validation.
 * No network or timestamp change is introduced by a coordinate repair.
 */
export function migrateSymposiumRecord(value: RecordValue, position = false): RecordValue {
  if (value.bookId !== 'symposium' || value.contentMigrationStatus === 'unresolved') return value
  const edition = value.editionKey || value.primaryEditionKey
  if (edition === 'modern-da') return value
  const written = position ? value.updatedAt : value.timestamp
  if (edition ? !writtenBeforeRelease('symposium', edition, value.contentRevision, written)
    : value.contentRevision || !(typeof written === 'number' && written < CONTENT_RELEASES.symposium.releasedAt)) return value
  const pi = position ? value.lastParagraphIndex : value.paragraphIndex
  const entry = map.editions[edition]?.entries[value.chapterNumber + '.' + pi]
  const recovery = value.contentRecovery || { ...value, originalParagraph: entry?.oldText }
  const unresolved = () => ({ ...value, contentMigrationStatus: 'unresolved', contentRecovery: recovery })
  // An old position without an edition could be Danish; never guess.
  if (!edition || !Number.isSafeInteger(pi)) return unresolved()
  const point = { chapterNumber: value.chapterNumber, paragraphIndex: pi, offset: 0, contentRevision: value.contentRevision }
  if (position) {
    const result = projectEditionCoordinate(map, edition, point, 'chars')
    if (result.status === 'unresolved') return unresolved()
    return { ...value, chapterNumber: result.point.chapterNumber, lastParagraphIndex: result.point.paragraphIndex,
      currentPage: 1, totalPages: 1, scrollFraction: 0, contentRevision: result.point.contentRevision,
      contentMigrationStatus: result.status, contentRecovery: recovery }
  }
  if (typeof value.startOffset === 'number' && typeof value.endOffset === 'number') {
    if (!entry?.oldText || entry.oldText.slice(value.startOffset,value.endOffset) !== value.text) return unresolved()
    const result = projectExactEditionRange(map, edition, {...point,offset:value.startOffset}, {...point,offset:value.endOffset}, 'chars')
    if (!result) return unresolved()
    return {...value, chapterNumber:result.start.chapterNumber, paragraphIndex:result.start.paragraphIndex,
      startOffset:result.start.offset,endOffset:result.end.offset,contentRevision:result.start.contentRevision,
      contentMigrationStatus:'exact',contentRecovery:recovery}
  }
  // A paragraph-anchored note may move if the paragraph is unchanged. For a
  // rewritten paragraph retain its quote/context instead of attaching by guess.
  if (!entry || entry.chars.length !== 1 || entry.chars[0][0] !== 'equal') return unresolved()
  const result = projectEditionCoordinate(map, edition, point, 'chars')
  if (result.status !== 'exact') return unresolved()
  return {...value,chapterNumber:result.point.chapterNumber,paragraphIndex:result.point.paragraphIndex,
    contentRevision:result.point.contentRevision,contentMigrationStatus:'exact',contentRecovery:recovery}
}

let migrating = false
/** Re-run after remote hydration as well as offline reads; individual hash stamps
 * make it idempotent. Destination writes precede source writes; retained IDs
 * deduplicate an interrupted cross-chapter move on the next pass.
 */
export function prepareLegacySymposiumRead(provider: StorageProvider, key: string): void {
  if (migrating || !/^(position|highlights|notes):symposium(?::|$)/.test(key)) return
  migrating = true
  try {
    const position = provider.get<RecordValue>('position:symposium')
    if (isObject(position)) {
      const next = migrateSymposiumRecord(position,true)
      if (next !== position) provider.set('position:symposium',next)
    }
    for (const kind of ['highlights','notes']) {
      const old = new Map<number, RecordValue[]>(), next = new Map<number, RecordValue[]>()
      for (let ch=1;ch<=8;ch++) {
        const rows=provider.get<RecordValue[]>(kind+':symposium:'+ch)
        if (!Array.isArray(rows)) continue
        old.set(ch,rows)
        for (const row of rows) {
          const moved=isObject(row)?migrateSymposiumRecord(row):row
          const dest=isObject(moved)&&Number.isSafeInteger(moved.chapterNumber)?moved.chapterNumber:ch
          const target=next.get(dest)||[]
          const index=target.findIndex(v=>v.id===moved.id)
          if(index<0) target.push(moved)
          else if ((moved.timestamp||0)>=(target[index].timestamp||0)) target[index]=moved
          next.set(dest,target)
        }
      }
      // First persist destination unions. Then clear sources, never deleting a row.
      const changes=[...new Set([...old.keys(),...next.keys()])].map(ch=>({ch,rows:next.get(ch)||[]}))
        .filter(({ch,rows})=>JSON.stringify(old.get(ch)||[])!==JSON.stringify(rows))
        .sort((a,b)=>b.rows.length-a.rows.length)
      for(const {ch,rows} of changes) provider.set(kind+':symposium:'+ch,rows)
    }
  } finally { migrating=false }
}
