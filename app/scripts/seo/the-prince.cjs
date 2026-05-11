// SEO content data for Niccolò Machiavelli's The Prince (1513).
// Non-narrative political philosophy. 26 short chapters + dedication.
// Voice: literary, declarative present, Florentine-cold.

'use strict';

const CHAPTERS = require('/tmp/the-prince-chunk-1.json');

module.exports = {
  id: 'the-prince',
  title: 'The Prince',
  author: 'Niccolò Machiavelli',
  byline: '1513 · Italian political philosophy',
  titleAccent: 'a guided tour',
  hook: 'A fired civil servant writes the most useful and most hated book in the European political tradition. Twenty-six short chapters that ask, with terrifying clarity, what holding power actually requires.',
  genre: ['Political philosophy', 'Renaissance literature', 'Non-fiction'],

  themesBlurb: 'Power, virtù, fortune, cruelty, and the exhortation to unite Italy.',
  castBlurb: 'The Prince',
  castDesc: 'The author, his exemplars, and the unnamed figure at the centre.',

  chapterLabel: n => 'Chapter ' + n,

  about: [
    `Machiavelli writes <em>The Prince</em> in 1513, the year after the Medici take Florence back and the Republic he had served for fourteen years collapses. He has been arrested, tortured with the strappado, and sent into internal exile on a small farm at Sant'Andrea in Percussina, eight miles south of the city. In the evenings, as he tells his friend Francesco Vettori in a famous letter, he changes out of his country clothes, puts on the robes of office he no longer holds, and enters the courts of the ancients to ask them why their states rose and fell. Out of those evenings comes a treatise of about thirty thousand words, dedicated to Lorenzo de' Medici, intended as a job application and read ever since as something else entirely.`,
    `The book is a manual. It opens with the question of the kinds of principalities and how they are acquired — hereditary, mixed, new, ecclesiastical — and proceeds, chapter by short chapter, through the techniques of holding what has been won. Machiavelli refuses, on the first page of chapter 15, the entire genre of the mirror-of-princes that came before him. Other writers, he says, have imagined republics and principalities that have never existed; he intends to go directly to the effective truth of the matter rather than to the imagination of it. From that refusal comes the doctrine the book is famous for: a prince must learn how not to be good and use that knowledge according to necessity. He must be both lion and fox — strong enough to frighten wolves, cunning enough to recognise traps.`,
    `The closing chapters turn from technique to occasion. Machiavelli surveys the ruin of Italy — the foreign armies on the peninsula, the mercenary captains who do nothing, the popes who multiply principalities for their nephews — and pleads with the Medici to take up the unification a prudent prince could now achieve. The famous last chapter, an exhortation to free Italy from the barbarians, ends with a quotation from Petrarch about ancient valour not yet dead in Italian hearts. Lorenzo never read it, or read it and forgot. The book sat in manuscript until five years after Machiavelli's death and was placed on the Index of Forbidden Books in 1559. It has been on the desks of working politicians ever since.`,
  ],

  chaptersSubtitle: 'All 27 chapters, from the dedicatory letter to the exhortation — the full arc of the argument.',
  chaptersLead: `<p><em>The Prince</em> is structured as a manual, not a narrative. The first eleven chapters are a typology of states and how they are acquired. Chapters 12–14 deal with arms — Machiavelli's most consistent passion is his hatred of mercenaries. Chapters 15–23 form the ethical core: cruelty and clemency, fear and love, faith-keeping, the lion and the fox, and how to choose ministers and avoid flatterers. The last four chapters turn historical and pleading — why Italian princes have lost their states, what fortune is, and the closing exhortation to drive the foreign armies out. Read it in one sitting if you can; it was designed to be heard as a continuous argument.</p>`,

  themesByline: 'Five threads through the argument',
  themesLead: `<em>The Prince</em> is not a narrative, so its themes are arguments rather than plot threads. They run through the treatise the way a single idea runs through a speech: stated early, qualified in the middle, resolved at the end. These five are the ones that have marked every reader and shaped every political thinker who has read Machiavelli seriously since.`,

  groups: [
    { label: 'Types of principalities', subtitle: 'Hereditary, mixed, new, and ecclesiastical — and how each is acquired.', chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    { label: 'Arms and warfare', subtitle: 'Why a prince must command his own army, and why mercenaries are ruinous.', chapters: [12, 13, 14] },
    { label: 'Virtues and vices', subtitle: 'The ethical core — cruelty, clemency, fear, love, faith, the lion and the fox.', chapters: [15, 16, 17, 18, 19, 20, 21] },
    { label: 'Advice and ministers', subtitle: 'How to choose counsellors, avoid flatterers, and read fortune.', chapters: [22, 23, 24, 25] },
    { label: 'Italy and the exhortation', subtitle: 'Why Italian princes have failed, and the closing plea for unification.', chapters: [26, 27] },
  ],

  themes: [
    {
      slug: 'effective-truth',
      title: 'The Effective Truth',
      preview: 'The most important sentence in the book sits halfway through. At the start of chapter 15, Machiavelli announces what he will not do — and with that refusal, separates himself from the entire previous tradition of political thought.',
      essay: [
        `The most important sentence in the book sits halfway through. It comes at the start of chapter 15, where Machiavelli announces what he will not do. He will not, he says, write yet another treatise about how princes ought to live. Many have done so already, and their imagined republics and principalities exist nowhere. He will go directly, instead, to the effective truth of the matter — <em>la verità effettuale della cosa</em> — and report what actually preserves a prince and what actually destroys him.`,
        `With that one phrase he separates himself from the entire previous tradition of Christian and humanist political advice and founds something new. Politics, on Machiavelli's account, is not a branch of ethics. It is an empirical science of what works under given conditions, drawn from the historical record and tested against what living princes have actually done. He is not arguing that goodness is bad. He is arguing that the question of goodness is the wrong question for the man who must keep a state. The right question is harder and colder: given that men are as they are — ungrateful, fickle, dissembling, cowardly, greedy — what must a ruler do to survive among them?`,
        `The answer, he insists, will sometimes look like virtue and sometimes like vice, and the distinction matters less than the outcome. A prince who clings to received goodness in a world that does not return it will be destroyed by men who do not. A prince who knows how not to be good, and who uses or withholds that knowledge according to necessity, has the only reliable foundation politics offers.`,
        `The effective-truth move is the move every realist political thinker after him has had to make in his own way — Hobbes, Madison, Bismarck, the twentieth-century strategists. It is the move that earned Machiavelli his reputation and the move every reader has to decide whether to accept.`,
      ],
      where: [
        { n: 1, label: 'Dedication (the method announced)' },
        { n: 15, label: 'Chapter 15 (the refusal of received morality)' },
        { n: 16, label: 'Chapter 16 (generosity reconsidered)' },
        { n: 17, label: 'Chapter 17 (cruelty and clemency)' },
      ],
    },
    {
      slug: 'virtu-fortuna',
      title: 'Virtù and Fortuna',
      preview: 'The two words that organise the book are virtù and fortuna, and neither translates cleanly. Their negotiation — what men bring versus what accident deals them — is the argument beneath every chapter.',
      essay: [
        `The two words that organise the book are <em>virtù</em> and <em>fortuna</em>, and neither translates cleanly. Virtù is not virtue in the moral sense; it is the active force of a man — his capacity to act decisively in the world, his courage, intelligence, energy, foresight, and a certain ruthless flexibility that lets him meet whatever circumstance throws at him. Fortuna is not fate but accident — the turn of events no human agency can fully control: the arrival of foreign armies, the death of a pope, the river that bursts its banks.`,
        `Machiavelli's most famous image, in chapter 25, is of fortune as one of those rivers. When she is calm, men can build dykes and canals and live without fear. When she rages, she sweeps everything before her — but only where no preparation has been made. The prudent man in tranquil times prepares for the floods he cannot predict. Fortune, Machiavelli says, is the arbiter of about half of what we do; the other half, more or less, she leaves to us. Virtù is what we bring to that other half.`,
        `The two are in constant negotiation. A man of great virtù in a calm age has nothing to do; a man of small virtù in a stormy age is destroyed; the rare match between a great man and a great occasion is what produces a Romulus, a Theseus, a Cyrus. Cesare Borgia had enormous virtù and was undone only by an extraordinary malignity of fortune — the wrong pope elected at the moment of maximum vulnerability.`,
        `The closing image of chapter 25 — that fortune is a woman, and so favours the bold, the young, the forceful who command rather than petition her — is one of the lines that has aged worst, and Machiavelli leaves it on the page without softening. The deeper point survives the metaphor: nothing in politics is fixed, and the man who waits to be sure will be too late.`,
      ],
      where: [
        { n: 7, label: 'Chapter 6 (Moses, Cyrus, armed prophets)' },
        { n: 8, label: 'Chapter 7 (Cesare Borgia and fortune)' },
        { n: 26, label: 'Chapter 25 (fortune as a river)' },
        { n: 27, label: 'Chapter 26 (the exhortation)' },
      ],
    },
    {
      slug: 'lion-fox',
      title: 'The Lion and the Fox',
      preview: 'Chapter 18, on how princes should keep their word, is the chapter that put Machiavelli on the Index of Forbidden Books. The argument is not that faith-breaking is good — it is that the most successful princes have always done it, and denying the fact changes nothing.',
      essay: [
        `Chapter 18, on how princes should keep their word, is the chapter that put Machiavelli on the Index of Forbidden Books and into the language as an adjective. He argues, with no apology, that there are two ways of fighting — by law, which is proper to men, and by force, which is proper to beasts. Because the first is often insufficient, a prince must learn to use the second, and to use it well he must imitate two animals, the fox and the lion. The lion cannot defend himself against snares; the fox cannot defend himself against wolves. A prince must therefore be both — fox enough to recognise traps, lion enough to frighten the wolves who set them.`,
        `From this comes the famous and chilling rule: a prince should not keep faith when keeping faith goes against his interest, and when the reasons that made him give his word no longer obtain. Machiavelli does not present this as an exception. He presents it as the operating principle of every successful prince he can identify in history, and he names them — Alexander VI, who never did anything but deceive and never failed at it; Ferdinand of Aragon, whose pious wars were always fought for territory; the popes generally, whose oaths weighed less than their nephews.`,
        `The cynicism is unsparing. But Machiavelli insists on one practical limit. The fox must dissemble; he must also seem the opposite of what he is. Men judge by appearances, and a prince who can appear merciful, faithful, honest, religious, while being prepared at need to be the contrary, will keep his state. A prince who is openly all of those things and only those things will lose it.`,
        `The doctrine, taken seriously, is harder than it looks; not every man can be a fox without becoming visibly one. The restraint Machiavelli requires — seeming good while being capable of the contrary — is itself a kind of self-mastery that places the argument far from simple cynicism, even if the destination looks the same from a distance.`,
      ],
      where: [
        { n: 19, label: 'Chapter 18 (keeping faith)' },
        { n: 20, label: 'Chapter 19 (avoiding contempt and hatred)' },
        { n: 22, label: 'Chapter 21 (how a prince should act to win honour)' },
      ],
    },
    {
      slug: 'fear-love-cruelty',
      title: 'Fear, Love, and Cruelty Well Used',
      preview: 'The chapter on whether it is better to be loved or feared is the most quoted in the book and the most carefully balanced. The pivot most readers miss is that Machiavelli is far more concerned about being hated than about being loved.',
      essay: [
        `The chapter on whether it is better to be loved or feared is the most quoted in the book and the most carefully balanced. Machiavelli's answer is that it is best to be both, but that since this is difficult, fear is the safer ground for a prince who must choose. His reasoning is psychological rather than moral. Love is a chain men forge themselves, and they break it whenever they find it useful, because men, he says with a flatness that has not pleased anyone in five hundred years, are ungrateful, fickle, false, cowardly, and covetous. Fear is held by a dread of punishment that does not let go.`,
        `But the chapter pivots in the second half, and the pivot is what most casual readers miss. A prince must avoid being hated above all. He may be feared without being loved, but he cannot be safe if he is hated, and he becomes hated by taking the property of his subjects or violating the honour of their wives. He may be feared without doing either.`,
        `The earlier chapter on cruelty makes the same point from the other side: cruelty can be well used or badly used. It is well used when it is done all at once, out of necessity to secure oneself, and not persisted in; it is badly used when it grows, beginning small and increasing rather than diminishing. Cesare Borgia's handling of Remirro de Orco in the Romagna is the paradigm: the man did the cruel work, then was displayed cut in half in the piazza at Cesena to deflect the hatred onto him. Clean, efficient, and not repeated.`,
        `Machiavelli's prince, then, is not a sadist. He is a calculator who understands that human attachments are unreliable, that punishment is more reliable, that excessive injury creates the only emotion he must avoid — hatred — and that the discipline of the throne is to do hard things quickly and rare things rarely.`,
      ],
      where: [
        { n: 9, label: 'Chapter 8 (cruelty well used)' },
        { n: 17, label: 'Chapter 16 (generosity and parsimony)' },
        { n: 18, label: 'Chapter 17 (cruelty and clemency, fear and love)' },
        { n: 20, label: 'Chapter 19 (avoiding contempt and hatred)' },
      ],
    },
    {
      slug: 'italy-mercenaries-exhortation',
      title: 'Italy, Mercenaries, and the Exhortation',
      preview: 'Behind the cold technique of the central chapters lies a hot political grievance. Italy has been overrun for twenty years, and Machiavelli believes the cause is identifiable: Italian princes have outsourced their armies.',
      essay: [
        `Behind the cold technique of the central chapters lies a hot political grievance. Machiavelli is writing in a peninsula that has been overrun for twenty years — by the French in 1494, by the Spanish, by the Swiss, by the imperial armies of Charles V soon to come — and he believes the cause of Italy's humiliation is identifiable. Italian princes, he argues across chapters 12, 13, and 14, have outsourced their armies to mercenary captains, condottieri, who have neither the loyalty of citizens nor the discipline of professional soldiers, and who have made an industry out of avoiding battle.`,
        `A prince who cannot fight his own wars cannot keep his state. The remedy is the citizen militia, the institution Machiavelli himself had tried to build in Florentine service before the Republic fell. The argument against mercenaries is the most consistent passion in the book — it appears in the taxonomy chapters, in the case studies, and explodes in chapters 12–14 into its own extended treatment.`,
        `The closing chapter of the book, chapter 26, gathers the grievance and the remedy into a plea. He addresses Lorenzo de' Medici directly. The occasion is more favourable than any in centuries. Italy lies more enslaved than the Hebrews, more scattered than the Athenians, leaderless, beaten, overrun, waiting for someone to redeem her. Machiavelli quotes Petrarch on the ancient valour still alive in Italian hearts.`,
        `The exhortation has been read as opportunism, as patriotism, as the most sincere passage in the book; it is probably all three. Whatever it is, it shows that the apparent amorality of the technique chapters is in service of an end Machiavelli does feel, and feels strongly: an Italy free of foreign armies, ruled by Italians, with a citizen army that can defend it. The cold counsel is the means; the hot ending names what it was for.`,
      ],
      where: [
        { n: 12, label: 'Chapter 11 (ecclesiastical principalities)' },
        { n: 13, label: 'Chapter 12 (mercenary arms)' },
        { n: 14, label: 'Chapter 13 (auxiliary arms)' },
        { n: 27, label: 'Chapter 26 (the exhortation)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Niccolò Machiavelli',
      role: 'Author',
      body: `Florentine civil servant, diplomat for fourteen years under the Republic, suddenly out of office and out of favour at forty-three when the Medici return in 1512. Arrested, tortured, exiled to a small farm. Writes <em>The Prince</em> in 1513 in the hope of getting back into government service; the application fails. Spends the next fourteen years writing the Discourses on Livy, a long history of Florence, plays, letters, and dispatches, and never recovers his old position. Dies in 1527, weeks after the Republic is briefly restored without him.`,
    },
    {
      name: 'Cesare Borgia',
      role: 'Exemplar',
      body: `The figure who runs through the book as Machiavelli's case study in princely virtù under uncooperative fortune. Son of Pope Alexander VI, made Duke of Valentinois by Louis XII, and given the Romagna by his father to carve into a personal state. Machiavelli met him as a Florentine envoy, watched him operate at Imola and Senigallia, and admired the speed, secrecy, and cold execution of his moves. Cesare's state collapsed when his father died and the wrong pope was elected. Machiavelli's verdict: he did everything a man could do; he was undone only by an extraordinary and extreme malignity of fortune.`,
    },
    {
      name: "Lorenzo de' Medici",
      role: 'Dedicatee',
      body: `Not the famous Lorenzo the Magnificent, who died in 1492, but his grandson — Lorenzo II, Duke of Urbino, born 1492, dead at twenty-six in 1519. The Medici family installed him as de facto ruler of Florence after their return. Machiavelli dedicated <em>The Prince</em> to him in the hope of employment. By every account, Lorenzo never read it. The exhortation in chapter 26 to redeem Italy is addressed, formally, to him.`,
    },
  ],

  castSubtitle: 'The author, his exemplars, and the unnamed prince at the centre.',
  castLead: `<p><em>The Prince</em> is a treatise rather than a narrative, so its "cast" is a set of historical figures called up as case studies, and one abstract figure — the prince himself — who is the book's addressee throughout. The historical figures range from Moses to Ferdinand of Aragon; a few appear in enough chapters to be treated as recurring presences.</p>`,
  castGroups: [
    {
      label: 'The author and his addressees',
      characters: [
        {
          id: 'niccolo-machiavelli',
          tag: 'AUTHOR',
          name: 'Niccolò Machiavelli',
          epithet: 'Florentine diplomat, in exile',
          body: `Former second chancellor of the Florentine Republic. Diplomat to the French court, to Cesare Borgia, to Pope Julius II. Arrested and tortured in 1512 when the Medici returned. Writes <em>The Prince</em> on a small farm at Sant'Andrea in Percussina, in the evenings, after changing into the robes of office he no longer holds. The voice of every chapter is his: empirical, combative, impatient with received wisdom, and — in the final chapter — openly passionate about Italy.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
        },
        {
          id: 'the-prince',
          tag: 'ADDRESSEE',
          name: 'The Prince',
          epithet: 'The unnamed figure addressed throughout',
          body: `An abstraction more than a person, but the addressee of every chapter. He is the man who acquires or holds a state — by inheritance, by his own arms, by another's arms, by fortune, by virtù, by crime, or by civic election. Through the book he acquires shape: he should not be hated; he should appear merciful, faithful, religious while being prepared at need not to be; he should keep his subjects busy with great undertakings; he should choose ministers wisely; he should look to the historical record before his own preferences.`,
          appears: [2, 3, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27],
        },
        {
          id: 'lorenzo-de-medici',
          tag: 'DEDICATEE',
          name: 'Lorenzo de\' Medici',
          epithet: 'Duke of Urbino, Machiavelli\'s employer-who-never-was',
          body: `Lorenzo II de' Medici, Duke of Urbino (1492–1519), not his famous grandfather. The Medici family installed him as the de facto ruler of Florence after their return in 1512. Machiavelli dedicated <em>The Prince</em> to him in the hope of employment. By every account, Lorenzo never read it — or read it and forgot. The closing exhortation to redeem Italy is addressed to him by name.`,
          appears: [1, 27],
        },
      ],
    },
    {
      label: 'Historical exemplars',
      characters: [
        {
          id: 'cesare-borgia',
          tag: 'EXEMPLAR',
          name: 'Cesare Borgia',
          epithet: 'Duke of Valentinois — the closest thing to Machiavelli\'s ideal prince',
          body: `Son of Pope Alexander VI. Carved the Romagna into a personal state using his father's papal resources and Louis XII's French alliance. Machiavelli met him as a Florentine envoy, watched him operate, and returned to Florence convinced he had seen how new principalities were actually built. The pacification of the Romagna through his lieutenant Remirro de Orco — and Remirro's subsequent public execution — is Machiavelli's paradigm of cruelty well used. His state collapsed when Alexander died; Machiavelli absolves him: he did everything a man could do.`,
          appears: [8, 9, 12, 14, 21, 27],
        },
        {
          id: 'fortuna',
          tag: 'FORCE',
          name: 'Fortuna',
          epithet: 'Accident and circumstance personified',
          body: `Not a goddess in any pious sense, but the personified accident of history — the river in flood, the unexpected death, the foreign army crossing the Alps. Machiavelli treats fortuna as the arbiter of roughly half of what happens in human affairs, leaving the other half to human virtù. His most quoted image, in chapter 25, is that fortune is like a raging river: where dykes have been built in advance, she is manageable; where no preparation was made, she devastates. The closing image — that fortune favours the bold — is the most famous and the least nuanced passage in the book.`,
          appears: [26, 27],
        },
        {
          id: 'the-people-and-the-great',
          tag: 'SOCIAL FORCE',
          name: 'The People and the Great',
          epithet: 'The two humours of every city',
          body: `Machiavelli's social analysis, sketched in chapter 9, holds that every city contains two humours — the <em>popolo</em>, who do not wish to be oppressed, and the <em>grandi</em>, the great men, who wish to oppress them. A prince comes to power either with the help of the people or the great, and the choice shapes everything that follows. Machiavelli's preference is for the popular base: the people are more numerous, more reliable, and easier to satisfy — they ask only not to be crushed.`,
          appears: [10, 20],
        },
      ],
    },
  ],

  chapters: CHAPTERS,
};
