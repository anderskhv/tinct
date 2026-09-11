# Defect ledger — jane-eyre · moby-dick · henry-iv-part-2

**Ledger date:** 2026-09-11 · **Scope:** release readiness, public catalogue
**Method:** every claim below was re-verified by direct read of the shipped JSON under
`app/public/data/editions/`, not carried over from the 2026-09-11 per-book audit notes.
Files unchanged since the audit (all edition JSON mtime `2026-09-05 09:04`). No files under
`app/` were modified by this review.

**Verification tooling:** paragraph pairs extracted by index from
`{book}-original-en.json` / `{book}-modern-en.json` (`chapters[i].paragraphs[j]`, 0-based
paragraph index, 1-based chapter index matching `chapters[i].number`). Ground truth for
Henry IV Part 2 taken from Project Gutenberg #100 (downloaded, line 46034ff) and Standard
Ebooks.

**Classification key**

- **INHERITED** — defect present in `original-en` as well, or an ingestion/parser artifact
  affecting all editions. Withholding `modern-en` does not fix it.
- **INTRODUCED** — defect exists only in `modern-en`; `original-en` is correct at that spot.
  Withholding or regenerating `modern-en` fixes it completely.

---

## 1. jane-eyre — Jane Eyre (Charlotte Brontë, 1847)

**Prior claim under review:** hallucinated content in the climactic final chapters.
**Verdict: CONFIRMED in full, on direct re-reading. Not a misreading.**

### Structural facts re-verified

| | original-en | modern-en |
|---|---|---|
| chapters | 38 | 38 |
| paragraphs | 4,047 | 4,047 |

Chapter 1 → "Chapter 38 — Conclusion". No missing or merged chapters, no alignment drift.
`original-en` is Brontë's own 1847 English and is complete; **no defect of any kind was found
in `original-en`.**

Re-run of the truncation scan (source ≥ 50 words, modern/source word ratio < 0.70) returns
**24 paragraphs**, distributed ch27 ×3, ch35 ×1, ch36 ×3, **ch37 ×14**, ch38 ×3 — i.e. 21 of
24 fall in the final four chapters. Byte-identical paragraphs ≥ 25 words: **8, of which 6 are
in chapter 34.** Both figures reproduce the audit exactly.

### Defect 1.1 — Chapter 36, paragraph 48: invented alternative plot (the Thornfield fire)

Source 351 words → modern 184 words (ratio 0.52). This is the innkeeper's narration, the
paragraph whose entire purpose is to deliver what became of Bertha, Rochester, Mrs. Fairfax
and Adèle.

> **[original-en ch36 p48]** "…However, on this night, she set fire first to the hangings of
> the room next her own, and then she got down to a lower storey, and made her way to the
> chamber that had been the governess's—(she was like as if she knew somehow how matters had
> gone on, and had a spite at her)—and she kindled the bed there; but there was nobody
> sleeping in it, fortunately. The governess had run away two months before; and for all Mr.
> Rochester sought her as if she had been the most precious thing he had in the world, he
> never could hear a word of her; and he grew savage… He sent Mrs. Fairfax, the housekeeper,
> away to her friends at a distance; but he did it handsomely, for he settled an annuity on
> her for life… Miss Adèle, a ward he had, was put to school. He broke off acquaintance with
> all the gentry, and shut himself up like a hermit at the Hall."

> **[modern-en ch36 p48]** "…But this time she went up to the third floor and set the
> governess's old room on fire—the room directly above. Then she went down to a lower floor
> and set fire to the hangings in the room where her husband was sleeping. But he had already
> woken—the whole floor was blazing. He got up and managed to save the servants. Then he went
> back for her."

**How it diverges — three distinct failures in one paragraph:**

1. **Order of events reversed.** Brontë: governess's room *second*, after the adjoining
   hangings. Modern: governess's room *first*, hangings second.
2. **Invented plot content — a factual reversal about a main character's whereabouts.**
   Modern-en places Rochester asleep in the burning room and has him wake in it. In Brontë he
   is not in that room and is not asleep; the burning bed is the governess's and "there was
   nobody sleeping in it, fortunately." The modern text asserts the opposite of the source on
   a point of plot.
3. **Every piece of information the paragraph exists to carry is deleted** — Rochester's
   search for Jane, that he "grew savage," Mrs. Fairfax's annuity, Adèle sent to school, the
   hermit at the Hall. A reader of modern-en never receives any of it, and nothing in the
   text signals the loss.

**Classification: INTRODUCED.** `original-en` ch36 p48 is complete and correct.

### Defect 1.2 — Chapter 27, paragraph 160: invented image replacing ~300 words

Source 402 words → modern 110 words (ratio 0.27), the worst ratio in the book. Jane's flight
from Thornfield.

> **[original-en ch27 p160, extract]** "…and I thought of drear flight and homeless
> wandering—and oh! with agony I thought of what I left. … I longed to be his; I panted to
> return … It was a barbed arrow-head in my breast; it tore me when I tried to extract it …
> I had injured—wounded—left my master. I was hateful in my own eyes. … I fell: I lay on the
> ground some minutes, pressing my face to the wet turf. I had some fear—or hope—that here I
> should die…"

> **[modern-en ch27 p160, the complete text after the scaffold simile]** "I thought of a
> drain deep and dark through which a torrent of blood was pouring, from which no dam could
> stop the flow."

Roughly 300 words — the temptation to return, the barbed arrow, the self-hatred, the collapse
on the turf, the fear-or-hope of dying — are deleted and replaced by one sentence that is not
a compression of anything in the source. **Full-text search of `jane-eyre-original-en.json`
confirms the strings `drain deep and dark`, `torrent of blood` and `no dam could stop` occur
nowhere in the novel.** This is invention, verified, not paraphrase.

**Classification: INTRODUCED.**

### Defect 1.3 — Chapter 37 (Ferndean): 14 under-length paragraphs, incl. an emotional reversal

- **p63 (130 → 44 w, ratio 0.34) — emotion reversed.** Source: Jane fears *she* has been
  improper ("Perhaps I had too rashly over-leaped conventionalities") and begins to withdraw,
  "but he eagerly snatched me closer." Modern: "I felt a kind of panic stir in me. I began to
  wonder if he was going to refuse me." Different emotion, different cause, and the physical
  beat that resolves it is cut.
- **p91 (123 → 48 w, ratio 0.39) — Rochester's decisive line deleted and replaced.** Source:
  "Yes: for her restoration I longed, far more than for that of my lost sight." Modern ends
  instead on the invented "I stretch my hand and touch what I dreamed would never be real
  again."
- **p92 (59 → 22 w, ratio 0.37).** The scorched-eyebrows beat — "I passed my finger over his
  eyebrows, and remarked that they were scorched" — deleted outright.

**Classification: INTRODUCED.**

### Defect 1.4 — Chapter 38 "Conclusion", paragraph 13: the ending's resolving passage deleted

Source 196 → modern 102 words. Modern-en stops at "…what light could no longer stamp upon his
eyes." Deleted: "Never did I weary of reading to him … because he claimed these services
without painful shame or damping humiliation. He loved me so truly, that he knew no
reluctance in profiting by my attendance…" — the passage that resolves the marriage.

**Classification: INTRODUCED.**

### Defect 1.5 — Chapter 34: not modernized (mislabelled, no content lost)

ch34 p86 is **byte-identical** between editions, British spelling and all:

> "…he removed his hat, let the breeze stir his hair and kiss his brow. He seemed in communion
> with the genius of the haunt: with his eye he bade farewell to something."

6 of the book's 8 identical long paragraphs are in this chapter. A reader who selects "Modern
English" here receives 1847 prose under a modern label. No information is lost; this is a
labelling defect, not a content defect.

**Classification: INTRODUCED (label/quality, non-destructive).**

### Can `original-en` remain available?

**Yes, unreservedly.** Every defect found is INTRODUCED. `original-en` is complete (38/38
chapters, 4,047 paragraphs), correct at every location inspected, and public domain (Brontë
d. 1855). It requires no action.

### Recommendation — **PATCH CONTENT**

Regenerate `modern-en` chapters **27, 34, 35, 36, 37, 38** against `original-en`; leave
chapters 1–26 and 28–33 untouched (they were verified as strong at three sampled locations,
carry only 3 of 24 truncation flags between them, and re-generating them would put good work
at risk). Spot-check chapters 10 and 11 (next-lowest length ratios) during the patch.

**Justification:** the damage is severe but *bounded and fully enumerated* — 6 chapters, 24
identified paragraphs, with exact indices available. Replacement of the whole edition is not
warranted when 32 of 38 chapters meet the standard. This is CLI regeneration within an
established pattern.

**Release gate (not a second recommendation, a condition on this one):** the patch must land
before `modern-en` is exposed to readers in this release. Defect 1.1 is not a quality
shortfall — it tells the reader something factually contrary to the novel with no signal that
anything is wrong, and every reader who finishes the book passes through it. If the release
ships before the patch, escalate this row to *temporarily withhold modern edition*;
`original-en` stays live either way.

**Out of scope but flagged:** `modern-da` was not inspected and was produced by the same pass;
assume the same final-act damage until checked.

---

## 2. moby-dick — Moby Dick (Herman Melville, 1851)

**Prior claims under review:** a reversed factual claim and corrupted text at the climax; 78
truncation flags, the highest in the inventory.
**Verdict: ALL CONFIRMED on direct re-reading. The corruption count is worse than reported.**

### Structural facts re-verified

| | original-en | modern-en |
|---|---|---|
| chapters | 136 | 136 |
| paragraphs | 2,432 | 2,432 |

136 units = Chapters 1–135 + "Epilogue — The Drama's Done". Alignment clean.

Re-run truncation scan (source ≥ 40 w, ratio < 0.62): **82 paragraphs across 34 chapters** —
confirming and slightly exceeding the reported 78, and confirming the second cluster the
Phase 1 sample had hidden (chs 111–125, 21 flags). Byte-identical paragraphs ≥ 25 words:
**43, of which 27 are in chapters 134–135.** Chapter length ratios re-measured: ch76 **0.51**,
ch79 **0.51**, ch118 **0.61**, ch134 **1.00**, ch135 **1.00**.

### Defect 2.1 — Chapter 76 "The Battering-Ram", paragraph 1: **the factual claim is reversed**

Source 352 words → modern 174 words (ratio 0.49). This is the chapter's load-bearing anatomical
premise.

> **[original-en ch76 p1]** "…you must now have perceived that the front of the Sperm Whale's
> head is a dead, blind wall, without a single organ or tender prominence of any sort
> whatsoever. Furthermore, you are now to consider that only in the extreme, lower, backward
> sloping part of the front of the head, is there the slightest vestige of bone; and not till
> you get near twenty feet from the forehead do you come to the full cranial development.
> **So that this whole enormous boneless mass is as one wad.**"

> **[modern-en ch76 p1]** "You observe also that **the front of his head is almost all solid
> bone**, covered only by a thin layer of skin and muscle. Now, mark this: below the outer
> layer of the skull lies a solid mass of the most wonderfully dense material."

**This is a fact turned into its exact opposite.** Melville: boneless, "as one wad." Modern:
"almost all solid bone." It is not garbled syntax and not compression — it is a clean,
fluent, confidently-written sentence asserting the contrary of the source, and it destroys the
argument of the chapter, which is that the battering-ram works *because* the mass is boneless
and elastic. Paragraph 2 then deletes Melville's swim-bladder hypothesis entirely (242 → 110
words).

Two further verified inventions in the same chapter: the mouth compared to "a fireplace
beneath a massive mantelpiece" (not in Melville), and the phrase **"pleated with riddles"**
imported into ch76. Cross-edition search confirms this phrase occurs in `original-en` at
**ch79 p3 only**, and in `modern-en` at **ch76 p1 only** — the modernization moved Melville's
image to a chapter he did not put it in, and deleted it from the chapter he did.

**Classification: INTRODUCED.**

### Defect 2.2 — Chapters 134–135 "The Chase": unmodernized *and* text-corrupted at the climax

Chapters 134 and 135 have length ratio 1.00 and contain 27 byte-identical paragraphs — they
were never modernized. What editing did occur was a **blind find-and-replace of the archaic
`ere` → `before` (and `ye` → `you`) applied inside words**, leaving corrupted tokens in the
shipped text at the novel's climax.

Re-scan finds **44 corrupted tokens, all in chapters 134–135** — substantially more than the
17 previously reported, because the prior count appears to have omitted `wbefore` (from
"were"), which alone occurs 26 times.

| token | count | from |
|---|---|---|
| `wbefore` / `Wbefore` | 27 | were / Were |
| `thbefore` / `Thbefore` | 6 | there / There |
| `whbefore` / `Whbefore` | 4 | where / Where |
| `hbefore` / `Hbefore` | 3 | here / Here |
| `nowhbefore` | 1 | nowhere |
| `somewhbefore` | 1 | somewhere |
| `eyou` | 2 | eye (via `ye`→`you`) |
| **total** | **44** | |

Verbatim examples, with the source line alongside:

- **ch135 p59** — modern: `"The ship? Great God, whbefore is the ship?"` · source: `"The ship?
  Great God, where is the ship?"`
- **ch134 p7** — modern: `"Thbefore she blows—she blows!"` · source: `"There she blows—she
  blows!"`
- **ch134 p38** — modern: `the Parsee was nowhbefore to be found` · source: `the Parsee was
  nowhere to be found`
- **ch135 p2** — modern: `Wbefore I the wind, I'd blow no more on such a wicked, miserable
  world.` · source: `Were I the wind…`
- **ch135 p10** — modern: `keep a good eyou upon the whale` · source: `keep a good eye upon the
  whale`

Scans of `moby-dick-original-en.json` and `moby-dick-modern-da.json` return **0 such tokens**.
The corruption is confined to `modern-en` chapters 134–135.

**Classification: INTRODUCED.** These are the last two chapters of the novel; every reader who
finishes the book in `modern-en` hits them.

### Defect 2.3 — Chapter 118 "The Quadrant": plot altered, famous speech deleted

> **[original-en ch118 p0, ending]** "**In good time the order came.** It was hard upon high
> noon; and Ahab, seated in the bows of his high-hoisted boat, was about taking his wonted
> daily observation of the sun to determine his latitude."

> **[modern-en ch118 p0, ending]** "…**imagining that the long-wished-for command** to point
> her prow for the equator **would soon be given**."

The order arrives in Melville; in modern-en it does not. Paragraph 1 (294 → 102 w) then
deletes Ahab's apostrophe to the sun ("Thou sea-mark! thou high and mighty Pilot! … Where is
Moby Dick? This instant thou must be eyeing him.") outright and substitutes invented stage
business ("One morning, Ahab raised his ivory leg, steadied his body with his free knee
against the boat's side…").

**Classification: INTRODUCED.**

### Defect 2.4 — Etymology and Extracts absent from all editions

`original-en` begins at Chapter 1 "Loomings" (`chapters[0].title = "Chapter 1 — Loomings"`,
`paragraphs[0] = "Call me Ishmael…"`). Melville's front matter — **"Etymology" (Supplied by a
Late Consumptive Usher to a Grammar School)** and **"Extracts" (Supplied by a
Sub-Sub-Librarian)** — is absent. Full-text search of `original-en` for `Late Consumptive
Usher`, `Sub-Sub-Librarian` and `Supplied by a` returns **no matches**; no chapter title
contains "Etymology" or "Extracts". Standard Ebooks' CC0 edition of the same Gutenberg
transcription runs Etymology → Extracts → Chapter I.

**Classification: INHERITED** (ingestion). Present in all three editions. Withholding
`modern-en` does not address it; it is a separate completeness ticket.

### Can `original-en` remain available?

**Yes — and this is a genuinely separate question from `modern-en`, answered independently.**
Melville, 1851, author d. 1891: unambiguously public domain in the US and in the EU/Denmark.
The `original-en` text is Melville's own words, verified correct at every location inspected
(chs 44, 76, 79, 118, 134, 135), carries **zero** of the 44 corrupted tokens, is internally
complete Chapter 1 → Epilogue with clean alignment, and none of defects 2.1–2.3 touch it. The
only qualification is defect 2.4, missing front matter — a disclosed completeness gap of
inherited origin, not a correctness or misinformation risk. **`original-en` should stay fully
available regardless of what happens to `modern-en`**, and if `modern-en` is withheld it
becomes the default edition for this book.

### Recommendation — **TEMPORARILY WITHHOLD MODERN EDITION**

**Justification:** unlike jane-eyre, the damage here is not bounded. 82 truncation-flagged
paragraphs span 34 chapters (≈12 % of the book's source words); at least one central factual
claim is stated in reverse (2.1); the climactic two chapters are simultaneously unmodernized
and visibly corrupted in 44 places (2.2); and 7 chapters were never modernized at all. Both
failure modes are systemic to how the edition was produced, not local slips — the correction
scope is a full retranslation, not a patch, and a patch list cannot be closed with confidence
because 23 damaged chapters were never read line by line.

The decisive factor is that the failure is *silent*. The digressive and cetological chapters —
the material that makes the book *Moby-Dick* — were replaced by fluent, plausible,
Melville-flavoured prose that says something else. Nothing in the reading experience signals
the loss, which is worse for a reader than a visibly rough translation. Withhold `modern-en`,
serve `original-en` as the default, and consider a glossed original as the interim product
(Melville's nautical and cetological vocabulary is a real barrier and glossing is a smaller,
safer job than retranslation).

**Out of scope but flagged:** `modern-da` was not inspected; it shares the inherited front-matter
gap and was produced by the same pass.

---

## 3. henry-iv-part-2 — Henry IV, Part 2 (William Shakespeare)

**Prior claims under review:** the entire Induction is missing from all 3 editions
(ingestion-parser bug); 51.7 % near-verbatim source in modern-en.
**Verdict: the Induction claim is CONFIRMED exactly. The near-verbatim figure is CONFIRMED at
~50 % by my own independent measure (metric differs slightly; see below).**

### Structural facts re-verified

| | original-en | modern-en | modern-da |
|---|---|---|---|
| chapters | 19 | 19 | 19 |
| paragraphs | 1,081 | 1,081 | 1,081 |
| ch1 title | `Act 1, Scene 1 — The same` | `Act 1, Scene 1 — The same` | `Akt 1, Scene 1 — Samme sted` |

19 chapters = Acts 1–5 (18 scenes) + Act 5 Scene 5 containing the Epilogue. The Epilogue is
present and complete (ch19 paras 51–54).

### Defect 3.1 — The Induction is absent from all three editions

**Confirmed absent by direct read.** `henry-iv-part-2-original-en.json` chapter 1 opens:

> `paragraphs[0]`: "Enter Lord Bardolph."
> `paragraphs[1]`: "LORD BARDOLPH. Who keeps the gate here, ho?"
> `paragraphs[2]`: "The Porter opens the gate."

No chapter in any of the three editions is titled or numbered "Induction". Full-text search of
`original-en` for `Open your ears`, `vent of hearing`, `Induction` and `Warkworth` returns
**no matches**. The string `Rumour` occurs exactly once in the whole file — at ch8 p17, as a
common noun inside Warwick's line ("Rumour doth double, like the voice and echo") — never as a
speaker tag. The character Rumour never appears.

**Ground truth (verified this session).** Project Gutenberg #100 — the file this text was cut
from — contains the section in full at line 46034ff:

> ```
> INDUCTION
>
> Warkworth. Before the castle.
>
> Enter Rumour, painted full of tongues.
>
> RUMOUR.
> Open your ears; for which of you will stop
> The vent of hearing when loud Rumour speaks?
> …
> They bring smooth comforts false, worse than true wrongs.
>
>  [_Exit._]
> ```

PG#100's own table of contents for the play lists `INDUCTION` ahead of `ACT I`. Measured word
count of Rumour's speech: **288 words** (≈292 including the location line, stage direction and
speaker tag) — consistent with the ~310 previously estimated and with Standard Ebooks, which
publishes it as a distinct section.

**Cause confirmed as an ingestion-parser artifact, with the tell still visible in the shipped
data.** PG#100 heads the section `INDUCTION`, not `ACT … SCENE …`, so a heading-pattern parser
skipped it. The proof is chapter 1's title, `Act 1, Scene 1 — The same`: PG#100 reads `SCENE I.
The same.`, where "the same" refers back to the Induction's location line `Warkworth. Before the
castle.` With the Induction gone, "The same" points at nothing.

**Classification: INHERITED.** This is *not* a modernization defect — `original-en` is missing
it too, identically, and so is `modern-da`. Withholding `modern-en` would not restore a single
word of it. It is also, correspondingly, the cheapest defect in this ledger to fix: the source
containing the missing text is already Tinct's own upstream (PG#100), so restoration keeps the
rest of the file byte-consistent.

### Defect 3.2 — modern-en is ~50 % near-verbatim source

Independently re-measured: over the **271** paragraphs with ≥ 25 source words, after stripping
speaker tags, normalizing typography, lowercasing and dropping punctuation, **135 (49.8 %) are
≥ 0.85 similar to the source, representing 50.2 % of source words.** (My normalization is
word-sequence based; the audit's 51.7 %/51.1 % used a slightly different normalizer. The two
agree within metric noise — the finding stands.) Byte-identical paragraphs ≥ 25 words: 1,
because the source's curly apostrophes and elided forms (`toil'd`, `'Tis`) mean a pure
`thou`→`you` pass never produces byte identity — which is why the Phase 1 byte measure (2.0 %)
badly understated this.

Verified example of the half-applied pass within a single speech, ch19 p30:

> **[original-en]** "KING. I know **thee** not, old man. Fall to **thy** prayers. How ill
> white hairs **becomes** a fool and jester!"
> **[modern-en]** "HENRY V. I know **thee** not, old man. Fall to **your** prayers. How ill
> white hairs **becomes** a fool and jester!"

The famous clause keeps `thee`, the next clause converts to `your`, and the archaism "white
hairs becomes" stands. The result reads as an error rather than as either a preserved archaism
or a modernization.

**Classification: INTRODUCED** — but note carefully what kind of defect this is. It is a
**quality shortfall, not a correctness failure**: no omission and no invention were found
inside the ingested scenes, and `truncated_paragraphs_total: 0` re-verified. A reader of
`modern-en` receives all of Shakespeare's content; they simply receive too little help with it.
That is materially different from the jane-eyre and moby-dick modern editions, which tell the
reader things the author did not write.

### Can `original-en` remain available?

**Yes, with one disclosed gap.** Public domain, no rights question. Everything it contains is
correct. But it is **incomplete by ~290 words** — it is missing the Induction, which is a real
scene of the play, and its chapter 1 title dangles as a result. This is the one book of the
three where a defect genuinely does affect `original-en`, so "original-en is safe" here means
"safe to serve, and should be fixed", not "requires no action".

### Recommendation — **PATCH CONTENT**

Restore the Induction to **all three** editions from PG#100 (Tinct's own source; Standard
Ebooks' CC0 Clark & Wright text is the alternative), as a pre-Act-1 chapter, and fix the now-
dangling `Act 1, Scene 1 — The same` title to carry its own location. Translate the ~290 words
for `modern-en` and `modern-da` via the standard CLI pass.

**Justification:** the one confirmed correctness defect is a ~290-word omission with a known
cause, a known fix, and a rights-clear source already in hand — the smallest correction in this
ledger. The 50 % near-verbatim finding is a quality shortfall that does not misinform any
reader, so it does not justify withholding `modern-en`; it belongs in the retranslation queue
(with a brief to differentiate Falstaff's tavern prose from the court verse, gloss the Act 3
Scene 2 muster jokes, apply one consistent `thou`/`you` policy within sentences, and drop the
"By Mary" rendering of "Marry"), not in the release-blocking column.

**Operational warning for whoever executes the patch:** all three editions are registered
`hasAudio: true`. Inserting a new chapter at position 1 renumbers every subsequent chapter and
will break audio chapter indexing, cast/threads chapter keys, and every persisted reading
position for this book. Plan the insertion and the index migration together.

**Secondary, non-blocking:** the registry entry `HENRY_IV_PART_2` in
`app/src/data/bookRegistry.ts` labels `original-en` as `'Shakespeare (1600)'`, `year: 1600`
(the Quarto), and the book `year: 1598`. The file is a transcription of PG#100, a modernized
Complete Works text. I did not re-verify the transcription lineage myself; carried forward from
the audit note as unconfirmed-by-this-review.

---

## Summary table

| book | worst defect | inherited or introduced | recommendation | original-en available? |
|---|---|---|---|---|
| jane-eyre | ch36 p48 — invented plot, Rochester's fate reversed; ch27 p160 invention; 24 truncations in 6 chapters | **INTRODUCED** (all) | **patch content** — regenerate modern-en chs 27, 34, 35, 36, 37, 38, gated on landing before release | **Yes, unreservedly** — no defect found |
| moby-dick | ch76 p1 — "boneless" stated as "almost all solid bone"; 44 find-and-replace corruptions in chs 134–135; 82 truncations in 34 chapters | **INTRODUCED** (2.1–2.3) + **INHERITED** (2.4 Etymology/Extracts) | **temporarily withhold modern edition** — systemic, silent, retranslation-scale | **Yes** — separate question, answered yes; complete Ch 1→Epilogue, zero corruptions, only the inherited front-matter gap |
| henry-iv-part-2 | Induction (288-word Rumour prologue) absent from all 3 editions | **INHERITED** (3.1, parser) + **INTRODUCED** (3.2, quality only) | **patch content** — restore Induction to all 3 editions from PG#100, fix dangling ch1 title | **Yes, with a disclosed ~290-word gap** — serve it, and fix it |

## Limits of this reconciliation

- I verified the specific locations named in the prior notes plus whole-file structural and
  statistical re-scans of all 4,047 / 2,432 / 1,081 paragraph pairs. I did **not** read the
  unsampled chapters line by line; for moby-dick in particular, the losses in the ~30 damaged
  chapters I did not open are inferred from length ratio, not read.
- `modern-da` was not inspected for any of the three books, beyond confirming the Henry IV
  Induction is absent from it and that the moby-dick find-and-replace corruption is not in it.
- No files under `app/` were modified. Nothing was committed.
