# Audio word-timing tokenizer normalisation — run 2, part A

September 11, 2026. Branch `claude/audio-normalisation-20260911`. Implements
the normalisation approved in `DECISIONS.md` (row 2026-09-11, "Audio word-timing
tokenizer normalisation approved"). Code, tests and a CPU canary only: no GPU,
no RunPod, no R2 write, no Anthropic API call, nothing under `app/src/`.
Evidence is in `artifacts/audio-normalisation-2026-09-11/`.

## What changed

The verbatim `f5b23de7` helper is untouched. A second pinned revision sits
beside it and `trial.py` selects between them.

| file | change |
| --- | --- |
| `tools/audio-highlight/aligner/pinned_words_sidecar_lib_v2.py` | New. Copy of v1 with a revision note in the module docstring (lines 6–22) and one block replaced: the body of `align_tokens_with_stats` (v1 lines 117–181) becomes lines 134–397. Everything else — `clean_text`, `chapter_words_from_text`, `normalize_token`, `canonical_alignment_token`, biasing, `validate_sidecar`, `build_sidecar` — is byte-for-byte v1. |
| `…/pinned_words_sidecar_lib_v2.py:142-149` | Patterns: footnote marker (`[28]`, `[Greek: …]`, `[Footnote: …]`), spaced-ellipsis piece, hyphen-only token, hyphen run. |
| `…/pinned_words_sidecar_lib_v2.py:152-207` | `strip_expected_markup`, `expected_comparison_keys` — expected-side only. Underscores removed; footnote markers removed, including markers that span several whitespace tokens; a run of standalone `.` tokens (spaced ellipsis) and a standalone `--` token become `None` = never spoken, excluded from the comparison. Any token without markup keeps exactly its v1 key. |
| `…/pinned_words_sidecar_lib_v2.py:210-216` | `expected_compound_pieces` — canonical pieces of a hyphenated token (`wage-labour.` → `wage`, `labour`; `lieth--and` → `lieth`, `and`). |
| `…/pinned_words_sidecar_lib_v2.py:245-310` | `_join_split_compounds` — inside each unresolved `replace` block of the first alignment, adjacent heard pieces that spell one of that block's compounds are joined into one heard token running from the first piece's start to the last piece's end. Nothing outside an unresolved block is touched. |
| `…/pinned_words_sidecar_lib_v2.py:313-381` | `align_tokens_detailed` — v1 alignment over the spoken keys, re-run once if any compound was joined; v1 interpolation and monotonic clamp verbatim; returns words, stats, opcodes, the spoken/unspoken index lists, the observed map, the compared heard list and the merges. `align_tokens_with_stats` (384) delegates to it. |
| `tools/audio-highlight/aligner/trial.py:9-14` | `HELPERS`, `DEFAULT_HELPER='v2'`, `select_helper()`. |
| `…/trial.py:36-45` | `attempt()` uses `align_tokens_detailed` when the selected helper has it and records `spoken_expected_indexes`, `unspoken_expected_indexes`, `compared_heard` and `merges` in the diagnostic; provenance gains the source `unspoken`. Under `--helper v1` the original inline computation runs unchanged. |
| `…/trial.py:106` | `--helper v1|v2` (default `v2`); the worker subprocess inherits it through `sys.argv`. |
| `…/trial.py:119` | `run.json` records `helper_pin`, `helper_module`, `helper_sha256`. Per-paragraph checkpoints already hash the helper into their signature, so a checkpoint from one pin is never reused under the other. |
| `tools/audio-highlight/aligner/PINS.md` | New. Both hashes and what each pin is. |
| `tools/audio-highlight/aligner/test_normalisation.py` | New, 23 cases (below). |
| `tools/audio-highlight/aligner/test_trial.py` | `test_exact_helper_pin` now hashes `pinned_words_sidecar_lib` by name (it used to hash `trial.lib`, which is now the default v2 pin) and additionally asserts `select_helper('v1')` returns that module. The other 10 cases are unchanged and run against the v2 default. |
| `tools/audio-highlight/aligner/README.md` | Helper-revisions section. |

### Pin hashes

| pin | file | SHA-256 |
| --- | --- | --- |
| `v1` | `pinned_words_sidecar_lib.py` | `0aa529e6386379bdebe8ac5b7f45997763aecf9fdcb63ecf47c52dced1958d8c` (= `git show f5b23de7:app/tts/words_sidecar_lib.py`, asserted by `test_trial.py`) |
| `v2` | `pinned_words_sidecar_lib_v2.py` | `74ecf6d16d5d6afec5f7a8440765dbe25c09043aa3309b85931fdb3c0c3f6da8` (asserted against `PINS.md` by `test_normalisation.py`) |

Model pin for every run below: `Systran/faster-whisper-small.en`, tree SHA-256
`f1fe271c349229677131d389a96d0a28062a6a2c2fee54a8ce119c43538315c5` — the same
value the run-1 CPU canary recorded, recomputed here from a fresh download.

### What the rules do and do not do

- The 0.85 gate is unchanged (`trial.GATE`, asserted by
  `GateUnchanged.test_gate_still_85_and_applied_to_spoken_tokens`).
- No timestamp or confidence is synthesised. Tokens excluded as unspoken are
  still emitted — one timing per rendered whitespace token, as the reader
  requires — with the v1 interpolation rule, and count neither as matched nor
  as expected. A joined compound's timing is the recogniser's own start of the
  first piece and end of the last piece.
- Bracket stripping is limited to footnote-marker shapes: `[` digits `]`, or
  `[` label `:` … `]`. Run-1 diagnostics show Kokoro narrates bracket
  contents (`[28] Luciani [Greek: eunouchos].` was heard "28 Luciani, Greek.
  You now chose."; `[4] Cause and effect.` was heard "For cause and effect.").
  The bracket characters are the markup; the marker text is dropped from the
  comparison as approved. Stage directions such as `[Re-enter Boatswain]`
  (2,928 bracketed spans in the English originals are of that kind) are
  narrated and stay in the comparison; stripping them would let a paragraph
  pass at 1.0 with no observed word.
- Compound joining is driven by the expected text and happens only inside an
  unresolved block of the first alignment, so `as well being … well-being`
  joins the compound and leaves the separate words alone
  (`HyphenCompounds.test_pieces_outside_an_unresolved_block_are_not_joined`).
  A different spelling is not joined: heard `wage labor.` against
  `wage-labour.` stays at 0.8.
- Single-hyphen tokens (`a - b`), a lone em dash, a lone `.` outside a run:
  unchanged v1 behaviour (an empty key that counts as expected and never
  matches). Em-dash-glued words (`want—I`) are a class the decision did not
  name; not implemented, see "Not done".

## Tests

```
$ python3 -m unittest discover -s tools/audio-highlight -p 'test_*.py'
Ran 18 tests … OK            # test_runpod_guard.py (the aligner directory is not a package, so this command never reached test_trial.py)
$ python3 -m unittest discover -s tools/audio-highlight/aligner -p 'test_*.py'
Ran 34 tests … OK            # test_trial.py 11 cases + test_normalisation.py 23 cases
```

`test_normalisation.py`, per class, positive and negative:

- **Underscores** — `_To Mrs. Saville, England._` matches 4/4 under v2 and 2/4
  under v1; a token that differs in more than its underscores still fails.
- **Brackets** — `[28]`, `[4]`, `word[3],` and a multi-token
  `[Footnote: …]` removed and excluded from the ratio while still timed;
  `[Re-enter Boatswain]`, `[Enter Roderigo and Iago.]`, `[the halibut]`
  remain expected words.
- **Ellipses and dashes** — `more. . . .`, `Jason. . . . Who`, `. . .,`
  excluded; a lone `—` or `.` keeps its v1 key; standalone `--` / `------`
  excluded, `a - b` unchanged; `lieth--and … king--both` joins the heard
  pieces with the spanning timing; v1 on the same input counts the pieces as
  mismatches.
- **Hyphen compounds** — `wage-labour.` joined from `wage` `-labour.` with
  timing 0.8–1.2 (first start, last end); one-token paragraph
  `Fellow-rulers.`; repeated and three-piece compounds; an unsplit
  `heartbroken` still matches directly with no merge; a different spelling
  is not joined; pieces outside an unresolved block are not joined; a
  compound the recogniser missed stays interpolated (no synthesised timing).
- **Gate** — 17/20 passes and 16/20 fails exactly as before; a `[1]` marker
  in front of the 20 does not change the denominator's effect on the gate.
- **Pins** — both hashes present in `PINS.md`; default is v2 and v1 is
  selectable; a 41-token paragraph without markup produces identical words
  and stats under both helpers, through `trial.attempt` under both pins.

## Canary

Invocation, as the run-1 CPU canary: `trial.py --input … --output … --model-path …
--model-sha256 f1fe271c… --device cpu --compute-type int8 --arms off auto
--max-seconds 3300 --run`, plus `--helper v1` or `--helper v2`. Same host
class as run 1's canary (Linux 6.18.44, Python 3.11.15, faster-whisper 1.2.1,
ctranslate2 4.8.2, 4 vCPU). Cohort built by `cloud_cohort.py` from tinct.app's
public routes, no credentials; for `frankenstein/original-en/ch3` every
paragraph's audio SHA-256, text and decoded duration equal the run-1 canary's
`cohort.json`. `artifacts/audio-normalisation-2026-09-11/run-canary.log` has
the timings; each run's `run.json` records the pin and helper hash.

### frankenstein/original-en ch3 (the run-1 canary)

| | off arm | auto arm |
| --- | --- | --- |
| run 1 (v1, other host) | rejected: p0 0.50, p8 0.00; chapter 291/298 | rejected: p0 0.75, p8 0.00; 294/298 |
| this host, `--helper v1` | rejected: p0 0.50, p8 0.00; 290/298 | rejected: p0 0.75, p8 0.00; 295/298 |
| this host, `--helper v2` | rejected: **p0 1.00**, p8 0.00; 293/298 | rejected: **p0 1.00**, p8 0.00; 297/298 |

**Byte-identity to the run-1 candidate does not hold, and the reason is the
recogniser, not the helper.** The v1 control run on this host already differs
from run 1 in five paragraphs that carry no markup at all (p3–p7): different
heard-word counts and timestamps from the same audio and the same model bytes
(e.g. p5 28/28 in run 1, 27/28 here; p6 auto arm 53 heard words there, 80
here). Two runs on *this* host give identical heard words for the `off` arm
(checked word for word on p3, p5, p6), so the drift is between hosts — int8
CPU kernels and, on the `auto` arm, Whisper's temperature fallback. The
helper's byte-identity is therefore proved by replay of recorded heard words
(next section) rather than by re-recognition.

What v2 changes on this host, against the v1 run with identical heard words:
p0 `_To Mrs. Saville, England._` goes from 2/4 to 4/4, all four observed; p6
gains one word (`_shall_`). p8 `R.W.` — one expected token, heard `R` `.W.` —
is initials, not a hyphen compound, and stays at 0.0. The chapter therefore
stays rejected under v2; that is the correct outcome for the rules as
approved. Every other paragraph is byte-identical between the v1 and v2 runs.

### macbeth/original-en ch1 (published sidecar)

- `--helper v1` and `--helper v2` candidates are **byte-identical** on both
  arms (`off` `10318749…`, `auto` `7a11390a…`). The chapter has no underscore,
  footnote marker, ellipsis, double hyphen or hyphenated word.
- `auto` arm: 12/12 paragraphs at 1.00, 87/87 words observed,
  `candidate_requires_acoustic_review`, `validation_errors: []`.
- `verify_timings.py` on the published sidecar: pass, worst paragraph 1.0
  (`verify-macbeth-published.json`). The same five checks run over the v2
  candidate (`tools/verify_candidate.py` substitutes the local file for the
  fetched sidecar, everything else from production): **pass** on both arms,
  12 paragraphs, 87 words, worst ratio 1.0
  (`verify-macbeth-candidate-{off,auto}.json`).
- Against the published words: token texts identical in all 12 paragraphs;
  6 of 12 paragraphs have identical timings; the largest start-time
  difference is 0.02 s (published sidecar came from the pilot's GPU run).
- The `off` arm on CPU rejects p4 and p7 at 0.80 under both pins — a plain
  pass recognition miss that the `auto` arm resolves, unrelated to this
  change.

### communist-manifesto/original-en ch3 (run-1 rejection, hyphen class)

Run 1 (pod `tinct-words-run1-1`, GPU) rejected it on both arms for one
paragraph: p19 `Let us now take wage-labour.` at 0.80. On this host under v2:

| arm | status | p19 | chapter |
| --- | --- | --- | --- |
| off | rejected (p19 only) | 0.80 — heard `wage` `labor.`; US spelling, not joined | 3105/3167 = 0.9804 |
| auto | **candidate_requires_acoustic_review** | **1.00** — heard `wage` `-labour.` joined, timed 1.09–1.65 s | 3158/3167 = 0.9972, `validation_errors: []` |

The `--helper v1` control on this host reproduces run 1's outcome (rejected on
both arms, p19 only, 0.80). Its `off`-arm heard words are identical to the v2
run's in 83 of 83 paragraphs, so the candidate differences between the pins
are alignment only: 13 paragraphs differ on the `off` arm (p1, 4, 5, 7, 13,
16, 18, 26, 28, 29, 49, 51, 52), every one carrying a hyphen compound (10) or
underscore emphasis (4) — checked by replaying the v1 run's recorded heard
words through both helpers (`replay-local.json`: 374 of 374 attempts without
a class byte-identical, 0 attempts with a lower ratio under v2). The other 70
paragraphs are byte-identical. Chapter ratio `off` 0.9751 → 0.9804, `auto`
0.9893 → 0.9972.

### Replay of every run-1 recorded recognition

Run-1 pods kept the full diagnostic (heard words with timestamps, every bias
attempt) for the 39 rejected chapters and 4 worker-cap-truncated ones: 11,214
paragraph files, 13,987 attempts. `tools/replay.py` feeds each attempt's
recorded heard words through both helpers with no audio or model involved
(`replay-run1.json`):

| check | result |
| --- | --- |
| v1 replay reproduces the recorded candidate words and stats | **13,987 / 13,987** |
| attempts whose paragraph carries none of the four classes | 10,694 |
| … of which byte-identical under v2 (words and stats) | **10,694 / 10,694** |
| attempts carrying a class | 3,293 (hyphen 3,004 · underscore 275 · ellipsis 96 · bracket 42; some carry several) |
| paragraphs that cross the gate upward under v2 | 191 |
| paragraphs that cross the gate downward | **0** |
| attempts where the v2 ratio is lower than v1 | 9, all already far below the gate (v1 max 0.50) — e.g. Hume ch16 `off` arm, where the only spoken token `Luciani` was misheard once the markers were excluded; the `auto` arm passes |
| attempts where v2 counts fewer observed words | 31, all in biased passes; the words "lost" are `.` ellipsis pieces that v1 had matched against empty recogniser tokens (empty key = empty key), e.g. Medea ch4 p4: 508/585 → 499/564, ratio up from 0.868 to 0.885 with six real compounds gained |

Re-deciding each rejected chapter from the same recorded attempts
(`replay-run1-chapters.json`, terminal pod records only): **17 of the 39 pass
on at least one arm under v2** — all 17 on `auto`, 2 of them on `off` as well
— Communist Manifesto 3; Genealogy of Morals 1; Hume 3 and 16; Jekyll 1 and 2;
Jungle Book 1, 2, 6, 7; Medea 7; Midsummer 2; Nicomachean Ethics 1; Republic 2
and 5; Tempest 2 and 6. The other 22 still hold at least one paragraph below
0.85 on their best arm, for reasons outside the four classes: spelled-out
speaker names (Phaedo 1 and 7 — class 4, re-recording); a looped sentence
(Odyssey 3 p37, 0.09); plain recognition misses — contractions (`You are` heard
`You're`, Republic 1 and 3), `vanish'd` heard `vanished` (Tempest 7), `A
fortnight` heard `A Fortnite` (Notes from Underground 17), Latin and French
passages (Second Treatise 19, Beyond Good and Evil 5); an unspaced standalone
`...` token (`"There ... in Riga."`, Notes 17 p24), which is not the spaced
form the decision names; and near misses at 0.82–0.85 (Heart of Darkness 3
p80 0.846, Aeneid 6 p31 0.835, Paradise Lost 1 p10 0.822 and 11 p58 0.833). A
GPU run 2 under v2 is the real measurement; this is the floor it should not
fall under.

## Not done, and why

- **Byte-identity of the frankenstein candidate to run 1's** — not
  achievable from this host, because the recogniser output itself differs
  across hosts before any alignment (see above). The proof of "nothing
  changes without markup" is the same-host pin comparison (Macbeth, both
  arms) plus the 10,694/10,694 replay.
- **Em-dash-glued words** (`safe—and`, `want—I want—something`): the
  recogniser hears two words, v1 and v2 compare one token (`safeand`). Same
  shape as the double-hyphen class but not in the approved list; left for a
  separate decision. It is the one miss in frankenstein ch3 p3 (139/140 on
  both pins).
- **Unspaced standalone `...` token** (`"There ... in Riga."`): the decision
  names spaced ellipses (`. . .`); a lone `...` token keeps its v1 key. Same
  reasoning, same follow-up.
- **Initials** (`R.W.` → heard `R` `.W.`): not a hyphen compound; not
  implemented. Frankenstein ch3 stays rejected on p8 because of it.
- **Publishing** — nothing was uploaded. The Macbeth candidate matches the
  published sidecar to within 0.02 s but is not a replacement for it;
  publication creates and never replaces.
- The top-level `unittest discover -s tools/audio-highlight` command does
  not reach the aligner tests (no package marker); they run from the aligner
  directory as the README now says. Adding `__init__.py` would change how
  `trial.py` is imported by those tests, so it was left alone.
