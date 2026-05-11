// SEO content data for the Book of Micah (late 8th century BCE).
// Contemporary of Isaiah; from the small Judean village of Moresheth.
// Voice: literary, declarative present, attentive to prophetic register.
// Generated from /tmp/bible-micah-chunk-1.json (7 chapters).

const chapters = require('/tmp/bible-micah-chunk-1.json');

module.exports = {
  id: 'bible-micah',
  title: 'Micah',
  author: 'Micah of Moresheth',
  byline: '8th c. BCE · Hebrew Bible · Twelve Prophets',
  titleAccent: 'a guided tour',
  hook: 'A village prophet watches Assyria roll past his own towns, turns their place-names into bitter puns of doom, and delivers the line the entire prophetic tradition will live on: do justice, love mercy, walk humbly with your God.',

  genre: ['Prophecy', 'Hebrew Bible', 'Old Testament', 'Wisdom literature'],

  about: [
    `<em>Micah</em> is seven chapters from the rougher contemporary of Isaiah — a prophet from Moresheth-Gath, a small village in the Judean lowlands, twenty-five miles southwest of Jerusalem. He prophesies in the reigns of Jotham, Ahaz, and Hezekiah, across the years of the Assyrian advance: the destruction of Samaria in 722, the campaigns through the lowland, Sennacherib's siege of Jerusalem in 701. He watches the Assyrian armies roll past his own village toward the capital, and the early chapters lament the towns of his region by name in a series of bitter puns on their place-names.`,
    `The book is structured in three alternating movements of judgment and hope. Chapters 1–3 are the indictment: the rulers eat the people like meat in a kettle; the prophets proportion their message to the size of the meal; Zion will be plowed as a field. Chapters 4–5 turn abruptly to the famous peace oracle and the prophecy of Bethlehem. Chapters 6–7 close with YHWH's courtroom — the great do-justice-love-mercy answer — and a final lament that ends on the question embedded in the prophet's own name: Who is a God like you?`,
  ],

  chaptersSubtitle: 'All 7 chapters, in three movements — judgment, hope, and the courtroom of the LORD.',
  chaptersLead: `<p>Micah moves in pairs: indictment then promise, lament then vision. Chapters 1–3 build the case against Jerusalem's elite. Chapters 4–5 pivot to the swords-into-plowshares oracle and the Bethlehem prophecy. Chapters 6–7 stage the great courtroom and close on the prophet's own name as a doxology.</p>`,

  chapterLabel: n => 'Micah ' + n,

  groups: [
    {
      label: 'Judgment · Micah 1–3',
      subtitle: 'The indictment of Samaria, Jerusalem, and the ruling class.',
      chapters: [1, 2, 3],
    },
    {
      label: 'Hope · Micah 4–5',
      subtitle: 'Swords into plowshares; the ruler from Bethlehem.',
      chapters: [4, 5],
    },
    {
      label: 'Lawsuit and lament · Micah 6–7',
      subtitle: "YHWH’s courtroom, the three-verb answer, and the closing doxology.",
      chapters: [6, 7],
    },
  ],

  themesByline: 'Five threads through the book',
  themesLead: `Micah is the prophetic tradition at its most precise: it names roles, mechanisms, and ZIP codes. The themes are not abstract vices but exact practices — rulers who eat people, prophets paid by the meal, a God who names the place the next king will be born.`,
  themesBlurb: 'Justice, leadership, Bethlehem, peace, and the closing doxology.',

  themes: [
    {
      slug: 'justice-mercy-humility',
      title: 'Do justice, love mercy, walk humbly',
      preview: 'The most-quoted single line in the prophetic tradition. The setting is a courtroom; the people have just escalated their offering to the firstborn child. The prophet cuts the entire scale off in three verbs.',
      essay: [
        `The most quoted single passage in Micah, and one of the most quoted in the entire prophetic tradition, is the answer the prophet gives in chapter 6 to the question the people put. The setting is a courtroom. The LORD has a controversy with his people; the mountains and the foundations of the earth are called as witnesses. The LORD recites his case: O my people, what have I done to you? How have I wearied you? Answer me. I brought you up from the land of Egypt, and redeemed you from the house of slavery; I sent before you Moses, Aaron, and Miriam. The line is gentle, almost wounded, and it is the prosecution.`,
        `The people answer with what reads, in the Hebrew rhythm, as liturgical anxiety: With what shall I come before the LORD? Shall I come before him with burnt offerings, with calves a year old? Will the LORD be pleased with thousands of rams, with ten thousands of rivers of oil? Shall I give my firstborn for my transgression, the fruit of my body for the sin of my soul? The escalation is the prophet's point. They are climbing the scale of offering — calves, rams, rivers of oil, firstborn child — looking for the price that will satisfy.`,
        `And then, with the abruptness the prophetic literature is capable of, Micah cuts the entire scale off. He has shown you, O man, what is good; and what does the LORD require of you but to do justice, and to love mercy, and to walk humbly with your God? Three verbs. Three objects. The whole of what is required. The Hebrew is precise: asot mishpat — to do justice — is not to admire it but to carry out the actual judgment in the actual case at the actual gate. Ahavat hesed — to love mercy — uses the great covenantal word hesed, steadfast loving-kindness that does not let go. Hatznea lekhet im elohekha — to walk humbly with your God — carries the connotation of carefully, modestly, attentively, with the discretion of a person who knows the company they are in.`,
        `The line refuses the religious bargain the people have just been trying to strike. There is no quantity of offering that buys what God wants. What God wants is the practical, daily, attentive carrying-out of the relation — at the gate, in the household, with the neighbour, with the LORD himself. The line has been quoted by Jewish, Christian, and secular ethical traditions for twenty-seven hundred years, and it has lost none of its sharpness. It lands harder when read with the full courtroom around it.`,
      ],
      where: [
        { n: 6, label: 'Micah 6 (the courtroom)' },
      ],
    },
    {
      slug: 'ruler-from-bethlehem',
      title: 'The ruler from Bethlehem',
      preview: 'The prophecy of chapter 5 names a village six miles south of Jerusalem. The future king will not come from the great city but from the small one, of the line that came from there before the city was the city.',
      essay: [
        `The fifth chapter of Micah contains the most famous single prophecy in the book and one of the most contested in the prophetic literature. But you, O Bethlehem Ephrathah, who are little to be among the clans of Judah, from you shall come forth for me one who is to be ruler in Israel, whose coming forth is from of old, from ancient days. The line names a small village six miles south of Jerusalem — where David had been born to Jesse the Ephrathite. The naming is deliberate. The promise is not for a new king from the great city. It is for a ruler from the small village, of the line that came from there originally, returning to the source.`,
        `The rest of the chapter develops the figure with care. The ruler will stand and shepherd his flock in the strength of the LORD; they shall dwell secure, for now he shall be great to the ends of the earth; he shall be their peace. The image is pastoral and exact — the ruler as shepherd, the flock dwelling secure, the peace as a state of dwelling rather than as the absence of armies. Micah is the prophet of the small towns, and he gives the messianic prophecy a small-town birthplace.`,
        `The Christian tradition has read the chapter through Matthew 2, where the chief priests and scribes of Herod's court quote the verse in answer to the Magi's question, and the line has been part of every Christmas service since. What is worth holding alongside that reading is the prophetic context in Micah itself. The ruler from Bethlehem is announced in the same book that has just announced that Zion will be plowed as a field; the small village is given the future the great city is being told to give up. The prophecy is a deep critique of the Davidic establishment as much as it is a hope for a Davidic figure, and the deepness of the critique is part of why the line has had its long afterlife.`,
      ],
      where: [
        { n: 5, label: 'Micah 5 (the Bethlehem prophecy)' },
      ],
    },
    {
      slug: 'the-leaders-named',
      title: 'The leaders named',
      preview: 'Chapter 3 names roles and mechanisms. Rulers eat the people like meat in a kettle. Prophets adjust their message to the size of the meal. Priests teach for hire. The precision is the indictment.',
      essay: [
        `Few passages in the prophetic literature name the leadership of a society with the precision that the third chapter of Micah does. Three parallel oracles, each beginning with a vocative addressed to a particular class. Hear, you heads of Jacob, and rulers of the house of Israel — you who hate the good and love the evil, who tear the skin from off my people, and their flesh from off their bones; who eat the flesh of my people, and flay their skin from off them, and break their bones in pieces, and chop them up like meat in a kettle. The figure is a butcher's. The rulers are not described as merely indifferent but as cannibals, eating the very people they are supposed to govern. The image is calculated to give the audience no room to soften the indictment.`,
        `The second oracle is against the prophets. Thus says the LORD concerning the prophets who lead my people astray, who cry peace when they have something to eat, but declare war against him who puts nothing into their mouths. The mechanism is exactly stated. The prophet-for-pay does not tell lies in some abstract sense; he proportions his message to the size of the meal. The third oracle joins all three classes — the heads who give judgment for a bribe, the priests who teach for hire, the prophets who divine for money — and lays the destruction of Zion at their feet.`,
        `The specificity is one of the book's gifts to the prophetic tradition. Most prophetic indictments name a sin abstractly — idolatry, oppression, faithlessness — and let the audience locate themselves in it. Micah names the role and the mechanism. He says, you, and the you is exactly the person at the gate. The accuracy is part of why the chapter is uncomfortable to read in any age in which the same roles still exist. Micah, who was no prophet by trade — a villager from Moresheth — is exactly the figure who can say what they are.`,
      ],
      where: [
        { n: 3, label: 'Micah 3 (the three oracles)' },
      ],
    },
    {
      slug: 'swords-into-plowshares',
      title: 'Swords into plowshares',
      preview: 'The most famous oracle of peace in the Hebrew Bible — shared, almost word for word, with Isaiah. Micah adds one verse Isaiah does not have: the vine, the fig tree, the smallholder sitting safe.',
      essay: [
        `The fourth chapter opens with the most famous oracle of peace in the Hebrew Bible. It shall come to pass in the latter days that the mountain of the house of the LORD shall be established as the highest of the mountains; peoples shall flow to it, and they shall beat their swords into plowshares, and their spears into pruning hooks; nation shall not lift up sword against nation, neither shall they learn war any more. The oracle is almost word for word identical with Isaiah 2:2-4, which has produced a long scholarly argument about which prophet has it first.`,
        `What is unmistakable in Micah's version is the verse that follows, which is not in Isaiah and which is the prophet of the lowland's signature: but they shall sit every man under his vine and under his fig tree, and none shall make them afraid. The vine and the fig tree are the small farmer's idiom of peace — the smallholding owned, the trees mature, the family safe enough to sit in the shade. Micah takes Isaiah's grand vision and adds the village's measure of what peace will actually look like in the courtyard.`,
        `The oracle has had an extraordinary afterlife. The verse about beating swords into plowshares is engraved on a wall opposite the United Nations in New York. What is less often noted is the prophet's stipulation about how the peace is to come: not by treaty but by the flowing of the nations to the mountain of the LORD where they are taught the LORD's ways and walk in his paths. The peace is the consequence of an instruction; the swords are converted because the peoples coming to the mountain have already been changed by the teaching. Micah's hope is not for a peace that holds despite the peoples' hatreds. It is for a peace that becomes possible because the peoples have been changed.`,
      ],
      where: [
        { n: 4, label: 'Micah 4 (the peace oracle)' },
      ],
    },
    {
      slug: 'who-is-a-god-like-you',
      title: 'Who is a God like you',
      preview: "The book closes with the prophet's own name as a question. Mi-el kamokha — who is a God like you — is the punning answer embedded in mikhayahu, the name Micah. The answer is the steadfast love that does not let go.",
      essay: [
        `The book closes in chapter 7 on a strange, intimate, and unforgettable note. The prophet looks at the society around him and finds a household that has come apart. The godly has perished from the earth; they all lie in wait for blood; the prince and the judge ask for a bribe; a man's enemies are the men of his own house. The collapse is not at the gate alone — it has reached the supper table.`,
        `And then, with the turn the book has been making throughout, the prophet's voice changes register. But as for me, I will look to the LORD; I will wait for the God of my salvation; my God will hear me. Rejoice not over me, O my enemy; when I fall, I shall rise; when I sit in darkness, the LORD will be a light to me. The first-person voice is unusual in the prophetic literature; we are hearing the prophet himself, sitting alone in the dark, wrapping his confidence around something that has not yet arrived.`,
        `The last verses are some of the most carefully composed in the Twelve. Who is a God like you, pardoning iniquity and passing over transgression for the remnant of his inheritance? He does not retain his anger forever, because he delights in steadfast love. He will again have compassion on us; he will tread our iniquities under foot; you will cast all our sins into the depths of the sea. The line mi-el kamokha — who is a God like you — is the punning answer to the prophet's own name, mikhayahu, which means who is like the LORD. Micah closes the book with his name as a question, and the question is answered by the steadfast love that does not let go, the compassion that returns, the iniquities cast into the depths of the sea where they cannot be retrieved. After seven chapters of indictment and lament and the long courtroom of chapter 6, the book ends in a single voice — the prophet's own — saying that the God who has had a controversy with his people is also the God whose mercy is the answer to the prophet's name.`,
      ],
      where: [
        { n: 7, label: 'Micah 7 (the closing doxology)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Micah of Moresheth',
      role: 'Village prophet, contemporary of Isaiah',
      body: `From Moresheth-Gath, in the Shephelah, the lowland between the coastal plain and the Judean hills, about twenty-five miles southwest of Jerusalem. Prophesies in the reigns of Jotham, Ahaz, and Hezekiah of Judah, across the years of the Assyrian advance. He is the rougher voice of his generation — closer to the village, harder on the urban elite, less polished in his Hebrew, and more willing to say what the courts of Jerusalem do not want to hear. His name means who is like the LORD, and the book closes by turning the name into a doxology.`,
    },
    {
      name: 'The Rulers of Jerusalem',
      role: 'Urban elite, indicted in chapter 3',
      body: `Named with precision rare in the prophetic literature: heads who hate the good and love the evil, who tear the skin from the people, who eat the flesh of the people and chop them like meat in a kettle. They are also the heads who give judgment for a bribe. Micah holds them as a class, never as named individuals, and lays the destruction of Zion at their feet in the final verse of chapter 3.`,
    },
    {
      name: 'The Prophets-for-Hire',
      role: 'Professional class, indicted in chapter 3',
      body: `The prophets who cry peace when they have something to eat but declare war against him who puts nothing into their mouths. Not false prophets in the sense of worshipping other gods — they are the professional prophets of Jerusalem whose message is proportioned to the size of the meal. Micah, who was no prophet by trade, is exactly the figure who can name the mechanism.`,
    },
    {
      name: 'The Coming Ruler',
      role: 'Bethlehem promise, chapter 5',
      body: `From Bethlehem Ephrathah, little among the clans of Judah — the village where David was born to Jesse the Ephrathite. He will stand and shepherd his flock in the strength of the LORD; the people will dwell secure; he shall be their peace. The Christian tradition reads the prophecy through Matthew 2; the prophetic context adds that the future king comes not from the great city but from the village, of the older line that preceded the city.`,
    },
    {
      name: 'The Voice in the Courtroom',
      role: 'The three-verb answer, chapter 6',
      body: `The figure who cuts off the people's escalating offer — calves, thousands of rams, rivers of oil, the firstborn — with three verbs: do justice, love mercy, walk humbly with your God. The Hebrew text leaves the voice ambiguous: prophet, LORD, or unnamed third. The ambiguity has been part of the line's strange power across twenty-seven hundred years of Jewish, Christian, and secular ethical tradition.`,
    },
    {
      name: 'The Remnant',
      role: 'The she\'erit ya\'akov — who remains',
      body: `The recurring figure in the book's later chapters: those who survive the Assyrian destruction and walk in the name of the LORD their God. Not the elite — the surviving small holding, the village left after the army has passed. The book's closing verses name the remnant as the inheritance God still claims after the cities have fallen. Micah gives the prophetic literature its strongest doctrine of the remnant, shaped by the geography of the towns he watched the Assyrians destroy.`,
    },
  ],

  cast: [
    {
      name: 'Micah',
      role: 'PROPHET / VILLAGER',
      body: `Of Moresheth-Gath, a small village in the Shephelah, the lowland between the coastal plain and the Judean hills, about twenty-five miles southwest of Jerusalem. Prophesies in the late eighth century BCE, contemporary with Isaiah in the capital, in the reigns of Jotham, Ahaz, and Hezekiah of Judah. His ministry covers the years of the Assyrian advance — the destruction of Samaria in 722, the campaign against the lowland in the 710s, Sennacherib's siege of Jerusalem in 701. He is the prophet of the small towns; he watches the Assyrian armies roll past his own village and the early chapters of his book lament the towns of his region by name in a series of bitter puns. He is the rougher voice of his pair with Isaiah — closer to the village, harder on the urban elite, less polished in his Hebrew, and more willing to say what the courts of Jerusalem do not want to hear.`,
    },
    {
      name: 'The Rulers of Jerusalem',
      role: 'URBAN ELITE',
      body: `Named in chapter 3 with a precision rare in the prophetic literature: the heads of Jacob and the rulers of the house of Israel, who hate the good and love the evil, who tear the skin from the people, who eat the flesh of the people and chop them like meat in a kettle. The figure is butcher's. They are also the heads who give judgment for a bribe at the city gate, and they are joined in the chapter's closing verse with the priests who teach for hire and the prophets who divine for money. They never appear as named individuals in the book; Micah holds them as a class, the leadership of the capital who have run the country into the ground while telling each other and themselves that the cult will keep the LORD on their side.`,
    },
    {
      name: 'The Prophets-for-Hire',
      role: 'PROFESSIONAL CLASS',
      body: `The prophets who lead the people astray — chapter 3 — who cry peace when they have something to eat but declare war against him who puts nothing into their mouths. They are not false prophets in the later vocabulary; the book does not say they worship other gods. They are the professional prophets of Jerusalem whose office and stipend depend on the patronage of the rulers Micah has just indicted. Their offence is the proportioning of their message to the size of the meal. Micah, who was no prophet by trade — a villager from Moresheth — is exactly the figure who can say what they are.`,
    },
    {
      name: 'The Coming Ruler',
      role: 'BETHLEHEM PROMISE',
      body: `The ruler announced in chapter 5: from Bethlehem Ephrathah, which is little to be among the clans of Judah, comes forth the one who shall be ruler in Israel, whose coming forth is from of old, from ancient days. He will stand and shepherd his flock in the strength of the LORD; the people will dwell secure; he shall be their peace. The figure is pastoral, deliberately small-town, named for the village where David had been born to Jesse the Ephrathite. The Christian tradition has read the prophecy through Matthew 2, where Herod's chief priests quote the verse to identify the place the Magi must go.`,
    },
    {
      name: 'The Voice in the Courtroom',
      role: 'CHAPTER 6 ANSWER',
      body: `The figure who answers the people's escalating offer in chapter 6. The LORD has just brought his case; the people have just panicked, climbing the scale of offering from calves a year old to thousands of rams to ten thousands of rivers of oil to the firstborn child. The voice cuts the scale off: He has shown you, O man, what is good; and what does the LORD require of you but to do justice, to love mercy, and to walk humbly with your God? The voice is not assigned in the text — Hebrew ambiguity leaves it open whether it is the prophet, the LORD, or an unnamed third figure — and the ambiguity has been part of the line's strange power for twenty-seven hundred years.`,
    },
    {
      name: 'The Remnant',
      role: 'WHO REMAINS',
      body: `The recurring figure in the book's later chapters: the she'erit ya'akov, the remnant of Jacob — those who survive the Assyrian destruction and the long judgment, who walk in the name of the LORD their God, who are gathered like sheep in a fold. The remnant is not the elite. It is the surviving small holding, the village left after the army has passed. The book's closing verses name the remnant as the inheritance God still claims after the cities have fallen. Micah, the prophet of the lowland, gives the prophetic literature its strongest doctrine of the remnant, shaped by the geography of the towns he has watched the Assyrians destroy.`,
    },
  ],

  castSubtitle: 'The prophet, the ruling class, and the figures of the seven chapters.',
  castLead: `<p>Micah has no named dramatic cast in the conventional sense — it is prophecy, not narrative. The figures here are the prophet himself, the classes he indicts, and the three named roles the book introduces: the coming ruler from Bethlehem, the voice who answers in the courtroom, and the remnant who remain after the cities fall.</p>`,

  castGroups: [
    {
      label: 'The prophet',
      characters: [
        {
          id: 'micah',
          tag: 'Prophet',
          name: 'Micah of Moresheth',
          epithet: 'Village prophet, contemporary of Isaiah',
          body: `From Moresheth-Gath in the Shephelah, about twenty-five miles southwest of Jerusalem. Prophesies in the reigns of Jotham, Ahaz, and Hezekiah, covering the years of the Assyrian advance — Samaria's fall in 722, the lowland campaigns, Sennacherib's siege of Jerusalem in 701. The rougher contemporary of Isaiah: closer to the village, harder on the urban elite, less polished in his Hebrew. His name means who is like the LORD, and the book closes with his name turned into a doxology.`,
          appears: [1, 2, 3, 4, 5, 6, 7],
        },
      ],
    },
    {
      label: 'The indicted classes',
      characters: [
        {
          id: 'rulers',
          tag: 'Elite',
          name: 'The Rulers of Jerusalem',
          epithet: 'Heads of Jacob; named in chapter 3',
          body: `The heads of the house who hate the good and love the evil, who tear the skin from the people and chop them like meat in a kettle. Joined in chapter 3 with the priests who teach for hire and the prophets who divine for money. Micah holds them as a class, never as named individuals, and lays the destruction of Zion at their feet.`,
          appears: [1, 2, 3],
        },
        {
          id: 'prophets-for-hire',
          tag: 'Professional',
          name: 'The Prophets-for-Hire',
          epithet: 'Who cry peace when they have something to eat',
          body: `The professional prophets of Jerusalem whose message is proportioned to the size of the meal. Not foreign or idol-worshipping — they are the court prophets whose stipend depends on the patronage of the rulers Micah has already indicted. Their mechanism is exact: peace when fed, war when not. Micah, a villager and no professional, is the one who can name them.`,
          appears: [2, 3],
        },
      ],
    },
    {
      label: 'The promised figures',
      characters: [
        {
          id: 'coming-ruler',
          tag: 'Prophecy',
          name: 'The Coming Ruler',
          epithet: 'From Bethlehem Ephrathah, chapter 5',
          body: `He will stand and shepherd his flock in the strength of the LORD; they shall dwell secure; he shall be their peace. Named for the village six miles south of Jerusalem where David was born. The Christian tradition reads the prophecy through Matthew 2; in Micah's own context the prophecy is also a critique — the future does not belong to the great city but to the small village of the older line.`,
          appears: [5],
        },
        {
          id: 'voice-courtroom',
          tag: 'Answer',
          name: 'The Voice in the Courtroom',
          epithet: 'Do justice, love mercy, walk humbly',
          body: `The figure who cuts the people's escalating offer — calves, rams, rivers of oil, the firstborn — with three verbs. Not assigned in the Hebrew text; the ambiguity (prophet? LORD? third speaker?) has been part of the line's power for twenty-seven hundred years. Three verbs, three objects, the whole of what is required.`,
          appears: [6],
        },
        {
          id: 'remnant',
          tag: 'Survivor',
          name: 'The Remnant',
          epithet: 'She\'erit ya\'akov — who remains after the fall',
          body: `Not the elite — the surviving small holding, the village left after the army has passed, the lame and the cast off and the afflicted that the LORD will assemble at last. The book's closing verses name the remnant as the inheritance God still claims. Micah's doctrine of the remnant is the strongest in the Twelve, shaped by the lowland geography he has watched the Assyrians destroy.`,
          appears: [4, 5, 7],
        },
      ],
    },
  ],

  chapters: chapters,
};
