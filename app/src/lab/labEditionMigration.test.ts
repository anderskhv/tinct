import { describe, expect, it } from 'vitest'
import { migrateLabBookPlace, migrateLabPositionCoordinates } from './labEditionMigration'
import { emptyLabPositionState, parseLabPositionState, type LabBookPlace } from './labPosition'
import type { CoordinateMigration } from '../data/editionCoordinateMigration'
const old = 'a'.repeat(64), current = 'b'.repeat(64)
const migration: CoordinateMigration = {
  revision: 'repair', bookId: 'jane-eyre',
  editions: {'original-en': {
    beforeSha256: old, afterSha256: current,
    paragraphCountsBefore: {'28':147}, paragraphCountsAfter: {'28':144},
    entries: {'28.120':{chapter:28,paragraph:117,operation:'renumber',oldWords:8,newWords:8,oldChars:40,newChars:40,
      words:[['equal',0,8,0,8]],chars:[['equal',0,40,0,40]]}},
  }},
}
const place: LabBookPlace = {bookId:'jane-eyre',headerBook:'Jane Eyre',chapterNumber:28,sequentialChapter:28,
 paragraphIndex:120,wordIndex:4,pageIndex:19,primaryEditionKey:'original-en',updatedAt:123,deviceId:'phone',rev:7}

describe('stored reading places across accepted structure repairs', () => {
  it('preserves word, clocks and recovery through local/cloud parser round trips', () => {
    const state = {...emptyLabPositionState('phone','account'),books:{'jane-eyre':place},
      recentChapters:{'jane-eyre:28':place},lastSettledBookId:'jane-eyre',lastSettledAt:123}
    const migrated = migrateLabPositionCoordinates(state,[migration])
    expect(migrated.books['jane-eyre']).toMatchObject({paragraphIndex:117,wordIndex:4,updatedAt:123,rev:7,
      contentRevision:current,contentRecovery:{paragraphIndex:120,wordIndex:4,contentRevision:old}})
    expect(migrated.books['jane-eyre'].pageIndex).toBeUndefined()
    expect(migrated.owner).toBe('account')
    expect(migrated.lastSettledAt).toBe(123)
    expect(migrated.recentChapters?.['jane-eyre:28'].paragraphIndex).toBe(117)
    const parsed = parseLabPositionState(JSON.parse(JSON.stringify(migrated)))
    expect(parsed.books['jane-eyre'].contentRecovery).toEqual(migrated.books['jane-eyre'].contentRecovery)
    expect(migrateLabPositionCoordinates(parsed,[migration])).toBe(parsed)
    expect(state.books['jane-eyre'].paragraphIndex).toBe(120)
  })
  it('does not guess an unrecorded edition or touch preserved Danish coordinates', () => {
    const unknown = {...place,primaryEditionKey:undefined}
    expect(migrateLabBookPlace(unknown,migration)).toBe(unknown)
    expect(migrateLabBookPlace(unknown,migration,'original-en').paragraphIndex).toBe(117)
    const danish={...place,primaryEditionKey:'modern-da'}
    expect(migrateLabBookPlace(danish,migration)).toBe(danish)
  })
  it('cannot move another book or mistake a future revision for the old source', () => {
    const other={...place,bookId:'bible'}
    expect(migrateLabBookPlace(other,migration)).toBe(other)
    const future={...place,contentRevision:'c'.repeat(64)}
    expect(migrateLabBookPlace(future,migration)).toBe(future)
  })
})
