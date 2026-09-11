# moby-dick — Moby Dick (Herman Melville, 1851)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (English-originals batch)

## Edition snapshot (from Phase 1 `mechanical/moby-dick.json`)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en (Original (1851)) | `30974242d9ee3eae` | 136 | 2432 | 207,804 |
| modern-en (Modern English) | `2ab04dd727bbe580` | 136 | 2432 | 191,004 |
| modern-da (Moderne Dansk) | `208eb3954e5eb637` | 136 | 2432 | 188,468 |

`en_editions_aligned: true`, no chapter/paragraph count mismatches, mean weighted similarity
**0.702**, **2.9 % identical long paragraphs**, **78 truncation candidates** (the highest count in
the whole audit), 0 empty paragraphs, last chapter not flagged short.

## Provenance / completeness of the core English text

- `original-en` is Melville's own 1851 English. No translator; registry (`bookRegistry.ts`,
  `MOBY_DICK`) records `label: 'Original (1851)'`, `year: 1851`, no source attribution.
- 136 units = Chapters 1–135 + "Epilogue — The Drama's Done". Chapter titles 26 and 27 are both
  "Knights and Squires" — correct, matching Melville.
- **Completeness defect in the source text itself (pre-existing, not a modern-en fault):**
  Tinct's `original-en` begins at Chapter 1 "Loomings". Melville's front matter — **"Etymology"
  (Supplied by a Late Consumptive Usher to a Grammar School)** and **"Extracts" (Supplied by a
  Sub-Sub-Librarian)** — is absent from all three editions. Verified against Standard Ebooks'
  CC0 edition of the same Gutenberg transcription, whose contents run Etymology → Extracts →
  Chapter I → … → Epilogue (https://standardebooks.org/ebooks/herman-melville/moby-dick).
  Worth logging as a separate content ticket.

## Shape of the modern-en edition

Per-chapter word-overlap and length ratio (modern ÷ source) show the edition is **bimodal**, not
uniform:

- **23 chapters have a length ratio below 0.80** — 44, 51, 53, 55, 56, 60, 62, 65, 66, 67, 68,
  69, 72, 75, 76, 77, 79, 80, 112, 115, 118, 121, 123 — with the worst at 0.51 (ch 79 "The
  Prairie", ch 76 "The Battering-Ram"). ≈24,900 source words sit in these chapters.
- **7 chapters are effectively unmodernized** (word overlap > 0.95 with the source): 46, 82, 84,
  85, 110, **134, 135**.
- The rest (the narrative and dramatic chapters — 1, 9, 36, 40, 41, 42, 48, 133) are good to
  excellent.

The failure is concentrated in the cetological / philosophical / digressive chapters, i.e. exactly
the material that makes the book *Moby-Dick*.

## Samples inspected (9)

### 1. Opening — Chapter 1 "Loomings", paras 0–2 — STRONG

- SRC p0: `This is my substitute for pistol and ball. With a philosophical flourish Cato throws
  himself upon his sword; I quietly take to the ship.`
- MOD p0: `This is my substitute for a pistol and a bullet. Cato, with a philosophical flourish,
  throws himself on his sword; I quietly take to a ship.`

Faithful and well-judged. Two small slips: `Indian isles` → `Pacific isles` (p1) is a change of
fact, not of wording; `almost all men in their degree` → `Almost every person` drops the
qualification "in their degree".

### 2. Chapter 9 "The Sermon", paras 24–26 — STRONG

Father Mapple's Biblical cadence and the full "Woe to him… / Delight is to him…" antithesis survive
intact, including `top-gallant delight` and `this sure Keel of the Ages`.

Two minor voice slips: `Woe to him who seeks to please rather than to appal!` → `…rather than to
shake!` (loses "appal", the book's own keyword, cf. ch 42 "the whiteness of the whale that above
all things appalled me"); and `gives no quarter in the truth` → `gives no quarter to the truth`,
which inverts the sense.

### 3. Chapter 40 "Midnight, Forecastle", paras 0–6 — STRONG

The theatrical/stage-direction chapter is handled correctly: speaker tags (`1ST NANTUCKET SAILOR.`,
`MATE'S VOICE FROM THE QUARTER-DECK.`), parenthetical directions and the sea-shanty are all kept.

### 4. Chapter 42 "The Whiteness of the Whale", paras 0–1 and 30 — STRONG

The book's hardest sustained argument is rendered essentially complete (287 source words → 287
modern words) with every image kept — the milky way, the colorless all-colour of atheism, the
harlot/charnel-house, the Lapland travellers, the leper universe. This is what the rest of the
book should look like. One small loss: `the butterfly cheeks of young girls` → `the rosy cheeks of
young girls` flattens Melville's deliberate echo of the preceding "gilded velvets of butterflies".

### 5. Chapter 44 "The Chart", para 8 (418 → 148 words, ratio 0.35) — **SEVERE OMISSION + INVENTION**

- SRC (extract): `…That particular set time and place were conjoined in the one technical
  phrase—the Season-on-the-Line. For there and then, for several consecutive years, Moby Dick had
  been periodically descried, lingering in those waters for awhile, as the sun, in its annual
  round, loiters for a predicted interval in any one sign of the Zodiac. There it was, too, that
  most of the deadly encounters with the white whale had taken place; there the waves were storied
  with his deeds; there also was that tragic spot where the monomaniac old man had found the awful
  motive to his vengeance.`
- MOD (extract): `In general, however, this is not the rule. So, Ahab could not hope, by tracking
  one known whale herd in any particular season, to find Moby Dick — as some lonely hunter would
  search the woods for some solitary elk. The key was this: by matching the time of year to the
  places where sperm whales had most often been encountered, Ahab could put himself in the best
  possible position, narrowing the odds against him enormously.`

The **Season-on-the-Line** — the named, technical premise of Ahab's entire plan and the pivot of
the chapter — is deleted, along with the Seychelle/Volcano Bay examples, the "ocean-inns" image,
the Zodiac simile, and the fact that this is where Ahab lost his leg. In its place the modern text
**invents** an elk-hunting simile and an explanatory summary sentence that is not in Melville.

### 6. Chapter 44 "The Chart", para 11 (428 → 254 words) — **SEVERE OMISSION + INVENTION**

- SRC (ending): `God help thee, old man, thy thoughts have created a creature in thee; and he whose
  intense thinking thus makes him a Prometheus; a vulture feeds upon that heart for ever; that
  vulture the very creature he creates.`
- MOD (ending): `And while his own living body lay a prisoner in its own extremity, Ahab's eternal,
  living principle walked among the unsleeping crew. Ahab was a sleepwalker in his own body.`

One of the most-quoted sentences in the novel (the Prometheus/vulture image) is gone. So is
Melville's whole mind/soul argument ("the unbidden and unfathered birth", "a vacated thing, a
formless somnambulistic being"). The replacement text — `that thinking agent that called itself
"I" was unhoused`, `seeking the open air of the ship's deck`, `Ahab was a sleepwalker in his own
body` — is not a compression of Melville; it is different prose saying something else.

### 7. Chapter 76 "The Battering-Ram", paras 0–3 (chapter ratio 0.51) — **REVERSED CLAIM + OMISSION + INVENTION**

- SRC p1: `…you must now have perceived that the front of the Sperm Whale's head is a dead, blind
  wall, without a single organ or tender prominence of any sort whatsoever. Furthermore, you are
  now to consider that only in the extreme, lower, backward sloping part of the front of the head,
  is there the slightest vestige of bone… So that this whole enormous boneless mass is as one wad.`
- MOD p1: `You observe also that the front of his head is almost all solid bone, covered only by a
  thin layer of skin and muscle.`

This **reverses Melville's central factual claim** and with it the argument of the chapter — the
battering-ram works precisely *because* the mass is boneless, elastic and wad-like. The modern text
also imports the phrase `pleated with riddles` into this chapter (Melville uses it in ch 79, where
the modern edition has deleted it), and invents a `fireplace beneath a massive mantelpiece` simile.
Para 2 deletes Melville's swim-bladder hypothesis entirely; para 3 deletes the Isthmus of Darien,
"a provincial and sentimentalist in Truth", the salamander giants and the veil at Lais, replacing
them with `I am speaking of a directed, calculating intelligence backed by the most tremendous
physical power in the animal kingdom.`

### 8. Chapter 79 "The Prairie", paras 0–4 (chapter ratio 0.51) — **SEVERE OMISSION + INVENTION**

- SRC p3 (extract): `Few are the foreheads which like Shakespeare's or Melancthon's rise so high,
  and descend so low, that the eyes themselves seem clear, eternal, tideless mountain lakes… nothing
  but that one broad firmament of a forehead, pleated with riddles; dumbly lowering with the doom of
  boats, and ships, and men.`
- MOD p3 (extract): `But in most creatures, and in man himself, very often the brow is merely a
  strip of forehead between the hair and the eyebrows. In the Sperm Whale, this high and mighty
  forehead is almost the entire face. It forms an enormous blank. Not a single line or wrinkle of
  worry is found there.`

Shakespeare/Melancthon, the mountain-lake eyes, the antlered thoughts and Highland hunters, the
"broad firmament of a forehead, pleated with riddles", and Lavater's mark of genius are all cut;
"Not a single line or wrinkle of worry is found there" is invented and contradicts the source
("pleated with riddles"). Para 1 deletes the landscape-gardening simile and Phidias's Jove and
substitutes `But if you see the whale from the side, there is much to learn from his profile.`
Para 4 deletes the tongueless crocodile of the Nile and the May-day gods on Jove's high seat.

### 9. Chapter 118 "The Quadrant", paras 0–3 (chapter ratio 0.61) — **PLOT ALTERED + FAMOUS SPEECH DELETED**

- SRC p0 (ending): `In good time the order came. It was hard upon high noon; and Ahab, seated in
  the bows of his high-hoisted boat, was about taking his wonted daily observation of the sun to
  determine his latitude.`
- MOD p0 (ending): `…imagining that the long-wished-for command to point her prow for the equator
  would soon be given.`

The order *arrives* in Melville; in the modern text it does not. Then Ahab's apostrophe to the sun
(`Thou sea-mark! thou high and mighty Pilot! … Where is Moby Dick? This instant thou must be eyeing
him.`) is deleted outright and replaced with an invented action (`One morning, Ahab raised his ivory
leg, steadied his body with his free knee against the boat's side…`). In para 2, `Science! Curse
thee, thou vain toy` and the "level by nature to this earth's horizon" argument and the naming of
`the level ship's compass, and the level dead-reckoning, by log and by line` — which set up chapters
124 ("The Needle") and 125 ("The Log and Line") — are cut and replaced with the invented line
`This world steers its own course and I am steering mine!`

### 10. Chapters 134–135 "The Chase — Second/Third Day" — **NOT MODERNIZED, AND TEXT-CORRUPTED**

Word overlap with the source is 0.978 and 0.974; length ratio 1.00 for both. Whole paragraphs are
byte-identical to the source (43 identical paragraphs ≥ 25 words exist in this edition, 30 of them
in chs 134–135 alone). What editing did happen was a **blind find-and-replace**, which has left 17
visible corruptions in the shipped text:

- ch 135 p59: `"The ship? Great God, whbefore is the ship?"` (from `where` → `wh`+`before`)
- ch 134 p7: `"Thbefore she blows—she blows!"` · ch 134 p14: `"Thbefore she breaches!"`
- ch 134 p38: `the Parsee was nowhbefore to be found`
- ch 135 p2: `Wbefore I the wind, I'd blow no more…` / `I'd crawl somewhbefore to a cave`
- ch 135 p10: `keep a good eyou upon the whale` (from `ye` → `you`, hitting `eye`)
- ch 135 p53: `I only wish that we wbefore whbefore they grow`

Full list: `Hbefore`(1), `thbefore`/`Thbefore`(6), `nowhbefore`(1), `hbefore`(2), `somewhbefore`(1),
`whbefore`/`Whbefore`(4), `eyou`(2) — 17 occurrences, all in chapters 134–135. A scan of every
`*-modern-en.json` in the library found this corruption class in **no other book** in this batch.

## Phase 1 flags: confirmed / disconfirmed

| flag | verdict |
|---|---|
| 78 truncation candidates | **CONFIRMED, and understated.** My own scan (src ≥ 40 w, ratio < 0.62) finds 82; the mechanical sample was capped at 25 entries and only showed chs 44–64, hiding a second cluster at chs 111–125. Spot-checks of chs 44, 76, 79, 118 all show real content loss, not legitimate compression. |
| mean similarity 0.702 | **Confirmed but misleading** — it is an average over a bimodal distribution (7 chapters ≈ unmodernized, 23 chapters gutted). |
| 2.9 % identical long paragraphs | **CONFIRMED.** 43 paragraphs ≥ 25 words are byte-identical; 30 of them are in chs 134–135. |
| chapter/paragraph alignment | **Confirmed clean.** No mismatches. |
| last chapter short | **Disconfirmed** — the Epilogue is short because Melville's Epilogue is short (266 words). |

## Human-edition research (Phase 3)

*Moby-Dick* is an English original; there is no translation-rights question. The questions are
(a) is the original accessible enough to stand alone, and (b) does a rights-clear human
modernization exist?

- **Original, public domain.** US public domain (published 1851). Standard Ebooks publishes a
  complete, well-proofed edition dedicated to the public domain under **CC0 1.0** —
  https://standardebooks.org/ebooks/herman-melville/moby-dick/text/uncopyright — with the explicit
  caveat that it "makes no representations regarding the copyright status of the source text …
  in any country other than the United States." For an 1851 US text by an author who died in 1891,
  life+70 has long expired in the EU/Denmark as well, so this is about as clean as rights get.
  Underlying transcription: Project Gutenberg #2701.
- **Human modern-English editions: none rights-clear.** WebSearch surfaced only recent commercial
  products — "Moby-Dick in Modern English (C1/C2 Level)" (Elizabeth Snow, 2025, Amazon ASIN
  B0G2JGTM1T), BookCaps' "Moby Dick In Plain and Simple English", the Usborne *Classics Retold*
  abridgement. All are **in copyright, permission required**, and the Usborne and BookCaps titles
  are additionally **abridged/adapted**, disqualifying them on completeness. I did not open these
  texts; I am recording them as *found but rights-blocked*, not as evaluated.
- **Conclusion:** "no rights-clear human modern-English *Moby-Dick* found in this search" — not
  "none exists", but none that Tinct could ship.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40 % | **2** |
| first-read clarity | 25 % | **3** |
| literary voice | 20 % | **2** |
| restraint / no invention | 10 % | **1** |
| naturalness | 5 % | **4** |

**Weighted score 2.3 — band: Poor.**

Clarity gets a 3 rather than a 4 because the two unmodernized chapters (134–135) carry garbled
words a reader will hit at the novel's climax, and because "clear" prose that states the opposite
of the source (ch 76) is not first-read clarity in the sense the standard means.

## Recommendation

**RETRANSLATE** — confidence **high**, correction scope **substantial**.

Not a light edit. Roughly 23 chapters (~25,000 source words, 12 % of the book) contain confirmed
substantive omissions, at least one reversed factual claim, and repeated invented sentences that
read as fluent Melville-ish prose but are not Melville. A further 7 chapters were never modernized
at all, two of them corrupted by find-and-replace. Both failure modes are systemic to how this
edition was produced, not local slips.

Because the digressive chapters are the ones that were destroyed, a reader who uses `modern-en`
for *Moby-Dick* is reading a book with its intellectual content quietly removed and smooth
substitute prose in its place — which is worse than a visibly rough translation, because nothing
signals the loss.

**Interim mitigation worth considering before any retranslation lands:** the 17 find-and-replace
corruptions in chs 134–135 are a two-minute fix and are visible to every reader who finishes the
book.

**Viable alternative to retranslation:** SOURCE + GLOSSES. Melville's nautical and cetological
vocabulary is a genuine reader barrier and a well-made modern edition would earn its keep — but a
glossed original is strictly better than the current modern-en, and could ship immediately.

## Limitations of this review

- 9 sampled locations out of 136 chapters. I read the full text of ~20 paragraphs and scanned
  length ratios and word-overlap statistics for all 2,432 paragraph pairs, so the *distribution* of
  damage is well-characterised, but I have **not** read most of the 23 damaged chapters line by
  line; the specific losses in chapters I did not open are inferred from ratio, not verified.
- I did not inspect `modern-da` at all.
- I did not verify which Gutenberg/other transcription `original-en` derives from, only that it
  omits Etymology and Extracts.
- Rights research for the commercial modern editions was search-level only; I did not read licence
  pages or contact publishers.
