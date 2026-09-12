# Verse lines in the plays — verification, 2026-09-12

Every `*-before.png` is the **same production bundle** with the lineation
sidecar withheld at the network layer (`route.abort()` on `*-lines.json`), so
a pair differs in exactly one thing: whether the recovered lines are applied.
Nothing else — build, CSS, fonts, prefs — differs between the two.

Driven with Playwright (chromium at `/opt/pw-browsers/chromium-1194`) against
`app/dist` served statically on :4231. Desktop 1440×900 unless the name says
otherwise, phone 393×852 at `/lab/phone`.

## Pairs

| Shot | What it shows |
| --- | --- |
| `act1-scene1-desktop`, `act1-scene1-phone` | The reported case: `FIRST WITCH. When shall we three meet again? In thunder, lightning, or in rain?` becomes two lines, the speaker label still inline on the first. |
| `long-verse-speech-desktop`, `long-verse-speech-phone` | "If it were done when 'tis done" (I.vii) — before, one justified block with capitals stranded mid-sentence; after, the verse. |
| `spread-1920` | 1920×1080, Act 1 Scene 3. Italic `_Tiger:_` still italic; a wrapped verse line indents. |
| `prose-porter-desktop`, `prose-porter-phone` | The Porter (II.iii) is prose and stays prose, justified, identical before and after. |
| `mixed-prose-and-verse-phone` | One page with both: the Porter's justified prose, then Macduff's verse — ragged right, with the wrap of a long verse line clearly indented under it. |
| `compare-desktop` | Compare open. Original column lineated, modern-English column prose, rows still aligned. (Before shows the same proportional row truncation, so that is not new.) |
| `dark-desktop`, `dark-phone` | Dark theme. Colour, face and line height are inherited. |
| `eink-desktop`, `eink-phone` | Book/e-ink theme. |
| `largest-text-desktop`, `largest-text-phone` | 2.2rem, the size control's maximum. On the phone a verse line wraps three times and the hanging indent still says which lines are wraps. |
| `smallest-text-desktop`, `smallest-text-phone` | 0.8rem, the minimum. |
| `hamlet-to-be-desktop`, `hamlet-to-be-phone` | "To be, or not to be" (III.i) as verse. |
| `hamlet-prose-piece-of-work-desktop` | "What a piece of work is a man" (II.ii) is prose in the source and is left as prose — before and after are identical. |
| `audio-follow-verse.png` | Audio playing (endpoints proxied to production, so real audio and the real word sidecar), paused mid-speech: the highlighted word is `trammel`, paragraph 1, word index 19, inside the verse line "Could trammel up the consequence, and catch". Word addressing is unchanged by lineation. |

## Pagination

`labMeasureParagraph.ts` and the phone paginator's own measurement DOM both
build the verse blocks, so the hidden copy has the shape the reader sees
(PR #55's lesson). Measured at 1920×1080, distance from the last painted word
to the leaf bottom, page 1 of each chapter:

| Case | Before | After |
| --- | --- | --- |
| Macbeth I.iii | 3px slack, 48 pages | 3px slack, 53 pages |
| Macbeth I.vii | 3px slack, 2 pages | 3px slack, 17 pages |
| Macbeth II.iii | 3px slack, 60 pages | 3px slack, 61 pages |
| Hamlet III.i | 3px slack, 47 pages | 3px slack, 52 pages |

No column overflows and none is short. The page counts rise because a verse
line occupies a whole line box where the run-together prose filled the measure
— that is the change, correctly measured, not a defect.

At 1440×900 the last word of page 1 sits 759px down before and 786px down
after, against a paper bottom of 879px: the after page fills slightly more.
