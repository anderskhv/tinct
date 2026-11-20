# A Wonder Book and Tanglewood Tales (Hawthorne) — content handoff

- Branch: `claude/inspiring-ritchie-zi00fu` (content-only; no PR, no merge, no deploy).
- Package: `books/wip/wonder-book-and-tanglewood-tales/`; pinned source: `books/raw/wonder-book-and-tanglewood-tales/`.
- Instruction revision: `books/BOOK-TASK-WORKFLOW.md` and `books/README.md` as checked out on 2026-10-21; the Danish scope for this package was requested by Anders in this session (2026-10-21) and overrides the README’s Danish note for this book only.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** English editions passed the gate and an independent helper review; Danish passed a full helper review but not a native read.
- Published: **NO**. No app, registry, live data, audio, tool, test or config edits.

## Contents

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/wonder-book-and-tanglewood-tales-original-en.json` | 14 | 1591 | 117,384 | `6756129af7b3e78c3ecb33686587f8f2a2708ebede2930b0c86b1a29f8bf306e` |
| `editions/wonder-book-and-tanglewood-tales-modern-en.json` | 14 | 1591 | 112,145 | `086e838e109909491ecc43eb8ee0a94a115bb91faa6475b9b52a2770f53767d4` |
| `editions/wonder-book-and-tanglewood-tales-modern-da.json` | 14 | 1591 | 111,826 | `41eea9989a6131b39bd0c53a11135e3028b4677f10482871c83d4c1a24c33ba1` |

Also: `onboarding/wonder-book-and-tanglewood-tales.json` (draft: About, 3 why-it-matters, 4 angle cards; `acclaim` and `cast` empty), `SOURCE.md`, `taxonomy.md`, `review/REVIEW.md`, `review/DANISH-NOTES.md`, `review/danish-fixed-paragraphs.json`, `review/SHA256SUMS.txt`.

Verify from the repository root: `shasum -a 256 -c books/wip/wonder-book-and-tanglewood-tales/review/SHA256SUMS.txt`.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/wonder-book-and-tanglewood-tales/editions/wonder-book-and-tanglewood-tales" --gate   # GATE PASS
for f in books/wip/wonder-book-and-tanglewood-tales/editions/*.json books/wip/wonder-book-and-tanglewood-tales/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

Structure check (scratch script, not committed): all three editions have 14 chapters with `number`, `title`, `paragraphs`, `sections: []`; 1591 paragraphs each, equal per chapter; `\n` counts equal between `modern-en` and `modern-da` paragraph by paragraph.

## Decisions for Anders

- None specific to this book beyond the shared items below.
- Shelf: a new shelf is proposed (see taxonomy.md).
- Open Bible Stories (unfoldingWord) was **not** produced: its CC BY-SA 4.0 licence is share-alike and would bind the derivative editions, so it needs your decision.

## Remaining issues

- No native Danish read; reviewer replacements were not re-verified.
- No acclaim quote, characters or threads.
- Onboarding is English only.
- See `review/REVIEW.md` and `review/DANISH-NOTES.md`.
