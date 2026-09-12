# Audio word highlighting — run 3

September 12, 2026. Branch `claude/audio-run3-20260912`. Evidence is in
`artifacts/audio-highlight-run3-2026-09-12/`; the live operational state is that
directory's `STATE.md`, rewritten as the run moves.

Run 2 published 934 chapters and completed **zero editions**: sixty-two editions
each stood two or three chapters short, and every one of those chapters failed
the 0.85 gate on a normalisation class rather than on timing. So run 3 starts
with the tokenizer, not with a pod.

## Part A — helper v3

A third pinned revision, `tools/audio-highlight/aligner/pinned_words_sidecar_lib_v3.py`.
v1 and v2 are untouched (their SHA-256s are unchanged and still asserted by the
tests); `trial.py --helper v1|v2|v3` selects, and the default moved to `v3`.

### What it changes

All three of run 2's surviving classes are the same shape: the recogniser and
the edition **agree about the words and disagree about where one token ends**.
v2 already joined the recogniser's pieces for hyphen compounds, matching piece
by piece. v3 compares the whole glued spelling instead — the token's letters and
digits with every separator removed — which covers the hyphen class unchanged
and adds the rest of it:

| class | edition | heard | v2 | v3 |
| --- | --- | --- | --- | --- |
| em/en-dash-glued | `are—enough,` | `Are` `Enough,` | 0/1 | 1/1 |
| elision split at the apostrophe | `He'ld` | `He` `'ld` | 0/1 | 1/1 |
| grouped numeral | `2,186` | `2` `,186` | 0/1 | 1/1 |
| closed compound opened | `heartbroken` | `heart` `broken` | 0/1 | 1/1 |
| hyphen compound (v2's class) | `wage-labour.` | `wage` `-labour.` | 1/1 | 1/1 |

and two rules the same insight requires:

- **The mirror case.** One recognised token spelling several expected tokens —
  `every one` heard `everyone`, `some time` heard `sometime`. The heard token's
  own span is shared between them in proportion to their length; nothing is
  timed outside a span the recogniser reported.
- **Contractions.** `You are` heard `You're` drops letters, so no amount of
  gluing matches it. A short explicit table of standard English contractions
  (`CONTRACTIONS`, 48 entries) makes the contracted and expanded spellings
  equivalent **in both directions** — the same kind of acoustic-equivalence
  table as the `CARDINAL_WORDS` that has always mapped `2` to `two`. Anything
  not in the table is not guessed at (`going to` heard `gonna` still fails).

Guards kept deliberately narrow: a join happens only inside an unresolved
`replace` block of the first alignment, both sides must be at least three
characters (`MIN_GLUE_KEY` — two-letter coincidences are far too cheap), and
every join v2 made is still made by running v2's piece rule first, which is what
keeps short cardinal compounds such as `5-7.` joined.

**Unchanged:** the 0.85 gate, the timestamps, the interpolation rule, sidecar
validation, and every other function in the helper. No timestamp is invented
outside a span the recogniser itself reported and no confidence is synthesised.

### Replay — how it was validated

Run 2's pods kept the full per-paragraph diagnostic (heard words with
timestamps, every bias attempt) for every rejected chapter. `tools/replay.py`
here feeds each recorded attempt back through v2 and v3 with no audio, no model
and no network:

| check | result |
| --- | --- |
| attempts replayed | 210,214 (1,241 chapter/arm decisions) |
| v2 replay reproduces the candidate words and stats the pod recorded | **210,214 / 210,214** |
| attempts v3 does not touch | 179,711 |
| … of which byte-identical (words and stats) | **179,703 / 179,711** — the 8 differ only in gaining a merge v2 missed, at the same match count |
| attempts whose ratio rises | 30,509 |
| attempts whose ratio falls | **0** |
| attempts matching fewer words | **0** |
| paragraphs crossing the 0.85 gate **upward** | **1,887** |
| paragraphs crossing the gate **downward** | **0** |
| chapters passing on at least one arm: v2 → v3 | 943 → **1,010** (+67) |

The first cut of v3 did lose one match in 38 attempts, all of them short
compounds such as `§§ 5-7.` where the glued key `57` is below `MIN_GLUE_KEY` and
v2's cardinal-piece rule had matched `5` `-7.` as `five` `seven`. Running v2's
rule first before the glue rule makes v3 a strict superset and takes the
downward count to zero; `SupersetOfRevisionTwo.test_cardinal_pieces_of_a_short_compound_still_join`
pins it.

### Canary

`macbeth/original-en` ch1, the published chapter, on CPU (`--device cpu
--compute-type int8`, faster-whisper 1.2.1 / ctranslate2 4.8.2), model pin
`Systran/faster-whisper-small.en` tree SHA-256 `f1fe271c…` — the same value
run 1 and the v2 work recorded, recomputed here from a fresh download.

- `--helper v2` and `--helper v3` candidates are **byte-identical on both
  arms**, and identical to the hashes the v2 canary recorded: `off`
  `10318749…`, `auto` `7a11390a…`.
- `verify_timings.py` over the **published** sidecar: pass, 12 paragraphs,
  87 words, worst paragraph ratio 1.0 — unchanged.
- The same five checks over the v3 candidate on both arms: pass, 12
  paragraphs, 87 words, worst ratio 1.0.

### Tests

```
python3 -m unittest discover -s tools/audio-highlight/aligner -p 'test_*.py'   # 62 tests, OK
python3 -m unittest discover -s tools/audio-highlight -p 'test_*.py'           # 20 tests, OK
```

`test_normalisation_v3.py` adds 28 cases: a positive and a negative for each
class above, both contraction directions, the mirror case's shared span, the
`MIN_GLUE_KEY` floor, the superset-of-v2 group, the gate, and the pins.
`test_normalisation.py` is unchanged except for its default-pin assertion, which
now checks that v2 is still selectable rather than that it is the default.

### Not done, and why

- **Spelled-out speaker names** (Phaedo; `_Fal._` heard "Falstaff") — a
  re-recording question, not a comparison one, and out of scope by the brief.
- **Recognition misses** — `'tis` heard `Tease`, `vanish'd` heard `vanished`,
  `A fortnight` heard `A Fortnite`, Latin and French passages. The words are
  genuinely different; the gate is doing its job.
- **The Wealth of Nations statistical tables.** `2,186 550,943` is heard
  `2 ,180 6 ,550 ,940 3` — the digits themselves do not agree, so gluing
  cannot and must not rescue it. Clean grouped numerals (`2` `,186`) do join.
- **Initials** (`R.W.` heard `R` `.W.`) — glues to `rw`, below `MIN_GLUE_KEY`.
  Frankenstein ch3 p8 still holds that chapter open.

## Part B — the GPU run

Filled in as the run moves; see `artifacts/audio-highlight-run3-2026-09-12/STATE.md`.
