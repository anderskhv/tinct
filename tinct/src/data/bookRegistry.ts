import type { Book } from '../types'

export const ODYSSEY: Book = {
  id: 'odyssey',
  title: 'The Odyssey',
  author: 'Homer',
  description: 'The epic journey of Odysseus as he struggles to return home after the Trojan War. Monsters, gods, and the endurance of the human spirit across twenty years of wandering.',
  year: -800,
  wordCount: 130000,
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Butler (Prose, 1900)',
      translator: 'Samuel Butler',
      year: 1900,
      aligned: true,
    },
    {
      key: 'verse-en',
      language: 'en',
      style: 'verse',
      label: 'Pope (Verse, 1726)',
      translator: 'Alexander Pope',
      year: 1726,
      aligned: false,
    },
    {
      key: 'modern-en',
      language: 'en',
      style: 'modern',
      label: 'Modern English',
      aligned: true,
    },
    {
      key: 'kids-en',
      language: 'en',
      style: 'kids',
      label: 'Kids English',
      aligned: true,
    },
    {
      key: 'modern-da',
      language: 'da',
      style: 'modern',
      label: 'Moderne Dansk',
      aligned: true,
    },
    {
      key: 'kids-da',
      language: 'da',
      style: 'kids',
      label: 'Dansk for Børn',
      aligned: true,
    },
  ],
}

export const ULYSSES: Book = {
  id: 'ulysses',
  title: 'Ulysses',
  author: 'James Joyce',
  description: 'One day in Dublin, June 16, 1904. Leopold Bloom wanders through the city in a modern retelling of The Odyssey — stream of consciousness, parody, and the ordinary made extraordinary.',
  year: 1922,
  wordCount: 265000,
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original (1922)',
      year: 1922,
      aligned: true,
    },
    {
      key: 'modern-en',
      language: 'en',
      style: 'modern',
      label: 'Modern English',
      aligned: true,
    },
    {
      key: 'kids-en',
      language: 'en',
      style: 'kids',
      label: 'Kids English',
      aligned: true,
    },
    {
      key: 'modern-da',
      language: 'da',
      style: 'modern',
      label: 'Moderne Dansk',
      aligned: true,
    },
    {
      key: 'kids-da',
      language: 'da',
      style: 'kids',
      label: 'Dansk for Børn',
      aligned: true,
    },
  ],
}

export const WAR_AND_PEACE: Book = {
  id: 'war-and-peace',
  title: 'War and Peace',
  author: 'Leo Tolstoy',
  description: 'The sweeping epic of Russian society during the Napoleonic Wars. Five aristocratic families navigate love, death, and the search for meaning across battlefields and ballrooms.',
  year: 1869,
  wordCount: 561695,
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Maude Translation (1922)',
      translator: 'Aylmer & Louise Maude',
      year: 1922,
      aligned: true,
    },
    {
      key: 'modern-en',
      language: 'en',
      style: 'modern',
      label: 'Modern English',
      aligned: true,
    },
    {
      key: 'kids-en',
      language: 'en',
      style: 'kids',
      label: 'Kids English',
      aligned: true,
    },
    {
      key: 'modern-da',
      language: 'da',
      style: 'modern',
      label: 'Moderne Dansk',
      aligned: true,
    },
    {
      key: 'kids-da',
      language: 'da',
      style: 'kids',
      label: 'Dansk for Børn',
      aligned: true,
    },
  ],
}

/** All books in the library */
export const BOOKS: Book[] = [ODYSSEY, ULYSSES, WAR_AND_PEACE]

export function getBook(id: string): Book | undefined {
  return BOOKS.find(b => b.id === id)
}
