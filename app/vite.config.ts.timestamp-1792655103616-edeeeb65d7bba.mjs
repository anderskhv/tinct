// src/data/bookRegistry.ts
var ODYSSEY = {
  id: "odyssey",
  title: "The Odyssey",
  author: "Homer",
  description: "The epic journey of Odysseus as he struggles to return home after the Trojan War. Monsters, gods, and the endurance of the human spirit across twenty years of wandering.",
  year: -800,
  wordCount: 13e4,
  coverColor: "#1a3a5c",
  coverAccent: "#c9a45c",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Butler (Prose, 1900)",
      translator: "Samuel Butler",
      year: 1900,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var ULYSSES = {
  id: "ulysses",
  title: "Ulysses",
  author: "James Joyce",
  description: "One day in Dublin, June 16, 1904. Leopold Bloom wanders through the city in a modern retelling of The Odyssey \u2014 stream of consciousness, parody, and the ordinary made extraordinary.",
  year: 1922,
  wordCount: 265e3,
  coverColor: "#2c1810",
  coverAccent: "#d4a843",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1922)",
      year: 1922,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var WAR_AND_PEACE = {
  id: "war-and-peace",
  title: "War and Peace",
  author: "Leo Tolstoy",
  description: "The sweeping epic of Russian society during the Napoleonic Wars. Five aristocratic families navigate love, death, and the search for meaning across battlefields and ballrooms.",
  year: 1869,
  wordCount: 561695,
  coverColor: "#3c1a1a",
  coverAccent: "#c9a45c",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Maude Translation (1922)",
      translator: "Aylmer & Louise Maude",
      year: 1922,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var BIBLE = {
  id: "bible",
  title: "The Bible",
  author: "Various",
  description: "The foundational text of Western civilization. 66 books (73 in the Catholic edition) spanning creation, law, history, poetry, prophecy, gospels, and revelation \u2014 the story of God and humanity across thousands of years.",
  year: -1400,
  wordCount: 783e3,
  coverColor: "#2a1a0e",
  coverAccent: "#d4a843",
  // BSB leads: it is the default for readers without their own saved Bible
  // edition. Bible editions are compared by verse, not paragraph index.
  editions: [
    {
      key: "bsb-en",
      language: "en",
      style: "bsb",
      label: "Berean Standard Bible",
      aligned: true,
      hasAudio: true
    },
    {
      key: "kjv-en",
      language: "en",
      style: "kjv",
      label: "King James Version (1611)",
      year: 1611,
      aligned: true,
      hasAudio: true
    },
    {
      key: "web-en",
      language: "en",
      style: "web",
      label: "World English Bible",
      year: 2e3,
      aligned: true,
      hasAudio: true
    },
    // The 73-book Catholic canon, in the Catholic order: Tobit, Judith,
    // 1-2 Maccabees, Wisdom, Sirach, Baruch and the Greek Esther and Daniel.
    // It shares the other editions' chapter numbers where it has the same
    // chapter (data/bibleEditionChapters.ts). Narration streams on demand.
    {
      key: "webc-en",
      language: "en",
      style: "web",
      label: "World English Bible, Catholic Edition",
      year: 2020,
      aligned: true,
      hasAudio: true
    }
  ]
};
var GILGAMESH = {
  id: "gilgamesh",
  title: "The Epic of Gilgamesh",
  author: "Anonymous",
  description: "The oldest surviving great work of literature. A king and a wild man become brothers, slay monsters, and defy the gods \u2014 then face the one enemy no mortal can defeat.",
  year: -2100,
  wordCount: 3e4,
  coverColor: "#4a3728",
  coverAccent: "#c9963a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Prose Compilation",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var HAMLET = {
  id: "hamlet",
  title: "Hamlet",
  author: "William Shakespeare",
  description: "A prince haunted by his father's ghost, paralyzed by doubt, driven toward revenge. The play that invented the modern mind \u2014 and the question that never stops: to be, or not to be.",
  year: 1600,
  wordCount: 3e4,
  coverColor: "#1a1a2e",
  coverAccent: "#8a7fb5",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original Text",
      aligned: true,
      hasAudio: true,
      hasVerseLines: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var MACBETH = {
  id: "macbeth",
  title: "Macbeth",
  author: "William Shakespeare",
  description: "A warrior seduced by prophecy and ambition murders his king \u2014 then watches his world unravel. Shakespeare's darkest, fastest tragedy: blood, guilt, and the wages of unchecked power.",
  year: 1606,
  wordCount: 17e3,
  coverColor: "#2a0a0a",
  coverAccent: "#b53a3a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original Text",
      aligned: true,
      hasAudio: true,
      hasVerseLines: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      // Paragraph structure differs from the repaired English editions (806 against 840).
      aligned: false,
      hasAudio: true
    }
  ]
};
var MIDSUMMER = {
  id: "midsummer",
  title: "A Midsummer Night's Dream",
  author: "William Shakespeare",
  description: "Lovers lost in an enchanted forest, fairies at war, and a weaver turned into a donkey. Shakespeare's most magical comedy \u2014 where love is ridiculous, wonderful, and completely out of anyone's control.",
  year: 1595,
  wordCount: 16e3,
  coverColor: "#0e2a1a",
  coverAccent: "#6abf8a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original Text",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var ROMEO_AND_JULIET = {
  id: "romeo-and-juliet",
  title: "Romeo and Juliet",
  author: "William Shakespeare",
  description: "Two teenagers fall in love across a blood feud and burn through five days that end in a tomb. The original star-crossed lovers \u2014 and the play that made tragedy feel like poetry.",
  year: 1597,
  wordCount: 25e3,
  coverColor: "#2e1020",
  coverAccent: "#d4667a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original Text",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var THE_TEMPEST = {
  id: "the-tempest",
  title: "The Tempest",
  author: "William Shakespeare",
  description: "A sorcerer on a remote island conjures a storm to shipwreck his enemies \u2014 then chooses mercy over revenge. Shakespeare's farewell to the stage: magic, forgiveness, and letting go.",
  year: 1611,
  wordCount: 17e3,
  coverColor: "#0e1a2e",
  coverAccent: "#5a9abf",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original Text",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var OTHELLO = {
  id: "othello",
  title: "Othello",
  author: "William Shakespeare",
  description: "A Moorish general in Venice, a trusted ensign who is nothing but malice, and a wife whose only crime is being innocent. Iago whispers jealousy into Othello's ear until he murders the woman he loves \u2014 Shakespeare's most claustrophobic and racially charged tragedy.",
  year: 1603,
  wordCount: 26e3,
  coverColor: "#1a0e0e",
  coverAccent: "#8a3a1f",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Shakespeare (1622)",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var KING_LEAR = {
  id: "king-lear",
  title: "King Lear",
  author: "William Shakespeare",
  description: "The aging king divides his kingdom among his daughters by how loudly they will say they love him. Cordelia refuses to play; her sisters lie. By the storm scene on the heath, Lear is mad and stripped of everything. The darkest and most pitiless of the four great tragedies.",
  year: 1606,
  wordCount: 28e3,
  coverColor: "#1f1015",
  coverAccent: "#a04050",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1608)", year: 1608, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: true }
  ]
};
var JULIUS_CAESAR = {
  id: "julius-caesar",
  title: "Julius Caesar",
  author: "William Shakespeare",
  description: "Brutus and Cassius lead the conspiracy. Caesar falls at the foot of Pompey's statue on the Ides of March. Then Antony walks to the body, asks to speak at the funeral, and turns the crowd with three words: friends, Romans, countrymen. The play that taught the West what rhetoric can do.",
  year: 1599,
  wordCount: 21e3,
  coverColor: "#1a2030",
  coverAccent: "#c0b070",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var TWELFTH_NIGHT = {
  id: "twelfth-night",
  title: "Twelfth Night",
  author: "William Shakespeare",
  description: "Viola is shipwrecked in Illyria, disguises herself as a boy, and ends up wooing Olivia for Duke Orsino \u2014 whom she falls for. Olivia falls for the disguise. Meanwhile Sir Toby and friends gull the steward Malvolio into believing his mistress loves him. Shakespeare's most perfectly balanced comedy.",
  year: 1601,
  wordCount: 21e3,
  coverColor: "#1a2a3a",
  coverAccent: "#e0c060",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: true }
  ]
};
var MERCHANT_OF_VENICE = {
  id: "merchant-of-venice",
  title: "The Merchant of Venice",
  author: "William Shakespeare",
  description: "Antonio guarantees his friend Bassanio's loan from the moneylender Shylock; the bond names a pound of Antonio's flesh as forfeit. Bassanio woos Portia, who shows up disguised as a lawyer to argue the trial. The most morally complicated comedy in the canon, still alive in every reading.",
  year: 1596,
  wordCount: 21e3,
  coverColor: "#2a1a0a",
  coverAccent: "#c89030",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1600)", year: 1600, aligned: true },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var MUCH_ADO_ABOUT_NOTHING = {
  id: "much-ado-about-nothing",
  title: "Much Ado About Nothing",
  author: "William Shakespeare",
  description: "Benedick and Beatrice trade insults so sharp their friends decide it must be love, and trick them into it. Meanwhile the villain Don John engineers the slander of Hero on the night of her wedding. Shakespeare's wittiest comedy \u2014 and a near-tragedy folded into it.",
  year: 1599,
  wordCount: 22e3,
  coverColor: "#2a1820",
  coverAccent: "#d090a0",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1600)", year: 1600, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var AS_YOU_LIKE_IT = {
  id: "as-you-like-it",
  title: "As You Like It",
  author: "William Shakespeare",
  description: `Rosalind, exiled from her uncle's court, escapes to the Forest of Arden disguised as a boy and meets the man she loves, who doesn't recognize her. The play that gave us "All the world's a stage" and the model of pastoral comedy.`,
  year: 1599,
  wordCount: 22e3,
  coverColor: "#1a2a1a",
  coverAccent: "#a0b070",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    // Chapter structure differs from the repaired English editions (17 chapters against 23).
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: false }
  ]
};
var TAMING_OF_THE_SHREW = {
  id: "taming-of-the-shrew",
  title: "The Taming of the Shrew",
  author: "William Shakespeare",
  description: "Petruchio comes to Padua to wive it wealthily and meets Katharina, the unmarriageable elder daughter of Baptista. He undertakes to tame her; she is more than his match. The comedy that has divided readers for four centuries.",
  year: 1592,
  wordCount: 22e3,
  coverColor: "#2a1a1a",
  coverAccent: "#d0a070",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: true }
  ]
};
var ANTONY_AND_CLEOPATRA = {
  id: "antony-and-cleopatra",
  title: "Antony and Cleopatra",
  author: "William Shakespeare",
  description: "Mark Antony, master of the eastern Roman world, loses everything to a love affair with the queen of Egypt. The most expansive of the tragedies \u2014 moving across the Mediterranean in 42 scenes \u2014 and the most adult.",
  year: 1606,
  wordCount: 27e3,
  coverColor: "#1a1228",
  coverAccent: "#c89060",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: true }
  ]
};
var RICHARD_III = {
  id: "richard-iii",
  title: "Richard III",
  author: "William Shakespeare",
  description: `Now is the winter of our discontent. The hunchbacked Duke of Gloucester schemes, seduces, and murders his way to the throne of England, only to lose it at Bosworth Field \u2014 "A horse! A horse! My kingdom for a horse!" The young Shakespeare's breakthrough in tragic villainy.`,
  year: 1593,
  wordCount: 28e3,
  coverColor: "#1f0a0a",
  coverAccent: "#a85030",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1597)", year: 1597, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var HENRY_V = {
  id: "henry-v",
  title: "Henry V",
  author: "William Shakespeare",
  description: 'The young king who once caroused with Falstaff invades France, defeats five-to-one odds at Agincourt, and woos a princess in broken French. "We few, we happy few, we band of brothers" \u2014 the most-quoted speech about leadership in English.',
  year: 1599,
  wordCount: 22e3,
  coverColor: "#1a2230",
  coverAccent: "#c0a060",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1600)", year: 1600, aligned: true },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var CORIOLANUS = {
  id: "coriolanus",
  title: "Coriolanus",
  author: "William Shakespeare",
  description: "The Roman general Caius Marcius, renamed Coriolanus for sacking the Volscian capital, returns to Rome a hero \u2014 and refuses to flatter the plebeians for the consulship. Banished, he joins his old enemy to march on Rome. The most political of the tragedies and the most ruthlessly proud hero in the canon.",
  year: 1608,
  wordCount: 26e3,
  coverColor: "#2a1a1a",
  coverAccent: "#8a4030",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true, hasAudio: true },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var WINTERS_TALE = {
  id: "winters-tale",
  title: "The Winter's Tale",
  author: "William Shakespeare",
  description: "King Leontes becomes convinced \u2014 without evidence \u2014 that his wife is cheating. He destroys his marriage and his family before he realizes what he's done. Sixteen years later, the play moves to a pastoral world, a sheep-shearing feast, and the most famous stage direction in literature: Exit, pursued by a bear.",
  year: 1611,
  wordCount: 23e3,
  coverColor: "#1a2230",
  coverAccent: "#a8b8c8",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var COMEDY_OF_ERRORS = {
  id: "comedy-of-errors",
  title: "The Comedy of Errors",
  author: "William Shakespeare",
  description: "Two sets of identical twins, separated as babies, end up in the same city on the same day, leading to ninety minutes of mistaken identity, slapstick, and a final reunion. Shakespeare's shortest play and the foundation of every farce written since.",
  year: 1594,
  wordCount: 16e3,
  coverColor: "#2a2018",
  coverAccent: "#d0b070",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var MEASURE_FOR_MEASURE = {
  id: "measure-for-measure",
  title: "Measure for Measure",
  author: "William Shakespeare",
  description: `The Duke of Vienna leaves the puritanical Angelo in charge and disappears. Angelo sentences a young man to death for fornication; the man's sister, a novice nun, pleads with him; Angelo offers her brother's life for her body. The bleakest of the "problem plays" \u2014 comedy in name only.`,
  year: 1604,
  wordCount: 22e3,
  coverColor: "#1f1a2a",
  coverAccent: "#8a7090",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: true }
  ]
};
var CYMBELINE = {
  id: "cymbeline",
  title: "Cymbeline",
  author: "William Shakespeare",
  description: "A late romance: King Cymbeline of Britain, his banished daughter Imogen, the villain Iachimo who bets he can seduce her, the lost princes raised in a Welsh cave. Wagers, severed heads, a poisoned drink, a Roman invasion \u2014 and a recognition scene that pulls thirty threads into one.",
  year: 1610,
  wordCount: 26e3,
  coverColor: "#1a2528",
  coverAccent: "#a0c0b0",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: true }
  ]
};
var HENRY_IV_PART_2 = {
  id: "henry-iv-part-2",
  title: "Henry IV, Part 2",
  author: "William Shakespeare",
  description: "Hal's coronation looms. The dying king mistakes the prince's grief for greed and rages against him. Falstaff rides toward London to claim the favor of the new king \u2014 and gets one of the most devastating dismissals in English: I know thee not, old man.",
  year: 1598,
  wordCount: 26e3,
  coverColor: "#1a1a28",
  coverAccent: "#a89060",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1600)", year: 1600, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: true }
  ]
};
var MERRY_WIVES_OF_WINDSOR = {
  id: "merry-wives-of-windsor",
  title: "The Merry Wives of Windsor",
  author: "William Shakespeare",
  description: "Falstaff tries to seduce two respectable Windsor matrons for their money, sending each the same love letter. They compare notes and arrange the most humiliating series of punishments in the canon \u2014 including a soaking in the Thames in a laundry basket. The most farcical play and the one Queen Elizabeth supposedly demanded.",
  year: 1597,
  wordCount: 22e3,
  coverColor: "#1f2820",
  coverAccent: "#c0a850",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Shakespeare (1623)", year: 1623, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: true }
  ]
};
var PRIDE_AND_PREJUDICE = {
  id: "pride-and-prejudice",
  title: "Pride and Prejudice",
  author: "Jane Austen",
  description: "A sharp-tongued woman and a proud gentleman circle each other through balls, misunderstandings, and pride \u2014 until they don't. The novel that invented the romantic comedy.",
  year: 1813,
  wordCount: 122e3,
  coverColor: "#2e2014",
  coverAccent: "#d4a86a",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Original (1813)", year: 1813, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    // Keeps the pre-2026-09-25 paragraphing; the English editions were restructured.
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: false }
  ]
};
var THE_ART_OF_WAR = {
  id: "the-art-of-war",
  title: "The Art of War",
  author: "Sun Tzu",
  description: "Thirteen chapters on strategy, deception, and the nature of conflict \u2014 written 2,500 years ago, still the sharpest manual on how to win without fighting.",
  year: -500,
  wordCount: 13e3,
  coverColor: "#2a1a0a",
  coverAccent: "#c4a035",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      // Replaced 2026-10-01 (rights): Captain E. F. Calthrop, The Book of War (London: John Murray, 1908),
      // Project Gutenberg #44024. Calthrop died 1915. Modern English is a Tinct rendering of this text.
      label: "Calthrop Translation (1908)",
      translator: "E. F. Calthrop",
      year: 1908,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    }
  ]
};
var CRIME_AND_PUNISHMENT = {
  id: "crime-and-punishment",
  title: "Crime and Punishment",
  author: "Fyodor Dostoevsky",
  description: "A brilliant student commits the perfect murder \u2014 then discovers that guilt is a punishment no logic can escape. Dostoevsky's masterpiece of conscience, paranoia, and redemption.",
  year: 1866,
  wordCount: 211e3,
  coverColor: "#1a1a1a",
  coverAccent: "#8b4513",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Garnett Translation (1914)",
      translator: "Constance Garnett",
      year: 1914,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var THE_REPUBLIC = {
  id: "the-republic",
  title: "The Republic",
  author: "Plato",
  description: "Socrates and his friends spend one long night asking the hardest question: what is justice? Along the way they build a city in words, discover the Forms, and descend into a cave. Philosophy begins here.",
  year: -375,
  wordCount: 12e4,
  coverColor: "#1a2a3a",
  coverAccent: "#c9b896",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Jowett Translation (1871)",
      translator: "Benjamin Jowett",
      year: 1871,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var MEDITATIONS = {
  id: "meditations",
  title: "Meditations",
  author: "Marcus Aurelius",
  description: "A Roman emperor's private journal \u2014 written on campaign, never meant to be read. No self-help platitudes, just a man wrestling with duty, mortality, and how to be good when the world isn't.",
  year: 180,
  // The served modern-en, 45,451 words over 487 numbered sections. The
  // previous 45,000 described no served file (the Casaubon-based modern-en
  // it sat next to was 57,236).
  wordCount: 45451,
  coverColor: "#2a2018",
  coverAccent: "#9a8a6a",
  editions: [
    {
      // True as of the 2026-09-12 re-basing, and false before it: the served
      // text under this key was Meric Casaubon 1634 (412 paragraphs) while
      // this label already claimed Long. It is now George Long 1862
      // (Project Gutenberg #15877), 487 paragraphs, one per numbered section.
      key: "original-en",
      language: "en",
      style: "original",
      label: "Long Translation (1862)",
      translator: "George Long",
      year: 1862,
      // Verified: 487 paragraphs in both English editions, index for index,
      // every paragraph opening on the same section number.
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true
    }
  ]
};
var DIVINE_COMEDY = {
  id: "divine-comedy",
  title: "The Divine Comedy",
  author: "Dante Alighieri",
  description: "A poet walks through Hell, climbs the mountain of Purgatory, and ascends into Paradise \u2014 guided first by reason, then by love. The journey that mapped the afterlife and invented Italian literature.",
  year: 1320,
  wordCount: 11e4,
  coverColor: "#1a0a0a",
  coverAccent: "#d4a030",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Longfellow Translation (1867)",
      translator: "Henry Wadsworth Longfellow",
      year: 1867,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var JANE_EYRE = {
  id: "jane-eyre",
  title: "Jane Eyre",
  author: "Charlotte Bront\xEB",
  description: 'An orphan with a fierce will and a quiet voice fights her way from cruelty to independence \u2014 then falls in love with a man hiding a terrible secret. "Reader, I married him."',
  year: 1847,
  wordCount: 188e3,
  coverColor: "#2a1a2a",
  coverAccent: "#b87aa0",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1847)",
      year: 1847,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      // Keeps the pre-2026-09-25 paragraphing; the English editions were restructured.
      aligned: false
    }
  ]
};
var THE_AENEID = {
  id: "the-aeneid",
  title: "The Aeneid",
  author: "Virgil",
  description: "A Trojan prince flees the ruins of his city, wanders the Mediterranean for seven years, and fights to found a new homeland in Italy. The epic that gave Rome its origin story \u2014 and Latin literature its masterpiece.",
  year: -19,
  wordCount: 11e4,
  coverColor: "#1a1a0a",
  coverAccent: "#c4a035",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Dryden Translation (1697)",
      translator: "John Dryden",
      year: 1697,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var PARADISE_LOST = {
  id: "paradise-lost",
  title: "Paradise Lost",
  author: "John Milton",
  description: "Satan rebels against Heaven, corrupts humanity, and loses everything \u2014 but never stops talking. Milton's blind epic of free will, disobedience, and the cost of knowledge.",
  year: 1667,
  wordCount: 8e4,
  coverColor: "#0a0a1a",
  coverAccent: "#a0a0d4",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1674)",
      year: 1674,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var FRANKENSTEIN = {
  id: "frankenstein",
  title: "Frankenstein",
  author: "Mary Shelley",
  description: "A young scientist creates life from dead flesh \u2014 then abandons it. The creature, articulate and desperate, wants only to be loved. The novel that invented science fiction and never lets you decide who the real monster is.",
  year: 1818,
  wordCount: 75e3,
  coverColor: "#0a1a0a",
  coverAccent: "#6ab56a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1831)",
      year: 1831,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var THE_MANUAL = {
  id: "the-manual",
  title: "The Manual",
  author: "Epictetus",
  description: "The essential handbook of Stoic philosophy. In 52 short sections, Epictetus sets out the single most important idea in Stoicism: distinguish what is in your power from what is not, and concern yourself only with the former.",
  year: 125,
  wordCount: 1e4,
  coverColor: "#2c2c1e",
  coverAccent: "#c8b87a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Long (1877)",
      translator: "George Long",
      year: 1877,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var CONFESSIONS = {
  id: "confessions",
  title: "Confessions",
  author: "Augustine",
  description: "The first great spiritual autobiography. Augustine traces his journey from youthful sin through Manichaean philosophy to Christian conversion \u2014 wrestling with desire, will, and the nature of God across thirteen searingly honest books.",
  year: 397,
  wordCount: 1e5,
  coverColor: "#3a2a1a",
  coverAccent: "#c8a060",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Pusey (1838)",
      translator: "Edward Bouverie Pusey",
      year: 1838,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var IMITATION_OF_CHRIST = {
  id: "imitation-of-christ",
  title: "The Imitation of Christ",
  author: "Thomas \xE0 Kempis",
  description: "The most widely read Christian devotional work after the Bible. In 114 short chapters, Thomas \xE0 Kempis counsels the reader toward humility, inner peace, and the practice of following Christ in daily life.",
  year: 1418,
  wordCount: 6e4,
  coverColor: "#2a2a3a",
  coverAccent: "#a0a0c8",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Benham (1886)",
      year: 1886,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var JERUSALEM = {
  id: "jerusalem",
  title: "Jerusalem",
  author: "Selma Lagerl\xF6f",
  description: "A Swedish farming community is torn apart when a charismatic preacher leads half its people on a pilgrimage to the Holy Land. Lagerl\xF6f's Nobel Prize-winning novel of faith, land, and the cost of conviction.",
  year: 1901,
  wordCount: 9e4,
  coverColor: "#4a3a2a",
  coverAccent: "#c8b878",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Howard (1915)",
      translator: "Velma Swanston Howard",
      year: 1915,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      // 18 chapters against the repaired English editions' 17.
      aligned: false,
      hasAudio: true
    }
  ]
};
var APOLOGY = {
  id: "apology",
  title: "Apology",
  author: "Plato",
  description: "Socrates stands trial for his life in Athens. Accused of corrupting the youth and denying the gods, he mounts a fearless defense \u2014 not of himself, but of the examined life.",
  year: -399,
  wordCount: 14e3,
  coverColor: "#3a2f2f",
  coverAccent: "#c4a35a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Jowett (1871)",
      translator: "Benjamin Jowett",
      year: 1871,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var SYMPOSIUM = {
  id: "symposium",
  title: "Symposium",
  author: "Plato",
  description: "At a dinner party in Athens, seven men take turns praising Love. From Aristophanes' comic myth of split souls to Socrates' account of Diotima's ladder of beauty \u2014 the Western world's founding text on love and desire.",
  year: -385,
  wordCount: 23e3,
  coverColor: "#4a2040",
  coverAccent: "#d4a0b0",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Jowett (1871)",
      translator: "Benjamin Jowett",
      year: 1871,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: false,
      hasAudio: true
    }
  ]
};
var PHAEDO = {
  id: "phaedo",
  title: "Phaedo",
  author: "Plato",
  description: "The last hours of Socrates. In prison awaiting execution, he argues for the immortality of the soul \u2014 not from fear, but from philosophical conviction. His friends weep; he drinks the hemlock calmly.",
  year: -385,
  wordCount: 4e4,
  coverColor: "#1e2a3a",
  coverAccent: "#8ab4d4",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Jowett (1871)",
      translator: "Benjamin Jowett",
      year: 1871,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var POETICS = {
  id: "poetics",
  title: "Poetics",
  author: "Aristotle",
  description: "The earliest surviving work of dramatic theory in Western literature. Aristotle defines tragedy, dissects plot and character, and explains why a story moves us \u2014 laying the foundation that every subsequent theory of drama, fiction, and storytelling has built on.",
  year: -335,
  wordCount: 18e3,
  coverColor: "#1e2516",
  coverAccent: "#a8b078",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Butcher (1895)",
      translator: "S. H. Butcher",
      year: 1895,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var CRITO = {
  id: "crito",
  title: "Crito",
  author: "Plato",
  description: "Socrates is in prison awaiting execution. His friend Crito comes at dawn with an escape plan. Socrates refuses \u2014 and walks Crito through the argument: justice matters more than life, and a citizen has a contract with the laws of his city. The shortest, most direct of Plato's prison dialogues.",
  year: -399,
  wordCount: 7500,
  coverColor: "#1f2a3a",
  coverAccent: "#7aa8c4",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Jowett (1871)",
      translator: "Benjamin Jowett",
      year: 1871,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var PHAEDRUS = {
  id: "phaedrus",
  title: "Phaedrus",
  author: "Plato",
  description: "Socrates and Phaedrus walk outside Athens to a plane tree by the Ilissus, where Phaedrus reads a speech by Lysias arguing that the non-lover should be preferred to the lover. Socrates answers with two speeches of his own \u2014 and the second, the great Palinode, unfolds the soul as a winged charioteer, the immortality of the soul, and divine madness as the source of every great good. The dialogue closes with the famous critique of writing: the myth of Theuth and Thamus, and Socrates' warning that the written word is a reminder, not a teacher.",
  year: -370,
  wordCount: 22e3,
  coverColor: "#2a3a4a",
  coverAccent: "#c4d0a8",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Jowett (1871)",
      translator: "Benjamin Jowett",
      year: 1871,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var MOBY_DICK = {
  id: "moby-dick",
  title: "Moby Dick",
  author: "Herman Melville",
  description: "Call me Ishmael. A young sailor boards the whaling ship Pequod, captained by the monomaniac Ahab, who will hunt the great white whale to the ends of the earth \u2014 and beyond reason.",
  year: 1851,
  wordCount: 21e4,
  coverColor: "#1a2a3e",
  coverAccent: "#a8c8d8",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1851)",
      year: 1851,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var GREAT_EXPECTATIONS = {
  id: "great-expectations",
  title: "Great Expectations",
  author: "Charles Dickens",
  description: "Pip, an orphan in the Kent marshes, receives a mysterious fortune that transforms his life. But his great expectations carry a price \u2014 and the truth about his benefactor will shatter everything he believes.",
  year: 1861,
  wordCount: 185e3,
  coverColor: "#3a2a1a",
  coverAccent: "#d4b896",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1861)",
      year: 1861,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var THE_HISTORIES = {
  id: "the-histories",
  title: "The Histories",
  author: "Herodotus",
  description: "The first great work of history in the Western world. Herodotus travels the ancient world \u2014 Egypt, Persia, Scythia, Greece \u2014 recording customs, wars, and wonders, building toward the epic clash between Greece and Persia.",
  year: -440,
  wordCount: 28e4,
  coverColor: "#4a3a2a",
  coverAccent: "#c8a860",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Macaulay (1890)",
      translator: "George Campbell Macaulay",
      year: 1890,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var NIELS_LYHNE = {
  id: "niels-lyhne",
  title: "Niels Lyhne",
  author: "J.P. Jacobsen",
  description: `A young Danish dreamer searches for meaning through art, love, and atheism in nineteenth-century Denmark. Jacobsen's masterpiece \u2014 the novel Rilke called "the most important book in the world."`,
  year: 1880,
  wordCount: 65e3,
  coverColor: "#2a3a2e",
  coverAccent: "#a8b89a",
  editions: [
    {
      key: "original-da",
      language: "da",
      style: "original",
      label: "Original (1880)",
      year: 1880,
      // Danish paragraphing (1,159) differs from the English editions (912).
      aligned: false
    },
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Larsen (1919)",
      translator: "Hanna Astrup Larsen",
      year: 1919,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      // Danish paragraphing (1,159) differs from the English editions (912).
      aligned: false
    }
  ]
};
var THE_AWAKENING = {
  id: "the-awakening",
  title: "The Awakening",
  author: "Kate Chopin",
  description: "A young mother on a Louisiana island begins to feel the pull of the sea \u2014 and of a life entirely her own. Chopin's 1899 novel scandalized its readers and was forgotten for decades. It is now recognized as one of the first great feminist novels in American literature.",
  year: 1899,
  wordCount: 49e3,
  coverColor: "#0d2233",
  coverAccent: "#6aabcc",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1899)",
      year: 1899,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var BROTHERS_KARAMAZOV = {
  id: "brothers-karamazov",
  title: "The Brothers Karamazov",
  author: "Fyodor Dostoevsky",
  description: `Dostoevsky's final novel: three brothers and their father, a murder, a trial, and the deepest questions of faith, doubt, and human freedom. Includes the legendary parable "The Grand Inquisitor."`,
  year: 1880,
  wordCount: 36e4,
  coverColor: "#5a1a1a",
  coverAccent: "#d4a843",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Garnett (1912)",
      translator: "Constance Garnett",
      year: 1912,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var NOTES_FROM_UNDERGROUND = {
  id: "notes-from-underground",
  title: "Notes from Underground",
  author: "Fyodor Dostoevsky",
  description: `The first existentialist novel: a feverish monologue from a self-aware, spiteful man who has retreated from society to attack the rationalist faith of his age. Dostoevsky's declaration of war on "the Crystal Palace" and the seed of every novel he wrote afterward.`,
  year: 1864,
  wordCount: 45e3,
  coverColor: "#1a1a1a",
  coverAccent: "#9c3a3a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Garnett (1918)",
      translator: "Constance Garnett",
      year: 1918,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var ILIAD = {
  id: "iliad",
  title: "The Iliad",
  author: "Homer",
  description: "The wrath of Achilles and the final weeks of the Trojan War. Homer's first epic \u2014 rage, fate, gods at war with men, and the funeral of Hector.",
  year: -750,
  wordCount: 15e4,
  coverColor: "#3a1a1a",
  coverAccent: "#c9a04a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Butler (1898)",
      translator: "Samuel Butler",
      year: 1898,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var NICOMACHEAN_ETHICS = {
  id: "nicomachean-ethics",
  title: "Nicomachean Ethics",
  author: "Aristotle",
  description: "The foundational work of virtue ethics. Aristotle asks what the good life is for a human being, and answers: flourishing (eudaimonia), achieved through practical wisdom, moral virtue, and contemplation. The golden mean, friendship, justice, and the nature of happiness \u2014 the vocabulary ethics has used ever since.",
  year: -350,
  wordCount: 92e3,
  coverColor: "#2a2a1a",
  coverAccent: "#b89a4a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Chase (1847) / Ross tradition",
      translator: "D.P. Chase",
      year: 1847,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var ORESTEIA = {
  id: "oresteia",
  title: "The Oresteia",
  author: "Aeschylus",
  description: "The only surviving Greek trilogy. A king returns from Troy and is murdered by his wife. Their son returns to avenge him by killing his mother. The Furies pursue him until Athena establishes the first court of law and acquits him. Aeschylus traces the birth of justice itself out of the cycle of blood revenge.",
  year: -458,
  wordCount: 34e3,
  coverColor: "#2a0a1a",
  coverAccent: "#a04040",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Morshead (1881)",
      translator: "E. D. A. Morshead",
      year: 1881,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var BACCHAE = {
  id: "bacchae",
  title: "The Bacchae",
  author: "Euripides",
  description: "Dionysus comes to Thebes in disguise, demanding that the city worship him. King Pentheus refuses. The god drives the women of Thebes into ecstatic frenzy on Mount Cithaeron, and Pentheus, fatally curious, goes up to spy. His own mother, in the grip of the god, tears him apart with her bare hands. Euripides' last play and the most disturbing in the Greek tragic canon.",
  year: -405,
  wordCount: 13500,
  coverColor: "#1a0e2a",
  coverAccent: "#9a4ac0",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      // Replaced 2026-10-01 (rights): Arthur S. Way, The Tragedies of Euripides in English Verse, vol. 3
      // (Macmillan, 1898), text from the Wikisource transcription (CC BY-SA 4.0, Wikisource contributors).
      // Way died 1930. Modern English is a Tinct rendering of this text, shared under the same licence.
      label: "Way (1898)",
      translator: "Arthur S. Way",
      year: 1898,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    }
  ]
};
var MEDEA = {
  id: "medea",
  title: "Medea",
  author: "Euripides",
  description: "Medea has given up everything for Jason \u2014 her father, her country, her brother \u2014 and now he is leaving her for a princess of Corinth. Her revenge will be calibrated to destroy what he loves most. The play that gave us a heroine more terrifying than any villain.",
  year: -431,
  wordCount: 11e3,
  coverColor: "#2a1a0a",
  coverAccent: "#c96a4a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      // Replaced 2026-10-01 (rights): Arthur S. Way, The Tragedies of Euripides in English Verse, vol. 1
      // (Macmillan, 1894), text from the Wikisource transcription (CC BY-SA 4.0, Wikisource contributors).
      // Way died 1930. Modern English is a Tinct rendering of this text, shared under the same licence.
      label: "Way (1894)",
      translator: "Arthur S. Way",
      year: 1894,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    }
  ]
};
var COMMUNIST_MANIFESTO = {
  id: "communist-manifesto",
  title: "The Communist Manifesto",
  author: "Karl Marx & Friedrich Engels",
  description: "Twelve thousand words written in 1848 that changed the political vocabulary of the next century. The bourgeoisie has dissolved every old certainty into the cash nexus; the proletariat will dissolve the bourgeoisie. Class struggle, world history, and the call that ends the book: workers of all countries, unite.",
  year: 1848,
  wordCount: 12e3,
  coverColor: "#3a0a0a",
  coverAccent: "#c93a3a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Moore (1888)",
      translator: "Samuel Moore (edited by Engels)",
      year: 1888,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var SECOND_TREATISE = {
  id: "second-treatise",
  title: "Second Treatise of Government",
  author: "John Locke",
  description: "The book Mill is responding to. Locke argues that government exists to protect the natural rights of its citizens \u2014 life, liberty, property \u2014 and that when it ceases to do so, the people may dissolve it. The blueprint for the American revolution and the entire liberal tradition that followed.",
  year: 1689,
  wordCount: 7e4,
  coverColor: "#2a3a2a",
  coverAccent: "#a0c0a0",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1689)",
      year: 1689,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var SOCIAL_CONTRACT = {
  id: "social-contract",
  title: "The Social Contract",
  author: "Jean-Jacques Rousseau",
  description: "Man is born free, and everywhere he is in chains. Rousseau's short, dense argument for the only legitimate form of authority: a contract among equals, governed by the general will. The book the French Revolution thought it was reading.",
  year: 1762,
  wordCount: 5e4,
  coverColor: "#1a2a3a",
  coverAccent: "#c0a060",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Cole (1913)",
      translator: "G. D. H. Cole",
      year: 1913,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var FAUST_PART_1 = {
  id: "faust-part-1",
  title: "Faust, Part One",
  author: "Johann Wolfgang von Goethe",
  description: "The scholar who has mastered every science still finds himself unable to live, makes a pact with Mephistopheles, and is led through pleasure, Walpurgis-Night, and the destruction of Gretchen. The defining work of German literature \u2014 and the play that taught the modern world how to talk about ambition, knowledge, and damnation.",
  year: 1808,
  wordCount: 3e4,
  coverColor: "#1a0e1a",
  coverAccent: "#c93a3a",
  editions: [
    {
      key: "original-de",
      language: "de",
      style: "original",
      label: "Goethe (1808)",
      year: 1808,
      // Verse set line by line: 1,095 paragraphs against the English editions' 1,060.
      aligned: false
    },
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Bayard Taylor (1870)",
      translator: "Bayard Taylor",
      year: 1870,
      // Same 28 chapters and 1,060 paragraphs as Modern English (Taylor, PG 14591).
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      // Built on the earlier English text (895 paragraphs), not the Taylor replacement (1,060).
      aligned: false,
      hasAudio: true
    }
  ]
};
var FEAR_AND_TREMBLING = {
  id: "fear-and-trembling",
  title: "Fear and Trembling",
  author: "S\xF8ren Kierkegaard",
  description: 'A short, savage book about Abraham \u2014 the father of faith \u2014 who is told by God to murder his son. Kierkegaard, writing under the name Johannes de silentio, refuses every comfortable Hegelian explanation and forces the reader to feel what faith actually demands. The "knight of faith" and the "teleological suspension of the ethical" begin here.',
  year: 1843,
  wordCount: 43700,
  coverColor: "#1a1a24",
  coverAccent: "#a08a4a",
  editions: [
    {
      key: "original-da",
      language: "da",
      style: "original",
      label: "Original (1843)",
      year: 1843,
      aligned: true
    },
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (English)",
      // Machine translation on the earlier 232-paragraph structure; the accepted
      // text has 184 printed paragraphs. Never a default (editionDefaults).
      aligned: false
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Tinct Modern English \u2014 translated from Danish",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      // 232 paragraphs against the accepted 184.
      aligned: false,
      hasAudio: true
    }
  ]
};
var PELOPONNESIAN_WAR = {
  id: "peloponnesian-war",
  title: "History of the Peloponnesian War",
  author: "Thucydides",
  description: "The first great work of political history. Thucydides reports the twenty-seven-year war between Athens and Sparta as he saw it \u2014 speeches, plagues, betrayals, and the slow corruption of every virtue under the pressure of war. Pericles' Funeral Oration, the Plague of Athens, the Melian Dialogue, the Sicilian Expedition: the foundations of how the West thinks about power.",
  year: -400,
  wordCount: 15e4,
  coverColor: "#1a2a3a",
  coverAccent: "#9a6a4a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Crawley (1874)",
      translator: "Richard Crawley",
      year: 1874,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var ARISTOTLE_POLITICS = {
  id: "aristotle-politics",
  title: "Politics",
  author: "Aristotle",
  description: "The founding text of political science. Aristotle surveys constitutions, citizenship, justice, revolution, and the best possible state \u2014 drawing on 158 real constitutions to ask what arrangement of power serves human flourishing. Still the sharpest framework for thinking about democracy, oligarchy, tyranny, and why states rise and fall.",
  year: -335,
  wordCount: 9e4,
  coverColor: "#2a1a2a",
  coverAccent: "#8a6a9a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Jowett (1885)",
      translator: "Benjamin Jowett",
      year: 1885,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var THE_PRINCE = {
  id: "the-prince",
  title: "The Prince",
  author: "Niccol\xF2 Machiavelli",
  description: "The coldest clear-eyed book about power ever written. Machiavelli, exiled from Florence, drafted a manual for the ruler who would unify Italy \u2014 and in the process invented modern political realism. Fortune, virt\xF9, the fox and the lion, and whether it is better to be loved or feared.",
  year: 1532,
  wordCount: 32e3,
  coverColor: "#3a2018",
  coverAccent: "#b8804a",
  editions: [
    {
      key: "original-it",
      language: "it",
      style: "original",
      label: "Il Principe (1532)",
      year: 1532,
      aligned: false
    },
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Marriott (1908)",
      translator: "W.K. Marriott",
      year: 1908,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var CANDIDE = {
  id: "candide",
  title: "Candide",
  author: "Voltaire",
  description: `Voltaire's attack on Leibnizian optimism. A young man is tutored in the belief that this is "the best of all possible worlds" \u2014 then the world systematically dismantles that belief through earthquake, war, plague, Inquisition, and the slave trade. Ends with the most famous closing line in the Enlightenment: "we must cultivate our garden."`,
  year: 1759,
  wordCount: 32e3,
  coverColor: "#8b2c1e",
  coverAccent: "#d4a574",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Fleming (1901)",
      translator: "William F. Fleming",
      year: 1901,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var BEOWULF = {
  id: "beowulf",
  title: "Beowulf",
  author: "Anonymous",
  description: "The oldest surviving epic in English. A Geatish warrior crosses the sea to fight three monsters across a lifetime \u2014 Grendel, Grendel's mother, and a dragon \u2014 in a poem about courage, kingship, and the long defeat that all heroes face.",
  year: 1e3,
  wordCount: 24e3,
  coverColor: "#1a2332",
  coverAccent: "#a89060",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Hall (1892)",
      translator: "J. Lesslie Hall",
      year: 1892,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var BEYOND_GOOD_AND_EVIL = {
  id: "beyond-good-and-evil",
  title: "Beyond Good and Evil",
  author: "Friedrich Nietzsche",
  description: 'Nietzsche at his most corrosive and most exhilarating. A frontal attack on the dogmas of philosophers, the pieties of Christianity, and the democratic instinct \u2014 and a sketch of the "free spirit" who would live beyond the old moral categories. Master-morality, slave-morality, the will to power, and the question: what is noble?',
  year: 1886,
  wordCount: 63e3,
  coverColor: "#1a1a1a",
  coverAccent: "#8b5a3c",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Zimmern (1907)",
      translator: "Helen Zimmern",
      year: 1907,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var GENEALOGY_OF_MORALS = {
  id: "genealogy-of-morals",
  title: "On the Genealogy of Morals",
  author: "Friedrich Nietzsche",
  description: 'Three essays asking where our moral concepts actually came from. Nietzsche traces "good," "evil," "guilt," and "bad conscience" back through Greek aristocratic codes, Christian inversion, and the priestly imagination \u2014 and finds, beneath every moral judgment, a will to power.',
  year: 1887,
  wordCount: 6e4,
  coverColor: "#1a1a1a",
  coverAccent: "#9a4a4a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Samuel (1913)",
      translator: "Horace B. Samuel",
      year: 1913,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var DESCARTES_MEDITATIONS = {
  id: "descartes-meditations",
  title: "Meditations on First Philosophy",
  author: "Ren\xE9 Descartes",
  description: "Six meditations in which Descartes resolves to doubt everything he can \u2014 and from the wreckage retrieves one indubitable point: the thinking self. From this single foothold he reconstructs God, the world, and the foundations of modern philosophy.",
  year: 1641,
  wordCount: 3e4,
  coverColor: "#0e2030",
  coverAccent: "#c4a85f",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Veitch (1901)",
      translator: "John Veitch",
      year: 1901,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var ON_LIBERTY = {
  id: "on-liberty",
  title: "On Liberty",
  author: "John Stuart Mill",
  description: `Mill's defense of the individual against the social tyranny he saw rising in democratic societies. The "harm principle," the marketplace of ideas, and the case for eccentricity as a public good \u2014 the founding text of modern liberal thought.`,
  year: 1859,
  wordCount: 35e3,
  coverColor: "#2a2a3a",
  coverAccent: "#c0c4d0",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1859)",
      year: 1859,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var UTILITARIANISM = {
  id: "utilitarianism",
  title: "Utilitarianism",
  author: "John Stuart Mill",
  description: "Mill's defense of the greatest-happiness principle against its critics. Pleasures differ in kind, not just amount; better to be Socrates dissatisfied than a fool satisfied. Where On Liberty drew the political line, Utilitarianism supplies the moral standard behind it.",
  year: 1861,
  wordCount: 3e4,
  coverColor: "#3a2a1f",
  coverAccent: "#d4b078",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Mill (1863)",
      year: 1863,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var OEDIPUS_REX = {
  id: "oedipus-rex",
  title: "Oedipus Rex",
  author: "Sophocles",
  description: "The king who solved the riddle of the Sphinx saves his city from plague \u2014 by discovering that the polluter is himself. Sophocles' archetypal tragedy of fate, knowledge, and the will to see what the gods have forbidden.",
  year: -429,
  wordCount: 17e3,
  coverColor: "#2a1a12",
  coverAccent: "#c9a04a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Storr (1912)",
      translator: "Francis Storr",
      year: 1912,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var OEDIPUS_AT_COLONUS = {
  id: "oedipus-at-colonus",
  title: "Oedipus at Colonus",
  author: "Sophocles",
  description: "Old, blind, and exiled, Oedipus arrives at a grove outside Athens seeking the death the gods have prepared for him. Sophocles' final play, written at ninety, is a meditation on suffering, reconciliation, and the hero's strange blessing on the land that receives him.",
  year: -406,
  wordCount: 19e3,
  coverColor: "#1e2a3a",
  coverAccent: "#a08456",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Storr (1912)",
      translator: "Francis Storr",
      year: 1912,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var ANTIGONE = {
  id: "antigone",
  title: "Antigone",
  author: "Sophocles",
  description: "Two brothers have killed each other fighting for Thebes; the new ruler forbids burial to the one who attacked the city. Antigone, sister to both, buries him anyway. Sophocles' starkest confrontation between the unwritten laws of the gods and the public law of the state.",
  year: -441,
  wordCount: 14e3,
  coverColor: "#3a1a1a",
  coverAccent: "#c9a068",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Storr (1912)",
      translator: "Francis Storr",
      year: 1912,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var DEMOCRACY_IN_AMERICA = {
  id: "democracy-in-america",
  title: "Democracy in America",
  author: "Alexis de Tocqueville",
  description: "A young French aristocrat travels the United States in 1831 and returns with the first, and still the most penetrating, analysis of democratic life \u2014 its equality, its restlessness, its softness, and the strange new tyranny of the majority.",
  year: 1835,
  wordCount: 25e4,
  coverColor: "#1f3a5f",
  coverAccent: "#c9a04a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Reeve / Bowen (1862)",
      translator: "Henry Reeve, revised by Francis Bowen",
      year: 1862,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var MAGNA_CARTA = {
  id: "magna-carta",
  title: "Magna Carta",
  author: "Anonymous (sealed by King John)",
  altTitles: ["The Great Charter", "Magna Carta Libertatum"],
  description: 'The Great Charter of 1215 \u2014 the document that bound a king to law, sealed at Runnymede after the barons rose against royal absolutism. Its iconic Clause 39 ("No freeman shall be taken\u2026") is the seed of due process, habeas corpus, and the rule of law in the English-speaking world.',
  year: 1215,
  wordCount: 5e3,
  coverColor: "#3a2d1f",
  coverAccent: "#a87838",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      // Replaced 2026-10-01 (rights): W. S. McKechnie, Magna Carta: A Commentary on the Great Charter of
      // King John, 2nd ed. (Glasgow: MacLehose, 1914), English charter text as published by Liberty Fund
      // (Online Library of Liberty). McKechnie died 1930. Modern English is a Tinct rendering of this text.
      label: "McKechnie (1914)",
      translator: "William Sharp McKechnie",
      year: 1914,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    }
  ]
};
var US_FOUNDING_DOCUMENTS = {
  id: "us-founding-documents",
  title: "The US Founding Documents",
  author: "Various (Jefferson, Madison, et al.)",
  altTitles: ["Declaration of Independence", "Constitution of the United States", "Bill of Rights"],
  description: "The four texts that built the American Republic: the Declaration of Independence (1776), the Constitution (1787), the Bill of Rights (1791), and every Amendment since. Together they define how a continental democracy was imagined, codified, and then expanded to include those it once excluded.",
  year: 1776,
  wordCount: 22e3,
  coverColor: "#1f2a3a",
  coverAccent: "#c0432a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1776\u20131992)",
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var FEDERALIST_PAPERS = {
  id: "federalist-papers",
  title: "The Federalist Papers",
  author: 'Hamilton, Madison, Jay (as "Publius")',
  description: `Eighty-five newspaper essays written by Hamilton, Madison, and Jay in 1787-88 to defend the proposed Constitution. The most influential work of political theory in American history \u2014 including Madison's celebrated "factions" paper (No. 10), the "if men were angels" argument for checks and balances (No. 51), and Hamilton's case for judicial review (No. 78).`,
  year: 1788,
  wordCount: 175e3,
  coverColor: "#2a1f3a",
  coverAccent: "#d4a843",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1788)",
      year: 1788,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var A_LITTLE_PRINCESS = {
  id: "a-little-princess",
  title: "A Little Princess",
  author: "Frances Hodgson Burnett",
  description: "Sara Crewe, the doted-on daughter of an English captain in India, is placed at Miss Minchin's Select Seminary in London. On her eleventh birthday her father dies and his fortune collapses; she is moved to a freezing attic and worked as an unpaid drudge. The book is the story of what survives in a person when status, money, and protection are stripped away in a single afternoon \u2014 and of the man who has been searching London for her, living next door.",
  year: 1905,
  wordCount: 66e3,
  coverColor: "#3d2a3a",
  coverAccent: "#d4a872",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Original (1905)",
      year: 1905,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: false
      // Text only: Danish narration is disabled.
    }
  ]
};
var THE_JUNGLE_BOOK = {
  id: "jungle-book",
  title: "The Jungle Book",
  author: "Rudyard Kipling",
  description: "Seven stories from the Indian jungle \u2014 Mowgli raised by wolves, Rikki-Tikki-Tavi the mongoose, the White Seal, Toomai of the Elephants. Kipling's masterpiece of animal fable and moral adventure, which invented the modern coming-of-age story and shaped how the world imagines the wild.",
  year: 1894,
  wordCount: 55e3,
  coverColor: "#1a2a0e",
  coverAccent: "#6b8f3a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Kipling (1894)",
      year: 1894,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: false
      // Text only: Danish narration is disabled.
    }
  ]
};
var AROUND_THE_WORLD_IN_80_DAYS = {
  id: "around-the-world-80-days",
  title: "Around the World in Eighty Days",
  author: "Jules Verne",
  description: "Phileas Fogg, the most precise man in London, bets his fortune that he can circle the globe in eighty days. From London to Bombay to Yokohama to New York \u2014 a race against time, a detective on his heels, and a rescue along the way. Verne's great comedy of English phlegm against the chaos of the world.",
  year: 1872,
  wordCount: 65e3,
  coverColor: "#0e1a2a",
  coverAccent: "#3a6b8f",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "George Towle (1873)",
      translator: "George Towle",
      year: 1873,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: false
      // Text only: Danish narration is disabled.
    }
  ]
};
var WALDEN = {
  id: "walden",
  title: "Walden",
  author: "Henry David Thoreau",
  description: "In 1845 Thoreau built a cabin by Walden Pond and stayed two years to find out what living actually required. Walden is the result: a season-by-season report on solitude, work, food, sound, neighbors, and the price of a life. The founding text of American simplicity, written with a sharper edge than its reputation suggests.",
  year: 1854,
  wordCount: 115e3,
  coverColor: "#1b2a1f",
  coverAccent: "#7a8c5a",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Thoreau (1854)",
      year: 1854,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var HEART_OF_DARKNESS = {
  id: "heart-of-darkness",
  title: "Heart of Darkness",
  author: "Joseph Conrad",
  description: "Marlow sits on a yawl on the Thames and tells the story of his journey up the Congo River to retrieve a company agent named Kurtz who has gone deep into the interior and stopped sending word. The hundred-page novella that founded modern fiction \u2014 and the work the colonial project never recovered from.",
  year: 1899,
  wordCount: 38e3,
  coverColor: "#1a1410",
  coverAccent: "#8a6035",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Conrad (1899)",
      year: 1899,
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var DISCOURSE_ON_INEQUALITY = {
  id: "discourse-on-inequality",
  title: "Discourse on the Origin of Inequality",
  author: "Jean-Jacques Rousseau",
  description: "Rousseau asks how human beings, who came into the world equal, ended up so radically unequal \u2014 and answers that the answer is not in nature but in property, civilization, and the institutions we built to defend them. The argument that set up The Social Contract and put the French Revolution in motion.",
  year: 1755,
  wordCount: 3e4,
  coverColor: "#1f2a3a",
  coverAccent: "#a89060",
  editions: [
    {
      key: "original-fr",
      language: "fr",
      style: "original",
      label: "Original (1755)",
      year: 1755,
      aligned: true
    },
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Cole (1913)",
      translator: "G. D. H. Cole",
      year: 1913,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var VINDICATION_RIGHTS_OF_WOMAN = {
  id: "vindication-rights-of-woman",
  title: "A Vindication of the Rights of Woman",
  author: "Mary Wollstonecraft",
  description: "Written in six weeks in 1792, in furious response to a French Revolution that proclaimed the rights of man while leaving women out, and to Rousseau's Emile, which trained girls to be ornaments. Wollstonecraft argues that women are not lesser beings designed for charm and submission but rational creatures whose minds have been deliberately stunted by bad education. The founding text of feminist political philosophy.",
  year: 1792,
  wordCount: 84e3,
  coverColor: "#3a2a4a",
  coverAccent: "#c89a5c",
  editions: [
    {
      key: "original-en",
      language: "en",
      style: "original",
      label: "Wollstonecraft (1792)",
      year: 1792,
      aligned: true
    },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true
    }
  ]
};
var LEVIATHAN = {
  id: "leviathan",
  title: "Leviathan",
  author: "Thomas Hobbes",
  description: `Hobbes's founding work of political philosophy, written in the shadow of civil war. Without a sovereign to hold men in awe, life in the state of nature is "solitary, poor, nasty, brutish, and short." The social contract \u2014 surrendering freedom to an absolute sovereign \u2014 is the only escape. A pitiless and enduringly controversial argument for order over liberty.`,
  year: 1651,
  wordCount: 2e5,
  coverColor: "#1c1c2e",
  coverAccent: "#8a9bb5",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Hobbes (1651)", year: 1651, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var JEKYLL_AND_HYDE = {
  id: "jekyll-and-hyde",
  title: "Strange Case of Dr Jekyll and Mr Hyde",
  author: "Robert Louis Stevenson",
  description: "The lawyer Utterson investigates the strange friendship of his upright client Dr Jekyll with the brutish, hated Mr Hyde \u2014 and uncovers the experiment that gave English its phrase for the divided self. A short, vicious tale of respectability and the appetites it conceals.",
  year: 1886,
  wordCount: 26e3,
  coverColor: "#1b1d24",
  coverAccent: "#a83232",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Stevenson (1886)", year: 1886, aligned: true, hasAudio: true },
    {
      key: "modern-en",
      language: "en",
      style: "modern",
      label: "Modern English",
      aligned: true,
      hasAudio: true
    },
    {
      key: "modern-da",
      language: "da",
      style: "modern",
      label: "Moderne Dansk",
      aligned: true,
      hasAudio: true
    }
  ]
};
var DON_QUIXOTE = {
  id: "don-quixote",
  title: "Don Quixote",
  author: "Miguel de Cervantes",
  description: "A country gentleman reads too many books of chivalry and rides out as a knight-errant on a starved horse, with a peasant for a squire and a windmill for a giant. The first modern novel \u2014 and the only one that holds up against everything that came after.",
  year: 1605,
  wordCount: 43e4,
  coverColor: "#2a1a10",
  coverAccent: "#c08a40",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Ormsby (1885)", translator: "John Ormsby", year: 1885, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var ESSAYS_MONTAIGNE = {
  id: "essays-montaigne",
  title: "Essays",
  author: "Michel de Montaigne",
  description: "A French nobleman retires to his tower at age 38 and starts writing about whatever he is thinking \u2014 his kidney stones, his cat, what makes a good death, why he prefers travel to staying home. The book that invented the personal essay and the first attempt by a European to write himself onto the page.",
  year: 1580,
  wordCount: 35e4,
  coverColor: "#2a2218",
  coverAccent: "#b0a070",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Cotton/Hazlitt (1877)", translator: "Charles Cotton, ed. William Hazlitt", year: 1877, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var HUME_ENQUIRY = {
  id: "hume-enquiry",
  title: "An Enquiry Concerning Human Understanding",
  author: "David Hume",
  description: `Hume's short revision of his abandoned Treatise: what knowledge is, why induction can't be justified, why miracles can't outweigh ordinary evidence, why the self is just a bundle of perceptions. The clearest statement of empiricism in English, and the book that woke Kant from his "dogmatic slumber."`,
  year: 1748,
  wordCount: 5e4,
  coverColor: "#1a2030",
  coverAccent: "#a0b0c8",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Hume (1748)", year: 1748, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var KANT_GROUNDWORK = {
  id: "kant-groundwork",
  title: "Groundwork of the Metaphysics of Morals",
  author: "Immanuel Kant",
  altTitles: ["Fundamental Principles of the Metaphysic of Morals", "Grounding for the Metaphysics of Morals"],
  description: "Kant's shortest book and the entry-point to his ethics. He sets out to derive the moral law from pure reason alone, arrives at the categorical imperative \u2014 act only on a maxim you could will as a universal law \u2014 and rebuilds the entire foundation of modern ethical philosophy.",
  year: 1785,
  wordCount: 3e4,
  coverColor: "#1a1820",
  coverAccent: "#a09090",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Abbott (1879)", translator: "Thomas Kingsmill Abbott", year: 1879, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var WEALTH_OF_NATIONS = {
  id: "wealth-of-nations",
  title: "The Wealth of Nations",
  author: "Adam Smith",
  description: "A Scottish moral philosopher writes the founding text of modern economics: the division of labor in the pin factory, the invisible hand of markets, what makes nations rich. The book that shaped two centuries of policy and still anchors the debate.",
  year: 1776,
  wordCount: 35e4,
  coverColor: "#1f2820",
  coverAccent: "#c8b070",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Smith (1776)", year: 1776, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var WERTHER = {
  id: "werther",
  title: "The Sorrows of Young Werther",
  author: "Johann Wolfgang von Goethe",
  description: "Goethe's explosive early novel of feeling: Werther falls in love with Lotte, who is promised to another man, and turns private longing into a literary event that swept Europe. A short, dangerous book about desire, self-dramatization, and the cost of making life answer to emotion.",
  year: 1774,
  wordCount: 45e3,
  coverColor: "#251c24",
  coverAccent: "#c78a6a",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Boylan (1779)", translator: "R. D. Boylan", year: 1779, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var ANNA_KARENINA = {
  id: "anna-karenina",
  title: "Anna Karenina",
  author: "Leo Tolstoy",
  description: "A married woman falls in love with a cavalry officer in 1870s Russia and ends up under a train. Around that disaster, Tolstoy lays out the lives of nine other people in detail \u2014 Levin and his hayfields, Kitty's wedding, Stiva's expense accounts. The novel many serious readers call the greatest ever written.",
  year: 1877,
  wordCount: 35e4,
  coverColor: "#1a1a28",
  coverAccent: "#b09870",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Garnett (1901)", translator: "Constance Garnett", year: 1901, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: true }
  ]
};
var FREDERICK_DOUGLASS = {
  id: "frederick-douglass",
  title: "Narrative of the Life of Frederick Douglass",
  author: "Frederick Douglass",
  description: "Born a slave in Maryland, Frederick Douglass taught himself to read in secret, fought off the man hired to break him, and escaped north in 1838. Three years later he wrote this account \u2014 naming the masters, the plantations, and the dates \u2014 while still legally a fugitive. The most influential of the American slave narratives.",
  year: 1845,
  wordCount: 36e3,
  coverColor: "#201a18",
  coverAccent: "#c0905a",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Douglass (1845)", year: 1845, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var IVAN_ILYICH = {
  id: "ivan-ilyich",
  title: "The Death of Ivan Ilyich",
  author: "Leo Tolstoy",
  description: "Tolstoy's short, pitiless masterpiece. A successful judge who has done everything right falls ill, and over the long course of his dying is forced to face the one question he never asked: whether the correct, pleasant, respectable life he built was the wrong one all along. The most searching account in fiction of what it is to die \u2014 with a peasant servant's plain kindness the only honest thing in the room.",
  year: 1886,
  wordCount: 2e4,
  coverColor: "#262a2e",
  coverAccent: "#b0894e",
  editions: [
    { key: "original-ru", language: "ru", style: "original", label: "\u0421\u043C\u0435\u0440\u0442\u044C \u0418\u0432\u0430\u043D\u0430 \u0418\u043B\u044C\u0438\u0447\u0430 (1886)", year: 1886, aligned: false },
    { key: "original-en", language: "en", style: "original", label: "Maude", translator: "Louise & Aylmer Maude", aligned: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true }
  ]
};
var TO_THE_LIGHTHOUSE = {
  id: "to-the-lighthouse",
  title: "To the Lighthouse",
  author: "Virginia Woolf",
  description: "A summer house on the Isle of Skye, a boy who wants to sail to the Lighthouse tomorrow, and a painter trying to finish one picture. Woolf follows the Ramsay family and their guests from mind to mind across one evening, ten silent years, and a final morning \u2014 her portrait of her own parents, and of time itself.",
  year: 1927,
  wordCount: 69e3,
  coverColor: "#1c2a33",
  coverAccent: "#c9a45c",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Woolf (1927)", year: 1927, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    // The only Danish edition Tinct offers (Anders, 2026-10-10; OFFERED_DANISH_EDITIONS).
    // Translated 1:1 from modern-en. Text only: Danish narration is disabled.
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: false }
  ]
};
var ALICE_IN_WONDERLAND = {
  id: "alice-in-wonderland",
  title: "Alice's Adventures in Wonderland",
  author: "Lewis Carroll",
  description: "Alice follows a hurried rabbit down a hole into a world of shifting sizes, disputed meanings and impatient rulers. Carroll's twelve-chapter tale turns manners, lessons, arguments and courtroom procedure into nonsense that is stricter than it looks.",
  year: 1865,
  wordCount: 26e3,
  coverColor: "#1f3a2c",
  coverAccent: "#d4b25a",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Carroll (Original)", year: 1865, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true }
  ]
};
var WUTHERING_HEIGHTS = {
  id: "wuthering-heights",
  title: "Wuthering Heights",
  author: "Emily Bront\xEB",
  description: "Two Yorkshire households carry a childhood attachment, a family grievance and a struggle over property into another generation. A tenant's curiosity and a housekeeper's memory tell the story, and neither is a neutral witness.",
  year: 1847,
  wordCount: 116e3,
  coverColor: "#26262c",
  coverAccent: "#9fb0bd",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Original (1847)", year: 1847, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true }
  ]
};
var MIDDLEMARCH = {
  id: "middlemarch",
  title: "Middlemarch",
  author: "George Eliot",
  description: "Interwoven lives in a provincial town test what ambition, marriage and sympathy can make possible. Eliot follows Dorothea Brooke, Tertius Lydgate and the households around them on the eve of reform.",
  year: 1871,
  wordCount: 316e3,
  coverColor: "#2b2618",
  coverAccent: "#c5a45e",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Original (1871\u201372)", year: 1871, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true }
  ]
};
var SENSE_AND_SENSIBILITY = {
  id: "sense-and-sensibility",
  title: "Sense and Sensibility",
  author: "Jane Austen",
  description: "Two sisters confront love, money, and the limits of their own judgment after losing the security of their family home.",
  year: 1811,
  wordCount: 118639,
  coverColor: "#263c38",
  coverAccent: "#c6ad7b",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Austen (Original)", year: 1811, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true }
  ]
};
var THE_SOVEREIGN_CHILD = {
  id: "the-sovereign-child",
  title: "The Sovereign Child",
  author: "Aaron Stupple with Logan Chipkin",
  altTitles: ["The Sovereign Child: How a Forgotten Philosophy Can Liberate Kids and Their Parents"],
  description: "A physician and father of five makes the case for raising children with no rules, grounded in Karl Popper's theory of how knowledge grows.",
  year: 2025,
  wordCount: 55213,
  coverColor: "#0099d3",
  coverAccent: "#f4d03f",
  noModernEdition: true,
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Stupple (Original)", year: 2025, aligned: false }
  ]
};
var LORDS_OF_THE_COSMOS = {
  id: "lords-of-the-cosmos",
  title: "Lords of the Cosmos",
  author: "Arjun Khemani and Logan Chipkin",
  altTitles: ["Lords of the Cosmos: From Stasis to Stars"],
  description: "The story of the universe and of human progress, from cosmic stagnation to the Enlightenment and beyond, told through David Deutsch's ideas about knowledge.",
  year: 2025,
  wordCount: 44090,
  coverColor: "#392d4b",
  coverAccent: "#e9c3b8",
  noModernEdition: true,
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Khemani & Chipkin (Original)", year: 2025, aligned: false }
  ]
};
var BOLD_CONJECTURES_VOLUME_1 = {
  id: "bold-conjectures-volume-1",
  title: "Bold Conjectures, Volume I",
  author: "Logan Chipkin (ed.)",
  altTitles: ["Bold Conjectures: Select Interviews of David Deutsch"],
  description: "Fourteen interviews with physicist and philosopher David Deutsch, from 2012 to 2024, on quantum theory, knowledge, AI, freedom and progress.",
  year: 2025,
  wordCount: 141161,
  coverColor: "#f3eee3",
  coverAccent: "#8b7b22",
  noModernEdition: true,
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Chipkin, ed. (Original)", year: 2025, aligned: false }
  ]
};
var BOLD_CONJECTURES_VOLUME_2 = {
  id: "bold-conjectures-volume-2",
  title: "Bold Conjectures, Volume II",
  author: "Logan Chipkin (ed.)",
  altTitles: ["Bold Conjectures: Essays Across Physics"],
  description: "Thirteen essays by physicists on gravity, time, locality, entropy, probability and the many-worlds view of quantum theory.",
  year: 2026,
  wordCount: 74611,
  coverColor: "#0e2b4b",
  coverAccent: "#f3e08a",
  noModernEdition: true,
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Chipkin, ed. (Original)", year: 2026, aligned: false }
  ]
};
var THE_FARTHEST_REACHES = {
  id: "the-farthest-reaches",
  title: "The Farthest Reaches",
  author: "Brett Hall",
  altTitles: ["The Farthest Reaches: Why People Are the Most Important Entities in the Universe"],
  description: "An argument that people, as universal explainers, are the most important entities in the universe, applied to education, IQ, culture, mental illness and AI.",
  year: 2026,
  wordCount: 39924,
  coverColor: "#f169ab",
  coverAccent: "#6675d5",
  noModernEdition: true,
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Hall (Original)", year: 2026, aligned: false }
  ]
};
var GRIMMS_FAIRY_TALES = {
  id: "grimms-fairy-tales",
  title: "Grimms' Fairy Tales",
  author: "Jacob and Wilhelm Grimm",
  altTitles: ["Household Tales", "Children's and Household Tales"],
  description: "Sixty-five tales of kings, tailors, stepmothers and talking animals, told in plain, repeated patterns.",
  year: 1812,
  wordCount: 100401,
  coverColor: "#2c2219",
  coverAccent: "#c9a45c",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Taylor & Edwardes", translator: "Edgar Taylor and Marian Edwardes", aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: false }
    // Text only: Danish narration is disabled.
  ]
};
var ARABIAN_NIGHTS = {
  id: "arabian-nights",
  title: "The Arabian Nights Entertainments",
  author: "Andrew Lang",
  altTitles: ["The Arabian Nights"],
  description: "A sultan's nightly story-bargain opens tales of genies, sailors, merchants and a magic lamp.",
  year: 1898,
  wordCount: 111099,
  coverColor: "#1d2738",
  coverAccent: "#d6b05a",
  editions: [
    { key: "original-en", language: "en", style: "original", label: "Lang (1898)", year: 1898, aligned: true, hasAudio: true },
    { key: "modern-en", language: "en", style: "modern", label: "Modern English", aligned: true, hasAudio: true },
    { key: "modern-da", language: "da", style: "modern", label: "Moderne Dansk", aligned: true, hasAudio: false }
    // Text only: Danish narration is disabled.
  ]
};
var BOOKS = [TO_THE_LIGHTHOUSE, ODYSSEY, ULYSSES, WAR_AND_PEACE, BIBLE, GILGAMESH, HAMLET, MACBETH, MIDSUMMER, ROMEO_AND_JULIET, THE_TEMPEST, THE_ART_OF_WAR, PRIDE_AND_PREJUDICE, CRIME_AND_PUNISHMENT, THE_REPUBLIC, MEDITATIONS, DIVINE_COMEDY, JANE_EYRE, THE_AENEID, PARADISE_LOST, FRANKENSTEIN, THE_MANUAL, APOLOGY, SYMPOSIUM, PHAEDO, CRITO, PHAEDRUS, POETICS, MOBY_DICK, GREAT_EXPECTATIONS, THE_HISTORIES, NIELS_LYHNE, IMITATION_OF_CHRIST, JERUSALEM, THE_AWAKENING, BROTHERS_KARAMAZOV, ILIAD, NICOMACHEAN_ETHICS, THE_PRINCE, BEYOND_GOOD_AND_EVIL, KANT_GROUNDWORK, BEOWULF, CANDIDE, DEMOCRACY_IN_AMERICA, OEDIPUS_REX, OEDIPUS_AT_COLONUS, ANTIGONE, GENEALOGY_OF_MORALS, DESCARTES_MEDITATIONS, ON_LIBERTY, UTILITARIANISM, PELOPONNESIAN_WAR, ARISTOTLE_POLITICS, LEVIATHAN, FEAR_AND_TREMBLING, COMMUNIST_MANIFESTO, SECOND_TREATISE, HUME_ENQUIRY, SOCIAL_CONTRACT, WEALTH_OF_NATIONS, WERTHER, FAUST_PART_1, ORESTEIA, BACCHAE, MEDEA, CONFESSIONS, NOTES_FROM_UNDERGROUND, MAGNA_CARTA, US_FOUNDING_DOCUMENTS, FEDERALIST_PAPERS, FREDERICK_DOUGLASS, A_LITTLE_PRINCESS, THE_JUNGLE_BOOK, AROUND_THE_WORLD_IN_80_DAYS, HEART_OF_DARKNESS, DISCOURSE_ON_INEQUALITY, JEKYLL_AND_HYDE, WALDEN, VINDICATION_RIGHTS_OF_WOMAN, COMEDY_OF_ERRORS, MERCHANT_OF_VENICE, HENRY_V, AS_YOU_LIKE_IT, WINTERS_TALE, JULIUS_CAESAR, TWELFTH_NIGHT, MEASURE_FOR_MEASURE, HENRY_IV_PART_2, MERRY_WIVES_OF_WINDSOR, OTHELLO, KING_LEAR, MUCH_ADO_ABOUT_NOTHING, TAMING_OF_THE_SHREW, ANTONY_AND_CLEOPATRA, RICHARD_III, CORIOLANUS, CYMBELINE, ANNA_KARENINA, DON_QUIXOTE, ESSAYS_MONTAIGNE, IVAN_ILYICH, ALICE_IN_WONDERLAND, WUTHERING_HEIGHTS, MIDDLEMARCH, SENSE_AND_SENSIBILITY, THE_SOVEREIGN_CHILD, LORDS_OF_THE_COSMOS, BOLD_CONJECTURES_VOLUME_1, BOLD_CONJECTURES_VOLUME_2, THE_FARTHEST_REACHES, GRIMMS_FAIRY_TALES, ARABIAN_NIGHTS];

// scripts/android/native-books.ts
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
function buildNativeBooks(publicRoot, registry, catalogue, prefaces) {
  const manifests = {};
  const books = catalogue.books.filter((book) => book.discoveryAvailable !== false).map((view) => {
    const source = registry.find((book2) => book2.id === view.id);
    if (!source) throw new Error("Native catalogue book has no registry: " + view.id);
    const editions = source.editions.filter((edition) => edition.language !== "da" && view.editions.some((item) => item.key === edition.key && item.discoveryAvailable !== false && item.availability.chapterText));
    const files = [];
    const add = (relative) => {
      const file = path.join(publicRoot, relative);
      if (!fs.existsSync(file)) return;
      if (fs.statSync(file).isDirectory()) {
        for (const name of fs.readdirSync(file).sort()) add(relative + "/" + name);
        return;
      }
      const data = fs.readFileSync(file);
      files.push({ path: "/" + relative, sha256: createHash("sha256").update(data).digest("hex"), bytes: data.length });
    };
    for (const edition of editions) {
      add("data/editions/" + view.id + "-" + edition.key + ".json");
      add("data/editions-chapters/" + view.id + "-" + edition.key);
    }
    for (const name of fs.readdirSync(path.join(publicRoot, "data/editions")).sort()) {
      if (name === view.id + "-threads.json" || name === view.id + "-lines.json") add("data/editions/" + name);
    }
    add("data/characters/" + view.id + ".v1.json");
    for (const edition of editions) add("data/characters/" + view.id + ".v1." + edition.key + ".json");
    add("data/onboarding/" + view.id + ".json");
    add("covers/v2/" + view.id + ".webp");
    const preface = prefaces.get(view.id);
    if (preface) files.push({ path: "/lab/prefaces/" + view.id + ".json", sha256: createHash("sha256").update(preface).digest("hex"), bytes: Buffer.byteLength(preface) });
    if (!editions.length || editions.some((edition) => !files.some((file) => file.path === "/data/editions/" + view.id + "-" + edition.key + ".json"))) {
      throw new Error("Native download is missing a published edition: " + view.id);
    }
    files.sort((a, b) => a.path.localeCompare(b.path));
    const book = { ...source, editions };
    const manifest = { schema: 1, book, view: { ...view, editions: view.editions.filter((edition) => editions.some((item) => item.key === edition.key)) }, files };
    const text = JSON.stringify(manifest);
    const revision = createHash("sha256").update(text).digest("hex");
    const shardedEditions = editions.filter((edition) => files.some((file) => file.path === "/data/editions-chapters/" + book.id + "-" + edition.key + "/manifest.json")).map((edition) => book.id + "-" + edition.key);
    const entry = { id: book.id, revision, shardedEditions, bytes: files.reduce((total, file) => total + file.bytes, 0), manifest: "/native-books/" + book.id + "-" + revision + ".json", book, view: manifest.view };
    manifests[entry.manifest.slice(1)] = text;
    return entry;
  });
  const nativeCatalogue = { ...catalogue, books: catalogue.books.map((view) => ({
    ...view,
    editions: view.editions.map((edition) => edition.language === "da" ? { ...edition, discoveryAvailable: false } : edition)
  })) };
  return { index: JSON.stringify({ schema: 1, catalogue: nativeCatalogue, books }), manifests };
}

// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/user/tinct/app/node_modules/vite/dist/node/index.js";
import react from "file:///home/user/tinct/app/node_modules/@vitejs/plugin-react/dist/index.js";
import fs3 from "fs";
import path4 from "path";

// src/data/editionAvailability.json
var editionAvailability_default = {
  version: 1,
  date: "2026-09-25",
  wholeBooks: [
    "discourse-on-inequality",
    "gilgamesh",
    "second-treatise",
    "social-contract",
    "symposium"
  ],
  editions: {
    "macbeth/modern-da": {
      reason: "Important speeches are missing, including the dagger soliloquy.",
      sha256: "c10696221af2265dfa00fdc8f09a27dfd1d2a5289da347d3a6fd82a1de125d57"
    },
    "as-you-like-it/modern-da": {
      reason: "The opening scene is missing and licence notices appear inside the reading text.",
      sha256: "80064e115bd31f194fa60e16f1ec08ee4b99efc5f1cc199ec7a4ac34dd52d8ef"
    },
    "faust-part-1/modern-da": {
      reason: "Important passages are missing and this edition contains text in the wrong language. The English source attribution also needs correction.",
      sha256: "ce719108b40e89f1f008d16a62e1fa7dc9e1f1600b2481439696873f9b471191"
    },
    "jerusalem/modern-da": {
      reason: "Passage endings are missing or replaced with text absent from the source.",
      sha256: "c1552e9a9a3a311b75e1d83ee104ff33c71c1a538bf68fd4bfd5d4f000a78223"
    },
    "confessions/modern-da": {
      reason: "Books 10\u201313 contain placeholders instead of the text.",
      sha256: "4935d43ca05f87da69b94c37d3b2079ed8591a7769cf45f57a213690ec0b19bb"
    },
    "paradise-lost/modern-da": {
      reason: "Major passages are missing, including the end of Book 5.",
      sha256: "266ada0a3a74b0838b1dfe4a54a08d2959f03d627ddc955e954fcb306ead117c"
    },
    "heart-of-darkness/modern-da": {
      reason: "Part III is English text offered as Danish.",
      sha256: "b0d43952a120819a451538113d82947f922ddaba0535257fb19bd909ba834444"
    },
    "discourse-on-inequality/modern-da": {
      reason: "Part II is English text offered as Danish.",
      sha256: "383db95bbf30559d6ba41eb2045d37f2a24db49e9a3e80b2e246efb8e6b2c224"
    },
    "vindication-rights-of-woman/modern-da": {
      reason: "Much of this edition is English text offered as Danish.",
      sha256: "41ec7c251015ca8079dc88e5845757ac634fbf4c62f6ab03160ed5e686fc8880"
    },
    "discourse-on-inequality/original-fr": {
      reason: "Rights: the live English text is G. D. H. Cole's 1913 translation (Cole d. 1959); a public-domain replacement is being built.",
      sha256: "6d62dac119c1f5cea89b175a3cc20ae2f1a9a7829c0475845360be4648f92cb8"
    },
    "discourse-on-inequality/original-en": {
      reason: "Rights: the live English text is G. D. H. Cole's 1913 translation (Cole d. 1959); a public-domain replacement is being built.",
      sha256: "d3e7e7975ac634b98f685abcd7f6aae64b3621a74db31e1d229f2b6cfc4ba3bd"
    },
    "discourse-on-inequality/modern-en": {
      reason: "Rights: the live English text is G. D. H. Cole's 1913 translation (Cole d. 1959); a public-domain replacement is being built.",
      sha256: "78356e4ffdf62ec28c056fe871521967da428d31fafe694cad8b064f7019c62f"
    },
    "gilgamesh/original-en": {
      reason: "Rights: the live English text is not cleared for Tinct; a public-domain replacement is being built.",
      sha256: "1c9886e2b341187c3dd2b0e4fbcbfc285e65f7631ae6944d094424ac50ef31cc"
    },
    "gilgamesh/modern-en": {
      reason: "Rights: the live English text is not cleared for Tinct; a public-domain replacement is being built.",
      sha256: "419a43b05bfcbf84dce9f1948158a8f3d34a4b6dc41c93767c827aede87ad63c"
    },
    "second-treatise/original-en": {
      reason: "Held out of the library at Anders's instruction (2026-10-02 rights holds).",
      sha256: "efbd7cabd14ed99f98aabae7a95f48e8102db75f0b7aaae0054d0ffe4675b0d0"
    },
    "second-treatise/modern-en": {
      reason: "Held out of the library at Anders's instruction (2026-10-02 rights holds).",
      sha256: "f6799fa25a28d93cec6029b76e929c788c4d123d02450b517fd128c3a73e6dd2"
    },
    "social-contract/original-en": {
      reason: "Rights: the live English text is G. D. H. Cole's 1913 translation (Cole d. 1959); a public-domain replacement is being built.",
      sha256: "7bf5ababb7c4dfe1cec0230d44f64960d8b447c4802b6a716b52d770a5854157"
    },
    "social-contract/modern-en": {
      reason: "Rights: the live English text is G. D. H. Cole's 1913 translation (Cole d. 1959); a public-domain replacement is being built.",
      sha256: "cf7facb77bfc5bafc99cb4d7a236fd4f59d5f9ffc4554c6f063ee8daae273843"
    },
    "symposium/original-en": {
      reason: "Held out of the library at Anders's instruction (2026-10-02 rights holds).",
      sha256: "3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6"
    },
    "symposium/modern-en": {
      reason: "Held out of the library at Anders's instruction (2026-10-02 rights holds).",
      sha256: "1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f"
    }
  },
  wholeBookReasons: {
    "discourse-on-inequality": "Rights: the live English text is G. D. H. Cole's 1913 translation (Cole d. 1959); a public-domain replacement is being built.",
    gilgamesh: "Rights: the live English text is not cleared for Tinct; a public-domain replacement is being built.",
    "second-treatise": "Held out of the library at Anders's instruction (2026-10-02 rights holds).",
    "social-contract": "Rights: the live English text is G. D. H. Cole's 1913 translation (Cole d. 1959); a public-domain replacement is being built.",
    symposium: "Held out of the library at Anders's instruction (2026-10-02 rights holds)."
  }
};

// src/data/editionAvailability.ts
var TEMPORARY_EDITION_HOLDS = editionAvailability_default.editions;
var OFFERED_DANISH_EDITIONS = /* @__PURE__ */ new Set([
  "to-the-lighthouse/modern-da",
  "a-little-princess/modern-da",
  "around-the-world-80-days/modern-da",
  "jungle-book/modern-da",
  "grimms-fairy-tales/modern-da",
  "arabian-nights/modern-da"
]);
var isOfferedDanishEdition = (bookId, editionKey) => Boolean(editionKey) && OFFERED_DANISH_EDITIONS.has(bookId + "/" + editionKey);
var isEditionLanguageOffered = (bookId, edition) => edition.language !== "da" || isOfferedDanishEdition(bookId, edition.key);
function editionHold(bookId, editionKey) {
  if (!editionKey) return void 0;
  if (editionKey.endsWith("-da") && !isOfferedDanishEdition(bookId, editionKey)) return { reason: "Danish editions are no longer offered in Tinct. Your original text, reading place, highlights and notes remain preserved." };
  return TEMPORARY_EDITION_HOLDS[bookId + "/" + editionKey];
}
var isBookTemporarilyHeld = (bookId) => editionAvailability_default.wholeBooks.includes(bookId);

// src/data/audioAvailability.json
var audioAvailability_default = {
  held_books: [
    "democracy-in-america",
    "essays-montaigne",
    "faust-part-1",
    "ivan-ilyich",
    "measure-for-measure",
    "merry-wives-of-windsor",
    "ulysses",
    "war-and-peace"
  ],
  eligible_editions: [
    "a-little-princess/modern-en",
    "a-little-princess/original-en",
    "alice-in-wonderland/modern-en",
    "alice-in-wonderland/original-en",
    "anna-karenina/modern-en",
    "antigone/modern-en",
    "antigone/original-en",
    "antony-and-cleopatra/modern-en",
    "antony-and-cleopatra/original-en",
    "apology/original-en",
    "arabian-nights/modern-en",
    "arabian-nights/original-en",
    "aristotle-politics/modern-en",
    "around-the-world-80-days/original-en",
    "as-you-like-it/original-en",
    "bacchae/modern-en",
    "bacchae/original-en",
    "beowulf/modern-en",
    "beowulf/original-en",
    "beyond-good-and-evil/original-en",
    "bible/bsb-en",
    "bible/kjv-en",
    "bible/web-en",
    "bible/webc-en",
    "bold-conjectures-volume-1/original-en",
    "bold-conjectures-volume-2/original-en",
    "brothers-karamazov/modern-en",
    "brothers-karamazov/original-en",
    "candide/original-en",
    "comedy-of-errors/modern-en",
    "comedy-of-errors/original-en",
    "communist-manifesto/modern-en",
    "communist-manifesto/original-en",
    "confessions/modern-en",
    "confessions/original-en",
    "coriolanus/modern-en",
    "coriolanus/original-en",
    "crime-and-punishment/original-en",
    "crito/modern-en",
    "crito/original-en",
    "cymbeline/modern-en",
    "cymbeline/original-en",
    "descartes-meditations/original-en",
    "discourse-on-inequality/original-en",
    "divine-comedy/original-en",
    "don-quixote/modern-en",
    "don-quixote/original-en",
    "fear-and-trembling/modern-en",
    "fear-and-trembling/original-en",
    "federalist-papers/modern-en",
    "federalist-papers/original-en",
    "frankenstein/original-en",
    "frederick-douglass/modern-en",
    "frederick-douglass/original-en",
    "genealogy-of-morals/modern-en",
    "genealogy-of-morals/original-en",
    "gilgamesh/original-en",
    "great-expectations/modern-en",
    "grimms-fairy-tales/modern-en",
    "grimms-fairy-tales/original-en",
    "hamlet/modern-en",
    "hamlet/original-en",
    "heart-of-darkness/original-en",
    "henry-iv-part-2/modern-en",
    "henry-iv-part-2/original-en",
    "henry-v/modern-en",
    "henry-v/original-en",
    "hume-enquiry/modern-en",
    "hume-enquiry/original-en",
    "iliad/modern-en",
    "iliad/original-en",
    "imitation-of-christ/modern-en",
    "imitation-of-christ/original-en",
    "jane-eyre/original-en",
    "jekyll-and-hyde/original-en",
    "jerusalem/modern-en",
    "jerusalem/original-en",
    "julius-caesar/original-en",
    "jungle-book/modern-en",
    "jungle-book/original-en",
    "kant-groundwork/modern-en",
    "kant-groundwork/original-en",
    "king-lear/modern-en",
    "king-lear/original-en",
    "leviathan/modern-en",
    "leviathan/original-en",
    "lords-of-the-cosmos/original-en",
    "macbeth/modern-en",
    "macbeth/original-en",
    "magna-carta/modern-en",
    "magna-carta/original-en",
    "medea/modern-en",
    "medea/original-en",
    "meditations/original-en",
    "merchant-of-venice/original-en",
    "middlemarch/modern-en",
    "middlemarch/original-en",
    "midsummer/modern-en",
    "midsummer/original-en",
    "moby-dick/modern-en",
    "moby-dick/original-en",
    "much-ado-about-nothing/modern-en",
    "much-ado-about-nothing/original-en",
    "nicomachean-ethics/modern-en",
    "nicomachean-ethics/original-en",
    "niels-lyhne/modern-en",
    "notes-from-underground/modern-en",
    "notes-from-underground/original-en",
    "odyssey/modern-en",
    "odyssey/original-en",
    "oedipus-at-colonus/modern-en",
    "oedipus-at-colonus/original-en",
    "oedipus-rex/modern-en",
    "on-liberty/modern-en",
    "on-liberty/original-en",
    "oresteia/modern-en",
    "oresteia/original-en",
    "othello/modern-en",
    "othello/original-en",
    "paradise-lost/original-en",
    "peloponnesian-war/modern-en",
    "peloponnesian-war/original-en",
    "phaedo/modern-en",
    "phaedo/original-en",
    "phaedrus/modern-en",
    "phaedrus/original-en",
    "poetics/modern-en",
    "poetics/original-en",
    "pride-and-prejudice/original-en",
    "richard-iii/modern-en",
    "richard-iii/original-en",
    "romeo-and-juliet/modern-en",
    "romeo-and-juliet/original-en",
    "second-treatise/modern-en",
    "second-treatise/original-en",
    "sense-and-sensibility/modern-en",
    "sense-and-sensibility/original-en",
    "social-contract/modern-en",
    "social-contract/original-en",
    "symposium/modern-en",
    "symposium/original-en",
    "taming-of-the-shrew/modern-en",
    "taming-of-the-shrew/original-en",
    "the-aeneid/modern-en",
    "the-aeneid/original-en",
    "the-art-of-war/modern-en",
    "the-art-of-war/original-en",
    "the-awakening/modern-en",
    "the-awakening/original-en",
    "the-farthest-reaches/original-en",
    "the-histories/original-en",
    "the-manual/modern-en",
    "the-manual/original-en",
    "the-prince/original-en",
    "the-republic/original-en",
    "the-sovereign-child/original-en",
    "the-tempest/modern-en",
    "the-tempest/original-en",
    "to-the-lighthouse/modern-en",
    "to-the-lighthouse/original-en",
    "twelfth-night/modern-en",
    "twelfth-night/original-en",
    "us-founding-documents/modern-en",
    "us-founding-documents/original-en",
    "utilitarianism/original-en",
    "vindication-rights-of-woman/modern-en",
    "vindication-rights-of-woman/original-en",
    "walden/modern-en",
    "walden/original-en",
    "wealth-of-nations/modern-en",
    "werther/modern-en",
    "werther/original-en",
    "winters-tale/original-en",
    "wuthering-heights/modern-en",
    "wuthering-heights/original-en"
  ],
  held_editions: [
    {
      key: "anna-karenina/original-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "apology/modern-en",
      issues: [
        "wrong_text_audio"
      ]
    },
    {
      key: "aristotle-politics/original-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "around-the-world-80-days/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "as-you-like-it/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "beyond-good-and-evil/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "candide/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "crime-and-punishment/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "democracy-in-america/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "democracy-in-america/original-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "descartes-meditations/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "discourse-on-inequality/modern-en",
      issues: [
        "missing_audio",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "divine-comedy/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "essays-montaigne/modern-en",
      issues: [
        "extra_paragraphs",
        "missing_audio",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "essays-montaigne/original-en",
      issues: [
        "empty_audio",
        "extra_paragraphs",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "faust-part-1/modern-en",
      issues: [
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "faust-part-1/original-en",
      issues: [
        "extra_paragraphs",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "frankenstein/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "gilgamesh/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "great-expectations/original-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "heart-of-darkness/modern-en",
      issues: [
        "missing_audio",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "ivan-ilyich/modern-en",
      issues: [
        "missing_manifest"
      ]
    },
    {
      key: "ivan-ilyich/original-en",
      issues: [
        "missing_manifest"
      ]
    },
    {
      key: "jane-eyre/modern-en",
      issues: [
        "extra_paragraphs",
        "missing_audio"
      ]
    },
    {
      key: "jekyll-and-hyde/modern-en",
      issues: [
        "missing_audio",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "julius-caesar/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "measure-for-measure/modern-en",
      issues: [
        "extra_paragraphs",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "measure-for-measure/original-en",
      issues: [
        "extra_paragraphs",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "meditations/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "merchant-of-venice/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "merry-wives-of-windsor/modern-en",
      issues: [
        "extra_paragraphs",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "merry-wives-of-windsor/original-en",
      issues: [
        "extra_paragraphs",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "niels-lyhne/original-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "oedipus-rex/original-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "paradise-lost/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "pride-and-prejudice/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "the-histories/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "the-prince/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "the-republic/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "ulysses/modern-en",
      issues: [
        "empty_audio"
      ]
    },
    {
      key: "ulysses/original-en",
      issues: [
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "utilitarianism/modern-en",
      issues: [
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "war-and-peace/modern-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "war-and-peace/original-en",
      issues: [
        "empty_audio",
        "missing_audio",
        "missing_spoken_paragraphs"
      ]
    },
    {
      key: "wealth-of-nations/original-en",
      issues: [
        "missing_audio"
      ]
    },
    {
      key: "winters-tale/modern-en",
      issues: [
        "missing_audio"
      ]
    }
  ],
  basis: "September 10 structural audio audit; Antigone and Confessions original-en reclassified September 14 after missing paragraph recordings and word sidecars were repaired and served-hash verified. This is not whole-library acoustic certification. Antigone modern-en rechecked September 22: 10 complete chapters pass timing/text validation; chapter 10 remains held for missing p12.mp3.",
  held_chapters: [
    {
      key: "antigone/modern-en",
      chapters: [
        10
      ],
      issues: [
        "missing_audio:ch10/p12.mp3"
      ]
    }
  ]
};

// src/data/audioAvailability.ts
var held = new Set(audioAvailability_default.held_editions.map((edition) => edition.key));
var heldChapters = new Map(audioAvailability_default.held_chapters.map((entry) => [entry.key, new Set(entry.chapters)]));
var heldBooks = new Set(audioAvailability_default.held_books);
var isAudioHeld = (bookId, editionKey, chapter) => {
  const key = `${bookId}/${editionKey}`;
  return held.has(key) || chapter !== void 0 && Boolean(heldChapters.get(key)?.has(chapter));
};
var isBookDiscoverable = (bookId) => !isBookTemporarilyHeld(bookId) && (bookId === "faust-part-1" || !heldBooks.has(bookId));
var SEARCH_ONLY_BOOKS = /* @__PURE__ */ new Set(["war-and-peace"]);
var isBookSearchable = (bookId) => isBookDiscoverable(bookId) || !isBookTemporarilyHeld(bookId) && SEARCH_ONLY_BOOKS.has(bookId);
var isEditionDiscoverable = (bookId, edition) => isEditionLanguageOffered(bookId, edition) && !editionHold(bookId, edition.key);

// src/data/withheldEditions.ts
var SUCCESSORS = {
  "bible/modern-en": "web-en",
  "bible/modern-da": "web-en",
  "meditations/modern-da": "modern-en",
  // 2026-10-02 rights release: the English text of these four books was
  // replaced (Giles, Murray, Davis -> Calthrop, Way, McKechnie) and their
  // modern-da renders the replaced text. Withdrawn at Anders's request; the
  // files are kept, unserved, in books/withheld-assets/2026-10-02-rights/.
  // Danish has been held since 2026-09-21, so only older saved places exist;
  // they follow the old paragraphing, so at the same paragraph of modern-en
  // the place is approximate (same chapter).
  "the-art-of-war/modern-da": "modern-en",
  "medea/modern-da": "modern-en",
  "bacchae/modern-da": "modern-en",
  "magna-carta/modern-da": "modern-en"
};
function isEditionWithheld(bookId, editionKey) {
  return `${bookId}/${editionKey}` in SUCCESSORS;
}

// src/data/publisherPermissions.json
var publisherPermissions_default = {
  basis: "In-copyright books published on Tinct with the publisher's permission: Logan Chipkin for Conjecture Institute, 8 October 2026 (books/wip/conjecture-books-2026-10/rights/permission.md). Never label these public domain. Rights lines are the books' own copyright pages.",
  books: {
    "the-sovereign-child": {
      publisher: "Conjecture Institute",
      rights: "Copyright \xA9 2025 Aaron Stupple. All rights reserved."
    },
    "lords-of-the-cosmos": {
      publisher: "Conjecture Institute",
      rights: "\u201CThis Book Has No Copyright.\u201D Arjun Khemani and Logan Chipkin, 2025."
    },
    "bold-conjectures-volume-1": {
      publisher: "Conjecture Institute",
      rights: "Copyright \xA9 2025 Logan Chipkin. All rights reserved."
    },
    "bold-conjectures-volume-2": {
      publisher: "Conjecture Press",
      rights: "Copyright \xA9 2026 Conjecture Institute. All rights reserved."
    },
    "the-farthest-reaches": {
      publisher: "Conjecture Institute",
      rights: "Copyright \xA9 2026 Brett Hall. All rights reserved."
    }
  }
};

// src/data/publisherPermissions.ts
var PERMISSIONS = publisherPermissions_default.books;
function publisherPermission(bookId) {
  return PERMISSIONS[bookId] ?? null;
}

// src/data/libraryTaxonomy.ts
var LIBRARY_BOOK_META = [
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
    "blurb": "The oldest surviving story \u2014 a king's grief and the search for what cannot die.",
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
    "year": "c. 1200 BC \u2013 100 AD",
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
    "blurb": "The first real autobiography \u2014 and an argument with God.",
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
    "ySort": 1e3,
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
    "blurb": "A guided tour of hell, purgatory, and paradise \u2014 in terza rima.",
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
    "author": "Thomas \xE0 Kempis",
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
    "author": "Niccol\xF2 Machiavelli",
    "year": "1532",
    "ySort": 1532,
    "form": "political",
    "era": "early-modern",
    "hue": 25,
    "blurb": "How to take power and not lose it. Notoriously practical.",
    "themes": [
      "power",
      "fortune",
      "virt\xF9"
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
    "blurb": 'Without the state, life is "nasty, brutish, and short."',
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
    "id": "much-ado-about-nothing",
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
    "author": "Ren\xE9 Descartes",
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
    "id": "kant-groundwork",
    "title": "Groundwork of the Metaphysics of Morals",
    "author": "Immanuel Kant",
    "year": "1785",
    "ySort": 1785,
    "form": "philosophy",
    "era": "early-modern",
    "hue": 265,
    "blurb": "Duty, reason, and the categorical imperative in its shortest form.",
    "themes": [
      "ethics",
      "duty",
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
    "year": "1776\u20131791",
    "ySort": 1776,
    "form": "history",
    "era": "early-modern",
    "hue": 90,
    "blurb": "Declaration, Constitution, Bill of Rights \u2014 bundled.",
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
    "blurb": '85 essays defending a new constitution, published under "Publius."',
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
    "id": "werther",
    "title": "The Sorrows of Young Werther",
    "author": "Johann Wolfgang von Goethe",
    "year": "1774",
    "ySort": 1774,
    "form": "novel",
    "era": "early-modern",
    "hue": 25,
    "blurb": "A young man writes himself into love and despair.",
    "themes": [
      "romanticism",
      "desire",
      "melancholy"
    ],
    "shelves": [
      "satirical-novels",
      "modern-philosophy"
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
    "author": "S\xF8ren Kierkegaard",
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
    "id": "frederick-douglass",
    "title": "Narrative of the Life of Frederick Douglass",
    "author": "Frederick Douglass",
    "year": "1845",
    "ySort": 1845,
    "form": "memoir",
    "era": "modern",
    "hue": 25,
    "blurb": "The most influential American slave narrative, written while its author was still legally a fugitive.",
    "themes": [
      "slavery",
      "literacy",
      "freedom"
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
    "id": "jane-eyre",
    "title": "Jane Eyre",
    "author": "Charlotte Bront\xEB",
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
      "american-novels",
      "adventure"
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
    "blurb": "Where one person's freedom ends \u2014 and why it must end there.",
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
    "blurb": "I am a sick man \u2014 a spiteful man.",
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
    "form": "novel",
    "era": "modern",
    "hue": 60,
    "blurb": "Phileas Fogg bets the club; the clock starts.",
    "themes": [
      "adventure",
      "wager",
      "travel"
    ],
    "shelves": [
      "adventure"
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
    "id": "ivan-ilyich",
    "title": "The Death of Ivan Ilyich",
    "author": "Leo Tolstoy",
    "year": "1886",
    "ySort": 1886.1,
    "form": "novel",
    "era": "modern",
    "hue": 355,
    "blurb": "A successful judge confronts the life he built as death draws near.",
    "themes": [
      "mortality",
      "meaning",
      "compassion"
    ],
    "shelves": [
      "russian-novels"
    ],
    "langs": [
      "EN",
      "DA",
      "RU"
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
    "form": "novel",
    "era": "modern",
    "hue": 90,
    "blurb": "A boy raised by wolves; assorted other tales.",
    "themes": [
      "wild",
      "belonging",
      "law"
    ],
    "shelves": [
      "adventure"
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
      "english-novels",
      "adventure"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "jerusalem",
    "title": "Jerusalem",
    "author": "Selma Lagerl\xF6f",
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
    "form": "novel",
    "era": "contemporary",
    "hue": 310,
    "blurb": "A girl loses everything; her imagination keeps her warm.",
    "themes": [
      "imagination",
      "resilience",
      "school"
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
    "blurb": "A knight, a squire, a windmill. The first modern novel.",
    "themes": [
      "illusion",
      "chivalry",
      "madness"
    ],
    "shelves": [
      "satirical-novels",
      "adventure"
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
    "blurb": 'The book that invented the essay \u2014 "What do I know?"',
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
      "EN"
    ]
  },
  {
    "id": "alice-in-wonderland",
    "title": "Alice's Adventures in Wonderland",
    "author": "Lewis Carroll",
    "year": "1865",
    "ySort": 1865,
    "form": "novel",
    "era": "modern",
    "hue": 150,
    "blurb": "Alice follows a hurried rabbit into a world of shifting sizes, disputed meanings and impatient rulers.",
    "themes": [
      "language",
      "identity",
      "authority"
    ],
    "shelves": [
      "english-novels",
      "satirical-novels"
    ],
    "langs": [
      "EN"
    ]
  },
  {
    "id": "wuthering-heights",
    "title": "Wuthering Heights",
    "author": "Emily Bront\xEB",
    "year": "1847",
    "ySort": 1847,
    "form": "novel",
    "era": "modern",
    "hue": 285,
    "blurb": "Two Yorkshire households carry a childhood attachment, a family grievance and a struggle over property into another generation.",
    "themes": [
      "revenge",
      "class",
      "inheritance"
    ],
    "shelves": [
      "english-novels",
      "gothic-novels"
    ],
    "langs": [
      "EN"
    ]
  },
  {
    "id": "middlemarch",
    "title": "Middlemarch",
    "author": "George Eliot",
    "year": "1871",
    "ySort": 1871,
    "form": "novel",
    "era": "modern",
    "hue": 265,
    "blurb": "Interwoven lives in a provincial town test what ambition, marriage, and sympathy can make possible.",
    "themes": [
      "marriage",
      "ambition",
      "sympathy"
    ],
    "shelves": [
      "english-novels"
    ],
    "langs": [
      "EN"
    ]
  },
  {
    "id": "sense-and-sensibility",
    "title": "Sense and Sensibility",
    "author": "Jane Austen",
    "year": "1811",
    "ySort": 1811,
    "form": "novel",
    "era": "modern",
    "hue": 265,
    "blurb": "Two sisters confront love, money, and the limits of their own judgment after losing the security of their family home.",
    "themes": [
      "marriage",
      "money",
      "judgment"
    ],
    "shelves": [
      "english-novels"
    ],
    "langs": [
      "EN"
    ]
  },
  {
    "id": "adventures-of-sherlock-holmes",
    "title": "The Adventures of Sherlock Holmes",
    "author": "Arthur Conan Doyle",
    "year": "1892",
    "ySort": 1892,
    "form": "short-stories",
    "era": "modern",
    "hue": 265,
    "blurb": "Twelve cases from Baker Street, told by Watson, in which an apparently trivial detail turns an entire explanation.",
    "themes": [
      "observation",
      "inference",
      "deception"
    ],
    "shelves": [
      "detective-fiction"
    ],
    "langs": [
      "EN"
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
  },
  {
    "id": "the-sovereign-child",
    "title": "The Sovereign Child",
    "author": "Aaron Stupple with Logan Chipkin",
    "tradition": "American",
    "year": "2025",
    "ySort": 2025,
    "form": "philosophy",
    "era": "2020s",
    "hue": 200,
    "blurb": "Parenting without rules, argued from a theory of knowledge.",
    "themes": [
      "parenting",
      "autonomy",
      "epistemology"
    ],
    "shelves": [
      "critical-rationalism"
    ]
  },
  {
    "id": "lords-of-the-cosmos",
    "title": "Lords of the Cosmos",
    "author": "Arjun Khemani and Logan Chipkin",
    "year": "2025",
    "ySort": 2025.1,
    "form": "philosophy",
    "era": "2020s",
    "hue": 265,
    "blurb": "From cosmic monotony to the Enlightenment, a history of everything told through knowledge.",
    "themes": [
      "progress",
      "optimism",
      "enlightenment"
    ],
    "shelves": [
      "critical-rationalism"
    ]
  },
  {
    "id": "bold-conjectures-volume-1",
    "title": "Bold Conjectures, Volume I",
    "author": "Logan Chipkin (ed.)",
    "year": "2025",
    "ySort": 2025.2,
    "form": "philosophy",
    "era": "2020s",
    "hue": 50,
    "blurb": "David Deutsch in conversation, 2012\u20132024.",
    "themes": [
      "quantum-theory",
      "epistemology",
      "interviews"
    ],
    "shelves": [
      "critical-rationalism"
    ]
  },
  {
    "id": "bold-conjectures-volume-2",
    "title": "Bold Conjectures, Volume II",
    "author": "Logan Chipkin (ed.)",
    "year": "2026",
    "ySort": 2026,
    "form": "philosophy",
    "era": "2020s",
    "hue": 215,
    "blurb": "Physicists on what is still unsettled in fundamental physics.",
    "themes": [
      "physics",
      "quantum-theory",
      "essays"
    ],
    "shelves": [
      "critical-rationalism"
    ]
  },
  {
    "id": "the-farthest-reaches",
    "title": "The Farthest Reaches",
    "author": "Brett Hall",
    "year": "2026",
    "ySort": 2026.1,
    "form": "philosophy",
    "era": "2020s",
    "hue": 330,
    "blurb": "Why people are the most important entities in the universe.",
    "themes": [
      "personhood",
      "universality",
      "epistemology"
    ],
    "shelves": [
      "critical-rationalism"
    ]
  },
  {
    "id": "grimms-fairy-tales",
    "title": "Grimms\u2019 Fairy Tales",
    "author": "Jacob and Wilhelm Grimm",
    "year": "1812",
    "ySort": 1812,
    "form": "short-stories",
    "era": "modern",
    "hue": 30,
    "blurb": "Sixty-five tales of kings, tailors, stepmothers and talking animals, told in plain, repeated patterns.",
    "themes": [
      "tales",
      "justice",
      "transformation",
      "family",
      "cunning"
    ],
    "shelves": [
      "folk-and-fairy-tales"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  },
  {
    "id": "arabian-nights",
    "title": "The Arabian Nights Entertainments",
    "author": "Andrew Lang",
    "year": "1898",
    "ySort": 1898,
    "form": "short-stories",
    "era": "modern",
    "hue": 40,
    "blurb": "A sultan\u2019s nightly story-bargain opens tales of genies, sailors, merchants and a magic lamp.",
    "themes": [
      "storytelling",
      "fate",
      "power",
      "travel",
      "wonder"
    ],
    "shelves": [
      "folk-and-fairy-tales"
    ],
    "langs": [
      "EN",
      "DA"
    ]
  }
];
var LIBRARY_SHELVES = {
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
    "sub": "Augustine, \xE0 Kempis, Kierkegaard",
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
    "title": "Shakespeare \u2014 Tragedies",
    "sub": "Hamlet, Lear, Othello, Macbeth & co.",
    "hue": 355
  },
  "shakespeare-comedy": {
    "title": "Shakespeare \u2014 Comedies",
    "sub": "Romances, farces, problem plays",
    "hue": 150
  },
  "shakespeare-history": {
    "title": "Shakespeare \u2014 Histories",
    "sub": "The English chronicle plays",
    "hue": 265
  },
  "shakespeare-romance": {
    "title": "Shakespeare \u2014 Romances",
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
    "sub": "Jacobsen and Lagerl\xF6f",
    "hue": 90
  },
  "gothic-novels": {
    "title": "The Gothic",
    "sub": "Doubles, monsters, dark houses",
    "hue": 265
  },
  "detective-fiction": {
    "title": "Detective Fiction",
    "sub": "Cases, clues and the logic of inference",
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
  "adventure": {
    "title": "Adventure",
    "sub": "Journeys, wagers and the open sea",
    "hue": 60
  },
  "folk-and-fairy-tales": {
    "title": "Folk & Fairy Tales",
    "sub": "Tales from the oral tradition",
    "hue": 30
  },
  "critical-rationalism": {
    "title": "Critical Rationalism",
    "sub": "Popper, Deutsch and how knowledge grows",
    "hue": 175
  }
};
var LIBRARY_HOUSES = [
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
      "modern-philosophy",
      "critical-rationalism"
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
    "title": "Fiction",
    "sub": "Novels and stories, by tradition",
    "hue": 25,
    "shelves": [
      "russian-novels",
      "english-novels",
      "american-novels",
      "modernist-novels",
      "nordic-novels",
      "gothic-novels",
      "satirical-novels",
      "adventure",
      "folk-and-fairy-tales",
      "detective-fiction"
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
  }
];
var LIBRARY_READING_LISTS = [
  {
    "id": "yale-ds",
    "title": "Yale Directed Studies",
    "source": "Yale College",
    "description": "A first-year humanities intensive: three parallel year-long tracks \u2014 Literature, Philosophy, Historical & Political Thought \u2014 read concurrently. Condensed here to their common spine.",
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
        "note": "stub coming \u2014 selections only"
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
        "id": "to-the-lighthouse"
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
        "title": "Pens\xE9es",
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
    "source": 'Harold Bloom, "The Western Canon" (1994)',
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
        "title": "\xC0 la recherche du temps perdu",
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
        "id": "to-the-lighthouse"
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
    "description": "A self-study program organized by genre \u2014 Novels, Autobiography, History, Drama, Poetry \u2014 read chronologically within each. The Novels list is shown here.",
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
        "author": "Gabriel Garc\xEDa M\xE1rquez"
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
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "odyssey",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "oresteia",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "oedipus-rex",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "antigone",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "medea",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "symposium",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "the-republic",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "bible",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "the-aeneid",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "confessions",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "divine-comedy",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "paradise-lost",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "pride-and-prejudice",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "brothers-karamazov",
        "note": "4\xD7 on the canons above"
      },
      {
        "id": "bacchae",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "nicomachean-ethics",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "aristotle-politics",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "the-prince",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "hamlet",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "the-tempest",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "leviathan",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "second-treatise",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "discourse-on-inequality",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "social-contract",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "faust-part-1",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "democracy-in-america",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "communist-manifesto",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "war-and-peace",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "genealogy-of-morals",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "ulysses",
        "note": "3\xD7 on the canons above"
      },
      {
        "id": "king-lear",
        "note": "3\xD7 on the canons above"
      }
    ]
  }
];
var LIBRARY_BOOK_META_BY_ID = Object.fromEntries(
  LIBRARY_BOOK_META.map((book) => [book.id, book])
);
var LIBRARY_BOOK_LISTS = {};
for (const list of LIBRARY_READING_LISTS) {
  list.sequence.forEach((entry, index) => {
    if (!entry.id) return;
    LIBRARY_BOOK_LISTS[entry.id] ||= [];
    LIBRARY_BOOK_LISTS[entry.id].push({
      listId: list.id,
      listTitle: list.title,
      position: index + 1,
      accent: list.accent
    });
  });
}
function getBookDisplayYear(book, meta) {
  if (meta?.year) return meta.year;
  if (book.year === void 0) return "";
  return book.year < 0 ? "c. " + Math.abs(book.year) + " BC" : String(book.year);
}

// src/lab/editionDifficulty.ts
var reviewed = {
  "odyssey:original-en": "Medium",
  "ulysses:original-en": "Hard",
  "war-and-peace:original-en": "Medium",
  "bible:kjv-en": "Hard",
  "bible:web-en": "Medium",
  "gilgamesh:original-en": "Hard",
  "hamlet:original-en": "Hard",
  "macbeth:original-en": "Hard",
  "midsummer:original-en": "Hard",
  "romeo-and-juliet:original-en": "Hard",
  "the-tempest:original-en": "Hard",
  "the-art-of-war:original-en": "Medium",
  "pride-and-prejudice:original-en": "Medium",
  "crime-and-punishment:original-en": "Medium",
  "the-republic:original-en": "Hard",
  "meditations:original-en": "Hard",
  "divine-comedy:original-en": "Hard",
  "jane-eyre:original-en": "Medium",
  "the-aeneid:original-en": "Hard",
  "paradise-lost:original-en": "Hard",
  "frankenstein:original-en": "Medium",
  "the-manual:original-en": "Medium",
  "apology:original-en": "Medium",
  "symposium:original-en": "Medium",
  "phaedo:original-en": "Hard",
  "crito:original-en": "Medium",
  "phaedrus:original-en": "Hard",
  "poetics:original-en": "Hard",
  "moby-dick:original-en": "Hard",
  "great-expectations:original-en": "Medium",
  "the-histories:original-en": "Medium",
  "niels-lyhne:original-da": "Hard",
  "niels-lyhne:original-en": "Medium",
  "imitation-of-christ:original-en": "Hard",
  "jerusalem:original-en": "Easy",
  "the-awakening:original-en": "Medium",
  "brothers-karamazov:original-en": "Hard",
  "iliad:original-en": "Medium",
  "nicomachean-ethics:original-en": "Hard",
  "the-prince:original-it": "Hard",
  "the-prince:original-en": "Medium",
  "beyond-good-and-evil:original-en": "Hard",
  "kant-groundwork:original-en": "Hard",
  "beowulf:original-en": "Hard",
  "candide:original-en": "Medium",
  "democracy-in-america:original-en": "Hard",
  "oedipus-rex:original-en": "Hard",
  "oedipus-at-colonus:original-en": "Hard",
  "antigone:original-en": "Hard",
  "genealogy-of-morals:original-en": "Hard",
  "descartes-meditations:original-en": "Hard",
  "on-liberty:original-en": "Hard",
  "utilitarianism:original-en": "Hard",
  "peloponnesian-war:original-en": "Hard",
  "aristotle-politics:original-en": "Hard",
  "leviathan:original-en": "Hard",
  "fear-and-trembling:original-da": "Hard",
  "fear-and-trembling:original-en": "Hard",
  "communist-manifesto:original-en": "Medium",
  "second-treatise:original-en": "Hard",
  "hume-enquiry:original-en": "Hard",
  "social-contract:original-en": "Hard",
  "wealth-of-nations:original-en": "Hard",
  "werther:original-en": "Medium",
  "faust-part-1:original-de": "Hard",
  "faust-part-1:original-en": "Medium",
  "oresteia:original-en": "Hard",
  "bacchae:original-en": "Hard",
  "medea:original-en": "Hard",
  "confessions:original-en": "Hard",
  "notes-from-underground:original-en": "Hard",
  "magna-carta:original-en": "Medium",
  "us-founding-documents:original-en": "Hard",
  "federalist-papers:original-en": "Hard",
  "frederick-douglass:original-en": "Easy",
  "a-little-princess:original-en": "Easy",
  "jungle-book:original-en": "Medium",
  "around-the-world-80-days:original-en": "Medium",
  "heart-of-darkness:original-en": "Hard",
  "discourse-on-inequality:original-fr": "Hard",
  "discourse-on-inequality:original-en": "Hard",
  "jekyll-and-hyde:original-en": "Medium",
  "walden:original-en": "Hard",
  "vindication-rights-of-woman:original-en": "Hard",
  "comedy-of-errors:original-en": "Hard",
  "merchant-of-venice:original-en": "Hard",
  "henry-v:original-en": "Hard",
  "as-you-like-it:original-en": "Hard",
  "winters-tale:original-en": "Hard",
  "julius-caesar:original-en": "Hard",
  "twelfth-night:original-en": "Hard",
  "measure-for-measure:original-en": "Hard",
  "henry-iv-part-2:original-en": "Hard",
  "merry-wives-of-windsor:original-en": "Hard",
  "othello:original-en": "Hard",
  "king-lear:original-en": "Hard",
  "much-ado-about-nothing:original-en": "Hard",
  "taming-of-the-shrew:original-en": "Hard",
  "antony-and-cleopatra:original-en": "Hard",
  "richard-iii:original-en": "Hard",
  "coriolanus:original-en": "Hard",
  "cymbeline:original-en": "Hard",
  "anna-karenina:original-en": "Medium",
  "don-quixote:original-en": "Medium",
  "essays-montaigne:original-en": "Hard",
  "ivan-ilyich:original-ru": "Medium",
  "ivan-ilyich:original-en": "Medium"
};
function editionDifficulty(bookId, edition) {
  if (edition.key === "modern-en") return "Easy";
  return reviewed[bookId + ":" + edition.key];
}

// src/data/editionDefaults.ts
var DIFFICULTY_RANK = { Easy: 0, Medium: 1, Hard: 2 };
var RECENT_ENGLISH_FROM = 1700;
var MACHINE_MADE_ORIGINALS = /* @__PURE__ */ new Set(["fear-and-trembling/original-en"]);
var NO_DEFAULT_COMPARE = /* @__PURE__ */ new Set(["fear-and-trembling"]);
function isMachineMadeOriginal(bookId, editionKey) {
  return MACHINE_MADE_ORIGINALS.has(`${bookId}/${editionKey}`);
}
function defaultPrimaryEditionKey(bookId, allEditions) {
  const editions = allEditions.filter((edition) => !editionHold(bookId, edition.key) && !isMachineMadeOriginal(bookId, edition.key));
  const byKey = (key) => editions.find((edition) => edition.key === key)?.key;
  return (bookId === "bible" ? byKey("bsb-en") : void 0) ?? byKey("modern-en") ?? editions.find((edition) => edition.style === "modern" && edition.language === "en")?.key ?? byKey("original-en") ?? editions.find((edition) => edition.language === "en")?.key ?? editions[0]?.key;
}
function defaultCompareEditionKey(bookId, editions, primaryKey, year) {
  if (NO_DEFAULT_COMPARE.has(bookId)) return void 0;
  const comparable = editions.filter((edition) => !editionHold(bookId, edition.key) && edition.key !== primaryKey && edition.aligned !== false && !isMachineMadeOriginal(bookId, edition.key));
  const human = comparable.filter((edition) => edition.style !== "modern" && edition.language === "en");
  const englishWork = !editions.some((edition) => edition.style === "original" && edition.language !== "en");
  const original = human.find((edition) => edition.key === "original-en");
  if (englishWork && original && typeof year === "number" && year >= RECENT_ENGLISH_FROM) return original.key;
  const rank = (edition) => {
    const rated = editionDifficulty(bookId, edition);
    return rated ? DIFFICULTY_RANK[rated] : DIFFICULTY_RANK.Medium;
  };
  const easiest = human.map((edition, index) => ({ edition, index })).sort((a, b) => rank(a.edition) - rank(b.edition) || a.index - b.index)[0]?.edition;
  return easiest?.key ?? comparable[0]?.key;
}

// src/preReader/catalogue.ts
var FALLBACK_COVER_BACKGROUND = "#2c2417";
var FALLBACK_COVER_ACCENT = "#c9a45c";
var LAB_COVER_ART_BOOK_IDS = BOOKS.map((book) => book.id);
var LAB_COVER_ART_2X_BOOK_IDS = [
  "odyssey",
  "the-republic",
  "pride-and-prejudice",
  "the-histories",
  "the-art-of-war",
  "frankenstein",
  "meditations",
  "frederick-douglass"
];
var LAB_POPULAR_BOOK_IDS = [
  "frankenstein",
  "odyssey",
  "jekyll-and-hyde",
  "pride-and-prejudice",
  "meditations",
  "crime-and-punishment",
  "jane-eyre",
  "the-prince",
  "julius-caesar",
  "candide"
];
function labCoverArt(bookId) {
  if (!LAB_COVER_ART_BOOK_IDS.includes(bookId)) return null;
  const src = `/covers/v2/${bookId}.webp`;
  const srcSet = LAB_COVER_ART_2X_BOOK_IDS.includes(bookId) ? `${src} 1x, /covers/v2/${bookId}@2x.webp 2x` : `${src} 1x`;
  return { src, srcSet };
}
function firstSentence(text) {
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : text).trim();
}
function unique(values) {
  return [...new Set(values.filter((value) => Boolean(value?.trim())))];
}
function provenanceFor(edition, bookId) {
  const permission = publisherPermission(bookId);
  if (permission && edition.style === "original") {
    return { group: "human", provenance: "published-edition", provenanceLabel: `Published by ${permission.publisher}, with permission` };
  }
  if (edition.style === "modern") {
    return { group: "modern", provenance: "tinct-ai-adaptation", provenanceLabel: "Tinct AI adaptation" };
  }
  if (edition.translator) {
    return {
      group: "human",
      provenance: "human-translation",
      provenanceLabel: `Human translation by ${edition.translator}`
    };
  }
  if (edition.style === "original") {
    return { group: "human", provenance: "authorial-original", provenanceLabel: "Original public-domain text" };
  }
  return { group: "human", provenance: "published-edition", provenanceLabel: "Published public-domain edition" };
}
function editionViewModels(editions, bookId) {
  const comparableKeys = new Set(
    editions.filter((edition) => edition.aligned).map((edition) => edition.key)
  );
  return editions.map((edition) => ({
    key: edition.key,
    language: edition.language,
    style: edition.style,
    label: edition.label,
    translator: edition.translator || null,
    year: edition.year ?? null,
    aligned: edition.aligned,
    ...provenanceFor(edition, bookId),
    availability: {
      // BOOKS is the publication boundary. The exhaustive asset test enforces
      // that every registered edition has renderable chapter content.
      chapterText: true,
      audio: edition.hasAudio === true,
      compare: edition.aligned && comparableKeys.size > 1
    }
  }));
}
function bookViewModel(book, catalogueIndex) {
  const meta = LIBRARY_BOOK_META_BY_ID[book.id];
  if (!meta) throw new Error(`Published book ${book.id} is missing library taxonomy metadata`);
  const invalidShelf = meta.shelves.find((shelfId) => !LIBRARY_SHELVES[shelfId]);
  if (invalidShelf) throw new Error(`Published book ${book.id} references unknown shelf ${invalidShelf}`);
  const houseIds = LIBRARY_HOUSES.filter((house) => meta.shelves.some((shelfId) => house.shelves.includes(shelfId))).map((house) => house.id);
  if (!houseIds.length) throw new Error(`Published book ${book.id} is not classified into a library house`);
  const publishedEditions = book.editions.filter((edition) => !isEditionWithheld(book.id, edition.key) && !(book.noModernEdition && (edition.style === "modern" || edition.key === "modern-en")));
  const editions = editionViewModels(publishedEditions, book.id).map((edition) => ({ ...edition, discoveryAvailable: isEditionDiscoverable(book.id, edition), audioHeld: isAudioHeld(book.id, edition.key) }));
  const discoverable = editions.filter((edition) => edition.discoveryAvailable);
  const defaultEditionKey = defaultPrimaryEditionKey(book.id, discoverable.length ? discoverable : editions);
  const summary = book.description?.trim() || meta.blurb?.trim() || `${book.title} by ${book.author}.`;
  const blurb = meta.blurb?.trim() || firstSentence(summary);
  const cover = {
    kind: "generated",
    background: book.coverColor || FALLBACK_COVER_BACKGROUND,
    accent: book.coverAccent || FALLBACK_COVER_ACCENT
  };
  return {
    id: book.id,
    title: book.title.trim(),
    author: book.author.trim(),
    ...book.altTitles?.length ? { altTitles: book.altTitles.map((title) => title.trim()) } : {},
    summary,
    blurb,
    displayYear: getBookDisplayYear(book, meta),
    wordCount: book.wordCount ?? null,
    cover,
    art: labCoverArt(book.id),
    shelfIds: [...meta.shelves],
    houseIds,
    topics: unique([
      meta.tradition,
      meta.form,
      meta.era,
      ...meta.themes,
      ...meta.shelves.flatMap((shelfId) => [LIBRARY_SHELVES[shelfId].title, LIBRARY_SHELVES[shelfId].sub]),
      ...houseIds.flatMap((houseId) => {
        const house = LIBRARY_HOUSES.find((candidate) => candidate.id === houseId);
        return [house?.title, house?.sub];
      })
    ]),
    editions,
    defaultEditionKey: defaultEditionKey ?? null,
    defaultCompareEditionKey: defaultCompareEditionKey(book.id, discoverable.filter((edition) => edition.availability.compare), defaultEditionKey, book.year) ?? null,
    availability: {
      cover: true,
      chapterText: editions.some((edition) => edition.availability.chapterText),
      audio: editions.some((edition) => edition.availability.audio),
      compare: editions.some((edition) => edition.availability.compare),
      // Published books are required to have an English onboarding asset;
      // the exhaustive asset test below guards that publication contract.
      optionalPreface: true
    },
    discoveryAvailable: isBookDiscoverable(book.id),
    searchAvailable: isBookSearchable(book.id),
    catalogueIndex
  };
}
function buildPreReaderCatalogue() {
  const books = BOOKS.map(bookViewModel);
  const booksById = new Map(books.map((book) => [book.id, book]));
  const houses = LIBRARY_HOUSES.map((house) => ({
    id: house.id,
    title: house.title,
    subtitle: house.sub,
    hue: house.hue,
    shelves: house.shelves.map((shelfId) => {
      const shelf = LIBRARY_SHELVES[shelfId];
      return {
        id: shelfId,
        title: shelf.title,
        subtitle: shelf.sub,
        hue: shelf.hue,
        books: books.filter((book) => book.discoveryAvailable !== false && book.shelfIds.includes(shelfId))
      };
    }).filter((shelf) => shelf.books.length > 0)
  })).filter((house) => house.shelves.length > 0);
  return { books, booksById, houses };
}
var PRE_READER_CATALOGUE = buildPreReaderCatalogue();
function serializePreReaderCatalogue(catalogue = PRE_READER_CATALOGUE) {
  return {
    books: catalogue.books,
    houses: catalogue.houses.map((house) => ({
      id: house.id,
      title: house.title,
      subtitle: house.subtitle,
      hue: house.hue,
      shelves: house.shelves.map((shelf) => ({
        id: shelf.id,
        title: shelf.title,
        subtitle: shelf.subtitle,
        hue: shelf.hue,
        bookIds: shelf.books.map((book) => book.id)
      }))
    })),
    popular: LAB_POPULAR_BOOK_IDS.filter((id) => catalogue.booksById.has(id))
  };
}

// src/preReader/libraryReadingStructure.ts
import fs2 from "node:fs";
import path2 from "node:path";
function visibleReadingEdition(book) {
  const visible = book.editions.filter((edition) => isEditionLanguageOffered(book.id, edition) && edition.availability.chapterText);
  const key = defaultPrimaryEditionKey(book.id, visible);
  return visible.find((edition) => edition.key === key) || (isBookTemporarilyHeld(book.id) ? visible.find((edition) => edition.key === "original-en") : void 0);
}
function normalizeChapters(chapters) {
  return chapters.map((chapter, index) => {
    const paragraphCount = Number.isInteger(chapter.paragraphCount) && Number(chapter.paragraphCount) > 0 ? Number(chapter.paragraphCount) : Array.isArray(chapter.paragraphs) && chapter.paragraphs.length > 0 ? chapter.paragraphs.length : 1;
    return {
      number: Number.isInteger(chapter.number) && Number(chapter.number) > 0 ? Number(chapter.number) : index + 1,
      title: typeof chapter.title === "string" && chapter.title.trim() ? chapter.title.trim() : `Chapter ${index + 1}`,
      paragraphCount
    };
  });
}
function manifestPathFor(publicDirectory, bookId, editionKey) {
  return path2.join(publicDirectory, "data", "editions-chapters", `${bookId}-${editionKey}`, "manifest.json");
}
function hasChapterShards(publicDirectory, bookId, editionKey) {
  return fs2.existsSync(manifestPathFor(publicDirectory, bookId, editionKey));
}
function readStructure(publicDirectory, bookId, editionKey) {
  const manifestPath = manifestPathFor(publicDirectory, bookId, editionKey);
  const editionPath = path2.join(publicDirectory, "data", "editions", `${bookId}-${editionKey}.json`);
  const sourcePath = fs2.existsSync(manifestPath) ? manifestPath : editionPath;
  if (!fs2.existsSync(sourcePath)) throw new Error(`No published reading structure for ${bookId}/${editionKey}`);
  const parsed = JSON.parse(fs2.readFileSync(sourcePath, "utf8"));
  const chapters = normalizeChapters(Array.isArray(parsed.chapters) ? parsed.chapters : []);
  if (!chapters.length) throw new Error(`No chapters in published reading structure for ${bookId}/${editionKey}`);
  return {
    editionKey,
    totalParagraphs: chapters.reduce((sum, chapter) => sum + chapter.paragraphCount, 0),
    chapters
  };
}
function publishedWordCount(publicDirectory, bookId, editionKey) {
  const whole = path2.join(publicDirectory, "data", "editions", `${bookId}-${editionKey}.json`);
  const directory = path2.dirname(manifestPathFor(publicDirectory, bookId, editionKey));
  const files = hasChapterShards(publicDirectory, bookId, editionKey) ? JSON.parse(fs2.readFileSync(path2.join(directory, "manifest.json"), "utf8")).chapters.map((chapter) => {
    const file = path2.resolve(directory, chapter.path);
    if (!file.startsWith(path2.resolve(directory) + path2.sep)) throw new Error("Invalid chapter shard path");
    return file;
  }) : fs2.existsSync(whole) ? [whole] : [];
  let total = 0;
  const count = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(count);
      return;
    }
    const record = value;
    if (Array.isArray(record.paragraphs)) {
      for (const paragraph of record.paragraphs) if (typeof paragraph === "string") total += paragraph.replace(/<[^>]*>/g, " ").match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
    }
    if (Array.isArray(record.chapters)) record.chapters.forEach(count);
  };
  for (const file of files) count(JSON.parse(fs2.readFileSync(file, "utf8")));
  return total > 0 ? total : null;
}
function addLibraryReadingStructures(catalogue, publicDirectory) {
  return {
    ...catalogue,
    books: catalogue.books.map((book) => {
      const edition = visibleReadingEdition(book);
      if (!edition) throw new Error(`Published book ${book.id} has no readable non-Danish edition`);
      return {
        ...book,
        wordCount: publishedWordCount(publicDirectory, book.id, edition.key) ?? book.wordCount,
        editions: book.editions.map((item) => ({
          ...item,
          chapterShards: hasChapterShards(publicDirectory, book.id, item.key),
          wordCount: isEditionLanguageOffered(book.id, item) && item.availability.chapterText ? publishedWordCount(publicDirectory, book.id, item.key) : null,
          readingStructure: isEditionLanguageOffered(book.id, item) && item.availability.chapterText ? readStructure(publicDirectory, book.id, item.key) : null
        })),
        readingStructure: readStructure(publicDirectory, book.id, edition.key)
      };
    })
  };
}

// src/lab/labRoute.ts
var PAGE_HOME = "/";
var PAGE_LIBRARY = "/library";
var PAGE_READER = "/reader";
var PAGE_SIGN_IN = "/sign-in";
var PAGE_FEATURED = "/featured";
function legacyLabPageRedirect(pathname, search = "") {
  const path5 = pathname.replace(/\/+$/, "").replace(/\/index\.html$/, "");
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  let target = null;
  switch (path5) {
    case "/lab":
    case "/lab/landing":
      target = PAGE_HOME;
      break;
    case "/lab/library":
    case "/lab/library_2":
    case "/lab/library-2":
    case "/lab/library_2/desktop.html":
    case "/lab/library_2/mobile.html":
      target = PAGE_LIBRARY;
      break;
    case "/lab/reader":
      target = PAGE_READER;
      break;
    case "/lab/phone":
    case "/lab/desktop":
      target = PAGE_READER;
      if (!params.has("layout")) params.set("layout", path5.slice("/lab/".length));
      break;
    case "/lab/sign-in":
      target = PAGE_SIGN_IN;
      break;
    case "/lab/featured":
      target = PAGE_FEATURED;
      break;
    default:
      return null;
  }
  if (target === PAGE_READER || target === PAGE_LIBRARY) {
    params.delete("chrome");
    if (params.get("voiceTrial") === "full") params.delete("voiceTrial");
  }
  const query = params.toString();
  return query ? `${target}?${query}` : target;
}

// src/cards/cardRoutes.ts
var CARD_PARAM = "card";
function cardHost(raw) {
  if (!raw || raw.includes("\\") || !raw.startsWith("/") || raw.startsWith("//")) return "/library";
  try {
    const url = new URL(raw, "https://tinct.app");
    if (/^\/(?:reader|read\/[A-Za-z0-9_-]+(?:\/\d+)?)\/?$/.test(url.pathname) || url.pathname === "/library" || url.pathname === "/") {
      url.searchParams.delete(CARD_PARAM);
      return `${url.pathname}${url.search}`;
    }
  } catch {
  }
  return "/library";
}
function cardUrl(card, host = null) {
  const base = cardHost(host);
  const url = new URL(base, "https://tinct.app");
  url.searchParams.set(CARD_PARAM, card);
  return `${url.pathname}${url.search}`;
}
var YOU_VIEWS = {
  settings: "settings",
  visibility: "settings",
  showReading: "settings",
  showTime: "settings",
  onLeaderboard: "settings",
  emails: "settings",
  newBooks: "settings",
  name: "settings",
  handle: "settings",
  blocked: "settings"
};
function accountPageRedirect(pathname, search) {
  const params = new URLSearchParams(search);
  const back = params.get("returnTo") || params.get("return");
  if (pathname === "/you" || pathname === "/you/") {
    return cardUrl(YOU_VIEWS[params.get("view") || ""] ?? "you", back);
  }
  if (pathname === "/your-reading" || pathname === "/your-reading/") return cardUrl("reading", back);
  if (pathname === "/friends" || pathname === "/friends/") return cardUrl(params.get("tab") === "find" ? "find" : "leaderboard", back);
  return null;
}

// scripts/readerBootScript.ts
import { createHash as createHash2 } from "crypto";
import path3 from "path";
import { buildSync } from "file:///home/user/tinct/app/node_modules/esbuild/lib/main.js";
function readerBootPrimaryExceptions(root = process.cwd()) {
  const result = buildSync({
    stdin: {
      contents: [
        "import { BOOKS } from './src/data/bookRegistry'",
        "import { defaultPrimaryEditionKey } from './src/data/editionDefaults'",
        "const exceptions: Record<string, string> = {}",
        "for (const book of BOOKS) { const key = defaultPrimaryEditionKey(book.id, book.editions) ?? ''; if (key !== 'modern-en') exceptions[book.id] = key }",
        "export default exceptions"
      ].join("\n"),
      resolveDir: root,
      loader: "ts",
      sourcefile: "reader-boot-primary-exceptions.ts"
    },
    bundle: true,
    platform: "neutral",
    format: "iife",
    globalName: "__readerBootPrimaryExceptions",
    write: false,
    logLevel: "silent",
    loader: { ".json": "json" },
    define: { __BUILD_VERSION__: '"reader-boot"', "import.meta.env": "{}" }
  });
  const value = new Function(`${result.outputFiles[0].text}; return __readerBootPrimaryExceptions.default`)();
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
}
function buildReaderBootScript(buildVersion, root = process.cwd()) {
  const result = buildSync({
    entryPoints: [path3.resolve(root, "src/lab/readerBootEntry.ts")],
    bundle: true,
    format: "iife",
    minify: true,
    write: false,
    target: "es2019",
    legalComments: "none",
    define: {
      __BUILD_VERSION__: JSON.stringify(buildVersion),
      __READER_BOOT_PRIMARY_EXCEPTIONS__: JSON.stringify(readerBootPrimaryExceptions(root))
    }
  });
  const source = result.outputFiles[0].text;
  const hash = createHash2("sha256").update(source).digest("hex").slice(0, 10);
  return { source, fileName: `assets/reader-boot-${hash}.js` };
}

// vite.config.ts
var serializedPreReaderCatalogue = JSON.stringify(addLibraryReadingStructures(
  serializePreReaderCatalogue(),
  path4.resolve(process.cwd(), "public")
));
var entryPrefaces = new Map(JSON.parse(serializedPreReaderCatalogue).books.flatMap((book) => {
  const file = path4.resolve(process.cwd(), "src/data/prefaces", `${book.id}.txt`);
  return fs3.existsSync(file) ? [[book.id, JSON.stringify({ bookId: book.id, language: "en", paragraphs: fs3.readFileSync(file, "utf8").trim().split(/\n\s*\n/) })]] : [];
}));
var vite_config_default = defineConfig(({ mode, command }) => {
  if (command === "build" && process.env.WORKERS_CI === "1") {
    throw new Error("Tinct production builds run through GitHub Actions only; Workers Builds is disabled to prevent competing deployments.");
  }
  const env = loadEnv(mode, process.cwd(), "");
  const isCapacitor = process.env.CAPACITOR === "true";
  if (command === "build" && (process.env.CI || process.env.WORKERS_CI)) {
    const publicClientEnv = {
      VITE_SUPABASE_URL: "https://yazjyiqsxjystvpkyouk.supabase.co",
      VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhemp5aXFzeGp5c3R2cGt5b3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTA2MTQsImV4cCI6MjA4OTU4NjYxNH0.VyNjCyb5Tc1T1wx5nwZsvWGmwK67FHaB2Ptrtu4EeJA",
      VITE_AUDIO_BASE_URL: "https://tinct.app"
    };
    for (const [key, value] of Object.entries(publicClientEnv)) {
      if (!env[key]) {
        env[key] = value;
        process.env[key] = value;
      }
    }
  }
  if (command === "build" && !process.env.SKIP_ENV_CHECK) {
    const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_AUDIO_BASE_URL"];
    const missing = required.filter((k) => !env[k]);
    if (missing.length) {
      throw new Error(
        `

\u2717 Build aborted: required env vars are missing:
  ${missing.join("\n  ")}

These must be set in .env (same directory as vite.config.ts) before running npm run build.
Without them, the deployed app will have broken auth and audio and will NOT show errors at build time.

If you're sure you want to proceed (e.g. offline dev preview), set SKIP_ENV_CHECK=1.
`
      );
    }
  }
  const buildVersion = command === "build" ? `${Date.now().toString(36)}` : "dev";
  let readerBootBuild = null;
  const readerBoot = () => readerBootBuild ??= buildReaderBootScript(buildVersion);
  return {
    define: {
      __BUILD_VERSION__: JSON.stringify(buildVersion)
    },
    base: isCapacitor ? "./" : "/",
    build: {
      rollupOptions: {
        input: {
          index: path4.resolve(process.cwd(), "index.html"),
          labFeaturedAccess: path4.resolve(process.cwd(), "src/labFeaturedAccess.ts"),
          labAuthStatus: path4.resolve(process.cwd(), "src/labAuthStatus.ts"),
          labSignIn: path4.resolve(process.cwd(), "src/labSignIn.ts"),
          libraryTwoAssistant: path4.resolve(process.cwd(), "src/libraryTwoAssistant.tsx"),
          libraryTwoReading: path4.resolve(process.cwd(), "src/libraryTwoReading.ts"),
          libraryAdd: path4.resolve(process.cwd(), "src/libraryAdd.ts"),
          nativeBooks: path4.resolve(process.cwd(), "src/utils/nativeBooks.ts"),
          // The account cards over the library (CARDS-BRIEF.md); the reader imports them itself.
          libraryCards: path4.resolve(process.cwd(), "src/cards/libraryCards.ts"),
          // Social (ship 3): a profile page's script and the admin view. Served only while SOCIAL_FRIENDS is on.
          profilePage: path4.resolve(process.cwd(), "src/social/profilePage.ts"),
          adminSocialPage: path4.resolve(process.cwd(), "src/social/adminSocialPage.ts")
        },
        output: {
          // Reserve index-* for the real reader entry. Native plugin entrypoints
          // also use index.ts; their lazy chunks must not impersonate the app
          // in shell stamping, production checks or offline registration.
          chunkFileNames: (chunk) => chunk.name === "index" ? "assets/shared-index-[hash].js" : "assets/[name]-[hash].js",
          entryFileNames: (chunk) => chunk.name === "labFeaturedAccess" ? "lab/featured-access.js" : chunk.name === "labAuthStatus" ? "lab/auth-status.js" : chunk.name === "labSignIn" ? "lab/sign-in-runtime.js" : chunk.name === "libraryTwoAssistant" ? "lab/library-2-assistant.js" : chunk.name === "nativeBooks" ? "lab/native-books.js" : chunk.name === "libraryTwoReading" ? "lab/library-2-reading.js" : chunk.name === "libraryAdd" ? "lab/library-add.js" : chunk.name === "libraryCards" ? "lab/account-cards.js" : chunk.name === "profilePage" ? "lab/social-profile.js" : chunk.name === "adminSocialPage" ? "lab/admin-social-runtime.js" : "assets/[name]-[hash].js"
        }
      }
    },
    plugins: [
      react(),
      {
        // The reader's head script: starts the opening chapter's requests and
        // paints the stored paper before the app bundle runs (src/lab/readerBoot.ts).
        name: "reader-boot",
        apply: () => !isCapacitor,
        configureServer(server) {
          server.middlewares.use("/lab/reader-boot.js", (_req, res) => {
            res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
            res.end(buildReaderBootScript(buildVersion).source);
          });
        },
        transformIndexHtml: {
          order: "post",
          handler(_html, ctx) {
            if (path4.resolve(ctx.filename) !== path4.resolve(process.cwd(), "index.html")) return;
            const src = command === "build" ? `/${readerBoot().fileName}` : "/lab/reader-boot.js";
            const hyphenation = Object.values(ctx.bundle ?? {}).filter((chunk) => chunk.type === "chunk" && chunk.moduleIds.some((id) => /[\\/]node_modules[\\/](?:hypher|hyphenation\.en-us)[\\/]/.test(id)));
            return [
              { tag: "script", attrs: { src }, injectTo: "head-prepend" },
              ...hyphenation.map((chunk) => ({ tag: "link", attrs: { rel: "modulepreload", crossorigin: true, href: `/${chunk.fileName}` }, injectTo: "head" }))
            ];
          }
        },
        generateBundle() {
          if (command !== "build") return;
          const boot = readerBoot();
          this.emitFile({ type: "asset", fileName: boot.fileName, source: boot.source });
        }
      },
      {
        // The library search's catalogue parts on the dev server, as `npm run build` makes them
        // (scripts/build-catalogue-shards.mjs): without them the search worker falls back to the
        // whole 7.9 MB catalogue, whose parse took the dev page (and the browser tests) to ~1.9 GB.
        name: "lab-catalogue-shards",
        configureServer(server) {
          const whole = path4.resolve(process.cwd(), "public/lab/addbook/data/catalog.json.gz");
          let parts = null, partsFor = 0;
          const build = async () => {
            const { gunzipSync, gzipSync } = await import("zlib");
            const { pathToFileURL } = await import("url");
            const { splitCatalogue } = await import(pathToFileURL(path4.resolve(process.cwd(), "scripts/build-catalogue-shards.mjs")).href);
            const { english, more } = splitCatalogue(JSON.parse(gunzipSync(fs3.readFileSync(whole)).toString("utf8")));
            return { "catalog-en.json.gz": gzipSync(Buffer.from(JSON.stringify(english))), "catalog-more.json.gz": gzipSync(Buffer.from(JSON.stringify(more))) };
          };
          server.middlewares.use("/lab/addbook/data/", (req, res, next) => {
            const name = (req.url || "").split("?")[0].replace(/^\//, "");
            if (name !== "catalog-en.json.gz" && name !== "catalog-more.json.gz") return next();
            let stamp = 0;
            try {
              stamp = fs3.statSync(whole).mtimeMs;
            } catch {
              return next();
            }
            if (!parts || partsFor !== stamp) {
              parts = build();
              partsFor = stamp;
              parts.catch(() => {
                parts = null;
              });
            }
            parts.then((files) => {
              res.writeHead(200, { "Content-Type": "application/gzip", "Cache-Control": "no-store" });
              res.end(files[name]);
            }, () => next());
          });
        }
      },
      {
        name: "lab-pre-reader-catalogue",
        configureServer(server) {
          server.middlewares.use("/lab/prefaces/", (req, res) => {
            const id = decodeURIComponent((req.url || "").split("?")[0].replace(/^\//, "").replace(/\.json$/, ""));
            const source = entryPrefaces.get(id);
            res.writeHead(source ? 200 : 404, { "Content-Type": "application/json; charset=utf-8" });
            res.end(source || "{}");
          });
          server.middlewares.use("/lab/catalogue.json", (_req, res) => {
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(serializedPreReaderCatalogue);
          });
        },
        generateBundle() {
          const native = buildNativeBooks(path4.resolve(process.cwd(), "public"), BOOKS, JSON.parse(serializedPreReaderCatalogue), entryPrefaces);
          this.emitFile({ type: "asset", fileName: "native-books/index.json", source: native.index });
          for (const [fileName, source] of Object.entries(native.manifests)) this.emitFile({ type: "asset", fileName, source });
          for (const [id, source] of entryPrefaces) this.emitFile({ type: "asset", fileName: `lab/prefaces/${id}.json`, source });
          this.emitFile({
            type: "asset",
            fileName: "lab/catalogue.json",
            source: serializedPreReaderCatalogue
          });
        }
      },
      {
        name: "anthropic-proxy",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url || "";
            const pathOnly = url.split("?")[0];
            if (pathOnly === "/lab/featured-access.js") {
              req.url = `/src/labFeaturedAccess.ts${url.slice(pathOnly.length)}`;
              next();
              return;
            }
            if (pathOnly === "/lab/auth-status.js") {
              req.url = `/src/labAuthStatus.ts${url.slice(pathOnly.length)}`;
              next();
              return;
            }
            if (pathOnly === "/lab/sign-in-runtime.js") {
              req.url = `/src/labSignIn.ts${url.slice(pathOnly.length)}`;
              next();
              return;
            }
            if (pathOnly === "/lab/library-2-reading.js") {
              req.url = `/src/libraryTwoReading.ts${url.slice(pathOnly.length)}`;
              next();
              return;
            }
            if (pathOnly === "/lab/account-cards.js") {
              req.url = `/src/cards/libraryCards.ts${url.slice(pathOnly.length)}`;
              next();
              return;
            }
            const cardTarget = req.method === "GET" || req.method === "HEAD" ? accountPageRedirect(pathOnly, url.slice(pathOnly.length)) : null;
            if (cardTarget) {
              res.writeHead(302, { Location: cardTarget });
              res.end();
              return;
            }
            const socialRuntime = {
              "/lab/social-profile.js": "/src/social/profilePage.ts",
              "/lab/admin-social-runtime.js": "/src/social/adminSocialPage.ts"
            };
            if (socialRuntime[pathOnly]) {
              req.url = `${socialRuntime[pathOnly]}${url.slice(pathOnly.length)}`;
              next();
              return;
            }
            if (pathOnly === "/lab/library-add.js") {
              req.url = `/src/libraryAdd.ts${url.slice(pathOnly.length)}`;
              next();
              return;
            }
            const legacyTarget = req.method === "GET" || req.method === "HEAD" ? legacyLabPageRedirect(pathOnly, url.slice(pathOnly.length)) : null;
            if (legacyTarget) {
              res.writeHead(308, { Location: legacyTarget });
              res.end();
              return;
            }
            const pageAssets = {
              "/sign-in": "/lab/sign-in/index.html",
              "/sign-in/": "/lab/sign-in/index.html",
              "/featured": "/lab/featured/index.html",
              "/featured/": "/lab/featured/index.html",
              "/": "/lab/library_2/index.html",
              "/index.html": "/lab/library_2/index.html",
              "/library": "/lab/library_2/index.html",
              "/library/": "/lab/library_2/index.html",
              // Social (ship 3): the Worker serves this only while SOCIAL_FRIENDS is on.
              "/admin/social": "/lab/admin-social/index.html",
              // The PDF reader's folder page, as the Worker's assets serve it (the margin preview frames it).
              "/lab/addbook/": "/lab/addbook/index.html",
              "/lab/addbook/book": "/lab/addbook/book.html"
            };
            if (pageAssets[pathOnly]) {
              req.url = `${pageAssets[pathOnly]}${url.slice(pathOnly.length)}`;
              next();
              return;
            }
            next();
          });
          server.middlewares.use((req, _res, next) => {
            const url = req.url || "";
            const m = url.match(/^\/read\/([a-z0-9-]+)\/(summary|chapters|cast|themes|chapter-\d+)\/?(\?.*)?$/i);
            if (m) {
              req.url = `/read/${m[1]}/${m[2]}.html${m[3] || ""}`;
            }
            next();
          });
          server.middlewares.use("/api/voice-session", async (req, res) => {
            if (req.method !== "POST") {
              res.writeHead(405, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }
            const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";
            if (!openaiKey) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Voice is not configured. Set the OPENAI_API_KEY Worker secret." }));
              return;
            }
            try {
              const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${openaiKey}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  session: {
                    type: "realtime",
                    model: "gpt-realtime-2.1-mini",
                    audio: { output: { voice: "marin" } }
                  }
                })
              });
              const data = await response.json();
              if (!response.ok || !data.value) {
                res.writeHead(response.status >= 400 ? response.status : 502, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: data.error?.message || "Could not start a voice session." }));
                return;
              }
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({
                value: data.value,
                expires_at: data.expires_at ?? null,
                model: "gpt-realtime-2.1-mini"
              }));
            } catch (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Proxy error", details: String(err) }));
            }
          });
          server.middlewares.use("/api/chat", async (req, res) => {
            if (req.method !== "POST") {
              res.writeHead(405);
              res.end("Method not allowed");
              return;
            }
            const apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "";
            if (!apiKey) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: { message: "API key not configured. Set ANTHROPIC_API_KEY in .env" } }));
              return;
            }
            let body = "";
            req.on("data", (chunk) => {
              body += chunk.toString();
            });
            req.on("end", async () => {
              try {
                const parsed = JSON.parse(body);
                const response = await fetch("https://api.anthropic.com/v1/messages", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01"
                  },
                  body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: Math.min(parsed.max_tokens || 1024, 2048),
                    system: typeof parsed.system === "string" ? parsed.system.slice(0, 4e3) : "",
                    messages: Array.isArray(parsed.messages) ? parsed.messages.slice(0, 50) : []
                  })
                });
                const data = await response.json();
                res.writeHead(response.status, { "Content-Type": "application/json" });
                res.end(JSON.stringify(data));
              } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Proxy error", details: String(err) }));
              }
            });
          });
          server.middlewares.use("/api/create-checkout", async (req, res) => {
            if (req.method !== "POST") {
              res.writeHead(405);
              res.end("Method not allowed");
              return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ url: null, message: "Stripe checkout not available in dev mode. Configure Supabase and Stripe for production." }));
          });
          server.middlewares.use(async (req, res, next) => {
            const url = req.url || "";
            const manifestPrefix = "/api/audio-manifest";
            const filePrefix = "/api/audio-file";
            let upstreamPath = null;
            if (url.startsWith(manifestPrefix)) upstreamPath = `${manifestPrefix}${url.slice(manifestPrefix.length)}`;
            else if (url.startsWith(filePrefix)) upstreamPath = `${filePrefix}${url.slice(filePrefix.length)}`;
            if (!upstreamPath) {
              next();
              return;
            }
            try {
              const upstream = await fetch(`https://tinct.app${upstreamPath}`);
              const ctype = upstream.headers.get("content-type") || "application/octet-stream";
              res.writeHead(upstream.status, { "Content-Type": ctype });
              res.end(Buffer.from(await upstream.arrayBuffer()));
            } catch (err) {
              res.writeHead(502, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Audio proxy error", details: String(err) }));
            }
          });
          server.middlewares.use("/audio", (req, res, next) => {
            const filePath = path4.join(process.cwd(), "audio", decodeURIComponent(req.url || ""));
            if (fs3.existsSync(filePath) && fs3.statSync(filePath).isFile()) {
              const ext = path4.extname(filePath).toLowerCase();
              const mimeTypes = {
                ".mp3": "audio/mpeg",
                ".wav": "audio/wav",
                ".json": "application/json"
              };
              res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
              fs3.createReadStream(filePath).pipe(res);
            } else {
              next();
            }
          });
          server.middlewares.use("/api/balance", async (req, res) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ balance_cents: 200, total_tokens_used: 0 }));
          });
        }
      }
    ],
    server: {
      port: 3001,
      // host: true binds to 0.0.0.0 so phones on the same WiFi can reach the
      // dev server (e.g. http://<mac-lan-ip>:3001). Safe in dev. If you ever
      // join an untrusted network, comment this back out.
      host: true
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2RhdGEvYm9va1JlZ2lzdHJ5LnRzIiwgInNjcmlwdHMvYW5kcm9pZC9uYXRpdmUtYm9va3MudHMiLCAidml0ZS5jb25maWcudHMiLCAic3JjL2RhdGEvZWRpdGlvbkF2YWlsYWJpbGl0eS5qc29uIiwgInNyYy9kYXRhL2VkaXRpb25BdmFpbGFiaWxpdHkudHMiLCAic3JjL2RhdGEvYXVkaW9BdmFpbGFiaWxpdHkuanNvbiIsICJzcmMvZGF0YS9hdWRpb0F2YWlsYWJpbGl0eS50cyIsICJzcmMvZGF0YS93aXRoaGVsZEVkaXRpb25zLnRzIiwgInNyYy9kYXRhL3B1Ymxpc2hlclBlcm1pc3Npb25zLmpzb24iLCAic3JjL2RhdGEvcHVibGlzaGVyUGVybWlzc2lvbnMudHMiLCAic3JjL2RhdGEvbGlicmFyeVRheG9ub215LnRzIiwgInNyYy9sYWIvZWRpdGlvbkRpZmZpY3VsdHkudHMiLCAic3JjL2RhdGEvZWRpdGlvbkRlZmF1bHRzLnRzIiwgInNyYy9wcmVSZWFkZXIvY2F0YWxvZ3VlLnRzIiwgInNyYy9wcmVSZWFkZXIvbGlicmFyeVJlYWRpbmdTdHJ1Y3R1cmUudHMiLCAic3JjL2xhYi9sYWJSb3V0ZS50cyIsICJzcmMvY2FyZHMvY2FyZFJvdXRlcy50cyIsICJzY3JpcHRzL3JlYWRlckJvb3RTY3JpcHQudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zcmMvZGF0YVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2RhdGEvYm9va1JlZ2lzdHJ5LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9kYXRhL2Jvb2tSZWdpc3RyeS50c1wiO2ltcG9ydCB0eXBlIHsgQm9vayB9IGZyb20gJy4uL3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgT0RZU1NFWTogQm9vayA9IHtcbiAgaWQ6ICdvZHlzc2V5JyxcbiAgdGl0bGU6ICdUaGUgT2R5c3NleScsXG4gIGF1dGhvcjogJ0hvbWVyJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgZXBpYyBqb3VybmV5IG9mIE9keXNzZXVzIGFzIGhlIHN0cnVnZ2xlcyB0byByZXR1cm4gaG9tZSBhZnRlciB0aGUgVHJvamFuIFdhci4gTW9uc3RlcnMsIGdvZHMsIGFuZCB0aGUgZW5kdXJhbmNlIG9mIHRoZSBodW1hbiBzcGlyaXQgYWNyb3NzIHR3ZW50eSB5ZWFycyBvZiB3YW5kZXJpbmcuJyxcbiAgeWVhcjogLTgwMCxcbiAgd29yZENvdW50OiAxMzAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWEzYTVjJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzlhNDVjJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdCdXRsZXIgKFByb3NlLCAxOTAwKScsXG4gICAgICB0cmFuc2xhdG9yOiAnU2FtdWVsIEJ1dGxlcicsXG4gICAgICB5ZWFyOiAxOTAwLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBVTFlTU0VTOiBCb29rID0ge1xuICBpZDogJ3VseXNzZXMnLFxuICB0aXRsZTogJ1VseXNzZXMnLFxuICBhdXRob3I6ICdKYW1lcyBKb3ljZScsXG4gIGRlc2NyaXB0aW9uOiAnT25lIGRheSBpbiBEdWJsaW4sIEp1bmUgMTYsIDE5MDQuIExlb3BvbGQgQmxvb20gd2FuZGVycyB0aHJvdWdoIHRoZSBjaXR5IGluIGEgbW9kZXJuIHJldGVsbGluZyBvZiBUaGUgT2R5c3NleSBcdTIwMTQgc3RyZWFtIG9mIGNvbnNjaW91c25lc3MsIHBhcm9keSwgYW5kIHRoZSBvcmRpbmFyeSBtYWRlIGV4dHJhb3JkaW5hcnkuJyxcbiAgeWVhcjogMTkyMixcbiAgd29yZENvdW50OiAyNjUwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmMxODEwJyxcbiAgY292ZXJBY2NlbnQ6ICcjZDRhODQzJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdPcmlnaW5hbCAoMTkyMiknLFxuICAgICAgeWVhcjogMTkyMixcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgV0FSX0FORF9QRUFDRTogQm9vayA9IHtcbiAgaWQ6ICd3YXItYW5kLXBlYWNlJyxcbiAgdGl0bGU6ICdXYXIgYW5kIFBlYWNlJyxcbiAgYXV0aG9yOiAnTGVvIFRvbHN0b3knLFxuICBkZXNjcmlwdGlvbjogJ1RoZSBzd2VlcGluZyBlcGljIG9mIFJ1c3NpYW4gc29jaWV0eSBkdXJpbmcgdGhlIE5hcG9sZW9uaWMgV2Fycy4gRml2ZSBhcmlzdG9jcmF0aWMgZmFtaWxpZXMgbmF2aWdhdGUgbG92ZSwgZGVhdGgsIGFuZCB0aGUgc2VhcmNoIGZvciBtZWFuaW5nIGFjcm9zcyBiYXR0bGVmaWVsZHMgYW5kIGJhbGxyb29tcy4nLFxuICB5ZWFyOiAxODY5LFxuICB3b3JkQ291bnQ6IDU2MTY5NSxcbiAgY292ZXJDb2xvcjogJyMzYzFhMWEnLFxuICBjb3ZlckFjY2VudDogJyNjOWE0NWMnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ01hdWRlIFRyYW5zbGF0aW9uICgxOTIyKScsXG4gICAgICB0cmFuc2xhdG9yOiAnQXlsbWVyICYgTG91aXNlIE1hdWRlJyxcbiAgICAgIHllYXI6IDE5MjIsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEJJQkxFOiBCb29rID0ge1xuICBpZDogJ2JpYmxlJyxcbiAgdGl0bGU6ICdUaGUgQmlibGUnLFxuICBhdXRob3I6ICdWYXJpb3VzJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgZm91bmRhdGlvbmFsIHRleHQgb2YgV2VzdGVybiBjaXZpbGl6YXRpb24uIDY2IGJvb2tzICg3MyBpbiB0aGUgQ2F0aG9saWMgZWRpdGlvbikgc3Bhbm5pbmcgY3JlYXRpb24sIGxhdywgaGlzdG9yeSwgcG9ldHJ5LCBwcm9waGVjeSwgZ29zcGVscywgYW5kIHJldmVsYXRpb24gXHUyMDE0IHRoZSBzdG9yeSBvZiBHb2QgYW5kIGh1bWFuaXR5IGFjcm9zcyB0aG91c2FuZHMgb2YgeWVhcnMuJyxcbiAgeWVhcjogLTE0MDAsXG4gIHdvcmRDb3VudDogNzgzMDAwLFxuICBjb3ZlckNvbG9yOiAnIzJhMWEwZScsXG4gIGNvdmVyQWNjZW50OiAnI2Q0YTg0MycsXG4gIC8vIEJTQiBsZWFkczogaXQgaXMgdGhlIGRlZmF1bHQgZm9yIHJlYWRlcnMgd2l0aG91dCB0aGVpciBvd24gc2F2ZWQgQmlibGVcbiAgLy8gZWRpdGlvbi4gQmlibGUgZWRpdGlvbnMgYXJlIGNvbXBhcmVkIGJ5IHZlcnNlLCBub3QgcGFyYWdyYXBoIGluZGV4LlxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ2JzYi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnYnNiJyxcbiAgICAgIGxhYmVsOiAnQmVyZWFuIFN0YW5kYXJkIEJpYmxlJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ2tqdi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAna2p2JyxcbiAgICAgIGxhYmVsOiAnS2luZyBKYW1lcyBWZXJzaW9uICgxNjExKScsXG4gICAgICB5ZWFyOiAxNjExLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnd2ViLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICd3ZWInLFxuICAgICAgbGFiZWw6ICdXb3JsZCBFbmdsaXNoIEJpYmxlJyxcbiAgICAgIHllYXI6IDIwMDAsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICAvLyBUaGUgNzMtYm9vayBDYXRob2xpYyBjYW5vbiwgaW4gdGhlIENhdGhvbGljIG9yZGVyOiBUb2JpdCwgSnVkaXRoLFxuICAgIC8vIDEtMiBNYWNjYWJlZXMsIFdpc2RvbSwgU2lyYWNoLCBCYXJ1Y2ggYW5kIHRoZSBHcmVlayBFc3RoZXIgYW5kIERhbmllbC5cbiAgICAvLyBJdCBzaGFyZXMgdGhlIG90aGVyIGVkaXRpb25zJyBjaGFwdGVyIG51bWJlcnMgd2hlcmUgaXQgaGFzIHRoZSBzYW1lXG4gICAgLy8gY2hhcHRlciAoZGF0YS9iaWJsZUVkaXRpb25DaGFwdGVycy50cykuIE5hcnJhdGlvbiBzdHJlYW1zIG9uIGRlbWFuZC5cbiAgICB7XG4gICAgICBrZXk6ICd3ZWJjLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICd3ZWInLFxuICAgICAgbGFiZWw6ICdXb3JsZCBFbmdsaXNoIEJpYmxlLCBDYXRob2xpYyBFZGl0aW9uJyxcbiAgICAgIHllYXI6IDIwMjAsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEdJTEdBTUVTSDogQm9vayA9IHtcbiAgaWQ6ICdnaWxnYW1lc2gnLFxuICB0aXRsZTogJ1RoZSBFcGljIG9mIEdpbGdhbWVzaCcsXG4gIGF1dGhvcjogJ0Fub255bW91cycsXG4gIGRlc2NyaXB0aW9uOiAnVGhlIG9sZGVzdCBzdXJ2aXZpbmcgZ3JlYXQgd29yayBvZiBsaXRlcmF0dXJlLiBBIGtpbmcgYW5kIGEgd2lsZCBtYW4gYmVjb21lIGJyb3RoZXJzLCBzbGF5IG1vbnN0ZXJzLCBhbmQgZGVmeSB0aGUgZ29kcyBcdTIwMTQgdGhlbiBmYWNlIHRoZSBvbmUgZW5lbXkgbm8gbW9ydGFsIGNhbiBkZWZlYXQuJyxcbiAgeWVhcjogLTIxMDAsXG4gIHdvcmRDb3VudDogMzAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjNGEzNzI4JyxcbiAgY292ZXJBY2NlbnQ6ICcjYzk5NjNhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdQcm9zZSBDb21waWxhdGlvbicsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEhBTUxFVDogQm9vayA9IHtcbiAgaWQ6ICdoYW1sZXQnLFxuICB0aXRsZTogJ0hhbWxldCcsXG4gIGF1dGhvcjogJ1dpbGxpYW0gU2hha2VzcGVhcmUnLFxuICBkZXNjcmlwdGlvbjogJ0EgcHJpbmNlIGhhdW50ZWQgYnkgaGlzIGZhdGhlclxcJ3MgZ2hvc3QsIHBhcmFseXplZCBieSBkb3VidCwgZHJpdmVuIHRvd2FyZCByZXZlbmdlLiBUaGUgcGxheSB0aGF0IGludmVudGVkIHRoZSBtb2Rlcm4gbWluZCBcdTIwMTQgYW5kIHRoZSBxdWVzdGlvbiB0aGF0IG5ldmVyIHN0b3BzOiB0byBiZSwgb3Igbm90IHRvIGJlLicsXG4gIHllYXI6IDE2MDAsXG4gIHdvcmRDb3VudDogMzAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWExYTJlJyxcbiAgY292ZXJBY2NlbnQ6ICcjOGE3ZmI1JyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdPcmlnaW5hbCBUZXh0JyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICAgIGhhc1ZlcnNlTGluZXM6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IE1BQ0JFVEg6IEJvb2sgPSB7XG4gIGlkOiAnbWFjYmV0aCcsXG4gIHRpdGxlOiAnTWFjYmV0aCcsXG4gIGF1dGhvcjogJ1dpbGxpYW0gU2hha2VzcGVhcmUnLFxuICBkZXNjcmlwdGlvbjogJ0Egd2FycmlvciBzZWR1Y2VkIGJ5IHByb3BoZWN5IGFuZCBhbWJpdGlvbiBtdXJkZXJzIGhpcyBraW5nIFx1MjAxNCB0aGVuIHdhdGNoZXMgaGlzIHdvcmxkIHVucmF2ZWwuIFNoYWtlc3BlYXJlXFwncyBkYXJrZXN0LCBmYXN0ZXN0IHRyYWdlZHk6IGJsb29kLCBndWlsdCwgYW5kIHRoZSB3YWdlcyBvZiB1bmNoZWNrZWQgcG93ZXIuJyxcbiAgeWVhcjogMTYwNixcbiAgd29yZENvdW50OiAxNzAwMCxcbiAgY292ZXJDb2xvcjogJyMyYTBhMGEnLFxuICBjb3ZlckFjY2VudDogJyNiNTNhM2EnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ09yaWdpbmFsIFRleHQnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgICAgaGFzVmVyc2VMaW5lczogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIC8vIFBhcmFncmFwaCBzdHJ1Y3R1cmUgZGlmZmVycyBmcm9tIHRoZSByZXBhaXJlZCBFbmdsaXNoIGVkaXRpb25zICg4MDYgYWdhaW5zdCA4NDApLlxuICAgICAgYWxpZ25lZDogZmFsc2UsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgTUlEU1VNTUVSOiBCb29rID0ge1xuICBpZDogJ21pZHN1bW1lcicsXG4gIHRpdGxlOiAnQSBNaWRzdW1tZXIgTmlnaHRcXCdzIERyZWFtJyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnTG92ZXJzIGxvc3QgaW4gYW4gZW5jaGFudGVkIGZvcmVzdCwgZmFpcmllcyBhdCB3YXIsIGFuZCBhIHdlYXZlciB0dXJuZWQgaW50byBhIGRvbmtleS4gU2hha2VzcGVhcmVcXCdzIG1vc3QgbWFnaWNhbCBjb21lZHkgXHUyMDE0IHdoZXJlIGxvdmUgaXMgcmlkaWN1bG91cywgd29uZGVyZnVsLCBhbmQgY29tcGxldGVseSBvdXQgb2YgYW55b25lXFwncyBjb250cm9sLicsXG4gIHllYXI6IDE1OTUsXG4gIHdvcmRDb3VudDogMTYwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMGUyYTFhJyxcbiAgY292ZXJBY2NlbnQ6ICcjNmFiZjhhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdPcmlnaW5hbCBUZXh0JyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgUk9NRU9fQU5EX0pVTElFVDogQm9vayA9IHtcbiAgaWQ6ICdyb21lby1hbmQtanVsaWV0JyxcbiAgdGl0bGU6ICdSb21lbyBhbmQgSnVsaWV0JyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnVHdvIHRlZW5hZ2VycyBmYWxsIGluIGxvdmUgYWNyb3NzIGEgYmxvb2QgZmV1ZCBhbmQgYnVybiB0aHJvdWdoIGZpdmUgZGF5cyB0aGF0IGVuZCBpbiBhIHRvbWIuIFRoZSBvcmlnaW5hbCBzdGFyLWNyb3NzZWQgbG92ZXJzIFx1MjAxNCBhbmQgdGhlIHBsYXkgdGhhdCBtYWRlIHRyYWdlZHkgZmVlbCBsaWtlIHBvZXRyeS4nLFxuICB5ZWFyOiAxNTk3LFxuICB3b3JkQ291bnQ6IDI1MDAwLFxuICBjb3ZlckNvbG9yOiAnIzJlMTAyMCcsXG4gIGNvdmVyQWNjZW50OiAnI2Q0NjY3YScsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnT3JpZ2luYWwgVGV4dCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFRIRV9URU1QRVNUOiBCb29rID0ge1xuICBpZDogJ3RoZS10ZW1wZXN0JyxcbiAgdGl0bGU6ICdUaGUgVGVtcGVzdCcsXG4gIGF1dGhvcjogJ1dpbGxpYW0gU2hha2VzcGVhcmUnLFxuICBkZXNjcmlwdGlvbjogJ0Egc29yY2VyZXIgb24gYSByZW1vdGUgaXNsYW5kIGNvbmp1cmVzIGEgc3Rvcm0gdG8gc2hpcHdyZWNrIGhpcyBlbmVtaWVzIFx1MjAxNCB0aGVuIGNob29zZXMgbWVyY3kgb3ZlciByZXZlbmdlLiBTaGFrZXNwZWFyZVxcJ3MgZmFyZXdlbGwgdG8gdGhlIHN0YWdlOiBtYWdpYywgZm9yZ2l2ZW5lc3MsIGFuZCBsZXR0aW5nIGdvLicsXG4gIHllYXI6IDE2MTEsXG4gIHdvcmRDb3VudDogMTcwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMGUxYTJlJyxcbiAgY292ZXJBY2NlbnQ6ICcjNWE5YWJmJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdPcmlnaW5hbCBUZXh0JyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgT1RIRUxMTzogQm9vayA9IHtcbiAgaWQ6ICdvdGhlbGxvJyxcbiAgdGl0bGU6ICdPdGhlbGxvJyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnQSBNb29yaXNoIGdlbmVyYWwgaW4gVmVuaWNlLCBhIHRydXN0ZWQgZW5zaWduIHdobyBpcyBub3RoaW5nIGJ1dCBtYWxpY2UsIGFuZCBhIHdpZmUgd2hvc2Ugb25seSBjcmltZSBpcyBiZWluZyBpbm5vY2VudC4gSWFnbyB3aGlzcGVycyBqZWFsb3VzeSBpbnRvIE90aGVsbG9cXCdzIGVhciB1bnRpbCBoZSBtdXJkZXJzIHRoZSB3b21hbiBoZSBsb3ZlcyBcdTIwMTQgU2hha2VzcGVhcmVcXCdzIG1vc3QgY2xhdXN0cm9waG9iaWMgYW5kIHJhY2lhbGx5IGNoYXJnZWQgdHJhZ2VkeS4nLFxuICB5ZWFyOiAxNjAzLFxuICB3b3JkQ291bnQ6IDI2MDAwLFxuICBjb3ZlckNvbG9yOiAnIzFhMGUwZScsXG4gIGNvdmVyQWNjZW50OiAnIzhhM2ExZicsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnU2hha2VzcGVhcmUgKDE2MjIpJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG4vLyBTdGFnZWQgU2hha2VzcGVhcmUgYWRkcy5cbmV4cG9ydCBjb25zdCBLSU5HX0xFQVI6IEJvb2sgPSB7XG4gIGlkOiAna2luZy1sZWFyJyxcbiAgdGl0bGU6ICdLaW5nIExlYXInLFxuICBhdXRob3I6ICdXaWxsaWFtIFNoYWtlc3BlYXJlJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgYWdpbmcga2luZyBkaXZpZGVzIGhpcyBraW5nZG9tIGFtb25nIGhpcyBkYXVnaHRlcnMgYnkgaG93IGxvdWRseSB0aGV5IHdpbGwgc2F5IHRoZXkgbG92ZSBoaW0uIENvcmRlbGlhIHJlZnVzZXMgdG8gcGxheTsgaGVyIHNpc3RlcnMgbGllLiBCeSB0aGUgc3Rvcm0gc2NlbmUgb24gdGhlIGhlYXRoLCBMZWFyIGlzIG1hZCBhbmQgc3RyaXBwZWQgb2YgZXZlcnl0aGluZy4gVGhlIGRhcmtlc3QgYW5kIG1vc3QgcGl0aWxlc3Mgb2YgdGhlIGZvdXIgZ3JlYXQgdHJhZ2VkaWVzLicsXG4gIHllYXI6IDE2MDYsXG4gIHdvcmRDb3VudDogMjgwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWYxMDE1JyxcbiAgY292ZXJBY2NlbnQ6ICcjYTA0MDUwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ1NoYWtlc3BlYXJlICgxNjA4KScsIHllYXI6IDE2MDgsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1kYScsIGxhbmd1YWdlOiAnZGEnLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBKVUxJVVNfQ0FFU0FSOiBCb29rID0ge1xuICBpZDogJ2p1bGl1cy1jYWVzYXInLFxuICB0aXRsZTogJ0p1bGl1cyBDYWVzYXInLFxuICBhdXRob3I6ICdXaWxsaWFtIFNoYWtlc3BlYXJlJyxcbiAgZGVzY3JpcHRpb246ICdCcnV0dXMgYW5kIENhc3NpdXMgbGVhZCB0aGUgY29uc3BpcmFjeS4gQ2Flc2FyIGZhbGxzIGF0IHRoZSBmb290IG9mIFBvbXBleVxcJ3Mgc3RhdHVlIG9uIHRoZSBJZGVzIG9mIE1hcmNoLiBUaGVuIEFudG9ueSB3YWxrcyB0byB0aGUgYm9keSwgYXNrcyB0byBzcGVhayBhdCB0aGUgZnVuZXJhbCwgYW5kIHR1cm5zIHRoZSBjcm93ZCB3aXRoIHRocmVlIHdvcmRzOiBmcmllbmRzLCBSb21hbnMsIGNvdW50cnltZW4uIFRoZSBwbGF5IHRoYXQgdGF1Z2h0IHRoZSBXZXN0IHdoYXQgcmhldG9yaWMgY2FuIGRvLicsXG4gIHllYXI6IDE1OTksXG4gIHdvcmRDb3VudDogMjEwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWEyMDMwJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzBiMDcwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ1NoYWtlc3BlYXJlICgxNjIzKScsIHllYXI6IDE2MjMsIGFsaWduZWQ6IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7IGtleTogJ21vZGVybi1kYScsIGxhbmd1YWdlOiAnZGEnLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgVFdFTEZUSF9OSUdIVDogQm9vayA9IHtcbiAgaWQ6ICd0d2VsZnRoLW5pZ2h0JyxcbiAgdGl0bGU6ICdUd2VsZnRoIE5pZ2h0JyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnVmlvbGEgaXMgc2hpcHdyZWNrZWQgaW4gSWxseXJpYSwgZGlzZ3Vpc2VzIGhlcnNlbGYgYXMgYSBib3ksIGFuZCBlbmRzIHVwIHdvb2luZyBPbGl2aWEgZm9yIER1a2UgT3JzaW5vIFx1MjAxNCB3aG9tIHNoZSBmYWxscyBmb3IuIE9saXZpYSBmYWxscyBmb3IgdGhlIGRpc2d1aXNlLiBNZWFud2hpbGUgU2lyIFRvYnkgYW5kIGZyaWVuZHMgZ3VsbCB0aGUgc3Rld2FyZCBNYWx2b2xpbyBpbnRvIGJlbGlldmluZyBoaXMgbWlzdHJlc3MgbG92ZXMgaGltLiBTaGFrZXNwZWFyZVxcJ3MgbW9zdCBwZXJmZWN0bHkgYmFsYW5jZWQgY29tZWR5LicsXG4gIHllYXI6IDE2MDEsXG4gIHdvcmRDb3VudDogMjEwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWEyYTNhJyxcbiAgY292ZXJBY2NlbnQ6ICcjZTBjMDYwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ1NoYWtlc3BlYXJlICgxNjIzKScsIHllYXI6IDE2MjMsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1kYScsIGxhbmd1YWdlOiAnZGEnLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBNRVJDSEFOVF9PRl9WRU5JQ0U6IEJvb2sgPSB7XG4gIGlkOiAnbWVyY2hhbnQtb2YtdmVuaWNlJyxcbiAgdGl0bGU6ICdUaGUgTWVyY2hhbnQgb2YgVmVuaWNlJyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnQW50b25pbyBndWFyYW50ZWVzIGhpcyBmcmllbmQgQmFzc2FuaW9cXCdzIGxvYW4gZnJvbSB0aGUgbW9uZXlsZW5kZXIgU2h5bG9jazsgdGhlIGJvbmQgbmFtZXMgYSBwb3VuZCBvZiBBbnRvbmlvXFwncyBmbGVzaCBhcyBmb3JmZWl0LiBCYXNzYW5pbyB3b29zIFBvcnRpYSwgd2hvIHNob3dzIHVwIGRpc2d1aXNlZCBhcyBhIGxhd3llciB0byBhcmd1ZSB0aGUgdHJpYWwuIFRoZSBtb3N0IG1vcmFsbHkgY29tcGxpY2F0ZWQgY29tZWR5IGluIHRoZSBjYW5vbiwgc3RpbGwgYWxpdmUgaW4gZXZlcnkgcmVhZGluZy4nLFxuICB5ZWFyOiAxNTk2LFxuICB3b3JkQ291bnQ6IDIxMDAwLFxuICBjb3ZlckNvbG9yOiAnIzJhMWEwYScsXG4gIGNvdmVyQWNjZW50OiAnI2M4OTAzMCcsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTaGFrZXNwZWFyZSAoMTYwMCknLCB5ZWFyOiAxNjAwLCBhbGlnbmVkOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IE1VQ0hfQURPX0FCT1VUX05PVEhJTkc6IEJvb2sgPSB7XG4gIGlkOiAnbXVjaC1hZG8tYWJvdXQtbm90aGluZycsXG4gIHRpdGxlOiAnTXVjaCBBZG8gQWJvdXQgTm90aGluZycsXG4gIGF1dGhvcjogJ1dpbGxpYW0gU2hha2VzcGVhcmUnLFxuICBkZXNjcmlwdGlvbjogJ0JlbmVkaWNrIGFuZCBCZWF0cmljZSB0cmFkZSBpbnN1bHRzIHNvIHNoYXJwIHRoZWlyIGZyaWVuZHMgZGVjaWRlIGl0IG11c3QgYmUgbG92ZSwgYW5kIHRyaWNrIHRoZW0gaW50byBpdC4gTWVhbndoaWxlIHRoZSB2aWxsYWluIERvbiBKb2huIGVuZ2luZWVycyB0aGUgc2xhbmRlciBvZiBIZXJvIG9uIHRoZSBuaWdodCBvZiBoZXIgd2VkZGluZy4gU2hha2VzcGVhcmVcXCdzIHdpdHRpZXN0IGNvbWVkeSBcdTIwMTQgYW5kIGEgbmVhci10cmFnZWR5IGZvbGRlZCBpbnRvIGl0LicsXG4gIHllYXI6IDE1OTksXG4gIHdvcmRDb3VudDogMjIwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmExODIwJyxcbiAgY292ZXJBY2NlbnQ6ICcjZDA5MGEwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ1NoYWtlc3BlYXJlICgxNjAwKScsIHllYXI6IDE2MDAsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1kYScsIGxhbmd1YWdlOiAnZGEnLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgQVNfWU9VX0xJS0VfSVQ6IEJvb2sgPSB7XG4gIGlkOiAnYXMteW91LWxpa2UtaXQnLFxuICB0aXRsZTogJ0FzIFlvdSBMaWtlIEl0JyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnUm9zYWxpbmQsIGV4aWxlZCBmcm9tIGhlciB1bmNsZVxcJ3MgY291cnQsIGVzY2FwZXMgdG8gdGhlIEZvcmVzdCBvZiBBcmRlbiBkaXNndWlzZWQgYXMgYSBib3kgYW5kIG1lZXRzIHRoZSBtYW4gc2hlIGxvdmVzLCB3aG8gZG9lc25cXCd0IHJlY29nbml6ZSBoZXIuIFRoZSBwbGF5IHRoYXQgZ2F2ZSB1cyBcIkFsbCB0aGUgd29ybGRcXCdzIGEgc3RhZ2VcIiBhbmQgdGhlIG1vZGVsIG9mIHBhc3RvcmFsIGNvbWVkeS4nLFxuICB5ZWFyOiAxNTk5LFxuICB3b3JkQ291bnQ6IDIyMDAwLFxuICBjb3ZlckNvbG9yOiAnIzFhMmExYScsXG4gIGNvdmVyQWNjZW50OiAnI2EwYjA3MCcsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTaGFrZXNwZWFyZSAoMTYyMyknLCB5ZWFyOiAxNjIzLCBhbGlnbmVkOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAgLy8gQ2hhcHRlciBzdHJ1Y3R1cmUgZGlmZmVycyBmcm9tIHRoZSByZXBhaXJlZCBFbmdsaXNoIGVkaXRpb25zICgxNyBjaGFwdGVycyBhZ2FpbnN0IDIzKS5cbiAgICB7IGtleTogJ21vZGVybi1kYScsIGxhbmd1YWdlOiAnZGEnLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsIGFsaWduZWQ6IGZhbHNlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBUQU1JTkdfT0ZfVEhFX1NIUkVXOiBCb29rID0ge1xuICBpZDogJ3RhbWluZy1vZi10aGUtc2hyZXcnLFxuICB0aXRsZTogJ1RoZSBUYW1pbmcgb2YgdGhlIFNocmV3JyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnUGV0cnVjaGlvIGNvbWVzIHRvIFBhZHVhIHRvIHdpdmUgaXQgd2VhbHRoaWx5IGFuZCBtZWV0cyBLYXRoYXJpbmEsIHRoZSB1bm1hcnJpYWdlYWJsZSBlbGRlciBkYXVnaHRlciBvZiBCYXB0aXN0YS4gSGUgdW5kZXJ0YWtlcyB0byB0YW1lIGhlcjsgc2hlIGlzIG1vcmUgdGhhbiBoaXMgbWF0Y2guIFRoZSBjb21lZHkgdGhhdCBoYXMgZGl2aWRlZCByZWFkZXJzIGZvciBmb3VyIGNlbnR1cmllcy4nLFxuICB5ZWFyOiAxNTkyLFxuICB3b3JkQ291bnQ6IDIyMDAwLFxuICBjb3ZlckNvbG9yOiAnIzJhMWExYScsXG4gIGNvdmVyQWNjZW50OiAnI2QwYTA3MCcsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTaGFrZXNwZWFyZSAoMTYyMyknLCB5ZWFyOiAxNjIzLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgQU5UT05ZX0FORF9DTEVPUEFUUkE6IEJvb2sgPSB7XG4gIGlkOiAnYW50b255LWFuZC1jbGVvcGF0cmEnLFxuICB0aXRsZTogJ0FudG9ueSBhbmQgQ2xlb3BhdHJhJyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnTWFyayBBbnRvbnksIG1hc3RlciBvZiB0aGUgZWFzdGVybiBSb21hbiB3b3JsZCwgbG9zZXMgZXZlcnl0aGluZyB0byBhIGxvdmUgYWZmYWlyIHdpdGggdGhlIHF1ZWVuIG9mIEVneXB0LiBUaGUgbW9zdCBleHBhbnNpdmUgb2YgdGhlIHRyYWdlZGllcyBcdTIwMTQgbW92aW5nIGFjcm9zcyB0aGUgTWVkaXRlcnJhbmVhbiBpbiA0MiBzY2VuZXMgXHUyMDE0IGFuZCB0aGUgbW9zdCBhZHVsdC4nLFxuICB5ZWFyOiAxNjA2LFxuICB3b3JkQ291bnQ6IDI3MDAwLFxuICBjb3ZlckNvbG9yOiAnIzFhMTIyOCcsXG4gIGNvdmVyQWNjZW50OiAnI2M4OTA2MCcsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTaGFrZXNwZWFyZSAoMTYyMyknLCB5ZWFyOiAxNjIzLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgUklDSEFSRF9JSUk6IEJvb2sgPSB7XG4gIGlkOiAncmljaGFyZC1paWknLFxuICB0aXRsZTogJ1JpY2hhcmQgSUlJJyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnTm93IGlzIHRoZSB3aW50ZXIgb2Ygb3VyIGRpc2NvbnRlbnQuIFRoZSBodW5jaGJhY2tlZCBEdWtlIG9mIEdsb3VjZXN0ZXIgc2NoZW1lcywgc2VkdWNlcywgYW5kIG11cmRlcnMgaGlzIHdheSB0byB0aGUgdGhyb25lIG9mIEVuZ2xhbmQsIG9ubHkgdG8gbG9zZSBpdCBhdCBCb3N3b3J0aCBGaWVsZCBcdTIwMTQgXCJBIGhvcnNlISBBIGhvcnNlISBNeSBraW5nZG9tIGZvciBhIGhvcnNlIVwiIFRoZSB5b3VuZyBTaGFrZXNwZWFyZVxcJ3MgYnJlYWt0aHJvdWdoIGluIHRyYWdpYyB2aWxsYWlueS4nLFxuICB5ZWFyOiAxNTkzLFxuICB3b3JkQ291bnQ6IDI4MDAwLFxuICBjb3ZlckNvbG9yOiAnIzFmMGEwYScsXG4gIGNvdmVyQWNjZW50OiAnI2E4NTAzMCcsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTaGFrZXNwZWFyZSAoMTU5NyknLCB5ZWFyOiAxNTk3LCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEhFTlJZX1Y6IEJvb2sgPSB7XG4gIGlkOiAnaGVucnktdicsXG4gIHRpdGxlOiAnSGVucnkgVicsXG4gIGF1dGhvcjogJ1dpbGxpYW0gU2hha2VzcGVhcmUnLFxuICBkZXNjcmlwdGlvbjogJ1RoZSB5b3VuZyBraW5nIHdobyBvbmNlIGNhcm91c2VkIHdpdGggRmFsc3RhZmYgaW52YWRlcyBGcmFuY2UsIGRlZmVhdHMgZml2ZS10by1vbmUgb2RkcyBhdCBBZ2luY291cnQsIGFuZCB3b29zIGEgcHJpbmNlc3MgaW4gYnJva2VuIEZyZW5jaC4gXCJXZSBmZXcsIHdlIGhhcHB5IGZldywgd2UgYmFuZCBvZiBicm90aGVyc1wiIFx1MjAxNCB0aGUgbW9zdC1xdW90ZWQgc3BlZWNoIGFib3V0IGxlYWRlcnNoaXAgaW4gRW5nbGlzaC4nLFxuICB5ZWFyOiAxNTk5LFxuICB3b3JkQ291bnQ6IDIyMDAwLFxuICBjb3ZlckNvbG9yOiAnIzFhMjIzMCcsXG4gIGNvdmVyQWNjZW50OiAnI2MwYTA2MCcsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTaGFrZXNwZWFyZSAoMTYwMCknLCB5ZWFyOiAxNjAwLCBhbGlnbmVkOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBDT1JJT0xBTlVTOiBCb29rID0ge1xuICBpZDogJ2NvcmlvbGFudXMnLFxuICB0aXRsZTogJ0NvcmlvbGFudXMnLFxuICBhdXRob3I6ICdXaWxsaWFtIFNoYWtlc3BlYXJlJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgUm9tYW4gZ2VuZXJhbCBDYWl1cyBNYXJjaXVzLCByZW5hbWVkIENvcmlvbGFudXMgZm9yIHNhY2tpbmcgdGhlIFZvbHNjaWFuIGNhcGl0YWwsIHJldHVybnMgdG8gUm9tZSBhIGhlcm8gXHUyMDE0IGFuZCByZWZ1c2VzIHRvIGZsYXR0ZXIgdGhlIHBsZWJlaWFucyBmb3IgdGhlIGNvbnN1bHNoaXAuIEJhbmlzaGVkLCBoZSBqb2lucyBoaXMgb2xkIGVuZW15IHRvIG1hcmNoIG9uIFJvbWUuIFRoZSBtb3N0IHBvbGl0aWNhbCBvZiB0aGUgdHJhZ2VkaWVzIGFuZCB0aGUgbW9zdCBydXRobGVzc2x5IHByb3VkIGhlcm8gaW4gdGhlIGNhbm9uLicsXG4gIHllYXI6IDE2MDgsXG4gIHdvcmRDb3VudDogMjYwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmExYTFhJyxcbiAgY292ZXJBY2NlbnQ6ICcjOGE0MDMwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ1NoYWtlc3BlYXJlICgxNjIzKScsIHllYXI6IDE2MjMsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFdJTlRFUlNfVEFMRTogQm9vayA9IHtcbiAgaWQ6ICd3aW50ZXJzLXRhbGUnLFxuICB0aXRsZTogXCJUaGUgV2ludGVyJ3MgVGFsZVwiLFxuICBhdXRob3I6ICdXaWxsaWFtIFNoYWtlc3BlYXJlJyxcbiAgZGVzY3JpcHRpb246ICdLaW5nIExlb250ZXMgYmVjb21lcyBjb252aW5jZWQgXHUyMDE0IHdpdGhvdXQgZXZpZGVuY2UgXHUyMDE0IHRoYXQgaGlzIHdpZmUgaXMgY2hlYXRpbmcuIEhlIGRlc3Ryb3lzIGhpcyBtYXJyaWFnZSBhbmQgaGlzIGZhbWlseSBiZWZvcmUgaGUgcmVhbGl6ZXMgd2hhdCBoZVxcJ3MgZG9uZS4gU2l4dGVlbiB5ZWFycyBsYXRlciwgdGhlIHBsYXkgbW92ZXMgdG8gYSBwYXN0b3JhbCB3b3JsZCwgYSBzaGVlcC1zaGVhcmluZyBmZWFzdCwgYW5kIHRoZSBtb3N0IGZhbW91cyBzdGFnZSBkaXJlY3Rpb24gaW4gbGl0ZXJhdHVyZTogRXhpdCwgcHVyc3VlZCBieSBhIGJlYXIuJyxcbiAgeWVhcjogMTYxMSxcbiAgd29yZENvdW50OiAyMzAwMCxcbiAgY292ZXJDb2xvcjogJyMxYTIyMzAnLFxuICBjb3ZlckFjY2VudDogJyNhOGI4YzgnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnU2hha2VzcGVhcmUgKDE2MjMpJywgeWVhcjogMTYyMywgYWxpZ25lZDogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWRhJywgbGFuZ3VhZ2U6ICdkYScsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJywgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBDT01FRFlfT0ZfRVJST1JTOiBCb29rID0ge1xuICBpZDogJ2NvbWVkeS1vZi1lcnJvcnMnLFxuICB0aXRsZTogJ1RoZSBDb21lZHkgb2YgRXJyb3JzJyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnVHdvIHNldHMgb2YgaWRlbnRpY2FsIHR3aW5zLCBzZXBhcmF0ZWQgYXMgYmFiaWVzLCBlbmQgdXAgaW4gdGhlIHNhbWUgY2l0eSBvbiB0aGUgc2FtZSBkYXksIGxlYWRpbmcgdG8gbmluZXR5IG1pbnV0ZXMgb2YgbWlzdGFrZW4gaWRlbnRpdHksIHNsYXBzdGljaywgYW5kIGEgZmluYWwgcmV1bmlvbi4gU2hha2VzcGVhcmVcXCdzIHNob3J0ZXN0IHBsYXkgYW5kIHRoZSBmb3VuZGF0aW9uIG9mIGV2ZXJ5IGZhcmNlIHdyaXR0ZW4gc2luY2UuJyxcbiAgeWVhcjogMTU5NCxcbiAgd29yZENvdW50OiAxNjAwMCxcbiAgY292ZXJDb2xvcjogJyMyYTIwMTgnLFxuICBjb3ZlckFjY2VudDogJyNkMGIwNzAnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnU2hha2VzcGVhcmUgKDE2MjMpJywgeWVhcjogMTYyMywgYWxpZ25lZDogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1kYScsIGxhbmd1YWdlOiAnZGEnLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsIGFsaWduZWQ6IHRydWUgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IE1FQVNVUkVfRk9SX01FQVNVUkU6IEJvb2sgPSB7XG4gIGlkOiAnbWVhc3VyZS1mb3ItbWVhc3VyZScsXG4gIHRpdGxlOiAnTWVhc3VyZSBmb3IgTWVhc3VyZScsXG4gIGF1dGhvcjogJ1dpbGxpYW0gU2hha2VzcGVhcmUnLFxuICBkZXNjcmlwdGlvbjogJ1RoZSBEdWtlIG9mIFZpZW5uYSBsZWF2ZXMgdGhlIHB1cml0YW5pY2FsIEFuZ2VsbyBpbiBjaGFyZ2UgYW5kIGRpc2FwcGVhcnMuIEFuZ2VsbyBzZW50ZW5jZXMgYSB5b3VuZyBtYW4gdG8gZGVhdGggZm9yIGZvcm5pY2F0aW9uOyB0aGUgbWFuXFwncyBzaXN0ZXIsIGEgbm92aWNlIG51biwgcGxlYWRzIHdpdGggaGltOyBBbmdlbG8gb2ZmZXJzIGhlciBicm90aGVyXFwncyBsaWZlIGZvciBoZXIgYm9keS4gVGhlIGJsZWFrZXN0IG9mIHRoZSBcInByb2JsZW0gcGxheXNcIiBcdTIwMTQgY29tZWR5IGluIG5hbWUgb25seS4nLFxuICB5ZWFyOiAxNjA0LFxuICB3b3JkQ291bnQ6IDIyMDAwLFxuICBjb3ZlckNvbG9yOiAnIzFmMWEyYScsXG4gIGNvdmVyQWNjZW50OiAnIzhhNzA5MCcsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTaGFrZXNwZWFyZSAoMTYyMyknLCB5ZWFyOiAxNjIzLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgQ1lNQkVMSU5FOiBCb29rID0ge1xuICBpZDogJ2N5bWJlbGluZScsXG4gIHRpdGxlOiAnQ3ltYmVsaW5lJyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnQSBsYXRlIHJvbWFuY2U6IEtpbmcgQ3ltYmVsaW5lIG9mIEJyaXRhaW4sIGhpcyBiYW5pc2hlZCBkYXVnaHRlciBJbW9nZW4sIHRoZSB2aWxsYWluIElhY2hpbW8gd2hvIGJldHMgaGUgY2FuIHNlZHVjZSBoZXIsIHRoZSBsb3N0IHByaW5jZXMgcmFpc2VkIGluIGEgV2Vsc2ggY2F2ZS4gV2FnZXJzLCBzZXZlcmVkIGhlYWRzLCBhIHBvaXNvbmVkIGRyaW5rLCBhIFJvbWFuIGludmFzaW9uIFx1MjAxNCBhbmQgYSByZWNvZ25pdGlvbiBzY2VuZSB0aGF0IHB1bGxzIHRoaXJ0eSB0aHJlYWRzIGludG8gb25lLicsXG4gIHllYXI6IDE2MTAsXG4gIHdvcmRDb3VudDogMjYwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWEyNTI4JyxcbiAgY292ZXJBY2NlbnQ6ICcjYTBjMGIwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ1NoYWtlc3BlYXJlICgxNjIzKScsIHllYXI6IDE2MjMsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1kYScsIGxhbmd1YWdlOiAnZGEnLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBIRU5SWV9JVl9QQVJUXzI6IEJvb2sgPSB7XG4gIGlkOiAnaGVucnktaXYtcGFydC0yJyxcbiAgdGl0bGU6ICdIZW5yeSBJViwgUGFydCAyJyxcbiAgYXV0aG9yOiAnV2lsbGlhbSBTaGFrZXNwZWFyZScsXG4gIGRlc2NyaXB0aW9uOiAnSGFsXFwncyBjb3JvbmF0aW9uIGxvb21zLiBUaGUgZHlpbmcga2luZyBtaXN0YWtlcyB0aGUgcHJpbmNlXFwncyBncmllZiBmb3IgZ3JlZWQgYW5kIHJhZ2VzIGFnYWluc3QgaGltLiBGYWxzdGFmZiByaWRlcyB0b3dhcmQgTG9uZG9uIHRvIGNsYWltIHRoZSBmYXZvciBvZiB0aGUgbmV3IGtpbmcgXHUyMDE0IGFuZCBnZXRzIG9uZSBvZiB0aGUgbW9zdCBkZXZhc3RhdGluZyBkaXNtaXNzYWxzIGluIEVuZ2xpc2g6IEkga25vdyB0aGVlIG5vdCwgb2xkIG1hbi4nLFxuICB5ZWFyOiAxNTk4LFxuICB3b3JkQ291bnQ6IDI2MDAwLFxuICBjb3ZlckNvbG9yOiAnIzFhMWEyOCcsXG4gIGNvdmVyQWNjZW50OiAnI2E4OTA2MCcsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTaGFrZXNwZWFyZSAoMTYwMCknLCB5ZWFyOiAxNjAwLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgTUVSUllfV0lWRVNfT0ZfV0lORFNPUjogQm9vayA9IHtcbiAgaWQ6ICdtZXJyeS13aXZlcy1vZi13aW5kc29yJyxcbiAgdGl0bGU6ICdUaGUgTWVycnkgV2l2ZXMgb2YgV2luZHNvcicsXG4gIGF1dGhvcjogJ1dpbGxpYW0gU2hha2VzcGVhcmUnLFxuICBkZXNjcmlwdGlvbjogJ0ZhbHN0YWZmIHRyaWVzIHRvIHNlZHVjZSB0d28gcmVzcGVjdGFibGUgV2luZHNvciBtYXRyb25zIGZvciB0aGVpciBtb25leSwgc2VuZGluZyBlYWNoIHRoZSBzYW1lIGxvdmUgbGV0dGVyLiBUaGV5IGNvbXBhcmUgbm90ZXMgYW5kIGFycmFuZ2UgdGhlIG1vc3QgaHVtaWxpYXRpbmcgc2VyaWVzIG9mIHB1bmlzaG1lbnRzIGluIHRoZSBjYW5vbiBcdTIwMTQgaW5jbHVkaW5nIGEgc29ha2luZyBpbiB0aGUgVGhhbWVzIGluIGEgbGF1bmRyeSBiYXNrZXQuIFRoZSBtb3N0IGZhcmNpY2FsIHBsYXkgYW5kIHRoZSBvbmUgUXVlZW4gRWxpemFiZXRoIHN1cHBvc2VkbHkgZGVtYW5kZWQuJyxcbiAgeWVhcjogMTU5NyxcbiAgd29yZENvdW50OiAyMjAwMCxcbiAgY292ZXJDb2xvcjogJyMxZjI4MjAnLFxuICBjb3ZlckFjY2VudDogJyNjMGE4NTAnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnU2hha2VzcGVhcmUgKDE2MjMpJywgeWVhcjogMTYyMywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWRhJywgbGFuZ3VhZ2U6ICdkYScsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFBSSURFX0FORF9QUkVKVURJQ0U6IEJvb2sgPSB7XG4gIGlkOiAncHJpZGUtYW5kLXByZWp1ZGljZScsXG4gIHRpdGxlOiAnUHJpZGUgYW5kIFByZWp1ZGljZScsXG4gIGF1dGhvcjogJ0phbmUgQXVzdGVuJyxcbiAgZGVzY3JpcHRpb246ICdBIHNoYXJwLXRvbmd1ZWQgd29tYW4gYW5kIGEgcHJvdWQgZ2VudGxlbWFuIGNpcmNsZSBlYWNoIG90aGVyIHRocm91Z2ggYmFsbHMsIG1pc3VuZGVyc3RhbmRpbmdzLCBhbmQgcHJpZGUgXHUyMDE0IHVudGlsIHRoZXkgZG9uXFwndC4gVGhlIG5vdmVsIHRoYXQgaW52ZW50ZWQgdGhlIHJvbWFudGljIGNvbWVkeS4nLFxuICB5ZWFyOiAxODEzLFxuICB3b3JkQ291bnQ6IDEyMjAwMCxcbiAgY292ZXJDb2xvcjogJyMyZTIwMTQnLFxuICBjb3ZlckFjY2VudDogJyNkNGE4NmEnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnT3JpZ2luYWwgKDE4MTMpJywgeWVhcjogMTgxMywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIC8vIEtlZXBzIHRoZSBwcmUtMjAyNi0wOS0yNSBwYXJhZ3JhcGhpbmc7IHRoZSBFbmdsaXNoIGVkaXRpb25zIHdlcmUgcmVzdHJ1Y3R1cmVkLlxuICAgIHsga2V5OiAnbW9kZXJuLWRhJywgbGFuZ3VhZ2U6ICdkYScsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJywgYWxpZ25lZDogZmFsc2UgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFRIRV9BUlRfT0ZfV0FSOiBCb29rID0ge1xuICBpZDogJ3RoZS1hcnQtb2Ytd2FyJyxcbiAgdGl0bGU6ICdUaGUgQXJ0IG9mIFdhcicsXG4gIGF1dGhvcjogJ1N1biBUenUnLFxuICBkZXNjcmlwdGlvbjogJ1RoaXJ0ZWVuIGNoYXB0ZXJzIG9uIHN0cmF0ZWd5LCBkZWNlcHRpb24sIGFuZCB0aGUgbmF0dXJlIG9mIGNvbmZsaWN0IFx1MjAxNCB3cml0dGVuIDIsNTAwIHllYXJzIGFnbywgc3RpbGwgdGhlIHNoYXJwZXN0IG1hbnVhbCBvbiBob3cgdG8gd2luIHdpdGhvdXQgZmlnaHRpbmcuJyxcbiAgeWVhcjogLTUwMCxcbiAgd29yZENvdW50OiAxMzAwMCxcbiAgY292ZXJDb2xvcjogJyMyYTFhMGEnLFxuICBjb3ZlckFjY2VudDogJyNjNGEwMzUnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICAvLyBSZXBsYWNlZCAyMDI2LTEwLTAxIChyaWdodHMpOiBDYXB0YWluIEUuIEYuIENhbHRocm9wLCBUaGUgQm9vayBvZiBXYXIgKExvbmRvbjogSm9obiBNdXJyYXksIDE5MDgpLFxuICAgICAgLy8gUHJvamVjdCBHdXRlbmJlcmcgIzQ0MDI0LiBDYWx0aHJvcCBkaWVkIDE5MTUuIE1vZGVybiBFbmdsaXNoIGlzIGEgVGluY3QgcmVuZGVyaW5nIG9mIHRoaXMgdGV4dC5cbiAgICAgIGxhYmVsOiAnQ2FsdGhyb3AgVHJhbnNsYXRpb24gKDE5MDgpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdFLiBGLiBDYWx0aHJvcCcsXG4gICAgICB5ZWFyOiAxOTA4LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IENSSU1FX0FORF9QVU5JU0hNRU5UOiBCb29rID0ge1xuICBpZDogJ2NyaW1lLWFuZC1wdW5pc2htZW50JyxcbiAgdGl0bGU6ICdDcmltZSBhbmQgUHVuaXNobWVudCcsXG4gIGF1dGhvcjogJ0Z5b2RvciBEb3N0b2V2c2t5JyxcbiAgZGVzY3JpcHRpb246ICdBIGJyaWxsaWFudCBzdHVkZW50IGNvbW1pdHMgdGhlIHBlcmZlY3QgbXVyZGVyIFx1MjAxNCB0aGVuIGRpc2NvdmVycyB0aGF0IGd1aWx0IGlzIGEgcHVuaXNobWVudCBubyBsb2dpYyBjYW4gZXNjYXBlLiBEb3N0b2V2c2t5XFwncyBtYXN0ZXJwaWVjZSBvZiBjb25zY2llbmNlLCBwYXJhbm9pYSwgYW5kIHJlZGVtcHRpb24uJyxcbiAgeWVhcjogMTg2NixcbiAgd29yZENvdW50OiAyMTEwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWExYTFhJyxcbiAgY292ZXJBY2NlbnQ6ICcjOGI0NTEzJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdHYXJuZXR0IFRyYW5zbGF0aW9uICgxOTE0KScsXG4gICAgICB0cmFuc2xhdG9yOiAnQ29uc3RhbmNlIEdhcm5ldHQnLFxuICAgICAgeWVhcjogMTkxNCxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFRIRV9SRVBVQkxJQzogQm9vayA9IHtcbiAgaWQ6ICd0aGUtcmVwdWJsaWMnLFxuICB0aXRsZTogJ1RoZSBSZXB1YmxpYycsXG4gIGF1dGhvcjogJ1BsYXRvJyxcbiAgZGVzY3JpcHRpb246ICdTb2NyYXRlcyBhbmQgaGlzIGZyaWVuZHMgc3BlbmQgb25lIGxvbmcgbmlnaHQgYXNraW5nIHRoZSBoYXJkZXN0IHF1ZXN0aW9uOiB3aGF0IGlzIGp1c3RpY2U/IEFsb25nIHRoZSB3YXkgdGhleSBidWlsZCBhIGNpdHkgaW4gd29yZHMsIGRpc2NvdmVyIHRoZSBGb3JtcywgYW5kIGRlc2NlbmQgaW50byBhIGNhdmUuIFBoaWxvc29waHkgYmVnaW5zIGhlcmUuJyxcbiAgeWVhcjogLTM3NSxcbiAgd29yZENvdW50OiAxMjAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWEyYTNhJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzliODk2JyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdKb3dldHQgVHJhbnNsYXRpb24gKDE4NzEpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdCZW5qYW1pbiBKb3dldHQnLFxuICAgICAgeWVhcjogMTg3MSxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IE1FRElUQVRJT05TOiBCb29rID0ge1xuICBpZDogJ21lZGl0YXRpb25zJyxcbiAgdGl0bGU6ICdNZWRpdGF0aW9ucycsXG4gIGF1dGhvcjogJ01hcmN1cyBBdXJlbGl1cycsXG4gIGRlc2NyaXB0aW9uOiAnQSBSb21hbiBlbXBlcm9yXFwncyBwcml2YXRlIGpvdXJuYWwgXHUyMDE0IHdyaXR0ZW4gb24gY2FtcGFpZ24sIG5ldmVyIG1lYW50IHRvIGJlIHJlYWQuIE5vIHNlbGYtaGVscCBwbGF0aXR1ZGVzLCBqdXN0IGEgbWFuIHdyZXN0bGluZyB3aXRoIGR1dHksIG1vcnRhbGl0eSwgYW5kIGhvdyB0byBiZSBnb29kIHdoZW4gdGhlIHdvcmxkIGlzblxcJ3QuJyxcbiAgeWVhcjogMTgwLFxuICAvLyBUaGUgc2VydmVkIG1vZGVybi1lbiwgNDUsNDUxIHdvcmRzIG92ZXIgNDg3IG51bWJlcmVkIHNlY3Rpb25zLiBUaGVcbiAgLy8gcHJldmlvdXMgNDUsMDAwIGRlc2NyaWJlZCBubyBzZXJ2ZWQgZmlsZSAodGhlIENhc2F1Ym9uLWJhc2VkIG1vZGVybi1lblxuICAvLyBpdCBzYXQgbmV4dCB0byB3YXMgNTcsMjM2KS5cbiAgd29yZENvdW50OiA0NTQ1MSxcbiAgY292ZXJDb2xvcjogJyMyYTIwMTgnLFxuICBjb3ZlckFjY2VudDogJyM5YThhNmEnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIC8vIFRydWUgYXMgb2YgdGhlIDIwMjYtMDktMTIgcmUtYmFzaW5nLCBhbmQgZmFsc2UgYmVmb3JlIGl0OiB0aGUgc2VydmVkXG4gICAgICAvLyB0ZXh0IHVuZGVyIHRoaXMga2V5IHdhcyBNZXJpYyBDYXNhdWJvbiAxNjM0ICg0MTIgcGFyYWdyYXBocykgd2hpbGVcbiAgICAgIC8vIHRoaXMgbGFiZWwgYWxyZWFkeSBjbGFpbWVkIExvbmcuIEl0IGlzIG5vdyBHZW9yZ2UgTG9uZyAxODYyXG4gICAgICAvLyAoUHJvamVjdCBHdXRlbmJlcmcgIzE1ODc3KSwgNDg3IHBhcmFncmFwaHMsIG9uZSBwZXIgbnVtYmVyZWQgc2VjdGlvbi5cbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ0xvbmcgVHJhbnNsYXRpb24gKDE4NjIpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdHZW9yZ2UgTG9uZycsXG4gICAgICB5ZWFyOiAxODYyLFxuICAgICAgLy8gVmVyaWZpZWQ6IDQ4NyBwYXJhZ3JhcGhzIGluIGJvdGggRW5nbGlzaCBlZGl0aW9ucywgaW5kZXggZm9yIGluZGV4LFxuICAgICAgLy8gZXZlcnkgcGFyYWdyYXBoIG9wZW5pbmcgb24gdGhlIHNhbWUgc2VjdGlvbiBudW1iZXIuXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBESVZJTkVfQ09NRURZOiBCb29rID0ge1xuICBpZDogJ2RpdmluZS1jb21lZHknLFxuICB0aXRsZTogJ1RoZSBEaXZpbmUgQ29tZWR5JyxcbiAgYXV0aG9yOiAnRGFudGUgQWxpZ2hpZXJpJyxcbiAgZGVzY3JpcHRpb246ICdBIHBvZXQgd2Fsa3MgdGhyb3VnaCBIZWxsLCBjbGltYnMgdGhlIG1vdW50YWluIG9mIFB1cmdhdG9yeSwgYW5kIGFzY2VuZHMgaW50byBQYXJhZGlzZSBcdTIwMTQgZ3VpZGVkIGZpcnN0IGJ5IHJlYXNvbiwgdGhlbiBieSBsb3ZlLiBUaGUgam91cm5leSB0aGF0IG1hcHBlZCB0aGUgYWZ0ZXJsaWZlIGFuZCBpbnZlbnRlZCBJdGFsaWFuIGxpdGVyYXR1cmUuJyxcbiAgeWVhcjogMTMyMCxcbiAgd29yZENvdW50OiAxMTAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWEwYTBhJyxcbiAgY292ZXJBY2NlbnQ6ICcjZDRhMDMwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdMb25nZmVsbG93IFRyYW5zbGF0aW9uICgxODY3KScsXG4gICAgICB0cmFuc2xhdG9yOiAnSGVucnkgV2Fkc3dvcnRoIExvbmdmZWxsb3cnLFxuICAgICAgeWVhcjogMTg2NyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEpBTkVfRVlSRTogQm9vayA9IHtcbiAgaWQ6ICdqYW5lLWV5cmUnLFxuICB0aXRsZTogJ0phbmUgRXlyZScsXG4gIGF1dGhvcjogJ0NoYXJsb3R0ZSBCcm9udFx1MDBFQicsXG4gIGRlc2NyaXB0aW9uOiAnQW4gb3JwaGFuIHdpdGggYSBmaWVyY2Ugd2lsbCBhbmQgYSBxdWlldCB2b2ljZSBmaWdodHMgaGVyIHdheSBmcm9tIGNydWVsdHkgdG8gaW5kZXBlbmRlbmNlIFx1MjAxNCB0aGVuIGZhbGxzIGluIGxvdmUgd2l0aCBhIG1hbiBoaWRpbmcgYSB0ZXJyaWJsZSBzZWNyZXQuIFwiUmVhZGVyLCBJIG1hcnJpZWQgaGltLlwiJyxcbiAgeWVhcjogMTg0NyxcbiAgd29yZENvdW50OiAxODgwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmExYTJhJyxcbiAgY292ZXJBY2NlbnQ6ICcjYjg3YWEwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdPcmlnaW5hbCAoMTg0NyknLFxuICAgICAgeWVhcjogMTg0NyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIC8vIEtlZXBzIHRoZSBwcmUtMjAyNi0wOS0yNSBwYXJhZ3JhcGhpbmc7IHRoZSBFbmdsaXNoIGVkaXRpb25zIHdlcmUgcmVzdHJ1Y3R1cmVkLlxuICAgICAgYWxpZ25lZDogZmFsc2UsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFRIRV9BRU5FSUQ6IEJvb2sgPSB7XG4gIGlkOiAndGhlLWFlbmVpZCcsXG4gIHRpdGxlOiAnVGhlIEFlbmVpZCcsXG4gIGF1dGhvcjogJ1ZpcmdpbCcsXG4gIGRlc2NyaXB0aW9uOiAnQSBUcm9qYW4gcHJpbmNlIGZsZWVzIHRoZSBydWlucyBvZiBoaXMgY2l0eSwgd2FuZGVycyB0aGUgTWVkaXRlcnJhbmVhbiBmb3Igc2V2ZW4geWVhcnMsIGFuZCBmaWdodHMgdG8gZm91bmQgYSBuZXcgaG9tZWxhbmQgaW4gSXRhbHkuIFRoZSBlcGljIHRoYXQgZ2F2ZSBSb21lIGl0cyBvcmlnaW4gc3RvcnkgXHUyMDE0IGFuZCBMYXRpbiBsaXRlcmF0dXJlIGl0cyBtYXN0ZXJwaWVjZS4nLFxuICB5ZWFyOiAtMTksXG4gIHdvcmRDb3VudDogMTEwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzFhMWEwYScsXG4gIGNvdmVyQWNjZW50OiAnI2M0YTAzNScsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnRHJ5ZGVuIFRyYW5zbGF0aW9uICgxNjk3KScsXG4gICAgICB0cmFuc2xhdG9yOiAnSm9obiBEcnlkZW4nLFxuICAgICAgeWVhcjogMTY5NyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFBBUkFESVNFX0xPU1Q6IEJvb2sgPSB7XG4gIGlkOiAncGFyYWRpc2UtbG9zdCcsXG4gIHRpdGxlOiAnUGFyYWRpc2UgTG9zdCcsXG4gIGF1dGhvcjogJ0pvaG4gTWlsdG9uJyxcbiAgZGVzY3JpcHRpb246ICdTYXRhbiByZWJlbHMgYWdhaW5zdCBIZWF2ZW4sIGNvcnJ1cHRzIGh1bWFuaXR5LCBhbmQgbG9zZXMgZXZlcnl0aGluZyBcdTIwMTQgYnV0IG5ldmVyIHN0b3BzIHRhbGtpbmcuIE1pbHRvblxcJ3MgYmxpbmQgZXBpYyBvZiBmcmVlIHdpbGwsIGRpc29iZWRpZW5jZSwgYW5kIHRoZSBjb3N0IG9mIGtub3dsZWRnZS4nLFxuICB5ZWFyOiAxNjY3LFxuICB3b3JkQ291bnQ6IDgwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzBhMGExYScsXG4gIGNvdmVyQWNjZW50OiAnI2EwYTBkNCcsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnT3JpZ2luYWwgKDE2NzQpJyxcbiAgICAgIHllYXI6IDE2NzQsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBGUkFOS0VOU1RFSU46IEJvb2sgPSB7XG4gIGlkOiAnZnJhbmtlbnN0ZWluJyxcbiAgdGl0bGU6ICdGcmFua2Vuc3RlaW4nLFxuICBhdXRob3I6ICdNYXJ5IFNoZWxsZXknLFxuICBkZXNjcmlwdGlvbjogJ0EgeW91bmcgc2NpZW50aXN0IGNyZWF0ZXMgbGlmZSBmcm9tIGRlYWQgZmxlc2ggXHUyMDE0IHRoZW4gYWJhbmRvbnMgaXQuIFRoZSBjcmVhdHVyZSwgYXJ0aWN1bGF0ZSBhbmQgZGVzcGVyYXRlLCB3YW50cyBvbmx5IHRvIGJlIGxvdmVkLiBUaGUgbm92ZWwgdGhhdCBpbnZlbnRlZCBzY2llbmNlIGZpY3Rpb24gYW5kIG5ldmVyIGxldHMgeW91IGRlY2lkZSB3aG8gdGhlIHJlYWwgbW9uc3RlciBpcy4nLFxuICB5ZWFyOiAxODE4LFxuICB3b3JkQ291bnQ6IDc1MDAwLFxuICBjb3ZlckNvbG9yOiAnIzBhMWEwYScsXG4gIGNvdmVyQWNjZW50OiAnIzZhYjU2YScsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnT3JpZ2luYWwgKDE4MzEpJyxcbiAgICAgIHllYXI6IDE4MzEsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBUSEVfTUFOVUFMOiBCb29rID0ge1xuICBpZDogJ3RoZS1tYW51YWwnLFxuICB0aXRsZTogJ1RoZSBNYW51YWwnLFxuICBhdXRob3I6ICdFcGljdGV0dXMnLFxuICBkZXNjcmlwdGlvbjogJ1RoZSBlc3NlbnRpYWwgaGFuZGJvb2sgb2YgU3RvaWMgcGhpbG9zb3BoeS4gSW4gNTIgc2hvcnQgc2VjdGlvbnMsIEVwaWN0ZXR1cyBzZXRzIG91dCB0aGUgc2luZ2xlIG1vc3QgaW1wb3J0YW50IGlkZWEgaW4gU3RvaWNpc206IGRpc3Rpbmd1aXNoIHdoYXQgaXMgaW4geW91ciBwb3dlciBmcm9tIHdoYXQgaXMgbm90LCBhbmQgY29uY2VybiB5b3Vyc2VsZiBvbmx5IHdpdGggdGhlIGZvcm1lci4nLFxuICB5ZWFyOiAxMjUsXG4gIHdvcmRDb3VudDogMTAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmMyYzFlJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzhiODdhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdMb25nICgxODc3KScsXG4gICAgICB0cmFuc2xhdG9yOiAnR2VvcmdlIExvbmcnLFxuICAgICAgeWVhcjogMTg3NyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgQ09ORkVTU0lPTlM6IEJvb2sgPSB7XG4gIGlkOiAnY29uZmVzc2lvbnMnLFxuICB0aXRsZTogJ0NvbmZlc3Npb25zJyxcbiAgYXV0aG9yOiAnQXVndXN0aW5lJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgZmlyc3QgZ3JlYXQgc3Bpcml0dWFsIGF1dG9iaW9ncmFwaHkuIEF1Z3VzdGluZSB0cmFjZXMgaGlzIGpvdXJuZXkgZnJvbSB5b3V0aGZ1bCBzaW4gdGhyb3VnaCBNYW5pY2hhZWFuIHBoaWxvc29waHkgdG8gQ2hyaXN0aWFuIGNvbnZlcnNpb24gXHUyMDE0IHdyZXN0bGluZyB3aXRoIGRlc2lyZSwgd2lsbCwgYW5kIHRoZSBuYXR1cmUgb2YgR29kIGFjcm9zcyB0aGlydGVlbiBzZWFyaW5nbHkgaG9uZXN0IGJvb2tzLicsXG4gIHllYXI6IDM5NyxcbiAgd29yZENvdW50OiAxMDAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjM2EyYTFhJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzhhMDYwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdQdXNleSAoMTgzOCknLFxuICAgICAgdHJhbnNsYXRvcjogJ0Vkd2FyZCBCb3V2ZXJpZSBQdXNleScsXG4gICAgICB5ZWFyOiAxODM4LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBJTUlUQVRJT05fT0ZfQ0hSSVNUOiBCb29rID0ge1xuICBpZDogJ2ltaXRhdGlvbi1vZi1jaHJpc3QnLFxuICB0aXRsZTogJ1RoZSBJbWl0YXRpb24gb2YgQ2hyaXN0JyxcbiAgYXV0aG9yOiAnVGhvbWFzIFx1MDBFMCBLZW1waXMnLFxuICBkZXNjcmlwdGlvbjogJ1RoZSBtb3N0IHdpZGVseSByZWFkIENocmlzdGlhbiBkZXZvdGlvbmFsIHdvcmsgYWZ0ZXIgdGhlIEJpYmxlLiBJbiAxMTQgc2hvcnQgY2hhcHRlcnMsIFRob21hcyBcdTAwRTAgS2VtcGlzIGNvdW5zZWxzIHRoZSByZWFkZXIgdG93YXJkIGh1bWlsaXR5LCBpbm5lciBwZWFjZSwgYW5kIHRoZSBwcmFjdGljZSBvZiBmb2xsb3dpbmcgQ2hyaXN0IGluIGRhaWx5IGxpZmUuJyxcbiAgeWVhcjogMTQxOCxcbiAgd29yZENvdW50OiA2MDAwMCxcbiAgY292ZXJDb2xvcjogJyMyYTJhM2EnLFxuICBjb3ZlckFjY2VudDogJyNhMGEwYzgnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ0JlbmhhbSAoMTg4NiknLFxuICAgICAgeWVhcjogMTg4NixcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbi8vIEVOQ0hJUklESU9OIHJlbW92ZWQgMjAyNi0wNC0yNy4gVGhlIHJlZ2lzdHJ5IHNsb3Qgd2FzIGxhYmVsZWRcbi8vIFwiQXVndXN0aW5lJ3MgRW5jaGlyaWRpb25cIiBidXQgdGhlIGFjdHVhbCBjb250ZW50IHdhcyBFcGljdGV0dXMnc1xuLy8gRW5jaGlyaWRpb24gKD0gc2FtZSBib29rIGFzIHRoZS1tYW51YWwsIGRpZmZlcmVudCB0cmFuc2xhdGlvbikuXG4vLyBTb3VyY2luZyBwaXBlbGluZSB1c2VkIEd1dGVuYmVyZyAjOTIzMSBmb3IgdGhlIEF1Z3VzdGluZSByYXcgdGV4dCxcbi8vIGJ1dCBQRyM5MjMxIGlzIGFjdHVhbGx5IFwiRWFydGgncyBIb2xvY2F1c3RcIiBieSBIYXd0aG9ybmUgXHUyMDE0IHRoZSB3cm9uZ1xuLy8gSUQuIFRoZSBBdWd1c3RpbmUgYXR0ZW1wdCBmYWlsZWQgc2lsZW50bHk7IEVwaWN0ZXR1cyBjb250ZW50IGVuZGVkXG4vLyB1cCBpbiB0aGUgc2xvdC4gVG8gcmUtYWRkIEF1Z3VzdGluZSdzIHJlYWwgRW5jaGlyaWRpb24sIHNvdXJjZSBmcm9tXG4vLyB0aGUgY29ycmVjdCBHdXRlbmJlcmcgSUQgKE5PVCA5MjMxKSBhbmQgdmFsaWRhdGUgdGhlIFRpdGxlOi9BdXRob3I6XG4vLyBoZWFkZXJzIG1hdGNoIGJlZm9yZSBnZW5lcmF0aW5nIGVkaXRpb25zLlxuXG5leHBvcnQgY29uc3QgSkVSVVNBTEVNOiBCb29rID0ge1xuICBpZDogJ2plcnVzYWxlbScsXG4gIHRpdGxlOiAnSmVydXNhbGVtJyxcbiAgYXV0aG9yOiAnU2VsbWEgTGFnZXJsXHUwMEY2ZicsXG4gIGRlc2NyaXB0aW9uOiAnQSBTd2VkaXNoIGZhcm1pbmcgY29tbXVuaXR5IGlzIHRvcm4gYXBhcnQgd2hlbiBhIGNoYXJpc21hdGljIHByZWFjaGVyIGxlYWRzIGhhbGYgaXRzIHBlb3BsZSBvbiBhIHBpbGdyaW1hZ2UgdG8gdGhlIEhvbHkgTGFuZC4gTGFnZXJsXHUwMEY2ZlxcJ3MgTm9iZWwgUHJpemUtd2lubmluZyBub3ZlbCBvZiBmYWl0aCwgbGFuZCwgYW5kIHRoZSBjb3N0IG9mIGNvbnZpY3Rpb24uJyxcbiAgeWVhcjogMTkwMSxcbiAgd29yZENvdW50OiA5MDAwMCxcbiAgY292ZXJDb2xvcjogJyM0YTNhMmEnLFxuICBjb3ZlckFjY2VudDogJyNjOGI4NzgnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ0hvd2FyZCAoMTkxNSknLFxuICAgICAgdHJhbnNsYXRvcjogJ1ZlbG1hIFN3YW5zdG9uIEhvd2FyZCcsXG4gICAgICB5ZWFyOiAxOTE1LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgLy8gMTggY2hhcHRlcnMgYWdhaW5zdCB0aGUgcmVwYWlyZWQgRW5nbGlzaCBlZGl0aW9ucycgMTcuXG4gICAgICBhbGlnbmVkOiBmYWxzZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBBUE9MT0dZOiBCb29rID0ge1xuICBpZDogJ2Fwb2xvZ3knLFxuICB0aXRsZTogJ0Fwb2xvZ3knLFxuICBhdXRob3I6ICdQbGF0bycsXG4gIGRlc2NyaXB0aW9uOiAnU29jcmF0ZXMgc3RhbmRzIHRyaWFsIGZvciBoaXMgbGlmZSBpbiBBdGhlbnMuIEFjY3VzZWQgb2YgY29ycnVwdGluZyB0aGUgeW91dGggYW5kIGRlbnlpbmcgdGhlIGdvZHMsIGhlIG1vdW50cyBhIGZlYXJsZXNzIGRlZmVuc2UgXHUyMDE0IG5vdCBvZiBoaW1zZWxmLCBidXQgb2YgdGhlIGV4YW1pbmVkIGxpZmUuJyxcbiAgeWVhcjogLTM5OSxcbiAgd29yZENvdW50OiAxNDAwMCxcbiAgY292ZXJDb2xvcjogJyMzYTJmMmYnLFxuICBjb3ZlckFjY2VudDogJyNjNGEzNWEnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ0pvd2V0dCAoMTg3MSknLFxuICAgICAgdHJhbnNsYXRvcjogJ0JlbmphbWluIEpvd2V0dCcsXG4gICAgICB5ZWFyOiAxODcxLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBTWU1QT1NJVU06IEJvb2sgPSB7XG4gIGlkOiAnc3ltcG9zaXVtJyxcbiAgdGl0bGU6ICdTeW1wb3NpdW0nLFxuICBhdXRob3I6ICdQbGF0bycsXG4gIGRlc2NyaXB0aW9uOiAnQXQgYSBkaW5uZXIgcGFydHkgaW4gQXRoZW5zLCBzZXZlbiBtZW4gdGFrZSB0dXJucyBwcmFpc2luZyBMb3ZlLiBGcm9tIEFyaXN0b3BoYW5lc1xcJyBjb21pYyBteXRoIG9mIHNwbGl0IHNvdWxzIHRvIFNvY3JhdGVzXFwnIGFjY291bnQgb2YgRGlvdGltYVxcJ3MgbGFkZGVyIG9mIGJlYXV0eSBcdTIwMTQgdGhlIFdlc3Rlcm4gd29ybGRcXCdzIGZvdW5kaW5nIHRleHQgb24gbG92ZSBhbmQgZGVzaXJlLicsXG4gIHllYXI6IC0zODUsXG4gIHdvcmRDb3VudDogMjMwMDAsXG4gIGNvdmVyQ29sb3I6ICcjNGEyMDQwJyxcbiAgY292ZXJBY2NlbnQ6ICcjZDRhMGIwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdKb3dldHQgKDE4NzEpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdCZW5qYW1pbiBKb3dldHQnLFxuICAgICAgeWVhcjogMTg3MSxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IGZhbHNlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFBIQUVETzogQm9vayA9IHtcbiAgaWQ6ICdwaGFlZG8nLFxuICB0aXRsZTogJ1BoYWVkbycsXG4gIGF1dGhvcjogJ1BsYXRvJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgbGFzdCBob3VycyBvZiBTb2NyYXRlcy4gSW4gcHJpc29uIGF3YWl0aW5nIGV4ZWN1dGlvbiwgaGUgYXJndWVzIGZvciB0aGUgaW1tb3J0YWxpdHkgb2YgdGhlIHNvdWwgXHUyMDE0IG5vdCBmcm9tIGZlYXIsIGJ1dCBmcm9tIHBoaWxvc29waGljYWwgY29udmljdGlvbi4gSGlzIGZyaWVuZHMgd2VlcDsgaGUgZHJpbmtzIHRoZSBoZW1sb2NrIGNhbG1seS4nLFxuICB5ZWFyOiAtMzg1LFxuICB3b3JkQ291bnQ6IDQwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzFlMmEzYScsXG4gIGNvdmVyQWNjZW50OiAnIzhhYjRkNCcsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnSm93ZXR0ICgxODcxKScsXG4gICAgICB0cmFuc2xhdG9yOiAnQmVuamFtaW4gSm93ZXR0JyxcbiAgICAgIHllYXI6IDE4NzEsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBQT0VUSUNTOiBCb29rID0ge1xuICBpZDogJ3BvZXRpY3MnLFxuICB0aXRsZTogJ1BvZXRpY3MnLFxuICBhdXRob3I6ICdBcmlzdG90bGUnLFxuICBkZXNjcmlwdGlvbjogJ1RoZSBlYXJsaWVzdCBzdXJ2aXZpbmcgd29yayBvZiBkcmFtYXRpYyB0aGVvcnkgaW4gV2VzdGVybiBsaXRlcmF0dXJlLiBBcmlzdG90bGUgZGVmaW5lcyB0cmFnZWR5LCBkaXNzZWN0cyBwbG90IGFuZCBjaGFyYWN0ZXIsIGFuZCBleHBsYWlucyB3aHkgYSBzdG9yeSBtb3ZlcyB1cyBcdTIwMTQgbGF5aW5nIHRoZSBmb3VuZGF0aW9uIHRoYXQgZXZlcnkgc3Vic2VxdWVudCB0aGVvcnkgb2YgZHJhbWEsIGZpY3Rpb24sIGFuZCBzdG9yeXRlbGxpbmcgaGFzIGJ1aWx0IG9uLicsXG4gIHllYXI6IC0zMzUsXG4gIHdvcmRDb3VudDogMTgwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWUyNTE2JyxcbiAgY292ZXJBY2NlbnQ6ICcjYThiMDc4JyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdCdXRjaGVyICgxODk1KScsXG4gICAgICB0cmFuc2xhdG9yOiAnUy4gSC4gQnV0Y2hlcicsXG4gICAgICB5ZWFyOiAxODk1LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBDUklUTzogQm9vayA9IHtcbiAgaWQ6ICdjcml0bycsXG4gIHRpdGxlOiAnQ3JpdG8nLFxuICBhdXRob3I6ICdQbGF0bycsXG4gIGRlc2NyaXB0aW9uOiAnU29jcmF0ZXMgaXMgaW4gcHJpc29uIGF3YWl0aW5nIGV4ZWN1dGlvbi4gSGlzIGZyaWVuZCBDcml0byBjb21lcyBhdCBkYXduIHdpdGggYW4gZXNjYXBlIHBsYW4uIFNvY3JhdGVzIHJlZnVzZXMgXHUyMDE0IGFuZCB3YWxrcyBDcml0byB0aHJvdWdoIHRoZSBhcmd1bWVudDoganVzdGljZSBtYXR0ZXJzIG1vcmUgdGhhbiBsaWZlLCBhbmQgYSBjaXRpemVuIGhhcyBhIGNvbnRyYWN0IHdpdGggdGhlIGxhd3Mgb2YgaGlzIGNpdHkuIFRoZSBzaG9ydGVzdCwgbW9zdCBkaXJlY3Qgb2YgUGxhdG9cXCdzIHByaXNvbiBkaWFsb2d1ZXMuJyxcbiAgeWVhcjogLTM5OSxcbiAgd29yZENvdW50OiA3NTAwLFxuICBjb3ZlckNvbG9yOiAnIzFmMmEzYScsXG4gIGNvdmVyQWNjZW50OiAnIzdhYThjNCcsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnSm93ZXR0ICgxODcxKScsXG4gICAgICB0cmFuc2xhdG9yOiAnQmVuamFtaW4gSm93ZXR0JyxcbiAgICAgIHllYXI6IDE4NzEsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFBIQUVEUlVTOiBCb29rID0ge1xuICBpZDogJ3BoYWVkcnVzJyxcbiAgdGl0bGU6ICdQaGFlZHJ1cycsXG4gIGF1dGhvcjogJ1BsYXRvJyxcbiAgZGVzY3JpcHRpb246ICdTb2NyYXRlcyBhbmQgUGhhZWRydXMgd2FsayBvdXRzaWRlIEF0aGVucyB0byBhIHBsYW5lIHRyZWUgYnkgdGhlIElsaXNzdXMsIHdoZXJlIFBoYWVkcnVzIHJlYWRzIGEgc3BlZWNoIGJ5IEx5c2lhcyBhcmd1aW5nIHRoYXQgdGhlIG5vbi1sb3ZlciBzaG91bGQgYmUgcHJlZmVycmVkIHRvIHRoZSBsb3Zlci4gU29jcmF0ZXMgYW5zd2VycyB3aXRoIHR3byBzcGVlY2hlcyBvZiBoaXMgb3duIFx1MjAxNCBhbmQgdGhlIHNlY29uZCwgdGhlIGdyZWF0IFBhbGlub2RlLCB1bmZvbGRzIHRoZSBzb3VsIGFzIGEgd2luZ2VkIGNoYXJpb3RlZXIsIHRoZSBpbW1vcnRhbGl0eSBvZiB0aGUgc291bCwgYW5kIGRpdmluZSBtYWRuZXNzIGFzIHRoZSBzb3VyY2Ugb2YgZXZlcnkgZ3JlYXQgZ29vZC4gVGhlIGRpYWxvZ3VlIGNsb3NlcyB3aXRoIHRoZSBmYW1vdXMgY3JpdGlxdWUgb2Ygd3JpdGluZzogdGhlIG15dGggb2YgVGhldXRoIGFuZCBUaGFtdXMsIGFuZCBTb2NyYXRlc1xcJyB3YXJuaW5nIHRoYXQgdGhlIHdyaXR0ZW4gd29yZCBpcyBhIHJlbWluZGVyLCBub3QgYSB0ZWFjaGVyLicsXG4gIHllYXI6IC0zNzAsXG4gIHdvcmRDb3VudDogMjIwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmEzYTRhJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzRkMGE4JyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdKb3dldHQgKDE4NzEpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdCZW5qYW1pbiBKb3dldHQnLFxuICAgICAgeWVhcjogMTg3MSxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IE1PQllfRElDSzogQm9vayA9IHtcbiAgaWQ6ICdtb2J5LWRpY2snLFxuICB0aXRsZTogJ01vYnkgRGljaycsXG4gIGF1dGhvcjogJ0hlcm1hbiBNZWx2aWxsZScsXG4gIGRlc2NyaXB0aW9uOiAnQ2FsbCBtZSBJc2htYWVsLiBBIHlvdW5nIHNhaWxvciBib2FyZHMgdGhlIHdoYWxpbmcgc2hpcCBQZXF1b2QsIGNhcHRhaW5lZCBieSB0aGUgbW9ub21hbmlhYyBBaGFiLCB3aG8gd2lsbCBodW50IHRoZSBncmVhdCB3aGl0ZSB3aGFsZSB0byB0aGUgZW5kcyBvZiB0aGUgZWFydGggXHUyMDE0IGFuZCBiZXlvbmQgcmVhc29uLicsXG4gIHllYXI6IDE4NTEsXG4gIHdvcmRDb3VudDogMjEwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzFhMmEzZScsXG4gIGNvdmVyQWNjZW50OiAnI2E4YzhkOCcsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnT3JpZ2luYWwgKDE4NTEpJyxcbiAgICAgIHllYXI6IDE4NTEsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBHUkVBVF9FWFBFQ1RBVElPTlM6IEJvb2sgPSB7XG4gIGlkOiAnZ3JlYXQtZXhwZWN0YXRpb25zJyxcbiAgdGl0bGU6ICdHcmVhdCBFeHBlY3RhdGlvbnMnLFxuICBhdXRob3I6ICdDaGFybGVzIERpY2tlbnMnLFxuICBkZXNjcmlwdGlvbjogJ1BpcCwgYW4gb3JwaGFuIGluIHRoZSBLZW50IG1hcnNoZXMsIHJlY2VpdmVzIGEgbXlzdGVyaW91cyBmb3J0dW5lIHRoYXQgdHJhbnNmb3JtcyBoaXMgbGlmZS4gQnV0IGhpcyBncmVhdCBleHBlY3RhdGlvbnMgY2FycnkgYSBwcmljZSBcdTIwMTQgYW5kIHRoZSB0cnV0aCBhYm91dCBoaXMgYmVuZWZhY3RvciB3aWxsIHNoYXR0ZXIgZXZlcnl0aGluZyBoZSBiZWxpZXZlcy4nLFxuICB5ZWFyOiAxODYxLFxuICB3b3JkQ291bnQ6IDE4NTAwMCxcbiAgY292ZXJDb2xvcjogJyMzYTJhMWEnLFxuICBjb3ZlckFjY2VudDogJyNkNGI4OTYnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ09yaWdpbmFsICgxODYxKScsXG4gICAgICB5ZWFyOiAxODYxLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgVEhFX0hJU1RPUklFUzogQm9vayA9IHtcbiAgaWQ6ICd0aGUtaGlzdG9yaWVzJyxcbiAgdGl0bGU6ICdUaGUgSGlzdG9yaWVzJyxcbiAgYXV0aG9yOiAnSGVyb2RvdHVzJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgZmlyc3QgZ3JlYXQgd29yayBvZiBoaXN0b3J5IGluIHRoZSBXZXN0ZXJuIHdvcmxkLiBIZXJvZG90dXMgdHJhdmVscyB0aGUgYW5jaWVudCB3b3JsZCBcdTIwMTQgRWd5cHQsIFBlcnNpYSwgU2N5dGhpYSwgR3JlZWNlIFx1MjAxNCByZWNvcmRpbmcgY3VzdG9tcywgd2FycywgYW5kIHdvbmRlcnMsIGJ1aWxkaW5nIHRvd2FyZCB0aGUgZXBpYyBjbGFzaCBiZXR3ZWVuIEdyZWVjZSBhbmQgUGVyc2lhLicsXG4gIHllYXI6IC00NDAsXG4gIHdvcmRDb3VudDogMjgwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzRhM2EyYScsXG4gIGNvdmVyQWNjZW50OiAnI2M4YTg2MCcsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnTWFjYXVsYXkgKDE4OTApJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdHZW9yZ2UgQ2FtcGJlbGwgTWFjYXVsYXknLFxuICAgICAgeWVhcjogMTg5MCxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IE5JRUxTX0xZSE5FOiBCb29rID0ge1xuICBpZDogJ25pZWxzLWx5aG5lJyxcbiAgdGl0bGU6ICdOaWVscyBMeWhuZScsXG4gIGF1dGhvcjogJ0ouUC4gSmFjb2JzZW4nLFxuICBkZXNjcmlwdGlvbjogJ0EgeW91bmcgRGFuaXNoIGRyZWFtZXIgc2VhcmNoZXMgZm9yIG1lYW5pbmcgdGhyb3VnaCBhcnQsIGxvdmUsIGFuZCBhdGhlaXNtIGluIG5pbmV0ZWVudGgtY2VudHVyeSBEZW5tYXJrLiBKYWNvYnNlblxcJ3MgbWFzdGVycGllY2UgXHUyMDE0IHRoZSBub3ZlbCBSaWxrZSBjYWxsZWQgXCJ0aGUgbW9zdCBpbXBvcnRhbnQgYm9vayBpbiB0aGUgd29ybGQuXCInLFxuICB5ZWFyOiAxODgwLFxuICB3b3JkQ291bnQ6IDY1MDAwLFxuICBjb3ZlckNvbG9yOiAnIzJhM2EyZScsXG4gIGNvdmVyQWNjZW50OiAnI2E4Yjg5YScsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnT3JpZ2luYWwgKDE4ODApJyxcbiAgICAgIHllYXI6IDE4ODAsXG4gICAgICAvLyBEYW5pc2ggcGFyYWdyYXBoaW5nICgxLDE1OSkgZGlmZmVycyBmcm9tIHRoZSBFbmdsaXNoIGVkaXRpb25zICg5MTIpLlxuICAgICAgYWxpZ25lZDogZmFsc2UsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdMYXJzZW4gKDE5MTkpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdIYW5uYSBBc3RydXAgTGFyc2VuJyxcbiAgICAgIHllYXI6IDE5MTksXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICAvLyBEYW5pc2ggcGFyYWdyYXBoaW5nICgxLDE1OSkgZGlmZmVycyBmcm9tIHRoZSBFbmdsaXNoIGVkaXRpb25zICg5MTIpLlxuICAgICAgYWxpZ25lZDogZmFsc2UsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFRIRV9BV0FLRU5JTkc6IEJvb2sgPSB7XG4gIGlkOiAndGhlLWF3YWtlbmluZycsXG4gIHRpdGxlOiAnVGhlIEF3YWtlbmluZycsXG4gIGF1dGhvcjogJ0thdGUgQ2hvcGluJyxcbiAgZGVzY3JpcHRpb246ICdBIHlvdW5nIG1vdGhlciBvbiBhIExvdWlzaWFuYSBpc2xhbmQgYmVnaW5zIHRvIGZlZWwgdGhlIHB1bGwgb2YgdGhlIHNlYSBcdTIwMTQgYW5kIG9mIGEgbGlmZSBlbnRpcmVseSBoZXIgb3duLiBDaG9waW5cXCdzIDE4OTkgbm92ZWwgc2NhbmRhbGl6ZWQgaXRzIHJlYWRlcnMgYW5kIHdhcyBmb3Jnb3R0ZW4gZm9yIGRlY2FkZXMuIEl0IGlzIG5vdyByZWNvZ25pemVkIGFzIG9uZSBvZiB0aGUgZmlyc3QgZ3JlYXQgZmVtaW5pc3Qgbm92ZWxzIGluIEFtZXJpY2FuIGxpdGVyYXR1cmUuJyxcbiAgeWVhcjogMTg5OSxcbiAgd29yZENvdW50OiA0OTAwMCxcbiAgY292ZXJDb2xvcjogJyMwZDIyMzMnLFxuICBjb3ZlckFjY2VudDogJyM2YWFiY2MnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ09yaWdpbmFsICgxODk5KScsXG4gICAgICB5ZWFyOiAxODk5LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBCUk9USEVSU19LQVJBTUFaT1Y6IEJvb2sgPSB7XG4gIGlkOiAnYnJvdGhlcnMta2FyYW1hem92JyxcbiAgdGl0bGU6ICdUaGUgQnJvdGhlcnMgS2FyYW1hem92JyxcbiAgYXV0aG9yOiAnRnlvZG9yIERvc3RvZXZza3knLFxuICBkZXNjcmlwdGlvbjogJ0Rvc3RvZXZza3lcXCdzIGZpbmFsIG5vdmVsOiB0aHJlZSBicm90aGVycyBhbmQgdGhlaXIgZmF0aGVyLCBhIG11cmRlciwgYSB0cmlhbCwgYW5kIHRoZSBkZWVwZXN0IHF1ZXN0aW9ucyBvZiBmYWl0aCwgZG91YnQsIGFuZCBodW1hbiBmcmVlZG9tLiBJbmNsdWRlcyB0aGUgbGVnZW5kYXJ5IHBhcmFibGUgXCJUaGUgR3JhbmQgSW5xdWlzaXRvci5cIicsXG4gIHllYXI6IDE4ODAsXG4gIHdvcmRDb3VudDogMzYwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzVhMWExYScsXG4gIGNvdmVyQWNjZW50OiAnI2Q0YTg0MycsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnR2FybmV0dCAoMTkxMiknLFxuICAgICAgdHJhbnNsYXRvcjogJ0NvbnN0YW5jZSBHYXJuZXR0JyxcbiAgICAgIHllYXI6IDE5MTIsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBOT1RFU19GUk9NX1VOREVSR1JPVU5EOiBCb29rID0ge1xuICBpZDogJ25vdGVzLWZyb20tdW5kZXJncm91bmQnLFxuICB0aXRsZTogJ05vdGVzIGZyb20gVW5kZXJncm91bmQnLFxuICBhdXRob3I6ICdGeW9kb3IgRG9zdG9ldnNreScsXG4gIGRlc2NyaXB0aW9uOiAnVGhlIGZpcnN0IGV4aXN0ZW50aWFsaXN0IG5vdmVsOiBhIGZldmVyaXNoIG1vbm9sb2d1ZSBmcm9tIGEgc2VsZi1hd2FyZSwgc3BpdGVmdWwgbWFuIHdobyBoYXMgcmV0cmVhdGVkIGZyb20gc29jaWV0eSB0byBhdHRhY2sgdGhlIHJhdGlvbmFsaXN0IGZhaXRoIG9mIGhpcyBhZ2UuIERvc3RvZXZza3lcXCdzIGRlY2xhcmF0aW9uIG9mIHdhciBvbiBcInRoZSBDcnlzdGFsIFBhbGFjZVwiIGFuZCB0aGUgc2VlZCBvZiBldmVyeSBub3ZlbCBoZSB3cm90ZSBhZnRlcndhcmQuJyxcbiAgeWVhcjogMTg2NCxcbiAgd29yZENvdW50OiA0NTAwMCxcbiAgY292ZXJDb2xvcjogJyMxYTFhMWEnLFxuICBjb3ZlckFjY2VudDogJyM5YzNhM2EnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ0dhcm5ldHQgKDE5MTgpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdDb25zdGFuY2UgR2FybmV0dCcsXG4gICAgICB5ZWFyOiAxOTE4LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgSUxJQUQ6IEJvb2sgPSB7XG4gIGlkOiAnaWxpYWQnLFxuICB0aXRsZTogJ1RoZSBJbGlhZCcsXG4gIGF1dGhvcjogJ0hvbWVyJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgd3JhdGggb2YgQWNoaWxsZXMgYW5kIHRoZSBmaW5hbCB3ZWVrcyBvZiB0aGUgVHJvamFuIFdhci4gSG9tZXJcXCdzIGZpcnN0IGVwaWMgXHUyMDE0IHJhZ2UsIGZhdGUsIGdvZHMgYXQgd2FyIHdpdGggbWVuLCBhbmQgdGhlIGZ1bmVyYWwgb2YgSGVjdG9yLicsXG4gIHllYXI6IC03NTAsXG4gIHdvcmRDb3VudDogMTUwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzNhMWExYScsXG4gIGNvdmVyQWNjZW50OiAnI2M5YTA0YScsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnQnV0bGVyICgxODk4KScsXG4gICAgICB0cmFuc2xhdG9yOiAnU2FtdWVsIEJ1dGxlcicsXG4gICAgICB5ZWFyOiAxODk4LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgTklDT01BQ0hFQU5fRVRISUNTOiBCb29rID0ge1xuICBpZDogJ25pY29tYWNoZWFuLWV0aGljcycsXG4gIHRpdGxlOiAnTmljb21hY2hlYW4gRXRoaWNzJyxcbiAgYXV0aG9yOiAnQXJpc3RvdGxlJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgZm91bmRhdGlvbmFsIHdvcmsgb2YgdmlydHVlIGV0aGljcy4gQXJpc3RvdGxlIGFza3Mgd2hhdCB0aGUgZ29vZCBsaWZlIGlzIGZvciBhIGh1bWFuIGJlaW5nLCBhbmQgYW5zd2VyczogZmxvdXJpc2hpbmcgKGV1ZGFpbW9uaWEpLCBhY2hpZXZlZCB0aHJvdWdoIHByYWN0aWNhbCB3aXNkb20sIG1vcmFsIHZpcnR1ZSwgYW5kIGNvbnRlbXBsYXRpb24uIFRoZSBnb2xkZW4gbWVhbiwgZnJpZW5kc2hpcCwganVzdGljZSwgYW5kIHRoZSBuYXR1cmUgb2YgaGFwcGluZXNzIFx1MjAxNCB0aGUgdm9jYWJ1bGFyeSBldGhpY3MgaGFzIHVzZWQgZXZlciBzaW5jZS4nLFxuICB5ZWFyOiAtMzUwLFxuICB3b3JkQ291bnQ6IDkyMDAwLFxuICBjb3ZlckNvbG9yOiAnIzJhMmExYScsXG4gIGNvdmVyQWNjZW50OiAnI2I4OWE0YScsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnQ2hhc2UgKDE4NDcpIC8gUm9zcyB0cmFkaXRpb24nLFxuICAgICAgdHJhbnNsYXRvcjogJ0QuUC4gQ2hhc2UnLFxuICAgICAgeWVhcjogMTg0NyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IE9SRVNURUlBOiBCb29rID0ge1xuICBpZDogJ29yZXN0ZWlhJyxcbiAgdGl0bGU6ICdUaGUgT3Jlc3RlaWEnLFxuICBhdXRob3I6ICdBZXNjaHlsdXMnLFxuICBkZXNjcmlwdGlvbjogJ1RoZSBvbmx5IHN1cnZpdmluZyBHcmVlayB0cmlsb2d5LiBBIGtpbmcgcmV0dXJucyBmcm9tIFRyb3kgYW5kIGlzIG11cmRlcmVkIGJ5IGhpcyB3aWZlLiBUaGVpciBzb24gcmV0dXJucyB0byBhdmVuZ2UgaGltIGJ5IGtpbGxpbmcgaGlzIG1vdGhlci4gVGhlIEZ1cmllcyBwdXJzdWUgaGltIHVudGlsIEF0aGVuYSBlc3RhYmxpc2hlcyB0aGUgZmlyc3QgY291cnQgb2YgbGF3IGFuZCBhY3F1aXRzIGhpbS4gQWVzY2h5bHVzIHRyYWNlcyB0aGUgYmlydGggb2YganVzdGljZSBpdHNlbGYgb3V0IG9mIHRoZSBjeWNsZSBvZiBibG9vZCByZXZlbmdlLicsXG4gIHllYXI6IC00NTgsXG4gIHdvcmRDb3VudDogMzQwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmEwYTFhJyxcbiAgY292ZXJBY2NlbnQ6ICcjYTA0MDQwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdNb3JzaGVhZCAoMTg4MSknLFxuICAgICAgdHJhbnNsYXRvcjogJ0UuIEQuIEEuIE1vcnNoZWFkJyxcbiAgICAgIHllYXI6IDE4ODEsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBCQUNDSEFFOiBCb29rID0ge1xuICBpZDogJ2JhY2NoYWUnLFxuICB0aXRsZTogJ1RoZSBCYWNjaGFlJyxcbiAgYXV0aG9yOiAnRXVyaXBpZGVzJyxcbiAgZGVzY3JpcHRpb246ICdEaW9ueXN1cyBjb21lcyB0byBUaGViZXMgaW4gZGlzZ3Vpc2UsIGRlbWFuZGluZyB0aGF0IHRoZSBjaXR5IHdvcnNoaXAgaGltLiBLaW5nIFBlbnRoZXVzIHJlZnVzZXMuIFRoZSBnb2QgZHJpdmVzIHRoZSB3b21lbiBvZiBUaGViZXMgaW50byBlY3N0YXRpYyBmcmVuenkgb24gTW91bnQgQ2l0aGFlcm9uLCBhbmQgUGVudGhldXMsIGZhdGFsbHkgY3VyaW91cywgZ29lcyB1cCB0byBzcHkuIEhpcyBvd24gbW90aGVyLCBpbiB0aGUgZ3JpcCBvZiB0aGUgZ29kLCB0ZWFycyBoaW0gYXBhcnQgd2l0aCBoZXIgYmFyZSBoYW5kcy4gRXVyaXBpZGVzXFwnIGxhc3QgcGxheSBhbmQgdGhlIG1vc3QgZGlzdHVyYmluZyBpbiB0aGUgR3JlZWsgdHJhZ2ljIGNhbm9uLicsXG4gIHllYXI6IC00MDUsXG4gIHdvcmRDb3VudDogMTM1MDAsXG4gIGNvdmVyQ29sb3I6ICcjMWEwZTJhJyxcbiAgY292ZXJBY2NlbnQ6ICcjOWE0YWMwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgLy8gUmVwbGFjZWQgMjAyNi0xMC0wMSAocmlnaHRzKTogQXJ0aHVyIFMuIFdheSwgVGhlIFRyYWdlZGllcyBvZiBFdXJpcGlkZXMgaW4gRW5nbGlzaCBWZXJzZSwgdm9sLiAzXG4gICAgICAvLyAoTWFjbWlsbGFuLCAxODk4KSwgdGV4dCBmcm9tIHRoZSBXaWtpc291cmNlIHRyYW5zY3JpcHRpb24gKENDIEJZLVNBIDQuMCwgV2lraXNvdXJjZSBjb250cmlidXRvcnMpLlxuICAgICAgLy8gV2F5IGRpZWQgMTkzMC4gTW9kZXJuIEVuZ2xpc2ggaXMgYSBUaW5jdCByZW5kZXJpbmcgb2YgdGhpcyB0ZXh0LCBzaGFyZWQgdW5kZXIgdGhlIHNhbWUgbGljZW5jZS5cbiAgICAgIGxhYmVsOiAnV2F5ICgxODk4KScsXG4gICAgICB0cmFuc2xhdG9yOiAnQXJ0aHVyIFMuIFdheScsXG4gICAgICB5ZWFyOiAxODk4LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IE1FREVBOiBCb29rID0ge1xuICBpZDogJ21lZGVhJyxcbiAgdGl0bGU6ICdNZWRlYScsXG4gIGF1dGhvcjogJ0V1cmlwaWRlcycsXG4gIGRlc2NyaXB0aW9uOiAnTWVkZWEgaGFzIGdpdmVuIHVwIGV2ZXJ5dGhpbmcgZm9yIEphc29uIFx1MjAxNCBoZXIgZmF0aGVyLCBoZXIgY291bnRyeSwgaGVyIGJyb3RoZXIgXHUyMDE0IGFuZCBub3cgaGUgaXMgbGVhdmluZyBoZXIgZm9yIGEgcHJpbmNlc3Mgb2YgQ29yaW50aC4gSGVyIHJldmVuZ2Ugd2lsbCBiZSBjYWxpYnJhdGVkIHRvIGRlc3Ryb3kgd2hhdCBoZSBsb3ZlcyBtb3N0LiBUaGUgcGxheSB0aGF0IGdhdmUgdXMgYSBoZXJvaW5lIG1vcmUgdGVycmlmeWluZyB0aGFuIGFueSB2aWxsYWluLicsXG4gIHllYXI6IC00MzEsXG4gIHdvcmRDb3VudDogMTEwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmExYTBhJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzk2YTRhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgLy8gUmVwbGFjZWQgMjAyNi0xMC0wMSAocmlnaHRzKTogQXJ0aHVyIFMuIFdheSwgVGhlIFRyYWdlZGllcyBvZiBFdXJpcGlkZXMgaW4gRW5nbGlzaCBWZXJzZSwgdm9sLiAxXG4gICAgICAvLyAoTWFjbWlsbGFuLCAxODk0KSwgdGV4dCBmcm9tIHRoZSBXaWtpc291cmNlIHRyYW5zY3JpcHRpb24gKENDIEJZLVNBIDQuMCwgV2lraXNvdXJjZSBjb250cmlidXRvcnMpLlxuICAgICAgLy8gV2F5IGRpZWQgMTkzMC4gTW9kZXJuIEVuZ2xpc2ggaXMgYSBUaW5jdCByZW5kZXJpbmcgb2YgdGhpcyB0ZXh0LCBzaGFyZWQgdW5kZXIgdGhlIHNhbWUgbGljZW5jZS5cbiAgICAgIGxhYmVsOiAnV2F5ICgxODk0KScsXG4gICAgICB0cmFuc2xhdG9yOiAnQXJ0aHVyIFMuIFdheScsXG4gICAgICB5ZWFyOiAxODk0LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IENPTU1VTklTVF9NQU5JRkVTVE86IEJvb2sgPSB7XG4gIGlkOiAnY29tbXVuaXN0LW1hbmlmZXN0bycsXG4gIHRpdGxlOiAnVGhlIENvbW11bmlzdCBNYW5pZmVzdG8nLFxuICBhdXRob3I6ICdLYXJsIE1hcnggJiBGcmllZHJpY2ggRW5nZWxzJyxcbiAgZGVzY3JpcHRpb246ICdUd2VsdmUgdGhvdXNhbmQgd29yZHMgd3JpdHRlbiBpbiAxODQ4IHRoYXQgY2hhbmdlZCB0aGUgcG9saXRpY2FsIHZvY2FidWxhcnkgb2YgdGhlIG5leHQgY2VudHVyeS4gVGhlIGJvdXJnZW9pc2llIGhhcyBkaXNzb2x2ZWQgZXZlcnkgb2xkIGNlcnRhaW50eSBpbnRvIHRoZSBjYXNoIG5leHVzOyB0aGUgcHJvbGV0YXJpYXQgd2lsbCBkaXNzb2x2ZSB0aGUgYm91cmdlb2lzaWUuIENsYXNzIHN0cnVnZ2xlLCB3b3JsZCBoaXN0b3J5LCBhbmQgdGhlIGNhbGwgdGhhdCBlbmRzIHRoZSBib29rOiB3b3JrZXJzIG9mIGFsbCBjb3VudHJpZXMsIHVuaXRlLicsXG4gIHllYXI6IDE4NDgsXG4gIHdvcmRDb3VudDogMTIwMDAsXG4gIGNvdmVyQ29sb3I6ICcjM2EwYTBhJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzkzYTNhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdNb29yZSAoMTg4OCknLFxuICAgICAgdHJhbnNsYXRvcjogJ1NhbXVlbCBNb29yZSAoZWRpdGVkIGJ5IEVuZ2VscyknLFxuICAgICAgeWVhcjogMTg4OCxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG5dLFxufVxuXG5leHBvcnQgY29uc3QgU0VDT05EX1RSRUFUSVNFOiBCb29rID0ge1xuICBpZDogJ3NlY29uZC10cmVhdGlzZScsXG4gIHRpdGxlOiAnU2Vjb25kIFRyZWF0aXNlIG9mIEdvdmVybm1lbnQnLFxuICBhdXRob3I6ICdKb2huIExvY2tlJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgYm9vayBNaWxsIGlzIHJlc3BvbmRpbmcgdG8uIExvY2tlIGFyZ3VlcyB0aGF0IGdvdmVybm1lbnQgZXhpc3RzIHRvIHByb3RlY3QgdGhlIG5hdHVyYWwgcmlnaHRzIG9mIGl0cyBjaXRpemVucyBcdTIwMTQgbGlmZSwgbGliZXJ0eSwgcHJvcGVydHkgXHUyMDE0IGFuZCB0aGF0IHdoZW4gaXQgY2Vhc2VzIHRvIGRvIHNvLCB0aGUgcGVvcGxlIG1heSBkaXNzb2x2ZSBpdC4gVGhlIGJsdWVwcmludCBmb3IgdGhlIEFtZXJpY2FuIHJldm9sdXRpb24gYW5kIHRoZSBlbnRpcmUgbGliZXJhbCB0cmFkaXRpb24gdGhhdCBmb2xsb3dlZC4nLFxuICB5ZWFyOiAxNjg5LFxuICB3b3JkQ291bnQ6IDcwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzJhM2EyYScsXG4gIGNvdmVyQWNjZW50OiAnI2EwYzBhMCcsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnT3JpZ2luYWwgKDE2ODkpJyxcbiAgICAgIHllYXI6IDE2ODksXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFNPQ0lBTF9DT05UUkFDVDogQm9vayA9IHtcbiAgaWQ6ICdzb2NpYWwtY29udHJhY3QnLFxuICB0aXRsZTogJ1RoZSBTb2NpYWwgQ29udHJhY3QnLFxuICBhdXRob3I6ICdKZWFuLUphY3F1ZXMgUm91c3NlYXUnLFxuICBkZXNjcmlwdGlvbjogJ01hbiBpcyBib3JuIGZyZWUsIGFuZCBldmVyeXdoZXJlIGhlIGlzIGluIGNoYWlucy4gUm91c3NlYXVcXCdzIHNob3J0LCBkZW5zZSBhcmd1bWVudCBmb3IgdGhlIG9ubHkgbGVnaXRpbWF0ZSBmb3JtIG9mIGF1dGhvcml0eTogYSBjb250cmFjdCBhbW9uZyBlcXVhbHMsIGdvdmVybmVkIGJ5IHRoZSBnZW5lcmFsIHdpbGwuIFRoZSBib29rIHRoZSBGcmVuY2ggUmV2b2x1dGlvbiB0aG91Z2h0IGl0IHdhcyByZWFkaW5nLicsXG4gIHllYXI6IDE3NjIsXG4gIHdvcmRDb3VudDogNTAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWEyYTNhJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzBhMDYwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdDb2xlICgxOTEzKScsXG4gICAgICB0cmFuc2xhdG9yOiAnRy4gRC4gSC4gQ29sZScsXG4gICAgICB5ZWFyOiAxOTEzLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBGQVVTVF9QQVJUXzE6IEJvb2sgPSB7XG4gIGlkOiAnZmF1c3QtcGFydC0xJyxcbiAgdGl0bGU6ICdGYXVzdCwgUGFydCBPbmUnLFxuICBhdXRob3I6ICdKb2hhbm4gV29sZmdhbmcgdm9uIEdvZXRoZScsXG4gIGRlc2NyaXB0aW9uOiAnVGhlIHNjaG9sYXIgd2hvIGhhcyBtYXN0ZXJlZCBldmVyeSBzY2llbmNlIHN0aWxsIGZpbmRzIGhpbXNlbGYgdW5hYmxlIHRvIGxpdmUsIG1ha2VzIGEgcGFjdCB3aXRoIE1lcGhpc3RvcGhlbGVzLCBhbmQgaXMgbGVkIHRocm91Z2ggcGxlYXN1cmUsIFdhbHB1cmdpcy1OaWdodCwgYW5kIHRoZSBkZXN0cnVjdGlvbiBvZiBHcmV0Y2hlbi4gVGhlIGRlZmluaW5nIHdvcmsgb2YgR2VybWFuIGxpdGVyYXR1cmUgXHUyMDE0IGFuZCB0aGUgcGxheSB0aGF0IHRhdWdodCB0aGUgbW9kZXJuIHdvcmxkIGhvdyB0byB0YWxrIGFib3V0IGFtYml0aW9uLCBrbm93bGVkZ2UsIGFuZCBkYW1uYXRpb24uJyxcbiAgeWVhcjogMTgwOCxcbiAgd29yZENvdW50OiAzMDAwMCxcbiAgY292ZXJDb2xvcjogJyMxYTBlMWEnLFxuICBjb3ZlckFjY2VudDogJyNjOTNhM2EnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWRlJyxcbiAgICAgIGxhbmd1YWdlOiAnZGUnLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ0dvZXRoZSAoMTgwOCknLFxuICAgICAgeWVhcjogMTgwOCxcbiAgICAgIC8vIFZlcnNlIHNldCBsaW5lIGJ5IGxpbmU6IDEsMDk1IHBhcmFncmFwaHMgYWdhaW5zdCB0aGUgRW5nbGlzaCBlZGl0aW9ucycgMSwwNjAuXG4gICAgICBhbGlnbmVkOiBmYWxzZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ0JheWFyZCBUYXlsb3IgKDE4NzApJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdCYXlhcmQgVGF5bG9yJyxcbiAgICAgIHllYXI6IDE4NzAsXG4gICAgICAvLyBTYW1lIDI4IGNoYXB0ZXJzIGFuZCAxLDA2MCBwYXJhZ3JhcGhzIGFzIE1vZGVybiBFbmdsaXNoIChUYXlsb3IsIFBHIDE0NTkxKS5cbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICAvLyBCdWlsdCBvbiB0aGUgZWFybGllciBFbmdsaXNoIHRleHQgKDg5NSBwYXJhZ3JhcGhzKSwgbm90IHRoZSBUYXlsb3IgcmVwbGFjZW1lbnQgKDEsMDYwKS5cbiAgICAgIGFsaWduZWQ6IGZhbHNlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEZFQVJfQU5EX1RSRU1CTElORzogQm9vayA9IHtcbiAgaWQ6ICdmZWFyLWFuZC10cmVtYmxpbmcnLFxuICB0aXRsZTogJ0ZlYXIgYW5kIFRyZW1ibGluZycsXG4gIGF1dGhvcjogJ1NcdTAwRjhyZW4gS2llcmtlZ2FhcmQnLFxuICBkZXNjcmlwdGlvbjogJ0Egc2hvcnQsIHNhdmFnZSBib29rIGFib3V0IEFicmFoYW0gXHUyMDE0IHRoZSBmYXRoZXIgb2YgZmFpdGggXHUyMDE0IHdobyBpcyB0b2xkIGJ5IEdvZCB0byBtdXJkZXIgaGlzIHNvbi4gS2llcmtlZ2FhcmQsIHdyaXRpbmcgdW5kZXIgdGhlIG5hbWUgSm9oYW5uZXMgZGUgc2lsZW50aW8sIHJlZnVzZXMgZXZlcnkgY29tZm9ydGFibGUgSGVnZWxpYW4gZXhwbGFuYXRpb24gYW5kIGZvcmNlcyB0aGUgcmVhZGVyIHRvIGZlZWwgd2hhdCBmYWl0aCBhY3R1YWxseSBkZW1hbmRzLiBUaGUgXCJrbmlnaHQgb2YgZmFpdGhcIiBhbmQgdGhlIFwidGVsZW9sb2dpY2FsIHN1c3BlbnNpb24gb2YgdGhlIGV0aGljYWxcIiBiZWdpbiBoZXJlLicsXG4gIHllYXI6IDE4NDMsXG4gIHdvcmRDb3VudDogNDM3MDAsXG4gIGNvdmVyQ29sb3I6ICcjMWExYTI0JyxcbiAgY292ZXJBY2NlbnQ6ICcjYTA4YTRhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdPcmlnaW5hbCAoMTg0MyknLFxuICAgICAgeWVhcjogMTg0MyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdPcmlnaW5hbCAoRW5nbGlzaCknLFxuICAgICAgLy8gTWFjaGluZSB0cmFuc2xhdGlvbiBvbiB0aGUgZWFybGllciAyMzItcGFyYWdyYXBoIHN0cnVjdHVyZTsgdGhlIGFjY2VwdGVkXG4gICAgICAvLyB0ZXh0IGhhcyAxODQgcHJpbnRlZCBwYXJhZ3JhcGhzLiBOZXZlciBhIGRlZmF1bHQgKGVkaXRpb25EZWZhdWx0cykuXG4gICAgICBhbGlnbmVkOiBmYWxzZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnVGluY3QgTW9kZXJuIEVuZ2xpc2ggXHUyMDE0IHRyYW5zbGF0ZWQgZnJvbSBEYW5pc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIC8vIDIzMiBwYXJhZ3JhcGhzIGFnYWluc3QgdGhlIGFjY2VwdGVkIDE4NC5cbiAgICAgIGFsaWduZWQ6IGZhbHNlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFBFTE9QT05ORVNJQU5fV0FSOiBCb29rID0ge1xuICBpZDogJ3BlbG9wb25uZXNpYW4td2FyJyxcbiAgdGl0bGU6ICdIaXN0b3J5IG9mIHRoZSBQZWxvcG9ubmVzaWFuIFdhcicsXG4gIGF1dGhvcjogJ1RodWN5ZGlkZXMnLFxuICBkZXNjcmlwdGlvbjogJ1RoZSBmaXJzdCBncmVhdCB3b3JrIG9mIHBvbGl0aWNhbCBoaXN0b3J5LiBUaHVjeWRpZGVzIHJlcG9ydHMgdGhlIHR3ZW50eS1zZXZlbi15ZWFyIHdhciBiZXR3ZWVuIEF0aGVucyBhbmQgU3BhcnRhIGFzIGhlIHNhdyBpdCBcdTIwMTQgc3BlZWNoZXMsIHBsYWd1ZXMsIGJldHJheWFscywgYW5kIHRoZSBzbG93IGNvcnJ1cHRpb24gb2YgZXZlcnkgdmlydHVlIHVuZGVyIHRoZSBwcmVzc3VyZSBvZiB3YXIuIFBlcmljbGVzXFwnIEZ1bmVyYWwgT3JhdGlvbiwgdGhlIFBsYWd1ZSBvZiBBdGhlbnMsIHRoZSBNZWxpYW4gRGlhbG9ndWUsIHRoZSBTaWNpbGlhbiBFeHBlZGl0aW9uOiB0aGUgZm91bmRhdGlvbnMgb2YgaG93IHRoZSBXZXN0IHRoaW5rcyBhYm91dCBwb3dlci4nLFxuICB5ZWFyOiAtNDAwLFxuICB3b3JkQ291bnQ6IDE1MDAwMCxcbiAgY292ZXJDb2xvcjogJyMxYTJhM2EnLFxuICBjb3ZlckFjY2VudDogJyM5YTZhNGEnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ0NyYXdsZXkgKDE4NzQpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdSaWNoYXJkIENyYXdsZXknLFxuICAgICAgeWVhcjogMTg3NCxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEFSSVNUT1RMRV9QT0xJVElDUzogQm9vayA9IHtcbiAgaWQ6ICdhcmlzdG90bGUtcG9saXRpY3MnLFxuICB0aXRsZTogJ1BvbGl0aWNzJyxcbiAgYXV0aG9yOiAnQXJpc3RvdGxlJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgZm91bmRpbmcgdGV4dCBvZiBwb2xpdGljYWwgc2NpZW5jZS4gQXJpc3RvdGxlIHN1cnZleXMgY29uc3RpdHV0aW9ucywgY2l0aXplbnNoaXAsIGp1c3RpY2UsIHJldm9sdXRpb24sIGFuZCB0aGUgYmVzdCBwb3NzaWJsZSBzdGF0ZSBcdTIwMTQgZHJhd2luZyBvbiAxNTggcmVhbCBjb25zdGl0dXRpb25zIHRvIGFzayB3aGF0IGFycmFuZ2VtZW50IG9mIHBvd2VyIHNlcnZlcyBodW1hbiBmbG91cmlzaGluZy4gU3RpbGwgdGhlIHNoYXJwZXN0IGZyYW1ld29yayBmb3IgdGhpbmtpbmcgYWJvdXQgZGVtb2NyYWN5LCBvbGlnYXJjaHksIHR5cmFubnksIGFuZCB3aHkgc3RhdGVzIHJpc2UgYW5kIGZhbGwuJyxcbiAgeWVhcjogLTMzNSxcbiAgd29yZENvdW50OiA5MDAwMCxcbiAgY292ZXJDb2xvcjogJyMyYTFhMmEnLFxuICBjb3ZlckFjY2VudDogJyM4YTZhOWEnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ0pvd2V0dCAoMTg4NSknLFxuICAgICAgdHJhbnNsYXRvcjogJ0JlbmphbWluIEpvd2V0dCcsXG4gICAgICB5ZWFyOiAxODg1LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgVEhFX1BSSU5DRTogQm9vayA9IHtcbiAgaWQ6ICd0aGUtcHJpbmNlJyxcbiAgdGl0bGU6ICdUaGUgUHJpbmNlJyxcbiAgYXV0aG9yOiAnTmljY29sXHUwMEYyIE1hY2hpYXZlbGxpJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgY29sZGVzdCBjbGVhci1leWVkIGJvb2sgYWJvdXQgcG93ZXIgZXZlciB3cml0dGVuLiBNYWNoaWF2ZWxsaSwgZXhpbGVkIGZyb20gRmxvcmVuY2UsIGRyYWZ0ZWQgYSBtYW51YWwgZm9yIHRoZSBydWxlciB3aG8gd291bGQgdW5pZnkgSXRhbHkgXHUyMDE0IGFuZCBpbiB0aGUgcHJvY2VzcyBpbnZlbnRlZCBtb2Rlcm4gcG9saXRpY2FsIHJlYWxpc20uIEZvcnR1bmUsIHZpcnRcdTAwRjksIHRoZSBmb3ggYW5kIHRoZSBsaW9uLCBhbmQgd2hldGhlciBpdCBpcyBiZXR0ZXIgdG8gYmUgbG92ZWQgb3IgZmVhcmVkLicsXG4gIHllYXI6IDE1MzIsXG4gIHdvcmRDb3VudDogMzIwMDAsXG4gIGNvdmVyQ29sb3I6ICcjM2EyMDE4JyxcbiAgY292ZXJBY2NlbnQ6ICcjYjg4MDRhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1pdCcsXG4gICAgICBsYW5ndWFnZTogJ2l0JyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdJbCBQcmluY2lwZSAoMTUzMiknLFxuICAgICAgeWVhcjogMTUzMixcbiAgICAgIGFsaWduZWQ6IGZhbHNlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnTWFycmlvdHQgKDE5MDgpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdXLksuIE1hcnJpb3R0JyxcbiAgICAgIHllYXI6IDE5MDgsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IENBTkRJREU6IEJvb2sgPSB7XG4gIGlkOiAnY2FuZGlkZScsXG4gIHRpdGxlOiAnQ2FuZGlkZScsXG4gIGF1dGhvcjogJ1ZvbHRhaXJlJyxcbiAgZGVzY3JpcHRpb246ICdWb2x0YWlyZVxcJ3MgYXR0YWNrIG9uIExlaWJuaXppYW4gb3B0aW1pc20uIEEgeW91bmcgbWFuIGlzIHR1dG9yZWQgaW4gdGhlIGJlbGllZiB0aGF0IHRoaXMgaXMgXCJ0aGUgYmVzdCBvZiBhbGwgcG9zc2libGUgd29ybGRzXCIgXHUyMDE0IHRoZW4gdGhlIHdvcmxkIHN5c3RlbWF0aWNhbGx5IGRpc21hbnRsZXMgdGhhdCBiZWxpZWYgdGhyb3VnaCBlYXJ0aHF1YWtlLCB3YXIsIHBsYWd1ZSwgSW5xdWlzaXRpb24sIGFuZCB0aGUgc2xhdmUgdHJhZGUuIEVuZHMgd2l0aCB0aGUgbW9zdCBmYW1vdXMgY2xvc2luZyBsaW5lIGluIHRoZSBFbmxpZ2h0ZW5tZW50OiBcIndlIG11c3QgY3VsdGl2YXRlIG91ciBnYXJkZW4uXCInLFxuICB5ZWFyOiAxNzU5LFxuICB3b3JkQ291bnQ6IDMyMDAwLFxuICBjb3ZlckNvbG9yOiAnIzhiMmMxZScsXG4gIGNvdmVyQWNjZW50OiAnI2Q0YTU3NCcsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnRmxlbWluZyAoMTkwMSknLFxuICAgICAgdHJhbnNsYXRvcjogJ1dpbGxpYW0gRi4gRmxlbWluZycsXG4gICAgICB5ZWFyOiAxOTAxLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBCRU9XVUxGOiBCb29rID0ge1xuICBpZDogJ2Jlb3d1bGYnLFxuICB0aXRsZTogJ0Jlb3d1bGYnLFxuICBhdXRob3I6ICdBbm9ueW1vdXMnLFxuICBkZXNjcmlwdGlvbjogJ1RoZSBvbGRlc3Qgc3Vydml2aW5nIGVwaWMgaW4gRW5nbGlzaC4gQSBHZWF0aXNoIHdhcnJpb3IgY3Jvc3NlcyB0aGUgc2VhIHRvIGZpZ2h0IHRocmVlIG1vbnN0ZXJzIGFjcm9zcyBhIGxpZmV0aW1lIFx1MjAxNCBHcmVuZGVsLCBHcmVuZGVsXFwncyBtb3RoZXIsIGFuZCBhIGRyYWdvbiBcdTIwMTQgaW4gYSBwb2VtIGFib3V0IGNvdXJhZ2UsIGtpbmdzaGlwLCBhbmQgdGhlIGxvbmcgZGVmZWF0IHRoYXQgYWxsIGhlcm9lcyBmYWNlLicsXG4gIHllYXI6IDEwMDAsXG4gIHdvcmRDb3VudDogMjQwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWEyMzMyJyxcbiAgY292ZXJBY2NlbnQ6ICcjYTg5MDYwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdIYWxsICgxODkyKScsXG4gICAgICB0cmFuc2xhdG9yOiAnSi4gTGVzc2xpZSBIYWxsJyxcbiAgICAgIHllYXI6IDE4OTIsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEJFWU9ORF9HT09EX0FORF9FVklMOiBCb29rID0ge1xuICBpZDogJ2JleW9uZC1nb29kLWFuZC1ldmlsJyxcbiAgdGl0bGU6ICdCZXlvbmQgR29vZCBhbmQgRXZpbCcsXG4gIGF1dGhvcjogJ0ZyaWVkcmljaCBOaWV0enNjaGUnLFxuICBkZXNjcmlwdGlvbjogJ05pZXR6c2NoZSBhdCBoaXMgbW9zdCBjb3Jyb3NpdmUgYW5kIG1vc3QgZXhoaWxhcmF0aW5nLiBBIGZyb250YWwgYXR0YWNrIG9uIHRoZSBkb2dtYXMgb2YgcGhpbG9zb3BoZXJzLCB0aGUgcGlldGllcyBvZiBDaHJpc3RpYW5pdHksIGFuZCB0aGUgZGVtb2NyYXRpYyBpbnN0aW5jdCBcdTIwMTQgYW5kIGEgc2tldGNoIG9mIHRoZSBcImZyZWUgc3Bpcml0XCIgd2hvIHdvdWxkIGxpdmUgYmV5b25kIHRoZSBvbGQgbW9yYWwgY2F0ZWdvcmllcy4gTWFzdGVyLW1vcmFsaXR5LCBzbGF2ZS1tb3JhbGl0eSwgdGhlIHdpbGwgdG8gcG93ZXIsIGFuZCB0aGUgcXVlc3Rpb246IHdoYXQgaXMgbm9ibGU/JyxcbiAgeWVhcjogMTg4NixcbiAgd29yZENvdW50OiA2MzAwMCxcbiAgY292ZXJDb2xvcjogJyMxYTFhMWEnLFxuICBjb3ZlckFjY2VudDogJyM4YjVhM2MnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ1ppbW1lcm4gKDE5MDcpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdIZWxlbiBaaW1tZXJuJyxcbiAgICAgIHllYXI6IDE5MDcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEdFTkVBTE9HWV9PRl9NT1JBTFM6IEJvb2sgPSB7XG4gIGlkOiAnZ2VuZWFsb2d5LW9mLW1vcmFscycsXG4gIHRpdGxlOiAnT24gdGhlIEdlbmVhbG9neSBvZiBNb3JhbHMnLFxuICBhdXRob3I6ICdGcmllZHJpY2ggTmlldHpzY2hlJyxcbiAgZGVzY3JpcHRpb246ICdUaHJlZSBlc3NheXMgYXNraW5nIHdoZXJlIG91ciBtb3JhbCBjb25jZXB0cyBhY3R1YWxseSBjYW1lIGZyb20uIE5pZXR6c2NoZSB0cmFjZXMgXCJnb29kLFwiIFwiZXZpbCxcIiBcImd1aWx0LFwiIGFuZCBcImJhZCBjb25zY2llbmNlXCIgYmFjayB0aHJvdWdoIEdyZWVrIGFyaXN0b2NyYXRpYyBjb2RlcywgQ2hyaXN0aWFuIGludmVyc2lvbiwgYW5kIHRoZSBwcmllc3RseSBpbWFnaW5hdGlvbiBcdTIwMTQgYW5kIGZpbmRzLCBiZW5lYXRoIGV2ZXJ5IG1vcmFsIGp1ZGdtZW50LCBhIHdpbGwgdG8gcG93ZXIuJyxcbiAgeWVhcjogMTg4NyxcbiAgd29yZENvdW50OiA2MDAwMCxcbiAgY292ZXJDb2xvcjogJyMxYTFhMWEnLFxuICBjb3ZlckFjY2VudDogJyM5YTRhNGEnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ1NhbXVlbCAoMTkxMyknLFxuICAgICAgdHJhbnNsYXRvcjogJ0hvcmFjZSBCLiBTYW11ZWwnLFxuICAgICAgeWVhcjogMTkxMyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuXSxcbn1cblxuZXhwb3J0IGNvbnN0IERFU0NBUlRFU19NRURJVEFUSU9OUzogQm9vayA9IHtcbiAgaWQ6ICdkZXNjYXJ0ZXMtbWVkaXRhdGlvbnMnLFxuICB0aXRsZTogJ01lZGl0YXRpb25zIG9uIEZpcnN0IFBoaWxvc29waHknLFxuICBhdXRob3I6ICdSZW5cdTAwRTkgRGVzY2FydGVzJyxcbiAgZGVzY3JpcHRpb246ICdTaXggbWVkaXRhdGlvbnMgaW4gd2hpY2ggRGVzY2FydGVzIHJlc29sdmVzIHRvIGRvdWJ0IGV2ZXJ5dGhpbmcgaGUgY2FuIFx1MjAxNCBhbmQgZnJvbSB0aGUgd3JlY2thZ2UgcmV0cmlldmVzIG9uZSBpbmR1Yml0YWJsZSBwb2ludDogdGhlIHRoaW5raW5nIHNlbGYuIEZyb20gdGhpcyBzaW5nbGUgZm9vdGhvbGQgaGUgcmVjb25zdHJ1Y3RzIEdvZCwgdGhlIHdvcmxkLCBhbmQgdGhlIGZvdW5kYXRpb25zIG9mIG1vZGVybiBwaGlsb3NvcGh5LicsXG4gIHllYXI6IDE2NDEsXG4gIHdvcmRDb3VudDogMzAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMGUyMDMwJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzRhODVmJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdWZWl0Y2ggKDE5MDEpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdKb2huIFZlaXRjaCcsXG4gICAgICB5ZWFyOiAxOTAxLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbl0sXG59XG5cbmV4cG9ydCBjb25zdCBPTl9MSUJFUlRZOiBCb29rID0ge1xuICBpZDogJ29uLWxpYmVydHknLFxuICB0aXRsZTogJ09uIExpYmVydHknLFxuICBhdXRob3I6ICdKb2huIFN0dWFydCBNaWxsJyxcbiAgZGVzY3JpcHRpb246ICdNaWxsXFwncyBkZWZlbnNlIG9mIHRoZSBpbmRpdmlkdWFsIGFnYWluc3QgdGhlIHNvY2lhbCB0eXJhbm55IGhlIHNhdyByaXNpbmcgaW4gZGVtb2NyYXRpYyBzb2NpZXRpZXMuIFRoZSBcImhhcm0gcHJpbmNpcGxlLFwiIHRoZSBtYXJrZXRwbGFjZSBvZiBpZGVhcywgYW5kIHRoZSBjYXNlIGZvciBlY2NlbnRyaWNpdHkgYXMgYSBwdWJsaWMgZ29vZCBcdTIwMTQgdGhlIGZvdW5kaW5nIHRleHQgb2YgbW9kZXJuIGxpYmVyYWwgdGhvdWdodC4nLFxuICB5ZWFyOiAxODU5LFxuICB3b3JkQ291bnQ6IDM1MDAwLFxuICBjb3ZlckNvbG9yOiAnIzJhMmEzYScsXG4gIGNvdmVyQWNjZW50OiAnI2MwYzRkMCcsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnT3JpZ2luYWwgKDE4NTkpJyxcbiAgICAgIHllYXI6IDE4NTksXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbl0sXG59XG5cbmV4cG9ydCBjb25zdCBVVElMSVRBUklBTklTTTogQm9vayA9IHtcbiAgaWQ6ICd1dGlsaXRhcmlhbmlzbScsXG4gIHRpdGxlOiAnVXRpbGl0YXJpYW5pc20nLFxuICBhdXRob3I6ICdKb2huIFN0dWFydCBNaWxsJyxcbiAgZGVzY3JpcHRpb246ICdNaWxsXFwncyBkZWZlbnNlIG9mIHRoZSBncmVhdGVzdC1oYXBwaW5lc3MgcHJpbmNpcGxlIGFnYWluc3QgaXRzIGNyaXRpY3MuIFBsZWFzdXJlcyBkaWZmZXIgaW4ga2luZCwgbm90IGp1c3QgYW1vdW50OyBiZXR0ZXIgdG8gYmUgU29jcmF0ZXMgZGlzc2F0aXNmaWVkIHRoYW4gYSBmb29sIHNhdGlzZmllZC4gV2hlcmUgT24gTGliZXJ0eSBkcmV3IHRoZSBwb2xpdGljYWwgbGluZSwgVXRpbGl0YXJpYW5pc20gc3VwcGxpZXMgdGhlIG1vcmFsIHN0YW5kYXJkIGJlaGluZCBpdC4nLFxuICB5ZWFyOiAxODYxLFxuICB3b3JkQ291bnQ6IDMwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzNhMmExZicsXG4gIGNvdmVyQWNjZW50OiAnI2Q0YjA3OCcsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnTWlsbCAoMTg2MyknLFxuICAgICAgeWVhcjogMTg2MyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IE9FRElQVVNfUkVYOiBCb29rID0ge1xuICBpZDogJ29lZGlwdXMtcmV4JyxcbiAgdGl0bGU6ICdPZWRpcHVzIFJleCcsXG4gIGF1dGhvcjogJ1NvcGhvY2xlcycsXG4gIGRlc2NyaXB0aW9uOiAnVGhlIGtpbmcgd2hvIHNvbHZlZCB0aGUgcmlkZGxlIG9mIHRoZSBTcGhpbnggc2F2ZXMgaGlzIGNpdHkgZnJvbSBwbGFndWUgXHUyMDE0IGJ5IGRpc2NvdmVyaW5nIHRoYXQgdGhlIHBvbGx1dGVyIGlzIGhpbXNlbGYuIFNvcGhvY2xlc1xcJyBhcmNoZXR5cGFsIHRyYWdlZHkgb2YgZmF0ZSwga25vd2xlZGdlLCBhbmQgdGhlIHdpbGwgdG8gc2VlIHdoYXQgdGhlIGdvZHMgaGF2ZSBmb3JiaWRkZW4uJyxcbiAgeWVhcjogLTQyOSxcbiAgd29yZENvdW50OiAxNzAwMCxcbiAgY292ZXJDb2xvcjogJyMyYTFhMTInLFxuICBjb3ZlckFjY2VudDogJyNjOWEwNGEnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ1N0b3JyICgxOTEyKScsXG4gICAgICB0cmFuc2xhdG9yOiAnRnJhbmNpcyBTdG9ycicsXG4gICAgICB5ZWFyOiAxOTEyLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgT0VESVBVU19BVF9DT0xPTlVTOiBCb29rID0ge1xuICBpZDogJ29lZGlwdXMtYXQtY29sb251cycsXG4gIHRpdGxlOiAnT2VkaXB1cyBhdCBDb2xvbnVzJyxcbiAgYXV0aG9yOiAnU29waG9jbGVzJyxcbiAgZGVzY3JpcHRpb246ICdPbGQsIGJsaW5kLCBhbmQgZXhpbGVkLCBPZWRpcHVzIGFycml2ZXMgYXQgYSBncm92ZSBvdXRzaWRlIEF0aGVucyBzZWVraW5nIHRoZSBkZWF0aCB0aGUgZ29kcyBoYXZlIHByZXBhcmVkIGZvciBoaW0uIFNvcGhvY2xlc1xcJyBmaW5hbCBwbGF5LCB3cml0dGVuIGF0IG5pbmV0eSwgaXMgYSBtZWRpdGF0aW9uIG9uIHN1ZmZlcmluZywgcmVjb25jaWxpYXRpb24sIGFuZCB0aGUgaGVyb1xcJ3Mgc3RyYW5nZSBibGVzc2luZyBvbiB0aGUgbGFuZCB0aGF0IHJlY2VpdmVzIGhpbS4nLFxuICB5ZWFyOiAtNDA2LFxuICB3b3JkQ291bnQ6IDE5MDAwLFxuICBjb3ZlckNvbG9yOiAnIzFlMmEzYScsXG4gIGNvdmVyQWNjZW50OiAnI2EwODQ1NicsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnU3RvcnIgKDE5MTIpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdGcmFuY2lzIFN0b3JyJyxcbiAgICAgIHllYXI6IDE5MTIsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBBTlRJR09ORTogQm9vayA9IHtcbiAgaWQ6ICdhbnRpZ29uZScsXG4gIHRpdGxlOiAnQW50aWdvbmUnLFxuICBhdXRob3I6ICdTb3Bob2NsZXMnLFxuICBkZXNjcmlwdGlvbjogJ1R3byBicm90aGVycyBoYXZlIGtpbGxlZCBlYWNoIG90aGVyIGZpZ2h0aW5nIGZvciBUaGViZXM7IHRoZSBuZXcgcnVsZXIgZm9yYmlkcyBidXJpYWwgdG8gdGhlIG9uZSB3aG8gYXR0YWNrZWQgdGhlIGNpdHkuIEFudGlnb25lLCBzaXN0ZXIgdG8gYm90aCwgYnVyaWVzIGhpbSBhbnl3YXkuIFNvcGhvY2xlc1xcJyBzdGFya2VzdCBjb25mcm9udGF0aW9uIGJldHdlZW4gdGhlIHVud3JpdHRlbiBsYXdzIG9mIHRoZSBnb2RzIGFuZCB0aGUgcHVibGljIGxhdyBvZiB0aGUgc3RhdGUuJyxcbiAgeWVhcjogLTQ0MSxcbiAgd29yZENvdW50OiAxNDAwMCxcbiAgY292ZXJDb2xvcjogJyMzYTFhMWEnLFxuICBjb3ZlckFjY2VudDogJyNjOWEwNjgnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ1N0b3JyICgxOTEyKScsXG4gICAgICB0cmFuc2xhdG9yOiAnRnJhbmNpcyBTdG9ycicsXG4gICAgICB5ZWFyOiAxOTEyLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBERU1PQ1JBQ1lfSU5fQU1FUklDQTogQm9vayA9IHtcbiAgaWQ6ICdkZW1vY3JhY3ktaW4tYW1lcmljYScsXG4gIHRpdGxlOiAnRGVtb2NyYWN5IGluIEFtZXJpY2EnLFxuICBhdXRob3I6ICdBbGV4aXMgZGUgVG9jcXVldmlsbGUnLFxuICBkZXNjcmlwdGlvbjogJ0EgeW91bmcgRnJlbmNoIGFyaXN0b2NyYXQgdHJhdmVscyB0aGUgVW5pdGVkIFN0YXRlcyBpbiAxODMxIGFuZCByZXR1cm5zIHdpdGggdGhlIGZpcnN0LCBhbmQgc3RpbGwgdGhlIG1vc3QgcGVuZXRyYXRpbmcsIGFuYWx5c2lzIG9mIGRlbW9jcmF0aWMgbGlmZSBcdTIwMTQgaXRzIGVxdWFsaXR5LCBpdHMgcmVzdGxlc3NuZXNzLCBpdHMgc29mdG5lc3MsIGFuZCB0aGUgc3RyYW5nZSBuZXcgdHlyYW5ueSBvZiB0aGUgbWFqb3JpdHkuJyxcbiAgeWVhcjogMTgzNSxcbiAgd29yZENvdW50OiAyNTAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWYzYTVmJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzlhMDRhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdSZWV2ZSAvIEJvd2VuICgxODYyKScsXG4gICAgICB0cmFuc2xhdG9yOiAnSGVucnkgUmVldmUsIHJldmlzZWQgYnkgRnJhbmNpcyBCb3dlbicsXG4gICAgICB5ZWFyOiAxODYyLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IE1BR05BX0NBUlRBOiBCb29rID0ge1xuICBpZDogJ21hZ25hLWNhcnRhJyxcbiAgdGl0bGU6ICdNYWduYSBDYXJ0YScsXG4gIGF1dGhvcjogJ0Fub255bW91cyAoc2VhbGVkIGJ5IEtpbmcgSm9obiknLFxuICBhbHRUaXRsZXM6IFsnVGhlIEdyZWF0IENoYXJ0ZXInLCAnTWFnbmEgQ2FydGEgTGliZXJ0YXR1bSddLFxuICBkZXNjcmlwdGlvbjogJ1RoZSBHcmVhdCBDaGFydGVyIG9mIDEyMTUgXHUyMDE0IHRoZSBkb2N1bWVudCB0aGF0IGJvdW5kIGEga2luZyB0byBsYXcsIHNlYWxlZCBhdCBSdW5ueW1lZGUgYWZ0ZXIgdGhlIGJhcm9ucyByb3NlIGFnYWluc3Qgcm95YWwgYWJzb2x1dGlzbS4gSXRzIGljb25pYyBDbGF1c2UgMzkgKFwiTm8gZnJlZW1hbiBzaGFsbCBiZSB0YWtlblx1MjAyNlwiKSBpcyB0aGUgc2VlZCBvZiBkdWUgcHJvY2VzcywgaGFiZWFzIGNvcnB1cywgYW5kIHRoZSBydWxlIG9mIGxhdyBpbiB0aGUgRW5nbGlzaC1zcGVha2luZyB3b3JsZC4nLFxuICB5ZWFyOiAxMjE1LFxuICB3b3JkQ291bnQ6IDUwMDAsXG4gIGNvdmVyQ29sb3I6ICcjM2EyZDFmJyxcbiAgY292ZXJBY2NlbnQ6ICcjYTg3ODM4JyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgLy8gUmVwbGFjZWQgMjAyNi0xMC0wMSAocmlnaHRzKTogVy4gUy4gTWNLZWNobmllLCBNYWduYSBDYXJ0YTogQSBDb21tZW50YXJ5IG9uIHRoZSBHcmVhdCBDaGFydGVyIG9mXG4gICAgICAvLyBLaW5nIEpvaG4sIDJuZCBlZC4gKEdsYXNnb3c6IE1hY0xlaG9zZSwgMTkxNCksIEVuZ2xpc2ggY2hhcnRlciB0ZXh0IGFzIHB1Ymxpc2hlZCBieSBMaWJlcnR5IEZ1bmRcbiAgICAgIC8vIChPbmxpbmUgTGlicmFyeSBvZiBMaWJlcnR5KS4gTWNLZWNobmllIGRpZWQgMTkzMC4gTW9kZXJuIEVuZ2xpc2ggaXMgYSBUaW5jdCByZW5kZXJpbmcgb2YgdGhpcyB0ZXh0LlxuICAgICAgbGFiZWw6ICdNY0tlY2huaWUgKDE5MTQpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdXaWxsaWFtIFNoYXJwIE1jS2VjaG5pZScsXG4gICAgICB5ZWFyOiAxOTE0LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbl0sXG59XG5cbmV4cG9ydCBjb25zdCBVU19GT1VORElOR19ET0NVTUVOVFM6IEJvb2sgPSB7XG4gIGlkOiAndXMtZm91bmRpbmctZG9jdW1lbnRzJyxcbiAgdGl0bGU6ICdUaGUgVVMgRm91bmRpbmcgRG9jdW1lbnRzJyxcbiAgYXV0aG9yOiAnVmFyaW91cyAoSmVmZmVyc29uLCBNYWRpc29uLCBldCBhbC4pJyxcbiAgYWx0VGl0bGVzOiBbJ0RlY2xhcmF0aW9uIG9mIEluZGVwZW5kZW5jZScsICdDb25zdGl0dXRpb24gb2YgdGhlIFVuaXRlZCBTdGF0ZXMnLCAnQmlsbCBvZiBSaWdodHMnXSxcbiAgZGVzY3JpcHRpb246ICdUaGUgZm91ciB0ZXh0cyB0aGF0IGJ1aWx0IHRoZSBBbWVyaWNhbiBSZXB1YmxpYzogdGhlIERlY2xhcmF0aW9uIG9mIEluZGVwZW5kZW5jZSAoMTc3NiksIHRoZSBDb25zdGl0dXRpb24gKDE3ODcpLCB0aGUgQmlsbCBvZiBSaWdodHMgKDE3OTEpLCBhbmQgZXZlcnkgQW1lbmRtZW50IHNpbmNlLiBUb2dldGhlciB0aGV5IGRlZmluZSBob3cgYSBjb250aW5lbnRhbCBkZW1vY3JhY3kgd2FzIGltYWdpbmVkLCBjb2RpZmllZCwgYW5kIHRoZW4gZXhwYW5kZWQgdG8gaW5jbHVkZSB0aG9zZSBpdCBvbmNlIGV4Y2x1ZGVkLicsXG4gIHllYXI6IDE3NzYsXG4gIHdvcmRDb3VudDogMjIwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWYyYTNhJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzA0MzJhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdPcmlnaW5hbCAoMTc3Nlx1MjAxMzE5OTIpJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEZFREVSQUxJU1RfUEFQRVJTOiBCb29rID0ge1xuICBpZDogJ2ZlZGVyYWxpc3QtcGFwZXJzJyxcbiAgdGl0bGU6ICdUaGUgRmVkZXJhbGlzdCBQYXBlcnMnLFxuICBhdXRob3I6ICdIYW1pbHRvbiwgTWFkaXNvbiwgSmF5IChhcyBcIlB1YmxpdXNcIiknLFxuICBkZXNjcmlwdGlvbjogJ0VpZ2h0eS1maXZlIG5ld3NwYXBlciBlc3NheXMgd3JpdHRlbiBieSBIYW1pbHRvbiwgTWFkaXNvbiwgYW5kIEpheSBpbiAxNzg3LTg4IHRvIGRlZmVuZCB0aGUgcHJvcG9zZWQgQ29uc3RpdHV0aW9uLiBUaGUgbW9zdCBpbmZsdWVudGlhbCB3b3JrIG9mIHBvbGl0aWNhbCB0aGVvcnkgaW4gQW1lcmljYW4gaGlzdG9yeSBcdTIwMTQgaW5jbHVkaW5nIE1hZGlzb25cXCdzIGNlbGVicmF0ZWQgXCJmYWN0aW9uc1wiIHBhcGVyIChOby4gMTApLCB0aGUgXCJpZiBtZW4gd2VyZSBhbmdlbHNcIiBhcmd1bWVudCBmb3IgY2hlY2tzIGFuZCBiYWxhbmNlcyAoTm8uIDUxKSwgYW5kIEhhbWlsdG9uXFwncyBjYXNlIGZvciBqdWRpY2lhbCByZXZpZXcgKE5vLiA3OCkuJyxcbiAgeWVhcjogMTc4OCxcbiAgd29yZENvdW50OiAxNzUwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmExZjNhJyxcbiAgY292ZXJBY2NlbnQ6ICcjZDRhODQzJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdPcmlnaW5hbCAoMTc4OCknLFxuICAgICAgeWVhcjogMTc4OCxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEFfTElUVExFX1BSSU5DRVNTOiBCb29rID0ge1xuICBpZDogJ2EtbGl0dGxlLXByaW5jZXNzJyxcbiAgdGl0bGU6ICdBIExpdHRsZSBQcmluY2VzcycsXG4gIGF1dGhvcjogJ0ZyYW5jZXMgSG9kZ3NvbiBCdXJuZXR0JyxcbiAgZGVzY3JpcHRpb246ICdTYXJhIENyZXdlLCB0aGUgZG90ZWQtb24gZGF1Z2h0ZXIgb2YgYW4gRW5nbGlzaCBjYXB0YWluIGluIEluZGlhLCBpcyBwbGFjZWQgYXQgTWlzcyBNaW5jaGluXFwncyBTZWxlY3QgU2VtaW5hcnkgaW4gTG9uZG9uLiBPbiBoZXIgZWxldmVudGggYmlydGhkYXkgaGVyIGZhdGhlciBkaWVzIGFuZCBoaXMgZm9ydHVuZSBjb2xsYXBzZXM7IHNoZSBpcyBtb3ZlZCB0byBhIGZyZWV6aW5nIGF0dGljIGFuZCB3b3JrZWQgYXMgYW4gdW5wYWlkIGRydWRnZS4gVGhlIGJvb2sgaXMgdGhlIHN0b3J5IG9mIHdoYXQgc3Vydml2ZXMgaW4gYSBwZXJzb24gd2hlbiBzdGF0dXMsIG1vbmV5LCBhbmQgcHJvdGVjdGlvbiBhcmUgc3RyaXBwZWQgYXdheSBpbiBhIHNpbmdsZSBhZnRlcm5vb24gXHUyMDE0IGFuZCBvZiB0aGUgbWFuIHdobyBoYXMgYmVlbiBzZWFyY2hpbmcgTG9uZG9uIGZvciBoZXIsIGxpdmluZyBuZXh0IGRvb3IuJyxcbiAgeWVhcjogMTkwNSxcbiAgd29yZENvdW50OiA2NjAwMCxcbiAgY292ZXJDb2xvcjogJyMzZDJhM2EnLFxuICBjb3ZlckFjY2VudDogJyNkNGE4NzInLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ09yaWdpbmFsICgxOTA1KScsXG4gICAgICB5ZWFyOiAxOTA1LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogZmFsc2UsIC8vIFRleHQgb25seTogRGFuaXNoIG5hcnJhdGlvbiBpcyBkaXNhYmxlZC5cbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgVEhFX0pVTkdMRV9CT09LOiBCb29rID0ge1xuICBpZDogJ2p1bmdsZS1ib29rJyxcbiAgdGl0bGU6ICdUaGUgSnVuZ2xlIEJvb2snLFxuICBhdXRob3I6ICdSdWR5YXJkIEtpcGxpbmcnLFxuICBkZXNjcmlwdGlvbjogJ1NldmVuIHN0b3JpZXMgZnJvbSB0aGUgSW5kaWFuIGp1bmdsZSBcdTIwMTQgTW93Z2xpIHJhaXNlZCBieSB3b2x2ZXMsIFJpa2tpLVRpa2tpLVRhdmkgdGhlIG1vbmdvb3NlLCB0aGUgV2hpdGUgU2VhbCwgVG9vbWFpIG9mIHRoZSBFbGVwaGFudHMuIEtpcGxpbmdcXCdzIG1hc3RlcnBpZWNlIG9mIGFuaW1hbCBmYWJsZSBhbmQgbW9yYWwgYWR2ZW50dXJlLCB3aGljaCBpbnZlbnRlZCB0aGUgbW9kZXJuIGNvbWluZy1vZi1hZ2Ugc3RvcnkgYW5kIHNoYXBlZCBob3cgdGhlIHdvcmxkIGltYWdpbmVzIHRoZSB3aWxkLicsXG4gIHllYXI6IDE4OTQsXG4gIHdvcmRDb3VudDogNTUwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWEyYTBlJyxcbiAgY292ZXJBY2NlbnQ6ICcjNmI4ZjNhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdLaXBsaW5nICgxODk0KScsXG4gICAgICB5ZWFyOiAxODk0LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogZmFsc2UsIC8vIFRleHQgb25seTogRGFuaXNoIG5hcnJhdGlvbiBpcyBkaXNhYmxlZC5cbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgQVJPVU5EX1RIRV9XT1JMRF9JTl84MF9EQVlTOiBCb29rID0ge1xuICBpZDogJ2Fyb3VuZC10aGUtd29ybGQtODAtZGF5cycsXG4gIHRpdGxlOiAnQXJvdW5kIHRoZSBXb3JsZCBpbiBFaWdodHkgRGF5cycsXG4gIGF1dGhvcjogJ0p1bGVzIFZlcm5lJyxcbiAgZGVzY3JpcHRpb246ICdQaGlsZWFzIEZvZ2csIHRoZSBtb3N0IHByZWNpc2UgbWFuIGluIExvbmRvbiwgYmV0cyBoaXMgZm9ydHVuZSB0aGF0IGhlIGNhbiBjaXJjbGUgdGhlIGdsb2JlIGluIGVpZ2h0eSBkYXlzLiBGcm9tIExvbmRvbiB0byBCb21iYXkgdG8gWW9rb2hhbWEgdG8gTmV3IFlvcmsgXHUyMDE0IGEgcmFjZSBhZ2FpbnN0IHRpbWUsIGEgZGV0ZWN0aXZlIG9uIGhpcyBoZWVscywgYW5kIGEgcmVzY3VlIGFsb25nIHRoZSB3YXkuIFZlcm5lXFwncyBncmVhdCBjb21lZHkgb2YgRW5nbGlzaCBwaGxlZ20gYWdhaW5zdCB0aGUgY2hhb3Mgb2YgdGhlIHdvcmxkLicsXG4gIHllYXI6IDE4NzIsXG4gIHdvcmRDb3VudDogNjUwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMGUxYTJhJyxcbiAgY292ZXJBY2NlbnQ6ICcjM2E2YjhmJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdHZW9yZ2UgVG93bGUgKDE4NzMpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdHZW9yZ2UgVG93bGUnLFxuICAgICAgeWVhcjogMTg3MyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IGZhbHNlLCAvLyBUZXh0IG9ubHk6IERhbmlzaCBuYXJyYXRpb24gaXMgZGlzYWJsZWQuXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IFdBTERFTjogQm9vayA9IHtcbiAgaWQ6ICd3YWxkZW4nLFxuICB0aXRsZTogJ1dhbGRlbicsXG4gIGF1dGhvcjogJ0hlbnJ5IERhdmlkIFRob3JlYXUnLFxuICBkZXNjcmlwdGlvbjogJ0luIDE4NDUgVGhvcmVhdSBidWlsdCBhIGNhYmluIGJ5IFdhbGRlbiBQb25kIGFuZCBzdGF5ZWQgdHdvIHllYXJzIHRvIGZpbmQgb3V0IHdoYXQgbGl2aW5nIGFjdHVhbGx5IHJlcXVpcmVkLiBXYWxkZW4gaXMgdGhlIHJlc3VsdDogYSBzZWFzb24tYnktc2Vhc29uIHJlcG9ydCBvbiBzb2xpdHVkZSwgd29yaywgZm9vZCwgc291bmQsIG5laWdoYm9ycywgYW5kIHRoZSBwcmljZSBvZiBhIGxpZmUuIFRoZSBmb3VuZGluZyB0ZXh0IG9mIEFtZXJpY2FuIHNpbXBsaWNpdHksIHdyaXR0ZW4gd2l0aCBhIHNoYXJwZXIgZWRnZSB0aGFuIGl0cyByZXB1dGF0aW9uIHN1Z2dlc3RzLicsXG4gIHllYXI6IDE4NTQsXG4gIHdvcmRDb3VudDogMTE1MDAwLFxuICBjb3ZlckNvbG9yOiAnIzFiMmExZicsXG4gIGNvdmVyQWNjZW50OiAnIzdhOGM1YScsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnVGhvcmVhdSAoMTg1NCknLFxuICAgICAgeWVhcjogMTg1NCxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgSEVBUlRfT0ZfREFSS05FU1M6IEJvb2sgPSB7XG4gIGlkOiAnaGVhcnQtb2YtZGFya25lc3MnLFxuICB0aXRsZTogJ0hlYXJ0IG9mIERhcmtuZXNzJyxcbiAgYXV0aG9yOiAnSm9zZXBoIENvbnJhZCcsXG4gIGRlc2NyaXB0aW9uOiAnTWFybG93IHNpdHMgb24gYSB5YXdsIG9uIHRoZSBUaGFtZXMgYW5kIHRlbGxzIHRoZSBzdG9yeSBvZiBoaXMgam91cm5leSB1cCB0aGUgQ29uZ28gUml2ZXIgdG8gcmV0cmlldmUgYSBjb21wYW55IGFnZW50IG5hbWVkIEt1cnR6IHdobyBoYXMgZ29uZSBkZWVwIGludG8gdGhlIGludGVyaW9yIGFuZCBzdG9wcGVkIHNlbmRpbmcgd29yZC4gVGhlIGh1bmRyZWQtcGFnZSBub3ZlbGxhIHRoYXQgZm91bmRlZCBtb2Rlcm4gZmljdGlvbiBcdTIwMTQgYW5kIHRoZSB3b3JrIHRoZSBjb2xvbmlhbCBwcm9qZWN0IG5ldmVyIHJlY292ZXJlZCBmcm9tLicsXG4gIHllYXI6IDE4OTksXG4gIHdvcmRDb3VudDogMzgwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWExNDEwJyxcbiAgY292ZXJBY2NlbnQ6ICcjOGE2MDM1JyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7XG4gICAgICBrZXk6ICdvcmlnaW5hbC1lbicsXG4gICAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICAgIHN0eWxlOiAnb3JpZ2luYWwnLFxuICAgICAgbGFiZWw6ICdDb25yYWQgKDE4OTkpJyxcbiAgICAgIHllYXI6IDE4OTksXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybiBFbmdsaXNoJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ21vZGVybi1kYScsXG4gICAgICBsYW5ndWFnZTogJ2RhJyxcbiAgICAgIHN0eWxlOiAnbW9kZXJuJyxcbiAgICAgIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IERJU0NPVVJTRV9PTl9JTkVRVUFMSVRZOiBCb29rID0ge1xuICBpZDogJ2Rpc2NvdXJzZS1vbi1pbmVxdWFsaXR5JyxcbiAgdGl0bGU6ICdEaXNjb3Vyc2Ugb24gdGhlIE9yaWdpbiBvZiBJbmVxdWFsaXR5JyxcbiAgYXV0aG9yOiAnSmVhbi1KYWNxdWVzIFJvdXNzZWF1JyxcbiAgZGVzY3JpcHRpb246ICdSb3Vzc2VhdSBhc2tzIGhvdyBodW1hbiBiZWluZ3MsIHdobyBjYW1lIGludG8gdGhlIHdvcmxkIGVxdWFsLCBlbmRlZCB1cCBzbyByYWRpY2FsbHkgdW5lcXVhbCBcdTIwMTQgYW5kIGFuc3dlcnMgdGhhdCB0aGUgYW5zd2VyIGlzIG5vdCBpbiBuYXR1cmUgYnV0IGluIHByb3BlcnR5LCBjaXZpbGl6YXRpb24sIGFuZCB0aGUgaW5zdGl0dXRpb25zIHdlIGJ1aWx0IHRvIGRlZmVuZCB0aGVtLiBUaGUgYXJndW1lbnQgdGhhdCBzZXQgdXAgVGhlIFNvY2lhbCBDb250cmFjdCBhbmQgcHV0IHRoZSBGcmVuY2ggUmV2b2x1dGlvbiBpbiBtb3Rpb24uJyxcbiAgeWVhcjogMTc1NSxcbiAgd29yZENvdW50OiAzMDAwMCxcbiAgY292ZXJDb2xvcjogJyMxZjJhM2EnLFxuICBjb3ZlckFjY2VudDogJyNhODkwNjAnLFxuICBlZGl0aW9uczogW1xuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWZyJyxcbiAgICAgIGxhbmd1YWdlOiAnZnInLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ09yaWdpbmFsICgxNzU1KScsXG4gICAgICB5ZWFyOiAxNzU1LFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGtleTogJ29yaWdpbmFsLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdvcmlnaW5hbCcsXG4gICAgICBsYWJlbDogJ0NvbGUgKDE5MTMpJyxcbiAgICAgIHRyYW5zbGF0b3I6ICdHLiBELiBILiBDb2xlJyxcbiAgICAgIHllYXI6IDE5MTMsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBrZXk6ICdtb2Rlcm4tZGEnLFxuICAgICAgbGFuZ3VhZ2U6ICdkYScsXG4gICAgICBzdHlsZTogJ21vZGVybicsXG4gICAgICBsYWJlbDogJ01vZGVybmUgRGFuc2snLFxuICAgICAgYWxpZ25lZDogdHJ1ZSxcbiAgICAgIGhhc0F1ZGlvOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBWSU5ESUNBVElPTl9SSUdIVFNfT0ZfV09NQU46IEJvb2sgPSB7XG4gIGlkOiAndmluZGljYXRpb24tcmlnaHRzLW9mLXdvbWFuJyxcbiAgdGl0bGU6ICdBIFZpbmRpY2F0aW9uIG9mIHRoZSBSaWdodHMgb2YgV29tYW4nLFxuICBhdXRob3I6ICdNYXJ5IFdvbGxzdG9uZWNyYWZ0JyxcbiAgZGVzY3JpcHRpb246ICdXcml0dGVuIGluIHNpeCB3ZWVrcyBpbiAxNzkyLCBpbiBmdXJpb3VzIHJlc3BvbnNlIHRvIGEgRnJlbmNoIFJldm9sdXRpb24gdGhhdCBwcm9jbGFpbWVkIHRoZSByaWdodHMgb2YgbWFuIHdoaWxlIGxlYXZpbmcgd29tZW4gb3V0LCBhbmQgdG8gUm91c3NlYXVcXCdzIEVtaWxlLCB3aGljaCB0cmFpbmVkIGdpcmxzIHRvIGJlIG9ybmFtZW50cy4gV29sbHN0b25lY3JhZnQgYXJndWVzIHRoYXQgd29tZW4gYXJlIG5vdCBsZXNzZXIgYmVpbmdzIGRlc2lnbmVkIGZvciBjaGFybSBhbmQgc3VibWlzc2lvbiBidXQgcmF0aW9uYWwgY3JlYXR1cmVzIHdob3NlIG1pbmRzIGhhdmUgYmVlbiBkZWxpYmVyYXRlbHkgc3R1bnRlZCBieSBiYWQgZWR1Y2F0aW9uLiBUaGUgZm91bmRpbmcgdGV4dCBvZiBmZW1pbmlzdCBwb2xpdGljYWwgcGhpbG9zb3BoeS4nLFxuICB5ZWFyOiAxNzkyLFxuICB3b3JkQ291bnQ6IDg0MDAwLFxuICBjb3ZlckNvbG9yOiAnIzNhMmE0YScsXG4gIGNvdmVyQWNjZW50OiAnI2M4OWE1YycsXG4gIGVkaXRpb25zOiBbXG4gICAge1xuICAgICAga2V5OiAnb3JpZ2luYWwtZW4nLFxuICAgICAgbGFuZ3VhZ2U6ICdlbicsXG4gICAgICBzdHlsZTogJ29yaWdpbmFsJyxcbiAgICAgIGxhYmVsOiAnV29sbHN0b25lY3JhZnQgKDE3OTIpJyxcbiAgICAgIHllYXI6IDE3OTIsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWVuJyxcbiAgICAgIGxhbmd1YWdlOiAnZW4nLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsXG4gICAgICBhbGlnbmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAga2V5OiAnbW9kZXJuLWRhJyxcbiAgICAgIGxhbmd1YWdlOiAnZGEnLFxuICAgICAgc3R5bGU6ICdtb2Rlcm4nLFxuICAgICAgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJyxcbiAgICAgIGFsaWduZWQ6IHRydWUsXG4gICAgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IExFVklBVEhBTjogQm9vayA9IHtcbiAgaWQ6ICdsZXZpYXRoYW4nLFxuICB0aXRsZTogJ0xldmlhdGhhbicsXG4gIGF1dGhvcjogJ1Rob21hcyBIb2JiZXMnLFxuICBkZXNjcmlwdGlvbjogJ0hvYmJlc1xcJ3MgZm91bmRpbmcgd29yayBvZiBwb2xpdGljYWwgcGhpbG9zb3BoeSwgd3JpdHRlbiBpbiB0aGUgc2hhZG93IG9mIGNpdmlsIHdhci4gV2l0aG91dCBhIHNvdmVyZWlnbiB0byBob2xkIG1lbiBpbiBhd2UsIGxpZmUgaW4gdGhlIHN0YXRlIG9mIG5hdHVyZSBpcyBcInNvbGl0YXJ5LCBwb29yLCBuYXN0eSwgYnJ1dGlzaCwgYW5kIHNob3J0LlwiIFRoZSBzb2NpYWwgY29udHJhY3QgXHUyMDE0IHN1cnJlbmRlcmluZyBmcmVlZG9tIHRvIGFuIGFic29sdXRlIHNvdmVyZWlnbiBcdTIwMTQgaXMgdGhlIG9ubHkgZXNjYXBlLiBBIHBpdGlsZXNzIGFuZCBlbmR1cmluZ2x5IGNvbnRyb3ZlcnNpYWwgYXJndW1lbnQgZm9yIG9yZGVyIG92ZXIgbGliZXJ0eS4nLFxuICB5ZWFyOiAxNjUxLFxuICB3b3JkQ291bnQ6IDIwMDAwMCxcbiAgY292ZXJDb2xvcjogJyMxYzFjMmUnLFxuICBjb3ZlckFjY2VudDogJyM4YTliYjUnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnSG9iYmVzICgxNjUxKScsIHllYXI6IDE2NTEsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1kYScsIGxhbmd1YWdlOiAnZGEnLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsIGFsaWduZWQ6IHRydWUgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEpFS1lMTF9BTkRfSFlERTogQm9vayA9IHtcbiAgaWQ6ICdqZWt5bGwtYW5kLWh5ZGUnLFxuICB0aXRsZTogJ1N0cmFuZ2UgQ2FzZSBvZiBEciBKZWt5bGwgYW5kIE1yIEh5ZGUnLFxuICBhdXRob3I6ICdSb2JlcnQgTG91aXMgU3RldmVuc29uJyxcbiAgZGVzY3JpcHRpb246ICdUaGUgbGF3eWVyIFV0dGVyc29uIGludmVzdGlnYXRlcyB0aGUgc3RyYW5nZSBmcmllbmRzaGlwIG9mIGhpcyB1cHJpZ2h0IGNsaWVudCBEciBKZWt5bGwgd2l0aCB0aGUgYnJ1dGlzaCwgaGF0ZWQgTXIgSHlkZSBcdTIwMTQgYW5kIHVuY292ZXJzIHRoZSBleHBlcmltZW50IHRoYXQgZ2F2ZSBFbmdsaXNoIGl0cyBwaHJhc2UgZm9yIHRoZSBkaXZpZGVkIHNlbGYuIEEgc2hvcnQsIHZpY2lvdXMgdGFsZSBvZiByZXNwZWN0YWJpbGl0eSBhbmQgdGhlIGFwcGV0aXRlcyBpdCBjb25jZWFscy4nLFxuICB5ZWFyOiAxODg2LFxuICB3b3JkQ291bnQ6IDI2MDAwLFxuICBjb3ZlckNvbG9yOiAnIzFiMWQyNCcsXG4gIGNvdmVyQWNjZW50OiAnI2E4MzIzMicsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTdGV2ZW5zb24gKDE4ODYpJywgeWVhcjogMTg4NiwgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLFxuICAgICAgaGFzQXVkaW86IHRydWUsXG4gICAgfSxcbiAgICB7IGtleTogJ21vZGVybi1kYScsIGxhbmd1YWdlOiAnZGEnLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuZSBEYW5zaycsIGFsaWduZWQ6IHRydWUsXG4gICAgICBoYXNBdWRpbzogdHJ1ZSxcbiAgICB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgRE9OX1FVSVhPVEU6IEJvb2sgPSB7XG4gIGlkOiAnZG9uLXF1aXhvdGUnLFxuICB0aXRsZTogJ0RvbiBRdWl4b3RlJyxcbiAgYXV0aG9yOiAnTWlndWVsIGRlIENlcnZhbnRlcycsXG4gIGRlc2NyaXB0aW9uOiAnQSBjb3VudHJ5IGdlbnRsZW1hbiByZWFkcyB0b28gbWFueSBib29rcyBvZiBjaGl2YWxyeSBhbmQgcmlkZXMgb3V0IGFzIGEga25pZ2h0LWVycmFudCBvbiBhIHN0YXJ2ZWQgaG9yc2UsIHdpdGggYSBwZWFzYW50IGZvciBhIHNxdWlyZSBhbmQgYSB3aW5kbWlsbCBmb3IgYSBnaWFudC4gVGhlIGZpcnN0IG1vZGVybiBub3ZlbCBcdTIwMTQgYW5kIHRoZSBvbmx5IG9uZSB0aGF0IGhvbGRzIHVwIGFnYWluc3QgZXZlcnl0aGluZyB0aGF0IGNhbWUgYWZ0ZXIuJyxcbiAgeWVhcjogMTYwNSxcbiAgd29yZENvdW50OiA0MzAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmExYTEwJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzA4YTQwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ09ybXNieSAoMTg4NSknLCB0cmFuc2xhdG9yOiAnSm9obiBPcm1zYnknLCB5ZWFyOiAxODg1LCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBFU1NBWVNfTU9OVEFJR05FOiBCb29rID0ge1xuICBpZDogJ2Vzc2F5cy1tb250YWlnbmUnLFxuICB0aXRsZTogJ0Vzc2F5cycsXG4gIGF1dGhvcjogJ01pY2hlbCBkZSBNb250YWlnbmUnLFxuICBkZXNjcmlwdGlvbjogJ0EgRnJlbmNoIG5vYmxlbWFuIHJldGlyZXMgdG8gaGlzIHRvd2VyIGF0IGFnZSAzOCBhbmQgc3RhcnRzIHdyaXRpbmcgYWJvdXQgd2hhdGV2ZXIgaGUgaXMgdGhpbmtpbmcgXHUyMDE0IGhpcyBraWRuZXkgc3RvbmVzLCBoaXMgY2F0LCB3aGF0IG1ha2VzIGEgZ29vZCBkZWF0aCwgd2h5IGhlIHByZWZlcnMgdHJhdmVsIHRvIHN0YXlpbmcgaG9tZS4gVGhlIGJvb2sgdGhhdCBpbnZlbnRlZCB0aGUgcGVyc29uYWwgZXNzYXkgYW5kIHRoZSBmaXJzdCBhdHRlbXB0IGJ5IGEgRXVyb3BlYW4gdG8gd3JpdGUgaGltc2VsZiBvbnRvIHRoZSBwYWdlLicsXG4gIHllYXI6IDE1ODAsXG4gIHdvcmRDb3VudDogMzUwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzJhMjIxOCcsXG4gIGNvdmVyQWNjZW50OiAnI2IwYTA3MCcsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdDb3R0b24vSGF6bGl0dCAoMTg3NyknLCB0cmFuc2xhdG9yOiAnQ2hhcmxlcyBDb3R0b24sIGVkLiBXaWxsaWFtIEhhemxpdHQnLCB5ZWFyOiAxODc3LCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBIVU1FX0VOUVVJUlk6IEJvb2sgPSB7XG4gIGlkOiAnaHVtZS1lbnF1aXJ5JyxcbiAgdGl0bGU6ICdBbiBFbnF1aXJ5IENvbmNlcm5pbmcgSHVtYW4gVW5kZXJzdGFuZGluZycsXG4gIGF1dGhvcjogJ0RhdmlkIEh1bWUnLFxuICBkZXNjcmlwdGlvbjogJ0h1bWVcXCdzIHNob3J0IHJldmlzaW9uIG9mIGhpcyBhYmFuZG9uZWQgVHJlYXRpc2U6IHdoYXQga25vd2xlZGdlIGlzLCB3aHkgaW5kdWN0aW9uIGNhblxcJ3QgYmUganVzdGlmaWVkLCB3aHkgbWlyYWNsZXMgY2FuXFwndCBvdXR3ZWlnaCBvcmRpbmFyeSBldmlkZW5jZSwgd2h5IHRoZSBzZWxmIGlzIGp1c3QgYSBidW5kbGUgb2YgcGVyY2VwdGlvbnMuIFRoZSBjbGVhcmVzdCBzdGF0ZW1lbnQgb2YgZW1waXJpY2lzbSBpbiBFbmdsaXNoLCBhbmQgdGhlIGJvb2sgdGhhdCB3b2tlIEthbnQgZnJvbSBoaXMgXCJkb2dtYXRpYyBzbHVtYmVyLlwiJyxcbiAgeWVhcjogMTc0OCxcbiAgd29yZENvdW50OiA1MDAwMCxcbiAgY292ZXJDb2xvcjogJyMxYTIwMzAnLFxuICBjb3ZlckFjY2VudDogJyNhMGIwYzgnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnSHVtZSAoMTc0OCknLCB5ZWFyOiAxNzQ4LCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBLQU5UX0dST1VORFdPUks6IEJvb2sgPSB7XG4gIGlkOiAna2FudC1ncm91bmR3b3JrJyxcbiAgdGl0bGU6ICdHcm91bmR3b3JrIG9mIHRoZSBNZXRhcGh5c2ljcyBvZiBNb3JhbHMnLFxuICBhdXRob3I6ICdJbW1hbnVlbCBLYW50JyxcbiAgYWx0VGl0bGVzOiBbJ0Z1bmRhbWVudGFsIFByaW5jaXBsZXMgb2YgdGhlIE1ldGFwaHlzaWMgb2YgTW9yYWxzJywgJ0dyb3VuZGluZyBmb3IgdGhlIE1ldGFwaHlzaWNzIG9mIE1vcmFscyddLFxuICBkZXNjcmlwdGlvbjogJ0thbnRcXCdzIHNob3J0ZXN0IGJvb2sgYW5kIHRoZSBlbnRyeS1wb2ludCB0byBoaXMgZXRoaWNzLiBIZSBzZXRzIG91dCB0byBkZXJpdmUgdGhlIG1vcmFsIGxhdyBmcm9tIHB1cmUgcmVhc29uIGFsb25lLCBhcnJpdmVzIGF0IHRoZSBjYXRlZ29yaWNhbCBpbXBlcmF0aXZlIFx1MjAxNCBhY3Qgb25seSBvbiBhIG1heGltIHlvdSBjb3VsZCB3aWxsIGFzIGEgdW5pdmVyc2FsIGxhdyBcdTIwMTQgYW5kIHJlYnVpbGRzIHRoZSBlbnRpcmUgZm91bmRhdGlvbiBvZiBtb2Rlcm4gZXRoaWNhbCBwaGlsb3NvcGh5LicsXG4gIHllYXI6IDE3ODUsXG4gIHdvcmRDb3VudDogMzAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMWExODIwJyxcbiAgY292ZXJBY2NlbnQ6ICcjYTA5MDkwJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ0FiYm90dCAoMTg3OSknLCB0cmFuc2xhdG9yOiAnVGhvbWFzIEtpbmdzbWlsbCBBYmJvdHQnLCB5ZWFyOiAxODc5LCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBXRUFMVEhfT0ZfTkFUSU9OUzogQm9vayA9IHtcbiAgaWQ6ICd3ZWFsdGgtb2YtbmF0aW9ucycsXG4gIHRpdGxlOiAnVGhlIFdlYWx0aCBvZiBOYXRpb25zJyxcbiAgYXV0aG9yOiAnQWRhbSBTbWl0aCcsXG4gIGRlc2NyaXB0aW9uOiAnQSBTY290dGlzaCBtb3JhbCBwaGlsb3NvcGhlciB3cml0ZXMgdGhlIGZvdW5kaW5nIHRleHQgb2YgbW9kZXJuIGVjb25vbWljczogdGhlIGRpdmlzaW9uIG9mIGxhYm9yIGluIHRoZSBwaW4gZmFjdG9yeSwgdGhlIGludmlzaWJsZSBoYW5kIG9mIG1hcmtldHMsIHdoYXQgbWFrZXMgbmF0aW9ucyByaWNoLiBUaGUgYm9vayB0aGF0IHNoYXBlZCB0d28gY2VudHVyaWVzIG9mIHBvbGljeSBhbmQgc3RpbGwgYW5jaG9ycyB0aGUgZGViYXRlLicsXG4gIHllYXI6IDE3NzYsXG4gIHdvcmRDb3VudDogMzUwMDAwLFxuICBjb3ZlckNvbG9yOiAnIzFmMjgyMCcsXG4gIGNvdmVyQWNjZW50OiAnI2M4YjA3MCcsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTbWl0aCAoMTc3NiknLCB5ZWFyOiAxNzc2LCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBXRVJUSEVSOiBCb29rID0ge1xuICBpZDogJ3dlcnRoZXInLFxuICB0aXRsZTogJ1RoZSBTb3Jyb3dzIG9mIFlvdW5nIFdlcnRoZXInLFxuICBhdXRob3I6ICdKb2hhbm4gV29sZmdhbmcgdm9uIEdvZXRoZScsXG4gIGRlc2NyaXB0aW9uOiAnR29ldGhlXFwncyBleHBsb3NpdmUgZWFybHkgbm92ZWwgb2YgZmVlbGluZzogV2VydGhlciBmYWxscyBpbiBsb3ZlIHdpdGggTG90dGUsIHdobyBpcyBwcm9taXNlZCB0byBhbm90aGVyIG1hbiwgYW5kIHR1cm5zIHByaXZhdGUgbG9uZ2luZyBpbnRvIGEgbGl0ZXJhcnkgZXZlbnQgdGhhdCBzd2VwdCBFdXJvcGUuIEEgc2hvcnQsIGRhbmdlcm91cyBib29rIGFib3V0IGRlc2lyZSwgc2VsZi1kcmFtYXRpemF0aW9uLCBhbmQgdGhlIGNvc3Qgb2YgbWFraW5nIGxpZmUgYW5zd2VyIHRvIGVtb3Rpb24uJyxcbiAgeWVhcjogMTc3NCxcbiAgd29yZENvdW50OiA0NTAwMCxcbiAgY292ZXJDb2xvcjogJyMyNTFjMjQnLFxuICBjb3ZlckFjY2VudDogJyNjNzhhNmEnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnQm95bGFuICgxNzc5KScsIHRyYW5zbGF0b3I6ICdSLiBELiBCb3lsYW4nLCB5ZWFyOiAxNzc5LCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlIH0sXG4gIF0sXG59XG5cbmV4cG9ydCBjb25zdCBBTk5BX0tBUkVOSU5BOiBCb29rID0ge1xuICBpZDogJ2FubmEta2FyZW5pbmEnLFxuICB0aXRsZTogJ0FubmEgS2FyZW5pbmEnLFxuICBhdXRob3I6ICdMZW8gVG9sc3RveScsXG4gIGRlc2NyaXB0aW9uOiAnQSBtYXJyaWVkIHdvbWFuIGZhbGxzIGluIGxvdmUgd2l0aCBhIGNhdmFscnkgb2ZmaWNlciBpbiAxODcwcyBSdXNzaWEgYW5kIGVuZHMgdXAgdW5kZXIgYSB0cmFpbi4gQXJvdW5kIHRoYXQgZGlzYXN0ZXIsIFRvbHN0b3kgbGF5cyBvdXQgdGhlIGxpdmVzIG9mIG5pbmUgb3RoZXIgcGVvcGxlIGluIGRldGFpbCBcdTIwMTQgTGV2aW4gYW5kIGhpcyBoYXlmaWVsZHMsIEtpdHR5XFwncyB3ZWRkaW5nLCBTdGl2YVxcJ3MgZXhwZW5zZSBhY2NvdW50cy4gVGhlIG5vdmVsIG1hbnkgc2VyaW91cyByZWFkZXJzIGNhbGwgdGhlIGdyZWF0ZXN0IGV2ZXIgd3JpdHRlbi4nLFxuICB5ZWFyOiAxODc3LFxuICB3b3JkQ291bnQ6IDM1MDAwMCxcbiAgY292ZXJDb2xvcjogJyMxYTFhMjgnLFxuICBjb3ZlckFjY2VudDogJyNiMDk4NzAnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnR2FybmV0dCAoMTkwMSknLCB0cmFuc2xhdG9yOiAnQ29uc3RhbmNlIEdhcm5ldHQnLCB5ZWFyOiAxOTAxLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZGEnLCBsYW5ndWFnZTogJ2RhJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybmUgRGFuc2snLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgRlJFREVSSUNLX0RPVUdMQVNTOiBCb29rID0ge1xuICBpZDogJ2ZyZWRlcmljay1kb3VnbGFzcycsXG4gIHRpdGxlOiAnTmFycmF0aXZlIG9mIHRoZSBMaWZlIG9mIEZyZWRlcmljayBEb3VnbGFzcycsXG4gIGF1dGhvcjogJ0ZyZWRlcmljayBEb3VnbGFzcycsXG4gIGRlc2NyaXB0aW9uOiAnQm9ybiBhIHNsYXZlIGluIE1hcnlsYW5kLCBGcmVkZXJpY2sgRG91Z2xhc3MgdGF1Z2h0IGhpbXNlbGYgdG8gcmVhZCBpbiBzZWNyZXQsIGZvdWdodCBvZmYgdGhlIG1hbiBoaXJlZCB0byBicmVhayBoaW0sIGFuZCBlc2NhcGVkIG5vcnRoIGluIDE4MzguIFRocmVlIHllYXJzIGxhdGVyIGhlIHdyb3RlIHRoaXMgYWNjb3VudCBcdTIwMTQgbmFtaW5nIHRoZSBtYXN0ZXJzLCB0aGUgcGxhbnRhdGlvbnMsIGFuZCB0aGUgZGF0ZXMgXHUyMDE0IHdoaWxlIHN0aWxsIGxlZ2FsbHkgYSBmdWdpdGl2ZS4gVGhlIG1vc3QgaW5mbHVlbnRpYWwgb2YgdGhlIEFtZXJpY2FuIHNsYXZlIG5hcnJhdGl2ZXMuJyxcbiAgeWVhcjogMTg0NSxcbiAgd29yZENvdW50OiAzNjAwMCxcbiAgY292ZXJDb2xvcjogJyMyMDFhMTgnLFxuICBjb3ZlckFjY2VudDogJyNjMDkwNWEnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnRG91Z2xhc3MgKDE4NDUpJywgeWVhcjogMTg0NSwgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWRhJywgbGFuZ3VhZ2U6ICdkYScsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJywgYWxpZ25lZDogdHJ1ZSB9LFxuICBdLFxufVxuXG4vKiogQWxsIGJvb2tzIGluIHRoZSBsaWJyYXJ5ICovXG4vLyBTdGFnZWQgXHUyMDE0IGNvbnRlbnQgcGFja2FnZSBjb21wbGV0ZSAob3JpZ2luYWwtZW4gLyBtb2Rlcm4tZW4gLyBtb2Rlcm4tZGEgYWxsIGFsaWduZWQsXG4vLyBvbmJvYXJkaW5nICsgdGhyZWFkcyBwcmVzZW50KS4gTk9UIGluIEJPT0tTOiBhd2FpdGluZyBLb2tvcm8gRW5nbGlzaCBhdWRpbyArIENvZGV4XG4vLyBmaW5hbCBwdWJsaWNhdGlvbi4gbW9kZXJuLWVuIGdhdGUgUEFTUyAod2VpZ2h0ZWQgMC43MTIsIDAgbGlnaHQvbWVjaGFuaWNhbCkuXG5leHBvcnQgY29uc3QgVFJFQVNVUkVfSVNMQU5EOiBCb29rID0ge1xuICBpZDogJ3RyZWFzdXJlLWlzbGFuZCcsXG4gIHRpdGxlOiAnVHJlYXN1cmUgSXNsYW5kJyxcbiAgYXV0aG9yOiAnUm9iZXJ0IExvdWlzIFN0ZXZlbnNvbicsXG4gIGRlc2NyaXB0aW9uOiAnVGhlIGJvb2sgdGhhdCBmaXhlZCB0aGUgc2hhcGUgb2YgZXZlcnkgcGlyYXRlIHN0b3J5IHNpbmNlIFx1MjAxNCB0aGUgbWFwIG1hcmtlZCB3aXRoIGFuIFgsIHRoZSBibGFjayBzcG90LCB0aGUgb25lLWxlZ2dlZCBzZWEtY29vayB3aXRoIGEgcGFycm90IG9uIGhpcyBzaG91bGRlci4gWW91bmcgSmltIEhhd2tpbnMgc2hpcHMgb3V0IGFmdGVyIGJ1cmllZCBnb2xkIGFuZCBkaXNjb3ZlcnMgdGhhdCB0aGUgbW9zdCBjaGFybWluZyBtYW4gYWJvYXJkIGlzIGFsc28gdGhlIG1vc3QgZGFuZ2Vyb3VzLiBTdGV2ZW5zb25cXCdzIHRhbGUgb2YgTG9uZyBKb2huIFNpbHZlciwgY291cmFnZSwgYW5kIGdyZWVkLicsXG4gIHllYXI6IDE4ODMsXG4gIHdvcmRDb3VudDogNjcwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMTYzMjNmJyxcbiAgY292ZXJBY2NlbnQ6ICcjYzc5YTNlJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ1N0ZXZlbnNvbiAoMTg4MyknLCB5ZWFyOiAxODgzLCBhbGlnbmVkOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWRhJywgbGFuZ3VhZ2U6ICdkYScsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJywgYWxpZ25lZDogdHJ1ZSB9LFxuICBdLFxufVxuXG4vLyBUaGUgMTAwdGggdGl0bGUuIENvbnRlbnQgcGFja2FnZSBjb21wbGV0ZTogb3JpZ2luYWwtcnUgKHJlZmVyZW5jZSkgKyBvcmlnaW5hbC1lblxuLy8gKE1hdWRlIGJhc2VsaW5lKSArIG1vZGVybi1lbiAoZ2F0ZSBQQVNTIDAuNjQxKSArIG1vZGVybi1kYSwgYWxsIGFsaWduZWQ7IG9uYm9hcmRpbmdcbi8vICsgdGhyZWFkcyBwcmVzZW50LiBBZGRlZCB0byBCT09LUyBwZXIgQW5kZXJzJ3MgcmVxdWVzdC4gQXVkaW8gKEtva29ybyBFTikgKyBDb2RleFxuLy8gZGVwbG95IHZlcmlmaWNhdGlvbiBzdGlsbCBwZW5kaW5nIGJlZm9yZSBpdCBpcyB0cnVseSBsaXZlLlxuZXhwb3J0IGNvbnN0IElWQU5fSUxZSUNIOiBCb29rID0ge1xuICBpZDogJ2l2YW4taWx5aWNoJyxcbiAgdGl0bGU6ICdUaGUgRGVhdGggb2YgSXZhbiBJbHlpY2gnLFxuICBhdXRob3I6ICdMZW8gVG9sc3RveScsXG4gIGRlc2NyaXB0aW9uOiAnVG9sc3RveVxcJ3Mgc2hvcnQsIHBpdGlsZXNzIG1hc3RlcnBpZWNlLiBBIHN1Y2Nlc3NmdWwganVkZ2Ugd2hvIGhhcyBkb25lIGV2ZXJ5dGhpbmcgcmlnaHQgZmFsbHMgaWxsLCBhbmQgb3ZlciB0aGUgbG9uZyBjb3Vyc2Ugb2YgaGlzIGR5aW5nIGlzIGZvcmNlZCB0byBmYWNlIHRoZSBvbmUgcXVlc3Rpb24gaGUgbmV2ZXIgYXNrZWQ6IHdoZXRoZXIgdGhlIGNvcnJlY3QsIHBsZWFzYW50LCByZXNwZWN0YWJsZSBsaWZlIGhlIGJ1aWx0IHdhcyB0aGUgd3Jvbmcgb25lIGFsbCBhbG9uZy4gVGhlIG1vc3Qgc2VhcmNoaW5nIGFjY291bnQgaW4gZmljdGlvbiBvZiB3aGF0IGl0IGlzIHRvIGRpZSBcdTIwMTQgd2l0aCBhIHBlYXNhbnQgc2VydmFudFxcJ3MgcGxhaW4ga2luZG5lc3MgdGhlIG9ubHkgaG9uZXN0IHRoaW5nIGluIHRoZSByb29tLicsXG4gIHllYXI6IDE4ODYsXG4gIHdvcmRDb3VudDogMjAwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMjYyYTJlJyxcbiAgY292ZXJBY2NlbnQ6ICcjYjA4OTRlJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLXJ1JywgbGFuZ3VhZ2U6ICdydScsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ1x1MDQyMVx1MDQzQ1x1MDQzNVx1MDQ0MFx1MDQ0Mlx1MDQ0QyBcdTA0MThcdTA0MzJcdTA0MzBcdTA0M0RcdTA0MzAgXHUwNDE4XHUwNDNCXHUwNDRDXHUwNDM4XHUwNDQ3XHUwNDMwICgxODg2KScsIHllYXI6IDE4ODYsIGFsaWduZWQ6IGZhbHNlIH0sXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdNYXVkZScsIHRyYW5zbGF0b3I6ICdMb3Vpc2UgJiBBeWxtZXIgTWF1ZGUnLCBhbGlnbmVkOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWRhJywgbGFuZ3VhZ2U6ICdkYScsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJywgYWxpZ25lZDogdHJ1ZSB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgVE9fVEhFX0xJR0hUSE9VU0U6IEJvb2sgPSB7XG4gIGlkOiAndG8tdGhlLWxpZ2h0aG91c2UnLFxuICB0aXRsZTogJ1RvIHRoZSBMaWdodGhvdXNlJyxcbiAgYXV0aG9yOiAnVmlyZ2luaWEgV29vbGYnLFxuICBkZXNjcmlwdGlvbjogJ0Egc3VtbWVyIGhvdXNlIG9uIHRoZSBJc2xlIG9mIFNreWUsIGEgYm95IHdobyB3YW50cyB0byBzYWlsIHRvIHRoZSBMaWdodGhvdXNlIHRvbW9ycm93LCBhbmQgYSBwYWludGVyIHRyeWluZyB0byBmaW5pc2ggb25lIHBpY3R1cmUuIFdvb2xmIGZvbGxvd3MgdGhlIFJhbXNheSBmYW1pbHkgYW5kIHRoZWlyIGd1ZXN0cyBmcm9tIG1pbmQgdG8gbWluZCBhY3Jvc3Mgb25lIGV2ZW5pbmcsIHRlbiBzaWxlbnQgeWVhcnMsIGFuZCBhIGZpbmFsIG1vcm5pbmcgXHUyMDE0IGhlciBwb3J0cmFpdCBvZiBoZXIgb3duIHBhcmVudHMsIGFuZCBvZiB0aW1lIGl0c2VsZi4nLFxuICB5ZWFyOiAxOTI3LFxuICB3b3JkQ291bnQ6IDY5MDAwLFxuICBjb3ZlckNvbG9yOiAnIzFjMmEzMycsXG4gIGNvdmVyQWNjZW50OiAnI2M5YTQ1YycsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdXb29sZiAoMTkyNyknLCB5ZWFyOiAxOTI3LCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm4gRW5nbGlzaCcsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgLy8gVGhlIG9ubHkgRGFuaXNoIGVkaXRpb24gVGluY3Qgb2ZmZXJzIChBbmRlcnMsIDIwMjYtMTAtMTA7IE9GRkVSRURfREFOSVNIX0VESVRJT05TKS5cbiAgICAvLyBUcmFuc2xhdGVkIDE6MSBmcm9tIG1vZGVybi1lbi4gVGV4dCBvbmx5OiBEYW5pc2ggbmFycmF0aW9uIGlzIGRpc2FibGVkLlxuICAgIHsga2V5OiAnbW9kZXJuLWRhJywgbGFuZ3VhZ2U6ICdkYScsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IGZhbHNlIH0sXG4gIF0sXG59XG5cbi8vIEFsaWNlJ3MgQWR2ZW50dXJlcyBpbiBXb25kZXJsYW5kLCBXdXRoZXJpbmcgSGVpZ2h0cyBhbmQgTWlkZGxlbWFyY2guXG4vLyBFbmdsaXNoLW9ubHkgcGFja2FnZXMsIGludGVncmF0ZWQgMjAyNi0wOS0zMCBvblxuLy8gaW50ZWdyYXRpb24vbmV3LWJvb2tzLWFsaWNlLXdoLW1pZGRsZW1hcmNoOyBpbmRlcGVuZGVudGx5IGFjY2VwdGVkIDIwMjYtMTAtMDJcbi8vIChib29rcy93aXAvPGlkPi9yZWxlYXNlL0hBTkRPRkYubWQpIGFuZCBwdWJsaXNoZWQgMjAyNi0xMC0wMyB3aXRoIGNvdmVycyxcbi8vIGNoYXJhY3RlciBjYXJkcywgaW50cm9kdWN0aW9ucyBhbmQgU0VPIHBhZ2VzLlxuLy9cbi8vIEFsaWNlOiB0aGUgb3JpZ2luYWwgaXMgR3V0ZW5iZXJnJ3MgTWlsbGVubml1bSBGdWxjcnVtIEVkaXRpb24gMy4wLCB3aGljaCBrZWVwc1xuLy8gdHdvIHZlcnNlIGNvbnRpbnVhdGlvbnMgZnJvbSBsYXRlciBlZGl0aW9uczsgaXQgaXMgbm90IGEgdHJhbnNjcmlwdGlvbiBvZiB0aGVcbi8vIDE4NjUgZmlyc3QgaW1wcmVzc2lvbi5cbmV4cG9ydCBjb25zdCBBTElDRV9JTl9XT05ERVJMQU5EOiBCb29rID0ge1xuICBpZDogJ2FsaWNlLWluLXdvbmRlcmxhbmQnLFxuICB0aXRsZTogJ0FsaWNlXFwncyBBZHZlbnR1cmVzIGluIFdvbmRlcmxhbmQnLFxuICBhdXRob3I6ICdMZXdpcyBDYXJyb2xsJyxcbiAgZGVzY3JpcHRpb246ICdBbGljZSBmb2xsb3dzIGEgaHVycmllZCByYWJiaXQgZG93biBhIGhvbGUgaW50byBhIHdvcmxkIG9mIHNoaWZ0aW5nIHNpemVzLCBkaXNwdXRlZCBtZWFuaW5ncyBhbmQgaW1wYXRpZW50IHJ1bGVycy4gQ2Fycm9sbFxcJ3MgdHdlbHZlLWNoYXB0ZXIgdGFsZSB0dXJucyBtYW5uZXJzLCBsZXNzb25zLCBhcmd1bWVudHMgYW5kIGNvdXJ0cm9vbSBwcm9jZWR1cmUgaW50byBub25zZW5zZSB0aGF0IGlzIHN0cmljdGVyIHRoYW4gaXQgbG9va3MuJyxcbiAgeWVhcjogMTg2NSxcbiAgd29yZENvdW50OiAyNjAwMCxcbiAgY292ZXJDb2xvcjogJyMxZjNhMmMnLFxuICBjb3ZlckFjY2VudDogJyNkNGIyNWEnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnQ2Fycm9sbCAoT3JpZ2luYWwpJywgeWVhcjogMTg2NSwgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgV1VUSEVSSU5HX0hFSUdIVFM6IEJvb2sgPSB7XG4gIGlkOiAnd3V0aGVyaW5nLWhlaWdodHMnLFxuICB0aXRsZTogJ1d1dGhlcmluZyBIZWlnaHRzJyxcbiAgYXV0aG9yOiAnRW1pbHkgQnJvbnRcdTAwRUInLFxuICBkZXNjcmlwdGlvbjogJ1R3byBZb3Jrc2hpcmUgaG91c2Vob2xkcyBjYXJyeSBhIGNoaWxkaG9vZCBhdHRhY2htZW50LCBhIGZhbWlseSBncmlldmFuY2UgYW5kIGEgc3RydWdnbGUgb3ZlciBwcm9wZXJ0eSBpbnRvIGFub3RoZXIgZ2VuZXJhdGlvbi4gQSB0ZW5hbnRcXCdzIGN1cmlvc2l0eSBhbmQgYSBob3VzZWtlZXBlclxcJ3MgbWVtb3J5IHRlbGwgdGhlIHN0b3J5LCBhbmQgbmVpdGhlciBpcyBhIG5ldXRyYWwgd2l0bmVzcy4nLFxuICB5ZWFyOiAxODQ3LFxuICB3b3JkQ291bnQ6IDExNjAwMCxcbiAgY292ZXJDb2xvcjogJyMyNjI2MmMnLFxuICBjb3ZlckFjY2VudDogJyM5ZmIwYmQnLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnT3JpZ2luYWwgKDE4NDcpJywgeWVhcjogMTg0NywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICBdLFxufVxuXG4vLyBNaWRkbGVtYXJjaCBoYXMgODggcmVhZGluZyB1bml0czogUHJlbHVkZSwgY2hhcHRlcnMgSS1MWFhYVkkgYW5kIEZpbmFsZS4gVGhlXG4vLyBzb3VyY2UgcGFja2FnZSBudW1iZXJlZCB0aGUgUHJlbHVkZSAwIChjaGFwdGVycyAxLTg2LCBGaW5hbGUgODcpLCBidXQgdGhlXG4vLyByZWFkZXIsIHBvc2l0aW9uIHN0b3JlLCBjaGF0IGhpc3RvcnkgYW5kIHdvcmtlciByb3V0ZXMgYWxsIHJlamVjdCBjaGFwdGVyXG4vLyBudW1iZXJzIGJlbG93IDEuIEJvdGggZWRpdGlvbnMsIHRoZSBzaGFyZHMgYW5kIHRoZSBub3RlcyB0aGVyZWZvcmUgbnVtYmVyIHRoZVxuLy8gdW5pdHMgMS04OCBpbiByZWFkaW5nIG9yZGVyOiBQcmVsdWRlID0gMSwgRWxpb3QncyBjaGFwdGVyIE4gPSBOICsgMSxcbi8vIEZpbmFsZSA9IDg4LiBUaXRsZXMga2VlcCBFbGlvdCdzIG93biBsYWJlbHMgKFwiQm9vayBJOiBNaXNzIEJyb29rZSBcdTIwMTQgQ2hhcHRlciBJXCIpLlxuZXhwb3J0IGNvbnN0IE1JRERMRU1BUkNIOiBCb29rID0ge1xuICBpZDogJ21pZGRsZW1hcmNoJyxcbiAgdGl0bGU6ICdNaWRkbGVtYXJjaCcsXG4gIGF1dGhvcjogJ0dlb3JnZSBFbGlvdCcsXG4gIGRlc2NyaXB0aW9uOiAnSW50ZXJ3b3ZlbiBsaXZlcyBpbiBhIHByb3ZpbmNpYWwgdG93biB0ZXN0IHdoYXQgYW1iaXRpb24sIG1hcnJpYWdlIGFuZCBzeW1wYXRoeSBjYW4gbWFrZSBwb3NzaWJsZS4gRWxpb3QgZm9sbG93cyBEb3JvdGhlYSBCcm9va2UsIFRlcnRpdXMgTHlkZ2F0ZSBhbmQgdGhlIGhvdXNlaG9sZHMgYXJvdW5kIHRoZW0gb24gdGhlIGV2ZSBvZiByZWZvcm0uJyxcbiAgeWVhcjogMTg3MSxcbiAgd29yZENvdW50OiAzMTYwMDAsXG4gIGNvdmVyQ29sb3I6ICcjMmIyNjE4JyxcbiAgY292ZXJBY2NlbnQ6ICcjYzVhNDVlJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ09yaWdpbmFsICgxODcxXHUyMDEzNzIpJywgeWVhcjogMTg3MSwgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICBdLFxufVxuXG4vLyBTZW5zZSBhbmQgU2Vuc2liaWxpdHksIGludGVncmF0ZWQgMjAyNi0xMC0wMSBvblxuLy8gaW50ZWdyYXRpb24vbmV3LWJvb2stc2Vuc2UtYW5kLXNlbnNpYmlsaXR5OyBpbmRlcGVuZGVudGx5IGFjY2VwdGVkIDIwMjYtMTAtMDJcbi8vIGFuZCBwdWJsaXNoZWQgMjAyNi0xMC0wMy4gQ2hhcHRlcnMgYXJlIG51bWJlcmVkIDEtNTAgaW4gYm90aCBlZGl0aW9ucy5cbmV4cG9ydCBjb25zdCBTRU5TRV9BTkRfU0VOU0lCSUxJVFk6IEJvb2sgPSB7XG4gIGlkOiAnc2Vuc2UtYW5kLXNlbnNpYmlsaXR5JyxcbiAgdGl0bGU6ICdTZW5zZSBhbmQgU2Vuc2liaWxpdHknLFxuICBhdXRob3I6ICdKYW5lIEF1c3RlbicsXG4gIGRlc2NyaXB0aW9uOiAnVHdvIHNpc3RlcnMgY29uZnJvbnQgbG92ZSwgbW9uZXksIGFuZCB0aGUgbGltaXRzIG9mIHRoZWlyIG93biBqdWRnbWVudCBhZnRlciBsb3NpbmcgdGhlIHNlY3VyaXR5IG9mIHRoZWlyIGZhbWlseSBob21lLicsXG4gIHllYXI6IDE4MTEsXG4gIHdvcmRDb3VudDogMTE4NjM5LFxuICBjb3ZlckNvbG9yOiAnIzI2M2MzOCcsXG4gIGNvdmVyQWNjZW50OiAnI2M2YWQ3YicsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdBdXN0ZW4gKE9yaWdpbmFsKScsIHllYXI6IDE4MTEsIGFsaWduZWQ6IHRydWUsIGhhc0F1ZGlvOiB0cnVlIH0sXG4gICAgeyBrZXk6ICdtb2Rlcm4tZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdtb2Rlcm4nLCBsYWJlbDogJ01vZGVybiBFbmdsaXNoJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgXSxcbn1cblxuLy8gU1RBR0VEIChub3QgaW4gQk9PS1MpOiBUaGUgQWR2ZW50dXJlcyBvZiBTaGVybG9jayBIb2xtZXMsIGludGVncmF0ZWQgMjAyNi0xMC0wMSBvblxuLy8gaW50ZWdyYXRpb24vcmVsZWFzZS1jYW5kaWRhdGUtMy4gVHdlbHZlIHN0b3JpZXMgYXMgZmxhdCBjaGFwdGVycyAxLTEyIGluIGJvdGhcbi8vIGVkaXRpb25zLiBDb3ZlcnMsIGNoYXJhY3RlciBjYXJkcywgU0VPIHBhZ2VzLCBhdWRpbyBhbmQgQW5kZXJzJ3MgYXBwcm92YWwgYXJlIG5vdCBkb25lLlxuZXhwb3J0IGNvbnN0IEFEVkVOVFVSRVNfT0ZfU0hFUkxPQ0tfSE9MTUVTOiBCb29rID0ge1xuICBpZDogJ2FkdmVudHVyZXMtb2Ytc2hlcmxvY2staG9sbWVzJyxcbiAgdGl0bGU6ICdUaGUgQWR2ZW50dXJlcyBvZiBTaGVybG9jayBIb2xtZXMnLFxuICBhdXRob3I6ICdBcnRodXIgQ29uYW4gRG95bGUnLFxuICBkZXNjcmlwdGlvbjogJ1R3ZWx2ZSBjYXNlcyBmcm9tIEJha2VyIFN0cmVldCwgdG9sZCBieSBXYXRzb24sIGluIHdoaWNoIGFuIGFwcGFyZW50bHkgdHJpdmlhbCBkZXRhaWwgdHVybnMgYW4gZW50aXJlIGV4cGxhbmF0aW9uLicsXG4gIHllYXI6IDE4OTIsXG4gIHdvcmRDb3VudDogMTA0MzQ3LFxuICBjb3ZlckNvbG9yOiAnIzJhMmUzOCcsXG4gIGNvdmVyQWNjZW50OiAnI2M5YTQ1YycsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdEb3lsZSAoT3JpZ2luYWwpJywgeWVhcjogMTg5MiwgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICBdLFxufVxuXG4vLyBDb25qZWN0dXJlIEluc3RpdHV0ZSAvIENvbmplY3R1cmUgUHJlc3MgYm9va3MgKHNoZWxmIENyaXRpY2FsIFJhdGlvbmFsaXNtKSxcbi8vIGludGVncmF0ZWQgMjAyNi0xMC0wOCBmcm9tIGJvb2tzL3dpcC9jb25qZWN0dXJlLWJvb2tzLTIwMjYtMTAuIEluIGNvcHlyaWdodCxcbi8vIHB1Ymxpc2hlZCBvbiBUaW5jdCB3aXRoIHRoZSBwdWJsaXNoZXIncyBwZXJtaXNzaW9uIChMb2dhbiBDaGlwa2luLCA4IE9jdCAyMDI2O1xuLy8gcmlnaHRzL3Blcm1pc3Npb24ubWQgaW4gdGhlIHBhY2thZ2UpLiBOZXZlciBsYWJlbCB0aGVtIHB1YmxpYyBkb21haW4uXG4vLyBPbmUgZWRpdGlvbiBlYWNoOiB0aGUgcHVibGlzaGVyJ3MgdGV4dCBhcyBwdWJsaXNoZWQuIFRoZXkgYXJlIGNvbnRlbXBvcmFyeVxuLy8gRW5nbGlzaCwgc28gdGhlcmUgaXMgbm8gTW9kZXJuIEVuZ2xpc2ggZWRpdGlvbiBhbmQgbm9uZSBtYXkgYmUgb2ZmZXJlZFxuLy8gKG5vTW9kZXJuRWRpdGlvbikuIE5vIG5hcnJhdGlvbiB5ZXQgKGhhc0F1ZGlvIGFic2VudCkuIEFjY2xhaW0gaXMgZW1wdHkuXG4vLyBQdWJsaXNoZXJzOiBDb25qZWN0dXJlIEluc3RpdHV0ZSAoQm9sZCBDb25qZWN0dXJlcyBJIHBlciB0aGUgYm9vaydzIG93biBwYWdlO1xuLy8gaXRzIE9QRiBzYXlzIEJyb3duc3RvbmUgSW5zdGl0dXRlKTsgQm9sZCBDb25qZWN0dXJlcyBJSTogQ29uamVjdHVyZSBQcmVzcy5cbmV4cG9ydCBjb25zdCBUSEVfU09WRVJFSUdOX0NISUxEOiBCb29rID0ge1xuICBpZDogJ3RoZS1zb3ZlcmVpZ24tY2hpbGQnLFxuICB0aXRsZTogJ1RoZSBTb3ZlcmVpZ24gQ2hpbGQnLFxuICBhdXRob3I6ICdBYXJvbiBTdHVwcGxlIHdpdGggTG9nYW4gQ2hpcGtpbicsXG4gIGFsdFRpdGxlczogWydUaGUgU292ZXJlaWduIENoaWxkOiBIb3cgYSBGb3Jnb3R0ZW4gUGhpbG9zb3BoeSBDYW4gTGliZXJhdGUgS2lkcyBhbmQgVGhlaXIgUGFyZW50cyddLFxuICBkZXNjcmlwdGlvbjogJ0EgcGh5c2ljaWFuIGFuZCBmYXRoZXIgb2YgZml2ZSBtYWtlcyB0aGUgY2FzZSBmb3IgcmFpc2luZyBjaGlsZHJlbiB3aXRoIG5vIHJ1bGVzLCBncm91bmRlZCBpbiBLYXJsIFBvcHBlclxcJ3MgdGhlb3J5IG9mIGhvdyBrbm93bGVkZ2UgZ3Jvd3MuJyxcbiAgeWVhcjogMjAyNSxcbiAgd29yZENvdW50OiA1NTIxMyxcbiAgY292ZXJDb2xvcjogJyMwMDk5ZDMnLFxuICBjb3ZlckFjY2VudDogJyNmNGQwM2YnLFxuICBub01vZGVybkVkaXRpb246IHRydWUsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdTdHVwcGxlIChPcmlnaW5hbCknLCB5ZWFyOiAyMDI1LCBhbGlnbmVkOiBmYWxzZSB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgTE9SRFNfT0ZfVEhFX0NPU01PUzogQm9vayA9IHtcbiAgaWQ6ICdsb3Jkcy1vZi10aGUtY29zbW9zJyxcbiAgdGl0bGU6ICdMb3JkcyBvZiB0aGUgQ29zbW9zJyxcbiAgYXV0aG9yOiAnQXJqdW4gS2hlbWFuaSBhbmQgTG9nYW4gQ2hpcGtpbicsXG4gIGFsdFRpdGxlczogWydMb3JkcyBvZiB0aGUgQ29zbW9zOiBGcm9tIFN0YXNpcyB0byBTdGFycyddLFxuICBkZXNjcmlwdGlvbjogJ1RoZSBzdG9yeSBvZiB0aGUgdW5pdmVyc2UgYW5kIG9mIGh1bWFuIHByb2dyZXNzLCBmcm9tIGNvc21pYyBzdGFnbmF0aW9uIHRvIHRoZSBFbmxpZ2h0ZW5tZW50IGFuZCBiZXlvbmQsIHRvbGQgdGhyb3VnaCBEYXZpZCBEZXV0c2NoXFwncyBpZGVhcyBhYm91dCBrbm93bGVkZ2UuJyxcbiAgeWVhcjogMjAyNSxcbiAgd29yZENvdW50OiA0NDA5MCxcbiAgY292ZXJDb2xvcjogJyMzOTJkNGInLFxuICBjb3ZlckFjY2VudDogJyNlOWMzYjgnLFxuICBub01vZGVybkVkaXRpb246IHRydWUsXG4gIGVkaXRpb25zOiBbXG4gICAgeyBrZXk6ICdvcmlnaW5hbC1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ29yaWdpbmFsJywgbGFiZWw6ICdLaGVtYW5pICYgQ2hpcGtpbiAoT3JpZ2luYWwpJywgeWVhcjogMjAyNSwgYWxpZ25lZDogZmFsc2UgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEJPTERfQ09OSkVDVFVSRVNfVk9MVU1FXzE6IEJvb2sgPSB7XG4gIGlkOiAnYm9sZC1jb25qZWN0dXJlcy12b2x1bWUtMScsXG4gIHRpdGxlOiAnQm9sZCBDb25qZWN0dXJlcywgVm9sdW1lIEknLFxuICBhdXRob3I6ICdMb2dhbiBDaGlwa2luIChlZC4pJyxcbiAgYWx0VGl0bGVzOiBbJ0JvbGQgQ29uamVjdHVyZXM6IFNlbGVjdCBJbnRlcnZpZXdzIG9mIERhdmlkIERldXRzY2gnXSxcbiAgZGVzY3JpcHRpb246ICdGb3VydGVlbiBpbnRlcnZpZXdzIHdpdGggcGh5c2ljaXN0IGFuZCBwaGlsb3NvcGhlciBEYXZpZCBEZXV0c2NoLCBmcm9tIDIwMTIgdG8gMjAyNCwgb24gcXVhbnR1bSB0aGVvcnksIGtub3dsZWRnZSwgQUksIGZyZWVkb20gYW5kIHByb2dyZXNzLicsXG4gIHllYXI6IDIwMjUsXG4gIHdvcmRDb3VudDogMTQxMTYxLFxuICBjb3ZlckNvbG9yOiAnI2YzZWVlMycsXG4gIGNvdmVyQWNjZW50OiAnIzhiN2IyMicsXG4gIG5vTW9kZXJuRWRpdGlvbjogdHJ1ZSxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ0NoaXBraW4sIGVkLiAoT3JpZ2luYWwpJywgeWVhcjogMjAyNSwgYWxpZ25lZDogZmFsc2UgfSxcbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEJPTERfQ09OSkVDVFVSRVNfVk9MVU1FXzI6IEJvb2sgPSB7XG4gIGlkOiAnYm9sZC1jb25qZWN0dXJlcy12b2x1bWUtMicsXG4gIHRpdGxlOiAnQm9sZCBDb25qZWN0dXJlcywgVm9sdW1lIElJJyxcbiAgYXV0aG9yOiAnTG9nYW4gQ2hpcGtpbiAoZWQuKScsXG4gIGFsdFRpdGxlczogWydCb2xkIENvbmplY3R1cmVzOiBFc3NheXMgQWNyb3NzIFBoeXNpY3MnXSxcbiAgZGVzY3JpcHRpb246ICdUaGlydGVlbiBlc3NheXMgYnkgcGh5c2ljaXN0cyBvbiBncmF2aXR5LCB0aW1lLCBsb2NhbGl0eSwgZW50cm9weSwgcHJvYmFiaWxpdHkgYW5kIHRoZSBtYW55LXdvcmxkcyB2aWV3IG9mIHF1YW50dW0gdGhlb3J5LicsXG4gIHllYXI6IDIwMjYsXG4gIHdvcmRDb3VudDogNzQ2MTEsXG4gIGNvdmVyQ29sb3I6ICcjMGUyYjRiJyxcbiAgY292ZXJBY2NlbnQ6ICcjZjNlMDhhJyxcbiAgbm9Nb2Rlcm5FZGl0aW9uOiB0cnVlLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnQ2hpcGtpbiwgZWQuIChPcmlnaW5hbCknLCB5ZWFyOiAyMDI2LCBhbGlnbmVkOiBmYWxzZSB9LFxuICBdLFxufVxuXG5leHBvcnQgY29uc3QgVEhFX0ZBUlRIRVNUX1JFQUNIRVM6IEJvb2sgPSB7XG4gIGlkOiAndGhlLWZhcnRoZXN0LXJlYWNoZXMnLFxuICB0aXRsZTogJ1RoZSBGYXJ0aGVzdCBSZWFjaGVzJyxcbiAgYXV0aG9yOiAnQnJldHQgSGFsbCcsXG4gIGFsdFRpdGxlczogWydUaGUgRmFydGhlc3QgUmVhY2hlczogV2h5IFBlb3BsZSBBcmUgdGhlIE1vc3QgSW1wb3J0YW50IEVudGl0aWVzIGluIHRoZSBVbml2ZXJzZSddLFxuICBkZXNjcmlwdGlvbjogJ0FuIGFyZ3VtZW50IHRoYXQgcGVvcGxlLCBhcyB1bml2ZXJzYWwgZXhwbGFpbmVycywgYXJlIHRoZSBtb3N0IGltcG9ydGFudCBlbnRpdGllcyBpbiB0aGUgdW5pdmVyc2UsIGFwcGxpZWQgdG8gZWR1Y2F0aW9uLCBJUSwgY3VsdHVyZSwgbWVudGFsIGlsbG5lc3MgYW5kIEFJLicsXG4gIHllYXI6IDIwMjYsXG4gIHdvcmRDb3VudDogMzk5MjQsXG4gIGNvdmVyQ29sb3I6ICcjZjE2OWFiJyxcbiAgY292ZXJBY2NlbnQ6ICcjNjY3NWQ1JyxcbiAgbm9Nb2Rlcm5FZGl0aW9uOiB0cnVlLFxuICBlZGl0aW9uczogW1xuICAgIHsga2V5OiAnb3JpZ2luYWwtZW4nLCBsYW5ndWFnZTogJ2VuJywgc3R5bGU6ICdvcmlnaW5hbCcsIGxhYmVsOiAnSGFsbCAoT3JpZ2luYWwpJywgeWVhcjogMjAyNiwgYWxpZ25lZDogZmFsc2UgfSxcbiAgXSxcbn1cblxuLy8gR3JpbW1zJyBGYWlyeSBUYWxlcyBhbmQgVGhlIEFyYWJpYW4gTmlnaHRzIChMYW5nKSwgaW50ZWdyYXRlZCAyMDI2LTEwLTE5IGZyb20gdGhlXG4vLyBjb250ZW50IHBhY2thZ2VzIGluIGJvb2tzL3dpcC9ncmltbXMtZmFpcnktdGFsZXMgYW5kIGJvb2tzL3dpcC9hcmFiaWFuLW5pZ2h0c1xuLy8gKGJyYW5jaCBjbGF1ZGUvaW5zcGlyaW5nLXJpdGNoaWUtemkwMGZ1LCA2ZjRhYjQyY2YpLiBEYW5pc2ggKG1vZGVybi1kYSkgaXMgYW5cbi8vIG9mZmVyZWQgdGV4dC1vbmx5IGVkaXRpb24gKE9GRkVSRURfREFOSVNIX0VESVRJT05TLCBBbmRlcnMgMjAyNi0xMC0xOSkuIE5vIGNhc3QuIENoYXB0ZXJzXG4vLyBhcmUgbnVtYmVyZWQgMS02NSBhbmQgMS0zNSwgb25lIHJlYWRpbmcgdW5pdCBwZXIgdGFsZSAoTGFuZydzIHByZWZhY2UgaXMgMSkuXG5leHBvcnQgY29uc3QgR1JJTU1TX0ZBSVJZX1RBTEVTOiBCb29rID0ge1xuICBpZDogJ2dyaW1tcy1mYWlyeS10YWxlcycsXG4gIHRpdGxlOiAnR3JpbW1zXFwnIEZhaXJ5IFRhbGVzJyxcbiAgYXV0aG9yOiAnSmFjb2IgYW5kIFdpbGhlbG0gR3JpbW0nLFxuICBhbHRUaXRsZXM6IFsnSG91c2Vob2xkIFRhbGVzJywgJ0NoaWxkcmVuXFwncyBhbmQgSG91c2Vob2xkIFRhbGVzJ10sXG4gIGRlc2NyaXB0aW9uOiAnU2l4dHktZml2ZSB0YWxlcyBvZiBraW5ncywgdGFpbG9ycywgc3RlcG1vdGhlcnMgYW5kIHRhbGtpbmcgYW5pbWFscywgdG9sZCBpbiBwbGFpbiwgcmVwZWF0ZWQgcGF0dGVybnMuJyxcbiAgeWVhcjogMTgxMixcbiAgd29yZENvdW50OiAxMDA0MDEsXG4gIGNvdmVyQ29sb3I6ICcjMmMyMjE5JyxcbiAgY292ZXJBY2NlbnQ6ICcjYzlhNDVjJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ1RheWxvciAmIEVkd2FyZGVzJywgdHJhbnNsYXRvcjogJ0VkZ2FyIFRheWxvciBhbmQgTWFyaWFuIEVkd2FyZGVzJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWRhJywgbGFuZ3VhZ2U6ICdkYScsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IGZhbHNlIH0sIC8vIFRleHQgb25seTogRGFuaXNoIG5hcnJhdGlvbiBpcyBkaXNhYmxlZC5cbiAgXSxcbn1cblxuZXhwb3J0IGNvbnN0IEFSQUJJQU5fTklHSFRTOiBCb29rID0ge1xuICBpZDogJ2FyYWJpYW4tbmlnaHRzJyxcbiAgdGl0bGU6ICdUaGUgQXJhYmlhbiBOaWdodHMgRW50ZXJ0YWlubWVudHMnLFxuICBhdXRob3I6ICdBbmRyZXcgTGFuZycsXG4gIGFsdFRpdGxlczogWydUaGUgQXJhYmlhbiBOaWdodHMnXSxcbiAgZGVzY3JpcHRpb246ICdBIHN1bHRhblxcJ3MgbmlnaHRseSBzdG9yeS1iYXJnYWluIG9wZW5zIHRhbGVzIG9mIGdlbmllcywgc2FpbG9ycywgbWVyY2hhbnRzIGFuZCBhIG1hZ2ljIGxhbXAuJyxcbiAgeWVhcjogMTg5OCxcbiAgd29yZENvdW50OiAxMTEwOTksXG4gIGNvdmVyQ29sb3I6ICcjMWQyNzM4JyxcbiAgY292ZXJBY2NlbnQ6ICcjZDZiMDVhJyxcbiAgZWRpdGlvbnM6IFtcbiAgICB7IGtleTogJ29yaWdpbmFsLWVuJywgbGFuZ3VhZ2U6ICdlbicsIHN0eWxlOiAnb3JpZ2luYWwnLCBsYWJlbDogJ0xhbmcgKDE4OTgpJywgeWVhcjogMTg5OCwgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IHRydWUgfSxcbiAgICB7IGtleTogJ21vZGVybi1lbicsIGxhbmd1YWdlOiAnZW4nLCBzdHlsZTogJ21vZGVybicsIGxhYmVsOiAnTW9kZXJuIEVuZ2xpc2gnLCBhbGlnbmVkOiB0cnVlLCBoYXNBdWRpbzogdHJ1ZSB9LFxuICAgIHsga2V5OiAnbW9kZXJuLWRhJywgbGFuZ3VhZ2U6ICdkYScsIHN0eWxlOiAnbW9kZXJuJywgbGFiZWw6ICdNb2Rlcm5lIERhbnNrJywgYWxpZ25lZDogdHJ1ZSwgaGFzQXVkaW86IGZhbHNlIH0sIC8vIFRleHQgb25seTogRGFuaXNoIG5hcnJhdGlvbiBpcyBkaXNhYmxlZC5cbiAgXSxcbn1cblxuLyoqIFRoZSBmaXZlIENvbmplY3R1cmUgYm9va3MsIGluIHB1YmxpY2F0aW9uIG9yZGVyIChzaGVsZiBDcml0aWNhbCBSYXRpb25hbGlzbSkuICovXG5leHBvcnQgY29uc3QgQ09OSkVDVFVSRV9CT09LUzogQm9va1tdID0gW1RIRV9TT1ZFUkVJR05fQ0hJTEQsIExPUkRTX09GX1RIRV9DT1NNT1MsIEJPTERfQ09OSkVDVFVSRVNfVk9MVU1FXzEsIEJPTERfQ09OSkVDVFVSRVNfVk9MVU1FXzIsIFRIRV9GQVJUSEVTVF9SRUFDSEVTXVxuXG5leHBvcnQgY29uc3QgQk9PS1M6IEJvb2tbXSA9IFtUT19USEVfTElHSFRIT1VTRSwgT0RZU1NFWSwgVUxZU1NFUywgV0FSX0FORF9QRUFDRSwgQklCTEUsIEdJTEdBTUVTSCwgSEFNTEVULCBNQUNCRVRILCBNSURTVU1NRVIsIFJPTUVPX0FORF9KVUxJRVQsIFRIRV9URU1QRVNULCBUSEVfQVJUX09GX1dBUiwgUFJJREVfQU5EX1BSRUpVRElDRSwgQ1JJTUVfQU5EX1BVTklTSE1FTlQsIFRIRV9SRVBVQkxJQywgTUVESVRBVElPTlMsIERJVklORV9DT01FRFksIEpBTkVfRVlSRSwgVEhFX0FFTkVJRCwgUEFSQURJU0VfTE9TVCwgRlJBTktFTlNURUlOLCBUSEVfTUFOVUFMLCBBUE9MT0dZLCBTWU1QT1NJVU0sIFBIQUVETywgQ1JJVE8sIFBIQUVEUlVTLCBQT0VUSUNTLCBNT0JZX0RJQ0ssIEdSRUFUX0VYUEVDVEFUSU9OUywgVEhFX0hJU1RPUklFUywgTklFTFNfTFlITkUsIElNSVRBVElPTl9PRl9DSFJJU1QsIEpFUlVTQUxFTSwgVEhFX0FXQUtFTklORywgQlJPVEhFUlNfS0FSQU1BWk9WLCBJTElBRCwgTklDT01BQ0hFQU5fRVRISUNTLCBUSEVfUFJJTkNFLCBCRVlPTkRfR09PRF9BTkRfRVZJTCwgS0FOVF9HUk9VTkRXT1JLLCBCRU9XVUxGLCBDQU5ESURFLCBERU1PQ1JBQ1lfSU5fQU1FUklDQSwgT0VESVBVU19SRVgsIE9FRElQVVNfQVRfQ09MT05VUywgQU5USUdPTkUsIEdFTkVBTE9HWV9PRl9NT1JBTFMsIERFU0NBUlRFU19NRURJVEFUSU9OUywgT05fTElCRVJUWSwgVVRJTElUQVJJQU5JU00sIFBFTE9QT05ORVNJQU5fV0FSLCBBUklTVE9UTEVfUE9MSVRJQ1MsIExFVklBVEhBTiwgRkVBUl9BTkRfVFJFTUJMSU5HLCBDT01NVU5JU1RfTUFOSUZFU1RPLCBTRUNPTkRfVFJFQVRJU0UsIEhVTUVfRU5RVUlSWSwgU09DSUFMX0NPTlRSQUNULCBXRUFMVEhfT0ZfTkFUSU9OUywgV0VSVEhFUiwgRkFVU1RfUEFSVF8xLCBPUkVTVEVJQSwgQkFDQ0hBRSwgTUVERUEsIENPTkZFU1NJT05TLCBOT1RFU19GUk9NX1VOREVSR1JPVU5ELCBNQUdOQV9DQVJUQSwgVVNfRk9VTkRJTkdfRE9DVU1FTlRTLCBGRURFUkFMSVNUX1BBUEVSUywgRlJFREVSSUNLX0RPVUdMQVNTLCBBX0xJVFRMRV9QUklOQ0VTUywgVEhFX0pVTkdMRV9CT09LLCBBUk9VTkRfVEhFX1dPUkxEX0lOXzgwX0RBWVMsIEhFQVJUX09GX0RBUktORVNTLCBESVNDT1VSU0VfT05fSU5FUVVBTElUWSwgSkVLWUxMX0FORF9IWURFLCBXQUxERU4sIFZJTkRJQ0FUSU9OX1JJR0hUU19PRl9XT01BTiwgQ09NRURZX09GX0VSUk9SUywgTUVSQ0hBTlRfT0ZfVkVOSUNFLCBIRU5SWV9WLCBBU19ZT1VfTElLRV9JVCwgV0lOVEVSU19UQUxFLCBKVUxJVVNfQ0FFU0FSLCBUV0VMRlRIX05JR0hULCBNRUFTVVJFX0ZPUl9NRUFTVVJFLCBIRU5SWV9JVl9QQVJUXzIsIE1FUlJZX1dJVkVTX09GX1dJTkRTT1IsIE9USEVMTE8sIEtJTkdfTEVBUiwgTVVDSF9BRE9fQUJPVVRfTk9USElORywgVEFNSU5HX09GX1RIRV9TSFJFVywgQU5UT05ZX0FORF9DTEVPUEFUUkEsIFJJQ0hBUkRfSUlJLCBDT1JJT0xBTlVTLCBDWU1CRUxJTkUsIEFOTkFfS0FSRU5JTkEsIERPTl9RVUlYT1RFLCBFU1NBWVNfTU9OVEFJR05FLCBJVkFOX0lMWUlDSCwgQUxJQ0VfSU5fV09OREVSTEFORCwgV1VUSEVSSU5HX0hFSUdIVFMsIE1JRERMRU1BUkNILCBTRU5TRV9BTkRfU0VOU0lCSUxJVFksIFRIRV9TT1ZFUkVJR05fQ0hJTEQsIExPUkRTX09GX1RIRV9DT1NNT1MsIEJPTERfQ09OSkVDVFVSRVNfVk9MVU1FXzEsIEJPTERfQ09OSkVDVFVSRVNfVk9MVU1FXzIsIFRIRV9GQVJUSEVTVF9SRUFDSEVTLCBHUklNTVNfRkFJUllfVEFMRVMsIEFSQUJJQU5fTklHSFRTXVxuXG5leHBvcnQgY29uc3QgQUxMX0JPT0tTOiBCb29rW10gPSBCT09LU1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9vayhpZDogc3RyaW5nKTogQm9vayB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBBTExfQk9PS1MuZmluZChiID0+IGIuaWQgPT09IGlkKVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zY3JpcHRzL2FuZHJvaWRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NjcmlwdHMvYW5kcm9pZC9uYXRpdmUtYm9va3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc2NyaXB0cy9hbmRyb2lkL25hdGl2ZS1ib29rcy50c1wiO2ltcG9ydCBmcyBmcm9tICdub2RlOmZzJ1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gJ25vZGU6Y3J5cHRvJ1xuaW1wb3J0IHR5cGUgeyBCb29rIH0gZnJvbSAnLi4vLi4vc3JjL3R5cGVzJ1xuXG5leHBvcnQgdHlwZSBOYXRpdmVCb29rRmlsZSA9IHsgcGF0aDogc3RyaW5nOyBzaGEyNTY6IHN0cmluZzsgYnl0ZXM6IG51bWJlciB9XG5leHBvcnQgZnVuY3Rpb24gYnVpbGROYXRpdmVCb29rcyhcbiAgcHVibGljUm9vdDogc3RyaW5nLFxuICByZWdpc3RyeTogQm9va1tdLFxuICBjYXRhbG9ndWU6IHsgYm9va3M6IEFycmF5PHsgaWQ6IHN0cmluZzsgZWRpdGlvbnM6IEFycmF5PHsga2V5OiBzdHJpbmc7IGRpc2NvdmVyeUF2YWlsYWJsZT86IGJvb2xlYW47IGF2YWlsYWJpbGl0eTogeyBjaGFwdGVyVGV4dDogYm9vbGVhbiB9IH0+OyBkaXNjb3ZlcnlBdmFpbGFibGU/OiBib29sZWFuOyBba2V5OiBzdHJpbmddOiB1bmtub3duIH0+OyBba2V5OiBzdHJpbmddOiB1bmtub3duIH0sXG4gIHByZWZhY2VzOiBNYXA8c3RyaW5nLCBzdHJpbmc+LFxuKSB7XG4gIGNvbnN0IG1hbmlmZXN0czogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9XG4gIGNvbnN0IGJvb2tzID0gY2F0YWxvZ3VlLmJvb2tzLmZpbHRlcihib29rID0+IGJvb2suZGlzY292ZXJ5QXZhaWxhYmxlICE9PSBmYWxzZSkubWFwKHZpZXcgPT4ge1xuICAgIGNvbnN0IHNvdXJjZSA9IHJlZ2lzdHJ5LmZpbmQoYm9vayA9PiBib29rLmlkID09PSB2aWV3LmlkKVxuICAgIGlmICghc291cmNlKSB0aHJvdyBuZXcgRXJyb3IoJ05hdGl2ZSBjYXRhbG9ndWUgYm9vayBoYXMgbm8gcmVnaXN0cnk6ICcgKyB2aWV3LmlkKVxuICAgIC8vIERhbmlzaCBzdGF5cyBvdXQgb2YgdGhlIG5hdGl2ZSBpbmRleCwgdGhlIG9mZmVyZWQgRGFuaXNoIGVkaXRpb25zXG4gICAgLy8gKE9GRkVSRURfREFOSVNIX0VESVRJT05TKSBpbmNsdWRlZDogaW5zdGFsbGVkIEFQS3MgZmV0Y2ggdGhpcyBpbmRleCBmcm9tIHRpbmN0LmFwcCBhbmRcbiAgICAvLyB0aGVpciB2YWxpZGF0b3IgKHNyYy91dGlscy9uYXRpdmVCb29rcy50cyBiZWZvcmUgMjAyNi0xMC0xMCkgcmVqZWN0cyB0aGVcbiAgICAvLyB3aG9sZSBjYXRhbG9ndWUgd2hlbiBhbnkgZW50cnkgY2FycmllcyBhIERhbmlzaCBlZGl0aW9uLiBBZGQgaXQgb25seSBvbmNlXG4gICAgLy8gZXZlcnkgc3VwcG9ydGVkIEFQSyBhY2NlcHRzIE9GRkVSRURfREFOSVNIX0VESVRJT05TLlxuICAgIGNvbnN0IGVkaXRpb25zID0gc291cmNlLmVkaXRpb25zLmZpbHRlcihlZGl0aW9uID0+IGVkaXRpb24ubGFuZ3VhZ2UgIT09ICdkYSdcbiAgICAgICYmIHZpZXcuZWRpdGlvbnMuc29tZShpdGVtID0+IGl0ZW0ua2V5ID09PSBlZGl0aW9uLmtleSAmJiBpdGVtLmRpc2NvdmVyeUF2YWlsYWJsZSAhPT0gZmFsc2UgJiYgaXRlbS5hdmFpbGFiaWxpdHkuY2hhcHRlclRleHQpKVxuICAgIGNvbnN0IGZpbGVzOiBOYXRpdmVCb29rRmlsZVtdID0gW11cbiAgICBjb25zdCBhZGQgPSAocmVsYXRpdmU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IHBhdGguam9pbihwdWJsaWNSb290LCByZWxhdGl2ZSlcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyhmaWxlKSkgcmV0dXJuXG4gICAgICBpZiAoZnMuc3RhdFN5bmMoZmlsZSkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgZnMucmVhZGRpclN5bmMoZmlsZSkuc29ydCgpKSBhZGQocmVsYXRpdmUgKyAnLycgKyBuYW1lKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSlcbiAgICAgIGZpbGVzLnB1c2goeyBwYXRoOiAnLycgKyByZWxhdGl2ZSwgc2hhMjU2OiBjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoZGF0YSkuZGlnZXN0KCdoZXgnKSwgYnl0ZXM6IGRhdGEubGVuZ3RoIH0pXG4gICAgfVxuICAgIGZvciAoY29uc3QgZWRpdGlvbiBvZiBlZGl0aW9ucykge1xuICAgICAgYWRkKCdkYXRhL2VkaXRpb25zLycgKyB2aWV3LmlkICsgJy0nICsgZWRpdGlvbi5rZXkgKyAnLmpzb24nKVxuICAgICAgYWRkKCdkYXRhL2VkaXRpb25zLWNoYXB0ZXJzLycgKyB2aWV3LmlkICsgJy0nICsgZWRpdGlvbi5rZXkpXG4gICAgfVxuICAgIC8vIE9wdGlvbmFsIHNpZGVjYXJzIGFyZSBjb3BpZWQgdW5jaGFuZ2VkLiBUaGV5IG5ldmVyIHNlbGVjdCBhIGhlbGQgZWRpdGlvbi5cbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgZnMucmVhZGRpclN5bmMocGF0aC5qb2luKHB1YmxpY1Jvb3QsICdkYXRhL2VkaXRpb25zJykpLnNvcnQoKSkge1xuICAgICAgaWYgKG5hbWUgPT09IHZpZXcuaWQgKyAnLXRocmVhZHMuanNvbicgfHwgbmFtZSA9PT0gdmlldy5pZCArICctbGluZXMuanNvbicpIGFkZCgnZGF0YS9lZGl0aW9ucy8nICsgbmFtZSlcbiAgICB9XG4gICAgYWRkKCdkYXRhL2NoYXJhY3RlcnMvJyArIHZpZXcuaWQgKyAnLnYxLmpzb24nKVxuICAgIC8vIExhcmdlIHBhY2thZ2VzICh0aGUgQmlibGUpIHNoaXAgb25lIHNpZGVjYXIgcGVyIGVkaXRpb246IDxpZD4udjEuPGVkaXRpb24+Lmpzb24uXG4gICAgZm9yIChjb25zdCBlZGl0aW9uIG9mIGVkaXRpb25zKSBhZGQoJ2RhdGEvY2hhcmFjdGVycy8nICsgdmlldy5pZCArICcudjEuJyArIGVkaXRpb24ua2V5ICsgJy5qc29uJylcbiAgICBhZGQoJ2RhdGEvb25ib2FyZGluZy8nICsgdmlldy5pZCArICcuanNvbicpXG4gICAgYWRkKCdjb3ZlcnMvdjIvJyArIHZpZXcuaWQgKyAnLndlYnAnKVxuICAgIGNvbnN0IHByZWZhY2UgPSBwcmVmYWNlcy5nZXQodmlldy5pZClcbiAgICBpZiAocHJlZmFjZSkgZmlsZXMucHVzaCh7IHBhdGg6ICcvbGFiL3ByZWZhY2VzLycgKyB2aWV3LmlkICsgJy5qc29uJywgc2hhMjU2OiBjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUocHJlZmFjZSkuZGlnZXN0KCdoZXgnKSwgYnl0ZXM6IEJ1ZmZlci5ieXRlTGVuZ3RoKHByZWZhY2UpIH0pXG4gICAgaWYgKCFlZGl0aW9ucy5sZW5ndGggfHwgZWRpdGlvbnMuc29tZShlZGl0aW9uID0+ICFmaWxlcy5zb21lKGZpbGUgPT4gZmlsZS5wYXRoID09PSAnL2RhdGEvZWRpdGlvbnMvJyArIHZpZXcuaWQgKyAnLScgKyBlZGl0aW9uLmtleSArICcuanNvbicpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOYXRpdmUgZG93bmxvYWQgaXMgbWlzc2luZyBhIHB1Ymxpc2hlZCBlZGl0aW9uOiAnICsgdmlldy5pZClcbiAgICB9XG4gICAgZmlsZXMuc29ydCgoYSwgYikgPT4gYS5wYXRoLmxvY2FsZUNvbXBhcmUoYi5wYXRoKSlcbiAgICBjb25zdCBib29rID0geyAuLi5zb3VyY2UsIGVkaXRpb25zIH1cbiAgICBjb25zdCBtYW5pZmVzdCA9IHsgc2NoZW1hOiAxLCBib29rLCB2aWV3OiB7IC4uLnZpZXcsIGVkaXRpb25zOiB2aWV3LmVkaXRpb25zLmZpbHRlcihlZGl0aW9uID0+IGVkaXRpb25zLnNvbWUoaXRlbSA9PiBpdGVtLmtleSA9PT0gZWRpdGlvbi5rZXkpKSB9LCBmaWxlcyB9XG4gICAgY29uc3QgdGV4dCA9IEpTT04uc3RyaW5naWZ5KG1hbmlmZXN0KVxuICAgIGNvbnN0IHJldmlzaW9uID0gY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKHRleHQpLmRpZ2VzdCgnaGV4JylcbiAgICBjb25zdCBzaGFyZGVkRWRpdGlvbnMgPSBlZGl0aW9ucy5maWx0ZXIoZWRpdGlvbiA9PiBmaWxlcy5zb21lKGZpbGUgPT4gZmlsZS5wYXRoID09PSAnL2RhdGEvZWRpdGlvbnMtY2hhcHRlcnMvJyArIGJvb2suaWQgKyAnLScgKyBlZGl0aW9uLmtleSArICcvbWFuaWZlc3QuanNvbicpKS5tYXAoZWRpdGlvbiA9PiBib29rLmlkICsgJy0nICsgZWRpdGlvbi5rZXkpXG4gICAgY29uc3QgZW50cnkgPSB7IGlkOiBib29rLmlkLCByZXZpc2lvbiwgc2hhcmRlZEVkaXRpb25zLCBieXRlczogZmlsZXMucmVkdWNlKCh0b3RhbCwgZmlsZSkgPT4gdG90YWwgKyBmaWxlLmJ5dGVzLCAwKSwgbWFuaWZlc3Q6ICcvbmF0aXZlLWJvb2tzLycgKyBib29rLmlkICsgJy0nICsgcmV2aXNpb24gKyAnLmpzb24nLCBib29rLCB2aWV3OiBtYW5pZmVzdC52aWV3IH1cbiAgICBtYW5pZmVzdHNbZW50cnkubWFuaWZlc3Quc2xpY2UoMSldID0gdGV4dFxuICAgIHJldHVybiBlbnRyeVxuICB9KVxuICAvLyBUaGUgbmF0aXZlIGxpYnJhcnkgbmV2ZXIgb2ZmZXJzIGFuIGVkaXRpb24gdGhlIG5hdGl2ZSBwYWNrYWdlcyBsZWF2ZSBvdXQuXG4gIGNvbnN0IG5hdGl2ZUNhdGFsb2d1ZSA9IHsgLi4uY2F0YWxvZ3VlLCBib29rczogY2F0YWxvZ3VlLmJvb2tzLm1hcCh2aWV3ID0+ICh7XG4gICAgLi4udmlldyxcbiAgICBlZGl0aW9uczogdmlldy5lZGl0aW9ucy5tYXAoZWRpdGlvbiA9PiAoZWRpdGlvbiBhcyB7IGxhbmd1YWdlPzogc3RyaW5nIH0pLmxhbmd1YWdlID09PSAnZGEnID8geyAuLi5lZGl0aW9uLCBkaXNjb3ZlcnlBdmFpbGFibGU6IGZhbHNlIH0gOiBlZGl0aW9uKSxcbiAgfSkpIH1cbiAgcmV0dXJuIHsgaW5kZXg6IEpTT04uc3RyaW5naWZ5KHsgc2NoZW1hOiAxLCBjYXRhbG9ndWU6IG5hdGl2ZUNhdGFsb2d1ZSwgYm9va3MgfSksIG1hbmlmZXN0cyB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IEJPT0tTIH0gZnJvbSAnLi9zcmMvZGF0YS9ib29rUmVnaXN0cnknXG5pbXBvcnQgeyBidWlsZE5hdGl2ZUJvb2tzIH0gZnJvbSAnLi9zY3JpcHRzL2FuZHJvaWQvbmF0aXZlLWJvb2tzJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB0eXBlIHsgSW5jb21pbmdNZXNzYWdlLCBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgc2VyaWFsaXplUHJlUmVhZGVyQ2F0YWxvZ3VlIH0gZnJvbSAnLi9zcmMvcHJlUmVhZGVyL2NhdGFsb2d1ZSdcbmltcG9ydCB7IGFkZExpYnJhcnlSZWFkaW5nU3RydWN0dXJlcyB9IGZyb20gJy4vc3JjL3ByZVJlYWRlci9saWJyYXJ5UmVhZGluZ1N0cnVjdHVyZSdcbmltcG9ydCB7IGxlZ2FjeUxhYlBhZ2VSZWRpcmVjdCB9IGZyb20gJy4vc3JjL2xhYi9sYWJSb3V0ZSdcbmltcG9ydCB7IGFjY291bnRQYWdlUmVkaXJlY3QgfSBmcm9tICcuL3NyYy9jYXJkcy9jYXJkUm91dGVzJ1xuaW1wb3J0IHsgYnVpbGRSZWFkZXJCb290U2NyaXB0IH0gZnJvbSAnLi9zY3JpcHRzL3JlYWRlckJvb3RTY3JpcHQnXG5cbmNvbnN0IHNlcmlhbGl6ZWRQcmVSZWFkZXJDYXRhbG9ndWUgPSBKU09OLnN0cmluZ2lmeShhZGRMaWJyYXJ5UmVhZGluZ1N0cnVjdHVyZXMoXG4gIHNlcmlhbGl6ZVByZVJlYWRlckNhdGFsb2d1ZSgpLFxuICBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3B1YmxpYycpLFxuKSlcblxuLy8gVGhlIGxpYnJhcnkgaW50cm9kdWN0aW9uIHNlcnZlcyB0aGVzZSBleGFjdCBhcHByb3ZlZCB0ZXh0IGZpbGVzLlxuY29uc3QgZW50cnlQcmVmYWNlcyA9IG5ldyBNYXAoSlNPTi5wYXJzZShzZXJpYWxpemVkUHJlUmVhZGVyQ2F0YWxvZ3VlKS5ib29rcy5mbGF0TWFwKChib29rOiB7IGlkOiBzdHJpbmcgfSkgPT4ge1xuICBjb25zdCBmaWxlID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvZGF0YS9wcmVmYWNlcycsIGAke2Jvb2suaWR9LnR4dGApXG4gIHJldHVybiBmcy5leGlzdHNTeW5jKGZpbGUpID8gW1tib29rLmlkLCBKU09OLnN0cmluZ2lmeSh7Ym9va0lkOmJvb2suaWQsIGxhbmd1YWdlOidlbicsIHBhcmFncmFwaHM6ZnMucmVhZEZpbGVTeW5jKGZpbGUsJ3V0ZjgnKS50cmltKCkuc3BsaXQoL1xcblxccypcXG4vKX0pXV0gOiBbXVxufSkpXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlLCBjb21tYW5kIH0pID0+IHtcbiAgLy8gUHJvZHVjdGlvbiBpcyBzZXJpYWxpemVkIGFuZCBhY2NlcHRlZCBieSBHaXRIdWIgQWN0aW9ucy4gV29ya2VycyBCdWlsZHNcbiAgLy8gb3RoZXJ3aXNlIHJhY2VzIGl0IGFuZCByZXBsYWNlcyBjb250ZW50LWhhc2hlZCBhc3NldHMgZHVyaW5nIGFjY2VwdGFuY2UuXG4gIGlmIChjb21tYW5kID09PSAnYnVpbGQnICYmIHByb2Nlc3MuZW52LldPUktFUlNfQ0kgPT09ICcxJykge1xuICAgIHRocm93IG5ldyBFcnJvcignVGluY3QgcHJvZHVjdGlvbiBidWlsZHMgcnVuIHRocm91Z2ggR2l0SHViIEFjdGlvbnMgb25seTsgV29ya2VycyBCdWlsZHMgaXMgZGlzYWJsZWQgdG8gcHJldmVudCBjb21wZXRpbmcgZGVwbG95bWVudHMuJylcbiAgfVxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKVxuICBjb25zdCBpc0NhcGFjaXRvciA9IHByb2Nlc3MuZW52LkNBUEFDSVRPUiA9PT0gJ3RydWUnXG5cbiAgLy8gQ2xvdWRmbGFyZSBXb3JrZXJzIEJ1aWxkcyBoYXMgbm8gYXBwLy5lbnYuIFRoZXNlIGFyZSBwdWJsaWMgY2xpZW50IHZhbHVlc1xuICAvLyBhbHJlYWR5IHJlcXVpcmVkIGJ5IHZlcmlmeS1idW5kbGUgYW5kIHByZXNlbnQgaW4gdGhlIGxpdmUgYnJvd3NlciBidW5kbGUuXG4gIC8vIExvY2FsIGJ1aWxkcyBzdGlsbCBmYWlsIGxvdWRseSBpZiAuZW52IGlzIG1pc3NpbmcuXG4gIGlmIChjb21tYW5kID09PSAnYnVpbGQnICYmIChwcm9jZXNzLmVudi5DSSB8fCBwcm9jZXNzLmVudi5XT1JLRVJTX0NJKSkge1xuICAgIGNvbnN0IHB1YmxpY0NsaWVudEVudjogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgIFZJVEVfU1VQQUJBU0VfVVJMOiAnaHR0cHM6Ly95YXpqeWlxc3hqeXN0dnBreW91ay5zdXBhYmFzZS5jbycsXG4gICAgICBWSVRFX1NVUEFCQVNFX0FOT05fS0VZOiAnZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW5saGVtcDVhWEZ6ZUdwNWMzUjJjR3Q1YjNWcklpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTnpRd01UQTJNVFFzSW1WNGNDSTZNakE0T1RVNE5qWXhOSDAuVnlOakN5YjVUYzFUMXd4NW53WnN2V0dtd0s2N0ZIYUIyUHRydHU0RWVKQScsXG4gICAgICBWSVRFX0FVRElPX0JBU0VfVVJMOiAnaHR0cHM6Ly90aW5jdC5hcHAnLFxuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhwdWJsaWNDbGllbnRFbnYpKSB7XG4gICAgICBpZiAoIWVudltrZXldKSB7XG4gICAgICAgIGVudltrZXldID0gdmFsdWVcbiAgICAgICAgcHJvY2Vzcy5lbnZba2V5XSA9IHZhbHVlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gR3VhcmQ6IHByb2R1Y3Rpb24gYnVpbGRzICh3ZWIgQU5EIENhcGFjaXRvci9BbmRyb2lkKSBtdXN0IHNoaXAgd2l0aFxuICAvLyBTdXBhYmFzZSArIGF1ZGlvIGVudiB2YXJzIGJha2VkIGluLiBBIHNpbGVudCBidWlsZCB3aXRoIGVtcHR5XG4gIC8vIFZJVEVfU1VQQUJBU0VfVVJMIC8gVklURV9TVVBBQkFTRV9BTk9OX0tFWSBzaGlwcGVkIGFuIFwiQXV0aCBub3QgY29uZmlndXJlZFwiXG4gIC8vIG91dGFnZSB0byB0aW5jdC5hcHAgdHdpY2Ugb24gMjAyNi0wNC0yMi8yMyBcdTIwMTQgdGhlIFN1cGFiYXNlIGNsaWVudCBpbml0XG4gIC8vIHJldHVybnMgbnVsbCB3aGVuIHRoZXNlIGFyZSBlbXB0eSwgZXZlcnkgYXV0aCBjYWxsIHJldHVybnMgXCJBdXRoIG5vdFxuICAvLyBjb25maWd1cmVkXCIsIGFuZCB0aGVyZSdzIG5vIHNlcnZlci1zaWRlIHNpZ25hbCB0byBjYXRjaCBpdC4gRmFpbCBsb3VkbHkuXG4gIGlmIChjb21tYW5kID09PSAnYnVpbGQnICYmICFwcm9jZXNzLmVudi5TS0lQX0VOVl9DSEVDSykge1xuICAgIGNvbnN0IHJlcXVpcmVkID0gWydWSVRFX1NVUEFCQVNFX1VSTCcsICdWSVRFX1NVUEFCQVNFX0FOT05fS0VZJywgJ1ZJVEVfQVVESU9fQkFTRV9VUkwnXVxuICAgIGNvbnN0IG1pc3NpbmcgPSByZXF1aXJlZC5maWx0ZXIoayA9PiAhZW52W2tdKVxuICAgIGlmIChtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgXFxuXFxuXHUyNzE3IEJ1aWxkIGFib3J0ZWQ6IHJlcXVpcmVkIGVudiB2YXJzIGFyZSBtaXNzaW5nOlxcbiAgJHttaXNzaW5nLmpvaW4oJ1xcbiAgJyl9XFxuXFxuYCArXG4gICAgICAgIGBUaGVzZSBtdXN0IGJlIHNldCBpbiAuZW52IChzYW1lIGRpcmVjdG9yeSBhcyB2aXRlLmNvbmZpZy50cykgYmVmb3JlIHJ1bm5pbmcgbnBtIHJ1biBidWlsZC5cXG5gICtcbiAgICAgICAgYFdpdGhvdXQgdGhlbSwgdGhlIGRlcGxveWVkIGFwcCB3aWxsIGhhdmUgYnJva2VuIGF1dGggYW5kIGF1ZGlvIGFuZCB3aWxsIE5PVCBzaG93IGVycm9ycyBhdCBidWlsZCB0aW1lLlxcblxcbmAgK1xuICAgICAgICBgSWYgeW91J3JlIHN1cmUgeW91IHdhbnQgdG8gcHJvY2VlZCAoZS5nLiBvZmZsaW5lIGRldiBwcmV2aWV3KSwgc2V0IFNLSVBfRU5WX0NIRUNLPTEuXFxuYFxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIC8vIFN0YWJsZSBwZXItYnVpbGQgaWRlbnRpZmllciB1c2VkIHRvIGNhY2hlLWJ1c3QgL2RhdGEvZWRpdGlvbnMvKi5qc29uXG4gIC8vIHJlcXVlc3RzIG9uIHJlcHVibGlzaCAodGhlIEpTT05zIHRoZW1zZWx2ZXMgYXJlIG5vdCBjb250ZW50LWhhc2hlZCkuIEluXG4gIC8vIGRldiB3ZSBwaW4gdG8gXCJkZXZcIiBzbyB0aGUgcGFyYW0gZG9lc24ndCBjaHVybiBvbiBldmVyeSBITVIgY3ljbGUuXG4gIGNvbnN0IGJ1aWxkVmVyc2lvbiA9IGNvbW1hbmQgPT09ICdidWlsZCdcbiAgICA/IGAke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfWBcbiAgICA6ICdkZXYnXG5cbiAgbGV0IHJlYWRlckJvb3RCdWlsZDogUmV0dXJuVHlwZTx0eXBlb2YgYnVpbGRSZWFkZXJCb290U2NyaXB0PiB8IG51bGwgPSBudWxsXG4gIGNvbnN0IHJlYWRlckJvb3QgPSAoKSA9PiAocmVhZGVyQm9vdEJ1aWxkID8/PSBidWlsZFJlYWRlckJvb3RTY3JpcHQoYnVpbGRWZXJzaW9uKSlcblxuICByZXR1cm4ge1xuICBkZWZpbmU6IHtcbiAgICBfX0JVSUxEX1ZFUlNJT05fXzogSlNPTi5zdHJpbmdpZnkoYnVpbGRWZXJzaW9uKSxcbiAgfSxcbiAgYmFzZTogaXNDYXBhY2l0b3IgPyAnLi8nIDogJy8nLFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIGluZGV4OiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ2luZGV4Lmh0bWwnKSxcbiAgICAgICAgbGFiRmVhdHVyZWRBY2Nlc3M6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2xhYkZlYXR1cmVkQWNjZXNzLnRzJyksXG4gICAgICAgIGxhYkF1dGhTdGF0dXM6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2xhYkF1dGhTdGF0dXMudHMnKSxcbiAgICAgICAgbGFiU2lnbkluOiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9sYWJTaWduSW4udHMnKSxcbiAgICAgICAgbGlicmFyeVR3b0Fzc2lzdGFudDogcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvbGlicmFyeVR3b0Fzc2lzdGFudC50c3gnKSxcbiAgICAgICAgbGlicmFyeVR3b1JlYWRpbmc6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2xpYnJhcnlUd29SZWFkaW5nLnRzJyksXG4gICAgICAgIGxpYnJhcnlBZGQ6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2xpYnJhcnlBZGQudHMnKSxcbiAgICAgICAgbmF0aXZlQm9va3M6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL3V0aWxzL25hdGl2ZUJvb2tzLnRzJyksXG4gICAgICAgIC8vIFRoZSBhY2NvdW50IGNhcmRzIG92ZXIgdGhlIGxpYnJhcnkgKENBUkRTLUJSSUVGLm1kKTsgdGhlIHJlYWRlciBpbXBvcnRzIHRoZW0gaXRzZWxmLlxuICAgICAgICBsaWJyYXJ5Q2FyZHM6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2NhcmRzL2xpYnJhcnlDYXJkcy50cycpLFxuICAgICAgICAvLyBTb2NpYWwgKHNoaXAgMyk6IGEgcHJvZmlsZSBwYWdlJ3Mgc2NyaXB0IGFuZCB0aGUgYWRtaW4gdmlldy4gU2VydmVkIG9ubHkgd2hpbGUgU09DSUFMX0ZSSUVORFMgaXMgb24uXG4gICAgICAgIHByb2ZpbGVQYWdlOiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9zb2NpYWwvcHJvZmlsZVBhZ2UudHMnKSxcbiAgICAgICAgYWRtaW5Tb2NpYWxQYWdlOiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9zb2NpYWwvYWRtaW5Tb2NpYWxQYWdlLnRzJyksXG4gICAgICB9LFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIC8vIFJlc2VydmUgaW5kZXgtKiBmb3IgdGhlIHJlYWwgcmVhZGVyIGVudHJ5LiBOYXRpdmUgcGx1Z2luIGVudHJ5cG9pbnRzXG4gICAgICAgIC8vIGFsc28gdXNlIGluZGV4LnRzOyB0aGVpciBsYXp5IGNodW5rcyBtdXN0IG5vdCBpbXBlcnNvbmF0ZSB0aGUgYXBwXG4gICAgICAgIC8vIGluIHNoZWxsIHN0YW1waW5nLCBwcm9kdWN0aW9uIGNoZWNrcyBvciBvZmZsaW5lIHJlZ2lzdHJhdGlvbi5cbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6IGNodW5rID0+IGNodW5rLm5hbWUgPT09ICdpbmRleCcgPyAnYXNzZXRzL3NoYXJlZC1pbmRleC1baGFzaF0uanMnIDogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IGNodW5rID0+IGNodW5rLm5hbWUgPT09ICdsYWJGZWF0dXJlZEFjY2VzcycgPyAnbGFiL2ZlYXR1cmVkLWFjY2Vzcy5qcycgOiBjaHVuay5uYW1lID09PSAnbGFiQXV0aFN0YXR1cydcbiAgICAgICAgICA/ICdsYWIvYXV0aC1zdGF0dXMuanMnXG4gICAgICAgICAgOiBjaHVuay5uYW1lID09PSAnbGFiU2lnbkluJ1xuICAgICAgICAgICAgPyAnbGFiL3NpZ24taW4tcnVudGltZS5qcydcbiAgICAgICAgICAgIDogY2h1bmsubmFtZSA9PT0gJ2xpYnJhcnlUd29Bc3Npc3RhbnQnXG4gICAgICAgICAgICAgICAgPyAnbGFiL2xpYnJhcnktMi1hc3Npc3RhbnQuanMnXG4gICAgICAgICAgICAgIDogY2h1bmsubmFtZSA9PT0gJ25hdGl2ZUJvb2tzJ1xuICAgICAgICAgICAgICAgID8gJ2xhYi9uYXRpdmUtYm9va3MuanMnXG4gICAgICAgICAgICAgIDogY2h1bmsubmFtZSA9PT0gJ2xpYnJhcnlUd29SZWFkaW5nJ1xuICAgICAgICAgICAgICAgID8gJ2xhYi9saWJyYXJ5LTItcmVhZGluZy5qcydcbiAgICAgICAgICAgICAgOiBjaHVuay5uYW1lID09PSAnbGlicmFyeUFkZCdcbiAgICAgICAgICAgICAgICA/ICdsYWIvbGlicmFyeS1hZGQuanMnXG4gICAgICAgICAgICAgIDogY2h1bmsubmFtZSA9PT0gJ2xpYnJhcnlDYXJkcydcbiAgICAgICAgICAgICAgICA/ICdsYWIvYWNjb3VudC1jYXJkcy5qcydcbiAgICAgICAgICAgICAgOiBjaHVuay5uYW1lID09PSAncHJvZmlsZVBhZ2UnXG4gICAgICAgICAgICAgICAgPyAnbGFiL3NvY2lhbC1wcm9maWxlLmpzJ1xuICAgICAgICAgICAgICA6IGNodW5rLm5hbWUgPT09ICdhZG1pblNvY2lhbFBhZ2UnXG4gICAgICAgICAgICAgICAgPyAnbGFiL2FkbWluLXNvY2lhbC1ydW50aW1lLmpzJ1xuICAgICAgICAgICAgICA6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHtcbiAgICAgIC8vIFRoZSByZWFkZXIncyBoZWFkIHNjcmlwdDogc3RhcnRzIHRoZSBvcGVuaW5nIGNoYXB0ZXIncyByZXF1ZXN0cyBhbmRcbiAgICAgIC8vIHBhaW50cyB0aGUgc3RvcmVkIHBhcGVyIGJlZm9yZSB0aGUgYXBwIGJ1bmRsZSBydW5zIChzcmMvbGFiL3JlYWRlckJvb3QudHMpLlxuICAgICAgbmFtZTogJ3JlYWRlci1ib290JyxcbiAgICAgIGFwcGx5OiAoKSA9PiAhaXNDYXBhY2l0b3IsXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9sYWIvcmVhZGVyLWJvb3QuanMnLCAoX3JlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2phdmFzY3JpcHQ7IGNoYXJzZXQ9dXRmLTgnLCAnQ2FjaGUtQ29udHJvbCc6ICduby1zdG9yZScgfSlcbiAgICAgICAgICByZXMuZW5kKGJ1aWxkUmVhZGVyQm9vdFNjcmlwdChidWlsZFZlcnNpb24pLnNvdXJjZSlcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICB0cmFuc2Zvcm1JbmRleEh0bWw6IHtcbiAgICAgICAgb3JkZXI6ICdwb3N0JyxcbiAgICAgICAgaGFuZGxlcihfaHRtbCwgY3R4KSB7XG4gICAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShjdHguZmlsZW5hbWUpICE9PSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ2luZGV4Lmh0bWwnKSkgcmV0dXJuXG4gICAgICAgICAgY29uc3Qgc3JjID0gY29tbWFuZCA9PT0gJ2J1aWxkJyA/IGAvJHtyZWFkZXJCb290KCkuZmlsZU5hbWV9YCA6ICcvbGFiL3JlYWRlci1ib290LmpzJ1xuICAgICAgICAgIC8vIEVuZ2xpc2ggaHlwaGVuYXRpb24gaXMgbGF6eS1sb2FkZWQsIGJ1dCB0aGUgZmlyc3QgcGFnZSBpcyBtZWFzdXJlZFxuICAgICAgICAgIC8vIHdpdGggaXQgKExhYkFwcCB3YWl0cyBmb3IgaXQgYnJpZWZseSk7IGZldGNoIGl0IGJlc2lkZSB0aGUgYnVuZGxlLlxuICAgICAgICAgIGNvbnN0IGh5cGhlbmF0aW9uID0gT2JqZWN0LnZhbHVlcyhjdHguYnVuZGxlID8/IHt9KS5maWx0ZXIoY2h1bmsgPT4gY2h1bmsudHlwZSA9PT0gJ2NodW5rJ1xuICAgICAgICAgICAgJiYgY2h1bmsubW9kdWxlSWRzLnNvbWUoaWQgPT4gL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dKD86aHlwaGVyfGh5cGhlbmF0aW9uXFwuZW4tdXMpW1xcXFwvXS8udGVzdChpZCkpKVxuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IHRhZzogJ3NjcmlwdCcsIGF0dHJzOiB7IHNyYyB9LCBpbmplY3RUbzogJ2hlYWQtcHJlcGVuZCcgfSxcbiAgICAgICAgICAgIC4uLmh5cGhlbmF0aW9uLm1hcChjaHVuayA9PiAoeyB0YWc6ICdsaW5rJywgYXR0cnM6IHsgcmVsOiAnbW9kdWxlcHJlbG9hZCcsIGNyb3Nzb3JpZ2luOiB0cnVlLCBocmVmOiBgLyR7Y2h1bmsuZmlsZU5hbWV9YCB9LCBpbmplY3RUbzogJ2hlYWQnIGFzIGNvbnN0IH0pKSxcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgZ2VuZXJhdGVCdW5kbGUoKSB7XG4gICAgICAgIGlmIChjb21tYW5kICE9PSAnYnVpbGQnKSByZXR1cm5cbiAgICAgICAgY29uc3QgYm9vdCA9IHJlYWRlckJvb3QoKVxuICAgICAgICB0aGlzLmVtaXRGaWxlKHsgdHlwZTogJ2Fzc2V0JywgZmlsZU5hbWU6IGJvb3QuZmlsZU5hbWUsIHNvdXJjZTogYm9vdC5zb3VyY2UgfSlcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICAvLyBUaGUgbGlicmFyeSBzZWFyY2gncyBjYXRhbG9ndWUgcGFydHMgb24gdGhlIGRldiBzZXJ2ZXIsIGFzIGBucG0gcnVuIGJ1aWxkYCBtYWtlcyB0aGVtXG4gICAgICAvLyAoc2NyaXB0cy9idWlsZC1jYXRhbG9ndWUtc2hhcmRzLm1qcyk6IHdpdGhvdXQgdGhlbSB0aGUgc2VhcmNoIHdvcmtlciBmYWxscyBiYWNrIHRvIHRoZVxuICAgICAgLy8gd2hvbGUgNy45IE1CIGNhdGFsb2d1ZSwgd2hvc2UgcGFyc2UgdG9vayB0aGUgZGV2IHBhZ2UgKGFuZCB0aGUgYnJvd3NlciB0ZXN0cykgdG8gfjEuOSBHQi5cbiAgICAgIG5hbWU6ICdsYWItY2F0YWxvZ3VlLXNoYXJkcycsXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAgIGNvbnN0IHdob2xlID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdwdWJsaWMvbGFiL2FkZGJvb2svZGF0YS9jYXRhbG9nLmpzb24uZ3onKVxuICAgICAgICBsZXQgcGFydHM6IFByb21pc2U8UmVjb3JkPHN0cmluZywgQnVmZmVyPj4gfCBudWxsID0gbnVsbCwgcGFydHNGb3IgPSAwXG4gICAgICAgIGNvbnN0IGJ1aWxkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgZ3VuemlwU3luYywgZ3ppcFN5bmMgfSA9IGF3YWl0IGltcG9ydCgnemxpYicpXG4gICAgICAgICAgLy8gTG9hZGVkIGJ5IE5vZGUgYXQgcnVuIHRpbWUgKG5vdCBidW5kbGVkIGludG8gdGhpcyBjb25maWcpOiB0aGUgYnVpbGQncyBvd24gc3BsaXQuXG4gICAgICAgICAgY29uc3QgeyBwYXRoVG9GaWxlVVJMIH0gPSBhd2FpdCBpbXBvcnQoJ3VybCcpXG4gICAgICAgICAgY29uc3QgeyBzcGxpdENhdGFsb2d1ZSB9ID0gYXdhaXQgaW1wb3J0KHBhdGhUb0ZpbGVVUkwocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzY3JpcHRzL2J1aWxkLWNhdGFsb2d1ZS1zaGFyZHMubWpzJykpLmhyZWYpXG4gICAgICAgICAgY29uc3QgeyBlbmdsaXNoLCBtb3JlIH0gPSBzcGxpdENhdGFsb2d1ZShKU09OLnBhcnNlKGd1bnppcFN5bmMoZnMucmVhZEZpbGVTeW5jKHdob2xlKSkudG9TdHJpbmcoJ3V0ZjgnKSkpXG4gICAgICAgICAgcmV0dXJuIHsgJ2NhdGFsb2ctZW4uanNvbi5neic6IGd6aXBTeW5jKEJ1ZmZlci5mcm9tKEpTT04uc3RyaW5naWZ5KGVuZ2xpc2gpKSksICdjYXRhbG9nLW1vcmUuanNvbi5neic6IGd6aXBTeW5jKEJ1ZmZlci5mcm9tKEpTT04uc3RyaW5naWZ5KG1vcmUpKSkgfVxuICAgICAgICB9XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9sYWIvYWRkYm9vay9kYXRhLycsIChyZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSwgbmV4dDogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5hbWUgPSAocmVxLnVybCB8fCAnJykuc3BsaXQoJz8nKVswXS5yZXBsYWNlKC9eXFwvLywgJycpXG4gICAgICAgICAgaWYgKG5hbWUgIT09ICdjYXRhbG9nLWVuLmpzb24uZ3onICYmIG5hbWUgIT09ICdjYXRhbG9nLW1vcmUuanNvbi5neicpIHJldHVybiBuZXh0KClcbiAgICAgICAgICBsZXQgc3RhbXAgPSAwXG4gICAgICAgICAgdHJ5IHsgc3RhbXAgPSBmcy5zdGF0U3luYyh3aG9sZSkubXRpbWVNcyB9IGNhdGNoIHsgcmV0dXJuIG5leHQoKSB9XG4gICAgICAgICAgaWYgKCFwYXJ0cyB8fCBwYXJ0c0ZvciAhPT0gc3RhbXApIHsgcGFydHMgPSBidWlsZCgpOyBwYXJ0c0ZvciA9IHN0YW1wOyBwYXJ0cy5jYXRjaCgoKSA9PiB7IHBhcnRzID0gbnVsbCB9KSB9XG4gICAgICAgICAgcGFydHMudGhlbihmaWxlcyA9PiB7XG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2d6aXAnLCAnQ2FjaGUtQ29udHJvbCc6ICduby1zdG9yZScgfSlcbiAgICAgICAgICAgIHJlcy5lbmQoZmlsZXNbbmFtZV0pXG4gICAgICAgICAgfSwgKCkgPT4gbmV4dCgpKVxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdsYWItcHJlLXJlYWRlci1jYXRhbG9ndWUnLFxuICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvbGFiL3ByZWZhY2VzLycsIChyZXEscmVzKSA9PiB7XG4gICAgICAgICAgY29uc3QgaWQ9ZGVjb2RlVVJJQ29tcG9uZW50KChyZXEudXJsIHx8ICcnKS5zcGxpdCgnPycpWzBdLnJlcGxhY2UoL15cXC8vLCcnKS5yZXBsYWNlKC9cXC5qc29uJC8sJycpKVxuICAgICAgICAgIGNvbnN0IHNvdXJjZT1lbnRyeVByZWZhY2VzLmdldChpZClcbiAgICAgICAgICByZXMud3JpdGVIZWFkKHNvdXJjZSA/IDIwMCA6IDQwNCwgeydDb250ZW50LVR5cGUnOidhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04J30pXG4gICAgICAgICAgcmVzLmVuZChzb3VyY2UgfHwgJ3t9JylcbiAgICAgICAgfSlcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2xhYi9jYXRhbG9ndWUuanNvbicsIChfcmVxLCByZXMpID0+IHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnIH0pXG4gICAgICAgICAgcmVzLmVuZChzZXJpYWxpemVkUHJlUmVhZGVyQ2F0YWxvZ3VlKVxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIGdlbmVyYXRlQnVuZGxlKCkge1xuICAgICAgICBjb25zdCBuYXRpdmUgPSBidWlsZE5hdGl2ZUJvb2tzKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAncHVibGljJyksIEJPT0tTLCBKU09OLnBhcnNlKHNlcmlhbGl6ZWRQcmVSZWFkZXJDYXRhbG9ndWUpLCBlbnRyeVByZWZhY2VzIGFzIE1hcDxzdHJpbmcsIHN0cmluZz4pXG4gICAgICAgIHRoaXMuZW1pdEZpbGUoe3R5cGU6J2Fzc2V0JywgZmlsZU5hbWU6J25hdGl2ZS1ib29rcy9pbmRleC5qc29uJywgc291cmNlOm5hdGl2ZS5pbmRleH0pXG4gICAgICAgIGZvciAoY29uc3QgW2ZpbGVOYW1lLCBzb3VyY2VdIG9mIE9iamVjdC5lbnRyaWVzKG5hdGl2ZS5tYW5pZmVzdHMpKSB0aGlzLmVtaXRGaWxlKHt0eXBlOidhc3NldCcsIGZpbGVOYW1lLCBzb3VyY2V9KVxuICAgICAgICBmb3IoY29uc3QgW2lkLHNvdXJjZV0gb2YgZW50cnlQcmVmYWNlcykgdGhpcy5lbWl0RmlsZSh7dHlwZTonYXNzZXQnLGZpbGVOYW1lOmBsYWIvcHJlZmFjZXMvJHtpZH0uanNvbmAsc291cmNlOnNvdXJjZSBhcyBzdHJpbmd9KVxuICAgICAgICB0aGlzLmVtaXRGaWxlKHtcbiAgICAgICAgICB0eXBlOiAnYXNzZXQnLFxuICAgICAgICAgIGZpbGVOYW1lOiAnbGFiL2NhdGFsb2d1ZS5qc29uJyxcbiAgICAgICAgICBzb3VyY2U6IHNlcmlhbGl6ZWRQcmVSZWFkZXJDYXRhbG9ndWUsXG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJ2FudGhyb3BpYy1wcm94eScsXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICAgIC8vIE1pcnJvciB0aGUgcHJvbW90ZWQgcHVibGljIGhvbWVwYWdlIHdoaWxlIGtlZXBpbmcgdGhlIGxhYiByb3V0ZXNcbiAgICAgICAgLy8gYXZhaWxhYmxlIGZvciB0aGUgY2F0YWxvZ3VlLCBzaWduLWluIGFuZCByZWFkZXIuXG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlLCBuZXh0OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgY29uc3QgdXJsID0gcmVxLnVybCB8fCAnJ1xuICAgICAgICAgIC8vIFN0cmlwIHF1ZXJ5IHN0cmluZyBmb3IgdGhlIHBhdGggY29tcGFyaXNvblxuICAgICAgICAgIGNvbnN0IHBhdGhPbmx5ID0gdXJsLnNwbGl0KCc/JylbMF1cbiAgICAgICAgICBpZiAocGF0aE9ubHkgPT09ICcvbGFiL2ZlYXR1cmVkLWFjY2Vzcy5qcycpIHtcbiAgICAgICAgICAgIHJlcS51cmwgPSBgL3NyYy9sYWJGZWF0dXJlZEFjY2Vzcy50cyR7dXJsLnNsaWNlKHBhdGhPbmx5Lmxlbmd0aCl9YFxuICAgICAgICAgICAgbmV4dCgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHBhdGhPbmx5ID09PSAnL2xhYi9hdXRoLXN0YXR1cy5qcycpIHtcbiAgICAgICAgICAgIHJlcS51cmwgPSBgL3NyYy9sYWJBdXRoU3RhdHVzLnRzJHt1cmwuc2xpY2UocGF0aE9ubHkubGVuZ3RoKX1gXG4gICAgICAgICAgICBuZXh0KClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGF0aE9ubHkgPT09ICcvbGFiL3NpZ24taW4tcnVudGltZS5qcycpIHtcbiAgICAgICAgICAgIHJlcS51cmwgPSBgL3NyYy9sYWJTaWduSW4udHMke3VybC5zbGljZShwYXRoT25seS5sZW5ndGgpfWBcbiAgICAgICAgICAgIG5leHQoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwYXRoT25seSA9PT0gJy9sYWIvbGlicmFyeS0yLXJlYWRpbmcuanMnKSB7XG4gICAgICAgICAgICByZXEudXJsID0gYC9zcmMvbGlicmFyeVR3b1JlYWRpbmcudHMke3VybC5zbGljZShwYXRoT25seS5sZW5ndGgpfWBcbiAgICAgICAgICAgIG5leHQoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwYXRoT25seSA9PT0gJy9sYWIvYWNjb3VudC1jYXJkcy5qcycpIHtcbiAgICAgICAgICAgIHJlcS51cmwgPSBgL3NyYy9jYXJkcy9saWJyYXJ5Q2FyZHMudHMke3VybC5zbGljZShwYXRoT25seS5sZW5ndGgpfWBcbiAgICAgICAgICAgIG5leHQoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE9sZCBhY2NvdW50IHBhZ2VzIG9wZW4gdGhlaXIgY2FyZCBvdmVyIHRoZSBsaWJyYXJ5IG9yIHJlYWRlciwgYXMgaW4gdGhlIFdvcmtlci5cbiAgICAgICAgICBjb25zdCBjYXJkVGFyZ2V0ID0gcmVxLm1ldGhvZCA9PT0gJ0dFVCcgfHwgcmVxLm1ldGhvZCA9PT0gJ0hFQUQnID8gYWNjb3VudFBhZ2VSZWRpcmVjdChwYXRoT25seSwgdXJsLnNsaWNlKHBhdGhPbmx5Lmxlbmd0aCkpIDogbnVsbFxuICAgICAgICAgIGlmIChjYXJkVGFyZ2V0KSB7XG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDMwMiwgeyBMb2NhdGlvbjogY2FyZFRhcmdldCB9KVxuICAgICAgICAgICAgcmVzLmVuZCgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc29jaWFsUnVudGltZTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgICcvbGFiL3NvY2lhbC1wcm9maWxlLmpzJzogJy9zcmMvc29jaWFsL3Byb2ZpbGVQYWdlLnRzJyxcbiAgICAgICAgICAgICcvbGFiL2FkbWluLXNvY2lhbC1ydW50aW1lLmpzJzogJy9zcmMvc29jaWFsL2FkbWluU29jaWFsUGFnZS50cycsXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzb2NpYWxSdW50aW1lW3BhdGhPbmx5XSkge1xuICAgICAgICAgICAgcmVxLnVybCA9IGAke3NvY2lhbFJ1bnRpbWVbcGF0aE9ubHldfSR7dXJsLnNsaWNlKHBhdGhPbmx5Lmxlbmd0aCl9YFxuICAgICAgICAgICAgbmV4dCgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHBhdGhPbmx5ID09PSAnL2xhYi9saWJyYXJ5LWFkZC5qcycpIHtcbiAgICAgICAgICAgIHJlcS51cmwgPSBgL3NyYy9saWJyYXJ5QWRkLnRzJHt1cmwuc2xpY2UocGF0aE9ubHkubGVuZ3RoKX1gXG4gICAgICAgICAgICBuZXh0KClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBPbGQgL2xhYiBwYWdlIFVSTHMgcmVkaXJlY3QgdG8gdGhlIGNhbm9uaWNhbCBwYWdlLCBhcyBpbiB0aGUgV29ya2VyLlxuICAgICAgICAgIGNvbnN0IGxlZ2FjeVRhcmdldCA9IHJlcS5tZXRob2QgPT09ICdHRVQnIHx8IHJlcS5tZXRob2QgPT09ICdIRUFEJ1xuICAgICAgICAgICAgPyBsZWdhY3lMYWJQYWdlUmVkaXJlY3QocGF0aE9ubHksIHVybC5zbGljZShwYXRoT25seS5sZW5ndGgpKVxuICAgICAgICAgICAgOiBudWxsXG4gICAgICAgICAgaWYgKGxlZ2FjeVRhcmdldCkge1xuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCgzMDgsIHsgTG9jYXRpb246IGxlZ2FjeVRhcmdldCB9KVxuICAgICAgICAgICAgcmVzLmVuZCgpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQ2Fub25pY2FsIHBhZ2UgVVJMcyBhcmUgc2VydmVkIGZyb20gdGhlaXIgc3RhdGljIGFzc2V0IHBhZ2VzLlxuICAgICAgICAgIGNvbnN0IHBhZ2VBc3NldHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICAnL3NpZ24taW4nOiAnL2xhYi9zaWduLWluL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgJy9zaWduLWluLyc6ICcvbGFiL3NpZ24taW4vaW5kZXguaHRtbCcsXG4gICAgICAgICAgICAnL2ZlYXR1cmVkJzogJy9sYWIvZmVhdHVyZWQvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICAnL2ZlYXR1cmVkLyc6ICcvbGFiL2ZlYXR1cmVkL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgJy8nOiAnL2xhYi9saWJyYXJ5XzIvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICAnL2luZGV4Lmh0bWwnOiAnL2xhYi9saWJyYXJ5XzIvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICAnL2xpYnJhcnknOiAnL2xhYi9saWJyYXJ5XzIvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICAnL2xpYnJhcnkvJzogJy9sYWIvbGlicmFyeV8yL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgLy8gU29jaWFsIChzaGlwIDMpOiB0aGUgV29ya2VyIHNlcnZlcyB0aGlzIG9ubHkgd2hpbGUgU09DSUFMX0ZSSUVORFMgaXMgb24uXG4gICAgICAgICAgICAnL2FkbWluL3NvY2lhbCc6ICcvbGFiL2FkbWluLXNvY2lhbC9pbmRleC5odG1sJyxcbiAgICAgICAgICAgIC8vIFRoZSBQREYgcmVhZGVyJ3MgZm9sZGVyIHBhZ2UsIGFzIHRoZSBXb3JrZXIncyBhc3NldHMgc2VydmUgaXQgKHRoZSBtYXJnaW4gcHJldmlldyBmcmFtZXMgaXQpLlxuICAgICAgICAgICAgJy9sYWIvYWRkYm9vay8nOiAnL2xhYi9hZGRib29rL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgJy9sYWIvYWRkYm9vay9ib29rJzogJy9sYWIvYWRkYm9vay9ib29rLmh0bWwnLFxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGFnZUFzc2V0c1twYXRoT25seV0pIHtcbiAgICAgICAgICAgIHJlcS51cmwgPSBgJHtwYWdlQXNzZXRzW3BhdGhPbmx5XX0ke3VybC5zbGljZShwYXRoT25seS5sZW5ndGgpfWBcbiAgICAgICAgICAgIG5leHQoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIG5leHQoKVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIE1pcnJvciB0aGUgQ2xvdWRmbGFyZSB3b3JrZXIncyBjbGVhbi1VUkwgcmV3cml0ZSBmb3IgdGhlIHBlci1ib29rXG4gICAgICAgIC8vIFNFTyBwYWdlcyBzbyBsaW5rcyBsaWtlIC9yZWFkL29keXNzZXkvc3VtbWFyeSB3b3JrIGluIGxvY2FsIGRldiB0b28uXG4gICAgICAgIC8vIFdpdGhvdXQgdGhpcywgVml0ZSBmYWxscyB0aHJvdWdoIHRvIHRoZSBTUEEgYW5kIHRoZSB1c2VyIHNlZXMgdGhlXG4gICAgICAgIC8vIGJvb2stb25ib2FyZGluZyBtb2RhbCBpbnN0ZWFkIG9mIHRoZSBzdGF0aWMgU0VPIHBhZ2UuIFJlZ2V4IG11c3RcbiAgICAgICAgLy8gbWF0Y2ggdGhlIHdvcmtlcidzIHNlb01hdGNoIGluIHNyYy93b3JrZXIudHMuXG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcTogSW5jb21pbmdNZXNzYWdlLCBfcmVzOiBTZXJ2ZXJSZXNwb25zZSwgbmV4dDogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHVybCA9IHJlcS51cmwgfHwgJydcbiAgICAgICAgICBjb25zdCBtID0gdXJsLm1hdGNoKC9eXFwvcmVhZFxcLyhbYS16MC05LV0rKVxcLyhzdW1tYXJ5fGNoYXB0ZXJzfGNhc3R8dGhlbWVzfGNoYXB0ZXItXFxkKylcXC8/KFxcPy4qKT8kL2kpXG4gICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgIHJlcS51cmwgPSBgL3JlYWQvJHttWzFdfS8ke21bMl19Lmh0bWwke21bM10gfHwgJyd9YFxuICAgICAgICAgIH1cbiAgICAgICAgICBuZXh0KClcbiAgICAgICAgfSlcblxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL3ZvaWNlLXNlc3Npb24nLCBhc3luYyAocmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNSwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgb3BlbmFpS2V5ID0gZW52Lk9QRU5BSV9BUElfS0VZIHx8IHByb2Nlc3MuZW52Lk9QRU5BSV9BUElfS0VZIHx8ICcnXG4gICAgICAgICAgaWYgKCFvcGVuYWlLZXkpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAzLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSlcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1ZvaWNlIGlzIG5vdCBjb25maWd1cmVkLiBTZXQgdGhlIE9QRU5BSV9BUElfS0VZIFdvcmtlciBzZWNyZXQuJyB9KSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL3JlYWx0aW1lL2NsaWVudF9zZWNyZXRzJywge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtvcGVuYWlLZXl9YCxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbjoge1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ3JlYWx0aW1lJyxcbiAgICAgICAgICAgICAgICAgIG1vZGVsOiAnZ3B0LXJlYWx0aW1lLTIuMS1taW5pJyxcbiAgICAgICAgICAgICAgICAgIGF1ZGlvOiB7IG91dHB1dDogeyB2b2ljZTogJ21hcmluJyB9IH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKSBhcyB7IHZhbHVlPzogc3RyaW5nOyBleHBpcmVzX2F0PzogbnVtYmVyOyBlcnJvcj86IHsgbWVzc2FnZT86IHN0cmluZyB9IH1cbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2sgfHwgIWRhdGEudmFsdWUpIHtcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZChyZXNwb25zZS5zdGF0dXMgPj0gNDAwID8gcmVzcG9uc2Uuc3RhdHVzIDogNTAyLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSlcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBkYXRhLmVycm9yPy5tZXNzYWdlIHx8ICdDb3VsZCBub3Qgc3RhcnQgYSB2b2ljZSBzZXNzaW9uLicgfSkpXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KVxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHZhbHVlOiBkYXRhLnZhbHVlLFxuICAgICAgICAgICAgICBleHBpcmVzX2F0OiBkYXRhLmV4cGlyZXNfYXQgPz8gbnVsbCxcbiAgICAgICAgICAgICAgbW9kZWw6ICdncHQtcmVhbHRpbWUtMi4xLW1pbmknLFxuICAgICAgICAgICAgfSkpXG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdQcm94eSBlcnJvcicsIGRldGFpbHM6IFN0cmluZyhlcnIpIH0pKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2NoYXQnLCBhc3luYyAocmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNSlcbiAgICAgICAgICAgIHJlcy5lbmQoJ01ldGhvZCBub3QgYWxsb3dlZCcpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBhcGlLZXkgPSBlbnYuQU5USFJPUElDX0FQSV9LRVkgfHwgcHJvY2Vzcy5lbnYuQU5USFJPUElDX0FQSV9LRVkgfHwgJydcbiAgICAgICAgICBpZiAoIWFwaUtleSkge1xuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KVxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiB7IG1lc3NhZ2U6ICdBUEkga2V5IG5vdCBjb25maWd1cmVkLiBTZXQgQU5USFJPUElDX0FQSV9LRVkgaW4gLmVudicgfSB9KSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBib2R5ID0gJydcbiAgICAgICAgICByZXEub24oJ2RhdGEnLCAoY2h1bms6IEJ1ZmZlcikgPT4geyBib2R5ICs9IGNodW5rLnRvU3RyaW5nKCkgfSlcbiAgICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoYm9keSlcbiAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkuYW50aHJvcGljLmNvbS92MS9tZXNzYWdlcycsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgJ3gtYXBpLWtleSc6IGFwaUtleSxcbiAgICAgICAgICAgICAgICAgICdhbnRocm9waWMtdmVyc2lvbic6ICcyMDIzLTA2LTAxJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgIG1vZGVsOiAnY2xhdWRlLXNvbm5ldC00LTIwMjUwNTE0JyxcbiAgICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IE1hdGgubWluKHBhcnNlZC5tYXhfdG9rZW5zIHx8IDEwMjQsIDIwNDgpLFxuICAgICAgICAgICAgICAgICAgc3lzdGVtOiB0eXBlb2YgcGFyc2VkLnN5c3RlbSA9PT0gJ3N0cmluZycgPyBwYXJzZWQuc3lzdGVtLnNsaWNlKDAsIDQwMDApIDogJycsXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlczogQXJyYXkuaXNBcnJheShwYXJzZWQubWVzc2FnZXMpID8gcGFyc2VkLm1lc3NhZ2VzLnNsaWNlKDAsIDUwKSA6IFtdLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZChyZXNwb25zZS5zdGF0dXMsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KVxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSlcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnUHJveHkgZXJyb3InLCBkZXRhaWxzOiBTdHJpbmcoZXJyKSB9KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIERldiBzdHViIGZvciBjcmVhdGUtY2hlY2tvdXQgKHJldHVybnMgbW9jayBVUkwpXG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvY3JlYXRlLWNoZWNrb3V0JywgYXN5bmMgKHJlcTogSW5jb21pbmdNZXNzYWdlLCByZXM6IFNlcnZlclJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykge1xuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDUpXG4gICAgICAgICAgICByZXMuZW5kKCdNZXRob2Qgbm90IGFsbG93ZWQnKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSlcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgdXJsOiBudWxsLCBtZXNzYWdlOiAnU3RyaXBlIGNoZWNrb3V0IG5vdCBhdmFpbGFibGUgaW4gZGV2IG1vZGUuIENvbmZpZ3VyZSBTdXBhYmFzZSBhbmQgU3RyaXBlIGZvciBwcm9kdWN0aW9uLicgfSkpXG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gUHJveHkgcHJvZHVjdGlvbiBhdWRpbyBlbmRwb2ludHMgaW4gZGV2IChSMiBpcyB3b3JrZXItb25seSBpbiBwcm9kKS5cbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UsIG5leHQ6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICBjb25zdCB1cmwgPSByZXEudXJsIHx8ICcnXG4gICAgICAgICAgY29uc3QgbWFuaWZlc3RQcmVmaXggPSAnL2FwaS9hdWRpby1tYW5pZmVzdCdcbiAgICAgICAgICBjb25zdCBmaWxlUHJlZml4ID0gJy9hcGkvYXVkaW8tZmlsZSdcbiAgICAgICAgICBsZXQgdXBzdHJlYW1QYXRoOiBzdHJpbmcgfCBudWxsID0gbnVsbFxuICAgICAgICAgIGlmICh1cmwuc3RhcnRzV2l0aChtYW5pZmVzdFByZWZpeCkpIHVwc3RyZWFtUGF0aCA9IGAke21hbmlmZXN0UHJlZml4fSR7dXJsLnNsaWNlKG1hbmlmZXN0UHJlZml4Lmxlbmd0aCl9YFxuICAgICAgICAgIGVsc2UgaWYgKHVybC5zdGFydHNXaXRoKGZpbGVQcmVmaXgpKSB1cHN0cmVhbVBhdGggPSBgJHtmaWxlUHJlZml4fSR7dXJsLnNsaWNlKGZpbGVQcmVmaXgubGVuZ3RoKX1gXG4gICAgICAgICAgaWYgKCF1cHN0cmVhbVBhdGgpIHtcbiAgICAgICAgICAgIG5leHQoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB1cHN0cmVhbSA9IGF3YWl0IGZldGNoKGBodHRwczovL3RpbmN0LmFwcCR7dXBzdHJlYW1QYXRofWApXG4gICAgICAgICAgICBjb25zdCBjdHlwZSA9IHVwc3RyZWFtLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJ1xuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCh1cHN0cmVhbS5zdGF0dXMsIHsgJ0NvbnRlbnQtVHlwZSc6IGN0eXBlIH0pXG4gICAgICAgICAgICByZXMuZW5kKEJ1ZmZlci5mcm9tKGF3YWl0IHVwc3RyZWFtLmFycmF5QnVmZmVyKCkpKVxuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDIsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KVxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnQXVkaW8gcHJveHkgZXJyb3InLCBkZXRhaWxzOiBTdHJpbmcoZXJyKSB9KSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gU2VydmUgYXVkaW8gZmlsZXMgZnJvbSBwcm9qZWN0LXJvb3QgYXVkaW8vIGRpcmVjdG9yeSAobm90IGluIHB1YmxpYy8gdG8gYXZvaWQgYmxvYXRpbmcgZGlzdC8pXG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hdWRpbycsIChyZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSwgbmV4dDogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdhdWRpbycsIGRlY29kZVVSSUNvbXBvbmVudChyZXEudXJsIHx8ICcnKSlcbiAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkgJiYgZnMuc3RhdFN5bmMoZmlsZVBhdGgpLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIGNvbnN0IG1pbWVUeXBlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgICAgJy5tcDMnOiAnYXVkaW8vbXBlZycsXG4gICAgICAgICAgICAgICcud2F2JzogJ2F1ZGlvL3dhdicsXG4gICAgICAgICAgICAgICcuanNvbic6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7ICdDb250ZW50LVR5cGUnOiBtaW1lVHlwZXNbZXh0XSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyB9KVxuICAgICAgICAgICAgZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlUGF0aCkucGlwZShyZXMpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHQoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyBEZXYgc3R1YiBmb3IgYmFsYW5jZVxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2JhbGFuY2UnLCBhc3luYyAocmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UpID0+IHtcbiAgICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGJhbGFuY2VfY2VudHM6IDIwMCwgdG90YWxfdG9rZW5zX3VzZWQ6IDAgfSkpXG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDEsXG4gICAgLy8gaG9zdDogdHJ1ZSBiaW5kcyB0byAwLjAuMC4wIHNvIHBob25lcyBvbiB0aGUgc2FtZSBXaUZpIGNhbiByZWFjaCB0aGVcbiAgICAvLyBkZXYgc2VydmVyIChlLmcuIGh0dHA6Ly88bWFjLWxhbi1pcD46MzAwMSkuIFNhZmUgaW4gZGV2LiBJZiB5b3UgZXZlclxuICAgIC8vIGpvaW4gYW4gdW50cnVzdGVkIG5ldHdvcmssIGNvbW1lbnQgdGhpcyBiYWNrIG91dC5cbiAgICBob3N0OiB0cnVlLFxuICB9LFxufVxufSlcbiIsICJ7XG4gIFwidmVyc2lvblwiOiAxLFxuICBcImRhdGVcIjogXCIyMDI2LTA5LTI1XCIsXG4gIFwid2hvbGVCb29rc1wiOiBbXG4gICAgXCJkaXNjb3Vyc2Utb24taW5lcXVhbGl0eVwiLFxuICAgIFwiZ2lsZ2FtZXNoXCIsXG4gICAgXCJzZWNvbmQtdHJlYXRpc2VcIixcbiAgICBcInNvY2lhbC1jb250cmFjdFwiLFxuICAgIFwic3ltcG9zaXVtXCJcbiAgXSxcbiAgXCJlZGl0aW9uc1wiOiB7XG4gICAgXCJtYWNiZXRoL21vZGVybi1kYVwiOiB7XG4gICAgICBcInJlYXNvblwiOiBcIkltcG9ydGFudCBzcGVlY2hlcyBhcmUgbWlzc2luZywgaW5jbHVkaW5nIHRoZSBkYWdnZXIgc29saWxvcXV5LlwiLFxuICAgICAgXCJzaGEyNTZcIjogXCJjMTA2OTYyMjFhZjIyNjVkZmEwMGZkYzhmMDlhMjdkZmQxZDJhNTI4OWRhMzQ3ZDNhNmZkODJhMWRlMTI1ZDU3XCJcbiAgICB9LFxuICAgIFwiYXMteW91LWxpa2UtaXQvbW9kZXJuLWRhXCI6IHtcbiAgICAgIFwicmVhc29uXCI6IFwiVGhlIG9wZW5pbmcgc2NlbmUgaXMgbWlzc2luZyBhbmQgbGljZW5jZSBub3RpY2VzIGFwcGVhciBpbnNpZGUgdGhlIHJlYWRpbmcgdGV4dC5cIixcbiAgICAgIFwic2hhMjU2XCI6IFwiODAwNjRlMTE1YmQzMWYxOTRmYTYwZTE2ZjFlYzA4ZWU0Yjk5ZWZjNWYxY2MxOTllYzdhNGFjMzRkZDUyZDhlZlwiXG4gICAgfSxcbiAgICBcImZhdXN0LXBhcnQtMS9tb2Rlcm4tZGFcIjoge1xuICAgICAgXCJyZWFzb25cIjogXCJJbXBvcnRhbnQgcGFzc2FnZXMgYXJlIG1pc3NpbmcgYW5kIHRoaXMgZWRpdGlvbiBjb250YWlucyB0ZXh0IGluIHRoZSB3cm9uZyBsYW5ndWFnZS4gVGhlIEVuZ2xpc2ggc291cmNlIGF0dHJpYnV0aW9uIGFsc28gbmVlZHMgY29ycmVjdGlvbi5cIixcbiAgICAgIFwic2hhMjU2XCI6IFwiY2U3MTkxMDhiNDBlODlmMWYwMDhkMTZhNjJlMWZhN2RjOWUxZjE2MDBiMjQ4MTQzOTY5Njg3M2Y5YjQ3MTE5MVwiXG4gICAgfSxcbiAgICBcImplcnVzYWxlbS9tb2Rlcm4tZGFcIjoge1xuICAgICAgXCJyZWFzb25cIjogXCJQYXNzYWdlIGVuZGluZ3MgYXJlIG1pc3Npbmcgb3IgcmVwbGFjZWQgd2l0aCB0ZXh0IGFic2VudCBmcm9tIHRoZSBzb3VyY2UuXCIsXG4gICAgICBcInNoYTI1NlwiOiBcImMxNTUyZTlhOWEzYTMxMWI3NWUxZDgzZWUxMDRmZjMzYzcxYzFhNTM4YmY2OGZkNGJmZDVkNGYwMDBhNzgyMjNcIlxuICAgIH0sXG4gICAgXCJjb25mZXNzaW9ucy9tb2Rlcm4tZGFcIjoge1xuICAgICAgXCJyZWFzb25cIjogXCJCb29rcyAxMFx1MjAxMzEzIGNvbnRhaW4gcGxhY2Vob2xkZXJzIGluc3RlYWQgb2YgdGhlIHRleHQuXCIsXG4gICAgICBcInNoYTI1NlwiOiBcIjQ5MzVkNDNjYTA1Zjg3ZGE2OWI5NGMzN2QzYjIwNzllZDg1OTFhNzc2OWNmNDVmNTdhMjEzNjkwZWMwYjE5YmJcIlxuICAgIH0sXG4gICAgXCJwYXJhZGlzZS1sb3N0L21vZGVybi1kYVwiOiB7XG4gICAgICBcInJlYXNvblwiOiBcIk1ham9yIHBhc3NhZ2VzIGFyZSBtaXNzaW5nLCBpbmNsdWRpbmcgdGhlIGVuZCBvZiBCb29rIDUuXCIsXG4gICAgICBcInNoYTI1NlwiOiBcIjI2NmFkYTBhM2E3NGIwODM4YjFkZmU0YTU0YTA4ZDI5NTlmMDNkNjI3ZGRjOTU1ZTk1NGZjYjMwNmVhZDExN2NcIlxuICAgIH0sXG4gICAgXCJoZWFydC1vZi1kYXJrbmVzcy9tb2Rlcm4tZGFcIjoge1xuICAgICAgXCJyZWFzb25cIjogXCJQYXJ0IElJSSBpcyBFbmdsaXNoIHRleHQgb2ZmZXJlZCBhcyBEYW5pc2guXCIsXG4gICAgICBcInNoYTI1NlwiOiBcImIwZDQzOTUyYTEyMDgxOWE0NTE1MzgxMTNkODI5NDdmOTIyZGRhYmEwNTM1MjU3ZmIxOWJkOTA5YmE4MzQ0NDRcIlxuICAgIH0sXG4gICAgXCJkaXNjb3Vyc2Utb24taW5lcXVhbGl0eS9tb2Rlcm4tZGFcIjoge1xuICAgICAgXCJyZWFzb25cIjogXCJQYXJ0IElJIGlzIEVuZ2xpc2ggdGV4dCBvZmZlcmVkIGFzIERhbmlzaC5cIixcbiAgICAgIFwic2hhMjU2XCI6IFwiMzgzZGI5NWJiZjMwNTU5ZDZiYTQxZWIyMDQ1ZDM3ZjJhMjRkYjQ5ZTlhM2U4MGIyZTI0NmVmYjhlNmIyYzIyNFwiXG4gICAgfSxcbiAgICBcInZpbmRpY2F0aW9uLXJpZ2h0cy1vZi13b21hbi9tb2Rlcm4tZGFcIjoge1xuICAgICAgXCJyZWFzb25cIjogXCJNdWNoIG9mIHRoaXMgZWRpdGlvbiBpcyBFbmdsaXNoIHRleHQgb2ZmZXJlZCBhcyBEYW5pc2guXCIsXG4gICAgICBcInNoYTI1NlwiOiBcIjQxZWM3YzI1MTAxNWNhODA3OWRjODhlNTg0NTc1N2FjNjM0ZmJmNGM2MmY2YWIwMzE2MGVkNWU2ODZmYzg4ODBcIlxuICAgIH0sXG4gICAgXCJkaXNjb3Vyc2Utb24taW5lcXVhbGl0eS9vcmlnaW5hbC1mclwiOiB7XG4gICAgICBcInJlYXNvblwiOiBcIlJpZ2h0czogdGhlIGxpdmUgRW5nbGlzaCB0ZXh0IGlzIEcuIEQuIEguIENvbGUncyAxOTEzIHRyYW5zbGF0aW9uIChDb2xlIGQuIDE5NTkpOyBhIHB1YmxpYy1kb21haW4gcmVwbGFjZW1lbnQgaXMgYmVpbmcgYnVpbHQuXCIsXG4gICAgICBcInNoYTI1NlwiOiBcIjZkNjJkYWMxMTljMWY1Y2VhODliMTc1YTNjYzIwYWUyZjFhOWE3ODI5YzA0NzU4NDUzNjBiZTQ2NDhmOTJjYjhcIlxuICAgIH0sXG4gICAgXCJkaXNjb3Vyc2Utb24taW5lcXVhbGl0eS9vcmlnaW5hbC1lblwiOiB7XG4gICAgICBcInJlYXNvblwiOiBcIlJpZ2h0czogdGhlIGxpdmUgRW5nbGlzaCB0ZXh0IGlzIEcuIEQuIEguIENvbGUncyAxOTEzIHRyYW5zbGF0aW9uIChDb2xlIGQuIDE5NTkpOyBhIHB1YmxpYy1kb21haW4gcmVwbGFjZW1lbnQgaXMgYmVpbmcgYnVpbHQuXCIsXG4gICAgICBcInNoYTI1NlwiOiBcImQzZTdlNzk3NWFjNjM0Yjk4ZjY4NWFiY2Q3ZjZhYWU2NGIzNjIxYTc0ZGIzMWUxZDIyOWYyYjZjZmM0YmEzYmRcIlxuICAgIH0sXG4gICAgXCJkaXNjb3Vyc2Utb24taW5lcXVhbGl0eS9tb2Rlcm4tZW5cIjoge1xuICAgICAgXCJyZWFzb25cIjogXCJSaWdodHM6IHRoZSBsaXZlIEVuZ2xpc2ggdGV4dCBpcyBHLiBELiBILiBDb2xlJ3MgMTkxMyB0cmFuc2xhdGlvbiAoQ29sZSBkLiAxOTU5KTsgYSBwdWJsaWMtZG9tYWluIHJlcGxhY2VtZW50IGlzIGJlaW5nIGJ1aWx0LlwiLFxuICAgICAgXCJzaGEyNTZcIjogXCI3ODM1NmU0ZmZkZjYyZWMyOGMwNTZmZTg3MTUyMTk2N2RhNDI4ZDMxZmFmZTY5NGNhZDhiMDY0ZjcwMTljNjJmXCJcbiAgICB9LFxuICAgIFwiZ2lsZ2FtZXNoL29yaWdpbmFsLWVuXCI6IHtcbiAgICAgIFwicmVhc29uXCI6IFwiUmlnaHRzOiB0aGUgbGl2ZSBFbmdsaXNoIHRleHQgaXMgbm90IGNsZWFyZWQgZm9yIFRpbmN0OyBhIHB1YmxpYy1kb21haW4gcmVwbGFjZW1lbnQgaXMgYmVpbmcgYnVpbHQuXCIsXG4gICAgICBcInNoYTI1NlwiOiBcIjFjOTg4NmUyYjM0MTE4N2MzZGQyYjBlNGZiY2JmYzI4NWU2NWY3NjMxYWU2OTQ0ZDA5NDQyNGFjNTBlZjMxY2NcIlxuICAgIH0sXG4gICAgXCJnaWxnYW1lc2gvbW9kZXJuLWVuXCI6IHtcbiAgICAgIFwicmVhc29uXCI6IFwiUmlnaHRzOiB0aGUgbGl2ZSBFbmdsaXNoIHRleHQgaXMgbm90IGNsZWFyZWQgZm9yIFRpbmN0OyBhIHB1YmxpYy1kb21haW4gcmVwbGFjZW1lbnQgaXMgYmVpbmcgYnVpbHQuXCIsXG4gICAgICBcInNoYTI1NlwiOiBcIjQxOWE0M2IwNWJmY2JmODRkY2U5ZjE5NDgxNThhOGYzZDM0YTRiNmRjNDFjOTM3NjdjODI3YWVkZTg3YWQ2M2NcIlxuICAgIH0sXG4gICAgXCJzZWNvbmQtdHJlYXRpc2Uvb3JpZ2luYWwtZW5cIjoge1xuICAgICAgXCJyZWFzb25cIjogXCJIZWxkIG91dCBvZiB0aGUgbGlicmFyeSBhdCBBbmRlcnMncyBpbnN0cnVjdGlvbiAoMjAyNi0xMC0wMiByaWdodHMgaG9sZHMpLlwiLFxuICAgICAgXCJzaGEyNTZcIjogXCJlZmJkN2NhYmQxNGVkOTlmOThhYWJhZTdhOTVmNDhlODEwMmRiNzVmMGI3YWFhZTAwNTRkMGZmZTQ2NzViMGQwXCJcbiAgICB9LFxuICAgIFwic2Vjb25kLXRyZWF0aXNlL21vZGVybi1lblwiOiB7XG4gICAgICBcInJlYXNvblwiOiBcIkhlbGQgb3V0IG9mIHRoZSBsaWJyYXJ5IGF0IEFuZGVycydzIGluc3RydWN0aW9uICgyMDI2LTEwLTAyIHJpZ2h0cyBob2xkcykuXCIsXG4gICAgICBcInNoYTI1NlwiOiBcImY2Nzk5ZmEyNWEyOGQ5M2NlYzYwMjliNzZlOTI5Yzc4OGM0ZDEyM2QwMjQ1MGI1MTdmZDEyOGMzYTczZTZkZDJcIlxuICAgIH0sXG4gICAgXCJzb2NpYWwtY29udHJhY3Qvb3JpZ2luYWwtZW5cIjoge1xuICAgICAgXCJyZWFzb25cIjogXCJSaWdodHM6IHRoZSBsaXZlIEVuZ2xpc2ggdGV4dCBpcyBHLiBELiBILiBDb2xlJ3MgMTkxMyB0cmFuc2xhdGlvbiAoQ29sZSBkLiAxOTU5KTsgYSBwdWJsaWMtZG9tYWluIHJlcGxhY2VtZW50IGlzIGJlaW5nIGJ1aWx0LlwiLFxuICAgICAgXCJzaGEyNTZcIjogXCI3YmY1YWJhYmI3YzRkZmUxY2VjMDIzMGQ0NGY2NDk2MGQ4YjQ0N2M0ODAyYjZhNzE2YjUyZDc3MGE1ODU0MTU3XCJcbiAgICB9LFxuICAgIFwic29jaWFsLWNvbnRyYWN0L21vZGVybi1lblwiOiB7XG4gICAgICBcInJlYXNvblwiOiBcIlJpZ2h0czogdGhlIGxpdmUgRW5nbGlzaCB0ZXh0IGlzIEcuIEQuIEguIENvbGUncyAxOTEzIHRyYW5zbGF0aW9uIChDb2xlIGQuIDE5NTkpOyBhIHB1YmxpYy1kb21haW4gcmVwbGFjZW1lbnQgaXMgYmVpbmcgYnVpbHQuXCIsXG4gICAgICBcInNoYTI1NlwiOiBcImNmN2ZhY2I3N2JmYzViYWZjOTljYjRkN2EyMzZmZDRmNTlkNWY5ZmZjNDU1NGM2ZjA2M2VlOGRhYWUyNzM4NDNcIlxuICAgIH0sXG4gICAgXCJzeW1wb3NpdW0vb3JpZ2luYWwtZW5cIjoge1xuICAgICAgXCJyZWFzb25cIjogXCJIZWxkIG91dCBvZiB0aGUgbGlicmFyeSBhdCBBbmRlcnMncyBpbnN0cnVjdGlvbiAoMjAyNi0xMC0wMiByaWdodHMgaG9sZHMpLlwiLFxuICAgICAgXCJzaGEyNTZcIjogXCIzNTIxYTEyZDVkNWFjZDZkNGFjODNmNTM3NDcxOTJjNWFlNTkyZjdiZjVlOTY1YzljOWJmZjg4MTk2NTQ5NWE2XCJcbiAgICB9LFxuICAgIFwic3ltcG9zaXVtL21vZGVybi1lblwiOiB7XG4gICAgICBcInJlYXNvblwiOiBcIkhlbGQgb3V0IG9mIHRoZSBsaWJyYXJ5IGF0IEFuZGVycydzIGluc3RydWN0aW9uICgyMDI2LTEwLTAyIHJpZ2h0cyBob2xkcykuXCIsXG4gICAgICBcInNoYTI1NlwiOiBcIjFlOTcwYjdiZWIzZjA5ODA5NWVjZjFhOWZjN2Q3OGE4ODU1ZDc1ZTZmZmMzYmJhMTRlZGM2OWRiMGUwNTM3NGZcIlxuICAgIH1cbiAgfSxcbiAgXCJ3aG9sZUJvb2tSZWFzb25zXCI6IHtcbiAgICBcImRpc2NvdXJzZS1vbi1pbmVxdWFsaXR5XCI6IFwiUmlnaHRzOiB0aGUgbGl2ZSBFbmdsaXNoIHRleHQgaXMgRy4gRC4gSC4gQ29sZSdzIDE5MTMgdHJhbnNsYXRpb24gKENvbGUgZC4gMTk1OSk7IGEgcHVibGljLWRvbWFpbiByZXBsYWNlbWVudCBpcyBiZWluZyBidWlsdC5cIixcbiAgICBcImdpbGdhbWVzaFwiOiBcIlJpZ2h0czogdGhlIGxpdmUgRW5nbGlzaCB0ZXh0IGlzIG5vdCBjbGVhcmVkIGZvciBUaW5jdDsgYSBwdWJsaWMtZG9tYWluIHJlcGxhY2VtZW50IGlzIGJlaW5nIGJ1aWx0LlwiLFxuICAgIFwic2Vjb25kLXRyZWF0aXNlXCI6IFwiSGVsZCBvdXQgb2YgdGhlIGxpYnJhcnkgYXQgQW5kZXJzJ3MgaW5zdHJ1Y3Rpb24gKDIwMjYtMTAtMDIgcmlnaHRzIGhvbGRzKS5cIixcbiAgICBcInNvY2lhbC1jb250cmFjdFwiOiBcIlJpZ2h0czogdGhlIGxpdmUgRW5nbGlzaCB0ZXh0IGlzIEcuIEQuIEguIENvbGUncyAxOTEzIHRyYW5zbGF0aW9uIChDb2xlIGQuIDE5NTkpOyBhIHB1YmxpYy1kb21haW4gcmVwbGFjZW1lbnQgaXMgYmVpbmcgYnVpbHQuXCIsXG4gICAgXCJzeW1wb3NpdW1cIjogXCJIZWxkIG91dCBvZiB0aGUgbGlicmFyeSBhdCBBbmRlcnMncyBpbnN0cnVjdGlvbiAoMjAyNi0xMC0wMiByaWdodHMgaG9sZHMpLlwiXG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2RhdGFcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9kYXRhL2VkaXRpb25BdmFpbGFiaWxpdHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2RhdGEvZWRpdGlvbkF2YWlsYWJpbGl0eS50c1wiO2ltcG9ydCBtYW5pZmVzdCBmcm9tICcuL2VkaXRpb25BdmFpbGFiaWxpdHkuanNvbidcblxuLyoqIFRlbXBvcmFyeSBob2xkcyBwcmVzZXJ2ZSByZWdpc3RyeSBpZGVudGl0aWVzLCB0ZXh0IGFzc2V0cyBhbmQgYWxsIHNhdmVkIGRhdGEuXG4gKiBUaGV5IGhhdmUgbm8gc3VjY2Vzc29yOiBuZXZlciBwYXNzIHRoZXNlIHRocm91Z2ggbWlncmF0ZVdpdGhoZWxkRWRpdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IFRFTVBPUkFSWV9FRElUSU9OX0hPTERTOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCB7IHJlYXNvbjogc3RyaW5nIH0+PiA9IG1hbmlmZXN0LmVkaXRpb25zXG4vKipcbiAqIFRoZSBvbmx5IERhbmlzaCBlZGl0aW9ucyBUaW5jdCBvZmZlcnM6IGEgZGVsaWJlcmF0ZSwgbmFycm93IGV4Y2VwdGlvbiB0byB0aGVcbiAqIERhbmlzaCB3aXRoZHJhd2FsIChBbmRlcnMsIDIwMjYtMTAtMTA6IFRvIHRoZSBMaWdodGhvdXNlIGluIERhbmlzaDsgMjAyNi0xMC0xOTogQSBMaXR0bGUgUHJpbmNlc3MsIEFyb3VuZCB0aGUgV29ybGQgaW4gRWlnaHR5IERheXMgYW5kIFRoZSBKdW5nbGUgQm9vazsgbGF0ZXIgMjAyNi0xMC0xOTogR3JpbW1zJyBGYWlyeSBUYWxlcyBhbmQgVGhlIEFyYWJpYW4gTmlnaHRzKS4gRXZlcnlcbiAqIG90aGVyIGAtZGFgIGVkaXRpb24gc3RheXMgd2l0aGRyYXduLiBMaXN0IGV4YWN0IGBib29rSWQvZWRpdGlvbktleWBcbiAqIGlkZW50aXRpZXM7IG5ldmVyIGluZmVyIGFuIGV4Y2VwdGlvbiBmcm9tIHRoZSBsYW5ndWFnZS5cbiAqL1xuZXhwb3J0IGNvbnN0IE9GRkVSRURfREFOSVNIX0VESVRJT05TOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldChbXG4gICd0by10aGUtbGlnaHRob3VzZS9tb2Rlcm4tZGEnLFxuICAnYS1saXR0bGUtcHJpbmNlc3MvbW9kZXJuLWRhJyxcbiAgJ2Fyb3VuZC10aGUtd29ybGQtODAtZGF5cy9tb2Rlcm4tZGEnLFxuICAnanVuZ2xlLWJvb2svbW9kZXJuLWRhJyxcbiAgJ2dyaW1tcy1mYWlyeS10YWxlcy9tb2Rlcm4tZGEnLFxuICAnYXJhYmlhbi1uaWdodHMvbW9kZXJuLWRhJyxcbl0pXG5leHBvcnQgY29uc3QgaXNPZmZlcmVkRGFuaXNoRWRpdGlvbiA9IChib29rSWQ6IHN0cmluZywgZWRpdGlvbktleTogc3RyaW5nIHwgdW5kZWZpbmVkKTogYm9vbGVhbiA9PlxuICBCb29sZWFuKGVkaXRpb25LZXkpICYmIE9GRkVSRURfREFOSVNIX0VESVRJT05TLmhhcyhib29rSWQgKyAnLycgKyBlZGl0aW9uS2V5KVxuLyoqIFdoZXRoZXIgVGluY3Qgb2ZmZXJzIGFuIGVkaXRpb24ncyBsYW5ndWFnZTogZXZlcnkgbm9uLURhbmlzaCBlZGl0aW9uLCBhbmQgRGFuaXNoIG9ubHkgYnkgdGhlIGFsbG93bGlzdCBhYm92ZS4gKi9cbmV4cG9ydCBjb25zdCBpc0VkaXRpb25MYW5ndWFnZU9mZmVyZWQgPSAoYm9va0lkOiBzdHJpbmcsIGVkaXRpb246IHsga2V5OiBzdHJpbmc7IGxhbmd1YWdlPzogc3RyaW5nIH0pOiBib29sZWFuID0+XG4gIGVkaXRpb24ubGFuZ3VhZ2UgIT09ICdkYScgfHwgaXNPZmZlcmVkRGFuaXNoRWRpdGlvbihib29rSWQsIGVkaXRpb24ua2V5KVxuZXhwb3J0IGZ1bmN0aW9uIGVkaXRpb25Ib2xkKGJvb2tJZDogc3RyaW5nLCBlZGl0aW9uS2V5OiBzdHJpbmcgfCB1bmRlZmluZWQpOiB7IHJlYXNvbjogc3RyaW5nIH0gfCB1bmRlZmluZWQge1xuICBpZiAoIWVkaXRpb25LZXkpIHJldHVybiB1bmRlZmluZWRcbiAgLy8gUmV0YWluIHRoZSBpZGVudGl0eSBhbmQgYXNzZXQgZm9yIGV4aXN0aW5nIHJlYWRlcnMnIGV4cGxpY2l0IHJlY292ZXJ5LlxuICAvLyBBIGxhbmd1YWdlIHdpdGhkcmF3YWwgbXVzdCBuZXZlciBtYXAgc2F2ZWQgY29vcmRpbmF0ZXMgb250byBhbm90aGVyIHRleHQuXG4gIC8vIFRoZSBhbGxvd2xpc3QgaXMgY2hlY2tlZCBmaXJzdCBhbmQgb25seSBsaWZ0cyB0aGUgbGFuZ3VhZ2Ugd2l0aGRyYXdhbDpcbiAgLy8gYSBtYW5pZmVzdCBob2xkIG9uIGFuIG9mZmVyZWQgZWRpdGlvbiBzdGlsbCBhcHBsaWVzLlxuICBpZiAoZWRpdGlvbktleS5lbmRzV2l0aCgnLWRhJykgJiYgIWlzT2ZmZXJlZERhbmlzaEVkaXRpb24oYm9va0lkLCBlZGl0aW9uS2V5KSkgcmV0dXJuIHsgcmVhc29uOiAnRGFuaXNoIGVkaXRpb25zIGFyZSBubyBsb25nZXIgb2ZmZXJlZCBpbiBUaW5jdC4gWW91ciBvcmlnaW5hbCB0ZXh0LCByZWFkaW5nIHBsYWNlLCBoaWdobGlnaHRzIGFuZCBub3RlcyByZW1haW4gcHJlc2VydmVkLicgfVxuICByZXR1cm4gVEVNUE9SQVJZX0VESVRJT05fSE9MRFNbYm9va0lkICsgJy8nICsgZWRpdGlvbktleV1cbn1cbmV4cG9ydCBjb25zdCBpc0Jvb2tUZW1wb3JhcmlseUhlbGQgPSAoYm9va0lkOiBzdHJpbmcpOiBib29sZWFuID0+IG1hbmlmZXN0Lndob2xlQm9va3MuaW5jbHVkZXMoYm9va0lkKVxuZXhwb3J0IGNvbnN0IFRFTVBPUkFSWV9IT0xEX05PVElDRSA9ICdUaGlzIGVkaXRpb24gaXMgbm90IGN1cnJlbnRseSBvZmZlcmVkLiBZb3VyIHNhdmVkIHBsYWNlLCBoaWdobGlnaHRzLCBub3RlcyBhbmQgcmVhZGluZyBoaXN0b3J5IGFyZSByZXRhaW5lZC4gV2UgaGF2ZSBub3Qgc3dpdGNoZWQgeW91ciBlZGl0aW9uLidcbiIsICJ7XG4gIFwiaGVsZF9ib29rc1wiOiBbXG4gICAgXCJkZW1vY3JhY3ktaW4tYW1lcmljYVwiLFxuICAgIFwiZXNzYXlzLW1vbnRhaWduZVwiLFxuICAgIFwiZmF1c3QtcGFydC0xXCIsXG4gICAgXCJpdmFuLWlseWljaFwiLFxuICAgIFwibWVhc3VyZS1mb3ItbWVhc3VyZVwiLFxuICAgIFwibWVycnktd2l2ZXMtb2Ytd2luZHNvclwiLFxuICAgIFwidWx5c3Nlc1wiLFxuICAgIFwid2FyLWFuZC1wZWFjZVwiXG4gIF0sXG4gIFwiZWxpZ2libGVfZWRpdGlvbnNcIjogW1xuICAgIFwiYS1saXR0bGUtcHJpbmNlc3MvbW9kZXJuLWVuXCIsXG4gICAgXCJhLWxpdHRsZS1wcmluY2Vzcy9vcmlnaW5hbC1lblwiLFxuICAgIFwiYWxpY2UtaW4td29uZGVybGFuZC9tb2Rlcm4tZW5cIixcbiAgICBcImFsaWNlLWluLXdvbmRlcmxhbmQvb3JpZ2luYWwtZW5cIixcbiAgICBcImFubmEta2FyZW5pbmEvbW9kZXJuLWVuXCIsXG4gICAgXCJhbnRpZ29uZS9tb2Rlcm4tZW5cIixcbiAgICBcImFudGlnb25lL29yaWdpbmFsLWVuXCIsXG4gICAgXCJhbnRvbnktYW5kLWNsZW9wYXRyYS9tb2Rlcm4tZW5cIixcbiAgICBcImFudG9ueS1hbmQtY2xlb3BhdHJhL29yaWdpbmFsLWVuXCIsXG4gICAgXCJhcG9sb2d5L29yaWdpbmFsLWVuXCIsXG4gICAgXCJhcmFiaWFuLW5pZ2h0cy9tb2Rlcm4tZW5cIixcbiAgICBcImFyYWJpYW4tbmlnaHRzL29yaWdpbmFsLWVuXCIsXG4gICAgXCJhcmlzdG90bGUtcG9saXRpY3MvbW9kZXJuLWVuXCIsXG4gICAgXCJhcm91bmQtdGhlLXdvcmxkLTgwLWRheXMvb3JpZ2luYWwtZW5cIixcbiAgICBcImFzLXlvdS1saWtlLWl0L29yaWdpbmFsLWVuXCIsXG4gICAgXCJiYWNjaGFlL21vZGVybi1lblwiLFxuICAgIFwiYmFjY2hhZS9vcmlnaW5hbC1lblwiLFxuICAgIFwiYmVvd3VsZi9tb2Rlcm4tZW5cIixcbiAgICBcImJlb3d1bGYvb3JpZ2luYWwtZW5cIixcbiAgICBcImJleW9uZC1nb29kLWFuZC1ldmlsL29yaWdpbmFsLWVuXCIsXG4gICAgXCJiaWJsZS9ic2ItZW5cIixcbiAgICBcImJpYmxlL2tqdi1lblwiLFxuICAgIFwiYmlibGUvd2ViLWVuXCIsXG4gICAgXCJiaWJsZS93ZWJjLWVuXCIsXG4gICAgXCJib2xkLWNvbmplY3R1cmVzLXZvbHVtZS0xL29yaWdpbmFsLWVuXCIsXG4gICAgXCJib2xkLWNvbmplY3R1cmVzLXZvbHVtZS0yL29yaWdpbmFsLWVuXCIsXG4gICAgXCJicm90aGVycy1rYXJhbWF6b3YvbW9kZXJuLWVuXCIsXG4gICAgXCJicm90aGVycy1rYXJhbWF6b3Yvb3JpZ2luYWwtZW5cIixcbiAgICBcImNhbmRpZGUvb3JpZ2luYWwtZW5cIixcbiAgICBcImNvbWVkeS1vZi1lcnJvcnMvbW9kZXJuLWVuXCIsXG4gICAgXCJjb21lZHktb2YtZXJyb3JzL29yaWdpbmFsLWVuXCIsXG4gICAgXCJjb21tdW5pc3QtbWFuaWZlc3RvL21vZGVybi1lblwiLFxuICAgIFwiY29tbXVuaXN0LW1hbmlmZXN0by9vcmlnaW5hbC1lblwiLFxuICAgIFwiY29uZmVzc2lvbnMvbW9kZXJuLWVuXCIsXG4gICAgXCJjb25mZXNzaW9ucy9vcmlnaW5hbC1lblwiLFxuICAgIFwiY29yaW9sYW51cy9tb2Rlcm4tZW5cIixcbiAgICBcImNvcmlvbGFudXMvb3JpZ2luYWwtZW5cIixcbiAgICBcImNyaW1lLWFuZC1wdW5pc2htZW50L29yaWdpbmFsLWVuXCIsXG4gICAgXCJjcml0by9tb2Rlcm4tZW5cIixcbiAgICBcImNyaXRvL29yaWdpbmFsLWVuXCIsXG4gICAgXCJjeW1iZWxpbmUvbW9kZXJuLWVuXCIsXG4gICAgXCJjeW1iZWxpbmUvb3JpZ2luYWwtZW5cIixcbiAgICBcImRlc2NhcnRlcy1tZWRpdGF0aW9ucy9vcmlnaW5hbC1lblwiLFxuICAgIFwiZGlzY291cnNlLW9uLWluZXF1YWxpdHkvb3JpZ2luYWwtZW5cIixcbiAgICBcImRpdmluZS1jb21lZHkvb3JpZ2luYWwtZW5cIixcbiAgICBcImRvbi1xdWl4b3RlL21vZGVybi1lblwiLFxuICAgIFwiZG9uLXF1aXhvdGUvb3JpZ2luYWwtZW5cIixcbiAgICBcImZlYXItYW5kLXRyZW1ibGluZy9tb2Rlcm4tZW5cIixcbiAgICBcImZlYXItYW5kLXRyZW1ibGluZy9vcmlnaW5hbC1lblwiLFxuICAgIFwiZmVkZXJhbGlzdC1wYXBlcnMvbW9kZXJuLWVuXCIsXG4gICAgXCJmZWRlcmFsaXN0LXBhcGVycy9vcmlnaW5hbC1lblwiLFxuICAgIFwiZnJhbmtlbnN0ZWluL29yaWdpbmFsLWVuXCIsXG4gICAgXCJmcmVkZXJpY2stZG91Z2xhc3MvbW9kZXJuLWVuXCIsXG4gICAgXCJmcmVkZXJpY2stZG91Z2xhc3Mvb3JpZ2luYWwtZW5cIixcbiAgICBcImdlbmVhbG9neS1vZi1tb3JhbHMvbW9kZXJuLWVuXCIsXG4gICAgXCJnZW5lYWxvZ3ktb2YtbW9yYWxzL29yaWdpbmFsLWVuXCIsXG4gICAgXCJnaWxnYW1lc2gvb3JpZ2luYWwtZW5cIixcbiAgICBcImdyZWF0LWV4cGVjdGF0aW9ucy9tb2Rlcm4tZW5cIixcbiAgICBcImdyaW1tcy1mYWlyeS10YWxlcy9tb2Rlcm4tZW5cIixcbiAgICBcImdyaW1tcy1mYWlyeS10YWxlcy9vcmlnaW5hbC1lblwiLFxuICAgIFwiaGFtbGV0L21vZGVybi1lblwiLFxuICAgIFwiaGFtbGV0L29yaWdpbmFsLWVuXCIsXG4gICAgXCJoZWFydC1vZi1kYXJrbmVzcy9vcmlnaW5hbC1lblwiLFxuICAgIFwiaGVucnktaXYtcGFydC0yL21vZGVybi1lblwiLFxuICAgIFwiaGVucnktaXYtcGFydC0yL29yaWdpbmFsLWVuXCIsXG4gICAgXCJoZW5yeS12L21vZGVybi1lblwiLFxuICAgIFwiaGVucnktdi9vcmlnaW5hbC1lblwiLFxuICAgIFwiaHVtZS1lbnF1aXJ5L21vZGVybi1lblwiLFxuICAgIFwiaHVtZS1lbnF1aXJ5L29yaWdpbmFsLWVuXCIsXG4gICAgXCJpbGlhZC9tb2Rlcm4tZW5cIixcbiAgICBcImlsaWFkL29yaWdpbmFsLWVuXCIsXG4gICAgXCJpbWl0YXRpb24tb2YtY2hyaXN0L21vZGVybi1lblwiLFxuICAgIFwiaW1pdGF0aW9uLW9mLWNocmlzdC9vcmlnaW5hbC1lblwiLFxuICAgIFwiamFuZS1leXJlL29yaWdpbmFsLWVuXCIsXG4gICAgXCJqZWt5bGwtYW5kLWh5ZGUvb3JpZ2luYWwtZW5cIixcbiAgICBcImplcnVzYWxlbS9tb2Rlcm4tZW5cIixcbiAgICBcImplcnVzYWxlbS9vcmlnaW5hbC1lblwiLFxuICAgIFwianVsaXVzLWNhZXNhci9vcmlnaW5hbC1lblwiLFxuICAgIFwianVuZ2xlLWJvb2svbW9kZXJuLWVuXCIsXG4gICAgXCJqdW5nbGUtYm9vay9vcmlnaW5hbC1lblwiLFxuICAgIFwia2FudC1ncm91bmR3b3JrL21vZGVybi1lblwiLFxuICAgIFwia2FudC1ncm91bmR3b3JrL29yaWdpbmFsLWVuXCIsXG4gICAgXCJraW5nLWxlYXIvbW9kZXJuLWVuXCIsXG4gICAgXCJraW5nLWxlYXIvb3JpZ2luYWwtZW5cIixcbiAgICBcImxldmlhdGhhbi9tb2Rlcm4tZW5cIixcbiAgICBcImxldmlhdGhhbi9vcmlnaW5hbC1lblwiLFxuICAgIFwibG9yZHMtb2YtdGhlLWNvc21vcy9vcmlnaW5hbC1lblwiLFxuICAgIFwibWFjYmV0aC9tb2Rlcm4tZW5cIixcbiAgICBcIm1hY2JldGgvb3JpZ2luYWwtZW5cIixcbiAgICBcIm1hZ25hLWNhcnRhL21vZGVybi1lblwiLFxuICAgIFwibWFnbmEtY2FydGEvb3JpZ2luYWwtZW5cIixcbiAgICBcIm1lZGVhL21vZGVybi1lblwiLFxuICAgIFwibWVkZWEvb3JpZ2luYWwtZW5cIixcbiAgICBcIm1lZGl0YXRpb25zL29yaWdpbmFsLWVuXCIsXG4gICAgXCJtZXJjaGFudC1vZi12ZW5pY2Uvb3JpZ2luYWwtZW5cIixcbiAgICBcIm1pZGRsZW1hcmNoL21vZGVybi1lblwiLFxuICAgIFwibWlkZGxlbWFyY2gvb3JpZ2luYWwtZW5cIixcbiAgICBcIm1pZHN1bW1lci9tb2Rlcm4tZW5cIixcbiAgICBcIm1pZHN1bW1lci9vcmlnaW5hbC1lblwiLFxuICAgIFwibW9ieS1kaWNrL21vZGVybi1lblwiLFxuICAgIFwibW9ieS1kaWNrL29yaWdpbmFsLWVuXCIsXG4gICAgXCJtdWNoLWFkby1hYm91dC1ub3RoaW5nL21vZGVybi1lblwiLFxuICAgIFwibXVjaC1hZG8tYWJvdXQtbm90aGluZy9vcmlnaW5hbC1lblwiLFxuICAgIFwibmljb21hY2hlYW4tZXRoaWNzL21vZGVybi1lblwiLFxuICAgIFwibmljb21hY2hlYW4tZXRoaWNzL29yaWdpbmFsLWVuXCIsXG4gICAgXCJuaWVscy1seWhuZS9tb2Rlcm4tZW5cIixcbiAgICBcIm5vdGVzLWZyb20tdW5kZXJncm91bmQvbW9kZXJuLWVuXCIsXG4gICAgXCJub3Rlcy1mcm9tLXVuZGVyZ3JvdW5kL29yaWdpbmFsLWVuXCIsXG4gICAgXCJvZHlzc2V5L21vZGVybi1lblwiLFxuICAgIFwib2R5c3NleS9vcmlnaW5hbC1lblwiLFxuICAgIFwib2VkaXB1cy1hdC1jb2xvbnVzL21vZGVybi1lblwiLFxuICAgIFwib2VkaXB1cy1hdC1jb2xvbnVzL29yaWdpbmFsLWVuXCIsXG4gICAgXCJvZWRpcHVzLXJleC9tb2Rlcm4tZW5cIixcbiAgICBcIm9uLWxpYmVydHkvbW9kZXJuLWVuXCIsXG4gICAgXCJvbi1saWJlcnR5L29yaWdpbmFsLWVuXCIsXG4gICAgXCJvcmVzdGVpYS9tb2Rlcm4tZW5cIixcbiAgICBcIm9yZXN0ZWlhL29yaWdpbmFsLWVuXCIsXG4gICAgXCJvdGhlbGxvL21vZGVybi1lblwiLFxuICAgIFwib3RoZWxsby9vcmlnaW5hbC1lblwiLFxuICAgIFwicGFyYWRpc2UtbG9zdC9vcmlnaW5hbC1lblwiLFxuICAgIFwicGVsb3Bvbm5lc2lhbi13YXIvbW9kZXJuLWVuXCIsXG4gICAgXCJwZWxvcG9ubmVzaWFuLXdhci9vcmlnaW5hbC1lblwiLFxuICAgIFwicGhhZWRvL21vZGVybi1lblwiLFxuICAgIFwicGhhZWRvL29yaWdpbmFsLWVuXCIsXG4gICAgXCJwaGFlZHJ1cy9tb2Rlcm4tZW5cIixcbiAgICBcInBoYWVkcnVzL29yaWdpbmFsLWVuXCIsXG4gICAgXCJwb2V0aWNzL21vZGVybi1lblwiLFxuICAgIFwicG9ldGljcy9vcmlnaW5hbC1lblwiLFxuICAgIFwicHJpZGUtYW5kLXByZWp1ZGljZS9vcmlnaW5hbC1lblwiLFxuICAgIFwicmljaGFyZC1paWkvbW9kZXJuLWVuXCIsXG4gICAgXCJyaWNoYXJkLWlpaS9vcmlnaW5hbC1lblwiLFxuICAgIFwicm9tZW8tYW5kLWp1bGlldC9tb2Rlcm4tZW5cIixcbiAgICBcInJvbWVvLWFuZC1qdWxpZXQvb3JpZ2luYWwtZW5cIixcbiAgICBcInNlY29uZC10cmVhdGlzZS9tb2Rlcm4tZW5cIixcbiAgICBcInNlY29uZC10cmVhdGlzZS9vcmlnaW5hbC1lblwiLFxuICAgIFwic2Vuc2UtYW5kLXNlbnNpYmlsaXR5L21vZGVybi1lblwiLFxuICAgIFwic2Vuc2UtYW5kLXNlbnNpYmlsaXR5L29yaWdpbmFsLWVuXCIsXG4gICAgXCJzb2NpYWwtY29udHJhY3QvbW9kZXJuLWVuXCIsXG4gICAgXCJzb2NpYWwtY29udHJhY3Qvb3JpZ2luYWwtZW5cIixcbiAgICBcInN5bXBvc2l1bS9tb2Rlcm4tZW5cIixcbiAgICBcInN5bXBvc2l1bS9vcmlnaW5hbC1lblwiLFxuICAgIFwidGFtaW5nLW9mLXRoZS1zaHJldy9tb2Rlcm4tZW5cIixcbiAgICBcInRhbWluZy1vZi10aGUtc2hyZXcvb3JpZ2luYWwtZW5cIixcbiAgICBcInRoZS1hZW5laWQvbW9kZXJuLWVuXCIsXG4gICAgXCJ0aGUtYWVuZWlkL29yaWdpbmFsLWVuXCIsXG4gICAgXCJ0aGUtYXJ0LW9mLXdhci9tb2Rlcm4tZW5cIixcbiAgICBcInRoZS1hcnQtb2Ytd2FyL29yaWdpbmFsLWVuXCIsXG4gICAgXCJ0aGUtYXdha2VuaW5nL21vZGVybi1lblwiLFxuICAgIFwidGhlLWF3YWtlbmluZy9vcmlnaW5hbC1lblwiLFxuICAgIFwidGhlLWZhcnRoZXN0LXJlYWNoZXMvb3JpZ2luYWwtZW5cIixcbiAgICBcInRoZS1oaXN0b3JpZXMvb3JpZ2luYWwtZW5cIixcbiAgICBcInRoZS1tYW51YWwvbW9kZXJuLWVuXCIsXG4gICAgXCJ0aGUtbWFudWFsL29yaWdpbmFsLWVuXCIsXG4gICAgXCJ0aGUtcHJpbmNlL29yaWdpbmFsLWVuXCIsXG4gICAgXCJ0aGUtcmVwdWJsaWMvb3JpZ2luYWwtZW5cIixcbiAgICBcInRoZS1zb3ZlcmVpZ24tY2hpbGQvb3JpZ2luYWwtZW5cIixcbiAgICBcInRoZS10ZW1wZXN0L21vZGVybi1lblwiLFxuICAgIFwidGhlLXRlbXBlc3Qvb3JpZ2luYWwtZW5cIixcbiAgICBcInRvLXRoZS1saWdodGhvdXNlL21vZGVybi1lblwiLFxuICAgIFwidG8tdGhlLWxpZ2h0aG91c2Uvb3JpZ2luYWwtZW5cIixcbiAgICBcInR3ZWxmdGgtbmlnaHQvbW9kZXJuLWVuXCIsXG4gICAgXCJ0d2VsZnRoLW5pZ2h0L29yaWdpbmFsLWVuXCIsXG4gICAgXCJ1cy1mb3VuZGluZy1kb2N1bWVudHMvbW9kZXJuLWVuXCIsXG4gICAgXCJ1cy1mb3VuZGluZy1kb2N1bWVudHMvb3JpZ2luYWwtZW5cIixcbiAgICBcInV0aWxpdGFyaWFuaXNtL29yaWdpbmFsLWVuXCIsXG4gICAgXCJ2aW5kaWNhdGlvbi1yaWdodHMtb2Ytd29tYW4vbW9kZXJuLWVuXCIsXG4gICAgXCJ2aW5kaWNhdGlvbi1yaWdodHMtb2Ytd29tYW4vb3JpZ2luYWwtZW5cIixcbiAgICBcIndhbGRlbi9tb2Rlcm4tZW5cIixcbiAgICBcIndhbGRlbi9vcmlnaW5hbC1lblwiLFxuICAgIFwid2VhbHRoLW9mLW5hdGlvbnMvbW9kZXJuLWVuXCIsXG4gICAgXCJ3ZXJ0aGVyL21vZGVybi1lblwiLFxuICAgIFwid2VydGhlci9vcmlnaW5hbC1lblwiLFxuICAgIFwid2ludGVycy10YWxlL29yaWdpbmFsLWVuXCIsXG4gICAgXCJ3dXRoZXJpbmctaGVpZ2h0cy9tb2Rlcm4tZW5cIixcbiAgICBcInd1dGhlcmluZy1oZWlnaHRzL29yaWdpbmFsLWVuXCJcbiAgXSxcbiAgXCJoZWxkX2VkaXRpb25zXCI6IFtcbiAgICB7XG4gICAgICBcImtleVwiOiBcImFubmEta2FyZW5pbmEvb3JpZ2luYWwtZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiYXBvbG9neS9tb2Rlcm4tZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJ3cm9uZ190ZXh0X2F1ZGlvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiYXJpc3RvdGxlLXBvbGl0aWNzL29yaWdpbmFsLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19hdWRpb1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcImFyb3VuZC10aGUtd29ybGQtODAtZGF5cy9tb2Rlcm4tZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiYXMteW91LWxpa2UtaXQvbW9kZXJuLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19hdWRpb1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcImJleW9uZC1nb29kLWFuZC1ldmlsL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJjYW5kaWRlL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJjcmltZS1hbmQtcHVuaXNobWVudC9tb2Rlcm4tZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiZGVtb2NyYWN5LWluLWFtZXJpY2EvbW9kZXJuLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19hdWRpb1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcImRlbW9jcmFjeS1pbi1hbWVyaWNhL29yaWdpbmFsLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19hdWRpb1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcImRlc2NhcnRlcy1tZWRpdGF0aW9ucy9tb2Rlcm4tZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiZGlzY291cnNlLW9uLWluZXF1YWxpdHkvbW9kZXJuLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19hdWRpb1wiLFxuICAgICAgICBcIm1pc3Npbmdfc3Bva2VuX3BhcmFncmFwaHNcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJkaXZpbmUtY29tZWR5L21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJlc3NheXMtbW9udGFpZ25lL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcImV4dHJhX3BhcmFncmFwaHNcIixcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCIsXG4gICAgICAgIFwibWlzc2luZ19zcG9rZW5fcGFyYWdyYXBoc1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcImVzc2F5cy1tb250YWlnbmUvb3JpZ2luYWwtZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJlbXB0eV9hdWRpb1wiLFxuICAgICAgICBcImV4dHJhX3BhcmFncmFwaHNcIixcbiAgICAgICAgXCJtaXNzaW5nX3Nwb2tlbl9wYXJhZ3JhcGhzXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiZmF1c3QtcGFydC0xL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3Npbmdfc3Bva2VuX3BhcmFncmFwaHNcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJmYXVzdC1wYXJ0LTEvb3JpZ2luYWwtZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJleHRyYV9wYXJhZ3JhcGhzXCIsXG4gICAgICAgIFwibWlzc2luZ19zcG9rZW5fcGFyYWdyYXBoc1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcImZyYW5rZW5zdGVpbi9tb2Rlcm4tZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiZ2lsZ2FtZXNoL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJncmVhdC1leHBlY3RhdGlvbnMvb3JpZ2luYWwtZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiaGVhcnQtb2YtZGFya25lc3MvbW9kZXJuLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19hdWRpb1wiLFxuICAgICAgICBcIm1pc3Npbmdfc3Bva2VuX3BhcmFncmFwaHNcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJpdmFuLWlseWljaC9tb2Rlcm4tZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJtaXNzaW5nX21hbmlmZXN0XCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiaXZhbi1pbHlpY2gvb3JpZ2luYWwtZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJtaXNzaW5nX21hbmlmZXN0XCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiamFuZS1leXJlL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcImV4dHJhX3BhcmFncmFwaHNcIixcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiamVreWxsLWFuZC1oeWRlL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIixcbiAgICAgICAgXCJtaXNzaW5nX3Nwb2tlbl9wYXJhZ3JhcGhzXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwianVsaXVzLWNhZXNhci9tb2Rlcm4tZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwia2V5XCI6IFwibWVhc3VyZS1mb3ItbWVhc3VyZS9tb2Rlcm4tZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJleHRyYV9wYXJhZ3JhcGhzXCIsXG4gICAgICAgIFwibWlzc2luZ19zcG9rZW5fcGFyYWdyYXBoc1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcIm1lYXN1cmUtZm9yLW1lYXN1cmUvb3JpZ2luYWwtZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJleHRyYV9wYXJhZ3JhcGhzXCIsXG4gICAgICAgIFwibWlzc2luZ19zcG9rZW5fcGFyYWdyYXBoc1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcIm1lZGl0YXRpb25zL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJtZXJjaGFudC1vZi12ZW5pY2UvbW9kZXJuLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19hdWRpb1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcIm1lcnJ5LXdpdmVzLW9mLXdpbmRzb3IvbW9kZXJuLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwiZXh0cmFfcGFyYWdyYXBoc1wiLFxuICAgICAgICBcIm1pc3Npbmdfc3Bva2VuX3BhcmFncmFwaHNcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJtZXJyeS13aXZlcy1vZi13aW5kc29yL29yaWdpbmFsLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwiZXh0cmFfcGFyYWdyYXBoc1wiLFxuICAgICAgICBcIm1pc3Npbmdfc3Bva2VuX3BhcmFncmFwaHNcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJuaWVscy1seWhuZS9vcmlnaW5hbC1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJvZWRpcHVzLXJleC9vcmlnaW5hbC1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJwYXJhZGlzZS1sb3N0L21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJwcmlkZS1hbmQtcHJlanVkaWNlL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ0aGUtaGlzdG9yaWVzL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ0aGUtcHJpbmNlL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ0aGUtcmVwdWJsaWMvbW9kZXJuLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19hdWRpb1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcInVseXNzZXMvbW9kZXJuLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwiZW1wdHlfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ1bHlzc2VzL29yaWdpbmFsLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19zcG9rZW5fcGFyYWdyYXBoc1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcInV0aWxpdGFyaWFuaXNtL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3Npbmdfc3Bva2VuX3BhcmFncmFwaHNcIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ3YXItYW5kLXBlYWNlL21vZGVybi1lblwiLFxuICAgICAgXCJpc3N1ZXNcIjogW1xuICAgICAgICBcIm1pc3NpbmdfYXVkaW9cIlxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgXCJrZXlcIjogXCJ3YXItYW5kLXBlYWNlL29yaWdpbmFsLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwiZW1wdHlfYXVkaW9cIixcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCIsXG4gICAgICAgIFwibWlzc2luZ19zcG9rZW5fcGFyYWdyYXBoc1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcIndlYWx0aC1vZi1uYXRpb25zL29yaWdpbmFsLWVuXCIsXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19hdWRpb1wiXG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBcImtleVwiOiBcIndpbnRlcnMtdGFsZS9tb2Rlcm4tZW5cIixcbiAgICAgIFwiaXNzdWVzXCI6IFtcbiAgICAgICAgXCJtaXNzaW5nX2F1ZGlvXCJcbiAgICAgIF1cbiAgICB9XG4gIF0sXG4gIFwiYmFzaXNcIjogXCJTZXB0ZW1iZXIgMTAgc3RydWN0dXJhbCBhdWRpbyBhdWRpdDsgQW50aWdvbmUgYW5kIENvbmZlc3Npb25zIG9yaWdpbmFsLWVuIHJlY2xhc3NpZmllZCBTZXB0ZW1iZXIgMTQgYWZ0ZXIgbWlzc2luZyBwYXJhZ3JhcGggcmVjb3JkaW5ncyBhbmQgd29yZCBzaWRlY2FycyB3ZXJlIHJlcGFpcmVkIGFuZCBzZXJ2ZWQtaGFzaCB2ZXJpZmllZC4gVGhpcyBpcyBub3Qgd2hvbGUtbGlicmFyeSBhY291c3RpYyBjZXJ0aWZpY2F0aW9uLiBBbnRpZ29uZSBtb2Rlcm4tZW4gcmVjaGVja2VkIFNlcHRlbWJlciAyMjogMTAgY29tcGxldGUgY2hhcHRlcnMgcGFzcyB0aW1pbmcvdGV4dCB2YWxpZGF0aW9uOyBjaGFwdGVyIDEwIHJlbWFpbnMgaGVsZCBmb3IgbWlzc2luZyBwMTIubXAzLlwiLFxuICBcImhlbGRfY2hhcHRlcnNcIjogW1xuICAgIHtcbiAgICAgIFwia2V5XCI6IFwiYW50aWdvbmUvbW9kZXJuLWVuXCIsXG4gICAgICBcImNoYXB0ZXJzXCI6IFtcbiAgICAgICAgMTBcbiAgICAgIF0sXG4gICAgICBcImlzc3Vlc1wiOiBbXG4gICAgICAgIFwibWlzc2luZ19hdWRpbzpjaDEwL3AxMi5tcDNcIlxuICAgICAgXVxuICAgIH1cbiAgXVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zcmMvZGF0YVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2RhdGEvYXVkaW9BdmFpbGFiaWxpdHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2RhdGEvYXVkaW9BdmFpbGFiaWxpdHkudHNcIjtpbXBvcnQgeyBlZGl0aW9uSG9sZCwgaXNCb29rVGVtcG9yYXJpbHlIZWxkLCBpc0VkaXRpb25MYW5ndWFnZU9mZmVyZWQgfSBmcm9tICcuL2VkaXRpb25BdmFpbGFiaWxpdHknXG5pbXBvcnQgbWFuaWZlc3QgZnJvbSAnLi9hdWRpb0F2YWlsYWJpbGl0eS5qc29uJ1xuLyoqIFJldmVyc2libGUgZGlzY292ZXJ5IHBvbGljeS4gTmV2ZXIgdXNlIHRoaXMgdG8gcmVqZWN0IHNhdmVkIHRleHQgbG9jYXRpb25zLiAqL1xuY29uc3QgaGVsZCA9IG5ldyBTZXQobWFuaWZlc3QuaGVsZF9lZGl0aW9ucy5tYXAoZWRpdGlvbiA9PiBlZGl0aW9uLmtleSkpXG5jb25zdCBoZWxkQ2hhcHRlcnMgPSBuZXcgTWFwKG1hbmlmZXN0LmhlbGRfY2hhcHRlcnMubWFwKGVudHJ5ID0+IFtlbnRyeS5rZXksIG5ldyBTZXQoZW50cnkuY2hhcHRlcnMpXSkpXG5jb25zdCBoZWxkQm9va3MgPSBuZXcgU2V0KG1hbmlmZXN0LmhlbGRfYm9va3MpXG5leHBvcnQgY29uc3QgaXNBdWRpb0hlbGQgPSAoYm9va0lkOiBzdHJpbmcsIGVkaXRpb25LZXk6IHN0cmluZywgY2hhcHRlcj86IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICBjb25zdCBrZXkgPSBgJHtib29rSWR9LyR7ZWRpdGlvbktleX1gXG4gIHJldHVybiBoZWxkLmhhcyhrZXkpIHx8IChjaGFwdGVyICE9PSB1bmRlZmluZWQgJiYgQm9vbGVhbihoZWxkQ2hhcHRlcnMuZ2V0KGtleSk/LmhhcyhjaGFwdGVyKSkpXG59XG5leHBvcnQgY29uc3QgaXNCb29rRGlzY292ZXJhYmxlID0gKGJvb2tJZDogc3RyaW5nKTogYm9vbGVhbiA9PiAhaXNCb29rVGVtcG9yYXJpbHlIZWxkKGJvb2tJZCkgJiYgKGJvb2tJZCA9PT0gJ2ZhdXN0LXBhcnQtMScgfHwgIWhlbGRCb29rcy5oYXMoYm9va0lkKSlcbi8qKlxuICogQm9va3MgaGVsZCBmcm9tIGJyb3dzaW5nIHRoYXQgYSB0eXBlZCBzZWFyY2ggc3RpbGwgZmluZHMgKEFuZGVycyxcbiAqIDIwMjYtMTAtMDg6IFdhciBhbmQgUGVhY2UpLiBTZWFyY2ggb25seTogc2hlbHZlcywgdGhlIGVtcHR5IHNlYXJjaCBsaXN0LFxuICogbGlua3MsIHRoZSBsaWJyYXJpYW4gYW5kIGVtYWlscyBrZWVwIHRoZSBob2xkLlxuICovXG5leHBvcnQgY29uc3QgU0VBUkNIX09OTFlfQk9PS1M6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFsnd2FyLWFuZC1wZWFjZSddKVxuZXhwb3J0IGNvbnN0IGlzQm9va1NlYXJjaGFibGUgPSAoYm9va0lkOiBzdHJpbmcpOiBib29sZWFuID0+IGlzQm9va0Rpc2NvdmVyYWJsZShib29rSWQpIHx8ICghaXNCb29rVGVtcG9yYXJpbHlIZWxkKGJvb2tJZCkgJiYgU0VBUkNIX09OTFlfQk9PS1MuaGFzKGJvb2tJZCkpXG4vKipcbiAqIFRleHQgZGlzY292ZXJ5LiBSZWNvcmRpbmcgaG9sZHMgKHRoZSAyMDI2LTA5LTEwIHN0cnVjdHVyYWwgYXVkaW8gYXVkaXQpIGtlZXBcbiAqIG9sZCByZWNvcmRpbmdzIGZyb20gcGxheWluZzsgdGhleSBubyBsb25nZXIgaGlkZSB0aGUgdGV4dCwgd2hpY2ggbmFycmF0aW9uXG4gKiBub3cgc3RyZWFtcyBmcm9tIChhcHByb3ZlZCBkZWZhdWx0IGVkaXRpb25zLCAyMDI2LTA5LTI1KS4gRGFuaXNoIHN0YXlzIG91dFxuICogb2YgZGlzY292ZXJ5IHVuZGVyIHRoZSBFbmdsaXNoLWZpcnN0IGxhbmd1YWdlIHNjb3BlLCBleGNlcHQgdGhlIGVkaXRpb25zIG9uXG4gKiB0aGUgZXhwbGljaXQgT0ZGRVJFRF9EQU5JU0hfRURJVElPTlMgYWxsb3dsaXN0IChlZGl0aW9uQXZhaWxhYmlsaXR5LnRzKS5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzRWRpdGlvbkRpc2NvdmVyYWJsZSA9IChib29rSWQ6IHN0cmluZywgZWRpdGlvbjogeyBrZXk6IHN0cmluZzsgbGFuZ3VhZ2U6IHN0cmluZyB9KTogYm9vbGVhbiA9PiBpc0VkaXRpb25MYW5ndWFnZU9mZmVyZWQoYm9va0lkLCBlZGl0aW9uKSAmJiAhZWRpdGlvbkhvbGQoYm9va0lkLCBlZGl0aW9uLmtleSlcbi8qKlxuICogRWRpdGlvbnMgcHVibGlzaGVkIGFmdGVyIHRoZSByZWNvcmRlZCAoS29rb3JvL0JlbGxhKSBhdWRpbyB3YXMgbWFkZTogdGhleVxuICogYXJlIG5hcnJhdGVkIGJ5IHN0cmVhbWluZyBvbmx5IGFuZCBoYXZlIG5vIGNoYXB0ZXIgbWFuaWZlc3QsIHdvcmQgc2lkZWNhclxuICogb3IgTVAzIG9uIFIyLiBBc2tpbmcgZm9yIG9uZSBpcyBhIGd1YXJhbnRlZWQgNDA0IGluIHRoZSBjb25zb2xlLCBzbyB0aGVcbiAqIHJlYWRlciBuZXZlciBkb2VzLiBBIHRlc3Qga2VlcHMgdGhpcyBpbiBzdGVwIHdpdGggdGhlIDIwMjYtMDktMTEgYXVkaW9cbiAqIGNlbnN1cywgdGhlIGxhc3QgaW52ZW50b3J5IG9mIHJlY29yZGVkIGF1ZGlvLlxuICovXG5leHBvcnQgY29uc3QgU1RSRUFNRURfT05MWV9BVURJT19FRElUSU9OUzogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoW1xuICAnYWxpY2UtaW4td29uZGVybGFuZC9tb2Rlcm4tZW4nLFxuICAnYWxpY2UtaW4td29uZGVybGFuZC9vcmlnaW5hbC1lbicsXG4gICdhcmFiaWFuLW5pZ2h0cy9tb2Rlcm4tZW4nLFxuICAnYXJhYmlhbi1uaWdodHMvb3JpZ2luYWwtZW4nLFxuICAnYmlibGUvYnNiLWVuJyxcbiAgJ2JpYmxlL3dlYmMtZW4nLFxuICAnZ3JpbW1zLWZhaXJ5LXRhbGVzL21vZGVybi1lbicsXG4gICdncmltbXMtZmFpcnktdGFsZXMvb3JpZ2luYWwtZW4nLFxuICAnbWlkZGxlbWFyY2gvbW9kZXJuLWVuJyxcbiAgJ21pZGRsZW1hcmNoL29yaWdpbmFsLWVuJyxcbiAgJ3NlbnNlLWFuZC1zZW5zaWJpbGl0eS9tb2Rlcm4tZW4nLFxuICAnc2Vuc2UtYW5kLXNlbnNpYmlsaXR5L29yaWdpbmFsLWVuJyxcbiAgJ3RvLXRoZS1saWdodGhvdXNlL21vZGVybi1lbicsXG4gICd0by10aGUtbGlnaHRob3VzZS9vcmlnaW5hbC1lbicsXG4gICd3dXRoZXJpbmctaGVpZ2h0cy9tb2Rlcm4tZW4nLFxuICAnd3V0aGVyaW5nLWhlaWdodHMvb3JpZ2luYWwtZW4nLFxuXSlcbi8qKlxuICogVGV4dC1vbmx5IGVkaXRpb25zOiBubyByZWNvcmRpbmcgYW5kIG5vIG5hcnJhdGlvbiAoYGhhc0F1ZGlvOiBmYWxzZWApLlxuICogVGhlIG9mZmVyZWQgRGFuaXNoIGVkaXRpb25zIChUbyB0aGUgTGlnaHRob3VzZSAyMDI2LTEwLTEwOyBBIExpdHRsZSBQcmluY2VzcywgQXJvdW5kIHRoZSBXb3JsZCwgVGhlIEp1bmdsZSBCb29rLCBHcmltbSwgQXJhYmlhbiBOaWdodHMgMjAyNi0xMC0xOSk6IERhbmlzaCBuYXJyYXRpb24gaXMgZGlzYWJsZWRcbiAqIChkb2NzL2F1ZGlvYm9vay1hcmNoaXRlY3R1cmUtMjAyNi0wOS0yMS5tZCksIHNvIG5vdGhpbmcgaXMgZXZlciByZWNvcmRlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IFRFWFRfT05MWV9FRElUSU9OUzogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoW1xuICAndG8tdGhlLWxpZ2h0aG91c2UvbW9kZXJuLWRhJyxcbiAgJ2EtbGl0dGxlLXByaW5jZXNzL21vZGVybi1kYScsXG4gICdhcm91bmQtdGhlLXdvcmxkLTgwLWRheXMvbW9kZXJuLWRhJyxcbiAgJ2p1bmdsZS1ib29rL21vZGVybi1kYScsXG4gICdncmltbXMtZmFpcnktdGFsZXMvbW9kZXJuLWRhJyxcbiAgJ2FyYWJpYW4tbmlnaHRzL21vZGVybi1kYScsXG5dKVxuLyoqIFdoZXRoZXIgYW4gZWRpdGlvbiBoYXMgcmVjb3JkZWQgY2hhcHRlciBhdWRpbyAobWFuaWZlc3QsIHNpZGVjYXIsIE1QM3MpIHRvIGFzayBmb3IuICovXG5leHBvcnQgY29uc3QgaGFzUmVjb3JkZWRBdWRpbyA9IChib29rSWQ6IHN0cmluZywgZWRpdGlvbktleTogc3RyaW5nKTogYm9vbGVhbiA9PiAhU1RSRUFNRURfT05MWV9BVURJT19FRElUSU9OUy5oYXMoYCR7Ym9va0lkfS8ke2VkaXRpb25LZXl9YCkgJiYgIVRFWFRfT05MWV9FRElUSU9OUy5oYXMoYCR7Ym9va0lkfS8ke2VkaXRpb25LZXl9YClcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2RhdGFcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9kYXRhL3dpdGhoZWxkRWRpdGlvbnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2RhdGEvd2l0aGhlbGRFZGl0aW9ucy50c1wiOy8qKlxuICogRWRpdGlvbnMgd2l0aGRyYXduIGZyb20gVGluY3QgYWZ0ZXIgcHVibGljYXRpb24uXG4gKlxuICogVW5saWtlIGBhdWRpb0F2YWlsYWJpbGl0eWAsIHRoaXMgaXMgbm90IGEgZGlzY292ZXJ5IHBvbGljeTogdGhlIGVkaXRpb24gaXNcbiAqIGdvbmUgZnJvbSB0aGUgcmVnaXN0cnkgYW5kIGl0cyB0ZXh0IGlzIG5vIGxvbmdlciBzZXJ2ZWQuIFdoYXQgcmVtYWlucyBpcyB0aGVcbiAqIHNhdmVkIGxvY2F0aW9ucyBvZiByZWFkZXJzIHdobyB3ZXJlIGluIGl0LiBUaG9zZSBtdXN0IGtlZXAgdGhlaXIgcGxhY2UsIHNvIGFcbiAqIHdpdGhoZWxkIGVkaXRpb24gbmFtZXMgYSBzdWNjZXNzb3IgYW5kIHRoZSByZWFkZXIgbW92ZXMgdGhlcmUgYXQgdGhlIHNhbWVcbiAqIGNoYXB0ZXIgYW5kIHBhcmFncmFwaC4gVGhhdCBpcyBvbmx5IHNvdW5kIGJlY2F1c2UgVGluY3QncyBlZGl0aW9ucyBhcmVcbiAqIHBhcmFncmFwaC1hbGlnbmVkIFx1MjAxNCBwYXJhZ3JhcGggTiBvZiBjaGFwdGVyIEMgaXMgdGhlIHNhbWUgcGFzc2FnZSBpbiBldmVyeVxuICogZWRpdGlvbiBvZiB0aGUgYm9vay5cbiAqXG4gKiBNZWRpdGF0aW9ucyBgbW9kZXJuLWRhYCB3YXMgd2l0aGRyYXduIG9uIDIwMjYtMDktMTIuIEl0IGlzIG5vdCBhIHJpZ2h0c1xuICogcHJvYmxlbTogaXQgaXMgYSBzdHJ1Y3R1cmUgcHJvYmxlbS4gSXQgd2FzIHRyYW5zbGF0ZWQgcGFyYWdyYXBoIGZvclxuICogcGFyYWdyYXBoIGFnYWluc3QgdGhlIENhc2F1Ym9uIDE2MzQgdGV4dCB0aGF0IHVzZWQgdG8gYmUgc2VydmVkIGFzXG4gKiBgb3JpZ2luYWwtZW5gICg0MTIgcGFyYWdyYXBocywgbm9uLXN0YW5kYXJkIHNlY3Rpb24gbnVtYmVyaW5nKSwgYW5kIG9uXG4gKiAyMDI2LTA5LTEyIHRoZSBib29rIHdhcyByZS1iYXNlZCBvbnRvIEdlb3JnZSBMb25nIDE4NjIgKDQ4NyBwYXJhZ3JhcGhzKS5cbiAqIEl0cyBwYXJhZ3JhcGggTiBpcyBubyBsb25nZXIgdGhlIHNhbWUgcGFzc2FnZSBhcyBwYXJhZ3JhcGggTiBvZiB0aGUgbGl2ZVxuICogZWRpdGlvbnMsIHNvIGl0IGNhbiBuZWl0aGVyIGJlIHJlYWQgYWxvbmdzaWRlIHRoZW0gbm9yIGNvbXBhcmVkIHdpdGggdGhlbSxcbiAqIGFuZCB0aGUgYWxpZ25tZW50IHByb21pc2UgYWJvdmUgZG9lcyBub3QgaG9sZCBmb3IgaXQuIEl0IGZhbGxzIGJhY2sgdG9cbiAqIGBtb2Rlcm4tZW5gIFx1MjAxNCB0aGUgbW9kZXJuIEVuZ2xpc2ggZWRpdGlvbiwgdGhlIGNsb3Nlc3QgdGhpbmcgdG8gd2hhdCBhXG4gKiByZWFkZXIgd2hvIGNob3NlIE1vZGVybmUgRGFuc2sgd2FzIGNob29zaW5nLlxuICpcbiAqIE5PVEUgdGhlIGludGVyYWN0aW9uIHdpdGggYHJlYmFzZWRFZGl0aW9uc2A6IG1vdmluZyBhIHJlYWRlciBmcm9tXG4gKiBgbWVkaXRhdGlvbnMvbW9kZXJuLWRhYCB0byBgbW9kZXJuLWVuYCBhdCB0aGUgU0FNRSBwYXJhZ3JhcGggaXMgZXhhY3RseSB0aGVcbiAqIHVuc291bmQgbW92ZSB0aGlzIGZpbGUncyBhbGlnbm1lbnQgYXJndW1lbnQgbGljZW5zZXMgZXZlcnl3aGVyZSBlbHNlLiBJdCBpc1xuICogc2FmZSBoZXJlIG9ubHkgYmVjYXVzZSBldmVyeSBzdG9yZWQgYG1lZGl0YXRpb25zL21vZGVybi1kYWAgbG9jYXRpb25cbiAqIG5lY2Vzc2FyaWx5IHByZWRhdGVzIHRoZSByZS1iYXNpbmcgKHRoZSBlZGl0aW9uIGlzIHdpdGhkcmF3biBpbiB0aGUgc2FtZVxuICogY2hhbmdlKSwgc28gYHJlYmFzZVNhdmVkUG9zaXRpb25gIGhhcyBhbHJlYWR5IGRyb3BwZWQgaXRzIHBhcmFncmFwaCBiZWZvcmVcbiAqIHRoZSBzdWNjZXNzb3IgaXMgY29uc3VsdGVkLiBUaGUgcmVhZGVyIGFycml2ZXMgYXQgdGhlIHRvcCBvZiB0aGUgc2FtZVxuICogY2hhcHRlciwgd2hpY2ggaXMgdGhlIG1vc3QgdGhhdCBzdXJ2aXZlcyBob25lc3RseS5cbiAqXG4gKiBCaWJsZSBgbW9kZXJuLWVuYCB3YXMgd2l0aGRyYXduIG9uIDIwMjYtMDktMTE6IHRoZSAyMDI2LTA5LTExIHRyYW5zbGF0aW9uXG4gKiBhdWRpdCBjb25maXJtZWQgaXQgcmVwcm9kdWNlcyB0aGUgY29weXJpZ2h0ZWQgTklWICgyMDExKSBhdCBldmVyeSBzYW1wbGVkXG4gKiBsb2NhdGlvbi4gYG1vZGVybi1kYWAgd2FzIHdpdGhkcmF3biB3aXRoIGl0IGJlY2F1c2UgaXQgaXMgYSBEYW5pc2ggcmVuZGVyaW5nXG4gKiBvZiB0aGF0IHNhbWUgRW5nbGlzaCwgYW5kIHNvIGNhcnJpZXMgdGhlIHNhbWUgZGVyaXZhdGl2ZSBleHBvc3VyZS4gQm90aCBmYWxsXG4gKiBiYWNrIHRvIGB3ZWItZW5gIChXb3JsZCBFbmdsaXNoIEJpYmxlLCBwdWJsaWMgZG9tYWluLCBtb2Rlcm4gRW5nbGlzaCkgcmF0aGVyXG4gKiB0aGFuIGBranYtZW5gLCBiZWNhdXNlIGEgcmVhZGVyIHdobyBjaG9zZSBhIG1vZGVybiBlZGl0aW9uIGNob3NlIHJlYWRhYmlsaXR5LlxuICovXG5jb25zdCBTVUNDRVNTT1JTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAnYmlibGUvbW9kZXJuLWVuJzogJ3dlYi1lbicsXG4gICdiaWJsZS9tb2Rlcm4tZGEnOiAnd2ViLWVuJyxcbiAgJ21lZGl0YXRpb25zL21vZGVybi1kYSc6ICdtb2Rlcm4tZW4nLFxuICAvLyAyMDI2LTEwLTAyIHJpZ2h0cyByZWxlYXNlOiB0aGUgRW5nbGlzaCB0ZXh0IG9mIHRoZXNlIGZvdXIgYm9va3Mgd2FzXG4gIC8vIHJlcGxhY2VkIChHaWxlcywgTXVycmF5LCBEYXZpcyAtPiBDYWx0aHJvcCwgV2F5LCBNY0tlY2huaWUpIGFuZCB0aGVpclxuICAvLyBtb2Rlcm4tZGEgcmVuZGVycyB0aGUgcmVwbGFjZWQgdGV4dC4gV2l0aGRyYXduIGF0IEFuZGVycydzIHJlcXVlc3Q7IHRoZVxuICAvLyBmaWxlcyBhcmUga2VwdCwgdW5zZXJ2ZWQsIGluIGJvb2tzL3dpdGhoZWxkLWFzc2V0cy8yMDI2LTEwLTAyLXJpZ2h0cy8uXG4gIC8vIERhbmlzaCBoYXMgYmVlbiBoZWxkIHNpbmNlIDIwMjYtMDktMjEsIHNvIG9ubHkgb2xkZXIgc2F2ZWQgcGxhY2VzIGV4aXN0O1xuICAvLyB0aGV5IGZvbGxvdyB0aGUgb2xkIHBhcmFncmFwaGluZywgc28gYXQgdGhlIHNhbWUgcGFyYWdyYXBoIG9mIG1vZGVybi1lblxuICAvLyB0aGUgcGxhY2UgaXMgYXBwcm94aW1hdGUgKHNhbWUgY2hhcHRlcikuXG4gICd0aGUtYXJ0LW9mLXdhci9tb2Rlcm4tZGEnOiAnbW9kZXJuLWVuJyxcbiAgJ21lZGVhL21vZGVybi1kYSc6ICdtb2Rlcm4tZW4nLFxuICAnYmFjY2hhZS9tb2Rlcm4tZGEnOiAnbW9kZXJuLWVuJyxcbiAgJ21hZ25hLWNhcnRhL21vZGVybi1kYSc6ICdtb2Rlcm4tZW4nLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFZGl0aW9uV2l0aGhlbGQoYm9va0lkOiBzdHJpbmcsIGVkaXRpb25LZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gYCR7Ym9va0lkfS8ke2VkaXRpb25LZXl9YCBpbiBTVUNDRVNTT1JTXG59XG5cbi8qKlxuICogVGhlIGVkaXRpb24gYSBzYXZlZCBsb2NhdGlvbiBzaG91bGQgYmUgbW92ZWQgdG8sIG9yIHRoZSBrZXkgdW5jaGFuZ2VkIHdoZW5cbiAqIHRoZSBlZGl0aW9uIGlzIHN0aWxsIHB1Ymxpc2hlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pZ3JhdGVXaXRoaGVsZEVkaXRpb24oYm9va0lkOiBzdHJpbmcsIGVkaXRpb25LZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBTVUNDRVNTT1JTW2Ake2Jvb2tJZH0vJHtlZGl0aW9uS2V5fWBdID8/IGVkaXRpb25LZXlcbn1cbiIsICJ7XG4gIFwiYmFzaXNcIjogXCJJbi1jb3B5cmlnaHQgYm9va3MgcHVibGlzaGVkIG9uIFRpbmN0IHdpdGggdGhlIHB1Ymxpc2hlcidzIHBlcm1pc3Npb246IExvZ2FuIENoaXBraW4gZm9yIENvbmplY3R1cmUgSW5zdGl0dXRlLCA4IE9jdG9iZXIgMjAyNiAoYm9va3Mvd2lwL2NvbmplY3R1cmUtYm9va3MtMjAyNi0xMC9yaWdodHMvcGVybWlzc2lvbi5tZCkuIE5ldmVyIGxhYmVsIHRoZXNlIHB1YmxpYyBkb21haW4uIFJpZ2h0cyBsaW5lcyBhcmUgdGhlIGJvb2tzJyBvd24gY29weXJpZ2h0IHBhZ2VzLlwiLFxuICBcImJvb2tzXCI6IHtcbiAgICBcInRoZS1zb3ZlcmVpZ24tY2hpbGRcIjoge1xuICAgICAgXCJwdWJsaXNoZXJcIjogXCJDb25qZWN0dXJlIEluc3RpdHV0ZVwiLFxuICAgICAgXCJyaWdodHNcIjogXCJDb3B5cmlnaHQgXHUwMEE5IDIwMjUgQWFyb24gU3R1cHBsZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cIlxuICAgIH0sXG4gICAgXCJsb3Jkcy1vZi10aGUtY29zbW9zXCI6IHtcbiAgICAgIFwicHVibGlzaGVyXCI6IFwiQ29uamVjdHVyZSBJbnN0aXR1dGVcIixcbiAgICAgIFwicmlnaHRzXCI6IFwiXHUyMDFDVGhpcyBCb29rIEhhcyBObyBDb3B5cmlnaHQuXHUyMDFEIEFyanVuIEtoZW1hbmkgYW5kIExvZ2FuIENoaXBraW4sIDIwMjUuXCJcbiAgICB9LFxuICAgIFwiYm9sZC1jb25qZWN0dXJlcy12b2x1bWUtMVwiOiB7XG4gICAgICBcInB1Ymxpc2hlclwiOiBcIkNvbmplY3R1cmUgSW5zdGl0dXRlXCIsXG4gICAgICBcInJpZ2h0c1wiOiBcIkNvcHlyaWdodCBcdTAwQTkgMjAyNSBMb2dhbiBDaGlwa2luLiBBbGwgcmlnaHRzIHJlc2VydmVkLlwiXG4gICAgfSxcbiAgICBcImJvbGQtY29uamVjdHVyZXMtdm9sdW1lLTJcIjoge1xuICAgICAgXCJwdWJsaXNoZXJcIjogXCJDb25qZWN0dXJlIFByZXNzXCIsXG4gICAgICBcInJpZ2h0c1wiOiBcIkNvcHlyaWdodCBcdTAwQTkgMjAyNiBDb25qZWN0dXJlIEluc3RpdHV0ZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cIlxuICAgIH0sXG4gICAgXCJ0aGUtZmFydGhlc3QtcmVhY2hlc1wiOiB7XG4gICAgICBcInB1Ymxpc2hlclwiOiBcIkNvbmplY3R1cmUgSW5zdGl0dXRlXCIsXG4gICAgICBcInJpZ2h0c1wiOiBcIkNvcHlyaWdodCBcdTAwQTkgMjAyNiBCcmV0dCBIYWxsLiBBbGwgcmlnaHRzIHJlc2VydmVkLlwiXG4gICAgfVxuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9kYXRhXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zcmMvZGF0YS9wdWJsaXNoZXJQZXJtaXNzaW9ucy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zcmMvZGF0YS9wdWJsaXNoZXJQZXJtaXNzaW9ucy50c1wiO2ltcG9ydCBtYW5pZmVzdCBmcm9tICcuL3B1Ymxpc2hlclBlcm1pc3Npb25zLmpzb24nXG5cbi8qKiBBbiBpbi1jb3B5cmlnaHQgYm9vayBUaW5jdCBwdWJsaXNoZXMgYnkgdGhlIHB1Ymxpc2hlcidzIHBlcm1pc3Npb24uICovXG5leHBvcnQgaW50ZXJmYWNlIFB1Ymxpc2hlclBlcm1pc3Npb24ge1xuICBwdWJsaXNoZXI6IHN0cmluZ1xuICAvKiogVGhlIGJvb2sncyBvd24gY29weXJpZ2h0IGxpbmUsIHNob3duIHdpdGggdGhlIGJvb2suICovXG4gIHJpZ2h0czogc3RyaW5nXG59XG5cbmNvbnN0IFBFUk1JU1NJT05TOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBQdWJsaXNoZXJQZXJtaXNzaW9uPj4gPSBtYW5pZmVzdC5ib29rc1xuXG4vKiogVGhlIHBlcm1pc3Npb24gcmVjb3JkIGZvciBhIGJvb2ssIG9yIG51bGwgZm9yIGEgcHVibGljLWRvbWFpbiBib29rLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2hlclBlcm1pc3Npb24oYm9va0lkOiBzdHJpbmcpOiBQdWJsaXNoZXJQZXJtaXNzaW9uIHwgbnVsbCB7XG4gIHJldHVybiBQRVJNSVNTSU9OU1tib29rSWRdID8/IG51bGxcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2RhdGFcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9kYXRhL2xpYnJhcnlUYXhvbm9teS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zcmMvZGF0YS9saWJyYXJ5VGF4b25vbXkudHNcIjtpbXBvcnQgdHlwZSB7IEJvb2sgfSBmcm9tICcuLi90eXBlcydcblxuZXhwb3J0IGludGVyZmFjZSBMaWJyYXJ5Qm9va01ldGEge1xuICBpZDogc3RyaW5nXG4gIHRpdGxlOiBzdHJpbmdcbiAgYXV0aG9yOiBzdHJpbmdcbiAgdHJhZGl0aW9uPzogc3RyaW5nXG4gIHllYXI6IHN0cmluZ1xuICB5U29ydDogbnVtYmVyXG4gIGZvcm06IHN0cmluZ1xuICBlcmE6IHN0cmluZ1xuICBodWU6IG51bWJlclxuICBibHVyYjogc3RyaW5nXG4gIHRoZW1lczogc3RyaW5nW11cbiAgc2hlbHZlczogc3RyaW5nW11cbiAgc3ViPzogc3RyaW5nXG4gIHN0dWI/OiBib29sZWFuXG4gIGxhbmdzPzogc3RyaW5nW11cbiAgcHJvZ3Jlc3M/OiBudW1iZXJcbiAgcGF1c2VkPzogYm9vbGVhblxuICBzdGF0dXM/OiBzdHJpbmdcbiAgZmluaXNoZWRPbj86IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExpYnJhcnlTaGVsZiB7XG4gIHRpdGxlOiBzdHJpbmdcbiAgc3ViOiBzdHJpbmdcbiAgaHVlOiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMaWJyYXJ5SG91c2Uge1xuICBpZDogc3RyaW5nXG4gIHRpdGxlOiBzdHJpbmdcbiAgc3ViOiBzdHJpbmdcbiAgaHVlOiBudW1iZXJcbiAgc2hlbHZlczogc3RyaW5nW11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMaWJyYXJ5UmVhZGluZ0xpc3RFbnRyeSB7XG4gIGlkPzogc3RyaW5nXG4gIG1pc3Npbmc/OiBib29sZWFuXG4gIHRpdGxlPzogc3RyaW5nXG4gIGF1dGhvcj86IHN0cmluZ1xuICBub3RlPzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlicmFyeVJlYWRpbmdMaXN0IHtcbiAgaWQ6IHN0cmluZ1xuICB0aXRsZTogc3RyaW5nXG4gIHNvdXJjZTogc3RyaW5nXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmdcbiAgYWNjZW50OiBudW1iZXJcbiAgY29tcHV0ZWQ/OiBib29sZWFuXG4gIHNlcXVlbmNlOiBMaWJyYXJ5UmVhZGluZ0xpc3RFbnRyeVtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlicmFyeUxpc3RNZW1iZXJzaGlwIHtcbiAgbGlzdElkOiBzdHJpbmdcbiAgbGlzdFRpdGxlOiBzdHJpbmdcbiAgcG9zaXRpb246IG51bWJlclxuICBhY2NlbnQ6IG51bWJlclxufVxuXG5leHBvcnQgY29uc3QgTElCUkFSWV9CT09LX01FVEE6IExpYnJhcnlCb29rTWV0YVtdID0gW1xuICB7XG4gICAgXCJpZFwiOiBcImdpbGdhbWVzaFwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgRXBpYyBvZiBHaWxnYW1lc2hcIixcbiAgICBcImF1dGhvclwiOiBcIkFub255bW91c1wiLFxuICAgIFwidHJhZGl0aW9uXCI6IFwiTWVzb3BvdGFtaWFuXCIsXG4gICAgXCJ5ZWFyXCI6IFwiYy4gMjEwMCBCQ1wiLFxuICAgIFwieVNvcnRcIjogLTIxMDAsXG4gICAgXCJmb3JtXCI6IFwiZXBpY1wiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogNjAsXG4gICAgXCJibHVyYlwiOiBcIlRoZSBvbGRlc3Qgc3Vydml2aW5nIHN0b3J5IFx1MjAxNCBhIGtpbmcncyBncmllZiBhbmQgdGhlIHNlYXJjaCBmb3Igd2hhdCBjYW5ub3QgZGllLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiZnJpZW5kc2hpcFwiLFxuICAgICAgXCJtb3J0YWxpdHlcIixcbiAgICAgIFwiZmxvb2QtbXl0aFwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJhbmNpZW50LWVwaWNzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImlsaWFkXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBJbGlhZFwiLFxuICAgIFwiYXV0aG9yXCI6IFwiSG9tZXJcIixcbiAgICBcInllYXJcIjogXCJjLiA3NTAgQkNcIixcbiAgICBcInlTb3J0XCI6IC03NTAsXG4gICAgXCJmb3JtXCI6IFwiZXBpY1wiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogMzUsXG4gICAgXCJibHVyYlwiOiBcIlRoZSB3cmF0aCBvZiBBY2hpbGxlcywgYW5kIHRoZSBsb25nIHNpZWdlIG9mIFRyb3kuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJ3YXJcIixcbiAgICAgIFwiaG9ub3JcIixcbiAgICAgIFwicmFnZVwiLFxuICAgICAgXCJmYXRlXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImFuY2llbnQtZXBpY3NcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwib2R5c3NleVwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgT2R5c3NleVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiSG9tZXJcIixcbiAgICBcInllYXJcIjogXCJjLiA3MDAgQkNcIixcbiAgICBcInlTb3J0XCI6IC03MDAsXG4gICAgXCJmb3JtXCI6IFwiZXBpY1wiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogMzUsXG4gICAgXCJibHVyYlwiOiBcIkEgbG9uZyB3YXkgaG9tZSwgYnkgd2F5IG9mIGV2ZXJ5IHNlYS1tb25zdGVyIGJldHdlZW4uXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJob21lY29taW5nXCIsXG4gICAgICBcImN1bm5pbmdcIixcbiAgICAgIFwic2VhXCIsXG4gICAgICBcIm15dGhcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiYW5jaWVudC1lcGljc1wiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF0sXG4gICAgXCJwcm9ncmVzc1wiOiAwLjQxLFxuICAgIFwicGF1c2VkXCI6IHRydWVcbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJiaWJsZVwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgQmlibGVcIixcbiAgICBcImF1dGhvclwiOiBcIlZhcmlvdXNcIixcbiAgICBcInRyYWRpdGlvblwiOiBcIkhlYnJldyAmIEdyZWVrIHNjcmliZXNcIixcbiAgICBcInllYXJcIjogXCJjLiAxMjAwIEJDIFx1MjAxMyAxMDAgQURcIixcbiAgICBcInlTb3J0XCI6IC0xMjAwLFxuICAgIFwiZm9ybVwiOiBcInNjcmlwdHVyZVwiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogMjUsXG4gICAgXCJibHVyYlwiOiBcIlNpeHR5LXNpeCBib29rcywgdHdvIHRlc3RhbWVudHMuIFRoZSBsaWJyYXJ5IGluc2lkZSB0aGUgbGlicmFyeS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImNvdmVuYW50XCIsXG4gICAgICBcIndpc2RvbVwiLFxuICAgICAgXCJwcm9waGVjeVwiLFxuICAgICAgXCJncmFjZVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJiaWJsZS1hbmQtZGV2b3Rpb25cIixcbiAgICAgIFwiY2hyaXN0aWFuLXRyYWRpdGlvblwiXG4gICAgXSxcbiAgICBcInByb2dyZXNzXCI6IDAuMDMsXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwib3Jlc3RlaWFcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIE9yZXN0ZWlhXCIsXG4gICAgXCJhdXRob3JcIjogXCJBZXNjaHlsdXNcIixcbiAgICBcInllYXJcIjogXCI0NTggQkNcIixcbiAgICBcInlTb3J0XCI6IC00NTgsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImFudGlxdWl0eVwiLFxuICAgIFwiaHVlXCI6IDIxNSxcbiAgICBcImJsdXJiXCI6IFwiQSBob3VzZSBjdXJzZWQ7IHRoZSBiaXJ0aCBvZiB0cmlhbCBieSBqdXJ5LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwidmVuZ2VhbmNlXCIsXG4gICAgICBcImp1c3RpY2VcIixcbiAgICAgIFwiY3Vyc2VcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiZ3JlZWstdHJhZ2VkeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJvZWRpcHVzLXJleFwiLFxuICAgIFwidGl0bGVcIjogXCJPZWRpcHVzIFJleFwiLFxuICAgIFwiYXV0aG9yXCI6IFwiU29waG9jbGVzXCIsXG4gICAgXCJ5ZWFyXCI6IFwiYy4gNDI5IEJDXCIsXG4gICAgXCJ5U29ydFwiOiAtNDI5LFxuICAgIFwiZm9ybVwiOiBcImRyYW1hXCIsXG4gICAgXCJlcmFcIjogXCJhbnRpcXVpdHlcIixcbiAgICBcImh1ZVwiOiAyNSxcbiAgICBcImJsdXJiXCI6IFwiQSBraW5nIGludmVzdGlnYXRlcyBhIHBsYWd1ZSBhbmQgZmluZHMgaGltc2VsZiBhdCB0aGUgYm90dG9tIG9mIGl0LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiZmF0ZVwiLFxuICAgICAgXCJpZGVudGl0eVwiLFxuICAgICAgXCJibGluZG5lc3NcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiZ3JlZWstdHJhZ2VkeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJhbnRpZ29uZVwiLFxuICAgIFwidGl0bGVcIjogXCJBbnRpZ29uZVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiU29waG9jbGVzXCIsXG4gICAgXCJ5ZWFyXCI6IFwiYy4gNDQxIEJDXCIsXG4gICAgXCJ5U29ydFwiOiAtNDQxLFxuICAgIFwiZm9ybVwiOiBcImRyYW1hXCIsXG4gICAgXCJlcmFcIjogXCJhbnRpcXVpdHlcIixcbiAgICBcImh1ZVwiOiAyNSxcbiAgICBcImJsdXJiXCI6IFwiQnVyeSB5b3VyIGJyb3RoZXIsIGRlZnkgdGhlIGtpbmcuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJjaXZpbC1kaXNvYmVkaWVuY2VcIixcbiAgICAgIFwiZmFtaWx5XCIsXG4gICAgICBcImxhd1wiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJncmVlay10cmFnZWR5XCIsXG4gICAgICBcIm9uLXBvd2VyXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcIm9lZGlwdXMtYXQtY29sb251c1wiLFxuICAgIFwidGl0bGVcIjogXCJPZWRpcHVzIGF0IENvbG9udXNcIixcbiAgICBcImF1dGhvclwiOiBcIlNvcGhvY2xlc1wiLFxuICAgIFwieWVhclwiOiBcImMuIDQwNiBCQ1wiLFxuICAgIFwieVNvcnRcIjogLTQwNixcbiAgICBcImZvcm1cIjogXCJkcmFtYVwiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogMjE1LFxuICAgIFwiYmx1cmJcIjogXCJUaGUgZXhpbGVkIGtpbmcgZmluZHMsIGF0IGxhc3QsIGEgcGxhY2UgdG8gZGllLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiZXhpbGVcIixcbiAgICAgIFwiZ3JhY2VcIixcbiAgICAgIFwib2xkLWFnZVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJncmVlay10cmFnZWR5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImJhY2NoYWVcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIEJhY2NoYWVcIixcbiAgICBcImF1dGhvclwiOiBcIkV1cmlwaWRlc1wiLFxuICAgIFwieWVhclwiOiBcImMuIDQwNSBCQ1wiLFxuICAgIFwieVNvcnRcIjogLTQwNSxcbiAgICBcImZvcm1cIjogXCJkcmFtYVwiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogMzAwLFxuICAgIFwiYmx1cmJcIjogXCJBIGdvZCBjb21lcyBob21lIHRvIGEgY2l0eSB0aGF0IHdvbid0IHdvcnNoaXAgaGltLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiZWNzdGFzeVwiLFxuICAgICAgXCJyZWFzb25cIixcbiAgICAgIFwicmV0cmlidXRpb25cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiZ3JlZWstdHJhZ2VkeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJtZWRlYVwiLFxuICAgIFwidGl0bGVcIjogXCJNZWRlYVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiRXVyaXBpZGVzXCIsXG4gICAgXCJ5ZWFyXCI6IFwiNDMxIEJDXCIsXG4gICAgXCJ5U29ydFwiOiAtNDMxLFxuICAgIFwiZm9ybVwiOiBcImRyYW1hXCIsXG4gICAgXCJlcmFcIjogXCJhbnRpcXVpdHlcIixcbiAgICBcImh1ZVwiOiAzMDAsXG4gICAgXCJibHVyYlwiOiBcIkEgd2lmZSBzY29ybmVkLCBpbiBhIGZvcmVpZ24gbGFuZCwgd2l0aCBvcHRpb25zLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiYmV0cmF5YWxcIixcbiAgICAgIFwicmV2ZW5nZVwiLFxuICAgICAgXCJleGlsZVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJncmVlay10cmFnZWR5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImFwb2xvZ3lcIixcbiAgICBcInRpdGxlXCI6IFwiQXBvbG9neVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiUGxhdG9cIixcbiAgICBcInllYXJcIjogXCJjLiAzOTkgQkNcIixcbiAgICBcInlTb3J0XCI6IC0zOTksXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogMjI1LFxuICAgIFwiYmx1cmJcIjogXCJTb2NyYXRlcyBkZWZlbmRzIGhpbXNlbGYsIGFuZCBsb3NlcyBvbiBwdXJwb3NlLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiZXhhbWluZWQtbGlmZVwiLFxuICAgICAgXCJkZWF0aFwiLFxuICAgICAgXCJpcm9ueVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJwbGF0b1wiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJjcml0b1wiLFxuICAgIFwidGl0bGVcIjogXCJDcml0b1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiUGxhdG9cIixcbiAgICBcInllYXJcIjogXCJjLiAzOTkgQkNcIixcbiAgICBcInlTb3J0XCI6IC0zOTgsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogMjI1LFxuICAgIFwiYmx1cmJcIjogXCJBIGZyaWVuZCBhdCB0aGUgY2VsbCBkb29yLCBhbiBhcmd1bWVudCBhZ2FpbnN0IGVzY2FwZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImxhd1wiLFxuICAgICAgXCJvYmxpZ2F0aW9uXCIsXG4gICAgICBcImp1c3RpY2VcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwicGxhdG9cIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwicGhhZWRvXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlBoYWVkb1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiUGxhdG9cIixcbiAgICBcInllYXJcIjogXCJjLiAzODUgQkNcIixcbiAgICBcInlTb3J0XCI6IC0zODUsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogMjI1LFxuICAgIFwiYmx1cmJcIjogXCJUaGUgbGFzdCBob3Vycywgb24gdGhlIHNvdWwgYW5kIHdoYXQgZm9sbG93cy5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInNvdWxcIixcbiAgICAgIFwiaW1tb3J0YWxpdHlcIixcbiAgICAgIFwiZm9ybXNcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwicGxhdG9cIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwic3ltcG9zaXVtXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlN5bXBvc2l1bVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiUGxhdG9cIixcbiAgICBcInllYXJcIjogXCJjLiAzODUgQkNcIixcbiAgICBcInlTb3J0XCI6IC0zODUuMSxcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCJhbnRpcXVpdHlcIixcbiAgICBcImh1ZVwiOiAzMTAsXG4gICAgXCJibHVyYlwiOiBcIlNldmVuIG1lbiwgYSBsb3Qgb2Ygd2luZSwgYW5kIHNwZWVjaGVzIG9uIGxvdmUuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJsb3ZlXCIsXG4gICAgICBcImJlYXV0eVwiLFxuICAgICAgXCJkZXNpcmVcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwicGxhdG9cIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwicGhhZWRydXNcIixcbiAgICBcInRpdGxlXCI6IFwiUGhhZWRydXNcIixcbiAgICBcImF1dGhvclwiOiBcIlBsYXRvXCIsXG4gICAgXCJ5ZWFyXCI6IFwiYy4gMzcwIEJDXCIsXG4gICAgXCJ5U29ydFwiOiAtMzcwLFxuICAgIFwiZm9ybVwiOiBcInBoaWxvc29waHlcIixcbiAgICBcImVyYVwiOiBcImFudGlxdWl0eVwiLFxuICAgIFwiaHVlXCI6IDIyNSxcbiAgICBcImJsdXJiXCI6IFwiQSB3YWxrIG91dHNpZGUgdGhlIHdhbGxzOyByaGV0b3JpYywgZXJvcywgdGhlIHNvdWwgYXMgY2hhcmlvdC5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInJoZXRvcmljXCIsXG4gICAgICBcImxvdmVcIixcbiAgICAgIFwid3JpdGluZ1wiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJwbGF0b1wiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJ0aGUtcmVwdWJsaWNcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIFJlcHVibGljXCIsXG4gICAgXCJhdXRob3JcIjogXCJQbGF0b1wiLFxuICAgIFwieWVhclwiOiBcImMuIDM3NSBCQ1wiLFxuICAgIFwieVNvcnRcIjogLTM3NSxcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCJhbnRpcXVpdHlcIixcbiAgICBcImh1ZVwiOiAyMjUsXG4gICAgXCJibHVyYlwiOiBcIldoYXQgaXMganVzdGljZT8gQSBjaXR5IGJ1aWx0IGluIHdvcmRzIHRvIGZpbmQgb3V0LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwianVzdGljZVwiLFxuICAgICAgXCJpZGVhbC1zdGF0ZVwiLFxuICAgICAgXCJjYXZlXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInBsYXRvXCIsXG4gICAgICBcIm9uLXRoZS1zdGF0ZVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJuaWNvbWFjaGVhbi1ldGhpY3NcIixcbiAgICBcInRpdGxlXCI6IFwiTmljb21hY2hlYW4gRXRoaWNzXCIsXG4gICAgXCJhdXRob3JcIjogXCJBcmlzdG90bGVcIixcbiAgICBcInllYXJcIjogXCJjLiAzNTAgQkNcIixcbiAgICBcInlTb3J0XCI6IC0zNTAsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogOTAsXG4gICAgXCJibHVyYlwiOiBcIkhvdyB0byBsaXZlIHdlbGwsIGRlZmluZWQgYnkgdGhlIG1hbiB3aG8gbGlrZWQgZGVmaW5pdGlvbnMuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJ2aXJ0dWVcIixcbiAgICAgIFwiaGFwcGluZXNzXCIsXG4gICAgICBcImhhYml0XCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImFyaXN0b3RsZVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJhcmlzdG90bGUtcG9saXRpY3NcIixcbiAgICBcInRpdGxlXCI6IFwiUG9saXRpY3NcIixcbiAgICBcImF1dGhvclwiOiBcIkFyaXN0b3RsZVwiLFxuICAgIFwieWVhclwiOiBcImMuIDMzNSBCQ1wiLFxuICAgIFwieVNvcnRcIjogLTMzNSxcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCJhbnRpcXVpdHlcIixcbiAgICBcImh1ZVwiOiAzMTAsXG4gICAgXCJibHVyYlwiOiBcIk1hbiBpcyBhIHBvbGl0aWNhbCBhbmltYWwuIERpc2N1c3MuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJwb2xpc1wiLFxuICAgICAgXCJjaXRpemVuc2hpcFwiLFxuICAgICAgXCJjb25zdGl0dXRpb25zXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImFyaXN0b3RsZVwiLFxuICAgICAgXCJvbi10aGUtc3RhdGVcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwicG9ldGljc1wiLFxuICAgIFwidGl0bGVcIjogXCJQb2V0aWNzXCIsXG4gICAgXCJhdXRob3JcIjogXCJBcmlzdG90bGVcIixcbiAgICBcInllYXJcIjogXCJjLiAzMzUgQkNcIixcbiAgICBcInlTb3J0XCI6IC0zMzQsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogMTUwLFxuICAgIFwiYmx1cmJcIjogXCJXaHkgdHJhZ2VkeSB3b3JrcywgZGlzc2VjdGVkLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwidHJhZ2VkeVwiLFxuICAgICAgXCJtaW1lc2lzXCIsXG4gICAgICBcImNhdGhhcnNpc1wiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJhcmlzdG90bGVcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwidGhlLWhpc3Rvcmllc1wiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgSGlzdG9yaWVzXCIsXG4gICAgXCJhdXRob3JcIjogXCJIZXJvZG90dXNcIixcbiAgICBcInllYXJcIjogXCJjLiA0NDAgQkNcIixcbiAgICBcInlTb3J0XCI6IC00NDAsXG4gICAgXCJmb3JtXCI6IFwiaGlzdG9yeVwiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogNjAsXG4gICAgXCJibHVyYlwiOiBcIlRoZSBmaXJzdCBoaXN0b3J5IGJvb2ssIGhhbGYgZXRobm9ncmFwaHkgYW5kIGhhbGYgdGFsbCB0YWxlLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwicGVyc2lhXCIsXG4gICAgICBcImdyZWVjZVwiLFxuICAgICAgXCJjdXN0b21cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiYW5jaWVudC1oaXN0b3J5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInBlbG9wb25uZXNpYW4td2FyXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkhpc3Rvcnkgb2YgdGhlIFBlbG9wb25uZXNpYW4gV2FyXCIsXG4gICAgXCJhdXRob3JcIjogXCJUaHVjeWRpZGVzXCIsXG4gICAgXCJ5ZWFyXCI6IFwiYy4gNDAwIEJDXCIsXG4gICAgXCJ5U29ydFwiOiAtNDAwLFxuICAgIFwiZm9ybVwiOiBcImhpc3RvcnlcIixcbiAgICBcImVyYVwiOiBcImFudGlxdWl0eVwiLFxuICAgIFwiaHVlXCI6IDYwLFxuICAgIFwiYmx1cmJcIjogXCJBdGhlbnMgdmVyc3VzIFNwYXJ0YSwgYnkgYSBwYXJ0aWNpcGFudCB3aG8gdG9vayBub3Rlcy5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcIndhclwiLFxuICAgICAgXCJwb3dlclwiLFxuICAgICAgXCJyZWFsaXNtXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImFuY2llbnQtaGlzdG9yeVwiLFxuICAgICAgXCJvbi13YXJcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwidGhlLWFydC1vZi13YXJcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIEFydCBvZiBXYXJcIixcbiAgICBcImF1dGhvclwiOiBcIlN1biBUenVcIixcbiAgICBcInllYXJcIjogXCJjLiA1MDAgQkNcIixcbiAgICBcInlTb3J0XCI6IC01MDAsXG4gICAgXCJmb3JtXCI6IFwic3RyYXRlZ3lcIixcbiAgICBcImVyYVwiOiBcImFudGlxdWl0eVwiLFxuICAgIFwiaHVlXCI6IDM1LFxuICAgIFwiYmx1cmJcIjogXCJXaW4gd2l0aG91dCBmaWdodGluZywgd2hlbiB5b3UgY2FuLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwic3RyYXRlZ3lcIixcbiAgICAgIFwiZGVjZXB0aW9uXCIsXG4gICAgICBcInRlcnJhaW5cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic3RyYXRlZ3lcIixcbiAgICAgIFwib24td2FyXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInRoZS1tYW51YWxcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIE1hbnVhbFwiLFxuICAgIFwiYXV0aG9yXCI6IFwiRXBpY3RldHVzXCIsXG4gICAgXCJ5ZWFyXCI6IFwiYy4gMTI1IEFEXCIsXG4gICAgXCJ5U29ydFwiOiAxMjUsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogMjUsXG4gICAgXCJibHVyYlwiOiBcIlBvY2tldC1zaXplZCBzdG9pY2lzbSwgZnJvbSBhIGZvcm1lciBzbGF2ZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInN0b2ljaXNtXCIsXG4gICAgICBcImNvbnRyb2xcIixcbiAgICAgIFwiZXF1YW5pbWl0eVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJzdG9pY3NcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwibWVkaXRhdGlvbnNcIixcbiAgICBcInRpdGxlXCI6IFwiTWVkaXRhdGlvbnNcIixcbiAgICBcImF1dGhvclwiOiBcIk1hcmN1cyBBdXJlbGl1c1wiLFxuICAgIFwieWVhclwiOiBcImMuIDE3NSBBRFwiLFxuICAgIFwieVNvcnRcIjogMTc1LFxuICAgIFwiZm9ybVwiOiBcInBoaWxvc29waHlcIixcbiAgICBcImVyYVwiOiBcImFudGlxdWl0eVwiLFxuICAgIFwiaHVlXCI6IDkwLFxuICAgIFwiYmx1cmJcIjogXCJBIFJvbWFuIGVtcGVyb3IgdGFsa3MgdG8gaGltc2VsZiBpbiB0aGUgZGFyay5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInN0b2ljaXNtXCIsXG4gICAgICBcImR1dHlcIixcbiAgICAgIFwiaW1wZXJtYW5lbmNlXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInN0b2ljc1wiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJ0aGUtYWVuZWlkXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBBZW5laWRcIixcbiAgICBcImF1dGhvclwiOiBcIlZpcmdpbFwiLFxuICAgIFwieWVhclwiOiBcImMuIDE5IEJDXCIsXG4gICAgXCJ5U29ydFwiOiAtMTksXG4gICAgXCJmb3JtXCI6IFwiZXBpY1wiLFxuICAgIFwiZXJhXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJodWVcIjogOTAsXG4gICAgXCJibHVyYlwiOiBcIkEgcmVmdWdlZSBmcm9tIFRyb3kgZm91bmRzIFJvbWUsIHNvcnQgb2YuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJkdXR5XCIsXG4gICAgICBcImV4aWxlXCIsXG4gICAgICBcImVtcGlyZVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJhbmNpZW50LWVwaWNzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImNvbmZlc3Npb25zXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkNvbmZlc3Npb25zXCIsXG4gICAgXCJhdXRob3JcIjogXCJBdWd1c3RpbmVcIixcbiAgICBcInllYXJcIjogXCJjLiA0MDAgQURcIixcbiAgICBcInlTb3J0XCI6IDQwMCxcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCJhbnRpcXVpdHlcIixcbiAgICBcImh1ZVwiOiAyNSxcbiAgICBcImJsdXJiXCI6IFwiVGhlIGZpcnN0IHJlYWwgYXV0b2Jpb2dyYXBoeSBcdTIwMTQgYW5kIGFuIGFyZ3VtZW50IHdpdGggR29kLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibWVtb3J5XCIsXG4gICAgICBcImNvbnZlcnNpb25cIixcbiAgICAgIFwidGltZVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJjaHJpc3RpYW4tcGhpbG9zb3BoeVwiLFxuICAgICAgXCJjaHJpc3RpYW4tdHJhZGl0aW9uXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImJlb3d1bGZcIixcbiAgICBcInRpdGxlXCI6IFwiQmVvd3VsZlwiLFxuICAgIFwiYXV0aG9yXCI6IFwiQW5vbnltb3VzXCIsXG4gICAgXCJ0cmFkaXRpb25cIjogXCJPbGQgRW5nbGlzaFwiLFxuICAgIFwieWVhclwiOiBcImMuIDEwMDBcIixcbiAgICBcInlTb3J0XCI6IDEwMDAsXG4gICAgXCJmb3JtXCI6IFwiZXBpY1wiLFxuICAgIFwiZXJhXCI6IFwibWVkaWV2YWxcIixcbiAgICBcImh1ZVwiOiAyMDAsXG4gICAgXCJibHVyYlwiOiBcIk1vbnN0ZXJzLCBtZWFkLWhhbGxzLCBhbGxpdGVyYXRpdmUgZ3JhbmRldXIuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJoZXJvaXNtXCIsXG4gICAgICBcIm1vbnN0ZXJzXCIsXG4gICAgICBcImZhdGVcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwibWVkaWV2YWwtZXBpY3NcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwibWFnbmEtY2FydGFcIixcbiAgICBcInRpdGxlXCI6IFwiTWFnbmEgQ2FydGFcIixcbiAgICBcImF1dGhvclwiOiBcIktpbmcgSm9obiAmIHRoZSBFbmdsaXNoIEJhcm9uc1wiLFxuICAgIFwieWVhclwiOiBcIjEyMTVcIixcbiAgICBcInlTb3J0XCI6IDEyMTUsXG4gICAgXCJmb3JtXCI6IFwiaGlzdG9yeVwiLFxuICAgIFwiZXJhXCI6IFwibWVkaWV2YWxcIixcbiAgICBcImh1ZVwiOiA5MCxcbiAgICBcImJsdXJiXCI6IFwiVGhlIGZpcnN0IHRpbWUgYSBraW5nIHNpZ25lZCBhd2F5IHNvbWUgb2YgdGhlIHBvd2VyLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibGF3XCIsXG4gICAgICBcImxpYmVydHlcIixcbiAgICAgIFwidHlyYW5ueVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJmb3VuZGluZy1kb2NzXCIsXG4gICAgICBcIm9uLXBvd2VyXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImRpdmluZS1jb21lZHlcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIERpdmluZSBDb21lZHlcIixcbiAgICBcImF1dGhvclwiOiBcIkRhbnRlIEFsaWdoaWVyaVwiLFxuICAgIFwieWVhclwiOiBcIjEzMjBcIixcbiAgICBcInlTb3J0XCI6IDEzMjAsXG4gICAgXCJmb3JtXCI6IFwiZXBpY1wiLFxuICAgIFwiZXJhXCI6IFwibWVkaWV2YWxcIixcbiAgICBcImh1ZVwiOiAzNSxcbiAgICBcImJsdXJiXCI6IFwiQSBndWlkZWQgdG91ciBvZiBoZWxsLCBwdXJnYXRvcnksIGFuZCBwYXJhZGlzZSBcdTIwMTQgaW4gdGVyemEgcmltYS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImFmdGVybGlmZVwiLFxuICAgICAgXCJsb3ZlXCIsXG4gICAgICBcInNpblwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJzYWNyZWQtZXBpY3NcIixcbiAgICAgIFwiY2hyaXN0aWFuLXRyYWRpdGlvblwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJpbWl0YXRpb24tb2YtY2hyaXN0XCIsXG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBJbWl0YXRpb24gb2YgQ2hyaXN0XCIsXG4gICAgXCJhdXRob3JcIjogXCJUaG9tYXMgXHUwMEUwIEtlbXBpc1wiLFxuICAgIFwieWVhclwiOiBcIjE0MThcIixcbiAgICBcInlTb3J0XCI6IDE0MTgsXG4gICAgXCJmb3JtXCI6IFwic2NyaXB0dXJlXCIsXG4gICAgXCJlcmFcIjogXCJtZWRpZXZhbFwiLFxuICAgIFwiaHVlXCI6IDIzMCxcbiAgICBcImJsdXJiXCI6IFwiRGV2b3Rpb25hbC4gVGhlIGJvb2sgc2Vjb25kIG9ubHkgdG8gdGhlIEJpYmxlIGluIG9sZCBtb25hc3RpYyBjZWxscy5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImh1bWlsaXR5XCIsXG4gICAgICBcImludGVyaW9yLWxpZmVcIixcbiAgICAgIFwiZGV2b3Rpb25cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiY2hyaXN0aWFuLXBoaWxvc29waHlcIixcbiAgICAgIFwiYmlibGUtYW5kLWRldm90aW9uXCIsXG4gICAgICBcImNocmlzdGlhbi10cmFkaXRpb25cIlxuICAgIF0sXG4gICAgXCJwcm9ncmVzc1wiOiAwLjAxLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInRoZS1wcmluY2VcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIFByaW5jZVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiTmljY29sXHUwMEYyIE1hY2hpYXZlbGxpXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTUzMlwiLFxuICAgIFwieVNvcnRcIjogMTUzMixcbiAgICBcImZvcm1cIjogXCJwb2xpdGljYWxcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI1LFxuICAgIFwiYmx1cmJcIjogXCJIb3cgdG8gdGFrZSBwb3dlciBhbmQgbm90IGxvc2UgaXQuIE5vdG9yaW91c2x5IHByYWN0aWNhbC5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInBvd2VyXCIsXG4gICAgICBcImZvcnR1bmVcIixcbiAgICAgIFwidmlydFx1MDBGOVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJvbi1wb3dlclwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJsZXZpYXRoYW5cIixcbiAgICBcInRpdGxlXCI6IFwiTGV2aWF0aGFuXCIsXG4gICAgXCJhdXRob3JcIjogXCJUaG9tYXMgSG9iYmVzXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTY1MVwiLFxuICAgIFwieVNvcnRcIjogMTY1MSxcbiAgICBcImZvcm1cIjogXCJwb2xpdGljYWxcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDIxNSxcbiAgICBcImJsdXJiXCI6IFwiV2l0aG91dCB0aGUgc3RhdGUsIGxpZmUgaXMgXFxcIm5hc3R5LCBicnV0aXNoLCBhbmQgc2hvcnQuXFxcIlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwic292ZXJlaWdudHlcIixcbiAgICAgIFwic3RhdGUtb2YtbmF0dXJlXCIsXG4gICAgICBcImNvbnRyYWN0XCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcIm9uLXRoZS1zdGF0ZVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJzZWNvbmQtdHJlYXRpc2VcIixcbiAgICBcInRpdGxlXCI6IFwiU2Vjb25kIFRyZWF0aXNlIG9mIEdvdmVybm1lbnRcIixcbiAgICBcImF1dGhvclwiOiBcIkpvaG4gTG9ja2VcIixcbiAgICBcInllYXJcIjogXCIxNjg5XCIsXG4gICAgXCJ5U29ydFwiOiAxNjg5LFxuICAgIFwiZm9ybVwiOiBcInBvbGl0aWNhbFwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMTUwLFxuICAgIFwiYmx1cmJcIjogXCJXaGVyZSByaWdodHMgY29tZSBmcm9tLCBhbmQgd2hlbiByZXZvbHV0aW9uIGlzIHBlcm1pdHRlZC5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInByb3BlcnR5XCIsXG4gICAgICBcImNvbnNlbnRcIixcbiAgICAgIFwibmF0dXJhbC1yaWdodHNcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwib24tdGhlLXN0YXRlXCIsXG4gICAgICBcImZvdW5kaW5nLWRvY3NcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiY29tZWR5LW9mLWVycm9yc1wiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgQ29tZWR5IG9mIEVycm9yc1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBTaGFrZXNwZWFyZVwiLFxuICAgIFwieWVhclwiOiBcImMuIDE1OTRcIixcbiAgICBcInlTb3J0XCI6IDE1OTQsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDE1MCxcbiAgICBcInN1YlwiOiBcImNvbWVkeVwiLFxuICAgIFwiYmx1cmJcIjogXCJUd28gc2V0cyBvZiB0d2lucywgb25lIGNpdHksIGluZmluaXRlIGNvbmZ1c2lvbi5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcIm1pc3Rha2VuLWlkZW50aXR5XCIsXG4gICAgICBcImZhcmNlXCIsXG4gICAgICBcInJldW5pb25cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2hha2VzcGVhcmUtY29tZWR5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcIm1pZHN1bW1lclwiLFxuICAgIFwidGl0bGVcIjogXCJBIE1pZHN1bW1lciBOaWdodCdzIERyZWFtXCIsXG4gICAgXCJhdXRob3JcIjogXCJXaWxsaWFtIFNoYWtlc3BlYXJlXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTU5NVwiLFxuICAgIFwieVNvcnRcIjogMTU5NSxcbiAgICBcImZvcm1cIjogXCJkcmFtYVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMTUwLFxuICAgIFwic3ViXCI6IFwiY29tZWR5XCIsXG4gICAgXCJibHVyYlwiOiBcIkZhaXJpZXMsIGxvdmVycywgZG9ua2V5cywgYW5kIGEgcGxheSB3aXRoaW4gYSBwbGF5LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibG92ZVwiLFxuICAgICAgXCJkcmVhbVwiLFxuICAgICAgXCJlbmNoYW50bWVudFwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJzaGFrZXNwZWFyZS1jb21lZHlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwicm9tZW8tYW5kLWp1bGlldFwiLFxuICAgIFwidGl0bGVcIjogXCJSb21lbyBhbmQgSnVsaWV0XCIsXG4gICAgXCJhdXRob3JcIjogXCJXaWxsaWFtIFNoYWtlc3BlYXJlXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTU5N1wiLFxuICAgIFwieVNvcnRcIjogMTU5NyxcbiAgICBcImZvcm1cIjogXCJkcmFtYVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMzU1LFxuICAgIFwic3ViXCI6IFwidHJhZ2VkeVwiLFxuICAgIFwiYmx1cmJcIjogXCJUd28gaG91c2Vob2xkcywgYm90aCBhbGlrZSBpbiBkaWduaXR5LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibG92ZVwiLFxuICAgICAgXCJmZXVkXCIsXG4gICAgICBcInlvdXRoXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInNoYWtlc3BlYXJlLXRyYWdlZHlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwidGFtaW5nLW9mLXRoZS1zaHJld1wiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgVGFtaW5nIG9mIHRoZSBTaHJld1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBTaGFrZXNwZWFyZVwiLFxuICAgIFwieWVhclwiOiBcImMuIDE1OTJcIixcbiAgICBcInlTb3J0XCI6IDE1OTIsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDE1MCxcbiAgICBcInN1YlwiOiBcImNvbWVkeVwiLFxuICAgIFwiYmx1cmJcIjogXCJBIGZhbW91c2x5IHRob3JueSBjb3VydHNoaXAgY29tZWR5LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibWFycmlhZ2VcIixcbiAgICAgIFwicG93ZXJcIixcbiAgICAgIFwiZGlzZ3Vpc2VcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2hha2VzcGVhcmUtY29tZWR5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInJpY2hhcmQtaWlpXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlJpY2hhcmQgSUlJXCIsXG4gICAgXCJhdXRob3JcIjogXCJXaWxsaWFtIFNoYWtlc3BlYXJlXCIsXG4gICAgXCJ5ZWFyXCI6IFwiYy4gMTU5M1wiLFxuICAgIFwieVNvcnRcIjogMTU5MyxcbiAgICBcImZvcm1cIjogXCJkcmFtYVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMzU1LFxuICAgIFwic3ViXCI6IFwiaGlzdG9yeVwiLFxuICAgIFwiYmx1cmJcIjogXCJBIHZpbGxhaW4gaW4gc29saWxvcXV5LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiYW1iaXRpb25cIixcbiAgICAgIFwidHlyYW5ueVwiLFxuICAgICAgXCJjb25zY2llbmNlXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInNoYWtlc3BlYXJlLWhpc3RvcnlcIixcbiAgICAgIFwib24tcG93ZXJcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwibWVyY2hhbnQtb2YtdmVuaWNlXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBNZXJjaGFudCBvZiBWZW5pY2VcIixcbiAgICBcImF1dGhvclwiOiBcIldpbGxpYW0gU2hha2VzcGVhcmVcIixcbiAgICBcInllYXJcIjogXCJjLiAxNTk3XCIsXG4gICAgXCJ5U29ydFwiOiAxNTk4LFxuICAgIFwiZm9ybVwiOiBcImRyYW1hXCIsXG4gICAgXCJlcmFcIjogXCJlYXJseS1tb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAxNTAsXG4gICAgXCJzdWJcIjogXCJjb21lZHlcIixcbiAgICBcImJsdXJiXCI6IFwiQSBwb3VuZCBvZiBmbGVzaCwgYSBjYXNrZXQgcmlkZGxlLCBhIGNvdXJ0cm9vbSB0dXJuLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwianVzdGljZVwiLFxuICAgICAgXCJtZXJjeVwiLFxuICAgICAgXCJwcmVqdWRpY2VcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2hha2VzcGVhcmUtY29tZWR5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcIm11Y2gtYWRvLWFib3V0LW5vdGhpbmdcIixcbiAgICBcInRpdGxlXCI6IFwiTXVjaCBBZG8gQWJvdXQgTm90aGluZ1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBTaGFrZXNwZWFyZVwiLFxuICAgIFwieWVhclwiOiBcImMuIDE1OTlcIixcbiAgICBcInlTb3J0XCI6IDE1OTksXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDE1MCxcbiAgICBcInN1YlwiOiBcImNvbWVkeVwiLFxuICAgIFwiYmx1cmJcIjogXCJCYW50ZXIsIHNsYW5kZXIsIGFuZCBCZWF0cmljZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcIndpdFwiLFxuICAgICAgXCJkZWNlcHRpb25cIixcbiAgICAgIFwiY291cnRzaGlwXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInNoYWtlc3BlYXJlLWNvbWVkeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJoZW5yeS12XCIsXG4gICAgXCJ0aXRsZVwiOiBcIkhlbnJ5IFZcIixcbiAgICBcImF1dGhvclwiOiBcIldpbGxpYW0gU2hha2VzcGVhcmVcIixcbiAgICBcInllYXJcIjogXCIxNTk5XCIsXG4gICAgXCJ5U29ydFwiOiAxNTk5LjEsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDM1NSxcbiAgICBcInN1YlwiOiBcImhpc3RvcnlcIixcbiAgICBcImJsdXJiXCI6IFwiT25jZSBtb3JlIHVudG8gdGhlIGJyZWFjaC5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImtpbmdzaGlwXCIsXG4gICAgICBcIndhclwiLFxuICAgICAgXCJyaGV0b3JpY1wiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJzaGFrZXNwZWFyZS1oaXN0b3J5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImp1bGl1cy1jYWVzYXJcIixcbiAgICBcInRpdGxlXCI6IFwiSnVsaXVzIENhZXNhclwiLFxuICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBTaGFrZXNwZWFyZVwiLFxuICAgIFwieWVhclwiOiBcIjE1OTlcIixcbiAgICBcInlTb3J0XCI6IDE1OTkuMixcbiAgICBcImZvcm1cIjogXCJkcmFtYVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMzU1LFxuICAgIFwic3ViXCI6IFwidHJhZ2VkeVwiLFxuICAgIFwiYmx1cmJcIjogXCJFdCB0dSwgQnJ1dGU/XCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJjb25zcGlyYWN5XCIsXG4gICAgICBcInJoZXRvcmljXCIsXG4gICAgICBcInR5cmFubnlcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2hha2VzcGVhcmUtdHJhZ2VkeVwiLFxuICAgICAgXCJvbi1wb3dlclwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJhcy15b3UtbGlrZS1pdFwiLFxuICAgIFwidGl0bGVcIjogXCJBcyBZb3UgTGlrZSBJdFwiLFxuICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBTaGFrZXNwZWFyZVwiLFxuICAgIFwieWVhclwiOiBcImMuIDE1OTlcIixcbiAgICBcInlTb3J0XCI6IDE1OTkuMyxcbiAgICBcImZvcm1cIjogXCJkcmFtYVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMTUwLFxuICAgIFwic3ViXCI6IFwiY29tZWR5XCIsXG4gICAgXCJibHVyYlwiOiBcIkFsbCB0aGUgd29ybGQncyBhIHN0YWdlLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwicGFzdG9yYWxcIixcbiAgICAgIFwiZGlzZ3Vpc2VcIixcbiAgICAgIFwibG92ZVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJzaGFrZXNwZWFyZS1jb21lZHlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiaGVucnktaXYtcGFydC0yXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkhlbnJ5IElWLCBQYXJ0IDJcIixcbiAgICBcImF1dGhvclwiOiBcIldpbGxpYW0gU2hha2VzcGVhcmVcIixcbiAgICBcInllYXJcIjogXCJjLiAxNTk5XCIsXG4gICAgXCJ5U29ydFwiOiAxNTk5LjQsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDM1NSxcbiAgICBcInN1YlwiOiBcImhpc3RvcnlcIixcbiAgICBcImJsdXJiXCI6IFwiRmFsc3RhZmYsIGFuZCB0aGUgcHJpY2Ugb2YgYmVjb21pbmcga2luZy5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImZhdGhlcnNcIixcbiAgICAgIFwia2luZ3NoaXBcIixcbiAgICAgIFwicmVqZWN0aW9uXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInNoYWtlc3BlYXJlLWhpc3RvcnlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwibWVycnktd2l2ZXMtb2Ytd2luZHNvclwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgTWVycnkgV2l2ZXMgb2YgV2luZHNvclwiLFxuICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBTaGFrZXNwZWFyZVwiLFxuICAgIFwieWVhclwiOiBcImMuIDE2MDJcIixcbiAgICBcInlTb3J0XCI6IDE2MDIsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDE1MCxcbiAgICBcInN1YlwiOiBcImNvbWVkeVwiLFxuICAgIFwiYmx1cmJcIjogXCJGYWxzdGFmZiB0cmllcyB0byBzZWR1Y2UgdHdvIHdvbWVuOyBib3RoIG5vdGljZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInNjaGVtaW5nXCIsXG4gICAgICBcImZhcmNlXCIsXG4gICAgICBcImplYWxvdXN5XCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInNoYWtlc3BlYXJlLWNvbWVkeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJoYW1sZXRcIixcbiAgICBcInRpdGxlXCI6IFwiSGFtbGV0XCIsXG4gICAgXCJhdXRob3JcIjogXCJXaWxsaWFtIFNoYWtlc3BlYXJlXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTYwMFwiLFxuICAgIFwieVNvcnRcIjogMTYwMCxcbiAgICBcImZvcm1cIjogXCJkcmFtYVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMjY1LFxuICAgIFwic3ViXCI6IFwidHJhZ2VkeVwiLFxuICAgIFwiYmx1cmJcIjogXCJBIGdob3N0LCBhIHByaW5jZSwgdGhlIGdyZWF0IGRlZmVycmFsLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwicmV2ZW5nZVwiLFxuICAgICAgXCJtZWxhbmNob2x5XCIsXG4gICAgICBcIm1vcnRhbGl0eVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJzaGFrZXNwZWFyZS10cmFnZWR5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXSxcbiAgICBcInN0YXR1c1wiOiBcImZpbmlzaGVkXCIsXG4gICAgXCJmaW5pc2hlZE9uXCI6IFwiMjAyNi0wMy0xNFwiXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwidHdlbGZ0aC1uaWdodFwiLFxuICAgIFwidGl0bGVcIjogXCJUd2VsZnRoIE5pZ2h0XCIsXG4gICAgXCJhdXRob3JcIjogXCJXaWxsaWFtIFNoYWtlc3BlYXJlXCIsXG4gICAgXCJ5ZWFyXCI6IFwiYy4gMTYwMVwiLFxuICAgIFwieVNvcnRcIjogMTYwMSxcbiAgICBcImZvcm1cIjogXCJkcmFtYVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMTUwLFxuICAgIFwic3ViXCI6IFwiY29tZWR5XCIsXG4gICAgXCJibHVyYlwiOiBcIlNoaXB3cmVjaywgY3Jvc3MtZHJlc3NpbmcsIGxvdmUgYXQgYWxsIHRoZSB3cm9uZyBhbmdsZXMuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJkaXNndWlzZVwiLFxuICAgICAgXCJsb25naW5nXCIsXG4gICAgICBcImZvbGx5XCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInNoYWtlc3BlYXJlLWNvbWVkeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJvdGhlbGxvXCIsXG4gICAgXCJ0aXRsZVwiOiBcIk90aGVsbG9cIixcbiAgICBcImF1dGhvclwiOiBcIldpbGxpYW0gU2hha2VzcGVhcmVcIixcbiAgICBcInllYXJcIjogXCJjLiAxNjAzXCIsXG4gICAgXCJ5U29ydFwiOiAxNjAzLFxuICAgIFwiZm9ybVwiOiBcImRyYW1hXCIsXG4gICAgXCJlcmFcIjogXCJlYXJseS1tb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAzNTUsXG4gICAgXCJzdWJcIjogXCJ0cmFnZWR5XCIsXG4gICAgXCJibHVyYlwiOiBcIklhZ28gd2hpc3BlcnM7IGEgZ3JlYXQgbWFuIHVucmF2ZWxzLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiamVhbG91c3lcIixcbiAgICAgIFwicmFjZVwiLFxuICAgICAgXCJtYW5pcHVsYXRpb25cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2hha2VzcGVhcmUtdHJhZ2VkeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJtZWFzdXJlLWZvci1tZWFzdXJlXCIsXG4gICAgXCJ0aXRsZVwiOiBcIk1lYXN1cmUgZm9yIE1lYXN1cmVcIixcbiAgICBcImF1dGhvclwiOiBcIldpbGxpYW0gU2hha2VzcGVhcmVcIixcbiAgICBcInllYXJcIjogXCJjLiAxNjA0XCIsXG4gICAgXCJ5U29ydFwiOiAxNjA0LFxuICAgIFwiZm9ybVwiOiBcImRyYW1hXCIsXG4gICAgXCJlcmFcIjogXCJlYXJseS1tb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAyNjUsXG4gICAgXCJzdWJcIjogXCJjb21lZHlcIixcbiAgICBcImJsdXJiXCI6IFwiQSBwcm9ibGVtIHBsYXkgYWJvdXQgYSBwcm9ibGVtIGRlcHV0eS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcIm1lcmN5XCIsXG4gICAgICBcImxhd1wiLFxuICAgICAgXCJoeXBvY3Jpc3lcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2hha2VzcGVhcmUtY29tZWR5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImtpbmctbGVhclwiLFxuICAgIFwidGl0bGVcIjogXCJLaW5nIExlYXJcIixcbiAgICBcImF1dGhvclwiOiBcIldpbGxpYW0gU2hha2VzcGVhcmVcIixcbiAgICBcInllYXJcIjogXCJjLiAxNjA2XCIsXG4gICAgXCJ5U29ydFwiOiAxNjA2LFxuICAgIFwiZm9ybVwiOiBcImRyYW1hXCIsXG4gICAgXCJlcmFcIjogXCJlYXJseS1tb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAyNjUsXG4gICAgXCJzdWJcIjogXCJ0cmFnZWR5XCIsXG4gICAgXCJibHVyYlwiOiBcIkRpdmlkZSB0aGUga2luZ2RvbSwgbG9zZSB5b3VyIG1pbmQuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJvbGQtYWdlXCIsXG4gICAgICBcImZvbGx5XCIsXG4gICAgICBcIm5vdGhpbmdcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2hha2VzcGVhcmUtdHJhZ2VkeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJtYWNiZXRoXCIsXG4gICAgXCJ0aXRsZVwiOiBcIk1hY2JldGhcIixcbiAgICBcImF1dGhvclwiOiBcIldpbGxpYW0gU2hha2VzcGVhcmVcIixcbiAgICBcInllYXJcIjogXCIxNjA2XCIsXG4gICAgXCJ5U29ydFwiOiAxNjA2LjEsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDM1NSxcbiAgICBcInN1YlwiOiBcInRyYWdlZHlcIixcbiAgICBcImJsdXJiXCI6IFwiVGhyZWUgd2l0Y2hlcywgYW4gYW1iaXRpb3VzIHdpZmUsIGEgdG9tb3Jyb3cgYW5kIHRvbW9ycm93LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiYW1iaXRpb25cIixcbiAgICAgIFwicHJvcGhlY3lcIixcbiAgICAgIFwiZ3VpbHRcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2hha2VzcGVhcmUtdHJhZ2VkeVwiLFxuICAgICAgXCJvbi1wb3dlclwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJhbnRvbnktYW5kLWNsZW9wYXRyYVwiLFxuICAgIFwidGl0bGVcIjogXCJBbnRvbnkgYW5kIENsZW9wYXRyYVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBTaGFrZXNwZWFyZVwiLFxuICAgIFwieWVhclwiOiBcImMuIDE2MDdcIixcbiAgICBcInlTb3J0XCI6IDE2MDcsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDM1NSxcbiAgICBcInN1YlwiOiBcInRyYWdlZHlcIixcbiAgICBcImJsdXJiXCI6IFwiVHdvIGVtcGlyZXMsIHR3byBlZ29zLCBvbmUgTmlsZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImxvdmVcIixcbiAgICAgIFwicG9saXRpY3NcIixcbiAgICAgIFwiZ3JhbmRldXJcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2hha2VzcGVhcmUtdHJhZ2VkeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJjb3Jpb2xhbnVzXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkNvcmlvbGFudXNcIixcbiAgICBcImF1dGhvclwiOiBcIldpbGxpYW0gU2hha2VzcGVhcmVcIixcbiAgICBcInllYXJcIjogXCJjLiAxNjA4XCIsXG4gICAgXCJ5U29ydFwiOiAxNjA4LFxuICAgIFwiZm9ybVwiOiBcImRyYW1hXCIsXG4gICAgXCJlcmFcIjogXCJlYXJseS1tb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAzNTUsXG4gICAgXCJzdWJcIjogXCJ0cmFnZWR5XCIsXG4gICAgXCJibHVyYlwiOiBcIkEgd2FycmlvciB3aG8gY2Fubm90IGJvdyB0byB0aGUgY3Jvd2QuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJwcmlkZVwiLFxuICAgICAgXCJwb3B1bGlzbVwiLFxuICAgICAgXCJleGlsZVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJzaGFrZXNwZWFyZS10cmFnZWR5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcIndpbnRlcnMtdGFsZVwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgV2ludGVyJ3MgVGFsZVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBTaGFrZXNwZWFyZVwiLFxuICAgIFwieWVhclwiOiBcImMuIDE2MTFcIixcbiAgICBcInlTb3J0XCI6IDE2MTEsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI2NSxcbiAgICBcInN1YlwiOiBcInJvbWFuY2VcIixcbiAgICBcImJsdXJiXCI6IFwiSmVhbG91c3ksIHNpeHRlZW4geWVhcnMsIGEgc3RhdHVlIHRoYXQgYnJlYXRoZXMuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJqZWFsb3VzeVwiLFxuICAgICAgXCJ0aW1lXCIsXG4gICAgICBcInJldW5pb25cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2hha2VzcGVhcmUtcm9tYW5jZVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJ0aGUtdGVtcGVzdFwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgVGVtcGVzdFwiLFxuICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBTaGFrZXNwZWFyZVwiLFxuICAgIFwieWVhclwiOiBcIjE2MTFcIixcbiAgICBcInlTb3J0XCI6IDE2MTEuMSxcbiAgICBcImZvcm1cIjogXCJkcmFtYVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMjAwLFxuICAgIFwic3ViXCI6IFwicm9tYW5jZVwiLFxuICAgIFwiYmx1cmJcIjogXCJBIG1hZ2ljaWFuIG9uIGFuIGlzbGFuZCwgc2V0dGxpbmcgYWNjb3VudHMuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJtYWdpY1wiLFxuICAgICAgXCJmb3JnaXZlbmVzc1wiLFxuICAgICAgXCJjb2xvbmlhbGlzbVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJzaGFrZXNwZWFyZS1yb21hbmNlXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImN5bWJlbGluZVwiLFxuICAgIFwidGl0bGVcIjogXCJDeW1iZWxpbmVcIixcbiAgICBcImF1dGhvclwiOiBcIldpbGxpYW0gU2hha2VzcGVhcmVcIixcbiAgICBcInllYXJcIjogXCJjLiAxNjExXCIsXG4gICAgXCJ5U29ydFwiOiAxNjExLjIsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDIwMCxcbiAgICBcInN1YlwiOiBcInJvbWFuY2VcIixcbiAgICBcImJsdXJiXCI6IFwiQSBsYXRlIHJvbWFuY2Ugd2l0aCBldmVyeXRoaW5nIGluIGl0LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiamVhbG91c3lcIixcbiAgICAgIFwicmV1bmlvblwiLFxuICAgICAgXCJkaXNndWlzZVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJzaGFrZXNwZWFyZS1yb21hbmNlXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImRlc2NhcnRlcy1tZWRpdGF0aW9uc1wiLFxuICAgIFwidGl0bGVcIjogXCJNZWRpdGF0aW9ucyBvbiBGaXJzdCBQaGlsb3NvcGh5XCIsXG4gICAgXCJhdXRob3JcIjogXCJSZW5cdTAwRTkgRGVzY2FydGVzXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTY0MVwiLFxuICAgIFwieVNvcnRcIjogMTY0MSxcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCJlYXJseS1tb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAyMTUsXG4gICAgXCJibHVyYlwiOiBcIkhvdyB0byBkb3VidCBldmVyeXRoaW5nLCBhbmQgdGhlbiBwdXQgYSBsaXR0bGUgYmFjay5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImRvdWJ0XCIsXG4gICAgICBcIm1pbmRcIixcbiAgICAgIFwiZ29kXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcIm1vZGVybi1waGlsb3NvcGh5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInBhcmFkaXNlLWxvc3RcIixcbiAgICBcInRpdGxlXCI6IFwiUGFyYWRpc2UgTG9zdFwiLFxuICAgIFwiYXV0aG9yXCI6IFwiSm9obiBNaWx0b25cIixcbiAgICBcInllYXJcIjogXCIxNjY3XCIsXG4gICAgXCJ5U29ydFwiOiAxNjY3LFxuICAgIFwiZm9ybVwiOiBcImVwaWNcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI2NSxcbiAgICBcImJsdXJiXCI6IFwiVGhlIGZhbGwsIGluIHR3ZWx2ZSBib29rcyBvZiBibGFuayB2ZXJzZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImZhbGxcIixcbiAgICAgIFwicmViZWxsaW9uXCIsXG4gICAgICBcInByb3ZpZGVuY2VcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2FjcmVkLWVwaWNzXCIsXG4gICAgICBcImNocmlzdGlhbi10cmFkaXRpb25cIlxuICAgIF0sXG4gICAgXCJwcm9ncmVzc1wiOiAwLjY3LFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImNhbmRpZGVcIixcbiAgICBcInRpdGxlXCI6IFwiQ2FuZGlkZVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiVm9sdGFpcmVcIixcbiAgICBcInllYXJcIjogXCIxNzU5XCIsXG4gICAgXCJ5U29ydFwiOiAxNzU5LFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJlYXJseS1tb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAzNSxcbiAgICBcImJsdXJiXCI6IFwiQSB5b3VuZyBvcHRpbWlzdCB0b3VycyB0aGUgd29yc3Qgb2YgYWxsIHBvc3NpYmxlIHdvcmxkcy5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInNhdGlyZVwiLFxuICAgICAgXCJvcHRpbWlzbVwiLFxuICAgICAgXCJ0b3VyXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInNhdGlyaWNhbC1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiZGlzY291cnNlLW9uLWluZXF1YWxpdHlcIixcbiAgICBcInRpdGxlXCI6IFwiRGlzY291cnNlIG9uIHRoZSBPcmlnaW4gb2YgSW5lcXVhbGl0eVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiSmVhbi1KYWNxdWVzIFJvdXNzZWF1XCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTc1NVwiLFxuICAgIFwieVNvcnRcIjogMTc1NSxcbiAgICBcImZvcm1cIjogXCJwb2xpdGljYWxcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDE1MCxcbiAgICBcImJsdXJiXCI6IFwiSG93IHByb3BlcnR5IGludmVudGVkIGluZXF1YWxpdHksIGluIHR3byBlc3NheXMuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJwcm9wZXJ0eVwiLFxuICAgICAgXCJvcmlnaW5zXCIsXG4gICAgICBcImNpdmlsaXphdGlvblwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJvbi1saWJlcnR5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInNvY2lhbC1jb250cmFjdFwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgU29jaWFsIENvbnRyYWN0XCIsXG4gICAgXCJhdXRob3JcIjogXCJKZWFuLUphY3F1ZXMgUm91c3NlYXVcIixcbiAgICBcInllYXJcIjogXCIxNzYyXCIsXG4gICAgXCJ5U29ydFwiOiAxNzYyLFxuICAgIFwiZm9ybVwiOiBcInBvbGl0aWNhbFwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMTUwLFxuICAgIFwiYmx1cmJcIjogXCJCb3JuIGZyZWU7IGV2ZXJ5d2hlcmUgaW4gY2hhaW5zLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiZ2VuZXJhbC13aWxsXCIsXG4gICAgICBcInNvdmVyZWlnbnR5XCIsXG4gICAgICBcImxpYmVydHlcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwib24tdGhlLXN0YXRlXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImthbnQtZ3JvdW5kd29ya1wiLFxuICAgIFwidGl0bGVcIjogXCJHcm91bmR3b3JrIG9mIHRoZSBNZXRhcGh5c2ljcyBvZiBNb3JhbHNcIixcbiAgICBcImF1dGhvclwiOiBcIkltbWFudWVsIEthbnRcIixcbiAgICBcInllYXJcIjogXCIxNzg1XCIsXG4gICAgXCJ5U29ydFwiOiAxNzg1LFxuICAgIFwiZm9ybVwiOiBcInBoaWxvc29waHlcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI2NSxcbiAgICBcImJsdXJiXCI6IFwiRHV0eSwgcmVhc29uLCBhbmQgdGhlIGNhdGVnb3JpY2FsIGltcGVyYXRpdmUgaW4gaXRzIHNob3J0ZXN0IGZvcm0uXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJldGhpY3NcIixcbiAgICAgIFwiZHV0eVwiLFxuICAgICAgXCJyZWFzb25cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwibW9kZXJuLXBoaWxvc29waHlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwidmluZGljYXRpb24tcmlnaHRzLW9mLXdvbWFuXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkEgVmluZGljYXRpb24gb2YgdGhlIFJpZ2h0cyBvZiBXb21hblwiLFxuICAgIFwiYXV0aG9yXCI6IFwiTWFyeSBXb2xsc3RvbmVjcmFmdFwiLFxuICAgIFwieWVhclwiOiBcIjE3OTJcIixcbiAgICBcInlTb3J0XCI6IDE3OTIsXG4gICAgXCJmb3JtXCI6IFwicG9saXRpY2FsXCIsXG4gICAgXCJlcmFcIjogXCJlYXJseS1tb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAzMTAsXG4gICAgXCJibHVyYlwiOiBcIlRoZSBjYXNlIGZvciBlZHVjYXRpbmcgd29tZW4sIG1hZGUgd2hlbiBpdCBzdGlsbCBoYWQgdG8gYmUgbWFkZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInJpZ2h0c1wiLFxuICAgICAgXCJlZHVjYXRpb25cIixcbiAgICAgIFwiZXF1YWxpdHlcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwib24tbGliZXJ0eVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJ1cy1mb3VuZGluZy1kb2N1bWVudHNcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIFVTIEZvdW5kaW5nIERvY3VtZW50c1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiSmVmZmVyc29uLCBNYWRpc29uLCBBZGFtcywgZXQgYWwuXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTc3Nlx1MjAxMzE3OTFcIixcbiAgICBcInlTb3J0XCI6IDE3NzYsXG4gICAgXCJmb3JtXCI6IFwiaGlzdG9yeVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogOTAsXG4gICAgXCJibHVyYlwiOiBcIkRlY2xhcmF0aW9uLCBDb25zdGl0dXRpb24sIEJpbGwgb2YgUmlnaHRzIFx1MjAxNCBidW5kbGVkLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibGliZXJ0eVwiLFxuICAgICAgXCJmZWRlcmFsaXNtXCIsXG4gICAgICBcInJpZ2h0c1wiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJmb3VuZGluZy1kb2NzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImZlZGVyYWxpc3QtcGFwZXJzXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBGZWRlcmFsaXN0IFBhcGVyc1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiSGFtaWx0b24sIE1hZGlzb24sIEpheVwiLFxuICAgIFwieWVhclwiOiBcIjE3ODhcIixcbiAgICBcInlTb3J0XCI6IDE3ODgsXG4gICAgXCJmb3JtXCI6IFwicG9saXRpY2FsXCIsXG4gICAgXCJlcmFcIjogXCJlYXJseS1tb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAyMTUsXG4gICAgXCJibHVyYlwiOiBcIjg1IGVzc2F5cyBkZWZlbmRpbmcgYSBuZXcgY29uc3RpdHV0aW9uLCBwdWJsaXNoZWQgdW5kZXIgXFxcIlB1YmxpdXMuXFxcIlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiZmVkZXJhbGlzbVwiLFxuICAgICAgXCJmYWN0aW9uXCIsXG4gICAgICBcInJhdGlmaWNhdGlvblwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJmb3VuZGluZy1kb2NzXCIsXG4gICAgICBcIm9uLXRoZS1zdGF0ZVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJ3ZXJ0aGVyXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBTb3Jyb3dzIG9mIFlvdW5nIFdlcnRoZXJcIixcbiAgICBcImF1dGhvclwiOiBcIkpvaGFubiBXb2xmZ2FuZyB2b24gR29ldGhlXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTc3NFwiLFxuICAgIFwieVNvcnRcIjogMTc3NCxcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMjUsXG4gICAgXCJibHVyYlwiOiBcIkEgeW91bmcgbWFuIHdyaXRlcyBoaW1zZWxmIGludG8gbG92ZSBhbmQgZGVzcGFpci5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInJvbWFudGljaXNtXCIsXG4gICAgICBcImRlc2lyZVwiLFxuICAgICAgXCJtZWxhbmNob2x5XCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInNhdGlyaWNhbC1ub3ZlbHNcIixcbiAgICAgIFwibW9kZXJuLXBoaWxvc29waHlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiZmF1c3QtcGFydC0xXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkZhdXN0LCBQYXJ0IE9uZVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiSm9oYW5uIFdvbGZnYW5nIHZvbiBHb2V0aGVcIixcbiAgICBcInllYXJcIjogXCIxODA4XCIsXG4gICAgXCJ5U29ydFwiOiAxODA4LFxuICAgIFwiZm9ybVwiOiBcImRyYW1hXCIsXG4gICAgXCJlcmFcIjogXCJtb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAyNjUsXG4gICAgXCJzdWJcIjogXCJ0cmFnZWR5XCIsXG4gICAgXCJibHVyYlwiOiBcIkEgc2Nob2xhciBiYXJnYWlucyBoaXMgc291bDsgcmVzdWx0cyBpbW1lZGlhdGVseSBjb21wbGljYXRlLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwia25vd2xlZGdlXCIsXG4gICAgICBcImJhcmdhaW5cIixcbiAgICAgIFwiZGFtbmF0aW9uXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcIm1vZGVybi1kcmFtYVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF0sXG4gICAgXCJwcm9ncmVzc1wiOiAwLjIyLFxuICAgIFwicGF1c2VkXCI6IHRydWVcbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJwcmlkZS1hbmQtcHJlanVkaWNlXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlByaWRlIGFuZCBQcmVqdWRpY2VcIixcbiAgICBcImF1dGhvclwiOiBcIkphbmUgQXVzdGVuXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTgxM1wiLFxuICAgIFwieVNvcnRcIjogMTgxMyxcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwibW9kZXJuXCIsXG4gICAgXCJodWVcIjogMzEwLFxuICAgIFwiYmx1cmJcIjogXCJBIHRydXRoIHVuaXZlcnNhbGx5IGFja25vd2xlZGdlZC5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcIm1hcnJpYWdlXCIsXG4gICAgICBcImNsYXNzXCIsXG4gICAgICBcImlyb255XCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImVuZ2xpc2gtbm92ZWxzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXSxcbiAgICBcInN0YXR1c1wiOiBcImZpbmlzaGVkXCIsXG4gICAgXCJmaW5pc2hlZE9uXCI6IFwiMjAyNi0wMS0yMlwiXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiZnJhbmtlbnN0ZWluXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkZyYW5rZW5zdGVpblwiLFxuICAgIFwiYXV0aG9yXCI6IFwiTWFyeSBTaGVsbGV5XCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTgxOFwiLFxuICAgIFwieVNvcnRcIjogMTgxOCxcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwibW9kZXJuXCIsXG4gICAgXCJodWVcIjogMTUwLFxuICAgIFwiYmx1cmJcIjogXCJUaGUgZmlyc3Qgc2NpZW5jZS1maWN0aW9uIG5vdmVsLCB3cml0dGVuIGF0IG5pbmV0ZWVuLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiY3JlYXRpb25cIixcbiAgICAgIFwicmVzcG9uc2liaWxpdHlcIixcbiAgICAgIFwibW9uc3Ryb3NpdHlcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiZW5nbGlzaC1ub3ZlbHNcIixcbiAgICAgIFwiZ290aGljLW5vdmVsc1wiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJkZW1vY3JhY3ktaW4tYW1lcmljYVwiLFxuICAgIFwidGl0bGVcIjogXCJEZW1vY3JhY3kgaW4gQW1lcmljYVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiQWxleGlzIGRlIFRvY3F1ZXZpbGxlXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTgzNVwiLFxuICAgIFwieVNvcnRcIjogMTgzNSxcbiAgICBcImZvcm1cIjogXCJwb2xpdGljYWxcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDIxNSxcbiAgICBcImJsdXJiXCI6IFwiQSBGcmVuY2htYW4gdG91cnMgQW1lcmljYSBhbmQgZmlndXJlcyBvdXQgdGhlIGZ1dHVyZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImRlbW9jcmFjeVwiLFxuICAgICAgXCJlcXVhbGl0eVwiLFxuICAgICAgXCJhc3NvY2lhdGlvbnNcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwib24tdGhlLXN0YXRlXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImZlYXItYW5kLXRyZW1ibGluZ1wiLFxuICAgIFwidGl0bGVcIjogXCJGZWFyIGFuZCBUcmVtYmxpbmdcIixcbiAgICBcImF1dGhvclwiOiBcIlNcdTAwRjhyZW4gS2llcmtlZ2FhcmRcIixcbiAgICBcInllYXJcIjogXCIxODQzXCIsXG4gICAgXCJ5U29ydFwiOiAxODQzLFxuICAgIFwiZm9ybVwiOiBcInBoaWxvc29waHlcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDIxNSxcbiAgICBcImJsdXJiXCI6IFwiT24gQWJyYWhhbSwgZmFpdGgsIGFuZCB0aGUgdGhpbmdzIHlvdSBjYW4ndCBleHBsYWluLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiZmFpdGhcIixcbiAgICAgIFwic2FjcmlmaWNlXCIsXG4gICAgICBcImFic3VyZFwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJjaHJpc3RpYW4tcGhpbG9zb3BoeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJmcmVkZXJpY2stZG91Z2xhc3NcIixcbiAgICBcInRpdGxlXCI6IFwiTmFycmF0aXZlIG9mIHRoZSBMaWZlIG9mIEZyZWRlcmljayBEb3VnbGFzc1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiRnJlZGVyaWNrIERvdWdsYXNzXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTg0NVwiLFxuICAgIFwieVNvcnRcIjogMTg0NSxcbiAgICBcImZvcm1cIjogXCJtZW1vaXJcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI1LFxuICAgIFwiYmx1cmJcIjogXCJUaGUgbW9zdCBpbmZsdWVudGlhbCBBbWVyaWNhbiBzbGF2ZSBuYXJyYXRpdmUsIHdyaXR0ZW4gd2hpbGUgaXRzIGF1dGhvciB3YXMgc3RpbGwgbGVnYWxseSBhIGZ1Z2l0aXZlLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwic2xhdmVyeVwiLFxuICAgICAgXCJsaXRlcmFjeVwiLFxuICAgICAgXCJmcmVlZG9tXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcIm9uLXBvd2VyXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImphbmUtZXlyZVwiLFxuICAgIFwidGl0bGVcIjogXCJKYW5lIEV5cmVcIixcbiAgICBcImF1dGhvclwiOiBcIkNoYXJsb3R0ZSBCcm9udFx1MDBFQlwiLFxuICAgIFwieWVhclwiOiBcIjE4NDdcIixcbiAgICBcInlTb3J0XCI6IDE4NDcsXG4gICAgXCJmb3JtXCI6IFwibm92ZWxcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDMxMCxcbiAgICBcImJsdXJiXCI6IFwiUmVhZGVyLCBzaGUgbmFycmF0ZWQgaXQgaGVyc2VsZi5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImdvdmVybmVzc1wiLFxuICAgICAgXCJpbmRlcGVuZGVuY2VcIixcbiAgICAgIFwiZ290aGljXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImVuZ2xpc2gtbm92ZWxzXCIsXG4gICAgICBcImdvdGhpYy1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiY29tbXVuaXN0LW1hbmlmZXN0b1wiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgQ29tbXVuaXN0IE1hbmlmZXN0b1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiS2FybCBNYXJ4ICYgRnJpZWRyaWNoIEVuZ2Vsc1wiLFxuICAgIFwieWVhclwiOiBcIjE4NDhcIixcbiAgICBcInlTb3J0XCI6IDE4NDgsXG4gICAgXCJmb3JtXCI6IFwicG9saXRpY2FsXCIsXG4gICAgXCJlcmFcIjogXCJtb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAzNTUsXG4gICAgXCJibHVyYlwiOiBcIkEgc3BlY3RlciBpcyBoYXVudGluZyBFdXJvcGUuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJjbGFzc1wiLFxuICAgICAgXCJyZXZvbHV0aW9uXCIsXG4gICAgICBcImhpc3RvcnlcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwib24tcG93ZXJcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwibW9ieS1kaWNrXCIsXG4gICAgXCJ0aXRsZVwiOiBcIk1vYnkgRGlja1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiSGVybWFuIE1lbHZpbGxlXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTg1MVwiLFxuICAgIFwieVNvcnRcIjogMTg1MSxcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwibW9kZXJuXCIsXG4gICAgXCJodWVcIjogMjAwLFxuICAgIFwiYmx1cmJcIjogXCJDYWxsIG1lIElzaG1hZWwuIFRoZSByZXN0IGlzIHRoZSB3aGFsZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcIm9ic2Vzc2lvblwiLFxuICAgICAgXCJzZWFcIixcbiAgICAgIFwic3ltYm9sXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImFtZXJpY2FuLW5vdmVsc1wiLFxuICAgICAgXCJhZHZlbnR1cmVcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwid2FsZGVuXCIsXG4gICAgXCJ0aXRsZVwiOiBcIldhbGRlblwiLFxuICAgIFwiYXV0aG9yXCI6IFwiSGVucnkgRGF2aWQgVGhvcmVhdVwiLFxuICAgIFwieWVhclwiOiBcIjE4NTRcIixcbiAgICBcInlTb3J0XCI6IDE4NTQsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwibW9kZXJuXCIsXG4gICAgXCJodWVcIjogMTUwLFxuICAgIFwiYmx1cmJcIjogXCJUd28geWVhcnMgaW4gYSBjYWJpbiwgYW5kIG5vdGVzIG9uIHdoYXQgd2FzIHNpbXBsaWZpZWQgb3V0LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibmF0dXJlXCIsXG4gICAgICBcInNvbGl0dWRlXCIsXG4gICAgICBcInNlbGYtcmVsaWFuY2VcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwibW9kZXJuLXBoaWxvc29waHlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwib24tbGliZXJ0eVwiLFxuICAgIFwidGl0bGVcIjogXCJPbiBMaWJlcnR5XCIsXG4gICAgXCJhdXRob3JcIjogXCJKb2huIFN0dWFydCBNaWxsXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTg1OVwiLFxuICAgIFwieVNvcnRcIjogMTg1OSxcbiAgICBcImZvcm1cIjogXCJwb2xpdGljYWxcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDkwLFxuICAgIFwiYmx1cmJcIjogXCJXaGVyZSBvbmUgcGVyc29uJ3MgZnJlZWRvbSBlbmRzIFx1MjAxNCBhbmQgd2h5IGl0IG11c3QgZW5kIHRoZXJlLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibGliZXJ0eVwiLFxuICAgICAgXCJoYXJtXCIsXG4gICAgICBcIm9waW5pb25cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwib24tbGliZXJ0eVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJncmVhdC1leHBlY3RhdGlvbnNcIixcbiAgICBcInRpdGxlXCI6IFwiR3JlYXQgRXhwZWN0YXRpb25zXCIsXG4gICAgXCJhdXRob3JcIjogXCJDaGFybGVzIERpY2tlbnNcIixcbiAgICBcInllYXJcIjogXCIxODYxXCIsXG4gICAgXCJ5U29ydFwiOiAxODYxLFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJtb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAyNSxcbiAgICBcImJsdXJiXCI6IFwiQSBibGFja3NtaXRoJ3MgYm95LCBhIHN0cmFuZ2UgYmVuZWZhY3RvciwgYSBMb25kb24gZWR1Y2F0aW9uLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiY2xhc3NcIixcbiAgICAgIFwiaWRlbnRpdHlcIixcbiAgICAgIFwiZXhwZWN0YXRpb25cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiZW5nbGlzaC1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwidXRpbGl0YXJpYW5pc21cIixcbiAgICBcInRpdGxlXCI6IFwiVXRpbGl0YXJpYW5pc21cIixcbiAgICBcImF1dGhvclwiOiBcIkpvaG4gU3R1YXJ0IE1pbGxcIixcbiAgICBcInllYXJcIjogXCIxODYxXCIsXG4gICAgXCJ5U29ydFwiOiAxODYxLjEsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwibW9kZXJuXCIsXG4gICAgXCJodWVcIjogOTAsXG4gICAgXCJibHVyYlwiOiBcIlBsZWFzdXJlLCBwYWluLCBhbmQgaG93IHRvIGFkZCB0aGVtIHVwLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiZXRoaWNzXCIsXG4gICAgICBcInV0aWxpdHlcIixcbiAgICAgIFwianVzdGljZVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJtb2Rlcm4tcGhpbG9zb3BoeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJub3Rlcy1mcm9tLXVuZGVyZ3JvdW5kXCIsXG4gICAgXCJ0aXRsZVwiOiBcIk5vdGVzIGZyb20gVW5kZXJncm91bmRcIixcbiAgICBcImF1dGhvclwiOiBcIkZ5b2RvciBEb3N0b2V2c2t5XCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTg2NFwiLFxuICAgIFwieVNvcnRcIjogMTg2NCxcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwibW9kZXJuXCIsXG4gICAgXCJodWVcIjogMjUsXG4gICAgXCJibHVyYlwiOiBcIkkgYW0gYSBzaWNrIG1hbiBcdTIwMTQgYSBzcGl0ZWZ1bCBtYW4uXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJhbGllbmF0aW9uXCIsXG4gICAgICBcInNwaXRlXCIsXG4gICAgICBcImNvbnNjaW91c25lc3NcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwicnVzc2lhbi1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiY3JpbWUtYW5kLXB1bmlzaG1lbnRcIixcbiAgICBcInRpdGxlXCI6IFwiQ3JpbWUgYW5kIFB1bmlzaG1lbnRcIixcbiAgICBcImF1dGhvclwiOiBcIkZ5b2RvciBEb3N0b2V2c2t5XCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTg2NlwiLFxuICAgIFwieVNvcnRcIjogMTg2NixcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwibW9kZXJuXCIsXG4gICAgXCJodWVcIjogMzU1LFxuICAgIFwiYmx1cmJcIjogXCJBIHN0dWRlbnQgY29tbWl0cyBhIG11cmRlciwgdGhlbiBoYXMgdG8gbGl2ZSB3aXRoIGl0LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiZ3VpbHRcIixcbiAgICAgIFwicG92ZXJ0eVwiLFxuICAgICAgXCJyZWRlbXB0aW9uXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInJ1c3NpYW4tbm92ZWxzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXSxcbiAgICBcInN0YXR1c1wiOiBcImZpbmlzaGVkXCIsXG4gICAgXCJmaW5pc2hlZE9uXCI6IFwiMjAyNC0xMi0wNFwiXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwid2FyLWFuZC1wZWFjZVwiLFxuICAgIFwidGl0bGVcIjogXCJXYXIgYW5kIFBlYWNlXCIsXG4gICAgXCJhdXRob3JcIjogXCJMZW8gVG9sc3RveVwiLFxuICAgIFwieWVhclwiOiBcIjE4NjlcIixcbiAgICBcInlTb3J0XCI6IDE4NjksXG4gICAgXCJmb3JtXCI6IFwibm92ZWxcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI1LFxuICAgIFwiYmx1cmJcIjogXCJOYXBvbGVvbiBjb21lcyB0byBSdXNzaWEuIFNvIGRvIGZpdmUgaHVuZHJlZCBvdGhlciBwZW9wbGUuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJ3YXJcIixcbiAgICAgIFwiZmFtaWx5XCIsXG4gICAgICBcImhpc3RvcnlcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwicnVzc2lhbi1ub3ZlbHNcIixcbiAgICAgIFwib24td2FyXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXSxcbiAgICBcInN0YXR1c1wiOiBcImZpbmlzaGVkXCIsXG4gICAgXCJmaW5pc2hlZE9uXCI6IFwiMjAyNS0wOS0wOFwiXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiYXJvdW5kLXRoZS13b3JsZC04MC1kYXlzXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkFyb3VuZCB0aGUgV29ybGQgaW4gRWlnaHR5IERheXNcIixcbiAgICBcImF1dGhvclwiOiBcIkp1bGVzIFZlcm5lXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTg3M1wiLFxuICAgIFwieVNvcnRcIjogMTg3MyxcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwibW9kZXJuXCIsXG4gICAgXCJodWVcIjogNjAsXG4gICAgXCJibHVyYlwiOiBcIlBoaWxlYXMgRm9nZyBiZXRzIHRoZSBjbHViOyB0aGUgY2xvY2sgc3RhcnRzLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiYWR2ZW50dXJlXCIsXG4gICAgICBcIndhZ2VyXCIsXG4gICAgICBcInRyYXZlbFwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJhZHZlbnR1cmVcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwibmllbHMtbHlobmVcIixcbiAgICBcInRpdGxlXCI6IFwiTmllbHMgTHlobmVcIixcbiAgICBcImF1dGhvclwiOiBcIkouUC4gSmFjb2JzZW5cIixcbiAgICBcInllYXJcIjogXCIxODgwXCIsXG4gICAgXCJ5U29ydFwiOiAxODgwLjEsXG4gICAgXCJmb3JtXCI6IFwibm92ZWxcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI2NSxcbiAgICBcImJsdXJiXCI6IFwiQSBEYW5pc2ggYXRoZWlzdCBkcmVhbXMsIGxvc2VzLCBhbmQgZGllcy4gUmlsa2UgbG92ZWQgaXQuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJhdGhlaXNtXCIsXG4gICAgICBcIm1lbGFuY2hvbHlcIixcbiAgICAgIFwiZGVubWFya1wiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJub3JkaWMtbm92ZWxzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImJyb3RoZXJzLWthcmFtYXpvdlwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgQnJvdGhlcnMgS2FyYW1hem92XCIsXG4gICAgXCJhdXRob3JcIjogXCJGeW9kb3IgRG9zdG9ldnNreVwiLFxuICAgIFwieWVhclwiOiBcIjE4ODBcIixcbiAgICBcInlTb3J0XCI6IDE4ODAsXG4gICAgXCJmb3JtXCI6IFwibm92ZWxcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDM1NSxcbiAgICBcImJsdXJiXCI6IFwiVGhyZWUgYnJvdGhlcnMsIG9uZSBmYXRoZXIsIG9uZSBtdXJkZXIsIGFuZCBHb2Qgb24gdHJpYWwuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJmYWl0aFwiLFxuICAgICAgXCJkb3VidFwiLFxuICAgICAgXCJmYW1pbHlcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwicnVzc2lhbi1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdLFxuICAgIFwic3RhdHVzXCI6IFwiZmluaXNoZWRcIixcbiAgICBcImZpbmlzaGVkT25cIjogXCIyMDI1LTExLTMwXCJcbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJqZWt5bGwtYW5kLWh5ZGVcIixcbiAgICBcInRpdGxlXCI6IFwiU3RyYW5nZSBDYXNlIG9mIERyIEpla3lsbCBhbmQgTXIgSHlkZVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiUm9iZXJ0IExvdWlzIFN0ZXZlbnNvblwiLFxuICAgIFwieWVhclwiOiBcIjE4ODZcIixcbiAgICBcInlTb3J0XCI6IDE4ODYsXG4gICAgXCJmb3JtXCI6IFwibm92ZWxcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI2NSxcbiAgICBcImJsdXJiXCI6IFwiQSByZXNwZWN0YWJsZSBkb2N0b3IsIGEgY2hlbWljYWwsIGEgc2Vjb25kIHNlbGYuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJkb3VibGVcIixcbiAgICAgIFwidmljZVwiLFxuICAgICAgXCJ2aWN0b3JpYW5cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiZW5nbGlzaC1ub3ZlbHNcIixcbiAgICAgIFwiZ290aGljLW5vdmVsc1wiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJpdmFuLWlseWljaFwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgRGVhdGggb2YgSXZhbiBJbHlpY2hcIixcbiAgICBcImF1dGhvclwiOiBcIkxlbyBUb2xzdG95XCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTg4NlwiLFxuICAgIFwieVNvcnRcIjogMTg4Ni4xLFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJtb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAzNTUsXG4gICAgXCJibHVyYlwiOiBcIkEgc3VjY2Vzc2Z1bCBqdWRnZSBjb25mcm9udHMgdGhlIGxpZmUgaGUgYnVpbHQgYXMgZGVhdGggZHJhd3MgbmVhci5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcIm1vcnRhbGl0eVwiLFxuICAgICAgXCJtZWFuaW5nXCIsXG4gICAgICBcImNvbXBhc3Npb25cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwicnVzc2lhbi1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCIsXG4gICAgICBcIlJVXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiYmV5b25kLWdvb2QtYW5kLWV2aWxcIixcbiAgICBcInRpdGxlXCI6IFwiQmV5b25kIEdvb2QgYW5kIEV2aWxcIixcbiAgICBcImF1dGhvclwiOiBcIkZyaWVkcmljaCBOaWV0enNjaGVcIixcbiAgICBcInllYXJcIjogXCIxODg2XCIsXG4gICAgXCJ5U29ydFwiOiAxODg2LjEsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwibW9kZXJuXCIsXG4gICAgXCJodWVcIjogMzUsXG4gICAgXCJibHVyYlwiOiBcIkEgaGFtbWVyLCBhcHBsaWVkIHRvIG1vcmFsaXR5LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwid2lsbC10by1wb3dlclwiLFxuICAgICAgXCJtYXN0ZXItc2xhdmVcIixcbiAgICAgIFwicGVyc3BlY3RpdmlzbVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJtb2Rlcm4tcGhpbG9zb3BoeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJnZW5lYWxvZ3ktb2YtbW9yYWxzXCIsXG4gICAgXCJ0aXRsZVwiOiBcIk9uIHRoZSBHZW5lYWxvZ3kgb2YgTW9yYWxzXCIsXG4gICAgXCJhdXRob3JcIjogXCJGcmllZHJpY2ggTmlldHpzY2hlXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTg4N1wiLFxuICAgIFwieVNvcnRcIjogMTg4NyxcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCJtb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAzNSxcbiAgICBcImJsdXJiXCI6IFwiV2hlcmUgb3VyIHZhbHVlcyBjYW1lIGZyb20sIGFuZCB3aG8gdGhleSBzZXJ2ZWQuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJtb3JhbGl0eVwiLFxuICAgICAgXCJyZXNlbnRtZW50XCIsXG4gICAgICBcImFzY2V0aWNpc21cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwibW9kZXJuLXBoaWxvc29waHlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwianVuZ2xlLWJvb2tcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIEp1bmdsZSBCb29rXCIsXG4gICAgXCJhdXRob3JcIjogXCJSdWR5YXJkIEtpcGxpbmdcIixcbiAgICBcInllYXJcIjogXCIxODk0XCIsXG4gICAgXCJ5U29ydFwiOiAxODk0LFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJtb2Rlcm5cIixcbiAgICBcImh1ZVwiOiA5MCxcbiAgICBcImJsdXJiXCI6IFwiQSBib3kgcmFpc2VkIGJ5IHdvbHZlczsgYXNzb3J0ZWQgb3RoZXIgdGFsZXMuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJ3aWxkXCIsXG4gICAgICBcImJlbG9uZ2luZ1wiLFxuICAgICAgXCJsYXdcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiYWR2ZW50dXJlXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInRoZS1hd2FrZW5pbmdcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIEF3YWtlbmluZ1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiS2F0ZSBDaG9waW5cIixcbiAgICBcInllYXJcIjogXCIxODk5XCIsXG4gICAgXCJ5U29ydFwiOiAxODk5LFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJtb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAyMDAsXG4gICAgXCJibHVyYlwiOiBcIkEgd29tYW4gaW4gTG91aXNpYW5hIHJlYWxpemVzIHNoZSdzIGFsbG93ZWQgdG8gd2FudC5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImRlc2lyZVwiLFxuICAgICAgXCJhdXRvbm9teVwiLFxuICAgICAgXCJzZWFcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiYW1lcmljYW4tbm92ZWxzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImhlYXJ0LW9mLWRhcmtuZXNzXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkhlYXJ0IG9mIERhcmtuZXNzXCIsXG4gICAgXCJhdXRob3JcIjogXCJKb3NlcGggQ29ucmFkXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTg5OVwiLFxuICAgIFwieVNvcnRcIjogMTg5OS4xLFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJtb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAyNSxcbiAgICBcImJsdXJiXCI6IFwiQSBib2F0IHVwIHRoZSBDb25nbywgYW5kIHdoYXQgaXQgZm91bmQgdGhlcmUuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJlbXBpcmVcIixcbiAgICAgIFwiaG9ycm9yXCIsXG4gICAgICBcImpvdXJuZXlcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiZW5nbGlzaC1ub3ZlbHNcIixcbiAgICAgIFwiYWR2ZW50dXJlXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImplcnVzYWxlbVwiLFxuICAgIFwidGl0bGVcIjogXCJKZXJ1c2FsZW1cIixcbiAgICBcImF1dGhvclwiOiBcIlNlbG1hIExhZ2VybFx1MDBGNmZcIixcbiAgICBcInllYXJcIjogXCIxOTAxXCIsXG4gICAgXCJ5U29ydFwiOiAxOTAxLFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJjb250ZW1wb3JhcnlcIixcbiAgICBcImh1ZVwiOiA5MCxcbiAgICBcImJsdXJiXCI6IFwiQSBTd2VkaXNoIHZpbGxhZ2UgdXByb290ZWQgYnkgZmFpdGgsIGhlYWRlZCBmb3IgdGhlIGhvbHkgbGFuZC5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImZhaXRoXCIsXG4gICAgICBcIm1pZ3JhdGlvblwiLFxuICAgICAgXCJjb21tdW5pdHlcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwibm9yZGljLW5vdmVsc1wiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJhLWxpdHRsZS1wcmluY2Vzc1wiLFxuICAgIFwidGl0bGVcIjogXCJBIExpdHRsZSBQcmluY2Vzc1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiRnJhbmNlcyBIb2Rnc29uIEJ1cm5ldHRcIixcbiAgICBcInllYXJcIjogXCIxOTA1XCIsXG4gICAgXCJ5U29ydFwiOiAxOTA1LFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJjb250ZW1wb3JhcnlcIixcbiAgICBcImh1ZVwiOiAzMTAsXG4gICAgXCJibHVyYlwiOiBcIkEgZ2lybCBsb3NlcyBldmVyeXRoaW5nOyBoZXIgaW1hZ2luYXRpb24ga2VlcHMgaGVyIHdhcm0uXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJpbWFnaW5hdGlvblwiLFxuICAgICAgXCJyZXNpbGllbmNlXCIsXG4gICAgICBcInNjaG9vbFwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJlbmdsaXNoLW5vdmVsc1wiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJ1bHlzc2VzXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlVseXNzZXNcIixcbiAgICBcImF1dGhvclwiOiBcIkphbWVzIEpveWNlXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTkyMlwiLFxuICAgIFwieVNvcnRcIjogMTkyMixcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwiY29udGVtcG9yYXJ5XCIsXG4gICAgXCJodWVcIjogMjUsXG4gICAgXCJibHVyYlwiOiBcIk9uZSBkYXkgaW4gRHVibGluLCB0b2xkIHNldmVyYWwgZGlmZmVyZW50IHdheXMuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJzdHJlYW0tb2YtY29uc2Npb3VzbmVzc1wiLFxuICAgICAgXCJkdWJsaW5cIixcbiAgICAgIFwibXl0aFwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJtb2Rlcm5pc3Qtbm92ZWxzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImRvbi1xdWl4b3RlXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkRvbiBRdWl4b3RlXCIsXG4gICAgXCJhdXRob3JcIjogXCJNaWd1ZWwgZGUgQ2VydmFudGVzXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTYwNVwiLFxuICAgIFwieVNvcnRcIjogMTYwNSxcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMzUsXG4gICAgXCJibHVyYlwiOiBcIkEga25pZ2h0LCBhIHNxdWlyZSwgYSB3aW5kbWlsbC4gVGhlIGZpcnN0IG1vZGVybiBub3ZlbC5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImlsbHVzaW9uXCIsXG4gICAgICBcImNoaXZhbHJ5XCIsXG4gICAgICBcIm1hZG5lc3NcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwic2F0aXJpY2FsLW5vdmVsc1wiLFxuICAgICAgXCJhZHZlbnR1cmVcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiZXNzYXlzLW1vbnRhaWduZVwiLFxuICAgIFwidGl0bGVcIjogXCJFc3NheXNcIixcbiAgICBcImF1dGhvclwiOiBcIk1pY2hlbCBkZSBNb250YWlnbmVcIixcbiAgICBcInllYXJcIjogXCIxNTgwXCIsXG4gICAgXCJ5U29ydFwiOiAxNTgwLFxuICAgIFwiZm9ybVwiOiBcInBoaWxvc29waHlcIixcbiAgICBcImVyYVwiOiBcImVhcmx5LW1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDYwLFxuICAgIFwiYmx1cmJcIjogXCJUaGUgYm9vayB0aGF0IGludmVudGVkIHRoZSBlc3NheSBcdTIwMTQgXFxcIldoYXQgZG8gSSBrbm93P1xcXCJcIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInNlbGZcIixcbiAgICAgIFwic2tlcHRpY2lzbVwiLFxuICAgICAgXCJjdXN0b21cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwibW9kZXJuLXBoaWxvc29waHlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiY2FudGVyYnVyeVwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgQ2FudGVyYnVyeSBUYWxlc1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiR2VvZmZyZXkgQ2hhdWNlclwiLFxuICAgIFwieWVhclwiOiBcImMuIDEzODdcIixcbiAgICBcInlTb3J0XCI6IDEzODcsXG4gICAgXCJmb3JtXCI6IFwiZXBpY1wiLFxuICAgIFwiZXJhXCI6IFwibWVkaWV2YWxcIixcbiAgICBcImh1ZVwiOiAyMDAsXG4gICAgXCJzdHViXCI6IHRydWUsXG4gICAgXCJibHVyYlwiOiBcIlBpbGdyaW1zLCBzdG9yaWVzLCB0aGUgZmlyc3QgbWFzdGVycGllY2Ugb2YgRW5nbGlzaCB2ZXJzZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInBpbGdyaW1hZ2VcIixcbiAgICAgIFwic2F0aXJlXCIsXG4gICAgICBcIm1pZGRsZS1lbmdsaXNoXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcIm1lZGlldmFsLWVwaWNzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInN1bW1hXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlN1bW1hIFRoZW9sb2dpY2FcIixcbiAgICBcImF1dGhvclwiOiBcIlRob21hcyBBcXVpbmFzXCIsXG4gICAgXCJ5ZWFyXCI6IFwiYy4gMTI2NVwiLFxuICAgIFwieVNvcnRcIjogMTI2NSxcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCJtZWRpZXZhbFwiLFxuICAgIFwiaHVlXCI6IDIzMCxcbiAgICBcInN0dWJcIjogdHJ1ZSxcbiAgICBcImJsdXJiXCI6IFwiVGhlIHN5bnRoZXNpcyBvZiBBcmlzdG90bGUgYW5kIENocmlzdGlhbiB0aGVvbG9neSwgaW4gMywwMDAgYXJ0aWNsZXMuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJzY2hvbGFzdGljaXNtXCIsXG4gICAgICBcImdvZFwiLFxuICAgICAgXCJ2aXJ0dWVcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiY2hyaXN0aWFuLXBoaWxvc29waHlcIixcbiAgICAgIFwiY2hyaXN0aWFuLXRyYWRpdGlvblwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJjaXR5LW9mLWdvZFwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgQ2l0eSBvZiBHb2RcIixcbiAgICBcImF1dGhvclwiOiBcIkF1Z3VzdGluZVwiLFxuICAgIFwieWVhclwiOiBcIjQyNlwiLFxuICAgIFwieVNvcnRcIjogNDI2LFxuICAgIFwiZm9ybVwiOiBcInBoaWxvc29waHlcIixcbiAgICBcImVyYVwiOiBcImFudGlxdWl0eVwiLFxuICAgIFwiaHVlXCI6IDI1LFxuICAgIFwic3R1YlwiOiB0cnVlLFxuICAgIFwiYmx1cmJcIjogXCJUd28gY2l0aWVzLCBlYXJ0aGx5IGFuZCBoZWF2ZW5seSwgYWZ0ZXIgUm9tZSB3YXMgc2Fja2VkLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwicHJvdmlkZW5jZVwiLFxuICAgICAgXCJ0d28tY2l0aWVzXCIsXG4gICAgICBcInJvbWVcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiY2hyaXN0aWFuLXBoaWxvc29waHlcIixcbiAgICAgIFwiY2hyaXN0aWFuLXRyYWRpdGlvblwiLFxuICAgICAgXCJvbi10aGUtc3RhdGVcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiYW5uYS1rYXJlbmluYVwiLFxuICAgIFwidGl0bGVcIjogXCJBbm5hIEthcmVuaW5hXCIsXG4gICAgXCJhdXRob3JcIjogXCJMZW8gVG9sc3RveVwiLFxuICAgIFwieWVhclwiOiBcIjE4NzdcIixcbiAgICBcInlTb3J0XCI6IDE4NzcsXG4gICAgXCJmb3JtXCI6IFwibm92ZWxcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI1LFxuICAgIFwiYmx1cmJcIjogXCJBbGwgaGFwcHkgZmFtaWxpZXMgYXJlIGFsaWtlLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibWFycmlhZ2VcIixcbiAgICAgIFwiYWR1bHRlcnlcIixcbiAgICAgIFwiZ3JhY2VcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwicnVzc2lhbi1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwidG8tdGhlLWxpZ2h0aG91c2VcIixcbiAgICBcInRpdGxlXCI6IFwiVG8gdGhlIExpZ2h0aG91c2VcIixcbiAgICBcImF1dGhvclwiOiBcIlZpcmdpbmlhIFdvb2xmXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTkyN1wiLFxuICAgIFwieVNvcnRcIjogMTkyNyxcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwiY29udGVtcG9yYXJ5XCIsXG4gICAgXCJodWVcIjogMjAwLFxuICAgIFwiYmx1cmJcIjogXCJBIHN1bW1lciBob3VzZSwgYSBwb3N0cG9uZWQgdHJpcCwgdGltZSBpdHNlbGYgYXMgdGhlIHByb3RhZ29uaXN0LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwidGltZVwiLFxuICAgICAgXCJwZXJjZXB0aW9uXCIsXG4gICAgICBcImZhbWlseVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJtb2Rlcm5pc3Qtbm92ZWxzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImFsaWNlLWluLXdvbmRlcmxhbmRcIixcbiAgICBcInRpdGxlXCI6IFwiQWxpY2UncyBBZHZlbnR1cmVzIGluIFdvbmRlcmxhbmRcIixcbiAgICBcImF1dGhvclwiOiBcIkxld2lzIENhcnJvbGxcIixcbiAgICBcInllYXJcIjogXCIxODY1XCIsXG4gICAgXCJ5U29ydFwiOiAxODY1LFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJtb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAxNTAsXG4gICAgXCJibHVyYlwiOiBcIkFsaWNlIGZvbGxvd3MgYSBodXJyaWVkIHJhYmJpdCBpbnRvIGEgd29ybGQgb2Ygc2hpZnRpbmcgc2l6ZXMsIGRpc3B1dGVkIG1lYW5pbmdzIGFuZCBpbXBhdGllbnQgcnVsZXJzLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibGFuZ3VhZ2VcIixcbiAgICAgIFwiaWRlbnRpdHlcIixcbiAgICAgIFwiYXV0aG9yaXR5XCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImVuZ2xpc2gtbm92ZWxzXCIsXG4gICAgICBcInNhdGlyaWNhbC1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwid3V0aGVyaW5nLWhlaWdodHNcIixcbiAgICBcInRpdGxlXCI6IFwiV3V0aGVyaW5nIEhlaWdodHNcIixcbiAgICBcImF1dGhvclwiOiBcIkVtaWx5IEJyb250XHUwMEVCXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTg0N1wiLFxuICAgIFwieVNvcnRcIjogMTg0NyxcbiAgICBcImZvcm1cIjogXCJub3ZlbFwiLFxuICAgIFwiZXJhXCI6IFwibW9kZXJuXCIsXG4gICAgXCJodWVcIjogMjg1LFxuICAgIFwiYmx1cmJcIjogXCJUd28gWW9ya3NoaXJlIGhvdXNlaG9sZHMgY2FycnkgYSBjaGlsZGhvb2QgYXR0YWNobWVudCwgYSBmYW1pbHkgZ3JpZXZhbmNlIGFuZCBhIHN0cnVnZ2xlIG92ZXIgcHJvcGVydHkgaW50byBhbm90aGVyIGdlbmVyYXRpb24uXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJyZXZlbmdlXCIsXG4gICAgICBcImNsYXNzXCIsXG4gICAgICBcImluaGVyaXRhbmNlXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImVuZ2xpc2gtbm92ZWxzXCIsXG4gICAgICBcImdvdGhpYy1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwibWlkZGxlbWFyY2hcIixcbiAgICBcInRpdGxlXCI6IFwiTWlkZGxlbWFyY2hcIixcbiAgICBcImF1dGhvclwiOiBcIkdlb3JnZSBFbGlvdFwiLFxuICAgIFwieWVhclwiOiBcIjE4NzFcIixcbiAgICBcInlTb3J0XCI6IDE4NzEsXG4gICAgXCJmb3JtXCI6IFwibm92ZWxcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI2NSxcbiAgICBcImJsdXJiXCI6IFwiSW50ZXJ3b3ZlbiBsaXZlcyBpbiBhIHByb3ZpbmNpYWwgdG93biB0ZXN0IHdoYXQgYW1iaXRpb24sIG1hcnJpYWdlLCBhbmQgc3ltcGF0aHkgY2FuIG1ha2UgcG9zc2libGUuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJtYXJyaWFnZVwiLFxuICAgICAgXCJhbWJpdGlvblwiLFxuICAgICAgXCJzeW1wYXRoeVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJlbmdsaXNoLW5vdmVsc1wiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJzZW5zZS1hbmQtc2Vuc2liaWxpdHlcIixcbiAgICBcInRpdGxlXCI6IFwiU2Vuc2UgYW5kIFNlbnNpYmlsaXR5XCIsXG4gICAgXCJhdXRob3JcIjogXCJKYW5lIEF1c3RlblwiLFxuICAgIFwieWVhclwiOiBcIjE4MTFcIixcbiAgICBcInlTb3J0XCI6IDE4MTEsXG4gICAgXCJmb3JtXCI6IFwibm92ZWxcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI2NSxcbiAgICBcImJsdXJiXCI6IFwiVHdvIHNpc3RlcnMgY29uZnJvbnQgbG92ZSwgbW9uZXksIGFuZCB0aGUgbGltaXRzIG9mIHRoZWlyIG93biBqdWRnbWVudCBhZnRlciBsb3NpbmcgdGhlIHNlY3VyaXR5IG9mIHRoZWlyIGZhbWlseSBob21lLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibWFycmlhZ2VcIixcbiAgICAgIFwibW9uZXlcIixcbiAgICAgIFwianVkZ21lbnRcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiZW5nbGlzaC1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiYWR2ZW50dXJlcy1vZi1zaGVybG9jay1ob2xtZXNcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIEFkdmVudHVyZXMgb2YgU2hlcmxvY2sgSG9sbWVzXCIsXG4gICAgXCJhdXRob3JcIjogXCJBcnRodXIgQ29uYW4gRG95bGVcIixcbiAgICBcInllYXJcIjogXCIxODkyXCIsXG4gICAgXCJ5U29ydFwiOiAxODkyLFxuICAgIFwiZm9ybVwiOiBcInNob3J0LXN0b3JpZXNcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDI2NSxcbiAgICBcImJsdXJiXCI6IFwiVHdlbHZlIGNhc2VzIGZyb20gQmFrZXIgU3RyZWV0LCB0b2xkIGJ5IFdhdHNvbiwgaW4gd2hpY2ggYW4gYXBwYXJlbnRseSB0cml2aWFsIGRldGFpbCB0dXJucyBhbiBlbnRpcmUgZXhwbGFuYXRpb24uXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJvYnNlcnZhdGlvblwiLFxuICAgICAgXCJpbmZlcmVuY2VcIixcbiAgICAgIFwiZGVjZXB0aW9uXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImRldGVjdGl2ZS1maWN0aW9uXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImh1bWUtZW5xdWlyeVwiLFxuICAgIFwidGl0bGVcIjogXCJBbiBFbnF1aXJ5IENvbmNlcm5pbmcgSHVtYW4gVW5kZXJzdGFuZGluZ1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiRGF2aWQgSHVtZVwiLFxuICAgIFwieWVhclwiOiBcIjE3NDhcIixcbiAgICBcInlTb3J0XCI6IDE3NDgsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMjE1LFxuICAgIFwiYmx1cmJcIjogXCJBIGRldmFzdGF0aW5nIGVtcGlyaWNpc20sIHdyaXR0ZW4gdG8gYmUgcmVhZGFibGUuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJjYXVzYXRpb25cIixcbiAgICAgIFwiaW5kdWN0aW9uXCIsXG4gICAgICBcInNrZXB0aWNpc21cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwibW9kZXJuLXBoaWxvc29waHlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiZ3JvdW5kd29yay1rYW50XCIsXG4gICAgXCJ0aXRsZVwiOiBcIkdyb3VuZHdvcmsgb2YgdGhlIE1ldGFwaHlzaWNzIG9mIE1vcmFsc1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiSW1tYW51ZWwgS2FudFwiLFxuICAgIFwieWVhclwiOiBcIjE3ODVcIixcbiAgICBcInlTb3J0XCI6IDE3ODUsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJodWVcIjogMjE1LFxuICAgIFwic3R1YlwiOiB0cnVlLFxuICAgIFwiYmx1cmJcIjogXCJUaGUgY2F0ZWdvcmljYWwgaW1wZXJhdGl2ZSwgYW5kIHRoZSBmb3VuZGF0aW9uIG9mIG1vZGVybiBldGhpY3MuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJkdXR5XCIsXG4gICAgICBcImF1dG9ub215XCIsXG4gICAgICBcInJlYXNvblwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJtb2Rlcm4tcGhpbG9zb3BoeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJ3ZWFsdGgtb2YtbmF0aW9uc1wiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgV2VhbHRoIG9mIE5hdGlvbnNcIixcbiAgICBcImF1dGhvclwiOiBcIkFkYW0gU21pdGhcIixcbiAgICBcInllYXJcIjogXCIxNzc2XCIsXG4gICAgXCJ5U29ydFwiOiAxNzc2LjUsXG4gICAgXCJmb3JtXCI6IFwicG9saXRpY2FsXCIsXG4gICAgXCJlcmFcIjogXCJlYXJseS1tb2Rlcm5cIixcbiAgICBcImh1ZVwiOiA5MCxcbiAgICBcImJsdXJiXCI6IFwiVGhlIGludmlzaWJsZSBoYW5kIG9mIHRoZSBtYXJrZXQsIGluIGZpdmUgbG9uZyBib29rcy5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcIm1hcmtldHNcIixcbiAgICAgIFwiZGl2aXNpb24tb2YtbGFib3JcIixcbiAgICAgIFwibGliZXJ0eVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJvbi10aGUtc3RhdGVcIixcbiAgICAgIFwib24tbGliZXJ0eVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJwaGVub21lbm9sb2d5XCIsXG4gICAgXCJ0aXRsZVwiOiBcIlBoZW5vbWVub2xvZ3kgb2YgU3Bpcml0XCIsXG4gICAgXCJhdXRob3JcIjogXCJHLlcuRi4gSGVnZWxcIixcbiAgICBcInllYXJcIjogXCIxODA3XCIsXG4gICAgXCJ5U29ydFwiOiAxODA3LFxuICAgIFwiZm9ybVwiOiBcInBoaWxvc29waHlcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDIxNSxcbiAgICBcInN0dWJcIjogdHJ1ZSxcbiAgICBcImJsdXJiXCI6IFwiVGhlIGRpYWxlY3RpY2FsIGpvdXJuZXkgb2YgU3Bpcml0IHRocm91Z2ggaGlzdG9yeS4gQnJpbmcgYSBmcmllbmQuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJkaWFsZWN0aWNcIixcbiAgICAgIFwiY29uc2Npb3VzbmVzc1wiLFxuICAgICAgXCJoaXN0b3J5XCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcIm1vZGVybi1waGlsb3NvcGh5XCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImNpdmlsaXphdGlvbi1mcmV1ZFwiLFxuICAgIFwidGl0bGVcIjogXCJDaXZpbGl6YXRpb24gYW5kIEl0cyBEaXNjb250ZW50c1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiU2lnbXVuZCBGcmV1ZFwiLFxuICAgIFwieWVhclwiOiBcIjE5MzBcIixcbiAgICBcInlTb3J0XCI6IDE5MzAsXG4gICAgXCJmb3JtXCI6IFwicGhpbG9zb3BoeVwiLFxuICAgIFwiZXJhXCI6IFwiY29udGVtcG9yYXJ5XCIsXG4gICAgXCJodWVcIjogOTAsXG4gICAgXCJzdHViXCI6IHRydWUsXG4gICAgXCJibHVyYlwiOiBcIlRoZSBjb3N0IG9mIGJlaW5nIGNpdmlsaXplZCwgb24gdGhlIGFuYWx5c3QncyBjb3VjaC5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInJlcHJlc3Npb25cIixcbiAgICAgIFwiZXJvc1wiLFxuICAgICAgXCJkZWF0aC1kcml2ZVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJtb2Rlcm4tcGhpbG9zb3BoeVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJpbnZlc3RpZ2F0aW9uc1wiLFxuICAgIFwidGl0bGVcIjogXCJQaGlsb3NvcGhpY2FsIEludmVzdGlnYXRpb25zXCIsXG4gICAgXCJhdXRob3JcIjogXCJMdWR3aWcgV2l0dGdlbnN0ZWluXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTk1M1wiLFxuICAgIFwieVNvcnRcIjogMTk1MyxcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCJjb250ZW1wb3JhcnlcIixcbiAgICBcImh1ZVwiOiAyMTUsXG4gICAgXCJzdHViXCI6IHRydWUsXG4gICAgXCJibHVyYlwiOiBcIkxhbmd1YWdlIGdhbWVzLCBmYW1pbHkgcmVzZW1ibGFuY2VzLCB0aGUgbGF0ZXIgV2l0dGdlbnN0ZWluLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibGFuZ3VhZ2VcIixcbiAgICAgIFwibWVhbmluZ1wiLFxuICAgICAgXCJ1c2VcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwibW9kZXJuLXBoaWxvc29waHlcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwic2Vjb25kLXNleFwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgU2Vjb25kIFNleFwiLFxuICAgIFwiYXV0aG9yXCI6IFwiU2ltb25lIGRlIEJlYXV2b2lyXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTk0OVwiLFxuICAgIFwieVNvcnRcIjogMTk0OSxcbiAgICBcImZvcm1cIjogXCJwb2xpdGljYWxcIixcbiAgICBcImVyYVwiOiBcImNvbnRlbXBvcmFyeVwiLFxuICAgIFwiaHVlXCI6IDMxMCxcbiAgICBcInN0dWJcIjogdHJ1ZSxcbiAgICBcImJsdXJiXCI6IFwiT25lIGlzIG5vdCBib3JuLCBidXQgcmF0aGVyIGJlY29tZXMsIGEgd29tYW4uXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJnZW5kZXJcIixcbiAgICAgIFwiZXhpc3RlbmNlXCIsXG4gICAgICBcImxpYmVyYXRpb25cIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwib24tbGliZXJ0eVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCIxOTg0XCIsXG4gICAgXCJ0aXRsZVwiOiBcIjE5ODRcIixcbiAgICBcImF1dGhvclwiOiBcIkdlb3JnZSBPcndlbGxcIixcbiAgICBcInllYXJcIjogXCIxOTQ5XCIsXG4gICAgXCJ5U29ydFwiOiAxOTQ5LjEsXG4gICAgXCJmb3JtXCI6IFwibm92ZWxcIixcbiAgICBcImVyYVwiOiBcImNvbnRlbXBvcmFyeVwiLFxuICAgIFwiaHVlXCI6IDM1NSxcbiAgICBcInN0dWJcIjogdHJ1ZSxcbiAgICBcImJsdXJiXCI6IFwiQmlnIEJyb3RoZXIgaXMgd2F0Y2hpbmcsIGFuZCB0aGUgbGFuZ3VhZ2UgaXMgc2hyaW5raW5nLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwidG90YWxpdGFyaWFuaXNtXCIsXG4gICAgICBcImxhbmd1YWdlXCIsXG4gICAgICBcIm1lbW9yeVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJtb2Rlcm5pc3Qtbm92ZWxzXCIsXG4gICAgICBcIm9uLXBvd2VyXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInRyaWFsLWthZmthXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBUcmlhbFwiLFxuICAgIFwiYXV0aG9yXCI6IFwiRnJhbnogS2Fma2FcIixcbiAgICBcInllYXJcIjogXCIxOTI1XCIsXG4gICAgXCJ5U29ydFwiOiAxOTI1LFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJjb250ZW1wb3JhcnlcIixcbiAgICBcImh1ZVwiOiAyNSxcbiAgICBcInN0dWJcIjogdHJ1ZSxcbiAgICBcImJsdXJiXCI6IFwiU29tZW9uZSBtdXN0IGhhdmUgc2xhbmRlcmVkIEpvc2VmIEsuOyBvbmUgbW9ybmluZywgd2l0aG91dCBjYXVzZSwgaGUgd2FzIGFycmVzdGVkLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwiYnVyZWF1Y3JhY3lcIixcbiAgICAgIFwiZ3VpbHRcIixcbiAgICAgIFwiYWJzdXJkXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcIm1vZGVybmlzdC1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwid2FpdGluZy1nb2RvdFwiLFxuICAgIFwidGl0bGVcIjogXCJXYWl0aW5nIGZvciBHb2RvdFwiLFxuICAgIFwiYXV0aG9yXCI6IFwiU2FtdWVsIEJlY2tldHRcIixcbiAgICBcInllYXJcIjogXCIxOTUzXCIsXG4gICAgXCJ5U29ydFwiOiAxOTUzLjEsXG4gICAgXCJmb3JtXCI6IFwiZHJhbWFcIixcbiAgICBcImVyYVwiOiBcImNvbnRlbXBvcmFyeVwiLFxuICAgIFwiaHVlXCI6IDkwLFxuICAgIFwic3R1YlwiOiB0cnVlLFxuICAgIFwiYmx1cmJcIjogXCJUd28gbWVuLCBhIHRyZWUsIGFuIGFwcG9pbnRtZW50IHRoYXQgbmV2ZXIgcXVpdGUgYXJyaXZlcy5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcImFic3VyZFwiLFxuICAgICAgXCJ3YWl0aW5nXCIsXG4gICAgICBcImZ1dGlsaXR5XCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcIm1vZGVybi1kcmFtYVwiXG4gICAgXSxcbiAgICBcImxhbmdzXCI6IFtcbiAgICAgIFwiRU5cIixcbiAgICAgIFwiREFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJiZWxvdmVkXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkJlbG92ZWRcIixcbiAgICBcImF1dGhvclwiOiBcIlRvbmkgTW9ycmlzb25cIixcbiAgICBcInllYXJcIjogXCIxOTg3XCIsXG4gICAgXCJ5U29ydFwiOiAxOTg3LFxuICAgIFwiZm9ybVwiOiBcIm5vdmVsXCIsXG4gICAgXCJlcmFcIjogXCJjb250ZW1wb3JhcnlcIixcbiAgICBcImh1ZVwiOiAzMDUsXG4gICAgXCJzdHViXCI6IHRydWUsXG4gICAgXCJibHVyYlwiOiBcIkEgaGF1bnRlZCBob3VzZSwgYSBzdG9sZW4gY2hpbGQsIHRoZSBpbmhlcml0YW5jZSBvZiBzbGF2ZXJ5LlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwibWVtb3J5XCIsXG4gICAgICBcInNsYXZlcnlcIixcbiAgICAgIFwibW90aGVyaG9vZFwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJhbWVyaWNhbi1ub3ZlbHNcIlxuICAgIF0sXG4gICAgXCJsYW5nc1wiOiBbXG4gICAgICBcIkVOXCIsXG4gICAgICBcIkRBXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwidGhlLXNvdmVyZWlnbi1jaGlsZFwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgU292ZXJlaWduIENoaWxkXCIsXG4gICAgXCJhdXRob3JcIjogXCJBYXJvbiBTdHVwcGxlIHdpdGggTG9nYW4gQ2hpcGtpblwiLFxuICAgIFwidHJhZGl0aW9uXCI6IFwiQW1lcmljYW5cIixcbiAgICBcInllYXJcIjogXCIyMDI1XCIsXG4gICAgXCJ5U29ydFwiOiAyMDI1LFxuICAgIFwiZm9ybVwiOiBcInBoaWxvc29waHlcIixcbiAgICBcImVyYVwiOiBcIjIwMjBzXCIsXG4gICAgXCJodWVcIjogMjAwLFxuICAgIFwiYmx1cmJcIjogXCJQYXJlbnRpbmcgd2l0aG91dCBydWxlcywgYXJndWVkIGZyb20gYSB0aGVvcnkgb2Yga25vd2xlZGdlLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwicGFyZW50aW5nXCIsXG4gICAgICBcImF1dG9ub215XCIsXG4gICAgICBcImVwaXN0ZW1vbG9neVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJjcml0aWNhbC1yYXRpb25hbGlzbVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImxvcmRzLW9mLXRoZS1jb3Ntb3NcIixcbiAgICBcInRpdGxlXCI6IFwiTG9yZHMgb2YgdGhlIENvc21vc1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiQXJqdW4gS2hlbWFuaSBhbmQgTG9nYW4gQ2hpcGtpblwiLFxuICAgIFwieWVhclwiOiBcIjIwMjVcIixcbiAgICBcInlTb3J0XCI6IDIwMjUuMSxcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCIyMDIwc1wiLFxuICAgIFwiaHVlXCI6IDI2NSxcbiAgICBcImJsdXJiXCI6IFwiRnJvbSBjb3NtaWMgbW9ub3RvbnkgdG8gdGhlIEVubGlnaHRlbm1lbnQsIGEgaGlzdG9yeSBvZiBldmVyeXRoaW5nIHRvbGQgdGhyb3VnaCBrbm93bGVkZ2UuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJwcm9ncmVzc1wiLFxuICAgICAgXCJvcHRpbWlzbVwiLFxuICAgICAgXCJlbmxpZ2h0ZW5tZW50XCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImNyaXRpY2FsLXJhdGlvbmFsaXNtXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiYm9sZC1jb25qZWN0dXJlcy12b2x1bWUtMVwiLFxuICAgIFwidGl0bGVcIjogXCJCb2xkIENvbmplY3R1cmVzLCBWb2x1bWUgSVwiLFxuICAgIFwiYXV0aG9yXCI6IFwiTG9nYW4gQ2hpcGtpbiAoZWQuKVwiLFxuICAgIFwieWVhclwiOiBcIjIwMjVcIixcbiAgICBcInlTb3J0XCI6IDIwMjUuMixcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCIyMDIwc1wiLFxuICAgIFwiaHVlXCI6IDUwLFxuICAgIFwiYmx1cmJcIjogXCJEYXZpZCBEZXV0c2NoIGluIGNvbnZlcnNhdGlvbiwgMjAxMlx1MjAxMzIwMjQuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJxdWFudHVtLXRoZW9yeVwiLFxuICAgICAgXCJlcGlzdGVtb2xvZ3lcIixcbiAgICAgIFwiaW50ZXJ2aWV3c1wiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJjcml0aWNhbC1yYXRpb25hbGlzbVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImJvbGQtY29uamVjdHVyZXMtdm9sdW1lLTJcIixcbiAgICBcInRpdGxlXCI6IFwiQm9sZCBDb25qZWN0dXJlcywgVm9sdW1lIElJXCIsXG4gICAgXCJhdXRob3JcIjogXCJMb2dhbiBDaGlwa2luIChlZC4pXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMjAyNlwiLFxuICAgIFwieVNvcnRcIjogMjAyNixcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCIyMDIwc1wiLFxuICAgIFwiaHVlXCI6IDIxNSxcbiAgICBcImJsdXJiXCI6IFwiUGh5c2ljaXN0cyBvbiB3aGF0IGlzIHN0aWxsIHVuc2V0dGxlZCBpbiBmdW5kYW1lbnRhbCBwaHlzaWNzLlwiLFxuICAgIFwidGhlbWVzXCI6IFtcbiAgICAgIFwicGh5c2ljc1wiLFxuICAgICAgXCJxdWFudHVtLXRoZW9yeVwiLFxuICAgICAgXCJlc3NheXNcIlxuICAgIF0sXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwiY3JpdGljYWwtcmF0aW9uYWxpc21cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJ0aGUtZmFydGhlc3QtcmVhY2hlc1wiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgRmFydGhlc3QgUmVhY2hlc1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiQnJldHQgSGFsbFwiLFxuICAgIFwieWVhclwiOiBcIjIwMjZcIixcbiAgICBcInlTb3J0XCI6IDIwMjYuMSxcbiAgICBcImZvcm1cIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJlcmFcIjogXCIyMDIwc1wiLFxuICAgIFwiaHVlXCI6IDMzMCxcbiAgICBcImJsdXJiXCI6IFwiV2h5IHBlb3BsZSBhcmUgdGhlIG1vc3QgaW1wb3J0YW50IGVudGl0aWVzIGluIHRoZSB1bml2ZXJzZS5cIixcbiAgICBcInRoZW1lc1wiOiBbXG4gICAgICBcInBlcnNvbmhvb2RcIixcbiAgICAgIFwidW5pdmVyc2FsaXR5XCIsXG4gICAgICBcImVwaXN0ZW1vbG9neVwiXG4gICAgXSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJjcml0aWNhbC1yYXRpb25hbGlzbVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImdyaW1tcy1mYWlyeS10YWxlc1wiLFxuICAgIFwidGl0bGVcIjogXCJHcmltbXNcdTIwMTkgRmFpcnkgVGFsZXNcIixcbiAgICBcImF1dGhvclwiOiBcIkphY29iIGFuZCBXaWxoZWxtIEdyaW1tXCIsXG4gICAgXCJ5ZWFyXCI6IFwiMTgxMlwiLFxuICAgIFwieVNvcnRcIjogMTgxMixcbiAgICBcImZvcm1cIjogXCJzaG9ydC1zdG9yaWVzXCIsXG4gICAgXCJlcmFcIjogXCJtb2Rlcm5cIixcbiAgICBcImh1ZVwiOiAzMCxcbiAgICBcImJsdXJiXCI6IFwiU2l4dHktZml2ZSB0YWxlcyBvZiBraW5ncywgdGFpbG9ycywgc3RlcG1vdGhlcnMgYW5kIHRhbGtpbmcgYW5pbWFscywgdG9sZCBpbiBwbGFpbiwgcmVwZWF0ZWQgcGF0dGVybnMuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJ0YWxlc1wiLFxuICAgICAgXCJqdXN0aWNlXCIsXG4gICAgICBcInRyYW5zZm9ybWF0aW9uXCIsXG4gICAgICBcImZhbWlseVwiLFxuICAgICAgXCJjdW5uaW5nXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImZvbGstYW5kLWZhaXJ5LXRhbGVzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImFyYWJpYW4tbmlnaHRzXCIsXG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBBcmFiaWFuIE5pZ2h0cyBFbnRlcnRhaW5tZW50c1wiLFxuICAgIFwiYXV0aG9yXCI6IFwiQW5kcmV3IExhbmdcIixcbiAgICBcInllYXJcIjogXCIxODk4XCIsXG4gICAgXCJ5U29ydFwiOiAxODk4LFxuICAgIFwiZm9ybVwiOiBcInNob3J0LXN0b3JpZXNcIixcbiAgICBcImVyYVwiOiBcIm1vZGVyblwiLFxuICAgIFwiaHVlXCI6IDQwLFxuICAgIFwiYmx1cmJcIjogXCJBIHN1bHRhblx1MjAxOXMgbmlnaHRseSBzdG9yeS1iYXJnYWluIG9wZW5zIHRhbGVzIG9mIGdlbmllcywgc2FpbG9ycywgbWVyY2hhbnRzIGFuZCBhIG1hZ2ljIGxhbXAuXCIsXG4gICAgXCJ0aGVtZXNcIjogW1xuICAgICAgXCJzdG9yeXRlbGxpbmdcIixcbiAgICAgIFwiZmF0ZVwiLFxuICAgICAgXCJwb3dlclwiLFxuICAgICAgXCJ0cmF2ZWxcIixcbiAgICAgIFwid29uZGVyXCJcbiAgICBdLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcImZvbGstYW5kLWZhaXJ5LXRhbGVzXCJcbiAgICBdLFxuICAgIFwibGFuZ3NcIjogW1xuICAgICAgXCJFTlwiLFxuICAgICAgXCJEQVwiXG4gICAgXVxuICB9XG5dXG5cbmV4cG9ydCBjb25zdCBMSUJSQVJZX1NIRUxWRVM6IFJlY29yZDxzdHJpbmcsIExpYnJhcnlTaGVsZj4gPSB7XG4gIFwicGxhdG9cIjoge1xuICAgIFwidGl0bGVcIjogXCJQbGF0bydzIERpYWxvZ3Vlc1wiLFxuICAgIFwic3ViXCI6IFwiU2l4IGNvbnZlcnNhdGlvbnMgYXJvdW5kIFNvY3JhdGVzXCIsXG4gICAgXCJodWVcIjogMjI1XG4gIH0sXG4gIFwiYXJpc3RvdGxlXCI6IHtcbiAgICBcInRpdGxlXCI6IFwiQXJpc3RvdGxlXCIsXG4gICAgXCJzdWJcIjogXCJFdGhpY3MsIHBvbGl0aWNzLCBwb2V0aWNzXCIsXG4gICAgXCJodWVcIjogOTBcbiAgfSxcbiAgXCJzdG9pY3NcIjoge1xuICAgIFwidGl0bGVcIjogXCJUaGUgU3RvaWNzXCIsXG4gICAgXCJzdWJcIjogXCJFcGljdGV0dXMgYW5kIE1hcmN1cyBBdXJlbGl1c1wiLFxuICAgIFwiaHVlXCI6IDI1XG4gIH0sXG4gIFwiY2hyaXN0aWFuLXBoaWxvc29waHlcIjoge1xuICAgIFwidGl0bGVcIjogXCJDaHJpc3RpYW4gVHJhZGl0aW9uXCIsXG4gICAgXCJzdWJcIjogXCJBdWd1c3RpbmUsIFx1MDBFMCBLZW1waXMsIEtpZXJrZWdhYXJkXCIsXG4gICAgXCJodWVcIjogMjMwXG4gIH0sXG4gIFwibW9kZXJuLXBoaWxvc29waHlcIjoge1xuICAgIFwidGl0bGVcIjogXCJNb2Rlcm4gUGhpbG9zb3BoeVwiLFxuICAgIFwic3ViXCI6IFwiRGVzY2FydGVzIHRocm91Z2ggTmlldHpzY2hlXCIsXG4gICAgXCJodWVcIjogMjE1XG4gIH0sXG4gIFwib24tdGhlLXN0YXRlXCI6IHtcbiAgICBcInRpdGxlXCI6IFwiT24gdGhlIFN0YXRlXCIsXG4gICAgXCJzdWJcIjogXCJDb25zdGl0dXRpb25zLCBzb3ZlcmVpZ250eSwgZmVkZXJhbGlzbVwiLFxuICAgIFwiaHVlXCI6IDkwXG4gIH0sXG4gIFwib24tcG93ZXJcIjoge1xuICAgIFwidGl0bGVcIjogXCJPbiBQb3dlciAmIFR5cmFubnlcIixcbiAgICBcInN1YlwiOiBcIk1hY2hpYXZlbGxpLCBNYXJ4LCBhbmQgdGhlIGRyYW1hdGlzdHNcIixcbiAgICBcImh1ZVwiOiAzNTVcbiAgfSxcbiAgXCJvbi1saWJlcnR5XCI6IHtcbiAgICBcInRpdGxlXCI6IFwiT24gTGliZXJ0eVwiLFxuICAgIFwic3ViXCI6IFwiUm91c3NlYXUsIFdvbGxzdG9uZWNyYWZ0LCBNaWxsXCIsXG4gICAgXCJodWVcIjogOTBcbiAgfSxcbiAgXCJmb3VuZGluZy1kb2NzXCI6IHtcbiAgICBcInRpdGxlXCI6IFwiRm91bmRpbmcgRG9jdW1lbnRzXCIsXG4gICAgXCJzdWJcIjogXCJNYWduYSBDYXJ0YSwgVVMgZm91bmRpbmcsIEZlZGVyYWxpc3RcIixcbiAgICBcImh1ZVwiOiA5MFxuICB9LFxuICBcInNoYWtlc3BlYXJlLXRyYWdlZHlcIjoge1xuICAgIFwidGl0bGVcIjogXCJTaGFrZXNwZWFyZSBcdTIwMTQgVHJhZ2VkaWVzXCIsXG4gICAgXCJzdWJcIjogXCJIYW1sZXQsIExlYXIsIE90aGVsbG8sIE1hY2JldGggJiBjby5cIixcbiAgICBcImh1ZVwiOiAzNTVcbiAgfSxcbiAgXCJzaGFrZXNwZWFyZS1jb21lZHlcIjoge1xuICAgIFwidGl0bGVcIjogXCJTaGFrZXNwZWFyZSBcdTIwMTQgQ29tZWRpZXNcIixcbiAgICBcInN1YlwiOiBcIlJvbWFuY2VzLCBmYXJjZXMsIHByb2JsZW0gcGxheXNcIixcbiAgICBcImh1ZVwiOiAxNTBcbiAgfSxcbiAgXCJzaGFrZXNwZWFyZS1oaXN0b3J5XCI6IHtcbiAgICBcInRpdGxlXCI6IFwiU2hha2VzcGVhcmUgXHUyMDE0IEhpc3Rvcmllc1wiLFxuICAgIFwic3ViXCI6IFwiVGhlIEVuZ2xpc2ggY2hyb25pY2xlIHBsYXlzXCIsXG4gICAgXCJodWVcIjogMjY1XG4gIH0sXG4gIFwic2hha2VzcGVhcmUtcm9tYW5jZVwiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIlNoYWtlc3BlYXJlIFx1MjAxNCBSb21hbmNlc1wiLFxuICAgIFwic3ViXCI6IFwiVGhlIGxhdGUsIHN0cmFuZ2UgcGxheXNcIixcbiAgICBcImh1ZVwiOiAyMDBcbiAgfSxcbiAgXCJncmVlay10cmFnZWR5XCI6IHtcbiAgICBcInRpdGxlXCI6IFwiR3JlZWsgVHJhZ2VkeVwiLFxuICAgIFwic3ViXCI6IFwiQWVzY2h5bHVzLCBTb3Bob2NsZXMsIEV1cmlwaWRlc1wiLFxuICAgIFwiaHVlXCI6IDMwMFxuICB9LFxuICBcIm1vZGVybi1kcmFtYVwiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIk1vZGVybiBEcmFtYVwiLFxuICAgIFwic3ViXCI6IFwiR29ldGhlJ3MgRmF1c3RcIixcbiAgICBcImh1ZVwiOiAyNjVcbiAgfSxcbiAgXCJydXNzaWFuLW5vdmVsc1wiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBSdXNzaWFuc1wiLFxuICAgIFwic3ViXCI6IFwiRG9zdG9ldnNreSBhbmQgVG9sc3RveVwiLFxuICAgIFwiaHVlXCI6IDM1NVxuICB9LFxuICBcImVuZ2xpc2gtbm92ZWxzXCI6IHtcbiAgICBcInRpdGxlXCI6IFwiMTl0aC1DZW50dXJ5IEVuZ2xpc2ggTm92ZWxzXCIsXG4gICAgXCJzdWJcIjogXCJBdXN0ZW4gdG8gQ29ucmFkXCIsXG4gICAgXCJodWVcIjogMjY1XG4gIH0sXG4gIFwiYW1lcmljYW4tbm92ZWxzXCI6IHtcbiAgICBcInRpdGxlXCI6IFwiQW1lcmljYW4gTm92ZWxzXCIsXG4gICAgXCJzdWJcIjogXCJNZWx2aWxsZSBhbmQgQ2hvcGluXCIsXG4gICAgXCJodWVcIjogMjAwXG4gIH0sXG4gIFwibW9kZXJuaXN0LW5vdmVsc1wiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIk1vZGVybmlzbVwiLFxuICAgIFwic3ViXCI6IFwiQSBuZXcgY2VudHVyeSwgYSBuZXcgc2VudGVuY2VcIixcbiAgICBcImh1ZVwiOiAyNVxuICB9LFxuICBcIm5vcmRpYy1ub3ZlbHNcIjoge1xuICAgIFwidGl0bGVcIjogXCJOb3JkaWMgTm92ZWxzXCIsXG4gICAgXCJzdWJcIjogXCJKYWNvYnNlbiBhbmQgTGFnZXJsXHUwMEY2ZlwiLFxuICAgIFwiaHVlXCI6IDkwXG4gIH0sXG4gIFwiZ290aGljLW5vdmVsc1wiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBHb3RoaWNcIixcbiAgICBcInN1YlwiOiBcIkRvdWJsZXMsIG1vbnN0ZXJzLCBkYXJrIGhvdXNlc1wiLFxuICAgIFwiaHVlXCI6IDI2NVxuICB9LFxuICBcImRldGVjdGl2ZS1maWN0aW9uXCI6IHtcbiAgICBcInRpdGxlXCI6IFwiRGV0ZWN0aXZlIEZpY3Rpb25cIixcbiAgICBcInN1YlwiOiBcIkNhc2VzLCBjbHVlcyBhbmQgdGhlIGxvZ2ljIG9mIGluZmVyZW5jZVwiLFxuICAgIFwiaHVlXCI6IDI2NVxuICB9LFxuICBcInNhdGlyaWNhbC1ub3ZlbHNcIjoge1xuICAgIFwidGl0bGVcIjogXCJTYXRpcmVcIixcbiAgICBcInN1YlwiOiBcIlZvbHRhaXJlIGFuZCB0aGUgcGhpbG9zb3BoaWNhbCB0YWxlXCIsXG4gICAgXCJodWVcIjogMzVcbiAgfSxcbiAgXCJhbmNpZW50LWVwaWNzXCI6IHtcbiAgICBcInRpdGxlXCI6IFwiQW5jaWVudCBFcGljc1wiLFxuICAgIFwic3ViXCI6IFwiR2lsZ2FtZXNoLCBIb21lciwgVmlyZ2lsXCIsXG4gICAgXCJodWVcIjogMzVcbiAgfSxcbiAgXCJzYWNyZWQtZXBpY3NcIjoge1xuICAgIFwidGl0bGVcIjogXCJTYWNyZWQgRXBpY3NcIixcbiAgICBcInN1YlwiOiBcIkRhbnRlIGFuZCBNaWx0b25cIixcbiAgICBcImh1ZVwiOiAyNjVcbiAgfSxcbiAgXCJtZWRpZXZhbC1lcGljc1wiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIk1lZGlldmFsIEVwaWNzXCIsXG4gICAgXCJzdWJcIjogXCJCZW93dWxmXCIsXG4gICAgXCJodWVcIjogMjAwXG4gIH0sXG4gIFwiYmlibGUtYW5kLWRldm90aW9uXCI6IHtcbiAgICBcInRpdGxlXCI6IFwiQmlibGUgJiBEZXZvdGlvblwiLFxuICAgIFwic3ViXCI6IFwiU2NyaXB0dXJlLCBhbmQgdGhlIGJvb2tzIHJlYWQgYWxvbmdzaWRlIGl0XCIsXG4gICAgXCJodWVcIjogMjMwXG4gIH0sXG4gIFwiY2hyaXN0aWFuLXRyYWRpdGlvblwiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIlRoZSBDaHJpc3RpYW4gVHJhZGl0aW9uXCIsXG4gICAgXCJzdWJcIjogXCJDcm9zcy1zaGVsZjogc2NyaXB0dXJlLCBkZXZvdGlvbiwgYW5kIHNhY3JlZCBwb2V0cnlcIixcbiAgICBcImh1ZVwiOiAyNVxuICB9LFxuICBcImFuY2llbnQtaGlzdG9yeVwiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIkFuY2llbnQgSGlzdG9yeVwiLFxuICAgIFwic3ViXCI6IFwiVGhlIGZpcnN0IGhpc3RvcmlhbnNcIixcbiAgICBcImh1ZVwiOiA2MFxuICB9LFxuICBcIm9uLXdhclwiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIk9uIFdhclwiLFxuICAgIFwic3ViXCI6IFwiQSBjcm9zcy1zaGVsZiwgZnJvbSBTdW4gVHp1IHRvIFRvbHN0b3lcIixcbiAgICBcImh1ZVwiOiAzNTVcbiAgfSxcbiAgXCJzdHJhdGVneVwiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIlN0cmF0ZWd5XCIsXG4gICAgXCJzdWJcIjogXCJUaGUgYXJ0IG9mIGNvbmZsaWN0XCIsXG4gICAgXCJodWVcIjogMzVcbiAgfSxcbiAgXCJhZHZlbnR1cmVcIjoge1xuICAgIFwidGl0bGVcIjogXCJBZHZlbnR1cmVcIixcbiAgICBcInN1YlwiOiBcIkpvdXJuZXlzLCB3YWdlcnMgYW5kIHRoZSBvcGVuIHNlYVwiLFxuICAgIFwiaHVlXCI6IDYwXG4gIH0sXG4gIFwiZm9say1hbmQtZmFpcnktdGFsZXNcIjoge1xuICAgIFwidGl0bGVcIjogXCJGb2xrICYgRmFpcnkgVGFsZXNcIixcbiAgICBcInN1YlwiOiBcIlRhbGVzIGZyb20gdGhlIG9yYWwgdHJhZGl0aW9uXCIsXG4gICAgXCJodWVcIjogMzBcbiAgfSxcbiAgXCJjcml0aWNhbC1yYXRpb25hbGlzbVwiOiB7XG4gICAgXCJ0aXRsZVwiOiBcIkNyaXRpY2FsIFJhdGlvbmFsaXNtXCIsXG4gICAgXCJzdWJcIjogXCJQb3BwZXIsIERldXRzY2ggYW5kIGhvdyBrbm93bGVkZ2UgZ3Jvd3NcIixcbiAgICBcImh1ZVwiOiAxNzVcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgTElCUkFSWV9IT1VTRVM6IExpYnJhcnlIb3VzZVtdID0gW1xuICB7XG4gICAgXCJpZFwiOiBcInBoaWxvc29waHlcIixcbiAgICBcInRpdGxlXCI6IFwiUGhpbG9zb3BoeVwiLFxuICAgIFwic3ViXCI6IFwiV2hhdCBpcyByZWFsLCBob3cgdG8gbGl2ZVwiLFxuICAgIFwiaHVlXCI6IDIxNSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJwbGF0b1wiLFxuICAgICAgXCJhcmlzdG90bGVcIixcbiAgICAgIFwic3RvaWNzXCIsXG4gICAgICBcImNocmlzdGlhbi1waGlsb3NvcGh5XCIsXG4gICAgICBcIm1vZGVybi1waGlsb3NvcGh5XCIsXG4gICAgICBcImNyaXRpY2FsLXJhdGlvbmFsaXNtXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwicG9saXRpY3NcIixcbiAgICBcInRpdGxlXCI6IFwiUG9saXRpY3MgJiBUaGUgU3RhdGVcIixcbiAgICBcInN1YlwiOiBcIlBvd2VyLCBsaWJlcnR5LCBmb3VuZGF0aW9uc1wiLFxuICAgIFwiaHVlXCI6IDkwLFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcIm9uLXRoZS1zdGF0ZVwiLFxuICAgICAgXCJvbi1wb3dlclwiLFxuICAgICAgXCJvbi1saWJlcnR5XCIsXG4gICAgICBcImZvdW5kaW5nLWRvY3NcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJkcmFtYVwiLFxuICAgIFwidGl0bGVcIjogXCJEcmFtYVwiLFxuICAgIFwic3ViXCI6IFwiVGhlIHBsYXlzLCBpbiBmb3VyIFNoYWtlc3BlYXJlYW4gbW9kZXMgYW5kIGEgR3JlZWsgdHJhZGl0aW9uXCIsXG4gICAgXCJodWVcIjogMjY1LFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcInNoYWtlc3BlYXJlLXRyYWdlZHlcIixcbiAgICAgIFwic2hha2VzcGVhcmUtY29tZWR5XCIsXG4gICAgICBcInNoYWtlc3BlYXJlLWhpc3RvcnlcIixcbiAgICAgIFwic2hha2VzcGVhcmUtcm9tYW5jZVwiLFxuICAgICAgXCJncmVlay10cmFnZWR5XCIsXG4gICAgICBcIm1vZGVybi1kcmFtYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcIm5vdmVsXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkZpY3Rpb25cIixcbiAgICBcInN1YlwiOiBcIk5vdmVscyBhbmQgc3RvcmllcywgYnkgdHJhZGl0aW9uXCIsXG4gICAgXCJodWVcIjogMjUsXG4gICAgXCJzaGVsdmVzXCI6IFtcbiAgICAgIFwicnVzc2lhbi1ub3ZlbHNcIixcbiAgICAgIFwiZW5nbGlzaC1ub3ZlbHNcIixcbiAgICAgIFwiYW1lcmljYW4tbm92ZWxzXCIsXG4gICAgICBcIm1vZGVybmlzdC1ub3ZlbHNcIixcbiAgICAgIFwibm9yZGljLW5vdmVsc1wiLFxuICAgICAgXCJnb3RoaWMtbm92ZWxzXCIsXG4gICAgICBcInNhdGlyaWNhbC1ub3ZlbHNcIixcbiAgICAgIFwiYWR2ZW50dXJlXCIsXG4gICAgICBcImZvbGstYW5kLWZhaXJ5LXRhbGVzXCIsXG4gICAgICBcImRldGVjdGl2ZS1maWN0aW9uXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiZXBpY1wiLFxuICAgIFwidGl0bGVcIjogXCJQb2V0cnkgJiBFcGljXCIsXG4gICAgXCJzdWJcIjogXCJGcm9tIEdpbGdhbWVzaCB0byBNaWx0b25cIixcbiAgICBcImh1ZVwiOiAzNSxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJhbmNpZW50LWVwaWNzXCIsXG4gICAgICBcInNhY3JlZC1lcGljc1wiLFxuICAgICAgXCJtZWRpZXZhbC1lcGljc1wiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInNjcmlwdHVyZVwiLFxuICAgIFwidGl0bGVcIjogXCJTY3JpcHR1cmUgJiBEZXZvdGlvblwiLFxuICAgIFwic3ViXCI6IFwiU2FjcmVkIHRleHRzIGFuZCBjb250ZW1wbGF0aXZlc1wiLFxuICAgIFwiaHVlXCI6IDIzMCxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJiaWJsZS1hbmQtZGV2b3Rpb25cIixcbiAgICAgIFwiY2hyaXN0aWFuLXRyYWRpdGlvblwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImhpc3RvcnlcIixcbiAgICBcInRpdGxlXCI6IFwiSGlzdG9yeVwiLFxuICAgIFwic3ViXCI6IFwiVGhlIGZpcnN0IGhpc3RvcmlhbnNcIixcbiAgICBcImh1ZVwiOiA2MCxcbiAgICBcInNoZWx2ZXNcIjogW1xuICAgICAgXCJhbmNpZW50LWhpc3RvcnlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJzdHJhdGVneVwiLFxuICAgIFwidGl0bGVcIjogXCJXYXIgJiBTdHJhdGVneVwiLFxuICAgIFwic3ViXCI6IFwiVGhlIGFydCBvZiBjb25mbGljdCwgYW5kIGl0cyBoaXN0b3J5XCIsXG4gICAgXCJodWVcIjogMzU1LFxuICAgIFwic2hlbHZlc1wiOiBbXG4gICAgICBcIm9uLXdhclwiLFxuICAgICAgXCJzdHJhdGVneVwiXG4gICAgXVxuICB9XG5dXG5cbmV4cG9ydCBjb25zdCBMSUJSQVJZX0ZPUk1TID0gW1xuICB7XG4gICAgXCJpZFwiOiBcImFsbFwiLFxuICAgIFwibGFiZWxcIjogXCJBbGxcIlxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImRyYW1hXCIsXG4gICAgXCJsYWJlbFwiOiBcIkRyYW1hXCJcbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJub3ZlbFwiLFxuICAgIFwibGFiZWxcIjogXCJOb3ZlbHNcIlxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInNob3J0LXN0b3JpZXNcIixcbiAgICBcImxhYmVsXCI6IFwiU2hvcnQgc3Rvcmllc1wiXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwiZXBpY1wiLFxuICAgIFwibGFiZWxcIjogXCJFcGljICYgcG9ldHJ5XCJcbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJwaGlsb3NvcGh5XCIsXG4gICAgXCJsYWJlbFwiOiBcIlBoaWxvc29waHlcIlxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInBvbGl0aWNhbFwiLFxuICAgIFwibGFiZWxcIjogXCJQb2xpdGljYWxcIlxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImhpc3RvcnlcIixcbiAgICBcImxhYmVsXCI6IFwiSGlzdG9yeVwiXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwic2NyaXB0dXJlXCIsXG4gICAgXCJsYWJlbFwiOiBcIlNjcmlwdHVyZVwiXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwic3RyYXRlZ3lcIixcbiAgICBcImxhYmVsXCI6IFwiU3RyYXRlZ3lcIlxuICB9XG5dIGFzIGNvbnN0XG5cbmV4cG9ydCBjb25zdCBMSUJSQVJZX0VSQVMgPSB7XG4gIFwiYW50aXF1aXR5XCI6IHtcbiAgICBcImlkXCI6IFwiYW50aXF1aXR5XCIsXG4gICAgXCJsYWJlbFwiOiBcIkFudGlxdWl0eVwiLFxuICAgIFwicmFuZ2VcIjogXCJiZWZvcmUgNTAwIEFEXCJcbiAgfSxcbiAgXCJtZWRpZXZhbFwiOiB7XG4gICAgXCJpZFwiOiBcIm1lZGlldmFsXCIsXG4gICAgXCJsYWJlbFwiOiBcIk1lZGlldmFsXCIsXG4gICAgXCJyYW5nZVwiOiBcIjUwMCBcdTIwMTMgMTUwMFwiXG4gIH0sXG4gIFwiZWFybHktbW9kZXJuXCI6IHtcbiAgICBcImlkXCI6IFwiZWFybHktbW9kZXJuXCIsXG4gICAgXCJsYWJlbFwiOiBcIkVhcmx5IE1vZGVyblwiLFxuICAgIFwicmFuZ2VcIjogXCIxNTAwIFx1MjAxMyAxODAwXCJcbiAgfSxcbiAgXCJtb2Rlcm5cIjoge1xuICAgIFwiaWRcIjogXCJtb2Rlcm5cIixcbiAgICBcImxhYmVsXCI6IFwiMTl0aCBDZW50dXJ5XCIsXG4gICAgXCJyYW5nZVwiOiBcIjE4MDAgXHUyMDEzIDE5MDBcIlxuICB9LFxuICBcImNvbnRlbXBvcmFyeVwiOiB7XG4gICAgXCJpZFwiOiBcImNvbnRlbXBvcmFyeVwiLFxuICAgIFwibGFiZWxcIjogXCIyMHRoIENlbnR1cnkgJiBCZXlvbmRcIixcbiAgICBcInJhbmdlXCI6IFwiMTkwMCBcdTIwMTMgMjAxOVwiXG4gIH0sXG4gIFwiMjAyMHNcIjoge1xuICAgIFwiaWRcIjogXCIyMDIwc1wiLFxuICAgIFwibGFiZWxcIjogXCIyMDIwc1wiLFxuICAgIFwicmFuZ2VcIjogXCIyMDIwIFx1MjAxM1wiXG4gIH1cbn0gYXMgY29uc3RcblxuZXhwb3J0IGNvbnN0IExJQlJBUllfUkVBRElOR19MSVNUUzogTGlicmFyeVJlYWRpbmdMaXN0W10gPSBbXG4gIHtcbiAgICBcImlkXCI6IFwieWFsZS1kc1wiLFxuICAgIFwidGl0bGVcIjogXCJZYWxlIERpcmVjdGVkIFN0dWRpZXNcIixcbiAgICBcInNvdXJjZVwiOiBcIllhbGUgQ29sbGVnZVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIGZpcnN0LXllYXIgaHVtYW5pdGllcyBpbnRlbnNpdmU6IHRocmVlIHBhcmFsbGVsIHllYXItbG9uZyB0cmFja3MgXHUyMDE0IExpdGVyYXR1cmUsIFBoaWxvc29waHksIEhpc3RvcmljYWwgJiBQb2xpdGljYWwgVGhvdWdodCBcdTIwMTQgcmVhZCBjb25jdXJyZW50bHkuIENvbmRlbnNlZCBoZXJlIHRvIHRoZWlyIGNvbW1vbiBzcGluZS5cIixcbiAgICBcImFjY2VudFwiOiAyMjAsXG4gICAgXCJjb21wdXRlZFwiOiBmYWxzZSxcbiAgICBcInNlcXVlbmNlXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImlsaWFkXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJvZHlzc2V5XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ0aGUtaGlzdG9yaWVzXCIsXG4gICAgICAgIFwibm90ZVwiOiBcInNlbGVjdGlvbnNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInBlbG9wb25uZXNpYW4td2FyXCIsXG4gICAgICAgIFwibm90ZVwiOiBcInNlbGVjdGlvbnNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcIm9yZXN0ZWlhXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJvZWRpcHVzLXJleFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiYW50aWdvbmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImJhY2NoYWVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcIm1lZGVhXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiQ2xvdWRzIC8gTHlzaXN0cmF0YVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFyaXN0b3BoYW5lc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiYXBvbG9neVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiY3JpdG9cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInBoYWVkb1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwic3ltcG9zaXVtXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ0aGUtcmVwdWJsaWNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcIm5pY29tYWNoZWFuLWV0aGljc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiYXJpc3RvdGxlLXBvbGl0aWNzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJwb2V0aWNzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJiaWJsZVwiLFxuICAgICAgICBcIm5vdGVcIjogXCJIZWJyZXcgQmlibGUgKyBOZXcgVGVzdGFtZW50IHNlbGVjdGlvbnNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInRoZS1hZW5laWRcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImNvbmZlc3Npb25zXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJjaXR5LW9mLWdvZFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIlN1bW1hIFRoZW9sb2dpY2EgKHNlbGVjdGlvbnMpXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiVGhvbWFzIEFxdWluYXNcIixcbiAgICAgICAgXCJub3RlXCI6IFwic3R1YiBjb21pbmcgXHUyMDE0IHNlbGVjdGlvbnMgb25seVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwic3VtbWFcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImRpdmluZS1jb21lZHlcIixcbiAgICAgICAgXCJub3RlXCI6IFwiSW5mZXJubyB0YXVnaHQgaW4gZnVsbFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiZXNzYXlzLW1vbnRhaWduZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwidGhlLXByaW5jZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiaGFtbGV0XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ0aGUtdGVtcGVzdFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiZG9uLXF1aXhvdGVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImRlc2NhcnRlcy1tZWRpdGF0aW9uc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwibGV2aWF0aGFuXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJzZWNvbmQtdHJlYXRpc2VcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInBhcmFkaXNlLWxvc3RcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImh1bWUtZW5xdWlyeVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiZGlzY291cnNlLW9uLWluZXF1YWxpdHlcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInNvY2lhbC1jb250cmFjdFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwid2VhbHRoLW9mLW5hdGlvbnNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImdyb3VuZHdvcmsta2FudFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiZmVkZXJhbGlzdC1wYXBlcnNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImZhdXN0LXBhcnQtMVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwicGhlbm9tZW5vbG9neVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwicHJpZGUtYW5kLXByZWp1ZGljZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiZGVtb2NyYWN5LWluLWFtZXJpY2FcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcIm9uLWxpYmVydHlcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImNvbW11bmlzdC1tYW5pZmVzdG9cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcIndhci1hbmQtcGVhY2VcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImJyb3RoZXJzLWthcmFtYXpvdlwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiZ2VuZWFsb2d5LW9mLW1vcmFsc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiaGVhcnQtb2YtZGFya25lc3NcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInVseXNzZXNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInRvLXRoZS1saWdodGhvdXNlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJpbnZlc3RpZ2F0aW9uc1wiXG4gICAgICB9XG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImNvbHVtYmlhLWNvcmVcIixcbiAgICBcInRpdGxlXCI6IFwiQ29sdW1iaWEgQ29yZSBDdXJyaWN1bHVtXCIsXG4gICAgXCJzb3VyY2VcIjogXCJDb2x1bWJpYSBDb2xsZWdlXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlR3byBmYW1vdXMgcmVxdWlyZWQgY291cnNlczogTGl0ZXJhdHVyZSBIdW1hbml0aWVzIChMaXQgSHVtKSBhbmQgQ29udGVtcG9yYXJ5IENpdmlsaXphdGlvbiAoQ0MpLiBDb21iaW5lZCBoZXJlLCBpbiBjaHJvbm9sb2dpY2FsIHJlYWRpbmcgb3JkZXIuXCIsXG4gICAgXCJhY2NlbnRcIjogMjUsXG4gICAgXCJjb21wdXRlZFwiOiBmYWxzZSxcbiAgICBcInNlcXVlbmNlXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImlsaWFkXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJvZHlzc2V5XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJvcmVzdGVpYVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwib2VkaXB1cy1yZXhcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImFudGlnb25lXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJtZWRlYVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwic3ltcG9zaXVtXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ0aGUtcmVwdWJsaWNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcIm5pY29tYWNoZWFuLWV0aGljc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiYXJpc3RvdGxlLXBvbGl0aWNzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJiaWJsZVwiLFxuICAgICAgICBcIm5vdGVcIjogXCJIZWJyZXcgQmlibGUgKyBOZXcgVGVzdGFtZW50IHNlbGVjdGlvbnNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInRoZS1hZW5laWRcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImNvbmZlc3Npb25zXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiU3VtbWEgVGhlb2xvZ2ljYSAoc2VsZWN0aW9ucylcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJUaG9tYXMgQXF1aW5hc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkluZmVybm8gKERpdmluZSBDb21lZHkpXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGFudGUgQWxpZ2hpZXJpXCIsXG4gICAgICAgIFwibm90ZVwiOiBcIndlIGhhdmUgdGhlIGZ1bGwgQ29tZWR5XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJkaXZpbmUtY29tZWR5XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiVGhlIERlY2FtZXJvblwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkJvY2NhY2Npb1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkVzc2F5c1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1vbnRhaWduZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwidGhlLXByaW5jZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkRvbiBRdWl4b3RlXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWlndWVsIGRlIENlcnZhbnRlc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwia2luZy1sZWFyXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJsZXZpYXRoYW5cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInNlY29uZC10cmVhdGlzZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwicGFyYWRpc2UtbG9zdFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkRpYWxvZ3VlcyBDb25jZXJuaW5nIE5hdHVyYWwgUmVsaWdpb25cIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJEYXZpZCBIdW1lXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJkaXNjb3Vyc2Utb24taW5lcXVhbGl0eVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwic29jaWFsLWNvbnRyYWN0XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiVGhlIFdlYWx0aCBvZiBOYXRpb25zIChzZWxlY3Rpb25zKVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFkYW0gU21pdGhcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJHcm91bmR3b3JrIG9mIHRoZSBNZXRhcGh5c2ljcyBvZiBNb3JhbHNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJJbW1hbnVlbCBLYW50XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJwcmlkZS1hbmQtcHJlanVkaWNlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJkZW1vY3JhY3ktaW4tYW1lcmljYVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwib24tbGliZXJ0eVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiY29tbXVuaXN0LW1hbmlmZXN0b1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiY3JpbWUtYW5kLXB1bmlzaG1lbnRcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImdlbmVhbG9neS1vZi1tb3JhbHNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJDaXZpbGl6YXRpb24gYW5kIEl0cyBEaXNjb250ZW50c1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlNpZ211bmQgRnJldWRcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInRvLXRoZS1saWdodGhvdXNlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiVGhlIFNlY29uZCBTZXggKHNlbGVjdGlvbnMpXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiU2ltb25lIGRlIEJlYXV2b2lyXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiQmVsb3ZlZFwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlRvbmkgTW9ycmlzb25cIlxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJzdC1qb2huc1wiLFxuICAgIFwidGl0bGVcIjogXCJTdC4gSm9obidzIEdyZWF0IEJvb2tzXCIsXG4gICAgXCJzb3VyY2VcIjogXCJTdC4gSm9obidzIENvbGxlZ2UgKEFubmFwb2xpcyAmIFNhbnRhIEZlKVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIGZvdXIteWVhciwgYWxsLWNsYXNzaWNzLCBuby10ZXh0Ym9va3MgY3VycmljdWx1bS4gU3R1ZGVudHMgcmVhZCB3b3JrcyBpbiBjaHJvbm9sb2dpY2FsIG9yZGVyIGFjcm9zcyBtYXRoLCBzY2llbmNlLCBwaGlsb3NvcGh5LCBsaXRlcmF0dXJlLCBhbmQgaGlzdG9yeS4gU2VsZWN0ZWQgbGl0ZXJhcnkgJiBwaGlsb3NvcGhpY2FsIGVudHJpZXMgc2hvd24gaGVyZS5cIixcbiAgICBcImFjY2VudFwiOiA5MCxcbiAgICBcImNvbXB1dGVkXCI6IGZhbHNlLFxuICAgIFwic2VxdWVuY2VcIjogW1xuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiZ2lsZ2FtZXNoXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJpbGlhZFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwib2R5c3NleVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwidGhlLWhpc3Rvcmllc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwicGVsb3Bvbm5lc2lhbi13YXJcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcIm9yZXN0ZWlhXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJvZWRpcHVzLXJleFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwib2VkaXB1cy1hdC1jb2xvbnVzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJhbnRpZ29uZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiYmFjY2hhZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwibWVkZWFcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJDbG91ZHMsIEJpcmRzLCBMeXNpc3RyYXRhXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQXJpc3RvcGhhbmVzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJhcG9sb2d5XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJjcml0b1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwicGhhZWRvXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJzeW1wb3NpdW1cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInBoYWVkcnVzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ0aGUtcmVwdWJsaWNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJUaGVhZXRldHVzLCBNZW5vLCBHb3JnaWFzLCBUaW1hZXVzXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUGxhdG9cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcIm5pY29tYWNoZWFuLWV0aGljc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiYXJpc3RvdGxlLXBvbGl0aWNzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJwb2V0aWNzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiTWV0YXBoeXNpY3MsIFBoeXNpY3MsIERlIEFuaW1hXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQXJpc3RvdGxlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiRWxlbWVudHNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJFdWNsaWRcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJPbiB0aGUgTmF0dXJlIG9mIFRoaW5nc1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkx1Y3JldGl1c1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkxpdmVzXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUGx1dGFyY2hcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInRoZS1hZW5laWRcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImJpYmxlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ0aGUtbWFudWFsXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJtZWRpdGF0aW9uc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiY29uZmVzc2lvbnNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJDaXR5IG9mIEdvZCAoc2VsZWN0aW9ucylcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBdWd1c3RpbmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJDb25zb2xhdGlvbiBvZiBQaGlsb3NvcGh5XCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQm9ldGhpdXNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJTdW1tYSBUaGVvbG9naWNhIChzZWxlY3Rpb25zKVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlRob21hcyBBcXVpbmFzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJkaXZpbmUtY29tZWR5XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiQ2FudGVyYnVyeSBUYWxlc1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkdlb2ZmcmV5IENoYXVjZXJcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImltaXRhdGlvbi1vZi1jaHJpc3RcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInRoZS1wcmluY2VcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJFc3NheXNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNb250YWlnbmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJEb24gUXVpeG90ZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkNlcnZhbnRlc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiaGFtbGV0XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJraW5nLWxlYXJcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcIm1hY2JldGhcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInRoZS10ZW1wZXN0XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJkZXNjYXJ0ZXMtbWVkaXRhdGlvbnNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImxldmlhdGhhblwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIlBlbnNcdTAwRTllc1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlBhc2NhbFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkV0aGljc1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlNwaW5vemFcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInBhcmFkaXNlLWxvc3RcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInNlY29uZC10cmVhdGlzZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIk1vbmFkb2xvZ3ksIE5ldyBFc3NheXNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJMZWlibml6XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiVHJlYXRpc2Ugb2YgSHVtYW4gTmF0dXJlXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGF2aWQgSHVtZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiZGlzY291cnNlLW9uLWluZXF1YWxpdHlcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInNvY2lhbC1jb250cmFjdFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIldlYWx0aCBvZiBOYXRpb25zXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQWRhbSBTbWl0aFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkNyaXRpcXVlIG9mIFB1cmUgUmVhc29uXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSW1tYW51ZWwgS2FudFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiZmVkZXJhbGlzdC1wYXBlcnNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImZhdXN0LXBhcnQtMVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIlBoZW5vbWVub2xvZ3kgb2YgU3Bpcml0XCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSGVnZWxcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImRlbW9jcmFjeS1pbi1hbWVyaWNhXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJjb21tdW5pc3QtbWFuaWZlc3RvXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ3YXItYW5kLXBlYWNlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJicm90aGVycy1rYXJhbWF6b3ZcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImJleW9uZC1nb29kLWFuZC1ldmlsXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJnZW5lYWxvZ3ktb2YtbW9yYWxzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiQ2l2aWxpemF0aW9uIGFuZCBJdHMgRGlzY29udGVudHNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJTaWdtdW5kIEZyZXVkXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ1bHlzc2VzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiQmVpbmcgYW5kIFRpbWUgKHNlbGVjdGlvbnMpXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWFydGluIEhlaWRlZ2dlclwiXG4gICAgICB9XG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcImJsb29tLWNhbm9uXCIsXG4gICAgXCJ0aXRsZVwiOiBcIkJsb29tJ3MgV2VzdGVybiBDYW5vblwiLFxuICAgIFwic291cmNlXCI6IFwiSGFyb2xkIEJsb29tLCBcXFwiVGhlIFdlc3Rlcm4gQ2Fub25cXFwiICgxOTk0KVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJCbG9vbSdzIGxpc3Qgb2YgdGhlIDI2IG1vc3QgZXNzZW50aWFsIGF1dGhvcnMgb2YgdGhlIFdlc3Rlcm4gdHJhZGl0aW9uLCBhbmNob3JlZCBieSBTaGFrZXNwZWFyZS4gQmVsb3cgYXJlIHRoZSBjZW50cmFsIHdvcmtzIEJsb29tIHNpbmdsZXMgb3V0LCBpbiBjaHJvbm9sb2dpY2FsIG9yZGVyIG9mIGF1dGhvci5cIixcbiAgICBcImFjY2VudFwiOiAyNjUsXG4gICAgXCJjb21wdXRlZFwiOiBmYWxzZSxcbiAgICBcInNlcXVlbmNlXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImlsaWFkXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJvZHlzc2V5XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJvcmVzdGVpYVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwib2VkaXB1cy1yZXhcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImFudGlnb25lXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJiYWNjaGFlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJtZWRlYVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwidGhlLXJlcHVibGljXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJzeW1wb3NpdW1cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImJpYmxlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ0aGUtYWVuZWlkXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJjb25mZXNzaW9uc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiZGl2aW5lLWNvbWVkeVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkNhbnRlcmJ1cnkgVGFsZXNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJHZW9mZnJleSBDaGF1Y2VyXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiRXNzYXlzXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTW9udGFpZ25lXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiRG9uIFF1aXhvdGVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNaWd1ZWwgZGUgQ2VydmFudGVzXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJoYW1sZXRcIixcbiAgICAgICAgXCJub3RlXCI6IFwiQmxvb20ncyBjZW50cmFsIHRleHRcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImtpbmctbGVhclwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwibWFjYmV0aFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwib3RoZWxsb1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwidGhlLXRlbXBlc3RcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInBhcmFkaXNlLWxvc3RcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImZhdXN0LXBhcnQtMVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkx5cmljYWwgQmFsbGFkcyAvIFRoZSBQcmVsdWRlXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBXb3Jkc3dvcnRoXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJmcmFua2Vuc3RlaW5cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInByaWRlLWFuZC1wcmVqdWRpY2VcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImphbmUtZXlyZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIk1vYnktRGlja1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkhlcm1hbiBNZWx2aWxsZVwiLFxuICAgICAgICBcIm5vdGVcIjogXCJ3ZSBoYXZlIGl0XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJtb2J5LWRpY2tcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImdyZWF0LWV4cGVjdGF0aW9uc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkxlYXZlcyBvZiBHcmFzc1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIldhbHQgV2hpdG1hblwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIlNlbGVjdGVkIFBvZW1zXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRW1pbHkgRGlja2luc29uXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ3YXItYW5kLXBlYWNlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJicm90aGVycy1rYXJhbWF6b3ZcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImJleW9uZC1nb29kLWFuZC1ldmlsXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiXHUwMEMwIGxhIHJlY2hlcmNoZSBkdSB0ZW1wcyBwZXJkdVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1hcmNlbCBQcm91c3RcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJUaGUgVHJpYWwgLyBUaGUgQ2FzdGxlXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRnJhbnogS2Fma2FcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInVseXNzZXNcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInRvLXRoZS1saWdodGhvdXNlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiRW5kZ2FtZSAvIFdhaXRpbmcgZm9yIEdvZG90XCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiU2FtdWVsIEJlY2tldHRcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJGaWNjaW9uZXNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKb3JnZSBMdWlzIEJvcmdlc1wiXG4gICAgICB9XG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcIndlbVwiLFxuICAgIFwidGl0bGVcIjogXCJUaGUgV2VsbC1FZHVjYXRlZCBNaW5kXCIsXG4gICAgXCJzb3VyY2VcIjogXCJTdXNhbiBXaXNlIEJhdWVyICgyMDAzIC8gcmV2LiAyMDE2KVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIHNlbGYtc3R1ZHkgcHJvZ3JhbSBvcmdhbml6ZWQgYnkgZ2VucmUgXHUyMDE0IE5vdmVscywgQXV0b2Jpb2dyYXBoeSwgSGlzdG9yeSwgRHJhbWEsIFBvZXRyeSBcdTIwMTQgcmVhZCBjaHJvbm9sb2dpY2FsbHkgd2l0aGluIGVhY2guIFRoZSBOb3ZlbHMgbGlzdCBpcyBzaG93biBoZXJlLlwiLFxuICAgIFwiYWNjZW50XCI6IDMxMCxcbiAgICBcImNvbXB1dGVkXCI6IGZhbHNlLFxuICAgIFwic2VxdWVuY2VcIjogW1xuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkRvbiBRdWl4b3RlXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWlndWVsIGRlIENlcnZhbnRlc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIlRoZSBQaWxncmltJ3MgUHJvZ3Jlc3NcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKb2huIEJ1bnlhblwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkd1bGxpdmVyJ3MgVHJhdmVsc1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkpvbmF0aGFuIFN3aWZ0XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJwcmlkZS1hbmQtcHJlanVkaWNlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiT2xpdmVyIFR3aXN0XCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQ2hhcmxlcyBEaWNrZW5zXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJqYW5lLWV5cmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJUaGUgU2NhcmxldCBMZXR0ZXJcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJOYXRoYW5pZWwgSGF3dGhvcm5lXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJtb2J5LWRpY2tcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJNYWRhbWUgQm92YXJ5XCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiR3VzdGF2ZSBGbGF1YmVydFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiY3JpbWUtYW5kLXB1bmlzaG1lbnRcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJBbm5hIEthcmVuaW5hXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTGVvIFRvbHN0b3lcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImJyb3RoZXJzLWthcmFtYXpvdlwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIlRoZSBQb3J0cmFpdCBvZiBhIExhZHlcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJIZW5yeSBKYW1lc1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIkh1Y2tsZWJlcnJ5IEZpbm5cIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNYXJrIFR3YWluXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiVGhlIFJlZCBCYWRnZSBvZiBDb3VyYWdlXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiU3RlcGhlbiBDcmFuZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiaGVhcnQtb2YtZGFya25lc3NcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInRoZS1hd2FrZW5pbmdcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJUaGUgSG91c2Ugb2YgTWlydGhcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJFZGl0aCBXaGFydG9uXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiVGhlIEdyZWF0IEdhdHNieVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkYuIFNjb3R0IEZpdHpnZXJhbGRcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJNcnMuIERhbGxvd2F5XCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiVmlyZ2luaWEgV29vbGZcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJUaGUgVHJpYWxcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJGcmFueiBLYWZrYVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIk5hdGl2ZSBTb25cIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSaWNoYXJkIFdyaWdodFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIlRoZSBTdHJhbmdlclwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFsYmVydCBDYW11c1wiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm1pc3NpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ0aXRsZVwiOiBcIjE5ODRcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJHZW9yZ2UgT3J3ZWxsXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiSW52aXNpYmxlIE1hblwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlJhbHBoIEVsbGlzb25cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJtaXNzaW5nXCI6IHRydWUsXG4gICAgICAgIFwidGl0bGVcIjogXCJPbmUgSHVuZHJlZCBZZWFycyBvZiBTb2xpdHVkZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkdhYnJpZWwgR2FyY1x1MDBFRGEgTVx1MDBFMXJxdWV6XCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibWlzc2luZ1wiOiB0cnVlLFxuICAgICAgICBcInRpdGxlXCI6IFwiQmVsb3ZlZFwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlRvbmkgTW9ycmlzb25cIlxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJ1bml2ZXJzYWxcIixcbiAgICBcInRpdGxlXCI6IFwiVGhlIFVuaXZlcnNhbCBDYW5vblwiLFxuICAgIFwic291cmNlXCI6IFwiQ3Jvc3Mtc2hlbGYgb2YgdGhlIGZpdmUgY2Fub25zIGFib3ZlXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIkEgY29tcHV0ZWQgbGlzdDogZXZlcnkgYm9vayBvbiB0aHJlZSBvciBtb3JlIG9mIHRoZSBzb3VyY2UgY2Fub25zLiBXaGVyZSB0aGUgY3VycmljdWxhIGFncmVlLCB0aGUgV2VzdGVybiBjYW5vbiBoYXJkZW5zLiBTb3J0ZWQgYnkgaG93IG1hbnkgb2YgdGhlIGZpdmUgY2Fub25zIG5hbWUgaXQuXCIsXG4gICAgXCJhY2NlbnRcIjogNzUsXG4gICAgXCJjb21wdXRlZFwiOiB0cnVlLFxuICAgIFwic2VxdWVuY2VcIjogW1xuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiaWxpYWRcIixcbiAgICAgICAgXCJub3RlXCI6IFwiNFx1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJvZHlzc2V5XCIsXG4gICAgICAgIFwibm90ZVwiOiBcIjRcdTAwRDcgb24gdGhlIGNhbm9ucyBhYm92ZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwib3Jlc3RlaWFcIixcbiAgICAgICAgXCJub3RlXCI6IFwiNFx1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJvZWRpcHVzLXJleFwiLFxuICAgICAgICBcIm5vdGVcIjogXCI0XHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImFudGlnb25lXCIsXG4gICAgICAgIFwibm90ZVwiOiBcIjRcdTAwRDcgb24gdGhlIGNhbm9ucyBhYm92ZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwibWVkZWFcIixcbiAgICAgICAgXCJub3RlXCI6IFwiNFx1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJzeW1wb3NpdW1cIixcbiAgICAgICAgXCJub3RlXCI6IFwiNFx1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ0aGUtcmVwdWJsaWNcIixcbiAgICAgICAgXCJub3RlXCI6IFwiNFx1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJiaWJsZVwiLFxuICAgICAgICBcIm5vdGVcIjogXCI0XHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInRoZS1hZW5laWRcIixcbiAgICAgICAgXCJub3RlXCI6IFwiNFx1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJjb25mZXNzaW9uc1wiLFxuICAgICAgICBcIm5vdGVcIjogXCI0XHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImRpdmluZS1jb21lZHlcIixcbiAgICAgICAgXCJub3RlXCI6IFwiNFx1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJwYXJhZGlzZS1sb3N0XCIsXG4gICAgICAgIFwibm90ZVwiOiBcIjRcdTAwRDcgb24gdGhlIGNhbm9ucyBhYm92ZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwicHJpZGUtYW5kLXByZWp1ZGljZVwiLFxuICAgICAgICBcIm5vdGVcIjogXCI0XHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImJyb3RoZXJzLWthcmFtYXpvdlwiLFxuICAgICAgICBcIm5vdGVcIjogXCI0XHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImJhY2NoYWVcIixcbiAgICAgICAgXCJub3RlXCI6IFwiM1x1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJuaWNvbWFjaGVhbi1ldGhpY3NcIixcbiAgICAgICAgXCJub3RlXCI6IFwiM1x1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJhcmlzdG90bGUtcG9saXRpY3NcIixcbiAgICAgICAgXCJub3RlXCI6IFwiM1x1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJ0aGUtcHJpbmNlXCIsXG4gICAgICAgIFwibm90ZVwiOiBcIjNcdTAwRDcgb24gdGhlIGNhbm9ucyBhYm92ZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiaGFtbGV0XCIsXG4gICAgICAgIFwibm90ZVwiOiBcIjNcdTAwRDcgb24gdGhlIGNhbm9ucyBhYm92ZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwidGhlLXRlbXBlc3RcIixcbiAgICAgICAgXCJub3RlXCI6IFwiM1x1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJsZXZpYXRoYW5cIixcbiAgICAgICAgXCJub3RlXCI6IFwiM1x1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJzZWNvbmQtdHJlYXRpc2VcIixcbiAgICAgICAgXCJub3RlXCI6IFwiM1x1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJkaXNjb3Vyc2Utb24taW5lcXVhbGl0eVwiLFxuICAgICAgICBcIm5vdGVcIjogXCIzXHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcInNvY2lhbC1jb250cmFjdFwiLFxuICAgICAgICBcIm5vdGVcIjogXCIzXHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImZhdXN0LXBhcnQtMVwiLFxuICAgICAgICBcIm5vdGVcIjogXCIzXHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImRlbW9jcmFjeS1pbi1hbWVyaWNhXCIsXG4gICAgICAgIFwibm90ZVwiOiBcIjNcdTAwRDcgb24gdGhlIGNhbm9ucyBhYm92ZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwiY29tbXVuaXN0LW1hbmlmZXN0b1wiLFxuICAgICAgICBcIm5vdGVcIjogXCIzXHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcIndhci1hbmQtcGVhY2VcIixcbiAgICAgICAgXCJub3RlXCI6IFwiM1x1MDBENyBvbiB0aGUgY2Fub25zIGFib3ZlXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwiaWRcIjogXCJnZW5lYWxvZ3ktb2YtbW9yYWxzXCIsXG4gICAgICAgIFwibm90ZVwiOiBcIjNcdTAwRDcgb24gdGhlIGNhbm9ucyBhYm92ZVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcImlkXCI6IFwidWx5c3Nlc1wiLFxuICAgICAgICBcIm5vdGVcIjogXCIzXHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJpZFwiOiBcImtpbmctbGVhclwiLFxuICAgICAgICBcIm5vdGVcIjogXCIzXHUwMEQ3IG9uIHRoZSBjYW5vbnMgYWJvdmVcIlxuICAgICAgfVxuICAgIF1cbiAgfVxuXVxuXG5leHBvcnQgY29uc3QgTElCUkFSWV9CT09LX01FVEFfQllfSUQ6IFJlY29yZDxzdHJpbmcsIExpYnJhcnlCb29rTWV0YT4gPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gIExJQlJBUllfQk9PS19NRVRBLm1hcChib29rID0+IFtib29rLmlkLCBib29rXSksXG4pXG5cbmV4cG9ydCBjb25zdCBMSUJSQVJZX0JPT0tfTElTVFM6IFJlY29yZDxzdHJpbmcsIExpYnJhcnlMaXN0TWVtYmVyc2hpcFtdPiA9IHt9XG5mb3IgKGNvbnN0IGxpc3Qgb2YgTElCUkFSWV9SRUFESU5HX0xJU1RTKSB7XG4gIGxpc3Quc2VxdWVuY2UuZm9yRWFjaCgoZW50cnksIGluZGV4KSA9PiB7XG4gICAgaWYgKCFlbnRyeS5pZCkgcmV0dXJuXG4gICAgTElCUkFSWV9CT09LX0xJU1RTW2VudHJ5LmlkXSB8fD0gW11cbiAgICBMSUJSQVJZX0JPT0tfTElTVFNbZW50cnkuaWRdLnB1c2goe1xuICAgICAgbGlzdElkOiBsaXN0LmlkLFxuICAgICAgbGlzdFRpdGxlOiBsaXN0LnRpdGxlLFxuICAgICAgcG9zaXRpb246IGluZGV4ICsgMSxcbiAgICAgIGFjY2VudDogbGlzdC5hY2NlbnQsXG4gICAgfSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExpYnJhcnlNZXRhKGJvb2tJZDogc3RyaW5nKTogTGlicmFyeUJvb2tNZXRhIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIExJQlJBUllfQk9PS19NRVRBX0JZX0lEW2Jvb2tJZF1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJvb2tEaXNwbGF5WWVhcihib29rOiBCb29rLCBtZXRhPzogTGlicmFyeUJvb2tNZXRhKTogc3RyaW5nIHtcbiAgaWYgKG1ldGE/LnllYXIpIHJldHVybiBtZXRhLnllYXJcbiAgaWYgKGJvb2sueWVhciA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJydcbiAgcmV0dXJuIGJvb2sueWVhciA8IDAgPyAnYy4gJyArIE1hdGguYWJzKGJvb2sueWVhcikgKyAnIEJDJyA6IFN0cmluZyhib29rLnllYXIpXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9sYWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9sYWIvZWRpdGlvbkRpZmZpY3VsdHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2xhYi9lZGl0aW9uRGlmZmljdWx0eS50c1wiO2ltcG9ydCB0eXBlIHsgRWRpdGlvbiB9IGZyb20gJy4uL3R5cGVzJ1xuXG5leHBvcnQgdHlwZSBFZGl0aW9uRGlmZmljdWx0eSA9ICdFYXN5JyB8ICdNZWRpdW0nIHwgJ0hhcmQnXG5cbi8vIEVkaXRvcmlhbCByZXZpZXcsIDIzIFNlcHRlbWJlciAyMDI2OiB2b2NhYnVsYXJ5LCBzeW50YXggYW5kIGNvbmNlcHR1YWwgZGVuc2l0eS5cbi8vIFJhdGluZ3MgYXJlIHJlYWRpbmcgZ3VpZGFuY2UsIG5vdCBhIG1lYXN1cmVkIHJlYWRpbmcgYWdlIG9yIGEgcXVhbGl0eSBqdWRnZW1lbnQuXG5jb25zdCByZXZpZXdlZDogUmVjb3JkPHN0cmluZywgRWRpdGlvbkRpZmZpY3VsdHk+ID0ge1xuICBcIm9keXNzZXk6b3JpZ2luYWwtZW5cIjogXCJNZWRpdW1cIixcbiAgXCJ1bHlzc2VzOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcIndhci1hbmQtcGVhY2U6b3JpZ2luYWwtZW5cIjogXCJNZWRpdW1cIixcbiAgXCJiaWJsZTpranYtZW5cIjogXCJIYXJkXCIsXG4gIFwiYmlibGU6d2ViLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwiZ2lsZ2FtZXNoOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImhhbWxldDpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJtYWNiZXRoOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcIm1pZHN1bW1lcjpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJyb21lby1hbmQtanVsaWV0Om9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcInRoZS10ZW1wZXN0Om9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcInRoZS1hcnQtb2Ytd2FyOm9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwicHJpZGUtYW5kLXByZWp1ZGljZTpvcmlnaW5hbC1lblwiOiBcIk1lZGl1bVwiLFxuICBcImNyaW1lLWFuZC1wdW5pc2htZW50Om9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwidGhlLXJlcHVibGljOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcIm1lZGl0YXRpb25zOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImRpdmluZS1jb21lZHk6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwiamFuZS1leXJlOm9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwidGhlLWFlbmVpZDpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJwYXJhZGlzZS1sb3N0Om9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImZyYW5rZW5zdGVpbjpvcmlnaW5hbC1lblwiOiBcIk1lZGl1bVwiLFxuICBcInRoZS1tYW51YWw6b3JpZ2luYWwtZW5cIjogXCJNZWRpdW1cIixcbiAgXCJhcG9sb2d5Om9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwic3ltcG9zaXVtOm9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwicGhhZWRvOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImNyaXRvOm9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwicGhhZWRydXM6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwicG9ldGljczpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJtb2J5LWRpY2s6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwiZ3JlYXQtZXhwZWN0YXRpb25zOm9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwidGhlLWhpc3RvcmllczpvcmlnaW5hbC1lblwiOiBcIk1lZGl1bVwiLFxuICBcIm5pZWxzLWx5aG5lOm9yaWdpbmFsLWRhXCI6IFwiSGFyZFwiLFxuICBcIm5pZWxzLWx5aG5lOm9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwiaW1pdGF0aW9uLW9mLWNocmlzdDpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJqZXJ1c2FsZW06b3JpZ2luYWwtZW5cIjogXCJFYXN5XCIsXG4gIFwidGhlLWF3YWtlbmluZzpvcmlnaW5hbC1lblwiOiBcIk1lZGl1bVwiLFxuICBcImJyb3RoZXJzLWthcmFtYXpvdjpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJpbGlhZDpvcmlnaW5hbC1lblwiOiBcIk1lZGl1bVwiLFxuICBcIm5pY29tYWNoZWFuLWV0aGljczpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJ0aGUtcHJpbmNlOm9yaWdpbmFsLWl0XCI6IFwiSGFyZFwiLFxuICBcInRoZS1wcmluY2U6b3JpZ2luYWwtZW5cIjogXCJNZWRpdW1cIixcbiAgXCJiZXlvbmQtZ29vZC1hbmQtZXZpbDpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJrYW50LWdyb3VuZHdvcms6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwiYmVvd3VsZjpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJjYW5kaWRlOm9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwiZGVtb2NyYWN5LWluLWFtZXJpY2E6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwib2VkaXB1cy1yZXg6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwib2VkaXB1cy1hdC1jb2xvbnVzOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImFudGlnb25lOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImdlbmVhbG9neS1vZi1tb3JhbHM6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwiZGVzY2FydGVzLW1lZGl0YXRpb25zOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcIm9uLWxpYmVydHk6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwidXRpbGl0YXJpYW5pc206b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwicGVsb3Bvbm5lc2lhbi13YXI6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwiYXJpc3RvdGxlLXBvbGl0aWNzOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImxldmlhdGhhbjpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJmZWFyLWFuZC10cmVtYmxpbmc6b3JpZ2luYWwtZGFcIjogXCJIYXJkXCIsXG4gIFwiZmVhci1hbmQtdHJlbWJsaW5nOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImNvbW11bmlzdC1tYW5pZmVzdG86b3JpZ2luYWwtZW5cIjogXCJNZWRpdW1cIixcbiAgXCJzZWNvbmQtdHJlYXRpc2U6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwiaHVtZS1lbnF1aXJ5Om9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcInNvY2lhbC1jb250cmFjdDpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJ3ZWFsdGgtb2YtbmF0aW9uczpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJ3ZXJ0aGVyOm9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwiZmF1c3QtcGFydC0xOm9yaWdpbmFsLWRlXCI6IFwiSGFyZFwiLFxuICBcImZhdXN0LXBhcnQtMTpvcmlnaW5hbC1lblwiOiBcIk1lZGl1bVwiLFxuICBcIm9yZXN0ZWlhOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImJhY2NoYWU6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwibWVkZWE6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwiY29uZmVzc2lvbnM6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwibm90ZXMtZnJvbS11bmRlcmdyb3VuZDpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJtYWduYS1jYXJ0YTpvcmlnaW5hbC1lblwiOiBcIk1lZGl1bVwiLFxuICBcInVzLWZvdW5kaW5nLWRvY3VtZW50czpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJmZWRlcmFsaXN0LXBhcGVyczpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJmcmVkZXJpY2stZG91Z2xhc3M6b3JpZ2luYWwtZW5cIjogXCJFYXN5XCIsXG4gIFwiYS1saXR0bGUtcHJpbmNlc3M6b3JpZ2luYWwtZW5cIjogXCJFYXN5XCIsXG4gIFwianVuZ2xlLWJvb2s6b3JpZ2luYWwtZW5cIjogXCJNZWRpdW1cIixcbiAgXCJhcm91bmQtdGhlLXdvcmxkLTgwLWRheXM6b3JpZ2luYWwtZW5cIjogXCJNZWRpdW1cIixcbiAgXCJoZWFydC1vZi1kYXJrbmVzczpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJkaXNjb3Vyc2Utb24taW5lcXVhbGl0eTpvcmlnaW5hbC1mclwiOiBcIkhhcmRcIixcbiAgXCJkaXNjb3Vyc2Utb24taW5lcXVhbGl0eTpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJqZWt5bGwtYW5kLWh5ZGU6b3JpZ2luYWwtZW5cIjogXCJNZWRpdW1cIixcbiAgXCJ3YWxkZW46b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwidmluZGljYXRpb24tcmlnaHRzLW9mLXdvbWFuOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImNvbWVkeS1vZi1lcnJvcnM6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwibWVyY2hhbnQtb2YtdmVuaWNlOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImhlbnJ5LXY6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwiYXMteW91LWxpa2UtaXQ6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwid2ludGVycy10YWxlOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImp1bGl1cy1jYWVzYXI6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwidHdlbGZ0aC1uaWdodDpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJtZWFzdXJlLWZvci1tZWFzdXJlOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImhlbnJ5LWl2LXBhcnQtMjpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJtZXJyeS13aXZlcy1vZi13aW5kc29yOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcIm90aGVsbG86b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwia2luZy1sZWFyOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcIm11Y2gtYWRvLWFib3V0LW5vdGhpbmc6b3JpZ2luYWwtZW5cIjogXCJIYXJkXCIsXG4gIFwidGFtaW5nLW9mLXRoZS1zaHJldzpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJhbnRvbnktYW5kLWNsZW9wYXRyYTpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJyaWNoYXJkLWlpaTpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJjb3Jpb2xhbnVzOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcImN5bWJlbGluZTpvcmlnaW5hbC1lblwiOiBcIkhhcmRcIixcbiAgXCJhbm5hLWthcmVuaW5hOm9yaWdpbmFsLWVuXCI6IFwiTWVkaXVtXCIsXG4gIFwiZG9uLXF1aXhvdGU6b3JpZ2luYWwtZW5cIjogXCJNZWRpdW1cIixcbiAgXCJlc3NheXMtbW9udGFpZ25lOm9yaWdpbmFsLWVuXCI6IFwiSGFyZFwiLFxuICBcIml2YW4taWx5aWNoOm9yaWdpbmFsLXJ1XCI6IFwiTWVkaXVtXCIsXG4gIFwiaXZhbi1pbHlpY2g6b3JpZ2luYWwtZW5cIjogXCJNZWRpdW1cIlxufVxuXG5leHBvcnQgZnVuY3Rpb24gZWRpdGlvbkRpZmZpY3VsdHkoYm9va0lkOiBzdHJpbmcsIGVkaXRpb246IEVkaXRpb24pOiBFZGl0aW9uRGlmZmljdWx0eSB8IHVuZGVmaW5lZCB7XG4gIGlmIChlZGl0aW9uLmtleSA9PT0gJ21vZGVybi1lbicpIHJldHVybiAnRWFzeSdcbiAgcmV0dXJuIHJldmlld2VkW2Jvb2tJZCArICc6JyArIGVkaXRpb24ua2V5XVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZGVyRWRpdGlvbkxhYmVsKGVkaXRpb246IEVkaXRpb24pOiBzdHJpbmcge1xuICByZXR1cm4gZWRpdGlvbi5rZXkgPT09ICdtb2Rlcm4tZW4nID8gJ1RpbmN0IE1vZGVybiBFbmdsaXNoJyA6IGVkaXRpb24ubGFiZWxcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2RhdGFcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9kYXRhL2VkaXRpb25EZWZhdWx0cy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zcmMvZGF0YS9lZGl0aW9uRGVmYXVsdHMudHNcIjtpbXBvcnQgeyBlZGl0aW9uSG9sZCB9IGZyb20gJy4vZWRpdGlvbkF2YWlsYWJpbGl0eSdcbmltcG9ydCB7IGVkaXRpb25EaWZmaWN1bHR5IH0gZnJvbSAnLi4vbGFiL2VkaXRpb25EaWZmaWN1bHR5J1xuaW1wb3J0IHR5cGUgeyBFZGl0aW9uIH0gZnJvbSAnLi4vdHlwZXMnXG5cbi8qKlxuICogRGVmYXVsdCBlZGl0aW9ucywgYXBwcm92ZWQgMjAyNi0wOS0yNS4gT25lIHBvbGljeSBmb3IgZXZlcnkgZW50cnkgcG9pbnQ6XG4gKiB0aGUgbGlicmFyeSwgaGFuZG9mZnMsIHRoZSByZWFkZXIgYW5kIHRoZSBsZWdhY3kgYXBwLlxuICpcbiAqIC0gUmVhZDogVGluY3QgTW9kZXJuIEVuZ2xpc2g7IHRoZSBCaWJsZSByZWFkcyB0aGUgQmVyZWFuIFN0YW5kYXJkIEJpYmxlLlxuICogICBUaGUgYXVkaW9ib29rIGZvbGxvd3MgdGhlIG1haW4gZWRpdGlvbi5cbiAqIC0gQ29tcGFyZTogdGhlIG9yaWdpbmFsIGZvciBtb3JlIHJlY2VudCBFbmdsaXNoIHdvcmtzICgxNzAwIG9uLCBlLmcuXG4gKiAgIFByaWRlIGFuZCBQcmVqdWRpY2UsIFRoZSBBd2FrZW5pbmcpOyBvdGhlcndpc2UgdGhlIGVhc2llc3QtdG8tcmVhZCBodW1hblxuICogICB0cmFuc2xhdGlvbiwgYnkgdGhlIHJldmlld2VkIGRpZmZpY3VsdHkgcmF0aW5ncy5cbiAqXG4gKiBUaGVzZSBhcmUgZGVmYXVsdHMgb25seS4gQSByZWFkZXIncyBzYXZlZCBlZGl0aW9uIGZvciBhIGJvb2sgYWx3YXlzIHdpbnMuXG4gKi9cbnR5cGUgRWRpdGlvbkxpa2UgPSBQaWNrPEVkaXRpb24sICdrZXknIHwgJ3N0eWxlJyB8ICdsYW5ndWFnZSc+ICYgeyBhbGlnbmVkPzogYm9vbGVhbiB9XG5cbmNvbnN0IERJRkZJQ1VMVFlfUkFOSyA9IHsgRWFzeTogMCwgTWVkaXVtOiAxLCBIYXJkOiAyIH0gYXMgY29uc3RcbmNvbnN0IFJFQ0VOVF9FTkdMSVNIX0ZST00gPSAxNzAwXG5cbi8qKlxuICogTWFjaGluZS1tYWRlIGVkaXRpb25zIHRoYXQgY2Fycnkgc3R5bGUgJ29yaWdpbmFsJyBhbmQgYXJlIG5ldmVyIGEgZGVmYXVsdC5cbiAqIEZlYXIgYW5kIFRyZW1ibGluZyBvcmlnaW5hbC1lbiBpcyBhbiBBSSB0cmFuc2xhdGlvbiBsYWJlbGxlZCBcIk9yaWdpbmFsXG4gKiAoRW5nbGlzaClcIiAoYjc2ZmE1NjQpOyBubyBwdWJsaWMtZG9tYWluIGh1bWFuIEVuZ2xpc2ggdHJhbnNsYXRpb24gZXhpc3RzXG4gKiAocGFja2FnZSBQUk9WRU5BTkNFLm1kKS4gSXQgaXMgcmV0aXJlZCB3aXRoIHRoZSBSMiBzdHJ1Y3R1cmUgY2hhbmdlLlxuICovXG5jb25zdCBNQUNISU5FX01BREVfT1JJR0lOQUxTOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldChbJ2ZlYXItYW5kLXRyZW1ibGluZy9vcmlnaW5hbC1lbiddKVxuLyoqIEJvb2tzIHdob3NlIGRlZmF1bHQgQ29tcGFyZSBpcyBub25lOyByZWFkZXJzIGNob29zZSBvbmUgZXhwbGljaXRseS4gKi9cbmNvbnN0IE5PX0RFRkFVTFRfQ09NUEFSRTogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoWydmZWFyLWFuZC10cmVtYmxpbmcnXSlcblxuZXhwb3J0IGZ1bmN0aW9uIGlzTWFjaGluZU1hZGVPcmlnaW5hbChib29rSWQ6IHN0cmluZywgZWRpdGlvbktleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBNQUNISU5FX01BREVfT1JJR0lOQUxTLmhhcyhgJHtib29rSWR9LyR7ZWRpdGlvbktleX1gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdFByaW1hcnlFZGl0aW9uS2V5KGJvb2tJZDogc3RyaW5nLCBhbGxFZGl0aW9uczogcmVhZG9ubHkgRWRpdGlvbkxpa2VbXSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGVkaXRpb25zID0gYWxsRWRpdGlvbnMuZmlsdGVyKGVkaXRpb24gPT4gIWVkaXRpb25Ib2xkKGJvb2tJZCwgZWRpdGlvbi5rZXkpICYmICFpc01hY2hpbmVNYWRlT3JpZ2luYWwoYm9va0lkLCBlZGl0aW9uLmtleSkpXG4gIGNvbnN0IGJ5S2V5ID0gKGtleTogc3RyaW5nKSA9PiBlZGl0aW9ucy5maW5kKGVkaXRpb24gPT4gZWRpdGlvbi5rZXkgPT09IGtleSk/LmtleVxuICByZXR1cm4gKGJvb2tJZCA9PT0gJ2JpYmxlJyA/IGJ5S2V5KCdic2ItZW4nKSA6IHVuZGVmaW5lZClcbiAgICA/PyBieUtleSgnbW9kZXJuLWVuJylcbiAgICA/PyBlZGl0aW9ucy5maW5kKGVkaXRpb24gPT4gZWRpdGlvbi5zdHlsZSA9PT0gJ21vZGVybicgJiYgZWRpdGlvbi5sYW5ndWFnZSA9PT0gJ2VuJyk/LmtleVxuICAgID8/IGJ5S2V5KCdvcmlnaW5hbC1lbicpXG4gICAgPz8gZWRpdGlvbnMuZmluZChlZGl0aW9uID0+IGVkaXRpb24ubGFuZ3VhZ2UgPT09ICdlbicpPy5rZXlcbiAgICA/PyBlZGl0aW9uc1swXT8ua2V5XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0Q29tcGFyZUVkaXRpb25LZXkoXG4gIGJvb2tJZDogc3RyaW5nLFxuICBlZGl0aW9uczogcmVhZG9ubHkgRWRpdGlvbkxpa2VbXSxcbiAgcHJpbWFyeUtleTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICB5ZWFyPzogbnVtYmVyIHwgbnVsbCxcbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChOT19ERUZBVUxUX0NPTVBBUkUuaGFzKGJvb2tJZCkpIHJldHVybiB1bmRlZmluZWRcbiAgY29uc3QgY29tcGFyYWJsZSA9IGVkaXRpb25zLmZpbHRlcihlZGl0aW9uID0+ICFlZGl0aW9uSG9sZChib29rSWQsIGVkaXRpb24ua2V5KSAmJiBlZGl0aW9uLmtleSAhPT0gcHJpbWFyeUtleSAmJiBlZGl0aW9uLmFsaWduZWQgIT09IGZhbHNlICYmICFpc01hY2hpbmVNYWRlT3JpZ2luYWwoYm9va0lkLCBlZGl0aW9uLmtleSkpXG4gIGNvbnN0IGh1bWFuID0gY29tcGFyYWJsZS5maWx0ZXIoZWRpdGlvbiA9PiBlZGl0aW9uLnN0eWxlICE9PSAnbW9kZXJuJyAmJiBlZGl0aW9uLmxhbmd1YWdlID09PSAnZW4nKVxuICAvLyBBbiBFbmdsaXNoIHdvcmsgaGFzIG5vIG5vbi1FbmdsaXNoIG9yaWdpbmFsIGluIHRoZSBjYXRhbG9ndWUuXG4gIGNvbnN0IGVuZ2xpc2hXb3JrID0gIWVkaXRpb25zLnNvbWUoZWRpdGlvbiA9PiBlZGl0aW9uLnN0eWxlID09PSAnb3JpZ2luYWwnICYmIGVkaXRpb24ubGFuZ3VhZ2UgIT09ICdlbicpXG4gIGNvbnN0IG9yaWdpbmFsID0gaHVtYW4uZmluZChlZGl0aW9uID0+IGVkaXRpb24ua2V5ID09PSAnb3JpZ2luYWwtZW4nKVxuICBpZiAoZW5nbGlzaFdvcmsgJiYgb3JpZ2luYWwgJiYgdHlwZW9mIHllYXIgPT09ICdudW1iZXInICYmIHllYXIgPj0gUkVDRU5UX0VOR0xJU0hfRlJPTSkgcmV0dXJuIG9yaWdpbmFsLmtleVxuICBjb25zdCByYW5rID0gKGVkaXRpb246IEVkaXRpb25MaWtlKSA9PiB7XG4gICAgY29uc3QgcmF0ZWQgPSBlZGl0aW9uRGlmZmljdWx0eShib29rSWQsIGVkaXRpb24gYXMgRWRpdGlvbilcbiAgICByZXR1cm4gcmF0ZWQgPyBESUZGSUNVTFRZX1JBTktbcmF0ZWRdIDogRElGRklDVUxUWV9SQU5LLk1lZGl1bVxuICB9XG4gIC8vIFN0YWJsZTogZXF1YWwgcmF0aW5ncyBrZWVwIHJlZ2lzdHJ5IG9yZGVyLlxuICBjb25zdCBlYXNpZXN0ID0gaHVtYW4ubWFwKChlZGl0aW9uLCBpbmRleCkgPT4gKHsgZWRpdGlvbiwgaW5kZXggfSkpXG4gICAgLnNvcnQoKGEsIGIpID0+IHJhbmsoYS5lZGl0aW9uKSAtIHJhbmsoYi5lZGl0aW9uKSB8fCBhLmluZGV4IC0gYi5pbmRleClbMF0/LmVkaXRpb25cbiAgcmV0dXJuIGVhc2llc3Q/LmtleSA/PyBjb21wYXJhYmxlWzBdPy5rZXlcbn1cblxuLyoqXG4gKiBUaGUgZWRpdGlvbiBmb3IgYSBzYXZlZCBwbGFjZSBvciBjb250aW51YXRpb24gdGhhdCBjYXJyaWVzIG5vIGVkaXRpb24ga2V5LlxuICogVGhvc2UgcHJlZGF0ZSBlZGl0aW9uIGtleXMsIHdoZW4gdGhlIG9yaWdpbmFsIHdhcyB0aGUgZGVmYXVsdCwgc28gdGhleSBrZWVwXG4gKiByZWFkaW5nIGl0IHJhdGhlciB0aGFuIHN3aXRjaGluZyB0byB0aGUgbmV3LXJlYWRlciBkZWZhdWx0OyBhIG1hY2hpbmUtbWFkZVxuICogXCJvcmlnaW5hbFwiIGlzIG5ldmVyIGNob3Nlbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhdmVkUGxhY2VGYWxsYmFja0VkaXRpb25LZXkoYm9va0lkOiBzdHJpbmcsIGVkaXRpb25zOiByZWFkb25seSBFZGl0aW9uTGlrZVtdKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGVkaXRpb25zLmZpbmQoZWRpdGlvbiA9PiBlZGl0aW9uLnN0eWxlID09PSAnb3JpZ2luYWwnICYmIGVkaXRpb24ubGFuZ3VhZ2UgPT09ICdlbicgJiYgIWlzTWFjaGluZU1hZGVPcmlnaW5hbChib29rSWQsIGVkaXRpb24ua2V5KSk/LmtleVxuICAgID8/IGRlZmF1bHRQcmltYXJ5RWRpdGlvbktleShib29rSWQsIGVkaXRpb25zKVxuICAgID8/IGVkaXRpb25zWzBdPy5rZXlcbn1cblxuLyoqXG4gKiBcIk5ldyBib29rcyBvcGVuIGluOiBIdW1hbiB0cmFuc2xhdGlvbnNcIiAocHJvZmlsZXMsIHNvY2lhbCBzaGlwIDIsIEFuZGVyc1xuICogMjAyNi0xMC0wNyk6IGEgYm9vayB3cml0dGVuIGluIEVuZ2xpc2ggb3BlbnMgYXMgd3JpdHRlbiAoaXRzIEVuZ2xpc2hcbiAqIG9yaWdpbmFsKTsgYSB0cmFuc2xhdGVkIHdvcmsgb3BlbnMgaW4gdGhlIGVhc2llc3QtdG8tcmVhZCBodW1hbiBFbmdsaXNoXG4gKiB0cmFuc2xhdGlvbiwgYnkgdGhlIHJldmlld2VkIGRpZmZpY3VsdHkgcmF0aW5ncy4gVGhlIEJpYmxlIGtlZXBzIHRoZSBCU0IsXG4gKiBhbmQgYSBib29rIHdpdGggbm8gaHVtYW4gRW5nbGlzaCBlZGl0aW9uIGtlZXBzIHRoZSBhcHByb3ZlZCBkZWZhdWx0LlxuICogQSByZWFkZXIncyBzYXZlZCBlZGl0aW9uIGZvciBhIGJvb2sgYWx3YXlzIHdpbnMgb3ZlciB0aGlzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaHVtYW5QcmltYXJ5RWRpdGlvbktleShib29rSWQ6IHN0cmluZywgYWxsRWRpdGlvbnM6IHJlYWRvbmx5IEVkaXRpb25MaWtlW10pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBjb25zdCBlZGl0aW9ucyA9IGFsbEVkaXRpb25zLmZpbHRlcihlZGl0aW9uID0+ICFlZGl0aW9uSG9sZChib29rSWQsIGVkaXRpb24ua2V5KSAmJiAhaXNNYWNoaW5lTWFkZU9yaWdpbmFsKGJvb2tJZCwgZWRpdGlvbi5rZXkpKVxuICBpZiAoYm9va0lkID09PSAnYmlibGUnKSByZXR1cm4gZGVmYXVsdFByaW1hcnlFZGl0aW9uS2V5KGJvb2tJZCwgYWxsRWRpdGlvbnMpXG4gIGNvbnN0IGh1bWFuID0gZWRpdGlvbnMuZmlsdGVyKGVkaXRpb24gPT4gZWRpdGlvbi5zdHlsZSAhPT0gJ21vZGVybicgJiYgZWRpdGlvbi5sYW5ndWFnZSA9PT0gJ2VuJylcbiAgY29uc3QgZW5nbGlzaFdvcmsgPSAhZWRpdGlvbnMuc29tZShlZGl0aW9uID0+IGVkaXRpb24uc3R5bGUgPT09ICdvcmlnaW5hbCcgJiYgZWRpdGlvbi5sYW5ndWFnZSAhPT0gJ2VuJylcbiAgY29uc3Qgb3JpZ2luYWwgPSBodW1hbi5maW5kKGVkaXRpb24gPT4gZWRpdGlvbi5rZXkgPT09ICdvcmlnaW5hbC1lbicpID8/IGh1bWFuLmZpbmQoZWRpdGlvbiA9PiBlZGl0aW9uLnN0eWxlID09PSAnb3JpZ2luYWwnKVxuICBpZiAoZW5nbGlzaFdvcmsgJiYgb3JpZ2luYWwpIHJldHVybiBvcmlnaW5hbC5rZXlcbiAgY29uc3QgcmFuayA9IChlZGl0aW9uOiBFZGl0aW9uTGlrZSkgPT4ge1xuICAgIGNvbnN0IHJhdGVkID0gZWRpdGlvbkRpZmZpY3VsdHkoYm9va0lkLCBlZGl0aW9uIGFzIEVkaXRpb24pXG4gICAgcmV0dXJuIHJhdGVkID8gRElGRklDVUxUWV9SQU5LW3JhdGVkXSA6IERJRkZJQ1VMVFlfUkFOSy5NZWRpdW1cbiAgfVxuICBjb25zdCBlYXNpZXN0ID0gaHVtYW4ubWFwKChlZGl0aW9uLCBpbmRleCkgPT4gKHsgZWRpdGlvbiwgaW5kZXggfSkpXG4gICAgLnNvcnQoKGEsIGIpID0+IHJhbmsoYS5lZGl0aW9uKSAtIHJhbmsoYi5lZGl0aW9uKSB8fCBhLmluZGV4IC0gYi5pbmRleClbMF0/LmVkaXRpb25cbiAgcmV0dXJuIGVhc2llc3Q/LmtleSA/PyBkZWZhdWx0UHJpbWFyeUVkaXRpb25LZXkoYm9va0lkLCBhbGxFZGl0aW9ucylcbn1cblxuLyoqIFRoZSBlZGl0aW9uIGEgYm9vayBvcGVucyBpbiB0aGUgZmlyc3QgdGltZSwgdW5kZXIgdGhlIHJlYWRlcidzIFwiTmV3IGJvb2tzIG9wZW4gaW5cIiBjaG9pY2UuICovXG5leHBvcnQgZnVuY3Rpb24gbmV3Qm9va1ByaW1hcnlFZGl0aW9uS2V5KGJvb2tJZDogc3RyaW5nLCBlZGl0aW9uczogcmVhZG9ubHkgRWRpdGlvbkxpa2VbXSwgb3BlbkluOiAnbW9kZXJuJyB8ICdodW1hbicgfCBudWxsKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIG9wZW5JbiA9PT0gJ2h1bWFuJyA/IGh1bWFuUHJpbWFyeUVkaXRpb25LZXkoYm9va0lkLCBlZGl0aW9ucykgOiBkZWZhdWx0UHJpbWFyeUVkaXRpb25LZXkoYm9va0lkLCBlZGl0aW9ucylcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL3ByZVJlYWRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL3ByZVJlYWRlci9jYXRhbG9ndWUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL3ByZVJlYWRlci9jYXRhbG9ndWUudHNcIjtpbXBvcnQgeyBlZGl0aW9uSG9sZCB9IGZyb20gJy4uL2RhdGEvZWRpdGlvbkF2YWlsYWJpbGl0eSdcbmltcG9ydCB7IGlzQXVkaW9IZWxkLCBpc0Jvb2tEaXNjb3ZlcmFibGUsIGlzQm9va1NlYXJjaGFibGUsIGlzRWRpdGlvbkRpc2NvdmVyYWJsZSB9IGZyb20gJy4uL2RhdGEvYXVkaW9BdmFpbGFiaWxpdHknXG5pbXBvcnQgeyBCT09LUyB9IGZyb20gJy4uL2RhdGEvYm9va1JlZ2lzdHJ5J1xuaW1wb3J0IHsgaXNFZGl0aW9uV2l0aGhlbGQgfSBmcm9tICcuLi9kYXRhL3dpdGhoZWxkRWRpdGlvbnMnXG5pbXBvcnQgeyBwdWJsaXNoZXJQZXJtaXNzaW9uIH0gZnJvbSAnLi4vZGF0YS9wdWJsaXNoZXJQZXJtaXNzaW9ucydcbmltcG9ydCB7XG4gIExJQlJBUllfQk9PS19NRVRBX0JZX0lELFxuICBMSUJSQVJZX0hPVVNFUyxcbiAgTElCUkFSWV9TSEVMVkVTLFxuICBnZXRCb29rRGlzcGxheVllYXIsXG59IGZyb20gJy4uL2RhdGEvbGlicmFyeVRheG9ub215J1xuaW1wb3J0IHR5cGUgeyBCb29rLCBFZGl0aW9uLCBFZGl0aW9uS2V5LCBMYW5ndWFnZSwgU3R5bGUgfSBmcm9tICcuLi90eXBlcydcbmltcG9ydCB7IGRlZmF1bHRDb21wYXJlRWRpdGlvbktleSwgZGVmYXVsdFByaW1hcnlFZGl0aW9uS2V5IH0gZnJvbSAnLi4vZGF0YS9lZGl0aW9uRGVmYXVsdHMnXG5cbmNvbnN0IEZBTExCQUNLX0NPVkVSX0JBQ0tHUk9VTkQgPSAnIzJjMjQxNydcbmNvbnN0IEZBTExCQUNLX0NPVkVSX0FDQ0VOVCA9ICcjYzlhNDVjJ1xuXG5leHBvcnQgdHlwZSBQcmVSZWFkZXJFZGl0aW9uUHJvdmVuYW5jZSA9XG4gIHwgJ2h1bWFuLXRyYW5zbGF0aW9uJ1xuICB8ICdhdXRob3JpYWwtb3JpZ2luYWwnXG4gIHwgJ3B1Ymxpc2hlZC1lZGl0aW9uJ1xuICB8ICd0aW5jdC1haS1hZGFwdGF0aW9uJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZVJlYWRlckNvdmVyVmlld01vZGVsIHtcbiAga2luZDogJ2dlbmVyYXRlZCdcbiAgYmFja2dyb3VuZDogc3RyaW5nXG4gIGFjY2VudDogc3RyaW5nXG59XG5cbi8qKlxuICogUmVhbCBjb3ZlciBhcnQgc2hpcHBlZCBhcyBhbiBhcHAgYXNzZXQgKDI6MywgNTQwXHUwMEQ3ODEwIFdlYlAsIG9wdGlvbmFsIDJcdTAwRDcpLlxuICogVGhlIGFydCBjYXJyaWVzIGl0cyBvd24gdGl0bGUgYW5kIGF1dGhvciwgc28gdGhlIGNvdmVyIGNvbXBvbmVudCBpcyB0aGVcbiAqIGltYWdlIGFsb25lLiBCb29rcyB3aXRob3V0IGFydCBrZWVwIHRoZSBnZW5lcmF0ZWQgdHlwb2dyYXBoaWMgcGxhY2Vob2xkZXIuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJlUmVhZGVyQ292ZXJBcnQge1xuICBzcmM6IHN0cmluZ1xuICBzcmNTZXQ6IHN0cmluZ1xufVxuXG4vKipcbiAqIENvdmVyIGFydCB1bmRlciBwdWJsaWMvY292ZXJzL3YyOiB0aGUgd2hvbGUgcHVibGlzaGVkIGNvbGxlY3Rpb24uIEV2ZXJ5XG4gKiByZWdpc3RlcmVkIGJvb2sgc2hpcHMgYSA1NDBcdTAwRDc4MTAgV2ViUCBuYW1lZCBhZnRlciBpdHMgcmVnaXN0cnkgaWQsIHNvIHRoZVxuICogbGlzdCBpcyBkZXJpdmVkIGZyb20gQk9PS1MgcmF0aGVyIHRoYW4gaGFuZC1tYWludGFpbmVkIFx1MjAxNCBhIG5ldyBib29rIHdpdGhvdXRcbiAqIGFydCBmYWlscyB0aGUgYXNzZXQgdGVzdCBpbiBsYWJDb3ZlckFydC50ZXN0LnRzIGluc3RlYWQgb2Ygc2lsZW50bHkgZmFsbGluZ1xuICogYmFjayB0byB0aGUgdHlwb2dyYXBoaWMgcGxhY2Vob2xkZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBMQUJfQ09WRVJfQVJUX0JPT0tfSURTOiByZWFkb25seSBzdHJpbmdbXSA9IEJPT0tTLm1hcChib29rID0+IGJvb2suaWQpXG5cbi8qKlxuICogQ292ZXJzIHdpdGggYSAxMDgwXHUwMEQ3MTYyMCAyXHUwMEQ3IHZhcmlhbnQuIFRoZSB2MiBtYXN0ZXJzIGFyZSAxMDI0XHUwMEQ3MTUzNiwgc28gYSAyXHUwMEQ3XG4gKiBkZXJpdmF0aXZlIGlzIGFuIHVwc2NhbGUgd2l0aCBubyBleHRyYSBkZXRhaWw7IGl0IGV4aXN0cyBvbmx5IGZvciB0aGUgcGlsb3RcbiAqIHRpdGxlcyB0aGF0IHNoaXBwZWQgb25lLiBFdmVyeXRoaW5nIGVsc2Ugc2VydmVzIHRoZSA1NDBcdTAwRDc4MTAgYXNzZXQsIHdoaWNoXG4gKiBhbHJlYWR5IGNvdmVycyB0aGUgbGFyZ2VzdCBjb3ZlciBzbG90ICgyMjAgQ1NTIHB4KSBhdCAyXHUwMEQ3IGRldmljZSBwaXhlbHMuXG4gKi9cbmV4cG9ydCBjb25zdCBMQUJfQ09WRVJfQVJUXzJYX0JPT0tfSURTOiByZWFkb25seSBzdHJpbmdbXSA9IFtcbiAgJ29keXNzZXknLFxuICAndGhlLXJlcHVibGljJyxcbiAgJ3ByaWRlLWFuZC1wcmVqdWRpY2UnLFxuICAndGhlLWhpc3RvcmllcycsXG4gICd0aGUtYXJ0LW9mLXdhcicsXG4gICdmcmFua2Vuc3RlaW4nLFxuICAnbWVkaXRhdGlvbnMnLFxuICAnZnJlZGVyaWNrLWRvdWdsYXNzJyxcbl1cblxuLyoqXG4gKiBUaGUgcG9wdWxhciBzaGVsZiwgaW4gc2hlbGYgb3JkZXIgKGxlZnQgdG8gcmlnaHQpLiBUaGUgZmlyc3QgZWlnaHQgYXJlIHRoZVxuICogcm93IGEgcGhvbmUgc2hvd3M7IHRoZSByZXN0IGNhcnJ5IGl0IGFjcm9zcyBhIHdpZGUgZGVza3RvcCwgd2hlcmUgZWlnaHRcbiAqIGNvdmVycyBsZWF2ZSBhIHdpZGUgZW1wdHkgYmFuZCBhdCB0aGUgcmlnaHQgb2YgdGhlIHRyYWNrLiBIb3cgbWFueSBvZiB0aGVtXG4gKiBhIGdpdmVuIHZpZXdwb3J0IHNob3dzIGlzIGBwb3B1bGFyU2hlbGZTaXplYCBpbiBsYWIvbGlicmFyeS1tb2RlbC5qcy5cbiAqL1xuZXhwb3J0IGNvbnN0IExBQl9QT1BVTEFSX0JPT0tfSURTOiByZWFkb25seSBzdHJpbmdbXSA9IFtcbiAgJ2ZyYW5rZW5zdGVpbicsXG4gICdvZHlzc2V5JyxcbiAgJ2pla3lsbC1hbmQtaHlkZScsXG4gICdwcmlkZS1hbmQtcHJlanVkaWNlJyxcbiAgJ21lZGl0YXRpb25zJyxcbiAgJ2NyaW1lLWFuZC1wdW5pc2htZW50JyxcbiAgJ2phbmUtZXlyZScsXG4gICd0aGUtcHJpbmNlJyxcbiAgJ2p1bGl1cy1jYWVzYXInLFxuICAnY2FuZGlkZScsXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBsYWJDb3ZlckFydChib29rSWQ6IHN0cmluZyk6IFByZVJlYWRlckNvdmVyQXJ0IHwgbnVsbCB7XG4gIGlmICghTEFCX0NPVkVSX0FSVF9CT09LX0lEUy5pbmNsdWRlcyhib29rSWQpKSByZXR1cm4gbnVsbFxuICBjb25zdCBzcmMgPSBgL2NvdmVycy92Mi8ke2Jvb2tJZH0ud2VicGBcbiAgY29uc3Qgc3JjU2V0ID0gTEFCX0NPVkVSX0FSVF8yWF9CT09LX0lEUy5pbmNsdWRlcyhib29rSWQpID8gYCR7c3JjfSAxeCwgL2NvdmVycy92Mi8ke2Jvb2tJZH1AMngud2VicCAyeGAgOiBgJHtzcmN9IDF4YFxuICByZXR1cm4geyBzcmMsIHNyY1NldCB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlUmVhZGVyQXZhaWxhYmlsaXR5IHtcbiAgY292ZXI6IGJvb2xlYW5cbiAgY2hhcHRlclRleHQ6IGJvb2xlYW5cbiAgYXVkaW86IGJvb2xlYW5cbiAgY29tcGFyZTogYm9vbGVhblxuICBvcHRpb25hbFByZWZhY2U6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcmVSZWFkZXJFZGl0aW9uVmlld01vZGVsIHtcbiAgZGlzY292ZXJ5QXZhaWxhYmxlPzogYm9vbGVhblxuICBhdWRpb0hlbGQ/OiBib29sZWFuXG4gIGtleTogRWRpdGlvbktleVxuICBsYW5ndWFnZTogTGFuZ3VhZ2VcbiAgc3R5bGU6IFN0eWxlXG4gIGxhYmVsOiBzdHJpbmdcbiAgdHJhbnNsYXRvcjogc3RyaW5nIHwgbnVsbFxuICB5ZWFyOiBudW1iZXIgfCBudWxsXG4gIGFsaWduZWQ6IGJvb2xlYW5cbiAgZ3JvdXA6ICdodW1hbicgfCAnbW9kZXJuJ1xuICBwcm92ZW5hbmNlOiBQcmVSZWFkZXJFZGl0aW9uUHJvdmVuYW5jZVxuICBwcm92ZW5hbmNlTGFiZWw6IHN0cmluZ1xuICBhdmFpbGFiaWxpdHk6IFBpY2s8UHJlUmVhZGVyQXZhaWxhYmlsaXR5LCAnY2hhcHRlclRleHQnIHwgJ2F1ZGlvJyB8ICdjb21wYXJlJz5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcmVSZWFkZXJCb29rVmlld01vZGVsIHtcbiAgZGlzY292ZXJ5QXZhaWxhYmxlPzogYm9vbGVhblxuICAvKiogRm91bmQgYnkgYSB0eXBlZCBzZWFyY2gsIGV2ZW4gd2hpbGUgaGVsZCBmcm9tIHRoZSBzaGVsdmVzIChTRUFSQ0hfT05MWV9CT09LUykuICovXG4gIHNlYXJjaEF2YWlsYWJsZT86IGJvb2xlYW5cbiAgaWQ6IHN0cmluZ1xuICB0aXRsZTogc3RyaW5nXG4gIGF1dGhvcjogc3RyaW5nXG4gIC8qKiBPdGhlciB0aXRsZXMgcmVhZGVycyBrbm93IHRoZSBib29rIGJ5IChyZWdpc3RyeSBgYWx0VGl0bGVzYCksIHNlYXJjaGVkIGFzIHRpdGxlcyBpbiB0aGUgbGlicmFyeS4gKi9cbiAgYWx0VGl0bGVzPzogc3RyaW5nW11cbiAgc3VtbWFyeTogc3RyaW5nXG4gIC8qKiBPbmUtbGluZSBkZXNjcmlwdGlvbiBmcm9tIHRoZSBsaWJyYXJ5IHRheG9ub215IChmYWxscyBiYWNrIHRvIHRoZSBmaXJzdCBzZW50ZW5jZSBvZiB0aGUgc3VtbWFyeSkuICovXG4gIGJsdXJiOiBzdHJpbmdcbiAgZGlzcGxheVllYXI6IHN0cmluZ1xuICB3b3JkQ291bnQ6IG51bWJlciB8IG51bGxcbiAgY292ZXI6IFByZVJlYWRlckNvdmVyVmlld01vZGVsXG4gIGFydDogUHJlUmVhZGVyQ292ZXJBcnQgfCBudWxsXG4gIHNoZWxmSWRzOiBzdHJpbmdbXVxuICBob3VzZUlkczogc3RyaW5nW11cbiAgdG9waWNzOiBzdHJpbmdbXVxuICBlZGl0aW9uczogUHJlUmVhZGVyRWRpdGlvblZpZXdNb2RlbFtdXG4gIC8qKiBBcHByb3ZlZCBkZWZhdWx0IGVkaXRpb25zICgyMDI2LTA5LTI1KTsgYSByZWFkZXIncyBzYXZlZCBlZGl0aW9uIHdpbnMuICovXG4gIGRlZmF1bHRFZGl0aW9uS2V5OiBzdHJpbmcgfCBudWxsXG4gIGRlZmF1bHRDb21wYXJlRWRpdGlvbktleTogc3RyaW5nIHwgbnVsbFxuICBhdmFpbGFiaWxpdHk6IFByZVJlYWRlckF2YWlsYWJpbGl0eVxuICBjYXRhbG9ndWVJbmRleDogbnVtYmVyXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlUmVhZGVyU2hlbGZWaWV3TW9kZWwge1xuICBpZDogc3RyaW5nXG4gIHRpdGxlOiBzdHJpbmdcbiAgc3VidGl0bGU6IHN0cmluZ1xuICBodWU6IG51bWJlclxuICBib29rczogUHJlUmVhZGVyQm9va1ZpZXdNb2RlbFtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlUmVhZGVySG91c2VWaWV3TW9kZWwge1xuICBpZDogc3RyaW5nXG4gIHRpdGxlOiBzdHJpbmdcbiAgc3VidGl0bGU6IHN0cmluZ1xuICBodWU6IG51bWJlclxuICBzaGVsdmVzOiBQcmVSZWFkZXJTaGVsZlZpZXdNb2RlbFtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlUmVhZGVyQ2F0YWxvZ3VlIHtcbiAgYm9va3M6IFByZVJlYWRlckJvb2tWaWV3TW9kZWxbXVxuICBib29rc0J5SWQ6IFJlYWRvbmx5TWFwPHN0cmluZywgUHJlUmVhZGVyQm9va1ZpZXdNb2RlbD5cbiAgaG91c2VzOiBQcmVSZWFkZXJIb3VzZVZpZXdNb2RlbFtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXphYmxlUHJlUmVhZGVyQ2F0YWxvZ3VlIHtcbiAgYm9va3M6IFByZVJlYWRlckJvb2tWaWV3TW9kZWxbXVxuICBob3VzZXM6IEFycmF5PE9taXQ8UHJlUmVhZGVySG91c2VWaWV3TW9kZWwsICdzaGVsdmVzJz4gJiB7XG4gICAgc2hlbHZlczogQXJyYXk8T21pdDxQcmVSZWFkZXJTaGVsZlZpZXdNb2RlbCwgJ2Jvb2tzJz4gJiB7IGJvb2tJZHM6IHN0cmluZ1tdIH0+XG4gIH0+XG4gIC8qKiBQb3B1bGFyIHNoZWxmIG9yZGVyOyBvbmx5IHB1Ymxpc2hlZCBpZHMuICovXG4gIHBvcHVsYXI6IHN0cmluZ1tdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQm9va0RldGFpbFZpZXdNb2RlbCB7XG4gIGJvb2s6IFByZVJlYWRlckJvb2tWaWV3TW9kZWxcbiAgZmFjdHM6IHtcbiAgICBkaXNwbGF5WWVhcjogc3RyaW5nIHwgbnVsbFxuICAgIHdvcmRDb3VudDogbnVtYmVyIHwgbnVsbFxuICAgIGVkaXRpb25Db3VudDogbnVtYmVyXG4gICAgbGFuZ3VhZ2VzOiBMYW5ndWFnZVtdXG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFZGl0aW9uU2VsZWN0aW9uVmlld01vZGVsIHtcbiAgYm9va0lkOiBzdHJpbmdcbiAgdGl0bGU6IHN0cmluZ1xuICBzZWxlY3RlZEVkaXRpb25LZXk6IEVkaXRpb25LZXlcbiAgaHVtYW5FZGl0aW9uczogUHJlUmVhZGVyRWRpdGlvblZpZXdNb2RlbFtdXG4gIG1vZGVybkVkaXRpb25zOiBQcmVSZWFkZXJFZGl0aW9uVmlld01vZGVsW11cbiAgY29tcGFyZU9wdGlvbnM6IFByZVJlYWRlckVkaXRpb25WaWV3TW9kZWxbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNhdmVkUmVhZGVyUGxhY2VJbnB1dCB7XG4gIGJvb2tJZDogc3RyaW5nXG4gIGNoYXB0ZXJOdW1iZXI6IG51bWJlclxuICBwYWdlPzogbnVtYmVyXG4gIHBhcmFncmFwaEluZGV4PzogbnVtYmVyXG4gIHdvcmRJbmRleD86IG51bWJlclxuICAvKiogSWRlbnRpdHkgb2YgdGhlIGVkaXRpb24gdXNlZCBmb3IgdGhlc2UgY29vcmRpbmF0ZXM7IGFic2VudCBvbiBsZWdhY3kgcGxhY2VzLiAqL1xuICBjb250ZW50UmV2aXNpb24/OiBzdHJpbmdcbiAgY29udGVudFJlY292ZXJ5Pzoge1xuICAgIGVkaXRpb25LZXk6IHN0cmluZ1xuICAgIGNvbnRlbnRSZXZpc2lvbjogc3RyaW5nXG4gICAgY2hhcHRlck51bWJlcjogbnVtYmVyXG4gICAgcGFyYWdyYXBoSW5kZXg6IG51bWJlclxuICAgIHdvcmRJbmRleDogbnVtYmVyXG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBTYXZlZFByb2dyZXNzSW5wdXQgZXh0ZW5kcyBTYXZlZFJlYWRlclBsYWNlSW5wdXQge1xuICBlZGl0aW9uS2V5PzogRWRpdGlvbktleVxuICBwZXJjZW50PzogbnVtYmVyXG4gIHVwZGF0ZWRBdD86IG51bWJlclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlYWRpbmdIaXN0b3J5SW5wdXQge1xuICBib29rSWQ6IHN0cmluZ1xuICBsYXN0UmVhZEF0OiBudW1iZXJcbiAgc3VtbWFyeT86IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJldHVybmluZ1JlYWRlclZpZXdNb2RlbCB7XG4gIGJvb2s6IFByZVJlYWRlckJvb2tWaWV3TW9kZWxcbiAgZWRpdGlvbktleTogRWRpdGlvbktleVxuICBwZXJjZW50OiBudW1iZXIgfCBudWxsXG4gIGxhc3RSZWFkQXQ6IG51bWJlciB8IG51bGxcbiAgaGlzdG9yeVN1bW1hcnk6IHN0cmluZyB8IG51bGxcbiAgc2F2ZWRQbGFjZTogU2F2ZWRSZWFkZXJQbGFjZUlucHV0XG4gIGhhbmRvZmY6IFJlYWRlckhhbmRvZmZJbnRlbnRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZWFkZXJIYW5kb2ZmU2VsZWN0aW9uIHtcbiAgYm9va0lkOiBzdHJpbmdcbiAgcHJpbWFyeUVkaXRpb25LZXk6IEVkaXRpb25LZXlcbiAgY29tcGFyZUVkaXRpb25LZXk/OiBFZGl0aW9uS2V5XG4gIC8qKlxuICAgKiBUaGUgQ29tcGFyZSBlZGl0aW9uIChvciBpdHMgYWJzZW5jZSkgaXMgdGhlIHJlYWRlcidzIG93biBleHBsaWNpdCBwaWNrLFxuICAgKiBlLmcuIFwiTm9uZVwiIGluIHRoZSBsaWJyYXJ5IGludHJvZHVjdGlvbi4gV2l0aG91dCBpdCwgQ29tcGFyZSBpcyBhIGRlZmF1bHQuXG4gICAqL1xuICBjb21wYXJlQ2hvc2VuPzogYm9vbGVhblxuICBhdWRpb0VkaXRpb25LZXk/OiBFZGl0aW9uS2V5XG4gIHNhdmVkUGxhY2U/OiBTYXZlZFJlYWRlclBsYWNlSW5wdXRcbiAgLyoqIEJlZ2luIHRoZSBmaXJzdCByZW5kZXJlZCBwYWdlIGV4YWN0bHkgYXQgc2F2ZWRQbGFjZSAoc2hhcmUtbGluayBzdGFydHMgb25seSkuICovXG4gIHN0YXJ0QXRTYXZlZFBsYWNlPzogYm9vbGVhblxuICAvKiogTGlicmFyeSBDb250aW51ZSByZXNvbHZlcyB0aGUgbGF0ZXN0IHBvc2l0aW9uLCB1bmxpa2UgZXhwbGljaXQgcGFzc2FnZSBsaW5rcy4gKi9cbiAgcmVzdW1lTGF0ZXN0PzogYm9vbGVhblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlYWRlckhhbmRvZmZJbnRlbnQge1xuICBraW5kOiAnb3Blbi1yZWFkZXInXG4gIGJvb2tJZDogc3RyaW5nXG4gIHByaW1hcnlFZGl0aW9uS2V5OiBFZGl0aW9uS2V5XG4gIGNvbXBhcmVFZGl0aW9uS2V5PzogRWRpdGlvbktleVxuICAvKipcbiAgICogVGhlIENvbXBhcmUgZWRpdGlvbiAob3IgaXRzIGFic2VuY2UpIGlzIHRoZSByZWFkZXIncyBvd24gZXhwbGljaXQgcGljayxcbiAgICogZS5nLiBcIk5vbmVcIiBpbiB0aGUgbGlicmFyeSBpbnRyb2R1Y3Rpb24uIFdpdGhvdXQgaXQsIENvbXBhcmUgaXMgYSBkZWZhdWx0LlxuICAgKi9cbiAgY29tcGFyZUNob3Nlbj86IGJvb2xlYW5cbiAgYXVkaW9FZGl0aW9uS2V5PzogRWRpdGlvbktleVxuICBzYXZlZFBsYWNlPzogU2F2ZWRSZWFkZXJQbGFjZUlucHV0XG4gIC8qKiBPbmUtdXNlIGRvY3VtZW50IGhhbmRvZmYgZmxhZzsgbmV2ZXIgc3RvcmVkIGFzIHRoZSB1c2VyJ3MgcmVhZGluZyBwb3NpdGlvbi4gKi9cbiAgc3RhcnRBdFNhdmVkUGxhY2U/OiBib29sZWFuXG4gIC8qKiBMaWJyYXJ5IENvbnRpbnVlIHJlc29sdmVzIHRoZSBsYXRlc3QgcG9zaXRpb24sIHVubGlrZSBleHBsaWNpdCBwYXNzYWdlIGxpbmtzLiAqL1xuICByZXN1bWVMYXRlc3Q/OiBib29sZWFuXG59XG5cbmZ1bmN0aW9uIGZpcnN0U2VudGVuY2UodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKC9eLio/Wy4hP10oPz1cXHN8JCkvKVxuICByZXR1cm4gKG1hdGNoID8gbWF0Y2hbMF0gOiB0ZXh0KS50cmltKClcbn1cblxuZnVuY3Rpb24gdW5pcXVlKHZhbHVlczogQXJyYXk8c3RyaW5nIHwgdW5kZWZpbmVkPik6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIFsuLi5uZXcgU2V0KHZhbHVlcy5maWx0ZXIoKHZhbHVlKTogdmFsdWUgaXMgc3RyaW5nID0+IEJvb2xlYW4odmFsdWU/LnRyaW0oKSkpKV1cbn1cblxuZnVuY3Rpb24gcHJvdmVuYW5jZUZvcihlZGl0aW9uOiBFZGl0aW9uLCBib29rSWQ6IHN0cmluZyk6IFBpY2s8UHJlUmVhZGVyRWRpdGlvblZpZXdNb2RlbCwgJ2dyb3VwJyB8ICdwcm92ZW5hbmNlJyB8ICdwcm92ZW5hbmNlTGFiZWwnPiB7XG4gIC8vIEluLWNvcHlyaWdodCBib29rcyBwdWJsaXNoZWQgYnkgcGVybWlzc2lvbiBhcmUgbmV2ZXIgY2FsbGVkIHB1YmxpYyBkb21haW4uXG4gIGNvbnN0IHBlcm1pc3Npb24gPSBwdWJsaXNoZXJQZXJtaXNzaW9uKGJvb2tJZClcbiAgaWYgKHBlcm1pc3Npb24gJiYgZWRpdGlvbi5zdHlsZSA9PT0gJ29yaWdpbmFsJykge1xuICAgIHJldHVybiB7IGdyb3VwOiAnaHVtYW4nLCBwcm92ZW5hbmNlOiAncHVibGlzaGVkLWVkaXRpb24nLCBwcm92ZW5hbmNlTGFiZWw6IGBQdWJsaXNoZWQgYnkgJHtwZXJtaXNzaW9uLnB1Ymxpc2hlcn0sIHdpdGggcGVybWlzc2lvbmAgfVxuICB9XG4gIGlmIChlZGl0aW9uLnN0eWxlID09PSAnbW9kZXJuJykge1xuICAgIHJldHVybiB7IGdyb3VwOiAnbW9kZXJuJywgcHJvdmVuYW5jZTogJ3RpbmN0LWFpLWFkYXB0YXRpb24nLCBwcm92ZW5hbmNlTGFiZWw6ICdUaW5jdCBBSSBhZGFwdGF0aW9uJyB9XG4gIH1cbiAgaWYgKGVkaXRpb24udHJhbnNsYXRvcikge1xuICAgIHJldHVybiB7XG4gICAgICBncm91cDogJ2h1bWFuJyxcbiAgICAgIHByb3ZlbmFuY2U6ICdodW1hbi10cmFuc2xhdGlvbicsXG4gICAgICBwcm92ZW5hbmNlTGFiZWw6IGBIdW1hbiB0cmFuc2xhdGlvbiBieSAke2VkaXRpb24udHJhbnNsYXRvcn1gLFxuICAgIH1cbiAgfVxuICBpZiAoZWRpdGlvbi5zdHlsZSA9PT0gJ29yaWdpbmFsJykge1xuICAgIHJldHVybiB7IGdyb3VwOiAnaHVtYW4nLCBwcm92ZW5hbmNlOiAnYXV0aG9yaWFsLW9yaWdpbmFsJywgcHJvdmVuYW5jZUxhYmVsOiAnT3JpZ2luYWwgcHVibGljLWRvbWFpbiB0ZXh0JyB9XG4gIH1cbiAgcmV0dXJuIHsgZ3JvdXA6ICdodW1hbicsIHByb3ZlbmFuY2U6ICdwdWJsaXNoZWQtZWRpdGlvbicsIHByb3ZlbmFuY2VMYWJlbDogJ1B1Ymxpc2hlZCBwdWJsaWMtZG9tYWluIGVkaXRpb24nIH1cbn1cblxuZnVuY3Rpb24gZWRpdGlvblZpZXdNb2RlbHMoZWRpdGlvbnM6IEVkaXRpb25bXSwgYm9va0lkOiBzdHJpbmcpOiBQcmVSZWFkZXJFZGl0aW9uVmlld01vZGVsW10ge1xuICBjb25zdCBjb21wYXJhYmxlS2V5cyA9IG5ldyBTZXQoXG4gICAgZWRpdGlvbnMuZmlsdGVyKGVkaXRpb24gPT4gZWRpdGlvbi5hbGlnbmVkKS5tYXAoZWRpdGlvbiA9PiBlZGl0aW9uLmtleSksXG4gIClcbiAgcmV0dXJuIGVkaXRpb25zLm1hcChlZGl0aW9uID0+ICh7XG4gICAga2V5OiBlZGl0aW9uLmtleSxcbiAgICBsYW5ndWFnZTogZWRpdGlvbi5sYW5ndWFnZSxcbiAgICBzdHlsZTogZWRpdGlvbi5zdHlsZSxcbiAgICBsYWJlbDogZWRpdGlvbi5sYWJlbCxcbiAgICB0cmFuc2xhdG9yOiBlZGl0aW9uLnRyYW5zbGF0b3IgfHwgbnVsbCxcbiAgICB5ZWFyOiBlZGl0aW9uLnllYXIgPz8gbnVsbCxcbiAgICBhbGlnbmVkOiBlZGl0aW9uLmFsaWduZWQsXG4gICAgLi4ucHJvdmVuYW5jZUZvcihlZGl0aW9uLCBib29rSWQpLFxuICAgIGF2YWlsYWJpbGl0eToge1xuICAgICAgLy8gQk9PS1MgaXMgdGhlIHB1YmxpY2F0aW9uIGJvdW5kYXJ5LiBUaGUgZXhoYXVzdGl2ZSBhc3NldCB0ZXN0IGVuZm9yY2VzXG4gICAgICAvLyB0aGF0IGV2ZXJ5IHJlZ2lzdGVyZWQgZWRpdGlvbiBoYXMgcmVuZGVyYWJsZSBjaGFwdGVyIGNvbnRlbnQuXG4gICAgICBjaGFwdGVyVGV4dDogdHJ1ZSxcbiAgICAgIGF1ZGlvOiBlZGl0aW9uLmhhc0F1ZGlvID09PSB0cnVlLFxuICAgICAgY29tcGFyZTogZWRpdGlvbi5hbGlnbmVkICYmIGNvbXBhcmFibGVLZXlzLnNpemUgPiAxLFxuICAgIH0sXG4gIH0pKVxufVxuXG5mdW5jdGlvbiBib29rVmlld01vZGVsKGJvb2s6IEJvb2ssIGNhdGFsb2d1ZUluZGV4OiBudW1iZXIpOiBQcmVSZWFkZXJCb29rVmlld01vZGVsIHtcbiAgY29uc3QgbWV0YSA9IExJQlJBUllfQk9PS19NRVRBX0JZX0lEW2Jvb2suaWRdXG4gIGlmICghbWV0YSkgdGhyb3cgbmV3IEVycm9yKGBQdWJsaXNoZWQgYm9vayAke2Jvb2suaWR9IGlzIG1pc3NpbmcgbGlicmFyeSB0YXhvbm9teSBtZXRhZGF0YWApXG4gIGNvbnN0IGludmFsaWRTaGVsZiA9IG1ldGEuc2hlbHZlcy5maW5kKHNoZWxmSWQgPT4gIUxJQlJBUllfU0hFTFZFU1tzaGVsZklkXSlcbiAgaWYgKGludmFsaWRTaGVsZikgdGhyb3cgbmV3IEVycm9yKGBQdWJsaXNoZWQgYm9vayAke2Jvb2suaWR9IHJlZmVyZW5jZXMgdW5rbm93biBzaGVsZiAke2ludmFsaWRTaGVsZn1gKVxuICBjb25zdCBob3VzZUlkcyA9IExJQlJBUllfSE9VU0VTXG4gICAgLmZpbHRlcihob3VzZSA9PiBtZXRhLnNoZWx2ZXMuc29tZShzaGVsZklkID0+IGhvdXNlLnNoZWx2ZXMuaW5jbHVkZXMoc2hlbGZJZCkpKVxuICAgIC5tYXAoaG91c2UgPT4gaG91c2UuaWQpXG4gIGlmICghaG91c2VJZHMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoYFB1Ymxpc2hlZCBib29rICR7Ym9vay5pZH0gaXMgbm90IGNsYXNzaWZpZWQgaW50byBhIGxpYnJhcnkgaG91c2VgKVxuXG4gIC8vIEEgd2l0aGRyYXduIGVkaXRpb24gbGVhdmVzIHRoZSByZWdpc3RyeSwgYnV0IHRoZSBjYXRhbG9ndWUgaXMgYSBidWlsdFxuICAvLyBhcnRpZmFjdCBzZXJ2ZWQgdW5kZXIgYSBoYW5kLW1haW50YWluZWQgY2FjaGUtYnVzdGluZyB2ZXJzaW9uOiBhIHN0YWxlIGNvcHlcbiAgLy8gY2FuIGtlZXAgb2ZmZXJpbmcgYW4gZWRpdGlvbiB3aG9zZSB0ZXh0IGlzIGFscmVhZHkgNDA0LiBGaWx0ZXJpbmcgaGVyZVxuICAvLyBtZWFucyB0aGF0IGV2ZW4gYSBjYXRhbG9ndWUgYnVpbHQgd2hpbGUgdGhlIHJlZ2lzdHJ5IHN0aWxsIGxpc3RlZCBvbmUgd291bGRcbiAgLy8gbm90IHB1dCBpdCBpbiBmcm9udCBvZiBhIHJlYWRlci5cbiAgLy8gQSBib29rIGFscmVhZHkgaW4gbW9kZXJuIEVuZ2xpc2ggKG5vTW9kZXJuRWRpdGlvbikgbmV2ZXIgc2hvd3MgYSBtb2Rlcm4gZWRpdGlvbi5cbiAgY29uc3QgcHVibGlzaGVkRWRpdGlvbnMgPSBib29rLmVkaXRpb25zLmZpbHRlcihlZGl0aW9uID0+ICFpc0VkaXRpb25XaXRoaGVsZChib29rLmlkLCBlZGl0aW9uLmtleSlcbiAgICAmJiAhKGJvb2subm9Nb2Rlcm5FZGl0aW9uICYmIChlZGl0aW9uLnN0eWxlID09PSAnbW9kZXJuJyB8fCBlZGl0aW9uLmtleSA9PT0gJ21vZGVybi1lbicpKSlcbiAgY29uc3QgZWRpdGlvbnMgPSBlZGl0aW9uVmlld01vZGVscyhwdWJsaXNoZWRFZGl0aW9ucywgYm9vay5pZCkubWFwKGVkaXRpb24gPT4gKHsgLi4uZWRpdGlvbiwgZGlzY292ZXJ5QXZhaWxhYmxlOiBpc0VkaXRpb25EaXNjb3ZlcmFibGUoYm9vay5pZCwgZWRpdGlvbiksIGF1ZGlvSGVsZDogaXNBdWRpb0hlbGQoYm9vay5pZCwgZWRpdGlvbi5rZXkpIH0pKVxuICBjb25zdCBkaXNjb3ZlcmFibGUgPSBlZGl0aW9ucy5maWx0ZXIoZWRpdGlvbiA9PiBlZGl0aW9uLmRpc2NvdmVyeUF2YWlsYWJsZSlcbiAgY29uc3QgZGVmYXVsdEVkaXRpb25LZXkgPSBkZWZhdWx0UHJpbWFyeUVkaXRpb25LZXkoYm9vay5pZCwgZGlzY292ZXJhYmxlLmxlbmd0aCA/IGRpc2NvdmVyYWJsZSA6IGVkaXRpb25zKVxuICBjb25zdCBzdW1tYXJ5ID0gYm9vay5kZXNjcmlwdGlvbj8udHJpbSgpIHx8IG1ldGEuYmx1cmI/LnRyaW0oKSB8fCBgJHtib29rLnRpdGxlfSBieSAke2Jvb2suYXV0aG9yfS5gXG4gIGNvbnN0IGJsdXJiID0gbWV0YS5ibHVyYj8udHJpbSgpIHx8IGZpcnN0U2VudGVuY2Uoc3VtbWFyeSlcbiAgY29uc3QgY292ZXIgPSB7XG4gICAga2luZDogJ2dlbmVyYXRlZCcgYXMgY29uc3QsXG4gICAgYmFja2dyb3VuZDogYm9vay5jb3ZlckNvbG9yIHx8IEZBTExCQUNLX0NPVkVSX0JBQ0tHUk9VTkQsXG4gICAgYWNjZW50OiBib29rLmNvdmVyQWNjZW50IHx8IEZBTExCQUNLX0NPVkVSX0FDQ0VOVCxcbiAgfVxuICByZXR1cm4ge1xuICAgIGlkOiBib29rLmlkLFxuICAgIHRpdGxlOiBib29rLnRpdGxlLnRyaW0oKSxcbiAgICBhdXRob3I6IGJvb2suYXV0aG9yLnRyaW0oKSxcbiAgICAuLi4oYm9vay5hbHRUaXRsZXM/Lmxlbmd0aCA/IHsgYWx0VGl0bGVzOiBib29rLmFsdFRpdGxlcy5tYXAodGl0bGUgPT4gdGl0bGUudHJpbSgpKSB9IDoge30pLFxuICAgIHN1bW1hcnksXG4gICAgYmx1cmIsXG4gICAgZGlzcGxheVllYXI6IGdldEJvb2tEaXNwbGF5WWVhcihib29rLCBtZXRhKSxcbiAgICB3b3JkQ291bnQ6IGJvb2sud29yZENvdW50ID8/IG51bGwsXG4gICAgY292ZXIsXG4gICAgYXJ0OiBsYWJDb3ZlckFydChib29rLmlkKSxcbiAgICBzaGVsZklkczogWy4uLm1ldGEuc2hlbHZlc10sXG4gICAgaG91c2VJZHMsXG4gICAgdG9waWNzOiB1bmlxdWUoW1xuICAgICAgbWV0YS50cmFkaXRpb24sXG4gICAgICBtZXRhLmZvcm0sXG4gICAgICBtZXRhLmVyYSxcbiAgICAgIC4uLm1ldGEudGhlbWVzLFxuICAgICAgLi4ubWV0YS5zaGVsdmVzLmZsYXRNYXAoc2hlbGZJZCA9PiBbTElCUkFSWV9TSEVMVkVTW3NoZWxmSWRdLnRpdGxlLCBMSUJSQVJZX1NIRUxWRVNbc2hlbGZJZF0uc3ViXSksXG4gICAgICAuLi5ob3VzZUlkcy5mbGF0TWFwKGhvdXNlSWQgPT4ge1xuICAgICAgICBjb25zdCBob3VzZSA9IExJQlJBUllfSE9VU0VTLmZpbmQoY2FuZGlkYXRlID0+IGNhbmRpZGF0ZS5pZCA9PT0gaG91c2VJZClcbiAgICAgICAgcmV0dXJuIFtob3VzZT8udGl0bGUsIGhvdXNlPy5zdWJdXG4gICAgICB9KSxcbiAgICBdKSxcbiAgICBlZGl0aW9ucyxcbiAgICBkZWZhdWx0RWRpdGlvbktleTogZGVmYXVsdEVkaXRpb25LZXkgPz8gbnVsbCxcbiAgICBkZWZhdWx0Q29tcGFyZUVkaXRpb25LZXk6IGRlZmF1bHRDb21wYXJlRWRpdGlvbktleShib29rLmlkLCBkaXNjb3ZlcmFibGUuZmlsdGVyKGVkaXRpb24gPT4gZWRpdGlvbi5hdmFpbGFiaWxpdHkuY29tcGFyZSksIGRlZmF1bHRFZGl0aW9uS2V5LCBib29rLnllYXIpID8/IG51bGwsXG4gICAgYXZhaWxhYmlsaXR5OiB7XG4gICAgICBjb3ZlcjogdHJ1ZSxcbiAgICAgIGNoYXB0ZXJUZXh0OiBlZGl0aW9ucy5zb21lKGVkaXRpb24gPT4gZWRpdGlvbi5hdmFpbGFiaWxpdHkuY2hhcHRlclRleHQpLFxuICAgICAgYXVkaW86IGVkaXRpb25zLnNvbWUoZWRpdGlvbiA9PiBlZGl0aW9uLmF2YWlsYWJpbGl0eS5hdWRpbyksXG4gICAgICBjb21wYXJlOiBlZGl0aW9ucy5zb21lKGVkaXRpb24gPT4gZWRpdGlvbi5hdmFpbGFiaWxpdHkuY29tcGFyZSksXG4gICAgICAvLyBQdWJsaXNoZWQgYm9va3MgYXJlIHJlcXVpcmVkIHRvIGhhdmUgYW4gRW5nbGlzaCBvbmJvYXJkaW5nIGFzc2V0O1xuICAgICAgLy8gdGhlIGV4aGF1c3RpdmUgYXNzZXQgdGVzdCBiZWxvdyBndWFyZHMgdGhhdCBwdWJsaWNhdGlvbiBjb250cmFjdC5cbiAgICAgIG9wdGlvbmFsUHJlZmFjZTogdHJ1ZSxcbiAgICB9LFxuICAgIGRpc2NvdmVyeUF2YWlsYWJsZTogaXNCb29rRGlzY292ZXJhYmxlKGJvb2suaWQpLFxuICAgIHNlYXJjaEF2YWlsYWJsZTogaXNCb29rU2VhcmNoYWJsZShib29rLmlkKSxcbiAgICBjYXRhbG9ndWVJbmRleCxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQcmVSZWFkZXJDYXRhbG9ndWUoKTogUHJlUmVhZGVyQ2F0YWxvZ3VlIHtcbiAgY29uc3QgYm9va3MgPSBCT09LUy5tYXAoYm9va1ZpZXdNb2RlbClcbiAgY29uc3QgYm9va3NCeUlkID0gbmV3IE1hcChib29rcy5tYXAoYm9vayA9PiBbYm9vay5pZCwgYm9va10pKVxuICBjb25zdCBob3VzZXMgPSBMSUJSQVJZX0hPVVNFUy5tYXAoaG91c2UgPT4gKHtcbiAgICBpZDogaG91c2UuaWQsXG4gICAgdGl0bGU6IGhvdXNlLnRpdGxlLFxuICAgIHN1YnRpdGxlOiBob3VzZS5zdWIsXG4gICAgaHVlOiBob3VzZS5odWUsXG4gICAgc2hlbHZlczogaG91c2Uuc2hlbHZlcy5tYXAoc2hlbGZJZCA9PiB7XG4gICAgICBjb25zdCBzaGVsZiA9IExJQlJBUllfU0hFTFZFU1tzaGVsZklkXVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHNoZWxmSWQsXG4gICAgICAgIHRpdGxlOiBzaGVsZi50aXRsZSxcbiAgICAgICAgc3VidGl0bGU6IHNoZWxmLnN1YixcbiAgICAgICAgaHVlOiBzaGVsZi5odWUsXG4gICAgICAgIGJvb2tzOiBib29rcy5maWx0ZXIoYm9vayA9PiBib29rLmRpc2NvdmVyeUF2YWlsYWJsZSAhPT0gZmFsc2UgJiYgYm9vay5zaGVsZklkcy5pbmNsdWRlcyhzaGVsZklkKSksXG4gICAgICB9XG4gICAgfSkuZmlsdGVyKHNoZWxmID0+IHNoZWxmLmJvb2tzLmxlbmd0aCA+IDApLFxuICB9KSkuZmlsdGVyKGhvdXNlID0+IGhvdXNlLnNoZWx2ZXMubGVuZ3RoID4gMClcbiAgcmV0dXJuIHsgYm9va3MsIGJvb2tzQnlJZCwgaG91c2VzIH1cbn1cblxuZXhwb3J0IGNvbnN0IFBSRV9SRUFERVJfQ0FUQUxPR1VFID0gYnVpbGRQcmVSZWFkZXJDYXRhbG9ndWUoKVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplUHJlUmVhZGVyQ2F0YWxvZ3VlKFxuICBjYXRhbG9ndWU6IFByZVJlYWRlckNhdGFsb2d1ZSA9IFBSRV9SRUFERVJfQ0FUQUxPR1VFLFxuKTogU2VyaWFsaXphYmxlUHJlUmVhZGVyQ2F0YWxvZ3VlIHtcbiAgcmV0dXJuIHtcbiAgICBib29rczogY2F0YWxvZ3VlLmJvb2tzLFxuICAgIGhvdXNlczogY2F0YWxvZ3VlLmhvdXNlcy5tYXAoaG91c2UgPT4gKHtcbiAgICAgIGlkOiBob3VzZS5pZCxcbiAgICAgIHRpdGxlOiBob3VzZS50aXRsZSxcbiAgICAgIHN1YnRpdGxlOiBob3VzZS5zdWJ0aXRsZSxcbiAgICAgIGh1ZTogaG91c2UuaHVlLFxuICAgICAgc2hlbHZlczogaG91c2Uuc2hlbHZlcy5tYXAoc2hlbGYgPT4gKHtcbiAgICAgICAgaWQ6IHNoZWxmLmlkLFxuICAgICAgICB0aXRsZTogc2hlbGYudGl0bGUsXG4gICAgICAgIHN1YnRpdGxlOiBzaGVsZi5zdWJ0aXRsZSxcbiAgICAgICAgaHVlOiBzaGVsZi5odWUsXG4gICAgICAgIGJvb2tJZHM6IHNoZWxmLmJvb2tzLm1hcChib29rID0+IGJvb2suaWQpLFxuICAgICAgfSkpLFxuICAgIH0pKSxcbiAgICBwb3B1bGFyOiBMQUJfUE9QVUxBUl9CT09LX0lEUy5maWx0ZXIoaWQgPT4gY2F0YWxvZ3VlLmJvb2tzQnlJZC5oYXMoaWQpKSxcbiAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVkKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWUubm9ybWFsaXplKCdORktEJykucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgJycpLnRvTG93ZXJDYXNlKCkudHJpbSgpXG59XG5cbmZ1bmN0aW9uIHNlYXJjaFNjb3JlKGJvb2s6IFByZVJlYWRlckJvb2tWaWV3TW9kZWwsIHJhd1F1ZXJ5OiBzdHJpbmcpOiBudW1iZXIge1xuICBjb25zdCBxdWVyeSA9IG5vcm1hbGl6ZWQocmF3UXVlcnkpXG4gIGlmICghcXVlcnkpIHJldHVybiAxXG4gIGNvbnN0IHRpdGxlID0gbm9ybWFsaXplZChib29rLnRpdGxlKVxuICBjb25zdCBhdXRob3IgPSBub3JtYWxpemVkKGJvb2suYXV0aG9yKVxuICBjb25zdCB0b3BpY3MgPSBub3JtYWxpemVkKFtib29rLnN1bW1hcnksIC4uLmJvb2sudG9waWNzXS5qb2luKCcgJykpXG4gIGNvbnN0IHRva2VucyA9IHF1ZXJ5LnNwbGl0KC9cXHMrLykuZmlsdGVyKEJvb2xlYW4pXG4gIGxldCBzY29yZSA9IDBcbiAgaWYgKHRpdGxlID09PSBxdWVyeSkgc2NvcmUgKz0gMTBfMDAwXG4gIGVsc2UgaWYgKHRpdGxlLnN0YXJ0c1dpdGgocXVlcnkpKSBzY29yZSArPSA1XzAwMFxuICBlbHNlIGlmICh0aXRsZS5pbmNsdWRlcyhxdWVyeSkpIHNjb3JlICs9IDJfNTAwXG4gIGlmIChhdXRob3IgPT09IHF1ZXJ5KSBzY29yZSArPSA4XzAwMFxuICBlbHNlIGlmIChhdXRob3Iuc3RhcnRzV2l0aChxdWVyeSkpIHNjb3JlICs9IDRfMDAwXG4gIGVsc2UgaWYgKGF1dGhvci5pbmNsdWRlcyhxdWVyeSkpIHNjb3JlICs9IDJfMDAwXG4gIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgaWYgKHRpdGxlLnNwbGl0KC9cXHMrLykuaW5jbHVkZXModG9rZW4pKSBzY29yZSArPSA5MDBcbiAgICBlbHNlIGlmICh0aXRsZS5pbmNsdWRlcyh0b2tlbikpIHNjb3JlICs9IDUwMFxuICAgIGlmIChhdXRob3Iuc3BsaXQoL1xccysvKS5pbmNsdWRlcyh0b2tlbikpIHNjb3JlICs9IDcwMFxuICAgIGVsc2UgaWYgKGF1dGhvci5pbmNsdWRlcyh0b2tlbikpIHNjb3JlICs9IDM1MFxuICAgIGlmICh0b3BpY3MuaW5jbHVkZXModG9rZW4pKSBzY29yZSArPSAxMDBcbiAgfVxuICByZXR1cm4gdG9rZW5zLmV2ZXJ5KHRva2VuID0+IGAke3RpdGxlfSAke2F1dGhvcn0gJHt0b3BpY3N9YC5pbmNsdWRlcyh0b2tlbikpID8gc2NvcmUgOiAwXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hQcmVSZWFkZXJCb29rcyhcbiAgcXVlcnk6IHN0cmluZyxcbiAgY2F0YWxvZ3VlOiBQcmVSZWFkZXJDYXRhbG9ndWUgPSBQUkVfUkVBREVSX0NBVEFMT0dVRSxcbik6IFByZVJlYWRlckJvb2tWaWV3TW9kZWxbXSB7XG4gIGlmICghcXVlcnkudHJpbSgpKSByZXR1cm4gY2F0YWxvZ3VlLmJvb2tzLmZpbHRlcihib29rID0+IGJvb2suZGlzY292ZXJ5QXZhaWxhYmxlICE9PSBmYWxzZSlcbiAgcmV0dXJuIGNhdGFsb2d1ZS5ib29rcy5maWx0ZXIoYm9vayA9PiAoYm9vay5zZWFyY2hBdmFpbGFibGUgPz8gYm9vay5kaXNjb3ZlcnlBdmFpbGFibGUpICE9PSBmYWxzZSlcbiAgICAubWFwKGJvb2sgPT4gKHsgYm9vaywgc2NvcmU6IHNlYXJjaFNjb3JlKGJvb2ssIHF1ZXJ5KSB9KSlcbiAgICAuZmlsdGVyKHJlc3VsdCA9PiByZXN1bHQuc2NvcmUgPiAwKVxuICAgIC5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSB8fCBhLmJvb2suY2F0YWxvZ3VlSW5kZXggLSBiLmJvb2suY2F0YWxvZ3VlSW5kZXgpXG4gICAgLm1hcChyZXN1bHQgPT4gcmVzdWx0LmJvb2spXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb29rRGV0YWlsVmlld01vZGVsKFxuICBib29rSWQ6IHN0cmluZyxcbiAgY2F0YWxvZ3VlOiBQcmVSZWFkZXJDYXRhbG9ndWUgPSBQUkVfUkVBREVSX0NBVEFMT0dVRSxcbik6IEJvb2tEZXRhaWxWaWV3TW9kZWwgfCBudWxsIHtcbiAgY29uc3QgYm9vayA9IGNhdGFsb2d1ZS5ib29rc0J5SWQuZ2V0KGJvb2tJZClcbiAgaWYgKCFib29rKSByZXR1cm4gbnVsbFxuICByZXR1cm4ge1xuICAgIGJvb2ssXG4gICAgZmFjdHM6IHtcbiAgICAgIGRpc3BsYXlZZWFyOiBib29rLmRpc3BsYXlZZWFyIHx8IG51bGwsXG4gICAgICB3b3JkQ291bnQ6IGJvb2sud29yZENvdW50LFxuICAgICAgZWRpdGlvbkNvdW50OiBib29rLmVkaXRpb25zLmxlbmd0aCxcbiAgICAgIGxhbmd1YWdlczogWy4uLm5ldyBTZXQoYm9vay5lZGl0aW9ucy5tYXAoZWRpdGlvbiA9PiBlZGl0aW9uLmxhbmd1YWdlKSldLFxuICAgIH0sXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmYXVsdEVkaXRpb24oYm9vazogUHJlUmVhZGVyQm9va1ZpZXdNb2RlbCk6IFByZVJlYWRlckVkaXRpb25WaWV3TW9kZWwgfCB1bmRlZmluZWQge1xuICByZXR1cm4gYm9vay5lZGl0aW9ucy5maW5kKGVkaXRpb24gPT4gZWRpdGlvbi5rZXkgPT09IGJvb2suZGVmYXVsdEVkaXRpb25LZXkpIHx8IGJvb2suZWRpdGlvbnNbMF1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVkaXRpb25TZWxlY3Rpb25WaWV3TW9kZWwoXG4gIGJvb2tJZDogc3RyaW5nLFxuICBzZWxlY3RlZEVkaXRpb25LZXk/OiBFZGl0aW9uS2V5LFxuICBjYXRhbG9ndWU6IFByZVJlYWRlckNhdGFsb2d1ZSA9IFBSRV9SRUFERVJfQ0FUQUxPR1VFLFxuKTogRWRpdGlvblNlbGVjdGlvblZpZXdNb2RlbCB8IG51bGwge1xuICBjb25zdCBib29rID0gY2F0YWxvZ3VlLmJvb2tzQnlJZC5nZXQoYm9va0lkKVxuICBpZiAoIWJvb2spIHJldHVybiBudWxsXG4gIGNvbnN0IGF2YWlsYWJsZSA9IGJvb2suZWRpdGlvbnMuZmlsdGVyKGVkaXRpb24gPT4gIWVkaXRpb25Ib2xkKGJvb2tJZCwgZWRpdGlvbi5rZXkpKVxuICBjb25zdCBzZWxlY3RlZCA9IGF2YWlsYWJsZS5maW5kKGVkaXRpb24gPT4gZWRpdGlvbi5rZXkgPT09IHNlbGVjdGVkRWRpdGlvbktleSkgfHwgYXZhaWxhYmxlLmZpbmQoZWRpdGlvbiA9PiBlZGl0aW9uLmtleSA9PT0gYm9vay5kZWZhdWx0RWRpdGlvbktleSkgfHwgYXZhaWxhYmxlWzBdXG4gIGlmICghc2VsZWN0ZWQpIHJldHVybiBudWxsXG4gIHJldHVybiB7XG4gICAgYm9va0lkOiBib29rLmlkLFxuICAgIHRpdGxlOiBib29rLnRpdGxlLFxuICAgIHNlbGVjdGVkRWRpdGlvbktleTogc2VsZWN0ZWQua2V5LFxuICAgIGh1bWFuRWRpdGlvbnM6IGF2YWlsYWJsZS5maWx0ZXIoZWRpdGlvbiA9PiBlZGl0aW9uLmdyb3VwID09PSAnaHVtYW4nKSxcbiAgICBtb2Rlcm5FZGl0aW9uczogYXZhaWxhYmxlLmZpbHRlcihlZGl0aW9uID0+IGVkaXRpb24uZ3JvdXAgPT09ICdtb2Rlcm4nKSxcbiAgICBjb21wYXJlT3B0aW9uczogc2VsZWN0ZWQuYWxpZ25lZFxuICAgICAgPyBhdmFpbGFibGUuZmlsdGVyKGVkaXRpb24gPT4gZWRpdGlvbi5rZXkgIT09IHNlbGVjdGVkLmtleSAmJiBlZGl0aW9uLmF2YWlsYWJpbGl0eS5jb21wYXJlKVxuICAgICAgOiBbXSxcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZFBsYWNlKHBsYWNlOiBTYXZlZFJlYWRlclBsYWNlSW5wdXQgfCB1bmRlZmluZWQsIGJvb2tJZDogc3RyaW5nKTogcGxhY2UgaXMgU2F2ZWRSZWFkZXJQbGFjZUlucHV0IHtcbiAgcmV0dXJuIEJvb2xlYW4oXG4gICAgcGxhY2VcbiAgICAmJiBwbGFjZS5ib29rSWQgPT09IGJvb2tJZFxuICAgICYmIE51bWJlci5pc0ludGVnZXIocGxhY2UuY2hhcHRlck51bWJlcilcbiAgICAmJiBwbGFjZS5jaGFwdGVyTnVtYmVyID49IDFcbiAgICAmJiAocGxhY2UucGFnZSA9PT0gdW5kZWZpbmVkIHx8IChOdW1iZXIuaXNJbnRlZ2VyKHBsYWNlLnBhZ2UpICYmIHBsYWNlLnBhZ2UgPj0gMCkpXG4gICAgJiYgKHBsYWNlLnBhcmFncmFwaEluZGV4ID09PSB1bmRlZmluZWQgfHwgKE51bWJlci5pc0ludGVnZXIocGxhY2UucGFyYWdyYXBoSW5kZXgpICYmIHBsYWNlLnBhcmFncmFwaEluZGV4ID49IDApKVxuICAgICYmIChwbGFjZS53b3JkSW5kZXggPT09IHVuZGVmaW5lZCB8fCAoTnVtYmVyLmlzSW50ZWdlcihwbGFjZS53b3JkSW5kZXgpICYmIHBsYWNlLndvcmRJbmRleCA+PSAwKSksXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlYWRlckhhbmRvZmZJbnRlbnQoXG4gIHNlbGVjdGlvbjogUmVhZGVySGFuZG9mZlNlbGVjdGlvbixcbiAgY2F0YWxvZ3VlOiBQcmVSZWFkZXJDYXRhbG9ndWUgPSBQUkVfUkVBREVSX0NBVEFMT0dVRSxcbik6IFJlYWRlckhhbmRvZmZJbnRlbnQgfCBudWxsIHtcbiAgY29uc3QgYm9vayA9IGNhdGFsb2d1ZS5ib29rc0J5SWQuZ2V0KHNlbGVjdGlvbi5ib29rSWQpXG4gIGNvbnN0IHByaW1hcnkgPSBib29rPy5lZGl0aW9ucy5maW5kKGVkaXRpb24gPT4gZWRpdGlvbi5rZXkgPT09IHNlbGVjdGlvbi5wcmltYXJ5RWRpdGlvbktleSlcbiAgaWYgKCFib29rIHx8ICFwcmltYXJ5Py5hdmFpbGFiaWxpdHkuY2hhcHRlclRleHQpIHJldHVybiBudWxsXG5cbiAgY29uc3QgaW50ZW50OiBSZWFkZXJIYW5kb2ZmSW50ZW50ID0ge1xuICAgIGtpbmQ6ICdvcGVuLXJlYWRlcicsXG4gICAgYm9va0lkOiBib29rLmlkLFxuICAgIHByaW1hcnlFZGl0aW9uS2V5OiBwcmltYXJ5LmtleSxcbiAgfVxuICBpZiAoc2VsZWN0aW9uLmNvbXBhcmVFZGl0aW9uS2V5KSB7XG4gICAgY29uc3QgY29tcGFyZSA9IGJvb2suZWRpdGlvbnMuZmluZChlZGl0aW9uID0+IGVkaXRpb24ua2V5ID09PSBzZWxlY3Rpb24uY29tcGFyZUVkaXRpb25LZXkpXG4gICAgaWYgKCFwcmltYXJ5LmFsaWduZWQgfHwgIWNvbXBhcmUgfHwgY29tcGFyZS5rZXkgPT09IHByaW1hcnkua2V5IHx8ICFjb21wYXJlLmF2YWlsYWJpbGl0eS5jb21wYXJlKSByZXR1cm4gbnVsbFxuICAgIGludGVudC5jb21wYXJlRWRpdGlvbktleSA9IGNvbXBhcmUua2V5XG4gIH1cbiAgaWYgKHNlbGVjdGlvbi5jb21wYXJlQ2hvc2VuID09PSB0cnVlKSBpbnRlbnQuY29tcGFyZUNob3NlbiA9IHRydWVcbiAgaWYgKHNlbGVjdGlvbi5hdWRpb0VkaXRpb25LZXkpIHtcbiAgICBjb25zdCBhdWRpbyA9IGJvb2suZWRpdGlvbnMuZmluZChlZGl0aW9uID0+IGVkaXRpb24ua2V5ID09PSBzZWxlY3Rpb24uYXVkaW9FZGl0aW9uS2V5KVxuICAgIGlmICghYXVkaW8/LmF2YWlsYWJpbGl0eS5hdWRpbykgcmV0dXJuIG51bGxcbiAgICBpbnRlbnQuYXVkaW9FZGl0aW9uS2V5ID0gYXVkaW8ua2V5XG4gIH1cbiAgaWYgKHNlbGVjdGlvbi5zYXZlZFBsYWNlKSB7XG4gICAgaWYgKCF2YWxpZFBsYWNlKHNlbGVjdGlvbi5zYXZlZFBsYWNlLCBib29rLmlkKSkgcmV0dXJuIG51bGxcbiAgICBpbnRlbnQuc2F2ZWRQbGFjZSA9IHsgLi4uc2VsZWN0aW9uLnNhdmVkUGxhY2UgfVxuICAgIGlmIChzZWxlY3Rpb24uc3RhcnRBdFNhdmVkUGxhY2UgPT09IHRydWUpIGludGVudC5zdGFydEF0U2F2ZWRQbGFjZSA9IHRydWVcbiAgICBlbHNlIGlmIChzZWxlY3Rpb24ucmVzdW1lTGF0ZXN0ID09PSB0cnVlKSBpbnRlbnQucmVzdW1lTGF0ZXN0ID0gdHJ1ZVxuICB9XG4gIHJldHVybiBpbnRlbnRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmV0dXJuaW5nUmVhZGVyVmlld01vZGVsKFxuICBwcm9ncmVzczogU2F2ZWRQcm9ncmVzc0lucHV0W10sXG4gIGhpc3Rvcnk6IFJlYWRpbmdIaXN0b3J5SW5wdXRbXSxcbiAgY2F0YWxvZ3VlOiBQcmVSZWFkZXJDYXRhbG9ndWUgPSBQUkVfUkVBREVSX0NBVEFMT0dVRSxcbik6IFJldHVybmluZ1JlYWRlclZpZXdNb2RlbFtdIHtcbiAgY29uc3QgaGlzdG9yeUJ5Qm9vayA9IG5ldyBNYXAoaGlzdG9yeS5tYXAoZW50cnkgPT4gW2VudHJ5LmJvb2tJZCwgZW50cnldKSlcbiAgcmV0dXJuIHByb2dyZXNzLmZsYXRNYXAoZW50cnkgPT4ge1xuICAgIGNvbnN0IGJvb2sgPSBjYXRhbG9ndWUuYm9va3NCeUlkLmdldChlbnRyeS5ib29rSWQpXG4gICAgaWYgKCFib29rIHx8ICF2YWxpZFBsYWNlKGVudHJ5LCBlbnRyeS5ib29rSWQpKSByZXR1cm4gW11cbiAgICBjb25zdCBlZGl0aW9uID0gYm9vay5lZGl0aW9ucy5maW5kKGNhbmRpZGF0ZSA9PiBjYW5kaWRhdGUua2V5ID09PSBlbnRyeS5lZGl0aW9uS2V5KSB8fCBkZWZhdWx0RWRpdGlvbihib29rKVxuICAgIGlmICghZWRpdGlvbikgcmV0dXJuIFtdXG4gICAgY29uc3Qgc2F2ZWRQbGFjZSA9IHtcbiAgICAgIGJvb2tJZDogYm9vay5pZCxcbiAgICAgIGNoYXB0ZXJOdW1iZXI6IGVudHJ5LmNoYXB0ZXJOdW1iZXIsXG4gICAgICAuLi4oZW50cnkucGFnZSA9PT0gdW5kZWZpbmVkID8ge30gOiB7IHBhZ2U6IGVudHJ5LnBhZ2UgfSksXG4gICAgICAuLi4oZW50cnkucGFyYWdyYXBoSW5kZXggPT09IHVuZGVmaW5lZCA/IHt9IDogeyBwYXJhZ3JhcGhJbmRleDogZW50cnkucGFyYWdyYXBoSW5kZXggfSksXG4gICAgICAuLi4oZW50cnkud29yZEluZGV4ID09PSB1bmRlZmluZWQgPyB7fSA6IHsgd29yZEluZGV4OiBlbnRyeS53b3JkSW5kZXggfSksXG4gICAgICAuLi4oZW50cnkuY29udGVudFJldmlzaW9uID09PSB1bmRlZmluZWQgPyB7fSA6IHsgY29udGVudFJldmlzaW9uOiBlbnRyeS5jb250ZW50UmV2aXNpb24gfSksXG4gICAgICAuLi4oZW50cnkuY29udGVudFJlY292ZXJ5ID09PSB1bmRlZmluZWQgPyB7fSA6IHsgY29udGVudFJlY292ZXJ5OiBlbnRyeS5jb250ZW50UmVjb3ZlcnkgfSksXG4gICAgfVxuICAgIGNvbnN0IGhhbmRvZmYgPSBjcmVhdGVSZWFkZXJIYW5kb2ZmSW50ZW50KHtcbiAgICAgIGJvb2tJZDogYm9vay5pZCxcbiAgICAgIHByaW1hcnlFZGl0aW9uS2V5OiBlZGl0aW9uLmtleSxcbiAgICAgIHNhdmVkUGxhY2UsXG4gICAgfSwgY2F0YWxvZ3VlKVxuICAgIGlmICghaGFuZG9mZikgcmV0dXJuIFtdXG4gICAgY29uc3QgaGlzdG9yeUVudHJ5ID0gaGlzdG9yeUJ5Qm9vay5nZXQoYm9vay5pZClcbiAgICByZXR1cm4gW3tcbiAgICAgIGJvb2ssXG4gICAgICBlZGl0aW9uS2V5OiBlZGl0aW9uLmtleSxcbiAgICAgIHBlcmNlbnQ6IGVudHJ5LnBlcmNlbnQgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIGVudHJ5LnBlcmNlbnQpKSxcbiAgICAgIGxhc3RSZWFkQXQ6IGVudHJ5LnVwZGF0ZWRBdCA/PyBoaXN0b3J5RW50cnk/Lmxhc3RSZWFkQXQgPz8gbnVsbCxcbiAgICAgIGhpc3RvcnlTdW1tYXJ5OiBoaXN0b3J5RW50cnk/LnN1bW1hcnk/LnRyaW0oKSB8fCBudWxsLFxuICAgICAgc2F2ZWRQbGFjZSxcbiAgICAgIGhhbmRvZmYsXG4gICAgfV1cbiAgfSkuc29ydCgoYSwgYikgPT4gKGIubGFzdFJlYWRBdCA/PyAwKSAtIChhLmxhc3RSZWFkQXQgPz8gMCkpXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9wcmVSZWFkZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9wcmVSZWFkZXIvbGlicmFyeVJlYWRpbmdTdHJ1Y3R1cmUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL3ByZVJlYWRlci9saWJyYXJ5UmVhZGluZ1N0cnVjdHVyZS50c1wiO2ltcG9ydCB7IGlzQm9va1RlbXBvcmFyaWx5SGVsZCwgaXNFZGl0aW9uTGFuZ3VhZ2VPZmZlcmVkIH0gZnJvbSAnLi4vZGF0YS9lZGl0aW9uQXZhaWxhYmlsaXR5J1xuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnXG5pbXBvcnQgdHlwZSB7IFNlcmlhbGl6YWJsZVByZVJlYWRlckNhdGFsb2d1ZSB9IGZyb20gJy4vY2F0YWxvZ3VlJ1xuaW1wb3J0IHsgZGVmYXVsdFByaW1hcnlFZGl0aW9uS2V5IH0gZnJvbSAnLi4vZGF0YS9lZGl0aW9uRGVmYXVsdHMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlicmFyeVJlYWRpbmdDaGFwdGVyIHtcbiAgbnVtYmVyOiBudW1iZXJcbiAgdGl0bGU6IHN0cmluZ1xuICBwYXJhZ3JhcGhDb3VudDogbnVtYmVyXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlicmFyeVJlYWRpbmdTdHJ1Y3R1cmUge1xuICBlZGl0aW9uS2V5OiBzdHJpbmdcbiAgdG90YWxQYXJhZ3JhcGhzOiBudW1iZXJcbiAgY2hhcHRlcnM6IExpYnJhcnlSZWFkaW5nQ2hhcHRlcltdXG59XG5cbnR5cGUgU2VyaWFsaXplZEJvb2sgPSBTZXJpYWxpemFibGVQcmVSZWFkZXJDYXRhbG9ndWVbJ2Jvb2tzJ11bbnVtYmVyXVxudHlwZSBTZXJpYWxpemVkRWRpdGlvbiA9IFNlcmlhbGl6ZWRCb29rWydlZGl0aW9ucyddW251bWJlcl1cblxuLyoqXG4gKiBBbiBlZGl0aW9uIGFzIHRoZSBicm93c2VyIHNlZXMgaXQsIHBsdXMgdGhlIG9uZSB0aGluZyBvbmx5IHRoZSBidWlsZCBrbm93czpcbiAqIHdoZXRoZXIgdGhpcyBlZGl0aW9uIGlzIHB1Ymxpc2hlZCBhcyBjaGFwdGVyIHNoYXJkc1xuICogKGAvZGF0YS9lZGl0aW9ucy1jaGFwdGVycy97Ym9va0lkfS17ZWRpdGlvbktleX0vYCkgb3IgYXMgb25lIHdob2xlLWJvb2tcbiAqIEpTT04uIFdpdGhvdXQgdGhlIGZsYWcgdGhlIHJ1bnRpbWUgaGFkIHRvICpwcm9iZSogZm9yIHRoZSBtYW5pZmVzdCBhbmQgdGFrZVxuICogdGhlIDQwNCBhcyBpdHMgYW5zd2VyLCB3aGljaCBtZWFudCBldmVyeSBsaWJyYXJ5IGFuZCBib29rLXBhZ2UgbG9hZCBmaXJlZCBhXG4gKiBoYW5kZnVsIG9mIDQwNHMgYXQgdGhlIHJlYWRlcidzIGNvbnNvbGUgZm9yIHRoZSBib29rcyB0aGF0IGFyZSBub3Qgc2hhcmRlZFxuICogKG9keXNzZXksIHRoZS1yZXB1YmxpYywgcHJpZGUtYW5kLXByZWp1ZGljZVx1MjAyNikuIFRoZSBidWlsZCBhbHJlYWR5IHJlYWRzXG4gKiB0aGVzZSBtYW5pZmVzdHMgdG8gcHVibGlzaCB0aGUgcmVhZGluZyBzdHJ1Y3R1cmUsIHNvIGl0IGNhbiBzaW1wbHkgc2F5LlxuICovXG5leHBvcnQgdHlwZSBMaWJyYXJ5RWRpdGlvbldpdGhTaGFyZHMgPSBTZXJpYWxpemVkRWRpdGlvbiAmIHsgY2hhcHRlclNoYXJkczogYm9vbGVhbjsgd29yZENvdW50OiBudW1iZXIgfCBudWxsOyByZWFkaW5nU3RydWN0dXJlOiBMaWJyYXJ5UmVhZGluZ1N0cnVjdHVyZSB8IG51bGwgfVxuXG5leHBvcnQgdHlwZSBMaWJyYXJ5Q2F0YWxvZ3VlV2l0aFN0cnVjdHVyZSA9IFNlcmlhbGl6YWJsZVByZVJlYWRlckNhdGFsb2d1ZSAmIHtcbiAgYm9va3M6IEFycmF5PE9taXQ8U2VyaWFsaXplZEJvb2ssICdlZGl0aW9ucyc+ICYge1xuICAgIGVkaXRpb25zOiBMaWJyYXJ5RWRpdGlvbldpdGhTaGFyZHNbXVxuICAgIHJlYWRpbmdTdHJ1Y3R1cmU6IExpYnJhcnlSZWFkaW5nU3RydWN0dXJlXG4gIH0+XG59XG5cbnR5cGUgQ2hhcHRlckxpa2UgPSB7IG51bWJlcj86IHVua25vd247IHRpdGxlPzogdW5rbm93bjsgcGFyYWdyYXBoQ291bnQ/OiB1bmtub3duOyBwYXJhZ3JhcGhzPzogdW5rbm93biB9XG5cbmZ1bmN0aW9uIHZpc2libGVSZWFkaW5nRWRpdGlvbihib29rOiBTZXJpYWxpemFibGVQcmVSZWFkZXJDYXRhbG9ndWVbJ2Jvb2tzJ11bbnVtYmVyXSkge1xuICBjb25zdCB2aXNpYmxlID0gYm9vay5lZGl0aW9ucy5maWx0ZXIoZWRpdGlvbiA9PiBpc0VkaXRpb25MYW5ndWFnZU9mZmVyZWQoYm9vay5pZCwgZWRpdGlvbikgJiYgZWRpdGlvbi5hdmFpbGFiaWxpdHkuY2hhcHRlclRleHQpXG4gIGNvbnN0IGtleSA9IGRlZmF1bHRQcmltYXJ5RWRpdGlvbktleShib29rLmlkLCB2aXNpYmxlKVxuICAvLyBBIGhlbGQgYm9vayByZXRhaW5zIGl0cyBzdHJ1Y3R1cmUgZm9yIHNhdmVkLXJlYWRlciByZWNvdmVyeSwgbm90IHNlbGVjdGlvbi5cbiAgcmV0dXJuIHZpc2libGUuZmluZChlZGl0aW9uID0+IGVkaXRpb24ua2V5ID09PSBrZXkpIHx8IChpc0Jvb2tUZW1wb3JhcmlseUhlbGQoYm9vay5pZCkgPyB2aXNpYmxlLmZpbmQoZWRpdGlvbiA9PiBlZGl0aW9uLmtleSA9PT0gJ29yaWdpbmFsLWVuJykgOiB1bmRlZmluZWQpXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNoYXB0ZXJzKGNoYXB0ZXJzOiBDaGFwdGVyTGlrZVtdKTogTGlicmFyeVJlYWRpbmdDaGFwdGVyW10ge1xuICByZXR1cm4gY2hhcHRlcnMubWFwKChjaGFwdGVyLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IHBhcmFncmFwaENvdW50ID0gTnVtYmVyLmlzSW50ZWdlcihjaGFwdGVyLnBhcmFncmFwaENvdW50KSAmJiBOdW1iZXIoY2hhcHRlci5wYXJhZ3JhcGhDb3VudCkgPiAwXG4gICAgICA/IE51bWJlcihjaGFwdGVyLnBhcmFncmFwaENvdW50KVxuICAgICAgOiBBcnJheS5pc0FycmF5KGNoYXB0ZXIucGFyYWdyYXBocykgJiYgY2hhcHRlci5wYXJhZ3JhcGhzLmxlbmd0aCA+IDBcbiAgICAgICAgPyBjaGFwdGVyLnBhcmFncmFwaHMubGVuZ3RoXG4gICAgICAgIDogMVxuICAgIHJldHVybiB7XG4gICAgICBudW1iZXI6IE51bWJlci5pc0ludGVnZXIoY2hhcHRlci5udW1iZXIpICYmIE51bWJlcihjaGFwdGVyLm51bWJlcikgPiAwID8gTnVtYmVyKGNoYXB0ZXIubnVtYmVyKSA6IGluZGV4ICsgMSxcbiAgICAgIHRpdGxlOiB0eXBlb2YgY2hhcHRlci50aXRsZSA9PT0gJ3N0cmluZycgJiYgY2hhcHRlci50aXRsZS50cmltKCkgPyBjaGFwdGVyLnRpdGxlLnRyaW0oKSA6IGBDaGFwdGVyICR7aW5kZXggKyAxfWAsXG4gICAgICBwYXJhZ3JhcGhDb3VudCxcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIG1hbmlmZXN0UGF0aEZvcihwdWJsaWNEaXJlY3Rvcnk6IHN0cmluZywgYm9va0lkOiBzdHJpbmcsIGVkaXRpb25LZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLmpvaW4ocHVibGljRGlyZWN0b3J5LCAnZGF0YScsICdlZGl0aW9ucy1jaGFwdGVycycsIGAke2Jvb2tJZH0tJHtlZGl0aW9uS2V5fWAsICdtYW5pZmVzdC5qc29uJylcbn1cblxuLyoqIFRydWUgd2hlbiB0aGlzIGVkaXRpb24gc2hpcHMgYXMgY2hhcHRlciBzaGFyZHMgd2l0aCBhIG1hbmlmZXN0IGJlc2lkZSB0aGVtLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc0NoYXB0ZXJTaGFyZHMocHVibGljRGlyZWN0b3J5OiBzdHJpbmcsIGJvb2tJZDogc3RyaW5nLCBlZGl0aW9uS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGZzLmV4aXN0c1N5bmMobWFuaWZlc3RQYXRoRm9yKHB1YmxpY0RpcmVjdG9yeSwgYm9va0lkLCBlZGl0aW9uS2V5KSlcbn1cblxuZnVuY3Rpb24gcmVhZFN0cnVjdHVyZShwdWJsaWNEaXJlY3Rvcnk6IHN0cmluZywgYm9va0lkOiBzdHJpbmcsIGVkaXRpb25LZXk6IHN0cmluZyk6IExpYnJhcnlSZWFkaW5nU3RydWN0dXJlIHtcbiAgY29uc3QgbWFuaWZlc3RQYXRoID0gbWFuaWZlc3RQYXRoRm9yKHB1YmxpY0RpcmVjdG9yeSwgYm9va0lkLCBlZGl0aW9uS2V5KVxuICBjb25zdCBlZGl0aW9uUGF0aCA9IHBhdGguam9pbihwdWJsaWNEaXJlY3RvcnksICdkYXRhJywgJ2VkaXRpb25zJywgYCR7Ym9va0lkfS0ke2VkaXRpb25LZXl9Lmpzb25gKVxuICBjb25zdCBzb3VyY2VQYXRoID0gZnMuZXhpc3RzU3luYyhtYW5pZmVzdFBhdGgpID8gbWFuaWZlc3RQYXRoIDogZWRpdGlvblBhdGhcbiAgaWYgKCFmcy5leGlzdHNTeW5jKHNvdXJjZVBhdGgpKSB0aHJvdyBuZXcgRXJyb3IoYE5vIHB1Ymxpc2hlZCByZWFkaW5nIHN0cnVjdHVyZSBmb3IgJHtib29rSWR9LyR7ZWRpdGlvbktleX1gKVxuICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhzb3VyY2VQYXRoLCAndXRmOCcpKSBhcyB7IGNoYXB0ZXJzPzogQ2hhcHRlckxpa2VbXSB9XG4gIGNvbnN0IGNoYXB0ZXJzID0gbm9ybWFsaXplQ2hhcHRlcnMoQXJyYXkuaXNBcnJheShwYXJzZWQuY2hhcHRlcnMpID8gcGFyc2VkLmNoYXB0ZXJzIDogW10pXG4gIGlmICghY2hhcHRlcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoYE5vIGNoYXB0ZXJzIGluIHB1Ymxpc2hlZCByZWFkaW5nIHN0cnVjdHVyZSBmb3IgJHtib29rSWR9LyR7ZWRpdGlvbktleX1gKVxuICByZXR1cm4ge1xuICAgIGVkaXRpb25LZXksXG4gICAgdG90YWxQYXJhZ3JhcGhzOiBjaGFwdGVycy5yZWR1Y2UoKHN1bSwgY2hhcHRlcikgPT4gc3VtICsgY2hhcHRlci5wYXJhZ3JhcGhDb3VudCwgMCksXG4gICAgY2hhcHRlcnMsXG4gIH1cbn1cblxuLyoqIENvdW50IGFjdHVhbCBwdWJsaXNoZWQgdGV4dCwgbmV2ZXIgbXVsdGlwbHkgY2hhcHRlciB0b3RhbHMgb3IgaW52ZW50IHBhZ2VzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2hlZFdvcmRDb3VudChwdWJsaWNEaXJlY3Rvcnk6IHN0cmluZywgYm9va0lkOiBzdHJpbmcsIGVkaXRpb25LZXk6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuICBjb25zdCB3aG9sZSA9IHBhdGguam9pbihwdWJsaWNEaXJlY3RvcnksICdkYXRhJywgJ2VkaXRpb25zJywgYCR7Ym9va0lkfS0ke2VkaXRpb25LZXl9Lmpzb25gKVxuICBjb25zdCBkaXJlY3RvcnkgPSBwYXRoLmRpcm5hbWUobWFuaWZlc3RQYXRoRm9yKHB1YmxpY0RpcmVjdG9yeSwgYm9va0lkLCBlZGl0aW9uS2V5KSlcbiAgY29uc3QgZmlsZXMgPSBoYXNDaGFwdGVyU2hhcmRzKHB1YmxpY0RpcmVjdG9yeSxib29rSWQsZWRpdGlvbktleSlcbiAgICA/IChKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oZGlyZWN0b3J5LCAnbWFuaWZlc3QuanNvbicpLCAndXRmOCcpKS5jaGFwdGVycyBhcyBBcnJheTx7cGF0aDpzdHJpbmd9PikubWFwKGNoYXB0ZXIgPT4ge1xuICAgICAgICBjb25zdCBmaWxlPXBhdGgucmVzb2x2ZShkaXJlY3RvcnksY2hhcHRlci5wYXRoKVxuICAgICAgICBpZiAoIWZpbGUuc3RhcnRzV2l0aChwYXRoLnJlc29sdmUoZGlyZWN0b3J5KStwYXRoLnNlcCkpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjaGFwdGVyIHNoYXJkIHBhdGgnKVxuICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgfSlcbiAgICA6IGZzLmV4aXN0c1N5bmMod2hvbGUpID8gW3dob2xlXSA6IFtdXG4gIGxldCB0b3RhbCA9IDBcbiAgY29uc3QgY291bnQgPSAodmFsdWU6IHVua25vd24pOiB2b2lkID0+IHtcbiAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVyblxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgeyB2YWx1ZS5mb3JFYWNoKGNvdW50KTsgcmV0dXJuIH1cbiAgICBjb25zdCByZWNvcmQgPSB2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICAgIGlmIChBcnJheS5pc0FycmF5KHJlY29yZC5wYXJhZ3JhcGhzKSkge1xuICAgICAgZm9yIChjb25zdCBwYXJhZ3JhcGggb2YgcmVjb3JkLnBhcmFncmFwaHMpIGlmICh0eXBlb2YgcGFyYWdyYXBoID09PSAnc3RyaW5nJykgdG90YWwgKz0gcGFyYWdyYXBoLnJlcGxhY2UoLzxbXj5dKj4vZywnICcpLm1hdGNoKC9bXFxwe0x9XFxwe059XSsoPzpbXHUyMDE5Jy1dW1xccHtMfVxccHtOfV0rKSovZ3UpPy5sZW5ndGggPz8gMFxuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZWNvcmQuY2hhcHRlcnMpKSByZWNvcmQuY2hhcHRlcnMuZm9yRWFjaChjb3VudClcbiAgfVxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIGNvdW50KEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGZpbGUsJ3V0ZjgnKSkpXG4gIHJldHVybiB0b3RhbCA+IDAgPyB0b3RhbCA6IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZExpYnJhcnlSZWFkaW5nU3RydWN0dXJlcyhcbiAgY2F0YWxvZ3VlOiBTZXJpYWxpemFibGVQcmVSZWFkZXJDYXRhbG9ndWUsXG4gIHB1YmxpY0RpcmVjdG9yeTogc3RyaW5nLFxuKTogTGlicmFyeUNhdGFsb2d1ZVdpdGhTdHJ1Y3R1cmUge1xuICByZXR1cm4ge1xuICAgIC4uLmNhdGFsb2d1ZSxcbiAgICBib29rczogY2F0YWxvZ3VlLmJvb2tzLm1hcChib29rID0+IHtcbiAgICAgIGNvbnN0IGVkaXRpb24gPSB2aXNpYmxlUmVhZGluZ0VkaXRpb24oYm9vaylcbiAgICAgIGlmICghZWRpdGlvbikgdGhyb3cgbmV3IEVycm9yKGBQdWJsaXNoZWQgYm9vayAke2Jvb2suaWR9IGhhcyBubyByZWFkYWJsZSBub24tRGFuaXNoIGVkaXRpb25gKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uYm9vayxcbiAgICAgICAgd29yZENvdW50OiBwdWJsaXNoZWRXb3JkQ291bnQocHVibGljRGlyZWN0b3J5LCBib29rLmlkLCBlZGl0aW9uLmtleSkgPz8gYm9vay53b3JkQ291bnQsXG4gICAgICAgIGVkaXRpb25zOiBib29rLmVkaXRpb25zLm1hcChpdGVtID0+ICh7XG4gICAgICAgICAgLi4uaXRlbSxcbiAgICAgICAgICBjaGFwdGVyU2hhcmRzOiBoYXNDaGFwdGVyU2hhcmRzKHB1YmxpY0RpcmVjdG9yeSwgYm9vay5pZCwgaXRlbS5rZXkpLFxuICAgICAgICAgIHdvcmRDb3VudDogaXNFZGl0aW9uTGFuZ3VhZ2VPZmZlcmVkKGJvb2suaWQsIGl0ZW0pICYmIGl0ZW0uYXZhaWxhYmlsaXR5LmNoYXB0ZXJUZXh0ID8gcHVibGlzaGVkV29yZENvdW50KHB1YmxpY0RpcmVjdG9yeSwgYm9vay5pZCwgaXRlbS5rZXkpIDogbnVsbCxcbiAgICAgICAgICByZWFkaW5nU3RydWN0dXJlOiBpc0VkaXRpb25MYW5ndWFnZU9mZmVyZWQoYm9vay5pZCwgaXRlbSkgJiYgaXRlbS5hdmFpbGFiaWxpdHkuY2hhcHRlclRleHQgPyByZWFkU3RydWN0dXJlKHB1YmxpY0RpcmVjdG9yeSwgYm9vay5pZCwgaXRlbS5rZXkpIDogbnVsbCxcbiAgICAgICAgfSkpLFxuICAgICAgICByZWFkaW5nU3RydWN0dXJlOiByZWFkU3RydWN0dXJlKHB1YmxpY0RpcmVjdG9yeSwgYm9vay5pZCwgZWRpdGlvbi5rZXkpLFxuICAgICAgfVxuICAgIH0pLFxuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9sYWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3VzZXIvd3Qtc2V0dGluZ3MvYXBwL3NyYy9sYWIvbGFiUm91dGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2xhYi9sYWJSb3V0ZS50c1wiOy8qKlxuICogVGhlIHB1YmxpYyBwYWdlIFVSTHMuIEV2ZXJ5dGhpbmcgYSByZWFkZXIgY2FuIHNlZSBpbiB0aGUgYWRkcmVzcyBiYXIgaXMgb25lXG4gKiBvZiB0aGVzZSAocGx1cyAvcmVhZC97Ym9va0lkfSBmb3Igc2VhcmNoIGVuZ2luZXMpLiBBc3NldCBmb2xkZXJzIHN1Y2ggYXNcbiAqIC9sYWIvbGlicmFyeV8yLyBhcmUgaW1wbGVtZW50YXRpb24gZGV0YWlsIGFuZCBuZXZlciBhIG5hdmlnYXRpb24gdGFyZ2V0LlxuICovXG5leHBvcnQgY29uc3QgUEFHRV9IT01FID0gJy8nXG5leHBvcnQgY29uc3QgUEFHRV9MSUJSQVJZID0gJy9saWJyYXJ5J1xuZXhwb3J0IGNvbnN0IFBBR0VfUkVBREVSID0gJy9yZWFkZXInXG5leHBvcnQgY29uc3QgUEFHRV9TSUdOX0lOID0gJy9zaWduLWluJ1xuZXhwb3J0IGNvbnN0IFBBR0VfRkVBVFVSRUQgPSAnL2ZlYXR1cmVkJ1xuXG4vKiogVGhlIG9uZSBwYXRoIHRoYXQgbW91bnRzIHRoZSByZWFkZXIgU1BBLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTGFiUGF0aChwYXRobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IHBhdGggPSBwYXRobmFtZS5zcGxpdCgnPycpWzBdLnNwbGl0KCcjJylbMF1cbiAgcmV0dXJuIHBhdGggPT09IFBBR0VfUkVBREVSIHx8IHBhdGggPT09IFBBR0VfUkVBREVSICsgJy8nXG59XG5cbi8qKlxuICogT2xkIHBhZ2UgVVJMcyBmcm9tIHdoZW4gdGhlIHJlYWRlciBhbmQgbGlicmFyeSBsaXZlZCB1bmRlciAvbGFiLiBUaGV5IGFyZVxuICogcGVybWFuZW50IHJlZGlyZWN0cyB0byB0aGUgY2Fub25pY2FsIHBhZ2UsIGtlZXBpbmcgdGhlIHF1ZXJ5IHN0cmluZy4gT25seVxuICogcGFnZSAoSFRNTCBkb2N1bWVudCkgVVJMcyBhcmUgbGlzdGVkOyBhc3NldCBmaWxlcyB1bmRlciAvbGFiLyBhcmUgc2VydmVkLlxuICogVGhlIC9sYWIgbmFtZXNwYWNlIHN0YXlzIGZyZWUgZm9yIGZ1dHVyZSBleHBlcmltZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlZ2FjeUxhYlBhZ2VSZWRpcmVjdChwYXRobmFtZTogc3RyaW5nLCBzZWFyY2ggPSAnJyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCBwYXRoID0gcGF0aG5hbWUucmVwbGFjZSgvXFwvKyQvLCAnJykucmVwbGFjZSgvXFwvaW5kZXhcXC5odG1sJC8sICcnKVxuICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHNlYXJjaC5zdGFydHNXaXRoKCc/JykgPyBzZWFyY2guc2xpY2UoMSkgOiBzZWFyY2gpXG4gIGxldCB0YXJnZXQ6IHN0cmluZyB8IG51bGwgPSBudWxsXG4gIHN3aXRjaCAocGF0aCkge1xuICAgIGNhc2UgJy9sYWInOlxuICAgIGNhc2UgJy9sYWIvbGFuZGluZyc6XG4gICAgICB0YXJnZXQgPSBQQUdFX0hPTUVcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnL2xhYi9saWJyYXJ5JzpcbiAgICBjYXNlICcvbGFiL2xpYnJhcnlfMic6XG4gICAgY2FzZSAnL2xhYi9saWJyYXJ5LTInOlxuICAgIGNhc2UgJy9sYWIvbGlicmFyeV8yL2Rlc2t0b3AuaHRtbCc6XG4gICAgY2FzZSAnL2xhYi9saWJyYXJ5XzIvbW9iaWxlLmh0bWwnOlxuICAgICAgdGFyZ2V0ID0gUEFHRV9MSUJSQVJZXG4gICAgICBicmVha1xuICAgIGNhc2UgJy9sYWIvcmVhZGVyJzpcbiAgICAgIHRhcmdldCA9IFBBR0VfUkVBREVSXG4gICAgICBicmVha1xuICAgIGNhc2UgJy9sYWIvcGhvbmUnOlxuICAgIGNhc2UgJy9sYWIvZGVza3RvcCc6XG4gICAgICB0YXJnZXQgPSBQQUdFX1JFQURFUlxuICAgICAgaWYgKCFwYXJhbXMuaGFzKCdsYXlvdXQnKSkgcGFyYW1zLnNldCgnbGF5b3V0JywgcGF0aC5zbGljZSgnL2xhYi8nLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGNhc2UgJy9sYWIvc2lnbi1pbic6XG4gICAgICB0YXJnZXQgPSBQQUdFX1NJR05fSU5cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnL2xhYi9mZWF0dXJlZCc6XG4gICAgICB0YXJnZXQgPSBQQUdFX0ZFQVRVUkVEXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbFxuICB9XG4gIGlmICh0YXJnZXQgPT09IFBBR0VfUkVBREVSIHx8IHRhcmdldCA9PT0gUEFHRV9MSUJSQVJZKSB7XG4gICAgcGFyYW1zLmRlbGV0ZSgnY2hyb21lJylcbiAgICBpZiAocGFyYW1zLmdldCgndm9pY2VUcmlhbCcpID09PSAnZnVsbCcpIHBhcmFtcy5kZWxldGUoJ3ZvaWNlVHJpYWwnKVxuICB9XG4gIGNvbnN0IHF1ZXJ5ID0gcGFyYW1zLnRvU3RyaW5nKClcbiAgcmV0dXJuIHF1ZXJ5ID8gYCR7dGFyZ2V0fT8ke3F1ZXJ5fWAgOiB0YXJnZXRcbn1cblxuZXhwb3J0IHR5cGUgTGFiTGF5b3V0T3ZlcnJpZGUgPSAncGhvbmUnIHwgJ2Rlc2t0b3AnIHwgbnVsbFxuXG4vKiogYC9yZWFkZXI/bGF5b3V0PXBob25lfGRlc2t0b3BgIGZvcmNlcyBhIGxheW91dCBmb3IgUUE7IG90aGVyd2lzZSB0aGUgZGV2aWNlIGRlY2lkZXMuICovXG5leHBvcnQgZnVuY3Rpb24gbGFiTGF5b3V0T3ZlcnJpZGUocGF0aG5hbWU6IHN0cmluZywgc2VhcmNoPzogc3RyaW5nKTogTGFiTGF5b3V0T3ZlcnJpZGUge1xuICBjb25zdCBbcGF0aFBhcnQsIGlubGluZVF1ZXJ5ID0gJyddID0gcGF0aG5hbWUuc3BsaXQoJyMnKVswXS5zcGxpdCgnPycpXG4gIGNvbnN0IHBhdGggPSBwYXRoUGFydC5yZXBsYWNlKC9cXC8rJC8sICcnKVxuICBpZiAocGF0aCA9PT0gJy9sYWIvcGhvbmUnKSByZXR1cm4gJ3Bob25lJ1xuICBpZiAocGF0aCA9PT0gJy9sYWIvZGVza3RvcCcpIHJldHVybiAnZGVza3RvcCdcbiAgY29uc3QgcXVlcnkgPSBzZWFyY2ggIT09IHVuZGVmaW5lZCA/IHNlYXJjaCA6IGlubGluZVF1ZXJ5XG4gIGNvbnN0IGxheW91dCA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnkuc3RhcnRzV2l0aCgnPycpID8gcXVlcnkuc2xpY2UoMSkgOiBxdWVyeSkuZ2V0KCdsYXlvdXQnKT8udHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgcmV0dXJuIGxheW91dCA9PT0gJ3Bob25lJyB8fCBsYXlvdXQgPT09ICdkZXNrdG9wJyA/IGxheW91dCA6IG51bGxcbn1cblxuZXhwb3J0IHR5cGUgTGFiVm9pY2VWZXJzaW9uID0gJ3YxJyB8ICd2MidcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc3JjL2NhcmRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zcmMvY2FyZHMvY2FyZFJvdXRlcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zcmMvY2FyZHMvY2FyZFJvdXRlcy50c1wiOy8qKlxuICogT2xkIGFjY291bnQgVVJMcyBrZWVwIHdvcmtpbmcgKGxpbmtzIGluIGVtYWlscyk6IGVhY2ggcmVkaXJlY3RzIHRvIHRoZVxuICogbGlicmFyeSwgb3IgdG8gdGhlIHJlYWRlciBwYWdlIGl0IGNhbWUgZnJvbSwgd2l0aCBgP2NhcmQ9PG5hbWU+YCwgYW5kIHRoZVxuICogcGFnZSBvcGVucyB0aGF0IGNhcmQgb3ZlciBpdHNlbGYgKG9wZW5DYXJkcy50cyBjb25zdW1lQ2FyZFBhcmFtKS5cbiAqXG4gKiAgIC95b3UgICAgICAgICAgICAgICAgICAgICAtPiBZb3VcbiAqICAgL3lvdT92aWV3PXNldHRpbmdzIChcdTIwMjYpICAgLT4gU2V0dGluZ3NcbiAqICAgL3lvdXItcmVhZGluZyAgICAgICAgICAgIC0+IFlvdXIgcmVhZGluZ1xuICogICAvZnJpZW5kcyAgICAgICAgICAgICAgICAgLT4gTGVhZGVyYm9hcmQgKD90YWI9ZmluZCAtPiBGaW5kIHJlYWRlcnMpXG4gKiAgIC9zaWduLWluP21vZGU9YWNjb3VudCAgICAtPiBBY2NvdW50IChoYW5kbGVkIGJ5IHRoZSBzaWduLWluIHBhZ2UsIHdoaWNoIHNpZ25zIGluIGZpcnN0KVxuICpcbiAqIFB1cmU7IHNoYXJlZCBieSB0aGUgV29ya2VyIGFuZCB0aGUgZGV2IHNlcnZlci5cbiAqL1xuZXhwb3J0IGNvbnN0IENBUkRfUEFSQU0gPSAnY2FyZCdcblxuZXhwb3J0IHR5cGUgQ2FyZE5hbWUgPSAneW91JyB8ICdyZWFkaW5nJyB8ICdsZWFkZXJib2FyZCcgfCAnZmluZCcgfCAnc2V0dGluZ3MnIHwgJ2FjY291bnQnXG5jb25zdCBDQVJEX05BTUVTOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldDxDYXJkTmFtZT4oWyd5b3UnLCAncmVhZGluZycsICdsZWFkZXJib2FyZCcsICdmaW5kJywgJ3NldHRpbmdzJywgJ2FjY291bnQnXSlcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ2FyZE5hbWUodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBDYXJkTmFtZSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIENBUkRfTkFNRVMuaGFzKHZhbHVlKVxufVxuXG4vKiogV2hlcmUgYSBjYXJkIG1heSBvcGVuOiB0aGUgbGlicmFyeSwgb3IgYSByZWFkZXIgVVJMIChzYW1lIHJ1bGVzIGFzIHNpZ24taW4ncyByZXR1cm4pLiAqL1xuZnVuY3Rpb24gY2FyZEhvc3QocmF3OiBzdHJpbmcgfCBudWxsKTogc3RyaW5nIHtcbiAgaWYgKCFyYXcgfHwgcmF3LmluY2x1ZGVzKCdcXFxcJykgfHwgIXJhdy5zdGFydHNXaXRoKCcvJykgfHwgcmF3LnN0YXJ0c1dpdGgoJy8vJykpIHJldHVybiAnL2xpYnJhcnknXG4gIHRyeSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChyYXcsICdodHRwczovL3RpbmN0LmFwcCcpXG4gICAgaWYgKC9eXFwvKD86cmVhZGVyfHJlYWRcXC9bQS1aYS16MC05Xy1dKyg/OlxcL1xcZCspPylcXC8/JC8udGVzdCh1cmwucGF0aG5hbWUpIHx8IHVybC5wYXRobmFtZSA9PT0gJy9saWJyYXJ5JyB8fCB1cmwucGF0aG5hbWUgPT09ICcvJykge1xuICAgICAgdXJsLnNlYXJjaFBhcmFtcy5kZWxldGUoQ0FSRF9QQVJBTSlcbiAgICAgIHJldHVybiBgJHt1cmwucGF0aG5hbWV9JHt1cmwuc2VhcmNofWBcbiAgICB9XG4gIH0gY2F0Y2ggeyAvKiBmYWxsIHRocm91Z2ggKi8gfVxuICByZXR1cm4gJy9saWJyYXJ5J1xufVxuXG4vKiogYC9saWJyYXJ5P2NhcmQ9eW91YCwgb3IgdGhlIHJlYWRlciBVUkwgd2l0aCB0aGUgY2FyZCBhZGRlZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYXJkVXJsKGNhcmQ6IENhcmROYW1lLCBob3N0OiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IHN0cmluZyB7XG4gIGNvbnN0IGJhc2UgPSBjYXJkSG9zdChob3N0KVxuICBjb25zdCB1cmwgPSBuZXcgVVJMKGJhc2UsICdodHRwczovL3RpbmN0LmFwcCcpXG4gIHVybC5zZWFyY2hQYXJhbXMuc2V0KENBUkRfUEFSQU0sIGNhcmQpXG4gIHJldHVybiBgJHt1cmwucGF0aG5hbWV9JHt1cmwuc2VhcmNofWBcbn1cblxuY29uc3QgWU9VX1ZJRVdTOiBSZWNvcmQ8c3RyaW5nLCBDYXJkTmFtZT4gPSB7XG4gIHNldHRpbmdzOiAnc2V0dGluZ3MnLCB2aXNpYmlsaXR5OiAnc2V0dGluZ3MnLCBzaG93UmVhZGluZzogJ3NldHRpbmdzJywgc2hvd1RpbWU6ICdzZXR0aW5ncycsIG9uTGVhZGVyYm9hcmQ6ICdzZXR0aW5ncycsXG4gIGVtYWlsczogJ3NldHRpbmdzJywgbmV3Qm9va3M6ICdzZXR0aW5ncycsIG5hbWU6ICdzZXR0aW5ncycsIGhhbmRsZTogJ3NldHRpbmdzJywgYmxvY2tlZDogJ3NldHRpbmdzJyxcbn1cblxuLyoqIFRoZSByZWRpcmVjdCBmb3IgYW4gb2xkIGFjY291bnQgcGFnZSwgb3IgbnVsbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhY2NvdW50UGFnZVJlZGlyZWN0KHBhdGhuYW1lOiBzdHJpbmcsIHNlYXJjaDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoc2VhcmNoKVxuICBjb25zdCBiYWNrID0gcGFyYW1zLmdldCgncmV0dXJuVG8nKSB8fCBwYXJhbXMuZ2V0KCdyZXR1cm4nKVxuICBpZiAocGF0aG5hbWUgPT09ICcveW91JyB8fCBwYXRobmFtZSA9PT0gJy95b3UvJykge1xuICAgIHJldHVybiBjYXJkVXJsKFlPVV9WSUVXU1twYXJhbXMuZ2V0KCd2aWV3JykgfHwgJyddID8/ICd5b3UnLCBiYWNrKVxuICB9XG4gIGlmIChwYXRobmFtZSA9PT0gJy95b3VyLXJlYWRpbmcnIHx8IHBhdGhuYW1lID09PSAnL3lvdXItcmVhZGluZy8nKSByZXR1cm4gY2FyZFVybCgncmVhZGluZycsIGJhY2spXG4gIGlmIChwYXRobmFtZSA9PT0gJy9mcmllbmRzJyB8fCBwYXRobmFtZSA9PT0gJy9mcmllbmRzLycpIHJldHVybiBjYXJkVXJsKHBhcmFtcy5nZXQoJ3RhYicpID09PSAnZmluZCcgPyAnZmluZCcgOiAnbGVhZGVyYm9hcmQnLCBiYWNrKVxuICByZXR1cm4gbnVsbFxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS91c2VyL3d0LXNldHRpbmdzL2FwcC9zY3JpcHRzL3JlYWRlckJvb3RTY3JpcHQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXNlci93dC1zZXR0aW5ncy9hcHAvc2NyaXB0cy9yZWFkZXJCb290U2NyaXB0LnRzXCI7aW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gJ2NyeXB0bydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBidWlsZFN5bmMgfSBmcm9tICdlc2J1aWxkJ1xuXG4vKipcbiAqIFRoZSBib29rcyB3aG9zZSBuZXctcmVhZGVyIGRlZmF1bHQgZWRpdGlvbiBpcyBub3QgTW9kZXJuIEVuZ2xpc2gsIHdpdGggdGhhdFxuICogZGVmYXVsdCAoJycgd2hlbiBub3RoaW5nIGlzIG9mZmVyZWQpLCB3b3JrZWQgb3V0IGJ5IHRoZSBhcHAncyBvd25cbiAqIGBkZWZhdWx0UHJpbWFyeUVkaXRpb25LZXlgIG92ZXIgdGhlIHJlZ2lzdHJ5IGFuZCB0aGUgZWRpdGlvbiBob2xkcyBhcyB0aGV5XG4gKiBhcmUgYXQgYnVpbGQgdGltZS4gVGhlIGJvb3Qgc2NyaXB0IHVzZXMgaXQgdG8gcHJlbG9hZCBhIGRlZXAgbGluaydzIHRleHRcbiAqIChgcmVhZGVyQm9vdERlZXBMaW5rYCk7IGEgdGFibGUgdGhpcyBzbWFsbCBmaXRzIHRoZSBoZWFkIHNjcmlwdCwgYW5kIGJlaW5nXG4gKiBjb21wdXRlZCBieSBlYWNoIGJ1aWxkIGl0IG5ldmVyIG5lZWRzIGVkaXRpbmcgd2hlbiBhIGJvb2sgb3IgaG9sZCBjaGFuZ2VzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZGVyQm9vdFByaW1hcnlFeGNlcHRpb25zKHJvb3QgPSBwcm9jZXNzLmN3ZCgpKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGJ1aWxkU3luYyh7XG4gICAgc3RkaW46IHtcbiAgICAgIGNvbnRlbnRzOiBbXG4gICAgICAgIFwiaW1wb3J0IHsgQk9PS1MgfSBmcm9tICcuL3NyYy9kYXRhL2Jvb2tSZWdpc3RyeSdcIixcbiAgICAgICAgXCJpbXBvcnQgeyBkZWZhdWx0UHJpbWFyeUVkaXRpb25LZXkgfSBmcm9tICcuL3NyYy9kYXRhL2VkaXRpb25EZWZhdWx0cydcIixcbiAgICAgICAgJ2NvbnN0IGV4Y2VwdGlvbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fScsXG4gICAgICAgIFwiZm9yIChjb25zdCBib29rIG9mIEJPT0tTKSB7IGNvbnN0IGtleSA9IGRlZmF1bHRQcmltYXJ5RWRpdGlvbktleShib29rLmlkLCBib29rLmVkaXRpb25zKSA/PyAnJzsgaWYgKGtleSAhPT0gJ21vZGVybi1lbicpIGV4Y2VwdGlvbnNbYm9vay5pZF0gPSBrZXkgfVwiLFxuICAgICAgICAnZXhwb3J0IGRlZmF1bHQgZXhjZXB0aW9ucycsXG4gICAgICBdLmpvaW4oJ1xcbicpLFxuICAgICAgcmVzb2x2ZURpcjogcm9vdCxcbiAgICAgIGxvYWRlcjogJ3RzJyxcbiAgICAgIHNvdXJjZWZpbGU6ICdyZWFkZXItYm9vdC1wcmltYXJ5LWV4Y2VwdGlvbnMudHMnLFxuICAgIH0sXG4gICAgYnVuZGxlOiB0cnVlLFxuICAgIHBsYXRmb3JtOiAnbmV1dHJhbCcsXG4gICAgZm9ybWF0OiAnaWlmZScsXG4gICAgZ2xvYmFsTmFtZTogJ19fcmVhZGVyQm9vdFByaW1hcnlFeGNlcHRpb25zJyxcbiAgICB3cml0ZTogZmFsc2UsXG4gICAgbG9nTGV2ZWw6ICdzaWxlbnQnLFxuICAgIGxvYWRlcjogeyAnLmpzb24nOiAnanNvbicgfSxcbiAgICBkZWZpbmU6IHsgX19CVUlMRF9WRVJTSU9OX186ICdcInJlYWRlci1ib290XCInLCAnaW1wb3J0Lm1ldGEuZW52JzogJ3t9JyB9LFxuICB9KVxuICBjb25zdCB2YWx1ZSA9IG5ldyBGdW5jdGlvbihgJHtyZXN1bHQub3V0cHV0RmlsZXNbMF0udGV4dH07IHJldHVybiBfX3JlYWRlckJvb3RQcmltYXJ5RXhjZXB0aW9ucy5kZWZhdWx0YCkoKSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXModmFsdWUpLnNvcnQoKFthXSwgW2JdKSA9PiBhLmxvY2FsZUNvbXBhcmUoYikpKVxufVxuXG4vKipcbiAqIEJ1bmRsZSBzcmMvbGFiL3JlYWRlckJvb3RFbnRyeS50cyBpbnRvIG9uZSBzbWFsbCBjbGFzc2ljIHNjcmlwdCB3aXRoIHRoZVxuICogYnVpbGQgdmVyc2lvbiBpbmxpbmVkLiBUaGUgcmVhZGVyIEhUTUwgbG9hZHMgaXQgc3luY2hyb25vdXNseSBpbiA8aGVhZD5cbiAqICh0aGUgQ1NQIGFsbG93cyBubyBpbmxpbmUgc2NyaXB0KSwgc28gaXQgbXVzdCBzdGF5IGRlcGVuZGVuY3ktbGlnaHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlYWRlckJvb3RTY3JpcHQoYnVpbGRWZXJzaW9uOiBzdHJpbmcsIHJvb3QgPSBwcm9jZXNzLmN3ZCgpKTogeyBzb3VyY2U6IHN0cmluZzsgZmlsZU5hbWU6IHN0cmluZyB9IHtcbiAgY29uc3QgcmVzdWx0ID0gYnVpbGRTeW5jKHtcbiAgICBlbnRyeVBvaW50czogW3BhdGgucmVzb2x2ZShyb290LCAnc3JjL2xhYi9yZWFkZXJCb290RW50cnkudHMnKV0sXG4gICAgYnVuZGxlOiB0cnVlLFxuICAgIGZvcm1hdDogJ2lpZmUnLFxuICAgIG1pbmlmeTogdHJ1ZSxcbiAgICB3cml0ZTogZmFsc2UsXG4gICAgdGFyZ2V0OiAnZXMyMDE5JyxcbiAgICBsZWdhbENvbW1lbnRzOiAnbm9uZScsXG4gICAgZGVmaW5lOiB7XG4gICAgICBfX0JVSUxEX1ZFUlNJT05fXzogSlNPTi5zdHJpbmdpZnkoYnVpbGRWZXJzaW9uKSxcbiAgICAgIF9fUkVBREVSX0JPT1RfUFJJTUFSWV9FWENFUFRJT05TX186IEpTT04uc3RyaW5naWZ5KHJlYWRlckJvb3RQcmltYXJ5RXhjZXB0aW9ucyhyb290KSksXG4gICAgfSxcbiAgfSlcbiAgY29uc3Qgc291cmNlID0gcmVzdWx0Lm91dHB1dEZpbGVzWzBdLnRleHRcbiAgY29uc3QgaGFzaCA9IGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShzb3VyY2UpLmRpZ2VzdCgnaGV4Jykuc2xpY2UoMCwgMTApXG4gIHJldHVybiB7IHNvdXJjZSwgZmlsZU5hbWU6IGBhc3NldHMvcmVhZGVyLWJvb3QtJHtoYXNofS5qc2AgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVPLElBQU0sVUFBZ0I7QUFBQSxFQUMzQixJQUFJO0FBQUEsRUFDSixPQUFPO0FBQUEsRUFDUCxRQUFRO0FBQUEsRUFDUixhQUFhO0FBQUEsRUFDYixNQUFNO0FBQUEsRUFDTixXQUFXO0FBQUEsRUFDWCxZQUFZO0FBQUEsRUFDWixhQUFhO0FBQUEsRUFDYixVQUFVO0FBQUEsSUFDUjtBQUFBLE1BQ0UsS0FBSztBQUFBLE1BQ0wsVUFBVTtBQUFBLE1BQ1YsT0FBTztBQUFBLE1BQ1AsT0FBTztBQUFBLE1BQ1AsWUFBWTtBQUFBLE1BQ1osTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsVUFBVTtBQUFBLElBQ1o7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFLO0FBQUEsTUFDTCxVQUFVO0FBQUEsTUFDVixPQUFPO0FBQUEsTUFDUCxPQUFPO0FBQUEsTUFDUCxTQUFTO0FBQUEsTUFDVCxVQUFVO0FBQUEsSUFDWjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQUs7QUFBQSxNQUNMLFVBQVU7QUFBQSxNQUNWLE9BQU87QUFBQSxNQUNQLE9BQU87QUFBQSxNQUNQLFNBQVM7QUFBQSxNQUNULFVBQVU7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUNGO0FBRU8sSUFBTSxVQUFnQjtBQUFBLEVBQzNCLElBQUk7QUFBQSxFQUNKLE9BQU87QUFBQSxFQUNQLFFBQVE7QUFBQSxFQUNSLGFBQWE7QUFBQSxFQUNiLE1BQU07QUFBQSxFQUNOLFdBQVc7QUFBQSxFQUNYLFlBQVk7QUFBQSxFQUNaLGFBQWE7QUFBQSxFQUNiLFVBQVU7QUFBQSxJQUNSO0FBQUEsTUFDRSxLQUFLO0FBQUEsTUFDTCxVQUFVO0FBQUEsTUFDVixPQUFPO0FBQUEsTUFDUCxPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEs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QUNFLFlBQWM7QUFBQSxJQUNaO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLG1CQUFxQjtBQUFBLElBQ25CO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsZUFBaUI7QUFBQSxJQUNmO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsUUFBVTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxRQUFVO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBUztBQUFBLEVBQ1QsZUFBaUI7QUFBQSxJQUNmO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxVQUFZO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFFBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtB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QUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsWUFBWTtBQUFBLElBQ1osVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixhQUFhO0FBQUEsSUFDYixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixhQUFhO0FBQUEsSUFDYixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsWUFBWTtBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFlBQVk7QUFBQSxJQUNaLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxFQUNoQjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLGFBQWE7QUFBQSxJQUNiLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBRU8sSUFBTSxrQkFBZ0Q7QUFBQSxFQUMzRCxTQUFTO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsRUFDVDtBQUFB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QUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsV0FBVztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQThFTyxJQUFNLHdCQUE4QztBQUFBLEVBQ3pEO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixZQUFZO0FBQUEsSUFDWixZQUFZO0FBQUEsTUFDVjtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsWUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLE1BQ1Y7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsWUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLE1BQ1Y7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFlBQVk7QUFBQSxJQUNaLFlBQVk7QUFBQSxNQUNWO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixZQUFZO0FBQUEsSUFDWixZQUFZO0FBQUEsTUFDVjtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLFFBQ0UsV0FBVztBQUFBLFFBQ1gsU0FBUztBQUFBLFFBQ1QsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsUUFDRSxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixZQUFZO0FBQUEsSUFDWixZQUFZO0FBQUEsTUFDVjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFFTyxJQUFNLDBCQUEyRCxPQUFPO0FBQUEsRUFDN0Usa0JBQWtCLElBQUksVUFBUSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7QUFDL0M7QUFFTyxJQUFNLHFCQUE4RCxDQUFDO0FBQzVFLFdBQVcsUUFBUSx1QkFBdUI7QUFDeEMsT0FBSyxTQUFTLFFBQVEsQ0FBQyxPQUFPLFVBQVU7QUFDdEMsUUFBSSxDQUFDLE1BQU0sR0FBSTtBQUNmLHVCQUFtQixNQUFNLEVBQUUsTUFBTSxDQUFDO0FBQ2xDLHVCQUFtQixNQUFNLEVBQUUsRUFBRSxLQUFLO0FBQUEsTUFDaEMsUUFBUSxLQUFLO0FBQUEsTUFDYixXQUFXLEtBQUs7QUFBQSxNQUNoQixVQUFVLFFBQVE7QUFBQSxNQUNsQixRQUFRLEtBQUs7QUFBQSxJQUNmLENBQUM7QUFBQSxFQUNILENBQUM7QUFDSDtBQU1PLFNBQVMsbUJBQW1CLE1BQVksTUFBZ0M7QUFDN0UsTUFBSSxNQUFNLEtBQU0sUUFBTyxLQUFLO0FBQzVCLE1BQUksS0FBSyxTQUFTLE9BQVcsUUFBTztBQUNwQyxTQUFPLEtBQUssT0FBTyxJQUFJLFFBQVEsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLFFBQVEsT0FBTyxLQUFLLElBQUk7QUFDL0U7OztBQzV5SUEsSUFBTSxXQUE4QztBQUFBLEVBQ2xELHVCQUF1QjtBQUFBLEVBQ3ZCLHVCQUF1QjtBQUFBLEVBQ3ZCLDZCQUE2QjtBQUFBLEVBQzdCLGdCQUFnQjtBQUFBLEVBQ2hCLGdCQUFnQjtBQUFBLEVBQ2hCLHlCQUF5QjtBQUFBLEVBQ3pCLHNCQUFzQjtBQUFBLEVBQ3RCLHVCQUF1QjtBQUFBLEVBQ3ZCLHlCQUF5QjtBQUFBLEVBQ3pCLGdDQUFnQztBQUFBLEVBQ2hDLDJCQUEyQjtBQUFBLEVBQzNCLDhCQUE4QjtBQUFBLEVBQzlCLG1DQUFtQztBQUFBLEVBQ25DLG9DQUFvQztBQUFBLEVBQ3BDLDRCQUE0QjtBQUFBLEVBQzVCLDJCQUEyQjtBQUFBLEVBQzNCLDZCQUE2QjtBQUFBLEVBQzdCLHlCQUF5QjtBQUFBLEVBQ3pCLDBCQUEwQjtBQUFBLEVBQzFCLDZCQUE2QjtBQUFBLEVBQzdCLDRCQUE0QjtBQUFBLEVBQzVCLDBCQUEwQjtBQUFBLEVBQzFCLHVCQUF1QjtBQUFBLEVBQ3ZCLHlCQUF5QjtBQUFBLEVBQ3pCLHNCQUFzQjtBQUFBLEVBQ3RCLHFCQUFxQjtBQUFBLEVBQ3JCLHdCQUF3QjtBQUFBLEVBQ3hCLHVCQUF1QjtBQUFBLEVBQ3ZCLHlCQUF5QjtBQUFBLEVBQ3pCLGtDQUFrQztBQUFBLEVBQ2xDLDZCQUE2QjtBQUFBLEVBQzdCLDJCQUEyQjtBQUFBLEVBQzNCLDJCQUEyQjtBQUFBLEVBQzNCLG1DQUFtQztBQUFBLEVBQ25DLHlCQUF5QjtBQUFBLEVBQ3pCLDZCQUE2QjtBQUFBLEVBQzdCLGtDQUFrQztBQUFBLEVBQ2xDLHFCQUFxQjtBQUFBLEVBQ3JCLGtDQUFrQztBQUFBLEVBQ2xDLDBCQUEwQjtBQUFBLEVBQzFCLDBCQUEwQjtBQUFBLEVBQzFCLG9DQUFvQztBQUFBLEVBQ3BDLCtCQUErQjtBQUFBLEVBQy9CLHVCQUF1QjtBQUFBLEVBQ3ZCLHVCQUF1QjtBQUFBLEVBQ3ZCLG9DQUFvQztBQUFBLEVBQ3BDLDJCQUEyQjtBQUFBLEVBQzNCLGtDQUFrQztBQUFBLEVBQ2xDLHdCQUF3QjtBQUFBLEVBQ3hCLG1DQUFtQztBQUFBLEVBQ25DLHFDQUFxQztBQUFBLEVBQ3JDLDBCQUEwQjtBQUFBLEVBQzFCLDhCQUE4QjtBQUFBLEVBQzlCLGlDQUFpQztBQUFBLEVBQ2pDLGtDQUFrQztBQUFBLEVBQ2xDLHlCQUF5QjtBQUFBLEVBQ3pCLGtDQUFrQztBQUFBLEVBQ2xDLGtDQUFrQztBQUFBLEVBQ2xDLG1DQUFtQztBQUFBLEVBQ25DLCtCQUErQjtBQUFBLEVBQy9CLDRCQUE0QjtBQUFBLEVBQzVCLCtCQUErQjtBQUFBLEVBQy9CLGlDQUFpQztBQUFBLEVBQ2pDLHVCQUF1QjtBQUFBLEVBQ3ZCLDRCQUE0QjtBQUFBLEVBQzVCLDRCQUE0QjtBQUFBLEVBQzVCLHdCQUF3QjtBQUFBLEVBQ3hCLHVCQUF1QjtBQUFBLEVBQ3ZCLHFCQUFxQjtBQUFBLEVBQ3JCLDJCQUEyQjtBQUFBLEVBQzNCLHNDQUFzQztBQUFBLEVBQ3RDLDJCQUEyQjtBQUFBLEVBQzNCLHFDQUFxQztBQUFBLEVBQ3JDLGlDQUFpQztBQUFBLEVBQ2pDLGtDQUFrQztBQUFB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VyxNQUFNLE1BQU0sb0JBQW9CLFlBQVksRUFBRTtBQUMvRCxvQkFBTSxRQUFRLFNBQVMsUUFBUSxJQUFJLGNBQWMsS0FBSztBQUN0RCxrQkFBSSxVQUFVLFNBQVMsUUFBUSxFQUFFLGdCQUFnQixNQUFNLENBQUM7QUFDeEQsa0JBQUksSUFBSSxPQUFPLEtBQUssTUFBTSxTQUFTLFlBQVksQ0FBQyxDQUFDO0FBQUEsWUFDbkQsU0FBUyxLQUFLO0FBQ1osa0JBQUksVUFBVSxLQUFLLEVBQUUsZ0JBQWdCLG1CQUFtQixDQUFDO0FBQ3pELGtCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsT0FBTyxxQkFBcUIsU0FBUyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFBQSxZQUM5RTtBQUFBLFVBQ0YsQ0FBQztBQUdELGlCQUFPLFlBQVksSUFBSSxVQUFVLENBQUMsS0FBc0IsS0FBcUIsU0FBcUI7QUFDaEcsa0JBQU0sV0FBV0EsTUFBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLFNBQVMsbUJBQW1CLElBQUksT0FBTyxFQUFFLENBQUM7QUFDcEYsZ0JBQUlDLElBQUcsV0FBVyxRQUFRLEtBQUtBLElBQUcsU0FBUyxRQUFRLEVBQUUsT0FBTyxHQUFHO0FBQzdELG9CQUFNLE1BQU1ELE1BQUssUUFBUSxRQUFRLEVBQUUsWUFBWTtBQUMvQyxvQkFBTSxZQUFvQztBQUFBLGdCQUN4QyxRQUFRO0FBQUEsZ0JBQ1IsUUFBUTtBQUFBLGdCQUNSLFNBQVM7QUFBQSxjQUNYO0FBQ0Esa0JBQUksVUFBVSxLQUFLLEVBQUUsZ0JBQWdCLFVBQVUsR0FBRyxLQUFLLDJCQUEyQixDQUFDO0FBQ25GLGNBQUFDLElBQUcsaUJBQWlCLFFBQVEsRUFBRSxLQUFLLEdBQUc7QUFBQSxZQUN4QyxPQUFPO0FBQ0wsbUJBQUs7QUFBQSxZQUNQO0FBQUEsVUFDRixDQUFDO0FBR0QsaUJBQU8sWUFBWSxJQUFJLGdCQUFnQixPQUFPLEtBQXNCLFFBQXdCO0FBQzFGLGdCQUFJLFVBQVUsS0FBSyxFQUFFLGdCQUFnQixtQkFBbUIsQ0FBQztBQUN6RCxnQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLGVBQWUsS0FBSyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7QUFBQSxVQUN0RSxDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFJTixNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFDQSxDQUFDOyIsCiAgIm5hbWVzIjogWyJib29rIiwgImZzIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJwYXRoIiwgImZzIiwgInBhdGgiLCAiY3JlYXRlSGFzaCIsICJwYXRoIiwgInBhdGgiLCAiY3JlYXRlSGFzaCIsICJwYXRoIiwgImZzIl0KfQo=
