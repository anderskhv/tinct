# Book 6 — every change from `candidate-v1.json` to `candidate-v2.json`

Written by `../scripts/build_book06_v2.py`, which is the only thing
that produced them: `candidate-v1.json` is frozen and was not edited
(**D10**). Each row is one substitution, in the order the build
applies them, with the round-1 finding it answers. Every `old`
string is asserted to occur exactly once in its paragraph, and every
`new` string is asserted to have landed.

14 substitutions in 10 of the 26 paragraphs.

| # | paragraph | finding | from | to |
|---|---|---|---|---|
| 1 | B06-P018 | S-1(a) / M-4 — the silver-plate sentence: subject and verb closed up | `She glorified him about the head and shoulders as a skillful workman who has studied every kind of art under Hephaestus and Athena enriches a piece of silver plate by gilding it—and his work is full of beauty.` | `She glorified him about the head and shoulders as a skillful workman enriches a piece of silver plate by gilding it—a man who has studied every kind of art under Hephaestus and Athena—and his work is full of beauty.` |
| 2 | B06-P018 | M-3 — `Athena then made … She also made …` rejoined at Butler's seam | `Athena then made him look taller and stronger than before. She also made the hair grow thick on the top of his head, and flow down in curls like hyacinth blossoms.` | `Athena then made him look taller and stronger than before, and made the hair grow thick on the top of his head, and flow down in curls like hyacinth blossoms.` |
| 3 | B06-P016 | S-1(b) — the 43-word four-limb chain divided at its second `and` | `that juts into the sounding sea, and have nothing to do with any other people.` | `that juts into the sounding sea. We have nothing to do with any other people.` |
| 4 | B06-P016 | S-1(b) — the 38-word chain of the same shape divided at its second `and` | `are under Zeus’s protection, and will take what they can get and be thankful.` | `are under Zeus’s protection. They will take what they can get and be thankful.` |
| 5 | B06-P009 | M-1 — `grass` for Butler's `herbage` collided with Butler's own `grass` at P011 | `the sweet juicy grass that grew by the waterside` | `the sweet juicy greenery that grew by the waterside` |
| 6 | B06-P009 | M-8 — the correlative restored across the division: `Just as … So …` | `As the huntress Artemis goes out over` | `Just as the huntress Artemis goes out over` |
| 7 | B06-P009 | M-8 — the correlative restored across the division: `Just as … So …` | `Even so did the girl outshine her handmaids.` | `So did the girl outshine her handmaids.` |
| 8 | B06-P023 | M-2 — `topes` → `drinks` collided with accepted B04-P020's `drinks` | `where he sits and drinks like an immortal god` | `where he sits over his wine like an immortal god` |
| 9 | B06-P015 | M-5 — `appear` restored, so Butler's variation is not flattened into P021's `seem` | `you seem to be a sensible, well-disposed person` | `you appear to be a sensible, well-disposed person` |
| 10 | B06-P022 | M-6 — `picked up` out of register; Butler's `taken`, with Butler's own preposition | `a vagabond sailor she has picked up from some foreign vessel` | `a vagabond sailor she has taken from some foreign vessel` |
| 11 | B06-P026 | M-7 — `prevent` restored, against accepted B02-P011 | `in his efforts to keep Odysseus from getting home` | `in his efforts to prevent Odysseus from getting home` |
| 12 | B06-P014 | M-9 — `thwarts` imported a purpose; `galls` is Butler's sense | `It thwarts their enemies` | `It galls their enemies` |
| 13 | B06-P011 | O-2 — the repeated `voices` removed, in Butler's own form | `they sound like the voices of the nymphs that haunt mountain tops` | `they sound like those of the nymphs that haunt mountain tops` |
| 14 | B06-P024 | O-5 — `plied` restored | `so she used her whip with judgment` | `so she plied her whip with judgment` |

## The flow read (step 7)

One change, and it is the one no measure in the package can see —
blind spot 1 of round 1 §9, *a sentence divided at the wrong seam*.

| # | paragraph | finding | from | to |
|---|---|---|---|---|
| 1 | B06-P018 | F-1 (flow read) — the division taken back to Butler's semicolon: it left two consecutive sentences opening `Then` in a paragraph that already opens on `Then` | `and the girl gazed at him in admiration. Then she said to her maids:` | `and the girl gazed at him in admiration; then she said to her maids:` |

Taking this one division back moves the raw D17 rate from
**+28.4% to +27.6%** and leaves **NORM RATE at +7.0%, unchanged to
the decimal**. A period turned back into a semicolon is worth zero
on the normalized denominator and 0.8 points of headline on the raw
one. It is the cleanest demonstration in the package of why **D20**
exists.

## Findings not applied, and why

Each is asserted **still present** in the built file, so a decline
cannot be a silent application (**D11**).

| finding | paragraph | reason |
|---|---|---|
| O-1 — `scion` → `young woman`, and the palm-tree figure it severs | B06-P013 | Butler's `scion` is a plant word — a young shoot — and his very next sentence is the palm tree and *“never yet did such a young plant shoot out of the ground.”* The word prepares the simile and `young woman` severs it. Round 1's own instruction is the disposition: *if no rendering holds both senses, record the loss.* No rendering does. `creature` is Butler's own word at B04-P077 and B05-P010 and taking it would be the collision M-1 and M-2 exist to stop; `shoot`, `scion` and `sapling` said of a girl to her face are not modern English in this register. **The loss is recorded** in `continuity.md` §5 and here, which is what was owed and was missing. |
| O-6 — `mountain tops`, the standard closed form being `mountaintop` | B06-P011 | Declined at this Book, and escalated rather than deferred. The form is consistent with accepted B05-P030 and recorded, so it is not an unrecorded departure; closing it here would put Book 6 in drift with accepted Book 5 and closing it there costs a **sixth successor**, which is a coordinator decision and not a Book 6 one. It is ledger item **A4**(ii), where it sits beside the vendored word list that would settle the whole class mechanically. `scripts/checks.py` §11 now enumerates the class for a reader every time it runs. |
| S-1(c) — B06-P006, the third paragraph the drafter defended | B06-P006 | **Answered, not owed** — round 1's own ruling, and it is recorded here so the paragraph is not revisited by a later pass looking for the third of three. 94 words, one word-level edit, one cashed semicolon, longest candidate sentence 25 words, and the voice is a daughter coaxing her father. On this one the drafter's *“Butler is already writing plain modern English there”* survives inspection. |

## Findings settled as a rule, with no change to the text

| finding | rule |
|---|---|
| **O-3** — three archaic inversions, two kept and one removed | **A Butler inversion is kept where it is the second limb of a comparison the sentence needs in order to be read, and un-inverted where it is a bare narrative tag.** P009 (`So did the girl outshine…`) and P012 (`Even such did Odysseus seem…`) are correlative apodoses answering a simile: un-invert them and the reader has to reconstruct the comparison backwards. P026 (`Thus did he pray` → `So he prayed`) is a tag and carries nothing. One class, one rule, two outcomes that follow from it — which is what **D16** did for punctuation. Asserted in all three places by the build. |
| **O-4** — `conduct`/`conducted` has four renderings across the Books | **Butler's `conduct` family is not a reserved term and has no fixed rendering: it is a general verb of accompaniment, and each instance takes the verb its own sentence's action calls for** (`take` B01-P007, `led` B01-P010, `conducted` B04-P024, `guide` B06-P010). This is the opposite disposition from `still undecided` for `thus in two minds`, and the difference is decidable: a formula Butler repeats verbatim gets one rendering, a common verb does not. Ruled at the Book that raised it rather than carried forward (**D11**). |

## Paragraphs differing v1 → v2

B06-P009, B06-P011, B06-P014, B06-P015, B06-P016, B06-P018, B06-P022, B06-P023, B06-P024, B06-P026
