import { describe, expect, it } from 'vitest'
import { furtherPlaceHere, furtherPlaceLabel, furtherPlaceTarget } from './labFurtherPlace'
import type { LabBookPlace } from './labPosition'

const place = (over: Partial<LabBookPlace>): LabBookPlace => ({
  bookId: 'master-and-margarita', headerBook: 'The Master and Margarita', chapterNumber: 5, sequentialChapter: 5,
  paragraphIndex: 55, wordIndex: 3, primaryEditionKey: 'modern-da', updatedAt: 1000, deviceId: 'phone', rev: 9, ...over,
})
const libraryOf = (item: LabBookPlace) => ['luke', 'john'].includes(item.bookId) ? 'bible' : item.bookId
const phoneAt5 = place({})
const pcAt4 = place({ chapterNumber: 4, sequentialChapter: 4, paragraphIndex: 1, wordIndex: 11, deviceId: 'pc', updatedAt: 2000, rev: 10 })

describe('the place this device had read to, when another device moved the book back', () => {
  // 17 Nov 2026: the phone was in chapter 5, a PC opened chapter 4, the phone came back in chapter 4.
  it('is offered when another device saved an earlier chapter of the same book', () => {
    expect(furtherPlaceHere(phoneAt5, pcAt4, 'phone', libraryOf)).toEqual({ place: phoneAt5, libraryBookId: 'master-and-margarita', fromChapter: 4 })
  })

  it('is not offered for a move forward, or inside the same chapter', () => {
    expect(furtherPlaceHere(pcAt4, place({ deviceId: 'tablet' }), 'pc', libraryOf)).toBeNull()
    expect(furtherPlaceHere(phoneAt5, place({ paragraphIndex: 2, deviceId: 'pc' }), 'phone', libraryOf)).toBeNull()
  })

  it('is not offered when this device made the earlier place itself, or never read the later one itself', () => {
    expect(furtherPlaceHere(phoneAt5, { ...pcAt4, deviceId: 'phone' }, 'phone', libraryOf)).toBeNull()
    // The later place was only ever another device's (this one adopted it): nothing of this device's is behind it.
    expect(furtherPlaceHere({ ...phoneAt5, deviceId: 'tablet' }, pcAt4, 'phone', libraryOf)).toBeNull()
  })

  it('is not offered across books, with nothing to compare, or without a device id', () => {
    expect(furtherPlaceHere(phoneAt5, place({ bookId: 'crito', headerBook: 'Crito', chapterNumber: 1, sequentialChapter: 1, deviceId: 'pc' }), 'phone', libraryOf)).toBeNull()
    expect(furtherPlaceHere(null, pcAt4, 'phone', libraryOf)).toBeNull()
    expect(furtherPlaceHere(phoneAt5, null, 'phone', libraryOf)).toBeNull()
    expect(furtherPlaceHere(phoneAt5, pcAt4, '', libraryOf)).toBeNull()
  })

  it('compares the Bible across its books by the chapter sequence', () => {
    const john3 = place({ bookId: 'john', headerBook: 'John', chapterNumber: 3, sequentialChapter: 1000, primaryEditionKey: 'bsb-en' })
    const luke13 = place({ bookId: 'luke', headerBook: 'Luke', chapterNumber: 13, sequentialChapter: 986, primaryEditionKey: 'bsb-en', deviceId: 'pc' })
    const further = furtherPlaceHere(john3, luke13, 'phone', libraryOf)
    expect(further).toMatchObject({ libraryBookId: 'bible', fromChapter: 986 })
    expect(furtherPlaceLabel(further!)).toBe('Continue from John 3')
  })
})

describe('the button\'s words', () => {
  const further = furtherPlaceHere(phoneAt5, pcAt4, 'phone', libraryOf)!
  it('names the chapter by number', () => {
    expect(furtherPlaceLabel(further)).toBe('Continue from chapter 5')
    expect(furtherPlaceLabel(further, '5. Det skete i Gribojedov')).toBe('Continue from chapter 5')
    expect(furtherPlaceLabel(further, 'Chapter 5')).toBe('Continue from chapter 5')
  })
  // Frankenstein opens with four letters: its eleventh section is "Chapter 7".
  it('uses the book\'s own number, not the section\'s place in the file', () => {
    const eleventh = { ...further, place: { ...further.place, chapterNumber: 11, sequentialChapter: 11 } }
    expect(furtherPlaceLabel(eleventh, 'Chapter 7')).toBe('Continue from chapter 7')
    expect(furtherPlaceLabel(eleventh, 'Kapitel 7')).toBe('Continue from chapter 7')
    expect(furtherPlaceLabel(eleventh, 'Chapter XII — The storm')).toBe('Continue from chapter XII')
  })
  it('names a book, part, letter or scene as the work does', () => {
    expect(furtherPlaceLabel(further, 'Book 8 — The games of the Phaeacians')).toBe('Continue from Book 8')
    expect(furtherPlaceLabel(further, 'Letter 4')).toBe('Continue from Letter 4')
    expect(furtherPlaceLabel(further, 'Act 2, Scene 3')).toBe('Continue from Act 2, Scene 3')
  })
  it('uses a short title without a number as it stands, and the section number for a long one', () => {
    expect(furtherPlaceLabel(further, 'Preface')).toBe('Continue from Preface')
    expect(furtherPlaceLabel(further, 'In which the reader is introduced to a man of humanity')).toBe('Continue from chapter 5')
  })
})

describe('where the button lands', () => {
  const further = furtherPlaceHere(phoneAt5, pcAt4, 'phone', libraryOf)!
  const aligned = (key: string) => key !== 'verse-en'
  it('is the saved word in the edition it was saved in', () => {
    expect(furtherPlaceTarget(further, 'modern-da', aligned)).toEqual({ chapterNumber: 5, paragraphIndex: 55, wordIndex: 3 })
  })
  it('is the saved paragraph, first word, in another edition that lines up with it', () => {
    expect(furtherPlaceTarget(further, 'modern-en', aligned)).toEqual({ chapterNumber: 5, paragraphIndex: 55, wordIndex: 0 })
  })
  it('is the head of the chapter in an edition that does not line up', () => {
    expect(furtherPlaceTarget(further, 'verse-en', aligned)).toEqual({ chapterNumber: 5, paragraphIndex: 0, wordIndex: 0 })
  })
})
