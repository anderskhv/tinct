# Review log: the-prince (modern-da, batch e-short-classics)

## Method
1. The modern-en file was split into chunks of whole chapters (or, for long chapters, paragraph ranges), about 3,500 English words each.
2. A translator subagent translated each chunk paragraph for paragraph, following the batch brief (STYLE.md in this package folder's parent) and the fixed term list below, then ran a structural check (segment, paragraph and title counts; English, length-ratio and quote-mark flags) and corrected its own draft.
3. A second, independent reviewer subagent saw only the English chunk and the Danish chunk (no glossary, no older edition, no translator notes). It checked every paragraph and title for meaning, omissions, additions, English left in, stiff phrasing and form, and returned full corrected paragraphs.
4. The orchestrator applied every reviewer fix except those that broke an explicit brief rule (recorded below as NOT APPLIED), then assembled the book and ran the gates (GATES.md).

Totals: 48 reviewer findings logged; 0 not applied (brief conflicts); all others applied.

## Fixed term list given to translators
Older Danish edition at /home/user/tinct/app/public/data/editions/the-prince-modern-da.json: you may grep it ONLY to see how names, places, recurring terms and quotations were rendered. Never copy, adapt or paraphrase its sentences; translate fresh from the English.
Fixed terms: prince → fyrste; principality → fyrstendømme; state → stat; virtue/ability (virtù) → evne / dygtighed (follow English); fortune / Fortune → lykken / Fortuna (follow English capitalisation); mercenaries → lejetropper; auxiliaries → hjælpetropper; one's own arms → egne våben / egne tropper; liberality → gavmildhed; meanness → gerrighed; the Church → Kirken; Pope Alexander VI → pave Alexander 6.; Cesare Borgia (Duke Valentino) → Cesare Borgia (hertug Valentino); Lorenzo de' Medici → Lorenzo de' Medici.


## Translator notes per chunk (judgment calls)
## the-prince-01 (translator)
- check: en=3458 da=3493 ratio=1.010 OK. Flags false positives. Your Magnificence → Deres Højvelbårenhed; aitolerne/akhaierne; tyrken; kardinal Rouen; »intrattenere«; Antiochos, Filip, Ludvig 12., Karl 8., Genova, Mantova; the Bentivogli → familien Bentivoglio.
## the-prince-02 (translator)
- check: en=3832 da=3840 ratio=1.002 OK. 14 flags false positives. tyrken, Dareios, Pyrrhos, Hieron af Syrakus, Orsini'erne/Colonna'erne, kongeriget Napoli; English "Sinigalia" → Sinigaglia (as old Danish edition); sanjaks → sandjakker; oligarchy → fåmandsstyre; Hiero II → Hieron 2.
## the-prince-03 (translator)
- check: en=3383 da=3464 ratio=1.024 OK. Flags false positives. Agathokles, Hamilkar, Syrakus, Sinigaglia, Firenze, Vitelleschi'erne; the Gracchi → brødrene Gracchus; genius → begavelse; talent → dygtighed; the college → kardinalkollegiet. Lucca/Siena: followed the English's flat "yielded at once".
## the-prince-04 (translator)
- check: en=3136 da=3166 ratio=1.010 OK. Flags false positives. Orsini'erne / Colonna'erne, Napoli, Milano, Aragonien, Vailà, Karl 8., Filip af Makedonien; captain(s) → hærfører(e); Bracceschi, col gesso, Primo capitano in Italia, History of Henry VII kept as in English.
## the-prince-05 (translator)
- check: en=3081 da=3203 ratio=1.040 OK. Names per old glossary: Hieron af Syrakus, Filopoimen, Orsini'erne/Vitelli'erne, Forlì. Regnal numerals normalised by orchestrator to Danish ordinals (Ferdinand 5., Julius 2., Karl 7., Ludvig 11.) for consistency with the rest of the book. liberality → gavmildhed; meanness → gerrighed; ch15 Tuscan distinction: avaricious → grisk, miserly → nærig; valor → tapperhed; men-at-arms → panserryttere; hectic fevers → tæringsfeber.
## the-prince-06 (translator)
- check: en=3990 da=4084 ratio=1.024 OK. good faith/faithful → troskab/trofast (consistent with footnote and five-qualities paragraph); "In English:" before Latin → »På dansk:«; Hannibal's virtues → evner; Severus's valor → dygtighed; Marcus's virtues → dyder; Lokrerne, Julianus, Canneschi'erne, Testina-udgaven, Vergil, Achilleus, Ferdinand af Aragonien, spartaneren Nabis.
## the-prince-07 (translator)
- check: en=2702 da=2744 ratio=1.016 OK. Names per old glossary: Julianus, Slavonien, soldanen, Vailà, Forlì, Bentivogli'erne, Caterina Sforza, Messer Niccolò Vitelli (English "Nicolo" → Niccolò); footnote book title »Catherine Sforza« kept. the Turk and the Soldan → tyrken og soldanen – mamelukkernes sultan – (gloss present in English).
## the-prince-08 (translator)
- check: en=2899 da=2962 ratio=1.022 OK. 12 English flags, all false positives (for/have/by/from/to). ch23 p3: English reads "many riches make him want more", a dropped "not" (sense: "may not make him want more"); translated with the negation. Names per old glossary: Bernabò af Milano, aitolerne, akhaierne, Karl den Dristige, Det Hellige Romerske Rige; guild → laug consistently.
## the-prince-09 (translator)
- check: en=2349 da=2359 ratio=1.004 OK. English flags false positives (for/have/to). valor & virtue (virtù) → dygtighed; fortune → lykken. Names per old glossary: pave Julius 2., Leo 10., Clemens 7., Frederik den Store, Petrarca, Sorels Østspørgsmål; Genova. "Allesandria" misspelling kept as in English battle list; Petrarch Italian verse unchanged in »…«.

## Independent review per chunk

### the-prince-09 — independent review (applied 2026-10-21T12:45Z)
- Paragraphs checked: 24; titles checked: 2; findings: 5; applied: 5
- Reviewer summary: A faithful, complete and mostly idiomatic translation that keeps the book's register; quotes, numbering and the regnal-number style are handled correctly. Only a few small issues: a malformed source citation, two anglicisms, one small addition and a stale reference to an English rendering.
  - ch26 p1 [form] Genitive plus definite title ('Sorels Østspørgsmålet') is ungrammatical; use author, title with the established Danish term.
  - ch26 p4 [stiff] 'den anden mislykkes' with a person as subject is an anglicism; Danish says 'det mislykkes for ham'.
  - ch26 p6 [stiff] 'Det efterlod ... tøvende og passive' copies English 'left X uncertain'; Danish would not use 'efterlade' this way.
  - ch26 p8 [addition] 'koldt og beregnende' adds 'beregnende'; English says only 'proceed coldly'.
  - ch27 p12 [meaning] The rendering that follows is now Danish, so 'den engelske gengivelse' points to something the reader does not see.

### the-prince-07 — independent review (applied 2026-10-21T12:46Z)
- Paragraphs checked: 14; titles checked: 1; findings: 5; applied: 5
- Reviewer summary: A strong, faithful translation: no omissions, additions or mistranslations found, quotes and numbering are correct, and the register suits Machiavelli. The findings are a handful of local idiom fixes (one ungrammatical relative clause, a wrong preposition, two calques) and one Italian plural form.
  - ch20 p19 [stiff] 'som det burde have været meget let at holde fast i riget' is ungrammatical (missing 'for' with relative 'som'); use 'for hvem'.
  - ch21 p1 [stiff] Nested clause 'kan du, når dem, du bevæbner, får fordele, behandle' is clumsy English-order Danish; 'hvis karakter allerede er blevet vist' is a literal passive.
  - ch21 p2 [stiff] 'viser politikken sig at være vildledende' is a calque of 'proves fallacious'; the sense is that the policy fails.
  - ch21 p5 [stiff] 'Spørgsmålet kan ræsonneres sådan' is unidiomatic; 'frygte fra folket/fremmede' is a wrong preposition (anglicism of 'fear from').
  - ch21 p6 [form] 'signorierne' is a double plural (Italian plural 'signori' + Danish plural ending); use the Danish plural 'signorerne'.

### the-prince-08 — independent review (applied 2026-10-21T12:46Z)
- Paragraphs checked: 23; titles checked: 4; findings: 4; applied: 4
- Reviewer summary: A strong, faithful and fluent translation: no omissions, additions or English leftovers, quotation marks and numbering correct, and the garbled English in ch 23 p3 is sensibly resolved. Only one weakened litotes and three small unidiomatic phrasings need correcting.
  - ch23 p0 [meaning] 'of no little importance' is a litotes for considerable importance; 'ikke uden betydning' in Danish understates it (merely 'somewhat important').
  - ch24 p2 [stiff] 'lader han sig bringe bort fra dem' is unidiomatic; 'gør han den ene dag om, hvad han gjorde den anden' blurs the order (what he does one day he undoes the next).
  - ch24 p4 [stiff] 'lade sin vrede mærke' is not idiomatic Danish; the idiom is 'lade nogen mærke sin vrede'.
  - ch25 p0 [stiff] 'af yderste evne' is not an idiom (Danish says 'efter evne'); 'af al magt' renders 'make the utmost defense' naturally.

### the-prince-04 — independent review (applied 2026-10-21T12:46Z)
- Paragraphs checked: 28; titles checked: 3; findings: 5; applied: 5
- Reviewer summary: A strong, faithful and readable translation that keeps Machiavelli's register; no omissions, additions or quote/numbering problems were found, and names and footnotes are handled correctly. Findings are limited to one grammatical slip, one nuance (forsmag), and three spots of slightly translated-sounding phrasing.
  - ch11 p3 [stiff] 'holde ... sind standhaftigt' uses an adverb where a predicate adjective is needed; ungrammatical/awkward.
  - ch12 p2 [stiff] 'under herredømme af' is an English-shaped construction; 'underlagt' is idiomatic.
  - ch13 p6 [stiff] 'kan man tage karthagerne' is unidiomatic for 'consider the Carthaginians'.
  - ch13 p7 [meaning] 'forsmag' means a foretaste; the English 'tasted this mistake' means they suffered its consequences in full.
  - ch13 p15 [stiff] 'et lille fodfolk' is odd Danish for 'a few infantry'.

### the-prince-02 — independent review (applied 2026-10-21T12:46Z)
- Paragraphs checked: 31; titles checked: 4; findings: 7; applied: 7
- Reviewer summary: A strong, faithful translation in natural, literary present-day Danish that keeps Machiavelli's register; no omissions, additions, leftover English or form errors found. Seven local fixes: four meaning slips (lykkelige for 'fortunate', 'forsvarer sig', 'med lidt besvær', ambiguous 'vendt mod') and three idiom issues.
  - ch5 p2 [stiff] 'har ingen tillid hos folket' is unidiomatic (one has tillid til); 'no credit with the people' = enjoy no standing.
  - ch6 p1 [stiff] 'hun' for a city is an anglicism; Danish uses 'den' or rephrases.
  - ch7 p3 [meaning] 'fortunate' here means lucky/favoured by fortune, not 'lykkelige' (happy); and 'recognize' the opportunity, not 'gribe' (seize).
  - ch7 p4 [meaning] 'the others defend lukewarmly' means they defend the innovator/prince, not themselves; 'forsvarer sig' shifts the referent.
  - ch8 p3 [meaning] 'med lidt besvær' means 'with some trouble'; English 'with little trouble' means hardly any.
  - ch8 p7 [meaning] 'vendt mod hertugen' can read as 'turned against the duke'; the attachment was transferred to him.
  - ch8 p11 [stiff] Double 'mod' ('mod kongeriget Napoli, mod spanierne') is clumsy and ambiguous.

### the-prince-01 — independent review (applied 2026-10-21T12:46Z)
- Paragraphs checked: 37; titles checked: 4; findings: 7; applied: 7
- Reviewer summary: A faithful, complete and fluent translation in a fitting elevated register; no omissions, additions, leftover English or form errors found (quotes, numerals and 'fulgte' are correct). Findings are limited to a few stiff, English-shaped constructions and one misleading word choice ('pensionsmodtager').
  - ch1 p3 [stiff] 'Jeg ville, at ...' is unidiomatic; use 'Jeg ønskede, at'.
  - ch4 p1 [stiff] Split relative clause 'dem som venner, der satte dig på magten' reads like English word order.
  - ch4 p12 [stiff] 'holdt på Italien i længst tid' is an anglicism.
  - ch4 p17 [meaning] 'pensionsmodtager' reads as a retiree in modern Danish; the sense is a dependent king beholden to Louis (a vassal).
  - ch4 p18 [stiff] 'en sådan undskyldning i nødvendigheden' is awkward, noun-heavy.
  - ch4 p19 [stiff] 'mod dem begge ... mod til at sætte sig op' is a clumsy repetition and inverted order.
  - ch4 p23 [stiff] Relative clause split from its antecedent ('de regler, som de har overholdt, der har taget ...') is hard to parse.

### the-prince-03 — independent review (applied 2026-10-21T12:46Z)
- Paragraphs checked: 26; titles checked: 2; findings: 4; applied: 4
- Reviewer summary: A faithful, fluent translation in a fitting, slightly elevated register; no omissions, additions or quote/markup problems found. Only four small fixes: one changed logical relation in the well-used-cruelty passage, one ungrammatical relative clause, one awkward genitive, and a leftover 'Mr.'.
  - ch9 p0 [stiff] 'på yderligere to måder – som ingen af dem helt kan tilskrives' is ungrammatical Danish; use 'hvoraf ingen'.
  - ch9 p6 [meaning] English lists two conditions (applied at one blow AND necessary for security); 'fordi' turns necessity into the reason, changing the logic.
  - ch9 p7 [english] English honorific 'Mr.' left in; Danish drops it (or uses 'hr.').
  - ch10 p1 [stiff] 'puste en af sine egnes ry op' is an awkward genitive construction; rephrase naturally (both occurrences).

### the-prince-06 — independent review (applied 2026-10-21T12:46Z)
- Paragraphs checked: 42; titles checked: 3; findings: 8; applied: 8
- Reviewer summary: A strong, faithful translation in natural, register-appropriate Danish; quotation marks and form are correct throughout and no English is left in. Findings are limited to one small omission ('the opinion of' the many) and a handful of stiff or calqued constructions, chiefly in Chapter 17's opening and two long sentences in Chapter 19.
  - ch18 p0 [stiff] 'bragte forsoning til Romagna' is an anglicism; Danish uses the verb directly.
  - ch18 p2 [stiff] 'Af alle fyrster kan en ny fyrste ikke undgå' copies English structure and reads oddly; also 'inhumanity' softened to 'hårde styre'.
  - ch18 p3 [stiff] 'mit riges nyhed' is unidiomatic Danish.
  - ch19 p10 [omission] 'oppose the opinion of the many' lost 'the opinion of'.
  - ch20 p0 [stiff] 'fare fra andre bebrejdelser' is a calque preposition; Danish says 'fare ved'.
  - ch20 p6 [stiff] The nested 'så stor, at da bologneserne, skønt ..., hørte, at ..., sendte de' sentence is very hard to follow; reordered.
  - ch20 p13 [stiff] Mixed construction: relative clauses followed by bare adjectives 'menneskelige og venlige'.
  - ch20 p15 [stiff] Main verb 'foragtet' postponed to the end after a long clause; English word-order feel.

### the-prince-05 — independent review (applied 2026-10-21T12:48Z)
- Paragraphs checked: 28; titles checked: 4; findings: 3; applied: 3
- Reviewer summary: A strong, faithful and idiomatic translation of chapters 13-16 with no omissions, additions or meaning errors found; register and the Tuscan liberal/avaricious/miserly distinction are handled well. Only three small issues: Roman regnal numerals left in one note, a misplaced comma, and one slightly off idiom.
  - ch14 p1 [form] House convention: regnal numbers as Danish ordinals; 'F. II' and 'F. III' left as Roman numerals.
  - ch17 p0 [form] Misplaced comma splits 'ærligt og som du bør'.
  - ch17 p2 [stiff] 'er slået fejl' is used of plans, not people; 'the others have failed' reads more naturally as 'er mislykkedes'.

