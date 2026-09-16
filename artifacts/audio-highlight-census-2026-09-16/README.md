# Production census, 2026-09-16

Run with `audit_production.py` against live production. It replaces the
2026-09-11 census, which had gone badly stale — roughly 1,700 chapters were
published between the two, mostly by the Mac controller, and every backlog
figure I quoted from the old file was too pessimistic.

## Coverage

```
                              editions complete   chapters timed   missing
Priority 1 (original-en)            31 / 98         3559 / 4422       863
Priority 2 (AI editions)            16 / 100        5135 / 6800      1665
All English                         47 / 198        8694 / 11222     2528
```

1679.9 audio-hours total; 608.9 of them lack timings.

"Priority 1" is `original-en` — public-domain originals and human translations.
The `modern-en` / `modern-da` renderings are AI-created and are Priority 2.

## The highest-leverage queue

`edition-completing-queue.json` — 39 chapters that would complete **28**
Priority-1 editions, taking the complete count from 31 to 59. Every entry is an
edition needing three chapters or fewer. 18.9 audio-hours.

`edition-completing-queue-fresh.json` — the 36 of those never attempted. The
other three (`candide` ch26, `communist-manifesto` ch4, `federalist-papers`
ch48) were rejected in earlier batches and remain rejected after the markup
fix; they are short-paragraph gate failures, not markup ones, and need a
decision rather than another run.

Treat this queue with care: it is residue by construction. Chapters left over in
otherwise-finished editions are the ones earlier runs could not align, and
before the markup fix that population was 0 for 17 at the gate. The fix changes
the odds but does not make these average chapters.

## Method note

Coverage must be read with `verify_timings.py` or this census, never with an ad
hoc HTTP probe. A direct request to `/api/audio-file` from the session
container returns 403, and a probe that treats an exception as "not published"
reports everything as missing. That mistake sent a 39-chapter batch at work
that was already done.
