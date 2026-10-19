import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The Danish texts of these books are re-reviewed in their content packages
// (books/wip/<book>/editions). The published copy must be the package copy byte
// for byte, so a reviewed package merged without copying its file fails here.
// Refresh: cp books/wip/<book>/editions/<book>-modern-da.json app/public/data/editions/
const BOOKS = ['grimms-fairy-tales', 'arabian-nights']
const read = (path: string) => readFileSync(resolve(__dirname, path))

describe('Danish editions published from their content packages', () => {
  for (const book of BOOKS) {
    it(`${book}: app modern-da equals the package file and aligns 1:1 with Modern English`, () => {
      const published = read(`../../public/data/editions/${book}-modern-da.json`)
      expect(published.equals(read(`../../../books/wip/${book}/editions/${book}-modern-da.json`))).toBe(true)
      const da = JSON.parse(published.toString('utf8')), en = JSON.parse(read(`../../public/data/editions/${book}-modern-en.json`).toString('utf8'))
      expect(da.chapters.map((c: { number: number }) => c.number)).toEqual(en.chapters.map((c: { number: number }) => c.number))
      da.chapters.forEach((chapter: { paragraphs: string[] }, i: number) => {
        expect(chapter.paragraphs.length).toBe(en.chapters[i].paragraphs.length)
        chapter.paragraphs.forEach((paragraph, p) => {
          expect(paragraph.trim().length, `${book} ${i + 1}:${p}`).toBeGreaterThan(0)
          expect(paragraph.split('\n').length, `${book} ${i + 1}:${p} line breaks`).toBe(en.chapters[i].paragraphs[p].split('\n').length)
        })
      })
    })
  }
})
