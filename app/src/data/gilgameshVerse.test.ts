import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { getBook } from './bookRegistry'
import { CONTENT_RELEASES } from './editionContentRevisions'
import { setsNewlineVerse, type EditionData } from '../types'
import { registerNewlineVerseLines, resetVerseLines, verseLineStarts } from '../lab/labVerseLines'
import { verifyCharacters, type CharacterAsset } from '../services/characters/characterCards'

const raw = (path: string) => readFileSync(resolve(__dirname, '../../public/data', path), 'utf8')
const edition = (key: string) => JSON.parse(raw(`editions/gilgamesh-${key}.json`)) as EditionData
const original = edition('original-en')

// Thompson's 1928 hexameters keep their printed lines (18 Nov 2026); the paragraph slots,
// their words and every reader coordinate stay as integrated.
describe('Gilgamesh (Thompson 1928) verse lines', () => {
  afterEach(() => resetVerseLines())

  it('is set as verse in the reader while it stays the book original', () => {
    const editions = getBook('gilgamesh')!.editions
    const thompson = editions.find(item => item.key === 'original-en')!
    expect(thompson.style).toBe('original')
    expect(setsNewlineVerse(thompson)).toBe(true)
    expect(editions.filter(item => item.key !== 'original-en').some(setsNewlineVerse)).toBe(false)
  })

  it('keeps 158 paragraphs in the same slots as both modern editions', () => {
    const counts = (data: EditionData) => data.chapters.map(chapter => [chapter.number, chapter.paragraphs.length])
    expect(original.chapters.reduce((sum, chapter) => sum + chapter.paragraphs.length, 0)).toBe(158)
    expect(counts(original)).toEqual(counts(edition('modern-en')))
    expect(counts(original)).toEqual(counts(edition('modern-da')))
  })

  it('lineates every verse paragraph, and every line fits the reader verse limit', () => {
    let lineated = 0
    for (const chapter of original.chapters) {
      registerNewlineVerseLines(chapter.paragraphs)
      for (const text of chapter.paragraphs) {
        expect(text).not.toMatch(/ \n|\n | {2}|^\n|\n$/)
        if (!text.includes('\n')) continue
        // A line over 100 characters would make the whole paragraph flow as prose (labVerseLines MAX_VERSE_LINE).
        expect(text.split('\n').every(line => line.length <= 100)).toBe(true)
        expect(verseLineStarts(text)?.size).toBe(text.split('\n').length - 1)
        lineated += 1
      }
    }
    // Every paragraph but Thompson's four prose notes and two one-line paragraphs.
    expect(lineated).toBe(152)
  })

  it('modern editions stay prose', () => {
    for (const key of ['modern-en', 'modern-da']) {
      expect(edition(key).chapters.some(chapter => chapter.paragraphs.some(text => text.includes('\n')))).toBe(false)
    }
  })

  it('the release, the migration maps and the character cards name the served bytes', () => {
    const sha = createHash('sha256').update(raw('editions/gilgamesh-original-en.json')).digest('hex')
    expect(CONTENT_RELEASES.gilgamesh.editions['original-en'].after).toBe(sha)
    for (const kind of ['positions', 'highlights']) {
      expect(JSON.parse(raw(`edition-migrations/gilgamesh.${kind}.json`)).editions['original-en'].afterSha256).toBe(sha)
    }
    expect(JSON.parse(raw('characters/gilgamesh.v1.json')).editions['original-en'].sourceSha256).toBe(sha)
  })

  it('every character card still verifies against the lineated text', async () => {
    const asset = JSON.parse(raw('characters/gilgamesh.v1.json')) as CharacterAsset
    for (const key of ['original-en', 'modern-en']) {
      const bytes = Uint8Array.from(readFileSync(resolve(__dirname, `../../public/data/editions/gilgamesh-${key}.json`))).buffer
      const verified = await verifyCharacters(asset, 'gilgamesh', key, bytes)
      expect(verified, key).not.toBeNull()
      expect(verified!.edition.mentions.length).toBeGreaterThan(0)
    }
  })
})
