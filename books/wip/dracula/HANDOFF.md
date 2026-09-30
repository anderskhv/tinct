# Dracula content package — NOT READY

## Ownership and pinned instructions

- Repository: anderskhv/tinct
- Branch: `content/dracula-codex`
- Instruction/base revision: `ab3cc43f2687e6682833db6a66182d150788ffa4` (remote main at checkout).
- Read: books/BOOK-TASK-WORKFLOW.md, books/README.md, STRATEGY.md, root AGENTS.md, books/AGENTS.md (including Modern English), books/CLAUDE.md and docs/workflow-boundaries.md.
- User-authorised writes: `books/wip/dracula/**` and `books/raw/dracula/**` only. The user's explicit Codex content assignment governs authorship; the content-only publication boundary remains in force.
- Original source commit: `1737a3f1dcd6426368d59ba4cf087ed8f3694ae5`.
- Latest rendering checkpoint before metadata handoff: `0d7dfa842f7ae552fd84209bca8c2cb923728142` (Chapters 1–5).
- The package revision is the branch commit containing this handoff. Resolve its exact commit from Git; hashes below pin the text independently of this document.

## Completed artifacts

- Original-en: 27 flat chapters, 1,991 paragraphs, 160,116 whitespace-separated words.
- Source: unchanged Gutenberg #345 download, matching Title/Author header, exact SHA-256, edition identification and Denmark/EU/US rights evidence in `books/raw/dracula/SOURCE.md`.
- Source structure: first and last paragraphs, opening prose, counts and old-parser-to-cleaned paragraph mapping for all 27 chapters in `qa/source-structure.json`. All retained paragraphs were matched to their own raw source chapter. The final NOTE and Jonathan's signature remain inside Chapter 27; subsequent advertisements are excluded.
- Modern-en: Chapters 1–5 only, 261 aligned paragraphs; 23,246 words against 26,240 source words for those chapters (88.59%). Every completed paragraph is at least 75% of its corresponding source word count. Chapters 6–27 are absent; no original prose is pasted in as a modern placeholder.
- Onboarding: `onboarding/dracula.json`, About, exactly three whyItMatters, four angleCards, nine cast entries. Acclaim is omitted. Opening text is exactly modern Chapter 1 paragraph 3. Reading time is an estimate based on the complete original's length.
- Characters: identity and card-copy proposal under `characters/`, with no runtime offsets or coverage claim.
- Taxonomy: `taxonomy.md`, proposal only.
- QA: per-paragraph length/alignment audit, changed/unchanged paragraph coordinates, supplemental checkpoint gate transcripts and source/candidate hashes.

## Pinned text hashes (SHA-256)

- Raw Gutenberg download: `96cd16eacdbfebae8fdda5591f66e0cc8ee76be18e0cd1aca02bc00615782d28`
- Complete original-en: `ea90913a946bfb3d0da9305f1471a2e830453f8c8f31d09f28f71f3b950ddbd1`
- Partial modern-en, Chapters 1–5: `48a56542be931e98440a23953f95dab6aaae954a7a0e95ce8fc91ee5f47b1e33`

`qa/artifact-sha256.json` pins the supporting content artifacts as well. These are checkpoint hashes, not a claim of whole-book editorial acceptance.

## Gate and acceptance status

Supplemental checkpoint for Chapters 1–5 PASSES the committed classifier: weighted similarity 0.455, 0/5 light/mechanical chapters, 0/204 identical long paragraphs, no wrapped scaffolding and no flagged truncated quotations. See `qa/gate-checkpoint-05.txt`. Earlier checkpoint snapshots are retained as evidence for the preceding pushes.

Whole-book gate was explicitly run against the absolute canonical staged prefix and FAILS: `chapter count 27 vs 5`. See `qa/gate-whole-book.txt`. This is the expected incomplete-work result, not a classifier defect. The required 8–10 chapter batches have not yet been completed. No full-book gate pass or content acceptance is claimed.

Author-side source comparison was performed during sentence-by-sentence composition. Independent accessibility review and independent correction review remain pending; a similarity score alone does not establish fidelity. Onboarding and character copy are also proposals awaiting editorial acceptance.

## Exact resume point

Stopped at the end of Chapter 5 for the turn's content/token checkpoint. Resume modern-en at **Chapter 6, paragraph 1**, beginning `MINA MURRAY’S JOURNAL`. Read all of Chapter 6 from the pinned original before rendering. Append complete chapters to `editions/dracula-modern-en.json`; preserve its existing first five chapters unless an identified source-based correction is documented.

Remaining: render Chapters 6–27 sentence by sentence; preserve each paragraph, name, quotation, heading, date and documentary voice; maintain at least 75% of the source word count in every paragraph; compare each result with its source and resolve omissions. No mechanical replacement or regex modernization.

Voice guidance: Jonathan observes and records before fear breaks through; Mina is precise, practical and attentive to others; Lucy's letters are intimate, excited and self-correcting; Seward combines clipped clinical notes with personal distress; Quincey's Texan idiom remains readable and distinct. Van Helsing has not yet appeared in the rendered chapters: preserve his characteristic word order, repetitions, affection and urgency while clarifying genuinely difficult sentences. Do not turn him into generic fluent narration or exaggerate his speech into caricature. Preserve other speakers' dialect and the source's period language without silently correcting its history or beliefs.

Required batch plan: Chapters 1–9, 10–18, 19–27, then the entire book. The existing classifier checks global chapter/paragraph alignment before applying --chapters. While the candidate is partial, create clearly labelled gate snapshot pairs in the owned QA folder containing equal completed chapter coverage, then gate the actual requested batch. Never pad modern-en with originals to satisfy structure.

Absolute-prefix examples in this checkout:

- First complete batch snapshot: `python3 books/classify-modern-en.py /tmp/tinct-dracula-codex/books/wip/dracula/qa/batch-01-09/dracula --gate --chapters 1-9`
- Whole book, once all 27 chapters exist: `python3 books/classify-modern-en.py /tmp/tinct-dracula-codex/books/wip/dracula/editions/dracula --gate`

Use the absolute path of the resumed checkout if different. Validate all changed JSON, re-run paragraph counts and per-paragraph length checks, record hashes and review outcomes, and push after each gate. Do not describe a restricted checkpoint as a whole-book pass.

## Integration requirements — future, not authorised here

Do not integrate or publish this partial package. After all text and independent reviews are accepted, the integration task must verify the full hashes, alignment, original-text typography and any required document-voice thread mapping, then handle registry/defaults and runtime data in its own authorised lane. The prefatory authorial statement is preserved separately in `source-frontmatter.txt`; it must not be mistaken for missing journal prose or an extra chapter.

Character integration needs new book-scoped IDs and edition-specific, hash-pinned, normalised UTF-16 mention offsets. Resolve Mina's maiden/married names, Arthur's inherited title versus his father, Quincey Morris versus the Harkers' child, and Count versus ancestor/place references before publishing cards. No existing mentions were altered by this package.

Narration and publication were not attempted. No app files, registry, live editions, scripts, configuration, shared trackers or policy files were modified. No Anthropic API or other generation-provider API was called. No Danish, audio generation, deployment, PR, main merge or publication forms part of this checkpoint.
