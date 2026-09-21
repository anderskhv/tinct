# Acceptance Record — Cymbeline (modern-en)

Book id: `cymbeline`. Green-library second batch, pool item #14.
Procedure: `books/TRANSLATION_PROTOCOL.md` steps A–D.
Rounds: 3 (round 1 review, round 2 independent verification + fixes,
round 3 adversarial re-verification).

## Files covered

- `source.json` — copied unmodified from
  `app/public/data/editions/cymbeline-original-en.json`.
- `candidate.json` — derived from
  `app/public/data/editions/cymbeline-modern-en.json`, with 3 paragraph
  corrections applied in round 2 (listed below).

## Structure check (re-verified independently in round 3)

29 chapters, all real Act/Scene units (Act 1 Scene 1 through Act 5 Scene
5) — no apparatus/stub/editorial chapters. 1133 paragraphs total.
Chapter count, chapter numbers, chapter titles and per-chapter paragraph
counts all match `source.json` exactly; zero mismatches. No empty or
whitespace-only paragraphs on either side.

## Round 1 — and what it got wrong

Round 1 (`accessibility-review-1.md`, `fidelity-review-1.md`, Claude
Sonnet 5) claimed **full coverage and zero defects**, and recommended
acceptance with no edits.

**That claim was inaccurate, and this is worth recording as a finding in
its own right.** The blind spot was methodological: round 1's
defect-finding for content loss leaned on a `word_count_ratios`
tripwire, which it ran in a form that surfaced only a handful of *very
short* single-line paragraphs as outliers. Those ten lines were then
read and correctly cleared — but the tool had never been pointed at the
place where real content loss actually lives: **moderately compressed
paragraphs of ordinary length**, where a whole subordinate clause can
disappear while the ratio stays unremarkable. Round 1's name/speaker-tag
sweeps were genuine and did hold up under re-checking; its prose claim
of a "full continuous read" did not, because a real continuous read
would have caught defect 1 below on sight.

Lesson for the programme, consistent with the carried-forward lessons in
`SECOND-BATCH-TRACKER.md`: a length-ratio signal tuned to extremes is
not a content-loss detector, and "0 defects across 1133 paragraphs"
from a single reviewer should be treated as a prompt for independent
verification, not as a result.

## Round 2 — independent verification, 3 defects found and fixed

An independent verification pass found 3 blocking defects. All 3 are
re-derived from `source.json` and confirmed fixed in round 3 (paragraph
indices below are 1-based):

1. **Ch1 ¶6 — dropped opening clause.** Source: *"FIRST GENTLEMAN. He
   that hath lost her too. So is the Queen, …"*. The candidate had
   dropped *"He that hath lost her too"*, which erases the referent to
   Posthumus and destroys the answer's whole point (the First Gentleman
   is answering *who else* is displeased). **Now reads** "FIRST
   GENTLEMAN. He that has lost her too. So has the Queen — she most
   wanted the match. …" — clause restored, referent intact.
2. **Ch15 ¶5 — reversed direction of deference.** Source (Belarius, on
   the court life he left): *"Prouder than rustling in unpaid-for silk:
   / Such gain the cap of him that makes him fine, / Yet keeps his book
   uncross'd."* The proud silk-wearer *receives* the doffed cap from
   the tailor who dressed him, while the tailor's bill goes unpaid. The
   candidate had the direction backwards. **Now reads** "Such a man
   gets the doffed cap of the very one who makes him fine, yet leaves
   his bill unpaid." — direction verified correct against source:
   silk-wearer receives, tailor defers, bill unpaid.
3. **Ch5 ¶45 — silently imported scholarly emendation.** The candidate
   had "You're prudent", an editorial emendation, in place of the
   source's own printed *"You are a friend, and therein the wiser."*
   **Now reads** "IACHIMO. You are a friend, and therein the wiser. …"
   — source's own wording restored. This is the exact failure class the
   tracker's carried-forward lessons name: fidelity is to the locked
   `source.json`, not to a "better" edition.

## Round 3 — adversarial re-verification (this pass)

Because round 1's clean claim had already proved unreliable, round 3 did
not trust any prior tool output and recomputed everything from the two
JSON files.

- **The 3 fixes**: each re-derived from `source.json` at its exact
  location and confirmed to match, including that ch15 ¶5's direction of
  deference now runs the way the source runs it.
- **Own compression sweep** (ratios computed in this pass, not
  inherited): word-count ratio candidate:source for all 1133
  paragraphs. Median ratio 1.00. Every paragraph below 0.92 with ≥12
  source words (16 paragraphs), every paragraph below 0.80 with <12
  source words (6 paragraphs), and every paragraph ≥25 source words with
  any compression at all (47 paragraphs) was read in full against
  source. Also swept the other direction — every paragraph expanding
  more than 1.35× (2 paragraphs) — for invented content. One boundary
  item surfaced (recorded below); no content loss.
- **Proper-noun / allusion occurrence map**: per-paragraph,
  case-insensitive occurrence counts for ~80 names and places. Seven
  apparent shortfalls, all individually read and all benign
  ("Gallia"→"Gaul", "Britain peasant"→"British peasant", "ours of
  Italy"→"our Italian women", etc.). Zero occurrences of "Innogen" or
  "Jachimo" — the source's own "Imogen"/"Iachimo" are reproduced, not
  "corrected".
- **Emphasis-markup audit**: source's Gutenberg `_…_` italic markup
  (334 underscores) appears in 165 paragraphs; the candidate carries
  none. Audited every non-stage-direction use — quoted documents (the
  letters at ch7/ch14/ch16, the oracle tablet at ch28/ch29, the Latin
  pun at ch29 ¶157) are preserved as quoted text, and the rest is the
  `[_Exit._]`-class markup. Recorded as a formatting normalization
  below, not a defect.
- **Word-for-word spot-check, ~130 paragraphs** across the scenes named
  in the brief, chosen independently of any ratio signal: the wager
  scene (ch5 ¶20–57 complete), the bedchamber/trunk scene (ch9 ¶1–16
  complete), Iachimo's false proof and Posthumus's collapse (ch11
  ¶30–60 complete), Posthumus's misogynist rage (ch12 ¶2 complete),
  the cave scenes (ch15 ¶1–7, ch19 ¶1–25 complete, ch22 ¶30–70
  complete), the Jupiter/vision scene (ch28 ¶10–35 complete), and the
  final recognition (ch29 ¶100–135 complete). Specifically hunting
  dropped clauses, reversed meanings, and imported "corrected" phrasing.
  Fidelity is high and the renderings are genuinely modern rather than
  mechanical. Known editorial cruxes are reproduced from source, not
  emended: "her andirons… two winking Cupids" (ch11 ¶34), "Whose mother
  was her painting" (ch16 ¶10, not emended to "manner"/"blazon"),
  "under her breast… a mole" (ch11 ¶50).

**No further blocking defects found.**

## Accepted non-blocking items (reader-centered reasons)

- **Ch2 ¶38/¶39 — sentence completed one paragraph early.** Source
  splits mid-sentence at a verse line-break: ¶38 ends *"You have done"*
  and ¶39 opens *"Not after our command."* The candidate completes the
  sentence inside ¶38 ("You have not done as we commanded.") and ¶39
  carries only "Take her away, and lock her up." **No content is lost** —
  the clause is rendered, one paragraph earlier — but this is the one
  place in the book where a mid-sentence source break is handled this
  way; the other 18 such breaks keep the fragment as a fragment. Kept
  because the alternative is an ungrammatical fragment opening ¶39 for a
  reader who is reading the modern edition on its own, and because a
  split-pane reader still sees the meaning present within one paragraph
  of where the source puts it. Flagged here so a future pass does not
  rediscover it as new.
- **Ch16 ¶33 — "common-kissing Titan" rendered "the common-kissing
  sun".** The name is replaced by its referent rather than glossed
  alongside it. Kept because the line's force is the sun's indiscriminate
  touch on Imogen's uncovered cheek, which the substitution carries
  intact for a reader who does not know Titan as a sun-epithet; nothing
  is added that the source does not say. The one place in the book where
  an allusion is resolved this way.
- **Ch5 ¶44 — "'tis part of it" rendered "it is part of me".** The
  referent shifts from the finger to the speaker. Kept: the sense
  (the ring is as inseparable from Posthumus as his own body) is the
  same, and "part of it" reads in modern English as pointing back to the
  wrong noun.
- **Ch19 ¶2 — "resty sloth" rendered "restless sloth".** "Resty" is
  sluggish rather than restless. Kept as a minor shading: the contrast
  Belarius draws (honest weariness sleeps on stone, idleness cannot get
  comfortable on down) survives either reading, and a footnote-style
  correction here would be the only gloss of its kind in the scene.
- **Ch22 ¶117–129 — the dirge ("Fear no more the heat o' th' sun")
  loses source's italic markup.** The source's underscores are Gutenberg
  italic markup, which would render as literal underscore characters in
  the reader. The song is already set off by its own `SONG` heading and
  speaker tags, so nothing about its status as sung verse is lost.
- **Ch9 "Cytherea" (Venus) left unglossed** — source's own word; the
  surrounding praise of the sleeping Imogen carries the sense, and
  naming the goddess for the reader would be an interpretation the
  source does not make.
- **Ch29 ¶157 "mollis aer" / "mulier" Latin wordplay kept in Latin** —
  the soothsayer's own dialogue walks through the derivation in-text;
  removing the Latin would break the mechanism the recognition scene is
  built on. The candidate keeps the Latin in quotation marks, which is
  clearer than source's italics.
- **Ch1 ¶11 dense genealogical speech and Ch27 ¶6 battle narration** —
  both already broken into shorter sentences than source's single
  continuous periods; the remaining density is the amount of information
  in one speech, which the locked one-speech-per-paragraph structure
  cannot thin out without cutting content.

## Model/settings note

- Round 1 (drafting review, both reviewer roles): Claude Sonnet 5
  (`claude-sonnet-5`). Its zero-defect claim did not hold.
- Round 2 (independent verification + the 3 corrections): independent
  verification pass.
- **Round 3 (this adversarial re-verification and this record): Claude
  Opus (`claude-opus-5`).**

No paid API calls were made in any round. No files outside
`books/wip/green-cymbeline/` were touched; no registry, app, deploy or
audio changes.

## Final hash

`candidate.json` sha256:

```
37c9f0de37f0e55d906520605ca2794aedbbf7a0f87da2d0ec1c6b1a204cc904
```

Computed against the file as it stands after the round-2 corrections; no
edits were made in round 3.

**Date:** 2026-09-21

**Verdict: ACCEPTED.**
