# Othello modern-en — review record

## Roles (reviewer ≠ renderer)

| Role | Agents | Scope |
|---|---|---|
| Renderers | 11 separate agents, one per batch (b01 1.1–1.2 · b02 1.3 · b03 2.1 · b04 2.2–2.3 · b05 3.1–3.3 ¶0–89 · b05b 3.3 ¶90–178 · b06 3.4 · b07 4.1 · b08 4.2 · b09 4.3–5.1 · b10 5.2) | Fresh render from the Gutenberg #1531 line units, following `RENDER-BRIEF.md`. The renderers did not see the old modern-en text. |
| Fidelity reviewers | 4 separate agents that rendered nothing: rev-A 1.1–2.1, rev-B 2.2–3.3, rev-C 3.4–4.2, rev-D 4.3–5.2 | **Full read of every speech in every scene** (1,222 speeches), not a sample, against `REVIEW-BRIEF.md`. |
| Editor | coordinating session | Triage and application of fixes (`editor-fixes.json`). |
| Re-checker | 1 separate agent that neither rendered nor did the first review | Checked every editor fix in context (`recheck.json`). |

## Findings (first review)

| Reviewer | Speeches read | must-fix | should-fix | note | Verdict |
|---|---|---|---|---|---|
| rev-A (1.1–2.1) | 253 | 0 | 2 | 7 | meets standard |
| rev-B (2.2–3.3) | 307 | 1 | 3 | 2 | meets standard |
| rev-C (3.4–4.2) | 355 | 0 | 5 | 5 | meets standard |
| rev-D (4.3–5.2) | 305 | 0 | 1 | 6 | meets standard |

By category: mis-gloss 16, pun/bawdy 9, register 6, invention 2, too-close 2. No omissions and no
line-order defects were found.

The only must-fix was **6.24 l.10**: "I've got tipsy" made Iago the drinker, when in the original he
gets the Cypriots drunk. It was fixed.

## Resolution

- All 12 must-fix and should-fix findings were applied. Some use editor wording: 10.6, 10.80, 12.71.
- 19 of the 20 notes were also applied, in some cases reworded (4.96 keeps the fig image). The one not
  applied is 13.48 l.2 as proposed; the editor reworded it to "marital duties".
- There were 4 further editor fixes:
  - 1.3: removed padding that a renderer had added only to clear a length flag.
  - 3.35 l.7: "seven years' pith" means "since my arms were seven years old".
  - 15.2 l.2: made the refrain match line 0, as the re-check asked.
  - 1.33: "the beast with two backs — having sex".
- Total: **36 line edits**, logged with before, after and basis in `editor-fixes.json`.
- The re-check accepted **34 of 34** fixes and rejected none. It raised one follow-up (15.2 l.2), which
  is applied. The 1.33 gloss was added after the re-check and has not been independently re-checked; it
  is listed as an open issue.

## Renderer self-flags (interpretive choices worth an editor's eye)

These are defensible readings of contested lines. Reviewers accepted them; they are recorded here so
Anders or a later reviewer can revisit them.

- **1.4**: "almost damn'd in a fair wife" is rendered literally ("half-damned already by a pretty wife")
  because it is a famous crux. "Spinster" is rendered "an old maid at her spinning wheel".
- **1.31**: "gennets for germans" became "Spanish ponies for relatives".
- **2.3**: "voice potential as double as the duke's" became "as much weight — twice as much —".
- **2.4**: "unbonneted" is rendered as "hat on, as an equal".
- **3.61**: "the young affects in me defunct" is disputed.
- **3.84**: "locusts" is glossed as carob pods and "coloquintida" as bitter-apple.
- **4.65**: the white/wight pun.
- **4.72**: cod's head / salmon's tail now shows both readings.
- **4.105**: "trash" is read as the hunting term (hold back on a leash).
- **6.3**: "the purchase made, the fruits are to ensue" leaves the sexual sense implied.
- **7.29**: "a Florentine" is read as "even one of my own Florentines".
- **9.59**: "close dilations".
- **9.172**: "to obey shall be in me remorse" is read as pity for Othello.
- **10.26/28**: "liberal/frank" hand.
- **10.40**: "mummy … conserv'd of maidens' hearts".
- **10.90**: "eight score eight hours".
- **11.66**: "scored me".
- **11.162**: "If what he might he is not".
- **12.33**: "turn thy complexion there" became "turn pale".
- **12.37**: "public commoner".
- **13.48**: "store the world".
- **13.49**: "by bad mend".
- **15.2**: "It is the cause" (see 15.2 above).
- **15.153**: "honour outlive honesty" became "reputation outlive integrity".
- **15.161**: "your stop", "butt", "compt".
- **15.166**: "for cloven hooves" was added to explain why Othello looks at Iago's feet.
- **15.197**: "Spartan dog" became "savage and silent".

## Automated checks

- **Similarity gate:** see `gate-output.txt` in this folder. It passes at a weighted similarity of 0.481.
- **Structure:** there are 15 chapters with 1,391 paragraphs. Per-chapter counts, titles and sections
  are identical to the served editions. The JSON is valid.
- **Speaker prefixes and brackets:** every speaker prefix is carried verbatim from the served edition,
  and every bracket wrapper is preserved.
- **Stage directions:** these are byte-identical to the live modern-en.
- **Inline directions and italics:** inline `[_To …_]` directions and `_…_` italic markers are preserved.
- **Archaisms:** none remain in speech text (thou/thee/thy/hath/doth/'tis/ancient/napkin/prithee and
  similar). Apostrophes are straight, double quotes are curly, and there are no ellipses.
- **Length:** 1 paragraph falls below 75% of the source word count. It is 1.3, "You told me you hated
  him.", which is natural compression.
