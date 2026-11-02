import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { coordinateEditionForRevision, projectEditionCoordinate, projectExactEditionRange, type CoordinateMigration } from './editionCoordinateMigration'
import { CONTENT_RELEASES, sourceContentRevision, writtenBeforeRelease } from './editionContentRevisions'
import { migrateLabBookPlace } from '../lab/labEditionMigration'
import { migrateLabHighlight, type MigratableHighlight } from '../lab/labHighlightMigration'
import { isAudioHeld } from './audioAvailability'
const read = (path: string) => JSON.parse(readFileSync(resolve(__dirname, '../../public/data', path), 'utf8'))
const bookId = 'the-art-of-war'
const release = CONTENT_RELEASES[bookId].editions['modern-en']
const legacy = release.previous![0]
const text = read('editions/the-art-of-war-modern-en.json')
describe('Art of War second repair preserves both historical text generations', () => {
  for (const kind of ['positions', 'highlights']) {
    const map = read('edition-migrations/the-art-of-war.' + kind + '.json') as CoordinateMigration
    it(kind + ': preserves the original rights replacement and older recovery', () => {
      const point = { chapterNumber: 1, paragraphIndex: 0, offset: 2, contentRevision: legacy.before }
      const projected = projectEditionCoordinate(map, 'modern-en', point, 'words')
      expect(projected.status).toBe('approximate')
      expect(projected.recovery).toEqual(point)
      expect(projected.point.contentRevision).toBe(release.after)
      expect(projectEditionCoordinate(map, 'modern-en', projected.point, 'words').point).toEqual(projected.point)
      expect(projectExactEditionRange(map, 'modern-en', {...point,offset:0}, {...point,offset:2}, 'words')).toBeNull()
      expect(projectEditionCoordinate(map, 'modern-en', {...point,contentRevision:'unknown'}, 'words').status).toBe('unresolved')
      expect(map.editions['original-en'].beforeSha256).toBe('60beeb94051b07312e0c554ce215a73ebc87e503006e7832cba7e09309be1d61')
    })
    it(kind + ': moves a current-generation quotation exactly and keeps replaced wording recoverable', () => {
      const point = { chapterNumber: 7, paragraphIndex: 25, offset: 0, contentRevision: release.before }
      const range = projectExactEditionRange(map,'modern-en',point,{...point,offset:2},'words')!
      expect(range).not.toBeNull()
      expect(text.chapters[6].paragraphs[25].split(/\s+/).slice(range.start.offset,range.end.offset).join(' ')).toBe('Preserve strength')
      const entry = map.editions['modern-en'].entries['7.25']
      const start = entry.oldText!.indexOf('bringing fatigue against rest')
      expect(start).toBeGreaterThan(0)
      expect(projectExactEditionRange(map,'modern-en',{...point,offset:start},{...point,offset:start+28},'chars')).toBeNull()
    })
  }
  it('routes unstamped places by original write time without changing reading activity', () => {
    const map = read('edition-migrations/the-art-of-war.positions.json') as CoordinateMigration
    for (const [writtenAt,expected] of [[legacy.releasedAt-1,legacy.before],[legacy.releasedAt,release.before]] as const) {
      expect(sourceContentRevision(bookId,'modern-en',undefined,writtenAt)).toBe(expected)
      const place = { bookId,headerBook:'The Art of War',primaryEditionKey:'modern-en',chapterNumber:1,sequentialChapter:1,paragraphIndex:0,wordIndex:2,updatedAt:writtenAt,deviceId:'reader',rev:5,pageIndex:9 }
      const moved = migrateLabBookPlace(place,map)
      expect(moved.contentRecovery?.contentRevision).toBe(expected)
      expect(moved.contentRevision).toBe(release.after)
      expect(moved.updatedAt).toBe(writtenAt)
      expect(moved.rev).toBe(5)
      expect(moved.pageIndex).toBeUndefined()
      expect(migrateLabBookPlace(moved,map)).toBe(moved)
    }
    expect(writtenBeforeRelease(bookId,'modern-en',legacy.before,Date.now())).toBe(true)
    expect(writtenBeforeRelease(bookId,'modern-en',release.before,Date.now())).toBe(true)
    expect(writtenBeforeRelease(bookId,'modern-en',release.after,0)).toBe(false)
    expect(writtenBeforeRelease(bookId,'modern-en',undefined,release.releasedAt!)).toBe(false)
  })
  it('keeps pre-replacement highlights unresolved and moves an unchanged current quote with its note', () => {
    const map = read('edition-migrations/the-art-of-war.highlights.json') as CoordinateMigration
    const base: MigratableHighlight = {id:'hl-'+(legacy.releasedAt-1)+'-old',bookId,editionKey:'modern-en',chapterNumber:1,paragraphIndex:0,endParagraphIndex:0,fromWord:0,toWord:2,color:'gold',note:'Keep this note',text:'Old translation'}
    const old = migrateLabHighlight(base,map,text.chapters[0].paragraphs)
    expect(old.contentMigrationStatus).toBe('unresolved')
    expect(old.contentRecovery?.contentRevision).toBe(legacy.before)
    expect(old.note).toBe(base.note)
    expect(old.text).toBe(base.text)
    const current: MigratableHighlight = {...base,id:'hl-'+(legacy.releasedAt+1)+'-current',chapterNumber:7,paragraphIndex:25,endParagraphIndex:25,text:'Preserve strength'}
    const moved = migrateLabHighlight(current,map,text.chapters[6].paragraphs)
    expect(moved.contentMigrationStatus).toBe('exact')
    expect(moved.contentRevision).toBe(release.after)
    expect(moved.contentRecovery?.contentRevision).toBe(release.before)
    expect(moved.note).toBe(base.note)
    expect(migrateLabHighlight(moved,map,text.chapters[6].paragraphs)).toBe(moved)
    const broken = structuredClone(map)
    broken.editions['modern-en'].previous![legacy.before].afterSha256 = 'wrong-target'
    expect(coordinateEditionForRevision(broken,'modern-en',legacy.before)).toBeUndefined()
  })
  it('keeps obsolete modern-English recordings held after text repair', () => {
    expect(isAudioHeld(bookId,'modern-en')).toBe(true)
  })
  it('passes the modern-English similarity and truncation gate', () => {
    const output=execFileSync('python3',['books/classify-modern-en.py',bookId,'--gate'],{cwd:resolve(__dirname,'../../..'),encoding:'utf8'})
    expect(output).toContain('GATE PASS')
  },30000)
})
