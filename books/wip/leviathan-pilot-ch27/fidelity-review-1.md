# Fidelity Review 1 (Reviewer B) — Leviathan, edition ch. 27 (Hobbes ch. 26), "Of Civil Laws"

- **Fidelity anchor:** `books/wip/leviathan-pilot-ch27/source.json` (48 paragraphs, 1651 Gutenberg text)
- **Candidate:** `books/wip/leviathan-pilot-ch27/candidate-sonnet.json` (48 paragraphs)
- **Reviewer:** independent pass; drafter self-reports not relied on.
- **Date:** 2026-09-21

## Coverage

Every one of the 48 paragraphs was read individually, source vs. candidate, side by side.
Nothing was skimmed or sampled.

Packets actually used (each read with one paragraph of context on each side):

| Packet | Certified | Context read |
|---|---|---|
| 1 | 0–9 | 10 |
| 2 | 9–18 | 8, 19 |
| 3 | 18–27 | 17, 28 |
| 4 | 28–37 | 27, 38 |
| 5 | 38–47 | 37 |

Structural checks run: paragraph count 48 = 48; no merges, splits, reorderings; per-paragraph
word-count ratio candidate/source between 0.85 and 1.20 for all 48 (no paragraph silently
compressed or padded). Recurring-term census run across the whole chapter
(commonwealth / sovereign / equity / sentence / judgement / interpret / Latin terms).

Whole-chapter re-read done afterwards in one pass, focused on the two drafting
boundaries. Batch membership was verified from the batch files rather than assumed:
**batch A = 0–15, batch B = 16–31, batch C = 32–47**, so the boundaries are 15/16 and 31/32
as stated.

I also diffed the candidate against `current-modern-en.json` to see exactly what this pass
changed; that diff is referenced below where relevant, but the verdict is derived from
`source.json` alone.

---

## Blocking defects

### 1. Paragraph 28 — inverted/garbled main clause (meaning destroyed)

- **Source:** "In like manner, when question is of the Meaning of written Lawes, he is not the
  Interpreter of them, that writeth a Commentary upon them."
- **Candidate:** "In the same way, when the question is the meaning of written laws, the man who
  is not the interpreter of them is the one who writes a commentary on them."
- **What's wrong:** Hobbes denies interpretive authority to commentators ("the man who writes a
  commentary on them is not their interpreter"). The candidate converts this into a
  pseudo-definition of the non-interpreter — it reads as if identifying *who* the non-interpreter
  is, which is not a claim Hobbes makes and is not even coherent. The rest of the paragraph
  (commentaries need further commentaries; therefore the interpreter must be the authorised or
  the ordinary judge) no longer follows from its own opening sentence.
- **Fix:** "In the same way, when the question is the meaning of written laws, the man who writes
  a commentary on them is not their interpreter."
- **Note:** this defect is inherited verbatim from `current-modern-en.json` — this pass did not
  touch paragraph 28. It is the one genuine fidelity failure in the chapter.

### 2. Paragraph 29 — dropped actor ("of the Soveraign")

- **Source:** "...but procure of the Soveraign that another be made Judge, and himselfe Witnesse."
- **Candidate:** "...but he shall procure that another be made judge, and himself become witness."
- **What's wrong:** Omission. The source specifies that the substitute judge is procured *from the
  sovereign* — this is the point of the example (the judge cannot fix the problem on his own
  authority). Candidate leaves the judge apparently arranging his own replacement.
- **Fix:** "...but shall procure from the sovereign that another be made judge, and himself become
  witness."

---

## Non-blocking defects and notes

### 3. Paragraph 10 — "Sentences" rendered as "opinions" (precision loss)

- **Source:** "it is possible long study may encrease, and confirm erroneous Sentences"
- **Candidate:** "long study may increase and confirm erroneous opinions"
- The paragraph is about judges and judicial reason; "Sentences" here carries the judicial sense
  (erroneous judgements handed down), which "opinions" flattens. Not a meaning reversal, so
  non-blocking. Suggested fix: "erroneous judgements".

### 4. Paragraph 47 — "any case whatsoever" weakened to "some case whatsoever"

- **Source:** "For to say all the people of a Common-wealth, have Liberty in any case whatsoever"
- **Candidate:** "For to say that all the people of a commonwealth have liberty in some case
  whatsoever"
- Determiner change; "some ... whatsoever" is also not idiomatic. Fix: restore "in any case
  whatsoever".

### 5. Paragraphs 46 / 47 — "promiscuously" rendered two different ways

- Source uses "promiscuously" in both (Lex/Jus in 46, Laws/Charters in 47).
- Candidate: 46 "used interchangeably" (good); 47 "commonly taken for the same thing" (loses the
  sense — Hobbes's complaint is that they are used *indiscriminately*, not merely that this is
  common). Fix 47 to "are likewise taken interchangeably for the same thing".
- This is the only recurring-term inconsistency found, and it sits *inside* batch C, not at a
  batch boundary.

### 6. Paragraph 27 — double negative

- Source: "there is no Judge Subordinate, nor Soveraign, but may erre in a Judgement of Equity"
- Candidate: "because no judge, subordinate or sovereign, is incapable of erring in a judgement of
  equity". Accurate but needlessly knotted for a reading edition. Optional: "because every judge,
  subordinate or sovereign, may err in a judgement of equity".

### 7. Small licensed-but-noted moves (all acceptable, listed for the record)

- **12** — "which thou thinkest unreasonable" → "which you would think it unreasonable": adds a
  conditional colouring. Acceptable.
- **15** — "the ignorance, and security of men" → "ignorance and complacency": correct reading of
  Hobbes's "security" (= carelessness).
- **27** — "not one title of the Law of Nature shall passe" → "not one tittle": this is the
  archaic *spelling* of the same word, not a silent correction to a standard biblical text.
  Acceptable.
- **27** — "the powers and malice of some enemy" → "the power and malice". Trivial.
- **37** — "the Judges, who are either the Lords, or Twelve men of the Country" → "the true
  judges, whether the Lords or twelve men of the country", plus the gloss "men of law" for *juris
  consulti*. "true" is a small addition, licensed by the immediately preceding contrast; the gloss
  is the kind of in-line explanation the source's own "that is to say" habit licenses.
- **38** — "are very Lawes" → "are true laws in themselves": "in themselves" is a minor addition.
- **42** — "How Can A Man Without Supernaturall Revelation Be Assured..." → "without a revelation
  of his own": matches the source's own restatement two sentences later ("without a Revelation
  particularly to himselfe"). Fine.
- **43** — "in respect of them, every man would despise the Commandements of the Common-wealth" →
  "each would feel entitled, on that basis, to despise...". "feel entitled" imports a motive the
  source states as bare consequence; borderline, non-blocking. More literal: "and yet, measured
  against those, every man would despise...".
- **43** — "is to obey for such, the Command of the Common-wealth" → "is bound to accept as such
  the command": "accept" for "obey" is a slight softening. Optional fix: "is to obey the command
  of the commonwealth as such".
- **Typography** — "Rex In Parlamento" keeps the source's title-case medial "In". Should be
  "Rex in Parlamento".

No instance was found anywhere in the chapter of: a flipped negation, a reversed causal
connective, a dropped or added condition, a swapped actor (other than defect 1), an invented
example, a dropped number or citation, or an unmodernized archaic island.

---

## The five flagged items, verified independently

**(a) Paragraph 9 — "The Common Law has no controller but the Parliament".**
Verified accurate. Source: `"That the Common Law, hath no Controuler but the Parlament;"`.
The candidate modernizes only spelling ("Controuler" → "controller", "Parlament" → "Parliament")
and drops the introductory "That" as English idiom requires when the quote is set off by a colon.
No meaning change. Critically, the *contrast* the paragraph turns on survives intact: the Latin
"Parlamentum" vs. "Rex In Parlamento" is correctly left untranslated, so the commentary still
supports the distinction the quote sets up. The second quoted opinion in the same paragraph
("the two arms of a commonwealth are force and justice...") appears in the source in title-case
rather than quotation marks; the candidate promotes it to quotation marks. That is an editorial
normalization, not a fidelity change — the source's title-case is itself a marker of quoted
matter — and I regard it as correct. No defect.

**(b) Paragraph 13 — the three biblical citations.**
Note: the citations are in **paragraph index 14**, not 13 (the drafter's index is off by one; 13
is the "public minister / judge / ambassador / fidelity" paragraph and is clean). In 14 the
candidate reads "(Prov. 7:3)", "(Deut. 11:19)", "(Deut. 31:12)" against source "(Prov. 7. 3)",
"(Deut. 11. 19)", "(Deut. 31. 12)". Book, chapter and verse are identical in all three; only the
punctuation is normalized to modern colon form. Nothing was silently corrected — in particular,
Hobbes's gloss that Solomon advises binding "the ten Commandements ... upon his ten fingers" (a
loose reading of Prov. 7:3) is carried over as Hobbes wrote it, not harmonized to what the verse
actually says. The Deut. 11:19 content ("at home and on the way, going to bed and rising up,
write it on the posts and doors") and the Deut. 31:12 content ("man, woman, and child, to hear it
read") both match the source's own paraphrase. No defect.

**(c) Paragraph 31 — the "restored" dropped phrase.**
Claim verified and true. Source: "The **difference and division** of the Lawes, has been made in
divers manners". `current-modern-en.json` reads "The division of laws has been made in various
ways" — "difference and" was genuinely missing. The candidate reads "The **difference and
division** of the laws has been made in various ways". Both elements are in the source and both
are now in the candidate. Correct repair; no over-correction elsewhere in the paragraph
("Institutions of Justinian" → "Institutes of Justinian" is the standard English name of the same
work and is a translation, not a factual substitution — acceptable).

**(d) Paragraph 43 — the scriptural paraphrases including Gen. 17:10.**
The drafter's reading is correct. Three quoted passages appear:
1. Gen. 17:10, cited in the source. Source: "This is the Covenant which thou shalt observe between
   Me and Thee and thy Seed after thee." Candidate: "This is the covenant which you shall keep
   between me and you and your descendants after you." This is a modernization of *Hobbes's own
   wording*, not a substitution of the KJV (which reads "This is my covenant, which ye shall keep,
   between me and you and thy seed after thee"). Hobbes's non-standard "This is the Covenant which
   thou shalt observe" is preserved in structure; no verse number was changed.
2. "In thee shall all Nations of the earth be blessed: For I know thou wilt command thy
   children..." — **unattributed in the source** (it is Hobbes's own conflation of Gen. 18:18 and
   18:19) and **still unattributed in the candidate**. No citation was invented, and the
   conflation was not silently split or repaired.
3. "Speak thou to us, and we will heare thee; but let not God speak to us, lest we dye?" —
   **unattributed in the source** (Exod. 20:19) and still unattributed in the candidate.
Nothing was completed, corrected, or given a citation absent from the source. Confirmed clean.

**(e) Quoted material throughout — modernized in-house, not swapped for a named translation.**
Checked every quoted or set-off passage in the chapter: the definition of civil law (2), the
golden-rule sentence (12), Coke's "an artificial perfection of reason, gotten by long study,
observation, and experience" (10), the "great lawyer" forfeiture-on-flight quotation (27), the
running-head marginal notes rendered as sentences (22, 24, 26), the three scriptural passages
(43), and the Latin formulas (47). All are rendered in the candidate's own modern wording, none
reproduces a recognizable external translation's phrasing, and none is left as an archaic island.
Latin terms of art are correctly preserved untranslated where the source preserves them:
*Persona Civitatis* (1), *Parlamentum* / *Rex In Parlamento* (9), *juris prudentia* (10),
*viva voce* (24), *Senatus consulta* (35), *Responsa Prudentum* / *juris consulti* (37),
*Lex Civilis* / *Jus Civile* (46), *jubeo, injungo* / *dedi, concessi* (47) — each with the
source's own gloss carried over where the source glosses. One presentational note: in 10 the
source's bracketed footnote "(Sir Edward Coke, upon Littleton Lib.2. Ch.6 fol 97.b)" is folded
into the running text as "as Sir Edward Coke makes it, upon Littleton, lib.2, ch.6, fol.97.b".
Content is unchanged; acceptable for a reading edition. No defect.

---

## Packet-boundary consistency

- **15/16 (A→B):** clean. Recurring vocabulary carries across correctly — "public registers,
  public counsels, public ministers, and public seals" in 15 is picked up as "registers" in 18 and
  "public seal" in 19; "verified / authorised" set up in 15 is paid off in 16 with the same two
  words in the same opposition. No terminology break.
- **31/32 (B→C):** clean. "Institutes of Justinian ... seven sorts of civil laws" in 31 is paid
  off by the numbered list 32–38, which runs 1–7 with no gap or duplication, and the recurring
  "Like these are the proclamations / Acts of Parliament / Orders of the House of Commons /
  Acts of Council / Chief Justices" England-comparison formula is present in each of 32, 33, 34,
  35, 36, 37 as in the source. No terminology break.
- The only cross-paragraph inconsistency found in the whole chapter (item 5, "promiscuously")
  falls *within* batch C, not at either boundary.
- Chapter-wide term census is consistent: commonwealth, sovereign, equity, judgement, legislator,
  interpreter, presumption, distributive/penal, fundamental/not fundamental are each used with one
  stable English term throughout.

---

## Verdict

**ACCEPT WITH FIXES REQUIRED**

The rendering is a genuine modern-English translation of this source, complete at 48/48
paragraphs, with no invented content, no dropped examples or citations, and no negation or
causality failures. One real fidelity failure exists (paragraph 28) plus one omission
(paragraph 29); both are single-sentence patches, not grounds for a re-draft.

Required before this chapter counts as done:

1. **Paragraph 28** — replace the opening sentence with: "In the same way, when the question is
   the meaning of written laws, the man who writes a commentary on them is not their interpreter."
2. **Paragraph 29** — "but shall procure **from the sovereign** that another be made judge, and
   himself become witness."
3. **Paragraph 47** — "in **any** case whatsoever" (restore the source's determiner).
4. **Paragraph 47** — "promiscuously" → "interchangeably" to match paragraph 46.
5. **Paragraph 10** — "erroneous **judgements**" for source "erroneous Sentences".

Items 3–5 are minor; items 1–2 are blocking. Everything under "Non-blocking defects and notes §7"
is optional polish and may be left as is.
