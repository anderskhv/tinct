# Fidelity Review — D9 Verification Pass (Leviathan, edition ch. 24 / Hobbes ch. 23)

**Date:** 2026-09-21
**Scope:** targeted verification of the one edit made *after* `fidelity-review-final.md` returned ACCEPT AS-IS.
**Source (locked):** `books/wip/leviathan-pilot-ch24/source.json` — 13 paragraphs
**Candidate:** `books/wip/leviathan-pilot-ch24/candidate-sonnet.json`
**Reviewer:** independent pass; the final-round review was not consulted for its verdict before reading source/candidate, only afterwards to identify the prescribed wording.

---

## 1. Coverage

Exact coverage of this pass:

| Item | Covered |
|---|---|
| Paragraph index 3 (the edited paragraph) | **Full fidelity checklist, clause by clause, whole paragraph** |
| Paragraph index 2 (preceding context) | Read in full against source; checked for change and for consistency with 3 |
| Paragraph index 4 (following context) | Read in full against source; checked for change and for consistency with 3 |
| Paragraph indices 0–1, 5–12 | **Not re-reviewed.** They were unchanged by this edit and carry the ACCEPT AS-IS from `fidelity-review-final.md`. |

**Edit isolation verified mechanically**, not by assertion. `git diff 999ce9e8 c1ed11ae -- books/wip/leviathan-pilot-ch24/candidate-sonnet.json` shows a single-line change: one paragraph removed, one added, `1 file changed, 1 insertion(+), 1 deletion(-)` for this file. The removed and added lines are index 3, differing only in the clause

- old: `— that is, the administration of its revenue and affairs.`
- new: `— that is, the management of its affairs.`

Paragraphs 2 and 4 appear in the diff only as unchanged context lines, byte-for-byte identical. `candidate-sonnet.json` and `leviathan-ch24-final.json` are currently identical files (`diff` clean), so this verification covers the finalized artifact as well.

---

## 2. The changed clause

**Source (index 3):** "…As at home, First, for the **Oeconomy** of a Common-wealth, They that have Authority concerning the Treasure, as Tributes, Impositions, Rents, Fines, or whatsoever publique revenue…"

**Candidate:** "At home, first, there are those with authority over the commonwealth's **economy — that is, the management of its affairs**. Those with authority over tributes, impositions, rents, fines, or any other public revenue…"

### 2a. Does "the management of its affairs" accurately gloss "Oeconomy"?

**Yes.** Hobbes's "Oeconomy" is the 17th-century sense inherited from *oikonomia* — the management of a household, and by extension of a state's establishment and business. "The management of its affairs" lands on exactly that sense:

- **No narrowing.** The rejected reading would be a gloss that equates economy with money, finance, or the treasury. This gloss does not; "affairs" is the general term Hobbes's sense requires. The earlier wording ("the administration of its **revenue** and affairs") did partially narrow toward finance by naming revenue inside the definition; that narrowing is now gone. This is a genuine improvement in fidelity, not a lateral move.
- **No distortion or broadening into anachronism.** "Management" does not import the modern economics sense (production, markets, national economy). A modern reader who meets "economy" cold in a 1651 text is most likely to import precisely that anachronism, so the gloss is doing necessary work and is doing it in the correct direction.
- **Addition is licensed and bounded.** The gloss is signposted with "that is," asserts nothing about the world beyond the meaning of a word, and the source word "economy" is retained rather than replaced — the reader can still see Hobbes's term.

### 2b. Does it create inconsistency with the following revenue list?

**No inconsistency — but one minor structural observation, non-blocking.**

There is no contradiction. Administering tributes, impositions, rents and fines is a species of managing a commonwealth's affairs; the general-to-specific movement is Hobbes's own. He writes the heading ("for the Oeconomy of a Common-wealth") and then immediately names the officers he has in mind under it. The candidate reproduces that movement rather than inventing one.

Observation (recorded, not a defect): because the gloss no longer names revenue, and because the source's superordinate head term "the Treasure" is not carried through (a pre-existing, documented non-blocking item — F1b in `fidelity-review-final.md`), the step from "management of its affairs" to a list of revenue items is now less signposted than in the pre-edit wording. It sits across a sentence break, so a reader could momentarily read "those with authority over the economy" and "those with authority over tributes…" as two groups rather than the genus and its instance. The source's own syntax keeps them in one breath. This is a readability nuance, not a fidelity defect: no proposition is added, lost, or altered, and nothing in the paragraph asserts that these are two separate classes of minister. It does not rise to a required fix. The finalized reviewer's own suggested wording (restoring "the public treasure —" as the head of the list) would close both F1b and this nuance in one stroke if anyone touches the paragraph again; it is not worth reopening a locked chapter on its own.

**Net:** the edit strictly improves fidelity relative to what the final review had accepted, and introduces no new defect.

---

## 3. Full fidelity checklist — paragraph index 3

Checked against source in full, not just the edited clause.

| Check | Finding |
|---|---|
| **Actors** | Correct throughout. "Others" correctly refers back to index 2's ministers of *general* administration, setting up the general/special contrast. The revenue officers are the subject of "are public ministers"; the sovereign ("the representative person"/"him") is correctly the object served. No actor swapped, merged, or invented. ✅ |
| **Negation** | "can do nothing against his command, or without his authority" preserves both limbs of source's "can doe nothing against his Command, nor without his Authority." Scope of the negation is intact — the second limb is still governed by "can do nothing," not converted into a positive. ✅ |
| **Causality** | Both of Hobbes's explanatory "because" clauses survive as because-clauses, and are still attached to the correct half of the term: *Ministers* because they serve and are bound; *Public* because they serve him in his political capacity. The two-part gloss on the compound term "Publique Minister" is structurally preserved. ✅ |
| **Certainty** | No hedges added, none removed. Source states flatly ("are Publique Ministers"); candidate states flatly. No "may," "generally," or "usually" introduced. ✅ |
| **Conditions** | The one scoping condition — this is the *at home* branch of "either at home, or abroad" — is preserved and correctly marked ("At home, first,"). The enumeration marker "First" is preserved, which matters: it is the antecedent of "Secondly" opening index 4. ✅ |
| **Omissions** | Lists complete and in source order: tributes, impositions, rents, fines, "or any other public revenue" (for "or whatsoever publique revenue") — all five elements present. Verbs complete and in order: collect, receive, issue→"disburse", take the Accounts thereof→"audit it" — all four present, and "disburse"/"audit" are accurate for the 17th-century senses of "issue" and "take the Accounts." The superordinate "the Treasure" is not carried as a head term (pre-existing F1b, documented and accepted as non-blocking; no proposition lost, since the enumerated items and the catch-all both survive). "speciall businesse" → "some particular business" ✅. Nothing else dropped. |
| **Additions** | One addition: the economy gloss, assessed in §2 and licensed. No other material added — no examples, no modern parallels, no reader-directed asides. ✅ |
| **Silent corrections** | None. Hobbes is not corrected, smoothed, or modernized in substance anywhere in the paragraph; the sentence splitting is presentational only and does not reassign any predicate. ✅ |

**Paragraph 3 verdict: correct.** No defect found beyond the pre-existing, already-documented, non-blocking F1b.

---

## 4. Neighboring paragraphs 2 and 4

**Paragraph 2 — unaffected, unchanged, consistent.** Byte-identical to the reviewed version (confirmed in the diff). Re-read against source: the general-administration content is accurate (protector/regent for the whole dominion; governor/lieutenant/prefect/viceroy for a province; the obedience conditions in the king's name and not inconsistent with sovereign power; the express-words limit on transferring sovereignty; the nerves-and-tendons simile closing the paragraph). It still sets up index 3 correctly: "some are entrusted with a **general** administration" (2) → "Others have a **special** administration" (3). The contrast pair is intact and reads continuously across the edit.

**Paragraph 4 — unaffected, unchanged, consistent.** Byte-identical to the reviewed version. Re-read against source: militia authority, the arms/forts/ports and levy/pay/lead lists, the soldier-without-command argument and its "there is no one for him to represent it to" reason are all accurate. Critically for this edit: paragraph 4 opens "**Second**, those who have authority over the militia," which depends on the "first" in the edited sentence of paragraph 3. That "first" survived the edit intact, so the first/second enumeration across the paragraph boundary is unbroken. The at-home branch is also still correctly in force — both index 3 and index 4 are "at home" items under the at-home/abroad split, and nothing in the edit disturbed that scoping.

No inconsistency of term, actor, tense, or register was introduced at either boundary.

---

## 5. Verdict

## ACCEPT AS-IS

The post-review edit to paragraph index 3 is verified correct. "The management of its affairs" glosses Hobbes's "Oeconomy" accurately, without narrowing it toward finance and without broadening it into the modern economics sense, and it is strictly more faithful than the wording the final review had accepted. It creates no inconsistency with the revenue enumeration that follows. The whole of paragraph 3 re-checked against source on actors, negation, causality, certainty, conditions, omissions, additions and silent corrections is correct. Paragraphs 2 and 4 are mechanically confirmed unchanged and read consistently with the edited paragraph, with the general/special contrast and the first/second enumeration both intact.

The chapter's ACCEPT AS-IS status stands, and the verification gap is now closed: every paragraph of the current candidate has been independently reviewed in its current form.

**Carried forward, non-blocking, no action required:** F1b (the source's head term "the Treasure" flattened into the list) and the minor signposting nuance in §2b. If the paragraph is ever reopened, the final review's suggested wording resolves both at once.
