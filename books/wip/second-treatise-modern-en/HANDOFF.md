# Handoff: second-treatise modern-en repair

**Status: content accepted / handed off. Not published.** Nothing under
`app/`, the registry, live editions, character files, onboarding, audio or
tooling was changed. `modern-da` and all audio were not touched.

- Branch: `claude/gracious-fermat-bjef6w`. The exact commit is given in the
  handoff message; it is the commit that adds this file.
- Instruction revision: remote main `8a50db7d`. For this book, the served
  editions and `books/classify-modern-en.py` are identical to `0a306caf`.
- Owned path (the only one written): `books/wip/second-treatise-modern-en/`.

## Candidate

| | |
|---|---|
| File | `books/wip/second-treatise-modern-en/second-treatise-modern-en.json` |
| SHA-256 | `f6799fa25a28d93cec6029b76e929c788c4d123d02450b517fd128c3a73e6dd2` |
| Serialization | `json.dumps(indent=2, ensure_ascii=False)`, the same as the served file, and a drop-in replacement for `app/public/data/editions/second-treatise-modern-en.json` |
| Structure | 19 chapters, 301 paragraphs, titles unchanged, 1:1 with original-en |
| Words | about 55.8k (source 54.8k) |
| Replaces | served modern-en SHA-256 `177b364414c437af89fe5d09b8922d71ff772ccf7da6ec2e64c710ed061269bf` |
| Baseline | served original-en SHA-256 `efbd7cabd14ed99f98aabae7a95f48e8102db75f0b7aaae0054d0ffe4675b0d0` (Gutenberg #7370, `books/raw/second-treatise/SOURCE.md`) |

The `batches/chNN.json` files are the per-chapter working copies. The
candidate is assembled from them.

## Gate

The full output is in `GATE-OUTPUT.txt`. The committed classifier was run
unchanged. Because it only reads `app/public/data/editions/`, a scratch
runner loaded it and pointed `EDITIONS_DIR` at the served original-en plus
this candidate. After integration, Codex should rerun the real command:
`python3 books/classify-modern-en.py second-treatise --gate`.

- **Whole book: GATE PASS.** Weighted similarity 0.689 (was 0.865). 0/19
  LIGHT or MECHANICAL chapters (was 13/19). Identical long paragraphs 4/291 =
  1.4%. No wrapped scaffolding, no truncated quotations. All 19 chapters are
  REAL (0.505–0.760).
- **Per batch:** ch 1–5, 6–7, 8–11 and 12–16 pass. **ch 17–19 on its own
  reports FAIL** on one criterion only: identical long paragraphs 3/58 = 5.2%.
  All three are the Latin paragraphs (Juvenal and Barclay, ch 19 p34, p37,
  p38), which are verbatim by policy. Its similarity (0.713) and bucket
  checks pass.

## Review

See `REVIEW-RECORD.md`. Five independent fidelity reviews (reviewer ≠
renderer) covered every chapter: 224 paragraphs compared directly,
including a sample from every chapter and whole chapters for 6, 7 and
12–16. They found **0 major and 31 minor findings, all fixed or resolved by
recorded policy.** An independent rechecker then confirmed every edit made
after review, including two follow-up rounds. The style note, term list,
Hooker and Latin policy and the § handling are in `STYLE-NOTE.md`.

## Integration requirements for Codex

1. **Edition.** Replace `second-treatise-modern-en.json` with the candidate
   after verifying the hash. Paragraph and chapter identities are unchanged,
   so saved places, highlights and notes need no migration. Highlights and
   notes that store character offsets or quoted text inside a changed
   paragraph will see new wording, as with any text repair.
2. **Changed paragraphs.** `CHANGED-PARAGRAPHS.json` lists 297 of 301
   paragraphs as changed against the served modern-en. The four unchanged
   are ch 1 p2, ch 16 p2, ch 19 p5 and ch 19 p34 (Latin).
3. **Narration.** English narration uses Grok streaming. Every cached speech
   chunk for the changed modern-en paragraphs is stale and must not be
   selected; the four unchanged paragraphs may reuse compatible cache.
   No audio generation is requested.
4. **Character cards** (`app/public/data/characters/second-treatise.v1.json`).
   The modern-en `sourceSha256` and `paragraphHashes` must be regenerated for
   the new text. Of the 14 modern-en mentions, 12 keep their text with new
   offsets and 2 need new text: ch 2 p0 "one of perfect freedom" → "a state
   of perfect freedom", and ch 2 p2 "the judicious Hooker" → "The judicious
   Hooker". The proposed anchors (UTF-16 offsets) are in
   `CHARACTER-MENTIONS-PROPOSED.json`. Character ids, snapshots and original-en
   data are unaffected.
5. **Section numbers.** The served editions carry no § labels.
   `SECTION-MAP.json` gives the starting paragraph for all 243 sections and
   applies to both editions. Showing § numbers in the reader is an app
   decision.
6. **original-en defects** (not changed here; the original edition is outside
   this assignment's scope):
   - the last paragraph of chapters 1–18 is truncated mid-word by 1–5
     characters (the full text is in raw.txt);
   - ch 4 p3 ends "Exod." (raw has "Exod. xxi.");
   - ch 2 p8 and ch 19 p12 carry leaked labels "Sect, 10." / "Sec. 219.";
   - ch 1 p6 has the §2 Gutenberg corruption.

   A parser re-run or targeted fix is needed. It would change original-en
   paragraph hashes for those paragraphs, including in the character file.
7. **modern-da** was not touched. It was translated from the old modern-en,
   so any provenance tracking should now mark it as derived from a superseded
   English text (Danish is out of scope, and no action is requested).

## Open issues

- ch 17 p1 (§198): a clause appears twice in Gutenberg. Both occurrences are
  rendered until someone checks a pinned critical edition.
- The minor items listed under "Open issues" in `REVIEW-RECORD.md`.
