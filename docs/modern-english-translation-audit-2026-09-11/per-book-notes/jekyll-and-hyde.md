# jekyll-and-hyde — Strange Case of Dr Jekyll and Mr Hyde, Robert Louis Stevenson (1886)

Batch B14. Reviewer: audit subagent, 2026-09-11.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en "Stevenson (1886)" | `dc134b812fa478e4` | 10 | 339 | 25,531 |
| modern-en "Modern English" | `308ad53a5c88f4b7` | 10 | 339 | 25,372 |
| modern-da "Moderne Dansk" | `5cf16e3333eefe1e` | 10 | 339 | 24,511 |

`en_editions_aligned: true`; no count mismatches; 0 truncated; 0 empty; mean
weighted similarity 0.9194; `pct_identical_long_paragraphs` **12.9**.

## Provenance of the core English text

English original, public domain worldwide. Ten-chapter division matches the
1886 Longmans text. Typography consistent curly-quote in both English editions.

## Phase 1 flags: confirmed / disconfirmed

**The 12.9% identical-paragraph flag is legitimate and does not indicate a
light/mechanical false modernization.** Only **5.5% of source words** sit in
byte-identical paragraphs (1,396 of 25,531), and typographic normalization does
not change that figure at all — unlike `heart-of-darkness` in this batch, both
editions here use the same quote conventions, so the mechanical number is
honest.

Per-chapter word-level identity is low and *even*, with no taper:

```
ch 1  3%    ch 2  6%    ch 3  1%    ch 4  1%    ch 5  10%
ch 6  1%    ch 7  21%   ch 8  15%   ch 9  6%    ch 10  0%
```

The two highest chapters (7 and 8) are the most dialogue-heavy; identity there
is short exchanges that are already modern ("'I hope not,' said Utterson. 'Did
I ever tell you that I once saw him, and shared your feeling of repulsion?'").
Chapter 10, the hardest prose in the book, is 0% identical. This is a real,
consistent, whole-book modernization pass — the only one in batch B14 with no
untreated region.

Disconfirmed: no truncation, no empty paragraphs, no paragraph drift. A
length-ratio scan of every paragraph ≥40 source words found **zero** outliers
— nothing omitted or padded.

## Mystery-structure check (the batch-specific risk)

**Passed.** I scanned every paragraph of `modern-en` chapters 1–8 for
twist-revealing vocabulary absent from the corresponding source paragraph
("same man", "same person", "transform", "turned into", "was Hyde", "identity",
"other self", "alter…"). One hit, and it is not a reveal:

Source ch2 p36: "is it the mere radiance of a foul soul that thus **transpires
through, and transfigures, its clay continent**?"
Modern ch2 p36: "is it the mere radiance of a foul soul that **shines through
and transforms its clay shell**?"

"Transforms" here renders Stevenson's "transfigures" and refers to Hyde's own
body, exactly as the source does. Nothing in chapters 1–8 states, implies, or
foreshadows the identity of Jekyll and Hyde earlier than Stevenson does.
Utterson's wrong theory (blackmail over a youthful indiscretion) is preserved
intact, which is what protects the structure.

## Samples inspected (5)

### 1. Opening — Chapter 1 (Story of the Door), paras 0–5

Source p0: "Mr. Utterson the lawyer was a man of a rugged **countenance** that
was never lighted by a smile; cold, **scanty and embarrassed in discourse;
backward in sentiment**… He was austere with himself; drank gin when he was
alone, **to mortify a taste for vintages**."

Modern p0: "Mr. Utterson the lawyer was a man of rough features that never lit
up with a smile—cold, **sparing, and awkward in conversation; reserved in
feeling**… He was strict with himself: he drank gin alone, **to discipline his
taste for fine wines**."

Source p2: "the shop fronts stood along that thoroughfare with an air of
invitation, **like rows of smiling saleswomen**… the street shone out in
contrast to its dingy neighbourhood, **like a fire in a forest**."
Modern p2: both similes kept verbatim.

Finding: **strong.** This is the sample that justifies the edition's existence.
Stevenson's opening is genuinely hard Victorian prose — nominalised abstractions
("backward in sentiment"), buried metaphors ("mortify a taste for vintages") —
and the modernization untangles it without losing a single image. "Ivy"
(p1), "the chief jewel of each week" (p1), "like rows of smiling saleswomen"
and "like a fire in a forest" (p2) all survive. Cain's heresy survives.

### 2. Chapter 2 (Search for Mr. Hyde), para 36 — the mechanical outlier chapter

Discussed above. Also: source's run-on semicolon chain describing Hyde ("Mr.
Hyde was pale and dwarfish, he gave an impression of deformity without any
nameable malformation, he had a displeasing smile…") is repunctuated into
semicolons plus a sentence break, which is a clarity gain with no loss.

Finding: **strong**, with the transfigure/transform note as a watch-item only.

### 3. Chapter 4 (The Carew Murder Case), paras 2–4 — violence-handling check

Source: "he shot out a solemn lip"; modern: "he set his lip solemnly". Source:
"his eye lighted up with **professional ambition**"; modern: "his eye lit up
with **professional ambition**" (preserved — the ugly detail is the point).
Source: "And he briefly **narrated** what the maid had seen"; modern:
"**described**".

Finding: **strong.** The murder scene's brutality and the officer's
careerism are untouched.

### 4. Chapter 7 (Incident at the Window), paras 0–4 — highest-identity chapter

Source p1–p3 and modern p1–p3 are word-for-word identical ("'It was impossible
to do the one without the other,' returned Enfield. 'And by the way, what an
ass you must have thought me…'"). Changes elsewhere are minimal ("by-street" →
"side street", "if that be so" → "if that is so", "I am uneasy" → "I'm
uneasy").

Finding: **strong / legitimate identity.** Stevenson's dialogue is already
modern; leaving it is correct.

### 5. Chapter 10 (Henry Jekyll's Full Statement of the Case), paras 0–3 — the
hardest passage in the book

Source p1: "Enough then, that I not only recognised my natural body **from** the
mere aura and effulgence of certain of the powers that made up my spirit, but
managed to compound a drug…"

Modern p1: "Enough then that I not only recognised my natural body **as** a
mere aura and effulgence of certain of the powers that made up my spirit, but
managed to compound a drug…"

Finding: **failing, and substantive.** Stevenson's "recognised X **from** Y"
means *told apart, distinguished*: Jekyll learned to separate the physical body
from the spiritual powers, which is the precondition for separating the two
selves at all. The modern text reverses this into an identity claim — the body
**is** the aura. That inverts the central metaphysical proposition of Jekyll's
confession, in the sentence that explains how the drug can work. This is a
one-word error with outsized consequences and it belongs in the "altered
logical relationships" category, not the "changed wording" category.

Second, minor, same passage — source p0: "the unjust **might** go his way,
delivered from the aspirations and remorse of his more upright twin"; modern:
"the unjust **could** go his way, **freed from**…". Possibility → ability;
trivial on its own but the same class of slip.

Third observation on this chapter: it is the *least* modernized in register
despite being 0% byte-identical. "Faggots", "polity of multifarious,
incongruous and independent denizens", "effulgence", "immaterial tabernacle",
"the perennial war among my members", "scruple of an overdose" all survive
unglossed. That is arguably correct restraint — the chapter is a period
scientific confession and its diction is characterisation — but a reader who
came for "Modern English" gets the least help exactly where the book is
hardest.

## Editorial judgement on the identical-paragraph question

The brief asked whether Stevenson's 12.9% identity is the "already plain" case
or the wealth-of-nations false-modernization case. **It is the already-plain
case, and the edition is sound.** The evidence is that identity clusters in
dialogue chapters and is zero in the two hardest narrative chapters (4 and 10),
which is precisely the distribution you would expect from a competent human
editor. Contrast `jungle-book` in this batch, where identity clusters into one
100%-untreated chapter, and `the-awakening`, where it clusters into the last
third of the book.

## Human-edition research

English original, public domain worldwide; no translation involved. Standard
Ebooks publishes a CC0-dedicated transcription (Standard Ebooks production work
is dedicated to the public domain via CC0 1.0; the 1886 text is PD). Our
`original-en` shows no defect — consistent typography, no PG boilerplate, 339
paragraphs across the canonical 10 chapters — so no replacement is indicated.

**Status: not researched further (English original already accessible).**

## Ratings

| dimension | weight | rating |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 4 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 4 |

Weighted score **4.1** — band **Good with fixes**.

Fidelity is 4, not 5, entirely because of the ch10 p1 "from" → "as" reversal;
that single defect is serious enough to rule out an unqualified KEEP, per the
audit rubric. Everything else I inspected is faithful.

## Recommendation

**LIGHT EDIT.**

1. Fix ch10 p1: restore "recognised my natural body **from** the mere aura and
   effulgence…". This is a one-line change and it matters.
2. Fix ch10 p0 "could go his way" → "might go his way".
3. Optional: reconsider whether chapter 10 should receive a somewhat firmer
   pass, or whether its Victorian diction should be supported with glosses
   ("faggots" = bundles of sticks; "tabernacle" = dwelling/body; "members" =
   limbs/faculties) instead. Either is defensible; the current state — 0%
   identical but still substantially Victorian — is the least coherent of the
   three options.

- **Confidence: medium-high.** 5 passages read closely across 10 chapters, plus
  an exhaustive mechanical pass over all 339 paragraph pairs and a targeted
  keyword scan of chapters 1–8 for twist leakage. The ch10 finding is certain;
  the claim that no *other* comparable slip exists in the 5 unread chapters is
  not verified.
- **Correction scope: local.**

## Limitations of this review

- Chapters 3, 5, 6, 8 and 9 were scanned mechanically but not read as connected
  prose. Chapter 8 ("The Last Night", 99 paragraphs, the longest narrative
  chapter) is the biggest unread block.
- The twist-leakage scan was keyword-based; a reveal phrased without any of my
  search terms would have been missed.
- I did not check `modern-da`.
- I did not check onboarding/cast JSON or audio.
