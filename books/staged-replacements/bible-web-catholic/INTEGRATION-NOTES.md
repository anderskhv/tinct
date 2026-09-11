# Integration notes for the app agent — WEB Catholic Edition

This package is verified (text sourced and rights-clear, 73/73 books present) but
**deliberately not force-fit into any existing app schema**, per the task's instruction
not to force new text into old boundaries and to document required app changes rather than
inventing compatibility. This is a structural/product decision, not a content one — flagged
here for the app agent and Anders.

## The core problem

`app/src/data/bookRegistry.ts`'s `BIBLE` entry and `bible-kjv-en.json` /
`bible-web-en.json` both use a single flat chapter numbering, 1–1189, covering exactly the
Protestant 66-book canon in one fixed sequence (Genesis 1 = chapter 1 ... Revelation 22 =
chapter 1189). The Catholic canon has 7 additional whole books (Tobit, Judith, Wisdom,
Sirach, Baruch, 1 & 2 Maccabees) plus expanded Esther and Daniel, positioned *within* the
Old Testament reading order, not appended at the end. There is no way to add this content
without either:

1. **Renumbering the entire existing Bible** (inserting the new books' chapters at their
   canonical position pushes every subsequent chapter number up), which would break every
   reader's saved position, all audio manifests, and any external links keyed to the
   current chapter numbers — a real migration, not a content change.
2. **Treating "The Bible (Catholic Edition)" as a separate book entity** in the registry,
   with its own `bookId` (e.g. `bible-catholic`), its own independent 1–1328 chapter
   numbering (as built in this staged package), and its own registry entry, taxonomy
   classification, onboarding, etc. — no migration risk to the existing Bible book, but it
   means two separate "Bible" library entries for readers to choose between, and no shared
   reading position/highlights between them even for the 66 books they have in common.

**This package was built assuming option 2** (self-contained 1–1328 numbering, see
`build_web_catholic.py`) because it carries zero migration risk to the live Bible book, but
the actual product decision — whether Tinct wants one Bible entry with a
denomination/edition picker, two separate library entries, or something else — is the app
agent's and Anders's call, not something to decide unilaterally in a content pass.

## What's ready either way

- The verbatim, rights-verified, structurally-validated text (`bible-catholic-en.staged.json`)
  is correct and usable under either integration approach — only the chapter numbering
  and registry wiring depend on the decision above, not the text itself.
- If option 2 is chosen, this file is close to ready to copy into
  `app/public/data/editions/` as `bible-catholic-original-en.json` (or similar key) once
  the `sections` navigation tree is built (currently an empty placeholder — see
  PROVENANCE.md) and a registry entry is written.
- If option 1 (renumbering) or a hybrid is chosen, this file's per-book chapter/verse data
  is still the right source material, but the chapter `number` field would need
  regenerating against whatever the new unified numbering turns out to be — a mechanical
  re-run of this script with a different numbering pass, not new content work.

## Recommendation (content perspective only, not a final product call)

Given Tinct's test-user-release framing (small, trustworthy starting shelf, not a full
relaunch), **defer the Catholic edition past the initial test-reader release** rather than
rushing a schema decision under release pressure. The BSB replacement (Task 1's primary
deliverable) resolves the urgent problem — a copyrighted, partially-broken Bible in
production — on its own. The Catholic edition is a coverage expansion, not a release
blocker; ship it once there's time to make the registry decision properly. Recorded here so
the work already done (sourcing, rights, validation) isn't lost or redone.
