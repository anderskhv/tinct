# Acceptance Record: *The Brothers Karamazov* (Dostoevsky, tr. Constance Garnett), modern-en repair

- **Book id / edition:** `brothers-karamazov` / `modern-en`
- **Date:** 2026-10-05
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/brothers-karamazov-modern-en` (the commit is given in RELEASE-PACKET.md and the hand-off message)
- **Instruction revision used:** `origin/main` at `791d2802` (fetched at the start and re-checked at the end; unchanged, with no change to any instruction file). `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `STRATEGY.md`, `AGENTS.md`, `books/AGENTS.md`, `books/CLAUDE.md` and `docs/workflow-boundaries.md` were read before any editing.
- **Owned path:** `books/wip/brothers-karamazov-modern-en/` only. No `app/**`, registry, live edition, onboarding, character file, modern-da, audio, script, test or tooling file was touched.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` on main `791d2802` (Garnett) | `b8ada3e43c6f997a0d55f77e1f22bb769f021071aaeff3d0cb25dcd1acb80736` |
| `baseline-live-modern-en.json` | The live modern-en being replaced. Byte-identical to the served file on main `791d2802` | `5b2d957d5fdca2f1c6374afe61fd7a3e72e2316f06f5bc1f5796939485f91378` |

The served original-en is Garnett's English. `books/raw/brothers-karamazov/raw.txt` exists in the repository; it was not re-sourced for this repair. The live modern-en was not used as a starting text: it was Garnett with spelling and a few word swaps, and every paragraph was rendered afresh from the Garnett text.

## Accepted candidate

**`candidate.json`, sha256:**
```
0426f2f3629b48a14b9363add7bcc4e7be633b8ac4bdfc29557713bb563aaf0f
```

- **Serialization:** the same as the served file: `json.dumps(..., ensure_ascii=False, indent=2)`, no trailing newline, same key order. It is a drop-in for `app/public/data/editions/brothers-karamazov-modern-en.json`.
- **Structure:** 96 chapters and 5,836 paragraphs. Chapter numbers, titles, `section` labels, per-chapter paragraph counts and the top-level `sections` array are identical to both served editions. Saved places, highlights and notes map 1:1 with no migration. No empty paragraph. 198 paragraphs are under 20 characters, against 206 in the source (headings, "Yes." and the like).
- **Size:** 343,894 words, against 349,373 in the source (−1.6%). No paragraph fell under the 0.75 length ratio except two that were inspected (ch34 p13 and ch54 p40, ratios 0.74 and 0.71; natural compression, nothing omitted).
- **Paragraphs changed against the live modern-en:** 5,476 of 5,836. The 360 unchanged paragraphs (mostly short lines and headings) are in `changed-paragraphs.json`.
- **Batch sources:** `batches/chNN_pAAA-BBB.json`, 153 files. `candidate.json` is their exact assembly over the pinned structure.

## Similarity gate: PASS (full output in `GATE-OUTPUT.txt`)

| Scope | Weighted similarity | Light + mechanical | Identical long paragraphs | Result |
|---|---|---|---|---|
| Live modern-en (the failure) | 0.896 | 74/96 (77.1%) | 327/4,040 (8.1%) | GATE FAIL |
| **Candidate, whole book** | **0.690** | **0/96** | **21/4,040 (0.5%)** | **GATE PASS** |
| Candidate, ten chapter ranges (1–12 … 94–96) | 0.675–0.726 | 0 in every range | within limit | PASS in each range |

Every chapter is in the REAL bucket (0 REAL-HEAVY, 0 LIGHT, 0 MECHANICAL). Wrapped-scaffolding and truncated-quotation counts are both 0.

The 21 identical long paragraphs are short plain lines, scripture or verse, a folk song and the like. They are not unmodernized narration.

**How the gate was run:** the unmodified `books/classify-modern-en.py` (sha256 `95070028…`) on a scratch mirror holding the served original-en and `candidate.json` in place of the live modern-en. The tool reads only `app/public/data/editions/`, and live files may not be edited under this workflow. The mirror reproduces the assigned failure exactly on the live file (0.896, 74/96, 327/4,040).

**The gate is necessary, not sufficient.** Passing it was not used as the target. Renderers were told not to reword clear sentences to lower the score, and the reviews below are what establish fidelity.

## Register evidence (average sentence length, whole book)

| Scope | Garnett | Candidate |
|---|---|---|
| Whole book, average sentence length | 14.0 words | **12.0** |
| Sentences over 40 words | 932 | **235** |
| Zossima (ch39–41) | 19.0 | 14.1 |
| The Grand Inquisitor (ch36) | 18.3 | 14.9 |
| Trial speeches (ch87–92) | 20.3 | 15.3 |

## Editorial decisions

All decisions are recorded in `STYLE-NOTE.md`.

- **Names and forms of address:** kept exactly as served (Fyodor Pavlovitch, Dmitri Fyodorovitch, Mitya, Alyosha, Father Zossima, Madame Hohlakov, Miüsov, Païssy …). Name census: no personal name was dropped; "sir" counts are equal (65 and 65).
- **Thou/Thee/Thy:** rendered *You/Your* (capitalized) where the speaker addresses Christ or God (the Inquisitor, prayers, Job quotations). *He/His/Him* and *Who/Whom* for Christ or God stay capitalized as served.
- **Voices:** a per-speaker table in the style note. Contractions are welcome in dialogue and none are used in narration of Zossima's discourses, the Inquisitor's speech or the formal trial speeches. A scan found the only contractions in those chapters inside quoted speech.
- **Scripture and verse:** kept recognizable. Garnett's "unto", "hath" and "thee" survive only in scripture quotations and a few quoted verses.
- **Typography:** curly quotes, unspaced em dash, `_italics_` kept on the same words, American spelling as served.
- **Small corrections of unmistakable Garnett slips**, each recorded in `reviews/renderer-notes/`: "this face" → "his face" (ch40 p21), "has became" → "happened" (ch41), "Protr Ilyitch" → "Pyotr Ilyitch" (ch50 p38), "premised" → "promised" (ch82), stray spaces and a missing full stop. Other possible Garnett oddities (e.g. "provincial mayor" for Samsonov in ch12 p39, "Napoleon … father of the present one" in ch33, "Holy Spirit/Holy Ghost" in ch25) were kept as served, not corrected.
- **"Danish dog" → "Great Dane" (ch79 p19)** is the one place a period term was changed to a modern equivalent; it names the same dog.

## Review record

**Renderers:** 125 jobs, hand-rendered paragraph by paragraph in batches of about 1,200–3,700 words, each with a self-check script and a list of uncertain readings (`reviews/renderer-notes/job001–125.md`). One job (ch44 p93–141) was blocked once by the API content filter, wrote nothing, and was re-run successfully. Nothing was generated with bulk regex or by script.

| Round | Scope | Reviewer (≠ renderer) | Result |
|---|---|---|---|
| R1 fidelity, 76 reviewers | **Every paragraph, 5,836 of 5,836**, in 153 batches. Each reviewer attests that it read every paragraph of its assignment (76 of 76) | Fresh independent agents | 11 BLOCKING, about 293 MINOR, about 565 NIT |
| R1 fixes | 293 paragraphs rewritten from the reviewers' proposed replacements and applied (`reviews/applied-fixes-round1.json`) | — | exactly 293 paragraphs differ from the pre-fix assembly (mechanically checked) |
| R2 changed-passage verification | All 293 changed paragraphs, side by side with source and previous text, three verifiers | Fresh independent agents | 276 CLEAN; 17 MINOR, 0 BLOCKING. The 17 were applied (`applied-fixes-round2-R2.json`) |
| R3 recheck | The 17 R2 paragraphs | Fresh independent agent | 16 CLEAN, 1 MINOR (ch55 p2, one word), applied |
| Oath strength | 4 paragraphs where "Upon my word" had become "I swear" (ch50 p97 and p131, ch52 p179, ch78 p55) restored to "On my word" | author | recorded in `applied-edits-oath-strength.json` |
| Accessibility read | Nine excerpts across the book's voices (about 13,400 words, no source shown) | Fresh independent agent | ratings 3–5 (ch3 3, ch12 4, ch23 4, ch36 3, ch40 4, ch65 5, ch75 4, ch90 3, ch95 3), 50 passages flagged. See open issue 2 |

**Reviewed for:** omissions, additions, reversals, softened or sharpened claims, misread vocabulary, dropped or changed names, broken quotations and italics, truncation, voice, Edwardian residue, typography.

**What the reviews caught** (examples; all fixed): reversals (who bowed to whom in ch25 p17; who burst in in ch23 p26; the cause of the smearing in ch35 p10), softened or sharpened oaths ("confound" → "damn", "bother" → "to hell with", "murdered" → "killed"), dropped hedges ("perhaps", "apparently"), about 20 added "sir"s in Smerdyakov's lines in ch75–76, an added price ("sixpence an hour", ch3), a changed quotation that Alyosha repeats (ch36 p14), lowercase "you" in the devil's address to God (ch39 p47).

**Mechanical checks on the final candidate:** JSON valid; structure identical to served; `books/audit-truncation.py` (en) flags 2 paragraphs, both inspected and fine; no straight quotes, `--` or unbalanced italics in any batch; name census (no dropped personal names; the only differences are sentence-initial words and the intentional Thou → You change); digits and numbers preserved; "sir" counts equal.

## Character-card impact

`character-card-impact.json` and RELEASE-PACKET.md. Of 4,696 modern-en mentions in `books/characters/brothers-karamazov/characters.v1.json`: 72 sit in unchanged paragraphs (valid as they are), 902 have changed paragraphs but the same offset, 3,439 move (new offsets proposed), 279 are ambiguous (the number of occurrences of the mention text in the paragraph changed; candidate offsets listed) and 4 have text that no longer appears. All 60 character-level anchors (first mention, role visibility, snapshot availability, evidence offsets) fall in changed paragraphs: 20 keep their offset, 36 move, 4 are ambiguous. The mentions file pins the live modern-en sha256 `5b2d957d…`, which will be stale once the candidate ships. No character file was edited.

## Open issues

1. **Unapplied NITs.** About 565 NIT-level observations (small word-choice drifts, taste) are recorded in the review files and were deliberately not applied.
2. **Accessibility.** The flagged passages (50) are mostly difficulty inherited from Garnett and kept by design: obscure allusions ("castle of Udolpho", "Timours and Ghenghis-Khans"), unexplained back-references, deliberate ambiguity, very long single paragraphs (ch3 p6 is about 900 words) and dense oratory in ch90. The brief says to explain only where the text supports it and never to invent; no gloss was added. The lowest-rated excerpts (3 of 5) are ch3 (the 900-word backstory paragraph), the Inquisitor's legend (ch36), the defense speech (ch90) and the Ilyusha funeral speech (ch95). Candidate-introduced problems found by the read were checked against the source and none was a rendering defect. Sample coverage is about 4% of the text, so it is evidence, not a full read.
3. **Independence.** Renderers, reviewers and verifiers were all separate agent sessions (the reviewer is never the renderer), but they are the same model family. No human read this candidate. Anders or a human editor should spot-read the Inquisitor, Zossima, the Mitya chapters and the trial speeches.
4. **Scripted fixes.** Two helper edits were scripted by reviewers who changed only the flagged words in existing candidate paragraphs (one R1 reviewer for review05 and one R2 verifier). The results were rechecked by independent agents (R2 and R3). No rendering was produced by script.
5. **Russian.** The Russian original was not consulted paragraph by paragraph; names and the Garnett slips listed above were checked from knowledge of the text. No other translation was consulted.
6. **Renderer notes are approximate.** Several notes cite approximate paragraph numbers. The review files and fixes use verified coordinates.
7. **Residual archaic forms by design:** "shall" (105 left from 422) and "whom" (49 from 168) remain mostly in the Inquisitor, Zossima's talks, the trial speeches and scripture, which fit the register. "Pray" (37) is mostly the religious verb.
8. **modern-da** is untouched and no longer tracks modern-en. Danish is out of scope.

## Integration (2026-10-21, release text-2026-10-21.4)

Integrated on branch `claude/modern-en-integrate-karamazov`. Method, checks and every card ruling are in
`books/wip/modern-en-release-20261021/RELEASE-4.md`.
- The package was verified against `origin/main`: candidate and pre-image hashes equal the packet, the structure is 1:1,
  and the card pin equals live.
- The gate passes on the integrated file.
- Coordinate maps and a `CONTENT_RELEASES` entry carry saved places and highlights.
- Narration re-prepares changed paragraphs by text hash; nothing was generated.

Status: integrated, PR open, not yet published.
