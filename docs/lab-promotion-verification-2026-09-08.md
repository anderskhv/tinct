# Lab promoted to public experience — 8 September 2026

Source commit: c42810da.

The public homepage now serves the lab landing/returning-reader flow. /app and /library open the new library; /reader opens the new chrome. Interactive /read/book links open the selected book in the new flow. Public crawlable book pages remain available. Internal /app.html stays available as the existing app-shell asset. Existing unflagged lab V1 routes remain unchanged for the snapshot contract.

The new chrome defaults to the full direct voice experience previously tested by Anders; mini remains an explicit option. Auth, billing entitlements and pricing are unchanged.

Two release-check fixes: the reading-memory recorder reloads immediately after local sign-in adoption, before cloud hydration, so a page turn cannot restore anonymous ownership; a failed full-voice connection retains the reconnect surface instead of disappearing.

## Verification

- Full suite: 140 files, 1,543 tests passed, including the unchanged V1 DOM snapshot, delayed-cloud sign-in regression, full-voice timeout/reconnect and public route tests.
- Build and bundle verification passed; approved npm deploy completed successfully.
- Production browser checks at desktop and mobile sizes: public homepage, Start reading → library → edition choice → new reader; default voice V2 without voiceTrial query; sign-in link.
- Authenticated production check: entering at / opens the returning library, restores Reading Now and Finished, keeps the initial audio bar hidden, shows collapsed contents and opens chats directly with user questions. Temporary test authentication revoked after use; writes and paid AI/recap calls blocked.
- Live GET homepage is indexable and canonical to https://tinct.app/. /app, /library, /reader and interactive book-link redirects verified. /lab/phone served the verified live bundle.
- This pass verified voice selection and existing automated voice behavior; it did not make another paid voice call. Anders previously tested voice quality successfully. Physical iOS was not re-tested.

Production screenshots: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/public-release/`.

Rollback source before promotion: 5810bb0f. Use the approved build/verify/deploy pipeline from a clean checkout if rollback is needed; user data has not been migrated or deleted.

Deploy succeeded. Worker version: ff8cd29a-e7ab-4828-bae5-35dcbb56cd71. Live bundle: /assets/index-Di3K1-9g.js; SHA256: 9d26a374c9897db580699b7b1e2e58eca459f007f64069856f3aca3c6d8e2e10. Production bytes match the local build; refreshed routing import verified.
