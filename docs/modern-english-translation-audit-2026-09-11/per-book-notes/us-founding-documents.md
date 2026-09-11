# us-founding-documents — The US Founding Documents, "Various (Jefferson, Madison, et al.)"

**Scope:** public. Audited 2026-09-11. Batch B20.

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | sections | label |
|---|---|---|---|---|---|---|
| original-en | `0972836459be1c06` | 4 | 153 | 8,851 | 4 | "Original (1776–1992)" |
| modern-en | `4c6888a7cc0b24e1` | 4 | 153 | 8,777 | 4 | "Modern English" |
| modern-da | `cfd2e1fea5633659` | 4 | 153 | 7,854 | 4 | "Moderne Dansk" |

Mechanical comparison: mean weighted similarity **0.7786**, identical long paragraphs **1.5%**, 0
truncations, 0 empty paragraphs, alignment intact.

Note the registry claims `wordCount: 22000`; the actual corpus is **8,851 words**. The registry
figure is wrong by a factor of 2.5 and should be corrected (cosmetic, but it drives the reading-time
estimate a reader sees).

## What is actually in the book — verified by reading the chapter list directly

| ch | title | paras | words |
|---|---|---|---|
| 1 | Declaration of Independence | 33 | 1,334 |
| 2 | Constitution | 93 | 4,420 |
| 3 | Bill of Rights | 10 | 482 |
| 4 | Later Amendments | 17 | 2,615 |

`sections` = `[{Declaration of Independence (1776), [1]}, {Constitution (1787), [2]}, {Bill of Rights
(1791), [3]}, {Later Amendments (1795–1992), [4]}]`.

- Chapter 3 holds Amendments **I–X**, one per paragraph.
- Chapter 4 holds Amendments **XI–XXVII**, one per paragraph, in order, none missing.
- **The "1992" in the label is the ratification of the 27th Amendment.** Confirmed: ch4 ¶16 is
  Amendment XXVII ("No law varying the compensation for the services of the Senators and
  Representatives will take effect until an election of Representatives has intervened"). The label
  is accurate. The registry description ("and every Amendment since") is also accurate.

**Completeness gaps (both English editions, inherited from `original-en`):**
1. The **Declaration's signatories are absent** — ch1 ends at "…our Lives, our Fortunes, and our
   sacred Honor." with no signature block.
2. The **Constitution's signatories are absent** — ch2 ¶92 ends at "…we have hereunto subscribed our
   names," with a trailing comma and nothing after it. The dangling comma makes the truncation
   visible to a reader.
3. Article headings are inconsistent in `original-en`: "Article 1", "ARTICLE 2", "ARTICLE THREE",
   "ARTICLE FOUR"… `modern-en` normalises these to "Article 1"…"Article 7", which is an improvement.

## Samples inspected (7)

### 1. Opening — Declaration ¶1–2

SRC: *"When in the Course of human events, it becomes necessary for one people to dissolve the
political bands which have connected them with another… a decent respect to the opinions of mankind
requires that they should declare the causes which impel them to the separation."*
MOD: *"When, in the course of human events, one people must dissolve the political bonds tying them
to another and take their separate, equal place among the world's powers — the place to which the
Laws of Nature and of Nature's God entitle them — a basic respect for the opinions of humankind
requires that they declare the reasons that compel them to separate."*

**Finding — strong.** Complete, keeps the capitalised terms of art, improves the sentence's
architecture with an em-dash appositive. Only loss worth naming, in the next paragraph: *"pursuing
invariably the same Object"* → *"all aimed at the same object"* drops *invariably*, a qualifier
doing real work in Jefferson's indictment (a *consistent* design, not an occasional one).

### 2. Ending — Declaration ¶31–32

SRC: *"We must, therefore, acquiesce in the necessity, which denounces our Separation…"*
MOD: *"We must therefore acquiesce in the necessity that announces our separation…"*

**Finding — strong, and a genuinely good call.** 1776 "denounces" here carries the Latin *denuntiare*
sense, "proclaims"; a modern reader hearing "denounces" would get it backwards. "Announces" is the
correct repair. Elsewhere in the same paragraph *"we have conjured them"* → *"we have urged them"*
loses force but not sense.

### 3. Constitution, Article I §§1–3 (ch2 ¶2–11) — the systematic defect

SRC ¶2: *"All legislative Powers herein granted **shall** be vested in a Congress of the United
States, which **shall** consist of a Senate and House of Representatives."*
MOD ¶2: *"All legislative powers granted here **will** be vested in a Congress of the United States,
which **will** consist of a Senate and a House of Representatives."*

SRC ¶3: *"…and the electors in each State **shall** have the qualifications requisite…"*
MOD ¶3: *"…and the electors in each State **must** have the qualifications required…"*

SRC ¶4: *"No Person **shall** be a Representative who **shall** not have attained to the Age of
twenty five Years…"*
MOD ¶4: *"No person **may** be a Representative who has not reached the age of twenty-five…"*

**Finding — failing, and it is the whole-book defect.** Counted across the corpus:

| | original-en | modern-en |
|---|---|---|
| `shall` | **307** | **0** |
| `will` | 5 | **249** |
| `must` | 1 | 3 |
| `may` | 46 | 44 |

Every mandatory `shall` has been removed, and the overwhelming default replacement is `will`, which
in English is predictive, not obligatory. Occasionally the same `shall` becomes `must` (correct for
a requirement) or `may` (correct for a prohibition) — so the edition *knows* the distinction exists
and applies it inconsistently. This is precisely the pitfall the brief asked me to check for, and it
is present at scale, not locally.

### 4. Constitution, Article I §9 (ch2 ¶44–51) — prohibitions turned into predictions

SRC ¶46: *"No Bill of Attainder or ex post facto Law **shall** be passed."*
MOD ¶46: *"No bill of attainder or ex post facto law **will** be passed."*

SRC ¶45: *"The Privilege of the Writ of Habeas Corpus shall not be suspended, unless when in Cases
of Rebellion or Invasion the public Safety **may require** it."*
MOD ¶45: *"The privilege of the writ of habeas corpus will not be suspended, unless when in cases of
rebellion or invasion the public safety **requires** it."*

**Finding — failing, two distinct errors in one sample.**
(a) "No bill of attainder… will be passed" reads as a forecast about Congress's behaviour rather
than a bar on its power. Nothing about the sentence is clearer than the original; the only change is
the one that costs meaning.
(b) *"may require"* → *"requires"* converts a permissive/contingent condition into a factual one.
The Suspension Clause's trigger condition is the thing courts argue about; narrowing "may require"
to "requires" is a substantive alteration. This is the reading standard's "possibility vs.
certainty" rule, broken in the single most litigated conditional in the document.

### 5. Bill of Rights — all ten amendments (ch3, read in full)

SRC ¶0: *"Congress **shall** make no law respecting an establishment of religion…"*
MOD ¶0: *"Congress **will** make no law respecting an establishment of religion, or prohibiting the
free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the
people peaceably to assemble, and to petition the government for a redress of grievances."*

SRC ¶1: *"…the right of the people to keep and bear Arms, **shall** not be infringed."*
MOD ¶1: *"…the right of the people to keep and bear arms **will** not be infringed."*

**Finding — failing, and this is the clearest single demonstration.** In the First Amendment the
*only* substantive change in the entire sentence is `shall` → `will`. "Respecting an establishment
of", "prohibiting the free exercise thereof", "abridging" — every genuinely archaic construction is
left standing. The edition made the one change that alters legal force and none of the changes that
would have helped a reader. The same holds for Amendments II, IV, VIII and IX.

Amendment V and VI are usefully re-broken into separate sentences (the modern edition splits the
Fifth's four "nor shall" limbs into four sentences), which is real clarity work — done on top of the
same `will` substitution.

### 6. Amendment XIV (ch4 ¶3) — the longest and most consequential amendment

SRC: *"No State **shall** make or enforce any law which **shall** abridge the privileges or
immunities of citizens of the United States; nor **shall** any State deprive any person of life,
liberty, or property, without due process of law; nor deny to any person within its jurisdiction the
equal protection of the laws."*
MOD: *"No State **will** make or enforce any law that abridges the privileges or immunities of
citizens of the United States; nor **will** any State deprive any person of life, liberty, or
property without due process of law; nor deny to any person within its jurisdiction the equal
protection of the laws."*

**Finding — borderline/failing.** Content complete across all five sections; Section 3's
insurrection clause, Section 4's debt clause and the "loss or emancipation of any slave" language
are all intact and unsoftened. Same `shall`→`will` problem. One small loss: *"but all such debts,
obligations and claims shall be held illegal and void"* → *"all such debts, obligations, and claims
will be held illegal and void"* drops the adversative *but*.

### 7. Mechanical outlier / hardest passage — Article I §2 ¶5, the three-fifths clause

SRC: *"…which shall be determined by adding to the whole number of free Persons, including those
bound to Service for a Term of Years, and excluding Indians not taxed, three fifths of all other
Persons. The actual Enumeration shall be made… in such Manner as **they** shall by law Direct."*
MOD: *"…determined by adding to the whole number of free persons, including those bound to service
for a term of years and excluding Indians not taxed, three-fifths of all other persons. The actual
enumeration will be made… in such manner as **Congress** directs by law."*

**Finding — strong on restraint, borderline on method.** The euphemism ("all other Persons",
"bound to Service") is left exactly as the framers wrote it — correct; softening or explaining it
would be a worse fault. Resolving the ambiguous "they" to "Congress" is a silent interpretive
resolution, but it is the standard reading and it removes a genuine stumble. This is the kind of
help the edition *should* be giving, and mostly is not.

### Glossing: essentially absent

I counted parenthetical glosses across the whole `modern-en`: **six**, of which four also exist in
`original-en` ("(or affirm)", "(not exceeding ten miles square)", "(except on a question of
adjournment)", "(when the legislature cannot be convened)"). The edition adds **no explanatory
glosses at all**. Terms left standing with no help, counts in `modern-en`: *emolument* ×3,
*attainder* ×3, *capitation* ×1, *letters of marque* ×2, *corruption of blood* ×1, *pro tempore* ×5,
*ex post facto* ×2, *quorum* ×4, *impost* ×4, *tonnage* ×1, *presentment* ×1, *habeas corpus* ×1.
These are the actual reader barriers in this book, and none of them is touched.

## Phase 1 flags — confirmed / disconfirmed

- **Similarity 0.7786 → CONFIRMED** and now explained: it is high because the edition's dominant
  operation is a single lexical substitution (`shall`→`will`) plus sentence-splitting.
- **1.5% identical long paragraphs (30 of 8,851 words, all in the Bill of Rights) → CONFIRMED.**
  Amendment X is reproduced verbatim — correctly, since it contains no `shall`.
- **0 truncations → CONFIRMED as an alignment matter, but DISCONFIRMED as a completeness claim:**
  both signature blocks are missing from `original-en` and therefore from all editions. Phase 1
  cannot see this because it compares editions to each other.
- **Alignment intact → CONFIRMED** (153/153, one legal unit per paragraph throughout).

## Phase 3 — human-edition research

**Not researched as a translation problem — these are English originals, and the rights position is
clean.** The Declaration, Constitution and Amendments are US federal documents, long in the public
domain worldwide; the standard transcriptions (National Archives, archives.gov) are US-government
works. No licensing exposure in either direction.

The Phase 3 question that *does* apply is the first one the instructions pose: **does the original
already meet our reading standard?** For this corpus the answer is a qualified yes. The Declaration
is 1,334 words of famously lucid prose. The Constitution and Amendments are harder, but their
difficulty is **terminological and structural**, not syntactic — the sentences are long but not
tangled, and what defeats a modern reader is *emolument*, *attainder*, *capitation*, *letters of
marque*, *corruption of blood*, and the numbering. That is a gloss problem, not a rewrite problem.
And these texts have a property almost nothing else in the library has: **their exact wording is
itself the object of study**. A reader who quotes our text in an argument must be quoting the real
text.

**No human "modern English Constitution" candidate was sought or is needed.** I am not aware of a
rights-clear, complete, authoritative modernisation, and more importantly I do not think one should
be used: any modernisation of an operative legal text carries the same class of risk we just found.
Say this as "none sought", not "none exists".

## Ratings

| dimension | score | note |
|---|---|---|
| fidelity/completeness (40%) | **2** | 307 mandatory `shall` → 0, mostly to predictive `will`; "may require" → "requires" in the Suspension Clause. Recurring, corpus-wide, legally substantive. Content otherwise complete. |
| first-read clarity (25%) | **3** | Real gains from sentence-splitting and heading normalisation; zero gains on the terms that actually stop readers. |
| literary voice (20%) | **4** | Declaration's cadence preserved well; constitutional register intact. |
| restraint / no invention (10%) | **4** | Very little invented. "They"→"Congress" is the only interpretive resolution I found, and it is correct. |
| naturalness (5%) | **4** | Reads cleanly. |

**Weighted score: 3.0 — band: Mixed.**

## Recommendation

**SOURCE + GLOSSES** — confidence **high**.

Reasoning: the modern edition's one systematic transformation is the one that costs legal meaning,
and it buys essentially no readability in exchange; meanwhile the barriers that genuinely stop a
modern reader (a dozen terms of art) are untouched. The product a reader of these four documents
actually needs is the authentic text plus a gloss layer — the same gloss layer the `magna-carta`
modern edition already demonstrates we know how to build.

If the three-editions-per-book policy makes retiring `modern-en` impractical, the fallback is
**RETRANSLATE**, not LIGHT EDIT: restoring `shall` correctly is not a find-and-replace (each
instance is mandatory / prohibitory / conditional / future-declarative and needs deciding), and the
gloss layer has to be written from scratch.

**Correction scope: substantial.**

**Next action:** stop shipping `modern-en` as a legal text — either replace it with a glossed
presentation of `original-en`, or re-do the modal treatment instance-by-instance and add glosses for
the ~12 unexplained terms of art; separately, restore both signature blocks and fix the registry
`wordCount` (22,000 → ~8,900).

## Limitations of this review

- I read `original-en` and `modern-en` in full for chapters 1 and 3, and sampled chapters 2 and 4
  (Art. I §§1–3, §§8–9, Art. II, Art. VII closing; Amendments XIV and XXVII, plus the full opening
  line of every other amendment). I did not read every paragraph of Article I §8's enumerated powers
  or Articles IV–VI word-for-word.
- I did not read `modern-da` at all.
- I did not collate against the National Archives transcription character-by-character, so I cannot
  certify `original-en`'s fidelity to the engrossed texts beyond the passages quoted here.
- I did not check audio.
