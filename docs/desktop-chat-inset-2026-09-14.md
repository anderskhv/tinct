# Desktop Chat spacing and header

Reviewed: 2026-09-14

Status: deployed and production-verified at app commit `3c685e8bf`.

Anders requested removal of the two inactive dots and a slightly smaller Chat
panel that leaves some of the second page visible.

The dots were an aria-hidden decorative span, not a control. Chat no longer
renders it. Explicit title/close grid columns preserve the centered heading;
the separate Talk icon remains. Desktop Chat is inset 12–24px from the top and
sides, with 48px below to expose the complete page number and 16px rounded
corners. Phone and Talk geometry are excluded from the new rule.

This changes presentation only: no pagination, position, provider, message-history
or conversation logic changed.

## Checks

- All 2,239 tests in 170 files passed.
- Build and bundle verification passed: `index-Cm9USscO.js`. Existing large-chunk
  and jsdom warnings remain.
- Browser checks passed at desktop 1440×950 in light/dark, tablet 1024×768,
  and mobile 390×844. Dots absent, title centered, visible desktop margins and
  unobstructed page numbers, long replies scroll, composer/close fit, and closing
  Chat preserves the reading location. Each fixture sends one mocked request.
- Reusable check: `app/scripts/check-chat-inset.cjs`; isolated browser contexts
  intercept API/auth/external traffic, so no real provider/account calls occur.
- Local screenshots and geometry: `output/chat-inset/local/`.

## Production verification

[Deploy run 34830104077](https://github.com/anderskhv/tinct/actions/runs/34830104077)
succeeded with 2,239 tests, build/bundle gates, exact deployed JavaScript matching
and all 15 smoke checks. Live bundle: **`index-C38jhtIi.js`**. Worker version:
`1f7734ff-567a-43da-a57b-f14021cceb76`.

All four browser cases passed on production, including `/lab/phone` at 390×844;
every case loaded the CI bundle above. Live desktop Chat has no dots, is inset
from all edges of the second leaf, clears page numbers, scrolls long mock replies,
keeps the composer and Close usable, and preserves place when closed.
At 1440×950 it measures about 650×768px, with 20px top/side insets and 48px below.
No real provider/account operations were performed by the browser checks.

Artifacts: `output/chat-inset/production/results.json`, `1440-light.png`,
`1440-dark.png`, `1024-light.png` and `390-dark.png`.
No remaining work for this scoped presentation change.
