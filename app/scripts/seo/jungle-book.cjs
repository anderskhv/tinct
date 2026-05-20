// The Jungle Book — SEO page data for build-seo-pages.cjs
// Rudyard Kipling, 1894. Seven stories; three follow Mowgli, four are self-contained.
// Voice: declarative, factually exact, no AI-isms.

module.exports = {
  id: 'jungle-book',
  title: 'The Jungle Book',
  author: 'Rudyard Kipling',
  byline: '1894 · Seven stories from British India',
  titleAccent: 'a guided tour',
  hook: 'A human infant crawls into a wolf den. The wolves keep him. For fifteen years the jungle is his home — and then the jungle, and the village, both refuse him. The Jungle Book is the founding version of the question every coming-of-age story since has borrowed.',
  genre: ['Adventure', 'Fable', 'Victorian literature'],
  themesBlurb: 'The Law of the Jungle, belonging and exile, power and loyalty, creatures discovering their nature.',
  castBlurb: 'The Seeonee Hills',
  castDesc: 'The wolf pack, the teachers, and the enemies of a human child raised wild.',
  chapterLabel: n => `Story ${n}`,

  about: [
    `<em>The Jungle Book</em> is seven stories set in the jungles of India, each governed by a single principle: that the world runs on Law. The most famous three follow Mowgli, a human child raised from infancy by wolves, taught to hunt and speak by Baloo the bear and Bagheera the black panther, and eventually forced to choose between the wolf pack that is his family and the human village that is his origin. The other four stories are complete in themselves: Rikki-Tikki-Tavi the mongoose versus a pair of cobras, the White Seal who leads his people to safety, Toomai the boy who witnesses what no human has seen, and the animals of Her Majesty's service comparing their burdens before a battle. Every story is about a creature learning the rules of the world it was born into — and whether those rules can hold when the creature does not fit the category the rules were written for.`,
    `Kipling published the stories in magazines in 1893 and collected them in 1894. The jungle world runs on the Law — a set of rules older than memory, governing every creature's behavior, enforced by the strong and respected by the wise. Mowgli's peculiar position is that he is the only creature who does not fully belong anywhere: too human for the jungle, too feral for the village, too intelligent for either. The stories that follow him from infancy to young manhood are about that displacement. When he drives the wolf pack with fire at the end of the first story, he uses something the Law was not written to account for. The Law cannot stop him. It also cannot contain him.`,
    `Each story opens with an epigraph in verse — the Night-Song in the Jungle, the Law of the Jungle itself — and the verse and prose registers are doing different things. The prose is precise, sensory, and occasionally comic. The verse is ceremonial, closer to incantation than narrative. Reading Kipling for the prose alone misses half the book. The combination is unusual in English literature and unique in the tradition the book founded. The non-Mowgli stories are the book's argument in its simplest form: each creature discovering what it is made for, tested, and proved. Kotick the white seal cannot accept the annual slaughter as normal and searches for years for an alternative. Rikki-Tikki-Tavi is a mongoose; his nature is to kill snakes; the story is about that nature being proved. Kipling is not recommending fatalism. He is recommending the self-knowledge that comes from taking seriously what you are actually drawn to.`,
  ],

  chaptersSubtitle: 'All 7 stories — from Mowgli\'s first night in the wolf den to the final parade of Her Majesty\'s animals.',
  chaptersLead: `<p>The Jungle Book has two structures working at once. The first is Mowgli's arc across stories one, two, and three: infancy in the wolf pack, capture by the Bandar-log, and the killing of Shere Khan. The second is a set of four independent fables, each complete in one sitting, each a version of the book's deepest question — what does it mean to know your nature fully and act from it? Seven stories total, and the best approach is to read them in order: the Mowgli cycle first, then the four that follow.</p>`,

  themesByline: 'Four threads through the seven stories',
  themesLead: `The Jungle Book is not a collection of animal adventures. It is a sustained argument about Law — what it is, why it matters, and what happens at the edges where the rules don't quite fit the creature they were written for.`,

  groups: [
    { label: 'The Mowgli Cycle', subtitle: 'Infancy, captivity, and the killing of Shere Khan.', chapters: [1, 2, 3] },
    { label: 'The Four Fables', subtitle: 'The mongoose, the seal, the elephant-boy, and the animals of the army.', chapters: [4, 5, 6, 7] },
  ],

  themes: [
    {
      slug: 'the-law',
      title: 'The Law of the Jungle',
      greek: 'older than memory, enforced by the strong',
      preview: 'In popular use, "law of the jungle" means chaos — the strong doing whatever they like. In Kipling\'s book it means the opposite. The Law is an ancient, intricate code governing every creature\'s behavior, closer to a constitution than to anarchy.',
      essay: [
        `The Law of the Jungle is the book's most misunderstood element. In popular use, "law of the jungle" means chaos — the strong doing whatever they want to the weak. In Kipling's book, it means the opposite. The Law is an ancient, intricate code governing every creature's behavior: when a wolf may hunt alone and when it must join the pack, how a stronger animal must treat a weaker one that submits, what rights a mother has over her cubs, what kills are forbidden and why. It is closer to a constitution than to anarchy.`,
        `Kipling's jungle is not savage in the sense of lawless. It is savage in the sense of serious. The consequences for breaking the Law are real — exile, death, social destruction — and the Law is enforced not by a single ruler but by collective memory and the pressure of the pack. Akela, the head wolf, does not make the Law; he embodies it. When he misses a hunt, he loses his authority not because someone overthrows him but because the Law specifies what authority requires.`,
        `Mowgli's position is illuminating because he knows the Law better than most of the animals who were born into it. Baloo teaches it to him as a language student learns grammar — systematically, until the rules are internalized. The Master Words that open every creature's submission are part of the Law. But Mowgli is human, which means he can make fire — the Red Flower — and fire is power the Law was not written to account for. When he drives the pack with fire at the end of the first story, he is using something outside the Law's categories. The Law cannot stop him. It also cannot contain him.`,
        `The question the Law raises is one every institution eventually faces: what do you do with the person who knows your rules better than your founding members, but was not there at the founding? The jungle's answer is to exile Mowgli. Whether that answer is right is what the book leaves for the reader to decide.`,
      ],
      where: [
        { n: 1, label: 'Story 1 (the Council Rock — Mowgli accepted and expelled)' },
        { n: 2, label: 'Story 2 (the Bandar-log have no Law)' },
        { n: 3, label: 'Story 3 (the killing of Shere Khan — Law fulfilled)' },
      ],
    },
    {
      slug: 'belonging',
      title: 'Belonging and exile',
      greek: 'too human for the jungle, too wild for the village',
      preview: 'Mowgli is refused by the wolves, feared by the village, and accepted by neither. His story is not about finding home — it is about learning to move without one. That is a harder lesson than survival.',
      essay: [
        `Mowgli's displacement is the book's central subject and its hardest argument. He is a human child raised by wolves, taught by a bear and a panther, able to speak every jungle tongue, able to stare a snake into stillness — because he is human, and humans have that gift. His problem is that the gift marks him as different from both worlds he inhabits.`,
        `The wolf pack that raised him eventually turns against him — not because they hate him but because Shere Khan's hatred has poisoned the young wolves, and because Mowgli's presence unsettles the order they know. The village that should be his home fears him — the boy who walks without fear among animals, who speaks to wolves, who brings a tiger's skin to the village gate. Neither world can absorb him.`,
        `What the book refuses to do is make this ending sentimental. Mowgli does not find a third world that fits. He learns to move between worlds without belonging to either, which is a harder and more honest conclusion than most of the stories the book founded. Tarzan finds Greystoke Manor. Mowgli finds the road. The non-Mowgli stories are almost cheerful by comparison: each creature is exactly what it is, knows it, and acts accordingly. Kotick finds the safe beach. Rikki-Tikki-Tavi kills the snakes. The contrast with Mowgli is deliberate. Knowing your nature is easier when your nature is not split between two worlds.`,
        `The exile that matters most in the book is Mowgli's second exile — from the wolf pack — which happens in story three, after the killing of Shere Khan. He has done what the pack needed done. He has fulfilled the Law. And then he goes. Not because anyone drives him out this time, but because the pack and the village have both refused him, and there is nowhere left to be claimed. That departure is the book's true ending, and it is more painful than any of the fights that preceded it.`,
      ],
      where: [
        { n: 1, label: 'Story 1 (first exile — the Council Rock)' },
        { n: 3, label: 'Story 3 (second exile — after Shere Khan dies)' },
        { n: 4, label: 'Story 4 (Kotick\'s search — belonging through searching)' },
      ],
    },
    {
      slug: 'power-loyalty',
      title: 'Power and loyalty',
      greek: 'who you owe your life to when the ones who raised you are different creatures',
      preview: 'Shere Khan the tiger wants Mowgli dead from the beginning. Baloo and Bagheera protect him. The book keeps asking who you owe your loyalty to when the ones who raised you and the ones who made you are different creatures.',
      essay: [
        `The triangle of Baloo, Bagheera, and Shere Khan is the structural spine of the Mowgli stories. Baloo teaches Mowgli the Law — systematically, patiently, with the authority of a creature who has watched many generations of cubs and knows which ones will last. Bagheera bought Mowgli's life from the pack with a freshly killed bull the night he was accepted, and has never forgotten what a cage is. Shere Khan has wanted Mowgli dead since the night he failed to kill him as an infant, and his hatred has only grown.`,
        `The question the book keeps asking is what Mowgli owes each of them. To Baloo he owes the Law, which is to say his understanding of the world. To Bagheera he owes his life — literally, the price paid at the Council Rock. To Shere Khan he owes nothing, except the termination of a threat that has organized itself around him since infancy. But the book is more complex than debts and payments: Akela, the leader of the pack, whose fate and Mowgli's are tied from the beginning, is the figure whose loyalty is most purely structural. He presided over the night Mowgli was accepted; his authority and Mowgli's safety have been linked ever since.`,
        `Power in the book is not simply physical. Bagheera is stronger than most animals Mowgli meets and uses that strength carefully and rarely. Baloo's claws are slow but his knowledge is total. Kaa the python is the most physically formidable creature in the jungle and is summoned by Baloo and Bagheera as an ally rather than a threat — his power put in service of a rescue. What the book proposes is that the creatures who use their power in service of something larger than themselves — the Law, the pack, the creature they have pledged to protect — are the ones whose power means something.`,
        `Shere Khan is the negative case. His power is real and he uses it in service of nothing but his own appetite and wounded pride. He hunts men because hunting men is easier than hunting deer, and the lameness that makes it easier has made him angry in the way of a creature who blames others for what he cannot change. His quarrel with Mowgli is not personal at first; it becomes personal. And it ends, as quarrels based on wounded pride always end in Kipling, badly — not for the tiger's enemies, but for the tiger.`,
      ],
      where: [
        { n: 1, label: 'Story 1 (the bull paid for Mowgli\'s life — Bagheera\'s loyalty)' },
        { n: 2, label: 'Story 2 (Kaa rescues — power in service of the pack)' },
        { n: 3, label: 'Story 3 (Shere Khan killed — power without principle ends)' },
      ],
    },
    {
      slug: 'nature-mastery',
      title: 'Nature and mastery',
      greek: '"Run and find out" — the mongoose\'s motto',
      preview: 'The four non-Mowgli stories each follow a single creature discovering what it is made for. Kipling\'s argument is that knowing your nature is the beginning of mastery — and that mastery, fully achieved, is its own justification.',
      essay: [
        `The four non-Mowgli stories are the book's argument in its simplest form. Each follows one creature discovering what it is made for, tested against circumstances that require it to be exactly that thing, and proved. Rikki-Tikki-Tavi is a mongoose; his nature is to be curious and to kill snakes; the story is about those two qualities being tested by Nag and Nagaina and found sufficient. Kotick is a white seal who cannot accept the annual slaughter as normal and searches for years for the alternative, because his nature will not permit him to acquiesce. Toomai is a boy who loves elephants more than anything else; his reward is to see what no human has seen. The animals of the Viceregal Camp compare their burdens and conclude that each is suited to exactly the work it does.`,
        `Kipling is not recommending fatalism or determinism. He is recommending the kind of self-knowledge that comes from taking seriously what you are actually drawn to, rather than what you think you should be. The Bandar-log are pitiful precisely because they have no nature — no consistent character, no law they hold to, no memory. Shere Khan is dangerous not because he is powerful but because his power has no principle behind it. Baloo is formidable because he has been exactly what he is for so long that he has become very good at it.`,
        `The mongoose story is the clearest case. Rikki-Tikki-Tavi arrives in the garden by accident — washed out of his burrow by a flood, adopted by a British family. The garden has two king cobras in it who regard it as theirs by right of prior occupancy. Rikki's first day is spent exploring; his second day is spent killing. The story is not a moral fable about courage overcoming fear; it is a precise account of what happens when a creature with exactly the right nature encounters exactly the right problem. The resolution is not in doubt after the first paragraph. What Kipling is interested in is the mechanism — how the mongoose moves, what he knows, why the cobra cannot win.`,
        `The white seal's story is more complex because Kotick's nature is not simply to kill or to survive but to refuse. He watches his people slaughtered every year on the killing beaches of St. Paul's Island and cannot make himself accept it as natural. He spends years looking for a safe beach before finding it — not through supernatural intervention but through his own willingness to keep searching after every other seal has stopped. The story is about what nature looks like when it includes a conscience. The resolution is not that the world is good; it is that the search was worth making.`,
      ],
      where: [
        { n: 4, label: 'Story 4 (Kotick — the seal who refuses)' },
        { n: 5, label: 'Story 5 (Rikki-Tikki-Tavi — nature perfectly matched to task)' },
        { n: 6, label: 'Story 6 (Toomai — love of elephants rewarded)' },
        { n: 7, label: 'Story 7 (Her Majesty\'s Servants — each creature in its place)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Mowgli', role: 'The Man-Cub', body: `A human child who crawled into a wolf's den as an infant after Shere Khan killed his parents. Raised by Father Wolf and Mother Wolf, taught the Law by Baloo and strategy by Bagheera. He can speak every jungle tongue and is the only creature who can stare a snake into stillness — because he is human, and humans have that gift. His problem is that the gift marks him as different from both worlds he inhabits, and the jungle and the village eventually force him to choose.` },
    { name: 'Baloo', role: 'Teacher of the Law', body: `The old brown bear who teaches the wolf cubs the Law of the Jungle. He takes a particular interest in Mowgli and spends years drumming the Master Words into him. Affectionate in the way of a creature who has watched many generations of cubs grow up and knows which ones will last. His claws are slow, but his knowledge is total.` },
    { name: 'Bagheera', role: 'The Black Panther', body: `The black panther who bought Mowgli's life from the wolf pack with a freshly killed bull. Born in captivity in the King's palace at Oodeypore and has never forgotten what a cage is. The most intelligent adult in Mowgli's world — the one who tells Mowgli unpleasant truths, warns him about Shere Khan, and eventually shepherds him toward the human village. He loves Mowgli with the particular tenderness of a creature who knows what it is to not belong.` },
    { name: 'Shere Khan', role: 'The Lame Tiger', body: `The tiger who tried to kill Mowgli as an infant and has wanted him dead for fifteen years. Lame from birth — the cattle villages have named the deformity — and the lameness makes him angry in the way of a creature who blames others for what he cannot change about himself. He hunts men because hunting men is easier than hunting deer. His quarrel with Mowgli is not personal at first; it becomes personal.` },
    { name: 'Akela', role: 'The Lone Wolf', body: `The leader of the Seeonee pack, old and dignified, who presided over the night Mowgli was accepted. His authority rests entirely on demonstrated ability — he has led every hunt for years without a miss — and when he finally misses a kill, the pack is waiting for it. His fate and Mowgli's are tied from the beginning.` },
    { name: 'Rikki-Tikki-Tavi', role: 'The Mongoose', body: `A young mongoose washed out of his burrow by a flood and adopted by a British family in their garden bungalow. Curious in the way all mongooses are curious — the motto of the family is "run and find out" — and curiosity combined with a mongoose's reflexes makes him a lethal opponent. His opponents are Nag and Nagaina, the two king cobras who regard the garden as theirs by right. The story is a complete unit: a creature discovering what it is made for and proving it.` },
  ],

  castSubtitle: 'The Seeonee Hills — the wolf pack, the teachers, and the enemies of a child raised wild.',
  castLead: `<p>The Jungle Book has two casts: the Mowgli stories and the four standalone tales. In the Mowgli stories, every major figure is defined by their relationship to the Law and to the man-cub who has mastered it without belonging to it. In the standalone stories, the cast narrows to one or two creatures per story — the argument is made with minimal cast, maximum pressure.</p>`,
  castGroups: [
    {
      label: 'The Mowgli stories',
      characters: [
        { id: 'mowgli', tag: 'Man-Cub', name: 'Mowgli', epithet: 'The man-cub', body: `A human child raised by wolves from infancy. Can speak every jungle tongue, run as well as any wolf, stare a snake into stillness. Knows the Law better than most animals born to it. The only creature who does not fully belong to either world that claims him. Expelled from the wolf pack, feared by the village, eventually cast between both. His story ends not with homecoming but with departure.`, appears: [1, 2, 3] },
        { id: 'baloo', tag: 'Teacher', name: 'Baloo', epithet: 'The sleepy brown bear', body: `The old bear who teaches the wolf cubs the Law. Takes Mowgli on as a special student and spends years drilling the Master Words into him. Affectionate, enormous, slow in his claws but total in his knowledge. The one adult who educates rather than simply protects. Mowgli disobeys him in story two and pays for it.`, appears: [1, 2, 3] },
        { id: 'bagheera', tag: 'Panther', name: 'Bagheera', epithet: 'The black panther', body: `Born in captivity at the King's palace. Paid for Mowgli's acceptance into the pack with a freshly killed bull. Tells Mowgli the unpleasant truths about his situation that Baloo softens. The most strategically intelligent creature in Mowgli's world. His love for Mowgli is the love of a creature who knows what it is to be between worlds.`, appears: [1, 2, 3] },
        { id: 'shere-khan', tag: 'Tiger', name: 'Shere Khan', epithet: 'The lame tiger, Mowgli\'s enemy', body: `The tiger who killed Mowgli's parents and has wanted the man-cub dead since infancy. Lame from birth. Hunts men because men are easier to catch than deer, and the lameness makes anger a permanent condition. His quarrel with Mowgli begins as territorial and becomes personal. Killed in story three by Mowgli, Akela, and the wolves, driven into a dry ravine.`, appears: [1, 2, 3] },
        { id: 'akela', tag: 'Wolf', name: 'Akela', epithet: 'The Lone Wolf, pack leader', body: `Leader of the Seeonee pack. His authority depends on demonstrated ability. Presided over the night Mowgli was accepted. Fate linked to Mowgli's from the beginning — when Akela misses a hunt, the pack is ready to depose him, and Shere Khan uses the moment to push for Mowgli's expulsion. Old and grey by story three; his death and Shere Khan's happen in the same sequence.`, appears: [1, 2, 3] },
        { id: 'kaa', tag: 'Python', name: 'Kaa', epithet: 'The great python', body: `The rock python, the most physically formidable creature in the jungle. Summoned by Baloo and Bagheera to help rescue Mowgli from the Bandar-log in story two. Ancient, unhurried, precise. His dance hypnotizes every creature — every creature except Mowgli, who is human and immune. An ally rather than a threat, but an ally who must be approached with extreme care.`, appears: [2] },
      ],
    },
    {
      label: 'The four standalone fables',
      characters: [
        { id: 'rikki-tikki', tag: 'Mongoose', name: 'Rikki-Tikki-Tavi', epithet: 'The mongoose of the garden', body: `A young mongoose washed out of his burrow by a flood and adopted by a British family. Curious to the point of recklessness; the mongoose family motto is "run and find out." His opponents are Nag and Nagaina, two king cobras. The story is about what happens when a creature's nature is perfectly matched to the problem in front of it. He wins because he is what he is.`, appears: [5] },
        { id: 'kotick', tag: 'Seal', name: 'Kotick', epithet: 'The White Seal', body: `A white Pacific fur seal who cannot accept the annual slaughter on the killing beaches as normal. He spends years searching for a safe beach before finding it. His whiteness marks him as unusual from birth; his conscience marks him as unusual in character. The story is about what nature looks like when it includes a refusal to acquiesce — and what that refusal costs before it succeeds.`, appears: [4] },
        { id: 'toomai', tag: 'Boy', name: 'Little Toomai', epithet: 'The elephant-boy', body: `A ten-year-old boy, son of a mahout, who loves elephants more than anything else and is the only human ever to witness the elephants' secret dance in the forest. His reward is not material but witnessing — the thing no human has seen, granted to the one human who cared enough about elephants to earn their trust completely.`, appears: [6] },
      ],
    },
  ],

  chapters: [
    {
      n: 1,
      title: "Mowgli's Brothers",
      tourTitle: "Mowgli's Brothers",
      hook: 'An infant crawls out of the darkness into a wolf den. The tiger follows. The wolves must choose.',
      tour: `The Seeonee Hills on a warm evening. Father Wolf is woken from his rest by Tabaqui the jackal, who brings Shere Khan's warning: the tiger is hunting men tonight. The infant Mowgli crawls out of the darkness into the wolf den, following the warmth, just as Shere Khan arrives at the entrance to demand his prey. Father Wolf refuses him. Mother Wolf — fiercer than Father Wolf in this moment — names the child Mowgli, "the Frog," and keeps him. The wolves take Mowgli to the Council Rock, where Baloo the bear and Bagheera the black panther speak for him; Bagheera pays a freshly killed bull as the price. Mowgli grows up in the pack, learning the Law and the jungle's languages, until Shere Khan's scheming turns the young wolves against the man-cub. At the Council Rock, Akela misses a hunt and the pack closes in. Mowgli brings the Red Flower — fire — from the village and drives them back. He burns Shere Khan's flank, weeps because he is leaving, and walks down to the human village alone.`,
      blurb: `A human infant crawls into a wolf den on a night Shere Khan is hunting. The wolves keep him, Bagheera pays for him, Baloo teaches him the Law. Fifteen years later the young wolves turn against him and he drives them back with fire — then leaves for the human village, belonging to neither world.`,
      summary: [
        `The Seeonee Hills on a warm evening. Tabaqui the jackal arrives at Father Wolf's cave with Shere Khan's warning: the tiger is hunting men tonight. Moments later the infant Mowgli crawls out of the darkness into the den, following the warmth. Shere Khan appears at the entrance and demands his prey. Father Wolf refuses. Mother Wolf — fiercer than Father Wolf in this crisis — names the child Mowgli, "the Frog," and claims him. The wolves carry him to the Council Rock, where any adult member of the pack may challenge a cub's acceptance. Shere Khan roars his objection from the valley below. Baloo the bear speaks for Mowgli. Bagheera pays a freshly killed bull as the price of acceptance. Mowgli is in.`,
        `He grows up in the pack — faster than any wolf cub, learning every jungle tongue, mastering the Master Words that open every creature's cooperation, learning to think as a predator thinks. But he is also unmistakably human: he stares snakes into stillness, which no wolf can do; he pulls thorns from paws, which endears him to every creature; he does not understand, for a long time, why Shere Khan hates him with such constancy. Years pass. Akela grows old. Shere Khan works on the young wolves, reminding them that a man-cub is not a wolf, that the pack was broken when it accepted him, that Akela's missed kill is the moment to correct the mistake.`,
        `At the next Council Rock, Akela misses his kill and the pack closes in on him and on Mowgli at the same moment. Mowgli goes to the human village, steals fire in an earthen pot — the Red Flower — and returns. He burns Shere Khan's flank and drives the wolves back. Then, for the first time, he weeps: because he is leaving, because Baloo and Bagheera and Akela are not the pack that betrayed him, and because the human village to which he is walking has not yet accepted him either. He goes. The story ends before the village does.`,
      ],
      appears: [{ id: 'mowgli', name: 'Mowgli' }, { id: 'baloo', name: 'Baloo' }, { id: 'bagheera', name: 'Bagheera' }, { id: 'shere-khan', name: 'Shere Khan' }, { id: 'akela', name: 'Akela' }],
      themes: [{ slug: 'the-law', label: 'The Law' }, { slug: 'belonging', label: 'Belonging' }, { slug: 'power-loyalty', label: 'Power and loyalty' }],
    },
    {
      n: 2,
      title: "Kaa's Hunting",
      tourTitle: "Kaa's Hunting",
      hook: "The Bandar-log have no Law. They kidnap Mowgli because they can. The rescue requires the one creature everyone fears.",
      tour: `Baloo teaches Mowgli the Master Words of the jungle — the passwords that earn safe passage from every creature. Mowgli, restless and mischievous, makes friends with the Bandar-log, the monkey people, who live high in the trees and have no law, no memory, and no leader. Baloo has forbidden contact with them, and when he punishes Mowgli for it, the monkeys swoop down and carry Mowgli away to the Cold Lairs, an abandoned human city in the jungle. Baloo and Bagheera pursue but cannot follow into the treetops; they go to Kaa the rock python, the one creature the Bandar-log genuinely fear. Kaa, old and precise, agrees to help. The rescue at the Cold Lairs is violent and decisive: Kaa's dance hypnotizes every monkey in sight, and Baloo and Bagheera pull Mowgli free. Mowgli, surrounded by hypnotized monkeys, is immune — because he is human. Baloo scolds him for the Bandar-log friendship; Mowgli, sore from the cuffs, accepts the lesson.`,
      blurb: `Mowgli makes friends with the Bandar-log — the monkey people who have no Law and no memory — and is carried to the Cold Lairs, a ruined city. Baloo and Bagheera summon Kaa the python to rescue him. Kaa's dance hypnotizes every monkey in sight; Mowgli, human, is immune.`,
      summary: [
        `Baloo teaches Mowgli the Master Words — the passwords that earn safe passage from every creature in the jungle. Each word opens a different community: the Hunting People, the Water Truce, the snake language that stops a cobra mid-strike. Mowgli finds the lessons boring when he knows them and amusing to show off, and in his restlessness he makes friends with the Bandar-log, the monkey people, who live high in the canopy and are forbidden company. Baloo has said so explicitly. When he catches Mowgli being carried by the monkeys, he cuffs him. The monkeys, watching from above, swoop down in their hundreds and carry Mowgli away before Baloo or Bagheera can reach them.`,
        `The Bandar-log take Mowgli to the Cold Lairs — an abandoned human city overtaken by the jungle, its walls crumbling, its rooms full of cobras and rain-stained stone. The monkeys have grand plans for Mowgli: he will teach them to weave and to build, and then they will be respected by all the other animals. The plans change every few minutes because the Bandar-log have no memory. Baloo and Bagheera follow as fast as they can, but cannot follow into the treetops. They go instead to Kaa the rock python — thirty feet of muscle, ancient, precise, and the one creature the Bandar-log fear enough to scatter at the mention of his name. Kaa agrees to help.`,
        `The rescue at the Cold Lairs is swift and violent. Baloo and Bagheera breach the walls; the monkeys attack in their hundreds. Kaa arrives in the darkness and begins his dance — the slow, hypnotic movement that no creature with eyes can resist. Every monkey in the Cold Lairs stops. They begin to move toward Kaa. Mowgli watches, curious: he is immune, because he is human, and the dance does not touch him. Baloo and Bagheera are not immune and have to look away. Mowgli is pulled free. On the way home, Baloo scolds him thoroughly for the Bandar-log friendship; Mowgli, bruised from the cuffs and from the rescue, accepts the instruction. The lesson is not about courage. It is about the danger of creatures who have no Law.`,
      ],
      appears: [{ id: 'mowgli', name: 'Mowgli' }, { id: 'baloo', name: 'Baloo' }, { id: 'bagheera', name: 'Bagheera' }, { id: 'kaa', name: 'Kaa' }],
      themes: [{ slug: 'the-law', label: 'The Law' }, { slug: 'power-loyalty', label: 'Power and loyalty' }],
    },
    {
      n: 3,
      title: '"Tiger! Tiger!"',
      tourTitle: '"Tiger! Tiger!"',
      hook: "Mowgli enters the human village. It does not accept him. He returns to the jungle for a final reckoning with Shere Khan.",
      tour: `Mowgli arrives at the human village and is taken in by Messua, who believes he may be the son she lost to the tiger years ago. He learns the work of the village — herding cattle — but the children mock him and the adults fear him. Buldeo the hunter tells stories about the tiger with the lame paw that are nonsense to Mowgli, who knows Shere Khan personally. Word comes that Shere Khan is in the area. Mowgli takes the cattle to the ravines, sends word through Akela and Grey Brother the wolf, and drives the cattle from both ends of the ravine simultaneously — the buffaloes one way, the cows the other — trapping Shere Khan in the dry riverbed between them. Shere Khan is trampled. Mowgli skins him. Buldeo arrives, tries to claim authority, and is pinned by Grey Brother at Mowgli's word. The village elders, hearing of this, declare Mowgli a sorcerer. Messua is kind, but the village drives him out. He goes back to the jungle with the tiger's skin — and is received by the wolves.`,
      blurb: `Mowgli enters the human village, learns to herd cattle, and drives Shere Khan into a ravine trap with the buffalo herd. He skins the tiger. The village, frightened of what he can do, drives him out. He returns to the jungle with the skin.`,
      summary: [
        `Mowgli arrives at the human village at night and is taken in by a woman named Messua, who believes he may be the son she lost years ago to a tiger. The village accepts him provisionally: he is put to work herding cattle, which suits him because he is outdoors and the cattle trust him. But the village children mock him — he does not know their games, he moves strangely, he talks to animals — and Buldeo the hunter, the village's expert on tigers, tells stories about Shere Khan that Mowgli knows to be entirely wrong. Mowgli knows Shere Khan. The stories are invented.`,
        `Word comes through the jungle that Shere Khan has come back from his burns and is hunting again. Grey Brother, a young wolf, brings the message to Mowgli at the herding grounds. Mowgli plans the trap carefully: he separates the cattle into two groups at opposite ends of a dry ravine, sends Akela and Grey Brother to drive them from both sides simultaneously, and positions himself to watch. Shere Khan, walking in the ravine, is caught between the two stampeding herds — the buffaloes from above, the cows from below. He has nowhere to go. He is old and has eaten recently; he is slow. The buffaloes trample him.`,
        `Mowgli skins the tiger — a long, precise operation that he carries out alone. Buldeo arrives and tries to claim the skin and the authority to tell Mowgli what to do; Grey Brother pins him at Mowgli's word. Buldeo goes back to the village with the story of what he has seen. The village elders decide Mowgli is a sorcerer — a child raised by wolves who can command wild animals is not a child but a devil. Messua is kind; the rest of the village is not. They drive him out with stones and hard words. Mowgli goes back to the jungle, carrying the tiger's skin, not weeping this time. He is received by the wolves. The story ends with the jungle taking him back.`,
      ],
      appears: [{ id: 'mowgli', name: 'Mowgli' }, { id: 'shere-khan', name: 'Shere Khan' }, { id: 'akela', name: 'Akela' }],
      themes: [{ slug: 'belonging', label: 'Belonging' }, { slug: 'the-law', label: 'The Law' }, { slug: 'power-loyalty', label: 'Power and loyalty' }],
    },
    {
      n: 4,
      title: 'The White Seal',
      tourTitle: 'The White Seal',
      hook: "A white fur seal watches his people slaughtered on the beach every year and decides it does not have to be this way.",
      tour: `Kotick is born white on the breeding beaches of St. Paul's Island in the Bering Sea — unusual, and noted by the older seals. He grows up watching the annual harvest: men driving the young male seals to the killing ground, clubbing them, skinning them. The older seals accept this as the order of things. Kotick cannot. He spends years searching the Pacific for a safe beach — asking every creature he meets, swimming to every remote shore — and is mocked for his searching by the other seals, who think the killing grounds are simply a fact of the world. After years of failed searching, he finds a hidden beach where no men have ever come, accessible through a sea-cave. He returns to St. Paul's, fights every large bull on the beach to make them follow him, and leads his people to safety. The story ends with the safe beach established and the slaughter behind them.`,
      blurb: `Kotick the white seal watches his people driven to the slaughter pits every year and refuses to accept it as normal. He spends years searching the Pacific for a safe beach, is mocked for it, and eventually finds one — then fights every bull on the breeding beach to make them follow him there.`,
      summary: [
        `Kotick is born white on the crowded breeding beaches of St. Paul's Island in the Bering Sea — an unusual color that marks him as different from the first day. He grows up watching the annual harvest: the men who come with clubs and long knives, who sort the young male seals by size, drive the selected ones inland, and kill them for their fur. Thousands die every year. The older seals — Sea Catch, Matkah, the great bulls who hold the best beaches — accept this without question. The killing ground is a fact, like the tide. Kotick watches and cannot understand how a fact can simply be accepted when it can be avoided.`,
        `He begins searching. He asks the Sea Cow, the Killer Whale, the old Albatross, the Loggerhead Turtle — anyone who has traveled the Pacific — whether there is a beach where men do not come. Most do not know. Some mock him. He swims to beach after beach — Kerguelen, Heard Island, remote shores in every direction — and finds men, or finds beaches too exposed to survive on, or finds nothing. Year after year. The other seals on St. Paul's think he has gone strange. He has a reputation for searching, which is not an admirable reputation among seals.`,
        `He finds the safe beach finally through the Sea Cows, vast ancient creatures who take him through an underwater passage into a lagoon that opens onto a long stretch of sand where no man has ever set foot. He verifies it carefully. Then he returns to St. Paul's and does the thing the story has been building toward: he challenges every large bull on the beach, fights his way through them one by one, and earns the right to be heard. He leads his people through the sea-cave to the safe beach. The story's last line reports that the seal rookeries are still there today, which is Kipling's way of saying the search was real and the resolution was real. The searching made the difference.`,
      ],
      appears: [{ id: 'kotick', name: 'Kotick' }],
      themes: [{ slug: 'nature-mastery', label: 'Nature and mastery' }, { slug: 'belonging', label: 'Belonging' }],
    },
    {
      n: 5,
      title: '"Rikki-Tikki-Tavi"',
      tourTitle: '"Rikki-Tikki-Tavi"',
      hook: "A mongoose washed out of his burrow by a flood is adopted by a British family whose garden already has two king cobras.",
      tour: `A young mongoose named Rikki-Tikki-Tavi is washed out of his burrow by a summer flood and found nearly drowned by a small boy named Teddy, whose family revives him. He is curious in the way all mongooses are curious — the family motto is "run and find out" — and spends his first day exploring every room of the bungalow. The garden has two king cobras: Nag and his wife Nagaina, who regard the garden as theirs by right and plan to kill the human family to remove any obstacle to their ownership. Rikki kills Nag in the bathroom in the night — a fierce, determined fight that shakes the whole house. Nagaina, enraged, threatens the family directly. Rikki races to Nagaina's nest and destroys every egg but one, which he uses to lure Nagaina away from Teddy. He follows her into her hole in the ground. He comes out. She does not.`,
      blurb: `A mongoose adopted by a British family discovers the garden has two king cobras who plan to kill the family. He kills Nag in the bathroom at night and pursues Nagaina into her burrow after destroying her eggs. He comes out. She does not.`,
      summary: [
        `A young mongoose named Rikki-Tikki-Tavi is washed out of his burrow in the Indian hills by a summer flood and found nearly drowned on the road by a small boy named Teddy. The family — an English family in a bungalow with a large garden — revives him and keeps him. Rikki is curious in the way all mongooses are curious: the family motto is "run and find out," which means investigate everything, retreat from nothing. He spends his first day investigating the entire bungalow, learning every room's function and every creature's character. The garden, he discovers, is the territory of Nag and Nagaina — two large king cobras who have lived there before the family arrived and intend to live there after the family is gone.`,
        `Nag and Nagaina's plan is direct: kill the humans, remove the complication, reclaim the garden. Nag hides in the bathroom that night waiting for the man who comes to water the garden. Rikki follows him in. The fight is brief and violent — Rikki latches onto Nag's hood and holds on while the cobra smashes him against the wall and the floor and the bath. He holds on. The man's shotgun finishes what Rikki started. But Nagaina is still alive, and she has eggs in the melon bed that will hatch more cobras.`,
        `Rikki goes to the melon bed and begins destroying Nagaina's eggs one by one, until he has only one left. He uses the last egg to lure Nagaina away from Teddy, where she has cornered the family on the veranda. She comes for the egg. Rikki follows her into her burrow. The burrow is dark. Underground fights between mongooses and cobras do not have witnesses. What Teddy's father later finds is the mongoose coming out of the hole, shaking dust from his fur. Nagaina does not come out. Rikki, very tired, eats a small frog for dinner and is carried back to the house by Teddy. The garden is safe.`,
      ],
      appears: [{ id: 'rikki-tikki', name: 'Rikki-Tikki-Tavi' }],
      themes: [{ slug: 'nature-mastery', label: 'Nature and mastery' }, { slug: 'power-loyalty', label: 'Power and loyalty' }],
    },
    {
      n: 6,
      title: 'Toomai of the Elephants',
      tourTitle: 'Toomai of the Elephants',
      hook: "A ten-year-old elephant handler is told he will never become a real mahout. That night, an elephant carries him into the jungle to see something no human has ever seen.",
      tour: `Little Toomai is the son and grandson of elephant handlers at a government khedda — a camp where wild elephants are caught and trained. He loves the elephants, particularly Kala Nag, the great elephant his family has handled for generations. Petersen Sahib, the head of all the elephant-catching operations, tells Toomai that a boy becomes a mahout only after he has seen the elephants dance, which no human has ever seen — a joke at his expense. That night, during the noise of the camp, Kala Nag pulls his picket from the ground and walks into the jungle. Toomai, waking, climbs onto his back and rides along. In a forest clearing, every elephant in the region has gathered — wild elephants, tame elephants, old elephants — and they dance. Toomai is the only human present. He falls asleep on Kala Nag's back and is brought home at dawn. Petersen Sahib, hearing his account, acknowledges him as a mahout.`,
      blurb: `Little Toomai, son of an elephant handler, rides Kala Nag into the jungle at night and witnesses the elephants' secret dance — a gathering of every elephant in the region in a forest clearing. No human has seen this before. When he comes back, Petersen Sahib calls him a mahout.`,
      summary: [
        `Little Toomai is ten years old, the son of Big Toomai and the grandson of a long line of mahouts — men who handle government elephants at the khedda camps. He is small and quick and has grown up around elephants his entire life, which means he moves among them without fear and they treat him as part of the furniture. His particular elephant is Kala Nag, a great tusker nearly sixty years old who has been in the Toomai family's charge for three generations. Petersen Sahib, the white officer who runs all elephant-catching operations in the region, notices Little Toomai and asks what he wants to be when he grows up. A mahout, says Toomai. Petersen Sahib says: you can be a mahout when you have seen the elephants dance, which no human has ever seen. It is not a kind joke, but Petersen Sahib does not mean it unkindly; he simply does not expect it to be fulfilled.`,
        `That night, during a festival in the camp, Kala Nag pulls his picket chain from the ground — a thing he has not done in years — and begins walking into the jungle. Toomai, waking to the sound, sees him going and climbs onto his back. He does not know where they are going. The jungle is dark and full of sound. Kala Nag walks for hours, deeper into the forest, until he reaches a clearing where the moonlight comes through. Every elephant in the region is there: wild elephants, camp elephants, old elephants with tusks worn down to stumps. They dance — not gracefully, but terribly, stamping the ground flat, turning and turning in the moonlight. Toomai watches. He is the only human present. He falls asleep somewhere in the middle of it.`,
        `He wakes on Kala Nag's back at the edge of the camp at dawn. The ground where the elephants danced is perfectly flat — every stump flattened, every root exposed. Petersen Sahib, hearing the story, looks at Toomai for a long time. He calls him Toomai of the Elephants. He acknowledges him as a mahout. The story's argument is not about courage or cleverness. Toomai was carried; he did not choose. But he was the one who loved the elephants enough to stay on Kala Nag's back in the dark jungle rather than climbing off and running. The love was what made the difference, and Petersen Sahib knows it.`,
      ],
      appears: [{ id: 'toomai', name: 'Little Toomai' }],
      themes: [{ slug: 'nature-mastery', label: 'Nature and mastery' }],
    },
    {
      n: 7,
      title: "Her Majesty's Servants",
      tourTitle: "Her Majesty's Servants",
      hook: "The night before a great review, the animals of Her Majesty's forces compare notes on their duties, their fears, and what it means to obey.",
      tour: `The night before a great viceregal review in India, the animals of Her Majesty's service are camped together: horses, mules, camels, bullocks, and elephants, each attached to a different corps. Mules and horses talk about the terror of the camels, who panic at nothing and infect everything around them with their panic. Camels explain their own logic. Bullocks discuss the work of pulling the big guns. An elephant named Vixen explains that she serves because her mahout tells her to, and that is enough. A young native prince, listening from behind a hedge, asks the narrator how the English make so many different animals work together. The narrator answers: by making each animal obey the one set immediately above it. The prince observes that his own people have not yet learned this. The story ends on that observation.`,
      blurb: `The night before a great review, the mules, horses, camels, bullocks, and elephants of Her Majesty's service compare their duties and their fears. A young prince overhears and asks how the English manage so many different creatures. The answer is a single word: obedience, up a clear chain.`,
      summary: [
        `The Viceregal camp, the night before a great military review. The animals of Her Majesty's Indian forces are camped together: artillery horses, transport mules, supply camels, gun bullocks, and the two thousand elephants of the baggage train. Each belongs to a different corps; each has its own temperament and its own understanding of its work. The story is built from their conversation, overheard by the narrator, who moves invisibly among the tethered animals in the dark.`,
        `The mules discuss the camels: specifically, why the camels panic at nothing and why their panic spreads to every creature nearby. The camels, questioned directly, explain that they cannot help what they are — their nerves are made in a particular way, and the solution is not to trust camels with anything that requires steadiness. The bullocks discuss the work of pulling the big guns — specific, disciplined, unglamorous, and essential. The elephant Vixen explains her relationship to her mahout with a clarity that the other animals find either admirable or mysterious: she obeys because he tells her to, and because the chain of obedience runs upward to the Queen herself, and because that is how things are arranged.`,
        `A young native prince, listening from behind a hedge with the narrator, asks how the English manage to make so many different kinds of animals work together without disorder. The narrator explains: by making each animal obey the one set immediately above it, up a chain that reaches the Commander-in-Chief. The prince says that his own people have not yet learned this — that his soldiers would refuse orders they considered beneath their dignity, or would break formation if they thought they knew better. The story ends on that observation. It is the only story in the book that is openly political, and it is the one that has dated most. Read it for what it reveals about 1894, and for the animals' conversation, which has not dated at all.`,
      ],
      appears: [],
      themes: [{ slug: 'the-law', label: 'The Law' }, { slug: 'nature-mastery', label: 'Nature and mastery' }],
    },
  ],

  cast: [
    { id: 'mowgli', name: 'Mowgli' },
    { id: 'baloo', name: 'Baloo' },
    { id: 'bagheera', name: 'Bagheera' },
    { id: 'shere-khan', name: 'Shere Khan' },
    { id: 'akela', name: 'Akela' },
    { id: 'rikki-tikki', name: 'Rikki-Tikki-Tavi' },
  ],
};
