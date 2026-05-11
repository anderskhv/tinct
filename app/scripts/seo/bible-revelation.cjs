// SEO content data for the Book of Revelation (the Apocalypse of John).
// Composed during persecution under Domitian, c. 95 CE.
// Voice: literary, declarative present. Treat the text as text — for faithful and secular readers alike.

const chapters = require('/tmp/bible-revelation-chunk-1.json');

module.exports = {
  id: 'bible-revelation',
  title: 'Revelation',
  author: 'John of Patmos',
  byline: 'c. 95 CE · New Testament · Apocalyptic',
  titleAccent: 'a guided tour',
  hook: 'An exiled man on a rocky Aegean island receives the strangest commission in the Bible. What he writes down will be argued about for two thousand years.',

  genre: ['Apocalyptic literature', 'Prophecy', 'New Testament'],

  about: [
    `<em>Revelation</em> is the only sustained piece of apocalyptic literature in the New Testament, and to read it without knowing the genre is to read it badly. Apocalyptic — from the Greek <em>apokalypsis</em>, an unveiling — was a Jewish literary mode developed in the second and first centuries BCE in works like Daniel, 1 Enoch, and the Sibylline Oracles. It is addressed to communities under pressure, encoded in strange symbols, and structured to show that what looks like local catastrophe is part of a cosmic story that has already been decided. John writes from Patmos, an Aegean island where he has been exiled for his Christian witness during the persecution under Domitian (mid-90s CE), to seven specific churches on the mainland of Asia Minor.`,
    `The book has been read in every conceivable way for nineteen hundred years. It gives the throne in heaven, the Lamb who was slain, the four horsemen, the seven seals, the seven trumpets, the seven bowls, the woman clothed with the sun, the dragon, the beast, the whore of Babylon, the marriage of the Lamb, and the new heaven and new earth. It is the strangest book in the New Testament and the most ambitious. It is still being argued about.`,
  ],

  chaptersSubtitle: 'All 22 chapters — from the inaugural vision on Patmos to the closing benediction.',
  chaptersLead: `<p>Revelation moves through a series of visions structured around sevens: seven churches, seven seals, seven trumpets, seven bowls. Read the whole thing through once before puzzling over the parts. The cumulative effect — not the individual symbol — is what the writer is after. Chapters 2–3 are the seven letters. Chapters 4–5 are the throne and the Lamb. Chapters 6–11 are the seals and the trumpets. Chapter 12 is the structural centre. Chapters 17–18 are Babylon's fall. Chapters 21–22 are the New Jerusalem.</p>`,

  themesBlurb: 'Apocalyptic genre, the Lamb, Babylon, numbers, and how to read the book.',
  themesByline: 'Five threads through the vision',
  themesLead: `Revelation resists every simple reading it has been given. It is not a chronicle of past events, a literal map of the future, or a timeless allegory. It is all three at once and something more — a piece of literature that encodes political critique, theological vision, and pastoral encouragement into a form its original audience could receive and its oppressors could not use against them.`,

  castBlurb: 'The figures of the apocalypse',
  castDesc: 'The six principals of the vision — from the Lamb on the throne to the dragon in the pit.',

  chapterLabel: n => `Revelation ${n}`,

  groups: [
    {
      label: 'Letters to the seven churches · 1–3',
      subtitle: 'The inaugural vision. Seven tailored letters with praise, rebuke, and promise.',
      chapters: [1, 2, 3],
    },
    {
      label: 'The throne and the seals · 4–7',
      subtitle: 'The heavenly throne room, the slain Lamb, and the opening of the six seals.',
      chapters: [4, 5, 6, 7],
    },
    {
      label: 'The trumpets · 8–11',
      subtitle: 'The seventh seal, four trumpets, the abyss opened, and the two witnesses.',
      chapters: [8, 9, 10, 11],
    },
    {
      label: 'The dragon and the beasts · 12–14',
      subtitle: 'The structural centre. Woman, dragon, two beasts, the 144,000 on Zion.',
      chapters: [12, 13, 14],
    },
    {
      label: 'The bowls · 15–16',
      subtitle: 'The song of Moses, then seven bowls of wrath poured without pause.',
      chapters: [15, 16],
    },
    {
      label: "Babylon's fall · 17–19",
      subtitle: 'The whore on the scarlet beast, the great lament, the rider on the white horse.',
      chapters: [17, 18, 19],
    },
    {
      label: 'The end · 20–22',
      subtitle: 'The millennium, the final judgment, the New Jerusalem, the closing benediction.',
      chapters: [20, 21, 22],
    },
  ],

  themes: [
    {
      slug: 'apocalyptic-as-a-genre',
      title: 'Apocalyptic as a Genre',
      greek: 'apokalypsis — an unveiling',
      preview: 'Revelation cannot be read well without the literary genre to which it belongs. Apocalyptic emerged in Jewish literature in the second century BCE as a way to address communities under pressure — encoding political critique in symbolic vision that the oppressor could not use against the writer.',
      essay: [
        `Revelation cannot be read well without the literary genre to which it belongs. Apocalyptic — from the Greek <em>apokalypsis</em>, unveiling — emerged in Jewish literature in the second century BCE, partly out of late prophetic material in the Hebrew Bible (Ezekiel, Zechariah, Daniel) and partly in response to the political situation of Jews under foreign rule. The classic examples include Daniel 7–12 (the only fully apocalyptic section in the Hebrew Bible itself), 1 Enoch, the Apocalypse of Abraham, the Apocalypse of Baruch, and 4 Ezra. The mode shares recurring features: visions in which a heavenly being shows the seer cosmic realities; symbolic creatures that stand for political powers (the four beasts of Daniel 7 and the dragon of Revelation 12 are direct relatives); periodization of history into ages or weeks; cosmic numerology; final judgment scenes; and the disclosure of a coming reversal in which the persecuted righteous are vindicated.`,
        `What the genre is for, in its original setting, is the encouragement of communities under pressure. The Maccabean revolt against the Seleucid persecution of Jews in the 160s BCE is the historical context that produced the book of Daniel. The Roman occupation and the destruction of the temple in 70 CE produced 4 Ezra and the Apocalypse of Baruch. In each case the apocalyptic writer is addressing a community whose immediate situation looks catastrophic and is making the case, through symbolic vision, that the present situation is not the whole picture — that the powers that look invincible from below are, from the heavenly perspective, already judged.`,
        `Revelation belongs to this genre, and it is doing this work for the seven churches of Asia Minor in the 90s CE. The encoding is partly for safety (one cannot publish a book under a hostile imperial regime that names the emperor by name and predicts his fall) and partly for theological depth (the symbols carry layers of meaning that direct prose could not). The Babylon of chapters 17–18 is recognizably Rome — seven hills (17:9), the great city that has dominion over the kings of the earth, the centre of imperial commerce and persecution. But the figure is also Babylon, the historical empire that destroyed the first temple in 587 BCE; and Tyre, the merchant city denounced by Ezekiel; and any later imperial power that fits the pattern. The symbolic encoding is what makes the book usable for every later persecuted Christian community — and what makes it dangerous to read as if it were a straightforward chronicle of any one historical sequence.`,
      ],
      where: [
        { n: 1, label: 'Revelation 1 (the genre announced)' },
        { n: 4, label: 'Revelation 4 (the heavenly throne room)' },
        { n: 12, label: 'Revelation 12 (the structural centre)' },
        { n: 17, label: 'Revelation 17 (Babylon decoded)' },
      ],
    },
    {
      slug: 'the-lamb-at-the-centre-of-the-throne',
      title: 'The Lamb at the Centre of the Throne',
      greek: 'the lion turns out to be a lamb',
      preview: 'In chapter 5, John is told the lion of Judah has conquered and can open the sealed scroll. He turns expecting a lion. He sees a Lamb, standing as if it had been slain. The substitution is the theological centre of the book.',
      essay: [
        `The most surprising image in Revelation, and the one that gives the book its distinctive theology, is in chapters 4 and 5. John has been taken up to a heavenly throne room. The one who sits on the throne is described in oblique flashes — the appearance of jasper and carnelian, a rainbow round the throne like an emerald — and around the throne are twenty-four elders, and four living creatures with six wings each, full of eyes, who never cease day or night to sing <em>holy, holy, holy is the Lord God Almighty, who was and is and is to come</em>. The scene is built from images in Ezekiel 1, Isaiah 6, and Daniel 7.`,
        `Then, in chapter 5, John sees a scroll in the right hand of the one who sits on the throne, sealed with seven seals. A mighty angel asks who is worthy to open the scroll. No one in heaven or on earth or under the earth is found worthy. John weeps. One of the elders tells him not to weep — the lion of the tribe of Judah has conquered, so that he can open the scroll. John turns expecting to see a lion. What he sees is a Lamb, standing as if it had been slain. The substitution is the theological centre of the book. The figure of conquering messianic strength is replaced, at the moment of expectation, by the figure of a slaughtered lamb that is somehow alive again and standing. The Lamb takes the scroll. The four creatures and the elders fall down before him.`,
        `The image runs through the rest of the book. The Lamb opens the seven seals (chapter 6). The Lamb stands on Mount Zion with the 144,000 (chapter 14). The wrath of the Lamb is what the kings of the earth fear (6:16). The marriage of the Lamb is the wedding feast at the end (chapter 19). The Lamb is the lamp of the New Jerusalem (21:23). What the figure asserts, at the level of vision, is that the principle by which heaven actually rules is not the conquering power one would have expected but the slain-and-living Lamb at the centre of the throne. The pattern of cross and resurrection is encoded into the cosmology of the book, and every later element of the vision has to be read in light of it.`,
      ],
      where: [
        { n: 5, label: 'Revelation 5 (the lion becomes a Lamb)' },
        { n: 7, label: 'Revelation 7 (the 144,000 sealed)' },
        { n: 14, label: 'Revelation 14 (the Lamb on Zion)' },
        { n: 19, label: 'Revelation 19 (the marriage of the Lamb)' },
      ],
    },
    {
      slug: 'the-whore-of-babylon-and-the-new-jerusalem',
      title: 'The Whore of Babylon and the New Jerusalem',
      greek: 'two cities, two endings, one choice',
      preview: 'The book is structured around two contrasting female figures. The whore of Babylon — Rome, the imperial city of commerce and bloodshed. The bride of the New Jerusalem — the city of God descending from heaven. The reader is asked which city she is a citizen of.',
      essay: [
        `The book is structured around two contrasting female figures who frame the closing vision. The whore of Babylon appears in chapters 17 and 18 — a woman seated on a scarlet beast, dressed in purple and scarlet, adorned with gold and jewels and pearls, holding in her hand a golden cup full of abominations and the impurities of her sexual immorality. On her forehead is a name of mystery: Babylon the great, mother of prostitutes and of earth's abominations. She is drunk with the blood of the saints. The angel decodes the symbolism explicitly: the seven heads of the beast are seven mountains on which the woman is seated. The reference is unmistakable to anyone in the first-century Mediterranean world. Rome is the city on seven hills. Babylon is Rome.`,
        `Chapter 18 is the long lament for Babylon's fall. <em>Fallen, fallen is Babylon the great!</em> The kings of the earth weep when they see the smoke of her burning. The merchants weep because no one buys their cargoes any more — and the cargo list that follows (18:12–13) is the most precise inventory of imperial commerce in any New Testament text: gold, silver, jewels, pearls, fine linen, purple cloth, silk, scarlet cloth, all kinds of scented wood, ivory, costly wood, bronze, iron, marble, cinnamon, spice, incense, myrrh, frankincense, wine, oil, fine flour, wheat, cattle, sheep, horses, chariots, <em>slaves and human lives</em>. The list is a precise reading of the actual trade of imperial Rome and a precise indictment of the human cost of that trade.`,
        `The New Jerusalem of chapters 21 and 22 is the structural counterpart and the redemption of the image. <em>I saw the holy city, new Jerusalem</em>, John writes, <em>coming down out of heaven from God, prepared as a bride adorned for her husband</em>. The image is feminine again, but the figure is the bride, not the prostitute. The city is laid out as a perfect cube, twelve thousand stadia on a side, with streets of gold and gates of pearl. There is no temple in the city — the Lord God Almighty and the Lamb are its temple. There is no need of sun or moon — the glory of God is its light. The river of the water of life flows from the throne of God and of the Lamb, and the tree of life stands on either side of the river, with leaves for the healing of the nations. The two cities are the two endings the book offers. The reader is asked, throughout, which city she is a citizen of and toward which she is moving.`,
      ],
      where: [
        { n: 17, label: 'Revelation 17 (the whore on the beast)' },
        { n: 18, label: 'Revelation 18 (the fall of Babylon)' },
        { n: 21, label: 'Revelation 21 (the New Jerusalem)' },
        { n: 22, label: 'Revelation 22 (the river of life)' },
      ],
    },
    {
      slug: 'the-numbers-and-the-sevens',
      title: 'The Numbers and the Sevens',
      greek: 'seven seals, seven trumpets, seven bowls — not chaos but architecture',
      preview: 'Revelation is built around numerical structures. Seven is the number of completion. Four is the created world. Twelve is the people of God. Three-and-a-half is the broken time of suffering. And 666 is a number that explicitly invites decoding.',
      essay: [
        `Revelation is built around numerical structures, and the numbers are doing theological work. The most obvious structure is the recurrence of seven: seven churches, seven spirits before the throne, seven golden lampstands, seven stars, seven seals, seven trumpets, seven thunders, seven bowls of wrath, seven heads of the dragon, seven heads of the beast. Seven is the biblical number of completion or fullness, derived from the seven days of creation in Genesis 1, and the writer uses it deliberately. The series of sevens give the book its cumulative architecture; each series builds on the last, with intermissions and parallel visions woven in.`,
        `Four is the number of the created world — the four corners of the earth, the four winds, the four living creatures around the throne. Twelve is the number of the people of God — twelve tribes, twelve apostles, twelve gates of the New Jerusalem, twelve foundations, the twenty-four elders (twelve plus twelve). The number 144,000, the company sealed in chapter 7, is twelve squared times a thousand — a number of completeness multiplied to a scale of cosmic completion. Three-and-a-half is the recurring number of the time of trouble — half of seven, the broken time. It appears as forty-two months (11:2, 13:5), 1,260 days (11:3, 12:6), and <em>a time, times, and half a time</em> (12:14) — all the same period in different formulations, borrowed from Daniel 7:25.`,
        `The most famous number in the book is 666 (or 616 in some early manuscripts), the number of the beast (13:18). The verse explicitly invites decoding: <em>this calls for wisdom: let the one who has understanding calculate the number of the beast, for it is the number of a man, and his number is 666</em>. The most widely held interpretation in modern scholarship is gematria — the assignment of numerical values to the letters of a name. Nero Caesar transliterated into Hebrew letters sums to 666. The decoding fits the apocalyptic mode: a hidden reference to the persecuting emperor that the persecuted reader can decode but the persecutor cannot use. What the numerical structures collectively achieve is a sense that the chaos of the present is not actually chaos. The visions move through their sevens, the periods of trouble are bounded, the company of the redeemed is counted, the city of God is laid out in perfect proportion.`,
      ],
      where: [
        { n: 7, label: 'Revelation 7 (the 144,000)' },
        { n: 11, label: 'Revelation 11 (the 1,260 days)' },
        { n: 13, label: 'Revelation 13 (the number of the beast)' },
        { n: 20, label: 'Revelation 20 (the thousand years)' },
      ],
    },
    {
      slug: 'how-to-read-the-book',
      title: 'How to Read the Book',
      greek: 'preterist, historicist, futurist, idealist — all four are partly right',
      preview: 'Revelation has been read in more incompatible ways than any other book in the Bible. The four major schools of interpretation — preterist, historicist, futurist, idealist — each captures something the others miss. The responsible reader needs all four.',
      essay: [
        `Revelation has been read in more incompatible ways than any other book in the Bible, and the question of how to read it has been argued for nineteen hundred years. The four major schools of interpretation are usually named the preterist, the historicist, the futurist, and the idealist. Each has produced major commentaries; each has serious problems; each captures something the others miss. The standard scholarly view today is that the book is not exhausted by any one school.`,
        `The preterist reading sees the book as primarily addressed to its original first-century context. The Babylon of chapters 17–18 is Rome under Domitian; the beast is Nero or Domitian; the persecution is the persecution John's own community is enduring. The strength of this reading is that it takes the book's original setting seriously. The weakness is that it can drain the book of its forward-looking dimension. The historicist reading sees the book as a prophetic survey of the entire history of the church from the first century to the end — and dominated Protestant interpretation from the Reformation through the nineteenth century. The futurist reading sees the bulk of the visions (from chapter 4 forward) as referring to events still in the future and has dominated popular American Protestantism since the nineteenth century, particularly in the dispensationalist form. The idealist reading sees the visions as symbolic representations of the perennial conflict between the kingdom of God and the powers of evil, applicable to every Christian generation.`,
        `The responsible reader of Revelation today does not need to choose one school against the others. The book has a specific historical setting (the preterist reading is right that the original audience is the seven churches of Asia Minor in the 90s); it has implications for the long history of the church (the historicist reading is right that the book is not just about one moment); it points forward to a final consummation (the futurist reading is right that the book is not exhausted by past events); and it speaks to every generation of believers in conflict with worldly power (the idealist reading is right that the symbols are perennial). The book is large enough to bear all four readings without being reducible to any one.`,
      ],
      where: [
        { n: 1, label: 'Revelation 1 (the frame: past, present, future)' },
        { n: 2, label: 'Revelation 2–3 (the original audience)' },
        { n: 13, label: 'Revelation 13 (the beast, historically decoded)' },
        { n: 20, label: 'Revelation 20 (the millennium debate)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'John of Patmos',
      role: 'Seer and writer',
      body: `The author of the book, exiled to the small Aegean island of Patmos for his Christian witness during the persecution under Domitian (mid-90s CE). He identifies himself as John (1:1, 1:4, 1:9, 22:8) and as a brother and partner in the tribulation of the seven churches. Whether he is the apostle John, son of Zebedee, is contested — the differences in style, vocabulary, and theology between the gospel and the apocalypse make a single author unlikely to many scholars. What is undisputed is that the writer is a Jewish-Christian deeply formed in the Hebrew Bible, capable of constructing one of the most complex pieces of apocalyptic literature ever produced.`,
    },
    {
      name: 'The Lamb',
      role: 'The central figure of the vision',
      body: `In chapter 5, when no one is found worthy to open the sealed scroll, John is told the lion of the tribe of Judah has conquered. He turns expecting a lion and sees a Lamb, standing as if it had been slain. The substitution is the theological centre. The Lamb opens the seven seals, stands on Mount Zion with the 144,000, is the lamp of the New Jerusalem, and sits on the throne with the one who sits on the throne. The image asserts that heaven rules not by conquering force but by the slain-and-living Lamb, and the pattern of cross and resurrection is built into the cosmology of the book.`,
    },
    {
      name: 'The Dragon',
      role: 'Satan, the deceiver',
      body: `The great red dragon of chapter 12, with seven heads and ten horns, whose tail sweeps down a third of the stars of heaven. He stands before the woman who is about to give birth, intending to devour the child. The text gives the dragon a fourfold identification (12:9): that ancient serpent, who is called the devil and Satan, the deceiver of the whole world. War breaks out in heaven and the dragon is thrown down. He gives his authority to the beast from the sea in chapter 13. He is bound for a thousand years in chapter 20, loosed briefly, and at last thrown into the lake of fire.`,
    },
    {
      name: 'The Beast',
      role: 'The antichrist figure',
      body: `There are actually two beasts in chapter 13. The beast from the sea has seven heads and ten horns, draws its authority from the dragon, and is given to make war on the saints. One of its heads has a mortal wound that has healed — most likely a reference to the Nero <em>redivivus</em> legend current in the late first century. The beast from the land has two horns like a lamb but speaks like a dragon; it makes the earth worship the first beast and forces all to receive the mark of the beast — 666 — without which no one can buy or sell. The figure has had an enormous afterlife in later Christian apocalypticism, where it became the antichrist of medieval and modern speculation.`,
    },
    {
      name: 'The Whore of Babylon',
      role: 'Imperial city',
      body: `The female figure of chapters 17 and 18, seated on a scarlet beast, dressed in purple and scarlet, holding a golden cup of abominations, drunk with the blood of the saints. On her forehead: Babylon the great, mother of prostitutes. The angel decodes the symbolism explicitly: the seven heads of the beast are seven mountains — the reference, in the first-century Mediterranean, is unmistakable. Rome is the city on seven hills. The long lament for her fall in chapter 18 is one of the most precise indictments of imperial economy in any ancient text, ending its cargo list with <em>slaves and human lives</em>.`,
    },
    {
      name: 'The Bride / New Jerusalem',
      role: 'The city of God',
      body: `The structural counterpart to the whore of Babylon and the figure of the book's closing vision. The New Jerusalem comes down out of heaven from God in chapter 21, prepared as a bride adorned for her husband — a perfect cube, twelve thousand stadia on a side, walls of jasper, streets of gold, twelve gates of pearl. No temple — the Lord God Almighty and the Lamb are its temple. The river of the water of life flows from the throne, and the tree of life stands on either side, with leaves for the healing of the nations. The figure is at once city, bride, and people of God.`,
    },
  ],

  castSubtitle: 'The six principals of the vision.',
  castLead: `<p>Revelation does not have a human cast in the way a novel does. Its figures are cosmic: the Seer who receives the vision, the Lamb who opens the seals, the Dragon who wages war, the Beast who marks the earth, the Whore who embodies empire, and the Bride who descends as the new creation. Each appears across multiple chapters; each is identified explicitly by the text. The chapter links below show where each figure is most fully drawn.</p>`,

  castGroups: [
    {
      label: 'Heaven',
      characters: [
        {
          id: 'john-of-patmos',
          tag: 'SEER',
          name: 'John of Patmos',
          epithet: 'The prophet exiled to Patmos',
          body: `The author of the book, exiled to the island of Patmos for his Christian witness during the persecution under Domitian (mid-90s CE). He identifies himself as John (1:1, 1:4, 1:9, 22:8) and as a brother and partner in the tribulation of the seven churches of Asia Minor. Whether he is the apostle John, son of Zebedee, is contested — the differences in style and theology between the gospel of John and the apocalypse make a single author unlikely to many scholars. Some have proposed he is John the Elder, a distinct figure mentioned by Papias around 130 CE. What is undisputed is that he is a Jewish-Christian deeply formed in the Hebrew Bible, capable of constructing one of the most complex pieces of apocalyptic literature ever produced.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
        },
        {
          id: 'the-lamb',
          tag: 'SLAIN AND REIGNING',
          name: 'The Lamb',
          epithet: 'The central christological figure',
          body: `In chapter 5, when no one is found worthy to open the scroll sealed with seven seals, an elder tells John not to weep — the lion of the tribe of Judah has conquered. John turns expecting a lion and sees a Lamb, standing as if it had been slain. The substitution is the theological centre of the book. The Lamb takes the scroll, opens the seals, stands on Mount Zion with the 144,000, is the lamp of the New Jerusalem, and sits on the throne with the one who sits on the throne. The political implication is that heaven rules not by conquering force but by the slain-and-living Lamb at the centre, and the pattern of cross and resurrection is built into the cosmology of the book.`,
          appears: [1, 5, 6, 7, 12, 14, 17, 19, 21, 22],
        },
      ],
    },
    {
      label: 'The Adversaries',
      characters: [
        {
          id: 'the-dragon',
          tag: 'SATAN',
          name: 'The Dragon',
          epithet: 'That ancient serpent, the deceiver',
          body: `The great red dragon of chapter 12, with seven heads and ten horns and seven crowns on his heads, whose tail sweeps down a third of the stars of heaven and casts them to the earth. He stands before the woman who is about to give birth, intending to devour the child. The child is caught up to God; war breaks out in heaven; Michael and his angels fight the dragon and throw him down. The text gives him a fourfold identification (12:9): <em>that ancient serpent, who is called the devil and Satan, the deceiver of the whole world</em>. He gives his authority to the beast from the sea in chapter 13. He is bound for a thousand years in chapter 20, loosed briefly, and thrown into the lake of fire.`,
          appears: [9, 12, 13, 16, 20],
        },
        {
          id: 'the-beast',
          tag: 'ANTICHRIST FIGURE',
          name: 'The Beast',
          epithet: 'The beast from the sea',
          body: `There are actually two beasts in chapter 13. The beast from the sea has seven heads and ten horns, draws its authority from the dragon, and is given to make war on the saints. One of its heads has a mortal wound that has healed — most likely a reference to the Nero <em>redivivus</em> legend that he would return from the dead, current in the late first century. The beast from the land (the false prophet) has two horns like a lamb but speaks like a dragon; it forces all to receive the mark of the beast, six hundred sixty-six, without which no one can buy or sell. The figure has had an enormous afterlife in later Christian apocalypticism.`,
          appears: [11, 13, 14, 15, 16, 17, 19, 20],
        },
      ],
    },
    {
      label: 'The Cities',
      characters: [
        {
          id: 'the-whore-of-babylon',
          tag: 'IMPERIAL CITY',
          name: 'The Whore of Babylon',
          epithet: 'Babylon the great, mother of prostitutes',
          body: `The female figure of chapters 17 and 18, seated on a scarlet beast, dressed in purple and scarlet, adorned with gold and jewels and pearls, holding a golden cup of abominations, drunk with the blood of the saints and the witnesses to Jesus. The angel decodes the symbolism explicitly: the seven heads of the beast are seven mountains — in the first-century Mediterranean, unmistakably Rome. The long lament for her fall in chapter 18 is one of the most precise indictments of imperial economy in any ancient text, ending its cargo list with <em>slaves and human lives</em>.`,
          appears: [14, 16, 17, 18],
        },
        {
          id: 'the-bride-new-jerusalem',
          tag: 'CITY OF GOD',
          name: 'The Bride / New Jerusalem',
          epithet: 'The holy city, coming down out of heaven',
          body: `The structural counterpart to the whore of Babylon and the figure of the book's closing vision. The New Jerusalem comes down out of heaven from God in chapter 21, prepared as a bride adorned for her husband. The city is twelve thousand stadia on a side, a perfect cube; its walls are jasper, its streets gold; twelve gates of pearl, three on each side; twelve foundations bearing the names of the twelve apostles. There is no temple — the Lord God Almighty and the Lamb are its temple. The river of the water of life flows from the throne of God and of the Lamb, and the tree of life stands on either side, with leaves for the healing of the nations. The figure is at once city, bride, and people of God.`,
          appears: [19, 21, 22],
        },
      ],
    },
  ],

  chapters,
};
