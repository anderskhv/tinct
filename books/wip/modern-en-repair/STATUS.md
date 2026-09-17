# Modern-EN repair — status

Queue from `tools/audit/edition_divergence.py` (2026-09-12, re-run 2026-09-17).
Process: `BRIEF.md` (Sonnet drafter, one fresh agent per chapter) ->
`gate.py` (script) -> `CHECKER.md` (Opus, gate-flagged chapters + 3 sampled
per book) -> `write-chapter.py` into the live edition on this branch.
Confessions is handled separately on `claude/friendly-albattani-qgyqfi`.
Ulysses and Jerusalem excluded pending Anders' call. Danish not started.
Repaired text is held out of production until its audio is regenerated
(AUDIO-IMPACT.md).

| Book | Chapters | Drafted | Gate | Opus-checked | Status |
|---|---|---|---|---|---|
| heart-of-darkness | 3 | 1 | pass | ch1 | pilot done, see PILOT.md; ch1 held pending slur decision |
| the-awakening | 39 | 0 | – | – | batch 1 |
| walden | 18 | 0 | – | – | batch 1 |
| vindication-rights-of-woman | 15 | 0 | – | – | batch 2 |
| jungle-book | 7 | 0 | – | – | batch 2 |
| brothers-karamazov | 96 | 0 | – | – | batch 2, chapter-selective |
| ulysses | 18 | – | – | – | excluded pending decision |
| jerusalem | 18 | – | – | – | excluded pending decision |
