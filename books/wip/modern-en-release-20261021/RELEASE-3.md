# Modern English repair release text-2026-10-21.3: The Iliad, The Federalist Papers

Assigned by Anders on 2026-10-21. Packages come from `origin/claude/iliad-modern-en` and
`origin/claude/federalist-papers-modern-en` (accepted 5 Oct) and are restored into `books/wip/<book>-modern-en/`. The method
is the same as release 1; see `RELEASE.md`, which also covers narration and `edition_patches`. Revision `.2` is reserved
for the held Jekyll and Hyde release.

## Verification against live main

| Book | Candidate sha256 (= packet) | Live pre-image (= packet = package baseline) | Structure | Card pin |
|---|---|---|---|---|
| iliad | `5719267ee36dca31…` | `d424a2e68fd2e302…` | 24 ch, 1137 paragraphs, 1:1 | matches live |
| federalist-papers | `1f123f52d66f4f4d…` | `1974574ebce6859b…` | 85 ch, 1279 paragraphs, 1:1 | matches live |

## Results

| Book | Changed paragraphs | Gate (similarity / identical long) | Card mentions before -> after |
|---|---|---|---|
| iliad | 1129 | PASS 0.681 / 0.3% (packet: 0.681) | 820 -> 817 |
| federalist-papers | 1218 | PASS 0.704 / 2.6% (packet: 0.704) | 9 -> 9 |

Federalist's chapter shards were rebuilt with `split-edition-chapters.cjs`. The rebuilt manifest gains the `wordCount`
field that the current tool writes. Neither book has footnote or figure data. The changed-paragraph scan found nothing:
no empty paragraphs, none under 20 characters, none under 75% of the source word count.

## Card rulings

Re-anchoring uses exact projection. For each mention in a changed paragraph, I compared its occurrence index (among the
same name's hits in its paragraph) before and after (`occ_check`). The Iliad has 79 mentions whose name count or text
changed (including the paragraphs with a ruling or a drop), and Federalist has 2. Each was read in context against the old and new paragraph. In every case the projection
kept the sentence the old mention marked. The renderer often repeats a name where Butler wrote "he", and the projection
skipped those added occurrences correctly (e.g. Patroclus 9:15, Ajax 4:36, Thetis 18:29, Glaucus 16:38). The
Alexandrus -> Paris mentions (18) land on the matching "Paris", which is a reviewed spelling for the figure (the
acceptance record's "Alexandrus -> Paris" decision).

The rulings below are in `release-3-mention-mappings.json`:

- **iliad paris 3:4, 3:32, 3:33:** "Alexandrus" is rendered "Paris" in the same clause ("so did Alexandrus plunge" ->
  "Paris plunged"; "springing upon Alexandrus" -> "sprang at Paris again"; "Alexandrus says you are to come" -> "Paris
  wants you at the house"). These are mapped to that "Paris". In 3:32 the new third "Paris" ("snatched Paris up") replaces
  Butler's "him" and stays unmarked, as before.
- **federalist faction 10:1:** "By a faction, I mean" is now "By a faction, I understand" (Madison's own wording,
  restored per the style note). This is mapped as the packet proposes.

Left dropped, because the repaired sentence no longer names the figure:

- **iliad priam 2:65:** "Priam's son Polites" -> "his son Polites". The other three Priam mentions in the paragraph stay.
- **iliad paris 3:0:** the Book 3 argument "Alexandrus, also called Paris" -> "Paris". The "Paris" mention is kept; the
  duplicate name has gone.
- **iliad apollo 1:5:** "Sminthian Apollo" -> "god of Sminthe". "King Apollo" in the same paragraph is kept.

All nine Federalist mentions equal the packet's proposed anchors (table in its RELEASE-PACKET). Reveal points, snapshots
and evidence offsets were projected by the tool; character content is unchanged.

## Checks

Gate on each integrated file. Paragraph alignment with original-en. `npm test`, `CI=1 npm run build` and `npm run
verify-bundle`. Playwright visual QA ran on the built reader, at phone (WebKit 390x844) and desktop (Chromium 1440x950):
Iliad covers the first, middle and last changed paragraph of all 24 books; Federalist covers the first and last changed
paragraph of all 85 papers. Of 484 views, 481 showed the changed paragraph on the page that opened. In the other 3 (Federalist 4:15 and 35:10 on
phone, 52:7 on desktop) the paragraph starts on that page's last line and continues overleaf; I checked those screenshots.
I also checked a sample of the screenshots by eye. Results are in `release-3-visual-qa.json`. Card clicks (Paris 3:32 and
3:33, Patroclus 9:15, faction 10:1, ambition 51:3) open the right card in desktop Chromium without moving the place. On
the phone, Paris 3:33 and Ambition 51:3 fall on the next page of their paragraph, so the check found no word to tap there.
`npm test` passed: a first run under the Playwright load timed out in 33 UI tests, and a rerun with nothing else running
passed apart from one timing assertion in the social leaderboard test, which passed when run again on its own.

## Open issues carried forward (from the acceptance records)

- Iliad: Butler's Book 8 argument slip and garbled source sentences are kept as served. The renderers were agents only.
- Federalist: there is no `books/raw/` provenance, and probable misprints in the served original-en are mirrored in
  modern-en (ch15 p5, ch54 p0-1, ch37 p5, ch63 p11 and others). Fix both editions together in a separate change. The
  onboarding was not re-read against the new wording.
- modern-da no longer tracks modern-en for either book (Danish is out of scope).
