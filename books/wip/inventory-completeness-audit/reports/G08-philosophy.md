# Source-completeness audit: G08-philosophy

- **Group:** G08-philosophy
- **Books (priority order):** fear-and-trembling (reconcile), beyond-good-and-evil, descartes-meditations, kant-groundwork, genealogy-of-morals, leviathan, hume-enquiry, on-liberty, utilitarianism, the-art-of-war
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (the local checkout is exactly this commit; every served sha256 matches `inventory.json`)
- **Date:** 2026-09-25
- **Machine-readable findings:** `G08-philosophy.findings.json` (23 findings, all `status: PROPOSED`)

## Summary

| Book | Verdict | Source edition used | Source covered | Top findings |
|---|---|---|---|---|
| fear-and-trembling | DEFECTS (all are existing repairs) | archive.org OCR of the 1895 3rd edition, plus the accepted corrected source | 94.1% of raw OCR / 96.5% of corrected source | S2 weaning refrains, S2 footnotes, S2 mislabelled `original-en` |
| beyond-good-and-evil | DEFECTS | PG #4363 (Zimmern) | 99.91% | **S1** PG end-line served as the final paragraph |
| descartes-meditations | COMPLETE-VS-SOURCE | Wikisource (Veitch), cross-checked against the 1901 scan | 99.54% | none |
| kant-groundwork | COMPLETE-VS-SOURCE | PG #5682 (Abbott) | 99.96% | S4 notes and headings served as body paragraphs |
| genealogy-of-morals | COMPLETE-VS-SOURCE | PG #52319 (Samuel) | 99.70% | none (translator notes are scope) |
| leviathan | DEFECTS | PG #3207 | 97.64% | S2 table of sciences cut short; S3 dedication, Introduction plan, dropped lines, marginal notes |
| hume-enquiry | COMPLETE-VS-SOURCE | PG #9662 (Selby-Bigge 1777 text) | 99.80% | S4 "Part 0" label, notes served as body paragraphs |
| on-liberty | DEFECTS | PG #34901 | 98.01% | S3 footnote paragraph served as the end of Chapter II; S3 scope decision on Mill's notes |
| utilitarianism | COMPLETE-VS-SOURCE | PG #11224 (7th ed. 1879) | 99.87% | S4 notes served as body paragraphs, so the book ends on Footnote D |
| the-art-of-war | COMPLETE-VS-SOURCE | PG #132 (Giles), commentary removed | 95.1% raw; about 99.5% of the work text | S4 split sentences |

**Verdict counts:** DEFECTS 4 · COMPLETE-VS-SOURCE 6 · SCREENED 0 · NEEDS-INVESTIGATION 0 · SOURCE-NOT-IDENTIFIED 0.

## Checks performed and tool caveats

- For every book I aligned the full source text against each served source edition with `align.py` (k=6). The minimum run was 12 tokens, and I lowered it (to 3, 5 or 8) where noted. I inspected every run of 25 or more tokens and every EXTRA, ORDER and DUPLICATE result. I also checked beginnings and endings, the order of divisions, and chapter and part labels. I compared the division counts with the author's numbering: all 296 BGE aphorisms, Hume's 12 sections and their parts, Leviathan's 49 units, and the Art of War's numbered sentences.
- Each local raw was compared with the authoritative file:
  - Genealogy, On Liberty and Art of War: byte-identical to the current PG file after removing a UTF-8 BOM.
  - Fear and Trembling: byte-identical to the archive.org OCR text.
  - Descartes: identical to the current Wikisource text apart from wiki templates.
  - Leviathan, BGE, Kant, Hume and Utilitarianism have no local raw.
- modern-en (and modern-da, presence only) was checked at each real gap and through the screening flags. I also ran a more sensitive length sweep: modern/original below 0.62 for paragraphs of 50 or more words, or above 1.8. It returned hits only for the Art of War, and all of them are compressions, not dropped sentences.
- **Caveats**
  - The Leviathan marginal-note counts are heuristic. They count blocks with at least 70% capitalised words and at most 40 words, so the figures are approximate.
  - In the Art of War, commentary was removed by dropping blocks that start with "[". Three commentary paragraphs whose opening bracket is missing in PG were identified by hand.
  - Coverage of the Fear and Trembling OCR is understated by running heads, page numbers and OCR debris.
  - PG files were fetched in one batch that ended at 2026-09-25T11:54:38Z; pg3207 was retried and fetched at 11:54:47Z.
  - The 190 ORDER anomalies in the Leviathan pass with notes removed are a cascade artifact. The full-source run shows 0.

---

## fear-and-trembling: Fear and Trembling (reconciliation)

**Served editions**

| Key | sha256 (first 16 hex) | Label |
|---|---|---|
| original-da | `c61144bbf51a9307` | Original (1843) |
| original-en | `d6f7ab72adfe4c16` | Original (English) |
| modern-en | `152776f19e1b707b` | Modern English |
| modern-da | `f23fe5bb5f7d3fe3` | Moderne Dansk |

**Successor package:** `origin/claude/hopeful-tesla-7s5ziw:books/wip/fear-and-trembling-tinct-en/` (commit `f5aa101bc898`). It is accepted and not published. I did not redo it.

- **Baseline confirmed.** The served modern-en `152776f1…` and original-da `c61144bb…` equal the RELEASE-PACKET "Replaces live sha256" values. The candidate files I extracted match the accepted hashes: modern-en `c48a3252…`, original-da `290fec6a…`, footnotes `345f2eee…`.

**Sources**

- **Raw OCR:** `https://archive.org/download/frygtogbvendial00kiergoog/frygtogbvendial00kiergoog_djvu.txt`, retrieved 2026-09-25T11:55:18Z, sha256 `902cb9ec4168e6c105f845aa29043336b05a2b88de65d4967f8a785fa250f5e7`. It is byte-identical to `books/raw/fear-and-trembling/raw.txt`. It is the 3rd edition (C. A. Reitzel, 1895): archive.org gives `year` 1895 and `date` 1980. The raw SOURCE.md's "1980 reprint" comes from that `date` field.
- **Corrected source:** the package candidate original-da, its 18 footnotes and front matter.
- **original-en has no authoritative external source.** It is a 2026 AI translation (commit `b76fa5649`, 2026-05-04). original-en, modern-en and modern-da all sit on the same 232-slot structure as the served original-da (5/13/17/42/32/29/88/6 per chapter).

**Work body:** raw lines 194 ("Forord.") to 5733 (the last footnote). The library slip that follows is excluded. The title page and motto (raw 158–173) were checked separately.

**Alignment of original-da**

| Source | Source covered | Edition covered | Runs ≥25 | EXTRA / ORDER / DUP |
|---|---|---|---|---|
| raw OCR | 94.08% | 98.45% | 8 | 0 / 0 / 0 |
| corrected source + notes | 96.48% | 98.99% | 8 | 14 OCR-debris runs / 8 (footnote slots) / 0 |

- The eight runs are the two weaning refrains and six footnote runs: n4.22a, n5.31a, n6.24a, n7.47a (two runs) and n8.5a with n8.5b (one run). n7.67a is below the threshold. This reproduces CHANGED-PARAGRAPHS §A and §B exactly.
- **Currently served versus the planned successor.** Everything in the findings table is true of the **served** editions today. I also aligned the raw OCR against the successor (candidate plus notes plus front matter). No unexplained run of 12 or more tokens remains; the only leftovers are OCR-garbled Greek and Latin, one heading and one hyphenation artefact. So the successor restores every item below.

**Verdict: DEFECTS.** Every item is an EXISTING-REPAIR, fixed by the accepted but unpublished successor.

| ID | Type | Sev | Location | Summary | Existing repair |
|---|---|---|---|---|---|
| G08-fear-and-trembling-01 | MISSING | S2 | after 2.6; after 2.8 | Two of the four Attunement weaning refrains are absent from all 4 editions, 90 Danish words in all. They run "Naar Barnet er blevet stort og skal vænnes fra…" and "…ikke behøvede at sørge mere!" (raw 475–478, 508–513) | CHANGED-PARAGRAPHS §A (final ¶2.7, ¶2.10) |
| G08-fear-and-trembling-02 | MISSING | S2 | after 4.22, 5.31, 6.24, 7.47, 7.67, 8.5 | About 900 words of Johannes de silentio's own footnotes are missing: 5 notes entirely, 2 in part. Among them are the Lessing note, the collision/duty note and the ironist (Aristophanes/Voltaire) note (raw 1740–1756, 2944–2966, 3505–3525, 4952–4986, 5293, 5729–5733) | §B, `candidate/footnotes.json` |
| G08-fear-and-trembling-03 | MISPLACED | S3 | 7.16, 7.20, 7.23, 7.28, 7.36, 7.38, 7.50, 7.79, 7.83; spliced into 4.4, 4.21, 4.22, 7.17, 7.34 | 13 footnotes are served inside the body: 8 as their own paragraphs and 5 spliced into the running text, some mid-sentence | §B |
| G08-fear-and-trembling-04 | MISLABELED | S2 | label of `original-en` | "Original (English)" is an AI translation with no source; it inherits every gap above | EDITION-PLAN.md (retire) |
| G08-fear-and-trembling-05 | MISSING | S3 | before 1.0; before ch 4 | Authorial front matter is not served: the subtitle "Dialektisk Lyrik", the pseudonym, the Hamann motto and the "Problemata" part title (raw 158, 161, 172–173, 950) | `front-matter.json` |
| G08-fear-and-trembling-06 | MISSING | S4 | before 2.4, 2.6, 2.7, 2.9; 6.6/6.7 | The Attunement numerals I.–IV. are dropped. *fatte* is lost at a page break, and original-en misplaces "comprehend" | §A, `structure.json` |
| G08-fear-and-trembling-07 | MISPLACED | S4 | book-wide | Paragraphs are split at page breaks mid-sentence, e.g. 1.0\|1.1 "…it is a great / rarity in our age!". The book is served as 232 slots against 184 printed paragraphs | STRUCTURE-MAP |
| G08-fear-and-trembling-08 | EXTRANEOUS | S4 | 1.1, 5.0, 5.13, 7.3, 7.40, 7.45, 7.67 | OCR debris is served in place of Greek, Latin and German quotations, e.g. "dvo ur ovv tov uvdov usqn…" | `source/CORRECTIONS.md` |

**Open questions**

- modern-da cannot stay aligned under the 184-paragraph successor. The package escalates its retirement to Anders.
- The earlier package `origin/claude/fear-and-trembling-modern-en-20260911:books/staged-replacements/fear-and-trembling` covers ch01 only and is superseded.

---

## beyond-good-and-evil: Beyond Good and Evil

**Served editions**

| Key | sha256 (first 16 hex) | Label |
|---|---|---|
| original-en | `a906a663863727ff` | Zimmern (1907), Helen Zimmern |
| modern-en | `5b14eaa83a4b695a` | Modern English |
| modern-da | `ee3d488e2e798a6a` | Moderne Dansk |

**Source:** `https://www.gutenberg.org/cache/epub/4363/pg4363.txt`, retrieved 2026-09-25T11:54:38Z, sha256 `ac99e74a7913004c2e94289dae28e6b03b6ad96c97f2fd5f72ce29caff0b4888`. Header: *Beyond Good and Evil* / Friedrich Wilhelm Nietzsche / Translator Helen Zimmern. The aftersong "From the Heights" is translated by L. A. Magnus. There is no local raw.

**Body:** "PREFACE" (line 87) to the PG end marker. The PG end-line (6153) was included so that it would register.

**Alignment of original-en:** 99.91% source covered, 100.0% edition covered. The only missing run is 12 tokens: the aftersong heading and byline "FROM THE HEIGHTS / By F W Nietzsche / Translated by L. A. Magnus". There are 0 EXTRA, 0 ORDER and 0 DUP results.

**Structure:**
- Preface with its Sils Maria signature (1.0–1.1).
- Chapters I–IX, holding all 296 aphorisms.
- The 15-stanza aftersong.

Four aphorism numbers are embedded in the preceding paragraph rather than starting their own: 237 (plus 237A), 278, 281 and 282. This is the reason chapter 8 has 25 paragraphs for 26 aphorisms and chapter 10 has 37 for 40.

**Verdict: DEFECTS.** The authorial text is complete; the defects are boilerplate and structure.

| ID | Type | Sev | Location | Summary |
|---|---|---|---|---|
| G08-beyond-good-and-evil-01 | EXTRANEOUS | **S1** | 11.30 | "End of Project Gutenberg's Beyond Good and Evil, by Friedrich Nietzsche" is the book's last paragraph in all 3 editions, untranslated in modern-da (pg4363 line 6153). It follows "…Light and Dark were one that wedding-morn." (11.29) |
| G08-beyond-good-and-evil-02 | MISPLACED | S4 | 8.22, 10.20, 10.22 | Aphorisms 237 ("Seven Apophthegms for Women"), 237A, 278, 281 and 282 are merged into the preceding aphorism, in all editions (pg4363 lines 4221–4243, 5725–5736, 5746–5777) |
| G08-beyond-good-and-evil-03 | MISLABELED | S4 | ch 11 | The aftersong is Magnus's translation, but its credit is not served and the edition says "Zimmern". The stanza numbers 1–15 are served as 15 paragraphs of one token each |

**Scope and variants:**
- Seven bracketed translator/editor footnotes are served inline in original-en (3.3, 6.0, 8.15, 10.7, 10.26); modern-en has none.
- The original-en title "Epigrams and Interludes" differs from Zimmern's "Apophthegms and Interludes" (VARIANT).

---

## descartes-meditations: Meditations on First Philosophy

**Served editions**

| Key | sha256 (first 16 hex) | Label |
|---|---|---|
| original-en | `98e410390472e0f6` | Veitch (1901), John Veitch |
| modern-en | `789863ff9c80db5b` | Modern English |
| modern-da | `1327a6cd7eed7244` | Moderne Dansk |

**Sources**

- **Recorded source:** Wikisource `Meditations_on_First_Philosophy`, 9 subpages fetched as raw wikitext at 2026-09-25T11:58:39Z. The concatenated text has sha256 `6f5b41baa52669459ec7102cb0d6d17079eb6d9e5a34a83512b0a46ed3c57138`. The header reads translator John Veitch, 1901, first published 1853, and the page is tagged `{{no source}}`. The local raw matches it apart from wiki templates.
- **Independent cross-check:** the 1901 scan *The Method, Meditations and Philosophy of Descartes* (`themethodmeditat00descuoft_djvu.txt`, sha256 `6caefb66b2e47152c1aa8e90ca1e886665bfd402b03962c64c4e5fc4700671e2`, retrieved 2026-09-25T11:59:05Z). I used its Meditations part only, from "TO THE VERY SAGE AND ILLUSTRIOUS" to "…the weakness of our nature."
- Project Gutenberg has no Veitch Meditations. #70091 is the 1680 Molyneux translation.

**Alignment of original-en**

| Source | Source covered | Edition covered | Runs ≥25 | EXTRA / ORDER / DUP |
|---|---|---|---|---|
| Wikisource | 99.54% | 100.0% | 1 | 0 / 0 / 0 |
| 1901 scan | 95.13% | 97.36% | 1 | 1 / 0 / 0 |

- The Wikisource run ≥25 is 32 tokens: Veitch's bracket note plus a heading. The other runs are section headings.
- The scan's residual runs are OCR noise, running heads and headings.

**Structure:** Letter of Dedication, Preface to the Reader, Synopsis and Meditations I–VI are all present and in order. The text ends "…acknowledge the weakness of our nature." The green-descartes-meditations package's "corrupt source" items (S1–S7) are printer's errors, not missing text.

**Verdict: COMPLETE-VS-SOURCE** (Wikisource Veitch, corroborated by the 1901 scan). No findings.

**Scope and open questions**
- **Scope:** Veitch's note explaining the square brackets was removed by a documented choice. The brackets remain in the text with no explanation.
- **Open question:** the Wikisource text is unsourced, and its wording and paragraph numbering differ slightly from the 1901 printing, so the label "Veitch (1901)" is approximate.
- **Cosmetic variant:** 9.23 carries the typo "ac. knowledge".

---

## kant-groundwork: Groundwork of the Metaphysics of Morals

**Served editions**

| Key | sha256 (first 16 hex) | Label |
|---|---|---|
| original-en | `39baa06718f8c737` | Abbott (1879), Thomas Kingsmill Abbott |
| modern-en | `2ac2fce500388299` | Modern English |
| modern-da | `1ec3983ff14eba1a` | Moderne Dansk |

**Source:** `https://www.gutenberg.org/cache/epub/5682/pg5682.txt`, retrieved 2026-09-25T11:54:38Z, sha256 `a4dfea90e9dc394871bcae6069025d16b3990f83ed5f17b5a00eef0651e84758`. Header: *Fundamental Principles of the Metaphysic of Morals* / Immanuel Kant / tr. Thomas Kingsmill Abbott. There is no local raw.

**Body:** "PREFACE" to the PG end marker.

**Alignment of original-en:** 99.96% source covered, 100.0% edition covered. There are no missing runs of 12 or more tokens, and 0 EXTRA, 0 ORDER and 0 DUP results.

**Structure:** the Preface, Sections I–III and the Concluding Remark are complete.

**Verdict: COMPLETE-VS-SOURCE.**

| ID | Type | Sev | Location | Summary |
|---|---|---|---|---|
| G08-kant-groundwork-01 | MISPLACED | S4 | 18 note paragraphs, 2.15 to 4.37; headings 3.93, 3.95\|3.96, 3.98\|3.99, 4.5\|4.6, 4.9, 4.21, 4.25, 4.42 | Kant's 18 footnotes are served as body paragraphs beginning "\*". The sub-headings are served as body paragraphs, and three of them are split across two paragraphs. This applies to all editions |

---

## genealogy-of-morals: On the Genealogy of Morals

**Served editions**

| Key | sha256 (first 16 hex) | Label |
|---|---|---|
| original-en | `2377b4157b8e28c2` | Samuel (1913), Horace B. Samuel |
| modern-en | `72ca79453b9a485f` | Modern English |
| modern-da | `4e1dc72f97f6c9ac` | Moderne Dansk |

**Source:** `https://www.gutenberg.org/cache/epub/52319/pg52319.txt`, retrieved 2026-09-25T11:54:38Z, sha256 `90ab67b3c15fb8a4220f36b559514098e33f43d58e4403405575949c039c1cba`.
- The title page gives the translator as Horace B. Samuel. The PG header credits J. M. Kennedy, who translated the appended fragment.
- The local raw equals this file after BOM removal.

**Body:** "PREFACE." (line 89) up to "PEOPLES AND COUNTRIES. Translated by J. M. KENNEDY" (line 5081).

**Alignment of original-en:** 99.70% source covered, 99.998% edition covered. The 3 runs of 25 or more tokens (60, 36 and 32) are all Samuel's translator footnotes, marked "H.B.S.", which were removed by a documented choice. There are 0 EXTRA, 0 ORDER and 0 DUP results.

**Structure:** the Preface (§§1–8) and Essays I (§§1–17), II (§§1–25) and III (§§1–28) are complete. First Essay §11 is served at 2.16.

**Verdict: COMPLETE-VS-SOURCE.** No findings.

- **Scope:** Oscar Levy's Editor's Note, Samuel's translator notes and *Peoples and Countries* (another work) are excluded.
- **Open question (documentation only):** `books/raw/genealogy-of-morals/SOURCE.md` wrongly says §11 of the First Essay is absent. PG has it under the heading "11", without a period.

---

## leviathan: Leviathan

**Served editions**

| Key | sha256 (first 16 hex) | Label |
|---|---|---|
| original-en | `3ec71396aaa6dd37` | Hobbes (1651) |
| modern-en | `e3462f5d27dbc2f5` | Modern English |
| modern-da | `8d4bddbe08112fe2` | Moderne Dansk |

All three editions are sharded. For original-en, the 49 chapter shards equal the monolithic JSON.

**Source:** `https://www.gutenberg.org/cache/epub/3207/pg3207.txt` (PG edition updated 2025-09-17), retrieved 2026-09-25T11:54:47Z, sha256 `3de1e492641d939567a8b0de827fb13e1ad992324f9ac8b204f60475009b7294`. There is no local raw.

**Body:** the dedication (line 114) to "FINIS". The PG "Contents of the Chapters" list (lines 160–304) is not work text.

**Alignment of original-en**

- **Full pass:** 97.64% source covered, 100.0% edition covered. There are 69 missing runs of 12 or more tokens, 13 of them of 25 or more. There are 0 EXTRA, 0 ORDER and 0 DUP results.
  - The runs of 25 or more are: the dedication together with the start of the Contents list; the rest of the Contents list; the table of sciences; and chapter and part headings joined to marginal notes.
- **Second pass, marginal-note blocks removed, minimum run 3:** 98.96% source covered. The remaining gaps are chapter headings, served as titles, plus the body-line losses in findings 03 and 04.
- The Parts I–IV are present as the chapters' `section` fields. The Introduction and the Review and Conclusion are complete.

**Verdict: DEFECTS.**

| ID | Type | Sev | Location | Summary |
|---|---|---|---|---|
| G08-leviathan-01 | MISSING | **S2** | after 10.6, 10.7, 10.8 | The Chapter IX Table of the Sciences is cut short: 245 of its 390 words are lost (pg3207 lines 2570–2700). The lost rows cover mathematics, cosmography, mechanics, physics, meteorology, astronomy and astrology, optics, music, ethics, poetry, rhetoric, logic, and just and unjust. The surviving rows carry orphaned labels ("a.", "a.", "2)"). All editions are affected. **Existing flag, not repaired:** `origin/claude/friendly-albattani-qgyqfi:books/wip/leviathan-pilot-ch10/fidelity-review-1.md` N5 (commit `47dd4e635`); the pilot candidate follows the truncated source |
| G08-leviathan-02 | MISSING | S3 | before 1.0 | Hobbes's Epistle Dedicatory to Francis Godolphin (416 words, lines 114–155) is not served in any edition |
| G08-leviathan-03 | MISSING | S3 | after 1.0; after 1.2 | The Introduction's plan loses "To describe the Nature of this Artificiall man, I will consider" and "Thirdly, what is a Christian Common-Wealth. Lastly, what is the Kingdome of Darkness." (lines 335, 343, 345). The served plan names only Parts I–II |
| G08-leviathan-04 | MISSING | S3 | after 7.17; after 7.26; after 32.17 | Body lines were dropped together with the marginal notes. They are "Anger-- Sudden Courage, ANGER." and "Liberality-- Magnanimity in the use of Riches, LIBERALITY" from the catalogue of passions, and "Therefore to attribute Figure to him, is not Honour; for all Figure is Finite:" (lines 1714, 1742, 11957–11958) |
| G08-leviathan-05 | UNCERTAIN | S3 | book-wide | Hobbes's 1651 marginal notes are handled inconsistently. About 540 of roughly 675 note blocks are absent (about 3,500 words). 42 are served as standalone body paragraphs, for example 16.18, 23.8, 27.22, 34.21, 43.20 and 48.0, which opens Chapter 47. A few survive inline ("Hope--"). There is no documented policy |

**Other packages:** the `leviathan-repair` and `leviathan-pilot-*` folders on `origin/claude/friendly-albattani-qgyqfi` are modern-en quality work on the served structure.
- Only pilot-ch10 records a completeness problem.
- pilot-ch13 and batch B treat inline marginal headings as a property of the source.
- The staged pilot candidates inherit the gaps above.

**Open question:** decide a policy for the marginal notes. Either restore them all as side-headings, or strip the 42 stray note paragraphs.

---

## hume-enquiry: An Enquiry Concerning Human Understanding

**Served editions**

| Key | sha256 (first 16 hex) | Label |
|---|---|---|
| original-en | `49ce7d94889fd07f` | Hume (1748) |
| modern-en | `8b9b306e32e35f90` | Modern English |
| modern-da | `228687c99a0293b8` | Moderne Dansk |

**Source:** `https://www.gutenberg.org/cache/epub/9662/pg9662.txt`, retrieved 2026-09-25T11:54:38Z, sha256 `647459bc720d0fe09f85ac17b8d7edc2557ff89ba4467151407a4d48228be2cb`. It is Selby-Bigge's 1902 text of the posthumous 1777 edition. There is no local raw.

**Body:** "SECTION I." to the start of the analytical index. The index is editorial.

**Alignment of original-en:** 99.80% source covered, 100.0% edition covered. There is 1 missing run (12 tokens, a heading) and 0 EXTRA, 0 ORDER and 0 DUP results.

**Structure:** the 19 served units map to the 12 sections as follows: I, II, III, IV (Parts 1–2), V (1–2), VI, VII (1–2), VIII (1–2), IX, X (1–2), XI, XII (1–3). The text ends "…nothing but sophistry and illusion."

**Verdict: COMPLETE-VS-SOURCE.**

| ID | Type | Sev | Location | Summary |
|---|---|---|---|---|
| G08-hume-enquiry-01 | MISLABELED | S4 | ch 19 | Section XII Part III is labelled "— Part 0" in all editions (PG line 5137 reads "PART III.") |
| G08-hume-enquiry-02 | MISPLACED | S4 | 34 note paragraphs; ch 8 title | Hume's 34 footnotes are served as body paragraphs "[n] …", and the marker "[9]" appears in the title "Section 6: OF PROBABILITY[9]." |

**Open question:** Hume's 1777 Advertisement (authorial, about 150 words) is absent both from PG #9662 and from the served edition.

---

## on-liberty: On Liberty

**Served editions**

| Key | sha256 (first 16 hex) | Label |
|---|---|---|
| original-en | `ce17fe17570e069d` | Original (1859) |
| modern-en | `12be1b0b5132554b` | Modern English |
| modern-da | `d6e0ac08b19b7672` | Moderne Dansk |

**Source:** `https://www.gutenberg.org/cache/epub/34901/pg34901.txt`, retrieved 2026-09-25T11:54:38Z, sha256 `fad90451253e40190995748ed5d5b60b48b0881cd1a37fa705e471bc628b36ca` (Walter Scott Publishing Co.). The local raw equals it after BOM removal.

**Body:** the dedication (lines 57–72), then the Humboldt epigraph (485–492), then "ON LIBERTY." to the end. W. L. Courtney's introduction (lines 74–452) is excluded.

**Alignment of original-en:** 98.01% source covered, 100.0% edition covered. There are 4 runs of 25 or more tokens (350, 328, 134 and 127), and **all of them are Mill's own footnotes**. There are 0 EXTRA, 0 ORDER and 0 DUP results.

**Ending verified:** "…it has preferred to banish." closes 5.22 in all editions. The dedication and epigraph are served as 1.0 and 1.1 inside "Chapter 1 — Introductory", a documented choice (cosmetic).

**Verdict: DEFECTS.**

| ID | Type | Sev | Location | Summary |
|---|---|---|---|---|
| G08-on-liberty-01 | MISPLACED | **S3** | 2.44 | Served 2.44 ("If the arguments of the present chapter are of any validity…", 221 words) is the second paragraph of Mill's footnote 6, on the 1858 press prosecutions and tyrannicide. It is served as the close of Chapter II, after the chapter's real ending in 2.43 ("…conscientiously strive towards it."). The note's anchor (2.0, "propriety;") and its first paragraph (about 124 words, PG 2410–2421) are not served. All editions are affected |
| G08-on-liberty-02 | SCOPE | S3 | notes to Chapters II–IV | Mill's footnotes 6–14 (1,111 words, 890 of them not served anywhere) were removed by a documented choice ("All footnotes stripped for readability"). They include substantive notes: fn6 (345 words), fn10 (294), fn13 (lunacy commissions, 289) and fn14 (Bombay Parsees, 128). This is a policy question, not a defect |

---

## utilitarianism: Utilitarianism

**Served editions**

| Key | sha256 (first 16 hex) | Label |
|---|---|---|
| original-en | `29360c7dbdc7de58` | Mill (1863) |
| modern-en | `7457e909ce911b50` | Modern English |
| modern-da | `46ed443acf9c23bb` | Moderne Dansk |

**Source:** `https://www.gutenberg.org/cache/epub/11224/pg11224.txt`, retrieved 2026-09-25T11:54:38Z, sha256 `2b2e413b8df7d42790546a6c636802f10da3ee472cc94a85d3e12204b6385241`. It is the 7th edition (Longmans, 1879). There is no local raw.

**Body:** "CHAPTER I." to the PG end marker. This includes Mill's notes A–D, printed after Chapter II and after "THE END."

**Alignment of original-en:** 99.87% source covered, 100.0% edition covered. There are no missing runs of 12 or more tokens, and 0 EXTRA, 0 ORDER and 0 DUP results.

**Verdict: COMPLETE-VS-SOURCE.**

| ID | Type | Sev | Location | Summary |
|---|---|---|---|---|
| G08-utilitarianism-01 | MISPLACED | S4 | 2.25, 2.26, 5.37, 5.38 | Mill's four notes are served as body paragraphs, labelled "[Footnote A: …]" to "[Footnote D: …]". As a result the book ends on Footnote D, after Mill's real closing sentence ("…the sterner character of its sanctions.", 5.36). All editions are affected |

**Open question (library-wide convention):** the label year 1863 is the first book edition, but the text served is the 1879 7th edition.

---

## the-art-of-war: The Art of War

**Served editions**

| Key | sha256 (first 16 hex) | Label |
|---|---|---|
| original-en | `60beeb94051b0731` | Giles Translation (1910), Lionel Giles |
| modern-en | `bf41e7a3a4412025` | Modern English |
| modern-da | `07668460e5031235` | Moderne Dansk |

**Source:** `https://www.gutenberg.org/cache/epub/132/pg132.txt`, retrieved 2026-09-25T11:54:38Z, sha256 `c478f7e05a07bf190585fcea0bc4658ce22e47949ac18444eca53fb274878ffe`. The local raw equals it after BOM removal.

**Body:** "Chapter I. LAYING PLANS" to the end. Every block beginning with "[" was removed (Giles's commentary and footnotes). The result is in scratch at `tmp/artofwar-work2.txt` (sha256 `e359a91e…`). Giles's preface, introduction and commentary are editorial scope.

**Alignment of original-en:** 95.11% source covered, 100.0% edition covered, with 0 EXTRA, 0 ORDER and 0 DUP results.
- The only runs of 25 or more tokens (426 and 61), and one run of 19, are Giles commentary paragraphs whose opening bracket is missing in PG. I verified this by hand.
- Excluding them, the work text is about 99.5% covered; the remainder is chapter headings.

**Verdict: COMPLETE-VS-SOURCE.**

| ID | Type | Sev | Location | Summary |
|---|---|---|---|---|
| G08-the-art-of-war-01 | MISPLACED | S4 | 9.11\|12, 9.17\|18\|19, 9.35\|36, 11.67\|68, 13.29\|30 | Five of Sun Tzu's sentences are split across paragraphs where commentary was cut out. All editions are affected |

**Notes on the screening flags:**
- The DUP_ADJ flags at 10.29–10.31 are genuine parallel sentences (§§27–29).
- modern-en is about 23% shorter overall. The five paragraphs with low length ratios are compressions and contain no dropped sentences.

---

## Scratch artifacts

Everything below is under `/tmp/claude-0/-home-user-tinct/93e13969-8fc2-5d26-b841-c55c3e5a62a3/scratchpad/groups/G08-philosophy/`:

- `src/`: downloaded sources.
- `runs/*.json`: every `align.py` report cited above.
- `tmp/`: derived work-text files and helper scripts.
  - `lev_notes.py`, `lev_strip.py`, `lev_own.py`: the Leviathan marginal-note analysis.
  - `ft-*`: the extracted Fear and Trembling package candidate.
