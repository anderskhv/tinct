# around-the-world-80-days — Around the World in Eighty Days, Jules Verne (1872)

Batch B14. Reviewer: audit subagent, 2026-09-11. **The only translated work in
this batch.**

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en "George Towle (1873)", tr. George Towle | `e23ae1708c6e0365` | 37 | 1613 | 62,197 |
| modern-en "Modern English" | `13b90c0526762af9` | 37 | 1613 | 61,964 |
| modern-da "Moderne Dansk" | `2d9a0c994c7eac94` | 37 | 1613 | 59,272 |

`en_editions_aligned: true`; no count mismatches; 0 truncated; 0 empty; mean
weighted similarity 0.8393; `pct_identical_long_paragraphs` 6.9.

## Provenance and completeness of the core English text

The "original" here is not Verne — it is **George Makepeace Towle's 1873
English translation** of *Le Tour du Monde en Quatre-Vingts Jours* (first
English book publication, Sampson Low / Porter & Coates). Registry metadata
records this correctly (`translator: "George Towle"`, `year: 1873`).

**Completeness checks I actually ran:**

- **Chapter count:** our text has 37 chapters; Verne's French original has 37.
  No structural abridgement.
- **Chapter 1 content against the French:** I fetched the French Wikisource
  chapter 1 and compared. Every element is present in our Towle text — the
  Saville Row address, **the Sheridan reference** ("the house in which Sheridan
  died in 1814"), James Forster dismissed over shaving water at 84°F instead of
  86°F, Passepartout's list of former trades, the watch four minutes slow, the
  employment fixed at "twenty-nine minutes after eleven, a.m., this Wednesday,
  2nd October", and the two closings of the street door. This matters because
  Butcher and Evans cite the omission of the Sheridan reference as the standard
  example of Towle's liberties — **our printing retains it**, so we do not have
  the most-degraded Towle variant.
- **Word count against a known-complete transcription:** Standard Ebooks'
  Towle edition is 62,832 words; ours is 62,197. The difference is consistent
  with front/back matter, not with a missing chapter or scene.

**What I could not establish:** whether the *within-paragraph* fidelity of
Towle matches Verne. Scholarship is consistent that it does not fully. Kieran
O'Driscoll characterises Towle's style as "florid" with an "excessively ornate
prose style"; the standard reference table lists Towle 1873 as **"not complete
by modern standards"**, in contrast to Desages (1926), Baldick (1968), Butcher
(1995), Glencross (2004) and Walter (2010/2013), all listed as complete. I did
not do a paragraph-by-paragraph French comparison, so I cannot quantify the
gap.

## Phase 1 flags: confirmed / disconfirmed

The 6.9% identical-paragraph flag is legitimate and low. After typographic
normalization it is 8.0% of source words, spread across all 37 chapters with
no untreated block and no taper (range 0–37%, highest in the short
dialogue-heavy chapters 7, 8 and 37). This is a genuine whole-book pass —
unlike `the-awakening` and `heart-of-darkness` in this same batch.

Disconfirmed: no truncation, no empty paragraphs, no paragraph drift. A
length-ratio scan of every paragraph ≥40 source words found **zero** outliers.

**New flag found, not in Phase 1 — typographic seam.** `modern-en` uses curly
quotes in chapters 1–10, **ASCII straight quotes in chapters 11–30**, and curly
again in chapters 31–37. `original-en` is consistently curly across all 37.
This is reader-visible in the middle half of the book and is the clearest
evidence in this batch that the modern editions were generated in chapter
batches with inconsistent settings.

## Samples inspected (5)

### 1. Opening — Chapter 1, paras 0–7

Source p1: "**Certainly an Englishman, it was more doubtful whether** Phileas
Fogg was a Londoner… he had no public employment; he had never been entered at
any of the Inns of Court, **either at** the Temple, **or** Lincoln's Inn, **or**
Gray's Inn."

Modern p1: "**An Englishman, certainly. Whether he was a Londoner was less
clear.** … he held no public office; he had never been entered at any of the
Inns of Court—**not** the Temple, **not** Lincoln's Inn, **not** Gray's Inn."

Source p2: "Phileas Fogg was a member of **the Reform**, and that was all."
Modern p2: "Phileas Fogg was a member of **the Reform Club**, and that was all."

Finding: **strong.** The dangling-modifier opening of p1 is repaired without
loss; the triple negation improves the rhythm of Verne's list. The whole
catalogue of institutions Fogg does *not* belong to survives intact, including
the Entomologists "founded chiefly to abolish pernicious insects" — the joke
lands. "the Reform" → "the Reform Club" is a legitimate gloss at the point of
need, not an addition.

### 2. Chapter 8 (In which Passepartout Talks Rather More than is Prudent),
paras 4–8 — the highest-identity chapter (37%)

Source and modern both read: "'Yes; but we travel so fast that I seem to be
journeying in a dream. So this is Suez?' / 'Yes.' / 'In Egypt?' / 'Certainly,
in Egypt.' / 'And in Africa?'"

Finding: **strong / legitimate identity.** The chapter is a rapid
question-and-answer exchange between Fix and Passepartout; the lines are
already modern and short. Leaving them is correct, and it fully explains the
chapter's identity rate.

### 3. Chapter 20 (In which Fix Comes Face to Face with Phileas Fogg),
paras 6–9 — inside the straight-quote region

Source p7: "**"**Pardon me; I thought I **should** find your servant here.**"**"
(curly quotes in file)
Modern p7: `"Forgive me; I thought I would find your servant here."` (straight
quotes in file)

Source p9: "'What!' **responded** Fix, feigning surprise. '**Is he not** with
you?'" → modern "'What!' **Fix exclaimed**, feigning surprise. '**Isn't he**
with you?'"

Finding: **strong editorially, failing typographically.** The prose work is
fine — contractions and a stronger reporting verb, no loss. But the quote
characters differ from both the source edition and the rest of the same file.

### 4. Chapter 33 (In which Phileas Fogg Shows Himself Equal to the Occasion),
paras 20–24 — late, high-tension narrative

Source p20: "…after having so awkwardly followed a false **scent** around the
world, and **refrained**." Modern p20: "…after having so awkwardly followed a
false **trail** around the world, and **let it pass**."

Source p22: "the funnel of the 'Henrietta' **vomited forth** torrents of smoke.
The vessel **continued to proceed with all steam on**." Modern p22: "the funnel
of the 'Henrietta' **was vomiting** torrents of smoke. The vessel **kept on at
full steam**."

Source p24: "It was as if the honest fellow had been **commanded to unchain a
tiger**." Modern: "It was as if the honest fellow had been **told to unchain a
tiger**."

Finding: **strong.** The tiger image survives; Fogg's clipped orders survive
verbatim ("Do not let the fires go down… Keep them up to the last. Let the
valves be filled."). This is the right treatment.

### 5. Ending — Chapter 37, paras 8–11

Source: "'Impossible—for **to-morrow**.' / 'Why so?' / 'Because
**to-morrow**—is Sunday!' / 'Monday,' replied Mr. Fogg."
Modern: identical but for "tomorrow".

Finding: **strong / legitimate identity.** The book's punchline — the
date-line gain — is delivered in exactly Verne's/Towle's rhythm. Nothing is
explained that should not be.

## Editorial judgement

Rated against its own source (`original-en` = Towle), the modern-en is the most
*evenly* competent edition in batch B14: a real whole-book pass, no untreated
region, no omission, no invention, no over-explanation, good idiomatic English,
jokes and images preserved. Its problems are (a) the typographic seam and (b)
the fact that it is a modernization of a translation whose own fidelity to
Verne is known to be imperfect. A modernization cannot repair a mistranslation
it cannot see; whatever Towle softened, cut or ornamented in 1873 is inherited
unchanged and now wears modern clothes, which makes it harder rather than
easier for a reader to notice.

## Phase 3 — human-translation research

Fourteen English translations exist. Completeness and rights status as far as I
could establish:

| translator | year | publisher | completeness (per reference table) | rights |
|---|---|---|---|---|
| **George M. Towle** | 1873 | Sampson Low / Porter & Coates | "not complete by modern standards" | **Public domain**; Standard Ebooks production CC0 |
| Stephen W. White | 1874 | — | "some omissions from serialization" | PD |
| Anonymous | 1876 | Hutchinson | **complete** | PD; no accessible digital transcription found in this search |
| Henry Frith | 1877 | Routledge | condensed, ~1/5 missing | PD — **reject on quality** |
| Anonymous | 1879 | Ward, Lock & Tyler | mostly complete | PD; not located digitally |
| **P. Desages** | 1926 | Dent / Everyman | **complete**; "accurate, idiomatic, and ornate", "high semantic fidelity" | **unclear** — see below |
| K.E. Lichtenecker | 1965 | Paul Hamlyn | abridged, 20 of 37 chapters | in copyright — **reject on quality** |
| I.O. Evans | 1966 | Fitzroy | condensed | in copyright — reject |
| Jacqueline & Robert Baldick | 1968 | Dent/Dutton | complete | in copyright, permission required |
| **William Butcher** | 1995 | Oxford (OWC) | complete; widely regarded as the scholarly best | in copyright, permission required |
| Michael Glencross | 2004 | Penguin Classics | complete; modern accessible prose | in copyright, permission required |
| F.P. Walter | 2010/2013 | SUNY / Excelsior | complete, reader-friendly | in copyright, permission required |
| Matthew G. Jonas | 2022 | Birch Hill | complete | in copyright |
| Andrew Brown | 2024 | Alma | complete | in copyright |

**Candidate A — Towle 1873 (what we already have).** Rights-clear beyond doubt.
Standard Ebooks hosts a clean CC0-produced transcription (62,832 words,
complete novel, transcribed from Project Gutenberg with Internet Archive page
scans): https://standardebooks.org/ebooks/jules-verne/around-the-world-in-eighty-days/george-makepeace-towle
Their stated status: *"This ebook is thought to be free of copyright
restrictions in the United States. It may still be under copyright in other
countries"*, with Standard Ebooks' own production work dedicated via CC0 1.0.
A second free PD copy (also Towle, ebook by José Menéndez) is at
https://www.ibiblio.org/ebooks/Verne/Eighty_Days.pdf, whose copyright page
states: *"The original book is in the public domain in the United States and in
most, if not all, other countries as well."* **Verified by direct fetch.**
Towle himself died in 1893, so life+70 expired in 1963 — the translation is PD
in the EU/Denmark as well.

**Candidate B — P. Desages 1926 (Dent/Everyman).** The most promising
rights-plausible upgrade: complete, and characterised in the reference
literature as accurate and idiomatic with high semantic fidelity, i.e. it
would fix the Towle-fidelity problem rather than paper over it.
- **US:** works published in 1926 entered the US public domain on 1 January
  2022, so the 1926 Dent text should be US-PD.
- **EU/Denmark:** life+70 of the translator. **I could not establish P.
  Desages' death date** in this search, so the EU term is unresolved. Tinct
  operates from Denmark, so this is the binding jurisdiction and it is open.
- **Beware the reprints:** the 1994 Everyman reissue was "slightly edited by
  Peter Costello" — that edit is separately copyrighted and must not be used as
  the source. Any use would have to be from a 1926–1930s printing.
- **Accessibility: UNVERIFIED.** I found no digital transcription of the
  Desages text I could open and read, so per the brief I record it as
  unverified, not as accessible.

**Candidate C — Butcher (Oxford 1995).** Best-regarded modern translation,
complete, scholarly. **Permission required**; Oxford University Press is not
going to license a classics translation into a $3/month reading app on
favourable terms. Recorded for completeness, not recommended to pursue.

**"None found" vs "none exists":** I searched for accessible, rights-clear
alternatives and found **none that I could both open and clear** in this
search. The 1876 Hutchinson and 1879 Ward, Lock translations are PD and
reportedly complete/mostly complete but I located no digital transcription of
either; they are a genuine unexplored avenue, not a dead end.

## Ratings

Rated against `original-en` (Towle), per the rubric.

| dimension | weight | rating |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 5 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 5 |
| naturalness | 5% | 5 |

Weighted score **4.4** — band **Good with fixes**.

Fidelity is 4 rather than 5 not because I found an omission — I found none —
but because the edition's fidelity ceiling is Towle's, and Towle's is known to
be below the modern standard. Read the score as "faithful to its source", with
the provenance caveat attached.

## Recommendation

**LIGHT EDIT**, with a flagged provenance question.

Immediate, cheap, and worth doing:
1. Normalize `modern-en` chapters 11–30 to curly quotes, matching chapters
   1–10, 31–37 and `original-en`.

Separately, as a content-strategy question for Anders rather than a defect fix:
2. The English reading experience for this title is capped by an 1873
   translation that scholarship calls incomplete and florid. The two routes out
   are (a) establish P. Desages' death date and, if the EU term has expired,
   evaluate the 1926 Dent text as a replacement core; or (b) locate the 1876
   Hutchinson or 1879 Ward, Lock translations, which are unambiguously PD in
   every jurisdiction. Neither is a blocker today — Towle is legal, complete in
   structure, and reads well in our modernized form.

- **Confidence: medium.** 5 passages read closely out of 37 chapters, plus an
  exhaustive mechanical pass over all 1,613 paragraph pairs, a chapter-count
  check against the French, and a content check of chapter 1 against the French
  Wikisource text. The claim that no omission exists anywhere rests on the
  length-ratio scan, which would miss a compensated omission.
- **Correction scope: local** for the quote-style fix. **Unknown** for the
  Towle-fidelity question until someone compares against the French.

## Limitations of this review

- I verified completeness against the French for **chapter 1 only**. Chapters
  2–37 were checked structurally (count, paragraph alignment, length ratios)
  but not against Verne.
- I did not read the Desages, Butcher, Glencross, Baldick or Walter
  translations — none was accessible to me. Every quality characterisation of
  them above is secondhand from the reference literature, not my own reading.
- P. Desages' death date, and therefore the EU/Danish copyright term on the
  1926 translation, is **unresolved**. I am not asserting it is or is not free.
- 32 of 37 chapters were not read as connected prose.
- I did not check `modern-da`, onboarding/cast JSON, or audio.

## Sources

- https://welovetranslations.com/2025/12/17/whats-the-best-translation-of-around-the-world-in-eighty-days/
- https://standardebooks.org/ebooks/jules-verne/around-the-world-in-eighty-days/george-makepeace-towle
- https://www.ibiblio.org/ebooks/Verne/Eighty_Days.pdf
- https://fr.wikisource.org/wiki/Le_Tour_du_monde_en_quatre-vingts_jours/Chapitre_1
- https://en.wikisource.org/wiki/Around_the_World_in_Eighty_Days_(Towle)
- https://www.gutenberg.org/ebooks/103
- https://sunypress.edu/Books/A/Around-the-World-in-80-Days
