import type { Book } from '../types'

export const ODYSSEY: Book = {
  id: 'odyssey',
  title: 'The Odyssey',
  author: 'Homer',
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

/** All books in the library */
export const BOOKS: Book[] = [ODYSSEY, ULYSSES]

export function getBook(id: string): Book | undefined {
  return BOOKS.find(b => b.id === id)
}
