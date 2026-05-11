// SEO content data for the book of Isaiah.
// 66 chapters; three compositional layers: First Isaiah (1-39, 8th c. BCE),
// Second Isaiah (40-55, Babylonian exile, 6th c. BCE),
// Third Isaiah (56-66, post-exilic). Unified book; modern scholarly consensus.
// Voice: literary, declarative present, prophetic register without sermonising.

const CHAPTERS = require('/tmp/bible-isaiah-chapters-merged.json')

module.exports = {
  id: 'bible-isaiah',
  title: 'Isaiah',
  author: 'Multiple (Isaiah ben Amoz + later voices)',
  byline: '8th–5th c. BCE · Hebrew Bible · Latter Prophets',
  titleAccent: 'a reading guide',
  hook: 'In the year King Uzziah died, a man saw the Lord seated on a throne, high and lifted up, and the train of his robe filled the temple. The book that begins there spans four centuries, three authors, two catastrophes, and a vision of redemption that has not stopped echoing.',
  genre: ['Prophecy', 'Hebrew Bible', 'Classical literature'],
  themesBlurb: 'Three Isaiahs, the Holy One, the Servant, judgement and comfort.',
  castBlurb: 'Prophets and kings',
  castDesc: 'The figures at the centre of the longest prophetic book in the Hebrew Bible.',

  about: [
    `<em>Isaiah</em> is the longest and most theologically influential of the Hebrew prophetic books. Its sixty-six chapters span four centuries of Israelite history and at least three distinct compositional layers: First Isaiah (chapters 1–39), associated with the 8th-century BCE prophet Isaiah ben Amoz, active in Jerusalem under four kings and during the Assyrian crises; Second Isaiah (40–55), composed during the Babylonian exile of the 6th century, opening with <em>comfort, comfort my people</em>; and Third Isaiah (56–66), addressed to the post-exilic community struggling to rebuild. The Suffering Servant, Immanuel, the Holy One of Israel, the new heavens and a new earth — the book's central images have shaped Jewish and Christian imagination for over two thousand years.`,
    `The three layers were bound by editors into a single sustained vision in which Israel's judgement, exile, and restoration are stages of one divine purpose. The vision in the temple in chapter 6 — the seraphim crying <em>holy, holy, holy</em>, the coal from the altar, Isaiah's sending — is the theological centre of First Isaiah. Chapter 53, the Suffering Servant, is the most quoted Hebrew Bible text in Christianity and one of the most argued-over passages in biblical scholarship. Chapter 65, <em>behold I create new heavens and a new earth</em>, is the climax of Third Isaiah and the source of Revelation 21:1. Handel built the <em>Messiah</em> mostly out of Isaiah. The KJV version of this book is among the great monuments of English prose.`,
  ],

  chaptersSubtitle: 'All 66 chapters summarized — First Isaiah, Second Isaiah, Third Isaiah, each linked to the reader.',
  chaptersLead: `<p>Isaiah is organised by its own three-part structure. First Isaiah (chapters 1–39) contains the oracles of judgement, the vision in the temple, the historical narratives of the Assyrian crisis, and the peaceable kingdom. Second Isaiah (chapters 40–55) is the great comforting arc of the exile, from <em>comfort ye</em> through to the Servant Songs and the invitation of chapter 55. Third Isaiah (chapters 56–66) addresses the post-exilic community and culminates in the vision of new heavens and a new earth.</p>`,

  themesByline: 'Five threads through the book',
  themesLead: `Isaiah is long enough that most readers do not read it as a book — they read famous passages in isolation. The themes below are threads that run across all three layers and connect those famous passages to each other.`,

  groups: [
    {
      label: 'First Isaiah · Chapters 1–39',
      subtitle: 'Oracles of judgement, the vision in the temple, Assyrian crisis, peaceable kingdom.',
      chapters: Array.from({ length: 39 }, (_, i) => i + 1),
    },
    {
      label: 'Second Isaiah · Chapters 40–55',
      subtitle: 'Comfort in exile. The Servant Songs. The invitation to the thirsty.',
      chapters: Array.from({ length: 16 }, (_, i) => i + 40),
    },
    {
      label: 'Third Isaiah · Chapters 56–66',
      subtitle: 'Post-exilic community. Universal invitation. New heavens and a new earth.',
      chapters: Array.from({ length: 11 }, (_, i) => i + 56),
    },
  ],

  chapterLabel: n => `Isaiah ${n}`,

  chapters: CHAPTERS,

  themes: [
    {
      slug: 'the-three-isaiahs-and-the-book-as-one',
      title: 'The Three Isaiahs and the Book as One',
      greek: 'three voices, one sustained vision',
      preview: 'The most important fact a modern reader of Isaiah needs to know is that the sixty-six chapters are not all from one author or one century. The differences are real. The unity is also real. Both things matter.',
      essay: [
        `The standard scholarly division of Isaiah goes back to Bernhard Duhm's 1892 commentary and has been refined but not overturned in more than a century of scholarship. First Isaiah (chapters 1–39) is associated with the 8th-century prophet Isaiah ben Amoz, a member of the Jerusalem aristocracy active under four kings of Judah, who preached judgement against social injustice and political idolatry and whose oracles were preserved by his disciples. Second Isaiah (40–55) comes from a hundred and fifty years later, during the Babylonian exile of the 6th century, addressed to a community whose temple had been destroyed and whose city was in ruins, announcing the coming return under Cyrus the Persian — named in 45:1 in a way that would be impossible for an 8th-century prophet. Third Isaiah (56–66) comes from after the return, in the early decades of Persian rule, addressed to a community struggling to rebuild and divided over questions of inclusion, ritual, and identity.`,
        `The differences are not minor. The vocabulary is different. The God-language is different. The historical references are different. The rhetorical situation is different: judgement before exile in the first section, comfort during exile in the second, contested rebuilding after exile in the third. And yet the book is one book. The editors who gave it its final form — probably in the 5th or 4th century BCE — were not unaware of the differences; they preserved them while binding the material into a sustained theological vision in which Israel's judgement, exile, and restoration are stages of a single divine purpose.`,
        `The reader who comes to the book knowing about the three layers reads better, because the differences in tone and emphasis stop being puzzles and become structural features. The reader who treats the book as a unified composition by the 8th-century prophet will find passages that simply do not fit, and will end up minimising what the book is actually doing. The historical-critical reading and the canonical reading are not opposed; they are stages in coming to know what kind of book Isaiah is.`,
      ],
      where: [
        { n: 1, label: 'Isaiah 1 (First Isaiah opens)' },
        { n: 40, label: 'Isaiah 40 (Second Isaiah opens)' },
        { n: 56, label: 'Isaiah 56 (Third Isaiah opens)' },
      ],
    },
    {
      slug: 'the-vision-in-the-temple',
      title: 'The Vision in the Temple',
      greek: '"Here am I — send me"',
      preview: 'Chapter 6 is the founding theological moment of the book. Isaiah sees the Lord seated on the throne, the seraphim cry holy three times, a coal touches his lips, and he is sent. The chapter is one of the most concentrated accounts of religious experience in any literature.',
      essay: [
        `In the year King Uzziah died — about 740 BCE — Isaiah is in the Jerusalem temple and he sees. He sees the Lord seated on a throne, high and lifted up, and the train of his robe fills the temple. Above the throne are seraphim, six-winged creatures who cover their faces and their feet and cry to one another: holy, holy, holy is the Lord of hosts; the whole earth is full of his glory. The doorposts shake. The house fills with smoke. Isaiah's response is immediate: woe is me, I am undone, for I am a man of unclean lips and I dwell among a people of unclean lips, and my eyes have seen the King, the Lord of hosts.`,
        `A seraph flies to him with a coal from the altar, touches his lips with it, and declares his iniquity taken away and his sin purged. Then he hears the voice of the Lord asking whom shall I send, and who will go for us. He answers: here am I, send me. The vision is the founding theological moment of the book and one of the most concentrated descriptions of religious experience in any literature. The threefold cry of holiness — kadosh, kadosh, kadosh — is the most concentrated affirmation of God's holiness in the Hebrew Bible. Isaiah's response — I am undone, my lips are unclean — is the recognition that no preparation makes one ready for what he has seen.`,
        `The cleansing by the coal is the divine answer: God himself provides what one cannot provide for oneself. The commissioning that follows is structurally important: the prophet is sent only after the cleansing, and the cleansing happens at God's initiative, not the prophet's. Holy, holy, holy has entered the liturgy of every Christian tradition and the Jewish kedushah, and the chapter has become one of the deepest wells of religious art in Western culture.`,
      ],
      where: [
        { n: 6, label: 'Isaiah 6 (the vision itself)' },
        { n: 11, label: 'Isaiah 11 (the peaceable kingdom)' },
        { n: 40, label: 'Isaiah 40 (comfort my people)' },
      ],
    },
    {
      slug: 'the-suffering-servant',
      title: 'The Suffering Servant',
      greek: '"He was wounded for our transgressions"',
      preview: 'The four Servant Songs in Second Isaiah (42, 49, 50, 52–53) depict a figure who suffers, is rejected, and through whose suffering many are made righteous. Who the Servant is has been one of the longest-running interpretive questions in the history of biblical scholarship.',
      essay: [
        `The four Servant Songs in Second Isaiah — 42:1–9, 49:1–6, 50:4–9, and 52:13–53:12 — depict a figure whom God calls his servant, who is chosen, given a mission to the nations, who suffers, who is rejected and afflicted, and through whose suffering many are made righteous. The fourth and longest of these — chapter 53 — is among the most quoted passages in the Hebrew Bible: he is despised and rejected of men, a man of sorrows and acquainted with grief; he was wounded for our transgressions, he was bruised for our iniquities, the chastisement of our peace was upon him, and with his stripes we are healed.`,
        `Who the Servant is has been one of the longest-running interpretive questions in the history of biblical scholarship. The dominant later Jewish reading has identified the Servant with Israel — the people of Israel as a corporate figure, suffering at the hands of the nations and through that suffering bringing knowledge of God to them. The corporate identification is supported by the explicit statement in 49:3: thou art my servant, O Israel. The Christian reading from the New Testament onward has identified the Servant with Jesus; the chapter is quoted directly in Acts 8 and has shaped Christian atonement theology from Paul onward.`,
        `The most careful contemporary scholarship reads the Servant as a figure who carries within him both meanings — corporate and individual — and through whom Second Isaiah is working out a new theology of redemptive suffering. The Christian reading, on this view, is one ancient appropriation of a figure who was already polysemous in his original setting. The chapter is too rich for any single reading to exhaust it, and the most fruitful approach is to listen to the passage with all its readers — Jewish, Christian, and modern — at once.`,
      ],
      where: [
        { n: 42, label: 'Isaiah 42 (First Servant Song)' },
        { n: 49, label: 'Isaiah 49 (Second and Third Songs)' },
        { n: 53, label: 'Isaiah 53 (the Suffering Servant)' },
      ],
    },
    {
      slug: 'the-holy-one-of-israel',
      title: 'The Holy One of Israel',
      greek: 'transcendence and covenant in four words',
      preview: 'The most distinctive divine title in the book — occurring about twenty-five times, and only rarely elsewhere in the Hebrew Bible. The title binds two ideas that sit in tension: God\'s radical otherness and his covenanted commitment to a particular people.',
      essay: [
        `The Holy One of Israel occurs about twenty-five times in Isaiah and only a handful of times in the rest of the Hebrew Bible. The title concentrates the book's whole theology into four words. To call God holy is to insist on his radical otherness, his transcendence, his separation from everything created and everything fallen. To call him the Holy One of Israel is to insist that this transcendent God has bound himself to a particular people, has entered into covenant with them, has acted in their history, and remains involved in it.`,
        `The title runs across the three compositional layers and is one of the strongest threads of theological continuity between First, Second, and Third Isaiah. In First Isaiah it appears in oracles of judgement: Israel has rebelled against the Holy One of Israel and the consequences will be terrible. In Second Isaiah it appears in oracles of comfort and redemption: the Holy One of Israel as Redeemer, the one who will bring the people back from exile. In Third Isaiah it appears in oracles of restoration. The book moves between the language of awe — the seraphim crying holy, holy, holy in chapter 6 — and the language of intimate care — comfort, comfort my people in chapter 40 — and the title is the theological hinge that makes the same God the source of both.`,
        `A merely transcendent God could not redeem; he could only judge and remain inaccessible. A merely immanent God could not redeem either; he would be no more than a tribal patron. The God of Isaiah is both transcendent enough to judge with absolute justice and immanent enough to act in history with covenant fidelity. Once the reader hears the title, the book's whole rhetorical structure begins to make sense.`,
      ],
      where: [
        { n: 1, label: 'Isaiah 1 (first use in judgement)' },
        { n: 41, label: 'Isaiah 41 (Holy One as Redeemer)' },
        { n: 60, label: 'Isaiah 60 (Third Isaiah, restoration)' },
      ],
    },
    {
      slug: 'new-heavens-and-a-new-earth',
      title: 'New Heavens and a New Earth',
      greek: '"Behold, I create new heavens and a new earth"',
      preview: 'The closing chapters of Third Isaiah culminate in one of the most extraordinary visions of the future in any ancient text. Chapter 65 is the source of Revelation 21:1 and of the entire Christian and Jewish tradition of the world to come.',
      essay: [
        `The closing chapters of the book — Third Isaiah, 56–66, addressed to the post-exilic community — culminate in one of the most extraordinary visions of the future in any ancient text. In 65:17 God declares: behold, I create new heavens and a new earth, and the former shall not be remembered, nor come into mind. The vision unfolds across the rest of the chapter and into chapter 66. Jerusalem will be a place of joy. The voice of weeping will not be heard there any more, nor the voice of crying. The infant will not die in infancy, the old man will live out his days. They will build houses and inhabit them, plant vineyards and eat their fruit. The wolf and the lamb will feed together, the lion will eat straw like the ox. None will hurt or destroy in all my holy mountain.`,
        `The vision draws on language from earlier in the book — the peaceable kingdom of chapter 11, the comfort of chapter 40 — and pushes it further. What is described is not merely a restored Jerusalem but a re-creation of the cosmos in which the conditions of fallen life have been undone. The vision has been one of the most influential single passages in the development of biblical eschatology. It runs through the Jewish tradition of the world to come, through the apocalyptic literature of the late Second Temple period, through the New Testament: Revelation 21:1 quotes it directly — I saw a new heaven and a new earth, for the first heaven and the first earth had passed away.`,
        `The careful reader notices how the vision is grounded. It is not a vision of escape from the world; it is a vision of the world remade. The new earth is still earth. There are still houses and vineyards and infants and old men. The redemption Third Isaiah envisages is not the abandonment of the material conditions of human life but their healing. This is one of the deepest theological gifts of the prophetic tradition to its later inheritors: the conviction that what God will do at the end is not the negation of creation but its perfection.`,
      ],
      where: [
        { n: 11, label: 'Isaiah 11 (peaceable kingdom, First Isaiah)' },
        { n: 65, label: 'Isaiah 65 (new heavens and new earth)' },
        { n: 66, label: 'Isaiah 66 (all flesh shall worship)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Isaiah ben Amoz',
      role: 'Prophet of Jerusalem',
      body: `The 8th-century BCE prophet whose name the book bears. Active in Jerusalem from about 740 to 700, during the reigns of Uzziah, Jotham, Ahaz, and Hezekiah — a member of the aristocracy with access to the royal court, father of two sons with symbolic prophetic names (Shear-jashub, Maher-shalal-hash-baz). He is the prophet of First Isaiah (chapters 1–39); the later sections come from disciples and successors who continued his tradition through the Babylonian exile. Tradition holds he was martyred under Manasseh, sawn in half — alluded to in Hebrews 11:37.`,
    },
    {
      name: 'Hezekiah',
      role: 'King of Judah',
      body: `King of Judah from about 715 to 686 BCE, the central royal figure of First Isaiah. Religiously reforming and politically embattled, he is the king who in 701 faces the Assyrian invasion under Sennacherib. The narrative in chapters 36–37 describes the crisis: the Assyrian commander mocks Judah's trust in their God; Hezekiah spreads the enemy's letter before the Lord and prays; Isaiah's oracle announces deliverance. Hezekiah is one of the most fully drawn kings in the Hebrew Bible and stands as the type of the king who trusts the Holy One of Israel rather than political alliance.`,
    },
    {
      name: 'The Suffering Servant',
      role: 'Mysterious figure of Second Isaiah',
      body: `The figure who appears in the four Servant Songs of Second Isaiah (42, 49, 50, 52–53). Identified as Israel in 49:3, yet given a mission to Israel in 49:5–6 that complicates the simple identification. He is chosen, beloved, given the spirit, sent to the nations as a light; rejected, despised, afflicted, wounded, killed; through his suffering many are made righteous. Jewish tradition reads him primarily as the figure of Israel; Christian tradition reads him as a prefiguration of Christ. Modern scholarship reads him as a polysemous figure working out a new theology of redemptive suffering.`,
    },
    {
      name: 'Cyrus the Great',
      role: 'Anointed Persian king',
      body: `The Persian king who conquered Babylon in 538 BCE and permitted the Jewish exiles to return to their land. Named directly in Isaiah 45:1 — "Thus says the Lord to his anointed, to Cyrus" — in a passage that must have been written during or in anticipation of the exile, over a century after the historical Isaiah. The fact that a pagan king is called God's anointed is one of the most theologically striking moments in Second Isaiah and is central to the argument that Isaiah 40–55 is exilic material.`,
    },
    {
      name: 'Sennacherib',
      role: 'Assyrian king',
      body: `King of Assyria from 705 to 681 BCE, the great enemy of First Isaiah. His invasion of Judah in 701 — during which he took forty-six walled cities but did not take Jerusalem — forms the centre of the historical narrative section (chapters 36–37). His own annals record shutting Hezekiah up "like a bird in a cage in Jerusalem" without recording the city's fall. He returns to Nineveh and is later assassinated by his own sons, confirming Isaiah's earlier oracle.`,
    },
    {
      name: 'The Holy One of Israel',
      role: 'God as named in the book',
      body: `The distinctive divine title that occurs about twenty-five times in Isaiah and only rarely elsewhere in the Hebrew Bible. The title concentrates the book's theology into four words: God is holy — radically other, transcendent — and is the Holy One of Israel — covenanted to a particular people, acting in their history. The title runs across all three compositional layers. In First Isaiah it appears in judgement; in Second Isaiah in comfort and redemption; in Third Isaiah in restoration. It is the theological hinge between the language of awe (the seraphim in chapter 6) and the language of intimate care (the shepherd in chapter 40).`,
    },
  ],

  castSubtitle: 'Prophets, kings, and the mysterious Servant.',
  castLead: `<p>Isaiah's cast is not a cast in the narrative sense — most of the book is oracular poetry, not story. The figures below are those the book centres on or addresses: the 8th-century prophet himself, the kings he counsels and confronts, the mysterious Servant of Second Isaiah, and the God who is named above all others as the Holy One of Israel.</p>`,

  castGroups: [
    {
      label: 'The prophet and his contemporaries',
      characters: [
        {
          id: 'isaiah-ben-amoz',
          tag: 'Prophet',
          name: 'Isaiah ben Amoz',
          epithet: 'Seer in Jerusalem',
          body: `The 8th-century BCE prophet of First Isaiah. Active from about 740 to 700, during the reigns of four kings of Judah. He sees the Lord in the temple in chapter 6, preaches judgement against social injustice and against Egypt as a political ally, and advises Hezekiah during the Assyrian crisis. His disciples preserved and extended his oracles into the tradition that became the whole book.`,
          appears: [1, 6, 7, 8, 36, 37, 38, 39],
        },
        {
          id: 'hezekiah',
          tag: 'King',
          name: 'Hezekiah',
          epithet: 'King of Judah, reformer',
          body: `The king who receives both the prophet's deepest trust and the book's most extended royal narrative. He confronts the Assyrian invasion of 701, prays in the temple, receives Isaiah's oracle of deliverance, falls ill and recovers, and is warned — after showing his treasury to the Babylonian envoys — that the coming exile will be to Babylon. The type of the king who trusts God rather than foreign alliance.`,
          appears: [36, 37, 38, 39],
        },
        {
          id: 'sennacherib',
          tag: 'King',
          name: 'Sennacherib',
          epithet: 'Assyrian king, the besieging enemy',
          body: `King of Assyria, the historical antagonist of First Isaiah's narrative section. His invasion of 701 is the crisis that the prophet's word of trust answers. His annals confirm the siege of Jerusalem; the city was not taken. He returns to Nineveh and is assassinated by his sons (37:38), fulfilling Isaiah's oracle precisely.`,
          appears: [36, 37],
        },
        {
          id: 'ahaz',
          tag: 'King',
          name: 'Ahaz',
          epithet: 'King of Judah, the fearful',
          body: `The king to whom Isaiah delivers the Immanuel sign in chapter 7, during the Syro-Ephraimite crisis of 735–732 BCE. Where Hezekiah trusts Isaiah's word, Ahaz is the foil: afraid, unwilling to ask a sign, seeking Egyptian and Assyrian alliance instead of the prophet's counsel. The contrast between Ahaz and Hezekiah structures much of First Isaiah's understanding of kingship.`,
          appears: [7, 8],
        },
      ],
    },
    {
      label: 'Figures of Second and Third Isaiah',
      characters: [
        {
          id: 'the-suffering-servant',
          tag: 'Figure',
          name: 'The Suffering Servant',
          epithet: 'Chosen, afflicted, vindicated',
          body: `The figure of the four Servant Songs (42, 49, 50, 52–53). Not a character in a narrative but a figure invoked in oracular poetry, whose identity is left precisely ambiguous: Israel in 49:3, yet given a mission to Israel in 49:5–6. He bears the iniquity of many through suffering. His interpretive history — read as Israel by Jewish tradition, as the Messiah and then as Christ by Christian tradition — is one of the most consequential in all of religious literature.`,
          appears: [42, 49, 50, 52, 53],
        },
        {
          id: 'cyrus',
          tag: 'King',
          name: 'Cyrus the Great',
          epithet: "God's anointed Persian king",
          body: `Named in 45:1 as the Lord's anointed — the only non-Israelite given this title in the Hebrew Bible. The Persian king who conquered Babylon in 538 BCE and issued the decree permitting Jewish exiles to return. Second Isaiah presents him as the instrument of God's redemptive purpose, chosen by name before he was born. The theological audacity of this claim — that God names and uses a pagan conqueror as his anointed — is central to Second Isaiah's universalist theology.`,
          appears: [44, 45],
        },
        {
          id: 'the-holy-one-of-israel',
          tag: 'God',
          name: 'The Holy One of Israel',
          epithet: 'Divine title, transcendent and covenanted',
          body: `The most distinctive divine title in the book, occurring about twenty-five times. In First Isaiah: judge. In Second Isaiah: redeemer, shepherd, comforter. In Third Isaiah: glorifier of the new Jerusalem. The same God in all three registers — and the title itself is what holds the three Isaiahs together. He fills the temple with his train in chapter 6 and tends his flock like a shepherd in chapter 40, and both are the same Holy One.`,
          appears: [1, 6, 40, 41, 43, 45, 60, 65],
        },
      ],
    },
  ],
}
