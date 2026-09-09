# Optional prefaces — approved coding handoff

Date: 2026-09-09. Status: approved for implementation; not yet shipped.
Source task: 01a0820f-f0aa-7ce2-ab2b-6b015decbf6b.
Anders: “Okay, I like this. So let's implement it. It should be handed over to the coding agent”.

## Approved experience

- Mobile cover: short opening excerpt below cover, “Read preface”, then prominent Begin reading / Continue reading. Desktop: excerpt and actions beside cover.
- Read preface opens a dedicated quiet text view, not Chat. Heading “Before you begin”, book title, attribution “A preface by Tinct”. Comfortable reader serif, existing theme/font accessibility, centred desktop column. Back to cover at top; Begin/Continue reading at end. Existing product chrome and actual cover art supersede schematic mocks.
- Completely optional. No automatic opening, no required cast briefing, no AI requests, credits or generation on click. Persist reviewed static content keyed by canonical book ID, independent of edition. Hide feature if no approved preface; no placeholder or invented fallback. Scope these English prefaces accurately in multilingual UI.
- Preface is outside source pagination, completion, audio, highlights and reading-log progress. Opening, scrolling, closing, and beginning/continuing preserve the coherent ReaderSession tuple. Continue returns to the saved position, not chapter one. Trace real position/data flow before editing.
- Do not add the obsolete five-tab navigation.

## Exact approved content — retrieve before shipping

Four approved prefaces: The Odyssey, The Awakening, Niels Lyhne, War and Peace.
The exact approved bodies are now saved in [approved-prefaces/](approved-prefaces/README.md). Use these files directly; read_thread retrieval failed for the implementation owner. Do not regenerate or paraphrase:
- Odyssey: block 83146 revision opening “The Odyssey is about a man trying to get home after a war”, replacing its second paragraph with block 48271 (“The Cyclops, the Sirens…”). Exact combined text is also in the mock's article.
- Awakening: block 59382 FINAL revision beginning “The Awakening is about the difficulty of wanting a different life”. Earlier scene-summary draft is explicitly rejected.
- Niels Lyhne: block 72815.
- War and Peace: block 91643.
Save those texts as reviewable content files; confirm canonical IDs against current registry (no title-based guessing). Preview uses their opening sentence(s), not fresh marketing copy. Source task may be active; completed earlier turns contain the four approvals.
UPDATE 2026-09-09: Anders approved the final Symposium and Bible revisions. Exact files: approved-prefaces/symposium.md and approved-prefaces/the-bible.md. Include these alongside the first four (six total). This supersedes the original four-only content scope. Whole-library generation has not yet been assigned.

## Wires

Mobile alternatives (approved choice C, short preview):
/Users/andershvelplund/.codex/visualizations/2026/09/08/01a0820f-f0aa-7ce2-ab2b-6b015decbf6b/preface-wires.html
Desktop:
/Users/andershvelplund/.codex/visualizations/2026/09/08/01a0820f-f0aa-7ce2-ab2b-6b015decbf6b/preface-desktop.html
These fragments illustrate interaction, not production CSS/components. The desktop Characters menu/gallery is a concept being developed in task 01a085fc-0cdf-7f62-929a-a92d790b7b9e (“Explore clickable characters”). Keep prefaces independent of that lane. Preferred character entry: permanent Tinct menu plus All characters from a name popup; position-scoped descriptions. Do not ship placeholder character examples or duplicate that other task's implementation.

## Verification and delivery

Use current shipped reader and latest repo instructions, not old branch snapshots. Preserve other tasks' changes; use reconciled shipping checkout. Test all four book mappings and unsupported-book absence, fresh vs resumed book, switches, browser Back/close/reload, Compare and audio-position preservation. Phone including small screen/large fonts; desktop and both themes. No progress writes or LLM calls from preface viewing. Verify keyboard/focus behavior and readable long text.
Follow AGENTS.md test/build/verify-bundle/deploy requirements and production verification. Report actual bundle, deployment evidence, production screenshots and limitations. Update this brief's status and overview only after evidence. User requested handoff; implementation owner is “Move coding to Codex”.
