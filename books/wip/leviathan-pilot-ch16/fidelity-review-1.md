# Fidelity Review 1 (Reviewer B) — Leviathan, edition chapter 16

**Book / chapter:** Hobbes, *Leviathan* — edition chapter 16 = Hobbes's Chapter 15, "Of Other Lawes of Nature"
**Fidelity anchor:** `books/wip/leviathan-pilot-ch16/source.json` (locked source, 43 paragraphs)
**Candidate:** `books/wip/leviathan-pilot-ch16/candidate-sonnet.json` (43 paragraphs)
**Reviewer:** independent second-pass reviewer; verdict re-derived from the text, not from any drafter self-report.
**Date:** 2026-09-21

---

## VERDICT: ACCEPT WITH FIXES REQUIRED

Three blocking fidelity defects (B1–B3 below) must be corrected before this
chapter is pinned. Everything else in the chapter — the numbered laws, their
prohibitions and requirements, the structure, and the cross-packet terminology —
holds up. No re-draft is needed; all three are localized patches.

---

## 1. Coverage statement

- Read **both files in full**, every paragraph individually, source vs. candidate
  side by side. **No paragraph was skimmed or sampled.**
- Paragraph coverage: **source indices 0–42 against candidate indices 0–42 (all 43
  paragraphs, 1:1).**
- Packets used, each read with one paragraph of context on either side:
  - Packet A: 0–7
  - Packet B: 8–14 (covers the drafting boundary at 14/15)
  - Packet C: 15–21
  - Packet D: 22–28 (covers the drafting boundary at 28/29)
  - Packet E: 29–35
  - Packet F: 36–42
- After the packets, a **whole-chapter single pass** was done specifically for
  cross-boundary issues: recurring-term consistency, the numbering sequence of
  the laws, and claims set up in one packet and paid off in another (e.g. the
  "equity … as shall be shewn in due place" promise at idx 14 paid off at idx 24;
  the pardon law at idx 17 referenced back at idx 19; the natural-equality law at
  idx 21 referenced back at idx 22).

## 2. Structure confirmation

| Check | Source | Candidate | Result |
|---|---|---|---|
| Paragraph count | 43 | 43 | PASS |
| Paragraph order / 1:1 alignment | — | — | PASS (no merges, splits, reorders, drops) |
| Empty paragraphs | none | none | PASS |
| `number` | 16 | 16 | PASS |
| `title` | "Chapter 15. Of Other Lawes of Nature" | "Chapter 15. Of Other Laws of Nature" | PASS (spelling modernized, chapter number preserved) |
| `section` | "Part I — Of Man" | **absent** | see N11 |

Run-in section headers in the source (idx 2, 18, 32, 37) are all present in the
candidate, rendered consistently as bracketed heading lines. This is consistent
across all three packets (idx 2 is packet 1, idx 18 packet 2, idx 32 and 37
packet 3), which is a cross-boundary consistency win, not a defect.

## 3. Numbering scheme of the laws — VERIFIED, no renumbering

Every explicit ordinal in the source appears in the candidate at the same
paragraph index with the same number, and every law left unnumbered by Hobbes is
left unnumbered by the candidate (no helpful renumbering slipped in):

| Source idx | Source ordinal | Candidate | Law content — match? |
|---|---|---|---|
| 0 | "a Third" | "a third law" | keep the covenants you make — PASS |
| 15 | "the fourth Law of Nature" | "the fourth law of nature" | gratitude: giver must have no reasonable cause to repent his goodwill — PASS |
| 16 | "A fifth Law of Nature … COMPLEASANCE" | "A fifth law of nature is COMPLAISANCE" | every man strive to accommodate himself to the rest — PASS |
| 17 | "A sixth Law of Nature" | "A sixth law of nature" | pardon past offences of the repentant, on caution of the future — PASS |
| 18 | "The Seventh, That In Revenges…" (header) | "[The seventh law: …]" | PASS |
| 19 | "A seventh is" | "A seventh law is" | in revenge look not at the past evil but the future good — PASS |
| 20 | "in the eighth place" | "as an eighth law of nature" | no declaring hatred/contempt by deed, word, countenance, gesture — PASS |
| 21 | "the ninth Law of Nature" | "the ninth law of nature" | acknowledge every other as equal by nature — PASS |
| 22 | (unnumbered) "another" | (unnumbered) "Another law" | reserve no right you'd deny others — PASS |
| 23 | (unnumbered) | (unnumbered) | a trusted judge must deal equally — PASS |
| 25 | (unnumbered) "another law" | (unnumbered) "another law" | indivisibles enjoyed in common, unstinted or proportionally — PASS |
| 26 | (unnumbered) | (unnumbered) | entire right / first possession determined by lot — PASS |
| 29 | (unnumbered) | (unnumbered) | mediators of peace get safe conduct — PASS |
| 30 | (unnumbered) | (unnumbered) | those at controversy submit to an arbitrator — PASS |
| 31 | (unnumbered) | (unnumbered) | no man arbitrator in his own cause — PASS |
| 32 | "The Eighteenth, No Man To Be Judge…" (header) | "[The eighteenth law: …]" | PASS — the anomalous "Eighteenth" is preserved, not silently renumbered to fit the visible sequence |
| 33 | (unnumbered) | (unnumbered) | no arbitrator with greater profit/honour/pleasure from one side — PASS |
| 34 | (unnumbered) | (unnumbered) | in a controversy of fact, credit a third (or third and fourth) witness — PASS |

The load-bearing definitional claims (justice = performance of covenant;
injustice = the not-performance of covenant; injustice of actions = injury and
supposes a particular person injured; commutative = justice of a contractor;
distributive = justice of an arbitrator, more properly equity; ingratitude;
contumely; pride; pleonexia; acception of persons/prosopolepsia; *in foro
interno* vs *in foro externo*; the negative golden rule) are all present with
their prohibitions/requirements intact.

## 4. Packet-boundary consistency — explicit statement

**Both drafting seams are clean.** I checked idx 13–16 and idx 27–30 line by
line for terminology drift, dropped antecedents, and continuity breaks.

- **Boundary 14/15:** idx 14 ends packet 1 with "more properly called equity —
  which is also a law of nature, as will be shown in its proper place"; idx 15
  opens packet 2 with "Just as justice depends on a prior covenant, gratitude
  depends on a prior act of grace." The backward reference to the
  justice/covenant framing established in idx 0–13 is preserved and uses the
  same vocabulary ("covenant", "justice"). The forward promise about equity is
  paid off at idx 24 with the same word, **EQUITY**. No drift.
- **Boundary 28/29:** idx 28 closes the lot/first-possession sequence, idx 29
  opens the safe-conduct law. No shared antecedent crosses this seam; nothing is
  orphaned; "law of nature" phrasing is identical on both sides.

Recurring-term audit across all three packets:

| Concept | P1 (0–14) | P2 (15–28) | P3 (29–42) | Consistent? |
|---|---|---|---|---|
| Lex naturalis | "law of nature" | "law of nature" | "law of nature" | YES |
| Covenant | "covenant" | "covenant" | "covenant" | YES (never drifts to "contract" except where source says *Contract*) |
| Equity | "equity" (idx 14) | "EQUITY"/"equity" (24, 25, 26) | "equity" (36) | YES |
| Arbitrator / arbitration | "arbitrator" (14) | "judges and arbitrators" (23) | "ARBITRATOR"/"arbitrator" (35, 36, 38) | YES — never drifts to "referee"/"mediator" |
| Commonwealth | "commonwealth" (2) | "commonwealths" (11) | — | YES |
| Propriety | "property" (2) | "property" (11 by implication) | — | YES |
| Acception of Persons | — | "favoritism, or Prosopolepsia" (24) | "favoritism" (39) | YES — same English word used at both occurrences, in different packets |
| *In foro interno/externo* | — | — | Latin kept + glossed at first use (37), reused bare (38) | YES |
| "Just"/"unjust" as quoted terms | curly-quoted (2, 9) | — | — | YES |
| Bracketed run-in headers | idx 2 | idx 18 | idx 32, 37 | YES — identical convention |

Note `Jus`/`Lex` do not appear as distinguished Latin terms anywhere in this
source chapter, so no consistency question arises for them.

Only cross-packet inconsistency found is cosmetic: transliterated Greek is
lowercased at *pleonexia* (idx 22) and *kleronomia* (idx 27) but capitalized at
*Prosopolepsia* (idx 24). See N10.

---

## 5. Blocking defects (must fix)

### B1 — idx 5: source's "by any way" narrowed to "by breaking one's word"

- **Source:** "As for the Instance of gaining the secure and perpetuall felicity
  of Heaven, **by any way**; it is frivolous: there being but one way
  imaginable; and that is not breaking, but keeping of Covenant."
- **Candidate:** "As for the example of gaining heaven's secure and everlasting
  happiness **by breaking one's word** — that argument is worthless, since there
  is only one way anyone can imagine reaching it, and that way is not breaking
  but keeping one's covenant."
- **What's wrong:** Hobbes's clause is deliberately open ("by any way at all"),
  which is what makes the follow-on ("there being but one way imaginable")
  bite. The candidate pre-loads the answer into the premise, so the sentence now
  says "gaining heaven by breaking one's word … the way is not breaking but
  keeping" — self-refuting rather than argumentative. This is an unlicensed
  narrowing of the source claim.
- **Fix:** "As for the example of gaining heaven's secure and everlasting
  happiness **by any means whatever** — that argument is worthless, since there
  is only one way anyone can imagine reaching it, and that way is not breaking
  but keeping one's covenant."

### B2 — idx 21: referent flip on "them who distrust their owne wisdome"

- **Source:** "Nor when the wise in their own conceit, contend by force, with
  **them who distrust their owne wisdome**, do they alwaies, or often, or almost
  at any time, get the Victory."
- **Candidate:** "and when men who consider themselves wise try to force their
  will on **people who distrust that wisdom**, they don't always — or even often,
  or hardly ever — come out the winners."
- **What's wrong:** Actor/referent error. In the source, "their owne wisdome"
  belongs to the *second* group — the modest, who mistrust *their own*
  wisdom. That is the whole point: even the self-doubting beat the
  self-conceited. The candidate reassigns the possessive to the first group, so
  the second group now merely distrusts *the wise men's* wisdom, and the
  argument for natural equality loses its force. This paragraph is the
  justification for the ninth law, so it is load-bearing.
- **Fix:** "…try to force their will on **people who have no confidence in their
  own wisdom**, they don't always…"

### B3 — idx 41: causal connective "and consequently" reversed to "And yet"

- **Source:** "And therefore so long as man is in the condition of meer Nature,
  (which is a condition of War,) as private Appetite is the measure of Good, and
  Evill: **and consequently** all men agree on this, that Peace is Good…"
- **Candidate:** "So as long as a man remains in the condition of pure nature —
  which is a condition of war — private appetite is the measure of good and
  evil. **And yet** all men agree on this much: that peace is good…"
- **What's wrong:** Causality flip. The source's "and consequently" presents the
  agreement about peace as *following from* the preceding clause; the candidate's
  "And yet" presents it as standing *in opposition to* it. The locked source is
  the sole fidelity anchor even where it reads awkwardly (this sentence is
  textually rough in the source), and "and yet" is precisely the kind of silent
  smoothing the protocol forbids.
- **Fix:** replace "And yet all men agree on this much" with "**and consequently
  all men agree on this**".

---

## 6. Non-blocking notes (recommended, not gating)

- **N1 — idx 3, "to make, or not make" → "making or breaking".** Source pairs
  *make / not make* and *keep / not keep*. The candidate renders the first pair
  as "making or breaking", duplicating the second pair's sense. Fix: "making or
  not making, keeping or not keeping covenants".
- **N2 — idx 3, "Cokes Commentaries on Litleton" → "Coke's Commentary on
  Littleton".** Spelling modernization of the name is fine; the shift from plural
  *Commentaries* to singular *Commentary* is an unnecessary change. Restore
  "Commentaries on Littleton".
- **N3 — idx 3, "attainted … the Atteynder be voyd" → "convicted … the conviction
  becomes void".** "Attainder" is a specific legal status, not a generic
  conviction. Acceptable as modernization, but "the attainder is void the instant
  it does" (with attainder kept) would be more faithful and is still readable.
- **N4 — idx 7, hearsay chain shortened.** Source: "that they know those, that
  knew them, that knew others, that knew it supernaturally" (four links).
  Candidate: "claim to have heard from others who knew others who knew it
  supernaturally" (three). The comic regress is slightly flattened; restore the
  extra link.
- **N5 — idx 9, "a certain Noblenesse or Gallantnesse of courage" → "a certain
  nobility or generosity of spirit".** "Courage" is dropped and "gallantness"
  becomes "generosity". Suggest "a certain nobility or gallantry of courage".
- **N6 — idx 9, added qualifiers.** Source: "for such Actions, as he does, of
  [=or] forbeares to do, for feare". Candidate adds "just actions he performs, or
  wrong actions he refrains from". The gloss is a correct reading of the
  antecedent, but it is supplied, not present. Acceptable; flagged for disclosure.
- **N7 — idx 16, "a diversity of Nature, rising from their diversity of
  Affections" → "varies according to their differing temperaments".** The
  two-level structure (diversity of nature arising *from* diversity of
  affections) is collapsed into one. Suggest "a diversity of nature arising from
  their differing affections".
- **N8 — idx 29, "Intercession" → "negotiation".** Intercession here means
  mediation on another's behalf, and the paragraph's whole point is about
  *mediators*. "Mediation" is the closer word. Also "safe Conduct" → "safe
  passage" — "safe conduct" is still ordinary modern English and is the term of
  art; consider restoring it (used consistently twice in the candidate either way).
- **N9 — idx 41, "not the Cause, but the Quantity of a gift, made Liberality" →
  "the size of a gift, not its motive, that made generosity".** The source uses
  *Cause* in both halves of the parallel; the candidate renders the first as
  "cause" and the second as "motive", breaking Hobbes's deliberate repetition.
  Fix: "not its cause" in both. Relatedly, "mediocrity of passions" → "a moderate
  middle ground between passions" — the mean is *of* the passions, not *between*
  them; "in a mean of the passions" is closer.
- **N10 — transliterated Greek capitalization.** *pleonexia* (22) and
  *kleronomia* (27) are lowercase, *Prosopolepsia* (24) is capitalized. Pick one
  convention. (Source capitalizes all three, so lowercasing all three is also
  fine — just be consistent.)
- **N11 — `section` field missing.** Source carries `"section": "Part I — Of
  Man"`; the candidate JSON omits it. Restore it at assembly so the merged
  edition keeps the part label.
- **N12 — added glosses (all acceptable, listed for disclosure):** idx 2 "in the
  schools — that is, in scholastic philosophy"; idx 20 "contumely — that is, open
  insult or scorn"; idx 24 "Prosopolepsia — that is, showing partiality toward
  particular persons"; idx 33 "in accepting the case"; idx 37 "in foro interno —
  that is, within the inner court of conscience". These are explanatory
  expansions of terms actually in the source, not new claims.
- **N13 — idx 38, silent repair of a defective source sentence.** Source: "For
  though his Action in this case, be according to the Law; which where the
  Obligation is In Foro Interno, is a breach." — the subject of "is a breach" is
  missing in the locked source. The candidate supplies "his intention". This is a
  supplied word, but the sentence is unreadable without one and the supplied
  sense is the only one available from context. Flagged per protocol; no change
  required.

## 7. Clean checks (no defects found)

Checked and clear on every paragraph: **negation** (no dropped/added/flipped
"not", "never", "no", including the negated golden rule at idx 41, the "no man
is a fit arbitrator" at idx 36, and the double negative at idx 21 "very few so
foolish that had not rather govern themselves"); **conditions** (all "if" /
"unless" / "provided that" scopes and consequents preserved, e.g. idx 12's
two-branch "if he hath not … and if he have"); **certainty/hedging** ("I know
that Aristotle", "I say it is not against reason", "as I have sayd before", "as
shall be shewn in due place", "they say", "it is manifest", "rarely found" — all
preserved at the same strength); **actors** (master/servant/stranger triangle at
idx 11 correct; who is injured vs. who is damaged correct; Saturn deposed *by*
Jupiter correct); **omissions** (no dropped examples, numbers, or asides — the
stone/edifice simile, *commodi*, the Coke citation, drunkenness/intemperance,
fortitude and liberality examples, all six vices at idx 39, all present);
**additions** (no invented content beyond the glosses in N12); **unmodernized
quotations** (every quoted law formula and the scholastic definition of justice
is rendered in modern English — no archaic islands; Latin *in foro interno /
externo*, *commodi*, and the Greek transliterations are correctly kept as
technical terms and glossed).

---

**Summary:** 3 blocking fixes (idx 5, idx 21, idx 41), 13 non-blocking notes,
43/43 paragraphs read individually, numbering verified, packet boundaries clean.
