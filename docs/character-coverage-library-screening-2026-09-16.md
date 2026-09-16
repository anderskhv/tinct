# Character coverage — library-wide screening pass (2026-09-16)

Scope: the 97 published books other than The Republic, the Bible, and War
and Peace, which have their own dedicated ledgers documenting much deeper
passes. This is a **screening** pass, not a per-book deep audit — it exists
to triage the remaining library and make two concrete fixes as a worked
example, not to certify any of these 97 books.

## Tool: `books/characters/library_scan.py`

For every book, extracts a capitalized-word frequency table from the
source text (both editions where present) and flags any word appearing
8+ times whose literal text is not already covered by some existing
mention. Output: `books/characters/library_scan_report.json` (2,392
flagged candidates across 96 of the 97 books).

**This is a noisy heuristic, not a finding.** Spot-checking the top
results showed the large majority are false positives: stage directions
(`Enter`, `Exit`, `Exeunt` in the plays), contractions split oddly by the
word regex (`I'm`, `I'll`, `It's`), common nouns/ethnonyms (`Athenians`,
`God`, `State`), and — importantly — **possessive and ALL-CAPS forms of
already-covered names** (`Darcy's` flagged even though `darcy` has a card;
`BLOOM` flagged in `ulysses` even though `bloom` is a central card,
because Joyce's newspaper-headline typography in the Aeolus episode
renders the name in caps, which the mention-matching doesn't currently
catch as the same person). The ALL-CAPS case is a real, if narrow,
occurrence-linking gap worth a future look at `ulysses` specifically, but
is not evidence the character is missing.

## What spot-checking the flagged list actually found

Manually checked the four books with the lowest card counts among the
flagged high-frequency results (`moby-dick` 15, `don-quixote` 21,
`crime-and-punishment` 19, `great-expectations` 18) against their actual
existing character lists, not just the raw flag:

- **`moby-dick`, `crime-and-punishment`: no real gap found from this
  check.** Both already have solid coverage of their major named
  individuals (`crime-and-punishment` already has `luzhin` with alias
  `Pyotr Petrovich`; the low card count reflects a genuinely small named
  cast for these books, not an omission this pass could confirm).
- **`great-expectations`: real alias gap, fixed.** Magwitch adopts the
  name "Provis" partway through the book (57 occurrences) — not
  previously an alias on the `magwitch` card, so 57 real occurrences of
  him under that name were unclickable. Added `'Provis'` to his alias
  list. His `firstMention` is unaffected (his original marsh-scene
  appearance under his own name still comes first chronologically), so
  this is not a spoiler risk — the name is introduced by the text itself,
  in dialogue, as something he says about himself.
- **`don-quixote`: real missing-character gap, fixed.** The interpolated
  novella "The Ill-Advised Curiosity" (read aloud from a found manuscript
  partway through Part I) has its own cast — Anselmo (64 mentions),
  Lothario (137 mentions), Camilla (140 mentions) — none of which had
  cards despite Lothario and Camilla each having more raw mentions than
  several already-carded major Don Quixote figures. Added all three as
  `supporting`-tier cards.

Both fixes: compiled via `build_generic.py`, round-trip validated against
both live editions (0 errors), 0 dropped entities in either edition, all
pre-existing card bodies for both books verified byte-identical (no
regressions).

## What this pass does NOT establish

- **96 of 97 remaining books have not been read closely.** This screening
  only checked 4 of the flagged books by hand; the other ~2,300 flagged
  candidates across ~92 books have not been individually reviewed for
  real-vs-noise, and plenty of real gaps almost certainly exist among
  them — the noise rate observed (roughly 4 real signals out of the
  ~32 top-ranked candidates sampled) suggests a nontrivial but
  minority-real hit rate, not that the flagged list can be trusted
  as-is or dismissed as-is.
- **No Republic/Bible-style disposition-by-disposition sweep** (every
  candidate given an explicit linked/excluded/ambiguous label) was done
  for any of these 97 books. That is the standard the assignment sets,
  and it has only been met for the three priority books.
- **No homonym-family audit** (the technique that found the Bible's Herod/
  James/Mary/John/Joseph conflations) was run against any of these 97
  books. Several of them (the history plays especially — `henry-v`,
  `henry-iv-part-2`, `richard-iii`, `king-lear`) are exactly the kind of
  text with repeated titles and same-family names where that class of bug
  is most likely to exist, and none of that has been checked here.
- **No spoiler audit, no in-reader verification**, for the same reasons
  stated in every other ledger this session.

## Recommended next-priority order (based on this screening only)

1. Shakespeare history plays and other multi-character-family texts
   (`henry-v`, `henry-iv-part-2`, `richard-iii`, `king-lear`, `hamlet`,
   `macbeth`) — homonym-audit-style risk (titles/dynasties reused) plus
   already substantial card counts suggesting real investment already
   made, worth protecting with a correctness check.
2. The Russian/19th-century novels with comparatively low card counts
   relative to their casts (`anna-karenina` 19, `brothers-karamazov` 15,
   `jane-eyre` 20, `frankenstein` 17, `pride-and-prejudice` 23) — apply
   the same frequency-scan-plus-manual-read technique used for War and
   Peace.
3. `ulysses` — investigate the ALL-CAPS Aeolus-episode occurrence-linking
   gap specifically.
4. Everything else, by the same method, continuing until the full 97 are
   covered to at least this screening depth, then deepened per book as
   time allows.

## Release status

Both concrete fixes (`great-expectations`, `don-quixote`) are written to
`app/public/data/characters/*.v1.json` on branch `claude/great-clarke-mugpy4`,
same not-yet-live status as every other change this session. The screening
tool and its report are committed for reuse in continuing this work.
