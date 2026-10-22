# Acceptance Record: *The Iliad* (Homer, Butler 1898), modern-en repair

- **Book id / edition:** `iliad` / `modern-en`
- **Date:** 2026-10-05
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/iliad-modern-en` (exact commit in RELEASE-PACKET.md and the handoff message)
- **Instruction revision used:** `origin/main` at `791d2802560fae4b94b3321d3a3f1d38155fbc20`. Read before editing: `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `books/CLAUDE.md`, `books/AGENTS.md`, `docs/workflow-boundaries.md`, root `CLAUDE.md`. Model packages consulted: `books/wip/vindication-modern-en/` (branch `claude/sleepy-hamilton-0f1kqi`) and the accepted Odyssey (`books/staged-replacements/odyssey/`, branch `claude/odyssey-modern-en-completion`) for naming consistency (Greek god names, Cronus, American spelling, curly quotes, Persephone).
- **Owned path:** `books/wip/iliad-modern-en/` only. No app, registry, live-edition, modern-da, audio, script, test or character file was touched. Gate tooling was run from scratch copies outside the repository.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `791d2802` (Samuel Butler, 1898 prose) | `3ba331f36cb935cb861bedb51994a4d410cda83013ba8c63bb04a126bb45e86c` |
| `baseline-live-modern-en.json` | The live modern-en being replaced (mostly Roman→Greek name swaps and spelling of Butler) at `791d2802` | `d424a2e68fd2e302781a4f2ecd4ce3f85ff84c7b80f35b066a32f342cd59fa75` |

`books/raw/iliad/raw.txt` exists for the source; this repair used the served original-en as the anchor and did not re-source it. No other translation was consulted or quoted.

## Accepted candidate

**`candidate.json`, sha256:**
```
5719267ee36dca311bb8d74f25ff58994b8dd84fb12cd2f958ece794bb5dc880
```
Drop-in for `app/public/data/editions/iliad-modern-en.json`, same serialization (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline).

- **Structure:** 24 chapters, 1,137 paragraphs. Chapter numbers, titles (`Book N`), per-chapter paragraph counts and `sections: []` are identical to both served editions, so saved places, highlights and notes map 1:1. Paragraph 0 of every Book is the served one-sentence argument, kept as a paragraph.
- **Length:** 148,176 words against Butler’s 152,639 (97%). No paragraph under 0.77 of its source length; the audit-truncation check reports 0.
- **Paragraphs changed against the live modern-en:** 1,129 of 1,137 (`changed-paragraphs.json`). The 8 unchanged ones are short headings, three one-sentence catalogue entries, and three sentences that were already plain modern English in the live edition and in the candidate.
- **Names:** Greek forms per `STYLE-NOTE.md`; zero occurrences of Jove, Juno, Minerva, Neptune, Mercury, Vulcan, Venus, Mars, Diana, Ceres, Bacchus, Saturn, Cronos, Latona, Ulysses, Diomed, Hercules, Aesculapius, Ilius, Alexandrus or Proserpine remain.
- **Epithets:** one fixed rendering per Butler phrase (table in `STYLE-NOTE.md`).

## Similarity gate: PASS (full output in `GATE-OUTPUT.txt`)

| Scope | Weighted similarity | Light + mechanical | Identical long paragraphs | Truncation | Result |
|---|---|---|---|---|---|
| Whole poem | 0.681 | 0/24 | 3/1,124 | 0 | PASS |
| Each Book 1–24 individually | 0.621–0.723 | 0/1 each | 0 each | 0 | PASS (24/24) |
| *Live modern-en before (main 791d2802)* | *0.922* | *22/24* | *56/1,124* | | *FAIL* |

The gate is necessary, not sufficient; acceptance rests on the review record.

## Review: see `reviews/REVIEW-RECORD.md`

Every paragraph was read by an independent reviewer who did not render it; every changed paragraph was rechecked by a second independent reviewer; five second-round corrections were applied and read by the package owner but not independently rechecked again.

## Character-card impact

`character-card-impact.json` (character files not edited). Of the 820 modern-en mentions in `app/public/data/characters/iliad.v1.json`, 816 are in paragraphs whose text changed; only 99 still match at their old UTF-16 offsets; in 31 the mention text no longer occurs in its paragraph (Paris 24, mainly where Butler wrote "Alexandrus", and Ajax the Lesser 7). 90 of the 96 character anchors (`firstMention`, `roleVisibleAt`, snapshot `availableAt`) lie in changed paragraphs. All modern-en mentions and anchors must be re-anchored, and the stored modern-en paragraph hashes and `sourceSha256` refreshed. Candidate offsets for each mention text in the new paragraph are listed.

## Open issues

1. **Butler’s argument to Book 8** says Hera and Athena "set out to help the Trojans". They set out to help the Achaeans. The candidate keeps the sense as served (in both editions); decide whether to correct it in both editions together.
2. **Alexandrus → Paris.** Butler uses both names for one man; the candidate uses **Paris** throughout (Cast display name). Book 3’s argument "Alexandrus, also called Paris" therefore reads "Paris". Reversible if the product prefers Butler’s alternation.
3. **Butler’s garbled/defective sentences** (for example Book 8 ¶15 opening clause, Book 9 ¶8, Book 14 ¶32, Book 15 ¶42, Book 17 ¶49) are rendered by sense. The reviewers’ 43 notes are in `reviews/first-round-notes-no-action.json` and were judged acceptable.
4. **Review depth.** One independent full-paragraph read per Book plus a recheck of the changed paragraphs; no separate general-reader accessibility read; the five round-2 corrections were verified by the package owner only.
5. **Possessive style** of a few names in -s (for example "Meriones’") is cosmetic and may differ from the "-’s" rule.
6. **modern-da** is untouched and no longer tracks the modern-en text; do not mark it current. No Danish work was done.
7. **Provenance.** `books/raw/iliad/raw.txt` was not re-verified against Project Gutenberg in this task.

## Integration (2026-10-21, release text-2026-10-21.3)

Integrated on branch `claude/modern-en-integrate-2`. Method, checks and the card rulings for this book are in
`books/wip/modern-en-release-20261021/RELEASE-3.md`. The package was verified against `origin/main`: candidate and
pre-image hashes equal the packet, the structure is 1:1, and the card pin equals live. The gate was re-run on the
integrated file and passes with the packet's numbers. Coordinate maps and a `CONTENT_RELEASES` entry carry saved places
and highlights. Narration re-prepares changed paragraphs by text hash on the next Play; nothing was generated.
Status: integrated, PR open, not yet published.
