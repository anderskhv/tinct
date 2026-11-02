# Modern Danish quality programme — calibration package

Status: draft calibration, not accepted content and not a publication package.

Approved scope: 70 complete high-quality modern-da editions, six reserve candidates. User reopened Danish on 2 November 2026; that assignment supersedes the older English-only scope for this work. Earlier “do not touch code” remains respected.

Owned branch: content/modern-da-quality-20261102
Owned path: books/wip/modern-da-quality-20261102/ only.
Instruction and source baseline: 4cf7182d90709ed439cff848f9039dd9bed8c569.

## What is complete

- Current main instructions checked; required local references match the current remote Git blob identities.
- Open Danish work checked: PR #568 (style) and #572 (different translation run) exist. Neither branch is merged or modified here. The current-main text is the baseline.
- Five pilot books pinned. Twelve complete paragraph candidates prepared (about 1,100 Danish words), including both exact Grimm paragraphs containing hys; the Hans and Grete paragraph also contains Græm dig ikke.
- Draft style standard, 70-book queue plus six reserves, publication/visibility acceptance conditions and reader review form prepared.
- Candidate paragraphs checked by their author against the pinned English. This is self-review, not independent review.

## What is not complete

No whole book is accepted. No native reviewer or independent reviewer has signed off. No full-book rewrite is claimed. No content is integrated or published. No app code, shared policy, live data, saved reader state or audio changed. No external model API was called.

## Calibration dependency

A native-Danish reviewer has not yet been assigned. The user has been asked who will review the pilot. A different fidelity reviewer must also check every pilot paragraph, and corrections must be rechecked. The approved plan requires these before scaling the style or calling an edition high quality. Do not turn this checkpoint into a request to re-authorize the already approved content programme.

## Review instructions

Read PILOT-READING.txt first for readable before/after passages. Use REVIEW-FORM.json to record fidelity, naturalness, voice and specific corrections. “Accept pilot style” does not accept any full book. The next content step after calibration is the full Grimm edition plus the short Manual, followed by the remaining existing offered titles in the approved queue.

## Integration boundary

Follow books/BOOK-TASK-WORKFLOW.md. It states: “Do not merge to main, deploy, publish assets, start narration generation or change production settings.” This package is therefore committed only to its content branch. Future integration must separately implement the approved visibility contract and preserve reader recovery. Current hidden editions remain hidden; current offered editions have not been withdrawn by this content task.

For changed wording, paragraph coordinates remain the same but word offsets do not. All character names and speaker identities are retained; a whole-book name/address sheet and annotation-impact review are still required. There is no safe exact old-word-to-new-word mapping asserted here.
