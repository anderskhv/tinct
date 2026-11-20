# The Wind in the Willows (Grahame) — content handoff

- Branch: `claude/inspiring-ritchie-zi00fu` (content-only; no PR, no merge, no deploy).
- Package: `books/wip/wind-in-the-willows/`; pinned source: `books/raw/wind-in-the-willows/` (`pg289.txt`).
- Instruction revision: `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `books/AGENTS.md`, `books/CLAUDE.md`, `STRATEGY.md` and `docs/workflow-boundaries.md` as on `origin/main` commit `6c41c34ab7f838b5b8c3ddef1dce58c196d9e754`, read on 2026-11-19. The Danish edition was requested by Anders in this session (2026-11-19) and overrides the README’s Danish note for this book only.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** English editions passed the gate and an independent helper review; Danish passed a full helper review but not a native read.
- Published: **NO**. No app, registry, live data, audio, tool, test or config edits. Not released, as requested.

## Contents

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/wind-in-the-willows-original-en.json` | 12 | 916 | 58,290 | `3d20f6d2711282404ca5a2ce7bcaf8bea31d0ee170d582ee854f46624e23dd21` |
| `editions/wind-in-the-willows-modern-en.json` | 12 | 916 | 59,049 | `de3e7fadc27d3f5fff0d263a6f8d19f1333b09e52ffe9d642fe7f712262aba94` |
| `editions/wind-in-the-willows-modern-da.json` | 12 | 916 | 60,238 | `f2ace210bdc89bbd10ad4b26d3e85df93d775f4a8674ba64aae906a4a980b46e` |

Also: `onboarding/wind-in-the-willows.json` (draft: About, 3 why-it-matters, 4 angle cards; `acclaim` and `cast` empty), `SOURCE.md`, `taxonomy.md`, `INTEGRATION.md`, `review/REVIEW.md`, `review/DANISH-NOTES.md`, `review/english-fixed-paragraphs.json`, `review/danish-fixed-paragraphs.json`, `review/SHA256SUMS.txt`.

Verify from the repository root: `shasum -a 256 -c books/wip/wind-in-the-willows/review/SHA256SUMS.txt`.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/wind-in-the-willows/editions/wind-in-the-willows" --gate   # GATE PASS (0.618)
for f in books/wip/wind-in-the-willows/editions/*.json books/wip/wind-in-the-willows/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

Structure check (scratch script, not committed): all three editions have 12 chapters with `number`, `title`, `paragraphs`, `sections: []`; 916 paragraphs each, equal per chapter; `\n` and `_` counts equal between `modern-en` and `modern-da` paragraph by paragraph.

## Decisions for Anders

- **Scope:** `STRATEGY.md` lists “Kids editions” (dropped 2026-03-25) as out of scope, and `CLAUDE.md` says never to generate children’s editions. This is the complete original book in a modern rendering for general readers (not a simplified or abridged children’s edition), prepared at your request. Confirm before it is integrated.
- **Danish:** requested by you; `STRATEGY.md` says Danish is no longer a requirement. Publish or hold the Danish edition as you prefer.
- **Rights:** gutenberg.org’s catalogue page was down on 2026-11-19; the text came from the pglaf Project Gutenberg mirror. Confirm the catalogue entry before release (see `SOURCE.md`).
- **Shelf:** existing shelf proposed (see `taxonomy.md`).

## Remaining issues

- No human editor read of `modern-en`; no native Danish read; reviewer replacements were not re-verified.
- Songs and verse: Danish rhymes are loose in places.
- No acclaim quote, characters or threads.
- Onboarding is English only.
- See `review/REVIEW.md` and `review/DANISH-NOTES.md`.
