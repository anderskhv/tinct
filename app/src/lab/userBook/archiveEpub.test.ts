/** An Internet Archive scan's EPUB (hocr-to-epub) rebuilt from its pages (archiveEpub.ts, EPUB rules 10). */
import { describe, expect, it } from 'vitest'
import { archiveChapters, isArchiveEpub } from './archiveEpub'

const PROSE = 'the Mole had been working very hard all the morning, spring-cleaning his little home, first with brooms and then with dusters, and he was tired.'

describe('Archive EPUBs', () => {
  it('knows one by its page documents and its notice', () => {
    const pages = Array.from({ length: 10 }, (_, i) => `EPUB/page_${i + 1}.html`)
    expect(isArchiveEpub('<package/>', pages, '<p>Created with hocr-to-epub (v.1.0.0)</p>')).toBe(true)
    expect(isArchiveEpub('<package/>', ['text/ch1.xhtml', 'text/ch2.xhtml', 'text/ch3.xhtml'], null)).toBe(false)
  })

  it('takes out banners, running heads and page numbers, runs the pages together and starts chapters as printed', () => {
    const pages = [
      'THE WIND IN THE WILLOWS BY KENNETH GRAHAME',
      'The text on this page is estimated to be only 16.00% accurate CONTENTS CHAPTER PAGE I. THE RIVER BANK 1 II. THE OPEN ROAD 27',
      `I THE RIVER BANK THE Mole had been working very hard. ${PROSE} He said "Hang spring-cleaning!" and bolted out of the`,
      `THE WIND IN THE WILLOWS house without even waiting to put on his coat. ${PROSE} "Bother!" 4`,
      `THE RIVER BANK "Hullo, Rat!" ${PROSE} The Rat said nothing. 5`,
      `THE WIND IN THE WILLOWS ${PROSE} He sat on the bank. 6`,
      `II THE OPEN ROAD RATTY," said the Mole suddenly, "if you please, I want to ask you a favour." ${PROSE}`,
      `THE WIND IN THE WILLOWS ${PROSE} It was evening. 8`,
      `THE OPEN ROAD ${PROSE} They slept. 9`,
    ]
    const book = archiveChapters(pages)
    expect(book.title).toBe('The Wind in the Willows')
    expect(book.author).toBe('Kenneth Grahame')
    expect(book.chapters.map(c => c.title)).toEqual(['Chapter I. The River Bank', 'Chapter II. The Open Road'])
    const text = book.chapters.map(c => c.paragraphs.join(' ')).join(' ')
    expect(text).not.toMatch(/accurate|WIND IN THE WILLOWS|\b[456]\b|\b[89]\b$/)
    // A sentence running over a page runs on; a speech after a sentence starts a paragraph.
    expect(text).toContain('bolted out of the house without even waiting')
    expect(book.chapters[0].paragraphs.some(p => p.startsWith('"Hullo, Rat!"'))).toBe(true)
  })
})
