# The Story of the Iliad (Church) — “Iliad for Boys and Girls” — content handoff

- Branch: `claude/inspiring-ritchie-zi00fu` (content-only; no PR, no merge, no deploy).
- Package: `books/wip/iliad-for-boys-and-girls/`; pinned source: `books/raw/iliad-for-boys-and-girls/`.
- Instruction revision: `books/BOOK-TASK-WORKFLOW.md` and `books/README.md` as checked out on 2026-10-21; the Danish scope for this package was requested by Anders in this session (2026-10-21) and overrides the README’s Danish note for this book only.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** English editions passed the gate and an independent helper review; Danish passed a full helper review but not a native read.
- Published: **NO**. No app, registry, live data, audio, tool, test or config edits.

## Contents

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/iliad-for-boys-and-girls-original-en.json` | 24 | 675 | 42,708 | `ba6ac86dcec94b85312bb8afcb45c3834f045ac2984833ba9e9adb0ee78121d2` |
| `editions/iliad-for-boys-and-girls-modern-en.json` | 24 | 675 | 41,379 | `cf336e05035b1a032a5bf58b52aa2d546dee61313cd99d8e489750675721b89b` |
| `editions/iliad-for-boys-and-girls-modern-da.json` | 24 | 675 | 39,694 | `bbc513e8fb984967669b4a72b720194c040f33f2d95660585bc429d4fca368f2` |

Also: `onboarding/iliad-for-boys-and-girls.json` (draft: About, 3 why-it-matters, 4 angle cards; `acclaim` and `cast` empty), `SOURCE.md`, `taxonomy.md`, `review/REVIEW.md`, `review/DANISH-NOTES.md`, `review/danish-fixed-paragraphs.json`, `review/SHA256SUMS.txt`.

Verify from the repository root: `shasum -a 256 -c books/wip/iliad-for-boys-and-girls/review/SHA256SUMS.txt`.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/iliad-for-boys-and-girls/editions/iliad-for-boys-and-girls" --gate   # GATE PASS
for f in books/wip/iliad-for-boys-and-girls/editions/*.json books/wip/iliad-for-boys-and-girls/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

Structure check (scratch script, not committed): all three editions have 24 chapters with `number`, `title`, `paragraphs`, `sections: []`; 675 paragraphs each, equal per chapter; `\n` counts equal between `modern-en` and `modern-da` paragraph by paragraph.

## Decisions for Anders

- None specific to this book beyond the shared items below.
- Shelf: existing shelf proposed (see taxonomy.md).
- Open Bible Stories (unfoldingWord) was **not** produced: its CC BY-SA 4.0 licence is share-alike and would bind the derivative editions, so it needs your decision.

## Remaining issues

- No native Danish read; reviewer replacements were not re-verified.
- No acclaim quote, characters or threads.
- Onboarding is English only.
- See `review/REVIEW.md` and `review/DANISH-NOTES.md`.
