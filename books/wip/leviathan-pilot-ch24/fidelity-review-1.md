# Fidelity Review 1 — Leviathan, edition ch. 24 (Hobbes ch. 23), "Of the Publique Ministers of Soveraign Power"

Reviewer: independent fidelity reviewer (Reviewer B), per
`books/prompts/fidelity-review-prompt.md`.

- **Fidelity anchor (sole):** `books/wip/leviathan-pilot-ch24/source.json` (13 paragraphs)
- **Candidate:** `books/wip/leviathan-pilot-ch24/candidate-sonnet.json` (13 paragraphs)
- **Not consulted:** the accessibility review file in this folder, the drafter's
  notes, `current-modern-en.json` as a fidelity reference, and any other
  translation of Leviathan. Verdict re-derived from source vs. candidate only.
  (`leviathan-modern-en.json` was opened for one narrow purpose only: to confirm
  the house convention for chapter *titles*. See defect D1.)

## Coverage

Every paragraph was read individually against its source counterpart. Nothing
was skimmed or sampled.

- Packet 1: paragraphs 1–5 (context: p.6)
- Packet 2: paragraphs 4–9 (certifying 6–8; context p.5 and p.9)
- Packet 3: paragraphs 8–11 (certifying 9–10; context p.8 and p.11) — the
  English legal-history paragraph (9) read twice inside this packet
- Packet 4: paragraphs 10–13 (certifying 11–13; context p.10)
- Whole-chapter re-read: one continuous pass over all 13 paragraphs, source and
  candidate, for cross-boundary issues (recurring terms: "public/private
  minister," "natural vs. political capacity," the body-natural analogy chain
  nerves → voice → hands → eye → ear, and the "judged by his own judges"
  argument set up in p.8 and paid off in p.9).

Structural checks:

- Paragraph count 13 = 13, order preserved, 1:1 index alignment. Nothing merged,
  split, reordered, dropped, or invented at paragraph level.
- The body-natural analogy chain is complete and correctly placed in both:
  nerves/tendons (p.3), organs of voice (p.9, at the end of the paragraph, as in
  source), hands (p.10), eye (p.12), ear (p.12).
- The p.8 → p.9 payoff survives: "no man can be Judge in his own cause" /
  "judged by his own judges" in p.8 is what p.9's English-courts praise rests on,
  and the candidate keeps that link explicit ("having judges of his own
  choosing").

## Specific checks requested

**Latin formulas.** All three are present, correctly placed, and not altered in
substance:

- `Dei Gratia` (p.6) — kept, with Hobbes's own gloss ("by the favor of God
  alone") preserved rather than replaced.
- `Dei Gratia & Regis` → `Dei Gratia et Regis (by the grace of God and the king)`.
  The `&` → `et` expansion is an orthographic expansion of the ampersand, not a
  change to the formula. The gloss is a plain and accurate translation.
- `Dei Providentia & Voluntate Regis` → `Dei Providentia et Voluntate Regis (by
  the providence of God and the will of the king)`. Same: accurate plain
  translation, no interpretation injected. Neither gloss imports a claim (e.g.
  about bishops, investiture, or Erastianism) that the source does not make.

One small consistency note, non-blocking: the candidate glosses `Dei Gratia`
alone as "favor" (following Hobbes's "the favour of none but God") but
`Dei Gratia et Regis` as "grace." Both are correct renderings of *gratia*; using
one word in both places would make the parallel Hobbes is drawing more visible.

**English legal-history passage (p.9).** Checked term by term. Retained
correctly and without silent correction: "Common Pleas"; "Publique Pleas" with
Hobbes's own parenthetical "(which are also called Pleas of the Crown)" — the
candidate did *not* quietly normalize Hobbes's nonstandard "Publique Pleas" to
"Crown Pleas"; the two orders of men (lords / commons); lords judged in all
capital crimes by none but lords; "as many as would be present"; the jury of
twelve; the right of exception/challenge; the "so the sentence is final"
conclusion. No number, court name, or institutional claim was changed.
See defect D3 for the one word in this paragraph I do consider a silent
technical shift, and the Possible Source Errors section for historical claims in
the *source* that I am flagging rather than correcting.

---

## Defects

### D1 — BLOCKING (mechanical). Chapter title left unmodernized.

- **Index:** chapter title field
- **Source:** `"Chapter 23. Of the Publique Ministers of Soveraign Power"`
- **Candidate:** `"Chapter 23. Of the Publique Ministers of Soveraign Power"`
- **What's wrong:** The title is an archaic island in an otherwise modernized
  chapter ("Publique," "Soveraign"). It also disagrees with the house convention
  already live in `app/public/data/editions/leviathan-modern-en.json`, where
  chapter 24's title is `"Chapter 23. Of the Public Ministers of Sovereign
  Power"` (and neighbours are likewise modernized: "Of Dominion Paternal and
  Despotic," "Of Systems Subject, Political, and Private"). Shipping this
  candidate as-is would introduce an archaic title into the middle of a
  modernized edition.
- **Fix:** set `"title": "Chapter 23. Of the Public Ministers of Sovereign Power"`.

### D2 — NON-BLOCKING. p.3: "Predecessor" given a rank the source does not state.

- **Source:** "as to a Protector, or Regent, may bee committed by the Predecessor
  of an Infant King, during his minority, the whole Administration of his
  Kingdome."
- **Candidate:** "a predecessor **king** may entrust a protector or regent with
  the whole administration of the kingdom during an infant king's minority."
- **What's wrong:** minor addition. Hobbes writes "the Predecessor of an Infant
  King" — the person the infant succeeded, who in his example is obviously the
  previous monarch, but the source does not spell out "king." Implication-level,
  not a meaning change.
- **Fix (optional):** "the infant king's predecessor may entrust…".

### D3 — NON-BLOCKING, but flagging as a possible silent technical shift. p.9: "Country" → "county".

- **Source:** "had for Judges, men of the Country where the matter in
  controversie lay"
- **Candidate:** "had as judges men from the **county** where the matter in
  dispute lay"
- **What's wrong:** In 17th-century legal usage, "men of the country" is the
  vicinage/*per patriam* formula — men of the neighbourhood or locality from
  which the venire was drawn. "County" is a defensible modernization and is
  usually the practical referent, but it substitutes a narrower administrative
  term for Hobbes's word, and a reader cannot tell from the candidate that
  Hobbes wrote the general term. This is the one place in the chapter where the
  modernization takes a step toward the technically standard rather than the
  literal.
- **Fix (recommended, low cost):** "men of the locality where the matter in
  dispute lay" — or keep "county" if the house rule is to prefer the practical
  referent. Editorial call; I am flagging it rather than requiring it.

### D4 — NON-BLOCKING. p.9: "Priviledge of favour" loses the "favour" element.

- **Source:** "which being ever acknowledged as a Priviledge of favour, their
  Judges were none but such as they had themselves desired."
- **Candidate:** "since this was always acknowledged as a privilege **granted to
  them**, their judges were none but those they themselves wanted."
- **What's wrong:** "of favour" is load-bearing for Hobbes's argument — the
  privilege is a grace/favour extended to the lords, which is why he can treat
  the lords' judges as judges *they* desired (i.e. consented to), which is the
  whole point of the paragraph. "Granted to them" is flatter and drops the
  favour/grace sense. No meaning is reversed, but a link in the argument is
  weakened.
- **Fix:** "since this was always acknowledged as a privilege granted them as a
  favour, …".

### D5 — NON-BLOCKING (clarity, near-ambiguity). p.8: dropped object after "suspect".

- **Source:** "if the Defendant be allowed to except against such of his Judges,
  whose interest maketh him suspect them"
- **Candidate:** "if the defendant is allowed to challenge any of his judges
  whose interest makes him suspect"
- **What's wrong:** with the object "them" dropped, "makes him suspect" can be
  read for a beat as "makes him [the judge] suspected" rather than "causes him
  [the defendant] to suspect them." The surrounding clause resolves it, but the
  fix is free.
- **Fix:** "…whose interest makes him suspect them".

### D6 — NON-BLOCKING (terminology). p.7: "annexed to" → "bound up with".

- **Source:** "all Judicature is essentially annexed to the Soveraignty"
- **Candidate:** "all judicature is essentially bound up with sovereignty"
- **What's wrong:** "annexed" is Hobbes's technical term throughout Leviathan for
  a right that is inseparably attached to sovereignty (cf. ch. 18's rights
  "annexed to the Soveraignty"). "Bound up with" is looser and breaks the term's
  consistency across chapters. Meaning is preserved; the technical thread is not.
- **Fix (recommended for cross-chapter consistency):** "all judicature is
  essentially attached to sovereignty" or "…is inseparable from sovereignty".

### Checked and found clean

The following were checked specifically and show no defect:

- **Negation** — every negation preserved with the same scope: "are **not**
  public ministers" (p.2); "**not** inconsistent with the king's sovereign
  power," "**not** incompatible with the sovereign's right," "no commission …
  **unless** express and unmistakable words" (p.3); "can do **nothing** against
  his command, **nor** without his authority" (p.4); "a soldier **without** a
  command … does **not** … because there is **no one** to represent it to"
  (p.5); "**no one but** the sovereign," "by **no** authority but the
  sovereign's" (p.6); "**no** man can be judge in his own case," "can appeal
  **no** further" (p.8); "**none but** lords," "**without** objection," "could
  allege **nothing**" (p.9); "**neither** public **nor** private ministers"
  (p.12); "**Neither** a counsellor **nor** a council of state … is **not**
  asked for," "cannot … be represented," "**never** without some further
  authority," "counsel to **no one** but itself" (p.13).
- **Conditions** — the three-way "first / secondly / thirdly" structure in p.8 is
  intact with the same antecedents and the same consequents; the "if we consider
  it with no Authority of Judicature or Command" restriction in p.13 survives as
  "considered simply as having no authority of judicature or command."
- **Actors** — no subject/object swaps found. Notably correct: p.5 "everyone who
  holds a command represents the commonwealth only to those he commands"; p.12
  the private business "belongs to the prince in his natural capacity" (source's
  bare "him" correctly resolved to the prince, not the ambassador); p.13 "his
  person cannot, in his own presence, be represented to him by anyone else."
- **Causality** — "therefore," "for," "because," "consequently," "so that" all
  point the same direction throughout; p.12's concessive structure ("though the
  authority be public, yet because the business is private") is preserved in both
  its occurrences even though the candidate reorders the clauses of the first one.
- **Certainty/hedging** — p.6's "(or should doe it)" kept as "(or should do it)";
  p.7's "(as hath been before declared)" kept as "As already explained"; p.9's
  first-person "I cannot forbeare to observe" kept as "I cannot help remarking."
  No hedge dropped, none added.
- **Omissions** — the full lists survive: ushers/sergeants/stewards/chamberlains/
  cofferers (p.2); governor/lieutenant/prefect/viceroy (p.3); tributes/
  impositions/rents/fines and collect/receive/issue/audit (p.4); arms/forts/ports
  and levy/pay/lead (p.5); ambassadors/messengers/agents/heralds (p.11);
  congratulate/condole/attend a solemnity (p.12).
- **Additions** — no invented examples, explanations, or images. The only added
  material in the chapter is the two parenthetical Latin glosses in p.6, which
  are plain translations (see above).
- **Unmodernized islands** — none in the body text. The only archaic island is
  the chapter title (D1). The Latin formulas are correctly left in Latin: they
  are formulas, not prose, and are glossed.

---

## Possible errors in the SOURCE (not candidate defects — editorial decision needed)

These are flagged, not corrected. The candidate rendered all of them faithfully,
which is the right behaviour; the question is whether the edition wants a note.

### S1 — Hobbes's account of how a peer's triers were chosen (p.9). Highest confidence of the three.

- **Source wording:** "The Lords had this Priviledge, to have for Judges in all
  Capitall crimes, none but Lords; and of them, as many as would be present;
  which being ever acknowledged as a Priviledge of favour, their Judges were none
  but such as they had themselves desired."
- **Why it may be wrong:** two claims in one sentence are doubtful.
  (a) *"as many as would be present."* This describes trial by the whole House of
  Lords, which was the procedure only when Parliament was **in session**. Out of
  session, a peer accused of treason or felony was tried before the **Lord High
  Steward**, who summoned a selected panel of Lords Triers — the selection being
  made by the Crown's officer, not by whoever chose to turn up.
  (b) *"a Priviledge of favour … such as they had themselves desired."* Trial by
  peers was claimed as a **right** (traditionally under Magna Carta's "judgment of
  his peers," and confirmed by statute), not as a grace conceded by the sovereign;
  and under the Lord High Steward procedure the accused peer had **no** effective
  say in who his triers were, and no right of peremptory challenge against them.
- **Why it matters here:** it is not incidental colour. Hobbes needs this claim to
  make English practice an instance of his own principle ("judged by his own
  judges, that is to say, by himself"). If the historical picture is wrong, his
  showcase example is weaker than he presents it. Note this is Hobbes arguing, in
  1651, in a way congenial to his thesis — a reader may reasonably want to know
  the practice was not as consensual as described.
- **Recommended handling:** leave the text exactly as rendered; if the edition
  carries notes, a short endnote on the Lord High Steward procedure.

### S2 — The jury paragraph implies an unlimited right of challenge (p.9). Medium confidence.

- **Source wording:** "against which he might make his exceptions, till at last
  Twelve men without exception being agreed on, they were Judged by those twelve."
- **Why it may be wrong:** as written this reads as a right to keep challenging
  until twelve wholly unobjected-to men remain. In practice, challenges for cause
  were unlimited but had to be *shown*, while **peremptory** challenges in felony
  were capped (thirty-five in Hobbes's period, i.e. one short of three full
  juries); exhausting them did not entitle the defendant to keep objecting.
  Hobbes's "till at last" overstates the defendant's control, again in the
  direction his argument needs.
- **Recommended handling:** leave as rendered. Optional note only if S1 gets one;
  the two are the same overstatement.

### S3 — "Dei Providentia & Voluntate Regis" as an attested formula (p.6). Low confidence; flagged for completeness.

- **Source wording:** "as in a Monarchy Dei Gratia & Regis; or Dei Providentia &
  Voluntate Regis."
- **Why it may be inexact:** *Dei gratia* as the sovereign's own style, and
  subordinate styles qualified by royal authority, are real. But the English
  ecclesiastical styles actually in use were *Divina Providentia* (Archbishop of
  Canterbury) and *Divina Permissione* (bishops); I am not aware of a chancery or
  episcopal formula in precisely the form *Dei Providentia et Voluntate Regis*.
  Hobbes may be constructing illustrative formulas to make his point about
  derived authority rather than quoting attested ones — which is legitimate, but
  a reader may take them as quotations of real titles.
- **Recommended handling:** leave exactly as rendered (the candidate's glosses are
  plain translations and do not assert that these were in use). No note needed
  unless the edition annotates Latin generally. **Do not** "fix" the formula to
  *Divina Providentia* — that would be precisely the silent correction the
  protocol forbids.

---

## Verdict

**ACCEPT WITH FIXES REQUIRED**

The rendering is a genuine modern-English rendering, paragraph-aligned, with no
invented content, no dropped clause, no flipped negation, no actor swap, and no
silent correction of Hobbes's historical or Latin material. The English
legal-history passage and all three Latin formulas came through intact, and the
added Latin glosses are plain translations that inject no interpretation.

Required before acceptance:

1. **D1** — modernize the chapter title to
   `"Chapter 23. Of the Public Ministers of Sovereign Power"` (matches the
   existing live `leviathan-modern-en.json` convention).

Recommended (cheap, improves fidelity of the argument; not blocking):

2. **D4** — restore the "favour" sense in p.9's "Priviledge of favour."
3. **D6** — restore "annexed/attached to" in p.7 for cross-chapter term consistency.
4. **D5** — restore the object: "makes him suspect **them**" in p.8.
5. **D3** — editorial call on "country" → "county" in p.9.
6. **D2** — optional: drop the added "king" in p.3.

No re-draft is needed; every item above is a local patch.
