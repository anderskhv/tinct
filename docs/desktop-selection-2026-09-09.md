# Desktop selection — September 9, 2026

Anders reported awkward character long pressing and highlighting on desktop. Mouse clicks now open the existing character card for a reviewed mention, or dictionary for an ordinary word. Existing highlights retain their editing controls. A lookup does not create a new saved highlight. Touch long press remains supported.

The concrete mouse path previously entered selection only after movement; stationary release fell through to chrome toggling. Drag tracking only accepted exact word hit targets, so gaps could leave the endpoint behind. Mouse release now dispatches an explicit lookup intent. Mouse drags find the nearest word through gaps, stay within the initiating comparison side and avoid repainting an unchanged endpoint. Text, pagination, position writes and character spoiler gating are unchanged.

Verification: 151 files / 1,620 tests passed; build and verify-bundle passed. Real mouse lookup and drag-to-highlight passed Chromium and WebKit at desktop size, including no incidental highlight and unchanged reading place. Character mouse clicks passed both English editions; WebKit phone long presses passed both editions. Deployment evidence follows.

## Production verification

Shipped from clean commit `e5aede98` with Node 24 `npm run deploy`; its build and verify-bundle gates passed. Direct deployment succeeded (no GitHub Actions run). Worker `2e09c8f4-6591-43c8-85c1-b5d4665a5ac0`; live bundle `assets/index-aH9LqwqD.js`, SHA256 `4e8f95b3bd2a44b0dbc352063a1661d2a5d905c01bf3928064a291459d13c70c`. Downloaded production bytes match the deployed bundle.

Live Chromium/WebKit desktop lookup and dragging passed. Desktop mouse character lookup and WebKit phone long press passed both English editions. Desktop Chapter 20 original/modern Compare, existing highlight precedence, missing/slow character data and keyboard selection passed. All 15 production smoke checks passed. `/lab/phone` was captured as well. Fixtures intercepted API calls; no real account writes or model API calls were used. Dictionary opening was verified; remote definition quality is outside this change.

Screenshots, range/position evidence and logs: `/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-desktop-selection/`.
