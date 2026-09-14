# Desktop Chat spacing and header

Reviewed: 2026-09-14

Status: implemented and browser-verified locally; deployment pending.

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

Next action: confirm deployment and run the same checks on production.
