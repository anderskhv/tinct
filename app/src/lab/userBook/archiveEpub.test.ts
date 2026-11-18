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

  it('reads a contents without numerals, and titles in capitals as it names them (North of Boston)', () => {
    const verse = 'Something there is that does not love a wall, that sends the frozen ground swell under it, and spills the upper boulders in the sun.'
    const pages = [
      'NORTH OF BOSTON BY ROBERT FROST',
      'CONTENTS PAGE MENDING WALL . . . 11 THE MOUNTAIN . . . 14 BLUEBERRIES . . . 17 THE FEAR . . . 20',
      `Mending Wall takes up the theme where an earlier poem laid it down. ${verse}`,
      `MENDING WALL SOMETHING there is that doesn't love a wall. ${verse}`,
      `${verse} And makes gaps even two can pass abreast.`,
      `THE MOUNTAIN THE mountain held the town as in a shadow. ${verse}`,
      `${verse} It was a long way off.`,
      `BLUEBERRIES " You ought to have seen what I saw on my way. ${verse}`,
      `THE FEAR A LANTERN light from deeper in the barn. ${verse}`,
    ]
    const book = archiveChapters(pages)
    expect(book.chapters.map(c => c.title)).toEqual(['Mending Wall', 'The Mountain', 'Blueberries', 'The Fear'])
    // A note naming the poem in its text starts nothing; the text's first word in capitals stays the text's.
    expect(book.chapters[1].paragraphs[0]).toMatch(/^THE mountain held/)
  })

  it("starts a chapter where its own running head first stands, under the book's (The Souls of Black Folk)", () => {
    const pages = [
      `THE SOULS OF BLACK FOLK OF OUR SPIRITUAL STRIVINGS O water, voice of my heart, crying in the sand. which ${PROSE}`,
      `2 THE SOULS OF BLACK FOLK which ${PROSE}`,
      `OF OUR SPIRITUAL STRIVINGS 3 which ${PROSE}`,
      `4 THE SOULS OF BLACK FOLK which ${PROSE}`,
      `OF OUR SPIRITUAL STRIVINGS 5 which ${PROSE}`,
      `6 THE SOULS OF BLACK FOLK which ${PROSE}`,
      `OF OUR SPIRITUAL STRIVINGS 7 which ${PROSE} The end of it.`,
      `II OF THE DAWN OF FREEDOM Careless seems the great Avenger. which ${PROSE}`,
      `8 THE SOULS OF BLACK FOLK which ${PROSE}`,
      `OF THE DAWN OF FREEDOM 9 which ${PROSE}`,
      `10 THE SOULS OF BLACK FOLK which ${PROSE}`,
      `OF THE DAWN OF FREEDOM 11 which ${PROSE}`,
      `12 THE SOULS OF BLACK FOLK which ${PROSE}`,
      `OF THE DAWN OF FREEDOM 13 which ${PROSE}`,
    ]
    const titles = archiveChapters(pages).chapters.map(c => c.title)
    expect(titles).toEqual(['Of Our Spiritual Strivings', 'Chapter II. Of the Dawn of Freedom'])
    // A book converted under rules 10 converts as it did.
    expect(archiveChapters(pages, 10).chapters.map(c => c.title)).not.toContain('Of Our Spiritual Strivings')
  })

  it("starts a play's acts where they name themselves (The Importance of Being Earnest)", () => {
    const pages = [`FIRST ACT SCENE Morning-room in Algernon's flat. ${PROSE}`, `${PROSE} Lane is arranging tea.`, `SECOND ACT SCENE Garden at the Manor House. ${PROSE}`]
    expect(archiveChapters(pages).chapters.map(c => c.title)).toEqual(['First Act', 'Second Act'])
  })
})
