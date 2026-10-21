# Notes from Underground — independent review of the modern-da edition

**Verdict: ready after fixes.** All fixes below are applied. The meaning-error rate is well under the threshold of 3 per 100 paragraphs. The book's long essayistic paragraphs had more small grammar slips than the other two books. A light native proofread of the unread part (64% of the text, mostly Part 1) would probably find about ten more. It does not need another full translation pass.

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

- **Paragraphs read:** 109 of 495, which is about 36% of the Danish text and about 15,200 Danish words.
  - Ch1 in full (11 paragraphs) and ch21 in full (23 paragraphs).
  - 75 sampled paragraphs, a 15% sample (above the 10% minimum because the book is short).
- **Extra context read:** ch19 ¶18, ch19 ¶35 and ch20 ¶1.
- **Sample, as ch:¶:** 2:3, 2:4, 3:3, 3:5, 4:2, 5:1, 6:1, 7:1, 8:4, 9:2, 10:3, 10:4, 11:13, 11:14, 12:1, 12:5, 12:19, 12:24, 12:25, 12:30, 13:4, 14:3, 14:23, 14:29, 14:34, 15:1, 15:7, 15:27, 15:53, 15:67, 15:68, 15:79, 15:81, 16:10, 16:11, 16:15, 17:1, 17:2, 17:5, 17:6, 17:12, 17:13, 17:17, 17:20, 17:22, 17:31, 17:50, 17:63, 17:68, 17:75, 17:76, 17:84, 17:105, 17:106, 17:111, 17:114, 17:115, 17:119, 18:1, 18:5, 18:6, 18:7, 18:8, 19:6, 19:13, 19:34, 19:36, 19:39, 20:2, 20:10, 20:11, 20:17, 20:19, 20:24, 20:25

## Error rate before fixes (paragraphs read)

| Severity | Issues | Per 100 paragraphs | Per 10,000 DA words |
|---|---|---|---|
| Meaning | 2 | 1.8 | 1.3 |
| Grammar | 7 | 6.4 | 4.6 |
| Style | 8 | 7.3 | 5.3 |

- **Meaning:**
  - The Nekrasov epigraph (ch12 ¶1) was garbled. It had the non-word *skranen*, the agreement error *bitter flammer*, the line *før jeg kom til stand* (which means "before I came about"), and an added image, *bandt dig ved sit navn*.
  - *mere kortfattet* ("more concise") for "more abrupt" (ch17 ¶50).
- **Grammar:**
  - *jamren* used as a countable plural (*de jamren*);
  - a broken *det … eneste* clause;
  - *på anden eller tredje dagen*;
  - *nogen lune*;
  - *overbevise ham selv*, which should be reflexive;
  - *dit jammer*;
  - *trådt* ("stepped") for "threaded".
- **Style:**
  - calques, such as the tag question *ville han ikke?*;
  - word order;
  - *sparsommeligt* for "pinched";
  - an ambiguous *lad mig indkalde*;
  - *almindeliggjort menneske*;
  - two cases of *foragteligt* where the source means "contemptuously".
- **Found outside the sample by whole-book greps:** 9 more *foragtelig*/"contemptuous" slips, and 1 unit conversion that got the measure wrong.

## Book-wide mechanical fixes

- **Ellipses:**
  - The draft mixed 80 old-style `...` and `....` with 103 Danish ` …`.
  - All are now ` …` with a preceding space, or `…` with no space after `»` or at the start of a paragraph. This matches the convention of the C&P draft.
  - Changed in 19 chapters.
- **Per-chapter `section` labels:** all 21 chapters still carried the English label (`"Part I — Underground"`), and the reader's margin-preview code prefers this field. Each is now the Danish section title from `sections[]`, for example *Første del — Kælderhullet*.

## Fixes (sample and greps)

| Location | Severity | Issue | Before | After |
|---|---|---|---|---|
| ch1 ¶1 | style | clumsy clause | de må findes, sådan som de forhold, der har formet os, er. | de må endda findes i betragtning af de forhold, der har formet os. |
| ch4 ¶2 | grammar | 'jamren' used as countable plural | Men det er ikke oprigtige jamren; det er ondskabsfulde jamren, og ondskaben er hele pointen. Den lidendes nydelse kommer til udtryk i de jamren. | Men det er ikke oprigtige støn; det er ondskabsfulde støn, og ondskaben er hele pointen. Den lidendes nydelse kommer til udtryk i disse støn. |
| ch4 ¶2 | grammar | 'jamren' plural | De jamren udtrykker først og fremmest | Disse støn udtrykker først og fremmest |
| ch4 ¶2 | grammar | broken 'det … eneste' clause | og at det endelig, hvis I stadig er trodsige og stadig protesterer, eneste, der er tilbage til jeres egen tilfredsstillelse, er at piske jer selv ell… | og at det eneste, der endelig er tilbage til jeres egen tilfredsstillelse, hvis I stadig er trodsige og stadig protesterer, er at piske jer selv elle… |
| ch4 ¶2 | grammar | 'på anden eller tredje dagen' | på anden eller tredje dagen af anfaldet | på anfaldets anden eller tredje dag |
| ch4 ¶2 | grammar | 'jamren' plural | mine usle jamren? | mine usle støn? |
| ch7 ¶1 | style | calque of tag question 'wouldn't he?' | være en mørkemand eller en fuldstændig vanvittig: ville han ikke? | være en mørkemand eller fuldstændig vanvittig, ikke sandt? |
| ch7 ¶1 | grammar | 'nogen lune' (et lune) + calque 'of his own' | aldrig har haft nogen lune eller vilje af sin egen | aldrig har haft noget lune eller nogen egen vilje |
| ch8 ¶4 | grammar | reflexive | at overbevise ham selv om, at han er et menneske | at overbevise sig selv om, at han er et menneske |
| ch12 ¶1 | meaning | verse: non-word 'skranen', 'bitter flammer', 'før jeg kom til stand' (= came about), adde… | Da mine ord i glødend’ manen Fik vristet dig af mørkets favn, Af vildfarelsens tunge skranen; Og da du vred dig i din jammer Og mindedes med bitter f… | Da fra vildfarelsens mørke åg Mit ord af glødende formaning Din segnende ånd fik revet fri; Og du, der vred dig i din kval, Med forbandelse genkaldte… |
| ch12 ¶25 | style | word order | spurgte jeg igen og igen mig selv | spurgte jeg mig selv igen og igen |
| ch13 ¶4 | style | 'pinched' ≠ thrifty | alle med et særlig sparsommeligt, gulligt præg | alle med et særlig knebent, gulligt præg |
| ch17 ¶50 | meaning | 'abrupt' rendered as 'concise' | endnu hårdere og mere kortfattet end før | endnu hårdere og bryskere end før |
| ch18 ¶1 | grammar | gender | Dit jammer holder os vågne | Din jamren holder os vågne |
| ch19 ¶36 | style | ambiguous 'lad mig indkalde' (= let me summon) | »Bare gør det, lad mig indkalde,« brølede jeg. | »Gå bare hen og få mig indkaldt,« brølede jeg. |
| ch20 ¶10 | grammar | 'trådt' (stepped) for threaded | med at fumle med nålen, som han stadig ikke havde fået trådt. | med at fumle med nålen, som han stadig ikke havde fået tråd i. |
| ch20 ¶10 | grammar | 'trådt' for threaded | Da nålen var trådt, rejste han sig | Da der var tråd i nålen, rejste han sig |
| ch21 ¶22 | style | 'generalised human being' | umuligt, almindeliggjort menneske | umuligt almenmenneske |
| ch4 ¶2 | style (precision) | disdainfully→foragtende | som I naturligvis spytter foragteligt på | som I naturligvis spytter foragtende på |
| ch11 ¶4 | style (precision) | in contempt→foragtende | ryster foragteligt på hovedet | ryster foragtende på hovedet |
| ch14 ¶2 | style (precision) | contemptuously→foragtende | Jeg forholdt mig vredt og foragteligt tavs | Jeg forholdt mig vredt og foragtende tavs |
| ch14 ¶39 | style (precision) | disdainfully→foragtende | bryde fuldstændig og foragteligt med dem | bryde fuldstændig og foragtende med dem |
| ch14 ¶40 | style (precision) | disdainful→foragtende | den kolde, foragtelige modtagelse | den kolde, foragtende modtagelse |
| ch15 ¶44 | style (precision) | contemptuously→foragtende | uden at sige et ord … foragteligt! | uden at sige et ord … foragtende! |
| ch15 ¶48 | style (precision) | contemptuous→foragtende | kastede et foragteligt blik på mig | kastede et foragtende blik på mig |
| ch15 ¶72 | style (precision) | contemptuous→foragtende | Med et foragteligt smil | Med et foragtende smil |
| ch15 ¶72 | style (precision) | contemptuously→foragtende | jeg lo pludselig foragteligt | jeg lo pludselig foragtende |
| ch15 ¶81 | style (precision) | contemptuously→foragtende | svarede Zverkov foragteligt | svarede Zverkov foragtende |
| ch15 ¶93 | style (precision) | contemptuous→foragtende | med en foragtelig latter | med en foragtende latter |
| ch17 ¶52 | units | 'a foot of water' converted to half a metre (wrong measure) | der må have stået en halv meter vand i bunden | der må have stået tredive centimeter vand i bunden |

Book-wide replacements (one pattern, several paragraphs):

- per-chapter 'section' field was left in English (e.g. 'Part I'); set to the Danish section title: 1 paragraph(s) (all chapters)

## Checked and found consistent

- **Names:** Simonov, Zverkov, Ferfitjkin, Trudoljubov, Apollon, Liza, Anton Antonitj (Sjetotjkin), Olympia and Vanjukha are spelled the same way throughout.
- **Forms of address:**
  - The narrator says I/jer to his readers, and the imagined interlocutors say De to him.
  - Simonov and Trudoljubov say du to the narrator; Zverkov and Ferfitjkin say De to keep their distance.
  - Apollon says De, and the narrator and Liza say du to each other.
- **Punctuation:** quotation marks are »…« with nested ›…‹, and there are no straight quotes. Dashes are –.
- **Other:** no English is left over, and the `_…_` emphasis matches EN.

## Decisions and open questions for Anders

1. **Units.** The draft converts three "six feet" to *en meter og firs* and "six inches" to *femten centimeter*. These are correct and idiomatic, and the English units are themselves a translator's rendering of Russian measures, so I kept them. I fixed one wrong conversion, "a foot of water" → *en halv meter*, to *tredive centimeter*. If you choose source units for Moby-Dick (see that review), you may want the same rule here for consistency. It is three sentences.
2. **Part titles.** The draft uses *Kælderhullet* and *I anledning af den våde sne*. The live edition uses *Under jorden* and *Apropos den våde sne*. Both are acceptable. The new ones read better in Danish, and the text itself uses *kælderhul* throughout.
3. **Nekrasov epigraph.** It is now an unrhymed, line-faithful rendering of Soskice's English. If you want a rhymed version, it needs a separate verse pass.

## Gates after the fixes

- Gate script (scratch re-implementation of GATES.txt):
  - 21/21 chapters, with paragraph counts 1:1 with EN and with the draft;
  - DA/EN character ratio 0.972–1.105, all inside 0.85–1.25;
  - zero English paragraphs;
  - JSON matches `chapters/*.txt`;
  - the number of `_` emphasis markers is unchanged.
- `books/danish-lint.py`, wrapped read-only with the Mac path redirected to a scratch directory of symlinks: 6 hits, all STRAY-UNDERSCORE false positives on italic markup copied from EN. This is unchanged from the draft.
