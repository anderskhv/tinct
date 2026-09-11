# Compact highlight menus — September 10, 2026

Implements the approved long-press popup design from
`docs/design/long-press-popups-2026-09-10.md` in the main working checkout.

Character and dictionary cards initially show information plus More only. More
replaces the information with Highlight/Remove highlight, Copy, Ask and Add/Edit
note; Back returns to information. Character dictionary/gallery remain accessible
from the action menu. Selection alone no longer writes phrase highlights in LabApp.
Highlight saves immediately in the last selected colour (gold initially); recolouring
keeps the popup and updates the same mark. Classic Reader and SplitReader retain
created IDs too; multi-paragraph Reader selections retain their created segment IDs.

Outside pointer gestures are consumed through their release/click, even after the
popup unmounts, avoiding underlying navigation/selection/control activation. Escape
also dismisses. Existing note save/cancel behavior remains explicit. Reader Ask now
opens chat with an unsent selected-text draft instead of reopening the dictionary.
No pagination, source text, audio or position persistence code changed.

Verification: 151 test files / 1,627 tests pass; build and verify-bundle pass.
Local and live WebKit 390×844 and Chromium 1440×950 browser checks exercise Read
(light) and Compare (dark): character and ordinary-word information, More/Back,
explicit save, same-ID recolour, remembered colour, outside page-edge dismissal,
notes, removal, and unsent Ask draft. Compare writes target the modern edition.
The phrase no-write path has an integration regression. Screenshots inspected.
These are automated browser checks, not physical-device certification.

Shipped code f280d42b from an isolated checkout retaining the verified header,
Hamlet and Macbeth releases. Direct npm deployment succeeded, no Actions run used.
Worker: 51d22a1e-1350-4b63-9b58-752ae39e4a8d.
Bundle: assets/index-7wjHvUbk.js.
SHA256: 8beccb11d6991587b992e40f141c255b6c0bd084688e568cf7fddfd4389778c5.
Live /lab/phone references that bundle; JavaScript and CSS bytes match local build.
Initial smoke had a CSS 404; full retry passed all 15 and exact CSS bytes were then
verified. No code change was required; the transient cause was not established.

Artifacts: /Users/andershvelplund/.codex/visualizations/2026/09/10/tinct-compact-popup/
(`read/`, `compare/`, screenshots and results.json).
Repeat with `node scripts/check-compact-popup.cjs https://tinct.app <artifact-dir>`;
set `COMPARE=1` for dark Compare checks. Run from app/.
