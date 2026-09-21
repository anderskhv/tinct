# Featured library preview — September 21, 2026

Status: merged; cloud acceptance passed; deployment in progress.

Approved scope: an isolated preview of the featured-book reel, with full text
underneath, designed for desktop and mobile. No public-library replacement.
Uses existing catalogue art, summaries, titles and word-count reading estimates.
No new dependency, book content, reader position, account policy or AI behavior.

The preview at /lab/featured defaults to site-admin access. A server-verified
GET /api/featured-preview supplies the markup with private/no-store and noindex.
The public shell offers the existing sign-in flow with a return to the preview.
No public navigation or sitemap points to the experiment.

Interaction: centred covers with restrained perspective; native touch momentum
and scroll snapping; mouse dragging; previous/next and keyboard navigation.
Descriptions share a grid footprint so switching books does not move the text
region. Full descriptions remain available without clamping. Open book enters
the existing book preparation through its explicit URL. Reduced motion removes
caption animation and smooth programmatic scrolling.

Verification required: tests, build, bundle and documentation gates; isolated,
silent Chromium/WebKit phone, tablet and desktop checks; production guest
denial and deployed asset verification. Admin UI uses a controlled authenticated
response fixture; this does not establish a real admin sign-in session.
No physical-device, microphone or paid-model testing.

Next: finish cloud acceptance, inspect screenshots and record release evidence.

Candidate preview acceptance passed in [run 35579802539](https://github.com/anderskhv/tinct/actions/runs/35579802539), with eight Chromium/WebKit viewports. Startup resize paints now wait for catalogue data. Explicit controls use a short interruptible transition to avoid WebKit native smooth-scroll cancellation; touch remains native. Concurrent reader changes from e8cb75ab are preserved for the final integrated verification.

## Candidate acceptance and release — September 21

[Integrated acceptance 35580261662](https://github.com/anderskhv/tinct/actions/runs/35580261662) passed: 2,524 tests, one existing skipped test, build, bundle and documentation gates; preview Chrome/WebKit phone/tablet/desktop checks and existing reader/library regression checks. [PR 124](https://github.com/anderskhv/tinct/pull/124) merged as 63662fd5c9aec20af85f3558974a7f602f372e72.

Initial deployment 35581145844 was correctly stopped by the exact-main guard when a concurrent documentation-only reader receipt advanced main to 17311c3bcf79. Those notes are preserved. This commit retries release from the reconciled latest main; production verification remains pending.
