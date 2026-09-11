# the-manual — The Manual (Enchiridion), Epictetus

**Scope:** public. Audited 2026-09-11.

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `23835259e0a0d522` | 52 | 68 | 8,111 | "Long (1877)", translator `George Long`, year `1877` |
| modern-en | `2ac0db1347defd5b` | 52 | 68 | 6,221 | "Modern English" |
| modern-da | `08b3e433b8b9c74c` | 52 | 68 | 6,508 | "Moderne Dansk" |

Mechanical comparison: mean weighted similarity **0.3399** (by far the lowest in this batch — a
genuine re-expression, not a find-and-replace), identical long paragraphs **0.0%**, 1 truncation
flag (ch10 ¶0, ratio 0.59), 0 empty paragraphs, alignment intact.

**Provenance:** `original-en` matches George Long's 1877 Enchiridion, correctly attributed. Long's
text is heavily parenthesised — he glosses his own renderings inline, e.g. *"desire contains in it
the profession (hope) of obtaining…"*, *"On the occasion of every accident (event) that befalls
you"*, *"offices (magisterial power)"*. A large share of the 8,111 → 6,221 word drop is the modern
edition removing those editorial parentheses, not removing content. Complete (52 sections).

## Samples inspected (8) — near-full-text read

This is a short work; per the instructions I read essentially all of it, and record the eight
sections where something turned on the comparison.

### 1. Opening — Section 1

SRC: *"Of things some are in our power, and others are not. In our power are opinion, movement
towards a thing, desire, aversion, turning from a thing; and in a word, whatever are our acts."*
MOD: *"Some things are within our control, others are not. Within our control are our opinions,
impulses, desires, and aversions — in short, whatever is our own doing."*

**Finding — strong.** Long's four-term doublet ("movement towards a thing… turning from a thing")
collapses into the accurate technical pair "impulses… aversions". Nothing lost. Clear, natural,
keeps the imperative Stoic register.

### 2. Section 2 — the "reserve clause"

SRC: *"But employ only the power of moving towards an object and retiring from it; and these powers
indeed only slightly and with exceptions and with remission."*
MOD: *"Use only gentle impulse toward and away from things, held loosely and tentatively."*

SRC: *"Take away then aversion from all things which are not in our power, and transfer it to the
things contrary to nature which are in our power."*
MOD: *"Remove aversion from everything outside your control and redirect it toward what is genuinely
harmful within your control."*

**Finding — borderline.** "with exceptions" is Long rendering *meth' hupexaireseôs*, the Stoic
reserve clause; "held loosely and tentatively" reads well but dissolves a named doctrine rather than
glossing it. And "the things contrary to nature" → "what is genuinely harmful" substitutes an
interpretation for the source's term. Neither is a fabrication; both narrow the source.

### 3. Section 3

MOD: *"Whenever something pleases you, or meets a need, or that you love, remind yourself of its
nature."*

**Finding — naturalness slip.** "or that you love" does not parse against the preceding clauses. A
one-line copy-edit.

### 4. Section 10 — the one Phase 1 truncation flag (93 w → 55 w, ratio 0.59)

SRC: *"If you see a fair man or a fair woman, you will find that the power to resist is temperance
(continence). If labor (pain) be presented to you, you will find that it is endurance. If it be
abusive words, you will find it to be patience."*
MOD: *"If you see someone attractive, the resource available to you is self-restraint. If you face
hardship, it is endurance. If you are insulted, it is patience."*

**Flag DISCONFIRMED.** Every clause survives. The word loss is Long's parentheses ("(continence)",
"(pain)", "(event)") plus doublet compression. Not an omission. Minor: "the power to resist" →
"the resource available to you" softens the note of resistance.

### 5. Section 12 — "slave" → "servant"; "bad" → "lazy"

SRC: *"unless I chastise my slave, he will be bad… and it is better for your slave to be bad than
for you to be unhappy."*
MOD: *"If I don't discipline my servant he will become lazy… And it is better for your servant to be
lazy than for you to be miserable."*

**Finding — two substantive alterations.** (a) *slave* → *servant* is a softening of the text's
social reality, in a book written by a former slave. (b) *bad* (Gk. *ponêros*, wicked/worthless)
→ *lazy* narrows a moral term to a work-habit term, and does so twice.

Terminology check across the whole book: modern-en uses **"servant"** at §§12, 14, 29, 33 but
**retains "slave"** at §26 (*"When your neighbour's slave breaks a cup"*). So the substitution is not
even a consistent editorial policy — it is inconsistent naming, which the standard flags directly.

### 6. Section 24 — dropped specifics

SRC: *"They will not receive money from you, nor will you make them Roman citizens."*
MOD: *"They won't receive money from you, and you won't make them citizens."* (drops *Roman*)

SRC: *"see how unfair and silly you are"* → MOD: *"see how unfair you are"* (drops *and silly*)

SRC: *"What place then, you say, shall I hold in the city?"*
MOD: *"What role will you play?"* (drops *in the city* — the polis is the whole point of the passage)

SRC: *"Then you also cannot be useless to it."* → MOD: *"Then you can be useful to it."*
(litotes flattened to a plain positive)

**Finding — a cluster of small losses in one long section.** Individually trivial; together they
thin out the passage's concreteness.

### 7. Section 29 — the largest omission cluster in the book

SRC: *"they who at one time play at wrestlers, another time as flute players, again as gladiators,
then as trumpeters, then as tragic actors. So you also will be at one time an athlete, at another a
gladiator, then a rhetorician, then a philosopher…"*
MOD: *"a child who plays at being a wrestler one minute, a gladiator the next, then a trumpeter, then
an actor — you too will be an athlete today, a philosopher tomorrow, an orator the day after…"*
→ *flute players* dropped from the first list.

SRC: *"Thus some who have seen a philosopher and having heard one speak, as Euphrates speaks—and who
can speak as he does?—they wish to be philosophers themselves also."*
MOD: *"Someone sees a philosopher and hears him speak well, and immediately wants to become a
philosopher too."*
→ **Euphrates is deleted**, along with Epictetus's admiring aside about him. A named contemporary
Stoic and the only warm personal note in the section, gone.

SRC: *"Do you wish to be a pentathlete or a wrestler? Look at your arms, your thighs, examine your
loins."*
MOD: *"Do you want to be a wrestler? Look at your arms, your thighs."*
→ *pentathlete* and *examine your loins* dropped.

SRC: *"then a servant of the publicani, then a rhetorician, then a procurator (manager) for Cæsar"*
MOD: *"a philosopher today and a tax collector tomorrow"*
→ *rhetorician* and *procurator for Caesar* dropped; the Roman career ladder flattens to one item.

SRC: *"You must either exercise your skill on internal things or on external things; that is you must
either maintain the position of a philosopher or that of a common person."*
MOD: *"There is no combining them."*
→ the final defining clause (philosopher vs. common person) is replaced by a summary sentence not in
the source.

SRC: *"be despised by a slave, in everything have the inferior part, in honor, in office, in the
courts of justice, in every little matter"*
MOD: *"be looked down on by a servant, be last in everything — in status, in honor, in the courts"*
→ *in office* and *in every little matter* dropped.

**Finding — confirmed substantive omission, concentrated in the two longest sections (§24, §29).**
Epictetus's diatribe style is cumulative: the pile-up of trades, offices and body parts *is* the
argument. Trimming the lists is exactly the "missing substance concealed by fluent prose" failure.

### 8. Ending — Section 46 (sheep/wool) and Section 52 (the three maxims)

SRC §46: *"For even sheep do not vomit up their grass and show to the shepherds how much they have
eaten; but when they have internally digested the pasture, they produce externally wool and milk."*
MOD §46: *"Even sheep don't regurgitate their grass to show the shepherd how much they have eaten —
they digest it and produce wool and milk."*

SRC §52 ¶1: *"Lead me, O Zeus, and thou O Destiny… If I choose not, I make myself a wretch, and still
must follow."*
MOD §52 ¶1: *"Lead me, Zeus, and you too, Destiny… And if I refuse and prove base, I shall follow
nonetheless."*

**Finding — strong.** The image survives (not replaced by explanation), and Cleanthes' paradox — you
follow either way — lands cleanly. §52 ¶0 adds the word "three" (*"keep these three maxims ready"*)
where the source says only "these maxims"; three quotations do follow, so this is a small accurate
gloss rather than an invention.

## Phase 1 flags: confirmed vs. disconfirmed

- **Similarity 0.3399 — confirmed and healthy.** This is a real modernization, not a copy.
- **1 truncation flag (ch10 ¶0) — DISCONFIRMED.** Caused by removal of Long's inline parentheses.
- **77% word ratio (6,221 / 8,111) — mostly explained** by parenthesis removal and doublet
  compression, but §§24 and 29 show it is *partly* real omission.
- 0 empty paragraphs, 0 paragraph-count mismatches, 52/52 sections — confirmed complete at the
  structural level.

## Phase 3 — human-edition research

**Candidate A — Thomas Wentworth Higginson (1865)**, a revision of Elizabeth Carter's 1758 version.
- Text read at `https://www.gutenberg.org/files/45109/45109-h/45109-h.htm`.
- Samples: §1 *"There are things which are within our power, and there are things which are beyond
  our power."* §5 *"Men are disturbed not by things, but by the views which they take of things."*
  §17 *"Remember that you are an actor in a drama of such sort as the Author chooses…"*
- Clearly plainer than Long; §5 is the canonical crisp English rendering of the line.
- Rights: Higginson d. 1911 → **public domain in the US and EU/Denmark**. Caveat: *this particular
  PG file* is a transcription of a **1948 Liberal Arts Press** printing, whose added editorial matter
  may still be in copyright; the 1865 Higginson text itself is not. To use, source from an 1865/1890s
  printing (Internet Archive) rather than from this PG file. Also: the PG transcription runs to **51
  sections (I–LI)** and is therefore **not complete** against our 52-section structure.
- Status: **promising but requires a different source file**; rights on the 1865 translation are
  clear, rights on this specific digitisation are unclear.

**Candidate B — George Long (1877), Standard Ebooks "Short Works".**
- `https://standardebooks.org/ebooks/epictetus/short-works/george-long` — Enchiridion plus fragments.
- Rights: PD (Long d. 1879); Standard Ebooks production dedicated CC0. Fully rights-clear.
- But this is **the same translator as our existing `original-en`** — no readability gain. Useful
  only as a cleaner source file for the core text, not as a modern edition.

**Candidate C — Elizabeth Carter (1758).** PD, complete, but markedly more archaic than Long.
Rejected on readability.

**Candidate D — P. E. Matheson (1916).** PD in the US; Matheson d. 1960 → **not PD in Denmark/EU
until 2031**. Rejected on jurisdiction for a Denmark-based operator.

**Not viable:** Robin Hard (OUP 2014), Anthony Long (2018), Robert Dobbin (Penguin 2008) — all in
copyright.

**Conclusion:** no rights-clear human translation clearly beats the *existing* modern-en, which is
already the most readable English Enchiridion in play. The right move is to fix the existing edition,
not replace it.

## Ratings

| dimension | weight | score | note |
|---|---|---|---|
| fidelity / completeness | 40% | 3 | confirmed omissions concentrated in §§24, 29 (Euphrates, pentathlete, publicani/procurator, the philosopher-vs-common-person clause, several list items) |
| first-read clarity | 25% | 5 | excellent; genuinely removes the barrier |
| literary voice | 20% | 4 | crisp imperative Stoic voice well kept; the trimmed lists cost some diatribe momentum |
| restraint / no invention | 10% | 3 | slave→servant, bad→lazy, "contrary to nature"→"genuinely harmful", §29's substituted closing sentence |
| naturalness | 5% | 4 | one ungrammatical clause (§3) |

**Weighted score: 3.8.** **Band: Good with fixes.**

## Recommendation

**LIGHT EDIT** — confidence **high** (this is a 8,111-word work and I read essentially all of it;
this is the one book in my batch where "strong in samples" comes close to "verified").

**Correction scope: local.** Four scoped fixes:
1. **§29** — restore Euphrates and the aside about him; restore *flute players*, *pentathlete*,
   *examine your loins*, *rhetorician*, *procurator for Caesar*, *in office*, *in every little
   matter*; restore the closing *"either maintain the position of a philosopher or that of a common
   person"* in place of the substituted *"There is no combining them."*
2. **§24** — restore *Roman* citizens, *and silly*, *in the city*.
3. **Terminology** — settle *slave* vs *servant* one way across §§12, 14, 26, 29, 33. Recommend
   **slave**: it is what the Greek says, it is historically accurate, and Epictetus was one. Revert
   *bad* → *lazy* in §12.
4. **§3** — fix *"or that you love"*.

A confirmed substantive omission rules out an unqualified KEEP; but the defect is demonstrably
**local** (two long sections out of 52), so retranslation is not warranted.

## Limitations of this review

- Near-complete read of the English, but I did **not** check against the Greek. All fidelity calls
  are Long → modern-en. Where modern-en departs from Long it may occasionally be *closer* to the
  Greek than Long is; I cannot rule that out for the §2 "reserve clause" case in particular.
- I did not audit `modern-da`.
- I did not verify whether Long 1877 itself omits anything relative to the Greek Enchiridion.
- The Higginson rights caveat (1948 printing vs 1865 text) is stated from the PG metadata; I did not
  open an 1865 printing to confirm the text matches.
