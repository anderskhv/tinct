// SEO data for The Communist Manifesto (Marx & Engels, 1848)
// Political philosophy as polemical intervention. Five sections: preamble + four parts.
// Voice: urgent, declarative, combative — matches the text itself. Cite specifics; no vague applause.

module.exports = {
  id: 'communist-manifesto',
  title: 'The Communist Manifesto',
  author: 'Karl Marx & Friedrich Engels',
  byline: '1848 · Political philosophy in four parts',
  titleAccent: 'a guided tour',
  hook: 'A spectre is haunting Europe. Two men — a philosopher and a manufacturer\'s son — name it, explain it, and dare the ruling classes to tremble. The most-read political document of the modern era opens with a ghost.',
  genre: ['Political philosophy', 'Manifesto', 'Revolutionary writing'],
  themesBlurb: 'Class struggle, bourgeois revolution, proletarian emancipation, private property, internationalism.',
  castBlurb: 'Two authors, two classes, and the rivals they dismiss.',
  castDesc: 'The actors of a world-historical drama.',
  castSubtitle: 'Two authors, two classes, and the rivals they dismiss.',
  chapterLabel: n => ['Preamble', 'I. Bourgeois and Proletarians', 'II. Proletarians and Communists', 'III. Socialist and Communist Literature', 'IV. Position of the Communists'][n - 1],

  about: [
    `<em>The Communist Manifesto</em> is not a treatise. It is an intervention. Commissioned by the Communist League at its London congress in late 1847, it was rushed into print in London in February 1848 — weeks before revolutions broke across Paris, Vienna, Berlin, and Milan. The authors are thirty and twenty-eight. They mean to give a name and a programme to a movement that has so far been hounded by police as a rumour. The Manifesto announces, in plain combative prose, what the communists want and why the bourgeois order has already produced its own opposition.`,
    `The argument is historical and total. All hitherto existing society is the history of class struggles — freeman and slave, patrician and plebeian, lord and serf, guild-master and journeyman. The modern epoch has simplified the antagonism. Two great camps face each other: bourgeoisie and proletariat. The bourgeoisie has played, the authors insist, a most revolutionary part — it has torn down feudal idylls, melted all that is solid into air, and built the productive forces that will outgrow it. The workers it concentrates in factories and cities are its own gravediggers. What follows from that is the programme, the polemic, and the famous summons.`,
  ],

  chaptersSubtitle: 'All five sections — from the spectre in the opening to the summons at the close.',
  chaptersLead: `<p>The Manifesto moves from historical thesis to programme to polemic in a single cumulative argument. The Preamble sets the terms. Part I establishes the bourgeoisie's revolutionary role and names the proletariat as its consequence. Part II defends communism against its critics and delivers the ten-point programme. Part III is the polemic against rival socialisms — feudal, petty-bourgeois, utopian. Part IV states, in twelve paragraphs, where communists stand inside other parties. Five sections; the rhetoric tightens to the final line.</p>`,

  themesByline: 'Five threads through the text',
  themesLead: `The Manifesto is a rhetorical machine. Every move — the celebration of the bourgeoisie, the defence against standard objections, the dismissal of rival socialisms — is designed to land the reader at the same inescapable conclusion: workers of the world, unite. Reading the themes clarifies the machine.`,

  groups: [
    { label: 'The argument', subtitle: 'From spectre to gravedigger.', chapters: [1, 2] },
    { label: 'The programme', subtitle: 'Defence, property, and ten transitional measures.', chapters: [3] },
    { label: 'The polemic', subtitle: 'Rival socialisms dismissed, tactics declared.', chapters: [4, 5] },
  ],

  themes: [
    {
      slug: 'class-struggle',
      title: 'History as class struggle',
      greek: '"The history of all hitherto existing society is the history of class struggles."',
      preview: 'The opening claim of Part I is the foundation of everything that follows. History is not the procession of great men, nor the unfolding of spirit. It is conflict over the surplus produced by labour, and the modern epoch has stripped it to two camps.',
      essay: [
        `The first sentence of Part I is also the Manifesto's central argument. The history of all hitherto existing society is the history of class struggles. Freeman and slave, patrician and plebeian, lord and serf, guild-master and journeyman — the pairs change costume but the structure persists. History is not the accumulation of liberty, not the flowering of reason, not the action of great individuals. It is conflict over the surplus produced by labour, organised through whatever property forms the productive powers of the age permit.`,
        `The claim is polemical against two adversaries at once. Against conservative historiography, which treated each social order as natural and ordained, Marx and Engels insist every order is transient and rests on coercion. Against liberal narrative, which attributed progress to ideas — rights, reason, enlightenment — they insist ideas follow material conditions. The Reformation did not produce capitalism; the rise of the burgher class produced both the Reformation and capitalism. The consciousness of the ruling class about itself is downstream of the mode of production.`,
        `The modern epoch is distinguished not by ending the struggle but by simplifying it. The bourgeoisie has stripped away the feudal motley — the guild privileges, the local immunities, the hereditary stations — and left two great hostile camps directly facing each other. Where the medieval serf had a lord, a priest, a guild-master, and a bailiff, the modern worker confronts a single antagonist: capital. This simplification is what makes the proletarian revolution possible; the struggle becomes legible, solidarity becomes thinkable across trades, cities, and nations.`,
        `The framework is also predictive. If history is the working out of class antagonisms through changes in productive forces, then the bourgeois order, like the feudal order before it, will produce the conditions of its own dissolution. The Manifesto reads this as already underway in commercial crises, in the concentration of capital, in the proletarianisation of small producers. The reader is not being persuaded to want a revolution. The reader is being told one is coming and offered a vocabulary for it.`,
      ],
      where: [
        { n: 1, label: 'Preamble (the spectre named)' },
        { n: 2, label: 'Part I (the historical thesis)' },
        { n: 5, label: 'Part IV (the conclusion)' },
      ],
    },
    {
      slug: 'bourgeois-revolution',
      title: 'The bourgeoisie as revolutionary destroyer',
      greek: '"All that is solid melts into air, all that is holy is profaned."',
      preview: 'Part I contains the strangest passage in the political literature of the left: a hymn to the bourgeoisie. Celebrated as the most revolutionary class in history before being condemned as a transient one. The praise is the indictment.',
      essay: [
        `Part I contains the strangest passage in the political literature of the left: a hymn to the bourgeoisie. The bourgeoisie, historically, has played a most revolutionary part. It has put an end to all feudal, patriarchal, idyllic relations. It has pitilessly torn asunder the motley feudal ties that bound man to his natural superiors and left no other nexus between man and man than naked self-interest, than callous cash payment. The tone is not regret. It is recognition.`,
        `The bourgeoisie has done what no previous ruling class managed. It has accomplished wonders far surpassing Egyptian pyramids, Roman aqueducts, and Gothic cathedrals. It has conducted expeditions that put in the shade all former exoduses of nations and crusades. It has created enormous cities. It has rescued a considerable part of the population from the idiocy of rural life. It has drawn even the most barbarian nations into civilisation through the cheap prices of its commodities, which are the heavy artillery with which it batters down all Chinese walls.`,
        `The famous formula captures what is dissolved: all that is solid melts into air, all that is holy is profaned. Trades, hierarchies, pieties, family forms, national insularities — every fixed, fast-frozen relation is swept away. The bourgeoisie cannot exist without constantly revolutionising the instruments of production, and thereby the relations of production, and with them the whole relations of society. Permanent insecurity, perpetual disturbance, everlasting uncertainty are not failures of the bourgeois order; they are its essence.`,
        `The argument turns on this celebration. Precisely because the bourgeoisie revolutionises everything, it cannot stop. It calls into existence the modern proletariat — concentrated, propertyless, organised in factories, transported by railways, addressed by mass newspapers — and arms that proletariat with the very productive forces that will be turned against it. The bourgeoisie is praised here because the praise is the indictment. A class whose nature is to dissolve all stable relations cannot expect its own relations to remain stable. It has produced its negation.`,
      ],
      where: [
        { n: 2, label: 'Part I (the hymn to the bourgeoisie)' },
        { n: 3, label: 'Part II (property defended against its critics)' },
      ],
    },
    {
      slug: 'proletariat',
      title: 'The proletariat as gravedigger',
      greek: '"What the bourgeoisie produces, above all, is its own gravediggers."',
      preview: 'The second half of Part I introduces the modern working class. Not the poor in general — the wage-labourer whose only property is the capacity to work. Concentrated by industry, connected by railways, constituted into a class almost without willing it.',
      essay: [
        `The second half of Part I introduces the modern working class — a class of labourers who live only so long as they find work, and who find work only so long as their labour increases capital. These labourers, who must sell themselves piecemeal, are a commodity, like every other article of commerce, exposed to all the vicissitudes of competition, to all the fluctuations of the market. The definition is technical and unsparing. The proletarian is not the poor in general; the proletarian is the wage-labourer whose only property is the capacity to work.`,
        `Industry transforms this class. The craft workshop is replaced by the factory; the master-journeyman relation is replaced by the foreman-operative relation; the worker becomes an appendage of the machine. Skill, age, and sex distinctions lose their social validity; all are instruments of labour, costing more or less according to age and sex. Wages tend toward subsistence. Hours lengthen. The introduction of new machinery and the division of labour intensify the exploitation. The condition is degrading and, the authors insist, generative.`,
        `The proletariat passes through stages of struggle. Isolated workers fight individual employers. Factory workers fight the local factory-owner. Workers in a trade combine across factories. Modern industry, by herding the proletariat into great cities and connecting them by improved means of communication, makes the struggle national. Every class struggle is a political struggle. Trade unions, strikes, political associations — these are the organisational forms in which the proletariat, almost without willing it, constitutes itself as a class.`,
        `The conclusion is the famous one. Of all the classes that stand face to face with the bourgeoisie today, the proletariat alone is a really revolutionary class. The other classes decay and finally disappear in the face of modern industry; the proletariat is its own product. The proletariat has nothing to lose but its chains. It has a world to win. The bourgeoisie produces, above all, its own gravediggers. Its fall and the victory of the proletariat are equally inevitable.`,
      ],
      where: [
        { n: 2, label: 'Part I (the proletariat defined and developed)' },
        { n: 3, label: 'Part II (the proletariat organised as the ruling class)' },
      ],
    },
    {
      slug: 'private-property',
      title: 'The abolition of private property',
      greek: '"The theory of the communists may be summed up in the single sentence: abolition of private property."',
      preview: 'Part II opens with the objection every drawing room expected: you would abolish property. The reply is precise, famous, and almost universally misread. It is not property in general. It is bourgeois property — capital.',
      essay: [
        `Part II opens with the objection the authors expect to dominate every drawing-room conversation about communism: you would abolish property. The reply is precise and almost universally misread. The distinguishing feature of communism is not the abolition of property generally, but the abolition of bourgeois property. Modern bourgeois private property is the final and most complete expression of the system of producing and appropriating products that is based on class antagonisms, on the exploitation of the many by the few. In this sense, the theory of the communists may be summed up in the single sentence: abolition of private property.`,
        `The argument distinguishes carefully. The hard-won, self-acquired, self-earned property of the small artisan and small peasant is not what is at stake; that form of property has already been destroyed, and is daily being destroyed, by the development of industry. Personal property — the means of subsistence, the products of one's own labour — is not threatened. What is threatened is capital: that kind of property which exploits wage-labour, and which cannot increase except upon condition of begetting a new supply of wage-labour for fresh exploitation.`,
        `The authors then pre-empt the standard objections in series. Communism would abolish individuality? Bourgeois society has already abolished the individuality of nine-tenths of its members. Communism would abolish the family? Bourgeois marriage is, in reality, a system of wives in common — and the bourgeoisie has long practised the seduction of proletarian women. Communism would abolish the fatherland? The workingmen have no country; one cannot take from them what they have not got. Communism would abolish religion, morality, eternal truths? These are themselves products of historical conditions and change with them.`,
        `The reply is rhetorical and revealing. Each charge is reversed and handed back. The bourgeois is not defending universal goods against communist destruction; the bourgeois is defending the particular form those goods have taken under capital. The ten-point programme follows: graduated income tax, abolition of inheritance, centralisation of credit, free public education, abolition of child factory labour. Transitional measures, applicable in the most advanced countries, in the hands of the proletariat organised as the ruling class.`,
      ],
      where: [
        { n: 3, label: 'Part II (property and the ten-point programme)' },
      ],
    },
    {
      slug: 'internationalism',
      title: 'Internationalism and the closing summons',
      greek: '"Workers of the world, unite!"',
      preview: 'The closing line is not a slogan added for effect. It is a conclusion drawn from the structure of the argument. If capital is international from the start, the conflict it produces must be international too. Workers of the world, unite.',
      essay: [
        `The closing summons is the line that has travelled furthest: workers of the world, unite. It is not a slogan added at the end. It is a conclusion drawn from the structure of the argument. If the bourgeoisie has, by its exploitation of the world market, given a cosmopolitan character to production and consumption in every country, then the working class it produces is also, of necessity, international. National industries are dislodged by new industries that work up raw material drawn from the remotest zones and whose products are consumed in every quarter of the globe. The conditions of life are universalised. So is the conflict.`,
        `The Manifesto does not deny that the proletariat must first settle matters with its own bourgeoisie. The struggle of the proletariat with the bourgeoisie is at first a national struggle. The proletariat of each country must first acquire political supremacy, must rise to be the leading class of the nation, must constitute itself the nation. But this is national only in form. The content is international from the start, because capital is international from the start. United action, of the leading civilised countries at least, is one of the first conditions for the emancipation of the proletariat.`,
        `The polemical edge cuts against two opponents. Against the patriotic socialists who would build socialism in a single nation by appeal to national tradition, the authors insist that workers have no country. Against the cosmopolitan liberals who would dissolve all boundaries through free trade, the authors insist that bourgeois cosmopolitanism is the cosmopolitanism of the market, not of solidarity. The internationalism of the Manifesto is the internationalism of the exploited recognising that their condition is the same in Manchester, Paris, Berlin, and Lyons.`,
        `The summons closes a document that began as a private commission and ends as a public address. The communists disdain to conceal their views and aims. They openly declare that their ends can be attained only by the forcible overthrow of all existing social conditions. Let the ruling classes tremble at a communistic revolution. The proletarians have nothing to lose but their chains. They have a world to win. Workers of the world, unite. The address is not to a party. It is to a class that, the authors insist, already exists across borders, whether or not it knows itself yet.`,
      ],
      where: [
        { n: 2, label: 'Part I (cosmopolitan production)' },
        { n: 5, label: 'Part IV (the closing summons)' },
      ],
    },
  ],

  castLead: `<p>The Manifesto's cast is mostly abstractions — classes, tendencies, historical forces. The two named authors appear briefly in biographical terms; the real protagonists are the bourgeoisie and the proletariat. Section III introduces the gallery of rival socialisms, each named and dismissed. The cast here covers both the historical actors and the intellectual opponents.</p>`,

  cast: [
    {
      name: 'Karl Marx & Friedrich Engels',
      role: 'AUTHORS',
      body:
        'A philosopher trained in Hegel and a manufacturer\'s son who managed his father\'s cotton mill in Manchester. Marx, twenty-nine in 1848, expelled from Paris and Brussels, theorist of the Young Hegelian left turned communist. Engels, twenty-seven, author of <em>The Condition of the Working Class in England</em>, the first sustained study of industrial misery from inside the factories. Commissioned by the Communist League at its London congress in late 1847 to draft a public statement of doctrine. Marx wrote the final text largely alone in Brussels in January 1848. The pamphlet appeared in February, weeks before Paris rose. The collaboration would last forty years.',
    },
    {
      name: 'The bourgeoisie',
      role: 'CLASS',
      body:
        'Owners of the means of social production and employers of wage labour. The Manifesto traces them from the burghers of medieval towns through the merchant adventurers of the colonial trade to the industrialists of Manchester and Lyons. They are not villains in the moral sense; they are praised at length as the most revolutionary class in history — destroyers of feudal idylls, builders of cities, drawers of nations into the world market. Their crime is not cruelty but transience. They cannot exist without constantly revolutionising the instruments of production, and the productive forces they unleash will outgrow the property forms in which they confine them.',
    },
    {
      name: 'The proletariat',
      role: 'CLASS',
      body:
        'A class of labourers who live only so long as they find work, and who find work only so long as their labour increases capital. Defined not by poverty but by propertylessness — the only commodity they have to sell is their capacity to work. Concentrated by industry into factories and cities, disciplined by the machine, connected by railways and the press, they pass through trade combinations, strikes, and political parties into class consciousness. The Manifesto names them as the bourgeoisie\'s gravediggers. They have nothing to lose but their chains. They have a world to win.',
    },
    {
      name: 'Saint-Simon, Fourier, Owen',
      role: 'UTOPIANS',
      body:
        'The three great utopian socialists of the previous generation, critiqued in Section III as critical-utopian socialism. Henri de Saint-Simon, French aristocrat-turned-prophet of industrial planning. Charles Fourier, eccentric designer of the phalanstery, the self-sufficient community of 1,620 souls. Robert Owen, Welsh mill-owner who built New Lanark and the failed New Harmony in Indiana. The Manifesto praises them — they attacked every principle of existing society and produced the most valuable materials for the enlightenment of the working class. It also dismisses them. They wrote before the proletariat had constituted itself as a class. They appealed to reason and benevolence rather than to historical struggle.',
    },
    {
      name: 'The reactionary socialists',
      role: 'TARGETS',
      body:
        'Section III\'s gallery of rival socialisms, each named and dispatched. Feudal socialism — French and English aristocrats nostalgic for the lost paternalism of the manor, brandishing the proletarian beggar\'s wallet as a banner. Petty-bourgeois socialism, of which Sismondi is the classic — a critique from the standpoint of the artisan and small peasant being ground between capital and proletariat. German or "true" socialism, which translated French radicalism into philosophical abstractions and served the petty bourgeoisie of the German states. Bourgeois socialism — Proudhon and the philanthropists — wanting the conditions of bourgeois life without the proletariat that produces them. Each is shown to be reactionary in form or content or both.',
    },
  ],

  castGroups: [
    {
      label: 'The authors',
      characters: [
        {
          id: 'marx-engels',
          tag: 'AUTHORS',
          name: 'Karl Marx & Friedrich Engels',
          epithet: 'Philosopher and manufacturer\'s son',
          body: `Marx, twenty-nine in 1848, trained in Hegel, expelled from Paris and Brussels. Engels, twenty-seven, author of <em>The Condition of the Working Class in England</em>. Commissioned by the Communist League in late 1847 to draft a public statement. Marx wrote the final text largely alone in Brussels in January 1848. The pamphlet appeared in February, weeks before Paris rose. Their collaboration would last forty years and produce <em>Das Kapital</em>, extensive journalism, and a vast correspondence.`,
          appears: [1, 2, 3, 4, 5],
        },
      ],
    },
    {
      label: 'The historical actors',
      characters: [
        {
          id: 'bourgeoisie',
          tag: 'CLASS',
          name: 'The bourgeoisie',
          epithet: 'The most revolutionary class in history',
          body: `Owners of the means of social production and employers of wage labour, traced from medieval burghers to industrial capitalists. The Manifesto's strangest rhetorical move is the sustained praise of the bourgeoisie in Part I: they accomplished wonders surpassing Egyptian pyramids, drew barbarian nations into civilisation, rescued millions from the idiocy of rural life. The celebration is the indictment. A class that cannot stop dissolving old relations cannot expect its own to survive.`,
          appears: [1, 2, 3, 4, 5],
        },
        {
          id: 'proletariat',
          tag: 'CLASS',
          name: 'The proletariat',
          epithet: 'The bourgeoisie\'s own gravediggers',
          body: `The modern working class — defined not by poverty but by propertylessness. A class that must sell its capacity to work, concentrated in factories, connected by railways and the press, organised through strikes and combinations almost without willing it. The Manifesto traces their development from isolated workers fighting individual employers to a class constituting itself as a national and then international political force. They have nothing to lose but their chains.`,
          appears: [2, 3, 5],
        },
      ],
    },
    {
      label: 'The intellectual opponents',
      characters: [
        {
          id: 'utopians',
          tag: 'TARGETS',
          name: 'Saint-Simon, Fourier, Owen',
          epithet: 'Critical-utopian socialists',
          body: `The previous generation's three great socialist visionaries: Henri de Saint-Simon (French aristocrat-turned-prophet of industrial planning), Charles Fourier (designer of the phalanstery), Robert Owen (Welsh mill-owner who built New Lanark). The Manifesto is more respectful here than elsewhere — they produced the most valuable materials for enlightening the working class — but dismisses them as writing before the proletariat had constituted itself as a class, appealing to reason rather than historical struggle.`,
          appears: [4],
        },
        {
          id: 'reactionary-socialists',
          tag: 'TARGETS',
          name: 'The reactionary socialists',
          epithet: 'Feudal, petty-bourgeois, and "true" socialists',
          body: `Section III's gallery of rivals, each dispatched with brisk contempt. Feudal socialists — aristocrats mourning the manor, waving the proletarian beggar's wallet as a banner. Petty-bourgeois socialists, of which Sismondi is the classic, defending the artisan and small peasant against both capital and labour. German "true" socialists who translated French radicalism into philosophical abstraction. Bourgeois socialists — Proudhon and the philanthropists — wanting the benefits of bourgeois society without the class struggle that comes with it.`,
          appears: [4],
        },
      ],
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'Preamble — the spectre named',
      tourTitle: 'The spectre named',
      hook: 'A spectre is haunting Europe — the spectre of communism. All the powers of old Europe have entered into a holy alliance to exorcise it. Two men decide to stop hiding.',
      tour: `The Preamble is six paragraphs that do one thing: establish the stakes. A spectre is haunting Europe — communism. Every power, from Pope and Czar to French radicals and German police-spies, has entered a holy alliance to exorcise it. From this Marx and Engels draw two conclusions. First: communism is already acknowledged by all the European powers to be itself a power. Second: it is high time that communists openly publish their views, their aims, their tendencies — and answer the nursery tale of the Spectre of Communism with a manifesto of the party itself. The Communist League, assembled in London, has commissioned this document, to be published in English, French, German, Italian, Flemish, and Danish. Six paragraphs; the argument has already started.`,
      blurb: `Six paragraphs, one move: communism is already a power — every government in Europe says so. High time, then, to publish the party's views openly rather than let the police write the story. The Manifesto begins.`,
      summary: [
        `A spectre is haunting Europe — the spectre of communism. The opening sentence names the antagonist and frames the whole pamphlet as a reply to a campaign of misrepresentation. Pope and Czar, Metternich and Guizot, French radicals and German police-spies have entered into a holy alliance to exorcise this spectre. Every opposition party has been branded communist by its rivals in power; every opposition party has flung the same charge back at its own more advanced rivals. Communism, whatever it actually is, has become the universal accusation.`,
        `From this Marx and Engels draw two propositions. First: communism is already acknowledged by all European powers to be a power — the very violence of the denunciation confirms it. Second: it is high time that communists openly, in the face of the whole world, publish their views, their aims, their tendencies, and answer this nursery tale of the Spectre of Communism with a manifesto of the party itself. The argument is tactical as much as theoretical: silence lets the enemy write the definition.`,
        `To this end, communists of various nationalities have assembled in London and drafted the following manifesto, to be published in six languages: English, French, German, Italian, Flemish, and Danish. Six paragraphs total. The Preamble does not yet argue — it sets the scene, names the adversaries, and states the reason for speaking. What follows is the argument.`,
      ],
      appears: [{ id: 'marx-engels', name: 'Marx & Engels' }],
      themes: [{ slug: 'class-struggle', label: 'Class struggle' }, { slug: 'internationalism', label: 'Internationalism' }],
    },
    {
      n: 2,
      title: 'Part I — Bourgeois and Proletarians',
      tourTitle: 'Bourgeois and Proletarians',
      hook: 'The history of all hitherto existing society is the history of class struggles. The bourgeoisie has played a most revolutionary part. It has produced, above all, its own gravediggers.',
      tour: `Part I is the theoretical engine of the Manifesto. It opens with the famous thesis — all history is class struggle — and runs through the modern bourgeoisie's origins: from medieval burghers through colonial merchants to the industrial capitalists of Manchester and Lyons. The bourgeoisie is then celebrated at length as the most revolutionary class in history — a celebration that turns on the reader, because precisely by constantly revolutionising production, the bourgeoisie calls into existence its own opposition. The proletariat is introduced, defined by propertylessness rather than poverty, traced from isolated workers fighting individual employers to a class constituting itself through strikes and unions. The section closes with the famous sentence: the bourgeoisie has produced, above all, its own gravediggers. Its fall and the victory of the proletariat are equally inevitable.`,
      blurb: `The theoretical heart of the Manifesto. All history is class struggle; the bourgeoisie is the most revolutionary class in history; it has produced, above all, its own gravediggers. Part I moves from thesis to application to conclusion in fifty dense paragraphs.`,
      summary: [
        `The history of all hitherto existing society is the history of class struggles. The claim is stated plainly in the first sentence and the rest of Part I is its working out. Freeman and slave, patrician and plebeian, lord and serf, guild-master and journeyman — the pairs change costume, but the structure persists: oppressor and oppressed, in constant opposition, in a fight that each time ended either in a revolutionary reconstitution of society at large or in the common ruin of the contending classes. The modern epoch has simplified this struggle to two great hostile camps: bourgeoisie and proletariat.`,
        `The bourgeoisie's origins are traced from the burghers of medieval towns, through the merchant adventurers of the colonial trade, through the manufacturing system, to the modern industrial capitalist. And here the Manifesto makes its strangest move: it celebrates the bourgeoisie at length. The bourgeoisie has played a most revolutionary part. It has accomplished wonders surpassing Egyptian pyramids and Roman aqueducts. It has melted all that is solid into air, all that is holy has been profaned. It has drawn even the most barbarian nations into civilisation through the cheap prices of its commodities. The tone is not regret. It is recognition — and the recognition is the indictment, because a class that cannot stop revolutionising everything cannot expect its own relations to survive.`,
        `The proletariat is then introduced as the bourgeoisie's direct product. A class of labourers who live only so long as they find work, and who find work only so long as their labour increases capital. Defined by propertylessness, not poverty. Concentrated in factories, connected by railways and the press, organised through trade combinations and strikes almost without willing it. Part I closes with the sentence the rest of the Manifesto builds toward: the bourgeoisie has produced, above all, its own gravediggers. Its fall and the victory of the proletariat are equally inevitable.`,
      ],
      appears: [{ id: 'bourgeoisie', name: 'The bourgeoisie' }, { id: 'proletariat', name: 'The proletariat' }],
      themes: [{ slug: 'class-struggle', label: 'Class struggle' }, { slug: 'bourgeois-revolution', label: 'Bourgeois revolution' }, { slug: 'proletariat', label: 'The proletariat' }],
    },
    {
      n: 3,
      title: 'Part II — Proletarians and Communists',
      tourTitle: 'Proletarians and Communists',
      hook: 'The theory of the communists may be summed up in the single sentence: abolition of private property. Then the standard objections arrive, and each is reversed and handed back.',
      tour: `Part II is the longest and most argued section. It opens by clarifying what communists are — not a separate party, but the most advanced section of the working class, those who see the whole picture. Then comes the central claim: the theory of communists can be summed up in the single sentence, abolition of private property. But what property? Not property in general, not the hard-won earnings of the artisan — that's already being destroyed by industry. Bourgeois private property: capital, which exploits wage-labour and cannot increase except by generating more wage-labour to exploit. From there, Part II answers the standard objections in series: abolish individuality? — bourgeois society has already done that to nine-tenths of its members. Abolish the family? — bourgeois marriage is already a system of wives in common. Abolish the fatherland? — the workers have no country. Then the ten-point programme, and the closing vision: the free development of each is the condition for the free development of all.`,
      blurb: `Communists defined, private property dissected, objections reversed. The longest section delivers the ten-point programme — graduated income tax, abolition of inheritance, centralised credit, free public education — and closes with a vision of association in which the free development of each is the condition for the free development of all.`,
      summary: [
        `Part II opens with a clarifying question: what is the relation of communists to the proletariat as a whole? They form no separate party; they have no interests separate from those of the proletariat at large. What distinguishes them is only this: in the national struggles of the proletarians of different countries, communists bring to the front the common interests of the whole proletariat. And theoretically, they have the advantage of clearly understanding the line of march, the conditions, and the ultimate general results of the proletarian movement. Their immediate aim is the same as that of all working-class parties: the conquest of political power by the proletariat.`,
        `The theoretical conclusions of the communists are, however, distinctive. All property relations in the past have continually been subject to historical change. The distinguishing feature of communism is not the abolition of property generally, but the abolition of bourgeois property — that kind of property which exploits wage-labour and cannot increase except by begetting fresh wage-labour. In this sense, the theory of the communists may be summed up in the single sentence: abolition of private property. The objections follow — would abolish individuality, the family, the fatherland, eternal truths. Each is reversed: bourgeois society has already abolished the individuality of nine-tenths of its members; bourgeois marriage is a system of wives in common; the workingmen have no country; eternal truths are products of historical conditions. The rhetoric is relentless and cumulative.`,
        `The ten-point programme follows: abolition of property in land and application of rents to public purposes; a heavy progressive income tax; abolition of inheritance; centralisation of credit in a national bank; centralisation of communication and transport in the hands of the state; free public education for all children; abolition of child factory labour. These are transitional measures — means of wresting capital from the bourgeoisie, step by step. When, in the course of development, class distinctions have disappeared and all production is concentrated in the hands of a vast association of the whole nation, the public power will lose its political character. In place of the old bourgeois society, with its classes and class antagonisms: an association in which the free development of each is the condition for the free development of all.`,
      ],
      appears: [{ id: 'bourgeoisie', name: 'The bourgeoisie' }, { id: 'proletariat', name: 'The proletariat' }, { id: 'marx-engels', name: 'Marx & Engels' }],
      themes: [{ slug: 'private-property', label: 'Private property' }, { slug: 'proletariat', label: 'The proletariat' }],
    },
    {
      n: 4,
      title: 'Part III — Socialist and Communist Literature',
      tourTitle: 'The rivals dismissed',
      hook: 'The gallery of rivals: feudal socialists, petty-bourgeois socialists, German "true" socialists, bourgeois socialists, critical-utopian socialists. Each named. Each dismissed. Read it as a map of the European left in 1848.',
      tour: `Part III is pure polemic — a gallery of rival socialisms, each introduced and demolished. Feudal socialism: aristocrats mourning the manor who have turned their criticism against the bourgeoisie not because they care about the workers but because they miss the old exploitation. Petty-bourgeois socialism, of which Sismondi is the classic: a critique from the standpoint of the artisan and small peasant being ground between capital and proletariat — backward-looking, reactionary in its solution even when its diagnosis is correct. German or "true" socialism: which translated French radicalism into philosophical abstractions, drained it of its political content, and handed it to the petty bourgeoisie of the German states. Conservative or bourgeois socialism — Proudhon and the philanthropists — wanting the advantages of bourgeois society without the proletariat that produces them. Finally the critical-utopian socialists: Saint-Simon, Fourier, Owen — praised for the richness of their critique and dismissed for appealing to reason and benevolence rather than to historical necessity.`,
      blurb: `Five rival socialisms introduced and dismissed in sixty-two paragraphs: feudal, petty-bourgeois, German "true," bourgeois, and critical-utopian. A map of the European left in 1848. Each is shown to be reactionary in form or content or both.`,
      summary: [
        `Section III opens with feudal socialism: the aristocracies of France and England, ruined by the bourgeoisie, have turned their criticism against modern bourgeois society not because they care about the workers but because they miss their own former exploitation. They waved the proletarian alms-bag in front as a banner; but the people saw on their hindquarters the old feudal coats of arms. Their criticism is half lamentation, half lampoon — sometimes witty and incisive, always reactionary. They oppose the bourgeoisie not because it creates a proletariat, but because it creates a revolutionary one.`,
        `Petty-bourgeois socialism — Sismondi is the classic example — is a critique from the standpoint of the artisan and small peasant being ground between capital and proletariat. It has the merit of pointing to the contradictions of modern production; it has the defect of always wanting to restore the old means of production and exchange, and with them the old property relations and the old society. In its positive aims it is either reactionary or utopian. German or "true" socialism made matters worse by translating French socialist demands into the philosophical language of the German petty bourgeoisie, draining them of their revolutionary content and turning them into weapons of existing German governments against a bourgeoisie that had not yet even come to power.`,
        `Conservative or bourgeois socialism — Proudhon's <em>Philosophy of Poverty</em> is the example — wants the advantages of bourgeois social conditions without the struggles and dangers necessarily resulting from them. A section of the bourgeoisie wants to redress social grievances in order to secure the continued existence of bourgeois society. Finally, the critical-utopian socialists — Saint-Simon, Fourier, Owen — wrote when the proletariat had not yet developed sufficiently to constitute itself as a class. They attacked every principle of existing society with brilliant insight and produced the most valuable materials for enlightening the working class. But they appealed to reason and benevolence rather than to historical struggle, and their detailed plans for ideal communities have, since the development of the proletariat, become merely fantastic. Their followers have become simple reactionaries.`,
      ],
      appears: [{ id: 'utopians', name: 'Saint-Simon, Fourier, Owen' }, { id: 'reactionary-socialists', name: 'The reactionary socialists' }],
      themes: [{ slug: 'class-struggle', label: 'Class struggle' }, { slug: 'proletariat', label: 'The proletariat' }],
    },
    {
      n: 5,
      title: 'Part IV — Position of the Communists',
      tourTitle: 'The position declared',
      hook: 'Twelve paragraphs. The Chartists in England, the Agrarian Reformers in America, the Radicals in Switzerland, the Poles, the Germans. Everywhere: communists support every revolutionary movement against the existing order. Then the famous last line.',
      tour: `Part IV is the shortest section and the most immediate. Where do communists stand in relation to other opposition parties? The answer is given country by country: they support the Chartists in England, the Agrarian Reformers in America, the Radicals in Switzerland, the party that insists on agrarian revolution in Poland. In Germany, they fight with the bourgeoisie against the absolute monarchy — but never cease, for a single instant, to instil into the working class the clearest possible recognition of the hostile antagonism between bourgeoisie and proletariat. Germany is on the eve of a bourgeois revolution, and the communist revolution will follow it immediately. Everywhere, communists support every revolutionary movement against the existing social and political order. The final paragraph: the communists disdain to conceal their views and aims. Their ends can be attained only by the forcible overthrow of all existing social conditions. Let the ruling classes tremble. Workers of the world, unite.`,
      blurb: `Twelve paragraphs stating, country by country, where communists stand inside other parties. The argument closes with the Manifesto's most consequential line: workers of the world, unite.`,
      summary: [
        `Section II has made clear the relations of the communists to the existing working-class parties. Part IV states the tactical position country by country. In England: the Chartists. In America: the Agrarian Reformers. In Switzerland: the Radicals, despite their mixed composition. In Poland: the party that insists on an agrarian revolution as the prime condition for national emancipation. In Germany: the communists fight with the bourgeoisie whenever it acts in a revolutionary way against the absolute monarchy — but they never cease to instil into the working class the clearest recognition of the hostile antagonism between bourgeoisie and proletariat, so that the German workers may immediately use the conditions of bourgeois rule as so many weapons against the bourgeoisie.`,
        `Germany is given special attention. It is on the eve of a bourgeois revolution, carried out under more advanced conditions of European civilisation than seventeenth-century England or eighteenth-century France. Its bourgeois revolution will therefore be only the prelude to an immediately following proletarian revolution. In short: communists everywhere support every revolutionary movement against the existing social and political order of things. In all these movements they bring to the front, as the leading question, the property question — no matter what its degree of development at the time. Finally, they labour everywhere for the union and agreement of the democratic parties of all countries.`,
        `The Manifesto closes in twelve words that have been translated into every major language on earth. The communists disdain to conceal their views and aims. They openly declare that their ends can be attained only by the forcible overthrow of all existing social conditions. Let the ruling classes tremble at a communistic revolution. The proletarians have nothing to lose but their chains. They have a world to win. Working men of all countries, unite. The pamphlet ends where it began: with an address not to a party but to a class — and with an insistence that the class already exists, internationally, whether or not it has yet recognised itself.`,
      ],
      appears: [{ id: 'proletariat', name: 'The proletariat' }, { id: 'marx-engels', name: 'Marx & Engels' }],
      themes: [{ slug: 'internationalism', label: 'Internationalism' }, { slug: 'class-struggle', label: 'Class struggle' }],
    },
  ],
};
