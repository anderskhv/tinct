# Faust, Part One character package

Both full English editions, 28 scenes, 895 paragraphs each, aligned paragraph
for paragraph. 97 entities authored, 96 bound in the original and all 97 in the
modern edition, 1,101 and 1,143 exact mentions. **No entity is missing from both
editions.** Content revision 2026-09-11.1.

## A play, so the speaker tags do the work

Almost every identification in a play happens at the head of a speech. Every
speaking part is therefore carried under the tag it speaks by **and** under the
name other characters use for it, and case matters: `MARGARET` is the tag,
`Margaret` is the name in dialogue, and both are aliases of one person.

Goethe's crowds speak in anonymous voices — A MECHANIC, ANOTHER BURGHER, A
THIRD, SERVANT-GIRL — and those are grouped into one card, *The townsfolk at the
gate*, rather than carded individually. What the reader needs there is that the
crowd is deliberately faceless.

The **Walpurgis-Night's Dream** is the opposite case: thirty speakers, one line
each, every one a caricature of a contemporary journal, critic or philosophical
school. Each gets its own card, because without one the whole intermezzo is
noise — nobody now reads *Musaget* or *Ci-devant Genius of the Age* and hears a
joke about Hennings's magazines.

## Source defects — recorded, not repaired

The original edition is a **scan with visible damage**, and this is the most
defective source in the library so far. None of it was touched.

| Defect | Where | Effect |
|---|---|---|
| The speaker tag **CHORUS OF DISCIPLES** is lost; the speech runs straight on from Faust's line | 4:26 | The entity is bound in the modern edition only, and recorded as an `omittedEntities` divergence. A test pins it. |
| **Marearet** for Margaret | 20:0 | Carried as an alias |
| German running heads left in the text — **ABEND**, **OA ABEND**, **GARTEN**, **FELD**, **BB KERKER**, **BRUBER**, **MARTHE**, **MARGARETE** | scenes 10, 11, 14, 25, 26, 27 | MARTHE and MARGARETE are carried as aliases; the rest are page furniture and are not cast. A test pins MARTHE. |
| **PRELUDE ON TIE STAGE** for "on the stage" | 2:0 | Not a name; left as printed |
| **PROCKTOPHANTASMIST** against the modern **PROKTOPHANTASMIST** | 24:32 | Both carried as aliases |
| **FAust—** for FAUST | 26:0 | Not bound at that occurrence; Faust is bound elsewhere in the same scene |
| **Will-o'-the- Wisps** broken across a line with a space | 25:26 | Not bound at that occurrence; the entity is bound at 24:4 |
| Stray OCR debris in running text — `nie` for me, `hast. long`, `no know`, `ou` for out, quote marks turned into `“` and `”` mid-word | throughout | Does not affect any binding |
| **The last four paragraphs of scene 25 duplicate the first four of scene 26** — "A Gloomy Day" begins twice, once at the tail of the Walpurgis-Night's Dream chapter and again at the head of its own | 25:32–35 and 26:0–3 | Present identically in both editions, so alignment holds and offsets are unaffected. The reader sees the scene's opening twice. **This is the one defect worth fixing at source**, and fixing it would move every offset after it. |

## Editorial checks

**1. Namesakes.** Faust has no two characters with the same name, but three tags
are ambiguous and each needed a rule:

- **SPIRIT** is the Spirit of the Earth in the study (scene 4) and nothing else.
  The EVIL SPIRIT of the cathedral and the CHORUS OF SPIRITS carry their own
  tags. A test asserts the Earth Spirit appears only in scene 4 and the Evil
  Spirit only in scene 23.
- **Lord** is God in the Prologue and in Margaret's and Valentine's mouths —
  except at 9:36, where Mephistopheles tells the Witch "you may call me Lord
  Baron". That one is skipped by table, and a test pins it.
- **Monkeys** covers THE MONKEYS, THE HE-MONKEY and the original's mixed-case
  *The He Monkey*: one household, one card.

**2. Person or not.** Places are excluded. Three near-misses: **Blocksberg**,
**Brocken** and **Schierke** are mountains, not persons, and are not cast.
**Mammon** is cast, because Goethe uses him as a power with a mountain of his
own on the Brocken. **Thule** is a place, but *the King in Thule* is a person in
Margaret's song and carries a card.

**3. Scriptural and mythological figures.** God, Christ, Satan, Solomon, Lilith,
Helen, Cupid, Medusa, Perseus and Orpheus are each cast for the use Goethe makes
of them rather than for their own stories. Lilith is the one worth a reader's
attention: Mephistopheles names her as Adam's first wife, which is not in
Genesis and is exactly the kind of thing Goethe expects to be recognised.

**4. Ambiguous references.** Left unbound: the generic crowd tags **ALL**,
**ANOTHER**, **OTHERS**, **THE FIRST**, **THE SECOND**, **VOICE** and
**VOICES**, which are too common as ordinary words to bind safely and name
nobody in particular. **Faust's father** is named by no one; he is bound by the
Old Peasant's thanks ("your father") in scene 5, where both editions carry the
phrase. **The pale girl with the red thread** in scene 24 is Margaret's
apparition, and the text says so only obliquely; she is not bound as a separate
figure.

**5. Spot-read.** Twenty mentions drawn at random, ten per edition, read back
against their paragraphs. All twenty correct. The adjacency sweep over every
mention abutting a word caught one real error: "Lord Baron" at 9:36 bound to the
Lord of the Prologue. Fixed.

**6. Both editions independently.** One entity is missing from the original —
the Chorus of Disciples, whose speaker tag the scan lost — and none from the
modern. **No entity is missing from both.**

## Validation

`python3 books/characters/build_faust_part_1.py --check`, then
`python3 -m unittest discover -s books/characters -p 'test_*.py'`. Twelve focused
tests. No edition changes, no network generation, no production verification
claimed here.
