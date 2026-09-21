# Montaigne Batch E — Content Fidelity Repair Notes

Scope: chapters 45–55 ("Of the battle of Dreux" through "Of smells").
Method: every paragraph of `mt-batchE-current-modern-en.json` was read
side-by-side against the corresponding paragraph in the locked
`mt-batchE-source.json`, checking for dropped/invented content, meaning
inversions, compressed passages, dropped citations, and factual/historical
distortions.

## Overall verdict

This batch is a genuinely high-fidelity modernization — the best-behaved of
the batches reviewed so far. Every classical citation, anecdote, numeral,
name, and argumentative turn in all 11 chapters is present and correctly
rendered into modern register. No dropped clauses, no invented material, no
meaning inversions, and no compressions were found. All Latin/Greek
quotations and their bracketed English glosses are preserved verbatim or
near-verbatim (only cosmetic modernization of quote-mark style).

## Per-chapter verdict

| # | Title | Verdict |
|---|-------|---------|
| 45 | Of the battle of Dreux | Faithful — no defects |
| 46 | Of names | Faithful — no defects |
| 47 | Of the uncertainty of our judgment | Faithful — no defects |
| 48 | Of war horses, or destriers | 1 defect found and fixed (see below) |
| 49 | Of ancient customs | Faithful — no defects |
| 50 | Of Democritus and Heraclitus | Faithful — no defects |
| 51 | Of the vanity of words | Faithful — no defects |
| 52 | Of the parsimony of the ancients | Faithful — no defects |
| 53 | Of a saying of Caesar | Faithful — no defects |
| 54 | Of vain subtleties | Faithful — no defects |
| 55 | Of smells | Faithful — no defects |

## Defects found and fixed

### Chapter 48 ("Of war horses, or destriers"), paragraph index 34

**Type:** Factual/historical distortion (anachronistic weapon substitution).

**Source text (exact):**
> "A pretty description of something very like an arquebuse-shot. The ten
> thousand Greeks in their long and famous retreat met with a nation who
> very much galled them with great and strong bows..."

**Defective text (exact, as found in current-modern-en):**
> "A pretty description of something very like a musket-shot. The ten
> thousand Greeks on their long and famous retreat met a nation that gave
> them a lot of trouble with great strong bows..."

**Issue:** Montaigne is likening the very long Greek arrows described by
Xenophon to the report of a firearm going off. The source specifies the
**arquebus** (the firearm of Montaigne's own era, and the one he discusses
earlier in the same chapter when dismissing "the astonishment of the ear"
of gunpowder weapons). The modern rendering silently substituted "musket,"
a related but distinct 16th-century firearm class (heavier, later, and not
the weapon Montaigne is referring to in his own discussion just a few
sentences earlier). This is a small but real factual/terminological
distortion — it swaps out the specific historical weapon Montaigne named
for a different one.

**Fix applied (exact):** Changed "a musket-shot" to "an arquebus-shot" in
`mt-batchE-corrected.json`, chapter 48, paragraph index 34 (article also
corrected from "a" to "an" to match the vowel sound of "arquebus").

## Items considered and deliberately left unchanged (not defects)

- Spelling modernizations that do not change meaning or reference (e.g.
  "Montmorenci" → "Montmorency" in the ch. 45 footnote; "Massilians" →
  "Massylians" in ch. 48 — both refer to the same real entities and match
  the accompanying Latin quotations; "Argian" → "Argive" in ch. 49).
- Minor rewording inside the bracketed English glosses of Latin/Greek
  citations (e.g. ch. 51 para 5, the Juvenal gloss on carving hares/hens —
  the modern version rephrases "observes"/"relates" as "does it matter"/
  "does it tell," but the underlying Latin quotation itself is untouched
  and the translated meaning is unchanged).
- Clarifying additions that make the referent explicit without changing
  meaning (e.g. ch. 47 para 19: "to fight him in Italy" → "fighting
  Hannibal in Italy" — Hannibal is unambiguously the referent in context).
- "the powder, the stone, and the wheel" → "the powder, the flint, the
  wheel" (ch. 48 para 21): "stone" in this context refers to the flint used
  in a wheel-lock firing mechanism, so "flint" is a correct clarification,
  not a substitution of a different object.

## Verification

Paragraph counts were verified programmatically to match the source exactly
for all 11 chapters (45–55) before finalizing `mt-batchE-corrected.json`.
No paragraph was added, removed, split, or merged.
