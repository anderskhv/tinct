# Run-2 STATE (live)

Updated: 2026-09-12T05:27Z — session 2 (after container restart #2)

## Decision this session
ADOPTED the five orphaned pods (all carried TINCT_TOKEN + TINCT_TARGETS;
`gpu/adopt.py` reached every status server on the first poll).

## Pods alive right now
| pod id | name | batch | elapsed at adopt | adopt log |
|---|---|---|---|---|
| nb7h7iwonfalzv | tinct-words-run2-15 | 2 | 2.1 min | adopt/nb7h7iwonfalzv.log |
| q6ndkaec0kckxl | tinct-words-run2-14 | 4 | 4.0 min | adopt/q6ndkaec0kckxl.log |
| pqbe77rs3u4p5s | tinct-words-run2-12 | 15 | 4.8 min | adopt/pqbe77rs3u4p5s.log |
| v4d3gs7lbvxy0i | tinct-words-run2-13 | 15 | 5.6 min | adopt/v4d3gs7lbvxy0i.log |
| zajjlwk12kr99z | tinct-words-run2-11 | 13 | 5.6 min | adopt/zajjlwk12kr99z.log |

49 chapters in flight. Each adopt.py stops+terminates its own pod when the job
ends or the 44-minute deadline hits, then writes pods/<name>/out/.

## What a fresh session should do FIRST
1. `python3 tools/audio-highlight/runpod_guard.py status` — if pods are RUNNING
   and no adopt.py is alive (`pgrep -f adopt.py`), re-adopt them exactly as
   above with `--elapsed-minutes` set from `createdAt`; adoption works, use it.
2. Then harvest/publish per `docs/audio-highlight-run2-brief-2026-09-11.md`.
