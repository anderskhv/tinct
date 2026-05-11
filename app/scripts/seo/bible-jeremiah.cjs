// SEO content data for the book of Jeremiah.
// 52 chapters; 7th-6th century BCE prophet of Anathoth, with Baruch as scribe.
// The longest book in the Bible by word count. Often called the weeping prophet.
// Voice: literary, declarative present, attentive to the prophet's interior anguish.

const chaptersData = require('/tmp/bible-jeremiah-chapters-merged.json');

module.exports = {
  id: 'bible-jeremiah',
  title: 'Jeremiah',
  author: 'Jeremiah ben Hilkiah (with Baruch as scribe)',
  byline: 'late 7th–early 6th c. BCE · Hebrew Bible · Latter Prophets',
  titleAccent: 'a guided tour',
  hook: 'A boy from a priestly family in Anathoth is told he was set apart before birth and appointed a prophet to the nations. He protests that he cannot speak. For forty years he does nothing but speak — and watches the city he loves fall.',

  genre: ['Prophecy', 'Hebrew Bible', 'Ancient literature'],

  about: [
    `<em>Jeremiah</em> is the longest book in the Bible by word count and the most psychologically intimate of the prophetic books. A young man from Anathoth, a small priestly town three miles north-east of Jerusalem, is called by God around 627 BCE and preaches for more than forty years — through the slow collapse of the kingdom of Judah, through the Babylonian conquest of 587, through the destruction of the temple — until he is dragged into Egyptian exile against his will. The book he leaves behind preserves his oracles, his symbolic actions, and his confessions: six passages scattered through chapters 11–20 in which the prophet quarrels with his own calling in a register that has no parallel in any other prophetic book.`,
    `What makes <em>Jeremiah</em> unlike any other prophetic book is the quality of its interiority. The reluctant prophet who answered God's call with <em>ah Lord God, I cannot speak, for I am a child</em> spent forty years trying to hold the word back and discovering he could not. Chapter 31 contains the new covenant oracle, the source of the phrase that names the Christian New Testament. Chapter 32 records the prophet buying a field at Anathoth during the Babylonian siege — an act of hope in the middle of the worst hour. Chapter 36 describes the burning of the scroll by King Jehoiakim and the dictation of it all again, longer. The book is a document of what it costs to tell the truth for forty years to people who do not want to hear it.`,
  ],

  chaptersSubtitle: 'All 52 chapters, from the call to the fall and its aftermath.',
  chaptersLead: `<p>Jeremiah is not strictly chronological — oracles from different reigns are grouped thematically rather than in sequence. The book falls into four broad movements: the oracles of judgment against Judah in chapters 1–25; the biographical narratives of the prophet's confrontations, imprisonments, and the fall of Jerusalem in chapters 26–45; the oracles against foreign nations in chapters 46–51; and the historical appendix in chapter 52, nearly identical to 2 Kings 24–25, which closes the book with the destruction of Jerusalem and the eventual release of King Jehoiachin from Babylonian prison.</p>`,

  themesByline: 'Five threads through the book',
  themesLead: `Jeremiah is the most personal prophetic book in the Hebrew canon — not despite its forty years of judgment oracles, but because of them. These are the threads that hold the book together.`,

  groups: [
    {
      label: 'The Call and Early Oracles · chs 1–25',
      subtitle: 'The commission, the indictments of Judah, and the confessions.',
      chapters: Array.from({ length: 25 }, (_, i) => i + 1),
    },
    {
      label: 'Narratives and the Book of Consolation · chs 26–45',
      subtitle: 'The temple sermon aftermath, Hananiah, the new covenant, the siege and fall.',
      chapters: Array.from({ length: 20 }, (_, i) => i + 26),
    },
    {
      label: 'Oracles Against the Nations · chs 46–51',
      subtitle: 'Egypt, Philistia, Moab, Ammon, Edom, Damascus, Kedar, Elam, Babylon.',
      chapters: Array.from({ length: 6 }, (_, i) => i + 46),
    },
    {
      label: 'Historical Appendix · ch 52',
      subtitle: 'The fall of Jerusalem retold; Jehoiachin released from Babylonian prison.',
      chapters: [52],
    },
  ],

  themes: [
    {
      slug: 'the-reluctant-prophet',
      title: 'The Reluctant Prophet',
      greek: '"Ah Lord God, I cannot speak, for I am a child"',
      preview: 'Jeremiah is the prophet who did not want to be one. The refusal in chapter 1 runs through the whole book. Forty years later, in chapter 20, he curses the day he was born. In between, the confessions chart what genuine prophetic vocation costs a man who has no choice but to carry it.',
      essay: [
        `Jeremiah is the prophet who did not want to be one. The call narrative in chapter 1 is the most explicit refusal of a prophetic vocation in the Hebrew Bible. God tells the young man from Anathoth that he had known him before he formed him in the womb, that he had set him apart before he was born, that he had appointed him a prophet to the nations. Jeremiah answers: <em>ah Lord God, behold I cannot speak, for I am a child.</em> The protest is not formal humility; it runs through the whole book.`,
        `Forty years later, in the despairing confession of chapter 20, the prophet says: <em>cursed be the day in which I was born; let not the day in which my mother bore me be blessed. Why came I forth out of the womb to see labour and sorrow, that my days should be consumed with shame?</em> In between these passages, in the so-called confessions scattered through chapters 11–20, the prophet returns again and again to the same complaint — that the calling has destroyed his life, that his message is hated, that he has tried to stop speaking it and cannot, that the word is in his bones like a fire and he is weary with holding it in.`,
        `Jeremiah is also the prophet most clearly hated by his own people. He is forbidden to marry — a sign that there will be no future in the land. He is beaten and put in stocks by the priest Pashhur (chapter 20). He is nearly killed by a mob after the temple sermon (chapter 26). He is accused of treason during the siege, lowered into a muddy cistern, rescued by a foreign eunuch (chapter 38). He is dragged into Egyptian exile against his will (chapter 43). The personal cost of the prophetic vocation is shown in Jeremiah more fully than in any other prophet.`,
        `The book is also the place in scripture where the question of whether a true prophet might genuinely curse his calling is taken absolutely seriously. The answer the book gives is that he might, and that the curse is part of what genuine prophecy under impossible conditions sounds like. The confessions preserve the experience of being a prophet from the inside, as the prophet himself felt it, in moments when no other prophet's voice reaches the page.`,
      ],
      where: [
        { n: 1, label: 'Chapter 1 (the call and refusal)' },
        { n: 11, label: 'Chapter 11 (first confession)' },
        { n: 15, label: 'Chapter 15 (the recommissioning)' },
        { n: 20, label: 'Chapter 20 (cursed be the day)' },
      ],
    },
    {
      slug: 'the-temple-sermon',
      title: 'The Temple Sermon',
      greek: '"My house is become a den of robbers"',
      preview: 'Jeremiah stands at the gate of the Lord\'s house and tells the worshippers that the temple will not save them if they do not amend their ways. The sermon is nearly kills him. Twenty-two years later, the temple is burned to the ground.',
      essay: [
        `Chapter 7 contains one of the most controversial sermons in the Hebrew Bible. Jeremiah is told to stand in the gate of the Lord's house and address the worshippers entering it. The message he delivers is shocking. The people, he says, have made the temple a kind of magic charm. They believe that because the temple is there, and because they offer sacrifices, the city is safe — that the holy place itself guarantees God's protection regardless of how they live. It does not. The temple is the temple of the Lord only if its worshippers are honest in business, kind to the stranger, the orphan, and the widow, and faithful in covenant.`,
        `If they are not — if they steal, murder, commit adultery, swear falsely, burn incense to Baal, walk after other gods — then the temple will not save them. God can do to this house, Jeremiah says, what he did to Shiloh, the old central sanctuary of the northern tribes that had been destroyed centuries before. The reaction is violent. Chapter 26 — the narrative complement to the sermon — describes the priests, the prophets, and the people seizing Jeremiah after the sermon and calling for his death. It is only the intervention of certain elders that saves him.`,
        `The temple sermon is one of the most theologically consequential prophetic acts in the Hebrew Bible. Jesus later cites it directly. In Mark 11:17, when Jesus drives the moneychangers from the temple in Jerusalem, the line he quotes — <em>my house shall be called a house of prayer for all nations, but you have made it a den of robbers</em> — is from Jeremiah 7:11. The structural argument behind the citation is the same: the temple as institution does not guarantee God's presence; the people's covenant fidelity does.`,
        `The sermon was delivered probably in 609 BCE, near the start of Jehoiakim's reign. Twenty-two years later, the temple Jeremiah had stood in was burned to the ground by the Babylonians. The book treats the burning, with bitter restraint, as the long-deferred answer to the sermon.`,
      ],
      where: [
        { n: 7, label: 'Chapter 7 (the sermon)' },
        { n: 19, label: 'Chapter 19 (the broken flask)' },
        { n: 26, label: 'Chapter 26 (the aftermath; near execution)' },
        { n: 39, label: 'Chapter 39 (the fall of Jerusalem)' },
      ],
    },
    {
      slug: 'the-new-covenant',
      title: 'The New Covenant',
      greek: '"I will write it in their hearts"',
      preview: 'In chapter 31, in the middle of the exile oracles, Jeremiah delivers the promise that gives the New Testament its name. The old covenant, written on stone tablets, has been broken. The new one will be written on hearts.',
      essay: [
        `In the middle of the book, in chapter 31, set against the backdrop of the coming exile, Jeremiah delivers one of the most theologically influential oracles in the Hebrew Bible. <em>Behold, the days come, says the Lord, that I will make a new covenant with the house of Israel and with the house of Judah; not according to the covenant that I made with their fathers, in the day that I took them by the hand to bring them out of the land of Egypt — which my covenant they brake, although I was a husband unto them.</em>`,
        `<em>But this shall be the covenant that I will make: I will put my law in their inward parts, and write it in their hearts; and will be their God, and they shall be my people. They shall teach no more every man his neighbour, saying, Know the Lord, for they shall all know me, from the least of them unto the greatest of them; for I will forgive their iniquity, and remember their sin no more.</em> The oracle is the source of the phrase <em>the new covenant</em> — in Greek, <em>kaine diatheke</em>, in Latin, <em>novum testamentum</em> — from which the New Testament takes its name.`,
        `The Christian tradition from Jesus onward has read the oracle as the announcement of what Christ would inaugurate — the words <em>this is my blood of the new covenant</em> at the Last Supper quote it directly. The Jewish tradition has read it differently — as the renewed covenant that would follow the exile, in which the Torah would be internalised by the returning community. Both readings are theologically serious and both have ancient roots.`,
        `What is essential about the oracle on its own terms is the move from the law written on tablets to the law written on hearts. The first covenant, given at Sinai, had been external — a body of commandments transmitted through a mediator and inscribed on stone. The new covenant Jeremiah envisages is interior. The law will be in the inward parts of the people so that they will not need to teach each other to know the Lord. Whether this has happened, or is happening, or remains to come, is a question every reader has to answer with the book and the tradition open in front of him.`,
      ],
      where: [
        { n: 30, label: 'Chapter 30 (restoration begins)' },
        { n: 31, label: 'Chapter 31 (the new covenant oracle)' },
        { n: 32, label: 'Chapter 32 (the field at Anathoth — hope enacted)' },
        { n: 33, label: 'Chapter 33 (the righteous branch)' },
      ],
    },
    {
      slug: 'symbolic-actions',
      title: 'Symbolic Actions',
      greek: 'The prophet performs his message with his body',
      preview: 'Jeremiah performs his message more than any other prophet — a linen belt, a broken flask, a yoke worn around Jerusalem, a field bought during a siege. The symbolic actions are not illustrations of the word; they are the word, in a register the spoken word alone could not reach.',
      essay: [
        `Jeremiah, more than any other prophet in the Hebrew Bible, performs his message with his body and with objects. The book records a long sequence of these symbolic actions, each one a piece of street theatre carrying a specific theological argument. He buys a linen belt, wears it, hides it in a cleft of rock by the Euphrates, returns long after to find it ruined; the message is that Judah has been ruined in the same way (chapter 13). He stands in the potter's house and watches the potter remake a marred vessel, and is told that God can do the same with the people (chapter 18). He breaks an earthen flask before the priests and elders in the valley of Hinnom (chapter 19).`,
        `He puts a wooden yoke on his own neck and walks around Jerusalem wearing it, sending a message to the foreign envoys at Zedekiah's court — submit to Babylon, do not resist (chapter 27). When the false prophet Hananiah breaks the wooden yoke and prophesies a swift end to Babylonian dominance, Jeremiah replaces it with an iron one (chapter 28). He is forbidden to marry, in a culture in which not marrying is itself a public statement; the symbolism is that there will be no future in the land for the children of his generation (chapter 16).`,
        `He buys a field at Anathoth from his cousin Hanamel during the Babylonian siege of Jerusalem, when the field is worthless and the buyer may never live to use it; the symbolism is the opposite of the others — that there will be a future after the exile, that fields will again be bought and sold in the land (chapter 32). The symbolic actions are not illustrations of the message; they are the message, performed in a register the spoken word alone could not reach.`,
        `The act of buying the field at the bottom of the country's worst hour is one of the most quietly hopeful gestures in the Hebrew Bible — a man putting down silver for land he may never plant, because he believes the land will be planted again. It is also the answer in advance to the despair the next chapters will record.`,
      ],
      where: [
        { n: 13, label: 'Chapter 13 (the linen belt)' },
        { n: 19, label: 'Chapter 19 (the broken flask)' },
        { n: 27, label: 'Chapter 27 (the wooden yoke)' },
        { n: 32, label: 'Chapter 32 (buying the field during the siege)' },
      ],
    },
    {
      slug: 'the-confessions',
      title: 'The Confessions',
      greek: '"The word is in my bones like a fire"',
      preview: 'Six passages scattered through chapters 11–20 in which Jeremiah speaks back to God about what the calling has cost him. He complains, accuses, calls down curses, tries to quit. The confessions are the most personal passages in any prophetic book in the Hebrew Bible.',
      essay: [
        `Scattered through chapters 11–20 of Jeremiah are six passages that have been called, since the nineteenth-century German scholar Heinrich Ewald, the confessions of Jeremiah: 11:18–12:6, 15:10–21, 17:14–18, 18:18–23, 20:7–13, and 20:14–18. They are the most personal passages in any prophetic book in the Hebrew Bible. In them Jeremiah does not simply deliver God's word; he speaks back to God, in his own voice, about what delivering that word has cost him. He complains. He accuses. He asks why the wicked prosper. He calls down curses on his enemies. He tells God that he has been seduced into prophecy, that he is mocked daily, that he has tried to stop speaking and cannot.`,
        `In the most despairing of the confessions — 20:14–18 — he curses the day he was born. <em>The man who brought my father the news that a male child is born unto thee, making him very glad — let that man be as the cities which the Lord overthrew. Why came I forth out of the womb to see labour and sorrow, that my days should be consumed with shame?</em> The passage is the closest parallel in the Hebrew Bible to Job's curse of his own birth — the same despair, the same directness, from a man whose life has been consumed by a calling he did not seek.`,
        `The confessions are theologically remarkable for several reasons. They preserve, in a canonical book, a prophet's quarrel with his own calling — the conviction that what God has done to him is something close to a wrong. They preserve the prophet's prayer that his enemies be destroyed, in a register that has been called imprecation. They preserve the experience of being a prophet from the inside, in moments when no other prophet's voice reaches the page.`,
        `The confessions also raise hard questions about how to read scripture. They are in the canon. They are presented, in the book, as part of what the prophet said. The God to whom they are spoken does not always answer. When he does answer (15:19–21), the answer is not consolation but a recommissioning — <em>turn back to me, and you will stand before me.</em> The book preserves the prophet's quarrel as part of the prophet's witness. The reader who comes to Jeremiah expecting unbroken confidence in God will be confronted, in these passages, with a man whose confidence in God has been put through every fire and emerged not whole but real.`,
      ],
      where: [
        { n: 11, label: 'Chapter 11 (plot against the prophet)' },
        { n: 12, label: 'Chapter 12 (why do the wicked prosper?)' },
        { n: 15, label: 'Chapter 15 (the recommissioning)' },
        { n: 20, label: 'Chapter 20 (cursed be the day I was born)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Jeremiah',
      role: 'Prophet of Anathoth',
      body: `Born around 645 BCE in Anathoth, a priestly town three miles north-east of Jerusalem, into a family of priests descended from Abiathar. Called to prophecy around 627 BCE as a young man — perhaps still a teenager. Preached for forty years through five kings and three Babylonian invasions. The most psychologically vivid prophet in the Hebrew Bible — beaten, stocked, imprisoned, lowered into a cistern, forbidden to marry, dragged into Egyptian exile against his will. His confessions (chapters 11–20) are the most personal passages in any prophetic book. Tradition holds he was eventually killed by his own people in Egypt.`,
    },
    {
      name: 'Baruch ben Neriah',
      role: 'Scribe and probable editor',
      body: `Jeremiah's secretary and the probable author of much of the biographical prose in the book. A scribe from a prominent Jerusalem family — his brother Seraiah served as quartermaster to King Zedekiah. Witnesses the purchase of the field at Anathoth (chapter 32). Central to chapter 36, where he reads Jeremiah's scroll in the temple before it is burned by King Jehoiakim, then helps dictate the whole thing again. Chapter 45 contains a personal oracle to Baruch — the only such oracle to a prophet's scribe in the Hebrew Bible. A clay seal bearing his name was discovered in 1975 and is one of the most striking archaeological confirmations of a named biblical figure outside the royal line.`,
    },
    {
      name: 'Zedekiah',
      role: 'Last king of Judah',
      body: `The last king of Judah, installed as a Babylonian vassal in 597 BCE after the deportation of his nephew Jehoiachin. Reigned eleven years. Drawn repeatedly into private conferences with Jeremiah, asking for a word from the Lord and receiving the same word each time: surrender to Babylon and live; resist and die. He cannot act on it. Rebels against Babylon, brings the final siege on the city, flees by night when the walls are breached, is captured on the plains of Jericho. His sons are killed before his eyes; his eyes are then put out. He dies in Babylon. The book treats him as the embodiment of what happens to a man who knows the truth and cannot act on it.`,
    },
    {
      name: 'Hananiah ben Azzur',
      role: 'False prophet',
      body: `The prophet from Gibeon who confronts Jeremiah in chapter 28. Jeremiah is walking around Jerusalem with a wooden yoke, counselling submission to Babylon. Hananiah prophesies the opposite: within two years God will break Babylon's power, return the temple vessels, and bring King Jehoiachin home. He takes the wooden yoke off Jeremiah's neck and breaks it. Jeremiah returns later with a word from the Lord: you have broken the yoke of wood; in its place you shall have a yoke of iron. Hananiah dies within two months. The chapter is the central canonical case study of how true and false prophets are distinguished — and the answer the book gives is that they cannot be, in advance, by hearers. Only the event tells.`,
    },
    {
      name: 'Nebuchadnezzar',
      role: 'King of Babylon',
      body: `Nebuchadnezzar II, king of Babylon from 605 to 562 BCE. Defeats Egypt at Carchemish in 605, reduces Judah to vassal status, invades three times — 605, 597, and 587 — the last time destroying Jerusalem and the temple. Jeremiah's oracles consistently identify him as the instrument of God's judgment against Judah and counsel submission; this is the position for which Jeremiah is repeatedly accused of treason. Nebuchadnezzar treats Jeremiah well after the conquest — orders his commanders to look after him, gives him his choice of going to Babylon or remaining in the land.`,
    },
    {
      name: 'The Recabites',
      role: 'Faithful clan',
      body: `A small clan descended from Jehonadab the son of Recab. Their ancestor had commanded them never to drink wine, never to build houses, never to plant vineyards, but to live in tents — a semi-nomadic existence preserving an older Israelite way of life against the assimilations of settled Canaan. In chapter 35 Jeremiah brings them into a chamber of the temple and offers them wine. They refuse. They have kept the command of their ancestor for generations and will not break it. Jeremiah uses them as a living indictment: a small clan has kept a human ancestor's command for centuries; the people of Judah have not kept God's command for a single generation.`,
    },
  ],

  cast: [
    {
      name: 'Jeremiah',
      role: 'PROPHET',
      body: `Born around 645 BCE in Anathoth, a small priestly town three miles north-east of Jerusalem, into a family of priests descended from Abiathar. Called to prophecy as a young man in 627 BCE, the thirteenth year of King Josiah. Preached for forty years through the reigns of Josiah, Jehoahaz, Jehoiakim, Jehoiachin, and Zedekiah, through the Babylonian conquest of Jerusalem in 587, through the destruction of Jerusalem itself, and into the unwilling Egyptian exile in which he probably died. The most psychologically vivid prophet in the Hebrew Bible — the only one whose interior anguish is preserved in detail. Beaten, stocked, imprisoned, lowered into a cistern, dragged into exile against his will. Forbidden to marry.`,
    },
    {
      name: 'Baruch ben Neriah',
      role: 'SCRIBE',
      body: `Jeremiah's secretary and probable editor of much of the prose biographical material in the book. A scribe from a prominent Jerusalem family — his brother Seraiah served as quartermaster to King Zedekiah. Baruch first appears by name in chapter 32, witnessing the prophet's purchase of the field at Anathoth during the siege. He plays a central role in chapter 36, the most extraordinary episode of the book's own composition: Jeremiah dictates a scroll; Baruch reads it in the temple; King Jehoiakim cuts it in pieces with a penknife and burns it; Jeremiah dictates the whole thing again, with additional oracles. A bulla bearing his name discovered in 1975 is one of the most striking archaeological confirmations of a named biblical figure outside the royal line.`,
    },
    {
      name: 'Zedekiah',
      role: 'LAST KING OF JUDAH',
      body: `The last king of Judah, installed as a vassal by Nebuchadnezzar after the deportation of his nephew Jehoiachin in 597 BCE; reigned for eleven years until the destruction of Jerusalem in 587. A weak man, vacillating, terrified of his own officials, drawn repeatedly into private conferences with Jeremiah in which he asks for a word from the Lord and is told the same word: surrender to Babylon and live; resist and die. He cannot bring himself to act on the word. Eventually rebels against Babylon; his sons are killed before his eyes, his eyes are then put out, and he is taken in chains to Babylon where he dies.`,
    },
    {
      name: 'Hananiah ben Azzur',
      role: 'FALSE PROPHET',
      body: `The prophet from Gibeon who confronts Jeremiah in chapter 28 in one of the most carefully drawn scenes of prophetic conflict in the Hebrew Bible. Jeremiah has been walking around Jerusalem with a wooden yoke on his neck, telling the envoys at Zedekiah's court to submit to Babylon. Hananiah prophesies the opposite: within two years God will break the yoke of Babylon and bring back King Jehoiachin. He then takes the wooden yoke off Jeremiah's neck and breaks it. Jeremiah returns with a word: you have broken the yoke of wood, but in its place you shall have a yoke of iron. Hananiah dies within two months.`,
    },
    {
      name: 'Nebuchadnezzar',
      role: 'KING OF BABYLON',
      body: `Nebuchadnezzar II, king of Babylon from 605 to 562 BCE, the great conqueror who defeated Egypt at Carchemish in 605 and reduced the kingdom of Judah to vassal status and then to ruin. He invades Judah three times: in 605, in 597 (deporting King Jehoiachin and ten thousand others), and in 587 (destroying Jerusalem and the temple). Jeremiah's oracles consistently identify him as the instrument of God's judgment against Judah and counsel submission to him — the position for which Jeremiah is repeatedly accused of treason by his own people. After the conquest, Nebuchadnezzar orders his commanders to treat Jeremiah well.`,
    },
    {
      name: 'The Recabites',
      role: 'FAITHFUL CLAN',
      body: `A small clan descended from Jehonadab the son of Recab, who had commanded them never to drink wine, never to build houses, never to plant vineyards, but to live in tents. In chapter 35, during Jehoiakim's reign, Jeremiah brings the Recabites into a chamber of the temple and offers them wine. They refuse — they have kept the command of their ancestor for generations. Jeremiah uses them as a living indictment of his own people: a small clan has kept the command of a human ancestor for centuries; the people of Judah have not kept the command of their God for a single generation.`,
    },
  ],

  castGroups: [
    {
      label: 'The prophet and his circle',
      characters: [
        {
          id: 'jeremiah',
          tag: 'Prophet',
          name: 'Jeremiah',
          epithet: 'The weeping prophet of Anathoth',
          body: `Born around 645 BCE into a priestly family in Anathoth, three miles north-east of Jerusalem. Called to prophecy as a young man — perhaps still a teenager — around 627 BCE. Preached for forty years through five kings and three Babylonian invasions. The most psychologically interior prophet in the Hebrew Bible: beaten, stocked, imprisoned, lowered into a cistern, forbidden to marry, and finally dragged into Egyptian exile against his will. His confessions in chapters 11–20 are the most personal passages in any prophetic book. He was still speaking when the book ends; the circumstances of his death are not recorded in scripture.`,
          appears: [1, 2, 3, 4, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18, 19, 20, 26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 38, 39, 40, 42, 43, 44, 45],
        },
        {
          id: 'baruch',
          tag: 'Scribe',
          name: 'Baruch ben Neriah',
          epithet: 'Jeremiah\'s secretary and probable editor',
          body: `A scribe from a prominent Jerusalem family — his brother Seraiah served as quartermaster to King Zedekiah. First appears by name in chapter 32, witnessing the purchase of the field at Anathoth during the siege. Central to chapter 36, where he reads Jeremiah's scroll in the temple, the scroll is then burned by King Jehoiakim, and he helps dictate the whole thing again, longer. Chapter 45 contains a personal oracle addressed to Baruch alone — the only such oracle to a prophet's scribe in the Hebrew Bible. A clay seal bearing his name, discovered in 1975, is one of the strongest archaeological confirmations of a named biblical figure outside the royal line.`,
          appears: [32, 36, 43, 45],
        },
      ],
    },
    {
      label: 'The kings of Judah',
      characters: [
        {
          id: 'josiah',
          tag: 'King',
          name: 'Josiah',
          epithet: 'The reforming king under whom Jeremiah was called',
          body: `The king of Judah in whose thirteenth year Jeremiah was called to prophecy, around 627 BCE. The book of Kings records Josiah as the greatest reforming king since David — the man who rediscovered the law book in the temple, destroyed the high places, and reinstated the Passover. He is killed at Megiddo in 609 BCE by Pharaoh Necho of Egypt, an event the book of Lamentations mourns and which Jeremiah himself lamented in a dirge preserved in 2 Chronicles 35. Josiah is barely a character in Jeremiah; he is the context — the best king under whom the worst oracles began.`,
          appears: [1, 3, 22, 25, 36],
        },
        {
          id: 'jehoiakim',
          tag: 'King',
          name: 'Jehoiakim',
          epithet: 'The king who burned the scroll',
          body: `Son of Josiah, placed on the throne by Pharaoh Necho in 609 BCE and reigning for eleven years until 598. The most dramatically hostile figure toward Jeremiah in the book. After hearing Jeremiah's temple sermon (chapter 26), his officials seek the prophet's death. In chapter 36, when Baruch reads Jeremiah's scroll to the king in the winter palace, Jehoiakim cuts the columns with a penknife as they are read and burns them in the brazier — the only scene in the Hebrew Bible of a king deliberately destroying a prophetic text. Jeremiah responds by dictating the scroll again, longer, with an added oracle that Jehoiakim's body will not be mourned and will be thrown outside the gates of Jerusalem.`,
          appears: [22, 25, 26, 35, 36],
        },
        {
          id: 'zedekiah',
          tag: 'King',
          name: 'Zedekiah',
          epithet: 'The last king of Judah; vacillating and destroyed',
          body: `The last king of Judah, installed as a Babylonian vassal by Nebuchadnezzar after the deportation of his nephew Jehoiachin in 597 BCE. Reigned eleven years until the destruction of Jerusalem in 587. A weak man, terrified of his own officials, drawn repeatedly into secret conferences with Jeremiah in which he receives the same word — surrender to Babylon and live; resist and die — and cannot act on it. Rebels against Babylon, brings the final siege on the city, flees by night when the walls are breached, is captured on the plains of Jericho. His sons are killed before his eyes; his eyes are then put out. He dies in Babylon. He is the figure on whom Jeremiah's pleas for surrender continually break.`,
          appears: [21, 24, 27, 28, 29, 32, 34, 37, 38, 39, 52],
        },
      ],
    },
    {
      label: 'Prophets and adversaries',
      characters: [
        {
          id: 'hananiah',
          tag: 'False prophet',
          name: 'Hananiah ben Azzur',
          epithet: 'The prophet who prophesied peace and died for it',
          body: `The prophet from Gibeon who confronts Jeremiah in chapter 28 in one of the most carefully drawn scenes of prophetic conflict in the Hebrew Bible. Jeremiah has been walking around Jerusalem with a wooden yoke, counselling submission to Babylon. Hananiah prophesies the opposite: within two years God will break Babylon's power, return the temple vessels, and bring King Jehoiachin home. He takes the wooden yoke off Jeremiah's neck and breaks it. Jeremiah returns later with a word from the Lord: you have broken the yoke of wood; in its place you shall have a yoke of iron. Because you have made this people trust in a lie, you will die this very year. Hananiah dies within two months. The chapter has been read ever since as the canonical case study of how true and false prophets are distinguished — and the book's answer is that they cannot be, in advance, by hearers.`,
          appears: [28],
        },
        {
          id: 'pashhur',
          tag: 'Priest',
          name: 'Pashhur ben Immer',
          epithet: 'The priest who had Jeremiah beaten and stocked',
          body: `A priest and chief officer in the temple who strikes Jeremiah and puts him in stocks overnight after Jeremiah smashes an earthen flask in the valley of Hinnom and proclaims the destruction of Jerusalem (chapters 19–20). When Jeremiah is released the next day, he delivers one of his most bitter oracles against Pashhur — renaming him Magor-missabib (terror on every side) and prophesying that he, his household, and all his friends will be taken into Babylonian captivity. The episode is the first physical violence against Jeremiah recorded in the book, and it immediately precedes the deepest of his confessions — the cursing of the day he was born.`,
          appears: [20],
        },
        {
          id: 'nebuchadnezzar',
          tag: 'King',
          tagClass: 'foreign',
          name: 'Nebuchadnezzar',
          epithet: 'King of Babylon; the instrument of judgment',
          body: `Nebuchadnezzar II, king of Babylon from 605 to 562 BCE. Defeats Egypt at Carchemish in 605, invades Judah three times, and destroys Jerusalem and the temple in 587. Jeremiah's oracles consistently identify him as the instrument of God's judgment — the foe from the north whose armies are the answer to Judah's apostasy. After the conquest he treats Jeremiah well, ordering his commanders to look after the prophet and giving him the choice of going to Babylon or remaining in the land. Appears throughout the book as a geopolitical force whose movements Jeremiah tracks with the detachment of a man who has always known the outcome.`,
          appears: [21, 22, 24, 25, 27, 28, 29, 32, 34, 39, 43, 44, 46, 49, 50, 51, 52],
        },
      ],
    },
    {
      label: 'Minor figures',
      characters: [
        {
          id: 'recabites',
          tag: 'Clan',
          name: 'The Recabites',
          epithet: 'The faithful clan who refused the wine',
          body: `A small clan descended from Jehonadab the son of Recab, who had commanded his descendants never to drink wine, never to build houses, never to plant vineyards, but to live in tents. In chapter 35 Jeremiah brings them into a chamber of the temple and offers them wine. They refuse — they have kept the command of their ancestor for generations and will not break it. Jeremiah uses them as a living indictment of Israel: a small clan has kept the command of a human ancestor for centuries; the people of Judah have not kept the command of their God for a single generation. The clan is honoured with the promise that their line will not lack a man to stand before the Lord forever.`,
          appears: [35],
        },
        {
          id: 'ebed-melech',
          tag: 'Official',
          tagClass: 'foreign',
          name: 'Ebed-melech',
          epithet: 'The Ethiopian eunuch who rescued Jeremiah from the cistern',
          body: `A Cushite eunuch in the household of King Zedekiah who rescues Jeremiah from the muddy cistern into which he had been lowered by the princes in chapter 38. Ebed-melech goes to the king, reports that Jeremiah will die of hunger in the cistern, and is given thirty men and permission to pull the prophet out — which he does with old rags and worn-out clothes to protect the prophet's arms from the ropes. In chapter 39, after the fall of Jerusalem, Jeremiah delivers an oracle specifically to Ebed-melech: because you have trusted in me, I will save you in that day, you shall not fall by the sword, but your life shall be as a prize of war.`,
          appears: [38, 39],
        },
      ],
    },
  ],

  chapterLabel: n => `Jeremiah ${n}`,

  chapters: chaptersData.map(ch => ({
    n: ch.n,
    title: ch.title,
    tourTitle: ch.tourTitle,
    hook: ch.hook,
    blurb: ch.blurb,
    tour: ch.tour,
    summary: ch.summary,
    appears: ch.appears || [],
    themes: ch.themes || [],
  })),
};
