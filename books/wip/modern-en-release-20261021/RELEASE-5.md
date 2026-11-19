# Modern English repair release text-2026-10-21.5: Utilitarianism, Poetics, On the Genealogy of Morals

Assigned by Anders on 2026-10-21. The packages come from the 6 Oct batch (`bee1059ff5`) and are restored into
`books/wip/<book>-modern-en/`. The method is the same as release 1 (`RELEASE.md`, which also covers narration and
`edition_patches`). Peloponnesian War, planned for this release, is held; see below.

## Verification and results

| Book | Candidate (= packet) | Baseline = live | Structure | Changed | Gate (similarity / identical long) | Card mentions |
|---|---|---|---|---|---|---|
| utilitarianism | `534c43afa8af1f7d…` | yes | 5 ch, 94 paragraphs, 1:1 | 94 | PASS 0.721 / 0.0% | 42 -> 41 |
| poetics | `c14bf2d099284fad…` | yes | 26 ch, 130 paragraphs, 1:1 | 128 | PASS 0.669 / 0.8% | 221 -> 220 |
| genealogy-of-morals | `f108ea298f97f055…` | yes | 4 ch, 124 paragraphs, 1:1 | 116 | PASS 0.731 / 1.7% | 14 -> 14 |

For all three, the card pin equals live, no edition is sharded, and the changed-paragraph scan found nothing.

## Card rulings

Recorded in `release-5-mention-mappings.json`. Every mention whose occurrence or text changed was read in context.

Mapped:
- **utilitarianism god 2:21.** "to interpret God's will to us" is now "to interpret to us the will of God", and "as God's
  testimony" is now "as the testimony of God". These two are mapped. They also cover the package's two "needs a look"
  proposals (offsets 1912 and 2160).
- **poetics iphigenia 16:2.** The play title in "Orestes in the Iphigenia" is now "In the Iphigenia, for example,
  Orestes". It is mapped to that "Iphigenia". The new "Iphigenia makes herself known", which replaces "She", stays
  unmarked.
- **genealogy ressentiment 2:14.** "resentment becoming creative" is now "resentment itself becomes creative".
- **genealogy bad-conscience 3:3.** `"bad conscience,"` is now `"bad conscience"`; the comma moved outside the quotation.

Left dropped:
- **utilitarianism god 2:21.** "the moral character of God" is now "of the Deity". "God" -> "the Deity" cannot share a
  mapping with "God" -> "God" (the tool allows one mapping per spelling). The figure is still marked five times in the
  same paragraph.
- **poetics homer 24:6.** "the poetic charm with which Homer invests it" is now "the poet's charm".

The package's other proposals all equal the re-anchored offsets (utilitarianism 40/42, poetics 211/214, genealogy
11/13). The rest are the rulings above.

## Checks

- Gates and alignment.
- `npm test`: 523 files pass.
- `CI=1 npm run build` and `npm run verify-bundle`.
- Playwright visual QA of the first, middle and last changed paragraph of every changed chapter, at phone (WebKit 390x844)
  and desktop (Chromium 1440x950) sizes. 191 of 192 views showed the paragraph on the opened page. In the one exception
  (Genealogy 4:40, phone), the paragraph starts on that page's last line. I spot-read the screenshots by eye.
- Ruled cards open in both layouts. Utilitarianism 2:21 on the phone falls on the next page of the paragraph, so the
  phone check found no word to tap there.

## Held: Peloponnesian War

The package verifies: candidate and baseline hashes, 1:1 structure, card pin, and gate 0.714. But the candidate brings
back proper-name misprints from the source text that the live modern-en had corrected:
- Brasidas -> "Bradidas" (8:14)
- Antiochus -> "Antichus" (8:9)
- Amphiaraus -> "Amphiraus" (8:32)
- Onomacles -> "Onamacles" (24:33)
- Selinus -> "Silenus" (24:29), which names a different place

It needs a content correction and a new candidate hash before integration. Its card rulings are prepared: map
Themistocles 4:1, Pausanias 5:10 and Brasidas 14:7 to the same-sentence names; leave dropped the 4:1, 5:9 and 14:7
pronoun cases and Brasidas 8:14 if the misprint stays.
