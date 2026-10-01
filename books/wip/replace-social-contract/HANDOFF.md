# Handoff — not accepted

Branch: content/replace-social-contract-codex, cut from origin/integration/release-candidate-6 after git fetch origin.
Base: 95837141b. Owned path: books/wip/replace-social-contract/ only.
Read root/book AGENTS, book workflow, README, STRATEGY, books/CLAUDE and workflow-boundaries. Applicable policy files match fetched origin/main (git diff returned no changes). Explicit user assignment overrides the general division of writing responsibilities; it also expressly authorizes the supplied overlap tool within this folder.

## Source and work

See SOURCE.md. Raw 1764 BPL OCR, positional OCR XML, metadata, selected scan images and a CC0 keyboarded transcription of the same edition are retained. No alternative translation was used. The source draft is scratch/original-draft.json and is not a finished deliverable. Remaining transcription gaps require scan verification. No complete modern edition exists.

## Accidental exposure disclosure

A broad bibliographic search returned a Wikipedia overview containing a translated quotation of uncertain provenance, plus snippets from the unverified Tozer edition's prefatory matter and a possibly Cole-derived PDF search result. These results were not intentionally opened as reading sources, copied into the editions, or used for rendering. No protected live edition file has been displayed. Subsequent research was restricted to specific catalogue/biographical records and the verified 1764 witnesses. Retain this disclosure through final handoff.

## Preliminary gate

Coordinate-only overlap tool copied unchanged from origin/claude/busy-fermi-111knc as requested. First run against scratch/original-draft.json: N=10, FAIL, 83/467 paragraphs flagged. This detects phrasing already present in the 1764 source; it is not evidence of derivation from a later translation. The user nevertheless requires zero flags, including the original candidate. This remains unresolved and must not be represented as passing. Do not silently alter the historical witness or call a rewritten paragraph an exact transcription; record every editorial alteration if applying the user's requested re-rendering rule.

Other gates have not passed and completion is not claimed. No Anthropic calls, generation scripts, deployment, PR, merge or edits outside the owned content folder.

## Batch 1 checkpoint

Source gap restorations checked against printed pp. 44, 62, 113, 143–145, 150, 162, 179, 194, 197, 200, 204, 209, 229, 231; title page, Advertisement and final p.249 visually inspected. Scan URL n-indices differ from scandata leafNum because excluded leaves are skipped; use printed page numbers. Corrections, including transparent editorial repairs of damaged print, are listed in scratch/transcription-corrections.json. Four uncertain punctuation repairs still need scan confirmation. The original has one colon-ended source paragraph (entry 8 paragraph 3), which still conflicts with the requested terminal-ending gate.

Modern entries 1–11: 71 paragraphs. Manual sentence-by-sentence rendering; no mechanical modernization or provider API. All 71 preserve required length and exclamations. Both classifier variants pass; modern overlap at N=10 and N=8: zero. Exact outputs in gates/. Whole book remains incomplete, and original overlap remains failing. Modern entries 12–50 do not yet exist. No placeholder text was inserted.

structure-map.json is a provisional ordinal/proportional mapping of old chapter/paragraph counts to new coordinates. No old titles or wording were inspected. It is unsuitable for exact highlight migration.
