# Character coverage — full-library screening pass, round 2 (2026-09-17)

Following the 10-random-book batch (see
`character-coverage-library-batch-2026-09-17.md`), which found real gaps
in 3 of 10 books, prioritized the remaining ~87 books by a signal derived
from that result: low card count *relative to* how name-dense the actual
text is (treatise/epic/history/huge-cast novel vs. play or children's
book with an already-thorough count), rather than checking all 87 at
equal depth.

## Method change: a new tool for edition-inconsistent packages

Rebuilding `iliad` via `build_generic.py` (the same tool used throughout
this session) silently dropped 9 characters from `modern-en` — the
released package uses different aliases per edition for entities whose
name changes by translation (Roman divine names in this edition's
Pope-style `original-en` vs. Greek names in `modern-en`: Jove/Zeus,
Juno/Hera, Minerva/Poseidon, etc.), which `build_generic.py`'s
single-shared-alias-list model can't reproduce. Caught before release
(the drop count is printed by the tool itself) and reverted rather than
shipping a regression.

Wrote `books/characters/add_entity.py`: adds exactly one new entity to an
existing package via bare-name regex binding, in every edition
independently, without touching any existing character or mention.
Asserts no id collision and no span collision with existing mentions
before writing anything. Used for every addition in this round where an
`entities/*.py` source file did not already exist for the book, to avoid
the same class of regression.

## Fixed books

**`crime-and-punishment` — patronymic spelling bug, not a missing
character.** The existing `luzhin` card's patronymic alias was spelled
"Pyotr Petrovich" (with a c); this Garnett-style translation actually
spells it "Pyotr Petrovitch" (with a v) — 122 real occurrences, zero
matches. The `raskolnikov` card had the same problem for "Rodion
Romanovich" vs. the text's "Rodion Romanovitch" (86 occurrences). Fixed
both by adding the correct spelling as an additional alias (kept the
original spelling too, harmlessly, in case any occurrence does use it).
Checked every other patronymic alias in the file against actual text
spelling; the rest were already correct, including one (`ilya-petrovich`)
that already carried both spellings as a precedent for exactly this
pattern. This is the same *class* of bug as the Bible's Zidkijah/Zedekiah
case from earlier in this session — a correct card whose alias doesn't
match the edition's actual transliteration — and, per that precedent, was
checked for in the other Russian-translation books in this batch
(`anna-karenina`, `brothers-karamazov`): both already use the "-vitch"
spelling consistently, confirmed against source text, no bug found there.

**`anna-karenina`: 19 → 20.** Added Varenka (140 mentions), Kitty's
companion at the German spa — a real, previously uncarded character, not
a spelling issue.

**`iliad`: 32 → 33.** Added Meriones (62 mentions), a named Cretan
captain, via the new additive tool (see above) to avoid the
edition-alias regression.

**`the-histories`: 21 → 22.** Added Amasis (78-80 mentions), King of
Egypt, discussed at length in Herodotus's account of Egypt.

**`odyssey`: 26 → 29.** Added Aegisthus (26 mentions — Agamemnon's
murderer, cited early as a moral example), Pisistratus (25 mentions —
Nestor's son who escorts Telemachus), Mentor (19 mentions — the actual
person whose form Athena borrows; checked the existing `athena` card's
aliases first to confirm no conflation, none found).

**`the-aeneid`: 15 → 17.** Added Mezentius (23 mentions, the exiled
Etruscan tyrant) and Mnestheus (21 mentions, one of Aeneas's captains).

**`confessions`: 15 → 16.** Added Moses (25 mentions), discussed at
length in the later books as Genesis's traditional author.

**`brothers-karamazov`: 15 → 17.** Added Nikolay Parfenovitch Nelyudov
(105 mentions — the young investigating lawyer who leads the formal
questioning) and Pyotr Ilyitch Perhotin (95-96 mentions — the official
Dmitri pawns his pistols with, whose evening with Dmitri becomes evidence
in the case). Both entirely missing from the prior 15-card set despite
mention counts well above several already-carded characters.

All nine books: round-trip validated against both live editions (0
errors), 0 duplicate ids, 0 duplicate/colliding mention spans, all
pre-existing card content verified unchanged where a rebuild tool was
used (`crime-and-punishment`, `anna-karenina`).

## Reviewed, no fix made

- **`paradise-lost`** — flagged terms beyond the first 15 are abstract
  nouns and epithets (Powers, Spirit, Serpent, Almighty, Fiend, Eden,
  Chaos) already covered by existing God/Satan/place cards, not new
  individuals.
- **`peloponnesian-war`** — flagged terms are places and ethnonyms
  throughout the scanned range; the existing 17 cards already cover the
  major named generals and statesmen. **Not a certification**: this is
  an 8-book history with a genuinely large cast of minor commanders that
  this screening pass's word-frequency method is not well suited to
  surface (a commander mentioned 3-4 times across a huge text won't clear
  the frequency threshold this scan used). Flagging as a book that would
  benefit from the Bible/Herodotus-style deeper pass rather than another
  screening pass.

## Real-browser verification

Extended `app/scripts/verify-character-fixes.cjs` with 13 more checks
covering every new addition and the crime-and-punishment patronymic fix
specifically (tapping both the corrected Raskolnikov and Luzhin
patronymic forms), plus a sanity check that the iliad rebuild-avoidance
actually preserved the modern-en Greek-name aliases. Run against the same
live dev server / real reader code as every other verification this
session; results recorded in the run log.

## Running total, this session

Deep passes: The Republic (13→99), the Bible (152→~3,014),
War and Peace (22→32). Screening-plus-fix passes across 17 more books:
Don Quixote, Great Expectations, essays-montaigne, divine-comedy,
ulysses, crime-and-punishment, anna-karenina, iliad, the-histories,
odyssey, the-aeneid, confessions, brothers-karamazov (13 fixed) plus
discourse-on-inequality, oedipus-at-colonus, much-ado-about-nothing,
midsummer, a-little-princess, faust-part-1, frankenstein,
paradise-lost, peloponnesian-war (9 reviewed, no fix needed or found).
**~77 of the 97 non-priority books remain untouched.**

## Release status

All fixes on branch `claude/great-clarke-mugpy4`, not yet live.
