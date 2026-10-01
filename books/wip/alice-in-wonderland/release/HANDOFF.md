# Alice release assets — staged handoff

Base: `8cfe39e709250a7c53942dcb6a582b360d132335`, fetched `origin/integration/release-candidate-2`.
Policy read at `origin/main` `c268646674fed34ef73cf8ecf32d7c54ebabce40`; task's explicit authorization governs per-book authoring/runtime paths. Isolated worktree used in the supplied workspace; documented Developer/Tinct fallback does not exist.

## Characters

- 31 proposed identities, all present in both editions; 1,090 original and 1,091 modern mentions.
- 12 chapters / 789 paragraphs per edition. First mentions match all 31 proposal coordinates in both editions.
- Original SHA-256: `aec5399bf14ddb6c6e84aadda4ada12a36201f48fc1f12f992e1f60b4e88f226`.
- Modern SHA-256: `a984c60b3a2a81e5b64fa539230efca79fd77929fc5fffe0aea4d3d3605bcd4d`.
- Baseline generated with `python3 books/characters/build_generic.py alice-in-wonderland`; final package assembled through unchanged `build_reviewed.compile_package` using `entities/alice-in-wonderland.py:bind` and per-book `editorial.json`. Generic output alone is not the release asset: it cannot restrict contextual matches or delay reveals.
- 13 delayed snapshots per edition: Dinah's identity, Bill's species and juror role, Duchess appearance, baby/pig continuity, Cheshire name, Hatter and March Hare appearances, Queen's full name/appearance, King's judicial role, Knave's crown-bearing and accusation, Mock Turtle appearance. Gates are paragraph ends, with zero-based `after` paragraph indices.
- Rabbit/Cat/Queen/King aliases are case-sensitive phrases, not bare global words. Two/Five/Seven match only in chapter 8. Pig only at 6:49 and 6:73, after 6:48. Judge/prisoner aliases start after identifying paragraphs. Mary Ann/Ada/Mabel/Serpent are never Alice aliases. The royal cook at 8:7 is not merged with the Duchess's cook. The sister imagining Alice at 12:71 does not generate a false sister binding.
- Final source/runtime copies are byte-identical. Existing character suite: 6 files, 497 tests PASS. Separate in-memory runtime registration verifies both new editions, all mention offsets/hashes, 62 first-mention boundaries, 26 delayed-snapshot boundaries, unsafe-alias exclusions and source-drift rejection. No test or shared registry file edited.

Rebuild final characters from repository root:

```python
import sys, importlib, json, shutil
from pathlib import Path
sys.path.insert(0, 'books/characters')
from build_reviewed import compile_package
m = importlib.import_module('entities.alice-in-wonderland')
asset, report, _ = compile_package(m.BOOK_ID, m.bind)
p = Path('books/characters/alice-in-wonderland/characters.v1.json')
p.write_text(json.dumps(asset, ensure_ascii=False, indent=2) + '\n')
p.with_name('validation-report.json').write_text(json.dumps(report, indent=2) + '\n')
shutil.copyfile(p, 'app/public/data/characters/alice-in-wonderland.v1.json')
```

## Review limits / integration

- Authoring-agent review only; new prose still merits independent editorial review. No runtime browser/visual acceptance or public release claimed.
- Named cast coverage, not pronouns/every generic description. Optional inset-story, historical and minor figures remain outside this 31-identity package. Lowercase species and ambiguous ranks intentionally remain unlinked except reviewed scoped first appearances.
- Paragraph-end gates are conservative: clicking the reveal name before its paragraph ends can retain the previous safe card until the next mention.
- Apply characterReleases-entry.txt only in the separately owned integration lane. Keep the book out of BOOKS.
- Carry forward INTEGRATION.md: original is Gutenberg Millennium Fulcrum Edition 3.0; no first-impression claim. Missing picture/frontispiece references at 9:43 / 11:3; verse/underscore reader visual QA remains. Prior extra verse-review coordinates: 10:25, 10:26, 10:59, 10:70, 12:45, 12:46; not re-approved by this asset task.

## Introduction

- Library preface reproduces the existing onboarding `about` verbatim, plus a final newline.
- `manifest-entry.json`: 213 whitespace-delimited words; SHA-256 `c262a37489ac584fbc8a69de39114642ccbbc8b097e57c597baa1b453bdc6242`. Hash covers exact UTF-8 text bytes including the final newline.
- Intro JSON matches the existing to-the-lighthouse shape: author biography, hook, four preface paragraphs and orientation. Hook matches `reviewedHooks-entry.txt`. New introduction copy is authoring-agent reviewed, not independently approved.
- Integrator: append manifest entry to `docs/design/library-prefaces/manifest.json` and hook property to `reviewedHooks` in `app/public/lab/library_2/reviewed-introductions.js`. Neither shared file was edited.
