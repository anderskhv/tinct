# Moby-Dick — independent review of the modern-da edition

**Verdict: ready after fixes, provided Anders decides the units question (decision 1).** All fixes below are applied. The translation is strong, often elegant, and handles Melville's registers and nautical vocabulary well. The sample shows 1.5 meaning errors per 100 paragraphs, plus 0.8 unit errors, which is under the threshold. One systematic slip was found and fixed throughout: *aborre* (the fish) for Ahab's "perch", 8 times. If Anders accepts the recommendation to restore Melville's units, a units-only pass over the paragraphs listed in Appendix A is still needed before release.

**Follow-up (21 Oct 2026):** the units pass is done. All 138 paragraphs in Appendix A, plus 5 more, now use Melville's own units. See the Follow-up section at the end.

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

## Follow-up (21 Oct 2026): Melville's units restored

Decision 1 was carried out on branch `claude/danish-1021-c-review` on top of c9029f4470. Tinct's rule is faithful translation with no additions, so every converted measure now carries Melville's own figure and unit. No Anthropic API was used; every site was read EN against DA in the conversation.

- **Count:** 175 unit restorations in 143 paragraphs.
  - 138 paragraphs are the whole of Appendix A, and every listed paragraph was changed.
  - 5 more paragraphs were found by an EN→DA cross-check. It lists every EN unit word (feet, inch, yard, fathom, mile, league, gallon, pint, pound, ton, acre, rod, perch, furlong) whose paragraph has no matching Danish unit. The five:
    - ch6 ¶4 *to tønder land* for "two acres";
    - ch41 ¶13 *hundreder af sømil* for "hundreds of leagues";
    - ch45 ¶21 *fire hundrede og halvtreds sømil* for "one hundred and fifty leagues". This tripled the figure; it is now *hundrede og halvtreds mil*;
    - ch91 ¶25 *en deciliter* for "a gill";
    - ch102 ¶14 *de små brøkdele* for "the odd inches".
- **Unit vocabulary.** This matches the live `moby-dick-modern-da.json` and this book's own forms:
  - feet → *fod* (*kvadratfod*, *kubikfod*);
  - inches → *tomme/tommer*;
  - yards → *yards* (*kubikyards*);
  - fathoms → *favn/favne*;
  - pounds → *pund*;
  - tons → *ton/tons*;
  - gallons → *gallon/gallons*;
  - pints → *pint*;
  - acres → *acres*;
  - furlongs → *furlongs*;
  - rods and perches → *rode/roder*;
  - a gill → *pægl*, to match ch101 ¶11's *potter og pægle* for "quarts and gills".
- **Miles and leagues:**
  - Miles on land, or in general, are *mil*. Miles at sea in a chase or a search are *sømil*, as in the live edition and in ch134 ¶14.
  - Leagues are *mil*, the Danish literary convention (Verne's *lieues*). This follows the review's own ch134 ¶5 fix (*treoghalvfems mil og en kvart*).
  - **For Anders:** the live edition renders leagues as *sømil*. That changes the figure threefold, so it was not followed.
- **What was kept:** ch105 ¶5 *hundrede meter*. Melville himself quotes Lacépède in metres ("one hundred meters, or three hundred and twenty-eight feet").
- **Metric grep over all 136 chapters, after the pass:**
  - Terms searched: meter, km, kilometer, centimeter, millimeter, kilo, liter, deciliter, gram, hektar, kvadratmeter and kubikmeter.
  - The only unit hit left is the Lacépède quote above.
  - The other hits are words that only contain the string: *kronometer*, *barometret*, *kometer*, *gourmeter*, *termometret*, *diameter*, and *kvadratmil* (restored).
- **Structure:** paragraph structure is 1:1. Only those 143 paragraphs differ from c9029f4470, and the emphasis markers are unchanged.
- **Gates after the follow-up:**
  - 136/136 chapters and 2,432 paragraphs, 1:1 with EN;
  - DA/EN ratio 0.937–1.101;
  - zero English paragraphs;
  - JSON matches `chapters/*.txt`;
  - `books/danish-lint.py`, wrapped read-only: 0 issues.
- **New candidate:** `moby-dick-modern-da.json`
  - git blob `492ddebc28cff465604fc912aa28deb2e29ba726`;
  - sha256 `850ab16aa03e6c275b98b163ac8bd2237c861555cd157335a6aa2a72ee67ad76`.
  - The previous candidate at c9029f4470 was blob `9dfdf4dd662f98c9345c701601ab44967a8b97c4`.
  - The EN source blob is still `be7c38ad…` on origin/main 483f00ca0b.

Appendix A is now resolved. The full list of restorations:

| ch:¶ | Before | After |
|---|---|---|
| 1:4 | kilometervis af dem – milevis | milevis af dem – mil efter mil |
| 2:4 | en kvart meter tyk | ti tommer tyk |
| 3:4 | hele tolv meter | hele fyrre fod |
| 3:22 | godt en meter og firs høj | fulde seks fod høj |
| 3:28 | tredive centimeter for kort | en fod for kort |
| 3:28 | tredive centimeter for smal | en fod for smal |
| 3:28 | omkring ti centimeter højere | omkring fire tommer højere |
| 4:3 | en eneste centimeter | en eneste tomme |
| 6:4 | slår sine to tønder land | slår sine to acres |
| 6:9 | mange kilometer ude på havet | mange mil ude på havet |
| 9:12 | mere end tre tusind kilometer vest | mere end to tusind mil vest |
| 10:4 | omkring tredive tusind kilometer hjemmefra | omkring tyve tusind mil hjemmefra |
| 16:5 | omkring tre meter højt | omkring ti fod højt |
| 16:65 | stikker måske en kvart meter, eller ti favne | stikker måske ti tommer, eller ti favne |
| 17:12 | omkring halvanden kilometer herfra | omkring en mil herfra |
| 17:23 | ikke en meter og tyve borte | ikke fire fod borte |
| 19:34 | mere end hundrede meter | mere end hundrede yards |
| 23:2 | dette femten centimeter lange kapitel | dette seks tommer lange kapitel |
| 27:9 | på knap to meter på strømpefødder | af seks fod og fem tommer på strømpefødder |
| 28:5 | cirka en centimeter ned | cirka en halv tomme ned |
| 29:3 | femten centimeter fra | seks tommer fra |
| 32:24 | en lille meter lang | en tre-fire fod lang |
| 32:33 | fra fire en halv til halvottende meter lang | fra femten til femogtyve fod lang |
| 32:34 | omkring fem til fem en halv meter lang | omkring seksten til atten fod lang |
| 32:34 | mere end hundrede liter olie | mere end tredive gallons olie |
| 32:35 | omkring fem meter lang, mens hornet i gennemsnit er halvanden meter, skønt nogle overstiger tre og endda når fire en halv meter | omkring seksten fod lang, mens hornet i gennemsnit er fem fod, skønt nogle overstiger ti og endda når femten fod |
| 32:41 | ikke overstiger halvanden meter | ikke overstiger fire eller fem fod |
| 32:42 | fire gode liter god olie | én god gallon god olie |
| 35:3 | omkring femogfyrre meter oppe i luften | omkring hundrede og halvtreds fod oppe i luften |
| 35:4 | tredive meter over de tavse dæk | hundrede fod over de tavse dæk |
| 35:6 | en snes meter fra polen | tre-fire roder fra polen |
| 35:9 | en halv liter spermacet rigere | en eneste pint spermacet rigere |
| 35:13 | et par centimeter | en tomme |
| 36:37 | én for hver to centimeter | én for hver tre fjerdedele tomme |
| 36:49 | knap en meter lange | omkring tre fod lange |
| 41:13 | hundreder af sømil borte | hundreder af mil borte |
| 41:19 | en femten centimeter lang klinge | en seks tommer lang klinge |
| 42:27 | tusinder af kilometer fra Oregon | tusinder af mil fra Oregon |
| 45:8 | ikke en liter, I brænder | ikke en gallon, I brænder |
| 45:11 | få kilometer fra katastrofens | få mil fra katastrofens |
| 45:18 | mindst en meter op af vandet | mindst tre fod op af vandet |
| 45:21 | omkring fire hundrede og halvtreds sømil fra Amerikas fastland | omkring hundrede og halvtreds mil fra Amerikas fastland |
| 46:3 | krydse tre tusind kilometer land | krydse to tusind mil land |
| 48:16 | så meget som en centimeter | så meget som en tomme |
| 48:24 | omkring tres centimeter op | omkring to fod op |
| 48:28 | femten meter højere | halvtreds fod højere |
| 54:21 | køllen få centimeter fra hans ansigt | køllen få tommer fra hans ansigt |
| 54:29 | Gennem fem hundrede og firs kilometer | Gennem tre hundrede og tres mil |
| 54:86 | inden for halvtreds meter fra skibet | inden for halvtreds yards fra skibet |
| 54:89 | otte hundrede kilometer borte | fem hundrede mil borte |
| 55:4 | stikker knap et par centimeter dybt | stikker knap en tomme dybt |
| 55:7 | karnapvindue på omkring halvanden meter | karnapvindue på omkring fem fod |
| 58:1 | Kilometer efter kilometer bølgede | Mil efter mil bølgede |
| 59:6 | flere hundrede meter lang og bred | flere furlongs lang og bred |
| 59:11 | mere end seks, endog ni meter lange | mere end tyve, endog tredive fod lange |
| 60:4 | knap to centimeter tyk | to tredjedele tomme tyk |
| 60:4 | omkring femoghalvtreds kilo | hundrede og tyve pund |
| 60:4 | noget over tre hundrede og tres meter | noget over to hundrede favne |
| 60:5 | knap en meter i diameter | næsten tre fod i diameter |
| 60:5 | kun er godt en centimeter tykke | kun er en halv tomme tykke |
| 60:7 | Tyve-fyrre meter af den | Ti-tyve favne af den |
| 60:8 | hvalbådens centimetertykke hvide cedertræ | hvalbådens halvtommetykke hvide cedertræ |
| 61:6 | ikke halvfjerds meter borte | ikke fyrre favne borte |
| 61:8 | lige op tolv meter i luften | lige op fyrre fod i luften |
| 61:20 | sydede hundreder af meter i deres kølvand | sydede flere furlongs i deres kølvand |
| 62:2 | en afstand på seks-ni meter | en afstand på tyve-tredive fod |
| 63:2 | omkring tres centimeter lang | omkring to fod lang |
| 64:1 | med halvanden kilometer i timen | med en mil i timen |
| 64:8 | kun få centimeter fra deres hjerter | kun få tommer fra deres hjerter |
| 65:3 | en kødpie på næsten tredive meter | en kødpie på næsten hundrede fod |
| 66:4 | fra seks til ni meter lang | fra tyve til tredive fod lang |
| 67:2 | omkring femogfyrre kilo | omkring hundrede pund |
| 68:2 | fra tyve-femogtyve til tredive og fyrre centimeter tykt | fra otte eller ti til tolv og femten tommer tykt |
| 69:2 | for hver meter, det flyder, svulmer noget, der ligner kvadratmeter af hajer og kubikmeter af fugle | for hver rode, det flyder, svulmer noget, der ligner kvadratroder af hajer og kubikroder af fugle |
| 70:2 | omkring to en halv til tre meter mellem sig | omkring otte-ti fod mellem sig |
| 70:2 | mange meter dybt ind i kødet | mange fod dybt ind i kødet |
| 71:5 | nogle få meter mellem sig og skibet | nogle få yards mellem sig og skibet |
| 71:17 | omkring halvtreds meter borte | omkring halvtreds yards borte |
| 72:1 | omkring tre meter under dækkets niveau | omkring ti fod under dækkets niveau |
| 73:4 | inden for femten meter af plankerne | inden for tre roder af plankerne |
| 73:4 | kun at vinde en meter eller to | kun at vinde et par fod |
| 74:6 | mange kubikmeter massivt hoved | mange kubikfod massivt hoved |
| 74:12 | omkring fem meter lang | omkring femten fod lang |
| 75:3 | omkring seks meter i længden og halvanden meter i dybden | omkring tyve fod i længden og fem fod i dybden |
| 75:3 | knap to tusind liter olie og mere | omkring fem hundrede gallons olie og mere |
| 75:4 | omkring tredive centimeter bred | omkring en fod bred |
| 75:4 | næsten fire meter højt | omkring tolv fod højt |
| 76:2 | næsten seks meter tilbage fra panden | næsten tyve fod tilbage fra panden |
| 77:4 | knap to tusind liter spermacet | omkring fem hundrede gallons spermacet |
| 77:6 | til fireogtyve meter for en hval | til firs fod for en hval |
| 77:6 | mere end otte meter for tøndens dybde | mere end seksogtyve fod for tøndens dybde |
| 78:1 | omkring seks meter af stangen | omkring tyve fod af stangen |
| 80:2 | mindst seks meter i længden | mindst tyve fod i længden |
| 80:2 | mere end femogtyve centimeter langt | mere end ti tommer langt |
| 80:2 | mindst seks meter fra dens tilsyneladende pande | mindst tyve fod fra dens tilsyneladende pande |
| 80:2 | de mange kubikmeter i dens spermacetmagasin | de mange kubikyards i dens spermacetmagasin |
| 80:6 | femogtyve centimeter i bredden og tyve i højden | ti tommer i bredden og otte i højden |
| 80:6 | i mange meter efter | i mange fod efter |
| 81:12 | et par tusind kvadratmeter mavepine | en halv acre mavepine |
| 81:18 | ikke en centimeter | ikke en tomme |
| 81:29 | noget mindre end to hundrede kvadratmeter | noget mindre end to tusind kvadratfod |
| 81:29 | knap fire hundrede meter ocean | to hundrede favne ocean |
| 81:30 | Ikke tyve centimeter lodret tov | Ikke otte tommer lodret tov |
| 81:40 | få centimeter under dem | få tommer under dem |
| 84:4 | omkring tre-fire meter langt | omkring ti-tolv fod langt |
| 84:6 | tolv meter forude | fyrre fod forude |
| 84:6 | fire en halv meter op i luften | femten fod op i luften |
| 85:2 | mindst to en halv meter under overfladen | mindst otte fod under overfladen |
| 85:3 | to kilometer nede i havet | tusind favne nede i havet |
| 85:3 | sejler to kilometer under sollyset | sejler tusind favne under sollyset |
| 85:7 | løber nu et par meter vandret | løber nu flere fod vandret |
| 86:2 | mindst fem kvadratmeter | mindst halvtreds kvadratfod |
| 86:2 | mindre end et par centimeters tykkelse | mindre end en tommes tykkelse |
| 86:2 | overstige seks meter i bredden | overstige tyve fod i bredden |
| 86:11 | giver genlyd i kilometervis | giver genlyd i milevis |
| 86:12 | mindst ni meter af dens krop | mindst tredive fod af dens krop |
| 87:21 | mindst fem-otte kvadratkilometer | mindst to-tre kvadratmil |
| 87:22 | omkring fire meter i længden og knap to meter i omkreds | omkring fjorten fod i længden og seks fod i omkreds |
| 87:26 | flere hundrede meter tov | flere hundrede favne tov |
| 87:27 | havet mange meter omkring | havet flere roder omkring |
| 88:3 | ikke over fem-seks meter om livet | ikke over et halvt dusin yards om livet |
| 89:7 | et tyve centimeter tykt kabel | et ni tommer tykt kabel |
| 91:25 | ikke en deciliter olie | ikke en pægl olie |
| 94:12 | et par centimeter tyk | en tomme tyk |
| 95:1 | næsten tredive centimeter i diameter | næsten en fod i diameter |
| 95:2 | omkring en meter fra den spidse ende | omkring tre fod fra den spidse ende |
| 96:2 | omkring tre gange to en halv meter og halvanden meter høj | omkring ti gange otte fod og fem fod høj |
| 96:11 | millioner af kilometer af ørkener | millioner af mil af ørkener |
| 98:3 | den sidste halve liter er i tønden | den sidste pint er i tønden |
| 99:9 | et sted omkring seksten meter lange | et sted omkring ni favne lange |
| 100:28 | mere end tres og nogle centimeter langt | mere end to fod og adskillige tommer langt |
| 101:4 | med fyrre liter i timen | med ti gallons i timen |
| 102:14 | så jeg brød mig ikke om de små brøkdele. Ej heller bør små brøkdele, i grunden, | så jeg brød mig ikke om de overskydende tommer. Ej heller bør tommer, i grunden, |
| 103:2 | på atten meters længde | på tres fods længde |
| 103:2 | mellem seksogtyve og syvogtyve meter lang og noget mindre end tolv meter i sit største omfang | mellem femogfirs og halvfems fod lang og noget mindre end fyrre fod i sit største omfang |
| 103:5 | målte kaskelottens skelet på Tranque toogtyve meter | målte kaskelottens skelet på Tranque tooghalvfjerds fod |
| 103:5 | må han have været syvogtyve meter lang | må han have været halvfems fod lang |
| 103:5 | Af disse toogtyve meter udgjorde hans kranium og kæbe omkring seks meter, hvilket efterlod omkring femten meter jævn rygrad | Af disse tooghalvfjerds fod udgjorde hans kranium og kæbe omkring tyve fod, hvilket efterlod omkring halvtreds fod jævn rygrad |
| 103:7 | var næsten to meter langt | var næsten seks fod langt |
| 103:7 | som målte lidt over to en halv meter | som målte otte fod og nogle få tommer |
| 103:7 | kun spændte godt halvanden meter | kun spændte fem fod og nogle få tommer |
| 103:8 | mindst fem meter, mens det tilsvarende ribben kun målte lidt over to en halv | mindst seksten fod, mens det tilsvarende ribben kun målte lidt over otte |
| 103:11 | lidt under en meter bred og mere end 1,2 meter dyb | lidt under tre fod bred og mere end fire fod dyb |
| 103:11 | kun fem centimeter bred | kun to tommer bred |
| 104:1 | hans mange hundrede meter fra blåsthul til hale og de meter, han måler om livet | hans furlongs fra blåsthul til hale og de yards, han måler om livet |
| 104:7 | alle de 40.000 kilometer af denne verdens omkreds | alle de 25.000 mil af denne verdens omkreds |
| 104:10 | skyder tre kilometer ud i havet | skyder to mil ud i havet |
| 105:3 | under enogtyve meter langt | under halvfjerds fod langt |
| 105:3 | giver toogtyve meter for skelettet | giver tooghalvfjerds fod for skelettet |
| 105:3 | næsten tredive meter lange ved fangsten | næsten hundrede fod lange ved fangsten |
| 105:5 | dækkede mange tønder land | dækkede mange acres |
| 105:8 | for en dollar pr. centimeter | for en dollar pr. tomme |
| 108:15 | femten meter høj på strømpefødder | halvtreds fod høj på strømpefødder |
| 108:15 | arme en meter tykke ved håndleddet | arme tre fod tykke ved håndleddet |
| 108:15 | omkring tusind kvadratmeter fin hjerne | omkring en kvart acre fin hjerne |
| 109:7 | sejler tredive tusind kilometer for at få | sejler tyve tusind mil for at få |
| 111:1 | Dette fredfyldte ocean rullede tusinder af kilometer blåt ud mod øst fra mig. | Dette fredfyldte ocean rullede tusind mil blåt ud mod øst fra mig. |
| 123:8 | Land er tusinder af kilometer borte | Land er hundreder af mil borte |
| 125:25 | Femogfyrre kilo ler i dusør | Hundrede pund ler i dusør |
| 125:25 | halvanden meter høj | fem fod høj |
| 126:19 | hver en meter lang | hver tre fod lang |
| 128:7 | en syv-otte kilometer fra skibet | en fire-fem sømil fra skibet |
| 128:8 | en syv-otte kilometer fra hinanden | en fire-fem sømil fra hinanden |
| 129:10 | halvanden meter høj | fem fod høj |
| 130:9 | kilometer efter kilometer | sømil efter sømil |
| 130:11 | tre hundrede meter lige op i luften | tusind fod lige op i luften |
| 131:1 | i en højde af omkring to en halv meter | i en højde af otte-ni fod |
| 133:9 | et par meter over de andre udkigsmænd | nogle fod over de andre udkigsmænd |
| 133:23 | inden for få meter | inden for få yards |
| 133:25 | inden for femten centimeter af Ahabs hoved | inden for seks tommer af Ahabs hoved |
| 133:28 | en seks meter eller mere op af vandet | en tyve fod eller mere op af vandet |
| 135:31 | Knust ni meter op i vejret | Knust tredive fod op i vejret |
| 135:57 | kun få meter fra Ahabs båd | kun få yards fra Ahabs båd |
| 135:61 | nogle få centimeter af det lodrette rundholt | nogle få tommer af det lodrette rundholt |
| 135:61 | lange, flagrende stykker af flaget | lange, flagrende yards af flaget |
