# great-expectations — Great Expectations (Charles Dickens, 1861)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (English-originals batch)

## Edition snapshot (from Phase 1 `mechanical/great-expectations.json`)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en (Original (1861)) | `e4c4863487b9b9ce` | 59 | 3835 | 184,218 |
| modern-en (Modern English) | `760e685ddbc2b7cf` | 59 | 3835 | 181,350 |
| modern-da (Moderne Dansk) | `a44e786c7e531372` | 59 | 3835 | 182,528 |

`en_editions_aligned: true`, no count mismatches, mean weighted similarity **0.7827** (the highest
in this batch), **0.6 % identical long paragraphs**, **2 truncation candidates** (ch 26 p0,
ch 39 p102), 0 empty paragraphs, last chapter not flagged short.

## Provenance / completeness of the core English text

- `original-en` is Dickens's own 1861 English. No translator. Registry (`bookRegistry.ts`,
  `GREAT_EXPECTATIONS`) records `label: 'Original (1861)'`, `year: 1861`, no source attribution.
- 59 chapters, complete. The text carries the **revised (second) ending** — ch 59 closes with
  `I saw no shadow of another parting from her`, not Dickens's original bleaker ending. That is the
  standard choice, but it is **not disclosed** anywhere in the registry or edition label. Worth a
  one-line note in the book's onboarding copy.

## Shape of the modern-en edition

This is the **lightest-touch** modern edition in the batch. Per-chapter word overlap with the source
runs 0.68–0.88 and the length ratio is 0.92–1.02 for every chapter. There is no chapter-scale
compression; the edition is best described as the source with Americanised spelling, split
sentences, and period vocabulary swapped for modern equivalents.

My truncation scan (src ≥ 50 w, ratio < 0.70) returns only **5 paragraphs in the whole book**:
ch 26 p0, ch 26 p41, ch 39 p94, ch 39 p102, ch 57 p80. Four of the five are real defects.

An additional structural check: I scanned every `modern-en` edition in the library for
intra-chapter duplicate paragraphs. **Great Expectations has exactly one — ch 26 p27 is a duplicate
of ch 26 p43** — and it is the only such duplicate in any of the five books in this batch.

## Samples inspected (8)

### 1. Opening — Chapter 1, paras 0–3 — STRONG

- SRC p1: `I am indebted for a belief I religiously entertained that they had all been born on their
  backs with their hands in their trousers-pockets, and had never taken them out in this state of
  existence.`
- MOD p1: `I owe to them my firm belief that they had all been born lying on their backs with their
  hands in their pockets, and had never taken them out in this life.`

The joke and the five-tombstone catalogue survive whole. Two small losses in p2: `my first most
vivid and broad impression of the identity of things` → `My first vivid impression of the world
around me` (drops "broad" and flattens "the identity of things"), and `the distant savage lair from
which the wind was rushing` → `the distant, savage place` (image replaced with a generic noun).

### 2. Chapter 7, paras 31–46 (Joe's fireside narrative) — **SYSTEMATIC VOICE FLATTENING**

Joe Gargery's idiolect is the most distinctive character voice in the novel. The modern edition
removes essentially all of its phonetic and grammatical markers, and one of its jokes.

| source | modern |
|---|---|
| `somebody must keep the pot a-biling, Pip, or the pot won't bile` | `Somebody has to keep the pot boiling, Pip, or the pot won't boil` |
| `which were his too` / `I were able to keep him` / `I kep him` | `which was his too` / `I was able to support him` / `I kept him` |
| `till he went off in a purple leptic fit` | `until he died of a fit` |
| `couldn't credit my own ed,—…hardly believed it _were_ my own ed` | `could hardly believe my own head — …hardly believed it was my own head` |
| `It were but lonesome then` | `It was lonely then` |
| `Ever the best of friends; an't us, Pip?` | `Always the best of friends, aren't we, Pip?` |

`purple leptic fit` (Joe's mangling of "apoplectic") is a joke, deleted rather than translated.
`my own ed` — the dropped *h* that makes the horseshoe couplet funny — is normalised to `head`,
which removes the point. Joe's non-standard `were` for `was` is corrected throughout.

Some markers survive (`a fine figure of a woman`, `old chap`, `bringing you up by hand`), so Joe is
still recognisable — but he now speaks a mildly folksy standard English rather than his own dialect.
Under our standard ("preserve distinctive voice"; "preserve meaningful differences in address, rank,
intimacy, cultural setting"), this is a recurring defect, not a local one. It is also, arguably, the
thing a *Great Expectations* modernization most needed to get right.

### 3. Chapter 8, paras 32, 51–54 (Miss Havisham) — STRONG

- SRC p32: `Once, I had been taken to one of our old marsh churches to see a skeleton in the ashes of
  a rich dress that had been dug out of a vault under the church pavement. Now, waxwork and skeleton
  seemed to have dark eyes that moved and looked at me.`
- MOD p32: near-identical, `pavement` → `floor`.

199 → 195 words, nothing lost. Miss Havisham's `So new to him, … so old to me; so strange to him,
so familiar to me; so melancholy to both of us!` is preserved in full, including the triple
parallel.

### 4. Chapter 26, para 0 (297 → 65 words, ratio 0.22) — **SEVERE OMISSION + INVENTION**

The Jaggers dinner chapter. This is the worst single paragraph in the book.

- SRC (deleted): `I embrace this opportunity of remarking that he washed his clients off, as if he
  were a surgeon or a dentist. He had a closet in his room, fitted up for the purpose, which smelt
  of the scented soap like a perfumer's shop. It had an unusually large jack-towel on a roller inside
  the door… we found him with his head butted into this closet, not only washing his hands, but
  laving his face and gargling his throat. And even when he had done all that, and had gone all round
  the jack-towel, he took out his penknife and scraped the case out of his nails before he put his
  coat on.`
- MOD (in full, for the last third): `"No ceremony," he said. "No dinner dress. No nonsense."`

The single most-quoted characterisation of Jaggers in the novel — washing his clients off like a
surgeon, the jack-towel, the penknife under the fingernails — is gone. `"No nonsense."` is invented
(the source has `and say to-morrow`, which also sets the appointment and is likewise dropped).

### 5. Chapter 26, para 1 (89 → 88 words) — **WHOLE PARAGRAPH REPLACED WITH INVENTED CONTENT**

Note that the *length* is unchanged, so no mechanical flag fires here at all.

- SRC: `As we walked along westward, he was recognised ever and again by some face in the crowd of
  the streets, and whenever that happened he talked louder to me; but he never otherwise recognised
  anybody, or took notice that anybody recognised him.`
- MOD: `As we walked westward, he was recognized and greeted by two people, and started on the
  subjects of capital punishment and flogging. When I challenged his opinions, he defended them
  thoroughly, then unexpectedly pulled off what felt like a trick, making me argue against my own
  earlier points.`

None of the capital-punishment/flogging exchange is in this paragraph, or in this chapter. The
source's actual point — Jaggers talks *louder* when recognised and never acknowledges anyone — is
deleted.

### 6. Chapter 26, paras 26, 27, 41 — **MISPLACED LINE, DUPLICATED PARAGRAPH, DELETED SCENE**

- **p26.** SRC: `"At half-past nine, gentlemen," said he, "we must break up. Pray make the best use
  of your time. I am glad to see you all. **Mr. Drummle, I drink to you.**"` → MOD: `"At half past
  nine, gentlemen," he said, deliberately setting down his glass and hauling out his gold pocket
  watch by its massive chain, "I am extremely sorry to announce that it's half past nine."` The
  toast to Drummle — which is what provokes the whole scene — is replaced by material that belongs
  to p42 (the later break-up), and the modern line is a non-sequitur.
- **p27.** SRC is Jaggers's fascination with Drummle (`He actually seemed to serve as a zest to Mr.
  Jaggers's wine.`). MOD is a **verbatim duplicate of its own p43**, which itself contains invented
  content (`went home through Temple`, `Herbert told me about his Blackfriars adventure`,
  `as everything in life kept coming back`) and drops Dickens's closing image of Drummle `lagging
  behind in the shadow of the houses, much as he was wont to follow in his boat`.
- **p41 (132 → 81 w).** The climax of the dinner — Drummle `took up a large glass, and would have
  flung it at his adversary's head, but for our entertainer's dexterously seizing it at the instant
  when it was raised for that purpose` — is **deleted**. The modern text substitutes `But Drummle
  wouldn't hear of it. Startop protested mildly and Drummle scowled heavily at him.`

Chapter 26 has the lowest word overlap in the book (0.68). Taken together these four paragraphs mean
a modern-en reader loses Jaggers's defining image, the toast, and the thrown glass, and reads one
paragraph twice.

### 7. Chapter 39, paras 94 and 102 — **LOCAL OMISSION + ALTERED FACT**

The night Magwitch reveals himself.

- SRC p102: `I softly removed the key to the outside of his door, and turned it on him before I
  again sat down by the fire. Gradually I slipped from the chair and lay on the floor. When I awoke
  without having parted in my sleep with the perception of my wretchedness, the clocks of the
  Eastward churches were striking five, the candles were wasted out, the fire was dead, and the wind
  and rain intensified the thick black darkness.`
- MOD p102: `I softly removed the key of his room to my own pocket and turned the lock upon him,
  then sat down by my fire again and fell asleep before it.`

The key goes into Pip's pocket rather than being left in the outside of the door (a change of
physical fact), and the paragraph's whole second half — the floor, the five o'clock bells, the dead
fire, the wretchedness that survived sleep — is replaced by `and fell asleep before it`.

### 8. Chapters 53 and 59 (the limekiln; the ending) — STRONG

Ch 53 paras 80–83 and ch 59 paras 40–45 are complete and very close to the source (ch 59 p45 is
byte-identical: `…and in all the broad expanse of tranquil light they showed to me, I saw no shadow
of another parting from her.`). No defects found.

## Phase 1 flags: confirmed / disconfirmed

| flag | verdict |
|---|---|
| truncation ch 26 p0 (ratio 0.22) | **CONFIRMED — severe.** See sample 4. |
| truncation ch 39 p102 (ratio 0.58) | **CONFIRMED.** See sample 7. |
| mean similarity 0.7827 | **Confirmed** — and it correctly indicates a light-touch edition, not a rewrite. |
| 0.6 % identical long paragraphs | **Confirmed and benign** — 6 paragraphs ≥ 25 words, scattered (ch 19, 35, 43, 44 ×2, 59). No unmodernized chapter. |
| alignment / no count mismatch | **Confirmed clean.** |
| last chapter short | **Disconfirmed** — ch 59 is short by design and is complete. |
| **Not flagged mechanically but found:** ch 26 p1 invention (equal length), ch 26 p26 misplaced line, ch 26 p27 duplicate paragraph, Joe's dialect flattening | Ratio-based screening cannot see any of these. |

## Human-edition research (Phase 3)

English original; no translation-rights question.

- **Original, public domain.** 1861; Dickens died 1870. Public domain in the US and the EU/Denmark.
  Standard Ebooks publishes a proofed edition dedicated to the public domain under **CC0 1.0**
  (https://standardebooks.org/ebooks/charles-dickens/great-expectations); its imprint page states
  the source text and artwork are believed free of US copyright restrictions. Project Gutenberg
  #1400 / #8608 are the usual transcriptions.
- **Is the original already accessible enough?** Largely yes — and the current modern-en is itself
  evidence: at 0.78 mean similarity and a 0.98 length ratio it changes relatively little, which
  means the barrier it was built to remove was not large. What genuinely trips modern readers in
  *Great Expectations* is period-specific vocabulary (the hulks, assizes, "brought up by hand",
  Newgate, jack-towel, quadrille, four per cents) and Joe's dialect — both of which are better
  served by a gloss layer than by a rewrite that *erases* the dialect.
- **Human modern-English editions: none rights-clear found.** Only recent commercial learner/plain-
  English editions and abridged retellings, all in copyright. Recording as "none found in this
  search", not "none exists".

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40 % | **3** |
| first-read clarity | 25 % | **4** |
| literary voice | 20 % | **3** |
| restraint / no invention | 10 % | **3** |
| naturalness | 5 % | **4** |

**Weighted score 3.3 — band: Mixed.**

Fidelity would be 4–5 outside chapter 26; restraint would be 5 outside ch 26 and ch 39. Voice is
held at 3 by the Joe Gargery flattening, which is book-wide.

## Recommendation

**SOURCE + GLOSSES** — confidence **medium**, correction scope **substantial**.

Reasoning. The current modern-en is 98 % the length of the source with 0.78 word overlap: it is not
removing much of a barrier. Against that small benefit it carries (a) a chapter with deleted,
duplicated and invented content, (b) a local deletion plus an altered physical fact in ch 39, and
(c) a book-wide decision to normalise Joe's dialect, which costs the novel one of its two or three
most valuable voices. Keeping the edition means committing to fix all three, and the third is a
re-generation of every Joe speech in the novel.

A glossed 1861 original — with short in-place notes for the hulks, assizes, "brought up by hand",
the four per cents, quadrille, and Joe's dialect forms — gives a modern reader more than this
modern-en does, at lower maintenance risk.

**If Tinct chooses to keep the modern edition instead** (a defensible call — the clarity work in
chs 1–25 and 27–59 is good), then this becomes **LIGHT EDIT** with a hard requirement to:
1. Regenerate **chapter 26 in full** (p0, p1, p26, p27, p41 are all defective).
2. Regenerate **ch 39 p94 and p102**.
3. Inspect **ch 57 p80** (ratio 0.62, not opened).
4. Decide explicitly whether Joe's dialect is preserved or normalised, and apply that decision
   consistently — the present edition normalises it without that having been a stated policy.

## Limitations of this review

- 8 sampled locations out of 59 chapters; ~25 paragraph pairs read in full. Ratio, word-overlap and
  duplicate-paragraph statistics were computed across all 3,835 paragraph pairs, so I am confident
  there is **no second chapter-26-scale failure** hiding in the book — but equal-length inventions
  like ch 26 p1 are invisible to every mechanical check I ran, so I cannot rule out more of those.
- I did not inspect `modern-da`.
- I did not verify the transcription source of `original-en`, nor confirm from the file which of
  Dickens's two endings was authorially preferred — only that the revised ending is the one present.
- Rights research was search-level; I did not read publisher licence pages for the commercial
  plain-English editions.
