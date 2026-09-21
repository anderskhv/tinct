# Reader, library and brand batch — 21 September 2026

Status: release candidate implemented; production deployment and acceptance pending.

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

## Remaining release work

Finish cloud acceptance, merge the reconciled batch, wait for serialized GitHub Actions deployment, verify the exact production bundle and visual cases, then record evidence here and in product-current. Actual iOS/Android installation and third-party thumbnail cache refresh cannot be established by headless browser checks.
