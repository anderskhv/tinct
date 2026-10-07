import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DICTATION_KEYTERM_LIMIT, buildDictationKeyterms, frequentProperNames } from './labDictationKeyterms'

describe('frequentProperNames', () => {
  it('keeps capitalised names inside sentences, most frequent first, and drops sentence openers and ordinary words', () => {
    const names = frequentProperNames([
      'Then Telemachus spoke. Telemachus answered Penelope, and Penelope wept.',
      'Behold, the House of Atreus fell. The house was old. Then Athena came to Telemachus.',
    ])
    expect(names.slice(0, 2)).toEqual(['Telemachus', 'Penelope'])
    expect(names).toContain('Athena')
    expect(names).toContain('Atreus')
    expect(names).not.toContain('Then')
    expect(names).not.toContain('Behold')
    // "house" also appears in lower case, so "House" is not a name.
    expect(names).not.toContain('House')
  })
})

describe('buildDictationKeyterms', () => {
  it('Bible: the open book first, then chapter names, then the books of the Bible; capped and deduplicated', () => {
    const edition = JSON.parse(readFileSync(new URL('../../public/data/editions/bible-webc-en.json', import.meta.url), 'utf8')) as { chapters: { number: number; title: string; paragraphs: string[] }[] }
    const ezra3 = edition.chapters.find(chapter => chapter.title === 'Ezra 3')!
    const terms = buildDictationKeyterms({
      bookId: 'bible',
      chapters: edition.chapters.map(({ number, title }) => ({ number, title })),
      paragraphs: ezra3.paragraphs,
      chapterTitle: 'Ezra 3',
    })
    expect(terms[0]).toBe('Ezra')
    expect(terms.slice(0, 30)).toEqual(expect.arrayContaining(['Zerubbabel', 'Jeshua', 'Jozadak']))
    expect(terms).toEqual(expect.arrayContaining(['Nehemiah', 'Tobit', '1 Maccabees']))
    expect(terms.length).toBeLessThanOrEqual(DICTATION_KEYTERM_LIMIT)
    expect(new Set(terms.map(term => term.toLowerCase())).size).toBe(terms.length)
    expect(terms.every(term => term.length <= 50)).toBe(true)
  })

  it('other books: cast names and proper nouns from chapter titles', () => {
    const terms = buildDictationKeyterms({
      bookId: 'odyssey',
      chapters: [{ number: 1, title: 'Athena Inspires the Prince' }, { number: 2, title: 'Telemachus Sets Sail' }],
      paragraphs: ['Sing to me of the man, Muse, the man of twists and turns. He sets sail for home.'],
      cast: [{ id: 'odysseus', name: 'Odysseus', epithet: '', introduction: '' }, { id: 'long', name: 'x'.repeat(60), epithet: '', introduction: '' }],
    })
    expect(terms).toEqual(expect.arrayContaining(['Muse', 'Odysseus', 'Athena', 'Inspires', 'Telemachus']))
    // Ordinary words in the open chapter ("sets", "sail") and over-long names are left out.
    expect(terms).not.toContain('Sets')
    expect(terms).not.toContain('Sail')
    expect(terms.some(term => term.length > 50)).toBe(false)
  })

  it('never exceeds the provider cap', () => {
    const chapters = Array.from({ length: 300 }, (_, index) => ({ number: index + 1, title: `Name${String.fromCharCode(97 + (index % 26))}${index} ${index + 1}` }))
    expect(buildDictationKeyterms({ bookId: 'bible', chapters, paragraphs: [] })).toHaveLength(DICTATION_KEYTERM_LIMIT)
  })
})
