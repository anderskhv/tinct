# kant-groundwork — *Groundwork of the Metaphysics of Morals*, Immanuel Kant (1785)

Audit date: 2026-09-11 · Scope: public · Reviewer: batch agent (early-modern/modern continental philosophy)

## Edition snapshot (from Phase 1 `mechanical/kant-groundwork.json`)

| edition | label / translator | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|---|
| original-en | Abbott (1879), tr. Thomas Kingsmill Abbott | `39baa06718f8c737` | 4 | 193 | 30,736 |
| modern-en | Modern English | `2ac2fce500388299` | 4 | 193 | 30,431 |
| modern-da | Moderne Dansk | `1ec3983ff14eba1a` | 4 | 193 | 28,778 |

(Also present: `kant-groundwork-threads.json`, the Cast file.)

`core_key_en = original-en`; `en_editions_aligned = true`; no paragraph-count mismatches, no
truncations, no empty paragraphs, `last_chapter_suspiciously_short = false` (Section III, 7,281
words). Phase 1 mean weighted similarity **0.8592**, `pct_identical_long_paragraphs` **1.1**.

## Provenance of the core English text

Thomas Kingsmill Abbott's 1879 translation (*Kant's Critique of Practical Reason and Other Works
on the Theory of Ethics*, Longmans). Complete: Preface plus the three Sections. Abbott's diction
is heavily Latinate and he keeps Kant's period sentences intact; it is the standard PD English
*Groundwork* and also the only one.

## Phase 1 flags: confirmed / disconfirmed

No flags were raised. But the aggregate 0.8592 similarity conceals a very uneven distribution.
Word-token sequence retention against Abbott, per section:

| file ch | section | % of Abbott's word-tokens retained verbatim, in sequence |
|---|---|---|
| 1 | Preface | 70.4 |
| 2 | Section I — common rational knowledge → philosophical | 83.5 |
| 3 | Section II — popular moral philosophy → metaphysic of morals | 93.2 |
| 4 | Section III — metaphysic of morals → critique of pure practical reason | **95.9** |
| — | **whole book** | **90.5** |

The gradient is the opposite of what a reader needs. Section III is the hardest thirty pages Kant
ever wrote — the two-standpoints doctrine, the charge of circularity, the limits of moral
inquiry — and it is where the modernization essentially stops. 25 of the 33 paragraphs I measured
in Section III retain ≥93% of Abbott's tokens; several are ≥0.99.

## Samples inspected (8 locations, ~2,300 source words)

### 1. Opening — Preface (file ch1), para 1
Source: "All rational knowledge is either material or formal: the former considers some object,
the latter is concerned only with the form of the understanding and of the reason itself…"
Modern: "All rational knowledge is either material or formal. Formal knowledge deals only with
the form of understanding and reason itself, with the universal laws of thought, regardless of
what those thoughts are about. Material knowledge deals with specific objects and the laws that
govern them. Formal philosophy is called logic. Material philosophy, which concerns definite
objects and the laws to which they are subject, splits in two…"
**Finding:** faithful, and clearer — but it now defines material/formal *twice* (once as
"knowledge," then again as "philosophy"), a redundancy Abbott does not have. Minor.

### 2. **Invention** — Preface (file ch1), para 2
Source: "Logic cannot have any empirical part; that is, a part in which the universal and
necessary laws of thought should rest on grounds taken from experience; **otherwise it would not
be logic, i.e., a canon for the understanding or the reason, valid for all thought, and capable
of demonstration.**"
Modern: "Logic cannot have any empirical part — that is, no part where the universal and
necessary laws of thought would rest on grounds drawn from experience. **Otherwise it would not
be logic at all, but only a fallible record of how people happen to think. A canon for
understanding and reason, valid for all thought and demonstrable, must be entirely a priori.**"
**Finding: confirmed invention.** Abbott has one sentence whose second half is an *appositive
definition* of logic. The modern edition (a) adds a clause that is not in the source at all —
"but only a fallible record of how people happen to think" — and (b) promotes the appositive into
a freestanding normative claim, "must be entirely a priori," which is Kantian in spirit but is
the modernizer's sentence, not Kant's or Abbott's. This is precisely the "added interpretation /
altered logical relationship" the standard forbids. It is **local** (I found it once), but it is
in the book's second substantive paragraph.

### 3. **Altered modality** — Preface (file ch1), para 5
Source: "…**But I only ask here whether** the nature of science does not require that we should
always carefully separate the empirical from the rational part… **and that whether the latter
inquiry is conducted by** all moralists (whose name is legion), **or only by some** who feel a
calling thereto."
Modern: "But here I only ask whether the nature of science doesn't require us to keep the
empirical and the rational strictly separate… **This inquiry must be undertaken either by** all
moralists (whose name is legion) **or by** some who feel a calling for it."
**Finding:** in Abbott the whole disjunction is still inside Kant's "I only ask whether." The
modern version breaks it out as an assertion with "must." Possibility is converted to necessity —
a logical-distinction failure the standard specifically names. Also local; same paragraph is
otherwise a good, lively modernization ("giving the name of minute philosophers to those who
apply themselves to the rational part only" → "dismiss as nitpickers those who focus only on the
rational part" is a genuinely good gloss).

### 4. Early — Section I (file ch2), para 0 (the good will)
Source: "Nothing can possibly be conceived in the world, or even out of it, which can be called
good, without qualification, except a good will."
Modern: "Nothing in the world — or even outside it — can possibly be conceived as good without
qualification, except a good will."
**Finding:** the book's most-quoted sentence, correctly and more clearly rendered. "Power,
riches, honour, even health" → "Power, wealth, honour, even health" preserves the list; "the
indispensable condition even of being worthy of happiness" preserved. Clean.

### 5. Early — Section I (file ch2), para 1 (the virtues that presuppose a good will)
Source: "…they are far from deserving to be called good without qualification, although they have
been so unconditionally praised by the ancients."
Modern: "…they are far from deserving to be called good without qualification, although the
ancients praised them unconditionally."
**Finding:** the concessive, the villain's coolness, and "not only more dangerous, but also
directly more abominable" all survive with the logical connectives intact. Clean.

### 6. Middle — Section II (file ch3), paras 38–41 (the categorical imperative formulations)
Source (38): "Act only on that maxim whereby thou canst at the same time will that it should
become a universal law."
Modern (38): "Act only on that maxim by which you can at the same time will that it should become
a universal law."
Source (40): "Act as if the maxim of thy action were to become by thy will a universal law of
nature." → Modern: "Act as if the maxim of your action were to become by your will a universal
law of nature."
**Finding:** thou→you, nothing else. The formulations are preserved exactly, which is right. Two
silent repairs of defects in Abbott are *improvements*: source 39 "although it should remain
undecided **what** is called duty is not merely a vain notion" → modern "although it should remain
undecided **whether** what is called duty is not merely a vain notion" (Abbott drops "whether");
source 41 "duties to ourselves **and ourselves** and to others" → modern "duties to ourselves and
to others" (Abbott has a dittography). Good catches.
**But:** "maxim" is left unglossed at first use, and in para 87 "bring it nearer to **intuition**"
is left unglossed — *Anschauung* in the technical sense, which a modern reader will simply
misread as "gut feeling." This is the terminology-gloss gap the standard asks for.

### 7. Late — Section III (file ch4), para 1 (the definition of freedom)
Source: "…freedom would be this property of such causality that it can be **efficient**,
independently of **foreign causes** determining it"
Modern: "…freedom would be that property of such causality by which it can be **efficient
independently of foreign causes** determining it"
**Finding:** unchanged where it matters. "Efficient" is Abbott's Latinism for *wirkend* (i.e.
effective / productive of effects) and "foreign causes" is a false-friend rendering of *fremde
Ursachen* (external/alien causes). Both are exactly the sort of thing a modern edition exists to
fix, and both are left standing in the definition of the book's central concept.

### 8. Late / mechanical outlier — Section III (file ch4), paras 14, 18, 19
Source (18): "For this reason a rational being must regard himself **qua intelligence** (not from
the side of his lower faculties) as belonging not to the world of sense, but to that of
understanding… secondly, as belonging to the **intelligible world**, under laws which being
independent of nature have their foundation not in experience but in reason alone."
Modern (18): "For this reason a rational being must regard himself **qua intelligence** (not from
the side of his lower faculties) as belonging not to the world of sense but to that of
understanding… secondly, as belonging to the **intelligible world**, under laws which, being
independent of nature, have their foundation not in experience but in reason alone."
**Finding:** comma repositioning only. Untranslated Latin *qua intelligence*, and "world of
sense," "world of understanding," "intelligible world," "heteronomy" all unglossed — in the
paragraph that states the entire two-standpoints doctrine.
Para 14 is better: the modern version repairs a genuinely broken Abbott sentence ("but at most
only logical purposes to reduce apparently different notions" → "but at most only to reduce, for
logical purposes, apparently different notions"). So the editor *was* reading carefully in
Section III; they just weren't modernizing.

## Summary of confirmed defects

1. **Recurring, structural:** modernization effort decays from 30% rewritten (Preface) to 4%
   (Section III). The hardest section gets the least help. Roughly 23,000 of 30,700 words
   (Sections II–III) are Abbott with light copyediting.
2. **Recurring:** technical vocabulary is never glossed at point of need — *maxim*, *kingdom of
   ends*, *intuition* (Anschauung), *intelligible world*, *heteronomy*, *qua intelligence*,
   *efficient*, *foreign causes*. This is the specific risk flagged for this book, and it is real.
3. **Local invention** (Preface para 2): "but only a fallible record of how people happen to
   think" + "must be entirely a priori."
4. **Local modality shift** (Preface para 5): a disjunction inside "I only ask whether" is
   converted to "This inquiry must be undertaken."
5. **Argument-chain fidelity is otherwise good.** Across all eight samples I found no dropped
   "therefore," no all/some slip, no if/only-if inversion, and no dropped qualification — apart
   from item 4. Two Abbott errors are silently and correctly repaired.

## Phase 3 — human-edition research

| candidate | date | completeness | rights | evidence |
|---|---|---|---|---|
| T.K. Abbott (current core) | 1879 | complete | **public domain**, US and EU | Abbott d. 1913 → EU life+70 expired 1984. Wikisource hosts the text: https://en.wikisource.org/wiki/Groundwork_of_the_Metaphysics_of_Morals (Abbott translation), Internet Archive https://archive.org/details/groundworkofmeta00kant. This is the cleanest rights position in my batch. |
| Jonathan Bennett, *Early Modern Texts* | c. 2005–2017 | complete | **noncommercial — NOT usable** | Rights page fetched: https://www.earlymoderntexts.com/faqs/rights — "The texts are copyrighted by Jonathan Bennett"; classroom copying, course packets and web posting with attribution are allowed, but "Permission is not and will not be given for the texts to be put to any commercial use." Tinct is a paid product → **permission required, and the page says permission will not be given.** This is the single most relevant candidate editorially (Bennett's *Groundwork* is exactly the kind of plain-English rendering our standard describes), and it is firmly blocked. Bennett died 31 March 2024 and the site states no further material will be added, so the "will not be given" position is unlikely to be revisited informally. |
| H.J. Paton, *The Moral Law* | 1948, Hutchinson | complete | **in copyright** | Paton d. 1969 → EU to 2039; UK/US commercial editions still in print. |
| Mary Gregor (Cambridge) | 1997 | complete | **in copyright** | Commercial edition. |
| Allen Wood (Yale) | 2002 | complete | **in copyright** | Commercial edition. |
| Arnulf Zweig (Oxford) | 2002 | complete | **in copyright** | Commercial edition. |

**Conclusion:** Abbott is the only rights-clear complete English *Groundwork*, and it is 147 years
old and deliberately literal. A Tinct modern edition is the right instrument. No suitable
alternative human edition found in this search (I would not claim none exists — I did not
exhaustively search pre-1930 periodicals or Scottish/American university translations).

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 3 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 3 |
| naturalness | 5% | 4 |

Weighted score **3.7** — band **Mixed**.

Fidelity is 4 not 5 because of the confirmed modality shift; restraint is 3 because of the
confirmed invention. Clarity is 3 because Sections II–III, i.e. three quarters of the book, are
substantially unmodernized and the technical vocabulary is never glossed.

## Recommendation

**LIGHT EDIT** — confidence **medium**, correction scope **substantial**.

Not RETRANSLATE: where the editor worked, the work is competent, the categorical-imperative
formulations are handled exactly right, and two real Abbott defects were repaired. The problem is
coverage plus two local slips. Three scoped jobs:

1. **Fix the two confirmed Preface defects** (paras 2 and 5). Small, immediate, and the invention
   in particular rules out an unqualified KEEP.
2. **Add a terminology-gloss pass.** First use of *maxim*, *intuition/Anschauung*, *intelligible
   world* vs *world of sense*, *heteronomy*, *kingdom of ends*, *qua intelligence*; and replace
   Abbott's false friends — *efficient* → effective/productive of effects, *foreign causes* →
   external causes. Brief, at point of need, no invented interpretation.
3. **Bring Sections II and III up to the Section I standard** (~23,000 words). Section III first —
   that's where readers abandon this book.

Why a modernization is needed at all: Abbott chose literal fidelity over readability in 1879, and
sentences like "freedom would be this property of such causality that it can be efficient,
independently of foreign causes determining it" are not merely archaic, they are actively
misleading to a modern reader.

## Limitations of this review

Eight passage locations (~2,300 source words of 30,736, ~7.5%) plus whole-book mechanical
analysis (per-paragraph and per-section token retention). I read Preface paras 1–2, 5, 7; Section
I paras 0–1; Section II paras 38–41 and 87; Section III paras 1, 14, 18–19. I did **not** read
Section II's four-duties examples in full, the humanity-as-an-end formulation, or the kingdom-of-
ends derivation in connected prose; did not check the Danish edition; did not compare against
Kant's German; and did not check Abbott's footnotes for completeness. The invention I found in the
Preface may not be the only one — the Preface and Section I are the sections with enough rewriting
for inventions to hide in, and I sampled four of their paragraphs.
