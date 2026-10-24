import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import sources from './danishEditionSources.json'
import { getBook } from './bookRegistry'
import { OFFERED_DANISH_EDITIONS, editionHold } from './editionAvailability'
import { hasRecordedAudio, TEXT_ONLY_EDITIONS } from './audioAvailability'
import { isEditionWithheld, migrateWithheldEdition } from './withheldEditions'
import { defaultPrimaryEditionKey, defaultCompareEditionKey } from './editionDefaults'
import { selectableLabEditions } from '../lab/labPrefs'
import { createReaderHandoffIntent } from '../preReader/catalogue'
import { CHAPTER_SHARDED_EDITION_IDS } from './editionShardRegistry'

const root = resolve(__dirname, '../../..')
const bytes = (file: string) => readFileSync(resolve(root, file))
const sha = (data: Buffer) => createHash('sha256').update(data).digest('hex')
type Chapter = { number: number; title: string; paragraphs: string[] }

describe('Danish integration source and reader contract, 2026-10-24', () => {
  for (const [id, evidence] of Object.entries(sources)) {
    it(`${id}: publishes exact reviewed bytes against the pinned current English`, () => {
      const published = bytes(`app/public/data/editions/${id}-modern-da.json`)
      const english = bytes(`app/public/data/editions/${id}-modern-en.json`)
      expect(sha(published)).toBe(evidence.danishSha256)
      expect(published.equals(bytes(evidence.package))).toBe(true)
      // Any subsequent English edit requires Danish reconciliation, rather than
      // leaving an apparently aligned translation against an unreviewed source.
      expect(sha(english), 'Danish source changed; reconcile or withdraw this edition').toBe(evidence.modernEnglishSha256)
      const da = JSON.parse(published.toString()), en = JSON.parse(english.toString())
      expect(da.chapters.map((c: Chapter) => [c.number, c.paragraphs.length])).toEqual(en.chapters.map((c: Chapter) => [c.number, c.paragraphs.length]))
      const manifest = (CHAPTER_SHARDED_EDITION_IDS as readonly string[]).includes(id + '-modern-da')
        ? JSON.parse(bytes(`app/public/data/editions-chapters/${id}-modern-da/manifest.json`).toString()) : null
      if (manifest) expect(manifest.chapters.map((c: { number: number; paragraphCount: number }) => [c.number, c.paragraphCount])).toEqual(da.chapters.map((c: Chapter) => [c.number, c.paragraphs.length]))
      da.chapters.forEach((ch: Chapter, index: number) => {
        if (manifest) {
          const shard = JSON.parse(bytes(`app/public/data/editions-chapters/${id}-modern-da/${manifest.chapters[index].path}`).toString())
          expect(shard.paragraphs).toEqual(ch.paragraphs)
        }
        ch.paragraphs.forEach((p, i) => {
          const source = en.chapters[index].paragraphs[i]
          expect(p.trim().length, `${ch.number}:${i} empty`).toBeGreaterThan(0)
          expect(p, `${ch.number}:${i} placeholder or typography`).not.toMatch(/\[(?:TBD|TODO|untranslated)\]|["“”]|--/i)
          expect(p.split('\n').length).toBe(source.split('\n').length)
          expect(p.split('_').length).toBe(source.split('_').length)
          expect(p.match(/\[\d+\]/g) || []).toEqual(source.match(/\[\d+\]/g) || [])
        })
      })
    })

    it(`${id}: is selectable Danish text, preserves saved identity, and keeps English defaults`, () => {
      const book = getBook(id)!
      const edition = book.editions.find(e => e.key === 'modern-da')!
      expect(edition).toMatchObject({ language: 'da', aligned: true, hasAudio: false })
      expect(OFFERED_DANISH_EDITIONS.has(id + '/modern-da')).toBe(true)
      expect(editionHold(id, 'modern-da')).toBeUndefined()
      expect(isEditionWithheld(id, 'modern-da')).toBe(false)
      expect(migrateWithheldEdition(id, 'modern-da')).toBe('modern-da')
      expect(selectableLabEditions(id, book.editions)).toContain(edition)
      expect(TEXT_ONLY_EDITIONS.has(id + '/modern-da')).toBe(true)
      expect(hasRecordedAudio(id, 'modern-da')).toBe(false)
      expect(defaultPrimaryEditionKey(id, book.editions)).toBe('modern-en')
      expect(defaultCompareEditionKey(id, book.editions, 'modern-en', book.year)).not.toBe('modern-da')
      const savedPlace = { bookId: id, chapterNumber: 1, paragraphIndex: 3, wordIndex: 2, page: 1 }
      expect(createReaderHandoffIntent({ bookId: id, primaryEditionKey: 'modern-da', savedPlace })).toMatchObject({ primaryEditionKey: 'modern-da', savedPlace })
    })
  }
})
