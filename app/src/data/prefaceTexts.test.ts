import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { BOOKS, getBook } from './bookRegistry'

// The library's book introduction is served from these reviewed texts
// (vite.config.ts emits them as /lab/prefaces/<bookId>.json).
const prefaceText = (bookId: string) => {
  const url = new URL(`./prefaces/${bookId}.txt`, import.meta.url)
  return existsSync(url) ? readFileSync(url, 'utf8') : undefined
}

describe('reviewed prefaces', () => {
  for (const [id, source] of [['odyssey', 'the-odyssey'], ['the-awakening', 'the-awakening'], ['niels-lyhne', 'niels-lyhne'], ['war-and-peace', 'war-and-peace'], ['symposium', 'symposium'], ['bible', 'the-bible']]) {
    it(`preserves the exact approved ${id} prose under its canonical ID`, () => {
      expect(getBook(id)?.id).toBe(id)
      const approved = readFileSync(new URL(`../../../docs/design/approved-prefaces/${source}.md`, import.meta.url), 'utf8').trim()
      expect(prefaceText(id)?.trim().split(/\n\s*\n/).join('\n\n')).toBe(approved)
    })
  }
  it('publishes exactly the frozen library batch with verbatim source hashes', () => {
    const manifest = JSON.parse(readFileSync(new URL('../../../docs/design/library-prefaces/manifest.json', import.meta.url), 'utf8'))
    expect(manifest.entries.map((e: { bookId: string }) => e.bookId).sort()).toEqual(BOOKS.map(b => b.id).sort())
    for (const entry of manifest.entries) {
      const raw = prefaceText(entry.bookId)!
      expect(createHash('sha256').update(raw).digest('hex')).toBe(entry.sha256)
    }
  })
  it('does not guess noncanonical book IDs', () => {
    for (const id of ['the-bible', 'the-odyssey', 'unknown']) expect(prefaceText(id)).toBeUndefined()
  })
})
