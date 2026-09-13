# Montaigne's Essays character package — IN PROGRESS

**Chapters 1–50 of 107 are authored. The rest are not.** Status stays
`in-progress` and the package must not be integrated until the whole work is
covered.

Current state: 579 entities authored, all 579 bound in both editions, 3,257 and
3,377 exact mentions. Of those, 162 and 180 fall inside chapters 1–10, 205 and 209
inside chapters 11–20, 340 and 353 inside chapters 21–25, 136 and 142 inside
chapters 26–30, 255 and 263 inside chapters 31–40, and 278 and 288 inside
chapters 41–50; the rest are later occurrences of names that belong to one man
through the whole book — Cicero, Plato, Horace, Seneca, Socrates, Plutarch,
Aristotle and the other authorities Montaigne quotes on every page. Content
revision 2026-09-12.7.

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

Both spellings sit on one card, and a test pins every pair. The last row is the
one most likely to be undone by accident: the two editions differ only in the
kind of apostrophe, and an alias with the wrong one binds in one edition and not
the other.

**The namesakes.** An essayist who cites for eleven hundred pages repeats names
constantly, and Montaigne almost never distinguishes them. In the first fifty
chapters:

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
A hundred and ninety-six entities bind beyond chapter 50 that way, and five of
them — Plato, Cicero, Seneca, Socrates and Horace — account for most of it. It is
worth being plain about the size of this: 1,881 of the 3,257 mentions in the older
edition fall in chapters that have not been read. Those are bindings of names with
one bearer, and the cards are written to be true anywhere; but they are not
reviewed paragraph by paragraph, and the release owner should read the scope line
as covering the *cast*, not every mention of it.

## Editorial checks — chapters 1–50

**1. Namesakes.** The hundred in the table above, each pinned by a test.

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

**The Blessed Virgin at 46:4 is left unbound.** The name in that paragraph is the
wench's: "asking her name, and being answered that it was Mary". The reverence is
to the Virgin, but the word *Mary* denotes the girl, and the Virgin herself is
named only by title — *the Blessed Virgin*, *our Lady*. Binding either would be
wrong in a different way, so neither is bound.

**The Christian God, Nature and Fortune are not cast, and this is a decision, not
an omission.** The named classical gods Montaigne treats as agents are cast —
Jove, Apollo, Venus, Minerva, Saturn, Neptune, Flora, the Graces. *God* is not:
it occurs thirty-four times in chapters 31–40 alone and runs through the whole
work as the substrate of the argument rather than as a figure in it. *Fortune* is
the harder call and the release owner should look at it: chapter 33 is *That
fortune is oftentimes observed to act by the rule of reason* and personifies her
throughout — "Does she not seem to be an artist here?" — so there is a case for a
card. Forty chapters have been authored on the rule that only named classical
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

Three traps in this range are deliberately left alone and pinned by tests:

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

**5. Spot-read and sweep.** A hundred and seventy-six mentions drawn at random,
twelve to fourteen per edition per pass, read back against their paragraphs: all
correct. The chapters 31–40 pass read twenty-eight and found no mis-binding, but
it did find the card defect described in check 7; the chapters 41–50 pass read
twenty-eight more, all correct.

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
neither keyed until the audit said so. What the audit reports over chapters 1–50
is twenty-three deliberate cases: the four unresolved names above, the names used
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
*the Bishop of Beauvais*, *Father AEneas*, *our French Plutarch* — *King Clovis*, *King
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

**6. Both editions independently.** No entity is missing from either edition. The
mention counts differ by about four percent (3,257 against 3,377),
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

No edition byte was touched.

## Remaining work

- **Chapters 51–107.** Book I runs to chapter 57, Book II to chapter 94, Book III
  from 95. The heaviest chapters are 69 (*Apology for Raimond Sebond*, 660
  paragraphs), 99 (*Upon some verses of Virgil*, 374), 103 (*Of vanity*, 300),
  107 (*Of experience*, 240), 74 (*Of presumption*, 163) and 73 (101).
- **Run the unbound-tabled-names audit before believing the tests** — enumerate
  every `SPLIT` pattern against the new chapters rather than reading the mention
  list, since a table with no key produces no mention to audit. It has now found
  twenty-six real gaps, thirteen of them in chapters 31–40 alone, and it is the
  only check that would have caught any of them.
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
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. A hundred and six
focused tests so far. No edition changes, no network generation, no API spend: every card
here was written in the authoring conversation and committed as a file.
