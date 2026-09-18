# Clickable-names pass, batch 3: Aeneid, Paradise Lost, Anna Karenina, Peloponnesian War, Iliad

Continues the cast-density queue after batch 2 (Histories / Divine Comedy /
Moby-Dick) and the Don Quixote addendum. Same pipeline per book:
`scan_candidates.py` (spaCy PERSON-NER) plus hand-checked expected-name
direct counts → read every real candidate in context, dump every occurrence
of any name used for more than one figure → batch script
(`add_entity` / `add_entity_excluding` / `add_aliases`) →
`prune_untappable.py` → `validate_package.py` → new rows in
`app/scripts/verify-character-fixes.cjs` → real-browser suite → commit.

Verse books (Dryden's Aeneid, Milton, Butler's Iliad) are where NER is
weakest: it reports well under half of the real named figures, so for
these the expected-name direct counts did most of the work.

## Totals

| Book | Before | After (original-en / modern-en) | Mentions |
|---|---|---|---|
| The Aeneid | 17 | 151 / 150 | 1,199 / 1,195 |
| Paradise Lost | 15 | 98 / 96 | 460 / 487 |
| Anna Karenina | 20 | 114 / 114 | 7,534 / 7,548 |
| Peloponnesian War | 17 | 151 / 151 | 1,297 / 1,316 |
| The Iliad | 33 | 177 / 177 | 2,248 / 2,246 |

Running total for the clickable-names pass so far: nine books, roughly
1,150 new cards.

## The Aeneid: 17 → 151

Dryden uses Roman names and epithets interchangeably, so most of the work
was alias binding onto one card rather than new cards: `juno` gains
"Saturnia"; Hercules is bound as both "Hercules" and "Alcides"; Apollo as
"Phoebus". Most new cards are the Italian and Trojan warriors of books
7–12 who appear only in the battle catalogues (Mezentius and Lausus were
already carded; Camilla's companions, Turnus's allies, Aeneas's captains
and the Latin dead were not).

Verify note: Apollo's first "Phoebus" mention is the possessive `Phoebus’`
with a curly apostrophe, which the reader currently cannot tap (see the
app-side gap below), so the verify row targets book 2 instead. The
mention itself is kept in the data so it lights up once the trim is fixed.

## Paradise Lost: 15 → 98

Milton's catalogue of fallen angels in Book 1 (Moloch, Chemos, Baalim,
Ashtaroth, Thammuz, Dagon, Rimmon, Belial, Mulciber …) and the biblical
and classical figures cited in the later books were all uncarded. Aliases
added: `satan` +"Tempter", "Lucifer"; `god-the-father` +"Jehovah";
`the-son` +"Jesus". Personified figures (Sin, Death, Chaos, Night) are
carded as `kind: concept` and bound only in the paragraphs where they act
as characters, not where the common nouns appear.

## Anna Karenina: 20 → 114

Translation-era Garnett spellings and Russian diminutives drive the
homonym work here:

- Aliases: `levin` +"Kostya"; `kitty` +"Katya"; `veslovsky` +"Vassenka";
  `varenka` +"Varvara Andreevna"; `petritsky` +"Pierre".
- **Princess Varvara** (Anna's aunt) vs. Varenka: split by paragraph.
- **Shtcherbatsky**: the old prince vs. the young prince (Kitty's brother)
  — split with `only_paragraphs` on the early skating chapter.
- **Philip**, **Pyotr**, **John**, **Liza**: each name is used for two or
  three unrelated servants / figures (Levin's servant vs. others, Anna's
  footman vs. the peasant, Sir John the preacher vs. the John in
  Mihailov's painting, Liza Merkalova vs. another Liza). Every one read
  in context and bound per figure with `only_paragraphs` /
  `exclude_paragraphs`.
- `alexander-vronsky` initially bound nothing because "Vronsky" inside
  "Alexander Vronsky" was already claimed by the brother's card (a
  pre-existing mis-binding). Removed the three mis-bound mentions and
  rebound.

## Peloponnesian War: 17 → 151

Thucydides names generals in every campaign season, so the cast is wide
and shallow. Homonyms found by reading every occurrence:

- **Hippias**: the Pisistratid tyrant vs. an Arcadian mercenary commander
  at Notium.
- **Hippocrates**: the Athenian general (Delium) vs. the tyrant of Gela.
- **Aristeus**: the Corinthian at Potidaea, excluding two same-named
  others.
- **Timocrates**, **Euthydemus**, **Leon**, **Callias**, **Procles**,
  **Pythodorus**: each bound only to the paragraphs of one figure.

## The Iliad: 33 → 177

Butler's prose translation uses Roman divine names throughout, so the
existing Greek-named god cards were unreachable from the text in places.
Fixes and additions:

- Aliases onto existing cards: `apollo` +"Phoebus"; new deity cards carry
  both names — `cronos` ["Saturn","Cronos"], `artemis` ["Diana",
  "Artemis"], `heracles` ["Hercules","Heracles"], `leto` ["Leto",
  "Latona"], `briareus` ["Briareus","Aegaeon"], plus Dionysus,
  Persephone, Demeter.
- Big unbound names: Peleus (135 mentions), Tydeus (96), Antilochus
  (59), Iris (40), Phoebus (39).
- **Xanthus**: the river (= Scamander) vs. Achilles's immortal horse vs.
  a Trojan killed in book 5. `scamander` takes "Scamander" and the river
  "Xanthus"; `xanthus-horse` is bound only at (16,7) and (19,30).
- **Lycaon**: Priam's son (book 21) vs. Pandarus's father — the card is
  bound only to the book-21 paragraphs that name Priam's son.
- **Sleep** (Hypnos, book 14) bound only where the god acts, not the
  noun.
- **Helenus**, **Amphimachus**, **Medon**, **Thoas**, **Pisander**,
  **Antiphus**: each has an unrelated namesake in the Catalogue of Ships
  or the book-5/11 killings; split per figure by paragraph.
- Pruned 37 / 45 mentions (original / modern) that sit glued to an
  em-dash in the book-argument paragraphs (`Achilles—Achilles`,
  `Menelaus—Helen`): the reader's word tokenizer cannot isolate those,
  so they were dead. Thalpius's only mention was one of them, so that
  card was dropped rather than shipped unreachable.

## Verify

`app/scripts/verify-character-fixes.cjs` gains rows for every book above
(Iliad: 20 rows including the Roman-alias, horse-vs-river, and
re-anchored Dione / Bellerophon cases). Full suite result is recorded in
the commit message for each batch.

## Open, app-side (not done from this lane)

- `wordSelectionOffsets` does not trim curly single quotes (U+2018/2019),
  so names written `‘Name’` or possessive `Name’s` are untappable. Data
  keeps those mentions (validator reports them as `curly_quote_only`);
  they start working the moment the trim is added.
- `paragraphHashes` is ~80% of each character file's gzipped size and is
  redundant with `sourceSha256` for verification. Worth revisiting before
  offline app bundles ship; deferred to the app lane.

## Next in the queue

faust-part-1, brothers-karamazov, great-expectations, jane-eyre, walden,
odyssey, crime-and-punishment. Ulysses, Leviathan and Montaigne still need
a noise filter before their NER counts mean anything.
