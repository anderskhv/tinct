# World English Bible (Catholic Edition) — provenance and rights

**Prepared:** 2026-09-11, content-only staging work. Not published, not merged, not deployed.
**Kept fully separate from the BSB package** (`books/staged-replacements/bible-bsb/`) per
the task instructions — no text from either package has been mixed into the other.

## Source

- **USFM package:** `usfm/` (73 files), from `https://ebible.org/Scriptures/eng-web-c_usfm.zip`,
  downloaded 2026-09-11. Zip sha256 available on request (re-download reproduces it; the
  73 unzipped `.usfm` files are committed in this folder as the primary artifact).
- **Official listing page:** `https://ebible.org/eng-web-c/` — "World English Bible
  (Catholic Edition)... a subset of the World English Bible Update with the traditional
  Catholic book set [and book order]."
- **License file, saved verbatim:** `webc-copr-2026-09-11.html` (the package's own
  `copr.htm`, fetched together with the USFM zip on 2026-09-11).

## Rights — verified directly against the authoritative source

Exact quoted language from `copr.htm` (this specific edition's own license file, not a
general WEB page):

> The World English Bible is in the Public Domain. That means that it is not copyrighted.
> However, "World English Bible" is a Trademark of eBible.org.
>
> You may copy, publish, proclaim, distribute, redistribute, sell, give away, quote,
> memorize, read publicly, broadcast, transmit, share, back up, post on the Internet,
> print, reproduce, preach, teach from, and use the World English Bible as much as you
> want, and others may also do so. All we ask is that if you CHANGE the actual text of the
> World English Bible in any way, you not call the result the World English Bible any
> more. This is to avoid confusion, not to limit your freedom.
>
> 2020 stable text edition.

**Determination:** Public domain, commercial use explicitly permitted, no attribution
required. Same naming condition as BSB (don't call a *modified* version "World English
Bible") — irrelevant to Tinct's use here since the plan is verbatim, unmodified text. No
noncommercial restriction, no jurisdiction carve-out. Clears both US and Denmark/EU
commercial-distribution questions for the same reason as BSB: this is an unconditional
public-domain dedication by the rights holder, not a copyright with an expiration date to
verify.

## Coverage — verified against the standard Catholic 73-book canon

See `validation-report.md` for the full per-book table. Summary:
- **73 / 73 books present**, in correct Catholic canonical order (Old Testament through
  Baruch and the two Maccabees books, then the 27-book New Testament).
- **All 9 deuterocanonical/expanded books confirmed present:** Tobit, Judith, Esther
  (with the Greek additions), Wisdom, Sirach, Baruch, Daniel (with the Greek additions),
  1 Maccabees, 2 Maccabees.
- 1,328 chapters, 35,384 verses total.
- 20 chapters have a documented, expected verse-number gap (critical-text omitted verses
  and known Deuterocanon versification variance) — see the note at the bottom of
  `validation-report.md`; these are not missing/corrupted content, confirmed by directly
  inspecting the raw USFM for a sample (Luke 17:36).

## What this package does NOT include

- **No mixing with BSB.** Entirely separate source, separate staged JSON file
  (`bible-catholic-en.staged.json`), separate folder.
- **No chapter numbering compatible with the existing `bible-kjv-en.json` Protestant
  66-book scheme.** This is a structural fact, not an oversight — see
  `INTEGRATION-NOTES.md` for why, and what the app agent needs to decide before this can
  become a real edition in the app.
- **No `sections` (book/testament navigation tree) built yet.** The staged JSON's
  `sections` field is an empty placeholder. Building this requires deciding the actual
  app-facing grouping (does Tinct want "Old Testament / New Testament" with the
  deuterocanonical books interspersed in their canonical reading position, as done here,
  or a separate "Deuterocanonical Books" section for clarity? Both are legitimate
  editorial choices) — left to a follow-up content pass once the integration approach in
  `INTEGRATION-NOTES.md` is decided.
