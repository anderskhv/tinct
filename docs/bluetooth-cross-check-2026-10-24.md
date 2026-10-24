# Bluetooth and controls cross-check

Requested symptom: iPhone narration progresses silently through Jabra Evolve 85; phone speaker and YouTube headset audio work. Prior microphone use is unknown.

The reader repair already merged in PR #613 owns browser playback synchronously before play and resume, releases it on stop/teardown, and retains Talk priority. It also removes boxed shared-desktop controls. Two additional regression tests were independently developed against the previous production source, where the play-order assertion failed, then run against main `a42f8cc47ab7e7e9801c5e20c66134fad7425fe3`. All 18 tests across the existing session suite, resume/place suite with the extra cases, and session arbiter passed. The additional teardown test checks a pending media play that resolves after unmount cannot reclaim the session.

Physical iPhone/Jabra output remains unverified. This establishes a software-ordering invariant, not a confirmed hardware diagnosis. No provider calls or audible browser playback were used. The existing restoration release owner retains deployment ownership; this evidence branch changes no application source or release guard.

The wider repair release 40137236478 rolled back after PDF acceptance failures; PR #616 repairs readiness checks. At this checkpoint its CI run 40138838269 passed. This note does not claim the repair is live.
