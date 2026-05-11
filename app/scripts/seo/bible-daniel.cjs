// SEO content data for the book of Daniel.
// 12 chapters; set in 6th c. BCE Babylonian/Persian court but composed mid-2nd c. BCE during the Maccabean crisis.
// First half (1-6) is court tales; second half (7-12) is apocalyptic vision.
// Voice: literary, declarative present, attentive to the dating question and the apocalyptic register.

const chapters = require('/tmp/bible-daniel-chunk-1.json');

module.exports = {
  id: 'bible-daniel',
  title: 'Daniel',
  author: 'Anonymous (2nd c. BCE composition with earlier traditions)',
  byline: 'c. 165 BCE · Hebrew Bible · Writings · Apocalyptic',
  titleAccent: 'a guided tour',
  hook: 'A Jewish exile in Babylon interprets the dreams of kings, survives the lions\' den, and sees four great beasts rise from the sea. Then the book breaks open into one of the strangest passages in all of scripture — a heavenly court, a throne of fire, and one like a son of man coming with the clouds.',

  genre: ['Apocalyptic', 'Court tales', 'Wisdom literature', 'Prophecy'],

  about: [
    `<em>Daniel</em> is two books bound together. The first half — chapters 1 through 6 — is court tales: a young Jewish exile named Daniel and his three companions, Shadrach, Meshach, and Abednego, serve in the Babylonian and Persian royal courts, refuse to compromise their faith, and are delivered from furnace and lions' den by the God of Israel. These stories are among the most memorable in the Hebrew Bible and the source of half a dozen English idioms. They are also, in their second-century compositional context, coded models for a Jewish community under the persecution of Antiochus IV Epiphanes — showing what faithful resistance looks like and promising that God is faithful to those who are faithful to him.`,
    `The second half — chapters 7 through 12 — is apocalyptic visions: four great beasts rising from the sea, an Ancient of Days seated on a throne of fire, one like a son of man coming with the clouds of heaven and being given an everlasting kingdom. These chapters founded a literary genre — biblical apocalyptic — that shaped the Qumran literature, the New Testament book of Revelation, and Christian iconography for two millennia. The dating of the book is the most contested question in the Hebrew canon: traditional readers date it to the sixth century BCE and Daniel himself; the modern critical consensus dates it to around 165 BCE, the height of the Maccabean crisis, reading it as vaticinium ex eventu — prophecy after the fact — a genre in which visions of what has already happened are set in the mouth of a figure from the deep past. The book's theological power does not finally depend on which dating one accepts. What it requires is that readers know the question is there.`,
  ],

  chaptersSubtitle: 'All 12 chapters — court tales (1–6) and apocalyptic visions (7–12).',
  chaptersLead: `<p>Daniel divides cleanly in half. Chapters 1–6 are the court tales: Daniel refuses the king's food (1), interprets the dream of the great image (2), watches his companions walk out of the furnace (3), interprets the second dream and the madness (4), reads the writing on the wall at Belshazzar's feast (5), and survives the lions' den under Darius the Mede (6). Then the book shifts register entirely. Chapters 7–12 are apocalyptic visions: the four beasts and the son of man (7), the ram and the goat (8), the seventy weeks and Gabriel's oracle (9), the delayed heavenly messenger (10), the detailed account of the wars of the kings (11), and the resurrection of the dead (12). The Hebrew-Aramaic-Hebrew language pattern (Hebrew in 1:1–2:4a and 8–12; Aramaic in between) is one of the book's structural mysteries.</p>`,

  themesByline: 'Five threads through the book',
  themesLead: `Daniel is a book about what happens when the world's empires press down on the people of God — and about what, according to its visions, happens after. The court tales ask how faithful Jews live in a foreign court; the apocalyptic chapters ask what the arc of history looks like from above.`,

  groups: [
    { label: 'Court tales · Chs 1–6', subtitle: 'Exile, refusal, deliverance. Four young men in the courts of Nebuchadnezzar, Belshazzar, and Darius the Mede.', chapters: [1, 2, 3, 4, 5, 6] },
    { label: 'Apocalyptic visions · Chs 7–12', subtitle: 'Beasts from the sea, a throne of fire, a heavenly messenger, and the resurrection of the dead.', chapters: [7, 8, 9, 10, 11, 12] },
  ],

  themes: [
    {
      slug: 'dating-question',
      title: 'The dating question',
      greek: 'written in the sixth century or the second?',
      preview: 'The most contested question of any book in the Hebrew canon. Traditional readers date Daniel to the sixth century BCE and treat the visions as genuine predictive prophecy. The modern critical consensus dates the book to around 165 BCE, during the Maccabean crisis, and reads the visions as vaticinium ex eventu — prophecy after the fact.',
      essay: [
        `The book of Daniel is set in the sixth century BCE, in the royal courts of Nebuchadnezzar, Belshazzar, and Darius the Mede. The traditional view, held without serious challenge until the third-century philosopher Porphyry, is that the book was composed in the sixth century by Daniel himself and that the visions of chapters 7–12 are genuine predictive prophecy concerning events that would unfold over the next four centuries.`,
        `The critical view, developed by virtually every academic biblical scholar since the early nineteenth century, dates the book in its present form to around 165 BCE, during the persecution of the Jews by Antiochus IV Epiphanes. The evidence is cumulative. The Aramaic of the book contains Persian and Greek loanwords that did not enter the language until well after the sixth century. The historical knowledge of the sixth century is partial and confused — Belshazzar is presented as Nebuchadnezzar's son and the king of Babylon, when in fact he was the son of Nabonidus and served as regent, never holding the title of king; Darius the Mede has no clear historical referent. The historical knowledge of the second century, by contrast, is precise to a striking degree, especially in chapter 11, where the wars of the Ptolemaic and Seleucid kingdoms are tracked with the kind of detail that suggests an author writing from inside the period.`,
        `The convention used to make sense of this is vaticinium ex eventu — prophecy after the fact — a known and respected genre in the ancient Near East, in which a writer composes a work in the voice of an ancient figure and gives him visions of events that have already happened by the writer's day. The point is not to deceive but to set the present moment in a deep historical frame: what is happening now has been part of God's plan all along, and the community in crisis can be assured that their suffering is not random and will not last forever.`,
        `The traditional view has continued to have defenders, and the dating question remains theologically loaded for some communities. The most thoughtful modern approach holds the question open enough to read the book in both registers — as set in the sixth century, as composed in the second — and recognizes that the literary and theological power of the book is not finally dependent on which dating one accepts. What it does require is that the reader knows the question is there.`,
      ],
      where: [
        { n: 5, label: 'Daniel 5 (Belshazzar, the confused history)' },
        { n: 7, label: 'Daniel 7 (the four empires vision)' },
        { n: 9, label: 'Daniel 9 (the seventy weeks oracle)' },
        { n: 11, label: 'Daniel 11 (vaticinium ex eventu at its most precise)' },
      ],
    },
    {
      slug: 'court-tales',
      title: 'The court tales',
      greek: '"Our God is able to deliver us — but if not"',
      preview: 'Chapters 1–6 are among the most memorable narrative passages in the Hebrew Bible. A foreign king makes a demand. A Jewish exile refuses, on grounds of fidelity to God. A crisis ensues. God intervenes. The king acknowledges the God of Israel. The pattern repeats six times with variations — and each time the theological stakes tighten.',
      essay: [
        `The structure of the court tales is recurrent. A foreign king sets a test or makes a demand. A Jewish exile — Daniel, or his three companions, or the Jewish community as a whole — refuses to comply, on the grounds of fidelity to the God of Israel. A crisis ensues: the test fails, the king is enraged, the punishment is set. God intervenes: the dream is interpreted, the furnace does not burn, the lions do not eat. The king acknowledges the God of Israel as the true God. The exile is honoured.`,
        `The theological argument behind the tales is precise. The Jewish exile community, dispersed in the diaspora and serving foreign kings, faces the question of how to remain faithful to the God of Israel while living and working in a foreign court, eating foreign food, surrounded by foreign wisdom. The tales answer that fidelity is possible, that it costs (the furnace, the lions, the threat of execution), and that God is faithful to those who are faithful to him.`,
        `The most concentrated statement of this theology is the speech Shadrach, Meshach, and Abednego give to Nebuchadnezzar before the furnace in chapter 3: our God whom we serve is able to deliver us from the burning fiery furnace, and he will deliver us out of your hand, O king. But if not, be it known to you, O king, that we will not serve your gods, nor worship the golden image you have set up. The "but if not" is one of the most theologically careful phrases in the book. Fidelity is required regardless of outcome. The deliverance is not promised in the form expected. It is — in the tales themselves — granted; in the second-century compositional context, whether deliverance would come for the actual Maccabean Jews was still open.`,
        `In their second-century setting, the tales are also coded models for a community under Antiochus IV's persecutions, which (as recorded in 1 Maccabees 1) demanded that the Jews abandon the food laws, profane the sabbath, eat unclean food, and sacrifice swine in the temple. Daniel refusing the king's food, the three young men refusing the king's image, Daniel continuing to pray toward Jerusalem in defiance of the king's decree — these are models of what faithful resistance looks like, and reassurances that God will eventually deliver his people.`,
      ],
      where: [
        { n: 1, label: 'Daniel 1 (the food refusal)' },
        { n: 3, label: 'Daniel 3 (the fiery furnace — "but if not")' },
        { n: 5, label: 'Daniel 5 (the writing on the wall)' },
        { n: 6, label: 'Daniel 6 (the lions\' den)' },
      ],
    },
    {
      slug: 'apocalyptic-visions',
      title: 'The apocalyptic visions',
      greek: 'four beasts, a throne of fire, an everlasting kingdom',
      preview: 'Chapters 7–12 are the founding text of biblical apocalyptic literature. A seer is granted a vision of cosmic forces — beasts, kings, angels, heavenly courts — representing the historical and political situation in symbolic terms. An angelic interpreter explains. The vision culminates in the final intervention of God to bring history to a conclusion.',
      essay: [
        `The second half of Daniel — chapters 7 through 12 — is the most sustained apocalyptic literature in the Hebrew Bible and the founding text of a genre that would become enormously influential in the following centuries: the apocrypha and pseudepigrapha, the Qumran literature, and the New Testament book of Revelation all draw from it. The visions follow a pattern that became conventional in apocalyptic literature: a seer receives a vision of cosmic forces representing the historical and political situation in symbolic terms; an angelic interpreter explains the symbols; the vision culminates in God's final intervention to bring history to a conclusion.`,
        `Chapter 7 sets the pattern. Daniel sees four great beasts come up out of the sea — a lion with eagle's wings, a bear with three ribs in its mouth, a leopard with four wings and four heads, and a fourth beast terrible and dreadful with iron teeth and ten horns, from among which a little horn comes up with eyes like a man's and a mouth speaking great things. The four beasts represent four successive empires. The little horn represents a particular king of the fourth empire — Antiochus IV Epiphanes, on the second-century reading; a future eschatological figure, on the traditional reading. Then the scene shifts: the Ancient of Days takes his seat on a throne of fire, the books are opened, the fourth beast is killed, and one like a son of man comes with the clouds of heaven and is given an everlasting kingdom.`,
        `Chapters 8, 9, and 10–12 develop the same theological argument with different symbolic vocabularies. Chapter 8 uses the ram and the goat — interpreted explicitly as the kingdoms of Media-Persia and Greece. Chapter 9 uses the oracle of seventy weeks, delivered by Gabriel in response to Daniel's prayer for the end of exile. Chapters 10–12 are the longest sustained vision, in which an angelic messenger traces the wars of the Hellenistic kingdoms with extraordinary precision — and closes with the first explicit affirmation of bodily resurrection in the Hebrew Bible.`,
        `The theological purpose of all this is the same as the court tales, but at cosmic scale. The empires of the world rise and fall. The latest and most terrible — the Seleucid kingdom, the little horn — is set against the saints of the Most High. But God's judgement is coming, the beast will be destroyed, and the kingdom will be given to the people of the saints. The apocalyptic mode the book invented has had a longer afterlife than any other formal innovation of the Hebrew Bible. Chapter 7 is its founding text.`,
      ],
      where: [
        { n: 7, label: 'Daniel 7 (the four beasts and the son of man)' },
        { n: 8, label: 'Daniel 8 (the ram and the goat)' },
        { n: 9, label: 'Daniel 9 (the seventy weeks)' },
        { n: 12, label: 'Daniel 12 (the resurrection)' },
      ],
    },
    {
      slug: 'son-of-man',
      title: 'The son of man',
      greek: '"One like a son of man came with the clouds of heaven"',
      preview: 'The phrase appears in Daniel 7:13 and is one of the most theologically consequential in the entire Bible. In ordinary Aramaic usage it simply means a human being — the contrast is between the beasts (the empires of the world) and the human-like figure (what comes after). Every later use of the title, including Jesus\'s most common self-designation in the Gospels, draws from this passage.',
      essay: [
        `The phrase one like a son of man — in Aramaic, bar enasha — appears in Daniel 7:13 in the context of the heavenly courtroom scene at the centre of the chapter 7 vision. The four beasts have come up out of the sea; the Ancient of Days has taken his seat on a throne of fire; the books are opened; the fourth beast is killed and its body burned. Then: I saw in the night visions, and behold, one like a son of man came with the clouds of heaven, and came to the Ancient of Days, and they brought him near before him. And there was given him dominion, and glory, and a kingdom, that all peoples, nations, and languages should serve him; his dominion is an everlasting dominion, which shall not pass away, and his kingdom that which shall not be destroyed.`,
        `In ordinary Aramaic and Hebrew usage, son of man simply means a human being. The contrast in the vision is between the four beasts — figures of the kingdoms that have come before — and the human-like figure that comes after. The interpretation given later in the chapter identifies the figure with the saints of the Most High, who will receive the kingdom. Whether the figure is an individual messianic figure or a corporate symbol for the people of God has been one of the longest-running questions in biblical interpretation.`,
        `The corporate reading is supported by the explicit interpretation in 7:18 and 7:27 — the saints of the Most High shall take the kingdom. The individual messianic reading is supported by the language of 7:13–14 itself — one like a son of man, given dominion as a single figure, served by all peoples — and by the way the figure was read in later Jewish and Christian tradition. The Similitudes of Enoch (probably first century BCE or CE) developed the son of man as a clearly individual messianic figure with pre-existent character. In the Gospels, Jesus uses the title son of man more often than any other self-designation, consistently in echo of Daniel 7. The moment in Mark 14:62, when Jesus tells the high priest that he will see the Son of Man sitting on the right hand of power and coming with the clouds of heaven, is a direct citation of Daniel 7:13.`,
        `On the book's own terms, in the original second-century context, the son of man is best understood as a polysemous figure — corporate and individual at once — through whom the apocalyptic theology of Daniel articulates its hope for what will come after the empires. The figure has been one of the most fertile in the entire history of biblical interpretation, and the chapter remains the source from which all later readings draw.`,
      ],
      where: [
        { n: 7, label: 'Daniel 7 (the vision)' },
        { n: 7, label: 'Daniel 7:18, 7:27 (the interpretation)' },
      ],
    },
    {
      slug: 'resurrection',
      title: 'The resurrection of the dead',
      greek: '"Many who sleep in the dust shall awake"',
      preview: 'Daniel 12:2 is the first explicit affirmation of bodily resurrection in the Hebrew Bible. Earlier passages had pointed in this direction without quite saying it. Daniel says it — and the doctrine that became central to later Judaism and to Christianity has its first clear scriptural footing here.',
      essay: [
        `The resurrection passage at the end of chapter 12 is brief and decisive. Many of those who sleep in the dust of the earth shall awake, some to everlasting life and some to shame and everlasting contempt. They that be wise shall shine as the brightness of the firmament, and they that turn many to righteousness as the stars for ever and ever. These two verses are the first explicit affirmation of bodily resurrection in the Hebrew Bible.`,
        `Earlier passages had pointed in this direction without quite reaching it. The Sheol passages of the Psalms describe a shadowy underworld but rarely affirm what comes after it. The dry bones of Ezekiel 37 use resurrection language as a metaphor for national restoration. The stray hints of Isaiah 26 — your dead shall live; their bodies shall rise — are contested in their scope. Daniel 12 says it plainly, in the context of an apocalyptic vision that is explicitly about individual human beings: many of those who sleep in the dust shall awake.`,
        `The resurrection in Daniel is also discriminating: some to everlasting life, some to shame and everlasting contempt. This is the basis of the later doctrine of judgement at the resurrection — that the raising of the dead is not a general amnesty but a general accounting. The Pharisees in the Second Temple period insisted on the resurrection; the Sadducees denied it; the New Testament records Jesus defending the doctrine against the Sadducees by appeal to the Torah. Paul's entire argument in 1 Corinthians 15 — the longest sustained treatment of resurrection in the New Testament — presupposes and builds from this tradition.`,
        `The chapter closes with Daniel being told to seal up the words till the time of the end, and with the brief, almost cryptic personal exchange: but you, go your way to the end, and you shall rest, and shall stand in your lot at the end of the days. It is the last sentence of the Hebrew Bible's apocalyptic literature, and one of the most theologically charged. The promise is personal: the one who has received all these visions will himself, at the end, stand in his lot.`,
      ],
      where: [
        { n: 12, label: 'Daniel 12 (the resurrection passage)' },
        { n: 7, label: 'Daniel 7 (the everlasting kingdom as context)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Daniel', role: 'The exile and seer', body: `Taken to Babylon as a young man in 605 BCE, trained in the language and literature of the Chaldeans, given the Babylonian name Belteshazzar. The book's central figure — dream-interpreter, court official, apocalyptic seer. Refuses the king's food in chapter 1, interprets Nebuchadnezzar's dreams in chapters 2 and 4, survives the lions' den in chapter 6, and receives all four major visions of chapters 7–12. Whether the book is by him or about him is the dating question.` },
    { name: 'Shadrach, Meshach, and Abednego', role: 'Daniel\'s companions, the men of the furnace', body: `The Babylonian names given to Hananiah, Mishael, and Azariah — Daniel's three companions from the beginning. They appear in the food test of chapter 1 and most famously in chapter 3, where they refuse to worship Nebuchadnezzar's golden image and are thrown into a furnace heated seven times hotter than usual. They walk out unharmed, accompanied by a fourth figure whose form is like a son of the gods. Their speech before the furnace — our God is able to deliver us, but if not — is one of the most quoted in the book.` },
    { name: 'Nebuchadnezzar', role: 'King of Babylon', body: `The historical Nebuchadnezzar II (605–562 BCE), treated in Daniel with a literary care that makes him one of the most fully developed foreign kings in the Hebrew Bible. He dreams the dream of the great image (chapter 2), sets up the golden image and is awed when the three men survive the furnace (chapter 3), dreams the second dream of the great tree and goes mad for seven seasons (chapter 4), and ultimately praises the Most High in one of the most striking confessions in the book.` },
    { name: 'Belshazzar', role: 'Last king of Babylon in the book', body: `The king at whose feast the writing on the wall appears in chapter 5 — one of the most famous narratives in the Hebrew Bible. Historically the son of Nabonidus (not Nebuchadnezzar) and regent rather than king; Daniel treats him as Nebuchadnezzar's son and the king of Babylon. He is found wanting, and Babylon falls that same night.` },
    { name: 'Darius the Mede', role: 'The king of the lions\' den chapter', body: `The figure who takes the kingdom after Babylon falls and appears throughout chapter 6. No historical Darius the Mede is known from Persian sources; the figure is probably a literary conflation of Cyrus and Darius I. In the book he is the king who reluctantly throws Daniel into the lions' den, passes the night fasting, and finds him unharmed in the morning. His decree that all peoples in his dominion must tremble before the God of Daniel is one of the court tales' characteristic endings.` },
    { name: 'The Son of Man', role: 'The figure of chapter 7', body: `One like a son of man, coming with the clouds of heaven and given an everlasting dominion by the Ancient of Days. In ordinary Aramaic usage the phrase means simply a human being — the contrast is with the four beasts. Interpreted in chapter 7 as the saints of the Most High receiving the kingdom, but read in later Jewish and Christian tradition as an individual messianic figure. Jesus's most common self-designation in the Gospels draws from this passage.` },
  ],

  castSubtitle: 'Babylon, Persia, and the court of heaven.',
  castLead: `<p>Daniel has a relatively small cast of named figures: four Jewish exiles who appear across all six court tales, three foreign kings each anchoring one or two chapters, an angelic figure (Gabriel) who appears in chapters 8 and 9, and the symbolic figures of the apocalyptic visions — the Ancient of Days, the son of man, the four beasts. The cast of the court tales and the cast of the visions almost never overlap, which is one of the structural features that makes the book feel like two works in one.</p>`,

  castGroups: [
    {
      label: 'The Jewish exiles',
      characters: [
        {
          id: 'daniel',
          tag: 'Seer',
          name: 'Daniel',
          epithet: 'Exile, interpreter, seer',
          body: `The book's central figure. Taken to Babylon in 605 BCE, trained in the royal court, given the Babylonian name Belteshazzar. He refuses the king's food in chapter 1, interprets Nebuchadnezzar's dream of the great image in chapter 2, interprets the dream of the great tree in chapter 4, reads the writing on the wall at Belshazzar's feast in chapter 5, survives the lions' den under Darius the Mede in chapter 6, and receives all four apocalyptic visions of chapters 7–12. The book is named for him. Whether it is by him or about him is the book's central interpretive question.`,
          appears: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        },
        {
          id: 'hananiah-mishael-azariah',
          tag: 'Faithful',
          name: 'Shadrach, Meshach, and Abednego',
          epithet: 'Daniel\'s three companions',
          body: `The Babylonian names of Hananiah, Mishael, and Azariah — Daniel's three companions taken to Babylon with him in 605 BCE. They appear in the food test of chapter 1 and most famously in chapter 3, where they refuse to worship Nebuchadnezzar's great golden image in the plain of Dura. Thrown into a furnace heated seven times hotter than usual, they walk out unharmed, accompanied by a fourth figure whose form is like a son of the gods. Their speech before the furnace — our God is able to deliver us, but if not, we will not serve your gods — is one of the most theologically careful passages in the book.`,
          appears: [1, 2, 3],
        },
      ],
    },
    {
      label: 'The foreign kings',
      characters: [
        {
          id: 'nebuchadnezzar',
          tag: 'King',
          name: 'Nebuchadnezzar',
          epithet: 'King of Babylon',
          body: `The historical Nebuchadnezzar II (605–562 BCE), the conqueror who destroyed Jerusalem in 587 — the same king on whom much of Jeremiah's prophecy turns. In Daniel he is the central royal figure of chapters 1–4, treated with a literary care that makes him one of the most fully developed foreign kings in the Hebrew Bible. He dreams of the great image (chapter 2), sets up the golden image and is awed when the three men survive the furnace (chapter 3), dreams of the great tree and loses his mind for seven seasons (chapter 4), and ultimately praises the Most High in his own voice — one of the most striking confessions in the book.`,
          appears: [1, 2, 3, 4],
        },
        {
          id: 'belshazzar',
          tag: 'King',
          name: 'Belshazzar',
          epithet: 'Last king of Babylon in the book',
          body: `The king at whose feast the writing on the wall appears in chapter 5 — one of the most famous narratives in the Hebrew Bible. Historically the son of Nabonidus (not Nebuchadnezzar) and regent rather than king; Daniel treats him as Nebuchadnezzar's son and the last king of Babylon. At his great feast, he orders the gold and silver vessels taken from the Jerusalem temple to be brought in for the company to drink from — and in that hour the fingers of a man's hand write on the plaster of the wall. Weighed and found wanting. He is killed that same night.`,
          appears: [5],
        },
        {
          id: 'darius-the-mede',
          tag: 'King',
          name: 'Darius the Mede',
          epithet: 'Persian king of the lions\' den chapter',
          body: `The figure who takes the kingdom after the fall of Babylon and appears throughout chapter 6. No historical Darius the Mede is known from Persian sources; he is probably a literary conflation of Cyrus the Great and Darius I, or a figure invented to serve the narrative. In the book he is the king who, at his courtiers' urging, signs a decree that for thirty days no one may pray to any god or man other than the king — and who, after Daniel is found praying anyway, is forced to throw him into the lions' den. He passes the night fasting. In the morning Daniel is found unharmed; Darius issues a counter-decree praising the God of Daniel.`,
          appears: [5, 6],
        },
      ],
    },
    {
      label: 'The heavenly figures',
      characters: [
        {
          id: 'the-son-of-man',
          tag: 'Vision',
          tagClass: 'creature',
          name: 'The Son of Man',
          epithet: 'The figure of the chapter 7 vision',
          body: `One like a son of man — bar enasha in Aramaic — coming with the clouds of heaven and being given an everlasting dominion by the Ancient of Days. In ordinary Aramaic usage the phrase means simply a human being; the contrast in the vision is between the four beasts (the kingdoms of the world) and the human-like figure (what comes after). The chapter's own interpretation identifies the figure with the saints of the Most High who will receive the kingdom. In later Jewish and Christian tradition, the figure became an individual messianic figure — the source of Jesus's most common self-designation in the Gospels.`,
          appears: [7],
        },
        {
          id: 'gabriel',
          tag: 'Angel',
          tagClass: 'creature',
          name: 'Gabriel',
          epithet: 'The interpreting angel',
          body: `The angelic messenger who appears in chapters 8 and 9 — named explicitly in both. In chapter 8 he is sent to make Daniel understand the vision of the ram and the goat; Daniel falls on his face and the angel touches him and sets him on his feet. In chapter 9 he appears while Daniel is still at prayer and delivers the oracle of the seventy weeks in response to Daniel's prayer for the end of the exile. Gabriel appears later in the New Testament in Luke 1, where he announces the births of John the Baptist and Jesus; Daniel is the earliest canonical text in which his name appears.`,
          appears: [8, 9],
        },
      ],
    },
  ],

  chapters: chapters.map(ch => ({
    n: ch.n,
    title: ch.title,
    tourTitle: ch.tourTitle,
    hook: ch.hook,
    tour: ch.tour,
    blurb: ch.blurb,
    summary: ch.summary,
    appears: ch.appears,
    themes: ch.themes,
  })),

  chapterLabel: n => 'Daniel ' + n,
};
