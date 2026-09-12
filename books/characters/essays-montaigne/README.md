# Montaigne's Essays character package — IN PROGRESS

**Chapters 1–25 of 107 are authored. The rest are not.** Status stays
`in-progress` and the package must not be integrated until the whole work is
covered.

Current state: 355 entities authored, all 355 bound in both editions, 2,678 and
2,780 exact mentions. Of those, 162 and 180 fall inside chapters 1–10, 205 and 209
inside chapters 11–20, 168 and 178 inside chapters 21–24, and 172 and 175 inside
chapter 25 alone; the rest are later occurrences of names that belong to one man
through the whole book — Cicero, Plato, Horace, Seneca, Socrates, Plutarch,
Aristotle and the other authorities Montaigne quotes on every page. Content
revision 2026-09-12.4.

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

Both spellings sit on one card, and a test pins every pair. The last row is the
one most likely to be undone by accident: the two editions differ only in the
kind of apostrophe, and an alias with the wrong one binds in one edition and not
the other.

**The namesakes.** An essayist who cites for eleven hundred pages repeats names
constantly, and Montaigne almost never distinguishes them. In the first
twenty-five chapters:

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

**Two of those were live mis-bindings the sweep caught**, not hypotheticals. The
bare surname *Lepidus* was binding the man who died of a stumble at 19:24 to the
man who forbade his heirs to pay for his hearse; and *Guelph* was binding a
political party to the Duke of Bavaria. Both are now position-tabled and both are
pinned by tests.

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
A hundred and fifty-five entities bind beyond chapter 25 that way, and five of
them — Cicero, Plato, Horace, Seneca and Socrates — account for most of it.

## Editorial checks — chapters 1–25

**1. Namesakes.** The sixty in the table above, each pinned by a test.

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
mythological figures, **Lesbia** as a literary figure, and **Neptune** as a god,
because Augustus deposed his statue and Montaigne treats that as an act against
a person.

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

**5. Spot-read and sweep.** Ninety-six mentions drawn at random, twelve per
edition per pass, read back against their paragraphs: all correct.

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
which brings the audit's running total to nine gaps that nothing else would have
caught.

The **adjacency sweep** over every mention whose matched text abuts a capitalised
word produces forty-eight hits in chapters 1–10, thirty in chapters 11–20 and
twenty-two in chapters 21–24 and nine in chapter 25, with no mis-binding: *the Emperor Conrad III*, *Pope Leo X*, *Captain Bayard*, *the now
King Philip*, *Count Guido di Rangone*, *Signor Fabricio Colonna*, *the Counts
Horn and Egmont*, *Cardinal du Bellay*, *Queen Margaret of Navarre*, *Captain
Martin du Bellay*, *Poor Judge Bebius*, *King Dagobert*, *The Duke of Athens*, *Old Aristo of
Chios*, *our King Charles VIII*.

**6. Both editions independently.** No entity is missing from either edition. The
mention counts differ by about four percent (2,678 against 2,780),
partly because the modern edition resolves pronouns to names — it says *Dionysius*
and *Scanderbeg* and *Betis* and *Ferdinand* where Cotton says *he* — and partly
because it expands the citation abbreviations, so *Hor.* becomes *Horace* and
*Quint. Curt.* becomes *Quintus Curtius*.

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
| **Paragraph 18:0 is an editor's note, not Montaigne**: both editions print "[Charron has borrowed with unusual liberality from this and the succeeding chapter. See Nodier, Questions, p. 206.]" as the first reading paragraph of the chapter. | Not repaired, and nothing in it is cast: Charron and Nodier are real people but they are not in the Essays. A test asserts that the paragraph binds nothing, so that a later pass does not "complete" it by adding them. |
| The older edition prints **Aeneius Fulvius** at 15:4 where the modern prints **Cnaeus Fulvius** — a correction rather than a spelling variant. | Both forms are aliases on one card. |
| The two editions differ in the **kind of apostrophe** inside *Lorenzo de’ Medici* (curly) and *Lorenzo de' Medici* (straight). | Both forms are aliases. The entity was omitted from the modern edition until this was found, which is how it was caught. |

No edition byte was touched.

## Remaining work

- **Chapters 26–107.** Book I runs to chapter 57, Book II to chapter 94, Book III
  from 95. The heaviest chapters are 69 (*Apology for Raimond Sebond*, 660
  paragraphs), 99 (*Upon some verses of Virgil*, 374), 103 (*Of vanity*, 300),
  107 (*Of experience*, 240) and 74 (*Of presumption*, 163).
- **Run the unbound-tabled-names audit before believing the tests** — enumerate
  every `SPLIT` pattern against the new chapters rather than reading the mention
  list, since a table with no key produces no mention to audit. It found nothing
  over chapters 1–10 and two real gaps over chapters 11–20, and it is the only
  check that would have caught either.
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
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Sixty-two
focused tests so far. No edition changes, no network generation, no API spend: every card
here was written in the authoring conversation and committed as a file.
