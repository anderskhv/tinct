# The Federalist Papers character package

All 85 essays (edition chapters 1-85, "No. 1" through "No. 85") in both
English editions -- 80 recognition cards in each, zero omitted, 137
exact mentions in original-en and 138 in modern-en (one legitimate
paraphrase variance, not an omission -- see check 6), 1279 paragraphs
per edition, identical structure in both.

Read `cards.md` for category and copy together.

This is a political-essay treatise, not a narrative or staged
dialogue: nobody experiences events, and the essays argue a case
rather than dramatize one. Per editorial policy's guidance for
treatises -- "provide useful people/reference identification without
inventing a fictional cast or calling the author a protagonist" --
**all 80 entries are Reference.** There is no Central, Major, or
Supporting entry.

The cast:

- **The authorship itself**: PUBLIUS, the shared pen name of Hamilton,
  Madison, and Jay, bound once (11, 14) from a quoted French-language
  citation of the essays; and HAMILTON and MADISON, each bound once
  from the literal opening line of essays No. 18-20, "MADISON, with
  HAMILTON" -- an editorial byline in the source text marking the
  historically documented disputed joint authorship of those three
  essays specifically.
- **Named Anti-Federalist critics and pseudonyms**: Mr. Abraham Yates
  and Luther Martin, cited under their real names; CATO and "the
  federal farmer," rival essayists cited only by disputed pen name;
  and TAMONY, a pseudonymous newspaper writer whose real identity this
  text never gives.
- **Political and legal authorities**, cited for a doctrine, maxim, or
  precedent: Montesquieu (by far the most cited), Blackstone, Hume,
  Grotius, De Lolme, Junius (itself a still-disputed pseudonym), the
  historian Rutherford, Burgh, Plato, Socrates, Jefferson, Sir William
  Temple, the Abbe Mably, the Abbe Milot, Polybius, Plutarch.
- **Ancient lawgivers and city-founders**, all from a single historical
  survey at No. 38: Minos, Zaleucus, Theseus, Draco, Solon, Lycurgus,
  Romulus, Numa, Tullius Hostilius, Brutus (the Roman consul --
  see the namesake check), Amphictyon, Achaeus, Aratus.
- **Figures from Greek confederacy history**: Cleomenes, Philopoemen,
  Callicrates, Demosthenes, Xerxes, Philip of Macedon, Alexander,
  Pericles, Aspasia, Phidias, Lysander, plus Hannibal and Scipio from
  the Punic Wars, and Homer.
- **European monarchs and courtiers**: Charles VII of France, the
  Emperor Charles V, Henry VIII, Cardinal Wolsey, Pope Julius II,
  Louis XIV, William III ("Prince of Orange" at two of his three
  occurrences), Charles I, Charles II, James II, George II, King John,
  Maximilian I, Victor Amadeus of Savoy, Thuanus, Necker, Madame de
  Maintenon, the Duchess of Marlborough, and the Duke of Marlborough
  (a genuine namesake pair -- see the check below), and Madame de
  Pompadour.
- **Contemporary British and American figures**: Mr. Jenkinson, the
  Earl of Chesterfield, Daniel Shays, Charles James Fox.
- **A title-only reference resolved from context**: "the late king of
  Prussia," unambiguously Frederick II.
- **Named collective bodies**, bound as kind `group`: the Ephori, the
  Tribunes, the Cosmi, the Decemvirs.

## Editorial checks

**1. Namesakes.** The automation queue names this book's genre as a
place two-namesake collisions like to hide, citing Hume's two
Alexanders and two Catos as the warning example. Two were checked in
detail:

- **"Brutus"** -- the historical Roman consul versus the pseudonymous
  Anti-Federalist essayist of the same pen name, who wrote in direct
  opposition to these very papers. A full-text search of both editions
  turns up exactly **one** occurrence of "Brutus" in the whole book
  (38, 1), unambiguously the Roman consul, in a plain historical list
  of ancient lawgivers (Minos, Zaleucus, Theseus, Draco, Solon,
  Lycurgus, Romulus, Numa, Tullius Hostilius, Brutus, Amphictyon,
  Achaeus, Aratus). Publius never names his Anti-Federalist opponent
  "Brutus" anywhere in the body text of these 85 essays -- there is no
  collision to resolve here, only one Brutus is ever bound, and a
  dedicated test (`test_only_the_roman_brutus_is_bound`) pins this
  down against regression.
- **"Marlborough"** -- not flagged in advance, found while reading. No.
  6 footnotes 6-8 attach to one sentence -- "the bigotry of one
  female,(6) the petulance of another,(7) and the cabals of a
  third,(8)" -- identified by the footnotes themselves as Madame de
  Maintenon, the **Duchess** of Marlborough, and Madame de Pompadour:
  royal mistresses/court favorites blamed for wars. Footnote 10, four
  paragraphs later, attaches to an unrelated sentence about "the
  ambition, or rather the avarice, of a favorite leader" prolonging the
  War of the Spanish Succession, and reads "The **Duke** of
  Marlborough." These are two different real people sharing a surname
  -- Sarah Churchill, Duchess of Marlborough, and her husband John
  Churchill, 1st Duke of Marlborough -- bound as two separate entities
  with distinct aliases so they never merge (confirmed by
  `test_marlborough_namesake_pair_stays_distinct`).

Beyond these two, every other name that recurs was checked at each
occurrence for a single consistent referent: Montesquieu (11
occurrences), Philip of Macedon (3, all Philip II), Charles II (3, all
the same English king, distinct from Charles I and the unrelated
Emperor Charles V), Lycurgus (5), Solon (4), Sir William Temple (2),
the Abbe Mably (3), Plutarch (3), Aratus (2), Draco (2), Xerxes (2),
Ephori/Tribunes (2 each), and William III/"Prince of Orange" (3
occurrences across two essays, all the same 1688 king -- confirmed by
cross-checking essay 52's explicit "William III" against essay 26's
and 84's "Prince of Orange," all describing the same 1688 accession).
No other genuine collision was found.

**2. Person or not, and title-only resolutions.** One title-only
reference is resolved from context, following the Bishop-of-Autun /
Empress-of-Russia pattern already used in Vindication: **"the late
king of Prussia"** (19, 8) is never named directly, but the essay's
1787-88 publication date and Frederick II's death in August 1786 make
the referent unambiguous -- Frederick the Great. Several office-only
references were checked and left deliberately unbound because no
specific individual is identifiable from the text: "the elector of
Saxony" (19, 8, one of many across centuries, no era-specific detail
given), "the Duke of Bavaria" (19, 12, likewise unspecific), "the Abbe
de St. Croix" (19, 12, too minor and unspecific an anecdote), and the
unnamed "King of France," "King of Aragon," and "Kings of Egypt and
Syria" (6, footnote 9; 18, 18), all cited by office only. "Doge" (of
Genoa, 3, 17) is a generic office title with no individual named. "The
Emperor" appears repeatedly as a generic Holy Roman imperial office
distinct from the specifically-named Emperor Charles V and Maximilin
I, and is left unbound in its generic occurrences.

**3. Scriptural and mythological figures.** This treatise has very
little of either. The only genuinely legendary (as opposed to
historical-but-obscure) figures are the ancient lawgivers of essay 38
-- Minos, Theseus, Romulus -- cited by the text in a flat,
matter-of-fact historical register ("we learn," "it is said," "history
informs us") rather than as narrative or divine actors, so all are
bound as kind `person` rather than `literary-figure` or
`cultural-figure`, consistent with how the treatise itself treats
them. No biblical or scriptural figure is named anywhere in the book.

**4. Ambiguous or generic references.** Demonyms are deliberately left
unbound throughout: Lacedaemonians/Spartans, Athenians, Thebans,
Persians, Romans, Franks, Gauls, Phocians, Achaeans (as a people,
distinct from the individually-named Achaean statesmen Aratus,
Philopoemen, Cleomenes, and Callicrates). Generic office-titles with no
historically resolvable individual, listed under check 2 above, are
also left unbound.

**5. Spot-read the bindings.** Twelve mentions per edition were sampled
at random (`random.seed(13)`) and checked against their full paragraph
in context; all 24 resolved correctly. Given the density and breadth
of citation in this book (footnotes alone account for a large share of
all mentions -- Nos. 6, 18, 19, 20, and 69 are especially dense), every
one of the 80 entities' first-binding locations was additionally read
directly during authoring (recorded in `source-review.md`), not merely
sampled.

**6. Both editions independently.** Both editions are structurally
identical (1279 paragraphs, 85 chapters, same chapter titles) and
produce 80/80 entities in each, but two edition-specific differences
required explicit handling:

- **Neckar / Necker**: original-en spells the French finance minister's
  name "Neckar" (12, 8); modern-en spells it "Necker" at the same
  location. Aliased both.
- **Cleomenes, one legitimate extra mention in modern-en**: at (18,
  18), original-en reads "...who, as an enemy to Macedon, had interest
  enough..." (pronoun), while modern-en reads "As an enemy of Macedon,
  Cleomenes had enough influence..." -- a paraphrase that names
  Cleomenes explicitly a second time within the same paragraph where
  original-en uses a pronoun. This gives modern-en one more genuine
  mention of Cleomenes than original-en (4 vs. 3) with no omission on
  either side; confirmed and pinned down by a dedicated test
  (`test_cleomenes_mention_count_variance_is_paraphrase_not_omission`)
  rather than left as an unexplained count mismatch.

No divergence was found in which edition names or omits a person
outright: every one of the 80 entities binds in both editions, and the
one mention-count difference (Cleomenes) is fully accounted for above,
not a silent gap.

## Source defects

None found requiring documentation beyond the ordinary edition-specific
spelling ("Neckar"/"Necker") recorded under check 6 above. No
Gutenberg-boilerplate residue, no truncation, and no printed
line-number or compositor-error artifacts were noticed in either
edition during the full read.

## Full suite note

This book's own focused test suite (12 tests) passed cleanly and
`--check` is clean. A full `python3 -m unittest discover -s . -p
'test_*.py'` run was attempted twice and did not complete within a
300-second budget either time (killed by `timeout`), consistent with
the environmental instability documented for the prior four books in
this session (the shared test tree has grown large across concurrent
Lane A/B sessions). This package is committed on the strength of its
own focused suite, a clean `--check`, and exhaustive manual
verification: both full English editions read paragraph-by-paragraph,
every entity's binding location read in context during authoring, and
24 randomly sampled mentions (12 per edition, `random.seed(13)`)
independently checked against source text.

## Commands

```
cd books/characters
python3 federalist-papers/author_content.py   # regenerate editorial.json
python3 build_federalist_papers.py             # regenerate characters.v1.json, print report
python3 build_federalist_papers.py --check      # verify saved output is current
python3 -m unittest test_federalist_papers -v
python3 -m unittest discover -s . -p 'test_*.py'  # full repo suite
```

## Release checks

- [x] Both English editions read in full (all 85 essays, 1279
  paragraphs, original-en and modern-en).
- [x] All six editorial checks performed and documented above.
- [x] `build_federalist_papers.py --check` clean.
- [x] `test_federalist_papers.py`: 12/12 passing.
- [x] Full repo suite attempted twice; did not complete within a
  300-second budget either time -- see "Full suite note" above.
- [x] `library-inventory.json` regenerated.
- [x] Committed and pushed with the inventory update.
- [x] `RELEASE-QUEUE.md` entry added.
