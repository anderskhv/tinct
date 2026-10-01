# social-contract — r12 content handoff

Status: repair complete; whole-book similarity gate PASS. Staged only; not integrated or published.

## Ownership and baseline

Repository: anderskhv/tinct. Target branch: content/modern-en-repair-r12.
Instruction and source revision: c268646674fed34ef73cf8ecf32d7c54ebabce40 (remote main).
Owned path: books/wip/modern-en-repair-r12/social-contract/ only.
Original and prior modern files copied byte-for-byte from app/public/data/editions/ at that revision; local live files matched remote main. No new source or translation was substituted. The live JSON does not identify its translator in metadata.

## Changes

Coordinates are 1-based chapter array position and 1-based paragraph position.
ch25 p1–9; ch28 p1–6; ch29 p1–18; ch30 p1–5; ch31 p1–16; ch33 p1–5; ch34 p1–8; ch35 p1–4; ch36 p1–14; ch38 p1–7; ch39 p1–10; ch41 p1–13; ch42 p1–10; ch43 p1–39; ch44 p1–8; ch45 p1–13; ch46 p1–10; ch47 p1–42; ch48 p1–1.

238 paragraphs in all 19 baseline LIGHT chapters rewritten sentence by sentence. All 29 baseline REAL chapters remain unchanged. No additional unchanged paragraph exceeded 40 words outside the rewritten chapters. Full coordinates: changed-paragraphs.json.

## Gates and checks

| Measure | Before | After |
|---|---:|---:|
| Weighted similarity | 0.843 | 0.645 |
| LIGHT + MECHANICAL | 19/48 (39.6%) | 0/48 (0.0%) |
| Identical long paragraphs | 5/483 (1.0%) | 0/483 (0.0%) |
| Wrapped scaffolding | 0 | 0 |
| Truncated quotations | 0 | 0 |
| Whole-book gate | FAIL | PASS |

48 chapters and 491 paragraphs retained. Every paragraph is at least 75% of source word count; minimum 0.750. Exclamation counts match the original in every paragraph. Source straight apostrophes and quotation marks used in new prose; retained original spelling conventions, named references, technical terms, quoted passages and existing bracketed notes. No newly bracketed footnotes or editorial notes. Paragraph endings checked; no new mid-sentence endings. Full gate outputs: gate-before.txt and gate-after.txt. QA.json records structural results.

Gate command: `python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r12/social-contract/social-contract --gate`.

Candidate SHA-256: `822e078519fc70f5450d4c070bfea0138087802595de07470ef89b6eadce2e24`. SHA256SUMS gives all JSON hashes, including the untouched original and prior modern baseline.

## Three spot-reads

1. ch1 p1–3 (unchanged): justice and utility remain joined; the non-prince/non-legislator argument and citizen's duty to study public affairs remain intact.
2. ch24 p1–3 (unchanged middle): distinctions among democracy and aristocracy follow the number of magistrates, not an imported modern definition; paragraph mapping retained.
3. ch48 p1 (entire final chapter): all external-relations subjects remain, including law of nations, commerce, war and conquest, public right, leagues, negotiations and treaties; the closing admission of excessive scope remains.

Additional review of changed passages: ch29 p13 retains the entire Chardin quotation; ch43 preserves the tribe/curia/century distinctions and voting procedure; ch47 preserves the argument on civil religion, all three exclamations in p3, and the toleration/exclusion distinction.

## Known issues and integration boundary

The supplied original contains pre-existing clipped openings in several footnotes (for example ch31 p16, ch47 p37–41). Their surviving content and quotations are retained; missing source material has not been invented or silently sourced elsewhere. These source defects require separate source-level review before any completeness claim. The supplied original also contains historical numerical tensions (ch43 tribe totals), retained rather than editorially corrected. This repair does not change chapter structure.

books/characters/social-contract/ does not exist in this checkout. No character material changed. Changed coordinates must be used by the integration owner when checking character mentions and exact-text narration cache compatibility. No narration generated. No app, registry, live edition, script or configuration edits; no deploy; zero Anthropic API calls.
