# Fidelity Review 4 — Leviathan, edition chapter 27 (Hobbes ch. 26, "Of Civil Laws")

**Scope:** Independent re-check of the round-4 correction set against the locked source.

**Files:**
- Source (locked): `books/wip/leviathan-pilot-ch27/source.json` — 48 paragraphs
- Candidate: `books/wip/leviathan-pilot-ch27/candidate-sonnet.json` — 48 paragraphs
- Round-3 baseline for byte-diffing: git `901a313d:books/wip/leviathan-pilot-ch27/candidate-sonnet.json`
- Round-2 baseline: git `047e5690:...`
- Round-1 baseline: git `b71918d4:...`
- Prior verdicts: `fidelity-review-3.md` (ACCEPT WITH FIXES REQUIRED — 2 fixes)

**Method:** Word-level mechanical diff of round-3 → round-4 to establish the exact changed set (no reliance on the brief's claims), then paragraph-by-paragraph semantic comparison of every changed paragraph against the locked source. Full-file diff to prove no undeclared changes. Round-2/round-3 correction sets re-verified by byte comparison.

---

## VERDICT: ACCEPT AS-IS

No fidelity defect found. Every round-4 edit is meaning-preserving; both required fixes from round 3 are genuinely applied this time; the declared changed set matches the actual changed set exactly; nothing outside it moved.

**Ready for a final full non-sampled pass:** yes. See §7.

---

## 1. Structural integrity

| Check | Result |
| --- | --- |
| JSON validity | Parses clean |
| Source paragraph count | 48 |
| Candidate paragraph count | 48 |
| Index alignment source↔candidate | 1:1 — no splits, merges, drops, reorders |
| Empty/whitespace-only paragraphs | None |
| `number` field | 27 in source, candidate and `current-modern-en.json` |
| Paragraphs changed round-3 → round-4 | `[4, 8, 17, 20, 21, 27, 29, 30, 33, 34, 47]` — **exactly** the declared set |
| Paragraphs changed outside the declared set | **None** |
| Title changed round-3 → round-4 | **Yes** (see §2) |

---

## 2. FIX 1 FROM ROUND 3 — chapter title — **NOW GENUINELY APPLIED**

| | Value |
| --- | --- |
| Source | `Chapter 26. Of Civill Lawes` |
| Round-3 candidate | `Chapter 26. Of Civill Lawes` (fix claimed but never written — the round-3 defect) |
| Round-4 candidate | `Chapter 26. Of Civil Laws` |
| `current-modern-en.json` | `Chapter 26. Of Civil Laws` |

Verified by `git show` on the round-3 blob, not by trusting the round-4 report. The title is now modernized and matches `current-modern-en.json` byte for byte. Fix 1 **closed**.

---

## 3. FIX 2 FROM ROUND 3 — the "tittle" gloss — **CLOSED**

Round 3 flagged `not one tittle — not the smallest stroke — of the law of nature shall pass` as asserting the opposite of the truth (a tittle *is* the smallest stroke; the bare em-dash appositive read as a denial).

Round-4 text: `not one tittle — that is, not the smallest stroke — of the law of nature shall pass`.

The inserted `that is,` converts the appositive into an explicit gloss marker, and the second `not` now reads as carried over from `not one tittle` rather than as a denial. Source (`not one title of the Law of Nature shall passe`, Hobbes echoing Matt. 5:18) is preserved. Fix 2 **closed**. This edit sits inside paragraph 27 and was not itemized in the round-4 brief, but it is a declared round-3 requirement, not an undeclared change.

---

## 4. Paragraph-by-paragraph findings (full coverage of the round-4 set)

### Para 4 — `abrogate`/`abrogated` → `repeal`/`repealed` — **PASS**
- Source: *"For the same reason, none can abrogate a Law made, but the Soveraign; because a Law is not abrogated, but by another Law, that forbiddeth it to be put in execution."*
- Candidate: *"For the same reason, none but the sovereign can repeal a law once made; because a law is not repealed except by another law, which forbids it to be put into execution."*
- The claim about **who** may repeal is unchanged: exclusivity to the sovereign is preserved (`none but the sovereign`), and the mechanism clause (repeal only by a further law forbidding execution) is intact. Word swap only.
- Consistency note: Hobbes himself uses `repeale` natively in para 5; unifying `abrogate` to `repeal` across the chapter is a legitimate register choice, and `abrogate` (annul) and `repeal` are co-extensive here.

### Para 8 — `prescription of time` → glossed — **PASS**
- Source: *"…are now Lawes, not by vertue of the Praescription of time, but by the Constitutions of their present Soveraigns."*
- Candidate: *"…are now laws not by virtue of prescription — that is, a right created merely by long custom — but by the constitutions of their present sovereigns."*
- **Legal accuracy:** correct. Prescription is the acquisition of a right through long, uninterrupted, unchallenged use. `a right created merely by long custom` is an accurate lay statement of it, and `merely` carries the dismissive force Hobbes intends.
- **Placement:** correct. The gloss is bracketed immediately after `prescription`, inside the `not by virtue of X, but by Y` frame, so the contrast with `the constitutions of their present sovereigns` is undisturbed. The gloss also absorbs the source's `of time`, so nothing is lost by dropping that phrase.
- Consistent with para 6, which renders the same idea as `long use`.

### Para 17 — `cognisance` → `authority to hear` — **PASS**
- Source: *"the Sentence of the Judge, that by Commission hath Authority to take cognisance of such causes"* → Candidate: *"the sentence of the judge who, by commission, has authority to hear such cases"*.
- Straight synonym, no gloss marker, as declared. Cognizance = jurisdiction to hear and determine; `hear` alone is a shade narrower than `hear and determine`, but the sentence's own subject is *the judge's sentence*, so the determining power is carried explicitly by the surrounding clause. No loss of claim. (For reference, para 25 renders the parallel source phrase `heare and determine` as `hear and decide` — the asymmetry is faithful to the two different source phrasings, not an inconsistency.)

### Para 20 — doubled `still` dropped — **PASS**
- `there is still another very important condition still lacking` → `there is still another very important condition lacking`. Source: *"there wanteth yet another very materiall circumstance to make them obligatory."* Pure style repair, closing round-3 advisory #1.

### Para 21 — triple-negative restructure — **PASS (examined closely)**

Source: *"The unwritten Law of Nature, though it be easy to such, as without partiality, and passion, make use of their naturall reason, and therefore leaves the violators thereof without excuse; yet considering there be very few, perhaps none, that in some cases are not blinded by self love, or some other passion, it is now become of all Laws the most obscure; and has consequently the greatest need of able Interpreters."*

Candidate: *"The unwritten law of nature is easy to those who without partiality or passion make use of their natural reason, and therefore leaves its violators without excuse. But almost everyone is blinded by self-love or some other passion in at least some cases, and so the law of nature has nevertheless become the most obscure of all laws, and consequently the one with the greatest need of able interpreters."*

**Quantifier check.** Source: `very few, perhaps none, that in some cases are not blinded` — i.e. the set of people who are *never* blinded (not blinded in any case) is very small, perhaps empty. Negating over the near-universal quantifier gives: *nearly everyone is blinded in at least some cases*. Candidate: `almost everyone is blinded … in at least some cases`. **Logically equivalent** — the double negative is correctly discharged, and the `in some cases` scope is correctly preserved as `in at least some cases` (not upgraded to "always blinded", which would have been the classic failure mode here).

**Proposition inventory across the split.** All five propositions survive, in order:
1. The law of nature is easy to those who use natural reason without partiality or passion — **present** (promoted from concessive `though` clause to main clause).
2. Therefore it leaves violators without excuse — **present**, still attached to (1) by `and therefore`.
3. Yet nearly everyone is sometimes blinded by self-love or another passion — **present**.
4. Therefore it has now become the most obscure of all laws — **present**; the `now become` sense is carried by `has … become`.
5. And consequently has the greatest need of able interpreters — **present**.

**Concessive logic.** The original's `though X … yet Y` hinge is preserved across the sentence boundary by `But …` opening sentence two plus the retained `nevertheless` before `become the most obscure`. The reader still gets "easy in principle, obscure in practice", which is the whole point of the paragraph. Nothing was dropped in the split; no connective was inverted.

**One nuance, non-blocking:** Hobbes's `very few, perhaps none` leaves open the possibility that *literally no one* escapes; `almost everyone` implies a small residue of exceptions. The residue is however already licensed by the paragraph's own first clause (the law *is* easy to the impartial, so such people are at least conceivable), so the rendering does not contradict the source. Recorded as an observation, not a fix.

**Same paragraph, `final causes` gloss — PASS.** Source: *"…without a perfect understanding of the finall causes, for which the Law was made; the knowledge of which finall causes is in the Legislator."* Candidate: *"…without a perfect understanding of the final causes — that is, the purposes — for which the law was made; knowledge of those purposes lies with the legislator."* Gloss is accurate (Aristotelian final cause = the end/purpose for which), correctly placed, and the second clause's referent (`those purposes`) is unambiguous. `is in the Legislator` → `lies with the legislator` preserves the locative claim that this knowledge resides with him — which is what the next sentence ("To him therefore there can be no knot in the law that is insoluble") depends on.

### Para 27 — judge / tittle / fleeing-felon paragraph — **PASS on all three checks**

**(a) `chattels` gloss — accurate.** Candidate: `all his goods, chattels (that is, his personal property), debts, and dues`. Chattels are personal/movable property as distinguished from real property; `his personal property` is correct and does not collapse the list (goods, chattels, debts, dues remain four distinct items). The gloss sits inside the direct quotation, which is a slightly heavier intervention than a word swap; it is nevertheless consistent with how this paragraph's quotation is already handled (it is modernized throughout: `saith he` → `he says`, `flyeth for the same` → `flees for fear of it`), so it does not introduce a mixed convention. No change required.

**(b) `notwithstanding` → `despite` inside the quotation — safe.** I traced every subsequent argumentative move in the paragraph to see whether Hobbes's commentary leans on the literal word:
- `Here you see, An Innocent Man, Judicially Acquitted, Notwithstanding His Innocency, … condemned…` — this is an **echo of the quoted phrase**, not a gloss on the word. Round 4 changed *both* occurrences to `despite`, so the echo relation between quotation and commentary is preserved intact. Had only one been changed, the echo would have broken; it was not.
- The arguments that follow turn on (i) capital presumption vs. capital sentence, (ii) presumption having no place after judgement, (iii) refusal to hear proof. **None** of these depends on `notwithstanding` as a term of art; all depend on the concept *in spite of his established innocence*, which `despite` carries exactly.
- Hobbes's typographic emphasis (the source's title-case run) is flattened, consistent with the rest of the rendering, which flattens all such runs.
Consistent with the project rule that quoted material may be modernized unless the exact wording is load-bearing. It is not load-bearing here.

**(c) No clause of the quoted ruling dropped or altered in substance.** Clause-by-clause:

| Source clause | Candidate | |
| --- | --- | --- |
| `If a man, saith he, that is Innocent` | `'If a man,' he says, 'who is innocent` | ✔ |
| `be accused of Felony` | `is accused of a felony` | ✔ |
| `and for feare flyeth for the same` | `and flees for fear of it` | ✔ |
| `albeit he judicially acquitteth himselfe of the Felony` | `although he is judicially acquitted of the felony` | ✔ |
| `yet if it be found that he fled for the Felony` | `yet if it is found that he fled because of the felony` | ✔ |
| `he shall notwithstanding his Innocency, Forfeit` | `he shall, despite his innocence, forfeit` | ✔ |
| `all his goods, chattels, debts, and duties` | `all his goods, chattels (…), debts, and dues` | ✔ (`duties` = sums due; `dues` is the right modernization, not an omission) |
| `For as to the Forfeiture of them, the Law will admit no proofe against the Presumption in Law, grounded upon his flight.` | `For as to their forfeiture, the law will admit no proof against the presumption in law grounded on his flight.'` | ✔ |

Nothing dropped, nothing added to the ruling's substance.

**Reflow of the commentary sentence — PASS.** Source: *"…(when no written Law forbad him to fly) after his acquitall, Upon A Presumption In Law, condemned to lose all the goods he hath."* Candidate: *"…(when no written law forbade him to flee), condemned after his acquittal, on a mere presumption in law, to lose all the goods he has."* All elements present and in the same relation; `condemned` simply moved ahead of its adjuncts to stop the sentence dangling. The added `mere` is an intensifier not literally in the source's words, but it renders the source's own typographic emphasis on `Upon A Presumption In Law` (Hobbes's whole point being that the ground was *only* a presumption). Faithful; no fix required.

### Para 29 — `procure of` → `procure from` — **PASS**
Archaic preposition normalized. Source: *"but procure of the Soveraign that another be made Judge, and himselfe Witnesse."* Candidate: *"but he shall procure from the sovereign that another be made judge, and himself become witness."* No meaning change.

### Para 30 — judge's abilities vs. advocate's — **PASS**
- Source: *"The abilities required in a good Interpreter of the Law, that is to say, in a good Judge, are not the same with those of an Advocate; namely the study of the Lawes."*
- Round-3: `are not the same as those of an advocate; namely, the study of the laws.`
- Round-4: `are not the same as an advocate's, namely deep study of the laws.`
- **Intended reading preserved.** In both source and candidate the appositive `namely … study of the laws` attaches to the *advocate's* abilities, not the judge's: the advocate's qualification is legal study, and the judge's required abilities are *not* that. The elliptical possessive `an advocate's` still carries the elided head `abilities`, so the appositive has the same antecedent it had in the source. The rest of the paragraph confirms this reading is the right one (the Lords of Parliament judged well though `few of them were much versed in the study of the laws`), and that context is unchanged.
- `deep` is a small added intensifier not in the source; it usefully blocks a misreading in which a judge needs no acquaintance with law at all, and does not alter the claim. Acceptable.

### Paras 33, 34 — `abrogate` → `repeal` in the Institutes list — **PASS**
- Para 33 (Decrees of the whole people): `such of them as the emperors did not repeal remained laws by imperial authority` — source `not abrogated`. No claim change.
- Para 34 (Decrees of the common people): same substitution, same clause shape. No claim change.
- Both paragraphs' surrounding content is byte-identical to round 3 apart from these single words.

### Para 47 — closing charter/liberty paragraph — **PASS**
`or else, having been made, has now been repealed.` — source `or else having been made, is now abrogated.` Word-choice consistency only.

**Chapter-wide consistency check:** zero occurrences of `abrogat*` remain anywhere in the candidate; `repeal` is now the single rendering (paras 4, 5, 33, 34, 45, 47). Zero occurrences of `cognisance`/`cognizance`, `notwithstanding`, `Civill`, `Lawes`.

---

## 5. Round-2 / round-3 correction set — re-verification

| Para | vs round-3 blob | vs round-2 blob | Status |
| --- | --- | --- | --- |
| 6 | byte-identical | differs | Re-edited in **round 3** (it was in the declared round-3 set) and certified there; **untouched in round 4**. ✔ |
| 9 | byte-identical | byte-identical | Untouched since round 2. ✔ |
| 10 | byte-identical | byte-identical | Untouched since round 2. ✔ |
| 28 | byte-identical | differs | Re-edited in **round 3** (declared round-3 set) and certified there; **untouched in round 4**. ✔ |

Note on the brief: paragraphs 6 and 28 cannot be byte-identical to their *round-2* state, because round 3 legitimately re-edited them (`fidelity-review-3.md` §1 records the same point). Their "previously-certified state" is therefore the round-3 state, and against that they are byte-identical. No round-4 regression.

---

## 6. Carried-forward advisories (non-blocking, still open)

Round 3 logged three advisories. One was fixed this round; two remain and were correctly left out of the round-4 set:

1. ~~Para 20 doubled `still`~~ — **fixed in round 4**.
2. **Para 13** — the paragraph opens with `some class or rank of men` but two clauses later says `those in that condition`, whose antecedent is now the source's word rather than the candidate's. Cosmetic consistency; the referent is still recoverable. Still open.
3. **Para 5** — `For a man who can free himself whenever he wills was never truly bound` renders the source's present-tense general maxim (`For he is free, that can be free when he will`) as a past-tense particular claim, mildly duplicating the preceding clause. Meaning intact. Still open.

One new observation, also non-blocking:

4. **Para 33** — `For every law that binds is understood to bind by the authority of whoever has the power to repeal it` renders the source's `are understood to be Lawes by his authority that has power to repeale them`. "Understood to *bind* by that authority" vs. "understood to *be laws* by that authority" is a hair's-breadth shift; in a sentence whose subject is binding force it makes no practical difference. Pre-existing (not introduced this round). Flag for the final full pass only if a reviewer wants literal parity.

---

## 7. Coverage statement

- All 11 declared round-4 paragraphs (**4, 8, 17, 20, 21, 27, 29, 30, 33, 34, 47**) compared in full against the locked source: **11/11 covered**.
- Chapter title verified against source, against the round-3 blob (to confirm the round-3 claim really was false), and against `current-modern-en.json`: **covered — now correct**.
- Both round-3 required fixes re-verified as actually applied in the file, not merely reported: **2/2 closed**.
- Paragraph 21's restructure checked for quantifier equivalence and for proposition loss across the sentence split: **covered — equivalent, nothing dropped**.
- Paragraph 27's quoted ruling checked clause-by-clause, plus a trace of the surrounding commentary for dependence on the literal word `notwithstanding`: **covered — no dependence, no clause lost**.
- Round-2/round-3 correction set (6, 9, 10, 28) byte-compared against both baselines: **covered — no regression**.
- All 48 paragraphs machine-diffed round-3 → round-4: **no undeclared changes**; the changed set is exactly the declared set.
- Structural integrity (count, alignment, JSON validity, `number`, empty paragraphs): **covered — clean**.

**Readiness for the final full non-sampled pass:** Yes, this chapter looks ready. Four consecutive rounds have produced no claim-level fidelity error; round 4 found none at all, and the only two outstanding items are cosmetic advisories in paragraphs the correction cycle has never had to revisit for meaning. The remaining risk is not in the corrected paragraphs but in the ~37 paragraphs no round has examined closely — a full non-sampled read is the right next and, on this evidence, final step. Recommend that pass also sweep the three carried-forward advisories (§6) so they close with it rather than triggering a round 5.
