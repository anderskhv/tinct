# Pinned helper revisions

`trial.py --helper <pin>` selects which helper the aligner compares with. Both are
frozen: a change to either file is a new pin, never an edit in place.
`test_normalisation.py` fails if these hashes drift; `test_trial.py` checks v1
against the git object it was recovered from.

| pin | file | SHA-256 | what it is |
| --- | --- | --- | --- |
| `v1` | `pinned_words_sidecar_lib.py` | `0aa529e6386379bdebe8ac5b7f45997763aecf9fdcb63ecf47c52dced1958d8c` | Verbatim `f5b23de7` helper (`app/tts/words_sidecar_lib.py` at that commit); the revision the acceptance results and every run-1 publication were measured against. |
| `v2` (default) | `pinned_words_sidecar_lib_v2.py` | `74ecf6d16d5d6afec5f7a8440765dbe25c09043aa3309b85931fdb3c0c3f6da8` | v1 plus the tokenizer normalisation approved in `DECISIONS.md` (2026-09-11): expected-side stripping of underscore emphasis, footnote markers, spaced ellipses and double hyphens; recogniser-split hyphen compounds joined for comparison. Gate, timestamps, interpolation unchanged. |

Run manifests (`run.json`) record `helper_pin`, `helper_module` and `helper_sha256`;
per-paragraph checkpoints include the helper hash in their signature, so a checkpoint
made under one pin is never reused under the other.
