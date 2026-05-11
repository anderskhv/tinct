// SEO content data for John Stuart Mill's On Liberty (1859).
// Five chapters. Voice: Victorian-precise, argumentative-but-civil, declarative.
// Schema matches hamlet.cjs (canonical reference).

module.exports = {
  id: 'on-liberty',
  title: 'On Liberty',
  author: 'John Stuart Mill',
  byline: '1859 · Victorian political philosophy',
  titleAccent: 'a guided tour',
  hook: 'One sentence does all the work: you may only be coerced to prevent harm to others. Everything else — your beliefs, your habits, your way of living — belongs to you. Mill wrote a short, exact book to say so, and the argument has not dated.',
  genre: ['Philosophy', 'Political theory', 'Victorian literature'],
  themesBlurb: 'Liberty, free speech, individuality, state power, the harm principle.',
  castBlurb: 'Victorian England',
  castDesc: 'The minds behind the argument.',
  castSubtitle: 'The minds behind the argument — and the society it was written against.',
  chapterLabel: n => 'Chapter ' + n,

  about: [
    'Mill writes <em>On Liberty</em> in 1859 as a pamphlet against a danger he thinks his contemporaries underestimate. The old fight against monarchs and magistrates is largely won. The new oppressor is opinion itself — the slow, suffocating pressure of a respectable majority on anyone who lives or thinks differently. Borrowing the phrase from Tocqueville, he calls this the tyranny of the majority, and he insists it can reach further than any law, because it follows a person into the home, the workshop, the conscience.',
    'Against this pressure he sets a single rule, stated early and held to throughout: the only purpose for which power can rightly be exercised over any member of a civilised community, against his will, is to prevent harm to others. A person\'s own good — bodily or mental — is not a sufficient warrant. From this harm principle Mill derives a sphere of liberty that society must not invade: liberty of conscience, of thought and expression, of tastes and pursuits, of association among consenting adults. Within that sphere a person may be wrong, eccentric, even self-destructive, and the law and the neighbours must let him be.',
    'The middle chapters argue the case piece by piece. Free discussion is defended on four grounds: a silenced opinion may be true; if false, it may contain part of the truth; even a wholly true opinion, if not contested, decays into prejudice; and held without struggle it loses its hold on conduct. Individuality is defended next, as the soil in which character grows. The final chapter applies the doctrine to trade, education, marriage, and the structure of state power, and warns against the quiet absorption of independent life into tidy administrative routine.',
  ],

  chaptersSubtitle: 'All five chapters — from the harm principle to its application in the cases.',
  chaptersLead: `<p>On Liberty is short and exactly organised. Chapter I states the question and the rule. Chapter II defends free expression at length, with four distinct arguments. Chapter III turns from speech to life: why individuality matters and how custom hollows it out. Chapter IV draws the line between what society may judge and what it may not coerce. Chapter V tests the doctrine in the cases — trade, schooling, marriage, vice — and closes with a warning about the administrative state. Five chapters, one sustained argument.</p>`,
  themesByline: 'Five threads through the argument',
  themesLead: `On Liberty is built around a single principle, but Mill is careful to show all the work the principle has to do. Each chapter adds a new angle on the same question: where does legitimate authority end and personal freedom begin?`,

  castLead: `<p>On Liberty is not a narrative — it has no cast of characters in the usual sense. But it has an intellectual household: the author and his collaborator, the philosophical tradition he is working within, and the social force he is arguing against. These are the figures worth knowing before you read.</p>`,

  groups: [
    { label: 'Part I · The principle', subtitle: 'The harm principle, the tyranny of the majority, and the sphere of liberty.', chapters: [1] },
    { label: 'Part II · The arguments', subtitle: 'Free expression defended on four grounds; individuality as a positive good.', chapters: [2, 3] },
    { label: 'Part III · The limits and the cases', subtitle: 'What society may and may not do; the doctrine tested in practice.', chapters: [4, 5] },
  ],

  themes: [
    {
      slug: 'harm-principle',
      title: 'The Harm Principle',
      greek: '"The only purpose for which power can be rightly exercised"',
      preview: 'One sentence does all the structural work of the book. Mill states it in Chapter I and holds to it throughout. The difficulty — which he acknowledges — is the line itself: what exactly counts as harm?',
      essay: [
        'The book is built around one sentence, and the sentence is meant to do real work. The only purpose for which power can be rightly exercised over any member of a civilised community against his will is to prevent harm to others. Everything in <em>On Liberty</em> either follows from this rule or marks its boundary.',
        'Mill is precise about what the rule excludes. A person\'s own good — physical, moral, prudential — is not a sufficient ground for compulsion. He may be remonstrated with, reasoned with, persuaded, entreated. He may not be forced. Coercion for his sake alone is, in Mill\'s view, an injury masquerading as care. The rule cuts in two directions. It restrains the state from legislating private virtue, and it restrains the citizen from organising society to enforce his preferences on neighbours who do him no damage.',
        'It also defines the terrain on which legitimate authority operates. Where harm to others begins — fraud, violence, broken contract, neglect of dependants — society may act without apology, and Mill is no anarchist about that side of the line. The difficulty, which he acknowledges, is the line itself. What counts as harm? Distress at another\'s opinion, embarrassment at his manners, a sense that public morals are slipping — these Mill refuses to accept as harms in the strict sense, because admitting them would dissolve the principle.',
        'Harm, for him, must be a definite damage to a definite interest of another person. Hold to that, and a sphere of inviolable individual life remains; loosen it, and the sphere shrinks to nothing. The precision is not pedantry. It is the only protection the principle has against the ingenuity of majorities who always believe their interference is for someone else\'s good.',
      ],
      where: [
        { n: 1, label: 'Ch. 1 (the principle stated)' },
        { n: 4, label: 'Ch. 4 (the line drawn)' },
        { n: 5, label: 'Ch. 5 (the principle in the cases)' },
      ],
    },
    {
      slug: 'tyranny-majority',
      title: 'Tyranny of the Majority',
      greek: '"The will of the most numerous or the most active part"',
      preview: 'Mill borrows the phrase from Tocqueville and gives it its sharpest formulation. In a democracy, the most pressing threat to liberty is not the king — it is respectable, unanimous, unexamined opinion.',
      essay: [
        'Mill borrows the phrase from Tocqueville and gives it its sharpest formulation. In a democracy, he warns, the most pressing threat to liberty is no longer the king or the magistrate. It is the majority itself — the public, opinion, society in its collective mood. The will of the people, he writes, practically means the will of the most numerous or the most active part of the people, and the people, consequently, may desire to oppress a part of their number.',
        'What makes the threat distinctive is its reach. A government can be argued with, voted against, restrained by constitution. Society, when it sets its face against an opinion or a way of life, leaves no formal door to knock on. It penalises by exclusion, ridicule, the lost job, the cooled friendship, the closed marriage market. Mill thinks this informal coercion goes deeper into character than statute does, because it shapes what people dare to think before they ever try to act.',
        'His Victorian England, prosperous and respectable and sure of itself, is the case in point. The danger is not that opinion is wrong, but that it is unanimous and unexamined, and presses down on every quiet dissenter without ever needing to draw a law. Liberty, on Mill\'s account, is therefore as much a defence against neighbours as against parliaments.',
        'The urgency of the argument is easy to miss today, because we associate liberty with the wrong enemy — the state, the policeman, the censor. Mill\'s point is that by the time the censor arrives, the work is largely done. Opinion has already done the shaping. The person who thinks differently has already learned not to say so.',
      ],
      where: [
        { n: 1, label: 'Ch. 1 (the diagnosis)' },
        { n: 2, label: 'Ch. 2 (the silenced opinion)' },
        { n: 3, label: 'Ch. 3 (conformity and character)' },
      ],
    },
    {
      slug: 'free-speech',
      title: 'Why Free Speech Matters',
      greek: '"The peculiar evil of silencing the expression of an opinion"',
      preview: 'Mill defends free expression on four distinct grounds — none of them the right to be heard. The argument is epistemic: we are fallible, truth is corrected by friction, and the costs of suppression always exceed the costs of permitting bad ideas.',
      essay: [
        'The chapter Of the Liberty of Thought and Discussion is the longest and the most carefully reasoned in the book, because Mill thinks free expression is the precondition of every other freedom worth having. He defends it on four grounds, and he wants all four to bear weight.',
        'First: the silenced opinion may be true. To silence it is to assume our own infallibility, and history is the long record of how badly that assumption ages. Socrates was condemned by Athens. Marcus Aurelius persecuted the Christians. Galileo was forced to recant. The assumption of infallibility is no less dangerous because the majority holds it. Second: even if the suppressed opinion is false, it may contain a portion of truth. Prevailing opinion is rarely the whole truth, and it is only by the collision of ideas that the remainder is made up.',
        'Third: an opinion that is true but never contested decays into prejudice — held by rote, without grasp of its grounds, defenceless against intelligent attack. Fourth: the meaning of a true doctrine begins to fade when it is not continuously defended. It becomes a formula, recited without force on conduct. Notice what Mill is not saying. He is not arguing that speech feels good, or that we have a right to be heard. His argument is instrumental and epistemic.',
        'We are fallible; truth is corrected only by the friction of opposing views; therefore the costs of suppression always exceed the costs of letting bad ideas speak. The four arguments together make free discussion not a polite ornament of liberal society but the working machinery by which any society capable of correcting itself stays so.',
      ],
      where: [
        { n: 2, label: 'Ch. 2 (all four arguments)' },
        { n: 4, label: 'Ch. 4 (limits of social pressure)' },
      ],
    },
    {
      slug: 'individuality',
      title: 'Individuality Against Conformity',
      greek: '"He who lets the world choose his plan of life for him"',
      preview: 'Of Individuality is the chapter that surprises modern readers. Mill does not assume individuality is valued — he argues for it. The faculties grow only by use, and custom, if left unchecked, hollows character to nothing.',
      essay: [
        'Of Individuality is the chapter that surprises modern readers, because it argues for something they assume Mill takes for granted: that being a distinct person, with one\'s own tastes and projects and oddities, is a positive good and not merely a tolerated nuisance. He thinks the opposite assumption is winning. Custom, respectability, and the sheer mass of average opinion press every life toward a common pattern, and the people inside that pattern stop noticing they are being shaped by it.',
        'He who lets the world choose his plan of life for him, Mill writes, has no need of any other faculty than the ape-like one of imitation. The faculties — observation, reasoning, judgment, discrimination, even moral preference — are exercised only in making a choice. A person who makes none exercises none, and his character grows narrow and weak by disuse.',
        'The defence of individuality is therefore not a celebration of mere quirk. Mill admits that genius is rare and most lives will not be original in any large sense. The point is that society needs the soil in which originality can grow when it does appear, and the same soil — room to be different, freedom to experiment with one\'s own life — is what allows ordinary character to develop at all.',
        'The eccentric is not the goal but the proof. Where eccentricity is feared, the average has already been flattened. The freedom Mill defends is not freedom to be like oneself once and for all, but freedom to become someone in the first place. A society that closes that space, however gradually and however reasonably, diminishes every person within it.',
      ],
      where: [
        { n: 3, label: 'Ch. 3 (the full argument)' },
        { n: 4, label: 'Ch. 4 (limits of social authority)' },
        { n: 5, label: 'Ch. 5 (education and the state)' },
      ],
    },
    {
      slug: 'state-action',
      title: 'The Limits of State Action',
      greek: '"The worth of a state, in the long run, is the worth of the individuals composing it"',
      preview: 'The harm principle does not abolish the state — it directs it. Mill works through the cases: trade, education, marriage, drink, vice. The book closes with a warning about the administrative state that does everything and, in doing so, loses the citizens it was built to serve.',
      essay: [
        'The final chapter turns from principle to application, and Mill is careful to show that his doctrine has limits as well as reach. The harm principle does not abolish the state; it directs it. Where one person\'s conduct injures the definite interests of another, society may interfere as a matter of right. Where conduct concerns only the agent himself, society has no jurisdiction, however much it disapproves.',
        'Mill works through the cases. Trade is a social act and falls under the rule of preventing harm, but most restrictions on trade are bad policy, not violations of liberty as such. Education he treats sharply: the state may require that children be educated, because failure to do so is a wrong against the child, but it should not monopolise the schools, because uniform state education manufactures uniform minds.',
        'Marriage, drink, gambling, and the regulation of vice he treats one by one, refusing the easy moralism of his age and refusing also the lazy libertarianism that would deny every civic claim. Each case gets its own answer, and the answers are not comfortable. Mill is neither a moralist who wants law to enforce virtue nor a libertarian who denies every social obligation.',
        'Behind the cases stands a steady warning that is the book\'s deepest argument. A government that absorbs into itself every able person and every important task may run things efficiently for a while, but it dries up the springs of independent life on which its own renewal depends. A state that does everything for its citizens eventually cannot be corrected by them. Liberty, in the end, is not only good for the person who exercises it. It is the condition of a society that remains capable of changing its mind.',
      ],
      where: [
        { n: 4, label: 'Ch. 4 (authority and its limits)' },
        { n: 5, label: 'Ch. 5 (the cases and the warning)' },
      ],
    },
  ],

  cast: [
    {
      name: 'John Stuart Mill',
      role: 'AUTHOR',
      body:
        'Educated by his father from the cradle in classical languages and political economy, Mill is by 1859 the most careful liberal mind in England. He writes On Liberty in middle age, after a long crisis and a long marriage of the intellect, and gives it the brevity of a man who has been thinking it for thirty years. The voice in the book is exact, measured, willing to concede every fair objection before pressing on.',
    },
    {
      name: 'Harriet Taylor Mill',
      role: 'CO-AUTHOR',
      body:
        'Mill names her on the dedication page as joint author of all that is best in his writings, and of On Liberty in particular. They thought through the book together over many years; she died in 1858, and Mill published it the next year as a kind of monument. Whatever the precise division of pen and idea, he insists that the doctrine of the book is not his alone, and the reader is asked to take that claim seriously.',
    },
    {
      name: 'Jeremy Bentham',
      role: 'PREDECESSOR',
      body:
        'The founder of utilitarianism and the formative influence on Mill\'s upbringing. Bentham\'s greatest-happiness principle stands behind On Liberty as the deepest moral premise — Mill grounds his argument in utility, not in natural rights. But Mill\'s utility is broader than Bentham\'s, large enough to include the development of character and the long-term interests of a progressive being, and it is that wider utility that the book is designed to serve.',
    },
    {
      name: 'Alexis de Tocqueville',
      role: 'INFLUENCE',
      body:
        'The French observer of American democracy whose Democracy in America gave Mill the phrase tyranny of the majority and the diagnosis behind it. Tocqueville saw that equality of condition could produce a softer, more pervasive coercion than any aristocratic regime had managed, because it operated through manners and opinion rather than through edict. Mill takes the warning into English life and makes it the central political fear of the book.',
    },
    {
      name: 'Victorian Society',
      role: 'ANTAGONIST',
      body:
        'The book\'s real opponent is not a person but a climate — respectable, prosperous, evangelical, intensely conscious of its own decency, and convinced that a well-ordered society is one in which everyone behaves much like everyone else. It legislates dress, Sabbath, drink, sexual conduct, and family form, and exerts on private life a pressure no court ever ratifies. Against this climate Mill writes, and the precision of his prose is itself a small refusal of its tone.',
    },
  ],

  castGroups: [
    {
      label: 'The argument\'s authors',
      characters: [
        {
          id: 'mill',
          tag: 'AUTHOR',
          name: 'John Stuart Mill',
          epithet: 'Author',
          body: 'Educated by his father from the cradle in classical languages and political economy, Mill is by 1859 the most careful liberal mind in England. He writes On Liberty in middle age, after a long crisis and a long marriage of the intellect, and gives it the brevity of a man who has been thinking it for thirty years. The voice in the book is exact, measured, willing to concede every fair objection before pressing on.',
          appears: [1, 2, 3, 4, 5],
        },
        {
          id: 'harriet',
          tag: 'CO-AUTHOR',
          name: 'Harriet Taylor Mill',
          epithet: 'Co-author',
          body: 'Mill names her on the dedication page as joint author of all that is best in his writings, and of On Liberty in particular. They thought through the book together over many years; she died in 1858, and Mill published it the next year as a kind of monument. Whatever the precise division of pen and idea, he insists that the doctrine of the book is not his alone.',
          appears: [1],
        },
      ],
    },
    {
      label: 'The intellectual tradition',
      characters: [
        {
          id: 'bentham',
          tag: 'PREDECESSOR',
          name: 'Jeremy Bentham',
          epithet: 'Founder of utilitarianism',
          body: 'The founder of utilitarianism and the formative influence on Mill\'s upbringing. Bentham\'s greatest-happiness principle stands behind On Liberty as the deepest moral premise — Mill grounds his argument in utility, not in natural rights. But Mill\'s utility is broader than Bentham\'s, large enough to include the development of character and the long-term interests of a progressive being.',
          appears: [1],
        },
        {
          id: 'tocqueville',
          tag: 'INFLUENCE',
          name: 'Alexis de Tocqueville',
          epithet: 'Author of Democracy in America',
          body: 'The French observer of American democracy whose Democracy in America gave Mill the phrase tyranny of the majority and the diagnosis behind it. Tocqueville saw that equality of condition could produce a softer, more pervasive coercion than any aristocratic regime had managed, because it operated through manners and opinion rather than through edict.',
          appears: [1, 2],
        },
      ],
    },
    {
      label: 'The antagonist',
      characters: [
        {
          id: 'victorian-society',
          tag: 'ANTAGONIST',
          name: 'Victorian Society',
          epithet: 'The pressure Mill is writing against',
          body: 'The book\'s real opponent is not a person but a climate — respectable, prosperous, evangelical, intensely conscious of its own decency, and convinced that a well-ordered society is one in which everyone behaves much like everyone else. It legislates dress, Sabbath, drink, sexual conduct, and family form, and exerts on private life a pressure no court ever ratifies.',
          appears: [1, 2, 3, 4, 5],
        },
      ],
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'Introductory',
      tourTitle: 'The question and the rule',
      hook: 'Not the old fight against kings — a new danger: opinion itself, pressing on every life that dares to be different. Mill names it, then sets a single rule to meet it.',
      tour: 'Chapter I fixes the question and states the principle. Mill opens by tracing the historical shift from liberty-against-rulers to the new problem of liberty-against-majorities. The tyranny of the majority, borrowed from Tocqueville, is the central diagnosis: in a democracy, informal coercion through opinion can reach further than any law. Against this he sets the harm principle in its full form, then marks out the inner sphere — liberty of conscience, of thought, of tastes and pursuits, of voluntary association — that the book will defend throughout. Read slowly: the first chapter is a compressed manifesto, and every subsequent argument refers back to it.',
      blurb: 'Mill states the question and the principle. The fight is no longer against kings — it is against the tyranny of prevailing opinion. The harm principle is introduced, and the sphere of personal liberty is marked out.',
      summary: [
        'Mill opens by tracing the oldest theme in history: the struggle between liberty and authority. But its form has changed. Where once the fight was against rulers imposed from above, in a self-governing society the danger shifts — the people may oppress a part of themselves, and opinion may coerce more deeply than law. Borrowing the phrase from Tocqueville, he names this the tyranny of the majority, and insists it deserves as much vigilance as any exercise of formal power.',
        'Against this pressure he sets the harm principle: the only legitimate ground for compulsion is the prevention of harm to others. A person\'s own good — bodily or mental — does not justify coercion. He may be argued with, entreated, or avoided; he may not be forced. Within the sphere of self-regarding conduct, society has no rightful authority, however strongly it disapproves of what it finds there.',
        'Mill then marks out the inner sphere that the book will defend: liberty of conscience, of thought and expression, of tastes and pursuits, and of voluntary association among consenting adults. These, he argues, are the conditions under which character forms and self-determination is possible. Any society that invades them — even with the best intentions — diminishes the very persons it claims to be protecting.',
      ],
      appears: [
        { id: 'mill', name: 'John Stuart Mill' },
        { id: 'harriet', name: 'Harriet Taylor Mill' },
        { id: 'bentham', name: 'Jeremy Bentham' },
        { id: 'tocqueville', name: 'Alexis de Tocqueville' },
        { id: 'victorian-society', name: 'Victorian Society' },
      ],
      themes: [
        { slug: 'harm-principle', label: 'The Harm Principle' },
        { slug: 'tyranny-majority', label: 'Tyranny of the Majority' },
      ],
    },
    {
      n: 2,
      title: 'Of the Liberty of Thought and Discussion',
      tourTitle: 'The four arguments for free speech',
      hook: 'Why must we allow opinions we think are wrong? Mill gives four answers, and he wants all four to carry weight. The argument is not about rights — it is about how truth survives.',
      tour: 'The longest chapter and the most quoted. Mill defends free expression on four distinct grounds: the silenced opinion may be true; if false, it may contain part of the truth; if wholly true but uncontested, it stiffens into prejudice; and even held as truth, without struggle, it loses living force on conduct. He runs each argument at length, with historical examples — Socrates condemned to death, Marcus Aurelius persecuting the Christians — and against the common objection that some opinions are simply too dangerous to permit. Read this chapter as the epistemological foundation for everything that follows: free discussion is not a courtesy but the machinery by which any society capable of correcting itself stays so.',
      blurb: 'The longest and most-quoted chapter. Mill defends free expression on four grounds — truth, partial truth, the decay of received opinion, and the fading of living doctrine — and argues that suppression is always an error, however well-intentioned.',
      summary: [
        'Mill defends free expression on four distinct grounds, and he wants all four to bear weight. First: the silenced opinion may be true. To suppress it is to assume our own infallibility, and history is the long record of how badly that assumption ages — Socrates condemned by Athens, the early Christians persecuted by Marcus Aurelius, Galileo forced to recant. The assumption of infallibility is no less dangerous because the majority holds it.',
        'Second: even if the suppressed opinion is false, it may contain a portion of truth. Prevailing opinion is rarely the whole truth; it is only by the collision of ideas that the remainder is made up. Third: an opinion that is true but never contested decays into prejudice — held by rote, without grasp of its grounds, defenceless against intelligent attack. The meaning of a doctrine fades when it is not continuously defended; it becomes a formula, recited without force on conduct.',
        'Fourth: the living force of a true belief depends on the struggle to hold it. A person who has never had to defend a conviction does not really possess it. Mill is careful to note that this is not an argument for permanent uncertainty: it is an argument for the discipline of intellectual contest. The four arguments together make free discussion not a polite ornament of liberal society but the working machinery by which any society capable of correcting itself stays so.',
      ],
      appears: [
        { id: 'mill', name: 'John Stuart Mill' },
        { id: 'tocqueville', name: 'Alexis de Tocqueville' },
        { id: 'victorian-society', name: 'Victorian Society' },
      ],
      themes: [
        { slug: 'free-speech', label: 'Why Free Speech Matters' },
        { slug: 'tyranny-majority', label: 'Tyranny of the Majority' },
      ],
    },
    {
      n: 3,
      title: 'Of Individuality, as One of the Elements of Well-being',
      tourTitle: 'Individuality as a positive good',
      hook: 'Having defended what you may say, Mill defends what you may be. Custom and respectability press every life toward a common pattern — and the people inside it stop noticing they are being shaped.',
      tour: 'Chapter III turns from free speech to the broader freedom to live differently. Mill argues that individuality is not eccentricity for its own sake but the condition under which character forms at all. He who lets the world choose his plan of living exercises no faculty higher than imitation, and the faculties grow only by use. Society needs room for the different — even the strange — because the average is shaped by the room it allows, and genius, when it appears, needs the same soil that ordinary character requires. The argument surprises modern readers: Mill does not assume individuality is valued; he argues that it has to be defended, because the forces arrayed against it are powerful and largely invisible.',
      blurb: 'Having defended liberty of thought, Mill defends liberty of life. A person who lets custom choose for him exercises no faculty higher than imitation. Individuality is the soil in which character grows; society needs room for the different, or the average is flattened by its own weight.',
      summary: [
        'Having defended liberty of thought, Mill defends liberty of life. He argues that individuality — the freedom to choose one\'s own plan of living, according to one\'s own judgment and character — is not merely tolerated but actively valuable. A person who lets custom choose for him exercises no faculty higher than the ape-like one of imitation. The faculties — observation, reasoning, judgment, discrimination, even moral preference — are exercised only in making a choice, and they atrophy for want of exercise.',
        'Mill does not celebrate mere eccentricity. He admits that genius is rare and most lives will not be original in any large sense. But society needs the soil in which originality can grow when it does appear, and the same soil — room to be different, freedom to experiment with one\'s own life — is what allows ordinary character to develop at all. Where eccentricity is feared, the average has already been flattened by the weight of respectable conformity.',
        'Against the pressure of custom, Mill asks for nothing dramatic — only that different experiments in living be permitted to show what they can produce. The eccentric is not the goal but the proof that the space for self-determination remains open. The freedom he defends is not freedom to be like oneself once and for all, but freedom to become someone in the first place. A society that closes that space, however gradually and however reasonably, diminishes every person within it.',
      ],
      appears: [
        { id: 'mill', name: 'John Stuart Mill' },
        { id: 'victorian-society', name: 'Victorian Society' },
      ],
      themes: [
        { slug: 'individuality', label: 'Individuality Against Conformity' },
        { slug: 'tyranny-majority', label: 'Tyranny of the Majority' },
      ],
    },
    {
      n: 4,
      title: 'Of the Limits to the Authority of Society over the Individual',
      tourTitle: 'Drawing the line',
      hook: 'Where does society\'s authority over the individual end? Mill draws the line between legitimate judgment and illegitimate coercion — and answers the objection that no act is purely self-regarding.',
      tour: 'Chapter IV draws the line. Society has full claims over conduct that affects the interests of others — it may judge, legislate, penalise. It has no rightful authority over conduct that concerns only the agent himself, however foolish, distasteful, or self-destructive. Disapproval, advice, even avoidance are legitimate; legal penalty and organised social pressure are not. Mill then takes the hardest objection seriously: is any act purely self-regarding? He answers by distinguishing definite harm to assignable persons from the diffuse offence that neighbours may take, and refuses to let the second do the work of the first. This is the chapter that separates Mill from both the moralist who wants law to enforce virtue and the libertarian who denies every civic claim.',
      blurb: 'Mill draws the line between what society may judge and what it may not coerce. Disapproval, advice, and avoidance are legitimate; legal penalty is not, unless definite harm to others is at stake. The objection that no act is purely self-regarding is answered precisely.',
      summary: [
        'Mill draws the line. Society has full claims over conduct that affects the interests of others: it may judge it, penalise it, legislate against it. It has no rightful authority over conduct that concerns only the agent himself — however foolish, distasteful, or self-destructive that conduct may appear. Disapproval is permitted; advice, remonstrance, even ostracism are permitted. Compulsion is not.',
        'He takes the hardest objection head-on: is any act purely self-regarding? A man who ruins himself by drink also harms his family and his creditors. A man who lives badly sets a bad example. Mill\'s answer is to distinguish definite harm to assignable persons — the wife who is neglected, the creditor who is defrauded — from the diffuse displeasure that neighbours take at a way of living they dislike. The first is harm in the strict sense, and society may respond to it. The second is not, and must not be used as a pretext for coercion.',
        'The principle cuts both ways. It leaves no room for laws that enforce private virtue on grounds that virtue is good for the person required to practise it. It also leaves no room for the comfortable claim that tolerance is all very well in theory but some things are just too offensive to be permitted. Mill holds to the line rigorously, and the rigour is the point. A principle that dissolves under social pressure is no principle at all.',
      ],
      appears: [
        { id: 'mill', name: 'John Stuart Mill' },
        { id: 'victorian-society', name: 'Victorian Society' },
      ],
      themes: [
        { slug: 'harm-principle', label: 'The Harm Principle' },
        { slug: 'state-action', label: 'The Limits of State Action' },
      ],
    },
    {
      n: 5,
      title: 'Applications',
      tourTitle: 'The doctrine tested in the cases',
      hook: 'Trade, schooling, marriage, drink, gambling, vice — Mill applies the harm principle case by case, and closes with a warning about the state that does everything for its citizens.',
      tour: 'Chapter V takes the doctrine into practice. Trade is a social act and falls under the harm principle, but most restraints on trade are bad policy rather than violations of liberty as such. Children must be educated — failure is a wrong against the child — but the state should not monopolise the schools, because uniform state education manufactures uniform minds. Vice may be judged but not punished as vice; Mill works through drink, gambling, prostitution, and public morals with careful, partial answers and without easy moralising. The chapter closes with a warning that is the book\'s deepest argument: a government that absorbs every able person and every important function may run things efficiently for a while, but it dries up the springs of independent life on which its own renewal depends.',
      blurb: 'The harm principle is tested in the cases. Trade, education, marriage, drink, vice — each receives a careful, partial answer. The book closes with a warning: a state that does everything for its citizens eventually cannot be corrected by them.',
      summary: [
        'Mill takes the doctrine into practice. Trade is a social act — it affects others — and therefore falls under the rule permitting social intervention; but most actual restraints on trade are bad policy rather than violations of liberty as such. Education is treated more sharply: the state may require that children be educated, because failure to educate a child is a wrong against the child. But it must not monopolise the schools. Uniform state education produces uniform minds, and a government with the power to form every citizen\'s thinking holds a power no government should want.',
        'Mill works through the regulation of vice — drink, gambling, prostitution — with careful, partial answers and without the easy moralism of his age. Where a practice harms only the person who chooses it, the harm principle gives society no warrant to prohibit it; where it harms assignable others, the calculus changes. He refuses both the moralist who wants law to enforce virtue and the libertarian who denies every civic claim. Each case gets its own answer, and the answers are not comfortable.',
        'The book closes with a warning that is its deepest argument. A state that absorbs into itself every able person and every important function — that does everything for its citizens and decides everything in their place — may run things efficiently for a while. But it dries up the springs of independent judgment and independent life on which the state\'s own capacity to change and correct itself depends. Liberty is not only good for the person who exercises it. It is the condition of a society that remains capable of governing itself well.',
      ],
      appears: [
        { id: 'mill', name: 'John Stuart Mill' },
        { id: 'victorian-society', name: 'Victorian Society' },
      ],
      themes: [
        { slug: 'harm-principle', label: 'The Harm Principle' },
        { slug: 'state-action', label: 'The Limits of State Action' },
        { slug: 'individuality', label: 'Individuality Against Conformity' },
      ],
    },
  ],
};
