# War and Peace — Book Preparation Status

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
Each chapter must be read and translated. 365 chapters x 4 editions = 1,460 translations.

- [ ] modern-en (0/365 chapters)
- [ ] kids-en (0/365 chapters)
- [ ] modern-da (0/365 chapters)
- [ ] kids-da (0/365 chapters)

### Generation Strategy
Do one Book (section) at a time. Each section has 13-39 chapters.
Prioritize Book One first — it's the reader's entry point.

## Pending — Thread Chapter Summaries
Each of the 30 characters needs per-chapter summaries in 4 editions.
Only generate summaries for chapters where the character actually appears.

- [ ] Thread summaries (0/30 characters)

## Pending — Visual QA
- [ ] Every chapter, every edition visually verified
