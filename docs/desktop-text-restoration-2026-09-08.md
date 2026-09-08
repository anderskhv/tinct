# Desktop text restoration hotfix — 8 September 2026

Source commit: 490e2459.

Reproduced on production in Ulysses after navigating to a later page and reloading: chapter text existed in the DOM, but the direct passage had visibility:hidden through is-measuring-visible-page. Desktop settles previous pages in the background, so this condition can hide a restored page for a prolonged period. Fresh first-page checks had missed this transition.

The hiding condition now applies only to phone chrome. Desktop keeps the loaded passage visible while existing pagination continues. No position writer, page-breaking algorithm, compare swap or per-frame layout work was added or changed. Intermediate desktop page adjustments can still appear during settling; avoiding a blank page takes priority in this hotfix.

Full tests: 140 files, 1,543 passed, including V1 snapshot. Build and verify-bundle passed. Browser regression: app/scripts/check-desktop-reader.cjs opens Ulysses, navigates to a later page, reloads and asserts nonempty, visible text. Production result and deployment identity follow below.

Deploy succeeded. Worker version: e14c2d85-094e-40b8-8bac-e21376b6b46e. Live bundle: /assets/index-B802AYlE.js; SHA256: 50b170ec5d0c14065093d4aadb0062eb425835ae451b754eb0f71439f8bb6950. Production bytes match the local build; refreshed routing import verified.

Production regression passed at 1423×772, including later-page reload while the hidden measurement host remained active. Passage visibility was visible and the screenshot contains actual book text. Screenshot: `/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/desktop-text-fix/production.png`.

Additional visual verification: six successive production screenshots each contained 2,521 dark text pixels in the first-line region, with matching on-screen word bounds and visible text. The regression now also asserts painted text pixels in the screenshot, excluding the header and footer, rather than relying on DOM presence alone.
