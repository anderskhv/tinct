# Reader, library and brand batch — 21 September 2026

Status: shipped and accepted on production, 21 September 2026 at 13:59 UTC.

## Approved scope

Resume PR #130's six reader regressions: saved highlight identity wins over word lookup, seamless native highlight paint, dark fold confined to the gutter, inset Reading Now focus, mobile menu clearance, and quiet progress matching the header. Keep the previously shipped selection/definition/verse/TOC work.

Move **Cover and preface** from Reading Now into the chapter tree above its first entry. Reuse the existing preparation route without changing the reading tuple.

Discovery starts on Frankenstein inside an extended published collection. A fresh load does not restore an edge selection; explicit Back restores the user's shelf. Currently Reading uses the same cover drag/wheel motion, preserving progress, removal, and Continue. Covers expand to the left beside desktop preparation and into a full phone surface. Reduced motion is respected.

Install the final Design 1 kit (approved in that task): drawn t icons, opaque Apple icon, Android maskable icon, manifest, generic and per-book social imagery. Preserve the final approved landing-page wording. Public metadata uses catalogue data only; the passage-card sample is an asset, not permission to publish private notes/chat.

## Mechanisms and verification

Highlight clicks use painted record identity, including overlap and hyphen fragments. Cloud instrumentation found Safari exposing the correct native highlight range and computed colour while rendering none of its background. A measured, noninteractive row underlay guarantees that background, and seam joins fill fractional cracks without changing text layout. Acceptance checks positive colour coverage inside words as well as between rows; an earlier seam-only check was insufficient. The Chrome pixel checker reads ready geometry atomically across React renders.

The two library layouts share one cover reel implementation rather than independent drag rules. The old native scroll snapping and saved scroll offset are removed from Currently Reading so Chrome cannot shift its centred cover. A fresh pointer press cancels drag-click suppression, keeping an immediate remove/open action usable. Existing reading memory and position resolution stay authoritative.

Cloud verification must include focused selection and position regressions, all app tests, build and bundle gates, desktop/mobile screenshots, new and returning library gestures, preparation boundaries and metadata. Generate book-card variants in the cloud from current catalogue metadata and real covers; review long-title and missing-cover handling before committing generated files.

## Candidate evidence — 21 September 2026, 13:40 UTC

Cloud run [35605925842](https://github.com/anderskhv/tinct/actions/runs/35605925842) on app commit `634bc2d498ef8863e77945253e25aaefedf9e078` passed unit tests, build/bundle gates, all 16 Chromium/WebKit reader cases, library/preparation and all four returning-reader reel cases. Responsive checks were still running at this checkpoint. The separate admin-preview keyboard Home check timed out and requires a clean rerun; that isolated implementation is unchanged.

The stronger highlight check measured 74–76% exact background-colour pixels inside the sampled words (remaining pixels include text), versus zero on the failing Safari candidate. Reloaded prose and Bible screenshots were inspected. The earlier seam-only test passed a visually broken native background and is explicitly superseded. Safari diagnosis retained in cloud artifact 10641313558; corrected reader evidence in artifact 10642691050. Temporary inspection copies: `/tmp/tinct-paint-probe` and `/tmp/tinct-reader-final-candidate`.

All 100 public book-card variants were generated in cloud run 35602998019, then committed after representative normal/long-title review. The Prince retains the exact approved book-card asset. The generation script remains available, but normal builds use committed assets. Production acceptance checks initial HTML metadata and served-byte hashes for representative icons and cards.

## Production acceptance — 21 September 2026, 13:59 UTC

[PR #130](https://github.com/anderskhv/tinct/pull/130) merged as `889d1970ff42e716b49b517a6141bbfce5aa181c`, preserving concurrent Bella documentation. Final candidate [verify run 35607219495](https://github.com/anderskhv/tinct/actions/runs/35607219495) passed all jobs, including the isolated preview rerun and project documentation checks.

[Production deploy 35607805800](https://github.com/anderskhv/tinct/actions/runs/35607805800) succeeded through its final acceptance steps. Node 24.13.0 ran the approved deployment path after 2,541 tests passed (one existing skip), build and bundle verification. The release served `/assets/index-DEtLZ0Dq.js`; production bytes matched the built bundle on the first check. All 15 smoke checks passed.

Live acceptance passed all 16 Chromium/WebKit reader cases, phone and desktop preparation, the featured preview, responsive landing/library coverage, all four returning-reader reel cases, hyphenation, and 13 brand metadata/asset checks. Reader checks include saved highlight control priority (including the reported “can”), positive highlight fill and joined rows in prose and Bible passages, full-height gutter boundaries, Compare separation, mobile menu clearance, focus-ring inset, matching quiet header/footer, chapter-tree navigation and same-edition position handling. The returning-reader fixture confirmed centred initial selection, drag/caption updates, immediate removal and Continue without changing stored reading positions.

Production screenshots were inspected for the dark Bible spread and reloaded highlight, mobile menu clearance, desktop cover on the left, full-screen phone preparation and returning-reader reel. Durable evidence is attached to the deployment:
- [Reader screenshots and report](https://github.com/anderskhv/tinct/actions/runs/35607805800/artifacts/10642519796).
- [Library, preparation, responsive, hyphenation and brand evidence](https://github.com/anderskhv/tinct/actions/runs/35607805800/artifacts/10642038874).

Temporary inspection copies are at `/tmp/tinct-production-reader` and `/tmp/tinct-production-library`. Brand checks compare served SHA-256 hashes against committed built assets.

Verification limits: browser checks are isolated headless Chromium/WebKit with audio/microphone disabled and AI/auth fixtures where required. They do not establish physical iPhone/Android installation, native Safari compositing fidelity, or third-party thumbnail cache refresh. No further implementation remains in this batch; record new device-specific findings separately.

## Mobile reader/library follow-up — 21 September 2026

Status: shipped and accepted on production, 21 September 2026 at 18:45 UTC.

- Phone Contents is a full reader-viewport destination rather than an inset
  dialog. Its header remains fixed and its chapter tree is the only scrolling
  region. Desktop retains the bounded panel.
- Cover and Preface are separate first-class entries. Both preserve the reading
  tuple. Preface mounts the actual cover behind its dialog, so Back to cover has
  a real destination and Cover opens the frontispiece directly.
- Returning from preparation focuses the chapter control only for a fine
  pointer. Touch-only Safari no longer receives a programmatic focus-visible
  ring, while hardware-keyboard focus remains available.
- Currently Reading places authorship beside the title, not underneath Continue.
  The location line remains separate, and the optional generated recap appears
  only when it exists. The focused cover is eager/high-priority; off-centre
  covers are lazy, without delaying reading-state or speculative narration.

Focused unit coverage exercises the two front-matter routes, the mounted-cover
return, touch focus policy, boot/confirmed library markup and cover priorities.
The muted Chromium/WebKit acceptance now requires the phone Contents surface to
match the viewport and verifies both entries. Physical Safari animation and
perceived library speed remain device acceptance items.

### Follow-up production acceptance

[PR #135](https://github.com/anderskhv/tinct/pull/135) merged as
`d56ae18ae0ce3132acf16ac7d56c52a9604c6a31`. PR verify
[run 35637055401](https://github.com/anderskhv/tinct/actions/runs/35637055401)
passed all three jobs. Serialized production deploy
[run 35638636285](https://github.com/anderskhv/tinct/actions/runs/35638636285)
and post-merge verify
[run 35638636481](https://github.com/anderskhv/tinct/actions/runs/35638636481)
both completed successfully on the immutable merge commit. Production serves
`/assets/index-CdxhFG7Y.js`; the workflow matched the served bytes to the built
bundle before acceptance.

The production suite passed the full Chromium/WebKit reader-panel matrix,
including full-viewport phone Contents, separate Cover and Preface navigation,
selection and saved-highlight behavior, mounted-cover return, reader position
invariants and desktop panels. It also passed library/preparation, focused-cover
priority, Currently Reading, featured preview, responsive landing/library and
hyphenation checks. Durable artifacts are the
[reader report and screenshots](https://github.com/anderskhv/tinct/actions/runs/35638636285/artifacts/10657613057)
and
[library/preparation evidence](https://github.com/anderskhv/tinct/actions/runs/35638636285/artifacts/10658200849).

These muted headless checks do not certify the subjective transition or loading
speed on a physical iPhone. The agreed device window still covers the
Cover/Preface animation, touch focus treatment and perceived cold/warm library
load.
