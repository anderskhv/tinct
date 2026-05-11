// SEO content data for Thucydides's History of the Peloponnesian War (c. 431-400 BCE).
// 8 books, unfinished — Thucydides died before he could narrate the war's final years.
// Companion to the-histories.cjs — the austere realist counter to Herodotus's curious storyteller.

const chunk1 = require('/tmp/peloponnesian-war-chunk-1.json');

module.exports = {
  id: 'peloponnesian-war',
  title: 'History of the Peloponnesian War',
  author: 'Thucydides',
  byline: 'c. 411 BC · Greek history',
  titleAccent: 'a guided tour',
  hook: 'An Athenian general writes the war he fought in and was exiled for losing. The result is the first work of political history in the modern sense — austere, evidence-driven, structurally pessimistic about human nature. Twenty-four hundred years on, every working historian still measures himself against the standard it set.',
  genre: ['History', 'Classical antiquity', 'Political thought'],

  themesBlurb: 'Power, justice, deliberation, empire, and catastrophe.',
  castBlurb: 'Athens and Sparta',
  castDesc: 'The commanders and statesmen of a thirty-year war.',
  castSubtitle: 'Athens, Sparta, and the men who drove the war.',
  themesByline: 'Five threads through the History',
  themesLead: `Thucydides wrote not to entertain but to instruct — a <em>possession for all time</em>. The threads below run through all eight books and are as alive in international relations now as they were in 431 BCE.`,
  castLead: `<p>The History's cast is relatively small given its scope: a handful of Athenian statesmen and generals, a few Spartan commanders, and the largely anonymous Athenian <em>demos</em> whose votes drive the war's great turning points. Thucydides is parsimonious with biography — he gives you the man only as much as the war requires.</p>`,

  chapterLabel: n => {
    const book = n <= 5 ? 'I' : n <= 8 ? 'II' : n <= 11 ? 'III' : n <= 14 ? 'IV' : n <= 17 ? 'V' : n <= 20 ? 'VI' : n <= 23 ? 'VII' : 'VIII';
    return `Book ${book}`;
  },

  about: [
    `Thucydides composes the <em>History</em> during the war it describes, from its outbreak in 431 BCE to his death sometime around 400 or shortly after, and the work breaks off abruptly in the middle of Book 8 in the year 411. The twenty-seven-year war between Athens and Sparta and their allies that he sets out to record is, on his own opening claim, the greatest disturbance in Greek history. Athens at the start is at the height of its power — a maritime empire of allied and tributary cities, an unmatched navy, the cultural and intellectual centre of the Greek world under Pericles, the man Thucydides admired more than any other. Sparta is the leading land power of the Greek mainland, head of the Peloponnesian League, conservative, slow-moving, suspicious of the Athenian rise. The war begins, on Thucydides's account, because Spartan fear of Athenian growth had become unbearable.`,
    `The <em>History</em> is structured strictly by year and by season, summer and winter, and within each year by theatre of operations. Book 1 contains the famous <em>Archaeology</em> — Thucydides reconstructing early Greek history from material evidence — and the <em>Pentecontaetia</em>, sketching the fifty years between the Persian Wars and the present. Book 2 has Pericles's funeral oration and the great plague of Athens that kills Pericles in 429. Books 3 through 5 cover the inconclusive middle years, the Mytilenean Revolt, the Corcyrean civil war, the Peace of Nicias in 421. Books 6 and 7 are the Sicilian Expedition — the central tragedy. Book 8 covers the oligarchic revolution and Persian intervention, and breaks off mid-campaign in 411.`,
    `The ending is structural, not accidental: Thucydides did not live to finish it. Xenophon's <em>Hellenica</em> picks up where the <em>History</em> stops, but the great arc Thucydides was building — from Athenian confidence at the war's start to Athenian ruin at its end — is left, like the war itself in his own time, incomplete. What survives is already the founding document of political history. Polybius, Sallust, Tacitus, Machiavelli, Hume — the line runs without interruption from Thucydides's opening sentence to the modern academic discipline of international relations.`,
  ],

  chaptersSubtitle: 'All 26 chapters, by book and phase — from the Archaeology to the oligarchic coup of 411.',
  chaptersLead: `<p>The 26 chapters follow Thucydides's own structure: eight books, each covering one or more years of the war. Books I–II lay the foundations and deliver the plague. Books III–V trace the inconclusive middle war. Books VI–VII are the Sicilian disaster. Book VIII is the unfinished aftermath. Read in order — the weight of the <em>History</em> depends on accumulation.</p>`,

  groups: [
    { label: 'Book I · Causes and origins', subtitle: 'The Archaeology, the Pentecontaetia, and the debates that made war inevitable.', chapters: [1, 2, 3, 4, 5] },
    { label: 'Book II · The first years and the plague', subtitle: "Pericles's funeral oration, the Attic invasions, and the plague that killed him.", chapters: [6, 7, 8] },
    { label: 'Books III–IV · The middle war', subtitle: 'The Mytilenean Debate, Corcyra, Pylos, Brasidas in Thrace.', chapters: [9, 10, 11, 12, 13, 14] },
    { label: 'Book V · The uneasy peace', subtitle: 'The Peace of Nicias, the Argive alliance, and the Melian Dialogue.', chapters: [15, 16, 17] },
    { label: 'Books VI–VII · Sicily', subtitle: 'The expedition voted, launched, and destroyed.', chapters: [18, 19, 20, 21, 22, 23] },
    { label: 'Book VIII · The aftermath', subtitle: 'Oligarchic revolution, Persian intervention, and the recall of Alcibiades.', chapters: [24, 25, 26] },
  ],

  themes: [
    {
      slug: 'possession-for-all-time',
      title: 'History as possession for all time',
      preview: 'Thucydides states his purpose at the start with austere clarity: not a prize composition for the moment but a <em>ktema es aei</em> — a possession for all time. The doctrine licenses his exclusion of everything merely entertaining and commits him to a relentless structural precision.',
      essay: [
        `Thucydides states his purpose at the start of Book 1 with the kind of austere clarity that has shaped historical writing ever since. He has set down his work, he says, not as a prize composition for the moment but as a possession for all time — a <em>ktema es aei</em>. The phrase has been quoted to exhaustion, but its content is precise and unsentimental. Human nature, on Thucydides's reading, does not fundamentally change; the political and military situations human beings find themselves in repeat with sufficient regularity that a careful account of one such situation can usefully inform later participants in similar ones.`,
        `He is therefore writing not for the entertainment of his contemporaries but for the instruction of statesmen and generals he will never meet. The doctrine licenses his exclusion of much that other historians of his time included — the supernatural, the mythological, the merely entertaining — and his concentration on what is, in his judgment, structurally repeatable. It also commits him to a kind of relentless precision that his Greek readers must have found chilly. There are no charming digressions, almost no descriptions of foreign customs, very little colour. There is the war, the speeches and councils that produced it, the actions and outcomes that followed.`,
        `The first reader who fully grasped what Thucydides was doing was the Roman historian Sallust in the first century BCE; the doctrine runs through Tacitus, Machiavelli, Hume, and the entire modern academic discipline of international relations. Students at war colleges still read the Melian Dialogue and Pericles's funeral oration as primary texts — not as historical curiosities but as working analytical tools.`,
        `The <em>History</em> is in this sense the founding document of professional historical writing as we know it. No other work of comparable age has generated comparable scholarly controversy about method, reliability, and the nature of historical knowledge — and none has proven more durably useful to practitioners of the craft it invented.`,
      ],
      where: [
        { n: 1, label: 'Book I Ch. I (the methodological preface)' },
        { n: 2, label: 'Book I Ch. II (the Archaeology)' },
      ],
    },
    {
      slug: 'speeches',
      title: 'Speeches and the construction of the narrative',
      preview: 'Thucydides confesses in 1.22 that he did not always have a verbatim record of the speeches that fill his text. His solution — write what the situation required while keeping to the general sense — has been debated ever since, and is the place where the political analyst is most directly present.',
      essay: [
        `One of the most famous and argued-over passages in the <em>History</em> is Thucydides's note on his method for the speeches that occupy a great deal of the text. Throughout the work, generals address their troops, ambassadors address foreign assemblies, politicians address their cities. The speeches are often long and densely argued, and they constitute much of the political content of the <em>History</em>. Thucydides confesses, in 1.22, that he did not always have access to a verbatim record of what was said.`,
        `His method, he says, was to write the speeches as they seemed to him most likely to have been, given what the situation required of the speakers, while keeping as close as possible to the general sense of what was actually said. Modern readers have argued ever since about how much latitude this allowed him. The conservative view is that the speeches are essentially Thucydides's own analysis of the political situation, given dramatic form by being placed in the mouths of the participants. The more permissive view is that they are based, where possible, on real reports and memories.`,
        `What is clear is that the speeches are the place where Thucydides is most directly present as a political analyst. The most famous of them — Pericles's funeral oration, the Mytilenean debate, the Melian Dialogue, Alcibiades's speech for the Sicilian expedition — are not so much records of past oratory as the most concentrated political philosophy fifth-century Athens produced.`,
        `To read Thucydides is to read simultaneously a chronicle of events and a sustained meditation on the structure of political action, and the speeches are the joint where the two halves meet. This double function — documentary and analytical — is what distinguishes the <em>History</em> from everything written before it and much written since.`,
      ],
      where: [
        { n: 1, label: 'Book I Ch. I (method note 1.22)' },
        { n: 3, label: 'Book I Ch. III (Corinthian and Athenian speeches at Sparta)' },
        { n: 7, label: "Book II Ch. VII (Pericles's funeral oration)" },
        { n: 17, label: 'Book V Ch. XVII (the Melian Dialogue)' },
      ],
    },
    {
      slug: 'pericles',
      title: 'Pericles and the funeral oration',
      preview: "Book 2 contains the most quoted passage in classical political literature — Pericles's praise of Athens at the funeral of the war's first dead. Thucydides places it deliberately before the plague, the atrocities, and the surrender, so that everything that follows is read against it.",
      essay: [
        `Book 2 of the <em>History</em> contains the most quoted single passage in classical political literature, Pericles's funeral oration for the Athenians killed in the first year of the war. The speech is delivered at the public funeral of the war dead in the winter of 431-430 BCE, in front of the Kerameikos cemetery outside the walls of Athens. It is, in form, a praise of the dead; in substance, a praise of the Athens for which they had died.`,
        `Pericles describes the Athenian constitution — democracy, in which advancement is by ability rather than by class, and in which the laws are obeyed because they are the laws of the citizens themselves. He claims, in the most quoted single line, that Athens is the school of Hellas, an education to all of Greece. The oration is the most idealised statement of Athenian self-understanding ever written, and Thucydides places it deliberately at the beginning of the war, before plague, defeat, atrocity, and finally surrender have made every claim in it look more questionable.`,
        `Pericles dies of the plague in the next chapter; the city he is praising will, within a single book, vote to massacre an entire allied city for revolting; within five books it will commit, at Melos, an act of state cruelty Pericles would have flinched from; within six and seven, it will destroy itself in Sicily; within ten, it will surrender. The funeral oration is not undone by what follows, but everything that follows is read against it.`,
        `The gap between the ideal and the events is the moral pressure of the <em>History</em>. Thucydides never names this gap or moralises about it; he simply places the speech where it will do the most structural work, and trusts the reader to feel it accumulate over the remaining six books.`,
      ],
      where: [
        { n: 7, label: 'Book II Ch. VII (funeral oration and plague)' },
        { n: 6, label: 'Book II Ch. VI (first Spartan invasion; Pericles restrains the demos)' },
      ],
    },
    {
      slug: 'melian-dialogue',
      title: 'The Melian Dialogue',
      preview: 'The most direct statement of political realism in any ancient text. Athenian envoys tell the small neutral island of Melos that in matters of international relations, the strong do what they can and the weak suffer what they must. Melos refuses. Athens destroys it.',
      essay: [
        `Book 5 contains the most direct statement of political realism in any ancient text — the dialogue between Athenian envoys and the council of the small island state of Melos in 416 BCE. The Athenians have arrived to demand Melian submission. Melos, a Spartan colony but neutral in the war, refuses. Rather than narrating a long debate, Thucydides constructs the conversation as a back-and-forth between the Athenian negotiators and the Melian council.`,
        `The Athenians, with a flatness that has shocked readers ever since, dispense with the conventional language of justice. We will not bother with high-sounding talk about how our empire is justly held, they say, and you should not bother about how Sparta will come to your aid. The relevant facts are these: in matters of international relations, the strong do what they can and the weak suffer what they must. The Melians appeal to the gods, to fortune, to Spartan kinship; the Athenians counter each appeal with cold practical analysis.`,
        `Melos refuses, and after a siege the Athenians take the city, kill the men of military age, and sell the women and children into slavery. The episode is the most famous statement in classical literature of the doctrine that justice between political actors is, in the limiting case, a function of relative power. The centuries of debate about whether Thucydides endorsed the Athenian position, condemned it, or refused to take a side are more or less the centuries of debate between political realism and its critics.`,
        `The structural argument is tight: the Melian Dialogue sits at the end of Book 5, immediately before the Sicilian disaster in Books 6 and 7 — the Athenians ruining themselves by exactly the kind of overreach the Melians had warned against. Whether or not Thucydides moralises, the arrangement of the text speaks plainly.`,
      ],
      where: [
        { n: 17, label: 'Book V Ch. XVII (the Melian Dialogue)' },
        { n: 18, label: 'Book VI Ch. XVIII (the Sicilian debate begins)' },
      ],
    },
    {
      slug: 'sicilian-expedition',
      title: 'The Sicilian Expedition',
      preview: 'Books 6 and 7 are the centrepiece of the work and the longest sustained tragic narrative in classical historiography — from the overconfident assembly vote in 415 to the destruction of the entire force in the stone quarries of Syracuse two years later.',
      essay: [
        `Books 6 and 7 of the <em>History</em> are the centrepiece of the work and the longest sustained tragic narrative in classical historiography. In 415 BCE, Athens, despite being already at war with Sparta and at the limits of its resources, votes to send an enormous expedition to Sicily to conquer Syracuse. The vote is driven by the brilliant, dangerous young aristocrat Alcibiades, who promises that Sicily will fall easily and that its resources will then make Athens unstoppable. The cautious general Nicias, hoping to dampen the enthusiasm by laying out the logistical demands, succeeds only in convincing the assembly to send a larger force than originally planned.`,
        `The expedition sails. Alcibiades is recalled almost immediately on charges of religious sacrilege, defects to Sparta, and from Sparta advises the Spartans how to undo Athens. Nicias, ill and indecisive, delays the assault on Syracuse long enough for the city to fortify itself and for Spartan reinforcements under Gylippus to arrive. The Athenian fleet is bottled up in the Great Harbour of Syracuse and destroyed in two desperate naval battles.`,
        `The army attempts to retreat overland, is harried, surrounded, and forced to surrender. Nicias and Demosthenes are executed; the surviving prisoners are penned in the stone quarries of Syracuse and die over the following months of thirst, exposure, and disease. Thucydides reports the closing scenes with a restraint that has not been improved on. The entire arc — the overconfident vote, the decisive intervention by ambition (Alcibiades) and indecision (Nicias), the slow tightening of the Syracusan defence, the catastrophe in the harbour, the long retreat, the quarries — is the structural demonstration of every theme the <em>History</em> has been developing.`,
        `The same democratic system that produced Pericles produced Alcibiades. The same Athens that praised itself as the school of Hellas in Pericles's oration ended up dying of thirst in a stone quarry in Sicily ten years later. The two long books are the most carefully built tragedy in any work of European historical writing.`,
      ],
      where: [
        { n: 18, label: 'Book VI Ch. XVIII (the debate, the vote)' },
        { n: 19, label: 'Book VI Ch. XIX (the Syracusan debate)' },
        { n: 20, label: 'Book VI Ch. XX (Alcibiades in Sparta)' },
        { n: 21, label: "Book VII Ch. XXI (Nicias's letter)" },
        { n: 22, label: 'Book VII Ch. XXII (Demosthenes arrives)' },
        { n: 23, label: 'Book VII Ch. XXIII (the harbour battles)' },
      ],
    },
  ],

  keyFigures: [
    {
      name: 'Thucydides',
      role: 'Author and participant',
      body: `Born around 460 BCE in Athens, of an aristocratic family with Thracian connections. Caught the great plague of 430 and survived. Elected general in 424, failed to relieve Amphipolis before Brasidas took it, was tried and exiled. Spent the next twenty years collecting information from both sides — an opportunity, he notes, his exile gave him. Returned to Athens around 404. Died, the work unfinished, around 400 BCE.`,
    },
    {
      name: 'Pericles',
      role: 'Athenian statesman',
      body: `Dominant figure of Athenian politics from the late 460s until his death of plague in 429 BCE. Builder of the Parthenon, architect of the strategy with which Athens entered the war. Thucydides admired him as he admired no other Athenian. The implicit standard against which every later Athenian leader is measured — and the verdict on each later leader is invariably: not Pericles.`,
    },
    {
      name: 'Alcibiades',
      role: 'Athenian aristocrat',
      body: `The most brilliant, ambitious, and destructive Athenian of the war's second half. Ward of Pericles, lover of Socrates, charismatic and ruinously self-interested. Persuades Athens to vote for the Sicilian expedition, defects to Sparta when recalled, then to Persia, then negotiates his way back to Athens, then is exiled again. Killed in Phrygia in 404. The figure in whom Thucydides locates much of the diagnosis of what democracy produces when it runs out of Pericleses.`,
    },
    {
      name: 'Nicias',
      role: 'Athenian general',
      body: `Cautious, devout, and increasingly ill general appointed to co-command the Sicilian Expedition against his own counsel. His attempt to dampen Athenian enthusiasm by naming the expedition's enormous demands has the opposite effect. In Sicily his caution becomes indecision; he finally refuses to retreat because of a lunar eclipse. Captured and executed. Thucydides's verdict: of all the Greeks of his time, he least deserved to come to such an end.`,
    },
    {
      name: 'Brasidas',
      role: 'Spartan general',
      body: `The most effective Spartan commander of the war's first decade — energetic, intelligent, politically deft, qualities not usually associated with Spartan officers. Led a small force north into Thrace in 424 and detached a string of Athenian cities, including Amphipolis, whose fall cost Thucydides his generalship. Killed outside Amphipolis in 422 in the same battle that killed Cleon. The two deaths cleared the way for the Peace of Nicias. The Spartan Thucydides treats most warmly.`,
    },
    {
      name: 'The Demos',
      role: 'Athenian assembly',
      body: `The Athenian people in assembly — the body of all adult male citizens whose votes drive every major decision in the <em>History</em>. It votes the strategy, grieves the dead, reverses the massacre of Mytilene a day after voting it, and approves the Sicilian Expedition against Nicias's warnings. Thucydides's portrait — admiring of its capacity for collective self-discipline under Pericles, severe about its cruelty and impulsiveness without him — has set the terms of debate about mass democracy ever since.`,
    },
  ],

  cast: [
    {
      name: 'Thucydides',
      role: 'AUTHOR / PARTICIPANT',
      body: 'Born around 460 BCE in Athens, son of Olorus, of an aristocratic family with Thracian connections through gold-mining interests on the coast opposite Thasos. Old enough to remember Pericles\'s first years in power. Caught the great plague of Athens in 430 and survived; reports the symptoms and the social effects at first hand. Elected one of the ten generals for 424. Failed to relieve the city of Amphipolis in time when the Spartan general Brasidas attacked it; was tried for the failure and exiled from Athens. Spent the next twenty years collecting information from both sides of the war — an opportunity, he notes, that his exile gave him and that gave his work a balance impossible for a partisan based in either city. Returned to Athens after the war, around 404, and probably died, in Athens or in Thrace, around 400, with the History unfinished.',
    },
    {
      name: 'Pericles',
      role: 'ATHENIAN STATESMAN',
      body: 'The Athenian leader who dominated the city\'s politics from the late 460s until his death of plague in 429 BCE. Aristocrat by birth, democrat by political conviction, builder of the Parthenon and the other great civic projects of fifth-century Athens, architect of the strategy with which Athens entered the war. Thucydides admired Pericles as he admired no other Athenian. The figure of Pericles in the History is the implicit standard against which every later Athenian leader is measured, and the verdict on every later leader is the same: not Pericles.',
    },
    {
      name: 'Alcibiades',
      role: 'ATHENIAN ARISTOCRAT',
      body: 'The most brilliant, ambitious, and destructive Athenian of the war\'s second half. Aristocrat, ward of Pericles, lover of Socrates, charismatic and ruinously self-interested. Persuades the Athenian assembly to vote for the Sicilian expedition in 415, then is recalled on charges of having defaced the herms and profaned the Mysteries, defects to Sparta, advises the Spartans on how to defeat Athens, then defects to Persia, then negotiates his way back to Athens, then is exiled again. Dies in 404 in Phrygia. Alcibiades is the figure in whom Thucydides locates much of the diagnosis of what went wrong in Athenian democracy after Pericles.',
    },
    {
      name: 'Nicias',
      role: 'ATHENIAN GENERAL',
      body: 'Cautious, devout, and increasingly ill Athenian general appointed to co-command the Sicilian Expedition against his own counsel. His attempt to dampen Athenian enthusiasm by laying out its enormous demands has the opposite effect: the assembly votes a larger force. In Sicily his caution becomes indecision; he delays critical attacks, hesitates over withdrawals, and finally refuses to retreat further because of an eclipse of the moon. Captured at the surrender, he and Demosthenes are executed by the Syracusans. Thucydides\'s verdict on Nicias is unusually personal: of all the Greeks of his time, he least deserved to come to such an end.',
    },
    {
      name: 'Brasidas',
      role: 'SPARTAN GENERAL',
      body: 'The most effective Spartan commander of the war\'s first decade. Energetic, intelligent, and politically deft — qualities not always associated with Spartan officers — Brasidas led a small expeditionary force north into Thrace in 424 BCE and detached a string of Athenian allied cities, including Amphipolis, the city Thucydides was tasked with defending and failed to relieve in time. Killed in the battle outside Amphipolis in 422, fighting the Athenian general Cleon, who also died in the same battle. The two deaths cleared the way for the Peace of Nicias the following year. Brasidas is the Spartan whom Thucydides treats most warmly.',
    },
    {
      name: 'The Demos',
      role: 'ATHENIAN ASSEMBLY',
      body: 'The Athenian people in assembly — the ekklesia, the body of all adult male citizens, perhaps thirty to forty thousand at any one time, with a working quorum of perhaps six thousand. The demos is in some sense the protagonist of the History on the Athenian side. It votes Pericles into the strategy at the start of the war; it grieves the war dead in the funeral oration; it suffers the plague; it votes, after the Mytilenean revolt, to massacre every adult Mytilenean male, then reverses the vote a day later; it votes for the Sicilian Expedition in 415 against Nicias\'s warnings. Thucydides\'s portrait — admiring of its capacity for collective self-discipline under Pericles, severe about its capacity for cruelty and impulsiveness without him — has set the terms in which mass democracy has been argued about ever since.',
    },
  ],

  castGroups: [
    {
      label: 'Athenian statesmen',
      characters: ['Pericles', 'Alcibiades', 'Nicias', 'Cleon', 'Demosthenes', 'The Demos'],
    },
    {
      label: 'Spartan commanders',
      characters: ['Brasidas', 'Archidamus', 'Gylippus'],
    },
    {
      label: 'The author',
      characters: ['Thucydides'],
    },
  ],

  chapters: chunk1,
};
