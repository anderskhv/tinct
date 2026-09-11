# the-art-of-war — The Art of War (Sun Tzu)

Audit batch B12 (ancient history / strategic writing, translated works), 2026-09-11.
Scope: **public**. Review only — no edition files were modified.

## Edition snapshot (Phase 1 data)

| edition | label | translator / year | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|---|---|
| original-en | Giles Translation (1910) | Lionel Giles, 1910 | `60beeb94051b0731` | 13 | 445 | 10,847 |
| modern-en | Modern English | — | `bf41e7a3a4412025` | 13 | 445 | 8,329 |
| modern-da | Moderne Dansk | — | `07668460e5031235` | 13 | 445 | 8,070 |

`en_editions_aligned: true`, no chapter/paragraph-count mismatches, no empty paragraphs,
chapter titles identical across editions (verified). Mean weighted similarity **0.3829**;
**31 truncation flags**; 0.0 % identical long paragraphs.

Recomputed word-level similarity (difflib, `autojunk=False`, per chapter): median **0.377**,
range 0.262 (ch. VI) – 0.457 (ch. X). This is a genuine full rewrite, not a copy-edit.

## Provenance / completeness of the core English text

original-en is Lionel Giles's 1910 Luzac & Co. translation — complete, all 13 chapters,
the canonical scholarly public-domain English Sun Tzu. Giles's numbered-maxim structure
(`1.`, `2.`, `5, 6.` …) survives in original-en (376 in-text numerals) but is **stripped
entirely from modern-en** (1 numeral remaining, and that is "100"). Readers therefore cannot
cite modern-en by the standard chapter:verse reference. Minor, but it is a real loss of
apparatus for a text that is almost always cited that way.

## Phase 1 flags — confirmed / disconfirmed

**31 truncation flags — DISCONFIRMED as omissions (ratio-based false positives).**
I pulled and hand-read the flagged paragraphs in chapters 1, 3, 6, 7, 9 and 10. Every one is
compression of Edwardian padding, not loss of content. Representative cases:

- **Ch. I, para 8** (flagged, ratio 0.48). Source: *"By Method and discipline are to be
  understood the marshalling of the army in its proper subdivisions, the gradations of rank
  among the officers, the maintenance of roads by which supplies may reach the army, and the
  control of military expenditure."* Modern: *"Method and Discipline cover the organization of
  your forces, the chain of command, supply logistics, and the management of resources."*
  All four items survive; only the concrete image ("roads by which supplies may reach the army")
  is abstracted.
- **Ch. III, para 10** (ratio 0.52). Source's three-way conditional (equally matched / slightly
  inferior / quite unequal) is fully preserved in 15 words.
- **Ch. IX, paras 44–50** (six flags). All content present; e.g. para 45 keeps both halves of
  the reward/punishment antithesis.

Conclusion: for terse aphoristic source text, a 0.5–0.6 length ratio is the *expected* outcome
of a successful modernization. The flag threshold is miscalibrated for this book, exactly as the
batch brief suspected. Zero confirmed omissions from the flagged set.

`last_chapter_suspiciously_short: false` — confirmed; ch. XIII is 747 source words and complete
through the I Chih / Lü Ya coda.

## Phase 2 — sampled passages (9 locations, ~40 % of the book read in pairs)

### 1. Opening — Chapter I, full chapter (31 paragraphs)
Generally strong and punchy. Three defects:

- **Ch. I para 23.** SRC: *"If he is secure at all points, be prepared for him."*
  MOD: *"If the enemy is well fortified, prepare for a long engagement."*
  "Be prepared for him" is not "prepare for a long engagement" — the modern invents a
  prediction about duration that is not in the source.
- **Ch. I para 24 — altered logical relation.** SRC: *"If your opponent is of choleric temper,
  seek to irritate him. Pretend to be weak, that he may grow arrogant."*
  MOD: *"If the enemy commander has a short temper, provoke him. If he is arrogant, appear weak
  to feed his overconfidence."* The source makes feigned weakness the *cause* of arrogance
  (purpose clause); the modern makes arrogance a *precondition* for feigning weakness. The
  causal arrow is reversed.
- **Ch. I paras 29–30 — image replaced by explanation.** SRC: *"the general who wins a battle
  makes many calculations in his temple ere the battle is fought."* MOD: *"The leader who wins
  a battle has done extensive planning before the fight begins."* The ancestral-temple setting
  (the pre-campaign council) disappears.

### 2. Early — Chapter II (Waging War), paras 0–9
- **Para 0 — loss of characteristic specifics.** SRC: *"with provisions enough to carry them a
  thousand li, the expenditure at home and at the front, including entertainment of guests,
  small items such as glue and paint, and sums spent on chariots and armour…"*
  MOD: *"with supplies for a long campaign, the total cost at home and in the field, including
  diplomatic expenses, equipment maintenance, and vehicle and armor repairs…"*
  "A thousand li" → "a long campaign" (a measured distance becomes a vague adjective);
  "glue and paint" — one of the most-quoted concrete details in the book — becomes
  "equipment maintenance"; "entertainment of guests" becomes "diplomatic expenses".
- **Para 9 — altered causal chain.** SRC: *"Poverty of the State exchequer causes an army to be
  maintained by contributions from a distance. Contributing to maintain an army at a distance
  causes the people to be impoverished."* MOD: *"When a state funds a distant army from its own
  treasury, the people at home are impoverished. Maintaining supply lines over long distances
  bleeds a nation dry."* The source's first link (an empty treasury forces reliance on distant
  *contributions*) is inverted into the state funding the army *from its own treasury*.

### 3. Mechanical-outlier cluster — Chapter III paras 8–12; Chapter IX paras 42–50
See Phase 1 section above. No omissions. Small doublet loss at ch. IX para 44:
*"whispering together in small knots **or speaking in subdued tones**"* → *"whispering in small
groups"*.

### 4. Middle / imagery — Chapter V (Energy), paras 8–24
The famous image chain (five tastes, torrent rolling stones, falcon's swoop, bent crossbow,
round stone down a mountain) is preserved. Two small losses:
- Para 12: *"the well-timed swoop of a falcon which enables it to strike and destroy its
  victim"* → *"a falcon's strike — precise, swift, and devastating"* (adjectives supplied that
  are not in the source; the victim disappears).
- Para 23: *"like unto rolling **logs or stones** … it is the nature of a **log or stone**"* →
  *"like boulders on a slope. A boulder sits still…"* The log/stone pairing (and with it the
  four-cornered/round contrast's second material) is collapsed to stone alone.

### 5. Hardest fidelity test — Chapter VII (Maneuvering), paras 4–10 — **confirmed factual error**
Giles renders the Chinese *li* as "li" three times; modern-en converts all three to **miles**
while keeping the same numeral:

| | source | modern-en |
|---|---|---|
| VII.7 | *"doing a hundred **li** in order to wrest an advantage"* | *"to seize an advantage a hundred **miles** away"* |
| VII.9 | *"If you march fifty **li** in order to outmanœuver the enemy"* | *"Force-march fifty **miles** for an advantage"* |
| VII.10 | *"If you march thirty **li** with the same object"* | *"Force-march thirty **miles**, and two-thirds will make it."* |

A Warring-States *li* is roughly a third of a mile, so "a hundred li" (~33 mi) is rendered as
"a hundred miles" — a threefold distortion of a number the passage is entirely *about*.
Verified with a full-text scan: `li` appears 5× in original-en and 0× in modern-en;
`mile` appears 0× in original-en and 3× in modern-en, all in chapter VII. Handling of the unit
is also internally inconsistent — dropped at II.0, mistranslated at VII.7/9/10, generalized at
VI.20 (*"anything under a hundred li apart, and even the nearest separated by several li"* →
*"separated by great distances"*).

Same passage, VII.7: *"if you order your men to **roll up their buff-coats**, and make forced
marches…"* → *"If you force your soldiers to march day and night without rest…"* — the
mechanism of the forced march (stripping armour for speed) is dropped.

### 6. Proper-noun loss + invention — Chapter VI, para 21
SRC: *"Though according to my estimate the soldiers of **Yüeh** exceed our own in number, that
shall advantage them nothing in the matter of victory. I say then that victory can be
achieved."*
MOD: *"Even if **the enemy** outnumbers us, that advantage counts for nothing **if we control the
terms of engagement**. Victory can be **engineered**."*
Three defects in one paragraph: the historical antagonist (Yue, Wu's rival state — Sun Tzu's
only first-person naming of his own strategic situation) is generalized away; a conditional
clause is invented; and "achieved" becomes "engineered", a stronger claim than the source makes.

### 7. Late — Chapter XI (The Nine Situations), paras 40–47
Clean. Kicking away the ladder, burning boats, smashing cooking-pots, the shepherd driving the
flock — all images intact, all logical relations intact. Best-behaved sample in the book.

### 8. Ending — Chapter XIII (The Use of Spies), paras 22–32
Complete. Romanization is modernized consistently to pinyin (Hsia→Xia, Chou→Zhou, I Chih→Yi Zhi,
Lü Ya→Lu Ya) — a defensible improvement, applied consistently; "Sun Tzu" is retained as the
conventional English name, which is the right call. Minor softening: *"to assassinate an
individual"* → *"to eliminate an individual"*; *"door-keepers and sentries"* → *"gatekeepers and
bodyguards"*.

### 9. Register (observed across all samples) — voice drift toward business adaptation
modern-en repeatedly reaches for contemporary management vocabulary that has no counterpart in
Giles: *"your strategic position"*, *"the chain of command"*, *"supply logistics"*,
*"the management of resources"*, *"beyond the standard playbook"*, *"chokepoints"*,
*"The rule of engagement"*, *"a long engagement"*, *"transformative results"*,
*"unleashes their collective force"*, *"Victory can be engineered"*.
This is the exact register of the commercial "Sun Tzu for managers" adaptations, and it is
drifting the book's voice away from the aphoristic military original. The terseness and
parallelism of the maxims are, correctly, *not* flattened — per the batch brief I did not
penalize repetition or antithesis — but the diction is a real voice issue.

## Phase 3 — human-edition research

**Candidate A — Lionel Giles, *Sun Tzŭ on the Art of War* (Luzac & Co., London, 1910). Complete.**
This is already Tinct's original-en. Standard Ebooks edition:
<https://standardebooks.org/ebooks/sun-tzu/the-art-of-war/lionel-giles>;
Project Gutenberg #132: <https://www.gutenberg.org/files/132/132-h/132-h.htm>.
Still the scholarly reference English Sun Tzu.

**Rights — unresolved jurisdictional question (flagged for Anders).**
Lionel Giles lived **29 Dec 1875 – 22 Jan 1958** (<https://en.wikipedia.org/wiki/Lionel_Giles>).
- **United States:** public domain (published 1910, pre-1929).
- **Denmark / EU:** copyright in a translation runs life-of-the-translator + 70 years, which for
  Giles is **1 January 2029**. On its face the 1910 Giles translation is *still in copyright in
  the EU*, and Tinct operates from Denmark.
Standard Ebooks states the position explicitly for its own edition: its own editorial work is
"dedicated to the public domain via the CC0 1.0 Universal Public Domain Dedication", but the
underlying text is only "thought to be free of copyright restrictions **in the United States**",
with a warning that readers outside the US should check local law.
This exposure attaches to **original-en** (a verbatim reproduction) more than to modern-en
(a rewrite, though still a derivative work). I am not qualified to give a legal opinion; I am
recording it as an open question that should be resolved, not asserting infringement.

**Candidate B — E. F. Calthrop, *The Book of War* (John Murray, London, 1908; first pub. Tokyo
1905 as *Sonshi*).** Calthrop lived 1876–1915, so this translation **is** public domain in
Denmark/EU as well as the US. Internet Archive scan:
<https://archive.org/details/cu31924024039996>.
**Rejected on quality/completeness.** Giles's own preface (and the scholarly consensus that
followed it) records that Calthrop worked from a Japanese intermediary, that "omissions [are]
frequent and hard passages wilfully distorted or slurred over", and that "the translator's
knowledge of Chinese was far too scanty to fit him to grapple with the manifold difficulties of
Sun Tzu". Not a reliable complete text.

**Modern loose "business" adaptations** (Timeless Lore "New Modern English Translation",
various *Art of War for Executives* titles) — per the batch brief these were checked and are
**not** candidates: they are adaptations/paraphrases, in copyright, and several are not complete
translations of the thirteen chapters at all.

**No Creative-Commons or otherwise permissively licensed complete English Sun Tzu was found in
this search.** That is "none found in this search", not "none exists".

## Phase 4 — ratings and decision

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40 % | **3** |
| first-read clarity | 25 % | **5** |
| literary voice | 20 % | **3** |
| restraint / no invention | 10 % | **3** |
| naturalness | 5 % | **5** |

**Weighted score 3.6 — band: Mixed.**

Fidelity 3 rather than 4 because the defects recur rather than cluster: a repeated,
reader-misleading unit error (li→miles ×3 at the same numerals), repeated substitution of
abstractions for the source's concrete specifics (glue and paint, the temple, the buff-coats,
the logs, Yüeh), and at least three altered logical/causal relations (I.23, I.24, II.9).
Voice 3 and restraint 3 for the management-register drift and the small inventions.
Clarity and naturalness are genuinely excellent — this reads very well.

**Recommendation: LIGHT EDIT.** Confidence: **high** (short book; nine sampled locations plus
targeted inspection of the flagged set plus full-text scans for numerals, units and proper
nouns — I read roughly 40 % of the book in aligned pairs).

**Correction scope: local.** The work is a finite, enumerable list:
1. Fix the three *li* → "miles" errors (keep "li" with a one-clause gloss, or convert honestly).
2. Restore the dropped specifics: a thousand li (II.0), glue and paint (II.0), the temple
   (I.29), the buff-coats (VII.7), logs *and* stones (V.23), Yüeh (VI.21), the li distances
   (VI.20).
3. Remove the three inventions (I.23 "long engagement"; VI.21 "if we control the terms of
   engagement" / "engineered"; V.12 "precise, swift").
4. Repair the two reversed logical relations (I.24, II.9).
5. One pass to de-corporatize the diction ("playbook", "chokepoints", "rule of engagement",
   "transformative results").
6. Decide whether to restore Giles's maxim numbering for citability.
7. **Separately and more urgently: resolve the Giles EU/Denmark rights question.**

## Limitations of this review

- I read ~40 % of the book in aligned pairs, not all of it. Chapters IV, VIII, X and XII were
  checked only via automated scans (numerals, proper nouns, similarity), not read in full.
- modern-da was **not** reviewed at all. All findings concern modern-en only.
- The li→miles finding is a translation-accuracy judgment about the Chinese unit, made without
  consulting the Chinese text; it rests on the standard value of the Warring-States *li* and on
  the fact that Giles deliberately left the word untranslated.
- I did not check audio manifests, onboarding JSON, or Cast/threads data for this book.
- The rights analysis is a research note, not legal advice, and the EU position on pre-1929
  translations by translators who died after 1955 should be confirmed by someone qualified.
