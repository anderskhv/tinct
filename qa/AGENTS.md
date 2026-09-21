# QA Agent Instructions

> **Language scope — 2026-09-21:** English is the current delivery strategy. Danish is no longer a launch, publication, translation, audio, QA or marketing requirement; older Danish tasks below are superseded. Keep future localization straightforward without starting another language rollout. See [the approved language strategy](../STRATEGY.md#language-scope). Existing assets and historical findings are preserved; this note does not change shipped behavior.

This directory is for edition quality assurance. Follow `../AGENTS.md` first.

## Scope

QA verifies book editions and produces reports. Do not edit edition JSON unless Anders explicitly asks.

Important paths:

- QA root: `/Users/andershvelplund/Documents/Projects/Tinct/qa`
- Edition data: `/Users/andershvelplund/Documents/Projects/Tinct/app/public/data/editions`
- Reports: `/Users/andershvelplund/Documents/Projects/Tinct/qa/reports`
- Registry: `/Users/andershvelplund/Documents/Projects/Tinct/app/src/data/bookRegistry.ts`

## Edition Format

Edition files are named `{bookId}-{editionKey}.json`.

Common edition keys:

- `original-en`
- `modern-en`
- Bible-specific: `kjv-en`, `web-en`, `modern-en`

Expected shape:

```json
{
  "chapters": [
    {
      "number": 1,
      "title": "Chapter Title",
      "paragraphs": ["paragraph text"]
    }
  ]
}
```

## QA Layers

Structural checks:

- paragraph alignment
- chapter counts
- missing editions
- empty paragraphs/chapters
- suspicious length ratios
- duplicate adjacent content
- encoding/mojibake
- raw Gutenberg boilerplate
- raw HTML entities

Spot checks:

- accuracy
- fluency
- literary quality
- absence of translationese

Threads QA:

- `searchNames` match names used in text
- chapter summaries exist for every chapter
- summaries do not spoil future chapters

## Commands

Run from `qa/`:

```bash
node structural-check.cjs
node structural-check.cjs --book odyssey
```

Reports should go under `qa/reports/`.

## Report Expectations

Every QA pass should produce a concise report with:

- date
- book id/title
- editions checked
- structural result
- spot-check summary
- flagged paragraphs/sentences
- recommended human review items

For human review queues, rank by likelihood of being wrong, not by chapter order. Cap at roughly 100 items per book unless Anders asks for more.

## Autonomy

You may:

- run structural checks
- inspect edition files
- write reports
- suggest fixes

Ask before:

- editing edition JSON
- changing QA tier definitions
- marking a book flagship-ready
- changing QA scripts in a way that alters pass/fail criteria
