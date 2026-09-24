import { describe, expect, it } from 'vitest'
import { migrateLabHighlight, type MigratableHighlight } from './labHighlightMigration'
import type { CoordinateMigration } from '../data/editionCoordinateMigration'
const old='a'.repeat(64), current='b'.repeat(64)
const migration: CoordinateMigration = {
 revision:'repair',bookId:'pride-and-prejudice',editions:{'original-en':{
  beforeSha256:old,afterSha256:current,paragraphCountsBefore:{'3':3},paragraphCountsAfter:{'3':2},
  entries:{
   '3.0':{chapter:3,paragraph:0,operation:'merge-head',oldText:'First half here',oldWords:3,newWords:6,oldChars:15,newChars:32,words:[['equal',0,3,0,3]],chars:[]},
   '3.1':{chapter:3,paragraph:0,operation:'merge-tail',oldText:'second half there',oldWords:3,newWords:6,oldChars:17,newChars:32,words:[['equal',0,3,3,6]],chars:[]},
   '3.2':{chapter:3,paragraph:1,operation:'keep',oldText:'Next paragraph unchanged',oldWords:3,newWords:3,oldChars:24,newChars:24,words:[['equal',0,3,0,3]],chars:[]},
  },
 }},
}
const currentText=['First half here second half there','Next paragraph unchanged']
const mark: MigratableHighlight={id:'kept',bookId:'pride-and-prejudice',editionKey:'original-en',
 chapterNumber:3,paragraphIndex:1,fromWord:1,endParagraphIndex:1,toWord:3,
 text:'half there',note:'My original note',color:'sage',kept:true}
describe('non-lossy annotation projection',()=>{
 it('moves merged-tail ranges once and preserves quote, note and recovery',()=>{
  const result=migrateLabHighlight(mark,migration,currentText)
  expect(result).toMatchObject({paragraphIndex:0,fromWord:4,endParagraphIndex:0,toWord:6,
   text:'half there',note:mark.note,contentRevision:current,contentMigrationStatus:'exact',
   contentRecovery:{paragraphIndex:1,fromWord:1,toWord:3,contentRevision:old,text:'half there'}})
  const reloaded=JSON.parse(JSON.stringify(result))
  expect(migrateLabHighlight(reloaded,migration,currentText)).toBe(reloaded)
  expect(mark.paragraphIndex).toBe(1)
 })
 it('preserves a complete range across the merged boundary',()=>{
  const crossing={...mark,paragraphIndex:0,fromWord:2,toWord:2,text:'here second half'}
  expect(migrateLabHighlight(crossing,migration,currentText)).toMatchObject({
   paragraphIndex:0,endParagraphIndex:0,fromWord:2,toWord:5,text:'here second half',
   contentMigrationStatus:'exact',
  })
 })
 it('retains stale, rewritten and out-of-bounds ranges without shortening or repainting',()=>{
  for(const input of [{...mark,text:'a different saved quotation'},{...mark,toWord:99}]){
   const result=migrateLabHighlight(input,migration,currentText)
   expect(result).toMatchObject({...input,contentMigrationStatus:'unresolved',contentRevision:old})
   expect(result.contentRecovery?.text).toBe(input.text)
   expect(migrateLabHighlight(result,migration,currentText)).toBe(result)
  }
  const result=migrateLabHighlight(mark,migration,['First half here rewritten wording','Next paragraph unchanged'])
  expect(result.contentMigrationStatus).toBe('unresolved')
  expect(result.note).toBe(mark.note)
  expect(result.text).toBe(mark.text)
 })
 it('does not infer an edition, touch another book or reprocess a future revision',()=>{
  for(const input of [{...mark,editionKey:undefined},{...mark,editionKey:'modern-da'},
   {...mark,bookId:'bible'},{...mark,contentRevision:'c'.repeat(64)}]){
   expect(migrateLabHighlight(input,migration,currentText)).toBe(input)
  }
 })
 it('recovers the quote for a legacy mark only from verified old text',()=>{
  const result=migrateLabHighlight({...mark,text:undefined},migration,currentText)
  expect(result.text).toBe('half there')
  expect(result.contentMigrationStatus).toBe('exact')
 })
})
