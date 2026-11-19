import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CHAPTER_SHARDED_EDITION_IDS } from './editionShardRegistry'

/**
 * A chapter-sharded edition is read from its shards (editionLoader's window)
 * and, by the character check, offline download and Android, from its
 * whole-book file. Both must carry the same text: a repair applied to one and
 * not the other shows readers different words depending on the path.
 * After changing an edition file, re-split it:
 *   node scripts/split-edition-chapters.cjs --write-registry <bookId-editionKey>
 */
const DATA = resolve(__dirname, '../../public/data')

/**
 * Editions whose shards already differed from the whole file when this check
 * was added (14 Oct 2026). Which side is right is a content decision, so they
 * are listed rather than re-split; remove an entry once it is reconciled.
 */
const KNOWN_DRIFT = new Set([
  'brothers-karamazov-modern-da',
  'democracy-in-america-modern-da',
  'don-quixote-modern-da',
  'essays-montaigne-modern-da',
  'essays-montaigne-modern-en',
  'federalist-papers-modern-da',
  'peloponnesian-war-modern-da',
  'wealth-of-nations-modern-en',
])

interface WholeChapter { number: number; title?: string; section?: string; paragraphs: string[]; kinds?: unknown; links?: unknown; figures?: unknown }

function differences(id: string): string[] {
  const dir = join(DATA, 'editions-chapters', id)
  const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) as { chapters: Array<{ number: number; title: string; section?: string; path: string; paragraphCount?: number; wordCount?: number }> }
  const whole = JSON.parse(readFileSync(join(DATA, 'editions', `${id}.json`), 'utf8')) as { chapters: WholeChapter[] }
  const found: string[] = []
  if (manifest.chapters.length !== whole.chapters.length) found.push(`chapter count ${manifest.chapters.length} vs ${whole.chapters.length}`)
  whole.chapters.forEach((chapter, index) => {
    const entry = manifest.chapters[index]
    if (!entry) return
    const shard = JSON.parse(readFileSync(join(dir, entry.path), 'utf8')) as WholeChapter
    if (entry.number !== chapter.number) found.push(`chapter ${index}: number`)
    if (entry.title !== (chapter.title || `Chapter ${chapter.number}`)) found.push(`chapter ${chapter.number}: title`)
    if ((entry.section ?? null) !== (chapter.section ?? null)) found.push(`chapter ${chapter.number}: section`)
    if (entry.paragraphCount !== undefined && entry.paragraphCount !== chapter.paragraphs.length) found.push(`chapter ${chapter.number}: paragraph count`)
    // Counted as labSource counts a loaded chapter, so the book estimate is the same either way.
    if (entry.wordCount !== undefined && entry.wordCount !== chapter.paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length) found.push(`chapter ${chapter.number}: word count`)
    if (JSON.stringify(shard.paragraphs) !== JSON.stringify(chapter.paragraphs)) found.push(`chapter ${chapter.number}: paragraphs`)
    for (const key of ['kinds', 'links', 'figures'] as const) {
      if (JSON.stringify(shard[key] ?? null) !== JSON.stringify(chapter[key] ?? null)) found.push(`chapter ${chapter.number}: ${key}`)
    }
  })
  return found
}

describe('chapter shards', () => {
  it('registers exactly the editions that have shards', () => {
    const dirs = readdirSync(join(DATA, 'editions-chapters'), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
    expect([...CHAPTER_SHARDED_EDITION_IDS].sort()).toEqual(dirs)
  })

  it.each(CHAPTER_SHARDED_EDITION_IDS.filter(id => !KNOWN_DRIFT.has(id)))('%s: shards carry exactly the whole-book text', id => {
    expect(differences(id)).toEqual([])
  })

  it('lists as known drift only editions that still differ', () => {
    for (const id of KNOWN_DRIFT) {
      expect(CHAPTER_SHARDED_EDITION_IDS as readonly string[]).toContain(id)
      expect(differences(id).length, id).toBeGreaterThan(0)
    }
  })
})
