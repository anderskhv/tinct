# Modern English repair release text-2026-10-21.6: War and Peace, Democracy in America

Assigned by Anders on 2026-10-21. The packages come from the 6 Oct batch (`bee1059ff5`) and are restored into
`books/wip/<book>-modern-en/`. The method is the same as release 1 (`RELEASE.md`, which also covers narration and
`edition_patches`). Both books are currently held from browsing (War and Peace is search-only); the text release does
not change that.

## War and Peace: candidate applied onto live chapter titles

Live main no longer equals the package baseline. `69751bbcfb` (#352, "War and Peace Book labels") relabelled 20 chapter
titles after the package was made; every paragraph is byte-identical to the baseline. The accepted paragraphs were
therefore applied onto live's file with live's titles, serialized as live is (`json.dumps(ensure_ascii=False)`).
- Integrated file: sha256 `65c253aa95e1e4cb…`. The accepted `candidate.json` is `16d0f165ce7cbbed…`; its paragraphs are
  identical.
- Live before: `93fb7594ee1e6170…`. The package baseline is `d3ecdb9d013f45e5…` and differs only in the 20 titles.
- No prose changed, and #352's labels are kept (coordinator's ruling, 2026-10-21).
- Structure: 365 chapters and 11,340 paragraphs, 1:1 with live. 578 paragraphs changed.
- Gate: PASS 0.682, identical long paragraphs 0.5%.
- The shard manifests keep the same titles, paths and counts as main, plus `wordCount`.

**ch168 p0** was the one replacement nobody re-verified: the verifier's own wording, applied without a further check. I
read it against the source myself. Every clause is present: the arming and massing from late 1811; the march east in
1812, counting those who transported and fed the army; the Russian forces drawn to the frontier; the crossing on 12
June; "opposed to human reason and to human nature"; the full list of crimes, including false money and incendiarism;
the comparison with the law courts' annals over whole centuries; and the closing point that the men did not regard them
as crimes. Nothing is added. Verdict: PASS.

## Democracy in America: four number ranges restored

The accepted candidate (`3d9feeb1806b7c46…`) turned four en-dash number ranges from live into hyphens:
- 19:28 and 19:55: `90–105`
- 19:267 and 19:272: `(1820–1830)`

Number ranges take an en dash in Tinct's text. The 1820–1830 range is also the live fixture that
`src/narration/narrationDashes.test.ts` reads aloud as "1820 to 1830". The four ranges were put back as live had them,
one exact substitution each, in the candidate's own serialization. No other change was made.
- Integrated file: sha256 `cfd05256d4621d8a…`.
- Live before: `347cc8f0729f7fe0…`, which equals the package baseline.
- Structure: 96 chapters and 2,258 paragraphs, with titles and `sections` 1:1. 2,109 paragraphs changed.
- Gate: PASS 0.726, identical long paragraphs 3.5%, light+mechanical 0/96.
- The test is unchanged and passes.

## Card rulings (`release-6-mention-mappings.json`)

Every mention whose occurrence or text changed was read in context: 16 for War and Peace, 11 for Democracy.

War and Peace, 8466 -> 8457 mentions. Mapped:
- napoleon 169:0: "On the twenty-ninth of May Napoleon left Dresden" -> "Napoleon left Dresden on the twenty-ninth of May".
- princess-mary 269:12: "As she was in mourning, Princess Mary did not go out" -> "Princess Mary was in mourning and did
  not go out". The package's other proposal for this paragraph (offset 257) is a newly added "Princess Mary", from "vice
  versa", and stays unmarked. The two old mentions after it re-anchor to 218 and 356.

Left dropped, because the repaired sentence uses a pronoun or "the count": count-rostov 158:0, napoleon 169:0 ("he
rewarded"), napoleon 173:17, andrew 175:2, andrew 260:16, pierre 273:6, pierre 274:1, princess-mary 277:0 and 277:2.
andrew 175:2 and princess-mary 277:2 are the package's two "needs a ruling" mentions.

Democracy in America, 11 -> 11 mentions. All three of the package's proposals are applied:
- alexander-hamilton 9:174: "Alexander Hamilton, one of the chief founders"
- native-american-peoples 2:15: "nor black, as Black people are"
- enslaved-african-americans 19:100: "Black people is to some extent interwoven"

The other 8 equal the proposals.

## Checks

- Gates and alignment.
- `npm test`: 523 files pass, including `narrationDashes.test.ts`.
- `CI=1 npm run build` and `npm run verify-bundle`.
- Playwright visual QA on the built reader at phone (WebKit 390x844) and desktop (Chromium 1440x950):
  - War and Peace: the first, middle and last changed paragraph of all 25 changed chapters.
  - Democracy: the first and last changed paragraph of all 96 chapters.
  - Results are in `release-6-visual-qa.json`. War and Peace: 160 of 162 views showed the changed paragraph on the
    opened page. Democracy: 378 of 382. Every view not marked ok opens on the right page with the paragraph starting on
    its last line. I spot-read the screenshots by eye.
- The ruled cards (Napoleon 169:0, Princess Mary 269:12, Hamilton 9:174, enslaved-african-americans 19:100) open in
  both layouts without moving the place. Seen but out of scope: the Democracy card name still reads 'Enslaved and Free
  Black Americans ("the Negroes")', quoting the old wording; that is card content for the content stream.

## Open issues carried forward (from the acceptance records)

- War and Peace: the served original-en and modern-en titles for chapters 28-32 differed before #352. The candidate kept
  the modern-en ones, and this release keeps #352's.
- Democracy: per-batch gating was not re-run, some "State" capitalization may remain, and there is no raw provenance
  folder.
- modern-da no longer tracks modern-en for either book.
