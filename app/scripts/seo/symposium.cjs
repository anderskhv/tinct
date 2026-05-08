// Symposium — SEO page data for build-seo-pages.cjs
// Plato, 8 sections, dialogue. Voice: literary, declarative, lighter than Republic — a drinking party.

module.exports = {
  id: 'symposium',
  title: 'Symposium',
  author: 'Plato',
  byline: 'c. 385 BCE · Greek philosophical dialogue',
  titleAccent: 'a guided tour',
  hook: 'Six men at a dinner party in Athens take turns making speeches in praise of love. Then a seventh man crashes in drunk and ruins the symmetry.',
  themesBlurb: 'Eros, the ladder of beauty, the myth of split halves, philosophy as longing.',
  castBlurb: 'A dinner party of seven',
  castDesc: 'Who is at the table, and what each of them says about love.',
  chapterLabel: n => `Section ${n}`,
  genre: ['Philosophical dialogue', 'Classical philosophy'],

  // -- Hub copy --
  about: [
    `<em>The Symposium</em> is the most celebrated dialogue Plato ever wrote about love. It is also a drinking party. The tragic poet Agathon has just won first prize at the Lenaia festival for his debut play, and on the second night of celebration his friends propose, since everyone is hung over from the night before, that they skip the heavy drinking and instead take turns making speeches in praise of Eros. Six men speak. Then Alcibiades arrives.`,
    `Each of the six speeches is a different theory of love. Phaedrus calls Eros the oldest god and the source of courage. Pausanias splits him into a heavenly and a common form. Eryximachus the doctor expands him into a cosmic principle. Aristophanes the comic playwright tells the myth of the original double creatures, split in half by Zeus, every human being since wandering in search of his missing other. Agathon delivers a virtuoso rhetorical performance. Socrates speaks last and refuses to praise Eros at all — instead he reports what a priestess named Diotima once told him: that love is not a god but a longing, and that the longing, properly followed, leads up a ladder from particular bodies to the eternal Form of Beauty itself. Then Alcibiades crashes in drunk and gives a seventh speech — not in praise of Eros but in praise of Socrates, the one man he could not seduce.`,
  ],
  chaptersSubtitle: 'All eight sections summarized — from the framing hearsay to Alcibiades at dawn.',
  chaptersLead: `<p>The Symposium is a single evening, but the speeches give it a clear shape. Section One sets the scene at three removes — Apollodorus tells a friend what Aristodemus told him about a party in 416 BCE. Sections Two through Six are the six prepared speeches, each a different account of love. Section Seven is the dialogue's philosophical summit: Socrates reporting Diotima's ladder of beauty. Section Eight is the catastrophe — Alcibiades arrives drunk and gives the dialogue its most personal speech, in praise not of Eros but of Socrates.</p>`,
  themesByline: 'Five threads through the dialogue',
  themesLead: `The Symposium has been read for two thousand years as the founding text of how the West thinks about love. These five threads run through the evening, and following any one of them organizes the rest.`,

  groups: [
    { label: 'Section 1 · The frame', subtitle: 'A party at three removes — and Socrates arriving late.', chapters: [1] },
    { label: 'Sections 2–4 · The first speeches', subtitle: 'Phaedrus, Pausanias, Eryximachus — love as honor, distinction, harmony.', chapters: [2, 3, 4] },
    { label: 'Sections 5–6 · The myth and the rhetoric', subtitle: 'Aristophanes\'s split halves, and Agathon\'s polish.', chapters: [5, 6] },
    { label: 'Sections 7–8 · The summit and the crash', subtitle: 'Diotima\'s ladder — and Alcibiades through the door.', chapters: [7, 8] },
  ],

  // -- Themes (5 essays) --
  themes: [
    {
      slug: 'ladder',
      title: 'The ladder of beauty',
      greek: '<em>Diotima\'s ascent</em> — from particular bodies to the Form of Beauty itself',
      preview: 'In the dialogue\'s philosophical summit, Socrates reports what the priestess Diotima taught him: that love is a longing, and that the longing, properly followed, leads up a ladder from one beautiful body to the eternal Form of Beauty.',
      essay: [
        `The ladder of beauty is the most ambitious argument in the Symposium and one of the most ambitious in all of philosophy. Socrates does not give it as his own. He attributes it to a priestess from Mantinea named Diotima who, he says, taught him about love years before. In a dialogue full of Athenian men praising Eros, the deepest account belongs to a woman who is not in the room.`,
        `The argument begins by demoting love. Eros is not a god, Diotima says. A god possesses what is good and beautiful; love is the longing for what is good and beautiful — which means it is not yet possessed. Love is therefore not divine but a great spirit, a <em>daimōn</em>, born of Plenty and Poverty at Aphrodite's birth-feast and forever in between. He is hungry but resourceful, neither rich nor destitute, always pursuing what slips away.`,
        `What Eros wants, finally, is immortality. Mortals cannot have eternity directly, so they reach for it through generation: bodies generating children, souls generating poems and laws and ideas. Both are forms of begetting in the beautiful. From here Diotima begins the ascent. You start by loving one beautiful body. You realize the beauty in that body is the same beauty in other bodies, and you learn to love physical beauty in general. You ascend to the beauty of souls, then to the beauty of laws and institutions, then to the beauty of knowledge, and finally — last — to beauty itself. Eternal. Neither growing nor decaying. The source from which everything beautiful borrows.`,
        `The ladder is the founding text of what we still call Platonic love. It is not the rejection of physical attraction; it is the claim that physical attraction is the first rung of a staircase that leads, if you keep climbing, to the contemplation of the eternal. Most people stop on the first rung. The philosopher is whoever keeps going up.`,
      ],
      where: [
        { n: 7, label: 'Section 7 (the ladder itself)' },
        { n: 6, label: 'Section 6 (the speech it answers)' },
      ],
    },
    {
      slug: 'split-halves',
      title: 'The myth of the split halves',
      greek: 'Aristophanes\'s account — and why Plato gives the most beautiful speech to the wrong answer',
      preview: 'Aristophanes tells the most quoted story in the dialogue: humans were originally double creatures, split by Zeus, every one of us ever since wandering in search of our missing half. Plato gives him the most charming speech precisely because he wants to refute the most attractive error.',
      essay: [
        `The Aristophanes speech is the most quoted passage in the Symposium and probably the most quoted thing Plato ever wrote. The image has become so much a part of how we talk about love that most of the people repeating it have no idea where it came from.`,
        `Originally, Aristophanes says, there were three sexes, not two: male, female, and a combined form, the <em>androgynous</em>. Each was a sphere with four arms, four legs, two faces looking opposite ways, and the strength to challenge the gods. Zeus, threatened by them, split each one in half down the middle, then had Apollo turn each face toward the wound so they would always remember. Ever since, every human walks the earth as half of something, looking for the other half. When two halves find each other, they cling and refuse to let go. That clinging, says Aristophanes, is what we call love.`,
        `It is a beautiful story, and a wrong one. Plato has Diotima refute it directly two speeches later. Lovers, she points out, do not actually want to merge with their other half — what they want is the good. Tell a lover that their beloved is bad for them, and the love eventually fades; tell them that their beloved makes them better, and the love deepens. Love is not the search for our missing piece. Love is the search for what is good. The two can look the same in early infatuation but they come apart under pressure.`,
        `Plato's strategy is precise. He gives Aristophanes the most charming speech in the dialogue because the myth of split halves is the most attractive version of the wrong answer. If you don't think hard, the myth feels right; you have probably felt, at some point, that someone you loved was a missing piece. The Symposium is, in part, an argument that this feeling is misleading you about what love is for.`,
      ],
      where: [
        { n: 5, label: 'Section 5 (the myth told)' },
        { n: 7, label: 'Section 7 (Diotima\'s correction)' },
      ],
    },
    {
      slug: 'speeches-as-mirrors',
      title: 'Each speech reveals its speaker',
      greek: 'six men praise love, and reveal themselves',
      preview: 'The Symposium\'s deepest technique is that each speaker, asked to define love, ends up defining himself. Phaedrus the enthusiast, Pausanias the apologist, Eryximachus the systematizer — every speech is a self-portrait disguised as a theory.',
      essay: [
        `Plato is one of the most careful prose writers in antiquity, and the order and content of the speeches in the Symposium are not arbitrary. Each speaker, asked to define Eros, ends up defining himself. The speeches are theories of love and self-portraits at the same time.`,
        `Phaedrus speaks first because he proposed the topic; he is an enthusiast for fine speeches and so he gives a heroic, slightly conventional one — Eros is the oldest god, the inspiration to die for one's beloved. Pausanias, who is in a long-standing relationship with Agathon, splits Eros into two — common and heavenly — in a way that conveniently justifies his own kind of attachment. Eryximachus the doctor turns love into a cosmic principle of harmony, expanding it from the human body outward to medicine, music, and astronomy; the speech is exactly the kind of speech a physician with too much theory would give.`,
        `Aristophanes the comic playwright tells a comic myth that is also genuinely moving, the only speech in the dialogue that catches what we call romantic feeling. Agathon the young tragic poet, just off his prizewinning debut, gives a virtuoso rhetorical performance — beautifully balanced, completely empty, exactly what you would expect from a young man who has just won first prize for his looks. Socrates dismantles it in three questions, then refuses to praise Eros at all, claiming instead to report what a priestess told him. Even his self-effacement is a self-portrait.`,
        `Then Alcibiades arrives drunk and gives the seventh speech — not in praise of Eros but in praise of Socrates, the one man he could not seduce. The speech is the most personal in the dialogue because it is the only one not pretending to be about love in general. It is about a specific man being loved by a specific other, and failing.`,
      ],
      where: [
        { n: 2, label: 'Section 2 (Phaedrus)' },
        { n: 3, label: 'Section 3 (Pausanias)' },
        { n: 4, label: 'Section 4 (Eryximachus)' },
        { n: 6, label: 'Section 6 (Agathon)' },
      ],
    },
    {
      slug: 'alcibiades',
      title: 'Alcibiades and the limits of philosophy',
      greek: 'the man Socrates could not save',
      preview: 'Alcibiades crashes the party drunk and delivers the seventh speech: a confession, in front of everyone, about the night he tried to seduce Socrates and was gently refused. It is the most personal speech in Plato — and a witness to philosophy\'s limit.',
      essay: [
        `Alcibiades arrives in Section Eight propped up between a flute-girl and another reveler, garlanded with ivy and violets, very drunk. He is shown to a couch and is settling in before he notices Socrates is already there — at which point he flinches as if caught. The flinch sets the speech in motion. He cannot praise Eros after Socrates has just spoken about him; instead, he says, he will praise Socrates.`,
        `The speech that follows is the most personal thing in all of Plato. Alcibiades compares Socrates to a Silenus statue — ugly outside, hiding a god within. He recounts Socrates's superhuman endurance on campaign at Potidaea: standing all night thinking through a problem, walking barefoot in the snow without complaint, saving Alcibiades's life in battle and refusing the prize that should have been his. And he tells the story he has been carrying alone: the night he tried to seduce Socrates, having engineered every possible excuse for the two of them to be alone, and was gently and devastatingly refused. Socrates lay beside him through the night, Alcibiades says, the way a brother would lie beside a brother.`,
        `Plato's audience knew exactly who Alcibiades was when they read this. He was the most gifted Athenian of his generation — beautiful, brilliant, ruinously charismatic — and the man whose vanity persuaded Athens to launch the catastrophic Sicilian Expedition the year after this party. He defected to Sparta, then to Persia, and helped destroy the city that had loved him. The dialogue is set in 416, the very last year before everything fell. Plato is showing us a young man who knew exactly what he should do and chose otherwise.`,
        `The speech is a witness to philosophy's limit. Socrates can refuse the seduction; he cannot save the man from himself. Alcibiades knows the good and reaches for the splendid. Knowing is not enough — and the dialogue, which has just spent six speeches praising love as the soul's ladder upward, ends by showing us a soul that climbed partway and then jumped.`,
      ],
      where: [
        { n: 8, label: 'Section 8 (the speech)' },
      ],
    },
    {
      slug: 'philosophy-as-eros',
      title: 'Philosophy itself as a kind of love',
      greek: 'wisdom is what the philosopher does not yet have — and reaches for',
      preview: 'The word philosopher means lover of wisdom. The Symposium takes the etymology seriously. Philosophy is not the possession of truth but the longing for it — and Eros, the great in-between spirit, is the figure of that longing.',
      essay: [
        `The word <em>philosophos</em> means, literally, lover of wisdom. Most of Plato's dialogues use the word without dwelling on the metaphor. The Symposium is the dialogue that takes it seriously.`,
        `Diotima's account of Eros in Section Seven is, by extension, an account of the philosopher. Eros is neither a god nor a mortal but a great spirit between them — neither beautiful nor ugly, neither wise nor ignorant, always reaching for what he lacks. So with the philosopher. The truly wise (the gods) do not philosophize because they already possess wisdom. The truly ignorant do not philosophize because they do not know what they are missing. Philosophy is a middle condition: aware that one does not know, longing for what one has glimpsed, never finally arriving.`,
        `This reframes a great deal. The philosophical life is not the possession of truth but the structured pursuit of it. The philosopher and the lover are doing the same thing, only at different rungs of the same ladder. The young man who stops on the street to look at someone beautiful and the old man bent over a problem at his desk are both, in Plato's view, expressing one drive — the longing for the good, dressed in different clothes.`,
        `It also explains why Socrates is the figure of philosophy in this dialogue and not merely its mouthpiece. He arrives late because he has stopped on a porch to think. He stays sober while everyone else gets drunk. He listens to all six speeches before refusing to add his own. And at dawn, when everyone else has fallen asleep, he is still arguing — and then he gets up and walks to the gymnasium to begin his ordinary day. The whole evening is an image of what philosophy looks like: a longing that keeps going after every other longing has fallen asleep.`,
      ],
      where: [
        { n: 7, label: 'Section 7 (Eros as in-between)' },
        { n: 1, label: 'Section 1 (Socrates arriving late)' },
        { n: 8, label: 'Section 8 (Socrates the last awake)' },
      ],
    },
  ],

  // -- Key figures (summary preview) --
  keyFigures: [
    { name: 'Socrates', role: 'The last to speak', body: `Arrives at the party late, having stopped on a neighbor's porch to think through a problem. Refuses to give his own speech and instead reports what the priestess Diotima of Mantinea once told him about love. He is the only sober man at the end of the night.` },
    { name: 'Alcibiades', role: 'Who arrives drunk', body: `The most gifted and most disastrous Athenian of his generation. Bursts in late, garlanded, demanding wine. Gives the seventh speech — not in praise of Eros but in praise of Socrates, the one man he could not seduce.` },
    { name: 'Aristophanes', role: 'The comic playwright', body: `The author who had mocked Socrates a decade earlier in <em>The Clouds</em>. Arrives with hiccups and has to wait his turn. Tells the myth of split halves — the most quoted speech in the dialogue.` },
    { name: 'Diotima', role: 'The absent teacher', body: `A priestess from Mantinea whom Socrates says taught him about Eros years before. She is not in the room. In all of Plato, she is the only figure who teaches Socrates rather than being taught by him.` },
    { name: 'Agathon', role: 'The host', body: `A young tragic poet celebrating his prizewinning debut. Beautiful, polished, slightly empty. Gives the rhetorical performance Socrates dismantles in three questions before reporting Diotima.` },
    { name: 'Phaedrus', role: 'Who proposed it', body: `The young man who suggested the evening of speeches in praise of Eros. He gives the first one — earnest, conventional, framing a topic the others will spend the night escalating beyond him.` },
  ],

  // -- Cast (full page) --
  castSubtitle: 'A dinner party of seven, told at three removes.',
  castLead: `<p>The Symposium is presented at a careful distance. Apollodorus tells a friend what Aristodemus told him about a party Aristodemus attended years earlier. Plato wrote it around 385 BCE about a party that took place in 416 — the year before Alcibiades's catastrophic Sicilian Expedition and the unraveling of Athens. The frame is part of the meaning. The dialogue is preserving the evening across distance.</p>
      <p>Six men speak in praise of Eros: Phaedrus, Pausanias, Eryximachus, Aristophanes, Agathon, Socrates. A seventh, Alcibiades, arrives drunk after the speeches are finished and praises not Eros but Socrates. A priestess named Diotima is quoted at length within Socrates's speech but never appears.</p>`,
  castGroups: [
    {
      label: 'The speakers',
      subtitle: 'Everyone who delivers a speech across the evening.',
      characters: [
        { id: 'socrates', tag: 'Speaker', name: 'Socrates', epithet: 'The last to speak', body: `Plato's Socrates, in his early fifties at the time of the party. Arrives late because he has stopped on a neighbor's porch to think through a problem. He refuses to praise Eros directly and instead reports what the priestess Diotima of Mantinea taught him: that love is a longing, not a god, and that the longing leads up a ladder from particular bodies to the eternal Form of Beauty itself. He drinks all night without getting drunk and is the last one awake at dawn.`, appearsLabel: 'Throughout.', appears: [1, 6, 7, 8] },
        { id: 'alcibiades', tag: 'Speaker', name: 'Alcibiades', epithet: 'Who arrives drunk', body: `The most gifted Athenian of his generation — beautiful, brilliant, ruinously charismatic, and within the year a defector to Sparta. Bursts in after the six speeches are finished, propped up between a flute-girl and another reveler, garlanded with ivy and violets. Sees Socrates already on the couch and flinches. Then gives the seventh speech, in praise not of Eros but of Socrates — including a confession, in front of everyone, about the night he tried to seduce him and was gently refused.`, appears: [8] },
        { id: 'aristophanes', tag: 'Speaker', name: 'Aristophanes', epithet: 'The comic playwright', body: `The author of <em>The Clouds</em>, which had mocked Socrates a decade earlier and contributed to the public hostility that would later kill him. Arrives at the party with hiccups severe enough to require swapping his speaking slot with Eryximachus. Tells the myth of the split halves — the most quoted speech in the dialogue and the one Plato gives him precisely because it is the most beautifully wrong account on offer.`, appears: [4, 5, 8] },
        { id: 'agathon', tag: 'Speaker', name: 'Agathon', epithet: 'The host', body: `A young tragic poet celebrating the prize his first play has just won at the Lenaia. Beautiful, polished, generous host. Delivers the speech immediately before Socrates — full of balanced clauses and mythological flourishes, asserting that Eros is the youngest and most delicate of the gods. Socrates dismantles it in three questions. The contrast between Agathon's polish and Diotima's substance is the dialogue's central technique.`, appears: [1, 6, 8] },
        { id: 'phaedrus', tag: 'Speaker', name: 'Phaedrus', epithet: 'Who proposed it', body: `The young man whose enthusiasm for speeches gave the evening its shape. Eryximachus credits him with proposing the topic. He gives the first speech — Eros is the oldest god, the source of courage, the inspiration to die for one's beloved — earnest and slightly conventional, framing a topic the others will spend the rest of the night escalating beyond him.`, appears: [1, 2, 5] },
        { id: 'pausanias', tag: 'Speaker', name: 'Pausanias', epithet: 'The apologist', body: `A sophist and Agathon's long-standing partner. Gives the second speech, which splits Eros into two — Heavenly and Common — in a way that conveniently defends the kind of attachment he himself is in, and criticizes Athenian ambivalence about it. The speech reads partly as a theory of love and partly as an apologia for his own life.`, appears: [3] },
        { id: 'eryximachus', tag: 'Speaker', name: 'Eryximachus', epithet: 'The doctor', body: `A physician who steps in to the speaking order while Aristophanes recovers from his hiccups. Takes Pausanias's distinction between two Eroses and expands it into a cosmic principle — love as the harmony that governs medicine, music, astronomy, and even divination. Exactly the speech a doctor with too much theory would give.`, appears: [1, 4] },
      ],
    },
    {
      label: 'The frame and the absent',
      subtitle: 'Names that bear the dialogue without speaking in it.',
      characters: [
        { id: 'apollodorus', tag: 'Narrator', tagClass: 'creature', name: 'Apollodorus', epithet: 'The narrator at one remove', body: `A devoted follower of Socrates who relays the entire evening to a friend years later. He was not present at the party — he is recounting what Aristodemus told him. He calls himself, only half-jokingly, obsessed with Socrates and his conversations. The dialogue's first words are his.`, appears: [1] },
        { id: 'aristodemus', tag: 'Eyewitness', tagClass: 'creature', name: 'Aristodemus', epithet: 'The eyewitness', body: `A small, barefoot devotee of Socrates whom Socrates picks up on the road and brings along uninvited to Agathon's party. He is the primary eyewitness, the source from whom Apollodorus has the whole story. He falls asleep before dawn and so does not catch the very last conversation.`, appears: [1, 8] },
        { id: 'diotima', tag: 'Quoted', tagClass: 'creature', name: 'Diotima', epithet: 'The absent teacher', body: `A priestess from Mantinea whom Socrates says taught him about Eros years before. She is not in the room. She is, in all of Plato, the only figure who teaches Socrates rather than being taught by him. In a dialogue full of Athenian men praising love, the deepest account belongs to a woman who is not there. The ladder of beauty is hers, not his.`, appears: [7] },
      ],
    },
  ],

  // -- Sections (8) --
  chapters: [
    {
      n: 1,
      title: 'The frame, and Socrates arriving late',
      tourTitle: 'The frame',
      hook: 'A party at three removes — and the host\'s guest of honor stops on the porch next door to think.',
      tour: `Apollodorus tells a friend what Aristodemus told him about a party Aristodemus attended years earlier. The frame is deliberate: Plato is preserving the evening across distance. The party itself takes place in Agathon's house the night after his prizewinning debut. Socrates, on his way there, picks up Aristodemus and brings him along uninvited. Then Socrates stops on a neighbor's porch, falls into one of his standing trances, and refuses to come in until the meditation finishes. Aristodemus arrives alone, is welcomed warmly anyway, and the host orders that Socrates be left in peace until he is ready. By the time Socrates joins them, dinner is half over. Eryximachus suggests they dismiss the flute-girl and take turns, instead, making speeches in praise of Eros.`,
      blurb: `Apollodorus relays the evening at three removes — what Aristodemus told him about a party Aristodemus attended in 416 BCE. Socrates is invited to the host's house; he picks up Aristodemus on the way; then, halfway there, he stops on a neighbor's porch to think and arrives at dinner half over. After the meal, with everyone hung over, Eryximachus proposes that each guest deliver a speech in praise of Love. Phaedrus is on the leftmost couch and will begin.`,
      summary: [
        `Apollodorus is on his way into Athens when a friend stops him to ask about the famous evening at Agathon's — the one with Socrates, Alcibiades, and the speeches on love. Apollodorus says he has the story by heart; he heard it from Aristodemus, the small barefoot man who was actually there. He warns his friend that he is, by general consensus, slightly mad on the subject of Socrates. Then he begins.`,
        `Aristodemus, he says, ran into Socrates on the road one day, freshly bathed and in his good sandals — both unusual. Socrates explained he was on his way to Agathon's, who was celebrating his prize at the Lenaia. Why so well-dressed? To be a beautiful man among beautiful men, Socrates said. He invited Aristodemus to come along uninvited. Then, halfway to Agathon's house, Socrates fell quiet, stopped on a neighbor's porch, and would not move. Aristodemus walked on alone. Agathon welcomed him gracefully and sent a slave to fetch Socrates. The slave came back saying Socrates was standing motionless and refused to be disturbed. Leave him, Agathon said. He does this. Dinner began.`,
        `Halfway through the meal Socrates appeared, took the couch beside Agathon, and the two traded compliments about whose wisdom was the greater. After dinner the men considered how heavily to drink — most, Eryximachus among them, were still hung over from the night before. Pausanias suggested a light night. Eryximachus seconded it and proposed they send the flute-girl away and entertain themselves differently: each man, in turn, will deliver the finest speech he can in praise of Eros. Phaedrus, says Eryximachus, has been complaining for weeks that no one writes hymns to Love. Tonight they will fix that. The proposal is accepted.`,
      ],
      appears: [
        { id: 'apollodorus', name: 'Apollodorus' },
        { id: 'aristodemus', name: 'Aristodemus' },
        { id: 'socrates', name: 'Socrates' },
        { id: 'agathon', name: 'Agathon' },
        { id: 'eryximachus', name: 'Eryximachus' },
        { id: 'phaedrus', name: 'Phaedrus' },
      ],
      themes: [{ slug: 'philosophy-as-eros', label: 'Philosophy as eros' }],
    },
    {
      n: 2,
      title: 'Phaedrus — Eros, the oldest god',
      tourTitle: 'Phaedrus',
      hook: 'The man who proposed the topic speaks first. Love is the oldest god, he says, and the only one who can make a man die well.',
      tour: `Phaedrus, having proposed the evening, speaks first. His argument is heroic and slightly conventional: Eros is the oldest of the gods — older than memory, older than Hesiod's Chaos and Earth — and is therefore the source of the greatest goods. Above all, Phaedrus says, Eros makes lovers brave. A man will not act shamefully in front of his beloved; an army of lovers, if such a thing existed, would be invincible. He cites Alcestis, who chose to die in her husband's place when no one else would, and Achilles, who chose to die avenging Patroclus. Love makes the willing sacrifice possible. It is the highest proof of virtue and the source of every noble action.`,
      blurb: `Phaedrus delivers the first speech. Eros is the oldest of the gods, he argues, older than memory and older than Hesiod's Chaos and Earth — and the source of the greatest human goods. Above all, Love produces the courage to die well. He cites Alcestis dying for her husband Admetus and Achilles for Patroclus. The speech is earnest, conventional, slightly wooden, and sets the rest of the evening up to escalate beyond it.`,
      summary: [
        `Phaedrus begins where every Greek speech begins — with the gods and the ancient poets. Eros, he says, is the oldest of all the gods. No poet has ever named his parents because there were none; he simply was, before the others, a power before there were powers. Hesiod puts him just after Chaos and Earth in the order of creation. And whoever is oldest is the source of the greatest goods. So Eros is, of all the gods, the one most responsible for what is best in human life.`,
        `What Eros gives, Phaedrus continues, is the willingness to be ashamed in front of one's beloved. Nothing else makes a man behave better. He will not let himself be seen as a coward, or vain, or petty. The presence of the beloved is a stricter discipline than any law. An army of lovers — though no city has ever managed to build one — would be unbeatable, because no man would flee while his beloved was watching. Love makes virtue possible at the moment when nothing else can.`,
        `Phaedrus closes with two examples and a third. Alcestis, the only person willing to die in her husband Admetus's place, was so honored by the gods that they sent her back from the underworld — a thing they almost never do. Achilles, knowing his death was certain if he killed Hector, chose to kill Hector anyway because Patroclus had been killed; he chose to die avenging the man he loved. Even Orpheus, who tried to bring Eurydice out of Hades by cleverness rather than dying for her, was punished by the gods for his cowardice — half-measures in love are not enough. Love is the willing sacrifice or it is nothing. So says Phaedrus, and the next speaker rises.`,
      ],
      appears: [
        { id: 'phaedrus', name: 'Phaedrus' },
      ],
      themes: [{ slug: 'speeches-as-mirrors', label: 'Each speech reveals its speaker' }],
    },
    {
      n: 3,
      title: 'Pausanias — the heavenly and the common',
      tourTitle: 'Pausanias',
      hook: 'There are two Eroses, says Pausanias. One serves the body and ends with it. The other serves the soul and lasts.',
      tour: `Pausanias rises and immediately corrects Phaedrus. The question is wrongly framed, he says. There is not one Eros to praise but two, corresponding to the two Aphrodites Greek religion already recognizes — Aphrodite Pandemos (Common) and Aphrodite Ourania (Heavenly). Common Love is indiscriminate, drawn to bodies regardless of soul, satisfied in the moment and gone. Heavenly Love is older, drawn to mind and character, slow to begin and slow to end; it makes both lover and beloved better. Pausanias spends most of the speech defending the kind of attachment he himself is in — long, mentor-like, with Agathon — and criticizing Athenian ambivalence about the practice. The speech is partly philosophy and partly self-justification.`,
      blurb: `Pausanias argues the question is wrongly put: there is not one Eros but two, corresponding to the two Aphrodites Greek religion already recognizes. Common Love is physical and indiscriminate; Heavenly Love is directed toward soul and intellect and makes both parties better. Pausanias is in a long-standing relationship with Agathon, the host, and the speech reads partly as theory, partly as apologia for his own life.`,
      summary: [
        `Pausanias begins by complaining that Phaedrus has framed the question badly. We cannot praise Love simply, he says, as if there were only one Love to praise. Greek religion already knows there are two Aphrodites — Pandemos, the Common, and Ourania, the Heavenly. Each Aphrodite has her own Eros. To praise Love truthfully you must distinguish them.`,
        `Common Love is what most people mean when they say they are in love. It is drawn to bodies, satisfied in the moment, indifferent to the character of the beloved, and as quick to fade as it was to arrive. It is the Love of inferior men. Heavenly Love is something else. It is drawn to the soul rather than the body, to intelligence and steadiness rather than youthful beauty, and it lasts. The Heavenly lover takes a young man whose mind he respects and devotes himself to making that young man better — a true mentor — and the relationship endures because what they share is character, not appetite.`,
        `Pausanias then turns to Athenian custom, which he says is confused. In some cities — Sparta, Boeotia, Elis — relationships between men and youths are celebrated; in others, where the Persians rule, they are forbidden, because rulers fear the loyalty such bonds produce. Athens is in between: it both encourages and disapproves. The right rule, Pausanias says, distinguishes by motive. A youth who yields for money or favor is shamed; a youth who yields because the lover has genuinely improved him is honored. By the end the defense of the kind of attachment Pausanias is in is transparent. He sits down. Aristophanes is to speak next but has the hiccups.`,
      ],
      appears: [
        { id: 'pausanias', name: 'Pausanias' },
      ],
      themes: [{ slug: 'speeches-as-mirrors', label: 'Each speech reveals its speaker' }],
    },
    {
      n: 4,
      title: 'Eryximachus — love as cosmic harmony',
      tourTitle: 'Eryximachus',
      hook: 'The doctor expands love into a cosmic principle — the harmony between opposites, governing medicine, music, and the stars.',
      tour: `Aristophanes was supposed to go next but is incapacitated by hiccups, so he swaps places with Eryximachus the doctor and asks for medical advice — sneeze, says Eryximachus, that should clear it. Eryximachus then takes Pausanias's distinction between two Eroses and expands it into a universal theory. Love is not only the principle of attraction between souls but the principle of harmony in everything. In medicine, music, farming, astronomy, even divination — wherever opposites must be reconciled, that is Heavenly Love. Common Love produces sickness and discord. Eryximachus speaks at the great length of a man with a theory that fits everything.`,
      blurb: `The doctor takes Pausanias's two-Eros distinction and expands it into a cosmic theory. Heavenly Love is the harmony between opposites that governs medicine, music, the rhythms of the year, astronomy, and divination; Common Love is the same opposites unbalanced into disease, discord, and crop failure. The speech is exactly the speech a physician with too much theory would give — and his patient, the hiccupping playwright, is waiting impatiently in the wings.`,
      summary: [
        `Aristophanes was meant to speak next but a fit of hiccups has him at Eryximachus's mercy. Eryximachus offers two cures: hold your breath, or induce a sneeze with a feather. Aristophanes nods and the swap is made. Eryximachus rises in his place. He compliments Pausanias's distinction between Heavenly and Common Love but says it does not go far enough. The two Loves are not just two human attachments. They are two principles that operate everywhere there are opposites to be reconciled.`,
        `In medicine, Eryximachus says, the body is a mass of opposites — hot and cold, wet and dry, full and empty. The physician's whole art is to know which opposites in a given body need to be reconciled and how. That reconciliation is Heavenly Love at work. Common Love is the disordered version — the hot growing too hot, the body unbalanced into sickness. The doctor's job is to take Common Love and convert it, where possible, into Heavenly. So with music: the composer reconciles high and low, fast and slow; without that reconciliation, there is no music. So with the rhythms of the year — when winter and summer reconcile, the harvest comes; when Common Love prevails between them, plagues arrive.`,
        `He finishes by extending the theory into divination. Religion, Eryximachus says, is the science of preserving Heavenly Love between gods and men. When relations between humans and gods are healthy, the city flourishes; when they are diseased — when humans honor Common Love over Heavenly — the gods send signs of displeasure. The seer's whole work is reading those signs and prescribing remedies. The speech keeps expanding outward; one feels Eryximachus could go on. Eventually he sees Aristophanes signaling that the hiccups are gone. He yields the floor.`,
      ],
      appears: [
        { id: 'eryximachus', name: 'Eryximachus' },
        { id: 'aristophanes', name: 'Aristophanes' },
      ],
      themes: [{ slug: 'speeches-as-mirrors', label: 'Each speech reveals its speaker' }],
    },
    {
      n: 5,
      title: 'Aristophanes — the myth of the split halves',
      tourTitle: 'The split halves',
      hook: 'The most famous speech in the dialogue. We were once double — four-armed, four-legged, two-faced. The gods cut us in half, and we have been looking for our other piece ever since.',
      tour: `Aristophanes, hiccups cured, takes a different approach. He will not analyze Eros philosophically; he will tell a story. Once there were three sexes, not two — male, female, and the combined androgynous form. Each was a sphere with four arms, four legs, and two faces, immensely strong, and proud enough to challenge the gods. Zeus, threatened, split each one in half and had Apollo turn each face toward the wound so it would always be visible. Ever since, every human walks the earth as half of something, longing for the other half. When two halves find each other they cling. That clinging, says Aristophanes, is what we call love — and it is also why we sometimes love men, sometimes women: depending on which original whole we were cut from.`,
      blurb: `The most quoted speech in the dialogue. Aristophanes tells the myth of the original double creatures — four-armed, four-legged, two-faced, immensely strong — split by Zeus as punishment for their pride, every human ever since wandering in search of the missing other half. Plato gives him the most beautiful speech because the myth is, in the dialogue's larger argument, the most attractive version of what Plato thinks is the wrong answer about love.`,
      summary: [
        `Aristophanes warns the others that he is going to give a different kind of speech. He is the comic playwright; he will tell a comic story; but it is one they have not heard before, and they should listen carefully. Once, the human race was different. There were three sexes, not two. There was male, descended from the sun. There was female, descended from the earth. And there was a combined sex, the <em>androgynous</em>, descended from the moon, made of one half of each. Each of these beings was a sphere — round body, four arms, four legs, two faces looking opposite directions on a single neck. They could run by tumbling, like acrobats. They were immensely strong, and proud enough to climb up to heaven and attack the gods.`,
        `Zeus considered destroying them with thunderbolts but decided he would lose the worship he received from them. Instead, he said, I will cut them in half, and they will be weaker and twice as numerous — twice the worshipers. Apollo split each one down the middle, turned the face around toward the wound, and pulled the skin together over the belly and tied it at what we now call the navel. The halves, finding themselves alone, would do nothing but throw their arms around any other half they could find and try to grow back together; they refused to eat, refused to work, and were dying. Zeus took pity and moved their reproductive organs to the front so that, in their embracing, they could at least conceive — and find some satisfaction.`,
        `Every one of us, Aristophanes says, is one of these halves. The men cut from the all-male sphere love men. The women cut from the all-female love women. Those cut from the androgynous love the opposite sex. What we call love is the longing to find our other half and become whole again. If Hephaestus stood over a pair of lovers with his welding tools and asked them whether they wanted to be permanently fused into one being, they would say yes without hesitation — that is what they have wanted all their lives, only without knowing it. Behave well, Aristophanes warns at the end, or Zeus may cut us in half again. The speech is greeted with affection and applause.`,
      ],
      appears: [
        { id: 'aristophanes', name: 'Aristophanes' },
        { id: 'phaedrus', name: 'Phaedrus' },
      ],
      themes: [{ slug: 'split-halves', label: 'The split halves' }, { slug: 'speeches-as-mirrors', label: 'Each speech reveals its speaker' }],
    },
    {
      n: 6,
      title: 'Agathon — the polished speech, dismantled',
      tourTitle: 'Agathon',
      hook: 'The young tragic poet gives a virtuoso rhetorical performance. Socrates dismantles it in three questions.',
      tour: `Agathon, the host, gives the speech immediately before Socrates. It is exactly the speech a young prizewinning tragedian would give — balanced clauses, mythological flourishes, wave after wave of poetic praise. Eros, he says, is the youngest of the gods, the most beautiful, the most delicate, the most just, the source of every fine thing in heaven and on earth. The audience applauds warmly. Then Socrates rises and asks three quiet questions. Is Eros love of something, or of nothing? — Of something. Does Eros desire what he has, or what he lacks? — What he lacks. Then if Eros is love of beauty, can Eros himself be beautiful? — He cannot. The speech is undone in three exchanges.`,
      blurb: `Agathon, the host, delivers a virtuoso rhetorical performance — Eros as youngest, most beautiful, most delicate, most just of the gods. Socrates praises the polish, then dismantles it in three quiet questions: is love of something or nothing? Does it desire what it has or what it lacks? If love is love of beauty, can love itself be beautiful? The whole speech collapses in three exchanges. Socrates announces he will now report what Diotima once taught him.`,
      summary: [
        `Agathon begins by complaining that all the previous speakers have praised the gifts of Eros — courage, harmony, wholeness — without first praising Eros himself. He will reverse the order: first the god, then the gifts. He proceeds in elegant balanced clauses. Eros is the youngest of the gods, not the oldest as Phaedrus claimed; only youth could love beauty. Eros is the most beautiful, because he dwells only in what is beautiful. He is the most delicate, because he steps lightly through the soft places of the soul. The most just, the most temperate, the most courageous, the wisest — Agathon goes through all four cardinal virtues and assigns each to Eros in turn. The audience applauds.`,
        `Socrates praises the speech politely and then says he is in trouble. He had agreed to praise Eros not knowing that praising, in this room, apparently meant heaping every fine thing in existence onto the subject regardless of whether the subject actually has it. He thought praising was telling the truth about something. Could he ask Agathon a few questions before he speaks? Of course. The questions are simple. Is love love of something, or of nothing? Of something. Does that something belong to love or not? It is what love wants, so love does not have it. Then love lacks what it loves. And what does love love? Beauty. Then love lacks beauty. Then love is not itself beautiful. Three questions and the speech is undone. Agathon, still gracious, admits he had no idea what he was talking about.`,
        `Now, Socrates says, he will tell the truth about Eros, but he cannot do it on his own authority. Years ago a priestess from Mantinea named Diotima — who once delayed the plague at Athens by ten years through her sacrifices — taught him about love. He was as confused then as Agathon is now, and she put him through the same questions. He will report what she said. The dialogue's tone shifts; the comic phase of the evening is over.`,
      ],
      appears: [
        { id: 'agathon', name: 'Agathon' },
        { id: 'socrates', name: 'Socrates' },
      ],
      themes: [{ slug: 'speeches-as-mirrors', label: 'Each speech reveals its speaker' }, { slug: 'ladder', label: 'The ladder of beauty' }],
    },
    {
      n: 7,
      title: 'Socrates and Diotima — the ladder of beauty',
      tourTitle: 'Diotima\'s ladder',
      hook: 'The dialogue\'s philosophical summit. Eros is not a god but a longing — and the longing leads, if followed, all the way up to the eternal Form of Beauty.',
      tour: `Socrates reports the teaching he received from the priestess Diotima of Mantinea. First, the demotion: Eros is not a god. A god possesses the good and beautiful; Eros only longs for them, which means he does not yet have them. Eros is a great spirit between gods and men, a <em>daimōn</em> — born of Plenty and Poverty at Aphrodite's birth-feast, always hungry, always resourceful. What Eros wants, finally, is immortality. Mortals reach for it through generation: bodies generating children, souls generating works. Then Diotima describes the ascent — from one beautiful body, to bodies in general, to the beauty of souls, of laws, of knowledge, and finally to Beauty itself.`,
      blurb: `Socrates reports what Diotima of Mantinea taught him. Eros is not a god but a great spirit — neither beautiful nor ugly, born of Plenty and Poverty, always longing for what he lacks. Mortals seek immortality through generation. The highest generation is the climb up a ladder from one beautiful body to the eternal Form of Beauty itself. The dialogue's philosophical summit, and the founding text of Platonic love.`,
      summary: [
        `Socrates begins where Agathon left off, but in someone else's voice. Diotima, he says, started by demolishing the same kind of confusion. Eros is not beautiful and not a god. A god possesses beauty and the good; Eros lacks them and longs for them — that is the whole point of him. So is Eros ugly and bad? No. Eros is between. He is a great spirit, a <em>daimōn</em>, who carries messages between gods and men. He is neither wise nor ignorant — for the wise do not seek wisdom, having it, and the ignorant do not seek it, not knowing it is missing. Eros, like the philosopher, is in the middle: aware of what he lacks, reaching for it.`,
        `Diotima tells a myth to fix the picture. On the day Aphrodite was born, the gods had a feast. Plenty (Poros), drunk on nectar, fell asleep in the garden. Poverty (Penia), seeing him there, conceived a child by him; that child is Eros. He is therefore both rich and poor, always pursuing the beautiful, never possessing it. He is the figure of the philosopher. What does Eros finally want? The good — to have the good forever. But mortals cannot have anything forever. So they reach for eternity through generation. The body generates children; the soul generates poems, laws, ideas, virtues — children of the soul, which are better than children of the body because they last longer. Homer's children are still alive; most parents' grandchildren are not.`,
        `Then comes the ladder. The lover of beauty, Diotima said, begins by loving one beautiful body. He soon realizes the beauty in that body is the same as in another, and he learns to love beauty in bodies generally. He notices that beauty of soul is more valuable than beauty of body, and turns toward souls; from there to the beauty of laws and customs; from there to the beauty of knowledge. And finally, at the top, he glimpses Beauty itself — not beauty in any particular thing, not beauty that comes and goes, but beauty eternal, unchanging, the source from which everything beautiful borrows. To live in contact with that, Diotima told Socrates, is the only life worth living. Socrates ends. The audience is silent. Then there is a great noise outside the door.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'diotima', name: 'Diotima' },
      ],
      themes: [{ slug: 'ladder', label: 'The ladder of beauty' }, { slug: 'philosophy-as-eros', label: 'Philosophy as eros' }],
    },
    {
      n: 8,
      title: 'Alcibiades crashes in, and praises Socrates',
      tourTitle: 'Alcibiades',
      hook: 'A crowd of revelers bursts through the door. The most beautiful and most ruined man in Athens is among them — and he gives the seventh speech.',
      tour: `Alcibiades arrives propped up between a flute-girl and another reveler, very drunk, garlanded with ivy and violets. He is settling in to crown Agathon when he sees Socrates already there and flinches. He cannot praise Eros after Socrates has just spoken about him; instead, he will praise Socrates. The speech that follows is the most personal thing in all of Plato. Alcibiades compares Socrates to a Silenus statue — ugly outside, hiding a god within. He recounts Socrates's superhuman endurance on campaign and tells the story he has been carrying alone: the night he tried to seduce Socrates and was gently and devastatingly refused. At dawn, Socrates is still arguing. He gets up and walks to the Lyceum to begin his ordinary day.`,
      blurb: `A crowd of revelers crashes the party. Alcibiades — beautiful, brilliant, drunk, the man whose vanity will destroy Athens within the year — gives the seventh speech, in praise not of Eros but of Socrates. He compares him to a Silenus statue, recounts his superhuman endurance on campaign, and confesses to the night he tried to seduce him and was refused. The most personal speech in all of Plato.`,
      summary: [
        `The doors burst open. A crowd of revelers pours in — flute-girl, garlanded young men, much shouting. At the head of them is Alcibiades, very drunk, ivy and violet-crowned, propped between two of them. He demands to be led to Agathon to crown him for his prize, then sees that the couch beside Agathon is already occupied by Socrates and stops. Socrates, he says, you are everywhere I am. He sits down. Wine is brought; Alcibiades drinks an enormous cup and orders Socrates to drink one too. Eryximachus, who has been running the speeches, suggests Alcibiades give one too. Alcibiades refuses. He cannot praise Eros while Socrates is there; he will not be able to keep his eyes off him. He will praise Socrates instead.`,
        `He begins with the comparison that has stuck for two and a half millennia. Socrates is like a Silenus statue — those workshop figures of the satyr that, when opened, reveal small images of the gods inside. Ugly outside; divine within. He looks like an old satyr; if you listen to him, you find a god. Then Alcibiades testifies. On campaign at Potidaea, Socrates went without sleep, walked barefoot in the ice, and once stood in one place from sunrise to sunrise thinking through a problem; soldiers slept beside him and woke to find him still there. In the disastrous retreat at Delium he walked away from the battle as calmly as he walked through the agora. He saved Alcibiades's life there and refused the prize that was rightly his, insisting Alcibiades be honored instead. He has neither the appetites nor the fears most men have.`,
        `Then the confession. As a young man Alcibiades was so beautiful no one in Athens could refuse him; he expected Socrates would also fail to. He engineered every excuse to be alone with him — wrestling matches, late dinners, eventually staying overnight — and finally, when nothing else worked, lay down beside him on a couch and offered himself directly. Socrates received the offer with gentle refusal and lay all night beside him as a brother lies beside a brother. Alcibiades got up in the morning, he says, more confused and more in love than he had ever been. He warns Agathon not to be charmed the way he was. The night winds down. Aristodemus dozes and wakes near dawn to find only Socrates, Aristophanes, and Agathon still arguing — Socrates pressing the claim that the same poet should be able to write both comedy and tragedy. Aristophanes falls asleep, then Agathon. Socrates gets up, walks to the Lyceum, bathes, and spends the rest of the day as he spends every day.`,
      ],
      appears: [
        { id: 'alcibiades', name: 'Alcibiades' },
        { id: 'socrates', name: 'Socrates' },
        { id: 'agathon', name: 'Agathon' },
        { id: 'aristophanes', name: 'Aristophanes' },
        { id: 'aristodemus', name: 'Aristodemus' },
      ],
      themes: [{ slug: 'alcibiades', label: 'Alcibiades' }, { slug: 'philosophy-as-eros', label: 'Philosophy as eros' }],
    },
  ],
}
