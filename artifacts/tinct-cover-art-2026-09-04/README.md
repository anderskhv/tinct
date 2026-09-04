# Tinct published-library cover-art workstream

Date: 2026-09-04  
Scope: audit and pilot only; no production assets, registry behavior, routes, Library 2, or reader code changed.

## Result

- Authoritative published count: **100** entries in `bookRegistry.ts::BOOKS`.
- Existing real cover images: **0**.
- CSS cover placeholders: **100/100**.
- Missing visual replacements: **100/100**; nothing is broken at runtime because the CSS placeholder is the current implementation.
- Duplicate image files: **0**. The visual construction itself is duplicated across all titles: identical layout, title/author/year, with title-specific hue/color tokens.
- Pilot: **8** reviewed, typeset examples covering scripture, epic, philosophy, novel, drama, history, memoir, and strategy.

## Files

- `inventory-matrix.csv` — one row for every published book.
- `cover-manifest.json` — versioned filenames, audit state, rights/provenance, hashes, taxonomy, and reproducible prompt inputs.
- `ART_DIRECTION.md` — the cover-system rules.
- `GENERATION_AND_INTEGRATION_PLAN.md` — workflow, QA gates, estimate, and safe rollout.
- `PILOT_REVIEW.md` — visual review notes and the rejected/revised Histories example.
- `render_pilot.py` — deterministic title/author overlay and contact-sheet renderer.
- `pilot/artwork/` — text-free generated artwork.
- `pilot/final/` — deterministic pilot compositions; not production assets.
- `contact-sheet/` — normal and true 108×162 thumbnail proofs.
- `SHA256SUMS.txt` — immutable identity for pilot outputs.

## Canonical inventory evidence

`python3 books/wip_inventory.py` reported two non-published work items: staged `treasure-island` and onboarding `discourse-on-method`. Published status was then read from the source of truth, `BOOKS`, which contains 100 entries. `TREASURE_ISLAND` is intentionally not in `BOOKS`; `IVAN_ILYICH` is.

