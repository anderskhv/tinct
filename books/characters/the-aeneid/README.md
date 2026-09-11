# The Aeneid character package

Both full English editions, all twelve books; 340 entries in the original and
342 in the modern, 2,107 and 2,134 exact mentions across 544 paragraphs per
edition. Content revision 2026-09-11.1. Authoring-agent review, not independent
editorial approval. Validated content, awaiting runtime integration.

Aeneas and Turnus are Central. Dido, Ascanius, Anchises, Venus, Juno, Jove,
Latinus, Lavinia, Amata, Evander, Pallas, Mezentius, Lausus, Camilla, Achates,
the Sibyl, Priam, Hector, Creusa, Anna, Nisus, Euryalus, Acestes, Mnestheus,
Messapus, Drances, Juturna, Helenus, Palinurus, Sinon, Laocoon, Alecto, Apollo
and Neptune are Major. The rest of the acting cast is Supporting; genealogy,
myth, the Roman parade of souls and the men named once in a battle line are
Reference.

## Verse against prose

The original is Dryden's rhymed couplets, the modern edition is prose. They run
to the same twelve books and the same 544 paragraphs and align paragraph for
paragraph, but Dryden paraphrases freely and the prose sometimes names a person
where the verse uses a pronoun or an epithet, or the reverse. That accounts for
the 27-mention difference between the editions, and for the two entities absent
from the original.

Dryden uses the Roman names throughout, so unlike the Odyssey and the Iliad
there is no Greek/Roman split to reconcile.

## Editorial checks

**1. Namesakes.** Nineteen names belong to more than one person or thing, and
each is resolved by paragraph from the text.

**Pallas is three people**, and the split matters because two of them are Major:

| | Where |
|---|---|
| Pallas Athena, the goddess | Books 1–7 throughout, plus 8:15 (the snakes on her shield), 8:24 (named with Neptune and Venus on Aeneas's shield) and 11:27 (her temple) |
| Pallas, Evander's son | 8:6 onward, and every Pallas in books 10–12 |
| Pallas, Evander's great-grandsire | 8:3 only — the line that explains where Pallanteum got its name |

Others: three men named **Abas** (Trojan captain 1:9, the Greek whose shield
hangs at Actium 3:13, the Etruscan ally 10:14 and 10:33); four named **Butes**
(the Bebrycian giant 5:16, Anchises' old squire 9:42, Camilla's victim 11:38,
Turnus's victim 12:33); three named **Amycus**; two each named Bitias, Pandarus,
Gyas, Lycus, Thoas, Remus, Menoetes, Actor, Ilus, Alcanor, Caeneus, Idaeus,
Capys, Teucer and Silvius.

**Serestus and Sergesthus are different men** and easy to confuse: Dryden spells
the first Serestus once and **Seresthus** everywhere else, so both spellings are
aliases of one entity, while Sergesthus — founder of the Sergian line, whose
galley is wrecked in the boat race — is separate.

**2. Person or not.** Places, rivers as geography, mountains and islands are
excluded. So are **ships**, which matters here: the boat race in book five names
four galleys **Chimaera, Scylla, Centaur and Dolphin**, and none of those
occurrences is bound. The monsters themselves are bound where they are monsters
(Scylla at 1:12, 3:19 and 3:32; the Chimaera at 6:11 and on Turnus's crest at
7:44; the Centaurs at the gate of hell). Two more collisions of the same kind:
**Nisus** is the Trojan, but "From Nisus' top" at 6:29 is Bacchus's mountain and
is unbound; **Ufens** is a Latin captain, but the Ufens at 7:44 is the river he
is named for, and is unbound. The **Tiber** is a river through the whole poem
and is cast only where it rises out of the poplars and speaks, and where Aeneas
prays to Father Tiber — both in book 8.

**3. Mythological and genealogical references.** The Trojan line from Dardanus,
the Alban and Roman parade in book 6, the shades in the fields of mourning, the
monsters at the gate of hell and the figures on Aeneas's shield are covered
individually.

**4. Ambiguous references, and what is deliberately unbound.** At 9:36 Dryden
writes "Two more young Liger and Asylas slew". Virgil's Latin has Liger killing
Emathion and Asilas killing Corynaeus — a Rutulian and a Trojan — but Dryden's
compression loses which side either man is on, and the Etruscan Asylas has not
yet landed at that point in the story. **Neither name is bound at 9:36**, and
`test_liger_and_asylas_at_the_wall_are_unbound` asserts it. The Liger of 10:44
(Lucagus's brother) and the Asylas of 10:14 and 11:35 (the Etruscan diviner) are
bound normally.

Sleep is bound only where the text calls it a god — "the soft God of Sleep",
"Death's half-brother, Sleep", "the silent house of Sleep" — and ordinary sleep
is left alone.

**5. Spot-read.** Eleven mentions were drawn at random from each edition and read
in context; all twenty-two bound the right person.

**6. Both editions independently.** Two entities are absent from the original and
recorded as `omittedEntities` for it: **Doto**, a sea nymph the prose names when
the ships are promised her shape, and **Pirithous**, named once in the prose
among the shades. Nothing is missing from the modern edition.

## A note on how this package was built

Thirteen entities were written into the first draft from knowledge of Virgil —
Epytides, Galaesus, Venilia, Hermione, Machaon, Sisyphus, the Myrmidons, the
Dolopians, the Lapiths and others — and the compiler reported every one of them
as having no mentions, because **Dryden's text does not name them**. They were
removed rather than bound to something approximate. The lesson is the one the
authoring rules already state: build the inventory from the text in front of
you, not from the poem you remember.

## Source defects, none blocking enablement

| Defect | Effect |
|---|---|
| Dryden spells the same captain **Serestus** at 1:31 and **Seresthus** at 9:10, 9:50, 10:41 and 12:52 | One entity, both spellings as aliases |
| Dryden writes **Polydore** where the modern has Polydorus, **Polypheme** for Polyphemus, **Hyarba** for Iarbas, **Cajeta** for Caieta, **Penthisilea** for Penthesilea | One entity each, both forms as aliases |
| The modern edition breaks **Creüsa**, **Laocoön** and **Pasiphaë** on their diaereses | Both spellings carried; binding is unaffected |
| Dryden capitalises the first word of every verse line | Not a defect, but it makes a naive capital-letter scan useless on the original; the entity inventory for this package was built from the prose edition and checked back against the verse |

No edition file was changed. Any repair to these bytes invalidates the recorded
fingerprints and requires a restored-text review and a rebuild.

## Validation

`python3 books/characters/build_the_aeneid.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Twelve focused
tests for this book. Compiler assembly in `build_reviewed.py` is shared and
deterministic; all identity prose and every namesake table is manually authored.
No edition changes, no network generation.

## Integration

Compare both fingerprints against the shipping checkout, register both English
editions, publish the versioned sidecar, and verify in production: the goddess
Pallas in book 2 against Evander's son in book 10; no card on the galleys named
Scylla and Chimaera during the boat race in book 5, with the monsters still
carded in books 3 and 6; no card on "Nisus' top" at 6:29 or on the river Ufens
at 7:44; and nothing bound at 9:36 for Liger or Asylas.
