Model: opus

# ch90 — independent verification (2026-09-18)

Verifier is not the corrector. Inputs: `repair/ch90-baseline.json` (pre-correction),
`repair/ch90-corrected.json` (post), `repair/ch90-corrections-log.md`, `repair/ch90-source.json` (Maude).

## 1. Diff (computed, Python, paragraph-by-paragraph)

Changed paragraph indices: **[7]** — and only 7.

Log claims: p7 only. **Log and diff agree exactly.** The log's `Before` string is byte-identical to
baseline p7 and its `After` string is byte-identical to corrected p7. No unlogged edit, no unmade claim.

## 2. Structure

| Check | Baseline | Corrected | Verdict |
|---|---|---|---|
| `number` | 90 | 90 | unchanged |
| `title` | Book Five (1806 - 07) — Chapter 6 | same | unchanged |
| paragraph count | 25 | 25 | unchanged (= source 25) |
| top-level keys | number/title/paragraphs | same | unchanged |
| empty paragraphs | — | none | ok |
| chapter `?` / `!` totals | 2 / 4 | 2 / 4 | unchanged |
| p7 `?` / `!` vs source | src 0 / 1 | cand 0 / 1 | parity holds |
| footnote slot p17 | `* "Europe will never be our sincere ally."` | identical | untouched |

## 3. The change, re-derived from the source

Source p7 (Maude): `... and can only say to the King of Prussia and others: 'So much the worse for you.
Tu l'as voulu, George Dandin,' that's all we have to say about it!`

Maude prints the Molière tag in French with no gloss in the dialogue paragraph and no footnote slot for it
(the chapter's only slot, p17, belongs to a different line). French-pass **rule 3** applies: the wording itself
is the point — a quoted tag from *George Dandin* whose force is the naming of Dandin — so it stays inline,
*immediately followed by the English*. Before the fix the modern-en carried the French bare, leaving a reader
with no French the whole clause opaque.

**Verdict on p7: correct.**
- Gloss accuracy: `Tu l'as voulu, George Dandin` = "you wanted/willed it, George Dandin"; the idiomatic English
  of the tag as it is used (a reproach to someone who brought a thing on himself) is *you asked for it*. The
  chosen gloss "you asked for it, George Dandin" is right and repeats the name, which is what makes the tag a tag.
- Completeness: the whole French clause is glossed; nothing left untranslated.
- No new drift: the gloss adds no evaluation, no explanation of Molière, no pointing at the joke. It states the
  tag's meaning and stops. Word count 70 → 74, all four words the gloss.
- Placement: English immediately after the French, inside the same inner-quoted speech, set off by an em dash —
  the same shape used in ch91 and ch38. Consistent with the convention.

## 4. New-reader read

Clear. The sentence now reads: `'So much the worse for you. Tu l'as voulu, George Dandin — you asked for it,
George Dandin' — that's all we have to say about it!` A reader with no French gets the sense on first pass and
still sees that the speaker is quoting French, which is the sociolinguistic point of the salon scene.

MINOR, not blocking: the gloss sits inside the inner single quotes, so strictly the speaker is made to say the
English too. The alternative (gloss after the closing quote) reads worse and breaks the em-dash pattern used in
the sibling chapters. Accepting as house style.

## 5. Mechanical checks

`python3 books/edition_checks.py war-and-peace --candidate repair/ch90-corrected.json`

- `blocks: 0`
- No `bracket-tag`, `footnote-slot-bare`, `footnote-orphan-marker` or `inline-marker-with-slot` flag for ch90.
- ch90 flags are 5 `long-sentence` (p0, p4 x2, p12, p16) — all pre-existing, none in p7.
- Remaining flags (`title-sequence`, `title-duplicate`, `name-variant`) are book-wide properties of the assembled
  edition, unrelated to this chapter or this edit.
- Summary: `{"chapters_checked": 1, "paragraphs_checked": 25, "ratio_low": 0, "french_kept_paragraphs": 0, "blocks": 0}`

## 6. New findings

None blocking. Out-of-scope observations (pre-existing in the baseline, *not* introduced by this edit, and not
for this pass to fix): p7 renders Maude's "countenance Bonaparte" as "appease Bonaparte" and drops "me, and us
in general" to "us". Both predate the correction and belong to a fidelity pass, not the French pass.

Verification: ACCEPT
sha256: repair/ch90-corrected.json 4c63dcdb4de67f5b55cafe0a9526815e8fe8163f7e6ef05f2b3309ab4743dc9c
