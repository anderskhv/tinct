# Berean Standard Bible (BSB) — provenance and rights

**Prepared:** 2026-09-11, content-only staging work. Not published, not merged, not deployed.

## What this replaces

`app/public/data/editions/bible-modern-en.json` (and by inheritance `bible-modern-da.json`,
translated from it) was found in the 2026-09-11 translation audit to reproduce copyrighted
NIV (2011, Biblica) text at every sampled location (11 verse-groups, 6 books, 4 genres —
see `docs/modern-english-translation-audit-2026-09-11/per-book-notes/bible.md`). Note the
calibration correction from the follow-up independent review: that finding establishes
**substantial, unambiguous NIV matches at every sampled point**, not proof that "the entire
file is verbatim NIV" — the sampled fraction alone is sufficient reason to withhold the file,
but claims about the *whole* file's composition beyond the sampled locations are not
established. Either way, the fix is the same: replace it with a verified public-domain
source rather than trying to patch it, since the underlying generation likely drew on NIV
for at least part of its content and can't be trusted to be clean elsewhere. See
`docs/content-release-2026-09-11/defect-ledger/` for the reconciled Task 2 write-up.

## Source

- **Text file:** `bsb.txt`, downloaded from `https://bereanbible.com/bsb.txt` on 2026-09-11.
  - Retrieved sha256 (first 16 hex): `2ac3af1de52d4e68` (full file: run
    `sha256sum bsb.txt` to reproduce; file is committed alongside this document).
  - Format: tab-separated `Book Chapter:Verse<TAB>Verse text`, one BSB verse per line,
    31,102 verses, 66 books, plain UTF-8 text with a 2-line header restating the public-domain
    dedication.
- **Official site:** `berean.bible` (parent site; `bereanbible.com` is the BSB-specific
  distribution domain explicitly named on the terms page). Both are run by the Berean
  Bible Translation Committee in cooperation with Bible Hub, Discovery Bible, and
  OpenBible.com.
- **Cross-check:** Genesis 1:1 independently verified against `biblehub.com/bsb/genesis/1.htm`
  (a named co-producer site) on 2026-09-11 — text matches verbatim. See
  `biblehub_gen1_crosscheck.txt` in this folder for the saved excerpt.

## Rights — verified directly against the authoritative source

Full page saved verbatim: `berean-terms-2026-09-11.html` (fetched directly from
`https://berean.bible/terms.htm` on 2026-09-11, not paraphrased from memory or a
third-party summary).

Exact quoted language from that page:

> **Terms and Conditions — April 30, 2023**
> The Berean Bible and Majority Bible texts are officially **dedicated to the public
> domain** as of April 30, 2023. **All uses are freely permitted.**
>
> **Attribution Notice (appreciated but not required):** The Holy Bible, Berean Standard
> Bible, BSB is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and
> the Berean Bible Translation Committee. This text of God's Word has been dedicated to the
> public domain.
>
> **Derivatives and Adaptations:** By definition all public domain materials may be freely
> reproduced, integrated, and adapted for both free and commercial resources. All
> applications that maintain the verbatim text from the above Berean sites are invited to
> bear the Berean name. For example, apps, audio, video, print reproductions, and
> commentaries with cited verses are all encouraged to use and cite the official text. For
> derivative works that vary from the official text, we respectfully request that the
> Berean name is not used.

Additional confirmation, from `berean.bible/downloads.htm` (also fetched directly):
"Developers and Publishers are now free to produce and sell the full Berean Bible in any
print format." Bulk downloads are explicitly offered in USFM, USX, USJ, XLSX, TSV, plain
text, and DOCX at `bereanbible.com/bsb_*`.

**Determination:** Public domain (CC0-style unconditional dedication), commercial use
explicitly permitted, no attribution required (though this package does attribute, per
the encouragement above). No jurisdiction carve-out or noncommercial restriction found on
the terms page. This clears both the US and Denmark/EU commercial-distribution questions
that blocked several other candidates in the September audit (e.g. Loeb Classical Library
translators whose life+70 EU term hadn't run out) — a public-domain dedication by the
rights holder is not subject to the "life + 70 years" duration question at all, since no
copyright is being asserted to expire.

Tinct's own use here (verbatim text, unmodified, attributed) is squarely within "works
that maintain the verbatim text" — using the name "Berean Standard Bible" for this edition
is expressly invited by the source, not just tolerated.

## What was NOT done (per the task's explicit instruction)

- **No modernizing, paraphrasing, or mixing with NIV or any other translation.** Every verse
  in the staged file is the unmodified BSB wording from `bsb.txt`. The only additions are
  Tinct's existing house-style inline superscript verse numbers (see EDITION-METADATA.md)
  and paragraph grouping — no words were changed, added, or removed from the BSB text
  itself.
- **No mixing with the World English Bible Catholic package** (see
  `books/staged-replacements/bible-web-catholic/` — kept as a fully separate package, not
  appended or merged here).
