# Pinned helper revisions

`trial.py --helper <pin>` selects which helper the aligner compares with. All six
are frozen: a change to any of these files is a new pin, never an edit in place.
`test_normalisation.py` fails if these hashes drift; `test_trial.py` checks v1
against the git object it was recovered from.

| pin | file | SHA-256 | what it is |
| --- | --- | --- | --- |
| `v1` | `pinned_words_sidecar_lib.py` | `0aa529e6386379bdebe8ac5b7f45997763aecf9fdcb63ecf47c52dced1958d8c` | Verbatim `f5b23de7` helper (`app/tts/words_sidecar_lib.py` at that commit); the revision the acceptance results and every run-1 publication were measured against. |
| `v2` | `pinned_words_sidecar_lib_v2.py` | `74ecf6d16d5d6afec5f7a8440765dbe25c09043aa3309b85931fdb3c0c3f6da8` | v1 plus the tokenizer normalisation approved in `DECISIONS.md` (2026-09-11): expected-side stripping of underscore emphasis, footnote markers, spaced ellipses and double hyphens; recogniser-split hyphen compounds joined for comparison. Gate, timestamps, interpolation unchanged. |
| `v3` | `pinned_words_sidecar_lib_v3.py` | `302cbd02aad3e57bc91f277069855173b782162a35522eba85e664d14daa49ff` | v2 plus revision-3 gluing (run 3, 2026-09-12): the adjacent recognised tokens that together spell one expected token are joined whatever the separator (em/en dash, apostrophe elision, grouped numeral, closed compound), the mirror case — one recognised token spelling several expected tokens — shares that token's own span between them, and a short explicit contraction table makes `You're` and `You are` the same spelling in both directions. Every join v2 made is still made. Gate, timestamps and interpolation unchanged. |

| `v4` | `pinned_words_sidecar_lib_v4.py` | `c2e8c37d4534e0d81569198069689f494830205ec5161bf330ebf0f03232c773` | v3 plus a narrow source-structure rule for whole-paragraph lettered footnotes written as `a [ text ]`: the lowercase label and standalone opening bracket are excluded from the acoustic denominator while every narrated word remains gated. Ordinary bracketed prose, uppercase/list markers, the 0.85 gate, timestamps and interpolation remain unchanged. |

| `v5` | `pinned_words_sidecar_lib_v5.py` | `4b8d29930ecc43f921dddb34c41647b1dcdfe1e4262e3fd815cb34abf9dd98ed` | v4 plus acoustic-only stripping of cues ASR does not say: ALL-CAPS speaker labels, Enter/Exeunt ALL-CAPS names, `[_…_]` wrappers, WEB `[of]`/`[and]` brackets, superscript verse markers, and a few archaic elisions (`prepar'd`, `Hear'st`, `Th'art`). Emitted source words, the 0.85 gate, timestamps and interpolation remain unchanged. Frozen; `--helper v5` still reproduces canary 35321419398 / PR #101 scoring. |

| `v6` (default) | `pinned_words_sidecar_lib_v6.py` | `8265cca7376d4d03f1bc050583b552a6e04a679c5d214e4066a10b872ea87fab` | v5 plus acoustic-only stripping of unspoken whole-paragraph chapter/section headings: numbered ALL-CAPS labels (`1. REACTIONARY SOCIALISM`), lettered italic subsections (`_C. German, or “True,” Socialism_`), short Roman-numeral titles, `Chapter`/`Part`/`Section`/`Book` labels, short unquoted ALL-CAPS title lines (3+ words, no sentence end), and short italic title lines. Ordinary prose stays in the denominator, including numbered manifesto sentences (`I. Communism is already acknowledged…`) and spoken slogans (`WORKING MEN OF ALL COUNTRIES, UNITE!`). Emitted source words, the 0.85 gate, timestamps and interpolation remain unchanged. The canary workflow and pod default must use `--helper v6` when the next GPU canary is explicitly launched; this pin does not launch GPU work. |

Run manifests (`run.json`) record `helper_pin`, `helper_module` and `helper_sha256`;
per-paragraph checkpoints include the helper hash in their signature, so a checkpoint
made under one pin is never reused under another.
