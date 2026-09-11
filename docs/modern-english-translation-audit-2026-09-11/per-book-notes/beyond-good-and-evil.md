# beyond-good-and-evil — *Beyond Good and Evil*, Friedrich Nietzsche (1886)

Audit date: 2026-09-11 · Scope: public · Reviewer: batch agent (early-modern/modern continental philosophy)

## Edition snapshot (from Phase 1 `mechanical/beyond-good-and-evil.json`)

| edition | label / translator | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|---|
| original-en | Zimmern (1907), tr. Helen Zimmern | `a906a663863727ff` | 11 | 325 | 62,412 |
| modern-en | Modern English | `5b14eaa83a4b695a` | 11 | 325 | 63,623 |
| modern-da | Moderne Dansk | `ee3d488e2e798a6a` | 11 | 325 | 60,068 |

`core_key_en = original-en`; `en_editions_aligned = true`; no paragraph-count mismatches, no
truncations, no empty paragraphs. Phase 1 mean weighted similarity **0.8759**,
`pct_identical_long_paragraphs` **11.1**, `last_chapter_suspiciously_short = true`
(last chapter 613 words).

## Provenance of the core English text

Helen Zimmern's 1907 translation, from Oscar Levy's *Complete Works of Friedrich Nietzsche*.
Complete: Preface, nine numbered chapters (296 aphorisms), and the closing poem "From the
Heights." Zimmern renders Nietzsche's typographic emphasis (German *gesperrt*) as SMALL
CAPS/ALL CAPS — `original-en` contains **995** ALL-CAPS emphasis runs.

## Phase 1 flags: confirmed / disconfirmed

**`last_chapter_suspiciously_short` (613 words) — DISCONFIRMED as a defect.** File chapter 11 is
Nietzsche's actual closing poem, the *Nachgesang* "Aus hohen Bergen" / "From the Heights," which
really is a short verse epilogue to the book. It is present and complete in both editions, laid
out as ten numbered stanzas, and the modern edition keeps it **as verse** rather than prosifying
it. Nothing is cut. Example (stanza 1):
- source: "MIDDAY of Life! Oh, season of delight! / My summer's park! / Uneaseful joy to look, to
  lurk, to hark-- / I peer for friends, am ready day and night,-- / Where linger ye, my friends?
  The time is right!"
- modern: "Midday of life! O season of delight! / My summer's park! / A restless joy to look, to
  wait, to hark — / I watch for friends, ready day and night — / Where do you linger, friends? The
  time is right!"
This is a real structural feature of the book, not a truncation. **Flag should be closed.**

**`pct_identical_long_paragraphs = 11.1` — CONFIRMED, and it under-states the problem.** That
metric counts exact string equality. I recomputed with a word-token sequence match against
Zimmern and got **95.0% of source word-tokens retained verbatim, in sequence, across the whole
book**, with a clear effort gradient by chapter:

| file ch | chapter | % of Zimmern's word-tokens retained verbatim |
|---|---|---|
| 1 | Preface | 92.2 |
| 2 | 1 — Prejudices of Philosophers | 90.7 |
| 3 | 2 — The Free Spirit | 94.8 |
| 4 | 3 — The Religious Mood | 97.3 |
| 5 | 4 — Epigrams and Interludes | 96.7 |
| 6 | 5 — The Natural History of Morals | 97.4 |
| 7 | 6 — We Scholars | 98.4 |
| 8 | 7 — Our Virtues | 98.2 |
| 9 | 8 — Peoples and Countries | **99.0** |
| 10 | 9 — What Is Noble? | 88.4 |
| 11 | From the Heights (poem) | 82.5 |

So the Preface and chapters 1–2, and chapter 9, received real editorial work; chapters 3–8 are
essentially Zimmern with punctuation normalised. This is the classic decaying-effort profile.

## Samples inspected (7 locations, ~2,900 source words)

### 1. Opening — Preface (file ch1), para 0
Source: "…probably the time is at hand when it will be once and again understood WHAT has
actually sufficed for the basis of such imposing and absolute philosophical edifices as the
dogmatists have hitherto reared: perhaps some popular superstition of immemorial time… a noble
puerilism and tyronism"
Modern: "…probably the time is at hand when it will be understood once and again what has
actually sufficed for the foundation of such imposing and absolute philosophical edifices as the
dogmatists have hitherto reared. Perhaps some popular superstition of immemorial time… only a
noble childishness and novice work"
**Finding:** genuinely helpful in places ("puerilism and tyronism" → "childishness and novice
work"). But "importunity," "mien," "nay more," "immemorial time," "cupidity" survive unglossed,
and *de omnibus dubitandum* and *niaiserie* are left untranslated in the following paragraphs.
The Preface's last line loses matter: source "And perhaps also the arrow, the duty, and, who
knows? THE GOAL TO AIM AT…." → modern "And perhaps also the arrow, the task, and — who knows? —
the goal." The trailing "to aim at" and the four-dot ellipsis both go. Small but this is the
book's most famous closing cadence.

### 2. Systematic, book-wide — loss of Nietzsche's emphasis
`original-en` has **995** ALL-CAPS emphasis runs; `modern-en` has **13** (and none of them are
emphasis — they're aphorism headers like "THE SAGE AS ASTRONOMER"). There are **zero**
underscores, asterisks, `<em>` or `<i>` in `modern-en`. So ~980 authorial emphases are deleted
with **no substitute marker at all**.
Example, aphorism 214 (file ch8 para 0): source "we shall presumably, IF we must have virtues…
And is there anything finer than to SEARCH for one's own virtues? Is it not almost to BELIEVE in
one's own virtues?" → modern "we shall presumably, if we must have virtues… Is there anything
finer than to search for one's own virtues? Is it not almost to believe in one's own virtues?"
**Finding:** this is exactly the "flattening of rhetorical intensity" failure mode. Nietzsche's
emphasis is not decorative — in this aphorism the contrast *search* / *believe* is the joke.
This is a **recurring, book-wide** defect, and it is the single biggest thing wrong with this
edition. It is, however, mechanically repairable.

### 3. Early — Chapter 1 (file ch2), paras 0–2 (aphorisms 1–3)
Source: "It never occurred even to the wariest of them to doubt here on the very threshold
(where doubt, however, was most necessary); though they had made a solemn vow, DE OMNIBUS
DUBITANDUM."
Modern: "It never occurred even to the wariest of them to doubt on this very threshold (where
doubt was most necessary) — though they had made a solemn vow, de omnibus dubitandum."
**Finding:** argument-chain fidelity is good; "firstly/secondly" → "first/second" preserved;
"might be possible" is not upgraded to "is." But note the modern-en drops Zimmern's "however"
("where doubt, however, was most necessary"), a small concessive, and still leaves the Latin
motto unglossed. Also the near-verbatim carry-through of "frog perspectives," "crocheted to,"
"niaiserie."

### 4. Mechanical outlier — Chapter 4 "Epigrams and Interludes" (file ch5), aphorisms 63–186
This is the chapter that drives the 11.1% identical figure. Sampled aphorisms 70, 71, 88, 89, 95, 96.
- Aph. 70 — source: "If a man has character, he has also his typical experience, which always
  recurs." modern: **byte-identical**.
- Aph. 88 — source: "One begins to distrust very clever persons when they become embarrassed."
  modern: **byte-identical**.
- Aph. 89 — source: "Dreadful experiences raise the question whether he who experiences them is
  not something dreadful also." modern: **byte-identical**.
- Aph. 95 — **byte-identical**.
- Aph. 71 — source: "THE SAGE AS ASTRONOMER.--So long as thou feelest the stars as an 'above
  thee,' thou lackest the eye of the discerning one." modern: "THE SAGE AS ASTRONOMER. As long as
  you feel the stars as an 'above you,' you lack the eye of the discerning one."
- Aph. 96 — "Ulysses" → "Odysseus" (a consistency improvement against our Homer books).
**Finding:** the chapter is a thou→you pass, nothing more. For many of these aphorisms that is
defensible — they are short and already clear. But the chapter is shipped under a label that
promises modernization, and a reader who toggles editions here will see no difference on most
cards. Call it a false-modern chapter with a partial excuse.

### 5. Middle — Chapter 8 "Peoples and Countries" (file ch9), para 8 (aphorism 248)
Source: "…and others which have to fructify and become the cause of new modes of life--like the
Jews, the Romans, and, in all modesty be it asked: like the Germans?--nations tortured and
enraptured by unknown fevers and irresistibly forced out of themselves, amorous and longing for
foreign races (for such as 'let themselves be fructified'), and withal imperious…"
Modern: "…and others which have to fructify and become the cause of new modes of life — like the
Jews, the Romans, and, in all modesty be it asked: like the Germans? — nations tortured and
enraptured by unknown fevers and irresistibly forced out of themselves, amorous and longing for
foreign races (for such as 'let themselves be fructified'), and withal imperious…"
**Finding:** apart from `--` → ` — `, **verbatim Zimmern**. "fructify," "devolved," "withal
imperious," "empowered 'by the grace of God'" all left. This is a 99%-retained chapter and the
sample is representative of it.

### 6. Late — Chapter 9 (file ch10), para 35 (aphorism 295, Dionysus)
Source: "…in a guise which acts as an ADDITIONAL constraint on his followers…" / "'Keep that,'
he would say, 'for thyself and those like thee, and whoever else require it!'"
Modern: "…in a guise that acts as an additional constraint on his followers…" / "'Keep that,' he
would say, 'for thyself and those like thee, and whoever else requires it!'"
**Finding:** chapter 9 is the second-most-edited chapter (88.4%), and the edit is careful —
"unensnaring," "halcyon smile," "rat-catcher of consciences" all preserved, the Ariadne aside
preserved, the closing "We men are — more human." preserved. But archaic *thou/thee* is left
standing **inside** the modern edition here even though the same forms were modernized in
chapter 4. **Inconsistent policy across chapters.**

### 7. Ending — Chapter 9 (file ch10), para 36 (aphorism 296, the book's last prose)
Source: "…you sudden sparks and marvels of my solitude, you, my old, beloved--EVIL thoughts!"
Modern: "…you sudden sparks and marvels of my solitude, you, my old, beloved — evil thoughts!"
**Finding:** the whole aphorism is faithful and the rhythm survives; but the final word's
emphasis — the entire point of the last line of the book — is silently removed.

## Summary of confirmed defects

1. **Recurring:** ~980 authorial emphases deleted book-wide with no substitute. Mechanically
   repairable from `original-en`.
2. **Recurring:** chapters 3–8 (roughly 40,000 of 62,000 words) are Zimmern with punctuation
   normalisation — a false-modern middle to the book. Edwardian diction, untranslated
   French/Latin/Italian tags, and archaic pronouns survive there.
3. **Local:** Preface closing line drops "to aim at" and the trailing ellipsis.
4. **Local:** inconsistent archaism policy (thou/thee modernized in ch4, left in ch9).
5. **No invention, no omission of substance, no content shifted between chapters found** in any
   sample. Where the editor did work, the work is accurate and restrained.

## Phase 3 — human-edition research

| candidate | date | completeness | rights | evidence |
|---|---|---|---|---|
| Helen Zimmern (current core) | 1907 | complete | PD US; PD EU (Zimmern d. 1934, life+70 expired 2005) | Standard Ebooks ships exactly this translation: https://standardebooks.org/ebooks/friedrich-nietzsche/beyond-good-and-evil/helen-zimmern — i.e. the best-curated free edition of BGE in existence *is* our source text. |
| Ian Johnston (Vancouver Island University) | 2009–2014 | complete | **noncommercial only — not usable** | https://web.viu.ca/johnstoi/nietzsche/beyondgoodandevil_tofc.htm ; copyright page https://web.viu.ca/johnstoi/copyright.htm fetched and read: "All general readers, teachers, students, and performing artists may download any material… without permission and without charge, **provided they do not use the material in a commercial publication**." Johnston also licenses print editions commercially through Richer Resources. Tinct is a paid product, so this is **permission required**. Loose web summaries calling Johnston's translations "public domain" are wrong — the author's own page contradicts them. |
| Walter Kaufmann | 1966, Vintage | complete | **in copyright** | US pre-1978 publication with notice → 95-year term (to 2061); Kaufmann d. 1980 → EU life+70 to 2050. No licensing statement. |
| R.J. Hollingdale | 1973/1990, Penguin | complete | **in copyright** | Hollingdale d. 2001 → EU to 2071. |
| Marion Faber | 1998, Oxford World's Classics | complete | **in copyright** | Living translator; commercial edition. |
| Judith Norman | 2002, Cambridge | complete | **in copyright** | Living translator; commercial edition. |

**Conclusion: no rights-clear human alternative to Zimmern exists.** Everything readable is
copyrighted; everything free is Zimmern. Searched: Standard Ebooks, Project Gutenberg, Wikisource,
johnstoniatexts, open-textbook repositories (the Toronto Metropolitan / Pressbooks "open" edition
is itself a reprint of the Gutenberg Zimmern text). This is "none found in this search," and I
consider it close to "none exists," but state it as the former.

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 3 |
| literary voice | 20% | 3 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 3 |

Weighted score **4.0** — band **Good with fixes**.

Fidelity is 5 because nothing is lost that isn't in Zimmern (the edition is over-faithful, not
under-faithful). Clarity is 3 because roughly two-thirds of the book is not actually modernized.
Voice is 3 because ~980 emphases are gone — Nietzsche's voice is materially quieter than the
source's, which is the opposite of the intended direction.

## Recommendation

**LIGHT EDIT** — confidence **medium**, correction scope **substantial** (but mechanical, not
interpretive).

I am deliberately not recommending RETRANSLATE. The work that was done is accurate and restrained;
what is missing is coverage, not quality. Two scoped jobs would fix this edition:

1. **Restore emphasis.** Map Zimmern's 995 ALL-CAPS runs onto the aligned modern-en paragraphs
   and re-mark them (the reader should render them as italics, not shouting caps). This is a
   scriptable, paragraph-aligned diff job with no editorial judgment required, and it is the
   highest-value fix in this batch.
2. **Finish the modernization of chapters 3–8** to the standard already achieved in the Preface
   and chapters 1–2 and 9: gloss or replace the untranslated foreign tags, normalize thou/thee,
   untangle Zimmern's longest periodic sentences. Roughly 40,000 words.

Why a modernization is needed at all: Zimmern is accurate but Edwardian, and on a phone screen a
sentence like "the terrible seriousness and clumsy importunity with which they have usually paid
their addresses to Truth" is a wall; the parts of the book that were actually modernized read
markedly better without losing anything.

## Limitations of this review

Seven passage locations (~2,900 source words of 62,412, ~4.6%) plus two whole-book mechanical
analyses (emphasis-marker count, per-chapter token retention). I read aphorisms 1–3, 70–71,
88–89, 95–96, 214, 248, 295, 296, the Preface, and the closing poem. I did **not** read chapters
3, 5, 6, or 7 in connected prose beyond spot checks, did not check the Danish edition, did not
verify aphorism numbering against Nietzsche's German across all 296 aphorisms, and did not check
whether the reader UI would render restored emphasis markup if we added it.
