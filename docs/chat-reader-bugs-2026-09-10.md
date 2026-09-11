# Shared bug report — September 10, 2026

Source: https://chatgpt.com/share/6aa25489-2310-83eb-a4d8-5f69c38c8a30
Status: deployed and production-verified on September 10, 2026.

## Findings and changes

- Chat's reader waited for transport EOF even after the final SSE `message_stop`.
  A response that completed but kept its connection open left the sending lock
  active. A regression reproduces that path with three consecutive questions.
  Completion now releases the reader; stream errors/empty replies reach retry UI.
  This proves a concrete failure path, not the exact cause of the user's session
  (no session trace supplied). Development tests use intercepted responses, never
  Anthropic calls.
- Keyboard focus on mobile now hides the header, Back toolbar and copy controls;
  the writing area retains its size. Send blurs the field. Browser checks use a
  reduced viewport, not a physical iPhone keyboard.
- Single-word touch lookup no longer implicitly persists a highlight. Existing
  highlights and explicit coloring remain editable; multiword selection still saves.
- Chapter-end label is **Recap this chapter**. The complete card either fits after
  the final text or appears on an extra action page reached by ordinary forward
  navigation. Back restores the source page; Continue advances normally. Source
  page maps and saved positions are unchanged. This supersedes September 9's
  scrollable end-card decision.
- Recap receives up to three recent questions and three highlights from the same
  book/chapter/edition (questions retain their book/chapter identity). The prompt
  uses these lightly when relevant. Preparation remains unpersonalized. Instructions
  discourage routine closing questions/offers. Model quality is not verified by
  calling the production model during development.
- Character coverage was restricted to The Awakening, explaining Baruch's missing
  card. Reviewed Baruch son of Neriah identity is added for KJV, WEB and Modern
  English, only in Jeremiah. Exact edition/paragraph hashes and mention spans are
  verified. Other people named Baruch are excluded; this is not whole-library
  character coverage. Editorial source/compiler live in `books/characters/bible/`
  and `books/characters/build_bible_baruch.py`.

## Verification

- 1,627 unit tests passed; build and bundle verification passed.
- Local mobile WebKit / desktop Chromium: Baruch lookup, no incidental mark,
  overflow action page, Back with unchanged source anchor, Continue to Jeremiah 46.
- Chapter chat flow: phone, small phone with large type, desktop; source identity,
  recap/preparation, return, refresh and Continue. All model requests intercepted.
- Production repeated the new bug scenarios, chapter flow at three sizes, and
  Compare/final-book actions on desktop/mobile. All passed. Chrome/WebKit desktop
  mouse lookup and multiword drag highlighting also passed locally.
- `https://tinct.app/lab/phone` and its `?chrome=v2` preview opened successfully;
  normal `/reader` was the target of the detailed production behavior tests.
- Manual approved `CI=1 npm run deploy` completed successfully (not a GitHub
  Actions deployment); all 15 production smoke checks passed.
- Worker version: `dcb556e6-0679-44b5-b137-b51537e57e34`.
- Bundle: `index-Cl-WNh_5.js`.
- SHA-256 (built and served bytes match):
  `08c4197c74ec2d205438173e751a9ca7ba523a0f29c79b8c7afd2ae07e79f3f1`.
- Artifacts: `/Users/andershvelplund/.codex/visualizations/2026/09/10/tinct-chat-reader-bugs/`.
  `production/` includes Baruch, final text, whole end card and compact keyboard
  layout. `chapter-flow/` and `compare-final/` contain screenshots and assertions.
- Source commits: `048a4e11` (reviewed content), `302f7086` (app),
  `ed7716f3` (updated edge regression). Shipping branch:
  `codex/reader-stabilization-20260908`. Unrelated main-checkout changes preserved.
