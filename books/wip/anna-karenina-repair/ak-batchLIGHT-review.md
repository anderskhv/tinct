# Independent Adversarial Review — ak-batchLIGHT-modern-en.json

Reviewer: independent QA pass (not the drafter). Chapters reviewed: 29, 33, 44, 45, 46, 47, 48, 49 (8 chapters, batch flagged "LIGHT" by the mechanical similarity scan).

## Verdict: **ACCEPT AS-IS**

This is a genuine, faithful re-rendering. It should clear the similarity gate and can be spliced back into the book's `modern-en.json`. No fidelity violations found that require a re-draft. Two very minor polish notes below (optional, not blocking).

---

## 1. Structural integrity — PASS

Programmatic paragraph-count check against `ak-batchLIGHT-source.json`:

```
Chapter 29 (ch.29): src=6  new=6  ✓
Chapter 33 (ch.33): src=26 new=26 ✓
Chapter 10 (ch.44): src=1  new=1  ✓
Chapter 11 (ch.45): src=14 new=14 ✓
Chapter 12 (ch.46): src=4  new=4  ✓
Chapter 13 (ch.47): src=67 new=67 ✓
Chapter 14 (ch.48): src=44 new=44 ✓
Chapter 15 (ch.49): src=34 new=34 ✓
```

All 8 chapters match source paragraph count exactly. No merges, splits, or dropped paragraphs. JSON is well-formed and matches the `{number, title, paragraphs}` shape of the source and old files.

## 2. Fidelity — PASS

Read every paragraph of all 8 chapters against the Garnett source. Findings:

- **No dropped clauses/sentences.** Long, clause-heavy Garnett sentences (e.g., the ch.29 half-delirious train sequence, the ch.47 farm-management digressions, the ch.12/46 spring-arrival set piece) are fully represented — restructured into shorter modern sentences, but every image, clause, and beat survives (the paper-knife against the cheek, the stove-heater peasant, the screwing-peg nerve simile, the "warm, very warm, hot" inner voice, etc. in ch.29; the full farm-implement/bailiff back-and-forth in ch.47; the full spring natural-history catalogue in ch.46).
- **No invented content.** Spot-checked numeric/factual details for drift: 800/300/400 acres (wheat/potatoes/clover) in ch.47, "forty — thirty-seven or thirty-eight" laborers, "seventy roubles," the "fifteen acres of forty-five" clover-sowing shortfall — all preserved exactly.
- **No meaning inversions or softened content.** The ch.45 consummation-scene "murderer and his victim's body" extended metaphor — one of the most stylistically extreme and emotionally charged passages in the book — is rendered at full intensity, not euphemized or trimmed (paragraphs 5–6 of ch.45 checked closely against source; imagery of hacking/dragging the body is kept). Anna's recurring nightmare (both men as husbands) in ch.45 is intact. Stiva's frank "Ossian's women" / pleasure-in-the-hunt-not-the-catch dialogue in ch.48 is kept unsanitized.
- **No relationship/plot distortions.** Kitty's illness disclosure at the end of ch.49 (doctors sent her abroad, feared she may not survive) — a significant plot beat — is fully and accurately carried over.
- **Character name spelling is consistent** throughout the batch and matches established book convention: Anna, Anna Arkadyevna, Vronsky, Alexey Alexandrovitch (never shortened to "Karenin" — matches source usage in these chapters, which also never uses "Karenin" alone here), Stepan Arkadyevitch / Stiva, Levin, Kitty, Dolly, Annushka, Laska, Agafea Mihalovna, Vassily, Vassily Fedorovitch, Mishka, Ipat, Kouzma. No spelling drift or inconsistent forms found within the batch.

### One terminology note (minor, non-blocking)
In ch.48, the drafter rendered "to have some stand-shooting second" (Stiva listing his reasons for the visit) as "second, to get some **woodcock** shooting in." The source itself never names the bird species in that line — "stand-shooting" is left generic there — while ch.49, describing the same hunting outing, explicitly and repeatedly says **"snipe"** (matching Garnett's own word choice throughout that chapter). Introducing "woodcock" in ch.48 when the same activity is called "snipe" three pages later in ch.49 is an interpretive gloss not present in the source, and it creates a minor species inconsistency within the batch for a reader tracking closely. It doesn't change plot, character, or tone, and "stand-shooting for woodcock" is historically accurate to the Russian hunting practice Tolstoy describes — but since the batch's own ch.49 says "snipe," this is worth a one-word fix (swap "woodcock" → "some" / drop the species name, or change ch.49's "snipe" to "woodcock" for consistency — the latter is not recommended since it would touch a chapter outside this note). Recommend: change ch.48's "woodcock shooting" to a generic phrase ("to get some shooting in" / "some stand-shooting") to match the source's own restraint there and stay consistent with ch.49.

A second, cosmetic-only observation: ch.29 renders "this officer boy" as "this boy of an officer," which reads slightly awkward/foreign in modern English (inverted possessive construction). Meaning is unchanged (still refers to Vronsky as a young officer), so this is a style nit, not a fidelity issue.

Neither of these two items rises to "needs re-drafting" — they're the kind of note that could be fixed with a one-line edit if the team wants to polish before final sign-off, but they do not block acceptance.

## 3. Genuine modernization vs. mechanical copying — PASS, and clearly the point of this batch

This is the core reason the batch exists, so I scrutinized it hardest.

**Quantitative check.** Computed paragraph-level `difflib` similarity ratios (source vs. old-mechanical, source vs. new, old vs. new) across all 8 chapters:

```
ch29: src↔old=0.521  src↔new=0.328  old↔new=0.541
ch33: src↔old=0.835  src↔new=0.596  old↔new=0.628
ch44: src↔old=0.171  src↔new=0.230  old↔new=0.245   (single very long paragraph, low baseline noise)
ch45: src↔old=0.848  src↔new=0.575  old↔new=0.629
ch46: src↔old=0.670  src↔new=0.074  old↔new=0.171   (paragraphs are long descriptive blocks; new is a full rewrite)
ch47: src↔old=0.838  src↔new=0.583  old↔new=0.662
ch48: src↔old=0.888  src↔new=0.648  old↔new=0.707
ch49: src↔old=0.872  src↔new=0.564  old↔new=0.626
```

For most chapters the *old* "LIGHT" file sat at 0.83–0.89 similarity to Garnett — confirming the scan's "essentially still Garnett with word-swaps" diagnosis. The *new* file drops to 0.56–0.65 similarity to source in those same chapters, and is similarly distant from the old file (0.6–0.7) — i.e., this is not a light edit layered on top of the old file, it's an independent rewrite, consistent with the drafter's notes.

**Qualitative spot checks** (source → old → new), confirming real restructuring rather than synonym-swapping:

- Ch.29 opening: Source: *"Still in the same anxious frame of mind, as she had been all that day, Anna took pleasure in arranging herself for the journey with great care."* → Old: *"Still in the same anxious frame of mind she had been in all day, Anna took pleasure in arranging herself for the journey with great care."* (near-identical, just de-archaized grammar) → New: *"She'd been anxious all day, and that same restlessness stayed with her as she settled in for the journey, taking great care over every detail."* (subject reordered, clause restructured, contraction used, genuinely different sentence shape).
- Ch.33 motto: Source *"Unhasting and unresting"* → Old kept it verbatim → New: *"Without haste, without rest"* — a real re-translation of the (Goethe-derived) motto into contemporary idiom rather than preserving the archaic coinage.
- Ch.45 murder metaphor: Source *"And with fury, as it were with passion, the murderer falls on the body, and drags it and hacks at it; so he covered her face and shoulders with kisses."* → New: *"And with something like fury, almost like passion — the way a murderer falls on the body and drags and hacks at it — that's how he covered her face and shoulders with kisses."* — clause order inverted, em-dash restructuring, "as it were" (archaic hedge) replaced with natural "something like" / "almost like." Intensity fully preserved, syntax genuinely modern.
- Ch.47 bailiff exchange: Source *"What would you have with those peasants!"* → Old paraphrased close to Garnett → New: *"What can you do with peasants like these?"* — natural contemporary idiom, not a word-swap.

Dialogue-heavy chapters (47, 48, 49) were checked line-by-line: one line of source dialogue maps to one line of output dialogue throughout, contractions are used naturally where a modern speaker would use them, and register shifts (bailiff's fatalism, Stiva's banter, Levin's terseness) read as distinct voices rather than uniformly flattened prose.

**Conclusion:** this is real paragraph-by-paragraph re-rendering, not mechanical cleanup. It should pass the similarity gate.

## 4. Name-spelling consistency — PASS

Checked every character name occurrence across all 8 chapters in the new file. All spellings are internally consistent and match the conventions used elsewhere in the book (per the drafter's own notes, cross-checked against usage within this batch): Anna, Anna Arkadyevna, Vronsky, Alexey Alexandrovitch, Alexey Vronsky (used once in the ch.45 dream, matching source), Stepan Arkadyevitch / Stiva, Levin, Konstantin Dmitrievitch (used in dialogue, matching source), Kitty, Dolly, Sergey Ivanovitch, Annushka, Laska, Agafea Mihalovna, Vassily, Vassily Fedorovitch, Mishka, Ipat, Kouzma, Ignat, Shtcherbatskys, Marya Nikolaevna, Ryabinin. No variant spellings or mid-batch drift found.

---

## Summary

| Check | Result |
|---|---|
| Paragraph counts match source (all 8 ch.) | PASS |
| Content fidelity (no drops/invention/inversion/sanitizing) | PASS (1 minor terminology inconsistency noted, non-blocking) |
| Genuine modernization vs. mechanical | PASS — quantitatively and qualitatively confirmed |
| Name-spelling consistency | PASS |

**Recommendation:** Accept as-is. Optionally apply the one-word ch.48 "woodcock" → generic-phrase fix before final sign-off, but it does not need to block splicing this batch back into the book's `modern-en.json` and re-running `classify-modern-en.py --gate`.
