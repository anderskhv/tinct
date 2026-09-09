# Position-aware character content

Prepared 2026-09-09 for the approved character-card design. This is an offline content pilot and executable handoff contract, not an installed app feature.

Start with [the implementation handoff](../../docs/design/character-cards-implementation-handoff-2026-09-09.md), [the Awakening pilot](the-awakening/README.md), and [current library coverage](library-coverage.md).

## Content contract

`editorial.json` contains editorial entities, aliases, first-encounter copy and later reminder snapshots. `characters.v1.json` binds that copy to the actual English edition files. Schema version 1 has a book ID, language, content version, normalization policy and an `editions` map. Each edition contains its source fingerprint, normalized paragraph hashes, characters and explicit mention spans. Character IDs are stable within a book; names are display fields of released snapshots, not global labels to show automatically.

A location is `{chapterNumber, paragraphIndex, offset}`: chapter numbers from source, zero-based paragraph indices, JavaScript UTF-16 offsets into the normalized paragraph. Compare locations lexicographically. Prose normalization replaces newlines with spaces and collapses repeated ASCII spaces, matching Reader.tsx. This policy is **not** a general verse/drama normalization; add explicit policies and edition alignment when expanding.

Each character has `firstMention`, independently gated `roleVisibleAt`, and snapshots containing `availableAt`, `name`, `subtitle`, `body`, `evidence` and `editorialBasis`. Each mention contains `characterId`, its chapter/paragraph, start/end offsets, matched text, and resolution provenance. No approximate name matching at runtime. A source change invalidates the binding until reviewed and rebuilt.

At cutoff C, choose the latest snapshot whose `availableAt <= C`; show no card before first mention. Hide the story-role label until its separate gate. The gallery uses the same cutoff. The standalone reference implementation intentionally returns only released fields; do not send future aliases, names or snapshot bodies to rendered components.

Full reminders unlock at paragraph **end**, conservatively avoiding information later in a paragraph. First-encounter cards unlock at the end of the matched name. They provide minimal editorial identification of the figure being introduced, with no later actions or plot outcomes. This is an editorial policy, not a claim that every identification word appears before the selected name. Evidence records locate the source trigger; they are not an independent fact-level proof of every retained sentence. Source review remains necessary.

Story roles are `central`, `major`, `supporting`, `reference`. They express reviewed whole-book narrative weight, separately from current-passage relevance. References, families, recurring unnamed figures and unresolved names have explicit kinds. Do not pretend every entry is an individual fictional character or give family groups duplicate person counts.

## Authoring and verification

Development authoring takes place in the agent conversation and is written to files. These Python programs only compile/review manually authored content; they make no model or network requests.

```sh
python3 books/characters/the-awakening/author_content.py
python3 books/characters/build_pilot.py
python3 books/characters/build_pilot.py --check
python3 -m unittest discover -s books/characters -p 'test_*.py'
python3 books/characters/inventory.py
```

For this pilot, edit the authored declarations in `author_content.py` and `first_look.json`, then rebuild. Do not edit compiled JSON. `cards.md` is an editorial reading copy; `source-review.md` is the evidence worksheet. Both contain spoilers and must never be exposed as the reader gallery. Regenerate reading copies when changing copy.

Ten executable contract tests check source spans in both editions, release boundaries, first-mention role hiding, returning to an earlier passage, edition omissions, stale paragraph rejection, highlight precedence, restricted returned fields and UTF-16 handling. They do not validate factual prose automatically or exercise browser gestures. The coding agent must add focused integration tests.

## Expansion

The registry snapshot lists 100 published books: one content pilot and 99 not started. These are dated observations, not permanent counts. Staged and loose files are excluded. No card is ready for production merely because an existing Threads summary mentions the character.

After the pilot works in the reader, process each published book against its actual editions: inventory names and aliases; decide applicability and entity types; author story roles and spoiler release gates; write first-encounter cards and reminders only when facts materially change; bind exact spans; review ambiguous names and source changes; validate early, middle and late cutoffs; then integrate. Philosophy, scripture and histories need book-appropriate people/reference coverage, not invented novel-style protagonists. Preserve short help for obscure figures. Record omissions explicitly; do not require a rich biography to provide a useful card.

Danish content and bindings are not prepared. Unsupported books/editions keep ordinary selection behavior. No runtime LLM request is needed for a character tap; one prepared asset can serve every reader of that edition.
