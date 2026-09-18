Model: opus

# Chapter 168 (Book Nine — Chapter 1) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch168-candidate.json` vs `ch168-corrected.json`; every change re-derived from
`ch168-source.json` (Maude), not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based): **0, 1, 3, 5, 6, 8, 11, 16, 19** — 9 paragraphs.
Log entries: **0, 1, 3, 5, 6, 8, 11, 16, 19** — 9 entries.

**Exact match. No unlogged change, no logged change missing.** Before/after strings in
the log are faithful excerpts of the actual file states (spot-checked on all nine).

## 2. Per-change verdicts (re-derived from source)

| ¶ | Change | Source check | Verdict |
|---|---|---|---|
| 0 | robberies → burglaries | source: "issues of false money, **burglaries**, incendiarisms" | OK — correct word restored; counterfeiting/arson mapping still sound |
| 1 | Oldenburg gloss trimmed to "(whose duchy Napoleon had annexed)"; Continental System gloss trimmed to "(Napoleon's trade embargo)" | source: "the wrongs inflicted on the Duke of Oldenburg, the nonobservance of the Continental System" | OK — MODERATE answered. "a German prince" (unsupported) gone; Britain no longer named, so the gloss no longer manufactures a causal link between England's intrigues and the Continental System, which Tolstoy lists as separate causes. Remaining gloss is supported by ¶2/¶4 and asserts nothing extra |
| 3 | "good principles" → "les bons principes (good principles)"; "countless" → "countless and infinite" | source: "the need of re-establishing *les bons principes*"; "a countless and infinite quantity of other reasons" | OK — quoted French maxim restored per Conventions §3; doubled phrase restored |
| 5 | "or had there not been" → "and had there not been" | source: "and had there not been an autocratic government in Russia" | OK — chain of necessary conditions restored; the whole clause list re-checked, all negations intact |
| 6 | agreement → concurrence | source: "the concurrence of innumerable circumstances was needed" | OK — coinciding sense restored, matches the chapter's coincidence chain |
| 8 | predetermined → predestined | source: "not a free but a predestined significance" | OK — key theological term now consistent with ¶10 "predestination" and ¶19 |
| 11 | "(Proverbs 21:1)" deleted | source: "The king's heart is in the hands of the Lord." — no reference | OK — MODERATE answered; added apparatus removed, line stands unattributed as in the source |
| 16 | pride → self-love | source: "wounded the self-love of both sides" | OK — amour-propre nuance restored |
| 19 | predetermined → predestined | source: "predestined from eternity" | OK — matches ¶8 |

No correction introduced new drift. No paragraph was lengthened, shortened, split or merged
by the corrections; all nine edits are local word/phrase restorations.

## 3. Readability of changed paragraphs

Re-read as a new reader. All nine remain clear. The two restorations that could have hurt
readability do not: "les bons principes (good principles)" carries its own gloss, and
"concurrence of innumerable circumstances" is unambiguous in context. Removing the
Proverbs citation costs a reader nothing — the line reads as the proverb it is.

## 4. Structure and punctuation

- Paragraph count 20 = 20 = 20 (source / candidate / corrected). Order unchanged.
- `number` 168 and `title` "Book Nine (1812) — Chapter 1" identical to source.
- No empty paragraphs.
- Per-paragraph `?` and `!` parity with source: **clean across all 20 paragraphs**.
- JSON valid.

## 5. French slot, ¶14–15 — re-checked, conforms

- ¶14 translates the French inline ("whether to shed (or not to shed) the blood of his
  peoples (in French)"), cue used once, placed where Maude's asterisk stood.
- ¶15 retains the slot and carries the original French prefixed `*`:
  `* Verser (ou ne pas verser) le sang de ses peuples.`
- Nothing duplicated, paragraph count preserved. Matches CONVENTIONS §Foreign language 1–4.
- Both paragraphs are byte-identical between candidate and corrected — correction did not
  disturb the slot. Only the capital `V` differs from Maude's inline French (cosmetic, as
  the fidelity review already recorded).

## 6. New findings

None blocking.

- **Non-blocking (log accounting):** the fidelity review's ¶18 MINOR ("navvy" → "laborer",
  "mattock" → "pickaxe") was neither applied nor listed among the deliberately-unchanged
  items in the log's closing note, unlike the ¶3 Memorandum gloss, the ¶16 "recoup them"
  compression and the diacritics. Applying MINOR findings is discretionary under the
  protocol, so this does not block; it is an omission in the log's accounting, not in the file.
- **Non-blocking (pre-existing, unchanged by this round):** ¶16's four-sentence
  "There were… There was… There were…" scaffolding still converts one accumulating sentence
  into an inventory; ¶18 restates "Equally right or wrong is he who says" across a sentence
  split. Both were flagged as acceptable by the fidelity review and neither is a MAJOR or
  MODERATE finding.
- No MAJOR finding existed. Both MODERATE findings (¶1 Continental System gloss, ¶11
  Proverbs citation) are fully answered. **No MAJOR or MODERATE finding remains.**

Verification: ACCEPT
sha256: c4339e10875af9d1f7f58f9dd8f665d08a315ef520b1bc4e648ffe2469af67d6
