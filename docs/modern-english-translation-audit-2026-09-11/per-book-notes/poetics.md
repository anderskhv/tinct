# poetics — Poetics, Aristotle

**Scope:** public. Audited 2026-09-11.

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `00113ffc33cceda9` | 26 | 130 | 14,802 | "Butcher (1895)", translator `S. H. Butcher`, year `1895` |
| modern-en | `20c7f0695e0360b9` | 26 | 130 | 13,507 | "Modern English" |
| modern-da | `98b7db8373b61d59` | 26 | 130 | 12,548 | "Moderne Dansk" |

Mechanical comparison: mean weighted similarity **0.7845**, identical long paragraphs **1.6%**,
**7 truncation flags**, 0 empty paragraphs, 0 paragraph-count mismatches, aligned. Chapters carry
descriptive titles ("Chapter 13 — The tragic plot").

**Provenance:** `original-en` is S. H. Butcher's 1895 translation, correctly attributed. Butcher
d. 1910 → PD worldwide. The source file is a Project Gutenberg-lineage text whose distinguishing
feature is that **Greek is spelled out letter by letter** as English letter-names — e.g.
`{Theta omicron iota nu alpha tau alpha iota}` for θοινᾶται. This matters for every flag below.

## Samples inspected (6)

### 1. All seven Phase 1 truncation flags, checked directly

| flag | src→tgt | ratio | verdict |
|---|---|---|---|
| ch21 ¶6 | 101→53 | 0.52 | **DISCONFIRMED** |
| ch21 ¶7 | 57→30 | 0.53 | **DISCONFIRMED** |
| ch22 ¶1 | 243→63 | **0.26** | **DISCONFIRMED** |
| ch22 ¶2 | 31→6 | **0.19** | **DISCONFIRMED** |
| ch22 ¶3 | 114→59 | 0.52 | **DISCONFIRMED** |
| ch25 ¶8 | 67→30 | 0.45 | **DISCONFIRMED** |
| ch25 ¶10 | 36→15 | 0.42 | **DISCONFIRMED** |

**All seven are artifacts of Greek transliteration, and represent an improvement, not a loss.**

ch22 ¶2, the most extreme flag at ratio 0.19:
SRC: *"Or, for {eta iota omicron nu epsilon sigma / beta omicron omicron omega rho iota nu, eta iota
omicron nu epsilon sigma kappa rho alpha zeta omicron upsilon rho iota nu}"*
MOD: *"Or, for ēïones boōōsin, ēïones krazousin."*

ch22 ¶1, the 243→63 flag:
SRC: *"Euripides substitutes {Theta omicron iota nu alpha tau alpha iota} 'feasts on' for {epsilon
sigma theta iota epsilon iota} 'feeds on.' Again, in the line, {nu upsilon nu / delta epsilon / mu
/epsilon omega nu / omicron lambda iota gamma iota gamma upsilon sigma / tau epsilon…"*
MOD: *"Euripides substitutes thoinatai ('feasts on') for esthiei ('feeds on'). Again, in the line
nyn de m' eōn oligos te kai outidanos kai aeikēs, the difference will be felt if we substitute the
common words: nyn de m' eōn mikros te kai asthenikos kai aeidēs."*

ch25 ¶8: SRC *"{delta iota delta omicron mu epsilon nu (delta iota delta omicron mu epsilon nu) delta
epsilon / omicron iota,}"* → MOD *"didomen (didomen) de hoi"*.

Twenty spelled-out letter-names become one transliterated word, so the word count collapses while
**every example survives and becomes legible for the first time**. Ch21's coined-word examples
(*ernyges* 'sprouters' for *kerata* 'horns'; *aretēr* 'supplicator' for *hiereus* 'priest'),
lengthening/contraction examples (*polēos*, *Pēlēiadeō*, *kri*, *dō*, *ops*), Ariphrades' inversions
(*dōmatōn apo*, *Achilleōs peri*), and Hippias of Thasos's accent solutions all come through intact
and readable. This is the single most valuable thing the modern edition does, and the whole
truncation signal for this book is a false alarm.

### 2. Opening — Chapter 1 ¶0–2

SRC ¶0: *"I propose to treat of Poetry in itself and of its various kinds, noting the essential
quality of each; to inquire into the structure of the plot as requisite to a good poem…"*
MOD ¶0: *"I propose to treat poetry in itself and its various kinds, noting the essential quality of
each. I will inquire into the structure of plot necessary for a good poem…"*

SRC ¶2: *"For as there are persons who, by conscious art or mere habit, imitate and represent various
objects through the medium of colour and form…"*
MOD ¶2: *"Just as some people, by conscious art or mere habit, imitate and represent various objects
through color and form…"*

**Finding.** Accurate, fluent, and almost identical. "treat of" → "treat", a semicolon becomes a full
stop, "requisite to" → "necessary for". Nothing wrong; also nothing that a reader of Butcher needed.

### 3. Chapter 6 ¶1–3 — the definition of tragedy (the book's core passage)

SRC ¶1: *"Tragedy, then, is an imitation of an action that is serious, complete, and of a certain
magnitude; in language embellished with each kind of artistic ornament… through pity and fear
effecting the proper **purgation** of these emotions."*
MOD ¶1: *"Tragedy is an imitation of an action that is serious, complete, and of a certain magnitude;
in language embellished with each kind of artistic ornament… through pity and fear effecting the
proper **purgation** of these emotions."*

SRC ¶2: *"it necessarily follows, in the first place, that **Spectacular equipment** will be a part of
Tragedy"*
MOD ¶2: *"it follows first that **Spectacular equipment** will be a part of Tragedy"*

**Finding — this is the batch's key terminology question, and the answer is: nothing is glossed.**
Per the assignment I looked specifically for whether essential terms are explained at the point of
need (correct), left as 1895 jargon (LIGHT/MECHANICAL failure), or over-explained with added
commentary (invention failure). This edition is squarely in the **second** category. *Imitation*
(mimêsis), *purgation* (katharsis), *Spectacular equipment* (opsis), *Diction*, *Thought* all pass
through as Butcher left them, with no brief gloss anywhere. The six parts of tragedy are listed
correctly and completely; a reader who does not already know what "purgation of these emotions"
means will not learn it here.

On the credit side: it does **not** over-explain either. There is no added commentary, no
interpretive aside, no imported scholarship. Restraint is exemplary.

### 4. Chapter 13 ¶1–2 — the tragic hero, hamartia, and the named plays

SRC ¶1: *"There remains, then, the character between these two extremes,—that of a man who is not
eminently good and just,-yet whose misfortune is brought about not by vice or depravity, but by some
**error or frailty**. He must be one who is highly renowned and prosperous,—a personage like
**Oedipus, Thyestes**, or other illustrious men of such families."*
MOD ¶1: *"There remains, then, the character between these two extremes — a man not eminently good and
just, whose misfortune is brought about not by vice or depravity, but by some **error or frailty**.
He must be highly renowned and prosperous — a figure like **Oedipus, Thyestes**, or other illustrious
men of such families."*

SRC ¶2: *"the best tragedies are founded on the story of a few houses, on the fortunes of
**Alcmaeon, Oedipus, Orestes, Meleager, Thyestes, Telephus**… **Euripides**, faulty though he may be
in the general management of his subject, yet is felt to be the most tragic of the poets."*
MOD ¶2: *"…the best tragedies are founded on the story of a few houses — on the fortunes of
**Alcmaeon, Oedipus, Orestes, Meleager, Thyestes, Telephus**, and others who have done or suffered
something terrible… **Euripides**, faulty though he may be in the general management of his subject,
is felt to be the most tragic of poets."*

**Finding — named examples are preserved exactly, which was the specific concern flagged for this
book.** Every house, every poet, every play title survives with no vague paraphrase. Across all
samples I checked: Cleophon, Sthenelus, Eucleides the elder, Aeschylus's *Philoctetes*, Euripides,
Ariphrades, Philoxenus, Hippias of Thasos, Empedocles, Alcmaeon, Orestes, Meleager, Telephus,
Oedipus, Thyestes — all present and correctly spelled. *Hamartia* is rendered by Butcher's "error or
frailty" and, again, not glossed.

### 5. Chapter 22 ¶0 — the hardest connected-prose passage (style and diction)

SRC ¶0: *"The perfection of style is to be clear without being **mean**. The clearest style is that
which uses only current or proper words; at the same time it is **mean**:--witness the poetry of
Cleophon and of Sthenelus… while the use of proper words will make it **perspicuous**."*
MOD ¶0: *"The perfection of style is to be clear without being **mean**. The clearest style is one
that uses only current or proper words; but at the same time it is **mean** — witness the poetry of
Cleophon and Sthenelus… while the use of proper words will **keep it clear**."*

**Finding — the clearest illustration of the edition's limit.** *"perspicuous"* → *"keep it clear"*
is exactly right. But **"mean" is left standing three times in one paragraph**, in its obsolete sense
of *low / base / common*. A 2026 reader will read "clear without being mean" as "clear without being
unkind" — a straightforward misreading of the sentence that opens the chapter on style. The word that
most needed a point-of-need equivalent is the one that did not get one, in the same paragraph where
a harder-looking word did.

### 6. Ending — Chapter 26 ¶3–4

SRC ¶4: *"Thus much may suffice concerning Tragic and Epic poetry in general; their several kinds and
parts…"*
MOD ¶4: *"This much may suffice concerning Tragic and Epic poetry in general — their several kinds
and parts…"*

**Finding.** Complete, correct, and different from the source by one word and one dash.

## Phase 1 flags: confirmed vs. disconfirmed

- **7 truncation flags — ALL SEVEN DISCONFIRMED.** Greek-transliteration artifacts; the modern text
  is more complete in substance than the source is, not less.
- **Mean similarity 0.7845 — confirmed as a real quality signal.** Outside the Greek passages, this
  is Butcher repunctuated.
- **1.6% identical long paragraphs — confirmed** (ch7 ¶0 is byte-identical: *"These principles being
  established, let us now discuss the proper structure of the Plot…"*).
- **0 empty paragraphs, 130/130 alignment — confirmed.**
- **Not in the Phase 1 data:** 7 of 130 modern-en paragraphs (9 of 130 in original-en) end
  mid-sentence — inherited paragraph splits. ~5%; minor.

## Phase 3 — human-edition research

**Candidate A — Ingram Bywater, *On the Art of Poetry* (1909; Clarendon reprint 1920), PG #6763.**
- `https://www.gutenberg.org/files/6763/6763-h/6763-h.htm`. Fetched and read. Complete, with a
  preface by Gilbert Murray.
- Rights: Bywater d. 1914 → **public domain in the US and in Denmark/EU**. Fully rights-clear.
- Readability, compared directly on the two passages that matter most:
  - Ch. 6 definition — Bywater: *"A tragedy, then, is the imitation of an action that is serious and
    also, as having magnitude, complete in itself; **in language with pleasurable accessories**…
    with incidents arousing pity and fear, wherewith to accomplish its **catharsis** of such
    emotions."* Butcher: *"in language embellished with each kind of artistic ornament… effecting the
    proper **purgation** of these emotions."*
  - Ch. 13 hero — Bywater: *"a man not pre-eminently virtuous and just, whose misfortune, however, is
    brought upon him not by vice and depravity but by **some error of judgement**."* Butcher: *"some
    **error or frailty**."*
- Assessment: **not clearly more readable.** Bywater's *"language with pleasurable accessories"* is
  worse than Butcher's phrasing for a general reader. Bywater's advantages are scholarly-terminology
  ones — he uses *catharsis*, *Peripety*, *Discovery* where Butcher uses *purgation*, *Reversal of
  Fortune*, *Recognition* — which is a gain for a student who will meet those terms elsewhere, and
  a wash for a first-time reader. **Rights-clear, complete, verified by reading — but not an
  improvement sufficient to justify a swap.**

**Candidate B — Butcher (our current core text).** PD worldwide, complete, and already meeting the
standard's clause about English texts that are *"already accessible"*. Butcher's 1895 prose is lucid
Victorian expository writing; the barrier in the *Poetics* is conceptual (what *is* catharsis?), not
linguistic.

**Not viable:** Malcolm Heath (Penguin, 1996), Anthony Kenny (OUP, 2013), Joe Sachs (Focus, 2006),
Stephen Halliwell (Loeb, 1995) — all in copyright.

**Conclusion:** the best rights-clear human editions are the two we can already have (Butcher,
Bywater), and neither solves the actual reader problem, which is terminology.

## Ratings

| dimension | weight | score | note |
|---|---|---|---|
| fidelity / completeness | 40% | 5 | all 7 truncation flags false; every named poet, play and example preserved exactly; Greek made legible for the first time |
| first-read clarity | 25% | 3 | barely changed from Butcher; the terms that carry the book (*imitation*, *purgation*, *error or frailty*, *Spectacular equipment*, *mean*) are all unglossed; "mean" is actively misleading |
| literary voice | 20% | 4 | Butcher's lecture-note compression preserved |
| restraint / no invention | 10% | 5 | no added commentary, no imported scholarship, no interpretive transitions — exemplary |
| naturalness | 5% | 4 | fluent; ~5% of paragraphs break mid-sentence |

**Weighted score: 4.3.** **Band: Good with fixes.**

## Recommendation

**LIGHT EDIT** — confidence **medium-high**.

In substance this is the standard's **SOURCE + GLOSSES** answer: Butcher is already accessible
English, and a full modern rewrite is not worth maintaining for this book. I am recording it as
LIGHT EDIT rather than SOURCE + GLOSSES for one practical reason — the existing `modern-en` is
**strictly better than `original-en`** because it has already transliterated the Greek, which
`original-en` still renders as `{Theta omicron iota nu alpha tau alpha iota}`. The right base to
add glosses to is the modern file we already have, not the source file.

**Correction scope: local.** A single scoped pass adding brief point-of-need equivalents, ~10–15
touches across 26 chapters:
1. **ch22 ¶0 — highest priority.** "mean" in its obsolete sense appears three times in the opening
   paragraph on style. Render as "common"/"low" or gloss on first use.
2. **ch6 ¶1** — one clause for *purgation* (katharsis) at the definition of tragedy.
3. **ch6 ¶2–3** — *Spectacular equipment* (staging/spectacle); *Diction* and *Thought* as Aristotle's
   technical parts.
4. **ch13 ¶1** — one clause for *error or frailty* (hamartia), the term readers arrive looking for.
5. **ch11** — *Reversal of Fortune* and *Recognition* (peripeteia, anagnorisis) named once.
6. **ch1–3** — *imitation* (mimêsis) glossed once at first use and then left alone.

Everything else should be left exactly as it is. The restraint in this edition is genuine and worth
protecting; the fix is to add the missing half (explaining terms at the point of need), not to start
rewriting.

## Limitations of this review

- 6 passages plus all 7 flagged paragraphs — roughly 2,600 source words of 14,802 (~18%), the
  highest proportional coverage of any book in my batch. Chapters 4, 8–10, 12, 14–20, 23–24 were not
  read at paragraph level.
- English-to-English only; no comparison against the Greek. In particular I have not verified that
  the transliterations in chs. 21–22 and 25 are *accurate* transliterations of the Greek the
  letter-names encode — I verified that the examples are present and readable, not that
  *ēïones boōōsin* is the right rendering. Someone who reads Greek should spot-check that.
- I did not audit `modern-da`.
- Bywater was assessed from two decisive passages plus front matter, not read end to end.
- Onboarding JSON, Cast/threads data and audio for this book were not inspected.
