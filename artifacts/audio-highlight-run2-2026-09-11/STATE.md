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
| zhrf869z78rkgd | tinct-words-run2-16 | 1 | 3.1 min | adopt/zhrf869z78rkgd.log |
| siq39a3lr1wjtu | tinct-words-run2-17 | 4 | 3.0 min | adopt/siq39a3lr1wjtu.log |
| 3fc9j170phnw37 | tinct-words-run2-18 | 11 | 3.0 min | adopt/3fc9j170phnw37.log |

EIGHT pods, 65 chapters in flight (16/17/18 were NOT in the handover list;
`runpod_guard.py status` found them still RUNNING and they were adopted too). Each adopt.py stops+terminates its own pod when the job
ends or the 44-minute deadline hits, then writes pods/<name>/out/.

## What a fresh session should do FIRST
1. `python3 tools/audio-highlight/runpod_guard.py status` — if pods are RUNNING
   and no adopt.py is alive (`pgrep -f adopt.py`), re-adopt them exactly as
   above with `--elapsed-minutes` set from `createdAt`; adoption works, use it.
2. Then harvest/publish per `docs/audio-highlight-run2-brief-2026-09-11.md`.

## Guard
`gloop.sh` runs `runpod_guard.py enforce --apply` every 5 min with the brief's
limits (prefix tinct-words-run2-, $1.00/hr, 50 min, $20 budget, spent.txt).
Do NOT `pkill -f guard-loop.sh` — that string matches the invoking shell too.

## 05:35Z — wave 2 started alongside wave 1
COMMUNITY cloud had no instances at all; SECURE had some, at the same
$0.49/hr, so wave-2 pods run with `--cloud SECURE`. Capacity saturates at
about 12 concurrent pods — batches 4, 5, 7, 8 were refused ("no instances
currently available", costs nothing) and must be relaunched when wave-1 pods
free capacity.

Wave-2 pods live: 19 (batch 1), 20 (batch 2), 21 (batch 3), 24 (batch 6),
each launched by `orchestrate.py run`, which harvests and terminates itself.
Relaunch helper: `launch_wave2.sh <first-pod-number> <batch>...` (add
`--cloud SECURE`). Remaining wave-2 batches after these: 4,5,7,8 then 9..95.

## Harvest
`harvest_one.sh <pod-name>` runs harvest.py --apply against
publication-journal.json and commits+pushes that single pod. Run it per pod,
never in batches.

## 05:38Z — dispatcher running
`dispatch.py` (background) holds 12 concurrent pods, launches the next
`wave2-batch-N.json` from `pending.json` whenever RunPod frees capacity,
retries "no instances currently available" forever (that failure costs
nothing), and stops launching at $16 projected so the close-out stays inside
the $20 envelope. `recompute_spent.py` refreshes `spent.txt` from every
pod.json's estimatedCost; the guard loop reads that file.

**Every finished pod still needs `harvest_one.sh <pod-name>`** — orchestrate.py
and adopt.py fetch and terminate, they do not publish.

Published so far: the-republic ch5, the-tempest ch6 (journal has the truth).

## 05:42Z — three daemons carry the run
| process | job | restart command |
|---|---|---|
| `gloop.sh` | guard enforce every 5 min ($20, $1/hr, 50 min) | `nohup bash $A/gloop.sh &` |
| `dispatch.py` | launch wave-2 batches from pending.json at 12 concurrent | `nohup python3 $A/dispatch.py &` |
| `harvest_daemon.py` | harvest+publish+push each finished pod, one at a time | `nohup python3 $A/harvest_daemon.py &` |

All three are idempotent and keep their state on disk (`pending.json`,
`spent.txt`, `pods/*/candidates.json` as the harvested mark), so a fresh
session restarts them and loses nothing. Check `dispatch.log`, `harvest.log`,
`guard/guard.log`.

Do not `pkill -f` these names — the pattern matches the invoking shell and
kills the tool call instead.
