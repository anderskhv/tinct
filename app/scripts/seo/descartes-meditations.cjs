// SEO content data for René Descartes's Meditations on First Philosophy (1641).
// Non-narrative philosophy. Six meditations + dedication + preface + synopsis.
// Voice: literary, declarative present, careful as the original Latin.

module.exports = {
  id: 'descartes-meditations',
  title: 'Meditations on First Philosophy',
  author: 'René Descartes',
  byline: '1641 · French rationalist philosophy',
  titleAccent: 'a guided tour',
  hook: 'A philosopher in a heated room resolves to doubt everything he has ever believed — and finds, at the bottom of the wreckage, one fact the universe cannot take from him.',
  genre: ['Philosophy', 'Epistemology', 'Early modern thought'],
  themesBlurb: 'Methodic doubt, the cogito, God\'s existence, the nature of mind, truth and error, the mind-body problem.',
  castBlurb: 'A thinking self and its critics',
  castDesc: 'The meditator, the deceiver, and the objectors.',
  castSubtitle: 'A thinking self and its critics — the meditator, the hypothetical deceiver, and the readers who pushed back.',

  chapterLabel: n => n <= 3 ? ['Letter of Dedication', 'Preface to the Reader', 'Synopsis'][n - 1] : 'Meditation ' + (n - 3),

  about: [
    `<em>Meditations on First Philosophy</em> is the founding text of modern philosophy. A French gentleman in a stove-heated room in Holland sits down to demolish, on purpose, every belief he has ever held, to see what — if anything — is left standing. Six meditations later, he has arrived at the existence of the thinking self, two proofs of God, a doctrine of truth and error, and the real distinction between mind and body. Modern philosophy has begun.`,
    `The book takes the form of a six-day imagined retreat. It proceeds like a drama: one long demolition, one astonishing recovery, then a careful reconstruction of knowledge on new foundations. Descartes writes in the first person and invites the reader to perform the doubt rather than read about it — which is why the book has been read, for nearly four centuries, as something closer to a philosophical exercise than a treatise. What it opened — the problem of the external world, the gap between mind and body, the demand for indubitable foundations — is still open today.`,
  ],

  chaptersSubtitle: 'All 9 chapters — from the letter to the Sorbonne through the six meditations.',
  chaptersLead: `<p>The <em>Meditations</em> has three prefatory texts and six meditations. The Letter of Dedication and Preface explain the project's purpose and address early objections. The Synopsis maps the argument before it begins. The six meditations run over six imagined days: doubt (Meditation I), recovery of the self (II), proof of God from the idea of God (III), the source of error (IV), the ontological proof (V), and the existence of bodies and the real distinction of mind and body (VI). Read them in order, slowly, the first time through.</p>`,

  themesByline: 'Five threads through the meditations',
  themesLead: `The <em>Meditations</em> is not primarily a book of conclusions but of method. What Descartes is modeling, all the way through, is how to think when you can trust nothing — and what you are left with when you have thought correctly.`,

  groups: [
    { label: 'Prefatory texts', subtitle: 'The dedication, the preface, and the roadmap.', chapters: [1, 2, 3] },
    { label: 'The demolition and recovery', subtitle: 'Doubt everything; find the one thing that survives.', chapters: [4, 5] },
    { label: 'God and the criterion of truth', subtitle: 'Two proofs of God; the rule of clear and distinct perception.', chapters: [6, 7, 8] },
    { label: 'The return to the world', subtitle: 'Bodies exist; mind and body are distinct; the union is real.', chapters: [9] },
  ],

  themes: [
    {
      slug: 'methodic-doubt',
      title: 'Methodic Doubt',
      greek: 'demolish everything; see what remains',
      preview: 'The First Meditation does something no major philosopher had done in quite this way: it adopts, deliberately and as a method, the position of total skepticism — not to live as a skeptic, but to find whatever cannot be doubted at all.',
      essay: [
        `Descartes's purpose in the First Meditation is not skepticism for its own sake. He is a practical man who, by his own account, continued to act on probable beliefs throughout the exercise. The doubt is methodic — a filter so stringent that whatever survives it will be unconditionally certain, and from such a foundation a science can be rebuilt that nothing can shake.`,
        `He proceeds in stages of escalating force. The senses sometimes mislead us; beliefs based on the senses cannot be fully trusted. But surely I can trust that I am sitting by the fire in this dressing gown? No — dreams have produced impressions equally vivid, and there is no mark I can use to distinguish dreaming from waking. Mathematics, then? Two and three make five whether I am awake or asleep. But what if a powerful and malicious spirit — a <em>malin génie</em>, an evil deceiver — has so constructed my mind that I am wrong even about the simplest arithmetic?`,
        `At that point the methodic doubt has consumed everything. The First Meditation ends with the confession that nothing, for the purposes of the method, can be known. The move is unprecedented in its radicalism: Descartes does not stop at sensory skepticism but pushes through to the deepest possible level. The evil deceiver hypothesis is the limit case. If anything survives it, it will be the foundation he is looking for.`,
        `What makes the strategy different from ordinary philosophical doubt is precisely that it is a strategy. Descartes is not confused about whether the external world exists. He is running an argument: assume the worst case; derive the best possible foundation; build from there. The First Meditation is the most controlled demolition in the history of philosophy.`,
      ],
      where: [
        { n: 3, label: 'Synopsis (the demolition described)' },
        { n: 4, label: 'Meditation I (the demolition itself)' },
        { n: 5, label: 'Meditation II (what survives the demolition)' },
      ],
    },
    {
      slug: 'cogito',
      title: 'Cogito, Ergo Sum',
      greek: 'the one thing doubt cannot consume',
      preview: 'The Second Meditation begins in total doubt and produces the most famous sentence in modern philosophy. There is one thing, Descartes notices, that even the most powerful evil deceiver cannot make false: that I, who am being deceived, exist.',
      essay: [
        `The Second Meditation begins where the First ended — in ruins — and recovers, in one move, the most certain fact in the inventory of the world. Whatever the content of my thoughts — true, false, illusory, dreamed, induced by a malicious spirit — the fact that thinking is going on, and that there is someone for whom it is going on, cannot be doubted. I think; therefore I am. <em>Cogito, ergo sum.</em>`,
        `The famous Latin formulation does not actually appear in the <em>Meditations</em>, where the argument is made in slightly different terms; the phrase comes from the earlier <em>Discourse on the Method</em>. But the move is the same. From the sheer act of doubting, Descartes extracts the bare existence of the doubter. Then he asks the harder question: what kind of thing am I? Not a body — the existence of bodies is still in doubt. Whatever survives the demolition is not bodily. So I am, essentially, a thing that thinks — a <em>res cogitans</em> — a substance whose whole nature is to be conscious: to doubt, affirm, deny, will, refuse, imagine, perceive.`,
        `The wax example follows and is more important than it looks. Descartes brings a piece of wax near the fire; it loses every sensible quality — hardness, scent, taste, shape, sound — and yet he judges it to be the same wax. The judgment cannot come from the senses, since every sensible feature has changed. It must come from the mind. The wax example proves, in miniature, that the mind is more directly known than the body: what I grasp with certainty is not the wax's surface but its persistence, and the persistence is grasped by thought, not by the senses.`,
        `From the cogito to the wax, the Second Meditation establishes the thinking self as the one unshakeable item in the world. Everything else in the book is built outward from this point. The cogito is not just a fact about Descartes; it is a fact about whoever performs the doubt honestly, which is why writing the book in the first person was not a stylistic choice but a philosophical one.`,
      ],
      where: [
        { n: 5, label: 'Meditation II (the cogito and the wax)' },
        { n: 3, label: 'Synopsis (the cogito described)' },
      ],
    },
    {
      slug: 'god-and-clear-distinct',
      title: 'God and the Criterion of Truth',
      greek: 'a divine guarantee for human faculties',
      preview: 'Once Descartes has the cogito, he has a problem: everything else — including mathematics — is still under suspicion. To rebuild knowledge he needs a guarantee that his faculties are reliable. His answer is theological.',
      essay: [
        `The cogito is certain. But certainty of the cogito does not immediately restore certainty about arithmetic, geometry, or the external world. The evil deceiver might still be at work in all of that. Descartes needs to show that a reliable cognitive faculty exists — and his answer is to establish the existence of a non-deceiving God.`,
        `The Third Meditation offers the first proof: the trademark argument. I have in my mind the idea of an infinite, all-knowing, all-powerful, supremely perfect being. Ideas have what Descartes calls "objective reality" — the being of what they represent. An idea of something infinite and perfect must have a cause that contains at least as much reality as what the idea represents. A finite, imperfect being like me cannot be the adequate cause of an idea of an infinite, perfect being. Therefore God — an actually existing infinite and perfect being — must exist as the cause of this idea in me.`,
        `The Fifth Meditation adds the ontological proof: existence belongs to God's essence the way three angles equal to two right angles belongs to the essence of a triangle. I cannot think of God as non-existing any more than I can think of a mountain without a valley. The analogy is imperfect — Descartes knows it — but the underlying move is precise: existence is a perfection, and a being conceived as having all perfections must be conceived as existing.`,
        `With God established, the argument turns: a perfect being cannot be a deceiver, since deception is an imperfection. Therefore whatever I perceive clearly and distinctly — the criterion meant to identify when my mind operates at its best — must be true. This is the rule Descartes needs to rebuild knowledge beyond the cogito. It is also the famous <em>Cartesian Circle</em> that Arnauld pressed him on: he seems to need clear and distinct perception to establish God, and God to validate clear and distinct perception. Descartes's reply — that the certainty of clear and distinct perception in the moment is self-validating, while God validates memory of past perceptions — has never fully satisfied everyone. But the structural move is what shaped the whole subsequent tradition: a human epistemology underwritten by a divine guarantee.`,
      ],
      where: [
        { n: 6, label: 'Meditation III (trademark argument)' },
        { n: 7, label: 'Meditation IV (truth rule applied)' },
        { n: 8, label: 'Meditation V (ontological proof)' },
      ],
    },
    {
      slug: 'will-and-error',
      title: 'Will, Error, and Self-Government',
      greek: 'error is a misuse of freedom, not a limit of the intellect',
      preview: 'The Fourth Meditation is the shortest and the most underestimated. If God is good and a reliable creator of human faculties, why do I ever make mistakes? Descartes\'s answer is unexpectedly modern — and makes intellectual life a matter of moral discipline.',
      essay: [
        `If God is perfect and created me, why am I not a perfect knower? The question is real and could undermine the whole project. Descartes's answer turns on the structure of two faculties: the intellect, which perceives; and the will, which assents or dissents to what the intellect places before it.`,
        `The intellect, when it perceives clearly and distinctly, perceives truly. Its scope is limited — there are things it does not perceive clearly — but within its proper range it does not err. The will, by contrast, is in a sense unlimited: I am free to assent or dissent to any proposition that comes before my mind, whether the intellect has a clear view of it or not. Error arises when the will outruns the intellect: when I assent to propositions I do not clearly and distinctly understand. The remedy is self-government. I must train myself to withhold assent from anything I do not clearly perceive.`,
        `The doctrine has remarkable consequences. It locates the source of error not in the structure of the world or the limits of the senses, but in a misuse of will. It makes intellectual life a matter of moral discipline: to know better is to want better. It gives the practice of clear-and-distinct perception an ethical dimension that Descartes nowhere quite says aloud but that runs underneath everything he writes.`,
        `The Fourth Meditation is also the place where Descartes most clearly separates himself from the medieval tradition he grew up in. Error is not a positive thing God planted in the creature — it is a privation, arising from the creature's misuse of freedom. This is a thoroughly Augustinian move, but Descartes turns it from a theological account of sin into an epistemological account of mistake. The thinker who has learned to withhold assent until the intellect is clear has become, in a quiet sense, a better person.`,
      ],
      where: [
        { n: 7, label: 'Meditation IV (the argument)' },
        { n: 3, label: 'Synopsis (the argument foreshadowed)' },
      ],
    },
    {
      slug: 'mind-body',
      title: 'The Real Distinction — and the Puzzle of Union',
      greek: 'two substances that are somehow one person',
      preview: 'The Sixth Meditation arrives at the conclusion the whole book has been building toward: mind and body are really distinct substances. But Descartes immediately complicates his own victory by admitting that they are also, somehow, intimately united — and never fully explains how.',
      essay: [
        `The Sixth Meditation argues for two claims that stand in permanent tension. The first: mind and body are really distinct — two substances capable of existing independently. I have a clear and distinct idea of myself as a thinking, non-extended thing; I have a clear and distinct idea of body as an extended, non-thinking thing; God can produce what I clearly and distinctly conceive as separate; therefore they are separate. This is the doctrine that became substance dualism.`,
        `The second claim complicates everything. I am not, Descartes says, like a pilot in a ship who knows of damage only by inspection. I feel pain, hunger, and thirst not by understanding but by a confused sensation arising from a real union of soul and body. The location of pain is not in my mind alone but in my mind as joined to a particular body. The mind and the body — though really distinct — are also intimately united in the single person that I am.`,
        `The problem, which Princess Elisabeth of Bohemia identified in her famous 1643 correspondence with Descartes, is that the two claims resist reconciliation. If mind and body are substances of completely different natures — one thinking and non-extended, one extended and non-thinking — how can they interact at all? What mechanism transmits from a physical event (a pinprick) to a mental one (pain)? Descartes's letters to Elisabeth are the most personal of his philosophical writings, and they show him trying, and not entirely succeeding, to answer her.`,
        `The mind-body problem has not been solved since. The cognitive sciences, neuroscience, and philosophy of mind have been wrestling with it for four centuries, all in the shadow of the distinction Descartes drew. What the <em>Meditations</em> did was not create the problem — but it did name it with unprecedented precision, and in naming it, made it unavoidable for everyone who came after.`,
      ],
      where: [
        { n: 9, label: 'Meditation VI (the distinction and the union)' },
        { n: 3, label: 'Synopsis (the conclusion foreshadowed)' },
      ],
    },
  ],

  castLead: `<p>The <em>Meditations</em> has no characters in the ordinary sense. Its cast is a philosopher writing in the first person, the hypothetical figures he conjures to test his doubt, and the real people who read the manuscript before publication and pushed back with objections Descartes answered in print.</p>`,

  castGroups: [
    {
      label: 'The meditator and his hypotheses',
      characters: [
        {
          id: 'descartes',
          tag: 'AUTHOR',
          name: 'René Descartes',
          epithet: 'Author and first-person voice',
          body: `Born 1596 in La Haye en Touraine (now Descartes, Indre-et-Loire). Educated by the Jesuits at La Flèche — a thorough scholastic training he would spend his life trying to escape. Settled in the Netherlands in 1628 to write in peace. The <em>Discourse on the Method</em> appears in 1637; the <em>Meditations</em> in 1641; the <em>Principles of Philosophy</em> in 1644. Invited to Stockholm by Queen Christina of Sweden in 1649; required to give philosophy lessons at five in the morning in the Swedish winter; catches pneumonia and dies in February 1650 at fifty-three. The <em>Meditations</em> is the work he himself wished to be judged by.`,
          appears: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
        {
          id: 'meditator',
          tag: 'FIRST-PERSON VOICE',
          name: 'The Meditator',
          epithet: 'The I who performs the doubt',
          body: `The voice of the <em>Meditations</em> — the I who sits in the room, undertakes the doubt, finds the cogito, and builds outward to God and the world. Descartes writes carefully in the first person and present tense so that the reader is invited to perform the meditation rather than read a treatise about it. The meditator is, formally, Descartes himself; functionally, whoever the reader is willing to become for the duration. The literary device is part of the philosophical method: the certainty of the cogito is supposed to be felt, not merely understood, and felt only by someone who has actually gone through the doubt that produced it.`,
          appears: [4, 5, 6, 7, 8, 9],
        },
        {
          id: 'evil-deceiver',
          tag: 'HYPOTHESIS',
          name: 'The Evil Deceiver',
          epithet: 'The most powerful skeptical hypothesis in philosophy',
          body: `Introduced at the end of the First Meditation. Suppose there exists not a benevolent God but a powerful and malicious spirit — a <em>malin génie</em>, sometimes translated <em>evil genius</em> or <em>evil demon</em> — who has devoted all his power to deceiving me. Suppose he has so constructed my mind that everything I perceive, including the simplest arithmetic, is part of the deception. The hypothesis is the strongest form of doubt Descartes can conceive, and the one he must defeat to recover any knowledge at all. The cogito defeats it: even if the deceiver makes me wrong about everything else, he cannot make me wrong that I, the deceived, exist. The evil deceiver is the direct ancestor of every later philosophical scenario — brains in vats, computer simulations — in which the reliability of the external world is put in question.`,
          appears: [4, 5],
        },
      ],
    },
    {
      label: 'The readers and objectors',
      characters: [
        {
          id: 'arnauld',
          tag: 'OBJECTOR',
          name: 'Antoine Arnauld',
          epithet: 'Author of the Fourth Objections',
          body: `Theologian and philosopher of the Port-Royal Jansenist circle. His objections are the sharpest in the set that accompanied the published <em>Meditations</em>, and they contain the formal statement of what came to be called the Cartesian Circle: Descartes seems to need clear and distinct perception to establish God's existence, and God's existence to validate clear and distinct perception. Descartes's reply is patient and precise, distinguishing the certainty of clear and distinct perception in the moment from the validation of memory across time. The Fourth Objections and Replies are, by themselves, one of the great short philosophical exchanges of the seventeenth century.`,
          appears: [2],
        },
        {
          id: 'elisabeth',
          tag: 'INTERLOCUTOR',
          name: 'Princess Elisabeth of Bohemia',
          epithet: 'The correspondent who found the fatal gap',
          body: `Not a character in the <em>Meditations</em> itself but the most acute philosophical correspondent of Descartes's later years. Elisabeth — exiled Bohemian princess living in The Hague — read the <em>Meditations</em> and wrote to Descartes in 1643 with the question that would haunt the system: if mind and body are really distinct substances, how can the mind move the body and the body affect the mind? Descartes's letters to her are the most personal of his philosophical writings, and they show him trying, and not entirely succeeding, to answer her. She made the interaction problem famous and pushed Descartes to confront the limits of his own dualism.`,
          appears: [9],
        },
        {
          id: 'sorbonne',
          tag: 'DEDICATEES',
          name: 'The Theologians of the Sorbonne',
          epithet: 'The institution Descartes needed on his side',
          body: `The dean and doctors of the sacred faculty of theology in Paris, to whom Descartes formally dedicates the <em>Meditations</em>. The dedication is a deferential letter explaining that the book provides philosophical demonstrations of God's existence and the soul's distinctness from the body — two propositions the Lateran Council of 1513 had urged Christian philosophers to prove by natural reason. The political purpose is unmistakable: Descartes had watched what happened to Galileo in 1633. The dedication did not secure their endorsement; the <em>Meditations</em> was placed on the Index of Forbidden Books in 1663, thirteen years after Descartes's death.`,
          appears: [1],
        },
      ],
    },
  ],

  cast: [
    {
      name: 'René Descartes',
      role: 'AUTHOR',
      body: `Born 1596 in La Haye en Touraine — the town that now bears his name — to a minor French gentleman of the robe. Educated by the Jesuits at La Flèche, where he received a thorough scholastic training he would spend the rest of his life trying to escape. Trained briefly in law, served briefly as a soldier, traveled, and eventually settled in the Netherlands in 1628 to write in peace. The Discourse on the Method appears in 1637; the Meditations in 1641; the Principles of Philosophy in 1644. Accepts an invitation to Stockholm from Queen Christina of Sweden in 1649. Required to give philosophy lessons at five in the morning in the Swedish winter, he catches pneumonia and dies in February 1650 at fifty-three. The Meditations is the most carefully constructed of his philosophical works and the one he himself wished to be judged by.`,
    },
    {
      name: 'The Meditator',
      role: 'FIRST-PERSON VOICE',
      body: `The voice of the Meditations — the I who sits in the room, who undertakes the doubt, who finds the cogito, who builds outward to God and the world. Descartes is careful to write in the first person and in the present tense, so that the reader is invited to perform the meditation rather than read a treatise about it. The meditator is, formally, Descartes himself; functionally, he is whoever the reader is willing to become for the duration. The literary device is part of the philosophical method: the certainty of the cogito is supposed to be felt, not merely understood, and felt only by someone who has actually gone through the doubt that produced it. The Meditations is one of the few works of major philosophy that depends, for its full effect, on the reader's willingness to take its first-person form seriously.`,
    },
    {
      name: 'The Evil Deceiver',
      role: 'HYPOTHESIS',
      body: `The most famous thought experiment in modern philosophy, introduced at the end of the First Meditation. Suppose, Descartes proposes, that there exists not a benevolent God but a powerful and malicious spirit — a malin génie, sometimes translated evil genius or evil demon — who has devoted all his power to deceiving me. Suppose he has so constructed my mind and my world that everything I perceive, including the simplest arithmetic and geometry, is part of the deception. What can I still know? The hypothesis is the strongest form of doubt Descartes can conceive, and it is the hypothesis he must defeat to recover any knowledge at all. The cogito is meant to defeat it: even if the deceiver makes me wrong about everything else, he cannot make me wrong about the fact that I, the deceived, exist. The figure of the evil deceiver is the direct ancestor of every later philosophical scenario about brains in vats and computer simulations.`,
    },
    {
      name: 'Princess Elisabeth of Bohemia',
      role: 'INTERLOCUTOR',
      body: `Not a character in the Meditations itself but the most acute philosophical correspondent of Descartes's later years. Elisabeth, exiled Bohemian princess living in The Hague, read the Meditations and wrote to Descartes in 1643 with the question that would haunt the system: if mind and body are really distinct substances, how can the mind move the body and the body affect the mind? Cartesian dualism faces no harder objection, and Descartes's letters to Elisabeth — the most personal of his philosophical writings — show him trying, and not entirely succeeding, to answer it. She is the figure who made the interaction problem famous and who, more than any other early reader, pushed Descartes to confront the limits of his own dualism.`,
    },
    {
      name: 'Antoine Arnauld',
      role: 'OBJECTOR',
      body: `Theologian and philosopher of the Port-Royal Jansenist circle, author of the Fourth Set of Objections that accompany the published Meditations. Arnauld's objections are the sharpest of the set and contain the formal statement of what came to be called the Cartesian Circle: that Descartes seems to need clear and distinct perception to establish God's existence, and God's existence to validate clear and distinct perception. Descartes's reply is patient and famous, distinguishing the certainty of clear and distinct perception in the moment from the validation of memory across time. The Fourth Objections and Replies are, by themselves, one of the great short philosophical exchanges of the seventeenth century, and Arnauld's eye for what the system could and could not survive made him Descartes's most demanding sympathetic reader.`,
    },
    {
      name: 'The Theologians of the Sorbonne',
      role: 'DEDICATEES',
      body: `The dean and doctors of the sacred faculty of theology in Paris, to whom Descartes formally dedicates the Meditations. The dedication is a long and deferential letter explaining that the book is, among other things, a philosophical demonstration of the existence of God and the immortality of the soul — two propositions which the Lateran Council of 1513 had urged Christian philosophers to prove by natural reason. The political purpose is unmistakable: Descartes has watched what happened to Galileo in 1633, and he wants the Sorbonne on his side. The dedication did not in fact procure their endorsement, and the Meditations was placed on the Index of Forbidden Books in 1663, thirteen years after Descartes's death. But the dedication is part of the book's original architecture: a careful work of natural theology offered, with proper humility, to the institution that could most easily destroy it.`,
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'Letter of Dedication',
      tourTitle: 'The letter to the Sorbonne',
      hook: 'Before the argument begins, Descartes writes to the most powerful theological institution in France — and explains, very carefully, why they should protect him.',
      tour: `Descartes addresses the dean and doctors of the sacred faculty of theology in Paris. He has two things he wants philosophy to prove by natural reason: that God exists, and that the soul is distinct from the body. He notes that Scripture says the knowledge of God is clear enough that those who lack it are blameworthy — which implies a philosophical proof should be possible. He has already sketched the argument in the <em>Discourse on the Method</em> of 1637; now he offers a fuller treatment and asks for the Sorbonne's protection. The political stakes are real: Descartes watched Galileo condemned by the Roman Inquisition in 1633 and chose the Netherlands as his base precisely to write freely. The dedication is not mere flattery but a calculated move.`,
      blurb: `Descartes addresses the theologians of the Sorbonne, explaining that he intends to prove by natural reason that God exists and that the soul is distinct from the body — and asking, very carefully, for their protection.`,
      summary: [
        `Descartes addresses the letter to the dean and doctors of the sacred faculty of theology in Paris — the dominant intellectual institution of Catholic France. His stated purpose is to provide a philosophical demonstration of two propositions: that God exists, and that the human soul is distinct from the body. He notes that these two truths are necessary if unbelievers are ever to be persuaded, since to tell them Scripture proves it is to argue in a circle for anyone who does not already believe in Scripture.`,
        `He recalls that he already touched on these questions in the <em>Discourse on the Method</em> (1637) but did not treat them fully. Now he has worked out the arguments at length and asks the Sorbonne to examine them, correct whatever is in error, and provide their authority. His hope is that if they endorse the arguments, other theologians and philosophers will trust them — and that unbelievers, seeing the endorsement, will find no excuse to doubt.`,
        `The political subtext is clear. Descartes had moved to the Netherlands in 1628 partly to escape the risks of Parisian intellectual life; he had watched the condemnation of Galileo in 1633 and carefully suppressed his own treatise on the world. The dedication to the Sorbonne is partly genuine — he did want Catholic philosophers to engage with the work — but it is also a protective maneuver: to get the most powerful theological institution in France on his side before anyone else can declare the book dangerous.`,
      ],
      appears: [{ id: 'descartes', name: 'René Descartes' }, { id: 'sorbonne', name: 'The Theologians of the Sorbonne' }],
      themes: [{ slug: 'god-and-clear-distinct', label: 'God and the criterion of truth' }],
    },
    {
      n: 2,
      title: 'Preface to the Reader',
      tourTitle: 'Preface and pre-emptive replies',
      hook: 'Descartes addresses his reader directly and heads off the two most likely objections before the argument has even begun.',
      tour: `In the <em>Discourse on the Method</em>, Descartes had asked readers to point out anything worthy of objection. Two objections came back, and he addresses them here. The first: even if the mind perceives itself as nothing but a thinking thing, it does not follow that its nature consists only in being a thinking thing — the word "only" might be too strong. The second: even if I have the idea of something more perfect than I am, it does not follow that the idea itself, or its object, actually exists. Both objections are addressed briefly but precisely. Descartes then tells the reader what to expect: the meditations require sustained concentration over several days, and the reader should not judge any single one in isolation.`,
      blurb: `Descartes addresses the reader directly and answers in advance the two main objections raised against his 1637 sketch of the argument — about whether the mind is exclusively a thinking thing, and whether an idea of perfection proves its object exists.`,
      summary: [
        `Descartes reminds the reader that the <em>Discourse on the Method</em> (1637) had included a brief sketch of the arguments about God and the soul, and that he had invited criticism. Two objections came back that were worth addressing. He now deals with them before the meditations themselves begin, so they do not distract the reader when the arguments appear.`,
        `The first objection: even if, when the mind reflects on itself, it perceives itself as nothing but a thinking thing, this does not prove that its nature consists <em>only</em> in being a thinking thing — the word "only" might be excluding too much, the objector says. Descartes replies that the word is not meant in an absolute metaphysical sense at this stage of the argument, only in a methodological one: the meditation establishes what the mind clearly and distinctly perceives of itself, which does not yet settle what its complete nature is. That question is handled in the Sixth Meditation. The second objection: even if I have the idea of something more perfect than I am, it does not follow that the idea itself is more perfect than I am, nor that its object actually exists. Descartes replies by distinguishing the formal reality of an idea (its existence as a mental act) from the objective reality of an idea (the degree of being it represents) — a distinction that will be crucial in Meditation III.`,
        `Descartes closes with a reading warning: these meditations require sustained attention over several days; they should not be skimmed or read in isolation; and the reader should not form a final judgment on any single one before having read the whole. This is unusual advice for a philosophical text and reflects his awareness that the demolition of the First Meditation will seem disorienting unless the reader knows the recovery is coming.`,
      ],
      appears: [{ id: 'descartes', name: 'René Descartes' }, { id: 'arnauld', name: 'Antoine Arnauld' }],
      themes: [{ slug: 'cogito', label: 'Cogito, ergo sum' }, { slug: 'god-and-clear-distinct', label: 'God and the criterion of truth' }],
    },
    {
      n: 3,
      title: 'Synopsis of the Six Following Meditations',
      tourTitle: 'The roadmap',
      hook: 'Descartes maps the entire argument in six paragraphs before it begins — which is unusual, and deliberate.',
      tour: `The Synopsis describes each meditation in a single paragraph. The First establishes the grounds for doubting everything. The Second shows that the mind's existence is the one thing that survives total doubt. The Third proves God exists from the idea of God in the mind. The Fourth explains truth, error, and why a perfect God is compatible with a creature who makes mistakes. The Fifth gives a second proof of God from the nature of essence. The Sixth proves the existence of bodies and establishes the real distinction between mind and body. The Synopsis is not a substitute for the meditations; Descartes says explicitly that the soul's immortality, which many expect him to prove, is not in fact demonstrated here — it requires further premises from physics. The map tells you where you are going but not what you will find when you get there.`,
      blurb: `A six-paragraph map of the entire argument. Descartes describes what each meditation establishes — and notes, with characteristic precision, what the book does not claim to prove, including the immortality of the soul.`,
      summary: [
        `Descartes provides a brief account of what each of the six meditations achieves. The First lays the grounds for universal doubt — by showing that the senses sometimes mislead, that dreaming is indistinguishable from waking, and that an evil deceiver might be corrupting even mathematical intuitions. The purpose of the doubt is not skepticism but the discovery of what cannot be doubted at all. The Second finds that even in total doubt the mind must exist, since doubting is itself a form of thinking. It also shows that the mind knows itself more directly than it knows any body — the wax example demonstrates this. The Third demonstrates God's existence from the nature of the idea of God in the mind: the idea represents an infinite, perfect being; nothing finite and imperfect could be the adequate cause of that idea; therefore an actually existing perfect being must have caused it.`,
        `The Fourth explains how error arises in a world created by a perfect and non-deceiving God: not because God gave us defective faculties but because we misuse our freedom by assenting to propositions we do not clearly perceive. The Fifth gives a new proof of God's existence from the concept of essence — existence belongs to God's nature the way three angles equal to two right angles belongs to a triangle — and shows that the truth of clear and distinct perceptions cannot be doubted once God's existence is secure. The Sixth proves that material things exist (since God cannot systematically deceive us about the powerful inclination we have to believe in them) and argues for the real distinction between mind and body.`,
        `A note about what the book does not prove: the immortality of the soul. Many readers expect this. Descartes says the distinction of mind from body is established, but immortality requires further premises from physics — premises that the <em>Meditations</em> does not supply. The Synopsis is an honest map of what lies ahead, and it is honest about the limits as well as the achievements.`,
      ],
      appears: [{ id: 'descartes', name: 'René Descartes' }],
      themes: [{ slug: 'methodic-doubt', label: 'Methodic doubt' }, { slug: 'cogito', label: 'Cogito, ergo sum' }, { slug: 'god-and-clear-distinct', label: 'God and the criterion of truth' }, { slug: 'mind-body', label: 'The real distinction' }],
    },
    {
      n: 4,
      title: 'Meditation I — Of the Things of Which We May Doubt',
      tourTitle: 'The great demolition',
      hook: 'Descartes sits down, resolves to doubt everything he has ever believed, and proceeds — in three moves of escalating force — to strip the world bare.',
      tour: `Meditation I is the controlled demolition. Descartes has decided that once in his life he will rid himself of all opinions received without examination, and he must do it now while he is free from the cares of practical life. He does not need to show every belief is false — only that it might be. First wave: the senses sometimes mislead. Second wave: even clear sensory experience might be dreaming. Third wave: even arithmetic and logic might be wrong if an evil deceiver has constructed my mind to treat falsehoods as truths. At the end, Descartes has no secure ground left. He resolves to hold to the doubt deliberately, as if all familiar beliefs were false, so that he can proceed to what — if anything — the doubt cannot touch.`,
      blurb: `The great demolition. Descartes takes apart his beliefs layer by layer — the senses, then dreaming, then the evil deceiver — until nothing is left standing. Methodic doubt reaches its maximum extent.`,
      summary: [
        `Several years have passed, Descartes says, since he first noticed that he had accepted many false opinions as true, and that everything he had built on them was therefore uncertain. He has been waiting for a moment to remedy this; now is the time. He does not need to refute each belief individually — he only needs to find, in each category of belief, some reason for doubt, and the whole category falls.`,
        `First he attacks beliefs based on the senses. The senses sometimes mislead us. Prudence requires not trusting wholly what has once deceived. But surely, he objects to himself, I cannot doubt that I am here, seated by the fire, holding this paper? Yet sometimes in dreams he has had equally vivid impressions of being in his room, only to wake and find it was not so. There is no reliable mark by which waking can be distinguished from dreaming. Even if the dream argument threatens our knowledge of particular objects, surely mathematics survives? Two and three make five whether I am asleep or awake.`,
        `Then comes the third and decisive move: the evil deceiver. What if, instead of a benevolent God, there is a supremely powerful and malicious spirit whose entire purpose is to deceive me — who has so constructed my nature that I err even in what seems most evident, including simple arithmetic? At this point Descartes has found a reason to doubt everything, and the demolition is complete. He ends by resolving to hold to this doubt artificially — to treat all familiar beliefs as if they were false — so that when he searches for something the doubt cannot reach, he will be sure he has found it.`,
      ],
      appears: [{ id: 'meditator', name: 'The Meditator' }, { id: 'evil-deceiver', name: 'The Evil Deceiver' }],
      themes: [{ slug: 'methodic-doubt', label: 'Methodic doubt' }],
    },
    {
      n: 5,
      title: 'Meditation II — Of the Nature of the Human Mind',
      tourTitle: 'The cogito and the wax',
      hook: 'In the ruins of total doubt, Descartes finds the one fact even the most powerful deceiver cannot take from him — and discovers that what he is, at bottom, is a thing that thinks.',
      tour: `Meditation II opens in the wreckage left by the First. Descartes supposes all the things he sees are false; he has no senses; body, shape, extension, and motion are fictions. But wait — if he is being deceived, he must exist to be deceived. Whatever else is uncertain, the thinking, doubting self exists: <em>cogito, ergo sum</em>. Next he asks what kind of thing this self is. Not a body — he has not yet established that bodies exist. He is, essentially, a thing that thinks: that doubts, understands, affirms, denies, wills, refuses, imagines, perceives. Then the wax argument: a piece of wax loses every sensible quality when held near flame, yet he judges it to be the same wax. The judgment comes from the mind, not the senses. The mind is more immediately known than any body.`,
      blurb: `The cogito and the wax example. In the wreckage of total doubt, Descartes finds that the thinking, doubting self cannot be doubted — and then shows, through the famous wax argument, that the mind is more directly known than any physical object.`,
      summary: [
        `The First Meditation left Descartes disconcerted — unable to plant his feet on the bottom of the doubt or to swim to the surface. Now he supposes everything he sees is false, that he has no senses, that body, shape, and extension are fictions of his mind. And then he notices something. Even if all this is false, something must be doing the supposing. He cannot be non-existent if there is a deceiver deceiving him — being deceived requires existing to be deceived. <em>I think, therefore I am.</em> This one fact the evil deceiver cannot falsify.`,
        `What, then, is he? Not a body — the existence of bodies is still in doubt. He is a thinking thing: something that doubts, understands, affirms, denies, wills, refuses, imagines, perceives. These are the modes of thought, and they cannot be separated from him the way bodily properties can. Even if he imagines nothing and perceives nothing true, the doubting and the willing are still there. The thinking self is real and better known than anything else.`,
        `The wax example follows and deepens the point. A piece of wax, fresh from the hive, has a particular scent, color, shape, and hardness. Held near the fire, every sensible quality changes — and yet Descartes judges it to be the same wax. What persists is not anything the senses report but something extended, flexible, and changeable — a bare physical extension. This extended something is grasped not by the senses or the imagination but by the intellect alone. And if bodies are better known through the intellect than through the senses, then the mind — which is the intellect — is more immediately known than any body. The Second Meditation ends at the threshold of a rebuilt world, with the thinking self as its foundation.`,
      ],
      appears: [{ id: 'meditator', name: 'The Meditator' }, { id: 'evil-deceiver', name: 'The Evil Deceiver' }],
      themes: [{ slug: 'cogito', label: 'Cogito, ergo sum' }, { slug: 'methodic-doubt', label: 'Methodic doubt' }],
    },
    {
      n: 6,
      title: 'Meditation III — Of God: That He Exists',
      tourTitle: 'The proof of God from the idea of God',
      hook: 'Descartes closes his eyes, turns away from his senses, and asks: what is so firmly established in my mind that even an evil deceiver could not have produced it? The answer leads him to God.',
      tour: `Meditation III is the most demanding of the six. Descartes begins by taking stock of what he knows: he is a thinking thing, and whatever he perceives clearly and distinctly is probably true — but he cannot be fully certain until he has dealt with the possibility of a deceiving God. He then launches into a lengthy examination of the kinds of ideas in the mind and their "objective reality" — the degree of being they represent. The key move: the idea of God in my mind represents an infinite, all-perfect being. Nothing finite and imperfect could be the adequate cause of an idea with that much objective reality. Therefore an actually existing infinite and perfect being — God — must have caused the idea. This is the trademark argument. God exists. And a perfect God would not be a deceiver. Therefore clear and distinct perception is reliable. The circle of knowledge begins to close.`,
      blurb: `The trademark argument for God's existence. Descartes examines the idea of God in his mind — infinite, all-powerful, all-knowing, supremely perfect — and argues that only an actually existing God could be its adequate cause. A perfect God would not deceive; therefore clear and distinct perception is reliable.`,
      summary: [
        `Descartes closes his eyes, turns away from his senses, and takes stock of what he knows with certainty. He is a thinking thing. He seems to perceive clearly and distinctly that the cogito is true — but a nagging worry remains: what if a supremely powerful God (or deceiving spirit) has made him so that he is wrong even about what seems most evident? To settle this he must ask whether God exists, and what God's nature is.`,
        `He begins by classifying ideas. Some appear innate (the idea of a thinking thing), some adventitious (the idea of the sun as I see it), some factitious (the idea of a hippogriff I construct myself). Ideas have what he calls objective reality — the degree of being they represent. A stone's objective reality is less than a person's; a person's is less than God's. Whatever the cause of an idea, the cause must have at least as much formal reality as the idea has objective reality. A finite, imperfect cause cannot produce an idea with more objective reality than itself.`,
        `Now the key inference: in Descartes's mind there is an idea of God — of an infinite, all-knowing, all-powerful, supremely perfect being. This idea has the highest possible objective reality. He himself is a finite and imperfect being and could not be its adequate cause. Therefore there must be an actually existing being with infinite and perfect formal reality that caused this idea in him. That being is God. And since God is perfect, God is not a deceiver — deception implies imperfection. Therefore Descartes can now trust that whatever he perceives clearly and distinctly is true, because a perfect God has given him faculties reliable when used correctly. The argument is long and difficult. But its effect is decisive: it defeats the evil deceiver hypothesis by replacing the hypothetical deceiver with an actually existing non-deceiving God.`,
      ],
      appears: [{ id: 'meditator', name: 'The Meditator' }],
      themes: [{ slug: 'god-and-clear-distinct', label: 'God and the criterion of truth' }, { slug: 'methodic-doubt', label: 'Methodic doubt' }],
    },
    {
      n: 7,
      title: 'Meditation IV — Of Truth and Error',
      tourTitle: 'Why we make mistakes',
      hook: 'God is perfect and created my faculties. So why do I ever err? Descartes\'s answer locates the source of error not in the intellect but in the misuse of will — and makes getting things right a matter of self-discipline.',
      tour: `Meditation IV is short and underestimated. Descartes now knows God is not a deceiver and that his faculties, used correctly, are reliable. But he still makes mistakes. Why? The intellect has a limited range: it clearly perceives some things, dimly perceives others, and perceives nothing at all of yet others. The will, by contrast, is unlimited — it can assent to or dissent from anything that comes before the mind. Error arises when the will extends itself beyond the range of the intellect: when I affirm something I do not clearly and distinctly understand. The remedy is not to distrust the intellect but to discipline the will: withhold assent from anything not clearly perceived. Right cognition is an exercise of self-government.`,
      blurb: `The source of error: not a defect in the intellect, but the will extending beyond what the intellect clearly perceives. Descartes argues that error is always a misuse of freedom — and that the remedy is the discipline of withheld assent.`,
      summary: [
        `Descartes is now sure that whatever God created is good and that God is not a deceiver. But he still makes mistakes. God gave him his faculties; if those faculties are good, how can they produce error? The question is real and must be answered if the project of rebuilding knowledge on indubitable foundations is to succeed.`,
        `His answer turns on the relationship between two faculties: the intellect, which perceives; and the will, which assents or dissents. The intellect is not unlimited — there are many things it does not clearly perceive. But this is not a defect; it simply reflects the difference between finite and infinite understanding. The will, by contrast, is in a sense unlimited: I can assent to any proposition that comes before my mind, whether or not I understand it clearly. Error arises precisely when the will extends beyond the scope of the intellect — when I affirm or deny something I do not clearly and distinctly understand.`,
        `The remedy follows: train the will to withhold assent from anything not clearly and distinctly perceived. This is not a negative result — it is the positive discovery that intellectual error is always a form of excess, never a simple defect of the instruments. The intellect, operating within its proper range, does not err. And the proper range can be expanded by doing philosophy well: by attending more carefully, by suspending judgment, by building knowledge slowly on foundations that cannot be doubted. Meditation IV, the shortest of the six, quietly makes good epistemic practice a matter of moral character.`,
      ],
      appears: [{ id: 'meditator', name: 'The Meditator' }],
      themes: [{ slug: 'will-and-error', label: 'Will, error, and self-government' }, { slug: 'god-and-clear-distinct', label: 'God and the criterion of truth' }],
    },
    {
      n: 8,
      title: 'Meditation V — Of the Essence of Material Things; And, Again, Of God',
      tourTitle: 'The ontological proof',
      hook: 'Before returning to the world, Descartes takes stock of what he can clearly and distinctly conceive — and arrives at a second proof of God\'s existence that is even shorter and more vertiginous than the first.',
      tour: `Meditation V is in two parts. The first examines the clear and distinct ideas of mathematical objects — triangles, spheres, numbers — and argues that these objects have true and immutable natures even if no such objects exist in the world. (I can discover properties of a triangle I did not put there.) The second part gives the ontological argument: I have the idea of a supremely perfect being. Existence is a perfection. Therefore existence is contained in the idea of a supremely perfect being; therefore God exists. The argument is not that I can imagine existence into anything — I cannot conceive a mountain without a valley, but that proves nothing about whether mountains exist. The case of God is different: existence belongs to the nature of a perfect being necessarily, the way having three angles belongs necessarily to a triangle.`,
      blurb: `Two arguments in one meditation: mathematical objects have true natures independent of whether they exist in the world; and God, as supremely perfect, must exist, since existence is a perfection and perfection cannot be lacking in a perfect being.`,
      summary: [
        `Descartes turns to material things before demonstrating that they exist — he wants first to examine his clear and distinct ideas of them, to see what he can know about them without yet committing to their existence. He finds he has a clear and distinct idea of quantity — extension in three dimensions — and that within this idea he can discover all kinds of properties of shapes, sizes, and spatial relations that seem to have been there all along, not invented by him. When he discovers that the angles of a triangle equal two right angles, he is not inventing this — it was already there in the nature of the triangle, waiting to be found. Mathematical truths are true and immutable, even if no triangle has ever existed outside the mind.`,
        `He then asks: do I find the idea of an actually existing God anywhere in my mind in the same way? Yes: I have the idea of a supremely perfect being, and existence belongs to that being no less necessarily than having three angles belongs to a triangle. A triangle whose angles did not sum to two right angles would not be a triangle at all. A supremely perfect being that lacked existence would not be supremely perfect at all. Therefore the idea of a supremely perfect being implies existence — God must exist.`,
        `He anticipates the obvious objection: from the fact that I cannot think of a mountain without a valley, it does not follow that any mountain exists. Why should God be different? Descartes's reply: the mountain and the valley case proves only that the two are inseparable from each other in my conception — not that either exists. But in God's case the inseparability is between the concept of maximal perfection and existence itself. I am not free to conceive of God as non-existing any more than I am free to conceive of a triangle whose angles do not sum to two right angles. Existence is packed into the concept of perfect being at the most fundamental level. The Fifth Meditation ends with the observation that knowledge of God is the firmest and most certain of all — because God's existence is contained in God's essence, and I cannot separate the two even in thought.`,
      ],
      appears: [{ id: 'meditator', name: 'The Meditator' }],
      themes: [{ slug: 'god-and-clear-distinct', label: 'God and the criterion of truth' }],
    },
    {
      n: 9,
      title: 'Meditation VI — Of the Existence of Material Things',
      tourTitle: 'The return to the world',
      hook: 'After five meditations of radical doubt, Descartes returns to the world — proves that bodies exist, distinguishes mind from body as two real substances, and then admits that the two, though distinct, are intimately united in a way he cannot fully explain.',
      tour: `The last meditation is the longest and the most resolved. Bodies exist — not because the senses are trustworthy, but because God, who is not a deceiver, would not have given us such a powerful inclination to believe in them if they did not exist. The mind is really distinct from the body: I have a clear and distinct idea of myself as a thinking, non-extended thing, and a clear and distinct idea of body as extended, non-thinking — and what I clearly and distinctly conceive as separable, God can produce as separate. But then Descartes admits the twist: mind and body are also intimately united. Pain is not a cold observation of damage — I feel it. This is the union. And the union is real, even though the distinction is real. The puzzle Descartes ends on — how can two wholly different substances interact? — is the puzzle that has not been solved since.`,
      blurb: `Bodies exist; mind and body are really distinct substances; and yet they are also intimately united — felt together in every sensation of pain, hunger, and pleasure. The Sixth Meditation establishes both the distinction and the union, and leaves the tension between them for every subsequent philosopher to inherit.`,
      summary: [
        `Descartes begins by noting that material objects can at least exist, since God could produce whatever he can clearly and distinctly conceive. But can he prove they do exist? He examines the faculties of imagination and pure intellection. When he imagines a triangle, he not only conceives it but applies his mind to it with a kind of interior gaze — he seems to see it. When he thinks of a chiliagon (a thousand-sided figure), he can clearly conceive it but cannot really imagine it. The difference suggests that imagination depends on something distinct from the mind alone — presumably the body. This is not a proof, but a clue.`,
        `The real argument for bodies comes from the analysis of sense perception. He has a powerful and almost irresistible inclination to believe that his ideas of sensible things come from bodies outside him. God has given him this inclination and has given him no faculty to detect that it is wrong. A non-deceiving God would not produce in us a strong and natural inclination toward a false belief and then provide no means to correct it. Therefore bodies must really exist — though perhaps not exactly as they appear, since the senses are better at reporting what is useful than at reporting precise scientific truths.`,
        `From this foundation Descartes establishes the real distinction of mind and body: he has a clear and distinct idea of himself as only a thinking, non-extended thing, and a clear and distinct idea of body as only an extended, non-thinking thing; what is clearly and distinctly conceived as separable, God can separate; therefore mind and body are really distinct substances. But immediately the complication: I am not merely in my body like a pilot in a ship. I feel pain when the body is injured; I feel hunger and thirst; I feel pleasure. These sensations are not cool reports but confused urgencies that arise from a genuine union of mind and body. How a non-extended thinking thing and an extended non-thinking thing are united in a single person — this question, which Princess Elisabeth pressed on Descartes in 1643, he does not answer here. The Sixth Meditation ends with the observation that the senses are trustworthy enough for practical life, even if not for science. The world is real. The doubt is over. And the problem of mind and body — named here with perfect precision — has been open ever since.`,
      ],
      appears: [{ id: 'meditator', name: 'The Meditator' }, { id: 'elisabeth', name: 'Princess Elisabeth of Bohemia' }],
      themes: [{ slug: 'mind-body', label: 'The real distinction' }, { slug: 'god-and-clear-distinct', label: 'God and the criterion of truth' }, { slug: 'cogito', label: 'Cogito, ergo sum' }],
    },
  ],
};
