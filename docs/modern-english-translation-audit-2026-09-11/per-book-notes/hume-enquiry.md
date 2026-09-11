# hume-enquiry — *An Enquiry Concerning Human Understanding*, David Hume (1748)

Reviewer: batch agent, Enlightenment/liberal political philosophy batch, 2026-09-11.
Scope: `public`.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en "Hume (1748)" | `49ce7d94889fd07f` | 19 | 318 | 53,644 |
| modern-en "Modern English" | `8b9b306e32e35f90` | 19 | 318 | 53,188 |
| modern-da "Moderne Dansk" | `228687c99a0293b8` | 19 | 318 | 51,710 |

`en_editions_aligned: true`; no count mismatches, no truncation, no empty paragraphs;
`pct_identical_long_paragraphs: 1.6`, `mean_weighted_similarity: 0.8496`;
`last_chapter_suspiciously_short: false` (1,512 words).

## Core English text — provenance and completeness

English original. All twelve of Hume's Sections are present, split into 19 chapters where a
Section has Parts:

`ch1 §1 · ch2 §2 · ch3 §3 · ch4–5 §4 Parts 1–2 · ch6–7 §5 Parts 1–2 · ch8 §6 · ch9–10 §7
Parts 1–2 · ch11–12 §8 Parts 1–2 · ch13 §9 · ch14–15 §10 Parts 1–2 · ch16 §11 · ch17–19 §12`

**Completeness: good.** Hume's own footnotes are present as paragraphs (`[1] It is probable
that no more was meant by those, who denied innate ideas…`, `[2] Resemblance.`, etc.), 67
markers with matching note text. Hume's paragraph numbering ("23.", "90.") is carried inline.

Two **metadata/rendering defects**, both present in `original-en` and `modern-en` alike:

- Chapter 19 is titled *"Section 12: OF THE ACADEMICAL OR SCEPTICAL PHILOSOPHY. — **Part 0**"*.
  It is Part 3. Off-by-one in the ingest.
- Chapter 8's title is *"Section 6: OF PROBABILITY**[9]**."* — a footnote marker has been
  pulled into the chapter title.
- `_italic_` underscore markers are left raw in the body text of **both** editions (578 in
  source, 576 in modern), e.g. *"let us ask: `_Does it contain any abstract reasoning
  concerning quantity or number?_`"*. Readers see the underscores.

## Phase 1 flags — confirmed / disconfirmed

- `mean_weighted_similarity: 0.8496` — a genuine modernisation, but shallower than the number
  suggests. Word-level: **22 of 275** long paragraphs ≥0.97 identical (8%, 6% of words);
  median word-similarity **0.921**.
- Per-chapter median word-similarity: `ch1 = 0.72 · ch2–ch5 ≈ 0.86 · ch6–ch8 = 0.88 ·
  ch9–ch12 = 0.90–0.91 · ch13 = 0.95 · ch14 = 0.93 · ch15 = 0.95 · ch16 = 0.96 · ch17 = 0.94 ·
  ch18 = 0.96 · ch19 = 0.96`. The same front-loaded effort curve as the other books in this
  batch: Section 1 genuinely rewritten, Sections 9–12 barely touched.
- Archaism check corroborates: source has 25 archaic forms (`hitherto` ×13, `nay` ×4,
  `wherein` ×3, `shew`/`shews` ×3, `withal`), `modern-en` still has 5. Hume's vocabulary is far
  less archaic than Locke's to begin with, so this is a mild finding.
- `truncated_paragraphs_total: 0` / `empty_paragraphs_total: 0` / short-final-chapter — all
  **disconfirmed**; the closing paragraphs of ch. 19 are complete.

## Samples inspected (6 passages, ~1,100 source words)

### 1. §1 (Different Species of Philosophy), para 4 (219 → 214 words) — the mechanical outlier (lowest word-similarity in the book, 0.52). *Strong.*
- source: "The mere philosopher is a character, which is commonly but little acceptable in the
  world, as being supposed to contribute nothing either to the advantage or pleasure of society;
  while he lives remote from communication with mankind, and is wrapped up in principles and
  notions equally remote from their comprehension. On the other hand, the mere ignorant is still
  more despised; nor is any thing deemed a surer sign of an illiberal genius in an age and
  nation where the sciences flourish, than to be entirely destitute of all relish for those
  noble entertainments."
- modern: "The mere philosopher is generally not very welcome in the world, since he is thought
  to contribute nothing to either the advantage or the pleasure of society, living apart from
  human contact and wrapped up in principles and ideas equally remote from ordinary
  comprehension. On the other hand, the merely ignorant man is despised even more; and in an age
  and nation where the sciences flourish, nothing is taken as a surer sign of a coarse mind than
  to have no taste at all for those noble pursuits."
- Finding: excellent. *illiberal genius* → *coarse mind* and *noble entertainments* → *noble
  pursuits* are accurate period-sense renderings, not flattening. The three-part structure
  (philosopher / ignorant / the mean between them) is intact, including "retaining an equal
  ability and taste for books, company, and business."

### 2. §4 Part 1 (Sceptical Doubts), para 4. *Light.*
- source: "23. If we would satisfy ourselves, therefore, concerning the nature of that evidence,
  which assures us of matters of fact, we must enquire how we arrive at the knowledge of cause
  and effect."
- modern: "23. If we wish, therefore, to satisfy ourselves about the nature of that evidence
  which assures us of matters of fact, we must inquire how we arrive at the knowledge of cause
  and effect."
- Finding: the hinge of the induction argument; faithful, and the paragraph number is preserved
  so cross-references still work.

### 3. §7 Part 2 (Of the Idea of Necessary Connexion), para 5 (212 → 207 words). *Light; technical terms kept.*
- source: "No animal can put external bodies in motion without the sentiment of a _nisus_ or
  endeavour… as we _feel_ a customary connexion between the ideas, we transfer that feeling to
  the objects"
- modern: "No animal can put external bodies in motion without the sentiment of a _nisus_ or
  endeavor… since we _feel_ a customary connection between the ideas, we transfer that feeling
  to the objects"
- Finding: faithful; *nisus* and *a priori* are kept italicised rather than glossed away, which
  is right. "annexing"→"attaching", "connexion"→"connection". Real but small clarity gain.

### 4. §10 Part 1 (Of Miracles), para 12 (74 words) — **argument-chain check: passes.** *Light.*
- source: "…let us suppose, that the fact, which they affirm, instead of being only marvellous,
  is really miraculous; and suppose also, that the testimony considered apart and in itself,
  amounts to an entire proof; in that case, there is proof against proof, of which **the
  strongest** must prevail, but still with a diminution of its force, in proportion to that of
  its antagonist."
- modern: "…let us suppose that the fact they affirm, instead of being only marvelous, is really
  miraculous; and suppose also that the testimony, considered apart and in itself, amounts to a
  complete proof; in that case there is proof against proof, of which **the stronger** must
  prevail, but still with a diminution of its force in proportion to that of its antagonist."
- Finding: the marvellous/miraculous distinction and the proportionality clause are both exact.
  "the strongest" → "the stronger" is a *correction* (two proofs are being compared), not a
  drift.

### 5. §12 Part 3, para 11 (71 words) — the famous "commit it then to the flames". *Verbatim.*
- Word-similarity **1.000**. The only change in the paragraph is `;` → spaced em-dashes.
- Finding: defensible — Hume's closing is already perfectly clear — but it is also the single
  most-quoted paragraph in the book shipping unmodernised under a "Modern English" label, and
  with raw `_..._` markers visible.

### 6. §12 Part 3 and §11 tail spot-checks (ch. 18 p2, ch. 19 p9). *Verbatim / near-verbatim.*
- ch18 p2 word-similarity 0.990; ch19 p9 1.000.

## What I did NOT find

No omissions, no inventions, no chapter-bleed, no altered quantifiers or modal force
(possibility vs. certainty is handled carefully in the Miracles material), no over-glossing, no
term inconsistency. Hume's irony survives where it is sampled.

## Phase 3 — human-edition research

Hume's 1748 English is the most accessible 18th-century prose in this batch — the barrier is
long periodic sentences and a handful of period senses (`sentiment`, `genius`, `entertainments`,
`connexion`), not vocabulary. Chapters 1–8 of the current modern-en clear that barrier; 13–19
do not.

1. **Jonathan Bennett, *Early Modern Texts* — "An Enquiry Concerning Human Understanding
   (1748)"**. Complete plain-English version; catalogued at
   https://www.earlymoderntexts.com/texts
   **Rights: NOT usable.** https://www.earlymoderntexts.com/faqs/rights: *"Permission is not
   and will not be given for the texts to be put to any commercial use."* → noncommercial
   restriction, explicitly non-negotiable. Tinct's Premium tier is commercial use.
2. **Project Gutenberg #9662 / Standard Ebooks** carry Hume's own text (PD). Would be an
   `original-en` typography upgrade (real italics instead of `_underscores_`, chapter titles
   fixed), not a modernisation.
3. The Selby-Bigge / Nidditch critical editions (OUP) are **in copyright — permission required**
   for the editorial apparatus; the Hume text itself is PD.
4. No rights-clear complete human modern-English *Enquiry* found in this search. "None found in
   this search", not "none exists".

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 4 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 5 |

Weighted score **4.6** — band: **Strong**.

Clarity 4 rather than 5: Sections 9–12 (chs. 13–19, ~37% of the book) are close to untouched,
and the raw underscore markers are a live reader-facing defect in both editions.

## Recommendation

**LIGHT EDIT**

1. Deepen chapters 13–19 (Sections 9–12, including *Of Miracles* Part 2 and *Of a Particular
   Providence*) to the standard of chapters 1–8.
2. Fix the two title bugs: ch. 19 "Part 0" → "Part 3"; ch. 8 "OF PROBABILITY[9]." → strip the
   stray footnote marker.
3. Render `_italic_` markers as real emphasis (or strip them) in both `original-en` and
   `modern-en`.

- Confidence: **medium-high** — six passages spanning Sections 1, 4, 7, 10 and 12; the coverage
  statistics are measured over all 275 long paragraphs.
- Correction scope: **local** for the bugs; **local-to-substantial** for the chs. 13–19 deepening
  (~18,000 words, but the existing text is already sound, so this is editing rather than
  retranslating).

## Limitations of this review

Six passages, ~1,100 source words of 53,644. I did not read Sections 2, 3, 5, 6, 8, 9 or 11
closely. I did not check `modern-da`. I did not verify which printing the `original-en` derives
from (1748 first edition vs. the posthumous 1777 text that most modern editions follow — the
paragraph numbering suggests a modern numbered edition, and the registry label "Hume (1748)"
may therefore be imprecise; worth a separate check). I did not read Bennett's Hume (rights ruled
it out first).
