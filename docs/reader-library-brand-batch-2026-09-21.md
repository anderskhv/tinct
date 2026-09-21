# Reader, library and brand batch — 21 September 2026

Status: implementation and cloud acceptance in progress. Not deployed.

## Approved scope

Resume PR #130's six reader regressions: saved highlight identity wins over word lookup, seamless native highlight paint, dark fold confined to the gutter, inset Reading Now focus, mobile menu clearance, and quiet progress matching the header. Keep the previously shipped selection/definition/verse/TOC work.

Move **Cover and preface** from Reading Now into the chapter tree above its first entry. Reuse the existing preparation route without changing the reading tuple.

Discovery starts on Frankenstein inside an extended published collection. A fresh load does not restore an edge selection; explicit Back restores the user's shelf. Currently Reading uses the same cover drag/wheel motion, preserving progress, removal, and Continue. Covers expand to the left beside desktop preparation and into a full phone surface. Reduced motion is respected.

Install the final Design 1 kit (approved in that task): drawn t icons, opaque Apple icon, Android maskable icon, manifest, generic and per-book social imagery. Preserve the final approved landing-page wording. Public metadata uses catalogue data only; the passage-card sample is an asset, not permission to publish private notes/chat.

## Mechanisms and verification

Highlight clicks use painted record identity, including overlap and hyphen fragments. The native highlight Safari selectability selector must beat the reading stage's user-select rule. Paint-only seam joins fill fractional cracks without changing text layout. The Chrome pixel checker reads ready geometry atomically across React renders.

The two library layouts share one cover reel implementation rather than independent drag rules. Existing reading memory and position resolution stay authoritative.

Cloud verification must include focused selection and position regressions, all app tests, build and bundle gates, desktop/mobile screenshots, new and returning library gestures, preparation boundaries and metadata. Generate book-card variants in the cloud from current catalogue metadata and real covers; review long-title and missing-cover handling before committing generated files.

## Remaining release work

Finish cloud acceptance, commit generated brand variants, merge the reconciled batch, wait for serialized GitHub Actions deployment, verify the exact production bundle and visual cases, then record evidence here and in product-current. Actual iOS/Android installation and third-party thumbnail cache refresh cannot be established by headless browser checks.
