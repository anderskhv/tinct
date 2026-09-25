# Source-completeness audit — G03-plato-aristotle

- **Group:** G03-plato-aristotle
- **Books (priority order):** symposium (reconciliation only), apology, phaedo, crito, phaedrus, the-republic, poetics, nicomachean-ethics, aristotle-politics
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (local checkout, read-only). All 27 live edition files hash-match `inventory.json`.
- **Date:** 2026-09-25. Every finding is `status: PROPOSED`; a separate reviewer confirms.
- **Machine-readable:** `G03-plato-aristotle.findings.json` (same folder).

## Checks performed

1. **Served editions** from `inventory.json` (key, label, sha256), re-hashed on disk.
2. **Authoritative source** fetched once per work into scratch; URL, UTC time, sha256 and header lines recorded. Each PG header was verified before use. Local raws (`books/raw/crito`, `poetics`, `the-republic`, `aristotle-politics`) were diffed against the fetched files.
3. **Body delimitation.** Jowett's introductions and analyses, the "PERSONS OF THE DIALOGUE" / "SCENE" lines, the PG transcriber's notes, Butcher's "Analysis of Contents", J. A. Smith's introduction, Chase's NOTES, and Davis's introduction, analysis, index, footnotes and running heads are all out of scope (editorial). Dialogue bodies start at the first spoken line, including frame openings.
4. **`align.py`** (k=6) run on the whole body at `--min 8/12`, then at `--min 1` to explain every residual token. Every run of 25 or more tokens was inspected. Politics needed extra passes against its OCR raw; see that section.
5. **Structure.** First and last lines of each work; every chapter boundary checked against its source division; chapter titles checked against content.
6. **modern-en.** Screening flags (SHORT_VS_ORIG, MOD_DUP_ADJ) reviewed. Every paragraph pair was also scored with a content-word neighbour-similarity test: does modern ¶i render source ¶i±1..3 better than source ¶i? Near-duplicate adjacent modern paragraphs were checked too. Every flag was read. modern-da was checked for presence only.
7. **Existing packages** reconciled: `symposium-completeness-repair` (kind-fermi), and green-apology, green-crito and green-nicomachean-ethics (friendly-albattani). No other package on any remote branch touches these nine books; only `books/characters/*` scripts do.

**Tool caveats**
- The k-gram comparator cannot align rewritten text. The modern-en checks detect only whole-paragraph substitution, duplication or large drops. They are not a fidelity review.
- Politics has no clean transcription of the 1885/1905 Jowett text online:
  - MIT Classics is a *revised* Jowett, and its Book 2 and Book 5 pages are truncated on the server (HTTP 416 on range requests).
  - web.archive.org connections reset.
  - Wikisource has Book 1 only; its API returned 429 once.
  - The Politics edition was therefore checked against its own raw OCR, a second independent scan of the same edition, and MIT as a wording cross-witness.

## Summary

| Book | Verdict | Source (coverage src / ed) | Findings |
|---|---|---|---|
| symposium | DEFECTS (existing repair) | Jowett, PG #1600 (97.05% / 100%; package candidate 100% / 100%) | S1 opening missing (01), S3 ch7/8 boundary (02), S4 ch5 title (03). All three are covered by the accepted, unpublished package |
| apology | DEFECTS (translation only) | Jowett, PG #1656 (100% / 100%, exact) | modern-en/da **S3**: source ¶2.4 (exile argument) absent (01); ¶2.5 rendered twice (02). Documented in green-apology B1 but not repaired |
| crito | DEFECTS (translation only, existing repair) | Jowett, PG #1657 = local raw (100% / 100%, exact) | modern-en/da 2.9 premise not rendered and duplicates 2.11 (01, S3). Fixed in the accepted green-crito candidate, not yet released |
| phaedo | COMPLETE-VS-SOURCE | Jowett, PG #1658 (100% / 100%, exact) | S4 chapter-title boundary (01) |
| phaedrus | COMPLETE-VS-SOURCE | Jowett, PG #1636 (100% / 100%, exact) | none |
| the-republic | COMPLETE-VS-SOURCE | Jowett, PG #1497 = local raw (99.985% / 100%) | S4 modern-en local drift 7.96–7.100 (01) |
| poetics | COMPLETE-VS-SOURCE | Butcher, PG #1974 = local raw (99.83% / 100%) | S4 Greek served in PG letter-name brace notation (01) |
| nicomachean-ethics | DEFECTS | Chase, PG #8438 (99.48% / 99.99%) | **S3** Posterior Analytics appendix served as the end of Book 6 (01); S4 label "Ross tradition" (02); S4 "APPENDIX" heading at 7.95 (03) |
| aristotle-politics | DEFECTS | Jowett 1905 (Davis) OCR = local raw; second scan; MIT (see section) | **S2** 17 small line losses (03); **S2** footnote/running-head debris throughout (04); **S3** 6.4 opening (01); **S3** 7.17 passage lost in all editions (02); S4 page-break splits (05) |

---

## symposium — Symposium (reconciliation only)

**Served:** `original-en` e2943777fd54eaaa "Jowett (1871)"; `modern-en` 7816d1eb6ac9cc6d; `modern-da` 2a98c5281c40f5e3.

**Baseline check.** All three live sha256s equal the `baseline` block of `origin/claude/kind-fermi-a2b3g0:books/wip/symposium-completeness-repair/hashes/build-summary.json` (package commit `bebe95b4`, baseline main `38a97c63`).

**Source.** PG #1600, `https://www.gutenberg.org/cache/epub/1600/pg1600.txt`, sha256 `8b5c599ea734ff0f…`. It is the lead auditor's cache from 2026-09-25T11:45:19Z and is byte-equal to the package's `source/pg1600.txt`. Header: Symposium / Plato / Translator: Benjamin Jowett. No local raw.

**Body.** Lines 988–2934, from "Concerning the things about which you ask…" to "…retired to rest at his own home." The Introduction (50–976) and the PERSONS/SCENE lines (980–985) are excluded, as in the package.

**align.py results.**
- Live `original-en`: 22,250 source tokens and 21,593 edition tokens; **97.047% / 100%**. One MISSING run of 657 tokens at the very start: source lines 988–1050, 648 words, the Apollodorus frame opening. 0 EXTRA, ORDER or DUP.
- Package candidate `original-en` (`3521a12d…`, extracted from git): **100% / 100%**, 0 runs.

**Package status.** CONTENT ACCEPTED, handed off, NOT PUBLISHED. The package restores 1.0–1.8 in both English editions (C-01, C-02); regroups ch7/8 at "When Socrates had done speaking…" (C-03, which becomes ch7 69 / ch8 47 paragraphs); harmonises the ch5 title (C-04); and corrects 3 modern-en sentences (C-06).

**Open decisions for Anders (from the package):**
1. **modern-da** has the same missing opening and ch7/8 boundary, plus a misaligned ch3 and 33 condensed paragraphs. The package recommends leaving it untouched and setting it to `aligned: false` in the same release.
2. **modern-en similarity gate** fails before and after the repair (0.877 → 0.866), because chapters 2 and 4–7 have been near-verbatim Jowett since commit `67aa9c16`. A waiver is needed, otherwise neither English edition can ship.

**Verdict:** DEFECTS, all covered by the existing repair package; no new findings.

| ID | Type | Sev | Editions | Location | Extent | Note |
|---|---|---|---|---|---|---|
| G03-symposium-01 | MISSING | S1 | o-en, m-en, m-da | before 1.0 | 648 w | "Concerning the things about which you ask…" to "…everybody but Socrates." Package C-01/C-02; modern-da not repaired |
| G03-symposium-02 | MISLABELED | S3 | all three | 7.69–7.114 | 4,745 w | Alcibiades episode sits under "Socrates & Diotima"; ch8 holds only the closing paragraph. Package C-03 |
| G03-symposium-03 | MISLABELED | S4 | o-en | ch5 title | — | "Agathon & Aristophanes" vs "Aristophanes's Speech". Package C-04 |

---

## apology — Apology

**Served:** `original-en` a951009eaf834d24 "Jowett (1871)"; `modern-en` f09399f0fe5348b3; `modern-da` 7478955a3818154f.

**Source.** PG #1656, retrieved 2026-09-25T11:54:17Z, sha256 `f4cc548bd8c8b59e…`. Header: Apology / Plato / Translator: Benjamin Jowett (updated 2020-10-04). No local raw.

**Body.** Lines 491–1455, from "How you, O Athenians…" to "…Which is better God only knows." Excluded: the Introduction (54–487). The PG text has no dramatis personae.

**Metrics.** `original-en` matches word for word: 11,479 = 11,479 tokens, **100% / 100%**, no run of any length.

**Structure.** The chapter breaks sit exactly at the second speech ("There are many reasons why I am not grieved…", line 1237) and the third ("Not much time will be gained…", line 1323).

**modern-en.** I re-verified the green-apology finding on the current live file, which is byte-equal to the package's `candidate.json` paragraphs:
- modern-en **2.4** renders source ¶2.5 ("Someone would say: 'Can't you just stop talking…' … thirty minas").
- modern-en **2.5** renders ¶2.5 again, opening with the invented bridge "No, let me reconsider."
- Source ¶2.4 (87 words, pg1656 lines 1294–1300, "No indeed, men of Athens, that is not very likely… drive me out for their sakes.") is absent from modern-en.
- modern-da inherits the same defect: DA 2.4 "Nogen ville sige: 'Kan du ikke bare holde mund…'", and DA 2.5 "Lad mig genoverveje…".
- The neighbour-similarity screen flags only this site.

The package's review also lists clause-level drops (B2–B16). Those are fidelity items tracked there; I did not re-audit them.

**Verdict:** DEFECTS (translation only; original-en is complete against the source).

| ID | Type | Sev | Editions | Location | Extent | Boundaries |
|---|---|---|---|---|---|---|
| G03-apology-01 | MISSING | S3 | m-en, m-da | 2.4 | 87 w (src) | before: "…my own fellow citizens couldn't bear." missing: "No indeed, men of Athens, that is not very likely…" to "…drive me out for their sakes." after: "Someone would say: 'Can't you just stop talking, Socrates…'" |
| G03-apology-02 | EXTRANEOUS | S3 | m-en, m-da | 2.4–2.5 | ~139 w | ¶2.5 rendered twice (unexamined-life passage and thirty minae), with the invented bridge "No, let me reconsider." |

**Existing repair:** `origin/claude/friendly-albattani-qgyqfi` (`0252b80d`) `books/wip/green-apology/fidelity-review-1.md` B1. It documents the defect, but the package has no fixed candidate.

---

## crito — Crito

**Served:** `original-en` 19dbc33de3076411 "Jowett (1871)"; `modern-en` 5ff432e7e028e7ca; `modern-da` 4f2aa8b2b6f2c8b3.

**Source.** PG #1657, retrieved 2026-09-25T11:54:46Z (after one connection reset), sha256 `8f7e8c4cdb7ad512…`. Header: Crito / Plato / Translator: Benjamin Jowett (updated 2015-04-03). `books/raw/crito/raw.txt` equals it apart from the BOM and one header-area line.

**Body.** Lines 172–712, from "SOCRATES: Why have you come at this hour, Crito?" to "…whither he leads." Excluded: the Introduction and the PERSONS/SCENE lines (167–169).

**Metrics.** Exact match: 5,386 = 5,386 tokens, **100% / 100%**. The chapter breaks are sensible; ch3 begins at the Laws' speech ("Then consider the matter in this way…").

**modern-en.** Live 2.9 reads "And the good opinions are those of the wise, while the bad opinions are those of the unwise?". That restates 2.11. Source 2.9, "The good are to be regarded, and not the bad?" (pg1657 line 349), is not rendered. modern-da inherits the defect.

**Verdict:** DEFECTS (translation only; existing repair).

| ID | Type | Sev | Editions | Location | Extent | Note |
|---|---|---|---|---|---|---|
| G03-crito-01 | MISSING | S3 | m-en, m-da | 2.9 | 10 w | A dropped argument step plus a neighbour duplicate. Below the 20-word floor, but not cosmetic |

**Existing repair:** `green-crito` (friendly-albattani `0252b80d`), review finding D1. The accepted `candidate.json` (sha256 `511340f4…`) renders 2.9 correctly. It is not released and differs from live modern-en in 14 paragraphs. modern-da is not covered.

---

## phaedo — Phaedo

**Served:** `original-en` c2a1b3b99c2826d4 "Jowett (1871)"; `modern-en` 2c46156a47556769; `modern-da` 087b269dcd42ffb7.

**Source.** PG #1658, retrieved 2026-09-25T11:54:31Z, sha256 `164533dde5628e7c…`. Header: Phaedo / Plato / Translator: Benjamin Jowett. No local raw.

**Body.** Lines 1393–4441, from the Echecrates frame opening to "…the wisest and justest and best." Excluded: the Introduction, the PERSONS/SCENE lines, and "PLACE OF THE NARRATION: Phlius".

**Metrics.** Exact match: 27,484 = 27,484 tokens, **100% / 100%**. The frame opening and ending are both present. The modern-en screen found nothing substantive; its flag at 6.0 was checked and is fine.

**Structure note.**
- Ch6 "The Objections" has 3 paragraphs and contains only Simmias's objection (source line 2945).
- Cebes's objection (line 2979) opens ch7 "The Final Argument". Ch7 also holds the interlude, the misology passage, the reply to Simmias and the autobiography.

**Verdict:** COMPLETE-VS-SOURCE (Jowett, PG #1658).

| ID | Type | Sev | Editions | Location | Note |
|---|---|---|---|---|---|
| G03-phaedo-01 | MISLABELED | S4 | all three | 6.0–6.2 / 7.0 | Chapter titles are editorial; the text is complete |

---

## phaedrus — Phaedrus

**Served:** `original-en` 687f5a5e9b73892c "Jowett (1871)"; `modern-en` a246a86ca83ff335; `modern-da` f779e3b14e3a1880.

**Source.** PG #1636, retrieved 2026-09-25T11:54:32Z, sha256 `ce41cbe9eb575016…`. Header: Phaedrus / Plato / Translator: Benjamin Jowett. No local raw.

**Body.** Lines 1399–3787, from "My dear Phaedrus, whence come you…" to "Let us go." Excluded: the Introduction and the PERSONS/SCENE lines ("Under a plane-tree, by the banks of the Ilissus").

**Metrics.** Exact match: 23,206 = 23,206 tokens, **100% / 100%**. The chapter titles match their content (Lysias's speech, the first speech, the palinode, rhetoric, Theuth and writing). The modern-en screen found nothing.

**Verdict:** COMPLETE-VS-SOURCE. No findings.

---

## the-republic — The Republic

**Served:** `original-en` 338cc5908ed34b10 "Jowett Translation (1871)"; `modern-en` 02082bbef9bf9026; `modern-da` 9de2ff16ca374bdb.

**Source.** PG #1497, retrieved 2026-09-25T11:54:33Z, sha256 `917c1cb469e1a8eb…`. Header: The Republic / Plato / Translator: Benjamin Jowett (updated 2026-03-31). `books/raw/the-republic/raw.txt` equals it apart from the BOM.

**Body.** Lines 8640–24567, from "I went down yesterday to the Piraeus…" to "…which we have been describing." Excluded:
- Jowett's "Introduction and Analysis" (lines ~45–8600). The PG book-by-book analysis sits there, not inside the dialogue.
- "PERSONS OF THE DIALOGUE" and Jowett's note about the scene and the Timaeus framing (8610–8631).

**Metrics.** 119,083 source tokens and 119,065 edition tokens; **99.985% / 100%**. The only unmatched tokens are the nine "BOOK II"–"BOOK X" headings (18 tokens), each exactly at a served chapter boundary. 0 EXTRA, ORDER or DUP.

**Other notes.**
- Six inline Jowett parentheticals are part of the PG text and are served, e.g. "(Bendis, the Thracian Artemis.)".
- The MIDSPLIT flags 3.113|114 and 5.341|342 are verse quotations set off as their own paragraphs, as in PG. Not defects.

**modern-en.**
- One local drift at 7.96–7.100. The content of source 7.98 is folded into modern 7.96, and modern 7.98 already gives 7.100's "one, two, and three… number and calculation". That point is rendered again at 7.100.
- Glaucon's question 7.99 "What is that?" becomes "Yes.". Nothing substantive is lost.
- The other screen hits are paraphrases of short replies.

**Verdict:** COMPLETE-VS-SOURCE.

| ID | Type | Sev | Editions | Location | Note |
|---|---|---|---|---|---|
| G03-the-republic-01 | MISPLACED | S4 | m-en | 7.96–7.100 | Paragraph drift; source lines 19185–19192 |

---

## poetics — Poetics

**Served:** `original-en` 00113ffc33cceda9 "Butcher (1895)"; `modern-en` 20c7f0695e0360b9; `modern-da` 98b7db8373b61d59.

**Source.** PG #1974, retrieved 2026-09-25T11:54:35Z, sha256 `3d0100ec20b93c81…`. Header: The Poetics of Aristotle / Aristotle / Translator: S. H. Butcher. `books/raw/poetics/raw.txt` equals it apart from the BOM.

**Body.** Lines 107–1628 (chapters I–XXVI). Excluded: the transcriber's note (47–58) and Butcher's "Analysis of Contents" (62–95), from which the Tinct chapter titles are paraphrased.

**Metrics.** 14,908 source tokens and 14,883 edition tokens; **99.832% / 100%**. The only unmatched tokens are the 25 numerals II–XXVI, each exactly at a chapter boundary. 0 EXTRA, ORDER or DUP.

**Screen leads.** SHORT_VS_ORIG at 22.1 and 25.8 is an artefact of the letter-name notation; the modern text transliterates. There is no omission.

**Notation note.**
- `original-en` serves 78 brace groups (788 words) in 20 paragraphs, in the PG transcriber's letter-name notation, e.g. "{Theta omicron iota nu alpha tau alpha iota}".
- The transcriber's note explaining the braces is not served.
- modern-en and modern-da transliterate, with one leftover group at 21.4.

**Verdict:** COMPLETE-VS-SOURCE.

| ID | Type | Sev | Editions | Location | Note |
|---|---|---|---|---|---|
| G03-poetics-01 | EXTRANEOUS | S4 | o-en | 20 paragraphs (e.g. 22.1) | Transcriber notation served without its key |

---

## nicomachean-ethics — Nicomachean Ethics

**Served:** `original-en` 214c4025cd1ef25c "Chase (1847) / Ross tradition" (translator D.P. Chase); `modern-en` c6128f1563bbe0eb; `modern-da` b48d05b6bc5da844.

**Translation identified: D. P. Chase.** 1.0 reads "Every art, and every science reduced to a teachable form…"; Ross's translation opens "Every art and every inquiry…".

**Source.** PG #8438, retrieved 2026-09-25T11:54:36Z, sha256 `a68264a6537bb58b…`. Header: "The Nicomachean ethics of Aristotle" / Aristotle; the header has no translator field. This is the Everyman text: J. A. Smith's introduction and Chase's translation and notes. No local raw.

**Body.** Lines 869–10338. Excluded: the introduction and Chase's NOTES (10339–11862); the footnote markers are removed in the edition.

**Metrics.** 93,591 source tokens and 93,113 edition tokens; **99.478% / 99.988%**. No MISSING run is 25 tokens or longer (the longest is 8). The unmatched tokens are:
- 206 tokens of "Chapter I."-style headings;
- 219 footnote numerals;
- the book headings;
- 3 short k-gram edge runs next to removed markers (the text is present).

**Appendices.** Chase's text has two "APPENDIX" blocks, and both are served inside the reading flow:
1. After Book VI (source lines 6247–6329): "On ἐπισπήμη, from I. Post. Analyt. chap. i. and ii." — extracts from the *Posterior Analytics*, a different work. It is served as 6.93–6.106, 743 words, with "APPENDIX" and "CHAP. II" as body paragraphs. It is present in modern-en and modern-da too.
2. In Book VII (line 7155): "APPENDIX. Book VII. Chapters 12 to 15. (Bekker.)". This introduces genuine Ethics text (the Book VII treatise on pleasure) and is correctly served at 7.95 onward, but the heading appears as a body paragraph.

**Label.** "Ross tradition" is inaccurate. The served text is wholly Chase.

**Screen.** HEADING_LIKE 6.93 and 6.97 are the appendix headings. The MIDSPLIT flags are verse quotations. The modern-en screen found nothing.

**Existing repair.** The green-nicomachean-ethics `candidate.json` equals live modern-en. It keeps the appendix and records no completeness issue.

**Verdict:** DEFECTS.

| ID | Type | Sev | Editions | Location | Extent | Note |
|---|---|---|---|---|---|---|
| G03-nicomachean-ethics-01 | EXTRANEOUS | S3 | all three | 6.93–6.106 | 743 w | Translator's appendix from the *Posterior Analytics* served as the end of "Book 6". Scope decision: label it as an appendix or drop it |
| G03-nicomachean-ethics-02 | MISLABELED | S4 | o-en | edition label | — | "Chase (1847) / Ross tradition" should name Chase only |
| G03-nicomachean-ethics-03 | MISLABELED | S4 | all three | 7.95 | 9 w | "APPENDIX. Book VII…" heading as body text over genuine NE text |

---

## aristotle-politics — Politics

**Served:** `original-en` 0bf42e46f4c5c373 "Jowett (1885)"; `modern-en` 8ce0b1f6570584b4; `modern-da` 57d699612aa360b0.

### Provenance

- Per SOURCE.md, Book 1 comes from Wikisource and Books 2–8 from archive.org OCR, with an "OCR cleaned" claim.
- `books/raw/aristotle-politics/raw.txt` (sha256 `97284af279f67506…`) is **byte-identical to archive.org `aristotlespoliti00arisiala_djvu.txt`** (UCLA copy of the 1905 Davis/Jowett printing), retrieved 2026-09-25T12:20:51Z.
- SOURCE.md names `aristotlespoliti00arisuoft` instead. That is a 1908 printing, which I fetched as a second witness (sha256 `eb3233fe061a8ec2…`, 12:02:49Z).
- The raw is **not** an incomplete import: the second scan's translation body is fully contained in it, with no gap of 30 tokens or more.
- Wikisource `Politics_(Jowett)/Book_1` raw wikitext: sha256 `9ea13eff8d387270…`, retrieved around 12:02Z.
- MIT Classics per-book pages (12:00:54–12:01:04Z, hashes in scratch `RETRIEVAL.log`) carry a **revised** Jowett text. They serve as a wording cross-witness only.

### Body

`raw.txt` lines 1007–12538, Book I to the end of Book VIII ("…the mean, the possible, the becoming, these three."). Excluded:
- Davis's introduction and analysis (1–1006) and the index;
- footnotes, running heads and marginal section/Bekker numbers;
- in Wikisource Book 1, Davis's marginal-analysis headings and notes.

### Checks and metrics

1. **Edition vs its dehyphenated raw body.** 95,236 source tokens and 88,980 edition tokens. Source covered 93.196%: the remainder is apparatus. **Edition covered 99.681%.**
   - There are 52 raw runs of 25+ tokens missing. 50 are footnotes or running heads. **2 are authorial** (6.4 and 7.17).
   - A token-level review of every gap on a body line then found **17 further authorial losses** of 1–11 words.
2. **Second scan vs raw:** 95.95% token overlap, 0 gaps of 30+ tokens.
3. **MIT, per book:** 90.2–94.5% source coverage. Every MIT-only run of 25+ tokens is absent from **both** 1905 scans, i.e. it is revision variance (e.g. the a1/a2/b/c magistracy scheme at 1300a). The two exceptions are exactly 6.4 and 7.17.
4. **Wikisource Book 1 vs ch1:** one loss (1.43). Everything else unmatched is marginal analysis or notes.
5. **Book boundaries** are correct (Books I–VIII in traditional order). Book III correctly ends with Jowett's rendering of the MSS's repeated, incomplete sentence.
6. The stained scan line near Bekker 1297a, which SOURCE.md says lost a fragment, hides no text: the second scan is continuous there.

### Loss mechanism

The cleaning step treated some body lines as running heads and dropped them:
- lines that begin with a marginal section number followed by capitalised words, e.g. "8 But in Crete…", "12 Characteristic of Phaleas…";
- lines that end with a section number, e.g. "…are suited 5";
- lines that open with an OCR mark or quotation, e.g. "^ 1327 a easy of egress…", "'two going together'".

Meanwhile many footnotes and running heads survived as text. Total authorial loss is **≈199 words at 19 sites**. modern-en and modern-da restored most of the dropped subjects by themselves; the exceptions are listed below.

### Findings

| ID | Type | Sev | Editions | Location | Extent | Boundaries / note |
|---|---|---|---|---|---|---|
| G03-aristotle-politics-01 | MISSING | S3 | o-en | 6.4 start | 53 w | missing: "Such being our foundation and such the nature of democracy…" to "…require experience and". Served instead: the footnote "Or (taking apXH…) 'Such being…'" and the running head "T he Characteristics of Democracy". Raw 9402–9406. m-en/m-da present |
| G03-aristotle-politics-02 | MISSING | S3 | o-en, m-en, m-da | inside 7.17 | 59 w | before: "…difficult of access to the enemy, and". missing: "easy of egress to the inhabitants. Further…" to "…if we could have what we wish, it should". after: "be well situated in regard both to sea or land." Raw 10515–10519 |
| G03-aristotle-politics-03 | MISSING | S2 | o-en | 17 sites | 87 w | See the table below |
| G03-aristotle-politics-04 | EXTRANEOUS | S2 | o-en | Books 2–8 | — | See the extraneous-matter details below. modern-en and modern-da are clean, except modern-en 5.79, which renders the footnote's alternative translation as body text |
| G03-aristotle-politics-05 | MISPLACED | S4 | o-en, m-en | page breaks | — | See the page-break details below |

**Extraneous matter in original-en (finding 04).**
- 119 of 478 paragraphs carry footnote or reference debris: 71 "Cp.", 79 "§", 56 stray markers, 29 footnote openers, 5 Bekker numbers, 13 mid-line section numbers.
- 18 paragraphs open with a footnote; 5.79 is entirely a footnote.
- At least 8 running heads are served, e.g. 3.6 "When is a State the Same?", 5.59 "caused by Insult Fear Contempt 221", 6.17 "f 2 Offices — the Criminal Executive".

**Page-break splits (finding 05).**
- Paragraphs break mid-sentence at scan page boundaries (e.g. 1.16|17, 3.5|6, 5.50|51, 7.36|37).
- At 5.78–5.80 the sentence "…merely because [as Plato says] the ruling class are lovers and makers of money" is split across three paragraphs, with a footnote and a running head in between.
- modern-en states "the ruling class are lovers and makers of money" twice (5.78 and 5.80).

**The 17 line-level losses (G03-aristotle-politics-03).** "Served before" and "served after" are the neighbouring words in original-en.

| Coord | Words | Missing (raw.txt line) | Served before → after | m-en / m-da |
|---|---|---|---|---|
| 1.43 | 5 | 'Silence is a woman's glory,' (2067; Wikisource line 269) | "as the poet says of women," → "but this is not equally the glory of man." | absent / absent |
| 2.26 | 4 | Plato in the Laws (2876) | (paragraph start) → "was of opinion that, to a certain extent," | present / present |
| 2.55 | 3 | But in Crete (3557) | (paragraph start) → "they are of a more popular character." | present / present |
| 2.58 | 2 | The Cretans (3617) | "is really a close oligarchy." → "have a habit, too, of setting up a chief" | pronoun / pronoun |
| 2.59 | 2 | The Carthaginians (3634) | "Enough of the government of Crete." → "are also considered to have an excellent form" | present / present |
| 2.66 | 1 | Such (3771) | (paragraph start) → "is the character of the Lacedaemonian, Cretan…" | present / present |
| 2.72 | 3 | Characteristic of Phaleas (3872) | (paragraph start) → "is the equalization of property ; of Plato…" | present / present |
| 3.51 | 1 | I (5008, OCR "1") | "in a certain sense, as" → "have already admitted" | present / present |
| 3.73 | 10 | 'two going together;' … 'would that I had ten such counsellors!' (5553–5557) | "this is the old saying, —" → "and the prayer of Agamemnon, —" | absent / absent |
| 4.55 | 8 | Whereas in constitutional governments they take the contrary (7053) | "referred back to the magistrates." → "course ; the few have the negative" | present / present |
| 5.18 | 2 | At Rhodes (7824) | "the notables combined." → "' Cp. supra c. a. § I. the demagogues not only provided pay" | **absent** / absent (the story reads as if it were about Cos) |
| 5.48 | 2 | and continuance. (8508) | "the means of their preseiTation" → "I have still to speak of monarchy" | absent / absent |
| 5.59 | 10 | Another motive is contempt, as in the case of Sardanapalus, (8700) | "the offence would be forgiven." → "whom some one saw carding wool" | present / present |
| 6.2 | 10 | I have shown already what forms of democracy are suited (9325) | "in the composition of a state." → "to particular cities, and what of oligarchy" | reconstructed ("must also say…") / same |
| 6.17 | 11 | First among necessary offices is that which has the care of (9885) | "which separated." → "f 2 Offices — the Criminal Executive the market" | present / present |
| 8.6 | 3 | Although the Lacedaemonians (11998) | (paragraph start) → "have not fallen into this mistake" | present / present |
| 8.14 | 10 | The habit of feeling pleasure or pain at mere representations (12235) | "our souls undergo a change." → "is not far removed from the same feeling" | present / present |

**Verdict:** DEFECTS. The whole text was aligned against its own source edition (the 1905 OCR), cross-checked against a second scan and the MIT wording. Coverage metrics against the MIT revised text alone would understate completeness, because they measure revision variance.

**Open questions**
- A clean 1885/1905 Jowett transcription would permit an exact re-check. The current results depend on OCR on both sides.
- Correct the SOURCE.md provenance ID (`arisiala`, not `arisuoft`).
- OCR errors are served as-is (e.g. "preseiTation" 5.48, "shaie" 4.23, "whicli" 2.70). This is outside completeness scope, but worth a cleanup.

---

## Group-level open questions

1. **Apology modern-en/da** 2.4–2.5 has been documented since 2026-09-21 but has no fix. It is the same defect class as the Crito 2.9 item, which is fixed but unreleased. The modern-da copies of both are outside every package.
2. **Politics original-en** needs a re-parse from its raw that keeps section-numbered and quoted lines and drops footnotes and running heads. A text-only patch of the 19 sites would leave the 119 debris-bearing paragraphs untouched.
3. **NE appendix scope:** keep Chase's *Posterior Analytics* extracts as a clearly labelled appendix, or drop them.
4. **Symposium:** the package is ready. It waits on the Danish decision and the similarity-gate waiver.
