# Continuity sheet — the Odyssey, Book 2 (candidate v1, frozen)

Written alongside drafting `candidate-v1.json`. Describes what the frozen
draft actually did. Paragraph IDs are `B02-Pnnn`, 1-indexed, throughout — no
parallel 0-indexed numbering (the off-by-one that caused records finding R4 at
Book 1).

Name forms follow `../GLOSSARY.md`'s naming decision as revised at Book 1's
acceptance: the **Greek** forms. Book 2 is the first Book drafted under it
from the start rather than remapped afterwards.

## Source

- `../../../../app/public/data/editions/odyssey-original-en.json`, chapter
  `number: 2`, 35 paragraphs. Extracted verbatim into `source-book2.json`
  (sha256 in `provenance.json`).
- Samuel Butler, 1900, PG #1727. See `../PROVENANCE.md` §1.
- **Step 1 was re-done from scratch for this Book, not inherited.**
  `../scripts/verify_source_book2.py` reconstructs Book 2 from the raw PG file
  by a rule devised here and audited first, then diffs against the staged
  file: **35 of 35 paragraphs byte-identical, zero diffs, 4,184 words compared
  word-for-word.** Method and audit below.
- Book 2 was read in full before any paragraph was drafted: the dawn and the
  calling of the assembly; Aegyptius's opening question; Telemachus's
  complaint and his staff dashed to the ground; Antinous's answer and the
  story of Penelope's web; Telemachus's refusal to send his mother away; the
  two eagles and Halitherses's reading of the omen; Eurymachus's dismissal of
  it; Telemachus's demand for a ship; Mentor's rebuke of the people and
  Leiocritus's answer; the assembly broken up; Telemachus's prayer by the sea
  and Athena's answer in Mentor's likeness; Antinous's false friendliness and
  the suitors' jeering; the store-room, Eurycleia, and the oath; Athena's
  gathering of the crew and the drugging of the suitors; the launch, the sail
  hoisted, the drink offering, and the night voyage.

## Source verification — the rule, the audit, and what it found

The Book 1 reviewer established that a re-run of the build proves nothing, and
that a reconstruction sharing the build's blind spot proves nothing either. So
the rule here is devised independently, and audited before it is trusted.

**The property reused is the one the Book 1 reviewer identified: this
translation's only real apparatus class is bare-digit footnote references
glued to the text, and the class is derivable from PG's own numbered
footnote-entry list rather than from indentation.** The rule here derives it
again, for the whole body, and then uses it **positionally** rather than as a
pattern:

- PG's `FOOTNOTES:` section lists **186 bracketed entries numbered up to 187**,
  with **29 absent** from the list (that gap is in Book III and does not touch
  Book 2).
- The translation body contains **exactly 187 digit runs**, and read in order
  they are the sequence **1, 2, 3 … 187** — no repeats, no gaps.
- The two counts reconcile. So every digit run in Butler's body is a footnote
  reference, and Butler's body contains no digits of its own; he writes
  "twenty measures", "twelve jars", "the twentieth year" in words throughout.

A pattern rule ("delete any digit run") would swallow a body digit silently.
This rule asserts that the k-th run removed **is** the k-th marker, so a stray
body digit breaks the arithmetic instead of vanishing. **Book 2 holds markers
17–23**, seven of them on six lines (PG 763, 803, 809, 929, 1014, and 1100
which carries two).

**The apparatus audit, run over PG lines 741–1116 before any reconstruction
was trusted:**

| class | count in Book 2's range |
|---|---|
| indented lines | **0** — the entire Meditations family of failures (footnote bodies, verse runs, captions, unmarked continuations) is defined by indentation, and none of it can occur here |
| `[Illustration` markers | 0 |
| in-text Greek (`[Greek: …]`) | 0 |
| daggers | 0 |
| underscores | 0 |
| square brackets | **1** — see "base-text defects" below |
| digit runs | 6 lines, 7 markers |
| short standalone lines (≤24 chars) | 11, every one checked and every one the last wrapped line of a paragraph; **no running head, no page number, no catchword** |

**Two things the audit caught that the rule would otherwise have got wrong,
and both are recorded because the next Book's drafter should not rediscover
them:**

1. **`FOOTNOTES:` occurs twice in PG #1727** — at line 75 (the table of
   contents) and line 10843 (the real section). Anchoring on the first makes
   the translation body empty and the marker relation **vacuously true**: the
   check would have passed while proving nothing. The script takes the last
   and asserts there are exactly two.
2. **Butler's markers in Book 2 are never preceded by a space.** Globally nine
   of the 187 are; in Book 2 the preceding characters are `.`, `d`, `”`, `r`,
   `,`, `,`, `s`. So the rule's "strip any spaces immediately before the
   marker" clause is a **no-op for this Book** — recorded so that its silence
   is not mistaken for correctness in a Book where it does fire. The hard
   cases that do occur here are all present and were left in rather than
   assumed away: a marker after a closing quotation mark (`.”19`), a marker
   followed by an em dash (`singlehanded18—unless`), and a marker at
   end-of-line (`for him.17`).

**Negative controls, so that "zero diffs" means something.** The check is
capable of failing, and was made to fail twice on purpose: joining a
paragraph's lines with a space instead of a newline differs in **35 of 35**
paragraphs (the staged `original-en` preserves PG's hard line wraps as literal
newlines); leaving the markers in differs in **5 of 35**. Only the stated rule
gives byte-identity.

## Names met in Book 2, and how they are rendered

**Mapped, per `../GLOSSARY.md`** (counts are occurrences in the candidate, and
each matches the source exactly): Ulysses → **Odysseus** (17), Minerva →
**Athena** (8), Jove → **Zeus** (6), Euryclea → **Eurycleia** (2). The chapter
title is mapped too: "…starts for Pylos with **Athena** disguised as Mentor".

**Not in Book 2 at all**, so no question arises: Neptune, Mercury, Saturn,
Diana, Calypso, Polyphemus by name (the Cyclops is named only as "the savage
Cyclops"), Nestor, Menelaus.

**Kept exactly as Butler has them:** Telemachus, Penelope, Ithaca, Achaeans,
Argives, Troy, Sparta, Pylos, Ephyra, Laertes, Icarius, Antinous, Eurymachus,
Polybus, Aegyptius, Antiphus, Eurynomus, Pisenor, **Ops**, Themis, Erinyes,
Halitherses, Mentor, Leiocritus, Evenor, Noemon, Phronius, Tyro, Alcmena,
Mycene, Cyclops, **Ilius**.

Three of these want a note:

- **`Ops`** (B02-P025) is Butler's Greek name for Eurycleia's grandfather, a
  man, and is **not** mapped — *Ops* is also the Roman name of Rhea, and a
  mapping table built from a general Roman → Greek deity list would put a
  goddess in his place. `../GLOSSARY.md` hazard 1; the table is closed.
- **`Ilius`** (B02-P002, "Ilius, land of noble steeds") is Butler's own form
  for Ilion/Troy. **Flagged, not corrected**, per `../GLOSSARY.md`'s rule
  about unusual Butler spellings. Note that Butler writes *Troy* elsewhere in
  this same Book (B02-P010), so the two stand side by side in one chapter;
  that is his text, and normalizing it would flatten a distinction the Greek
  also makes. **Put to the reviewer.**
- **`Mycene`** (B02-P007) is the woman Mykene, in a list of famous women of
  old with Tyro and Alcmena — **not** the city Mycenae. Kept as Butler spells
  it; a reader who takes it for the city is in the same position as a reader
  of Butler.

## Recurring formulas fixed in this Book

Rows added to `../GLOSSARY.md`; the reasoning is there. Listed here because
Book 2 is where each is first met or first recurs.

- **The dawn formula** — "Now when the child of morning, rosy-fingered Dawn,
  appeared" → **"When Dawn, the rosy-fingered child of morning, appeared"**.
  All three elements kept (child of morning, rosy-fingered, Dawn as a person);
  only the apposition is reordered, because Butler's order makes "Dawn" the
  last word before the main clause and a modern reader parses "appeared
  Telemachus rose" as one phrase. Recurs throughout the poem.
- **"spoke to them plainly and in all honesty"** (B02-P009 of Halitherses,
  B02-P013 of Mentor) — **rendered identically both times.** Butler uses it to
  mark the two speakers who are telling the truth, in a Book where everyone
  else is not.
- **"Hear me, men of Ithaca"** (B02-P010, B02-P014) kept identical; B02-P003's
  "Men of Ithaca… hear my words" is Butler's own variation and is kept
  different.
- **"the grey-eyed daughter of Jove"** → **"the gray-eyed daughter of Zeus"**
  (B02-P034). *gray*, not *grey*, under the American spelling standard: the
  served `modern-en` uses "gray" twelve times and "gray-eyed" itself.

**Four formulas carried over from accepted Book 1, rendered identically
here.** This is the class the Book 1 reviewer punished hardest (one word of
Butler's rendered two ways), and it is the first place in the package where
the risk runs *between* Books rather than within one:

| Butler | Book 1 | Book 2 |
|---|---|---|
| "spunging upon one man… Jove shall reckon with you in full… no man to avenge you" | B01-P027 | **B02-P008, identical**: "feeding off one man, heaven help me, but Zeus will settle the account with you in full, and when you fall in my father's house, there will be no one to avenge you" |
| "a ship and a crew of twenty men"; "(and people often hear things in this way) some heaven-sent message may direct"; "build a barrow to his memory, and make my mother marry again" | B01-P019, in Athena's mouth | **B02-P012, identical, in Telemachus's**: "a crew of twenty men"; "or—as often happens—some message from heaven may guide me"; "hold his funeral rites with full honor, raise a mound to his memory, and give my mother in marriage again" |
| "all the marriage gifts so dear a daughter may expect" | B01-P019 | **B02-P011, identical**: "all the marriage gifts a beloved daughter deserves" |
| "moodily" | B01-P009, "in low spirits" | **B02-P020, identical** |

**One of those four is flagged for the reviewer.** Book 1's reviewer noted, in
an "also noted" remark and without making it a finding, that "so dear a
daughter may **expect**" → "a beloved daughter **deserves**" moves from
expectation to desert. It is repeated here **for consistency with the accepted
Book 1**, not because the objection has been answered. If the reviewer thinks
the objection should now be raised, the fix belongs in both Books at once, as
a glossary row and a `candidate-v2` in each — not in Book 2 alone.

## Paragraph-level decisions

- **B02-P001** — "comely feet" → "shapely feet"; "girded his sword about his
  shoulder" → "slung his sword over his shoulder"; "endowed him with a
  presence of such divine comeliness" → "gave him such divine grace of
  presence". **"criers" → "town criers"**, deliberately *not* "heralds":
  Butler uses *herald* three paragraphs later for Pisenor, and collapsing the
  two would lose a distinction he keeps. The two hounds, the spear in hand,
  and the father's seat are kept exactly.
- **B02-P002** — **"had cooked his last dinner for him" is kept verbatim.**
  Butler's phrase is doing two things at once — the idiom for *finished him*
  and the literal fact that the Cyclops ate him — and any paraphrase picks
  one. "Ilius, land of noble steeds" → "land of fine horses" (the epithet
  kept as an epithet). The three sons and which of them is a suitor are kept
  as three distinct facts.
- **B02-P003** — "host" → "army"; "matter of public moment" → "matter of
  public importance"; "hear my words" → "hear what I have to say". Butler's
  three questions stay three.
- **B02-P004** — the Book's longest paragraph (440 source words) and its
  hardest. Every item of Telemachus's case is kept and in Butler's order: the
  staff from Pisenor; the two misfortunes named and numbered; the father who
  was chief and was like a father to every one of them; the suitors' refusal
  to approach Icarius; the oxen, sheep and fat goats; the wine; "no estate can
  stand such recklessness"; the appeal to conscience and to public opinion;
  the appeal to Zeus and Themis; the counterfactual that his father may have
  wronged the Achaeans; and the closing preference for being eaten by the
  assembly rather than the suitors, "for then I could take action against you
  to some purpose". "ere long" → "before long"; "singlehanded" →
  "single-handed"; "the wrath of heaven" → "the anger of heaven" (the *heaven*
  metonym itself is kept, as at Book 1). **The square bracket is resolved —
  see "base-text defects" below.**
- **B02-P005** — "save only Antinous" → "no one but Antinous". Butler's beat
  (the staff thrown down, the tears, the silence, the one exception) is kept
  as four beats.
- **B02-P006** — **"tambour frame" → "embroidery frame"**: a tambour frame is
  a frame for embroidery, and the word is now opaque where the object is not;
  the concrete thing survives, which is what matters, since the web is the
  trick. **"Sweet hearts" → "Sweethearts" and kept as the address it is** —
  arch and faintly patronizing, which is exactly Penelope's tone while she is
  deceiving them; softening it to "my suitors" would be interpretation, not
  modernization. **"pall" is kept**: it is current English for precisely this
  object, it occurs twice in three lines, and the second occurrence ("laid
  out without a pall") teaches it. "This three years past, and close on four"
  → "For three years now, and close on four" — the exact reckoning kept,
  because B02-P007 counts from it.
- **B02-P006 → B02-P007** — **Butler's unclosed quotation preserved**
  (decision **D4**, `../PUNCTUATION.md` §2). Antinous's speech runs through
  B02-P006 and continues into B02-P007 as one uninterrupted speech; Butler
  does not close the quotation at the end of B02-P006, and B02-P007 opens with
  its own mark. The candidate reproduces this exactly. It is the only
  unbalanced paragraph in either file, in both — verified: source 29 open /
  28 close, candidate 29 / 28. Note that the inner **single** quotation, round
  Penelope's own speech, *is* closed at B02-P006's end (`without a pall.’`),
  which is Butler and not a slip: the woman's speech ends, the man's does not.
- **B02-P007** — "whereon" dropped; "on the score of the accomplishments
  Minerva has taught her" → "on the strength of the skills Athena has taught
  her"; "they were nothing to your mother any one of them" → "not one of them
  was anything to your mother". The suitors' quoted ultimatum stays a quotation
  inside the speech. "honour" → "honor" (spelling standard).
- **B02-P008** — "the Erinyes" is kept as Butler's Greek name, with the
  Book's **one gloss**: "the Erinyes—the spirits of vengeance—to avenge her".
  Three words, at first use, folded into the sentence, on the Book 10 pilot's
  model ("cubit → roughly eighteen inches"); the alternative English name,
  *the Furies*, is Roman, and this edition has just decided against Roman
  names. Butler's "avenge **her**" is kept — the Erinyes are called on to
  avenge Penelope, not to punish Telemachus. See the formula table above for
  the closing sentences, which are Book 1's word for word.
- **B02-P009** — the omen kept in full and unexplained: two eagles, the wind,
  side by side, the wheeling over the middle of the assembly, the beating
  wings, "glaring death into the eyes of the men below", the fighting and
  tearing, and the flight **to the right** — the direction is the omen and is
  never glossed.
- **B02-P010** — "I see mischief brewing for them" → "I see trouble brewing
  for them". The prophecy keeps its two verifiable parts, which Book 13 and
  Book 16 both need: the twentieth year, and that no one would know him.
- **B02-P011** — "prating here about omens" → "going on here about omens";
  "on the tiptoe of expectation" → "on tiptoe with expectation" (Butler's
  image kept, its grammar modernized); "we shall go on harassing him with our
  suit" kept. Eurymachus's threat keeps both its limbs — what will happen to
  Halitherses's young friend, and the heavier fine on Halitherses himself —
  and Butler's parenthetical aside is kept as a parenthesis.
- **B02-P012** — see the formula table. "hither and thither" → "here and
  there"; "in quest of" → "in search of"; "with all due pomp" → "with full
  honor", matching Book 1.
- **B02-P013** — "plainly and in all honesty" applied, matching B02-P009.
  Mentor's standing (a friend of Odysseus, left in charge with full authority
  over the servants) is kept in full: it is why his rebuke carries, and why
  Athena later takes his shape.
- **B02-P014** — Mentor's speech is **ironic throughout** and the irony is
  left to work: "I hope you may never again have a kind and well-disposed
  ruler" is not softened or signposted. "in the naughtiness of their hearts"
  → "in the wickedness of their hearts"; "wager their heads that Ulysses will
  not return" → "stake their heads on Odysseus never coming back"; "such
  scandalous goings on" → "such scandalous goings-on". The closing count —
  "you are many and they are few" — is kept as the accusation it is.
- **B02-P015** — "about his victuals" → "over his food"; "his blood would be
  upon his own head" kept as the idiom it still is. Leiocritus's sneer at the
  end ("which I do not think he will") is kept, and so is the reason he gives.
- **B02-P016** — "abode" → "home".
- **B02-P017** — "went all alone by the sea side" → "went off all alone along
  the sea shore": **"all alone" is kept**, because it is the point — this is
  the first time in the poem Telemachus is by himself.
- **B02-P018** — "bade me sail the seas" → "told me to sail the seas";
  "hindering me that I cannot do so" → "hindering me, so that I cannot".
  Telemachus addresses Athena as "you god", masculine and unknowing, which is
  kept: he does not know who she is.
- **B02-P019** — Athena's speech keeps every one of its conditions and hedges,
  which is the most easily flattened thing in the Book: *if* you are made of
  the same stuff; *unless* you have the blood of both parents; sons are
  *generally* worse, not better; *as* you are not going to be fool or coward;
  *not entirely* without some share of his discernment. The provisioning
  instructions keep their objects and quantities (the wine in jars, the barley
  meal in leather bags, "which is the staff of life" kept as Butler's phrase),
  and "beat up volunteers" → "round up volunteers".
- **B02-P020** — "moodily" → "in low spirits", matching B01-P009. **"my fine
  fire-eater" → "my fine hothead"**: *fire-eater* for a hothead is dated
  enough now to read as literal, and the whole line is Antinous mocking
  Telemachus's outburst in the assembly. "bear no more ill blood neither in
  word nor deed" → "bear no more ill will, in word or deed" (the double
  negative is Butler's grammar, not his meaning). "The Achaeans will find you
  in everything" → "will provide you with everything" — Butler's *find* in the
  sense of *furnish*, now dead. **"outer court" is kept**, matching B01-P032.
- **B02-P021** — Telemachus's refusal keeps its three steps: he will not eat
  with them; they wasted his property while he was a boy; he is stronger now.
  The closing concession — "must be a passenger and not a captain" — is kept,
  because it is the humiliation the whole voyage answers.
- **B02-P022** — "snatched his hand from that of Antinous" → "snatched his
  hand out of Antinous's". The jeering is kept as jeering.
- **B02-P023 – B02-P024** — the two anonymous suitors are kept **anonymous
  and distinct**: one imagines Telemachus fetching allies or poison, the other
  imagines him drowning and the estate divided. Butler does not name them and
  neither does the candidate.
- **B02-P025** — the store-room keeps its whole inventory: the gold and bronze
  heaped on the floor, the linen and spare clothes in open chests, the
  fragrant olive oil, the casks of old wine ranged against the wall, and the
  doors that open in the middle. "unblended" → **"unmixed"** — Butler means
  unmixed with water, which is what makes it fit for a god; "unblended" now
  suggests whisky.
- **B02-P026** — the numbers are kept exactly: **twelve** jars, lids on all of
  them, **about twenty** measures of barley meal. "well-sewn leathern bags" →
  "well-sewn leather bags". The secrecy instruction is kept as an instruction.
- **B02-P027** — Eurycleia's objection keeps all four of its parts: the
  question, the reminder that he is the one hope of the house, the fear of
  what the suitors will do behind his back, and the plea to stay. "the barren
  ocean" → "the barren sea".
- **B02-P028** — "Fear not, nurse" → "Do not be afraid, nurse"; "my scheme is
  not without heaven's sanction" kept, *heaven* included. The oath's terms are
  kept exactly — ten or twelve days, and the exception if she asks — and so is
  the reason, which is the tender and slightly absurd one Butler gives: "I do
  not want her to spoil her beauty with crying."
- **B02-P029** — the oath, the wine drawn off, the meal bagged, and the return
  to the suitors, in Butler's order, with nothing summarized.
- **B02-P030** — "bethought her of another matter" → "thought of something
  else". Noemon son of Phronius, the sundown meeting, the tackle, and the
  ship's station at the end of the harbor are all kept; "harbour" → "harbor".
- **B02-P031** — **"She caused their drink to fuddle them" → "She made their
  drink go to their heads"**: *fuddle* is dead, and the plain modern phrase
  keeps the agency exactly where Butler has it — the drink does it, and Athena
  makes the drink do it. The dropped cups and the heavy eyes are kept.
- **B02-P032 – B02-P033** — Athena in Mentor's voice again, the crew at their
  oars, and the stores "in the gallery" — matching B01-P023's rendering of
  Butler's *cloisters*, which is the same part of the house. "maid servants" →
  "maidservants"; "except one" kept, because the one is Eurycleia and the
  reader has just watched her swear.
- **B02-P034** — the launching is the most concrete passage in the Book and
  every part of it is kept in order: the hawsers loosed, the benches, the west
  wind, the ropes, the mast set in its socket in the cross plank, raised, made
  fast with the forestays, the white sails hoisted with ropes of twisted ox
  hide, the sail bellying, the foam hissing against the bows, the ship made
  fast throughout, the mixing bowls filled to the brim, and the drink
  offerings — "to the immortal gods that are from everlasting" kept in full,
  "and above all to the gray-eyed daughter of Zeus".
- **B02-P035** — "Thus, then," → "And so": the Book's one-sentence close kept
  as one sentence.

## Word ratio

**0.9993** overall (4,181 candidate words to 4,184 source words), with no
paragraph below **0.951** (B02-P005) and none above **1.059** (B02-P003).

This is far closer to 1.0 than Book 1's 0.9462, and the reason is in the
source rather than in the drafting: Book 2 is a Book of speeches in plain
argument, with far less of the long Victorian sentence-chaining that Book 1's
narration carries. **The ratio is a screening signal and proves nothing about
completeness either way**, and a near-1.0 ratio carries its own risk — that
the rendering is a light touch-up rather than a real modernization. Two checks
against that, both offered to the reviewer rather than claimed as proof:

- **No paragraph is byte-identical to Butler.** All 35 differ.
- **Butler's dead words and forms in Book 2 are gone**: `thereon`, `ere long`,
  `whereon` (×3), `spunging`, `victuals`, `naughtiness`, `prating`, `hither
  and thither`, `abode`, `save only`, `bade`, `moodily`, `endowed`, `tambour`,
  `singlehanded`, `unblended`, `comeliness`, `steeds`, `amongst`, `bethought`,
  `fuddle`, `find you in everything`. **Zero survive**, and none was replaced
  by a different archaism.

## Nothing imported from other translations

No wording was taken from any translation other than Butler's. Fagles,
Lattimore, Wilson and Fitzgerald were not read, quoted, or paraphrased from
memory. The passages most exposed are the dawn formula and the launching at
B02-P034, both of which have famous renderings elsewhere; the candidate's are
built from Butler's own words ("the child of morning, rosy-fingered Dawn";
"the foam hissed against her bows"). The Greek name forms are the product's
own, from `odyssey-threads.json`, applied from the closed table in
`../GLOSSARY.md` — not an import.

## Base-text defects and unresolved source issues

1. **B02-P004 carries Butler's own square bracket, and the candidate drops the
   brackets and keeps the words.** PG #1727 line 802 reads
   `Themis, who is the beginning and the end of councils, [do not] hold back`.
   The staged `original-en` keeps it verbatim, correctly — it is **Butler's**
   bracket inside his translation, not Project Gutenberg apparatus; the audit
   found no PG apparatus of any kind in this range. Butler brackets these two
   words because the Greek does not supply them and the sense requires them.

   **The mark goes and the words stand**: the candidate reads "I beg you, by
   Zeus and by Themis, who is the beginning and the end of councils: do not
   hold back, my friends". This follows the Meditations package's settled
   practice for a **textual mark** (a mark about the state of the source text,
   rather than a translator's supplement of a second English word or a
   translator's note), which is that the mark is dropped and the word is kept.
   The alternative — keeping `[do not]` on the page — would read to a modern
   reader as a typographic error in a sentence that is already a plea, since
   nothing else in the edition uses brackets and there is no apparatus to
   explain them. A colon was introduced before "do not" to carry the weight
   the bracket was carrying in Butler's pointing. **This is the package's
   first bracket of any kind. Put to the reviewer**, both for the ruling and
   for whether it should become a glossary/ledger rule before a later Book
   produces a second one (the Book 10 pilot reports brackets of a different
   class — "[to be milked]", "[to feed]" — in its chapter).
2. **No corrupted, truncated, or mid-sentence source paragraph** was found.
   All 35 source paragraphs are complete passages ending in terminal
   punctuation, apart from item 3.
3. **B02-P006's unclosed quotation** is Butler's printing convention for one
   continuous speech split by a paragraph break, **not a defect**, and it is
   preserved. See the B02-P006 → B02-P007 entry above.
4. **No Gutenberg apparatus of any kind** appears inside Book 2's paragraphs:
   zero indented lines, zero illustration markers, zero Greek spans, zero
   daggers, zero underscores. The seven footnote markers (17–23) are correctly
   stripped, with no doubled space and no orphaned dash left behind — the
   three hard cases (`.”19`, `singlehanded18—unless`, `for him.17`) were each
   checked individually.
5. **The staged `original-en` preserves PG's hard line wraps** as literal
   newlines inside every paragraph; the candidate contains **none**, matching
   the served `modern-en` and `modern-da`. Correct, not a defect; recorded so
   the reviewer does not have to rediscover it.
