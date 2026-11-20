import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { projectExactEditionRange, type CoordinateMigration } from './editionCoordinateMigration'
import { CONTENT_RELEASES, sourceContentRevision, writtenBeforeRelease } from './editionContentRevisions'
import { migrateLabBookPlace } from '../lab/labEditionMigration'
import { migrateLabHighlight, type MigratableHighlight } from '../lab/labHighlightMigration'
import { isAudioHeld } from './audioAvailability'

// Recovered Danish batch 04 (18 Nov 2026): recovered revisions for books whose Danish edition was already live.
// The English repairs #818 left out ship with their content releases; Confessions and Middlemarch also take the
// recovered Danish body. books/wip/danish-recovered-batch-04/INTEGRATION-2026-11-18.json records every decision.
const read = (path: string) => JSON.parse(readFileSync(resolve(__dirname, '../../public/data', path), 'utf8'))
type Edition = { chapters: { number: number; title?: string; paragraphs: string[] }[] }
const ENGLISH = ['a-little-princess', 'aristotle-politics', 'around-the-world-80-days', 'communist-manifesto', 'hume-enquiry', 'ivan-ilyich',
  'jungle-book', 'kant-groundwork', 'meditations', 'phaedrus', 'poetics', 'utilitarianism', 'werther', 'confessions', 'middlemarch']
const DANISH = ['communist-manifesto', 'phaedrus', 'confessions', 'middlemarch']
// The Danish release of #818 stays as it was: same text, same map, carried under the new revision.
const CARRIED = ENGLISH.filter(id => !DANISH.includes(id) && CONTENT_RELEASES[id].editions['modern-da'])
// English recordings already held as whole editions; every other book here has a recording to hold by chapter.
const HELD_WHOLE = ['around-the-world-80-days', 'ivan-ilyich', 'meditations', 'utilitarianism']

const changed = (bookId: string, editionKey: string): [string, string][] =>
  ENGLISH.includes(bookId) && (editionKey === 'modern-en' || DANISH.includes(bookId)) ? [[bookId, editionKey]] : []

describe('recovered Danish batch 04 keeps saved reading places and highlights', () => {
  for (const [bookId, editionKey] of ENGLISH.flatMap(id => [...changed(id, 'modern-en'), ...changed(id, 'modern-da')])) {
    const release = CONTENT_RELEASES[bookId]
    const edition = release.editions[editionKey]
    const writtenAt = edition.releasedAt! - 1

    it(`${bookId}/${editionKey}: moves an old place once, keeping its clocks`, () => {
      const map = read(`edition-migrations/${bookId}.positions.json`) as CoordinateMigration
      expect(map.revision).toBe(release.revision)
      expect(map.editions[editionKey]).toMatchObject({ beforeSha256: edition.before, afterSha256: edition.after })
      expect(writtenBeforeRelease(bookId, editionKey, undefined, writtenAt)).toBe(true)
      expect(writtenBeforeRelease(bookId, editionKey, undefined, edition.releasedAt!)).toBe(false)
      const key = Object.keys(map.editions[editionKey].entries)[0]
      const [chapter, paragraph] = key.split('.').map(Number)
      const place = { bookId, headerBook: bookId, primaryEditionKey: editionKey, chapterNumber: chapter, sequentialChapter: chapter, paragraphIndex: paragraph, wordIndex: 1, updatedAt: writtenAt, deviceId: 'reader', rev: 4, pageIndex: 3 }
      const moved = migrateLabBookPlace(place, map)
      expect(moved.contentRevision).toBe(edition.after)
      expect(moved.contentRecovery?.contentRevision).toBe(sourceContentRevision(bookId, editionKey, undefined, writtenAt) ?? edition.before)
      expect(moved.chapterNumber).toBe(chapter)
      expect(moved.paragraphIndex).toBe(paragraph)
      expect(moved.updatedAt).toBe(writtenAt)
      expect(moved.rev).toBe(4)
      expect(migrateLabBookPlace(moved, map)).toBe(moved)
    })

    it(`${bookId}/${editionKey}: carries a highlight on unchanged words exactly, with its note`, () => {
      const map = read(`edition-migrations/${bookId}.highlights.json`) as CoordinateMigration
      const text = read(`editions/${bookId}-${editionKey}.json`) as Edition
      const entries = map.editions[editionKey].entries
      const found = Object.entries(entries).find(([, entry]) => entry.words?.[0]?.[0] === 'equal' && entry.words[0][2] >= 2)
      expect(found, 'an unchanged opening').toBeTruthy()
      const [key, entry] = found!
      const [chapter, paragraph] = key.split('.').map(Number)
      const quote = entry.oldText!.split(/\s+/).filter(Boolean).slice(0, 2).join(' ')
      const paragraphs = text.chapters.find(c => c.number === chapter)!.paragraphs
      const point = { chapterNumber: chapter, paragraphIndex: paragraph, offset: 0, contentRevision: edition.before }
      expect(projectExactEditionRange(map, editionKey, point, { ...point, offset: 2 }, 'words')).not.toBeNull()
      const highlight: MigratableHighlight = { id: `hl-${writtenAt}-a`, bookId, editionKey, chapterNumber: chapter, paragraphIndex: paragraph, endParagraphIndex: paragraph, fromWord: 0, toWord: 2, color: 'gold', note: 'Keep this note', text: quote }
      const moved = migrateLabHighlight(highlight, map, paragraphs)
      expect(moved.contentMigrationStatus).toBe('exact')
      expect(moved.contentRevision).toBe(edition.after)
      expect(moved.note).toBe('Keep this note')
      expect(migrateLabHighlight(moved, map, paragraphs)).toBe(moved)
    })

    if (edition.previous?.length) {
      it(`${bookId}/${editionKey}: chains the earlier release to the new text`, () => {
        const older = edition.previous![0]
        for (const kind of ['positions', 'highlights']) {
          const map = read(`edition-migrations/${bookId}.${kind}.json`) as CoordinateMigration
          expect(map.editions[editionKey].previous?.[older.before]).toMatchObject({ beforeSha256: older.before, afterSha256: edition.after })
        }
        expect(sourceContentRevision(bookId, editionKey, undefined, older.releasedAt - 1)).toBe(older.before)
        expect(sourceContentRevision(bookId, editionKey, undefined, older.releasedAt)).toBe(edition.before)
        expect(sourceContentRevision(bookId, editionKey, undefined, edition.releasedAt!)).toBe(edition.after)
      })
    }
  }

  it.each(CARRIED)('%s: the live Danish and its 13 November map are unchanged under the new revision', bookId => {
    const release = CONTENT_RELEASES[bookId]
    const danish = release.editions['modern-da']
    expect(danish.releasedAt).toBe(Date.parse('2026-11-13T13:45:00Z'))
    for (const kind of ['positions', 'highlights']) {
      const map = read(`edition-migrations/${bookId}.${kind}.json`) as CoordinateMigration
      expect(map.revision).toBe(release.revision)
      expect(map.editions['modern-da']).toMatchObject({ beforeSha256: danish.before, afterSha256: danish.after })
    }
  })

  it('holds old English recordings in every chapter whose text changed, without hiding a book', () => {
    for (const bookId of ENGLISH.filter(id => !HELD_WHOLE.includes(id))) {
      const map = read(`edition-migrations/${bookId}.positions.json`) as CoordinateMigration
      const chapters = new Set(Object.values(map.editions['modern-en'].entries).map(entry => entry.chapter))
      expect(isAudioHeld(bookId, 'modern-en'), bookId).toBe(false)
      for (const chapter of chapters) expect(isAudioHeld(bookId, 'modern-en', chapter), `${bookId} ${chapter}`).toBe(true)
    }
    for (const bookId of HELD_WHOLE) expect(isAudioHeld(bookId, 'modern-en')).toBe(true)
  })

  it.each(ENGLISH)('%s: the published modern-en passes the similarity and truncation gate', bookId => {
    const output = execFileSync('python3', ['books/classify-modern-en.py', bookId, '--gate'], { cwd: resolve(__dirname, '../../..'), encoding: 'utf8' })
    expect(output).toContain('GATE PASS')
  }, 120000)
})

describe('recovered Danish batch 04 leaves main where main is newer', () => {
  it('keeps Middlemarch\'s four Danish epigraphs whose lines mirror the English', () => {
    const da = read('editions/middlemarch-modern-da.json') as Edition
    const en = read('editions/middlemarch-modern-en.json') as Edition
    for (const chapter of [27, 39, 76, 87]) {
      const danish = da.chapters.find(c => c.number === chapter)!.paragraphs[0]
      const english = en.chapters.find(c => c.number === chapter)!.paragraphs[0]
      expect(danish.split('\n').length, `${chapter}`).toBe(english.split('\n').length)
      expect(danish.split('\n').length, `${chapter}`).toBeGreaterThan(1)
    }
  })

  it('keeps the English #817 decided on for Medea, The Bacchae and The Prince', () => {
    expect(read('editions/medea-modern-en.json').chapters[0].paragraphs[4]).toBe('NURSE. Stopped! Her suffering has barely started; its middle is still far away!')
    expect(read('editions/bacchae-modern-en.json').chapters[4].paragraphs[18]).toBe('Dionysus. Whatever he chose it to be. That was no decision of mine.')
    expect(read('onboarding/medea.json').era).toBe('431 BCE')
    expect(read('onboarding/bacchae.da.json').era).toBe('405 f.Kr.')
  })
})
