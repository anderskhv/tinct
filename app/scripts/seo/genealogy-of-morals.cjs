// SEO data for Nietzsche's On the Genealogy of Morals (1887)
// Non-narrative philosophy: a polemic in three essays plus preface.
// Voice: aphoristic, combative, polemical — name arguments precisely.

module.exports = {
  id: 'genealogy-of-morals',
  title: 'On the Genealogy of Morals',
  author: 'Friedrich Nietzsche',
  byline: '1887 · Philosophy · A polemic in three essays',
  titleAccent: 'a guided tour',
  hook: 'Where do moral values come from? Not whether they are true — Nietzsche does not ask that. He asks who made them, and what they wanted.',
  themesBlurb: 'Ressentiment, master and slave morality, guilt as debt, the ascetic ideal, the will to power through values.',
  castBlurb: 'The moral laboratory',
  castDesc: 'Types, not individuals — the figures whose psychology produced our moral vocabulary.',
  castSubtitle: 'The moral laboratory — the types whose psychology made our values.',
  chapterLabel: n => n === 1 ? 'Preface' : `Essay ${n - 1}`,
  genre: ['Philosophy', 'Polemic', 'Ethics', 'Genealogy'],

  about: [
    `<em>On the Genealogy of Morals</em> is a polemic. Nietzsche says so on the title page, and he means it. Written in the summer of 1887 to sharpen what <em>Beyond Good and Evil</em> had stated obliquely, it asks a single deceptively flat question: where do our moral values actually come from? Not whether they are true. Not whether they are good. Where they came from, who made them, and what those makers wanted.`,
    `The first essay tells the story of the slave revolt in morality — how "good" once meant noble and powerful, and was inverted by ressentiment into a weapon against the strong. The second traces guilt back through the creditor-debtor relation in archaic law to the "bad conscience": cruelty turned inward when it could no longer find an outward target. The third asks what ascetic ideals mean, and answers: a will that would rather negate itself than not will at all. Together, the three essays do not merely critique European morality; they locate the interested parties behind it — above all, the priest — and ask whether the human animal can yet be released into something braver than guilt.`,
  ],
  chaptersSubtitle: 'All 4 chapters — preface, then three essays that dismantle the foundations of European morality.',
  chaptersLead: `<p>The <em>Genealogy</em> opens with a dense preface in which Nietzsche explains how he came to the problem and hands the reader a method: history, philology, psychology, suspicion. Essay 1 reconstructs the slave revolt in morality. Essay 2 genealogizes guilt and the bad conscience. Essay 3 — the longest — asks what ascetic ideals mean for the artist, the philosopher, the priest, and modern humanity. Each essay is self-contained; all three are one assault on the unexamined inheritance of European morality.</p>`,
  themesByline: 'Five threads through the polemic',
  themesLead: `Nietzsche is not arguing that kindness is bad or cruelty good. He is arguing that our moral feelings have a history, that they were made by particular people for particular reasons, and that the reasons were not what those people said they were. The genealogy is an act of suspicion in the service of honesty.`,

  groups: [
    { label: 'Preface', subtitle: 'Method, history, and the problem that has followed Nietzsche since boyhood.', chapters: [1] },
    { label: 'Essay 1', subtitle: 'The slave revolt — how "good and bad" became "good and evil."', chapters: [2] },
    { label: 'Essay 2', subtitle: 'Guilt as debt — the bad conscience as cruelty turned inward.', chapters: [3] },
    { label: 'Essay 3', subtitle: 'The ascetic ideal — what it means to will nothingness rather than not will at all.', chapters: [4] },
  ],

  themes: [
    {
      slug: 'slave-revolt',
      title: 'The slave revolt in morality',
      greek: '"Ressentiment itself becomes creative and gives birth to values"',
      preview: 'The central historical claim of Essay 1: the moral vocabulary we have inherited is not the original one. "Good" once meant noble, powerful, self-affirming. The slave revolt inverted the table — and Nietzsche thinks it conquered Rome.',
      essay: [
        `"The slave revolt in morality begins when ressentiment itself becomes creative and gives birth to values." Nietzsche puts this in italics for a reason. He is arguing that there was an earlier evaluation, the noble one, in which "good" was simply what the strong, the fortunate, the self-affirming called themselves — and "bad" was the residual category, named almost as an afterthought. The word <em>bonus</em> in Latin, Nietzsche argues from philology, once meant simply the warrior.`,
        `The slave revolt inverts this. Unable to act, the powerless invent a counter-valuation: the noble are now "evil," the suffering are "good." Nietzsche locates the historical engine of this revolt in the Jewish prophetic tradition and finds its world-conquering form in Christianity. He is careful, and the carefulness matters: this is not a racial claim but a psychological and historical one. A subjugated people produced a moral language that eventually colonized the imagination of their conquerors.`,
        `What is at stake is not whether kindness is good or cruelty bad. Nietzsche is not endorsing the noble morality as a personal program — he says explicitly that the slave revolt produced a subtler, more inward human being than the noble world ever managed. What is at stake is the recognition that moral feelings have a history, that they were made by particular people for particular reasons, and that the reasons were not what those people said. Calling something "evil" is, in the genealogical reading, often a disguised act of weakness — the inability to revenge oneself, transfigured into the conviction that one is morally superior for not doing so. That recognition is the gift, and the wound, that Essay 1 delivers.`,
        `Nietzsche ends with a question he treats as open: has Judaea beaten Rome? He thinks so — he points to the fact that in Rome itself you now bow before a Jew, crucified. But he leaves open the possibility of a revaluation of the revaluation. "Rome or Judaea?" is the question he drops into the reader's hands at the essay's close. The polemic does not resolve it. It insists that you cannot answer it honestly without first having read the genealogy.`,
      ],
      where: [
        { n: 2, label: 'Essay 1 (the slave revolt)' },
        { n: 2, label: 'Essay 1 (the bird of prey and the lamb)' },
      ],
    },
    {
      slug: 'ressentiment',
      title: 'Ressentiment as the engine of moral inversion',
      greek: '"His soul squints"',
      preview: 'Ressentiment is kept in French because no other word carries the same charge. It is not anger — anger discharges itself. Ressentiment is what anger becomes when it cannot discharge: stored, festering, finally creative.',
      essay: [
        `Ressentiment is the word Nietzsche keeps in French because no German word and no English one carries quite the same charge. It is not anger. Anger is clean, immediate, a response that discharges itself. Ressentiment is what anger becomes when it cannot discharge — when the one who suffers cannot strike back, and so the feeling turns inward, festers, imagines, and finally produces values.`,
        `The man of ressentiment, Nietzsche writes, is "not honest and naive, neither honest nor straightforward with himself." His soul squints. He does not act; he reacts. He cannot forget, because forgetting requires a strong digestion of experience. He is the great rememberer, the great accountant of slights. And out of this constitution he produces the most consequential thing in the history of the human spirit: a system of values in which his condition — patience, humility, meekness — is named virtuous, and the condition of those who oppress him is named wicked.`,
        `This is the engine of the slave revolt. Without ressentiment, the inversion of master and slave morality could not have happened. Nietzsche is precise: it is creative ressentiment, ressentiment that has had to wait, centuries in which to work, that finally gives birth to a new form of evaluation. He admires the achievement even as he diagnoses it. The slave revolt produced subtler souls than the noble world ever managed.`,
        `But the cost is real. A morality grown from ressentiment is permanently reactive. It needs an enemy — an "evil" outside itself — in order to feel itself as "good." This is why Nietzsche thinks Christianity is structurally bound to the figures of Satan, the world, the flesh. Take away the enemies and the morality collapses, because it never had a positive content of its own. The noble said "I am good, therefore you are bad." The slave says "you are evil, therefore I am good." The order of the propositions, Nietzsche insists, is everything.`,
      ],
      where: [
        { n: 2, label: 'Essay 1 (the man of ressentiment)' },
        { n: 2, label: 'Essay 1 (the bird of prey and the lamb)' },
      ],
    },
    {
      slug: 'guilt-conscience',
      title: 'Guilt as internalized cruelty: the bad conscience',
      greek: '"If something is to stay in the memory it must be burned in"',
      preview: 'Essay 2 opens with the breeding of an animal that can make promises. Its answer to how: pain. From the creditor-debtor relation comes the whole architecture of guilt. From enclosed society comes cruelty turned inward.',
      essay: [
        `The second essay opens with the breeding of "an animal with the right to make promises." Nietzsche begins from the practical problem: how does a creature as forgetful as the human being acquire a memory reliable enough to bind itself across time? His answer is unsparing — through pain. "If something is to stay in the memory it must be burned in: only that which never ceases to hurt stays in the memory." Law, punishment, ritual mutilation, sacrifice: these are the technologies by which the human animal was made calculable.`,
        `Out of this came the concept of guilt — and Nietzsche notes that the German word <em>Schuld</em> means both guilt and debt. The original moral relation, he argues, is the contractual one between creditor and debtor. When the debtor cannot pay, the creditor takes pleasure in punishing him; the equivalence is established not by money but by suffering. From this concrete economic logic the whole moral architecture of guilt was raised: conscience, duty, the sacredness of obligation.`,
        `The bad conscience is what happens when the aggressive instinct can no longer find an outward target. Once the human animal was enclosed in the walls of society and the peace of the state, instincts that had discharged themselves in the open — cruelty, the joy of destroying — turned backward against their possessor. "All instincts that do not discharge themselves outwardly turn inward." That, Nietzsche says, is the origin of bad conscience. Man becomes the animal that suffers from itself.`,
        `This is one of the most consequential moves in modern philosophy. It refuses to treat conscience as the voice of God or reason. It treats it as a historical product — cruelty that has lost its outward object and found a new one in the self. The guilt is real; the wound is real. Nietzsche is not saying otherwise. He is saying the wound has a story, and the story is not flattering. To know how it was made is the first step toward asking whether it must remain.`,
      ],
      where: [
        { n: 3, label: 'Essay 2 (breeding the promising animal)' },
        { n: 3, label: 'Essay 2 (guilt and debt)' },
        { n: 3, label: 'Essay 2 (the bad conscience)' },
      ],
    },
    {
      slug: 'ascetic-ideal',
      title: 'The ascetic ideal as the will turned against itself',
      greek: '"Man would rather will nothingness than not will"',
      preview: 'Essay 3 is the longest and strangest. It asks what ascetic ideals mean for the artist, the philosopher, the priest, and modern humanity. The answer: a will so bereft of direction that it wills its own negation rather than cease willing.',
      essay: [
        `The third essay opens with a question: what is the meaning of ascetic ideals? Why does the artist, the philosopher, the priest, and all of modern humanity keep producing an ideal that says no to the body, no to the senses, no to this life in favor of another? Nietzsche works through the cases with characteristic violence of method — dissecting each in turn, never letting any of them off.`,
        `The artist's asceticism is mostly costume — Nietzsche demolishes Wagner's turn to Parsifal in two pages. The philosopher's is a useful hygiene: solitude, abstinence, poverty as conditions for the work. But the priest's is something else entirely, and the priest is the figure on whom the essay turns. The ascetic priest does not merely practice asceticism; he sells it. He gives the suffering of the herd a meaning. He tells the sufferer: you suffer because you are guilty, and the cure is more denial, more turning away, more renunciation. The priest does not heal the wound. He makes the wound the center of a moral economy and so becomes indispensable.`,
        `The deepest claim of the essay is psychological. The ascetic ideal expresses a will that has so completely lost confidence in life that it would rather will nothingness than not will at all. "Man would rather will nothingness than not will." That sentence is the dark center of the book. It explains why the ascetic ideal has been so durable — it answers the meaninglessness of suffering, which the human animal cannot endure, by giving suffering a purpose, even if the purpose is self-negation. The ascetic priest is therefore not a villain but a historical necessity. He kept the herd alive. The question is whether the herd can survive without him.`,
        `Nietzsche does not propose, in this essay, an alternative ideal. He closes with the admission that the ascetic ideal still has no rival — not science, not modern history, not secular humanism, all of which Nietzsche accuses of still operating within the ascetic ideal's framework, especially its commitment to truth at all costs. The genealogy ends as an open wound and a wager: the philosopher who could embody a different will is on his way. He is not here yet.`,
      ],
      where: [
        { n: 4, label: 'Essay 3 (the ascetic priest)' },
        { n: 4, label: 'Essay 3 ("will nothingness rather than not will")' },
        { n: 4, label: 'Essay 3 (science and the ascetic ideal)' },
      ],
    },
    {
      slug: 'priest-valuator',
      title: 'The priest as the great valuator',
      greek: 'The most dangerous man in the history of morality',
      preview: 'Across all three essays one figure recurs: the priestly type. Not a particular religion — a psychological-historical role. The human being whose will to power runs through the manipulation of values, not through arms.',
      essay: [
        `Across all three essays, one figure recurs: the priestly type. He is not a particular individual or a particular religion. He is a psychological-historical role — the human being in whom the will to power expresses itself not through arms or wealth but through the manipulation of values. Nietzsche thinks the priest is the most dangerous and the most consequential figure in the history of morality.`,
        `The priest emerges first in Essay 1, as the bearer of the slave revolt. Where the warrior caste evaluated by sheer overflow — calling itself good and others bad almost as an afterthought — the priestly caste developed a different and finally more powerful instrument: the capacity to name, to invert, to revalue. Cut off from the direct exercise of strength, it became the master of interpretation. The priest is the one who calls the strong "evil" and patience "virtue." He is the first great revaluator.`,
        `In Essay 2 the priest organizes guilt into a stable economy. He provides the explanation for suffering and the price of its cure. Without him, the bad conscience might have remained inarticulate. With him, it becomes a system — sin, atonement, sacrament, debt to a god whose debt cannot be paid, hence the necessity of Christ. In Essay 3 the priest is explicit: he is the manager of the herd's resentment, the one who keeps the wound turning inward so that the herd survives its own weakness without destroying itself or its rulers.`,
        `Nietzsche's relation to this figure is complicated. He despises the priest's effects and admires his cunning. The priest, after all, is a creator of values — and creation of values is what Nietzsche himself demands of the philosopher of the future. The difference is the direction of the creation. The priest creates values that protect weakness by inverting strength. The philosopher Nietzsche envisions would create values that affirm life without needing an enemy. The genealogy is therefore not a denunciation of valuation as such. It is a fight for who gets to do it.`,
      ],
      where: [
        { n: 2, label: 'Essay 1 (the priestly inversion)' },
        { n: 3, label: 'Essay 2 (the guilt economy)' },
        { n: 4, label: 'Essay 3 (the ascetic priest)' },
      ],
    },
  ],

  cast: [
    {
      name: 'The noble / master type',
      role: 'ORIGINAL VALUATOR',
      description: `The figure on whom the first essay's reconstruction depends. Nietzsche imagines an aristocratic caste whose evaluation is direct and self-affirming: it calls itself "good" out of the sheer fact of its own flourishing — strong, fortunate, beautiful, capable — and names the rest "bad" almost in passing. He cites Greek and Roman examples and the Latin word bonus, suggesting it once meant the warrior. The noble is not Nietzsche's ideal — he is psychologically shallow, incapable of the inwardness the slave revolt later produces. He is a historical reference point, the morality that existed before ressentiment got to work.`,
    },
    {
      name: 'The priestly type',
      role: 'GREAT VALUATOR',
      description: `The crucial figure of the book. The priest is the human being whose will to power runs through interpretation rather than action. Cut off from the direct exercise of strength, the priestly caste develops a more dangerous instrument — the capacity to name, to invert, to revalue. He is the engine of the slave revolt in Essay 1, the architect of the guilt economy in Essay 2, and the manager of ascetic suffering in Essay 3. Nietzsche's contempt for the priest is matched by his recognition that the priest is, historically, the great creator of values — the role Nietzsche wants the philosopher to take back.`,
    },
    {
      name: 'The slave / herd',
      role: 'BEARER OF RESSENTIMENT',
      description: `Not a literal slave class but a psychological-historical type: the human being whose situation does not permit direct discharge of feeling, whose response to suffering is therefore mediated, remembered, internalized. Out of this constitution arises ressentiment, and out of ressentiment the inversion that calls the strong "evil" and the weak "good." Nietzsche is more ambivalent than he is sometimes read. He thinks the slave revolt produced a subtler, deeper, more interesting kind of soul. But he insists on naming the price: a morality permanently reactive, dependent on enemies for its self-conception, unable to affirm itself in its own terms.`,
    },
    {
      name: 'The ascetic priest',
      role: 'MANAGER OF SUFFERING',
      description: `The specific form of the priestly type that dominates Essay 3. The ascetic priest does not heal the wound of meaningless suffering — he gives the wound a meaning. He tells the sufferer: you suffer because you are guilty, and the cure is more renunciation. He directs the herd's aggression inward, away from any outward target that might destroy the social fabric, and so becomes indispensable. Nietzsche calls him the saviour, shepherd, and advocate of the sick herd, and notes the dark genius of the role: he organizes self-negation so successfully that the human animal would rather will nothingness than not will at all.`,
    },
    {
      name: 'The philosopher (the unnamed antagonist)',
      role: 'NIETZSCHE\'S HOPE',
      description: `Never described in detail, but everywhere implied. The philosopher of the future is the figure who could create values without needing the priest's machinery — without the inversion, the self-cruelty, the negation of life. He would do what the noble could not (think genealogically, with the depth the slave revolt taught the human animal) and what the priest will not (affirm without enemies). Nietzsche treats the genealogy itself as preparation for this figure: a clearing of the ground. The book closes with the warning that the ascetic ideal still has no rival, and the wager that the philosopher who could be its rival is on the way.`,
    },
    {
      name: 'Spinoza and Schopenhauer',
      role: 'CITED ANTECEDENTS',
      description: `Nietzsche names them at strategic moments. Spinoza appears in Essay 2 around the question of bad conscience — Nietzsche notes Spinoza's clear-eyed refusal to treat remorse as anything other than a sad passion, a position Nietzsche admires and extends. Schopenhauer is the great foil of Essay 3: the philosopher whose answer to the question of ascetic ideals was to embrace them, to read the will's negation of itself as the highest wisdom. Nietzsche treats Schopenhauer's case as the most honest expression of the ascetic ideal in modern philosophy — and therefore as the position he most needs to overcome. They are the philosophical inheritance the Genealogy is fighting through.`,
    },
  ],

  castGroups: [
    {
      label: 'The historical types',
      characters: [
        {
          id: 'noble-type',
          tag: 'RECONSTRUCTED',
          name: 'The noble / master type',
          epithet: 'Original valuator',
          body: `The figure on whom the first essay's reconstruction depends. Nietzsche imagines an aristocratic caste that calls itself "good" out of sheer flourishing — strong, fortunate, capable — and names the rest "bad" almost in passing. He cites Greek and Roman examples and the Latin word <em>bonus</em>. The noble is not Nietzsche's ideal: he is psychologically shallow, incapable of the inwardness the slave revolt later produces. He is a historical reference point, the morality that existed before ressentiment got to work.`,
          appears: [2],
        },
        {
          id: 'slave-type',
          tag: 'RECONSTRUCTED',
          name: 'The slave / herd',
          epithet: 'Bearer of ressentiment',
          body: `Not a literal slave class but a psychological-historical type: the human being whose situation does not permit direct discharge of feeling, whose response to suffering is therefore mediated, remembered, internalized. Out of this constitution arises ressentiment, and out of ressentiment the inversion that calls the strong "evil" and the weak "good." Nietzsche is ambivalent: he thinks the slave revolt produced a subtler, more inward soul. But a morality grown from ressentiment is permanently reactive — it needs an enemy to feel itself as "good."`,
          appears: [2, 3],
        },
        {
          id: 'priestly-type',
          tag: 'HISTORICAL',
          name: 'The priestly type',
          epithet: 'Great valuator',
          body: `The crucial figure of the book. The priest is the human being whose will to power runs through interpretation rather than action. Cut off from the direct exercise of strength, the priestly caste developed a more dangerous instrument: the capacity to name, to invert, to revalue. He is the engine of the slave revolt in Essay 1, the architect of the guilt economy in Essay 2, and the manager of ascetic suffering in Essay 3. Nietzsche's contempt for the priest is matched by his recognition that the priest is the great creator of values — the role he wants the philosopher to take back.`,
          appears: [2, 3, 4],
        },
        {
          id: 'ascetic-priest',
          tag: 'HISTORICAL',
          name: 'The ascetic priest',
          epithet: 'Manager of suffering',
          body: `The specific form of the priestly type that dominates Essay 3. He does not heal the wound of meaningless suffering — he gives the wound a meaning. Tells the sufferer: you suffer because you are guilty, and the cure is more renunciation. Directs the herd's aggression inward, away from any outward target, and so becomes indispensable. Nietzsche calls him the saviour, shepherd, and advocate of the sick herd — and notes the dark genius: he organizes self-negation so successfully that the human animal would rather will nothingness than not will at all.`,
          appears: [4],
        },
      ],
    },
    {
      label: 'The philosophical figures',
      characters: [
        {
          id: 'unnamed-philosopher',
          tag: 'PROJECTED',
          name: 'The philosopher of the future',
          epithet: 'Nietzsche\'s hope',
          body: `Never described in detail, but everywhere implied. The philosopher of the future is the figure who could create values without needing the priest's machinery — without inversion, self-cruelty, or negation of life. He would do what the noble could not (think genealogically, with the depth the slave revolt taught humanity) and what the priest will not (affirm without enemies). Nietzsche treats the genealogy itself as preparation for this figure: a clearing of the ground. The book closes with the wager that he is on the way.`,
          appears: [4],
        },
        {
          id: 'schopenhauer',
          tag: 'HISTORICAL',
          name: 'Schopenhauer',
          epithet: 'The great foil',
          body: `The philosopher whose answer to ascetic ideals was to embrace them — to read the will's negation of itself as the highest wisdom. Nietzsche treats Schopenhauer's case as the most honest expression of the ascetic ideal in modern philosophy, and therefore as the position he most needs to overcome. Schopenhauer dominates Essay 3; his aesthetics (via Kant) are examined and rejected in the opening sections. The Genealogy is in part a settling of accounts with the philosopher who most influenced the young Nietzsche.`,
          appears: [4],
        },
        {
          id: 'spinoza',
          tag: 'HISTORICAL',
          name: 'Spinoza',
          epithet: 'Cited antecedent',
          body: `Named in Essay 2 around the question of bad conscience. Nietzsche notes Spinoza's clear-eyed refusal to treat remorse as anything other than a sad passion — a position he admires and extends. Spinoza is one of the few philosophers Nietzsche mentions with something close to approval, though he goes further than Spinoza would in tracing guilt to its pre-moral origins.`,
          appears: [3],
        },
      ],
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'Preface',
      tourTitle: 'The Preface',
      hook: 'We are unknown to ourselves, we knowers — and for good reason. The book begins by telling you why the question of the origin of morality has followed Nietzsche since he was a boy of thirteen.',
      tour: `The preface is not throat-clearing. Nietzsche opens with one of his sharpest sentences — "we are unknown to ourselves, we knowers" — and explains why: we have never searched for ourselves, have given ourselves to everything else, and so return home from ourselves empty-handed. He then explains how the Genealogy came to be written: the problem of the origin of our moral prejudices has followed him since boyhood, since the time he first asked "where do the concepts of good and evil actually come from?" He names the English moral historians — Paul Rée and others — and rejects their methods (utility, habit, forgetting) while crediting them with first taking the question seriously. He closes by handing the reader a method: history, philology, psychology, and above all suspicion. Read each essay, he says, as a self-contained argument — and read all three as one assault.`,
      blurb: `Nietzsche explains how the problem of the origin of moral values has followed him since boyhood, rejects the English moral historians' methods, and hands the reader a method of his own: history, philology, psychology, suspicion.`,
      summary: [
        `The preface opens with what may be the most disarming sentence in all of Nietzsche: "We are unknown to ourselves, we knowers — and for good reason. We have never searched for ourselves." The paradox is precise. Those whose profession is knowledge — philosophers, scholars, genealogists — have by that very profession learned to attend to everything except the structure of their own valuations. They return home from themselves empty-handed. This is the first move of the genealogical method: suspicion turned on the examiner before it is turned on the examined.`,
        `Nietzsche then traces the autobiography of his problem. Since boyhood — he gives the age as thirteen — the question of the origin of good and evil has never left him. He first answered it in the way children do: God made the values. Then he gave a more sophisticated but still wrong answer: the unegoistic, the self-denying, deserves the name "good." Then he began to read the English moral historians — Herbert Spencer, Paul Rée, the utilitarians — who attempted a naturalistic history of morality grounded in usefulness and habit. He credits them with having taken the question seriously. He rejects their answers as historically shallow and psychologically naive. They located the origin of "good" in the approval of those who benefit from good acts. Nietzsche replies: the judgment "good" did not originate among those to whom good was done.`,
        `The preface closes by handing the reader a method and a warning. The method is what Nietzsche calls the historical sense applied to moral questions: not logic, not intuition, but genealogy — the patient tracing of concepts through the actual human contexts, the particular interests, the physiological types that produced them. The warning is that this kind of reading is hard. It requires preparation that the Genealogy assumes rather than provides — specifically, a prior reading of <em>Beyond Good and Evil</em>. "This writing is obscure to anyone who has not first read me carefully," Nietzsche writes. He does not apologize for this. He assumes the reader he wants.`,
      ],
      appears: [{ id: 'unnamed-philosopher', name: 'The philosopher of the future' }],
      themes: [{ slug: 'slave-revolt', label: 'The slave revolt in morality' }, { slug: 'ressentiment', label: 'Ressentiment' }],
    },
    {
      n: 2,
      title: 'First Essay — "Good and Evil," "Good and Bad"',
      tourTitle: 'Essay 1: Good and Evil, Good and Bad',
      hook: 'The slave revolt in morality. How "good" turned from a noble self-affirmation into the opposite of "evil." Nietzsche names it, traces it, and asks whether it has finally triumphed.',
      tour: `Essay 1 begins with the English psychologists' error: they assumed "good" originated among those who benefited from good acts and, through habit, came to call the good act "good" in itself. Nietzsche replies that the judgment "good" did not originate from below; it originated from the strong, the noble, who called themselves good as a spontaneous act of self-affirmation. He traces this through etymologies: Latin <em>bonus</em>, Greek <em>esthlos</em>, German <em>gut</em> — all pointing to warrior, aristocratic, strong. "Bad" is merely the residual category. Then the slave revolt: ressentiment becomes creative, the powerless invent an enemy, name that enemy "evil," and so — for the first time — call themselves "good" by contrast. Nietzsche names Judaism and Christianity as the historical carriers of this inversion. He introduces the bird-of-prey-and-lamb metaphor — we do not blame the eagle for taking the lamb, but the lamb insists on calling the eagle "evil." He closes with the question: Rome or Judaea? And answers: Judaea has conquered Rome, for now.`,
      blurb: `The central argument of the book: "good" once meant noble and self-affirming; the slave revolt inverted the table, making the strong "evil" and the suffering "good." Nietzsche traces the etymology, names the carriers — Jewish prophecy, Christianity — and asks whether Judaea has permanently defeated Rome.`,
      summary: [
        `The essay opens with Nietzsche's attack on the English moral historians — Spencer, Rée, the utilitarians — who argued that the concept "good" originated with the utility of unegoistic acts and, through habit, detached itself from the usefulness and became independently valued. Nietzsche's counterargument is both historical and etymological. The judgment "good," he argues, did not originate among those to whom good was done; it originated among the noble, the aristocratic, the strong, who called themselves "good" as a spontaneous act of self-affirmation. The philological evidence — Latin <em>bonus</em> (warrior), Greek <em>esthlos</em> (strong, capable), Sanskrit <em>aryaman</em> — all points in the same direction: "good" was first the name a ruling class gave itself.`,
        `The slave revolt enters midway through the essay. Unable to act — unable to discharge ressentiment in the direct way the noble discharges it — the powerless invent a counter-valuation. They do not say "I am good"; they say "you are evil, therefore I am good." The enemy must be constituted first. Nietzsche illustrates this with one of his most quoted metaphors: we do not blame the eagle for taking the lamb, but the lambs call the eagle "evil" and imagine themselves "good" by contrast. "To demand of strength that it should not express itself as strength, that it should not be a will to overwhelm, a will to overthrow, a will to become master... is just as absurd as to demand of weakness that it should express itself as strength." The slave revolt does not change what strength is; it changes what strength is called.`,
        `The essay closes with the question of historical outcome. Rome versus Judaea: which has won? Nietzsche's answer is unambiguous — Judaea has won, for now. You can see it in Rome itself, where you now kneel before a Jewish carpenter crucified under a Roman governor. The entire symbolic order of Christian Europe is the triumph of the slave revaluation. But Nietzsche leaves the question open: this is "for now." The polemic implies — without stating — that a further revaluation is possible. The philosopher of the future who could accomplish it has not appeared. The essay ends not as a solution but as a charge: the question of Rome or Judaea has not been answered; it has been fought, and the wrong side won, and there is perhaps still time.`,
      ],
      appears: [
        { id: 'noble-type', name: 'The noble / master type' },
        { id: 'slave-type', name: 'The slave / herd' },
        { id: 'priestly-type', name: 'The priestly type' },
      ],
      themes: [
        { slug: 'slave-revolt', label: 'The slave revolt in morality' },
        { slug: 'ressentiment', label: 'Ressentiment' },
        { slug: 'priest-valuator', label: 'The priest as valuator' },
      ],
    },
    {
      n: 3,
      title: 'Second Essay — "Guilt," "Bad Conscience," and the Like',
      tourTitle: 'Essay 2: Guilt, Bad Conscience',
      hook: 'How do you breed an animal that can make promises? Through pain. From the creditor-debtor relation comes guilt. From enclosed society comes cruelty turned inward — the bad conscience.',
      tour: `Essay 2 opens with a paradox: to breed an animal that can make promises, you need an animal that can remember. The technology of memory-making, Nietzsche argues, has always been pain — punishment, mutilation, ritual suffering. From this he derives the concept of guilt, tracing it to the German word <em>Schuld</em> (debt): the original moral relationship is the creditor-debtor relation, in which the debtor who cannot pay is punished — not for deterrence, but because the creditor takes pleasure in the suffering. The whole architecture of conscience, duty, and guilt is raised from this economic foundation. The bad conscience enters when society encloses the human animal: the aggressive instincts that once discharged outward now turn inward. Conscience is cruelty turned on the self. Nietzsche ends with the vision of a future redeemer — a philosopher of great love and great scorn — who might release humanity from the bad conscience's longest self-torment.`,
      blurb: `Guilt is not a moral given — it is a debt. Nietzsche traces conscience back through archaic punishment to the creditor-debtor relation, then traces the bad conscience back to the enclosure of the human animal in society: cruelty with nowhere to go turns inward.`,
      summary: [
        `The essay opens with what Nietzsche calls the "most paradoxical task" nature has set for itself: to breed an animal capable of making promises. A promising animal must be able to remember across time — to hold its past word as binding on its present self. But the human animal is by nature forgetful; forgetting, Nietzsche argues, is not a failure but an active faculty, a strong digestion of experience. To override this forgetting and build memory requires pain. "If something is to stay in the memory it must be burned in: only that which never ceases to hurt stays in the memory." Punishment, sacrifice, mutilation — these are the technologies of memory. The entire history of asceticism is a history of mnemotechnics.`,
        `From the technology of memory Nietzsche derives the origin of guilt. The crucial observation is that the German word <em>Schuld</em> means both guilt and debt. The original moral relation, Nietzsche argues, is the creditor-debtor contractual relation — the oldest and most personal relation that exists. When the debtor cannot pay, the creditor takes the body — takes pleasure in the body. The equivalence established is not between money and money but between money and suffering. From this primitive economic logic the whole moral vocabulary of conscience, duty, and sacredness of obligation was raised. Guilt is not a moral intuition; it is an accounting ledger with a torture clause.`,
        `The bad conscience enters at the point where society encloses the human animal. The aggressive instincts — cruelty, the joy of destroying, attacking, persecuting — once discharged outward into enemy, prey, or rival. When the social state walls the human animal in, those instincts can no longer find outward targets. "All instincts that do not discharge themselves outwardly turn inward — this is what I call the internalization of man." Bad conscience is cruelty with nowhere to go. It turns on the self. The human animal becomes, for the first time, interesting — interiorized, deep, suffering from itself. Nietzsche does not celebrate this; he diagnoses it. But he does say that without the bad conscience, without this internalization, the human being would never have developed the inner life that the slave revolt made available. The wound produced the depth.`,
      ],
      appears: [
        { id: 'slave-type', name: 'The slave / herd' },
        { id: 'priestly-type', name: 'The priestly type' },
        { id: 'spinoza', name: 'Spinoza' },
        { id: 'unnamed-philosopher', name: 'The philosopher of the future' },
      ],
      themes: [
        { slug: 'guilt-conscience', label: 'Guilt as internalized cruelty' },
        { slug: 'priest-valuator', label: 'The priest as valuator' },
      ],
    },
    {
      n: 4,
      title: 'Third Essay — What is the Meaning of Ascetic Ideals?',
      tourTitle: 'Essay 3: The Ascetic Ideal',
      hook: 'Man would rather will nothingness than not will. The longest essay asks why every human type — artist, philosopher, priest, scientist — has sheltered under the same ideal: say no to this life.',
      tour: `Essay 3 opens with an epigraph from Zarathustra — "Careless, mocking, forceful — so does wisdom wish us" — and a question: what is the meaning of ascetic ideals? Nietzsche works through the cases. The artist's asceticism (Wagner's turn to Parsifal) is mainly costume, or the condition of creative work, not a genuine metaphysical commitment. The philosopher's is a useful hygiene — solitude, abstinence, poverty as conditions for the highest thinking. The priest's asceticism is something else entirely: the ascetic priest sells suffering as guilt, directs the herd's aggression inward, and so becomes indispensable. Nietzsche then asks whether science is the opponent of the ascetic ideal — and answers no: science still operates under the will to truth, which is the last avatar of the ascetic ideal. The essay closes with the darkest sentence in the book: the ascetic ideal has no rival, not yet. Man would rather will nothingness than not will. The Genealogy ends not with a solution but with an open question addressed to the philosopher who has not yet come.`,
      blurb: `The longest and strangest essay. Nietzsche asks what ascetic ideals mean for every human type — artist, philosopher, priest, scientist — and answers: a will turned against itself. He closes by admitting that the ascetic ideal still has no rival, not even in science, and that man would rather will nothingness than not will at all.`,
      summary: [
        `The essay opens with a paradox Nietzsche has been building toward across the first two essays: the human being cannot bear meaningless suffering. He can bear tremendous pain if it has meaning; he cannot bear even mild discomfort if it has none. The ascetic ideal answers this need. It tells the sufferer: your suffering is your fault, and the cure is self-denial, renunciation, the negation of the will. This is not healing — but it is meaning. And meaning, Nietzsche argues, is what the human animal requires above all. The ascetic priest is the figure who provides it, and by providing it makes himself the most powerful figure in human history.`,
        `Nietzsche works through the cases with characteristic violence of method. Wagner's turn to Parsifal — the sensual revolutionary of the Ring becoming a Christian mystic — is demolished in two pages: the artist's asceticism is mostly costume, the condition of creative work, not a genuine metaphysical commitment. Schopenhauer's embrace of the will's negation is taken more seriously and attacked more carefully: it is the most honest philosophical expression of the ascetic ideal, which is precisely why Nietzsche must defeat it rather than dismiss it. The philosopher's asceticism — solitude, poverty, intellectual focus — is admitted as a useful hygiene, not a betrayal of life. But the priest's is what the essay is about: the ascetic priest as saviour, shepherd, manager, and perpetuator of the sick herd.`,
        `The essay closes with the most consequential question of the book: is there any rival to the ascetic ideal? Nietzsche looks at science, at modern history, at secular humanism, and finds them all still operating within the ascetic ideal's framework — driven by the will to truth at all costs, which is itself the ascetic ideal wearing a lab coat. "What, I put the question with all strictness, has really triumphed over the Christian God? The answer: the Christian morality itself, the idea of truth, taken as God's prohibiting lying, even the lying of the faith." The Genealogy ends with the admission that the ascetic ideal still has no genuine rival, followed by the darkest sentence in the book: "Man would sooner will nothingness than not will." The will needs a goal; it prefers self-negation to goallessness. The redeemer — the philosopher who could replace the ascetic ideal with something that affirms rather than negates — has not come. The book ends as a wager on his arrival.`,
      ],
      appears: [
        { id: 'ascetic-priest', name: 'The ascetic priest' },
        { id: 'priestly-type', name: 'The priestly type' },
        { id: 'schopenhauer', name: 'Schopenhauer' },
        { id: 'unnamed-philosopher', name: 'The philosopher of the future' },
      ],
      themes: [
        { slug: 'ascetic-ideal', label: 'The ascetic ideal' },
        { slug: 'priest-valuator', label: 'The priest as valuator' },
        { slug: 'guilt-conscience', label: 'Guilt as internalized cruelty' },
      ],
    },
  ],
};
