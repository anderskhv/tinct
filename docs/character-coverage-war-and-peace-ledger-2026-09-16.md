# Character coverage ledger — War and Peace (2026-09-16, first pass)

Scope: `books/characters/entities/war-and-peace.py` →
`books/characters/build_generic.py war-and-peace` → released to
`app/public/data/characters/war-and-peace.v1.json`. Both `original-en` and
`modern-en` compiled independently.

## Starting state

22 cards/edition (matches the assignment's stated baseline). Existing
aliasing already handles some of the "changing forms of address" problem
(e.g. `pierre`: `['Pierre Bezúkhov', 'Pierre']`; `andrew`:
`['Prince Andrew Bolkónski', 'Prince Andrew', 'Andrew Bolkónski']`) but each
character generally has only one or two alias forms — full-name, or
first-name-plus-surname.

## Method

War and Peace is ~590,000 words across 365 chapters. A Republic-style
full paragraph read was not attempted. Instead: extracted a capitalized-
token frequency table across the whole `original-en` text, cross-checked
every name appearing 20+ times against the 22 existing cards, and read
source context for anything with real narrative weight that had no card.

## Added (5 new cards, 22 legacy cards untouched)

| id | role | why it was missing was a real gap |
| --- | --- | --- |
| `anna-pavlovna` | major | Hosts the St. Petersburg soiree that opens the entire novel (chapter 1) and recurs repeatedly as a social/political barometer — ~400 combined mentions of "Anna Pávlovna"/"Schérer," previously uncarded. |
| `lise` | major | Prince Andrew's wife, "the little princess," present from the opening chapters — ~30 mentions, previously uncarded despite `andrew` already being `central`. |
| `count-bezukhov` | supporting | Pierre's father — distinct from Pierre himself, and the subject of the succession plot that drives much of Book I. Surname `Bezúkhov` was previously only aliased to `pierre` via the two-word phrase "Pierre Bezúkhov," so "Count Bezúkhov" (27 occurrences) matched nothing. |
| `mademoiselle-bourienne` | supporting | Princess Mary's live-in companion at Bald Hills, ~100 combined mentions ("Mademoiselle Bourienne"/"Bourienne"), previously uncarded. |
| `bagration` | major | Historical Russian general under whom several already-carded officers serve; ~135 mentions, previously uncarded. |

Round-trip validated against both live edition files (0 offset errors, both
editions). No overlap with any pre-existing alias (confirmed via the
compiler's own overlap-detection, which raises on ambiguity — it raised on
nothing). All 22 legacy card bodies verified byte-identical to the released
file. Neither edition dropped any of the 5 new entities (each matched in
both `original-en` and `modern-en` independently).

## Explicit dispositions for other names found (not authored this pass)

**Real, documented gaps — recurring named figures with no card, deferred
for a follow-up pass:**

- Historical military figures appearing 25+ times each, mostly generals
  and staff officers whose scenes are largely martial/procedural rather
  than personal: Rostopchín (Moscow's governor), Balashëv, Bennigsen,
  Nesvítski, Speránski (a statesman with real narrative weight — arguably
  the next priority after this batch), Túshin (a captain with a genuinely
  personal heroic episode — also a good next-priority candidate),
  Bilíbin, Barclay (de Tolly), Dolgorúkov, Arakchéev, Ilyín, Zherkóv,
  Davout and Murat (French marshals), Dessalles, Daniel, Lavrúshka, Julie
  (Karágina), Weyrother, Willarski, Timókhin, Ermólov, Dokhtúrov,
  Shinshín, Gerásim, Alpátych (the Bolkónski steward — a real supporting
  role, also a good next-priority candidate), Dron, Tíkhon, Mávra
  Kuzmínichna, Hippolyte (Kurágin, Anatole and Hélène's brother),
  Dunyásha.
- Every one of these appears at least 20 times in the text and is a named,
  identifiable individual, not a background reference — none should be
  read as "excluded," only as **not yet authored**. Prioritization
  suggestion for the next pass: Speránski, Túshin, Alpátych, and
  Hippolyte first (each has real personal narrative content, not just
  procedural staff-list presence), then the remaining officers/generals.

## Not addressed this pass: the full patronymic/nickname/address problem

The assignment specifically calls out "first names, surnames, patronymics,
titles, nicknames and changing forms of address" for this book. This pass
added missing *characters*; it did not go back through the 22 existing
cards to add the fuller range of address forms Tolstoy actually uses for
them (e.g., patronymics like "Peter Kirílovich" for Pierre, childhood
diminutives, or a title changing after a marriage). That is a distinct,
still-open task and is **not** claimed as done here — flagging as an
explicit remaining gap rather than silently leaving it implied by "cards
exist."

## Validation performed / limits

- UTF-16 span round-trip: pass, both editions, 0 errors.
- `build_generic.py`'s own alias-overlap ambiguity check: pass, 0 raises,
  both editions independently.
- `python3 -m unittest discover -s books/characters -p 'test_*.py'`: 135
  pass (the-awakening pilot contract suite; no War and Peace-specific test
  exists in this repo to run).
- **Not run**: any playwright/browser-based check — not installed in this
  sandbox, no dev server running. In-reader tap behavior for the 5 new
  cards is unverified.
- **Not done**: the patronymic/nickname alias-expansion task described
  above, and authoring for the ~25 documented-but-deferred names.

## Release status

**Not yet live.** Written to
`app/public/data/characters/war-and-peace.v1.json` on branch
`claude/great-clarke-mugpy4` for Codex integration/app-verification
(including the browser checks this sandbox cannot run) and publication.
