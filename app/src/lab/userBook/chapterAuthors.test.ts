import { describe, expect, it } from 'vitest'
import { healChapterAuthors } from './chapterAuthors'
import { USER_EDITION_CONVERTER, USER_EDITION_FORMAT, usableUserEdition, type UserBookChapter, type UserBookEdition } from './userEdition'

/** A reader's own book as an earlier conversion stored it: no `bylines`, no `author`, no `collection`. */
const stored = (author: string, chapters: UserBookChapter[]): UserBookEdition => ({
  format: USER_EDITION_FORMAT, converter: USER_EDITION_CONVERTER, title: 'Bold Conjectures', author, language: 'en', droppedImages: 0, chapters,
})

/** What a reading place depends on: every chapter's number, title and text, in order. */
const structure = (edition: UserBookEdition) => edition.chapters.map(chapter => [chapter.number, chapter.title, chapter.paragraphs, chapter.kinds ?? null])

describe('healing bylines into a stored own book', () => {
  it('adds chapter writers to an older conversion without converting it again, keeping its Contents chapter and every number', () => {
    const before = stored('Sam Kuypers', [
      // The older conversion kept the book's printed contents as a chapter; it stays.
      { number: 1, title: 'Contents', paragraphs: ['The Beginning of Infinity 3', 'On Conjecture 41'] },
      { number: 2, title: 'The Beginning of Infinity', paragraphs: ['by David Deutsch', 'Progress that is both rapid and sustained has only ever happened once.'] },
      { number: 3, title: 'On Conjecture', paragraphs: ['A Talk About Knowledge', 'An interview with Brett Hall', 'We sat down to talk.'], kinds: ['subtitle', null, null] },
      { number: 4, title: 'Afterword', paragraphs: ['Edited by Sam Kuypers', 'Thanks to everyone.'] },
    ])
    const snapshot = JSON.parse(JSON.stringify(before))
    const healed = healChapterAuthors(before)
    expect(structure(healed)).toEqual(structure(before))
    expect(healed.chapters.map(chapter => chapter.author)).toEqual([undefined, 'David Deutsch', 'Brett Hall', undefined])
    expect(healed.collection).toBe(true)
    // Still the same conversion: nothing is converted again, and the stored record is not changed.
    expect(healed.converter).toBe(before.converter)
    expect(usableUserEdition(healed)).toBe(true)
    expect(before).toEqual(snapshot)
  })

  it('leaves a single-author book exactly as stored', () => {
    const book = stored('Lucius Annaeus Seneca', [
      { number: 1, title: 'On Providence', paragraphs: ['By L. Annaeus Seneca', 'You have asked me, Lucilius.'] },
      { number: 2, title: 'To Marcia', paragraphs: ['Ann Lee', 'If I did not know, Marcia.'], kinds: ['byline', null] },
    ])
    expect(healChapterAuthors(book)).toBe(book)
  })

  it('reads a byline only at the chapter opening, and never re-reads a conversion that read bylines itself', () => {
    const late = stored('Sam Kuypers', [
      { number: 1, title: 'One', paragraphs: ['It began quietly.', 'by David Deutsch'] },
      { number: 2, title: 'Two', paragraphs: ['Body.'] },
    ])
    expect(healChapterAuthors(late)).toBe(late)
    const fresh = { ...stored('Sam Kuypers', [{ number: 1, title: 'One', paragraphs: ['by David Deutsch', 'Body.'] }]), bylines: true as const }
    expect(healChapterAuthors(fresh)).toBe(fresh)
  })

  it('names a stored byline once several chapters set different names that way', () => {
    const anthology = stored('Jo Smith', [
      { number: 1, title: 'The Fate of Lamps', paragraphs: ['Sam Writer', 'Modern lamps.'], kinds: ['byline', null] },
      { number: 2, title: 'The Night Garden', paragraphs: ['Ann Lee', 'The night garden.'], kinds: ['byline', null] },
    ])
    expect(healChapterAuthors(anthology).chapters.map(chapter => chapter.author)).toEqual(['Sam Writer', 'Ann Lee'])
  })
})
