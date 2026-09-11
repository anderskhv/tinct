# Finishing the 19-chapter word-timing queue

September 11, 2026. Cloud session, branch `claude/audio-finish-20260911`.
Queue: `artifacts/audio-highlight-queue-2026-09-11/finish-now.json` on
`claude/wonderful-cerf-0vhcs3`, 19 chapters, all `original-en`.

**Outcome: 5 of 19 are verified, gate-passing candidates and are staged for
publication. 0 are published — the R2 upload was refused by this session's
permission classifier as a production deploy. The other 14 do not pass the
gate, for reasons recorded below.**

## What the brief assumed, and what is actually true

The brief stated all 19 were classified `ready`, with "audio verified present
and matching the published text, no repair needed, nothing blocked". Three of
those claims did not survive contact with production.

### Four chapters have missing source recordings (404)

`cloud_cohort.py` dropped them while building the cohort; each was re-probed
twice afterwards and the absences are stable, not transport flakes.

| Chapter | Recordings in manifest | Absent from the bucket |
| --- | --- | --- |
| `confessions/original-en` ch2 | 18 | `p10.mp3` |
| `descartes-meditations/original-en` ch6 | 39 | `p6.mp3` |
| `peloponnesian-war/original-en` ch16 | 82 | `p59.mp3` |
| `peloponnesian-war/original-en` ch24 | 52 | `p1.mp3`, `p4.mp3` |

Five recordings in total. A sidecar for these would have to either omit the
paragraph (failing the coverage check) or invent timings for it. Both are
barred, and re-recording is out of scope, so these four are unreachable and
`confessions`, `descartes-meditations` and `peloponnesian-war` cannot be
completed by this work at all.

### Ten more chapters fail the 0.85 paragraph gate

19 paragraphs out of 933 (2.0%) align below 0.85, and because the gate is
whole-chapter, those 19 paragraphs reject 10 chapters. They fall into three
classes:

- **Truncated audio** — the recogniser hears far fewer words than the text
  has: `iliad` ch14 p33/34/35 (213→104, 204→54, 179→61 words) and `odyssey`
  ch3 p37 (208→26). This is the known truncation class.
- **Recording does not match the text** — short paragraphs where the
  recogniser hears several times more words than the text contains:
  `phaedo` ch1 p6/14/16/18/22 (e.g. 2 expected, 10 heard) and `phaedo` ch7 p6
  (3 expected, 11 heard).
- **Genuine low agreement at matched length** — token counts line up but
  agreement sits in the 0.65–0.75 band: `fear-and-trembling` ch1 p1
  (226/304), `genealogy-of-morals` ch2 p33 (504/682), `second-treatise` ch19
  p27 (257/396) and p37, `beyond-good-and-evil` ch5 p79/p84,
  `notes-from-underground` ch17 p19/p24, `oedipus-at-colonus` ch3 p17.

The threshold was not lowered, and no timestamp or confidence value was
invented, so these stay unpublished.

## How it was run, and what it cost

**$0.** No GPU pod was launched. `runpod_guard.py status` reported no pod
RUNNING (8 owned pods, all EXITED) — but also
`estimated spend this envelope: $259.66 of $25.00`, so the envelope was
already about ten times over before this session started. That alone ruled out
a pod; the work then turned out not to need one.

The whole run is CPU, `faster-whisper` small.en at the pinned revision
`d1d751a5f8271d482d14ca55d9e2deeebbae577f`, `int8`, four shards of one thread
each across the container's four cores. Aggregate real-time factor 0.30x:
6.11 audio hours over 933 recordings aligned in roughly two hours. Sharding
turned out to be worth only ~10% over a single four-thread worker, because
whisper already scales across threads.

Two shortcuts were tested and rejected on evidence rather than assumed:

- **A separate `off` arm is redundant.** `trial.py`'s `paragraph()` already
  cascades `both → hotwords → off` inside the `auto` arm whenever bias
  underperforms, and every failing paragraph inspected had already tried all
  three. Running the second arm would have cost ~2 hours for nothing.
- **`int8` quantisation is not why chapters failed.** Re-running four
  borderline paragraphs at `float32` moved the ratios by noise
  (0.743→0.730, 0.739→0.745, 0.688→0.688). A full float32 re-run would have
  cost ~3 hours and published nothing extra.

## The gate that was applied

Both halves, on every candidate:

1. `publish_timings.py` validation — identity, paragraph mapping, coverage,
   timestamp bounds, and edition-text agreement at 0.85. All five pass with
   no failures (`dry-run-journal.json`).
2. **Reader playback** — `tools/audio-highlight/playback_check.mjs`, added by
   this session. All five pass: every spoken paragraph highlights and the
   highlight never moves backwards across a swept timeline.

The second check exists because the first cannot catch the failure that
matters most here. The reader merges a sidecar through
`labFollow.alignTimedWordsToText`, which requires an **exact** whitespace-token
count and semantic match against the raw edition paragraph, and which
**silently falls back to paragraph-level highlighting** when that fails. A
sidecar can therefore pass `verify_timings.py` completely and still highlight
nothing in the reader — which is exactly the shape of the known
markdown-underscore granularity class. Rather than reimplement that logic, the
checker imports `app/src/lab/labFollow.ts` itself and drives it, so it cannot
drift from what the reader does. It was calibrated against three known-good
published sidecars (Macbeth ch1, Social Contract ch23, The Manual ch52), all
of which pass.

## What is staged, and what is left

`artifacts/audio-highlight-finish-20260911/` holds the five candidate
sidecars, the collection report covering all 15 aligned chapters, the playback
report, the dropped-chapter record, and the dry-run publication journal with
each candidate's SHA-256.

Publishing is one command, unchanged, once a session is permitted to write to
production:

```bash
python3 tools/audio-highlight/publish_timings.py \
  --candidates artifacts/audio-highlight-finish-20260911/candidates.json \
  --journal artifacts/audio-highlight-finish-20260911/publication-journal.json \
  --apply
```

It refuses to overwrite, re-reads the bytes production serves and compares
hashes, so it is safe to run as-is. After it runs, `verify_timings.py` over
the same five keys confirms the published objects.

Each of the four two-chapter editions was confirmed against production to be
missing exactly its two queued chapters, so the arithmetic is direct:

| Edition | Queued | Passing | Completes? |
| --- | --- | --- | --- |
| `frederick-douglass/original-en` | ch11, ch12 | both | **yes** |
| `genealogy-of-morals/original-en` | ch1, ch2 | ch1 only | no |
| `notes-from-underground/original-en` | ch15, ch17 | ch15 only | no |
| `oedipus-at-colonus/original-en` | ch3, ch5 | ch5 only | no |

Net: of the 13 editions this queue was meant to complete, publishing the five
candidates completes **one**, `frederick-douglass/original-en`. The other
three candidates each leave their edition one chapter short, because the
sibling chapter in the same queue failed the gate. The remaining nine editions
are held by the missing recordings and the sub-threshold paragraphs above.
