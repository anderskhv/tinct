# Desktop library verification — 8 September 2026

Changes: search above desktop shelves, immediate results under search, full-width category headings directly above their books, library selections and recent-reader redirects opening chrome=v2. Mobile layout retained. Explicit full/mini voice trial survives navigation.

Production Playwright checks passed at 1440×900 and 390×844: visible initial search, Hamlet search results, Drama owning the full-width book grid, unflagged Ulysses selection opening chrome=v2, and retained mobile layout. Screenshots:

/Users/andershvelplund/.codex/visualizations/2026/09/08/01a07ff0-a87f-7031-8b2f-d050d06d52bd/desktop-library/

Build and bundle verification passed. Full tests: 1,536 passed, one failed in useLabReadingMemory's sign-in adoption test. That same failure reproduces alone with all changed production files restored to the prior committed version. No reading-memory implementation was changed in this patch. This is an existing test/baseline issue requiring separate investigation; do not report the complete suite as green.

Deploy succeeded. Worker version: 17587b3c-c928-4751-8274-2e46696533e4. Live bundle: /assets/index-CFwrL3TE.js; SHA256: 716cc9e0c57f0afae320aeb8bc2df2b77198ae24941502c262f8be2650c9f5df. Production bytes match the local build; refreshed routing import verified.
