# Voice access rejection — 8 September 2026

The user's console screenshot shows POST `/api/voice-session` returning 402 from the older `index-DAJ832Gt.js` bundle. The server returns 402 only when `evaluateChatAccess(profile)` rejects the account's available AI entitlement. The screenshot does not identify the account or prove whether its stored entitlement is correct. The account email has been requested; no credits, subscription data or access policy have been changed.

A separate V2 presentation bug hid the explanation: failed starts closed the call, while the notice lived in the legacy phone bar, which V2 normally does not render. Commit `25ae3761` adds a visible dismissible notice and View account action outside that bar. The notice respects the actual visible chat surface, rather than the desktop-open state also used internally during phone calls. Explicit pointer events allow its actions through the non-interactive bottom-chrome container.

Verification: 138 files / 1,521 tests passed, including the V1 snapshot and an account-rejection regression covering microphone cleanup, call closure, visible notice, account navigation and dismissal. Build and verify-bundle passed. Approved deployment succeeded from a clean checkout; sitemap restored.

Worker: `b89d694c-ce3b-4018-8d64-f47b9ff28ea7`.
Live bundle: `assets/index-DxYT1k6U.js`, exact byte match to deployed local output.

Production UI checked on `/lab/phone?chrome=v2&voiceTrial=full` using a fresh Chromium profile, synthetic microphone and intercepted 402 response. The notice stayed visible, the call closed, and View account opened the account sheet. This is UI verification, not restoration of the user's real account access. No live model call or billing mutation occurred.

Artifacts: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/voice-access-production/` (`voice-rejected.png`, `account.png`, `report.json`, `bundle.json`).
