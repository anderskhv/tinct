# Leviathan Expansion Batch (ch24, ch40) — Model Settings Used

Per the task's model policy: Sonnet as the economical drafting baseline,
a fresh candidate-only session for accessibility review, an independent
Opus session for source-based fidelity review.

| Role | Model requested | Notes |
|---|---|---|
| Drafting (both chapters, all rounds) | `model: "sonnet"` passed to the Agent tool | This session's own default model at time of this batch. |
| Accessibility review (both chapters, every round) | no override — Agent tool default | Default model for a fresh general-purpose subagent in this environment; never given the source, the other reviewer's notes, or (after round 1) the drafter's notes. |
| Fidelity review (both chapters, every round) | `model: "opus"` passed to the Agent tool | Requested explicitly per the task's "independent Opus source-based fidelity reviewer" instruction. |

**Round count:** ch24 went through 5 rounds (draft, 3 fix-and-reverify
cycles, one final trivial polish); ch40 went through 4 (draft, 2
fix-and-reverify cycles, one final verification). Every round's drafting
or fix work used Sonnet; every accessibility check was a fresh session;
every fidelity check was Opus.

**Same caveat as the ch18 pilot, repeated because it's still true:** this
session has no tool that reads back which model actually served a
background Agent-tool subagent after the fact (unlike a Claude Code
Remote session, where `get_session` reports the serving model). The
model override was requested and accepted without error on every
dispatch, and every agent's own final report affirmed it worked
independently within its stated constraints (blind to source, blind to
other reviewers, etc.). This is reported honestly rather than glossed
over, exactly as in the prior pilot.

No paid API calls were made anywhere in this batch. All work used Claude
Agent-tool subagent sessions already available in this environment.
