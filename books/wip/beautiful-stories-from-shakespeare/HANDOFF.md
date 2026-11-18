# Beautiful Stories from Shakespeare (Nesbit) — content handoff

- Branch: `claude/inspiring-ritchie-zi00fu` (content-only; no PR, no merge, no deploy).
- Package: `books/wip/beautiful-stories-from-shakespeare/`; pinned source: `books/raw/beautiful-stories-from-shakespeare/`.
- Instruction revision: `books/BOOK-TASK-WORKFLOW.md` and `books/README.md` as checked out on 2026-10-21; the Danish scope for this package was requested by Anders in this session (2026-10-21) and overrides the README’s Danish note for this book only.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** English editions passed the gate and an independent helper review; Danish passed a full helper review but not a native read.
- Published: **NO**. No app, registry, live data, audio, tool, test or config edits.

## Contents

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/beautiful-stories-from-shakespeare-original-en.json` | 22 | 1194 | 42,566 | `12686aeb1c9d24ccf73b27e57eb48f2b38917d67fbadc74e33951cb273610ce5` |
| `editions/beautiful-stories-from-shakespeare-modern-en.json` | 22 | 1194 | 43,030 | `c7e35c4ad3798f9349773874e2ff8cea98fc297c8acca61a699ba1012c42cd83` |
| `editions/beautiful-stories-from-shakespeare-modern-da.json` | 22 | 1194 | 43,593 | `7827b1c2ecd924a7f06c5b512d2c2fc828367ef1e697891fd4428eeb97fe1441` |

Also: `onboarding/beautiful-stories-from-shakespeare.json` (draft: About, 3 why-it-matters, 4 angle cards; `acclaim` and `cast` empty), `SOURCE.md`, `taxonomy.md`, `review/REVIEW.md`, `review/DANISH-NOTES.md`, `review/danish-fixed-paragraphs.json`, `review/SHA256SUMS.txt`.

Verify from the repository root: `shasum -a 256 -c books/wip/beautiful-stories-from-shakespeare/review/SHA256SUMS.txt`.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/beautiful-stories-from-shakespeare/editions/beautiful-stories-from-shakespeare" --gate   # GATE PASS
for f in books/wip/beautiful-stories-from-shakespeare/editions/*.json books/wip/beautiful-stories-from-shakespeare/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

Structure check (scratch script, not committed): all three editions have 22 chapters with `number`, `title`, `paragraphs`, `sections: []`; 1194 paragraphs each, equal per chapter; `\n` counts equal between `modern-en` and `modern-da` paragraph by paragraph.

## Decisions for Anders

- None specific to this book beyond the shared items below.
- Shelf: a new shelf is proposed (see taxonomy.md).
- Open Bible Stories (unfoldingWord) was **not** produced: its CC BY-SA 4.0 licence is share-alike and would bind the derivative editions, so it needs your decision.

## Remaining issues

- No native Danish read; reviewer replacements were not re-verified.
- No acclaim quote, characters or threads.
- Onboarding is English only.
- See `review/REVIEW.md` and `review/DANISH-NOTES.md`.
