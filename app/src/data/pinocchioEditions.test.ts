import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { figureToken } from '../lab/labFigures'

// Pinocchio is published from its content package (books/wip/pinocchio): the
// three editions are the package files with the package's three illustrations
// added as figure paragraphs (illustrations/illustrations.json), in every
// edition at the same index, so the editions stay aligned 1:1. Nothing else
// may differ from the package text.
const EDITIONS = ['original-it', 'modern-en', 'modern-da']
type Edition = { chapters: { number: number; title: string; paragraphs: string[]; figures?: { id: string; src: string; alt?: string; caption?: string }[] }[] }
const json = (path: string) => JSON.parse(readFileSync(resolve(__dirname, path), 'utf8'))
const placements: { chapter: number; afterParagraphIndex: number }[] = json('../../../books/wip/pinocchio/illustrations/illustrations.json').illustrations

describe('Pinocchio editions published from the content package', () => {
  for (const edition of EDITIONS) {
    it(`${edition}: the package text, plus the three illustrations at their places`, () => {
      const published: Edition = json(`../../public/data/editions/pinocchio-${edition}.json`)
      const source: Edition = json(`../../../books/wip/pinocchio/editions/pinocchio-${edition}.json`)
      expect(published.chapters.map(c => c.number)).toEqual(source.chapters.map(c => c.number))
      published.chapters.forEach((chapter, i) => {
        const expected = [...source.chapters[i].paragraphs]
        const placement = placements.find(p => p.chapter === chapter.number)
        if (placement) {
          const id = `ch${String(chapter.number).padStart(2, '0')}`
          expected.splice(placement.afterParagraphIndex + 1, 0, figureToken(id))
          expect(chapter.figures?.map(f => f.id)).toEqual([id])
          expect(chapter.figures![0].src).toBe(`/data/figures/pinocchio/chapter-${String(chapter.number).padStart(2, '0')}.webp`)
          expect(chapter.figures![0].alt?.length).toBeGreaterThan(10)
          // No credit line (Anders, 10 Nov 2026).
          expect(chapter.figures![0].caption).toBeUndefined()
        } else expect(chapter.figures).toBeUndefined()
        expect(chapter.title).toBe(source.chapters[i].title)
        expect(chapter.paragraphs).toEqual(expected)
      })
    })
  }
  it('keeps the three editions aligned paragraph for paragraph', () => {
    const [it_, en, da] = EDITIONS.map(edition => json(`../../public/data/editions/pinocchio-${edition}.json`) as Edition)
    en.chapters.forEach((chapter, i) => {
      expect(it_.chapters[i].paragraphs.length).toBe(chapter.paragraphs.length)
      expect(da.chapters[i].paragraphs.length).toBe(chapter.paragraphs.length)
    })
  })
})
