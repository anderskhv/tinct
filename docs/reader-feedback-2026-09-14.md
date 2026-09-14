# Reader screenshot fixes — 14 September 2026

Status: implemented and verified locally; integration, deployment and production verification belong to the coordinating task.

## Proven causes and changes

- Selection and audio color were applied to spans containing the separator before a word. Spaces now live outside the painted word spans in Read, Compare, audio and matching hidden measurement markup. The native fragment paginator shares the desktop measurement builder, including emphasis and verse units, so the measured text matches the visible text. The legacy unflagged DOM baseline was deliberately regenerated for this shared fix.
- The compact dictionary card inherited a bottom divider from its retired toolbar layout. That divider is removed only for compact definitions.
- A phone passage is a flex child with horizontal auto margins. Without an explicit width, a short final sentence shrank the page from 390px to 307.7px, centering the reading surface and leaving 41px edge margins outside its gesture handler. Phone passages now retain full width and border-box sizing. Desktop already specifies full width.
- Library handoffs without a comparison edition and older position records reset the stored Compare preference. Handoffs now preserve the preference; restored positions retain the latest settings choice, including None.
- Anders approved removing Show Compare during this task. Selecting a second edition now enables Compare; choosing None disables it. The primary edition is excluded from second-edition options. Changing the main edition to the comparison edition disables comparison. The existing internal preference remains to avoid unnecessary storage migration.

## Verification

- All 980 lab tests passed across 77 files, including selection/audio span boundaries, measured/painted verse spacing, old-position resume, Compare selection/None and existing position/navigation regressions.
- Production build and bundle verification passed with the required public environment values: `index-XNZtiVYo.js`. Normal chunk-size warning remains.
- `app/scripts/check-reader-feedback.cjs` ran against local Vite with every `/api/` request mocked to 404, so no chat, audio or account operations were invoked. Fifteen pages of The Republic Book 1 passed in WebKit at 390×650 and Chromium at 1440×950: no duplicate word anchors, no leading/trailing separator spaces, full phone page width, and minimum bottom clearance 28.95px mobile / 66.84px desktop. Compare survived handoff and reload. A short-sentence DOM clone tested the width regression without mutating React state; the real reader accepted a right-edge touch.
- Artifacts: `/tmp/tinct-reader-feedback-artifacts/results.json`, `phone-republic.png`, `desktop-republic.png`, `phone-short-tail.png`.
- Shared documentation checker: 12 checked, zero errors/reminders. Current main lacks the newer checker; used the existing shared checkout checker, so this is a check of those maintained notes rather than a claim that main has adopted them.

## Limits and next action

The exact reported Republic final-line clipping was not reproduced on the settled current build in the sampled pages. No speculative pagination algorithm change was made. A mid-sentence page end such as “Accordingly we went” is still allowed: it is not evidence that source words were lost. The screenshot font settings and actual Safari browser chrome cannot be reconstructed exactly from the images. The full-width correction addresses the separately reproduced centered-tail/dead-margin fault.

The older desktop traversal script counted newly word-addressed comparison text as primary words. With its selector corrected temporarily, its full chapter Read/Compare traversal passed, then its live-audio wait timed out under local Vite. That temporary script edit is not part of the change; the dedicated mocked check above is the reproducible validation.

Integrate with chat fixes, run the full repository suite and deployment gates centrally, then rerun the dedicated browser check with `TEST_ORIGIN=https://tinct.app` and a production artifact directory. Inspect definition popup and actual audio word highlighting on the deployed build. Keep the exact clipping report open if it recurs with fresh source/viewport evidence.
