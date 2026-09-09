import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { getBookPreface } from './bookPrefaces'
import { getBook } from './bookRegistry'
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
  it('does not publish unapproved drafts or guess book IDs', () => {
    for (const id of ['democracy-in-america', 'the-bible', 'the-odyssey', 'unknown']) expect(getBookPreface(id)).toBeUndefined()
  })
})
