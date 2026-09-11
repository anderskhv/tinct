# gilgamesh — The Epic of Gilgamesh (Anonymous)

Batch B1 · audit date 2026-09-11 · reviewer: batch agent B1

## Edition snapshot (from Phase 1 `mechanical/gilgamesh.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `1c9886e2b341187c` | 12 | 253 | 18,845 | **Prose Compilation** (translator: null, year: null) |
| modern-en | `419a43b05bfcbf84` | 12 | 253 | 16,439 | Modern English |
| modern-da | `70a40c3d7e96da38` | 12 | 253 | 15,167 | Moderne Dansk |

`en_editions_aligned: true`, no count mismatches, 0 empty paragraphs,
**1 truncated paragraph** (ch10 p1, ratio 0.59), mean weighted similarity
0.5456, 0 identical long paragraphs. Chapters are the 12 tablets, correctly
titled (Tablet I "He Who Saw the Deep" … Tablet XII "Enkidu and the
Netherworld").

## Core English text — provenance investigation

The orchestrator flagged "Prose Compilation" as unusual. It is worse than
unusual: **the provenance of Tinct's `original-en` cannot be established, and
what it most resembles carries an asserted third-party copyright.**

What I found:

1. Two distinctive strings from Tinct's `original-en` match, **verbatim**, the
   compilation published at `argonauts-book.com` ("English Translation of
   Gilgamesh", Jason Colavito):
   - *"Ay, thou wise one among the gods, thou warrior, how rash of thee to
     bring about a flood-storm!"* (Tablet XI)
   - *"Ere this Utnapishtim was only human; But now Utnapishtim and his wife
     shall be lofty like unto the gods"* (Tablet XI)
2. That page states its sources as **William Muss-Arnolt (1901)** for the
   Neo-Assyrian tablets plus **Morris Jastrow Jr. and Albert T. Clay (1920)**
   for Old Babylonian material. Both underlying translations are public domain.
3. **But that page's own footer reads: "© 2014 Jason Colavito. All rights
   reserved."** — a copyright asserted over the compilation and editorial
   arrangement, not over the PD translations themselves.
4. **And Tinct's text is not that text.** Three checks disagree:
   - Colavito's Tablet I opens *"He who has seen the history of Gilgamesh, [He
     who] knows all [that has happened to him]"*. Tinct's opens *"I will tell of
     the history of Gilgamesh, he who knows all that has happened…"* — brackets
     removed, lacunae silently filled, voice changed from third to first person.
   - Colavito's Tablet X reads *"Its gate she closes and closes * * *"* (damage
     marked). Tinct's reads *"Its gate she closed and went up to her roof."* —
     the gap filled.
   - Colavito's Tablet IX uses *"One **mile** he marches, thick is the
     darkness"*. Tinct's uses *"One **double-hour** he marches; thick is the
     darkness"* — a different underlying rendering.
   - Colavito's Tablet VIII contains **no** list of offerings to Ishtar,
     Namra-sit, Ereshkigal, Dumuzi, Namtar, Hushbisha, Quassu-tabat,
     Ninshuluhha, Bibbu and Dumuzi-abzu. Tinct's Tablet VIII does.

**Conclusion on provenance: unresolved.** Tinct's `original-en` is an
unattributed composite that (a) shares verbatim wording with a compilation
asserting copyright, (b) draws on at least one further source that compilation
does not contain, and (c) has had scholarly lacuna markers removed and gaps
filled by an unidentified hand. The registry records `translator: null,
year: null`, which is accurate but means Tinct cannot currently say who
translated the text it is selling, or under what right.

This is a **rights and integrity problem in the source edition**, and it sits
upstream of every judgement about the modern-en.

Separately: there is no single canonical ancient *Gilgamesh*. Any English
"complete" epic is a modern editor's reconstruction from Standard Babylonian,
Old Babylonian, Hittite and Hurrian material. That is normal and unavoidable —
but it makes naming the reconstruction's editor mandatory, not optional.

## Phase 1 flags — confirmed / disconfirmed

- **Truncated paragraph ch10 p1 (39→23 words, ratio 0.59) — CONFIRMED, and it
  is a true positive of a systematic kind.** See sample 4. It is not an isolated
  slip; it is one instance of the edition's most consistent behaviour.
- **Mean similarity 0.5456 — CONFIRMED.** Unlike the Iliad and Ulysses, this is
  a genuinely rewritten edition. Per-chapter values run 0.496–0.646 with no
  unmodernized patches: Tablet XI is the most-rewritten (0.496), Tablet V the
  least (0.646). Real, even editorial work.
- **0 empty paragraphs, no count mismatches — CONFIRMED.**
- **0 identical long paragraphs — CONFIRMED.**
- **last_chapter_suspiciously_short: false — CONFIRMED** (Tablet XII, 1,153
  words; short, but Tablet XII is genuinely a short appendix tablet).
- **Extra finding the Phase 1 threshold missed:** my own sweep at a 72%
  threshold (vs Phase 1's 60%) found **9** compressed paragraphs, not 1:
  ch2 p27 (0.70), ch7 p1 (0.67), ch8 p7 (0.69), ch9 p12 (0.60), ch10 p1 (0.59),
  ch10 p17 (0.69), ch11 p14 (0.72), ch11 p17 (0.64). Every chapter shows a
  word ratio of 0.81–0.91. **The 60% truncation threshold is too loose to catch
  formulaic-repetition collapse**, which compresses by 30–40%, not 45%.

## Samples inspected (7)

### 1. Tablet I, paras 0–4 (prologue, the walls of Uruk)

> **SRC** "He **bringeth** news dating farther back than the deluge. He has
> travelled far-distant roads and became weary, and now he has engraved on
> standing stones the whole of the story."
>
> **MOD** "He brought back knowledge from before the Great Flood. He traveled
> roads so distant they left him exhausted. And when he returned, he carved the
> whole story into standing stones **for all to read**."

Modernization proper: *bringeth*, *goest thou*, *yea*, *unto* all removed
across the tablet. Clear and readable — this edition genuinely does the job the
Iliad's and Aeneid's do not.

**Finding (invention, minor):** "for all to read" is not in the source.
**Finding (invention, minor):** para 2, "the wall of the sacred Eanna temple,
the holy sanctuary" → "the wall of the sacred Eanna temple, **Ishtar's** holy
sanctuary". Ishtar is named later in the same paragraph, so the inference is
sound, but it is still an addition at that point.

**Finding (voice):** the rewrite chops persistently into short declaratives —
"Two-thirds god they made him. One-third man." / "He cut open passes through
the mountains. He dug wells on mountain slopes. He crossed the great ocean…" —
where the source runs one connected period. The reading standard explicitly
warns against "mechanically short sentences". This is a recurring habit, not a
one-off.

### 2. Tablet VIII, para 7 (the funeral of Enkidu) — the clearest fidelity failure

> **SRC** "Sacrifices he made unto Ishtar and Namra-sit and displayed them to
> Shamash, **praying that the gods would welcome Enkidu and walk beside him.**
> Offerings he made to Ereshkigal and to Dumuzi and displayed them to Shamash,
> **praying that the gods would welcome Enkidu and walk beside him.** Offerings
> he made to Namtar and Hushbisha and displayed them to Shamash, **praying that
> the gods would welcome Enkidu and walk beside him.** Offerings he made to
> Quassu-tabat and Ninshuluhha and displayed them to Shamash, **praying that the
> gods would welcome Enkidu and walk beside him.** Offerings he made to Bibbu
> and Dumuzi-abzu and displayed them to Shamash, **praying that the gods would
> welcome Enkidu and walk beside him.**"
>
> **MOD** "Gilgamesh made offerings to Ishtar and Namra-sit, displayed them to
> Shamash, and prayed the gods would welcome Enkidu. He made offerings to
> Ereshkigal and Dumuzi. He made offerings to Namtar and Hushbisha. He made
> offerings to Quassu-tabat and Ninshuluhha. He made offerings to Bibbu and
> Dumuzi-abzu. **All were displayed to Shamash, with prayers that the gods would
> welcome Enkidu and walk beside him.**"

176 → 122 words. The five-fold liturgical refrain is collapsed into four bare
clauses plus one summarizing sentence. **The repetition is the ritual.** This
is the audit standard's "meaningful repetition must survive" clause failing
exactly as written — and the compression is of a kind fluent prose conceals,
because the modern paragraph reads perfectly well.

### 3. Tablet IX, para 12 (the twelve double-hours of darkness)

> **SRC** "One double-hour he marches; thick is the darkness, not does it grow
> light. Two double-hours he marches; thick is the darkness, not does it grow
> light. Three double-hours he marches… [repeated verbatim for **seven**
> double-hours] … At eight double-hours he begins to quicken his pace… At nine
> double-hours the wind begins to blow in his face… Ten double-hours he
> marches… At eleven double-hours, but one double-hour's travel remained.
> **Two** double-hours he marches; Gilgamesh emerges ahead of the Sun."
>
> **MOD** "One double-hour he walked — thick was the darkness, and no light came.
> Two double-hours — thick was the darkness. Three double-hours — thick was the
> darkness. **Four, five, six, seven double-hours** — thick was the darkness,
> and no light came. At eight double-hours he quickened his pace… Then at
> **twelve** double-hours, Gilgamesh emerged ahead of the sun."

177 → 107 words. Four of the twelve repetitions are elided into a list. The
passage's whole effect is the reader enduring the repetition alongside
Gilgamesh; summarizing it is like summarizing a drum.

**Finding (silent emendation):** the source's final "**Two** double-hours he
marches" (almost certainly a corruption of *twelfth*) is silently corrected to
"**twelve**". The correction is probably right — but it is an editorial
intervention on the source text made without a note, in an edition whose source
text already has unmarked provenance.

### 4. Tablet X, para 1 (the Phase 1 flagged truncation) — CONFIRMED

> **SRC** "But Gilgamesh listened…. **Lifts up his chin and turned toward her.**
> Then Gilgamesh spoke unto Sirudi and said: 'Sirudi, why doest thou bolt the
> gate against me? **Thou bolted the gate against me, but I will break thy
> gate.**'"
>
> **MOD** "Gilgamesh listened, then looked up at her. He said: 'Siduri, why do
> you bolt the gate against me? **I will break it down.**'"

39 → 23 words. The Akkadian call-and-response repetition ("Thou bolted the gate
against me, but I will break thy gate") is compressed to a single clause, and
the ellipsis marking damage in the source is dropped. Confirms the Phase 1 flag
as a real finding of the same class as samples 2 and 3.

**Name normalization — accepted, not a strike:** the source uses *Siduri* and
*Sirudi* interchangeably in adjacent sentences; modern-en normalizes to
*Siduri* throughout. That is the standard's "consistent character names where
alternate names have no literary function" rule working correctly.

### 5. Tablet XI, para 20 (Ea rebukes Enlil after the Flood)

> **SRC** "Instead of sending a flood-storm, let lions come and diminish
> mankind; instead of sending a flood-storm, let tigers come and diminish
> mankind; instead of sending a flood-storm, let famine come and smite the
> land; instead of sending a flood-storm, let pestilence come and kill off the
> people. I did not reveal the mystery of the great gods. I only caused
> **Atra-hasis** to see it in a dream"
>
> **MOD** "Instead of a flood, send lions to thin mankind. Instead of a flood,
> send tigers. Instead of a flood, send famine. Instead of a flood, send plague.
> I did not betray the secret of the great gods. I only let **Utnapishtim** see
> it in a dream"

Same repetition-collapse (the verbs *diminish / smite the land / kill off the
people* are dropped from three of the four clauses). 121 → 92 words.

**Finding (name substitution — borderline):** *Atra-hasis* is the flood hero's
alternate name in the Akkadian tradition, and Ea's use of it here is a
recognized feature of the passage — it is how Ea evades admitting he broke the
gods' secrecy. Flattening it to *Utnapishtim* removes that. Unlike the
Siduri/Sirudi case, this alternate name plausibly *does* have a literary
function, so I record it as a real (if arguable) loss rather than a
normalization win.

### 6. Tablet XI, para 23 (the sleep test) — the clearest invention

> **SRC** "he turned to Gilgamesh and said: 'Now as for thee, which one of the
> gods shall give thee strength, that the life thou desirest thou shalt obtain?
> **Now sleep!**' And for six days and seven nights Gilgamesh **resembled one
> lying lame**."
>
> **MOD** "he turned to Gilgamesh and said: 'Now — who among the gods will give
> you the strength to gain the life you desire? **Let me test you. Try not to
> sleep.**' And for six days and seven nights, Gilgamesh **lay as still as a
> dead man**."

**Finding — invention, and a reversal.** The source says *"Now sleep!"*; the
modern says *"Let me test you. Try not to sleep."* The modern is arguably
closer to the Akkadian (Utnapishtim does set a stay-awake trial), but our
standard is fidelity to **the source text in front of the translator**, and
this adds a whole sentence and inverts an imperative. If the source is
defective here, the fix is to fix the source, not to silently correct it in the
modern layer. "Resembled one lying lame" → "lay as still as a dead man" also
changes the image.

### 7. Tablet X, para 0 (Siduri at the tavern) — a good passage, for balance

> **SRC** "His countenance was like one who made a great journey."
>
> **MOD** "His face was like that of a man who had traveled a great distance."

Clean, faithful, unforced. The bulk of the edition reads like this; the
failures above are a specific recurring behaviour, not general sloppiness.

## Phase 3 — human-edition research

| Candidate | Translator / date | Completeness | Rights | URL | Verdict |
|---|---|---|---|---|---|
| **Current core** | unattributed composite; partially matches Muss-Arnolt 1901 + Jastrow & Clay 1920 via a **"© 2014 … All rights reserved"** compilation | 12 tablets, lacunae silently filled | **UNRESOLVED — see provenance section** | http://www.argonauts-book.com/english-translation-of-gilgamesh.html | The blocking issue. |
| Getty & Kwon, *Compact Anthology of World Literature* (LibreTexts) | Thompson + Muss-Arnolt, edited by **Laura J. Getty** | **Selections**, not all 12 tablets | **CC BY-SA 4.0** (share-alike; attribution + same-licence redistribution required) | https://human.libretexts.org/Bookshelves/Literature_and_Literacy/World_Literature/Compact_Anthology_of_World_Literature_(Getty_and_Kwon)/01%3A_Middle_East_Near_East_Greece/1.02%3A_The_Epic_of_Gilgamesh | **Best licensed candidate found.** Openly licensed, named editor, stated sources. But incomplete, and the Thompson verse diction (*"He who all knowledge possesses should teach all the people"*) is **less** accessible than Tinct's current modern-en. |
| R. Campbell Thompson, *The Epic of Gilgamish*, London 1928 | R. Campbell Thompson | Complete-as-then-known; literal verse, heavily bracketed | Published 1928 → **PD in the US**; Thompson d. 1941 → PD in EU/DK since 2012 | https://archive.org/details/thompson-1928-gilgamesh | **Rights good. Accessibility UNVERIFIED** — my attempts to read the running text failed (Internet Archive returned only metadata). Catalogued as literal and lacunose; likely harder than what Tinct ships. |
| Stephen Langdon, *The Epic of Gilgamish*, 1917 | Stephen Langdon | **Fragment only** (Pennsylvania tablet) | PD worldwide | https://www.gutenberg.org/ebooks/18897 · https://en.wikisource.org/wiki/The_Epic_of_Gilgamish | Not usable as a complete epic. |
| Jastrow & Clay, *An Old Babylonian Version*, 1920 | Jastrow & Clay | **Old Babylonian version only** — partial | PD worldwide | https://www.gutenberg.org/ebooks/11000 | Scholarly, partial. |
| Sandars (1960), Kovacs (1989), George (1999), Helle (2021) | — | Complete | **Fully in copyright** | — | Out of scope. The readable modern Gilgamesh translations are all in copyright. |

**Conclusion:** no complete, readable, rights-clear human English *Gilgamesh*
was found in this search. The PD options (Thompson, Langdon, Jastrow & Clay,
Muss-Arnolt) are all either partial, heavily lacunose, or archaic; the readable
ones (George, Helle, Sandars) are all in copyright. The CC BY-SA LibreTexts
compilation is the only openly *licensed* option and it is selections.

This is genuinely a case where an AI modern edition earns its place — **once
the base text's provenance is fixed.**

## Ratings

| Dimension | Weight | Score | Reason |
|---|---|---|---|
| Fidelity / completeness | 40% | **3** | No whole-passage omissions, but recurring collapse of formulaic repetition (Tablets VIII, IX, X, XI — 9 paragraphs below 72% length, every chapter at 0.81–0.91 word ratio), one clear invention/reversal (XI p23), one silent numeric emendation (IX p12), one arguable name loss (Atra-hasis). |
| First-read clarity | 25% | **5** | Genuinely modern, genuinely clear. Archaisms consistently removed. This edition does the job the Iliad and Aeneid editions do not. |
| Literary voice | 20% | **3** | The incantatory, formulaic register *is* the epic's literary character, and it is systematically flattened — both by repetition-collapse and by the habit of chopping into short declaratives. |
| Restraint / no invention | 10% | **3** | "Let me test you. Try not to sleep." is a substantive invention; "for all to read" and "Ishtar's" are smaller additions. |
| Naturalness | 5% | **4** | Natural contemporary English, occasionally too staccato. |

**Weighted score: 3.6** · **Band: Good with fixes**

## Recommendation

**BLOCKED** · confidence **medium-high** · correction scope **unknown**

**Exactly what is unresolved:** the identity, translator attribution and
redistribution rights of `gilgamesh-original-en.json`. Tinct is commercially
distributing a 12-tablet English *Gilgamesh* whose registry lists `translator:
null, year: null`; two distinctive passages match verbatim a web compilation
that asserts "© 2014 Jason Colavito. All rights reserved"; other passages do
not appear in that compilation at all; and the scholarly lacuna markers present
in the apparent source have been removed with the gaps filled by an
unidentified hand. Until it is established which translations this text is made
of and on what basis they may be redistributed commercially, no
keep/edit/retranslate verdict on the modern-en is safe, because the modern-en
is a derivative of it.

**Resolve in this order:**
1. Trace the actual provenance of `original-en` — check the book's git history
   and `books/` working files for how it was assembled and from what.
2. If it derives from the Colavito compilation, either obtain permission or
   rebuild the base directly from the PD sources (Muss-Arnolt 1901, Jastrow &
   Clay 1920, Thompson 1928) with a stated editorial method, restored lacuna
   markers, and a real `translator`/`year` in `bookRegistry.ts`.
3. **Only then** apply the modern-en fixes, which are otherwise a **LIGHT EDIT**
   and locally scoped: restore the formulaic repetition in Tablets VIII, IX, X
   and XI; revert the Tablet XI p23 invention; reinstate *Atra-hasis*; document
   or revert the Tablet IX "twelve" emendation; loosen the short-sentence habit.
   Absent the provenance problem, my recommendation would be LIGHT EDIT with
   local scope.

**Methodology note for the orchestrator:** the Phase 1 truncation threshold
(modern < 60% of source, source ≥ 20 words) caught 1 of the 9 real compressions
here. For texts built on formulaic repetition — Gilgamesh, the Bible, Homer's
type-scenes — a **72%** threshold surfaces the right cases. Worth re-running
across the corpus.

## Limitations of this review

- 7 of 253 paragraph-pairs read closely (~950 source words of 18,845, ~5%).
  Tablets III, IV, V, VI, XII were measured but not read at passage level.
- The repetition-collapse finding is supported by a **whole-book** length sweep
  (9 hits, all 12 chapters at 0.81–0.91 word ratio), so it is a pattern, not a
  sampling artefact.
- The provenance conclusion is **medium-high, not certain**: two verbatim string
  matches plus a stated source list is strong evidence of a relationship, but
  the four disagreements listed above mean I cannot say Tinct's text *is* the
  Colavito compilation. It may share a common ancestor. Resolving this needs the
  repo's own history, which I did not examine.
- Thompson 1928's accessibility is **unverified** — I could not read the running
  text. I did not evaluate Muss-Arnolt 1901 directly either.
- I did **not** review modern-da, audio, threads/cast JSON, or onboarding
  content, and did not compare any passage against a cuneiform edition.
