import type { Book } from '../types'

export const ODYSSEY: Book = {
  id: 'odyssey',
  title: 'The Odyssey',
  author: 'Homer',
  description: 'The epic journey of Odysseus as he struggles to return home after the Trojan War. Monsters, gods, and the endurance of the human spirit across twenty years of wandering.',
  year: -800,
  wordCount: 130000,
  coverColor: '#1a3a5c',
  coverAccent: '#c9a45c',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Butler (Prose, 1900)',
      translator: 'Samuel Butler',
      year: 1900,
      aligned: true,
      hasAudio: true,
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
      hasAudio: true,
    },
    {
      key: 'modern-da',
      language: 'da',
      style: 'modern',
      label: 'Moderne Dansk',
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
  coverColor: '#2c1810',
  coverAccent: '#d4a843',
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
      key: 'modern-da',
      language: 'da',
      style: 'modern',
      label: 'Moderne Dansk',
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
  coverColor: '#3c1a1a',
  coverAccent: '#c9a45c',
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
      key: 'modern-da',
      language: 'da',
      style: 'modern',
      label: 'Moderne Dansk',
      aligned: true,
    },
  ],
}

export const BIBLE: Book = {
  id: 'bible',
  title: 'The Bible',
  author: 'Various',
  description: 'The foundational text of Western civilization. 66 books spanning creation, law, history, poetry, prophecy, gospels, and revelation — the story of God and humanity across thousands of years.',
  year: -1400,
  wordCount: 783000,
  coverColor: '#2a1a0e',
  coverAccent: '#d4a843',
  editions: [
    {
      key: 'kjv-en',
      language: 'en',
      style: 'kjv',
      label: 'King James Version (1611)',
      year: 1611,
      aligned: true,
    },
    {
      key: 'web-en',
      language: 'en',
      style: 'web',
      label: 'World English Bible',
      year: 2000,
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
      key: 'modern-da',
      language: 'da',
      style: 'modern',
      label: 'Moderne Dansk',
      aligned: true,
    },
  ],
}

/** All books in the library */
export const BOOKS: Book[] = [ODYSSEY, ULYSSES, WAR_AND_PEACE, BIBLE]

export function getBook(id: string): Book | undefined {
  return BOOKS.find(b => b.id === id)
}
