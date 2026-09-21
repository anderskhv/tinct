# Acceptance Record — The Taming of the Shrew (`taming-of-the-shrew`), modern-en

Staged directory: `books/wip/green-taming-of-the-shrew/`
Source (fidelity anchor, unmodified): `source.json` (copy of
`app/public/data/editions/taming-of-the-shrew-original-en.json`)
Candidate (final, accepted): `candidate.json`

**Drafting/repair pass performed by:** Claude Sonnet 5, this session
(2026-09-21). An independent Opus verification pass is expected to follow
separately per programme process, as it did for other books in this
batch.

## Coverage table (scripted, not estimated)

| Chapter | Title | Source paragraphs | Candidate paragraphs | Match |
|---|---|---|---|---|
| 1 | Act 1, Scene 1 — Padua. A public place | 80 | 80 | yes |
| 2 | Act 1, Scene 2 — Padua. Before Hortensio's house | 96 | 96 | yes |
| 3 | Act 2, Scene 1 — Padua. A room in Baptista's house | 170 | 170 | yes |
| 4 | Act 3, Scene 1 — Padua. A room in Baptista's house | 45 | 45 | yes |
| 5 | Act 3, Scene 2 — The same. Before Baptista's house | 95 | 95 | yes |
| 6 | Act 4, Scene 1 — A hall in Petruchio's country house | 89 | 89 | yes |
| 7 | Act 4, Scene 2 — Padua. Before Baptista's house | 58 | 58 | yes |
| 8 | Act 4, Scene 3 — A room in Petruchio's house | 96 | 96 | yes |
| 9 | Act 4, Scene 4 — Padua. Before Baptista's house | 44 | 44 | yes |
| 10 | Act 4, Scene 5 — A public road | 32 | 32 | yes |
| 11 | Act 5, Scene 1 — Padua. Before Lucentio's house | 103 | 103 | yes |
| 12 | Act 5, Scene 2 — A room in Lucentio's house | 113 | 113 | yes |
| **Total** | | **1021** | **1021** | **yes** |

Verified by script:

```
python3 -c "import json; s=json.load(open('source.json')); c=json.load(open('candidate.json'));
print(len(s['chapters']), len(c['chapters']));
print(sum(len(x['paragraphs']) for x in s['chapters']), sum(len(x['paragraphs']) for x in c['chapters']))"
# -> 12 12
# -> 1021 1021
```

All 12 chapters confirmed to be real acts/scenes (reader-facing titles,
no apparatus/editorial-collation stubs). No structural repair was
needed at intake.

## Process followed

1. Staged `source.json`/`candidate.json` unmodified from the live app
   editions.
2. Verified chapter structure sound (12 real acts/scenes).
3. Blind accessibility review of candidate only — `accessibility-review-1.md`.
4. Packeted/full fidelity review of candidate vs. source, chapter by
   chapter, full non-sampled coverage — `fidelity-review-1.md`.
5. Applied all 5 identified fixes via `content_edit_helpers.safe_replace`,
   verified with `diff_report`/`assert_only_changed`-equivalent checks
   (only the intended paragraph indices changed in each chapter).
6. Independently re-verified every fixed paragraph against `source.json`
   directly (quoted pairs in this session and in `fidelity-review-1.md`).
7. Whole-book cross-boundary re-read plus a dedicated second sweep
   specifically for the silently-corrected-wording defect class
   (malapropisms, dialect, archaic proper-noun forms) that parked three
   other books in this batch — see `fidelity-review-1.md` "Dedicated
   sweep" section. No further instances found.
8. Structure re-validated: 12 chapters, 1021 paragraphs each side, no
   empty/whitespace-only paragraphs, JSON valid.

## Defect counts by round

**Round 1 (only round needed):**
- 1 blocking defect: silently-corrected malapropism (ch2 ¶2, "rebused" →
  "insulted").
- 2 blocking defects: silently-standardized archaic proper-noun spellings
  (ch3 ¶121 "Dian" → "Diana" x2; ch3 ¶134 "Grissel" → "Griselda").
- 2 blocking defects: meaning drift on single-word choices in Katherina's
  final speech and Baptista's line (ch12 ¶44 "veriest" → "most genuine";
  ch12 ¶101 "graceless" → "ungrateful").
- 0 additional defects found on the dedicated whole-book sweep after
  fixes were applied.

Total: 5 defects found and fixed, all in round 1. No book was parked;
no third round was needed.

## Deliberately preserved, non-blocking items (with reader-centered reason)

- **Induction structurally incomplete in source.** `source.json` lacks
  the bulk of the Sly framing material; only a 5-line "Presenters" tail
  survives at the end of Act 1 Sc.1 (ch1 ¶74-78). This is a property of
  the locked source text, not something modern-en repair can or should
  fix (adding content would violate "never import from another
  edition"). Reader-centered reason: the reader gets exactly what the
  source gives them, faithfully rendered — no invented Induction
  content, no silently patched gap. Flagged for a possible future
  original-en structural-repair task, out of scope here.
- **"Face"/"brave" tailoring pun rendered as "trim"/"face" (ch8 ¶59-61).**
  The candidate maps the two source double-meanings onto different
  English words than a literal 1:1 mapping would, but both double
  meanings (sewing term vs. confrontation) and the comic logic of
  Grumio's argument survive intact. Reader-centered reason: a modern
  reader gets a working pun instead of a dead one; re-derivation from
  source confirms no claim, actor, or meaning changed, only which word
  carries which sense.
- **Some standalone exclamatory interjections ("What!", "O!") merged into
  the surrounding sentence with a dash rather than kept as a separate
  exclamation** (spot-checked heavily in ch3; pattern also present
  elsewhere). Reader-centered reason: these are genuine sentence
  restructurings (per protocol's "unless the sentence is genuinely
  restructured" exception), done for smoother modern flow; emphasis is
  preserved through the surrounding wording and dash, not dropped
  silently. No instance changed who says what, what is claimed, or
  softened content.
- **"Curst"/"curst shrew" rendered with varying synonyms** (shrewish,
  cursed, shrew) across different lines rather than one fixed
  replacement word. Reader-centered reason: "curst" is a recurring
  archaic adjective, not a proper noun or fixed epithet-with-referent;
  varying the modern synonym by context reads more naturally and does
  not create ambiguity, unlike a name change would.
- **Petruchio's "taming" methods and Katherina's final submission speech
  rendered in full, unsoftened, unmoralized.** Explicitly checked against
  the standing instruction not to editorialize around this content — see
  `fidelity-review-1.md` "Content-sensitivity check."

## Final verification

```
$ sha256sum candidate.json
7b3f1e526efae561a6e4d755b33a857d834e2af22b2efc434b30280169fc368a  candidate.json
```

Date: 2026-09-21.

## Verdict

**ACCEPTED.** All defects found were fixed in round 1 and independently
re-verified against source; the mandatory dedicated sweep for this
batch's recurring failure pattern (silent correction of deliberately
non-standard source wording) found no further instances after the fix
round. sha256 above pins the exact accepted file state.
