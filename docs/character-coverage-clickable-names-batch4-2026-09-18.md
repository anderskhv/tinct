# Clickable-names pass, batch 4: the rest of the library

Continues batch 3 (Aeneid / Paradise Lost / Anna Karenina / Peloponnesian
War / Iliad). Same pipeline per book: `scan_candidates.py` plus expected-
name direct counts → every homonym read in context → batch script →
`prune_untappable.py` → `validate_package.py` → rows in
`app/scripts/verify-character-fixes.cjs` → `precheck_verify_cases.py` →
real-browser suite → commit.

This batch also found and fixed two **library-wide** defects in the
first-generation packages, which together revived more mentions than all
the new cards put together.

## Two systemic fixes

**1. The 30-mention cap** (`rebind_capped_names.py`, commit `2ec5e396f`).
First-generation packages bound at most 30 mentions per principal
character (Ulysses/"Ulysses" ×30, Jove ×30, Hector ×30 …) — every later
occurrence was untappable. The script rebinds every occurrence of each
original person/deity card's known name forms, longest form first,
overlap-aware, skipping forms shared between two cards. Applied to every
package except Bible (concept cards keep their curated 30). ≈10,000
mentions revived across the epics, histories and novels.

**2. Sentence-fragment bindings** (`rebind_junk_cards.py`, commit
`dced82760`). Many essay/treatise packages bound a card to one or two
*phrases* ("Abraham was greater than all", "Rousseau was more
consistent", "Socrates proposes", "the judicious Hooker") and never to
the bare name — so the phrase was untappable *and* fix 1 had no plain
form to expand. Fear and Trembling shipped with Abraham ×266 in the text
and one bound phrase. The script derives plain forms from each card's
name (full name, honorific-stripped name, unambiguous surname), drops
the fragments, binds every occurrence and moves `firstMention` back.
Guards: a card that would gain nothing keeps its fragments; a bare
ambiguous token is never derived from an honorific ("King John" → not
"John"); forms a later restricted pass already bound (Democracy in
America's "Washington" city split) are never re-expanded. +1,311
mentions across nine books.

A follow-up library-wide scan (every first-gen person card, count of
unbound plain-name occurrences) came back clean apart from
`Mrs. Collins` ×29 in Pride and Prejudice (Charlotte after her
marriage; fixed, `975663a10`). Everything else on that list is a deliberate
homonym exclusion (Kurágin, Reed, Pedro, Tom, Leon …) or em-dash-glued
text the reader cannot tokenize (see app-side, below).

## Totals

| Book | Before | After (original-en) | Notes |
|---|---|---|---|
| Faust, Part 1 | 16 | 76 | |
| Brothers Karamazov | 17 | 184 | Krassotkin / Madame Krassotkin order fix |
| Great Expectations | 18 | 70 | "Philip Pirrip" (Pip's father) unbound from Pip |
| Jane Eyre | 20 | 92 | "St. John's long hair" (the Evangelist) unbound from Rivers |
| Walden | 8 | 156 | |
| Odyssey | 29 | 237 | Greek god names in modern-en |
| Crime and Punishment | 19 | 83 | |
| Pride and Prejudice | 23 | 61 | + Mrs. Collins → Charlotte |
| Frankenstein | 17 | 51 | |
| Treasure Island | 13 | 39 | |
| Confessions | 16 | 66 | |
| Niels Lyhne | 10 | 68 | |
| Jekyll and Hyde | 27 | 29 | |
| Ulysses | 26 | 597 | two sweeps; see below |
| Essays of Montaigne | 17 | 493 | two sweeps; see below |
| Wealth of Nations | 8 | 123 | |
| Democracy in America | 10 | 68 | "Washington" the city unbound |
| Leviathan | 10 | 142 | |
| Federalist Papers | 8 | 60 | |
| Jerusalem | 9 | 49 | five junk-bound cards rebound; "Ingmar Farm" dropped |
| Aristotle, Politics | 10 | 124 | |
| Vindication of the Rights of Woman | 10 | 58 | |
| Beyond Good and Evil | 10 | 103 | |
| Second Treatise | 10 | 43 | |
| Genealogy of Morals | 11 | 66 | Paul the apostle / Paul Rée / Paul Deussen |
| Fear and Trembling | 11 | 59 | Abraham ×266, Isaac ×115 rebound; Sarah split |
| Meditations | 18 | 108 | Alexander the Great vs the grammarian / Platonist |
| Magna Carta | 10 | 45 | the witness list |
| Nicomachean Ethics | 10 | 58 | |
| Imitation of Christ | 6 | 22 | "Jesus" ×85 was untapped |
| Divine Comedy | 81 | 427 | second sweep; see below |

Checked and found already covered (nothing to add): The Republic,
Candide, The Prince, Werther, Notes from Underground, Heart of Darkness,
Ivan Ilyich, Douglass, Around the World in 80 Days, The Awakening, A
Little Princess, Jungle Book, Gilgamesh, Beowulf, Hume, Social Contract,
Discourse on Inequality, Poetics; and the short philosophy titles
(Utilitarianism, On Liberty, Kant, Descartes, Manifesto, Art of War, the
Manual, US Founding Documents — no signer names in the text).

## Notes per book (the non-obvious ones)

**Divine Comedy, second sweep (81 → 427).** Every named soul, poet,
pagan, saint and demon of the three canticles. The capped-names rebind
had also expanded a few first-gen cards too far, all corrected:
"Frederick" at Frederick Novello / Tignoso / of Aragon is not Frederick
II; "Alexander" in India is the Great, not the tyrant; "Bernard" who
bared his feet is Quintavalle, not Clairvaux; "Thomas" of Buondelmonte's
festival is the Apostle; "Adam" in canto XXX is Master Adam; "Jason" in
XIX the high priest; "Peter" at Lombard / Bernardone / Mangiador / of
Spain / Damiano and at the basilica is not the Apostle; "Michael" at
Michael Scott / Michael Zanche is not the archangel. `pier-della-vigna`
was bound only to Peter of Aragon and Pier Pettignano (Dante never names
him) and is removed. Homonyms split by paragraph: ten Guidos, four
Charleses, Caesar / Tiberius, John Evangelist / Baptist, Mars god vs
planet, the two Dionysii, Costanzas, Giovannas, Buosos, Dis city vs
Lucifer.

**Ulysses, second sweep (182 → 597).** The multi-token long tail (the
Cyclops saints' litany, the Aeolus barristers, the Ithaca inventories,
Molly's Gibraltar people) plus single-token surnames read in context.
Mis-bindings fixed: "O'Madden Burke" ×20 sat on the Oxen student Madden's
card, which also held the jockey O. Madden and Mr Justice Madden (now
four cards); "Kendal Bushe" / "Peter Kennedy" sat inside Seymour Bushe /
Miss Kennedy spans. Shops, streets and pubs carrying a surname, song
lines and idioms are left alone. The remaining ~300 single-mention
single-token candidates are mostly noise (onomatopoeia, foreign
fragments) and were not pursued.

**Montaigne.** First sweep: 17 → 240; 754 citation attributions
(`--Seneca,`) were initially pruned as untappable — the pruner now keeps
leading/trailing-dash cases (373) as an app-side category, and the
remaining ~412 are mid-token (`life.”--Horace,`) and stay pruned. Second
sweep (240 → 493): the Renaissance Italians and Frenchmen, the Ottoman sultans, the
once-named emperors and consuls, with the homonyms (two Aristodemi,
Alfonsos, Menanders, Conrads, Archelai, Diodori, Timons, Drusi, Pacuvii,
Renés; three Amuraths and Edwards) split by paragraph.

**Leviathan.** Bare "John", "Mark", "Luke", "Matthew" are scripture
citations and are left; the apostle forms ("St. John", "S. Paul") are
bound. "Innocent" only where it names the pope. Overlapping "an
Aristotle, a Cicero" spans trimmed to plain names.

**Jerusalem.** Five of the nine first-gen cards were bound to junk
spans ("What are you saying, Storm?"); stripped and rebound. Bare
"Ingmar" bound to the young Ingmar minus the 470 "Ingmar Farm" cases.

## Verify

Suite rows: 601 → 786 (`precheck_verify_cases.py` gate: 0 bad). The
601-row run of the earlier books aborted at row ~600 on a single
reader-ready timeout (`page.waitForFunction`); the suite now retries a
load once and records `READER_TIMEOUT` per row instead of aborting.
Result of the full 786-row run is recorded in the commit that follows
this ledger.

## Open, app-side (not done from this lane)

- `wordSelectionOffsets` does not trim curly single quotes (U+2018/2019)
  or leading/trailing dashes, and cannot isolate a name inside a token
  like `life.”--Horace,` or `Achilles—Achilles`. Data keeps the
  quote/dash cases (validator: `curly_quote_only`); the mid-token cases
  are pruned and would need a tokenizer change to come back (Montaigne
  ~412, Nietzsche's `--` prose, Moby-Dick's em-dashes).
- `paragraphHashes` size; Bible LORD/God rebind is a product decision.

## Next in the queue

Ulysses single-mention single tokens (low yield); the Plato dialogues
and Shakespeare plays are dense already. After that the clickable-names
pass is complete for the current library.
