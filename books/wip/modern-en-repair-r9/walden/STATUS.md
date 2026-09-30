# Walden modern-en repair r9 — checkpoint 1

Status: INCOMPLETE. Not accepted for integration or publication.
Branch: `content/modern-en-repair-r9`
Owned path: `books/wip/modern-en-repair-r9/walden/`

Completed whole chapters: 2, 3, 5, 8, 10 (80 aligned paragraphs; 79 differ from the live modern edition). All five chapter gates PASS.
Pending chapters: 1, 4, 6, 7, 9, 11–18. Their staged text is still the unrepaired live modern edition.

Whole-book gate: FAIL. Similarity 0.888; LIGHT + MECHANICAL 13/18 (72.2%); identical long paragraphs 69/484 (14.3%); detected truncated quotations 0; wrapped scaffolding 0.
Original baseline: 0.970; 18/18 (100%); 82/484 (16.9%); truncated quotations 0; scaffolding 0.

## Resume

Chapter-boundary checkpoint for the turn budget. No partially rewritten chapter.
Resume at chapter 1, Economy, paragraph 1 (1-based; index 0). It is 136 paragraphs / 25,548 source words, so reserve sufficient capacity to finish it before stopping. Chapters 2, 3, 5, 8, 10 are already rewritten; do not overwrite them. Then continue 4, 6, 7, 9, 11–18. Commit and push with an updated STATUS after each further 4–5 completed chapters, or at a chapter boundary if the available token budget prevents that batch.

Use the staged original as the baseline. Rewrite by reading and authoring full paragraphs, never with regex/dictionary replacement. Preserve every paragraph, detail, name, quotation and verse line. Every paragraph must remain at least 75% of source words. Run the classifier with the absolute staged prefix; no permission request is needed. The whole-book gate must pass before any acceptance claim.

See HANDOFF.md, changed-paragraphs.json, qa-checkpoint.json, and gate reports. No app/live/registry/script/config edits, deployment, narration, or Anthropic API use.
