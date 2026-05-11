// SEO content data for Ecclesiastes (bible-ecclesiastes).
// Hebrew wisdom literature, Qoheleth (traditionally Solomon), c. 4th-3rd c. BCE.
// Voice: literary, declarative present.

const chapters = require('/tmp/bible-ecclesiastes-chunk-1.json')

module.exports = {
  id: 'bible-ecclesiastes',
  title: 'Ecclesiastes',
  author: 'Qoheleth (traditionally Solomon)',
  byline: 'c. 4th–3rd c. BCE · Hebrew Bible · Writings · Wisdom',
  titleAccent: 'a guided tour',
  hook: 'A king who had everything tried every project a human life can attempt — wisdom, pleasure, wealth, great works, the accumulation of memory. He found that all of them are hevel: vapor, breath, the merest exhalation. Ecclesiastes is the long, candid, unflinching account of what he found, and it has been the strangest voice in the Bible for three thousand years.',

  genre: ['Wisdom literature', 'Hebrew Bible', 'Old Testament', 'Philosophy'],

  themesBlurb: 'Hevel, the catalogue of failed projects, the seasons of time, carpe diem, the closing frame.',
  castBlurb: 'The Preacher and his figures',
  castDesc: 'Qoheleth, the frame narrator, the Solomonic persona, and death as the leveller.',
  castSubtitle: 'Qoheleth and the voices of Ecclesiastes.',

  chapterLabel: n => `Ecclesiastes ${n}`,

  about: [
    `<em>Ecclesiastes</em> is the third book of the Hebrew wisdom literature, alongside Job and Proverbs, and the most theologically unsettling of the three. The Hebrew title is Qoheleth — a participle from the verb meaning 'to assemble' or 'to gather,' usually translated 'the Preacher' or 'the Teacher,' though neither English word quite captures it. The Greek translators of the Septuagint rendered it Ekklesiastes, 'one who speaks to the assembly,' and it is from this that the English title derives. Critical scholarship has almost universally rejected the Solomonic attribution on linguistic grounds: the Hebrew contains Aramaic loanwords and Persian-period constructions that postdate Solomon by centuries. Most scholars place the composition in the third century BCE, in Hellenistic Judaea.`,
    `The book consists of a frame and an extended meditation. The frame is brief: a third-person introduction in 1:1, a third-person epilogue in 12:8–14, and the rest is the first-person voice of Qoheleth. Its central word — hevel, rendered 'vanity' in the King James — appears about thirty-eight times. The literal meaning is vapor, breath, mist: that which is real but not stable, present but not graspable, here and immediately not. Chapter 3 contains the most famous passage in the book — 'to every thing there is a season, and a time to every purpose under the heaven' — fourteen pairs of opposites that frame human life as a sequence of arrivals and departures the speaker did not choose. The book closes with the great allegory of old age and the disputed closing verses in which a frame narrator's voice steps back in to deliver a doctrinal summary that the body of the book has just spent twelve chapters refusing to find sufficient.`,
    `A 21st-century reader picks it up because the questions it asks are the questions of modern existential literature — Camus, Beckett, the late twentieth-century novel of disillusionment — asked first, and asked from inside the religious tradition rather than against it. Whatever else Ecclesiastes is, it is one of the most carefully calibrated arguments for the simple goods anywhere in scripture: eat thy bread with joy, drink thy wine with a merry heart, live joyfully with the wife whom thou lovest, for that is thy portion. The argument depends on the dark observations of the rest of the book. The reader who comes to the carpe diem passages without having been through the catalogue of failed projects will read them as a generic advice to enjoyment. The reader who has been through it will find them harder won and more durable.`,
  ],

  chaptersSubtitle: 'All 12 chapters of Ecclesiastes — from the great hevel thesis to the allegory of old age.',
  chaptersLead: `<p>Ecclesiastes moves in four broad arcs. Chapters 1–2 are the prologue and the catalogue of failed projects: wisdom, pleasure, wealth, great works — each tried, each found to be hevel. Chapter 3 is the great seasons poem, 'a time to be born and a time to die.' Chapters 4–6 are observations on oppression, toil, and the anxieties of the social world. Chapters 7–11:6 are the closest the book comes to Proverbs in form — short sayings on wisdom and folly — but inflected by Qoheleth's larger argument. Chapters 11:7–12 are the epilogue: the young man addressed, the allegory of old age, the closing frame, and the disputed summary.</p>`,

  themesByline: 'Five threads through Ecclesiastes',
  themesLead: `Ecclesiastes is a wisdom book that refuses the consolations of the wisdom tradition. It has tried every project the tradition recommends and found that all of them are hevel. Here are the five threads that carry its argument.`,

  groups: [
    {
      label: 'Prologue · Ecclesiastes 1–2',
      subtitle: 'The great hevel thesis and the catalogue of failed projects: wisdom, pleasure, wealth, work.',
      chapters: [1, 2],
    },
    {
      label: 'Observations on time and work · Ecclesiastes 3–6',
      subtitle: 'The seasons poem, oppression, the futility of labour, the anxieties of wealth.',
      chapters: [3, 4, 5, 6],
    },
    {
      label: 'Wisdom and folly · Ecclesiastes 7–11:6',
      subtitle: 'Short sayings, moral observations, and the limits of certainty — Proverbs inflected by Qoheleth.',
      chapters: [7, 8, 9, 10, 11],
    },
    {
      label: 'Epilogue · Ecclesiastes 11:7–12',
      subtitle: 'The address to the young man, the allegory of old age, the closing frame and its disputed summary.',
      chapters: [12],
    },
  ],

  themes: [
    {
      slug: 'hevel',
      title: 'Hevel — vapor, breath, the master word',
      greek: '"Vanity of vanities, all is vanity"',
      preview: 'The book’s central word, repeated about thirty-eight times. The King James renders it ‘vanity’; the Hebrew means vapor, breath, mist — that which is real but not stable, present but not graspable. Qoheleth uses it to characterise the totality of human projects under the sun.',
      essay: [
        `The book’s central word is hevel. The King James renders it ‘vanity’ and the Latin Vulgate vanitas, and these translations have shaped the way the book has been read for most of its history. But hevel does not mean vanity in the modern English sense of self-importance, and it does not quite mean meaninglessness in the existentialist sense either. The literal meaning is breath, vapor, mist — the puff of breath visible on a cold morning, the steam from a cup, the faint exhalation that is gone before one has fixed on it.`,
        `The word names not a quality but a substance, or rather a kind of insubstantiality: that which is real but not stable, present but not graspable, here and immediately not. Qoheleth uses it to characterise the totality of human projects under the sun. ‘Vanity of vanities, saith the Preacher; all is vanity.’ The Hebrew is hevel havelim, the superlative construction (like ‘song of songs’ or ‘holy of holies’): vapor of vapors, the vapor that is most thoroughly vapor.`,
        `The word does at least three things across the book. First, it names the brevity of human life: the days are like breath, gone before they are felt. Second, it names the elusiveness of meaning: the speaker has tried to grasp something solid in his various projects and finds that what he had thought was solid dissolves on contact. Third, it names a kind of absurdity: the gap between the effort one expends and what is finally returned for it, the way the moral order one expected is contradicted by the moral order one observes.`,
        `Modern translators have proposed several alternatives — ‘absurd’ (Michael Fox), ‘futile’ (NASB), ‘meaningless’ (NIV), ‘fleeting,’ ‘vapor’ — and each captures part of the word and loses part. The world Qoheleth describes is not a meaningless world in the cold metaphysical sense; it is a vapor world, a world made of what dissolves, observed by a man who is himself made of the same stuff and who knows it. The word is also, unmistakably, the proper name Abel — the brother killed by Cain in Genesis 4, whose life is the most literally fleeting in the Hebrew Bible. Whether Qoheleth is consciously punning on the name is unprovable; but the resonance is in the Hebrew.`,
      ],
      where: [
        { n: 1, label: 'Ch. 1 (the opening thesis)' },
        { n: 2, label: 'Ch. 2 (the catalogue)' },
        { n: 9, label: 'Ch. 9 (death the leveller)' },
        { n: 12, label: 'Ch. 12 (the closing refrain)' },
      ],
    },
    {
      slug: 'catalogue-of-failed-projects',
      title: 'The catalogue of failed projects',
      greek: '"I have seen all the works that are done under the sun"',
      preview: 'Chapters 1 and 2 contain Qoheleth’s most extended autobiographical passage: project by project, he describes his attempts to find lasting meaning — wisdom, pleasure, great works, wealth — and the failure of each. The reason none of it works is the same in every case: he is going to die.',
      essay: [
        `Chapters 1 and 2 contain Qoheleth’s most extended autobiographical passage, in which he describes, project by project, his attempts to find lasting meaning, and the failure of each. He has applied his heart to seek and search out by wisdom concerning all things done under heaven. Result: hevel and vexation of spirit; for in much wisdom is much grief, and he that increaseth knowledge increaseth sorrow.`,
        `He has tried pleasure: he has not withheld his heart from any joy; he has gathered singers and the delights of the sons of men, musical instruments of all sorts. Behold, all was hevel and vexation of spirit, and there was no profit under the sun. He has tried great works: he has built houses, planted vineyards, made gardens and orchards, made pools of water to water the wood that bringeth forth trees. He has tried wealth: he has gathered silver and gold and the peculiar treasure of kings. None of it has worked.`,
        `The catalogue is extraordinary because the speaker is not setting up a rhetorical contrast in which secular projects fail and a religious project succeeds. He has tried the religious project too — wisdom, the enterprise the rest of the canon recommends — and his complaint is precisely that it has not delivered the solid ground he was looking for. He has tried everything the wisdom tradition offers and found that none of it survives the test he is applying.`,
        `The reason none of it survives is the same in every case. The speaker is going to die. The wise man dies as the fool dies. The labour he has expended will be inherited by someone he does not know and who may be a fool. The legacy he hoped to leave will be forgotten in a generation or two or three. The catalogue does not end in despair, exactly. It ends in a kind of acceptance — that the labour was not nothing, that the days had their pleasure, that the work was good in its moment — but it refuses to grant any of these the permanence the speaker had been hoping to find.`,
      ],
      where: [
        { n: 1, label: 'Ch. 1 (wisdom tried)' },
        { n: 2, label: 'Ch. 2 (pleasure, works, wealth)' },
        { n: 4, label: 'Ch. 4 (competitive labour)' },
        { n: 9, label: 'Ch. 9 (one fate for all)' },
      ],
    },
    {
      slug: 'seasons',
      title: 'A time to every purpose under heaven',
      greek: '"To every thing there is a season"',
      preview: 'Chapter 3 contains the most quoted passage in Ecclesiastes: fourteen pairs of opposites that frame human life as a sequence of arrivals and departures the speaker did not choose. The passage has been read in two opposite directions for two and a half thousand years, and the book refuses to resolve the tension.',
      essay: [
        `Chapter 3 contains the most quoted passage in Ecclesiastes and one of the most quoted in any book of the Bible. ‘To every thing there is a season, and a time to every purpose under the heaven: a time to be born, and a time to die; a time to plant, and a time to pluck up that which is planted; a time to kill, and a time to heal; a time to break down, and a time to build up; a time to weep, and a time to laugh; a time to mourn, and a time to dance.’ Fourteen pairs of opposites, twenty-eight times, the rhythmic ‘and a time to’ carrying the reader through the structure of a life as a sequence of arrivals and departures none of which the speaker has chosen.`,
        `The passage has been read in two opposite directions for two and a half thousand years. The optimistic reading takes the seasons as given by God, ordered, beautiful, the structure of providence — life has its rhythms, and the wise person learns to recognise the season he is in and to act accordingly. This is the reading Pete Seeger’s ‘Turn! Turn! Turn!’ made into a 1960s peace anthem, and it is not a wrong reading; the chapter does say that God has made everything beautiful in his time.`,
        `The pessimistic reading takes the seasons as imposed, beyond control, indifferent to the speaker’s preferences — there is a time to plant, but there is also a time to pluck up; there is a time to love, but there is also a time to hate; the speaker does not get to choose which time he is in, only to recognise it after the fact. This is also not a wrong reading; the chapter goes on to say that man cannot find out the work that God maketh from the beginning to the end, and that there is no good in them but for a man to rejoice and to do good in his life.`,
        `The strength of the chapter is that both readings are available at once, and the speaker is asking the reader to live with the doubleness rather than to resolve it. To every thing there is a season. The seasons come whether one wants them or not. The book knows this is cold comfort and offers it anyway, because it has tried all the warm alternatives and found them hevel.`,
      ],
      where: [
        { n: 3, label: 'Ch. 3 (the seasons poem)' },
        { n: 7, label: 'Ch. 7 (wisdom in adversity)' },
        { n: 11, label: 'Ch. 11 (act before you can be sure)' },
        { n: 12, label: 'Ch. 12 (remember before the evil days come)' },
      ],
    },
    {
      slug: 'carpe-diem',
      title: 'The wisdom of carpe diem',
      greek: '"Eat thy bread with joy"',
      preview: 'Across the book Qoheleth returns repeatedly to a single piece of practical advice that has surprised readers: there is nothing better than to eat, drink, and rejoice in one’s work. This is not a generic hedonism. It is the conclusion of someone who has tried every alternative and found the simple goods are the only ones that do not fail the test he applies.',
      essay: [
        `Across the book Qoheleth keeps returning to a single piece of practical advice that, given the bleakness of his observations, has surprised many readers. There is nothing better, he says, than that a man should rejoice in his own works; for that is his portion. Eat thy bread with joy, and drink thy wine with a merry heart. Live joyfully with the wife whom thou lovest all the days of the life of thy vanity, which he hath given thee under the sun, all the days of thy vanity: for that is thy portion in this life. Whatsoever thy hand findeth to do, do it with thy might; for there is no work, nor device, nor knowledge, nor wisdom, in the grave, whither thou goest.`,
        `The advice has been given the Latin name carpe diem — seize the day — but Qoheleth’s version is darker than Horace’s. Horace’s seize-the-day comes from a man who has decided that life is short and ought to be enjoyed; Qoheleth’s comes from a man who has investigated every alternative project and found that the simple goods of food, drink, work, and the company of one’s wife are the only goods that have not failed his test.`,
        `They have not failed his test because he is not asking them to bear weight they cannot bear. He is not expecting eternal meaning from a meal. He is enjoying the meal. The advice is offered throughout the book in a tone of considered acceptance rather than dismissal. The good things are not nothing. They are the portion God has given. The labour, the wife, the bread, the wine: these are real, and they are gifts, and the wise person receives them as gifts in their season and does not ask them to be more than they are.`,
        `The reader who comes to the carpe diem passages without the rest of the book will read them as a generic advice to enjoyment. The reader who comes to them as the conclusion of the catalogue of failed projects will read them as something harder won and more durable: the discovery that, after all the larger projects have failed to provide what was wanted of them, the smaller ones turn out to be sufficient.`,
      ],
      where: [
        { n: 2, label: 'Ch. 2 (first carpe diem passage)' },
        { n: 5, label: 'Ch. 5 (eat and drink as gift of God)' },
        { n: 9, label: 'Ch. 9 (eat, drink, enjoy — there is no work in the grave)' },
        { n: 11, label: 'Ch. 11 (rejoice while you are young)' },
      ],
    },
    {
      slug: 'closing-frame',
      title: 'The closing verses — Qoheleth’s voice or the editor’s?',
      greek: '"Fear God, and keep his commandments"',
      preview: 'Chapter 12 closes with a passage that has been the most argued-over in the wisdom literature. After twelve chapters refusing to find doctrinal consolation sufficient, a third-person frame voice steps in and delivers the conclusion: fear God and keep his commandments. Whether this is Qoheleth speaking or an editor adding a corrective has been argued for two thousand years.',
      essay: [
        `The book closes with a passage that has been the most argued-over in the wisdom literature. After the great allegory of old age and the haunting refrain ‘vanity of vanities, all is vanity,’ a third-person voice intervenes. ‘And moreover, because the preacher was wise, he still taught the people knowledge; yea, he gave good heed, and sought out, and set in order many proverbs. The preacher sought to find out acceptable words: and that which was written was upright, even words of truth.’ Then: ‘Let us hear the conclusion of the whole matter: Fear God, and keep his commandments: for this is the whole duty of man. For God shall bring every work into judgment, with every secret thing, whether it be good, or whether it be evil.’`,
        `These last verses have been read in three main ways. The first is that they are Qoheleth’s own voice, summing up his book — having shown the failure of every project, he closes with what survives: reverence for God and observance of the commandments, since these are not the same kind of project and are not subject to the same hevel. The second is that they are an editor’s correction, added after Qoheleth’s death to soften the radical edge of the text and make it acceptable for inclusion in the canon.`,
        `The third reading, increasingly favoured by modern critics, is more subtle: the frame voice is real and is doing real editorial work, but is not negating Qoheleth so much as positioning him. Qoheleth’s investigation is true. The conclusion the frame draws — fear God and keep his commandments — is also true. The book exists to hold both at once.`,
        `What no reading has been able to do is make the closing tidy. The book ends on a doctrine the body of the book has just spent twelve chapters refusing to find sufficient, and the canon has kept the tension. Whichever reading one takes, the closing is what makes Ecclesiastes Ecclesiastes: a book that refuses, even at the very end, to resolve the questions it has raised.`,
      ],
      where: [
        { n: 1, label: 'Ch. 1 (the opening thesis the frame encloses)' },
        { n: 11, label: 'Ch. 11 (act before the evil days)' },
        { n: 12, label: 'Ch. 12 (allegory, refrain, closing frame)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Qoheleth',
      role: 'The Preacher, the Teacher',
      body: `The first-person speaker of the book, named in the third person by the frame narrator. Qoheleth is a participle from the Hebrew verb 'to gather' or 'to assemble' — the gatherer, the convener, the one who calls an assembly. The English title 'the Preacher' (King James) and 'the Teacher' (modern translations) both translate this, though neither catches the full sense. The speaker presents himself as son of David, king in Jerusalem — the basis of the traditional Solomonic attribution — but the late Hebrew of the book makes that attribution linguistically impossible. He is more likely a wisdom teacher of Hellenistic Judaea, writing in a literary persona. What his voice does is unique in the Hebrew Bible: he investigates the wisdom claims of his own tradition with the rigour of an honest empiricist, reports what he finds, and refuses to soften it.`,
    },
    {
      name: 'The Frame Narrator',
      role: 'The editor’s voice',
      body: `The third-person voice that opens the book in 1:1 and returns at the very end in 12:8–14. The frame narrator introduces Qoheleth, vouches for his wisdom and craft, and then delivers the closing summary: 'Let us hear the conclusion of the whole matter: Fear God, and keep his commandments.' Whether this voice is the same person as Qoheleth addressing himself in the third person, or a separate editor adding a frame to a text he is preserving, has been argued for centuries. What is undeniable is that the book in its present form has two voices — the long first-person voice of Qoheleth in 1:2 through 12:8, and the third-person frame around it — and the reader must decide what to do with both.`,
    },
    {
      name: 'Death',
      role: 'The leveller',
      body: `Death is the single most important presence in Ecclesiastes after Qoheleth himself, and it is the reason every project the speaker investigates fails the test he sets it. The wise man dies as the fool dies. The rich man’s wealth passes to a son who may not know how to handle it. The legacy of the great is forgotten in a generation. Death does not appear as a personified figure; it appears as the structural fact that sets the limits within which everything Qoheleth investigates is happening. The book’s final allegory of old age in chapter 12 is the only sustained passage in scripture that depicts death as approach rather than event — the hands of the keepers of the house trembling, the strong men bowing themselves, the daughters of music being brought low, the silver cord being loosed and the golden bowl being broken at the cistern.`,
    },
  ],

  castSubtitle: 'The voices of Ecclesiastes — the preacher, the frame, and the figures of his argument.',
  castLead: `<p>Ecclesiastes is not a narrative book in the sense that Genesis or the Gospels are narrative books. It has no plot, no sequence of events, no cast of human characters who act and interact. What it has are voices and figures: Qoheleth’s first-person voice across twelve chapters, the third-person frame narrator at the opening and close, the Solomonic persona that Qoheleth borrows for his royal catalogue, the Young Man addressed in chapter 12, and a set of conceptual figures — hevel, death, the wise man, the fool — that function throughout as almost-characters in the book’s sustained argument.</p>`,
  castGroups: [
    {
      label: 'The speaking voices',
      characters: [
        {
          id: 'qoheleth',
          tag: 'Speaker',
          name: 'Qoheleth',
          epithet: 'The Preacher, the Teacher, the Gatherer',
          body: `The first-person speaker of the book. Presents himself as son of David, king in Jerusalem, surpassing all who were before him in Jerusalem in wisdom — the Solomonic persona borrowed to give the catalogue of failed projects its rhetorical authority. The historical author is not Solomon; the late Hebrew of the book fixes composition in the third century BCE, in Hellenistic Judaea. What Qoheleth’s voice does is investigate the wisdom claims of his own tradition with the rigour of an honest empiricist, report what he finds, and refuse to soften it. He is not an unbeliever — God appears throughout as the giver of life and the one to whom all things return — but he refuses to flatter the doctrines that the rest of the wisdom tradition has sometimes flattered. The most honest voice in the canon.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        },
        {
          id: 'frame-narrator',
          tag: 'Editor',
          name: 'The Frame Narrator',
          epithet: "The editor's voice",
          body: `The third-person voice that opens the book (‘the words of Qoheleth, the son of David, king in Jerusalem’) and returns at the very end in 12:8–14. Vouches for Qoheleth’s wisdom and craft, then delivers the closing summary: ‘Fear God, and keep his commandments: for this is the whole duty of man.’ Whether this is Qoheleth addressing himself in the third person, or a later editor adding a frame to bring the text within the bounds of what the canon could keep, has been argued for two thousand years. The book keeps the tension. It does not resolve it.`,
          appears: [1, 12],
        },
      ],
    },
    {
      label: 'The figures of the argument',
      characters: [
        {
          id: 'solomonic-persona',
          tag: 'Persona',
          name: 'The King in Jerusalem',
          epithet: 'The Solomonic persona',
          body: `The figure Qoheleth presents in chapters 1 and 2: a king who has built houses, planted vineyards, gathered silver and gold and the peculiar treasure of kings, and surpassed all who were before him in Jerusalem. The persona is Solomonic; the historical author is not Solomon. The strategy is one familiar from ancient Near Eastern wisdom literature, in which a king or sage is given a literary voice that the actual writer borrows to lend authority to the investigation. Only Solomon, in the Hebrew imagination, could plausibly claim to have tried every great project and to have had the resources to test the wisdom enterprise to its limits. By placing the failure in the mouth of the king who had everything, Qoheleth makes the failure systemic.`,
          appears: [1, 2],
        },
        {
          id: 'young-man',
          tag: 'Addressee',
          name: 'The Young Man',
          epithet: 'Remember now thy Creator',
          body: `Chapter 12 opens with a direct address to a figure who has been implicit throughout the book and is now named: ‘Remember now thy Creator in the days of thy youth, while the evil days come not, nor the years draw nigh, when thou shalt say, I have no pleasure in them.’ He is the addressee of the closing chapter and, by extension, of the whole book. He is being told to remember his Creator now, before old age comes, because the catalogue of failures the speaker has just performed is not an argument against doing the religious work; it is an argument for doing it without the false expectations the rest of the wisdom tradition has sometimes encouraged. The book is not addressed to the dying. It is addressed to the young, who still have time to receive its corrections.`,
          appears: [11, 12],
        },
        {
          id: 'hevel',
          tag: 'Concept',
          tagClass: 'creature',
          name: 'Hevel',
          epithet: 'The personified vapor',
          body: `Treat the master word of the book as a figure, because the book treats it that way. Hevel — vapor, breath, mist — appears about thirty-eight times across twelve chapters, and the cumulative effect gives the word a presence in the text that approaches personification. Hevel is what every project Qoheleth investigates turns out to be. Hevel is what the speaker’s days are made of. Hevel is what is left when the speaker has finished his catalogue. The word is also, unmistakably, the proper name Abel — the brother killed by Cain in Genesis 4, whose life is the most literally fleeting in the Hebrew Bible. The resonance is in the Hebrew, and the readers who first heard the book recited would have heard, behind every repetition of the word, the echo of the brother whose life was breath and was over.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        },
        {
          id: 'death',
          tag: 'Force',
          tagClass: 'creature',
          name: 'Death',
          epithet: 'The leveller',
          body: `Death is the single most important presence in Ecclesiastes after Qoheleth himself, and it is the reason every project the speaker investigates fails the test he sets it. The wise man dies as the fool dies. The rich man’s wealth passes to a son who may not know how to handle it. The legacy of the great is forgotten in a generation. Death does not appear as a personified figure with a scythe; it appears as the structural fact that sets the limits within which everything Qoheleth investigates is happening. The book’s final allegory of old age in chapter 12 is the only sustained passage in scripture that depicts death as approach rather than event: the hands of the keepers of the house trembling, the strong men bowing themselves, the daughters of music being brought low, the silver cord loosed, the golden bowl broken at the cistern.`,
          appears: [2, 3, 4, 5, 6, 7, 8, 9, 11, 12],
        },
      ],
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'Vanity of Vanities',
      hook: 'The opening declaration. Qoheleth introduces himself, states the great hevel thesis, and begins with wisdom — the first project that fails the test.',
      summary: [
        `<strong>Ecclesiastes 1</strong> opens with the frame narrator's identification of the speaker — Qoheleth, son of David, king in Jerusalem — and then immediately with Qoheleth's thesis: <em>hevel havelim, vanity of vanities, all is vanity</em>. The opening poem (1:2–11) makes the case cosmologically: one generation passes, another comes, the earth abides. The sun rises and sets and hurries to its place. The wind goes south, turns north, and returns again. The rivers run to the sea, and the sea is not full. There is nothing new under the sun. Whatever has been is what will be; whatever has been done is what will be done.`,
        `The second half of the chapter turns to wisdom: Qoheleth has given his heart to seek and search out by wisdom concerning all things done under heaven. This travail has God given to the sons of man to be exercised therewith. He has seen all the works that are done under the sun, and behold, all is vanity and vexation of spirit. That which is crooked cannot be made straight; and that which is wanting cannot be numbered. In much wisdom is much grief, and he that increaseth knowledge increaseth sorrow. The first project is tried. It fails.`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'frame-narrator', name: 'The Frame Narrator' },
        { id: 'hevel', name: 'Hevel' },
      ],
      themes: [
        { slug: 'hevel', label: 'Hevel' },
        { slug: 'catalogue-of-failed-projects', label: 'Catalogue of failed projects' },
      ],
      tour: 'The great thesis. One generation passes, another comes. Wisdom tried and found to be hevel. The book announces its argument in twelve verses.',
    },
    {
      n: 2,
      title: 'I Said in My Heart',
      hook: 'The catalogue continues: pleasure, great works, wealth — each tried, each found wanting. The first carpe diem passage emerges from the ruins.',
      summary: [
        `<strong>Ecclesiastes 2</strong> is the most extended autobiographical passage in the book: pleasure tried (laughter, wine, fools, women singers, musical instruments), great works tried (houses, vineyards, gardens, orchards, pools of water), and wealth tried (silver and gold, the peculiar treasure of kings). In each case the verdict is the same: hevel and vexation of spirit, no profit under the sun.`,
        `The chapter then turns to the comparison of wisdom and folly. The wise man has eyes in his head; the fool walks in darkness. But one event happens to them both. The wise man dies as the fool dies. There is no remembrance of the wise more than of the fool, seeing that which now is shall in the days to come be forgotten. This also is hevel. Qoheleth hates all his labour because he must leave it to someone who comes after him, someone he does not know, who may be a fool.`,
        `Out of the despair comes the first carpe diem passage: there is nothing better for a person than to eat and drink and find enjoyment in his toil. This also is from the hand of God. For apart from him, who can eat or who can have enjoyment? To the one who pleases God, wisdom and knowledge and joy; to the sinner, the business of gathering and collecting, only to give to one who pleases God. This also is hevel and vexation of spirit.`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'solomonic-persona', name: 'The King in Jerusalem' },
        { id: 'hevel', name: 'Hevel' },
        { id: 'death', name: 'Death' },
      ],
      themes: [
        { slug: 'catalogue-of-failed-projects', label: 'Catalogue of failed projects' },
        { slug: 'carpe-diem', label: 'Carpe diem' },
        { slug: 'hevel', label: 'Hevel' },
      ],
      tour: 'Pleasure, works, wealth — all tried, all hevel. The wise man and the fool die the same death. And then: eat, drink, find enjoyment. The first glimpse of where the book is going.',
    },
    {
      n: 3,
      title: 'A Time for Everything',
      hook: 'The most famous passage in the book: fourteen pairs of opposites, a time to be born and a time to die. And then: the deep anxiety that God has made everything beautiful in its time, but man cannot find out the work God has done from beginning to end.',
      summary: [
        `<strong>Ecclesiastes 3</strong> contains the most quoted passage in the book: the seasons poem. A time to be born and a time to die; a time to plant and a time to pluck up; a time to kill and a time to heal; a time to break down and a time to build up; a time to weep and a time to laugh; a time to mourn and a time to dance. Fourteen pairs of opposites, structured with the rhythmic ‘and a time to’ that has carried readers across two and a half millennia.`,
        `But the chapter immediately presses the knife in. What gain has the worker from his toil? God has made everything beautiful in his time. He has also set eternity in the human heart, yet no one can find out what God has done from beginning to end. The reader cannot choose his season. He can only recognise it after the fact. There is nothing better for a person than that he should eat and drink and find enjoyment in his toil. This also is from the hand of God.`,
        `The chapter closes with the theme that will recur throughout: the same fate awaits humans and animals. Both are breath — hevel. All go to one place; all are from the dust, and to dust all return. Who knows whether the spirit of man goes upward and the spirit of the beast goes down to the earth? Qoheleth has no answer. He concludes: there is nothing better than that a man should rejoice in his work, for that is his lot. Who can bring him to see what will be after him?`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'hevel', name: 'Hevel' },
        { id: 'death', name: 'Death' },
      ],
      themes: [
        { slug: 'seasons', label: 'A time for everything' },
        { slug: 'hevel', label: 'Hevel' },
        { slug: 'carpe-diem', label: 'Carpe diem' },
      ],
      tour: 'The seasons poem. Fourteen pairs of opposites. God has made everything beautiful in its time. Man cannot find out the work God has done. Humans and animals share one fate.',
    },
    {
      n: 4,
      title: 'Oppression and Rivalry',
      hook: 'Qoheleth turns to the social world: oppression, envy, the loneliness of the solitary toiler, the value of two over one. Even the king who was young and poor and came to rule will be forgotten by those who come after.',
      summary: [
        `<strong>Ecclesiastes 4</strong> moves from cosmological hevel to social hevel. Qoheleth considers the oppressed and their tears, with no one to comfort them; the power on the side of their oppressors, with no one to comfort the oppressed. He congratulates the dead more than the living; better than both is he who has not yet been, who has not seen the evil work that is done under the sun.`,
        `Then envy: he has seen that for all toil and all skill in work it comes from a man's envy of his neighbor. This also is hevel and a striving after wind. The fool folds his hands and eats his own flesh. Better is a handful of quietness than two hands full of toil and a striving after wind. Then the solitary toiler: there is one alone, without a second; he has neither son nor brother, yet there is no end to all his toil, and his eyes are never satisfied with riches. For whom am I toiling and depriving myself of pleasure? This also is hevel and an unhappy business.`,
        `The chapter closes with a short wisdom poem on the value of companionship — two are better than one; a threefold cord is not quickly broken — and a reflection on the mutability of power. A poor but wise youth is better than an old but foolish king. Even so, those who come after will not rejoice in him. Surely this also is hevel and a striving after wind.`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'hevel', name: 'Hevel' },
      ],
      themes: [
        { slug: 'hevel', label: 'Hevel' },
        { slug: 'catalogue-of-failed-projects', label: 'Catalogue of failed projects' },
      ],
      tour: 'Oppression with no comforter. Envy as the driver of labour. The solitary toiler with no one to share what he has gathered. Two are better than one. The king forgotten by those who come after.',
    },
    {
      n: 5,
      title: 'Fear God, Beware of Vows',
      hook: 'A chapter of practical counsel: how to approach God, how to handle vows, the dangers of wealth, the sleeplessness of the rich. And then the carpe diem passage that names God as the giver of the portion.',
      summary: [
        `<strong>Ecclesiastes 5</strong> opens with counsel on approaching God: guard your steps; draw near to listen rather than to offer the sacrifice of fools; let not your mouth lead you into sin. God is in heaven and you are on earth; therefore let your words be few. When you vow a vow to God, do not delay paying it, for he has no pleasure in fools; pay what you vow. Better that you should not vow than that you should vow and not pay.`,
        `The chapter turns to wealth: he who loves money will not be satisfied with money; nor he who loves wealth with his income. This also is hevel. When goods increase, they increase who eat them; and what advantage has their owner but to see them with his eyes? Sweet is the sleep of a laborer, whether he eats little or much; but the full stomach of the rich will not let him sleep. A grievous evil: riches kept by their owner to his hurt, and then those riches perish in a bad venture, and he has nothing in his hand.`,
        `The chapter closes with the carpe diem passage in its clearest form: this is what I have seen to be good and fitting — to eat and drink and find enjoyment in all the toil with which one toils under the sun the few days of his life that God has given him, for this is his lot. Everyone also to whom God has given wealth and possessions and power to enjoy them, and to accept his lot and rejoice in his toil — this is the gift of God. For he will not much remember the days of his life because God keeps him occupied with joy in his heart.`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'hevel', name: 'Hevel' },
      ],
      themes: [
        { slug: 'carpe-diem', label: 'Carpe diem' },
        { slug: 'hevel', label: 'Hevel' },
      ],
      tour: 'How to approach God. The dangers of vows. The rich man whose sleep is troubled by his wealth. And then: eat, drink, find enjoyment — this is the gift of God.',
    },
    {
      n: 6,
      title: 'The Unsatisfied Soul',
      hook: 'The grievous evil of the man who has everything — wealth, possessions, honor, sons — yet God does not give him power to enjoy it. Better to be a stillborn child than such a man.',
      summary: [
        `<strong>Ecclesiastes 6</strong> is a concentrated meditation on the unsatisfied soul. There is a grievous evil that Qoheleth has seen: a man to whom God gives wealth, possessions, and honor, so that he lacks nothing of all that he desires, yet God does not give him power to enjoy them, but a stranger enjoys them. This is hevel; it is a grievous affliction.`,
        `If a man fathers a hundred children and lives many years, so that the days of his years are many, but his soul is not satisfied with life's good things, and he also has no burial, Qoheleth says that a stillborn child is better off than he. For it comes in vanity and goes in darkness, and in darkness its name is covered; moreover, it has not seen the sun or known anything, yet it finds rest rather than he.`,
        `The chapter closes with questions that resist resolution: what advantage has the wise man over the fool? And what does the poor man have who knows how to conduct himself before the living? Better is the sight of the eyes than the wandering of the appetite; this also is hevel and a striving after wind. Whatever has come to be has already been named, and it is known what man is, and that he is not able to dispute with one stronger than he. The more words, the more vanity, and what is the advantage to man?`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'hevel', name: 'Hevel' },
        { id: 'death', name: 'Death' },
      ],
      themes: [
        { slug: 'hevel', label: 'Hevel' },
        { slug: 'catalogue-of-failed-projects', label: 'Catalogue of failed projects' },
      ],
      tour: 'Everything given but the power to enjoy it. A hundred children, many years, no satisfaction. Better the stillborn child. The soul that cannot be satisfied.',
    },
    {
      n: 7,
      title: 'Better Is the End',
      hook: 'The chapter closest to Proverbs in form — a long sequence of ‘better than’ comparisons — but inflected by Qoheleth’s larger argument. The day of death is better than the day of birth. Sorrow is better than laughter. The end of a thing is better than its beginning.',
      summary: [
        `<strong>Ecclesiastes 7</strong> opens with a cluster of ‘better than’ comparisons in the Proverbs style: a good name is better than precious ointment, and the day of death is better than the day of birth. It is better to go to the house of mourning than to go to the house of feasting, for this is the end of all mankind. Sorrow is better than laughter, for by sadness of face the heart is made glad. The heart of the wise is in the house of mourning, but the heart of fools is in the house of mirth.`,
        `The chapter moves through practical wisdom on bribes, anger, the past and the present (‘say not, Why were the former days better than these, for it is not from wisdom that you ask this’), and then to the limits of the wisdom enterprise itself. In my vain life I have seen everything: there is a righteous man who perishes in his righteousness, and there is a wicked man who prolongs his life in his evildoing. Be not overly righteous, and do not make yourself too wise. Why should you destroy yourself? This is Qoheleth's most unsettling practical counsel: excessive righteousness is as dangerous as excessive wickedness.`,
        `The chapter closes with the famous search: among a thousand I found one man upright, but a woman among all these I have not found. God made man upright, but they have sought out many schemes. This passage has generated centuries of commentary on Qoheleth's attitude toward women; the most defensible reading is that it reflects the limited social world of his observation, not a theological claim about female nature.`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'hevel', name: 'Hevel' },
        { id: 'death', name: 'Death' },
      ],
      themes: [
        { slug: 'seasons', label: 'A time for everything' },
        { slug: 'hevel', label: 'Hevel' },
      ],
      tour: 'The day of death better than the day of birth. Sorrow better than laughter. Be not overly righteous. One upright man in a thousand; a woman among all these I have not found.',
    },
    {
      n: 8,
      title: 'The Power of the King',
      hook: 'Counsel on how to navigate the court of a king whose word is supreme. And then the deepest challenge to the moral order: the wicked who are buried with honor, the righteous who are treated as if they had done evil. The heart is set to do evil because sentence against evil is not executed speedily.',
      summary: [
        `<strong>Ecclesiastes 8</strong> opens with a reflection on wisdom and the power of the king: keep the king's command, and because of God's oath, be not hasty to go from his presence. Stand not in an evil cause, for he does whatever he pleases. Whoever keeps a command will know no evil thing, and the wise heart will know the proper time and the just way. For there is a time and a way for everything, although man's trouble lies heavy on him.`,
        `The chapter then confronts the failure of the moral order directly. There are righteous people to whom it happens according to the deeds of the wicked, and there are wicked people to whom it happens according to the deeds of the righteous. I said that this also is hevel. And I commend joy, for man has nothing better under the sun but to eat and drink and be joyful, for this will go with him in his toil through the days of his life that God has given him under the sun.`,
        `The chapter closes with the limits of wisdom: however much man may toil in seeking, he will not find it out. Even though a wise man claims to know, he cannot find it out. Qoheleth has seen all the work of God, that man cannot find out the work that is done under the sun. No matter how much man toils in seeking, he will not find it out. Even if a wise man claims to know, he cannot find it out.`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'hevel', name: 'Hevel' },
        { id: 'death', name: 'Death' },
      ],
      themes: [
        { slug: 'hevel', label: 'Hevel' },
        { slug: 'carpe-diem', label: 'Carpe diem' },
        { slug: 'catalogue-of-failed-projects', label: 'Catalogue of failed projects' },
      ],
      tour: 'Navigate the king’s court. The wicked buried with honor; the righteous treated as evildoers. Because sentence is not executed speedily, the heart of man is set to do evil. And commend joy.',
    },
    {
      n: 9,
      title: 'One Fate for All',
      hook: 'The same fate — death — comes to the righteous and the wicked, the clean and the unclean, the one who swears and the one who fears an oath. The living know they will die; the dead know nothing. Eat, drink, enjoy — there is no work in the grave.',
      summary: [
        `<strong>Ecclesiastes 9</strong> is the darkest chapter in the book on the question of death. The righteous and the wise and their deeds are in the hand of God. Whether it is love or hate, man does not know; both are before him. It is the same for all: the same event happens to the righteous and the wicked, to the good and the evil, to the clean and the unclean. This is an evil in all that is done under the sun: that the same event happens to all.`,
        `The living know that they will die, but the dead know nothing, and they have no more reward, for the memory of them is forgotten. There is no work or thought or knowledge or wisdom in Sheol, where you are going. This is Qoheleth's starkest statement on what happens after death: silence, forgetting, no reward.`,
        `Out of this comes the carpe diem passage in its most urgent form: go, eat your bread with joy, and drink your wine with a merry heart, for God has already approved what you do. Let your garments be always white. Let not oil be lacking on your head. Enjoy life with the wife whom you love, all the days of your vain life that he has given you under the sun. Whatever your hand finds to do, do it with your might, for there is no work or thought or knowledge or wisdom in Sheol, where you are going. The chapter closes with an observation that has appealed to every reader since: time and chance happen to them all. The race is not to the swift, nor the battle to the strong.`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'hevel', name: 'Hevel' },
        { id: 'death', name: 'Death' },
      ],
      themes: [
        { slug: 'hevel', label: 'Hevel' },
        { slug: 'carpe-diem', label: 'Carpe diem' },
        { slug: 'catalogue-of-failed-projects', label: 'Catalogue of failed projects' },
      ],
      tour: 'One fate for all: righteous, wicked, clean, unclean. The dead know nothing. No work in Sheol. Go, eat your bread with joy. Time and chance happen to them all.',
    },
    {
      n: 10,
      title: 'Wisdom and Folly',
      hook: 'A chapter of proverbs on wisdom and folly, the fool in power and the wise in low places, the dangers of the court, the laborer whose toil profits nothing if he lacks the wisdom to direct it.',
      summary: [
        `<strong>Ecclesiastes 10</strong> is the most Proverbs-like chapter in the book: a sequence of short observations on wisdom and folly. Dead flies make the perfumer’s ointment give off a stench; so a little folly outweighs wisdom and honor. A wise man’s heart inclines him to the right, but a fool’s heart to the left. Even in your thoughts, do not curse the king, nor in your bedroom curse the rich, for a bird of the air will carry your voice.`,
        `The chapter reflects on the inversion of natural order — folly set in many high places, and the rich sitting in a low place; slaves on horses, and princes walking on the ground. It offers practical counsel on the risks of the court, the futility of a ruler who starts early drinking, and the laborer whose toil is wasted without the wisdom to direct it. Qoheleth is not drawing a moral lesson; he is observing a world in which the connections between virtue and outcome have come loose.`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'hevel', name: 'Hevel' },
      ],
      themes: [
        { slug: 'hevel', label: 'Hevel' },
      ],
      tour: 'Dead flies ruin the perfumer’s ointment. The fool in high places, the wise man low. Servants on horses, princes on foot. Navigate the court carefully.',
    },
    {
      n: 11,
      title: 'Cast Your Bread',
      hook: 'The chapter of action in uncertainty: cast your bread on the waters; give a portion to seven, or even to eight; sow in the morning, and at evening withhold not your hand, for you do not know which will prosper. Rejoice while you are young. Remember that the days of darkness will be many.',
      summary: [
        `<strong>Ecclesiastes 11</strong> turns toward action in the face of uncertainty. Cast your bread upon the waters, for you will find it after many days. Give a portion to seven, or even to eight, for you know not what disaster may happen on earth. He who watches the wind will not sow, and he who looks at the clouds will not reap. As you do not know the way the spirit comes to the bones in the womb of a woman with child, so you do not know the work of God who makes everything. In the morning sow your seed, and at evening withhold not your hand, for you do not know which will prosper.`,
        `The chapter turns to the young man: light is sweet, and it is pleasant for the eyes to see the sun. So if a person lives many years, let him rejoice in them all; but let him remember that the days of darkness will be many. All that comes is hevel. Rejoice, O young man, in your youth, and let your heart cheer you in the days of your youth. Walk in the ways of your heart and the sight of your eyes. But know that for all these things God will bring you into judgment. Remove vexation from your heart, and put away pain from your body, for youth and the dawn of life are hevel.`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'young-man', name: 'The Young Man' },
        { id: 'hevel', name: 'Hevel' },
      ],
      themes: [
        { slug: 'carpe-diem', label: 'Carpe diem' },
        { slug: 'seasons', label: 'A time for everything' },
        { slug: 'hevel', label: 'Hevel' },
      ],
      tour: 'Cast your bread on the waters. He who watches the wind will not sow. Act without certainty. Rejoice while you are young. The days of darkness will be many.',
    },
    {
      n: 12,
      title: 'Remember Your Creator',
      hook: 'The great allegory of old age — the keepers of the house trembling, the strong men bowing, the silver cord loosed, the golden bowl broken. Then the frame narrator’s voice returns with the closing summary: fear God and keep his commandments. Two thousand years of argument about whose voice this is.',
      summary: [
        `<strong>Ecclesiastes 12</strong> opens with the closing address to the young man: Remember your Creator in the days of your youth, before the evil days come and the years draw near of which you will say, ‘I have no pleasure in them.’ Then the great allegory of old age: the sun and the light and the moon and the stars are darkened; the keepers of the house tremble, and the strong men are bent; the grinders cease because they are few, and those who look through the windows are dimmed; the doors on the street are shut. The sound of the grinding is low, and one rises up at the sound of a bird, and all the daughters of song are brought low.`,
        `The allegory reaches its climax: the silver cord is snapped, the golden bowl is broken, the pitcher is shattered at the fountain, and the wheel broken at the cistern. The dust returns to the earth as it was, and the spirit returns to God who gave it. Vanity of vanities, says the Preacher; all is vanity.`,
        `Then the frame narrator’s voice steps back in. He praises Qoheleth’s craft: the Preacher sought to find words of delight, and uprightly he wrote words of truth. Of making many books there is no end, and much study is a weariness of the flesh. The conclusion of the whole matter: Fear God and keep his commandments, for this is the whole duty of man. For God will bring every deed into judgment, with every secret thing, whether good or evil. The book ends on the doctrine the body of the book has spent twelve chapters refusing to find sufficient, and the tension — two thousand years of it — remains unresolved.`,
      ],
      appears: [
        { id: 'qoheleth', name: 'Qoheleth' },
        { id: 'frame-narrator', name: 'The Frame Narrator' },
        { id: 'young-man', name: 'The Young Man' },
        { id: 'hevel', name: 'Hevel' },
        { id: 'death', name: 'Death' },
      ],
      themes: [
        { slug: 'closing-frame', label: 'The closing frame' },
        { slug: 'hevel', label: 'Hevel' },
        { slug: 'seasons', label: 'A time for everything' },
        { slug: 'carpe-diem', label: 'Carpe diem' },
      ],
      tour: 'The allegory of old age. The silver cord loosed, the golden bowl broken. Dust returns to earth, spirit to God. Vanity of vanities. Fear God and keep his commandments. The frame closes on a doctrine twelve chapters in the making.',
    },
  ],
}
