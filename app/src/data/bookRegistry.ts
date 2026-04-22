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
      hasAudio: true,
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
    {
      key: 'modern-da',
      language: 'da',
      style: 'modern',
      label: 'Moderne Dansk',
      aligned: true,
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

export const PRIDE_AND_PREJUDICE: Book = {
  id: 'pride-and-prejudice',
  title: 'Pride and Prejudice',
  author: 'Jane Austen',
  description: 'A sharp-tongued woman and a proud gentleman circle each other through balls, misunderstandings, and pride — until they don\'t. The novel that invented the romantic comedy.',
  year: 1813,
  wordCount: 122000,
  coverColor: '#2e2014',
  coverAccent: '#d4a86a',
  editions: [
    { key: 'original-en', language: 'en', style: 'original', label: 'Original (1813)', year: 1813, aligned: true },
    { key: 'modern-en', language: 'en', style: 'modern', label: 'Modern English', aligned: true, hasAudio: true },
    { key: 'modern-da', language: 'da', style: 'modern', label: 'Moderne Dansk', aligned: true },
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

export const CRIME_AND_PUNISHMENT: Book = {
  id: 'crime-and-punishment',
  title: 'Crime and Punishment',
  author: 'Fyodor Dostoevsky',
  description: 'A brilliant student commits the perfect murder — then discovers that guilt is a punishment no logic can escape. Dostoevsky\'s masterpiece of conscience, paranoia, and redemption.',
  year: 1866,
  wordCount: 211000,
  coverColor: '#1a1a1a',
  coverAccent: '#8b4513',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Garnett Translation (1914)',
      translator: 'Constance Garnett',
      year: 1914,
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
    },
  ],
}

export const THE_REPUBLIC: Book = {
  id: 'the-republic',
  title: 'The Republic',
  author: 'Plato',
  description: 'Socrates and his friends spend one long night asking the hardest question: what is justice? Along the way they build a city in words, discover the Forms, and descend into a cave. Philosophy begins here.',
  year: -375,
  wordCount: 120000,
  coverColor: '#1a2a3a',
  coverAccent: '#c9b896',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Jowett Translation (1871)',
      translator: 'Benjamin Jowett',
      year: 1871,
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
    },
  ],
}

export const MEDITATIONS: Book = {
  id: 'meditations',
  title: 'Meditations',
  author: 'Marcus Aurelius',
  description: 'A Roman emperor\'s private journal — written on campaign, never meant to be read. No self-help platitudes, just a man wrestling with duty, mortality, and how to be good when the world isn\'t.',
  year: 180,
  wordCount: 45000,
  coverColor: '#2a2018',
  coverAccent: '#9a8a6a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Long Translation (1862)',
      translator: 'George Long',
      year: 1862,
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
    },
  ],
}

export const DIVINE_COMEDY: Book = {
  id: 'divine-comedy',
  title: 'The Divine Comedy',
  author: 'Dante Alighieri',
  description: 'A poet walks through Hell, climbs the mountain of Purgatory, and ascends into Paradise — guided first by reason, then by love. The journey that mapped the afterlife and invented Italian literature.',
  year: 1320,
  wordCount: 110000,
  coverColor: '#1a0a0a',
  coverAccent: '#d4a030',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Longfellow Translation (1867)',
      translator: 'Henry Wadsworth Longfellow',
      year: 1867,
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
    },
  ],
}

export const JANE_EYRE: Book = {
  id: 'jane-eyre',
  title: 'Jane Eyre',
  author: 'Charlotte Brontë',
  description: 'An orphan with a fierce will and a quiet voice fights her way from cruelty to independence — then falls in love with a man hiding a terrible secret. "Reader, I married him."',
  year: 1847,
  wordCount: 188000,
  coverColor: '#2a1a2a',
  coverAccent: '#b87aa0',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original (1847)',
      year: 1847,
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
    },
  ],
}

export const THE_AENEID: Book = {
  id: 'the-aeneid',
  title: 'The Aeneid',
  author: 'Virgil',
  description: 'A Trojan prince flees the ruins of his city, wanders the Mediterranean for seven years, and fights to found a new homeland in Italy. The epic that gave Rome its origin story — and Latin literature its masterpiece.',
  year: -19,
  wordCount: 110000,
  coverColor: '#1a1a0a',
  coverAccent: '#c4a035',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Dryden Translation (1697)',
      translator: 'John Dryden',
      year: 1697,
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
    },
  ],
}

export const PARADISE_LOST: Book = {
  id: 'paradise-lost',
  title: 'Paradise Lost',
  author: 'John Milton',
  description: 'Satan rebels against Heaven, corrupts humanity, and loses everything — but never stops talking. Milton\'s blind epic of free will, disobedience, and the cost of knowledge.',
  year: 1667,
  wordCount: 80000,
  coverColor: '#0a0a1a',
  coverAccent: '#a0a0d4',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original (1674)',
      year: 1674,
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
    },
  ],
}

export const FRANKENSTEIN: Book = {
  id: 'frankenstein',
  title: 'Frankenstein',
  author: 'Mary Shelley',
  description: 'A young scientist creates life from dead flesh — then abandons it. The creature, articulate and desperate, wants only to be loved. The novel that invented science fiction and never lets you decide who the real monster is.',
  year: 1818,
  wordCount: 75000,
  coverColor: '#0a1a0a',
  coverAccent: '#6ab56a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original (1831)',
      year: 1831,
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
    },
  ],
}

export const THE_MANUAL: Book = {
  id: 'the-manual',
  title: 'The Manual',
  author: 'Epictetus',
  description: 'The essential handbook of Stoic philosophy. In 52 short sections, Epictetus sets out the single most important idea in Stoicism: distinguish what is in your power from what is not, and concern yourself only with the former.',
  year: 125,
  wordCount: 10000,
  coverColor: '#2c2c1e',
  coverAccent: '#c8b87a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Long (1877)',
      translator: 'George Long',
      year: 1877,
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
    },
  ],
}

export const CONFESSIONS: Book = {
  id: 'confessions',
  title: 'Confessions',
  author: 'Augustine',
  description: 'The first great spiritual autobiography. Augustine traces his journey from youthful sin through Manichaean philosophy to Christian conversion — wrestling with desire, will, and the nature of God across thirteen searingly honest books.',
  year: 397,
  wordCount: 100000,
  coverColor: '#3a2a1a',
  coverAccent: '#c8a060',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Pusey (1838)',
      translator: 'Edward Bouverie Pusey',
      year: 1838,
      aligned: true,
    },
  ],
}

export const IMITATION_OF_CHRIST: Book = {
  id: 'imitation-of-christ',
  title: 'The Imitation of Christ',
  author: 'Thomas à Kempis',
  description: 'The most widely read Christian devotional work after the Bible. In 114 short chapters, Thomas à Kempis counsels the reader toward humility, inner peace, and the practice of following Christ in daily life.',
  year: 1418,
  wordCount: 60000,
  coverColor: '#2a2a3a',
  coverAccent: '#a0a0c8',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Benham (1886)',
      year: 1886,
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

export const ENCHIRIDION: Book = {
  id: 'enchiridion',
  title: 'Enchiridion',
  author: 'Augustine',
  description: 'Augustine\'s handbook on faith, hope, and love — a concise summary of Christian doctrine written as a letter to Laurentius. In 42 short chapters, the essence of Augustine\'s theology.',
  year: 421,
  wordCount: 25000,
  coverColor: '#3a2a1a',
  coverAccent: '#d4b080',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Shaw (1887)',
      year: 1887,
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

export const JERUSALEM: Book = {
  id: 'jerusalem',
  title: 'Jerusalem',
  author: 'Selma Lagerlöf',
  description: 'A Swedish farming community is torn apart when a charismatic preacher leads half its people on a pilgrimage to the Holy Land. Lagerlöf\'s Nobel Prize-winning novel of faith, land, and the cost of conviction.',
  year: 1901,
  wordCount: 90000,
  coverColor: '#4a3a2a',
  coverAccent: '#c8b878',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Howard (1915)',
      translator: 'Velma Swanston Howard',
      year: 1915,
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
      hasAudio: true,
    },
  ],
}

export const APOLOGY: Book = {
  id: 'apology',
  title: 'Apology',
  author: 'Plato',
  description: 'Socrates stands trial for his life in Athens. Accused of corrupting the youth and denying the gods, he mounts a fearless defense — not of himself, but of the examined life.',
  year: -399,
  wordCount: 14000,
  coverColor: '#3a2f2f',
  coverAccent: '#c4a35a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Jowett (1871)',
      translator: 'Benjamin Jowett',
      year: 1871,
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
    },
  ],
}

export const SYMPOSIUM: Book = {
  id: 'symposium',
  title: 'Symposium',
  author: 'Plato',
  description: 'At a dinner party in Athens, seven men take turns praising Love. From Aristophanes\' comic myth of split souls to Socrates\' account of Diotima\'s ladder of beauty — the Western world\'s founding text on love and desire.',
  year: -385,
  wordCount: 23000,
  coverColor: '#4a2040',
  coverAccent: '#d4a0b0',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Jowett (1871)',
      translator: 'Benjamin Jowett',
      year: 1871,
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
    },
  ],
}

export const PHAEDO: Book = {
  id: 'phaedo',
  title: 'Phaedo',
  author: 'Plato',
  description: 'The last hours of Socrates. In prison awaiting execution, he argues for the immortality of the soul — not from fear, but from philosophical conviction. His friends weep; he drinks the hemlock calmly.',
  year: -385,
  wordCount: 40000,
  coverColor: '#1e2a3a',
  coverAccent: '#8ab4d4',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Jowett (1871)',
      translator: 'Benjamin Jowett',
      year: 1871,
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

export const MOBY_DICK: Book = {
  id: 'moby-dick',
  title: 'Moby Dick',
  author: 'Herman Melville',
  description: 'Call me Ishmael. A young sailor boards the whaling ship Pequod, captained by the monomaniac Ahab, who will hunt the great white whale to the ends of the earth — and beyond reason.',
  year: 1851,
  wordCount: 210000,
  coverColor: '#1a2a3e',
  coverAccent: '#a8c8d8',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original (1851)',
      year: 1851,
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

export const GREAT_EXPECTATIONS: Book = {
  id: 'great-expectations',
  title: 'Great Expectations',
  author: 'Charles Dickens',
  description: 'Pip, an orphan in the Kent marshes, receives a mysterious fortune that transforms his life. But his great expectations carry a price — and the truth about his benefactor will shatter everything he believes.',
  year: 1861,
  wordCount: 185000,
  coverColor: '#3a2a1a',
  coverAccent: '#d4b896',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original (1861)',
      year: 1861,
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

export const THE_HISTORIES: Book = {
  id: 'the-histories',
  title: 'The Histories',
  author: 'Herodotus',
  description: 'The first great work of history in the Western world. Herodotus travels the ancient world — Egypt, Persia, Scythia, Greece — recording customs, wars, and wonders, building toward the epic clash between Greece and Persia.',
  year: -440,
  wordCount: 280000,
  coverColor: '#4a3a2a',
  coverAccent: '#c8a860',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Macaulay (1890)',
      translator: 'George Campbell Macaulay',
      year: 1890,
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

export const NIELS_LYHNE: Book = {
  id: 'niels-lyhne',
  title: 'Niels Lyhne',
  author: 'J.P. Jacobsen',
  description: 'A young Danish dreamer searches for meaning through art, love, and atheism in nineteenth-century Denmark. Jacobsen\'s masterpiece — the novel Rilke called "the most important book in the world."',
  year: 1880,
  wordCount: 65000,
  coverColor: '#2a3a2e',
  coverAccent: '#a8b89a',
  editions: [
    {
      key: 'original-da',
      language: 'da',
      style: 'original',
      label: 'Original (1880)',
      year: 1880,
      aligned: true,
    },
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Larsen (1919)',
      translator: 'Hanna Astrup Larsen',
      year: 1919,
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
    },
  ],
}

export const THE_AWAKENING: Book = {
  id: 'the-awakening',
  title: 'The Awakening',
  author: 'Kate Chopin',
  description: 'A young mother on a Louisiana island begins to feel the pull of the sea — and of a life entirely her own. Chopin\'s 1899 novel scandalized its readers and was forgotten for decades. It is now recognized as one of the first great feminist novels in American literature.',
  year: 1899,
  wordCount: 49000,
  coverColor: '#0d2233',
  coverAccent: '#6aabcc',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Original (1899)',
      year: 1899,
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
      hasAudio: true,
    },
  ],
}

export const BROTHERS_KARAMAZOV: Book = {
  id: 'brothers-karamazov',
  title: 'The Brothers Karamazov',
  author: 'Fyodor Dostoevsky',
  description: 'Dostoevsky\'s final novel: three brothers and their father, a murder, a trial, and the deepest questions of faith, doubt, and human freedom. Includes the legendary parable "The Grand Inquisitor."',
  year: 1880,
  wordCount: 360000,
  coverColor: '#5a1a1a',
  coverAccent: '#d4a843',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Garnett (1912)',
      translator: 'Constance Garnett',
      year: 1912,
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

export const ILIAD: Book = {
  id: 'iliad',
  title: 'The Iliad',
  author: 'Homer',
  description: 'The wrath of Achilles and the final weeks of the Trojan War. Homer\'s first epic — rage, fate, gods at war with men, and the funeral of Hector.',
  year: -750,
  wordCount: 150000,
  coverColor: '#3a1a1a',
  coverAccent: '#c9a04a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Butler (1898)',
      translator: 'Samuel Butler',
      year: 1898,
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

export const NICOMACHEAN_ETHICS: Book = {
  id: 'nicomachean-ethics',
  title: 'Nicomachean Ethics',
  author: 'Aristotle',
  description: 'The foundational work of virtue ethics. Aristotle asks what the good life is for a human being, and answers: flourishing (eudaimonia), achieved through practical wisdom, moral virtue, and contemplation. The golden mean, friendship, justice, and the nature of happiness — the vocabulary ethics has used ever since.',
  year: -350,
  wordCount: 92000,
  coverColor: '#2a2a1a',
  coverAccent: '#b89a4a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Chase (1847) / Ross tradition',
      translator: 'D.P. Chase',
      year: 1847,
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

export const THE_PRINCE: Book = {
  id: 'the-prince',
  title: 'The Prince',
  author: 'Niccolò Machiavelli',
  description: 'The coldest clear-eyed book about power ever written. Machiavelli, exiled from Florence, drafted a manual for the ruler who would unify Italy — and in the process invented modern political realism. Fortune, virtù, the fox and the lion, and whether it is better to be loved or feared.',
  year: 1532,
  wordCount: 32000,
  coverColor: '#3a2018',
  coverAccent: '#b8804a',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Marriott (1908)',
      translator: 'W.K. Marriott',
      year: 1908,
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

export const CANDIDE: Book = {
  id: 'candide',
  title: 'Candide',
  author: 'Voltaire',
  description: 'Voltaire\'s attack on Leibnizian optimism. A young man is tutored in the belief that this is "the best of all possible worlds" — then the world systematically dismantles that belief through earthquake, war, plague, Inquisition, and the slave trade. Ends with the most famous closing line in the Enlightenment: "we must cultivate our garden."',
  year: 1759,
  wordCount: 32000,
  coverColor: '#8b2c1e',
  coverAccent: '#d4a574',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Fleming (1901)',
      translator: 'William F. Fleming',
      year: 1901,
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
    },
  ],
}

export const BEOWULF: Book = {
  id: 'beowulf',
  title: 'Beowulf',
  author: 'Anonymous',
  description: 'The oldest surviving epic in English. A Geatish warrior crosses the sea to fight three monsters across a lifetime — Grendel, Grendel\'s mother, and a dragon — in a poem about courage, kingship, and the long defeat that all heroes face.',
  year: 1000,
  wordCount: 24000,
  coverColor: '#1a2332',
  coverAccent: '#a89060',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Hall (1892)',
      translator: 'J. Lesslie Hall',
      year: 1892,
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
      hasAudio: true,
    },
  ],
}

export const BEYOND_GOOD_AND_EVIL: Book = {
  id: 'beyond-good-and-evil',
  title: 'Beyond Good and Evil',
  author: 'Friedrich Nietzsche',
  description: 'Nietzsche at his most corrosive and most exhilarating. A frontal attack on the dogmas of philosophers, the pieties of Christianity, and the democratic instinct — and a sketch of the "free spirit" who would live beyond the old moral categories. Master-morality, slave-morality, the will to power, and the question: what is noble?',
  year: 1886,
  wordCount: 63000,
  coverColor: '#1a1a1a',
  coverAccent: '#8b5a3c',
  editions: [
    {
      key: 'original-en',
      language: 'en',
      style: 'original',
      label: 'Zimmern (1907)',
      translator: 'Helen Zimmern',
      year: 1907,
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

/** All books in the library */
export const BOOKS: Book[] = [ODYSSEY, ULYSSES, WAR_AND_PEACE, BIBLE, GILGAMESH, HAMLET, MACBETH, MIDSUMMER, ROMEO_AND_JULIET, THE_TEMPEST, THE_ART_OF_WAR, PRIDE_AND_PREJUDICE, CRIME_AND_PUNISHMENT, THE_REPUBLIC, MEDITATIONS, DIVINE_COMEDY, JANE_EYRE, THE_AENEID, PARADISE_LOST, FRANKENSTEIN, THE_MANUAL, APOLOGY, SYMPOSIUM, PHAEDO, MOBY_DICK, GREAT_EXPECTATIONS, THE_HISTORIES, NIELS_LYHNE, CONFESSIONS, IMITATION_OF_CHRIST, ENCHIRIDION, JERUSALEM, THE_AWAKENING, BROTHERS_KARAMAZOV, ILIAD, NICOMACHEAN_ETHICS, THE_PRINCE, BEYOND_GOOD_AND_EVIL, BEOWULF, CANDIDE]

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL-ONLY BOOKS
// These books are under copyright and exist only for personal reading on
// localhost. Edition files are in .gitignore. Never deploy, never upload to R2.
// ─────────────────────────────────────────────────────────────────────────────

export const MARKINGS: Book = {
  id: 'markings',
  title: 'Markings',
  author: 'Dag Hammarskjöld',
  description: 'The posthumously published journal of UN Secretary-General Dag Hammarskjöld — a private record of spiritual struggle, solitude, and the search for meaning across two decades of public life.',
  year: 1963,
  wordCount: 50000,
  coverColor: '#2c3e50',
  coverAccent: '#bdc3c7',
  localOnly: true,
  editions: [
    {
      key: 'modern-en',
      language: 'en',
      style: 'modern',
      label: 'Auden/Sjöberg (1964)',
      translator: 'Leif Sjöberg & W.H. Auden',
      year: 1964,
      aligned: false,
      hasAudio: false,
    },
  ],
}

/**
 * Local-only books — copyright-protected texts for personal reading on localhost.
 * Edition files are gitignored. Never appear in production builds.
 */
export const LOCAL_BOOKS: Book[] = [MARKINGS]

/**
 * All books visible in the current environment.
 * In production (import.meta.env.PROD) local-only books are excluded.
 */
export const ALL_BOOKS: Book[] = import.meta.env.PROD
  ? BOOKS
  : [...BOOKS, ...LOCAL_BOOKS]

export function getBook(id: string): Book | undefined {
  return ALL_BOOKS.find(b => b.id === id)
}
