# Hamlet recovery — 18 November 2026

All 20 scenes / 1,391 paragraph slots recovered, with both reading guides. Recovered Danish has 1,183 sequential repair operations across 1,172 slots; English has 382 operations across 258 slots. Full body and guide replay, chapter/section identity, nonempty paragraphs and balanced stage-direction brackets pass. These counts exactly match the historical final QA report.

All five source JSONs match their recorded Git blob identities after removing the terminal newlines introduced by the historical file-add tool. Current main content equals those source JSONs for both bodies and both guides: no content conflict detected; the recovered revisions have not been applied there.

The recovered files are at `candidate-hamlet-modern-da.json`, `candidate-hamlet-modern-en.json`, `candidate-hamlet.da.json`, and `candidate-hamlet.json`. Sequential repairs are alongside them. `REVIEW-REMAINING.json` and the historical `HANDOFF.txt` retain real editorial limitations. Recovery does not resolve those limitations or confer native sign-off.

## Recovery limits

The historical Gutenberg witness, source-to-slot mapping, cast supplement, ranking snapshot and claim file have not yet been recovered. Gutenberg requests returned HTTP 503 during this recovery. No new source-mapping success is claimed. The historical handoff describes the earlier successful source comparison; its source-file list must not be mistaken for a list of files presently recovered.

No upload, merge, release or enablement was performed. The historical source snapshot and repaired candidates are retained separately.
