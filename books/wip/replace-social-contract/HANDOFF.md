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

## Latest checkpoint: entries 1–14

87 modern paragraphs are complete through Book II Chapter III. Entry 15 paragraph 1 is the exact continuation point. A four-paragraph note in Book III Chapter X (entry 33) had been combined during extraction; its four TEI paragraphs are now restored separately, increasing the source total to 470. This did not affect completed modern coordinates. Proportional structure-map counts were refreshed.

Latest results are in gates/latest-summary.json. The subset passes both classifiers, minimum length, exclamation and modern paragraph endings; the modern candidate has zero N=10 and N=8 overlap flags. Original overlap and full-book alignment remain FAIL. Both full-book classifiers reject the 50-vs-14 chapter mismatch. The source has one colon-ended paragraph at entry 8 paragraph 3. Four source punctuation restorations still require scan confirmation. Full-book opening/ending and transcription review is not claimed complete.

The original-source overlap requirement remains in tension with preserving the 1764 translator's wording. The supplied gate flags genuinely historical phrases. Raw witnesses and the faithful candidate have been preserved, and no historical text has been silently paraphrased to manufacture a PASS. No rights restriction on protected later wording has been waived.

This is a bounded-session checkpoint, not a final content handoff. STATUS begins with the exact continuation point as required.

Candidate SHA-256 at checkpoint:
- editions/social-contract-original-en.json: `97ab56ab2398f7afdf43c62b95311d7ebce26d4781032137eb4d002953af41b3`
- editions/social-contract-modern-en.json: `ff72f928207987a73f5f4277afd04206b0d2f4ff76122bccbb4bbcc231e44b01`

## Batch checkpoint: modern entries 1–15
Added a manual modern rendering for Book II Chapter IV (entry 15), bringing the complete modern subset to 99/470 paragraphs. The per-paragraph minimum length and exclamation requirements pass for this entry. The full classifier correctly remains blocked by chapter-count mismatch. A current coordinate-only N=10 scan of the original candidate flags 85/470 paragraphs; these are phrases in the 1764-based transcription and must be assessed/re-rendered under the explicit assignment rule. No protected text was opened; the overlap tool reported coordinates only. The modern N=10/N=8 scan and folded classifier still need to be run after all chapters exist. Source scan checks and the entry 8 paragraph 3 ending repair remain open.

## Batch checkpoint: modern entries 15–17
Manual modern renderings now extend through Book II Chapter VI, with 116/470 paragraphs complete. Entries 15–17 meet the minimum length, exclamation and terminal punctuation checks. Whole-book classifier and typography-folded classifier still require all 50 chapters. Original N=10 overlap remains 85/470; modern N=10/N=8 scans and full-source verification remain open. No protected text was opened.

## Batch checkpoint: modern entries 18–19
Manual renderings now extend through Book II Chapter VIII, for 131/470 paragraphs. Per-paragraph length and exclamation requirements pass for these entries. The chapter count remains 19 of 50, so the full classifier and folded classifier are incomplete. Original N=10 overlap remains 85/470; modern overlap scans, scan verification and source-ending repair remain outstanding.

## Batch checkpoint: modern entries 20–22
Manual renderings now extend through Book II Chapter XI, for 150/470 paragraphs. Entries 15–22 pass the checked paragraph length, exclamation and ending requirements. The classifier still reports the expected chapter-count mismatch (50 source chapters versus 22 modern chapters). Original N=10 overlap remains 85/470; modern overlap scans and full source checks remain outstanding.

## Batch checkpoint: modern entries 23–24
The manual modern edition now extends through Book III Chapter I, totaling 180/470 paragraphs. Paragraph length, exclamation and ending checks pass for entries 15–24. The classifier remains blocked by the 50-to-24 chapter mismatch. Original N=10 overlap remains 85/470; modern overlap scans, typography-folded full classifier and source checks remain outstanding.

## Batch checkpoint: modern entries 25–26
Manual renderings extend through Book III Chapter III, totaling 200/470 paragraphs. Entries 15–26 pass checked paragraph length, exclamation, and ending requirements. The whole-book classifier remains blocked by 50 source chapters versus 26 modern chapters. Original N=10 overlap remains 85/470; modern overlap scans, folded classifier, and full source checks remain outstanding.

## Batch checkpoint: modern entries 27–28
Manual renderings now extend through Book III Chapter V, totaling 220/470 paragraphs. Entries 15–28 pass checked paragraph length, exclamation and ending requirements. Whole-book classifiers remain blocked by the chapter-count mismatch (50 source, 28 modern). Original N=10 overlap remains 85/470; modern overlap scans and full source checks remain outstanding.

## Batch checkpoint: modern entry 29
Manual rendering now extends through Book III Chapter VI, totaling 232/470 paragraphs. Entries 15–29 pass checked paragraph length, exclamation and ending requirements. Whole-book classifiers remain incomplete at 29 of 50 chapters. Original N=10 overlap remains 85/470; modern overlap scans and full source checks remain outstanding.

## Batch checkpoint: modern entries 30–31
Manual renderings now extend through Book III Chapter VIII, totaling 254/470 paragraphs. Paragraph length, exclamation, and ending checks pass across entries 15–31 after restoring the source exclamation in entry 31 paragraph 10. Full classifier remains incomplete at 31 of 50 chapters. Original N=10 overlap remains 85/470; modern overlap scans and source verification remain outstanding.

## Batch checkpoint: modern entries 32–36
Manual renderings now extend through Book III Chapter XIII, totaling 290/470 paragraphs. Entries 15–36 pass paragraph length, exclamation, and ending checks. Full classifier remains incomplete at 36 of 50 chapters. Original N=10 overlap remains 85/470; modern overlap scans and source verification remain outstanding.

## Batch checkpoint: modern entries 37–40
Manual renderings now extend through Book III Chapter XVII, totaling 321/470 paragraphs. Entries 15–40 pass paragraph length, exclamation, and ending checks. Whole-book classifiers remain incomplete at 40 of 50 chapters. Original N=10 overlap remains 85/470; modern overlap scans and source verification remain outstanding.

## Batch checkpoint: modern entries 41–42
Manual renderings now extend into Book IV, totaling 338/470 paragraphs. Entries 15–42 pass paragraph length, exclamation, and ending checks. Whole-book classifiers remain incomplete at 42 of 50 chapters. Original N=10 overlap remains 85/470; modern overlap scans and source verification remain outstanding.

## Batch checkpoint: modern entries 43–44
Manual renderings now extend through Book IV Chapter III, totaling 358/470 paragraphs. Entries 15–44 pass paragraph length, exclamation, and ending checks. Whole-book classifiers remain incomplete at 44 of 50 chapters. Original N=10 overlap remains 85/470; modern overlap scans and source verification remain outstanding.

## Batch checkpoint: modern entry 45
Manual rendering now extends through the long Roman Comitia chapter, totaling 398/470 paragraphs. Paragraph length, exclamation and ending checks pass across the completed subset after correcting entry 39 paragraph 3. The classifier remains incomplete at 45 of 50 chapters. Original N=10 overlap remains 85/470; modern overlap scans and source verification remain outstanding.

## Batch checkpoint: modern entries 46–48
Manual renderings now extend through Book IV Chapter VII, totaling 427/470 paragraphs. Paragraph length, exclamation and ending checks pass across the completed subset. Whole-book classifiers remain incomplete at 48 of 50 chapters. Original N=10 overlap remains 85/470; modern overlap scans and source verification remain outstanding.
