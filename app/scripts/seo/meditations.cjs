// Meditations — SEO page data for build-seo-pages.cjs
// Marcus Aurelius, 12 books, Stoic notes-to-self. No plot — preoccupations.

module.exports = {
  id: 'meditations',
  title: 'Meditations',
  author: 'Marcus Aurelius',
  byline: 'c. 170 CE · Roman emperor\'s private notebooks',
  titleAccent: 'a guided tour',
  hook: 'A Roman emperor, on campaign, wrote down what he had to remind himself every morning. He never meant for anyone else to read it. Two thousand years later, we still do.',
  themesBlurb: 'The inner citadel, mortality, duty, nature, reason against passion.',
  castBlurb: 'The people Marcus names',
  castDesc: 'The teachers, the predecessors, the imagined adversaries.',
  chapterLabel: n => `Book ${n}`,
  genre: ['Stoic philosophy', 'Roman literature'],

  about: [
    `<em>Meditations</em> is the strangest book in the Western canon. It is a journal — a private notebook — kept by Marcus Aurelius, emperor of Rome, during the last decade of his life, mostly while he was campaigning on the northern frontier of the empire. It was not written for publication. He never gave it a title. The Greek title we use, <em>Ta eis heauton</em> ("To Himself"), is editorial.`,
    `What he wrote down were the Stoic exercises he was using to keep himself sane and decent in a job that destroyed almost everyone who held it. The book is repetitive on purpose. He returns to the same handful of themes — death is coming, you can only control what is in your own mind, do your duty without complaint, the cosmos is rational — because he needed to remind himself of them every day. The Meditations is therefore a working document, not a finished argument. You read it the way Marcus wrote it: a few pages at a time, repeatedly, for as long as you need to.`,
  ],
  chaptersSubtitle: 'All twelve books at a glance — what each one returns to.',
  chaptersLead: `<p>The twelve books were not written in order, and they were not built around themes. They are bundles of fragments — paragraphs Marcus wrote on different days over many years, then loosely grouped. Book One stands apart: it is a list of debts owed to teachers and family. The other eleven are more rhythmic than structural. Each, however, has its own characteristic preoccupations and its own mood, and the chapters below sketch what to expect from each.</p>`,
  themesByline: 'Five threads through the notebooks',
  themesLead: `Marcus is not building an argument; he is rehearsing exercises. But the same handful of arguments comes back again and again, in different keys. These five threads are the ones the book keeps returning to — and the ones that explain why a Roman emperor's private journal has outlasted nearly everything else from his age.`,

  groups: [
    { label: 'Book 1 · Debts', subtitle: 'A list of attributions — the only book of its kind in the work.', chapters: [1] },
    { label: 'Books 2–6 · The discipline', subtitle: 'Marcus laying out, again and again, the basic Stoic exercises.', chapters: [2, 3, 4, 5, 6] },
    { label: 'Books 7–12 · Late, plain, urgent', subtitle: 'Older, sicker, closer to the end. The voice tightens.', chapters: [7, 8, 9, 10, 11, 12] },
  ],

  themes: [
    {
      slug: 'inner-citadel',
      title: 'The inner citadel',
      greek: 'what is in your control, and what is not',
      preview: 'The single most important Stoic distinction in Marcus is between what depends on you and what does not. The body, reputation, the actions of others — outside your control. Your judgments, your responses, the use you make of impressions — yours.',
      essay: [
        `The single most important Stoic distinction in Marcus is between what is up to you and what is not. Your body is not up to you — it can be hurt, taken, killed. Your reputation is not up to you — others decide what to think of you. The actions of other people are not up to you. The empire is not up to you, even when you are emperor. None of it is.`,
        `What <em>is</em> up to you is the inner space where you respond to all of this. Your judgments. Your assents. The use you make of impressions. Whether to call something "bad" or "indifferent." Whether to be drawn into anger by another person's anger. Marcus calls this the <em>hēgemonikon</em> — the "ruling part" — and he calls it variously a fortress, a citadel, an inner space that no one can enter without your consent.`,
        `The exercise is to retreat there as often as you need to. When the day is going badly: notice that the day is not in your control, but the way you are walking through it is. When someone insults you: notice that the insult is just a sound, and the wound only happens if you complete it inside yourself. This is not denial; Marcus is unsparingly clear about how bad things can get. It is a redrawing of where you actually live. You live in the citadel.`,
        `It is also, in Marcus's hands, not a private comfort. The point of the citadel is not to wall yourself off from the world but to act in the world without being torn apart by it. The emperor still has to make decisions, hand down judgments, send men to their deaths. The citadel is what makes that work possible without becoming the kind of person it usually makes you.`,
      ],
      where: [
        { n: 4, label: 'Book 4 (the famous "retreat into yourself")' },
        { n: 7, label: 'Book 7' },
        { n: 8, label: 'Book 8' },
      ],
    },
    {
      slug: 'mortality',
      title: 'Mortality and the river of time',
      greek: 'memento mori, every page',
      preview: 'Marcus reminds himself that he will die soon, that everyone he loves will die, that everyone he hates will die, that even the great names are forgotten. The point is not gloom — it is to keep his attention on what is real.',
      essay: [
        `Almost every page of the Meditations contains a reminder of death. Marcus tells himself that he will die soon. That everyone he loves will die. That everyone he is angry with will die. That the great Caesars are gone. That Hadrian is gone. That entire generations have been forgotten and that he will be forgotten too. The repetition is striking; it is also intentional.`,
        `The point is not gloom. Marcus is not a dark writer in the sense Dostoevsky is dark. The point is attention. We waste enormous amounts of time on things that wouldn't matter to us if we kept the brevity of life in front of us — pretending an insult matters, planning a feud, agonizing about reputation, refusing to act because we are afraid to look bad. None of these survive contact with death. Marcus uses death as an instrument: it scrubs away the noise.`,
        `He is also wonderfully concrete about it. Look at how the recently dead lie, he says. Look at the bodies pulled from the sea. The river of time bears each thing forward, used a little while, then washed away. You will be one of those things, soon. So will your son. So will Hadrian, who took the throne with such ceremony — ash now. Marcus does not try to make this sound peaceful. He simply repeats it until it lands.`,
        `What lands, in him, is a working philosophy: do the work in front of you, treat the people in front of you well, do not waste the day on resentment, because there are not many days. It is the Stoic discipline expressed at its plainest.`,
      ],
      where: [
        { n: 2, label: 'Book 2 (life is a campaign)' },
        { n: 4, label: 'Book 4' },
        { n: 12, label: 'Book 12 (the final book)' },
      ],
    },
    {
      slug: 'duty',
      title: 'Duty and the role given to you',
      greek: 'do the work that is in front of you',
      preview: 'Marcus does not ask whether the work is glorious. He asks whether it is his. The Stoic argument is that we are each given roles by nature and by circumstance, and our task is to play them well, not to long for someone else\'s.',
      essay: [
        `Marcus is endlessly reminding himself to get up and do the work. "At dawn, when you have trouble getting out of bed, tell yourself: I have to go to work — as a human being. What do I have to complain of, if I'm going to do what I was born for, the things I was brought into the world to do?" That passage is in Book Five. He needs to tell himself this in the morning, every morning. Even an emperor doesn't want to get up.`,
        `The Stoic argument behind this is that each person is given a <em>role</em> — by nature, by birth, by the circumstances they find themselves in — and the task is to play the role well, not to long for someone else's. A foot is for walking; an eye is for seeing; a human being is for the kind of rational, social, virtuous work that human beings can do. The world is one cosmos and you are one part of it. You don't get to opt out of being a part. You only get to choose how you contribute.`,
        `For Marcus this had a very specific meaning. He hadn't chosen to be emperor. He had been a quiet, scholarly young man, and the role was given to him by his adoptive father Antoninus. He spent the rest of his life fulfilling it — through wars he didn't enjoy, against rebellions he hadn't started, with a son (Commodus) he was beginning to suspect would unmake everything he had built. He never seems to have considered abdicating. He took the role he had been given and tried to play it well. The Meditations is, in part, the document of that effort.`,
        `He is also clear that "duty" doesn't mean "joyless service." The Stoic does the work cheerfully, because complaining is unworthy and because the cosmos is rational and because, frankly, the work is better with the complaining left out. "What is not good for the hive is not good for the bee." Get up. Do the work.`,
      ],
      where: [
        { n: 5, label: 'Book 5 (the famous "at dawn")' },
        { n: 6, label: 'Book 6' },
        { n: 8, label: 'Book 8' },
      ],
    },
    {
      slug: 'cosmos',
      title: 'Nature, cosmos, providence',
      greek: 'the world is one and rational',
      preview: 'Marcus believes the universe is a single ordered system in which everything that happens is what nature requires. This is not consolation; it is metaphysics, and it does the work of holding the rest of the philosophy together.',
      essay: [
        `Behind everything else in the Meditations is a metaphysical commitment that Marcus shares with the older Stoics. The universe is one — a single ordered system, a <em>cosmos</em>, run by reason, in which everything that happens is part of the whole and does what the whole requires.`,
        `This is not consolation. Marcus is not telling himself everything happens for a personal reason. He is saying something larger and stranger: that the universe is the kind of thing it is, and that the kind of thing it is includes human suffering, the deaths of children, the falls of empires, and his own oncoming death. None of these are exceptions to the system. They are how the system runs.`,
        `What the metaphysics buys him is that nothing is anomalous. He does not have to feel betrayed by anything that happens, because nothing that happens is a betrayal — it is what nature does. A wave breaking on the rocks is not a violation of the wave. A man dying is not a violation of life. There is therefore no point in being scandalized by reality. Marcus repeats this to himself, again and again, when he is tempted to be scandalized.`,
        `It also tells him how to act. Since you are a part of the cosmos, your job is to act in keeping with its grain. Be reasonable, because the cosmos is rational. Be social, because human beings are made to live with each other. Don't try to opt out of the system you are in — you are not the kind of thing that can opt out. The cosmos is going to do what it does. Your only choice is how to do your small piece of it.`,
      ],
      where: [
        { n: 4, label: 'Book 4' },
        { n: 6, label: 'Book 6' },
        { n: 9, label: 'Book 9' },
      ],
    },
    {
      slug: 'reason',
      title: 'Reason against passion',
      greek: 'do not be carried away',
      preview: 'The Stoic ideal is the soul that is not jerked around by its own emotions. Marcus knows he is jerked around constantly, and the discipline is the slow patient work of putting reason back in charge — every day, on every provocation.',
      essay: [
        `The Stoic ideal is a soul that is not yanked about by its own emotions. Anger, lust, fear, grief, envy — the Greeks called these <em>pathē</em>, "passions," and the Stoic discipline was to bring them under the rule of reason. Not to extinguish them; that is a misreading. To stop being driven by them.`,
        `Marcus, like everyone else, is yanked about constantly. He gets angry; he is pulled by sexual desire; he is afraid of his son; he is frustrated by petitioners and by senators and by the people closest to him. The Meditations is the record of him noticing this and putting reason back in charge. Many of his exercises are simple reframings: "what's done to me is in my own mind." "An ungrateful man is just a man." "What's not good for the hive is not good for the bee."`,
        `The trick the Stoic uses, again and again, is to refuse the second arrow. The first arrow — pain, loss, insult — is unavoidable. The second arrow is the one you fire into yourself: the resentment, the rumination, the self-pity. Marcus catches himself mid-draw and refuses to fire. Not always; he wouldn't have to write it down so often if he succeeded. But the discipline of catching himself is itself the practice.`,
        `He is also kind to himself about it. He is not a saint and does not pretend to be. He just keeps trying. "Do not be ashamed to be helped," he tells himself in Book Seven. "It's like a soldier scaling the wall: when you can't do it alone and someone gives you a hand, you don't refuse." The Stoic is not the man who never falls. The Stoic is the man who, when he falls, gets up and continues.`,
      ],
      where: [
        { n: 2, label: 'Book 2' },
        { n: 7, label: 'Book 7' },
        { n: 11, label: 'Book 11' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Marcus Aurelius', role: 'Emperor, 161–180 CE', body: `The author. Roman emperor for nineteen years, philosopher-king almost in spite of himself. Trained from childhood in Stoic philosophy. Became emperor at 39 and spent most of the rest of his life on the northern frontier, fighting Germanic tribes. Wrote Meditations as private notes during those campaigns. Died of the plague at 58.` },
    { name: 'Antoninus Pius', role: 'Adoptive father', body: `Marcus's adoptive father and the previous emperor. The first long passage of Book Six is Marcus's tribute to him: a model of how to govern with calm and decency. Marcus loved him deeply and modeled himself on him.` },
    { name: 'Epictetus', role: 'Stoic teacher (indirect)', body: `The Stoic philosopher whose lectures, recorded by Arrian, shaped Marcus most. Marcus owns a copy of the <em>Discourses</em> and thanks his teacher Rusticus for introducing him to it. Many of the moves in the Meditations are recognizably Epictetus's.` },
    { name: 'Faustina', role: 'Wife', body: `Marcus's wife of more than thirty years and the mother of his many children. Mentioned only once or twice in the Meditations, but with affection.` },
    { name: 'Commodus', role: 'Son and heir', body: `Marcus's surviving son and the heir to the empire. Never named in the Meditations, but visible in the cracks: Marcus is increasingly aware in the late books that the next emperor will not share his values. Commodus succeeded him and undid much of his father's work.` },
    { name: 'Rusticus', role: 'Teacher and friend', body: `The Stoic philosopher and Roman official who introduced Marcus to Epictetus. Marcus thanks him personally in Book One. Rusticus's loyalty to Marcus, even when Marcus had to send him away to govern provinces, was a model of the Stoic friendship Marcus admired.` },
  ],

  castSubtitle: 'The teachers, the predecessors, the imagined adversaries.',
  castLead: `<p>The Meditations is full of names — but the names are not characters in a story; they are people Marcus is grateful to, indebted to, in dialogue with, or arguing against. Book One is famously a list of debts: from his grandfather, courtesy; from his mother, religious feeling; from Rusticus, an introduction to Epictetus. The rest of the work returns to many of the same figures plus a wider Stoic genealogy.</p>
      <p>The cards below cover the people Marcus names most often. Some are real teachers; some are predecessors he never met; some are imagined adversaries he is rehearsing how to deal with. All of them are, in one way or another, working against the same problem he is.</p>`,
  castGroups: [
    {
      label: 'The teachers · those Marcus names with gratitude',
      subtitle: 'Mostly real, mostly Stoic, mostly the people who formed him.',
      characters: [
        { id: 'antoninus', tag: 'Mortal', name: 'Antoninus Pius', epithet: 'Marcus\'s adoptive father, emperor 138–161', body: `The first long meditation in Book Six is Marcus's tribute to Antoninus — a portrait of how to govern with calm decency. Antoninus had taken Marcus into his household and raised him as his heir, and Marcus modelled the rest of his life on the man's quiet steadiness. "Everything he did was thought through carefully, as if he had time to spare." Marcus's idea of how to be emperor came almost entirely from Antoninus.`, appears: [1, 6] },
        { id: 'rusticus', tag: 'Mortal', name: 'Junius Rusticus', epithet: 'Stoic teacher and Roman senator', body: `One of Marcus's most important teachers. Rusticus introduced him to Epictetus's Discourses, lent him his own copy, and seems to have been a model of Stoic life lived inside Roman politics. Marcus thanks him in Book One for, among other things, "not being put off by trifles" and "writing letters in plain language."`, appears: [1] },
        { id: 'fronto', tag: 'Mortal', name: 'Cornelius Fronto', epithet: 'Marcus\'s rhetoric teacher', body: `Fronto taught Marcus rhetoric and remained a friend through Marcus's reign. Their letters survive (separately from the Meditations) and are warm, sometimes slightly worried about the young Marcus's growing seriousness. Marcus thanks him in Book One for showing him "how envy and duplicity and hypocrisy are the marks of tyranny."`, appears: [1] },
        { id: 'mother', tag: 'Mortal', name: 'Domitia Lucilla', epithet: 'Marcus\'s mother', body: `Marcus thanks his mother for "her religious devotion, her generosity, her inability not just to do wrong but even to think it" — and for her "plain way of living, far from the habits of the rich." She seems to have been the formative moral influence of his early life.`, appears: [1] },
        { id: 'grandfather', tag: 'Mortal', name: 'Verus (the grandfather)', epithet: 'The Verus who raised Marcus', body: `From his grandfather, Marcus says, he learned <em>courtesy</em> — the small, steady kindnesses that make a household livable. The opening line of the Meditations.`, appears: [1] },
      ],
    },
    {
      label: 'The Stoics · predecessors Marcus reads against',
      subtitle: 'The chain of philosophers Marcus inherited from.',
      characters: [
        { id: 'epictetus', tag: 'Philosopher', tagClass: 'creature', name: 'Epictetus', epithet: 'Slave-philosopher, c. 50–135 CE', body: `The Stoic philosopher whose work shaped Marcus most. Born a slave in Rome, freed in his thirties, exiled by Domitian, taught for the rest of his life in Greece. His lectures (the <em>Discourses</em>) survive only because his student Arrian wrote them down. Marcus owns a copy and refers to its arguments throughout — the dichotomy of control, the discipline of assent, the inner citadel.`, appears: [1, 4, 7, 11] },
        { id: 'seneca', tag: 'Philosopher', tagClass: 'creature', name: 'Seneca', epithet: 'Stoic statesman, 4 BCE–65 CE', body: `Marcus does not name Seneca often, but he reads him. Seneca was Nero's tutor, a Roman senator and playwright as well as a philosopher; like Marcus, he was a Stoic operating at the highest level of imperial politics. Seneca's letters (<em>Epistulae morales</em>) cover much of the same ground as the Meditations and were, almost certainly, on Marcus's bookshelves.`, appears: [1] },
        { id: 'chrysippus', tag: 'Philosopher', tagClass: 'creature', name: 'Chrysippus', epithet: 'The Stoic systematiser, c. 279–206 BCE', body: `The third head of the Stoic school in Athens, called by the ancients "the second founder." Chrysippus did not survive in his own writings, but his arguments — about the soul, about logic, about the cosmos as one rational whole — are everywhere in Marcus. When Marcus argues that the universe is a single ordered system, he is arguing what Chrysippus argued.`, appears: [1, 4, 7] },
        { id: 'heraclitus', tag: 'Philosopher', tagClass: 'creature', name: 'Heraclitus', epithet: 'The river-philosopher, c. 535–475 BCE', body: `The pre-Socratic philosopher whose famous claim — you cannot step in the same river twice — Marcus quotes again and again. Heraclitus's vision of the cosmos as <em>flux</em>, as everything in motion, becomes one of Marcus's central images. When he reminds himself that "time is a river," he is borrowing Heraclitus's metaphor.`, appears: [4, 6] },
      ],
    },
    {
      label: 'The imagined · adversaries Marcus rehearses against',
      subtitle: 'Not specific people — the kinds of person Marcus knows he will meet today.',
      characters: [
        { id: 'ungrateful-man', tag: 'Type', tagClass: 'creature', name: 'The ungrateful man', epithet: 'Marcus\'s morning warmup', body: `"Begin the day by telling yourself: today I will meet the meddler, the ingrate, the bully, the cheat, the envious." Book Two opens with this list. Marcus is not naming people; he is rehearsing the kinds of person he will inevitably encounter and reminding himself in advance not to be surprised. By the time the actual ingrate shows up at court, Marcus has already met him in his head.`, appears: [2] },
        { id: 'slanderer', tag: 'Type', tagClass: 'creature', name: 'The slanderer', epithet: 'The voice you hear in your absence', body: `Marcus repeatedly reminds himself that praise and blame from other people are equally outside his control. The slanderer — the man who has decided to dislike you and is busy persuading others to — is a recurring figure. Marcus's response is consistent: it is just a sound; he doesn't know me; what is being said does not change what I am.`, appears: [4, 6, 11] },
      ],
    },
  ],

  chapters: [
    {
      n: 1, title: 'Debts owed', tourTitle: 'Debts owed', hook: 'Book One is unique in the Meditations: a list of attributions. From his grandfather, courtesy; from his mother, religious feeling; from Rusticus, the introduction to Epictetus.',
      tour: `Book One stands apart from the rest of the work. It is a list of debts — paragraph after paragraph — to the people who shaped Marcus. From his grandfather, courtesy. From his mother, religious feeling and a plain way of living. From his great-grandfather, the lesson that you should never employ a tutor of bad character. From Rusticus, the discovery of Epictetus and the lesson to write letters in plain language. From Antoninus, his adoptive father, an entire model of how to govern. The book is partly a literary form — a Roman tribute to one's <em>maiores</em>, the elders — and partly the foundation Marcus is laying for the rest of the work. He is reminding himself who he came from.`,
      blurb: `Book One is structurally unique. It is a list of attributions — to his grandfather, his mother, his teachers, his adoptive father — for the qualities Marcus believes he inherited from each. It is partly a Roman literary tradition (the tribute to one's elders) and partly Marcus reminding himself who he came from before beginning the rest of the work.`,
      summary: [
        `Book One stands alone in the Meditations. The other eleven books are bundles of fragments, sayings, exercises; Book One is a single sustained list. Each paragraph names one person and says what Marcus owes them. From his grandfather Verus, "good morals and the government of my temper." From his mother, "religious devotion, generosity, an inability not just to do wrong but even to think it." From his great-grandfather, the lesson that you should not employ tutors of bad character even if it is cheaper.`,
        `The list runs through about seventeen figures. His teachers Diognetus, Rusticus, Apollonius, Sextus, Alexander the Grammarian, Fronto, Catulus, Severus, Maximus. Then, in the longest paragraph of all, his adoptive father Antoninus Pius. From Antoninus, Marcus says, he learned "everything he did was thought through carefully, as if he had time to spare," and "to bear pain and grief without showing it," and "to do nothing for the sake of show." Antoninus is the moral model under which most of the rest of the Meditations is being written.`,
        `The book functions as a foundation. Before Marcus begins the long work of reminding himself how to live, he reminds himself where he came from and who taught him. The list is not nostalgic; it is structural. Many of the central exercises in the rest of the Meditations — the dichotomy of control, the morning preparation, the indifference to praise — appear in Book One in proto-form, attached to the teacher Marcus first heard them from. He is making sure he never forgets that the philosophy is a debt.`,
      ],
      appears: [{ id: 'grandfather', name: 'Verus' }, { id: 'mother', name: 'Domitia Lucilla' }, { id: 'antoninus', name: 'Antoninus Pius' }, { id: 'rusticus', name: 'Rusticus' }, { id: 'fronto', name: 'Fronto' }],
      themes: [{ slug: 'duty', label: 'Duty' }],
    },
    {
      n: 2, title: 'On campaign at Carnuntum: the morning warmup', tourTitle: 'The morning warmup', hook: '"At dawn, when you have trouble getting out of bed..." Book Two begins with the most famous opening in the Meditations.',
      tour: `Book Two opens with the line that has launched a thousand modern self-help books and earned its keep every time: "Begin the day by telling yourself you will meet the meddler, the ingrate, the bully, the cheat, the envious. None of them can do you real harm — they don't know any better — and besides, you are made of the same stuff." It is a Stoic warmup exercise: rehearse the day's annoyances in advance so that when they arrive you are not thrown by them. The rest of the book is short, urgent, and sharply written. Many of Marcus's most quoted lines — "do every act of your life as if it were your last," "the universe is change, life is opinion" — are from Book Two.`,
      blurb: `One of the shortest and most-quoted books, written in the field at Carnuntum on the Danube. It opens with the famous morning rehearsal — "today I will meet the meddler, the ingrate, the bully" — and contains many of the Meditations' most quoted lines on death, change, and self-rule.`,
      summary: [
        `Book Two opens with a stage direction in some manuscripts: "Among the Quadi, on the Granua." Marcus is on campaign on the Danube. The book begins with the famous morning warmup — "Begin the day by telling yourself you will meet the meddler, the ingrate, the bully, the cheat, the envious." The point is rehearsal. By the time you encounter these people in your day, you have already encountered them in your head, and you are not thrown.`,
        `The rest of the book moves at a clip. Marcus reminds himself that the body is just flesh and breath; the soul is what matters. That all things are interconnected and the world is a single thing. That nothing he does should be done without aim. That one should "do every act of your life as if it were your last." That praise and blame are equally outside his control. That time is a river and we are its momentary debris. Many of the lines from Book Two have become aphorisms in their own right.`,
        `The mood is urgent. Marcus is older now and on a frontier, and there is a clipped, no-time-to-waste quality to the writing. "Don't waste the rest of your time talking about what a good man should be like. Just be one." Book Two is the book most readers remember from a first reading; it is also the book Marcus seems to have meant most directly for himself.`,
      ],
      appears: [{ id: 'ungrateful-man', name: 'The ungrateful man' }, { id: 'epictetus', name: 'Epictetus' }],
      themes: [{ slug: 'mortality', label: 'Mortality' }, { slug: 'reason', label: 'Reason against passion' }],
    },
    {
      n: 3, title: 'On campaign at Carnuntum: the soul examined', tourTitle: 'The soul examined', hook: 'Marcus tightens his attention to the inner life. What is mine? What is added? What is to be done with each impression as it arrives?',
      tour: `Book Three is also written on campaign and is even sparer than Book Two. The exercises here are more inward. Marcus examines the soul piece by piece — what is mine, what is added by judgment, what is just a passing impression. He pushes hard on the discipline of <em>assent</em>: the moment when an impression arrives ("this is bad," "this is unfair") and you decide whether to give it your agreement. He returns to mortality, the brevity of fame, the futility of ambition. The book ends with a short personal exhortation to himself: "Do not fancy a long stretch of life still ahead. The hours are slipping by."`,
      blurb: `Also written on campaign. The book is sparer than Book Two and more inward. Marcus examines the discipline of <em>assent</em> — the moment when an impression arrives and you decide whether to give it your agreement — and returns to the brevity of life with sharper urgency.`,
      summary: [
        `Book Three is written, like Book Two, on the northern frontier. The exercises are tighter and more inward. Marcus is examining the soul piece by piece. What is mine, what is the body's, what is added by judgment. He works again on the discipline of <em>assent</em>: an impression arrives — "this is bad," "this is unfair," "this is going to ruin everything" — and the Stoic discipline is to inspect the impression before agreeing to it. Most of what we suffer, Marcus reminds himself, is the agreement, not the event.`,
        `The book is also full of memento mori, but more personal than Book Two's. Marcus is older now. He thinks of his predecessors — Hadrian, Trajan, the others — and notes that they are gone, with their schemes and their cruelties and the women they loved. The same thing will happen to him. The exercise is not depressing him; it is sharpening him. If everything is going to be carried away by the river of time, why give any of it your full attention except the part that is actually before you now?`,
        `The book ends with a direct exhortation. "Do not act as if you had ten thousand years to live. Death is hanging over your head. Get on with it. Be good while it's still possible." Marcus is reminding himself, not us. But the line lands either way.`,
      ],
      appears: [{ id: 'epictetus', name: 'Epictetus' }, { id: 'chrysippus', name: 'Chrysippus' }],
      themes: [{ slug: 'mortality', label: 'Mortality' }, { slug: 'reason', label: 'Reason' }],
    },
    {
      n: 4, title: 'The retreat into yourself', tourTitle: 'The retreat into yourself', hook: 'Book Four contains the most famous image in the Meditations — the inner retreat to which a person can withdraw whenever they need to.',
      tour: `Book Four is where the inner citadel becomes most explicit. "People look for retreats for themselves — in the country, by the seaside, in the mountains. You can do this any time you wish. Nowhere is a quieter or more untroubled retreat than your own soul." It is the most quoted image in the Meditations and possibly the most quoted in all Stoic philosophy. Marcus develops the image at length: how to enter the retreat, what to find there, why it is always available. The book also contains some of his sharpest lines on death and the river of time, including the famous metaphor of life as a campaign.`,
      blurb: `The book of the inner citadel. "Nowhere is a quieter or more untroubled retreat than your own soul." Marcus develops the image at length — how to enter the retreat, what to find there, why it is always available — and gives some of his sharpest formulations of the Stoic discipline of withdrawal-and-return.`,
      summary: [
        `Book Four contains what is probably the most famous passage in the entire Meditations. "People look for retreats for themselves," Marcus writes, "in the country, by the seaside, in the mountains; and you yourself are wont to long after such retreats. But this is altogether unphilosophical, when it is in your power at any moment you choose to retire into yourself. For nowhere does a man retire with more quiet or more freedom from trouble than into his own soul." It is the inner citadel made fully explicit.`,
        `The book develops the image at length. Marcus describes what one does in the retreat: rehearse the basic doctrines, recover one's principles, remind oneself that the cosmos is rational and that one's own ruling part is sovereign. He is concrete about how to use the retreat in moments of distress — when a senator has been rude, when news from the front is bad, when the body aches. The retreat is not an escape; it is a recalibration. You go in, you re-orient, you come out and continue.`,
        `Book Four also has some of the sharpest mortality writing. Life is a campaign, Marcus says, and a brief one — a short stay in a foreign land. The river of time bears each thing along, used a while, then gone. His own death, he tells himself, is now near. None of this is melodramatic; he is doing the exercise. By the end of the book the inner retreat and the brevity of life have become two faces of the same discipline. You retire into the citadel; you come out with the brevity refreshed; you act.`,
      ],
      appears: [{ id: 'epictetus', name: 'Epictetus' }, { id: 'heraclitus', name: 'Heraclitus' }, { id: 'chrysippus', name: 'Chrysippus' }],
      themes: [{ slug: 'inner-citadel', label: 'Inner citadel' }, { slug: 'mortality', label: 'Mortality' }, { slug: 'cosmos', label: 'Cosmos' }],
    },
    {
      n: 5, title: 'At dawn, when you have trouble getting out of bed', tourTitle: 'At dawn', hook: 'Book Five opens with the most useful sentence in the entire work. Even an emperor doesn\'t want to get up.',
      tour: `Book Five begins with what is, for many readers, the most usefully practical line in the Meditations: "At dawn, when you have trouble getting out of bed, tell yourself: I have to go to work — as a human being. What do I have to complain of, if I'm going to do what I was born for?" The rest of the book turns on the question of <em>role</em>. What was Marcus born for? Whatever he is doing today — emperor, husband, philosopher, soldier — is the role given to him by nature, and the task is to play it well, not to long for someone else's. The book is the Meditations' clearest statement of the Stoic doctrine of duty.`,
      blurb: `Opens with the most quoted morning line in the Meditations: "At dawn, when you have trouble getting out of bed..." The rest of the book is a meditation on role and duty — what you were born for, what is yours to do, why complaint is unworthy of the work.`,
      summary: [
        `Book Five opens with the morning line. "At dawn, when you have trouble getting out of bed, tell yourself: I have to go to work — as a human being. What do I have to complain of, if I'm going to do what I was born for, the things I was brought into the world to do?" Marcus needs to tell himself this in the morning. Even an emperor wants to stay in bed. The Stoic discipline is the daily decision to get up and do the work anyway.`,
        `The book then turns on the question of role. What is a human being for? The bee for honey, the eye for seeing, the foot for walking — and the human being for the kind of rational, social, virtuous activity human beings can do. To be a Stoic is to recognize the role one has been given (by nature, by birth, by the circumstances one finds oneself in) and play it well, without resenting it and without longing for someone else's. Marcus has the role of emperor; he did not choose it; it is his.`,
        `The book is also one of the most personal in the work. Marcus writes about his own irritability, his own slowness to forgive, his own susceptibility to praise. He reminds himself that the work is its own reward — "the prize of action is the action itself" — and that complaining about the work is unworthy of the worker. Get up. Do the work. The day is short, the work is long, and the work is what you are.`,
      ],
      appears: [{ id: 'antoninus', name: 'Antoninus Pius' }, { id: 'ungrateful-man', name: 'The ungrateful man' }],
      themes: [{ slug: 'duty', label: 'Duty' }, { slug: 'reason', label: 'Reason' }],
    },
    {
      n: 6, title: 'The portrait of Antoninus', tourTitle: 'The portrait of Antoninus', hook: 'Book Six contains the longest paragraph in the Meditations — Marcus\'s extended portrait of his adoptive father as the model of how to govern.',
      tour: `Book Six is the most personal of the early books. It contains, near its center, the longest sustained passage in the entire Meditations: a paragraph-long portrait of Antoninus Pius, Marcus's adoptive father and the previous emperor, as the model of how to govern with calm, decency, and self-rule. Antoninus, Marcus says, was a man "thought through carefully, as if he had time to spare," who "bore pain and grief without showing it," who "did nothing for the sake of show." The portrait is the closest thing in the Meditations to a moral argument by example. The rest of the book pulls back and returns to the standard exercises — death, the cosmos, the inner citadel — but with the Antoninus portrait still warming the room.`,
      blurb: `The most personal of the early books. Contains the famous portrait of Antoninus Pius — Marcus's adoptive father — as the model of how to govern. The portrait is the closest thing in the work to a moral argument by example, and warms the rest of the book.`,
      summary: [
        `Book Six contains, near its center, the long paragraph that is the closest thing the Meditations has to a sustained portrait of any one person. Marcus describes Antoninus Pius, his adoptive father and the emperor before him, as the model of decent rule. "Everything he did was thought through carefully, as if he had time to spare." He bore pain and grief without showing it. He did nothing for the sake of show. He did not flatter and did not enjoy being flattered. He was content with simple things. He kept the same friends his whole life. When new ideas came to him, he tested them slowly. When he had decided, he was firm.`,
        `The portrait is one of the most touching things in the work. Marcus is writing it years after Antoninus's death and clearly still measures himself against the man. The argument is not stated, but it is clear: this is what a good emperor looks like; this is what I am trying to be. The Meditations is, in part, the document of that effort.`,
        `The rest of Book Six pulls back to the regular exercises. The cosmos as one ordered system. The brevity of life. The discipline of assent. The futility of fame. Marcus repeats himself; that is the point. He has to remind himself of these things every day, and the book is partly a record of him doing so. But Antoninus, mentioned by name and then unnamed in dozens of passages, is the warmth at the center. Marcus is writing in the shadow of a man he loved.`,
      ],
      appears: [{ id: 'antoninus', name: 'Antoninus Pius' }, { id: 'heraclitus', name: 'Heraclitus' }, { id: 'slanderer', name: 'The slanderer' }],
      themes: [{ slug: 'duty', label: 'Duty' }, { slug: 'cosmos', label: 'Cosmos' }, { slug: 'inner-citadel', label: 'Inner citadel' }],
    },
    {
      n: 7, title: 'Older, plainer', tourTitle: 'Older, plainer', hook: 'A shift in tone. Marcus is older now and the writing thins out — fewer set pieces, more direct exhortation.',
      tour: `Book Seven marks a quiet shift. The early books contained many of the famous set pieces (the morning warmup, the inner citadel, the portrait of Antoninus). From Seven on, the writing thins. The fragments are shorter, the tone plainer, the exercises more repetitive. Marcus is older and there is less time. "How short a time you have left," he tells himself. "And the world will not remember you. Nor will you remember the world." Book Seven contains some of the simplest formulations in the work — including the much-quoted lines about not being ashamed to be helped and about the discipline of refusing the second arrow.`,
      blurb: `A quiet shift in tone. The set pieces are gone; the fragments are shorter and plainer; the urgency is up. Book Seven contains some of the simplest and most repeated formulations in the work — about not being ashamed to be helped, and about refusing the second arrow.`,
      summary: [
        `Book Seven marks a tonal shift in the Meditations. The early books had set pieces — the morning warmup of Book Two, the inner citadel of Book Four, the portrait of Antoninus in Book Six. From Book Seven on, the writing thins. The fragments are shorter; the tone is plainer; the exercises repeat more often.`,
        `Marcus is also older. He notes it. "How short a time you have left," he tells himself. The exercises are less developed and more direct. Death, the brevity of fame, the cosmos as one rational thing, the discipline of assent — these are now stated almost as reminders, in single sentences, sometimes barely a clause. The reader feels Marcus picking up his notebook in passing, jotting a single line, and putting it down.`,
        `The book contains some of the most quoted simple formulations in the work. "Do not be ashamed to be helped — it is like a soldier scaling a wall." "It can ruin your life only if it ruins your character." "Don't fire the second arrow." Each of these is a small Stoic exercise compressed to a sentence. By Book Seven Marcus has been doing the work long enough that the long formulations are no longer needed. He just needs the prompts.`,
      ],
      appears: [{ id: 'epictetus', name: 'Epictetus' }, { id: 'chrysippus', name: 'Chrysippus' }, { id: 'slanderer', name: 'The slanderer' }],
      themes: [{ slug: 'inner-citadel', label: 'Inner citadel' }, { slug: 'mortality', label: 'Mortality' }, { slug: 'reason', label: 'Reason' }],
    },
    {
      n: 8, title: 'The cosmos and the bee', tourTitle: 'The cosmos and the bee', hook: 'Marcus returns to the metaphysics. The world is one cosmos. You are one part of it. What is not good for the hive is not good for the bee.',
      tour: `Book Eight pulls the camera back. The exercises here are largely metaphysical — the universe as one ordered cosmos, providence, the rationality of nature. Marcus reminds himself again and again that the world is a single thing and that he is a part of it. "What is not good for the hive is not good for the bee" is from this book. The metaphysics is doing real work for him: it is the structural reason that nothing is anomalous, nothing is a betrayal, nothing in the universe is exempt from being part of the universe. From the hive perspective the worst events are still part of how the hive runs. Marcus uses this not to comfort himself but to keep his attention on the part of the hive he is responsible for.`,
      blurb: `The book of the cosmos and the bee. Marcus returns to the Stoic metaphysics — the world as one ordered system in which everything that happens is part of the whole — and uses it not as comfort but as a structural argument for why nothing in life should surprise the philosopher.`,
      summary: [
        `Book Eight pulls the camera back from the personal exercises and returns to the metaphysics. The cosmos is one. The universe is a single ordered system, run by reason, in which every part is connected to every other part. "All things are interwoven," Marcus says. "The bond is sacred." Whatever happens has its cause and its place; nothing is anomalous; nothing is unjust to the system, even when it is painful for the part.`,
        `From this metaphysics Marcus draws the practical move that runs through the book. "What is not good for the hive is not good for the bee." If you are part of a larger thing, you cannot benefit from what damages the larger thing. The corrupt official, the man who lies for advantage, the senator who tries to rule for his own gain — these people are not, from the cosmic perspective, succeeding. They are damaging the very system that makes their lives possible.`,
        `Book Eight also returns Marcus to his daily practice. The exercises here are tighter, more philosophical. He reminds himself that we control our judgments, not our circumstances. That praise from a corrupt judge is worthless. That the cosmos has no obligation to please him. That the philosopher's task is to align himself with the way of things and act accordingly. The metaphysics is not consoling him; it is structuring him.`,
      ],
      appears: [{ id: 'chrysippus', name: 'Chrysippus' }, { id: 'epictetus', name: 'Epictetus' }],
      themes: [{ slug: 'cosmos', label: 'Cosmos' }, { slug: 'duty', label: 'Duty' }, { slug: 'reason', label: 'Reason' }],
    },
    {
      n: 9, title: 'Late and exposed', tourTitle: 'Late and exposed', hook: 'The book of the late Marcus, plainer and harder. Sickness, fatigue, the end visibly closer.',
      tour: `Book Nine is one of the bleakest books in the Meditations and also one of the most direct. Marcus is older and visibly sicker, on a frontier where the campaigns are not going well, with a son he is increasingly worried about. The writing tightens. He repeats — almost angrily — that the cosmos is rational, that death is nothing to fear, that ingratitude is not a surprise, that one cannot be harmed by what is outside one's control. There are fewer extended passages; more single-line reminders. The book reads like Marcus needs the exercises in shorter and shorter doses just to get through the day.`,
      blurb: `One of the plainer and harder books. Marcus is older, sicker, on a frontier that is wearing him down. The fragments are tighter and the exercises shorter — Marcus seems to need them in smaller and faster doses now, just to get through the day.`,
      summary: [
        `Book Nine is plainer and bleaker than the books that come before it. Marcus is older, the campaign is dragging, his health is failing in ways he is starting to acknowledge. The fragments are shorter; the exercises are repeated more often; the tone is tighter. The book gives the strong impression of a man who has been doing the work for many years and now needs the prompts in smaller and faster doses.`,
        `The themes are the same as before: nothing happens that nature does not require; the cosmos is rational; you are a part, not a whole; ingratitude is not a surprise; death is nothing to fear. But the way Marcus phrases them is now almost angry. "Do not be vexed at the wickedness of others; you yourself were the kind of person who could be vexed." It is as if he is no longer interested in the reasoning and only in the conclusion. He needs the conclusion to land.`,
        `Book Nine is also where Marcus most directly reckons with his own ending. He is not afraid; the metaphysics has done its work. But he is tired. The book closes with one of the more haunting fragments in the work: "Why are you afraid of being dissolved? Look at how you came together. Look at how you will come apart. There is no harm in either." It is plain. It is also the sound of a man who knows the dissolution is close.`,
      ],
      appears: [{ id: 'chrysippus', name: 'Chrysippus' }, { id: 'epictetus', name: 'Epictetus' }, { id: 'slanderer', name: 'The slanderer' }],
      themes: [{ slug: 'mortality', label: 'Mortality' }, { slug: 'cosmos', label: 'Cosmos' }],
    },
    {
      n: 10, title: 'The whole and the parts', tourTitle: 'The whole and the parts', hook: 'Marcus turns once more to the cosmos and to his own place in it. By Book Ten the metaphysics is no longer being argued — it is simply being inhabited.',
      tour: `Book Ten works on the same metaphysical material as Book Eight but with a different mood. Marcus is no longer arguing for the rationality of the cosmos; he is simply living inside it. The universe is one. He is a part of it. His body is on loan. His spirit is on loan. The work he does is the cosmos doing its work through him. The book is full of small images — the river bearing things along, the tree growing toward the light, the bee in the hive — that are more poetic than philosophical. Book Ten reads like the work of a man who has finally stopped resisting the picture.`,
      blurb: `Marcus returns to the cosmos but with a different mood than Book Eight: he is no longer arguing for the picture, only living inside it. The book is full of small natural images — rivers, trees, bees, the body on loan — and reads like a man who has stopped resisting.`,
      summary: [
        `Book Ten covers some of the same metaphysical ground as Book Eight but in a markedly different mood. Marcus is no longer building the case for the rationality of the cosmos; he is living inside it. The fragments are calmer. He is reminding himself, more than persuading himself, of things he has now thoroughly believed for many years.`,
        `The book is full of small natural images. The river of time bearing things along. A tree pushing toward the light. A bee returning to the hive. Marcus uses these almost as koans. Each image carries the same lesson — you are a part, the part is on loan, the part will be returned to the whole — but the lesson goes down more easily as a picture than as an argument. Book Ten reads as if Marcus, late in his life, has earned the right to think in pictures.`,
        `There are still moments of urgency. He reminds himself again that he should not waste the day on resentment, that ingratitude is not a surprise, that he should do his work without asking for recognition. But the urgency is now baked into a deeper calm. The exercises are no longer fighting against a strong opposition in him. The opposition has worn down. What remains is a man who has talked himself into the philosophy so thoroughly that the philosophy is finally just how he thinks.`,
      ],
      appears: [{ id: 'heraclitus', name: 'Heraclitus' }, { id: 'chrysippus', name: 'Chrysippus' }],
      themes: [{ slug: 'cosmos', label: 'Cosmos' }, { slug: 'mortality', label: 'Mortality' }, { slug: 'inner-citadel', label: 'Inner citadel' }],
    },
    {
      n: 11, title: 'On not being damaged', tourTitle: 'On not being damaged', hook: 'Marcus returns one more time to the question of how others can — and cannot — hurt you.',
      tour: `Book Eleven is the book most concerned with other people. Marcus returns again to the question of whether anyone can really damage you, and his answer is the consistent Stoic one: only your own assent can damage you; what other people do to your body or your reputation is not, strictly, harm. He works through specific cases — the angry petitioner, the slanderer, the false friend, the colleague who lies in court — and rehearses, for each, the Stoic response. The book is also unusually generous: he reminds himself that the people who annoy him have their own reasons for being annoying, and that compassion is the right starting point even when justice has to follow.`,
      blurb: `The book most concerned with other people. Marcus works through specific cases — the angry petitioner, the slanderer, the false friend — and rehearses for each the Stoic response. Unusually generous in tone: compassion before judgment.`,
      summary: [
        `Book Eleven is the most socially focused of the books. Marcus returns again to the question of whether anyone can really damage you, and the answer is the same as it has always been: only your own assent can damage you. What another person does to your body or your reputation or your work is not, in the strict sense, harm. The harm only completes itself if you fire the second arrow at yourself.`,
        `He works through specific cases. The petitioner who is rude. The senator who has decided to dislike him. The flatterer. The man who lies in court. The friend who has betrayed a confidence. For each case he rehearses the response: this person is acting from ignorance; their action does not change what I am; my work is to do my own duty here, not to balance their account. By the eleventh book Marcus has gone through these moves so many times that he can run through them quickly.`,
        `What is striking in Book Eleven is the gentleness. Marcus reminds himself, repeatedly, that the people who annoy him have their own reasons. They are doing what they think is good. They cannot help being what they are. Compassion comes first; correction, where it must come, comes second. The book closes with a list of the names of philosophers who lived without bitterness — Marcus reaching for his predecessors one more time, reminding himself that this is possible.`,
      ],
      appears: [{ id: 'epictetus', name: 'Epictetus' }, { id: 'slanderer', name: 'The slanderer' }],
      themes: [{ slug: 'reason', label: 'Reason' }, { slug: 'inner-citadel', label: 'Inner citadel' }, { slug: 'duty', label: 'Duty' }],
    },
    {
      n: 12, title: 'The end', tourTitle: 'The end', hook: 'The final book. Marcus is close to death and the writing has the plainness of a man who knows it.',
      tour: `Book Twelve is the final book. The fragments are short, almost terse. Marcus is close to the end — within a year or two of his death — and the writing has the quality of a man closing his accounts. He repeats the central exercises one more time, briefly, almost in shorthand. He tells himself again that the cosmos is one, that the body is on loan, that the only harm is the harm one does to oneself. The book ends, famously, with a passage about leaving the stage. "Pass through your short time as a guest, content with what you have been given. Then exit, like a fruit that ripens and falls." The Meditations ends here.`,
      blurb: `The final book. Marcus is close to death and the writing has the plainness of a man who knows it. He runs through the central exercises one more time, briefly, and ends with the famous passage on leaving the stage like ripe fruit.`,
      summary: [
        `Book Twelve is the last book. Marcus is close to death — within a year or two of dying of plague at his camp on the Danube — and the book has the plainness of a man closing his accounts. The fragments are short, almost terse. He runs through the central exercises one more time, briefly: the cosmos is one, the body is on loan, the only harm is the harm one does to oneself, fame is dust, gratitude is owed.`,
        `He also returns, more directly than anywhere else in the work, to his own ending. He tells himself that he should not be afraid of what nature requires of him. That the time he has had has been generous. That he has been allowed to do the work given to him, mostly well. That he should leave the stage when called and not cling to the part. The book is undefensive about this. Marcus has talked himself into the picture so thoroughly that the picture finally looks like the truth.`,
        `The Meditations ends with one of the most famous passages in Roman literature. "Pass through your short time as a guest, content with what you have been given, then exit graciously — like a fruit that ripens and falls." It is plain. It is brief. It is the Stoic discipline of departure, in one image. Marcus puts down his notebook on this line. He died on campaign about a year later, of the plague that had been moving through the legions for nearly a decade. The notebook somehow survived.`,
      ],
      appears: [{ id: 'epictetus', name: 'Epictetus' }, { id: 'antoninus', name: 'Antoninus Pius' }, { id: 'commodus', name: 'Commodus' }],
      themes: [{ slug: 'mortality', label: 'Mortality' }, { slug: 'inner-citadel', label: 'Inner citadel' }, { slug: 'duty', label: 'Duty' }],
    },
  ],
}
