# Independent Review — Macbeth `modern-da` completeness repair

**Verdict: ACCEPT**

Reviewed without reading `RELEASE-PACKET.md` first; findings below were
formed independently and then checked against the packet, which they
confirm in full (including both sha256 hashes, verified by direct
`sha256sum`).

## 1. Paragraph-count parity (all 28 chapters)

Programmatically compared candidate chapter-by-chapter paragraph counts
against `books/wip/macbeth-completeness-repair/editions/macbeth-modern-en.json`.
All 28 chapters match exactly (1:12, 2:23, 3:57, 4:16, 5:20, 6:11, 7:17,
8:25, 9:34, 10:73, 11:25, 12:47, 13:19, 14:25, 15:65, 16:8, 17:8, 18:70,
19:49, 20:70, 21:37, 22:12, 23:28, 24:12, 25:20, 26:5, 27:21, 28:31).
No mismatches.

## 2. Untouched chapters byte-identical

Chapters 1, 3, 6, 9, 14, 17, 20, 22, 24, 26, 27, 28 (the 12 chapters not
listed in `CHANGED-PARAGRAPHS.json`) were compared paragraph-array and
title against the live defective file
(`app/public/data/editions/macbeth-modern-da.json`). All 12 are identical
— no incidental edits leaked into chapters the task didn't touch.

## 3. Spot-check of all 38 CHANGED-PARAGRAPHS.json entries

Read every entry's accepted-English text against the candidate's Danish
text at the same chapter/new_index coordinate (full listing produced
programmatically, ~30 straightforward insertions plus the two structural
chapters). Findings:

- No truncation anywhere; every Danish paragraph carries the full content
  of its English counterpart, including multi-sentence stage-direction-laden
  speeches (e.g. ch.10 idx36 Macduff's alarm speech, ch.12 idx23 Macbeth's
  "To be thus is nothing" Banquo-fear soliloquy, ch.23 idx11 "Seyton! — I am
  sick at heart").
- No invented content — nothing in the Danish exceeds what the English
  ground truth states.
- **Dagger soliloquy** (ch.8, idx21, "Is this a dagger..."): complete,
  faithful, register-consistent translation. Every clause present:
  "fatal vision," "dolk af sindet," the Hecate/wolf/Tarquin passage, the
  "faste, urokkelige jord" (sure and firm-set earth) close. No omissions.
- **"The raven himself is hoarse... unsex me here"** (ch.5, idx10): complete
  and accurate. All key phrasing present and correctly rendered — "gør mig
  ukvindelig her" (unsex me here), "spær enhver vej til anger" (stop up the
  access to remorse), "gør min mælk til galde" (turn my milk to gall), the
  "tykke nat" / "Stands, stands!" close. Nothing dropped or softened.

## 4. Judgment call #1 — Chapter 5, new paragraph 2 (reused "Glamis thou art...")

Verified directly against the live file's old merged paragraph 1: it
contains the letter text followed immediately, in the same string, by the
"Glamis er du, og Cawdor..." soliloquy text — word-for-word identical to
what the candidate placed at new index 2. Compared that reused Danish
text sentence-by-sentence against the accepted English chapter-5
paragraph 2 ("Glamis thou art, and Cawdor... golden round / Which fate and
metaphysical aid doth seem / To have thee crown'd withal"): every clause
is present and correctly rendered — "for fuld af menneskeligheds mælk"
(milk of human kindness), "mangler den hensynsløshed" (without the
illness should attend it), "hælde min beslutsomhed i dit øre" (pour my
spirits in thine ear), through to "skæbnen og overnaturlige kræfter synes
at have bestemt for dig" (fate and metaphysical aid). Nothing missing or
altered. **This reuse is sound.**

## 5. Judgment call #2 — Chapter 15, paragraphs 6/7 split

Confirmed the mechanism directly: the live file's old paragraph 6 reads (in
full) as the public-toast lines ("Se, de gengælder din hilsen...Jeg sætter
mig her i midten.") immediately followed, in the same string with no
paragraph break, by the aside ("Vær fri og muntre, og snart skåler vi en
runde. [_Går hen til døren._] Der er blod i dit ansigt."). This is exactly
one merged paragraph containing two distinct beats.

Checked `modern-en` chapter 15 at indices 6 and 7 directly: paragraph 6 is
"See, they return your greeting... I'll sit here in the middle." and
paragraph 7 is "Be free and easy, and soon we'll toast a round. [_Goes to
the door._] There's blood on your face." — i.e. modern-en's own
segmentation splits at exactly this same seam. The candidate's Danish
para 6 and para 7 map 1:1 onto these two English paragraphs, concatenation
of candidate 6+7 reproduces the old merged text with only the paragraph
break inserted (no reworded text, no loss, no duplication). Confirmed the
split is correctly placed and that candidate paragraph 7 is the toast
aside/blood line — not a leftover fragment of the toast — matching
modern-en paragraph 7 exactly.

Also checked the adjacent trim/restore chain at idx 41/42/43 (old
paragraph 40's tail): live old paragraph 40 = "...Gid han var her! For
alle, og for ham, drikker vi. Og vores hyldest til alle." (toast completion
glued onto the end, spanning across the Ghost's stage direction which
appears afterward as old paragraph 41). Candidate correctly trims new
paragraph 41 to end at "Gid han var her!", keeps the Ghost stage direction
unchanged at new paragraph 42, and restores the toast completion "For
alle, og for ham, drikker vi. Og vores hyldest til alle." as new paragraph
43 — an exact reconstruction of modern-en's 41/42/43 segmentation, with no
overlap or duplication between paragraphs 41 and 43.

## 6. JSON validity and hashes

`python3 -m json.tool` parses the candidate cleanly (valid JSON).
`sha256sum` of both files matches the packet's stated hashes exactly:

- Candidate: `6441958cec4ddadeb9408414db103cb8228ad9694c39a19c7e359261417a3a18`
- Live (replaced): `c10696221af2265dfa00fdc8f09a27dfd1d2a5289da347d3a6fd82a1de125d57`

## 7. Comparison against RELEASE-PACKET.md

Read after forming the above independently. The packet's paragraph-count
claim ("exact match across all 28 chapters"), the "12 untouched chapters
byte-identical" claim, both hash values, and both flagged judgment-call
narratives (ch.5 reuse, ch.15 split) all match what this review found
independently, with no discrepancies.

## Defects found

None. No paragraph-level defects at any chapter/index.

## Verdict

**ACCEPT.** The candidate is complete, faithful to the accepted English
ground truth, introduces no invented content, leaves all untouched
chapters byte-identical, and both non-obvious judgment calls (chapter 5
paragraph-2 reuse, chapter 15 paragraph 6/7 split) are correct and
precisely aligned with `modern-en`'s own segmentation. Ready for handoff
per the book workflow (Codex owns registry/integration/publication).
