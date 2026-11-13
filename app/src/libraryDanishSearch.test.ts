import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain browser module of the library page
import { createLibrarySearch, danishSpellings, foldDanish, librarySearch, tinctWork } from '../public/lab/library_2/library-search.js'

// Library search in Danish (Anders, 2026-11-13: "'Den lille prinsesse' actually works"): Danish
// titles and author names rank like English ones; æ/ae, ø/o/oe and å/a/aa are the same letters.
type Book = { id: string; title: string; author: string; altTitles?: string[]; localTitles?: { da: string[] }; localAuthors?: { da: string[] } }
const books: Book[] = [
  { id: 'a-little-princess', title: 'A Little Princess', author: 'Frances Hodgson Burnett', localTitles: { da: ['Den lille prinsesse'] } },
  { id: 'crime-and-punishment', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', localTitles: { da: ['Forbrydelse og straf'] }, localAuthors: { da: ['Fjodor Dostojevskij'] } },
  { id: 'brothers-karamazov', title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', localTitles: { da: ['Brødrene Karamasov'] }, localAuthors: { da: ['Fjodor Dostojevskij'] } },
  { id: 'odyssey', title: 'The Odyssey', author: 'Homer', localTitles: { da: ['Odysseen'] } },
  { id: 'bible', title: 'The Bible', author: 'Various', localTitles: { da: ['Bibelen'] } },
  { id: 'the-prince', title: 'The Prince', author: 'Niccolò Machiavelli', localTitles: { da: ['Fyrsten'] } },
  { id: 'the-art-of-war', title: 'The Art of War', author: 'Sun Tzu', localTitles: { da: ['Krigskunsten', 'Kunsten at føre krig'] } },
  { id: 'the-manual', title: 'The Manual', author: 'Epictetus', localTitles: { da: ['Håndbogen'] }, localAuthors: { da: ['Epiktet'] } },
  { id: 'the-aeneid', title: 'The Aeneid', author: 'Virgil', localTitles: { da: ['Æneiden'] }, localAuthors: { da: ['Vergil'] } },
  { id: 'wuthering-heights', title: 'Wuthering Heights', author: 'Emily Brontë', localTitles: { da: ['Stormfulde højder'] } },
  { id: 'fear-and-trembling', title: 'Fear and Trembling', author: 'Søren Kierkegaard', localTitles: { da: ['Frygt og Bæven'] } },
  { id: 'antigone', title: 'Antigone', author: 'Sophocles', localAuthors: { da: ['Sofokles'] } },
  { id: 'apology', title: 'Apology', author: 'Plato', localTitles: { da: ['Sokrates’ forsvarstale', 'Sokrates forsvarstale'] }, localAuthors: { da: ['Platon'] } },
  { id: 'hamlet', title: 'Hamlet', author: 'William Shakespeare' },
]

describe('Danish folding', () => {
  it('folds case, accents and the Danish letters as typed on any keyboard', () => {
    expect(foldDanish('Kunsten at føre krig')).toBe('kunsten at fore krig')
    expect(foldDanish('Kunsten at foere krig')).toBe('kunsten at fore krig')
    for (const typed of ['Håndbogen', 'Haandbogen', 'Handbogen', 'HÅNDBOGEN']) expect(foldDanish(typed)).toBe('handbogen')
    expect(foldDanish('æble')).toBe(foldDanish('aeble'))
    expect(foldDanish('Brødrene')).toBe(foldDanish('Broedrene'))
    expect(foldDanish('Brødrene')).toBe(foldDanish('brodrene'))
  })

  it('indexes the spellings without ø and å', () => {
    expect(danishSpellings('Brødrene Karamasov')).toEqual(['Broedrene Karamasov'])
    expect(danishSpellings('Håndbogen')).toEqual(['Haandbogen'])
    expect(danishSpellings('Den lille prinsesse')).toEqual([])
  })

  it('gives the engine Danish titles as titles and Danish names as the author\'s own', () => {
    const work = tinctWork(books[2])
    expect(work.title).toBe('The Brothers Karamazov')
    expect(work.altTitles).toEqual(expect.arrayContaining(['Brødrene Karamasov', 'Broedrene Karamasov']))
    expect(work.authors.map((person: { name: string }) => person.name)).toEqual(['Fyodor Dostoevsky', 'Fjodor Dostojevskij'])
  })
})

describe('library search in Danish', () => {
  const search = createLibrarySearch(books)
  const first = (query: string) => search(query)[0]?.id

  it.each([
    ['Den lille prinsesse', 'a-little-princess'],
    ['den lille prinsesse', 'a-little-princess'],
    ['DEN LILLE PRINSESSE', 'a-little-princess'],
    ['den lille', 'a-little-princess'],
    ['den lil', 'a-little-princess'],
    ['prinsesse', 'a-little-princess'],
    ['Forbrydelse og straf', 'crime-and-punishment'],
    ['forbrydelse', 'crime-and-punishment'],
    ['Odysseen', 'odyssey'],
    ['Bibelen', 'bible'],
    ['Fyrsten', 'the-prince'],
    ['Krigskunsten', 'the-art-of-war'],
    ['Kunsten at føre krig', 'the-art-of-war'],
    ['Kunsten at fore krig', 'the-art-of-war'],
    ['Kunsten at foere krig', 'the-art-of-war'],
    ['kunsten at f', 'the-art-of-war'],
    ['Håndbogen', 'the-manual'],
    ['Haandbogen', 'the-manual'],
    ['Handbogen', 'the-manual'],
    ['Brødrene Karamasov', 'brothers-karamazov'],
    ['Broedrene Karamasov', 'brothers-karamazov'],
    ['brodrene karamasov', 'brothers-karamazov'],
    ['Æneiden', 'the-aeneid'],
    ['Aeneiden', 'the-aeneid'],
    ['Stormfulde højder', 'wuthering-heights'],
    ['stormfulde hoejder', 'wuthering-heights'],
    ['stormfulde hojder', 'wuthering-heights'],
    ['Frygt og Bæven', 'fear-and-trembling'],
    ['frygt og baeven', 'fear-and-trembling'],
    ['Soeren Kierkegaard', 'fear-and-trembling'],
    ['Sofokles', 'antigone'],
    ['Platon', 'apology'],
    ['Epiktet', 'the-manual'],
    ['Sokrates forsvarstale', 'apology'],
  ])('"%s" finds %s first', (query, id) => {
    expect(first(query)).toBe(id)
  })

  it('finds every book by a Danish author spelling', () => {
    expect(search('Dostojevskij').map((book: Book) => book.id).sort()).toEqual(['brothers-karamazov', 'crime-and-punishment'])
  })

  it('still finds English titles and authors, and lists nothing for a word no book has', () => {
    expect(first('A Little Princess')).toBe('a-little-princess')
    expect(first('crime and punishment')).toBe('crime-and-punishment')
    expect(first('the art of war')).toBe('the-art-of-war')
    expect(first('hamlet')).toBe('hamlet')
    expect(search('zzzz')).toEqual([])
  })

  it('names the Danish title as "also known as" and rebuilds when Danish titles arrive', () => {
    const list: Book[] = [{ id: 'a-little-princess', title: 'A Little Princess', author: 'Frances Hodgson Burnett' }]
    const library = librarySearch(() => list)
    expect(library.filter('den lille prinsesse')).toEqual([])
    list[0].localTitles = { da: ['Den lille prinsesse'] }
    expect(library.filter('den lille prinsesse').map((book: Book) => book.id)).toEqual(['a-little-princess'])
    expect(library.titlesFor('a-little-princess')).toEqual(['Den lille prinsesse'])
  })
})
