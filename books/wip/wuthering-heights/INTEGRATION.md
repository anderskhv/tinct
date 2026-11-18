# Wuthering Heights — integration notes (2026-09-30)

Branch `integration/new-books-alice-wh-middlemarch`. Staged only: the `WUTHERING_HEIGHTS` constant is in `app/src/data/bookRegistry.ts` but not in `BOOKS`.

`HANDOFF.md` describes the earlier wh1-only state (chapters I–XI). The live `wuthering-heights-modern-en.json` is the merged whole book: 34 chapters, 1,931 paragraphs, aligned chapter by chapter with `original-en`, whole-book similarity gate PASS (weighted 0.495, 0 light/mechanical, 1 identical long paragraph of 1,586). Chapter numbers are 1–34 as in the source; nothing was renumbered.

Both editions are chapter-sharded (`app/public/data/editions-chapters/wuthering-heights-*`), as the larger recent novels are.

Taxonomy in `libraryTaxonomy.ts` follows `taxonomy.md` (House `novel`, shelves `english-novels` and `gothic-novels`, form `novel`, era `modern`, no canon lists). The book hue (285) and the three-theme subset (revenge, class, inheritance) are integration choices, not package proposals.

## Not done

Character sidecar (see `characters/README.md` for the two-Catherines and Linton/Earnshaw rules), cover art, SEO pages, `audioAvailability.json` entries, review by Anders.
