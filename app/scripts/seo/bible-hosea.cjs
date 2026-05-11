// SEO content data for the Book of Hosea (8th century BCE).
// Northern-kingdom prophet; covenant figured as marriage.
// Voice: literary, declarative present, attentive to prophetic register.

const chapters = require('/tmp/bible-hosea-chunk-1.json');

module.exports = {
  id: 'bible-hosea',
  title: 'Hosea',
  author: 'Hosea ben Beeri',
  byline: '8th c. BCE · Hebrew Bible · Twelve Prophets',
  titleAccent: 'a guided tour',
  hook: 'A prophet in the last decades of the northern kingdom is told to marry a wife of whoredom, give their children names that mean Not-Pitied and Not-My-People, and live the marriage in public as a sign. Hosea is the shortest, strangest, and most personally exposed of the prophetic books.',
  genre: ['Prophecy', 'Hebrew Bible', 'Twelve Prophets'],

  about: [
    `<em>Hosea</em> is the only one of the writing prophets whose ministry is set entirely in the northern kingdom of Israel. He prophesies through the last decades of its independence — from the long late prosperity of Jeroboam II into the chaos that ended with the Assyrian destruction of Samaria in 722 BCE. The book opens with a command: go, marry a wife of whoredom, because the land has committed great whoredom by departing from the LORD. Hosea obeys. He marries Gomer daughter of Diblaim. Three children follow, each given a name that is itself an oracle: Jezreel, Lo-ruhamah (Not-Pitied), Lo-ammi (Not-My-People). The marriage is prophetic theatre performed in public.`,
    `The first three chapters build the marriage as a parable. Chapters 4 through 14 are the prophetic oracles proper: the priests grown fat on sin, the kings rising and falling like foam on water, Ephraim mixing himself among the peoples like a half-baked cake. Then, almost intolerably in the middle of the indictment, chapter 11 — God as the parent who taught Ephraim to walk and cannot give him up. The book ends in chapter 14 with a call to return, a promise of dew and lily and restored vine, and a final line that hands the book to the reader and asks what they will do with it.`,
  ],

  chaptersSubtitle: 'All 14 chapters — from the marriage command to the closing call to return.',
  chaptersLead: `<p>Hosea divides naturally into three movements: the marriage allegory (chapters 1–3), the great indictment (chapters 4–10), and the turn toward love and restoration (chapters 11–14). Chapter 11 is the book's astonishing centre. Chapter 14 closes the book by addressing the reader directly.</p>`,

  themesByline: 'Five threads through the book',
  themesLead: `Hosea introduced the figure of the covenant as marriage — the single most influential metaphor the prophets contributed to later theology. These five threads trace what the book does with that figure and what grows from it.`,

  groups: [
    {
      label: 'The Marriage Allegory · Chapters 1–3',
      subtitle: 'The marriage to Gomer, the three named children, the buying-back.',
      chapters: [1, 2, 3],
    },
    {
      label: 'The Indictment · Chapters 4–10',
      subtitle: 'No knowledge of God, no truth, no mercy — priests, princes, and kings under judgment.',
      chapters: [4, 5, 6, 7, 8, 9, 10],
    },
    {
      label: 'Love and Return · Chapters 11–14',
      subtitle: 'How can I give you up, Ephraim? The parent who will not let go, and the closing call.',
      chapters: [11, 12, 13, 14],
    },
  ],

  themes: [
    {
      slug: 'marriage-as-covenant',
      title: 'The marriage as covenant',
      greek: 'a husband who will not let go',
      preview: 'The single most original move in Hosea is the figure that organizes the entire book: the relation between Yahweh and Israel as the relation between a husband and an unfaithful wife. The figure is not a passing simile; it is the structural metaphor through which the book\'s whole theology runs.',
      essay: [
        `Before Hosea, the language of God and Israel is the language of king and people, master and servant, father and son. Hosea introduces, with a precision and a willingness to stay inside the figure that no earlier prophet had matched, the language of betrothal, fidelity, jealousy, and the specific wound of the husband whose wife has gone to other lovers. The figure shapes the way the rest of the Hebrew Bible — and through it the whole later Christian and Jewish tradition — would think about covenant.`,
        `The figure does several things at once. It makes the covenant intimate in a way that the political vocabulary could not. A nation can break a treaty and be punished and recover; a wife who has been unfaithful cannot make the breach undone, and the husband who takes her back is doing something more strange than a king who reinstates a vassal. It makes the demand exclusive in a way the older language could not enforce. Idolatry, in Hosea's hands, is not the worship of the wrong god — it is adultery, the giving of what was promised to one to another, and there is no formal sense in which that can be made all right.`,
        `And it makes the response, when it comes, of a different kind altogether. The husband who buys his wife back at market — who pays for what should already have been his — is doing something the political vocabulary cannot describe. Chapter 3 is the most compressed theological statement in the book: five verses, fifteen pieces of silver, a homer and a half of barley, and a theology of love that costs more than justice requires. The figure carries assumptions about marriage and gender that belong to the eighth century BCE and not to the reader's century, and the noticing is fair. What the figure also does is press the question of what fidelity to God could possibly mean for a community that has many other claims on it, and the question outlives the figure that first asked it.`,
        `Hosea is the book in which covenant becomes a love story with a wound in it. The wound never quite heals. The love does not let go.`,
      ],
      where: [
        { n: 1, label: 'Hosea 1 (the command to marry)' },
        { n: 2, label: 'Hosea 2 (the wilderness courtship)' },
        { n: 3, label: 'Hosea 3 (the buying-back)' },
        { n: 11, label: 'Hosea 11 (the parent who will not give up)' },
      ],
    },
    {
      slug: 'named-children',
      title: 'The named children',
      greek: 'oracles carried in the family',
      preview: 'Gomer bears three children, and each is given a name that is itself an oracle. Jezreel, Lo-ruhamah, Lo-ammi — named after a massacre, named Not-Pitied, named Not-My-People. They grow up under those names in the village. Then the names turn.',
      essay: [
        `The first child is Jezreel, after the valley where Jehu had massacred the house of Ahab a generation earlier — the valley where, the text says, the bow of Israel will be broken. To name a son Jezreel is to name him after a crime scene. The second child, a daughter, is named Lo-ruhamah, Not-Pitied, because God will no more have pity on the house of Israel. The third child is named Lo-ammi, Not-My-People, with the most exposed explanation in the book: for you are not my people, and I am not your God.`,
        `The naming is a public act. In a small village in the eighth-century north, every time the prophet's wife calls her children in from the yard, the village is reminded of the indictment. The names are walked through the streets, called across courtyards. The prophet is using his own household as a billboard. There is something of the same act in the later prophets — Isaiah's children named for slaughter and salvation, Ezekiel's elaborate signs — but Hosea is the first, and the cost is most exposed in him. The children are not props. They grow up carrying the names their father has given them at God's command, and the book does not record what they thought of it.`,
        `At the end of chapter 1 and the start of chapter 2 the names turn. The same Yahweh who named the children Not-Pitied and Not-My-People says to Lo-ammi: my people; and to Lo-ruhamah: pitied. Jezreel, the valley of slaughter, becomes the valley where God answers the heavens and the heavens answer the earth and the earth answers the grain and the wine and the oil. The names do not disappear. They are turned. The book's grammar of restoration does not pretend the indictment never happened; it presses through the indictment to a reversal that has the indictment inside it. The named children remain named; they are simply renamed. The renaming is what later readers, Christian and Jewish, have heard echoing through the Pauline letters and through every later attempt to talk about a people called back from being not-a-people.`,
      ],
      where: [
        { n: 1, label: 'Hosea 1 (the three names)' },
        { n: 2, label: 'Hosea 2 (the names turn)' },
        { n: 8, label: 'Hosea 8 (they sow the wind)' },
      ],
    },
    {
      slug: 'how-can-i-give-you-up',
      title: 'How can I give you up, Ephraim?',
      greek: 'for I am God and not a man',
      preview: 'Chapter 11 is, by common consent of readers across many traditions, the most astonishing single passage in the Book of the Twelve. After ten chapters of relentless indictment, the voice that has been pronouncing judgment changes register without warning.',
      essay: [
        `When Israel was a child, I loved him, and out of Egypt I called my son. The more I called them, the more they went from me. And then the verses that have stopped readers in every century since they were written: I taught Ephraim to walk, taking them up by their arms, but they did not know that I healed them. I drew them with cords of human kindness, with bands of love. I was to them as those who lift infants to their cheeks; I bent down to them and fed them.`,
        `And then, mid-judgment, the speech breaks. How can I give you up, Ephraim? How can I hand you over, Israel? How can I make you like Admah? How can I treat you like Zeboiim? — the cities destroyed alongside Sodom and Gomorrah. My heart recoils within me; my compassion grows warm and tender. I will not execute my fierce anger; I will not again destroy Ephraim; for I am God and not a man, the Holy One in your midst, and I will not come in wrath.`,
        `What the chapter does, theologically, is hold judgment and tenderness in a single voice without resolving them. The God who has been pronouncing the indictment is the same God who taught the child to walk, and the indictment does not cancel the memory of teaching the child to walk, and the memory of teaching the child to walk does not cancel the indictment. The chapter's most quoted line — for I am God and not a man — is often misread as a claim about transcendent power. In context it is the opposite: it is a claim about the kind of constancy that a finite human husband, however just his case, could not be expected to sustain. A man who had been wronged this many times would have given up. God, the chapter says, will not.`,
        `The capacity to keep loving past every reason to stop is the capacity the chapter identifies as divinity. It is one of the most unguarded passages in the Hebrew Bible, and it is in the middle of one of its most relentless prophetic books.`,
      ],
      where: [
        { n: 11, label: 'Hosea 11 (the whole chapter)' },
        { n: 13, label: 'Hosea 13 (the darkest threats)' },
        { n: 14, label: 'Hosea 14 (the restoration follows)' },
      ],
    },
    {
      slug: 'no-knowledge-of-god',
      title: 'No knowledge of God in the land',
      greek: 'daat elohim — relational, not theological',
      preview: 'The charge in chapter 4 is the most precise formulation of the prophetic critique anywhere in the Hebrew Bible: no truth, no mercy, no knowledge of God in the land. By "knowledge of God" Hosea does not mean theological information.',
      essay: [
        `Hear the word of the LORD, O children of Israel; for the LORD has a controversy with the inhabitants of the land. There is no truth, no mercy, and no knowledge of God in the land. There is swearing, and lying, and killing, and stealing, and committing adultery; they break out, and blood touches blood. By daat elohim — knowledge of God — Hosea does not mean theological information. He means the practical knowing that produces faithful action — the knowing of a wife by her husband, of a child by her parent, of a people by its God. It is relational knowing, and its absence is what produces the moral collapse the chapter goes on to catalogue.`,
        `The priests come in for the sharpest of the prophet's attacks because they were supposed to be the people who had this knowing and taught it. Instead, the text says in one of its bitterest lines, my people are destroyed for lack of knowledge — because you have rejected knowledge, I reject you from being a priest to me. The priests have grown fat on the people's sins; they eat up the sin of my people, and they set their heart on their iniquity. The mechanism Hosea diagnoses is one any reader can recognize: the people who profit from the disorder do not, in the end, want it cured.`,
        `The phrase becomes one of the central terms of the prophetic vocabulary after Hosea, and it carries his sense forward. In chapter 6, the verse that Jesus quotes twice in Matthew — for I desire mercy, and not sacrifice; the knowledge of God more than burnt offerings — is a direct line from Hosea's argument. The knowing is in the doing. The relation is the substance. A people that has ceased to know its God in the practical, daily, faithful sense has ceased to be the people, whatever liturgies it continues to perform. The verse has been read and re-read by every later prophetic tradition that has wanted to insist that worship without justice is not worship, and that knowledge of God is something you can lose without noticing because nothing in the temple has visibly changed.`,
      ],
      where: [
        { n: 4, label: 'Hosea 4 (the indictment opens)' },
        { n: 6, label: 'Hosea 6 (mercy, not sacrifice)' },
        { n: 9, label: 'Hosea 9 (the prophet called fool)' },
        { n: 10, label: 'Hosea 10 (the vine of prosperity)' },
      ],
    },
    {
      slug: 'return',
      title: 'Return',
      greek: 'shuv — turn, return, repent',
      preview: 'The book\'s last chapter is one of the most carefully composed restorations in the prophetic literature, and it earns its place by refusing to soften any of what has come before. Chapter 14 closes by handing the book back to the reader.',
      essay: [
        `Chapter 14 opens with an imperative: Return, O Israel, to the LORD your God, for you have stumbled because of your iniquity. The verb shuv — return, turn, repent — has been running through the book as a low note, and here it is given the foreground. The prophet then puts words in the people's mouth: Take with you words and return to the LORD; say to him, Take away all iniquity; receive us graciously, that we may render the calves of our lips. The image of words as offerings — the calves of our lips — is the prophet's quiet correction of a sacrificial system he has spent the book attacking. What the people are to bring is not bulls and rams. It is the words of return.`,
        `And then the response. I will heal their faithlessness; I will love them freely, for my anger has turned from them. I will be as the dew to Israel; he shall blossom like the lily; he shall take root like the trees of Lebanon. The image is rural and exact. Dew in the late-summer Levantine landscape is the difference between a crop and no crop; the lily is the wildflower that fills the spring fields after the rains; the cedars of Lebanon are the largest trees in the prophet's known world. The promise is not that the people will be made into something else. It is that the people will be made fully themselves, in the place where they live, with the rains they need.`,
        `The last verse of the book is the prophet's signature, and it is unusual. Most prophetic books end with the word of the Lord. Hosea ends with a word to the reader: Whoever is wise, let him understand these things; whoever is discerning, let him know them; for the ways of the LORD are right, and the upright walk in them, but transgressors stumble in them. The judgment and the restoration are not given as fate. They are given as a path that some walk and some stumble on, and the question of which the reader will do is, the closing line says, the reader's. Hosea closes by handing the book back to whoever is reading it, and the handing-back is part of what the book has been doing all along.`,
      ],
      where: [
        { n: 2, label: 'Hosea 2 (the wilderness courtship)' },
        { n: 5, label: 'Hosea 5 (I will return to my place)' },
        { n: 6, label: 'Hosea 6 (let us return to the LORD)' },
        { n: 14, label: 'Hosea 14 (the closing call)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Hosea',
      role: 'Prophet of the northern kingdom',
      body: `Son of Beeri. The only writing prophet whose ministry is set entirely in the northern kingdom of Israel. Commanded by Yahweh to marry a wife of whoredom and to live the marriage in public as a sign of what Israel has done to its God — a command he obeys. Speaks of God in the language of a wounded husband and a parent who has taught a small child to walk, and introduces with this book the marriage figure that will shape the rest of the Hebrew prophetic tradition and large stretches of the New Testament.`,
    },
    {
      name: 'Gomer, daughter of Diblaim',
      role: `Hosea's wife`,
      body: `A wife of whoredom, the text says — though whether this means she was a prostitute when Hosea married her, or that she became unfaithful afterward, or that the description is purely symbolic of Israel, has been argued in every century since. Bears three children whose names are themselves oracles. Leaves the household, by whatever means, and is bought back in chapter 3 for fifteen pieces of silver and a homer and a half of barley. The book records what is done; it does not record what she thought of any of it.`,
    },
    {
      name: 'Israel / Ephraim',
      role: 'The northern kingdom, the unfaithful wife',
      body: `The northern kingdom, called Israel in the formal indictment and Ephraim in the more intimate verses, after its largest tribe. The wife in the marriage figure; the child taught to walk in chapter 11. By Hosea's day, two centuries of separate political existence and a long history of Baal worship and imperial alliance. The prophet's diagnosis is not that Israel has formally renounced Yahweh — the cult continues — but that the people have ceased to know Yahweh in the practical, faithful, relational sense. The book's tenderness toward Ephraim is the more startling for being unmistakable.`,
    },
    {
      name: 'Yahweh',
      role: 'Wounded husband, parent who will not let go',
      body: `The voice that runs through the book is unusually exposed for a prophetic text — a voice that pleads, accuses, remembers tenderly, breaks off mid-judgment, and at the centre of chapter 11 says that he will not act on the anger that would be the just response, because he is God and not a man. The Yahweh of Hosea is the source of much of the later prophetic and apostolic vocabulary about hesed — steadfast love, covenant fidelity that does not let go even when there is reason to. The book is the place where that vocabulary is first worked out in detail.`,
    },
  ],

  cast: [
    {
      name: 'Hosea',
      role: 'PROPHET / HUSBAND',
      body: `Son of Beeri. Prophesies in the northern kingdom of Israel through the last decades of its independence, from the long late prosperity of Jeroboam II into the unstable reigns that ended at the Assyrian conquest of Samaria in 722 BCE. The only writing prophet whose ministry is set entirely in the north. Commanded by Yahweh to marry a wife of whoredom and to live the marriage in public as a sign — a command he obeys, with results the book records without commentary. Speaks of God in the language of a wounded husband and a parent who has taught a small child to walk; introduces, with this book, the marriage figure that will shape the rest of the Hebrew prophetic tradition. Almost nothing is known of his life beyond what the book itself tells, which is the marriage, the children, and the words.`,
    },
    {
      name: 'Gomer, daughter of Diblaim',
      role: 'WIFE',
      body: `Hosea's wife — a wife of whoredom, the text says, though whether this means she was a prostitute when he married her, or that she became unfaithful afterward, or that the description is purely symbolic of Israel, has been argued in every century since the book was written. Bears three children whose names are themselves oracles: Jezreel, Lo-ruhamah (Not-Pitied), Lo-ammi (Not-My-People). Leaves the household — by her own choice, by her partners' arrangement, by some combination — and is bought back, in chapter 3, for fifteen pieces of silver and a homer and a half of barley. The book records what is done; it does not record what she thought of any of it. The silence is itself part of the figure, and modern readers have rightly noticed the cost the figure imposes on her.`,
    },
    {
      name: 'The Three Children',
      role: 'WALKING ORACLES',
      body: `Jezreel, Lo-ruhamah, Lo-ammi. The first is named for the valley where Jehu had massacred the house of Ahab a generation earlier and where, the text says, the bow of Israel will be broken. The second is named Not-Pitied, because Yahweh will no longer have pity on the house of Israel. The third is named Not-My-People, with the explanation that follows: for you are not my people, and I am not your God. They grow up in the village under those names. At the close of chapter 1 and the opening of chapter 2 the names turn — Lo-ammi will be called my people, Lo-ruhamah will be called pitied, Jezreel will be the valley where the heavens answer the earth — but the children are not new children; they are renamed. The naming and the renaming are the book's most exposed pieces of prophetic theatre.`,
    },
    {
      name: 'Israel / Ephraim',
      role: 'UNFAITHFUL SPOUSE',
      body: `The northern kingdom, called Israel in the formal indictment and Ephraim in the more intimate verses (after its largest tribe). The wife in the figure; the child taught to walk in chapter 11. By Hosea's day, two centuries of separate political existence and a long history of the high places, Baal worship, and political alliance with first one empire and then another. The prophet's diagnosis is not that Israel has formally renounced Yahweh — the cult continues, the priests are busy — but that the people have ceased to know Yahweh in the practical, faithful, relational sense, and the cult continuing is part of the indictment rather than its refutation. The book's tenderness toward Ephraim is the more startling for being unmistakable. The husband does not stop loving the wife. The parent does not stop remembering the child.`,
    },
    {
      name: 'Yahweh',
      role: 'WOUNDED HUSBAND',
      body: `The God of the marriage figure. The voice that runs through the book is unusually exposed for a prophetic text — a voice that pleads, accuses, remembers tenderly, breaks off mid-judgment, and at the centre of chapter 11 says, in one of the most carefully composed verses in the Hebrew Bible, that he will not act on the anger that would be the just response, because he is God and not a man. The Yahweh of Hosea is the same God of the rest of the Hebrew canon, but the language used of him here is the language a husband would use, and a parent who taught a small child to walk would use, and the language is allowed to do its work without being diluted into safer terms. The book is the source of much of the later prophetic and apostolic vocabulary about steadfast love (hesed) — the word that means covenant fidelity that does not let go even when there is reason to.`,
    },
    {
      name: 'The Prophets as Class',
      role: 'WATCHMEN',
      body: `Hosea is unusual among the writing prophets for the self-awareness with which he places himself in a tradition. In chapter 6 he speaks of God's having hewn his people by the prophets and slain them by the words of his mouth. In chapter 9 he calls the prophet the watchman of Ephraim with God, and notes the cost: the prophet is a fool, the spiritual man is mad, because of the greatness of your iniquity, and the great hatred. In chapter 12 he reaches back to Jacob fleeing to the field of Aram, and back further to the Exodus: by a prophet the LORD brought Israel up out of Egypt, and by a prophet he was preserved. The prophets, in Hosea's hands, are a class with a long history; he is one of them, and his book carries the consciousness of that history into the figure of the marriage.`,
    },
  ],

  castGroups: [
    {
      label: 'The prophet and his household',
      characters: [
        {
          id: 'hosea',
          tag: 'Prophet',
          name: 'Hosea',
          epithet: 'Son of Beeri, prophet of the north',
          body: `The only writing prophet whose ministry is set entirely in the northern kingdom. Commanded by Yahweh to marry a wife of whoredom and live the marriage in public as a sign. Speaks of God in the language of a wounded husband and a parent who taught a small child to walk. The most personally exposed prophet in the Book of the Twelve. Almost nothing is known of his life beyond what this book records.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        },
        {
          id: 'gomer',
          tag: 'Wife',
          name: 'Gomer, daughter of Diblaim',
          epithet: `Hosea's wife, wife of whoredom`,
          body: `Hosea's wife. Bears three children whose names are oracles. Leaves the household by whatever means, and is bought back in chapter 3 for fifteen pieces of silver and a homer and a half of barley. The book records what is done; it does not record what she thought of any of it. Modern readers have rightly noted the cost the figure of the unfaithful wife imposes on her.`,
          appears: [1, 2, 3],
        },
        {
          id: 'the-three-children',
          tag: 'Walking Oracles',
          name: 'The Three Children',
          epithet: 'Jezreel, Lo-ruhamah, Lo-ammi',
          body: `Named by God's command after a massacre, after withdrawal of pity, after the dissolution of the covenant formula itself. They grow up in the village under those names. At the end of chapter 1 the names turn: Not-Pitied becomes Pitied; Not-My-People becomes My People; Jezreel, the valley of slaughter, becomes the valley where the heavens answer the earth. Named children, renamed.`,
          appears: [1, 2],
        },
      ],
    },
    {
      label: 'The theological figures',
      characters: [
        {
          id: 'yahweh',
          tag: 'Wounded Husband',
          name: 'Yahweh',
          epithet: 'God of Israel, husband and parent',
          body: `The voice that runs through all fourteen chapters — pleading, accusing, remembering tenderly, breaking off mid-judgment. In chapter 11, the parent who taught Ephraim to walk cannot give him up and says so in one of the most unguarded passages in the Hebrew Bible. The source of the later prophetic vocabulary about hesed — steadfast love — and the first extended portrait in Scripture of a God whose love does not let go even when there is reason to.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        },
        {
          id: 'israel-ephraim',
          tag: 'Unfaithful Spouse',
          name: 'Israel / Ephraim',
          epithet: 'The northern kingdom, the unfaithful wife',
          body: `Called Israel in the formal indictment and Ephraim in the more intimate verses, after its largest tribe. The wife in the marriage figure; the child taught to walk in chapter 11. The cult continues — priests are busy, feasts are kept — but the practical relational knowing of Yahweh has gone out of it. The book's tenderness toward Ephraim is the more startling for being unmistakable. The husband does not stop loving the wife.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        },
        {
          id: 'the-priests',
          tag: 'Failed Watchmen',
          name: 'The Priests',
          epithet: 'Grown fat on sin',
          body: `Named in chapter 4 as the primary culprits of the knowledge failure: they were supposed to teach knowledge of God and instead grew fat on the people's sins. The people are destroyed for lack of knowledge because the priests rejected it. Their multiplying sanctuaries — the high places, the calves, the altars at Bethel now renamed Beth-aven (house of vanity) — are the visible shape of the failure.`,
          appears: [4, 5, 6, 10],
        },
        {
          id: 'the-kings',
          tag: 'Foam on Water',
          name: 'The Kings of Israel',
          epithet: 'Rising and falling like foam',
          body: `Five kings in thirteen years in Hosea's lifetime — usurpations, assassinations, the political chaos of the last decades of the northern kingdom. The prophet's image for them is foam on water. In chapter 13 Yahweh says: I will be your king — where now is your king, that he may save you? The political history that runs behind the book is one of the shortest, most violent kingship sequences in the Hebrew canon.`,
          appears: [7, 8, 13],
        },
      ],
    },
  ],

  chapterLabel: n => `Hosea ${n}`,

  chapters: chapters.map(c => ({
    n: c.n,
    title: c.tourTitle,
    blurb: c.blurb,
    hook: c.hook,
    summary: c.summary,
    tour: c.tour,
    themes: c.themes,
    appears: c.appears,
  })),
};
