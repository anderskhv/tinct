import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getBook } from './bookRegistry'
import { isOfferedDanishEdition } from './editionAvailability'

// Every Danish edition published in the Danish rollout (STRATEGY.md, Language
// scope, 2026-10-22) records the modern-en text it was translated from, in
// danishEditionSources/<bookId>.json. When modern-en changes, this test fails
// until the Danish text is brought up to date (translate the changed
// paragraphs, then record the new sourceSha256 and sha256) or the record is
// marked stale with a reason. A Danish edition is never silently left current.
interface DanishSource {
  bookId: string
  edition: string
  translatedFrom: string
  sourceSha256: string
  sha256: string
  package: string
  stale: string | null
}
const dir = resolve(__dirname, 'danishEditionSources')
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const edition = (bookId: string, key: string) => readFileSync(resolve(__dirname, `../../public/data/editions/${bookId}-${key}.json`))
const records: DanishSource[] = readdirSync(dir).filter(f => f.endsWith('.json')).sort()
  .map(f => JSON.parse(readFileSync(resolve(dir, f), 'utf8')) as DanishSource)

describe('Danish editions track the modern-en text they translate', () => {
  it('has records', () => expect(records.length).toBeGreaterThan(0))
  for (const record of records) {
    it(`${record.bookId}/${record.edition}`, () => {
      expect(record.edition).toBe('modern-da')
      expect(record.translatedFrom).toBe('modern-en')
      expect(getBook(record.bookId)?.editions.find(e => e.key === record.edition)).toMatchObject({ language: 'da', aligned: true, hasAudio: false })
      expect(isOfferedDanishEdition(record.bookId, record.edition)).toBe(true)
      const published = edition(record.bookId, record.edition)
      expect(sha256(published), 'published Danish text is the recorded one').toBe(record.sha256)
      const pkg = resolve(__dirname, '../../..', record.package)
      if (existsSync(pkg)) expect(readFileSync(pkg).equals(published), 'published copy equals the package file').toBe(true)
      const source = edition(record.bookId, record.translatedFrom)
      if (sha256(source) !== record.sourceSha256) {
        expect(record.stale, `${record.bookId}: modern-en changed since the Danish translation. Translate the changed paragraphs and update sourceSha256 and sha256, or set "stale" to a reason.`).toEqual(expect.any(String))
      }
      // Positions and highlights map by chapter and paragraph index, so the
      // structure must stay 1:1 with modern-en even when the text is stale.
      const da = JSON.parse(published.toString('utf8')), en = JSON.parse(source.toString('utf8'))
      expect(da.chapters.map((c: { number: number }) => c.number)).toEqual(en.chapters.map((c: { number: number }) => c.number))
      da.chapters.forEach((chapter: { paragraphs: string[] }, i: number) => {
        expect(chapter.paragraphs.length, `${record.bookId} chapter ${i + 1}`).toBe(en.chapters[i].paragraphs.length)
        chapter.paragraphs.forEach((paragraph, p) => {
          expect(paragraph.trim().length, `${record.bookId} ${i + 1}:${p}`).toBeGreaterThan(0)
          expect(paragraph.split('\n').length, `${record.bookId} ${i + 1}:${p} line breaks`).toBe(en.chapters[i].paragraphs[p].split('\n').length)
        })
      })
    })
  }
})
