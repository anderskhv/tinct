# jerusalem — Jerusalem (Selma Lagerlöf, 1901)

Reviewer: audit batch agent, 2026-09-11. Scope: `public`.

**Headline: the last four chapters of `jerusalem-modern-en.json` are byte-for-byte
identical to Howard's 1915 translation — 338 paragraphs, 16,179 words, 21% of the book
was never modernized at all. In the fourteen chapters that *were* processed, I confirmed
repeated multi-hundred-word omissions and at least two inventions that contradict the
source. This is the worst edition in my batch by a wide margin.**

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `747b53bedd58d9ba` | 18 | 1787 | 77,761 | Howard (1915) — tr. Velma Swanston Howard |
| modern-en | `6cdbf3a5904a26d5` | 18 | 1787 | 73,351 | Modern English |
| modern-da | `c1552e9a9a3a311b` | 18 | 1787 | 71,516 | Moderne Dansk |

`en_editions_aligned: true`, no paragraph-count mismatches, no empty paragraphs.
Phase 1 flags: **mean weighted similarity 0.8805**, **pct_identical_long_paragraphs 32.0**,
**18 truncated paragraphs**. All three confirmed and all three understate the problem.

## Provenance and completeness of the core English text

Velma Swanston Howard, *Jerusalem: A Novel*, Doubleday, Page & Co., 1915. Public domain
(Internet Archive `jerusalemanovel00howagoog`, Project Gutenberg #15837).

**This is only half the novel.** Lagerlöf's *Jerusalem* was published in two Swedish
volumes: *Jerusalem I: I Dalarne* (1901) and *Jerusalem II: I det heliga landet* (1902).
Howard translated them separately — the 1915 *Jerusalem* is Volume I; Volume II appeared
as *The Holy City: Jerusalem II*, Doubleday, 1918 (Internet Archive `cu31924026328678`,
also public domain). Our file's chapter 18 is titled **"The Departure Of The Pilgrims"**,
which is where Volume I ends. So the book Tinct ships stops at the moment the pilgrims
leave Sweden — before anyone reaches Jerusalem.

The registry description (`bookRegistry.ts:1206`) promises "a charismatic preacher leads
half its people on a pilgrimage to the Holy Land"; the Holy Land never appears in the
text. `wordCount: 90000` in the registry vs. 77,761 actual. **Completeness: partial —
Volume I of II.** This should be flagged independently of the translation-quality verdict.

## Phase 1 flags: confirmed vs. disconfirmed

I recomputed similarity per paragraph (`difflib`, token sequences, `autojunk=False`,
paragraphs ≥15 words) and also did an exact-string comparison.

**Byte-identical paragraph counts, modern-en vs. original-en:**

| ch | title | identical / total | src words → modern words |
|---|---|---|---|
| 1 | Book One — The Ingmarssons | 131 / 308 (42.5%) | 11,673 → 10,522 |
| 2 | At The Schoolmaster's | 12 / 63 (19.0%) | 3,406 → 3,305 |
| 3 | And They Saw Heaven Open | 9 / 42 (21.4%) | 2,348 → 2,082 |
| 4 | Karin, Daughter Of Ingmar | 66 / 202 (32.7%) | 7,391 → 6,960 |
| 5 | In Zion | 8 / 65 (12.3%) | 3,043 → 2,655 |
| 6 | The Wild Hunt | 37 / 149 (24.8%) | 6,348 → 5,821 |
| 7 | Hellgum | 29 / 122 (23.8%) | 6,159 → 5,599 |
| 8 | The New Way | 92 / 236 (39.0%) | 7,942 → 7,354 |
| 9 | Loss Of L'Univers | 19 / 75 (25.3%) | 4,043 → 3,924 |
| 10 | Unity, Unity. | 2 / 11 (18.2%) | 706 → 687 |
| 11 | Hellgum's Letter | 18 / 95 (18.9%) | 4,707 → 4,568 |
| 12 | The Big Log | 7 / 18 (38.9%) | 674 → 643 |
| 13 | The Ingmar Farm | 1 / 20 (5.0%) | 1,226 → 1,181 |
| 14 | Hoek Matts Ericsson | 10 / 43 (23.3%) | 1,916 → 1,871 |
| **15** | **The Auction** | **112 / 112 (100%)** | 5,073 → 5,073 |
| **16** | **Gertrude** | **110 / 110 (100%)** | 5,910 → 5,910 |
| **17** | **The Dean's Widow** | **21 / 21 (100%)** | 1,181 → 1,181 |
| **18** | **The Departure Of The Pilgrims** | **95 / 95 (100%)** | 4,015 → 4,015 |

- **CONFIRMED, and worse than flagged: `pct_identical_long_paragraphs 32.0`.** Chapters
  15–18 are not "similar", they are the same file content. Every paragraph, every
  character, including Howard's 1915 archaisms and her hyphen-for-dash typography:

  > **ch16 p13, IDENTICAL in both editions:** "…With that Gertrude was seized by an
  > uncontrollable desire to do the ogre's bidding, and lowered the needle. 'Mind you stick
  > him right in the eye!' said the witch. **Whereupon** Gertrude quickly drove the needle
  > … she noticed that the needle went far down**-not** as though it had come into contact
  > with metal…"

  > **ch18 p57, IDENTICAL in both editions:** "…**nor was there any one** in the
  > living-room, **nor yet** in the inner room."

  A reader who toggles to "Modern English" for the last fifth of the novel gets exactly
  what they were trying to leave.

- **CONFIRMED: 18 truncated paragraphs** — and they are omissions, not compressions.
  Details below.
- **CONFIRMED: mean similarity 0.8805.** My recomputation gives 0.94 overall; chapters
  9–12, 14 sit at 0.94–0.98 even excluding the four untouched chapters. Outside the
  truncation sites, the "modernization" is mostly punctuation and single-word swaps.
- **DISCONFIRMED / not applicable:** no empty paragraphs, no chapter-count mismatch,
  `last_chapter_suspiciously_short: false` is correct for Volume I as shipped.

## Samples inspected (9)

### 1. Opening — ch1 p0–3 (control sample: the edition at its most harmless)

> **original-en p0:** "A young farmer was plowing his field one summer morning. The sun
> shone, the grass sparkled with dew, and the air was so light and bracing that no words
> can describe it."
> **modern-en p0:** "A young farmer was plowing his field one summer morning. The sun
> shone, the grass sparkled with dew, and the air was so light and bracing that words could
> not describe it."

Finding: Howard's opening is already plain, clear English. The modern edition changes one
clause. This is representative of the ~65% of the book where modern-en is doing nothing
a reader would notice — which makes the damage at the truncation sites gratuitous.

### 2. ch1 p24 — **omission + invention** (303 → 96 words, ratio 0.32)

> **original-en:** "…'Yes,' I reply, 'and she had strangled it. It was lying dead beside
> her.' **'But she couldn't have been in her right mind.' 'Oh, she knew well enough what
> she vas about!' I say. 'She did it to get even with me for forcing myself upon her.
> Still she would never have done this thing had I married her…' Father is dumb with
> grief, but by and by he says to me: 'Would you have been glad of the child, little
> Ingmar?' … 'And this is why you have no standing in the parish?' … 'It's not so easy
> for a man to understand a bad woman!' says father. 'No, father, Brita was not bad, but
> she was a proud one!' 'It comes to the same thing,' says father.**"

> **modern-en:** "…'Yes,' I reply, 'and she had strangled it. It was lying dead beside
> her.' **'But little Ingmar,' says father, 'surely you didn't let the law take its
> course?' 'Yes, I reported it to the sheriff,' I say, 'and she was arrested and charged
> with murder.'**"

Finding: ~200 words of the novel's central father-son dialogue deleted — including Brita's
motive, Ingmar's share of the blame, his loss of standing in the parish, and the line that
defines her ("Brita was not bad, but she was a proud one!") — and replaced with an
exchange that **does not occur in the source at all**. Not a compression. A substitution.

### 3. ch3 p33 — **the worst invention in the book**

> **original-en:** "…And they saw heaven open! The whole firmament had been drawn back to
> right and left, like a pair of curtains, and the two stood there, hand in hand, and
> beheld all the glories of heaven. Have you ever heard anything like it, Mother Stina, or
> you, Storm?' said the pastor in awed tones. 'Only think of those two standing on the
> bridge and seeing heaven open! **But what they saw they have never divulged to a soul.**
> Sometimes they would tell a child or a kinsman that they had once seen heaven open, but
> they never spoke of it to outsiders. But the vision lived in their memories as their
> greatest treasure, their Holy of Holies.'"

> **modern-en:** "…And they saw heaven open! **They saw a brilliant light and angels
> swinging their censers, and they could hear music as beautiful as the ringing of silver
> bells.**"

Finding: the source's entire point — that the vision was **never described to anyone** and
survives as an unspoken "Holy of Holies" — is deleted, and in its place the modern edition
*describes the vision*. It asserts the exact thing the chapter says was never told. This
is the chapter that gives the section its title. Anyone reading the modern edition reads a
different, and flatly contradictory, scene.

### 4. ch5 p0 — image replaced by generic explanation (136 → 74 words)

> **original-en:** "…How can he help but regard all the people in the parish as mere school
> children, however old they may have grown? … **It seems almost an impossibility for one
> of these regular old school persons to treat any one as a grown-up, for he looks upon
> each and every one as a child with dimpled cheeks and wide innocent baby eyes.**"

> **modern-en:** "…He sees that a whole community is directed and guided by him, and
> naturally thinks himself a very important person. **It is hard for him to imagine that
> there may come a time when the people will no longer listen to him.**"

Finding: Lagerlöf's concrete image (dimpled cheeks, baby eyes) is deleted; what replaces
it is both flatter and not in the source — it foreshadows a plot point the paragraph does
not make.

### 5. ch5 p50 — simile deleted, invented cross-reference inserted (163 → 54 words)

> **original-en:** "**It could be just like this in school sometimes, on a bright spring
> morning, when a little bird perched itself outside the schoolroom window and warbled
> lustily. Then all at once the children would tease and beg to be excused from school…**
> However, the schoolmaster meant to show the pastor and all of them that he was man
> enough to quell the mutiny. 'First, I will leave them alone and let the ringleaders talk
> themselves hoarse,' he thought, and went and sat down on a chair behind the table on
> which the water bottle stood."

> **modern-en:** "…What was happening reminded Storm of something he had experienced
> before. **It felt like the start of all over again—the commotion over the mission house
> four years earlier. He decided he had heard enough.**"

Finding: the spring-bird simile — the actual content of "something he had experienced
before" — is cut, and an invented specific ("the commotion over the mission house four
years earlier") is put in its place, together with the loss of Storm's tactical plan and
the physical staging.

### 6. ch6 p59 — largest single omission (349 → 92 words, ratio 0.26)

> **original-en:** "…'The day before Christmas, mother sent me up to the forest with a
> basket of good fare for Strong Ingmar. **I started early, so as to be there before the
> midday dinner hour. When I came up, father and Strong Ingmar had just finished drawing a
> kiln … 'Come, let me show you what a fine house we've got here.' Then he took me into
> the hut … 'Here are walls that keep out both storm and frost,' he laughed, thrusting his
> arm clean through the spruce branches.**"

> **modern-en:** ends at "…mother sent me up to the forest with a basket of good food for
> Strong Ingmar."

Finding: ~260 words — the whole charcoal-kiln anecdote, Strong Ingmar's "royal castle" in
the forest, the joke about the walls — simply gone. The story Ingmar announces he is going
to tell is never told.

### 7. ch8 p47 — omission + invention (208 → 122 words)

> **original-en:** "…**Her father then asked her if all of them were going to live on the
> Ingmar Farm. No, only herself; the others had true Christians in their own homes. Now
> Clementsson is a pretty good sort, as you know, and both he and his wife tried to reason
> with Gunhild in all kindness, but she stood firm. At last her father became so
> exasperated that he just took her and locked her up in her room, telling her she'd have
> to stay there till this crazy fit had passed.**"

> **modern-en:** "…**Oh no, not at all, the girl said. If she stayed with the unconverted
> she would have to live in sin. So the old man locked her in her room.**"

Finding: Clementsson's kindness, his wife, the exasperation that motivates the lock-in,
and the detail that only Gunhild would move — all gone; an invented doctrinal line
supplied instead. The father goes from a patient man driven to the end of his temper to
a man who just locks his daughter up.

### 8–9. ch16 p13 and ch18 p57–58 — the unmodernized tail

Quoted above under Phase 1 flags. Verified by exact string equality across all 338
paragraphs of chapters 15–18, and by reading three of them in full. Howard's 1915
vocabulary and punctuation are intact: "Whereupon", "the old dame", "enamelled", "to take
a last peep at the shepherd", "nor yet in the inner room", and her `-` used where an
em-dash belongs.

Also noted: 3 stray Project Gutenberg emphasis markers (`_Marie Boving_`, `_me_`, `_you_`)
survive in modern-en, all inside chapters 16–17. The reader body text does not render
markdown (only `Chat.tsx`, `Feed.tsx`, `Notes.tsx` do), so these display as literal
underscores.

## Phase 3 — human-edition research

| Candidate | Date | Completeness | Rights | Verdict |
|---|---|---|---|---|
| Velma Swanston Howard, *Jerusalem* | 1915, Doubleday | **Volume I only** | Public domain — IA `jerusalemanovel00howagoog`, PG #15837 | **Already our `original-en`.** |
| Velma Swanston Howard, *The Holy City: Jerusalem II* | 1918, Doubleday | Volume II | Public domain — IA `cu31924026328678` | **Not in Tinct at all.** The obvious way to make the book complete. |
| Norvik Press "Lagerlöf in English" series (Schenck / Graves / Death) | 2011– | 12 titles so far | **In copyright** | Series does not appear to include *Jerusalem*; even if it did, not usable. |

**No public-domain alternative to Howard exists**, and no modern human translation of
*Jerusalem* is rights-clear for commercial distribution in either the US or the EU. So
"USE HUMAN EDITION" is not available: Howard *is* the human edition, and she is already
shipping as `original-en`. That is precisely why the modern-en's defects matter — there
is no fallback text to switch to.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 1 |
| first-read clarity | 25% | 3 |
| literary voice | 20% | 2 |
| restraint / no invention | 10% | 1 |
| naturalness | 5% | 4 |

**Weighted score 1.9 — band: Poor.**

Fidelity is a 1, not a 2: 21% of the book has no modern edition behind the label, and in
the remainder I found deletions of 200–260 consecutive source words in six of nine
sampled locations. Restraint is a 1 because at least two of those deletions are backfilled
with invented content that contradicts the source (ch3 p33, ch1 p24).

## Recommendation

**RETRANSLATE.** Confidence: **high**. The defect is emphatically *recurring*, not local —
it appears in chapters 1, 3, 5, 6, 7, and 8, matches the 18 machine-flagged truncation
sites, and the four untouched chapters are a categorical failure, not a quality question.

Correction scope: **substantial** (effectively a full regeneration of `modern-en` from
Howard, chapter by chapter, with a per-paragraph length/coverage gate).

Recommended next actions, in order:
1. Treat `jerusalem-modern-en` as not shippable in its current state; at minimum stop
   presenting chapters 15–18 as a modern edition.
2. Regenerate the modern edition with a hard rule that no paragraph may fall below ~0.85
   of its source word count without human review, and a post-check that no chapter is
   byte-identical to `original-en`.
3. Separately: decide whether to add Howard's 1918 *The Holy City: Jerusalem II* so the
   novel is complete, and fix `bookRegistry.ts` (`wordCount: 90000`, and a description
   that promises a Holy Land section the text does not contain).

## Limitations of this review

- 9 sampled locations plus exhaustive mechanical comparison of all 1,787 paragraph pairs.
  I read in full only 6 of the 18 truncation sites; the other 12 I have only by word-count
  ratio, so I have **not** individually verified that each is an omission rather than a
  legitimate compression (though the 6 I read were all omissions).
- I did **not** check the modern edition against Lagerlöf's Swedish — no Swedish original
  is present in the repo — so I cannot say whether Howard herself is accurate, only
  whether the modern edition preserves Howard.
- I did **not** audit `modern-da`, which was produced alongside modern-en and shares its
  paragraph structure; it is 71,516 words against Howard's 77,761 and **should be assumed
  to carry the same omissions until checked**.
- No rendering/visual QA in the app.
