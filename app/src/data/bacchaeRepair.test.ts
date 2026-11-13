import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { projectEditionCoordinate, type CoordinateMigration } from './editionCoordinateMigration'
import { CONTENT_RELEASES, writtenBeforeRelease } from './editionContentRevisions'
import { migrateLabBookPlace } from '../lab/labEditionMigration'
import { isAudioHeld } from './audioAvailability'
const path = (file: string) => resolve(__dirname, '../../public/data', file)
const read = (file: string) => JSON.parse(readFileSync(path(file), 'utf8'))
const bookId = 'bacchae'
const release = CONTENT_RELEASES[bookId]
const danish = release.editions['modern-da']
const english = release.editions['modern-en']
// Danish retranslation only (13 Nov 2026): the proposed English grammar edit was
// not a meaning repair, so Modern English stays on its 1 Oct 2026 text.
describe('Bacchae Danish retranslation preserves reader data', () => {
  it('leaves the Modern English text and its recording untouched', () => {
    const bytes = readFileSync(path('editions/bacchae-modern-en.json'))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(english.after)
    expect(english.releasedAt).toBeUndefined()
    expect(isAudioHeld(bookId, 'modern-en')).toBe(false)
  })
  for (const kind of ['positions', 'highlights']) {
    it(kind + ': carries the English 1 Oct 2026 map unchanged and maps the Danish text', () => {
      const map = read('edition-migrations/bacchae.' + kind + '.json') as CoordinateMigration
      expect(map.revision).toBe(release.revision)
      expect(map.editions['modern-en'].afterSha256).toBe(english.after)
      expect(map.editions['modern-da'].beforeSha256).toBe(danish.before)
      expect(map.editions['modern-da'].afterSha256).toBe(danish.after)
      const point = { chapterNumber: 5, paragraphIndex: 18, offset: 0, contentRevision: danish.before }
      expect(projectEditionCoordinate(map, 'modern-da', point, 'words').point.contentRevision).toBe(danish.after)
    })
  }
  it('moves old Danish places only, keeping English places written after 1 Oct 2026 in place', () => {
    const map = read('edition-migrations/bacchae.positions.json') as CoordinateMigration
    const writtenAt = danish.releasedAt! - 1
    expect(writtenBeforeRelease(bookId, 'modern-da', undefined, writtenAt)).toBe(true)
    expect(writtenBeforeRelease(bookId, 'modern-en', undefined, writtenAt)).toBe(false)
    expect(writtenBeforeRelease(bookId, 'modern-da', undefined, danish.releasedAt!)).toBe(false)
    const place = { bookId, headerBook: 'Bacchae', primaryEditionKey: 'modern-da', chapterNumber: 5, sequentialChapter: 5, paragraphIndex: 18, wordIndex: 0, updatedAt: writtenAt, deviceId: 'reader', rev: 5, pageIndex: 9 }
    const moved = migrateLabBookPlace(place, map)
    expect(moved.contentRecovery?.contentRevision).toBe(danish.before)
    expect(moved.contentRevision).toBe(danish.after)
    expect(moved.updatedAt).toBe(writtenAt)
    expect(moved.rev).toBe(5)
    expect(migrateLabBookPlace(moved, map)).toBe(moved)
  })
})
