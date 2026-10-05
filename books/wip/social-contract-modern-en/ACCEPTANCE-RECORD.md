# Acceptance Record: *The Social Contract* (Rousseau), modern-en repair

- **Book id / edition:** `social-contract` / `modern-en`
- **Date:** 2026-10-05
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/social-contract-modern-en` (the handoff commit is given in RELEASE-PACKET.md and in the handoff message)
- **Instruction revision used:** `origin/main` at `791d2802560fae4b94b3321d3a3f1d38155fbc20`, fetched at the start of the task, and the branch was cut from it. Read before editing: `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `STRATEGY.md`, `AGENTS.md` (via the root `CLAUDE.md` pointers), `books/AGENTS.md`, `books/CLAUDE.md`, `docs/workflow-boundaries.md`. The Vindication package on `origin/claude/sleepy-hamilton-0f1kqi` was the structural model.
- **Owned path:** `books/wip/social-contract-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio, script or tooling file was touched. No existing tool was modified (the gate and truncation tools ran unmodified or as path-changed scratch copies outside the repository).

## Problem and result

At main `791d2802` the live `modern-en` is Cole's 1913 translation with spelling and a few word swaps. The gate failed on the live files:

| Measure | Live modern-en | Limit | Accepted candidate |
|---|---|---|---|
| Weighted similarity | 0.843 | ≤ 0.75 | **0.633** |
| Light + mechanical chapters | 19/48 (39.6%) | ≤ 5% | **0/48** |
| Identical long paragraphs | 5/483 | ≤ 5% | **0/483** |
| Wrapped scaffolding / truncated quotations | 0 / 0 | 0 | 0 / 0 |

Full output: `GATE-OUTPUT.txt` (live failure reproduced, whole book per chapter, six per-batch runs, truncation audit). Chapters run from 0.497 (ch 38) to 0.706 (ch 31); 47 are REAL and one (ch 38) is REAL-HEAVY. The gate is necessary, not sufficient: the fidelity record below is what supports acceptance.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at main `791d2802` (Cole 1913) | `7bf5ababb7c4dfe1cec0230d44f64960d8b447c4802b6a716b52d770a5854157` |
| `baseline-live-modern-en.json` | The served modern-en being replaced. Byte-identical at main `791d2802` | `cf7facb77bfc5bafc99cb4d7a236fd4f59d5f9ffc4554c6f063ee8daae273843` |

Only the served Cole text was rendered. No other English translation was consulted or copied. Key terms were checked against the French (*Du contrat social*, 1762) from the reviewers' and revisers' own knowledge, and no French text was fetched or saved. There is no `books/raw/social-contract/` provenance folder (see open issue 5).

## Accepted candidate

**`candidate.json`, sha256:**
```
0dc94d4f767fb769ffd6ecafb1434b05e3631c96953b2ffb453aafa520f1fd11
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline). Chapter objects carry the same keys as the live modern-en (`number`, `title`, `paragraphs`); top-level `sections` is identical.
- **Structure:** 48 chapters, 491 paragraphs. Chapter numbers, titles (including "Book N, Chapter M — …"), per-chapter paragraph counts and `sections` are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 41,863 words (source 44,073, live 43,231). No paragraph falls below the 0.75 length ratio (`audit-truncation.py`: 0 hits).
- **Changed against the live modern-en:** 489 of 491 paragraphs (`changed-paragraphs.json`). The two unchanged paragraphs are the fragments `ch22 p23` (`called “Most Serene Prince.”`) and `ch26 p10` (`not the best, but the most powerful.`).
- **Batch sources:** `batches/chNN_pAAA-BBB.json`, 58 files. `candidate.json` is their exact assembly over the live structure. In each file `end` is exclusive and the filename's last index is inclusive.

## How it was made

1. **Rendering** (13 hand renderers R01–R13, by batch): each rendered its paragraphs from the served Cole text under `STYLE-NOTE.md`. The first assembly failed the gate at 0.780: renderers had left clear Cole sentences nearly untouched.
2. **Revision** (13 revisers V01–V13): every paragraph still ≥ 0.72 similar was recast by hand (sentence structure, vocabulary, order of clauses), not by word swaps. Range similarity landed at 0.60–0.66 and the gate passed at 0.633.
3. **Independent fidelity review of every paragraph** (10 reviewers F01–F10, none a renderer or reviser of the text they read): 491 of 491 paragraphs compared pair-by-pair with the source, including a verdict on every renderer-flagged uncertainty.
4. **Fixes** (3 fixers X1–X3, disjoint chapter ranges): 99 paragraphs edited. Logs: `reviews/FIXLOG-X1…X3.md`.
5. **Changed-passage verification** (R2a, R2b, fresh agents): all 99 edited paragraphs re-read against source and prior text; the rest of the book confirmed byte-identical to what the reviewers read.

## Review record

| Round | Scope | Result |
|---|---|---|
| F01 | ch 1–6, 49 paragraphs | 0 BLOCKING, 7 MINOR, 6 NIT |
| F02 | ch 7–12, 35 | 1 BLOCKING, 2 MINOR, 8 NIT |
| F03 | ch 13–17, 49 | 0 BLOCKING, 1 MINOR, 6 NIT |
| F04 | ch 18–22, 50 | 0 BLOCKING, 6 MINOR, 8 NIT |
| F05 | ch 23–28, 66 | 0 BLOCKING, 3 MINOR, 5 NIT |
| F06 | ch 29–33, 49 | 1 BLOCKING, 5 MINOR, 8 NIT |
| F07 | ch 34–40, 57 | 0 BLOCKING, 6 MINOR, 9 NIT |
| F08 | ch 41–43, 62 | 0 BLOCKING, 3 MINOR, 5 NIT |
| F09 | ch 44–46, 48, 32 | 1 BLOCKING, 2 MINOR, 4 NIT |
| F10 | ch 47, 42 | 0 BLOCKING, 5 MINOR, 7 NIT |
| **Total** | **491/491** | **3 BLOCKING, 40 MINOR, 66 NIT** |
| R2a | 50 changed paragraphs | 50 CLEAN, 0 DEFECT |
| R2b | 49 changed paragraphs | 49 CLEAN, 0 DEFECT; whole-book identity check passed |

**Findings disposition** (counts from the fix logs): all three BLOCKING findings and all MINOR findings were applied. Most NITs were applied; about ten were declined as taste or "acceptable as is" (reasons in the logs). 99 paragraphs changed.

The three blocking defects, all fixed:

| Paragraph | Defect fixed |
|---|---|
| ch9 p0 | Possession "does not change its nature; it becomes property in the hands of the Sovereign": self-contradictory. Corrected to the French sense: possession neither changes nature nor becomes property |
| ch33 p1 | Reversed claim: the bounds of possibility are *less* narrow than we imagine |
| ch45 p7 | The recast "too weak to be a threat" invented a claim. Restored: the weakness of the capital protected it against the magistrates in its midst |

Other real defects fixed: ch14 p0 "though" for "because" (reversed the logic of the charge); ch18 p2 "exploit" for *impose upon* (Fr. *en imposer*, "deceive"); ch26 p9 Aristotle clause (could read as Aristotle denying the point); ch36 p3 "these people" for "these deputies"; ch40 p4 conditional "when" clauses flattened to assertions; ch43 p27 "named after them" attached to the wrong antecedent; ch43 p33 subject and blame shifted from the assembly to the populace; ch10 p4 possession/property blur; ch47 p9 "good government" for *good polity* (blurred the government key term); ch47 p33 "inseparable" weakened.

## Editorial decisions (all in `STYLE-NOTE.md`)

- **Key terms held book-wide:** the general will vs the will of all (60/3 in Cole; kept distinct), the Sovereign (capital), subjects/citizens/people, civil vs natural vs moral liberty, legislator, government vs prince vs magistrates, civil religion, the State, right vs force vs power.
- **"Social compact"** is the one term for Cole's "social compact" (13), "social contract" (7) and "social treaty" (4), matching the served chapter title "The Social Compact" and the brief's "social pact". After the sweep: 0 "social contract", 0 "social treaty" remain. Cole's "treaty of peace" (ch4 p12) is not the same term and is kept.
- **"Common will of the magistrates"** (ch23 p4) is kept as Cole has it. It names the corporate will of the magistrates, a distinct thing from the general will (F05 judged it faithful).
- **"Convention"** is kept as the technical term (ch1–6); "agreement" stands where Cole's "convention" is an ordinary agreement.
- **Period references** clarified only inside the sentence and only where the passage supports it (e.g. the decemvirs, Cleomenes after Agis in ch44 p4 — F09 judged this supported by the paragraph). No modern commentary was added.
- **Normalizations in modern-en only:** Cæsar→Caesar, Macchiavelli→Machiavelli, Balbao→Balboa, Castille→Castile, Due→Duc de Beaufort; dangling `--` to a spaced em dash; evident source typos silently corrected (e.g. "nave promised", "is is", "they Sovereign", "th second place", missing full stops at ch4 p11, ch19 p6, ch30 p4). The served original-en is unchanged.
- **American spelling and curly typography**, as the served edition; 0 straight quotes, 0 `--`, 0 contractions in the candidate; `[n]` footnote markers and `_italic_` spans placed as in the source (two italic words that no longer exist after recasting, *maxima* in ch28 p5 and *régime* in ch47 p27, are not carried).

## Consistency sweep (final candidate)

Chapter and paragraph structure identical; every source `[n]` marker present in the same paragraph in the same order; no empty or whitespace-padded paragraph; no odd underscore count; no paragraph shorter than 0.75 of source length. Term counts, source → candidate: "general will" 60 → 63, "will of all" 3 → 4, "Sovereign" 123 → 129, "social compact" 13 → 24 (the 11 added are the "social contract" and "social treaty" normalizations). The small rises in the first three come from clauses that were split or restated, not from new claims. The only "common will" is ch23 p4.

## Open issues (recorded, not blocking acceptance)

1. **Source paragraph fragments.** The served Cole text has paragraphs that are the tail of a sentence cut from the previous paragraph (footnote-tail debris). At least 38 paragraphs start lowercase: ch2 p9, ch4 p14, ch6 p11, ch10 p4, ch11 p5, ch12 p4–5, ch13 p10, ch15 p10, ch16 p12–14, ch19 p6, ch20 p5–6, ch22 p23, ch26 p10–11, ch27 p16–17, ch29 p17, ch30 p4, ch31 p10 and p15, ch36 p12–13, ch39 p9, ch41 p11–12, ch43 p38, ch45 p11–12, ch46 p8–9, ch47 p37, p39–41 (plus others that begin with a closing quote or a motto, e.g. ch25 p8, ch35 p3, ch47 p35–36). They are kept 1:1 as fragments, rendered from only the words present. Repairing the paragraph breaks needs an explicit old-to-new mapping across both editions and the character package, so it is a separate, authorized structural change.
2. **Editorial residue in the source.** ch12 p5 ends "Rousseau quotes the Italian." (a note left in Cole's text) and is kept. Footnote markers `[1]`…`[7]` stay in place, but the footnote texts are not in the source paragraphs. Ch30 p4, ch31 p15 and ch30/ch47 contain bracketed English glosses of Latin quotations, modernized as prose.
3. **Possible source errors kept or silently repaired in modern-en.** Cole's ch47 p38 about Hobbes ("pardon the writer the good for the sake of the bad") was checked by F10 against the French and is literal, not inverted. ch9 p0 in Cole is garbled; the candidate follows the French sense (see blocking defect above). Any decision to correct original-en to match belongs to a separately authorized change.
4. **Review coverage.** Every paragraph (491/491) was compared with the source by an independent reviewer and every edit was re-verified. A separate candidate-only accessibility read (README step 5) was **not** run as its own pass; readability was one of the seven checks each reviewer applied.
5. **No `books/raw/social-contract/` provenance** exists for this book. The served original-en was used as the anchor and was not re-sourced from Gutenberg or another facsimile in this task.
6. **modern-da is now stale** relative to the new modern-en. It was not touched. Do not present it as tracking the new English, and do not generate a new Danish rendering (out of scope).
7. **Onboarding** (`app/public/data/onboarding/social-contract.json`) was not reviewed or changed. It may quote modern-en phrasing; Codex should confirm no onboarding text depends on exact modern-en wording.
8. **Character package impact** is substantial. See the release packet and `character-impact.json`.
