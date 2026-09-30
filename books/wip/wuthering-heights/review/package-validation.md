# Package validation

- All 14 JSON artifacts validate with `python3 -m json.tool`.
- Raw source hash and complete original-en hash match the original committed checkpoint; no reparsing or original edits.
- wh1 remains byte-identical to the version that passed the 1–11 gate, SHA-256 `a5937a106af51f0c464090a3d959c862da3c33e95e7f1cf19b6dd1895dad93dd`.
- Explicit gate excerpt’s modern file equals the authoritative part byte for byte.
- Complete original: 34 chapters, 1,931 paragraphs. wh1: 11 chapters, 674 paragraphs. No chapter 12–34 rendering supplied here.
- Onboarding: one primary-source-verified acclaim excerpt; exactly three title/body whyItMatters entries, each ending in one brief contemporary connection; four reading angles; twelve cast entries. Opening text equals wh1’s first paragraph. Reading-time estimate is based on the full original, not a claim of a completed modern edition.
- Character proposal: 19 unique IDs; all named-evidence coordinates resolve and contain the recorded source anchor. Ambiguous titles and repeated names explicitly require contextual handling. Later original references support identity facts only; they were not edited or rendered.
- House, shelf, era and form identifiers checked read-only against the base taxonomy. No list membership invented, and no registry altered.
- Source and acclaim downloads retained with headers, hashes and direct rights-evidence URLs. Acclaim sentence matches its primary text after collapsing line-wrap whitespace.
- Scope: only the book’s raw and WIP content folders are changed on this branch. No app, tool, test, config, tracker or publication edits.

Independent editorial acceptance and whole-book assembly/gating remain for Claude. Nothing is published. Historical review excerpts are audit evidence, not additional editions or integration inputs.
