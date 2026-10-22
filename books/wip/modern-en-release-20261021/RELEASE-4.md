# Modern English repair release text-2026-10-21.4: The Brothers Karamazov

Assigned by Anders on 2026-10-21. The package was restored from `origin/claude/brothers-karamazov-modern-en` (accepted 5 Oct)
into `books/wip/brothers-karamazov-modern-en/`. The method is the same as release 1 (`RELEASE.md`, which covers narration
and `edition_patches` too).

## Verification against live main

| Candidate sha256 (= packet) | Live pre-image (= packet = package baseline) | Structure | Card pin |
|---|---|---|---|
| `0426f2f3629b48a1…` | `5b2d957d5fdca2f1…` | 96 chapters, 5836 paragraphs, titles and section labels 1:1 | matches live |

## Results

- **Changed paragraphs:** 5476 of 5836.
- **Gate:** PASS. Similarity 0.690, identical long paragraphs 21/4040 = 0.5%, light+mechanical 0/96 (the packet's numbers).
- **Changed-paragraph scan:**
  - 88 changed paragraphs are under 20 characters. All are short dialogue lines ("Yes.", "What?"). Most changed only from
    straight to curly quotes or to a modern idiom. I read each of them.
  - Two paragraphs are under 75% of the source word count (34:13, 54:40). Both are natural compression with nothing dropped.
- **Shards:** the chapter shards were rebuilt with `split-edition-chapters.cjs`.
- **Coordinate maps:** the highlights map is 5.6 MB, the largest so far (Moby-Dick's is 2.2 MB). Like the others, it is
  fetched only by a reader who holds Karamazov highlights written against the old text.

## Card rulings

- **Mentions:** 4696 before, 4643 after.
- **How they were reviewed:** re-anchoring uses exact projection, as in release 1. The packet's naive count of ambiguous
  mentions (279) does not apply to projection. Instead, every mention whose occurrence index, name count or text changed in
  a rewritten paragraph was read in context (220), along with every mention the projection dropped (62).
- **Mapped (`release-4-mention-mappings.json`):** 9 mentions whose name moved within the same sentence:

| Mention | Old wording | Repaired wording |
|---|---|---|
| alyosha 29:0 | "Besides all this, Alyosha had till the evening before…" | "Until the evening before, Alyosha had taken it for granted…" |
| alyosha 39:7 | "It seemed strange to Alyosha…" | "Alyosha thought it strange…" |
| alyosha 73:1 | "Alyosha, again, had a close long-standing acquaintance…" | "Alyosha had known him well for years" |
| dmitri 46:19 | "so that Mitya, seeing his painful exertions…" | "Watching his struggle, Mitya at once felt remorse" |
| dmitri 47:8 | "Mitya was somewhat surprised for a moment" | "For a moment Mitya was a little taken aback" |
| dmitri 59:24 | "'He thinks of me as a puppy,' Mitya thought" | "…thought Mitya" |
| dmitri 61:15 | "after a moment's thought Mitya, frowning, admitted" | "Mitya thought a moment, then admitted" |
| katerina 94:0 | "Katerina Ivanovna had, immediately after the scene…" | "Right after the scene at the trial, Katerina Ivanovna…" |
| ilusha 96:12 | "Ilusha lay with his hands folded…" | "In a blue coffin…, Ilusha lay…" |

- **Corrected:** two projections that landed on the wrong occurrence.
  - grushenka 23:40: "the hand of Grushenka" is now "kissed Grushenka's hand", not the next sentence's "Grushenka held out".
  - smerdyakov 90:2: "according to Smerdyakov's story" is now "By Smerdyakov's account", not the inserted "a word to Smerdyakov".
- **Duplicates removed:** the projection had put two mentions on one name, in alyosha 5:12 and rakitin 43:19. With the
  rulings, every Alyosha in 5:12 and both Rakitins in 43:19 are marked once each. All are the same figure.
- **Left dropped:** 53 mentions, where the repaired sentence uses a pronoun or rephrases without the name, e.g. "Father
  Zossima stood on the top step" -> "He stood on the top step". The list is in `release-4-integration-report.json`
  (`droppedMentions`).
- **Unchanged:** reveal points, snapshots and evidence offsets were projected by the tool. Character content is unchanged.
  After the rulings no two mentions share a position.

## Checks

- Gate and alignment.
- `npm test`: 523 files pass.
- `CI=1 npm run build` and `npm run verify-bundle`.
- Playwright visual QA of the built reader at phone (WebKit 390x844) and desktop (Chromium 1440x950): the first changed
  paragraph of all 96 chapters and the last changed paragraph of every third chapter (`release-4-visual-qa.json`). 256 of 256
  views showed the changed paragraph on the page that opened. I spot-read the screenshots by eye.
- The ruled cards (Grushenka 23:40, Smerdyakov 90:2, Mitya 47:8, Alyosha 39:7) open in both layouts without moving the
  place. On the phone, the synthetic tap sometimes opened Define instead of the card. Each case passed on a retry, and
  untouched live mentions behaved the same way, so this is a quirk of the test harness, not the data.

## Open issues carried forward (from the acceptance record)

- No human read. A spot-read of the Inquisitor, Zossima, the Mitya chapters and the trial speeches is recommended.
- About 565 NIT-level observations were not applied.
- Garnett's spellings are kept as served (e.g. Ghenghis, Nekrassov, Hernguter, Timours).
- modern-da no longer tracks modern-en.
