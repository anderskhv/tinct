// Crito — SEO page data for build-seo-pages.cjs
// Plato, 3 chapters. Companion to apology.cjs and phaedo.cjs.
// Voice: literary, declarative present. Specific to the prison cell, the dawn, the Laws personified.

module.exports = {
  id: 'crito',
  title: 'Crito',
  author: 'Plato',
  byline: 'c. 360 BC · Socratic dialogue',
  titleAccent: 'a guided tour',
  hook: 'Before dawn, an old friend slips into the prison with money, a plan, and a boat. Socrates has three days left. The Laws of Athens have other ideas.',
  genre: ['Philosophy', 'Socratic dialogue', 'Ethics'],
  themesBlurb: 'Justice, obedience, self-preservation, the social contract, philosophy versus rhetoric.',
  castBlurb: 'The prison cell',
  castDesc: 'Two old men and a city.',
  castSubtitle: 'The prison cell — two old friends and the Laws that raised them.',
  chapterLabel: n => `Part ${n}`,

  about: [
    `<em>Crito</em> is the second of the three trial dialogues, set in the days between Socrates' conviction in <em>Apology</em> and his death in <em>Phaedo</em>. It is the most intimate of them. Where <em>Apology</em> is Socrates standing in court before the city, <em>Crito</em> is Socrates lying in a prison cell before a single friend. The argument is smaller, more private, and in some ways more difficult: no jury is watching, escape is genuinely available, and the friend pleading for his life is correct that the verdict was unjust.`,
    `Crito arrives before dawn with money, a plan, and friends abroad who will receive the fugitive. He makes his case with urgency and love. Socrates listens and then, systematically, refuses every argument. He will not weigh the opinion of the many against the opinion of the one who knows. He will not answer injustice with injustice. He will not, at seventy, abandon the principles by which he has lived his entire life because living has suddenly become difficult. To press the point, he stages a dialogue within the dialogue: the Laws of Athens walk into the cell and confront him directly, speaking with the authority of parents, the precision of jurists, and the patience of figures who have watched generations of citizens come and go.`,
    `The dialogue ends with Crito having nothing to say. Socrates chooses to die — not because death is good, but because flight would be worse. <em>Crito</em> is, among other things, a test case for Socratic philosophy: what does it require when no one is watching and the cost is everything? The answer is the same as it always was. That is what makes the dialogue difficult and worth reading.`,
  ],

  chaptersSubtitle: 'Three parts — from the pre-dawn cell to Socrates\'s final word.',
  chaptersLead: `<p>Crito moves in a single unbroken arc across one morning. Part one establishes the situation — the ship is due, escape is possible, Crito has everything arranged. Part two is the long argument: Socrates dismantles Crito's reasons one by one, returns to first principles, and reaches the question that matters. Part three lets the Laws speak for themselves. From that point, Crito has nothing more to say.</p>`,

  themesByline: 'Five threads through the dialogue',
  themesLead: `Crito is the shortest of the trial dialogues and the most compressed. In under thirty pages, it lays out a theory of justice, a theory of the social contract, a theory of parental obligation, and a theory of philosophical method. The argument has not aged.`,

  castLead: `<p>Crito has three speaking figures: Socrates, Crito, and the Laws of Athens — who do not physically appear but are given a voice by Socrates himself. The cast is small because the question is simple: one man, one friend, one city. That is all it needs.</p>`,

  groups: [
    { label: 'Part I', subtitle: 'The dawn visit — Crito arrives with news and a plan.', chapters: [1] },
    { label: 'Part II', subtitle: 'The argument — Socrates refuses, step by step.', chapters: [2] },
    { label: 'Part III', subtitle: 'The Laws speak — and Crito falls silent.', chapters: [3] },
  ],

  themes: [
    {
      slug: 'justice-over-self-preservation',
      title: 'Justice over self-preservation',
      greek: '"We must not think of what the many will say, but of what he will say who understands justice"',
      preview: "Crito's argument is the argument of love — the children, the friends, the reproach of the crowd. None of it moves Socrates. Self-preservation is a value, he agrees. It is not the highest value.",
      essay: [
        `Crito's case is built from affection. You will leave your sons fatherless. You will let your friends be reproached for not saving you when they could. You will hand your enemies the satisfaction of a death they did not deserve to inflict. Every reason is a good reason, and Crito is not wrong about any of them. None of it moves Socrates.`,
        `He answers with a distinction Crito never quite catches: the question is not what is best for me, or for those I love, but what is just. "We must not then think so much of what the many will say of us, but what he will say who understands justice and injustice." Self-preservation is a value. It is not the highest value. A life saved by injustice is, by the standard Socrates has spent his life defending, not worth saving.`,
        `The dialogue is unsettling because it asks, calmly, whether we believe what we say we believe — or whether, when the cell door opens, we will discover that we always meant something else. Crito, who loves Socrates, reveals by his arguments that he has never quite accepted the hierarchy Socrates has lived by. For Crito, love comes first. For Socrates, justice comes first. The gap between them is small and unbridgeable.`,
      ],
      where: [
        { n: 2, label: 'Part 2 (the plea and the dismantling)' },
        { n: 3, label: 'Part 3 (the Laws close the case)' },
      ],
    },
    {
      slug: 'the-city-as-parent',
      title: 'The city as parent',
      greek: '"Your country is more to be valued and higher and holier far than mother or father"',
      preview: 'When the Laws speak, they do not argue as a contract between equals. They argue as a father speaks to a son. The relation is asymmetric. Obedience is not fear — it is piety.',
      essay: [
        `When the Laws speak, they do not argue as a contract between equals. They argue as a father speaks to a son. "Are you so wise as to have forgotten that your country is more to be valued and higher and holier far than mother or father or any ancestor, and more to be regarded in the eyes of the gods and of men of understanding?" The relation is asymmetric. The city brought Socrates into being, fed him, educated him, gave him the conditions under which philosophy itself was possible.`,
        `Against that gift, the citizen has no equivalent to offer. He may try to persuade the city when he disagrees, and Socrates has done that all his life. What he may not do is strike back. A son does not strike his father even when the father is wrong. The image is uncomfortable in a way Plato seems to want it to be: it makes obedience a matter not of fear but of something like piety.`,
        `The argument cuts deepest because Socrates has been wronged. The verdict was unjust — he knows it, Crito knows it, the dialogue does not pretend otherwise. The Laws' argument is not that the verdict was correct. It is that a citizen's response to an incorrect verdict cannot be to tear up the agreement under which he has lived. You persuade or you obey. You do not run.`,
      ],
      where: [
        { n: 3, label: 'Part 3 (the Laws on parenthood and piety)' },
      ],
    },
    {
      slug: 'the-social-contract',
      title: 'The social contract avant la lettre',
      greek: '"By remaining you agreed to be governed by our commands"',
      preview: "Two thousand years before Hobbes, the Laws of Athens make the contract argument: staying is consenting. Socrates never left. That is the proof.",
      essay: [
        `Beneath the parental image runs a second argument that the modern reader will recognize as the contract argument, two thousand years before Hobbes. The Laws point out that Socrates was free to leave Athens at any time. He could have taken his property and emigrated to Sparta, to Crete, to Megara — cities whose laws he is reported to admire. He did not. He stayed, married, raised children, conducted his philosophy in the agora, accepted everything the city had to give.`,
        `By staying he made an agreement, not in writing but in deed, to live by the city's laws. To break that agreement now, only when the laws have inconvenienced him, would be to confess that the agreement was never serious. He is like someone who has played the game all his life and only complains about the rules when he loses.`,
        `The argument is not yet Locke's or Rousseau's, but the bones are there: legitimacy as consent, consent as residence, the citizen as a party to a binding pact he is free at any time to renounce by leaving — and only by leaving. The Laws even specify the exit condition: Socrates could have proposed exile at his own trial. He declined. He was not deceived; he was not rushed. He had seventy years to form this preference, and he expressed it clearly, and now he wants to change the terms because the terms have cost him everything. That, the Laws say, is not how agreements work.`,
      ],
      where: [
        { n: 2, label: 'Part 2 (the argument from first principles)' },
        { n: 3, label: 'Part 3 (the seventy years of residency)' },
      ],
    },
    {
      slug: 'the-laws-personified',
      title: 'The Laws as personified speakers',
      greek: '"Tell us, Socrates, what are you about?"',
      preview: 'The most striking move in the dialogue is rhetorical. Socrates does not say what the Laws would say — he stages them. An abstract principle can be argued with. An abstract principle does not look you in the eye.',
      essay: [
        `The most striking move in the dialogue is rhetorical. Socrates does not say what he thinks the Laws would say; he stages them. They walk into the cell and confront him. "Tell us, Socrates, what are you about?" The technique is called prosopopoeia — the giving of a voice to what does not literally speak — and Plato uses it here for a reason.`,
        `An abstract principle can be argued with. An abstract principle does not look you in the eye. By personifying the Laws, Socrates forces Crito (and the reader) to face the question as a question between persons: would you, in front of the city that raised you, defend this escape to its face? The answer Crito cannot give is the answer the dialogue extracts.`,
        `It is also a quiet warning about philosophy itself: the strongest arguments are the ones we cannot dismiss as merely arguments, the ones that look back. Socrates has been making arguments for the whole dialogue. The Laws do not argue; they address. "Tell us, Socrates." It is the hardest line in the dialogue to answer — not because the argument is airtight, but because the question is asked by someone who knows you.`,
      ],
      where: [
        { n: 3, label: 'Part 3 (the Laws enter the cell)' },
      ],
    },
    {
      slug: 'philosophy-versus-rhetoric',
      title: 'Philosophy versus rhetoric',
      greek: '"I am the kind of man who can only be guided by reason"',
      preview: "Crito argues with love; Socrates argues with logic. The dialogue stages, in miniature, the contest that runs through all of Plato: rhetoric appeals to what we want; philosophy changes what we want.",
      essay: [
        `Crito is no philosopher. He is a wealthy old friend who loves Socrates and wants him alive. His arguments are the arguments of decent feeling: think of the children, think of what people will say, think of how easy escape would be. Socrates respects him too much to dismiss any of it, but he also refuses to be moved by considerations of feeling alone.`,
        `"Not now for the first time, but always, I am the kind of man who listens to nothing within me but the argument that on reflection seems best." The situation is the worst of his life. The principle still applies. Philosophy is not a fair-weather practice.`,
        `The dialogue stages, in miniature, the contest that runs through Plato's whole work: rhetoric persuades by appealing to what we already want; philosophy persuades, when it persuades at all, by changing what we want. Crito leaves the cell having said almost nothing in the last third of the conversation. He has not been refuted. He has been outweighed. The love is still there — the argument has not touched it — but Crito can no longer speak from it. That is the difference between the two men, and the dialogue is built around it.`,
      ],
      where: [
        { n: 1, label: 'Part 1 (Crito\'s urgency vs Socrates\'s calm)' },
        { n: 2, label: 'Part 2 (the dismantling of Crito\'s case)' },
      ],
    },
  ],

  cast: [
    {
      name: "Socrates",
      role: "PHILOSOPHER",
      body:
        "Seventy years old, days from execution, unhurried. He sleeps soundly in the cell because, as he tells Crito, it would be unbecoming at his age to be disturbed by death. Throughout the dialogue he does to himself what he has done to others all his life: refuses to let love or pity substitute for reasoning. He never claims his accusers were right, never pretends the verdict was just, never wavers from the position that injustice answered with injustice doubles the harm. The Socrates of Crito is the Socrates of Apology after the verdict has been read — the same man, still being himself, with the difference now that no audience is watching.",
    },
    {
      name: "Crito",
      role: "OLD FRIEND",
      body:
        "Wealthy, devoted, practical, and out of his depth. He has bribed the guard, arranged the boat, secured friends in Thessaly who will receive Socrates and protect his children. Every preparation has been made; the only thing left is consent. Crito argues with the urgency of a man who knows the ship is coming. He is not a fool — he sees what the city has done — but he cannot make Socrates' distinction between what is just and what is desirable hold, because for him the desirable thing (his friend alive) is too obviously good to be ranked second. He represents, throughout, the voice of natural human love, and the dialogue's quiet sadness is that love this fierce is still not enough.",
    },
    {
      name: "The Laws of Athens",
      role: "PERSONIFIED CITY",
      body:
        "They do not appear in the cell; Socrates summons them. Once invoked, they speak with the authority of parents, the precision of jurists, and the patience of figures who have watched generations of citizens come and go. They make two arguments. First, the city is more sacred than father or mother and may not be struck even when it strikes you. Second, you have lived under us for seventy years without complaint, and to flee now is to confess that your obedience was always conditional on convenience. By the end of the dialogue they have spoken longer than either Socrates or Crito. The choice the Laws describe — die here as a citizen, or live abroad as a man who broke faith with the city that made him — is the choice Socrates accepts.",
    },
  ],

  castGroups: [
    {
      label: 'The cell',
      subtitle: 'Two old friends and the city that raised them.',
      characters: [
        {
          id: 'socrates',
          name: 'Socrates',
          tag: 'Philosopher',
          epithet: 'Prisoner of Athens',
          body: "Seventy years old, days from execution, unhurried. He sleeps soundly in the cell because, as he tells Crito, it would be unbecoming at his age to be disturbed by death. Throughout the dialogue he does to himself what he has done to others all his life: refuses to let love or pity substitute for reasoning. He never claims his accusers were right, never pretends the verdict was just, never wavers from the position that injustice answered with injustice doubles the harm. The Socrates of <em>Crito</em> is the Socrates of <em>Apology</em> after the verdict has been read — the same man, still being himself, with the difference now that no audience is watching.",
          appears: [1, 2, 3],
        },
        {
          id: 'crito',
          name: 'Crito',
          tag: 'Old Friend',
          epithet: 'Wealthy Athenian, lifelong companion',
          body: "Wealthy, devoted, practical, and out of his depth. He has bribed the guard, arranged the boat, secured friends in Thessaly who will receive Socrates and protect his children. Every preparation has been made; the only thing left is consent. Crito argues with the urgency of a man who knows the ship is coming. He is not a fool — he sees what the city has done — but he cannot make Socrates' distinction between what is just and what is desirable hold, because for him the desirable thing (his friend alive) is too obviously good to be ranked second. He represents, throughout, the voice of natural human love, and the dialogue's quiet sadness is that love this fierce is still not enough.",
          appears: [1, 2, 3],
        },
        {
          id: 'the-laws',
          name: 'The Laws of Athens',
          tag: 'Personified',
          tagClass: 'creature',
          epithet: 'The city given a voice by Socrates',
          body: "They do not appear in the cell; Socrates summons them. Once invoked, they speak with the authority of parents, the precision of jurists, and the patience of figures who have watched generations of citizens come and go. They make two arguments. First, the city is more sacred than father or mother and may not be struck even when it strikes you. Second, you have lived under us for seventy years without complaint, and to flee now is to confess that your obedience was always conditional on convenience. By the end of the dialogue they have spoken longer than either Socrates or Crito. The choice the Laws describe — die here as a citizen, or live abroad as a man who broke faith with the city that made him — is the choice Socrates accepts.",
          appears: [3],
        },
      ],
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'The Visit at Dawn',
      tourTitle: 'The dawn cell',
      hook: 'Before dawn, Crito is already seated beside the sleeping philosopher. The ship from Delos is almost here.',
      tour: `The cell is dark. Crito has bribed the guard and been sitting in silence — he did not want to wake Socrates, whose calm in the face of death he finds staggering. When Socrates wakes he is unsurprised to see his old friend there. He has had a dream: a woman in white called his name and quoted Homer — "on the third day from now you shall arrive in fertile Phthia." He reads this as meaning the ship from Delos will arrive in two days, not one. Crito brings the news the ship is close — possibly tomorrow. He is pressing. He has everything ready. He came early because there is no time. Socrates thanks him, remarks that a man his age ought not to be troubled by death, and asks what the actual hurry is.`,
      blurb: `Before dawn, Crito sits in silence beside the sleeping philosopher. He has bribed the guard and come with a plan and money. Socrates wakes, recounts a dream about Homer's Phthia, and calmly estimates the ship is still two days away. Crito insists it may be sooner.`,
      summary: [
        `The cell is dark, and Crito has been sitting beside Socrates in silence. He did not want to wake him — the philosopher's ability to sleep peacefully with execution three days away is, Crito says, the most astonishing thing he has ever seen. When Socrates wakes he is unsurprised; he knew Crito was there. He is also, in the first lines of the dialogue, demonstrably unhurried. He asks what time it is. He asks why the guard let Crito in. He asks how long Crito has been sitting there. He is in no danger of being overcome by the urgency that has driven his friend across the city before dawn.`,
        `The news is that the ship from Delos — whose arrival signals the day of execution — is close. People coming from Sunium have seen it there; it will probably dock tomorrow. When it does, the sentence must be carried out. Crito has come precisely because there is still, barely, time. He has money ready. He has foreign friends who will receive Socrates and keep him safe. He has thought through everything except Socrates's consent, which he has come to collect.`,
        `Socrates listens and then demurs on the timing. Last night — or just now, he corrects himself — he had a dream. A beautiful woman in white appeared and spoke a line from Homer: "on the third day from now you shall arrive in fertile Phthia." He takes this as a sign the ship will not arrive until the day after tomorrow, giving him a day still to live. Crito thinks the dream is strange. Socrates finds the meaning clear enough. He is not afraid. At his age he should not be. Crito observes that plenty of old men facing death are still afraid. Socrates concedes the point — and asks what Crito actually came to say.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'crito', name: 'Crito' }],
      themes: [{ slug: 'justice-over-self-preservation', label: 'Justice over self-preservation' }],
    },
    {
      n: 2,
      title: 'The Plea and the Argument',
      tourTitle: 'The long argument',
      hook: 'Crito makes his case with love and logic. Socrates dismantles it, returns to first principles, and asks: may a just man answer injustice with injustice?',
      tour: `Crito lays out everything he has arranged and everything he fears — disgrace for the friends who failed to save him, orphaned children, money wasted. Socrates replies that he can only be moved by the best argument, not by love or pity. They go back to first principles: not all opinions are equal; the opinion of the expert outweighs the opinion of the crowd; the soul is more important than the body; a damaged soul is worse than death. From there the conclusion is almost mechanical: if escape requires injustice, it is the wrong choice. Crito, following each step, cannot find a flaw in the argument but also cannot bring himself to abandon the original plea. The question narrows to one: is escaping — against the explicit will of the city — itself an injustice?`,
      blurb: `Crito makes three arguments: the friends' reputation will suffer; the children will be abandoned; escape is easy and cheap. Socrates returns to first principles — the opinion of the one who knows, the supremacy of the soul, the impossibility of answering injustice with injustice — and shows that the only remaining question is whether escape itself is unjust.`,
      summary: [
        `Crito's case is not simple. He makes three distinct arguments. First, he will be personally shamed: people will say he had the money to save Socrates and chose not to spend it. Second, Socrates is failing his children: he could raise and educate them but instead is choosing to abandon them to the fate of orphans. Third, escape is not even difficult: foreigners have raised large sums, friends in Thessaly are waiting, the informers ask for little. He ends with the most direct accusation: Socrates is choosing the easier path, not the better one. Socrates, says Crito, has always claimed to care about virtue.`,
        `Socrates's response is methodical. He cannot be guided by love or by pity. He is — and has always been — the kind of man who can only be moved by the best argument on reflection. The situation does not change that. The question of whether to escape must be decided by the same method as any other question. And the method begins, as it always has, with first principles. Are all opinions equal? No — we follow the physician's opinion about the body, not the crowd's. Is the soul more important than the body? Yes — we agreed on this. Then should we damage the soul to save the body? No. And does injustice damage the soul? Yes — we agreed on this too. Then escaping through injustice, even to save a life, is the wrong choice. Not because life is unimportant, but because the soul is more important than life.`,
        `The argument narrows until only one question remains: is escaping — against the explicit decision of the city, without its consent — itself an injustice? Socrates frames it precisely. He is not asking whether the verdict was just (it was not). He is asking whether a private man may answer the city's injustice with an injustice of his own. The crowd believes you can — that returning evil for evil is simply fair. Socrates has never believed this. May we do evil? No. May we return evil for evil? No — the same principle applies. Then may we wrong those we should least of all wrong? The city? Crito cannot answer. He says: I do not know.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'crito', name: 'Crito' }],
      themes: [
        { slug: 'justice-over-self-preservation', label: 'Justice over self-preservation' },
        { slug: 'philosophy-versus-rhetoric', label: 'Philosophy versus rhetoric' },
        { slug: 'the-social-contract', label: 'The social contract' },
      ],
    },
    {
      n: 3,
      title: 'The Laws of Athens Speak',
      tourTitle: 'The Laws speak',
      hook: 'Socrates gives the city a voice. The Laws walk into the cell and ask: in seventy years, have we ever wronged you?',
      tour: `Socrates stages the argument's last move: he imagines the Laws of Athens stepping into the cell and addressing him directly. They ask what complaint he has against them. They remind him they brought him into the world, raised him, educated him. They gave every Athenian the right to leave at any time — he never left. His seventy-year residency was tacit consent. To escape now is to act as a slave who runs away rather than persuading his master, to confirm his enemies' verdict, to arrive in Thessaly as a figure of ridicule. The Laws close with a choice: die here as a citizen, or live elsewhere as a man who broke faith with the city that made him. Crito, at the end, has nothing to say. Socrates says: then leave me to follow the will of God.`,
      blurb: `Socrates personifies the Laws of Athens and lets them speak directly: they raised him, educated him, and allowed him to stay or leave freely for seventy years. His residency was consent. Escape would make him an enemy of every well-governed city. Crito says nothing. Socrates ends with his final line.`,
      summary: [
        `Socrates does something unexpected. Instead of continuing to argue in the abstract, he stages a dialogue within the dialogue. He imagines himself slipping out of the prison — call it whatever you like — and the Laws of Athens appearing before him. "Tell us, Socrates, what are you doing? By this action, aren't you trying to overturn us, the Laws, and the whole state, as far as you can?" He puts the argument in their mouths rather than his own. An abstract principle can be reasoned with. A speaker looks you in the eye. By giving the Laws a voice, Socrates forces Crito to hear the argument as if it were a charge from a person, not a theorem.`,
        `The Laws make two distinct arguments. First, the parental argument: they brought Socrates into existence through the institutions governing marriage, raised him, educated him, gave him the conditions under which philosophy was possible. Against that debt, a citizen's grievance — even a genuine one — does not justify striking back. A son does not hit his father even when the father is wrong. Obedience or persuasion: those are the only legitimate responses. Second, the contract argument: Socrates was free to leave Athens at any point in seventy years. He admires Sparta and Crete — he could have gone there. He never went. He stayed, married, fathered children, built his life in the agora. Staying was consent. At his own trial he could have proposed exile instead of death; he declined, as if he preferred death. To run now, only because the verdict has gone against him, is to confess that the agreement was always conditional — and only a slave runs from his master rather than persuading him.`,
        `The Laws close by tracing out what flight would mean in practice. In nearby cities — Thebes, Megara — Socrates will arrive as an enemy of the law. In Thessaly, where disorder prevails, he will be welcomed as an entertainer, invited to tell the story of his prison-break in comic detail, and reduced to flattering every host for his next meal. His children will not be better off abroad — his friends can care for them here, whether he is alive in Thessaly or dead in the ground below. The Laws end with the starkest version of the choice: die here, innocent, wronged by men but not by the Laws; or go, having broken faith with the city that made you, and be received below as an enemy by the Laws of the underworld too. The voice, Socrates tells Crito, is humming in his ears like the flute in the ears of a mystic — stopping him from hearing anything else. He asks if Crito has anything left to say. Crito says: I have nothing to say, Socrates. And Socrates says: then leave me to follow the will of God, and to go wherever he leads.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'crito', name: 'Crito' }, { id: 'the-laws', name: 'The Laws of Athens' }],
      themes: [
        { slug: 'the-city-as-parent', label: 'The city as parent' },
        { slug: 'the-social-contract', label: 'The social contract' },
        { slug: 'the-laws-personified', label: 'The Laws as personified speakers' },
      ],
    },
  ],
};
