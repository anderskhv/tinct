Model: opus

# French pass — round two, independent review

Scope: the 20 chapters with `chN-french-r2.json` — 10, 12, 15, 18, 20, 21, 24, 26,
30, 31, 32, 38, 40, 43, 72, 74 (from `batch2-review.md`, `batch3-review.md`,
`sweep-missed-tags.json`) and 300, 313, 316, 326 (from `batch6-review.md`).

Method: per chapter, a Python paragraph-by-paragraph diff of `chN-french-r2.json`
against its predecessor (`chN-french.json`; `ch30-baseline.json` for ch30), plus
identity checks on `number`, `title`, top-level keys and paragraph count. The change
set was derived from the diff first; the r2 logs were parsed afterwards and their
**Before**/**After** strings string-compared against the two files. Every changed
paragraph was then read against `chN-source.json` (Maude) and against
`french-pass.md` rules 1–6 and `CONVENTIONS.md` § "Foreign language and footnotes".
A case-insensitive `[speaking in …]` scan and `books/edition_checks.py
war-and-peace --candidate` were run over all 20 r2 files.

## Mechanical results

**Diff = log, byte-for-byte, in all 20 chapters.** Derived change set:
ch10 [3] · ch12 [15] · ch15 [16] · ch18 [3] · ch20 [] · ch21 [53] · ch24 [] ·
ch26 [45] · ch30 [15] · ch31 [1,2,12,13,34,44] · ch32 [14] · ch38 [34] ·
ch40 [35,36,40,41] · ch43 [] · ch72 [24] · ch74 [8] · ch300 [4] · ch313 [22] ·
ch316 [11] · ch326 [15,21]. 26 paragraphs across 17 chapters; ch20, ch24 and ch43
are unchanged and each carries an r2 log recording the no-change decision with
reasoning. Every log heading set equals the diff index set exactly — no unlogged
edit, no logged non-edit — and every **Before**/**After** string matches the file
byte-for-byte after whitespace trim. `number`, `title`, top-level keys and
paragraph counts are identical to the predecessor in all 20 files.

**ch30 (rule for this chapter):** diffed against `ch30-baseline.json`. Exactly one
paragraph differs, p15. Maude's source p15 carries no `*`, so there is no slot;
all 85 other paragraphs are byte-identical to the baseline.

**(d) Bracket tags:** a case-insensitive scan for `[speaking in …]`, and a scan for
any `[...]` bracket span at all, returns **0 hits across all 20 r2 files**. The six
lower-case ch31 tags, ch30 p15, ch32 p14 and ch43 p16 from `sweep-missed-tags.json`
are all gone (ch43 p16 had already been fixed in round one; the r2 log says so).

**Gate:** `edition_checks.py --candidate` on each of the 20 files → `"blocks": 0`,
and no `bracket-tag`, `footnote-slot-bare` or `footnote-orphan-marker` flag for any
of them. (The bracket-tag regex now carries `re.I`, so the blind spot batch 2
identified is closed.)

**(a) MAJOR/MODERATE findings, fixed:** ch31 six tags (b2 MAJOR) ✔ · ch32 p14
(b3 MAJOR) ✔ · ch72 p24 `mon cher` (b3 MAJOR) ✔ · ch38 p34 (b3 MODERATE) ✔ ·
ch74 p8 (b3 MODERATE) ✔ · ch300 p4, ch316 p11, ch326 p15, ch326 p21 (b6 MAJOR 1–4) ✔,
each byte-identical to the text batch 6 prescribed · ch313 p22 (b6 MODERATE 5) ✔.
ch40 p36/p41 (b3 MODERATE) — addressed, but by a different route; see finding 2.

**(b) Rule-5 slots** (foreign wording stays inline → slot keeps Maude's English):
correct at ch12 p15, ch15 p16, ch21 p53, ch26 p45, ch38 p34, ch40 p36, ch40 p41,
ch300 p4, ch316 p11, ch326 p15, ch326 p21 — all eleven verified word-for-word
against Maude's own footnote. **One survivor: ch74 p16 (finding 3).**

**(c) `mon cher`:** ch72 p24 now reads `…Until tomorrow, mon cher." (in French)`,
slot p25 unchanged as `* À demain, mon cher.` — exactly the compliant form batch 3
specified.

**(e) Scope:** no paragraph changed that the corresponding review did not raise.
ch40 p35/p40 are the one extension: batch 3's finding names p36/p41 in its
paragraph column but discusses p35/p40 in its body, and the round-two edits there
are pure insertions (word-diff: five tokens in p35, three in p40 — nothing else
touched). Rule 6 is otherwise respected everywhere: every changed dialogue
paragraph is the predecessor text with a cue added, a cue removed, a tag stripped
or a phrase restored/translated, with no other prose movement.

## Findings

| # | Sev | Chapter / para | Rule | Finding |
|---|---|---|---|---|
| 1 | MODERATE | ch30 p15 | 2 | **Redundant cue.** The baseline's p14 ends `…Prince Andrew stepped forward from the staff and said in French:` — a colon introducing this very speech, and Maude's own wording. Round two removed the tag from p15 (correct) and then added `(in French)` after the closing quotation mark, so the reader is told twice, one line apart. Source p15 has no footnote, so this is a `tag-no-slot` item, where the pass's own guidance is "cue at the switch point … 'she said in French' is acceptable when the source has it that way" — the source has it that way already. This is the same defect batch 6 finding 5 ruled against at ch313 p22, which *this same round* correctly fixed by **removing** the cue, and the same shape as ch31 p1, where this round correctly added no cue because the paragraph already said "went on speaking in French." The log defends it with "the p11/p12 precedent in ch32", but ch32 p11 ends "…waving it over his head, shouting:" with no mention of German, so the precedent does not reach this case. Fix: drop `(in French)` from ch30 p15; the tag removal alone is the whole change. |
| 2 | MODERATE | ch40 p35, p40 | 3 / 5 | **Rule 3 stretched past its carve-out.** Batch 3 prescribed the rule-4 remedy: leave p35/p40 English-only and put the French in the slots (`* messieurs les maréchaux`, `* tête-de-pont`). Round two instead restored both phrases *inline* and sent the slots to Maude's English. That does cure the underlying defect (the French no longer vanishes from the edition) and the slots are now correct, but rule 3 admits inline foreign wording **only** "where the wording itself is the point (a pun, a quoted maxim or proverb, verse, the 666 arithmetic)". `messieurs les maréchaux` and `tête-de-pont` are ordinary terms — nothing in either sentence depends on their French form. Round two applied exactly that reasoning three chapters away, stripping `Allez-vous promener` out of ch74 p8 because "a colloquial brush-off" does not reach rule 3's list. The two decisions cannot both be right. Prefer the prescribed rule-4 form, which is also one edit per paragraph rather than two. |
| 3 | MODERATE | ch74 p16 | 5 | **Rule-5 slot still holds the French.** p15 keeps Molière's `"Mais que diable allait-il faire dans cette galère?"` inline with the English immediately after (correct under rule 3), so rule 5 requires the slot to keep Maude's English: `* "But what the devil was he doing in that galley?"`. The slot instead reads `* Mais que diable allait-il faire dans cette galère?` — the French printed twice, the exact duplication batch 6 findings 1–4 were raised about. Batch 3 signed this row off as ACCEPT, so it never entered the MAJOR/MODERATE set, but round two fixed the identical pattern in eight other chapters, which leaves ch74 as the only survivor of the class in the shipped set — an inconsistency a reader can see against ch12, ch15, ch21, ch26, ch38, ch300, ch316 and ch326. (Note for the final sweep: ch64 p40, outside this round's scope, is the same shape.) |
| 4 | MINOR | ch31 p2 | 2 | p1 now ends "…and went on speaking in French." and p2 takes a cue after "he began". Defensible — separate paragraph, its own speech verb, rule 2 is per-paragraph — and not the tight colon-then-speech coupling of finding 1. Recorded so the distinction is on the record, not charged. |
| 5 | MINOR | ch12 p15, ch15 p16 | 5 | The restored English slot now repeats the English gloss that already sits inline beside the foreign wording. Unavoidable under rules 3+5 as written (batch 6 finding 6 accepted the same trade at ch300 p3/p4), and far better than printing the foreign text twice. No action; the rules could use one line saying so. |
| 6 | COSMETIC | ch300 p3 | 4 | The paragraph still ends `…big battalions are always right. *` — Maude's footnote marker carried into reading text. Pre-existing in the baseline, not introduced here, and `footnote-orphan-marker` does not fire because p4 is a slot. Flag for the final sweep. |
| 7 | COSMETIC | ch26 p44, ch74 p8 | 6 | Two cosmetic items batch 2 / batch 3 raised and round two correctly left alone: the Malbrook gloss still falls outside the closing quotation mark at ch26 p44 (batch 2 COSMETIC), and ch74 p8 still opens with the unbalanced `"'I'm not that stupid....` (batch 3, logged out of scope). Both belong to the fidelity/typography gate. |
| 8 | INFO | ch38 p34 | 4 / 5 | Batch 3's MODERATE asked, by its letter, for `* il faut lui faire grâce de l'u!`. Round two wrote `* "We must let him off the u!"` instead. **This is the better call and is accepted:** p33 keeps the pun inline under rule 3 (which batch 3 itself accepted in the row below), so rule 5 governs and the slot must hold Maude's English. The added editorial clause "a pun on the French spelling of Buonaparte vs. Bonaparte" — nowhere in Maude — is correctly gone. |
| 9 | INFO | ch20 p44, ch24 p11, ch21 p54, ch43 p16 | 2 | Four no-change decisions, each logged with reasoning. All correct: the first three were MINOR findings whose own text concedes the placement is convention-compliant and that rule 2 offers no closer anchor, and ch43 p16 was already converted in round one. A no-change log entry is the right output here. |

## Per-chapter verdict

| Chapter | Changed | Verdict |
|---|---|---|
| 10 | p3 | ACCEPT |
| 12 | p15 | ACCEPT |
| 15 | p16 | ACCEPT |
| 18 | p3 | ACCEPT |
| 20 | — | ACCEPT |
| 21 | p53 | ACCEPT |
| 24 | — | ACCEPT |
| 26 | p45 | ACCEPT |
| 30 | p15 | **ANOTHER ROUND** (finding 1) |
| 31 | p1, p2, p12, p13, p34, p44 | ACCEPT |
| 32 | p14 | ACCEPT |
| 38 | p34 | ACCEPT |
| 40 | p35, p36, p40, p41 | **ANOTHER ROUND** (finding 2) |
| 43 | — | ACCEPT |
| 72 | p24 | ACCEPT |
| 74 | p8 | **ANOTHER ROUND** (finding 3) |
| 300 | p4 | ACCEPT |
| 313 | p22 | ACCEPT |
| 316 | p11 | ACCEPT |
| 326 | p15, p21 | ACCEPT |

## Required before re-review

1. ch30 p15 → remove `(in French)`; p14's "said in French:" is the cue.
2. ch40 → revert p35 and p40 to the predecessor's English-only text, and set the
   slots to `* messieurs les maréchaux` (p36) and `* tête-de-pont` (p41), per rule 4
   and batch 3's prescribed remedy.
3. ch74 p16 → `* "But what the devil was he doing in that galley?"`.
4. Record each fix in the affected `chN-french-log-r2.md`, and carry finding 3's
   note (ch64 p40, same rule-5 shape, outside this round) to the final sweep.

17 of 20 chapters are clean and can be accepted as they stand; only ch30, ch40 and
ch74 need a third touch, one paragraph-pair each.

French round two verdict: ANOTHER ROUND
