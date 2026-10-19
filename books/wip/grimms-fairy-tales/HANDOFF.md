# Grimms’ Fairy Tales — content handoff

- Branch: `claude/inspiring-ritchie-zi00fu` (content-only; no PR, no merge, no deploy).
- Package: `books/wip/grimms-fairy-tales/`; pinned source: `books/raw/grimms-fairy-tales/`.
- Instruction revision: `books/BOOK-TASK-WORKFLOW.md` and `books/README.md` as on `origin/main` at checkout (95e9a35ba); the stated Danish scope for this package was assigned by Anders in this session (2026-10-19) and overrides the README’s Danish note for this book only.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** English editions passed the gate and an independent helper review; Danish passed a full helper review but not a native read.
- Published: **NO**. No app, registry, live data, audio, tool, test or config edits.

## Contents

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/grimms-fairy-tales-original-en.json` | 65 | 902 | 100,401 | `e5aeb318c7ed1e44202f57ec7b7303958823ec63909ca69538fe26bb151a95f3` |
| `editions/grimms-fairy-tales-modern-en.json` | 65 | 902 | 95,492 | `679ab684eaf90eb7cfdd30a869d97f865aba6e0c5aff77951386ca16c7eba6ab` |
| `editions/grimms-fairy-tales-modern-da.json` | 65 | 902 | 93,183 | `53550b14b49833ff6a26d746d6c7cc989009e3133876123e8b146ef907f4ef70` |

Also: `onboarding/grimms-fairy-tales.json` (draft: About, 3 why-it-matters, 4 angle cards; `acclaim` and `cast` empty), `SOURCE.md`, `taxonomy.md`, `review/REVIEW.md`, `review/DANISH-NOTES.md`, `review/danish-fixed-paragraphs.json`, `review/danish-rereview-2026-10-19.json`, `review/SHA256SUMS.txt`.

Verify from the repository root: `shasum -a 256 -c books/wip/grimms-fairy-tales/review/SHA256SUMS.txt`.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/grimms-fairy-tales/editions/grimms-fairy-tales" --gate   # GATE PASS
for f in books/wip/grimms-fairy-tales/editions/*.json books/wip/grimms-fairy-tales/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

Structure check (scratch script, not committed): all three editions have 65 chapters with `number`, `title`, `paragraphs`, `sections: []`; 902 paragraphs each, equal per chapter; `\n` counts equal between `modern-en` and `modern-da` paragraph by paragraph.

## Remaining issues

- No native Danish read. On 2026-10-19 the 108 reviewer replacements were re-verified (70 corrected) and the whole Danish edition got a read-aloud pass (317 paragraphs changed in total); see `review/REVIEW.md` and `review/danish-rereview-2026-10-19.json`.
- No acclaim quote, characters or threads; taxonomy proposes a new Shelf that needs approval.
- Onboarding is English only; no Danish onboarding was written.
- See `review/REVIEW.md` and `review/DANISH-NOTES.md`.
