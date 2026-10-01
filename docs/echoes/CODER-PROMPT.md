You are implementing a new feature in the Tinct repo (cloud environment, follow `AGENTS.md`; this is an explicitly assigned coding and release task from Anders).

Read first, in this order:
1. `AGENTS.md` (hard rules, release path, verification) and `CLAUDE.md` invariants (you are not touching the legacy reader).
2. `docs/echoes/FEATURE-SPEC.md` (the full spec: follow it exactly).
3. The mockups in `docs/echoes/mockups/*.dc.html` and `docs/echoes/mockups/canvas.json` (look and copy).
4. The content in `docs/echoes/data/*.json` and images in `docs/echoes/assets/`.
5. The code you will extend: `app/public/lab/library_2/app.js` (`renderIntro()` and the `data-tab` buttons; tabs currently Preface, characters tab titled by `galleryTitle`, Pick edition), `app/public/lab/library_2/index.html` (`.intro-tabs`), `reviewed-introductions.js` (`loadReviewedIntroduction`, `reviewedCast`), `intro-review.css`, and the existing tests `app/src/reviewedIntroductions.test.ts` and `app/src/libraryTwo*.test.ts`.

Task: add an "Echoes" tab to the book introduction screen for exactly five books (`frankenstein`, `odyssey`, `crime-and-punishment`, `the-prince`, `meditations`), driven by one JSON file per book at `app/public/lab/library_2/echoes-data/<id>.json`, with self-hosted images in `echoes-assets/`. Cards are our own markup that link out (no embeds, no third-party scripts, no runtime calls to TikTok/X/YouTube/Reddit, no hotlinked images). Web links open in a new tab; in the Android APK use the Capacitor in-app browser. Books without a data file must look exactly as they do today. If the data fetch fails, hide the tab and leave the intro working. Implement the spoiler-visibility helper and tests described in section 6 of the spec, but no spoiler UI. Implement the photo-credits control (CC BY / CC BY-SA licences require visible credit).

Constraints:
- Match the existing intro styling and CSS variables; do not hard-code the mockup hex colours unless no variable exists.
- The tab row must not wrap or clip at 360/390 px.
- English only; do not touch Danish files.
- Do not modify unrelated books, the legacy `src/App.tsx` reader, or position/sync code.
- Do not invent content: use the data files as given. Items whose `source.status` is not confirmed stay in, but their `source.note` must never be rendered.
- Do not add dependencies.

Definition of done:
1. Tests added per spec section 7 and `npm test` green (run the focused suites you touched plus the full suite before release); `npm run build` and `npm run verify-bundle` pass.
2. Browser verification at 390x844 and desktop on the five books (screenshots saved under `docs/echoes/qa/`), including credits popup, link attributes, tab row at 360/390, a book with no Echoes tab, and "Begin reading →". APK check of the in-app browser if you can build it; if not, say exactly what was not verified.
3. Release through the approved GitHub Actions deploy path per `AGENTS.md`, then verify on production `https://tinct.app/lab/library_2/` (confirm the new bundle/asset hashes), report the deploy run status.
4. Final report must include: what shipped, files changed, test results, production checks, the list of open items from spec section 10 (so Anders can act), and a `Needs your decision` line if anything blocks you (for example platform-terms questions).

If something in the spec conflicts with how library_2 actually works, prefer the existing architecture, make the smallest change that achieves the intent, and note the deviation in your report.
