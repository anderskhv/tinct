# Run-2 STATE — CLOSED 2026-09-12 09:2x UTC

**Nothing is running.** No pod, no dispatcher, no harvest daemon, no guard loop.
`guard/closing-status.txt` is the proof: no `tinct-words-run2-*` pod RUNNING.

## Final numbers
- 934 chapters published and verified (`publication-journal.json`: 934
  published, 5 skipped, 0 served-hash mismatches).
- Independent close-out re-fetch from tinct.app: **934 verified, 0 mismatched**
  (`verify-close.log`, produced by `verify_published.py`).
- Spend $17.32 of the $20 envelope (`spent.txt`, from every pod.json's
  estimatedCost plus the $0.16 carried in). 85 pod records, 2022 pod-minutes.
- 62 editions advanced; **0 editions completed** — each is 2-3 chapters short
  and every one of those chapters fails the 0.85 gate on a normalisation class,
  not on timing. See `docs/audio-highlight-run2-2026-09-11.md`.

## What a fresh session should do first
Nothing urgent — no resources are live. The run-3 work is:
1. Helper v3 normalisation (contractions, grouped numerals, speaker-name
   punctuation), then re-run only the rejected chapters.
2. The 18 wave-2 batches still listed in `pending.json`, via
   `dispatch.py` (it resumes from that file).
3. One stale pod, `tinct-words-run2-6` (`zcpat4n88pbixj`), has been EXITED since
   before this session and may still bill for stored disk. It was left alone
   because it is not this session's pod and may hold output someone wanted.
   Terminate it deliberately, not with a bare `stop-all`.

## Tooling built this session (all in this directory)
`dispatch.py` (capacity-retrying launcher with a budget stop), `harvest_daemon.py`
(publish+push per pod, serialised), `harvest_one.sh`, `launch_wave2.sh`,
`gloop.sh` (guard every 5 min at the brief's limits), `recompute_spent.py`,
`verify_published.py`.

Note for whoever restarts them: never `pkill -f <script-name>` here — the
pattern matches the invoking shell and kills the tool call instead of the
daemon. Kill by PID from `ps -eo pid,args`.
