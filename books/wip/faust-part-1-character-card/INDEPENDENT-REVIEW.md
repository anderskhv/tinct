# Independent Review — Faust Part I replacement character card

Reviewer: independent session, formed judgment before reading `RELEASE-PACKET.md`.

## Verdict: **DO NOT ACCEPT** (as-is)

The package is close and mostly correct, but the compiler has a real,
quantifiable coverage bug that already produces two wrong
`firstMention`/`roleVisibleAt` values (`valentine`, `martha`) in both
editions. Per this project's own reader-position/character-card
discipline ("if a rule looks unnecessary, run the tests before deleting
anything" / verify, don't pattern-match), this should not replace the
live card until the compiler is fixed and mentions/firstMention are
regenerated and re-spot-checked.

---

## 1. Schema — PASS

`books/wip/faust-part-1-character-card/faust-part-1.v1.json` is valid
JSON with all expected top-level keys: `schemaVersion` (1), `bookId`
(`faust-part-1`), `language` (`en`), `contentVersion`, `normalization`,
`offsetUnit` (`utf16`), `reviewStatus`, and `editions.original-en` /
`editions.modern-en`, each with `sourcePath`, `sourceSha256`,
`chapterCount`, `paragraphCount`, `characters`, `mentions`.

## 2. Source hashes / counts — PASS

Independently computed:

```
sha256(faust-part-1-original-en.json) = e36200c60fe9e763555461ea2d65f9772058aa737635688e7b79ad4010bee79d
sha256(faust-part-1-modern-en.json)   = 7c7b27df8c77e069e8641b8154f67f26d57afab36d73072865d061998d201dfe
```

Both match the card's recorded `sourceSha256` exactly. Both editions:
28 chapters, 1,060 paragraphs total — matches the card's
`chapterCount`/`paragraphCount` for both editions, and matches the
accepted-file counts stated in the task brief.

## 3. Character roster — PASS

All 16 expected ids present in **both** editions, identical to the old
(invalid) card's roster: `faust, mephistopheles, margaret, wagner,
the-lord, raphael, gabriel, michael, valentine, martha, frosch, brander,
siebel, altmayer, witch, student`.

## 4. Speaker-tag mapping (`build_faust_part_1.py`) — MAPPING CORRECT, BUT REGEX HAS A REAL COVERAGE BUG

The `SPEAKER_TO_ID` dict itself is complete and correctly scoped
(`student` → chapter 7 only; `witch` → exact label `THE WITCH` only, not
`CHORUS OF WITCHES`/`YOUNG WITCH`). Cross-checked against every
all-caps speaker tag actually used in `modern-en` (full frequency table
built independently) — no tracked character's tag was omitted from the
dict, and none of the 16 ids is ever bound to a different speaker's
tag.

**However**, the speaker-tag regex is:

```python
m = re.match(r'^([A-Z][A-Z ]+)\.\s', text)
```

This requires the period to come *immediately* after the all-caps name.
It silently fails — and the paragraph is dropped from `mentions`
entirely, not just mis-offset — whenever the source formats the cue as
`NAME (stage direction). dialogue`, e.g. `VALENTINE (comes forward).
Whom wilt thou lure?`. This is a common formatting pattern throughout
both editions (Taylor's translation stage-directs mid-cue constantly:
`(solus)`, `(aside)`, `(to FAUST)`, `(aloud)`, etc.).

Independently counted, per edition, tagged lines that match `NAME (` but
are missed by the strict `NAME. ` regex:

| Character | missed lines (each edition) |
|---|---|
| FAUST | 19 |
| MEPHISTOPHELES | 28 (orig) / 29 (modern) |
| MARGARET | 11 (orig) / 12 (modern) |
| VALENTINE | 3 |
| MARTHA | 10 |
| FROSCH | 1 |
| BRANDER | 2 |
| ALTMAYER | 3 |
| THE WITCH | 3 |
| STUDENT | 1 |
| WAGNER / THE LORD / RAPHAEL / GABRIEL / MICHAEL / SIEBEL | 0 |

Total ≈ 81 (orig) / ≈ 82 (modern) speaker-tagged lines silently missing
— roughly 10–11% of all speaker-tag mentions in the book are absent
from both editions' `mentions` arrays. This is a systemic undercount,
not an isolated edge case.

## 5. `firstMention`/`roleVisibleAt` earliest-occurrence check — 2 OF 9 SPOT-CHECKED CHARACTERS ARE WRONG, DIRECTLY CAUSED BY BUG #4

Checked 9 characters spanning central/major/reference roles: `faust,
mephistopheles, margaret, wagner, the-lord, martha, valentine, witch,
student`. Confirmed correct (scanned full text before the recorded
location, in both chapter and same-chapter-paragraph order) for:
`faust, mephistopheles, margaret, wagner, the-lord, witch, student`.

**Wrong for `valentine`** (both editions): card records
`chapterNumber 22, paragraphIndex 13, offset 0` ("VALENTINE. There's
yet a skull I must be splitting!"). The actual earliest occurrence of
Valentine in the text is **chapter 22, paragraph 0**: `VALENTINE (a
soldier, MARGARET'S brother). When I have sat at some carousal...` —
Valentine's entire opening monologue, missed by the parenthetical bug.
(Paragraph 11, `VALENTINE (comes forward). Whom wilt thou lure?...`, is
also missed and also precedes paragraph 13.)

**Wrong for `martha`** (both editions): card records `chapterNumber 13,
paragraphIndex 2, offset 23` (Margaret saying "Dame Martha!"). The
actual earliest occurrence is **chapter 13, paragraph 0**: `MARTHA
(solus). God forgive my husband, yet he hasn't done his duty by me!` —
Martha's own opening line, two paragraphs earlier in the same chapter,
missed by the same bug.

Both are within-chapter-order errors (right chapter, wrong paragraph),
so they don't break sanity checks that only look at chapter number, but
they are factually wrong "earliest occurrence" claims — exactly what
the release packet itself lists as something independent review must
confirm.

## 6. Mentions spot-check (24 checked, ≥20 required) — PASS

Sampled 12 mentions per edition (24 total) across many chapters
(3, 4, 6, 7, 8, 13, 15, 17, 19, 22, 24, 27, 28) and characters
(faust, mephistopheles, margaret, wagner, martha, altmayer, frosch).
For each, independently sliced `paragraph[startOffset:endOffset]` using
UTF-16 code-unit offsets and compared to the recorded `text`. All 24
matched exactly, and in every case the assigned `characterId` was
contextually correct (no name-collision misattribution found in the
sample).

## 7. False-positive checks

- **"the Lord"**: bound 7 (speaker tag, Prologue) + 2 (orig)/3 (modern)
  name-alias times. All alias hits are unambiguous devotional/liturgical
  references to God/Christ ("the Lord of Heaven," "the Lord rose from
  the dead" [Easter], "the Body of the Lord" [Eucharist, Gretchen's
  altar scene]) — never bound to an unrelated title, a landlord, or a
  "my lord" honorific. This is a defensible design choice, not a name
  collision; flagged as a minor editorial judgment call, not a defect.
- **"student"**: all 16 `STUDENT.`-tagged lines are inside chapter 7
  (the Mephistopheles-as-Faust scene) as intended; the one `A STUDENT.`
  tag in chapter 5 (an unrelated townsfolk walk-on) is correctly
  excluded by both the differing label text and the chapter scope. No
  over- or under-match found.
- **"witch"**: all 8 `THE WITCH.`-tagged lines are in chapter 9
  (Witch's Kitchen) as intended; `CHORUS OF WITCHES` (ch. 24) and
  `YOUNG WITCH` (ch. 25, Walpurgis-Night's Dream masque) are correctly
  excluded (different exact label, not in `SPEAKER_TO_ID`). No over- or
  under-match found.

## 8. Reused snapshot bios — PASS

All 16 characters' single-snapshot bios in the candidate are
byte-identical to the live (old) card's bios. Read all 16: every one is
a general factual/plot description (role, relationships, scene
function) with no wording tied to the old translation's specific
phrasing, and nothing that would go stale against the Taylor text.

## 9. Onboarding fix — PASS

`books/wip/faust-part-1-onboarding-fix/onboarding/faust-part-1.json`:
zero case-insensitive occurrences of "Gretchen"; the only
"Valentin"-prefixed token anywhere in the file is "Valentine" (zero
bare "Valentin" occurrences). `faust-part-1.da.json` is present but was
not touched by the commit that fixed the English file (`0509ae15`,
verified via `git show --stat`); its last modifying commit is the
earlier, unrelated `5289ec7b`. Working tree is clean relative to both
files (no uncommitted changes).

## Additional observation (not blocking, flagged for follow-up)

**"Lisbeth" is a real, named, dialogue-bearing character absent from
both the old and the new card.** Chapter 20 ("At the Well") is a full
scene built entirely around her exchange with Margaret — 7
`LISBETH.`-tagged lines, thematically important (foreshadows Margaret's
fate via the Barbara gossip). Her line count (7) equals Valentine's (7),
who *is* tracked. This gap is inherited from the old card (not
introduced by this repair — the roster was explicitly scoped to match
the old card's 16 ids), so it is not a regression, but it does mean the
"no major speaking character missed" bar in the review brief is not
fully met by the current 16-character scope. Recommend a follow-up
task to add her rather than folding it into this repair.

---

## What needs to happen before acceptance

1. Fix the speaker-tag regex in `build_faust_part_1.py` to also match
   `^([A-Z][A-Z ]+) \([^)]*\)\.\s` (name + parenthetical stage
   direction + period), attributing the mention to the name only.
2. Re-run the compiler for both editions, regenerate `mentions` and all
   `firstMention`/`roleVisibleAt`/snapshot `availableAt` values.
3. Re-verify `valentine` and `martha` (and re-spot-check the other 14)
   land on the true earliest occurrence.
4. Re-run this review's spot-check battery against the regenerated file
   before treating it as a replacement for the live card.
