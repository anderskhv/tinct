// Phaedo — SEO page data for build-seo-pages.cjs
// Plato, 9 sections. Socrates's last day: the four arguments for immortality, the hemlock.
// Voice: literary, declarative present. Match Republic/Apology register.

module.exports = {
  id: 'phaedo',
  title: 'Phaedo',
  author: 'Plato',
  byline: 'c. 360 BC · Socratic dialogue on the immortality of the soul',
  titleAccent: 'a guided tour',
  hook: 'Socrates spends his last day in prison arguing that death is not a misfortune. The hemlock waits in the next room. His friends have come early and will not leave.',
  genre: ['Philosophy', 'Ancient Greek', 'Dialogue'],
  themesBlurb: 'The soul, immortality, the Forms, philosophy as preparation for death, friendship.',
  castBlurb: 'The cell at sundown',
  castDesc: 'The friends who were there on the last day.',
  castSubtitle: 'The cell at sundown — the people who were there.',
  chapterLabel: n => 'Section ' + n,

  about: [
    `<em>Phaedo</em> is the third panel of Plato's death sequence — <em>Apology</em> gave the trial, <em>Crito</em> the refusal to escape, and <em>Phaedo</em> the day itself. The frame is a retelling: Phaedo of Elis, who was in the cell, reports the conversation to Echecrates of Phlius sometime afterward. We hear the story because someone who was there survived to tell it, and we hear it whole because the conversation ran from morning to sundown.`,
    `The dialogue moves through four arguments for the soul's immortality — from opposites, from recollection, from affinity with the Forms, and from the Form of Life itself — and lets each argument be pushed and tested. Cebes and Simmias, the two Theban philosophers in the cell, raise the objections you would raise, and Socrates takes them seriously. Between and around the arguments is the texture of a room: a man who was kind, a friend who cannot stop weeping, Crito's unceasing practical worry, and at the end the cup, the walk, and the words about a debt to Asclepius.`,
  ],

  chaptersSubtitle: 'All 9 sections — from the frame conversation to the final words.',
  chaptersLead: `<p><em>Phaedo</em> is structured as a dialogue within a dialogue. Phaedo narrates to Echecrates; within that narration, Socrates argues with Cebes and Simmias. The nine sections move from the opening frame through four distinct philosophical arguments, the objections that nearly collapse them, the final proof from the Form of Life, the myth of the afterlife, and the death itself. Read in order — the arguments build and the room fills with weight as the day goes on.</p>`,

  themesByline: 'Five threads through the dialogue',
  themesLead: `Phaedo is Plato's most emotionally weighted dialogue and also one of his most technically demanding. The grief and the argument run in parallel, each making the other more serious. These are the threads that hold them together.`,

  groups: [
    { label: 'The frame', subtitle: 'Phaedo sets the scene for Echecrates.', chapters: [1] },
    { label: 'The arguments', subtitle: 'Four arguments for immortality, tested by objection.', chapters: [2, 3, 4, 5] },
    { label: 'The crisis and the resolution', subtitle: 'The objections land. Socrates answers.', chapters: [6, 7] },
    { label: 'The last hours', subtitle: 'The myth, the bath, the cup, the final words.', chapters: [8, 9] },
  ],

  themes: [
    {
      slug: 'preparation',
      title: 'Philosophy as preparation for death',
      greek: '"the true philosopher has one desire in life — to die and be dead"',
      preview: `The opening claim is the one that will scandalize a modern reader and that Socrates means literally. The true philosopher has been practicing dying all along. Philosophy is the rehearsal; death is the performance.`,
      essay: [
        `The opening claim is the one that will scandalize a modern reader and that Socrates means literally. The true philosopher, he tells Cebes, has been practicing dying all along. Practicing how? By turning away from the body — from its appetites, its noise, its way of demanding attention — and toward what the mind alone can grasp. The philosopher who has spent a life trying to think clearly has spent a life loosening the soul from the body's grip. Death finishes a process that philosophy began. To fear death, then, is to confess that the practice never took.`,
        `This is not bravado and not consolation. It is offered as an argument, with a definition behind it: death just is the separation of soul from body. If that is what death is, and if philosophy has been pursuing exactly that separation, then a philosopher who panics at death has misunderstood what he was doing the whole time. Simmias laughs at this — gently, in a way Socrates lets him — and the rest of the dialogue is the unfolding of why Socrates is not joking and not posturing.`,
        `The argument has a sharp edge. It refuses the modern instinct that says philosophy is one activity among others, useful at the desk and beside the point at the bedside. Socrates collapses that distinction. The questions you ask in the agora and the questions you face when the cup arrives are the same questions. If your philosophy cannot meet death, it was never serious enough to count as philosophy. If it can, then the day of execution is not an interruption of the philosophical life but its culmination — the examination on which everything else was practice. By the time Socrates reaches for the cup at sundown, the framing has done its work: we are watching not a man dying but a man finishing a thought.`,
      ],
      where: [
        { n: 2, label: 'Section 2 (the definition of death)' },
        { n: 3, label: 'Section 3 (the cycle of opposites)' },
        { n: 9, label: 'Section 9 (the cup)' },
      ],
    },
    {
      slug: 'four-arguments',
      title: 'The four arguments for immortality',
      greek: 'cycles, recollection, affinity, the Form of Life',
      preview: `Plato gives Socrates four arguments and lets each one be tested. From opposites. From recollection. From affinity with what does not change. From the Form of Life itself. The arguments are real — Cebes and Simmias raise the objections you would raise.`,
      essay: [
        `Plato gives Socrates four arguments and lets each one be tested. The first is from opposites. Everything that has an opposite comes from its opposite — the hot from the cold, the larger from the smaller, the awake from the asleep. Living and dead are such a pair. So the living must come from the dead as the dead come from the living, and the cycle requires both terminals to be real. If souls only died and were never reborn, the universe would have run down into pure death long ago.`,
        `The second is from recollection. We recognize equality, but no two physical sticks are ever exactly equal. We grasp beauty, but no particular beautiful thing exhausts what beauty is. To recognize the imperfect copy as a copy, we must already know the original — and since we never met the original in this life, we must have known it before. Learning is remembering. The soul existed before the body.`,
        `The third is from affinity. There are two kinds of things: the visible, composite, changing, mortal; and the invisible, simple, unchanging, eternal. The body belongs to the first. The soul, which can grasp the second and is most itself when it does, belongs there too. Like keeps to like. Then Cebes and Simmias break in with objections that nearly collapse the structure. Socrates answers both, and from the answers builds the fourth argument: from the Form of Life itself. The soul is what brings life. What brings a property cannot admit the opposite of that property. Snow cannot admit heat — it melts first. The soul, which brings life, cannot admit death. It withdraws.`,
      ],
      where: [
        { n: 3, label: 'Section 3 (from opposites)' },
        { n: 4, label: 'Section 4 (from recollection)' },
        { n: 5, label: 'Section 5 (from affinity)' },
        { n: 7, label: 'Section 7 (from the Form of Life)' },
      ],
    },
    {
      slug: 'forms',
      title: 'The Forms — what the soul belongs to',
      greek: 'Equality itself, Beauty itself, the unchanging originals',
      preview: `The theory of Forms underlies every argument in the dialogue. There is Equality itself, and there are equal sticks. The Form is one, eternal, unchanging; the particulars are many, transient, given to the senses. The soul is the part of us that can reach the originals.`,
      essay: [
        `The metaphysical scaffolding behind every argument in this dialogue is the theory of Forms, and Phaedo is where Plato states it most plainly. There is Equality itself, and there are equal sticks. There is Beauty itself, and there are beautiful faces. The Form is one, eternal, unchanging, graspable only by thought. The particulars are many, transient, changing, given to the senses. The relation between them is participation — the equal sticks have whatever equality they have by partaking of Equality, the beautiful face by partaking of Beauty.`,
        `The move that matters for the immortality arguments is this: the soul is the part of us that has access to the Forms. The eye sees colored shapes; the soul sees Equality. The ear hears sounds; the soul hears justice. The body can only handle the copies. The soul can reach the originals. So when Socrates argues that the soul resembles what is unchanging, he is not making a metaphor — he is pointing at the kind of object the soul is fitted for.`,
        `This is also why the philosopher's life looks the way it does. If reality is divided between Forms and copies, and if the soul is the organ for Forms, then a life spent satisfying the body is a life spent on copies. A life spent in dialectic — in trying to reach what is — is a life spent on what is real. The philosopher's preference for thought over appetite is not asceticism for its own sake. It is taking seriously where reality lives. Phaedo gives the theory in its purest deathbed form. There are originals. There are copies. The soul belongs with the originals. And so, when the body falls away, the soul goes home.`,
      ],
      where: [
        { n: 4, label: 'Section 4 (recollection introduces the Forms)' },
        { n: 5, label: 'Section 5 (affinity argument)' },
        { n: 7, label: 'Section 7 (Form of Life)' },
      ],
    },
    {
      slug: 'objections',
      title: 'The objections — and the crisis they cause',
      greek: '"What argument can I ever trust again?"',
      preview: `Simmias and Cebes raise the two strongest objections in the dialogue. The harmony objection and the worn-cloak objection. For a moment, the company despairs. Echecrates, hearing the story later, says he felt the same.`,
      essay: [
        `Halfway through the dialogue, Simmias and Cebes intervene with objections so strong they throw the room into crisis. Phaedo will later describe the feeling to Echecrates: they had been firmly convinced, and now that conviction seemed to dissolve, not only undermining the previous argument but making any future argument doubtful. Echecrates, hearing this, says he felt the same: "What argument can I ever trust again?"`,
        `Simmias proposes the harmony objection. The soul might be to the body what a tune is to a lyre — an attunement of the parts that vanishes when the instrument is destroyed. The analogy is exact and damaging. If the soul is a harmony, it has no independent existence and the immortality arguments collapse. Cebes proposes the worn-cloak objection: that the soul might outlast many bodies the way a weaver outlasts many cloaks, wearing each out in turn, and still die at the last. This concedes the soul's longevity while denying its immortality — the more dangerous move.`,
        `What makes this section extraordinary is how Plato handles it. Socrates does not dismiss the objections or talk around them. He registers that they are serious, rallies the room ("we must not become misologists"), and then dismantles each carefully. The harmony objection fails because souls differ in virtue and vice while harmonies cannot differ in degree. The worn-cloak objection is what forces the fourth and final argument — from the Form of Life — which would not exist without Cebes having pushed hard enough to require it.`,
      ],
      where: [
        { n: 6, label: 'Section 6 (the objections)' },
        { n: 7, label: 'Section 7 (Socrates answers)' },
      ],
    },
    {
      slug: 'death-scene',
      title: 'The death itself',
      greek: '"Crito, I owe a rooster to Asclepius. Will you remember to pay the debt?"',
      preview: `The final pages are written with a restraint that has not been improved on in two and a half thousand years. Socrates bathes, sends the women home, drinks the cup without distaste, walks until his legs grow heavy. His last words are about a debt.`,
      essay: [
        `The final pages are written with a restraint that has not been improved on in two and a half thousand years. Socrates bathes himself so the women won't have to wash his body — a small consideration, recorded without comment. He sees his children and the women of his household, gives them his instructions, sends them home. The servant of the Eleven, who has been kind to him during the imprisonment, weeps as he announces that the time has come and turns away. Socrates praises the man: "How charming he is — the whole time I've been here, he's visited me often and talked with me. And now look how generously he grieves for me."`,
        `The cup is brought. Socrates asks if there is enough to pour a libation. The attendant says there is only what is needed. Socrates accepts this, raises the cup to his lips, and drinks the poison with perfect calm. Until that moment, most of the room had held themselves together. When they saw him drinking, they could not. Apollodorus, who had been weeping all day, now burst into loud, passionate sobs. Crito got up, unable to watch. Socrates rebuked them mildly: "I sent the women away precisely to prevent this kind of thing. Be quiet, and have patience."`,
        `He walked about until his legs grew heavy, then lay down. The man who had given him the poison checked his feet and legs. The numbness climbed. When it had nearly reached his heart, Socrates uncovered his face and spoke his last words: "Crito, I owe a rooster to Asclepius. Will you remember to pay the debt?" "It shall be paid," said Crito. "Is there anything else?" There was no answer. The attendants uncovered him. His eyes were fixed. Crito closed his eyes and mouth. Phaedo, telling the story afterward to Echecrates, calls him the wisest, the most just, and the best man of his time.`,
      ],
      where: [
        { n: 8, label: 'Section 8 (the myth and the farewell)' },
        { n: 9, label: 'Section 9 (the death)' },
      ],
    },
  ],

  castLead: `<p>Phaedo is unusual among Plato's dialogues for the density of human texture around the argument. We are told who is in the room. Six named figures, each registering what is happening in a different key. Together they make the room dense with feeling — and Socrates moves through that density without being swept by it.</p>`,

  castGroups: [
    {
      label: 'The narrators',
      characters: [
        {
          id: 'phaedo',
          tag: 'Narrator',
          name: 'Phaedo',
          epithet: 'Phaedo of Elis — the one who was there',
          body: `The narrator. Phaedo of Elis was in the cell that day, and the dialogue is structured as his retelling, sometime later, to Echecrates of Phlius — who has heard rumors and wants the full account. This frame matters: we are not watching Socrates die, we are listening to a friend who watched describe what it was like. Phaedo confesses a strange thing to Echecrates — that in the cell he felt pity and pleasure mixed in a way he had never felt before, the unfamiliar compound of grief and the strange happiness of being near a man who was unafraid.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
        {
          id: 'echecrates',
          tag: 'Frame',
          name: 'Echecrates',
          epithet: 'Echecrates of Phlius — the one who listens',
          body: `The man to whom Phaedo tells the story. A philosopher from Phlius who had heard vague reports of Socrates's death but never got a clear account — no one from Athens had passed through. He interrupts twice: once to ask Phaedo to continue more exactly, and once — at the moment when Cebes and Simmias's objections land — to say that he felt the crisis himself, even at this remove. His reaction confirms what Phaedo already said: the arguments did their work on everyone who heard them, then and since.`,
          appears: [1, 6, 7],
        },
      ],
    },
    {
      label: 'The interlocutors',
      characters: [
        {
          id: 'socrates',
          tag: 'Teacher',
          name: 'Socrates',
          epithet: 'Socrates — on his last day',
          body: `On his last day. Calm in a way that makes the friends around him uneasy and that he insists, throughout, is not a pose. He runs four arguments without hurry, takes the objections seriously, teases the weeping Apollodorus, and praises the executioner for the way the man weeps as he brings the cup. Drinks the hemlock without distaste, walks until his legs are heavy, lies down. His last words are about a debt to Asclepius — the healing god — which has been read every way it can be read for two and a half thousand years.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
        {
          id: 'cebes',
          tag: 'Philosopher',
          name: 'Cebes',
          epithet: 'Cebes of Thebes — the harder interlocutor',
          body: `Theban, philosophical, the sharper of the two visiting interlocutors. He raises the worn-cloak objection — that the soul might outlast many bodies the way a weaver outlasts many cloaks, wearing each out in turn, and still die at the last cloak. The objection is the most serious one in the dialogue, because it concedes the soul's longevity while denying its immortality. Socrates's response — that the soul partakes of the Form of Life itself and so cannot admit death — is the dialogue's culminating argument and exists because Cebes pushed hard enough to require it.`,
          appears: [2, 3, 4, 5, 6, 7, 8],
        },
        {
          id: 'simmias',
          tag: 'Philosopher',
          name: 'Simmias',
          epithet: 'Simmias of Thebes — the harmony objection',
          body: `The other Theban, also a former student of the Pythagorean Philolaus, also a serious philosopher. He raises the harmony objection — that the soul might be to the body what a tune is to a lyre, an attunement of the parts that vanishes when the instrument is destroyed. The analogy is exact and damaging. Socrates dismantles it carefully — souls can be virtuous or vicious in degrees, harmonies cannot — and the dialogue moves on, but the seriousness of Simmias's challenge is what makes the dismantling matter.`,
          appears: [2, 3, 4, 5, 6, 7, 8],
        },
      ],
    },
    {
      label: 'The others in the room',
      characters: [
        {
          id: 'crito',
          tag: 'Friend',
          name: 'Crito',
          epithet: 'Crito — the friend who handles the logistics',
          body: `The same Crito who tried to organize the prison escape in the dialogue that bears his name. Here he is older, quieter, doing the practical work of the day. He relays the executioner's request that Socrates not exhaust himself with talk. He receives the final instruction about the cock owed to Asclepius. He closes Socrates's eyes and mouth at the end. Crito throughout the death sequence is the friend whose love expresses itself in unceasing concern about details — and Socrates lets him do it without ever quite agreeing to be looked after.`,
          appears: [8, 9],
        },
        {
          id: 'apollodorus',
          tag: 'Friend',
          name: 'Apollodorus',
          epithet: 'Apollodorus — the one who cannot stop weeping',
          body: `The friend who cannot stop weeping. Already in tears when the day begins, sobbing openly through the arguments, howling when Socrates drinks the cup — to the point that Socrates has to rebuke him, gently, and remind everyone that this is exactly why he sent the women home. Apollodorus carries the dialogue's grief without filter. He is also the narrator of the Symposium — the same overflowing devotion appears in both. In Phaedo he is the friend whose love refuses to be philosophical about it, and the room is larger for him being there.`,
          appears: [1, 9],
        },
      ],
    },
  ],

  cast: [
    {
      name: 'Socrates',
      body: `On his last day. Calm in a way that makes the friends around him uneasy and that he insists, throughout, is not a pose. He runs the four arguments without hurry, takes the objections seriously, teases the weeping Apollodorus, and praises the executioner for the way the man weeps as he brings the cup. Drinks the hemlock without distaste, walks until his legs are heavy, lies down. His last words are about a debt to Asclepius — the healing god — which has been read every way it can be read for two and a half thousand years.`,
    },
    {
      name: 'Phaedo',
      body: `The narrator. Phaedo of Elis was in the cell that day, and the dialogue is structured as his retelling, sometime later, to Echecrates of Phlius — who has heard rumors and wants the full account. This frame matters: we are not watching Socrates die, we are listening to a friend who watched describe what it was like. Phaedo confesses to Echecrates a strange thing — that in the cell he felt pity and pleasure mixed in a way he had never felt before, the unfamiliar compound of grief and the strange happiness of being near a man who was unafraid.`,
    },
    {
      name: 'Cebes',
      body: `Theban, philosophical, the sharper of the two visiting interlocutors. He raises the worn-cloak objection — that the soul might outlast many bodies the way a weaver outlasts many cloaks, wearing each out in turn, and still die at the last cloak. The objection is the most serious one in the dialogue, because it concedes the soul's longevity while denying its immortality. Socrates's response — that the soul partakes of the Form of Life itself and so cannot admit death — is the dialogue's culminating argument and exists because Cebes pushed hard enough to require it.`,
    },
    {
      name: 'Simmias',
      body: `The other Theban, also a former student of the Pythagorean Philolaus, also a serious philosopher. He raises the harmony objection — that the soul might be to the body what a tune is to a lyre, an attunement of the parts that vanishes when the instrument is destroyed. The analogy is exact and damaging, because if the soul is a harmony then it has no independent existence and the immortality arguments collapse. Socrates dismantles it carefully — souls can be virtuous or vicious in degrees, harmonies cannot — and the dialogue moves on, but the seriousness of Simmias's challenge is what makes the dismantling matter.`,
    },
    {
      name: 'Crito',
      body: `The same Crito who tried to organize the prison escape in the dialogue that bears his name. Here he is older, quieter, doing the practical work of the day. He relays the executioner's request that Socrates not exhaust himself with talk. He receives the final instruction about the cock owed to Asclepius. He closes Socrates's eyes and mouth at the end. Crito throughout the death sequence is the friend who handles the body and the logistics — the one whose love expresses itself in unceasing concern about details — and Socrates lets him do it without ever quite agreeing to be looked after.`,
    },
    {
      name: 'Apollodorus',
      body: `The friend who cannot stop weeping. Already in tears when the day begins, sobbing openly through the arguments, howling when Socrates drinks the cup — to the point that Socrates has to rebuke him, gently, and remind everyone that this is exactly why he sent the women home. Apollodorus carries the dialogue's grief without filter. He is also the one who, in the Symposium, narrates that earlier evening to a friend, with the same overflowing devotion. In Phaedo he is the friend whose love refuses to be philosophical about it — and the room, and the dialogue, are larger for him being there.`,
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'The Last Day',
      tourTitle: 'The frame — Phaedo sets the scene',
      hook: "Echecrates has heard vague rumors of Socrates's death. He asks Phaedo, who was there, for the full account. Phaedo begins.",
      tour: `Phaedo of Elis meets Echecrates of Phlius. Echecrates has heard that Socrates died by poison, but knows nothing more — no Athenian traveler has passed through Phlius, and the trial reports that reached them were incomplete. He wants the whole account. Phaedo agrees, and says that being reminded of Socrates — whether he is speaking about him or someone else is — is always a pleasure. He explains the delay between the trial and the death: the sacred ship to Delos had been crowned the day before the trial, and during its voyage the city was not allowed to carry out executions. So Socrates lay in prison for weeks more. Phaedo describes the friends who were there — Apollodorus already weeping, Cebes and Simmias up from Thebes, Crito — and says that being near Socrates that day produced a feeling he had never felt before: pity and pleasure mixed, an unfamiliar compound.`,
      blurb: `Echecrates asks Phaedo for the full account of Socrates's last day. Phaedo agrees and describes the sacred ship delay, names the friends in the cell, and confesses the strange compound of pity and pleasure he felt being there.`,
      summary: [
        `Phaedo of Elis meets Echecrates of Phlius. Echecrates has heard rumors — that Socrates died by poison, that his friends were there, that much was said — but no full account has reached Phlius. No Athenian traveler has passed through. He asks Phaedo, who was there, to tell him everything as exactly as he can remember. Phaedo says he has nothing else to do, and will try to satisfy him. Being reminded of Socrates, he says, is always the greatest pleasure — whether he is the one speaking about him or someone else is.`,
        `He begins with the delay. Echecrates had also wondered why, after being condemned, Socrates was not put to death at once. Phaedo explains: the sacred ship to Delos had been garlanded the day before the trial. During the ship's voyage — the annual pilgrimage Theseus had established — Athens was not allowed to be polluted by public execution. The voyage stretched out with contrary winds. So Socrates lay in prison for the weeks it took the ship to go to Delos and return.`,
        `Phaedo names the friends who were in the cell: Apollodorus, already weeping; Cebes and Simmias, who had come up from Thebes; Crito with his watchful, practical presence; and others. He describes the feeling he had that day — strange to name, because grief and pleasure do not usually share the same space. Being near Socrates, who was unafraid, produced a compound he had never felt before. The story begins.`,
      ],
      appears: [{ id: 'phaedo', name: 'Phaedo' }, { id: 'echecrates', name: 'Echecrates' }, { id: 'apollodorus', name: 'Apollodorus' }],
      themes: [{ slug: 'death-scene', label: 'The death itself' }],
    },
    {
      n: 2,
      title: 'The Philosopher and Death',
      tourTitle: 'Why the philosopher should not fear death',
      hook: 'Socrates makes his opening claim: the true philosopher has been practicing dying all along. The friends are not sure whether to laugh.',
      tour: `Socrates has just dismissed his wife Xanthippe, who was weeping too loudly for the kind of conversation he wants to have. He turns to Cebes and Simmias and makes the claim that will anchor the entire dialogue: the true philosopher not only does not fear death but positively desires it. The men around him are skeptical — they have heard that the philosopher desires death, but it has always seemed an odd thing to say of a wise man. Socrates explains: death is the separation of soul from body. Philosophy is the practice of exactly that separation — turning away from the body and its appetites toward what the mind alone can grasp. The philosopher who has spent a life seeking truth through the mind has spent a life loosening the soul from the body. Death finishes what philosophy began. To fear it is a contradiction in terms.`,
      blurb: `Socrates makes his opening claim: the true philosopher has been practicing dying all along. Death is the separation of soul from body; philosophy is the attempt to achieve that separation while alive. A philosopher who fears death has misunderstood his own practice.`,
      summary: [
        `Socrates has sent Xanthippe away — she was weeping too loudly, and he has a different kind of day in mind. He settles with Cebes and Simmias and makes the claim that will anchor everything that follows. The true philosopher, he says, not only does not fear death but actively desires it. The others are uncertain whether to take this seriously. Surely those who think wisdom best must also think life best?`,
        `Socrates defines his terms. Death is the separation of soul from body. The body, he argues, is an obstacle to knowledge — it fills the soul with desires, passions, and confusions; it is always demanding attention; it clouds the mind precisely when the mind needs clarity. The soul is most itself when it withdraws from the body and thinks by itself, without sensory interference. Philosophy is the practice of this withdrawal — turning away from the body's pleasures and pains and toward what the soul alone can grasp.`,
        `If that is what philosophy is, then the philosopher has been rehearsing for death his whole life. Death — the final separation — is the completion of the practice. To fear it would be absurd. It would be as if someone who had spent years preparing for a journey refused to leave when the ship arrived. Simmias laughs at this, and Socrates allows it — but says the laugh is earned only if the argument is wrong, and the rest of the dialogue is devoted to showing it is not.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'cebes', name: 'Cebes' }, { id: 'simmias', name: 'Simmias' }],
      themes: [{ slug: 'preparation', label: 'Philosophy as preparation for death' }, { slug: 'forms', label: 'The Forms' }],
    },
    {
      n: 3,
      title: 'The Argument from Opposites',
      tourTitle: 'The first argument — from the cycle of opposites',
      hook: 'The first argument. Everything that has an opposite comes from its opposite. If the dead come from the living, the living must come from the dead.',
      tour: `Socrates turns to the first argument: the cycle of opposites. In nature, everything that has an opposite is generated from its opposite — the larger from the smaller, the stronger from the weaker, the awake from the asleep. Life and death are such a pair. If the dead come from the living, then the living must come from the dead. The process must be circular, or else everything would eventually run down to one pole. Souls must persist between lives for the living to be born from the dead at all. Cebes confirms that this follows. Socrates adds the argument from recollection as a second line of support — knowledge as memory of a time before birth — which Cebes says he learned from Socrates before.`,
      blurb: `The argument from opposites. Living and dead are a pair, like the larger and smaller, the awake and asleep. Each is generated from its opposite — so the living must come from the dead, and souls must exist in between. Cebes confirms this follows.`,
      summary: [
        `Socrates proposes the first argument for the soul's immortality: from the cycle of opposites. In nature, all things with opposites are generated from those opposites. The larger comes from the smaller; the stronger from the weaker; the beautiful from the ugly; the awake from the asleep. The law is universal. Life and death are such a pair.`,
        `If this law holds, then just as the dead come from the living, the living must come from the dead. The process must be circular — a genuine back-and-forth — or else everything would eventually drain to one pole. If everything died and nothing were reborn, the universe would long since have become a single pool of death. Souls must persist after death, in some form, so that the living can be born from them.`,
        `Cebes confirms that this follows, and adds that Socrates has always taught them a related doctrine: that learning is recollection. We recognize equality, beauty, justice — abstract things we have never encountered in their pure form in this life — which suggests we knew them before birth and are now remembering. Both arguments point the same way: the soul existed before the body. If it existed before, the case for its surviving after becomes easier to make. Socrates says they should consider both arguments together.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'cebes', name: 'Cebes' }, { id: 'simmias', name: 'Simmias' }],
      themes: [{ slug: 'four-arguments', label: 'The four arguments' }],
    },
    {
      n: 4,
      title: 'The Argument from Recollection',
      tourTitle: 'The second argument — from recollection',
      hook: 'We recognize equality and beauty without having seen them in pure form. We must have known them before birth. Learning is remembering.',
      tour: `Simmias wants the argument from recollection laid out more fully — he has heard it before but wants to hear it again. Socrates obliges. We recognize equality, but no two physical objects are ever truly equal. We grasp beauty, but no particular beautiful thing exhausts what beauty is. To recognize the imperfect instance as an imperfect instance of the Form, we must already know the Form. Since we did not acquire this knowledge in this life — we were born already capable of recognizing Equality when we encountered equal sticks — we must have had it before birth. The soul existed before it entered the body. And if the soul existed before, it is reasonable to think it will continue after.`,
      blurb: `The argument from recollection. We recognize Equality itself though we have never seen it in pure form — only in imperfect instances. We must have known it before birth. Learning is the recovery of knowledge the soul already had.`,
      summary: [
        `Simmias asks to have the argument from recollection laid out explicitly — Cebes mentioned it, but he wants to hear it from Socrates directly. Socrates agrees. The argument begins with a question: is there such a thing as Equality itself, distinct from any two equal objects we might point to? Yes, they all agree. And do the equal objects perfectly embody that equality? No — the same two sticks appear equal from one angle and unequal from another.`,
        `Yet when we see the sticks, we recognize them as approximations of Equality itself. We compare them to the standard and see that they fall short. But to compare them to the standard, we must already know the standard. Since we never encountered Equality in pure form in this life — only these imperfect instances — we must have known it before we were born. The same holds for all the Forms: Beauty, Goodness, Justice. We recognize their imperfect instances because we knew their originals.`,
        `Learning, then, is not the acquisition of new knowledge but the recovery of old knowledge — recollection. We are reminded by the particulars of what the soul already knew before it entered the body. The conclusion follows: the soul must have existed before birth. If it existed before, the argument that it will also exist after becomes less strange. Cebes and Simmias are persuaded by this — but they note it only proves pre-existence, not post-existence. Socrates says: combined with the argument from opposites, both are needed.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'cebes', name: 'Cebes' }, { id: 'simmias', name: 'Simmias' }],
      themes: [{ slug: 'four-arguments', label: 'The four arguments' }, { slug: 'forms', label: 'The Forms' }],
    },
    {
      n: 5,
      title: 'The Affinity Argument',
      tourTitle: 'The third argument — from affinity with the Forms',
      hook: 'The soul resembles what is invisible, unchanging, eternal. Like keeps to like. The body belongs to one world; the soul belongs to another.',
      tour: `The third argument runs through the longest section of the dialogue. Socrates asks Cebes and Simmias to consider two kinds of things: the visible, composite, changing, mortal; and the invisible, simple, unchanging, eternal. The Forms belong to the second kind. The body belongs to the first. The soul, by contrast, is most itself when it thinks — when it is engaged with the eternal, not the perishable. The soul therefore resembles the eternal and belongs with it. When the body dies, the soul, if it has not been infected by the body's way of valuing things, withdraws to its own realm. He then describes what becomes of different kinds of souls after death — the philosophical soul goes to its proper home; the unphilosophical soul wanders, weighted by attachments to the body it could not leave behind.`,
      blurb: `The affinity argument. There are two kinds of things — visible/changing and invisible/unchanging. The body belongs to the first. The soul, which grasps the eternal, belongs to the second. Like keeps to like. At death the soul goes where it belongs.`,
      summary: [
        `Socrates asks Cebes and Simmias to consider two kinds of reality. The first kind is visible, composite, changing, mortal — the things we perceive with our senses. The second kind is invisible, simple, unchanging, eternal — the Forms, which only thought can grasp. These are not the same kind of thing. They belong to different orders of being.`,
        `Now: which order does the body belong to? The visible, clearly — it is perceived by the senses, it is composite, it changes, it decays. And which order does the soul belong to? The soul, Socrates says, is most itself when it thinks — when it withdraws from the senses and engages with what is eternal. In that mode it resembles the eternal. Like keeps to like. The soul has more in common with the Forms than with the body, and so it belongs — in some deep sense — with the Forms.`,
        `When the body dies, the soul's fate depends on what it has been doing in life. The philosophical soul — the one that has spent its time thinking clearly, detaching from the body's demands — withdraws cleanly to the invisible realm. The unphilosophical soul, heavy with bodily attachments, wanders near the visible world it cannot quite leave. Socrates describes these fates in some detail, including the fate of the soul that loved its body so much that it haunts the graves of the living. The account is a myth, he says — but the general direction is what the argument establishes.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'cebes', name: 'Cebes' }, { id: 'simmias', name: 'Simmias' }],
      themes: [{ slug: 'four-arguments', label: 'The four arguments' }, { slug: 'forms', label: 'The Forms' }, { slug: 'preparation', label: 'Philosophy as preparation' }],
    },
    {
      n: 6,
      title: 'The Objections',
      tourTitle: 'The crisis — Simmias and Cebes push back',
      hook: 'The two Thebans raise objections serious enough to throw the whole company into despair. The harmony. The worn cloak.',
      tour: `Simmias and Cebes intervene with two objections that land hard. Simmias proposes the harmony objection: the soul might be to the body what a tune is to a lyre — a harmony of the body's physical elements, destroyed when those elements are disrupted. The analogy is damaging because it would mean the soul has no existence independent of the body that produces it. Cebes proposes the worn-cloak objection: even if the soul is stronger than the body and outlasts it through many lives, it might still wear out at the last and perish. Neither objection denies the soul's longevity; both deny its immortality. Phaedo describes the crisis that follows: the company had been convinced, and now they were unsure what argument they could trust.`,
      blurb: `Simmias raises the harmony objection — the soul might be a mere tuning of the body's elements. Cebes raises the worn-cloak objection — even a longer-lasting thing must eventually perish. Together they throw the whole company into doubt.`,
      summary: [
        `Simmias speaks first. He has been holding back an objection, and he wants to raise it before the day is over. His objection is this: someone could use the same style of argument to defend the soul's destruction. Suppose the soul is to the body what a harmony is to a lyre — an attunement of its physical elements, invisible and beautiful and divine-seeming, but utterly dependent on the instrument that produces it. When the lyre is broken, the harmony does not survive. If the soul is a harmony, neither does it.`,
        `Cebes then adds his own objection. He is willing to grant everything Socrates has argued: that the soul is stronger than the body, that it can outlast many bodies the way a weaver outlasts many cloaks, wearing each out in turn. But the weaver still dies at the end. Being more durable than the body does not make the soul immortal — it makes it longer-lasting, which is a very different thing. A soul that has survived a hundred deaths might die on the hundred-and-first.`,
        `The room falls into what Phaedo calls an unpleasant feeling. They had been convinced. Now they are not sure whether they were ever capable of forming a reliable judgment, or whether any argument could hold. Echecrates, hearing this account later, says he felt the same: "What argument can I ever trust again?" Phaedo reassures him — Socrates, watching the room, knew exactly what had happened, and rallied them like a general who gathers a routed army and returns to the field.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'cebes', name: 'Cebes' }, { id: 'simmias', name: 'Simmias' }, { id: 'phaedo', name: 'Phaedo' }, { id: 'echecrates', name: 'Echecrates' }],
      themes: [{ slug: 'objections', label: 'The objections' }, { slug: 'four-arguments', label: 'The four arguments' }],
    },
    {
      n: 7,
      title: 'The Final Argument',
      tourTitle: 'The fourth argument — from the Form of Life',
      hook: 'Socrates answers both objections and builds the final proof. The soul brings life wherever it goes. What brings life cannot admit its opposite.',
      tour: `Socrates answers Simmias first. The harmony objection fails because harmonies admit of degrees — a lyre can be more or less in tune — but souls cannot be more or less a soul. Every soul is equally a soul. Furthermore, the account of virtue and vice that everyone accepts depends on the soul being able to rule the harmony of the body, not be it. He then turns to the deep argument: there is a difference between opposites and the things that bring opposites. Snow is not cold — it brings cold. Fire is not hot — it brings heat. When the cold approaches fire, fire does not become cold; it retreats or perishes first. Now: the soul brings life wherever it goes. What brings life cannot admit death. It retreats or perishes — but it cannot become dead. The soul is immortal. The mythic account of the afterlife follows.`,
      blurb: `Socrates dismantles the harmony objection and then builds the fourth argument. Things that bring a property cannot admit the opposite — fire retreats before cold. The soul brings life. Therefore the soul cannot admit death. The Form of Life cannot become its opposite.`,
      summary: [
        `Socrates begins with Simmias's harmony objection. He points out a fatal flaw: harmonies admit of degrees. A lyre can be more or less in tune, more or less a harmony. But we already agreed that no soul is more or less a soul than another. Every soul is equally and completely a soul. The harmony analogy therefore breaks down at this point — the analogy's central property doesn't apply to the thing it's supposed to describe. He adds a further problem: the soul commands the body, rules its pleasures and pains, acts against the harmony of the body when virtue requires. A harmony cannot contradict its instrument.`,
        `He then turns to Cebes's objection and builds the final argument. There is a crucial distinction between an opposite and the thing that brings an opposite. Snow is not cold itself — it brings cold. Fire is not heat itself — it brings heat. When the cold approaches snow, the snow does not become cold — it withdraws or perishes. When heat approaches fire, the fire does not become cold — it retreats or is extinguished. Things that bring a property cannot admit the opposite of that property while remaining what they are.`,
        `Now apply this to the soul. The soul is what brings life — wherever the soul is present, life is present. What brings life cannot admit death. When death approaches, the soul must either withdraw or perish. But Socrates argues it cannot perish — that would be to admit its opposite, which the preceding argument has ruled out. The soul is immortal. Cebes and Simmias are convinced. Socrates then tells the myth of the afterlife — the true shape of the earth, the fate of different kinds of souls, the places of punishment and purification — as a likely story, not a certain one. But the direction the argument has established, he says, is where the myth points.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'cebes', name: 'Cebes' }, { id: 'simmias', name: 'Simmias' }],
      themes: [{ slug: 'four-arguments', label: 'The four arguments' }, { slug: 'forms', label: 'The Forms' }, { slug: 'objections', label: 'The objections' }],
    },
    {
      n: 8,
      title: 'The Soul Is Immortal',
      tourTitle: 'The myth and the farewell',
      hook: 'The arguments are complete. Socrates tells the myth of the afterlife, gives his last instructions, and goes to bathe.',
      tour: `The arguments are done. Socrates offers the myth of the earth's true shape — a place far larger and more beautiful than what we see — and the fate of souls after death, in language that is explicitly mythic rather than dialectical. He says a reasonable person shouldn't insist the description is exactly true, but the venture of belief is a noble one. He closes with practical instructions for Cebes and Simmias and the others: take care of yourselves. Then he handles Crito's question about the body: don't say "here we bury Socrates" — you are burying the body only. He gets up to bathe. His children and the women of the household are brought in; he speaks with them and sends them away. He returns to the friends and sits with them in the last of the afternoon.`,
      blurb: `The arguments complete, Socrates tells the myth of the earth's true shape and the fate of souls. He gives his last instructions — take care of yourselves — answers Crito's question about the body, and goes to bathe. His children and the women are brought in and sent away.`,
      summary: [
        `The philosophical arguments are finished. Socrates turns to the myth of the earth's true shape — a vision of a world far larger and more splendid than what we see from within our hollow, like frogs at the bottom of a pond. He describes the fate of different kinds of souls after death: those who lived middling lives go to the Acherusian lake and are purified. Those who committed great wrongs face punishment proportionate to their crimes. Those who lived philosophically go to the most beautiful places of all and live without bodies.`,
        `He is careful about the status of this account. A reasonable person, he says, should not insist that the description is exactly right. But the venture of believing something like it is a noble one, and worth the comfort. He has told the long tale for this reason. Then he gives his instructions to those around him: cast aside the pleasures and ornaments of the body as alien and harmful; seek instead the pleasures of knowledge; adorn the soul with temperance, justice, courage, and truth. He says goodbye to Simmias and Cebes and all the rest — the voice of fate, he says, is already calling him.`,
        `Crito asks if there are any other instructions — for his children, or anything else. Nothing special, says Socrates: just take care of yourselves. That is the greatest service you can render. He then addresses Crito's practical worry about burial: don't say "here we lay out Socrates" or "here we follow him to the grave." Such words are wrong in themselves and infect the soul with error. You are burying the body only. Do with it what is customary and what you think best. He gets up to bathe. The children and the women are brought in; he speaks with them in Crito's presence, gives his instructions, and sends them away. He returns to the friends and they sit together in the quiet of the late afternoon.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'crito', name: 'Crito' }, { id: 'cebes', name: 'Cebes' }, { id: 'simmias', name: 'Simmias' }],
      themes: [{ slug: 'preparation', label: 'Philosophy as preparation for death' }, { slug: 'death-scene', label: 'The death itself' }],
    },
    {
      n: 9,
      title: 'The Death of Socrates',
      tourTitle: 'The cup, the walk, the last words',
      hook: 'The servant of the Eleven arrives. The cup is brought. Socrates drinks it without distaste, walks until his legs are heavy, and speaks his last words.',
      tour: `The prison guard arrives and tells Socrates it is time. He praises the man for the kindness he has shown throughout the imprisonment and weeps as he goes. Socrates tells Crito to bring the cup if it is ready. Crito tries to delay — the sun is still on the hilltops; others wait until the last moment. Socrates refuses. He would not gain anything by drinking the poison a little later; he would only look foolish to himself, clinging to a life already forfeit. The cup is brought. He asks if he may pour a libation; the attendant says there is only enough for the dose. He accepts this, prays that his journey may be fortunate, and drinks the cup steadily and without distaste. The friends, who have held together through the long day, break. Apollodorus howls. Crito cannot watch. Socrates rebukes them mildly. He walks until his legs grow heavy, lies down. The numbness climbs. He uncovers his face and speaks his last words. Crito closes his eyes and mouth.`,
      blurb: `The servant of the Eleven comes in weeping. Socrates praises him and sends for the cup. He drinks without distaste. The friends break. The numbness climbs. He uncovers his face: "Crito, I owe a rooster to Asclepius." Crito closes his eyes and mouth.`,
      summary: [
        `The servant of the Eleven arrives. He tells Socrates it is time, and says — weeping, turning away — that he finds Socrates the noblest, gentlest, and best man who has ever been in this place. Socrates looks at him and says: "I return your good wishes, and I'll do as you ask." Then to the friends: "How charming the man is. The whole time I've been here, he's visited me often. And now look how generously he grieves for me." He tells Crito to bring the cup if the poison is ready. Crito asks him to wait — the sun is still on the hilltops, others take time, there is still the chance to eat and drink and sit with those they love. Socrates declines. He would only look foolish to himself, he says, clinging to a life already forfeit.`,
        `The cup is brought. Socrates asks the attendant if he may pour a libation from it. The man says there is only enough for the single dose. Socrates accepts this without complaint and prays that his journey from this world to the next may be fortunate. He raises the cup to his lips and drinks the poison with perfect calm — without a change of color or expression, looking the man full in the eyes as was his way. Until that moment most of the room had held themselves together. When they saw him drink — saw that he had finished — they could no longer hold back. Apollodorus burst into loud, passionate sobs. Crito had already gotten up, unable to watch. Phaedo covered his face and wept, not for Socrates but for himself, at the thought of losing such a friend.`,
        `Socrates walked about until his legs grew heavy, then lay down as instructed. The attendant pressed his foot hard and asked if he could feel it. No. The man pressed his legs, and so upward, showing them all that the cold was climbing. When it had nearly reached his heart, Socrates uncovered his face — he had drawn the cloth over himself — and spoke his last words: "Crito, I owe a rooster to Asclepius. Will you remember to pay the debt?" "It shall be paid," said Crito. "Is there anything else?" There was no answer. After a moment, a slight movement. The attendants uncovered him. His eyes were fixed. Crito closed his eyes and mouth. Phaedo, ending his account to Echecrates, gives his verdict: of all the men of his time he had known, Socrates was the wisest, the most just, and the best.`,
      ],
      appears: [{ id: 'socrates', name: 'Socrates' }, { id: 'crito', name: 'Crito' }, { id: 'apollodorus', name: 'Apollodorus' }, { id: 'phaedo', name: 'Phaedo' }],
      themes: [{ slug: 'death-scene', label: 'The death itself' }, { slug: 'preparation', label: 'Philosophy as preparation for death' }],
    },
  ],
};
