# First recovered modern-Danish publication batch — 18 November 2026

Prepared for Claude, the designated release owner. These are recovered editorial candidates, not a claim that this batch has been published or has native sign-off. Anders wants the completed work published and accepts provisional launch before his own testing/native review. Do not add a blanket human-approval gate; address concrete defects and perform the application's normal release checks.

## Ten candidates pass the content gates; two need further English work

Antigone; Candide; Frankenstein; Narrative of the Life of Frederick Douglass; On the Genealogy of Morals; Heart of Darkness; Notes from Underground; Oedipus at Colonus; Oedipus the King; Second Treatise of Government; The Social Contract; The Awakening.

All twelve have a recorded complete Danish editorial pass. The current required modern-English gate passes for the first ten listed above, but FAILS for The Social Contract (similarity 0.837; 27.1% light chapters) and The Awakening (similarity 0.867; 59.0% light/mechanical chapters; 36.3% unchanged long paragraphs). Treat those two as HOLD pending modern-English remediation or an explicit applicable editorial exception; do not describe this as a fully passing twelve-book batch. Their recovered Danish work is preserved. This batch contains 46 body/guide JSON files and the original detailed review records. Notes from Underground has no English body change: retain current English. The Awakening has no replacement English guide in this package: retain current English guide unless separately revising it. Candide's translated historical footnotes are included as a separate supplement; provide a reader destination instead of silently dropping them.

## Tests completed now

- Retrieved exact preparation branch commit `dd7d22437633d57d624f18ff93cd88f33845857c` into a separate local recovery repository.
- Parsed candidate JSON and checked nonempty Danish paragraphs.
- All twelve Danish chapter/paragraph counts match the original-English edition at inspected main `b02c2c9ad4a8c10dfbe1c663ce01ac1dbe7abf04`.
- Every recorded final Danish and English paragraph edit matches the recovered candidate. The Social Contract's separate chapter-title edit also matches. See `LEDGER-TESTS.json`.
- Ran the current main modern-English classifier unmodified against all twelve paired English editions. Ten PASS, two FAIL as recorded above. See `MODERN-EN-GATE-TESTS.json`.
- Candidate and inspected-current-main file hashes are recorded in `MANIFEST.json`. Differences must be reconciled; the staging tree is not an instruction to overwrite current main blindly.
- Candide's four historical artifact hashes match after removing the preparation branch's terminal JSON newline. No textual difference is involved.

These checks verify recovery and structural integrity. They do not constitute a new full-book linguistic read, native approval, browser rendering test, or deployed release test. The original source-fidelity work and its limitations are recorded in `review-notes/`.

## Claude's release work

1. Recheck latest main and active releases. Work from a current isolated checkout. Preserve newer fixes, particularly text formatting, footnote markers and reader compatibility changes.
2. Integrate the paired Danish/English bodies and provided guides. Preserve unchanged original editions. Read each book's review notes; carry source emendations and supplementary material together.
3. Use the existing content checks and application workflow. Check Danish selection, first/middle/final chapter loading, onboarding opening text, verse/quotes/notes, navigation, saved reader positions and incompatible audio handling. The existing paragraph coordinates are preserved in this batch, but word offsets change.
4. Enable only the editions that pass those integration checks. Do not enable all retained Danish files globally.
5. Release under Claude's coordination and report each published book with the source commit/release identifier and live verification. No second release owner is active in this recovery task.

## Exclusions

Other recovered books are being verified separately. In particular, do not take the older partial Oresteia from `recovered-branch`; its newer complete draft is in `recovery-parent/reconstructed/oresteia`. Alice still has a literary-quality hold. Symposium requires its explicit bookmark/paragraph remapping. Nicomachean Ethics requires the diagram and notes integration; Discourse on Inequality requires its author notes; Vindication requires the historical-biography supplement decision. Bible drafts and the Romans pilot remain unpublished and are not part of this release batch.
