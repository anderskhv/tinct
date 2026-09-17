# Reader feedback — September 17, 2026

Status: approved, implementation in progress. Source: desktop and mobile feedback
and the approved combined plan in this task. Work uses the existing Developer
checkout; builds/deployment retain GitHub Actions. Archived Documents is read-only.

## Approved queue

1. Chat scrollbar clearance; no audio-word underline; paused word remains marked.
2. Explain expands to one desktop leaf, icon-only glass expand on both platforms;
   normal voice surface with passage/explanation context preserved.
3. Verse-number highlight geometry; reproduce missing-menu/ghost selection at
   “He who receives”; deliberate cross-page selection without accidental paging.
4. Clean chat entry with history above; record displayed explanations once and
   preserve them for Chat/Talk and summaries; exact-context explanation cache.
5. Requested history retrieval across reading sessions, chats and highlights;
   absence from recent context must never imply never-read. Check Matthew header
   versus answer context. Cross-book retrieval only on relevant user request.
6. Cross-edition passage highlights using alignment, never shared word offsets.
7. Measure actual explanation request timing and approximate provider cost.

## Initial findings

- Explain starts speculatively after the selection popup exists (180ms debounce),
  not on initial pointer-down. Its current cache is one in-memory entry, 60 seconds.
- Explanations currently enter history only through Chat/Talk actions.
- Desktop explicitly underlines the current audio word; App removes follow paint
  when playing becomes false.
- History prompt uses a short reading trail; requested full-history retrieval
  needs a separate evidence path.

## Verification

Pending focused regressions, full tests, build/bundle gates, serialized deployment,
and isolated muted desktop/mobile production acceptance. No Anthropic development
calls. Preserve reading-position invariants and all existing user changes.

Local pre-existing AGENTS changes, an untracked auth regression, and two earlier
reports were preserved in named Git stashes before fast-forwarding the existing
checkout. A second stash preserves the earlier compact-preface acceptance JSON.
These are recovery copies, not discarded changes; reconcile/restore at completion.

## Implementation and acceptance (September 17)

- Fixed scrollbar clearance, removed audio-word underline, retained paused word
  paint, and constrained expanded Explain to the opposite desktop leaf.
- Floating glass expand/collapse icon uses no header row. Compact loading and
  ready height both measured 218.8px in Chromium desktop and WebKit phone.
- Chat opens on fresh space with its full history above. Displayed explanations
  persist through the existing book-scoped, versioned chat writer. Chat/Talk both
  receive the actual explanation; voice shows only the current call's turns.
- Exact-context private explanation cache: seven days, 32 entries, 200KB limit;
  book/chapter/edition/text/model/reading-angle/account boundaries are included.
  Overlapping selections remain independent. No database/schema change.
- Requested history checks durable memory across editions, legacy reading logs,
  chats and highlights. Voice no longer automatically includes other books'
  chats. Legacy inferred progress and missing records are explicitly qualified.
  This searches data currently available/synced on the device, not absent cloud
  records. At most 24 older highlight texts are loaded per request.
- Selection can cross pages by holding at the top/bottom edge for 700ms. Gesture
  turning remains distinct from selection continuation; no edition swap occurs.
  It stops at chapter boundaries and is enabled in Read, not Compare.
- Cross-edition highlights retain one source record. Exact unique shared text
  preserves partial selection; changed Bible wording maps to the whole verse;
  other explicitly aligned editions map to the corresponding paragraph. There
  is no guessed word alignment. Unaligned editions with no unique matching text
  remain unmapped rather than displaying a false highlight.
- Verse-number/first-word units paint a continuous background. “He who receives”
  opened its menu in the actual Matthew 10 desktop reproduction. The reported
  intermittent failure is not reproduced; selection now clears on source/chapter
  changes to avoid stale local selection surviving a content replacement.
- Matthew title/text are supplied from one LabSource tuple; controlled requests
  use the displayed chapter. A screenshot of an old answer alone does not prove
  an incorrect request; live model interpretation was not retested.

Local verification: 190 files / 2,378 tests passed, including final additions. Build and verify-bundle passed. Final release checks
pending. Headless Chromium 1440×900 and WebKit 390×844 verified stable Explain,
expand sizes, clean chat entry, sent-input clearing, explanation persistence and
next-question context. Muted voice transport fixture verified normal handoff,
context preservation, source links and spoken acknowledgment instructions.
Cross-page selection passed both viewports. No actual microphone or paid model
calls were made. Artifacts: `output/reader-feedback-2026-09-17/`.

## Timing and cost

The existing speculation starts 180ms after a multiword selection opens its menu,
only while signed in—not on first finger-down. A pending request is shared with
Explain, and an exact cached answer avoids the provider call entirely.
Current Explain/text companion is `claude-sonnet-5`; voice remains OpenAI Live
with the existing OpenAI research/delegation configuration. No model migration.
Official Sonnet pricing checked September 17: $2/M input and $10/M output tokens
(https://platform.claude.com/docs/en/models/sonnet-5/migration-guide). At an
illustrative 2,000–8,000 input tokens plus up to 700 output tokens, a simple
explanation costs roughly $0.011–$0.023 before cache discounts/additional tools.
This is an estimate, not metered usage; the newer tokenizer and chapter size
matter. A speculative request never opened by the reader can still incur cost.

Browser cache acceptance also confirmed that reopening the same explanation after
a page reload makes no additional provider request. Matthew 10 fixture request
contained approximately 12,265 input characters (token count not metered).
The archived OVERVIEW/product inventory is not present in the active checkout;
this plan records only verified changes, without importing stale inventories.
