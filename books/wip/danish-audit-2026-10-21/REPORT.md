# Danish audit, 21 Oct 2026

Read-only audit of every `modern-da` edition in `app/public/data/editions/`, measured against the current `modern-en` of the same book. Anders reopened Danish for this run on 21 Oct 2026. No edition, app or tool file was changed. There was no Anthropic API spend: all reading and judging was done in this Claude Code session.

- **Baseline:** `main` at `e8b270332` (this branch was cut from it). All 703 remote branches were fetched for the history comparison.
- **Scope:** 98 books have a `modern-da`, and 10 more have a `modern-en` but no Danish. The Bible editions and the Conjecture Institute books have no `modern-en`, so they are out of scope.

## Result

| Verdict | Books |
|---|---:|
| SHIP (good as is; a copyedit for slips at most) | 27 |
| RETRANSLATE | 71 (9 of them need only a scoped repair or re-segmentation; see *Scope* in the table) |
| MISSING | 10 |

**SHIP:** a-little-princess, anna-karenina, arabian-nights, around-the-world-80-days, brothers-karamazov, candide, divine-comedy, don-quixote, gilgamesh, grimms-fairy-tales, imitation-of-christ, ivan-ilyich, julius-caesar, jungle-book, midsummer, niels-lyhne, phaedrus, poetics, romeo-and-juliet, the-awakening, the-manual, the-tempest, to-the-lighthouse, treasure-island, us-founding-documents, wealth-of-nations, werther.

**Scoped repair, not a full retranslation:** apology, fear-and-trembling (re-segment only), hamlet, jane-eyre, jerusalem (source decision first), leviathan, macbeth, pride-and-prejudice, war-and-peace. Each scope is given in the table.

**MISSING:** adventures-of-sherlock-holmes, alice-in-wonderland, bacchae, magna-carta, medea, meditations, middlemarch, sense-and-sensibility, the-art-of-war, wuthering-heights.

### Systemic findings

1. **The Danish no longer tracks the English in 28 books.** In these books `modern-en` was rewritten after the Danish was last made: the `modern-en` blob at the commit that introduced the current `modern-da` blob differs from today's. In most of them the Danish was translated from the old, near-original English, so the Danish edition does not match the modern edition the reader shows beside it. The worst cases, as rewritten EN paragraphs out of the total:
   - moby-dick 1,611/2,432; jerusalem 1,360/1,782; crime-and-punishment 1,270/3,904; faust-part-1 1,036/1,060
   - vindication 752/778; jane-eyre 537/4,034; walden 499/502; notes-from-underground 492/495; confessions 461/462; aristotle-politics 434/478
   - frankenstein 301; second-treatise 297; beyond-good-and-evil 243; jekyll-and-hyde 235; pride-and-prejudice 224; communist-manifesto 201; heart-of-darkness 198/198; hume-enquiry 187/318; kant-groundwork 147; on-liberty 126/126; as-you-like-it 118; the-prince 55; macbeth 37; symposium 12

   Three books are listed but cleared. In candide (100) and julius-caesar (7) the changes are cosmetic: 2 and 0 paragraphs below 0.8 similarity. niels-lyhne and fear-and-trembling are modernised from the Danish original, so English changes do not stale them. The sample reviewers saw the same thing from the other side: in walden, notes-from-underground, on-liberty, hume-enquiry, kant-groundwork, aristotle-politics, second-treatise, much-ado, jekyll-and-hyde and communist-manifesto, the Danish follows the original author's periods, not the modern English.
2. **788 paragraphs are left in English** (detected by English-vs-Danish stopword ratio):
   - vindication-rights-of-woman: 503, chapters 1–6 and 10–15
   - faust-part-1: 85
   - heart-of-darkness: 84, all of chapter 3
   - discourse-on-inequality: 67, all of chapter 4; every one is identical to modern-en
   - confessions: chapters 10–13 are 206 `[TBD]` placeholders
   - as-you-like-it: the Project Gutenberg licence text in chapters 2 and 12
   - jane-eyre: 12 verse paragraphs

   Most other "identical" hits are legitimate: Montaigne's Latin quotations (149, all in chapter 69), Joyce fragments, and Shakespeare speaker labels.
3. **Structural misalignment.** Chapter counts differ in as-you-like-it (17 vs 23) and jerusalem (18 vs 17, with chapters 10–17 shifted). Paragraph counts differ in faust (25 chapters), macbeth (16), jane-eyre (11), pride (7), symposium (3), niels-lyhne (14) and fear-and-trembling (8). In the-aeneid, moby-dick, paradise-lost, war-and-peace, crime-and-punishment, frederick-douglass and phaedo, paragraphs are shifted inside chapters whose counts match. Every one of these breaks EN↔DA position keeping on a language switch.
4. **Compression and summarising:**
   - the-aeneid: book ratio 0.36, every chapter between 0.20 and 0.58
   - confessions: 0.56, because of the placeholders
   - symposium: 0.75; chapter 8 is 1 DA paragraph for 47 EN
   - phaedo: 0.82
   - paradise-lost: 0.86; chapter 2 is at 0.34
   - the-republic: 0.89
   - moby-dick: 26 chapters below 0.8

   Every other book is between 0.94 and 1.14, the normal range for Danish.
5. **Calqued, word-for-word Danish is the main reason for RETRANSLATE.** This applies to most of the Shakespeare plays, the Greek plays, Iliad/Odyssey, the Federalist papers, the-prince, Descartes and the Nicomachean ethics. Common forms: English syntax ('Hold den uforsigtige tunge af din'), non-words ('gracefuldt', 'forflade', 'usselrygge'), gender errors, and du/De/I/Eder mixed inside one speech. Speaker labels are often left in English (FIRST LORD, DUKE, FOOL, CLOWN), as are 'sir' and 'Master/Mistress'. Meaning reversals were found in antigone, utilitarianism and discourse-on-inequality ('adlyde' for 'disobey').
6. **The lint tools mostly flag correct text.** `danish-lint.py` raised 3,380 flags, and nearly all are false positives:
   - STRAY-UNDERSCORE: `_italic_` markup mirrored from modern-en (pride-and-prejudice has 494 underscores in EN and 482 in DA)
   - SPACE-BEFORE-PUNCT: Danish spaced ellipsis ` ...`
   - DOUBLE-FILLER: legitimate 'det det' / 'den den'

   Only 22 hits in 12 books are real (BROKEN-COMPOUND or BLACKLIST): `spotsangeren` (the-awakening ×2), old counting words (`firsindstyve`, `tresindstyve`, `halvfjerdsindstyve`, `halvfemsindstyve` in measure-for-measure, leviathan ×3, democracy-in-america, war-and-peace, ulysses, niels-lyhne, fear-and-trembling), and split words in don-quixote, grimms, poetics, richard-iii and ulysses. The last two of the old counting words are the authors' own and may stay. `qa-danish-deep.py` severity is a good triage signal for compression and placeholders (confessions, the-aeneid, symposium, phaedo), but it scores fluent books with English proper-noun drift as high as broken ones.

## Method

- **Alignment and ratio:** chapters paired by index and paragraphs by index inside each chapter. The length ratio is DA characters over EN characters, per chapter (chapters over 200 EN characters) and per book.
- **Shifted paragraphs:** inside chapters with equal counts, a paragraph counts as shifted when its length or its names and numbers match a neighbouring EN paragraph much better than its own (5+ hits are listed).
- **English left:** a paragraph of at least 6 words whose English stopwords number 3 or more and outnumber Danish stopwords 2:1. "Identical" counts DA paragraphs (20+ characters) that equal the EN paragraph at the same position.
- **Lint:** `books/danish-lint.py` and `books/qa-danish-deep.py` were run unchanged, except for a scratch copy with the hard-coded macOS paths pointed at this checkout. "Lint all / real" gives all flags and the BROKEN-COMPOUND + BLACKLIST subset. "Deep sev." is the deep scan's severity score.
- **History:** `git log --all` on both files after fetching every branch, because main was squashed on 26 Sep and history otherwise starts at 1 Oct. The DA date is the earliest commit carrying today's `modern-da` blob. "EN changed after DA" compares the `modern-en` blob at that commit with today's, and gives new or rewritten EN paragraphs over the total. Mass mechanical commits that touched both files at once, such as the title normalisation of 10 Jun, count as in sync.
- **Reading:** 30 paragraph pairs per book, at least 60 EN characters each, drawn reproducibly (seed `da-audit-<book>`) from chapters with matching paragraph counts. Each pair was read against the English by Claude in this session, with seven parallel reviewers working from the same rubric. Scores are 1–5 for fluency and accuracy. Problem pairs counts the sampled pairs with a real error. niels-lyhne and fear-and-trembling have no chapter whose count matches the EN, so I read 15 pairs of each against `original-da`.
- **Verdict rule:** SHIP needs all of the following:
  - both scores ≥ 4
  - 1:1 alignment with no shifted paragraphs
  - no untranslated English
  - no substantive EN rewrite since the Danish

  The exception is the two Danish-origin books (niels-lyhne, fear-and-trembling), which are judged against `original-da`: alignment to it, and fidelity to it.

  Anything else is RETRANSLATE, with a scope where a repair would suffice. Every SHIP book still has the listed slips to clear in a copyedit before it is promoted.

## Integration notes (not done here)

- niels-lyhne follows `original-da` 1:1 (1,159 paragraphs), while `modern-en` has 912. Danish↔English position mapping for this book has to go through the original, or be chapter-level only.
- fear-and-trembling has to be re-split to the 184 paragraphs shared by `original-da` and `modern-en` before it can be paired.
- Some sources must be decided before any retranslation:
  - jerusalem: an older Danish Lagerlöf translation versus the modern EN, whose content differs.
  - the books translated from the original-language English: translate from the current `modern-en`.
- The lint tools have hard-coded macOS paths, and their underscore and spaced-ellipsis checks need to learn the edition markup. That is a tooling change, left for an assigned code step.

## Per-book table

Columns: alignment is chapters, paragraphs, chapters with a different paragraph count, and shifted paragraphs; EN left / identical are paragraphs; "EN changed after DA" gives rewritten EN paragraphs over the total, with the DA and EN dates.

| Book | Verdict | Alignment (DA/EN) | Length ratio da/en | EN left / identical | Lint all / real | Deep sev. | EN changed after DA | Fluency/Accuracy | Problem pairs /30 | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| a-little-princess | **SHIP** | 19/19 ch; 1701/1701 ¶; 0 ch off | 1.02 (min 0.99) | 0 / 0 | 4 / 0 | 37 | no (DA 2026-10-19) | 5/5 | 1 | Natural and faithful; one slip (pair 22 'styrtede over det' for 'pounced on it'). |
| adventures-of-sherlock-holmes | **MISSING** | — | — | — | — | — | — | — | — | No modern-da edition; modern-en exists. |
| alice-in-wonderland | **MISSING** | — | — | — | — | — | — | — | — | No modern-da edition; modern-en exists. |
| anna-karenina | **SHIP** | 239/239 ch; 7442/7442 ¶; 0 ch off | 1.02 (min 0.96) | 0 / 2 | 373 / 0 | 52 | no (DA 2026-06-10) | 4/4 | 6 | Faithful and natural; gender slips ('Den anden afdrag', 'denne aristokrati'). |
| antigone | **RETRANSLATE** | 11/11 ch; 318/318 ¶; 0 ch off | 1.03 (min 0.96) | 0 / 0 | 0 / 0 | 12 | no (DA 2026-05-11) | 3/3 | 7 | Pair 10 reverses meaning ('Jeg agtede ikke … at adlyde' for 'not about … to disobey'); 'vredens flush'; 'en cifret' for 'a cipher'. |
| antony-and-cleopatra | **RETRANSLATE** | 42/42 ch; 1513/1513 ¶; 0 ch off | 1.05 (min 0.95) | 0 / 3 | 0 / 0 | 20 | no (DA 2026-06-13) | 3/4 | 8 | Word-for-word with gender/word errors: 'sin raseri', 'i din fraværd', 'uvist' for 'unshown'. |
| apology | **RETRANSLATE** | 3/3 ch; 92/92 ¶; 0 ch off; 1 ¶ shifted | 1.00 (min 0.98) | 0 / 0 | 1 / 0 | 4 | no (DA 2026-05-11) | 4/4 | 6 | *Scope: repair: retranslate the one compressed paragraph (Anytus conditional, ~ch2) and fix slips.* Mostly natural and faithful; one compressed paragraph (pair 21) to repair; 'uplettet ældre slægtninge'. |
| arabian-nights | **SHIP** | 35/35 ch; 1826/1826 ¶; 0 ch off | 1.01 (min 0.98) | 0 / 0 | 1 / 0 | 20 | no (DA 2026-10-19) | 5/5 | 2 | Idiomatic, complete, aligned; two small slips (pair 16 'ladet hende lægge ind'). |
| aristotle-politics | **RETRANSLATE** | 8/8 ch; 478/478 ¶; 0 ch off | 1.03 (min 0.99) | 0 / 0 | 5 / 0 | 47 | **yes**: 434/478 ¶ (DA 2026-06-13, EN 2026-10-01) | 3/3 | 9 | Follows old Jowett wording, not the modern EN; 'polity' left in English; garbled pair 17. |
| around-the-world-80-days | **SHIP** | 37/37 ch; 1613/1613 ¶; 0 ch off | 0.98 (min 0.95) | 0 / 0 | 15 / 0 | 28 | no (DA 2026-10-19) | 5/5 | 1 | Fluent, accurate, numbers and dates right; one harmless gloss. |
| as-you-like-it | **RETRANSLATE** | 17/23 ch; 901/931 ¶; 22 ch off | 0.99 (min 0.0, 12 ch <0.8) | 4 / 0 | 1 / 0 | 108 | **yes**: 118/931 ¶ (DA 2026-06-13, EN 2026-09-30) | 3/1 | 10 | All sampled pairs misaligned; 17 DA vs 23 EN chapters; Gutenberg licence text in the DA (ch2, ch12). |
| bacchae | **MISSING** | — | — | — | — | — | — | — | — | No modern-da edition; modern-en exists. |
| beowulf | **RETRANSLATE** | 43/43 ch; 375/375 ¶; 0 ch off | 0.94 (min 0.9) | 0 / 0 | 1 / 0 | 4 | no (DA 2026-05-11) | 3/4 | 7 | Mostly faithful, but gender/grammar slips ('mangen en bæger') and garbled clauses (pairs 28-29). |
| beyond-good-and-evil | **RETRANSLATE** | 11/11 ch; 325/325 ¶; 0 ch off | 1.04 (min 0.95) | 1 / 1 | 2 / 0 | 46 | **yes**: 243/325 ¶ (DA 2026-06-13, EN 2026-10-01) | 3/4 | 7 | Follows older Zimmern phrasing (243 of 325 EN paragraphs changed after the DA); garbled pair 2; 'en medfødt »helvede«'. |
| brothers-karamazov | **SHIP** | 96/96 ch; 5836/5836 ¶; 0 ch off | 1.01 (min 0.98) | 0 / 1 | 517 / 0 | 49 | no (DA 2026-06-13) | 4/5 | 4 | Faithful, aligned, good dialogue; few calques ('Nej, jeg gør ikke'). |
| candide | **SHIP** | 30/30 ch; 709/709 ¶; 0 ch off | 1.01 (min 0.93) | 0 / 0 | 1 / 0 | 20 | **yes**: 100/709 ¶ (DA 2026-06-10, EN 2026-09-23) | 4/5 | 5 | Accurate; English-style capitalisation of nouns ('Bulgarerne', 'Baronens') needs a normalisation pass; pair 10 'fik øje på en … madlavningsduft'. |
| comedy-of-errors | **RETRANSLATE** | 11/11 ch; 690/690 ¶; 0 ch off | 1.05 (min 1.03) | 0 / 2 | 0 / 0 | 20 | no (DA 2026-06-13) | 3/4 | 12 | Speaker labels and 'sir' in English throughout; I/du swapped mid-speech; 'Hvorfor, det her er sælsomt'. |
| communist-manifesto | **RETRANSLATE** | 5/5 ch; 213/213 ¶; 0 ch off | 1.00 (min 0.99) | 0 / 0 | 1 / 0 | 9 | **yes**: 201/213 ¶ (DA 2026-06-13, EN 2026-09-30) | 3/3 | 8 | Follows an old Danish wording, not the modern EN; mixes 'borgerskab'/'bourgeoisiet'; 'butiksbestyrere' for 'shop assistants'. |
| confessions | **RETRANSLATE** | 13/13 ch; 462/462 ¶; 0 ch off | 0.56 (min 0.0, 4 ch <0.8) | 0 / 0 | 2 / 0 | 160 | **yes**: 461/462 ¶ (DA 2026-06-10, EN 2026-09-25) | 2/1 | 26 | Chapters 10-13 are '[TBD]' placeholders (206 paragraphs); the rest follows an old archaic translation; EN changed in 461 of 462 paragraphs since. |
| coriolanus | **RETRANSLATE** | 29/29 ch; 1379/1379 ¶; 0 ch off | 1.03 (min 1.0) | 0 / 0 | 0 / 0 | 20 | no (DA 2026-06-13) | 3/3 | 9 | Calques and meaning errors: 'Guderne har vel forhindret det' ('vel' = presumably), 'pralede afkoms' for 'boasted lineage'. |
| crime-and-punishment | **RETRANSLATE** | 41/41 ch; 3904/3904 ¶; 0 ch off; 4 ¶ shifted | 0.97 (min 0.49, 1 ch <0.8) | 0 / 2 | 205 / 0 | 84 | **yes**: 1270/3904 ¶ (DA 2026-06-10, EN 2026-09-24) | 4/2 | 9 | Pairs 24, 25, 30 misaligned; non-word 'svogtyve tusind' for 'seventy thousand'; Luzhin/Lushin inconsistency; EN changed in 1,270 paragraphs since. |
| crito | **RETRANSLATE** | 3/3 ch; 95/95 ¶; 0 ch off | 1.01 (min 0.99) | 0 / 0 | 0 / 0 | 4 | no (DA 2026-05-11) | 3/4 | 10 | Calques and ungrammatical lines; English 'fond' left in ('særligt fond af staten'). |
| cymbeline | **RETRANSLATE** | 29/29 ch; 1133/1133 ¶; 0 ch off | 1.05 (min 1.0) | 0 / 3 | 0 / 0 | 20 | no (DA 2026-06-13) | 2/4 | 14 | Literal calques; speaker labels left in English (FIRST LORD, GAOLER); pair 12 'gracefuldt hvilende', pair 28 'hængning er blinklets vej' is nonsense. |
| democracy-in-america | **RETRANSLATE** | 96/96 ch; 2258/2258 ¶; 0 ch off | 0.97 (min 0.94) | 5 / 0 | 37 / 1 | 27 | no (DA 2026-06-13) | 3/4 | 11 | English word order; non-words 'kølner mig', 'almagtsfulde'; 'enhver af dems lige'; old counting 'tresindstyve'. |
| descartes-meditations | **RETRANSLATE** | 9/9 ch; 144/144 ¶; 0 ch off | 1.01 (min 0.98) | 0 / 0 | 0 / 0 | 10 | no (DA 2026-06-13) | 2/3 | 12 | English participle constructions ('siddende ved ilden … holdende'), gender errors, 'højeste magtfuld'. |
| discourse-on-inequality | **RETRANSLATE** | 4/4 ch; 170/170 ¶; 0 ch off | 1.01 (min 1.0) | 67 / 68 | 2 / 0 | 4 | no (DA 2026-06-13) | 4/1 | 16 | All of ch4 (67 paragraphs) is the English text copied; pair 14 reverses meaning ('fristes til at adlyde' for 'tempted to disobey'). |
| divine-comedy | **SHIP** | 100/100 ch; 4812/4812 ¶; 0 ch off | 0.99 (min 0.95) | 0 / 2 | 3 / 0 | 22 | no (DA 2026-06-10) | 4/4 | 5 | Mostly natural and faithful; 'Det hårde fortov' for 'adamantine pavement'; quote marks inconsistent. |
| don-quixote | **SHIP** | 126/126 ch; 3939/3939 ¶; 0 ch off | 1.02 (min 0.98) | 1 / 1 | 53 / 1 | 20 | no (DA 2026-06-13) | 4/4 | 7 | Faithful, period flavour; cleanup pass for 'hesteflesk', 'Frøken Niece', inconsistent titles. |
| essays-montaigne | **RETRANSLATE** | 107/107 ch; 4897/4897 ¶; 0 ch off | 1.01 (min 0.95) | 7 / 149 | 485 / 0 | 24 | no (DA 2026-06-15) | 3/4 | 10 | Literal calques and errors: 'vise' for 'visse' (certain), 'rippe', 'måtte hellere dø'. |
| faust-part-1 | **RETRANSLATE** | 28/28 ch; 895/1060 ¶; 25 ch off; 6 ¶ shifted | 0.88 (min 0.68, 7 ch <0.8) | 85 / 2 | 4 / 0 | 120 | **yes**: 1036/1060 ¶ (DA 2026-06-13, EN 2026-09-30) | 2/1 | 26 | DA follows an older source and drifts out of alignment from ch6; pairs 16 and 28 are untranslated English. |
| fear-and-trembling | **RETRANSLATE** | 8/8 ch; 232/184 ¶; 8 ch off | 0.96 (min 0.78, 1 ch <0.8) | 0 / 0 | 3 / 1 | 93 | **yes**: 184/184 ¶ (DA 2026-05-11, EN 2026-09-30) | 4/4 | 0 of 15 (vs original-da) | *Scope: re-segment the modernisation to the 184 original-da/modern-en paragraphs; no retranslation needed.* Not a translation: an orthographic modernisation of Kierkegaard's Danish (word-level similarity to original-da 0.75-0.93 per chapter; 'thi' kept, 'Huus' → 'hus'). Text is sound, but it is re-split into 232 paragraphs where original-da and modern-en both have 184, so neither aligns. |
| federalist-papers | **RETRANSLATE** | 85/85 ch; 1279/1279 ¶; 0 ch off | 0.99 (min 0.95) | 0 / 2 | 8 / 0 | 20 | no (DA 2026-06-13) | 2/3 | 14 | Stilted and archaic ('Eder'); 'afværge' for 'deprecate'; 'hele helhedens sikkerhed er hele helhedens interesse'. |
| frankenstein | **RETRANSLATE** | 28/28 ch; 764/764 ¶; 0 ch off | 1.01 (min 0.96) | 1 / 1 | 17 / 0 | 30 | **yes**: 301/764 ¶ (DA 2026-05-11, EN 2026-09-23) | 4/3 | 11 | Fluent but paraphrases/omits ('mellem mig og civilisationen' for 'my fellow human beings'); EN changed in 301 paragraphs since. |
| frederick-douglass | **RETRANSLATE** | 12/12 ch; 162/162 ¶; 0 ch off; 2 ¶ shifted | 1.05 (min 0.97) | 0 / 0 | 18 / 0 | 20 | no (DA 2026-06-15) | 4/2 | 8 | Ch10 misaligned (pairs 23-26 hold neighbouring paragraphs); English left in place ('Aunt Hester', 'ship-yard'). |
| genealogy-of-morals | **RETRANSLATE** | 4/4 ch; 124/124 ¶; 0 ch off | 0.98 (min 0.96) | 0 / 0 | 1 / 0 | 12 | no (DA 2026-06-13) | 3/4 | 9 | Calques and English left in ('helhjertet renunciation'); 'gjort trickværket'. |
| gilgamesh | **SHIP** | 12/12 ch; 253/253 ¶; 0 ch off | 0.96 (min 0.93) | 0 / 0 | 0 / 0 | 21 | no (DA 2026-05-11) | 4/4 | 5 | Clean, readable, aligned; typo 'ubegravel', 'det uhyrlige Humbaba'. |
| great-expectations | **RETRANSLATE** | 59/59 ch; 3835/3835 ¶; 0 ch off | 1.04 (min 1.0) | 0 / 0 | 6 / 0 | 20 | no (DA 2026-05-11) | 3/4 | 11 | Aligned but calqued throughout: 'mobbe selv sin sandwich', 'Dagene er gået, er de ikke?'. |
| grimms-fairy-tales | **SHIP** | 65/65 ch; 902/902 ¶; 0 ch off | 0.98 (min 0.94) | 0 / 0 | 3 / 1 | 20 | no (DA 2026-10-19) | 5/5 | 1 | Natural fairy-tale Danish, verse re-rhymed, names localised (Snehvide, Rosenrød). |
| hamlet | **RETRANSLATE** | 20/20 ch; 1391/1391 ¶; 0 ch off | 1.03 (min 0.99) | 0 / 2 | 0 / 0 | 20 | no (DA 2026-06-10) | 3/4 | 7 | *Scope: fluency pass may suffice (accuracy 4).* Accurate but literal: 'sætter denne forvirrede adfærd på', 'stjæler nogen reaktion'; an editing pass, not a full redo, may suffice. |
| heart-of-darkness | **RETRANSLATE** | 3/3 ch; 198/198 ¶; 0 ch off | 1.09 (min 1.02) | 84 / 2 | 1 / 0 | 29 | **yes**: 198/198 ¶ (DA 2026-06-13, EN 2026-09-30) | 2/1 | 22 | All of ch3 (84 paragraphs) is Conrad's original English; the rest translates the original, not the modern EN (all 198 EN paragraphs changed since). |
| henry-iv-part-2 | **RETRANSLATE** | 19/19 ch; 1081/1081 ¶; 0 ch off | 1.04 (min 1.02) | 1 / 3 | 3 / 0 | 20 | no (DA 2026-06-13) | 2/3 | 11 | Speaker prefixes in English (CHIEF JUSTICE, PRINCE HENRY); Dem/I/Eder mixed; 'Eders elskerinders dråber'. |
| henry-v | **RETRANSLATE** | 23/23 ch; 883/883 ¶; 0 ch off | 1.04 (min 0.99) | 0 / 6 | 68 / 0 | 20 | no (DA 2026-06-13) | 2/3 | 11 | Literal calques: 'det fattige og udsultede bånd' (ribbon), 'Prist være Gud'; 'gentlewomen' in English. |
| hume-enquiry | **RETRANSLATE** | 19/19 ch; 318/318 ¶; 0 ch off | 1.07 (min 0.96) | 1 / 3 | 64 / 0 | 44 | **yes**: 187/318 ¶ (DA 2026-05-22, EN 2026-09-30) | 3/2 | 18 | From ~ch10 follows Hume's original wording, not the modern EN (187 of 318 EN paragraphs changed after the DA). |
| iliad | **RETRANSLATE** | 24/24 ch; 1137/1137 ¶; 0 ch off | 0.98 (min 0.96) | 0 / 0 | 0 / 0 | 20 | no (DA 2026-06-10) | 2/4 | 15 | Word-for-word: 'var i to sind', 'kæmp med kraft og hovedkraft', non-word 'forflade'. |
| imitation-of-christ | **SHIP** | 114/114 ch; 774/774 ¶; 0 ch off | 0.97 (min 0.9) | 0 / 0 | 0 / 0 | 29 | no (DA 2026-06-10) | 4/4 | 4 | Fitting devotional register; 'tænke lidt om sig selv' should be 'tænke ringe om sig selv'. |
| ivan-ilyich | **SHIP** | 12/12 ch; 298/298 ¶; 0 ch off | 1.02 (min 0.99) | 0 / 0 | 14 / 0 | 14 | no (DA 2026-06-17) | 4/5 | 4 | Faithful and readable; bridge terms too literal ('lave et bord'), 'ubehagelighed' for 'discomfort'. |
| jane-eyre | **RETRANSLATE** | 38/38 ch; 4047/4034 ¶; 11 ch off; 7 ¶ shifted | 1.00 (min 0.61, 2 ch <0.8) | 12 / 10 | 3 / 0 | 130 | **yes**: 537/4034 ¶ (DA 2026-05-11, EN 2026-09-25) | 4/3 | 9 | *Scope: targeted repair: 11 misaligned chapters, 129 substantive EN changes, English verse in ch24/33.* Mostly good, but invents/drops content (pair 27); 11 chapters misaligned; 12 English verse paragraphs; targeted fix may suffice. |
| jekyll-and-hyde | **RETRANSLATE** | 10/10 ch; 339/339 ¶; 0 ch off | 1.01 (min 1.0) | 0 / 0 | 0 / 0 | 11 | **yes**: 235/339 ¶ (DA 2026-06-13, EN 2026-09-24) | 3/3 | 12 | Follows Stevenson's original wording, not the modern EN; 'dørklokken bankede' for 'the knocker sounded'. |
| jerusalem | **RETRANSLATE** | 18/17 ch; 1787/1782 ¶; 12 ch off; 1 ¶ shifted | 0.97 (min 0.14, 5 ch <0.8) | 0 / 0 | 1 / 0 | 138 | **yes**: 1360/1782 ¶ (DA 2026-05-11, EN 2026-09-30) | 4/4 | 5 | *Scope: decide source first: the DA modernises an older Danish Lagerlöf translation whose content and chapter split (18 vs 17) differ from the modern EN; 742 EN paragraphs rewritten since.* Modernisation of an older Danish Lagerlöf translation, not of the modern EN; content diverges from EN (pair 11); chapters 10-17 shifted by one against EN. |
| julius-caesar | **SHIP** | 18/18 ch; 997/997 ¶; 0 ch off | 1.04 (min 0.99) | 0 / 2 | 1 / 0 | 20 | **yes**: 7/997 ¶ (DA 2026-06-13, EN 2026-09-24) | 4/4 | 6 | Good; fix 'ærefuld' → 'hæderlig' in Antony's speech, 'sporer' for 'spurring'. |
| jungle-book | **SHIP** | 7/7 ch; 944/944 ¶; 0 ch off | 1.01 (min 0.97) | 0 / 0 | 29 / 0 | 14 | no (DA 2026-10-19) | 5/5 | 2 | Natural, lively Danish; slips 'har misset', 'sagde Mowgli elendigt'. |
| kant-groundwork | **RETRANSLATE** | 4/4 ch; 193/193 ¶; 0 ch off | 1.11 (min 0.99) | 0 / 0 | 1 / 0 | 20 | **yes**: 147/193 ¶ (DA 2026-06-10, EN 2026-09-30) | 3/3 | 9 | Translates Abbott's old English, not the modern edition; 'på den konto'; heavy nested sentences. |
| king-lear | **RETRANSLATE** | 26/26 ch; 1371/1371 ¶; 0 ch off | 1.03 (min 1.0) | 0 / 0 | 0 / 0 | 21 | no (DA 2026-06-13) | 2/3 | 14 | Literal, often ungrammatical; 'FOOL' left in English; 'og top yderligheden', non-word 'usselrygge'. |
| leviathan | **RETRANSLATE** | 49/49 ch; 1337/1337 ¶; 0 ch off | 0.99 (min 0.95) | 0 / 1 | 13 / 3 | 27 | no (DA 2026-06-10) | 3/4 | 8 | *Scope: fluency pass may suffice; EN text unchanged since.* Faithful but stilted; 'en tagen af sværdet'; old counting 'halvfjerdsindstyve' 3×; fluency pass may suffice. |
| macbeth | **RETRANSLATE** | 28/28 ch; 806/840 ¶; 16 ch off | 0.95 (min 0.56, 3 ch <0.8) | 0 / 1 | 1 / 0 | 119 | **yes**: 37/840 ¶ (DA 2026-06-10, EN 2026-09-30) | 4/4 | 4 | *Scope: repair: 16 chapters off by 1-5 paragraphs (806 vs 840) and 36 EN paragraphs rewritten after the DA; retranslate those chapters only.* Clean modern Danish in the sample, but 'jeres matroser' for 'your matrons'; structurally 16 chapters off by 1-5 paragraphs (see metrics). |
| magna-carta | **MISSING** | — | — | — | — | — | — | — | — | No modern-da edition; modern-en exists. |
| measure-for-measure | **RETRANSLATE** | 17/17 ch; 1006/1006 ¶; 0 ch off | 1.04 (min 1.02) | 0 / 2 | 3 / 2 | 20 | no (DA 2026-06-13) | 2/3 | 15 | Word-for-word and archaic; DUKE, MISTRESS OVERDONE, sir left in English; old counting 'firsindstyve'. |
| medea | **MISSING** | — | — | — | — | — | — | — | — | No modern-da edition; modern-en exists. |
| meditations | **MISSING** | — | — | — | — | — | — | — | — | No modern-da edition; modern-en exists. |
| merchant-of-venice | **RETRANSLATE** | 20/20 ch; 779/779 ¶; 0 ch off | 1.06 (min 1.04) | 0 / 1 | 0 / 0 | 20 | no (DA 2026-06-13) | 3/4 | 10 | Archaises a modern edition (Eder/Eders mixed with du); 'I var at bebrejde' for 'You were to blame'. |
| merry-wives-of-windsor | **RETRANSLATE** | 23/23 ch; 1155/1155 ¶; 0 ch off | 1.04 (min 1.01) | 0 / 5 | 0 / 0 | 20 | no (DA 2026-06-13) | 3/3 | 11 | Calques and wrong idioms; Master/Mistress/sir left in English; 'De siger' for 'They say'. |
| middlemarch | **MISSING** | — | — | — | — | — | — | — | — | No modern-da edition; modern-en exists. |
| midsummer | **SHIP** | 9/9 ch; 641/641 ¶; 0 ch off | 1.00 (min 0.98) | 0 / 1 | 6 / 0 | 18 | no (DA 2026-06-10) | 4/5 | 4 | Clear modern prose, fairies localised; slips 'bønfald hende om sin kærlighed', 'Dit modbydelige eliksir'. |
| moby-dick | **RETRANSLATE** | 136/136 ch; 2432/2432 ¶; 0 ch off; 22 ¶ shifted | 0.92 (min 0.48, 26 ch <0.8) | 0 / 0 | 11 / 0 | 97 | **yes**: 1611/2432 ¶ (DA 2026-05-11, EN 2026-09-30) | 2/2 | 14 | Content not in the modern EN (pair 23 ends '»Vores Jenny er død.«'); invented details; 26 chapters compressed below 0.8. |
| much-ado-about-nothing | **RETRANSLATE** | 17/17 ch; 1118/1118 ¶; 0 ch off | 1.05 (min 0.97) | 0 / 0 | 1 / 0 | 25 | no (DA 2026-06-13) | 2/3 | 17 | Follows original Shakespeare wording, not the modern EN; 'marts-killing' for 'March-chick'; speaker names in English. |
| nicomachean-ethics | **RETRANSLATE** | 10/10 ch; 1195/1195 ¶; 0 ch off | 1.03 (min 1.0) | 0 / 0 | 6 / 0 | 20 | no (DA 2026-06-13) | 2/4 | 14 | Word-for-word syntax: 'hvad er godt' for 'hvad der er godt' recurs; 'landmænd' for 'landsmen'. |
| niels-lyhne | **SHIP** | 14/14 ch; 1159/912 ¶; 14 ch off | 1.05 (min 0.99) | 0 / 0 | 47 / 1 | 140 | **yes**: 868/912 ¶ (DA 2026-06-10, EN 2026-10-01) | 5/5 | 0 of 15 (vs original-da) | Not a translation: a faithful orthographic modernisation of Jacobsen's Danish, 1:1 with original-da (1,159 paragraphs, similarity 0.89-0.95). Light lexical updates only ('idelig' → 'uafbrudt'). Lowercase fragment paragraphs are page-break splits inherited from original-da. The EN rewrite does not stale it; its EN/DA paragraph mismatch is an integration note. |
| notes-from-underground | **RETRANSLATE** | 21/21 ch; 495/495 ¶; 0 ch off | 1.08 (min 0.99) | 0 / 0 | 7 / 0 | 32 | **yes**: 492/495 ¶ (DA 2026-06-13, EN 2026-10-01) | 3/3 | 14 | Follows the old Garnett text, not the modern EN (492 of 495 EN paragraphs changed since); grammar errors. |
| odyssey | **RETRANSLATE** | 24/24 ch; 1027/1027 ¶; 0 ch off | 0.96 (min 0.9) | 0 / 0 | 1 / 0 | 26 | no (DA 2026-06-10) | 3/4 | 9 | Good prose but corrupted words ('forsfømmer', 'tingststedet', 'overvfældet'), missing verbs, an added passage (pair 19). |
| oedipus-at-colonus | **RETRANSLATE** | 11/11 ch; 566/566 ¶; 0 ch off | 1.03 (min 1.0) | 0 / 0 | 0 / 0 | 18 | no (DA 2026-05-11) | 2/4 | 13 | Word-for-word with grammar errors: 'drev os ikke væk' (imperative), 'som om for at matche'. |
| oedipus-rex | **RETRANSLATE** | 11/11 ch; 474/474 ¶; 0 ch off | 1.02 (min 0.98) | 0 / 0 | 2 / 0 | 14 | no (DA 2026-05-11) | 2/4 | 13 | Copies English syntax: 'Hold den uforsigtige tunge af din', 'selv du selv', broken V2 word order. |
| on-liberty | **RETRANSLATE** | 5/5 ch; 126/126 ¶; 0 ch off | 1.12 (min 1.05) | 0 / 0 | 0 / 0 | 28 | **yes**: 126/126 ¶ (DA 2026-06-13, EN 2026-10-01) | 3/3 | 10 | Translated from Mill's original periods (all 126 EN paragraphs changed since); 'mishandling' for 'misconduct'. |
| oresteia | **RETRANSLATE** | 26/26 ch; 771/771 ¶; 0 ch off | 1.02 (min 0.98) | 0 / 0 | 0 / 0 | 20 | no (DA 2026-06-15) | 3/4 | 7 | Non-words ('svæmmer', 'vævner'), garbled lines; 'uforglemmelige' for 'immemorial'. |
| othello | **RETRANSLATE** | 15/15 ch; 1391/1391 ¶; 0 ch off | 1.05 (min 0.99) | 0 / 2 | 1 / 0 | 20 | no (DA 2026-06-13) | 2/3 | 14 | Calques and invented words: 'aspishjælmes tunger', 'din forstands sømmesyede side ud'. |
| paradise-lost | **RETRANSLATE** | 12/12 ch; 1188/1188 ¶; 0 ch off; 19 ¶ shifted | 0.86 (min 0.34, 3 ch <0.8) | 0 / 0 | 0 / 0 | 93 | no (DA 2026-05-11) | 3/2 | 11 | Misaligned pairs (entirely different passages), condensed chapters (ch2 ratio 0.34); 'Datterdødttræer'. |
| peloponnesian-war | **RETRANSLATE** | 26/26 ch; 998/998 ¶; 0 ch off | 1.00 (min 0.98) | 0 / 0 | 5 / 0 | 20 | no (DA 2026-06-13) | 2/3 | 18 | Stiff calques and grammar breaks: 'i øjeblikket for engagement'; garbled 'flight of the rest'. |
| phaedo | **RETRANSLATE** | 9/9 ch; 652/652 ¶; 0 ch off; 2 ¶ shifted | 0.82 (min 0.7, 2 ch <0.8) | 0 / 0 | 0 / 0 | 52 | no (DA 2026-05-11) | 4/2 | 12 | Fluent but shortened/paraphrased (ratio 0.82); pair 17 misaligned; 'mine venner' for 'my judges'. |
| phaedrus | **SHIP** | 6/6 ch; 408/408 ¶; 0 ch off | 1.00 (min 0.99) | 0 / 0 | 0 / 0 | 12 | no (DA 2026-06-13) | 4/5 | 5 | Accurate, mostly fluent; a few calques ('fodre på mening'), 'stor besvær'. |
| poetics | **SHIP** | 26/26 ch; 130/130 ¶; 0 ch off | 1.02 (min 0.91) | 0 / 0 | 3 / 1 | 20 | no (DA 2026-06-10) | 4/4 | 4 | Accurate, consistent terminology; minor word choices. |
| pride-and-prejudice | **RETRANSLATE** | 61/61 ch; 2060/2053 ¶; 7 ch off | 1.02 (min 0.97) | 0 / 0 | 41 / 0 | 64 | **yes**: 224/2053 ¶ (DA 2026-05-11, EN 2026-09-25) | 3/4 | 8 | *Scope: targeted repair: 7 misaligned chapters, 53 substantive EN changes, scattered errors.* Mostly good prose, scattered real errors: German 'prachten', 'ringede' for 'called' (visited); 7 chapters misaligned; a repair pass may suffice. |
| richard-iii | **RETRANSLATE** | 25/25 ch; 1420/1420 ¶; 0 ch off | 1.03 (min 0.97) | 0 / 4 | 2 / 1 | 20 | no (DA 2026-06-13) | 3/4 | 10 | Speaker labels half English; 'mordbrænder' (arsonist) for 'murderer'; 'en høj mand' for 'a tall man' (brave). |
| romeo-and-juliet | **SHIP** | 25/25 ch; 1062/1062 ¶; 0 ch off | 1.02 (min 0.95) | 0 / 0 | 1 / 0 | 20 | no (DA 2026-06-10) | 4/4 | 7 | Readable and faithful; minor slips ('mine læber … er klar', 'kullbærere'). |
| second-treatise | **RETRANSLATE** | 19/19 ch; 301/301 ¶; 0 ch off | 1.00 (min 0.95) | 1 / 1 | 0 / 0 | 28 | **yes**: 297/301 ¶ (DA 2026-06-10, EN 2026-09-30) | 2/3 | 12 | Follows Locke's original periods, not the modern EN; pairs 1 and 16 truncated mid-word ('fremmed g'). |
| sense-and-sensibility | **MISSING** | — | — | — | — | — | — | — | — | No modern-da edition; modern-en exists. |
| social-contract | **RETRANSLATE** | 48/48 ch; 491/491 ¶; 0 ch off | 0.99 (min 0.92) | 0 / 0 | 43 / 0 | 20 | no (DA 2026-06-10) | 3/4 | 8 | Calques: 'statens krop', 'Det vil blive sagt mig'; 'statsmandskunstmesterværk'. |
| symposium | **RETRANSLATE** | 8/8 ch; 217/226 ¶; 3 ch off | 0.75 (min 0.05, 7 ch <0.8) | 0 / 0 | 0 / 0 | 74 | **yes**: 12/226 ¶ (DA 2026-05-11, EN 2026-09-25) | 4/1 | 18 | Summarised instead of translated; misaligned pairs; ch8 is 1 DA paragraph for 47 EN (ratio 0.05). |
| taming-of-the-shrew | **RETRANSLATE** | 12/12 ch; 1021/1021 ¶; 0 ch off | 1.05 (min 1.03) | 0 / 0 | 18 / 0 | 20 | no (DA 2026-06-13) | 3/4 | 10 | Literal with false friends: 'politisk indledt mit regimente', 'luskepind' for 'commoner'. |
| the-aeneid | **RETRANSLATE** | 12/12 ch; 544/544 ¶; 0 ch off; 59 ¶ shifted | 0.36 (min 0.2, 12 ch <0.8) | 0 / 0 | 0 / 0 | 130 | no (DA 2026-06-10) | 3/1 | 28 | Compressed retelling (book ratio 0.36), misaligned from ch9. |
| the-art-of-war | **MISSING** | — | — | — | — | — | — | — | — | No modern-da edition; modern-en exists. |
| the-awakening | **SHIP** | 39/39 ch; 1044/1044 ¶; 0 ch off | 1.02 (min 0.97) | 0 / 0 | 2 / 2 | 18 | no (DA 2026-06-10) | 4/4 | 5 | Natural and faithful; fix 'spotsangeren' (lint blacklist, 2×) and 'Han var fulgtes op med'. |
| the-histories | **RETRANSLATE** | 1525/1525 ch; 1626/1626 ¶; 0 ch off | 0.97 (min 0.8) | 0 / 0 | 6 / 0 | 21 | no (DA 2026-06-10) | 3/4 | 10 | Literal and stilted; 'Mederne konge'; two people merged ('ham Philip Argaios'). |
| the-manual | **SHIP** | 52/52 ch; 68/68 ¶; 0 ch off | 1.02 (min 0.89) | 0 / 0 | 0 / 0 | 0 | no (DA 2026-05-11) | 5/5 | 1 | Publishable; one added word (pair 22 'Erotiske'). |
| the-prince | **RETRANSLATE** | 27/27 ch; 254/254 ¶; 0 ch off | 1.00 (min 0.95) | 0 / 1 | 0 / 0 | 24 | **yes**: 55/254 ¶ (DA 2026-06-10, EN 2026-09-24) | 2/4 | 14 | Archaic 'thi'; De/du/I swing; pair 29 calqued throughout ('givet en ringe regning for sig selv'). |
| the-republic | **RETRANSLATE** | 10/10 ch; 4308/4308 ¶; 0 ch off | 0.89 (min 0.82) | 0 / 0 | 6 / 0 | 64 | no (DA 2026-06-10) | 4/3 | 9 | Fluent but compresses/paraphrases (book ratio 0.89); dropped clauses, a changed claim (pair 19), pair 10 cut to 'kan vores?'. |
| the-tempest | **SHIP** | 10/10 ch; 790/790 ¶; 0 ch off | 1.02 (min 1.0) | 0 / 2 | 0 / 0 | 18 | no (DA 2026-06-10) | 4/4 | 7 | Natural and faithful; quick fix for 'pinselsfuld', 'lysende vågen', 'fuld monstrum'. |
| to-the-lighthouse | **SHIP** | 42/42 ch; 495/495 ¶; 0 ch off | 1.02 (min 0.92) | 0 / 0 | 14 / 0 | 30 | no (DA 2026-10-10) | 4/5 | 3 | Faithful and natural; a few anglicisms ('Nej, tænkte hun ikke'). |
| treasure-island | **SHIP** | 34/34 ch; 1375/1375 ¶; 0 ch off | 1.05 (min 1.0) | 0 / 0 | 4 / 0 | 21 | no (DA 2026-06-17) | 4/5 | 4 | Idiomatic, good nautical vocabulary; one garbled sentence (pair 19). |
| twelfth-night | **RETRANSLATE** | 18/18 ch; 1120/1120 ¶; 0 ch off | 1.04 (min 1.01) | 0 / 3 | 3 / 0 | 20 | no (DA 2026-06-13) | 3/3 | 11 | Speaker names in English (CAPTAIN, DUKE, CLOWN); puns broken; 'et blodigt skaldetop'. |
| ulysses | **RETRANSLATE** | 18/18 ch; 7148/7148 ¶; 0 ch off | 1.01 (min 0.99) | 9 / 59 | 630 / 2 | 31 | no (DA 2026-05-11) | 2/3 | 13 | Literal: 'satte sig i en pludselig furie' (huff), 'kikker et pokkers mord op', 'fork' read as 'gaffel'. |
| us-founding-documents | **SHIP** | 4/4 ch; 153/153 ¶; 0 ch off | 0.98 (min 0.97) | 0 / 0 | 0 / 0 | 8 | no (DA 2026-06-13) | 4/5 | 5 | Precise legal Danish, numbers check out; fix 'Amendment XVIII' → 'Tillæg XVIII' and 'Sektion'. |
| utilitarianism | **RETRANSLATE** | 5/5 ch; 94/94 ¶; 0 ch off | 1.01 (min 1.0) | 0 / 0 | 1 / 0 | 6 | no (DA 2026-05-20) | 3/4 | 11 | Pair 20 reverses meaning ('må adlydes' for 'ought to be disobeyed'); non-words 'indtrykkende', 'et messe'. |
| vindication-rights-of-woman | **RETRANSLATE** | 15/15 ch; 778/778 ¶; 0 ch off | 1.01 (min 1.0) | 503 / 2 | 0 / 0 | 7 | **yes**: 752/778 ¶ (DA 2026-06-13, EN 2026-09-30) | 3/1 | 16 | 503 of 778 paragraphs are Wollstonecraft's original English, untranslated; EN changed in 752 paragraphs since. |
| walden | **RETRANSLATE** | 18/18 ch; 502/502 ¶; 0 ch off | 1.14 (min 1.02) | 6 / 0 | 47 / 0 | 50 | **yes**: 499/502 ¶ (DA 2026-06-13, EN 2026-10-01) | 3/2 | 12 | Translated from Thoreau's original, not the modern EN (499 of 502 EN paragraphs changed since); archaic verse left in English. |
| war-and-peace | **RETRANSLATE** | 365/365 ch; 11340/11340 ¶; 0 ch off; 5 ¶ shifted | 1.01 (min 0.69, 3 ch <0.8) | 0 / 1 | 461 / 1 | 85 | no (DA 2026-06-10) | 4/4 | 8 | *Scope: repair: realign/retranslate shifted paragraphs in ch223, ch226 and 2 other chapters (5 paragraphs); name/title consistency pass.* Fluent; 'udsvævende levned' for 'leisurely life'; name/title consistency pass needed (Natásha/Natasja, fyrstesse/fyrstinde); 'tresindstyve'. |
| wealth-of-nations | **SHIP** | 32/32 ch; 2173/2173 ¶; 0 ch off | 1.02 (min 0.99) | 0 / 2 | 38 / 0 | 42 | no (DA 2026-06-15) | 4/4 | 5 | Clear, accurate economic Danish; 'augmentation' left untranslated. |
| werther | **SHIP** | 84/84 ch; 354/354 ¶; 0 ch off | 1.02 (min 0.88) | 0 / 0 | 2 / 0 | 6 | no (DA 2026-06-16) | 4/5 | 5 | Faithful and fluent; gender slips 'det indre helligdom', 'den lille havelysthus'. |
| winters-tale | **RETRANSLATE** | 15/15 ch; 911/911 ¶; 0 ch off | 1.05 (min 1.02) | 0 / 0 | 0 / 0 | 20 | no (DA 2026-06-13) | 3/4 | 11 | Word-for-word into ungrammatical lines ('Da hun er ikke af dit kød'); 'Sir' untranslated; du/De mixed. |
| wuthering-heights | **MISSING** | — | — | — | — | — | — | — | — | No modern-da edition; modern-en exists. |
