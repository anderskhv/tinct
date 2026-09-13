"""Manually authored recognition copy for The Federalist Papers.

85 essays (edition chapters 1-85, "No. 1" through "No. 85"), 1279
paragraphs, identical structure in both English editions. This is a
political-essay treatise with no narrative or staged dialogue: the
essays argue a case rather than dramatize events, so per editorial
policy's guidance for treatises -- "provide useful people/reference
identification without inventing a fictional cast or calling the
author a protagonist" -- every entry below is Reference. There is no
Central, Major, or Supporting entry.

The cast falls into several groups:

- **The authorship itself.** PUBLIUS is the single shared pen name
  under which Hamilton, Madison, and Jay jointly published every essay;
  it appears once in body text (11, 14), quoted from a French-language
  source citing the essays. Separately, essays No. 18-20 carry a
  literal byline as their opening line of paragraph text -- "MADISON,
  with HAMILTON" -- marking the historically documented disputed joint
  authorship of those three essays specifically. HAMILTON and MADISON
  are each bound once, from that byline text, distinct from PUBLIUS.
- **Named Anti-Federalist critics and their pseudonyms**, cited and
  answered by name in the footnotes: Mr. Abraham Yates (73) under his
  real name; Luther Martin (78, "Martin's Speech") under his real
  name; and two rival essayists cited only by pen name, exactly the
  kind of pseudonym hazard the automation queue's own Kierkegaard
  example warns about -- CATO (67, "See CATO, No. V") and the "federal
  farmer" (68, "Vide federal farmer"), plus a third pseudonymous
  newspaper writer, TAMONY (69), whose real identity this text never
  reveals and which is not resolved here.
- **Political and legal authorities cited for a doctrine or maxim**:
  Montesquieu (heavily, on separation of powers and confederate
  republics), Blackstone (English common law), Hume (political
  essays), Grotius, De Lolme, Junius (himself a still-disputed
  pseudonym, quoted approvingly by name), Rutherford, Burgh, Plato,
  Socrates, Jefferson (Notes on the State of Virginia), Sir William
  Temple, the Abbe Mably, the Abbe Milot, Polybius, and Plutarch.
- **Ancient lawgivers and city-founders**, all cited in a single
  historical survey at No. 38: Minos, Zaleucus, Theseus, Draco, Solon,
  Lycurgus, Romulus, Numa (Numa Pompilius), Tullius Hostilius, Brutus
  (the Roman consul who ended the monarchy -- NOT the Anti-Federalist
  pen name of the same word; see the namesake check below),
  Amphictyon, Achaeus, and Aratus.
- **Figures from Greek confederacy history**, cited across the essays
  on ancient leagues: Cleomenes, Philopoemen, Callicrates, Demosthenes
  (as a historical source), Xerxes, Philip of Macedon, Alexander the
  Great, Pericles, Aspasia, Phidias, and Lysander -- plus Hannibal and
  Scipio from the Punic Wars, and Homer.
- **European monarchs and courtiers cited as historical exempla**:
  Charles VII of France, the Emperor Charles V, Henry VIII, Cardinal
  Wolsey, Pope Julius II, Louis XIV, William III (referred to as
  "Prince of Orange" at two of his three occurrences), Charles I,
  Charles II, James II, George II, King John (Magna Carta), Maximilian
  I (Holy Roman Emperor), Victor Amadeus of Savoy, Thuanus (the
  historian, cited as a source), Necker (the French finance minister,
  spelled two ways across editions), Madame de Maintenon, the Duchess
  of Marlborough, and the Duke of Marlborough -- the last two being a
  genuine namesake pair, see the check below.
- **Contemporary British and American figures**: Mr. Jenkinson, the
  Earl of Chesterfield, Daniel Shays (Shays' Rebellion), and Charles
  James Fox ("Mr. Fox's India bill").
- **A title-only reference resolved from context**: "the late king of
  Prussia" (19), unambiguously Frederick II given the essay's 1787-88
  publication date and Frederick's death in 1786 -- the same
  title-only resolution pattern used for the Bishop of Autun and the
  Empress of Russia in Vindication.
- **Named collective bodies**, bound as kind `group`: the Ephori
  (Sparta), the Tribunes (Rome), the Cosmi (Crete), and the Decemvirs
  (Rome).

## Namesake check: "Brutus"

The automation queue explicitly flags this book's genre for exactly
this hazard: the historical Roman Brutus versus the pseudonymous
Anti-Federalist essayist "Brutus" (widely attributed to Robert Yates),
who wrote in direct opposition to these very essays. A full-text search
for "Brutus" turns up exactly one occurrence in the whole book (38, 1),
and it is unambiguously the Roman consul: "the consular administration
was substituted by Brutus, who stepped forward with a project for such
a reform..." -- part of a matter-of-fact list of ancient lawgivers
(Minos, Zaleucus, Theseus, Draco, Solon, Lycurgus, Romulus, Numa,
Tullius Hostilius, Brutus, Amphictyon, Achaeus, Aratus). Publius never
names his Anti-Federalist opponent "Brutus" anywhere in the body text,
so there is no collision to resolve -- only one Brutus is ever bound,
and it is the Roman one.

## Namesake check: "Marlborough"

A genuine pair, hiding in adjacent footnotes of No. 6. Footnotes 6-8
attach to one sentence -- "the bigotry of one female,(6) the
petulance of another,(7) and the cabals of a third,(8)" -- identified
in the footnotes themselves as Madame de Maintenon (6), the Duchess of
Marlborough (7), and Madame de Pompadour (8): royal mistresses/court
favorites blamed for wars. Footnote 10, four paragraphs later, attaches
to a different sentence entirely -- "the ambition, or rather the
avarice, of a favorite leader(10)" prolonging the War of the Spanish
Succession -- and reads "The Duke of Marlborough." These are two
different real people who share a surname: Sarah Churchill, Duchess of
Marlborough (the court favorite of footnote 7) and her husband John
Churchill, 1st Duke of Marlborough (the military commander of footnote
10). Bound as two separate entities with distinct aliases ("Duchess of
Marlborough" vs. "Duke of Marlborough"), so the two never merge.

Demonyms and generic titles are deliberately left unbound throughout:
Lacedaemonians/Spartans, Athenians, Thebans, Persians, Romans, Franks,
Gauls, Phocians. Generic office-titles with no historically resolvable
individual are also left alone: "the elector of Saxony" (19, 8, one of
many electors across centuries, no era-specific detail given), "the
Duke of Bavaria" (19, 12, likewise unspecific), "the Abbe de St. Croix"
(19, 12, too minor and unspecific an anecdote to identify further),
and the unnamed "King of France," "King of Aragon," and "Kings of
Egypt and Syria" cited only by office (6, 26 footnote; 18, 18).
"""
import json
from pathlib import Path

entities = []


def add(id, name, body, aliases='', category='reference', kind='person'):
    entities.append(dict(
        id=id, name=name, body=body,
        aliases=aliases.split('|') if aliases else [],
        category=category, kind=kind, subtitle='', snapshots=[],
    ))


for row in [
    # --- The authorship itself ---
    ('publius', 'Publius',
     "The shared pen name under which Hamilton, Madison, and Jay jointly "
     "published every one of these essays -- appears once in body text, "
     "quoted within a French-language citation of the essays themselves "
     "(\"Recherches philosophiques sur les Americains\"), not as a claim "
     "of individual identity.",
     'PUBLIUS', 'reference', 'person'),
    ('hamilton', 'Hamilton',
     "Alexander Hamilton, named directly (not merely as Publius) in the "
     "literal opening line of essays No. 18-20 -- \"MADISON, with "
     "HAMILTON\" -- an editorial byline marking the historically "
     "documented disputed joint authorship of those three essays "
     "specifically.",
     'HAMILTON', 'reference', 'person'),
    ('madison', 'Madison',
     "James Madison, named directly in the same three-essay byline as "
     "Hamilton (No. 18-20): \"MADISON, with HAMILTON.\"",
     'MADISON', 'reference', 'person'),

    # --- Named Anti-Federalist critics and pseudonyms ---
    ('abraham-yates', 'Abraham Yates',
     "Named as \"Mr. Abraham Yates, a warm opponent of the plan of the "
     "convention,\" cited in a footnote as one of the qualified negative's "
     "converts: an opponent of ratification who nonetheless came to "
     "admire the analogous power already vested in New York's council of "
     "revision.",
     'Abraham Yates', 'reference', 'person'),
    ('luther-martin', 'Martin',
     "Cited by surname only in a footnote directing the reader to \"the "
     "Protest of the Minority of the Convention of Pennsylvania, Martin's "
     "Speech, etc.\" -- Luther Martin, a Constitutional Convention "
     "delegate who refused to sign and became a leading Anti-Federalist "
     "pamphleteer.",
     'Martin', 'reference', 'person'),
    ('cato-pseudonym', 'Cato',
     "A pseudonymous Anti-Federalist essayist, cited once in a footnote "
     "(\"See CATO, No. V\") as the author of the false claim that the "
     "Constitution lets the President fill Senate vacancies -- a claim "
     "Publius spends the rest of the essay refuting. The real identity "
     "behind the pen name is historically disputed and is not resolved "
     "by this text.",
     'CATO', 'reference', 'person'),
    ('federal-farmer', 'The Federal Farmer',
     "A pseudonymous Anti-Federalist essayist, cited once in a footnote "
     "(\"Vide federal farmer\") as having conceded that the election of "
     "the President is \"pretty well guarded\" -- the most favorable "
     "assessment of that part of the plan that any opponent had offered "
     "in print. The real identity behind the pen name is historically "
     "disputed and is not resolved by this text.",
     'federal farmer', 'reference', 'person'),
    ('tamony', 'Tamony',
     "A pseudonymous writer in a Pennsylvania newspaper, cited in a "
     "footnote for the false claim that the king of Great Britain's "
     "command of the militia derives from an annual mutiny bill -- a "
     "claim the footnote goes on to refute at length by citing "
     "Blackstone. The real identity behind the pen name is not given by "
     "this text.",
     'TAMONY', 'reference', 'person'),

    # --- Authorities cited for a doctrine, maxim, or precedent ---
    ('montesquieu', 'Montesquieu',
     "The most heavily cited authority in the book: \"the oracle who is "
     "always consulted\" on separation of powers, quoted at length on "
     "why liberty requires the legislative, executive, and judicial "
     "powers to stay apart, and separately quoted (and named) on the "
     "advantages of a confederate republic and on the imperfection of "
     "Germany's confederation. His analysis of the British Constitution "
     "is treated as the source of the separation-of-powers maxim itself.",
     'Montesquieu', 'reference', 'person'),
    ('blackstone', 'Blackstone',
     "Sir William Blackstone, cited repeatedly for points of English "
     "common law: on the king's immemorial command of the militia (69, "
     "footnote), on the king's sole possession of the treaty power (69, "
     "footnote), on arbitrary imprisonment as \"a less public, a less "
     "striking, and therefore a more dangerous engine of arbitrary "
     "government\" than open despotism, and on habeas corpus as \"the "
     "BULWARK of the British Constitution\" (both 84).",
     'Blackstone', 'reference', 'person'),
    ('hume', 'Hume',
     "David Hume, quoted in the closing essay's final footnote on the "
     "slow, experimental nature of constitution-making: \"EXPERIENCE "
     "must guide their labor; TIME must bring it to perfection.\"",
     'Hume', 'reference', 'person'),
    ('grotius', 'Grotius',
     "Cited twice: for the remark that only the Dutch people's hatred of "
     "the House of Austria kept them from ruin under their own "
     "constitution's vices, and in a closing footnote on states' "
     "obligations surviving a change of government.",
     'Grotius', 'reference', 'person'),
    ('de-lolme', 'De Lolme',
     "Cited in a footnote as the source of a maxim Publius endorses -- "
     "attributed there via Junius's praise of him as \"deep, solid, and "
     "ingenious\" -- that executive power is more safely confined when "
     "it is vested in one man rather than a plural body.",
     'De Lolme', 'reference', 'person'),
    ('junius', 'Junius',
     "A pseudonymous English political letter-writer -- himself a "
     "still-disputed identity -- quoted approvingly by that name for "
     "having called De Lolme \"deep, solid, and ingenious.\"",
     'Junius', 'reference', 'person'),
    ('rutherford', 'Rutherford',
     "Cited in a footnote (\"Rutherford's Institutes\") alongside "
     "Grotius as authority for the principle that a state's obligations "
     "survive a change in the form of its government.",
     'Rutherford', 'reference', 'person'),
    ('burgh', 'Burgh',
     "Cited in a footnote as the source (\"Political Disquisitions\") of "
     "the statistics on how few electors choose half of Britain's House "
     "of Commons.",
     'Burgh', 'reference', 'person'),
    ('plato', 'Plato',
     "Invoked for his wish for a race of philosopher-kings, cited as a "
     "byword for the near-impossibility of a nation governed purely by "
     "reason rather than prejudice and precedent.",
     'Plato', 'reference', 'person'),
    ('socrates', 'Socrates',
     "Invoked as a byword for irreproachable individual wisdom, in the "
     "aside that \"had every Athenian citizen been a Socrates, every "
     "Athenian assembly would still have been a mob\" -- an argument "
     "against relying on the wisdom of large deliberative bodies.",
     'Socrates', 'reference', 'person'),
    ('jefferson', 'Jefferson',
     "Thomas Jefferson, named as \"Mr. Jefferson\" and quoted at length "
     "from his \"Notes on the State of Virginia\" on how Virginia's "
     "constitution failed to erect any real barrier between its "
     "legislative, executive, and judicial powers despite declaring them "
     "separate on paper; also credited as the author of a proposed "
     "Virginia constitution that would let any two branches call a "
     "convention to correct constitutional breaches.",
     'Jefferson', 'reference', 'person'),
    ('sir-william-temple', 'Sir William Temple',
     "An English diplomat, quoted twice on the weaknesses of the Dutch "
     "confederacy: on foreign ministers exploiting its divided councils "
     "to delay treaties, and on Holland's wealth substituting for "
     "authority during gaps in the stadtholdership.",
     'Sir William Temple', 'reference', 'person'),
    ('abbe-mably', 'The Abbe Mably',
     "A French writer, quoted twice: on the stadtholder as the only "
     "\"spring\" capable of holding the Dutch Union together, and on how "
     "the Achaean league's general authority tempered popular government "
     "that was turbulent everywhere else in Greece.",
     'Abbe Mably', 'reference', 'person'),
    ('abbe-milot', 'The Abbe Milot',
     "A historian, quoted on how Athens and Sparta, flush with victory "
     "over Persia, squandered the chance for closer Greek union and "
     "instead became rivals and then enemies.",
     'Abbe Milot', 'reference', 'person'),
    ('polybius', 'Polybius',
     "Cited as the historical source for the claim that Carthage's "
     "senate had already lost most of its original power by the start "
     "of the Second Punic War.",
     'Polybius', 'reference', 'person'),
    ('plutarch', 'Plutarch',
     "Cited three times: as the source (via a footnote, \"Plutarch's "
     "Life of Pericles\") for the Aspasia anecdote, for the observation "
     "that the deputies of stronger Amphictyonic cities routinely awed "
     "and corrupted the deputies of weaker ones, and, alongside other "
     "historians, for the claim that Solon was compelled by his "
     "fellow-citizens to take on sole power to remodel the Athenian "
     "constitution.",
     'Plutarch', 'reference', 'person'),

    # --- Ancient lawgivers and city-founders (No. 38) ---
    ('minos', 'Minos',
     "Cited as the legendary founder of the government of Crete, opening "
     "a survey of ancient lawgivers who each singlehandedly framed a "
     "constitution rather than leaving the task to an assembly.",
     'Minos', 'reference', 'person'),
    ('zaleucus', 'Zaleucus',
     "Cited as the founder of the government of the Locrians, in the "
     "same survey of solitary ancient lawgivers as Minos.",
     'Zaleucus', 'reference', 'person'),
    ('theseus', 'Theseus',
     "Cited as the first to institute the government of Athens, followed "
     "later by Draco and Solon.",
     'Theseus', 'reference', 'person'),
    ('draco', 'Draco',
     "Cited as having reformed the government of Athens after Theseus, "
     "entrusted by the Athenians with what the text calls \"indefinite "
     "powers to reform its government and laws.\"",
     'Draco', 'reference', 'person'),
    ('solon', 'Solon',
     "Cited as having reformed Athens's government after Draco; the "
     "essay adds, citing Plutarch, that Solon was compelled by universal "
     "suffrage to take sole power to remodel the constitution, and that "
     "he confessed he had given his countrymen not the best government "
     "but the one most tolerable to their prejudices. Also cited earlier "
     "(63) among examples of ancient popular election, as one of the "
     "nine Archons annually elected at large before his own reforms.",
     'Solon', 'reference', 'person'),
    ('lycurgus', 'Lycurgus',
     "The lawgiver of Sparta, cited as having secured his reforms by a "
     "mixture of violence and religious authority, and by voluntarily "
     "exiling himself and dying abroad so his countrymen could not "
     "repeal his laws in his lifetime. Also cited as the figure whose "
     "abolition by Philopoemen's league marked Sparta's admission into "
     "the Achaean confederacy (18) and as an example of a stable "
     "confederate arrangement praised elsewhere (45).",
     'Lycurgus', 'reference', 'person'),
    ('romulus', 'Romulus',
     "Cited as having laid the foundation of Rome's original government, "
     "completed by his elective successors Numa and Tullius Hostilius.",
     'Romulus', 'reference', 'person'),
    ('numa', 'Numa',
     "Numa Pompilius, cited as one of the two elective successors who "
     "completed Romulus's work of founding Rome's government.",
     'Numa', 'reference', 'person'),
    ('tullius-hostilius', 'Tullius Hostilius',
     "Cited as the other of Romulus's two elective successors who "
     "completed Rome's founding, and, per the account Brutus is said to "
     "have alleged, as having already prepared the project for replacing "
     "royalty with consular government that Brutus carried out.",
     'Tullius Hostilius', 'reference', 'person'),
    ('brutus-roman', 'Brutus',
     "The Roman who, on the abolition of royalty, substituted consular "
     "administration, claiming the reform had been prepared by Tullius "
     "Hostilius. The only Brutus named anywhere in the book -- the Roman "
     "consul, not the Anti-Federalist essayist of the same pen name; see "
     "the namesake check above.",
     'Brutus', 'reference', 'person'),
    ('amphictyon', 'Amphictyon',
     "Cited as the reputed author of the confederacy that bears his "
     "name, the Amphictyonic League, in the same survey of solitary "
     "founder-lawgivers.",
     'Amphictyon', 'reference', 'person'),
    ('achaeus', 'Achaeus',
     "Cited as having given the Achaean league its first founding, later "
     "renewed by Aratus.",
     'Achaeus', 'reference', 'person'),
    ('aratus', 'Aratus',
     "Cited as having given the Achaean league its second founding "
     "(renewal), and elsewhere praised for presiding over an "
     "administration of greater moderation and justice than any city "
     "exercising sovereignty alone.",
     'Aratus', 'reference', 'person'),

    # --- Greek confederacy history ---
    ('cleomenes', 'Cleomenes',
     "King of Sparta, who attacked the Achaeans and defeated their "
     "attempt to court Egyptian and Syrian support against Macedon; "
     "later himself vanquished when the Achaeans turned to Macedon for "
     "help against him.",
     'Cleomenes', 'reference', 'person'),
    ('philopoemen', 'Philopoemen',
     "Credited with bringing Lacedaemon (Sparta) into the Achaean "
     "league, an act that required abolishing the institutions and laws "
     "of Lycurgus.",
     'Philopoemen', 'reference', 'person'),
    ('callicrates', 'Callicrates',
     "Named among the popular leaders whom Rome turned into mercenary "
     "instruments for dividing and eventually destroying the Achaean "
     "league.",
     'Callicrates', 'reference', 'person'),
    ('demosthenes', 'Demosthenes',
     "Cited as the historical source for the claim that Athens was the "
     "arbiter of Greece for seventy-three years within the Amphictyonic "
     "confederacy.",
     'Demosthenes', 'reference', 'person'),
    ('xerxes', 'Xerxes',
     "The Persian king whose war against the Greeks is the backdrop for "
     "the account of the Amphictyonic council's postwar political "
     "maneuvering, and later cited as the common enemy Athens and Sparta "
     "did each other more harm than.",
     'Xerxes', 'reference', 'person'),
    ('philip-of-macedon', 'Philip of Macedon',
     "Philip II, who exploited a religious dispute over consecrated "
     "ground to intervene in Greek affairs, won admission to the "
     "Amphictyonic council through bribery and intrigue, and made "
     "himself master of the confederacy; later, his son's namesake king "
     "of the same name provoked fresh combinations among the Greeks "
     "before being conquered by Rome.",
     'Philip', 'reference', 'person'),
    ('alexander-the-great', 'Alexander',
     "Alexander the Great, named alongside his father Philip as the "
     "Macedonian ruler whose successors' policy toward the Achaean "
     "league grew harsher than his own had been.",
     'Alexander', 'reference', 'person'),
    ('pericles', 'Pericles',
     "The Athenian statesman blamed, per the footnoted anecdote about "
     "Aspasia, for starting the Peloponnesian War out of personal pique "
     "and self-interest rather than public necessity; also cited "
     "(footnote) as complicit in Phidias's alleged theft of public gold.",
     'Pericles', 'reference', 'person'),
    ('aspasia', 'Aspasia',
     "The woman whose resentment, according to the footnoted anecdote "
     "from Plutarch's Life of Pericles, drove Pericles to attack and "
     "destroy the Samnians -- offered as an example of how personal "
     "considerations, not public necessity, can start wars.",
     'Aspasia', 'reference', 'person'),
    ('phidias', 'Phidias',
     "A sculptor accused (per a footnote) of stealing public gold with "
     "Pericles' connivance during the embellishment of a statue of "
     "Minerva -- one of the personal motives suggested for Pericles' "
     "having started the Peloponnesian War.",
     'Phidias', 'reference', 'person'),
    ('lysander', 'Lysander',
     "A Spartan naval commander, recalled to command the combined "
     "Peloponnesian fleets despite a rule against holding the admiralty "
     "twice, and given the real power of admiral under the evasive "
     "title of vice-admiral -- cited as an example of nations bending "
     "their own fundamental rules under necessity.",
     'Lysander', 'reference', 'person'),
    ('hannibal', 'Hannibal',
     "The Carthaginian general who carried his army into the heart of "
     "Italy and to the gates of Rome before being overthrown by Scipio "
     "in Carthaginian territory.",
     'Hannibal', 'reference', 'person'),
    ('scipio', 'Scipio',
     "The Roman general who defeated Hannibal in Carthaginian territory, "
     "conquering the Carthaginian commonwealth.",
     'Scipio', 'reference', 'person'),
    ('homer', 'Homer',
     "Invoked once, by analogy: Montesquieu's relationship to the "
     "British Constitution is compared to Homer's relationship to the "
     "didactic writers on epic poetry, who treated his work as the "
     "perfect model against which every similar work was judged.",
     'Homer', 'reference', 'literary-figure'),

    # --- European monarchs and courtiers ---
    ('charles-vii-france', 'Charles VII',
     "The French king credited with introducing standing military "
     "establishments in peacetime in the fifteenth century -- an example "
     "invoked to warn that a disunited America would likely see some "
     "state or confederacy set the same precedent \"as Charles VII. did "
     "in the Old World.\"",
     'Charles VII', 'reference', 'person'),
    ('charles-v-emperor', 'The Emperor Charles V',
     "The Holy Roman Emperor whose favor an ambitious cardinal (Wolsey) "
     "sought by dragging England into an unnecessary war with France, "
     "described here as a sovereign who \"bid fair to realize the "
     "project of universal monarchy.\"",
     'Charles V', 'reference', 'person'),
    ('henry-viii', 'Henry VIII',
     "The English king whose prime minister -- the ambitious cardinal, "
     "Wolsey -- precipitated a war with France in pursuit of his own "
     "ambition to become pope.",
     'Henry VIII', 'reference', 'person'),
    ('wolsey', 'Wolsey',
     "Cardinal Wolsey, prime minister to Henry VIII, who dragged England "
     "into a war with France while courting the favor of the Emperor "
     "Charles V in hopes of winning the papacy for himself -- \"at once "
     "the instrument and the dupe\" of Charles V's intrigues.",
     'Wolsey', 'reference', 'person'),
    ('julius-ii', 'Pope Julius II',
     "The pope credited with assembling the League of Cambray against "
     "Venice, dealing a fatal blow to that republic's power and pride.",
     'Julius II', 'reference', 'person'),
    ('louis-xiv', 'Louis XIV',
     "The French king whose demand that Genoa's Doge personally travel "
     "to France to beg pardon is cited as an example of the humiliations "
     "a powerful nation can inflict on a weaker one; also cited as the "
     "opponent whose sea wars with England the Dutch persistently "
     "resisted.",
     'Louis XIV', 'reference', 'person'),
    ('william-iii', 'William III',
     "The Dutch stadtholder elevated to the English throne by the 1688 "
     "revolution -- referred to at two of his three occurrences as "
     "\"the Prince of Orange\" -- credited with completing the triumph "
     "of English liberty and, separately, with receiving the Declaration "
     "of Right that became the English Bill of Rights.",
     'Prince of Orange|William III', 'reference', 'person'),
    ('charles-i', 'Charles I',
     "The English king under whom, per a footnote, the Long Parliament "
     "unsuccessfully disputed the crown's immemorial command of the "
     "militia; also cited as the monarch who assented to the Petition of "
     "Right, one of the historical bills of rights surveyed at No. 84.",
     'Charles I', 'reference', 'person'),
    ('charles-ii', 'Charles II',
     "The English king who kept 5,000 regular troops on foot in "
     "peacetime by his own authority (a number James II later raised to "
     "30,000) -- the standing-army precedent the 1688 Bill of Rights was "
     "meant to prevent; also cited for a statute of his reign fixing the "
     "maximum interval between English parliaments at three years, and "
     "for a later statute declaring the crown's sole command of the "
     "militia.",
     'Charles II', 'reference', 'person'),
    ('james-ii', 'James II',
     "The English king who raised the peacetime standing army Charles "
     "II had begun, from 5,000 to 30,000 troops paid from his own civil "
     "list -- the abuse the 1688 Bill of Rights was framed to prevent.",
     'James II', 'reference', 'person'),
    ('george-ii', 'George II',
     "The English king through whose entire thirty-five-year reign the "
     "Irish parliament sat continuously without a general election, "
     "cited as an example of a legislature almost wholly independent of "
     "its constituents.",
     'George II', 'reference', 'person'),
    ('king-john', 'King John',
     "The English king from whom the barons obtained Magna Carta \"sword "
     "in hand,\" cited as the founding example of a bill of rights as a "
     "concession wrung from a monarch rather than a grant a free people "
     "need make to itself.",
     'King John', 'reference', 'person'),
    ('maximilian-i', 'Maximilian',
     "The Holy Roman Emperor credited with instituting the Imperial "
     "Chamber near the close of the fifteenth century, a court whose "
     "authority to decide finally among the German states is cited as "
     "evidence for vesting similar interstate judicial power in the "
     "proposed federal judiciary.",
     'Maximilian', 'reference', 'person'),
    ('victor-amadeus', 'Victor Amadeus of Savoy',
     "A duke who, per an 1683 treaty cited as an example of successful "
     "interstate arbitration among the Swiss cantons, obliged himself to "
     "mediate cantonal disputes and to use force against any party that "
     "refused to comply.",
     'Victor Amadeus', 'reference', 'person'),
    ('thuanus', 'Thuanus',
     "Cited as the historical source for an anecdote about the free "
     "imperial city of Donawerth being placed under the ban of the "
     "empire and forcibly annexed by the Duke of Bavaria -- an example "
     "of the disorders of the old Germanic confederacy.",
     'Thuanus', 'reference', 'person'),
    ('necker', 'Necker',
     "The French finance minister, cited for his estimate of upward of "
     "twenty thousand patrols employed in France to police smuggling -- "
     "an illustration of how difficult internal-tax enforcement would be "
     "for disunited American states with open borders. Spelled \"Neckar\" "
     "in original-en and \"Necker\" in modern-en.",
     'Neckar|Necker', 'reference', 'person'),
    ('madame-de-maintenon', 'Madame de Maintenon',
     "One of three women -- identified by footnote -- whose personal "
     "influence over European policy, wars, and peace settlements is "
     "cited as proof that great national events often turn on private "
     "motives rather than public necessity: \"the bigotry of one "
     "female.\"",
     'Madame de Maintenon', 'reference', 'person'),
    ('duchess-of-marlborough', 'The Duchess of Marlborough',
     "The second of the three women cited by footnote for personal "
     "influence over European wars and policy: \"the petulance of "
     "another.\" A distinct person from the Duke of Marlborough, cited "
     "separately later in the same essay; see the namesake check above.",
     'Duchess of Marlborough', 'reference', 'person'),
    ('duke-of-marlborough', 'The Duke of Marlborough',
     "Identified by footnote as \"a favorite leader\" whose ambition, "
     "or rather avarice, is blamed for prolonging England's war against "
     "France and Bourbon Spain beyond what sound policy required. A "
     "distinct person from the Duchess of Marlborough, cited earlier in "
     "the same essay; see the namesake check above.",
     'The Duke of Marlborough', 'reference', 'person'),
    ('madame-de-pompadour', 'Madame de Pompadour',
     "The third of the three women cited by footnote for personal "
     "influence over European wars and policy: \"the cabals of a "
     "third.\"",
     'Madame de Pompadour', 'reference', 'person'),

    # --- Contemporary British and American figures ---
    ('mr-jenkinson', 'Mr. Jenkinson',
     "Cited for having introduced a bill in the British House of "
     "Commons regulating trade with the United States on the premise "
     "that similar restrictive provisions in earlier bills had already "
     "served British commerce well enough that it would be prudent to "
     "persist until American government showed greater consistency.",
     'Jenkinson', 'reference', 'person'),
    ('earl-of-chesterfield', 'The Earl of Chesterfield',
     "Cited, \"if my memory serves me right,\" as having written to his "
     "own government that success in an important negotiation with the "
     "Dutch depended on securing a military commission for one of the "
     "United Provinces' own deputies -- an example of foreign corruption "
     "of republican deputies.",
     'Earl of Chesterfield', 'reference', 'person'),
    ('shays', 'Shays',
     "Daniel Shays, whose being \"a DESPERATE DEBTOR\" is credited as the "
     "personal circumstance that plunged Massachusetts into civil war -- "
     "an illustration of how private motive, not public necessity, can "
     "produce a national crisis; his rebellion is referred to again "
     "without his name at No. 74.",
     'Shays', 'reference', 'person'),
    ('late-king-of-prussia', 'The Late King of Prussia',
     "Referred to only by title, never by name: \"the late king of "
     "Prussia was more than once pitted against his imperial sovereign; "
     "and commonly proved an overmatch for him.\" Given the essay's "
     "1787-88 publication date and the death of Frederick II in August "
     "1786, this is unambiguously Frederick the Great -- the same "
     "title-only resolution used for the Bishop of Autun and the "
     "Empress of Russia in Vindication.",
     'The late king of Prussia', 'reference', 'person'),
    ('fox', 'Mr. Fox',
     "Charles James Fox, whose India bill -- passed by the House of "
     "Commons but rejected by the House of Lords, to the people's "
     "reported satisfaction -- is cited (footnote) as an example of a "
     "British legislature making a monarch tremble at a proposed "
     "innovation.",
     'Fox', 'reference', 'person'),

    # --- Named collective bodies ---
    ('ephori', 'The Ephori',
     "Sparta's annually elected magistrates, cited as an example of a "
     "small representative body that gradually overmatched and finally "
     "supplanted the authority of a senate for life.",
     'Ephori', 'reference', 'group'),
    ('tribunes-rome', 'The Tribunes',
     "Rome's annually elected representatives of the people, cited as "
     "having prevailed in almost every contest with the Roman senate for "
     "life, and elsewhere as having occasionally been substituted for "
     "the two Consuls, with recorded dissensions between them.",
     'Tribunes', 'reference', 'group'),
    ('cosmi-crete', 'The Cosmi',
     "Crete's annually elected magistrates, compared to Sparta's Ephori "
     "and Rome's Tribunes, with the difference that suffrage in their "
     "election was extended to only part of the Cretan people.",
     'Cosmi', 'reference', 'group'),
    ('decemvirs', 'The Decemvirs',
     "A ten-member Roman magistracy (their name denoting their number), "
     "cited as more to be dreaded in their usurpation of power than any "
     "single one of them would have been alone -- an argument against a "
     "small plural executive.",
     'Decemvirs', 'reference', 'group'),
]:
    add(*row)

editorial = dict(
    bookId='federalist-papers',
    contentVersion='2026-09-13.1',
    entities=entities,
    coverage=(
        "80 entities, all Reference -- a political-essay treatise per "
        "editorial policy's guidance, with no narrative or staged "
        "dialogue of its own; Publius is bound once as the shared "
        "pseudonym, and Hamilton and Madison are each bound once from "
        "the literal 'MADISON, with HAMILTON' byline that opens essays "
        "No. 18-20 in the source text. The book's flagged namesake "
        "hazard, 'Brutus' (Roman consul vs. the Anti-Federalist pen "
        "name), resolved cleanly: only the Roman Brutus is ever named "
        "in the body text (38, 1); no genuine collision exists in this "
        "edition. A second, unflagged namesake pair was found and "
        "resolved instead: the Duchess of Marlborough and the Duke of "
        "Marlborough are two different real people cited in different "
        "footnotes of the same essay (No. 6), bound as two separate "
        "entities. Three genuinely pseudonymous Anti-Federalist critics "
        "(CATO, the federal farmer, TAMONY) are bound as reference "
        "entities under their pen names without asserting a real-name "
        "identity the text does not give. One title-only reference "
        "('the late king of Prussia') is resolved to Frederick II from "
        "publication date and biography, following the Bishop-of-Autun "
        "pattern. Four named collective bodies (Ephori, Tribunes, "
        "Cosmi, Decemvirs) are bound as kind 'group'. Edition-specific "
        "spelling ('Neckar'/'Necker') is aliased under one entity."
    ),
)

if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'editorial.json'
    out.write_text(json.dumps(editorial, indent=2, ensure_ascii=False) + '\n')
