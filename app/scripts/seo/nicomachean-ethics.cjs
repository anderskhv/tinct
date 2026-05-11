// Nicomachean Ethics — SEO page data for build-seo-pages.cjs
// Aristotle, c. 340 BCE. Ten books of lecture notes on virtue, friendship, and the good life.
// Companion to aristotle-politics.cjs — Ethics is the threshold the Politics walks through.

module.exports = {
  id: 'nicomachean-ethics',
  title: 'Nicomachean Ethics',
  author: 'Aristotle',
  byline: 'c. 340 BC · Greek ethics and political philosophy',
  titleAccent: 'a guided tour',
  hook: 'Every action aims at some good. But what is the good that everything else aims at? Aristotle spends ten books answering that question — and the answer is not what most people expect.',
  genre: ['Philosophy', 'Ethics', 'Classical antiquity'],
  themesBlurb: 'Eudaimonia, virtue as habit, the mean, practical wisdom, akrasia, friendship.',
  castBlurb: 'The Lyceum',
  castDesc: 'The cast of the Ethics is not a story\'s cast but a set of types: the virtuous person, the practically wise, the incontinent, the magnanimous, the friend.',
  castSubtitle: 'The Ethics speaks not in characters but in types — exemplars, failures, and composites of human moral life.',
  chapterLabel: n => 'Book ' + ['I','II','III','IV','V','VI','VII','VIII','IX','X'][n-1],

  about: [
    `<em>Nicomachean Ethics</em> is the first systematic moral philosophy in the European tradition, and still the most argued-over. Aristotle composes it in the 330s BCE as lecture material at his Lyceum, and his son Nicomachus assembles the ten books after his father's death. It opens with one of the most consequential sentences in Western philosophy: every action aims at some good. From there, it follows where that claim leads — all the way to an account of human flourishing, the virtues that make it possible, and the friends it requires.`,
    `What distinguishes the <em>Ethics</em> from every morality book since is its method. Aristotle does not hand down rules. He describes what good people are like, how they become that way, and what kinds of perception and judgment a good life requires. The result is a book about character rather than obligation, about habit rather than principle, about the kind of life worth choosing rather than the minimum conditions for not harming others. Plato's shadow falls everywhere — Aristotle learned his method at the Academy — but the disagreements are as deep as the debts.`,
  ],

  chaptersSubtitle: 'All ten Books, from the function argument to the contemplative life.',
  chaptersLead: `<p>The ten books are continuous argument, not separate essays. Books I–II set the foundations: eudaimonia, the function argument, virtue as habit. Books III–V work through the moral virtues in detail: courage, temperance, generosity, magnificence, magnanimity, justice. Books VI–VII turn to intellectual virtue and the puzzle of weakness of will. Books VIII–IX are the sustained treatise on friendship. Book X returns to pleasure and the question of the highest life. Read sequentially — Aristotle assumes you have followed.</p>`,

  themesByline: 'Five threads through the treatise',
  themesLead: `The <em>Ethics</em> is not a list of rules but a method and a vocabulary. These five threads are where that vocabulary is most precisely defined — and most consequential for the two thousand years of moral philosophy that follow.`,

  groups: [
    { label: 'Books I–II · The foundations', subtitle: 'Eudaimonia, the function argument, virtue as habit and the doctrine of the mean.', chapters: [1, 2] },
    { label: 'Books III–V · The moral virtues', subtitle: 'Courage, temperance, generosity, magnanimity, justice — worked through one by one.', chapters: [3, 4, 5] },
    { label: 'Books VI–VII · Intellect and weakness of will', subtitle: 'Practical wisdom, the intellectual virtues, and the puzzle of akrasia.', chapters: [6, 7] },
    { label: 'Books VIII–IX · Friendship', subtitle: 'Three kinds of friendship — and why friendship of virtue is the precondition of the good life.', chapters: [8, 9] },
    { label: 'Book X · The highest life', subtitle: 'Pleasure revisited, and the contested conclusion: is the best life contemplative or active?', chapters: [10] },
  ],

  themes: [
    {
      slug: 'eudaimonia',
      title: 'Eudaimonia and the Function Argument',
      greek: 'the good that everything else aims at',
      preview: 'The question Aristotle opens with looks innocent and is not. Every action aims at some good. If there is no final good, desire goes on forever and comes to nothing. So there must be one — and its name is eudaimonia.',
      essay: [
        `Aristotle opens with one of the most consequential sentences in Western philosophy: every art, every branch of knowledge, every action and choice seems to aim at some good. Some ends are pursued for the sake of further ends — money for comfort, comfort for leisure. If this regress had no terminus, every choice would be empty. So there must be a final good, sought for its own sake and never for anything beyond it. Aristotle calls it eudaimonia — translated weakly as happiness, more accurately as flourishing or living well.`,
        `To say what eudaimonia consists in, Aristotle gives the function argument. Each thing has a characteristic activity that defines what it is to be that thing well: a knife in cutting, an eye in seeing, a harpist in harp-playing. Does a human being have such an activity? He does, Aristotle argues, and it cannot be mere life (shared with plants) or perception (shared with animals). It must be the activity of the rational part of the soul. The good for a human being is therefore the activity of the soul in accordance with virtue — and if there are several virtues, in accordance with the best and most complete, over a complete life.`,
        `The argument has been attacked from every angle for two thousand years. The basic move — that the good for a creature must be discovered by attending to the kind of creature it is — has survived every attack. It is the move every later virtue ethics depends on: Aquinas, Anscombe, MacIntyre. And the recognition that eudaimonia is not a feeling but an activity has shaped moral philosophy in ways that the rival Benthamite tradition still struggles to absorb.`,
      ],
      where: [
        { n: 1, label: 'Book I (the function argument, happiness and its conditions)' },
        { n: 10, label: 'Book X (the final answer — contemplation vs. the active life)' },
      ],
    },
    {
      slug: 'virtue-habit',
      title: 'Virtue as Habit and the Doctrine of the Mean',
      greek: 'we become just by doing just acts',
      preview: 'Moral virtue does not come from nature. It comes from habituation — and there is no formula for the right amount. The doctrine of the mean is a description of how virtue works, not a recipe for finding it.',
      essay: [
        `Book II contains the practical heart of the <em>Ethics</em>. Moral virtue, Aristotle says, is not given by nature; nature gives only the capacity to develop it. It comes about by habituation. We become just by doing just acts, temperate by doing temperate acts, brave by doing brave acts. As the builder becomes a builder by building, as the harpist becomes a harpist by playing, so the moral agent becomes virtuous by acting well — or vicious by acting badly. The early years of life are decisive, because habit forms what reason will later have to live with.`,
        `From this comes the doctrine of the mean. Each moral virtue is the median state between two vices: one of excess and one of deficiency. Courage stands between cowardice (deficiency) and rashness (excess). Generosity stands between stinginess and prodigality. Truthfulness stands between false modesty and boasting. But the mean is not the arithmetic middle; it is the right amount in the right matter toward the right person at the right time for the right reason — a list Aristotle himself admits is hard.`,
        `There is no formula. The person of experience and practical wisdom finds the mean by perception, the way a doctor finds the right dosage. And Aristotle adds, with characteristic precision, that some actions and feelings do not admit of a mean at all. There is no right amount of murder, theft, or adultery; the names already imply the wrong. The doctrine of the mean is not a recipe for moral mediocrity. It is the recognition that virtue is calibrated to circumstance, and that wisdom is the calibration.`,
      ],
      where: [
        { n: 2, label: 'Book II (virtue as habit; the doctrine of the mean introduced)' },
        { n: 3, label: 'Book III (courage and temperance examined)' },
        { n: 4, label: 'Book IV (further moral virtues: generosity, magnanimity)' },
      ],
    },
    {
      slug: 'phronesis',
      title: 'Phronesis and Intellectual Virtue',
      greek: 'practical wisdom — what virtue in action requires',
      preview: 'Book VI draws the distinction that the rest of the treatise needs: between moral virtues and intellectual ones. The key intellectual virtue is phronesis — practical wisdom — and it cannot be learned young.',
      essay: [
        `Book VI introduces a distinction ordinary moral talk usually slurs: the distinction between intellectual virtues and moral ones. Among the intellectual virtues, the one that organises the practical life is phronesis — practical wisdom. Phronesis is not cleverness, which is the ability to find means to any end, good or bad. It is the disposition to deliberate well about what is good for a human being overall and to act on the deliberation. It is what makes a virtuous person virtuous in actual cases.`,
        `A person who has the right values but cannot perceive what the present situation requires will fail. A person who can perceive but lacks the right values will use that perception against the good. Phronesis joins the two. It is acquired only by experience, which is why young men, Aristotle famously observes, may be excellent mathematicians but cannot be good moral philosophers: geometry can be learned without time, but ethics cannot. This is also why the <em>Ethics</em> is not addressed to the young. The intended reader already wants to be good and is trying to understand the activity they are already engaged in.`,
        `Alongside phronesis, Book VI describes scientific knowledge (of necessary truths), technical skill (of things that can be otherwise), and nous (intuitive understanding of first principles). The intellectual virtues together constitute the full rational life. What Book VI establishes is that moral virtue alone is insufficient: without the intellectual perception of what the situation requires, the virtuous disposition cannot find its proper expression.`,
      ],
      where: [
        { n: 6, label: 'Book VI (phronesis and the intellectual virtues)' },
        { n: 2, label: 'Book II (where the general need for judgment is first stated)' },
      ],
    },
    {
      slug: 'akrasia',
      title: 'Akrasia — Weakness of Will',
      greek: 'knowing the good and doing the bad anyway',
      preview: 'Socrates thought akrasia was impossible: to know the good is to do it. Aristotle insists it happens, and explains how. It is one of the most psychologically acute passages in ancient philosophy.',
      essay: [
        `Book VII takes up the puzzle that Plato had treated as a contradiction: akrasia, weakness of will. How can a person know that an action is wrong and do it anyway? Socrates had denied that this happened at all — to know the good, he argued, was necessarily to do it, so apparent cases of weakness of will were really cases of ignorance. Aristotle insists that akrasia does happen; it is a fact of moral experience that requires explanation rather than denial.`,
        `His explanation is careful. The akratic agent does possess the relevant general knowledge — "adultery is wrong" — but in the moment of temptation, passion overrides the activation of that knowledge. The person acts on a particular judgment ("this pleasure is available now") while the general principle remains notionally in place but functionally idle, like a drunk who recites theorems without understanding them. The knowledge is present but not operative.`,
        `The discussion is one of the most psychologically precise passages in classical philosophy, and the problem of akrasia has continued into modern philosophy of action without being resolved. What Aristotle does here is install the question permanently on the agenda — demonstrate that the phenomenon is real, that it requires a distinction between having knowledge and using it, and that its existence tells us something important about the structure of human motivation. He also distinguishes the akratic person from the vicious one: the akratic person knows they are doing wrong and regrets it; the vicious person does not.`,
      ],
      where: [
        { n: 7, label: 'Book VII (akrasia, its kinds and explanation)' },
        { n: 3, label: 'Book III (voluntary action and responsibility — the foundation)' },
      ],
    },
    {
      slug: 'friendship',
      title: 'Friendship as the Soil of the Good Life',
      greek: 'no one would choose to live without friends',
      preview: 'Books VIII–IX are the most generous section of the Ethics. Aristotle makes a claim that surprises modern readers: friendship is not an optional supplement to the good life but one of its preconditions.',
      essay: [
        `Books VIII and IX occupy more space than any other single topic in the <em>Ethics</em>, and they make a claim that still surprises readers raised on the assumption that morality is fundamentally about strangers. No one would choose to live without friends even if they had every other good. Friendship, Aristotle says, is necessary for life — it is either a virtue or implies one — and his analysis distinguishes three kinds.`,
        `Friendships of utility are based on what the friends can get from each other — common in commerce and politics — and last only as long as the usefulness does. Friendships of pleasure are based on the enjoyment one finds in the other's company — common among the young, who live by feeling. Both kinds are real and have their place, but neither is friendship in the highest sense. The third kind, friendship of virtue, is between two good people who love each other for what they are rather than for what they provide. It is rare, slow to form, and durable, because virtue is durable and the friend is loved as a second self.`,
        `Aristotle's deepest claim — often missed — is that this third kind of friendship is the precondition for fully exercising one's own virtue. Self-knowledge is difficult; the virtuous friend is the mirror in which you see yourself most clearly. To act well is hard alone; the friend shares the activity. Books VIII–IX are Aristotle's most personal stretch of writing: a man who has had great teachers and watched political men grow corrupt, the weight of long observation in every line. It is the section of the <em>Ethics</em> that has aged best.`,
      ],
      where: [
        { n: 8, label: 'Book VIII (three kinds of friendship)' },
        { n: 9, label: 'Book IX (friendship and self-knowledge; dissolving bad friendships)' },
      ],
    },
  ],

  castLead: `<p>The cast of the <em>Ethics</em> is not a story's cast. Aristotle writes in types — the morally excellent person, the practically wise, the incontinent, the great-souled. The historical figures he invokes (Homer's heroes, Socrates, Plato) appear as data for argument, not as characters. What follows are the central figures — author, editor, and philosophical types — that populate the treatise.</p>`,

  keyFigures: [
    { name: 'Aristotle', role: 'Author', body: `Born 384 BCE in Stagira; student at Plato's Academy for twenty years; tutor to the young Alexander of Macedon; founder of the Lyceum in Athens where these lectures were delivered. The <em>Nicomachean Ethics</em> is the longest and latest of three sets of ethical lectures he gave. He died in 322 BCE, having fled Athens after Alexander's death. The empirical, case-by-case method of the treatise — never reduce, always attend to the particular — reflects the man who also wrote the <em>History of Animals</em> and catalogued 158 Greek constitutions.` },
    { name: 'Nicomachus', role: 'Editor / Son', body: `Aristotle's son by his consort Herpyllis, named after Aristotle's father. The treatise gets its name either because Nicomachus edited the lecture notes after his father's death or because the work was dedicated to him; the ancient sources disagree. Nicomachus is said to have died young in war. The editorial attribution is a reminder that what we read was not published by Aristotle in his lifetime — it is lecture material, organised by hands that came after.` },
    { name: 'Plato', role: 'Teacher / Foil', body: `Aristotle's teacher for twenty years and the great background presence throughout the <em>Ethics</em>. Plato had argued that the good is a single transcendent Form. Aristotle rejects this in Book I with characteristic directness — though it is better to be respectful of one's friends, the philosopher loves truth more. The good for a horse, a pilot, a city, and a human being are different things, discovered by attending to each in its own nature. The disagreement is the founding move of the treatise and the most consequential break between teacher and student in the history of Western philosophy.` },
  ],

  cast: [
    {
      name: 'Aristotle',
      role: 'AUTHOR',
      body: `Born 384 BCE in Stagira on the northern coast of Greece, son of the personal physician to the Macedonian king. Student at Plato's Academy for twenty years. Tutor to the young Alexander of Macedon. Returned to Athens in 335 BCE and founded his own school, the Lyceum, whose lecture-treatises — Physics, Metaphysics, Politics, Ethics — come down to us as his philosophy. Died 322 BCE in Chalcis after fleeing Athens. The Nicomachean Ethics is one of three sets of ethical lectures; it is the longest, the latest, and the one his son preserved.`,
    },
    {
      name: 'Nicomachus',
      role: 'EDITOR / SON',
      body: `Aristotle's son by his consort Herpyllis, named after Aristotle's father. The treatise gets its name because Nicomachus edited the lecture notes after his father's death — or because the work was dedicated to him; the ancient sources disagree. He is said to have died young in war. The family connection has stuck to the title for two and a half thousand years, a small reminder that these books were not published by Aristotle himself.`,
    },
    {
      name: 'Plato',
      role: 'TEACHER / FOIL',
      body: `Aristotle's teacher for twenty years and the great background presence in the Ethics, often quoted, often corrected. Plato argued the good is a single transcendent Form. Aristotle rejects this in Book I with characteristic directness — though it is better to respect one's friends, the philosopher loves truth more, and the truth is that there is no single Form of the good shared across categories. This disagreement is the founding move of the treatise.`,
    },
    {
      name: 'The Spoudaios',
      role: 'MORAL EXEMPLAR',
      body: `The serious or virtuous person — spoudaios in Greek — is the recurring touchstone of the Ethics. Not an ideal type but a person one recognises: the person whose habits are good, whose perception of the situation is reliable, whose feelings track what is genuinely worth feeling, and whose actions can serve as a measure when one is uncertain about what to do. Invoked at the moments when the doctrine of the mean threatens to become abstract: what is the mean in this case? It is what the spoudaios would do.`,
    },
    {
      name: 'The Megalopsychos',
      role: 'GREAT-SOULED MAN',
      body: `The most striking and most contested portrait in the Ethics, sketched in Book IV. The great-souled person claims great honours and deserves them — concerned with great matters, slow to act unless something worthy is at stake, indifferent to small honours, candid in judgments, walking and speaking with measured deliberateness. To modern eyes he can read as insufferable; to many ancient eyes he was the noble ideal of the polis. Probably should be read as both: a virtue the doctrine of the mean has to discipline, a vice it narrowly averts.`,
    },
    {
      name: 'Alexander of Macedon',
      role: 'FORMER PUPIL',
      body: `Aristotle tutored Alexander from age thirteen until he became king at twenty, and the conjunction of the philosopher of the moral mean with the conqueror of the Persian Empire is one of the strangest in intellectual history. Alexander did not embody the Ethics; his anger, drinking, and murders of friends would have figured in a casebook of vice. Aristotle never names him in the surviving treatises and had to flee Athens after Alexander's death. Their relationship reads as a parable about the limits of teaching: habituation, he had written, must begin in childhood.`,
    },
  ],

  castGroups: [
    {
      label: 'Author and editor',
      characters: [
        { id: 'aristotle', tag: 'Author', name: 'Aristotle', epithet: 'The philosopher of the Lyceum', body: `Born 384 BCE in Stagira. Student at Plato's Academy for twenty years, tutor to Alexander, founder of the Lyceum. The Nicomachean Ethics is the longest and most mature of his three sets of ethical lectures. He is the empirical observer of the moral life — the same temperament that catalogued 158 constitutions and classified hundreds of animal species is here cataloguing the virtues and the kinds of friendship. Died 322 BCE.`, appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { id: 'nicomachus', tag: 'Editor', name: 'Nicomachus', epithet: 'Son and editor', body: `Aristotle's son by his consort Herpyllis. The treatise is named for him — either because he edited the lecture notes after his father's death or because the work was dedicated to him. Said to have died young in war. His name on the title is a reminder that these ten books were not published by Aristotle in his lifetime but assembled by those who came after.`, appears: [1] },
      ],
    },
    {
      label: 'Philosophical types',
      characters: [
        { id: 'spoudaios', tag: 'Type', name: 'The Spoudaios', epithet: 'The serious, virtuous person', body: `The recurring touchstone of the Ethics. A real person one recognises rather than an ideal abstraction — one whose habits are good, whose emotional responses track what is genuinely worth responding to, and whose actions provide a measure when the mean is hard to locate. "What would the spoudaios do?" is not a circular question but a perceptual one, for those who have spent enough time in the company of such people to have a sense of who they are.`, appears: [2, 3, 4, 5, 6, 7] },
        { id: 'megalopsychos', tag: 'Type', name: 'The Megalopsychos', epithet: 'The great-souled person', body: `Sketched in Book IV as the person who claims great honours and deserves them. Deliberate of gait, slow to act unless something worthy is at stake, candid in judgment, reluctant to confer benefits because doing so acknowledges a superior. The portrait is one of the most sharply etched in the Ethics and has divided readers for centuries: Aristotle's ideal, or a cautionary type the doctrine of the mean only barely saves from arrogance?`, appears: [4] },
        { id: 'akratic', tag: 'Type', name: 'The Akratic Person', epithet: 'The continent but weak-willed', body: `The figure at the centre of Book VII's analysis. The akratic person knows that what they are doing is wrong — unlike the vicious person, who does not — and regrets it afterward. They act at the instigation of passion while the general moral knowledge they possess remains notionally in place but functionally idle. Aristotle's analysis distinguishes them carefully from the vicious person (who lacks good values) and from the merely intemperate person (who does not even recognise excess as excess).`, appears: [7] },
        { id: 'phronimos', tag: 'Type', name: 'The Phronimos', epithet: 'The practically wise person', body: `The person who has phronesis — practical wisdom — as their defining intellectual virtue. They deliberate well about what is good for human beings in general and are capable of acting on that deliberation in particular circumstances. Distinct from the merely clever (who find means to any end, good or bad) and from the merely virtuous in character (who have the right dispositions but may misjudge situations). The phronimos is Book VI's answer to the question of what a fully realised moral agent looks like.`, appears: [6, 7] },
      ],
    },
    {
      label: 'Historical figures invoked',
      characters: [
        { id: 'plato', tag: 'Foil', name: 'Plato', epithet: 'Teacher and target', body: `Aristotle's teacher for twenty years at the Academy in Athens. Appears in Book I as the primary target of the argument against a single Form of the good: "though it is better to be respectful of friends, the philosopher loves truth more." The disagreement — that there is no transcendent Form of the good, only goods specific to the kind of thing in question — is the founding move of the Ethics and the most consequential break between teacher and student in Western philosophy.`, appears: [1] },
        { id: 'eudoxus', tag: 'Foil', name: 'Eudoxus', epithet: 'The hedonist philosopher', body: `The astronomer-philosopher who argued, on the basis of general observation, that pleasure is the chief good — since all rational and irrational creatures alike pursue it, it must be the best for all. Aristotle gives his argument more than usual respect in Book X, partly because of Eudoxus's personal reputation for self-mastery (which made the theory more credible) and partly because the argument is genuinely strong. Aristotle ultimately rejects it, but uses it as the serious version of the hedonist position worth addressing.`, appears: [10] },
      ],
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'The Good for Man',
      tourTitle: 'What are we aiming at?',
      hook: 'Every action aims at some good — but what is the final good at which everything else aims? The answer is eudaimonia, and the argument for it is the function argument.',
      tour: `Book I opens with one of the most consequential sentences in Western philosophy: every art, every branch of knowledge, every action and choice seems to aim at some good. If every end were sought for the sake of something further, desire would go on forever and come to nothing. So there must be a final end — the highest good — and the knowledge of it would carry great weight for the conduct of life. Aristotle locates this good in eudaimonia (flourishing, living well) and offers the function argument: just as a knife has its proper activity in cutting, so a human being has a proper activity — the activity of the rational part of the soul in accordance with virtue. Book I also surveys and rejects the candidates people actually offer: pleasure, honor, wealth. None of these is self-sufficient or final in the right sense. The book ends with the recognition that a complete life is required, and that neither goods of fortune (some of which are necessary) nor philosophical argument alone delivers eudaimonia.`,
      blurb: `Book I introduces the question and the method. All action aims at some good; the highest good is eudaimonia. The function argument establishes what eudaimonia consists in: the activity of the soul in accordance with virtue, over a complete life. Pleasure, wealth, and honor are surveyed and found insufficient.`,
      summary: [
        `Book I opens with an observation that looks obvious but has immense consequences: every art, every branch of knowledge, every action and deliberate choice aims at some good. Some goods are sought for the sake of further goods, but this chain cannot go on forever. There must be a final good — the highest of all — and knowing what it is would carry great weight for the conduct of life. Aristotle locates this inquiry within political science, since the good of the community is greater and more complete than the good of the individual.`,
        `The candidates people actually offer — pleasure, wealth, honor — are surveyed and found insufficient. Pleasure is pursued even by brutes; honor depends on those who confer it rather than on the person of worth; wealth is merely instrumental. Plato's Form of the Good is rejected in Book I's most famous aside: though it is better to be respectful of friends, the philosopher loves truth more, and there is no single Form of the good shared across all categories. The good for a pilot, a physician, and a human being are different things discovered by attending to each in its own nature.`,
        `To identify eudaimonia's content, Aristotle gives the function argument. Every thing has a characteristic activity: a knife cuts, an eye sees, a harpist plays. A human being's characteristic activity — what distinguishes us from plants and animals — is the activity of the rational part of the soul. The good for a human being is therefore the activity of the soul in accordance with virtue, and if there are several virtues, in accordance with the best and most complete, over a complete life. The book ends by noting that external goods — some wealth, some health, some luck — are necessary conditions for eudaimonia, though not sufficient for it.`,
      ],
      appears: [{ id: 'aristotle', name: 'Aristotle' }, { id: 'plato', name: 'Plato' }, { id: 'nicomachus', name: 'Nicomachus' }],
      themes: [{ slug: 'eudaimonia', label: 'Eudaimonia and the Function Argument' }],
    },
    {
      n: 2,
      title: 'Moral Virtue',
      tourTitle: 'How virtue is acquired',
      hook: 'Virtue is not given by nature. It comes from habit — and the doctrine of the mean explains not what virtue is but how to find it.',
      tour: `Book II establishes what is perhaps Aristotle's most influential practical doctrine: moral virtue comes from habituation, not nature. We become just by doing just acts, brave by doing brave acts — the same logic that makes a builder a builder by building. Two types of excellence are distinguished: intellectual (produced by teaching and requiring time) and moral (produced by habit, from the Greek word for custom). The doctrine of the mean follows: each virtue is the median between two vices, one of excess and one of deficiency. Courage is between cowardice and rashness; generosity between stinginess and prodigality. But the mean is not the arithmetic middle — it is the right amount for the right person at the right time. And some actions (murder, theft) admit no mean at all; the names imply the wrong. Book II closes by noting that pleasure and pain are the proper measures of character: the person who takes appropriate pleasure in virtuous action has formed the right habits; the one who finds it painful has not.`,
      blurb: `Book II introduces moral virtue as habit, distinguishes it from intellectual virtue, and gives the doctrine of the mean. Virtue is the median between excess and deficiency, found not by formula but by experience. Character is measured by the pleasures and pains one takes in virtuous action.`,
      summary: [
        `Aristotle begins Book II by distinguishing two kinds of excellence: intellectual (produced by teaching, requiring experience and time) and moral (produced by habit — the Greek word for moral virtue, ēthikē, derives from the word for custom, ethos). Moral virtue does not arise by nature, since nothing that exists by nature can be changed by habit. We are equipped by nature only with the capacity to receive virtue, and this capacity is perfected by exercise — just as we get bodily senses not by using them first but are born with them and then exercise them.`,
        `From this comes the doctrine of the mean. Moral virtue is the median state between two vices: excess and deficiency. Courage stands between cowardice (too little fear-management) and rashness (too much confidence). Generosity stands between stinginess and prodigality. The mean is not the arithmetic midpoint; it is what is right in relation to the right person, at the right time, in the right way, for the right reason. Finding it requires experience and practical wisdom, not calculation. Aristotle adds that some actions simply have no mean: there is no right amount of murder, adultery, or theft; the names already incorporate the condemnation.`,
        `Book II concludes by emphasizing pleasure and pain as the measure of character. The person of virtue takes appropriate pleasure in virtuous action and appropriate pain in vicious action. A person who acts justly but finds it painful has not yet formed the right habits; one who acts justly with positive pleasure, or at least without pain, has. This is why early habituation matters: the feelings that habit forms are what reason must work with for the rest of life. The goal is not suppression of feeling but alignment of feeling with what is genuinely worth responding to.`,
      ],
      appears: [{ id: 'aristotle', name: 'Aristotle' }, { id: 'spoudaios', name: 'The Spoudaios' }],
      themes: [{ slug: 'virtue-habit', label: 'Virtue as Habit and the Doctrine of the Mean' }],
    },
    {
      n: 3,
      title: 'Moral Responsibility and Particular Virtues',
      tourTitle: 'Courage and temperance',
      hook: 'Before examining the virtues in detail, Aristotle asks what makes an action voluntary — because praise and blame only track what is up to us.',
      tour: `Book III opens with a necessary preliminary: the distinction between voluntary and involuntary action. Praise and blame track what is voluntary; allowance is made for what is involuntary (done under compulsion or through ignorance). The classification matters practically, not only philosophically — legislators assign rewards and punishments, and they need the distinction. After establishing the framework of voluntary action, choice, and deliberation, Aristotle turns to the first two moral virtues: courage (the mean with respect to fear and confidence) and temperance (the mean with respect to pleasures of touch and taste). Courage is examined at length — its central instance is facing death in war, not as the only case, but as the clearest. The courageous person is not fearless but fears the right things in the right way. Temperance concerns bodily pleasures alone; the intemperate person is not reproached for loving music or beautiful objects but for excess in food, drink, and sex. The book covers both virtues in enough detail to show the doctrine of the mean in operation.`,
      blurb: `Book III establishes the theory of voluntary action and moral responsibility, then applies it to the first two virtues: courage (facing death in the right way, for the right reasons) and temperance (the proper mean with respect to bodily pleasures). Both are worked through in detail as instances of the general doctrine.`,
      summary: [
        `Book III opens with the question of voluntary action, because praise and blame only attach to what is up to us. Involuntary actions fall into two kinds: those done under compulsion (the origin lies entirely outside the agent) and those done through ignorance (the agent does not know the relevant particular facts). Mixed cases — like throwing goods overboard in a storm — are treated with care: the action is more like voluntary, because the person chooses it given their situation, even if they would not choose it in the abstract. Aristotle also distinguishes acts done from ignorance (genuinely involuntary) from acts done in ignorance (e.g., while drunk, which may not be excused).`,
        `The analysis of voluntary action leads to an account of choice and deliberation. We deliberate about means, not ends: the end (health, victory, the good) is given; deliberation works backward from it to find what is in our power. Choice is deliberate desire of what is in our power; it is the heart of moral action, since virtues are stable dispositions to choose in the right way. What falls under a person's choice is their moral responsibility.`,
        `The book then examines courage and temperance in detail. Courage is the mean with respect to fear and confidence. Its central instance is facing death in battle, not because other dangers do not require courage, but because this is the most demanding case. The courageous person fears what deserves fear and has the right attitude toward fear; the coward fears too much, the rash person too little. Temperance is the mean with respect to bodily pleasures — specifically those of touch and taste — and the intemperate person is one who takes pleasure in the wrong objects or in excess. Both virtues are shown to fit the doctrine of the mean established in Book II.`,
      ],
      appears: [{ id: 'aristotle', name: 'Aristotle' }, { id: 'spoudaios', name: 'The Spoudaios' }],
      themes: [{ slug: 'virtue-habit', label: 'Virtue as Habit and the Doctrine of the Mean' }],
    },
    {
      n: 4,
      title: 'Further Moral Virtues',
      tourTitle: 'Generosity, magnificence, magnanimity, and more',
      hook: 'Book IV works through the remaining moral virtues — generosity, magnificence, magnanimity, wit — showing the doctrine of the mean in action across the full range of human affairs.',
      tour: `Having established the pattern in Book III with courage and temperance, Aristotle applies it systematically to a range of further virtues in Book IV. Liberality (generosity) concerns the giving and receiving of wealth; its excesses and deficiencies are prodigality and stinginess, and giving is more characteristic of the virtue than receiving. Magnificence concerns large-scale expenditure — public giving, festivals, religious offerings — and differs from generosity in scale and context. Magnanimity (great-souledness) is the grandest and most contested virtue in the book: the great-souled person claims great honours and deserves them, is slow to act except for great occasions, is indifferent to small honours, and is candid in judgment. The portrait is Aristotle's most vivid and most divisive. Smaller virtues follow: the mean in ambition (between the over-ambitious and the under-ambitious), in irascibility, in social life (between the obsequious and the quarrelsome), in wit, and in a virtue that governs the presentation of oneself (truthfulness, between boasting and false modesty). Book IV reads as a gallery of recognisable human types.`,
      blurb: `Book IV works through the moral virtues beyond courage and temperance: generosity, magnificence, magnanimity (the most contested), proper ambition, tempered anger, wit, and truthfulness. Each is the mean between its characteristic excess and deficiency. The portrait of the great-souled person is Aristotle's most vivid and most divisive.`,
      summary: [
        `Book IV extends the analysis of moral virtue to the full range of social and civic life. Liberality — generosity with wealth — is the first virtue examined. The liberal person gives to the right people in the right amounts at the right times, doing so with positive pleasure or at least without pain. Giving is more characteristic of the virtue than receiving; the liberal person is distinguished from both the prodigal (who gives without discrimination or proportion) and the stingy (who hoards). Magnificence is liberality scaled up: it concerns large public expenditure (temples, festivals, public games) where the appropriate response is grandeur in proportion to the occasion.`,
        `The centrepiece of Book IV is magnanimity — great-souledness. The megalopsychos claims great honours and deserves them. He is slow to act unless something genuinely worthy is at stake; indifferent to small honours from inferiors; candid in his judgments because concealment is beneath him; measured in his gait and voice because nothing small excites him. Aristotle's portrait has divided readers for centuries — it can read as an ideal or as a cautionary type. The book positions it clearly as a virtue (excess: arrogance; deficiency: pusillanimity), but the description of the person of great soul is the most vividly particular in the whole treatise.`,
        `The remaining virtues of Book IV are gentler in scale: proper ambition (a mean between over-ambition and indifference to honour); evenness of temper (the mean with respect to anger); friendliness in social life (between obsequiousness and quarrelsomeness); wit (between buffoonery and boorishness); and truthfulness about oneself (between boastfulness and false modesty). Each section follows the same pattern: identify the matter, identify the excess and deficiency, describe what the person who hits the mean looks like. By the end of Book IV, the doctrine of the mean has been run across the full range of human affairs.`,
      ],
      appears: [{ id: 'aristotle', name: 'Aristotle' }, { id: 'megalopsychos', name: 'The Megalopsychos' }, { id: 'spoudaios', name: 'The Spoudaios' }],
      themes: [{ slug: 'virtue-habit', label: 'Virtue as Habit and the Doctrine of the Mean' }],
    },
    {
      n: 5,
      title: 'Justice',
      tourTitle: 'The virtue of the community',
      hook: 'Justice is the one virtue that is always exercised toward others — which makes it the most complete of all virtues, and the hardest to define.',
      tour: `Book V is the longest treatment of a single virtue in the Ethics and the one most concerned with political life. Aristotle distinguishes two senses of justice. General (or complete) justice is the exercise of all the virtues toward others — the just person simply is the person who does what the law requires, since good law requires virtuous action. Particular justice is a specific virtue concerned with distributions and rectifications. Distributive justice governs the allocation of goods according to merit — proportionate equality, not arithmetic equality. Corrective justice governs the rectification of unfair transactions: a judge restores the arithmetic mean between gain and loss. A separate discussion addresses reciprocal justice (exchange) and political justice (justice within a community of free and equal citizens under law). The book closes with a treatment of equity: since law is general and cases are particular, equity corrects the law where the general statement fails — not against the law's intention but in its spirit. Justice is the most complete of virtues because it is always exercised for others' good.`,
      blurb: `Book V gives the treatise's full account of justice: general justice (complete virtue toward others) and particular justice (distributive and corrective). Distributive justice is proportionate equality; corrective justice restores the arithmetic mean. The book ends with equity — the correction of law's generality by attention to the particular case.`,
      summary: [
        `Book V opens by distinguishing two senses of justice. In its broadest sense, justice is the exercise of complete virtue toward others — the just person is simply the person who acts as the law requires, and good law requires virtuous action. In this sense justice is the most complete of virtues, not because it is itself all the virtues, but because it is their exercise directed at others rather than at oneself. Aristotle quotes Theognis: "In justice is all virtue summed." Injustice in this broad sense is lawlessness or the disposition to take more than one's share.`,
        `Particular justice is more specific. Distributive justice concerns the allocation of goods by the community: honor, money, whatever can be divided among citizens who share in a political order. The principle is proportionate equality — not that everyone gets the same, but that distribution corresponds to merit (though Aristotle acknowledges that democrats and oligarchs disagree about what merit means). Corrective justice concerns transactions, both voluntary (contracts) and involuntary (theft, assault): here the principle is arithmetic equality, and a judge's role is to restore the mean between the gain of one party and the loss of the other.`,
        `The book closes with two important refinements. First, the discussion of reciprocity in exchange: money functions as a common measure that makes incommensurable goods comparable, and just exchange is governed by proportionate reciprocity. Second, the treatment of equity: since law must speak in general terms, cases arise that the legislator did not foresee. Equity corrects the law in these cases, not by going against the law's intention but by supplying what the legislator would have said if present. The equitable person is not merely just but perceives when the general rule misses the particular case — a form of practical wisdom at work within the domain of justice.`,
      ],
      appears: [{ id: 'aristotle', name: 'Aristotle' }, { id: 'spoudaios', name: 'The Spoudaios' }],
      themes: [{ slug: 'virtue-habit', label: 'Virtue as Habit and the Doctrine of the Mean' }],
    },
    {
      n: 6,
      title: 'Intellectual Virtue',
      tourTitle: 'Phronesis and the intellect',
      hook: 'Moral virtue alone is not enough. What makes virtue work in actual cases is phronesis — practical wisdom — and Book VI is where it becomes a technical concept.',
      tour: `Book VI makes a distinction the rest of the treatise has needed and that ordinary moral talk still tends to slur: the distinction between moral virtues (excellences of character) and intellectual virtues (excellences of mind). Aristotle divides the rational soul into two parts: the part that grasps necessary truths (the scientific) and the part that deliberates about things that can be otherwise (the calculative or practical). Five intellectual virtues are identified: scientific knowledge (epistēmē), technical skill (technē), practical wisdom (phronesis), intuitive understanding of first principles (nous), and philosophical wisdom (sophia). Among these, phronesis is the crucial one for the moral life: it is the disposition to deliberate well about what is good for human beings in general and to act on that deliberation. It cannot be learned young — experience is required. And it is what makes the doctrine of the mean operational: without phronesis, a person may have the right values but misjudge how to realise them in particular cases. Book VI is the intellectual hinge of the Ethics.`,
      blurb: `Book VI introduces the intellectual virtues: scientific knowledge, technical skill, practical wisdom (phronesis), intuitive understanding, and philosophical wisdom. Phronesis is the decisive one for moral life — the disposition to deliberate well about what is good for human beings and to act on it. It requires experience and cannot be learned young.`,
      summary: [
        `Book VI opens by returning to the doctrine of the mean and the observation that "act according to right reason" — while true — tells us nothing definite. What is right reason? The book's task is to answer that question. Aristotle begins by dividing the rational soul: one part grasps things whose principles cannot be otherwise (the scientific part); another deliberates about things that can be otherwise (the calculative or practical part). The excellences of these parts are correspondingly different.`,
        `Five intellectual virtues are distinguished. Scientific knowledge (epistēmē) is the disposition to grasp necessary truths by demonstration. Technical skill (technē) is the disposition to produce things according to true rational account. Intuitive understanding (nous) grasps the first principles that scientific knowledge takes as its starting points. Philosophical wisdom (sophia) is the combination of scientific knowledge and nous applied to the highest objects. And practical wisdom (phronesis) is the disposition to deliberate well about what is good for human beings in general and to act accordingly. Phronesis is not cleverness — cleverness is the ability to find means to any end, good or bad. Phronesis is the disposition calibrated to the genuinely good end.`,
        `The most important feature of phronesis is that it requires experience and cannot be had young. Aristotle's observation is precise: a young man may be a good mathematician, because mathematical truths require no contact with life, but he cannot be a good moral philosopher. Ethics is about things that can be otherwise — about how to act in particular circumstances — and only experience gives access to those particulars. The practically wise person is therefore the person whose general values are right and whose perception of particular situations is reliable: the person who can see what the present case calls for and do it. Book VI closes by noting that moral virtue without phronesis and phronesis without moral virtue are both incomplete.`,
      ],
      appears: [{ id: 'aristotle', name: 'Aristotle' }, { id: 'phronimos', name: 'The Phronimos' }, { id: 'spoudaios', name: 'The Spoudaios' }],
      themes: [{ slug: 'phronesis', label: 'Phronesis and Intellectual Virtue' }],
    },
    {
      n: 7,
      title: 'Continence and Pleasure',
      tourTitle: 'Weakness of will — and an account of pleasure',
      hook: 'Socrates said akrasia was impossible. Aristotle says it happens — and explains, with uncomfortable precision, exactly how.',
      tour: `Book VII has two main subjects: continence and incontinence (akrasia), and pleasure. The akrasia discussion is the more famous and the more philosophically demanding. Against Socrates, who argued that weakness of will was impossible (to know the good is to do it), Aristotle insists that it is real and common. His explanation: the akratic person possesses general moral knowledge but, in the heat of passion, fails to activate and apply it. The general knowledge is present — "excess in food is harmful" — but the minor premise ("this is excessive") is overridden by appetite before the conclusion ("don't eat it") can operate. The akratic person acts, regrets, and resumes the same pattern. They are distinguished from the vicious (who do not think they are doing wrong) and from the merely intemperate (who do not experience the conflict). Book VII's second half offers an account of pleasure: it is not a process but an activity — the unimpeded operation of a faculty in its natural condition. Aristotle navigates between those who say pleasure is bad and those who say it is the highest good, settling on the view that some pleasures are good, some neutral, and some bad.`,
      blurb: `Book VII examines akrasia (weakness of will) — the phenomenon Socrates thought impossible. Aristotle argues it is real: the akratic person acts against their own better judgment under the influence of passion. The second half offers an account of pleasure as the unimpeded exercise of a faculty in its proper condition.`,
      summary: [
        `Book VII opens with the observation that there are three dispositions to be avoided in moral character: vice, imperfect self-control (akrasia), and brutishness. The opposed positive dispositions are virtue, perfect self-control, and the heroic or godlike. Akrasia is the book's central subject. The question it raises was treated by Socrates as a paradox: since no one would knowingly choose what is worse for themselves, apparent cases of weakness of will must be cases of ignorance — the person did not really know the better course. Aristotle rejects this. Akrasia is a real and common phenomenon that requires explanation rather than denial.`,
        `His explanation turns on the distinction between having knowledge and using it. The akratic person possesses the general principle ("excess is harmful") but in the moment of temptation the particular perception ("this pleasure is available now") overrides the activation of that principle, so that the conclusion it should generate ("don't do it") never becomes operative. The person acts, knows they are acting wrongly, and afterward recognises the failure. This is different from the vicious person, who does not see the action as wrong; and from the merely intemperate, who does not experience the internal conflict. The akratic person is, in a morally significant sense, better than the vicious person: they have the right general values; they just cannot always make them govern.`,
        `The second half of Book VII takes up pleasure, surveying three positions: that pleasure is bad, that only some pleasures are good, and that pleasure is the highest good. Aristotle's own account distinguishes pleasure from process: pleasure is not the movement toward a natural state (like eating when hungry) but the activity of a faculty in its natural, unimpeded condition. Bodily pleasures fill a lack and so are accompanied by the prior pain of lack; but intellectual pleasures are not preceded by this kind of deficiency. The book ends by noting that bodily pleasures in excess — the pleasures the akratic person is typically overcome by — are not bad in themselves but bad in excess, and that the self-controlled person is not one who feels no desire but one whose desires do not override reason.`,
      ],
      appears: [{ id: 'aristotle', name: 'Aristotle' }, { id: 'akratic', name: 'The Akratic Person' }, { id: 'phronimos', name: 'The Phronimos' }],
      themes: [{ slug: 'akrasia', label: 'Akrasia — Weakness of Will' }],
    },
    {
      n: 8,
      title: 'Friendship',
      tourTitle: 'Three kinds of friendship',
      hook: 'No one would choose to live without friends even if they had every other good. Book VIII is Aristotle\'s sustained argument for why friendship is not optional.',
      tour: `Book VIII opens the Ethics' most generous and most-read section. Friendship is either a virtue or implies one, and it is necessary for life — not merely pleasant but required. Three kinds are distinguished: friendship of utility (each uses the other for some benefit, common in commerce and politics), friendship of pleasure (each enjoys the other's company, common among the young), and friendship of virtue (each loves the other for what they genuinely are). The first two are real friendships but dissolve when the utility or the pleasure ends. Only the third is friendship in the complete sense; it is rare and slow to form, because virtue takes time to develop, but it is the most durable because virtue is durable. Book VIII works through the logic of each kind in considerable detail, including the question of how friendships between unequal parties (parent and child, benefactor and recipient, husband and wife) are properly constituted, and what goes wrong when the grounds of a friendship shift after it has formed.`,
      blurb: `Book VIII distinguishes three kinds of friendship — utility, pleasure, and virtue — and argues that only the third is friendship in the complete sense. It is rare, slow to form, and durable: good people love each other for what they are. The book also examines friendships between unequal parties and the political dimension of concord.`,
      summary: [
        `Book VIII opens by arguing that friendship is necessary for life — not merely nice to have. The rich and powerful need friends to use their prosperity well; in poverty and adversity, friends are the only refuge. Friendship also binds communities; legislators care more about concord than about justice. The claim is that where friendship exists, justice is not separately required, but where justice exists, friendship is still needed in addition. From the start, friendship is not a supplement to a good life but one of its structural conditions.`,
        `Three kinds of friendship are distinguished. The first is based on utility: each person is useful to the other, and the friendship lasts as long as the usefulness does — common in commerce, politics, and old age. The second is based on pleasure: each person enjoys the other's company, and the friendship lasts as long as the enjoyment does — common among the young, who live by feeling. Both are genuine friendships and have their proper place. But neither is friendship in the complete sense, because neither loves the friend for what the friend is; each loves the friend for what the friend provides.`,
        `The third kind of friendship is between two good people who love each other for their character — for what they genuinely are rather than for what they provide. This kind is rare, because good people are rare; slow to form, because trust and knowledge take time; and durable, because virtue is durable and the friend is loved as a second self. The rest of Book VIII examines friendships between unequal parties — parent and child, benefactor and recipient, political ruler and citizen — and the principle that governs them: the superior should receive greater honour, the inferior greater benefit, so that what each contributes is proportionate to what each receives. Friendships of unequal parties work when this proportion is maintained; they fail when it is not.`,
      ],
      appears: [{ id: 'aristotle', name: 'Aristotle' }, { id: 'spoudaios', name: 'The Spoudaios' }],
      themes: [{ slug: 'friendship', label: 'Friendship as the Soil of the Good Life' }],
    },
    {
      n: 9,
      title: 'Friendship (continued)',
      tourTitle: 'Self-love, self-knowledge, and the friend as a second self',
      hook: 'The deepest claim in Books VIII–IX: the virtuous friend is the mirror in which you see yourself most clearly. Self-knowledge, Aristotle argues, requires another person.',
      tour: `Book IX continues the treatise on friendship with questions Book VIII raised but left open. Can we have a genuine friendship with ourselves? Aristotle says the good person has the right kind of self-love — they love the ruling, rational part of themselves and try to satisfy it; the base person loves the passions and satisfies those. Among the most distinctive arguments in Book IX: we need friends for self-knowledge. We can observe our neighbours more easily than ourselves; the virtuous friend, who knows us well and is good, is the mirror in which we see ourselves most clearly. The discussion of how many friends one can have (friendship of virtue requires time and intimacy; one cannot have many such friends), when to dissolve a friendship that has gone wrong, and why the happy person needs friends (not out of utility but because contemplation and virtuous activity are better shared) — all of this makes Book IX the section of the Ethics that reads most as practical wisdom accumulated from long observation of human life.`,
      blurb: `Book IX examines self-love, the dissolution of friendships, the question of how many genuine friends one can have, and the argument that even the happy person needs friends. The deepest claim: we need friends for self-knowledge — the virtuous friend is the mirror in which we see ourselves.`,
      summary: [
        `Book IX opens with the problems of reciprocity in friendships between unequal parties: how is the return to be measured when one person gives knowledge and another gives money, or one gives pleasure and another gives utility? The guiding principle is that the person who receives the first benefit should be the one to fix the value — since the giver cannot know in advance what the other will receive from the exchange. This applies even to the relationship between teacher and student of philosophy, where no precise price can be fixed but something proportionate should be offered.`,
        `Among the most philosophically significant passages in Book IX is the argument for self-love. The good person has the right kind of self-love: they love the rational, ruling part of themselves and live in accordance with it. The base person, by contrast, loves the passions and tries to satisfy those — this is the wrong kind of self-love, and it is from this that the derogatory use of "self-lover" derives. Aristotle's argument is that the virtuous person is most fully in accord with themselves: their reason, their desires, and their emotions all point in the same direction, which is what genuine harmony of the soul amounts to.`,
        `Book IX also makes the deepest claim in the whole treatise on friendship: that even the happy person needs friends, not for utility or pleasure but because virtuous activity is better shared and because self-knowledge requires another person. We perceive our own actions and characters less clearly than we perceive those of others; the virtuous friend, who knows us well and is genuinely good, is the mirror in which we see ourselves with the accuracy we cannot otherwise achieve. This is why friendship of virtue is not a luxury supplement to the good life but one of its structural requirements. The book closes by observing that one cannot have many friends of this kind — genuine friendship of virtue requires time, knowledge, and intimacy — and that "a few friends" is the proper answer to the question of how many.`,
      ],
      appears: [{ id: 'aristotle', name: 'Aristotle' }, { id: 'spoudaios', name: 'The Spoudaios' }],
      themes: [{ slug: 'friendship', label: 'Friendship as the Soil of the Good Life' }],
    },
    {
      n: 10,
      title: 'Pleasure and Happiness',
      tourTitle: 'The contemplative life — and the hand-off to politics',
      hook: 'Book X returns to pleasure and then to the question the whole treatise has been preparing: which life most fully realises the human good — the active or the contemplative?',
      tour: `Book X opens by revisiting pleasure, taking Eudoxus's hedonist argument seriously before refuting it. Pleasure is not a process toward a natural state but an activity — the unimpeded exercise of a faculty in proper condition. Having settled this, Book X turns to the Ethics' culminating question: what is the highest life? The answer, on the strict reading of the text, is the contemplative life — the activity of theoretical reason on the highest objects, which the gods themselves engage in and which humans share only in flickers. Contemplation is the most self-sufficient activity, the most continuous, the most pleasant, and the most divine. But Aristotle immediately qualifies: such a life is too high for a human being considered as an embodied, social, political animal; the second-best life is the life of moral virtue and civic engagement, and the Ethics has spent nine books taking that life with full seriousness. The book ends with an explicit hand-off to the Politics: individual ethics is incomplete without the political community, and the question of what makes a good city is the next inquiry.`,
      blurb: `Book X revisits pleasure — not a process but an activity, the unimpeded exercise of a faculty — and then answers the treatise's culminating question. The highest life is the contemplative, but the life of moral virtue is the distinctively human second-best. The book ends with the hand-off to the Politics: the good of the individual is realised only inside a good community.`,
      summary: [
        `Book X opens by returning to pleasure. Eudoxus had argued that pleasure is the chief good because all creatures pursue it — the very universality of the pursuit is proof of its value. Aristotle gives this argument more respect than it usually receives, partly because of Eudoxus's personal moral character (he was thought immune to the bias of being a pleasure-lover), but ultimately rejects it. Pleasure is not a process toward a natural state — not the movement of eating when hungry — but an activity: the unimpeded exercise of a faculty in its proper condition. Different pleasures are distinguished by the activities they accompany; the pleasures of philosophical contemplation are as different from the pleasures of bodily sensation as the activities themselves are different.`,
        `Having settled the account of pleasure, Book X turns to the question the Ethics has been building toward: which kind of life most fully realises eudaimonia? Aristotle's answer is the contemplative life — the life of theoretical reason directed at the highest objects, which the gods themselves engage in and which humans share only in flickers. Contemplation is self-sufficient (it depends on nothing external), continuous, most pleasant, and most divine. If any life is happiest, this is it. But Aristotle immediately qualifies: such a life is too high for human nature as embodied, social, and political. Insofar as we are all of those things, we live a second-best life — the life of moral and civic virtue — and the Ethics has spent nine books taking that life with full seriousness.`,
        `Book X ends with one of the most important transitions in Western philosophy: the hand-off to the Politics. The good of the individual, Aristotle says, cannot be fully realised inside the individual alone. It requires the right kind of community — laws, education, institutions that form citizens well from childhood. The question of what makes a good city is the subject of his next inquiry. Read together, the Ethics and the Politics are not two separate works but one continuous argument: ethics is incomplete without politics, and politics without ethics is mere technique.`,
      ],
      appears: [{ id: 'aristotle', name: 'Aristotle' }, { id: 'eudoxus', name: 'Eudoxus' }, { id: 'plato', name: 'Plato' }],
      themes: [{ slug: 'eudaimonia', label: 'Eudaimonia and the Function Argument' }, { slug: 'phronesis', label: 'Phronesis and Intellectual Virtue' }],
    },
  ],
};
