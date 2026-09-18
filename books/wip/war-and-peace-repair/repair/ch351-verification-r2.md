Model: opus

# Chapter 351 — round-two verification (independent)

Files verified:
- predecessor: `ch351-corrected.json`
- round-two: `ch351-corrected-r2.json`
- log: `ch351-corrections-log-r2.md`
- source: `ch351-source.json` (Maude)

## Diff (computed with Python, not read from the log)

Changed paragraph indices: **[20, 37]**. Exactly the two indices the log claims. No
unlogged change, no logged change missing.

Structure: `number` 351 unchanged and equal to source; `title`
"First Epilogue (1813 - 20) — Chapter 14" unchanged and equal to source; paragraph
count 52 → 52, source 52; no empty paragraphs; key set unchanged; JSON parses.

## Per-change verdicts

### p20 — orphan marker replaced by the inline English (rules 3 + 5)

Source: "...He seeks only for peace, and only these people sans foi ni loi * can
give it him—people who recklessly hack at and strangle everything..."

Before: "...only these people, sans foi ni loi,* can give it to him—people who..."
After:  "...only these people, sans foi ni loi—without faith or law—can give it to
him—people who..."

Correct. The French is a fixed phrase whose wording is the point, so it stays inline
(rule 3); the English follows immediately; the stray `*` is gone. The gloss matches
the source footnote at p21 ("Without faith or law.") exactly in sense. The comma
after "loi" was absorbed by the opening dash, which is the right punctuation for a
parenthetical gloss — no meaning change. Everything else in this long paragraph
(Petersburg, the mysticism aside, Magnitsky, Arakcheev, "tutti quanti", the steward
analogy, "he said to Nicholas") is byte-identical to the predecessor. `?`/`!` parity
with source: 0/0 → 0/0. **ACCEPT.**

### p37 — Denisov's French given its English inline (rules 3 + 5)

Source: "...That's all wight. Je suis vot'e homme!" *   (slot p38: `* "I'm your man."`)

Before: "...That's all wight. Je suis vot'e homme!\"*"
After:  "...That's all wight. Je suis vot'e homme—I'm your man!\""

Correct. The French stays because the wording is the point — it is Denisov's
flourish, and "vot'e" (for *votre*) is his speech impediment carried into French —
with the English immediately after. The orphan `*` outside the closing quotation
mark is gone.

Impediment check: every w-form in the paragraph survives intact — fwiend, vewy,
pwonounce, agwee, evewything, wotten, howwible, wevolt, wight — and "vot'e" keeps
its dropped r. The added English is "I'm your man!", with "your" spelt normally.
That is right, not an oversight: Maude only substitutes w for a pronounced,
pre-vocalic r. Checked against the published `war-and-peace-original-en.json` —
Denisov says "your turn", "your acquaintance", "dwown our gwief", "here" with r
intact, and the strings "youw" and "ouw" occur zero times in the whole edition.

Exclamation handling: the `!` moves from the end of the French to the end of the
English, which keeps it on the last word of the utterance where a reader expects it.
`!` count 2 → 2, matching source (2). `?` 0 → 0. **ACCEPT.**

## Convention conformance

- Slots untouched and intact: p21 `* Without faith or law.` and p38 `* "I'm your
  man."` both still present, at the same indices as the source's two `*`
  paragraphs, carrying Maude's English per rule 5 (the foreign wording is therefore
  not printed twice).
- Regex over all 52 paragraphs: the only `*` characters in the file are the two slot
  markers. No orphan marker anywhere.
- No bracket tag anywhere in the chapter.

## Reader check

Both paragraphs now read straight through without a footnote hop. p20 carries three
dash-breaks in close succession ("...sans foi ni loi—without faith or law—can give
it to him—people who..."); the gloss dashes are paired, so it parses, but it is the
densest point in the chapter.

## New findings

1. *(observation, non-blocking)* The sweep glosses inline French three different
   ways across the three chapters: parentheses (ch288 p8), comma + quotation marks
   (ch321 p11), em-dashes (ch351 p20, p37). `french-pass.md` does not prescribe a
   punctuation, so none of these is wrong, but if the convention is ever tightened,
   ch351 p20 is the one that would most benefit from parentheses, given the dashes
   already in that sentence.
2. Pre-existing, outside this round's scope and unchanged by it: p37 renders Maude's
   Russian "bunt" as "wevolt". Noted here only so it is not mistaken for something
   this round introduced; it was already in `ch351-corrected.json` and was accepted
   in `ch351-verification.md`.

Neither affects this round's verdict.

Verification: ACCEPT
sha256: 5de6168a6de554a2745df244adc882a2345f4d84d2c6bfe1c18c9f7606efe4a8
