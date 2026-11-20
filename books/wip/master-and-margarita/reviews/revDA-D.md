# Review DA-D: modern-da, chapters 26–33 (Epilogue)

I compared every paragraph of `editions/master-and-margarita-modern-da.json` against `editions/master-and-margarita-original-ru.json` (806 paragraphs, all aligned 1:1) and checked them against `GLOSSARY.md` and `HARMONISATION.md`. I did not consult any published translation. The things Anders already approved (style, glossary, De/du, «kejseren», racial terms, Bezdomnyj, «?..») were not reopened.

The fixes are in `revDA-D.json`. In each one, `old` occurs exactly once in its paragraph, and all 47 fixes apply in sequence without conflict. The Russian quoted in each entry was checked against the source paragraph.

## Counts

| Ch. | Paragraphs | Major | Minor | Verdict |
|---|---|---|---|---|
| 26 Begravelsen | 243 | 1 | 12 | Accept with fixes |
| 27 Enden på lejlighed nr. 50 | 117 | 0 | 6 | Accept with fixes |
| 28 Korovjevs og Behemots sidste eventyr | 110 | 2 | 6 | Accept with fixes |
| 29 Mesterens og Margaritas skæbne er afgjort | 66 | 0 | 1 | Accept (one minor echo fix) |
| 30 Det er tid! Det er tid! | 132 | 0 | 4 | Accept with fixes |
| 31 På Spurvebjergene | 24 | 0 | 3 | Accept with fixes |
| 32 Tilgivelse og evigt tilflugtssted | 33 | 0 | 5 | Accept with fixes |
| 33 Epilog | 81 | 0 | 7 | Accept with fixes |
| **Total** | **806** | **3** | **44** | |

On the whole the translation is very good. Nothing is omitted or invented, the paragraph structure is intact, the irony and the Yershalaim register come through, the glossary is followed almost everywhere, and the typography (»…«, ›…‹, spaced en dashes, `...`) is clean. No chapter needs rework.

## The five most serious problems

1. **28:8, sense reversed (major).** Koroviev threatens the doorman: «порасскажу ему о вас таких вещей, что не пришлось бы вам покинуть ваш пост» (you may well lose your post). The Danish «at De nok ikke kom til at forlade Deres post» says the opposite.
2. **28:88, subject and object swapped (major).** «Официантов Арчибальд Арчибальдович удивил не менее, чем Софью Павловну»: Archibald astonished the waiters. The Danish «Tjenerne forbløffede Archibald Archibaldovitj…» has the waiters astonishing him.
3. **26:66, wrong method of killing (major).** The narrator says the two killers «havde skåret halsen over på Judas». Four paragraphs earlier (26:62) they stab him under the shoulder blade and in the heart. «зарезать» means to kill with a knife, not to cut a throat.
4. **27:29, wrong referent.** «лица, предъявлявшие … под видом денег черт знает что»: the things shown are passed off as money. The Danish «personer, der under foregivende af at være penge…» makes the people pretend to be money.
5. **33:41, wrong name referent.** «старой сквалыги Пороховниковой тетки» is the aunt Porokhovnikova (as in 15:107 «Hos min tante, Porokhovnikova»). The Danish «Porokhovnikovs … tante» invents a Porokhovnikov.

## Systematic pattern

- **«зарезать» → «skære halsen over».** This runs through all of ch. 26 (26:66, 88, 102, 109, 114, 227, 228, 229 ×2, 231; all are in the JSON as «stikke ihjel»). It also appears in **ch. 25** (25:107, 117, 118, 119), which is outside this review. There it is Pilate's prediction, so it is not wrong as such, but whoever owns ch. 25 should switch it to «stikke ihjel» too, so that the prediction and its fulfilment use the same verb.
- **Small echo drift in the last chapters.** Several of Bulgakov's deliberate repetitions are worded slightly differently from their first occurrence. The darkness motif «der kom (fra)» appears as «der var kommet» (29:66) and «der kom ind» (30:1). Pilate's «плохая должность» is «embede» in 26:79 but «stilling» in 32:18. The «fjortende i forårsmåneden nisan» motif gains «på … dag» in 32:18. The dog's fear of «гроза» is «uvejr» in 26:5 but «tordenvejr» in 32:16. «О боги» appears as «Åh, guder» in 33:65. «добрые люди» appears as «gode folk» in 30:44. None of these is serious alone, but together they weaken the echoes the GLOSSARY motif table exists to protect.
- **Plural «вы» with crowds.** Koroviev's speech to the shoppers (28:41, 28:45) and the cat's duel challenge (27:97) slip into «De» where GLOSSARY requires «I/jer».
- **Occasional calques.** «Alting bider» (28:26), «som sunket i vandet» (27:28), «blodig krænkelse» (31:5), «en heks er en heks» (30:15), «kedsommelig» for bored (28:62).

## Checked and left alone

- The «Ni... za...» motif (26:63), the 26:243 → 27:1 echo, the 32:33 / 33:81 closing line and «af nåle gennemstukne / gennemstukne hukommelse» all match GLOSSARY.
- Danish floors in ch. 27–28 (27:25 tredje sal, 27:68/117 fjerde sal, 27:80 anden sal, 28:108 første sal) are correct.
- «Men du milde» (26:133) is the deliberate exception recorded in HARMONISATION §5.
- «Er gut? … Gut jeg lide» (28:19, 28:21) gives the fake foreigner broken speech. It is a defensible way to render «Кароши», and I left it as a style choice.
- «Alt vil være retfærdigt» (32:20, «Все будет правильно») is arguable but within the translator's latitude.
