# walden — Walden, Henry David Thoreau

**Scope:** public. Audited 2026-09-11. **7 passages inspected** (plus a whole-book mechanical diff).

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label in registry |
|---|---|---|---|---|---|
| original-en | `880a909fb8da73db` | 18 | 502 | 106,344 | "Thoreau (1854)", year `1854` |
| modern-en | `d2d20614cb168f7d` | 18 | 502 | 106,370 | "Modern English" |
| modern-da | `a289d165e360133b` | 18 | 502 | 103,081 | "Moderne Dansk" |

Mechanical comparison (original-en → modern-en): mean weighted similarity **0.9698**, identical
long paragraphs **16.8%**, 0 truncation flags, 0 empty paragraphs, 0 paragraph-count mismatches,
`en_editions_aligned: true`. Flagged in Phase 1's 33-book watch list.

Provenance: English original, Henry David Thoreau, *Walden; or, Life in the Woods* (Ticknor and
Fields, 1854). Complete — all 18 chapters. Public domain. No translator involved; `original-en` is
the author's own text.

Note the word counts: modern-en is **26 words longer** than the 1854 original across 106,000 words.

## HEADLINE FINDING: modern-en is not a modern edition

**Outside chapter 1, the "Modern English" edition is Thoreau's own 1854 text with typographic
normalisation and scattered single-word substitutions.**

I ran a word-level diff of every paragraph of every chapter and counted changed tokens:

| chapter | words | changed tokens | % |
|---|---:|---:|---:|
| 1 Economy | 25,548 | 1,445 | **5.7%** |
| 2 Where I Lived, and What I Lived For | 6,079 | 146 | 2.4% |
| 3 Reading | 3,766 | 195 | 5.2% |
| 4 Sounds | 5,697 | 107 | 1.9% |
| 5 Solitude | 3,432 | 62 | 1.8% |
| 6 Visitors | 4,746 | 119 | 2.5% |
| 7 The Bean-Field | 3,871 | 67 | 1.7% |
| 8 The Village | 2,020 | 166 | 8.2% |
| 9 The Ponds | 9,156 | 97 | **1.1%** |
| 10 Baker Farm | 2,553 | 86 | 3.4% |
| 11 Higher Laws | 4,206 | 74 | 1.8% |
| 12 Brute Neighbors | 4,789 | 101 | 2.1% |
| 13 House-Warming | 5,718 | 69 | 1.2% |
| 14 Former Inhabitants… | 4,672 | 124 | 2.7% |
| 15 Winter Animals | 3,634 | 124 | 3.4% |
| 16 The Pond in Winter | 5,204 | 42 | **0.8%** |
| 17 Spring | 6,628 | 99 | 1.5% |
| 18 Conclusion | 4,625 | 76 | 1.6% |

And a paragraph-identity count over the 484 long (≥80-char) paragraphs:

- **82 (16.9%) are byte-for-byte identical** to the 1854 text.
- **140 (28.9%) are identical once curly quotes, em-dashes and whitespace are normalised** — i.e.
  more than one long paragraph in four differs from Thoreau only in punctuation glyphs.

This is the ≥0.95 "known-mechanical" band described in `mechanical/README.md`, and unlike
don-quixote and essays-montaigne in this same batch, **walden genuinely sits in it**.

## Samples inspected (7)

### 1. Chapter 1 "Economy", ¶0–1 — the only substantially edited chapter

SRC ¶1: *"…if I did not feel lonesome; if I was not afraid… I am confined to this theme by the
narrowness of my experience."*
MOD ¶1: *"…whether I felt lonely; whether I was afraid… the narrowness of my experience confines me
to this subject."*

**Finding — this chapter *is* a real, if light, modernization.** "Obtrude my affairs so much on the
notice of my readers" → "press my own affairs on my readers so insistently"; "impertinent" →
"rude"; "kindred" → "relatives"; passive periodic constructions unwound into active ones. 5.7% of
tokens changed. If the whole book looked like this, this note would read very differently.

### 2. Chapter 2 "Where I Lived…", ¶16 — the "morning / to be awake is to be alive" passage (585 words, 0.983 similarity)

SRC: *"There was something **cosmical** about it… the mechanical nudgings of some **servitor**… All
memorable events, I should say, **transpire** in morning time…"*
MOD: *"There was something **cosmic** about it… the mechanical nudgings of some **servant**… All
memorable events, I should say, **happen** in morning time…"*

**Finding — copy-edit, not modernization.** Three word substitutions in 585 words. Everything else —
*"I have been as sincere a worshipper of Aurora as the Greeks"*, *"It was Homer's requiem; itself an
Iliad and Odyssey in the air, singing its own wrath and wanderings"*, *"only one in a hundred
millions to a poetic or divine life"* — is Thoreau verbatim. Which, for this passage, is defensible:
it is already luminous English and the standard says a readable source beats a rewrite. But it means
the edition is not doing what its label promises.

### 3. Chapter 2 ¶17 — *identical*

SRC = MOD, word for word, 159 words: *"We must learn to reawaken and keep ourselves awake, not by
mechanical aids, but by an infinite expectation of the dawn… To affect the quality of the day, that
is the highest of arts."*

**Finding — byte-identical paragraph in a "Modern English" edition.** One of 82 such long
paragraphs.

### 4. Chapter 9 "The Ponds" (0.99 similarity, 1.1% tokens changed) and Chapter 16 "The Pond in Winter" (0.99, 0.8%)

**Finding — the two longest descriptive chapters in the book are effectively untouched.** 9,156 and
5,204 words respectively, with 97 and 42 changed tokens between them. Whatever pass produced
chapter 1 did not meaningfully reach these.

### 5. Chapter 18 "Conclusion", ¶18 — the "solid bottom everywhere" / "drive a nail home" passage (515 words, 0.974)

SRC: *"Let us not play at **kittly-benders**. There is a solid bottom every where… I would not be
one of those who will foolishly drive a nail into mere **lath and plastering**… Give me a hammer,
and let me feel for the **furring**."*
MOD: *"Let us not play at **kittly-benders**. There is a solid bottom everywhere… I would not be one
of those who will foolishly drive a nail into mere **lath and plastering**… Give me a hammer, and
let me feel for the **furring**."*

**Finding — the failure is not just that nothing changed; it is that nothing changed *where change
was actually needed*.** In a 515-word paragraph the only edits are `every where`→`everywhere` and
three dashes. Meanwhile "kittly-benders" (a New England children's game of running on bending ice),
"lath and plastering" and "furring" (building trades) all pass through unglossed — and this is the
paragraph where Thoreau's whole argument turns on them.

Whole-book check for the same class of term, all present unchanged in modern-en and unexplained:
**kittly-benders** (1), **tintinnabulum** (2), **pellicle** (1), **furring** (1), **lath and
plastering** (1), **Mameluke** bey (1), **sedulously** (2).

### 6. Chapter 18 ¶19 — the one substantive repair in the sample set

SRC: *"I called on the king, but he made me wait in his hall, and **conducted** like a man
incapacitated for hospitality."*
MOD: *"I called on the king, but he made me wait in his hall, and **conducted himself** like a man
incapacitated for hospitality."*

**Finding — a genuine copy-edit fix** (the 1854 text as transmitted drops the reflexive). But the
paragraph is otherwise identical, and this is the sort of change that belongs in a corrected source
text, not in a separate "modern" edition.

### 7. Chapter 18 ¶20–21 — the "China pride" / "learned societies of Assyria" passage

SRC ¶20: *"…**Beside**, we are sound asleep nearly half our time."*
MOD ¶20: *"…**Besides**, we are sound asleep nearly half our time."*
SRC ¶21 = MOD ¶21, identical, 159 words.

**Finding.** ¶20: two edits (`Assyria,—`→`Assyria—`, `Beside`→`Besides`) in 347 words. ¶21: zero
edits. Thoreau's deliberate word-choices, aphorisms and puns are fully intact — because the text
is untouched.

## Thoreau's repetition/precision protections (the brief's specific concern)

The brief asked whether the modernization smooths away Thoreau's deliberate word choices, on the
model of the Meditations / Art of War problems. **The answer is that it cannot, because there is
almost no modernization.** *"I went to the woods because I wished to live deliberately"*, the
three-fold *"Simplicity, simplicity, simplicity"*, *"the mass of men lead lives of quiet
desperation"*, the sleepers/railroad pun — all present, all untouched. On this axis the edition
scores perfectly for the wrong reason.

## Phase 1 flags: confirmed vs. disconfirmed

| Flag | Verdict |
|---|---|
| mean similarity 0.9698 (mechanical band) | **Confirmed, decisively.** Independent per-chapter token-diff: 14 of 18 chapters change under 3.5% of tokens; three change under 1.5%. |
| 16.8% identical long paragraphs | **Confirmed** (I measure 16.9%), and **understated**: 28.9% of long paragraphs are identical once punctuation glyphs are normalised. |
| `trunc=0`, 0 empty, 0 mismatches | **Confirmed** — trivially, since the text is the source text. |
| "does the modernization smooth away Thoreau's precision?" | **Disconfirmed** — nothing to smooth it away. |
| Possible fill-from-unrelated-source | **Disconfirmed** — proper-noun retention median 0.991; it *is* Walden. |

## Phase 3 — accessibility of the English original

Per the instructions, for an English original the first question is whether the source already meets
the reading standard.

**Largely yes, with real local exceptions.** Thoreau's 1854 prose is syntactically modern — short
declaratives, active voice, concrete nouns. Nobody needs "the mass of men lead lives of quiet
desperation" rewritten. The barrier is not the grammar; it is:

- **New England material culture and trades**: kittly-benders, furring, lath and plastering,
  chopping-block economics, the specific pricing of 1845 Concord.
- **Dense classical/Orientalist allusion**: Aurora, Memnon, the Vedas, Tching-thang's bathing tub,
  the Mameluke bey, Homer's requiem.
- **Latinate/technical vocabulary used precisely**: tintinnabulum, pellicle, sedulously, "Genius"
  in the daimonic sense.
- **A very long first chapter** (25,548 words, a quarter of the book) of household accounting that
  defeats most first-time readers.

Every one of these is a **gloss** problem, not a rewrite problem. A rewrite would damage the prose;
a gloss layer would remove the actual barrier. The current modern-en does neither — it neither
rewrites (0.8–2.5% of tokens in most chapters) nor glosses (zero glosses found).

**Human-edition research: not applicable in the usual sense** — there is no translation to replace.
For reference, clean rights-clear source texts exist (Project Gutenberg #205; Standard Ebooks, whose
production work is CC0), so if we ever want a better-punctuated base text it is freely available.
I did not research annotated scholarly editions (e.g. Cramer's *Yale Annotated Walden*, Shanley's
Princeton text) — those are in copyright and were out of scope for this pass.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | **5** — nothing is missing, added, or shifted. It is Thoreau. (This score is not evidence of editorial skill; it is a consequence of the text being a near-copy.) |
| first-read clarity | 25% | **2** — the edition's entire purpose is removing a reader barrier and it removes essentially none outside chapter 1; the terms that actually stop a modern reader (kittly-benders, furring, tintinnabulum, pellicle, Mameluke) pass through unglossed |
| literary voice | 20% | **5** — perfectly preserved, for the same reason fidelity is 5 |
| restraint / no invention | 10% | **5** — no invention found |
| naturalness | 5% | **4** — reads as 1854 American prose, which is fine; but the edition is internally inconsistent (ch 1 rewritten at 5.7%, ch 16 at 0.8%), so scattered modern substitutions sit oddly inside otherwise untouched Victorian paragraphs |

**Weighted score: 4.2 — band: Good with fixes.**

**Read the band with care.** The weighted score is high because fidelity and voice carry 60% of the
weight and both are trivially perfect when the "translation" is a copy of the source. The score does
**not** mean the modern edition is good; it means the underlying text is good. The actionable signal
is the clarity score of 2.

## Recommendation

**SOURCE + GLOSSES.** Confidence: **high**. Estimated correction scope: **substantial** (as a
product decision; the current file needs no repair because it is not broken, it is redundant).

The current `walden-modern-en.json` duplicates `walden-original-en.json` to within ~2.5% of tokens
and 28.9% of its long paragraphs are identical modulo punctuation. Offering it to readers as a
distinct "Modern English" edition is a promise the file does not keep, and a reader who toggles
between the two editions will see no difference on most screens.

Recommended course:
1. **Do not commission a full AI rewrite of Walden.** Thoreau's precision, puns and repetitions are
   the book, and 0.97 similarity says the earlier pass already (correctly) declined to touch them.
2. **Retire or relabel the modern-en edition.** Either drop it, or re-scope it explicitly as a
   *lightly copy-edited reading text* — which is what it honestly is, and which is defensible on its
   own terms.
3. **Build the gloss layer instead.** The barrier is vocabulary and allusion, both of which Tinct
   already has a mechanism for. Start with chapter 1 (a quarter of the book and the main abandonment
   point) and the terms listed above.
4. If any rewriting is done at all, confine it to chapter 1's accounting passages.

## Limitations of this review

- 7 read passages out of 502 paragraphs. The *reading* verdict is sample-based.
- The **mechanical** verdict is not: the per-chapter token-diff and the identical-paragraph counts
  cover 100% of the book, and that is what the recommendation mostly rests on.
- I did not check modern-da, which at 103,081 words may well be a real translation and is a
  separate question.
- I did not research annotated scholarly editions of Walden or their rights.
- I did not verify our `original-en` against a specific 1854 or Princeton text; I confirmed only
  that it is Thoreau's text and that modern-en tracks it.
