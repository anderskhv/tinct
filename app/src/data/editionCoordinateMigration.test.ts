import { describe, expect, it } from 'vitest'
import { projectEditionCoordinate, projectExactEditionRange, type CoordinateMigration } from './editionCoordinateMigration'
const migration: CoordinateMigration = {
  revision: 'repair-1', bookId: 'book', editions: {
    'original-en': {
      beforeSha256: 'old', afterSha256: 'new',
      paragraphCountsBefore: { '3': 6 }, paragraphCountsAfter: { '3': 5 },
      entries: {
        '3.4': { chapter: 3, paragraph: 3, operation: 'merge-tail', oldWords: 4, newWords: 8, oldChars: 9, newChars: 21,
          words: [['equal',0,4,4,8]], chars: [['equal',0,9,12,21]] },
        '3.5': { chapter: 3, paragraph: 4, operation: 'renumber', oldWords: 8, newWords: 8, oldChars: 30, newChars: 30,
          words: [['equal',0,8,0,8]], chars: [['equal',0,30,0,30]] },
        '3.2': { chapter: 3, paragraph: 2, operation: 'keep', oldWords: 6, newWords: 4, oldChars: 20, newChars: 12,
          words: [['equal',0,2,0,2],['replace',2,5,2,3],['equal',5,6,3,4]],
          chars: [['equal',0,5,0,5],['replace',5,18,5,10],['equal',18,20,10,12]] },
      },
    },
  },
}
const point = (paragraphIndex: number, offset: number) => ({chapterNumber:3,paragraphIndex,offset})

describe('accepted edition coordinate migration', () => {
  it('moves a tail word by words, not by its UTF-16 character shift', () => {
    const p = projectEditionCoordinate(migration,'original-en',point(4,2),'words')
    expect(p.point).toEqual({...point(3,6),contentRevision:'new'})
    expect(p.recovery).toEqual({...point(4,2),contentRevision:'old'})
    expect(projectEditionCoordinate(migration,'original-en',point(4,2),'chars').point.offset).toBe(14)
  })
  it('does not move an already migrated position twice', () => {
    const p = projectEditionCoordinate(migration,'original-en',point(5,7),'words')
    expect(p.point.paragraphIndex).toBe(4)
    expect(projectEditionCoordinate(migration,'original-en',p.point,'words').point).toBe(p.point)
  })
  it('keeps uncertain rewritten positions recoverable and does not pretend annotations match', () => {
    const p = projectEditionCoordinate(migration,'original-en',point(2,3),'words')
    expect(p.status).toBe('approximate')
    expect(p.recovery?.offset).toBe(3)
    expect(projectExactEditionRange(migration,'original-en',point(2,1),point(2,5),'words')).toBeNull()
  })
  it('preserves exact annotations inside a merged tail', () => {
    expect(projectExactEditionRange(migration,'original-en',point(4,1),point(4,3),'words')).toEqual({
      start:{...point(3,5),contentRevision:'new'}, end:{...point(3,7),contentRevision:'new'},
    })
  })
  it('does not clamp malformed positions or reinterpret an unknown edition/revision', () => {
    for (const p of [point(4,50),point(9,1),{...point(4,1),contentRevision:'future'}]) {
      expect(projectEditionCoordinate(migration,'original-en',p,'words')).toMatchObject({point:p,status:'unresolved'})
    }
    expect(projectEditionCoordinate(migration,'modern-da',point(4,1),'words').status).toBe('unresolved')
  })
})

it('validates already migrated positions and ranges against the target structure', () => {
  for (const p of [point(5,1),point(3,9),point(3,-1),point(-1,0),{...point(3,0),chapterNumber:0}]) {
    const current = {...p,contentRevision:'new'}
    expect(projectEditionCoordinate(migration,'original-en',current,'words')).toMatchObject({point:current,status:'unresolved'})
    expect(projectExactEditionRange(migration,'original-en',current,{...current,offset:current.offset+1},'words')).toBeNull()
  }
})
