import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { projectEditionCoordinate, projectExactEditionRange, type CoordinateMigration } from './editionCoordinateMigration'
const read = (path: string) => JSON.parse(readFileSync(resolve(__dirname, '../../public/data', path), 'utf8'))
describe('Apology restored exile argument and saved reader data', () => {
  for (const edition of ['modern-en', 'modern-da']) {
    it(edition + ': keeps a saved quotation with the argument formerly duplicated in paragraph five', () => {
      const text = read('editions/apology-' + edition + '.json')
      expect(text.chapters[1].paragraphs[4]).toContain(edition === 'modern-en' ? 'wandering from city to city' : 'vandre fra by til by')
      const phrase = edition === 'modern-en' ? 'Plato, Crito, Critobulus, and Apollodorus' : 'Platon, Kriton, Kritobulos og Apollodoros'
      for (const kind of ['positions', 'highlights']) {
        const map = read('edition-migrations/apology.' + kind + '.json') as CoordinateMigration
        const entry = map.editions[edition].entries['2.4']
        const startOffset = entry.oldText!.indexOf(phrase)
        expect(startOffset).toBeGreaterThanOrEqual(0)
        const start = { chapterNumber: 2, paragraphIndex: 4, offset: startOffset }
        const end = { ...start, offset: startOffset + phrase.length }
        const projected = projectExactEditionRange(map, edition, start, end, 'chars')!
        expect(projected).not.toBeNull()
        expect(projected.start.paragraphIndex).toBe(5)
        expect(text.chapters[1].paragraphs[5].slice(projected.start.offset, projected.end.offset)).toBe(phrase)
        const place = projectEditionCoordinate(map, edition, start, 'chars')
        expect(place.recovery).toMatchObject(start)
        expect(projectEditionCoordinate(map, edition, place.point, 'chars').point).toEqual(place.point)
      }
    })
  }
  it('passes the repository modern-English similarity and truncation gate', () => {
    const output = execFileSync('python3', ['books/classify-modern-en.py', 'apology', '--gate'], { cwd: resolve(__dirname, '../../..'), encoding: 'utf8' })
    expect(output).toContain('GATE PASS')
  }, 30000)
})
