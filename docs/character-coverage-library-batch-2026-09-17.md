# Character coverage — 10 randomly selected books (2026-09-17)

Per request: 10 books randomly selected (Python `random.sample`, unseeded)
from the 97 not yet given a deep pass, excluding Republic/Bible/War and
Peace/Don Quixote/Great Expectations (already handled). Sample:
`discourse-on-inequality`, `oedipus-at-colonus`, `much-ado-about-nothing`,
`divine-comedy`, `midsummer`, `essays-montaigne`, `ulysses`,
`a-little-princess`, `faust-part-1`, `frankenstein`.

Each book: existing card list read directly, cross-checked against a
frequency scan of the source text, and every flagged high-frequency
candidate spot-checked in context (not trusted blind) before deciding
fix vs. no-fix.

## Fixed (3 books, real gaps confirmed and closed)

**`essays-montaigne`: 10 → 17 cards.** The existing package's 10 cards
were mostly essay-theme personifications (Death, Skepticism, Custom) plus
a few people; the seven most-cited classical authorities in the text had
no cards at all despite huge mention counts: Cicero (200), Plato (190),
Horace (128), Caesar (115), Aristotle (76), Lucretius (75), Alexander
(64). Added all seven. Flagged, not fixed: two pre-existing cards
(`seneca-and-plutarch`, `cato-and-roman-exemplars`) merge multiple
distinct historical people under one id — a real identity-resolution
defect by this project's standard, left for a dedicated future pass since
splitting it needs the same per-occurrence binding technique used for the
Bible's Zedekiahs. Also flagged: "Caesar" (109 unprefixed occurrences)
could be Julius or Augustus Caesar in a given instance; bound to one
`julius-caesar-montaigne` card as a documented, stated limit rather than
guessed apart occurrence-by-occurrence.

**`divine-comedy`: 22 → 28 cards.** Added Saint Peter (22 mentions),
Adam (7), Emperor Frederick II (8), Piccarda (4), Justinian (2), and Pope
Boniface VIII (2) — all clearly identifiable figures Dante names with no
existing card. Explicitly **not** exhaustive: this poem's allusion density
is comparable to The Republic's, and a name search turned up further
candidates (multiple different people all called "Guido" — da Montefeltro
and Cavalcanti at least) that were left unresolved rather than merged
under one guessed identity, since Dante genuinely does use the bare name
for more than one person and this pass had no time budget to verify each
occurrence individually.

**`ulysses`: 19 → 26 cards.** Joyce's cast of named Dubliners is much
larger than the prior 19 cards suggested; added seven real, substantial
figures from the funeral (Hades) and pub (Cyclops) episodes: Joe Hynes
(131 mentions), Ned Lambert (67), Jack Power (67), Alf Bergan (58), Corny
Kelleher (24), Tom Kernan (13), Crofton (7). Noted, not fixed: the
Aeolus-episode newspaper-headline typography renders "BLOOM" in all caps,
which the current alias matching (case-sensitive) doesn't catch as the
same person as `bloom` — flagged as a narrow, real occurrence-linking gap
for a future look, distinct from a missing-character gap.

All three: compiled via `build_generic.py`, round-trip validated against
both live editions (0 errors), 0 dropped entities in either edition, every
pre-existing card's body verified byte-identical to the released file (no
content regressions). Two build-time bugs caught and fixed before release:
`essays-montaigne`'s "death" and "the-body-and-experience" cards used
sentence-fragment aliases copied only from `original-en`'s wording; the
`modern-en` paraphrase uses different wording for the same passage, so
both editions' actual surface text were added as separate aliases (this
is a real difference from name-based aliases, which don't usually vary by
translation, worth remembering for any future essay/treatise-style book
with theme cards rather than person cards). `divine-comedy`'s `virgil`
card was aliased only to `original-en`'s "Virgilius"; `modern-en` uses
"Virgil" — added as a second alias.

## Reviewed, no fix made (7 books)

Spot-checked the top flagged candidates in source context for each; found
noise, not real gaps, in every case:

- **`discourse-on-inequality`** (45 cards already) — top flag ("State")
  is the common noun, not a name. Already covers essentially every
  classical figure Rousseau cites.
- **`oedipus-at-colonus`** (54 cards already) — flags are pronouns, place
  names (Thebes, Athens), and imperative verbs (Say, Speak, Hear, Tell).
  Already covers minor deities and mythological references down to the
  Nereids and Muses.
- **`much-ado-about-nothing`** (60 cards already) — flags are stage
  directions (Enter/Exit/Exeunt), contractions, and "Signior" (a title,
  not a name). Already covers minor named roles like the individual
  watchmen.
- **`midsummer`** (72 cards already) — same pattern; already covers
  minor mythological references (Perigenia, Aegles, Antiopa) most editions
  wouldn't bother with.
- **`a-little-princess`** (86 cards already) — flags are almost entirely
  possessive forms of already-covered names (`Sara's`, `Minchin's`).
- **`faust-part-1`** — the flagged "German-looking" words (Und, Ich, Der,
  Iam) are literally embedded German text: this edition's `original-en`
  file is not pure English, it carries facing-page German alongside the
  translation. Not a character gap; a labeling/content question outside
  this task's scope, noted for whoever owns that edition file.
- **`frankenstein`** (17 cards) — genuinely small named cast in this
  novel; flags are contractions, places, and interjections. Already
  covers the full Frankenstein/De Lacey/Walton family groups.

**This is a spot-check, not a certification** — for the 7 "no fix" books,
only the top handful of flagged words per book were manually read in
context; a full disposition-by-disposition sweep of the kind done for The
Republic was not performed on any of these 10.

## Real-browser verification

See `app/scripts/verify-character-fixes.cjs` (extended this session) and
its companion run log for the actual tap-by-tap results against a live
dev server using the real reader code and real character data. Results
recorded separately once the run completes.

## Release status

All three fixed books' data is written to `app/public/data/characters/*.v1.json`
on branch `claude/great-clarke-mugpy4` — not yet live, same status as
every other change this session.
