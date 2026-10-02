# Exclamation-mark restorations in four modern-en editions (release-candidate-4)

Method: per paragraph, `count('!')` of live modern-en vs live original-en; every shortfall was listed, the
mark restored on the clause that carries it with the smallest wording change, then the comparison re-run.
Coordinates are chapter:paragraph (chapter number, 0-based paragraph index). No paragraph counts, alignment
or other wording changed.

Skipped (original contains OCR garble, the "!" count differs only because of it; left untouched):
- aristotle-politics 3:3 (original "Citi':!{enship")
- aristotle-politics 3:26 (original "Classfiicatio?!")

## around-the-world-80-days
- 1:19 `“Good. What time` -> `“Good! What time`
- 22:12 `“Wait — am I on` -> `“Wait! Am I on`
- 24:11 `The moon, indeed — moonshine, more like!` -> `The moon, indeed! Moonshine, more like!`
- 25:8 `on the steamer? At least` -> `on the steamer! At least`

## notes-from-underground
- 7:0 `Oh, gentlemen, but of course he’s your friend` -> `Oh! gentlemen, but of course he’s your friend` (original "Ech! gentlemen")

## aristotle-politics
- 1:43 `to have virtue. If the ruler` -> `to have virtue! If the ruler`

## beyond-good-and-evil
- 1:0 `stands at all. There are scoffers` -> `stands at all! There are scoffers`
- 1:0 `itself in "distress." (The Germans` -> `itself in "distress"! (The Germans`
- 1:0 `the tension of its bow. And perhaps` -> `the tension of its bow! And perhaps`
- 2:1 `dangerous "perhapses"? For that` -> `dangerous "perhapses"! For that`
- 2:9 `bypaths concern us? The main` -> `bypaths concern us! The main`
- 2:10 `be false. Or, more plainly` -> `be false! Or, more plainly`
- 2:12 `teleological principles — one of which` -> `teleological principles! — one of which`
- 2:18 `would then remain over. In the third` -> `would then remain over! In the third`
- 2:22 `to keep away from it who can. On the other` -> `to keep away from it who can! On the other`
- 10:7 `try to do nowadays? In our very` -> `try to do nowadays! In our very`
- 10:13 `"you know nothing" — this silent` -> `"you know nothing"! — this silent`

Dependent artifacts regenerated: character packages (exact re-anchor, all mentions kept: around 1941 -> 1941,
notes 332 -> 332, aristotle 12 -> 12, beyond 16 -> 16; nothing newly unanchored, no mappings needed), text-change
maps (before = main's file, revision text-2026-10-01.1), CONTENT_RELEASES `after` hashes.
