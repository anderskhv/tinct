import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { normalizeChapterTitle, romanValue } from '../../public/lab/chapter-title.js'
import { houseStyleSections, houseStyleSource } from './labChapterTitles'
import type { LabSource } from './labSource'

const n = (title: string, language?: string) => normalizeChapterTitle(title, { language })

describe('normalizeChapterTitle: never ALL CAPS, never Roman numerals', () => {
  it('sets Les Misérables as imported in house style', () => {
    expect(n('PREFACE')).toBe('Preface')
    expect(n('CHAPTER I—M. MYRIEL')).toBe('Chapter 1 — M. Myriel')
    expect(n('CHAPTER V—MONSEIGNEUR BIENVENU MADE HIS CASSOCKS LAST TOO LONG')).toBe('Chapter 5 — Monseigneur Bienvenu Made His Cassocks Last Too Long')
    expect(n('BOOK FIRST.—A JUST MAN')).toBe('Book 1 — A Just Man')
    expect(n('VOLUME I—FANTINE')).toBe('Volume 1 — Fantine')
    expect(n('CHAPTER XII. THE VISIT OF THE BISHOP')).toBe('Chapter 12 — The Visit of the Bishop')
  })

  it('turns label numerals into Arabic numbers, with one separator', () => {
    expect(n('CHAPTER XLII.')).toBe('Chapter 42')
    expect(n('LETTER IV')).toBe('Letter 4')
    expect(n('ACT III. SCENE II.')).toBe('Act 3, Scene 2')
    expect(n('PART I, CHAPTER III')).toBe('Part 1, Chapter 3')
    expect(n('CANTO XXXIV')).toBe('Canto 34')
    expect(n('SECTION IX: OF THE REASON OF ANIMALS.')).toBe('Section 9 — Of the Reason of Animals')
    expect(n('Chapter i')).toBe('Chapter 1')
    expect(n('Chap. iv.')).toBe('Chapter 4')
    expect(n('Chapter I')).toBe('Chapter 1')
    expect(n('Book I: Miss Brooke — Chapter II')).toBe('Book 1 — Miss Brooke — Chapter 2')
    expect(n('Chapter 1. In which Phileas Fogg and Passepartout Accept each Other')).toBe('Chapter 1 — In which Phileas Fogg and Passepartout Accept each Other')
    expect(n('PART ONE--The Old Buccaneer')).toBe('Part 1 — The Old Buccaneer')
  })

  it('turns ordinal and number words into numbers ("Book 1", never "Book One")', () => {
    expect(n('PART SECOND')).toBe('Part 2')
    expect(n('BOOK TWENTY-FIRST')).toBe('Book 21')
    expect(n('CHAPTER THE FIRST')).toBe('Chapter 1')
    expect(n('Book One (1805) — Chapter 1')).toBe('Book 1 (1805) — Chapter 1')
    expect(n('BOOK THE LAST')).toBe('Book the Last')
  })

  it('numbers a bare leading numeral', () => {
    expect(n('I. THE OLD MAN')).toBe('1 — The Old Man')
    expect(n('II. He Gets Rid Of His Eldest Son')).toBe('2 — He Gets Rid Of His Eldest Son')
    expect(n('XLII')).toBe('42')
  })

  it('never converts numerals that are not labels, or words that look like numerals', () => {
    expect(n('Henry V')).toBe('Henry V')
    expect(n('HENRY V')).toBe('Henry V')
    expect(n("Louis XIV's court")).toBe("Louis XIV's court")
    expect(n("LOUIS XIV'S COURT")).toBe("Louis XIV's Court")
    expect(n('The Letter I Never Sent')).toBe('The Letter I Never Sent')
    expect(n('I SAW HER AGAIN')).toBe('I Saw Her Again')
    expect(n('THE MIX')).toBe('The Mix')
    expect(n('CIVIL WAR')).toBe('Civil War')
    expect(n('C. S. LEWIS')).toBe('C. S. Lewis')
    expect(n('4. maj 1771', 'da')).toBe('4. maj 1771')
  })

  it('keeps initials, honorifics, accents and contractions in title case', () => {
    expect(n('SEARCH FOR MR. HYDE')).toBe('Search for Mr. Hyde')
    expect(n('ST. PETERSBURG')).toBe('St. Petersburg')
    expect(n('MME. DE STAËL')).toBe('Mme. De Staël')
    expect(n('DOWN THE RABBIT-HOLE')).toBe('Down the Rabbit-Hole')
    expect(n("O'BRIEN'S RETURN")).toBe("O'Brien's Return")
    expect(n("I'LL GO TO THE CITY")).toBe("I'll Go to the City")
    expect(n('A ROOM IN CLEOPATRA’S PALACE')).toBe('A Room in Cleopatra’s Palace')
    expect(n('THE ATTACK BY STRATAGEM')).toBe('The Attack by Stratagem')
    // Small words stay lower case except first and after a dash or colon.
    expect(n('CHAPTER III—THE CHAPTER OF THE FALL')).toBe('Chapter 3 — The Chapter of the Fall')
    expect(n('PROLOGUE: OF ARMS AND THE MAN')).toBe('Prologue: Of Arms and the Man')
  })

  it('uses gentle casing outside English: sentence case, initials and names after them kept', () => {
    expect(n('CHAPITRE I — M. MYRIEL', 'fr')).toBe('Chapitre 1 — M. Myriel')
    expect(n('LIVRE PREMIER — UN JUSTE', 'fr')).toBe('Livre premier — Un juste')
    expect(n('Kapitel 1. Om sansningen', 'da')).toBe('Kapitel 1 — Om sansningen')
    expect(n('Fitt I — Scyldes liv og død', 'da')).toBe('Fitt 1 — Scyldes liv og død')
  })

  it('leaves Bible and Shakespeare titles as they read', () => {
    for (const title of ['Psalms 19', '1 Kings 3', '2 Corinthians 5', 'Song of Solomon 2', 'Genesis 1', 'Act 1, Scene 1 — Alexandria. A Room in Cleopatra’s Palace', 'Act 5, Scene 2 — The same', 'Prologue', 'Inferno, Canto 1']) {
      expect(n(title)).toBe(title)
    }
    const manifest = JSON.parse(readFileSync(join(process.cwd(), 'public/data/editions-chapters/bible-kjv-en/manifest.json'), 'utf8')) as { chapters: Array<{ title: string }> }
    expect(manifest.chapters.length).toBeGreaterThan(1000)
    for (const chapter of manifest.chapters) expect(n(chapter.title)).toBe(chapter.title)
  })

  it('is stable: house style in, the same out', () => {
    for (const title of ['CHAPTER I—M. MYRIEL', 'ACT III. SCENE II.', 'I. THE OLD MAN', 'Book I: Miss Brooke — Chapter II', 'SEARCH FOR MR. HYDE']) {
      expect(n(n(title))).toBe(n(title))
    }
    expect(n('')).toBe('')
  })

  it('reads Roman numerals strictly', () => {
    expect(romanValue('XLII')).toBe(42)
    expect(romanValue('xiv')).toBe(14)
    expect(romanValue('IIII')).toBeNull()
    expect(romanValue('CIVIL')).toBeNull()
    expect(romanValue('Xiv')).toBeNull()
  })

  it('leaves no built-in edition title in ALL CAPS or with a Roman label number', () => {
    const dir = join(process.cwd(), 'public/data/editions')
    const label = /\b(Chapter|Book|Part|Volume|Act|Scene|Canto|Letter|Section|Fitt|Tablet)\s+[IVXLC]+\b/
    let checked = 0
    for (const file of readdirSync(dir).filter(name => /-(original|modern)-en\.json$/.test(name))) {
      let data: { chapters?: Array<{ title?: string }> }
      try { data = JSON.parse(readFileSync(join(dir, file), 'utf8')) } catch { continue }
      for (const chapter of data.chapters ?? []) {
        if (typeof chapter.title !== 'string') continue
        const shown = n(chapter.title)
        checked++
        expect(shown, `${file}: ${chapter.title}`).not.toMatch(label)
        for (const part of shown.split(/\s*[—–:]\s*/)) {
          const letters = part.replace(/[^\p{L}]/gu, '')
          if (letters.length >= 4) expect(/\p{Ll}/u.test(part), `${file}: ${chapter.title}`).toBe(true)
        }
      }
    }
    expect(checked).toBeGreaterThan(5000)
  })
})

describe('houseStyleSource', () => {
  it('sets the chapter on screen, the Contents and its sections in house style without touching chapter identity', () => {
    const source = {
      bookTitle: 'Les Misérables', bookAuthor: 'Victor Hugo', editionLabel: 'Original',
      chapterLabel: 'CHAPTER I—M. MYRIEL', chapterTitle: 'CHAPTER I—M. MYRIEL', chapterNumber: 2,
      headerBook: 'Les Misérables', headerChapter: 'CHAPTER I—M. MYRIEL',
      paragraphs: ['In 1815, M. Charles-François-Bienvenu Myriel was Bishop of D——.'], compareParagraphs: [], followParagraphs: [], cast: [],
      chapters: [{ number: 1, title: 'PREFACE' }, { number: 2, title: 'CHAPTER I—M. MYRIEL', wordCount: 12 }],
      sections: [{ title: 'VOLUME I—FANTINE', sections: [{ title: 'BOOK FIRST—A JUST MAN', chapters: [2] }] }],
    } satisfies LabSource
    const shown = houseStyleSource(source, 'en')
    expect(shown).toMatchObject({ chapterLabel: 'Chapter 1 — M. Myriel', chapterTitle: 'Chapter 1 — M. Myriel', headerChapter: 'Chapter 1 — M. Myriel', chapterNumber: 2, paragraphs: source.paragraphs })
    expect(shown.chapters).toEqual([{ number: 1, title: 'Preface' }, { number: 2, title: 'Chapter 1 — M. Myriel', wordCount: 12 }])
    expect(shown.sections).toEqual([{ title: 'Volume 1 — Fantine', sections: [{ title: 'Book 1 — A Just Man', chapters: [2] }] }])
    expect(houseStyleSections(undefined)).toBeUndefined()
  })
})
