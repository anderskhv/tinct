# democracy-in-america — *Democracy in America*, Alexis de Tocqueville (1835/1840)

Reviewer: batch agent, Enlightenment/liberal political philosophy batch, 2026-09-11.
Scope: `public`. Translated work (French original; no `original-fr` edition shipped).
**Tinct's largest work in this batch — 308,203 source words, 96 chapters, 2,258 paragraphs.**

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | sections |
|---|---|---|---|---|---|
| original-en "Reeve / Bowen (1862)" | `9fbec200460aebc0` | 96 | 2,258 | 308,203 | 2 |
| modern-en "Modern English" | `347cc8f0729f7fe0` | 96 | 2,258 | 303,372 | 2 |
| modern-da "Moderne Dansk" | `667bddd4728ecb4c` | 96 | 2,258 | 277,656 | 2 |

`en_editions_aligned: true`; no count mismatches, no truncation, no empty paragraphs;
`pct_identical_long_paragraphs: 9.2`, `mean_weighted_similarity: 0.8975`;
`last_chapter_suspiciously_short: false`.

`sections` correctly models Volume 1 (Parts 1–2, chs. 1–20) and Volume 2 (Parts 1–4,
chs. 21–96).

## Core English text — provenance (a finding) and completeness

**The registry label is wrong.** `bookRegistry.ts` records
`translator: "Henry Reeve, revised by Francis Bowen"`, `year: 1862`. The shipped text is
**Henry Reeve's translation alone**, in its later authorial-revision state, not Bowen's:

- The word "Bowen" occurs **zero** times in `original-en` and `modern-en`. Bowen's 1862 edition
  is heavily annotated by its American editor; none of that apparatus is present.
- The translator's notes that *are* present are **Reeve's own, dated 1874 and 1875** — e.g.
  ch. 4 ¶22: *"This may have been true in 1832, but is not so in 1874, when great cities like
  Chicago and San Francisco have sprung up in the Western States… — Translator's Note."*; ch. 9
  ¶62: *"…his patronage and the abuse of it have largely increased since 1833. — Translator's
  Note, 1875."* Bowen's notes would be 1862 and by the American editor.
- The text matches Project Gutenberg #815 / #816 (*Democracy in America*, Volumes 1 and 2),
  which credits **"Henry Reeve (1813–1895)"** as translator with no Bowen revision.
  https://www.gutenberg.org/ebooks/815
- Volume 1's opening paragraph is Reeve's: *"Amongst the novel objects that attracted my
  attention during my stay in the United States, nothing struck me more forcibly than the
  general equality of conditions."*

**This matters** because of the documented criticism of Reeve specifically — see Phase 3.

**Completeness: good.** Tocqueville's and Reeve's notes are present (327 note paragraphs,
21,495 words). Volume 1 ch. 47 ("Of The Use Which The Americans Make Of Public Associations In
Civil Life") is present, which is relevant because Reeve is sometimes said to have omitted the
civic-associations chapter — not the case in this text. Both volumes complete; 96 chapters
matching the standard division; the closing paragraph is correct
("…whether the principle of equality is to lead them to servitude or freedom, to knowledge or
barbarism, to prosperity or to wretchedness.").

**Rendering defect (both editions):** 346 raw footnote reference markers of the form `*a`,
`*b`, `*n` are visible inline in body text — e.g. *"Not only have these wild tribes receded,
they have been destroyed; **\*b** and as they give way or perish…"* — and note paragraphs begin
with a bare letter and bracket (`h [ Not only is slavery prohibited in Ohio…`). Reader-facing
noise inherited from the Gutenberg source.

## Phase 1 flags — confirmed / disconfirmed

- **`pct_identical_long_paragraphs: 9.2` and `mean_weighted_similarity: 0.8975` — CONFIRMED and
  understated.** Word-level measurement over all 1,800 long paragraphs: **585 (32%, and 29% of
  all words) are ≥0.97 identical to the Reeve source.** Median word-similarity 0.943.
- **The unmodernised material is concentrated in the longest chapters of Volume 1**, which is
  the worst possible distribution:

  | chapter | title | source words | cosmetic-only long ¶ | chapter median sim |
  |---|---|---|---|---|
  | ch. 19 | Vol 1 Pt 2 ch. 18 — Future Condition Of Three Races | **45,856** | **237 / 300** | **0.99** |
  | ch. 14 | Vol 1 Pt 2 ch. 13 — Government Of The Democracy | **16,832** | **100 / 120** | **0.99** |
  | ch. 9 | Vol 1 Pt 1 ch. 8 — The Federal Constitution | 26,759 | 34 / 174 | 0.92 |
  | ch. 17 | Vol 1 Pt 2 ch. 16 — Causes Mitigating Tyranny | 7,130 | 23 / 48 | 0.97 |
  | ch. 15 | Vol 1 Pt 2 ch. 14 — Advantages From Democracy | 7,349 | 20 / 50 | 0.97 |
  | ch. 3 | Vol 1 Pt 1 ch. 2 — Origin Of The Anglo-Americans | 8,373 | 18 / 51 | 0.95 |
  | ch. 16 | Vol 1 Pt 2 ch. 15 — Unlimited Power Of Majority | 6,952 | 12 / 52 | 0.94 |
  | ch. 93 | Vol 2 Pt 4 ch. 5 — Power Of Governments Increasing | 5,103 | 13 / 20 | 0.98 |
  | ch. 95 | Vol 2 Pt 4 ch. 7 — Continuation | 3,394 | 11 / 13 | 0.98 |
  | ch. 67 | Vol 2 Pt 3 ch. 5 — Masters And Servants | 3,484 | 10 / 14 | 0.98 |

  Chapter 19 alone is 15% of the whole book and is 79% untouched. Volume 2 is much more evenly
  worked (most chapters 0.82–0.95) with a handful of untouched pockets (chs. 54, 65, 66, 69, 77,
  82, 93, 95).
- `truncated_paragraphs_total: 0` / `empty_paragraphs_total: 0` / short-final-chapter — all
  **disconfirmed as problems**; verified by reading ch. 96's closing material.
- Archaism check: source 87 archaic forms (`hitherto` ×46, `nay` ×15, `thy` ×7, `unto` ×5);
  `modern-en` still carries 41. Consistent with a partial pass.

## Samples inspected (13 passages, ~2,300 source words, both volumes, all six Parts)

### Volume 1

**1. Introductory Chapter, ¶0 (167 → 158 words) — the book's thesis sentence.** *Genuine, strong.*
- source: "I readily discovered the prodigious influence which this primary fact exercises on
  the whole course of society, by giving a certain direction to public opinion, and a certain
  tenor to the laws; by imparting new maxims to the governing powers, and peculiar habits to the
  governed."
- modern: "I quickly saw the enormous influence this fundamental fact exerts on the whole course
  of society: it gives a particular direction to public opinion, a particular character to the
  laws, new principles to those who govern, and distinctive habits to those who are governed."
- Finding: faithful; the four-item parallel list is preserved as a list, and "the central point
  at which all my observations constantly converged" keeps the force of Reeve's "terminated".

**2. Vol 1 Pt 1 ch. 2 (Origin Of The Anglo-Americans), ¶20 (112 words) — the Puritans.** *Near-verbatim (0.955).*
- Only changes: "the austerity of whose principles had acquired for them" → "whose austere
  principles had earned them"; "mother-country" → "mother country"; one semicolon.

**3. Vol 1 Pt 1 ch. 5 (Townships), ¶30.** *Verbatim* — a section heading, word-similarity 1.000.

**4. Vol 1 Pt 1 ch. 8 (The Federal Constitution), ¶40.** *Verbatim* — heading only, case change.

**5. Vol 1 Pt 2 ch. 13 (Government Of The Democracy), ¶60 (123 → 118 words) — the three-class analysis.** *Cosmetic only (0.979).*
- source: "The people may always be mentally divided into three distinct classes. The first of
  these classes consists of the wealthy; the second, of those who are in easy circumstances; and
  the third is composed of those who have little or no property, and who subsist more especially
  by the work which they perform for the two superior orders."
- modern: identical except "those who are in easy circumstances"→"those in easy circumstances",
  "the work which they perform"→"the work they perform", and two deleted "which"s.
- Finding: one of 100 cosmetic-only paragraphs in this 16,832-word chapter.

**6. Vol 1 Pt 2 ch. 15 (Unlimited Power Of The Majority), ¶10 (89 words).** *Cosmetic only (0.972).*
- Whole-paragraph diff: "privileges which they had possessed"→"privileges they had possessed";
  "But as the United States were colonized"→"But since the United States were colonized";
  "amongst"→"among". Nothing else.

**7. Vol 1 Pt 2 ch. 18 (Future Condition Of Three Races), ¶20 (156 → 152 words) — the disappearance of the New England tribes.** *Light but real (0.909).*
- source: "None of the Indian tribes which formerly inhabited the territory of New
  England—the Naragansetts, the Mohicans, the Pecots—have any existence but in the recollection
  of man… Not only have these wild tribes receded, but they are destroyed; \*b"
- modern: "None of the Indian tribes that formerly inhabited the territory of New England — the
  Narragansetts, the Mohicans, the Pequots — have any existence except in the memory of man…
  Not only have these wild tribes receded, they have been destroyed; \*b"
- Finding: faithful, and it silently corrects Reeve's misspelled tribal names
  (Naragansetts→Narragansetts, Pecots→Pequots) — good editorial judgement. This is one of only
  63 genuinely-worked paragraphs out of 300 in the chapter.

**8. Vol 1 Pt 2 ch. 18, ¶120 — a note on Ohio.** *Verbatim (1.000)*; the only change is
`negroes` → `Negroes`. Note for the team: the edition retains period racial terminology
throughout this chapter. That is defensible as fidelity to Tocqueville/Reeve, but it is an
editorial decision that should be made deliberately rather than by default, and it is currently
being made inconsistently (capitalisation changed, wording not).

**9. Vol 1 Conclusion (ch. 20), ¶5 (155 → 147 words) — the prediction about Mexico.** *Genuine (0.808).*
- source: "The natives of the United States will forestall the rightful occupants of these
  solitary regions."
- modern: "The natives of the United States will get there before the rightful occupants of
  these empty regions."
- Finding: faithful; "forestall" correctly unpacked. Nothing added.

### Volume 2

**10. Vol 2 Pt 1 ch. 1 (Philosophical Method Among the Americans), ¶4 (101 → 99 words).** *Light (0.940).*
- "the habits of mind which are derived from these causes, were as yet opposed to it" →
  "the habits of mind that derive from these causes were still opposed to it";
  "It could only be generally followed in ages when…" → "It could be generally followed only in
  ages when…" (a scope-of-*only* correction, in the right direction).

**11. Vol 2 Pt 2 ch. 2 (Of Individualism), ¶1 (68 → 64 words) — Reeve's translator's note on the word "individualism".** *Genuine (0.727).*
- source: "[I adopt the expression of the original, however strange it may seem to the English
  ear, partly because it illustrates the remark on the introduction of general terms into
  democratic language which was made in a preceding chapter… —Translator's Note.]"
- modern: "[I retain the expression used in the original, however strange it may sound to
  English ears, partly because it illustrates the remark made in an earlier chapter about the
  introduction of general terms into democratic language… — Translator's Note.]"
- Finding: faithful, including the cross-reference and the attribution.

**12. Vol 2 Pt 3 ch. 5 (Masters And Servants), ¶9 (87 words).** *Verbatim (1.000)* — the French-army
analogy, unchanged apart from one semicolon becoming a full stop.

**13. Vol 2 Pt 4 ch. 6 (What Sort Of Despotism Democratic Nations Have To Fear), ¶5 (414 → 404 words) — the soft-despotism passage, the most famous in Volume 2.** *Light but real (0.954).*
- source: "…it does not tyrannize, but it compresses, enervates, extinguishes, and stupefies a
  people, till each nation is reduced to be nothing better than a flock of timid and industrious
  animals, of which the government is the shepherd."
- modern: identical for that sentence; changes elsewhere in the paragraph are "After having thus
  successively taking"→"After thus successively taking", "fashioned"→"shaping",
  "net-work"→"network", "excited"→"stirred", and semicolons→colons.
- Finding: faithful; the image is kept whole. Very little modernisation, but Reeve's English
  here is already strong.

**14. Vol 2 Pt 4 ch. 8 (General Survey Of The Subject), ¶3 (372 → 363 words) — the closing argument.** *Genuine (0.879).*
- source: "I apprehend that such men are wasting their time and their strength in virtuous but
  unprofitable efforts. The object is not to retain the peculiar advantages which the inequality
  of conditions bestows upon mankind, but to secure the new benefits which equality may supply.
  We have not to seek to make ourselves like our progenitors…"
- modern: "I fear such men are wasting their time and their strength in virtuous but
  unprofitable efforts. The task is not to retain the particular advantages that inequality of
  conditions bestows on mankind, but to secure the new benefits that equality may supply. We are
  not to seek to make ourselves like our forefathers…"
- Finding: faithful; the "not X but Y" structure and the conditional "for democratic nations to
  be virtuous and prosperous, they need only to will it" are exact.

## What I did NOT find

Across 13 passages spanning both volumes and all six Parts: no omissions, no inventions, no
content shifted between chapters, no altered quantifiers or logical relations, no invented
translator's notes (I checked — the 45 `[Footnote` blocks and 327 note paragraphs match between
editions), no name inconsistency. Where this edition works, it works well and occasionally
corrects the source. **The defect is coverage, not quality.**

## Phase 3 — human-edition research

### The Reeve problem (the batch brief asked me to check this specifically — it is real and documented)

- **Tocqueville complained to Reeve personally.** Quoted in the University of Chicago Press
  note on the Mansfield/Winthrop translation: *"Without wishing to do so and by following the
  instinct of your opinions, you have quite vividly colored what was contrary to Democracy and
  almost erased what could do harm to Aristocracy."*
  https://press.uchicago.edu/Misc/Chicago/805328note.html
- **Francis Bowen, preparing the 1862 American edition, judged Reeve's translation "utterly
  inadequate and untrustworthy"** and treated his own Volume 1 as effectively a new translation;
  he considered Reeve's Volume 2 much better and changed it far less.
  https://libguides.heinonline.org/democracy-in-america/a-brief-history

So the criticism is documented, is about **Reeve specifically**, and bites hardest on
**Volume 1** — which is exactly the volume Tinct ships in Reeve's version and has barely
modernised.

### Candidates

1. **Reeve as revised by Francis Bowen (1862; 4th ed. 1864)** — *the best rights-clear upgrade
   available.* Complete, both volumes, a genuine scholarly correction of the incumbent text by
   someone who checked it against the French.
   Rights: **public domain** (US pre-1929 publication; Bowen d. 1890, so EU life+70 long
   expired). Unambiguously clear in both jurisdictions.
   Sources verified by fetching: Internet Archive `democracyinamer00bowegoog` — I downloaded and
   read the OCR; the title page reads *"DEMOCRACY IN AMERICA. ALEXIS DE TOCQUEVILLE. TRANSLATED
   BY HENRY REEVE, Esq. EDITED, WITH NOTES, TRANSLATION REVISED AND IN GREAT PART REWRITTEN…
   By FRANCIS BOWEN, Alford Professor of Moral Philosophy in Harvard University. VOL. II.
   FOURTH EDITION. CAMBRIDGE: SEVER AND FRANCIS. 1864."* Also at University of Michigan Making
   of America (https://quod.lib.umich.edu/m/moa/AHM4083.0001.001?view=toc) and HathiTrust
   (https://catalog.hathitrust.org/Record/008653803).
   I also fetched and read the cleaner Reeve-as-revised-by-Bowen text at
   https://archive.org/stream/democracyinameri008128mbp/democracyinameri008128mbp_djvu.txt and
   compared the soft-despotism passage: *"…till each nation is reduced to nothing better than a
   flock of timid and industrious animals, of which the government is the shepherd."* — i.e.
   essentially identical to Tinct's Reeve text in Volume 2, confirming Bowen's own statement
   that he left Volume 2 largely alone. **The gain from switching would be concentrated in
   Volume 1, which is where Tinct needs it.**
   **Alignment/effort caveat:** no clean machine-readable transcription of the Bowen text was
   found; what exists is Google/IA OCR of variable quality and HathiTrust page images. Adopting
   it means a real transcription-and-proofing job, plus re-alignment of 2,258 paragraphs across
   four editions. Note that the 1945 Knopf **Phillips Bradley** edition prints the Reeve-Bowen
   text but its own introduction, editorial notes and bibliographies are 1945 material and
   should not be assumed PD.
2. **Modern translations — all in copyright, permission required:**
   - Harvey C. Mansfield & Delba Winthrop (University of Chicago Press, 2000)
   - Arthur Goldhammer (Library of America, 2004)
   - Gerald Bevan (Penguin Classics, 2003)
   - James T. Schleifer, ed. Eduardo Nolla, *Historical-Critical Edition* (Liberty Fund, 2010).
     Free to read at the Online Library of Liberty, but **Liberty Fund holds the copyright to
     the English translation**, and their stated terms permit use "for educational and academic
     purposes" — that is not permission for a commercial product. Status: **permission required
     / unclear for commercial use.** It is also a four-volume bilingual critical edition; the
     alignment burden would be enormous.
     (Confirmed only via search result text; I could not open `oll.libertyfund.org` directly —
     HTTP 403 — so treat the exact licence wording as **unverified**.)
3. No public-domain *modern-English* Tocqueville exists. Every modern translation is under
   copyright; every PD translation is 19th-century.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 3 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 4 |

Weighted score **3.9** — band: **Good with fixes**.

Fidelity 4 rather than 5: no omission or invention found in 13 samples, and the notes are
complete — but the modern-en inherits whatever Reeve's documented tilt introduces, and the
edition's provenance metadata is wrong. Clarity 3: the six longest chapters of Volume 1 are
essentially unmodernised, which is where a first-time reader spends most of their time.

## Recommendation

**LIGHT EDIT** for `modern-en` — finish the pass on named chapters — plus a separate,
higher-value source-text action.

1. **Fix the registry provenance immediately.** `bookRegistry.ts` says "Reeve / Bowen (1862),
   tr. Henry Reeve, revised by Francis Bowen". The shipped text is Reeve's, with Reeve's own
   notes dated 1874–1875 (Project Gutenberg #815/#816). Relabel to "Reeve (1875 revision)" or
   similar. This is a one-line correctness fix and it is currently misleading readers about a
   translation whose author was criticised by Tocqueville himself.
2. **Complete the modernisation pass, in this priority order (by unmodernised words):**
   ch. 19 (45,856 w, 79% untouched) → ch. 14 (16,832 w, 83%) → ch. 17, ch. 15, ch. 3 → ch. 9's
   untouched pockets → Vol 2 chs. 93, 95, 67, 77, 82, 65, 54, 69.
3. **Strip or render the 346 raw `*a`/`*b` footnote markers** in both editions.
4. **Consider replacing `original-en` with Reeve-as-revised-by-Bowen (1862/1864)** — PD in both
   jurisdictions, a documented improvement over Reeve for Volume 1, and directly responsive to
   the Tocqueville/Bowen criticism. Scope this as a separate project: transcription + proofing +
   re-alignment of all four editions.
5. Make the period-racial-terminology policy for ch. 19 explicit and apply it consistently.

- Confidence: **medium-high**. 13 passages is good absolute coverage but only ~0.7% of a
  308,000-word book; the coverage statistics are measured over all 1,800 long paragraphs and are
  reliable. The provenance finding is **high** confidence (four independent indicators).
- Correction scope: **substantial** (~90,000 unmodernised words concentrated in six chapters),
  and **unknown** for the Bowen source swap until someone assesses transcription cost.

## Limitations of this review

13 passages, ~2,300 source words of 308,203 — thorough by sample count, thin by word count for
a book this size. I read no French (Tinct ships no `original-fr` for this title), so all
fidelity judgements are Reeve-relative; I could not independently assess Reeve's documented
pro-aristocratic tilt against Tocqueville's French, only report that the criticism is
documented. I did not check `modern-da`. I could not open `oll.libertyfund.org` (403), so the
Schleifer/Nolla licence wording is second-hand and unverified. I did not read the Mansfield/
Winthrop, Goldhammer or Bevan translations. The Bowen text I read was OCR of Volume II plus the
Bradley-printing transcription; I did not read Bowen's Volume I, which is where his revisions
are heaviest and where the comparison actually matters.
