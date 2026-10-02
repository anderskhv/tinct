# Middlemarch release assets — STAGED

- Branch: `content/release-assets-middlemarch-codex`.
- Fetched base / instruction revision: `8cfe39e709250a7c53942dcb6a582b360d132335`, `origin/integration/release-candidate-2`.
- User explicitly authorized these per-book runtime assets and entity module; shared-file restrictions remain in force.
- Items 1–3 checkpoints: `ceb3b99f7`, `1c94ea999`, `1b3cb61d4`.
- Status: content assets prepared and authoring-agent reviewed. Not public; no deploy, merge, PR, provider calls, audio generation or Anthropic spend. Accepted edition bytes unchanged.

## Integration snippets

- `characterReleases-entry.txt` → `app/src/services/characters/characterCards.ts`, only during authorized integration. Cards currently remain unregistered.
- `manifest-entry.json` → `docs/design/library-prefaces/manifest.json`. SHA-256 hashes exact UTF-8 preface bytes including final newline; wordCount uses whitespace splitting (97 words). Preface and introduction paragraphs reproduce onboarding `about` verbatim.
- `audioAvailability-entries.txt` → proposed `eligible_editions` additions only when separately authorized. The current manifest partitions public BOOKS: adding staged entries would violate that contract. No existing recording or acoustic validation is claimed. Preserve text/provider/model/voice/settings cache identity; no prewarming authorized.
- `reviewedHooks-entry.txt` → `app/public/lab/library_2/reviewed-introductions.js`, only during authorized integration.
- Do not add `MIDDLEMARCH` to BOOKS under this assignment.

## Characters

- 21 cards per edition; 6,470 original / 6,100 modern mentions. Eight spoiler snapshots per edition.
- Final served sidecar equals `books/characters/middlemarch/characters.v1.json`.
- Generic compiler was run as requested; final asset uses `build_reviewed.compile_package` with `entities.middlemarch.bind` and `books/characters/middlemarch/editorial.json`.
- Conservative recognition: no global `Mary`, `Will`, `Garth`, `Vincy`, generic Vicar, or surname-only `Ladislaw`. Mary Garth is not the Vincy household’s young Mary. Mr. Garth is Caleb; Mrs. Garth is Susan. Mr. and Mrs. Vincy remain distinct from Fred and Rosamond.
- Mrs. Bulstrode is Harriet, distinct from Nicholas. Mrs. Casaubon and Mrs. Ladislaw bind to Dorothea. Mrs. Lydgate binds to Rosamond.
- Lady Chettam means Sir James’s mother except the reviewed Celia occurrences at 35:5 and 68:25. The longer `young Lady Chettam` also binds to Celia.
- Mrs./Miss Farebrother are excluded from the clergyman’s surname binding. Captain and Sir Godwin Lydgate are excluded from Tertius’s surname binding.
- No claim of exhaustive pronoun or unnamed-relative coverage. Full later scandals and outcomes are not included in introductory cards.

All coordinates below are live unit : zero-based paragraph, with release at paragraph end:

| Character | Gates |
|---|---|
| Dorothea | 11:62 (Casaubon marriage), 88:11 (Mrs. Ladislaw) |
| Celia | 35:5 (young Lady Chettam) |
| Rosamond | 44:3 (Mrs. Lydgate) |
| Raffles | 42:12 (Rigg’s stepfather), 54:21 (Bulstrode acquaintance) |
| Rigg | 42:12 (Raffles’s stepson) |
| Mary Garth | 88:3 (marriage to Fred) |

Reproduce final character assembly from the repository root; running only the generic compiler overwrites its local output with the baseline, not the final reviewed gates:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 - <<'PYCODE'
import json, sys
from pathlib import Path
sys.path.insert(0, 'books/characters')
from build_reviewed import compile_package
from entities.middlemarch import bind
asset, report, _ = compile_package('middlemarch', bind)
for path in ['books/characters/middlemarch/characters.v1.json',
             'app/public/data/characters/middlemarch.v1.json']:
    Path(path).write_text(json.dumps(asset, ensure_ascii=False, indent=2) + '\n')
Path('books/characters/middlemarch/validation-report.json').write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + '\n')
PYCODE
```

## Numbering and threads

- Prelude = live unit 1; numbered text occupies live units 2–87; Finale = 88.
- Threads: 22 figures including the Prelude’s Theresa, 181 character/unit entries, all 88 units represented, both English editions. Event summaries cover their keyed unit, not later outcomes. Threads are chapter-level recaps, not paragraph-level recognition cards.
- Source text: 88 units, 4,674 paragraphs per edition; no source paragraphs changed.
- Original SHA-256: `a3b3b9ad34ba3511a522542df9f6ad9eec8736a1cf0b757f282bb05192352364`.
- Modern SHA-256: `517443310e86193151b2c83938c8cd76bc3e4cbe61a4876886e3e5d63837d413`.

## Validation

- `cd app && npx vitest run src/services/characters`: 6 files, 497 tests PASS (Node 24.13.0, Vitest 4.1.5).
- Direct Middlemarch checks used only in-memory character registration: runtime source/paragraph hashes, every UTF-16 mention and resolution, highlight preservation, identity rules and all snapshot boundaries PASS. No registry file was changed.
- JSON syntax, thread shape, both edition keys, unique IDs, 1–88 coordinates, preface verbatim content/hash/count and final character reproducibility PASS.
- App build/public integration and production checks deferred to a separately authorized integration; no shared source, manifests, tests, cover, brand or author-image assets changed.

## Asset SHA-256

- `app/public/data/characters/middlemarch.v1.json`: `a928dcbbb3fa1c870369b83193f498ace28415bddb97b11268f6af2b9db9f092`
- `app/src/data/prefaces/middlemarch.txt`: `b4ed1540c3a0e9d4ccce1997880b963fc5e7b2cc41e3e2d21e287be59f7d0da9`
- `app/public/lab/library_2/intro-data/middlemarch.json`: `885fd9b687131156fb71618fd7e16e44f3245d296e8303f3f94b62d4c7489d25`
- `app/public/data/editions/middlemarch-threads.json`: `c07c4d7a055dc89f55b473dd6ff1ee8a7b4b52ef0f71f3bc78524d90bbbe1bbf`
