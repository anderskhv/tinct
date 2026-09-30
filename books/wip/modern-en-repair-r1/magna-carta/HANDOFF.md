# Magna Carta — READY in staging

Branch: `content/modern-en-repair-r1`. Baseline and instruction revision: `221d6b78d950e36ed2b18fbe6fd800cdd7d44abc`.
Owned path: `books/wip/modern-en-repair-r1/magna-carta/` only.
Source: byte-for-byte copy of `app/public/data/editions/magna-carta-original-en.json` at that revision; candidate started as a copy of the corresponding live modern edition.

## Changes
Chapter 1, paragraphs 1–74 (one-based): complete sentence-by-sentence rendering. Original structure is retained: 1 chapter, 74 paragraphs. No chapter was REAL or REAL-HEAVY before repair. No machine replacement pass or external generation API was used.

## Gates
Before: similarity 0.881; LIGHT/MECHANICAL 1/1 (100%); identical long paragraphs 7/73 (9.6%); scaffolding 0; truncated quotations 0; FAIL.
After: see `gate-after.txt` for the absolute-path whole-book PASS and final numbers. Every paragraph meets 75% of original word count; minimum ratio 0.852. Exclamation-mark counts match in every paragraph.

## SHA-256
- `magna-carta-modern-en.json`: `9fc3a296b172b3d144fb95c673b6627407520b9036b7cd00d9cd894ff65e198c`
- `magna-carta-original-en.json`: `ca7447fb99a427bd9e12b00dcb4a0f5c7452f6da410b4111eb35d47bfacc560f`

## Spot-read notes
The book has only one chapter; three distinct chapter samples are impossible. Read chapter 1 paragraphs 1–3 against the source: every adviser and title survives; the Church’s electoral freedom and Pope Innocent III remain; the grant to free men and their heirs retains its perpetual scope. Also reviewed paragraphs 26–28 and 62–64 as additional samples: county rent exceptions, seizure/executor rules, the grant of security, twenty-five barons, forty-day redress period, and royal-family exemption survive. Reviewed source anomalies and technical vocabulary separately.

## Known issues and integration impact
The source’s bare `100` in paragraph 4 has no currency unit; retained without inventing one. Paragraph 29 says debtors, not creditors; preserved that meaning. Paragraph 51 has awkward family-name grouping and variant Cigogne/Cigogn spellings; names and source grouping retained. The source stops printing clause numbers after (50); no numbers invented. This is modernization of the supplied English baseline, not a correction or new translation from Latin.
`books/characters/magna-carta/` exists: false. No character folder is available here for cross-checking; later integration should assess character-reference impact. No character files edited.
No publication, deployment, registry, runtime, script, test, or configuration changes. Anthropic API spend: zero.
