// Proverbs — SEO page data for build-seo-pages.cjs
// Hebrew wisdom literature, traditionally Solomonic core, post-exilic compilation.
// Voice: literary, declarative present.

const chapters = require('/tmp/bible-proverbs-chunk-1.json')

module.exports = {
  id: 'bible-proverbs',
  title: 'Proverbs',
  author: 'Multiple (traditionally Solomon, also Agur, Lemuel)',
  byline: 'c. 10th–3rd c. BCE · Hebrew Bible · Writings · Wisdom',
  titleAccent: 'a guided tour',
  hook: 'A handbook of two-line sayings and nine sustained discourses on how to live well. At its centre stands the strangest figure in the Hebrew Bible: Wisdom herself, in the streets, calling to whoever will hear.',
  genre: ['Wisdom literature', 'Hebrew Bible', 'Poetry', 'Philosophy'],
  themesBlurb: `The two ways, the fear of the Lord, Lady Wisdom, the proverb form, and where the book's confidence ends.`,
  castBlurb: 'The figures of Proverbs',
  castDesc: `Lady Wisdom, Lady Folly, the instructing father, and the woman of valour who closes the book.`,

  about: [
    `<em>Proverbs</em> is the handbook of practical wisdom from ancient Israel. It collects, in nine opening discourses and then in long sequences of two-line sayings, the working knowledge of how to live well — in business, in marriage, in friendship, in speech, in money, in temper, in the company of fools and the company of the wise. It opens with a father warning his son and closes with a hymn to the woman who runs a household, and at its centre stands the strangest figure in the Hebrew Bible: Wisdom herself, in the streets, calling to whoever will hear.`,
    `The book divides into recognisable collections. Chapters 1–9 are nine sustained instructional discourses, almost certainly the latest material and the editorial frame for everything that follows. Chapters 10–22:16 are the first major Solomonic collection of antithetical two-line proverbs. Chapters 22:17–24:34 are the Sayings of the Wise, closely related to the Egyptian Instruction of Amenemope. Chapters 25–29 are a second Solomonic collection, copied by the men of Hezekiah. Chapter 30 contains the Sayings of Agur, a non-Israelite sage. Chapter 31 gives the Sayings of King Lemuel and closes with the great alphabetic poem on the eshet chayil — the woman of valour whose price is far above rubies. The book has been read for two and a half millennia as the primary biblical source for reflection on speech, work, money, sex, friendship, and the discipline of children.`,
  ],

  chaptersSubtitle: 'All 31 chapters summarized — from the opening discourses to the woman of valour.',
  chaptersLead: `<p>Proverbs divides into five distinct collections across 31 chapters. The opening discourses (chapters 1–9) are sustained essays addressed by a father to his son; they should be read in sequence. The two long Solomonic collections (10–22:16 and 25–29) are best sampled column by column, not read straight through. The Words of the Wise (22:17–24:34), Agur's oracle (30), and Lemuel's instruction with the closing eshet chayil poem (31) are short enough to read in a single sitting each.</p>`,

  tour: `Proverbs reads in two distinct registers. The opening discourses (chapters 1–9) are sustained essays on wisdom and folly, and they should be read continuously, in two or three sittings — chapter 1 (Wisdom in the streets), chapter 2 (the conditional promise), chapters 3–7 (the sustained warnings against the strange woman), chapter 8 (Wisdom's great speech), chapter 9 (Wisdom and Folly's competing banquets). Then the two-line proverbs of chapters 10–22:16 and 25–29 should be sampled, not read straight through. Read a column at a time and notice the patterns: speech, money, anger, the household, the king, the fool. Chapter 30 (Agur's numerical sayings) and chapter 31 (the woman of valour) are deliberately set apart and should be read individually. Read the book at least three times in a year; the proverbs require return, not completion.`,

  themesByline: 'Five threads through the book',
  themesLead: `Proverbs is the most confident of the wisdom books — it assumes the world is morally ordered and that wisdom can be acquired and rewarded. These five themes trace what the book says, how it says it, and where its confidence finds its limit.`,

  groups: [
    { label: 'The discourses · Chapters 1–9', subtitle: 'Nine sustained essays from father to son. Wisdom and Folly as two women calling from the city.', chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { label: 'Solomon collection I · Chapters 10–22', subtitle: 'The first and largest collection of Solomonic two-line antithetical proverbs.', chapters: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22] },
    { label: 'Words of the Wise · Chapters 22–24', subtitle: 'The sayings related to the Egyptian Instruction of Amenemope, plus a short appendix.', chapters: [23, 24] },
    { label: 'Solomon collection II · Chapters 25–29', subtitle: 'Copied by the men of Hezekiah — the second Solomonic collection.', chapters: [25, 26, 27, 28, 29] },
    { label: 'Agur and Lemuel · Chapters 30–31', subtitle: `Agur's oracle and numerical proverbs. Lemuel's instruction and the woman of valour.`, chapters: [30, 31] },
  ],

  themes: [
    {
      slug: 'two-ways',
      title: 'The two ways',
      greek: 'wisdom and folly, the only two roads',
      preview: `Proverbs is built on a single foundational distinction: wisdom and folly, the way of the righteous and the way of the wicked. The two are not equally weighted alternatives but the only two roads available, and the book's pedagogy assumes that every choice — large or trivial — is a step on one or the other.`,
      essay: [
        `The framework appears in the first chapter and is fully in place by the last verse of chapter 9. Chapter 1 introduces it with the call: 'My son, if sinners entice thee, consent thou not.' Chapter 4 develops it: 'The path of the just is as the shining light, that shineth more and more unto the perfect day. The way of the wicked is as darkness; they know not at what they stumble.' By the end of chapter 9 Wisdom has built her house, killed her beasts, mingled her wine, and sent forth her maidens to call from the high places of the city: 'Whoso is simple, let him turn in hither.' Folly is also there, sitting at the door of her house in the high places of the city, calling to passers-by: 'Stolen waters are sweet, and bread eaten in secret is pleasant.' The two voices are deliberately structurally parallel. The reader is being trained to hear them in the same register.`,
        `The framework is what most twentieth-century readers find both productive and uncomfortable. Productive because the moral imagination that takes for granted a binary between virtue and vice — between the way that leads to life and the way that leads to death — has resources that more agnostic moral pictures lack; the proverbs deliver their punch precisely because they assume the binary. Uncomfortable because the binary, taken without the corrections of Job and Ecclesiastes, can curdle into a triumphalism that the lived world does not support.`,
        `The canon's decision to keep all three wisdom books is the canon's way of holding the two ways framework as a framework — true at the level of pedagogy and the orientation of a life, partial at the level of theodicy. The two ways is where one starts. It is not the whole of what the Hebrew Bible has to say.`,
      ],
      where: [
        { n: 1, label: 'Chapter 1 (Wisdom calls)' },
        { n: 4, label: 'Chapter 4 (the shining path)' },
        { n: 9, label: 'Chapter 9 (the two banquets)' },
        { n: 14, label: 'Chapter 14 (the way that seems right)' },
      ],
    },
    {
      slug: 'fear-of-the-lord',
      title: 'The fear of the Lord as the beginning of knowledge',
      greek: '"The fear of the Lord is the beginning of wisdom"',
      preview: `The most quoted line in Proverbs is the programmatic statement of the book's epistemology: the fear of the Lord is the beginning of knowledge. The claim is that no programme of acquiring wisdom can succeed if it begins from neutrality with respect to that question.`,
      essay: [
        `'The fear of the Lord is the beginning of knowledge: but fools despise wisdom and instruction.' (1:7) The line returns at 9:10 in slightly varied form and is presupposed throughout. What the book means by yirat YHWH — the fear of the Lord — is not terror in the modern sense. It is the disposition of reverence, awe, and acknowledgment that the moral order is not of one's own making, that one is accountable to a wisdom prior to one's own, and that the universe one is trying to live in well is governed by a God whose existence one is taking seriously.`,
        `The epistemological claim is striking. Most modern epistemology assumes the opposite — that the inquirer must begin in neutrality, suspending commitments, in order for the inquiry to be honest. Proverbs holds that some inquiries are not available to neutrality, that the wisdom inquiry is one of them, and that the disposition to take the moral structure of reality seriously is itself the precondition of seeing what one is trying to see.`,
        `The claim has resonance well beyond the religious sphere; analogous claims are made in moral philosophy by Iris Murdoch and Charles Taylor about the role of attention and orientation in ethical perception. What Proverbs adds is a doctrine: the orientation in question is not just attention to the moral; it is reverence toward a particular God, and without that reverence the wisdom enterprise cannot get started. Chapter 16 develops this from the inside: 'The Lord weighs the heart.' Chapter 21: 'The horse is prepared against the day of battle, but safety is of the Lord.' Divine sovereignty is not one theme among others; it is the ceiling of the entire room.`,
      ],
      where: [
        { n: 1, label: 'Chapter 1 (the programmatic line)' },
        { n: 9, label: 'Chapter 9 (the fear of the Lord is the beginning of wisdom)' },
        { n: 15, label: 'Chapter 15 (the Lord is in every place)' },
        { n: 16, label: 'Chapter 16 (the Lord weighs the heart)' },
      ],
    },
    {
      slug: 'lady-wisdom',
      title: 'Lady Wisdom and Lady Folly',
      greek: '"She crieth at the gates, at the entry of the city"',
      preview: `The most striking literary invention of Proverbs is the personification of Wisdom and Folly as two women, calling competing invitations to the simple young man passing through the city. Their great confrontation in chapters 8 and 9 is one of the most consequential passages in the Hebrew Bible.`,
      essay: [
        `Wisdom — Hebrew Hokmah, a feminine noun, personified as a woman in part because of the grammar — stands in the chief place of concourse, in the openings of the gates, and lifts up her voice. 'Unto you, O men, I call; and my voice is to the sons of man.' Her great speech in chapter 8 is one of the boldest passages in the Hebrew Bible. She declares that the Lord possessed her in the beginning of his way, before his works of old. She was set up from everlasting, from the beginning, or ever the earth was. When he prepared the heavens, she was there; when he set a compass upon the face of the deep, she was by him as one brought up with him; she was daily his delight, rejoicing always before him, rejoicing in the habitable part of the earth, and her delights were with the sons of men.`,
        `The passage gave later Jewish and Christian interpretation a textual basis for thinking about pre-existent wisdom — for the doctrine of personified Wisdom in the deuterocanonical Wisdom of Solomon, for the rabbinic identification of Wisdom with Torah, and for the early Christian reading of these chapters as referring to Christ as the pre-existent Wisdom of God. Paul's 'Christ the wisdom of God' in 1 Corinthians 1, the Logos of John 1, and the Wisdom Christology of Hebrews 1 all have a foot in these chapters.`,
        `Lady Folly is Wisdom's deliberate counterpart. She also stands in the high places of the city, also calls to the simple, also offers a meal — but the meal she offers is bread eaten in secret and water that is stolen. Her house is the way to hell, going down to the chambers of death. The two figures are not allegorical decoration; they are the structuring image of the opening section of the book. Every two-line proverb that follows is, in some sense, a small specification of which woman the listener is being summoned to follow.`,
      ],
      where: [
        { n: 1, label: 'Chapter 1 (Wisdom in the streets)' },
        { n: 7, label: 'Chapter 7 (the strange woman)' },
        { n: 8, label: 'Chapter 8 (Wisdom\'s great speech)' },
        { n: 9, label: 'Chapter 9 (two banquets)' },
      ],
    },
    {
      slug: 'shape-of-proverb',
      title: 'The shape of the two-line proverb',
      greek: '"A soft answer turneth away wrath"',
      preview: `The technical achievement of Proverbs is the perfecting of a particular Hebrew literary form: the two-line saying built on parallelism. Most of the proverbs in chapters 10-29 are antithetical — the second line says the opposite or the inverse, with a compression that has made them impossible to forget.`,
      essay: [
        `'A soft answer turneth away wrath: but grievous words stir up anger.' (15:1) 'Pride goeth before destruction, and an haughty spirit before a fall.' (16:18) 'A merry heart doeth good like a medicine: but a broken spirit drieth the bones.' (17:22) 'The rich and poor meet together: the Lord is the maker of them all.' (22:2) The form does several things at once. It compresses observation into a shape the ear can hold; it teaches by symmetry rather than by proof; it leaves space, in the gap between the two lines, for the listener to fill in the implication.`,
        `Robert Alter has argued that the parallelism in Hebrew poetry generally is not synonymous — saying the same thing twice — but intensifying: the second line specifies, sharpens, or moves the first. This is true of Proverbs at its best. The two lines do not just balance; they swing. The form has had a vast afterlife in Western literature, in everyone from François de La Rochefoucauld to Lichtenberg to Wittgenstein at the level of single sentences, and in the longer epigrammatic traditions of Pope, Twain, and Wilde.`,
        `What Proverbs gives the tradition is the model of the moral observation that earns its memorability not by elegance alone but by the compression of an ethic into a shape that can be carried in the head and applied across cases. Chapters 26 and 27 show the form at its most virtuosic: chapter 26's concentrated catalogue of the fool and the sluggard, chapter 27's cluster of friendship proverbs, each image pressing the one before. The book is a manual of how to think clearly in two lines.`,
      ],
      where: [
        { n: 10, label: 'Chapter 10 (the Solomonic collection opens)' },
        { n: 15, label: 'Chapter 15 (the soft answer)' },
        { n: 16, label: 'Chapter 16 (pride before destruction)' },
        { n: 26, label: 'Chapter 26 (fool and sluggard)' },
      ],
    },
    {
      slug: 'limits',
      title: 'The limits — and how the canon corrects them',
      greek: '"One event happeneth to the righteous and to the wicked"',
      preview: `Proverbs is the most confident of the wisdom books. The same Hebrew Bible gives us, in deliberate counterpoint, the books of Job and Ecclesiastes. The canon's decision to keep all three is the canon's way of marking the limits of what Proverbs can do alone.`,
      essay: [
        `Proverbs assumes that the world is morally ordered, that wisdom can be acquired and that its acquisition is rewarded, that the diligent prosper and the lazy fail, that the upright are blessed and the wicked overthrown. The book's confidence is not naive; it is the working assumption of a long, observant, urban, agrarian civilisation that has noticed how things tend to go. Most of the time, in most lives, the proverbs are right.`,
        `Job is the limit case from beneath. The diligent, righteous, God-fearing man — the proverbial man, the wisdom man — loses his children, his livestock, his health in a single afternoon, and the friends who come to comfort him with the doctrines of Proverbs are explicitly rebuked by God at the end of the book. The doctrine of retribution that Proverbs assumes is, for Job's case, exactly what cannot be said. Ecclesiastes is the limit case from within. Qoheleth has tried every project the wisdom life can attempt — wisdom itself, pleasure, wealth, work, the pursuit of memory — and found that all of them are hevel, vapor, breath. There is one event to the righteous and to the wicked. The race is not to the swift.`,
        `The reader who comes to Proverbs without these correctives is liable to the prosperity gospel and to the cruelty of telling sufferers that their suffering is their fault. The reader who comes to Proverbs with these correctives reads it as the wisdom literature it is: pedagogically true, statistically true, morally true at the level of the long aggregate, and not what one says to a man sitting in the ashes. Wisdom literature in the Hebrew Bible is a conversation among three voices, and Proverbs is the first voice.`,
      ],
      where: [
        { n: 6, label: 'Chapter 6 (sloth and the seven abominations)' },
        { n: 14, label: 'Chapter 14 (the way that seems right)' },
        { n: 20, label: 'Chapter 20 (who can say I have made my heart clean?)' },
        { n: 30, label: 'Chapter 30 (Agur\'s radical humility)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Lady Wisdom', role: 'Hokmah', body: `The book's central figure and most theologically consequential invention. She speaks in the streets in chapter 1, reaches her cosmic height in chapter 8 — present at creation, daily the Lord's delight — and sets her table for her banquet in chapter 9. Her great speech gave later Jewish and Christian interpretation the basis for doctrines of personified Wisdom, pre-existent Torah, and Wisdom Christology. As the closing image of the book, the eshet chayil of chapter 31 is her embodied, household form.` },
    { name: 'Lady Folly', role: 'Eshet Kesilut', body: `Wisdom's structural counterpart. She also sits at the door of her house in the high places of the city, also calls to the simple, also offers food — but her food is stolen waters and bread eaten in secret. Across chapters 1-9 she is connected with the strange woman, the seductive figure of chapters 2, 5, 6, and 7. Whether she figures sexual sin specifically, foreign religious practice, or the general appeal of the wrong path, the book uses her to do all three at once.` },
    { name: 'The Father', role: 'The instructing voice', body: `The voice that speaks the opening discourses, addressed throughout to 'my son.' He warns against keeping bad company, sexual sin, laziness, suretyship, and the pride that goes before a fall. His voice holds chapters 1-9 together, and the rest of the book is, in a sense, the proverbs this father has taught to this son. His urgency is the urgency of someone who has seen what choices look like from the far side.` },
    { name: 'Agur', role: 'The sage of Massa', body: `Author of chapter 30. Otherwise unknown outside this book. His oracle opens with a startling confession of ignorance — 'I am the most ignorant of men; I have not learned wisdom, nor have I knowledge of the Holy One' — and then moves through the great unsearchable name, the danger of wealth and poverty both, and the famous numerical proverbs ('three things are too wonderful for me, four I do not know'). He is the counterweight to the book's confidence, placing the limits from outside the tradition.` },
    { name: 'The Eshet Chayil', role: 'The woman of valour', body: `The figure who closes the book. Chapter 31 contains the Sayings of King Lemuel (taught him by his mother) and then the great acrostic poem of twenty-two verses celebrating the woman whose price is far above rubies. She is no figure of leisure: she buys fields, plants vineyards, makes linen and sells it, rises while it is yet night, opens her mouth with wisdom. As the closing image of the book, she is the embodied form of Lady Wisdom — not the mythic figure in the streets, but the woman of valour in a particular household, doing the work the book has been describing for thirty chapters.` },
  ],

  castSubtitle: 'The figures of Proverbs — from the streets to the household.',
  castLead: `<p>Proverbs does not have a cast of characters in the narrative sense. Its figures are types and personifications that recur across the book's five distinct collections. The two great personifications — Lady Wisdom and Lady Folly — are its structural poles. Between them stand the father who teaches, the son who must choose, the strange woman who warns, and the woman of valour who closes the book as Wisdom's embodied form.</p>`,
  castGroups: [
    {
      label: 'The personifications',
      characters: [
        {
          id: 'lady-wisdom',
          tag: 'FIGURE',
          name: 'Lady Wisdom',
          epithet: `Hokmah — present at creation`,
          body: `The book's organising figure and most theologically consequential personification. She appears first in chapter 1, raising her voice in the streets and the chief places of concourse, calling to the simple to turn in to her. Her great speech is in chapter 8: she was possessed by the Lord in the beginning of his way, before his works of old; she was set up from everlasting; when he prepared the heavens, she was there; she was daily his delight, rejoicing in the habitable part of the earth, and her delights were with the sons of men. The passage became, in later Jewish interpretation, the locus classicus for the doctrine of personified Wisdom, and in early Christian interpretation it was read as referring to Christ as the pre-existent Wisdom of God. In chapter 9 she builds her house with seven pillars, sets her table, and sends out her maidens to call. Every proverb in the long collections is, finally, a footnote to her.`,
          appears: [1, 3, 8, 9, 31],
        },
        {
          id: 'lady-folly',
          tag: 'FIGURE',
          name: 'Lady Folly',
          epithet: `Eshet Kesilut — bread eaten in secret`,
          body: `Wisdom's structural counterpart in chapter 9. She also sits at the door of her house, also calls to the simple, also offers food — but her food is bread eaten in secret and her drink is stolen waters. 'Stolen waters are sweet, and bread eaten in secret is pleasant' is the book's best compact statement of the appeal of folly: not that folly looks like folly, but that it looks like a private pleasure that the public virtues cannot quite reach. Her house, the chapter says with characteristic directness, is the way to hell, going down to the chambers of death. She is connected across chapters 1-9 with the strange woman — the seductive figure who appears in chapters 2, 5, 6, and 7 in long, vivid passages warning the young man against her.`,
          appears: [2, 5, 6, 7, 9],
        },
      ],
    },
    {
      label: 'The instructional figures',
      characters: [
        {
          id: 'the-father',
          tag: 'VOICE',
          name: 'The Father',
          epithet: `The instructing voice of chapters 1–9`,
          body: `The voice that speaks the opening discourses, addressed throughout to 'my son.' He is the figure of the wisdom teacher in the form most ancient Near Eastern wisdom literature uses: a father — or a king-as-father — instructing his son in how to live. The voice is firm, affectionate, urgent, and repetitive — the same warnings come back across the chapters because they are warnings about choices the son has not yet made and may make at any time. He warns against keeping bad company (chapter 1), against sexual sin and especially the strange woman (chapters 5-7), against laziness (chapters 6 and 24, with the famous go-to-the-ant), against suretyship for a stranger (chapter 6), against the pride that goes before a fall (chapter 16). His voice holds chapters 1-9 together.`,
          appears: [1, 2, 3, 4, 5, 6, 7],
        },
        {
          id: 'the-son',
          tag: 'VOICE',
          name: 'The Son',
          epithet: `The addressee — the one who must choose`,
          body: `The implied recipient of the opening discourses and, by extension, of the whole book. He is young, simple — petai in Hebrew, the word for the unformed person who has not yet chosen the way — and he is the one for whom Wisdom and Folly are competing. The book is structured as his education. The fact that the addressee is grammatically male reflects the social setting in which the book was composed; functionally, the addressee is anyone at the threshold of the choices that constitute a life — about speech, about money, about company, about sex, about temper. By chapter 31, when the woman of valour appears, the son has presumably grown up and is being shown what the wise marriage looks like.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
      ],
    },
    {
      label: 'The sages',
      characters: [
        {
          id: 'agur',
          tag: 'SAGE',
          name: 'Agur son of Jakeh',
          epithet: `The oracle from Massa`,
          body: `Author of chapter 30. Otherwise unknown outside this book. His oracle opens with a startling confession of ignorance — 'I am the most ignorant of men; I have not learned wisdom, nor have I knowledge of the Holy One' — a sharp contrast to the confidence of the rest of Proverbs. Then he moves through the unsearchable name, the danger of wealth and poverty both (give me neither, lest I deny you), and the famous sequence of numerical proverbs: three things which are too wonderful for me, yea four which I know not; four things which are little upon the earth but exceeding wise; four things which are comely in going. The chapter is the most distinctive in the book and the most inward at the limits of knowledge.`,
          appears: [30],
        },
        {
          id: 'lemuel',
          tag: 'SAGE',
          name: 'King Lemuel',
          epithet: `Taught by his mother`,
          body: `The heading of chapter 31 is unique in the Hebrew Bible: the words of King Lemuel, the prophecy that his mother taught him. Nothing else is known of Lemuel. His mother's instruction occupies the first nine verses: do not give your strength to women; give strong drink to the dying, wine to the bitter of soul; open your mouth for the speechless, judge righteously, defend the poor and needy. The instruction is practical, royal, and — as the note about his mother specifies — the only direct attribution to a female author in the Hebrew Bible. It introduces the eshet chayil poem that closes the book.`,
          appears: [31],
        },
        {
          id: 'eshet-chayil',
          tag: 'FIGURE',
          name: 'The Eshet Chayil',
          epithet: `The woman of valour — far above rubies`,
          body: `The figure who closes the book. The alphabetic acrostic poem of twenty-two verses celebrates eshet chayil, a woman of valour, whose price is far above rubies. She is no figure of leisure. She seeks wool and flax and works willingly with her hands. She brings her food from afar. She rises while it is yet night and gives meat to her household. She considers a field and buys it; with the fruit of her hands she plants a vineyard. Strength and honour are her clothing. She opens her mouth with wisdom, and in her tongue is the law of kindness. Her children rise up and call her blessed; her husband also praises her. The poem is read every Sabbath eve in observant Jewish households as the husband's song to the wife. As the closing image of the book, she is the embodied form of Lady Wisdom: not the mythic figure in the streets, but the woman of valour in a particular household, doing the work the book has been describing for thirty chapters.`,
          appears: [31],
        },
      ],
    },
  ],

  chapterLabel: n => `Proverbs ${n}`,

  chapters: chapters.map(ch => ({
    n: ch.n,
    title: ch.title,
    tourTitle: ch.tourTitle,
    hook: ch.hook,
    tour: ch.tour,
    blurb: ch.blurb,
    summary: Array.isArray(ch.summary) ? ch.summary : [ch.summary],
    themes: (ch.themes || []).map(t => ({ slug: t.slug, label: t.label })),
    appears: ch.appears || [],
  })),
}
