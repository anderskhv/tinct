# Clickable-names full-coverage plan — pilot (2026-09-17)

Following the round-3 screening pass, Anders asked for a proper plan to
make **every named individual clickable, including a figure mentioned
only once** (his example: a minor Italian Dante names in passing, tapped
just to learn "this isn't a key character"). The existing word-frequency
scan structurally cannot do this — it only ever surfaces a book's *most*
mentioned uncarded names, so a once-mentioned figure never has a chance to
appear. This is a new method, not a tuning of the old one.

## Agreed scope and depth (Anders' calls)

- **Scope:** any named individual, including a passing allusion — not
  places, not abstract concepts, unless personified.
- **Card depth for minor figures:** minimal and templated — one line
  drawn from what the text itself says at first mention, not researched
  biography. This is the same pattern already used for Agnete
  (fear-and-trembling), Jonah (moby-dick), and Schopenhauer
  (genealogy-of-morals) in round 3.
- **Order:** largest-cast books first, one book fully finished before
  moving to the next.
- **Priority ranking:** `books/characters/rank_by_cast_density.py`, a
  spaCy PERSON-entity scan across all 100 books, minus surface forms
  already matching an existing card's name. War and Peace, Leviathan,
  Essays (Montaigne), Ulysses, The Histories, Divine Comedy, Moby-Dick,
  Don Quixote, The Aeneid and Paradise Lost lead the list. (The very top
  entries — Ulysses, Leviathan, Essays — are dominated by spaCy
  mis-tagging archaic capitalized abstractions as PERSON, e.g. Hobbes'
  "Reason," "Sense," "Dishonour"; these will need heavier noise-filtering
  before their raw rank means much.)

## New tooling

- `books/characters/rank_by_cast_density.py` — the ranking scan above.
  Processes each book in bounded 500k-character chunks (raised
  `nlp.max_length` too) so it survives huge books like War and Peace and
  the Bible instead of hitting spaCy's default memory-safety limit.
- `books/characters/add_aliases.py` — new permanent tool: adds alias
  mentions to an **existing** character (a spelling variant, surname, or
  formal name the original build missed), as opposed to `add_entity.py`
  (new character) or `bind_speaker_labels.py` (derives aliases from a
  card's own name). Bakes in, from the start, the
  firstMention/roleVisibleAt/snapshot-availableAt correction that had to
  be applied reactively twice already this session (see round 3): if a
  newly bound alias's earliest occurrence predates the character's
  recorded firstMention, moves firstMention, roleVisibleAt, and the
  earliest snapshot's availableAt back together.
- `add_entity.py` changed: an edition with zero alias matches now warns
  and is skipped, instead of hard-asserting and killing the whole batch —
  needed because a modern-en translation's transliteration of a Russian
  name often doesn't match the original-en spelling a candidate list was
  built from. `original-en` stays strict (it's the edition the candidate
  list itself is built from, so a zero-match there is a real bug).

## Pilot: war-and-peace (top of the ranking)

**32 → 135 characters** in original-en (68 → 76 in modern-en; see gap
below). In order:

1. **Alias gaps on already-carded characters, found before any new
   character was added.** The existing `napoleon` card was bound only to
   the literal word "Napoleon" — the text refers to him by surname
   "Bonaparte" (77×) and the period spelling "Buonaparte" (21×)
   throughout, 98 unclickable occurrences of the same person. Similarly:
   "Peter Kirílovich"/"Peter Kirílych"/"Besuhof" are Pierre referred to
   formally or by surname; "Bezúkhova" is Hélène's married name; "Ilyá"
   is Count Rostóv's own first name (28 bare occurrences); "Natalie" and
   "Marie" are the French/formal forms of Natásha and Princess Mary used
   throughout in dialogue. None of these were missing characters — they
   were missing occurrence-links on characters that already had cards,
   the same bug *class* as round 2's Bonaparte-adjacent finding (Pyotr
   Petrovich/Petrovitch, Zidkijah/Zedekiah), just not caught until this
   pass went looking systematically.
2. **96 new minor/reference characters**, from recurring named minor
   cast (Bilíbin, Timókhin, Zherkóv, Dorókhov — carefully checked
   distinct from the already-carded Dólokhov, different person, similar
   spelling) to one-scene walk-ons (Gabriel the servant, Sídorov mimicking
   a French grenadier, Kátie the maid) to the real historical
   Napoleonic-War cast Tolstoy names throughout the novel (Bennigsen,
   Dokhtúrov, Miloradovich, Marshal Ney, Marshal Berthier, Prince
   Poniatowski, Napoleon's own physician Larrey, Louis XVI and Louis XIV
   in the text's own historical asides, the actual Tsar Alexander and
   Emperor Francis).

Two things were caught and handled, not just noted:

- **"Fédya"** turns out to be Dólokhov's own mother's nickname for him —
  bound as an alias on the existing `dolokhov` card via `add_aliases.py`,
  not created as a new character. Caught by reading the actual sentence
  ("her Fédya") rather than trusting the surface form alone.
- **"Rugáy"** (a hound's name) and **"the Daniel Cooper"** (a country
  dance) were spaCy PERSON mis-tags — checked in context and excluded.

**modern-en gap, stated plainly:** about half the new aliases had no
match in that translation's spelling and were skipped per-edition rather
than failing the whole batch. `modern-en` sits at 76 cards against
original-en's 135 — a real, known gap, not yet closed. A follow-up pass
reconciling modern-en's transliteration conventions against original-en's
is still needed before this book is genuinely done end to end.

**Not yet resolved, by design:** generic epithets used inconsistently
across scenes for different actual people — "Uncle," "Mamma," "Papa,"
"Aunt," "Miss," "Granddad" — were deliberately left unbound. Binding
"Uncle" (79 occurrences) to one character would very likely misattribute
most of them, the same homonym risk flagged for "PAGE" in
merry-wives-of-windsor in round 3. Resolving these needs per-occurrence
scene reading, not a single alias bind, and is real remaining work, not
noise to be dismissed.

**Round-trip validated** at each step (0 errors, 0 duplicate ids/spans, 0
firstMention invariant violations). **Real-browser verified**: extended
`app/scripts/verify-character-fixes.cjs` to 128 checks total (the alias
fixes, a sample of new characters including the Dorókhov/Dólokhov
disambiguation, and the epithet-alias fixes); **128/128 passed** across
two verification runs as the batch grew.

## What "done" for war-and-peace actually requires (not yet reached)

- Close the modern-en alias gap (76 vs. 135 cards).
- Resolve the epithet-family names (Uncle/Mamma/Papa/etc.) via
  per-scene reading rather than blind binding.
- A second sweep of the remaining ~600 uncarded PERSON surface forms
  (down from 818 before this pilot) — the top of that remaining list is
  now dominated by place names, religious terms, and foreign phrases, but
  it has not been individually exhausted the way the first ~1,200
  candidates were.

## Next books, in ranked order

Leviathan and Essays (Montaigne) need real noise-filtering work before
their candidate lists are usable (see above) — recommend re-ranking after
building a stopword/place-name filter rather than tackling them as-is.
Next clean target by the ranking: **the-histories**, then **divine-comedy**
(the book in Anders' own example), then **moby-dick** (already has 5 new
cards from round 3, but the ranking scan says real density remains),
**don-quixote**, **the-aeneid**, **paradise-lost**, **anna-karenina**,
**peloponnesian-war**, **iliad**, **faust-part-1**,
**brothers-karamazov** (13 cards from round 2 — likely still has real
density left).

## Release status

All fixes on branch `claude/great-clarke-mugpy4`, not yet live.
