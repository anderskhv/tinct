# Review log: meditations (modern-da, batch e-short-classics)

## Method
1. The modern-en file was split into chunks of whole chapters (or, for long chapters, paragraph ranges), about 3,500 English words each.
2. A translator subagent translated each chunk paragraph for paragraph, following the batch brief (STYLE.md in this package folder's parent) and the fixed term list below, then ran a structural check (segment, paragraph and title counts; English, length-ratio and quote-mark flags) and corrected its own draft.
3. A second, independent reviewer subagent saw only the English chunk and the Danish chunk (no glossary, no older edition, no translator notes). It checked every paragraph and title for meaning, omissions, additions, English left in, stiff phrasing and form, and returned full corrected paragraphs.
4. The orchestrator applied every reviewer fix except those that broke an explicit brief rule (recorded below as NOT APPLIED), then assembled the book and ran the gates (GATES.md).

Totals: 74 reviewer findings logged; 0 not applied (brief conflicts); all others applied.

## Fixed term list given to translators
Fixed terms for Marcus Aurelius, Meditations (use in every chunk):
- ruling faculty → den styrende del; the universe → altet / universet (prefer altet when it means the cosmos as a whole); the Whole → Helheden (capital as English); nature (of the whole) → (helhedens) natur; providence → forsynet; daemon / the divinity within → dæmonen / guddommen i dig; reason → fornuft(en); rational → fornuftig / fornuftbegavet; impression → forestilling; assent → bifald / samtykke; opinion → mening / opfattelse (choose by context; "life is opinion" → »livet er opfattelse«); things indifferent → ligegyldige ting; the common good → det fælles bedste; the gods → guderne; soul → sjæl; understanding → forstand; city → by / stat (the cosmos as a city → verdensstaten).
- Names: Antoninus Pius → Antoninus Pius; Verus, Rusticus, Apollonius, Sextus, Fronto, Maximus, Severus; Epictetus → Epiktet; Heraclitus → Heraklit; Socrates → Sokrates; Plato → Platon; Pythagoras; Diogenes; Chrysippus → Chrysippos; Epicurus → Epikur; Hippocrates → Hippokrates; Alexander the Great → Alexander den Store; Augustus; Hadrian.
- Keep the paragraph numbering ("12. ") exactly. Book titles: "Book 1" → "Bog 1".


## Translator notes per chunk (judgment calls)
## meditations-01 (translator)
- check: en=2721 da=2700 ratio=0.992 OK. everyday impression → indtryk, Stoic sense → forestillinger; public applause → offentlig hyldest (bifald reserved); Diognetos; Bacchius, Tandasis, Marcianus, Athenodotus, Theodotus; among the Quadi → blandt kvaderne ved Granua.
## meditations-02 (translator)
- check: en=3961 da=3888 ratio=0.982 OK. divine spirit within → guddommen i dig / i sit indre; fortune (2.3) → tilfældet; vessel (3.3) → karret; Theofrast, Monimos, Pompejus, Gajus Cæsar, Demokrit, Kaldæerne; 3.4 »På det her«/»På det der«.
## meditations-03 (translator)
- check: en=3897 da=3839 ratio=0.985 OK. divine spirit within → guddommen i dig/ham; intelligence → intellekt (kept apart from fornuft/forstand); ruling and law-giving faculty → din styrende og lovgivende del; impression → forestilling; agreed to → samtykke; »Altet er forandring; livet er opfattelse«; O Universe → o Univers; Cecrops → Kekrops; city (3.11) → stat.
## meditations-04 (translator)
- check: en=4020 da=4026 ratio=1.001 OK. Hadrian; Asklepios; Klotho, Helike, Pompeji; Catorthoseis kept; Book 5 dialogue dashes spaced; idea → tanke (forestilling reserved for impression).
## meditations-05 (translator)
- check: en=3948 da=3916 ratio=0.992 OK. Book 6 interlocutor dashes → spaced tankestreger; Alexander af Makedonien, Krates/Xenokrates, Hesiod, Rostra (talerstolen), falernervin, Kosmos.
## meditations-06 (translator)
- check: en=2553 da=2456 ratio=0.962 OK. 8 flags false positives. Aesculapius → Asklepios; Chrysippus → Chrysippos; §44 "these two cities" → disse to stater; Caesar as common noun → en cæsar.
## meditations-07 (translator)
- check: en=3841 da=3814 ratio=0.993 OK. §13 melos/meros: lem (melos) / del (meros), "skifter l'et ud med et r"; §17 Eudaemonia kept; Platon, Epiktet, Chrysippos, Epikur, Sokrates, Antisthenes, Telauges, Leon fra Salamis; §58 trailing ellipsis kept.
## meditations-08 (translator)
- check: en=3948 da=3900 ratio=0.988 OK. Hadrianus → Hadrian; Pompeius → Pompejus, the Pompeii → Pompejernes familie; Caius and minor names kept; 8.41 sphere → kugle.
## meditations-09 (translator)
- check: en=4003 da=3962 ratio=0.990 OK. Plato's Republic → Platons stat; Greek aktines / apo tou ekteinesthai kept; Demetrius of Phalerum → Demetrios fra Faleron; kindness → mildhed.
## meditations-10 (translator)
- check: en=3985 da=4000 ratio=1.004 OK. calluses of the earth → jordens hårde hud; untaught person → udannet menneske; runaway → rømningsmand; Islands of the Blessed → De Saliges Øer; good divine spirit within → en god guddommelig ånd i det indre (English does not say daemon there); one city (10.15) → by.
## meditations-11 (translator)
- check: en=3608 da=3571 ratio=0.990 OK. Hadrian (en Hadrianus), Filip, Krøsus, Eufrates, Alkifron, Tropaiophoros, Xenofon, Kriton, Fokion, »O Kithairon!«; Caesars → kejsere; simple → enkel; craft → kunst (11.10) / håndværk (11.5); pankration – kampen, hvor alt er tilladt.
## meditations-12 (translator)
- check: en=3966 da=3917 ratio=0.988 OK. opinions (people's views) → meninger; Lakedaimonierne, Perdikkas, efeserne, Empedokles' kugle, Odysseen, Værker og dage; pancratiast → alkampskæmperen, pankratiasten; Lamiae → lamier – bussemænd; broken-off 11.18 and 12.17 kept broken off.
## meditations-13 (translator)
- check: en=1047 da=1023 ratio=0.977 OK. »alt er opfattelse«; §36 »denne store stat, verden«; pride that prides itself on having no pride → det hovmod, der bryster sig af ikke at være hovmodigt; Baiae, Capreae, Velia kept.

## Independent review per chunk

### meditations-06 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 34; titles checked: 0; findings: 8; applied: 8
- Reviewer summary: A faithful, complete and well-registered translation: no omissions, additions, leftover English or form errors (dashes, »…« quotes and numbering are correct). Findings are minor idiom fixes (calques such as 'nu, hvor', 'gabende gab', plural 'virksomheder') plus one referent shift ('stater' for 'cities').
  - ch6 p25 [stiff] 'gå din vej' reads as 'go away/get lost' in Danish; English means carry on.
  - ch6 p26 [stiff] 'er ikke virkelig sådan' is a calque.
  - ch6 p30 [stiff] 'nu, hvor du er vågen' calques 'now that'; Danish uses 'da' here.
  - ch6 p31 [stiff] Plural 'virksomheder' reads as 'companies'; use singular 'virksomhed' (activity).
  - ch6 p35 [stiff] 'gabende gab' is a redundant calque of 'gaping jaws'; 'gøre sig en dom' is unidiomatic (danne sig en dom).
  - ch6 p43 [meaning] English says 'these two cities' (picking up 'My city'); 'stater' shifts the referent.
  - ch6 p47 [stiff] 'en fjerdes en anden god egenskab' is clumsy.
  - ch6 p49 [stiff] 'på betingelse' needs an object; idiomatic is 'betinget'.

### meditations-07 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 67; titles checked: 1; findings: 7; applied: 7
- Reviewer summary: A strong, faithful translation: no omissions, additions, English leftovers or form errors (»…« quotes, dashes and numbering are correct throughout). The register is consistently dignified and mostly idiomatic; findings are a handful of small idiom, preposition and word-order issues plus two nuance slips (para 19 'skal', para 26 'ude af dig selv').
  - ch7 p4 [stiff] 'at jeg ikke bør' lacks the object Danish needs; dangling modal reads as calqued English.
  - ch7 p14 [stiff] 'ligesom hvis' is colloquial/calqued; Danish uses 'som om' for 'just as if'.
  - ch7 p19 [meaning] 'at jeg skal gøre noget' can read as obligation ('that I am to do'); the English is a fear that I might do it.
  - ch7 p26 [meaning] 'ude af dig selv' (beside yourself) is much stronger than 'upset'.
  - ch7 p35 [stiff] 'få ondt ord for det' is not idiomatic; the established Danish rendering of this saying is 'høre ilde'.
  - ch7 p51 [stiff] Wrong preposition: one is 'hengiven til', not 'hengiven over for'.
  - ch7 p57 [stiff] Opening sentence has English-like word order with the object split awkwardly ('Hold i alt, hvad der sker, dem for øje, som ...'); hard to parse.

### meditations-09 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 47; titles checked: 1; findings: 8; applied: 8
- Reviewer summary: A faithful, complete and generally fluent translation that keeps the book's measured register; no omissions, additions or leftover English were found, and quotation marks follow »…«. Two small meaning slips (hellere vs. snarere in 9.9, falde sammen in 8.57) and a handful of calques or grammar slips need correcting.
  - ch8 p47 [stiff] Adjective agreement: 'sind' is neuter, so 'frit for lidenskaber'.
  - ch8 p48 [stiff] 'Sig ikke dig selv mere' is unidiomatic; Danish says 'sig ... til dig selv'.
  - ch8 p49 [stiff] 'smide det af' means throw off, not throw away into a place; needs 'hen'.
  - ch8 p50 [stiff] 'Ved hver time' is a calque of 'every hour'; idiomatic is 'time for time'.
  - ch8 p56 [meaning] 'fall down' is 'falde ned'; 'falde sammen' means collapse.
  - ch9 p2 [stiff] 'det eneste, om noget,' is an English calque of 'if there is anything'.
  - ch9 p8 [meaning] 'would sooner find' means more likely to find; 'hellere' means would prefer to.
  - ch9 p13 [stiff] Finite verb 'varer kun en dag' breaks the list of adjectival predicates.

### meditations-01 — independent review (applied 2026-10-21T12:50Z)
- Paragraphs checked: 17; titles checked: 1; findings: 7; applied: 7
- Reviewer summary: A faithful, complete and generally fluent translation that keeps the book's dignified register; no omissions, additions, leftover English or form errors were found. The findings are a few nuance slips (snarere, for øje, lærte at kende) and some calques or register lapses, mostly in the long paragraphs 7 and 16.
  - ch1 p3 [stiff] English word order: adverbial fronted inside the 'at'-clause; Danish puts the subject first.
  - ch1 p6 [stiff] 'en fremviser af kloge taler' is a calque; 'delte med mig' (shared) is an anglicism and the relative clause dangles after 'at kende'.
  - ch1 p7 [meaning] 'have for øje' means 'aim at / keep in mind', not 'have before one's eyes'.
  - ch1 p10 [meaning] 'rather lacking' means 'somewhat/fairly lacking'; 'snarere' means 'rather (than)' and suggests a missing comparison.
  - ch1 p13 [meaning] 'came to know of' Thrasea etc. (long dead): 'lærte ... at kende' implies personal acquaintance.
  - ch1 p14 [stiff] 'havde den gave at have en behagelig humor' is clumsy (have ... have).
  - ch1 p15 [stiff] 'styret af riget' is an English of-construction (use genitive); 'gøre et nummer ud af det' is too colloquial for the register; bare 'slække' needs 'af'.

### meditations-02 — independent review (applied 2026-10-21T12:51Z)
- Paragraphs checked: 23; titles checked: 2; findings: 2; applied: 2
- Reviewer summary: A faithful, complete and fluent translation that keeps the book's measured register; terminology (forsyn, altet, den styrende del, guddommen i dit indre) is used consistently and quotation marks follow the »…« rule. Only two small idiom fixes are needed; no meaning errors, omissions or additions were found.
  - ch2 p6 [stiff] Double 'dig' with the object stranded at the end reads as English word order; recast as a reflexive question.
  - ch3 p2 [stiff] 'stig af' is for buses and bikes; leaving a ship after landing is 'gå fra borde', which fits the voyage image.

### meditations-13 — independent review (applied 2026-10-21T12:51Z)
- Paragraphs checked: 11; titles checked: 0; findings: 3; applied: 3
- Reviewer summary: A faithful, complete and idiomatic translation in a fitting, slightly elevated register; names, numbering, »…« quotes and dashes are all correct, with no omissions or additions. Only three small phrasing issues, where the wording is stiff or obscure, need fixing.
  - ch12 p26 [stiff] 'Kald hele tiden dem i erindring, der ...' splits the pronoun from its relative clause in an awkward, translated-sounding order.
  - ch12 p30 [stiff] 'det passer ikke med at ... at være' is an anglicism ('it does not fit with'); Danish says 'det er uforeneligt med'.
  - ch12 p35 [stiff] 'den, der løser dig' is obscure in modern Danish for 'the one who releases you' (dismisses you from the stage); 'lader dig gå' is clear and keeps the image.

### meditations-08 — independent review (applied 2026-10-21T12:51Z)
- Paragraphs checked: 55; titles checked: 1; findings: 11; applied: 11
- Reviewer summary: A faithful, complete and generally fluent translation: no omissions, additions, leftover English or quote-format errors were found, and names, numbering and »…«/›…‹ quotes are correct. The findings are mostly local idiom fixes (calqued prepositions, 'er ondt for', an ambiguous 'den dør'), plus one lost nuance in 8.34 ('makes of himself') and one in 8.10 ('care about').
  - ch7 p67 [stiff] 'stof for dyd' uses an English preposition; Danish says 'stof til'.
  - ch8 p1 [stiff] 'et værk af et ... væsen' is an anglicism (the work of); use the genitive.
  - ch8 p9 [meaning] 'bekymre sig om' means 'worry about'; the sense is 'care for / be concerned with' the good.
  - ch8 p11 [stiff] 'mere virkelig dets eget' is a calque of 'more truly its own'.
  - ch8 p23 [stiff] 'badning' is clumsy here; 'badet' (the bath) is natural.
  - ch8 p26 [stiff] 'som alt kommer fra til alle' is awkward word order.
  - ch8 p31 [stiff] 'god sans' is an anglicism for 'good sense'.
  - ch8 p33 [meaning] 'sådan gør et menneske sig selv' drops 'makes of himself' (gør sig selv til).
  - ch8 p40 [stiff] 'er ondt for' is unidiomatic (suggests 'hurts'); Stoic 'bad for' is 'et onde for'. 'eller engang hindret' is ungrammatical.
  - ch8 p43 [stiff] 'begge dele' is used for things, not two groups of people.
  - ch8 p46 [stiff] 'ligesom den dør, der' can be misread ('the door'); 'i godt humør over for' is unidiomatic for 'well pleased with'.

### meditations-05 — independent review (applied 2026-10-21T12:51Z)
- Paragraphs checked: 47; titles checked: 1; findings: 7; applied: 7
- Reviewer summary: A faithful, complete and generally natural translation that keeps the sober register of the Meditations; no omissions, additions, English leftovers or quote-form errors were found. The findings are a handful of local fixes: two real nuance errors (5.36 'gøre til nar af', 5.33 'blive anset'), a false friend ('gymnasiet') and a few stiff phrasings.
  - ch5 p17 [stiff] 'Der sker ingen noget' is unidiomatic Danish.
  - ch5 p32 [meaning] 'at blive anset' means only 'to be regarded'; 'well thought of' needs good repute. 'en tom ting' is an anglicism.
  - ch5 p35 [meaning] 'lade dig gøre til nar af' means 'let them make fun of you'; English means letting yourself become a fool over these things.
  - ch6 p7 [stiff] 'gør sig selv til hvad som helst, den er' is clumsy; 'whatever it is' = 'det, den er'.
  - ch6 p14 [stiff] 'Selve hvert menneskes liv' is stiff word order.
  - ch6 p15 [stiff] 'i fuldstændig oprør' suggests rebellion; turmoil = 'uro'.
  - ch6 p19 [meaning] 'gymnasiet' reads as upper-secondary school to Danish readers; also 'brase ind i dit hoved' is unidiomatic for a head-butt.

### meditations-03 — independent review (applied 2026-10-21T12:51Z)
- Paragraphs checked: 41; titles checked: 1; findings: 5; applied: 5
- Reviewer summary: A strong, faithful translation: no omissions, additions, mistranslations or leftover English found, and the quotation marks and numbering are correct. The register suits Marcus Aurelius. The findings are a few calqued constructions (3.15, 3.16, 4.10 by section number), one misleading word choice ('borgerligt') and one ellipsis spacing issue.
  - ch3 p6 [stiff] 'borgerligt fællesskab' reads as 'bourgeois/civil community' in Danish; 'civic community' is rendered 'borgerfællesskab' elsewhere in the chunk.
  - ch3 p14 [stiff] 'den sidste slags at se sker' is ungrammatical, calqued Danish.
  - ch3 p15 [stiff] 'Det betyder også ikke at besmitte ...' is clumsy infinitive calque of 'It also means not defiling'; Danish wants a finite clause.
  - ch4 p9 [stiff] 'i den sande betydning, hvori man forstår, at et menneske er godt' is a stiff word-for-word rendering.
  - ch4 p18 [form] Space before the closing ellipsis; English has none.

### meditations-04 — independent review (applied 2026-10-21T12:52Z)
- Paragraphs checked: 34; titles checked: 1; findings: 6; applied: 6
- Reviewer summary: A faithful, complete translation with no omissions, additions or meaning errors found; register and Stoic terminology (styrende del, altet, i pagt med naturen) are handled consistently. Findings are limited to a few calqued or awkward phrasings and one misspelled genitive (atheniensernes).
  - ch4 p32 [stiff] 'sætte vores alvorlige stræben ind på' is translated-sounding; a verb phrase reads naturally.
  - ch4 p38 [stiff] 'Lad ... denne evne lade være med' doubles 'lade' awkwardly.
  - ch4 p41 [stiff] 'Det er intet ondt for tingene at ...' is a calque; Danish says 'Der er intet ondt i, at ...'.
  - ch4 p43 [stiff] Predicative 'vant' reads as 'accustomed' (of a person), not 'familiar'.
  - ch5 p6 [form] Inconsistent/misspelled genitive: 'athenienernes' should be 'atheniensernes'.
  - ch5 p7 [stiff] 'Døm, at ...' is a literal rendering of 'Judge that'; unidiomatic as an imperative in Danish.

### meditations-12 — independent review (applied 2026-10-21T12:52Z)
- Paragraphs checked: 47; titles checked: 1; findings: 1; applied: 1
- Reviewer summary: A faithful, complete and idiomatic translation: every sentence, qualifier, name and example is carried over, quotation marks and numbering follow house style, and the register suits Marcus Aurelius. Only one small lexical slip (hengivet til) needed correcting.
  - ch11 p17 [stiff] "given to fits of passion" rendered "hengivet til", which in Danish means devoted to; "tilbøjelig til" is the natural rendering.

### meditations-11 — independent review (applied 2026-10-21T12:53Z)
- Paragraphs checked: 30; titles checked: 1; findings: 4; applied: 4
- Reviewer summary: A faithful, complete and natural translation that keeps the book's register; quotations, numbering and names are handled correctly. Only four small issues: three idiom slips and one dropped 'too'.
  - ch10 p35 [stiff] 'ånde frit, fri for denne skolemester' is a clumsy frit/fri echo; 'nu vi er af med' renders 'rid of' idiomatically.
  - ch11 p0 [stiff] 'kærlighed til næsten' reads as 'love for almost'; the Danish idiom is 'kærlighed til sin næste'.
  - ch11 p1 [omission] 'too' in the last sentence is dropped.
  - ch11 p7 [stiff] 'ikke er ét sind med det' is unidiomatic; Danish says 'ikke er af samme sind som det'.

### meditations-10 — independent review (applied 2026-10-21T12:53Z)
- Paragraphs checked: 34; titles checked: 1; findings: 5; applied: 5
- Reviewer summary: A faithful, complete and generally fluent translation of Meditations 9.34-42 and 10.1-25; no omissions, additions or meaning errors found, and form (»…«, dashes, numbering) is correct. The findings are five local idiom fixes: an anglicism, an archaic or misleading word choice, and one English word order.
  - ch9 p34 [stiff] 'sker alle ting nu vel' reads as 'presumably'; 'well' is 'godt' here.
  - ch9 p38 [stiff] 'finde fejl ved' is a calque of 'find fault with'; Danish says 'have noget at udsætte på'.
  - ch10 p7 [stiff] 'blive dem selv lige' is archaic and obscure; 'be made like themselves' = 'komme til at ligne dem'.
  - ch10 p10 [stiff] 'afført sig legemet' evokes 'afføring' for a modern reader; use 'aflagt legemet' (stripped off).
  - ch10 p14 [stiff] English word order: 'lære at kende et sandt menneske'; Danish: 'lære et sandt menneske at kende'.

### Orchestrator edits after review (meditations)
- Three-dot ellipses »...« written as »…« (U+2026) throughout, so the spaced ellipsis in 5.28, 5.29 and 7.58 no longer trips danish-lint SPACE-BEFORE-PUNCT; wording unchanged.

