// SEO content data for the Letter to the Hebrews.
// Composed 60-90 CE, author unknown. Origen famously said only God knows who wrote it.
// Voice: literary, declarative present. Treat the text as text — for faithful and secular readers alike.

const chapters = require('/tmp/bible-hebrews-chunk-1.json');

module.exports = {
  id: 'bible-hebrews',
  title: 'Hebrews',
  author: 'Anonymous (traditionally Paul; modern scholarship attributes to a learned Hellenistic Jewish Christian)',
  byline: 'c. 60-90 CE · New Testament · Homily/Epistle',
  titleAccent: 'a guided tour',
  hook: 'The most polished Greek in the New Testament and the most carefully constructed argument. A thirteen-chapter sustained meditation on the proposition that what God has done in Christ is greater than every previous mediation — angels, Moses, the priesthood, the temple. It ends with the great cloud of witnesses watching the present generation run the same race.',

  genre: ['New Testament', 'Epistle', 'Homily', 'Biblical literature'],

  about: [
    `<em>Hebrews</em> is the most stylistically distinct book of the New Testament. Its Greek is the most polished, its rhetorical structure the most carefully built, its argumentation the most sustained. It is also the most anonymous. The traditional attribution to Paul, which prevailed in the Latin West from the fourth century onward, is rejected by virtually all modern scholarship — the vocabulary is not Pauline, the style is not Pauline, and the writer places himself in the second generation of Christians, which is hard to reconcile with Paul's own emphatic claim to be an apostle by direct call from the risen Christ. Origen, writing in the early third century, summarized the situation with a phrase that has been quoted ever since: as for who actually wrote the letter, only God knows.`,
    `The book is a sustained argument, sometimes called a sermon or a treatise, in which the writer makes the case that Jesus Christ is greater than every previous mediation between God and humanity. The structure runs through a series of comparisons: greater than the angels, greater than Moses, greater than the Levitical high priesthood, greater than the temple sacrifices. Chapter 11 is the great catalogue of faith — Abel, Enoch, Noah, Abraham, Sarah, Moses — running through the entire history of Israel as a story of those who endured by trust in what they could not yet see. Chapter 12 turns to the readers: since you are surrounded by such a great cloud of witnesses, run with endurance the race that is set before you.`,
  ],

  chaptersSubtitle: 'All 13 chapters — from the Son above the angels to the closing benediction.',
  chaptersLead: `<p>Hebrews is structured as one continuous argument with a brief practical closing. Chapters 1–7 establish the superiority of the Son as high priest over every previous mediator. Chapters 8–10 develop the new covenant, the heavenly sanctuary, and the once-for-all sacrifice. Chapters 11–12 are the great call to endurance through the cloud of witnesses. Chapter 13 is the closing exhortation and benediction. The warning passages (2:1–4, 6:4–8, 10:26–31, 12:25–29) cut through every section with concentrated severity.</p>`,

  themesByline: 'Five threads through the epistle',
  themesLead: `Hebrews is a book with one argument and five interlocking themes. The argument is that Christ is greater than every previous mediation. The themes are the five ways that argument is carried: by demonstrating the Son's superiority, by developing the Melchizedek priesthood, by assembling the cloud of witnesses, by warning those who might turn away, and by building the figure of the great high priest who has been tempted as we are.`,

  groups: [
    { label: 'The superior priesthood · ch. 1–7', subtitle: 'Greater than angels, greater than Moses, the Melchizedek priesthood established.', chapters: [1, 2, 3, 4, 5, 6, 7] },
    { label: 'The new covenant · ch. 8–10', subtitle: 'The heavenly sanctuary, the once-for-all sacrifice, and the new covenant written on hearts.', chapters: [8, 9, 10] },
    { label: 'The call to perseverance · ch. 11–13', subtitle: 'The great cloud of witnesses, the race set before us, and the closing benediction.', chapters: [11, 12, 13] },
  ],

  themes: [
    {
      slug: 'sons-superiority',
      title: "The Son's Superiority",
      greek: 'greater than angels, Moses, and the priests of Aaron',
      preview: "The opening four verses of Hebrews are one of the most carefully constructed sentences in the New Testament, and they state the thesis of the entire book. The Son is the radiance of the glory of God — and greater than every previous mediator in a series of comparisons that runs for seven chapters.",
      essay: [
        `The opening four verses of Hebrews are one of the most carefully constructed sentences in the New Testament, and they state the thesis of the entire book. Long ago, at many times and in many ways, God spoke to our fathers by the prophets, but in these last days he has spoken to us by his Son, whom he appointed the heir of all things, through whom also he created the world. He is the radiance of the glory of God and the exact imprint of his nature, and he upholds the universe by the word of his power. After making purification for sins, he sat down at the right hand of the Majesty on high, having become as much superior to angels as the name he has inherited is more excellent than theirs.`,
        `The sentence does enormous work. It establishes a contrast between the previous revelations of God — at many times and in many ways, through the prophets, to the fathers — and the definitive revelation in the Son. It identifies the Son with the divine nature (the radiance of the glory of God, the exact imprint of his nature, the one through whom the world was created) in language as elevated as anything in John's prologue. It makes the Son's atoning work — making purification for sins — the basis of his exalted status. And it introduces the comparison with angels that the rest of chapter 1 will work out in detail through a string of citations from the Hebrew Bible.`,
        `Why begin with angels? Because in second-temple Jewish thought, angels were the mediators of the law at Sinai (Galatians 3:19, Acts 7:53, and a long Jewish tradition). The author wants to argue that the new word God has spoken in the Son is greater than the law because the Son is greater than the angels who mediated it. The structural argument is therefore not just christological but covenantal: a greater mediator brings a greater word, and a greater word constitutes a greater covenant.`,
        `What chapter 1 establishes is the basic move that the rest of the book will repeat in different keys. There is a previous mediation; there is a definitive mediation in Christ; the definitive is greater than the previous; the greater calls for the response of attention and trust that the previous, however genuinely from God, did not finally produce. The pattern will be repeated with Moses (chapter 3), with the high priesthood (chapters 4–7), with the covenant itself (chapter 8), with the sanctuary (chapter 9), and with the sacrifices (chapter 10). Each comparison adds a layer to the cumulative argument.`,
      ],
      where: [
        { n: 1, label: 'Hebrews 1 (the Son above the angels)' },
        { n: 3, label: 'Hebrews 3 (greater than Moses)' },
        { n: 7, label: 'Hebrews 7 (the superior priesthood)' },
        { n: 8, label: 'Hebrews 8 (the main point announced)' },
      ],
    },
    {
      slug: 'melchizedek',
      title: 'Melchizedek',
      greek: 'king of Salem and priest of God Most High',
      preview: "The figure of Melchizedek appears in only two places in the Hebrew Bible — Genesis 14 and Psalm 110. Hebrews makes him the structural figure of the central christological argument of the book. The reasoning in chapter 7 is one of the most ingenious pieces of biblical exegesis in early Christian literature.",
      essay: [
        `Melchizedek, the writer points out, was king of Salem and priest of God Most High, and he met Abraham returning from the slaughter of the kings and blessed him, and Abraham gave him a tenth of everything. The figure is significant first because he predates the Levitical priesthood — he is a priest centuries before Aaron. He is significant second because his genealogy is not given in Genesis: without father or mother or genealogy, having neither beginning of days nor end of life, the writer says, drawing a positive theological inference from the fact that Genesis is silent on the question — a typically rabbinic move.`,
        `He is significant third because Abraham gave him a tithe, which means Levi, who was still in the loins of Abraham, paid tithes through his great-grandfather to Melchizedek; the Levitical priesthood is therefore subordinate, structurally, to the Melchizedek priesthood. He is significant fourth because Psalm 110 places the messianic king in the order of Melchizedek, not in the order of Aaron, which means the messianic priesthood is of a different and superior kind from the Levitical.`,
        `From this exegetical foundation the writer builds the central argument. Christ is a priest forever after the order of Melchizedek. His priesthood is therefore not Levitical, not bound by the law of physical descent, not interrupted by death (he holds his priesthood permanently because he continues forever), and not occupied with the repeated offerings of bulls and goats. He has offered, once and for all, the sacrifice of himself, and has entered the heavenly sanctuary not made with hands.`,
        `The figure of Melchizedek, almost invisible in the Hebrew Bible, becomes through Hebrews one of the central christological images of the New Testament — a figure of the priesthood that does not depend on lineage, that does not end with death, and that is exercised once and forever rather than year by year.`,
      ],
      where: [
        { n: 5, label: 'Hebrews 5 (Melchizedek introduced)' },
        { n: 6, label: 'Hebrews 6 (the anchor before the argument)' },
        { n: 7, label: 'Hebrews 7 (the Melchizedek chapter)' },
      ],
    },
    {
      slug: 'cloud-of-witnesses',
      title: 'The Cloud of Witnesses',
      greek: 'by faith Abel… by faith Noah… by faith Abraham…',
      preview: "Chapter 11 of Hebrews is the great chapter on faith, and it is one of the most carefully constructed catalogues in the Bible — the entire history of Israel retold as a sequence of figures who endured by trust in what they could not yet see.",
      essay: [
        `The chapter opens with the closest thing the New Testament gives to a definition of faith — now faith is the assurance of things hoped for, the conviction of things not seen — and then runs through the entire history of Israel as a sequence of figures who endured by trust in what they could not yet see. The structure is anaphoric: by faith Abel, by faith Enoch, by faith Noah, by faith Abraham, by faith Sarah, by faith Isaac, by faith Jacob, by faith Joseph, by faith Moses, and then a sweeping summary — and what more shall I say? for time would fail me to tell of Gideon, Barak, Samson, Jephthah, of David and Samuel and the prophets.`,
        `The chapter then turns to the unnamed: those who through faith conquered kingdoms, enforced justice, obtained promises, stopped the mouths of lions, quenched the power of fire; women received back their dead by resurrection. Others were tortured, refusing to accept release, that they might rise again to a better life. Others suffered mocking and flogging, and even chains and imprisonment. They were stoned, they were sawn in two, they were killed with the sword. They went about in skins of sheep and goats, destitute, afflicted, mistreated — of whom the world was not worthy.`,
        `The chapter works on multiple levels at once. As a catalogue, it gives the entire Hebrew Bible as the prehistory of the Christian community — the same God, the same faith, the same pattern of trust in promises not yet fulfilled. As a literary structure, it builds cumulatively, with the by-faith refrain establishing rhythm and the unnamed sufferers at the end giving the chapter its emotional weight. As a theological argument, it makes the case that the faith now required of Christians is not a new thing but the same trust that has always been required of those who would walk with God.`,
        `The closing is one of the most quoted passages in the New Testament. And all these, though commended through their faith, did not receive what was promised, since God had provided something better for us, that apart from us they should not be made perfect. The cloud of witnesses — gathered at the boundary of vision in chapter 12 — consists of all these figures, watching the present generation as it runs the same race they ran. The image has shaped the way Christians think about the communion of saints, the continuity between Hebrew and Christian scripture, and the long cost of fidelity.`,
      ],
      where: [
        { n: 11, label: 'Hebrews 11 (the great catalogue)' },
        { n: 12, label: 'Hebrews 12 (the cloud watching)' },
      ],
    },
    {
      slug: 'warning-passages',
      title: 'The Warning Passages',
      greek: '"It is a fearful thing to fall into the hands of the living God"',
      preview: "Hebrews contains some of the most severe warnings in the New Testament — four concentrated passages that share a common structure: if those who disobeyed the previous revelation faced consequences, how much more those who turn away from the greater?",
      essay: [
        `There are four major warning passages — at 2:1–4, 6:4–8, 10:26–31, and 12:25–29 — and they share a common structure. The new revelation in Christ is greater than the previous revelation through the angels and the prophets. If those who disobeyed the previous revelation faced consequences, how much more will those who turn away from the greater? The argument is a fortiori: from the lesser to the greater.`,
        `The most severe is in chapter 6: it is impossible, in the case of those who have once been enlightened, who have tasted the heavenly gift and have shared in the Holy Spirit, and have tasted the goodness of the word of God and the powers of the age to come, and then have fallen away, to restore them again to repentance, since they are crucifying once again the Son of God to their own harm and holding him up to contempt. The passage has been a major proof text for strict penitential disciplines and a source of sustained theological debate. The chapter ends with the writer's confidence that his readers are not in the situation he has just described — yet in your case, beloved, we feel sure of better things — but the warning has done its work.`,
        `The warning at 10:26–31 is similarly severe. If we go on sinning deliberately after receiving the knowledge of the truth, there no longer remains a sacrifice for sins, but a fearful expectation of judgment. The chapter ends with a famous line: it is a fearful thing to fall into the hands of the living God. The warning at 12:25–29 closes the long argument of the book on the same note: see that you do not refuse him who is speaking.`,
        `The book itself does not allow either a purely gracious or a purely severe reading without qualification. The warnings are there, in their full weight. They are also balanced, on the same pages, by some of the most reassuring passages in the New Testament — the high priest who has been tempted in every way as we are, yet without sin (4:15); the throne of grace that we may approach with confidence (4:16); the assurance that God remembers their sins no more (10:17). The reader who takes the book whole gets both, and the tension is not resolved, only inhabited.`,
      ],
      where: [
        { n: 2, label: 'Hebrews 2 (first warning)' },
        { n: 6, label: 'Hebrews 6 (the most severe)' },
        { n: 10, label: 'Hebrews 10 (fearful expectation)' },
        { n: 12, label: 'Hebrews 12 (the final warning)' },
      ],
    },
    {
      slug: 'great-high-priest',
      title: 'The Great High Priest',
      greek: '"tempted in every way as we are, yet without sin"',
      preview: "Hebrews is the only New Testament book that develops the figure of Christ as high priest systematically. The development is one of the most influential pieces of theology the early church produced — and its most pastorally important moment is a single verse at 4:15.",
      essay: [
        `The image that runs through the centre of Hebrews and gives the book its distinctive christology is the figure of Christ as the great high priest. Like the high priest, Christ has been chosen by God for the work; he represents human beings before God; he offers a sacrifice for sin. Unlike the high priest, his sacrifice is himself, not a bull or a goat; it is offered once and forever, not yearly; and it is offered in the heavenly sanctuary, not the earthly tabernacle.`,
        `The structural argument is built around the Day of Atonement (Yom Kippur), the one day a year on which the high priest entered the Holy of Holies to sprinkle blood on the mercy seat for the sins of the people. Christ, the writer argues, has entered once and for all into the true sanctuary, with his own blood, and has obtained eternal redemption (9:12).`,
        `The most pastorally important passage in the book is not the abstract christology but the application. We do not have a high priest who is unable to sympathize with our weaknesses, but one who in every respect has been tempted as we are, yet without sin (4:15). The verse has been a foundation of Christian devotional life for two thousand years. The Christ of Hebrews is not the distant divine figure of some early heretical christologies; he is fully human, fully tempted, fully able to enter into the experience of the worshippers he represents. He is also, simultaneously, the radiance of the glory of God and the one through whom the world was made.`,
        `The consequence the writer draws is the consequence the book is built on. Let us then with confidence draw near to the throne of grace, that we may receive mercy and find grace to help in time of need (4:16). The image of approach — drawing near, with confidence, into the holy place where one would otherwise be unwelcome — is the image that runs through the whole book and gives it its distinctive devotional tone. Everything else in the book is in service of that access.`,
      ],
      where: [
        { n: 4, label: 'Hebrews 4 (the throne of grace)' },
        { n: 7, label: 'Hebrews 7 (the eternal priesthood)' },
        { n: 9, label: 'Hebrews 9 (the heavenly sanctuary)' },
        { n: 10, label: 'Hebrews 10 (the once-for-all sacrifice)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'The Son', role: 'Great High Priest, heir of all things', body: `The central figure of the book and the subject of its sustained christological argument. The Son in Hebrews is the heir of all things, through whom also God created the world; the radiance of the glory of God and the exact imprint of his nature; the one who upholds the universe by the word of his power. He is also the great high priest who has been tempted in every way as we are, yet without sin — a priest forever after the order of Melchizedek, who has offered once and for all the sacrifice of himself and entered the heavenly sanctuary not made with hands.` },
    { name: 'Moses', role: 'Faithful servant in God\'s house', body: `The figure used in chapter 3 as the comparison through which the Son's superior status is established. The writer honours Moses — he was faithful in all God's house as a servant — while establishing that the Son is greater as the builder of the house itself. Moses is also one of the great figures in the catalogue of faith in chapter 11, commended not just for his office but for his faith.` },
    { name: 'Melchizedek', role: 'Priest of Salem, king of righteousness', body: `The mysterious figure from Genesis 14 — king of Salem and priest of God Most High — and the structural figure of the central christological argument of the book. Significant because he predates the Levitical priesthood; because his genealogy is not given in Genesis; because Abraham paid him a tithe; and because Psalm 110 addresses the messianic king as a priest forever after the order of Melchizedek. From these four observations the writer builds the entire argument that the christological priesthood is of a different and superior kind from the Levitical.` },
    { name: 'Abraham', role: 'Patriarch, recipient of the promise', body: `The anchor figure of the epistle's argument about faith and promise. Abraham paid tithes to Melchizedek (chapter 7), received and trusted God's oath (chapter 6), and appears in the great catalogue of chapter 11 with Sarah as the two central figures of the faith that endures before receiving the promise.` },
  ],

  castSubtitle: 'The key figures of the letter — some named, some present only as figures in an argument.',
  castLead: `<p>Hebrews is unusual among New Testament epistles in that its primary cast is not the living community but the figures of Scripture — the Son, Moses, Melchizedek, Abraham — who are the subjects of the epistle's sustained argument. The addressees appear throughout in the second person plural but are never named or located. The author is equally anonymous.</p>`,

  castGroups: [
    {
      label: 'The figures of the argument',
      characters: [
        { id: 'the-son', tag: 'Divine', name: 'The Son', epithet: 'Great High Priest, heir of all things', body: `The central figure of the book and the subject of its sustained christological argument. The Son in Hebrews is simultaneously the heir of all things and the one through whom God created the world; the radiance of the glory of God; the great high priest who has been tempted in every way as we are, yet without sin; the priest forever after the order of Melchizedek; the one who offered, once and for all, the sacrifice of himself and entered the heavenly sanctuary. The book holds the divine and human natures together throughout without explicit theoretical resolution.`, appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13] },
        { id: 'melchizedek', tag: 'Figure', name: 'Melchizedek', epithet: 'Priest of Salem, king of righteousness', body: `The mysterious figure from Genesis 14 who meets Abraham after the rescue of Lot, blesses him, and receives a tithe. His significance to the argument of Hebrews rests on four observations: he predates Aaron; Genesis gives no genealogy for him; Abraham paid him a tithe (making Levi structurally subordinate); and Psalm 110 places the messianic king in his order. From these four points the writer builds the entire Melchizedek christology.`, appears: [5, 6, 7] },
        { id: 'moses', tag: 'Figure', name: 'Moses', epithet: 'Faithful servant in God\'s house', body: `Honoured in chapter 3 as the greatest figure of the previous covenant — faithful in all God's house as a servant — and then superseded by the Son as the builder rather than the servant of the house. In chapter 11, Moses appears again not as an institutional figure but as a man of faith, who refused to be called the son of Pharaoh's daughter and chose to be mistreated with the people of God rather than enjoy the fleeting pleasures of sin.`, appears: [3, 11] },
        { id: 'the-cloud-of-witnesses', tag: 'Figure', name: 'The Cloud of Witnesses', epithet: 'The faithful of the old covenant', body: `The great catalogue of chapter 11 — Abel, Enoch, Noah, Abraham and Sarah, Isaac, Jacob, Joseph, Moses, the people at the Red Sea and Jericho, Rahab, and the long sweep of the unnamed: those who through faith conquered kingdoms and stopped the mouths of lions, those who were tortured and stoned and sawn in two and killed with the sword, of whom the world was not worthy. All endured by trusting what they could not yet see; none received the promise without the present generation.`, appears: [11, 12] },
        { id: 'the-great-high-priest-figure', tag: 'Figure', name: 'The Great High Priest Figure', epithet: 'Mediator, intercessor, the one who sympathizes', body: `Distinguished as a separate cast entry because the priestly image runs through the book with its own life. The great high priest in Hebrews has been chosen from among human beings, can sympathize with weakness because he has been tempted as we are, has gone through the heavens, lives forever to make intercession, has entered once and for all into the holy place with his own blood, and is the basis on which the readers are invited to approach the throne of grace with confidence.`, appears: [4, 5, 7, 8, 9, 10, 13] },
      ],
    },
    {
      label: 'The community',
      characters: [
        { id: 'the-addressees', tag: 'Community', name: 'The Addressees', epithet: 'Unidentified Jewish-Christian community', body: `The community for whom the book was written, who appear throughout in the second person plural but are never named or located. Evidently a Jewish-Christian community of the second generation who have suffered for their faith in the past and are in danger now of drifting and becoming sluggish. Where they live is not stated — Rome is the most popular candidate, based on Hebrews 13:24 — but the silence is part of why Hebrews has been read by every later Christian community as if it were addressed to them.`, appears: [2, 3, 4, 5, 6, 10, 12, 13] },
      ],
    },
  ],

  chapterLabel: n => 'Hebrews ' + n,

  chapters: chapters.map(c => ({
    n: c.n,
    title: c.title,
    tourTitle: c.tourTitle,
    hook: c.hook,
    tour: c.tour,
    blurb: c.blurb,
    summary: c.summary,
    appears: c.appears,
    themes: c.themes,
  })),
};
