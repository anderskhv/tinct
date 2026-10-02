# Wuthering Heights — wh1 and companion-content handoff

## Status and exact commits

- Branch: `content/wuthering-heights-codex`.
- Exact content payload commit: `38fb5dbfc591fd578f682912d12b6f3e7d2307be`.
- Exact wh1 rendering/gate commit: `5aa6eb24525b8a404e2984feac7fc9084f6be453`.
- Validated original committed before rendering: `a070424d1252918c8d9fa2de4d8528bf7c53aac4`.
- Assigned modern scope: Chapters I–XI ONLY, complete. The user assigned XII–XXXIV to two other sessions; this branch does not contain or certify their work.
- **Content accepted: PENDING independent editorial acceptance by Claude.** Author QA and the blocking gate pass for wh1.
- **Whole book: NOT READY.** The complete modern edition and whole-book gate depend on the other parts.
- **Published: NO.** Nothing was integrated, registered, deployed or narrated.

This report is a subsequent report-only commit. The exact payload commit above contains the finished content and validation artifacts; it intentionally does not attempt to contain its own commit hash. The manifest excludes itself and this handoff to avoid circular hashes.

## Integration inputs

- Complete source edition: `editions/wuthering-heights-original-en.json`, 34 chapters, 1,931 paragraphs, 115,815 whitespace-delimited words.
- This session’s authoritative modern file: **`parts/modern-en.wh1.json`**, chapters numbered 1–11, 674 paragraphs, 37,860 words (source range: 40,510 words).
- Paragraph counts for wh1: `[27, 91, 64, 43, 8, 14, 59, 69, 127, 101, 71]`.
- Paragraph counts for the whole original: `[27, 91, 64, 43, 8, 14, 59, 69, 127, 101, 71, 84, 66, 35, 49, 20, 92, 55, 31, 50, 118, 34, 78, 51, 15, 35, 81, 37, 22, 40, 40, 86, 54, 84]`.
- `sections: []` in both. The original is the single pinned alignment reference for every session.
- `onboarding/wuthering-heights.json`: About, one verified Charlotte Brontë acclaim excerpt, exactly three whyItMatters entries with brief final contemporary connections, four angles and twelve cast entries.
- `characters/identity-proposal.json` and `characters/README.md`: nineteen proposed identities, source anchors, conditional aliases and spoiler decisions.
- `taxonomy.md`: existing House/Shelf/form/era identifiers proposed; no canon membership fabricated.
- `SOURCE.md` and raw-folder provenance: source headers, editions, direct URLs, hashes and public-domain evidence.

The earlier partial `editions/wuthering-heights-modern-en.json` was moved out of the edition path. Do not use `review/batch-*` snapshots as integration inputs; they are explicitly labelled audit excerpts. Do not treat wh1 as a full modern edition.

## Gate and verification

Existing tool, unmodified, run once on the completed assigned range:

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/wuthering-heights/review/batch-1-11/wuthering-heights" --gate --chapters 1-11
```

Exit status **0**. Saved in `review/gate-1-11.txt`:

```text
weighted similarity : 0.487   (gate: <= 0.75)
light+mechanical    : 0/11 = 0.0%   (gate: <= 5%)
identical long paras: 1/529 = 0.2%   (gate: <= 5%)
buckets: REAL-HEAVY 9  REAL 2  LIGHT 0  MECHANICAL 0
wrapped scaffolding : 0   (gate: 0)
truncated quotations: 0   (gate: 0)
GATE PASS
```

The absolute filename stem directs the unchanged classifier to staged range excerpts despite its live-directory default. The modern excerpt is byte-identical to wh1. All fourteen JSON artifacts validate with `python3 -m json.tool`. Chapter/title/paragraph alignment passes; every rendered paragraph is at least 75% of its source’s whitespace word count (minimum exactly 0.75). Exclamation counts are preserved or exceeded per paragraph. The one unchanged long paragraph is the quoted song at 9:23.

The original was independently reconstructed from the raw text before rendering. No text from its 34 reading units was dropped: only the title/byline, Gutenberg boilerplate and eleven decorative scene-break blocks were excluded, as documented. Raw and original hashes remain unchanged. Chapters I–VIII, already gate-passing at the pace update, were not re-read or revised; programmatic equality with their committed version confirms preservation.

## Spot-read notes and editorial limits

See `review/wh1-review.md` and earlier batch notes for drafting checks. In IX–XI, attention went to the precise point of Heathcliff’s departure during Catherine’s confession, Nelly’s account of that departure, the heaven dream and Milo allusion, the foliage/rocks distinction, Heathcliff’s unexplained return, Catherine’s warning to Isabella, Joseph’s gambling account and the confrontation followed by Nelly’s withholding of a warning. The narrator’s conjectures and prejudices remain attributed, not presented as independent facts.

Lockwood’s self-importance differs from Nelly’s retrospective justifications. Joseph retains Yorkshire grammar and selected vocabulary with readable spelling. The other sessions should reconcile their dialect treatment with this part during editorial review. The classifier is a similarity/alignment gate, not proof of semantic fidelity; independent editorial acceptance has not been performed.

The source is Gutenberg 768’s dated digital transcription, not a claimed diplomatic edition of a particular 1847 printing. Underscore emphasis is retained. No illustration, kids adaptation, Danish rendering or audio is included. Onboarding’s 8–10 hours estimates reading the full original; it is not a claim that the full modern edition is available.

## Remaining work for Claude

1. Obtain and review the other sessions’ chapter parts without overwriting their work. Check their source hash and paragraph counts against this pinned original. This session has no modern resume point: its assignment ends at Chapter XI; the next range starts at Chapter XII, paragraph 1, under the other sessions’ ownership.
2. Assemble actual chapter numbers 1–34 without renumbering or changing paragraph boundaries. Validate JSON, all chapter/paragraph counts, and run the mandatory whole-book gate on the complete assembled pair. Any missing range leaves the book NOT READY.
3. Accept or revise the editorial companion proposals, respecting the two Catherines, contextual Linton/Earnshaw titles, and spoiler timing. Convert to current runtime schemas only in the separate integration workflow. Verify emphasis rendering and rights/provenance presentation there.
4. Keep editorial acceptance, integration and publication as separate states. This handoff authorises no claim that the book is published.

## Pinned hashes

`review/SHA256SUMS.txt` records all 31 payload artifacts other than itself and this report; all passed `shasum -a 256 -c` before the payload commit.

- `books/raw/wuthering-heights/raw.txt`: `e533fe750589f0421d5d744576315f5c2b9b0d69e981179ea0551bbf134c5e02`
- `books/raw/wuthering-heights/acclaim-pg771.txt`: `b157f8aa21a5ffabef1c88d83517a54b0dbd90e469c3163be87870616c274e6a`
- `books/wip/wuthering-heights/editions/wuthering-heights-original-en.json`: `1466e339c924109d4dd250143f8e7eae66bceef2f384c93d3f708ff01a58a0a2`
- `books/wip/wuthering-heights/parts/modern-en.wh1.json`: `a5937a106af51f0c464090a3d959c862da3c33e95e7f1cf19b6dd1895dad93dd`
- `books/wip/wuthering-heights/onboarding/wuthering-heights.json`: `a6aca106962241e30a330b28c7b28db9c7068da547036dc37bcd127bbf1d8847`
- `books/wip/wuthering-heights/characters/identity-proposal.json`: `2626d5003a3aca54f059c8ae55528878ef032d3c2a80343e96144609157efd16`
- `books/wip/wuthering-heights/review/SHA256SUMS.txt`: `4c85c75f965ebdab2bdc44205c50a49564b404f082926b86b9024e7aa3858fbc`

## Scope audit

Only `books/wip/wuthering-heights/` and `books/raw/wuthering-heights/` changed on this branch. No app, registry, live edition/onboarding, shared tracker, script, test or configuration edits. No merge to main, deployment, publication, narration or Anthropic/API generation. All renderings were composed directly.
