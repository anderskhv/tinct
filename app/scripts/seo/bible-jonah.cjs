// Jonah — SEO page data for build-seo-pages.cjs
// Anonymous, 4th-3rd c. BCE. Four chapters. The shortest and strangest of the Twelve.
// Voice: literary, declarative present, attentive to the book's sustained comic irony.

const chapters = require('/tmp/bible-jonah-chunk-1.json');

module.exports = {
  id: 'bible-jonah',
  title: 'Jonah',
  author: 'Anonymous (5th-4th c. BCE)',
  byline: '5th-4th c. BCE · Hebrew Bible · Twelve Prophets',
  titleAccent: 'a guided tour',
  hook: 'A prophet is told to go to Nineveh. He books a ship to the opposite end of the world. A storm, a fish, a five-word sermon, a converted city, a dying plant — and a question the book does not answer.',
  themesBlurb: 'Flight, mercy, repentance, and the scope of God\'s pity.',
  castBlurb: 'The running prophet and his world',
  castDesc: 'Six figures, from the sailors who outshine the prophet to the cattle who wear sackcloth.',
  chapterLabel: n => 'Jonah ' + n,
  genre: ['Biblical literature', 'Prophetic narrative', 'Hebrew Bible', 'Parable'],

  about: [
    `<em>Jonah</em> is the strangest of the Twelve Minor Prophets. It contains no sustained prophetic oracles — no visions, no calls to repent in the manner of Amos or Hosea. What it contains is a story: a prophet told to go to Nineveh runs the other way; a storm catches the ship; pagan sailors behave better than the prophet; a great fish swallows him; he prays from its belly; he is vomited onto dry land; he delivers an eight-word sermon that produces the most successful repentance in the history of prophecy; and then he walks out of the city in a fury, sits under a plant, watches the plant die, and asks to die himself. The book closes with a question God puts to the angry prophet. The prophet does not answer. The reader does.`,
    `The book is forty-eight verses long. It was almost certainly composed in the Persian or early Hellenistic period — the 4th or 3rd century BCE — using an eighth-century prophet from 2 Kings as its protagonist. The comedy is sustained and precise: the narrator records the geography of Jonah's flight with deadpan exactness, the cattle in their sackcloth without a flicker of surprise, the prophet's prayer in chapter 2 as a polished pastiche of Psalms from the belly of a fish. What the comedy is in the service of is a theological argument about the scope of divine mercy — and the closing question, with its six Hebrew words about the cattle, is the most carefully composed sentence in the book.`,
  ],

  chaptersSubtitle: 'All 4 chapters, from the flight to Tarshish to the question about the cattle.',
  chaptersLead: `<p>Jonah is four chapters, each almost exactly one movement: the flight and the storm; the prayer from the fish; the sermon and the repentance; and the argument under the plant. Read them in a single sitting — the book is shorter than most New Testament letters, and the structure is part of the meaning. The unanswered question that closes chapter 4 is what the whole book has been moving toward.</p>`,

  themesByline: 'Five threads through the book',
  themesLead: `Jonah is the Hebrew Bible's only sustained comedy, and the comedy is in the service of its central argument. Five threads run through its forty-eight verses — each one a way of tracking what the book is actually saying about the prophet, the city, and the God who appoints fish and plants and east winds with equal matter-of-fact authority.`,

  groups: [
    { label: 'The flight', subtitle: 'The commission, the ship to Tarshish, the storm, the fish.', chapters: [1, 2] },
    { label: 'The mission', subtitle: 'The second chance. The eight-word sermon. The repentance. The argument under the plant.', chapters: [3, 4] },
  ],

  themes: [
    {
      slug: 'the-running-prophet',
      title: 'The running prophet',
      greek: 'he rose to flee from the presence of the LORD',
      preview: 'Every other prophet in the Hebrew Bible goes when called. Jonah books a ship to the opposite end of the world. The verbs of descent track him from Joppa to the belly of the fish — and discover that the presence of the LORD reaches there too.',
      essay: [
        `Every other named prophet in the Hebrew Bible answers the call. Isaiah says, Here am I, send me. Jeremiah objects but goes. Ezekiel sees the chariot and obeys. Amos was no prophet but the LORD took him. Jonah, alone among them, hears the call and runs in the opposite direction. The verb in chapter 1 is precise: he rose to flee from the presence of the LORD. He is told to go east, to Nineveh on the Tigris. He goes to Joppa and buys passage to Tarshish — most likely Tartessos in southern Spain, the far end of the Phoenician trade routes, the western edge of the known world.`,
        `The narrator records the geography with deadpan precision. He went down to Joppa, found a ship going to Tarshish, paid the fare, and went down into it. The verbs of descent run through the chapter: down to Joppa, down into the ship, down into the inner part of the vessel where he falls into a deep sleep. Shortly he will be thrown down into the sea, and from there into the belly of the fish, and from there down to the roots of the mountains in the prayer of chapter 2. The flight is figured spatially as a descent — each stage of running taking him further down.`,
        `The theological joke embedded in the descent is that no depth is far enough. The prophet who is fleeing from the presence of the LORD discovers, in his prayer from the fish's belly, that even from the belly of Sheol the LORD has heard him. The flight has been not just foolish but based on a false premise — that one can put distance between oneself and the divine presence. The pagan sailors in chapter 1 know better than the prophet. When they discover whom Jonah has been fleeing from, their first response is: what is this you have done? The obviousness of their question is the book's first quiet correction of its protagonist.`,
        `What the running does, in the book's economy, is establish Jonah as a comic figure of a kind the prophetic literature does not elsewhere permit itself. He is not heroic. He is not even competent at his own rebellion. The flight fails within hours of leaving port; the great fish, appointed with the same matter-of-fact verb the book uses for the plant and the worm and the wind, is sent not as punishment but as transport. It takes him where he was supposed to go in the first place. The book is the only sustained comedy in the prophetic canon, and the comedy begins with the prophet on the wrong ship.`,
      ],
      where: [
        { n: 1, label: 'Jonah 1 (the flight, the storm, the fish)' },
        { n: 2, label: 'Jonah 2 (the prayer from the belly)' },
      ],
    },
    {
      slug: 'the-eight-word-sermon-and-the-converted-city',
      title: 'The eight-word sermon and the converted city',
      greek: 'Yet forty days, and Nineveh shall be overthrown',
      preview: 'The shortest prophetic sermon in the Hebrew Bible produces the most complete repentance. The entire city — king, people, and livestock — turns; God relents. Jonah watches it happen and walks out furious.',
      essay: [
        `When Jonah finally arrives at Nineveh in chapter 3, the sermon he delivers is the shortest in the prophetic literature. The Hebrew is five words; in standard English eight: Yet forty days, and Nineveh shall be overthrown. There is no call to repentance, no promise of mercy on condition of change, no pastoral concern. It is a flat declaration of doom — and it is the most successful prophetic sermon in the Hebrew Bible.`,
        `The city believes God. The narrator records this in the next sentence, with no transition and no commentary. They proclaim a fast, put on sackcloth. The king rises from his throne, removes his royal robe, sits in ashes. The decree he issues is among the most comprehensive in scripture: man and beast, herd and flock, shall neither eat nor drink; man and beast shall be covered with sackcloth and cry mightily to God; let everyone turn from his evil way and from the violence that is in his hands. The image of cattle in sackcloth is the book's most exposed comic note — the Assyrian livestock draped in burlap, lowing the repentance of an empire that had built its power on the cities it had levelled — and the comedy is at the same time entirely serious. When repentance comes, it is total.`,
        `God repents. The Hebrew verb — nicham, to relent, to change one's mind — is the same word used for the people's turning. God saw their works, that they turned from their evil way; and God repented of the evil that he had said he would do to them, and he did not do it. This is the verse that has scandalized theologians who want a God whose decisions are immutable. The Jonah of this book has none of that worry. The God who appoints the fish and the worm and the east wind also relents when the city relents. The pronouncement reverses because it was meant to produce the change, not to record a predetermined outcome.`,
        `Jonah, who has watched the eight words work, walks east of the city in a fury. The most successful outcome any prophet could have wanted is the worst news the chapter could bring. The book has constructed its protagonist with precision: he is the prophet who preaches doom, watches it succeed at repentance, and finds both the success and the mercy unbearable. The reader holds all of this simultaneously, which is where the book intends the reader to be.`,
      ],
      where: [
        { n: 3, label: 'Jonah 3 (the sermon and repentance)' },
      ],
    },
    {
      slug: 'the-prophet-s-anger',
      title: "The prophet's anger",
      greek: 'I knew that you are a gracious God and merciful',
      preview: "Chapter 4 discloses what the book had withheld: Jonah ran because he knew God would spare Nineveh. The prayer he prays is a confession disguised as a complaint — the Sinai creed quoted back at God as an accusation.",
      essay: [
        `Chapter 4 discloses what the book had withheld: Jonah's reason for running. He had not run because he was afraid of Nineveh or overwhelmed by the commission. He had run because he knew God was gracious and merciful, slow to anger and abounding in steadfast love, and relenting from disaster — the exact language of the Sinai self-revelation in Exodus 34 — and he had not wanted Nineveh spared. His prayer in chapter 4 is a confession disguised as a complaint. He wanted the city destroyed. The sermon was the necessary prelude to the destruction he was hoping to watch. The city's repentance, the most successful outcome any prophet could have wanted, is for Jonah the worst news the chapter could bring.`,
        `The theological move is breathtaking. Jonah has run from his commission not out of fear or inadequacy — the standard prophetic objections — but because he is afraid that God's mercy will be wider than his own. He has run from Nineveh because he did not want Nineveh saved. He had counted on the city's destruction. The forty-day countdown was, for Jonah, the period he wanted to enjoy.`,
        `The rest of the chapter is the dialogue under the plant east of the city. God appoints the plant for shade; Jonah is happy with it. God appoints the worm; the plant withers. Then God appoints the sultry east wind; the sun beats on Jonah's head; he asks again to die. The plant episode is the book's most compressed piece of argument. Jonah pities the plant, for which he did not labour and which he did not grow. God pities the great city, for which he did labour and which he did make. The argument is left as a question — and the prophet, who has been right about everything, does not answer it.`,
      ],
      where: [
        { n: 4, label: 'Jonah 4 (the plant, the worm, the question)' },
      ],
    },
    {
      slug: 'and-also-much-cattle',
      title: 'And also much cattle',
      greek: 'weve-vehemah rabbah',
      preview: "The last six Hebrew words of the book. The cattle are not an afterthought — they are the book's last refusal to be tidy, and the figure the reader is left holding the question with.",
      essay: [
        `The last six words of the book in the Hebrew are weve-vehemah rabbah — and also much cattle. The closing question is: Should I not pity Nineveh, that great city, in which there are more than a hundred and twenty thousand people who do not know their right hand from their left, and also much cattle? The cattle are not an accident. They have been in the book since chapter 3, wearing their sackcloth. They are the book's last word, and they are doing several things at once.`,
        `What the cattle do structurally is keep the line from sentimentality. The argument the book is making extends past the human. God's pity, the line says, is for the city in its full population — the people, certainly, but also the animals whose lives have no moral dimension the book concerns itself with. The mercy that has just spared Nineveh is a mercy that takes account of cattle. The scope of God's pity is the corrective to Jonah's proportionality, which reserves feeling for the small things close at hand.`,
        `The cattle also balance the plant of chapter 4. Jonah pitied the plant; God pities the cattle. Both are creatures the pity-er did not labour for, did not grow, did not make. The plant is small; the cattle are many. The plant lasted a night; the cattle have lived their lives. The proportion God is asking Jonah to consider is between his sympathy for the small thing close to him and God's sympathy for the large thing far from him.`,
        `The book ends not with a moral but with the cattle, and the cattle are the book's final refusal to be resolved into a single line. Jonah does not answer. The reader holds the question. The cattle, in their many sackcloth, are the figure the reader is holding it with.`,
      ],
      where: [
        { n: 3, label: 'Jonah 3 (the cattle in sackcloth)' },
        { n: 4, label: 'Jonah 4 (the closing question)' },
      ],
    },
    {
      slug: 'the-prophet-as-parable',
      title: 'The prophet as parable',
      greek: 'the sign of Jonah',
      preview: 'Most modern scholarship reads Jonah as a parable of the Persian or early Hellenistic period — a post-exilic self-correction on Israel\'s relationship to the nations, composed with irony the rest of the Twelve does not allow itself.',
      essay: [
        `Most modern scholarship reads the Book of Jonah as a literary composition of the Persian or early Hellenistic period — 4th or 3rd century BCE — that takes the eighth-century prophet from 2 Kings as the protagonist of a parable about Israel and the nations after the exile. The reading does not depend on the historicity of the fish or the cattle's sackcloth; it depends on the book's craft. The narrative is too tightly composed, the symmetries too exact, the irony too sustained, for the book to be read as the kind of historical record that 2 Kings is.`,
        `The work the parable is doing is this. After the exile, Israel has come back to a small, vulnerable Yehud under Persian then Greek imperial rule; the great cities — Babylon, Susa, Alexandria — are full of the descendants of every empire that had ever crushed Israel. The question every post-exilic prophetic book has to handle is what God's relation to those cities is, and what Israel's relation to them ought to be. Jonah handles the question by writing a story in which a prophet is sent to one of those cities, runs from the assignment, is forced to deliver the message anyway, watches the city repent, and is left under a dying plant in a fury the reader can recognize.`,
        `The book is, in effect, the Hebrew Bible's quiet self-correction of its own prophetic tradition. Prophetic announcements of judgment on the nations had often been justified — the cruelties of Assyria and Babylon were not invented. Jonah does not retract the announcement. It places, alongside it, the possibility that the announcement was meant, all along, to produce repentance — and that when the repentance comes, the announcement reverses, and the prophet who wanted the destruction has to be argued with, gently, by God under a withered plant.`,
        `The figure has had an enormous afterlife. Jesus invokes the sign of Jonah in the Gospels; the medieval and modern Jewish reading on Yom Kippur turns on the same question the book leaves open. The reader who finishes the book holding the cattle is the reader the book was written for.`,
      ],
      where: [
        { n: 1, label: 'Jonah 1 (the pagan sailors and their piety)' },
        { n: 3, label: 'Jonah 3 (the Assyrian city that repents)' },
        { n: 4, label: 'Jonah 4 (the unanswered question)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Jonah', role: 'Son of Amittai, the running prophet', body: `Mentioned once in 2 Kings 14:25 as a northern prophet from Gath-hepher active under Jeroboam II. The book that bears his name uses that figure as the protagonist of a parable composed several centuries later. He hears the call and books a ship in the opposite direction. He sleeps through the storm. He tells the sailors to throw him over. He prays from the fish's belly in polished Psalter pastiche. He walks one day into Nineveh and delivers the shortest sermon in the prophetic literature. He watches the city repent and walks out furious, asking God to let him die — twice. He is the Hebrew Bible's only comic prophet, and his interiority is exposed with an uncomfortable precision that no other prophetic book allows.` },
    { name: 'The Sailors', role: 'Pagan crew of the Tarshish ship', body: `Phoenician merchants, the book's first surprise. When the storm comes they pray each to his own god, jettison the cargo, and cast lots. When they discover Jonah is fleeing from the LORD who made the sea they are appalled. They try to row back to land before they will throw him over. They ask the LORD's forgiveness beforehand. When the sea calms they fear the LORD greatly, offer sacrifices, and make vows. They behave better than the prophet on every point. Their conduct is the book's first quiet correction of the assumption that the foreigners are the enemies of God.` },
    { name: 'The King of Nineveh', role: 'Repentant monarch of Assyria', body: `He hears the eight-word sermon, rises from his throne, removes his royal robe, covers himself with sackcloth, and sits in ashes. He issues the decree that puts the city under fast — man and beast, herd and flock — and adds the moral condition: let everyone turn from his evil way and from the violence that is in his hands. He is one of the most thoroughly repentant figures in the Hebrew Bible, and he is the king of the empire that had destroyed the northern kingdom. The book gives him no name.` },
    { name: 'The Great Fish', role: 'Divine transport', body: `Appointed by the LORD — the same verb used for the plant, the worm, and the east wind — to swallow Jonah after the sailors throw him over. The Hebrew dag gadol simply means great fish; the word whale belongs to later translation. The fish is not punishment. It is transport: three days and three nights in the belly, during which Jonah prays his psalm pastiche, then vomited out onto dry land at the LORD's command. The book treats it with the same matter-of-fact tone it treats everything else. The LORD appoints the means; the means do their work.` },
  ],

  castSubtitle: 'Six figures from the prophet to the cattle.',
  castLead: `<p>Jonah has the smallest named cast of any prophetic book — essentially one human protagonist, one pagan crew, one foreign king, one foreign city, and a collection of appointed animals and plants. The book's argument is made through their interactions, and the figure it leaves the reader holding is the unnamed livestock that wore sackcloth in chapter 3 and returned in the closing question of chapter 4.</p>`,

  castGroups: [
    {
      label: 'The prophet',
      characters: [
        {
          id: 'jonah',
          tag: 'PROPHET',
          name: 'Jonah',
          epithet: 'Son of Amittai, running from Nineveh',
          body: `Mentioned once in 2 Kings 14:25 as a prophet from Gath-hepher in the northern kingdom who had announced, under Jeroboam II, the restoration of Israel's borders. The book uses that historical figure as the protagonist of a parable. He hears the call — go to Nineveh, call out against it — and books a ship to Tarshish. He sleeps through the storm while the pagan sailors pray. He tells them to throw him over. He prays a careful Psalter pastiche from inside the fish. He obeys the second commission, delivers eight words, watches the city repent in sackcloth (cattle included), and walks out of the city furious — not because the mission failed but because it succeeded. He asks to die twice. He does not answer the question. He is the Hebrew Bible's most exposed comic figure.`,
          appears: [1, 2, 3, 4],
        },
      ],
    },
    {
      label: 'The people of the story',
      characters: [
        {
          id: 'the-sailors',
          tag: 'PAGAN CREW',
          name: 'The Sailors',
          epithet: 'Ship bound for Tarshish',
          body: `Phoenician merchants whose ship Jonah boards at Joppa. The book's first surprise: when the storm comes they pray each to his own god, throw the cargo, cast lots. When they find the guilty party they are appalled — what is this you have done? They try to row back to shore before throwing him over. They pray the LORD's forgiveness. When the sea calms they fear the LORD greatly, sacrifice, and make vows. They are more pious in their response to the crisis than the prophet of the LORD on board with them. Their conduct is the book's first and quietest correction of the assumption that the foreigners are the enemies of God.`,
          appears: [1],
        },
        {
          id: 'the-king-of-nineveh',
          tag: 'REPENTANT MONARCH',
          name: 'The King of Nineveh',
          epithet: 'King of the great city',
          body: `The book gives him no name, only his title. He hears the five-word Hebrew announcement and rises from his throne, removes his royal robe, sits in ashes, and issues the most comprehensive repentance decree in the Hebrew Bible: man and beast, herd and flock, in sackcloth; everyone to turn from his evil way and from the violence that is in his hands. The decree adds the moral content the sermon lacked. He is the king of the empire that had destroyed the northern kingdom in 722, and his repentance is total. The book records his response with the same deadpan it records everything else, as if nothing could be more natural than Assyria in sackcloth.`,
          appears: [3],
        },
        {
          id: 'the-people-of-nineveh',
          tag: 'CONVERTED CITY',
          name: 'The People of Nineveh',
          epithet: 'A hundred and twenty thousand',
          body: `More than a hundred and twenty thousand people who do not know their right hand from their left — often read as a description of moral innocents, small children, or simply the general population who have not been counted among the guilty. They believe God before the king's decree is issued, which the narrator records as if the response is organic rather than top-down. They are the most successful audience any prophet has ever addressed. The book leaves them at the moment of their turning. The cattle, in their own sackcloth, are part of them.`,
          appears: [3, 4],
        },
      ],
    },
    {
      label: 'The appointed creatures',
      characters: [
        {
          id: 'the-great-fish',
          tag: 'TRANSPORT',
          name: 'The Great Fish',
          epithet: 'Dag gadol — great fish',
          body: `Appointed by the LORD to swallow Jonah after the sailors throw him over. The Hebrew dag gadol simply means great fish; the word whale belongs to later translation. Three days and three nights in the belly, during which Jonah prays. Then vomited onto dry land at the LORD's command. The book introduces it with the same matter-of-fact verb it uses for the plant, the worm, and the wind: the LORD appointed. It is not punishment. It is transport. The fish carries the prophet to where the prophet was supposed to go in the first place.`,
          appears: [1, 2],
        },
        {
          id: 'the-plant-lesson',
          tag: 'PLANT · WORM · WIND',
          name: 'The Plant Lesson',
          epithet: 'Qiqayon, the worm, the east wind',
          body: `Three things the LORD appoints in chapter 4, in sequence, to make the closing argument. The plant — qiqayon, often translated castor-oil plant or gourd — grows over Jonah in a single night, gives shade; he is exceedingly glad of it. The worm is appointed at dawn and attacks the plant; it withers. Then the LORD appoints a sultry east wind; the sun beats on Jonah's head; he asks to die. The sequence is the book's most compressed argument: Jonah pities the plant for which he did not labour; God pities the great city for which he did. The argument is left as a question: Should I not pity Nineveh, and also much cattle? Jonah does not answer.`,
          appears: [4],
        },
      ],
    },
  ],

  chapters,
};
