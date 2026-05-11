// SEO data for Aristotle's Politics
// 8 books. Companion to the-republic.cjs as a foil.

module.exports = {
  id: 'aristotle-politics',
  title: 'Politics',
  author: 'Aristotle',
  byline: 'c. 350 BC · Greek political philosophy',
  titleAccent: 'a guided tour',
  hook: 'Plato dreamed a city. Aristotle classifies the ones that exist. This is the book that calls man a political animal — and then proves it, constitution by constitution, from the household up.',
  genre: ['Philosophy', 'Political theory', 'Ancient Greek literature'],
  themesBlurb: 'The natural city, six constitutions, slavery, the middle class, revolution, education for leisure.',
  castBlurb: 'The polis',
  castDesc: 'Authors, legislators, and constitutions under scrutiny.',
  chapterLabel: n => 'Book ' + ['I','II','III','IV','V','VI','VII','VIII'][n-1],

  about: [
    `<em>Politics</em> is what happens when philosophy stops dreaming and starts counting. Aristotle has read his teacher's <em>Republic</em> and finds it brilliant and wrong. Where Plato builds a city in speech around a single luminous form of justice, Aristotle gathers constitutions — by tradition one hundred and fifty-eight of them, of which only the Athenian survives — and asks what cities actually do, what holds them together, what tears them apart.`,
    `The book opens with a genetic argument: households combine into villages, villages into the city, and the city exists not for mere life but for the good life. Man, the creature with logos — speech capable of arguing about just and unjust — is by nature a political animal. Whoever lacks the city by nature is either beast or god. From this foundation Aristotle builds a political science: six regime types, the causes of revolution, the case for the middle class as stabilizer, and a vision of the best city that educates its citizens for the proper use of leisure.`,
  ],

  chaptersSubtitle: 'All 8 books, from the household to the music room — the complete arc of Aristotle\'s political science.',
  chaptersLead: `<p><em>Politics</em> is structured as eight books of unequal weight. Books I–II build the foundations and clear the ground of Plato. Book III is the theoretical core: citizen, constitution, the six regime types. Books IV–VI are applied science: varieties of democracy and oligarchy, causes of revolution, practical remedies. Books VII–VIII are the ideal: the best city and the education that makes it possible. Read Books I and III first. The rest will fall into place.</p>`,

  themesByline: 'Five threads through the work',
  themesLead: `<em>Politics</em> is a systematic treatise that keeps interrupting itself with history, argument, and polemic. Beneath the classification is a single question: what makes a human community genuinely good, and not merely stable?`,

  groups: [
    { label: 'Books I–II · Foundations', subtitle: 'The city by nature. Critique of Plato and the Spartans.', chapters: [1, 2] },
    { label: 'Book III · The science of constitutions', subtitle: 'Who is a citizen? What are the six forms of government?', chapters: [3] },
    { label: 'Books IV–VI · Applied political science', subtitle: 'Varieties, causes of revolution, practical remedies.', chapters: [4, 5, 6] },
    { label: 'Books VII–VIII · The best city', subtitle: 'The ideal regime and the education that forms its citizens.', chapters: [7, 8] },
  ],

  themes: [
    {
      slug: 'natural-city',
      title: 'The City Is Natural',
      greek: '"Man is by nature a political animal"',
      preview: 'The opening argument is genetic and unrelenting. The city does not emerge from a social contract; it is the completion of a natural process that begins with the household. The creature built for logos is built for the polis.',
      essay: [
        `Book I opens with a claim that organizes the entire work: the city exists by nature. Aristotle reaches this conclusion through a genetic story. Male and female unite for reproduction; master and slave for preservation; together they form the household, which exists for the daily recurring needs of life. Households combine into the village, which serves needs beyond the day. Villages combine into the city — the first community self-sufficient for the good life. Each stage exists by nature, and so the end-stage, the city, exists by nature.`,
        `The conclusion follows: man is by nature a political animal. The creature who alone possesses logos — speech, reason, the capacity to argue about the advantageous and the harmful, the just and the unjust — is built for the polis the way the hand is built for grasping. Aristotle quotes Homer's "tribeless, lawless, hearthless one" — the outcast who is a lover of war — and says such a person is like a piece removed from a board game: nothing in itself, belonging nowhere.`,
        `The argument is teleological, not merely developmental. Earlier stages exist for the sake of later ones, as the sapling exists for the tree. The city is therefore prior to the household and the individual in the order of nature, even though it comes after them in the order of generation. The whole is prior to the part. A hand cut from the body is a hand in name only. A human being outside the city is human in name only. This is the ground from which everything else in <em>Politics</em> rises — and the claim that later thinkers, from Hobbes to Rousseau, felt compelled to argue against.`,
        `What makes the argument striking is its refusal of the obvious alternative. Aristotle knows the position that cities are artificial — that they arise from agreement, convention, compulsion. He dismisses it. The city is not imposed on human nature; it fulfills it. We do not build cities and then become political beings. We are political beings, and cities are what our nature produces when it completes itself.`,
      ],
      where: [
        { n: 1, label: 'Book I (the genetic argument)' },
        { n: 3, label: 'Book III (citizen definition)' },
        { n: 7, label: 'Book VII (the best city)' },
      ],
    },
    {
      slug: 'six-constitutions',
      title: 'Six Constitutions, Three Good and Three Corrupt',
      greek: 'monarchy, aristocracy, polity — and their shadows',
      preview: 'Book III builds the taxonomy that organizes the rest of the work. Two questions classify any regime: how many rule, and in whose interest? The answer gives six types, three sound and three deviations.',
      essay: [
        `Book III builds the taxonomy that organizes the rest of the work. A constitution, Aristotle writes, is the arrangement of offices in a city — especially the sovereign office. Two questions classify any regime: how many rule, and in whose interest? Rule by one for the common good is monarchy; for the ruler's private good, tyranny. Rule by a few virtuous men for the common good is aristocracy; by a few wealthy for their own gain, oligarchy. Rule by the many for the common good is polity; by the many poor for their own gain, democracy. Three sound forms, three deviations.`,
        `The crucial pair is polity and democracy. Both put the many in charge, but polity governs in the interest of the city as a whole while democracy governs in the interest of the poor majority against the rich. Aristotle is unsentimental about Athens — he calls its regime an extreme democracy, nearly tyrannical in its treatment of the wealthy. He is equally hard on oligarchies that confuse their own interest with the common good. The deviation is not about numbers but about aim.`,
        `Aristotle insists that the pairs are not merely different types but ranked: the perversions are deviations from their corresponding sound forms, not independent species. Tyranny is not just a different kind of monarchy; it is monarchy that has turned against its own purpose. This ranking matters practically: it means political reform always has a direction, and a corrupt regime can be improved by moving it toward its sound form rather than replacing it entirely.`,
        `The classification is not academic. It is the diagnostic instrument for everything that follows: the analysis of revolutions in Book V, the defense of mixed regimes in Books IV and VI, the design of the best city in Books VII–VIII. Every later argument cites these six types. The six-regime taxonomy is the most influential contribution of <em>Politics</em> to subsequent political thought — cited in Cicero, in Aquinas, in Montesquieu, in every serious treatise on government written before the twentieth century.`,
      ],
      where: [
        { n: 3, label: 'Book III (the taxonomy)' },
        { n: 4, label: 'Book IV (varieties of democracy and oligarchy)' },
        { n: 5, label: 'Book V (how regimes fall)' },
      ],
    },
    {
      slug: 'middle-class',
      title: 'The Middle Class as Stabilizer',
      greek: 'the regime that lasts is the one where the middle is strongest',
      preview: 'Book IV\'s most modern-sounding claim: cities are stabilized not by philosopher-kings or democratic majorities but by a large and prosperous middle group who have too much to lose and too little to envy.',
      essay: [
        `Book IV advances the most modern-sounding claim in the work. Cities, Aristotle observes, contain rich, poor, and a middle group, and the regime that lasts is the one in which the middle is largest and strongest. The reason is psychological as much as economic. The very rich do not know how to obey, only how to command, and they command despotically. The very poor are too abject to command and submit slavishly. Both classes hate one another rather than trusting one another, and a city of masters and slaves is not a city but a confederation of resentments.`,
        `The middle citizen, who possesses moderate property, has experience of both ruling and being ruled, listens to reason without reaching for either condescension or envy, and forms friendships across class lines because he is neither a target nor a threat. Aristotle therefore argues that polity — the constitution that mixes oligarchic and democratic elements — is best for most actual cities, and that within polity the middle should hold the balance of power.`,
        `Where the middle is weak, regimes oscillate between oligarchy and democracy and eventually fall to tyranny. Where it is strong, the city resists revolution because its sovereign group has too much to lose and not enough to envy. Aristotle draws this not from abstract principle but from his survey of Greek cities — Sparta, Athens, Carthage, Crete, and dozens of smaller poleis examined for what made them stable or unstable.`,
        `The argument is empirical, drawn from observation, and remains the most-cited passage of <em>Politics</em> in modern political theory. Aristotle is not the first defender of moderation, but he is the first to ground it in class structure rather than temperament. The claim that political stability depends on a large middle class recurs in Tocqueville, in Weber, and in virtually every empirical political scientist of the twentieth century.`,
      ],
      where: [
        { n: 4, label: 'Book IV (polity and the middle class)' },
        { n: 5, label: 'Book V (revolution and its causes)' },
        { n: 6, label: 'Book VI (best democracy)' },
      ],
    },
    {
      slug: 'slavery',
      title: 'Slavery, Stated Plainly',
      greek: '"Some are marked out for subjection from the hour of their birth"',
      preview: 'Book I contains the passage every honest reader of Politics must confront. Aristotle argues that some human beings are slaves by nature — born without the deliberative capacity to govern themselves. The defense fails on its own terms.',
      essay: [
        `Book I contains the passage every honest reader of <em>Politics</em> has to confront. Aristotle argues that some human beings are slaves by nature: born with deliberative faculties so weak that they can perceive reason in others but cannot exercise it themselves, they are instruments of action much as an ox is, and their condition is therefore both expedient and just. The master-slave relationship belongs in the foundations of the household, alongside marriage and parenthood.`,
        `He distinguishes natural slavery from the conventional slavery of war captives — concedes, with caution, that not every actual slave is a slave by nature, and that enslaving the wrong people is unjust. But the category itself stands. He uses it to justify the household structure that he then scales up through the village to the city. The defense of natural slavery is not a footnote; it is load-bearing.`,
        `The defense fails on its own terms. Aristotle's empirical method, applied honestly, ought to have shown him slaves who reasoned as well as their masters; he had Greek slaves and Persian masters within reach. It also fails on his teleological terms: the same logos that makes man a political animal cannot be present in some humans and absent in others without making the absent group not fully human — which contradicts the claim that they are human beings at all.`,
        `Later Aristotelians, including medieval commentators and the Spanish defenders of indigenous rights against the conquistadors, had to dismantle this part of the work to save the rest. The modern reader has to read it whole rather than excise it. The same mind that produced the middle-class argument and the empirical method produced this. <em>Politics</em> is not improved by pretending otherwise.`,
      ],
      where: [
        { n: 1, label: 'Book I (the argument for natural slavery)' },
        { n: 3, label: 'Book III (who counts as a citizen)' },
        { n: 7, label: 'Book VII (the best city and its labor)' },
      ],
    },
    {
      slug: 'foil-to-republic',
      title: 'Foil to the Republic',
      greek: '"That which is common to the greatest number has the least care bestowed upon it"',
      preview: 'Aristotle spent twenty years in Plato\'s Academy. Book II is his settled disagreement with his teacher. The contrast — empirical vs. idealist, pluralistic vs. unitary — organizes the entire work.',
      essay: [
        `Aristotle spent twenty years in Plato's Academy. Book II of <em>Politics</em> is his settled disagreement with his teacher, and the contrast organizes the entire work. Plato's <em>Republic</em> builds a city in speech around a single principle of justice and proposes communism of property, women, and children for the guardian class. Aristotle objects on every front.`,
        `Communism of property destroys the pleasure of giving and the exercise of liberality; what is held in common is cared for by no one. Communism of women and children dilutes affection until it evaporates — a son who is everyone's son is no one's son. Plato's unification of the city collapses the distinction between household and polis, treating the city as if it were a larger family, when in fact a city is a community of unlike members and ceases to be a city when it becomes too unified. "A state is not made up only of so many men, but of different kinds of men," Aristotle writes. "Similars do not constitute a state."`,
        `Underneath these specific objections lies a deeper methodological quarrel. Plato asks what justice is and builds outward from the answer. Aristotle gathers constitutions, observes how they actually behave, and reasons from the data. Plato's philosopher-king rules by knowing the form of the good. Aristotle's polity is governed by laws, rotating offices, and the practical wisdom of citizens who know one another. The <em>Republic</em> is utopian and centripetal; <em>Politics</em> is empirical and pluralistic.`,
        `Book II also examines the constitutions of Sparta, Crete, and Carthage — and the proposed constitutions of Phaleas and Hippodamus — measuring each against what cities actually need. The result is not cynicism but realism: the best constitution is not the most beautiful in abstraction but the best achievable by real human beings in real circumstances. Reading the two books together is one of the great experiences in Western philosophy.`,
      ],
      where: [
        { n: 2, label: 'Book II (critique of Plato and existing constitutions)' },
        { n: 3, label: 'Book III (citizen and constitution defined)' },
        { n: 7, label: 'Book VII (Aristotle\'s own ideal)' },
      ],
    },
  ],

  keyFigures: [
    { name: 'Aristotle', role: 'Author', body: `Born 384 BCE in Stagira on the Macedonian frontier. Spent twenty years in Plato's Academy in Athens, then served as tutor to Alexander the Great before founding the Lyceum. <em>Politics</em> belongs to his mature period and draws on a lost survey of one hundred and fifty-eight constitutions. He is systematic, taxonomic, and relentlessly argumentative — the mind that classifies is also the mind that challenges every classification he inherits.` },
    { name: 'Plato', role: 'Teacher and principal foil', body: `Aristotle's teacher for two decades and the unnamed antagonist of Book II. The <em>Republic</em> supplies the model city Aristotle dismantles, and the <em>Laws</em> receives more sympathetic but still critical treatment. Every major argument in <em>Politics</em> is in some sense a reply to Plato — about method, about property, about the unity of the city, about the role of philosophy in governance.` },
    { name: 'Solon', role: 'Athenian lawgiver', body: `Sixth-century reformer Aristotle treats with respect throughout. Solon abolished debt slavery, gave the poor a share in juries and assemblies without handing them the highest offices, and produced what Aristotle reads as a mixed constitution — a model for moderate democracy reformed toward polity. The ideal Aristotle defends in Books IV–VI has Solon's Athens somewhere in its genealogy.` },
    { name: 'Hippodamus of Miletus', role: 'City planner and constitutional theorist', body: `Fifth-century architect who designed Piraeus on a grid plan and proposed an ideal constitution dividing citizens into three classes: artisans, farmers, soldiers. Aristotle examines his scheme in Book II and finds it ingenious but unworkable — particularly the proposal that public benefactors be honored by communal vote, which would open the door to endless litigation.` },
    { name: 'Sparta, Athens, Carthage', role: 'Comparative cases', body: `The three constitutions Aristotle returns to most often. Sparta as a mixed regime decaying through demographic collapse and the unchecked power of its women and ephors. Athens as a democracy that has slid toward extremism. Carthage as the rare non-Greek case Aristotle takes seriously — aristocratic, stable, but tilting oligarchic through the influence of wealth. All three are measured against the standard established in Book III.` },
  ],

  castSubtitle: 'Authors, lawgivers, and constitutions — the cast of Aristotle\'s political science.',
  castLead: `<p><em>Politics</em> is a treatise, not a drama, and its cast is unusual: historical lawgivers, rival philosophers, and the constitutions of real cities serve as its characters. Aristotle moves through them empirically, praising what works, dissecting what fails, always asking the same question: in whose interest does this regime actually govern?</p>`,

  castGroups: [
    {
      label: 'The philosophers',
      characters: [
        { id: 'aristotle', tag: 'AUTHOR', name: 'Aristotle', epithet: 'The systematic critic', body: `The author, present on every page through his method. Aristotle never addresses the reader directly in the first person for long, but his voice is unmistakable: taxonomic, comparative, relentlessly willing to follow an argument to an uncomfortable conclusion. He classifies regimes, dissects constitutions, defends the middle class, and argues for natural slavery — all in the same measured tone.`, appears: [1, 2, 3, 4, 5, 6, 7, 8] },
        { id: 'plato', tag: 'FOIL', name: 'Plato', epithet: 'The idealist teacher', body: `Named and unnamed throughout. Book II is the direct engagement with the <em>Republic</em> and the <em>Laws</em>. Aristotle's critique is not that Plato is wrong to care about justice, but that his method — build from a single principle outward — produces conclusions that collapse when tested against actual cities and actual human beings.`, appears: [2, 3, 7] },
      ],
    },
    {
      label: 'The lawgivers',
      characters: [
        { id: 'solon', tag: 'LAWGIVER', name: 'Solon', epithet: 'Architect of Athenian moderation', body: `Sixth-century reformer who features as Aristotle's model of measured constitutional change. Abolishing debt slavery and extending jury service to the poor without surrendering the highest offices — this is the kind of reform Aristotle defends in Books IV and VI: improvement within the existing constitution rather than revolutionary replacement.`, appears: [2, 3, 6] },
        { id: 'hippodamus', tag: 'THEORIST', name: 'Hippodamus of Miletus', epithet: 'Grid planner and constitutional innovator', body: `Designed the harbor district of Athens and proposed dividing the city into three classes — artisans, farmers, warriors — with corresponding land divisions. Aristotle examines his proposals in Book II with a mixture of respect for the systematic impulse and skepticism about the practical details. Hippodamus is the first political theorist to separate architecture from politics and then reunite them.`, appears: [2] },
      ],
    },
    {
      label: 'The constitutions',
      characters: [
        { id: 'sparta', tag: 'CASE STUDY', name: 'Sparta (Lacedaemon)', epithet: 'The mixed regime in decay', body: `Sparta is Aristotle's most complex case. He acknowledges its mixed constitution, its stability, and its military achievement, then systematically dismantles it: the ephors are too powerful and too corruptible; the women are unregulated and subvert the regime's aims; the helot system is a constant source of instability; the educational system, excellent at producing soldiers, produces nothing else. Sparta optimized for war and thereby became unfit for peace.`, appears: [2, 5, 6, 7, 8] },
        { id: 'carthage', tag: 'CASE STUDY', name: 'Carthage', epithet: 'The non-Greek success', body: `The one non-Greek constitution Aristotle takes seriously as a well-governed state. He finds it aristocratic in structure but tilting oligarchic through the purchase of offices by wealth. The Carthaginian example matters because it tests whether Aristotle's categories apply beyond the Greek world — and he concludes they do, with the same corruptions producing the same instabilities.`, appears: [2, 5] },
        { id: 'athens', tag: 'CASE STUDY', name: 'Athens', epithet: 'The democracy that overreached', body: `Athens appears throughout as the prime example of a democracy that has crossed into its corrupt form. Aristotle does not deny Athens's achievements — Solon's reforms were admirable — but the post-Periclean development toward radical democracy, with pay for jury service drawing the idle poor into the courts and assembly, is for Aristotle the model of a regime pursuing the interest of one class rather than the common good.`, appears: [3, 4, 5, 6] },
      ],
    },
  ],

  cast: [
    {
      name: 'Aristotle',
      role: 'AUTHOR',
      description: 'Born 384 BCE in Stagira, on the Macedonian frontier. Spent twenty years in Plato\'s Academy in Athens, then served as tutor to Alexander the Great. Returned to Athens to found the Lyceum. Politics belongs to his middle and late period, drawn from a lost survey of one hundred and fifty-eight constitutions.'
    },
    {
      name: 'Plato',
      role: 'TEACHER & FOIL',
      description: 'Aristotle\'s teacher for two decades and the unnamed antagonist of Book II. The Republic supplies the model city Aristotle dismantles, and the Laws supplies the second model he treats more sympathetically but still rejects. Every major argument in Politics is in some sense an answer to Plato.'
    },
    {
      name: 'Hippodamus of Miletus',
      role: 'CITY PLANNER',
      description: 'Fifth-century architect who designed Piraeus and Thurii on a grid plan and proposed an ideal constitution dividing citizens into three classes — artisans, farmers, soldiers. Aristotle examines his scheme in Book II and finds it ingenious but unworkable, particularly the proposal that public benefactors be honored by communal vote.'
    },
    {
      name: 'Solon',
      role: 'ATHENIAN LAWGIVER',
      description: 'Sixth-century reformer Aristotle treats with respect throughout. Solon abolished debt slavery, gave the poor a share in juries and assemblies without handing them the highest offices, and produced what Aristotle reads as a mixed constitution. The model for moderate democracy reformed toward polity.'
    },
    {
      name: 'Sparta, Athens, Carthage',
      role: 'COMPARATIVE CASES',
      description: 'The three constitutions Aristotle returns to most often. Sparta as a mixed regime decaying through demographic collapse and the over-reach of its women. Athens as a democracy that has slid toward extremism. Carthage as the rare non-Greek case Aristotle treats as serious — aristocratic, stable, but tilting oligarchic through the influence of wealth.'
    }
  ],

  chapters: [
    {
      n: 1,
      title: 'Book I — The Household and Its Parts',
      tourTitle: 'The household and its parts',
      hook: 'Every state is a community aimed at some good. To understand the state, Aristotle starts smaller: the household, the slave, the wife, and the question of whether anyone is a slave by nature.',
      tour: `Book I makes three moves. First, the genetic argument: household to village to city, each stage natural, the city existing not for mere life but for the good life. Man, the creature with logos, is by nature a political animal — whoever lacks the city is either beast or god. Second, the defense of natural slavery: some are born to be governed rather than to govern; the master-slave relation is part of the household's natural structure. Third, the critique of unlimited wealth-acquisition: the art of making money has no natural limit, unlike the art of managing a household, and the confusion of the two corrupts private life before it corrupts politics. Start here — the foundations are necessary for everything that follows.`,
      blurb: `Aristotle builds the city out of households and builds households out of three pairs: man and woman, master and slave, parent and child. The genetic argument culminates in the claim that man is by nature a political animal. Then the hard part: the defense of natural slavery.`,
      summary: [
        `Book I opens with a claim that organizes the entire work: every community aims at some good, and the city, which is the highest community, aims at the highest good. Aristotle immediately distinguishes this from his opponents' view — that statesman, king, household manager, and master are all just variations on the same role, differing only in the number of people they rule. This is wrong, he says. Governments differ in kind, and the city differs in kind from the household. To see this clearly, we must resolve the compound into its simplest elements.`,
        `The simplest elements are two pairs: male and female (for reproduction) and master and slave (for preservation). These combine into the household. Households combine into villages; villages into the city, which is the first community self-sufficient for the good life. Since the city is the completion of a natural process, it exists by nature. Man, the creature who alone possesses logos — speech capable of arguing about the just and the unjust — is by nature a political animal. The person who has no need of the city is not fully human. The person who has no capacity for it is not human at all.`,
        `The bulk of Book I deals with two sub-arguments. The first is the defense of natural slavery: some human beings are by nature instruments of action rather than agents, and the master-slave relation is therefore natural and just — though Aristotle concedes that convention often enslaves those who are not natural slaves, which is unjust. The second is the critique of wealth-acquisition: household management has a natural limit (providing for the family), but the art of making money has no limit, and those who confuse wealth with the good life are pursuing something empty. Book I ends with the management of the household as the foundation from which political science must begin.`,
      ],
      appears: [
        { id: 'aristotle', name: 'Aristotle' },
        { id: 'plato', name: 'Plato' },
      ],
      themes: [
        { slug: 'natural-city', label: 'The city by nature' },
        { slug: 'slavery', label: 'Natural slavery' },
      ],
    },
    {
      n: 2,
      title: 'Book II — What Has Been Proposed',
      tourTitle: 'Critiquing Plato and the legislators',
      hook: 'Aristotle surveys the field — Plato\'s Republic and Laws, Phaleas on property, Hippodamus on city planning, Sparta, Crete, Carthage — and finds every proposal faulty in instructive ways.',
      tour: `Book II is a systematic survey and critique. Aristotle begins with the sharpest case — Plato's community of wives, children, and property in the Republic — and works outward through the Laws, through the proposals of Phaleas and Hippodamus, and then through the constitutions of Sparta, Crete, and Carthage. Each is measured against the same standard: does it actually serve the common good, and does it hold together in practice? The answer in every case is no, but the reasons differ, and each critique teaches something about what a good constitution requires. This book is where Aristotle's empirical method first shows itself against Plato's idealism.`,
      blurb: `Aristotle tears apart Plato's community of property, wives, and children, then examines the constitutions of Sparta, Crete, and Carthage. Every proposal has something to teach; none is adequate. The critique clears the ground for Aristotle's own political science.`,
      summary: [
        `Book II opens with the central question of political design: should citizens have all things in common, some things, or nothing? Aristotle begins with Plato's radical proposal in the Republic — communism of property, wives, and children for the guardian class. He objects on three grounds. First, communism of property destroys the pleasure of generosity and the virtue of liberality, since both require private ownership. Second, what is held in common is cared for by no one — "the greatest number of owners means the least amount of care." Third, communism of wives and children dilutes affection to the point of disappearance: a son who belongs to everyone is no one's son.`,
        `Plato's Laws receives a more sympathetic reading — its proposal for private property with restricted use is closer to Aristotle's own view — but still falls short. Aristotle then turns to the proposals of Phaleas of Chalcedon, who thought equal property would eliminate political conflict, and Hippodamus of Miletus, who divided the city into three classes and proposed a system of communal deliberation. Both are criticized for misunderstanding where political conflict actually comes from: not property inequality alone, but the desires of men for more than they need.`,
        `The second half of Book II examines actual constitutions: Sparta, praised for its mixed structure but criticized for its treatment of women, its demographic collapse, and the excessive power of the ephors; Crete, similar to Sparta in design but more haphazard; Carthage, the one non-Greek constitution Aristotle takes seriously. Each case demonstrates that stability depends not on any single institutional design but on the balance of classes and interests within the city. The survey ends with a brief note on earlier legislators — Solon, Charondas, and others — whose reforms are partial evidence of what a good constitution might look like.`,
      ],
      appears: [
        { id: 'plato', name: 'Plato' },
        { id: 'hippodamus', name: 'Hippodamus of Miletus' },
        { id: 'sparta', name: 'Sparta' },
        { id: 'carthage', name: 'Carthage' },
        { id: 'solon', name: 'Solon' },
      ],
      themes: [
        { slug: 'foil-to-republic', label: 'Foil to the Republic' },
        { slug: 'six-constitutions', label: 'Six constitutions' },
      ],
    },
    {
      n: 3,
      title: 'Book III — The Citizen and the Constitution',
      tourTitle: 'The citizen and the six constitutions',
      hook: 'What is a citizen? What are the forms of government? Book III is the theoretical core of the entire work — the classification that makes the rest of political science possible.',
      tour: `Book III is where the argument becomes a science. Aristotle begins with the definition of the citizen — not just someone who lives in a city, but someone who shares in deliberative and judicial office — and notes that the definition varies by constitution. Then he builds the taxonomy: who rules, and in whose interest? The six regime types follow, with the crucial claim that the three sound forms aim at the common good and the three corrupt forms serve the rulers' private interest. Book III ends with the question of who should hold sovereign power — the laws, the best man, the best few, or the many — and argues that the rule of law is better than the rule of any single person, however excellent.`,
      blurb: `The theoretical core of Politics. Aristotle defines the citizen, classifies the six forms of government (three sound, three corrupt), and argues that distributive justice — giving to each in proportion to what they contribute — is the ground of legitimate constitutional rule.`,
      summary: [
        `Book III opens with the question that any political science must answer: what is a state, and who is a citizen? Aristotle's answer is precise. The citizen is not merely a resident or a party to legal proceedings — resident aliens and slaves share the place but are not citizens. The citizen in the strict sense is one who shares in deliberative or judicial office — who participates in the governance of the community. This definition, Aristotle notes, applies most naturally to democracy and must be modified for other constitutions.`,
        `From the definition of the citizen, Aristotle moves to the definition of the constitution. A constitution is the arrangement of offices in a city, especially the arrangement of the sovereign office. Two questions classify any constitution: how many rule, and in whose interest? The answer gives six types: monarchy (one, for the common good), tyranny (one, for the ruler's benefit), aristocracy (few, for the common good), oligarchy (few, for the wealthy), polity (many, for the common good), and democracy (many, for the poor). The three deviations are not merely different forms but corruptions — they have turned the aim of rule from the common good to a private interest.`,
        `The second half of Book III addresses the question of distributive justice in politics: if the good things of the city are to be distributed, on what basis? The democrats say numerical equality — each person counts as one. The oligarchs say proportional inequality — those with more property have more claim. Aristotle says both are partially right: justice is proportional, but the relevant proportion is not wealth or birth alone. The end of the city is the good life, and those who contribute most to that end — whether through virtue, wealth, or numbers — have the strongest claim to a share in rule. The book ends with the argument that the rule of law is superior to the rule of any individual, however excellent: law is reason without appetite.`,
      ],
      appears: [
        { id: 'aristotle', name: 'Aristotle' },
        { id: 'solon', name: 'Solon' },
        { id: 'athens', name: 'Athens' },
        { id: 'sparta', name: 'Sparta' },
      ],
      themes: [
        { slug: 'six-constitutions', label: 'Six constitutions' },
        { slug: 'natural-city', label: 'The natural city' },
        { slug: 'foil-to-republic', label: 'Foil to the Republic' },
      ],
    },
    {
      n: 4,
      title: 'Book IV — The Varieties and the Best Practicable',
      tourTitle: 'Varieties of constitution and the best for most cities',
      hook: 'Not every city can be the best. Book IV asks what form of government is best for most cities under most conditions — and the answer is polity, with a strong middle class holding the balance.',
      tour: `Book IV is applied political science. Aristotle begins by noting that the political expert must understand not only what is best in the abstract but what is possible and attainable under actual conditions. He then works through the varieties of democracy (four types, from best to worst) and oligarchy (four types), argues that most people mistake the number of rulers for the essence of the constitution when the real distinction is between rule by the free and rule by the wealthy, and makes the case for polity — the mixed constitution — as the most stable and achievable form for most cities. The chapter on the middle class is the most-cited passage in the book.`,
      blurb: `Four types of democracy, four of oligarchy, and the argument for polity as the best practicable constitution. Book IV\'s central claim: cities are stabilized not by any ideal design but by a large middle class that has enough not to envy the rich and too much to join the poor.`,
      summary: [
        `Book IV opens with a methodological point. The political scientist, like the doctor or the trainer, must know not only what is absolutely best but what is best under given conditions — what constitution is best for this city, with these people, at this moment. The inquiry therefore has three levels: the absolutely best, the best under actual conditions, and the best achievable by any city with any starting point. Books I–III addressed the first; Books IV–VI address the second and third.`,
        `Most of Book IV works through the varieties of democracy and oligarchy. Aristotle identifies four types of democracy, ranging from the best (agricultural democracy, where the poor are too busy farming to attend the assembly and so leave effective power to the notable) to the worst (extreme democracy, where pay for assembly attendance floods governance with the idle urban poor). He identifies four types of oligarchy, ranging from moderate property qualifications to hereditary oligarchy to dynastic rule. In both cases, the varieties arise from the composition of the citizen body: different combinations of the poor, the middling, the rich, artisans, farmers, and merchants produce different constitutional mixtures.`,
        `The book's most important argument comes in the chapters on polity and the middle class. Polity — the mixed constitution that borrows elements from both oligarchy and democracy — is the most stable form for most cities because it is the constitution in which the middle class is strongest. The very rich and the very poor are both temperamentally unfit to govern well: the rich command despotically, the poor submit slavishly. The middle citizen, with moderate property and experience of both ruling and being ruled, governs in the interest of the whole. Cities in which the middle is small inevitably polarize between oligarchy and democracy and fall to tyranny. Cities in which it is large resist revolution because those who hold power have too much to lose and not enough to envy.`,
      ],
      appears: [
        { id: 'aristotle', name: 'Aristotle' },
        { id: 'athens', name: 'Athens' },
        { id: 'sparta', name: 'Sparta' },
      ],
      themes: [
        { slug: 'middle-class', label: 'The middle class as stabilizer' },
        { slug: 'six-constitutions', label: 'Six constitutions' },
      ],
    },
    {
      n: 5,
      title: 'Book V — Revolutions and Their Causes',
      tourTitle: 'Why regimes fall and how to preserve them',
      hook: 'Revolutions arise from inequality — actual or perceived. Book V is Aristotle\'s systematic account of why regimes change, what triggers them, and what holds them together.',
      tour: `Book V is the longest and most historically dense book in Politics. Aristotle identifies the general cause of revolution — the desire for equality when men feel unequally treated — and then works through specific causes: insolence, fear, love of superiority, contempt, disproportionate growth of one class, election intrigues, carelessness. He then examines how each type of constitution — democracy, oligarchy, aristocracy, tyranny, monarchy — characteristically fails and what preserves it. The material on how tyrants maintain power is the most unflinching political realism in the work.`,
      blurb: `Why do regimes fall? Book V surveys the causes of revolution across all constitution types — the desire for equality, disproportionate class growth, election manipulation, foreign intervention — and then examines what preserves each form of government. The section on tyranny is the most realist passage in the Politics.`,
      summary: [
        `Book V begins with a theoretical framing. All constitutions are based on some notion of justice and equality, but each embodies a partial view: democrats think that because men are equal in freedom they are equal in all things; oligarchs think that because they are unequal in wealth they are unequal in all things. Both are partially right and partially wrong, and the mismatch between a citizen's expectations and the reality of the constitution generates the revolutionary feeling. The general cause of revolution is the desire of equality or the desire of superiority — inferiors revolt to be equal, equals revolt to be superior.`,
        `Aristotle then specifies seven particular causes that trigger this general disposition: insolence, fear, love of superiority, contempt, disproportionate increase of one part of the state, electoral intrigue, carelessness about small changes, and the dissimilarity of the citizen body. He illustrates each with historical examples drawn from his survey of Greek cities — Sparta's ephors, Athens's demagogues, the Syracusan tyrannies, the Macedonian monarchies — producing the most historically detailed section in the work. The empirical method is at its most visible here.`,
        `The second half of Book V examines how each constitution characteristically fails and what preserves it. Democracies are preserved by moderation in their treatment of the wealthy; oligarchies by not over-reaching; aristocracies by attending to merit rather than birth or wealth. The section on tyranny is the most unsettling: Aristotle describes, without endorsing, how tyrants maintain power — by humiliating subjects, creating divisions among the elite, preventing the formation of friendships and civic associations, keeping people poor and busy, and surrounding themselves with informers. He then argues that the most durable tyrannies have been those that practiced a kind of moderation — not because moderation is good but because it is more effective. Political science in Book V is not comfortable reading.`,
      ],
      appears: [
        { id: 'aristotle', name: 'Aristotle' },
        { id: 'sparta', name: 'Sparta' },
        { id: 'athens', name: 'Athens' },
        { id: 'carthage', name: 'Carthage' },
      ],
      themes: [
        { slug: 'six-constitutions', label: 'Six constitutions' },
        { slug: 'middle-class', label: 'The middle class as stabilizer' },
      ],
    },
    {
      n: 6,
      title: 'Book VI — Organizing Democracies and Oligarchies',
      tourTitle: 'How to set up democracies and oligarchies well',
      hook: 'Given that most cities will be democracies or oligarchies, how should they be organized to be as stable and just as possible? Book VI is the practical manual.',
      tour: `Book VI is the shortest in the Politics and the most practical. Aristotle works through how to organize the institutions of democracy — the assembly, the law courts, the magistracies — to make democratic governance as stable and just as possible. The key move is separating the principle of liberty from the extreme application of that principle: the best democracy is not the one in which the demos has the most power but the one in which the demos governs most effectively, which means agricultural democracy where the poor are too busy to attend every session. He then gives parallel advice for oligarchies before ending with the question of how to organize the military offices across all constitution types.`,
      blurb: `The practical manual. Book VI works through how democracies and oligarchies should organize their institutions — assemblies, courts, magistracies, military offices — to be as stable as possible without becoming either extremist democracies or tightly controlled oligarchies.`,
      summary: [
        `Book VI opens by noting that the previous books have treated constitutions in terms of their principles; now the question is organizational. Given that a city is a democracy, how should it arrange its institutions? The foundation of democracy is liberty, which democrats interpret as ruling and being ruled in turn, and as living as one likes. From these two principles flow the characteristic institutions: election by lot, brief tenure of office, payment for attendance at assembly and courts, no property qualification for office, popular control of deliberation and judgment.`,
        `Aristotle argues that the best democracy is not the most thoroughgoing application of these principles but the most moderate. The best democratic population is an agricultural one: farmers are too busy to attend the assembly frequently, and so effective power rests with the notables and the more engaged citizens, while the demos retains the ability to elect magistrates and call them to account. This is the closest democracy comes to polity — and the furthest it stays from the extreme form, where payment for attendance floods the assembly with the idle poor and produces demagogic governance.`,
        `The parallel section on oligarchy makes the same argument: the best oligarchy is not the most exclusive but the most inclusive short of admitting the majority. The key institutional recommendations involve organizing the military offices across constitution types — cavalry in oligarchies, heavy infantry in polities and mixed regimes, light infantry and the navy in democracies — since the army is both a guarantee of security and a potential source of revolution. Book VI ends with the reminder that the best constitution cannot be maintained without the best administration of its institutions.`,
      ],
      appears: [
        { id: 'aristotle', name: 'Aristotle' },
        { id: 'athens', name: 'Athens' },
        { id: 'solon', name: 'Solon' },
      ],
      themes: [
        { slug: 'six-constitutions', label: 'Six constitutions' },
        { slug: 'middle-class', label: 'The middle class as stabilizer' },
      ],
    },
    {
      n: 7,
      title: 'Book VII — The Best State',
      tourTitle: 'The best city and the good life',
      hook: 'What would the ideal city look like if we could design it without constraints? Book VII is Aristotle\'s answer — and it begins not with institutions but with the question of what a good human life is.',
      tour: `Book VII is the most philosophical in the collection. Aristotle begins by insisting that political science cannot identify the best constitution without first determining the best life — for individuals and for the city as a whole. The answer: happiness is virtuous activity, and the best city is one that enables its citizens to live and act virtuously. He then specifies the conditions: population size (large enough for self-sufficiency, small enough for citizens to know one another), territory, access to the sea, the division of the citizen body. The book is more sketch than blueprint, but the sketch reveals what Aristotle thinks politics is ultimately for.`,
      blurb: `Book VII begins with the good life and works outward to the best city. Happiness is virtuous activity. The best city is one sized for genuine community, governed by citizens who take turns ruling and being ruled, and aimed at the life of peace and virtue rather than the life of military conquest.`,
      summary: [
        `Book VII opens with the claim that political inquiry cannot proceed without settling the prior question: what is the most eligible life? Aristotle begins his answer by dividing goods into three kinds — goods of the soul, goods of the body, and external goods — and arguing that happiness consists in having all three, though goods of the soul matter most. The happy person has virtue, wisdom, and enough external goods to exercise them. The same holds for cities: the best city is the one that enables its citizens to live and act in the best way, which means enabling virtue, not merely survival or wealth.`,
        `From this foundation Aristotle specifies the conditions of the best city. Size: large enough to be self-sufficient, small enough for citizens to know one another — since elections require knowledge of the candidates and courts require knowledge of the litigants. Territory: fertile enough for provision, but not so rich as to produce idleness; with access to the sea for trade, but not so dependent on maritime commerce as to produce a large and turbulent sailor class. Population: divided into the classes necessary for the city's functions — farmers, artisans, warriors, the wealthy, priests, and judges — but with citizenship restricted to warriors and those who deliberate.`,
        `The second half of Book VII addresses city planning — orientation, water supply, wall placement, the agora — and the beginning of the education discussion. The best city is aimed not at war and domination but at peace and the use of leisure, and its institutions must reflect this aim. The greatest failure of Sparta, Aristotle repeats, is that it optimized for war and produced citizens excellent at conflict and useless at everything else. The best city forms citizens capable of the full range of human excellence, not just the martial virtues. Book VII ends in the middle of the education discussion, which continues in Book VIII.`,
      ],
      appears: [
        { id: 'aristotle', name: 'Aristotle' },
        { id: 'sparta', name: 'Sparta' },
        { id: 'plato', name: 'Plato' },
      ],
      themes: [
        { slug: 'natural-city', label: 'The natural city' },
        { slug: 'foil-to-republic', label: 'Foil to the Republic' },
      ],
    },
    {
      n: 8,
      title: 'Book VIII — Education for Leisure',
      tourTitle: 'Education, music, and the good life',
      hook: 'The best city needs citizens shaped for the good life, not just for war. Book VIII is Aristotle\'s argument for why education must be public, and why music — of all things — is its highest form.',
      tour: `Book VIII is the most surprising and the most incomplete. Aristotle argues that education must be public — since citizens belong to the state rather than to themselves alone — and that it must aim at virtue and the proper use of leisure rather than mere utility or military fitness. He works through the four standard subjects (reading and writing, gymnastics, music, drawing) and spends most of the book on music, arguing that it is uniquely suited to forming character because it directly imitates and induces the emotions. The text breaks off in the middle of an account of the musical modes. It is the most unfinished book in an unfinished work — but the argument it makes, that the best education is liberal rather than vocational, is among the most influential in the Western tradition.`,
      blurb: `The best city educates its citizens for virtue and leisure, not just for war and work. Book VIII argues that education must be public and liberal — with music given unexpected prominence as the discipline that most directly shapes character and trains citizens for the proper use of free time.`,
      summary: [
        `Book VIII opens with the claim that education must be public. Citizens belong to the state, not merely to their parents; the care of each part of the city is inseparable from the care of the whole. The Spartans are praised for making education a state matter, though their content — focused entirely on the military virtues — is wrong. Education must not be exclusively directed to any single end, and certainly not to war, which is a means rather than an end. The end is peace, and the proper use of peace is leisure; education must therefore form citizens capable of using leisure well.`,
        `Aristotle works through the four conventional subjects. Reading and writing are necessary and useful, drawing is valuable for judging the beauty of the human form, and gymnastics contributes to health and courage — but none of these is the highest educational subject. That role belongs to music. Music is uniquely suited to education because it directly imitates and induces the emotions: rhythm and melody carry likenesses of anger, courage, temperance, and their opposites, and habituation in listening to them shapes character. This is why music should not be studied merely as entertainment or as a performing art but as a formative discipline.`,
        `The final sections of Book VIII work through the musical modes — Dorian for courage, Phrygian for enthusiasm, Mixolydian for sadness — and debate which are appropriate for education as opposed to performance and catharsis. Aristotle argues for a restricted curriculum: the Dorian mode for character formation, with other modes available for the trained adult listener but not for children. The text breaks off before the argument is complete. Whether this is because the work was unfinished, or because the remaining books have been lost, is uncertain. <em>Politics</em> ends not with a conclusion but in the middle of a sentence — which is, in its way, exactly right for a work that claims political science can never finish, only continue.`,
      ],
      appears: [
        { id: 'aristotle', name: 'Aristotle' },
        { id: 'sparta', name: 'Sparta' },
      ],
      themes: [
        { slug: 'natural-city', label: 'The natural city' },
        { slug: 'foil-to-republic', label: 'Foil to the Republic' },
      ],
    },
  ],
};
