# magna-carta — Magna Carta, "Anonymous (sealed by King John)"

**Scope:** public. Audited 2026-09-11. Batch B20.

## Edition snapshot (Phase 1)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `ca7447fb99a427bd` | 1 | 74 | 4,525 | "English Translation", translator `null`, year `1215` |
| modern-en | `cf7d388da295fff5` | 1 | 74 | 4,593 | "Modern English" |
| modern-da | `2f92e891bba2460c` | 1 | 74 | 4,236 | "Moderne Dansk" |

Mechanical comparison: mean weighted similarity **0.8811** (the highest in this batch by a wide
margin), identical long paragraphs **9.6%**, 0 truncations, 0 empty paragraphs, alignment intact,
last chapter not suspiciously short. Recomputed independently: **5.6% of source words sit in
byte-identical paragraphs**, and the whole-book weighted similarity reproduces at ~0.88.

**Phase 2 coverage: the full text (all 74 paragraphs, both English editions) was read**, per the
instruction to inspect short works in full.

---

## Provenance of the core English text — IDENTIFIED, and it is a problem

The registry labels `original-en` only as "English Translation" with no translator and year 1215.
The year is the year of the *charter*, not of the translation, so the label is actively misleading.

I identified the translation by matching the file text against published versions:

- Wikisource, *Magna Carta (trans. Davis)* — `translator = G. R. C. Davis`, `year = 1963`
  (https://en.wikisource.org/wiki/Magna_Carta_(trans._Davis)). The preamble, clause 1, clause 39
  and clause 40 in Tinct's `original-en` are word-for-word this text.
- The same translation is the one the **British Library** publishes and syndicates
  ("Translation by the British Library"; reproduced e.g. at
  https://www.salisburycathedral.org.uk/translation-of-magna-carta-courtesy-of-the-british-library/
  and https://www.nationalarchives.gov.uk/education/resources/magna-carta/british-library-magna-carta-1215-runnymede/).
  It is G. R. C. Davis, *Magna Carta* (British Museum, 1963; revised edn, British Library, 1989),
  carrying **"© The British Library Board"**.

Fingerprints that place Tinct's copy in the British-Library web lineage rather than the Wikisource
transcription: Tinct has "Alan de Galloway" / "Warin Fitz Gerald" / "Walter Bishop of Worcester"
where Wikisource has "Alan of Galloway" / "Warin fitz Gerald" / "Walter bishop of Worcester", and
Tinct inlines "Easter 1215 AD" where Wikisource keeps Davis's "Easter in the sixteenth year of our
reign" with a footnote.

**Verdict: the `original-en` edition is a copy of a 20th-century, in-copyright translation, used
without attribution.** That is the single most important finding for this book, and because
`modern-en` is a light edit *of that same text* (see below), the modern edition is a derivative work
of it too.

### Damage done to the Davis text in Tinct's copy

Three silent corruptions, all inherited unchanged into `modern-en`:

1. **Clause numbers (51)–(63) are gone.** Davis/BL number all 63 clauses. Tinct's file runs
   "(1)…(50)" and then 13 unnumbered paragraphs. For a legal instrument whose clauses are cited by
   number (the security clause is *61*, the Welsh clauses are *56–58*), this destroys the document's
   primary reference system.
2. **Clauses 49 and 50 are merged into one paragraph** (para 50 contains both "(49)" and "(50)").
3. **Clause 50 is garbled**, and the garble changes who the charter expels from office. Davis reads:
   *"We will remove completely from their offices the kinsmen of Gerard de Athée, and in future they
   shall hold no offices in England. The people in question are Engelard de Cigogné, Peter, Guy, and
   Andrew de Chanceaux, Guy de Cigogné, Geoffrey de Martigny and his brothers…"* Tinct's
   `original-en` reads *"the kinsmen of Gerard de Ath, Peter, Guy, and Andrew de Chanceaux, Guy de
   Cigogne, and in future they shall hold no offices in England. The people in question are Engelard
   de Cigogn, Geoffrey de Martigny…"* — four names have migrated from the enumerated list into the
   "kinsmen of" clause.
4. Minor: the `£` in clause 2 ("£100") was lost in `original-en` ("shall pay 100"), and Davis's
   `†`/`‡` markers (which clauses survived in 1225 / were dropped in later reissues) and his two
   footnotes are absent.

`modern-en` repaired the accents ("de Athée", "de Cigogné") and restored "100 pounds" — so whoever
produced it *was* looking closely at clause 50 and clause 2 — but reproduced the name-migration
error verbatim and did not restore the clause numbering.

---

## Samples inspected — full text; 6 places where something turned on the comparison

### 1. Preamble (¶0)

SRC: *"…to his archbishops, bishops, abbots, earls, barons, justices, foresters, sheriffs, stewards,
servants, and to all his officials and loyal subjects, Greeting. KNOW THAT BEFORE GOD, for the
health of our soul and those of our ancestors and heirs…"*
MOD: *"…sends greetings to his archbishops, bishops, abbots, earls, barons, justices, foresters,
sheriffs, stewards, servants, and to all his officials and loyal subjects. KNOW THAT BEFORE GOD, for
the salvation of our soul and the souls of our ancestors and heirs…"*

**Finding — strong.** The only real changes are "Greeting" → "sends greetings" (reads better) and
"health of our soul" → "salvation of our soul" (a defensible reading of *salus animae*, though
"health" is the more literal and less doctrinally loaded word). The witness list is re-punctuated
into semicolon-separated appositives, which genuinely helps.

### 2. Clause 2 (¶3) — the glossing method

SRC: *"…and at his death his heir shall be of full age and owe a 'relief', the heir shall have his
inheritance on payment of the ancient scale of 'relief'. That is to say, the heir or heirs of an
earl shall pay 100 for the entire earl's barony, the heir or heirs of a knight 100s. at most…"*
MOD: *"…and at his death his heir is of full age and owes a 'relief' (an inheritance fee), the heir
shall have his inheritance on payment of the ancient scale of relief. That is: the heir or heirs of
an earl shall pay 100 pounds for the entire earl's barony; the heir or heirs of a knight shall pay
100 shillings at most…"*

**Finding — strong.** This is the edition's actual method and it works: a short parenthetical gloss
at the point of need, expanded abbreviations, and a silent repair of the dropped `£`. Comparable
glosses through the text: *scutage (payment in lieu of military service)*, *aid (feudal levy)*,
*novel disseisin (recent dispossession of land)*, *mort d'ancestor (claims by an heir)*, *darrein
presentment (the last presentation to a church)*, *escheat (lands reverted to the Crown)*, *fee-farm
(a fixed rent)*, *socage (non-military service)*, *burgage (a town tenure)*, *intestate (without a
will)*, *disafforested (released from forest law)*, *appeal (formal accusation)*.

### 3. Clause 39 (¶40) — the clause that matters most

SRC: *"No free man shall be seized or imprisoned, or stripped of his rights or possessions, or
outlawed or exiled, or deprived of his standing in any other way, nor will we proceed with force
against him, or send others to do so, except by the lawful judgement of his equals or by the law of
the land."*
MOD: *"No free man shall be seized or imprisoned, or stripped of his rights or possessions, or
outlawed or exiled, or deprived of his standing in any other way, nor will we proceed against him
with force, or send others to do so, except by the lawful judgment of his equals or by the law of
the land."*

**Finding — strong / disconfirms the risk the brief flagged.** Identical except for adverb order and
"judgement"→"judgment". Clause 40 is likewise intact (*"To no one will we sell, to no one will we
deny or delay, right or justice."*, adding only "will we" and a comma). No modernisation damage to
the due-process clauses. **This was the highest-stakes thing to check and it passes.**

### 4. Clause 12 vs clause 15 (¶13, ¶16) — an inconsistency in a legal list

SRC ¶13: *"…unless it is for the ransom of our person, to make our eldest son a knight, and (once)
to marry our eldest daughter."*
MOD ¶13: *"…unless it is for our ransom, to make our eldest son a knight, **or** (once) to marry our
eldest daughter."*
SRC ¶16 / MOD ¶16 both: *"…except to ransom his person, to make his eldest son a knight, **and**
(once) to marry his eldest daughter."*

**Finding — borderline.** The same three-item formula is rendered with a disjunctive "or" in clause
12 and a conjunctive "and" in clause 15. "Or" is the legally correct reading of the feudal aids, so
the change is an improvement — but applying it to one clause and not its twin is exactly the kind of
inconsistency that makes a reader wonder whether the difference is meaningful. Fix by making both
"or".

### 5. Clause 50 (¶50) — the inherited corruption, not corrected

SRC: *"(50) We will remove completely from their offices the kinsmen of Gerard de Ath, Peter, Guy,
and Andrew de Chanceaux, Guy de Cigogne, and in future they shall hold no offices in England."*
MOD: *"(50) We will completely remove from their offices the kinsmen of Gerard de Athée, Peter, Guy,
and Andrew de Chanceaux, and Guy de Cigogne, and in the future they shall hold no offices in
England."*

**Finding — failing (inherited).** The modern edition polished the spelling of a sentence whose
sense is wrong. In the real clause only Gerard de Athée's *kinsmen* are the subject; the Chanceaux
brothers and Guy de Cigogné are named individuals in the list that follows. As it stands, Tinct
tells readers of a foundational legal document something the document does not say. Not the
modern edition's fault of origin, but it is the modern edition's fault that it was not caught.

### 6. Clause 26 / 25 (¶26, ¶27) — over-gloss watch

MOD ¶26: *"Every county, hundred, wapentake (a Northern English district), and tithing (a small
administrative unit) shall remain at its ancient rent…"*

**Finding — borderline, minor.** "A Northern English district" is loose (a wapentake is the Danelaw
equivalent of a hundred, i.e. a sub-county judicial/administrative division) and "a small
administrative unit" for *tithing* is vague enough to be unhelpful. These two glosses are weaker
than the rest, which are accurate.

### Overall character of the modern edition

`modern-en` is **not a modernisation**: it is the Davis/BL translation with (a) parenthetical
glosses, (b) American spelling, (c) some long sentences split, (d) light copy-editing. Word count
moves 4,525 → 4,593 (+1.5%). Given that the underlying text is already modern English prose from
1963, that is the *right editorial answer* under our reading standard ("for English originals that
are already accessible, source + occasional glosses may be the best result") — but it means the two
editions are near-duplicates of one another, and it means the modern edition carries the source's
rights problem with it.

## Phase 1 flags — confirmed / disconfirmed

- **9.6% identical long paragraphs / similarity 0.88 → CONFIRMED**, and explained: the modern
  edition is a gloss layer, not a rewrite. Whole clauses (14, 17, 39, 40, 41, 46, 47, 64, 67) are
  word-for-word.
- **0 truncations, 0 empty paragraphs, alignment intact → CONFIRMED** by reading all 74 pairs.
- **New defect not visible to Phase 1:** the file's own completeness relative to the charter
  (missing clause numbers 51–63, merged 49/50, garbled 50). Phase 1 compares editions to each
  other, so it cannot see a defect both editions share.

## Phase 3 — human-edition research

**Current core text: G. R. C. Davis, British Library. Rights status: PERMISSION REQUIRED / UNCLEAR
— and currently unattributed in the product.**
- Evidence of copyright: BL publishes it as its own translation; reproductions carry
  "© The British Library Board". The 1989 revised edition (British Library, ISBN 0712300147) is a
  commercially published book still in print-run circulation.
- Wikisource tags its transcription `{{Cc-by-4.0}}`
  (https://en.wikisource.org/wiki/Magna_Carta_(trans._Davis)). I do **not** treat that as reliable
  evidence: it is a contributor-applied tag on a page whose own header dates the translation to
  1963, and I found no release statement from the British Library to support it. Anyone relying on
  it for commercial redistribution from Denmark would be relying on a wiki template, not a licence.
- Tinct is a commercial subscription product distributing this text as page content and as
  generated audio. This needs a decision, not a guess.

**Verified public-domain replacement — Ernest Flagg Henderson (1892).**
- Edition: Ernest F. Henderson, trans./ed., *Select Historical Documents of the Middle Ages*
  (London: George Bell & Sons, 1892), "Magna Carta".
- URL: https://en.wikisource.org/wiki/Select_Historical_Documents_of_the_Middle_Ages/Book_I/Magna_Carta
  (scan-backed; also at archive.org/details/selecthistorical00hendiala).
- Completeness: **complete**, all 63 clauses numbered.
- Rights: **public domain** — published 1892, translator d. 1928. Clean in both the US and the
  EU/Denmark (life+70 expired 1998).
- I read a sample rather than relying on reputation. Clause 39: *"No freeman shall be taken, or
  imprisoned, or disseized, or outlawed, or exiled, or in any way harmed—nor will we go upon or send
  upon him—save by the lawful judgment of his peers or by the law of the land."* Clause 40: *"To
  none will we sell, to none deny or delay, right or justice."* Clause 38: *"No bailiff, on his own
  simple assertion, shall henceforth put any one to his law, without producing faithful witnesses in
  evidence."*
- Assessment: Henderson is **more archaic and harder than Davis** ("disseized", "petit-serjeanty",
  "put any one to his law", "save by"). It is a worse *reading* text on its own. But it is the
  right base for exactly the product we already have: a glossed modern edition. The existing
  `modern-en` glossing method, re-applied to Henderson, would give us a clean-rights reading edition
  *and* a clean-rights source edition, with the clause numbering restored.
- Alignment work required: Henderson's 63 numbered clauses do not map onto the current 74-paragraph
  structure. This is structural work, not a quality strike.

**Other candidates noted, not adopted:** the UK National Archives education pages carry the same BL
translation under an OGL-v3 site notice with the translation separately credited to the BL — i.e.
the OGL does not obviously reach it. The US National Archives publishes a translation of the **1297**
charter, a different document. The Magna Carta Project (UEA, 2014) translation is modern and almost
certainly in copyright — **unverified**, not researched further.

## Ratings

| dimension | score | note |
|---|---|---|
| fidelity/completeness (40%) | **3** | Faithful to its own source, but reproduces a garbled clause 50 and a charter missing 13 clause numbers. For a legal instrument this is substantive. |
| first-read clarity (25%) | **4** | The glosses are the best thing here and land well; the underlying Davis legalese still asks a lot in clauses 26, 37, 43. |
| literary voice (20%) | **4** | Charter register fully intact; the ceremonial capitals and formulae survive. |
| restraint / no invention (10%) | **4** | Glosses are parenthetical and mostly accurate; two are loose; the clause-12 "or" is a silent legal reading. |
| naturalness (5%) | **4** | Reads cleanly. |

**Weighted score: 3.6 — band: Good with fixes.**

## Recommendation

**BLOCKED** — confidence **high** on the blocker, **medium** on the editorial rating.

What is unresolved, exactly:

1. **Rights.** `original-en` (and therefore `modern-en`, which is derived from it) is G. R. C.
   Davis's translation, published and asserted as © The British Library Board. Tinct has no
   attribution and no identified licence. Until someone either obtains BL permission or swaps the
   base text, this book should not be treated as cleared for commercial distribution.
2. **Textual integrity.** Even setting rights aside, both English editions misstate clause 50 and
   have lost the clause numbering for 51–63.

Neither is an editorial-quality problem the modernisation pipeline can fix. Re-rating the modern
edition is pointless until the base text is decided.

**Correction scope: substantial** (re-base onto a public-domain translation, re-paragraph, re-gloss,
regenerate `modern-da`, regenerate audio).

**Next action:** decide the base text — either get written BL permission for the Davis translation
and attribute it, or re-base `original-en` on Henderson (1892), restore all 63 numbered clauses, and
re-apply the existing gloss layer.

## Limitations of this review

- I read both English editions in full; I did **not** read `modern-da` at all.
- I did not collate against the Latin. My completeness claims are against published English
  presentations of the Davis translation, not against the 1215 engrossments.
- I did not obtain a copyright statement directly from the British Library; my rights finding rests
  on BL-credited republications and on the 1963/1989 publication record. A lawyer should confirm.
- Audio was not checked. If `magna-carta` audio was generated from these files it carries the same
  clause-50 error.
