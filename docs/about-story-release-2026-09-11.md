# About story publication — September 11, 2026

Approved private Sites revision 20 (source 73cf41b6) is now public at
https://tinct.app/about. Imported static assets are isolated under
`/assets/about-v20/`. Original/shatter variants and private Sites configuration
were not published. Bootstrap and iframe JavaScript are externalized to retain
the existing production CSP; reader code, routing, dependencies and settings
are unchanged relative to live baseline 240dc0f3. The usual sitemap build refresh
is included. Existing newer character packages and audio holds are preserved.

Release commit 840b67fb. Direct `npm run deploy` succeeded; no Actions run used.
Worker version b61f495d-adb8-457c-96d6-3f4969af257e.
Reader bundle index-dFCbEOCk.js, SHA256
d70a46211064d868915e0f95b43493f2d4ef0fb3ee63ac867291e035bc4a2b18.
The build-time timestamp changes the bundle name, not reader behaviour.

Validation: 1,664 app tests, three static publication tests, build and
verify-bundle pass. Live desktop 1440×900 and mobile 390×844 story checkpoints
have no browser errors, broken images or horizontal overflow. Inspected opening,
books, audio and ending screenshots. Live /lab/phone opens Genesis 1 correctly;
its JavaScript bytes match the deployed build exactly, with no page errors.
This is a publication smoke check, not a new complete reader regression audit.

Artifacts: `/Users/andershvelplund/Documents/Projects/Tinct/output/tinct-about-production-2026-09-11/`.

Maintenance: `app/scripts/import-about-story.mjs` accepts an approved static
Sites export directory. Run its static tests and browser verification after any
new import. Never deploy an older reader checkout to update this page.
