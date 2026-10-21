# Moby-Dick — independent review of the modern-da edition

**Verdict: ready after fixes, provided Anders decides the units question (decision 1).** All fixes below are applied. The translation is strong, often elegant, and handles Melville's registers and nautical vocabulary well. The sample shows 1.5 meaning errors per 100 paragraphs, plus 0.8 unit errors, which is under the threshold. One systematic slip was found and fixed throughout: *aborre* (the fish) for Ahab's "perch", 8 times. If Anders accepts the recommendation to restore Melville's units, a units-only pass over the paragraphs listed in Appendix A is still needed before release.

## Scope and method

- **Reviewer:** Claude, in a session independent of the drafting run. Reviewed 21 Oct 2026 on branch `claude/danish-1021-c-review`, cut from `claude/danish-1021-c` at d3f0ce7ba0. No Anthropic API was used; all reading was done in the conversation.
- **Source:** the book's `modern-en` edition in `app/public/data/editions/`. The blob in `SOURCE-HASH.txt` is still the blob on origin/main f765241fa7 (21 Oct 2026).
- **Side-by-side reading (EN against DA):**
  - the first and last chapters in full;
  - a stratified, weighted random sample of at least 10% of all paragraphs, drawn with fixed seed **20261021**:
    - The first and last chapters are left out of the sample pool.
    - One weighted paragraph is drawn per chapter, then the rest by weighted sampling without replacement.
    - Weights: base 1; +1 for dialogue (the paragraph opens with a quotation mark); +1 for long paragraphs (at or above the 75th percentile of length); and, for Moby-Dick only, +1.5 for technical whaling paragraphs (two or more whaling or ship terms).
- **Whole-book greps:** every error pattern found in the sample was then searched across the whole book, and those hits were fixed too. They are reported separately from the sample rate.
- **Consistency greps over the whole book:** names, patronymics and forms of address; quotation marks (»…« and nested ›…‹); ellipses; dashes; `Mr.`/`hr.`; leftover English; italic `_…_` markers; and the per-chapter `section` labels.
- **Paragraph references:** ¶ is 1-based, as in `chapters/NNN.txt`. The JSON index is ¶ − 1.
- **Severity:**
  - *meaning*: the reader gets a wrong, garbled or missing sense.
  - *grammar*: an ungrammatical form, a non-word, or wrong gender or inflection.
  - *style*: a calque, unidiomatic phrasing, a register slip, an inconsistency or a precision issue (for example *foragtelig*, "contemptible", where the source means *foragtende*, "contemptuous").
  - *units*: a measurement conversion that changes the figure.
  - Each issue is counted once, in the paragraphs read, before any fixes.
- **Structure:** fixes went into both `<book>-modern-da.json` and `chapters/NNN.txt`, which are byte-identical renders of each other. Chapter count, numbering, paragraph counts, JSON key order and the `_…_` emphasis markers are unchanged; the gate script compares every file against the draft commit.

## What was read

- **Paragraphs read:** 262 of 2,432, which is about 15% of the Danish text and about 30,500 Danish words.
  - Ch1 in full (15 paragraphs) and ch136, the epilogue, in full (3 paragraphs).
  - 244 sampled paragraphs, a 10% sample weighted towards dialogue, technical whaling passages and long paragraphs.
- **Unit audit:** every paragraph with a unit of measure in EN or DA (282) was listed EN against DA. The arithmetic was checked at all metric sites.
- **Sample, as ch:¶:** 2:5, 3:28, 3:51, 4:6, 5:1, 6:3, 7:4, 8:5, 9:12, 9:15, 10:5, 11:4, 12:1, 13:11, 14:4, 15:1, 15:9, 16:23, 16:31, 16:38, 16:44, 17:3, 17:5, 17:24, 18:2, 18:9, 19:30, 20:3, 21:7, 21:17, 21:25, 21:31, 22:4, 22:6, 22:17, 22:20, 22:21, 23:4, 24:13, 24:14, 25:1, 26:1, 27:9, 28:2, 29:6, 29:8, 30:1, 31:5, 32:19, 32:38, 33:3, 34:2, 34:11, 35:4, 35:6, 35:9, 36:16, 36:28, 36:47, 37:5, 38:1, 39:2, 40:20, 40:30, 40:46, 41:3, 41:7, 41:19, 42:8, 42:9, 42:31, 43:6, 44:4, 45:1, 45:4, 46:2, 46:6, 47:10, 48:14, 48:24, 48:36, 48:39, 49:7, 50:6, 51:1, 51:10, 52:2, 52:4, 52:6, 53:3, 54:23, 54:65, 54:86, 55:2, 55:9, 55:13, 56:9, 57:3, 58:2, 58:12, 59:5, 59:7, 60:1, 60:4, 60:10, 61:3, 61:9, 61:24, 62:2, 63:1, 63:3, 64:8, 64:43, 64:48, 64:54, 65:3, 66:4, 67:2, 68:6, 69:1, 70:6, 71:5, 71:13, 72:2, 73:8, 73:22, 73:26, 73:28, 73:40, 74:5, 74:14, 75:1, 75:9, 75:11, 76:2, 76:3, 77:2, 78:4, 79:6, 80:6, 80:7, 81:14, 81:25, 81:34, 81:47, 82:5, 82:6, 83:2, 83:4, 84:6, 85:12, 86:3, 86:12, 87:7, 87:11, 87:34, 88:5, 89:2, 90:9, 91:10, 91:36, 91:39, 92:2, 93:6, 93:10, 93:13, 94:3, 94:5, 94:9, 95:3, 96:5, 97:1, 98:5, 99:16, 100:2, 100:10, 100:21, 100:40, 101:2, 101:11, 102:10, 102:12, 103:7, 104:8, 105:3, 105:6, 106:5, 107:4, 107:5, 108:8, 109:2, 109:5, 109:6, 110:11, 111:4, 112:7, 113:4, 113:9, 113:15, 113:18, 114:8, 115:12, 116:4, 117:13, 117:15, 118:8, 119:8, 119:23, 120:5, 120:6, 121:3, 122:1, 123:12, 124:1, 124:15, 124:17, 125:25, 126:6, 126:19, 127:2, 127:9, 127:17, 127:20, 128:7, 128:16, 129:2, 129:6, 129:7, 130:4, 130:13, 131:4, 132:13, 132:18, 133:1, 133:8, 133:20, 133:39, 133:49, 134:14, 134:16, 134:29, 135:15, 135:28, 135:56

## Error rate before fixes (paragraphs read)

| Severity | Issues | Per 100 paragraphs | Per 10,000 DA words |
|---|---|---|---|
| Meaning | 4 | 1.5 | 1.3 |
| Units (wrong measure or incoherent) | 2 | 0.8 | 0.7 |
| Grammar | 7 | 2.7 | 2.3 |
| Style | 10 | 3.8 | 3.3 |

- **Meaning:**
  - *allerinderste kant* ("innermost edge") for "outermost edge" (ch1 ¶4);
  - *flaskeknapperne* ("bottle knobs") for the trucks, which are *flagknapperne* (ch48 ¶24);
  - *midlertidig styrmand* ("temporary mate") for "temporary steersman" (ch62 ¶2);
  - *sin aborre* ("his perch", the fish) for Ahab's perch (ch134 ¶14).
- **Units:**
  - "within an inch" → *et par millimeter*, and "the thousandth part of an inch" → *en tusindedel af en millimeter* (ch54 ¶23);
  - *mindre end en sømil* next to *over ti kilometer* for "a mile … seven miles" in the same paragraph (ch134 ¶14).
- **Grammar:**
  - *kisten-redningsbøjen*;
  - *Den samme* for *Det samme*;
  - the imperatives *klapre* and *Give*;
  - *på anden dagen*;
  - *et populært kosmetik*;
  - *sin hakkebræt*.
- **Style:**
  - *i strømpesokker*, ×2 in the sample;
  - a garbled *Hvem andre end ingen ringere fyrste end*;
  - *forliste* used as a noun;
  - the calques *af deres egne* and *af mine egne*;
  - *forvildet … forvilder*;
  - the ship name *den lille Mosset*;
  - leftover *Mr.*;
  - *læsejl* next to *lisesejl*.
- **Found by whole-book greps outside the sample:**
  - 7 more *aborre*;
  - *blev sigtet* ("was charged" or "was sieved") for "was sighted", ×2;
  - the added gloss *»Fryd«*;
  - 2 more *strømpesokker*;
  - 2 *foragteligt* where the source means "contemptuously";
  - the spelling *drug* for the book's own term *drugg*;
  - unit errors in ch105 ¶5 and ch134 ¶5.

## Book-wide mechanical fixes

- **Nested quotes:** 30 nested quotations in straight `'…'` (ch9, ch16, ch17) are now ›…‹. Dialect apostrophes (*ska'*, *ka'*, *bli'r*) are untouched.
- **`Mr.`/`mr.`:** 8 left in ch22 are now *Hr.*/*hr.*, the house style used elsewhere in the book.
- **Danish spelling:**
  - *Town-Ho's* → *Town-Hos*;
  - *mersrå'en* → *mersråen*, and *bovenbramrå'en* → *bovenbramråen*;
  - *Kana'an* → *Kanaan*.

## Fixes (sample and greps)

| Location | Severity | Issue | Before | After |
|---|---|---|---|---|
| ch25 ¶2 | style (precision) | contemptuously→foragtende | tænker vi ringe og foragteligt om | tænker vi ringe og foragtende om |
| ch86 ¶9 | style (precision) | contemptuously→foragtende | hovedsagelig og foragteligt halen | hovedsagelig og foragtende halen |
| ch1 ¶4 | meaning | 'outermost edge' rendered 'innermost' | undtagen landets allerinderste kant | undtagen landets alleryderste kant |
| ch136 ¶3 | grammar | compound | skød kisten-redningsbøjen | skød kisteredningsbøjen |
| ch131 ¶1 | grammar | compound | kisten-redningsbøjen svingede | kisteredningsbøjen svingede |
| ch131 ¶1 | meaning | removed added gloss »Fryd« (no additions); calque 'fejlnavngivet'; 'blev sigtet' = was ch… | og et andet skib, højst elendigt fejlnavngivet Delight, »Fryd«, blev sigtet. | og et andet skib, der med den sørgeligste urette hed Delight, kom i sigte. |
| ch128 ¶1 | meaning | 'sigtet' (charged/sieved) for sighted | Næste dag blev et stort skib, Rachel, sigtet, der holdt | Næste dag kom et stort skib, Rachel, i sigte, der holdt |
| ch27 ¶9 | style | 'strømpesokker' | på knap to meter i strømpesokker | på knap to meter på strømpefødder |
| ch27 ¶9 | grammar | agreement | Den samme, siger jeg, fordi | Det samme, siger jeg, fordi |
| ch105 ¶6 | style | 'strømpesokker' | en moderne mand fra Kentucky i strømpesokker | en moderne mand fra Kentucky på strømpefødder |
| ch108 ¶15 | style | 'strømpesokker' | femten meter høj i strømpesokker | femten meter høj på strømpefødder |
| ch4 ¶3 | style | 'strømpesokker' | ned ad trappen på strømpesokker | ned ad trappen på strømpefødder |
| ch40 ¶20 | grammar | imperative | Så klapre med tænderne | Så klapr med tænderne |
| ch48 ¶24 | meaning | truck = flagknap (not 'flaske-') | sunket ned til flaskeknapperne, hætterne | sunket ned til flagknapperne, hætterne |
| ch54 ¶23 | units | 'within an inch' converted to 'a couple of millimetres' (changes the measure) | rystede nu den tunge kølle et par millimeter fra hans tænder | rystede nu den tunge kølle en tomme fra hans tænder |
| ch54 ¶23 | units | 'thousandth part of an inch' → millimetre | Uden at vige en tusindedel af en millimeter | Uden at vige så meget som en tusindedel af en tomme |
| ch58 ¶2 | grammar | 'På anden dagen' | På anden dagen sås | Den anden dag sås |
| ch62 ¶2 | meaning | steersman ≠ styrmand (mate) | med bådføreren, eller hvaldræberen, som midlertidig styrmand, | med bådføreren, eller hvaldræberen, som midlertidig rorsmand, |
| ch73 ¶28 | grammar | imperative | »Give ham en god dukkert i hvert fald.« | »Giv ham en god dukkert i hvert fald.« |
| ch94 ¶3 | grammar | 'kosmetik' is uncountable | et så populært kosmetik i gamle dage | et så populært skønhedsmiddel i gamle dage |
| ch131 ¶4 | grammar | gender | fra sin hakkebræt | fra sit hakkebræt |
| ch24 ¶13 | style | garbled double construction | Hvem andre end ingen ringere fyrste end Alfred den Store | Hvem andre end en så fornem fyrste som Alfred den Store |
| ch93 ¶10 | style | 'forliste' as noun | selv en anden ensom forliste, om end | selv en anden ensom skibbruden, om end |
| ch101 ¶2 | style | calque 'of their own' | et opdagelseshvalfangerskib af deres egne | et opdagelseshvalfangerskib for egen regning |
| ch101 ¶11 | style | calque 'of my own' | nogle supplerende tabeller af mine egne | nogle supplerende tabeller selv |
| ch107 ¶4 | style | repetition | En forvildet landfugl med sær fjerdragt forvilder sig om bord | En vildfaren landfugl med sær fjerdragt forvilder sig om bord |
| ch87 ¶19 | style | term spelling (drugg) | at denne drug bruges | at denne drugg bruges |
| ch87 ¶19 | style | term spelling (drugg) | den slæbende drugs enorme | den slæbende druggs enorme |
| ch126 ¶5 | meaning | 'perch' rendered as aborre (the fish) | siddet længe på sin aborre | siddet længe på sit udkigssted |
| ch130 ¶9 | meaning | perch = aborre (fish) | hejse ham op på hans aborre | hejse ham op på hans udkigssted |
| ch133 ¶9 | meaning | perch = aborre (fish) | Ahab havde nu nået sin endelige aborre, et par meter | Ahab havde nu nået sit endelige udkigssted, et par meter |
| ch133 ¶40 | meaning | perch = aborre (fish) | hejse ham op på hans aborre | hejse ham op på hans udkigssted |
| ch134 ¶14 | meaning | perch = aborre (fish) | knap havde Ahab nået sin aborre | knap havde Ahab nået sit udkigssted |
| ch134 ¶17 | meaning | perch = aborre (fish) | blev firet ned fra sin aborre | blev firet ned fra sit udkigssted |
| ch135 ¶38 | meaning | perch = aborre (fish) | der netop havde nået den aborre | der netop havde nået det udkigssted |
| ch135 ¶60 | meaning | perch = aborre (fish) | på deres engang så høje aborrer | på deres engang så høje udkigssteder |
| ch134 ¶5 | units | keep Melville's figure; paragraph mixed km with a quarter-league joke | vil denne hval have tilbagelagt over tre hundrede kilometer | vil denne hval have tilbagelagt to hundrede sømil |
| ch134 ¶5 | units | 'ninety-three leagues and a quarter' → '517¼ km' destroyed the precision joke | nøjagtig fem hundrede og sytten og en kvart kilometer fra sin havn | nøjagtig treoghalvfems mil og en kvart fra sin havn |
| ch134 ¶14 | units | same paragraph used sømil for 'a mile'; keep Melville's seven miles | på en afstand af over ti kilometer | på en afstand af syv sømil og mere |
| ch105 ¶5 | units | Melville gives both units deliberately; DA dropped one | som hundrede og ti meter lange. | som hundrede og tyve yards lange, det vil sige tre hundrede og tres fod. |
| ch105 ¶5 | units | omitted second unit restored | rethvalen til hundrede meter. | rethvalen til hundrede meter, eller tre hundrede og otteogtyve fod. |
| ch128 ¶7 | style | lowering term unified (sætte bådene ud) | straks blevet firet ned for at tage jagten op | straks blevet sat ud for at tage jagten op |
| ch128 ¶7 | style | lowering term unified | standsede for at fire sine reservebåde ned og ro | standsede for at sætte sine reservebåde ud og ro |
| ch128 ¶7 | style | lowering term unified | og firet bådene ned igen | og sat bådene ud igen |
| ch128 ¶7 | style | studding-sail: book uses lisesejl (ch41, 51, 87) | læsejl på læsejl | lisesejl på lisesejl |
| ch133 ¶15 | style | lowering term unified | Snart var alle bådene undtagen Starbucks firet ned | Snart var alle bådene undtagen Starbucks sat ud |
| ch134 ¶24 | style | lowering term unified | det firede en båd ned, samlede | det satte en båd ud, samlede |
| ch135 ¶11 | style | lowering term unified | til, at vi kan fire ned endnu | til, at vi kan sætte bådene ud endnu |
| ch135 ¶13 | style | lowering term unified | I rette tid blev bådene firet ned | I rette tid blev bådene sat ud |
| ch105 ¶5 | units | paragraph compares historical figures in Melville's units; keep 800 feet | andre, der var to hundrede og fyrre meter lange | andre, der var otte hundrede fod lange |

Book-wide replacements (one pattern, several paragraphs):

- Danish genitive/apostrophe spelling: 7 paragraph(s) (ch6 ¶5, ch22 ¶14, ch35 ¶7, ch40 ¶51, ch54 ¶3, ch54 ¶10, ch71 ¶7)
- Mr./mr. left in ch22; house style is hr.: 4 paragraph(s) (ch22 ¶2, ch22 ¶6, ch22 ¶19, ch22 ¶20)
- ship name 'the Moss' rendered 'Mosset' (den lille Mosset: gender clash); glossary keeps ship names: 4 paragraph(s) (ch13 ¶2, ch13 ¶6, ch13 ¶7, ch15 ¶1)
- studding-sail term unified to lisesejl: 3 paragraph(s) (ch133 ¶12, ch133 ¶40, ch133 ¶50)

## Checked and found consistent

- **Names:** Ismael, Queequeg, Ahab, Starbuck, Stubb, Flask, Tashtego, Daggoo, Fedallah, Pip, Peleg, Bildad, fader Mapple, Elias, Fleece, Perth and Dough-Boy.
- **Ships:** the ship names follow the glossary.
- **The White Whale:** *Den Hvide Hval* follows EN's capitalisation exactly (capitalised exactly where EN capitalises).
- **Fixed terms:** *kaskelot*, *rethval*, *harpunér*, *kogeværk*, *flænsning*, *spæk*, *spermacet*, *drugg* (defined in ch87) and *hundevagten* for the middle watch, which is correct.
- **Address:** Ismael says du to the reader; De is used for the Limeños and for Bunger.
  - One minor mixed case was left as drafted: Steelkilt's *»Hr. Radney, jeg vil ikke adlyde dig«* (ch54 ¶23).
- **Punctuation:** dashes are – and quotation marks are »…«.
- **Other:** no English is left over.

## Decisions and open questions for Anders

1. **Metric units — recommend restoring Melville's units.**
   - **What the draft does:** it converts feet, inches, yards, fathoms, gallons, pints, pounds, miles and leagues to metric at about 170 sites in 138 paragraphs. The arithmetic is mostly accurate.
   - **Why restore the source units:**
     - **Fidelity:** Tinct's rule is faithful translation with no additions. Melville's figures are documentary, not decorative: "seventy-two feet" for the Tranque skeleton, the rib and vertebra table in ch103, Scoresby's tons, "ninety-three leagues and a quarter". Rounding them into metres turns his precision into the translator's estimate.
     - **Coherence:**
       - The draft keeps *favne*, *pund*, *fod* and *tommer* in other places.
       - It puts metres and *favn* in one sentence (ch41 ¶19: *femten centimeter … en favn*).
       - It renders "miles" variously as *kilometer*, *sømil* and *mil*.
     - **Errors the conversion introduced:** some of these are fixed above. The worst: "inch" → *et par millimeter*; 93¼ leagues → *fem hundrede og sytten og en kvart kilometer*, which destroys the joke; and dropping Melville's deliberate double units in ch105.
     - **House style:** the live Danish Moby-Dick keeps *fod* (86×) and *favne* (26×).
     - **Readability:** Danish literary usage reads *fod*, *tommer*, *favne*, *mil* and *sømil* naturally.
   - **What I did:** I fixed only the clearly wrong conversions. Four of them now use source units: ch54 ¶23, ch105 ¶5, ch134 ¶5 and ch134 ¶14.
   - **What remains:** the other metric sites are listed in Appendix A, ready for a units-only pass if you agree. That pass is about one to two hours of careful editing.
   - **If you prefer metric:** the remaining conversions are arithmetically sound and can stay.
2. **ch131 »Fryd« gloss — removed.**
   - Writing *Delight, »Fryd«* added a word that is not in the source.
   - The clause now reads *et andet skib, der med den sørgeligste urette hed Delight, kom i sigte*. This conveys "most miserably misnamed" without glossing, and it also fixes *blev sigtet*.
   - Alternative, if you want the irony to land for every reader: translate the name (*Glæden*). This follows the book's own precedent, *Rosenknoppen* for the Rose-Bud.
3. **"Lowering" — unified.**
   - The hunting sense, putting the boats out to chase, is now *sætte bådene ud* everywhere. The draft used it about 30× in ch26–100; ch128 ¶7, ch133 ¶15, ch134 ¶24 and ch135 ¶11 and ¶13 were changed from *fire ned*.
   - *fire ned* is kept where something is physically lowered on a line: Ahab's boat with him seated in it (ch100 ¶7), the blubber hook (ch100 ¶9), casks into the hold (ch110 ¶1), and Ahab from the masthead (ch134 ¶17, ch135 ¶12).
   - Recommendation: keep this split.
4. **Other glossary choices to confirm:**
   - *lisesejl* is now the book-wide term for "studding-sail". It replaced *læsejl* in ch128 and ch133; both words are Danish.
   - The ship name *the Moss* is now kept as *Moss*, per the glossary.
   - *sir* is kept in speech, per the drafter's policy.
   - The coined term *drugg* is acceptable.
5. **Not changed:** *æbleskiver* for Dutch "doughnuts" (ch65) is a mild domestication; *oliekager* is kept alongside it. Flagged only.

## Gates after the fixes

- Gate script:
  - 136/136 chapters, with paragraph counts 1:1 with EN and with the draft (2,432);
  - DA/EN character ratio 0.937–1.101;
  - zero English paragraphs;
  - JSON matches `chapters/*.txt`;
  - emphasis markers unchanged.
- `books/danish-lint.py`, wrapped read-only: 4 BROKEN-COMPOUND false positives, all real word pairs: *brogede ko*, *slidte lu*, *tvivl åd*, *amputeret so*.

## Appendix A — paragraphs still using metric units (ch:¶)

1:4, 2:4, 3:4, 3:22, 3:28, 4:3, 6:9, 9:12, 10:4, 16:5, 16:65, 17:12, 17:23, 19:34, 23:2, 27:9, 28:5, 29:3, 32:24, 32:33, 32:34, 32:35, 32:41, 32:42, 35:3, 35:4, 35:6, 35:9, 35:13, 36:37, 36:49, 41:19, 42:27, 45:8, 45:11, 45:18, 46:3, 48:16, 48:24, 48:28, 54:21, 54:29, 54:86, 54:89, 55:4, 55:7, 58:1, 59:6, 59:11, 60:4, 60:5, 60:7, 60:8, 61:6, 61:8, 61:20, 62:2, 63:2, 64:1, 64:8, 65:3, 66:4, 67:2, 68:2, 69:2, 70:2, 71:5, 71:17, 72:1, 73:4, 74:6, 74:12, 75:3, 75:4, 76:2, 77:4, 77:6, 78:1, 80:2, 80:6, 81:12, 81:18, 81:29, 81:30, 81:40, 84:4, 84:6, 85:2, 85:3, 85:7, 86:2, 86:11, 86:12, 87:21, 87:22, 87:26, 87:27, 88:3, 89:7, 94:12, 95:1, 95:2, 96:2, 96:11, 98:3, 99:9, 100:28, 101:4, 103:2, 103:5, 103:7, 103:8, 103:11, 104:1, 104:7, 104:10, 105:3, 105:5, 105:8, 108:15, 109:7, 111:1, 123:8, 125:25, 126:19, 128:7, 128:8, 129:10, 130:9, 130:11, 131:1, 133:9, 133:23, 133:25, 133:28, 135:31, 135:57, 135:61
