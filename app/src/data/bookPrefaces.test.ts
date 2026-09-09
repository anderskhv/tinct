import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { getBookPreface } from './bookPrefaces'
import { BOOKS, getBook } from './bookRegistry'
describe('reviewed prefaces', () => {
  for (const [id, source] of [['odyssey', 'the-odyssey'], ['the-awakening', 'the-awakening'], ['niels-lyhne', 'niels-lyhne'], ['war-and-peace', 'war-and-peace'], ['symposium', 'symposium'], ['bible', 'the-bible']]) {
    it(`preserves the exact approved ${id} prose under its canonical ID`, () => {
      expect(getBook(id)?.id).toBe(id)
      const preface = getBookPreface(id)!
      expect(preface.language).toBe('en')
      const approved = readFileSync(new URL(`../../../docs/design/approved-prefaces/${source}.md`, import.meta.url), 'utf8').trim()
      expect(preface.paragraphs.join('\n\n')).toBe(approved)
      expect(approved.startsWith(preface.preview)).toBe(true)
    })
  }
  it('publishes exactly the frozen library batch with verbatim source hashes', () => {
    const manifest = JSON.parse(readFileSync(new URL('../../../docs/design/library-prefaces/manifest.json', import.meta.url), 'utf8'))
    expect(manifest.entries.map((e: { bookId: string }) => e.bookId).sort()).toEqual(BOOKS.map(b => b.id).sort())
    for (const entry of manifest.entries) {
      const raw = readFileSync(new URL(`./prefaces/${entry.bookId}.txt`, import.meta.url), 'utf8')
      expect(createHash('sha256').update(raw).digest('hex')).toBe(entry.sha256)
      expect(getBookPreface(entry.bookId)?.paragraphs.join('\n\n')).toBe(raw.trim())
    }
  })
  it('does not guess noncanonical book IDs', () => {
    for (const id of ['the-bible', 'the-odyssey', 'unknown']) expect(getBookPreface(id)).toBeUndefined()
  })
})
