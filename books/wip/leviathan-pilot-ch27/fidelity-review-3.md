# Fidelity Review 3 — Leviathan, edition chapter 27 (Hobbes ch. 26, "Of Civil Laws")

**Scope:** Independent re-check of the round-3 correction set against the locked source.
**Files:**
- Source: `books/wip/leviathan-pilot-ch27/source.json` (48 paragraphs)
- Candidate: `books/wip/leviathan-pilot-ch27/candidate-sonnet.json` (48 paragraphs)
- Round-2 baseline for byte-diffing: git `047e5690:books/wip/leviathan-pilot-ch27/candidate-sonnet.json`
- Round-1 baseline: git `b71918d4:...`

**Method:** Mechanical JSON diff of round-2 → round-3 (word-level opcodes) to establish the exact changed set, then paragraph-by-paragraph semantic comparison of every changed paragraph against the source. Round-2 set verified byte-identical where it should be.

---

## VERDICT: ACCEPT WITH FIXES REQUIRED

Two required fixes. No fidelity/claim errors were found — every round-3 edit preserves the source's proposition. Both required fixes are execution defects, not meaning errors:

1. **The chapter title fix was NOT applied.** (declared but missing)
2. **Paragraph 27's "tittle" gloss is self-contradictory as written.** (the caller's suspicion is confirmed)

Three further minor advisories are listed at the end; they are not blockers.

---

## 1. Structural integrity

| Check | Result |
| --- | --- |
| Source paragraph count | 48 |
| Candidate paragraph count | 48 |
| Index alignment source↔candidate | 1:1, no splits/merges/drops |
| `number` field | 27 in both (and in `current-modern-en.json`) |
| Paragraphs changed round-2 → round-3 | `[3, 5, 6, 11, 13, 20, 21, 24, 27, 28, 30]` — **exactly** the declared set |
| Paragraphs changed outside the declared set | **None** |
| Title changed round-2 → round-3 | **No** — see Fix 1 |

For reference, the round-2 changed set was `[6, 9, 10, 27, 28, 29, 47]` (the brief described it as "6, 9, 10"; the wider set is what the round-2 commit actually contains). Of those, **9, 10, 29 and 47 are byte-identical between round 2 and round 3** — untouched, as required. Paragraphs 6, 27 and 28 were legitimately re-touched in round 3 (each is in the declared round-3 set), and in each case the round-3 edit is a single surgical substitution that leaves the round-2 correction intact — verified word-by-word below. Note the brief's instruction to confirm paragraph 6 is "byte-identical" to round 2 is self-contradictory, since round 3 explicitly changes paragraph 6; resolved in favour of the declared round-3 change, and the round-2 content of 6 (including its `equity — that is, by what is fair, apart from the letter of the law` gloss) is confirmed otherwise unchanged.

---

## 2. Index-mapping correction to the brief

The set of changed indices is exactly as declared, but three of the brief's labels are attached to the wrong index. Verified actual locations:

| Edit | Brief said | Actually at |
| --- | --- | --- |
| `viva voce` gloss | para 21 | **para 24** |
| Judge double-negative flip | para 24 | **para 27** |
| `tittle` gloss | para 27 | **para 27** (correct — 27 received both edits) |
| Gordian knot idiom | "para 21, locate by content" | **para 21** (confirmed by searching "Gordian") |

No content consequence; recorded so round-4 instructions cite the right indices.

---

## 3. Paragraph-by-paragraph findings (full coverage of the round-3 set)

### Para 3 — double-negative flips ×2 — **PASS**
- Source: `there is nothing that is not at first sight evident` → Candidate: `everything is evident at first sight.` Logically equivalent (¬∃x ¬E(x) ≡ ∀x E(x)). No claim change.
- Source: `nothing being reputed Unjust, that is not contrary to some Law` → Candidate: `an act is reputed unjust only when it is contrary to some law`. Both encode *unjust ⟹ contrary to some law* (contrariety is necessary, not sufficient). The "only when" form preserves the necessary-condition direction and does **not** invert it into a sufficiency claim. Correct.
- Sentence re-segmentation ("He sees also that…") is cosmetic; the enumeration of the four deductions is intact.

### Para 5 — "For he is free who can be free whenever he wills." — **PASS (with note)**
- Source: `For he is free, that can be free when he will`.
- Candidate: `For a man who can free himself whenever he wills was never truly bound.`
- The source's maxim is offered in support of the immediately preceding clause `and consequently he was free before`, i.e. the sovereign was never really bound because he could always release himself. The candidate states exactly that. Logical claim unchanged; free ≡ not bound in Hobbes's usage here, and the final clause of the paragraph (`the one bound only to himself is not bound at all`) is untouched and still carries the source's own gloss.
- Note (non-blocking): the source states a general present-tense maxim (*he is free that can be free*), the candidate a past-tense claim about a particular man. This makes the maxim read as a conclusion rather than a principle, and creates mild redundancy with the paragraph's closing clause. Acceptable; not a fidelity defect.

### Para 6 — "prejudice" → "detriment" — **PASS**
- Source: `the Length of Time shal bring no prejudice to his Right`. Here "prejudice" is the legal sense *harm/impairment to a right* — exactly "detriment". The bias sense is correctly excluded. Single-word substitution; the rest of the paragraph (including the round-2 equity gloss) is byte-identical to round 2.

### Para 11 — "natural fools" gloss — **PASS**
- Candidate: `Over natural fools (that is, those born without the capacity to reason), children, or madmen there is no law…`
- Historically accurate. In early-modern English law Hobbes's "natural fool" is the *idiot a nativitate* — one lacking reason from birth — and is categorically distinguished from the *madman/lunatic*, who once had reason and lost it. The gloss's "born" element is what preserves that distinction, and the candidate keeps "madmen" separately listed, so the three-way legal-incapacity category (fools / children / madmen) is not collapsed.
- The gloss does not overreach into a medical or moral claim, and Hobbes's actual ground for the exemption — `they never had the power to make a covenant, or to understand its consequences` — remains stated in the candidate's own next clause, so the gloss is not carrying argumentative weight it shouldn't.

### Para 13 — "some condition of men" → "some class or rank of men" — **PASS (with advisory)**
- Source: `a Law that obliges only some condition of men`. "Condition" here = station/rank/estate. The replacement is correct and removes the medical reading.
- Advisory: the candidate's very next clause still reads `distinguish those in that condition from other subjects` (mirroring the source's own `in such a condition`). The deconfusing intent is therefore only half-applied. Harmless — the antecedent is now explicit two clauses earlier — but for full consistency consider `those in that class or rank`.

### Para 20 — "wanting" → "still lacking" — **PASS (with advisory)**
- Source: `there wanteth yet another very materiall circumstance to make them obligatory`. De-archaizing "wanting" is correct and the claim is unchanged.
- Advisory: the candidate now reads `there is **still** another very important condition **still** lacking`. The doubled "still" is clumsy. Recommend `there is still another very important condition lacking` or `there is yet another very important condition still lacking`. Style only.

### Para 21 — Gordian knot idiom — **PASS**
- Source: `(as Alexander did with his sword in the Gordian knot)` → Candidate: `(as Alexander did with his sword, cutting the Gordian knot)`.
- Correctly decompresses the idiom without adding a claim. The surrounding argument — that the sovereign can either *find* the law's ends to untie the knot or *make* whatever ends he wills — is preserved, and the "cutting" verb correctly attaches to the second (legislative fiat) branch, which is the branch Hobbes is illustrating. Good.

### Para 24 — `viva voce` gloss — **PASS**
- Source (a marginal heading): `The Interpreter Of The Law Is The Judge Giving Sentence Vivâ Voce In Every Particular Case`.
- Candidate: `…giving sentence viva voce — that is, by word of mouth — in every particular case.`
- Gloss is accurate (*by living voice*, i.e. orally/by word of mouth) and the Latin is retained beside it. The circumflex is dropped; consistent with the candidate's treatment of source diacritics elsewhere. No claim change.

### Para 27 — judge double-negative flip — **PASS**
- Source: `there is no Judge Subordinate, nor Soveraign, but may erre in a Judgement of Equity`.
- Candidate: `every judge, subordinate or sovereign, is capable of erring in a judgement of equity`.
- The source's "no X but may Y" construction means *every X may Y*. The flip is exact: every judge CAN err, i.e. none is infallible. Modality (`may` → `is capable of`) preserved — it is not strengthened into "does err". Correct.
- **Rest of paragraph 27 verified untouched.** Word-level diff against round 2 shows only two changed spans in this paragraph (this flip and the tittle gloss). Specifically confirmed intact: the fleeing-felon hypothetical, the Coke quotation block including the round-2 `notwithstanding his innocence` correction, the `forfeit all his goods, chattels, debts, and dues` list, the capital-presumption dilemma, and the closing `their presumption is mere prejudice` passage. No collateral damage.

### Para 27 — "tittle" gloss — **FLAGGED, FIX REQUIRED** (see §4)

### Para 28 — "cavil" → "frivolous objection" — **PASS**
- Source: `Commentaries are commonly more subject to cavill, than the Text`. "Cavil" = a frivolous or captious objection; the replacement is accurate and keeps the argument (commentary invites more quibbling, hence needs further commentary, hence infinite regress). No claim change.

### Para 30 — "preferments" → "advancements in office" — **PASS**
- Source: `Contempt Of Unnecessary Riches, and Preferments`. "Preferment" = promotion/appointment to office or dignity. The replacement is accurate and, importantly, keeps the term distinct from "riches" in the pair (money vs. office), which a vaguer rendering like "advancement" alone would have blurred. The four-item list of judicial virtues is otherwise intact.

---

## 4. FIX REQUIRED #1 — Paragraph 27 "tittle" gloss is self-contradictory

Current text:

> `nay, heaven and earth shall pass, but not one tittle — not the smallest stroke — of the law of nature shall pass, for it is the eternal law of God.`

The caller's suspicion is **confirmed**. A tittle *is* the smallest stroke — the term (Matthew 5:18, which Hobbes is echoing; source spells it `title`) denotes precisely the tiniest diacritical mark of a letter. So an em-dash appositive reading `tittle — not the smallest stroke` asserts the opposite of the truth: it tells the reader a tittle is *not* the smallest stroke.

There is a second, benign parse — an emphatic negative parallel, "not one tittle, not the smallest stroke, shall pass" — and under that parse the sentence is fine. But it is not the parse a reader of this candidate will reach for, because **this candidate uses em-dash appositives as its standard gloss device throughout the chapter**: `equity — that is, by what is fair…` (para 6), `viva voce — that is, by word of mouth —` (para 24), `the intent, or meaning — that is, the authentic interpretation…` (para 20). Slotting a non-gloss appositive into the one place where a gloss is most obviously expected is a trap.

The underlying proposition of the sentence is unharmed either way, so this is a clarity defect rather than a fidelity error — but it is exactly the kind of gloss that teaches the reader something false, which is worse than no gloss.

**Recommended fixes (any one):**
- `but not one tittle — not even the smallest stroke — of the law of nature shall pass` (keeps the emphatic reading, disambiguates with "even")
- `but not one tittle (the smallest stroke of a letter) of the law of nature shall pass` (makes it an explicit gloss)
- `but not one tittle — that is, not the smallest stroke — of the law of nature shall pass` (matches the chapter's house gloss style)

The third is the most consistent with the rest of the chapter.

## 5. FIX REQUIRED #2 — Chapter title was not modernized

Declared round-3 change: `"Chapter 26. Of Civill Lawes"` → `"Chapter 26. Of Civil Laws"`.

Actual state:

| File | `title` |
| --- | --- |
| `source.json` | `Chapter 26. Of Civill Lawes` |
| `candidate-sonnet.json` | `Chapter 26. Of Civill Lawes` ← **unchanged** |
| `current-modern-en.json` | `Chapter 26. Of Civil Laws` |

The round-2 → round-3 diff confirms the `title` field was not touched. The candidate still carries the archaic spelling and therefore does **not** match `current-modern-en.json`. Apply the declared change.

---

## 6. Advisory (non-blocking) summary

1. **Para 20** — doubled "still" (`there is still another… condition still lacking`). Style.
2. **Para 13** — residual `those in that condition` two clauses after `class or rank of men`. Consistency.
3. **Para 5** — maxim shifted from present-tense general principle to past-tense particular claim; mildly redundant with the paragraph's closing clause. Meaning intact.

---

## 7. Coverage statement

- All 11 declared round-3 paragraphs (3, 5, 6, 11, 13, 20, 21, 24, 27, 28, 30) compared against the locked source in full: **11/11 covered**.
- Chapter title compared against source and `current-modern-en.json`: **covered — fix required**.
- Round-2 correction set verified against the round-2 commit: paragraphs **9, 10, 29, 47 byte-identical**; paragraphs **6, 27, 28** legitimately re-edited in round 3 with the round-2 corrections verified intact.
- All 48 paragraphs machine-diffed round-2 → round-3: **no undeclared changes**.
- No round-3 edit alters a claim of the source. The two required fixes are an unapplied change and a misleading gloss.
