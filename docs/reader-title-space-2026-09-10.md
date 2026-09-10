# Quiet mobile chapter title — September 10, 2026

Approved: let the chapter title use the space vacated by Play/Think in quiet
reading, returning to the compact pill when controls wake. Keep one line and
stable page geometry.

The mobile V2 header previously reserved its 5.75rem control track even when
both buttons were unmounted. The quiet brand now spans that existing grid track;
the header row and vertical dimensions remain unchanged. Desktop is unaffected.

Shipped commit d62df3b8 from an isolated checkout of the verified f9e91820 release,
preserving unfinished audio work in the stabilization checkout.

Validation: 1,631 tests passed; build and verify-bundle passed. Local and live
WebKit 390×844 and Chromium 360×844 checks loaded Hamlet Act 1 Scene 3, turned a
page to hide controls, and tapped the header to wake them. Title width expanded;
header/page geometry and visible text stayed identical across the transition.
Screenshots inspected. All 15 production smoke checks passed.

Direct approved npm deployment succeeded; no GitHub workflow was used.
Worker: a09ed3b9-2892-47a3-a240-d85c7c3c697b.
Live /lab/phone HTML references assets/index-YUVi_uW4.js; served bytes match build.
SHA256: 49a1182b15030e2a7b18e7c16680c7e68334766a7b9be4270e60cec2f42f87be.
Artifacts: /Users/andershvelplund/.codex/visualizations/2026/09/10/tinct-title-space/
(read/menu screenshots and results.json). Browser automation, not physical iPhone testing.
