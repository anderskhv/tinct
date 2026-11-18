# Recovered modern-Danish work: Claude release index

18 November 2026. This is the current recovery handoff. It supersedes earlier missing-file assessments and incomplete batch counts.

76 book records: 52 CONTENT_CHECKS_PASS, 12 HOLD, 12 INTEGRATION_REQUIRED.

**These are recovery/content checks, not a blanket certification of high Danish quality or proof of publication.** Original editorial notes remain authoritative about coverage. Native review is pending. Anders accepts provisional release before his own/native testing. Claude owns all integration and publication; do not require a new blanket approval.

Live catalogue snapshot:37 modern-Danish editions discoverable. Visibility does not prove the recovered revision is deployed. Sixteen of 45 branch Danish bodies already match inspected main; avoid overwriting newer work. Current main inspected: b02c2c9ad4a8c10dfbe1c663ce01ac1dbe7abf04. Reconcile against latest main before applying.

Start with `claude-release-batch-01/README.md`: ten candidates have ledger checks, passing English gates and fresh targeted source checks. Two additional files in that batch are explicitly held. Then process CONTENT_CHECKS_PASS rows below; complete book-specific work for INTEGRATION_REQUIRED; preserve HOLD drafts while resolving their stated issue. No Bible/Romans publication.

Guide excerpt checks are recorded in GUIDE-OPENING-CHECKS.json. Multi-paragraph excerpts were normalized for whitespace; Meditations intentionally omits section numbers. Crito and Manual retain matching current-main guides. Magna Carta has no located Danish guide and is listed for integration.

## Per-book status

|Book|Disposition|Live DA|Recovered candidate folder|Notes|
|---|---|---|---|---|
|a-little-princess|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|alice-in-wonderland|HOLD|yes|[recovered-branch](recovered-branch)|Recorded literary-quality hold plus English gate failure.|
|anna-karenina|HOLD|no|[recovery-worker-a/reconstructed/anna-karenina](recovery-worker-a/reconstructed/anna-karenina)|Resolve source-order policy at chapter 232 and recorded Danish semantic issues before release. Ellipsis 47:24 is source-supported, not missing content.|
|antigone|CONTENT_CHECKS_PASS|no|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|apology|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|aristotle-politics|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|around-the-world-80-days|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|as-you-like-it|HOLD|no|[recovery-parallel/as-you-like-it](recovery-parallel/as-you-like-it)|Resolve source witness rights notice and include 47restored slots with bookmark map.|
|bacchae|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|beyond-good-and-evil|CONTENT_CHECKS_PASS|no|[recovery-worker-a/reconstructed/beyond-good-and-evil](recovery-worker-a/reconstructed/beyond-good-and-evil)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|brothers-karamazov|INTEGRATION_REQUIRED|no|[recovery-worker-b/reconstructed/brothers-karamazov-replayed](recovery-worker-b/reconstructed/brothers-karamazov-replayed)|Integrate paired 9-slot frontmatter and 9 note references.|
|candide|CONTENT_CHECKS_PASS|no|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|comedy-of-errors|CONTENT_CHECKS_PASS|no|[recovery-parallel/comedy-of-errors](recovery-parallel/comedy-of-errors)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|communist-manifesto|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|confessions|CONTENT_CHECKS_PASS|yes|[recovery-worker-b/reconstructed/confessions-replayed](recovery-worker-b/reconstructed/confessions-replayed)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|coriolanus|CONTENT_CHECKS_PASS|no|[recovery-parallel/coriolanus](recovery-parallel/coriolanus)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|crime-and-punishment|INTEGRATION_REQUIRED|yes|[recovery-worker-b/reconstructed/crime-and-punishment-replayed](recovery-worker-b/reconstructed/crime-and-punishment-replayed)|Preserve paired 11-paragraph preface.|
|crito|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|descartes-meditations|HOLD|yes|[recovered-branch](recovered-branch)|Current mandatory modern-English gate fails; preserve Danish work and remediate or resolve applicable editorial policy. |
|discourse-on-inequality|HOLD|no|[recovered-branch](recovered-branch)|Current mandatory modern-English gate fails; preserve Danish work and remediate or resolve applicable editorial policy. Preserve author notes; English gate also fails.|
|don-quixote|INTEGRATION_REQUIRED|no|[recovery-worker-b/reconstructed/don-quixote-replayed](recovery-worker-b/reconstructed/don-quixote-replayed)|Preserve dedication,preface and11 poems; ellipsis 70:32 is supported by Spanish source (recorded exception).|
|faust-part-1|INTEGRATION_REQUIRED|no|[recovery-parallel/faust-part-1](recovery-parallel/faust-part-1)|Danish 1,095 German-aligned slots vs English 1,060; migrate legacy 895 Danish slots with explicit mappings.|
|fear-and-trembling|INTEGRATION_REQUIRED|no|[recovery-worker-a/reconstructed/fear-and-trembling](recovery-worker-a/reconstructed/fear-and-trembling)|Danish 232 slots vs English 184 reflect independent source segmentation; explicit mapping required; classifier cannot compare mismatched shapes.|
|frankenstein|CONTENT_CHECKS_PASS|no|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|frederick-douglass|CONTENT_CHECKS_PASS|no|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|genealogy-of-morals|CONTENT_CHECKS_PASS|no|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|gilgamesh|INTEGRATION_REQUIRED|no|[recovery-parent/reconstructed/gilgamesh](recovery-parent/reconstructed/gilgamesh)|Publish as separate Thompson 1928 source edition;145 slots vs legacy 253. Complete source and reader mapping checks.|
|great-expectations|HOLD|no|[recovery-parallel/great-expectations](recovery-parallel/great-expectations)|English gate fails similarity 0.778 and 8.5% light chapters.|
|grimms-fairy-tales|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|hamlet|CONTENT_CHECKS_PASS|no|[recovery-worker-a/reconstructed/hamlet](recovery-worker-a/reconstructed/hamlet)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|heart-of-darkness|CONTENT_CHECKS_PASS|no|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|hume-enquiry|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|ivan-ilyich|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|jekyll-and-hyde|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|jungle-book|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|kant-groundwork|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|king-lear|CONTENT_CHECKS_PASS|no|[recovery-parallel/king-lear](recovery-parallel/king-lear)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|leviathan|HOLD|no|[recovery-worker-a/reconstructed/leviathan](recovery-worker-a/reconstructed/leviathan)|Recovery HOLD: both guides match historical hashes, but Danish body is393bytes shorter and English has731changedslots vs733expected. Resolve missing source-map/body differences before release.|
|macbeth|INTEGRATION_REQUIRED|no|[recovery-parallel/macbeth](recovery-parallel/macbeth)|Integrate34 restored paragraph slots with comparison/bookmark migration checks.|
|magna-carta|INTEGRATION_REQUIRED|yes|[recovered-branch](recovered-branch)|No Danish reading guide found in recovered packet or inspected main; supply guide or verify intentional guide fallback before enabling.|
|medea|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|meditations|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|middlemarch|CONTENT_CHECKS_PASS|yes|[recovery-parallel/middlemarch](recovery-parallel/middlemarch)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|midsummer|CONTENT_CHECKS_PASS|no|[recovery-parallel/midsummer](recovery-parallel/midsummer)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|moby-dick|INTEGRATION_REQUIRED|yes|[recovery-parallel/moby-dick](recovery-parallel/moby-dick)|Integrate 3 restored front sections, 80 extracts and bookmark map. English gate passes after documented normalization of moved heading continuations.|
|nicomachean-ethics|INTEGRATION_REQUIRED|no|[recovered-branch](recovered-branch)|Integrate diagram and notes with body.|
|notes-from-underground|CONTENT_CHECKS_PASS|no|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|oedipus-at-colonus|CONTENT_CHECKS_PASS|no|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|oedipus-rex|CONTENT_CHECKS_PASS|no|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|on-liberty|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|oresteia|CONTENT_CHECKS_PASS|no|[recovery-parent/reconstructed/oresteia](recovery-parent/reconstructed/oresteia)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|othello|CONTENT_CHECKS_PASS|no|[recovery-parallel/othello](recovery-parallel/othello)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|phaedo|HOLD|yes|[recovered-branch](recovered-branch)|Current mandatory modern-English gate fails; preserve Danish work and remediate or resolve applicable editorial policy. |
|phaedrus|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|poetics|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|romeo-and-juliet|CONTENT_CHECKS_PASS|no|[recovery-parallel/romeo-and-juliet](recovery-parallel/romeo-and-juliet)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|second-treatise|CONTENT_CHECKS_PASS|no|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|social-contract|HOLD|no|[recovered-branch](recovered-branch)|Current mandatory modern-English gate fails; preserve Danish work and remediate or resolve applicable editorial policy. |
|symposium|HOLD|no|[recovered-branch](recovered-branch)|Current mandatory modern-English gate fails; preserve Danish work and remediate or resolve applicable editorial policy. Explicit paragraph/bookmark migration; English gate also fails.|
|the-aeneid|CONTENT_CHECKS_PASS|no|[recovery-parallel/the-aeneid/final-release-candidate](recovery-parallel/the-aeneid/final-release-candidate)|Eight substantive corrections now applied and checked in final-release-candidate; historical draft preserved. Native review pending; normal reader/release checks remain.|
|the-art-of-war|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|the-awakening|HOLD|no|[recovered-branch](recovered-branch)|Current mandatory modern-English gate fails; preserve Danish work and remediate or resolve applicable editorial policy. |
|the-manual|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|the-prince|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|the-republic|CONTENT_CHECKS_PASS|no|[recovery-parent/reconstructed/the-republic](recovery-parent/reconstructed/the-republic)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|the-tempest|CONTENT_CHECKS_PASS|no|[recovery-parallel/the-tempest](recovery-parallel/the-tempest)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|to-the-lighthouse|CONTENT_CHECKS_PASS|yes|[recovery-worker-a/reconstructed/to-the-lighthouse](recovery-worker-a/reconstructed/to-the-lighthouse)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|twelfth-night|CONTENT_CHECKS_PASS|no|[recovery-parallel/twelfth-night](recovery-parallel/twelfth-night)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|ulysses|HOLD|no|[recovery-worker-a/reconstructed/ulysses](recovery-worker-a/reconstructed/ulysses)|English gate fails (similarity 0.938; 61.1% light/mechanical). Five interpretive uncertainties and score/inscription integration remain.|
|us-founding-documents|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|utilitarianism|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|
|vindication-rights-of-woman|INTEGRATION_REQUIRED|no|[recovered-branch](recovered-branch)|Resolve historical-biography supplement destination; verify later-recovery record.|
|walden|CONTENT_CHECKS_PASS|no|[recovery-worker-b/reconstructed/walden-replayed](recovery-worker-b/reconstructed/walden-replayed)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|war-and-peace|CONTENT_CHECKS_PASS|no|[recovery-parallel/war-and-peace](recovery-parallel/war-and-peace)|Recovered ledger/source evidence in candidate folder; no fresh full linguistic read. Claude must reconcile current main and run reader/release checks.|
|wealth-of-nations|INTEGRATION_REQUIRED|no|[recovery-worker-b/reconstructed/wealth-of-nations-replayed](recovery-worker-b/reconstructed/wealth-of-nations-replayed)|Preserve39 table snapshots per language and author notices; test rendering.|
|werther|CONTENT_CHECKS_PASS|yes|[recovered-branch](recovered-branch)|Historical editorial record; fresh structural/gate checks only. Claude must reconcile current main and run reader/release checks.|

## Release checklist for Claude

Use the manifest hashes and original review records to merge content into an isolated current checkout. Carry paired English corrections and both guides, including restored frontmatter, poems, footnotes and tables. The first-four-play guide openings have been synchronized; their remaining guide prose has not received a new full review.

Run the project’s normal checks and verify Danish selection, onboarding excerpt, beginning/middle/end chapters, verse and tables, note navigation, bookmarks, comparison alignment and incompatible audio. Avoid mass-enabling retained Danish files. Release serially under Claude’s coordination. Record each published book, deployed revision and live verification.

These tests do not replace native proofreading, theological review, a new sentence-by-sentence source audit, or browser tests. Structural passes prove files can be recovered and parsed; the English classifier does not assess Danish quality. Do not equate automated passing status with a completed fresh linguistic review.

Unfinished Divine Comedy, Montaigne, Democracy in America and Peloponnesian War are outside this 76-record release inventory. Their partial work and Bible/Romans drafts must remain unpublished.
