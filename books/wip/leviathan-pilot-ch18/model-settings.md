# Pilot A — Model Settings Used

Both candidates were drafted by Claude agent sub-sessions (Agent tool,
subagent_type: general-purpose) spawned from this session, each given the
identical revised drafting prompt (`books/prompts/modern-en-draft-prompt.md`)
and the identical locked source (`source.json`), with no visibility into
each other's output.

| Candidate | Requested model override | Notes |
|---|---|---|
| Sonnet (candidate-A.json / candidate-sonnet.json) | `model: "sonnet"` passed to the Agent tool | Resolves to this account's current Sonnet alias at run time (this session's own model, at time of this pilot: Sonnet 5 / `claude-sonnet-5`, per this session's model-identity line). |
| Opus (candidate-B.json / candidate-opus.json) | `model: "opus"` passed to the Agent tool | Resolves to this account's current Opus alias at run time (Opus 5 / `claude-opus-5` per this environment's documented model IDs). |

**Caveat, stated honestly:** this session has no tool that reads back which
model ID actually served a background Agent-tool subagent (unlike a
Claude Code Remote session, where `get_session` reports
`session_context.model` / `external_metadata.last_served_model` — no such
introspection exists for Agent-tool subagents in this harness). The model
override was requested and accepted without error by both dispatches, and
each agent's own final report affirms it worked independently with no
access to the other's output or to any other Leviathan translation. But
the exact serving model for each cannot be independently re-verified from
this session after the fact beyond what was requested. This is reported
here rather than glossed over.

Both agents were explicitly instructed not to consult any other
translation/edition of Leviathan (including from training) and to treat
`source.json` as the sole fidelity anchor. Both self-reported compliance;
this is exactly the kind of claim the fidelity review below re-derives
independently rather than trusting.

Anonymization for review: `candidate-A.json` = copy of `candidate-sonnet.json`;
`candidate-B.json` = copy of `candidate-opus.json`. Reviewers were given only
the anonymized A/B files and the generic book/chapter context, never the
`-sonnet`/`-opus` filenames.
