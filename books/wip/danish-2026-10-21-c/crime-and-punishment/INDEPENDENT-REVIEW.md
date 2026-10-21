# Crime and Punishment — independent review of the modern-da edition

**Verdict: ready after fixes.** All fixes below are applied. This is the cleanest of the three drafts. The Danish is fluent and native-sounding, the register suits each character, and names and patronymics are consistent. The sample shows 0.4 meaning errors per 100 paragraphs. What remains is minor: about 2 grammar slips per 10,000 words, which a page-by-page visual QA pass would partly catch.

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

- **Paragraphs read:** 473 of 3,904, which is about 14% of the Danish text and about 27,500 Danish words.
  - Ch1 (part 1 ch1) in full, 52 paragraphs.
  - Ch41 (epilogue ch2) in full, 30 paragraphs.
  - 391 sampled paragraphs, a 10% sample.
- **Sample, as ch:¶:** 2:2, 2:16, 2:20, 2:28, 2:35, 2:46, 3:18, 3:25, 3:30, 4:46, 5:1, 5:9, 5:10, 5:23, 5:51, 5:55, 5:67, 5:68, 5:71, 6:6, 6:11, 6:21, 7:3, 7:4, 7:28, 7:34, 7:35, 7:43, 7:44, 7:55, 7:56, 7:74, 8:8, 8:19, 8:27, 8:33, 8:35, 8:41, 8:53, 8:63, 8:96, 8:111, 8:116, 8:117, 8:119, 8:125, 8:131, 8:134, 8:143, 8:154, 8:157, 8:158, 8:165, 9:1, 9:13, 9:17, 9:28, 9:32, 9:37, 9:39, 10:4, 10:19, 10:20, 10:33, 10:38, 10:39, 10:44, 10:45, 10:49, 10:52, 10:53, 10:55, 10:66, 10:68, 10:73, 10:82, 10:99, 10:103, 10:111, 10:112, 11:10, 11:23, 11:25, 11:34, 11:38, 11:41, 11:52, 11:55, 11:64, 11:72, 11:78, 12:1, 12:3, 12:18, 12:30, 12:49, 12:65, 12:72, 12:75, 12:111, 13:4, 13:7, 13:10, 13:30, 13:46, 13:51, 13:53, 13:76, 13:92, 13:119, 13:125, 13:127, 13:144, 13:149, 13:169, 13:177, 13:187, 13:199, 13:204, 14:8, 14:13, 14:21, 14:24, 14:37, 14:40, 14:52, 14:58, 14:68, 14:73, 14:74, 14:85, 14:92, 14:99, 14:106, 14:108, 14:114, 14:120, 14:138, 14:143, 15:7, 15:12, 15:55, 15:60, 15:72, 15:74, 15:79, 15:83, 15:86, 16:5, 16:14, 16:15, 16:23, 16:25, 16:27, 16:40, 16:59, 16:60, 16:66, 16:74, 16:83, 17:7, 17:12, 17:21, 17:22, 17:27, 17:33, 17:34, 17:40, 17:63, 17:66, 17:73, 17:99, 17:104, 17:121, 17:123, 17:125, 18:10, 18:19, 18:40, 18:48, 18:49, 18:71, 18:75, 18:81, 18:113, 19:10, 19:28, 19:47, 19:48, 19:72, 19:74, 19:95, 19:100, 19:117, 19:118, 19:120, 19:134, 19:139, 19:158, 19:161, 20:16, 20:22, 20:25, 20:47, 20:53, 20:56, 21:17, 21:25, 21:40, 21:44, 21:55, 21:66, 21:91, 21:94, 21:95, 21:110, 21:115, 21:116, 21:124, 21:126, 22:3, 22:7, 22:12, 22:19, 22:24, 22:54, 22:62, 22:65, 22:67, 22:70, 22:83, 22:88, 22:92, 22:99, 22:106, 22:107, 23:11, 23:27, 23:31, 23:35, 23:47, 23:58, 24:8, 24:16, 24:18, 24:34, 24:36, 24:46, 24:49, 24:74, 24:81, 24:84, 24:92, 24:121, 24:139, 24:168, 24:169, 24:175, 24:180, 24:190, 24:203, 24:212, 25:11, 25:12, 25:26, 25:28, 25:37, 25:49, 25:53, 25:64, 25:79, 25:80, 25:97, 25:101, 26:5, 26:7, 26:24, 26:36, 26:41, 26:61, 26:71, 26:82, 27:1, 27:3, 27:4, 27:8, 27:46, 27:64, 27:66, 27:81, 27:84, 28:7, 28:15, 29:27, 29:35, 29:46, 29:50, 29:59, 29:60, 29:69, 29:71, 29:75, 30:2, 30:33, 30:39, 30:57, 30:64, 30:123, 30:152, 31:34, 31:50, 31:58, 31:60, 31:64, 31:69, 31:74, 31:77, 31:79, 31:92, 31:97, 31:103, 32:2, 32:25, 32:27, 32:38, 32:44, 33:1, 33:4, 33:5, 33:22, 33:25, 33:31, 33:38, 33:44, 33:49, 33:55, 33:74, 34:17, 34:28, 34:35, 34:36, 34:44, 34:76, 34:77, 35:12, 35:19, 35:22, 35:24, 36:4, 36:11, 36:15, 36:16, 36:18, 36:56, 36:73, 36:78, 36:92, 36:97, 36:98, 36:99, 36:108, 36:110, 36:111, 36:115, 36:117, 36:128, 37:20, 37:46, 37:53, 37:62, 38:2, 38:7, 38:8, 38:43, 38:56, 38:70, 38:72, 39:12, 39:19, 39:20, 39:25, 39:30, 39:39, 39:45, 39:51, 39:52, 39:58, 40:9, 40:13, 40:19, 40:20

## Error rate before fixes (paragraphs read)

| Severity | Issues | Per 100 paragraphs | Per 10,000 DA words |
|---|---|---|---|
| Meaning | 2 | 0.4 | 0.7 |
| Grammar | 6 | 1.3 | 2.2 |
| Style | 13 | 2.7 | 4.7 |

- **Meaning:** both errors are in ch41 ¶11.
  - *polske forvisninger* ("Polish banishments") for Polish exiles;
  - *lige så foragtelige* ("just as contemptible") for "just as contemptuous".
- **Grammar:**
  - *gav sin pludselige svaghed skylden på*;
  - a doubled *så*;
  - main-clause word order inside an *at*-clause;
  - *politiet var … ængstelig*;
  - *det ægte vare*;
  - the non-word *fjerpennet* for "featherbrained".
- **Style:**
  - English *Hey*;
  - calques such as *Åh, kære!*, *Hvorfor, er I …*, *måske godt* and *teori af sin egen*;
  - *Pyt!* for a cry of disgust;
  - a tautology (*berygtet ry*);
  - *portner* and *vicevært* used for the same porter;
  - three cases of *foragtelig* where the source means "contemptuous".
- **Systematic slip:** *foragtelig* ("contemptible") was used for "contemptuous" throughout. A whole-book grep found and fixed 18 instances. Sprognævnet accepts the older sense, but *foragtende* is the precise word, and in ch41 ¶11 the slip reverses the meaning.

## Book-wide mechanical fixes

- **Nested quotes:** in ch21–41 the draft switched from ›…‹ to straight `'…'` for nested quotations. All 128 pairs are now ›…‹, and genuine apostrophes (*hva'*, *Lazarus'*, French elisions) are untouched.
- **Porter:** the term was rendered *portner* in 12 paragraphs and *vicevært* in 46. All are now *vicevært*.
- **Per-chapter `section` labels:** all 41 chapters still carried the English label ("Part I" … "Epilogue"). Each is now the Danish title (*Første del* … *Epilog*), matching `sections[]` and the live DA file.

## Fixes (sample and greps)

| Location | Severity | Issue | Before | After |
|---|---|---|---|---|
| ch1 ¶7 | style | English 'Hey' | »Hey, du der! Tyske hattemand!« | »Hov, du der! Tyske hattemand!« |
| ch1 ¶45 | grammar | 'gav … skylden på' construction | og gav sin pludselige svaghed skylden på, at han ikke havde spist. | og mente, at hans pludselige svaghed skyldtes, at han ikke havde spist. |
| ch7 ¶28 | style | 'måske godt' calque of 'might well' | så ville han måske godt have opgivet det hele | så ville han meget vel have opgivet det hele |
| ch11 ¶52 | grammar | doubled 'så' | Da du arbejdede sammen med Dmitrij, så du så nogen på trappen | Da du arbejdede sammen med Dmitrij, så du da nogen på trappen |
| ch11 ¶52 | grammar | main-clause word order in at-clause | Har du hørt, Nikolaj, at samme dag blev en enke og hendes søster myrdet og plyndret? | Har du hørt, Nikolaj, at en enke og hendes søster blev myrdet og plyndret samme dag? |
| ch14 ¶8 | grammar | agreement + 'anxious not to' meaning | Politiet var naturligvis ængstelig for at forstyrre hans planer. | Politiet var naturligvis opsat på ikke at forstyrre hans planer. |
| ch15 ¶79 | grammar | gender (en vare) | Hun elsker det ægte vare | Hun elsker den ægte vare |
| ch16 ¶59 | style | tautology | en ung kvinde med et berygtet ry | en ung kvinde af berygtet vandel |
| ch16 ¶74 | style | calque 'Oh, dear!' | Er det et godt tegn? Åh, kære! | Er det et godt tegn? Åh, du milde! |
| ch17 ¶63 | style | calque of interjection 'Why,' | »Hvorfor, er I alle sammen bange for mig?« | »Hvad, er I alle sammen bange for mig?« |
| ch26 ¶7 | style | 'He's not wanted' | »Han skal ikke bruges! | »Ham har vi ikke brug for! |
| ch27 ¶3 | style | 'Foo!' (disgust) ≠ 'Pyt' (never mind) | og se dem nu! Pyt! | og se dem nu! Føj! |
| ch29 ¶35 | style | idiom | ved at vende hendes lommer | ved at vende vrangen ud på hendes lommer |
| ch39 ¶51 | grammar | non-word 'fjerpennet' (featherbrained) | Han er et fjerpennet ungt fjols | Han er et tankeløst ungt fjols |
| ch41 ¶10 | style | repetition | en kold kilde gemt et sted på et afsides sted | en kold kilde gemt et eller andet afsides sted |
| ch41 ¶11 | meaning | 'forvisninger' (banishments) for exiles | Der var nogle polske forvisninger, politiske fanger, | Der var nogle polske forviste, politiske fanger, |
| ch41 ¶11 | meaning | contemptuous rendered as contemptible | nogle russere, der var lige så foragtelige | nogle russere, der var lige så fulde af foragt |
| ch31 ¶47 | style | straight nested quotes | synge 'Marlborough s'en va-t-en guerre', | synge ›Marlborough s'en va-t-en guerre‹, |
| ch1 ¶47 | style (precision) | contemptuous→foragtende | Trods denne foragtelige afvisning | Trods denne foragtende afvisning |
| ch3 ¶39 | style (precision) | contemptuous→foragtende | på grund af de foragtelige blikke | på grund af de foragtende blikke |
| ch4 ¶36 | style (precision) | contemptuous→foragtende | nøjedes med et foragteligt blik | nøjedes med et foragtende blik |
| ch4 ¶46 | style (precision) | contemptuous→foragtende | med et foragteligt vift | med et foragtende vift |
| ch5 ¶65 | style (precision) | contemptuous→foragtende | ingen foragtelige blikke | ingen foragtende blikke |
| ch8 ¶122 | style (precision) | contemptuous→foragtende | kastede et foragteligt blik på Raskolnikov | kastede et foragtende blik på Raskolnikov |
| ch8 ¶130 | style (precision) | contemptuous→foragtende | og foragteligt ignorerede ham | og foragtende ignorerede ham |
| ch18 ¶47 | style (precision) | contemptuous→foragtende | svarede Dunja skarpt og foragteligt | svarede Dunja skarpt og foragtende |
| ch19 ¶143 | style (precision) | contemptuous→foragtende | svarede Raskolnikov foragteligt | svarede Raskolnikov foragtende |
| ch28 ¶2 | style (precision) | contemptuous→foragtende | stødte groft og foragteligt den person | stødte groft og foragtende den person |
| ch28 ¶33 | style (precision) | 'disdainfully unaware' | prøvede at se foragteligt uvidende ud om latteren | prøvede at lade, som om hun i sin foragt slet ikke hørte latteren |
| ch28 ¶38 | style (precision) | contemptuous→foragtende | bemærkede foragteligt | bemærkede foragtende |
| ch29 ¶4 | style (precision) | contemptuous→hånligt | endda foragteligt truende tone | endda hånligt truende tone |
| ch29 ¶68 | style (precision) | contemptuous→foragtende | Luzjin smilede foragteligt | Luzjin smilede foragtende |
| ch30 ¶137 | style (precision) | contemptuous→foragtende | faldt i foragtelig tavshed | faldt i foragtende tavshed |
| ch33 ¶34 | style (precision) | scornfully→foragtende | så Raskolnikov foragteligt på Porfirij | så Raskolnikov foragtende på Porfirij |
| ch41 ¶1 | meaning | contemptuous→foragtende | med sin foragtelige, grove optræden | med sin foragtende, grove optræden |
| ch14 ¶133 | style | calque 'a theory of his own' | han har en eller anden teori af sin egen | han har en eller anden teori, han selv har fundet på |

Book-wide replacements (one pattern, several paragraphs):

- porter: portner→vicevært (book uses vicevært 46×): 12 paragraph(s) (ch24 ¶1, ch25 ¶56, ch25 ¶73, ch26 ¶47, ch26 ¶82, ch26 ¶87, ch26 ¶98, ch32 ¶46, ch33 ¶9, ch36 ¶37, ch39 ¶37, ch39 ¶75)
- per-chapter 'section' field was left in English (e.g. 'Part I'); set to the Danish section title: 1 paragraph(s) (all chapters)

## Checked and found consistent

- **Names and patronymics (whole-book grep):**
  - Raskolnikov / Rodion Romanovitj / Rodja;
  - Razumikhin / Dmitrij Prokofitj;
  - Dunja / Avdotja Romanovna;
  - Pulkherija Aleksandrovna;
  - Sonja / Sofja Semjonovna;
  - Marmeladov / Semjon Zakharovitj;
  - Katerina Ivanovna;
  - Luzjin / Pjotr Petrovitj;
  - Svidrigajlov / Arkadij Ivanovitj;
  - Porfirij Petrovitj;
  - Zametov;
  - Lebezjatnikov / Andrej Semjonovitj;
  - Ilja Petrovitj, Nikodim Fomitj, Nastasja, Amalia Ivanovna/Ludwigovna (Lippewechsel), Lizaveta, Aljona Ivanovna, Nikolaj/Mikolka, Koch, Pestrjakov, Kapernaumov, Resslich.
  - There are no variant spellings. Ilja Petrovitj's *Rodionovitj* in ch39 is faithful to EN, where he fumbles the name.
- **Punctuation:** quotation marks are »…«, dashes are –, ellipses are ` …`, and there are no straight double quotes.
- **Other:** no English is left over, and the italics match EN.

## Decisions and open questions for Anders

1. **De/du switch points (reviewed; kept).** The draft is internally consistent:
   - Raskolnikov and Sonja say De to each other up to and including part 4 ch4 (ch24, the Lazarus reading).
   - Raskolnikov says du from the start of part 5 ch4 (ch30).
   - Sonja keeps De until her outburst *»Der er ingen – ingen i hele verden nu, der er så ulykkelig som du!«* (ch30 ¶75), then du. This mirrors the Russian.
   - Family members say du; Porfirij, Svidrigajlov and Luzjin say De; Razumikhin says du to Porfirij, his relative.

   One refinement for Anders: in the Russian, Raskolnikov already says *ты* to Sonja during part 4 ch4, from the moment he bows to her ("Я не тебе поклонился…" — *Det var ikke for Dem, jeg bøjede mig*, ch24 ¶99). Moving his switch there would affect about 25 paragraphs at the end of ch24. The English source has no T/V distinction, so the current choice is defensible. **Recommendation:** optional; do it only if you want to follow the Russian closely.
2. **Antisemitic passages (kept as written; recommended).**
   - The passages: ch6 ¶4 *rig som en jøde*; ch27 ¶3 Luzjin's *»Hvorfor i alverden var jeg sådan en jøde?«*; ch35 ¶27 Svidrigajlov's *jøderne skyder op og samler penge*; ch37 ¶3, where a stolen spoon is sold *til en jøde*; ch37 ¶48, the fireman "Achilles" and *den jødiske race*.
   - All of them render EN exactly. Nothing is softened and nothing is sharpened, which complies with Tinct's no-softening rule.
   - If context is wanted, it belongs in an edition-level note, not in edits to the text.
3. **Units (kept).** The draft converts the English translator's feet, yards and pounds, which themselves stand in for Russian measures, to metric at 22 sites, for example *en meter og firs*, *tredive meter* and *halvtreds kilo*. The arithmetic is right throughout and nothing is added, so I kept them. If you choose source units for Moby-Dick and want one rule across the library, this is a short pass.
4. **Translator's notes.** The three notes in EN (ch12 ¶80, ch33 ¶21 and ch39 ¶43) are translated as *Oversætterens note: …*. This is faithful to the 1:1 structure. The integrator should check how the reader displays them.

## Gates after the fixes

- Gate script:
  - 41/41 chapters, with paragraph counts 1:1 with EN and with the draft (3,904);
  - DA/EN character ratio 0.992–1.062;
  - zero English paragraphs;
  - JSON matches `chapters/*.txt`;
  - emphasis markers unchanged.
- `books/danish-lint.py`, wrapped read-only: 15 hits, all STRAY-UNDERSCORE false positives on italic markup such as `»_Pan_`.
