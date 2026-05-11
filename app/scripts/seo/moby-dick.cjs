// SEO content data for Herman Melville's Moby-Dick (1851).
// 136 chapters. Voice: literary, declarative present, attentive to Melville's strange register.
// Chapters loaded from merged JSON to keep this file manageable.

const chapters = require('/tmp/moby-dick-chapters-merged.json');
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

module.exports = {
  id: 'moby-dick',
  title: 'Moby-Dick',
  author: 'Herman Melville',
  byline: '1851 · American epic novel',
  titleAccent: 'a guided tour',
  hook: 'Call me Ishmael. A schoolmaster signs on to a whaling ship. The captain has one leg and one idea. Somewhere in the Pacific, in one hundred and thirty-six chapters, Melville turns a whale hunt into the strangest novel the nineteenth century produced.',
  genre: ['Novel', '19th-century American', 'Sea narrative', 'Epic'],
  themesBlurb: 'Monomania, the meaning of whiteness, friendship, the encyclopedic form, America in the Pequod.',
  castBlurb: 'The Pequod',
  castDesc: 'The crew of a Nantucket whaler on a voyage that was never really about whales.',
  castSubtitle: 'The Pequod — a crew from everywhere, bound for one end.',

  chapterLabel: n => 'Chapter ' + n,

  about: [
    `Melville writes <em>Moby-Dick</em> over eighteen months, in a farmhouse in the Berkshires, in the company of his wife and small children and, decisively, of his neighbour Nathaniel Hawthorne. He intends the book as a sixth sea adventure — quick, based on his own time aboard the whaler Acushnet in 1841-42. Halfway through, the book becomes something else. The fish acquires a name. The captain acquires a monomania the early chapters had not predicted. The Pequod's voyage begins to carry a metaphysical weight the genre cannot contain. The book that appears in November 1851 is not the one he began.`,
    `The story, when it can be reduced to story, is straightforward. Ishmael, a young Manhattan schoolmaster with what he calls a damp drizzly November in his soul, decides to ship out on a whaling voyage from Nantucket. At the Spouter-Inn in New Bedford he shares a bed with a Polynesian harpooner named Queequeg, who turns out to be one of the most decent men he has ever met. Together they sign aboard the Pequod under Captain Ahab, who nails a gold doubloon to the mast and reveals that the voyage will not be routine whaling — it will be the hunt for the white whale that took off his leg. The Pequod crosses the Atlantic, rounds the Cape, enters the Pacific. After three days of pursuit, Ahab finds the whale. The whale destroys the ship. Ishmael alone survives, clinging to a floating coffin.`,
    `What the book does inside this story is unclassifiable. Roughly half the chapters are narrative — Ishmael's voice telling what happened. A quarter are encyclopedic chapters on whales, whaling, ships, and the sea, written in registers that veer from textbook to mock-scholarly to lyric. Several chapters are dramatic in form, with stage directions and named speakers. There are sermons, soliloquies, songs. Reviews on publication were mixed and often hostile; the book sold poorly; Melville's career as a popular novelist effectively ended with it. It was rediscovered in the 1920s and has been recognized since as one of the central works of the American nineteenth century.`,
  ],

  chaptersSubtitle: 'All 136 chapters, from New Bedford to the three-day chase — the complete voyage of the Pequod.',
  chaptersLead: `<p>Moby-Dick divides naturally into four movements. The shore chapters in New Bedford and Nantucket — Ishmael, Queequeg, Father Mapple's sermon — are among the most loved in American literature. The open-ocean first hunt introduces the ship's world. The vast cetological middle accumulates the pressure the closing chase requires; Melville is not padding. The three-day chase (Chapters 133-135) and the Epilogue are what those hundred chapters of preparation are for.</p>`,

  themesByline: 'Five threads through the novel',
  themesLead: `Moby-Dick is a whale hunt that wants to be more than a whale hunt. The novel it grew out of would have been a sea adventure. Melville kept writing, and these are what he was writing about.`,

  castLead: `<p>The Pequod carries a crew from everywhere — Nantucket Quakers at the top, Polynesian, Wampanoag, and African harpooners in the boats, Manxmen, Spaniards, Maltese, Tahitians, and Long Islanders below. The ship is named after a New England Native nation the Puritans had massacred two centuries earlier. Almost everyone aboard is dead by the final page.</p>`,

  groups: [
    {
      label: 'On Shore',
      subtitle: 'New Bedford and Nantucket — Ishmael, Queequeg, Father Mapple, and the Pequod at the dock.',
      chapters: range(1, 22),
    },
    {
      label: 'The First Hunt',
      subtitle: 'The Pequod sails. Ahab appears, nails the doubloon, and reveals what the voyage is really for.',
      chapters: range(23, 50),
    },
    {
      label: 'Cetological Middle',
      subtitle: 'The encyclopedic heart of the book — whales, the fishery, whiteness, the gam chapters, and the philosophy that makes the ending possible.',
      chapters: range(51, 100),
    },
    {
      label: 'The Chase',
      subtitle: 'The Pequod closes on the white whale. Three days. One end.',
      chapters: range(101, 136),
    },
  ],

  themes: [
    {
      slug: 'monomania',
      title: 'Ahab and Monomania',
      preview: 'Captain Ahab is one of the most fully constructed monomaniacs in literary history. His leg was taken by a whale. His voyage is vengeance. His crew is the instrument. The question the novel refuses to settle is whether he has seen something true about the universe — and chosen the wrong response.',
      essay: [
        `The figure of Captain Ahab has occupied criticism for a hundred and seventy years, and the disagreement has not settled. Ahab on his previous voyage had his leg taken off below the knee by a particular sperm whale of unusual size and notorious cunning — the white whale Moby Dick. He returned home half-mad, recovered partially, and accepted command of the Pequod for what was supposed to be a normal commercial whaling voyage. From the moment he comes on deck, he reveals that the voyage will be normal in name only.`,
        `The decisive scene is Chapter 36, The Quarter-Deck, in which Ahab gathers the crew, makes them swear to the hunt, and answers his first mate Starbuck's protest that the whale is a dumb brute striking out of blindest instinct. Ahab will not have it. The whale, for him, is the visible mask of an invisible malice that pervades the universe — not just an animal but the readable sign of whatever is wrong with the cosmos. He has, he says, only one quarrel: to strike through the mask.`,
        `Reading Ahab as simply mad understates what Melville is doing. Reading him as a hero overstates it. He is a man who has correctly perceived that the universe contains something terrible, and who has incorrectly concluded that the right response is to attack it personally with the ship and crew at his disposal. His rhetoric is so good that the crew swears to it. Starbuck resists and cannot prevail. The hunt continues across the Atlantic, around the Cape, into the Pacific.`,
        `The cost of Ahab's reading of the world is, in the end, every life on board except Ishmael's. The whale destroys the Pequod and swims on. The monomania does not purchase even the satisfaction of success — it purchases a wreckage and a single floating witness, clinging to a coffin, who was never really part of Ahab's plan and survives precisely because of that.`,
      ],
      where: [
        { n: 28, label: 'Ch. 28 (Ahab appears)' },
        { n: 36, label: 'Ch. 36 (The Quarter-Deck — the swearing)' },
        { n: 41, label: 'Ch. 41 (Moby Dick — Ishmael on the obsession)' },
        { n: 132, label: 'Ch. 132 (The Symphony — Ahab\'s last moment of doubt)' },
        { n: 135, label: 'Ch. 135 (The Chase, Third Day)' },
      ],
    },
    {
      slug: 'whiteness',
      title: 'The Whale and the Question of Meaning',
      preview: 'Moby Dick the whale is one of the most difficult literary symbols ever attempted — because Melville simultaneously insists that the whale must mean something and refuses to specify what.',
      essay: [
        `Moby Dick as symbol has occupied every generation of readers since the book's rediscovery in the 1920s, and the novel resists every final reading. Ahab's reading: the whale is the mask of cosmic malice. Starbuck's: the whale is a dumb beast and to read more into it is blasphemy. Ishmael's: the whale is whiteness itself, the leviathan of Job, the thing the human imagination cannot hold. The cetological chapters' refusal to make any final claim. And the closing image — the whale destroying the Pequod and swimming on — which itself refuses interpretation.`,
        `The most famous chapter on the question, Chapter 42, On the Whiteness of the Whale, takes the colour rather than the creature as its subject. Through a sustained baroque catalogue of associations, whiteness is shown to mean almost anything: the lamb, the dove, the bride, the polar bear, the albatross, the leper, the ghost, the blank page, the void. The chapter ends not with a synthesis but with a recognition that the very indeterminacy of the colour is part of what makes Moby Dick terrifying — the whale resists final reading the way the universe does.`,
        `The demand to make the whale mean one thing is the demand at the heart of Ahab's madness. He requires the whale to mean cosmic malice so that the hunt has a target and the universe has an adversary. The novel shows what happens when a man with that demand has a ship and a crew at his disposal.`,
        `The book's ambivalence about its own central symbol is part of what makes it modern. Almost every American novelist of the twentieth century who attempted serious symbolic fiction had to reckon with Melville's lesson: that a great symbol is not a coded message awaiting decryption but a presence the imagination cannot finally exhaust.`,
      ],
      where: [
        { n: 42, label: 'Ch. 42 (The Whiteness of the Whale)' },
        { n: 99, label: 'Ch. 99 (The Doubloon — each man reads it differently)' },
        { n: 133, label: 'Ch. 133 (The Chase, First Day)' },
        { n: 135, label: 'Ch. 135 (The Chase, Third Day — the whale swims on)' },
      ],
    },
    {
      slug: 'friendship',
      title: 'Ishmael, Friendship, and Survival',
      preview: 'The narrator has almost no autobiography. What grounds him is one relationship: his friendship with Queequeg, the Polynesian harpooner he meets at the Spouter-Inn. The coffin Queequeg builds for himself, expecting to die, is what saves Ishmael at the end.',
      essay: [
        `Ishmael is one of the most unusual narrators in nineteenth-century fiction. We never learn his real name — Call me Ishmael is a self-given biblical alias. He has very little autobiography; we know almost nothing about his family or his earlier life. He is, structurally, the consciousness through which we encounter everything else, and his voice is by turns curious, lyrical, ironic, philosophical, and (in the cetology chapters) pseudo-scholarly.`,
        `What grounds the consciousness is one relationship. His friendship with Queequeg, the Polynesian harpooner from the fictional South Pacific island of Kokovoko, begins under farcical circumstances — two strangers assigned to share a bed at the Spouter-Inn in New Bedford — and becomes the moral counterweight to Ahab's solipsism. Queequeg is generous, brave, religiously serious in ways the supposedly Christian crew is not, and unflinching in the face of his own near-death.`,
        `When Queequeg falls ill in the middle Pacific and believes himself dying, he commissions a coffin from the ship's carpenter, lies in it to test it, and then unaccountably recovers. Later, when the ship's original life-buoy is lost, the carpenter seals and converts the coffin into a replacement. This is the object Ishmael clings to in the Epilogue, after the Pequod sinks and every other man has drowned.`,
        `Queequeg's last gift to his friend is the means of his survival — given without intending it, in a preparation for his own death that turned out to be preparation for Ishmael's life. The friendship is the novel's quiet argument: that whatever survives a confrontation with the kind of universe Ahab has glimpsed, what survives it is not the heroic individual who meets it head-on but the friend who, by ordinary kindness, has prepared — without intending to — the means by which somebody can live.`,
      ],
      where: [
        { n: 3, label: 'Ch. 3 (Ishmael and Queequeg share a bed)' },
        { n: 10, label: 'Ch. 10 (A Bosom Friend — friendship sealed)' },
        { n: 110, label: 'Ch. 110 (Queequeg in his coffin)' },
        { n: 126, label: 'Ch. 126 (The Life-Buoy — coffin converted)' },
      ],
    },
    {
      slug: 'encyclopedic',
      title: 'The Whale Fishery and the Encyclopedic Form',
      preview: 'Roughly a quarter of the novel is not narrative at all — it is cetology, anatomy, the history of the fishery, the philosophy of whiteness. These chapters drive some readers away and bring others back year after year.',
      essay: [
        `Roughly a quarter of Moby-Dick consists of chapters that are not narrative. They are about whales — about cetology, the species and their classification; about the anatomy of the sperm whale; about the methods of the fishery; about the equipment of a whaling ship; about the history of whaling literature. These chapters drive some readers away and bring others back to the book year after year.`,
        `Melville's purpose is multiple. He is genuinely interested in whales and whaling, and he wants the reader to be. He is constructing the reality of the world the Pequod moves through, so that when the white whale finally appears the reader has been trained to see him with a whaler's eyes. He is also setting up the metaphysical confrontation: by giving the reader chapter after chapter of the whale as natural-historical object — measurable, classifiable, killable by harpoon — he prepares the irony of the closing chapters in which all of that empirical knowledge turns out to be useless against the actual creature.`,
        `The encyclopedic form has an American future. It runs from Moby-Dick through Henry Adams's Education to Pynchon, DeLillo, and Wallace. The great American novel that wants to think about a single subject by absorbing every available kind of knowledge about it owes Melville more than any of the others.`,
        `The cetology chapters are the engine of that tradition. Read them. They are not filler. They are the slow accumulation of pressure that the three-day chase requires.`,
      ],
      where: [
        { n: 32, label: 'Ch. 32 (Cetology — the taxonomy of whales)' },
        { n: 55, label: 'Ch. 55 (Monstrous Pictures of Whales)' },
        { n: 74, label: 'Ch. 74 (The Sperm Whale\'s Head)' },
        { n: 87, label: 'Ch. 87 (The Grand Armada)' },
      ],
    },
    {
      slug: 'america',
      title: 'America in the Pequod',
      preview: 'Melville is careful to make the Pequod\'s crew an image of the country he is writing in. The ship is named after a Native nation the Puritans had massacred. The crew is from everywhere. The closing image — an American flag flying as the topmast goes under — has been read by every generation since as a prophecy.',
      essay: [
        `Melville is careful to make the Pequod's crew an image of the country he is writing in. Ahab is from Nantucket, an old New England Quaker whaling family. Starbuck the first mate is also Nantucket Quaker. The three harpooners are Queequeg the Polynesian, Tashtego the Wampanoag from Gay Head on Martha's Vineyard, and Daggoo the African. The crew below them is from everywhere — Manxmen, Spaniards, Maltese, Chinese, Lascars, Tahitians, Long Islanders.`,
        `The Pequod is named after a New England Native nation that the Puritans had massacred two centuries earlier. The ship is, in other words, an American crew on a vessel named for a destroyed people, captained by a man who has nailed a Spanish doubloon — a colonial-era coin from another empire — to the mast as the prize of a hunt he has converted to private vengeance. The polity is recognizable.`,
        `Melville is writing in 1850-51, ten years before the Civil War, in a country whose entire prosperity depended on enslaved labour in the South and whose expansion was driven by the destruction of the peoples of the West. He does not write a polemic; the political reading of the Pequod is allegorical and quiet. But the closing image — the entire crew dragged down with the ship by the obsession of one man, an American flag still flying as the topmast goes under — has been read by every generation of American critics as a prophecy of what national monomania, untempered by Starbuck's voice of restraint, can do to a polity.`,
        `The whale destroys the ship. Nothing remains except, by accident, a single witness clinging to the coffin a friend made before he died.`,
      ],
      where: [
        { n: 16, label: 'Ch. 16 (The Ship — the Pequod described)' },
        { n: 26, label: 'Ch. 26 (Knights and Squires — the crew catalogued)' },
        { n: 89, label: 'Ch. 89 (Fast-Fish and Loose-Fish — the political allegory)' },
        { n: 135, label: 'Ch. 135 (The Chase, Third Day — the flag goes under)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Ishmael',
      role: 'Narrator',
      body: `The narrator who gives the reader his self-chosen alias and almost nothing of his autobiography. A Manhattan schoolmaster who ships out as a green hand when the world ashore has begun to weigh on him. His voice — curious, lyrical, ironic, philosophical, mock-scholarly — is one of the great inventions of nineteenth-century American prose. The only survivor of the Pequod.`,
    },
    {
      name: 'Captain Ahab',
      role: 'Master of the Pequod',
      body: `The monomaniac. Nantucket Quaker, long-time whaling captain, crippled by Moby Dick on a previous voyage. Has the natural authority of a master mariner and the rhetorical force of a man who has spent years rehearsing how to present his obsession to a sceptical crew. The question of whether he is a hero who strikes at something true, or a madman who has misread an animal as a metaphysical adversary, is the question the book refuses to settle.`,
    },
    {
      name: 'Queequeg',
      role: 'Harpooner',
      body: `Polynesian harpooner from the fictional island of Kokovoko, prince in his own country, tattooed from head to foot. The most decent and morally serious figure on the Pequod. His friendship with Ishmael grounds the novel. The coffin he commissions when he thinks he is dying — later converted into a life-buoy — is what saves Ishmael at the end.`,
    },
    {
      name: 'Starbuck',
      role: 'First Mate',
      body: `Nantucket Quaker, the moral conscience of the ship. The only crew member who tells Ahab to his face that the hunt is wrong. Stands outside Ahab's cabin near the end with a loaded musket and cannot pull the trigger. His failure is not cowardice; it is the failure of legitimate authority to override charismatic monomania within an institutional structure designed to obey the captain.`,
    },
    {
      name: 'Moby Dick',
      role: 'The White Whale',
      body: `The white sperm whale who took Ahab's leg. Appears in person only in the final three chapters. What he means — whether he is an animal invested with accidental significance, the mask of cosmic malice as Ahab insists, or the blank screen onto which every character projects his own metaphysics — is the question the novel refuses to settle. He survives. He swims on.`,
    },
  ],

  cast: [
    {
      name: 'Ishmael',
      role: 'NARRATOR',
      body: `The narrator who begins the book by giving the reader his self-chosen alias and almost nothing else of his autobiography. A young schoolmaster from Manhattan, possibly with some literary aspiration, who decides to ship out as a green hand on a whaling voyage when the world ashore has begun to weigh on him. Bedfellow at the Spouter-Inn, then friend, of Queequeg. Crew member of the Pequod. The only survivor of her destruction. His voice is the medium through which the entire novel is told, and the voice itself is one of the great inventions of nineteenth-century American prose — by turns curious, lyrical, ironic, philosophical, mock-scholarly, frightened, and oddly tender.`,
    },
    {
      name: 'Captain Ahab',
      role: 'MASTER OF THE PEQUOD',
      body: `The captain of the Pequod, Nantucket Quaker, monomaniac, the most fully constructed obsessive in American literature. On a previous voyage he was attacked by the white whale Moby Dick, who took off his leg below the knee. Ahab returned to land on a half-deranged convalescence, eventually accepted command of the Pequod for what is officially a routine commercial voyage, and from the moment of departure has been preparing to convert the entire enterprise into the instrument of his vengeance. He has the natural authority of a long-time master and the rhetorical force of a man who has thought for years about how to present his obsession to a sceptical crew.`,
    },
    {
      name: 'Queequeg',
      role: 'HARPOONER',
      body: `Polynesian harpooner from the fictional South Pacific island of Kokovoko, prince in his own country, tattooed from head to foot, the most decent and morally serious member of the Pequod's crew. Meets Ishmael by being assigned to share his bed at the Spouter-Inn in New Bedford on a freezing December night. The two of them become friends almost immediately, sign on together to the Pequod, and remain inseparable through the voyage. When he believes he is dying of fever in the middle Pacific, he commissions a coffin from the ship's carpenter and lies in it to test it; he then unaccountably recovers, and the coffin is later sealed and turned into a life-buoy. The coffin is what saves Ishmael at the end.`,
    },
    {
      name: 'Starbuck',
      role: 'FIRST MATE',
      body: `Nantucket Quaker, first mate of the Pequod, the moral conscience of the ship. The only member of the crew who openly tells Ahab to his face that the hunt for Moby Dick is wrong. In one of the most agonising chapters near the end, Starbuck stands outside Ahab's cabin with a loaded musket and considers shooting the captain to save the crew; he cannot do it. The next day the chase begins and the ship is destroyed. His failure is not cowardice — it is the failure of legitimate authority to override charismatic monomania within an institutional structure designed to obey the captain.`,
    },
    {
      name: 'Pip',
      role: 'CABIN BOY',
      body: `African-American cabin boy on the Pequod, a small nervous lighthearted boy at the start of the voyage who falls overboard during a whale hunt, is left alone in the open Pacific while the boat continues the chase, and is recovered hours later mentally broken. After the incident Pip speaks in scattered fragments and prophecies, and Ahab — the only person on the ship who recognizes a depth in Pip's altered state — adopts him as his constant companion in the closing chapters. The relationship is one of the strangest in American literature, and Melville treats it with a tenderness that surprises every reader who arrives at it.`,
    },
    {
      name: 'Moby Dick',
      role: 'THE WHITE WHALE',
      body: `The white sperm whale of unusual size and unusual cunning who has, before the novel begins, taken off Ahab's leg. Described in fragments scattered through the book as immensely large, marked by a wrinkled brow and a deformed lower jaw, white over much of his body, and possessed of an apparent intelligence that has allowed him to survive previous encounters with whaling ships. He appears in person only in the final three chapters, and when he does, the encounter destroys the Pequod and every man aboard but one. What he means in the novel is the question the book refuses to settle. He survives the encounter and swims on.`,
    },
  ],

  castGroups: [
    {
      label: 'The officers',
      characters: [
        { id: 'ahab', tag: 'Mortal', name: 'Captain Ahab', epithet: 'Master of the Pequod', body: `The monomaniac. His monomania — revenge on the white whale who took his leg — converts the entire apparatus of a whaling ship into a personal weapon. Nantucket Quaker, long-experienced master. Has a scar running down one side of his face that may go from crown to sole. Has a leg of carved whalebone. Dies in the three-day chase when the line of his own harpoon catches him round the neck.`, appears: [28, 36, 37, 41, 100, 119, 132, 133, 134, 135] },
        { id: 'starbuck', tag: 'Mortal', name: 'Starbuck', epithet: 'First Mate', body: `The moral voice. A man of courage in his own line of business — "no fearless fool" — but unable to override Ahab's authority. In Chapter 132, The Symphony, Ahab has his most human conversation of the voyage with Starbuck, almost relenting. He does not. The following morning the chase begins.`, appears: [26, 36, 38, 100, 119, 123, 132, 135] },
        { id: 'stubb', tag: 'Mortal', name: 'Stubb', epithet: 'Second Mate', body: `Cape Cod man, second mate, the novel's easy-going foil to Starbuck's gravity and Ahab's obsession. Smokes a pipe constantly; kills whales professionally and without philosophical trouble. His whale-steak supper in Chapter 64, cooked at midnight while the crew processes the whale alongside the ship, is one of the novel's great comic sequences.`, appears: [26, 64, 65, 81, 100] },
        { id: 'flask', tag: 'Mortal', name: 'Flask', epithet: 'Third Mate', body: `Martha's Vineyard man, third mate. The most literal of the three officers — to Flask, a whale is a fat chance for oil and a bonus, nothing more, nothing metaphysical. He rides on Daggoo's shoulders during hunts so he can see over the waves. He dies with the ship.`, appears: [26, 27, 100] },
      ],
    },
    {
      label: 'The harpooners',
      characters: [
        { id: 'queequeg', tag: 'Mortal', name: 'Queequeg', epithet: 'Polynesian harpooner', body: `Prince of Kokovoko, harpooner to Starbuck's boat. Tattooed from head to foot with a pattern that Ishmael reads as a kind of cosmological treatise. Religiously serious in private, in ways Melville treats with a respect almost no non-Christian received in nineteenth-century American fiction. His coffin saves Ishmael.`, appears: [3, 4, 10, 13, 18, 72, 78, 110, 126] },
        { id: 'tashtego', tag: 'Mortal', name: 'Tashtego', epithet: 'Wampanoag harpooner', body: `Wampanoag Indian from Gay Head on Martha's Vineyard, harpooner to Stubb's boat. In the closing paragraph of the novel, Tashtego is still nailing the Pequod's flag to the mainmast as the ship sinks under him — a hawk caught by the hammer he is swinging, dragged down with the mast.`, appears: [26, 78, 135] },
        { id: 'daggoo', tag: 'Mortal', name: 'Daggoo', epithet: 'African harpooner', body: `Enormous African harpooner, Flask's boat. Flask stands on his shoulders to see over the waves during whale hunts — a detail Melville describes without comment. Daggoo has been at sea since boyhood; he has no land-address anywhere.`, appears: [26, 48] },
      ],
    },
    {
      label: 'Ishmael and the whale',
      characters: [
        { id: 'ishmael', tag: 'Mortal', name: 'Ishmael', epithet: 'Narrator, green hand', body: `The narrator. Gives the reader his alias on the first line. Ships as a green hand — the lowest rank, for no wages, only a lay (a fraction of the voyage's oil profits). His voice shifts register throughout the book, from lyrical to mock-scholarly to frightened, and this instability is part of Melville's point about who we trust to tell us things.`, appears: range(1, 136) },
        { id: 'moby-dick', tag: 'God', tagClass: 'creature', name: 'Moby Dick', epithet: 'The white whale', body: `The white sperm whale. Appears in person only in Chapters 133-135. Before that he is rumour, legend, reported sightings, and the subject of Ishmael's long meditation in Chapter 41. The novel refuses to say what he means. He swims away from the wreckage of the Pequod at the end.`, appears: [41, 42, 133, 134, 135] },
      ],
    },
    {
      label: 'Minor figures',
      characters: [
        { id: 'pip', tag: 'Mortal', name: 'Pip', epithet: 'Cabin boy', body: `The cabin boy who falls overboard and is left alone in the open Pacific while the boat pursues a whale. Recovered but broken. Speaks in fragments after. Ahab adopts him as a companion in the closing chapters, and the relationship is the novel's most tender.`, appears: [93, 99, 125, 127, 129] },
        { id: 'fedallah', tag: 'God', tagClass: 'creature', name: 'Fedallah', epithet: 'Ahab\'s secret harpooneer', body: `The Parsee (Persian Zoroastrian) harpooner whom Ahab has smuggled aboard the Pequod as part of his own private boat crew, concealed until the first lowering. Prophesies to Ahab that he will die in ways that seem impossible — and that turn out, in the closing chase, to be exactly what happens.`, appears: [48, 50, 117, 134, 135] },
        { id: 'bulkington', tag: 'Mortal', name: 'Bulkington', epithet: 'Sailor', body: `Introduced in Chapter 3 as a large, deep-browed sailor who has just returned from a four-year voyage and signs onto the Pequod the following day. Given a farewell elegy in Chapter 23 and then never mentioned again. Melville seems to have had plans for him and changed them.`, appears: [3, 23] },
      ],
    },
  ],

  chapters,
};
