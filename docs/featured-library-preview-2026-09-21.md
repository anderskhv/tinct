# Featured library preview — September 21, 2026

Status: implementation; verification and deployment pending.

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
