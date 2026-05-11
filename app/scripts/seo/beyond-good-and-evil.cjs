// Beyond Good and Evil — SEO page data for build-seo-pages.cjs
// Nietzsche, 1886. Preface + nine parts + closing poem. 296 numbered aphorisms.
// Voice: combative, aphoristic, polemical. Cite specifics: will-to-power, master/slave, free spirit.

module.exports = {
  id: 'beyond-good-and-evil',
  title: 'Beyond Good and Evil',
  author: 'Friedrich Nietzsche',
  byline: '1886 · Prelude to a philosophy of the future',
  titleAccent: 'a guided tour',
  hook: 'Supposing that truth is a woman — what then? The book opens with that question and does not slow down. Nine parts, two hundred and ninety-six aphorisms, and a closing poem. The philosophy of the future starts here.',
  themesBlurb: 'Will to power, master and slave morality, the free spirit, the prejudices of philosophers, the philosopher of the future.',
  castBlurb: 'A cast of concepts and their antagonists.',
  castDesc: 'The forces at war in European thought.',
  castSubtitle: 'The forces at war in European thought.',
  chapterLabel: n => {
    const labels = [
      'Preface',
      'Part I',
      'Part II',
      'Part III',
      'Part IV',
      'Part V',
      'Part VI',
      'Part VII',
      'Part VIII',
      'Part IX',
      'Aftersong',
    ];
    return labels[n - 1] || `Part ${n}`;
  },
  genre: ['Philosophy', 'Aphorism', 'Continental philosophy'],

  about: [
    `<em>Beyond Good and Evil</em> is Nietzsche's polemic against the whole of European philosophy. It appears in 1886, the year after <em>Thus Spoke Zarathustra</em> — the prophetic-poetic book he believed his most important — and it is the discursive companion Zarathustra needed: nine parts, two hundred and ninety-six numbered sections, an aftersong of poems. The form is deliberate. He is not building a system. He is breaking a spell: the spell that European morality, epistemology, religion, and politics constitute a natural human inheritance rather than the historical artifact of priests, philosophers, and herds.`,
    `What the book names enters the twentieth century's vocabulary as few single books have done. The will to power as the underlying drive of all life. Master morality and slave morality. The herd instinct dressed as universal ethics. The free spirit who is not yet free of values but free of the assumption that his inherited values are unconditional. The philosopher of the future as legislator rather than spectator. Nietzsche called this his most beautiful book. It is, at minimum, his sharpest.`,
  ],
  chaptersSubtitle: 'All eleven chapters — from the preface that wagers everything to the closing poem on the heights.',
  chaptersLead: `<p><em>Beyond Good and Evil</em> moves in nine thematic parts plus a preface and a closing poem. Part I attacks the philosophical tradition. Part II sketches the free spirit. Part III examines religious psychology. Part IV is a hundred and twenty-five pure aphorisms. Part V — the conceptual centre — is the natural history of morals, where the master/slave distinction first appears in full. Parts VI through VIII examine scholars, virtue, and European peoples. Part IX, "What Is Noble?", is the closing manifesto. Read each section to the end and sit with it. Nietzsche compresses arguments into single paragraphs.</p>`,
  themesByline: 'Five cuts through the book',
  themesLead: `Beyond Good and Evil is a sustained assault on assumptions — about truth, morality, psychology, scholarship, and nobility. Each of these themes is a blade aimed at a different comfortable idea.`,

  groups: [
    { label: 'Preface & Part I', subtitle: 'The wager and the attack on philosophy.', chapters: [1, 2] },
    { label: 'Parts II–III', subtitle: 'The free spirit and religious psychology.', chapters: [3, 4] },
    { label: 'Part IV', subtitle: '125 pure aphorisms — the most-quoted sequence in the book.', chapters: [5] },
    { label: 'Part V', subtitle: 'The natural history of morals — the conceptual centre.', chapters: [6] },
    { label: 'Parts VI–VIII', subtitle: 'Scholars, virtue, and European peoples.', chapters: [7, 8, 9] },
    { label: 'Part IX & Aftersong', subtitle: 'What is noble? And a poem from the heights.', chapters: [10, 11] },
  ],

  themes: [
    {
      slug: 'prejudices-philosophers',
      title: 'The Prejudices of Philosophers',
      greek: '"Why do we even want truth? Why not untruth?"',
      preview: 'Every great philosophy is, Nietzsche claims, the involuntary memoir of its author — a confession of what the philosopher most needed to be true. Part I names this problem and opens the question that defines the book.',
      essay: [
        `Part I of <em>Beyond Good and Evil</em> sets the project of the late Nietzsche entire. Philosophers, he argues, have not been honest about what they have been doing. They presented themselves as cool spectators of truth, dispassionate inquirers into being. In fact, every great system — Plato's, Spinoza's, Kant's, Schopenhauer's — is first of all a personal confession, an expression of what its author most needed to believe. The edifice of logic comes after; the need comes first.`,
        `From this comes the book's most famous early question: why do we want truth? Why not untruth, uncertainty, ignorance? The question is designed to startle. Nietzsche is not endorsing the lie; he is pointing out that the desire for truth is itself a value, not a self-evident good, and that this value has a history. He pushes further. The very oppositions philosophy traffics in — true and false, real and apparent, good and evil, free and determined — are products of a particular psychological economy, the economy of priestly Europe, and they constrict thought in ways philosophers have not noticed because they live inside the constriction.`,
        `Kant's "thing-in-itself" gets particular treatment: it is, Nietzsche says, an embarrassing relic, a fiction philosophy cannot bring itself to abandon because abandoning it would require admitting how little of what it built on top of it holds up. Schopenhauer's pity-morality is traced to its psychological root — a man so constituted that pity felt true. The free spirit Nietzsche calls for is the thinker who has learned to suspect his own categories, to take truth not as a consolation but as something he has learned to receive in cold doses. Part I does not resolve what should replace the prejudices it names. That is not its job. Its job is to make the reader feel the full weight of having been inside a tradition that thought it was outside one.`,
      ],
      where: [
        { n: 1, label: 'Preface (the wager)' },
        { n: 2, label: 'Part I (the critique)' },
        { n: 6, label: 'Part V (morality as prejudice)' },
      ],
    },
    {
      slug: 'will-to-power',
      title: 'Will to Power',
      greek: '"The world seen from the inside — will to power, and nothing besides."',
      preview: 'Not a doctrine of domination but a metaphysical claim: every drive, every value, every act of cognition is an expression of a fundamental striving for the discharge of force. Section 36 is where the argument lives.',
      essay: [
        `The phrase the book makes famous appears throughout but gets its sharpest definition in section 36: the world seen from the inside, defined and determined according to its "intelligible character," would be will to power and nothing besides. This is not a doctrine of the muscular bully. Nietzsche is making a metaphysical claim more radical and more difficult than the cartoon suggests. Every drive, every value, every interpretation, every act of cognition is an expression of a fundamental striving — not for survival, as Darwin's followers argued, but for the discharge of force, for growth, for the imposition of one's own form on the world.`,
        `Even self-preservation, on Nietzsche's reading, is derivative: a consequence of will to power among creatures whose power is fragile. Knowledge is will to power. Truth is will to power. Love is will to power. Ascetic self-denial is will to power. The philosopher's most disinterested speculation is, beneath the disinterest, an attempt to make the world conform to a shape. The doctrine is contestable — Nietzsche contests it himself in later writing — and he never publishes the systematic statement of it he keeps planning. But the phrase enters the air.`,
        `What the will to power installs in the philosophical vocabulary is a problem that has not gone away: how to talk about the deep motive structure of conscious life without falling into either pious sublimation or reductive biology. The answer Nietzsche offers — that the basic phenomenon is the active, self-positing, value-creating drive — is one of the few continental contributions to thought that working psychologists have, often without naming him, found themselves reaching for. It also implies something about knowledge that still runs through epistemology: that "disinterested" inquiry is a fiction, that the interest is always already there, that the question is only whether the thinker is honest about it.`,
      ],
      where: [
        { n: 2, label: 'Part I, §§1–2 (the will to truth)' },
        { n: 6, label: 'Part V, §§186–203 (morality as will)' },
        { n: 10, label: 'Part IX, §§257–259 (aristocracy and power)' },
      ],
    },
    {
      slug: 'master-slave',
      title: 'Master Morality and Slave Morality',
      greek: '"The noble man lives in trust and openness — the man of resentment is neither upright nor naive."',
      preview: 'Section 260 in Part IX is the first full statement of the distinction the Genealogy of Morals will develop a year later. Two types of morality, answering two fundamentally different questions.',
      essay: [
        `Section 260, in Part IX, is the book's philosophically most concentrated moment. There have been, Nietzsche argues, two basic types of morality, answering fundamentally different questions. Master morality is the morality of the powerful. It begins in self-affirmation: the noble man calls himself good, and what flows from him — courage, generosity, contempt for the petty and the small — is good because he is. "Bad" means low, slavish, common. The contrast is between high and low, not between virtue and sin.`,
        `Slave morality is the morality of the suffering, the oppressed, the resentful. It begins not with self-affirmation but with a No to what is outside it: the strong are evil, and we, the meek and gentle, are good. Slave morality is reactive. It needs an enemy to define itself; master morality does not, because it begins in itself. Nietzsche's claim is that European morality since the rise of Christianity has been, increasingly, slave morality dressed as universal morality — the values of the priest and the pious peasant projected onto the cosmos and presented as the demand of God, or reason, or progress.`,
        `The argument is incendiary and meant to be. It is also more careful than its reception has mostly acknowledged. Nietzsche is not endorsing the master and condemning the slave. He is naming the historical inversion that produced the moral vocabulary Europeans still use, and asking whether they have noticed. The <em>Genealogy of Morals</em>, a year later, works the analysis out with archaeological patience — tracing "good," "bad," "evil," "guilt," and "conscience" to their historical and psychological roots. In <em>Beyond Good and Evil</em>, the sketch is three pages and the reader is expected to feel the shock of it without yet having the full evidence.`,
      ],
      where: [
        { n: 6, label: 'Part V (morality as natural history)' },
        { n: 10, label: 'Part IX, §260 (master and slave)' },
        { n: 10, label: 'Part IX, §§261–265 (nobility)' },
      ],
    },
    {
      slug: 'free-spirit',
      title: 'The Free Spirit and the Philosopher of the Future',
      greek: `"We are something other and higher than what the word 'modern men' expresses."`,
      preview: 'Two figures haunt the book and they are not the same. The free spirit is transitional; the philosopher of the future is the builder. Part II and Part VI are where they are defined.',
      essay: [
        `Two figures haunt <em>Beyond Good and Evil</em> and Nietzsche sometimes allows them to blur, which is part of the book's difficulty. The free spirit is the thinker who has begun to see through the inherited values of European culture but has not yet arrived anywhere new. He has earned his solitude. He has learned to live without the cushions of common opinion. He takes a certain pleasure, as Nietzsche puts it, in finding things uncomfortable. But he is still transitional. He has not built.`,
        `The philosopher of the future is the one who will build. Part VI gives the job description: a legislator and creator, someone who does not merely describe values but makes them, who does not merely interpret the world but commands it. The description is deliberately daunting; it is designed to disqualify almost every contemporary thinker, including most of those who admire Nietzsche. He is careful to say he may not have seen one yet and may not live to.`,
        `The two figures matter for reading the book, because they tell us what the book is doing. <em>Beyond Good and Evil</em> is not, on Nietzsche's own account, the philosophy of the future; it is the book that clears the ground for it. It breaks the false certainties, loosens the European reader's grip on values he has never examined. It is the work of the free spirit. The philosopher of the future is the addressee, not the author. Reading carefully, many readers have reported the uncanny feeling that Nietzsche is writing to someone who might be you — if you were braver than you currently are.`,
      ],
      where: [
        { n: 3, label: 'Part II (the free spirit, §§24–44)' },
        { n: 7, label: 'Part VI (we scholars, §§204–213)' },
        { n: 10, label: 'Part IX (what is noble?)' },
      ],
    },
    {
      slug: 'style-argument',
      title: 'Style as Argument',
      greek: '"A protracted will to the great, to the collective, to a people, to a civilization."',
      preview: 'Nietzsche chose the aphoristic form deliberately. It is not a failure to write continuous prose; it is a philosophical claim about perspective. Every section is an arrow shot from a bow.',
      essay: [
        `<em>Beyond Good and Evil</em> is not built like an argument and is not meant to be. The form Nietzsche chose — preface, nine parts, two hundred and ninety-six numbered sections of varying length, an aftersong — is itself a philosophical claim. Systematic philosophy, on his reading, has been the genre of the metaphysician who pretends to have stepped outside his own perspective and to be reporting the structure of being itself. The aphorism, the section that breaks off, the question that is not answered, the contradiction left in plain sight: these are forms appropriate to a philosophy that takes seriously that there is no view from nowhere.`,
        `Part IV — "Epigrams and Interludes" — is the pure form of this: one hundred and twenty-five sections, most of them a sentence or two. "He who is a thorough teacher takes things seriously — even himself — only in relation to his pupils." "Knowledge for its own sake — that is the last snare laid by morality." Each is the tip of an argument the reader is expected to complete. The ones that seem merely clever tend, on return, to conceal something dangerous.`,
        `This makes <em>Beyond Good and Evil</em> one of the most challenging philosophical texts in the European canon — not because individual sections are hard to parse, but because the connecting argument is, by design, not on the page. It is in the relation between the sections, in recurring images, in what is said in Part II and not contradicted in Part V even though it might have been. The impatient reader gets aphorisms and walks away with quotations. Nietzsche knew this and accepted the cost. The <em>Genealogy of Morals</em>, a year later, is the same author trying once more to make the argument continuous and traceable — because he had begun to suspect that even his sympathetic readers were getting only the lightning, not the storm.`,
      ],
      where: [
        { n: 1, label: 'Preface (the manifesto of form)' },
        { n: 5, label: 'Part IV (pure aphorism)' },
        { n: 11, label: 'Aftersong (the poem)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Nietzsche', role: 'Author', body: `Born 1844, son of a Lutheran pastor. Appointed to the chair of classical philology at Basel at twenty-four, on Wagner's recommendation, without a doctorate. Resigned at thirty-five in failing health. Wrote the books that made him famous over the next decade in cheap pensions in Sils Maria, Genoa, Turin. Collapsed mentally in January 1889 in Turin, never recovered, died 1900. <em>Beyond Good and Evil</em> sold almost nothing in his lucid lifetime and became one of the century's most influential books posthumously.` },
    { name: 'Kant', role: 'Target', body: `Nietzsche's most persistent antagonist in the text. The "thing-in-itself," the categorical imperative, the claimed disinterestedness of the moral law — all are treated as elaborate constructions designed to give their author what he needed to believe. Kant wanted a morality that could command absolutely; Nietzsche argues the want came first and the architecture came second.` },
    { name: 'Schopenhauer', role: 'Target / Teacher', body: `Nietzsche's first philosophical love and his most complicated target. Schopenhauer's will, his pity-morality, his pessimism — all diagnosed as a psychological type expressing itself in metaphysical clothing. The diagnosis does not dismiss the work; Nietzsche had learned too much from Schopenhauer's aesthetics and his honesty about the body to dismiss him. But the pity at the centre of Schopenhauer's ethics is, for Nietzsche, a danger to human greatness.` },
    { name: 'Plato', role: 'Target', body: `Christianity is "Platonism for the people," Nietzsche writes in the preface — one of his most compact formulations. The otherworldly turn in Plato, the demotion of the body and the senses in favor of the ideal form: Nietzsche reads this as a priestly move, a resentment of the actual dressed up as love of the higher.` },
  ],

  castLead: `<p>Beyond Good and Evil has no characters in the dramatic sense. It has figures — some historical, some conceptual — who play the roles that characters would play in a novel: the free spirit, the philosopher of the future, the last man, the herd, the noble. Below are the six most important, with the historical philosophers and cultural forces who appear throughout.</p>`,
  castGroups: [
    {
      label: 'Nietzsche\'s figures',
      characters: [
        {
          id: 'nietzsche',
          tag: 'Author',
          name: 'Friedrich Nietzsche',
          epithet: 'Born 1844 · Died 1900',
          body: `The author. Former professor of classical philology at Basel. By 1886 he has left the university, broken with Wagner, and written Zarathustra. He is working in intense solitude, in declining health, on the books that will make the next century use his vocabulary. He describes himself, in this period, as writing with a philosopher's hammer. <em>Beyond Good and Evil</em> is the first of the late works where the hammer is doing sustained structural demolition.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        },
        {
          id: 'free-spirit',
          tag: 'Figure',
          name: 'The Free Spirit',
          epithet: 'The transitional thinker',
          body: `Not a person Nietzsche has met but a figure he is calling into being: the thinker who has come unstuck from inherited values without yet arriving at new ones. The free spirit is the implicit reader of the book. He is presumed to have outgrown the obvious comforts — religion, progressivism, the dogmas of his profession — and to be ready for the discomfort of suspecting even his own desire for truth. Part II is his curriculum.`,
          appears: [3, 7],
        },
        {
          id: 'philosopher-future',
          tag: 'Figure',
          name: 'The Philosopher of the Future',
          epithet: 'Legislator and creator',
          body: `The figure the book is aimed past, and the only figure capable of carrying philosophy forward after the European tradition collapses under its own weight. The philosopher of the future is not a contemplator of being but a creator of values — a legislator. Nietzsche is careful to say he has not seen one and may not. The job description in Part VI is the most demanding in modern philosophy: it disqualifies almost everyone, including most who admire the author.`,
          appears: [7, 10],
        },
        {
          id: 'last-man',
          tag: 'Antagonist',
          name: 'The Last Man',
          epithet: 'From Zarathustra, lurking in the background',
          body: `Not a tyrant but the opposite — the comfortable, satisfied modern European who has invented happiness and blinks contentedly. He has his little pleasure for the day and his little pleasure for the night; he no longer believes in great things and is incapable of contempt. For Nietzsche the last man is a greater danger than any revolutionary. The book is, among other things, an attempt to rouse readers who might otherwise become last men.`,
          appears: [6, 10],
        },
      ],
    },
    {
      label: 'The antagonists',
      characters: [
        {
          id: 'kant',
          tag: 'Philosopher',
          name: 'Immanuel Kant',
          epithet: 'The most persistent target',
          body: `Kant appears throughout as the exemplar of the philosopher who disguised his needs as pure reason. The categorical imperative, the thing-in-itself, the postulation of free will as a practical necessity: Nietzsche traces each of these to what Kant needed to be true rather than what the evidence permitted. He treats Kant with a kind of irritated respect — the most rigorous of dogmatists is still a dogmatist.`,
          appears: [2, 6],
        },
        {
          id: 'european-morality',
          tag: 'Diagnosis',
          name: 'European Morality',
          epithet: 'The herd as philosophical system',
          body: `Treated throughout not as a faith to be argued with but as a psychological complex to be analysed. European morality is, for Nietzsche, the historical triumph of slave morality — the priestly inversion that took the values of the powerless and made them into the universal moral demand. He treats it with contempt for what it has cost and reluctant admiration for the depth of the operation. Part V is the fullest diagnosis; Part IX is the proposed alternative.`,
          appears: [4, 6, 8, 10],
        },
      ],
    },
  ],

  cast: [
    {
      name: 'Friedrich Nietzsche',
      role: 'AUTHOR',
      body:
        "Born 1844 in Röcken, Saxony, son of a Lutheran pastor who died young. Appointed at twenty-four — without a doctorate — to the chair of classical philology at Basel, on Wagner's recommendation. Resigns at thirty-five in failing health. Writes the books that make him famous over the next decade, alone, in cheap pensions in Sils Maria, Genoa, Turin. Suffers a complete mental collapse in January 1889 in the Piazza Carlo Alberto, never recovers, and dies in 1900. Beyond Good and Evil appears in 1886, sells almost no copies during his lucid life, and becomes one of the most influential books of the twentieth century once posthumous editions and his sister's complicated stewardship put it into wider hands. Nietzsche himself called it his most beautiful book.",
    },
    {
      name: 'Zarathustra',
      role: 'PROPHET / FOIL',
      body:
        "The fictional prophet of Nietzsche's previous and most ambitious book, Thus Spoke Zarathustra, mentioned and not mentioned throughout Beyond Good and Evil. Zarathustra is the figure who came down from his mountain to teach the death of God and the coming of the overman. Nietzsche knew the prophetic-poetic form of that book had baffled most readers, and Beyond Good and Evil is the philosophical companion meant to translate, partly, what Zarathustra said. The two books read together as a pair — vision and explication — and Nietzsche refers his readers from one to the other repeatedly without saying so. The free spirit of Beyond Good and Evil is the audience Zarathustra was looking for and could not find on the mountain.",
    },
    {
      name: 'The Free Spirit',
      role: 'ADDRESSEE',
      body:
        "Not a person Nietzsche has met but a figure he is calling into being: the thinker who has come unstuck from the inherited values of European Christianity-democracy-rationalism without having yet arrived at new values. The free spirit is the implicit reader of Beyond Good and Evil. He is presumed to have outgrown the obvious comforts — of religion, of progressivism, of the dogmas of his profession — and to be ready for the discomfort of suspecting even his own desire for truth. Nietzsche is gentle with him in places and merciless in others. The book is the free spirit's curriculum.",
    },
    {
      name: 'The Philosopher of the Future',
      role: 'ADDRESSEE',
      body:
        "The figure the book is aimed past, and the only figure capable, in Nietzsche's view, of carrying philosophy forward after the European tradition collapses under its own weight. The philosopher of the future is not a contemplator of being but a creator of values, a legislator. Nietzsche is careful to say he has not seen one yet and may not. He may be the announcer of someone whose time has not come. The job description in Part 6 is the most demanding in modern philosophy, and the figure remains one of the most contested in Nietzsche reception — read variously as a tyrant, a poet-philosopher, a political founder, a private exemplar of self-overcoming. Nietzsche left enough textual evidence to support most of the readings and not all of them at once.",
    },
    {
      name: 'The Last Man',
      role: 'ANTAGONIST',
      body:
        "From Zarathustra and present in the background of Beyond Good and Evil. The last man is not a tyrant but the opposite — the comfortable, satisfied modern European who has invented happiness, blinks contentedly, and asks for nothing higher. He has his little pleasure for the day and his little pleasure for the night; he no longer believes in great things; he is incapable of contempt and therefore incapable of admiration. He is, for Nietzsche, the great danger of European democracy, far more than the strong man or the revolutionary. The book is, among other things, an attempt to rouse readers who might otherwise become last men. Whether Nietzsche succeeded in any individual case is a question every reader has to ask of himself.",
    },
    {
      name: 'European Christianity',
      role: 'DIAGNOSIS',
      body:
        "Treated throughout the book not as a faith to be argued with but as a psychological complex to be analysed. Christianity, for Nietzsche, is the historical triumph of slave morality — the priestly inversion that took the values of the powerless (humility, meekness, pity, otherworldliness) and made them into the universal moral demand. He treats it with a mixture of contempt and reluctant admiration: contempt for what it has cost two thousand years of European life, reluctant admiration for the depth and ingenuity of the psychological operation. Beyond Good and Evil is not the book of the polemic against Christianity — that comes a year later in the Antichrist — but the diagnosis is already complete. By Part 5 the reader has been told that European morality is not the morality but a morality, and that the time has come to ask what comes after.",
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'Preface',
      tourTitle: 'The Preface — the wager',
      hook: 'Supposing that truth is a woman — what then? The whole book\'s argument is in the first line.',
      tour: `The preface opens with one of philosophy's most unsettling gambits: "Supposing that truth is a woman — what then?" Nietzsche's point is not about gender; it is about dogmatism. Dogmatic philosophers have courted truth with clumsy importunity and she has never allowed herself to be won. The preface announces that all European dogmatic philosophy, "however solemn, however conclusive and decided airs it has assumed," may have been "only a noble childishness." This is the wager: that the tradition has been wrong from the start, not in its conclusions only but in its very approach to truth. Two pages. Then the book begins.`,
      blurb: `Two pages that place the entire wager. Dogmatic philosophy has courted truth like a clumsy suitor — and she has not been won. Nietzsche announces that the whole tradition may have been "a noble childishness," and that what comes after will be different.`,
      summary: [
        `The preface opens with one of the most arresting opening sentences in modern philosophy: "Supposing that truth is a woman — what then?" The point is not about gender but about method. Dogmatic philosophers have approached truth with "terrible seriousness and clumsy importunity," like a poor suitor. Truth, Nietzsche says, has never allowed herself to be won by such methods. The metaphor does its work in two sentences: all dogmatizing in philosophy may have been a category error.`,
        `He pushes further. All dogma, however imposing, however logically dressed — Plato's, Spinoza's, Kant's — may have been resting on "some popular superstition of immemorial time," some "play upon words," some "audacious generalization of very restricted, very personal, very human — all-too-human — facts." The grand edifices of systematic philosophy, Nietzsche suggests, stand on the same epistemological footing as astrology: elaborate, internally consistent, and built on a need rather than evidence.`,
        `The preface closes by locating the book in time. It was written in 1885 at Sils Maria in the Upper Engadine. It is offered not as a refutation but as a prelude — the title says it: a prelude to a philosophy of the future. Whatever comes after will have learned from the failure of the old. The book is signed with a date and a place rather than with an argument. Nietzsche is telling the reader that even this text belongs to a perspective, to a moment, to a man — which is precisely the point he is about to spend nine parts making.`,
      ],
      appears: [{ id: 'nietzsche', name: 'Nietzsche' }],
      themes: [{ slug: 'prejudices-philosophers', label: 'Prejudices of Philosophers' }, { slug: 'style-argument', label: 'Style as Argument' }],
    },
    {
      n: 2,
      title: 'Part I — Prejudices of Philosophers',
      tourTitle: 'Part I — the prejudices',
      hook: 'The will to truth — why do we want it? The opening twenty sections ask the question European philosophy has never asked about itself.',
      tour: `Twenty-three sections attacking the philosophical tradition. Nietzsche opens with the will to truth: not "what is truth?" but "why do we want it?" He then diagnoses one great philosopher after another — Plato, Descartes, Kant — as thinkers who dressed personal needs in logical clothing. Section 4 is the hinge: the falseness of an opinion is no objection to it; the question is whether it is life-furthering. Section 9 on the Stoics is sharp comedy. Section 16 unpacks the fiction of the "immediate certainties" that modern epistemology rests on. The section on causa sui (§21) is among the finest in the book: the will to bear full moral responsibility requires a causation of the self by the self — an absurdity, but a necessary one for a morality that wants to punish.`,
      blurb: `Twenty-three sections. Why do we want truth? Who are the philosophers who claim to have it? Nietzsche diagnoses Plato, Kant, and Schopenhauer as thinkers who gave their needs the form of arguments — and asks what a philosophy would look like that was honest about this.`,
      summary: [
        `The first section opens with "the will to truth" and immediately asks the question the tradition has suppressed: why do we want truth in the first place? Why not untruth, uncertainty, ignorance? The desire for truth is not self-evident, Nietzsche argues — it is a value with a history, a drive with a psychology. Every metaphysical system, however logical in its architecture, reveals on inspection what its author most needed to believe. Plato needed the Forms because he needed permanence against the flux. Kant needed the thing-in-itself because he needed a limit to knowledge that would leave room for faith.`,
        `Section 4 is the book's most radical early move: "The falseness of an opinion is not for us an objection to it." The question is how far an opinion is "life-furthering, life-preserving, species-preserving, perhaps even species-rearing." This is not relativism; it is a different epistemology — one that evaluates beliefs not by their correspondence to a mind-independent world but by their role in the life of the thinker who holds them. Section 9 on the Stoics is brief and devastating: they wanted to live "according to nature" and then prescribed for nature what they themselves approved of. Every philosophy is, in this sense, a tyranny over nature dressed as a description of it.`,
        `The section on causa sui (§21) is among the finest in the book. Moral accountability — the kind that grounds punishment and praise — requires that a person be the cause of himself, that his will be the originating source of his actions uncaused by anything prior. This, Nietzsche says, is the best self-contradiction yet conceived: to pull oneself into existence out of the swamp of nothingness by one's own bootstraps. The whole of the free will debate in philosophy has been a prolonged evasion of this absurdity. Part I ends having done its work: the reader who has followed it carefully cannot look at a philosophical system quite the same way again.`,
      ],
      appears: [{ id: 'nietzsche', name: 'Nietzsche' }, { id: 'kant', name: 'Kant' }],
      themes: [{ slug: 'prejudices-philosophers', label: 'Prejudices of Philosophers' }, { slug: 'will-to-power', label: 'Will to Power' }],
    },
    {
      n: 3,
      title: 'Part II — The Free Spirit',
      tourTitle: 'Part II — the free spirit',
      hook: 'What does it cost to think freely? Part II introduces the figure who will carry philosophy forward — and what it requires of him.',
      tour: `Twenty-one sections. The free spirit is not a man who has arrived but a man in transit: someone who has left the inherited certainties behind and not yet built anything new. Nietzsche opens with a warning against martyrdom — the philosopher who suffers for truth gains a halo but loses his intellectual honesty. Section 26 on solitude: every select man strives for a citadel of privacy. Section 36 is the most philosophically concentrated in the book: from the fact that the will is a real phenomenon, Nietzsche attempts to derive that the whole world is will to power. Sections 40–44 on masks: every profound spirit needs a mask, and the profoundest spirits build one involuntarily because every genuine trait is interpreted by shallower observers as its opposite.`,
      blurb: `Twenty-one sections introducing the free spirit — the thinker in transit between inherited certainties and new values. Will to power appears in its sharpest formulation (§36). The part closes with the meditation on masks: every profound nature builds one involuntarily.`,
      summary: [
        `Part II opens with a warning against philosophical martyrdom. "Beware of suffering for the truth's sake," Nietzsche says — it spoils the neutrality that honest inquiry requires. The free spirit does not want a halo; he wants to see clearly, which is a different and lonelier ambition. Section 26 describes the solitude the free spirit requires: every select man strives instinctively for a citadel, a privacy where he is free from the crowd and the many. This is not misanthropy; it is the condition of independent thought.`,
        `Section 36 is the argumentative center of Part II and one of the most concentrated passages in the book. Starting from the reality of the will — "it is given in evidence" — Nietzsche attempts to extend it: suppose all organic functions are reducible to will to power? Suppose what we call "force" in physics is nothing but the world of the will seen from outside? "The world viewed from the inside, defined and determined according to its intelligible character — would be will to power and nothing besides." The argument is compressed and contestable. Nietzsche acknowledges it. But the hypothesis organizes everything that follows.`,
        `The part closes with a meditation on masks. Every profound nature builds a mask involuntarily: its genuine qualities are misread by shallower observers, who attribute to it the motives they would have themselves. A man of genuine hardness is assumed to be cruel; a man of genuine reserve is assumed to be cold; a man of genuine piety is assumed to be calculating. Nietzsche's advice to the free spirit is to neither correct nor protest these misreadings. Let the mask stand. "What is 'genuine' about them appears perhaps in only the masks they wear, in the faces they do not show." The concept will recur throughout the book.`,
      ],
      appears: [{ id: 'free-spirit', name: 'The Free Spirit' }, { id: 'nietzsche', name: 'Nietzsche' }],
      themes: [{ slug: 'free-spirit', label: 'The Free Spirit' }, { slug: 'will-to-power', label: 'Will to Power' }],
    },
    {
      n: 4,
      title: 'Part III — The Religious Mood',
      tourTitle: 'Part III — the religious mood',
      hook: 'The religious instinct diagnosed: what the saint, the mystic, and the ascetic are really doing, and why Nietzsche finds it philosophically dangerous.',
      tour: `Eighteen sections on the psychology of the religious experience. Nietzsche is not arguing that God does not exist; he is analysing what the religious type wants and what it is willing to sacrifice to get it. Section 45 frames it: the human soul and its limits are the hunting-domain of the born psychologist. Section 47 on the religious neurosis: it is connected, wherever it appears, with three dangerous prescriptions — solitude, fasting, and sexual abstinence. Section 51 is the sharp comedy: "What is amazing about the religiosity of the ancient Greeks is the enormous stream of gratitude it pours out." Section 61 on the philosopher's use of religion: the genuine philosopher of the future will deploy the religious mood instrumentally rather than submit to it.`,
      blurb: `Eighteen sections on the psychology of the religious experience. Not refutation but diagnosis: what the saint and the mystic want, what solitude and fasting and asceticism are doing to and for the religious type, and how the philosopher of the future will relate to religion.`,
      summary: [
        `Nietzsche opens Part III not by arguing against the existence of God but by setting up the psychologist's frame: the human soul and its limits, its heights and depths, are the "preordained hunting-domain for a born psychologist." What interests him is not theology but motivation: what does the religious man want? What does belief cost, and what does it buy? Section 46 on early Christian faith is precise: such faith required a "sacrifice of the intellect," and those who achieved it were, in a sense, the most heroic of men — the achievement of belief in the face of the evidence available required a tremendous expenditure of will.`,
        `Section 47 on the religious neurosis is diagnostic rather than dismissive. Wherever it appears on earth, Nietzsche notes, it is connected with three dangerous prescriptions: solitude, fasting, and sexual abstinence. The prescription is always the same even when the theology varies. Something in the structure of the self that wants religious experience requires deprivation — the reduction of the body, the quieting of appetite, the withdrawal from the world. Nietzsche does not condemn this; he finds it philosophically interesting. What kind of self requires this of itself in order to feel contact with something higher?`,
        `Section 61 is the most politically consequential in the part: the philosopher of the future will use the religious mood the way a craftsman uses a tool. He will neither submit to it nor mock it. He will understand that the religious instinct is a real psychological phenomenon that can be directed toward or away from life-affirming ends. Nietzsche's target here is the free-thinking atheism of his contemporaries: they have rejected the content of religion without understanding the function of the religious impulse, and they have left a vacuum where something of value used to be. The philosopher of the future will be wiser about this.`,
      ],
      appears: [{ id: 'nietzsche', name: 'Nietzsche' }, { id: 'european-morality', name: 'European Morality' }],
      themes: [{ slug: 'prejudices-philosophers', label: 'Prejudices of Philosophers' }, { slug: 'free-spirit', label: 'The Free Spirit' }],
    },
    {
      n: 5,
      title: 'Part IV — Epigrams and Interludes',
      tourTitle: 'Part IV — pure aphorism',
      hook: '125 sections, most of them a sentence or two. The most-quoted sequence in the book. Each one an arrow shot from a bow.',
      tour: `One hundred and twenty-five numbered sections, the majority a single sentence. This is the form at its purest. "He who is a thorough teacher takes things seriously — even himself — only in relation to his pupils." "Knowledge for its own sake — that is the last snare laid by morality." "Love of one person only is a barbarity, for it is exercised at the expense of all others." The reader is invited to read at speed and return slowly. Several of these sections are the most quoted in Nietzsche's work; several more are compressed arguments that only reveal their force on the third or fourth reading.`,
      blurb: `One hundred and twenty-five numbered sections, most of them a single sentence or two. The purest expression of Nietzsche's aphoristic method. Read fast once, then return to each one slowly.`,
      summary: [
        `Part IV strips the prose away and gives the method in its most concentrated form: one hundred and twenty-five numbered sections, the majority a single sentence. Nietzsche is working here at the level of the crystallized observation — the thought compressed to the point at which expansion is the reader's work, not the author's. "He who is a thorough teacher takes things seriously — even himself — only in relation to his pupils." "Knowledge for its own sake — that is the last snare laid by morality: we are thereby completely entangled in morals once more." "The charm of knowledge would be small, were it not that so much shame has to be overcome on the way to it."`,
        `Several of the most-quoted lines in Nietzsche's entire body of work appear in this section. "Love of one person only is a barbarity, for it is exercised at the expense of all others. Love of God also!" is a compressed argument against the moral sentimentalization of exclusivity that most commentators take paragraphs to make. "One is punished most for one's virtues" rewards a slow reading: Nietzsche means not that virtue brings social penalty (though it often does) but that what we call virtues are the very things that most reliably get us into trouble with ourselves.`,
        `The part is also a test of the reader's patience and attention. Some sections seem merely clever; they reward a return. "There is always some madness in love. But there is also always some reason in madness." The line has been excerpted ten thousand times. In context it is doing something specific: Nietzsche is making a point about the inseparability of Apollonian and Dionysian drives, the impossibility of pure reason and pure unreason as categories. Reading Part IV as a collection of quotations is reading it wrong. Reading it as a sequence — as a movement through psychological states — is reading it as Nietzsche intended.`,
      ],
      appears: [{ id: 'nietzsche', name: 'Nietzsche' }],
      themes: [{ slug: 'style-argument', label: 'Style as Argument' }, { slug: 'prejudices-philosophers', label: 'Prejudices of Philosophers' }],
    },
    {
      n: 6,
      title: 'Part V — The Natural History of Morals',
      tourTitle: 'Part V — morality as history',
      hook: 'Morality is not THE morality. It is a morality — one of many possible, with a history, a psychology, and a function. Part V is the conceptual centre of the book.',
      tour: `Eighteen sections. The most philosophically dense part of the book and the direct seedbed of the Genealogy of Morals. Nietzsche opens (§186) by noting that the "science of morals" is far behind the moral feeling it claims to describe: it is still moralizing when it should be observing. Section 187 on Kant's categorical imperative: the question to ask is not whether the imperative is valid but what it reveals about Kant. Section 199 on the herd instinct: obedience and law are so long practised that a conscience develops for them, and what was originally constraint becomes second nature and then "morality." Section 202 on the democratic movement: it is the heir to Christianity — the same leveling, the same suspicion of the exceptional, the same flight from rank and distinction.`,
      blurb: `Eighteen sections — the conceptual centre of the book. Morality is not THE morality but a morality, with a history and a psychology. The herd instinct. The democratic movement as the heir to Christianity. The seedbed of the Genealogy of Morals.`,
      summary: [
        `Part V opens with an observation that is almost a provocation: moral feeling in Europe is subtle, refined, and sensitive; the science of morals that claims to describe and ground it is crude, initial, and coarse-fingered. Moral philosophy is still moralizing — it starts from an assumed moral framework and argues within it — when it should be doing natural history: tracing moralities to their origins, asking what needs they served, what types they expressed, what they cost. Section 187 does this to Kant: the categorical imperative, the moral law valid for all rational beings, is less a discovery of reason than an expression of what Kant needed — a morality that could command absolutely and universally.`,
        `Section 199 is the one that produces the Genealogy's argument about conscience. Obedience and law are so long practised in a herd that a conscience develops for them: what was originally external constraint becomes internal second nature, and what is second nature gets called morality. The herd animal has bred into itself the feeling that its herd-necessities are moral obligations. This is not dishonesty; it is a kind of self-deception that has become structural. Nietzsche is not contemptuous of the herd; he is precise about what it is.`,
        `Section 202 is the most politically pointed: the democratic movement of modern Europe is "the heir to Christianity." Both are expressions of the same slave morality — the same leveling, the same suspicion of the exceptional, the same flight from rank. The democratic man believes, as fervently as the Christian, that all men are equal before God (or before the law), and that superiority is suspect. Nietzsche does not argue that democracy should be abolished. He argues that its moral assumptions are continuous with Christian assumptions, and that someone who has rejected Christianity without noticing this continuity has not gone as far as he thinks.`,
      ],
      appears: [{ id: 'nietzsche', name: 'Nietzsche' }, { id: 'kant', name: 'Kant' }, { id: 'european-morality', name: 'European Morality' }],
      themes: [{ slug: 'master-slave', label: 'Master and Slave Morality' }, { slug: 'prejudices-philosophers', label: 'Prejudices of Philosophers' }],
    },
    {
      n: 7,
      title: 'Part VI — We Scholars',
      tourTitle: 'Part VI — the scholars',
      hook: 'The philosopher is not the scholar. The man of learning has "something of the old maid about him." Part VI draws a line between scientific diligence and genuine creative philosophy.',
      tour: `Ten sections on the difference between the man of learning and the genuine philosopher. Nietzsche opens (§204) by protesting against the confusion of the scholar with the philosopher — a confusion that has, in the modern university, made it almost impossible to tell the two apart. Section 205 on the dangers of the evolution of the philosopher: science has become so vast that the philosopher who tries to master it risks becoming only a specialist. Section 206 is the sharpest formulation: in relation to the genius — a being who either engenders or produces — the man of learning has "something of the old maid about him," because he is not conversant with the two principal functions. Section 211 gives the philosopher of the future his clearest job description: he is a man who commands and legislates — "this is what is original with them."`,
      blurb: `Ten sections distinguishing the scholar from the genuine philosopher. The man of learning has "something of the old maid about him." Section 211 gives the philosopher of the future his clearest job description: he commands and legislates.`,
      summary: [
        `Part VI opens with a protest (§204) against the confusion of the scholar and the philosopher — a confusion that has become, in the modern German university, a systematic error. The man of learning is industrious, diligent, precise, and content within the limits of his discipline. He is an instrument of knowledge. The philosopher is something else: someone who commands from a height, who takes responsibility for the whole, who legislates rather than discovers. The confusion of the two has produced institutions filled with learned men and almost no philosophers.`,
        `Section 206 is the sharpest: the man of learning has, in relation to the genius, "something of the old maid about him," because he is not conversant with the principal functions — engendering and producing. This is deliberately provocative; it is also precise. The scholar's relation to knowledge is essentially passive: he receives, confirms, extends, arranges. The genius creates — makes something that was not there before. Nietzsche is not contemptuous of scholarship; he has spent his career in it. He is insisting that it is not philosophy.`,
        `Section 211 closes the part with the clearest definition of the philosopher of the future in the book: "Genuine philosophers are commanders and legislators: they say 'it shall be thus!' — they determine the Whither and the For-what of man." This is not a description of any philosopher Nietzsche knows. It is a job description for someone who does not yet exist, written by someone who believes they are needed. The philosopher of the future is not a specialist, not a scholar, not a critic: he is a creator of values, a person who is willing to answer the question that the whole of modern Europe is managing to avoid asking.`,
      ],
      appears: [{ id: 'philosopher-future', name: 'The Philosopher of the Future' }, { id: 'nietzsche', name: 'Nietzsche' }],
      themes: [{ slug: 'free-spirit', label: 'The Free Spirit' }, { slug: 'prejudices-philosophers', label: 'Prejudices of Philosophers' }],
    },
    {
      n: 8,
      title: 'Part VII — Our Virtues',
      tourTitle: 'Part VII — our virtues',
      hook: 'The virtues of the modern European — what are they, really? Part VII is Nietzsche\'s account of the psychology of the contemporary educated man.',
      tour: `Twenty-five sections on the moral psychology of the modern European. Section 214 opens: we Europeans of the day after tomorrow, we firstlings of the twentieth century — we have virtues, but not the simple massive virtues of our grandfathers. Section 220 on pity: not a virtue but a weakness that, when it becomes systematic, produces "slave morality" in the name of compassion. Section 228 on the will to knowledge: what contemporary scholars believe is the disinterested love of truth is more often a will to power over the material, an imposition of categories rather than a reception of facts. Section 231 on woman: a compressed and deliberately provocative set of observations on gender, read almost universally out of context.`,
      blurb: `Twenty-five sections on the moral psychology of the contemporary educated European. Pity as weakness rather than virtue. The will to knowledge as will to power. A closing section on woman that has been almost universally misread.`,
      summary: [
        `Part VII opens with a careful distinction: we moderns probably have virtues, but they are not the simple, massive, publicly legible virtues of previous centuries. The European of 1886 is complex, multiple, constituted by conflicting historical inheritances — classical, Christian, democratic, scientific — in ways that make simple virtue almost impossible. Section 214 proposes that the characteristic virtues of the contemporary educated man are actually forms of self-contradiction: we value honesty but practice evasion; we value independence but submit to consensus; we value courage but are terrified of social disapproval.`,
        `Section 220 on pity is the part's most argued point. Pity, Nietzsche claims, is not a virtue. It is a weakness — a form of suffering that adds to the sum of suffering in the world rather than reducing it. The man who is mastered by pity suffers along with the sufferer, and then suffers at his own suffering, and accomplishes nothing toward the actual removal of the original cause. Nietzsche is not arguing for indifference; he is arguing that pity as a systematic value — the kind that becomes a moral demand — is the morality of the herd, the insistence that the strong must not be strong because the weak find it painful.`,
        `The closing section on woman (§231–239) has generated more controversy than almost any other passage in Nietzsche. Read in context, the argument is not straightforwardly misogynist — Nietzsche is suspicious of the "emancipation" movement not because he thinks women inferior but because he thinks it is asking women to become worse versions of men. The women he admires are those who are most fully themselves, not those who have adopted the vocabulary and ambitions of the scholarly male. Whether this is a sophisticated position or a sophisticated rationalization of a bias remains one of the more genuinely open questions in Nietzsche scholarship.`,
      ],
      appears: [{ id: 'nietzsche', name: 'Nietzsche' }, { id: 'european-morality', name: 'European Morality' }],
      themes: [{ slug: 'master-slave', label: 'Master and Slave Morality' }, { slug: 'will-to-power', label: 'Will to Power' }],
    },
    {
      n: 9,
      title: 'Part VIII — Peoples and Countries',
      tourTitle: 'Part VIII — peoples and countries',
      hook: 'Europe as a cultural problem. Wagner, the Germans, the English, the French, the Jews — and the possibility of a new European type.',
      tour: `Seventeen sections. Nietzsche opens (§240) with a long, close reading of Wagner's overture to the Meistersinger — "magnificent, gorgeous, heavy, latter-day art" — that serves as the entry point into his analysis of the German cultural character. Section 241 on German patriotism: we "good Europeans" allow ourselves patriotism in hours of weakness, as a relapse into narrowness. Section 242 on the democratic movement as a European movement: it is producing a new kind of European, the useful, herd-able, and short-willed type — and also, as a countermovement, the strong and independent individual. Section 251 on the German Jews: one of the book's most carefully argued — and most disputed — passages. Section 256 on the European philosopher: the great men of culture have been good Europeans, not national types.`,
      blurb: `Seventeen sections on European cultures — German, French, English, Jewish — and what they reveal about the direction of European civilization. The democratic movement produces two types simultaneously: the useful herd animal and, as counterreaction, the exceptional individual.`,
      summary: [
        `Part VIII opens with Wagner. The overture to the Meistersinger is, Nietzsche says, "a piece of magnificent, gorgeous, heavy, latter-day art" — and he means "latter-day" with all its weight. It presupposes two centuries of German music as still living, as something the listener carries. It is brilliant and belated at once. The analysis of Wagner here is affectionate in a way the later books are not; Nietzsche is still, in 1886, ambivalent about the man he once admired most. But the cultural diagnosis is already complete: Wagner is Germany's greatest artist and Germany's greatest symptom simultaneously.`,
        `Section 242 is the most important in the part. The democratic movement across Europe is producing two simultaneous phenomena: a vast herd of "useful, herd-able, short-willed" Europeans — adaptable, serviceable, efficient, and incapable of commanding themselves or others — and, as its countermovement, the exceptional individual who becomes stronger in reaction against the leveling. This is the dialectic of modernity Nietzsche keeps returning to: the forces that weaken the many are, paradoxically, the same forces that strengthen the few who resist them. Whether Europe will produce more of the former or the latter is the open question.`,
        `The sections on Germany are the book's most personal and most nationally specific. Nietzsche is contemptuous of German nationalism (he had been contemptuous since the Franco-Prussian war of 1871) and of the German tendency to confuse cultural depth with political weight. The "good European" who appears throughout Part VIII is Nietzsche's counter-ideal: someone whose culture is broader than any single national tradition, who belongs to the European inheritance as a whole. The figures he names — Goethe, Beethoven — are German but not only German. This is what he means by "good European": not a cosmopolitan without roots but a person rooted in something larger than a nation.`,
      ],
      appears: [{ id: 'nietzsche', name: 'Nietzsche' }],
      themes: [{ slug: 'master-slave', label: 'Master and Slave Morality' }, { slug: 'free-spirit', label: 'The Free Spirit' }],
    },
    {
      n: 10,
      title: 'Part IX — What Is Noble?',
      tourTitle: 'Part IX — what is noble?',
      hook: 'The closing manifesto. Aristocratic values, the pathos of distance, master and slave morality in full — and a portrait of the noble man Nietzsche is calling for.',
      tour: `Thirty-seven sections — the longest and most ambitious part of the book. Section 257 opens: every elevation of the type "man" has been the work of an aristocratic society, and will always be. The "pathos of distance" — the distance that grows from the sustained awareness of difference in rank — is the precondition of the great. Section 260 is the first full statement of master and slave morality. Sections 261–265 analyse the components of nobility: vanity, pride, selfishness, truthfulness, solitude. Section 278 on the "wanderer" — the figure who has gone beyond good and evil in the sense the book intends. Section 287 on the highest man: he is beyond praise and blame because he is beyond the herd's categories. Section 295 on the Dionysian genius, the philosopher whom the whole book has been moving toward.`,
      blurb: `Thirty-seven sections — the closing manifesto. Aristocracy, the pathos of distance, master and slave morality in full (§260), the anatomy of nobility, and the portrait of the philosopher the book has been calling for.`,
      summary: [
        `Part IX opens with a claim that was scandalous in 1886 and remains so: every elevation of the type "man" has been the work of an aristocratic society. The aristocratic society is not defined by hereditary title but by the sustained belief in a "long ladder of rank and worth among human beings" — by the pathos of distance, the awareness of difference, the refusal to flatten the exceptional into the average. Without this, the exceptional does not emerge; it is absorbed into the herd. Section 258 on "corruption" is precise: what looks like decadence in an old aristocracy is the sign that it has lost its belief in its own values without finding new ones.`,
        `Section 260 is the book's most famous passage and one of the most analysed in modern philosophy. On a journey through moralities, Nietzsche says, two fundamental types emerge. Master morality: the noble man is good, and what flows from him is good because he is; the contrast is between high and low. Slave morality: the man of resentment defines himself against an enemy; the contrast is between good and evil; "evil" is the reactive term. Nietzsche's claim is not that master morality is morally superior to slave morality in slave morality's own terms — that would be circular. His claim is that slave morality has won, that it now presents itself as universal morality, and that this has cost European civilization something important.`,
        `The part closes (§295) with a portrait of the Dionysian philosopher — "the genius of the heart" — who appears briefly and departs before his impact is understood. He is the tempter, the "pied piper of consciences," who draws the best out of every person he encounters by making them feel, for a moment, larger than they knew themselves to be. Nietzsche does not name this figure. He describes him. Whether Nietzsche is describing himself, or a possibility, or an aspiration, the passage refuses to say. It is the book's most intimate section and its most reserved. The philosopher of the future, when he arrives, will be recognized not by what he says about himself but by what the best people become in his presence.`,
      ],
      appears: [{ id: 'nietzsche', name: 'Nietzsche' }, { id: 'philosopher-future', name: 'The Philosopher of the Future' }, { id: 'last-man', name: 'The Last Man' }, { id: 'european-morality', name: 'European Morality' }],
      themes: [{ slug: 'master-slave', label: 'Master and Slave Morality' }, { slug: 'will-to-power', label: 'Will to Power' }, { slug: 'free-spirit', label: 'The Free Spirit' }],
    },
    {
      n: 11,
      title: 'From the Heights (Poem)',
      tourTitle: 'Aftersong — From the Heights',
      hook: 'A poem in ten stanzas. The philosopher on his mountain, calling for friends who are not yet there. The book ends with a voice singing into silence.',
      tour: `Ten stanzas. Nietzsche wrote "From the Heights" as the aftersong to <em>Beyond Good and Evil</em>, and it is one of the few poems he published alongside a prose work. The persona is the philosopher on the mountain at midday — past the hardest part of the ascent, the air clear, waiting for companions who will recognize what he has become. The poem is not triumphant; it is wistful. The friends from the old life no longer fit; the new friends have not arrived. The form is a strict Germanic stanza: regular meter, rhyme, refrain. It is the formal opposite of the prose that precedes it, and the contrast is the point.`,
      blurb: `Ten stanzas. The philosopher at midday on his heights, calling for companions who are not yet there. Not triumphant but wistful. The formal opposite of the prose — strict stanza, rhyme, refrain — and the contrast is the point.`,
      summary: [
        `"From the Heights" is one of Nietzsche's most carefully crafted poems. It appears as the aftersong to the book — the piece that comes after the argument is complete, when the prose has been set down. The setting is the philosopher at midday on his mountain. He is past the hardest part of the ascent. The air is clear. He is waiting — for friends, for companions who will recognize what he has become. The opening stanzas are among Nietzsche's most beautiful: "Midday of life! O season of delight! / My summer's park! / A restless joy to look, to wait, to hark — / I watch for friends, ready day and night — / Where do you linger, friends? The time is right!"`,
        `The poem's mood is not triumph but something more complex: the solitude of the man who has gone further than his companions and now waits for those who might follow. The friends from the earlier life — the ones who shared the lowland — no longer fit. They would have to become different people to be here. The new companions have not yet arrived. The philosopher on the heights is between two worlds: past the old certainties, not yet in the company of those who share the new ones. This is the existential situation the whole of <em>Beyond Good and Evil</em> has been preparing for.`,
        `The formal choice matters. The book's prose is aphoristic, compressed, deliberately unsystematic, alert to its own perspectivism. The poem is its formal opposite: strict Germanic stanza, regular meter, rhyme, refrain. The contrast is Nietzsche's final argument about style: philosophy needs both, the broken and the whole, the prose that reflects the difficulty of truth and the poem that reflects the longing for something beyond it. The book ends with a voice singing into silence. Whether anyone is listening is the question the aftersong refuses to answer.`,
      ],
      appears: [{ id: 'nietzsche', name: 'Nietzsche' }],
      themes: [{ slug: 'style-argument', label: 'Style as Argument' }, { slug: 'free-spirit', label: 'The Free Spirit' }],
    },
  ],
};
