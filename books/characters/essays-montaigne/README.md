# Montaigne's Essays character package — IN PROGRESS

**Chapters 1–102 of 107 are authored. The rest are not.** Status stays
`in-progress` and the package must not be integrated until the whole work is
covered.

Current state: 1,064 entities authored, all 1,064 bound in both editions, 4,383
and 4,528 exact mentions. Of those, 162 and 180 fall inside chapters 1–10, 205 and 209
inside chapters 11–20, 344 and 357 inside chapters 21–25, 136 and 142 inside
chapters 26–30, 256 and 264 inside chapters 31–40, 278 and 288 inside
chapters 41–50, 271 and 279 inside chapters 51–60, 272 and 278 inside
chapters 61–68, 592 and 599 inside chapter 69 alone, 157 and 159 inside
chapters 70–73, 214 and 218 inside chapters 74–80, 286 and 310 inside
chapters 81–90, 385 and 404 inside chapters 91–98, 253 and 260 inside
chapter 99 alone, and 150 and 154 inside chapters 100–102; the rest — 422 and 427 —
are later occurrences of names that belong to one man through the whole book:
Cicero, Plato, Horace, Seneca, Socrates, Plutarch, Aristotle and the other
authorities Montaigne quotes on every page. Content revision 2026-09-13.10.

Chapter 69, the Apology for Raimond Sebond, is by itself the largest chapter in
the work — 660 paragraphs, as much text as chapters 41–68 together, and more
mentions than any other chapter by a factor of three. It is also a doxography,
which is the worst possible case for this kind of package: page after page of
"Zeno says, Aristo thinks, Crassus reports", where the same name is two or three
different men and the only evidence of which is the sentence it stands in. The
method that worked is written up under **Editorial checks** below.

## What is hard about this book

Both of the two difficulties this library knows, at once.

**The spelling.** Both editions are Cotton, but the modern one modernises the
transliterations, which almost none of the other packages have to deal with on
this scale:

| Older | Modern |
|---|---|
| Wicliffe | Wycliffe |
| John Zisca | John Zizka |
| Alessandro Trivulcio | Alessandro Trivulzio |
| Fabricio Colonna | Fabrizio Colonna |
| Juliano Romero | Giuliano Romero |
| Ottaviano Fregosa | Ottaviano Fregoso |
| Sylla | Sulla |
| Henry de Vaux | Henri de Vaux |
| Lucius AEmilius Regillus | Lucius Aemilius Regillus |
| Marcus. Emilius Lepidus | Marcus Aemilius Lepidus |
| AEneid, AEneas, AEschylus | Aeneid, Aeneas, Aeschylus |
| Pertander | Periander |
| Jacques Amiot | Jacques Amyot |
| OEdipus, OEdip | Oedipus, Oedip |
| Gellium (accusative) | Gellius |
| Ter. | Terence |
| Paulus, Fabius (singular) | Paulli, Fabii (plural) |
| **Aristo** | **Ariosto** (at 27:13 only) |
| Danaides | Danaids |
| La Boetie | La Boétie |
| Demophoon | Demophoön |
| Meniceus | Menoeceus |
| Guillaume Guerente | Guillaume Guérente |
| Marc Antoine Muret | Marc-Antoine Muret |
| Posthumius | Postumius |
| AElius Verus | Aelius Verus |
| Claudius (the poet) | Claudian |
| Jubera | Aljubarrota |
| Bearn, Sarlac, Medoc | Béarn, Sarlat, Médoc |
| Alexia, Beeotia | Alesia, Boeotia |
| Dicarchus | Dicaearchus |
| Propertious | Propertius |
| Aeneius Fulvius | Cnaeus Fulvius |
| Frauget, Chatillon, Montmorenci | Franget, Châtillon, Montmorency |
| Jaques Pelletier | Jacques Pelletier |
| Guast | Guasto |
| Paulus Emilius | Paulus Aemilius |
| Quint. Curt. | Quintus Curtius |
| P. Crassus | Publius Crassus |
| Lorenzo de’ Medici (curly apostrophe) | Lorenzo de' Medici (straight) |
| Achaians, Etrurians, Gyndas, Arginusian | Achaeans, Etruscans, Gyndes, Arginusae |
| Hieronimus | Hieronymus |
| Rene, Duke of Lorraine | René, Duke of Lorraine |
| Duc de Valentinois | Duke of Valentinois |
| d’Estrees, d’Ascot (curly) | d'Estrees, d'Ascot (straight) |
| Pompeius (in the Posidonius story) | Pompey |
| St. Louis | St Louis, and once Saint Louis |
| Antonio de Leyva | Antonio de Leva (at 41:7 in **both**) |
| **Philopcemen** (a broken œ) | Philopoemen |
| William, Earl of Salisbury | **Earl of Salisbury, William** (the name inverted) |
| d’Anguien (curly) | d'Anguien (straight) |
| Goygias | Gorgias |
| Mamalukes, Suabians, Dahas | Mamelukes, Suebi, Dahae |
| Aretin | Aretino |
| Pub. Decius | Publius Decius |
| Paulus AEmilius, Scipio AEmilianus | Paulus Aemilius, Scipio Aemilianus |
| **Piny** (a misprint) | Pliny |
| **Tiberias** (a misprint) | Tiberius |
| **Cornet. Gallus** (a misprint) | Cornelius Gallus |
| Dionysos, Lyacus | Dionysus, Lyaeus |
| Quintil., Pub. Mim. | Quintilian, Publius Mimus |
| Pheedo | Phaedo |
| Titus Livius (66:0, 73:70), **Titius Livius** (62:18) | Livy |
| Poppea | Poppaea |
| Oromazis | Oromasdes |
| Xamolxis | Zamolxis |
| **EPICUYUS**, **HEYMACHUS** (the salutation of Epicurus's last letter, in capitals) | EPICURUS, HERMACHUS |
| **Balias** (69:391) | Pallas |
| Soliman | Suleiman |
| Mule Moloch | Moulay Mohammed |
| Montdore | Mondoré |
| Turnebus | Turnèbe |
| Mercurino de’ Gratinare | Mercurino de' Gattinara |
| Rene, king of Sicily | René, king of Sicily |
| Etienne De la Boetie | Etienne de la Boétie |
| **Lactantms** (74:156) | Lactantius |
| **Zenocrates** (69:268, 69:401) | Xenocrates |
| **Metellius of Macedon** (74:91) | Metellus of Macedon |
| **Titius Livius** (62:18), Titus Livius (66:0, 73:70) | Livy |
| Syrens | Sirens |
| Solyman (81:7) | Suleiman |
| **Asnius Pollio** (84:10) | Asinius Pollio |
| Sieur de Mattecoulom | Sieur de Matecoulom |
| Cercyo | Cercyon |
| Mohammed | Mehmed |
| Archytas Tarentinus | Archytas of Tarentum |
| Carillus | Charillus |
| Caesario | Caesarion |
| Posthumia, Servius Sulpitius, Mutia | Postumia, Servius Sulpicius, Mucia |
| AEgisthus | Aegisthus |
| Philopaemen (85:4) | Philopoemen |
| Conrad, Marquis of Monteferrat | Conrad, Marquis of Montferrat |
| Huniades | Hunyadi |
| Montdore, Mondoré | (see chapters 74–80 above) |
| Demetrius Phalereus | Demetrius of Phalerum |
| Sphaereus | Sphaerus |
| Ficinus | Ficino |
| Essenians | Essenes |
| Menon | Meno |
| Panetius | Panaetius |
| **Origeti** (69:476) | Origen |
| Marc Antony (100:13) | Mark Antony |
| Adrian (101:13) | Hadrian |
| Lachez (100:7) | Lachez — both editions, against *Laches* at 12:1 and 84:22 |

Both spellings sit on one card, and a test pins every pair. The last row is the
one most likely to be undone by accident: the two editions differ only in the
kind of apostrophe, and an alias with the wrong one binds in one edition and not
the other.

**Chapter 69 is worse than the rest of the book put together.** The Apology is
where the older edition's typesetting breaks down, and the misprints there are
not older transliterations but plain compositor's errors — an *rn* set as *m*, a
*V* set as *Y*, a line-break hyphen left standing in the middle of a word:

| Older edition | Modern edition | What went wrong |
|---|---|---|
| **Cameades** (69:243, 69:590), **Car-neades** (69:182) | Carneades | *rn* set as *m*; a line-break hyphen kept |
| **Epichar-mus** (69:656), **Ætha-lides** (69:473) | Epicharmus, Aethalides | line-break hyphens kept |
| **Yarro** (69:167) | Varro | *V* set as *Y* |
| **Satuminus** (69:345) | Saturninus | *rn* set as *m* |
| **Lucurgus** (69:388) | Lycurgus | |
| **Proctagoras** (69:558) | Protagoras | |
| **Pytagoras** (69:253) | Pythagoras | |
| **Sertorious** (69:126) | Sertorius | |
| **Theodoras** (69:19, 69:268) | Theodorus | |
| **Zenophanes** (69:268) | Xenophanes | *X* set as *Z*, in a paragraph that also names Xenophanes correctly |
| **Arcesilas** (69:182) | Arcesilaus | an older form, beside *Arcesilaus* in the same chapter |
| **Sehond** (69:22, beside *Sebond* in the same paragraph) | Sebond | the book's own subject misprinted |
| Cæsar (69:287), Timæus (69:243), Scævola (69:370), Dicæarchus (69:395, 572), Tyrtæus, Alcmæon, Paulus Æmilius | Caesar, Timaeus, Scaevola, Dicaearchus, Tyrtaeus, Alcmaeon, Paulus Aemilius | real æ ligatures, not the *AE* digraph the rest of the older edition uses |
| Anaximines, Anexandridas, Tyridates, Memmus, Apollonius Tyanaus, Margaret de Valois, Diogenes Apolloniates | Anaximenes, Anaxandridas, Tiridates, Memmius, Apollonius of Tyana, Marguerite de Valois, Diogenes of Apollonia | older forms the modern edition corrects |
| St. Austin (69:225), St Augustin (69:388), St. Thomas d'Aquin (69:5), St. Paul (69:20), St. Louis (69:12) | Saint Augustine, St. Augustine, St Thomas Aquinas, Saint Paul, Saint Louis | both editions are inconsistent about *St.*, *St* and *Saint*, in both directions |

A census of the saint names, run because of that last row, found two things
outside chapter 69 that eight earlier passes had missed: the modern edition
writes *Saint Augustine* at 65:40 and *St Paul* at 17:2, and **the "dean of
St. Hilary of Poitiers" at 65:22 is a church, not the bishop** — a live
mis-binding. The modern edition prints it *Saint-Hilaire in Poitiers*, which is
how the place gives itself away. It is the third place in this package where an
alias had to be suppressed.

**How chapter 69 was actually read.** Paragraph dumps are the wrong instrument
for a doxography: at 660 paragraphs of "Zeno says, Aristo thinks, Crassus
reports", the identification evidence is never the paragraph, it is the sentence.
The pass that worked built a *sentence-level identification sheet* — one line per
new capitalised name, carrying only the sentence it stands in — and worked down
it. Two of the three cards this package has had to correct for being written from
memory rather than from the page were written before that sheet existed.

**The namesakes.** An essayist who cites for eleven hundred pages repeats names
constantly, and Montaigne almost never distinguishes them. In the first
ninety-eight chapters:

| Entity | Where | Against |
|---|---|---|
| `edward-black-prince` / `edward-i` | 1:1 / 3:11 | Edward III's son who spared the three French gentlemen, and the Edward who made his son carry his bones against the Scots. Three more Edwards wait in chapters 41, 78 and 80 |
| `zeno-mamertine` | 1:5 | the founder of the Stoa, who is the Zeno of the other twenty-five occurrences in the work |
| `dionysius-elder` | 1:4, 2:21 | the later Dionysiuses of chapters 16, 23, 24 and after |
| `conrad-iii` | 1:3 | Conrad, Marquis of Monteferrat, at 86:19 |
| `ferdinand` | 2:9 | the King Ferdinand who sent colonies to the Indies, at 107:9 |
| `john-of-hungary` / `john-zisca` | 2:9 / 3:11 | two men called John in two chapters |
| `diodorus-dialectician` | 2:21 | Diodorus Siculus the historian, at 69:532 and 74:18 |
| `robert-bruce` | 3:11 | the King Robert of 33:7, whom the history does not identify with him |
| `philip-ii-spain` / `don-philip` | 3:13 / 7:0 | the King of Spain reigning as Montaigne writes, and Charles V's father — with Philip of Macedon and Alexander's physician Philip both waiting in later chapters |
| `cyrus-the-great` | 3:13, 4:9 | Cyrus the Younger, not yet read |
| `crito` | 3:15 | the Crito of 69:208, who is somebody's brother in another story |
| `marcus-aemilius-lepidus` | 3:15 | the AEmilius Lepidus who died of a stumble at his own threshold (19:24), the Lepidus who followed Salvidienus (23:1), the three of that name in one family (94:19) and the coxcomb who died of grief (99:157) |
| `theodoro-trivulzio` / `alessandro-trivulcio` | 3:10 / 5:9 | two men, one surname, and the surname spelled differently in the two editions |
| `perseus-macedon` | 5:0 | the Gorgon-slayer of 44:1, 69:268 and 107:53 |
| `pyrrhus-epirus` | 5:0 | the Pyrrhus of the transmigration list at 69:473 |
| `martin-du-bellay` / `jean-du-bellay` | 5:9 / 10:3 | the soldier-memoirist and the cardinal — and Joachim the poet in chapters 24, 25 and 74, a third man |
| `antigonus-i` | 5:10 | the Antigonus of 37:0, displeased at being brought Pyrrhus's head |
| `henry-de-vaux` / `henry-vii` | 5:11 / 7:0 | the cavalier of Champagne and the King of England |
| `nassau` | 5:9 | the Count of Nassau who entered Guise at 15:5 |
| `cleomenes-i` | 6:2 | at least one other Spartan Cleomenes, in chapters 25, 60, 88 and 93 |
| `darius-iii` / `darius-i` | 6:8 / 9:2 | the king Alexander would not attack by night, and the king who kept a prompter to remember the Athenians |
| `charles-v` | 7:0 | eighteen later occurrences of Charles, unread |
| `duke-of-alva` | 7:0 | "the last Duke of Alva" at 74:157 |
| `pliny-elder` | 9:6 | the younger Pliny of the letters, at 38:45 and 39:0 |
| `francesco-sforza` | 9:8 | Ludovico Sforza, the tenth Duke of Milan, at 18:3 |
| `severus-cassius` | 10:4 | five later occurrences of Cassius, unread |
| `guelph` | 1:3 | **the Guelph faction** at 106:51, where Montaigne says he was a Guelph to the Ghibelline and a Ghibelline to the Guelph. Not a man at all |
| `marcus-aemilius-lepidus` / `aemilius-lepidus-threshold` / `paulus-aemilius` | 3:15 / 19:24 / 19:37 | three men called Aemilius: the one who forbade his heirs to pay for his hearse, the one who died of a stumble at his own threshold, and the conqueror of Macedon |
| `francesco-sforza` / `ludovico-sforza` | 9:8 / 18:3 | two Dukes of Milan |
| `charles-v` / `charles-iv` | 7:0, 11:14, 12:3, 16:8 / 20:22 | the Emperor of the French wars, and the Emperor and King of Bohemia who was shown the hairy girl from near Pisa |
| `francesco-saluzzo` | 11:14 | Francesco Taverna and Francesco Sforza, both named at 9:8 |
| `julius-caesar` | 16:3, 19:67, 19:71 | Augustus Caesar at 4:10, who is bound by his own longer name |
| `publius-crassus` | 16:9, 16:10 | the triumvir and his son, who belong to chapters not yet authored |
| `diogenes-the-atheist` | 11:31 | Diogenes the Cynic of chapters 27, 50 and 60, and Diogenes Laertius at 68:61 |
| `xenophanes-colophon` | 11:32 | the later Xenophanes passages, unread |
| `leo-the-emperor` | 11:32 | Pope Leo X at 2:21 — two men called Leo in the same book, one of whom prophesied the emperors and the other of whom died of joy |
| `metellus-scipio` | 18:12 | a whole family of Scipios in chapters not yet authored |
| `antiochus` | 20:4 | the other Antiochuses of the Essays |
| `nassau` / `nassau-guise` | 5:9 / 15:5 | two Counts of Nassau, whom the Essays do not identify with each other |
| `bourbon` | 17:2 | the rest of the house, later |
| `ludovico-gonzaga` / `guido-di-gonzaga` | 19:24 | father and son, and the son's name is also Ludovico Sforza's |
| `zeno-mamertine` / `zeno-of-citium` | 1:5 / 22:49, 24:55 | the citizen of Messina and the founder of the Stoa |
| `metellus-scipio` / `publius-scipio-pontifex` / `scipio-africanus` | 18:12 / 22:49 / 23:10 | Pompey's father-in-law, the high priest in Cotta's list, and the Africanus who crossed to Syphax in two ships |
| `lepidus-conspirator` | 23:1 | a fourth man of that name, in Livia's list of conspirators — and the only one who carries the bare surname |
| `philip-physician` | 23:7 | a fourth Philip: Alexander's physician, accused of taking Darius's money |
| `joachim-du-bellay` | 24:0, 24:2 | the third du Bellay, the poet |
| `cato-the-younger` | 22:54 | Cato the Censor and the rest, unread |
| `hippias-sophist` | 24:62 | the Hippias of 103:143, unread |
| `aristo-of-chios` | 24:54 | a tragedian called Aristo at 25:152, and — in the older edition only — **Ariosto at 27:13**, where the modern edition prints the poet's name in full. Bound by his full name, so the bare form binds nothing |
| `francis-brittany` / `john-v-brittany` / `charles-viii` | 24:49, 24:63 | four more men called Francis, two called John, three called Charles. All bound by their full names |
| **`augustus` at 23:1** | 23:1 | Augustus calls himself Caesar when he asks Cinna what he means by undertaking Caesar. The Caesar table sends that paragraph to Augustus, not to Julius |
| `pompey-the-dancer` | 25:25 | Pompey the Great. One of the two noted dancers of Montaigne's day carries the same name |
| `signora-livia` | 25:26 | Augustus's wife. Her petticoats are what a young traveller should not come home able to describe |
| `aristo-tragedian` | 25:152 | Aristo of Chios, and the Ariosto the older edition spells Aristo |
| `diogenes-the-cynic` | 25:103 | Diogenes the Atheist of 11:31, and Diogenes Laertius at 68:61 |
| `cleomenes-sparta` | 25:117 | the Cleomenes who broke the truce with Argos at 6:2 |
| **the sign of Leo** | 25:65 | Pope Leo X and the Emperor Leo. Both are bound by multi-word aliases, so the zodiac sign carries no card |
| `philip-augustus` / `philip-v-macedon` | 26:18 / 30:0 | a fifth and sixth Philip: the king of France whom Pope Honorius buried at Rome on the day he died at Mantes, and the king of Macedon who looked down on Sulpicius Galba's camp |
| `antony-germany` | 26:18 | Mark Antony. This one lost a battle in Germany under Domitian |
| `stratonice-deiotarus` | 30:39 | the Stratonice whose beauty gave Antiochus his fever |
| `charles-ix` | 30:43 | a fourth Charles |
| `ariosto` at 27:13 | 27:13 | Aristo of Chios and Aristo the tragedian. The older edition spells the poet Aristo here and Ariosto at 6:7; one card carries both |
| **`philip-augustus` again** | 26:18 | **the emperor Augustus**, whose alias was binding the second half of Philip Augustus's name until the full name was made an alias of its own. A live mis-binding, now pinned |
| `alexander-vi` | 33:2 | Alexander the Great. The pope is bound by "Pope Alexander VI", so the longer span wins and the bare name binds nothing there |
| `constantine-founder` / `constantine-last` | 33:7 | each other. One sentence names the founder of the empire of Constantinople and the man who lost it, both Constantine, both sons of a Helen. Keyed by occurrence |
| `king-robert` | 33:7 | Robert Bruce at 3:11, whom the Essays do not identify with him. Bound by "King Robert", and the bare surname binds nothing |
| `charles-of-burgundy` / `charles-de-blois` | 37:0 | a fifth and sixth Charles, both in one sentence, both bound by their full names |
| `cato-the-younger` / `cato-the-censor` | 36:12–36:30, 38:66 / 40:52, 40:55 | each other. The chapter on Cato of Utica quotes five poets on him; the Censor buried a praetor-elect son and disarmed the Spanish cities as consul |
| `pliny-the-younger` | 38:45, 38:60, 39:0 | Pliny the Elder of the Natural History. The modern edition names the younger man once more, at 38:50, where Cotton says only "this advice" |
| `philip-ii-macedon` | 39:1, 39:7 | a seventh Philip: the father who asked Alexander whether he was not ashamed to sing so well |
| `scipio-aemilianus` | 39:0 | the Africanus who crossed to Syphax, Pompey's father-in-law and the high priest |
| `st-louis` / `louis-xi` | 40:51 / 40:5 | Louis IX, who binds book-wide, against the Louis pinned to the taking of Arras by his numeral |
| **`paulus-aemilius` at 40:52** | 40:52 | **the Paulli of Augustus's list at 23:1**, whose family alias — "Paulus", the form the older edition prints — was taking this man's shorter name away from him. A live mis-binding, now pinned |
| `democritus` | 38:44 | nobody. Single-referent across the work, so he is alias-bound and appears in the twenty-two later paragraphs that name him |
| `edward-iii` | 41:7 | the Black Prince at 1:1 and Edward I at 3:11 — and the Black Prince is in this very paragraph, as *the Prince of Wales*, by title and not by name |
| `hiero` | 42:50, 42:57, 42:60 | Syracuse had two kings of the name, and three later occurrences are unread, so only the three paragraphs of Xenophon's dialogue are keyed |
| `alfonso-of-the-asses` / `alfonso-of-the-band` | 42:57 / 48:43 | **each other.** Two kings called Alfonso, and nothing in either passage joins them, so each gets a card that says so |
| `henry-ii-france` / `henry-ii-england` / `henry-duke-of-normandy` | 43:0, 46:3, 48:56 / 46:2 / 46:2 | two kings called **Henry II**, one of France and one of England, seven paragraphs apart, plus the English one's son. 46:2 names the son and then the father, so it is keyed by occurrence — and 5:11's Henry de Vaux and 7:0's Henry VII are in the same table |
| `metellus-tribune` / `metellus-crete` | 44:0 / 48:47 | each other, and Metellus Scipio at 18:12. Three later Metelluses are unread |
| `marius-younger` / `marius-elder` | 44:1 / 47:8 | each other: the son who slept through his own rout, and the father in the social war. Six later occurrences are unread |
| `sextus-pompeius` / `trogus-pompeius` | 44:1 / 48:7 | Pompey the Great, and each other. Neither is Pompey, and both are bound by their full names so the table-bound surname takes neither |
| `mark-antony` | 44:1 | the Antony of 26:18, who lost a battle in Germany under Domitian |
| `perseus-macedon` at 44:1 | 44:1 | **a correction to the chapters 1–30 pass**, which listed 44:1 among the Gorgon-slayer's paragraphs from a distance. It is the king: "King Perseus of Macedon, being prisoner at Rome, was killed by being kept from sleep." Now bound |
| `duc-de-guise` | 45:0, 45:1 | **the town of Guise** at 15:5, which the Count of Nassau entered, and a Duc de Guise in two unread chapters — the house supplied more than one |
| `du-guesclin` | 46:9 | himself. Montaigne spells the constable Guesquin, Glesquin and Gueaquin in one sentence, to ask which of the letters earns his victories; all three sit on one card |
| `bayard` = `Peter Terrail` / `suetonius` = `Tranquillus` / `nicholas-denisot` = `Count d'Alsinois` / `antonio-iscalin` = `Captain Paulin` = `Baron de la Garde` | 46:12 | **themselves.** The chapter on names is built out of men who carry more than one, and every set sits on one card |
| `fabius-maximus-rullianus` | 48:51 | the Q. Maximus of 40:52 and the house of the Fabii at 23:1, whose alias is the bare *Fabius*. His full name is long enough to win the span |
| `fabricius-luscinus` | 49:0 | the bibliographer of the epitaph on Lucan at 25:137, who is apparatus and carries no card |
| `nicomedes` | 49:38 | 90:3, unread |
| `cyrus-the-younger` | 47:17 | Cyrus the Great, who holds nine other paragraphs. The chapters 1–30 pass said the younger Cyrus was not yet read; 47:17 is where he arrives |
| `antiochus-iii` | 47:14 | the Antiochus whose fever Stratonice's beauty gave him, at 20:4 |
| `marcus-brutus` | 50:8 | the Brutus who besieged the Xanthians at 40:6 — and the Brutus at 47:14, who carries no qualifier and so no card |
| `timon` | 50:7 | Timon of Phlius the sceptic, and two unread occurrences |
| `agis` | 47:16 | at least three later Agises, unread. The card says plainly that the text gives him no distinguishing mark |
| `savoy-the-horse` | 48:4 | **the duchy of Savoy** at 25:52. The horse is a horse |
| **`democritus-aetolian`** | 60:45 | **the philosopher of Abdera**, whose alias is single-referent everywhere else in the work and was taking this one too. "Democritus, general of the AEtolians" died on his own sword rather than be retaken. A live mis-binding, and the second place in the package where an alias had to be suppressed |
| **`aurelius-bishop`** | 26:18 | **"he whom they called Marcus Aurelius"** at 59:32 — the Spanish book Montaigne's father had always in his mouth, which is Guevara's and goes by the emperor's name. The bishop's bare alias was taking the last seven letters of it. A live mis-binding; nothing is bound there now, since the referent is neither the bishop nor, plainly, the emperor |
| `cornelius-gallus-poet` | 59:24 | **`cornelius-gallus`**, the proctor of 19:24. The older edition abbreviates the poet *Cornet.* and the modern prints *Cornelius Gallus* in full, colliding exactly with the proctor's alias, so that alias is suppressed there and the surname alone is keyed |
| `tiberius-emperor` | 59:13, 60:56 | Tiberius Gracchus, who holds the bare *Tiberius* in two read chapters under his longer name. The older edition misprints the emperor *Tiberias* |
| `fulvius-favourite` / `fulvius-consul` | 60:52 | each other, in one paragraph, plus Cnaeus Fulvius at 15:4 and Quintus Fulvius Flaccus at 48:51. Keyed by occurrence: the favourite once, the consul twice |
| `vibius-virrius` | 60:52 | **Gallus Vibius** the rhetorician at 20:2, who went out of his wits studying madness. Keyed rather than aliased, so the bare surname cannot reach him |
| `pausanias-assassin` | 59:21 | a third Pausanias: the Spartan of 29:5 and the victor of Plataea at 36:10 |
| `antiochus-iv` | 59:51 | a third Antiochus: Stratonice's at 20:4 and Hannibal's at 47:14 |
| `brutus-consul` / `cassius-conspirator` | 59:47 / 59:16, 59:17, 60:38 | a fourth Brutus and a second Cassius: the consul who killed his own children, and the man who drank nothing but water and asked whether he should bear a tyrant when he could not bear wine |
| `cyrus-the-younger` at 59:28 | 59:28 | Cyrus the Great, ten paragraphs of whom stand elsewhere. Here he claims to be preferred before his brother Artaxerxes because he could drink more |
| `artaxerxes` | 59:28 | two other kings of the name, and 68:42, unread. Keyed, not aliased |
| `cleomenes-therykion` | 60:35 | a third Spartan Cleomenes: the one of 6:2 and the one of 25:117 |
| `agis-on-freedom` | 60:3 | the Agis of 47:16. Neither is given a numeral, and the two cards say plainly that the Essays do not join them |
| `philip-ii-macedon` / `philip-v-macedon` | 59:21, 60:3 / 60:55 | each other, again. Antipater in the same paragraph fixes 60:3 to the elder king; the siege of Abydos fixes 60:55 to the younger |
| `henry-ii-france` / `st-paul` | 43:0 etc. / 60:57 | **the town of Saint-Paul** at 17:2, which the Comte de Bures took. The apostle arrives at 60:57 and is keyed there alone |
| `publius-syrus` as "the player Publius" | 58:0, 58:2 | Publius Sulpicius Galba and Publius Crassus, both bound by their longer names |
| `attilius-regulus` | 52:0, 60:11 | nobody, but the bare surname is keyed rather than aliased because 101:2 and 101:3 are unread |
| **`cicero` / `cicero-the-younger`** | 67:21 | **each other, in one paragraph.** "The younger Cicero, who resembled his father in nothing but in name" takes over the sentence about Cestius and the whipping, and the father's alias would have taken all four occurrences. The third suppression in the package, keyed by occurrence: father, son, son, son |
| `labienus-orator` / `labienus-father` | 65:39 | each other, in one paragraph, the orator three times to the father's once |
| `archias-thebes` / `archias-athenian` | 61:3 | each other, in one sentence: the tyrant who put the warning by till to-morrow, and the Athenian who sent it |
| **`apollodorus-dreamer`** | 62:12 | `apollodorus` at 25:3, who said Chrysippus's writings would be blank paper without their borrowings. The dreamer's heart told him he was the cause of his own flaying. Neither is alias-bound now |
| `madame-destissac` / `monsieur-destissac-husband` / `monsieur-destissac-son` | 65:0 / 65:2 / 65:2 | one another: the widow the chapter is dedicated to, and in one sentence her husband and her son, all three under the same designation |
| **`severus-cassius` inverted** | 10:4, 65:39 | himself. The older edition prints him Severus Cassius in one chapter and Cassius Severus in the other, and the Cassius three words later in the second is the conspirator |
| `metellus-numidicus` | 68:7 | a third Metellus: the tribune of 44:0 and the besieger of Crete at 48:47 |
| `artaxerxes-lawgiver` | 68:42 | the Artaxerxes of 59:28, whose brother claimed to outdrink him. Nothing joins the two acts, so each has a card that says so |
| `diogenes-laertius` | 68:61 | Diogenes the Cynic and Diogenes the Atheist. His full name is long enough to win the span from the Diogenes table |
| `scipio-aemilianus` as "the younger Scipio" | 66:7, 66:14 | the three other Scipios, and the unqualified one at 63:43 |
| `zeno-of-elea` | 69:327 | `zeno-of-citium`, who fills the rest of the chapter, and `zeno-mamertine` of 1:5. 69:327 is "one same is not, and there is nothing", beside Parmenides's "there is but one thing" — the Eleatic thesis and nobody else's |
| **`persaeus`** | 69:268 | **both other Perseuses**. Zeno's disciple, of opinion that men gave the title of gods to such as had been useful to human life. Not the King of Macedon of 5:0 and 44:1, and not the Gorgon-slayer. This is the paragraph two earlier passes of this package were pointing at when they wrote 44:1 |
| `crassus-orator` / `crassus-triumvir` | 69:87 / 69:126 | each other and `publius-crassus` of 16:9. The orator's lamprey knew his voice and came when he called it; the triumvir is the one Surena beat with the Parthian bow |
| `aristo-of-chios` / `ariston-plato-father` | 69:268, 69:558 / 69:345 | each other, the tragedian of 25:152 and Ariosto at 27:13. Plato's father is the Aristo who could not enjoy Perictione and was warned off her in a dream by Apollo; the Stoic is the one who thinks the form of God incomprehensible. The modern edition writes the Stoic *Ariston* at 69:558 and Plato's father *Aristo* at 69:345, which is the reverse of what a reader would guess |
| `crito-brother` | 69:208 | `crito`, Socrates's friend at 3:15. Thrasylaus's brother, who restored him to his better understanding — for which Thrasylaus was very sorry, having enjoyed believing that every ship into the Piraeus sailed for his profit |
| `timon-of-phlius` | 69:378 | `timon` the Man-hater of 50:7. The one who calls Plato a monstrous forger of miracles |
| `diodorus-siculus` | 69:532 | `diodorus-dialectician` of 2:21, who died of shame. The historian who kept the Chaldees' register of four hundred thousand years |
| `saturninus-husband` | 69:345 | `saturninus` the seditious tribune of 68:7. The older edition misprints the husband **Satuminus** |
| `pyrrhus-transmigration` | 69:473 | the King of Epirus. The man Pythagoras remembered having been, after Aethalides, Euphorbus and Hermotimus |
| `agis-king-of-sparta` | 69:47 | the two other Agises, at 47:16 and 60:3. The Essays give none of the three a numeral and join none of them to another; three cards, each saying so |
| **`tethys`** | 69:656 | **`thetis`**. Homer's Ocean and Tethys, father and mother of the gods, are not the sea-goddess Alexander sacrificed to at the Indian Ocean. The older edition prints the Titaness *Thetis*, which is the other one's name; the modern edition corrects it. Found by a census of the edition-asymmetric bindings, after the two had been merged onto one card in error |
| `antigonus-i` | 69:126 | `antigonus-gonatas` of 37:0, and the unqualified Antigonus of 5:10 |
| `mark-antony` | 69:89 | `antony-germany` of 26:18 |
| `scaevola` | 69:370 | `mucius-scaevola` of 40:45. The older edition prints the ligature **Scævola** here and *Scaevola* at 22:49, so one man has two spellings inside one package |
| `ammianus-marcellinus` / `tullius-marcellinus` | 15:4, 66:15 / 70:35, 70:38 | each other. The historian's full name binds at 15:4 and the bare surname at 66:15 is his; the young Roman of chapter 70, who starved himself out of this life, holds the bare form there. Three more bare occurrences wait in chapters 76 and 89 |
| **`demosthenes-general`** | 70:28 | **the orator**, whose alias is single-referent everywhere else in the work and was taking this paragraph. "That great leader, Demosthenes, after his rout in Sicily" is the Athenian general of the Syracusan expedition. A live mis-binding |
| `pomponius-atticus` | 70:33 | the bare surname at 42:73, which is the title of Cornelius Nepos's *Life of Atticus*, and at 67:20, which is the title of Cicero's letters. Titles are not cast, so the man is bound by his full name alone |
| **`flora-courtesan`** | 72:14, 97:38 | **`flora`**, the figure Speusippus painted his school with at 25:90. The courtesan is named as a courtesan in both her paragraphs; the goddess's alias was taking both of them. A live mis-binding, found by the audit of unkeyed table names |
| `rutilius-poet` | 72:43 | two other men in chapters not yet read: the Rutilius of Tacitus's *Agricola* at 74:7 and the consul Publius Rutilius at 84:21. Keyed, not aliased |
| **`pallas-evander`** | 69:302 | **`minerva`** under her Greek name at 69:358 and 69:391. Evander's dead son, to whose ghost Aeneas leads eight living victims, against the goddess who issued from her father's head |
| `crassus-triumvir` at 73:18 | 73:18 | the orator of 69:87 and the P. Crassus of 16:9. M. Crassus and Hortensius, called in by a stranger to share a forged will |
| `aemilius-scaurus` / `scaurus` | 74:7 / 60:52 | each other. Tacitus's pair of self-biographers at 74:7 — Rutilius and Scaurus — against the Scaurus whose wife Sextilia died with him. The Essays do not join them |
| `rutilius-rufus` | 74:7 | `rutilius-poet` of 72:43 and the consul Publius Rutilius of 84:21, a third man in a chapter not yet read |
| `messalla` / `messala-corvinus` | 74:30 / 74:99 | each other. The speaker in Tacitus's dialogue against the man who was two years without any trace of memory |
| **`emperor-tacitus`** | 76:1 | **`tacitus`** the historian, named in the same sentence as his kinsman. The historian's alias was taking both. A live mis-binding |
| `bajazet-ii` | 78:1 | the Bajazet of the snow tempest at 48:53 |
| **`amurath-iii`** | 78:1 | **`amurath`** of 48:53, whose alias was taking him. The modern edition writes him Murad III |
| `charles-v-france` | 78:1 | the Emperor Charles V. "Our Charles V", of whom Edward III said there never was a king who so seldom put on his armour and yet gave him so much to do |
| **`marcus-fabius`** | 78:5 | **`fabii`**, the Roman house, whose alias was taking his surname in the legionary's oath. A live mis-binding |
| **`sempronius-gracchus-courier`** | 79:1 | **`sempronius`** the consul of 17:5 and **`tiberius-gracchus`** the tribune, who were splitting the paragraph between them. A third man, and the Essays join him to none of the others, nor to the Tiberius Sempronius of 69:300 |
| **`tiberius-emperor`** as *Tiberius Nero* | 79:1 | **`nero`**, whose alias was taking the second half of the name — the same failure as Augustus inside Philip Augustus at 26:18. A live mis-binding |
| `decimus-brutus` | 79:6 | four other men called Brutus. Besieged in Modena, and sending news by swallows as Caecina did |
| `pallas-evander` | 69:302 | `minerva` under her Greek name at 69:358 and 69:391 |
| `matthias` | 74:120 | St Matthew at 104:73. The older edition's English version of Acts i. 26 misprints him Matthew |
| `turnus`, `atlas`, `latinus`, `nemesis` | 74:38, 74:110, 74:110, 80:7 | nothing — but each is keyed to the version that follows the quotation, never to the Latin |
| `ptolemy` / `ptolemy-astronomer` / `ptolemy-of-the-exercises` | 81:0 / 69:528, 69:531 / 85:4 | each other, and no numeral among them. The astronomer whose bounds of the world were wrong was cast nowhere until chapter 81 was read |
| **`mithridates-pergamus`** | 81:0 | **`mithridates`** the king, whose alias was taking the gentleman of Pergamus to whom Caesar gave away Deiotarus's kingdom. A live mis-binding |
| `caelius-gout` / `caelius-orator` | 82:0, 82:2 / 88:15 | each other. Martial's man who pretended the gout until Fortune gave it to him, and the orator who wanted to be contradicted so that they might be two. The older edition prints the orator Celius |
| **`alexander-of-pherae`** | 84:0 | **`alexander`** the Great. The tyrant who wept in the theatre at Hecuba and Andromache and murdered people out of it |
| `publius-rutilius-consul` | 84:21 | `rutilius-poet` of 72:43 and `rutilius-rufus` of 74:7 — three men of the name in the work, none of them aliased |
| `caius-rabirius` | 88:11 | `rabirius` of the inform style at 74:26 |
| `amurath` as Hunyadi's adversary | 86:13 | `amurath-iii` of 78:1. The modern edition writes them Murad and Murad III |
| `labienus-general` | 89:10 | `labienus-orator` and `labienus-father` of 65:39 — a third man of the name, one of the captains Montaigne says are obscured by names of less desert |
| `philip-son-in-law` | 84:23 | the two kings of Macedon and Alexander's physician. Mauricius's son-in-law, who told him Phocas was pusillanimous |
| `mohammed-ii` | 84:31, 90:4 | the Mohammeds of chapters 93, 95 and 104, which are not yet read. The modern edition writes him Mehmed |
| `caius-oppius` | 90:6, 90:8 | the bare *Oppius* of 49:27, which is a name and not a man |
| `the-curios`, `the-gracchi`, `the-cyclopes`, `the-assassins` | 90:3, 89:10, 88:0, 86:18 | nothing — but each is a named collective, cast on the same footing as the Graces, the Muses and the Sirens |
| **`pompeia-paulina`** | 92:13, 92:15 | **`paulina`**, Saturninus's wife of 69:345, who thought she lay with the god Serapis and whose alias was taking Seneca's wife in her own chapter. A live mis-binding |
| `arria` / `arria-younger` | 92:9, 92:11 / 92:9 | each other, in one sentence: "Arria, the wife of Caecina Paetus… was the mother of another Arria, the wife of Thrasea Paetus". Keyed by occurrence |
| `ptolemy-of-hegesias` | 98:12 | the three other Ptolemys. A fourth, and no numeral among them |
| `amurath-i` | 95:45 | `amurath` of 29:17 and 86:13 and `amurath-iii` of 78:1 — three sultans of the name |
| **`helen`** | 93:16 | **`helena`**, the first Constantine's mother of 33:7, whose alias was taking Helen of Troy |
| **`hadrian`** | 70:28, 78:0, 94:28 | **`cardinal-adrian`** of 33:2 — and the emperor was cast nowhere at all until chapter 94 was read, though he stands in two chapters authored before it. The modern edition writes him Hadrian |
| `hippolytus` | 94:33 | the title of Seneca's play at 2:17, which is what the bare alias was binding until the citation-titles test caught it |
| `metellus-scipio` | 91:12, 91:25, 91:33 | the three other Scipios. The Scipio Caesar defeated in Africa with Juba |
| `fabricius-luscinus` | 95:38 | the bibliographer Fabricius of 25:137, who is apparatus and not cast |
| `caelius-orator`, `caius-rabirius`, `publius-rutilius-consul`, `labienus-general` | 88:15, 88:11, 84:21, 89:10 | their namesakes in chapters 82, 74, 72, 74 and 65 |
| `crassus-agelastus` | 99:45 | the three other men of the name. A fourth Crassus, the one no man ever saw laugh |
| `octavius-of-rome` | 99:181 | `octavius` of 22:54 and `marcus-octavius` of 91:34 — three of the name, and the third is the husband who lent his wife |
| `pontia-posthumia` | 99:181 | `posthumia` of 90:3, the maid whose free talk got her arraigned |
| `galba-emperor` | 99:350 | `sulpicius-galba` of 30:0 and the unbound third Galba of 99:199 |
| `heraclides-ponticus` | 99:133 | the Heraclides of 25:103 and the two in the Apology — one man, but the bare form had to be keyed because 99:133 names his book and not him |
| `phaedo` | 99:46, 99:200 | the title of Plato's dialogue at 60:57. Keyed, not aliased, for that reason |
| `boleslas-v` | 99:118 | `boleslaus` of 95:39 — the second king of the name in the work, and it is his wife Kinge the sentence is about |
| `origen`, `strato`, `messalina` | 99:55, 99:133, 99:219 | nobody. All three were cast nowhere until chapter 99 was read, though each also stands in a chapter authored before it — 69:476, 69:268 and 94:42. The older edition misprints Origen *Origeti* |
| **`agamemnon`** | 100:47 | **the title of Seneca's play**, cited at 74:68 and 74:78. Keyed, not aliased, for that reason — the second time this trap has been found, after Hippolytus |
| **`catherine-de-medici`** | 100:16 | **St. Catherine's Mount at 23:0**, the battery position at the siege of Rouen. She binds by her title, *Queen Catherine*, which the hill does not carry |
| `galba-emperor` | 100:17 | `sulpicius-galba` of 30:0 and the unbound third Galba of 99:199. 100:17 names him *the Emperor Galba*, so the sentence settles it |
| `cytheris` | 100:14 | herself, under the name Gallus gave her in his elegies. One card carries *Cytheris* and *Lycoris*, because the note says in so many words that they are the same woman |
| **`quintus-cicero`** | 102:78, 102:80 | **his brother**, the orator — and until chapter 102 was read the brother had his citation at 99:315 too. The longest-span rule gives *Q. Cicero* the two words and takes them off *Cicero* |
| **`pausanias-writer`** | 102:5 | `pausanias-sparta` of 29:5, `pausanias-plataea` of 36:10 and `pausanias-assassin` of 59:21. A fourth of the name, and the only one of the four who *tells us* anything |
| `hadrian` | 101:13 | `cardinal-adrian` of 33:2. The older edition writes the emperor *Adrian* here and the modern *Hadrian*, so both patterns are keyed to the same paragraph |
| `albus`, `barrus` | 102:4 | nobody — but 102:3 is the same two lines in Horace's Latin, where Albus is *Albi* and Barrus is spelt alike. Barrus is keyed to the version for that reason |

**Three of those were live mis-bindings the sweep caught**, not hypotheticals. The
bare surname *Lepidus* was binding the man who died of a stumble at 19:24 to the
man who forbade his heirs to pay for his hearse; *Guelph* was binding a
political party to the Duke of Bavaria; and the *Paulus* alias on the Roman house
of the Paulli was taking the shorter name of Paulus Aemilius at 40:52, where he
buries both his sons. All three are now position-tabled and all three are pinned
by tests.

**Messire Francesco is the ambassador, not his master.** At 9:8 Montaigne names
Francesco Taverna and Francesco Sforza in the same sentence and then calls
Taverna "Messire Francesco". That phrase is keyed to Taverna.

## How the unauthored chapters are handled

Every table has `None` for its default, so a name a later chapter will give to
somebody else carries no card at all outside the paragraphs keyed here. A name
that is single-referent across the whole work — the authorities and philosophers
Montaigne quotes on every page — is bound by alias and therefore appears in
chapters that have not been authored yet, with a card written to be true
anywhere in the book rather than to gloss the paragraph it was first found in.
A hundred and thirteen entities bind beyond chapter 102 that way, and five of
them — Cicero, Socrates, Seneca, Plato and Horace — account for two-fifths of it. It
is worth being plain about the size of this: 422 of the 4,383 mentions in the
older edition fall in chapters that have not been read — five chapters, two
of them among the longest in the work. Those are bindings of names with
one bearer, and the cards are written to be true anywhere; but they are not
reviewed paragraph by paragraph, and the release owner should read the scope line
as covering the *cast*, not every mention of it.

## Editorial checks — chapters 1–102

**1. Namesakes.** The two hundred and fifty-four entities in the table above — a
hundred and ninety-six rows — each pinned by a test.

**2. Person or not.** This is the check that does the most work in an essayist.
Excluded:

- **Schools of philosophy.** The Stoics, the Pythagoreans, the Epicureans and
  the Academics are bodies of doctrine, not cast. `Epicurus` the man is cast; the
  Epicureans are not. A test pins the whole list.
- **Peoples and places.** The Romans, Lacedaemonians, Athenians, Greeks,
  Macedonians, Mamertines, Spaniards, Florentines, Italians, Corinthians,
  Boeotians, Limousins and Veronese, and Rome, Athens, Reggio, Gaza, Buda, Milan
  and the rest.
- **The works named in the citations.** Every citation in the Essays names a
  book as well as an author: *AEneid*, *Met.*, *Tusc.*, *Epist.*, *Nat. Hist.*,
  *De Arte Poetica*, *Sonetto*, *Epig.*, *Hippolytus*, *Troades*. The author is
  cast, because a citation is a reference to the man; the book is not. A test
  pins the titles.
- **The Latin and Italian of the quotations.** *Ut*, *Et*, *Sed*, *Nec*, *Quod*,
  *Chi*, *Dolus*, *Misero* and forty more words that a capitalisation sweep
  reads as names.

Cast although they are not historical persons: **Iphigenia** and **Niobe** as
mythological figures, **Lesbia** and **Angelica** and **Bradamante** as literary
figures, and **Neptune** as a god, because Augustus deposed his statue and
Montaigne treats that as an act against a person.

**A name is not always a man, and chapters 46 and 49 are about exactly that.**
*Of names* is built on the claim that a name is three or four dashes with a pen,
so the chapter is full of names with nobody behind them: *John, William,
Benedict* at 46:1, taken in no good sense; *Charles, Louis, Francis* at 46:5,
which the reformation quarrelled with; *Methuselahs, Ezekiels, Malachis*; the
invented *Don Grumedan, Quedregan, Agesilan* against *Pierre, Guillot, Michel*;
*Peter or William* at 46:9; *Vaudemont* turned into *Vallemontanus*; *Lenis*, the
surname Suetonius dropped. None of them is cast. At 49:27 *Oppius and Caesar, as
Caesar and Oppius* is a word-order example, and the Caesar table leaves it alone.

Two places in this range need more than a table. At 46:12 Montaigne counts
"three of the name of Socrates" among his proofs, and the Athenian's alias would
otherwise take it: that is the **one suppressed alias binding in the package**,
declared in `SUPPRESS` in the builder and pinned by a test. And at 46:12 *Pompey*
appears twice — the groom who might call himself Pompey the Great, and "the other
Pompey, who had his head cut off in Egypt" — so the paragraph is keyed by
occurrence with the first slot empty. Two paragraphs earlier, at 46:3, "Socrates
thinks it worthy a father's care to give fine names to his children" **is** the
man, and binds.

**The suppression list has grown to twelve, and each entry is a different kind of
collision.** *Socrates* at 46:12 is the name and not the man. *Democritus* at
60:45 is a different man from the philosopher whose alias is single-referent
everywhere else in the work: "Democritus, general of the AEtolians", brought
prisoner to Rome and dead on his own sword. *Cornelius Gallus* at 59:24 is the
Latin elegist of the citation, where that exact alias belongs to the proctor of
19:24 — so the alias is dropped there and the surname alone is keyed to the poet.
And *Cicero* at 67:21 is both men at once: the orator once, and then "the younger
Cicero, who resembled his father in nothing but in name" for the remaining three
occurrences, including the whipping of Cestius. All four are in `SUPPRESS` in the
builder with the reason written out, and each is pinned by a test. Two more have
been added since, both found by the edition-asymmetry census: the sea-goddess
*Thetis* at 69:656, where the referent is the Titaness Tethys, and *St. Hilary* at
65:22, where the referent is the church of Saint-Hilaire in Poitiers. Two more came
with chapters 70–73: *Demosthenes* at 70:28, where the referent is the Athenian
general and not the orator, and *Montaigne* at 73:71, where the author says he has
no name that is enough his own and names three other families that carry it — the
same trap as *Socrates* at 46:12, sprung in the essay on glory. Chapters 74–80 add
three, of two new kinds: *Tacitus* at 76:1, where the historian's alias was taking
his kinsman the emperor as well as himself; *Mercury* at 74:9, where the name is a
planet's; and *Polemon* at 74:152 with *Sagoin* at 75:14, which are the same rule
as Danae and Orlando — the name inside the quoted verse is not bound — applied by
suppression rather than by keying, because each of those two has one bearer in the
whole work and should stay alias-bound everywhere else. Chapter 81 adds the
twelfth: *Mithridates*, whose alias — the king's — was taking the gentleman of
Pergamus of the same name to whom Caesar gave away Deiotarus's kingdom. Nothing
else in ninety chapters has needed it.

**The Blessed Virgin at 46:4 is left unbound.** The name in that paragraph is the
wench's: "asking her name, and being answered that it was Mary". The reverence is
to the Virgin, but the word *Mary* denotes the girl, and the Virgin herself is
named only by title — *the Blessed Virgin*, *our Lady*. Binding either would be
wrong in a different way, so neither is bound.

**The Christian God, Christ, Satan, Nature and Fortune are not cast, and this is a
decision, not an omission.** The named classical gods Montaigne treats as agents
are cast — Jove, Apollo, Venus, Minerva, Saturn, Neptune, Mercury, Mars, Bacchus,
Diana, Janus, Laverna, Flora, the Graces. *God* is not: it occurs thirty-four
times in chapters 31–40 alone and runs through the whole work as the substrate of
the argument rather than as a figure in it. *Christ* is named once in the reading
so far, inside St Paul's words at 60:57, and *Satan* once, at 56:25. *Fortune* is
the harder call and the release owner should look at it: chapter 33 is *That
fortune is oftentimes observed to act by the rule of reason* and personifies her
throughout — "Does she not seem to be an artist here?" — so there is a case for a
card. Sixty chapters have been authored on the rule that only named classical
deities are cast, and changing it is a whole-work revision, not a patch.

**3. The author of a citation is the reference.** Cicero, Seneca, Plutarch,
Livy, Lucan, Lucretius, Ovid, Catullus, Martial, Horace, Ennius, Pliny, Polybius,
Herodotus, Xenophon, Petrarca, Ariosto and Guicciardini are all cast from their
citations, with cards that say who the man was rather than what the quotation
says.

**4. Ambiguous references.** Left unbound: **the Constable** at 6:5 (Montmorency,
never named); the **two soldiers who answered Nero to his beard** at 3:5, both
nameless; the **King of England** at 9:9 and the **King of Denmark** at 9:8,
neither named; **Orodes**, killed in the Virgil quotation at 6:9–6:10, and the
unnamed subject who kills him, because the verse is quoted for its argument and
not for its people; the **ancient painter** of the sacrifice of Iphigenia; the
bare **Francesco** of 9:8 apart from the one "Messire Francesco" the table keys;
the **Dauphin** at 14:1, the **Seneschal of Agenois** at 12:3 and the **Bishop of
Soissons** at 20:6, all title and no name; the **duke of Brittany** pressed to
death in the crowd at 19:24; the bare **Mary** at 20:6, because Montaigne is
reporting what the town used to call the man now called Germain and the name
belongs to somebody else everywhere else in the book.

Chapter 69 adds four of its own, and they are the hardest kind, because in a
doxography an unqualified name is the norm rather than the exception:

- **Zeno at 69:235** stands in a list of the sceptics' forerunners — "Homer, the
  seven sages, Archilochus and Euripides, with Zeno, Democritus and Xenophanes
  added" — which does not settle Elea from Citium. Elea is the likelier reading
  and likelier is not enough.
- **Dionysius at 69:565** is "the tyrant", which fits either Syracusan.
- **"The dog of one Pyrrhus" at 69:96** has a master who is a private person, not
  the King of Epirus, and the dog has no name of its own. Hyrcanus, King
  Lysimachus's dog in the same paragraph, does, and is cast.
- **Apollodorus at 69:388** is a third man of the name, unqualified, beside the
  Apollodorus of 25:3 and the dreamer of 62:12.

Two more names in chapter 69 look like people and are not: **the order of St
Michael** at 69:545 (and at 64:1) and **"that of St Andrew"** at 69:533, which is
a cross. An institution or an object named after a saint is not the saint, on the
same rule that leaves the town of St Paul and the *Life of Caesar* uncast. Both
are pinned by a test.

Chapters 70–73 add four more, and one of them is the rule about names again:

- **Diogenes at 73:3**, paired with Chrysippus as the earliest and firmest
  advocates of the contempt of glory. Cicero's pairing is with Diogenes of Babylon,
  Chrysippus's successor at the Stoa; the Cynic is the more famous contemner of
  glory. The sentence does not settle it, so nothing is bound.
- **"That great Cato" at 72:17**, who nauseated his wife while she was his and
  longed for her in another's possession. The story is Cato of Utica's, but the
  paragraph gives no qualifier and the Essays have two Catos.
- **A third Demetrius at 73:51**, who made no more account of the voice of the
  people that came from above than of that which came from below. Neither the
  grammarian of 25:70 nor Poliorcetes.
- **The cruel Roman Emperor at 70:21**, who would say of his prisoners that he
  would make them feel death. Title and no name, like the Constable at 6:5.

And two names in chapter 72 and 73 are not people at all. **Our Lady of Loreto** at
72:17, set against St James, is the Virgin under a shrine's title, and the Virgin is
not cast here for the same reason as at 46:4. **Montaigne at 73:71** is the surname
of two families at Paris and Montpellier, another in Brittany and one in Xaintonge
called De La Montaigne — the author's own point being that he has no name that is
enough his own — and **Eyquem**, his ancestors' surname in the same sentence, is a
name and not a man either.

Chapters 74–80 add three more, and one of them is a name that is a planet:

- **Cato and Brutus at 75:0**, in the list of men who left commentaries of their
  own actions — "Augustus, Cato, Sylla, Brutus, and others". Neither carries a
  qualifier, and the Essays have two of the one and five of the other.
- **"Our King Philip" and "his son John" at 80:4**, in the sentence about
  discharging soldiers on a foreign expedition. Cotton's text does not identify
  either, and the two names do not fit any one pair of French kings.
- **The epicycle of Mercury at 74:9** is the planet, not the god — the only place
  in the first eighty chapters where one of the gods' names is an astronomical
  one, and the sixth place where an alias had to be suppressed.

Chapters 81–90 add six, and three of them come out of one paragraph of Plutarch's
pairings:

- **Henry, king of England, at 84:14**, whom "our Duke of Orleans" challenged a
  hundred against a hundred. The Essays give no numeral and five Henrys stand in
  the work. The Duke has a card, since the Essays name him by his title as they
  name the Duc de Guise and the Duke of Alva; his challenger does not.
- **Cleomenes at 88:12**, and **Agis and Cleomenes at 89:10**, all unqualified:
  three Cleomenes and three Agises stand in the work and the sentences settle
  none of them.
- **Cato at 89:10**, in the same list of pairings — "Demosthenes and Cicero, Cato
  and Aristides, Sylla and Lysander" — where the others are identifiable and he
  is not.
- **Scipio at 90:15**, set against Diogenes for a life of a thousand fashions
  against one of a single fashion. Four Scipios, no qualifier.
- **The Lives of Flamininus and of Pyrrhus at 89:3** are Plutarch's titles, and
  titles are not cast — nor is **Cicero's own *Cato***, the book at the head of
  90:6, where the same six letters mean the man six times afterwards.

Chapters 91–98 add two, and a lesson about titles:

- **"The family of Lepidus at Rome" at 94:19** is a house, named for the three of
  them born with the same membrane over one eye. The man is not in the sentence.
- **"Not an angel or Cato" at 96:25** gives no qualifier, and the Essays have two.
- And **Hippolytus at 2:17 is the title of Seneca's play**, which the bare alias
  was binding to AEsculapius's patient until `test_the_works_named_in_the_citations_are_not_cast`
  caught it — the first time that test has found anything, eleven passes in.

Chapter 99 adds four, and one of them is the chapter's own hardest line:

- **Lepidus at 99:157** — "the one coxcomb who died for grief" — stands in a list
  with Caesar, Pompey, Antony and Cato, all four of whom are bound. He is the
  only one without a numeral, and four Lepiduses stand in the work.
- **Antigonus at 99:85** is unqualified and the Essays hold three.
- **Galba at 99:199**, who entertained Maecenas and saw his wife and his guest
  begin to cast glances at one another, is very probably the Sulpicius Galba of
  30:0; but the sentence carries no numeral, three Galbas stand in the work, and
  Montaigne's own source names him no further. Left unbound. The emperor at
  99:350 is settled by his own sentence and is bound.
- **The Pseudo-Gallus of 99:34, 99:95 and 99:257** is an editorial doubt about
  the authorship of an elegy, not a man — the same judgment already made at
  19:70. The Gallus of 99:232, set against Horace for speaking simply because he
  conceives simply, is the elegist and is bound.

Chapters 101 and 102 add three:

- **The tyrant Dionysius at 101:12**, whose flatterers ran against one another
  and overturned whatever was under foot to shew they were as purblind as he,
  and **the tragedy of Dionysius at 102:60**, which Melanthius could not see for
  the language clouding it. Neither sentence carries a numeral. 101:13 is bound,
  because that sentence names Philoxenus in the quarries and Plato sold at
  Aegina, and those are the elder's acts.
- **The old philosopher of 102:27** who never wanted an occasion for his tears
  whilst he considered himself is Heraclitus, and the Essays name him elsewhere;
  here they name him only by description.

Chapter 100 adds four, and one of them is a class the modern edition settles by
its own typography:

- **The tyrant Dionysius at 100:18**, who said that liberality is the one virtue
  that suits tyranny well. The Essays hold two tyrants of Syracuse of the name
  and *the tyrant* narrows nothing.
- **"Plutarch's Life of Antony" at 100:14** is a title, though Marc Antony
  himself is bound one paragraph earlier, where he is the first man at Rome to
  have himself drawn in a coach by lions.
- **Hermogenes at 100:41** stands inside Martial's Latin — and 100:41 is the one
  quotation in the chapter that has no English version after it, so there is no
  paragraph for the card to move to. Left unbound, which is what the
  quoted-verse rule gives when the gloss is missing.
- **The daemons and the sibyls of 100:59** are classes and not names. The older
  edition capitalises both; the modern edition lowercases both, and that is the
  evidence. The Sibyls of 69:582 are the same generic simile — "he may make him,
  like the Sibyls, say what he will" — and are equally uncast, which is a
  different judgment from the Muses and the Sirens, who are a fixed collective
  treated as characters.

Three traps in the early range are deliberately left alone and pinned by tests:

- **St Paul at 17:2 is a town.** "When St. Paul was taken from us by the Comte de
  Bures" is Saint-Paul in the Low Countries, not the apostle.
- **John and Peter at 20:23 are nobody.** Montaigne says it does not matter
  whether a thing happened at Rome or Paris, to John or Peter.
- **Names inside the Latin and Greek verse are not bound**; the English gloss
  that follows the quotation carries the card. *Tantalo* at 19:9 is unbound and
  *Tantalus* at 19:10 is bound; *Jovis* at 19:72 is unbound and *Jove* at 19:73
  is bound; and the six accusatives of 22:48 — *Coruncanium*, *Scipionem*,
  *Scaevolam*, *Zenonem*, *Cleanthem*, *Chrysippum* — are unbound while all six
  nominatives in the gloss at 22:49 are bound. This keeps the package out of the
  business of Latin inflection.
- **The editorial apparatus is not Montaigne.** Paragraph 18:0 is an editor's
  note about Charron and Nodier; 24:51 credits a translation of Seneca to
  Rousseau; 24:58 and 24:59 are a note about Cotton's version of the Cyrus story.
  All four are printed as reading paragraphs in both editions and none of the
  four people is cast. A test pins it, so that a later pass does not "complete"
  them.
- **Dionysius at 24:32 is left unbound.** "Dionysius laughed at the grammarians"
  carries no qualifier, and the Essays have more than one Dionysius; the rule of
  this lane is to leave such an occurrence alone rather than pick the likelier
  man. A test pins the gap so it is not quietly filled in.
- **The Latin inflections of chapter 36 are not bound.** The chapter on Cato of
  Utica quotes five poets on him. Martial's line has the nominative *Cato* and
  that binds; Manilius, Lucan, Horace and Virgil give *Catonem*, *Catoni*,
  *Catonis* and *Catonem*, and those do not. Each of the five bracketed English
  versions that follow carries the card instead. The four keys that had been
  written against the Latin paragraphs matched nothing at all, which is what
  prompted the new dead-key guard below.
- **Ariadne and Theseus at 40:20 are a book title.** The citation reads "Ovid,
  Ep. Ariadne to Theseus" — the name of the epistle, not two people in the essay.
- **Florio is apparatus.** Paragraphs 36:0 and 38:51 are the editor's notes
  setting Cotton beside Florio's 1613 version, printed as reading text in both
  editions. Recorded as a source defect; the 1613 translator carries no card, on
  the same rule as Charron, Nodier, Cotton, Rousseau, Fabricius and Coste.
- **Sismondi is apparatus too.** 45:0 is a dated editorial headnote to the battle
  of Dreux with a page reference to Sismondi's *Histoire des Français*, printed as
  the chapter's first reading paragraph in both editions. The three commanders it
  names keep their cards — the Duc de Guise, the Constable de Montmorenci and the
  Prince de Condé, who appears nowhere else in the chapter — and the modern
  historian carries none. The same at 48:4, a bracketed note quoting Commines on
  the battle of Fornova: Commines and the king's horse are cast, the note is not.
- **Four names in chapters 41–50 are deliberately left unbound**, because the text
  does not resolve them and the rule of this lane is to leave such an occurrence
  alone rather than pick the likelier man:
  - **Scipio at 41:10.** "The greatest of Scipio's acts were in part due to
    Laelius" — the Essays do not say which Scipio, and the package already
    carries four.
  - **Antigonus at 42:33.** Hermodorus's poem called him the son of the sun.
    Two Antigonuses are already cast and nothing here tells them apart.
  - **Brutus at 47:14**, in the list of captains who liked rich armour. At 50:8
    the text does resolve it — "when Brutus courted him into the conspiracy
    against Caesar" — and there it binds.
  - **The Prince of Wales at 41:7**, who is the Black Prince of 1:1 and is named
    here by title only, in the same sentence as his father. Titles without a name
    carry no card anywhere in this package; the Constable at 6:5 is the precedent.
- **Five more in chapters 51–60**, on the same rule:
  - **Aristo at 51:0**, who "wisely defined rhetoric to be a science to persuade
    the people". The book has three men of the name and this one carries no
    qualifier.
  - **Crassus and Metellus at 51:1**, in the list of six Romans who took their
    chiefest spring from eloquence. The company — Pompey, Caesar, Lucullus — makes
    the triumvir the likely Crassus, but the text does not say so, and a likely
    reading is still a guess.
  - **Antigonus at 58:16, 60:3 and 60:45**, three separate anecdotes, none of them
    distinguishing him from the two Antigonuses already cast or from each other.
  - **"He whom they called Marcus Aurelius" at 59:32.** Montaigne's father had a
    Spanish book always in his mouth that went by the emperor's name; it is
    Guevara's, and Guevara himself is cast eleven chapters earlier from his
    Letters. Neither the emperor nor Guevara is what the sentence points at, so
    nothing is bound — and the bishop Aurelius, who was taking it, has been
    keyed off.
- **Three more in chapters 61–68:**
  - **Dionysius "the tyrant" at 68:28**, who presented Epicurus with three
    beautiful women. The epithet fits either Syracusan.
  - **Pliny at 63:38 and 67:20**, neither qualified, and the book has two.
  - **Scipio at 63:43**, named beside Epaminondas as a life to recollect against
    one's own presumption. A third unqualified Scipio, after 41:10 and 52:2.

**5. Spot-read and sweep.** Two hundred and thirty-two mentions drawn at random,
twelve to fourteen per edition per pass, read back against their paragraphs: all
correct. The chapters 31–40 pass read twenty-eight and found no mis-binding, but
it did find the card defect described in check 7; the chapters 41–50 and 51–60
passes read twenty-eight each, all correct, and so did the chapters 61–68 pass;
chapter 69 had a pass to itself and read thirty-two, all correct.

The **unbound-tabled-names audit** — every pattern in `SPLIT` enumerated against
the text, which is the only audit that can see a table with no key, since such a
table produces no mention — came back empty over chapters 1–10 and found two real
gaps over chapters 11–20: *Alexander* at 18:3 and 19:21, and *Crassus* in the
second half of 16:10, where the chapter comes back to him after naming him once.
Both are now keyed, and over chapters 21–24 it found three more: *Cyrus* at 24:57
and 24:59, *Pliny* at 22:2, and *Caesar* at 23:1 — which turned out to be Augustus
calling himself Caesar, not Julius. What the audit still reports over chapters
1–24 is eight deliberate cases: *John* at 20:22 and 24:49, *Francis* at 20:7,
*Charles* at 24:63, *Ludovico* at 18:3, *Lepidus* at 3:15 and 19:24, *Francesco*
at 9:8 and *Caesar* at 4:10, every one of them already covered by a longer alias;
plus *John* at 20:23, where John and Peter are nobody, and *Dionysius* at 24:32,
which is deliberately unbound. Over chapter 25 it found four more real gaps —
*Alexander* at 25:81 and 25:91, *du Bellay* at 25:123, and *Caesar* at 25:47 —
which brings the audit's running total to eleven gaps that nothing else would have
caught — the last two being *Pliny* and *Caesar* in the long paragraph 26:18,
which names eight people in a row.

Over chapters 31–40 it found thirteen more, which is the largest haul of any pass:
*Cato* in the five bracketed verse translations of chapter 36 and again at 40:55,
where "Cato the consul" who disarmed the Spanish cities is the Censor; *Caesar* at
36:18, 40:45, 40:55 and 40:62; *Alexander* at 40:55; *Pompey* at 40:13 in the
modern edition alone, which writes the name where Cotton writes *Pompeius*;
*Pliny* at 38:50 and 38:60; and *Cyrus* and *Philip* at 39:1. The remaining
unkeyed hits over chapters 1–40 are the thirteen deliberate cases, every one of
them either covered by a longer alias or pinned as an intentional gap.

Over chapters 41–50 it found two more: the Pyrrhus of 42:67, preparing his
expedition into Italy, and the Pyrrhus of 47:16, fighting the Consul Levinus in
Megacles's armour — both of them the King of Epirus already cast at 5:0, and
neither keyed until the audit said so. Over chapters 51–60 it found four more: *Zeno* the founder of the Stoa at 52:2,
*Diogenes* meeting the dropsical Speusippus at 60:6, and *Pliny* in the two
editorial notes at 60:0 and 60:44 — notes being apparatus, but the Pliny they name
being the real one, on the same rule that gives Montaigne his card inside the
editor's note at 28:2. What the audit reports over chapters 1–60
is twenty-eight deliberate cases: the four unresolved names above, the names used
as names at 46:1, 46:5, 49:27 and 49:38, the town of Guise at 15:5, the duchy of
Savoy at 25:52, the bibliographer Fabricius at 25:137, and the rest already
covered by a longer alias.

**A new structural guard came out of this pass: no table key may match nothing.**
Four keys did — *Cato* at 36:20, 36:23, 36:26 and 36:29, written against the Latin
paragraphs instead of the English versions, and *Alexander*, *Caesar* and *Cyrus*
one paragraph off their names. A key that matches nothing is invisible to every
other check: the name it was meant to pin simply stays unbound, and the tests pass.
`test_every_table_key_actually_matches_something` now enumerates every key against
both editions. It earned its place immediately: the chapters 41–50 pass wrote
`Alexander` against 50:3, where he is not named, and the guard caught it before
the pass closed.

The **adjacency sweep** over every mention whose matched text abuts a capitalised
word produces forty-eight hits in chapters 1–10, thirty in chapters 11–20 and
twenty-two in chapters 21–24, nine in chapter 25 and fifteen in chapters 26–30.
It produces forty-five hits in chapters 31–40 and forty-nine in chapters 41–50,
all of them a bound name preceded by a title or a conjunction that is not part of
it — *King Edward*, *King Seleucus*, *King Hiero*, *King Alfonso*, *the Emperor
Otho*, *the Consul Levinus*, *the Lacedaemonian Clearchus*, *Captain Bayard*,
*the Bishop of Beauvais*, *Father AEneas*, *our French Plutarch* — and, in
chapters 51–60, thirty-three hits of which **one was a real mis-binding**: the
bishop *Aurelius* of 26:18 was taking the last word of "he whom they called Marcus
Aurelius" at 59:32. That is the second mis-binding this sweep has found that no
other check could see, the first being *Philip Augustus* — and fifteen more hits
in chapters 61–68, all sound — *King Clovis*, *King
Massinissa*, *Captain Rense*, *Captain Martin du Bellay*, *King St. Louis*, *King
Emmanuel*, *the Duke of Valentinois*, *the Sieur de Licques*.
It found one mis-binding, and a bad one: *King Philip Augustus* at 26:18 was
carrying the emperor Augustus's card on the second half of his name, because
*Augustus* is alias-bound and *Philip* was only table-bound. The full name is now
an alias of its own, so the longer span wins. Everything else is sound: *the Emperor Conrad III*, *Pope Leo X*, *Captain Bayard*, *the now
King Philip*, *Count Guido di Rangone*, *Signor Fabricio Colonna*, *the Counts
Horn and Egmont*, *Cardinal du Bellay*, *Queen Margaret of Navarre*, *Captain
Martin du Bellay*, *Poor Judge Bebius*, *King Dagobert*, *The Duke of Athens*, *Old Aristo of
Chios*, *our King Charles VIII*.

Over chapter 69 alone the audit found ten names the chapter introduces as
namesakes, in nineteen paragraphs, and nothing else would have caught any of
them: *Zeno* in eight paragraphs, *Perseus* at 69:268,
*Antony* at 69:89, *Crassus* at 69:87 and 69:126, *Aristo* at 69:268, 69:345 and
69:558, *Crito* at 69:208, *Antigonus* at 69:126, *Timon* at 69:378, *Diodorus*
at 69:532 and *Scaevola* at 69:370. What it still reports there is the five
deliberate cases above plus the runs of alias-bound Cicero and Democritus, and
four subspans of longer names — *Dionysius* inside *Dionysius Heracleotes*,
*Diogenes* inside *Diogenes Apolloniates*, *Paulus* inside *Paulus Æmilius* and
*Tiberius* inside *Tiberius Sempronius*.

**The edition-asymmetry census is the audit that closed chapter 69.** Listing
every binding present in one edition and absent from the other reduced 660
paragraphs to twenty-four cases, and twenty-two of them were real: the misprints
tabled under **What is hard about this book**, plus the *Ariston* / *Aristo*
inversion and the two saints written out in full. The two that remain are not
defects to fix:

- **`pherecydes` at 69:469, older edition only.** The older edition's sentence
  runs across the paragraph break, and *Syrius* — his epithet, of Syros — is left
  standing alone at the head of 469. The modern edition writes "of Syros" and
  keeps the man in 468. This was nearly cast as a separate person called Syrius.
- **`jove` at 69:508, modern edition only.** The two editions translate the same
  Latin verse differently: the modern names "Father Jupiter... with his
  fertilising lamp", the older writes "Men's minds are influenc'd by th' external
  air". There is nothing in the older edition to bind.

The census is cheap, it is mechanical, and it should be run on every book in this
library. It is the only check that found the Tethys/Thetis merge, which four
other audits, a spot-read and an adjacency sweep all passed over.

The **adjacency sweep** over chapter 69 produced twenty-eight hits, all sound —
*dat Rome with the Emperor Vespasian*, *King Lysimachus's dog*, *either some other
or Justus Lipsius* — and the chapter's **spot-read** of thirty-two mentions found
no mis-binding.

Over chapters 70–73 the unkeyed-table audit found eleven more real gaps — *Caesar*
at 70:9, 70:14, 70:17, 70:28, 73:31 and 73:80, *Pliny* at 70:20, 70:28 and 71:0,
*Pompey* at 72:14, *Alexander* at 73:31, *Crassus* at 73:18, *Cato* at 70:40 and
*Tiberius* at 70:28 — and it is the audit that produced the Flora mis-binding, by
putting the eye on the paragraph where the courtesan stands. Its remaining hits
over the range are the four deliberate gaps above, the names inside the quoted
verse, and subspans of longer aliases.

The **adjacency sweep** over chapters 70–73 produced twelve hits, eleven of them
sound — *Whilst Plautius Silvanus was upon his trial*, *If Caesar dared to say
it*, *the name of the God Oromazis* — and **one a real mis-binding**: *De La
Montaigne* at 73:71, the surname of a family in Xaintonge, carrying the author's
own card. That is the third mis-binding this sweep has found that no other check
could see. The range's **spot-read** of thirty-two mentions found none.

Over chapters 74–80 the unkeyed-table audit found twenty-eight more gaps, which is
the second largest haul of any pass: *Caesar* in seven paragraphs, *Alexander* in
four, *Tiberius* in two, and one each of *Zeno*, *Scipio*, *Cato*, *Marius*,
*Metellus*, *Pliny*, *Diodorus*, *Dionysius*, *Hiero*, *Charles*, *Alva*, *Guise*,
*du Bellay* and *Edward*. The audit also put the eye on 72:14, which is how the
Flora mis-binding was found, and on 74:7, where the bare *Scaurus* turned out to
be a second man.

Over chapters 81–90 the unkeyed-table audit found thirty-three more gaps, and this
range is where the *by-occurrence* keys earn their place: 81:0 names Caesar four
times and the first is Suetonius's title, and 90:6 names Cato seven times and the
first is Cicero's book. A bare-string key would have bound both titles to the man.
The audit also found *Nicomedes* at 90:3 and *Mithridates* at 81:0, which is how
the king's alias was caught on the gentleman of Pergamus.

Over chapters 91–98 the unkeyed-table audit found seventy-one gaps, which is the
largest haul of any pass and the reason for it is chapter 91: the essay on
Caesar's conduct of war names him in nineteen paragraphs and the *Caesar* table
had a key for none of them.

Over chapter 99 alone the audit ran down to five unkeyed hits, and every one of
them is deliberate: Antigonus at 99:85, Lepidus at 99:157, Galba at 99:199, the
Pseudo-Gallus of 99:34, 99:95 and 99:257, and Achaemenes at 99:144, which is
inside Horace's Latin and carries its card at 99:145 instead. That is the first
pass in which the audit found nothing that needed fixing.

Over chapters 101 and 102 it reported seventeen, and eleven were real: Regulus at
101:2 and 101:3, Tiberius at 101:11 and 102:84, Adrian and Hadrian at 101:13,
Alexander at 101:9 and 101:12, Cato at 102:5, Pausanias at 102:5, Marius and
Pompey at 102:83, Cyrus at 102:66, and Dionysius at 101:13. Two of those matter
beyond their own paragraph: the Cato of 102:5 is the censor and not the younger,
and the Pausanias of 102:5 is a fourth man of the name.

Over chapter 100 it reported ten, and six of them were real: Alexander at 100:61,
Philip at 100:31, Cyrus at 100:27, Caesar at 100:60, Galba at 100:17 and Gallus at
100:14, none of which any other check could have seen, because a table with no key
produces no mention. The remaining four are the deliberate Dionysius, the Antony
that is a title, and Cicero and Demosthenes, which are alias-bound and only
appear in the audit because their tables exist for a suppression elsewhere.

**The census of unbound capitalised names should be run over a chapter even after
it is declared authored.** Run again over chapter 69 after the fact, it found a
whole class the chapter's own pass had gone past: the named gods of the theology
paragraphs. **Vulcan** stands in four paragraphs of chapter 69 and was cast in
none; so were **Juno**, **Vesta**, **Faunus**, **Pallas** — who is Minerva at
69:358 and 69:391 and a dead man at 69:302 — **Cynthia**, who is Diana, and
**Numa** and **Zoroaster**, both of whom the Apology names before chapter 73 does.
Nine entities and twenty-one mentions, in a chapter that had passed six audits, a
spot-read, an adjacency sweep and a hundred and fifty-seven tests. Chapter 74 then
turned up two more of the same class: **Xenocrates**, named at 69:268 and 69:401
and cast nowhere — the older edition prints him *Zenocrates*, on the same
Z-for-X misprint as *Zenophanes* — and, on the strength of **the Graces** being
cast at 25:90 and 74:23, **the Muses** and **the Sirens**, which eight passes had
left out. A collective of named gods is cast in this package; the Muses stand in
seven read chapters and had no card.

The **adjacency sweep** over chapters 74–80 produced forty-two hits, all sound —
*the Emperor Constantius*, *the late Chancellor Olivier*, *King Francis II*,
*Father Jove*, *Mars Gradivus*, *King Hiero*, *the Emperor Vespasian* — and the
range's **spot-read** of thirty-two mentions found **one mis-binding**: the god
Mercury on "the epicycle of Mercury" at 74:9. That is the first mis-binding a
spot-read has caught in eleven passes, and it is the kind only reading the sentence
can catch: the name is right, the referent is a planet.

The **adjacency sweep** over chapters 81–90 produced forty-six hits, all sound —
*King Deiotarus*, *King Ptolemy*, *the Emperor Mauricius*, *the Emperor Mohammed*,
*our late poor King Charles IX*, *the Praetor Lucius Piso*, *Caius Memmius* — and
the range's **spot-read** of thirty-two mentions found no mis-binding.

The **adjacency sweep** over chapters 101 and 102 produced fourteen hits, all
sound, and the range's **spot-read** of twenty-eight mentions found no
mis-binding. The catch in this pass came from neither: it came from **listing
every occurrence of a new name across the whole work before giving it an alias**,
which is now the first thing done with a new name and which found a live
mis-binding in a chapter already signed off. *Q. Cicero* stands at 99:315 as well
as at 102:78 and 102:80, and the orator's bare alias had been taking all three.
No census could have seen it: both editions print *Q. Cicero* and both were wrong
together. The same list also turned up **Philoxenus at 69:613**, breaking the
earthen vessels in a chapter corrected twice already, and cast nowhere.

The **adjacency sweep** over chapter 100 produced twelve hits, all sound and all
of one kind — a title standing in front of the name: *the Emperor Firmus*, *Pope
Gregory XIII*, *our Queen Catherine*, *the Emperor Galba*, *the Emperor Probus*.
The chapter's **spot-read** of twenty-four mentions found no mis-binding, and the
**edition-asymmetry census** over chapter 100 came back empty — the first chapter
in the package where the two editions bind identically in every paragraph. That
is not luck: the one asymmetry the census did find, `mark-antony` at 100:13, was
closed inside the pass by carrying the older edition's *Marc Antony* as an alias
beside the modern edition's *Mark Antony*.

The **adjacency sweep** over chapter 99 produced sixteen hits, all sound, and the
chapter's **spot-read** of thirty-two mentions found no mis-binding. What chapter
99 did produce is a third confirmation that the **edition-asymmetry census** is
the cheapest audit in the package: diffing the two editions' `(id, chapter,
paragraph)` sets turned up seven asymmetries, every one of them in the recorded
abbreviation and editor's-note class — *Herodotus* at 99:37, *Montaigne* at
99:123, *Priapus* at 99:153, *Sidonius Apollinaris* at 99:39, *Tasso* at 99:72,
*Virgil* at 99:81 and 99:126 — and, run backwards over chapters already declared
authored, three more entities that no earlier pass had cast at all: **Origen** at
69:476, **Strato** at 69:268, 69:335, 69:412 and 94:41, and **Messalina** at
94:42. Three chapters, all of them signed off, all of them wrong until chapter 99
was read.

The **adjacency sweep** over chapters 91–98 produced forty-six hits, of which
**three were the quoted-verse rule again** — Arria in Martial's Latin at 92:10,
Venus in Virgil's at 93:22 and Dido in Virgil's at 98:17, each with the English
version in the next paragraph — and the rest sound. The range's **spot-read** of
thirty-two mentions found **one mis-binding**: the Paulina of the Serapis story on
Seneca's wife at 92:13. That is the second catch for the spot-read in twelve
passes, and again it is the kind only reading the sentence finds.

**6. Both editions independently.** No entity is missing from either edition. The
mention counts differ by about three percent (4,383 against 4,528),
partly because the modern edition resolves pronouns to names — it says *Dionysius*
and *Scanderbeg* and *Betis* and *Ferdinand* where Cotton says *he* — and partly
because it expands the citation abbreviations, so *Hor.* becomes *Horace* and
*Quint. Curt.* becomes *Quintus Curtius*.

**7. Every card stands on its own.** The chapters 31–40 spot-read caught a defect
that had been accumulating since the first pass and that no binding check could
see: twenty-one cards were bare cross-references. *Sitalces* read "His son.";
*Patroclus*, *Themistocles*, *Aristogiton* and *St Protasius* all read "The other
of that pair."; *Aristides* and *Macareus* read "The third of them."; *Cossii*
read "Another." A reader who taps a name in the margin gets the card and nothing
else, so a card that only makes sense beside the card it was written next to is
not a card. All twenty-one were rewritten to name their anchor, and a further
thirteen that leaned on a dangling demonstrative — *Fougueselles*, *Castalio*,
*Egnatius*, *Pontanus*, *Porsenna*, *Leah*, *Charles of Burgundy* and the rest —
were rewritten as well. `test_no_card_is_a_bare_cross_reference` now fails any
card that names nobody and says nothing about what kind of person this is.

Rewriting from memory rather than from the paragraph produced three wrong cards in
the process — *Sempronius*, *Angelica* and *Castalio* — each caught by re-reading
the passage before the pass closed. The rewrite of a card is a source-review
operation like any other, not an editorial tidy.

Two attributions were corrected at the same time: the precept about keeping Cato,
Phocion and Aristides before the imagination (38:66) had been credited to Seneca,
but Montaigne compounds it out of two philosophers of different sects, one writing
to Idomeneus and the other to Lucilius, and does not say which sentence is whose.

The chapters 41–50 pass found one card of the same kind (*Anacharsis*, whose body
named nobody at all) and one claim made from a distance rather than from the page:
the chapters 1–30 pass had listed 44:1 among the Gorgon-slayer's paragraphs, when
it is "King Perseus of Macedon, being prisoner at Rome, was killed by being kept
from sleep" — the Macedonian king, and now bound to him. A claim about a chapter
nobody has read is exactly the class of error this lane exists to avoid, and it
survived two passes because the test that pinned it asserted the right thing for
the wrong reason: `perseus-macedon` was indeed not bound at 44:1, because the
alias did not match, not because the man was somebody else.

## Source defects — recorded, not repaired

| Defect | Effect |
|---|---|
| The older translation prints **Marcus. Emilius Lepidus** at 3:15, with a stray full stop inside the name and the ligature dropped from Aemilius. | Carried as an alias exactly as printed, so the mention still binds. Not repaired: editing it would move every UTF-16 offset after it. |
| Both editions print the **æ ligature inconsistently**: *AEneid* and *AEmilius* in the older one against *Aeneid* and *Aemilius* in the modern, and *AEneid* against *Aeneid* in the same citation series. | Carried as aliases where a person is involved. The book titles are not cast either way. |
| The modern edition supplies **the Black Prince** at 1:1, a gloss that is not in Cotton. | Carried as an alias on the same card, and pinned by a test. |
| The older translation abbreviates some citations to **Hor.** and spells others **Horace**; the modern edition does both as well, in different places. | Both forms are aliases on one card. |
| The note at 10:1 attributes the opening verse to **La Brebis** and gives nothing else. | Cast as a reference whose card says the note gives no more than the name. |
| The dedication of chapter 25 prints its dedicatee in capitals: **TO MADAME DIANE DE FOIX**. | Carried as an alias in capitals as well as in ordinary case. She was omitted from both editions until this was found. |
| The citation at 25:137 attributes an epitaph on Lucan to **Fabricius**, a bibliographer. | Apparatus, not Montaigne. Not cast, like Charron, Nodier, Cotton and Rousseau. |
| **Chapter 28 has no text of Montaigne's in it at all.** Its three paragraphs are a dedication in capitals to Madame de Grammont, an annotator's summary signed **Coste**, and an editor's note explaining that the twenty-nine sonnets of La Boétie the chapter is named for are not printed. | Not repaired. The dedicatee is cast; Coste is apparatus and is not. The first occurrence of the name *Montaigne* in either edition is in that editor's note, which is worth knowing before anyone concludes he names himself in chapter 28. |
| **Paragraph 18:0 is an editor's note, not Montaigne**: both editions print "[Charron has borrowed with unusual liberality from this and the succeeding chapter. See Nodier, Questions, p. 206.]" as the first reading paragraph of the chapter. | Not repaired, and nothing in it is cast: Charron and Nodier are real people but they are not in the Essays. A test asserts that the paragraph binds nothing, so that a later pass does not "complete" it by adding them. |
| The older edition prints **Aeneius Fulvius** at 15:4 where the modern prints **Cnaeus Fulvius** — a correction rather than a spelling variant. | Both forms are aliases on one card. |
| The two editions differ in the **kind of apostrophe** inside *Lorenzo de’ Medici* (curly) and *Lorenzo de' Medici* (straight). | Both forms are aliases. The entity was omitted from the modern edition until this was found, which is how it was caught. |
| The same apostrophe split runs through **d’Estrees** and **d’Ascot** at 33:3. | Both forms are aliases. Both men were omitted from the modern edition until this was found. |
| **Paragraphs 36:0 and 38:51 are editor's notes**, not Montaigne: both editions open the chapter on Cato and interrupt the chapter on solitude with a quotation from **Florio's 1613 translation**, in Florio's spelling, printed as a reading paragraph. | Not repaired. Florio is apparatus and is not cast; a test asserts the paragraphs bind nothing under his name. Note that 36:0 is the *first* paragraph of the chapter, so a reader opening chapter 36 meets Elizabethan English before Cotton's. |
| **The five verse quotations of chapter 36 are printed twice**, once in Latin (36:17, 20, 23, 26, 29) and once in a bracketed English version (36:18, 21, 24, 27, 30), with the poet's attribution inside the bracket. | Not repaired. Only the uninflected *Cato* of Martial's Latin binds; the English versions carry the cards. |
| The older edition prints **Pompeius** in the Posidonius story at 40:13; the modern prints **Pompey**. | The older form is an alias; the modern form is position-tabled, because *Pompey* belongs to more than one man in this book. |
| The modern edition drops the period from **St. Louis** and writes the name out in full once, as **Saint Louis** at 69:12. | All three forms are aliases on one card. |
| **Paragraph 45:0 is an editorial headnote**, not Montaigne: both editions open the chapter on the battle of Dreux with "[December 19, 1562, in which the Catholics, under the command of the Duc de Guise and the Constable de Montmorenci, defeated the Protestants, commanded by the Prince de Conde. See Sismondi, Hist. des Francais, vol. xviii., p. 354.]" | Not repaired. The three commanders are cast, since they are people in the Essays; Sismondi is a nineteenth-century historian and is apparatus. The Prince de Condé is named nowhere else in the chapter, so his only mention is inside the note. A test pins it. |
| **Paragraph 48:4 is an editorial note**, not Montaigne: a bracketed half-page quoting Philip de Commines's account of Fornova, naming the king's horse Savoy. | Not repaired. Commines and the horse carry cards; the note is not Montaigne's text. |
| The older edition misprints **Philopcemen** at 47:14, with the œ ligature broken into *ce*; the modern edition prints Philopoemen. | Both forms are aliases on one card. |
| The modern edition **inverts a name**: "William, Earl of Salisbury" at 41:10 becomes "the Earl of Salisbury, William". | Both orders are aliases. He was omitted from the modern edition until this was found, which is how it was caught. |
| The older edition prints **Goygias** at 42:56 where the modern prints Gorgias. | Neither is cast — it is the dialogue, not the man — but the misprint is recorded so that nobody reads it as a name. |
| The apostrophe split runs on through **d’Anguien** (curly) and **d'Anguien** (straight) at 47:8. | Both forms are aliases. |
| The older edition misprints **Piny** for Pliny at 60:43, **Tiberias** for Tiberius at 59:13, **Cornet.** for Cornel. at 59:24, and **Pheedo** for Phaedo at 60:57. | The three that name cast people are carried as aliases or keyed patterns; Phaedo is a dialogue and is not cast either way. |
| **Paragraph 54:1 is an annotator's note signed Coste**, 54:6 a note signed **Ampère** coining *poésie populaire*, 57:11 an editor's note setting Cotton beside **Florio**'s 1613 version, and **60:0 and 60:44** two notes about Pliny's form of the island's name and about what the 1588 quarto said. All are printed as reading paragraphs in both editions. | Not repaired. The annotators carry no cards; Alexander, Quintilian and Pliny, named inside them, keep theirs. Coste abbreviates Quintilian *Quintil.* in the older edition, which no alias matches, so he binds in the modern edition only. |
| The citation at 19:70 reads **"Maximian, vel Pseudo-Gallus"** — an editorial doubt about the attribution, not a person. | Nothing is bound to *Gallus* there; the Gallus table is keyed to 59:24 alone. |
| The older edition prints the name of one man both ways round: **Severus Cassius** at 10:4 and **Cassius Severus** at 65:39. | Both orders are aliases on one card. He was omitted from 65:39 until this was found. |
| The older edition spells three names differently from the modern: **Boutieres/Boutières**, **Muley Hassam/Hassan**, **Pantheus/Panthus**. | Both forms are aliases. All three were omitted from the modern edition until this was found. |
| **The older edition's sentence at 69:468 runs across the paragraph break.** It ends "…first introduced by Pherecydes" and 69:469 opens with the single word *Syrius* — his epithet, of Syros — before continuing. | Not repaired. *Syrius* is an alias of Pherecydes, so the orphaned word still binds to the right man. This was within one commit of being cast as a separate philosopher called Syrius, on the strength of the older edition's "Syrius, in the time of King Tullus"; the modern edition reads "of Syros", which is what gave it away. |
| **Chapter 69's compositor's errors**: *Cameades* and *Car-neades* for Carneades, *Epichar-mus* for Epicharmus, *Ætha-lides* for Aethalides, *Yarro* for Varro, *Satuminus* for Saturninus, *Lucurgus*, *Proctagoras*, *Pytagoras*, *Sertorious*, *Theodoras*, *Zenophanes*, and *Sehond* for the book's own Sebond. | All carried as aliases exactly as printed, so every mention binds. Tabled in full under **What is hard about this book**. Not repaired: the older edition is the reading text and editing it would move every UTF-16 offset after the change. |
| **Chapter 69 uses real æ ligatures** where the rest of the older edition uses the *AE* digraph: *Cæsar*, *Timæus*, *Scævola*, *Dicæarchus*, *Tyrtæus*, *Alcmæon*, *Paulus Æmilius*. | Carried as aliases or as keyed patterns, depending on whether the name belongs to one man in the work or to several. The ligature forms are easy to lose in an editor that normalises them, which would silently unbind seven people. |
| **The two editions translate the verse at 69:508 differently.** The modern edition names "Father Jupiter… with his fertilising lamp"; the older writes "Men's minds are influenc'd by th' external air" and names no god. | Not a defect and not repaired. `jove` binds in the modern edition alone at that paragraph, and a test pins the asymmetry so that a later pass does not "fix" it. |
| **The older edition prints *Thetis* at 69:656 where the modern prints *Tethys*.** Homer's Ocean and Tethys are the parents of the gods; Thetis is the sea-goddess of the Indian Ocean sacrifice at 69:300. | Two cards, not one, and the older edition's spelling is keyed to the Titaness in that one paragraph with the sea-goddess's alias suppressed there. The two had been merged onto one card in error until the edition-asymmetry census caught it. |
| **Both editions are inconsistent about *St.*, *St* and *Saint*, in both directions.** The older edition writes *St. Austin* at 69:225, *St Augustin* at 69:388 and *St. Augustin* elsewhere; the modern writes *Saint Augustine* at 65:40 and 69:25, *St Augustine* in chapter 99 and *St. Augustine* elsewhere. The same split runs through Paul, Louis, Michael, Bernard, Andrew and Thomas. | All forms are aliases on one card per saint. A census of the saint names, run because of chapter 69, found that the modern edition's *Saint Augustine* at 65:40 and *St Paul* at 17:2 had been left unbound by eight earlier passes. |
| **"A dean of St. Hilary of Poitiers" at 65:22 is a church, not the bishop.** The modern edition writes it *Saint-Hilaire in Poitiers*. | A live mis-binding, now suppressed — the third suppression in this package. Recorded here because the older edition gives the reader no way to tell the church from the man. |
| **The older edition writes *Philip de Commines* where the modern writes *Philippe de Commines*** at 67:30 and 67:31. | Both forms are aliases. He was omitted from the modern edition in those two paragraphs until the edition-asymmetry census found it. |
| **The older edition misprints Livy's full name *Titius Livius* at 62:18**, and writes it *Titus Livius* at 66:0 and 73:70 where the modern edition writes *Livy*. | All three forms are aliases on one card. Two of the three paragraphs were unbound in one edition until the asymmetry census found them. |
| **The salutation of Epicurus's last letter is set in capitals and misprinted in both halves**: the older edition reads "EPICUYUS TO HEYMACHUS, health" at 73:11. | Both capitalised misprints are aliases, since the alias matcher is case-sensitive and would otherwise miss the salutation entirely. |
| **The modern edition drops "says Seneca" from 70:35**, and writes "Plato's ring" at 73:64 where the older edition has "the Platonic ring", an adjective and not a name. | Not defects and not repaired: the two translations differ. `seneca` binds at 70:35 in the older edition alone and `plato` at 73:64 in the modern alone, and a test pins both asymmetries so that a later pass does not "fix" them. |
| **The older edition misprints three more names in chapters 69–80**: *Lactantms* for Lactantius at 74:156, *Zenocrates* for Xenocrates at 69:268 and 69:401, and *Metellius of Macedon* for Metellus at 74:91. | All carried as aliases or keyed patterns exactly as printed. The Zenocrates misprint is the same Z-for-X as *Zenophanes* for Xenophanes in the same chapter, and it hid Xenocrates from the chapter-69 pass altogether. |
| **The older edition has a lacuna at 90:7.** It reads "he had no more written against him which he had as sharply answered"; the modern edition reads "Caius Memmius had written some very sharp speeches against him, which he had answered just as sharply". A name and a clause are missing from the older text. | Not repaired. `memmius` binds at 90:7 in the modern edition alone, and a test pins the asymmetry. Whether Lucretius's Memmius and Caesar's are one man the Essays do not say, and the two are on one card with that said on it. |
| **The older edition misprints Origen *Origeti* at 69:476.** The modern edition reads *Origen*. | Carried as an alias exactly as printed. Like *Zenocrates*, the misprint is why no pass before chapter 99 cast the man at all, though he stands in the Apology. |
| **The editor's note at 102:1 belongs to 101:13, one paragraph and one chapter earlier.** It begins "Diogenes Laertius, however, … says that Plato's offence was the speaking too freely to the tyrant" — an answer to chapter 101's claim that Dionysius sold Plato because he could not equal him in discourse. It has landed after 102:0, where Montaigne is quoting Plato on punishment. | Not repaired. Both editions carry it in the same place, so it belongs to the common source. Plato and Diogenes Laertius are bound in the note as they would be anywhere. |
| **The sentence that names Brisson runs across an editor's note.** 101:7 ends on the bare word "Brisson," and 101:9 opens "running against Alexander"; 101:8 is the note between them. | Not repaired, and the same shape as the split sentence at 69:468/469. Brisson binds in 101:7 and again at 101:8, where the note gives his other name. |
| **The Latin of chapter 100 is corrupt in both editions, identically.** 100:46 prints Horace's ode as *Vixere fortes ante Agamemnona Mufti … ignotique longs Nocte* for *multi … longa nocte*, and 100:43 prints *Auro quoque torts refulgent Retia* for *tortis*. | Not repaired, and it changes no binding: the Latin *Agamemnona* is unbound like every other name inside a quotation, and the English version at 100:47 carries the card. Since both editions share the corruption it belongs to the common source, not to either translation. |
| **100:41 is the one Latin quotation in chapter 100 with no English version and no citation after it.** Both editions print Martial's couplet on Hermogenes the napkin-thief and then go straight on in prose. | Not repaired. Hermogenes is therefore unbound: the quoted-verse rule puts the card on the English version, and here there is none. |
| **The two editions render the citation abbreviations differently in eighteen places** — the older writes *Hor.*, *Claud.*, *Quintil.*, *Lucret.*, *Propert.*, *Liv.*, *Cic.*, *Mart.*, *Aug.* and a bare *Annals* where the modern names the author. | Recorded, not repaired. Each is an author who already has a card; the effect is that his mention binds in the modern edition alone. Closing them is one sweep, and it is listed under **Remaining work**. |

No edition byte was touched.

## Remaining work

- **Chapters 103–107.** Five chapters, two of the longest in the work among
  them: 103 (*Of vanity*, 300 paragraphs) and 107 (*Of experience*, 240), with
  106 (142), 104 (123) and 105 (60).
- **Run the edition-asymmetry census on every chapter already authored.** It was
  written for chapter 69 and immediately found three gaps and one mis-binding in
  chapters 17, 65 and 67, which eight passes of other checks had gone past. The
  eighteen asymmetries it still reports over chapters 1–68 are the citation
  abbreviations — *Hor.*, *Claud.*, *Quintil.*, *Lucret.*, *Propert.*, *Liv.*,
  *Cic.* — which the modern edition expands and no alias in the older edition
  matches. They are recorded, not repaired, but they should be read once more by
  whoever finishes the book.
- **Run the unbound-tabled-names audit before believing the tests** — enumerate
  every `SPLIT` pattern against the new chapters rather than reading the mention
  list, since a table with no key produces no mention to audit. It has now found
  forty-two real gaps, thirteen of them in chapters 31–40 alone, and it is the
  only check that would have caught any of them. Chapter 99 is the first pass in
  which it came back with nothing to fix, which is what a finished table looks
  like — but that is a result of running it eleven times before, not a reason to
  skip it on chapter 100.
- **Check whether the name already has a card before writing one.** Three entities
  in the chapters 41–50 pass were written from a reading of the text when they were
  already in the package — Heraclitus, Hegesias and Crates, all cast in chapters 24
  and 25 — and the duplicate-id assertion in the compiler is what caught them. Grep
  `author_content.py` for the id first; the census of unknown capitalised tokens
  filters out names that already have an alias, so a name missing from the census
  is a name that is already cast.
- **Re-read what earlier passes claimed about unread chapters.** One namesake row
  in this file was wrong for twenty chapters because it assigned 44:1 to the
  Gorgon-slayer without reading it. Claims of the form "the X of chapter N is
  another man" are only as good as the chapter having been read.
- **Check the keys as well as the gaps.** Four keys in this pass matched nothing,
  which is the same failure wearing the opposite mask. The guard test is in place;
  run it, do not re-derive it.
- **Every new card must stand alone.** Do not write "the other of them" and rely
  on the neighbouring card; a reader gets one card at a time. And write the card
  from the paragraph in front of you, not from memory of the story — three
  rewrites in this pass were wrong on the first attempt for exactly that reason.
- The names already tabled will need keys in every later chapter that uses them,
  and their `None` defaults replaced only where a later man is actually carded.
  The list that will need the most work is the one the Essays repeat most:
  Alexander, Caesar, Pompey, Cato, Scipio, Cyrus, Dionysius, Antigonus, Ptolemy,
  Darius, Philip, Charles, Henry, Francis.
- Montaigne himself first binds at 28:2; his card is written for the whole book.
- Then the six editorial checks over the whole work, a fresh whole-work
  spot-read, a refreshed `omittedEntities`, and only then `validated-package`.

## Validation

`python3 books/characters/build_essays_montaigne.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Two hundred and
fifty-three focused tests so far. No edition changes, no network generation, no API spend: every card
here was written in the authoring conversation and committed as a file.
