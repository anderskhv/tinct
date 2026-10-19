# The Arabian Nights Entertainments (Lang) — content handoff

- Branch: `claude/inspiring-ritchie-zi00fu` (content-only; no PR, no merge, no deploy).
- Package: `books/wip/arabian-nights/`; pinned source: `books/raw/arabian-nights/`.
- Instruction revision: `books/BOOK-TASK-WORKFLOW.md` and `books/README.md` as on `origin/main` at checkout (95e9a35ba); the stated Danish scope for this package was assigned by Anders in this session (2026-10-19) and overrides the README’s Danish note for this book only.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** English editions passed the gate and an independent helper review; Danish passed a full helper review but not a native read.
- Published: **NO**. No app, registry, live data, audio, tool, test or config edits.

## Contents

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/arabian-nights-original-en.json` | 35 | 1826 | 111,099 | `17ea5db0314a10a51ae001a691ae59af098fcee946652ce679d6071f45622d2d` |
| `editions/arabian-nights-modern-en.json` | 35 | 1826 | 107,425 | `386e22ddf5373746e98ccaedbd87fb03b5b756baeafb7c4c0e4a9c6c859a7a2d` |
| `editions/arabian-nights-modern-da.json` | 35 | 1826 | 106,326 | `816253bf78a0f9fe28fdb81194c5bdea05c2d93d2771017bc4100db5c36ffab9` |

Also: `onboarding/arabian-nights.json` (draft: About, 3 why-it-matters, 4 angle cards; `acclaim` and `cast` empty), `SOURCE.md`, `taxonomy.md`, `review/REVIEW.md`, `review/DANISH-NOTES.md`, `review/danish-fixed-paragraphs.json`, `review/SHA256SUMS.txt`.

Verify from the repository root: `shasum -a 256 -c books/wip/arabian-nights/review/SHA256SUMS.txt`.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/arabian-nights/editions/arabian-nights" --gate   # GATE PASS
for f in books/wip/arabian-nights/editions/*.json books/wip/arabian-nights/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

Structure check (scratch script, not committed): all three editions have 35 chapters with `number`, `title`, `paragraphs`, `sections: []`; 1826 paragraphs each, equal per chapter; `\n` counts equal between `modern-en` and `modern-da` paragraph by paragraph.

## Remaining issues

- No native Danish read; reviewer replacements were not re-verified.
- No acclaim quote, characters or threads; taxonomy proposes a new Shelf that needs approval.
- Onboarding is English only; no Danish onboarding was written.
- See `review/REVIEW.md` and `review/DANISH-NOTES.md`.
