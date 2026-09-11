# descartes-meditations — *Meditations on First Philosophy*, René Descartes (1641)

Audit date: 2026-09-11 · Scope: public · Reviewer: batch agent (early-modern/modern continental philosophy)

## Edition snapshot (from Phase 1 `mechanical/descartes-meditations.json`)

| edition | label / translator | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|---|
| original-en | Veitch (1901), tr. John Veitch | `98e410390472e0f6` | 9 | 144 | 30,126 |
| modern-en | Modern English | `789863ff9c80db5b` | 9 | 144 | 29,003 |
| modern-da | Moderne Dansk | `1327a6cd7eed7244` | 9 | 144 | 28,476 |

`core_key_en = original-en`; `en_editions_aligned = true`; no paragraph-count mismatches, no
truncations, no empty paragraphs, `last_chapter_suspiciously_short = false`. Phase 1 mean
weighted similarity **0.7917**, `pct_identical_long_paragraphs` **0.0** — the lowest identical
rate and (with `the-prince`) the most genuinely rewritten edition in this batch.

## Provenance of the core English text

John Veitch's translation (first published 1850s; the 1901 printing is the one cited). Complete
and in the standard nine-part shape: Letter of Dedication to the Sorbonne, Preface to the Reader,
Synopsis, and Meditations 1–6. It does **not** include the Objections and Replies — normal for a
standalone *Meditations*, and not a truncation.

Veitch's apparatus is preserved correctly in `modern-en`: his square brackets marking material
added from the 1647 French edition (e.g. "[and am happily disturbed by no passions]",
"[i.e. participates by representation in so many degrees of being and perfection]") survive, as
do his "(Fr.)" source markers and his parenthetical Latin ("(pronunciatum)").

## Phase 1 flags: confirmed / disconfirmed

No flags were raised, and my own measurements agree that this is the healthiest book in the
batch. Word-token sequence retention against Veitch, per chapter:

| file ch | section | % of Veitch's word-tokens retained verbatim |
|---|---|---|
| 1 | Letter of Dedication | 76.8 |
| 2 | Preface to the Reader | 75.8 |
| 3 | Synopsis | 79.1 |
| 4 | Meditation 1 | 73.7 |
| 5 | Meditation 2 | 82.7 |
| 6 | Meditation 3 | 86.9 |
| 7 | Meditation 4 | 87.2 |
| 8 | Meditation 5 | 84.9 |
| 9 | Meditation 6 | 87.5 |
| — | **whole book** | **84.0** |

Unlike the other four books in my batch, there is **no effort-decay cliff** — the range is 74–88%
and the later Meditations are only modestly less rewritten than the earlier ones. Zero paragraphs
of ≥30 words are ≥0.97 character-similar to the source. This edition was actually finished.

## Samples inspected (9 locations, ~2,900 source words)

### 1. Front matter — Synopsis (file ch3), para 2
Source: "But yet, since I was there desirous to avoid the use of comparisons taken from material
objects, that I might withdraw, as far as possible, the minds of my readers from the senses,
numerous obscurities perhaps remain…"
Modern: "But since I was there anxious to avoid comparisons drawn from material objects — so as to
withdraw the reader's mind from the senses as much as possible — numerous obscurities perhaps
remain…"
**Finding:** faithful; the workman/machine analogy and the "objective (i.e. representative)
perfection" gloss both survive, including Veitch's bracketed explanation of *objective reality*.
Clean.

### 2. Opening — Meditation 1 (file ch4), para 0
Source: "SEVERAL years have now elapsed since I first became aware that I had accepted, even from
my youth, many false opinions for true… To-day, then, since I have **opportunely** freed my mind
from all cares [and am happily disturbed by no passions]…"
Modern: "Several years have now passed since I first noticed that, even from my youth, I had
accepted many false opinions as true… Today, then, since I have **happily** freed my mind from
all cares [and am happily disturbed by no passions]…"
**Finding:** good modernization overall, but one local blemish: "opportunely" (*opportune* — at a
convenient moment) becomes "happily," which both loses the temporal sense and creates an
immediate repetition with Veitch's bracketed "happily disturbed by no passions" in the same
sentence. **Local, one word, trivially fixable.**

### 3. Opening — Meditation 1 (file ch4), paras 1–2 (the method of doubt)
Source: "…as even now my reason convinces me that I ought not the less carefully to withhold
belief from what is not entirely certain and indubitable, than from what is manifestly false, it
will be sufficient to justify the rejection of the whole if I shall find in each some ground for
doubt."
Modern: "Even now my reason convinces me that I ought to withhold belief no less carefully from
what is not entirely certain and indubitable than from what is plainly false. So it will be enough
to justify rejecting them all if I find in each some ground for doubt."
**Finding:** the logical structure is preserved exactly — the *no less than* comparison, the
foundations-and-edifice image, "it will be enough… if I find in each some ground for doubt" (not
"if I find in some"). Faithful and much easier to parse.

### 4. Early — Meditation 2 (file ch5), para 2 (*I am, I exist*)
Source: "But I had the persuasion that there was absolutely nothing in the world… was I not,
therefore, at the same time, persuaded that I did not exist? Far from it; **I assuredly existed,
since I was persuaded.**… this proposition (pronunciatum) I am, I exist, is necessarily true each
time it is expressed by me, or conceived in my mind."
Modern: "But I had convinced myself that there was nothing in the world… was I not therefore also
convinced that I did not exist? Far from it: **I certainly did exist, since I was the one being
convinced.**… this proposition (pronunciatum) — I am, I exist — is necessarily true each time it
is spoken by me, or conceived in my mind."
**Finding:** "since I was the one being convinced" adds three words not in Veitch. It is a
*clarifying* addition — Veitch's "since I was persuaded" is ambiguous in modern English between
"I was convinced [of something]" and "I was the thing doing the being-convinced," and Descartes
means the latter. I judge this **within the standard** ("prefer a familiar accurate equivalent")
rather than an invention, but flag it as a borderline case for the independent reviewer: it is
the modernizer supplying a reading. The rest of the passage — the deceiver, "he can never bring
it about that I am nothing," the *pronunciatum* — is exact.

### 5. Middle / hardest passage — Meditation 3 (file ch6), paras 13–14 (the causal principle;
formal, objective and eminent reality)
Source: "…the more perfect, in other words, that which contains in itself more reality, cannot be
the effect of the less perfect; and this is not only evidently true of those effects, whose
reality is actual or **formal**, but likewise of ideas, whose reality is only considered as
**objective**… unless it be produced by that which possesses in itself, formally or **eminently**,
all that enters into its composition…"
Modern: "…the more perfect — that is, what contains in itself more reality — cannot be the effect
of the less perfect. And this is plainly true not only of those effects whose reality is actual or
**formal**, but also of ideas, whose reality is considered only as **objective**… unless it is
produced by something that possesses in itself, formally or **eminently**, all that enters into
its composition…"
**Finding:** this is the densest argument chain in the book and I tracked it clause by clause.
Every step survives and in the right order: the causal adequacy principle; the extension from
formal to objective reality; the stone and the heat examples; the "no other formal reality than
that which it borrows from our consciousness, of which it is but a mode"; the anti-infinite-regress
step to a first idea/archetype in para 14. **No omission, no inversion, no dropped qualification.**
The scholastic terms *formal* / *objective* / *eminently* are **not** glossed — but Veitch's own
bracketed "[or by representation]" beside "objectively" does the essential work, and the
modernizer kept it. I count this as adequate rather than a gap.

### 6. Middle — Meditation 4 (file ch7), para 3 (why a good God permits error)
Source: "…I am, as it were, a mean between God and nothing… And I hence discern that error, so far
as error is not something real, which depends for its existence on God, but is simply defect…"
Modern: "…I am, as it were, a mean between God and nothing… From this I see that error, insofar as
it is error, is not something real that depends for its existence on God, but is simply a
defect…"
**Finding:** Veitch's sentence is garbled ("that error, so far as error is not something real,
which depends…"). The modern version repairs it to the sense Descartes plainly intends, matching
the *privatio* doctrine. Good repair, not invention. The whole chain — all I have is from God →
therefore I should never err → but I do err → the negative idea of nothing → error as defect, not
positive faculty — is intact.

### 7. Late — Meditation 5 (file ch8), paras 6–7 (the ontological argument)
Source (7): "…and, therefore, although all the conclusions of the preceding Meditations were
false, the existence of God would pass with me for a truth at least as certain as I ever judged
any truth of mathematics to be."
Modern (7): "And therefore, even if all the conclusions of the previous Meditations were false,
the existence of God would still pass with me as a truth at least as certain as I ever judged any
truth of mathematics to be."
Source (8): "…so that it is not less impossible to conceive a God, that is, a being supremely
perfect, to whom existence is **awanting**, or who is devoid of a certain perfection, than to
conceive a mountain without a valley."
Modern (8): "So that it is no less impossible to conceive a God — that is, a supremely perfect
being — to whom existence is **wanting**, or who is devoid of a certain perfection, than to
conceive a mountain without a valley."
**Finding:** the mountain-and-valley and triangle analogies survive exactly, the counterfactual
"even if all the conclusions of the previous Meditations were false" keeps its force, and the
essence/existence distinction is stated in the same order. Veitch's Scotticism "awanting" is
corrected to "wanting" — a genuine, minimal modernization. Clean.

### 8. Late — Meditation 6 (file ch9), para 22 (phantom-limb pain, the dropsical man)
Source: "…if there is any cause which excites, not in the foot, but in some one of the parts of
the nerves that stretch from the foot to the brain… pain will be felt, as it were, in the foot…
And if it sometimes happens that the parchedness of the throat does not arise, as is usual, from
drink being necessary for the health of the body, but from quite the opposite cause, as is the
case with the dropsical…"
Modern: "…if there is any cause that excites — not in the foot, but in some part of the nerves that
stretch from the foot to the brain… pain will be felt as if in the foot… And if it sometimes
happens that the parched throat does not arise, as usual, from drink being necessary for the
health of the body, but from quite the opposite cause, as is the case with the dropsical…"
**Finding:** both illustrations survive with their comparative judgment ("far better that it should
be deceptive in that instance than if… it were continually fallacious"). Clean.

### 9. Ending — Meditation 6 (file ch9), para 23 (the dream argument answered; last paragraph)
Source: "…our memory can never connect our dreams with each other and with the course of life, in
the way it is in the habit of doing with events that occur when we are awake… we must, in
conclusion, ac. knowledge the weakness of our nature."
Modern: "…our memory can never connect our dreams with each other, and with the course of life, in
the way it usually does with events that occur when we are awake… we must, in conclusion,
acknowledge the weakness of our nature."
**Finding:** the whole closing argument survives — the memory-coherence criterion, the sudden
apparition thought-experiment, the three-faculty concurrence test, "since God is no deceiver," and
the final concession about the necessities of action. The modern edition also silently fixes an OCR
artefact in our source file ("ac. knowledge" → "acknowledge"), which means someone was reading the
actual text closely. **Ending intact.**

## Summary

- **No substantive omission, no content shifted between chapters, no altered logical relationship
  found in any of the nine samples.** Argument-chain fidelity — the specific high-stakes risk
  flagged for this book — is the edition's strongest quality.
- Two silent *repairs* of genuine defects in Veitch (Meditation 4 para 3; the "ac. knowledge" OCR
  artefact) and one borderline clarifying addition (Meditation 2 para 2).
- One trivial local blemish: "opportunely" → "happily" in the first sentence of Meditation 1.
- Veitch's editorial apparatus (French-edition brackets, "(Fr.)" markers, Latin parentheticals) is
  preserved throughout rather than silently absorbed or dropped.
- Effort is even across the book; there is no unmodernized tail.

## Phase 3 — human-edition research

| candidate | date | completeness | rights | evidence |
|---|---|---|---|---|
| John Veitch (current core) | 1850s / 1901 printing | complete (Dedication, Preface, Synopsis, Meds 1–6) | **public domain**, US and EU | Veitch d. 1894 → EU life+70 expired 1964. |
| Elizabeth S. Haldane & G.R.T. Ross | 1911, Cambridge UP | complete | **public domain** (US; EU term turns on Haldane d. 1937 / Ross — Haldane's own term expired 2007) | Fetched the IEP/Boston University copy: https://people.bu.edu/wwildman/courses/wphil/readings/wphil_rdg21_meditations_entire.htm — page states "The copy text for this file is the 1911 edition of *The Philosophical Works of Descartes* (Cambridge University Press), translated by Elizabeth S. Haldane." Also on Wikisource and Internet Archive (https://archive.org/details/philosophicalwor01desc). **I read samples and it is not more accessible than Veitch**: Meditation 1 opens "It is now some years since I detected how many were the false beliefs that I had from my earliest youth admitted as true, and how doubtful was everything I had since constructed on this basis" — same Edwardian register. It would be a lateral move, not an improvement, and would cost a full re-alignment of 144 paragraphs × 3 editions. |
| Jonathan Bennett, *Early Modern Texts* | c. 2005–2017 | complete | **noncommercial — NOT usable** | https://www.earlymoderntexts.com/faqs/rights (fetched): "The texts are copyrighted by Jonathan Bennett… Permission is not and will not be given for the texts to be put to any commercial use." Editorially this is the closest existing analogue to what our modern-en already achieves — but it is rights-blocked for a paid product, and our edition is comparably clear, so nothing is lost. |
| Donald Cress (Hackett), John Cottingham (Cambridge), Michael Moriarty (Oxford), Desmond Clarke (Penguin) | 1979–2008 | complete | **in copyright** | Commercial editions; no reuse licence. |

**Conclusion:** the PD field is Veitch and Haldane & Ross, both Victorian/Edwardian and of similar
difficulty; the readable free alternative (Bennett) is noncommercial-only; the readable paid
alternatives are copyrighted. Our modern-en is already clearer than every rights-clear human
option. **No change of source text warranted.**

## Ratings

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 5 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 4 |
| naturalness | 5% | 5 |

Weighted score **4.7** — band **Strong**.

Voice 4: Descartes' first-person meditative hesitation ("I hesitate, however, for what follows
from that?") is preserved well, but a few of Veitch's longer self-interrupting periods are split
into tidier sentences, which slightly reduces the sense of a mind thinking in real time.
Restraint 4 rather than 5 because of the borderline clarifying addition in Meditation 2.

## Recommendation

**KEEP CURRENT MODERN EDITION** — confidence **medium-high**, correction scope **local**.

This is the best modern-en in my batch. It is the only one of the five that was finished evenly
across the whole book, and it handles the two things that matter most for this text — the
argument chains and Veitch's bracketed French-edition apparatus — correctly.

Why a modernization is needed at all: Veitch is accurate but his sentences run 60–100 words with
stacked subordination ("as even now my reason convinces me that I ought not the less carefully to
withhold belief from…"), and modernizing them demonstrably does not cost any of Descartes'
argumentative precision.

Optional local polish (not blocking): restore "opportunely" in Meditation 1 para 0; consider
whether "since I was the one being convinced" in Meditation 2 should be pulled back toward Veitch;
optionally add one brief first-use gloss for *formal* / *objective* / *eminently* reality in
Meditation 3 (Veitch's bracket covers "objectively" but not "formally" or "eminently").

## Limitations of this review

Nine passage locations (~2,900 source words of 30,126, ~9.6%) plus whole-book mechanical analysis
(per-paragraph and per-chapter token retention, near-identical-paragraph census). I read the
Synopsis section 3; Meditation 1 paras 0–2; Meditation 2 paras 2 and 7; Meditation 3 paras 13–14;
Meditation 4 para 3; Meditation 5 paras 6–7; Meditation 6 paras 22–23. I did **not** read the
Letter of Dedication or the Preface to the Reader in connected prose, did not read the wax
argument in Meditation 2 or the mind/body distinctness argument in Meditation 6 in connected
prose, did not check the Danish edition, and did not compare against the Latin or the 1647
French.
