# Crime and Punishment: character-identity review

**Status: complete. Independently verified, ready for Codex to integrate. Not published.**

This package gives an explicit editorial decision for every live character mention that the accepted modern-en candidate affects and that `character-card-impact.json` could not settle by keeping the same text: the **408** computed spelling replacements and the **30** manual-review mentions. No edition text, character-card prose, code, live file or deployment setting was changed. The accepted candidate is still `18be4155…`, byte for byte.

## Result

| Final decision | Class | Entries | Meaning |
|---|---|---:|---|
| map | spelling-variant | 408 | Same person, same reference, and the name now uses its Garnett spelling (Sonya→Sonia, Dunya→Dounia, Razumikhin→Razumihin, Svidrigailov→Svidrigaïlov, -ich→-itch) |
| map | same-text | 29 | Same person, same name text, sometimes at a new offset. All 29 manual-review mentions except M01 fall here: the occurrence count changed only because the candidate added another occurrence of the name (a restored omission, or a pronoun replaced by the name) |
| drop | removed-with-duplicate-text | 1 | M01 (8.120). The sentence was an invented duplicate of 8.121, which the package removed. The same moment is already bound at 8.121@37, so M01 must **not** be relinked there. |
| — | changed identity | 0 | |
| — | name replaced by a pronoun or epithet | 0 | |
| — | ambiguous | 0 | |
| — | unresolved | 0 | |

- **All 408 script spans are right.** Every proposed span for the spelling entries is the correct counterpart, confirmed by reading, not only by computation.
- **The 30 manual-review entries** have no script span. Taking occurrences by rank would have chosen the wrong span in M05, M12, M16–M23, M27 and M28. `ledger/final-mapping.jsonl` gives the correct span for each.

## Open decisions for the card owner

These do not block integration. The mapping below is certain in each case.

1. **R125 (4.13 @11–23, "Hey! You, Svidrigaïlov!")**
   - Raskolnikov throws the name at the boulevard dandy as a taunt.
   - The live binding opens the real Svidrigaïlov's card, and that card does not explain the allusion.
   - The binding is carried forward unchanged, because a migration should not silently change editorial policy.
   - The choice: mark the mention as allusive or add an allusion note to the card (both reviewers lean this way), or unbind it.
   - `identityNote: "allusive-use"` in the ledger.
2. **Svidrigaïlov snapshot 1 (available from 3.38) may be a spoiler.** It says "recently widowed" and mentions his "arrival in St. Petersburg", and both come later in the book. This is card prose, which is outside this task's scope and was left untouched. The independent reviewer raised it, and the lead confirmed it.
3. **Display-name spellings** (Sonya, Dunya, Razumikhin, and so on) are unchanged card content. The release packet already lists this as the card owner's decision.

## Files

| Path | What it is |
|---|---|
| `LEDGER.md` | The complete readable ledger, one row per entry. It gives the entry ID, character ID, chapter and paragraph, the existing mention (text and live offsets), the proposed candidate span, the decision and class, the final span, whether the reviewer agrees, and the evidence. |
| `ledger/final-mapping.jsonl` | **The integration input.** Per entry: `existingMention`, `proposedCandidateSpan`, `finalDecision`, `finalDecisionClass`, `finalSpan`, `rationale`, `evidence` (alignment, neighbourhood unchanged or revised, source occurrences, paragraph hashes, edit rounds) and `independentReview`. |
| `ledger/decisions.jsonl` | The lead's decisions, written before the independent review |
| `review/independent-verdicts.jsonl`, `review/INDEPENDENT-REVIEW.md`, `review/reviewer_tools/` | The fresh reviewer's verdicts, method and tools. All 438 verdicts were written blind, before the reviewer opened the lead ledger. |
| `evidence/entries.json`, `evidence/entries.md` | The mechanical worksheet: live, candidate and source context, variant-folded token alignment, and the ledger edits for each paragraph |
| `evidence/crosscheck.json` | The supplementary cross-check of all 1,869 mentions in changed paragraphs (see below) |
| `INPUTS.md`, `inputs/` | The pinned inputs, their hashes, and the check for newer accepted inputs |
| `tools/` | `build_evidence.py`, `build_decisions.py`, `crosscheck_all.py`, `finalize.py`, `validate.py` and `verify_inputs.py`. All run offline and deterministically, with no model or network calls. |

## Method

1. **Pinned and verified the inputs** (`INPUTS.md`). No newer accepted package or live file exists. An unmerged card draft on `claude/great-clarke-mugpy4` is explicitly not an input.
2. **Built the evidence.** Every flagged live mention was checked at its UTF-16 offset in the normalized live paragraph (`prose-reader-v1`, the same as `characterCards.ts` `normalizeParagraph`). All 438 match the card package.
   - Live and candidate paragraphs were token-aligned after a Garnett-variant fold.
   - The Garnett source paragraph and the paragraph's ledger edits were attached.
3. **Lead review.** I read every entry's live, candidate and, where needed, source context and decided identity.
   - 40 entries sit in rewritten wording, and the ledger marks them `neighbourhoodUnchanged: false`. The referent was confirmed by reading the rewritten clause.
   - In R003, R103, R156, R179, R194, R255 and R266, Garnett uses a pronoun ("the latter", "him") where the modern edition names the person. The antecedent was checked.
4. **Independent review.** A fresh reviewer was given the raw inputs and the entry list but not the lead's conclusions. It recomputed offsets with its own code, read each context, wrote all 438 verdicts, and only then compared.
   - **Result:** it agrees with the lead on decision, class and exact span (start, end and text) for **438 of 438**.
   - Its three wording objections were accepted and fixed in the ledger:
     - R125's rationale had wrongly said the card explains the allusion.
     - A generic "same position" line appeared even where the wording was revised; the ledger now states which.
     - M09's added name replaces a pronoun.
   - One label difference was reconciled as equivalent: the reviewer's `drop/removed` and the lead's `drop/removed-with-duplicate-text`. See `CLASS_ALIASES` in `tools/finalize.py`.
5. **Validation** (`tools/validate.py`):
   - All 438 entries are covered exactly once.
   - Each existing span reads correctly in the live text, and each final span reads correctly in the candidate.
   - Across 793 paragraphs, no final span overlaps another final span or any of the 1,431 script-relocated spans.

## Supplementary cross-check (outside the 438-decision scope)

`tools/crosscheck_all.py` ran the same alignment over all 1,869 affected mentions.

- **The 1,431 `same-text-relocated` suggestions.** 1,428 agree with the alignment.
  - The other 3 are "Rodya" at 22.3@77, 23.33@342 and 38.9@588, in restructured sentences my aligner could not pair. I read them: each paragraph has the same number of "Rodya"s in live, candidate and source, all referring to Raskolnikov, so **the script's suggested spans are correct**.
  - This check guards against a count-preserving swap of names and pronouns, which rank-based relocation would miss. None was found.
- **12 new, unbound name occurrences** appear in the reviewed paragraphs (from restored omissions and pronoun-to-name edits): 13.108@141, 13.204@71, 16.58@1082, 17.65@374, 18.5@158, 18.21@177, 26.67@286, 29.64@1072, 31.73@239, 33.13@3848, 40.3@1373 and 40.9@558.
  - They are not counterparts of existing mentions and are not bound here.
  - Binding them is an optional coverage addition for the card owner.

## Release handoff for Codex

**Inputs to integrate against**

| Item | Value |
|---|---|
| Accepted candidate (unchanged) | `books/wip/green-crime-and-punishment/candidate.json` @ `debcc8c2`, sha256 `18be4155497ebdf78013d1a26ce2fad86839aaa00c036cf9970954af550888eb` |
| Live card package it re-anchors | `app/public/data/characters/crime-and-punishment.v1.json` @ `main` `1bd1bfb3`, sha256 `2125526c56769e4f09be387f6d5dc2e974dc9aca7fb931115fb893da34706d98` |
| This review's mapping | `ledger/final-mapping.jsonl`, sha256 `de97a831ffd388325eed5d00314f11453e7e9b886ae72e0fa29cdde6b1ece547` |
| Readable ledger | `LEDGER.md`, sha256 `c96f685d4af2fd1ffadef3bc9c4b7c863bed9936a6d6ce624bc792d3e056813e` |
| Lead decisions | `ledger/decisions.jsonl`, sha256 `15ff4a1f984b915df9b2cb06b9991076a261e06753d3e9bc887a1d7c79d516d0` |
| Independent verdicts | `review/independent-verdicts.jsonl`, sha256 `47c6c8aaa93be5d561d685c1c750cf357569acca1a2cebd90ba0f646f0b6a80d` |

**Steps for the modern-en mentions of the 438 entries.** Match each ledger record to a live mention by `(characterId, chapterNumber, paragraphIndex, existingMention.startOffset)`.

- `finalDecision: "map"` (437 entries): set `startOffset`, `endOffset` and `text` from `finalSpan`. Keep `characterId`. The ledger does not prescribe `resolution` provenance.
- `finalDecision: "drop"` (1 entry, M01): remove the mention. Do not add a replacement.

**Still Codex's integration work, and not decided here.** The release packet lists these:

- apply the 1,431 same-text relocations (all of them spot-validated above)
- re-derive the 42 offset anchors in changed paragraphs
- update the modern-en `paragraphHashes` and `sourceSha256`
- bump the `characterReleases` revision from `2026-09-12.1`

For **anchors**, note that no drop affects a first mention or snapshot gate: M01's character, Raskolnikov, is first mentioned in chapter 1. Anchors that point at a mapped mention should follow that mention's final span.

**Checks after integration**

- `python3 books/wip/crime-character-identity-review/tools/validate.py` exits 0.
- Every rebuilt modern-en mention reads its `text` at its offsets in the accepted candidate.
- The candidate's served sha256 equals `18be4155…`.

**Not included here:** no GPU or TTS work, no audio changes, and no card-prose edits.

## Reproduce

```bash
git fetch origin claude/awesome-euler-pjc7jv main
python3 books/wip/crime-character-identity-review/tools/verify_inputs.py   # ALL PINS OK
cd books/wip/crime-character-identity-review/tools
python3 build_evidence.py && python3 crosscheck_all.py && python3 build_decisions.py && python3 finalize.py && python3 validate.py
```

The reruns are byte-stable. `review/` is the reviewer's own output and is not regenerated.
