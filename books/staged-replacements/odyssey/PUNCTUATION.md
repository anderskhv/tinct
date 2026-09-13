# Punctuation standard — the Odyssey modern edition

Settled at Book 1's step 6, 2026-09-12, from round-1 records finding **R1**
and optional finding **R5** (`book01/review/findings-v1.md`). Written as its
own file, on the Meditations package's precedent, because it is a rule every
later Book inherits and the ledger is not the place to look up a character.

## 1. Quotation marks and apostrophes — typographic throughout

**Decision: `“ ” ’` — the typographic forms. The ASCII apostrophe `'` and the
ASCII double quote `"` are not used.**

Book 1's `candidate-v1.json` used curly double quotes for speech (30 opening,
29 closing) and the **straight ASCII apostrophe** for every apostrophe — 22
occurrences across 15 paragraphs (`Agamemnon's`, `Ulysses's`,
`Telemachus's`, `father's`, `mother's`, `Phemius's`, `Neptune's`, `son's`,
`Danaans'`). That is internally inconsistent, and in EB Garamond at reading
size the mixture is visible on the page. Neither neighbouring file is
inconsistent in that way: the served `original-en` is typographic throughout
(and has no ASCII apostrophe at all), and the served `modern-en` being
replaced is ASCII throughout, doubles included.

**Typographic wins over ASCII-throughout** because the candidate's own double
quotes are already typographic and would otherwise have to be downgraded in
thirty places to buy consistency, and because the edition sits beside
`original-en` in split-pane view, where a straight apostrophe in one column
against a curly one in the other is exactly the kind of difference a reader
notices without being able to name.

Applied by `scripts/build_book01_v2.py` as a final pass over the whole
candidate, after the text corrections and the name mapping: every `'`
becomes `’`. Book 1 has no contractions, so all 22 are possessives or the
plural possessive `Danaans’`. **This interacts with the name mapping's
possessive rule** (`GLOSSARY.md`, hazard 3): `Ulysses's` → `Odysseus's` →
`Odysseus’s`. The two were decided in the same pass, as the reviewer asked.

Later Books: the same final pass, and the same assertion — no ASCII
apostrophe and no ASCII double quote survives in any candidate.

## 2. Butler's unclosed quotation at a paragraph break — preserved

Ledger decision **D4**, confirmed by the round-1 reviewer and unchanged.
Where one continuous speech is split by a paragraph break, Butler omits the
closing quotation mark at the end of the first paragraph and opens the second
with its own opening mark. Book 1 does this once, at B01-P018 → B01-P019
(Athena's speech). The candidate reproduces it exactly. "Fixing" it would
tell the reader that Athena stopped speaking and started again.

The reviewer adds one operational point: **the convention has to survive into
the app for the same reason it has to survive here** — in a paginated reader,
a paragraph ending without a closing quote reads as a dropped mark rather
than as a convention if the two paragraphs land on different pages. Recorded,
not acted on; it is an app question, outside this package's scope.

## 3. Two Victorian quotation habits that ARE normalized

Recorded at step 6 from optional finding **R5**, which asked only that these
be stated as a class beside D4, so that D4's preservation reads as a decision
rather than an inconsistency. Both were already done in v1, silently; neither
changes a word of the text.

- **Comma-continuation of an interrupted speech.** Butler:
  `“Is that so?” exclaimed Minerva, “then you do indeed want…`. The candidate:
  `cried Athena. “Then you truly do need…` — a full stop and a capital. The
  Victorian convention is misread by modern readers as a sentence fragment.
- **A split vocative.** Butler: `Then Telemachus spoke, “Shameless,” he
  cried, “and insolent suitors,`. The candidate: `Then Telemachus spoke.
  “Shameless, insolent suitors,” he cried,` — regrouped, because the split is
  genuinely awkward in modern English and the speech-tag interruption falls
  between an adjective and the noun it modifies.

These two account for the candidate carrying one open/close quotation pair
fewer than the source (30/29 against 31/30). **The rule: a quotation
convention that a modern reader would misread as an error is normalized and
recorded here; a convention that carries information — D4's continuous
speech — is preserved.**

---

## 4. Compound spelling — the rule (D15), written at Book 4's round 1

Records finding **R4** of Book 4's round 1. The package had no compound rule
and was running on a single precedent (`sweet meats` → `sweetmeats`, accepted
at Book 3 and upheld at Book 4 as typographic normalization). One Book then
moved compounds in **three directions at once** — four closed, three
hyphenated, four opened, of which three were recorded decisions and the rest
silent — and two of the opened ones landed on a form that is neither Butler's
nor modern English's. This is the class that already cost the package a whole
successor version at Book 2 (`mixing bowl` → `mixing-bowl`, finding 27.1).

**The rule.** Compound spelling follows the **modern standard form of the
compound**, whichever direction that moves Butler's Victorian setting — closed,
hyphenated or open. The change is typographic and is made **silently**.

**The test that decides whether a change is typographic at all:** *does it
alter what a reader would say aloud?* If it does not, it is normalization and
needs no record. If it does — or if it renames the object (`work-box` →
*basket*) or moves its sense — it is a **rendering decision**, and it is
recorded in the Book's `continuity.md` like any other.

**The gap in the check, found at Book 5 and CLOSED there.**
`scripts/build_book3_v2.py`'s `hyphen_drift()` compares a compound
**hyphenated** in one accepted Book against the **open** form in another. It was
**blind to closed against open** — `seashore` in one Book beside `sea shore` in
another passed it silently. Book 5's round 1 ruled for the closed **`seashore`**
under this rule (D15 is about the *form*, not about precedent) and extended the
check: `scripts/compound_drift.py` keys each compound on its letters with the
separator stripped, so `seashore`, `sea-shore` and `sea shore` all key to
`seashore`, and fails on any key carrying more than one setting across the
Books. That subsumes the hyphenated-vs-open comparison, and adds closed-vs-open
and hyphenated-vs-closed.

**The open form was printed by three accepted Books, not one.** This paragraph
used to say Book 4 alone asserts it, as did `RESUME.md` and
`book05/review-instructions.md` — records finding **R-3** of Book 5's round 1.
Accepted Books **2, 3 and 4** each print one instance. The ruling therefore cost
**three successors** — `book02/candidate-v4.json`, `book03/candidate-v3.json`,
`book04/candidate-v3.json`, built by `scripts/build_seashore_successors.py`,
each leaving its accepted candidate and `ACCEPTANCE.md` byte-unchanged — plus
the two instances in Book 5's own v2. Five words now against a fourth
rediscovery later.

**Running the extended check found two more drifts nobody had raised**, in the
class the *original* `hyphen_drift()` could already see: `low-lying` hyphenated
in Book 5 against open `low lying` in Book 4, and `well-disposed` hyphenated in
Books 2 and 5 against open `well disposed` in Book 4. Butler sets both ways
himself; the modern standard is hyphenated for both, and Book 4's successor
carries them. The lesson is not about compounds: `hyphen_drift()` was written at
Book 3 and **never run again** — Book 4's build script does not call it. An
unrun check is worth what an absent one is worth, which is why
`scripts/compound_drift.py` runs standalone and is called by every later build.

**What the extended check still cannot see**, declared rather than waved away:
a compound Butler sets **open** and every Book renders **open**. There is no
disagreement for a drift check to find, and nothing in the package enumerates
the candidate's two-word sequences and asks whether the closed or hyphenated
form is the standard one. Book 5's round 1 found `half way`, `river bed`,
`mid ocean` and `sweet smelling` that way — by reading. All four are corrected
in Book 5 v2.

**The failure mode the rule exists to prevent** is landing on a third form.
`sea-side` → `sea side` is neither Butler's hyphen nor modern English's
`seaside`; it was corrected to `seaside` at Book 4 (finding 37.1, both
instances). A compound that is open in one accepted Book and hyphenated in
another is the same defect across Books, and
`scripts/build_book3_v2.py`'s `hyphen_drift()` already asserts against it.

Applied in Book 4, and asserted by `scripts/build_book04_v2.py`:

| direction | Butler | edition |
|---|---|---|
| closed | `maid-servant`, `man-servant`, `to-morrow`, `bath room`, `sea-side`, `broken hearted` | `maidservant`, `manservant`, `tomorrow`, `bathroom`, `seaside`, `heartbroken` |
| hyphenated | `fine spun`, `violet coloured`, `mixing bowl` | `fine-spun`, `violet-colored`, `mixing-bowl` |
| open, and kept open **with the reason recorded** | `drink-offering`, `thole-pins`, `work-box`/`work box` | `drink offering` (the standard open form of the religious term), `thole pins` (an attested open setting of a nautical term the sentence itself explains), `work box` (Butler's own second setting in the same paragraph) |
| **superseded at Book 5** | `sea-shore`, `low lying`, `well disposed` | `sea shore`, `low lying`, `well disposed` in accepted `book04/candidate-v2.json`; **`seashore`, `low-lying`, `well-disposed`** in the successor `book04/candidate-v3.json` |

## 5. One rule for Butler's punctuation slips (D16)

Round 1 of Book 4 found three marks of the same family disposed of three ways
— one repaired, one kept, one not ruled on — and said the state to avoid is
not any particular disposition but *two dispositions for one class*. The rule:

> **A Victorian mark is repaired when a modern reader reads it as an error,
> and kept when it is merely old-fashioned but correct.**

- **Repaired.** B04-P040's `“Then,’ he said, ‘if…` — a double opening mark
  where the nested speech needs a single one. In this edition's typography a
  bare `“` there tells the reader *Menelaus* has started speaking, and Proteus
  has; under **D4** the opening marks of this Book are load-bearing across
  twenty-one consecutive paragraphs, so a wrong one is a wrong speaker. The
  repair is asserted by name, not hidden inside a total.
- **Repaired.** B04-P046's `…unable to get home? or is he dead?` — a lower-case
  sentence opening after a question mark. It is not a sentence opening at all
  to a modern eye. `Or is he dead?` (finding 46.1).
- **Kept.** B04-P039's request punctuated as a question — `…how I may sail the
  sea so as to reach my home?’`. It is a genuine indirect question and the mark
  is correct, only dated (finding 39.1, declined with this reason).

This sits beside §2 and §3: a convention that carries information (D4's
continuous speech) is preserved; a convention a modern reader would misread as
an error is normalized; a mark that *is* an error is repaired and named.

---

## 6. The colon and the parenthesis — one rule each (Book 8's round 1, O-3)

Two classes that no line of this file, `GLOSSARY.md` or the ledger governed,
and that Book 8 disposed of silently in both directions. The state to avoid is
not any particular disposition; it is **two dispositions for one class**, which
is what §5 was written about.

**Butler's colons are KEPT, unless the clause after the colon is a new
sentence's subject.** Butler's colon does explanatory work — *here is why*, or
*here is the list* — and modern English has kept it for both jobs. Book 8
carries six of his and cashed exactly one, at **B08-P020** (*"Let us go to the
couch of Hephaestus**:** he is not at home"*), where the clause after it is a
reason and not a new subject. It is restored in `book08/candidate-v2.json`.

**And a colon may be ADDED to introduce a list, and only for that.** This is
the one job modern English reserves the mark for, and it is the Book 7 §5.4
disposition for added semicolons applied to the other mark: an addition is a
DECISION, recorded, not a silent gain. Book 8 has one, at **B08-P008** —
Butler's four-comma appositive *"Three sons of Alcinous, Laodamas, Halios, and
Clytoneus, competed also"* becomes *"Three sons of Alcinous competed as well:
Laodamas, Halios, and Clytoneus"*. It adds no sentence boundary, and under
**D27** + **D21** it is worth nothing in the compared figure, which is the
measure working rather than a loophole.

**A count could not have found either of these.** The round-1 mark census reads
`: 6 → 6` and calls the class untouched; the draft had in fact cashed one of
Butler's and added one of its own. Provenance can tell a swap from a
standstill and a count cannot, which is why D27's measure is built on the
alignment and not on the totals.

**Butler's parentheses become em dashes only where the aside is a whole
clause.** Parentheses lower an aside; dashes raise it, and the candidate's
other dashes are Butler's own, so a converted pair reads as emphasis he did not
write. Book 8 has his only parentheses at **B08-P044** — *"with plenty of fat
(for there was abundance left on the joint)"* — and the aside is a full clause
with its own subject and verb, so the conversion stands and is recorded here.
An aside that is a phrase keeps its parentheses.
