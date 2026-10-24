# Lincoln: The Gettysburg Address and the Second Inaugural Address — content handoff

- Branch: `claude/inspiring-ritchie-zi00fu` (content-only; no PR, no merge, no deploy).
- Package: `books/wip/lincoln-gettysburg-second-inaugural/`; pinned source: `books/raw/lincoln-gettysburg-second-inaugural/`.
- Instruction revision: `books/BOOK-TASK-WORKFLOW.md` and `books/README.md` as checked out on 2026-10-21; the Danish scope for this package was requested by Anders in this session (2026-10-21) and overrides the README’s Danish note for this book only.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** English editions passed the gate and an independent helper review; Danish passed a full helper review but not a native read.
- Published: **NO**. No app, registry, live data, audio, tool, test or config edits.

## Contents

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/lincoln-gettysburg-second-inaugural-original-en.json` | 2 | 11 | 964 | `15a144e532edfb4210fdf1138bd9bd34902ed598fe540b0f94160ea468800947` |
| `editions/lincoln-gettysburg-second-inaugural-modern-en.json` | 2 | 11 | 976 | `fab19f4830e355762f923c2f57f5fc60cb23da78408c82e8e4fd5f283c1dc89f` |
| `editions/lincoln-gettysburg-second-inaugural-modern-da.json` | 2 | 11 | 970 | `f6589d8192ffc726c5f2f1917823b26c4233795b4ed76101f5ba98bb5d904e35` |

Also: `onboarding/lincoln-gettysburg-second-inaugural.json` (draft: About, 3 why-it-matters, 4 angle cards; `acclaim` and `cast` empty), `SOURCE.md`, `taxonomy.md`, `review/REVIEW.md`, `review/DANISH-NOTES.md`, `review/danish-fixed-paragraphs.json`, `review/SHA256SUMS.txt`.

Verify from the repository root: `shasum -a 256 -c books/wip/lincoln-gettysburg-second-inaugural/review/SHA256SUMS.txt`.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/lincoln-gettysburg-second-inaugural/editions/lincoln-gettysburg-second-inaugural" --gate   # GATE PASS
for f in books/wip/lincoln-gettysburg-second-inaugural/editions/*.json books/wip/lincoln-gettysburg-second-inaugural/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

Structure check (scratch script, not committed): all three editions have 2 chapters with `number`, `title`, `paragraphs`, `sections: []`; 11 paragraphs each, equal per chapter; `\n` counts equal between `modern-en` and `modern-da` paragraph by paragraph.

## Decisions for Anders

- None specific to this book beyond the shared items below.
- Shelf: existing shelf proposed (see taxonomy.md).
- Open Bible Stories (unfoldingWord) was **not** produced: its CC BY-SA 4.0 licence is share-alike and would bind the derivative editions, so it needs your decision.

## Remaining issues

- No native Danish read; reviewer replacements were not re-verified.
- No acclaim quote, characters or threads.
- Onboarding is English only.
- See `review/REVIEW.md` and `review/DANISH-NOTES.md`.
