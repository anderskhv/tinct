# QA Agent Instructions

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
- `modern-da`
- Bible-specific: `kjv-en`, `web-en`, `modern-en`, `modern-da`

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

Danish-specific watchlist:

- false cognates such as `eventuelt`, `aktuel`, `realisere`
- English word order
- dropped verb prefixes
- unnatural articles where Danish suffixes are expected
- polysemy mistakes such as court/justice, judgment/cathedral, sacrifice/victim

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
