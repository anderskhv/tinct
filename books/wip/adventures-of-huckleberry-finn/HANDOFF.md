# Adventures of Huckleberry Finn (Twain) — content handoff

- Branch: `claude/inspiring-ritchie-zi00fu` (content-only; no PR, no merge, no deploy).
- Package: `books/wip/adventures-of-huckleberry-finn/`; pinned source: `books/raw/adventures-of-huckleberry-finn/`.
- Instruction revision: `books/BOOK-TASK-WORKFLOW.md` and `books/README.md` as checked out on 2026-10-21; the Danish scope for this package was requested by Anders in this session (2026-10-21) and overrides the README’s Danish note for this book only.
- Content status: **READY FOR INTEGRATION REVIEW — not accepted by a human editor.** English editions passed the gate and an independent helper review; Danish passed a full helper review but not a native read.
- Published: **NO**. No app, registry, live data, audio, tool, test or config edits.

## Contents

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/adventures-of-huckleberry-finn-original-en.json` | 45 | 2179 | 109,950 | `a4119a1a0d9b04d8d64c25192ec52de15e8590a2e90b05f09f67e33487473f68` |
| `editions/adventures-of-huckleberry-finn-modern-en.json` | 45 | 2179 | 108,866 | `0bf25b67c3739aca3746533e898b81af4873924e920bde08b4ca40a9c0c5f3ad` |
| `editions/adventures-of-huckleberry-finn-modern-da.json` | 45 | 2179 | 112,481 | `cc0f238525f6afa58b113558c6588fd080959137a8dba459ef7caf43e9446695` |

Also: `onboarding/adventures-of-huckleberry-finn.json` (draft: About, 3 why-it-matters, 4 angle cards; `acclaim` and `cast` empty), `SOURCE.md`, `taxonomy.md`, `review/REVIEW.md`, `review/DANISH-NOTES.md`, `review/danish-fixed-paragraphs.json`, `review/SHA256SUMS.txt`.

Verify from the repository root: `shasum -a 256 -c books/wip/adventures-of-huckleberry-finn/review/SHA256SUMS.txt`.

## Gates run

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/adventures-of-huckleberry-finn/editions/adventures-of-huckleberry-finn" --gate   # GATE PASS
for f in books/wip/adventures-of-huckleberry-finn/editions/*.json books/wip/adventures-of-huckleberry-finn/onboarding/*.json; do python3 -m json.tool "$f" >/dev/null; done
```

Structure check (scratch script, not committed): all three editions have 45 chapters with `number`, `title`, `paragraphs`, `sections: []`; 2179 paragraphs each, equal per chapter; `\n` counts equal between `modern-en` and `modern-da` paragraph by paragraph.

## Decisions for Anders

- **Racial term in Huckleberry Finn:** kept verbatim in the English editions (including the title of chapter 33). In `modern-da` it is rendered *sort / de sorte* (and *slave / slaver* where a person is property or on the run; chapter 33 is *En slavetyv*), per Anders's decision of 22 Oct 2026 that Danish modern editions use *de sorte* so readers understand. Confirm a content note before this book is published.
- Shelf: existing shelf proposed (see taxonomy.md).
- Open Bible Stories (unfoldingWord) was **not** produced: its CC BY-SA 4.0 licence is share-alike and would bind the derivative editions, so it needs your decision.

## Remaining issues

- No native Danish read; reviewer replacements were not re-verified.
- No acclaim quote, characters or threads.
- Onboarding is English only.
- See `review/REVIEW.md` and `review/DANISH-NOTES.md`.
