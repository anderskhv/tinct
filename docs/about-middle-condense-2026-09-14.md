# About middle condensation — 14 September 2026

Anders approved the narrow middle cut in the marketing review conversation (“go”). Broader recommendations remain proposals.

## Change

Combine two questions into “Could AI help us read better things?”, remove the separate effortless-reading section and the bridge before the Tinct reveal, and shorten the question and bookshelf holds. Preserve opening, joke, overload, difficult-text overview and all six product demonstration durations. Stable scene indices preserve bookshelf animation; incoming transitions skip removed scenes in both directions. Version the stylesheet and module graph together for cached visitors. The import patch calls the new condensation script so a future import retains the cut.

Total scroll allocation falls from 5025 to 4415svh (12.1%). The middle between overload and the first demonstration falls from approximately 1778 to 1168svh (34.3%). These are scroll distances, not measured conversion or video retention improvements.

## Verification

- 2240 tests passed across 170 files; 10 focused About checks passed, including scene skipping, cache references and preserved demo durations.
- Build and verify-bundle passed. Patch rerun reports 0 legacy edits and leaves the new sequence intact.
- Local desktop 1280×720 and phone 390×844 checked: question, bookshelf, difficult-text overview, reveal and voice demonstration. No browser errors or horizontal overflow observed.
- Used a fresh reconciled clone of main a88bb9a7 because the shared checkout contains unrelated user changes. No shared app changes were reverted. Generated sitemap date-only changes excluded.
- Shared documentation checker previously blocked on an iCloud-dataless CLAUDE.md; this main checkout has no check-docs.py. Release documentation has no relative links to validate.

## Release

Pending deployment and production verification. Next action: merge, wait for GitHub deploy and smoke test, then inspect production About and reader on phone.
