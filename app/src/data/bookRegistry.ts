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
      hasAudio: false,
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
      hasAudio: true,
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
      hasAudio: false,
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
      hasAudio: true,
    },
    {
      key: 'modern-da',
      language: 'da',
      style: 'modern',
      label: 'Moderne Dansk',
      aligned: true,
      hasAudio: false,
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

export const GILGAMESH: Book = {
  id: 'gilgamesh',
  title: 'The Epic of Gilgamesh',
  author: 'Anonymous',
  description: 'The oldest surviving great work of literature. A king and a wild man become brothers, slay monsters, and defy the gods — then face the one enemy no mortal can defeat.',
  year: -2100,
  wordCount: 30000,
  coverColor: '#4a3728',
  coverAccent: '#c9963a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Prose Compilation',
      aligned: true,
      hasAudio: false,
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

export const HAMLET: Book = {
  id: 'hamlet',
  title: 'Hamlet',
  author: 'William Shakespeare',
  description: 'A prince haunted by his father\'s ghost, paralyzed by doubt, driven toward revenge. The play that invented the modern mind — and the question that never stops: to be, or not to be.',
  year: 1600,
  wordCount: 30000,
  coverColor: '#1a1a2e',
  coverAccent: '#8a7fb5',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original Text',
      aligned: true,
    },
    {
      key: 'modern-en',
      language: 'en',
      style: 'modern',
      label: 'Modern English',
      aligned: true,
      hasAudio: true,
    },
  ],
}

export const MACBETH: Book = {
  id: 'macbeth',
  title: 'Macbeth',
  author: 'William Shakespeare',
  description: 'A warrior seduced by prophecy and ambition murders his king — then watches his world unravel. Shakespeare\'s darkest, fastest tragedy: blood, guilt, and the wages of unchecked power.',
  year: 1606,
  wordCount: 17000,
  coverColor: '#2a0a0a',
  coverAccent: '#b53a3a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original Text',
      aligned: true,
    },
    {
      key: 'modern-en',
      language: 'en',
      style: 'modern',
      label: 'Modern English',
      aligned: true,
    },
  ],
}

export const MIDSUMMER: Book = {
  id: 'midsummer',
  title: 'A Midsummer Night\'s Dream',
  author: 'William Shakespeare',
  description: 'Lovers lost in an enchanted forest, fairies at war, and a weaver turned into a donkey. Shakespeare\'s most magical comedy — where love is ridiculous, wonderful, and completely out of anyone\'s control.',
  year: 1595,
  wordCount: 16000,
  coverColor: '#0e2a1a',
  coverAccent: '#6abf8a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original Text',
      aligned: true,
    },
    {
      key: 'modern-en',
      language: 'en',
      style: 'modern',
      label: 'Modern English',
      aligned: true,
    },
  ],
}

export const ROMEO_AND_JULIET: Book = {
  id: 'romeo-and-juliet',
  title: 'Romeo and Juliet',
  author: 'William Shakespeare',
  description: 'Two teenagers fall in love across a blood feud and burn through five days that end in a tomb. The original star-crossed lovers — and the play that made tragedy feel like poetry.',
  year: 1597,
  wordCount: 25000,
  coverColor: '#2e1020',
  coverAccent: '#d4667a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original Text',
      aligned: true,
    },
    {
      key: 'modern-en',
      language: 'en',
      style: 'modern',
      label: 'Modern English',
      aligned: true,
    },
  ],
}

export const THE_TEMPEST: Book = {
  id: 'the-tempest',
  title: 'The Tempest',
  author: 'William Shakespeare',
  description: 'A sorcerer on a remote island conjures a storm to shipwreck his enemies — then chooses mercy over revenge. Shakespeare\'s farewell to the stage: magic, forgiveness, and letting go.',
  year: 1611,
  wordCount: 17000,
  coverColor: '#0e1a2e',
  coverAccent: '#5a9abf',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original Text',
      aligned: true,
    },
    {
      key: 'modern-en',
      language: 'en',
      style: 'modern',
      label: 'Modern English',
      aligned: true,
    },
  ],
}

export const THE_ART_OF_WAR: Book = {
  id: 'the-art-of-war',
  title: 'The Art of War',
  author: 'Sun Tzu',
  description: 'Thirteen chapters on strategy, deception, and the nature of conflict — written 2,500 years ago, still the sharpest manual on how to win without fighting.',
  year: -500,
  wordCount: 13000,
  coverColor: '#2a1a0a',
  coverAccent: '#c4a035',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Giles Translation (1910)',
      translator: 'Lionel Giles',
      year: 1910,
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
export const BOOKS: Book[] = [ODYSSEY, ULYSSES, WAR_AND_PEACE, BIBLE, GILGAMESH, HAMLET, MACBETH, MIDSUMMER, ROMEO_AND_JULIET, THE_TEMPEST, THE_ART_OF_WAR]

export function getBook(id: string): Book | undefined {
  return BOOKS.find(b => b.id === id)
}
