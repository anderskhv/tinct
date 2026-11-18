import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { normalizeChapterTitle, normalizeTitleList, romanValue } from '../../public/lab/chapter-title.js'
import { dropPrintedContents } from '../../public/lab/printed-contents.js'
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
    expect(n('Chap. iv.')).toBe('Chapter 4.')
    expect(n('Chapter I')).toBe('Chapter 1')
    expect(n('Book I: Miss Brooke — Chapter II')).toBe('Book 1: Miss Brooke — Chapter 2')
    expect(n('Chapter 1. In which Phileas Fogg and Passepartout Accept each Other')).toBe('Chapter 1. In which Phileas Fogg and Passepartout Accept each Other')
    expect(n('PART ONE--The Old Buccaneer')).toBe('Part 1--The Old Buccaneer')
  })

  it('keeps the punctuation of a title already in mixed case: only number labels and ALL CAPS stretches change', () => {
    // Middlemarch keeps its colon and its one em dash.
    expect(n('Book I: Miss Brooke — Chapter I')).toBe('Book 1: Miss Brooke — Chapter 1')
    expect(n('Book VIII: Sunset And Sunrise — Chapter LXXII')).toBe('Book 8: Sunset And Sunrise — Chapter 72')
    // The Brothers Karamazov keeps its own full stop.
    expect(n('I. Fyodor Pavlovitch Karamazov')).toBe('1. Fyodor Pavlovitch Karamazov')
    expect(n('XI. There Was No Money. There Was No Robbery')).toBe('11. There Was No Money. There Was No Robbery')
    expect(n('V. So Be It! So Be It!')).toBe('5. So Be It! So Be It!')
    // Hume: the capitals are cased, the colon and full stop stay.
    expect(n('Section 4: SCEPTICAL DOUBTS CONCERNING THE OPERATIONS OF THE UNDERSTANDING. — Part 1')).toBe('Section 4: Sceptical Doubts Concerning the Operations of the Understanding. — Part 1')
    expect(n('Fitt XXXIV — Beowulf Seeks the Dragon — Beowulf\'s Reminiscences')).toBe('Fitt 34 — Beowulf Seeks the Dragon — Beowulf\'s Reminiscences')
    expect(n('Chapter 2. Of Imagination')).toBe('Chapter 2. Of Imagination')
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
    expect(n('II. He Gets Rid Of His Eldest Son')).toBe('2. He Gets Rid Of His Eldest Son')
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
    expect(n('Kapitel 1. Om sansningen', 'da')).toBe('Kapitel 1. Om sansningen')
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

  it('never gives a mixed-case built-in title a second em dash or takes away its colon', () => {
    const dir = join(process.cwd(), 'public/data/editions')
    const count = (text: string, mark: string) => text.split(mark).length - 1
    let mixed = 0
    for (const file of readdirSync(dir).filter(name => /-(original|modern)-[a-z]{2}\.json$/.test(name))) {
      let data: { chapters?: Array<{ title?: string }> }
      try { data = JSON.parse(readFileSync(join(dir, file), 'utf8')) } catch { continue }
      const language = file.match(/-([a-z]{2})\.json$/)![1]
      for (const chapter of data.chapters ?? []) {
        if (typeof chapter.title !== 'string' || !/\p{Ll}/u.test(chapter.title)) continue
        mixed++
        const shown = n(chapter.title, language)
        expect(count(shown, '—'), `${file}: ${chapter.title}`).toBe(count(chapter.title, '—'))
        expect(count(shown, ':'), `${file}: ${chapter.title}`).toBe(count(chapter.title, ':'))
      }
    }
    expect(mixed).toBeGreaterThan(10000)
    // Reads every published edition file (~5 s locally, and it grows with each book):
    // the default 5 s limit timed out on a busy CI runner (deploy of #422, 14 Oct).
  }, 60_000)

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

  it('names the chapter on screen as the Contents does when the book’s titles are read together', () => {
    const chapters = senecaChapters().map(chapter => ({ number: chapter.number, title: chapter.title }))
    const sixth = chapters.find(chapter => chapter.title.startsWith('THE SIXTH BOOK'))!
    const source = {
      bookTitle: 'Minor Dialogues', bookAuthor: 'Seneca', editionLabel: 'Original',
      chapterLabel: sixth.title, chapterTitle: sixth.title, chapterNumber: sixth.number, headerBook: 'Minor Dialogues', headerChapter: sixth.title,
      paragraphs: ['I. Did I not know, Marcia, …'], compareParagraphs: [], followParagraphs: [], cast: [], chapters,
    } satisfies LabSource
    const shown = houseStyleSource(source, 'en')
    expect(shown).toMatchObject({ chapterLabel: 'Of Consolation, to Marcia', chapterTitle: 'Of Consolation, to Marcia', headerChapter: 'Of Consolation, to Marcia', chapterNumber: sixth.number })
    expect(shown.chapters.find(chapter => chapter.number === sixth.number)?.title).toBe('Of Consolation, to Marcia')
  })
})

// Real Project Gutenberg books as the converter reads them (src/__fixtures__/gutenberg-contents-titles.json).
interface FixtureChapter { number: number; title: string; paragraphs: string[] }
const fixture = JSON.parse(readFileSync(join(process.cwd(), 'src/__fixtures__/gutenberg-contents-titles.json'), 'utf8')) as { books: Record<string, { chapters: FixtureChapter[] }> }
const fixtureTitles = (name: string) => dropPrintedContents(fixture.books[name].chapters).map(chapter => chapter.title)
function senecaChapters() { return dropPrintedContents(fixture.books['seneca-minor-dialogues'].chapters) }
const list = (titles: string[], language = 'en') => normalizeTitleList(titles, { language })

describe('a book’s titles read together', () => {
  it('sets Seneca’s Minor Dialogues (Gutenberg 64576) as its own contents names them', () => {
    expect(list(fixtureTitles('seneca-minor-dialogues'))).toEqual([
      'Minor Dialogues Together With the Dialogue on Clemency',
      'Preface',
      'Of Providence',
      'On the Firmness of the Wise Man',
      'Of Anger, Book 1',
      'Of Anger, Book 2',
      'Of Anger, Book 3',
      'Of Consolation, to Marcia',
      'Of a Happy Life',
      'Of Leisure',
      'Of Peace of Mind',
      'Of the Shortness of Life',
      'Of Consolation, to Helvia',
      'Of Consolation, to Polybius',
      'On Clemency, Book 1',
      'On Clemency, Book 2',
      'Index',
    ])
  })

  it('heals a copy already added with the titles one at a time', () => {
    // As the Worker published them before titles were read together.
    expect(list([
      'Preface',
      'The First Book of the Dialogues of L. Annaeus Seneca, Addressed to Lucilius. “Why, When a Providence Exists, Any Misfortunes Befall Good Men;” or, “of Providence”',
      'The Second Book of the Dialogues of L. Annaeus Seneca, Addressed to Serenus. “That the Wise Man Can Neither Receive Injury nor Insult,” or, an Essay on the Firmness of the Wise Man',
      'THE THIRD BOOK OF THE DIALOGUES OF L. ANNAEUS SENECA, ADDRESSED TO NOVATUS. OF ANGER. Book 1.',
      'The Sixth Book of the Dialogues of L. Annaeus Seneca, Addressed to Marcia. of Consolation',
      'The Tenth Book of the Dialogues of L. Annaeus Seneca, Addressed to Paulinus.[1] of the Shortness of Life',
      'The Eleventh Book of the Dialogues of L. Annaeus Seneca, Addressed to His Mother, Helvia. of Consolation',
    ])).toEqual(['Preface', 'Of Providence', 'On the Firmness of the Wise Man', 'Of Anger, Book 1', 'Of Consolation, to Marcia', 'Of the Shortness of Life', 'Of Consolation, to Helvia'])
  })

  it('cases ALL CAPS one title at a time: runs inside mixed case, a new sentence, a quoted title', () => {
    expect(n('THE THIRD BOOK OF THE DIALOGUES OF L. ANNAEUS SENECA, ADDRESSED TO NOVATUS. OF ANGER. Book I.'))
      .toBe('The Third Book of the Dialogues of L. Annaeus Seneca, Addressed to Novatus. Of Anger. Book 1.')
    expect(n('THE SIXTH BOOK OF THE DIALOGUES OF L. ANNAEUS SENECA, ADDRESSED TO MARCIA. OF CONSOLATION.'))
      .toBe('The Sixth Book of the Dialogues of L. Annaeus Seneca, Addressed to Marcia. Of Consolation')
    expect(n('“WHY, WHEN A PROVIDENCE EXISTS, ANY MISFORTUNES BEFALL GOOD MEN;” OR, “OF PROVIDENCE”')).toBe('“Why, When a Providence Exists, Any Misfortunes Befall Good Men;” or, “Of Providence”')
    // Montaigne (Gutenberg 3600): a run of capitals is cased, a single capitalised name stays.
    expect(n('XIV.——To the KING, HENRY IV.')).toBe('14.——To the King, Henry IV.')
    expect(n('VIII.——To Monsieur DUPUY,')).toBe('8.——To Monsieur DUPUY')
    expect(n('of Providence')).toBe('Of Providence')
    expect(n('eBook notes')).toBe('eBook notes')
  })

  it('drops the printed page’s marks: footnote calls and page numbers run into a heading (Cicero, Gutenberg 14988)', () => {
    expect(list(fixtureTitles('cicero-tusculan-disputations')).slice(0, 4)).toEqual(['Cicero’s Tusculan Disputations', 'Note', 'Introduction', 'On the Contempt of Death'])
    expect(n('359INTRODUCTION TO THE FIRST BOOK,')).toBe('Introduction to the First Book')
    expect(n('3Note')).toBe('Note')
    expect(n('Section 6: OF PROBABILITY[9].')).toBe('Section 6: Of Probability.')
    expect(n('1 Kings 3')).toBe('1 Kings 3')
    expect(n('1984')).toBe('1984')
  })

  it('prefers the short alternative of a quoted title', () => {
    expect(list(['“That the Wise Man Can Neither Receive Injury nor Insult,” or, an Essay on the Firmness of the Wise Man'])).toEqual(['On the Firmness of the Wise Man'])
    expect(list(['Twelfth Night; or, What You Will'])).toEqual(['Twelfth Night; or, What You Will'])
  })

  it('leaves clean titles alone: Dickens, Montaigne’s chapters, Cicero, the Bible, Shakespeare, Hume', () => {
    const oliver = fixtureTitles('oliver-twist')
    expect(list(oliver)).toEqual(oliver.map(title => n(title)))
    expect(list(oliver)[0]).toBe('Chapter 1 — Treats of the Place Where Oliver Twist Was Born and of the Circumstances Attending His Birth')
    expect(list(fixtureTitles('tale-of-two-cities')).slice(0, 2)).toEqual(['Chapter 1. The Period', 'Chapter 2. The Mail'])
    expect(list(fixtureTitles('montaigne-essays')).slice(-2)).toEqual(['Chapter 4 — That the Soul Expends Its Passions Upon False Objects, Where the True Are Wanting', 'Chapter 5 — Whether the Governor of a Place Besieged Ought Himself to Go Out to Parley'])
    expect(list(fixtureTitles('cicero-friendship-old-age'))).toEqual(['Introductory Note', 'On Friendship', 'On Old Age'])
    const plays = ['Act 1, Scene 1 — Rome. A street', 'Act 1, Scene 2 — Rome. A public place', 'Act 2, Scene 1 — Rome. A street', 'Act 2, Scene 2 — Rome. The Capitol']
    expect(list(plays)).toEqual(plays)
    const hume = ['Section 4: Sceptical Doubts Concerning the Operations of the Understanding. — Part 1', 'Section 4: Sceptical Doubts Concerning the Operations of the Understanding. — Part 2', 'Section 5: Sceptical Solution of These Doubts. — Part 1']
    expect(list(hume)).toEqual(hume)
  })

  it('never leaves a title empty, and is stable', () => {
    const titles = fixtureTitles('seneca-minor-dialogues')
    const once = list(titles)
    expect(once.every(title => title.trim().length > 0)).toBe(true)
    expect(list(once)).toEqual(once)
    // Parts that cannot be told apart keep their full titles.
    const alike = [
      'The First Book of the Dialogues of L. Annaeus Seneca, Addressed to Serenus. Of Leisure',
      'The First Book of the Dialogues of L. Annaeus Seneca, Addressed to Serenus. Of Leisure',
      'The Third Book of the Dialogues of L. Annaeus Seneca, Addressed to Novatus. Of Anger',
    ]
    expect(list(alike)).toEqual([alike[0], alike[1], 'Of Anger'])
    expect(list(['', 'Preface'])).toEqual(['', 'Preface'])
  })

  it('changes no built-in edition’s titles when they are read together', () => {
    const dir = join(process.cwd(), 'public/data/editions')
    let checked = 0
    for (const file of readdirSync(dir).filter(name => /-(original|modern)-[a-z]{2}\.json$/.test(name))) {
      let data: { chapters?: Array<{ title?: string }> }
      try { data = JSON.parse(readFileSync(join(dir, file), 'utf8')) } catch { continue }
      if (!Array.isArray(data.chapters)) continue
      const language = file.match(/-([a-z]{2})\.json$/)![1]
      const titles = data.chapters.map(chapter => chapter.title).filter((title): title is string => typeof title === 'string')
      checked += titles.length
      expect(list(titles, language), file).toEqual(titles.map(title => n(title, language)))
    }
    expect(checked).toBeGreaterThan(10000)
  }, 60_000)
})
