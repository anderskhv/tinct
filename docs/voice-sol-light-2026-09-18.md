# Sol, compact voice context and late-result handling — September 18, 2026

Status: approved implementation; cloud checks and release pending.

User trial export showed three calls: Terra/current, Terra/light and Sol/light.
The raw private transcript remains outside Git. Sol/light began its substantive
spoken response about 0.9 seconds after the last input transcript fragment;
Terra/current took about 8.6 seconds. This measures transcript receipt, not audio
latency; the fast Sol/light opening preceded the backend answer. It is not proof
that Sol's backend or the light prompt alone caused the speed difference.

Failure class: Live speech and managed Responses work proceed independently.
After a new Keller question, the prior comparison's failed-search answer was
spoken; the Keller research succeeded and its answer completed before call end,
but was not spoken in the captured transcript. Continuations also incorrectly
flushed a new user transcript and could reset its interaction-count boundary.
Initial reader context was sent only on later updates, causing needless questions
about the current book. Scope: ordinary Live Talk and the voice test room.

Changes:
- Default backend Sol; compact literary policy, nearby text including the current
  paragraph, and four recent turns for explanation/follow-up continuity. Named
  source claims still require research, general discussion does not automatically.
- Live speaking policy explicitly suppresses vocal fillers, repeated questions,
  routine praise and lookup narration; prioritizes the latest question.
- Publish book/chapter/edition at connection. Preserve delegation-to-turn identity
  across tool continuations. Mark late tool output as superseded, steer Live when
  old results arrive, and do not let old continuations split a newer user question.
- Retain required tool results and continuation protocol; do not invent a Live
  response.cancel command or silently discard potentially executed reader actions.

Verification limits: managed Responses can inject text into Live before the app
receives its events. The supported session.instructions.append channel steers the
speaker; it is not a deterministic audio cancellation guarantee. Prompt adherence,
no filler speech and the actual audible Keller transition need live acceptance.
Automated media/browser tests run in Linux CI only, never on Anders's Mac.

References: [Live delegation](https://developers.openai.com/api/docs/guides/live-delegation),
[Live prompting](https://developers.openai.com/api/docs/guides/live-prompting).
