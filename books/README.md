# Adding books to Tinct

For every book assignment, start with [BOOK-TASK-WORKFLOW.md](BOOK-TASK-WORKFLOW.md). It is selected automatically by the root Claude instructions: content-only staging for Claude, integration and publication for Codex.

**Updated: 2026-09-24.** Current scope: English reading editions and Grok streaming narration.

This is the starting guide for adding a book. Follow [book instructions](AGENTS.md), [Claude's content guide](CLAUDE.md), and the [workflow boundaries](../docs/workflow-boundaries.md). Claude prepares and reviews content; the coding agent integrates and publishes through the existing serialized release process.

## Current scope

- Prepare the original/source edition and an authoritative public-domain human English translation where the work is not originally English, then the reviewed modern-English edition.
- Do not generate Danish translations, Danish narration, or Danish onboarding. Danish is not a publication requirement or an automatically queued next step. Preserve existing assets.
- English narration uses Grok streaming with shared caching under the [current audio architecture](../docs/audiobook-architecture-2026-09-21.md) and [Grok release contract](../docs/grok-narration-2026-09-23.md).
- There is no book-by-book Kokoro, Edge TTS, RunPod or GPU generation step. A complete prerecorded audiobook, legacy manifests and legacy word timings are not prerequisites for adding a book.
- Opening prewarming is a separately scoped optimization. The approved featured-ten preparation does not automatically authorize prewarming every new book.
- SEO and additional languages require their own assignment.

## Edition selection and reader defaults

**Approved by Anders, 2026-09-24.**

- Fetch the original-language text when a suitable, verifiable source is available. Document any availability gap; do not invent an original or silently substitute a translation.
- For works not originally written in English, fetch multiple good human English translations when available and permitted for Tinct's use. Select for fidelity, completeness and readability, not quantity. Record each translator, edition, provenance and rights evidence separately.
- Select and pin one authoritative human English baseline for Tinct Modern E. Other translations may inform review, but do not silently mix their readings; document substantive source variants.
- Default primary reading edition: **Tinct Modern E** (`modern-en`), once reviewed and accepted.
- Default Compare edition: **the most accessible suitable human English translation**, or **the English original** for works originally written in English. Record the editorial choice and its reason. A non-English original remains an optional edition, not the automatic comparison default for an English reader.
- Additional translations remain selectable. Preserve each translation's own text and paragraph structure; verify cross-edition mappings before marking it aligned. Do not force independent human translations into false paragraph equality.
- These are initial defaults, not instructions to overwrite readers' saved edition choices. App changes implementing them belong to the coding agent.

For an English-original work such as Virginia Woolf's *To the Lighthouse*, fetch the original English text; there is no separate English human translation to source. The intended reading pair is accepted Tinct Modern E as primary and Woolf's original as Compare. The original is the fetched source, not the only eventual reading edition. Preserve deliberate literary ambiguity and voice in any modernization.

## Adding a book

1. **Choose and scope the book.** Check current inventory and active assignments; finish near-ready content first unless Anders sets another priority. Agree on the source, editions, natural chapter/scene units and taxonomy. Use an isolated branch and one writer per candidate.
2. **Validate the source.** Record the exact edition, translator, source URL, rights evidence and source hash. Confirm completeness against the source, including openings, endings and speeches. Remove parser apparatus and duplicated captions without losing reading text.
3. **Prepare aligned editions.** Preserve the agreed chapter and paragraph identities. Structural corrections need explicit old-to-new mappings across affected editions and reader dependencies.
4. **Prepare modern English.** Improve comprehension while preserving meaning, detail, voice, ambiguity and argument. Follow the editorial protocol and resolve flagged passages against the source; automated scores alone do not establish quality.
5. **Review the whole candidate.** Compare every paragraph with the source, obtain an independent accessibility read, fix confirmed defects and independently recheck changed passages. Run JSON, structure, alignment and truncation checks. Record unresolved issues instead of declaring them accepted.
6. **Prepare the book package.** Include specific onboarding, metadata, taxonomy and threads where appropriate, plus reviewed character-card material and the impact of changed text on existing mentions.
7. **Hand off accepted content.** Supply the pinned source/baseline, final candidate hash, review and acceptance records, changed-paragraph list and character-card/structure mappings. Commit and push the package so cloud reviewers and the coding agent can access it.
8. **Integrate and publish.** The coding agent verifies the package against current main, registers the actual editions, handles character references and cache compatibility, runs applicable app checks, and releases through the serialized deployment owner.
9. **Verify the reader.** Check book visibility, chapters, edition switching, comparison alignment, onboarding and character links. Verify narration eligibility against the current Grok contract; actual provider generation follows the audio task's authorized scope and budget.

## Narration when text changes

The coding agent must ensure cached speech matches the exact accepted text, language, provider, model, voice and settings. Changed text must not select stale recordings. Unchanged compatible cache entries remain reusable. Playback uses the current Play-triggered streaming path; publication does not queue a full audiobook rebuild or change voices.

Keep existing audio for rollback until separately authorized cleanup. Do not revive a historical audio backlog.

## Readiness and status

Report text acceptance, integration/publication and runtime narration support separately. “Text accepted” does not mean “live”; “streaming supported” does not mean “the entire audiobook is already cached.” No Danish coverage or legacy recording count should block an otherwise complete English package.

Use the current registry and inventory rather than historical completion tables:

```bash
python3 books/wip_inventory.py
```

Use audio inventory only when investigating stored audio coverage; interpret legacy missing-file results under the current streaming contract.

## Tools and sources

- `parse-gutenberg.py`: source parsing; inspect the resulting reading units.
- `raw/{book-id}/`: source files and provenance.
- `wip/` or the assigned staging folder: isolated candidates, reviews and release packets.
