// @vitest-environment jsdom
import {preserveUnresolvedSymposiumPositions,SYMPOSIUM_POSITION_RECOVERY_KEY} from '../lab/labPositionStore'
import {readFileSync} from 'node:fs'
import {describe,it,expect} from 'vitest'
import mapData from './symposiumCoordinateMap.json'
import {projectEditionCoordinate,projectExactEditionRange,type CoordinateMigration} from './editionCoordinateMigration'
import {loadedCoordinateMigration,writtenBeforeRelease} from './editionContentRevisions'
import {migrateLabBookPlace} from '../lab/labEditionMigration'
import {migrateLoadedLabPlaces} from '../lab/labContentMigration'
import {migrateLabHighlight} from '../lab/labHighlightMigration'
import {migrateSymposiumRecord,prepareLegacySymposiumRead,stampNewSymposiumRecord} from '../services/symposiumContentMigration'
import {narrationTokens,chunkNarrationTokens,narrationTextForParagraph} from '../narration/narrationCore'
import {createHash} from 'node:crypto'
import {usesRetainedBella} from '../narration/bellaRetention'
const map=mapData as unknown as CoordinateMigration
const current=(ed:string)=>JSON.parse(readFileSync(new URL('../../public/data/editions/symposium-'+ed+'.json',import.meta.url),'utf8'))
describe('Symposium completeness compatibility',()=>{
 it('retains edition-unknown Lab bookmarks before validation without guessing Danish',()=>{
  localStorage.removeItem(SYMPOSIUM_POSITION_RECOVERY_KEY)
  const place={bookId:'symposium',chapterNumber:7,sequentialChapter:7,paragraphIndex:100,wordIndex:8,updatedAt:1700000000000}
  const raw={owner:null,books:{symposium:place},recentChapters:{'symposium:7':place}}
  preserveUnresolvedSymposiumPositions(raw)
  expect(JSON.parse(localStorage.getItem(SYMPOSIUM_POSITION_RECOVERY_KEY)!)).toEqual([{owner:null,status:'unresolved',place}])
  preserveUnresolvedSymposiumPositions(raw)
  expect(JSON.parse(localStorage.getItem(SYMPOSIUM_POSITION_RECOVERY_KEY)!)).toHaveLength(1)
  preserveUnresolvedSymposiumPositions({books:{symposium:{...place,primaryEditionKey:'modern-da'}}})
  expect(JSON.parse(localStorage.getItem(SYMPOSIUM_POSITION_RECOVERY_KEY)!)).toHaveLength(1)
  localStorage.removeItem(SYMPOSIUM_POSITION_RECOVERY_KEY)
 })

 it('migrates unstamped English records arriving later from an old offline client',()=>{
  expect(writtenBeforeRelease('symposium','original-en',undefined,Date.parse('2027-01-01'))).toBe(true)
  expect(writtenBeforeRelease('symposium','modern-da',undefined,Date.parse('2027-01-01'))).toBe(false)
 })
 it('stamps new legacy records and keeps unresolved source revisions intact',()=>{
  const row={bookId:'symposium',editionKey:'original-en',chapterNumber:1,paragraphIndex:0,timestamp:Date.now()}
  const fresh=stampNewSymposiumRecord(row)
  expect(migrateSymposiumRecord(fresh)).toBe(fresh)
  const unresolved={...row,contentRecovery:{paragraphIndex:0},contentMigrationStatus:'unresolved'}
  expect(stampNewSymposiumRecord(unresolved)).toBe(unresolved)
 })
 it('rebuilds seek chunk layouts from current affected text, including Modern chapter 3',()=>{
  for(const ed of ['original-en','modern-en']){
   const source=current(ed),edition=map.editions[ed]
   const chapters=ed==='modern-en'?[1,3,7,8]:[1,7,8]
   for(const ch of chapters)for(const [pi,text] of source.chapters[ch-1].paragraphs.entries()){
    const tokens=narrationTokens(text),chunks=chunkNarrationTokens(tokens)
    expect(chunks.flatMap(c=>tokens.slice(c.wordFrom,c.wordTo))).toEqual(tokens)
    const old=edition.entries[ch+'.'+pi]
    if(old && old.oldText!==text){
     const hash=(s:string)=>createHash('sha256').update(narrationTextForParagraph(s)).digest('hex')
     expect(hash(old.oldText!)).not.toBe(hash(text))
    }
   }
  }
 })

 it('bundles the map before synchronous bounds validation and never selects stale original recordings',()=>{
  expect(loadedCoordinateMigration('positions','symposium')?.revision).toBe(map.revision)
  expect(usesRetainedBella('symposium','original-en','female')).toBe(false)
 })
 for(const ed of ['original-en','modern-en']) {
  it(ed+' preserves every unchanged character and word offset through all 217 source paragraphs',()=>{
   const edition=map.editions[ed]
   for(const [key,entry] of Object.entries(edition.entries)){
    const [chapterNumber,paragraphIndex]=key.split('.').map(Number)
    for(const unit of ['chars','words'] as const) for(const [tag,a,b,c,d] of entry[unit]){
     if(tag!=='equal')continue
     for(const offset of [a+1,Math.floor((a+b)/2),b-1].filter(x=>x>a&&x<b)){
      const p=projectEditionCoordinate(map,ed,{chapterNumber,paragraphIndex,offset},unit)
      expect(p).toMatchObject({status:'exact',point:{chapterNumber:entry.chapter,paragraphIndex:entry.paragraph,offset:c+offset-a}})
     }
    }
   }
  })
  it(ed+' moves a chapter-7 annotation to chapter 8 and keeps its note on reload',()=>{
   const entry=map.editions[ed].entries['7.69'],text=entry.oldText!.split(/\s+/).slice(0,4).join(' ')
   const mark={id:'hl-1700000000000-review',bookId:'symposium',editionKey:ed,chapterNumber:7,paragraphIndex:69,endParagraphIndex:69,fromWord:0,toWord:4,text,note:'Keep my note',color:'sage' as const,kept:true}
   const chapter=current(ed).chapters.find((c:any)=>c.number===8).paragraphs
   const moved=migrateLabHighlight(mark,map,chapter)
   expect(moved).toMatchObject({chapterNumber:8,paragraphIndex:0,endParagraphIndex:0,fromWord:0,toWord:4,text,note:mark.note,contentMigrationStatus:'exact',contentRecovery:{chapterNumber:7,paragraphIndex:69}})
   expect(migrateLabHighlight(moved,map,chapter)).toBe(moved)
  })
 }
 it('does not redistribute partially hydrated cloud annotations',()=>{
  const row={id:'old',bookId:'symposium',editionKey:'original-en',chapterNumber:7,paragraphIndex:69,timestamp:1700000000000,content:'retain'}
  const writes:unknown[]=[]
  const provider={get:<T>(_k:string)=>[row] as T,set:<T>(k:string,v:T)=>{writes.push([k,v])},delete:()=>{},getAll:<T>()=>[] as T[],isHeavyLoaded:()=>false}
  prepareLegacySymposiumRead(provider,'notes:symposium:8')
  expect(writes).toEqual([])
 })
 it('keeps the newest recent place when the repaired chapter boundary combines chapter keys',()=>{
  const base={bookId:'symposium',headerBook:'Symposium',chapterNumber:7,sequentialChapter:7,paragraphIndex:69,wordIndex:1,primaryEditionKey:'original-en',updatedAt:1700000000100,deviceId:'test',rev:2}
  const older={...base,chapterNumber:8,sequentialChapter:8,paragraphIndex:0,updatedAt:1700000000000}
  const result=migrateLoadedLabPlaces({books:{symposium:base},recentChapters:{'symposium:7':base,'symposium:8':older}} as any)
  expect(result.recentChapters?.['symposium:8']).toMatchObject({paragraphIndex:0,updatedAt:base.updatedAt})
 })
 it('moves all six structural boundary positions before validation and keeps Danish unchanged',()=>{
  for(const ed of ['original-en','modern-en','modern-da'])for(const [ch,pi,nc,np] of [[1,0,1,9],[1,39,1,48],[7,68,7,68],[7,69,8,0],[7,114,8,45],[8,0,8,46]]){
   const place={bookId:'symposium',headerBook:'Symposium',chapterNumber:ch,sequentialChapter:ch,paragraphIndex:pi,wordIndex:1,primaryEditionKey:ed,updatedAt:1700000000000,deviceId:'test',rev:2}
   const moved=migrateLabBookPlace(place,map)
   if(ed==='modern-da')expect(moved).toBe(place)
   else {
    expect(moved).toMatchObject({chapterNumber:nc,sequentialChapter:nc,paragraphIndex:np,wordIndex:1,updatedAt:place.updatedAt,rev:2})
    expect(migrateLabBookPlace(moved,map)).toBe(moved)
   }
  }
 })
 it('preserves exact Harmodius UTF-16 offsets and retains rewritten annotations unresolved',()=>{
  const point={chapterNumber:3,paragraphIndex:3,offset:1046}
  const range=projectExactEditionRange(map,'modern-en',point,{...point,offset:1055},'chars')
  expect(range?.start.offset).toBe(1010);expect(range?.end.offset).toBe(1019)
  const old=map.editions['modern-en'].entries['3.3'].oldText!
  const mark={id:'old',bookId:'symposium',editionKey:'modern-en',chapterNumber:3,paragraphIndex:3,startOffset:0,endOffset:old.length,text:old,note:'retain',timestamp:1700000000000}
  expect(migrateSymposiumRecord(mark)).toMatchObject({...mark,contentMigrationStatus:'unresolved',contentRecovery:{originalParagraph:old}})
 })
 it('moves legacy char highlights and paragraph notes before chapter-keyed reads, without discarding Danish or ambiguous context',()=>{
  const text=map.editions['original-en'].entries['7.69'].oldText!.slice(0,4)
  const row={id:'old',bookId:'symposium',editionKey:'original-en',chapterNumber:7,paragraphIndex:69,startOffset:0,endOffset:4,text,note:'mine',timestamp:1700000000000}
  const db=new Map<string,any>([['highlights:symposium:7',[row]],['notes:symposium:7',[{...row,id:'note',startOffset:undefined,endOffset:undefined,content:'my note'}]]])
  const provider={get:<T>(k:string)=>(db.get(k)??null) as T,set:<T>(k:string,v:T)=>{db.set(k,v)},delete:(k:string)=>{db.delete(k)},getAll:<T>(p:string)=>[...db].filter(([k])=>k.startsWith(p)).map(([,v])=>v as T)}
  prepareLegacySymposiumRead(provider,'highlights:symposium:8')
  expect(db.get('highlights:symposium:8')[0]).toMatchObject({chapterNumber:8,paragraphIndex:0,startOffset:0,endOffset:4,note:'mine'})
  expect(db.get('notes:symposium:8')[0].content).toBe('my note')
  expect([...db.keys()].some(k=>k.startsWith('content-recovery:symposium:'))).toBe(true)
  const once=JSON.stringify([...db]);prepareLegacySymposiumRead(provider,'highlights:symposium:8');expect(JSON.stringify([...db])).toBe(once)
  const danish={...row,editionKey:'modern-da'};expect(migrateSymposiumRecord(danish)).toBe(danish)
  const unknown={bookId:'symposium',chapterNumber:7,lastParagraphIndex:100,updatedAt:1700000000000}
  expect(migrateSymposiumRecord(unknown,true)).toMatchObject({...unknown,contentMigrationStatus:'unresolved',contentRecovery:unknown})
 })
})
