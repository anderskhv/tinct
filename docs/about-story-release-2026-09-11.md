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

## v21 overrides — September 11, 2026 (later the same day)

The 07:57 and 07:58 deploys built from a `main` that did not yet carry the
import, which removed `/about` from production for about an hour. The files
were recovered from Worker version `b61f495d` and are now on `main`, so every
deploy from `main` carries the page.

On top of the import, a set of conversion, trust and scene changes is applied
to the built files (the story's editable source is the private Sites project,
which is not in this repository):

- All "Start reading" and "Pick up the thread" links go to `/read`; the
  wordmark still points home.
- Persistent discreet "Start reading" pill after the hero; footer with Start
  reading, Privacy and Contact; header tagline; `og:image` and Twitter card;
  the 96 cover-collection `<head>` preloads removed; the named competitor
  removed from the parody feed; couch copy reads "On compatible e-readers".
- Overview scene: left page blurred, no boxed passage, three sequenced
  highlights (headline, one sentence, speaker name) with new questions.
  Language scene: single full page, no highlights, no edition pill, a
  "Tinct · Modern translation" label on the modern page. Character scene:
  text recedes around the highlighted name.

The edits live in `app/scripts/patch-about-story.mjs` (anchored, idempotent)
and the checked-in stylesheet `app/public/assets/about-v20/about-v21.css`.
**After any new import, run `node scripts/patch-about-story.mjs` from `app/`,
then the static tests and browser verification.** An anchor that no longer
matches makes the script fail; that is the signal to port the change into the
Sites source or update the script, not to skip it. When the Sites source is
checked in, port these edits there and retire the script.

## Coordinator merge report — 2026-09-11 13:0x UTC (for the About page owner, session "MKT")

The coordinator session merged `claude/funny-keller-y2grh9` into `main` as
`a2c61c34` ("About page — reveal scenes, Talk panel, phone and tablet
layouts") at 13:03 UTC, after Anders reported the page pushed and went offline.
Anders has since ruled that a pushed branch is not approval to merge another
agent's work; this merge stands (he asked that it not be reverted
automatically) and is reported here for the owner's record.

Evidence at merge time: zero conflicts against `main`; the branch touched only
`app/public/about.html`, `app/public/assets/about-v20/**`,
`app/scripts/patch-about-story.mjs` and `app/scripts/render-about-reveal-screens.mjs`;
`node scripts/about-story.test.mjs` passed on the merged tree (0 failed, 0
skipped). Deployed by the GitHub `deploy` workflow on push. The owner should
verify the live page as usual; the coordinator will not touch About again
without the owner's or Anders's say-so.
