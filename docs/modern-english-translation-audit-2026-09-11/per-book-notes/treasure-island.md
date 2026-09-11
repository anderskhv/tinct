# treasure-island — Treasure Island, Robert Louis Stevenson (1883)

Batch B22. Reviewer: audit subagent, 2026-09-11.

> **SCOPE: `staged` — report SEPARATELY from the published inventory.**
> Per `python3 books/wip_inventory.py`, `treasure-island` is a `Book` constant
> in `app/src/data/bookRegistry.ts` that is **not** in the public `BOOKS`
> array. It is not live for readers. Per the audit brief's instruction to
> "Report staged books separately", none of the numbers below should be
> aggregated into the 100-book published totals.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | sections |
|---|---|---|---|---|---|
| original-en "Stevenson (1883)" | `ce2033c95a4dcc12` | 34 | 1,375 | 67,655 | 6 |
| modern-en "Modern English" | `a7a50bd3fbdb8894` | 34 | 1,375 | 66,573 | 6 |
| modern-da "Moderne Dansk" | `ebd97722ca18fa24` | 34 | 1,375 | 67,466 | 0 |

`en_editions_aligned: true`. Chapter-count mismatch: none. Per-chapter
paragraph-count mismatch: 0. Truncated paragraphs: 0. Empty paragraphs: 0.
`last_chapter_suspiciously_short`: false (1,841 w). Mean weighted similarity
**0.7092**; `pct_identical_long_paragraphs` **0.1**.

Registry: `TREASURE_ISLAND`, `bookRegistry.ts` ~L3226–3242. All three editions
declared `aligned: true`; **no `hasAudio` flag on any edition** (published
books carry it).

## Publication-readiness context (NOT part of the translation-quality audit)

`books/wip_inventory.py` output:

```
WIP books: 1
scope   book             editions                            en_audio     da_audio     missing
staged  treasure-island  original-en,modern-en,modern-da     not checked  not checked  ready
```

- `missing: ready` — the script's content-completeness gate passes: all three
  edition files present, `app/public/data/onboarding/treasure-island.json`
  present (keys: `about`, `angleCards`, `cast`, `acclaim`, `whyItMatters`,
  `preReadingChat`, `whyItMattersItems`, `openingText`, …),
  `treasure-island-threads.json` present (`bookId` + `characters`).
- Audio could not be checked: there is no `app/public/audio/` directory in
  this checkout (audio is R2-hosted), and the script reports `not checked`.
  The registry comment above the constant states the remaining blockers
  explicitly: *"NOT in BOOKS: awaiting Kokoro English audio + Codex final
  publication."*
- So the publication blockers are **audio generation + adding
  `TREASURE_ISLAND` to the `BOOKS` array**, not content. Add the two
  `modern-en` fixes below to that list before it goes live — they are cheaper
  to fix now than after launch.

## Provenance and completeness of the core English text — VERIFIED

**`original-en` is genuine, complete, unabridged Stevenson.** Both precedent
failure modes flagged in the brief were actively checked and both are absent.

*Mislabelled/corrupt original check.* I downloaded Project Gutenberg #120
(`https://www.gutenberg.org/cache/epub/120/pg120.txt`, most recently updated
2026-09-04) and ran two directional checks after Unicode/whitespace
normalisation:

- **Forward:** 102 probes (first / middle / last paragraph of each of the 34
  chapters, 12-word head each) — **102/102 found verbatim in PG #120. 0
  misses.**
- **Reverse:** every PG paragraph of ≥6 words (1,359 of them) probed against
  our `original-en`. **25 not found — all 25 are front matter or headings**:
  the dedication "To S.L.O., an American gentleman…", the prefatory verse "To
  the Hesitating Purchaser" ("If sailor tales to sailor tunes…"), the printed
  table of contents, and 16 chapter-title lines. **Zero narrative paragraphs
  are missing.**

Structure matches the 1883 Cassell text exactly: 34 chapters in 6 parts —
"PART ONE--The Old Buccaneer", "PART TWO--The Sea-cook", "PART THREE--My Shore
Adventure", "PART FOUR--The Stockade", "PART FIVE--My Sea Adventure", "PART
SIX--Captain Silver". Word count 67,655 (paragraph text only) vs PG's 68,647
(which includes headings, ToC, dedication and the verse) — consistent.

**This is not an abridgement.** The "children's classic" abridgements that
circulate under this title (e.g. `archive.org/details/treasureislandab0000stev`)
cut chapters; ours has all 34, all 1,375 paragraphs, at full length. No
paragraph anywhere in the book falls below 70% of its source word count.

*Copyright status:* Stevenson d. 1894; the 1883 text is public domain
worldwide including the EU/Denmark and the US. No translator involved — English
original. The one paratextual gap is cosmetic: the dedication and the verse
"To the Hesitating Purchaser" are absent from `original-en`. Worth restoring
(it is authorial and it is the book's epigraph), but it is not a completeness
defect in the narrative.

*Is modern-en actually a modernization of THIS book?* Yes, unambiguously — 12
sampled passages spread over all six parts all track the correct Treasure
Island scene, character and plot, paragraph-for-paragraph. No filler, no
unrelated source text, no verbatim third-party edition. Character-name
frequency scan (39 names/terms) matches the source within ±3 everywhere,
with the only deltas being typographic (see below).

## Phase 1 flags: confirmed / disconfirmed

**Similarity 0.7092 is honest and sits in the "verified real modernization"
band — confirmed by a whole-book word-level check.** I computed
`SequenceMatcher` word-level identity per chapter after normalising quotes and
dashes:

```
whole book: 71.4% word-level identity
ch  1 66.7   ch  2 74.8   ch  3 75.6   ch  4 67.3   ch  5 71.0
ch  6 71.6   ch  7 71.1   ch  8 71.1   ch  9 69.7   ch 10 71.0
ch 11 70.5   ch 12 71.8   ch 13 71.5   ch 14 72.2   ch 15 71.5
ch 16 70.0   ch 17 69.5   ch 18 73.2   ch 19 64.6   ch 20 66.9
ch 21 71.1   ch 22 67.0   ch 23 70.2   ch 24 70.5   ch 25 70.2
ch 26 71.3   ch 27 74.2   ch 28 73.3   ch 29 75.5   ch 30 75.1
ch 31 71.6   ch 32 72.5   ch 33 75.5   ch 34 74.0
```

Range 64.6–75.6, **no taper and no untreated region** — unlike ulysses (B1),
paradise-lost/beowulf (B15) or cymbeline (B8), where a late run of chapters was
left alone while book-level numbers read clean. Every part of this book got a
real pass. Stevenson's English is already close to modern, so ~71% retained
words is the expected ceiling for a faithful light modernization, not a
mechanical-copy signal.

**`pct_identical_long_paragraphs` 0.1% — disconfirmed as a defect.** Exactly
one ≥80-char paragraph is byte-identical, ch31 p13:

> "Tall tree, Spy-glass shoulder, bearing a point to the N. of N.N.E. Skeleton
> Island E.S.E. and by E. Ten feet."

That is Flint's written sailing directions — a quoted document. Leaving it
verbatim is correct. 90 paragraphs of *any* length are identical; I read the
first 15 and they are all short already-modern dialogue lines ("I told him he
was out walking.", "Black Dog?" I asked.). Only **5** paragraphs of ≥15 words
are identical after typographic normalisation: the "Fifteen men on the dead
man's chest" refrain (ch1 p15 **and** ch23 p20 — meaningful repetition
correctly preserved in both places), two already-modern dialogue lines (ch13
p11, ch28 p47), and Flint's directions again.

**0 truncated paragraphs — confirmed.** I re-ran a ratio scan over every
paragraph with ≥25 source words: the *lowest* modern/source word ratio in the
entire book is **0.70** (ch2 p3), and I read it — pure compression of wordy
Victorian phrasing with nothing lost:

- source: "I asked him what was for his service, and he said he would take rum;
  but as I was going out of the room to fetch it, he sat down upon a table and
  motioned me to draw near. I paused where I was, with my napkin in my hand."
- modern: "I asked what he would have, and he said rum; but as I went to fetch
  it he sat down on a table and waved me closer. I stopped where I was, napkin
  in hand."

**0 empty paragraphs, alignment true, short-final-chapter false — all
confirmed.**

## Phase 2 — 12 sampled passages

Spread across all six parts: opening, early, middle, late, ending, the two
lowest-similarity chapters (the mechanical outlier pick), plus four
dialect-heavy pirate/castaway dialogue scenes as the brief requires.

### 1. Ch 1 pp 0–5 — opening (Part One)

Strong. Faithful sentence-for-sentence with genuine syntactic relief.

- source p0: "Squire Trelawney, Dr. Livesey, and the rest of these gentlemen
  having asked me to write down the whole particulars about Treasure Island…"
- modern p0: "It was Squire Trelawney, Dr. Livesey, and the rest of the
  gentlemen who asked me to write down the whole story of Treasure Island…"

The absolute construction is unwound without loss. One small dialect casualty
already visible at p4 — Billy Bones's mangled pronunciation goes:

- source: "This is a handy cove," says he at length; "and a pleasant
  **sittyated** grog-shop. Much company, mate?"
- modern: "This is a handy cove," he said at last, "and a pleasant **spot for a
  tavern**. Much custom, mate?"

"Sittyated" is Stevenson signalling in one word that this man mispronounces
educated vocabulary. It is gone, and "grog-shop" (an image) has become "spot
for a tavern" (a description).

### 2. Ch 2 pp 2–11 — Black Dog (early)

Strong on substance; mild register elevation on a pirate.

- source p8: "We'll put it, **for argument like**, that your captain has a cut
  on one cheek--and we'll put it, if you like, that that cheek's the right one."
- modern p8: "**Let us say, for argument's sake**, that your captain has a cut
  on one cheek — and let us say, if you like, that it is the right cheek."

"For argument like" is Black Dog's rough approximation of a lawyer's phrase;
"let us say, for argument's sake" is the phrase he is failing to reach.
Nothing is lost in meaning; a character marker is.

### 3. Ch 3 pp 10–23 — Billy Bones's confession, the black spot, Pew (Part One)

Very strong; this is the edition at its best. Silver/Bones sea-idiom is largely
kept — "you may lay to it", "pipe all hands", "swab", "a-dying", "as knows the
place", "weather-eye". Verb-form dialect is regularized throughout, though:
"My ears **is** singing" → "My ears **are** singing"; "He's a bad **'un**" →
"He's a bad **one**"; "magistrates and **sich**" → "and **such**"; "I'm the
**on'y** one" → "the **only** one".

One ambiguity resolved rather than preserved (p19):

- source: "but weak as he was, **we were all in the fear of death for him**, and
  the doctor was suddenly taken up with a case many miles away…"
- modern: "but weak as he was, **we all went in fear of him**, and the doctor
  had been called away suddenly to a case many miles off…"

Stevenson's phrase can be read either as *afraid of him* or *afraid he was
dying*; the modern picks one. Defensible from context ("no one dared to cross
him"), but it is a resolution, not a preservation.

### 4. Ch 8 pp 4–15 — Long John Silver's introduction (Part Two)

Strong. One flattened comic beat (p14–15):

- source: "…'Who did you say he was?' he asked. 'Black what?'" / "**'Dog, sir,'**
  said I."
- modern: "…he asked, 'Now, what name did you give him? Black what?'" /
  "**'Black Dog, sir,'** said I."

Silver's "Black what?" is a setup; Jim's bare "Dog, sir" is the punchline
completing Silver's sentence. Repeating the whole name kills the exchange.
Also p14 regularizes Stevenson's deliberately mixed mood: "If he **were**
Admiral Hawke he **shall** pay his score" → "Were he Admiral Hawke himself,
he'd settle his score."

### 5. Ch 11 pp 0–13 — the apple barrel (dialect-heavy pirate dialogue, Part Two)

This is where the dialect policy costs the most. Substance is complete; two
malapropisms and one nautical image are lost (p0):

- source: "The same broadside I lost my leg, old Pew lost his **deadlights**. It
  was a master surgeon, him that **ampytated** me--out of college and all…"
- modern: "The same broadside that took my leg, old Pew lost his **sight** in.
  It was a trained surgeon that **took it off me** — college man and all…"

"Deadlights" (sailor's slang for eyes) is an image; "sight" is its explanation.
"Ampytated" is Silver showing off a long word he cannot say, which is precisely
the vanity the whole character runs on; "took it off me" erases the joke.

One small over-clarification and one softening, both in p12:

- source: "When a mate **brings a slip on his cable**--one as knows me, I
  mean--**it** won't be in the same world with old John."
- modern: "When a mate **slips his cable** — one that knows me, I mean — **he**
  won't be in the same world as old John **for long after**."

"For long after" is not in the source and turns Silver's veiled threat into an
explicit one; the vague "it" is resolved to "he". Same paragraph:

- source: "the devil himself would have been **feared to go to sea with them**"
- modern: "the devil himself would have **thought twice about shipping with
  them**"

"Feared" → "thought twice" softens a genuinely frightening line.

Positive note: `LAMBS` (source emphasis caps) is correctly rendered as
`'lambs'`, keeping the emphasis.

### 6. Ch 15 pp 12–29 — Ben Gunn (the most extreme idiolect in the book, Part Three)

The best test of "is dialect differentiation preserved or homogenized?" Verdict:
**preserved but visibly sanded down.** Ben Gunn is still instantly recognisable
(the cheese obsession, "Marooned three years gone", the sudden piety, "I'm
rich"), but every non-standard verb is corrected: "and here I **were**" → "here
I **was**"; "And right you **was**" → "And right you **are**"; "That **were**
his name" → "That **was** the name". And his best malapropism goes (p21):

- source: "and so my mother told me, and **predicked** the whole, she did, the
  pious woman!"
- modern: "and so my mother told me, and **foretold** the whole of it, she did,
  the pious woman."

A real logic change at p13/p15 — a conditional becomes a near-certainty, and
the exchange it sets up stops making sense:

- source p13: "**If ever I can get aboard again**," said I, "you shall have
  cheese by the stone."
- modern p13: "**Once I'm aboard again**," said I, "you shall have cheese by the
  stoneful."
- source p15: "'**If ever you can get aboard again**, says you?' he repeated.
  'Why, now, **who's to hinder you?**'"
- modern p15: "'Once you're aboard again, is it?' he echoed. 'And just who's to
  stop you?'"

Ben Gunn is pouncing on Jim's *doubt*. With "if ever" removed from Jim's line,
Ben Gunn's question answers a doubt the modern text never states. This is the
"possibility vs. certainty" distinction the reading standard names explicitly.

(Good call in the same passage: "chuck-farthen" → "pitch-and-toss" — one
obsolete coin game for a recognisable one, and it is applied *consistently*,
recurring correctly at ch30 p32.)

### 7. Ch 19 pp 24–33 — lowest-similarity chapter #2 (0.620) — mechanical outlier pick

No defect. The low number is dense Victorian narration being genuinely
re-cast, not content drift. Dr Livesey's Parmesan speech, Redruth's burial, the
watch assignments all survive intact. One typographic bug (p33): `'must get back
to this tomorrow a deal livelier.'` opens with a curly `‘` and closes with a
straight `'`.

### 8. Ch 20 pp 8–21 — Silver's embassy — lowest-similarity chapter (0.617), Part Four

No defect; this is strong work on a long formal negotiation. Two nits:

- p12 `‘deserted.'` — same mismatched single-quote bug.
- p12: "We're willing to submit, if we can come to terms, **and no bones about
  it**" → "We're willing to come to terms and have done with it, **fair and
  square**". "No bones about it" (bluntness) and "fair and square" (honesty) are
  not the same claim, and this is Silver negotiating; the substitution is small
  but it is a change of assertion, not of wording.

### 9. Ch 24 pp 10–15 — the coracle (descriptive/nautical prose, Part Five)

Strong throughout. Stevenson's wave-as-hill-range image is kept whole and the
prose is genuinely easier. Only nit: "the big, smooth **glossy** mountain" →
"the big, smooth, **glassy** mountain" — a changed adjective, harmless.

### 10. Ch 26 pp 10–19 — Israel Hands (late, longest chapter, Part Five)

Strong. Full suspense sequence intact. Dialect regularization continues in both
directions — Hands's "I **haven't no** knife" → "I've **no** knife", and Jim's
own "**if I was you**" → "**if I were you**". Two small image swaps: "sparred
gallery" → "planked gallery"; "I had not been idle with my **body**" → "with my
**hands**".

### 11. Ch 30 pp 30–41 — On Parole (Part Six)

Strong. Silver's plea to Livesey and Livesey's rebuke of Jim both land with full
force. "Holus bolus" → "the whole load" is a sensible gloss of a Latin tag.
"I never seen a better man!" → "I never saw a better!" — regularized, and
"man" dropped.

### 12. Ch 34 pp 18–26 — the ending (Part Six) — **the one confirmed omission**

Everything is present and well handled *except* p19, where roughly 25 words of
source content are cut with no replacement:

- source p19: "…were immediately surrounded by shore boats full of **Negroes and
  Mexican Indians and half-bloods** selling fruits and vegetables and offering
  to dive for bits of money. The sight of so many good-humoured faces
  **(especially the blacks)**, the taste of the tropical fruits…"
- modern p19: "…were at once surrounded by shore-boats full of **people**
  selling fruit and vegetables and offering to dive for coins. The sight of so
  many cheerful faces, the taste of the tropical fruits…"

And p25:

- source: "but I dare say he met his old **Negress**, and perhaps still lives in
  comfort with her and Captain Flint."
- modern: "but I dare say he found his old **wife** again, and perhaps lives
  still in comfort with her and Captain Flint."

**This is silent bowdlerisation of the book's 19th-century racial language, and
it is applied inconsistently.** A term-by-term scan of the whole book
(`negro|negress|coloured|woman of colour|indian|half-blood|mulatto`) finds
exactly three source sites and three different treatments:

| site | source | modern-en |
|---|---|---|
| ch7 p19 (Trelawney's letter) | "as she is a **woman of colour**" | "as she is a **woman of colour**" — kept verbatim |
| ch34 p19 | "Negroes and Mexican Indians and half-bloods" / "(especially the blacks)" | both **deleted** |
| ch34 p25 | "his old **Negress**" | "his old **wife**" |

Whether Tinct *wants* to soften this language is a product decision, not mine.
But as it stands the edition (a) removes a described scene element without any
note to the reader, (b) contradicts its own ch7 treatment, and (c) at p25 severs
the link back to ch7 — in the source, "his old Negress" is what tells you Silver
went back to the same woman the squire's letter described. Per the audit rubric
this is a **confirmed substantive omission** and it rules out an unqualified
KEEP. It is local: one paragraph plus one phrase.

`modern-da` inherits it — ch34 p19 reads "strandbåde fulde af **folk**, der
solgte frugt og grøntsager", i.e. the Danish was made from the modernized
English, so the same excision propagates.

Two very small additions elsewhere in the same sample: p26 "certainly they shall
lie there for me" → "there, for me, they may lie **till doomsday**"; p24
"smit with the desire to rise" → "seized of a sudden with the wish to better
himself" (fine).

## Whole-book automated checks I ran beyond the 12 samples

- **Name/term consistency (39 names).** All match within ±3 except typographic
  cases below. No alternate-name drift, no invented characters, no dropped ones.
- **Typography — two real inconsistencies, both scriptable:**
  1. **Apostrophe style flips mid-book.** `modern-en` chapters 1–12 use curly
     `’` (1,209 straight / 696 curly overall); chapters **13–34 use straight `'`
     exclusively** (ch13: 32 straight / 0 curly … ch34: 30/0). `original-en` is
     100% curly. Double quotes are consistently curly everywhere, so the book
     currently renders mixed `’` and `'` inside the same curly-quoted dialogue.
     Chapter titles too: ch20 `Silver's Embassy`, ch28 `In the Enemy's Camp`
     (source has `’`).
  2. **Ship-name caps half-normalized.** Gutenberg renders italics as caps;
     `modern-en` converts `HISPANIOLA` → `Hispaniola` in most of the book but
     leaves **14 all-caps instances in chapters 7, 10, 12, 13, 14, 16, 17**
     (38 normalized). `WALRUS` likewise: 2 caps / 1 normalized. The source's
     16 `_underscore_` italic markers are all dropped (fine), and `CACHE` →
     `cache`, `LAMBS` → `'lambs'` (fine).
     These two boundaries (ch12/13 and ~ch17/18) are almost certainly
     generation-batch seams.
  3. Minor, out of scope: `modern-da` ch1 p1 has a typo — "det **sabelar**
     tværs over den ene kind" (should be "sabelarret").

## Phase 3 — human-edition research

**English original; no translation is involved, so there is no translator
rights question.** The relevant Phase 3 question for this book is the one the
brief names first: *does the original already meet the reading standard?*

**Largely yes.** Stevenson's 1883 prose is the most accessible source text in
the Tinct canon — first-person retrospective narration, short sentences,
concrete vocabulary, and it was written to be read aloud to a twelve-year-old.
A thoughtful modern adult needs no help with the narration at all. What a modern
reader *does* stumble over is (a) dense nautical vocabulary — coracle, gunwale,
scuppers, capstan bars, missed stays, jolly-boat, before the mast, ship in
stays — and (b) Stevenson's thick phonetic pirate dialect. That is a real but
narrow barrier, and it is exactly the barrier a glossing layer handles better
than a full rewrite, since the dialect *is* the literary value.

Candidates examined:

| candidate | what it is | completeness | rights | URL | verified? |
|---|---|---|---|---|---|
| Project Gutenberg #120 | Stevenson's own 1883 text, Rhead illus. ed. | complete, 34 ch / 6 parts | public domain (US/EU/DK) — original author d. 1894 | https://www.gutenberg.org/cache/epub/120/pg120.txt | **yes** — downloaded, diffed against ours, 102/102 probes matched |
| Standard Ebooks — *Treasure Island* | Same PD text, professionally re-typeset (proper italics, em-dashes, modern punctuation), transcribed from PG + IA page scans | complete | underlying text PD; Standard Ebooks' own editorial work **dedicated to the public domain via CC0 1.0** ("Content produced by or for Standard Ebooks L³C is dedicated to the public domain via the CC0 1.0 Universal Public Domain Dedication") | https://standardebooks.org/ebooks/robert-louis-stevenson/treasure-island | **yes** — licence statement read directly on the work page |
| "Modern English"/"retold" print editions | e.g. Core Knowledge *Treasure Island … Abridged for Young Readers* and similar classroom retellings | **abridged**, children's register | mixed/publisher copyright | https://www.coreknowledge.org/wp-content/uploads/2024/04/CC_TreasureIsland_Reader_W1.pdf | inspected at listing level only — **rejected on completeness and register**, not rights |

**No human unabridged modern-English rendering of Treasure Island exists that
is both rights-clear and adult-register.** Everything marketed as a "modern"
or "easy" Treasure Island is a children's abridgement — precisely the category
Tinct's no-kids-editions policy excludes. This is "none found in this search
that meets the criteria", and I am fairly confident it is also "none exists",
because the original needs so little help that there has never been a market
for one.

**Actionable Phase 3 finding:** Standard Ebooks' CC0 edition is a *better source
for `original-en`* than the PG plain text we used — it would fix the `--`
double-hyphens in our chapter titles and section headers ("PART ONE--The Old
Buccaneer", "The Treasure-hunt--Flint's Pointer") and restore real italics
instead of `HISPANIOLA` shouting caps. That is a source-hygiene upgrade, not a
translation change, and it would require re-alignment of 1,375 paragraphs.
Worth queueing, not urgent.

## Ratings

| dimension | weight | score | reason |
|---|---|---|---|
| fidelity / completeness | 40% | **4** | Complete and aligned; 0 truncations, 0 empties, no drift, verified against PG. One confirmed substantive omission (ch34 p19, ~25 words) plus a handful of small softenings ("deadlights"→"sight", "feared"→"thought twice", "no bones about it"→"fair and square") and one possibility→certainty slip (ch15 p13/15). Local, not recurring at scale. |
| first-read clarity | 25% | **5** | Consistently easier than the source with no loss of connected sense. Nautical vocabulary handled by context rather than by intrusive gloss. |
| literary voice | 20% | **3** | Stevenson's narrative voice is carried beautifully. But the dialect policy is a systematic, whole-book regularization of non-standard verb forms and the deletion of every malapropism ("sittyated", "ampytated", "predicked") and of slang images like "deadlights". Silver, Bones, Hands and Ben Gunn remain distinguishable — not homogenized — but the register gap between the pirates and the gentlemen is measurably narrower than Stevenson wrote it, and this recurs in every dialogue sample. |
| restraint / no invention | 10% | **4** | Very restrained. Three small additions found ("for long after", "till doomsday", an added "Now,"), one ambiguity resolved (ch3 p19), one pronoun disambiguated (ch11 p12). No interpretations, motives or facts added. |
| naturalness | 5% | **5** | Reads as written English, not as translated English. No mechanically short sentences, no generic explanatory prose. |

**Weighted score 4.3 — band: Good with fixes.**

## Recommendation

**LIGHT EDIT.** Confidence: **medium-high** — 12 passages read in full (~3,500
source words, ~5% of the book) across all six parts, on top of whole-book
automated scans (per-chapter word identity, paragraph length-ratio, name
frequency, racial-term diff, typography audit) that would have caught any
*systemic* omission or untreated region and caught none.

Correction scope: **local**. Three scoped fixes, all doable without touching the
rest of the book:

1. **Restore ch34 p19 and decide ch34 p25 deliberately.** Either keep
   Stevenson's descriptions (consistent with the ch7 "woman of colour" that was
   already kept) or soften all three sites consistently *and* say so in the
   edition note. Silently cutting one of three is the worst of the options.
   Propagate whichever choice into `modern-da` ch34 p19.
2. **Typography sweep.** Convert chapters 13–34 to curly apostrophes; finish the
   `HISPANIOLA`/`WALRUS` normalization in chapters 7–17; fix the four mismatched
   `‘…'` single-quote pairs (ch19 p33, ch20 p12 among them); fix the four
   chapter titles that diverge from the source. Scriptable, ~1 hour.
3. **Optional voice pass (larger, do only if you want it):** reinstate the
   malapropisms and a sample of the non-standard verb forms for Silver, Bones,
   Hands and Ben Gunn. Restoring six or eight signature words ("sittyated",
   "ampytated", "predicked", "deadlights", "he's a bad 'un") buys back most of
   the lost register at very low cost; a full dialect restoration is a
   chapter-by-chapter job and is *not* required to meet the reading standard.

Also fix at some point: add the dedication and "To the Hesitating Purchaser" to
`original-en`.

**Do not retranslate.** There is no recurring, non-local defect: coverage is
complete, alignment is exact, no chapter was skipped, and the prose quality is
consistently high. Retranslation would risk the quality this edition already
has.

**Is a modern edition worth maintaining here at all?** Marginally — this is the
closest call in the staged inventory. Stevenson's original is already accessible
and the dialect is the point of the book. A defensible alternative is SOURCE +
GLOSSES (nautical-term glosses over the 1883 text). I am not recommending it,
because (a) the modern-en that exists is genuinely good and already built, and
(b) the split-pane compare view means readers get the original alongside it
anyway. But if the dialect-flattening in item 3 is judged unacceptable and a
voice pass is not funded, SOURCE + GLOSSES becomes the better answer for this
title specifically.

## Limitations of this review — what I did NOT check

- I read 12 passages in full (~5% of 67k words). The other 95% was checked only
  by automated scan; a *local* omission or invention outside my samples would
  not have been caught unless it changed paragraph length by >30%.
- **`modern-da` was not audited.** I sampled three Danish paragraphs only, to
  confirm it is real Danish prose of this book and to check whether the ch34 p19
  excision propagated (it does). Danish quality, fidelity and register are out
  of scope here and unassessed.
- **Audio was not checked at all** — no `app/public/audio/` in this checkout;
  `wip_inventory.py` reports `not checked` for both `en_audio` and `da_audio`.
- Onboarding JSON and threads JSON were checked for *existence and top-level
  keys only*. Their content (including the `acclaim` quotes, which per
  `CLAUDE.md` require primary-source fact-checking) was not audited.
- I did not verify the book renders correctly in the app (no dev server run —
  this is review-only work), and I made no changes to any file outside
  `docs/modern-english-translation-audit-2026-09-11/`.
- Rights research was minimal by design: English original, PD worldwide, no
  translator. I did not exhaustively survey commercial "modern retelling"
  editions beyond establishing that the category is abridged children's work.
