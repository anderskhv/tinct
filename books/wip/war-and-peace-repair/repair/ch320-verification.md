Model: opus

# Chapter 320 (Book Fifteen, 1812–13 — Chapter 3) — independent verification

Verifier did not draft, review or correct this chapter. Paragraph indices below are **0-based** (JSON array index); the fidelity review's numbers are 1-based, so index = n−1.

Files compared:
- source: `ch320-source.json`
- pre-correction candidate: `ch320-candidate.json`
- corrected: `ch320-corrected.json`
- log: `ch320-corrections-log.md`
- context: `ch320-fidelity.md`, `ch320-candidate-notes.md`

## 1. Diff vs log

Independently computed diff (candidate vs corrected), 0-based:

`[0, 3, 4, 11, 12, 13, 14, 15, 16, 18, 20]` — 11 paragraphs changed.

Log entries: indices 0, 3, 4, 11, 12, 13, 14, 15, 16, 18, 20 — 11 entries.

**Exact match.** Every logged change is present in the file; every changed paragraph is logged. Each log entry's quoted *Before* string was checked byte-for-byte against the candidate paragraph and its *After* string against the corrected paragraph: all eleven match exactly. No blocking mismatch.

## 2. Per-change verdicts (re-derived from the source, not from the log)

### ¶0 — PASS
Source: "able to **restrain** her mother from unreasoning despair" and "the mere sound of her tender, **caressing tones soothed her mother**". Both restored verbatim in sense. The candidate's "spiraling into" (an added figure) and "soothing voice calmed the countess" (flattened twice over) are gone. No new drift; the rest of the paragraph is unchanged.

### ¶3 — PASS
Source: "the essence of life—love—was still **active** within her". "alive" (merely present) → "active" (at work). Correct, and it matters: ¶3 is the chapter's thesis sentence and the next clause is "Love awoke and so did life".

### ¶4 — PASS
Source: "The **last** weeks passed in her mother's bedroom had **strained** Natásha's physical strength." Both the dropped "last" and the sharpened "drained" are corrected. The restored "last" is load-bearing — it distinguishes the final three weeks from the whole vigil described in ¶0.

### ¶11 — PASS (three distinct fixes)
- **The withheld name.** Source: "*Is she like him?*" — the source never names Prince Andrew in this chapter, and ¶16 states the reason ("they never mentioned him"). The candidate's "Is she like Andrew?" supplied the name the source deliberately withholds. Corrected restores "him". I re-derived this from the source independently of the review: the referent is fixed by ¶4 ("Prince Andrew's last days had drawn Princess Mary and Natasha together"), so no information is lost by withholding the name, and the ¶11↔¶16 chain is restored. Correct.
- Source: "Yes, like and yet not like. But she is **quite original**, strange, new, and unknown." Restored exactly; the candidate's "like him and yet not like him / entirely her own person" both over-specified.
- Source: "But how? **What is her mind like?** What does she think about me?" Restored. The candidate's "What does she think about?" duplicated the following question and deleted a distinct item from the monologue.

Two candidate readings are retained and unlogged because they are unchanged, not new: "Everything good" for "All that is good", "wonderful" for "splendid". Neither is a finding.

### ¶12 — PASS
Source: "Let us be **quite, quite** friends." The candidate's "the very best of friends" replaced Natasha's childlike doubling with a superlative of degree. Restored; "Let's" (contraction) is retained from the candidate and is not a fidelity matter.

### ¶13 — PASS
Source: "making Princess Mary feel shy but happy **by this demonstration of her feelings**". Restored verbatim. "at this outpouring of feeling" had both intensified the noun and detached the feelings from Natasha.

### ¶14 — PASS
- Source: "more in harmony with one another than either of them felt **with herself** when alone." Restored. Without "with herself" the comparison had no second term and the self-relation — which is the sentence's point — had vanished.
- Source: "an **exclusive feeling of life being possible only in each other's presence**." Restored verbatim. "an intense sense" had swapped exclusivity for intensity.

### ¶15 — PASS
Source: "feeling herself bound to Princess Mary by **affection**, learned to **love** her past too". The candidate had the two words swapped ("by love … learned to appreciate"). Restoring them puts "love" back where the chapter's thesis (¶3) needs it. Correct; nothing else in this long paragraph changed.

### ¶16 — PASS
Source: "Just as before, they never **mentioned him** so as not to lower (as they thought) their exalted feelings by words". The candidate's "never spoke of Andrew" made the sentence refute itself in its own clause. Restored. The candidate's "(as they felt)" and "by putting them into words" are retained unchanged and are not findings.

### ¶18 — PASS
Source: "One day she **went** quickly upstairs and found herself out of breath … then, testing her strength, **ran** upstairs again". The candidate used "ran" for both, erasing the contrast between the involuntary discovery and the deliberate re-test — which is the whole experiment the paragraph describes. Restored. "Without thinking" for "Unconsciously" is retained from the candidate and is not a finding.

### ¶20 — PASS
Source: "beneath the layer of **slime** that covered her soul". Restored. "mud" was neutral where the source is repellent, and the repellence is what the sprouting grass is set against.

## 3. Read as a new reader

All eleven corrected paragraphs read clearly. ¶11 is measurably clearer than the candidate, whose "What does she think about? What does she think about me?" read as an accidental stammer. ¶14's restored "with herself" makes a sentence that previously trailed off into an objectless "in harmony" finally complete.

*Reader note (non-blocking):* the restored "him" at ¶11 asks the reader to carry the referent from ¶4, and ¶16's "him" from there again. I checked this as a new reader would: ¶4 names Prince Andrew in its first five words and ¶5–¶10 have no other male referent, so the anaphora holds. The source asks exactly the same of its reader, and ¶16 supplies the explanation retroactively. No change recommended.

## 4. Structure and punctuation

- Paragraph count: source 22, candidate 22, corrected 22. Match.
- Order preserved; no paragraph moved, merged or split.
- No empty or whitespace-only paragraphs.
- `number` (320) and `title` ("Book Fifteen (1812 - 13) — Chapter 3") identical across all three files. JSON parses clean.
- Per-paragraph `?` and `!` parity against source: **no discrepancies in any of the 22 paragraphs** (¶11's five question marks and one exclamation are all preserved).
- No bracket tags, no footnote-slot paragraphs and no orphan `*` markers in this chapter; nothing for the French convention to touch.

## 5. Findings

- **No MAJOR findings** — the fidelity review recorded none.
- **All five MODERATE findings resolved**: ¶12 naming, ¶17 naming, ¶12 "What is her mind like?", ¶15 "with herself", ¶19 went/ran (review's 1-based numbering). Each re-derived from the source and confirmed correct and complete.
- **All ten MINOR findings applied.**
- **Declined findings are accurate.** Both declined items (¶3 concessive "yet", ¶11 "of the room") are genuinely absent from the diff, both are COSMETIC, and neither falls under the correction mandate.
- **No new drift introduced.** Every changed paragraph was re-read in full against its source paragraph; no correction reached beyond the finding it answers.
- One new COSMETIC, non-blocking: ¶10 still reads "in the semidarkness" where the source has "in the semidarkness of the room" (the declined finding). Harmless.

Verification: ACCEPT
sha256: 901f71483c1363ae225786d131b10d7a532d6506132370d880fb09939e32d87c
