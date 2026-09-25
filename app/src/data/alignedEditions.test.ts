import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BOOKS } from './bookRegistry'

/**
 * Outside the Bible, Compare pairs editions paragraph by paragraph, so two
 * editions both marked aligned must split every chapter the same way. A
 * mismatch pairs the wrong text side by side (Faust's German verse against
 * the English prose did until 2026-09-25): mark such an edition unaligned.
 */
const counts = (bookId: string, key: string): number[] | null => {
  const path = resolve(__dirname, '../../public/data/editions', `${bookId}-${key}.json`)
  if (!existsSync(path)) return null
  const edition = JSON.parse(readFileSync(path, 'utf8')) as { chapters: Array<{ paragraphs: string[] }> }
  return edition.chapters.map(chapter => chapter.paragraphs.length)
}

describe('editions marked aligned', () => {
  it('split every chapter into the same number of paragraphs', { timeout: 120_000 }, () => {
    const mismatches: string[] = []
    for (const book of BOOKS) {
      if (book.id === 'bible') continue
      const aligned = book.editions.filter(edition => edition.aligned === true)
        .map(edition => ({ key: edition.key, counts: counts(book.id, edition.key) }))
        .filter((edition): edition is { key: string; counts: number[] } => edition.counts !== null)
      for (const other of aligned.slice(1)) {
        const base = aligned[0]
        if (JSON.stringify(base.counts) !== JSON.stringify(other.counts)) mismatches.push(`${book.id}: ${base.key} vs ${other.key}`)
      }
    }
    expect(mismatches).toEqual([])
  })
})
