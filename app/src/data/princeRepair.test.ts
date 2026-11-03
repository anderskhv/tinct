import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { projectEditionCoordinate, projectExactEditionRange, type CoordinateMigration } from './editionCoordinateMigration'
import { CONTENT_RELEASES, writtenBeforeRelease } from './editionContentRevisions'
import { migrateLabBookPlace } from '../lab/labEditionMigration'
import { migrateLabHighlight, type MigratableHighlight } from '../lab/labHighlightMigration'
import { isAudioHeld } from './audioAvailability'
const read = (path: string) => JSON.parse(readFileSync(resolve(__dirname, '../../public/data', path), 'utf8'))
const bookId = 'the-prince'
const release = CONTENT_RELEASES[bookId]
const english = release.editions['modern-en']
const text = read('editions/the-prince-modern-en.json')
describe('Prince editorial repair preserves reader data', () => {
  for (const kind of ['positions', 'highlights']) {
    const map = read('edition-migrations/the-prince.' + kind + '.json') as CoordinateMigration
    it(kind + ': carries an unchanged quote exactly and rejects the corrected false name', () => {
      const point = {chapterNumber:12,paragraphIndex:2,offset:0,contentRevision:english.before}
      const range = projectExactEditionRange(map,'modern-en',point,{...point,offset:2},'words')!
      expect(range).not.toBeNull()
      expect(text.chapters[11].paragraphs[2].split(/\s+/).slice(range.start.offset,range.end.offset).join(' ')).toBe('Before Charles,')
      const oldName = {...point,chapterNumber:27,paragraphIndex:4}
      expect(projectExactEditionRange(map,'modern-en',oldName,{...oldName,offset:3},'words')).toBeNull()
      expect(projectEditionCoordinate(map,'modern-en',{...point,contentRevision:'unknown'},'words').status).toBe('unresolved')
    })
  }
  it('moves old English and Danish places without changing saved reading activity', () => {
    const map=read('edition-migrations/the-prince.positions.json') as CoordinateMigration
    for (const edition of ['modern-en','modern-da']) {
      const before=release.editions[edition].before
      const writtenAt=release.releasedAt-1
      expect(writtenBeforeRelease(bookId,edition,undefined,writtenAt)).toBe(true)
      const place={bookId,headerBook:'The Prince',primaryEditionKey:edition,chapterNumber:12,sequentialChapter:12,paragraphIndex:2,wordIndex:0,updatedAt:writtenAt,deviceId:'reader',rev:5,pageIndex:9}
      const moved=migrateLabBookPlace(place,map)
      expect(moved.contentRecovery?.contentRevision).toBe(before)
      expect(moved.contentRevision).toBe(release.editions[edition].after)
      expect(moved.updatedAt).toBe(writtenAt)
      expect(moved.rev).toBe(5)
      expect(moved.pageIndex).toBeUndefined()
      expect(migrateLabBookPlace(moved,map)).toBe(moved)
      expect(writtenBeforeRelease(bookId,edition,undefined,release.releasedAt)).toBe(false)
    }
  })
  it('preserves highlight notes and retains replaced wording as unresolved recovery', () => {
    const map=read('edition-migrations/the-prince.highlights.json') as CoordinateMigration
    const base:MigratableHighlight={id:'hl-'+(release.releasedAt-1)+'-quote',bookId,editionKey:'modern-en',chapterNumber:12,paragraphIndex:2,endParagraphIndex:2,fromWord:0,toWord:2,color:'gold',note:'Keep this note',text:'Before Charles,'}
    const moved=migrateLabHighlight(base,map,text.chapters[11].paragraphs)
    expect(moved.contentMigrationStatus).toBe('exact')
    expect(moved.contentRevision).toBe(english.after)
    expect(moved.contentRecovery?.contentRevision).toBe(english.before)
    expect(moved.note).toBe(base.note)
    expect(migrateLabHighlight(moved,map,text.chapters[11].paragraphs)).toBe(moved)
    const oldName:MigratableHighlight={...base,id:'hl-'+(release.releasedAt-1)+'-name',chapterNumber:27,paragraphIndex:4,endParagraphIndex:4,toWord:3,text:"Giuliano de' Medici."}
    const unresolved=migrateLabHighlight(oldName,map,text.chapters[26].paragraphs)
    expect(unresolved.contentMigrationStatus).toBe('unresolved')
    expect(unresolved.text).toBe(oldName.text)
    expect(unresolved.note).toBe(oldName.note)
    expect(unresolved.contentRecovery?.contentRevision).toBe(english.before)
  })
  it('retains the existing audio hold for revised English',()=>expect(isAudioHeld(bookId,'modern-en')).toBe(true))
  it('passes the modern-English similarity and truncation gate',()=>{
    const output=execFileSync('python3',['books/classify-modern-en.py',bookId,'--gate'],{cwd:resolve(__dirname,'../../..'),encoding:'utf8'})
    expect(output).toContain('GATE PASS')
  },30000)
})
