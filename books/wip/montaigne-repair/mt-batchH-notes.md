# Montaigne Batch H — Content-Fidelity Repair Notes

**Scope:** Chapters 78–88 (11 chapters, 184 paragraphs total), checked paragraph-by-paragraph
against `mt-batchH-source.json` (locked ground truth).

**Method:** Full side-by-side read of every paragraph in every chapter — source vs. current
modern-English rendering — checking for dropped/invented clauses, meaning inversions,
compressed or dropped citations/anecdotes, factual/historical distortions, and any other
content-fidelity break. Frank material (violence, torture, castration, self-mutilation, death)
was checked for preservation, not softening.

**Overall verdict: HIGH FIDELITY.** This batch is an unusually faithful modernization —
essentially a close, register-updated paraphrase with no dropped sentences, no compressed
passages, no invented content, and no meaning inversions anywhere in the 184 paragraphs. Every
Latin/Greek/Italian citation is preserved verbatim (untranslated) with its bracketed English
gloss and attribution intact. Graphic content (the castration-by-sickle and self-mutilation
episodes in ch. 86, the torture and cannibalism passages in ch. 84, the widow-immolation
description in ch. 86) is rendered in full anatomical/narrative detail, matching the source —
correctly not sanitized.

## Per-chapter verdicts

| Ch. | Title | Paragraphs | Verdict |
|---|---|---|---|
| 78 | Against idleness | 12 | Fixed — 1 defect (factual/historical) |
| 79 | Of posting | 9 | Clean |
| 80 | Of ill means employed to a good end | 23 | Clean |
| 81 | Of the Roman grandeur | 8 | Clean |
| 82 | Not to counterfeit being sick | 8 | Clean |
| 83 | Of thumbs | 12 | Clean |
| 84 | Cowardice the mother of cruelty | 33 | Clean |
| 85 | All things have their season | 17 | Clean |
| 86 | Of virtue | 20 | Clean |
| 87 | Of a monstrous child | 9 | Clean |
| 88 | Of anger | 33 | Clean |

## Defect found and fixed

### Chapter 78 ("Against idleness"), paragraph index 7 — factual/historical distortion (name misattribution)

**Exact source text (opening clause):**
> "Mule Moloch, king of Fez, who lately won against Sebastian, king of Portugal, the battle so famous for the death of three kings..."

**Exact defective text (current modern-en, before fix):**
> "Moulay Mohammed, king of Fez, who recently defeated Sebastian, king of Portugal, in the battle so famous for the death of three kings..."

**Problem:** Montaigne's "Mule Moloch" is the Elizabethan-English corruption of *Moulay Abd
al-Malik* (Abd al-Malik I Saadi), the reigning Sultan of Morocco who — while gravely ill —
commanded his troops from a litter at the Battle of Alcácer Quibir (the "Battle of the Three
Kings," 4 August 1578) and died during the engagement, ordering his death concealed so his
soldiers would not lose heart. This is exactly the figure the paragraph goes on to describe:
carried from place to place while dying, giving his last order (silence about his death) with
his finger to his lips.

The modern-en rendering substituted the name "Moulay Mohammed," which belongs to a *different*
historical figure — Abu Abdallah Mohammed II Saadi (Moulay Mohammed al-Mutawakkil), the deposed
Moroccan claimant who had allied himself *with* the Portuguese invasion to reclaim his throne,
and who drowned fleeing the battle. That is, the corrected-away name names the king who was
fighting on the *opposite* (Portuguese-allied) side from the one described — the reverse of
what the paragraph narrates. This is a genuine factual/historical distortion, not a stylistic
choice: it misattributes the sick, battle-commanding sultan's identity to his rival.

**Exact fix applied (in both `mt-batchH-current-modern-en.json` and `mt-batchH-corrected.json`):**
Changed "Moulay Mohammed, king of Fez" → "Moulay Abd al-Malik, king of Fez" (single occurrence
in the paragraph; all following pronoun references ("he," "his brother," etc.) already referred
correctly to this same figure and needed no further change).

## Notes on non-defects (considered and rejected as false positives)

- **Ch. 81, para 4:** source says "Cogidunus, king of *England*"; current modern-en says "king
  of *Britain*." This is technically a deviation from the source's literal wording, but it
  corrects a historical anachronism (Roman-era Britain, not "England") without altering meaning,
  attribution, or any fact Montaigne is making a point about. Left unchanged — not a fidelity
  break worth reverting.
- Various spelling/transliteration modernizations (Suleiman/Soliman, Murad/Amurath,
  Hunyadi/Huniades, Aeneid/AEneid, Asinius/Asnius Pollio, Charillus/Carillus, Pergamum/Pergamus,
  etc.) are consistent, non-distorting modernizations of proper names and do not change any
  fact, attribution, or meaning. Left unchanged.

## Verification

Paragraph counts were verified programmatically to match the source exactly, chapter by
chapter and in total (184 paragraphs across 11 chapters, chapter numbers 78–88 in order), for
both `mt-batchH-current-modern-en.json` (in-place fix) and `mt-batchH-corrected.json` (output
copy).
