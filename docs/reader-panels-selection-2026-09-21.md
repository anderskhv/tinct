# Desktop and mobile reader polish — 2026-09-21

Status: implemented in the cloud; candidate reader and voice acceptance passed. Production release pending.
Branch: `codex/reader-panels-selection-20260921`.
Baseline: `c771b3349f5f0f9c6236756b02bdb63fec2838a9`.

## Approved scope

- Shared desktop drag behaviour for Chat, Talk, Explain, Define and Reading settings. Chat/Talk minimize and restore; text remains selectable and small selection menus stay anchored. Windows stay inside the viewport and default clear of page arrows. Mobile remains a sheet/card interface.
- Stable highlighting without layout movement; easier final-word capture on both platforms; preserve continuous verse bands and cross-page selection; paint a trailing hyphenated fragment while selecting; remove the edge hint.
- Explain expands only to its text (bounded by the viewport and one desktop leaf), with visible close, unobstructed scrollbar, theme-coloured More/Less and a highlight-colour action.
- Dictionary misses use lexical Define UI; connect the shipped archaic supplement, normalize words and retry failed asset fetches. Generated definitions have subtle AI provenance.
- Diagnose Talk stopping after one answer independently of dictation. Keep the Grok model/prompt, instrument capture and correct lifecycle failures; exercise repeated turns, interruption, mute and restart.
- Align the mobile header with reading margins; use the book font for its small progress footer. Match desktop frame colour to the page, add a subtle centre gutter shadow.
- Full library in the book-title switcher on both layouts. Desktop progress toggles percent of book/chapter. Comparison label is **Tinct Modern English**; distinguish edition labels from page folios.
- Keep desktop settings fully reachable, remove helper copy and divider artefacts. Three bounded sliders with editable decimal-comma values and Restore defaults. Preserve edition, position and user data.

## Failure classes and scope

Highlight-only letter spacing changed the geometry around verse markers. Nearest-word picking used a wrapped word's combined bounding rectangle. Page-edge decoration had no selection paint. These are shared rendering/selection paths across books and editions.

Dictionary shard failures were permanently cached as misses, and the shipped archaic supplement was never loaded. The main word list does not contain “these”; missing entries must remain definitions, not chapter explanations.

Voice capture exceptions were swallowed, so a dead graph could claim to be listening. Worklet registration was repeated on the same audio context after restarting. A late cancellation completion could clear the next response. Capture recovery and response identity need independent regressions; the user's precise device failure is not yet reproduced.

## Verification and release

All authoring and execution use remote GitHub branch/Actions; the historical Documents checkout remains untouched. Candidate run [35576417347](https://github.com/anderskhv/tinct/actions/runs/35576417347) passed 2,521 tests (one skipped), build, bundle verification, all six Chromium/WebKit reader cases, hyphenation and responsive entry acceptance. Candidate bundle: `index-gszvwRT4.js`. Its voice check stopped before connecting because it targeted a control hidden during dictation; the corrected test uses the Talk menu. Real-provider voice acceptance remains pending. Production uses the serialized GitHub deploy workflow on Node 24.13.0. No physical iPhone or Mac microphone testing is authorized. Browser AI definition tests use fixtures and do not call Anthropic APIs.

## Candidate acceptance — September 21

[Run 35578585953](https://github.com/anderskhv/tinct/actions/runs/35578585953) passed the current runtime's tests, build and bundle gates, six reader browser cases and library acceptance. Its silent real-provider Grok check passed a fully played answer returning to listening, three turns, interruption, mute/unmute, minimize/restore, End and same-page restart. First-audio measurements for three turns were 242, 245 and 201 ms after the provider's speech-ended event; these are controlled cloud measurements, not a real-device latency promise. The release test additionally requires new audio after restart, so a tool-only response cannot satisfy that check.

The window review also found two inherited conflicts: docked companion dimensions overrode floating sizes, and the navigation menu could fall behind a companion. Shared bounds now reserve the header, and companions remain below menus. Chrome/WebKit checks drag Chat to the upper boundary and open Settings while Chat is visible.

Artifacts: `reader-panels-acceptance` and `voice-capture-acceptance` on the linked run. Local copies of cloud screenshots were inspected under `/tmp/tinct-reader-final` and `/tmp/tinct-voice-passed`; the durable originals are the Actions artifacts.

Limits: phone viewport and WebKit checks do not reproduce physical iPhone touch, Safari browser chrome, Bluetooth routing or speaker echo. Dictionary and Explain browser responses are fixtures. Grok uses real provider audio with a synthetic microphone and muted playback; dictation uses a SpeechRecognition lifecycle fixture. The exact device-specific “stuck Listening” report remains unproven. The capture diagnostics and recovery paths now make that failure observable instead of silently claiming to listen.

Next: finish the combined workflow, release through the serialized deploy workflow, and record its exact production bundle and acceptance evidence.
