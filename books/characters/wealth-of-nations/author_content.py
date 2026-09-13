"""Manually authored recognition copy for An Inquiry into the Nature and
Causes of the Wealth of Nations (Adam Smith).

32 chapters (organized as five Books, each restarting its own chapter
count in the source titles -- edition chapter numbers 1-32 map to
Book I ch.1-11, Book II ch.1-5 (edition 12-16), Book III ch.1-4
(edition 17-20), Book IV ch.1-9 (edition 21-29), Book V ch.1-3
(edition 30-32)), 2173 paragraphs, identical structure in both English
editions. This is an economic treatise with no narrative or staged
dialogue of its own -- Smith argues a case, illustrating it with
historical, classical, and contemporary citations -- so per editorial
policy's treatise guidance, every entity below is category Reference.

Despite its length, this book is markedly reference-LIGHT relative to
its size: a full-book capitalized-word frequency sweep of the
original-en edition turned up only ~1463 distinct capitalized word
forms (Leviathan, at little more than half this book's length, had
4763), and the great majority of those are place names (countries,
colonies, cities) rather than people -- matching the automation
queue's own description, "Large but reference-light; mostly named
economists and rulers." Chapters 1-10 were read in full, sequentially,
in both editions. Chapter 11 (298 paragraphs, a dense digression on
the historical value of silver) and the historically-dense passages of
the remaining chapters (especially 19-20, 27, and 30, Smith's
digressions on the history of towns, colonies, and public revenue)
were covered by an exhaustive full-book proper-name sweep: every
capitalized word or phrase in the original-en edition was extracted,
every candidate person-name was confirmed by reading its exact context
in the source text (not guessed from the word alone), and cross-
checked against the modern-en edition, which turns out to modernize a
large number of this book's archaic spellings (see "Edition
divergences" below).

## Cast overview

- **Ancient Greek and Roman lawgivers, philosophers, and historians**,
  cited for a maxim or historical fact: Draco, Solon, Lycurgus, Plato,
  Aristotle, Zeno of Citium, Zeno of Elea (a genuine namesake pair,
  both carrying their own city-epithet -- see the namesake check),
  Epicurus, Thales, Pythagoras, Democritus, Isocrates, Protagoras,
  Hippias, Gorgias, Lysias, Carneades, Diogenes the Stoic, Cato,
  Cicero, Marcus Brutus, Marcus Antoninus, Epictetus, Lucian,
  Polybius, Dionysius of Halicarnassus, Thucydides, Homer (and his
  Iliad figures Diomede, Glaucus, Agamemnon, Achilles), Hesiod, Aesop,
  Theognis, Phocyllides, Solomon, Varro, Columella, Palladius, Pliny
  (and the Roman extravagance anecdotes of Seius and Asinius Celer),
  Suetonius, Quintilian, Dion Cassius, Servius Tullius, Julius Caesar,
  Augustus, Agrippina, Dercyllidas, Mithridates, and the three
  Carthaginian generals of one family, Hamilcar, Hasdrubal, and
  Hannibal, with Scipio who opposed them.
- **Reformation and medieval church figures**: St. Dominic, St.
  Francis, Martin Luther, Zwingli, Calvin, Thomas Becket, Christian II
  of Denmark, Archbishop Troll of Uppsala, Gustavus Vasa, Frederick I
  of Holstein/Denmark.
- **English monarchs and jurists, cited for statutes and legal
  history**: William the Conqueror, William Rufus, King John of
  England (a genuine namesake pair with King John of France, both
  fully qualified in the text), Edward I, Edward III, Edward VI, Henry
  III, Henry VIII, Philip and Mary, Elizabeth I, James I, Charles I,
  Charles II, James II, William III, Queen Anne, George II, George
  III, Richard II, Robert Bruce, Sir Matthew Hale, Chief Baron
  Gilbert, Dr. Blackstone, Sir Edward Coke (not separately named but
  see Gilbert/Blackstone), Doctor Burn.
- **French and other continental monarchs and ministers**: Charlemagne,
  King John of France, Louis VI ("the Fat"), Louis XIV, Philip I of
  France, Robert II of France ("the Pious"), Colbert, the Duke of
  Choiseul, Quesnay, Mercier de la Riviere, the Marquis de Mirabeau,
  Voltaire, father Porée.
- **Age-of-exploration figures**: Columbus, Vasco da Gama (printed
  "Vasco de Gamo"), Ferdinand and Isabella of Castile, Cortes,
  Almagro, Pizarro, Vasco Núñez de Balboa, Ovieda, Nicuessa,
  Montezuma, Sir Walter Raleigh (printed "Sir Waiter Raleigh," a
  source defect -- see below).
- **Contemporary (17th-18th century) economists, statisticians, and
  writers Smith cites by name**: Mr. Hobbes, Mr. Locke, Mr. Hume, John
  Law, Sir Josiah Child, Thomas Mun, Sir Matthew Decker, Richard
  Cantillon, Adam Anderson, James Postlethwaite, Dr. Davenant, William
  Lowndes, Mr. Dupré de St. Maur, Mr. Messance, Mr. Meggens, Thomas
  Ruddiman, Bishop Fleetwood, Mr. Gregory King, Rev. John Smith
  (author of the Memoirs of Wool, distinct from Adam Smith himself),
  Dr. Douglas, Dr. Arbuthnot, Dr. Swift, Ramazzini, Peter Kalm, Buffon,
  Frezier, Ulloa, Solórzano, Tavernier, Rev. Mr. Borlase, Machiavelli,
  Guicciardini, Castruccio Castracani, Sandi, Pfeffel, Madox, Brady,
  Charlevoix, Gemelli Careri, Bouchaud, Burman, Expilly, Barretti,
  Cassendi (Gassendi), Serjeant Hawkins, Mr. Drummond, Du Cange, Father
  Daniel.
- **British political and military figures**: Oliver Cromwell, Henry
  Pelham, Sir Robert Walpole, the Earl of Chatham, Mr. Calcraft, Mr.
  Cameron of Lochiel, the Duke of Argyll, Peter the Great.
- **Biblical figures cited briefly**: Abraham (and Ephron, from whom
  he bought the field of Machpelah), Esau.

## Namesake checks

1. **Zeno of Citium vs. Zeno of Elea** -- both appear in the same
   paragraph (30, 179): "In this manner lived Zeno of Elea,
   Protagoras, Gorgias, Hippias" and, a sentence later, "the Portico
   to Zeno of Citta, the founder of the Stoics." Each carries its own
   city-epithet in the text itself, so both bind cleanly as separate
   entities; there is no bare "Zeno" anywhere in the book to create
   ambiguity.
2. **King John of England vs. King John of France** -- "King John of
   England" (19, 9) and "king John of France" (32, 68) are both fully
   qualified by nation in the text itself; no bare "John" collision
   exists.
3. **Lewis the Fat vs. Lewis XIV** -- Louis VI of France ("his son
   Lewis, known afterwards by the name of Lewis the Fat," 19, 9) and
   Louis XIV ("Lewis XIV," 29, 3) are both fully qualified by their
   own epithet or numeral; no bare "Lewis" collision exists.
3b. **Robert Bruce vs. Robert II of France vs. Sir Robert Walpole** --
   three different Roberts, each fully identified in context: "Robert
   Bruce" (4, 9), "Robert, the second prince of the Capetian race" (30,
   225), and "Sir Robert Walpole" (31, 193). No bare "Robert" appears
   anywhere in the book, so no ambiguity arises.
4. **Vasco da Gama vs. Vasco Núñez de Balboa** -- two different
   explorers who share a first name; the text always gives each his
   full distinguishing name ("Vasco de Gamo," printed spelling, at 27,
   7-8; "Vasco Nugnes de Balboa" at 27, 18). No bare "Vasco" exists to
   create ambiguity.
5. **Christian II of Denmark** and the unrelated **Frederic of
   Holstein** who succeeded him, and **Gustavus Vasa** and **Archbishop
   Troll** who opposed him, are all named individually within the same
   short passage on the Scandinavian Reformation (30, 228) with no
   overlapping bare names.

None of these required the escape hatch: every apparent collision in
this book resolved cleanly once each occurrence's exact epithet was
read in context.

## Person or not: title-only and generic references

Many English and French monarchs are cited only by regnal statute
("the 5th of Elizabeth," "the 8th of George III," "the 12th of Queen
Anne") rather than by narrative action; these are still real,
identifiable individuals and are bound as such. Genuinely generic or
demonym references -- "the Romans," "the Dutch," "the Athenians," "the
Spaniards," any unnamed "prince" or "sovereign" used illustratively --
are left unbound throughout, consistent with how prior books in this
queue have treated demonyms.

## Source defect, kept as printed

"Sir Waiter Raleigh" (27, 20 and 27, 23) is almost certainly a
compositor misprint for "Sir Walter Raleigh" -- confirmed by the
modern-en edition, which corrects it to "Walter Raleigh" at the same
locations. Per "printed line numbers and compositor errors stay as
printed," the entity is bound under the printed original-en spelling
"Waiter," with the modern-en alias "Walter" added separately so both
editions bind to the one entity, and the misprint is noted here rather
than silently corrected in the source.

## Edition divergences (spelling modernized in modern-en)

The modern-en edition systematically modernizes a number of this
book's archaic proper-noun spellings. Each of the following required a
second alias to bind in both editions: "Annibal" (original) /
"Hannibal" (modern); "Amilcar" / "Hamilcar"; "Lewis" / "Louis";
"Christiern" / "Christian"; "Vasco de Gamo" / "Vasco da Gama"; "Sir
Waiter Raleigh" / "Sir Walter Raleigh" (see above). These are ordinary
spelling-variant aliases, not identity ambiguities: each pair names
the same one person in both editions, confirmed by reading the
surrounding sentence in both.
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
    # ============ Ancient Greek lawgivers and philosophers ============
    ('draco', 'Draco',
     "The Athenian lawgiver, cited for the severity of his laws: "
     "\"like the laws of Draco, these laws may be said to be all "
     "written in blood.\"",
     'Draco', 'reference', 'person'),
    ('solon', 'Solon',
     "The Athenian lawgiver, cited twice: once for the general "
     "judgment that his laws, \"though not the best in itself, is the "
     "best which the interest, prejudices, and temper of the times "
     "would admit of,\" and once for the specific law excusing children "
     "from maintaining parents who had not taught them a trade.",
     'Solon', 'reference', 'person'),
    ('lycurgus', 'Lycurgus',
     "The Spartan lawgiver, cited for the laws restricting entrance "
     "into Lacedaemon which the wealth of conquest eventually broke "
     "through.",
     'Lycurgus', 'reference', 'person'),
    ('plato', 'Plato',
     "Cited for the ideal republic's proposal to maintain 5,000 idle "
     "warriors, for the splendid style of living of Hippias and "
     "Protagoras which he describes, for his own reportedly "
     "magnificent way of life, and as the philosopher to whom the "
     "Academy is said to have been assigned after his death.",
     'Plato', 'reference', 'person'),
    ('aristotle', 'Aristotle',
     "Cited for the state of ancient Greek land cultivation in his "
     "time, as tutor to Alexander (munificently rewarded by both "
     "Alexander and Philip), and as the philosopher assigned the "
     "Lyceum after his death.",
     'Aristotle', 'reference', 'person'),
    ('zeno-citium', 'Zeno of Citium',
     "\"The founder of the Stoics,\" said to have been assigned the "
     "Portico after his death -- distinguished in the same passage "
     "from the earlier, unrelated Zeno of Elea by his own city-epithet.",
     'Zeno of Citta|Zeno of Citium', 'reference', 'person'),
    ('zeno-elea', 'Zeno of Elea',
     "Named, distinctly from Zeno of Citium the Stoic in the same "
     "passage, among the itinerant Greek teachers who \"lived... from "
     "place to place\" before schools of philosophy became settled "
     "institutions.",
     'Zeno of Elea', 'reference', 'person'),
    ('epicurus', 'Epicurus',
     "Cited for bequeathing his gardens to his own school, rather than "
     "to a public site, after his death.",
     'Epicurus', 'reference', 'person'),
    ('thales', 'Thales',
     "Named, with Pythagoras, as one of \"the two oldest Greek "
     "philosophers,\" whose schools were established outside of "
     "ancient Greece proper.",
     'Thales', 'reference', 'person'),
    ('pythagoras', 'Pythagoras',
     "Named with Thales as one of the two oldest Greek philosophers.",
     'Pythagoras', 'reference', 'person'),
    ('democritus', 'Democritus',
     "Cited for a judgment on planting vineyards in his (largely lost) "
     "writing on husbandry, which Columella reports without disputing.",
     'Democritus', 'reference', 'person'),
    ('isocrates', 'Isocrates',
     "Quoted directly, reproaching contemporary teachers for charging "
     "only \"four or five minae\" for such grand promises; cited for "
     "his own much higher fee (ten minae per scholar) and his hundred "
     "students at Athens, and for his didactron reportedly totalling a "
     "thousand minae per course, per Plutarch.",
     'Isocrates', 'reference', 'person'),
    ('protagoras', 'Protagoras',
     "Named, with Hippias, as an eminent teacher whose splendid way of "
     "living is described by Plato.",
     'Protagoras', 'reference', 'person'),
    ('hippias', 'Hippias',
     "Named with Protagoras as an eminent teacher of splendid, even "
     "ostentatious, style of living.",
     'Hippias', 'reference', 'person'),
    ('gorgias', 'Gorgias',
     "Cited for presenting his own statue in solid gold to the temple "
     "at Delphi, and named among the itinerant early Greek teachers.",
     'Gorgias', 'reference', 'person'),
    ('lysias', 'Lysias',
     "Named, with Isocrates, as an early example of the pattern -- "
     "found from their day down to Plutarch and Epictetus -- of "
     "teachers who also wrote for reputation.",
     'Lysias', 'reference', 'person'),
    ('carneades', 'Carneades',
     "\"Carneades the academic,\" sent by Athens, with Diogenes the "
     "Stoic, on a solemn embassy to Rome -- notable, Smith observes, "
     "because he was \"a Babylonian by birth\" yet still honoured by "
     "so exclusive a city.",
     'Carneades', 'reference', 'person'),
    ('diogenes-stoic', 'Diogenes the Stoic',
     "Sent, with Carneades the Academic, on Athens's embassy to Rome.",
     'Diogenes the stoic|Diogenes the Stoic', 'reference', 'person'),

    # ============ Roman figures ============
    ('cato', 'Cato',
     "\"Old Cato,\" quoted via Cicero for his maxim that feeding well "
     "was the first and most profitable thing in managing a private "
     "estate.",
     'Cato', 'reference', 'person'),
    ('cicero', 'Cicero',
     "Cited for Cato's maxim on estate management, and for the letters "
     "reporting that the \"virtuous Brutus\" lent money in Cyprus at "
     "forty-eight per cent.",
     'Cicero', 'reference', 'person'),
    ('marcus-brutus', 'Marcus Brutus',
     "\"The virtuous Brutus,\" cited via Cicero's letters for lending "
     "money in Cyprus at forty-eight per cent -- an example of the "
     "usury common in Roman provinces under proconsular administration.",
     'Brutus', 'reference', 'person'),
    ('julius-caesar', 'Julius Caesar',
     "His invasion of Britain is cited as the approximate point from "
     "which the value of silver is reckoned to have continually "
     "diminished until the American mines were discovered; his "
     "destruction of the Roman republic is compared to Cromwell's "
     "standing army turning out the Long Parliament.",
     'Julius Caesar', 'reference', 'person'),
    ('augustus', 'Augustus',
     "Cited for imposing the vicesima hereditatum, a twentieth-penny "
     "tax on inheritances among Roman citizens, and for the anecdote "
     "of Vidius Pollio ordering a slave's punishment in his presence.",
     'Augustus', 'reference', 'person'),
    ('servius-tullius', 'Servius Tullius',
     "The Roman king credited with first coining money at Rome, "
     "before whose time the Romans used unstamped bars of copper.",
     'Servius Tullius', 'reference', 'person'),
    ('agrippina', 'Agrippina',
     "The empress for whom, per Pliny, a white nightingale was "
     "purchased as a gift at the price of six thousand sestertii.",
     'Agrippina', 'reference', 'person'),
    ('pliny', 'Pliny',
     "Cited via his Natural History for early Roman coinage under "
     "Servius Tullius, and for the anecdotes of extravagant purchases "
     "by Seius and Asinius Celer.",
     'Pliny', 'reference', 'person'),
    ('seius', 'Seius',
     "Cited by Pliny for purchasing a white nightingale as a gift for "
     "the empress Agrippina at six thousand sestertii.",
     'Seius', 'reference', 'person'),
    ('asinius-celer', 'Asinius Celer',
     "Cited by Pliny for purchasing a surmullet at eight thousand "
     "sestertii.",
     'Asinius Celer', 'reference', 'person'),
    ('varro', 'Varro',
     "The Roman agricultural writer, cited (with Columella) for "
     "recommending the fattening of small birds as a profitable "
     "practice among the ancient Romans.",
     'Varro', 'reference', 'person'),
    ('columella', 'Columella',
     "The Roman agricultural writer, cited repeatedly for reporting "
     "and adjudicating debates among ancient Italian husbandmen "
     "(Democritus on vineyards, Varro and himself on kitchen gardens "
     "and fattening small birds).",
     'Columella', 'reference', 'person'),
    ('palladius', 'Palladius',
     "The Roman agricultural writer, cited for adopting Columella's "
     "opinion, itself recommended earlier by Varro.",
     'Palladius', 'reference', 'person'),
    ('suetonius', 'Suetonius',
     "Named, with Epictetus and Quintilian, in the list of authors "
     "illustrating that teachers of philosophy also wrote for "
     "reputation.",
     'Suetonius', 'reference', 'person'),
    ('quintilian', 'Quintilian',
     "Named with Epictetus and Suetonius in the same list of "
     "philosopher-authors.",
     'Quintilian', 'reference', 'person'),
    ('dion-cassius', 'Dion Cassius',
     "Cited (as printed, \"Dion Cassius\") for the vicesima "
     "hereditatum, the Roman inheritance tax imposed by Augustus.",
     'Dion Cassius', 'reference', 'person'),
    ('dercyllidas', 'Dercyllidas',
     "Quoted for a remark on the treasure-hoarding court of Persia, "
     "which Smith applies to several Asiatic princes of his own time.",
     'Dercyllidas', 'reference', 'person'),
    ('mithridates', 'Mithridates',
     "Cited for drawing his Scythian or Tartar militia from the "
     "countries north of the Euxine and Caspian seas.",
     'Mithridates', 'reference', 'person'),
    ('hamilcar', 'Hamilcar',
     "The first of \"the great generals who succeeded one another in "
     "the command\" of Carthage's forces in Spain -- father of Hannibal "
     "and father-in-law of Hasdrubal.",
     'Amilcar|Hamilcar', 'reference', 'person'),
    ('hasdrubal', 'Hasdrubal',
     "Hamilcar's son-in-law and successor in Spain, who led the whole "
     "or almost the whole Carthaginian army to oppose the Romans there.",
     'Asdrubal|Hasdrubal', 'reference', 'person'),
    ('hannibal', 'Hannibal',
     "Hamilcar's son (printed \"Annibal\"), whose superiority \"grew "
     "every day less and less\" as Hasdrubal drew off the army in "
     "Spain.",
     'Annibal|Hannibal', 'reference', 'person'),
    ('scipio', 'Scipio',
     "\"The great Scipio,\" who found only an inferior militia to "
     "oppose him in Spain once Hasdrubal had led the main Carthaginian "
     "force away.",
     'Scipio', 'reference', 'person'),

    # ============ Homer and Greek literature ============
    ('homer', 'Homer',
     "Cited for the armour-prices of Diomede and Glaucus in the "
     "Iliad, for Agamemnon offering Achilles the sovereignty of seven "
     "cities, and for the state of property and government among the "
     "ancient Greeks before the Trojan war.",
     'Homer', 'reference', 'person'),
    ('diomede', 'Diomede',
     "The Homeric hero whose armour, per Homer, cost only nine oxen.",
     'Diomede', 'reference', 'literary-figure'),
    ('glaucus', 'Glaucus',
     "The Homeric hero whose armour, by contrast with Diomede's, cost "
     "a hundred oxen.",
     'Glaucus', 'reference', 'literary-figure'),
    ('agamemnon', 'Agamemnon',
     "Cited from Homer for offering Achilles the sovereignty of seven "
     "cities as an inducement to friendship.",
     'Agamemnon', 'reference', 'literary-figure'),
    ('achilles', 'Achilles',
     "The Homeric hero to whom Agamemnon offers seven cities' "
     "sovereignty for his friendship.",
     'Achilles', 'reference', 'literary-figure'),
    ('hesiod', 'Hesiod',
     "Named among the early Greek didactic poets whose work "
     "circulated before formal schools of philosophy existed.",
     'Hesiod', 'reference', 'person'),
    ('aesop', 'Aesop',
     "Cited for the fables that, with the proverbs of Solomon and the "
     "verses of Theognis and Phocyllides, exemplify an early, informal "
     "mode of moral instruction.",
     'Aesop', 'reference', 'literary-figure'),
    ('theognis', 'Theognis',
     "Named with Phocyllides for verses of moral instruction "
     "circulating before formal philosophy schools.",
     'Theognis', 'reference', 'person'),
    ('phocyllides', 'Phocyllides',
     "Named with Theognis in the same context.",
     'Phocyllides', 'reference', 'person'),
    ('solomon', 'Solomon',
     "Cited for his proverbs, grouped with Aesop's fables and "
     "Theognis and Phocyllides's verses as early moral instruction.",
     'Solomon', 'reference', 'person'),
    ('polybius', 'Polybius',
     "Cited, with Dionysius of Halicarnassus, for direct testimony on "
     "Roman moral superiority over the Greeks in private life, and "
     "named with Plato and Aristotle as a respectable authority.",
     'Polybius', 'reference', 'person'),
    ('dionysius-halicarnassus', 'Dionysius of Halicarnassus',
     "Cited with Polybius for testimony on Roman moral superiority "
     "over the Greeks, which Smith attributes partly to Roman "
     "education.",
     'Dionysius of Halicarnassus', 'reference', 'person'),
    ('thucydides', 'Thucydides',
     "Cited for the judgment that Europe and Asia together could not "
     "resist a Scythian invasion, and for observing the Peloponnesians' "
     "seasonal pattern of campaigning.",
     'Thucydides', 'reference', 'person'),
    ('lucian', 'Lucian',
     "Cited for reporting the salary bestowed by \"that philosophical "
     "emperor\" (Marcus Antoninus) on a teacher of philosophy.",
     'Lucian', 'reference', 'person'),
    ('marcus-antoninus', 'Marcus Antoninus',
     "\"That philosophical emperor,\" the first, per Smith, to endow a "
     "salaried teaching chair at Athens.",
     'Marcus Antoninus', 'reference', 'person'),
    ('epictetus', 'Epictetus',
     "Named with Suetonius and Quintilian among later authors "
     "continuing the pattern of philosopher-teachers who also wrote.",
     'Epictetus', 'reference', 'person'),

    # ============ Reformation and medieval church figures ============
    ('st-dominic', 'St. Dominic',
     "Founder, with St. Francis, of one of the two great mendicant "
     "orders whose establishment, per Machiavelli, revived declining "
     "religious credit in the thirteenth and fourteenth centuries.",
     'Dominic', 'reference', 'person'),
    ('st-francis', 'St. Francis',
     "Founder of the second of the two great mendicant orders, with "
     "St. Dominic.",
     'Francis', 'reference', 'person'),
    ('martin-luther', 'Martin Luther',
     "Founder of the reformed tradition, with the Church of England, "
     "that Smith says preserved more of the ancient church's ranks and "
     "subordination than Calvin's followers did.",
     'Luther', 'reference', 'person'),
    ('zwingli', 'Zwingli',
     "Named (as printed, \"Zuinglius\") as a reformer whose followers, "
     "more properly those of Calvin, bestowed a more level, "
     "egalitarian church constitution on each parish.",
     'Zuinglius|Zwingli', 'reference', 'person'),
    ('calvin', 'Calvin',
     "The reformer whose followers, per Smith, more properly "
     "represent the egalitarian parish-level church constitution "
     "credited loosely to Zwingli.",
     'Calvin', 'reference', 'person'),
    ('thomas-becket', 'Thomas Becket',
     "Cited for his reputed magnificence in strewing his hall's floor "
     "with clean hay or rushes in winter, an anecdote on the state of "
     "domestic luxury in his time.",
     'Becket', 'reference', 'person'),
    ('christian-ii-denmark', 'Christian II of Denmark',
     "The tyrant (printed \"Christiern II\") whose oppression, with "
     "Archbishop Troll's, enabled Gustavus Vasa to expel them from "
     "Sweden; later deposed from the throne of Denmark himself.",
     'Christiern|Christian II', 'reference', 'person'),
    ('troll-uppsala', 'Archbishop Troll',
     "Archbishop of Uppsala (printed \"Upsal\"), whose tyranny, with "
     "Christian II's, enabled Gustavus Vasa's success in Sweden.",
     'Troll', 'reference', 'person'),
    ('gustavus-vasa', 'Gustavus Vasa',
     "Expelled Christian II and Archbishop Troll from Sweden and "
     "established the Reformation there without difficulty.",
     'Gustavus Vasa', 'reference', 'person'),
    ('frederic-holstein', 'Frederick I of Holstein',
     "Mounted the Danish throne (printed \"Frederic of Holstein\") "
     "after Christian II, and, still favoured by the pope, followed "
     "Gustavus Vasa's example in his own dominions.",
     'Frederic of Holstein|Frederick of Holstein', 'reference', 'person'),

    # ============ English monarchs and jurists ============
    ('william-conqueror', 'William the Conqueror',
     "Introduced the custom of paying royal revenues in coined money "
     "rather than in kind, and set the pound-shilling-penny proportion "
     "that continued afterward among the English.",
     'William the Conqueror', 'reference', 'person'),
    ('william-rufus', 'William Rufus',
     "Cited for Westminster Hall reportedly being his dining-room -- "
     "an anecdote on the retinue and hospitality of great households "
     "in early feudal England.",
     'William Rufus', 'reference', 'person'),
    ('king-john-england', 'King John of England',
     "\"King John of England,\" cited as the most liberal English king "
     "in granting charters of privilege to his boroughs.",
     'King John of England', 'reference', 'person'),
    ('edward-i', 'Edward I',
     "Cited for the weight and fineness of the pound sterling in his "
     "time, and for the Tower pound's introduction.",
     'Edward I', 'reference', 'person'),
    ('edward-iii', 'Edward III',
     "Cited for the point at which gold began to be coined in "
     "England, and for a Statute of Labourers regulating clerical and "
     "mason's pay.",
     'Edward III', 'reference', 'person'),
    ('edward-vi', 'Edward VI',
     "In whose reign \"religious zeal prohibited all interest\" -- a "
     "prohibition Smith says only increased the evil of usury.",
     'Edward VI', 'reference', 'person'),
    ('henry-iii', 'Henry III',
     "Cited for an ancient statute regulating the weight of wastel "
     "bread against the price of wheat.",
     'Henry III', 'reference', 'person'),
    ('henry-viii', 'Henry VIII',
     "Cited for introducing the Troyes pound weight into the English "
     "mint, and for the statute capping legal interest at ten per "
     "cent, later revived under Elizabeth.",
     'Henry the VIII|Henry VIII', 'reference', 'person'),
    ('philip-and-mary', 'Philip and Mary',
     "The joint English monarchs in whose reign the denomination of "
     "the English coin last underwent little alteration, and under "
     "whom the exportation of wheat was permitted with duty.",
     'Philip and Mary', 'reference', 'person'),
    ('elizabeth-i', 'Elizabeth I',
     "Cited repeatedly for statutes: reserving college-lease rents "
     "partly in corn, reviving Henry VIII's interest cap, and the "
     "Statute of Apprenticeship requiring a seven-year term.",
     'Elizabeth', 'reference', 'person'),
    ('james-i', 'James I',
     "Cited for the introduction of copper coinage in Great Britain, "
     "and for restricting legal interest to eight per cent.",
     'James I', 'reference', 'person'),
    ('charles-i', 'Charles I',
     "Named with Charles II for the prices at which wheat was "
     "frequently sold in their reigns.",
     'Charles I', 'reference', 'person'),
    ('charles-ii', 'Charles II',
     "Cited for Judge Hale's computation of labourers' family expense "
     "written in his time, for the statute fixing forty days' "
     "residence as a settlement, and for reducing legal interest to "
     "six per cent after the Restoration.",
     'Charles II', 'reference', 'person'),
    ('james-ii', 'James II',
     "Cited for the statute clarifying that the forty days' residence "
     "needed for a parish settlement should run only from written "
     "notice.",
     'James II', 'reference', 'person'),
    ('william-iii', 'William III',
     "Cited for the reformation of the silver coin in his reign, and "
     "for statutes on parish settlements.",
     'William III', 'reference', 'person'),
    ('queen-anne', 'Queen Anne',
     "Cited for reducing legal interest to five per cent, and for "
     "statutes empowering bishops to set curates' stipends and "
     "clarifying settlement law.",
     'Queen Anne', 'reference', 'person'),
    ('george-ii', 'George II',
     "Cited for the statute establishing the assize of bread, later "
     "found impracticable in Scotland for want of the office it "
     "depended on.",
     'George II', 'reference', 'person'),
    ('george-iii', 'George III',
     "Cited for the statute regulating London tailors' wages, and for "
     "the later remedy of the assize-of-bread defect in Scotland.",
     'George III', 'reference', 'person'),
    ('richard-ii', 'Richard II',
     "Cited for a fourteenth-century statute raising a particular "
     "duty to one shilling in the pound.",
     'Richard II', 'reference', 'person'),
    ('robert-bruce', 'Robert Bruce',
     "Cited as the endpoint of the period during which the Scots "
     "money pound held the same weight and fineness of silver as the "
     "English pound sterling.",
     'Robert Bruce', 'reference', 'person'),
    ('matthew-hale', 'Sir Matthew Hale',
     "\"Lord-chief-justice Hales,\" who computed the necessary weekly "
     "expense of a labourer's family in the time of Charles II.",
     'Hales', 'reference', 'person'),
    ('chief-baron-gilbert', 'Chief Baron Gilbert',
     "Cited, with Dr. Blackstone, on the ancient status of English "
     "tenants as bailiffs rather than true tenants of their landlords.",
     'Gilbert', 'reference', 'person'),
    ('blackstone', 'Dr. Blackstone',
     "Cited on the ancient status of English tenants, and on the "
     "proportion of college-lease rent arising from the corn portion "
     "reserved by the 18th of Elizabeth.",
     'Blackstone', 'reference', 'person'),
    ('doctor-burn', 'Doctor Burn',
     "The historian of the poor laws, quoted repeatedly and at length "
     "on the law of parish settlements and certificates.",
     'Doctor Burn|Dr Burn', 'reference', 'person'),

    # ============ French and other continental figures ============
    ('charlemagne', 'Charlemagne',
     "Cited for the French livre's original weight standard in his "
     "time, set by the Troyes weight then used at the fair of Troyes "
     "in Champagne.",
     'Charlemagne', 'reference', 'person'),
    ('king-john-france', 'King John of France',
     "\"King John of France,\" cited (via Du Cange's Glossary) for "
     "adulterating his coin to pay his debts.",
     'king John of France|King John of France', 'reference', 'person'),
    ('louis-vi', 'Louis VI ("the Fat")',
     "Son of Philip I of France, known afterward as Louis the Fat "
     "(printed \"Lewis the Fat\"), who consulted the bishops of the "
     "royal demesnes, per Father Daniel, on restraining noble "
     "violence.",
     'Lewis the Fat|Louis the Fat', 'reference', 'person'),
    ('louis-xiv', 'Louis XIV',
     "\"Lewis XIV,\" whose famous minister Colbert is described as a "
     "man of probity, industry, and knowledge of detail, though "
     "mistaken in overvaluing town industry relative to the country.",
     'Lewis XIV|Louis XIV', 'reference', 'person'),
    ('philip-i-france', 'Philip I of France',
     "Lost all effective authority over his barons; father of Louis "
     "the Fat.",
     'Philip I', 'reference', 'person'),
    ('robert-ii-france', 'Robert II of France ("the Pious")',
     "\"Robert, the second prince of the Capetian race,\" unjustly "
     "excommunicated by the court of Rome, whose own servants' "
     "reaction illustrates the era's clerical devotion.",
     'Robert, the second prince', 'reference', 'person'),
    ('colbert', 'Colbert',
     "Louis XIV's famous minister, a man of probity and great "
     "ability who nonetheless, per Smith, overvalued the industry of "
     "towns above that of the country in his economic policy.",
     'Colbert', 'reference', 'person'),
    ('choiseul', 'the Duke of Choiseul',
     "Cited for a small experiment made about twelve years before "
     "writing, upon the parliament of Paris.",
     'Choiseul', 'reference', 'person'),
    ('quesnay', 'Mr. Quesnay',
     "\"The very ingenious and profound author\" of the physiocratic "
     "economic system Smith examines and critiques at length; a "
     "physician by training.",
     'Quesnai', 'reference', 'person'),
    ('mercier-de-la-riviere', 'Mercier de la Riviere',
     "Author of a book expounding the physiocratic doctrine, once "
     "intendant of Martinico.",
     'Mercier de la Riviere', 'reference', 'person'),
    ('mirabeau', 'the Marquis de Mirabeau',
     "\"A very diligent and respectable author,\" quoted for calling "
     "writing, money, and the physiocrats' economic table three great "
     "inventions.",
     'Mirabeau', 'reference', 'person'),
    ('voltaire', 'Mr. de Voltaire',
     "Cited for the anecdote of father Porée, an unremarkable Jesuit "
     "professor whose students nonetheless all followed his literary "
     "advice.",
     'Voltaire', 'reference', 'person'),
    ('pere-poree', 'Father Porée',
     "The Jesuit professor of no great eminence whose students' "
     "uniform deference to his literary judgment Voltaire cites as "
     "remarkable.",
     'Porée', 'reference', 'person'),
    ('father-daniel', 'Father Daniel',
     "Cited as Smith's source for Louis the Fat's consultations with "
     "the bishops of the royal demesnes.",
     'Father Daniel', 'reference', 'person'),
    ('du-cange', 'Du Cange',
     "Cited (via his Glossary, s.v. Moneta) as the source for King "
     "John of France's coin adulteration.",
     'Du Cange', 'reference', 'person'),

    # ============ Age of exploration ============
    ('columbus', 'Columbus',
     "Concluded that the shorter way to the East Indies lay west, "
     "convinced Isabella of Castile of his project, and, per his own "
     "letters to Ferdinand and Isabella, insisted the lands he found "
     "were the Indies even against clear evidence -- a mistake that "
     "gave the region its lasting name.",
     'Columbus', 'reference', 'person'),
    ('vasco-da-gama', 'Vasco da Gama',
     "Sailed from Lisbon in 1497 (printed \"Vasco de Gamo\"), nearly "
     "five years after Columbus's own expedition set out.",
     'Vasco de Gamo|Vasco da Gama', 'reference', 'person'),
    ('ferdinand-of-aragon', 'Ferdinand of Aragon',
     "Named with Isabella as the recipient of Columbus's letters "
     "insisting his discoveries were the Indies.",
     'Ferdinand', 'reference', 'person'),
    ('isabella-of-castile', 'Isabella of Castile',
     "Convinced by Columbus of his project's probability, and, with "
     "Ferdinand, the recipient of his letters on the supposed Indies.",
     'Isabella', 'reference', 'person'),
    ('cortes', 'Cortes',
     "One of the adventurers whom \"the sacred thirst of gold\" carried "
     "to Mexico.",
     'Cortes|Cortés', 'reference', 'person'),
    ('almagro', 'Almagro',
     "Carried, with Pizarro, to Chile and Peru by the same motive of "
     "gold.",
     'Almagro', 'reference', 'person'),
    ('pizarro', 'Pizarro',
     "Carried, with Almagro, to Chile and Peru.",
     'Pizarro', 'reference', 'person'),
    ('vasco-nunez-de-balboa', 'Vasco Núñez de Balboa',
     "Carried, with Ovieda and Nicuessa (printed \"Vasco Nugnes de "
     "Balboa\"), to the Isthmus of Darien.",
     'Vasco Nugnes de Balboa|Vasco Núñez de Balboa', 'reference', 'person'),
    ('ovieda', 'Ovieda',
     "Named with Nicuessa and Balboa among those carried to Darien by "
     "the thirst for gold.",
     'Ovieda|Oviedo', 'reference', 'person'),
    ('nicuessa', 'Nicuessa',
     "Named with Ovieda and Balboa in the same expedition to Darien.",
     'Nicuessa|Nicuesa', 'reference', 'person'),
    ('montezuma', 'Montezuma',
     "Cited for the population of Mexico City in his time, compared "
     "to its present state.",
     'Montezuma', 'reference', 'person'),
    ('walter-raleigh', 'Sir Walter Raleigh',
     "\"The dream of Sir Waiter Raleigh\" (a probable compositor "
     "misprint for Walter, corrected in the modern-en edition), "
     "concerning the golden city and country of El Dorado, and his "
     "patents to the London and Plymouth companies.",
     'Waiter Raleigh|Walter Raleigh', 'reference', 'person'),

    # ============ Contemporary economists, statisticians, writers ============
    ('hobbes', 'Mr. Hobbes',
     "Quoted directly: \"Wealth, as Mr Hobbes says, is power\" -- "
     "though Smith immediately qualifies that a fortune's mere "
     "possession does not itself convey political power.",
     'Hobbes', 'reference', 'person'),
    ('locke', 'Mr. Locke',
     "Cited three times: on the high price of silver bullion after "
     "the reformation of the coin under William III, alongside Law "
     "and Montesquieu on money and interest, and on the distinction "
     "between money and other moveable goods.",
     'Locke', 'reference', 'person'),
    ('hume', 'Mr. Hume',
     "Cited for the observation that in Saxon times the fleece was "
     "valued at two-fifths of the whole sheep's worth.",
     'Hume', 'reference', 'person'),
    ('montesquieu', 'M. Montesquieu',
     "Named with Locke and Law on money and interest, and separately "
     "for accounting for high interest rates among Mahometan nations "
     "by legal prohibition rather than poverty.",
     'Montesquieu', 'reference', 'person'),
    ('john-law', 'Mr. Law',
     "\"The famous Mr Law,\" who believed a bank could increase a "
     "country's productive capital and established one on that "
     "principle, explained in his own published discourse on money "
     "and trade.",
     'Law|Lawe', 'reference', 'person'),
    ('josiah-child', 'Sir Josiah Child',
     "Represented the Hamburgh and other regulated companies as "
     "harmful exclusive monopolies; a regulated company was still "
     "established long after his time, in 1750.",
     'Josiah Child', 'reference', 'person'),
    ('thomas-mun', 'Mr. Mun',
     "Compared the operation of foreign trade to seed-time and "
     "harvest; his book, \"England's Treasure in Foreign Trade,\" gave "
     "its title to a fundamental maxim of the mercantile system.",
     'Mun', 'reference', 'person'),
    ('matthew-decker', 'Sir Matthew Decker',
     "\"An excellent authority,\" cited repeatedly on the effects of "
     "taxes on the price of goods, and for his well-known proposal "
     "that all commodities be taxed by an annual licence rather than "
     "at the point of sale.",
     'Matthew Decker', 'reference', 'person'),
    ('cantillon', 'Mr. Cantillon',
     "Computed that the lowest species of common labourers must earn "
     "at least double their own maintenance in order to rear children "
     "to working age.",
     'Cantillon', 'reference', 'person'),
    ('adam-anderson', 'Mr. Anderson',
     "Compiler of the Diplomata Scotiae, to whose preface (by "
     "Ruddiman) Smith refers for the historical proportion of gold to "
     "silver in Scots coin.",
     'Anderson', 'reference', 'person'),
    ('james-postlethwaite', 'James Postlethwaite',
     "Author of the History of the Public Revenue, cited for figures "
     "on wartime exchequer discounts and on debt added during a war's "
     "continuance.",
     'Postlethwaite', 'reference', 'person'),
    ('davenant', 'Dr. Davenant',
     "Extolled the political-arithmetic skill of Mr. Gregory King, "
     "whose computation of labourers' income Smith cites.",
     'Davenant', 'reference', 'person'),
    ('lowndes', 'Mr. Lowndes',
     "Author of the Essay on the Silver Coin, cited for the market "
     "price of silver bullion around 1695.",
     'Lowndes', 'reference', 'person'),
    ('dupre-de-st-maur', 'Mr. Dupré de St. Maur',
     "One of the \"faithful, diligent, and laborious collectors of the "
     "prices of corn,\" cited repeatedly alongside Messance for French "
     "grain-price data.",
     'Dupré de St Maur', 'reference', 'person'),
    ('messance', 'Mr. Messance',
     "\"A French author of great knowledge and ingenuity,\" who showed "
     "that the poor produced more goods in cheap than in dear years "
     "across three French manufactures, and who collected French "
     "grain-price data with Dupré de St. Maur.",
     'Messance', 'reference', 'person'),
    ('meggens', 'Mr. Meggens',
     "Cited (via the Postscript to the Universal Merchant) for the "
     "estimated ratio of gold to silver annually imported into "
     "Europe.",
     'Meggens', 'reference', 'person'),
    ('ruddiman', 'Mr. Ruddiman',
     "Author of the preface to Anderson's Diplomata Scotiae, cited on "
     "the historical proportion of gold to silver coin in Scotland.",
     'Ruddiman', 'reference', 'person'),
    ('fleetwood', 'Bishop Fleetwood',
     "Collected historical wheat prices from 1202 to 1597 (in his "
     "Chronicon Preciosum), and acknowledged, on one occasion, having "
     "mistaken a conversion price for an actual market price.",
     'Fleetwood', 'reference', 'person'),
    ('gregory-king', 'Mr. Gregory King',
     "\"A man famous for his knowledge in matters of this kind,\" who "
     "in 1688 estimated the average produce of English land and the "
     "ordinary income of labourers and out-servants.",
     'Gregory King', 'reference', 'person'),
    ('john-smith-wool', 'Rev. John Smith',
     "Author of the Memoirs of Wool, cited for the historical price "
     "of English wool -- explicitly named as \"the Reverend Mr John "
     "Smith,\" distinct from Adam Smith himself.",
     'John Smith', 'reference', 'person'),
    ('douglas', 'Dr. Douglas',
     "Author of a Summary Smith cites, with some suspicion of "
     "misinformation, on plentiful herring catches.",
     'Douglas', 'reference', 'person'),
    ('arbuthnot', 'Dr. Arbuthnot',
     "Observed that there was much less variety of dress and "
     "household furniture in ancient than in modern times.",
     'Arbuthnot', 'reference', 'person'),
    ('swift', 'Dr. Swift',
     "Author of the saying that in the arithmetic of the customs, two "
     "and two do not always make four but sometimes only one -- an "
     "illustration of how excessive duties can reduce revenue by "
     "encouraging smuggling.",
     'Swift', 'reference', 'person'),
    ('ramazzini', 'Ramazzini',
     "\"An eminent Italian physician,\" author of a book on the "
     "occupational diseases peculiar to different trades.",
     'Ramuzzini|Ramazzini', 'reference', 'person'),
    ('peter-kalm', 'Mr. Kalm',
     "The Swedish traveller, cited on the state of husbandry in some "
     "of the English colonies he observed.",
     'Kalm', 'reference', 'person'),
    ('buffon', 'Mr. Buffon',
     "Cited for the relative price of pork and beef in France.",
     'Buffon', 'reference', 'person'),
    ('frezier', 'Frezier',
     "Cited, with Ulloa, on the taxation and rarity of profitable "
     "silver mining in Peru; visited Peru in 1713 and described Lima's "
     "population.",
     'Frezier', 'reference', 'person'),
    ('ulloa', 'Ulloa',
     "Cited, with Frezier, on Peruvian silver mining, and separately "
     "for cattle and horse prices at Buenos Aires; resided in the "
     "region between 1740 and 1746.",
     'Ulloa', 'reference', 'person'),
    ('solorzano', 'Solórzano',
     "Cited for the reduction of Spain's registered silver coinage to "
     "a fifth of its former amount by 1504.",
     'Solorzano', 'reference', 'person'),
    ('tavernier', 'Tavernier',
     "\"A jeweller,\" who visited the diamond mines of Golconda and "
     "Visiapour and reported on their profitability.",
     'Tavernier', 'reference', 'person'),
    ('borlase', 'Rev. Mr. Borlase',
     "Vice-warden of the stannaries, cited on the productivity of "
     "some of the world's most fertile tin mines.",
     'Borlace', 'reference', 'person'),
    ('machiavelli', 'Machiavelli',
     "Cited (as printed, \"Machiavel\") for the tyranny that banished "
     "Castruccio Castracani's silk-weaving families from Lucca, for "
     "the revival of religious credit by the mendicant orders, and for "
     "the trading methods of Lorenzo de' Medici's agents.",
     'Machiavel|Machiavelli', 'reference', 'person'),
    ('guicciardini', 'Guicciardini',
     "Cited for the state of Italian land cultivation before Charles "
     "VIII's invasion.",
     'Guicciardini', 'reference', 'person'),
    ('castruccio-castracani', 'Castruccio Castracani',
     "\"One of Machiavelli's heroes\" (the subject of his biography), "
     "whose tyranny at Lucca banished nine hundred silk-weaving "
     "families in 1310.",
     'Castruccio Castracani', 'reference', 'person'),
    ('lorenzo-de-medici', 'Lorenzo de\' Medici',
     "\"Not a prince of mean abilities,\" whose agents, per "
     "Machiavelli, carried on his trade -- an example of princely "
     "involvement in commerce.",
     "Lorenzo of Medicis|Lorenzo de' Medici", 'reference', 'person'),
    ('sandi', 'Sandi',
     "Cited (via his Istoria civile di Venezia) for the history of "
     "the Venetian silk trade.",
     'Sandi', 'reference', 'person'),
    ('pfeffel', 'Pfeffel',
     "Cited on remarkable events under Frederick II and his "
     "successors of the House of Swabia, and on the early formidable "
     "rise of the Hanseatic league.",
     'Pfeffel', 'reference', 'person'),
    ('madox', 'Madox',
     "Author of Firma Burgi and a History of the Exchequer, cited "
     "repeatedly on medieval English town charters and taxation.",
     'Madox', 'reference', 'person'),
    ('brady', 'Brady',
     "Author of a Historical Treatise of Cities and Boroughs, cited "
     "on medieval town taxation.",
     'Brady', 'reference', 'person'),
    ('charlevoix', 'Father Charlevoix',
     "Cited for an earlier population estimate of a region later "
     "found, by Smith's own account, to hold nearly double the number "
     "of inhabitants.",
     'Charlevoix', 'reference', 'person'),
    ('gemelli-careri', 'Gemelli Careri',
     "\"A pretended traveller, it is said,\" whose population estimate "
     "for a region Smith nonetheless notes agrees with another "
     "author's contemporary account.",
     'Carreri|Gemelli Careri', 'reference', 'person'),
    ('bouchaud', 'Bouchaud',
     "Cited (via his work on the French vingtième tax on "
     "inheritances) alongside Dion Cassius and Burman on Roman "
     "inheritance taxation.",
     'Bouchaud', 'reference', 'person'),
    ('burman', 'Burman',
     "Cited (via his work on Roman taxation) alongside Dion Cassius "
     "and Bouchaud on the vicesima hereditatum.",
     'Burman', 'reference', 'person'),
    ('expilly', 'the Abbé Expilly',
     "Cited (via his Collections) on evidence for how a particular "
     "order of French taxation fell unevenly on different groups.",
     'Expilly', 'reference', 'person'),
    ('barretti', 'Mr. Barretti',
     "Reported on the weekly packet-boat trade in coin between "
     "Portugal and England.",
     'Barretti', 'reference', 'person'),
    ('cassendi', 'Cassendi',
     "\"The famous Cassendi,\" who was, early in his life, a professor "
     "at a university -- an example against the claim that no eminent "
     "philosopher of the age held such a post.",
     'Cassendi|Gassendi', 'reference', 'person'),
    ('hawkins', 'Serjeant Hawkins',
     "The legal writer who still considered a particular old statute "
     "in force, though Smith notes it had never been directly "
     "repealed.",
     'Hawkins', 'reference', 'person'),
    ('drummond', 'Mr. Drummond',
     "The banker whose promissory notes for twenty-five or fifty "
     "guineas are used to illustrate how a change in the gold-silver "
     "coin ratio would affect payment in one metal versus the other.",
     'Drummond', 'reference', 'person'),

    # ============ British political and military figures ============
    ('cromwell', 'Oliver Cromwell',
     "Whose standing army, formed during his government, eventually "
     "turned the Long Parliament out of doors -- compared to Julius "
     "Caesar's destruction of the Roman republic; his navy is also "
     "cited as superior to Holland's during the Anglo-Dutch war of his "
     "time.",
     'Cromwell', 'reference', 'person'),
    ('henry-pelham', 'Mr. Pelham',
     "Prime minister in 1749, who observed to the House of Commons "
     "the exchequer discounts paid over the preceding three years.",
     'Pelham', 'reference', 'person'),
    ('robert-walpole', 'Sir Robert Walpole',
     "Author of the famous excise scheme intended to apply, to wine "
     "and tobacco, a system similar to that already used for other "
     "goods.",
     'Robert Walpole', 'reference', 'person'),
    ('earl-of-chatham', 'the Earl of Chatham',
     "William Pitt the Elder, whose army accounts, balanced with Mr. "
     "Calcraft's, are cited among wartime savings figures.",
     'Chatham', 'reference', 'person'),
    ('calcraft', 'Mr. Calcraft',
     "Cited alongside the Earl of Chatham's accounts among wartime "
     "army savings figures.",
     'Calcraft', 'reference', 'person'),
    ('cameron-of-lochiel', 'Mr. Cameron of Lochiel',
     "A gentleman of Lochaber who, without legal authority or even "
     "the rank of tenant-in-chief, exercised a criminal jurisdiction "
     "as a vassal of the Duke of Argyll -- cited as a recent (within "
     "thirty years) illustration of feudal-style authority persisting "
     "in the Scottish Highlands.",
     'Cameron of Lochiel', 'reference', 'person'),
    ('duke-of-argyll', 'the Duke of Argyll',
     "The feudal superior of whom Cameron of Lochiel was a vassal, "
     "cited in the same Highland jurisdiction anecdote.",
     'Duke of Argyll', 'reference', 'person'),
    ('peter-the-great', 'Peter the Great',
     "His improvements to the Russian empire, Smith argues, almost "
     "all resolve into the establishment of a well-regulated standing "
     "army.",
     'Peter the Great', 'reference', 'person'),

    # ============ Biblical figures ============
    ('abraham', 'Abraham',
     "Cited (Genesis) for weighing out four hundred shekels of silver "
     "to Ephron for the field of Machpelah, an early example of "
     "metal exchanged by weight rather than by stamped coin.",
     'Abraham', 'reference', 'person'),
    ('ephron', 'Ephron',
     "The seller to whom Abraham weighed out the four hundred shekels "
     "of silver for the field of Machpelah.",
     'Ephron', 'reference', 'person'),
    ('esau', 'Esau',
     "Cited for selling his birthright for a mess of pottage -- an "
     "image Smith uses (by explicit contrast) for Scottish landed "
     "gentlemen exchanging their feudal power for luxuries, but not "
     "under any such pressing necessity.",
     'Esau', 'reference', 'person'),
]:
    add(*row)

editorial = dict(
    bookId='wealth-of-nations',
    contentVersion='2026-09-13.1',
    entities=entities,
    coverage=(
        "An economic treatise with no narrative cast of its own -- "
        "every entity is category Reference, per editorial policy's "
        "treatise guidance. Despite its size (2173 paragraphs, the "
        "largest book yet in this Lane A queue by paragraph count), "
        "this book is markedly reference-light relative to Leviathan "
        "or the Federalist Papers, as the automation queue itself "
        "anticipated: a full-book capitalized-word frequency sweep "
        "turned up only ~1463 distinct forms, most of them place "
        "names. Chapters 1-10 were read in full, sequentially, in "
        "both editions; the historically dense remainder (chapter 11's "
        "298-paragraph digression on silver's historical value, and "
        "the historical passages of chapters 12-32, especially 19-20, "
        "27, and 30) were covered by an exhaustive full-book proper-"
        "name extraction, with every candidate confirmed by reading "
        "its exact source-text context rather than assumed from the "
        "word alone. Five potential namesake collisions were checked "
        "and each resolved cleanly, without needing the escape hatch, "
        "because the text itself fully qualifies every occurrence: "
        "Zeno of Citium vs. Zeno of Elea (both carry their own city-"
        "epithet in the same paragraph), King John of England vs. King "
        "John of France, Louis VI \"the Fat\" vs. Louis XIV, Robert "
        "Bruce vs. Robert II of France vs. Sir Robert Walpole, and "
        "Vasco da Gama vs. Vasco Núñez de Balboa. One source defect is "
        "recorded and kept as printed: \"Sir Waiter Raleigh\" (a "
        "probable compositor misprint for \"Walter\", confirmed by the "
        "modern-en edition's correction at the same locations). The "
        "modern-en edition systematically modernizes several archaic "
        "spellings from the original (\"Annibal\"/\"Hannibal\", "
        "\"Amilcar\"/\"Hamilcar\", \"Lewis\"/\"Louis\", \"Christiern\"/"
        "\"Christian\", \"Vasco de Gamo\"/\"Vasco da Gama\"), each "
        "aliased under both spellings so the entity binds in both "
        "editions. Both editions were read and reviewed independently."
    ),
)

if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'editorial.json'
    out.write_text(json.dumps(editorial, indent=2, ensure_ascii=False) + '\n')
