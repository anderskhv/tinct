// The Republic — SEO page data for build-seo-pages.cjs
// Plato, 10 books, dialogue. Voice: declarative, specific, dialectical.

module.exports = {
  id: 'the-republic',
  title: 'The Republic',
  author: 'Plato',
  byline: '4th century BCE · Greek philosophical dialogue',
  titleAccent: 'a guided tour',
  hook: 'A walk back from the harbor turns into a long evening, and ten books of conversation about what justice actually is — in a person, and in a city.',
  themesBlurb: 'Justice, the soul, the philosopher-king, the cave, the Forms.',
  castBlurb: 'Socrates and his interlocutors',
  castDesc: 'Who is in the room, and what each of them argues for.',
  chapterLabel: n => `Book ${n}`,
  genre: ['Philosophical dialogue', 'Classical philosophy'],

  // -- Hub copy --
  about: [
    `<em>The Republic</em> is the most influential book of political philosophy ever written. It is also a conversation. Socrates has gone down to the Piraeus, the harbor town outside Athens, for a torchlight festival. On the way back he is detained, almost forcibly, by a group of friends who want to talk. The talk runs all night.`,
    `What begins as an ordinary question — what is justice? — turns, by Book Two, into something much larger. To understand justice in a single person, Socrates suggests they imagine it on a bigger scale, in a city. They build the city in speech, watch it grow corrupt, classify the kinds of human soul that match each kind of regime, and arrive, somewhere around Book Seven, at the most famous image in Western philosophy: a cave with prisoners chained to face the wall, mistaking shadows for the world. Then they descend back through the kinds of decline a city goes through, the kinds of person each decline produces, and end with a myth about the soul after death.`,
  ],
  chaptersSubtitle: 'All ten books summarized — the dialogue from Cephalus to the myth of Er.',
  chaptersLead: `<p>The Republic is a single conversation, but it moves through clearly distinct stages. Books One and Two open the question. Books Three and Four build the city and find justice in it. Books Five through Seven are the philosophical heart of the work — the philosopher-king, the divided line, the cave, the Form of the Good. Books Eight and Nine watch the city decline and the soul with it. Book Ten settles accounts with poetry and ends in myth.</p>`,
  themesByline: 'Five threads through the dialogue',
  themesLead: `The Republic is many things at once: a defense of justice as good in itself, a manual for an ideal city, a theory of the soul, an attack on poetry, and the founding text of Western metaphysics. These five threads run through the whole dialogue, and following any one of them clarifies the rest.`,

  groups: [
    { label: 'Books 1–2 · The argument begins', subtitle: 'What justice is, and why anyone should care.', chapters: [1, 2] },
    { label: 'Books 3–4 · The city, and the soul', subtitle: 'Building justice from the outside in.', chapters: [3, 4] },
    { label: 'Books 5–7 · The philosopher-king', subtitle: 'The heart of the dialogue — the cave, the Forms, the Good.', chapters: [5, 6, 7] },
    { label: 'Books 8–10 · Decline and the myth of Er', subtitle: 'How regimes fall, and what the soul carries forward.', chapters: [8, 9, 10] },
  ],

  // -- Themes (5 essays) --
  themes: [
    {
      slug: 'justice',
      title: 'Justice — in the soul and in the city',
      greek: '<em>dikaiosynē</em> — the central question of the dialogue',
      preview: 'The Republic begins by asking what justice is and never quite stops. Socrates argues that justice is the right ordering of the parts of a soul or a city — each part doing its proper work, none overreaching.',
      essay: [
        `The dialogue begins with an ordinary question — what is justice? — and the easy answers fail fast. Cephalus says it is paying your debts and telling the truth. Polemarchus refines it: helping friends and harming enemies. Thrasymachus rounds on them both: justice is whatever the strong say it is, and being unjust is more profitable when you can get away with it.`,
        `Glaucon raises the stakes in Book Two. He retells the myth of the ring of Gyges — a man who finds a ring that makes him invisible and immediately uses it to seduce the queen and murder the king. Glaucon's challenge to Socrates is: prove that the just person, given the ring, would not behave the same way. Prove that justice is good <em>in itself</em>, not just for its consequences.`,
        `The rest of the dialogue is Socrates's answer. To see what justice is in a single soul, he says, magnify it onto a city. Build the city right, and you will find justice in it — and the same shape, smaller, in a person. The city has three classes (rulers, guardians, producers); the soul has three parts (reason, spirit, appetite); justice in either is the right ordering, each part doing its proper work, none overreaching the others.`,
        `By Book Nine, Socrates can finally answer Glaucon: the just person is happier than the unjust — not because the gods reward them, not because anyone is watching, but because their soul is in order. The unjust soul is at war with itself. The just soul is at peace. That is the answer the ring of Gyges was demanding all along.`,
      ],
      where: [
        { n: 1, label: 'Book 1 (the easy answers)' },
        { n: 2, label: 'Book 2 (the ring of Gyges)' },
        { n: 4, label: 'Book 4 (justice defined)' },
        { n: 9, label: 'Book 9 (the just life)' },
      ],
    },
    {
      slug: 'philosopher-king',
      title: 'The philosopher-king',
      greek: 'kings must be philosophers, or philosophers kings — and we will resist this',
      preview: 'In Book Five Socrates lets fall the most provocative claim in the dialogue: cities will only be just when philosophers rule them. He is well aware no one wants this, including the philosophers.',
      essay: [
        `In Book Five Socrates says, almost reluctantly, what the dialogue has been building toward: a just city is impossible until kings become philosophers, or philosophers kings. He says it knowing the reaction will be derision. Glaucon warns him to prepare for it.`,
        `The argument is simple. Rulers should rule for the sake of the ruled, not for power; only people who do not <em>want</em> power can be trusted with it; and only philosophers — those who love truth more than honor, money, or pleasure — fit that description. Anyone who wants to rule has already disqualified themselves.`,
        `This is also why the philosophers in the Republic must be educated for fifty years before they take office. They are not allowed to rule until they have ascended out of the cave, seen the Form of the Good, and been forced — against their preference — to come back down and govern. They would rather contemplate. The city makes them rule because justice requires it.`,
        `The Republic is brutally honest about how unlikely all this is. Most cities are run by people who want to run them. Most citizens prefer rulers who flatter them. The philosopher-king is the city's structural answer to a structural problem — and the dialogue is sober about how rarely the answer comes.`,
      ],
      where: [
        { n: 5, label: 'Book 5 (the claim made)' },
        { n: 6, label: 'Book 6 (the philosopher described)' },
        { n: 7, label: 'Book 7 (the long education)' },
      ],
    },
    {
      slug: 'cave',
      title: 'The cave, the divided line, the Forms',
      greek: 'the most famous images in Western philosophy',
      preview: 'Books Six and Seven contain the dialogue\'s metaphysical core: the divided line, the analogy of the sun, and the allegory of the cave. The arguments these images make have shaped two thousand years of thought.',
      essay: [
        `The metaphysical core of the Republic is in Books Six and Seven, in three linked images: the sun, the divided line, and the cave. Each one is a way of saying the same thing — that what we ordinarily call knowledge is really opinion about shadows, and that there is a higher knowledge available to anyone willing to ascend.`,
        `The cave is the most famous. Imagine prisoners chained from birth to face the back wall of a cave. Behind them, a fire burns; between the fire and the prisoners, people walk past carrying objects, and the prisoners see only the shadows the objects cast on the wall. They believe the shadows are reality. They have never seen anything else.`,
        `Then one prisoner is freed. He turns around and sees the fire — painful, after a lifetime of shadows. He is dragged up out of the cave and into the sunlight, where the real objects are. The first sight of the sun nearly blinds him. Eventually he sees clearly. He understands. And then, Socrates says, the philosopher comes back down — back into the cave, back to the prisoners, to try to free them. They will not believe him. They will laugh at him. If he persists, they may kill him.`,
        `The Form of the Good is the sun in this story. It is what makes everything else intelligible. Plato's argument is that there is a reality more real than what we see — that ordinary objects are shadows of something — and that the philosopher's life is the slow climb toward seeing things as they are. The Republic is, on one reading, a manual for that climb.`,
      ],
      where: [
        { n: 6, label: 'Book 6 (the divided line)' },
        { n: 7, label: 'Book 7 (the cave)' },
      ],
    },
    {
      slug: 'poetry',
      title: 'The quarrel with poetry',
      greek: 'why Homer is banished from the just city',
      preview: 'The Republic ends by banishing the poets. Socrates is not joking. Poetry corrupts the soul, he argues, by training us to feel what we should not feel. The argument is uncomfortable, and the dialogue knows it.',
      essay: [
        `In Book Ten Socrates returns to a topic he raised earlier and dropped: poetry. The just city, he says, will banish Homer and the tragic poets. They will be allowed only hymns to the gods and praises of good men. The rest must go.`,
        `The argument runs in two stages. First, poetry imitates appearances — it is a copy of a copy, three steps from reality, and so it cannot teach us anything true. Second, and more importantly, poetry trains the soul to feel what it should not feel. We watch a tragedy and weep over Achilles's grief; we feel pity for him; we exercise the part of us that should be ruled by reason and not given free rein. Each tragedy makes us a little less able to govern ourselves.`,
        `Socrates is aware this is a hard saying. He himself has loved Homer all his life. The Republic is, in many places, deeply Homeric — the heroes it cites, the images it uses. But the philosopher must be willing to follow the argument where it leads, and the argument leads here.`,
        `It is also worth saying that the dialogue does not <em>quite</em> close the door. Socrates says he would welcome any defense of poetry that anyone could offer, and would gladly let the poets back in if the case could be made. Two and a half millennia later, we are still trying to make that case.`,
      ],
      where: [
        { n: 2, label: 'Book 2 (poetry and education)' },
        { n: 3, label: 'Book 3 (the first ban)' },
        { n: 10, label: 'Book 10 (the final argument)' },
      ],
    },
    {
      slug: 'decline',
      title: 'The decline of regimes',
      greek: 'how a just city falls, and what kind of soul each fall produces',
      preview: 'In Books Eight and Nine, Socrates sketches the four ways a just city decays: into timocracy (rule by honor), oligarchy (rule by money), democracy (rule by appetite), and tyranny. Each regime corresponds to a kind of soul.',
      essay: [
        `Books Eight and Nine are the long dark slope of the dialogue. Having built the just city, Socrates now describes how it falls — and how each kind of fall produces a corresponding kind of person.`,
        `First the timocracy: rule by men who love honor more than truth. The guardians get greedy; the city goes to war; courage replaces wisdom as the highest virtue. Then the oligarchy: rule by the wealthy. Money becomes the measure of worth, and the city splits into two cities — the rich and the poor — living in the same place but pretending they are not at war.`,
        `Then democracy: the poor rise up, kill or banish the rich, and divide power equally. Everyone is free to do as they please. Every appetite is honored equally with every other appetite. There are no rulers, only personalities. Socrates is unsparing here. The democratic city is sweet to live in; it is also the point of maximum disorder before tyranny.`,
        `Tyranny is the last stage. A democratic city, drunk on freedom, eventually produces a man who promises everything to everyone — and then, once installed, takes everything from everyone. The tyrant is the most miserable person alive, Socrates argues, because his soul is the most disordered. His appetites rule him; he can trust no one; he is at war with his own household. The Republic ends by saying: this is what unjust life feels like, all the way down.`,
      ],
      where: [
        { n: 8, label: 'Book 8 (the four falls)' },
        { n: 9, label: 'Book 9 (the tyrant\'s soul)' },
      ],
    },
  ],

  // -- Key figures (summary preview) --
  keyFigures: [
    { name: 'Socrates', role: 'The questioner', body: `The narrator and primary speaker. Plato's Socrates is older here than in many earlier dialogues — patient, willing to spend a whole night on the question, sharp without cruelty. He drives the argument by asking, not by lecturing.` },
    { name: 'Glaucon', role: 'Plato\'s brother', body: `One of Plato's two older brothers, and the chief interlocutor for most of the dialogue. He raises the ring-of-Gyges challenge in Book Two and stays sharp throughout. Without Glaucon, Socrates would be talking to himself.` },
    { name: 'Adeimantus', role: 'Plato\'s other brother', body: `Glaucon's quieter brother, who tends to take over when the conversation gets practical (the education of the guardians, the role of poetry). He is the more skeptical of the two.` },
    { name: 'Thrasymachus', role: 'The sophist', body: `A teacher of rhetoric. He bursts in on the dialogue in Book One with the cynical claim that justice is whatever serves the strong. He loses his patience with Socrates, then loses the argument, and is gradually domesticated into the conversation.` },
    { name: 'Polemarchus', role: 'The host', body: `Son of Cephalus, in whose house the dialogue takes place. He inherits the conversation when his father leaves and offers the second definition of justice — helping friends, harming enemies — which Socrates takes apart in twenty minutes.` },
    { name: 'Cephalus', role: 'The old man', body: `Polemarchus's elderly father, who opens the dialogue with the easy answer that justice is paying your debts. He leaves to attend a sacrifice before things get hard. He is the only character whose absence changes the dialogue's whole atmosphere.` },
  ],

  // -- Cast (full page) --
  castSubtitle: 'Six speakers in a Piraeus living room, all night.',
  castLead: `<p>The Republic is a conversation among friends. The roles are: Socrates is the inquirer; Glaucon and Adeimantus drive the questions forward; Thrasymachus is the antagonist Socrates must answer; Polemarchus and Cephalus open the dialogue and provide the easy answers that have to be taken apart before the real work can begin.</p>
      <p>Plato himself does not appear. He is the silent author — known to us only through this voice he gives Socrates. The whole Republic is presented as Socrates narrating, the day after, what was said the night before.</p>`,
  castGroups: [
    {
      label: 'The speakers',
      subtitle: 'Everyone who talks across the ten books.',
      characters: [
        { id: 'socrates', tag: 'Speaker', name: 'Socrates', epithet: 'The narrator and questioner', body: `Plato's Socrates, here in the early evening of his life. He has gone down to the Piraeus for a religious festival and is detained, half-jokingly, by friends who want to talk. He talks. By the dialogue's end he has constructed an entire ideal city, dismantled four corrupt regimes, defined the soul, and ended in myth. Throughout he asks more than he answers; the dialogue's positive doctrines all emerge from questions he puts to others.`, appearsLabel: 'Throughout.', appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { id: 'glaucon', tag: 'Speaker', name: 'Glaucon', epithet: 'Plato\'s elder brother', body: `The chief interlocutor for most of the dialogue. Glaucon is sharp, ambitious, well-bred — Plato never stops calling him beautiful — and willing to push Socrates into hard places. The ring-of-Gyges challenge in Book Two is his; it is the engine that drives the rest of the work. Glaucon is Socrates's preferred interlocutor because he will accept no easy answer.`, appears: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { id: 'adeimantus', tag: 'Speaker', name: 'Adeimantus', epithet: 'Plato\'s other brother', body: `Glaucon's quieter older brother. He takes over the conversation in the more practical stretches — the education of the guardians, the place of poetry, the politics of the city. He is more skeptical than Glaucon about the city-in-speech and presses Socrates harder on whether any of this could ever be real.`, appears: [2, 3, 4, 8] },
        { id: 'thrasymachus', tag: 'Speaker', name: 'Thrasymachus', epithet: 'The sophist', body: `A professional rhetorician who has been listening with growing impatience to Socrates question Polemarchus. He breaks in with the cynical and uncomfortable claim that justice is the advantage of the stronger. Socrates takes him apart over the course of Book One — but Thrasymachus is not destroyed, only partly tamed; he stays in the room for the rest of the night, and at the end of Book One Socrates compliments him on becoming gentle.`, appears: [1] },
        { id: 'polemarchus', tag: 'Speaker', name: 'Polemarchus', epithet: 'The host', body: `Son of Cephalus, the dialogue's host. He inherits the argument when his father leaves and offers the early definition that justice is helping friends and harming enemies — an answer Socrates dismantles by asking whether one always knows who one's friends are. Polemarchus is decent, sincere, not very subtle, and the easiest target.`, appears: [1] },
        { id: 'cephalus', tag: 'Speaker', name: 'Cephalus', epithet: 'The old man', body: `Polemarchus's elderly father. He opens the dialogue with grace and the easy answer — justice is paying your debts and telling the truth. Then he leaves to attend a sacrifice. His departure is the moment the dialogue gets serious. Cephalus represents the unexamined life lived well — for which Plato has affection but, ultimately, no philosophical use.`, appears: [1] },
      ],
    },
    {
      label: 'The absent',
      subtitle: 'Names invoked but not on stage.',
      characters: [
        { id: 'plato', tag: 'Author', tagClass: 'creature', name: 'Plato', epithet: 'The silent author', body: `The Republic is presented as Socrates narrating, the day after, what was said the night before. Plato is nowhere in it — he is the unseen artist behind the curtain. Knowing he was Glaucon and Adeimantus's younger brother gives the dialogue a strange autobiographical edge: he is letting his older brothers speak for him while staying offstage.`, appearsLabel: 'Throughout (offstage).', appears: [1] },
        { id: 'homer', tag: 'Subject', tagClass: 'creature', name: 'Homer', epithet: 'The poet to be banished', body: `Homer haunts the Republic. He is invoked in Book Two as the source of the bad theology that has to be reformed; in Book Three as the great teacher of imitation that has to be restricted; in Book Ten as the chief of the poets who must be expelled from the city. Socrates says he loves Homer — and banishes him anyway.`, appears: [2, 3, 10] },
      ],
    },
  ],

  // -- Chapters (10 books) --
  chapters: [
    {
      n: 1,
      title: 'Three definitions of justice, broken',
      tourTitle: 'Three definitions of justice, broken',
      hook: 'A walk back from the harbor turns into a long evening. Three men try to say what justice is. None of the answers survive.',
      tour: `Socrates has gone down to the Piraeus with Glaucon for the festival of a Thracian goddess. On the way back, Polemarchus and his friends practically order them to stay for the evening. At Polemarchus's house they find old Cephalus, who offers the first definition of justice: paying your debts and telling the truth. Polemarchus inherits the conversation and refines it: helping friends, harming enemies. Then Thrasymachus loses his patience and breaks in with the cynical answer he has been holding back: justice is whatever the strong say it is. Socrates takes all three apart by sundown. Book One ends without a definition.`,
      blurb: `The dialogue opens. Socrates and Glaucon are detained on the road home from the harbor. At Polemarchus's house, three definitions of justice are offered — by Cephalus, by Polemarchus, by Thrasymachus — and each one collapses under questioning. By sundown the conversation has cleared the ground, but no positive answer has been found.`,
      summary: [
        `Socrates has gone down to the Piraeus with Glaucon for a torchlight festival of a Thracian goddess. Heading back to the city, they are stopped by Polemarchus, who sends a slave running ahead with a half-joking order to detain them. There are too many of us, he says when he catches up; you cannot fight us all. Socrates, charmed, agrees to stay. They go to Polemarchus's house, where old Cephalus is just back from a sacrifice and the household is preparing for the night.`,
        `Cephalus is gracious, almost sentimental, about old age. Socrates asks him what justice is. He answers easily: paying your debts and telling the truth. Socrates objects with a single example — a friend lends you a weapon, and then comes asking for it back while in a rage; do you return it? — and Cephalus, before the argument can deepen, slips out to attend a sacrifice. His son Polemarchus inherits the conversation and tries again: justice is helping friends and harming enemies. Socrates dismantles this one too. We are not always sure who our friends are. Helping a person who turns out to be an enemy serves injustice. Harm is itself a form of injustice. The argument unwinds.`,
        `Then Thrasymachus loses his patience. He has been crouched and listening, furious, for some time. He breaks in with the answer he has been holding back: justice is nothing more than the advantage of the stronger. Whoever rules makes laws that serve themselves, and calls obedience to those laws "justice." Socrates pulls the argument apart over the rest of the book — by the end, Thrasymachus has agreed, against his will, that the just life is happier than the unjust. He is not convinced; he is only outmaneuvered. Book One ends with the ground cleared and no definition standing. The real dialogue is about to begin.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'glaucon', name: 'Glaucon' },
        { id: 'cephalus', name: 'Cephalus' },
        { id: 'polemarchus', name: 'Polemarchus' },
        { id: 'thrasymachus', name: 'Thrasymachus' },
      ],
      themes: [{ slug: 'justice', label: 'Justice' }],
    },
    {
      n: 2,
      title: 'The ring of Gyges, and the city built in speech',
      tourTitle: 'The ring of Gyges',
      hook: 'Glaucon\'s challenge: prove that justice is good in itself, not for its consequences. Socrates begins the answer by building a city.',
      tour: `Glaucon is dissatisfied with the way Thrasymachus was beaten. He wants Socrates to prove justice is good in itself, not just for its rewards. He retells the myth of the ring of Gyges — a shepherd who finds a ring that makes him invisible and immediately uses it to seduce the queen and kill the king. Would the just person, given the same ring, behave differently? Adeimantus extends the challenge. Socrates accepts. To answer it, he proposes building a city in speech — because justice will be larger and easier to see in a city than in a single soul. They begin with the simplest village and watch it grow into a polis with classes, an army, and the question of how to educate its guardians.`,
      blurb: `Glaucon and Adeimantus reopen the question Thrasymachus left unfinished. Glaucon retells the myth of the ring of Gyges to ask whether anyone, given the chance to be unjust without consequences, would still choose justice. Socrates agrees to answer — but says it will be easier to see justice in a city than a soul, and proposes they build one in speech.`,
      summary: [
        `Glaucon is unsatisfied. Thrasymachus was beaten in argument, but he was not really refuted; the cynical case for injustice has only been pushed underground. Glaucon wants to make it more strongly than Thrasymachus did — to put it as well as possible — and then have Socrates answer it. He divides goods into three kinds: those wanted for themselves, those wanted for their consequences, those wanted for both. Where does justice belong? Most people, he says, treat it as a necessary evil — good only because of what it gets you. Socrates places it in the third category, the highest. Glaucon then argues the popular case at full strength.`,
        `He retells the myth of the ring of Gyges. A shepherd finds a ring on the corpse of a giant and discovers it makes him invisible. He uses it to seduce the queen, murder the king, and take the throne. Glaucon's challenge is exact: imagine two such rings, one given to a just man and one to an unjust man. If the just man behaves the same as the unjust — and Glaucon thinks he would — then justice is not chosen for itself, only because we cannot get away with breaking it. Adeimantus follows up: even our religion teaches that justice is for the rewards. Prove that the just life is better than the unjust, even if the just man is reviled and the unjust honored. Prove it without appeal to consequences.`,
        `Socrates accepts the challenge. But he proposes a method. Justice in a single soul is small and hard to see; justice in a city is the same shape, only larger. Let us build a city in speech, he says, and find justice in it; then we will know what to look for in the soul. They begin. A first village forms — farmers, weavers, builders. It grows into a luxurious city with armies and physicians. The army needs special education. By the end of Book Two they are debating what the soldiers should be told about the gods, and the long detour through education has begun.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'glaucon', name: 'Glaucon' },
        { id: 'adeimantus', name: 'Adeimantus' },
        { id: 'homer', name: 'Homer' },
      ],
      themes: [{ slug: 'justice', label: 'Justice' }, { slug: 'poetry', label: 'Poetry and education' }],
    },
    {
      n: 3,
      title: 'The education of the guardians',
      tourTitle: 'The education of the guardians',
      hook: 'How to make a soldier who is fierce to enemies and gentle to friends — and what stories they should hear, and not hear.',
      tour: `The guardians of the city must be trained carefully. They will need courage and gentleness in the right proportions — fierce to enemies, gentle to their own. Socrates argues that the stories they grow up on shape the soul, and so the stories must be censored. Homer, as he stands, will not do: gods who lie, heroes who weep, the underworld presented as terrifying — all of it teaches the wrong reflexes. Music and gymnastics together form the right kind of person. By the end of the book Socrates introduces the "noble lie": a myth the guardians will be told about their origins, to bind them to the city.`,
      blurb: `The conversation focuses on the soldiers — the guardians of the city. What kind of education makes a person fierce to enemies and gentle to friends? Socrates proposes a careful regime of stories, music, and physical training, and a strict censorship of poetry. The book ends with the famous "noble lie" — a foundational myth for the city.`,
      summary: [
        `The new city needs soldiers, and soldiers — Socrates says — are dangerous. They are bred for war; without careful training, they turn that ferocity inward against their own people. The guardians must therefore be educated to be like good guard-dogs: fierce to strangers, gentle to those they know. The whole question of education in the Republic begins from this practical problem.`,
        `Education, in early Greece, meant two things: <em>mousike</em> (the arts — poetry, song, dance, story) and gymnastics. Socrates spends most of Book Three on the first. The stories the young guardians grow up on shape what they will love, what they will fear, what they will reach for in a crisis. Homer, as he stands, will not do. Gods who lie to mortals; heroes who weep over their dead in the underworld; warriors who flinch at death — all of these train the wrong reflexes. The stories must be censored. The poets must say only that gods are good and the underworld is not to be feared. Socrates is unapologetic about this. The guardians will become what they hear about.`,
        `Gymnastics gets briefer treatment but the same logic. Diet, discipline, the body trained for service rather than display. By the end of the book Socrates introduces the "noble lie": the foundational myth they will tell the citizens of the new city. They will say that all citizens were born from the earth itself — brothers — but that the gods mixed gold into the souls of those born to rule, silver into the auxiliaries, and bronze into the producers. It is a story they know to be false, and they will tell it anyway because the city needs it. Plato is unembarrassed; the philosopher has read the world too clearly to pretend otherwise.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'adeimantus', name: 'Adeimantus' },
        { id: 'glaucon', name: 'Glaucon' },
        { id: 'homer', name: 'Homer' },
      ],
      themes: [{ slug: 'poetry', label: 'Poetry and education' }, { slug: 'justice', label: 'Justice' }],
    },
    {
      n: 4,
      title: 'Justice found, in the city and in the soul',
      tourTitle: 'Justice found',
      hook: 'The city is finished. Now Socrates can say where justice is in it — and find the same shape in a single person.',
      tour: `The city has its three classes: rulers, auxiliaries (soldiers), and producers (everyone else). Socrates argues that the four cardinal virtues are visible in it. Wisdom is in the rulers, courage in the soldiers, moderation in the agreement between all classes — and justice is the principle that makes the others possible: each class doing its proper work, none overreaching. He then turns inward. The soul has the same three parts: reason, spirit, appetite. Justice in a soul is the same as justice in a city — the right ordering, each part doing its proper work. The dialogue's central thesis is now in place.`,
      blurb: `The city built in speech is now complete. Socrates locates the four cardinal virtues in it — wisdom, courage, moderation, justice — and then finds the same structure in the soul. Reason, spirit, appetite. Justice in either is the right ordering, each part doing its work. The central thesis of the dialogue is in place.`,
      summary: [
        `The city is built. Three classes: the rulers (philosopher-kings, still to be defined), the auxiliaries who fight to defend it, and the producers — farmers, craftsmen, merchants — who feed and clothe everyone. Socrates argues that the four cardinal virtues of Greek thought can be located in this structure. Wisdom is in the small ruling class, who alone know what is good for the whole. Courage is in the auxiliaries, who hold true to their training under pressure. Moderation is the harmony between the classes — every group accepting its place.`,
        `Justice is the last to be defined and the most important. Socrates locates it not in any single class but in the relationship: each part of the city doing its own proper work, none overreaching the others. A producer who tries to govern, or a guardian who turns to making money, breaks the city. Each class kept to its own sphere is justice. It is a remarkably structural answer: justice is not a feeling, not a rule, but a kind of order.`,
        `Then Socrates turns inward. The soul, he proposes, has the same three parts as the city. Reason calculates; spirit (the energetic, courageous part) defends; appetite hungers and reaches for things. He proves the parts are distinct by noting that we can be in conflict with ourselves — wanting and not wanting the same thing — which would be impossible if the soul were one thing. Justice in a soul, he says, is the same shape as justice in a city: each part doing its proper work, none overreaching, all under the rule of reason. Injustice is internal civil war. The center of the Republic's argument is now standing.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'glaucon', name: 'Glaucon' },
        { id: 'adeimantus', name: 'Adeimantus' },
      ],
      themes: [{ slug: 'justice', label: 'Justice' }],
    },
    {
      n: 5,
      title: 'Women, children, and the philosopher-king',
      tourTitle: 'The philosopher-king',
      hook: 'Three "waves" of paradox: women as guardians, children held in common, and the claim that cities must be ruled by philosophers.',
      tour: `Socrates is challenged on a small point and ends up presenting three radical claims, each of which he calls a "wave" he must swim through without drowning. First wave: the female guardians must be trained alongside the men, in the same way, and serve in the same roles. Second wave: marriage and the family, for guardians, must be abolished — children held in common, parents not knowing their offspring, the loyalty of the household replaced by loyalty to the city. Third wave, the most difficult: cities will not be just until kings are philosophers, or philosophers are kings. He says it knowing the reaction will be derision.`,
      blurb: `Socrates is challenged on a passing remark and ends up making three radical proposals — each of which he calls a "wave" he must get through without drowning. Equal training for women guardians; marriage and children held in common among the ruling class; and the claim that real justice will only come when philosophers rule. The last is the most provocative and the one the rest of the dialogue must defend.`,
      summary: [
        `Socrates is about to move on when Polemarchus and Adeimantus interrupt. He has said in passing that the guardians' wives and children will be held in common — what does he mean by that? Socrates protests that this is a difficult subject. They press him. He surrenders, and the second half of the dialogue begins to take shape around three "waves" of argument, each more radical than the last.`,
        `The first wave: female guardians. If the gift for ruling does not depend on sex — and Socrates argues it does not — then women with the right nature must be trained alongside the men, in gymnastics as well as music, and serve in the same roles. He acknowledges this will look ridiculous to his audience (women exercising naked in the gymnasia was a real scandal). He says the ridicule does not matter if the argument is sound.`,
        `The second wave: the abolition of the family for the ruling class. The guardians will not marry; mating will be arranged by the rulers at festivals, the children raised in common, parents not knowing their own offspring. The point is to extend the loyalty of the household to the whole city — every child belongs to every guardian. The third wave, hardest of all: cities will not become just until philosophers rule them, or rulers become philosophers. Socrates says it expecting derision and gets it. Glaucon warns him to brace himself. The rest of the dialogue is, in large part, the defense of this third claim.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'glaucon', name: 'Glaucon' },
        { id: 'adeimantus', name: 'Adeimantus' },
      ],
      themes: [{ slug: 'philosopher-king', label: 'Philosopher-king' }, { slug: 'justice', label: 'Justice' }],
    },
    {
      n: 6,
      title: 'The philosopher described, and the divided line',
      tourTitle: 'The divided line',
      hook: 'What is a philosopher, anyway? And why are most cities so bad at producing them?',
      tour: `Socrates defines the philosopher: someone who loves truth more than money, honor, or pleasure; who studies what is unchanging rather than what merely seems. Adeimantus objects that real philosophers are useless or vicious. Socrates answers with two long images. The ship-of-fools: a crew that has tied up the only person who knows how to navigate, calling him a stargazer while they fight over the rudder. The divided line: a vertical scale of knowledge with shadows at the bottom and the Forms at the top, each level more real and more knowable than the one below. The Form of the Good is the source of intelligibility — the sun of the visible world.`,
      blurb: `Socrates defines what a philosopher actually is — a person who loves truth more than honor, money, or pleasure. Adeimantus objects that real philosophers seem useless or worse. Socrates responds with the image of the ship of fools and the divided line, a metaphysical scale that runs from shadows at the bottom to the Form of the Good at the top.`,
      summary: [
        `The third wave needs defense. Socrates begins by defining the philosopher more carefully. A philosopher loves truth — not the appearance of truth, not merely useful truth, but truth itself. The philosopher's loves are oriented upward: toward what is unchanging rather than what merely seems. This person, Socrates argues, is the only one fit to rule, because only this person sees clearly what is good for the whole.`,
        `Adeimantus pushes back. Look at actual philosophers, he says. Most are useless to their cities; some are positively bad. How can this be the right rulers? Socrates answers with the image of the ship of fools. Imagine a ship whose crew has tied up the only person on board who knows how to navigate. They are all fighting over the rudder, dismissing the navigator as a stargazer because he keeps looking at the heavens instead of at them. The navigator's apparent uselessness is not his fault; it is the crew's. So with philosophers in unjust cities — they are useless because the cities cannot use them.`,
        `Then Socrates turns to the metaphysics that explains all this. He draws a divided line: a vertical scale of being and knowing, with the visible world at the bottom (shadows, then physical objects) and the intelligible world at the top (mathematical objects, then the Forms). Each level of the line is more real and more knowable than the one below. The Form of the Good sits at the top, illuminating everything else — as the sun in the visible world makes the seeing of objects possible, the Good makes the knowing of Forms possible. The philosopher's whole life, Socrates says, is the climb from shadows to the Good. Most people never make it. The philosopher is whoever keeps climbing.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'adeimantus', name: 'Adeimantus' },
        { id: 'glaucon', name: 'Glaucon' },
      ],
      themes: [{ slug: 'philosopher-king', label: 'Philosopher-king' }, { slug: 'cave', label: 'Cave and Forms' }],
    },
    {
      n: 7,
      title: 'The cave',
      tourTitle: 'The cave',
      hook: 'The most famous image in Western philosophy — a cave, prisoners chained to face the wall, and the long climb out into the sun.',
      tour: `Socrates illustrates the climb described in Book Six with an image that has shaped two thousand years of thought. Imagine prisoners chained from birth to face the back wall of a cave. Behind them, a fire burns; people walk past carrying objects whose shadows fall on the wall. The prisoners take the shadows for reality. One is freed and dragged up out of the cave into the sunlight, where the real objects are. The first sight of the sun nearly blinds him. Eventually he sees clearly. Then — and this is Plato's argument for the philosopher's duty — he comes back down. The prisoners do not believe him. They will not be freed by anyone telling them what is true. They have to climb out themselves.`,
      blurb: `Socrates illustrates the philosophical ascent with an image. Prisoners chained from birth in a cave, taking the shadows on the wall for reality; one prisoner freed, climbing out, painfully seeing the sun for the first time, returning to free the others. The cave is education itself — and the unwillingness of the prisoners to believe their liberator is the dialogue's grim view of why most people stay where they are.`,
      summary: [
        `Imagine, Socrates says, a long underground cave. At the back of the cave, a row of prisoners is chained — they have been chained from infancy — facing the back wall, unable to turn their heads. Behind them, higher up, a fire burns. Between the fire and the prisoners, a low wall runs across the cave; people walk past it carrying objects, statues, animals, instruments, and the firelight throws the shadows of these objects onto the back wall the prisoners face. The prisoners have seen nothing else their whole lives. They give names to the shadows. They believe the shadows are reality.`,
        `Now suppose, he continues, one prisoner is freed. He turns, and the firelight is painful — he has never seen anything so bright. The objects passing before the fire seem less real to him than the shadows he has known. He is told these are the real things, and the shadows were only their shapes; he is unconvinced. He is forcibly dragged up out of the cave, up the long passage to the surface — and the sunlight nearly blinds him. He cannot look at anything. Eventually his eyes adjust. He looks first at shadows on the ground, then at reflections in water, then at objects, and finally — last — at the sun itself. And he understands: the sun is what made everything else visible. The whole structure of the world above the cave is now clear to him.`,
        `Then he goes back. He has to. He is not allowed to remain in the sunlight; the philosopher's duty is to return to the cave and free the others. He goes back down. His eyes have to readjust to the dark. The prisoners think he has been ruined by his journey out — his vision is now worse than theirs. He tries to tell them what he has seen. They will not believe him. If he persists, Socrates says, they may kill him. The dialogue is twenty years from Socrates's own death by hemlock when he says this. Plato is not being subtle.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'glaucon', name: 'Glaucon' },
      ],
      themes: [{ slug: 'cave', label: 'Cave and Forms' }, { slug: 'philosopher-king', label: 'Philosopher-king' }],
    },
    {
      n: 8,
      title: 'The four regimes, and how cities decline',
      tourTitle: 'The four falls',
      hook: 'A perfect city does not stay perfect. Here are the four ways it falls, and the four kinds of person each fall produces.',
      tour: `Socrates returns from the heights to political analysis. Even the just city, he says, will eventually decline — and there are exactly four ways it can fall. First into timocracy (rule by honor, the city of soldiers and ambition). Then into oligarchy (rule by money). Then into democracy (rule by appetite, by no one in particular, by everyone equally). And finally into tyranny — the worst regime, produced by democracy's excess of freedom. For each city Socrates describes the kind of person it produces: the timocratic man, the oligarchic, the democratic, the tyrannical. The descriptions are sharp and not always flattering.`,
      blurb: `Socrates returns from the metaphysics to the politics. He describes the four ways a just city declines — into timocracy, oligarchy, democracy, and tyranny — and the kinds of soul each regime produces. The descent is detailed and unsparing. Plato is famously hard on democracy here, and harder still on the tyrant who emerges from it.`,
      summary: [
        `Even the just city, Socrates says, will not last forever. The guardians will eventually miscalculate the breeding of the next generation; iron and bronze souls will sneak in; the rulers will lose the unity that held the city together. From there it falls — and the falls follow a sequence. There are exactly four corrupt regimes, in descending order, each worse than the last.`,
        `First, timocracy: rule by men who love honor more than truth. The guardians get greedy and start hoarding; the philosophical study is lost; courage and competition replace wisdom as the highest virtues. The timocratic man is ambitious, stiff, suspicious of his own appetites — like Sparta. Then oligarchy: rule by the rich. Property qualifications for office; the city splits into two cities, the rich and the poor, sharing a name but not a project. The oligarchic man is acquisitive, calculating, pinched.`,
        `Then democracy. The poor rise up, kill or banish the rich, distribute power equally, and live by the principle that every appetite is honored equally with every other appetite. Plato is famously unkind to democracy here — he calls it sweet, and means it as a complaint. The democratic city has no rulers, only personalities. Each person does as he pleases. There are no fixed virtues. Plato saw it as the regime of maximum disorder before tyranny — and he was right that tyranny would eventually emerge from it. Book Eight ends with that emergence beginning. The democracy, drunk on freedom, makes a man who promises to give everyone everything they want.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'glaucon', name: 'Glaucon' },
        { id: 'adeimantus', name: 'Adeimantus' },
      ],
      themes: [{ slug: 'decline', label: 'Decline of regimes' }],
    },
    {
      n: 9,
      title: 'The tyrant\'s soul, and the just life',
      tourTitle: 'The tyrant',
      hook: 'The tyrant gets what he wants and ends up the most miserable man alive — Socrates finally answers Glaucon\'s ring of Gyges.',
      tour: `Socrates completes the descent. The tyrant is the man who, in democracy, promised everything — and once installed, takes everything. His soul is the most disordered of all: ruled by appetite, terrified of betrayal, unable to trust anyone, at war with his own household and his own thoughts. Socrates argues, against three increasingly elaborate measures, that the tyrant is the most miserable of all men, and the just person the happiest — even if the just person is reviled and the tyrant honored. This is at last the answer to the ring of Gyges. The just life is good in itself, because justice is the order of a soul, and order is happiness.`,
      blurb: `Socrates finishes the descent: the tyrant, born from democracy, is the most miserable person alive because his soul is the most disordered. With the four falls described and the four kinds of soul named, Socrates can finally answer Glaucon's ring-of-Gyges challenge from Book Two. The just life is happier than the unjust, even when no one is watching, because justice is the order of a soul, and order is happiness.`,
      summary: [
        `The democratic man's son, Socrates says, becomes the tyrannical man. Raised in a household of total permissiveness, he loses any sense of which appetites should rule; the worst of them — the appetites that wake us in nightmares — are released. He can no longer order himself. He surrounds himself with flatterers. He cannot trust anyone, because he knows what he himself is willing to do. He lives in fear. The household becomes a small tyranny, then — if the man rises in the city — the city becomes one too.`,
        `Socrates makes the case that the tyrant is the most miserable of all human beings in three increasingly elaborate arguments. First, the tyrant's soul is the most disordered: appetite rules; reason, suppressed, can no longer guide. Second, the tyrant cannot enjoy what he has, because the parts of pleasure that depend on stability and self-trust have been destroyed. Third, only the philosopher can really judge the comparison, because only the philosopher has tasted all three kinds of pleasure (those of reason, spirit, and appetite); and the philosopher reports that the pleasures of reason are by far the best. By Plato's count, the just man is exactly 729 times happier than the tyrant.</p><p>Beneath the cheerful arithmetic is the real argument. Justice is good in itself — Glaucon's question from Book Two — because justice is the order of a soul, and order is the condition for any happiness at all.`,
        `The just life is therefore the happiest. Even if the just person is unrecognized and the tyrant honored, the just person has the better life, because their soul is in better shape. The unjust soul is at war with itself; the just soul is at peace; that is the difference, and it is the deepest thing that can be said. The Republic's central thesis is now defended. One book remains.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'glaucon', name: 'Glaucon' },
      ],
      themes: [{ slug: 'decline', label: 'Decline of regimes' }, { slug: 'justice', label: 'Justice' }],
    },
    {
      n: 10,
      title: 'Poetry banished, and the myth of Er',
      tourTitle: 'The myth of Er',
      hook: 'Two final movements — the case against poetry, and a vision of the soul after death.',
      tour: `Two more arguments before the dialogue ends. First, poetry: Socrates returns to the question he raised in Book Three and goes further. The poets imitate appearances; they train us to feel what we should not feel; they corrupt the soul. They must be banished from the just city. Then the dialogue closes with myth. Er is a soldier killed in battle who comes back from the dead and tells what he saw: souls choosing their next lives, wise old souls choosing wretched lives because they are tired, foolish young souls choosing tyranny because it looks splendid from the outside. The choice we make matters. We should choose well. The Republic ends.`,
      blurb: `Socrates closes with two final arguments. First, the case against poetry — three steps from reality, training the soul to feel wrongly. Then the dialogue ends in myth: the soldier Er, killed in battle, comes back from the dead and reports on the souls choosing their next lives. The Republic ends not in argument but in vision.`,
      summary: [
        `Socrates returns to the question he raised in Book Three and pushes it further: poetry must be banished from the just city. He has two arguments. First, the metaphysical one: a painter paints a bed; the carpenter makes the bed; the Form of the bed is the real thing the carpenter copies. The painter is therefore three steps from reality — an imitator of an imitator. The poet, similarly, imitates men's actions and appearances rather than understanding them. Imitations of imitations are at best entertaining, never instructive.`,
        `Second, the ethical argument, which Socrates considers the more serious. Poetry trains the soul to feel what it should not feel. We weep over Achilles's grief in the Iliad, and the part of us that should be governed by reason — the part that, in our own grief, would not break down — is exercised against itself. The tragic poets make us small. The comic poets make us spiteful. Lyric poetry makes us self-indulgent. The just city will banish them all and keep only hymns to the gods and praises of good men. Socrates says he is sorry; he loves Homer; the argument is the argument.`,
        `Then the dialogue closes with myth. A soldier named Er is killed in battle. Twelve days later, on his funeral pyre, he comes back to life and reports what he saw. Souls of the dead arrive at a place of judgment, are sent up to heaven or down to be punished, and after a thousand years return to choose their next lives. Er watches them choose. A wise old soul, exhausted by his last just life, picks a life of tyranny without reading the fine print. A foolish young soul picks a beautiful life that turns out to be cursed. Odysseus's soul, having been to the bottom of grief, picks the life of an ordinary private man and is satisfied at last. The choice is ours, Plato says. We should choose well. The Republic ends.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'glaucon', name: 'Glaucon' },
        { id: 'homer', name: 'Homer' },
      ],
      themes: [{ slug: 'poetry', label: 'Poetry' }, { slug: 'justice', label: 'Justice' }],
    },
  ],
}
