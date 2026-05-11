// SEO content data for Deuteronomy — fifth book of the Hebrew Bible.
// Final form during Josiah's reform 7th c. BCE; some material later.
// Voice: literary, declarative present.

const chapters = require('/tmp/bible-deuteronomy-chapters-merged.json');

module.exports = {
  id: 'bible-deuteronomy',
  title: 'Deuteronomy',
  author: 'Anonymous (Deuteronomistic source)',
  byline: 'c. 7th–6th c. BCE · Hebrew Bible · Torah',
  titleAccent: 'a guided tour',
  hook: 'Moses stands on the east bank of the Jordan with a generation that has never seen Egypt and will not see him cross. He has one speech left. Everything depends on what they do with it.',

  genre: ['Scripture', 'Torah', 'Ancient Near Eastern literature', 'Religious text'],

  about: [
    `<em>Deuteronomy</em> is Moses's last sermon. The people are camped on the plains of Moab, the Jordan in front of them, the promised land just visible on the other side, and Moses — who is not going to cross — has them sit down for one final, urgent address. He retells the law, recasts the covenant, and warns them, in the most rhetorically charged Hebrew prose in the Bible, what is at stake. <em>Choose life so that you and your descendants may live.</em> The book has shaped Jewish liturgy, Christian theology, the political imagination of the early American Puritans, and almost every later attempt to write a constitution as a moral document.`,
    `Deuteronomy reaches its present form during the reign of King Josiah of Judah in the late seventh century BCE — the central legal core of the book, often called the Deuteronomic Code (chapters 12–26), is widely identified with the book of the law found in the temple in 2 Kings 22 that triggers Josiah's sweeping religious reform of 622 BCE. The book speaks in a single voice — rhetorically powerful, theologically focused, urgent — that no other book of the Pentateuch quite matches. At its centre is a claim about what religion is: not ritual performance, but love. <em>You shall love the Lord your God with all your heart and with all your soul and with all your might.</em>`,
  ],

  chaptersSubtitle: "All 34 chapters, from Moses's opening speech to his death on Nebo.",
  chaptersLead: `<p>Deuteronomy runs through four movements: the historical review and exhortation (chapters 1–11), the legal code with its laws of worship, society, and kingship (chapters 12–26), the great covenant ceremony of blessings and curses (chapters 27–30), and the final acts of Moses — his commissioning of Joshua, his song, his blessing of the tribes, and his death (chapters 31–34). The Pentateuch ends on a mountain, with a man looking at a country he cannot enter.</p>`,

  themesByline: 'Five threads through the book',
  themesLead: `Deuteronomy is a farewell that refuses to be elegiac. Moses speaks as a man with limited time making an argument he needs to win. Every theme in the book is in the service of that argument: choose this, not that; love this God, not those gods; build this kind of society, not the one you came from.`,

  groups: [
    {
      label: 'First discourse · Chs 1–4',
      subtitle: 'Moses reviews the wilderness journey from Horeb to Moab.',
      chapters: [1, 2, 3, 4],
    },
    {
      label: 'Second discourse · Chs 5–26',
      subtitle: 'The Decalogue, the Shema, and the full legal code.',
      chapters: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    },
    {
      label: 'Blessings and curses · Chs 27–30',
      subtitle: 'The covenant at Ebal and Gerizim, and the closing peroration.',
      chapters: [27, 28, 29, 30],
    },
    {
      label: 'Final acts of Moses · Chs 31–34',
      subtitle: 'Joshua commissioned. The Song. The blessing. The death on Nebo.',
      chapters: [31, 32, 33, 34],
    },
  ],

  themes: [
    {
      slug: 'the-shema-and-the-oneness-of-god',
      title: 'The Shema and the Oneness of God',
      preview:
        'Deuteronomy 6:4 is the verse Jewish children have been taught first for two and a half thousand years. <em>Hear, O Israel, the Lord our God, the Lord is one.</em> Six Hebrew words, and they have been the central confession of Jewish faith ever since.',
      essay: [
        `Deuteronomy 6:4 is the verse Jewish children have been taught first for two and a half thousand years. <em>Hear, O Israel, the Lord our God, the Lord is one.</em> The Hebrew is six words, and they have been the central confession of Jewish faith — recited twice a day, posted on doorposts in mezuzot, bound on hand and forehead in tefillin, repeated as the last words on the lips of Jewish martyrs from Akiva to the Holocaust. The verse does in six words what Greek philosophy will spend a thousand years trying to formulate: God is one.`,
        `The oneness has at least two senses, and the Hebrew <em>echad</em>, one, can carry both. There is the metaphysical sense — God is single, undivided, not many gods, not a pantheon. And there is the religious sense — God is wholly to be loved, not loved alongside other loves on equal terms, the one to whom undivided allegiance is due. The next verse makes the second sense explicit: <em>you shall love the Lord your God with all your heart and with all your soul and with all your might.</em> Jesus, asked which is the great commandment, will quote this. Augustine will build a theology of the rightly ordered loves on it. Maimonides will use it to argue that to love God is the first and last commandment of all.`,
        `The context is the polytheistic world of the ancient Near East, where every nation had its god, every city had its god, every household had its gods, and the question was not whether to worship multiple deities but which of them to honour at which moment. Deuteronomy refuses the question. There is one. The radical move is the unification. From the Shema, the entire architecture of monotheism — Jewish, Christian, Muslim — descends.`,
        `The rest of Deuteronomy 6 is what the Shema requires of a household. <em>These words I command you today shall be on your heart. You shall teach them diligently to your children, and shall talk of them when you sit in your house and when you walk by the way and when you lie down and when you rise.</em> The verse is asking for a kind of total saturation of life — domestic, conversational, bodily, architectural — by the confession of God's oneness. It is a maximalist demand, and the Jewish ritual life that has descended from it for three thousand years is the elaboration of that demand into actual practice.`,
      ],
      where: [
        { n: 4, label: 'Ch 4 (the argument against idols)' },
        { n: 5, label: 'Ch 5 (the Decalogue repeated)' },
        { n: 6, label: 'Ch 6 (the Shema)' },
        { n: 13, label: 'Ch 13 (false prophets and idolatry)' },
      ],
    },
    {
      slug: 'the-law-repeated-and-refined',
      title: 'The Law Repeated and Refined',
      preview:
        'The Greek name of the book — <em>Deuteronomy</em>, second law — captures something true. The legal material in chapters 12–26 is not new law but the retelling of the law from Exodus, Leviticus, and Numbers, with significant humanitarian developments.',
      essay: [
        `The Greek name of the book — Deuteronomy, second law — is a slight mistranslation of the Hebrew <em>mishneh hatorah</em>, copy of the law, but the mistranslation has stuck because it captures something true. The legal material in Deuteronomy 12–26 is not the giving of new law but the retelling of the law from Exodus, Leviticus, and Numbers, with significant developments. Sometimes Deuteronomy is more strict than the earlier codes; sometimes it is more lenient; almost always it is more humanitarian, more focused on the poor and the stranger and the slave, and more conscious of the social texture in which the law has to operate.`,
        `The most important structural change is the centralization of worship. Earlier law allowed for many local altars throughout the land. Deuteronomy 12 commands that sacrifice can only be offered at the place the Lord will choose to make his name dwell — understood by the book's later editors to be Jerusalem. This is the move that aligns Deuteronomy with Josiah's seventh-century reform, in which exactly such a centralization was carried out, the local high places destroyed, and the temple in Jerusalem made the sole legitimate site of sacrifice.`,
        `The humanitarian thread is the most striking development. Deuteronomy 15 mandates the seven-year remission of debts — every seven years, all debts among Israelites are to be cancelled — and explicitly addresses the temptation to refuse loans as the seventh year approaches: <em>do not be hard-hearted or tight-fisted toward your needy neighbour. Open your hand</em>, the text says, <em>and lend without expectation.</em> Deuteronomy 23 forbids returning a runaway slave to his master. Deuteronomy 24 prohibits taking a millstone in pledge for a loan, insists that day labourers be paid before sundown, and commands gleaning rights for the poor and the stranger.`,
        `Each of these provisions has been argued about, watered down, ignored, or radicalized by subsequent legal and political traditions, but the original direction of the book is unmistakable. The law is for the protection of the vulnerable, and any law that loses that orientation has lost what Deuteronomy thinks law is for.`,
      ],
      where: [
        { n: 12, label: 'Ch 12 (centralization of worship)' },
        { n: 15, label: 'Ch 15 (debt remission)' },
        { n: 17, label: 'Ch 17 (the law of the king)' },
        { n: 24, label: 'Ch 24 (gleaning and labour rights)' },
      ],
    },
    {
      slug: 'the-land-and-the-memory-of-slavery',
      title: 'The Land and the Memory of Slavery',
      preview:
        'Deuteronomy is obsessed with the land. Almost every passage connects what is being commanded to <em>the land you are about to enter</em>. And woven through every appeal is a counter-memory: you yourselves were slaves in Egypt.',
      essay: [
        `Deuteronomy is obsessed with the land. Almost every passage of legal and exhortatory material at some point connects what is being commanded to <em>the land you are about to enter and possess, the land that the Lord your God is giving you.</em> The land is gift, vocation, threat, and warning all at once. It is the gift God has been working toward since the call of Abraham. It is the vocation in which Israel will live out the covenant. It is the threat: live unfaithfully and the land will spit you out — and as the book reaches its present form, the Babylonian exile has already begun to demonstrate this.`,
        `Woven through every appeal about the land is the command to remember Egypt. <em>You shall remember that you were a slave in the land of Egypt</em> — the phrase appears in some form at least seven times in Deuteronomy. It is the reason for keeping the Sabbath, the reason for releasing the seventh-year debts, the reason for caring for the stranger, the reason for the festival of weeks, the reason for the festival of booths. The memory of slavery is what is supposed to make the new society in the land fundamentally unlike the society they were in.`,
        `This is the political theology that has shaped every later Western reading of the book. The land is not given because of the people's righteousness. It is given despite the people's stubbornness, the text says repeatedly. It is given so that they can build, in the land, a society that does not reproduce Egypt — a society in which slaves are released after seven years with provisions for their new life, in which debts do not accumulate forever, in which the stranger is loved because you yourselves were strangers, in which the king is bound by the law and forbidden to multiply horses or wives or silver and gold.`,
        `The blessings and curses of chapters 27–28 spell out the failure mode in terrible detail. The list of curses goes on for sixty-eight verses, longer than the list of blessings, and the whole catalogue is read by the text's later editors as a prophecy of the exile they are themselves living through. The book that promises the land is also the book that explains why the land was lost.`,
      ],
      where: [
        { n: 8, label: 'Ch 8 (not by bread alone; forgetting Egypt)' },
        { n: 16, label: 'Ch 16 (remember Egypt at the festivals)' },
        { n: 26, label: 'Ch 26 (confession at the first fruits)' },
        { n: 28, label: 'Ch 28 (the long catalogue of curses)' },
      ],
    },
    {
      slug: 'love-as-covenant-bond',
      title: 'Love as Covenant Bond',
      preview:
        'The most theologically distinctive feature of Deuteronomy is its language of love. <em>You shall love the Lord your God with all your heart.</em> The verb is <em>ahav</em>, the same word used for love between human beings, including erotic love.',
      essay: [
        `The most theologically distinctive feature of Deuteronomy is its language of love. <em>You shall love the Lord your God with all your heart and with all your soul and with all your might.</em> The verb is <em>ahav</em>, the same word used for love between human beings, including erotic love. Other ancient Near Eastern treaty texts — Hittite suzerain treaties, Assyrian loyalty oaths — also use the language of love to describe the proper attitude of a vassal toward his sovereign. Deuteronomy is drawing on that political vocabulary. But it is doing something the treaty literature does not do: it is making the love mutual, asymmetrical, and the centre of the entire relationship.`,
        `<em>It was not because you were more numerous than any other people that the Lord set his love upon you and chose you, for you were the smallest of all peoples; but it is because the Lord loves you and is keeping the oath that he swore to your ancestors.</em> The love is asymmetrical in the sense that God's love comes first; Israel's love is responsive. It is mutual in the sense that both sides love. It is the centre in the sense that all the law, all the obedience, all the ritual life, is the form love takes when it is being concrete.`,
        `This vocabulary is what the New Testament inherits when Jesus quotes Deuteronomy 6:5 and pairs it with Leviticus 19:18 — <em>love the Lord your God with all your heart, and your neighbour as yourself</em> — and calls these two the great commandments on which all the law and prophets depend. Augustine will pick this up and make love the architectonic principle of his entire theology. The doctrine that the deepest reality of God-with-people is a relationship of love, initiated by God and responded to by human beings, has shaped Western religious thought for two thousand years. It is in its decisive form a Deuteronomic doctrine.`,
        `What the language of love adds to the legal material is a quality of inwardness. The law is not just a list of behaviours to be observed; it is the outward shape of an inward devotion. <em>Circumcise the foreskin of your heart</em>, the book says — outward circumcision is not enough; the inward orientation is what counts. The prophet Jeremiah, almost certainly trained in deuteronomic theology, will pick up this image and run with it: <em>the day is coming, says the Lord, when I will write my law on their hearts.</em>`,
      ],
      where: [
        { n: 6, label: 'Ch 6 (the Shema and the command to love)' },
        { n: 7, label: "Ch 7 (God's prior love for Israel)" },
        { n: 10, label: 'Ch 10 (circumcise your heart)' },
        { n: 11, label: 'Ch 11 (love commands the whole life)' },
      ],
    },
    {
      slug: 'choose-life-the-closing-peroration',
      title: 'Choose Life — The Closing Peroration',
      preview:
        'Deuteronomy 30 gathers everything into a final appeal. Moses has laid out the blessings and the curses. He has rehearsed the history. Now he names what is in front of the people: life and death, blessing and curse.',
      essay: [
        `Deuteronomy 30 is one of the most rhetorically pitched chapters in the Hebrew Bible. Moses has spent the previous chapters laying out the blessings and the curses in detail. He has rehearsed the history. He has reminded the people of the land that they are about to enter and the disasters that will come if they break the covenant. Now, in chapter 30, he gathers everything into a final appeal.`,
        `<em>See, I have set before you today life and prosperity, death and adversity. If you obey the commandments of the Lord your God that I am commanding you today, by loving the Lord your God, walking in his ways, and keeping his commandments, decrees, and ordinances, then you shall live and become numerous.</em> Then the famous verses. <em>I call heaven and earth as witnesses against you today that I have set before you life and death, blessings and curses. Choose life so that you and your descendants may live, loving the Lord your God, obeying him, and holding fast to him; for that means life to you and length of days.</em>`,
        `The theological move is also striking. The commandment, Moses says, is not too hard for you, nor is it far away. <em>It is not in heaven, that you should say, who will ascend to heaven for us and bring it to us. It is not beyond the sea, that you should say, who will cross the sea for us. The word is very near you — in your mouth and in your heart, that you may do it.</em> The line will be picked up by Paul in Romans 10 and applied to the gospel; it has been used by every later religious tradition that has wanted to insist that the demand of God is not for esoteric knowledge but for a turning of the will already within reach.`,
        `The book ends — almost ends — with an old man telling a people on the edge of a river that the choice is in front of them and that they can make it. Then he climbs the mountain and dies. The chapter that records his death is the last chapter of the Pentateuch, and the Hebrew Bible never has another like him: <em>there has never since arisen in Israel a prophet like Moses, whom the Lord knew face to face.</em>`,
      ],
      where: [
        { n: 27, label: 'Ch 27 (the covenant ceremony at Ebal)' },
        { n: 28, label: 'Ch 28 (blessings and curses)' },
        { n: 30, label: 'Ch 30 (choose life)' },
        { n: 34, label: 'Ch 34 (Moses dies on Nebo)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Moses',
      role: 'Prophet and Lawgiver',
      body: `At the end of his life. One hundred and twenty years old, his eyes still undimmed and his vigour unabated, the text says — but the time is over. He has led the people out of Egypt, through the wilderness for forty years, almost to the Jordan. He himself will not cross. The book is, in its setting, his final speech: three long discourses delivered on the plains of Moab in the last weeks of his life. He commissions Joshua, writes the law in a book, blesses the tribes, climbs Mount Nebo, sees the land from a distance, and dies. No one knows his burial place to this day.`,
    },
    {
      name: 'Joshua',
      role: "Moses's Successor",
      body: `Son of Nun, of the tribe of Ephraim, Moses's assistant since the wilderness years. He was one of the twelve spies sent from Kadesh into Canaan, and one of only two — with Caleb — who came back urging the people to go up. In Deuteronomy he is publicly commissioned as the next leader: <em>be strong and of good courage, for you shall go with this people into the land.</em> The book that bears his name picks up the story across the Jordan.`,
    },
    {
      name: 'The People of Israel',
      role: 'Audience and Covenant Partner',
      body: `The people standing on the plains of Moab listening to Moses. Most are the children or grandchildren of the generation that came out of Egypt — the original generation has died in the wilderness. They are about to cross the Jordan and enter a land most of them have never seen. Deuteronomy addresses them in the second person singular — not <em>you all</em> but <em>you</em>, the individual reader — with such consistency that the rhetoric reaches across three thousand years.`,
    },
    {
      name: 'The Stranger / The Widow / The Orphan',
      role: 'Protected Classes',
      body: `The recurring trio in Deuteronomy's social legislation — the <em>ger</em>, the <em>almanah</em>, the <em>yatom</em>. The stranger is the resident alien, without full property rights or kin protection. The widow is the woman without economic support. The orphan is the child without a father. Together they are the legal categories most exposed to exploitation in an ancient agricultural society, and Deuteronomy returns to them at every juncture. The reason it gives is always the same: <em>you yourselves were strangers in the land of Egypt.</em>`,
    },
    {
      name: 'The King (anticipated)',
      role: 'Future Constitutional Office',
      body: `Israel does not yet have a king when Moses speaks, and will not for centuries, but Deuteronomy 17 anticipates the office and writes its constitution. The king must be a fellow Israelite. He shall not multiply horses, nor cause the people to return to Egypt. He shall not multiply wives, lest his heart turn away. He shall not greatly multiply silver and gold. And when he sits on the throne, he shall write for himself a copy of this law and read in it all the days of his life. The king is bound by the law. Solomon, when he comes, will violate every prohibition in the list.`,
    },
    {
      name: 'The Levites',
      role: 'Tribe of Priests',
      body: `The tribe set apart for the service of the sanctuary, who receive no land of their own when the land is divided. Deuteronomy is particularly attentive to their economic vulnerability: <em>they have no inheritance with their brothers</em>, the text says again and again — the Lord is their inheritance — and the practical implication is that they depend on the offerings, tithes, and gifts of the rest of Israel. They are also the keepers of the law: Moses gives the written Torah to the priests and elders to be read aloud to the people every seven years at the Festival of Booths.`,
    },
  ],

  castSubtitle: 'The plains of Moab — a people at the border of everything.',
  castLead: `<p>Deuteronomy has almost no narrative in the usual sense — it is a speech, not a story. Its cast is correspondingly spare: the speaker, the successor, the people addressed, and the recurring figures of those the law is designed to protect.</p>`,
  castGroups: [
    {
      label: 'The leaders',
      characters: [
        {
          id: 'moses',
          tag: 'Prophet',
          name: 'Moses',
          epithet: 'Lawgiver, speaker of the whole book',
          body: `Deuteronomy is Moses's voice from beginning to almost the very end. He reviews the wilderness years, presents the law, pronounces the blessings and curses, sings his song, blesses the tribes — and then, in the book's last chapter, dies. The final verse is the Pentateuch's epitaph for him: <em>there has never since arisen in Israel a prophet like Moses, whom the Lord knew face to face.</em>`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
        },
        {
          id: 'joshua',
          tag: 'Successor',
          name: 'Joshua',
          epithet: 'Commissioned to cross where Moses cannot',
          body: `Moses's lieutenant, publicly charged with leading the people into the land in Deuteronomy 31. He is full of the spirit of wisdom because Moses laid his hands on him — the continuity is real, even if the person is not comparable. His book begins where this one ends.`,
          appears: [1, 3, 31, 34],
        },
      ],
    },
    {
      label: 'The people',
      characters: [
        {
          id: 'the-people-of-israel',
          tag: 'Covenant partner',
          name: 'The People of Israel',
          epithet: 'The generation that will cross',
          body: `The generation on the plains of Moab: children and grandchildren of those who left Egypt, themselves born in the wilderness, about to enter a land they have never seen. They are addressed in the second person throughout — <em>you</em>, not they — so that the reader in every subsequent generation is included in the address. Moses's sermon is a speech that keeps widening its audience.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 27, 29, 30, 31],
        },
        {
          id: 'the-levites',
          tag: 'Priests',
          name: 'The Levites',
          epithet: 'Keepers of the law, landless by design',
          body: `The priestly tribe that serves the sanctuary and has no land inheritance among the other tribes. Their economic dependence on Israel's generosity is one of Deuteronomy's recurring concerns. They also function as the official custodians of the written Torah: when Moses finishes writing it, he entrusts it to them for safekeeping and public reading.`,
          appears: [10, 12, 14, 16, 17, 18, 21, 24, 26, 27, 31, 33],
        },
        {
          id: 'the-stranger-the-widow-the-orphan',
          tag: 'Protected',
          name: 'The Stranger · Widow · Orphan',
          epithet: 'The recurring vulnerable three',
          body: `The legal trio that Deuteronomy returns to at every juncture: the resident alien without kin protection, the widow without economic support, the orphan without a father. They appear together in the social legislation of chapters 14–26 and in the covenant ceremony. The law's treatment of them is the test of whether the covenant is being kept: <em>remember that you were a slave in Egypt.</em>`,
          appears: [14, 16, 24, 26, 27],
        },
      ],
    },
  ],

  chapterLabel: n => 'Deuteronomy ' + n,

  chapters,
};
