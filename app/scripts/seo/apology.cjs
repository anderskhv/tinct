// The Apology — SEO page data for build-seo-pages.cjs
// Plato, 3 parts, courtroom defense speech. Voice: declarative, specific, the founding trial.

module.exports = {
  id: 'apology',
  title: 'The Apology',
  author: 'Plato',
  byline: '399 BCE · Greek philosophical defense speech',
  titleAccent: 'a guided tour',
  hook: 'A seventy-year-old philosopher, on trial for his life, refuses every move that might save him — and explains, in the hours he has left, why.',
  themesBlurb: 'The examined life, the gadfly, Socratic ignorance, philosophy on trial, the soul above the body.',
  castBlurb: 'The voices in an Athenian courtroom',
  castDesc: 'The defendant, the accusers, the absent oracle, the city itself.',
  chapterLabel: n => `Part ${n}`,
  genre: ['Philosophical dialogue', 'Classical philosophy'],

  // -- Hub copy --
  about: [
    `<em>The Apology</em> is the speech Socrates gave in his own defense at his trial in Athens in 399 BCE, written down some years later by his student Plato. He was seventy years old. The charges were impiety — not believing in the gods of the city — and corrupting the young. Five hundred and one Athenian citizens sat in judgment. The word <em>apologia</em> in Greek means a defense, not a regret; Socrates does not apologize for anything in this speech, and he comes very close to telling the jury that they ought to be honoring him instead of trying him.`,
    `The text is short — three speeches separated by two votes. First the main defense, in which Socrates explains how he came by his reputation, cross-examines his accuser, and tells the jury he will not stop philosophizing if they let him go. Then the verdict comes back guilty by a small margin, and he is asked to propose his own counter-penalty against Meletus's call for death; he proposes, half in earnest, that the city honor him with free meals at public expense. The jury votes for death by a much larger margin. The final speech is what he says after the sentence. It is the founding document of philosophy as a way of life — and the founding case study of what it costs to live that way when the city decides it has had enough.`,
  ],
  chaptersSubtitle: 'The whole speech in three parts — defense, counter-penalty, final words.',
  chaptersLead: `<p>The Apology is built like the trial it records. Part One is the long defense Socrates gives before the jury votes on guilt — the heart of the speech, where the famous arguments live (the oracle at Delphi, the gadfly, the inability to stop philosophizing). Part Two is what he says after they convict him, when Athenian law required him to propose his own punishment. Part Three is what he says after they sentence him to death — partly to those who voted against him, partly to those who voted for him, the only piece of the speech in which he is no longer trying to save his life.</p>`,
  themesByline: 'Five threads through the speech',
  themesLead: `The Apology is a defense speech, but it is also a manifesto. In the few hours Socrates has the floor, he sets out the case for the philosophical life and the indictment against the city that is about to kill him for it. These five threads run through the speech, and each one has shaped how the West has thought about philosophy, dissent, and death ever since.`,

  groups: [
    { label: 'Part 1 · The defense', subtitle: 'Why the rumors started, and why he will not stop.', chapters: [1] },
    { label: 'Part 2 · The penalty', subtitle: 'Convicted. Asked to propose his own punishment.', chapters: [2] },
    { label: 'Part 3 · Final words', subtitle: 'Sentenced to death. The last speech he will give.', chapters: [3] },
  ],

  // -- Themes (5 essays) --
  themes: [
    {
      slug: 'examined-life',
      title: 'The examined life',
      greek: '<em>ho anexetastos bios ou biōtos anthrōpōi</em> — the unexamined life is not worth living',
      preview: 'The most famous line in Western philosophy is said by a man about to die for living it. Socrates argues that examination — relentless self-questioning and questioning of others — is not optional for a human life. It is what makes the life human.',
      essay: [
        `In the penalty phase, when Socrates is asked why he could not simply agree to stop philosophizing in exchange for acquittal, he gives the answer that has carried his name down two and a half millennia: <em>the unexamined life is not worth living for a human being</em>. He says it knowing the jury will hear it as defiance. He says it anyway, because by his own account it is the only thing he is qualified to say.`,
        `What he means by examination is not introspection in the modern sense. It is not journaling, not therapy, not self-discovery. It is cross-questioning — the patient, often humiliating work of asking yourself and others what you actually mean by the words you use, what you actually believe, whether the things you call good really are good, whether the things you say you know you actually know. The Apology is a record of Socrates doing this in public, for free, for forty years. It is also a record of how unwelcome this turns out to be.`,
        `He does not present the examined life as pleasant. He has made enemies of nearly everyone he has examined; he is poor; his family has suffered; he is on trial. But he insists that any other life would be a kind of sleep — a waking sleep in which a person is moved by opinions they have not tested, fears they have not interrogated, ambitions they have not chosen. Athens, by his account, is a city of sleepers. He has been the noise that wakes them, and they are about to silence the noise.`,
        `The line is not a slogan in the speech; it is the conclusion of an argument. A human being is the kind of animal that can examine its own life. To refuse to do so is to refuse what is distinctively human in oneself. Better, Socrates says, to die at seventy still asking the questions than to live to a hundred without having asked any.`,
      ],
      where: [
        { n: 1, label: 'Part 1 (the oracle and the search)' },
        { n: 2, label: 'Part 2 (the unexamined life is not worth living)' },
      ],
    },
    {
      slug: 'oracle',
      title: 'The oracle and Socratic ignorance',
      greek: '<em>oida ouden eidōs</em> — I know that I know nothing',
      preview: 'Socrates traces his whole reputation back to a single visit to Delphi by his friend Chaerephon. The oracle said no one was wiser than Socrates. He spent decades trying to disprove it — and discovered, by failing, what the god had meant.',
      essay: [
        `Socrates explains in Part One where his strange reputation came from. Years ago his friend Chaerephon went to the oracle at Delphi and asked whether anyone was wiser than Socrates. The priestess answered that no one was. Socrates was baffled. He knew himself; he knew he was not wise. But the god could not lie. So he set out to refute the oracle by finding someone wiser than himself.`,
        `He went first to the politicians. He found that the men who had the greatest reputation for wisdom were precisely the ones least aware of what they did not know. He went to the poets. He found that they could not explain their own poems — they wrote, he says, by inspiration, like prophets, without understanding. He went to the craftsmen. He found that they did know real things, but each of them, on the strength of his craft, claimed to know everything else as well. None of them could withstand questioning.`,
        `Eventually he understood what the oracle meant. The wisdom of Socrates is not knowledge. It is the awareness of his own ignorance — the refusal to claim what he cannot defend. This is the doctrine that has come down to us as <em>I know that I know nothing</em>, though Socrates never says it in quite those words. What he does say is that human wisdom is worth little or nothing, and that the god was using his name as a placeholder: the wisest among you is the one who has noticed this.`,
        `The investigation was not free. Every politician, every poet, every craftsman he exposed became an enemy. The cumulative effect is the slander Socrates is now defending himself against — that he is a clever talker who makes the weaker argument win. The Apology is, in this sense, the bill coming due for the oracle's answer. Forty years of patient questioning, paid for at the end with hemlock.`,
      ],
      where: [
        { n: 1, label: 'Part 1 (Chaerephon and Delphi)' },
      ],
    },
    {
      slug: 'gadfly',
      title: 'The gadfly and the city',
      greek: 'a sting sent by the god',
      preview: 'In the most quoted image of the speech, Socrates calls himself a gadfly attached to the great noble horse of Athens — a sting whose job is to keep the city awake. Killing him, he warns, will not produce another. The city will go back to sleep.',
      essay: [
        `Late in Part One, Socrates gives the city the image that has defined philosophical dissent ever since. Athens, he says, is like a great horse — noble, well-bred, but slow; a horse of that size is always at risk of falling asleep on its feet. The god has attached a gadfly to it. The gadfly's job is to bite, to land on a different spot every day, to prevent the heavy beast from settling. The gadfly is Socrates. The horse is the city.`,
        `The image does several kinds of work at once. It explains why he has not entered politics: a gadfly cannot do its work from a high office; it has to move around, talk to one citizen at a time, ask the questions in the marketplace. It explains why he is so unpopular: a gadfly is, by design, annoying; the citizens he questions resent the questioning. And it explains what Athens will lose if it kills him. You will not easily find another, he says. The god sent one; the city, drowsy, is about to swat it.`,
        `Socrates is unsentimental about how this looks from the city's side. He understands that the people he has stung will be relieved when he is gone. He predicts they will sleep more peacefully for the rest of their lives — at least until the god, in his care for Athens, sends another. The implicit warning is that the god might not bother.`,
        `The gadfly metaphor has been picked up by every philosophical tradition that has had to defend itself against the state. Bertrand Russell invoked it; Martin Luther King Jr. cited it explicitly in the Letter from Birmingham Jail. The Apology turned the figure of the philosopher-as-irritant into a permanent role in Western political life. Socrates's argument is that this role is given by the divine, not chosen — and that a city that destroys its irritants destroys its own capacity to wake up.`,
      ],
      where: [
        { n: 1, label: 'Part 1 (the gadfly speech)' },
      ],
    },
    {
      slug: 'soul',
      title: 'The care of the soul',
      greek: '<em>epimeleia tēs psychēs</em> — tend to the soul before the body',
      preview: 'Throughout the speech, Socrates argues that his real work has been turning Athenians from their bodies and bank accounts toward the care of their souls. This is the order he claims the gods gave him, and the order he refuses to abandon at the price of his life.',
      essay: [
        `Socrates tells the jury that his entire life's work has been a single message, repeated to whoever would listen: do not care for the body before the soul; do not care for money before virtue; first and most importantly, attend to the soul. He says this is the divine commission he was given, and that no greater good has ever come to Athens than his attempt to deliver it.`,
        `The argument behind this priority is plain. The body is a temporary instrument; the wealth and reputation it pursues are temporary too. The soul — what Socrates calls the <em>psychē</em>, the ruling part of a person, the place where judgment and virtue live — is the durable thing, the thing whose condition determines whether a life has been well or badly lived. To spend a life polishing the body and starving the soul is to have priorities exactly inverted.`,
        `This is also why Socrates can claim, with apparent calm, that no real harm can be done to him. Meletus and Anytus can kill his body; they cannot damage his soul, because that is in his keeping, not theirs. The just man cannot be harmed by the unjust man, because the only injuries that matter are the ones we inflict on ourselves by acting unjustly. The Stoics will spend the next four centuries elaborating this thought; Christianity will translate it into a different vocabulary; the Apology is where it is first put plainly.`,
        `Socrates's care for the soul is not private piety. It has political consequences. A city full of people tending their souls is a different city from one full of people chasing money and honor. The Apology is the speech of a man who has tried, by individual conversation, to make Athens the first kind of city — and is being executed by Athens for the attempt.`,
      ],
      where: [
        { n: 1, label: 'Part 1 (the great speech to the city)' },
        { n: 3, label: 'Part 3 (no harm comes to a good man)' },
      ],
    },
    {
      slug: 'death',
      title: 'Philosophy on trial — and death as a possible good',
      greek: 'either dreamless sleep or a journey',
      preview: 'In the closing speech, after the death sentence, Socrates argues that his judges should not weep for him. Death is one of two things, both of which are good. Whether he is right is the question philosophy has been arguing about ever since.',
      essay: [
        `The Apology is the founding text of philosophy as a counter-cultural force — a way of life the city cannot quite tolerate, and that does not back down when threatened. Every later trial of a thinker by a state, from Galileo to Bonhoeffer to Havel, has been read against this template. Socrates set the shape: the philosopher does not flatter the court, does not retract the position, does not promise to behave, does not beg.`,
        `Part of what makes the trial founding is what Socrates says about death in the final speech. After the sentence is handed down, he turns to the jurors who voted for him and tells them, almost cheerfully, that he is not afraid. Death is one of two things. Either it is dreamless sleep, in which case it is a great gain — most of us would trade many troubled days for one perfectly peaceful night, and death would be a single such night, forever. Or it is a journey to a place where the souls of the dead gather. If that is true, what could be better? He could spend eternity questioning Homer and Odysseus and the heroes who suffered unjust deaths. And in that world, they certainly do not execute people for asking questions.`,
        `He does not argue that one of these is more likely. He notes that both are good, and so death cannot be feared by a person who has thought about it carefully. To fear death, he said earlier in the speech, is to pretend to know what one does not know — to claim with confidence that death is the worst of evils, when no one has any evidence that it is an evil at all. This is the same Socratic ignorance he applied to the politicians and poets, now turned on the largest fear a human being has.`,
        `The argument is the argument of someone who has taken the care of the soul seriously his whole life. Socrates is not afraid of death because he is not afraid of the verdict on his soul. The Apology ends with a sentence Plato would not have let himself invent if it had not been spoken: <em>The hour of departure has arrived, and we go our ways — I to die, and you to live. Which is better, only god knows.</em>`,
      ],
      where: [
        { n: 1, label: 'Part 1 (no one knows whether death is an evil)' },
        { n: 3, label: 'Part 3 (the closing speech)' },
      ],
    },
  ],

  // -- Key figures (summary preview) --
  keyFigures: [
    { name: 'Socrates', role: 'The defendant', body: `Seventy years old, barefoot, famously ugly, a stonecutter's son who served as an infantryman in three campaigns. He has spent decades questioning Athenians in the marketplace about whether they really know what they claim to know. He could leave; exile is offered. He will not. The speech is his.` },
    { name: 'Meletus', role: 'The accuser', body: `The young poet who formally brings the charges. Socrates calls him to the stand mid-speech and cross-examines him on the spot, exposing in a few minutes that the indictment contradicts itself. Plato lets the contradiction stand without comment.` },
    { name: 'Anytus', role: 'The political force', body: `The wealthy democratic politician whose influence is the real engine of the prosecution. He is barely mentioned in the speech, but Socrates implies he is the one whose weight will determine the verdict. The figurehead is Meletus; the force is Anytus.` },
    { name: 'Lycon', role: 'The third accuser', body: `The orator who joins Meletus and Anytus in bringing the charges, speaking on behalf of the city's professional rhetoricians. He has no speaking role in the dialogue but supplies the third name on the indictment.` },
    { name: 'Chaerephon', role: 'The friend at Delphi', body: `Socrates's old friend, dead by the time of the trial, who once asked the oracle at Delphi whether anyone was wiser than Socrates. The oracle's "no" is what set the whole investigation in motion. His brother is in the courtroom and can confirm the story.` },
    { name: 'The Jury of 501', role: 'Athenian citizens', body: `Five hundred and one ordinary citizens, selected by lot, who vote on guilt and on sentence. They convict by a margin of about thirty votes. After Socrates proposes free meals at public expense, they vote death by a much larger margin. Plato was in the room.` },
  ],

  // -- Cast (full page) --
  castSubtitle: 'The voices in an Athenian courtroom, 399 BCE.',
  castLead: `<p>The Apology is structured around four named accusers, one famous absent friend, and a jury of five hundred and one citizens who never speak as individuals. Socrates is the only continuous voice. His cross-examination of Meletus is the only stretch where another character speaks at length, and even then the questions belong to Socrates. The rest is the city, listening.</p>
      <p>Plato was present at the trial — he names himself in the speech, in the list of friends willing to stand surety for the fine. He was twenty-eight. The Apology is what he could reconstruct, with whatever artistic license, of the speech that decided his teacher's death. Every other dialogue he wrote is in some way an answer to that day.</p>`,
  castGroups: [
    {
      label: 'In the courtroom',
      subtitle: 'Everyone who speaks or is named on the day of the trial.',
      characters: [
        { id: 'socrates', tag: 'Speaker', name: 'Socrates', epithet: 'The defendant', body: `Seventy years old. A stonecutter's son who never charged a fee for his teaching, served bravely as an infantryman at Potidaea, Amphipolis, and Delium, and has spent forty years questioning his fellow Athenians in the marketplace. He is on trial for impiety and corrupting the youth. He could have begged for mercy; he could have proposed exile; he could have promised to stop philosophizing. He does none of these. The whole speech is his — three parts, two votes, one sentence at the end.`, appearsLabel: 'Throughout.', appears: [1, 2, 3] },
        { id: 'meletus', tag: 'Speaker', name: 'Meletus', epithet: 'The chief accuser', body: `The young poet who has formally brought the indictment. Socrates calls him to the witness stand in the middle of his own defense and cross-examines him on the spot. Within a few exchanges Meletus has been led into self-contradiction — he claims Socrates is the only Athenian who corrupts the young, and that Socrates is at once an atheist and a believer in new divine beings. Plato lets the contradictions stand. Meletus is the visible accuser, but the trial is not really about him.`, appears: [1] },
        { id: 'anytus', tag: 'Named', name: 'Anytus', epithet: 'The political force', body: `A wealthy democratic politician, prominent in the restoration of democracy after the Thirty Tyrants brought it down four years earlier. He considers Socrates a threat to the recovered city — Socrates was associated with Critias and Alcibiades, the two most notorious products of his teaching, and Anytus has not forgotten. He does not speak in the Apology, but Socrates names him repeatedly as the dangerous one, the figure whose political weight will determine the verdict. Plato writes him as the force behind the prosecution, not the figurehead.`, appears: [1, 2] },
        { id: 'lycon', tag: 'Named', name: 'Lycon', epithet: 'The third accuser', body: `An Athenian orator, the third name on the indictment, brought in to represent the city's rhetoricians whom Socrates's questioning has embarrassed over the years. He has no speaking role in the Apology and almost no presence in the speech. Socrates names him only in passing, as one of the three faces of the prosecution alongside Meletus and Anytus, and otherwise lets him stand silent. His usefulness to the case is the constituency he speaks for, not anything he himself contributes.`, appears: [1, 2] },
        { id: 'jury', tag: 'Audience', name: 'The Jury of 501', epithet: 'Athenian citizens, selected by lot', body: `Five hundred and one ordinary citizens, chosen by lot from the rolls of Athens, who vote on guilt and on sentence. Socrates addresses them throughout — sometimes respectfully, often with pointed irony, occasionally with what reads as contempt. They convict him by a margin of about thirty votes. After he proposes free meals at public expense as his counter-penalty, they vote death by a much larger margin. He calls them "men of Athens"; he calls only those who voted for him "judges."`, appearsLabel: 'Throughout (audience).', appears: [1, 2, 3] },
        { id: 'plato', tag: 'Named', name: 'Plato', epithet: 'The student in the room', body: `Twenty-eight years old at the time of the trial, present in the courtroom. Socrates names him in the second speech as one of the friends who will guarantee the thirty-mina fine. The Apology is Plato's reconstruction of his teacher's defense, written sometime in the years after — close enough to the event that other witnesses could have contradicted it, far enough away that artistic shaping is doing real work. Every dialogue Plato ever wrote is in some sense an answer to this day.`, appears: [2] },
      ],
    },
    {
      label: 'The absent',
      subtitle: 'Names invoked but not on stage.',
      characters: [
        { id: 'chaerephon', tag: 'Named', tagClass: 'creature', name: 'Chaerephon', epithet: 'The friend who asked the oracle', body: `Socrates's longtime friend, an Athenian democrat who shared the city's exile under the Thirty Tyrants and returned with the restoration. Years before the trial, he went to the oracle at Delphi and asked whether anyone was wiser than Socrates. The priestess answered that no one was. That answer, and Socrates's decades-long attempt to refute it, is the origin of the philosophical mission the Apology is defending. Chaerephon is dead by 399 BCE, but his brother is in the courtroom and can confirm the story.`, appearsLabel: 'Named (Part 1).', appears: [1] },
        { id: 'oracle', tag: 'Subject', tagClass: 'creature', name: 'The Oracle at Delphi', epithet: 'The voice of Apollo', body: `The Pythian priestess at the temple of Apollo in Delphi, whose answer to Chaerephon's question — that no one is wiser than Socrates — Socrates treats throughout the speech as a divine commission. He spent decades trying to disprove the oracle and discovered, by failing, what it meant: that human wisdom is little or nothing, and that the wisest person is the one who has noticed this. The oracle never speaks in the Apology, but the whole speech is, in a sense, Socrates's report back.`, appearsLabel: 'Named (Part 1).', appears: [1] },
        { id: 'athens', tag: 'Setting', tagClass: 'creature', name: 'Athens', epithet: 'The city on trial', body: `The world's first democracy, fresh from defeat in the Peloponnesian War, fresh from the brief tyranny of the Thirty, anxious about its identity and its losses. It is about to execute its most famous philosopher for asking uncomfortable questions about whether anyone in the city actually knows what they claim to know. Socrates predicts in the closing speech that the verdict will be remembered as a stain on the city. He was right; the Apology is the document that made it so.`, appearsLabel: 'Throughout (setting).', appears: [1, 2, 3] },
      ],
    },
  ],

  // -- Chapters (3 parts) --
  chapters: [
    {
      n: 1,
      title: 'The defense — the oracle, the gadfly, and the refusal to stop',
      tourTitle: 'The defense',
      hook: 'Three hours, five hundred and one jurors, and a seventy-year-old man explaining how he came by his enemies — and why, if released, he would do it all again tomorrow.',
      tour: `Socrates refuses the polished style of the orators. Over seventy, never in a courtroom before, he will speak the way he speaks in the marketplace. He traces his reputation to a single moment: his friend Chaerephon asked the oracle at Delphi whether anyone was wiser than Socrates, and the priestess said no. Decades of trying to disprove the god by finding someone wiser have only made enemies of every politician, poet, and craftsman he examined. He calls Meletus to the stand and pulls the indictment apart. He calls himself a gadfly the god has attached to the noble sluggish horse of Athens to sting it awake. He will not stop philosophizing.`,
      blurb: `The defense proper. Socrates explains how he came by his strange reputation — the oracle at Delphi, the decades of questioning, the cumulative resentment of every politician, poet, and craftsman he ever exposed. He cross-examines Meletus and pulls the indictment apart in minutes. He calls himself a gadfly the god has attached to the city to sting it awake, and tells the jury plainly that he will not stop philosophizing if they release him — not even at the price of his life.`,
      summary: [
        `Socrates warns the jury he will not speak in the polished style of the orators. He is over seventy, has never been in a courtroom, and will speak the way he speaks in the agora. He has two sets of accusers, he says: the recent ones — Meletus, Anytus, Lycon — and a much older set, the rumor and slander that have followed him for decades. The older are harder to answer; he cannot call them to the stand. He has to fight shadows.`,
        `The shadows trace back to one moment. His friend Chaerephon asked the oracle at Delphi whether anyone was wiser than Socrates, and the priestess answered that no one was. Socrates, baffled, set out to refute the god. He went to the politicians, who had the greatest reputation for wisdom and the smallest awareness of what they did not know. He went to the poets, who could not explain their own poems. He went to the craftsmen, who knew real things but on the strength of their craft claimed to know everything else. None survived questioning. Eventually he understood: human wisdom is worth little or nothing, and the wisest person is the one who has noticed it. Forty years of examination made forty years of enemies — who are really who is prosecuting him today.`,
        `He calls Meletus to the stand and within a few exchanges has him contradicting himself — claiming Socrates alone corrupts the young, and that Socrates is at once an atheist and a believer in new divine beings. Then he refuses the bargain the jury wants: stop philosophizing and we let you go. He cannot. The god has stationed him in Athens the way a general stations a soldier, and a soldier does not desert his post out of fear of death. To fear death is to pretend to know what no one knows. He calls himself a gadfly the god has attached to the great noble horse of the city, to sting it awake. Kill him, and the city will sleep peacefully ever after — unless the god bothers to send another.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'meletus', name: 'Meletus' },
        { id: 'anytus', name: 'Anytus' },
        { id: 'lycon', name: 'Lycon' },
        { id: 'chaerephon', name: 'Chaerephon' },
        { id: 'oracle', name: 'The Oracle at Delphi' },
        { id: 'jury', name: 'The Jury of 501' },
      ],
      themes: [
        { slug: 'examined-life', label: 'The examined life' },
        { slug: 'oracle', label: 'Oracle and ignorance' },
        { slug: 'gadfly', label: 'Gadfly' },
        { slug: 'soul', label: 'Care of the soul' },
      ],
    },
    {
      n: 2,
      title: 'The penalty — free meals at public expense',
      tourTitle: 'The penalty',
      hook: 'Convicted by thirty votes. Asked under Athenian law to propose his own punishment. He proposes that the city honor him.',
      tour: `The jury convicts by about thirty votes — closer than he expected. Athenian law requires Socrates to propose his own counter-penalty against Meletus's call for death. He refuses every face-saving option. Exile? He is too old, and other cities will not bear his conversation either. Prison? Why live as the slave of a magistrate? A fine? He has no money. Stop philosophizing? That would be disobedience to god — and the unexamined life is not worth living. What he deserves, he says, is what Athens gives its Olympic champions: free meals at the Prytaneum. At his friends' urging he offers thirty minas. The jury votes for death by a larger margin.`,
      blurb: `The verdict comes back guilty by a margin of about thirty votes — closer than Socrates expected. Athenian law now requires him to propose his own punishment against Meletus's call for death. He uses the moment to refuse every face-saving option — exile, prison, silence — and proposes, half in earnest, that the city honor him with free meals at public expense. At his friends' urging he eventually offers a fine of thirty minas. The jury votes for death by a much larger margin.`,
      summary: [
        `The vote comes back narrow — convicted by about thirty votes either way, closer than Socrates expected. He says so. He had thought Meletus would not even clear the legal threshold without Anytus and Lycon. Now Athenian law requires him to propose a counter-penalty against Meletus's call for execution. This is the moment a defendant traditionally weeps, parades his children, offers a humble fine. Socrates does none of these.`,
        `He asks instead what a man deserves who has spent his life ignoring wealth, office, and political faction in order to attend privately to each citizen, urging them to care for the soul before the body. Such a man, he says, is a benefactor of the city, and Athens should keep him at his work. He needs leisure to instruct it; he is poor and cannot pay for it himself. The fitting reward is what Athens gives its Olympic champions: free meals at the Prytaneum, the public dining hall, for life. The chariot winner gives the city the appearance of happiness; Socrates has been giving it the real thing. He says this knowing how it will land.`,
        `He works through the alternatives and refuses each. Imprisonment: why live as the slave of whichever magistrate happens to hold office? A fine he cannot pay, with prison until he can: the same trap under another name. Exile: he is old, and if Athens cannot bear his conversation no other city will either. Silence — the only offer that might save him — is the hardest to refuse, and he refuses it most clearly. To remain quiet would be disobedience to the god who stationed him in Athens; besides, examining life every day is the greatest good a human being can do, and the unexamined life is not worth living. At his friends' urging — Plato named, with Crito, Critobulus, Apollodorus — he proposes thirty minas, which they will guarantee. The jury votes death by a much larger margin than the conviction.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'meletus', name: 'Meletus' },
        { id: 'anytus', name: 'Anytus' },
        { id: 'lycon', name: 'Lycon' },
        { id: 'plato', name: 'Plato' },
        { id: 'jury', name: 'The Jury of 501' },
      ],
      themes: [
        { slug: 'examined-life', label: 'The examined life' },
        { slug: 'soul', label: 'Care of the soul' },
      ],
    },
    {
      n: 3,
      title: 'Final words — to those who killed him, and to those who did not',
      tourTitle: 'Final words',
      hook: 'Sentenced to death, he turns to the jurors with what he has left to say — first to those who voted against him, then to those who voted for him. The hour of departure has arrived.',
      tour: `The death sentence is handed down. Socrates is given a moment to speak, and what he says is the only part of the defense in which he is no longer trying to save his life. To those who voted for execution he prophesies: more questioners are coming, younger and harsher, and you will not silence them this way. To those who voted to acquit, his voice softens. His divine sign — the inner voice that has stopped him at every misstep since childhood — did not stop him today, which means today is not, despite appearances, going wrong. Death is dreamless sleep or a journey to where the dead gather; either is gain. He asks his friends to question his sons as he has questioned them. The hour has come.`,
      blurb: `Sentenced to death. Socrates speaks one last time. To those who voted to kill him: more questioners are coming, and you will not silence them this way. To those who voted to spare him: be of good cheer. His divine sign was silent today, which means death is not the evil it looks like. He asks his friends to question his sons as he has questioned them, and ends with the line Plato could not have invented: which is better, only god knows.`,
      summary: [
        `The vote on the sentence comes back: death. Athenian procedure allows the condemned a final word, and Socrates uses it. He turns first to those who voted against him. The city's critics will say Athens killed Socrates — they will call him wise to spite the city — and the verdict will be remembered as a stain. He could have been acquitted, he says, if he had been willing to weep and beg and parade his children. He was not. The hard thing is not avoiding death; the hard thing is avoiding wrongdoing. He is old and slow, and death has caught him. His accusers are young and quick, and wickedness has caught them.`,
        `He prophesies that more questioners are coming, younger and less patient, and killing him will not stop them. Then he turns to those who voted to acquit, and his voice softens. He calls these men, and only these men, "judges." All his life, he tells them, he has been guided by a divine sign — an inner voice that has stopped him at every misstep since childhood. Today, walking to court, speaking through three speeches and two votes, the sign has not opposed him once. It would have stopped him if any of this were a mistake. Whatever has happened today is, despite appearances, good.`,
        `Death, he says, is one of two things. Either it is dreamless sleep — eternity reduced to a single untroubled night. Or it is a journey to where the dead gather, in which case he will spend forever questioning Homer and Odysseus and the heroes who suffered unjust deaths; and there at least no one is executed for asking questions. Both possibilities are gain. He asks one favor: when his sons are grown, if they care more about money or reputation than about virtue, his friends should give them the same trouble he has given Athens. Then both he and his sons will have been treated justly. The hour of departure has arrived, he says — I to die, and you to live. Which of us goes to the better fate, only god knows. A few weeks later he drinks the hemlock.`,
      ],
      appears: [
        { id: 'socrates', name: 'Socrates' },
        { id: 'jury', name: 'The Jury of 501' },
      ],
      themes: [
        { slug: 'death', label: 'Death and philosophy on trial' },
        { slug: 'soul', label: 'Care of the soul' },
        { slug: 'examined-life', label: 'The examined life' },
      ],
    },
  ],
}
