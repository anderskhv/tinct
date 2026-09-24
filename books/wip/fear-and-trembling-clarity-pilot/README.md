# Fear and Trembling: Modern English clarity pilot (Problema I and II)

**Status:** pilot complete and staged. **Not published, not registered, not
deployed.** Nothing outside this folder was changed.
**Scope:** source provenance, plus reader sections 5 (Problema I, 32 slots) and
6 (Problema II, 29 slots). The rest of the book was deliberately not touched.
**Branch:** `claude/hopeful-tesla-7s5ziw`. Earlier work on
`claude/fear-and-trembling-modern-en-20260911` was read and preserved. This
package extends its glossary and reaches the same source decision.

## 1. Source provenance: finding

The served English "original" (`original-en`, labelled "Original (English)") is
**not any published translation**. Commit `b76fa5649` records it as a 2026 AI
translation from the Danish. Measured against the Lowrie (1941) and Hong (1983)
full texts, and against Hannay and Hollander passages, it matches no edition,
but it carries phrasing from several copyrighted ones. **It does not meet the
public-domain source requirement.**

No complete English translation is public domain in the US:

- Lowrie 1941 was renewed in 1969 (renewal R458284) and is in copyright
  through 2036.
- Payne 1939 is in copyright, most likely until 2034 or later.
- Hollander 1923 is public domain in the US, but covers only about a third of
  the book and has no Problemata.

**The pilot uses the Danish 3rd edition (Reitzel/Grøn, Copenhagen 1895) as its
established source.** It is public domain everywhere. The evidence, the
uncertainties and the source options are in [`PROVENANCE.md`](PROVENANCE.md).
The source coordinates and the collation are in
[`source/SOURCE-NOTES.md`](source/SOURCE-NOTES.md).

**Decisions needed from Anders** (details in `PROVENANCE.md`):

1. What to do with `original-en`. The project rule asks for a public-domain
   human English translation, and none exists for this work. The options are:
   (a) a documented exception, with `original-en` relabelled as a Tinct
   translation or removed; (b) keep the book outside the complete-package
   standard until one exists; (c) license a translation.
2. Whether to replace the served English section by section with this
   method, given its measured overlap with copyrighted translations.

## 2. Coordinates confirmed

"Reader sections 5 and 6" are `chapters[4]` and `chapters[5]` in every edition
file: Problema I and Problema II. The earlier spot checks ("the openings of
Problema I and Problema II") point at `chapters[4].paragraphs[0]` and
`chapters[5].paragraphs[0]`, and the pilot confirms both. The slot counts
(32 and 29) are the same in `original-da`, `original-en` and `modern-en`.

## 3. Deliverables

| Deliverable | File |
|---|---|
| Problema I, final (readable) | [`final/problema-1-final.md`](final/problema-1-final.md) |
| Problema II, final (readable) | [`final/problema-2-final.md`](final/problema-2-final.md) |
| Both sections, edition-shaped JSON (paragraph slots + footnotes) | [`final/candidate-final.json`](final/candidate-final.json) |
| Hashes | [`final/SHA256SUMS`](final/SHA256SUMS) |
| Source / baseline / candidate comparison with reasons, per slot | [`comparison/problema-1-comparison.md`](comparison/problema-1-comparison.md), [`comparison/problema-2-comparison.md`](comparison/problema-2-comparison.md) |
| Revision diffs | `comparison/v1-to-v2-diff.md`, `v2-to-v3-diff.md`, `v3-to-v4-diff.md` |
| Terminology policy | [`TERMINOLOGY.md`](TERMINOLOGY.md) |
| Provenance finding | [`PROVENANCE.md`](PROVENANCE.md) |
| Independent reviews and resolutions | `review/` (see §5) |

### Hashes (final = candidate v4.1)

| File | sha256 |
|---|---|
| `final/candidate-final.json` | `1ffe55afedea235073dde68f0f165dd4ddd8a474eebb35fa452b46bdc117fc54` |
| `final/problema-1-final.md` | `aaa426c13f264a553677298f05d7c32438db376d537c102eeaad67b19cc7fc02` |
| `final/problema-2-final.md` | `fd7e84a53f8433591684e1f63f4b3ca1958ef0e545464376c54a108e4b403ce7` |
| Problema I paragraph array (`json.dumps(paragraphs, ensure_ascii=False)`) | `016fa12b80fd629db550013e5dcd7724555c1591836a41b24542e6ca799978be` |
| Problema II paragraph array | `29de876776a0553d9b600f41d3781eda6f6a27f9e60e67dc9a3c5850c8bb0258` |
| Source: served `original-da` (whole file) | `c61144bbf51a930748799d4ff30ff48031ee12452ada5eb5391f684e8961d63a` |
| Baseline: served `modern-en` (whole file) | `152776f19e1b707b610d2bee033d6984ed0f1e26826b314e2d0541d9c0b49132` |

### Mechanical checks (final)

| | Problema I | Problema II |
|---|---|---|
| Slots (source / baseline / pilot) | 32 / 32 / 32 | 29 / 29 / 29 |
| Words (Danish / baseline / pilot) | 4,764 / 5,221 / 5,369 | 4,795 / 5,240 / 5,288 |
| Pilot ÷ Danish word ratio | 1.13 | 1.10 |
| Similarity to the baseline (repo metric) | 0.62 | 0.63 |
| Similarity to the served `original-en` | 0.52 | 0.59 |
| Kierkegaard footnotes restored | 1 (Lessing) | 1 (wish/duty) |

The similarity figures use `books/classify-modern-en.py`'s `para_similarity`,
length-weighted. The repo gate passes a real modernization at ≤ 0.75.

**Other checks**

- **Overlap with copyrighted translations** (`review/independence-check.md`):
  - 16-word runs: 0%.
  - 12-word runs: 4.3%, against 3.8% between Lowrie and Hong, which were
    translated independently of each other.
- **JSON:** the files are valid, and no slot is empty.
- **Page-break boundaries:** ten fragment boundaries are repaired. Each is
  listed per slot in the comparison files, and a reviewer verified that
  nothing was lost or duplicated.

**Not claimed:** the slots are aligned by content, but the pilot has not been
loaded in the app. That would be app or publishing work, and it is outside
this assignment.

## 4. What changed from the baseline, and why (summary)

The served `modern-en` stays close to the Danish word order. It keeps
"rests immanent in itself", "Determined as immediate sensuous and psychic
being", "annul his singularity". It uses
"temptation" for both *Anfægtelse* and *Fristelse*. It opens the
either/or of P-I 4 as an assertion ("And yet faith is this paradox; or else …"). It drops a verb at a page break
(P-II 7), and it omits both of Kierkegaard's footnotes.

The pilot is a fresh rendering from the Danish. It:

- **splits the long periods** so that every sentence makes one move;
- **resolves pronouns** ("eternal blessedness" instead of "it"; Abraham, Hagar
  and the Church member named where the Danish has a bare pronoun);
- **defines each technical term once, briefly, at first use**, in words
  supported by the source: telos, particularity, ethical life, mediation,
  incommensurable, spiritual trial, the immediate, tautology;
- **keeps the vocabulary fixed**, so that distinctions the argument depends on
  stay visible:
  - the ethical ≠ ethical life ≠ the universal;
  - spiritual trial ≠ test ≠ temptation ≠ put to the proof;
  - sacrifice ≠ give up;
  - the paradox ≠ something paradoxical;
  - absurd ≠ ridiculous;
  - anxiety ≠ fear;
- **keeps the paradoxes and deliberate ambiguities**: "never existed because it
  has always existed", "a later one", the unnamed father in P-I 8;
- **keeps Johannes de Silentio's first-person perspective**, including his
  admissions that he cannot understand Abraham and lacks the courage;
- **restores the source**: the verb dropped at the P-II 7 page break and both
  footnotes.

Per-slot reasons are in the comparison files.

## 5. Independent review trail

| Round | Reviewer (each a fresh, independent agent) | Result | Resolution |
|---|---|---|---|
| v1 | Fidelity: every slot against the Danish only | 0 BLOCKER, 3 MAJOR, 32 MINOR | `review/resolution-v1-to-v2.md` |
| v1 | Accessibility: candidate text only | 2 SEVERE, 30 MODERATE | same |
| v2 | Fidelity re-verification of the changes | 0 / 1 MAJOR / 12 MINOR | `review/resolution-v2-to-v3.md` |
| v2 | Accessibility re-read | 2 SEVERE, 24 MODERATE (mostly source-inherent) | same |
| v3 | *Independence check against Hong and Lowrie*: v2 shared 7.6% of its words in 16-word runs (human baseline 1.4%) | about 70 sentences re-rendered | `review/independence-check.md` |
| v3 | Fidelity re-verification of the changes | 0 / 2 MAJOR / 30 MINOR (the rewording had blurred two distinctions) | `review/resolution-v3-to-v4.md` |
| v3 | Accessibility re-read | 1 SEVERE (source-inherent); "a newcomer can follow the reasoning of both sections" | same |
| v4 | Final fidelity re-verification | 0 / 0 / 1 MINOR (a one-word pronoun fix); **"approvable as the pilot"** | applied as v4.1; the diff was confirmed by script to be exactly `he` → `Abraham` |

### Fidelity finding (final)

After v4 (applied as v4.1), the reviewer judged that the pilot keeps every
argument, example, qualification, paradox and deliberate ambiguity of the
Danish in both sections. Its terminology sweep of the whole text was clean.

### Accessibility finding (final)

A newcomer who reads only the pilot can reconstruct both arguments step by
step:

- the tragic hero against Abraham;
- "Abraham cannot speak";
- the absolute duty;
- Luke 14;
- the church-as-state step;
- both either/or conclusions.

The difficulties that remain belong to the source, not to the wording:

- **The never/always faith formula (the one SEVERE item left).** Problema I
  never unpacks it, and it only becomes readable at P-II 3.
- **The Hegel paragraphs** (P-I 1, P-II 1).
- **References the text leaves unexplained:** Agamemnon, Jephthah and Brutus,
  Socrates, the 70 and 130 years, "dialectic".

These were deliberately not explained inside Johannes's text. Doing so would
put interpretation into his mouth. If explanation is wanted, it belongs in an
optional reader aid outside the text, such as a note or glossary. That is a
product decision.

## 6. Recommendation

**The method is ready to extend. It needs two changes, and one blocking
decision.**

**Ready.** Every argument survived four independent review rounds, and a
newcomer can follow both sections. The method has four parts:

- Danish source, and collation against the raw OCR;
- a fixed terminology policy;
- a paragraph-by-paragraph fidelity review against the Danish, plus a
  text-only comprehension read;
- fix and re-verify only the changed slots, until the review finds nothing
  left to fix.

**Two changes to the method before extending:**

1. **Run the independence check before the first review, not after it.** The
   v1/v2 draft had the same memorized phrasing from copyrighted translations
   as the served editions. Drafting from Danish did not prevent this.
   Re-wording afterwards cost a full extra review round and introduced two
   MAJOR defects of its own. For each section:
   - draft;
   - run the n-gram check against the reference texts (masked formulas;
     16-word runs should be 0%, 12-word runs near the human baseline);
   - re-render the flagged sentences;
   - only then send it to review.
2. **Budget three review rounds per section**, not two. Most defects in the
   later rounds came from the fixes themselves (an over-long gloss, a
   pronoun, a lost echo). Only a fresh verifier on the changed slots caught
   them.

**Blocking decision before extending:** Decision 1 in §1 (the fate of
`original-en` and the exception to the public-domain translation rule). The
pilot is a Tinct translation of the Danish. Whether the book can ship with
that, and under what edition label, is Anders's call, and the rest of the
book depends on it.

**Suggested order if approved:**

1. Problema III (88 slots; the longest and most example-heavy, so the best
   test of scale).
2. The Preliminary Expectoration.
3. The Exordium, Eulogy, Preface and Epilogue. The earlier branch's Preface
   draft (`ch01/candidate-v1.json`) should go through the independence check
   before it is reused.

**Out of scope, not done:**

- live edition changes;
- registry changes;
- character cards;
- audio;
- deployment;
- shared trackers, including `books/raw/fear-and-trembling/SOURCE.md` (its
  "1980 reprint" error is noted in `source/SOURCE-NOTES.md`);
- any work on the remaining sections.

**Note on the reference texts:** Lowrie and Hong were used only as detection
references. They were never used as a drafting aid, and they are not
committed.
