# The Story of the Odyssey (Church) — “Odyssey for Boys and Girls” — content handoff

- Branch: `claude/inspiring-ritchie-zi00fu` (content-only; no PR, no merge, no deploy).
- Package: `books/wip/odyssey-for-boys-and-girls/`; pinned source: `books/raw/odyssey-for-boys-and-girls/`.
- Instruction revision: `books/BOOK-TASK-WORKFLOW.md` and `books/README.md` as checked out on 2026-10-21; the Danish scope for this package was requested by Anders in this session (2026-10-21) and overrides the README’s Danish note for this book only.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** English editions passed the gate and an independent helper review; Danish passed a full helper review but not a native read.
- Published: **NO**. No app, registry, live data, audio, tool, test or config edits.

## Contents

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/odyssey-for-boys-and-girls-original-en.json` | 25 | 747 | 45,003 | `8a67f2154b14e08b1c1d085e25ba172564525a884fea517e04f206d584924ffa` |
| `editions/odyssey-for-boys-and-girls-modern-en.json` | 25 | 747 | 42,982 | `5fd94995e89d0696dc0e30c3949a0404f761fec1c55d61055edf7b780cf871bf` |
| `editions/odyssey-for-boys-and-girls-modern-da.json` | 25 | 747 | 41,604 | `0a967d5924f1927bf69f10e931b42a2098a8c94288be51de71bd315add6722ad` |

Also: `onboarding/odyssey-for-boys-and-girls.json` (draft: About, 3 why-it-matters, 4 angle cards; `acclaim` and `cast` empty), `SOURCE.md`, `taxonomy.md`, `review/REVIEW.md`, `review/DANISH-NOTES.md`, `review/danish-fixed-paragraphs.json`, `review/SHA256SUMS.txt`.

Verify from the repository root: `shasum -a 256 -c books/wip/odyssey-for-boys-and-girls/review/SHA256SUMS.txt`.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/odyssey-for-boys-and-girls/editions/odyssey-for-boys-and-girls" --gate   # GATE PASS
for f in books/wip/odyssey-for-boys-and-girls/editions/*.json books/wip/odyssey-for-boys-and-girls/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

Structure check (scratch script, not committed): all three editions have 25 chapters with `number`, `title`, `paragraphs`, `sections: []`; 747 paragraphs each, equal per chapter; `\n` counts equal between `modern-en` and `modern-da` paragraph by paragraph.

## Decisions for Anders

- None specific to this book beyond the shared items below.
- Shelf: existing shelf proposed (see taxonomy.md).
- Open Bible Stories (unfoldingWord) was **not** produced: its CC BY-SA 4.0 licence is share-alike and would bind the derivative editions, so it needs your decision.

## Remaining issues

- No native Danish read; reviewer replacements were not re-verified.
- No acclaim quote, characters or threads.
- Onboarding is English only.
- See `review/REVIEW.md` and `review/DANISH-NOTES.md`.
