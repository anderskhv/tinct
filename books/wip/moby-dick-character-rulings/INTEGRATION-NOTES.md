# Integration notes for Codex (Moby-Dick character package)

Content-only handoff. Nothing here modifies `app/public/data/characters/moby-dick.v1.json`; apply `RULINGS.json` when re-anchoring the modern-en side to the accepted candidate.

## Inputs to pin
- Character package read: origin/main `fe699e90d8e21a64b0a4ef81084fee48c04a5813`, `app/public/data/characters/moby-dick.v1.json` sha256 `dccdb35d2c4d2cfc7e1c8faba22807c1754cdaf356127f9229c836502fe34019`, contentVersion `2026-09-12.1`. Its modern-en side is pinned to baseline `2ab04dd7…763c`.
- Accepted candidate `books/wip/green-moby-dick/candidate.json` sha256 `1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c`.
- If the package changes on main before integration, re-run the comparison: `RULINGS.json` is keyed by `oldMentionIndex` (position in the pinned package's `editions["modern-en"].mentions`) plus old coordinates; refuse to apply if either does not match.

## Applying the rulings (modern-en only; original-en is untouched)
1. For each entry: UNCHANGED/KEEP leave the mention as is; RE-POINT replace chapter/paragraph/startOffset/endOffset/text with `new`; DROP remove the mention. 1,779 → 1,739 mentions.
2. Anchors: apply `anchorRulings` (7 characters). For queequeg, father-mapple, peleg and pip the offset moves (`newAnchor.offset` for `firstMention`, `roleVisibleAt`, `snapshots[].availableAt`, `snapshots[].evidence[].throughOffset`); ishmael, tashtego, daggoo offsets are unchanged but their paragraphs changed.
3. `paragraphHashes.modern-en`: recompute for every changed paragraph. `paragraph-hash-updates.tsv` lists the full sha256 (raw UTF-8, same algorithm as the package: verified equal for all 2,432 baseline paragraphs) for the 1,614 changed paragraphs at candidate coordinates. Recompute `sourceSha256` for the new edition file.
4. `ignoredContextMatches` was empty and stays empty; snapshot/card copy needs no change.
5. `optional-new-occurrences.json` (89 name tokens in changed paragraphs that no ruling targets) is informational and unreviewed; adopting any is a separate card decision (skip "Ahabs" plural etc.).

## Compatibility with `books/wip/moby-dick-structural/`
The structural package (`modern-en.structural.json`) equals the candidate except chapters 56, 57, 73, where fragment paragraph 0 is removed and paragraph indices shift by −1 (verified: structural text == candidate text shifted by one for those chapters; every other chapter identical). All 36 modern-en mentions in those chapters are in ch73 (13 unchanged paragraphs, 10 KEEP, 13 RE-POINT; none in paragraph 0, none dropped). Offsets are unaffected. Requirement: rulings are given in **candidate coordinates**; if the structural edition ships (or ships with, or after), apply the same rulings first and then the structural shift, or read `structuralPackage.paragraphIndex` (present on each affected entry) instead of `new.paragraphIndex`. Do not apply the structural `character-annotation-impact.json` shifts to old coordinates and then these rulings (double shift). Structural changes to Etymology/Extracts are front matter, not chapters 1–136, and move no coordinate ruled here. If the structural package ships first against the baseline and the repair later, the structural rule composes the same way.

## Cache/other
No audio, registry, or app change is implied by these rulings.
