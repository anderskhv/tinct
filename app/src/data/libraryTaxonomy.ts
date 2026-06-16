import type { Book } from '../types'

export interface LibraryBookMeta {
  id: string
  title: string
  author: string
  tradition?: string
  year: string
  ySort: number
  form: string
  era: string
  hue: number
  blurb: string
  themes: string[]
  shelves: string[]
  sub?: string
  stub?: boolean
  langs?: string[]
  progress?: number
  paused?: boolean
  status?: string
  finishedOn?: string
}

export interface LibraryShelf {
  title: string
  sub: string
  hue: number
}

export interface LibraryHouse {
  id: string
  title: string
  sub: string
  hue: number
  shelves: string[]
}

export interface LibraryReadingListEntry {
  id?: string
  missing?: boolean
  title?: string
  author?: string
  note?: string
}

export interface LibraryReadingList {
  id: string
  title: string
  source: string
  description: string
  accent: number
  computed?: boolean
  sequence: LibraryReadingListEntry[]
}

export interface LibraryListMembership {
  listId: string
  listTitle: string
  position: number
  accent: number
}

export const LIBRARY_BOOK_META: LibraryBookMeta[] = [
  {
    "id": "gilgamesh",
    "title": "The Epic of Gilgamesh",
    "author": "Anonymous",
    "tradition": "Mesopotamian",
    "year": "c. 2100 BC",
    "ySort": -2100,
    "form": "epic",
    "era": "antiquity",
    "hue": 60,
    "blurb": "The oldest surviving story — a king's grief and the search for what cannot die.",
    "themes": [
      "friendship",
      "mortality",
      "flood-myth"
    ],
    "shelves": [
      "ancient-epics"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "iliad",
    "title": "The Iliad",
    "author": "Homer",
    "year": "c. 750 BC",
    "ySort": -750,
    "form": "epic",
    "era": "antiquity",
    "hue": 35,
    "blurb": "The wrath of Achilles, and the long siege of Troy.",
    "themes": [
      "war",
      "honor",
      "rage",
      "fate"
    ],
    "shelves": [
      "ancient-epics"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "odyssey",
    "title": "The Odyssey",
    "author": "Homer",
    "year": "c. 700 BC",
    "ySort": -700,
    "form": "epic",
    "era": "antiquity",
    "hue": 35,
    "blurb": "A long way home, by way of every sea-monster between.",
    "themes": [
      "homecoming",
      "cunning",
      "sea",
      "myth"
    ],
    "shelves": [
      "ancient-epics"
    ],
    "langs": [
      "EN",
      "DA"
    ],
    "progress": 0.41,
    "paused": true
  },
  {
    "id": "bible",
    "title": "The Bible",
    "author": "Various",
    "tradition": "Hebrew & Greek scribes",
    "year": "c. 1200 BC – 100 AD",
    "ySort": -1200,
    "form": "scripture",
    "era": "antiquity",
    "hue": 25,
    "blurb": "Sixty-six books, two testaments. The library inside the library.",
    "themes": [
      "covenant",
      "wisdom",
      "prophecy",
      "grace"
    ],
    "shelves": [
      "bible-and-devotion",
      "christian-tradition"
    ],
    "progress": 0.03,
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "oresteia",
    "title": "The Oresteia",
    "author": "Aeschylus",
    "year": "458 BC",
    "ySort": -458,
    "form": "drama",
    "era": "antiquity",
    "hue": 215,
    "blurb": "A house cursed; the birth of trial by jury.",
    "themes": [
      "vengeance",
      "justice",
      "curse"
    ],
    "shelves": [
      "greek-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "oedipus-rex",
    "title": "Oedipus Rex",
    "author": "Sophocles",
    "year": "c. 429 BC",
    "ySort": -429,
    "form": "drama",
    "era": "antiquity",
    "hue": 25,
    "blurb": "A king investigates a plague and finds himself at the bottom of it.",
    "themes": [
      "fate",
      "identity",
      "blindness"
    ],
    "shelves": [
      "greek-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "antigone",
    "title": "Antigone",
    "author": "Sophocles",
    "year": "c. 441 BC",
    "ySort": -441,
    "form": "drama",
    "era": "antiquity",
    "hue": 25,
    "blurb": "Bury your brother, defy the king.",
    "themes": [
      "civil-disobedience",
      "family",
      "law"
    ],
    "shelves": [
      "greek-tragedy",
      "on-power"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "oedipus-at-colonus",
    "title": "Oedipus at Colonus",
    "author": "Sophocles",
    "year": "c. 406 BC",
    "ySort": -406,
    "form": "drama",
    "era": "antiquity",
    "hue": 215,
    "blurb": "The exiled king finds, at last, a place to die.",
    "themes": [
      "exile",
      "grace",
      "old-age"
    ],
    "shelves": [
      "greek-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "bacchae",
    "title": "The Bacchae",
    "author": "Euripides",
    "year": "c. 405 BC",
    "ySort": -405,
    "form": "drama",
    "era": "antiquity",
    "hue": 300,
    "blurb": "A god comes home to a city that won't worship him.",
    "themes": [
      "ecstasy",
      "reason",
      "retribution"
    ],
    "shelves": [
      "greek-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "medea",
    "title": "Medea",
    "author": "Euripides",
    "year": "431 BC",
    "ySort": -431,
    "form": "drama",
    "era": "antiquity",
    "hue": 300,
    "blurb": "A wife scorned, in a foreign land, with options.",
    "themes": [
      "betrayal",
      "revenge",
      "exile"
    ],
    "shelves": [
      "greek-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "apology",
    "title": "Apology",
    "author": "Plato",
    "year": "c. 399 BC",
    "ySort": -399,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 225,
    "blurb": "Socrates defends himself, and loses on purpose.",
    "themes": [
      "examined-life",
      "death",
      "irony"
    ],
    "shelves": [
      "plato"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "crito",
    "title": "Crito",
    "author": "Plato",
    "year": "c. 399 BC",
    "ySort": -398,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 225,
    "blurb": "A friend at the cell door, an argument against escape.",
    "themes": [
      "law",
      "obligation",
      "justice"
    ],
    "shelves": [
      "plato"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "phaedo",
    "title": "Phaedo",
    "author": "Plato",
    "year": "c. 385 BC",
    "ySort": -385,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 225,
    "blurb": "The last hours, on the soul and what follows.",
    "themes": [
      "soul",
      "immortality",
      "forms"
    ],
    "shelves": [
      "plato"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "symposium",
    "title": "Symposium",
    "author": "Plato",
    "year": "c. 385 BC",
    "ySort": -385.1,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 310,
    "blurb": "Seven men, a lot of wine, and speeches on love.",
    "themes": [
      "love",
      "beauty",
      "desire"
    ],
    "shelves": [
      "plato"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "phaedrus",
    "title": "Phaedrus",
    "author": "Plato",
    "year": "c. 370 BC",
    "ySort": -370,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 225,
    "blurb": "A walk outside the walls; rhetoric, eros, the soul as chariot.",
    "themes": [
      "rhetoric",
      "love",
      "writing"
    ],
    "shelves": [
      "plato"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "the-republic",
    "title": "The Republic",
    "author": "Plato",
    "year": "c. 375 BC",
    "ySort": -375,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 225,
    "blurb": "What is justice? A city built in words to find out.",
    "themes": [
      "justice",
      "ideal-state",
      "cave"
    ],
    "shelves": [
      "plato",
      "on-the-state"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "nicomachean-ethics",
    "title": "Nicomachean Ethics",
    "author": "Aristotle",
    "year": "c. 350 BC",
    "ySort": -350,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 90,
    "blurb": "How to live well, defined by the man who liked definitions.",
    "themes": [
      "virtue",
      "happiness",
      "habit"
    ],
    "shelves": [
      "aristotle"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "aristotle-politics",
    "title": "Politics",
    "author": "Aristotle",
    "year": "c. 335 BC",
    "ySort": -335,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 310,
    "blurb": "Man is a political animal. Discuss.",
    "themes": [
      "polis",
      "citizenship",
      "constitutions"
    ],
    "shelves": [
      "aristotle",
      "on-the-state"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "poetics",
    "title": "Poetics",
    "author": "Aristotle",
    "year": "c. 335 BC",
    "ySort": -334,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 150,
    "blurb": "Why tragedy works, dissected.",
    "themes": [
      "tragedy",
      "mimesis",
      "catharsis"
    ],
    "shelves": [
      "aristotle"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "the-histories",
    "title": "The Histories",
    "author": "Herodotus",
    "year": "c. 440 BC",
    "ySort": -440,
    "form": "history",
    "era": "antiquity",
    "hue": 60,
    "blurb": "The first history book, half ethnography and half tall tale.",
    "themes": [
      "persia",
      "greece",
      "custom"
    ],
    "shelves": [
      "ancient-history"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "peloponnesian-war",
    "title": "History of the Peloponnesian War",
    "author": "Thucydides",
    "year": "c. 400 BC",
    "ySort": -400,
    "form": "history",
    "era": "antiquity",
    "hue": 60,
    "blurb": "Athens versus Sparta, by a participant who took notes.",
    "themes": [
      "war",
      "power",
      "realism"
    ],
    "shelves": [
      "ancient-history",
      "on-war"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "the-art-of-war",
    "title": "The Art of War",
    "author": "Sun Tzu",
    "year": "c. 500 BC",
    "ySort": -500,
    "form": "strategy",
    "era": "antiquity",
    "hue": 35,
    "blurb": "Win without fighting, when you can.",
    "themes": [
      "strategy",
      "deception",
      "terrain"
    ],
    "shelves": [
      "strategy",
      "on-war"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "the-manual",
    "title": "The Manual",
    "author": "Epictetus",
    "year": "c. 125 AD",
    "ySort": 125,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 25,
    "blurb": "Pocket-sized stoicism, from a former slave.",
    "themes": [
      "stoicism",
      "control",
      "equanimity"
    ],
    "shelves": [
      "stoics"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "meditations",
    "title": "Meditations",
    "author": "Marcus Aurelius",
    "year": "c. 175 AD",
    "ySort": 175,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 90,
    "blurb": "A Roman emperor talks to himself in the dark.",
    "themes": [
      "stoicism",
      "duty",
      "impermanence"
    ],
    "shelves": [
      "stoics"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "the-aeneid",
    "title": "The Aeneid",
    "author": "Virgil",
    "year": "c. 19 BC",
    "ySort": -19,
    "form": "epic",
    "era": "antiquity",
    "hue": 90,
    "blurb": "A refugee from Troy founds Rome, sort of.",
    "themes": [
      "duty",
      "exile",
      "empire"
    ],
    "shelves": [
      "ancient-epics"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "confessions",
    "title": "Confessions",
    "author": "Augustine",
    "year": "c. 400 AD",
    "ySort": 400,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 25,
    "blurb": "The first real autobiography — and an argument with God.",
    "themes": [
      "memory",
      "conversion",
      "time"
    ],
    "shelves": [
      "christian-philosophy",
      "christian-tradition"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "beowulf",
    "title": "Beowulf",
    "author": "Anonymous",
    "tradition": "Old English",
    "year": "c. 1000",
    "ySort": 1000,
    "form": "epic",
    "era": "medieval",
    "hue": 200,
    "blurb": "Monsters, mead-halls, alliterative grandeur.",
    "themes": [
      "heroism",
      "monsters",
      "fate"
    ],
    "shelves": [
      "medieval-epics"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "magna-carta",
    "title": "Magna Carta",
    "author": "King John & the English Barons",
    "year": "1215",
    "ySort": 1215,
    "form": "history",
    "era": "medieval",
    "hue": 90,
    "blurb": "The first time a king signed away some of the power.",
    "themes": [
      "law",
      "liberty",
      "tyranny"
    ],
    "shelves": [
      "founding-docs",
      "on-power"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "divine-comedy",
    "title": "The Divine Comedy",
    "author": "Dante Alighieri",
    "year": "1320",
    "ySort": 1320,
    "form": "epic",
    "era": "medieval",
    "hue": 35,
    "blurb": "A guided tour of hell, purgatory, and paradise — in terza rima.",
    "themes": [
      "afterlife",
      "love",
      "sin"
    ],
    "shelves": [
      "sacred-epics",
      "christian-tradition"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "imitation-of-christ",
    "title": "The Imitation of Christ",
    "author": "Thomas à Kempis",
    "year": "1418",
    "ySort": 1418,
    "form": "scripture",
    "era": "medieval",
    "hue": 230,
    "blurb": "Devotional. The book second only to the Bible in old monastic cells.",
    "themes": [
      "humility",
      "interior-life",
      "devotion"
    ],
    "shelves": [
      "christian-philosophy",
      "bible-and-devotion",
      "christian-tradition"
    ],
    "progress": 0.01,
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "the-prince",
    "title": "The Prince",
    "author": "Niccolò Machiavelli",
    "year": "1532",
    "ySort": 1532,
    "form": "political",
    "era": "early-modern",
    "hue": 25,
    "blurb": "How to take power and not lose it. Notoriously practical.",
    "themes": [
      "power",
      "fortune",
      "virtù"
    ],
    "shelves": [
      "on-power"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "leviathan",
    "title": "Leviathan",
    "author": "Thomas Hobbes",
    "year": "1651",
    "ySort": 1651,
    "form": "political",
    "era": "early-modern",
    "hue": 215,
    "blurb": "Without the state, life is \"nasty, brutish, and short.\"",
    "themes": [
      "sovereignty",
      "state-of-nature",
      "contract"
    ],
    "shelves": [
      "on-the-state"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "second-treatise",
    "title": "Second Treatise of Government",
    "author": "John Locke",
    "year": "1689",
    "ySort": 1689,
    "form": "political",
    "era": "early-modern",
    "hue": 150,
    "blurb": "Where rights come from, and when revolution is permitted.",
    "themes": [
      "property",
      "consent",
      "natural-rights"
    ],
    "shelves": [
      "on-the-state",
      "founding-docs"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "comedy-of-errors",
    "title": "The Comedy of Errors",
    "author": "William Shakespeare",
    "year": "c. 1594",
    "ySort": 1594,
    "form": "drama",
    "era": "early-modern",
    "hue": 150,
    "sub": "comedy",
    "blurb": "Two sets of twins, one city, infinite confusion.",
    "themes": [
      "mistaken-identity",
      "farce",
      "reunion"
    ],
    "shelves": [
      "shakespeare-comedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "midsummer",
    "title": "A Midsummer Night's Dream",
    "author": "William Shakespeare",
    "year": "1595",
    "ySort": 1595,
    "form": "drama",
    "era": "early-modern",
    "hue": 150,
    "sub": "comedy",
    "blurb": "Fairies, lovers, donkeys, and a play within a play.",
    "themes": [
      "love",
      "dream",
      "enchantment"
    ],
    "shelves": [
      "shakespeare-comedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "romeo-and-juliet",
    "title": "Romeo and Juliet",
    "author": "William Shakespeare",
    "year": "1597",
    "ySort": 1597,
    "form": "drama",
    "era": "early-modern",
    "hue": 355,
    "sub": "tragedy",
    "blurb": "Two households, both alike in dignity.",
    "themes": [
      "love",
      "feud",
      "youth"
    ],
    "shelves": [
      "shakespeare-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "taming-of-the-shrew",
    "title": "The Taming of the Shrew",
    "author": "William Shakespeare",
    "year": "c. 1592",
    "ySort": 1592,
    "form": "drama",
    "era": "early-modern",
    "hue": 150,
    "sub": "comedy",
    "blurb": "A famously thorny courtship comedy.",
    "themes": [
      "marriage",
      "power",
      "disguise"
    ],
    "shelves": [
      "shakespeare-comedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "richard-iii",
    "title": "Richard III",
    "author": "William Shakespeare",
    "year": "c. 1593",
    "ySort": 1593,
    "form": "drama",
    "era": "early-modern",
    "hue": 355,
    "sub": "history",
    "blurb": "A villain in soliloquy.",
    "themes": [
      "ambition",
      "tyranny",
      "conscience"
    ],
    "shelves": [
      "shakespeare-history",
      "on-power"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "merchant-of-venice",
    "title": "The Merchant of Venice",
    "author": "William Shakespeare",
    "year": "c. 1597",
    "ySort": 1598,
    "form": "drama",
    "era": "early-modern",
    "hue": 150,
    "sub": "comedy",
    "blurb": "A pound of flesh, a casket riddle, a courtroom turn.",
    "themes": [
      "justice",
      "mercy",
      "prejudice"
    ],
    "shelves": [
      "shakespeare-comedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "much-ado",
    "title": "Much Ado About Nothing",
    "author": "William Shakespeare",
    "year": "c. 1599",
    "ySort": 1599,
    "form": "drama",
    "era": "early-modern",
    "hue": 150,
    "sub": "comedy",
    "blurb": "Banter, slander, and Beatrice.",
    "themes": [
      "wit",
      "deception",
      "courtship"
    ],
    "shelves": [
      "shakespeare-comedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "henry-v",
    "title": "Henry V",
    "author": "William Shakespeare",
    "year": "1599",
    "ySort": 1599.1,
    "form": "drama",
    "era": "early-modern",
    "hue": 355,
    "sub": "history",
    "blurb": "Once more unto the breach.",
    "themes": [
      "kingship",
      "war",
      "rhetoric"
    ],
    "shelves": [
      "shakespeare-history"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "julius-caesar",
    "title": "Julius Caesar",
    "author": "William Shakespeare",
    "year": "1599",
    "ySort": 1599.2,
    "form": "drama",
    "era": "early-modern",
    "hue": 355,
    "sub": "tragedy",
    "blurb": "Et tu, Brute?",
    "themes": [
      "conspiracy",
      "rhetoric",
      "tyranny"
    ],
    "shelves": [
      "shakespeare-tragedy",
      "on-power"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "as-you-like-it",
    "title": "As You Like It",
    "author": "William Shakespeare",
    "year": "c. 1599",
    "ySort": 1599.3,
    "form": "drama",
    "era": "early-modern",
    "hue": 150,
    "sub": "comedy",
    "blurb": "All the world's a stage.",
    "themes": [
      "pastoral",
      "disguise",
      "love"
    ],
    "shelves": [
      "shakespeare-comedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "henry-iv-part-2",
    "title": "Henry IV, Part 2",
    "author": "William Shakespeare",
    "year": "c. 1599",
    "ySort": 1599.4,
    "form": "drama",
    "era": "early-modern",
    "hue": 355,
    "sub": "history",
    "blurb": "Falstaff, and the price of becoming king.",
    "themes": [
      "fathers",
      "kingship",
      "rejection"
    ],
    "shelves": [
      "shakespeare-history"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "merry-wives-of-windsor",
    "title": "The Merry Wives of Windsor",
    "author": "William Shakespeare",
    "year": "c. 1602",
    "ySort": 1602,
    "form": "drama",
    "era": "early-modern",
    "hue": 150,
    "sub": "comedy",
    "blurb": "Falstaff tries to seduce two women; both notice.",
    "themes": [
      "scheming",
      "farce",
      "jealousy"
    ],
    "shelves": [
      "shakespeare-comedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "hamlet",
    "title": "Hamlet",
    "author": "William Shakespeare",
    "year": "1600",
    "ySort": 1600,
    "form": "drama",
    "era": "early-modern",
    "hue": 265,
    "sub": "tragedy",
    "blurb": "A ghost, a prince, the great deferral.",
    "themes": [
      "revenge",
      "melancholy",
      "mortality"
    ],
    "shelves": [
      "shakespeare-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ],
    "status": "finished",
    "finishedOn": "2026-03-14"
  },
  {
    "id": "twelfth-night",
    "title": "Twelfth Night",
    "author": "William Shakespeare",
    "year": "c. 1601",
    "ySort": 1601,
    "form": "drama",
    "era": "early-modern",
    "hue": 150,
    "sub": "comedy",
    "blurb": "Shipwreck, cross-dressing, love at all the wrong angles.",
    "themes": [
      "disguise",
      "longing",
      "folly"
    ],
    "shelves": [
      "shakespeare-comedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "othello",
    "title": "Othello",
    "author": "William Shakespeare",
    "year": "c. 1603",
    "ySort": 1603,
    "form": "drama",
    "era": "early-modern",
    "hue": 355,
    "sub": "tragedy",
    "blurb": "Iago whispers; a great man unravels.",
    "themes": [
      "jealousy",
      "race",
      "manipulation"
    ],
    "shelves": [
      "shakespeare-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "measure-for-measure",
    "title": "Measure for Measure",
    "author": "William Shakespeare",
    "year": "c. 1604",
    "ySort": 1604,
    "form": "drama",
    "era": "early-modern",
    "hue": 265,
    "sub": "comedy",
    "blurb": "A problem play about a problem deputy.",
    "themes": [
      "mercy",
      "law",
      "hypocrisy"
    ],
    "shelves": [
      "shakespeare-comedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "king-lear",
    "title": "King Lear",
    "author": "William Shakespeare",
    "year": "c. 1606",
    "ySort": 1606,
    "form": "drama",
    "era": "early-modern",
    "hue": 265,
    "sub": "tragedy",
    "blurb": "Divide the kingdom, lose your mind.",
    "themes": [
      "old-age",
      "folly",
      "nothing"
    ],
    "shelves": [
      "shakespeare-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "macbeth",
    "title": "Macbeth",
    "author": "William Shakespeare",
    "year": "1606",
    "ySort": 1606.1,
    "form": "drama",
    "era": "early-modern",
    "hue": 355,
    "sub": "tragedy",
    "blurb": "Three witches, an ambitious wife, a tomorrow and tomorrow.",
    "themes": [
      "ambition",
      "prophecy",
      "guilt"
    ],
    "shelves": [
      "shakespeare-tragedy",
      "on-power"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "antony-and-cleopatra",
    "title": "Antony and Cleopatra",
    "author": "William Shakespeare",
    "year": "c. 1607",
    "ySort": 1607,
    "form": "drama",
    "era": "early-modern",
    "hue": 355,
    "sub": "tragedy",
    "blurb": "Two empires, two egos, one Nile.",
    "themes": [
      "love",
      "politics",
      "grandeur"
    ],
    "shelves": [
      "shakespeare-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "coriolanus",
    "title": "Coriolanus",
    "author": "William Shakespeare",
    "year": "c. 1608",
    "ySort": 1608,
    "form": "drama",
    "era": "early-modern",
    "hue": 355,
    "sub": "tragedy",
    "blurb": "A warrior who cannot bow to the crowd.",
    "themes": [
      "pride",
      "populism",
      "exile"
    ],
    "shelves": [
      "shakespeare-tragedy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "winters-tale",
    "title": "The Winter's Tale",
    "author": "William Shakespeare",
    "year": "c. 1611",
    "ySort": 1611,
    "form": "drama",
    "era": "early-modern",
    "hue": 265,
    "sub": "romance",
    "blurb": "Jealousy, sixteen years, a statue that breathes.",
    "themes": [
      "jealousy",
      "time",
      "reunion"
    ],
    "shelves": [
      "shakespeare-romance"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "the-tempest",
    "title": "The Tempest",
    "author": "William Shakespeare",
    "year": "1611",
    "ySort": 1611.1,
    "form": "drama",
    "era": "early-modern",
    "hue": 200,
    "sub": "romance",
    "blurb": "A magician on an island, settling accounts.",
    "themes": [
      "magic",
      "forgiveness",
      "colonialism"
    ],
    "shelves": [
      "shakespeare-romance"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "cymbeline",
    "title": "Cymbeline",
    "author": "William Shakespeare",
    "year": "c. 1611",
    "ySort": 1611.2,
    "form": "drama",
    "era": "early-modern",
    "hue": 200,
    "sub": "romance",
    "blurb": "A late romance with everything in it.",
    "themes": [
      "jealousy",
      "reunion",
      "disguise"
    ],
    "shelves": [
      "shakespeare-romance"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "descartes-meditations",
    "title": "Meditations on First Philosophy",
    "author": "René Descartes",
    "year": "1641",
    "ySort": 1641,
    "form": "philosophy",
    "era": "early-modern",
    "hue": 215,
    "blurb": "How to doubt everything, and then put a little back.",
    "themes": [
      "doubt",
      "mind",
      "god"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "paradise-lost",
    "title": "Paradise Lost",
    "author": "John Milton",
    "year": "1667",
    "ySort": 1667,
    "form": "epic",
    "era": "early-modern",
    "hue": 265,
    "blurb": "The fall, in twelve books of blank verse.",
    "themes": [
      "fall",
      "rebellion",
      "providence"
    ],
    "shelves": [
      "sacred-epics",
      "christian-tradition"
    ],
    "progress": 0.67,
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "candide",
    "title": "Candide",
    "author": "Voltaire",
    "year": "1759",
    "ySort": 1759,
    "form": "novel",
    "era": "early-modern",
    "hue": 35,
    "blurb": "A young optimist tours the worst of all possible worlds.",
    "themes": [
      "satire",
      "optimism",
      "tour"
    ],
    "shelves": [
      "satirical-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "discourse-on-inequality",
    "title": "Discourse on the Origin of Inequality",
    "author": "Jean-Jacques Rousseau",
    "year": "1755",
    "ySort": 1755,
    "form": "political",
    "era": "early-modern",
    "hue": 150,
    "blurb": "How property invented inequality, in two essays.",
    "themes": [
      "property",
      "origins",
      "civilization"
    ],
    "shelves": [
      "on-liberty"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "social-contract",
    "title": "The Social Contract",
    "author": "Jean-Jacques Rousseau",
    "year": "1762",
    "ySort": 1762,
    "form": "political",
    "era": "early-modern",
    "hue": 150,
    "blurb": "Born free; everywhere in chains.",
    "themes": [
      "general-will",
      "sovereignty",
      "liberty"
    ],
    "shelves": [
      "on-the-state"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "vindication-rights-of-woman",
    "title": "A Vindication of the Rights of Woman",
    "author": "Mary Wollstonecraft",
    "year": "1792",
    "ySort": 1792,
    "form": "political",
    "era": "early-modern",
    "hue": 310,
    "blurb": "The case for educating women, made when it still had to be made.",
    "themes": [
      "rights",
      "education",
      "equality"
    ],
    "shelves": [
      "on-liberty"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "us-founding-documents",
    "title": "The US Founding Documents",
    "author": "Jefferson, Madison, Adams, et al.",
    "year": "1776–1791",
    "ySort": 1776,
    "form": "history",
    "era": "early-modern",
    "hue": 90,
    "blurb": "Declaration, Constitution, Bill of Rights — bundled.",
    "themes": [
      "liberty",
      "federalism",
      "rights"
    ],
    "shelves": [
      "founding-docs"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "federalist-papers",
    "title": "The Federalist Papers",
    "author": "Hamilton, Madison, Jay",
    "year": "1788",
    "ySort": 1788,
    "form": "political",
    "era": "early-modern",
    "hue": 215,
    "blurb": "85 essays defending a new constitution, published under \"Publius.\"",
    "themes": [
      "federalism",
      "faction",
      "ratification"
    ],
    "shelves": [
      "founding-docs",
      "on-the-state"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "faust-part-1",
    "title": "Faust, Part One",
    "author": "Johann Wolfgang von Goethe",
    "year": "1808",
    "ySort": 1808,
    "form": "drama",
    "era": "modern",
    "hue": 265,
    "sub": "tragedy",
    "blurb": "A scholar bargains his soul; results immediately complicate.",
    "themes": [
      "knowledge",
      "bargain",
      "damnation"
    ],
    "shelves": [
      "modern-drama"
    ],
    "langs": [
      "EN",
      "DA"
    ],
    "progress": 0.22,
    "paused": true
  },
  {
    "id": "pride-and-prejudice",
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "year": "1813",
    "ySort": 1813,
    "form": "novel",
    "era": "modern",
    "hue": 310,
    "blurb": "A truth universally acknowledged.",
    "themes": [
      "marriage",
      "class",
      "irony"
    ],
    "shelves": [
      "english-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ],
    "status": "finished",
    "finishedOn": "2026-01-22"
  },
  {
    "id": "frankenstein",
    "title": "Frankenstein",
    "author": "Mary Shelley",
    "year": "1818",
    "ySort": 1818,
    "form": "novel",
    "era": "modern",
    "hue": 150,
    "blurb": "The first science-fiction novel, written at nineteen.",
    "themes": [
      "creation",
      "responsibility",
      "monstrosity"
    ],
    "shelves": [
      "english-novels",
      "gothic-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "democracy-in-america",
    "title": "Democracy in America",
    "author": "Alexis de Tocqueville",
    "year": "1835",
    "ySort": 1835,
    "form": "political",
    "era": "modern",
    "hue": 215,
    "blurb": "A Frenchman tours America and figures out the future.",
    "themes": [
      "democracy",
      "equality",
      "associations"
    ],
    "shelves": [
      "on-the-state"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "fear-and-trembling",
    "title": "Fear and Trembling",
    "author": "Søren Kierkegaard",
    "year": "1843",
    "ySort": 1843,
    "form": "philosophy",
    "era": "modern",
    "hue": 215,
    "blurb": "On Abraham, faith, and the things you can't explain.",
    "themes": [
      "faith",
      "sacrifice",
      "absurd"
    ],
    "shelves": [
      "christian-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "jane-eyre",
    "title": "Jane Eyre",
    "author": "Charlotte Brontë",
    "year": "1847",
    "ySort": 1847,
    "form": "novel",
    "era": "modern",
    "hue": 310,
    "blurb": "Reader, she narrated it herself.",
    "themes": [
      "governess",
      "independence",
      "gothic"
    ],
    "shelves": [
      "english-novels",
      "gothic-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "communist-manifesto",
    "title": "The Communist Manifesto",
    "author": "Karl Marx & Friedrich Engels",
    "year": "1848",
    "ySort": 1848,
    "form": "political",
    "era": "modern",
    "hue": 355,
    "blurb": "A specter is haunting Europe.",
    "themes": [
      "class",
      "revolution",
      "history"
    ],
    "shelves": [
      "on-power"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "moby-dick",
    "title": "Moby Dick",
    "author": "Herman Melville",
    "year": "1851",
    "ySort": 1851,
    "form": "novel",
    "era": "modern",
    "hue": 200,
    "blurb": "Call me Ishmael. The rest is the whale.",
    "themes": [
      "obsession",
      "sea",
      "symbol"
    ],
    "shelves": [
      "american-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "walden",
    "title": "Walden",
    "author": "Henry David Thoreau",
    "year": "1854",
    "ySort": 1854,
    "form": "philosophy",
    "era": "modern",
    "hue": 150,
    "blurb": "Two years in a cabin, and notes on what was simplified out.",
    "themes": [
      "nature",
      "solitude",
      "self-reliance"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "on-liberty",
    "title": "On Liberty",
    "author": "John Stuart Mill",
    "year": "1859",
    "ySort": 1859,
    "form": "political",
    "era": "modern",
    "hue": 90,
    "blurb": "Where one person's freedom ends — and why it must end there.",
    "themes": [
      "liberty",
      "harm",
      "opinion"
    ],
    "shelves": [
      "on-liberty"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "great-expectations",
    "title": "Great Expectations",
    "author": "Charles Dickens",
    "year": "1861",
    "ySort": 1861,
    "form": "novel",
    "era": "modern",
    "hue": 25,
    "blurb": "A blacksmith's boy, a strange benefactor, a London education.",
    "themes": [
      "class",
      "identity",
      "expectation"
    ],
    "shelves": [
      "english-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "utilitarianism",
    "title": "Utilitarianism",
    "author": "John Stuart Mill",
    "year": "1861",
    "ySort": 1861.1,
    "form": "philosophy",
    "era": "modern",
    "hue": 90,
    "blurb": "Pleasure, pain, and how to add them up.",
    "themes": [
      "ethics",
      "utility",
      "justice"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "notes-from-underground",
    "title": "Notes from Underground",
    "author": "Fyodor Dostoevsky",
    "year": "1864",
    "ySort": 1864,
    "form": "novel",
    "era": "modern",
    "hue": 25,
    "blurb": "I am a sick man — a spiteful man.",
    "themes": [
      "alienation",
      "spite",
      "consciousness"
    ],
    "shelves": [
      "russian-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "crime-and-punishment",
    "title": "Crime and Punishment",
    "author": "Fyodor Dostoevsky",
    "year": "1866",
    "ySort": 1866,
    "form": "novel",
    "era": "modern",
    "hue": 355,
    "blurb": "A student commits a murder, then has to live with it.",
    "themes": [
      "guilt",
      "poverty",
      "redemption"
    ],
    "shelves": [
      "russian-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ],
    "status": "finished",
    "finishedOn": "2024-12-04"
  },
  {
    "id": "war-and-peace",
    "title": "War and Peace",
    "author": "Leo Tolstoy",
    "year": "1869",
    "ySort": 1869,
    "form": "novel",
    "era": "modern",
    "hue": 25,
    "blurb": "Napoleon comes to Russia. So do five hundred other people.",
    "themes": [
      "war",
      "family",
      "history"
    ],
    "shelves": [
      "russian-novels",
      "on-war"
    ],
    "langs": [
      "EN",
      "DA"
    ],
    "status": "finished",
    "finishedOn": "2025-09-08"
  },
  {
    "id": "around-the-world-80-days",
    "title": "Around the World in Eighty Days",
    "author": "Jules Verne",
    "year": "1873",
    "ySort": 1873,
    "form": "children",
    "era": "modern",
    "hue": 60,
    "blurb": "Phileas Fogg bets the club; the clock starts.",
    "themes": [
      "adventure",
      "wager",
      "travel"
    ],
    "shelves": [
      "childrens-classics"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "niels-lyhne",
    "title": "Niels Lyhne",
    "author": "J.P. Jacobsen",
    "year": "1880",
    "ySort": 1880.1,
    "form": "novel",
    "era": "modern",
    "hue": 265,
    "blurb": "A Danish atheist dreams, loses, and dies. Rilke loved it.",
    "themes": [
      "atheism",
      "melancholy",
      "denmark"
    ],
    "shelves": [
      "nordic-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "brothers-karamazov",
    "title": "The Brothers Karamazov",
    "author": "Fyodor Dostoevsky",
    "year": "1880",
    "ySort": 1880,
    "form": "novel",
    "era": "modern",
    "hue": 355,
    "blurb": "Three brothers, one father, one murder, and God on trial.",
    "themes": [
      "faith",
      "doubt",
      "family"
    ],
    "shelves": [
      "russian-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ],
    "status": "finished",
    "finishedOn": "2025-11-30"
  },
  {
    "id": "jekyll-and-hyde",
    "title": "Strange Case of Dr Jekyll and Mr Hyde",
    "author": "Robert Louis Stevenson",
    "year": "1886",
    "ySort": 1886,
    "form": "novel",
    "era": "modern",
    "hue": 265,
    "blurb": "A respectable doctor, a chemical, a second self.",
    "themes": [
      "double",
      "vice",
      "victorian"
    ],
    "shelves": [
      "english-novels",
      "gothic-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "beyond-good-and-evil",
    "title": "Beyond Good and Evil",
    "author": "Friedrich Nietzsche",
    "year": "1886",
    "ySort": 1886.1,
    "form": "philosophy",
    "era": "modern",
    "hue": 35,
    "blurb": "A hammer, applied to morality.",
    "themes": [
      "will-to-power",
      "master-slave",
      "perspectivism"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "genealogy-of-morals",
    "title": "On the Genealogy of Morals",
    "author": "Friedrich Nietzsche",
    "year": "1887",
    "ySort": 1887,
    "form": "philosophy",
    "era": "modern",
    "hue": 35,
    "blurb": "Where our values came from, and who they served.",
    "themes": [
      "morality",
      "resentment",
      "asceticism"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "jungle-book",
    "title": "The Jungle Book",
    "author": "Rudyard Kipling",
    "year": "1894",
    "ySort": 1894,
    "form": "children",
    "era": "modern",
    "hue": 90,
    "blurb": "A boy raised by wolves; assorted other tales.",
    "themes": [
      "wild",
      "belonging",
      "law"
    ],
    "shelves": [
      "childrens-classics"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "the-awakening",
    "title": "The Awakening",
    "author": "Kate Chopin",
    "year": "1899",
    "ySort": 1899,
    "form": "novel",
    "era": "modern",
    "hue": 200,
    "blurb": "A woman in Louisiana realizes she's allowed to want.",
    "themes": [
      "desire",
      "autonomy",
      "sea"
    ],
    "shelves": [
      "american-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "heart-of-darkness",
    "title": "Heart of Darkness",
    "author": "Joseph Conrad",
    "year": "1899",
    "ySort": 1899.1,
    "form": "novel",
    "era": "modern",
    "hue": 25,
    "blurb": "A boat up the Congo, and what it found there.",
    "themes": [
      "empire",
      "horror",
      "journey"
    ],
    "shelves": [
      "english-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "jerusalem",
    "title": "Jerusalem",
    "author": "Selma Lagerlöf",
    "year": "1901",
    "ySort": 1901,
    "form": "novel",
    "era": "contemporary",
    "hue": 90,
    "blurb": "A Swedish village uprooted by faith, headed for the holy land.",
    "themes": [
      "faith",
      "migration",
      "community"
    ],
    "shelves": [
      "nordic-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "a-little-princess",
    "title": "A Little Princess",
    "author": "Frances Hodgson Burnett",
    "year": "1905",
    "ySort": 1905,
    "form": "children",
    "era": "contemporary",
    "hue": 310,
    "blurb": "A girl loses everything; her imagination keeps her warm.",
    "themes": [
      "imagination",
      "resilience",
      "school"
    ],
    "shelves": [
      "childrens-classics"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "ulysses",
    "title": "Ulysses",
    "author": "James Joyce",
    "year": "1922",
    "ySort": 1922,
    "form": "novel",
    "era": "contemporary",
    "hue": 25,
    "blurb": "One day in Dublin, told several different ways.",
    "themes": [
      "stream-of-consciousness",
      "dublin",
      "myth"
    ],
    "shelves": [
      "modernist-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "don-quixote",
    "title": "Don Quixote",
    "author": "Miguel de Cervantes",
    "year": "1605",
    "ySort": 1605,
    "form": "novel",
    "era": "early-modern",
    "hue": 35,
    "stub": true,
    "blurb": "A knight, a squire, a windmill. The first modern novel.",
    "themes": [
      "illusion",
      "chivalry",
      "madness"
    ],
    "shelves": [
      "satirical-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "essays-montaigne",
    "title": "Essays",
    "author": "Michel de Montaigne",
    "year": "1580",
    "ySort": 1580,
    "form": "philosophy",
    "era": "early-modern",
    "hue": 60,
    "stub": true,
    "blurb": "The book that invented the essay — \"What do I know?\"",
    "themes": [
      "self",
      "skepticism",
      "custom"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "canterbury",
    "title": "The Canterbury Tales",
    "author": "Geoffrey Chaucer",
    "year": "c. 1387",
    "ySort": 1387,
    "form": "epic",
    "era": "medieval",
    "hue": 200,
    "stub": true,
    "blurb": "Pilgrims, stories, the first masterpiece of English verse.",
    "themes": [
      "pilgrimage",
      "satire",
      "middle-english"
    ],
    "shelves": [
      "medieval-epics"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "summa",
    "title": "Summa Theologica",
    "author": "Thomas Aquinas",
    "year": "c. 1265",
    "ySort": 1265,
    "form": "philosophy",
    "era": "medieval",
    "hue": 230,
    "stub": true,
    "blurb": "The synthesis of Aristotle and Christian theology, in 3,000 articles.",
    "themes": [
      "scholasticism",
      "god",
      "virtue"
    ],
    "shelves": [
      "christian-philosophy",
      "christian-tradition"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "city-of-god",
    "title": "The City of God",
    "author": "Augustine",
    "year": "426",
    "ySort": 426,
    "form": "philosophy",
    "era": "antiquity",
    "hue": 25,
    "stub": true,
    "blurb": "Two cities, earthly and heavenly, after Rome was sacked.",
    "themes": [
      "providence",
      "two-cities",
      "rome"
    ],
    "shelves": [
      "christian-philosophy",
      "christian-tradition",
      "on-the-state"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "anna-karenina",
    "title": "Anna Karenina",
    "author": "Leo Tolstoy",
    "year": "1877",
    "ySort": 1877,
    "form": "novel",
    "era": "modern",
    "hue": 25,
    "stub": true,
    "blurb": "All happy families are alike.",
    "themes": [
      "marriage",
      "adultery",
      "grace"
    ],
    "shelves": [
      "russian-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "to-the-lighthouse",
    "title": "To the Lighthouse",
    "author": "Virginia Woolf",
    "year": "1927",
    "ySort": 1927,
    "form": "novel",
    "era": "contemporary",
    "hue": 200,
    "stub": true,
    "blurb": "A summer house, a postponed trip, time itself as the protagonist.",
    "themes": [
      "time",
      "perception",
      "family"
    ],
    "shelves": [
      "modernist-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "hume-enquiry",
    "title": "An Enquiry Concerning Human Understanding",
    "author": "David Hume",
    "year": "1748",
    "ySort": 1748,
    "form": "philosophy",
    "era": "early-modern",
    "hue": 215,
    "blurb": "A devastating empiricism, written to be readable.",
    "themes": [
      "causation",
      "induction",
      "skepticism"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "groundwork-kant",
    "title": "Groundwork of the Metaphysics of Morals",
    "author": "Immanuel Kant",
    "year": "1785",
    "ySort": 1785,
    "form": "philosophy",
    "era": "early-modern",
    "hue": 215,
    "stub": true,
    "blurb": "The categorical imperative, and the foundation of modern ethics.",
    "themes": [
      "duty",
      "autonomy",
      "reason"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "wealth-of-nations",
    "title": "The Wealth of Nations",
    "author": "Adam Smith",
    "year": "1776",
    "ySort": 1776.5,
    "form": "political",
    "era": "early-modern",
    "hue": 90,
    "blurb": "The invisible hand of the market, in five long books.",
    "themes": [
      "markets",
      "division-of-labor",
      "liberty"
    ],
    "shelves": [
      "on-the-state",
      "on-liberty"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "phenomenology",
    "title": "Phenomenology of Spirit",
    "author": "G.W.F. Hegel",
    "year": "1807",
    "ySort": 1807,
    "form": "philosophy",
    "era": "modern",
    "hue": 215,
    "stub": true,
    "blurb": "The dialectical journey of Spirit through history. Bring a friend.",
    "themes": [
      "dialectic",
      "consciousness",
      "history"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "civilization-freud",
    "title": "Civilization and Its Discontents",
    "author": "Sigmund Freud",
    "year": "1930",
    "ySort": 1930,
    "form": "philosophy",
    "era": "contemporary",
    "hue": 90,
    "stub": true,
    "blurb": "The cost of being civilized, on the analyst's couch.",
    "themes": [
      "repression",
      "eros",
      "death-drive"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "investigations",
    "title": "Philosophical Investigations",
    "author": "Ludwig Wittgenstein",
    "year": "1953",
    "ySort": 1953,
    "form": "philosophy",
    "era": "contemporary",
    "hue": 215,
    "stub": true,
    "blurb": "Language games, family resemblances, the later Wittgenstein.",
    "themes": [
      "language",
      "meaning",
      "use"
    ],
    "shelves": [
      "modern-philosophy"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "second-sex",
    "title": "The Second Sex",
    "author": "Simone de Beauvoir",
    "year": "1949",
    "ySort": 1949,
    "form": "political",
    "era": "contemporary",
    "hue": 310,
    "stub": true,
    "blurb": "One is not born, but rather becomes, a woman.",
    "themes": [
      "gender",
      "existence",
      "liberation"
    ],
    "shelves": [
      "on-liberty"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "1984",
    "title": "1984",
    "author": "George Orwell",
    "year": "1949",
    "ySort": 1949.1,
    "form": "novel",
    "era": "contemporary",
    "hue": 355,
    "stub": true,
    "blurb": "Big Brother is watching, and the language is shrinking.",
    "themes": [
      "totalitarianism",
      "language",
      "memory"
    ],
    "shelves": [
      "modernist-novels",
      "on-power"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "trial-kafka",
    "title": "The Trial",
    "author": "Franz Kafka",
    "year": "1925",
    "ySort": 1925,
    "form": "novel",
    "era": "contemporary",
    "hue": 25,
    "stub": true,
    "blurb": "Someone must have slandered Josef K.; one morning, without cause, he was arrested.",
    "themes": [
      "bureaucracy",
      "guilt",
      "absurd"
    ],
    "shelves": [
      "modernist-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "waiting-godot",
    "title": "Waiting for Godot",
    "author": "Samuel Beckett",
    "year": "1953",
    "ySort": 1953.1,
    "form": "drama",
    "era": "contemporary",
    "hue": 90,
    "stub": true,
    "blurb": "Two men, a tree, an appointment that never quite arrives.",
    "themes": [
      "absurd",
      "waiting",
      "futility"
    ],
    "shelves": [
      "modern-drama"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "beloved",
    "title": "Beloved",
    "author": "Toni Morrison",
    "year": "1987",
    "ySort": 1987,
    "form": "novel",
    "era": "contemporary",
    "hue": 305,
    "stub": true,
    "blurb": "A haunted house, a stolen child, the inheritance of slavery.",
    "themes": [
      "memory",
      "slavery",
      "motherhood"
    ],
    "shelves": [
      "american-novels"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  }
]

export const LIBRARY_SHELVES: Record<string, LibraryShelf> = {
  "plato": {
    "title": "Plato's Dialogues",
    "sub": "Six conversations around Socrates",
    "hue": 225
  },
  "aristotle": {
    "title": "Aristotle",
    "sub": "Ethics, politics, poetics",
    "hue": 90
  },
  "stoics": {
    "title": "The Stoics",
    "sub": "Epictetus and Marcus Aurelius",
    "hue": 25
  },
  "christian-philosophy": {
    "title": "Christian Tradition",
    "sub": "Augustine, à Kempis, Kierkegaard",
    "hue": 230
  },
  "modern-philosophy": {
    "title": "Modern Philosophy",
    "sub": "Descartes through Nietzsche",
    "hue": 215
  },
  "on-the-state": {
    "title": "On the State",
    "sub": "Constitutions, sovereignty, federalism",
    "hue": 90
  },
  "on-power": {
    "title": "On Power & Tyranny",
    "sub": "Machiavelli, Marx, and the dramatists",
    "hue": 355
  },
  "on-liberty": {
    "title": "On Liberty",
    "sub": "Rousseau, Wollstonecraft, Mill",
    "hue": 90
  },
  "founding-docs": {
    "title": "Founding Documents",
    "sub": "Magna Carta, US founding, Federalist",
    "hue": 90
  },
  "shakespeare-tragedy": {
    "title": "Shakespeare — Tragedies",
    "sub": "Hamlet, Lear, Othello, Macbeth & co.",
    "hue": 355
  },
  "shakespeare-comedy": {
    "title": "Shakespeare — Comedies",
    "sub": "Romances, farces, problem plays",
    "hue": 150
  },
  "shakespeare-history": {
    "title": "Shakespeare — Histories",
    "sub": "The English chronicle plays",
    "hue": 265
  },
  "shakespeare-romance": {
    "title": "Shakespeare — Romances",
    "sub": "The late, strange plays",
    "hue": 200
  },
  "greek-tragedy": {
    "title": "Greek Tragedy",
    "sub": "Aeschylus, Sophocles, Euripides",
    "hue": 300
  },
  "modern-drama": {
    "title": "Modern Drama",
    "sub": "Goethe's Faust",
    "hue": 265
  },
  "russian-novels": {
    "title": "The Russians",
    "sub": "Dostoevsky and Tolstoy",
    "hue": 355
  },
  "english-novels": {
    "title": "19th-Century English Novels",
    "sub": "Austen to Conrad",
    "hue": 265
  },
  "american-novels": {
    "title": "American Novels",
    "sub": "Melville and Chopin",
    "hue": 200
  },
  "modernist-novels": {
    "title": "Modernism",
    "sub": "A new century, a new sentence",
    "hue": 25
  },
  "nordic-novels": {
    "title": "Nordic Novels",
    "sub": "Jacobsen and Lagerlöf",
    "hue": 90
  },
  "gothic-novels": {
    "title": "The Gothic",
    "sub": "Doubles, monsters, dark houses",
    "hue": 265
  },
  "satirical-novels": {
    "title": "Satire",
    "sub": "Voltaire and the philosophical tale",
    "hue": 35
  },
  "ancient-epics": {
    "title": "Ancient Epics",
    "sub": "Gilgamesh, Homer, Virgil",
    "hue": 35
  },
  "sacred-epics": {
    "title": "Sacred Epics",
    "sub": "Dante and Milton",
    "hue": 265
  },
  "medieval-epics": {
    "title": "Medieval Epics",
    "sub": "Beowulf",
    "hue": 200
  },
  "bible-and-devotion": {
    "title": "Bible & Devotion",
    "sub": "Scripture, and the books read alongside it",
    "hue": 230
  },
  "christian-tradition": {
    "title": "The Christian Tradition",
    "sub": "Cross-shelf: scripture, devotion, and sacred poetry",
    "hue": 25
  },
  "ancient-history": {
    "title": "Ancient History",
    "sub": "The first historians",
    "hue": 60
  },
  "on-war": {
    "title": "On War",
    "sub": "A cross-shelf, from Sun Tzu to Tolstoy",
    "hue": 355
  },
  "strategy": {
    "title": "Strategy",
    "sub": "The art of conflict",
    "hue": 35
  },
  "childrens-classics": {
    "title": "Children's Classics",
    "sub": "Books that grew up readers",
    "hue": 310
  }
}

export const LIBRARY_HOUSES: LibraryHouse[] = [
  {
    "id": "philosophy",
    "title": "Philosophy",
    "sub": "What is real, how to live",
    "hue": 215,
    "shelves": [
      "plato",
      "aristotle",
      "stoics",
      "christian-philosophy",
      "modern-philosophy"
    ]
  },
  {
    "id": "politics",
    "title": "Politics & The State",
    "sub": "Power, liberty, foundations",
    "hue": 90,
    "shelves": [
      "on-the-state",
      "on-power",
      "on-liberty",
      "founding-docs"
    ]
  },
  {
    "id": "drama",
    "title": "Drama",
    "sub": "The plays, in four Shakespearean modes and a Greek tradition",
    "hue": 265,
    "shelves": [
      "shakespeare-tragedy",
      "shakespeare-comedy",
      "shakespeare-history",
      "shakespeare-romance",
      "greek-tragedy",
      "modern-drama"
    ]
  },
  {
    "id": "novel",
    "title": "Novels",
    "sub": "Long-form prose, by tradition",
    "hue": 25,
    "shelves": [
      "russian-novels",
      "english-novels",
      "american-novels",
      "modernist-novels",
      "nordic-novels",
      "gothic-novels",
      "satirical-novels"
    ]
  },
  {
    "id": "epic",
    "title": "Poetry & Epic",
    "sub": "From Gilgamesh to Milton",
    "hue": 35,
    "shelves": [
      "ancient-epics",
      "sacred-epics",
      "medieval-epics"
    ]
  },
  {
    "id": "scripture",
    "title": "Scripture & Devotion",
    "sub": "Sacred texts and contemplatives",
    "hue": 230,
    "shelves": [
      "bible-and-devotion",
      "christian-tradition"
    ]
  },
  {
    "id": "history",
    "title": "History",
    "sub": "The first historians",
    "hue": 60,
    "shelves": [
      "ancient-history"
    ]
  },
  {
    "id": "strategy",
    "title": "War & Strategy",
    "sub": "The art of conflict, and its history",
    "hue": 355,
    "shelves": [
      "on-war",
      "strategy"
    ]
  },
  {
    "id": "young",
    "title": "For Younger Readers",
    "sub": "Classics that grew up readers",
    "hue": 310,
    "shelves": [
      "childrens-classics"
    ]
  }
]

export const LIBRARY_FORMS = [
  {
    "id": "all",
    "label": "All"
  },
  {
    "id": "drama",
    "label": "Drama"
  },
  {
    "id": "novel",
    "label": "Novels"
  },
  {
    "id": "epic",
    "label": "Epic & poetry"
  },
  {
    "id": "philosophy",
    "label": "Philosophy"
  },
  {
    "id": "political",
    "label": "Political"
  },
  {
    "id": "history",
    "label": "History"
  },
  {
    "id": "scripture",
    "label": "Scripture"
  },
  {
    "id": "children",
    "label": "Children"
  },
  {
    "id": "strategy",
    "label": "Strategy"
  }
] as const

export const LIBRARY_ERAS = {
  "antiquity": {
    "id": "antiquity",
    "label": "Antiquity",
    "range": "before 500 AD"
  },
  "medieval": {
    "id": "medieval",
    "label": "Medieval",
    "range": "500 – 1500"
  },
  "early-modern": {
    "id": "early-modern",
    "label": "Early Modern",
    "range": "1500 – 1800"
  },
  "modern": {
    "id": "modern",
    "label": "19th Century",
    "range": "1800 – 1900"
  },
  "contemporary": {
    "id": "contemporary",
    "label": "20th Century & Beyond",
    "range": "1900 –"
  }
} as const

export const LIBRARY_READING_LISTS: LibraryReadingList[] = [
  {
    "id": "yale-ds",
    "title": "Yale Directed Studies",
    "source": "Yale College",
    "description": "A first-year humanities intensive: three parallel year-long tracks — Literature, Philosophy, Historical & Political Thought — read concurrently. Condensed here to their common spine.",
    "accent": 220,
    "computed": false,
    "sequence": [
      {
        "id": "iliad"
      },
      {
        "id": "odyssey"
      },
      {
        "id": "the-histories",
        "note": "selections"
      },
      {
        "id": "peloponnesian-war",
        "note": "selections"
      },
      {
        "id": "oresteia"
      },
      {
        "id": "oedipus-rex"
      },
      {
        "id": "antigone"
      },
      {
        "id": "bacchae"
      },
      {
        "id": "medea"
      },
      {
        "missing": true,
        "title": "Clouds / Lysistrata",
        "author": "Aristophanes"
      },
      {
        "id": "apology"
      },
      {
        "id": "crito"
      },
      {
        "id": "phaedo"
      },
      {
        "id": "symposium"
      },
      {
        "id": "the-republic"
      },
      {
        "id": "nicomachean-ethics"
      },
      {
        "id": "aristotle-politics"
      },
      {
        "id": "poetics"
      },
      {
        "id": "bible",
        "note": "Hebrew Bible + New Testament selections"
      },
      {
        "id": "the-aeneid"
      },
      {
        "id": "confessions"
      },
      {
        "id": "city-of-god"
      },
      {
        "missing": true,
        "title": "Summa Theologica (selections)",
        "author": "Thomas Aquinas",
        "note": "stub coming — selections only"
      },
      {
        "id": "summa"
      },
      {
        "id": "divine-comedy",
        "note": "Inferno taught in full"
      },
      {
        "id": "essays-montaigne"
      },
      {
        "id": "the-prince"
      },
      {
        "id": "hamlet"
      },
      {
        "id": "the-tempest"
      },
      {
        "id": "don-quixote"
      },
      {
        "id": "descartes-meditations"
      },
      {
        "id": "leviathan"
      },
      {
        "id": "second-treatise"
      },
      {
        "id": "paradise-lost"
      },
      {
        "id": "hume-enquiry"
      },
      {
        "id": "discourse-on-inequality"
      },
      {
        "id": "social-contract"
      },
      {
        "id": "wealth-of-nations"
      },
      {
        "id": "groundwork-kant"
      },
      {
        "id": "federalist-papers"
      },
      {
        "id": "faust-part-1"
      },
      {
        "id": "phenomenology"
      },
      {
        "id": "pride-and-prejudice"
      },
      {
        "id": "democracy-in-america"
      },
      {
        "id": "on-liberty"
      },
      {
        "id": "communist-manifesto"
      },
      {
        "id": "war-and-peace"
      },
      {
        "id": "brothers-karamazov"
      },
      {
        "id": "genealogy-of-morals"
      },
      {
        "id": "heart-of-darkness"
      },
      {
        "id": "ulysses"
      },
      {
        "id": "to-the-lighthouse"
      },
      {
        "id": "investigations"
      }
    ]
  },
  {
    "id": "columbia-core",
    "title": "Columbia Core Curriculum",
    "source": "Columbia College",
    "description": "Two famous required courses: Literature Humanities (Lit Hum) and Contemporary Civilization (CC). Combined here, in chronological reading order.",
    "accent": 25,
    "computed": false,
    "sequence": [
      {
        "id": "iliad"
      },
      {
        "id": "odyssey"
      },
      {
        "id": "oresteia"
      },
      {
        "id": "oedipus-rex"
      },
      {
        "id": "antigone"
      },
      {
        "id": "medea"
      },
      {
        "id": "symposium"
      },
      {
        "id": "the-republic"
      },
      {
        "id": "nicomachean-ethics"
      },
      {
        "id": "aristotle-politics"
      },
      {
        "id": "bible",
        "note": "Hebrew Bible + New Testament selections"
      },
      {
        "id": "the-aeneid"
      },
      {
        "id": "confessions"
      },
      {
        "missing": true,
        "title": "Summa Theologica (selections)",
        "author": "Thomas Aquinas"
      },
      {
        "missing": true,
        "title": "Inferno (Divine Comedy)",
        "author": "Dante Alighieri",
        "note": "we have the full Comedy"
      },
      {
        "id": "divine-comedy"
      },
      {
        "missing": true,
        "title": "The Decameron",
        "author": "Boccaccio"
      },
      {
        "missing": true,
        "title": "Essays",
        "author": "Montaigne"
      },
      {
        "id": "the-prince"
      },
      {
        "missing": true,
        "title": "Don Quixote",
        "author": "Miguel de Cervantes"
      },
      {
        "id": "king-lear"
      },
      {
        "id": "leviathan"
      },
      {
        "id": "second-treatise"
      },
      {
        "id": "paradise-lost"
      },
      {
        "missing": true,
        "title": "Dialogues Concerning Natural Religion",
        "author": "David Hume"
      },
      {
        "id": "discourse-on-inequality"
      },
      {
        "id": "social-contract"
      },
      {
        "missing": true,
        "title": "The Wealth of Nations (selections)",
        "author": "Adam Smith"
      },
      {
        "missing": true,
        "title": "Groundwork of the Metaphysics of Morals",
        "author": "Immanuel Kant"
      },
      {
        "id": "pride-and-prejudice"
      },
      {
        "id": "democracy-in-america"
      },
      {
        "id": "on-liberty"
      },
      {
        "id": "communist-manifesto"
      },
      {
        "id": "crime-and-punishment"
      },
      {
        "id": "genealogy-of-morals"
      },
      {
        "missing": true,
        "title": "Civilization and Its Discontents",
        "author": "Sigmund Freud"
      },
      {
        "missing": true,
        "title": "To the Lighthouse",
        "author": "Virginia Woolf"
      },
      {
        "missing": true,
        "title": "The Second Sex (selections)",
        "author": "Simone de Beauvoir"
      },
      {
        "missing": true,
        "title": "Beloved",
        "author": "Toni Morrison"
      }
    ]
  },
  {
    "id": "st-johns",
    "title": "St. John's Great Books",
    "source": "St. John's College (Annapolis & Santa Fe)",
    "description": "A four-year, all-classics, no-textbooks curriculum. Students read works in chronological order across math, science, philosophy, literature, and history. Selected literary & philosophical entries shown here.",
    "accent": 90,
    "computed": false,
    "sequence": [
      {
        "id": "gilgamesh"
      },
      {
        "id": "iliad"
      },
      {
        "id": "odyssey"
      },
      {
        "id": "the-histories"
      },
      {
        "id": "peloponnesian-war"
      },
      {
        "id": "oresteia"
      },
      {
        "id": "oedipus-rex"
      },
      {
        "id": "oedipus-at-colonus"
      },
      {
        "id": "antigone"
      },
      {
        "id": "bacchae"
      },
      {
        "id": "medea"
      },
      {
        "missing": true,
        "title": "Clouds, Birds, Lysistrata",
        "author": "Aristophanes"
      },
      {
        "id": "apology"
      },
      {
        "id": "crito"
      },
      {
        "id": "phaedo"
      },
      {
        "id": "symposium"
      },
      {
        "id": "phaedrus"
      },
      {
        "id": "the-republic"
      },
      {
        "missing": true,
        "title": "Theaetetus, Meno, Gorgias, Timaeus",
        "author": "Plato"
      },
      {
        "id": "nicomachean-ethics"
      },
      {
        "id": "aristotle-politics"
      },
      {
        "id": "poetics"
      },
      {
        "missing": true,
        "title": "Metaphysics, Physics, De Anima",
        "author": "Aristotle"
      },
      {
        "missing": true,
        "title": "Elements",
        "author": "Euclid"
      },
      {
        "missing": true,
        "title": "On the Nature of Things",
        "author": "Lucretius"
      },
      {
        "missing": true,
        "title": "Lives",
        "author": "Plutarch"
      },
      {
        "id": "the-aeneid"
      },
      {
        "id": "bible"
      },
      {
        "id": "the-manual"
      },
      {
        "id": "meditations"
      },
      {
        "id": "confessions"
      },
      {
        "missing": true,
        "title": "City of God (selections)",
        "author": "Augustine"
      },
      {
        "missing": true,
        "title": "Consolation of Philosophy",
        "author": "Boethius"
      },
      {
        "missing": true,
        "title": "Summa Theologica (selections)",
        "author": "Thomas Aquinas"
      },
      {
        "id": "divine-comedy"
      },
      {
        "missing": true,
        "title": "Canterbury Tales",
        "author": "Geoffrey Chaucer"
      },
      {
        "id": "imitation-of-christ"
      },
      {
        "id": "the-prince"
      },
      {
        "missing": true,
        "title": "Essays",
        "author": "Montaigne"
      },
      {
        "missing": true,
        "title": "Don Quixote",
        "author": "Cervantes"
      },
      {
        "id": "hamlet"
      },
      {
        "id": "king-lear"
      },
      {
        "id": "macbeth"
      },
      {
        "id": "the-tempest"
      },
      {
        "id": "descartes-meditations"
      },
      {
        "id": "leviathan"
      },
      {
        "missing": true,
        "title": "Pensées",
        "author": "Pascal"
      },
      {
        "missing": true,
        "title": "Ethics",
        "author": "Spinoza"
      },
      {
        "id": "paradise-lost"
      },
      {
        "id": "second-treatise"
      },
      {
        "missing": true,
        "title": "Monadology, New Essays",
        "author": "Leibniz"
      },
      {
        "missing": true,
        "title": "Treatise of Human Nature",
        "author": "David Hume"
      },
      {
        "id": "discourse-on-inequality"
      },
      {
        "id": "social-contract"
      },
      {
        "missing": true,
        "title": "Wealth of Nations",
        "author": "Adam Smith"
      },
      {
        "missing": true,
        "title": "Critique of Pure Reason",
        "author": "Immanuel Kant"
      },
      {
        "id": "federalist-papers"
      },
      {
        "id": "faust-part-1"
      },
      {
        "missing": true,
        "title": "Phenomenology of Spirit",
        "author": "Hegel"
      },
      {
        "id": "democracy-in-america"
      },
      {
        "id": "communist-manifesto"
      },
      {
        "id": "war-and-peace"
      },
      {
        "id": "brothers-karamazov"
      },
      {
        "id": "beyond-good-and-evil"
      },
      {
        "id": "genealogy-of-morals"
      },
      {
        "missing": true,
        "title": "Civilization and Its Discontents",
        "author": "Sigmund Freud"
      },
      {
        "id": "ulysses"
      },
      {
        "missing": true,
        "title": "Being and Time (selections)",
        "author": "Martin Heidegger"
      }
    ]
  },
  {
    "id": "bloom-canon",
    "title": "Bloom's Western Canon",
    "source": "Harold Bloom, \"The Western Canon\" (1994)",
    "description": "Bloom's list of the 26 most essential authors of the Western tradition, anchored by Shakespeare. Below are the central works Bloom singles out, in chronological order of author.",
    "accent": 265,
    "computed": false,
    "sequence": [
      {
        "id": "iliad"
      },
      {
        "id": "odyssey"
      },
      {
        "id": "oresteia"
      },
      {
        "id": "oedipus-rex"
      },
      {
        "id": "antigone"
      },
      {
        "id": "bacchae"
      },
      {
        "id": "medea"
      },
      {
        "id": "the-republic"
      },
      {
        "id": "symposium"
      },
      {
        "id": "bible"
      },
      {
        "id": "the-aeneid"
      },
      {
        "id": "confessions"
      },
      {
        "id": "divine-comedy"
      },
      {
        "missing": true,
        "title": "Canterbury Tales",
        "author": "Geoffrey Chaucer"
      },
      {
        "missing": true,
        "title": "Essays",
        "author": "Montaigne"
      },
      {
        "missing": true,
        "title": "Don Quixote",
        "author": "Miguel de Cervantes"
      },
      {
        "id": "hamlet",
        "note": "Bloom's central text"
      },
      {
        "id": "king-lear"
      },
      {
        "id": "macbeth"
      },
      {
        "id": "othello"
      },
      {
        "id": "the-tempest"
      },
      {
        "id": "paradise-lost"
      },
      {
        "id": "faust-part-1"
      },
      {
        "missing": true,
        "title": "Lyrical Ballads / The Prelude",
        "author": "William Wordsworth"
      },
      {
        "id": "frankenstein"
      },
      {
        "id": "pride-and-prejudice"
      },
      {
        "id": "jane-eyre"
      },
      {
        "missing": true,
        "title": "Moby-Dick",
        "author": "Herman Melville",
        "note": "we have it"
      },
      {
        "id": "moby-dick"
      },
      {
        "id": "great-expectations"
      },
      {
        "missing": true,
        "title": "Leaves of Grass",
        "author": "Walt Whitman"
      },
      {
        "missing": true,
        "title": "Selected Poems",
        "author": "Emily Dickinson"
      },
      {
        "id": "war-and-peace"
      },
      {
        "id": "brothers-karamazov"
      },
      {
        "id": "beyond-good-and-evil"
      },
      {
        "missing": true,
        "title": "À la recherche du temps perdu",
        "author": "Marcel Proust"
      },
      {
        "missing": true,
        "title": "The Trial / The Castle",
        "author": "Franz Kafka"
      },
      {
        "id": "ulysses"
      },
      {
        "missing": true,
        "title": "To the Lighthouse",
        "author": "Virginia Woolf"
      },
      {
        "missing": true,
        "title": "Endgame / Waiting for Godot",
        "author": "Samuel Beckett"
      },
      {
        "missing": true,
        "title": "Ficciones",
        "author": "Jorge Luis Borges"
      }
    ]
  },
  {
    "id": "wem",
    "title": "The Well-Educated Mind",
    "source": "Susan Wise Bauer (2003 / rev. 2016)",
    "description": "A self-study program organized by genre — Novels, Autobiography, History, Drama, Poetry — read chronologically within each. The Novels list is shown here.",
    "accent": 310,
    "computed": false,
    "sequence": [
      {
        "missing": true,
        "title": "Don Quixote",
        "author": "Miguel de Cervantes"
      },
      {
        "missing": true,
        "title": "The Pilgrim's Progress",
        "author": "John Bunyan"
      },
      {
        "missing": true,
        "title": "Gulliver's Travels",
        "author": "Jonathan Swift"
      },
      {
        "id": "pride-and-prejudice"
      },
      {
        "missing": true,
        "title": "Oliver Twist",
        "author": "Charles Dickens"
      },
      {
        "id": "jane-eyre"
      },
      {
        "missing": true,
        "title": "The Scarlet Letter",
        "author": "Nathaniel Hawthorne"
      },
      {
        "id": "moby-dick"
      },
      {
        "missing": true,
        "title": "Madame Bovary",
        "author": "Gustave Flaubert"
      },
      {
        "id": "crime-and-punishment"
      },
      {
        "missing": true,
        "title": "Anna Karenina",
        "author": "Leo Tolstoy"
      },
      {
        "id": "brothers-karamazov"
      },
      {
        "missing": true,
        "title": "The Portrait of a Lady",
        "author": "Henry James"
      },
      {
        "missing": true,
        "title": "Huckleberry Finn",
        "author": "Mark Twain"
      },
      {
        "missing": true,
        "title": "The Red Badge of Courage",
        "author": "Stephen Crane"
      },
      {
        "id": "heart-of-darkness"
      },
      {
        "id": "the-awakening"
      },
      {
        "missing": true,
        "title": "The House of Mirth",
        "author": "Edith Wharton"
      },
      {
        "missing": true,
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald"
      },
      {
        "missing": true,
        "title": "Mrs. Dalloway",
        "author": "Virginia Woolf"
      },
      {
        "missing": true,
        "title": "The Trial",
        "author": "Franz Kafka"
      },
      {
        "missing": true,
        "title": "Native Son",
        "author": "Richard Wright"
      },
      {
        "missing": true,
        "title": "The Stranger",
        "author": "Albert Camus"
      },
      {
        "missing": true,
        "title": "1984",
        "author": "George Orwell"
      },
      {
        "missing": true,
        "title": "Invisible Man",
        "author": "Ralph Ellison"
      },
      {
        "missing": true,
        "title": "One Hundred Years of Solitude",
        "author": "Gabriel García Márquez"
      },
      {
        "missing": true,
        "title": "Beloved",
        "author": "Toni Morrison"
      }
    ]
  },
  {
    "id": "universal",
    "title": "The Universal Canon",
    "source": "Cross-shelf of the five canons above",
    "description": "A computed list: every book on three or more of the source canons. Where the curricula agree, the Western canon hardens. Sorted by how many of the five canons name it.",
    "accent": 75,
    "computed": true,
    "sequence": [
      {
        "id": "iliad",
        "note": "4× on the canons above"
      },
      {
        "id": "odyssey",
        "note": "4× on the canons above"
      },
      {
        "id": "oresteia",
        "note": "4× on the canons above"
      },
      {
        "id": "oedipus-rex",
        "note": "4× on the canons above"
      },
      {
        "id": "antigone",
        "note": "4× on the canons above"
      },
      {
        "id": "medea",
        "note": "4× on the canons above"
      },
      {
        "id": "symposium",
        "note": "4× on the canons above"
      },
      {
        "id": "the-republic",
        "note": "4× on the canons above"
      },
      {
        "id": "bible",
        "note": "4× on the canons above"
      },
      {
        "id": "the-aeneid",
        "note": "4× on the canons above"
      },
      {
        "id": "confessions",
        "note": "4× on the canons above"
      },
      {
        "id": "divine-comedy",
        "note": "4× on the canons above"
      },
      {
        "id": "paradise-lost",
        "note": "4× on the canons above"
      },
      {
        "id": "pride-and-prejudice",
        "note": "4× on the canons above"
      },
      {
        "id": "brothers-karamazov",
        "note": "4× on the canons above"
      },
      {
        "id": "bacchae",
        "note": "3× on the canons above"
      },
      {
        "id": "nicomachean-ethics",
        "note": "3× on the canons above"
      },
      {
        "id": "aristotle-politics",
        "note": "3× on the canons above"
      },
      {
        "id": "the-prince",
        "note": "3× on the canons above"
      },
      {
        "id": "hamlet",
        "note": "3× on the canons above"
      },
      {
        "id": "the-tempest",
        "note": "3× on the canons above"
      },
      {
        "id": "leviathan",
        "note": "3× on the canons above"
      },
      {
        "id": "second-treatise",
        "note": "3× on the canons above"
      },
      {
        "id": "discourse-on-inequality",
        "note": "3× on the canons above"
      },
      {
        "id": "social-contract",
        "note": "3× on the canons above"
      },
      {
        "id": "faust-part-1",
        "note": "3× on the canons above"
      },
      {
        "id": "democracy-in-america",
        "note": "3× on the canons above"
      },
      {
        "id": "communist-manifesto",
        "note": "3× on the canons above"
      },
      {
        "id": "war-and-peace",
        "note": "3× on the canons above"
      },
      {
        "id": "genealogy-of-morals",
        "note": "3× on the canons above"
      },
      {
        "id": "ulysses",
        "note": "3× on the canons above"
      },
      {
        "id": "king-lear",
        "note": "3× on the canons above"
      }
    ]
  }
]

export const LIBRARY_BOOK_META_BY_ID: Record<string, LibraryBookMeta> = Object.fromEntries(
  LIBRARY_BOOK_META.map(book => [book.id, book]),
)

export const LIBRARY_BOOK_LISTS: Record<string, LibraryListMembership[]> = {}
for (const list of LIBRARY_READING_LISTS) {
  list.sequence.forEach((entry, index) => {
    if (!entry.id) return
    LIBRARY_BOOK_LISTS[entry.id] ||= []
    LIBRARY_BOOK_LISTS[entry.id].push({
      listId: list.id,
      listTitle: list.title,
      position: index + 1,
      accent: list.accent,
    })
  })
}

export function getLibraryMeta(bookId: string): LibraryBookMeta | undefined {
  return LIBRARY_BOOK_META_BY_ID[bookId]
}

export function getBookDisplayYear(book: Book, meta?: LibraryBookMeta): string {
  if (meta?.year) return meta.year
  if (book.year === undefined) return ''
  return book.year < 0 ? 'c. ' + Math.abs(book.year) + ' BC' : String(book.year)
}
