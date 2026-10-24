# The Merry Adventures of Robin Hood (Pyle) — content handoff

- Branch: `claude/inspiring-ritchie-zi00fu` (content-only; no PR, no merge, no deploy).
- Package: `books/wip/merry-adventures-of-robin-hood/`; pinned source: `books/raw/merry-adventures-of-robin-hood/`.
- Instruction revision: `books/BOOK-TASK-WORKFLOW.md` and `books/README.md` as checked out on 2026-10-21; the Danish scope for this package was requested by Anders in this session (2026-10-21) and overrides the README’s Danish note for this book only.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** English editions passed the gate and an independent helper review; Danish passed a full helper review but not a native read.
- Published: **NO**. No app, registry, live data, audio, tool, test or config edits.

## Contents

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/merry-adventures-of-robin-hood-original-en.json` | 23 | 1690 | 110,761 | `5b60ba33d29c57bde1ee1d8abc7c2762db7fb9a6619800afd2d2316e19d229ac` |
| `editions/merry-adventures-of-robin-hood-modern-en.json` | 23 | 1690 | 107,672 | `ecd17d89f666ae143625c3b77b6d1bfbec097ab5f9bf0bc0f50388d885fbf06f` |
| `editions/merry-adventures-of-robin-hood-modern-da.json` | 23 | 1690 | 105,700 | `0293dedda342dc9357adca365b21555f04ad3924992e7667cca033e910f96d45` |

Also: `onboarding/merry-adventures-of-robin-hood.json` (draft: About, 3 why-it-matters, 4 angle cards; `acclaim` and `cast` empty), `SOURCE.md`, `taxonomy.md`, `review/REVIEW.md`, `review/DANISH-NOTES.md`, `review/danish-fixed-paragraphs.json`, `review/SHA256SUMS.txt`.

Verify from the repository root: `shasum -a 256 -c books/wip/merry-adventures-of-robin-hood/review/SHA256SUMS.txt`.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/merry-adventures-of-robin-hood/editions/merry-adventures-of-robin-hood" --gate   # GATE PASS
for f in books/wip/merry-adventures-of-robin-hood/editions/*.json books/wip/merry-adventures-of-robin-hood/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

Structure check (scratch script, not committed): all three editions have 23 chapters with `number`, `title`, `paragraphs`, `sections: []`; 1690 paragraphs each, equal per chapter; `\n` counts equal between `modern-en` and `modern-da` paragraph by paragraph.

## Decisions for Anders

- None specific to this book beyond the shared items below.
- Shelf: existing shelf proposed (see taxonomy.md).
- Open Bible Stories (unfoldingWord) was **not** produced: its CC BY-SA 4.0 licence is share-alike and would bind the derivative editions, so it needs your decision.

## Remaining issues

- No native Danish read; reviewer replacements were not re-verified.
- No acclaim quote, characters or threads.
- Onboarding is English only.
- See `review/REVIEW.md` and `review/DANISH-NOTES.md`.
