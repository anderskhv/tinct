# Fear and Trembling character package

The Preface, Exordium, Eulogy on Abraham, Preliminary Expectoration, and
Problemata I-III, plus the Epilogue, in both English editions: 68 recognition
cards, 675 exact mentions in `original-en` and 672 in `modern-en`, 232
paragraphs per edition. Zero omitted entities on either side.

Read `cards.md` for category and copy together. Abraham is Central — the
book's whole subject. Isaac, Abraham's wife Sarah, and Eliezer are Major or
Supporting as the three from whom Problema III says Abraham concealed his
undertaking. Four sustained analytical figures Johannes de Silentio builds
and rebuilds across several paragraphs each are Major: **Agnete** (spelled
Agnes from 7:30 onward, and throughout the modern edition), **the Merman**,
**Faust**, and **Sarah of the Book of Tobit** (a different Sarah — see
below). Recurring tragic-hero comparisons (Agamemnon, Iphigenia, Jephthah,
Brutus, Gloster/Richard III, Tobias, Clytemnestra) are Supporting. Everything
else — the many philosophers, historians, poets and one-line biblical and
mythological citations — is Reference, consistent with this being a
treatise, not a novel with an invented cast.

## Editorial checks

**1. Namesakes.** This book has exactly one real collision, and it is the
central one the automation queue flagged this book for: **Sarah**. Abraham's
wife is named throughout the Exordium, the Eulogy, and the frame of Problema
III — but 7:40 through 7:46 is Johannes de Silentio's own digression on the
Book of Tobit, where "Sarah" names a wholly different woman: the daughter of
Raguel and Edna, given to seven husbands who each died on the wedding night.
I read every one of the 18 "Sarah" occurrences in original-en (and confirmed
identical locations in modern-en) and confirmed the boundary is clean: every
occurrence in paragraphs {40, 42, 43, 44, 46} of chapter 7 is Tobit's Sarah;
every other occurrence — including 7:60 and 7:68, back in the Abraham frame
immediately after and long after the digression — is Abraham's wife.
`build_fear_and_trembling.py` binds "Sarah" with a location-scoped rule
rather than a bare alias for exactly this reason (`sarah` and `sarah-tobit`
carry no aliases of their own in `editorial.json`). `test_two_sarahs_split_
exactly_at_the_tobit_digression` asserts the split at every mention in both
editions; `test_sarah_boundary_paragraphs_bind_abrahams_wife` asserts the two
boundary paragraphs (7:60, 7:68) land on the right side.

I also swept every other bound name (and several candidate adjectival
forms) across both editions before authoring; no other name recurs for two
different people. "Cain" (6:15, "for Cain and Abraham are not identical")
is not a slip for "Cain and Abel" — I verified the sentence in both editions
reads the same way — but a genuine comparison distinguishing Abraham (who
loves Isaac) from Cain (who hated Abel), which is exactly Kierkegaard's
point: Abraham's willingness is a sacrifice, not a murder, because unlike
Cain he does not hate.

**2. Person or not.** Excluded as non-persons: places (Moriah, Aulis, Delphi,
Ephesus, Sodom and Gomorrah, the Sound, Østerport, Frederiksberg), works and
their titles (the Book of Tobit, the New Testament, the Sermon on the Mount,
Hamburgische Dramaturgie, The Golden Snuffbox, the Philosophy of Right,
Aristotle's Poetics and Politics as titles rather than the citations to
Aristotle himself), and a stock puppet-theatre type rather than a specific
individual: **Master Jakel**, invoked the way "Punch" would be — a type for
a third-rate showman with a "private theatre" of admiring friends, not a
claim that a real Jakel existed. I bound him anyway, with a card that says
plainly what kind of reference he is, since the name is specific and
unambiguous even though the referent is a stock type rather than a person
who lived. "Cumberland's Jew" (7:46) is Richard Cumberland the real English
playwright, named for his 1794 play; the card explains that the actual
demonic figure under discussion is Sheva, the play's Jewish character, whom
the text never names directly — I bound "Cumberland," the word actually in
the text, rather than inventing a name the source does not use.

**3. Scriptural and mythological references.** The Genesis narrative
(Abraham, Isaac, Sarah, Hagar, Eliezer) is the book's spine. Elsewhere:
Moses, Jacob, Esau, Cain, Judas, Herod, Pilate, and the Virgin Mary are
named in passing comparisons; the Book of Tobit's Tobias, Sarah, Raguel and
Edna get a full page of their own (7:40-7:46); Agamemnon, Iphigenia,
Clytemnestra, Calchas and Achilles (Euripides's Iphigenia in Aulis) and
Jephthah and his unnamed daughter (Judges 11) are the book's two main
tragic-hero exemplars; Amor and Psyche, Orpheus, Pythagoras, and the legend
of Agnete and the Merman round out the mythological and folkloric material.
Each card says who the figure is without importing more of the surrounding
story than the text itself uses — for example Iphigenia's card does not
narrate the whole Trojan War, and Cain's card does not retell Genesis 4.

**4. Ambiguous or generic references.** Left deliberately unbound: "the
rich young man" whom Christ met (4:2) — the text never names him, and
inventing a name would misrepresent the Gospel source, which itself leaves
him anonymous; Jephthah's daughter (5:9-5:12), likewise unnamed in Judges
11; the priest/orator of the sleeplessness anecdotes (4:2-4:3, 4:38), an
invented illustrative figure with no name at all; Heraclitus's unnamed
disciple (8:5), who in the source material is Cratylus but is never named
in this text. One reference I could not resolve from the text alone is
deliberately unbound: **Kildevalle** (7:46), "the city's poet," named only
inside a quotation Johannes de Silentio attributes to the Danish poet
Baggesen ("if he becometh immortal, then become we all so"). I could not
confirm from the text itself, without an external period source, whether
this names a specific identifiable minor poet or is itself part of
Baggesen's joke; `test_kildevalle_deliberately_unbound` asserts it carries
no entity.

**5. Spot-read the bindings.** I read the surrounding sentence for 10
mentions per edition, chosen at random (`random.seed(7)`), plus every
mention flagged by the tests above. All 20 read correctly in context —
e.g. `moses` at 3:3 ("for **Moses** smote the rock with his staff, but he
believed not") is the correct point of contrast with Abraham's belief;
`eliezer` at 7:68 ("would not Sarah, would not **Eliezer**, would not
Isaac say to him") is Abraham's servant, not a stray second Eliezer;
`edna` at 7:42 ("for **Raguel** saith on the morning after the wedding to
**Edna**...") is Sarah's mother, correctly distinct from Sarah herself.

**6. Both editions independently.** I read both editions in full and swept
every candidate name's locations across both before authoring (see the
finder scripts referenced in the commit). Four edition-specific spellings
are not omissions but the same entity spelled differently: original-en's
Latin **Cartesius** vs. modern-en's **Descartes**; the signature **Johannes
de silentio** (lower-case s) vs. **Johannes de Silentio** (capital S);
**Gloster** vs. the modernized **Gloucester**; and the original's drift from
**Agnete** (7:27-29) to **Agnes** (7:30 onward) within its own telling,
against the modern edition's uniform **Agnes** throughout. All are carried
as aliases on the same entities; `test_edition_specific_spellings_still_
bind` asserts both spellings actually occur where expected. `original-en`
also capitalizes **Merman** as a proper noun through 7:29, then lower-cases
to **merman** from 7:30 (matching its own shift from Agnete to Agnes);
modern-en lower-cases throughout except one holdover capital at 7:27. Both
cases are aliases. No entity is missing from either edition
(`omittedEntities: []` on both); the small residual difference in total
mention counts (675 vs. 672) is ordinary paraphrase — e.g. one dense
sentence about Agnete/Agnes at 7:34 uses her name two fewer times in the
modern rendering, replaced by pronouns — not a dropped character.

## Source review

Both source files have 8 chapters (Preface, Exordium, Eulogy on Abraham,
Preliminary Expectoration, Problema I, Problema II, Problema III, Epilogue,
stored as one reading unit each) and 232 paragraphs, with identical
paragraph counts per chapter (5, 13, 17, 42, 32, 29, 88, 6) on both sides.
No source edits. The chapter *titles* for Problema III spell Abraham's
servant differently between editions ("Eleazar" in original-en's title,
"Eliezer" in modern-en's) — chapter titles are not indexed paragraph text
and are never bound, so this affects no offsets; the body paragraphs of
both editions consistently use "Eliezer."

## Commands

```sh
python3 books/characters/fear-and-trembling/author_content.py
python3 books/characters/build_fear_and_trembling.py
python3 books/characters/build_fear_and_trembling.py --check
python3 -m unittest books.characters.test_fear_and_trembling -v
python3 -m unittest discover -s books/characters -p 'test_*.py'
python3 books/characters/inventory.py
```

Ten tests: saved-package freshness; exact UTF-16 spans and source hashes;
the two Sarahs split exactly at the Tobit digression (every mention in both
editions checked, not just a sample); the two boundary paragraphs (7:60,
7:68) landing on Abraham's-wife side; edition-specific spellings
(Cartesius/Descartes, Johannes de silentio/Silentio, Gloster/Gloucester)
still binding correctly; Cain not confused with Isaac or Abraham; Kildevalle
deliberately unbound; no mention leaking into an adjective; no invented
outcomes or missing reference entries (68 entries, zero omissions, one
snapshot each); and Abraham being the only Central entry.

Authoring-agent source review only, per the Lane A automation queue; not
independent editorial approval. Release owner must register both English
editions, version the asset, run app gates, and report production
verification before changing `appStatus`.
