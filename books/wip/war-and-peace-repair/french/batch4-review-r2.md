Model: opus

# French pass — batch 4, round-two correction review (ch 90, 97, 127, 171)

Method: per-chapter Python diff of `chN-french.json` (round one) vs `chN-french-r2.json`, including
`number`/`title`/paragraph-count identity; every changed paragraph compared byte-for-byte against the
`**Before:**` / `**After:**` lines in `chN-french-log-r2.md`; each slot and its dialogue paragraph read
against `chN-source.json` (Maude) under `french-pass.md` rules 2–5; then
`python3 books/edition_checks.py war-and-peace --candidate chN-french-r2.json` (single-chapter splice
into the live edition) for each of the four.

## Diff vs log

| Ch | paras (r1 = r2 = source) | changed idx | log headings | before exact | after exact |
|---|---|---|---|---|---|
| 90 | 25 | [17] | [17] | yes | yes |
| 97 | 49 | [14] | [14] | yes | yes |
| 127 | 25 | [19] | [19] | yes | yes |
| 171 | 30 | [22] | [22] | yes | yes |

Exactly one paragraph changed per chapter, and in every case the changed index set equals the log's
heading set. Every logged `Before` string is byte-identical to the round-one paragraph and every
logged `After` string is byte-identical to the round-two paragraph — no paraphrase, no silent
whitespace or quote-style drift in the log. `number`, `title` and paragraph count are unchanged in all
four files, and no paragraph outside the logged index moved. Nothing round one got right was
disturbed: ch90 p16, ch127 p18 and ch171 p21 are untouched, as each log states.

**Note on paragraph numbering:** the review request named the slots as 90 p18, 127 p20 and 171 p23.
The files, the inventory and the logs are 0-based, where those slots are p17, p19 and p22 — the
paragraph directly after the flagged dialogue paragraph (p16, p18, p21) in each case. The substantive
checks below were run on the actual slot paragraphs; ch97's p14/p16/p17 were already stated 0-based in
the request and needed no adjustment.

## Rule-5 slots (findings 1–3)

All three rule-3-with-a-slot cases now read as rule 5 requires: the foreign wording appears once,
inline in the dialogue paragraph with its English immediately after, and the slot carries Maude's
English footnote with the `* ` prefix.

| Ch | Slot (r2) | Maude source slot | Match |
|---|---|---|---|
| 90 p17 | `* "Europe will never be our sincere ally."` | `* “Europe will never be our sincere ally.”` | word-for-word (straight quotes per file convention) |
| 127 p19 | `* "Cousinhood is a dangerous neighborhood."` | `* “Cousinhood is a dangerous neighborhood.”` | word-for-word |
| 171 p22 | `* "Royalty has its obligations."` | `* “Royalty has its obligations.”` | word-for-word |

- **ch90.** p16 keeps `"L'Urope ne sera jamais notre alliée sincère" ("Europe will never be our sincere
  ally")` — the French phrase printed once, the "L'Urope" mispronunciation preserved exactly as Maude
  has it (twice, once as the flagged word and once inside the quotation), the `(in French)` cue once.
  The triple printing of the French is gone.
- **ch127.** p18 keeps `Le cousinage est un dangereux voisinage — cousinhood is a dangerous
  neighborhood`; the proverb is no longer printed twice.
- **ch171.** p21 keeps `royauté oblige — royalty has its obligations!`; the slot's baseline wrapper
  `(The French phrase means: …)` is correctly reformatted to the `* <English>` house form, settling the
  rule-5 slot-format question (finding 5) in favour of `* <English>` for these three.

## ch97 p14 and the footnote re-pairing (finding 4)

p14 now reads `…"You must know that this is a woman," Prince Andrew said to Pierre (in French).` — the
orphan `*` is stripped and the cue sits once, after the speech attribution, per rule 2. A full-chapter
scan of all four r2 files finds no remaining mid-paragraph `*`, no paragraph carrying two cues, and no
bracket tag of any form.

Slot pairing re-verified against Maude: source p14 ends `“Il faut que vous sachiez que c’est une
femme,” *` and source p15 is `“Andrew, au nom de Dieu!” *(2)`. The file's slots are
p16 ← `* Il faut que vous sachiez que c'est une femme.` and p17 ← `* Andrew, au nom de Dieu!` — each
holding the foreign wording of the dialogue paragraph it footnotes, in Maude's own footnote order.
The re-pairing is correct and unchanged from round one; it is now documented, as required, in
`ch97-french-log-r2.md`.

## edition_checks.py

`python3 books/edition_checks.py war-and-peace --candidate <file>` on each r2 file:

| Ch | BLOCK | bracket-tag | footnote-slot-bare | footnote-orphan-marker | exit |
|---|---|---|---|---|---|
| 90 | 0 | 0 | 0 | 0 | 0 |
| 97 | 0 | 0 | 0 | 0 | 0 |
| 127 | 0 | 0 | 0 | 0 | 0 |
| 171 | 0 | 0 | 0 | 0 | 0 |

The batch's single `footnote-orphan-marker` (ch97 p14) is cleared. Remaining flags in every run are
pre-existing whole-book noise unrelated to the French pass — `title-sequence` / `title-duplicate` on
the source's book-boundary titles, `name-variant` counts, and `long-sentence` flags on paragraphs this
round did not touch.

## Still open (not blocking this round)

- Findings 5–8 are only partly settled. The `* <English>` slot form is now consistent across ch90 /
  ch127 / ch171, but ch150 p7/p12 and ch169 p17 were not in this round's scope and still carry the
  other formatting (`(…)` wrapper, `*Poisonous…` with no space). Finding 6 (trailing `*` in ch150
  p6/p11), finding 7 (the `(2)` ordinal kept in ch115 p3 but dropped in ch97 p17) and finding 8
  (capitalisation of `Le principe…` in ch111 p32) are unchanged. None of these is in ch 90/97/127/171.
- **Merge caveat carried over.** ch90 p12 still differs from the live edition (`Anna Mikhaylovna` here,
  `Anna Mikhailovna` live) — a name-consistency delta from a separate pass, not an inventory index.
  Splice the changed paragraphs in by index; replacing whole chapters will silently revert it. The
  other three r2 files differ from live only at inventory indices.

## Accepted file hashes (sha256, first 12)

ch90:5c783bc0ec96 ch97:6526f322b8c4 ch127:e776cace7f09 ch171:6022443ea93f

French batch verdict: ACCEPT
