# Shared reader release progress, 23 October 2026

This is the live execution record for the [agreed release plan](shared-reader-consolidation-2026-10-23.md). A checkpoint is not completion. The coordinating agent owns integration, regression repair, and release readiness. Anders must explicitly approve merge and deployment. Paid provider checks require a separate agreed scope and budget.

## Verified starting state for continued implementation

- PR #603 remains draft, targeting main, at `dd83b07725d7a260927df28c2e11e09ab7004e68`.
- PR #604 remains draft, targeting #603's branch, initially at `5f9a46ffb0027e6427d616d920a4163f9cd6c3ea`.
- GitHub Actions run `39926979982` failed only the three `termsPage.test.ts` assertions that still named PDF-only storage after the notice was made accurate for EPUB. The other completed verify jobs passed, including reader panels, library, page layout, and four Margin layout shards. This does not establish acceptance of subsequent changes.
- The privacy regression repair is independently reviewed and saved in #604 as `9925229305eae070a636aa420e666b26123aa8b4`. It retains checks for source/PDF locations, availability-qualified EPUB support, private R2/browser storage, and deletion. The focused terms suites pass 23 tests. The broader initial focused run passes 135 tests across 11 files.
- The active remote checkout was reconciled with #604 without discarding worktree files. The remote runtime, GitHub writes, and delegated execution are available. Named Work Cloud attachment and unattended continuation remain unverified.

## Ownership

The user selected Astra High for orchestration. Six bounded subagents were explicitly started with the available `gpt-6-sol`, `high` model controls. This records the requested configuration, not independent attestation of backend routing.

| Work | Exclusive implementation ownership | Independent review |
| --- | --- | --- |
| Continuous reader and location ownership | Reader agent: LabApp and continuous renderer/controller modules | Review agent, integration checks |
| Paste text | Paste agent: library Add flow, new paste converter/UI and tests | Review agent, private-source integration |
| Regression repair and private storage races | Test agent: privacy assertions, userBooks Worker and tests | Review agent |
| Shared selection menu and themes | Menu agent: SelectionPopup/SelectionDeskBar/LabPhoneBar and scoped styles/tests | Review agent |
| Private source entry and adapters | Private-source agent: main/UserBookReader and own-book modules/tests | Review agent |
| Integration, commits, acceptance and durable record | Coordinator | Cross-author review and combined gates |

No agent may merge, deploy, call a paid provider, or independently mutate the integration branch. Shared build output is owned by the coordinator. Authors repair findings; an author does not approve their own change.

## Active implementation

Anders reviewed the initial Paste preview and requested a simpler default:
paste once, let Tinct infer format/metadata, and allow changes later. The paste
agent is replacing the required multi-step setup with a single entry and
optional corrections. The earlier screenshot is superseded for that flow.

- Continuous desktop reading is being connected to the existing `placeRef`/`notePlace` owner with source/edition/chapter/navigation identity guards. Inactive paginators and delayed layout writers must not persist a competing place. Classic/Compare and familiar phone reading remain available.
- Paste text is being implemented in the real library Add flow, gated by the private URL flag, using an EPUB package and the existing private upload/storage lifecycle. HTML is untrusted; saving must preserve source wording and must not fetch remote resources.
- Private entry is being carried to the library and own-book routes. Existing public routing remains the default while this work is developed.
- Selection controls are receiving the agreed provisional Light/Book/Dark palette and shared actions. The saved faithful previews are in [the preview record](shared-reader-previews-2026-10-23.md); actual implementation must receive fresh visual checks.
- Private marks/cards need file-generation isolation. A stale PUT can otherwise recreate a deleted set; a cleanup by content hash can also erase a new upload of the same file. The implementation direction is generation keys within the existing private R2 prefix, legacy reads for pre-existing files, unchanged client route payloads, and explicit export/deletion coverage. No SQL migration, new provider or new data category is proposed.

## Release gates still open

| Gate | Required evidence |
| --- | --- |
| Source and layout coverage | Prose, Bible/sub-books, plays, poetry, figures, Gutenberg, own EPUB, PDF text/pages/scans, pasted input; desktop and phone |
| Places and saved data | Exact nonzero-word resume; layout/font/viewport/edition/chapter transitions; one writer; local upgrades; account boundaries; revision conflicts/tombstones |
| Shared interactions | Selection, AI actions and follow-ups, chapter actions, notes/highlights, Notebook, undo/deletion, narration highlighting and Talk contracts |
| Paste import | Actual save/reopen, supported formatting and Unicode, conservative trim, metadata, hostile markup/URLs, no remote fetch |
| Deletion and export | In-flight PUT/delete and same-content re-upload barriers; retained legacy and generation records; account export/deletion compatibility |
| Rollback | A tested backend-compatible rollback floor is required before new text records are written publicly. The exact old Worker cannot export these records correctly. Prepare and test an old-UI/compatible-backend candidate; do not deploy it without approval. |
| Performance | Bounded DOM and loading, measured warm/slow first text and interaction timings under declared conditions |
| Combined verification | Full tests, clean build, verify-bundle, muted isolated Chromium/WebKit checks, independent review and repaired regressions |
| Provider acceptance | No paid check yet. Mocked or blocked providers prove UI contracts only. Request a concrete bounded scope/budget only when provider acceptance is ready and necessary. |
| Public release | Coherent preview and explicit release approval, then serialized deployment and exact-bundle production acceptance |

The original production experience is preserved until the complete release is ready. Remaining gates must be resolved, not relabelled as completed by a passing isolated component test.
