# The Histories character package — IN PROGRESS

**Books 1–3 (Clio, Euterpe and Thalia, sections 1–557) are authored. Books 4–9
are not.** Status stays `in-progress` and the package must not be integrated
until all nine books are covered.

Current state: 272 entities authored, 270 bound in the older translation and all
272 in the modern edition, 7,718 and 7,625 exact mentions. The mention counts are
already the highest in the library, because the nations Herodotus names —
Persians, Hellenes, Athenians, Lacedaemonians — recur through all nine books and
are bound wherever they appear, not only in Book 1. Content revision 2026-09-12.1.

## Why this is the hardest book in the queue

Herodotus names several hundred people and nearly as many nations, explains almost
none of them, and reuses names freely across generations and empires. In the first
hundred sections alone there are **two men called Atys** — Croesus's son and the
ancient king the Lydians are named after — **two called Lycurgus**, the Athenian
faction leader and the Spartan lawgiver, six sections apart; and **two called
Cambyses**, Cyrus's father through the whole book and Cyrus's son in its last
pages. The **Alexander** who carries off Helen in section 3 is not the Alexander
who will rule Macedon in Book 5.

None of that can be resolved by a name list. Almost all the work here is position
tables.

## How the unauthored books are handled

Where a name in Books 2–9 belongs to somebody Book 1 has not authored, it is
**left unbound rather than defaulted to the Book 1 man of the same name.** That is
why every table in the builder has `None` for its default. Three cases are already
in place:

- **Leon** king of Sparta is bound at 64, 800 and 1226; the Leon sacrificed by the
  Persians at 1202 is a different man and carries no card.
- **Ninus** father of Agron is bound at 7; the Ninos who fathered Sardanapallos at
  365 is not.
- **Bias** of Priene is bound at 27 and 169; the Bias of Argos at 1437 is not.

Each of those was caught by the spot-read, not by a coverage test, and each is
pinned by a test now.

## Two translations, two transliteration systems

The older translation is Macaulay's, which keeps the Greek endings; the modern
edition latinises them. Every one of these is carried as an alias on a single
entity: **Heracleidai / Heraclids**, **Mermnadai**, **Alcaios**, **Ninos**,
**Myrsos**, **Myrsilos**, **Lydos**, **Adrastos**, **Hyroiades**, **Deïokes**,
**Kyaxares**, **Labynetos**, **Tellos**, **Peisistratos**, **Lycurgos**,
**Alcmaion**, **Kypselos**, **Thrasybulos**, **Pittacos**, **Inachos**,
**Athene**, **Kimmerians**, **Phenicians**, **Achaians**, **Belos**,
**Lacedemonians**, **Aiolians**, **Lykians**, **Phocaians**, **Massagetae**. A
test pins eleven of them.

## Editorial checks — Books 1 to 3

**1. Namesakes.** The four resolved above (Atys, Lycurgus, Cambyses, Alexander),
plus Leon, Ninus and Bias against their later namesakes, plus **Artembares** the
Mede in sections 113–115 against the Persian Artembares of the very last section
of the work, who is not yet authored and not bound.

**2. Person or not.** Cities, rivers, mountains, seas and countries are excluded,
which in Herodotus removes more than half the proper nouns. Four judgement calls:

- **The Pythian prophetess** is cast as a person, not as a place-name — she speaks,
  and the reader needs to know who is answering.
- **The Magians** are cast as a people, because Herodotus treats them both as one
  of the six Median tribes and as the caste that reads dreams.
- **Leleges** is cast, though it is only the old name of the Carians, because the
  text uses it as a people-name.
- **Kyme**, **Smyrna** and **Phocaia** are cities and are not cast; the peoples of
  the first two appear only in the modern edition and are recorded as omissions.

**3. Scriptural and mythological figures.** The four abductions that open the work
— Io, Europa, Medea, Helen — are cast as the mythological figures they are, with
cards that say what each abduction is doing in Herodotus's argument rather than
retelling the myth. Zeus, Apollo, Athena, Hera, Aphrodite and Heracles are cast
for their cult titles, since that is how Herodotus uses them: Zeus the Purifier
and Guardian of Friendship, Apollo as Loxias and as Ismenian, Aphrodite as Urania
and as the Assyrians' Mylitta.

**4. Ambiguous references.** Left unbound: **Croesus's mute son**, who has no
name in the text; the **Persian who nearly kills Croesus at Sardis**, likewise
unnamed; and every name in Books 2–9 that belongs to a person this pass has not
authored.

**5. Spot-read.** Forty-eight mentions drawn at random, twelve per edition per
book, read back against their paragraphs. All correct after the three fixes
above; before them, the Leon of 1202 was carrying the Spartan king's card.

**Book 2 adds its own namesake and its own place-versus-person case.**
**Alexander** is Paris again in the long Egyptian passage of sections 327-335,
where Herodotus argues that Helen never reached Troy at all — so Paris is bound
there as well as in section 3, and the Macedonian of Books 5 and 7-9 still is
not. **Moeris** is a king in sections 221, 228 and 316 and a lake everywhere
else; only the king is cast, and a test pins it.

**6. Both editions independently.** Two entities are missing from the older
translation — the **Smyrnaeans** and the **Cymeans**, where Macaulay writes only
"the men of Smyrna" and "the men of Kyme" — and none from the modern. **No entity
is missing from both.** Book 2 added another twelve transliteration divergences,
all of them closed with aliases: Ladike, Esop, Etearchos, Hecataios, Menelaos,
Lynkeus, Linos, Dioscuroi, Samothrakians, Keltoi, Kilikians, and the Hephaistos
/ Hephaestus and Dionysos / Dionysus pairs that alternate within both editions.

## Source defects — recorded, not repaired

| Defect | Effect |
|---|---|
| The chapter titles number sections **continuously for Books 1–3** ("Book 2 — Euterpe, Chapter 216") and **restart at 1 for Books 4–9** ("Book 4 — Melpomene, Chapter 1"). The underlying chapter numbers are continuous throughout. | Reader-facing labels are inconsistent between the first three books and the last six. No effect on offsets or on this package; worth fixing in the edition metadata. |
| Stray editorial section numbers survive inside the running text of the older translation — e.g. "against the Medes, 15 and he drove the Kimmerians", "to Egypt, not agreeing therein with the Hellenes, 3" | Cosmetic in the reader; **do not strip them**, since removing them would move every UTF-16 offset in the file and invalidate this package's hashes. |

No edition byte was touched.

## Remaining work

- Books 3–9 (sections 398–1525): Cambyses and the Magian, Darius and the seven,
  the Scythian campaign, the Ionian revolt, Marathon, Thermopylae, Salamis and
  Plataea. Several hundred more people and nations.

  Book 3 is done. Books 4–9 remain.

- The namesake tables extended as each book is authored, and the `None` defaults
  replaced only where the later man is actually carded.
- The six editorial checks re-run over the whole work, and a fresh spot-read.

## The Smerdis problem, and how it is solved

Book 3 turns on one deception and the package has to carry it exactly.

Herodotus is more careful than he is usually given credit for: **every literal
"Smerdis" in the text is Cyrus's son.** The impostor is never given the name in
narration — he is always "the Magian" — and the one place the two come closest,
section 464, says he usurped "the place of his namesake Smerdis son of Cyrus",
naming the dead man, not the living one. So:

- **`smerdis-son-of-cyrus`** is bound on the word *Smerdis*, everywhere, and a
  test asserts that every mention of him quotes that word.
- **`smerdis-the-magian`** is bound on the word *Magian*, and a test asserts that
  no mention of him quotes the word *Smerdis* at all.

The one genuinely undecidable case is section 460, where Prexaspes interrogates
the herald: *"you say you have come as a messenger from Smerdis son of Cyrus."*
The name spoken means Cyrus's son; the man it refers to is the Magian. It is
bound to Cyrus's son, because that is the name on the page, and the whole force
of the scene is that the two have not yet been separated.

Three entities answer to the word, not two. **`magians`** is the priestly caste
and Median tribe of Books 1, 5, 7 and 8. **`magian-brothers`** is the usurper and
Patizeithes together, which is what the plural means through the conspiracy.
**`smerdis-the-magian`** is the usurper alone.

**Section 476 is the hardest paragraph in the work.** In a single paragraph the
two Magians are beheaded, every Magian in Persia is then hunted down, and the
festival of the Magophonia is explained — so the word switches from the two men
to the caste mid-paragraph, and *the two translations distribute the singular and
the plural differently while doing it.* Macaulay writes "every one of the
Magians" where the modern edition writes "every Magian". That paragraph carries
a separate occurrence list per edition, and a test walks its bindings in source
order and asserts the switch happens.

## Also in Book 3

**Two men called Archias in one paragraph** (452): the Lacedaemonian who died
inside Samos, and the grandson of the same name whom Herodotus says he talked to
at Pitane. Only the fourth occurrence is the grandson; a test pins it.

**The tribute roll of sections 489–495** names about forty nations with their
assessments. It is bound to one card — *The tribute nations* — on the same
reasoning as the Florentine houses in the Divine Comedy package: forty cards
reading "one of the peoples of Darius's twentieth division" is noise, and what
the reader needs is to know what the list is and why Herodotus troubled to copy
it out.

**Gated identities.** Smerdis son of Cyrus, and the Magian, both carry
identity updates released at the paragraph where the text itself releases them —
427 for the secret killing, 464 for the seven months' reign, 477 for the
Magophonia. A reader at section 430 is not told by a card what only section 458
reveals.

## Validation

`python3 books/characters/build_the_histories.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Nineteen focused
tests so far. No edition changes, no network generation.
