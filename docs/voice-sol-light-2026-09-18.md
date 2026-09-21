# Sol, compact voice context and late-result handling — September 18, 2026

Status: deployed September 18, 2026; cloud production voice simulation passed.

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

## Release evidence

Implementation `02907af887b07df74e7b704a1ae89c562ead7505` deployed through
[GitHub deploy 35329915846](https://github.com/anderskhv/tinct/actions/runs/35329915846).
The workflow passed build, bundle verification, production smoke and responsive
acceptance. Production serves `assets/index-DpT2T9Ec.js`.
[Verification 35329915896](https://github.com/anderskhv/tinct/actions/runs/35329915896)
passed; the suite has 2,394 tests in 191 files. An earlier feature run failed a
WebKit cover-animation timing assertion; the next feature run and production
responsive checks passed without changing unrelated cover behavior.

The active checkout lacks the referenced OVERVIEW.md and
documentation-maintenance.md; this task updates the existing authoritative
voice plan and product inventory. The documentation checker remains available.

[Production voice acceptance 35330507775](https://github.com/anderskhv/tinct/actions/runs/35330507775)
passed on Linux Chromium desktop (1440×900) and WebKit phone (390×844), both
against `assets/index-DpT2T9Ec.js`. It verified Sol settings, no-backchannel
instructions, initial Job 8 location, late-response steering, preset persistence,
export and test-history isolation, with no page errors. Providers and media were
simulated; this did not place a live paid call or evaluate actual spoken audio.
[Screenshots and production.json](https://github.com/anderskhv/tinct/actions/runs/35330507775/artifacts/10540643199)
are stored in the workflow's `voice-room-acceptance` artifact. Screenshot capture
passed; images were not separately visually reviewed in this task.

Next: assess real spoken follow-ups and filler frequency in the next authorized
voice trial. If steering still permits stale speech, investigate provider-supported
turn cancellation rather than assuming the regression proves audio cancellation.
