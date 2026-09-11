# Approved V2 contents — implementation handoff

Anders approved this design on 8 September 2026: “thats it - lets buidl it”, and requested transfer to **Move coding to Codex** (task `01a07ff0-a87f-7031-8b2f-d050d06d52bd`). Implement there, coordinating with its existing voice work. This approval supersedes the earlier review-only / no-implementation language in the exploration document.

## Design source of truth

- `prototype.html`: the final approved interactive mobile design; an HTML fragment, not app code. Uses the visualization host's Lucide global for icons. Implement with the app's existing icon system.
- `mobile-contents.png` and `mobile-chats.png`: visual references. The fragment includes tiny later alignment fixes, so it is authoritative.
- Original inline fragment: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a08045-d8cd-7fe2-9ea7-1d0d250c6270/tinct-contents-refined.html`.

The prototype uses sample Bible progress, discussions, and passages. Reuse the visual and interaction decisions, not its hard-coded data or placeholder reader. Earlier grids, five-concept comparison and busier fast-contents presentation are superseded. No grids.

## Approved behavior and visual details

Refine the current contents hierarchy. The motivating case is Genesis 44: the user must not have to scroll back through dozens of chapters to switch books or jump elsewhere.

- Mobile: fixed header, book/jump controls and All / Chats / Highlights filters; independently scrolling chapter list; fixed one-line reading-location footer. Open with the current chapter visible. Use the available screen height, not the prototype's fixed pixel height.
- Small centered “The Bible” title, back and search icons, prominent serif book title, compact Jump to action, warm paper, fine rules and restrained current-chapter accent. No giant highlighted card, repeated unread labels, redundant counts or explanatory UI copy. Maintain accessible status labels, visible focus and 44px touch targets.
- Book title opens a searchable book list grouped by Testament, without backing out through multiple tree levels. Book browsing never changes the persisted reader position.
- Jump to accepts a chapter number for direct chapter opening at page 1. A vertical list of ten-chapter ranges moves the contents list for browsing without moving the reader. Map local Bible chapter labels to existing sequential chapter IDs correctly.
- Show actual conversation questions and highlight excerpts beneath their chapter, with bounded expansion. Chats gathers source chapter, date, question and excerpt for the selected book. Highlights gathers quotations and notes. Restore list scroll/filter/search when returning from a thread or highlight.
- Footer always refers to the actual reading location independently of the browsed book. Tapping it reveals the current chapter again without a position write.
- Search covers chapter references and words in passage text, conversation messages, highlighted text and notes across The Bible. Label scope clearly, group result kinds, and emphasize matched terms. References such as `Genesis 7` and `John 3` should work. Connect results to their exact conversation or passage.
- Keep the approved “Back to book” action unchanged.
- Desktop: apply the same hierarchy in a quiet left-side surface near the chapter-pill trigger, with little or no background blur. The approved visual reference is mobile; retain that compactness and typography when adapting.
- Ordinary books retain their own chapter names and omit the Bible-book chooser. Preserve the library taxonomy.

## Implementation constraints and known gaps

Work on the current reconciled reader branch / worktree in Move coding to Codex. This design branch was based on `codex/lab-convergence` at `3888548d`; it is not a new app-code base to merge over later reader fixes. The handoff commit contains only docs and design assets.

Everything belongs behind `?chrome=v2`. V1 DOM and behavior must remain unchanged, including its pinned snapshot. Prefer a dedicated V2 contents component or narrowly gated presentation, as `LabPhoneBibleTree.tsx` is shared.

Inspect the latest code first. The inspected versions (`3888548d` and `28dc4daf`) exposed these gaps:

- Search currently matches chapter titles, highlight notes, and conversation messages; full passage/highlight-text search needs real retrieval/index support. The demo is not evidence of a production index. Do not claim whole-book search while silently searching only loaded text. Use existing app infrastructure; ask before a schema/dependency change if needed.
- The inspected `onOpenConversation` callback ignored the selected conversation and just opened chat. Wire exact-thread restore against current conversation storage.
- History passed to contents was scoped to the current Biblical book; cross-book counts/search need correct scoped loading. Never display unloaded history as an authoritative zero.
- Preserve existing chapter/audio browsing callbacks, highlight paragraph anchors, coherent ReaderSession tuples, overlay write guards, compare navigation invariants and production-critical reading positions. No persistence on menu browse, search, tab changes or dismiss.
- Do not overwrite ongoing audio, loading, edition-change, chat overflow or voice fixes.

## Validation and shipping

Prototype browser checks passed at 390px and 320px/dark mode: direct numeric jump, reference search, word search and filters, book browsing with unchanged reading location, chat open/back restoration, and layout overflow. These are sample-interaction checks, not production app tests.

Implementation must include focused regressions for late-chapter navigation, book/chapter ID mapping, exact chat/highlight restoration, V1 isolation and no position writes during browsing. Follow the current task's repository gates: full tests, build, verify-bundle, approved deploy path and production smoke/visual verification. Design approval now permits implementation and normal verified V2 shipping; do not re-request design approval. Do not promote the lab reader to the main site as part of this change.
