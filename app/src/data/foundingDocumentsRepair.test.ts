import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { projectEditionCoordinate, projectExactEditionRange, type CoordinateMigration } from './editionCoordinateMigration'
import { getBook } from './bookRegistry'
import { isAudioHeld, hasRecordedAudio, isEditionDiscoverable } from './audioAvailability'
const read = (path: string) => JSON.parse(readFileSync(resolve(__dirname, '../../public/data', path), 'utf8'))
describe('Founding Documents revised editions', () => {
  for (const edition of ['modern-en', 'modern-da']) {
    it(edition + ': preserves a saved named quotation in the rewritten Constitution', () => {
      const text = read('editions/us-founding-documents-' + edition + '.json')
      const phrase = edition === 'modern-en' ? 'House of Representatives' : 'Repræsentanternes Hus'
      for (const kind of ['positions', 'highlights']) {
        const map = read('edition-migrations/us-founding-documents.' + kind + '.json') as CoordinateMigration
        const entry = map.editions[edition].entries['2.3']
        expect(entry).toBeDefined()
        const offset = entry.oldText!.indexOf(phrase)
        expect(offset).toBeGreaterThanOrEqual(0)
        const start = { chapterNumber: 2, paragraphIndex: 3, offset }
        const end = { ...start, offset: offset + phrase.length }
        const projected = projectExactEditionRange(map, edition, start, end, 'chars')!
        expect(projected).not.toBeNull()
        expect(text.chapters[1].paragraphs[3].slice(projected.start.offset, projected.end.offset)).toBe(phrase)
        const place = projectEditionCoordinate(map, edition, start, 'chars')
        expect(place.recovery).toMatchObject(start)
        expect(projectEditionCoordinate(map, edition, place.point, 'chars').point).toEqual(place.point)
      }
    })
  }
  it('offers Danish text and holds obsolete modern-English recordings', () => {
    const book = getBook('us-founding-documents')!
    const da = book.editions.find(e => e.key === 'modern-da')!
    expect(da).toMatchObject({ aligned: true, hasAudio: false })
    expect(isEditionDiscoverable(book.id, da)).toBe(true)
    expect(hasRecordedAudio(book.id, da.key)).toBe(false)
    expect(isAudioHeld(book.id, 'modern-en')).toBe(true)
    expect(isAudioHeld(book.id, 'original-en')).toBe(false)
  })
  it('passes the repository modern-English similarity and truncation gate', () => {
    const output = execFileSync('python3', ['books/classify-modern-en.py', 'us-founding-documents', '--gate'], { cwd: resolve(__dirname, '../../..'), encoding: 'utf8' })
    expect(output).toContain('GATE PASS')
  }, 30000)
})
