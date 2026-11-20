import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { leadingPreface } from './labEditionSwitch'
import { paragraphKind, paragraphKindClass, paragraphSetRagged, registerArgument, registerParagraphKinds } from './labParagraphStyle'

const edition = (name: string) => JSON.parse(readFileSync(resolve(__dirname, `../../public/data/editions/${name}.json`), 'utf8')) as { chapters: Array<{ number: number; paragraphs: string[] }> }

describe("a verse edition's argument", () => {
  it("is found at the head of every book of Pope's Odyssey by the chapter's shape, Book 6 included", () => {
    const pope = edition('odyssey-verse-en')
    expect(pope.chapters).toHaveLength(24)
    for (const chapter of pope.chapters) {
      expect(leadingPreface(chapter.paragraphs), `book ${chapter.number}`).toBe(1)
      // Prose (Books 3, 4 and 7 hold one line break; none is a verse line), and never the word "argument" itself:
      // the label is the reader's.
      expect(chapter.paragraphs[0].split('\n').some(line => line.length > 100), `book ${chapter.number}`).toBe(true)
      expect(/^\s*(the\s+)?argument\b/i.test(chapter.paragraphs[0]), `book ${chapter.number}`).toBe(false)
    }
  })

  it('is not found in the prose editions', () => {
    for (const name of ['odyssey-original-en', 'odyssey-modern-en']) {
      for (const chapter of edition(name).chapters) expect(leadingPreface(chapter.paragraphs), `${name} ${chapter.number}`).toBe(0)
    }
  })

  it('is set apart as its own kind, justified like prose, without touching the text', () => {
    const text = 'The argument of a book that no other test registers, long enough to wrap over a line or two of the page.'
    expect(paragraphKind(text)).toBeNull()
    registerArgument(text)
    expect(paragraphKind(text)).toBe('argument')
    expect(paragraphKindClass(text)).toBe(' is-kind-argument')
    // Carried over a page: no second label (lab.css `:not(.is-kind-resumed)::before`).
    expect(paragraphKindClass(text, 12)).toBe(' is-kind-argument is-kind-resumed')
    expect(paragraphSetRagged(text)).toBe(false)
  })

  it("never replaces a kind the book's own chapter records", () => {
    const text = 'A heading the edition itself records for this test only'
    registerParagraphKinds([text], ['heading'])
    registerArgument(text)
    expect(paragraphKind(text)).toBe('heading')
  })
})
