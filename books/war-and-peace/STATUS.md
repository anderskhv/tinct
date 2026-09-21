# War and Peace — Book Preparation Status

> **Language scope — 2026-09-21:** English is the current delivery strategy. Danish is no longer a launch, publication, translation, audio, QA or marketing requirement; older Danish tasks below are superseded. Keep future localization straightforward without starting another language rollout. See [the approved language strategy](../../STRATEGY.md#language-scope). Existing assets and historical findings are preserved; this note does not change shipped behavior.

**Source:** Project Gutenberg #2600
**Translation:** Aylmer & Louise Maude
**Structure:** 365 chapters across 17 sections (Books 1-15, two Epilogues)
**Words:** 561,695

## Completed
- [x] Downloaded source text (raw.txt)
- [x] Parsed into edition JSON (war-and-peace-original-en.json)
- [x] Chapter structure reviewed (CHAPTERS.md)
- [x] Registered in bookRegistry.ts
- [x] Threads skeleton created (30 characters with searchNames)
- [x] useThreads.ts updated with loader

## Pending — Edition Generation (via CLI, zero API spend)
Historical snapshot: chapter counts below are not a current inventory. Only the agreed English reading package belongs in the delivery scope.

- [ ] modern-en (0/365 chapters)
Former kids/modern-da/kids-da tasks are retired from this queue; they are not publication requirements.

### Generation Strategy
Do one Book (section) at a time. Each section has 13-39 chapters.
Prioritize Book One first — it's the reader's entry point.

## Pending — Thread Chapter Summaries
Each of the 30 characters needs summaries for the agreed English editions, subject to the current content plan.
Only generate summaries for chapters where the character actually appears.

- [ ] Thread summaries (0/30 characters)

## Pending — Visual QA
- [ ] Every chapter, every edition visually verified
