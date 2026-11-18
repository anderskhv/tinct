# The Odyssey, Alexander Pope's verse translation (`verse-en`)

Re-added 11 Nov 2026 at Anders's request ("lets re-add alexander", 5 Nov 2026). Removed in 2f0b7a6752 (April 2026)
when every book was standardised on three editions; this book now has four.

## Source

- Project Gutenberg eBook #3160, *The Odyssey*, translated by Alexander Pope (1725–26). Public domain in the EU, Denmark
  and the US (Pope died 1744).
- `provenance/source-pg3160.txt`: the Gutenberg text with its notice, downloaded 11 Nov 2026,
  sha256 `b375bc6b56f5d87f8173c69f06b02c71e2799c0c97c6ba73dfcaf4e3ffbe1553`.

## Edition

- `app/public/data/editions/odyssey-verse-en.json` (sha256 `1beae5e0ffcd5cd219a8336ef82c1f057629f4c4386b9dfe9fdcc02035a9c77a`): 24 books,
  1,047 paragraphs, 14,172 verse lines, one line per `\n` (Pope's line breaks kept).
- Checked 11 Nov 2026: 14,170 of 14,172 lines appear verbatim in the Gutenberg text (quotes normalised). The two others
  are prose Arguments (Books 3 and 7), unwrapped from Gutenberg's hard line breaks ("sea- shore" → "sea-shore"), with
  one typo fixed in Book 7 ("be relates" → "he relates").
- Unaligned (`aligned: false`): Pope's paragraphs do not match Butler's prose (1,047 against 1,027), so the reader never
  pairs it in Compare and never chooses it as a default. Switching to or from it keeps the chapter and paragraph.
- No recorded audio.
