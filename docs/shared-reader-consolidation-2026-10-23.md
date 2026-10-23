# Shared reader consolidation and launch — 23 October 2026

## Release intent

A reader should experience one coherent update: a better menu, useful passage AI tools, and a desktop Margin layout. The shared implementation underneath should be invisible.

Anders approved beginning this work on 23 October. Codex coordinates scope, integration, verification and release; Sol performs coding. This plan supersedes the earlier sequence of launching the iframe reader first and consolidating later. It supplements, and for this release supersedes conflicting scope in, the historical [19 October port plan](margin-port-plan-2026-10-19.md). It is an implementation plan, not evidence that the changes have shipped.

## Agreed product scope

- Margin supports all book types on desktop, including the Bible, plays, poetry, illustrated books, Gutenberg imports, private EPUB/PDF/text and pasted text. Preserve verse numbers, speakers, stage directions, lineation, images, footnotes and source structure.
- Classic/two-page and Compare remain available where applicable. Book capabilities still determine edition/Compare choices; private uploads must not advertise editions they do not have.
- Phone retains its familiar reading foundation and gains the common menu, selection bar, bottom cards and chapter actions. This is not a new phone reading paradigm.
- Shared features: Reading now, Contents, Aa, Book settings, Audio settings, Notebook, selection actions, AI cards, highlights/notes, narration and Talk.
- Chapter actions: Primer and Catch me up by the heading; Recap, Quiz me and Note after the unit. A short pasted item can be one reading unit.
- Desktop Ask morphs the selection bar into the existing 440 px field with Esc. Preserve the phone interaction.
- Narration and Talk use Tinct's Grok services and existing allowance/voice preferences. Narration retains word highlighting. Never add browser speech synthesis as fallback; retain the established failure and entitlement behavior.
- PDF Original pages stays available within the shared reader shell, alongside Tinct text where usable. Scans without recognized text cannot be treated as extracted prose.
- Preserve existing positions, highlights, notes, cards and conversations through the update and rollback.

### Theme-aware selection bar

The 23 October clarification is theme-aware styling, not a separate colour for every action:

- Light: charcoal surface, soft white text.
- Book/paper: warm dark-brown surface, parchment text.
- Dark: slightly lighter charcoal surface, subtle border, warm white text.
- Quiet icons/dividers and restrained theme-matched selection tints; colour mainly for highlight choice and active state.
- Exact tokens require faithful previews of the actual Tinct controls across all three themes before implementation. Maintain contrast and existing e-ink behavior.

### Paste text

Build on the existing [Paste any text backlog concept](../BACKLOG.md):

1. + Add -> Paste text.
2. Accept plain text, clipboard HTML and Markdown; preserve supported headings, lists, emphasis, quotes and links.
3. Provide a preview and beginning/end trimming; apply conservative, rule-based cleanup of page furniture. Preserve wording and meaningful whitespace/structure. No automatic AI rewrite.
4. Suggest title/author only when supported by the pasted material, and allow editing.
5. Keep it as a private own reading item and open the same reader with the same applicable features.
6. Use the existing private ownership, sign-out, export and deletion contracts. Assess the privacy notice against actual data flow in the same change. Do not invent a new store or schema without review.
7. Treat pasted markup as untrusted input: sanitize to an allowlist, reject active content/unsafe URLs, and do not automatically fetch remote resources as a side effect of paste.

The backlog's proposed monospace exception for preformatted text is not an approved design change in this release. Preserve structure; present any necessary exception explicitly in the paste preview.

## Verified baseline

Source inspection pinned to main d8b667e659009b590bb5e5c9218081c935f74927 (22 October). No app changes or fresh runtime tests have been performed for this audit.

- Main still opts eligible catalogue books into Margin through a browser-local preference set by margin=1. The default-launch PR #571 is open and unmerged.
- [Deploy 39840335002](https://github.com/anderskhv/tinct/actions/runs/39840335002) succeeded for this commit; its acceptance groups succeeded and rollback was skipped. This records existing CI evidence, not a new production verification.
- [Verify 39917900880](https://github.com/anderskhv/tinct/actions/runs/39917900880) succeeded on the same commit.
- Existing auxiliary failures must be reproduced/classified before the relevant release gate is declared green:
  - [Cross-chapter highlighting](https://github.com/anderskhv/tinct/actions/runs/39842634902): timed out finding the exact Highlight button.
  - [Voice acceptance](https://github.com/anderskhv/tinct/actions/runs/39842634864): timed out before a requested/acknowledged provider voice was recorded.
  - [Audio-highlight audit](https://github.com/anderskhv/tinct/actions/runs/39903143670): a manifest request returned 503 after retries; a missing output ledger then caused a secondary error.
- These logs do not establish whether each issue is a UI regression, stale test assumption, environment problem or provider failure. Do not weaken tests or call them harmless without diagnosis.

## Architecture findings

### Reuse the React reader

app/src/main.tsx chooses the Margin frame or LabApp before mounting. MarginPreview.tsx publishes window.TinctMarginPreview and mounts separate static readers for catalogue and own-book paths.

LabApp and LabPassage already understand poetry, Bible verse alignment, speakers, figures and footnotes. Their structural word/paragraph coordinates should drive the new continuous layout. Simply removing readsInClassicReader restrictions would feed unsupported structures into the current EPUB-style Margin renderer.

### Preserve existing shared work

- MarginPreviewSync already mounts shared position, mark and card adapters.
- useMarginPreviewMarks uses the existing highlight writers and tombstones.
- useMarginPreviewCards maps persisted cards into book-scoped chat history and imports older preview-local records. The old plan's proposed margin-cards schema is stale.
- LabApp already has the phone selection bar, bottom cards, unit actions and Chat/Talk surfaces.
- useMarginListen and existing React narration/Talk provide reusable behavior.
- userBookSource already converts private editions to LabSource.

### Resolve remaining duplication deliberately

- Static reader.js and LabApp still have separate interaction/layout state.
- Position adapters and audio have more than one write path. Audit and consolidate ownership without changing the persisted tuple or private-book storage rules.
- Phone explanation/card persistence differs from desktop Margin cards, which explains why identical-looking answers may not appear identically in Notebook.
- UserBookReader routes several own-book views into the static reader; PDF original pages need an integrated renderer and source-to-text anchor mapping.
- Current first-window loading is useful, but does not prove bounded DOM rendering for a Bible-sized work.
- Private books have their own ownership and sync contracts. Shared UI/controller logic must retain these distinctions instead of writing private uploads into catalogue-book stores.

## Implementation sequence

Every slice stays on the integration branch or bounded child branches until the coordinated cutover. Do not merge partial UI to main just to use the existing deploy flow.

| Slice | Deliverable | Primary files/ownership | Exit evidence |
|---|---|---|---|
| 0. Contracts and baseline | Confirm source identities, position/card storage, old-key imports, capability model and current failures; faithful paste/theme previews | Current audit, focused reader/storage files, existing checks | Written contracts, baseline results, reviewed visual direction |
| 1. Private entry | Dedicated private switch into the shared reader; unchanged public behavior when off | main.tsx, new flag/layout module, narrow LabApp mount seam | Explicit/deep links, handoff, reload, own-book and flag-off tests |
| 2. Structural continuous layout | React Margin surface reusing word/verse/play/figure primitives with bounded chapter rendering | New Margin components, narrow LabPassage exports; preserve existing paginator | Prose/Bible/play/poetry/figure fixtures; stable word anchors and bounded DOM |
| 3. Shared interactions | One selection/action/card controller and consistent Notebook persistence | New shared card/controller modules; reuse existing ask/chat/highlight mappings | Card lifecycle, interrupted requests, follow-ups, delete/undo/tombstones, book/account isolation |
| 4. Session and audio | One active position owner and common narration/Talk controls, including saved speed and desktop panel | Narrow LabApp/session integration, existing audio hooks | Font/layout/edition/chapter changes, audio/scroll races, muted provider-independent tests |
| 5. Own books and paste | Private source adapters, PDF original/text views and paste ingestion in the same shell | userBook loaders/renderers, paste adapter/UI, existing private storage routes | Reload/account restore, source fidelity, original/text mapping, sanitized pasted input, export/delete coverage |
| 6. Complete acceptance | Full source/layout/theme matrix plus upgrades, performance and regression repair | Tests/checks and acceptance record | Required suite/build/bundle/browser checks and Anders's coherent preview |
| 7. One public cutover | Default Margin for all supported source structures, migration compatibility and rollback | Routing/default choice and release documentation | Exact built bundle confirmed on production, acceptance green, no rollback |

One integration owner controls shared files. Sol receives bounded assignments and reports evidence; parallel work, when useful, must have non-overlapping ownership. Do not rewrite the whole LabApp or pagination system to make the port convenient.

The new private switch must not reuse today's margin=1 opt-in: readers already use that on production.

## Acceptance contract

### Representative sources

- Tinct prose book: Frankenstein.
- Illustrated Tinct book: Lords of the Cosmos.
- Shakespeare play, verse-sidecar/poetry and Bible, including cross-chapter/book navigation.
- A Gutenberg-added book.
- Realistic own EPUB with split numbered headings, epigraph and figures.
- Own PDF as original pages and Tinct text; also scanned/unsupported-text behavior.
- Pasted plain prose, HTML and Markdown, including lists, quotes, links, emphasis, Unicode, short single-section text and long multi-section text.

### Surfaces and journeys

- Desktop 1440x900 and 1280x800; phone 390x844, plus 360x740 where the earlier port matrix requires it.
- Margin, Classic/two-page, Compare where meaningful; light/book/dark and e-ink regression checks.
- Fresh browser storage; upgraded existing local records; synthetic signed-in account; sign-out/account switch; two-device sync/conflicts.
- Open/read/select/ask/follow up/highlight/note/quiz/find in Notebook; delete/undo where supported.
- Reload and resume the exact paragraph/word; change font, viewport, layout, edition and chapter; preserve place.
- Narration and Talk, saved preferences, failure/entitlement handling and no browser voice.
- PDF original/text switching and reading-unit navigation.
- Explicit links, library Continue, Reading now, Contents, offline/retry and missing source-file behavior.

### Data safety and rollback

- Establish canonical anchor identity before switching renderers.
- Preserve existing IDs and version/tombstone behavior. Import old records idempotently; no deletion as a migration shortcut.
- Ensure a production rollback can still read records written by the new reader. Retain compatibility code until this has been demonstrated.
- Store no reader data or credentials in the repo or test artifacts.
- Use only own/synthetic test accounts, mark internal traffic, and follow current export/deletion coverage.

### Performance and quality gates

- First readable text <=1.5 seconds warm desktop and <=3 seconds on the agreed slow profile.
- Selection-bar presentation <=100 ms; card shell presentation <=150 ms. Measure AI response latency separately; a painted placeholder is not a completed answer.
- Declare device/network/cache conditions and distinguish cold PDF processing from warm open. Measure and resolve slow paths rather than silently exempting PDF.
- Run existing position, highlighting, chat, own-book and phone-margin tests plus meaningful new regressions for the changed behavior.
- Build and verify-bundle from app/, then isolated muted browser checks in Chromium and WebKit as applicable.
- Fake/mocked AI validates UI contracts only. Bounded real-provider narration/Talk acceptance needs its explicit scope/budget and an isolated muted test; do not claim mocked sockets prove Grok works.
- Faithful screenshots and a coherent preview precede cutover. Anders reviews the experience; the agent owns technical production verification.

## Existing work and release ownership

- #571: retain as reference for default-switch behavior; do not merge the old iframe launch to satisfy this new plan.
- #598: inspect and reuse relevant Grok work; deliver the correct desktop panel in the shared implementation. Its current GitHub base is already main, despite the older handoff.
- #581: inspect/reuse latency measurement; verify its metric definitions.
- #602: inspect/reuse the check readiness fix if still necessary.
- #600: handoff says included in #597; confirm equivalence before closing it.
- #521: assess whether chat continuation is necessary for the agreed interactions; avoid unrelated scope.
- #587 (profile/Premium/billing/migrations), #569 (book release), Danish and unrelated content releases stay outside this coordinated reader update.
- Keep one serialized production release owner. Existing Claude jobs and external schedules need an ownership confirmation before shared integration/release activity.
- Local Codex reader/content release heartbeats inspected on 23 October were paused. That does not establish the state of Claude's cloud triggers.
- Current repository instruction requires cloud development. GitHub read/write access is available, but an executable cloud workspace is not connected to this chat; the documented local fallback path is absent. Resolve the workspace before implementation/tests. Preserve historical checkouts and unrelated work.

## Planning status

Initial source/CI inspection and this plan are complete. Implementation, runtime reproduction, visual previews and new acceptance remain to be done.

The earlier 3–5-day estimate preceded the all-book and paste-text scope and is not a commitment. Re-estimate after the runnable baseline, structural prototype and private-file storage contracts are established. Use milestone evidence, not the stale one-night or 3–4-week figures in previous handoffs.
