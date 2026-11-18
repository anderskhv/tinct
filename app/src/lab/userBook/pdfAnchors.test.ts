import { describe, expect, it } from 'vitest'
import { pageOfTextPlace, textPlaceOfPage } from './pdfAnchors'
import type { UserBookChapter } from './userEdition'

const words = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${i}`).join(' ')

/*
 * Page 3: chapter 1's first two paragraphs and 10 words of the third.
 * Page 4: the third's other 30 words, then a fourth paragraph.
 * Page 5: a figure, no text. Page 6: chapter 2, with a note from page 6's foot.
 */
const chapters: UserBookChapter[] = [
  { number: 1, title: 'One', paragraphs: [words('a', 20), words('b', 20), words('c', 40), words('d', 20)], pages: [3, 3, 3, 4], pageBreaks: [[2, 10, 4]] },
  { number: 2, title: 'Two', paragraphs: [words('e', 50), 'Notes', words('n', 10)], pages: [6, 6, 6], notes: 1, kinds: [null, 'heading', null] },
]

describe('PDF places: Tinct text and Original pages', () => {
  it('finds the page a place is on, and how far down its words', () => {
    expect(pageOfTextPlace(chapters, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 })).toEqual({ page: 3, frac: 0 })
    expect(pageOfTextPlace(chapters, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 5 })).toEqual({ page: 3, frac: 0.5 })
    // Across the page break: word 10 of the third paragraph is the first on page 4.
    expect(pageOfTextPlace(chapters, { chapterNumber: 1, paragraphIndex: 2, wordIndex: 9 })).toEqual({ page: 3, frac: 0.98 })
    expect(pageOfTextPlace(chapters, { chapterNumber: 1, paragraphIndex: 2, wordIndex: 10 })).toEqual({ page: 4, frac: 0 })
    expect(pageOfTextPlace(chapters, { chapterNumber: 1, paragraphIndex: 3, wordIndex: 0 })).toEqual({ page: 4, frac: 0.6 })
    // A note stands at the page it was printed on; it does not count among that page's words.
    expect(pageOfTextPlace(chapters, { chapterNumber: 2, paragraphIndex: 2, wordIndex: 0 })).toEqual({ page: 6, frac: 0 })
    expect(pageOfTextPlace(chapters, { chapterNumber: 9, paragraphIndex: 0, wordIndex: 0 })).toBeNull()
    expect(pageOfTextPlace([{ number: 1, paragraphs: ['x'] }], { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 })).toBeNull()
  })

  it('finds the text at a page: its first words, the paragraph running on from the page before first', () => {
    expect(textPlaceOfPage(chapters, 3)).toEqual({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 })
    expect(textPlaceOfPage(chapters, 4)).toEqual({ chapterNumber: 1, paragraphIndex: 2, wordIndex: 10 })
    expect(textPlaceOfPage(chapters, 4, 0.6)).toEqual({ chapterNumber: 1, paragraphIndex: 3, wordIndex: 0 })
    expect(textPlaceOfPage(chapters, 6, 0.5)).toEqual({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 25 })
    expect(textPlaceOfPage(chapters, 6, 1)).toEqual({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 49 })
  })

  it('gives a page without text of its own the text before it, and a page before any text the first word', () => {
    expect(textPlaceOfPage(chapters, 5)).toEqual({ chapterNumber: 1, paragraphIndex: 3, wordIndex: 0 })
    expect(textPlaceOfPage(chapters, 1)).toEqual({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 })
    expect(textPlaceOfPage(chapters, 99)).toEqual({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 })
  })

  it('goes there and back to the same word', () => {
    for (const chapter of chapters) {
      chapter.paragraphs.forEach((text, paragraphIndex) => {
        if (chapter.notes !== undefined && paragraphIndex >= chapter.notes) return
        const count = text.split(' ').length
        for (let wordIndex = 0; wordIndex < count; wordIndex++) {
          const place = { chapterNumber: chapter.number, paragraphIndex, wordIndex }
          const page = pageOfTextPlace(chapters, place)!
          expect(textPlaceOfPage(chapters, page.page, page.frac)).toEqual(place)
        }
      })
    }
  })
})
