// Magna Carta — SEO page data for build-seo-pages.cjs
// 63 clauses, sealed at Runnymede on 15 June 1215. Largely a feudal grievance document
// in 1215; transformed into a constitutional myth by Coke in the seventeenth century.
// Voice: legal-historical, declarative present, medieval-precise.

module.exports = {
  id: 'magna-carta',
  title: 'Magna Carta',
  author: 'King John of England et al.',
  byline: '1215 · English constitutional charter',
  titleAccent: 'a guided tour',
  hook: 'An English king, defeated and broke, meets his rebel barons at Runnymede in June 1215 and seals a charter forced on him by their swords. Two of its sixty-three clauses would found the Anglo-American constitutional tradition.',
  genre: ['Law', 'Medieval English history', 'Constitutional documents', 'Primary sources'],
  themesBlurb: 'Feudal grievance, due process, the security clause, and the constitutional myth Coke built from them.',
  castBlurb: 'Runnymede, 1215',
  castDesc: 'The king, the rebel barons, and the men who made a feudal settlement into a constitutional tradition.',
  castSubtitle: 'Runnymede, 1215 — the principals of the charter and its afterlife.',
  chapterLabel: n => `Magna Carta`,

  about: [
    `<em>Magna Carta</em> — the Great Charter — is the document that King John of England, defeated by his own barons, sealed at Runnymede beside the Thames on 15 June 1215. Sixty-three clauses, written in dog-Latin, settle a generation of baronial complaints: inheritance fees fixed at predictable levels, wardships and marriages regulated, debts to Jewish creditors governed, fishing weirs on the Thames and Medway addressed, forest rights circumscribed. Almost everything in the document is the granular settlement of feudal grievances by men whose customary rights had been violated and who wanted them put in writing. The charter as a working document lasted about ten weeks before Pope Innocent III annulled it and civil war resumed. John was dead by October 1216.`,
    `And then something remarkable happened. The regents of John's nine-year-old heir Henry III reissued a revised version of the charter as a peace measure within weeks of John's death. It was reissued again in 1217, again in 1225. Every subsequent medieval king of England confirmed it at coronation. Through those reissues it shed the most radical clause — the security clause empowering a baronial council to levy war on the king — and acquired the status of a freely granted compact rather than a document sealed under duress. Slowly, through two centuries of confirmation and citation, it transformed from an emergency settlement into one of the foundations of the English legal order. By the seventeenth century it was available to Edward Coke as the founding text of English liberties against royal absolutism — a reading that required considerable creative interpretation of the medieval original, and that the document has been bearing ever since.`,
    `Two clauses carry the constitutional weight. Clause 39: no free man shall be taken or imprisoned or disseised or outlawed or exiled or in any way destroyed, nor will we go upon him nor send upon him, except by the lawful judgment of his peers or by the law of the land. Clause 40: to no one will we sell, to no one will we deny or delay right or justice. In 1215, "free man" meant roughly a man holding land freely rather than as a serf — perhaps a fifth of the adult male population. In Coke's reading, it meant any Englishman. In the Fifth Amendment to the United States Constitution it became due process of law for everyone. The 1215 document and the document it became are not the same document. Both are worth reading, carefully and in order.`,
  ],

  chaptersSubtitle: 'The full text of the charter, preamble to security clause — sixty-three clauses in one reading.',
  chaptersLead: `<p>Magna Carta is a single continuous document: a royal preamble identifying the king and his advisors, sixty-three numbered clauses, and a closing security clause. The modern English text presented here follows the clause structure of the 1215 original. Read it in full once — it takes about thirty minutes. Slow down at clauses 1, 12, 13, 17, 20, 39, 40, 41, and 61.</p>`,

  themesByline: 'Five threads through the charter',
  themesLead: `Magna Carta is a feudal grievance document that became, over four centuries, the foundational text of the Anglo-American constitutional tradition. The distance between what it said in 1215 and what it was made to mean is the most important fact about it.`,

  castLead: `<p>The principals of Magna Carta are few: the king who sealed it under duress, the rebel barons who forced it, the archbishop who helped draft it, the pope who annulled it, and the seventeenth-century lawyer who made it into constitutional myth. The charter outlasted all of them.</p>`,

  groups: [
    {
      label: 'The Great Charter',
      subtitle: 'Preamble, sixty-three clauses, and the security clause — Runnymede, 15 June 1215.',
      chapters: [1],
    },
  ],

  themes: [
    {
      slug: 'feudal-grievance',
      title: 'A Feudal Grievance Document, Read in Its Time',
      greek: 'the barons were not rebelling for liberty; they were rebelling for customs',
      preview: 'The historian\'s first task with Magna Carta is to recover what most of it actually says. What it says is largely the rules of feudal land tenure as the great barons had learned to expect them — not philosophy, but the granular settlement of a generation of complaints.',
      essay: [
        `The charter is, in its 1215 form, an unmistakably medieval document. Clause 2 fixes the relief — the inheritance fee — payable by a baron's heir at one hundred pounds, against the variable and often crushing sums John had been demanding. Clauses 3 through 8 regulate the king's rights over the wardship and marriage of underage heirs, the most lucrative and most abusable of feudal incidents. Clause 12 forbids the levying of scutage or aid except by the common counsel of the kingdom — a clause about the fiscal grievances of the wealthy, not a declaration of universal taxation principle. Clauses 9 through 11 deal with the rules for distraining a debtor for unpaid debts, including specific provisions for debts owed to Jewish creditors that have come to the crown by escheat.`,
        `Clauses 33 and 47 and 48 regulate fish weirs on the Thames and the conduct of the royal forests, the latter a perennial source of baronial grievance against royal hunting privileges. Read in this register the document is not philosophy. It is the settlement of a generation of complaints by men whose feudal customs had been violated and who were determined to have those customs put in writing where the king could not deny them.`,
        `This is the part of the charter that makes scholarly readers cautious. To call it a foundation document of liberty is to read back into 1215 a constitutional tradition that grew up around it later. The barons were not rebelling for the rights of free men in general; they were rebelling for the rights of barons. The clauses about freemen often mean specifically men who held land freely rather than as serfs, and the protections offered are protections within the medieval legal order, not against it.`,
        `Yet to leave the analysis there is to miss the document's other dimension. Built into the working out of those grievances are sentences that, however local their original target, articulate principles capable of being lifted out of their feudal context and made to do larger work — and that is exactly what later centuries would do with them.`,
      ],
      where: [{ n: 1, label: 'Clauses 2-12 (feudal incidents and taxation)' }],
    },
    {
      slug: 'due-process',
      title: 'Clauses 39 and 40 — Due Process',
      greek: '"by the lawful judgment of his peers or by the law of the land"',
      preview: 'The two short clauses on which the constitutional afterlife of Magna Carta has chiefly rested are buried in the middle of the document. In 1215 they would not have looked like the most important provisions on the page.',
      essay: [
        `Clause 39 reads: nullus liber homo capiatur, vel imprisonetur, aut disseisietur, aut utlagetur, aut exuletur, aut aliquo modo destruatur, nec super eum ibimus, nec super eum mittemus, nisi per legale judicium parium suorum vel per legem terre. No free man shall be taken or imprisoned or disseised or outlawed or exiled or in any way destroyed, nor will we go upon him nor send upon him, except by the lawful judgment of his peers or by the law of the land. Clause 40 reads: nulli vendemus, nulli negabimus aut differemus rectum aut justitiam. To no one will we sell, to no one will we deny or delay right or justice.`,
        `The principles are old. Roman law had something like them. The customary law of the Anglo-Saxon and Norman kingdoms had something like them. The radical move in 1215 is to write them down and have them sealed by the king as binding obligations on his own conduct. The phrases per legale judicium parium suorum (by lawful judgment of his peers) and per legem terrae (by the law of the land) became, in the hands of later commentators, the textual seed for two of the central doctrines of Anglo-American legal thought: trial by jury and due process of law.`,
        `The 1354 statute of Edward III is the first place the Latin lex terrae is glossed by the English phrase due process of law, and from that gloss the doctrine carried straight into the Fifth Amendment. The fourteenth-century reading already assumes what the 1215 charter never quite said — that liber homo means free man in the broad sense and not a member of the feudal upper classes — and the broader reading is what makes the clauses the universal sentences they have become.`,
        `Read in 2026 the two clauses look unremarkable. Read against the centuries in which kings could imprison and outlaw and confiscate at their pleasure, and against the political and legal struggles by which the principle they articulate was made operative, they are the two short sentences from which a great deal of subsequent constitutional history has descended.`,
      ],
      where: [{ n: 1, label: 'Clauses 39 and 40 (the due-process clauses)' }],
    },
    {
      slug: 'security-clause',
      title: 'The Security Clause',
      greek: '"they may distrain and harass us by every means in their power"',
      preview: 'Clause 61, the longest and most extraordinary clause of the charter, has no parallel in any earlier or later legal document in the medieval tradition. It is a legal warrant for armed rebellion against the very king who is sealing it.',
      essay: [
        `Clause 61 establishes a council of twenty-five barons, chosen by the rebels themselves, with the standing power to receive complaints of any violation of the charter by the king or his officers, to compel redress within forty days, and, if redress is refused, to make war upon the king together with all the commons of the land. They may distrain and harass us by every means in their power — by seizing castles, lands, and possessions and any other way they can — until they obtain redress, saving only our person and the persons of our queen and children. The king is sworn to compel any of his subjects who refuse to support the twenty-five in this enforcement.`,
        `The clause is, in effect, a legal warrant for armed rebellion against the very king who is sealing it, exercisable on the say-so of a self-perpetuating baronial committee. It is a measure of how badly the political relationship between John and his barons had broken down by June 1215 that the barons did not believe the rest of the charter was worth anything without an enforcement mechanism that allowed them to fight him again on the basis of any future violation.`,
        `The pope's August annulment seized on the security clause as the most outrageous feature of the whole document — a king cannot be made subject to his own subjects in this way, and any oath sworn under such conditions is invalid. Innocent III was, on the medieval theory of kingship, almost certainly right. The reissues of 1216, 1217, and 1225 all dropped clause 61. What survived was the principle, much diluted, that the king's authority is conditional on his observance of the law.`,
        `Reading clause 61 now is reading the most radical sentence the medieval English constitution ever contained, and reading the reason that sentence had to be quietly removed before the rest of the charter could become respectable.`,
      ],
      where: [{ n: 1, label: 'Clause 61 (the security clause)' }],
    },
    {
      slug: 'coke-revival',
      title: 'The Coke Revival',
      greek: '"Magna Carta is such a fellow that he will have no sovereign"',
      preview: 'Magna Carta as a working political document fades through the late middle ages. The transformation that turned it into the constitutional myth that later centuries inherited is largely the work of one man: Sir Edward Coke.',
      essay: [
        `Magna Carta as a working political document fades through the late middle ages. Confirmed by every English king at coronation, cited by the Lords against Edward II and against Richard II, used in occasional cases by lawyers as authority on procedural points, it is a respected old document gradually losing relevance as the institutions of common law and parliament grow up around it and supersede most of its specific provisions.`,
        `The transformation is the work of Sir Edward Coke, lawyer, judge, parliamentarian, and the most learned figure in the early-seventeenth-century English legal world. Coke was Chief Justice of Common Pleas from 1606 and Chief Justice of King's Bench from 1613, dismissed by James I for taking too independent a line in conflicts between the common-law courts and the royal prerogative. In opposition, in his Institutes of the Laws of England — the second volume of which is a clause-by-clause commentary on Magna Carta — Coke read the 1215 document not as the feudal settlement it largely was but as the founding charter of English liberties against royal absolutism.`,
        `He read clauses 39 and 40 as guarantees of jury trial and due process for every Englishman; he read clause 12 as a precedent for parliamentary control of taxation; he drafted the Petition of Right of 1628 against Charles I's forced loans and arbitrary imprisonments, building the document explicitly on Magna Carta clauses 39 and 40 as he had taught the legal profession to read them.`,
        `The reinterpretation was not dishonest; it was the working out, over centuries, of principles the original had stated more narrowly than the later application required. But it is worth remembering that the Magna Carta of constitutional myth — universal, foundational, the guarantee of due process and the rule of law — is largely Coke's Magna Carta, and that the document sealed at Runnymede in 1215 was a much more limited thing than the document Coke and his successors taught us to read.`,
      ],
      where: [{ n: 1, label: 'Clauses 12, 39-40 (the clauses Coke deployed)' }],
    },
    {
      slug: 'american-inheritance',
      title: 'The American Inheritance',
      greek: 'from Runnymede to the Fifth Amendment',
      preview: 'By the time the English colonies in North America were being chartered in the seventeenth century, Coke\'s Magna Carta was already standard authority. That authority crossed the Atlantic and became the Fifth Amendment.',
      essay: [
        `By the time the English colonies in North America were being chartered in the seventeenth century, Coke's Magna Carta was standard authority in the legal training of every educated English lawyer, and that authority crossed the Atlantic with the colonial charters. The Virginia Charter of 1606 promised the colonists all the liberties, franchises, and immunities of free denizens of England — which, in the Cokean reading, meant all the rights guaranteed by Magna Carta.`,
        `The Massachusetts Body of Liberties of 1641 paraphrased clauses 39 and 40 as the guarantee that no man's life shall be taken away, no man's honour or good name shall be stained, no man's person shall be arrested, restrained, banished, dismembered, nor any way punished — except by virtue or equity of some express law of the country warranting the same. Pennsylvania's Frame of Government, Maryland's Toleration Act, the New York colonial constitution all show the same pattern.`,
        `By the time of the imperial crisis of the 1760s and 1770s, the colonists were arguing against parliamentary taxation by direct appeal to Magna Carta and the principles Coke had read into it. The Declaration of Independence of 1776 names a string of grievances against George III that read, in many places, like clause-by-clause complaints under Coke's Magna Carta.`,
        `The Fifth Amendment to the United States Constitution of 1791 — no person shall be deprived of life, liberty, or property without due process of law — is, in legal substance, clause 39 of the 1215 charter as Coke had taught the English lawyers to read it. The Fourteenth Amendment of 1868 extends the same principle to the states. The American constitutional tradition is, at one of its load-bearing points, a transatlantic prolongation of the document the rebel barons forced on King John eight hundred years ago.`,
      ],
      where: [{ n: 1, label: 'Clauses 39-40 (the clauses that crossed the Atlantic)' }],
    },
  ],

  keyFigures: [
    {
      name: 'King John',
      role: 'Reigning sovereign',
      body: `Born 1166, the youngest of Henry II's surviving sons. Lost Normandy and most of the Plantagenet continental empire to Philip Augustus at Bouvines in 1214. Surrendered England to the pope as a feudal fief in 1213. Alienated his greatest barons through arbitrary fines and personal cruelties. Sealed the charter under duress on 15 June 1215; repudiated it within weeks once Innocent III annulled it. Died of dysentery at Newark Castle in October 1216, in the middle of the renewed civil war his repudiation had reignited.`,
    },
    {
      name: 'Sir Edward Coke',
      role: 'The interpreter (1552–1634)',
      body: `Not a contemporary of the charter but the figure who, more than any other, made it the constitutional document later centuries inherited. Chief Justice of Common Pleas, then King's Bench; dismissed by James I; turned to parliamentary opposition and to the writing of his Institutes of the Laws of England. Read clauses 39 and 40 as due process and jury trial for every Englishman. Drafted the Petition of Right of 1628. Without Coke, Magna Carta would be remembered as a feudal document of antiquarian interest.`,
    },
  ],

  cast: [
    {
      id: 'king-john',
      name: 'King John',
      role: 'REIGNING SOVEREIGN',
      body: `Born 1166, the youngest of Henry II's surviving sons, succeeded his brother Richard the Lionheart in 1199. By 1215 he has lost Normandy, Anjou, and most of the Plantagenet continental empire to Philip Augustus of France, in a series of military disasters culminating at the battle of Bouvines in July 1214. He has lost the political contest with Pope Innocent III over the appointment of Stephen Langton as Archbishop of Canterbury, ended only by his humiliating submission of England as a papal fief in 1213. He has lost the loyalty of large sections of the English baronage, who blame him for the lost lands, the ruinous taxation imposed to fund the failed wars, the arbitrary use of feudal incidents — wardships, marriages, reliefs — to crush enemies and enrich the crown, the personal cruelties (the death of Matilda de Briouze and her son in his prison), the sustained pattern of contempt for the customary obligations a king owed his great men. In May 1215 the rebel barons formally renounce their homage. They take London on 17 May. Negotiations open. On 15 June, in the meadow of Runnymede between Windsor and Staines, the king sets his seal to the document the barons have prepared.`,
    },
    {
      id: 'rebel-barons',
      name: 'The Rebel Barons',
      role: 'INSURGENTS',
      body: `The great northern and eastern barons who renounced their homage to John in May 1215 and forced the Runnymede meeting. Robert FitzWalter, lord of Dunmow, called himself Marshal of the Army of God and Holy Church and was the political leader; Eustace de Vesci, Saer de Quincy earl of Winchester, William de Mowbray, Geoffrey de Mandeville earl of Essex, and the men of the same circle were the core. They called themselves the Army of God; their grievances were partly personal (John had imprisoned several of them or their relatives, fined them ruinously, exploited their wardships and marriages) and partly structural (the Plantagenet system of arbitrary feudal demands had become, in their view, intolerable under John's particular use of it). The twenty-five barons of clause 61's enforcement council were drawn from this group. Their political horizon was largely class-bound — the rights they secured were chiefly the rights of barons — but the language they forced on John was capable of being read more broadly, and the later reading is what made them, retrospectively, reformers rather than rebels.`,
    },
    {
      id: 'stephen-langton',
      name: 'Stephen Langton',
      role: 'ARCHBISHOP / MEDIATOR',
      body: `Archbishop of Canterbury from 1213, the Paris-trained theologian whose appointment by Pope Innocent III over John's bitter objection had triggered the 1208-1213 interdict over England. Once installed, Langton played the unexpected role of mediator between the rebel barons and the king he had been imposed on. He preached a famous sermon at St Paul's in 1213 invoking the coronation charter of Henry I — itself a precedent for limited monarchy — and is generally credited with having shaped the political theology that lay behind the barons' demand for a written charter. He was present at the negotiations leading up to Runnymede; clause 1 of the charter, on the freedom of the English Church, is his particular contribution. He was suspended from office by Innocent III later in 1215 for his role in the rebellion. The presence of an educated theologian in the negotiating circle is part of what gives the 1215 charter its capacity for principled language amid the granular grievances.`,
    },
    {
      id: 'pope-innocent-iii',
      name: 'Pope Innocent III',
      role: 'PAPAL OVERLORD',
      body: `Pope from 1198 to 1216, the most politically powerful pope of the high middle ages, the figure whose excommunication of John in 1209 and interdict over England had eventually forced John's submission of the kingdom as a papal fief in 1213. By 1215 John was, in feudal law, the pope's vassal, and the rebel barons' charter was therefore an attack on the pope's tenant. Innocent's bull of 24 August 1215, Etsi karissimus, annulled the charter in full as illegal, unjust, harmful to royal rights, and shameful to the English people, and absolved John from his oath to observe it. The annulment is the immediate reason the 1215 charter as a working document lasted only about ten weeks before civil war resumed. Innocent's death the following year, and the political need of the regents of John's young son Henry III to reissue a modified version of the charter as a peace measure, are what allowed the document to survive at all into the longer English constitutional tradition.`,
    },
    {
      id: 'edward-coke',
      name: 'Sir Edward Coke',
      role: 'INTERPRETER (1552-1634)',
      body: `Not a contemporary but the figure who, more than any other, made Magna Carta the constitutional document later centuries inherited. Lawyer, judge, Member of Parliament, the most learned common lawyer of the Elizabethan and early Stuart era. As Chief Justice he clashed repeatedly with James I over the limits of the royal prerogative; dismissed in 1616, he turned to opposition in Parliament and to the writing of his Institutes of the Laws of England, the second part of which is a clause-by-clause commentary on Magna Carta. Coke read the 1215 charter as the founding statement of English liberty against royal tyranny and gave clauses 39 and 40 the broad due-process and jury-trial reading that they have carried ever since. Drafted the Petition of Right of 1628 against Charles I's forced loans and arbitrary imprisonments, building the document explicitly on the Magna Carta clauses as he had taught the legal profession to read them. Without Coke, Magna Carta would probably be remembered as a feudal document of antiquarian interest. With him, it became the foundation stone of the Anglo-American constitutional tradition.`,
    },
    {
      id: 'free-men',
      name: 'The Free Men',
      role: 'BENEFICIARIES (RETROSPECTIVE)',
      body: `The liberi homines of clause 39 — the free men whose protection from arbitrary imprisonment and dispossession is the most enduring of the charter's specific guarantees. In 1215 the term meant something narrower than later centuries would read into it. A free man, in the feudal vocabulary of the early thirteenth century, was a man who held his land by free tenure rather than as a villein bound to the soil; perhaps a fifth of the English adult male population, by some estimates, qualified, and the protections of the charter therefore did not extend to the unfree majority of the country. The political meaning broadened slowly through the late medieval and early modern centuries as villeinage withered away and the term free man came to mean simply free Englishman or, eventually, simply person. By the time the United States Constitution adopted the principle of clause 39 in the Fifth Amendment, the qualification had effectively dropped away, and the protection had become — at least in formal law — universal. The history of who counts as a free man under the descendant clauses of Magna Carta is the history of the slow extension of the rule of law to populations the original drafters did not have in mind, and that history is still being written.`,
    },
  ],

  castGroups: [
    {
      label: 'The principals of 1215',
      characters: [
        {
          id: 'king-john',
          tag: 'Sovereign',
          name: 'King John',
          epithet: 'King of England, 1199–1216',
          body: `Born 1166, the youngest of Henry II's surviving sons, succeeded his brother Richard the Lionheart in 1199. By 1215 he has lost Normandy, Anjou, and most of the Plantagenet continental empire to Philip Augustus of France, in a series of military disasters culminating at the battle of Bouvines in July 1214. He has lost the political contest with Pope Innocent III over the appointment of Stephen Langton as Archbishop of Canterbury, ended only by his humiliating submission of England as a papal fief in 1213. He has lost the loyalty of large sections of the English baronage, who blame him for the lost lands, the ruinous taxation imposed to fund the failed wars, the arbitrary use of feudal incidents — wardships, marriages, reliefs — to crush enemies and enrich the crown, the personal cruelties (the death of Matilda de Briouze and her son in his prison), the sustained pattern of contempt for the customary obligations a king owed his great men. In May 1215 the rebel barons formally renounce their homage. They take London on 17 May. Negotiations open. On 15 June, in the meadow of Runnymede between Windsor and Staines, the king sets his seal to the document the barons have prepared.`,
          appears: [1],
        },
        {
          id: 'rebel-barons',
          tag: 'Insurgents',
          name: 'The Rebel Barons',
          epithet: 'The Army of God and Holy Church',
          body: `The great northern and eastern barons who renounced their homage to John in May 1215 and forced the Runnymede meeting. Robert FitzWalter, lord of Dunmow, called himself Marshal of the Army of God and Holy Church and was the political leader; Eustace de Vesci, Saer de Quincy earl of Winchester, William de Mowbray, Geoffrey de Mandeville earl of Essex, and the men of the same circle were the core. They called themselves the Army of God; their grievances were partly personal (John had imprisoned several of them or their relatives, fined them ruinously, exploited their wardships and marriages) and partly structural (the Plantagenet system of arbitrary feudal demands had become, in their view, intolerable under John's particular use of it). The twenty-five barons of clause 61's enforcement council were drawn from this group. Their political horizon was largely class-bound — the rights they secured were chiefly the rights of barons — but the language they forced on John was capable of being read more broadly, and the later reading is what made them, retrospectively, reformers rather than rebels.`,
          appears: [1],
        },
        {
          id: 'stephen-langton',
          tag: 'Mediator',
          name: 'Stephen Langton',
          epithet: 'Archbishop of Canterbury',
          body: `Archbishop of Canterbury from 1213, the Paris-trained theologian whose appointment by Pope Innocent III over John's bitter objection had triggered the 1208-1213 interdict over England. Once installed, Langton played the unexpected role of mediator between the rebel barons and the king he had been imposed on. He preached a famous sermon at St Paul's in 1213 invoking the coronation charter of Henry I — itself a precedent for limited monarchy — and is generally credited with having shaped the political theology that lay behind the barons' demand for a written charter. He was present at the negotiations leading up to Runnymede; clause 1 of the charter, on the freedom of the English Church, is his particular contribution. He was suspended from office by Innocent III later in 1215 for his role in the rebellion. The presence of an educated theologian in the negotiating circle is part of what gives the 1215 charter its capacity for principled language amid the granular grievances.`,
          appears: [1],
        },
        {
          id: 'pope-innocent-iii',
          tag: 'Overlord',
          name: 'Pope Innocent III',
          epithet: 'Papal overlord, 1198–1216',
          body: `Pope from 1198 to 1216, the most politically powerful pope of the high middle ages, the figure whose excommunication of John in 1209 and interdict over England had eventually forced John's submission of the kingdom as a papal fief in 1213. By 1215 John was, in feudal law, the pope's vassal, and the rebel barons' charter was therefore an attack on the pope's tenant. Innocent's bull of 24 August 1215, Etsi karissimus, annulled the charter in full as illegal, unjust, harmful to royal rights, and shameful to the English people, and absolved John from his oath to observe it. The annulment is the immediate reason the 1215 charter as a working document lasted only about ten weeks before civil war resumed. Innocent's death the following year, and the political need of the regents of John's young son Henry III to reissue a modified version of the charter as a peace measure, are what allowed the document to survive at all into the longer English constitutional tradition.`,
          appears: [1],
        },
      ],
    },
    {
      label: 'The afterlife',
      characters: [
        {
          id: 'edward-coke',
          tag: 'Interpreter',
          name: 'Sir Edward Coke',
          epithet: '1552–1634, Chief Justice and parliamentarian',
          body: `Not a contemporary but the figure who, more than any other, made Magna Carta the constitutional document later centuries inherited. Lawyer, judge, Member of Parliament, the most learned common lawyer of the Elizabethan and early Stuart era. As Chief Justice he clashed repeatedly with James I over the limits of the royal prerogative; dismissed in 1616, he turned to opposition in Parliament and to the writing of his Institutes of the Laws of England, the second part of which is a clause-by-clause commentary on Magna Carta. Coke read the 1215 charter as the founding statement of English liberty against royal tyranny and gave clauses 39 and 40 the broad due-process and jury-trial reading that they have carried ever since. Drafted the Petition of Right of 1628 against Charles I's forced loans and arbitrary imprisonments, building the document explicitly on the Magna Carta clauses as he had taught the legal profession to read them. Without Coke, Magna Carta would probably be remembered as a feudal document of antiquarian interest. With him, it became the foundation stone of the Anglo-American constitutional tradition.`,
          appears: [1],
        },
        {
          id: 'free-men',
          tag: 'Beneficiaries',
          name: 'The Free Men',
          epithet: 'The liberi homines of clause 39',
          body: `The liberi homines of clause 39 — the free men whose protection from arbitrary imprisonment and dispossession is the most enduring of the charter's specific guarantees. In 1215 the term meant something narrower than later centuries would read into it. A free man, in the feudal vocabulary of the early thirteenth century, was a man who held his land by free tenure rather than as a villein bound to the soil; perhaps a fifth of the English adult male population, by some estimates, qualified, and the protections of the charter therefore did not extend to the unfree majority of the country. The political meaning broadened slowly through the late medieval and early modern centuries as villeinage withered away and the term free man came to mean simply free Englishman or, eventually, simply person. By the time the United States Constitution adopted the principle of clause 39 in the Fifth Amendment, the qualification had effectively dropped away, and the protection had become — at least in formal law — universal. The history of who counts as a free man under the descendant clauses of Magna Carta is the history of the slow extension of the rule of law to populations the original drafters did not have in mind, and that history is still being written.`,
          appears: [1],
        },
      ],
    },
  ],

  chapters: [
    {
      n: 1,
      title: 'Magna Carta',
      tourTitle: 'The Great Charter',
      hook: 'Sixty-three clauses sealed at Runnymede on 15 June 1215 — from feudal fish weirs to the two sentences that found the due-process tradition.',
      tour: `Read the charter in full once — it takes about half an hour. The opening preamble (where John identifies himself by his full title and lists his advisors) and the closing security clause (clause 61) frame the whole. Slow down at clauses 1 (the church), 12 (no taxation without common counsel), 13 (the liberties of London and the cities), 17 (common pleas to be heard at a fixed place, not following the king), 20 (amercements proportionate to the offence), 39 and 40 (the famous due-process clauses), 41 (foreign merchants), 45 (the king will appoint as judges only those who know the law), 52 (immediate restoration of unjustly seized lands), and 61 (the security clause). Skim the clauses on feudal incidents and forest law; they are the bulk of the document but no one reads them carefully now. Then read clauses 39 and 40 again. Everything later constitutional history did with Magna Carta is downstream of those two sentences.`,
      blurb: `The full text of the charter sealed at Runnymede on 15 June 1215: preamble, sixty-three clauses governing feudal tenure, taxation, justice, and the rights of free men, and the security clause empowering a baronial council to levy war on the king if he should violate its terms.`,
      summary: [
        `By the spring of 1215, King John of England has lost almost everything that mattered to him. He has lost Normandy and most of the Angevin continental empire to Philip Augustus of France, in a series of military disasters culminating at the battle of Bouvines in July 1214. He has lost the political contest with Pope Innocent III over the appointment of Stephen Langton as Archbishop of Canterbury, ended only by his humiliating submission of England as a papal fief in 1213. He has lost the loyalty of large sections of the English baronage, who blame him for the lost lands, the ruinous taxation imposed to fund the failed wars, the arbitrary use of feudal incidents — wardships, marriages, reliefs — to crush enemies and enrich the crown, the personal cruelties (the death of Matilda de Briouze and her son in his prison), the sustained pattern of contempt for the customary obligations a king owed his great men. In May 1215 the rebel barons formally renounce their homage. They take London on 17 May. Negotiations open. On 15 June, in the meadow of Runnymede between Windsor and Staines, the king sets his seal to the document the barons have prepared.`,
        `The text, sixty-three clauses in dog-Latin, is mostly a feudal-grievance document. It opens with the freedom of the English Church and the famous concession that the church shall be free, beginning with the freedom of elections. It runs through clauses on the relief due from a baron's heir on entering his inheritance (clause 2), on wardships and marriages (clauses 3-8), on debts to the king and to Jewish creditors (clauses 10-11), on scutage and aid (clause 12, the no-taxation-without-the-common-counsel-of-the-realm clause), on standard measures of wine and corn (clause 35), on fishing weirs on the Thames and Medway (clause 33), on the regulation of the royal forests (clauses 47-48), on knight service, on jury composition, on the rights of widows. Clauses 39 and 40, almost lost in the middle of the document, are the two that the centuries would single out. No free man shall be taken or imprisoned or disseised or outlawed or exiled or in any way destroyed, nor will we go upon him nor send upon him, except by the lawful judgment of his peers or by the law of the land. To no one will we sell, to no one will we deny or delay right or justice. The charter ends with clause 61, the security clause, by which a council of twenty-five barons is empowered to enforce its terms by levying war on the king if he should violate them.`,
        `The 1215 charter as a working document lasted about ten weeks. John appealed to Pope Innocent III, who annulled it on 24 August as shameful and demeaning, and renewed civil war broke out almost immediately. John died of dysentery in October 1216, and the regents of the boy king Henry III reissued a revised version of the charter as a peace measure within weeks. Reissued again in 1217, in 1225 (this time as a freely granted charter rather than one extracted under duress), and confirmed by every subsequent medieval king as a condition of his coronation, the charter slowly transformed from an emergency settlement of a baronial revolt into one of the foundation documents of the English legal order. The constitutional reading — that Magna Carta established the rule of law, due process, and limits on arbitrary monarchy — was largely the work of Sir Edward Coke and the parliamentary lawyers of the early seventeenth century, who deployed it against the Stuart kings as the great precedent for their own resistance. From Coke it passed into the English common-law tradition, the American colonial charters, the Petition of Right of 1628, the Bill of Rights of 1689, the Fifth and Fourteenth Amendments to the United States Constitution, and the Universal Declaration of Human Rights of 1948. The 1215 document and the document it became are not the same document. Both deserve reading.`,
      ],
      appears: [
        { id: 'king-john', name: 'King John' },
        { id: 'rebel-barons', name: 'The Rebel Barons' },
        { id: 'stephen-langton', name: 'Stephen Langton' },
        { id: 'pope-innocent-iii', name: 'Pope Innocent III' },
      ],
      themes: [
        { slug: 'feudal-grievance', label: 'Feudal grievance' },
        { slug: 'due-process', label: 'Due process' },
        { slug: 'security-clause', label: 'The security clause' },
      ],
    },
  ],
};
