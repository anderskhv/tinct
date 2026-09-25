# Independent verification — To the Lighthouse narrow follow-up

- **Verifier:** a fresh agent that did not write the changes. It worked read-only on a packet of Woolf / BEFORE / AFTER text for each changed paragraph, with neighbouring context, plus the full before/after editions and the recompiled sidecar. It ran its own Python checks.
- **Recording:** the harness does not let subagents write report files, so the lead saved the reports below from the verifier's hand-back. Round 1 is verbatim apart from formatting.

## Round 1 (proposed successor `318937c1…`)

| Item | Verdict |
|---|---|
| A · 25.3 "some illness" uncertainty | VERIFIED CLEAN |
| A · 26.1 "then" removal | VERIFIED CLEAN |
| A · 27.0 Mrs. McNab dialect review | **DEFECT (1, minor)**: "oh dear!" flattens Woolf's "ah dear!" |
| A · 27.0 earlier fix: the washing stays with Mrs. McNab | VERIFIED CLEAN (preserved) |
| A · 40.10 "cosmogony" | VERIFIED CLEAN |
| B · Prue card snapshot `prue-2` (both editions) | VERIFIED CLEAN |
| B · Threads summary line | VERIFIED CLEAN |
| C1 · Diff scope and edition structure | VERIFIED CLEAN |
| C2 · Mention spans in 25.3 / 26.1 / 27.0 / 40.10 | VERIFIED CLEAN |
| C3 · Missing or spurious bindings | VERIFIED CLEAN |

### Paragraphs

**25.3.** The only change is "an illness" → "some illness".
- Woolf reads "died that summer in some illness connected with childbirth". AFTER reads "That summer Prue Ramsay died of some illness connected with childbirth."
- "some" restores the offhand, hearsay vagueness. "in"→"of" is a standard modernization already accepted in BEFORE.
- The hearsay frame ("people said… they said") stays, and the bracket remains a flat factual report.

**26.1.** "Violets came, and then daffodils." → "Violets came, and daffodils." (Woolf: "Violets came and daffodils.")
- The imposed sequence is gone.
- The ellipsis is Woolf's own. The comma is a listener's pause and implies no ordering.
- The rest of the paragraph is byte-identical.

**40.10.** "in their cosmos" → "in the making of their world".
- A cosmogony is the creation or generation of a world. Lily's raised mountain is a god-like meddling in the ants' creation.
- BEFORE's "cosmos" named only the existing world-order. The new phrase restores the world-making sense in plain words, and "their world" keeps the mock-epic scale.
- The participle attaches correctly to "she".

**27.0.** Nine edits, all toward Woolf:
1. The bare "—it would" tag
2. "The books and things were moldy"
3. "ruined, quite ruined", which restores Woolf's "quite" in readable order
4. "people"
5. "She'd never want _them_" with the italics kept
6. "She was dead, they said; years ago, in London." (Woolf verbatim)
7. The garden aside restored to Woolf's order, with "all" and "and"
8. "(She had died very sudden at the end, they said.)" (Woolf verbatim, keeping her "very sudden")
9. "oh dear, dear!" → "oh dear!", which removes the doubling but uses "oh" where Woolf has "ah"

None is unnecessary or harms readability, and the remaining contractions are ordinary.

- **Defect 27.0-1.** Woolf distinguishes the two women's exclamations. Mrs. Ramsay says "Oh dear! What a nuisance!" (40.9); Mrs. McNab says "ah dear!" (27.0) and "But dear," (27.2). Giving McNab Mrs. Ramsay's "oh dear" flattens her voice further than the request permits. "ah dear!" is no harder to understand. **Required fix:** "…just as they left it, ah dear!" This is the same length, so no mention offsets move.
- **The washing fix survives.** "as she came up the drive with the washing" still appears twice. The comma in the closing sentence binds the "as" clause to the one seeing, Mrs. McNab.
- **Remaining register shifts.** These were already in BEFORE and are untouched: A1 "Say the house was sold"; A4 "more than one pair of hands"; A12 "stuffed full"; and minor others. They are casual register, not dialect, and none blocks acceptance.
- **Flattenings of Woolf's own words.** F2 "with nobody in it" for "without a soul in it" can be restored optionally and is not blocking. The rest are justified or trivial.
- **Voice markers retained:** "never again, some said"; the "—it would" tag; "what with" (×2); "The moth was in them"; "Poor lady!"; "_them_"; "scuttling out at you"; "for all the world as if"; "very sudden"; "never wrote, never came"; "Why,".

### Card and threads

- **Card `prue-2`.** It now reads "…she died that summer, within months of her May wedding, of some illness connected with childbirth."
  - "That summer" is 25.3; "May wedding" is 25.1 ("that May"); "some" keeps the uncertainty.
  - "Within months" does not over-claim. 25.1 → 25.2 ("As summer neared") → 25.3 is one seasonal run inside a single section, so the gap is weeks to about four months.
  - It fixes review item 3, and it does not hint at a pre-wedding pregnancy.
  - The card is released only at the end of 25.3 (modern offset 157, original 156).
- **Threads line.** It is accurate, keeps "some", and claims no duration.

### Mechanical checks (the verifier's own Python)

- **Edition.** The BEFORE sha256 is `17c56b3d…9205` and the AFTER is `318937c1…adfd8`. The AFTER equals the sidecar's modern-en `sourceSha256`.
- **Structure.** 42 chapters and 495 paragraphs; titles, `section`, `sections` and per-chapter counts are identical. Exactly 25.3, 26.1, 27.0 and 40.10 differ.
- **Paragraph hashes.** The sidecar `paragraphHashes` (sha256 of normalized text) match AFTER for all 495 paragraphs.
- **Offsets.** The four paragraphs contain no newlines, no double spaces and no non-BMP characters, so UTF-16 offsets equal Python indices. The mentions are prue [13:24] in 25.3; mrs-mcnab [151:161] and [1348:1358] in 27.0; mrs-ramsay [1186:1197] and [2228:2239] in 27.0. All slice exactly and refer to the right person. Globally, all 1,429 modern-en mentions slice exactly.
- **Bindings.** No binding is missing and none is spurious. The unbound references are "the family", "Poor lady", "one of the children" and pronouns, consistent with the names-only policy.
- **Snapshot gate.** `prue-2`'s availableAt and evidence moved 155 → 157, the length of AFTER 25.3. Original-en stays at 156. No other anchor points into the four paragraphs.

### Out-of-scope observations (not counted)

- **27.2** (unchanged context) has the same kinds of amplification:
  - "Miss Prue gone too, so they said" (Woolf: "dead too, they said")
  - "gone up something shocking" (Woolf: "shamefully")
  - "But dear me," (Woolf: "But dear,")
  - "Oh, she remembered her well" (Woolf: "She could well remember her")

  A future pass is worth considering.
- The edition hyphenates "looking-glass" at 23.0 but writes "looking glass" at 27.0.

OVERALL (R1): DEFECTS FOUND (1)

## Lead disposition of round 1

- **Defect 27.0-1: applied exactly.** 27.0 now reads "…just as they left it, ah dear!". Edit LH-FU-4h in `edits.json` was amended. The successor modern-en is now `346726748c9a5e1ea0f070d0f911d55c53d0c50893e67c57d1cac328d1475574`.
- **Optional items: not applied.** F2 "without a soul in it", A1, A4 and A12 were left alone so the reviewed scope stays narrow ("avoid unnecessary rewriting").
- **Out-of-scope observations: recorded, not acted on.** They are 27.2 and "looking-glass"; see `CHANGES.md`.

## Round 2 (final successor `346726748c9a5e1e…`)

The same verifier re-checked the final bytes with its own Python:

| R2 item | Verdict |
|---|---|
| Hashes of the final modern-en, sidecar, editorial and threads match the expected values | VERIFIED CLEAN |
| Final vs base: exactly 25.3, 26.1, 27.0 and 40.10 differ; 42 chapters / 495 paragraphs; titles, `section`, `sections`, per-chapter counts and key order are identical | VERIFIED CLEAN |
| Final vs round-1 successor: only 27.0, one character ("oh dear!" → "ah dear!"); file size unchanged | VERIFIED CLEAN |
| R1 defect 27.0-1 | RESOLVED. The washing clause still appears twice and still belongs to Mrs. McNab |
| Sidecar modern-en `sourceSha256` equals the final edition; all 495 `paragraphHashes` match the normalized final text; all 1,429 modern-en mentions slice exactly | VERIFIED CLEAN |
| 27.0 mentions: mrs-mcnab 151–161 and 1348–1358; mrs-ramsay 1186–1197 and 2228–2239. 25.3: prue 13–24. 26.1 and 40.10: none | VERIFIED CLEAN |
| Sidecar vs round-1 sidecar: exactly three JSON paths differ (`contentVersion`, the modern-en `sourceSha256`, `paragraphHashes["27"][0]`); original-en untouched | VERIFIED CLEAN |
| Editorial file: `contentVersion` 2026-09-25.1; the Prue snapshot equals the verified card text; all 78 entities agree with the compiled sidecar; no superseded wording remains | VERIFIED CLEAN |
| Threads file: Prue's chapter-25 entry ends with the verified line; the preceding sentence ("…one May") supplies the antecedent for "that summer"; no superseded wording remains | VERIFIED CLEAN |

Caveat from the verifier: the base editorial and threads files were not in its folder, so it could not diff them directly. The lead diffed both against the base package (`175a90f0`):

- `editorial.json`: exactly two lines differ, `contentVersion` (2026-09-24.1 → 2026-09-25.1) and the `prue` snapshot body after [25, 3].
- `to-the-lighthouse-threads.json`: exactly one line differs, Prue's chapter-25 `modern-en` summary ("of an illness" → "of some illness").

OVERALL (R2): VERIFIED CLEAN
