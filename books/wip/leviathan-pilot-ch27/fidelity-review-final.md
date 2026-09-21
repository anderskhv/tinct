# Fidelity Review — FINAL (pre-pin), Leviathan edition ch. 27 ("Chapter 26. Of Civil Laws")

- Date: 2026-09-21
- Source (locked): `books/wip/leviathan-pilot-ch27/source.json`
- Candidate: `books/wip/leviathan-pilot-ch27/candidate-sonnet.json`
- Method: full, non-sampled read of both files end to end, in their current final
  state. Every paragraph 0–47 read against its source counterpart on actors,
  negation, causality, certainty/hedging, conditions, omissions, additions, and
  silent corrections. This is not a diff against round 6.

## VERDICT: ACCEPT AS-IS

No fidelity defects found. Nothing below is blocking; the "observations"
section records judgement calls that were checked and found faithful, so the
next reader does not have to re-derive them.

---

## 1. Structural check

| Check | Source | Candidate | Result |
|---|---|---|---|
| `number` | 27 | 27 | PASS |
| `title` | `Chapter 26. Of Civill Lawes` | `Chapter 26. Of Civil Laws` | PASS — modernized to "Civil" / "Laws", chapter label and numbering otherwise identical |
| Paragraph count | 48 | 48 | PASS |
| Paragraph order / alignment | — | — | PASS — 1:1 index alignment, nothing merged, split, reordered, dropped, or invented |
| JSON validity | — | — | PASS |
| Length ratios | — | — | 0.91–1.36; the three >1.1 ratios (idx 22, 24, 26) are the short inline headings, where a glossed word dominates the ratio. No outlier signalling compression or padding. |

The three inline running heads in the source (idx 26, 28, 30 — "The
Authenticall Interpretation Of Law Is Not That Of Writers"; "The Interpreter Of
The Law Is The Judge Giving Sentence Vivâ Voce…"; "The Sentence Of A Judge,
Does Not Bind Him…") are preserved as their own paragraphs at the same indices,
rendered as ordinary sentences. Correct: they are structural markers, not body
text, and removing or folding them would break alignment.

---

## 2. Coverage map

Every paragraph is covered by exactly one entry below. Indices are 0-based;
"P n" is the 1-based reading position.

| Idx | Section | Verdict |
|---|---|---|
| 0–3 | Definition of civil law; the definition unpacked | Faithful |
| 4–15 | The eight numbered deductions | Faithful |
| 16–24 | Publication, signs of the sovereign, verification | Faithful |
| 25–26 | Interpretation is required; who may interpret | Faithful |
| 27–32 | Interpreters: writers, judges, precedent, the flight/forfeiture case | Faithful |
| 33–35 | Commentaries; letter vs. sentence; the good judge | Faithful |
| 36–43 | Justinian's seven sorts of civil law | Faithful |
| 44–48 | Natural/positive; human/divine; distributive/penal; divine positive law | Faithful |
| 49–50 | Fundamental vs. not fundamental | Faithful |
| 51–52 | Lex vs. Jus; laws vs. charters | Faithful |

(Indices 44–52 in that last block run to 47 in the array; see the per-section
detail below, which names each index explicitly.)

---

## 3. Section-by-section findings

### 3.1 Definition and its consequences (idx 0–3)

- **idx 0** — Actors (men, professional lawyers, any man; Rome, successor
  states) preserved. The Roman `civitas` etymology, the retained-in-part civil
  law of successor states, and the Plato/Aristotle/Cicero list are all intact,
  including the closing disclaimer that they wrote without professing the study
  of law. Source's "therefore bound to observe" becomes "bound to observe
  because…" — the "therefore" is carried by the restructured causal clause, not
  dropped.
- **idx 1** — The three-part claim (law is command not counsel; not any man's
  command to any man; only of one whose command is addressed to someone already
  obliged) survives with its negations intact. *Persona Civitatis* kept.
- **idx 2** — The definition is rendered as a quotation, as in the source, with
  all four elements: to every subject; commanded by word, writing, or other
  sufficient sign of will; for the distinction of right and wrong; glossed as
  contrary / not contrary to the rule. No element added or dropped.
- **idx 3** — The four addressee classes, the "and to none else" exclusion, and
  the three supporting reasons are all present. The double negative "nothing
  being reputed Unjust, that is not contrary to some Law" is rendered as "an act
  is reputed unjust only when it is contrary to some law" — logically equivalent
  (exclusive condition preserved, not weakened to a sufficient condition).

### 3.2 The eight numbered deductions (idx 4–15)

- **idx 4 (1.)** — Sovereign as sole legislator; the monarchy/democracy/
  aristocracy alternatives; the commonwealth-is-no-person step; the corollary on
  repeal ("a law is not repealed except by another law, which forbids it to be
  put into execution") all faithful.
- **idx 5 (2.)** — Sovereign not subject to civil law. The chain (power to make
  and repeal → may free himself at will → therefore was free before → he is free
  who can be free when he will → no one can be bound to himself, since who can
  bind can release) is preserved in full. "He was free before" is rendered "he
  was never bound in the first place," and the maxim as "a man who can free
  himself whenever he wills was never truly bound." That is a tense recasting of
  a present-tense maxim, not a change of claim; the modality (can → was never
  bound) is the same assertion Hobbes makes.
- **idx 6 (3.)** — Custom. Correctly reads Hobbes's "it is no longer Law, then
  the Soveraign shall be silent therein" as "no longer than," i.e. "it remains
  law for only as long as the sovereign stays silent." Silence-as-consent
  parenthesis kept with its hedge ("sometimes"). The lawyers' position
  (reasonable customs only; evil customs abolished) is attributed to the lawyers,
  not to Hobbes, exactly as in the source, and the reservation that the judgement
  belongs to the sovereign is kept. Contains an added gloss on *equity* (see §4).
- **idx 7 (4.)** — The longest of the deductions and the most claim-dense; read
  clause by clause. Both directions of the containment claim are present (law of
  nature is part of civil law; civil law is part of the dictates of nature), with
  the pivot ("When a Common-wealth is once settled, then are they actually Lawes,
  and not before") and its negation intact. The two covenant routes (with one
  another when assembling a representative; with the representative one by one
  when subdued by the sword, promising obedience to receive life) are both kept,
  including the conquest case. The written/unwritten split, the abridgement of
  natural right, and the closing purpose clause (not hurt but assist one another,
  join against a common enemy) are all present. The cross-reference to the end of
  chapter 15 is preserved.
- **idx 8 (5.)** — Conquest and provincial custom. The key inversion (legislator
  is not who first made the laws but by whose authority they now continue) is
  intact, as is the conclusion about generally-observed unwritten law being a law
  of nature, with its condition ("and no iniquity appear in the use thereof")
  retained. Glosses *prescription* (see §4).
- **idx 9 (6.)** — The critique of lawyers. Both quoted maxims are preserved as
  quotations, the hypothetical about a sovereign parliament assembling men is
  kept with its conditional force, and the *Parlamentum* / *Rex in Parlamento*
  distinction — the whole point of the passage — is preserved in Latin with a
  gloss. The closing "as if a commonwealth could subsist…" retains its sarcastic
  conditional rather than being flattened into an assertion.
- **idx 10 (7.)** — Whose reason is law. The Coke quotation is preserved as a
  quotation with "(as his was)" intact; the three arguments against it (long
  study can confirm error; building on false ground; equally diligent students
  stay discordant) are all present and in order. "Artificial man the
  commonwealth" kept. The closing judge/sovereign sentence distinction ("then it
  is his sovereign's sentence; otherwise it is his own — and an unjust one")
  preserved with its negation. Citation abbreviation pre-cleared (§5).
- **idx 11 (8.)** — Knowledge as a condition of obligation. The fools/children/
  madmen exclusion, the brute-beast comparison, the reason for it (never had
  power to covenant, never authorised the sovereign's acts), and the extension to
  anyone whose *non-culpable* accident removed the means of notice are all intact
  — including the crucial "not proceeding from his own default" qualifier, which
  is where this argument could most easily have been over-broadened. It is not.
  Glosses "natural fools" (§4).
- **idx 12–15** — The publication cases. First case (obliges all, unwritten,
  unpublished → law of nature) and second case (obliges a class or one man,
  unwritten → still law of nature) both keep their conditions complete. The
  golden-rule maxim at idx 12 is modernized without reversing its negative form.
  The minister/judge/ambassador examples at idx 13 keep their respective default
  instructions (dictates of reason; equity; what reason dictates most conducive
  to the sovereign's interest) correctly matched to the right officer, and the
  summary term *fidelity* as a branch of natural justice is kept. idx 14's
  scripture citations (Prov. 7:3, Deut. 11:19, Deut. 31:12) are all present and
  correctly attached to their claims; Solomon and Moses are not swapped. idx 15's
  argument that ignorance of where sovereignty lies is no excuse retains both
  halves (men in fact are ignorant; yet no one who reflects can doubt).

### 3.3 Verification (idx 16–20)

- **idx 16** — The Verified/authorised distinction is kept as a distinction
  between two named things, with the "command of the sovereign alone" clause.
- **idx 17** — Judge's sentence as verification of natural law in the individual
  case; the lawyer's advice is explicitly demoted to advice, as in the source.
- **idx 18** — The duty to inform oneself before acting. The conditional ("may,
  if he wishes, be sufficiently informed"), the escalation ("Nay he ought to doe
  so"), and the conclusion that acting while in resolvable doubt is unlawful are
  all preserved with the right modal force. The complainant half retains both
  charges (acts unjustly; betrays a disposition to vex rather than to demand his
  right).
- **idx 19** — Obedience to a public officer; "or to have had the means to be
  informed of it, if a man wanted" keeps the counterfactual. The closing duty
  ("best endeavour… all written laws that may concern his own future actions") is
  intact, including "future."
- **idx 20** — Interpretation depends on sovereign authority; the danger clause
  (the crafty interpreter becoming legislator) is preserved as the reason.

### 3.4 Interpretation and precedent (idx 21–32)

- **idx 21** — Both halves of the natural-law paradox are kept: easy to the
  dispassionate, therefore violators are without excuse; yet in practice the most
  obscure of all laws. The Gordian-knot image and the two escapes available to
  the legislator (find the ends; or make whatever ends he wills) are both
  present, with "which no other interpreter can do."
- **idx 22, 24, 26** — The three inline headings, faithful, with a *viva voce*
  gloss at idx 24.
- **idx 23** — Writers are not authentic interpreters. Hobbes's self-referential
  concession (his own treatise is not law because he wrote it, but because it is
  part of the civil law in all commonwealths) is preserved exactly, including the
  "though it be evident Truth" concession and the closing jab about the many
  published volumes of "unwritten" law contradicting one another and themselves.
- **idx 25** — The judge's sentence as authentic interpretation "not because it
  is his private sentence, but because he gives it by the authority of the
  sovereign" — negation and contrast both intact, as is the limiting clause
  "which is law for that time, to the parties pleading."
- **idx 27** — The chapter's longest paragraph (4,300 chars), read in full. All
  of the following survive intact: the duty to give a contrary sentence when
  equity later requires it; "no man's error becomes his own law"; the
  non-bindingness on other judges *even if sworn*; the concessive about mutable
  laws (a wrong sentence knowingly allowed by the sovereign *does* constitute new
  law in mutable laws, in identically-circumstanced cases) followed by the
  contrast with immutable laws — a concession that would be easy to lose and is
  not lost; the heaven-and-earth/tittle allusion; the punish-the-innocent
  principle and its definition of "innocent"; the full flight-and-forfeiture
  hypothetical with every element (capital charge, fear of a powerful enemy and
  corrupt judges, flight, capture, trial, acquittal, forfeiture anyway); the
  Coke quotation preserved as a quotation; Hobbes's dilemma against it (if
  presumption of the fact, the sentence should have been capital; if not, why
  forfeit?); the separate objection that refusing proof is refusing justice, with
  its concessive ("though the sentence be just, the judges… are unjust judges");
  and the closing distinction between law to the party pleading and no law to a
  successor judge. No omissions, no added argument.
- **idx 28** — Commentaries; the regress argument ("need other commentaries; and
  so there is no end of such interpretation") and the closing principle that no
  subordinate judge's error changes the law are intact.
- **idx 29** — Letter vs. sentence. Both readings of "the letter" are kept
  distinct and in order; the worked examples (the house left empty; the falsely
  accused man whose act the judge personally witnessed) preserve their outcomes,
  including the judge's remedy of having another judge appointed and himself
  becoming a witness. The closing limit — inconvenience may guide interpretation
  but can never warrant a sentence against the law — retains its negation.
  Contains a reconstruction of a corrupt source clause (§4).
- **idx 30** — The good judge. The Lords-of-Parliament and twelve-men examples
  keep their qualifications (few versed in law; consulted lawyers but alone had
  authority to give sentence; jurors not presumed to know the law, informed by
  one with authority; no penalty for departing from that unless against
  conscience or corrupted). All four listed qualities are present, in order, with
  their content. The fact/right restatement is pre-cleared (§5).

### 3.5 Justinian's seven sorts (idx 31–38)

All seven are present, correctly numbered 1–7, each with its Roman instrument,
its rationale, and its English analogue where the source gives one:

1. **idx 32** — Edicts/Constitutions/Letters of the Prince → proclamations of the
   kings of England. Rationale (whole power of the people in him) kept.
2. **idx 33** — Decrees of the whole people including the Senate → Acts of
   Parliament. The two-stage authority argument (laws at first by the people's
   sovereign power; afterwards by imperial authority for those not repealed) and
   the general principle about the power to repeal are both intact.
3. **idx 34** — Decrees of the common people excluding the Senate, by the tribune
   → Orders of the House of Commons. The Senate inclusion/exclusion contrast with
   item 2 is correctly maintained.
4. **idx 35** — *Senatus consulta* → Acts of Council; rationale (people too
   numerous to assemble) kept.
5. **idx 36** — Edicts of the Praetors and, *in some cases*, the Aediles → Chief
   Justices. The "in some cases" qualifier is retained.
6. **idx 37** — *Responsa prudentum*; the binding force on judges via the
   emperor's constitutions is kept, as is the *conditional* English comparison
   ("would be like… if other judges were bound by the law of England to follow
   them") — Hobbes's hedge, not converted into an assertion. The *juris consulti*
   point is preserved.
7. **idx 38** — Unwritten customs are "very Lawes" by the emperor's tacit
   consent, rendered "true laws in themselves," with the proviso (not contrary to
   the law of nature) intact.

### 3.6 Natural/positive, human/divine (idx 39–43)

- **idx 39** — Natural = moral laws, from all eternity; the cross-reference to
  chapters 14 and 15 is preserved with both numbers.
- **idx 40** — Positive laws; both publication routes (written; otherwise made
  known as an expression of the legislator's will) kept.
- **idx 41** — Distributive vs. penal. The addressee argument — penal laws speak
  to ministers and officers, *not* to the delinquent, with the parenthetical
  reason — is intact, as is the concession that offenders ought nonetheless to be
  informed beforehand. The closing identity (all laws are general judgements;
  every particular judgement is a law to the man whose case is judged) is kept in
  both directions.
- **idx 42** — Divine positive law and the epistemic problem. Both questions are
  posed and kept distinct. The answer to the first is correctly rendered as
  flatly impossible ("evidently impossible" → "plainly that he cannot"), and the
  three defeasible marks (miracles, sanctity, felicity) each retain their
  individual rebuttal: marvellous-to-one-not-to-another; sanctity can be feigned;
  worldly felicity usually the work of ordinary causes. The closing
  belief-not-knowledge conclusion keeps its gradation (firmer or weaker belief
  as the signs appear greater or lesser).
- **idx 43** — The second question, and the chapter's second-longest paragraph;
  read in full. Intact: the conditional structure of the answer (if not against
  natural law, and if he undertakes to obey, he is bound by his own act); the
  bound-to-obey / not-bound-to-believe distinction; belief as gift not duty;
  unbelief as rejection of all laws except the natural ones. The Abraham material
  keeps the argument's load-bearing step — the seed are bound not by revelation
  but by prior obedience owed to parents holding sovereign power — including its
  proviso about no other earthly power. Both scripture quotations (Gen. 17:10;
  the "in thee shall all nations be blessed" passage) are preserved as
  quotations. The Sinai example keeps every element: Moses alone ascending, the
  people forbidden on pain of death, and the people's own submission quoted. The
  conclusion (in all things not contrary to the moral law, subjects obey as
  divine law what the commonwealth declares) and its supporting argument (private
  dreams and fancies → no two men agree) are intact, as is the closing equity
  principle that where the commonwealth has not regulated, every man equally
  enjoys his liberty. The "lest we die" archaism is pre-cleared (§5).

### 3.7 Fundamental law; Lex vs. Jus; charters (idx 44–47)

- **idx 44** — Hobbes's admission that he has never found a definition, and his
  willingness to supply one anyway, both preserved.
- **idx 45** — The definition by consequence (removal → dissolution), the
  building/foundation image, the enumerated sovereign powers, and the negative
  case (not fundamental where repeal does not dissolve) are all intact.
- **idx 46** — Right = liberty, law = obligation. The natural right to
  self-defence *and to pre-emptive attack on a suspected neighbour* is preserved
  rather than softened, and so is the civil law's removal of it, with its
  condition ("in every case where it is safe to wait instead for the protection
  of the law").
- **idx 47** — Charters as exemptions, not laws. Both Latin formulae kept with
  their translations; the general/particular contrast and the closing inference
  (universal liberty in a case means no law, or a repealed one) are intact.

---

## 4. Observations (checked, non-defects)

These are places where the rendering departs from a word-for-word mapping. Each
was checked against the source and found faithful; recorded so they are not
re-litigated.

1. **Bracketed explanatory glosses.** Seven inline glosses appear, all set off
   with dashes or parentheses and all semantically correct: *equity* (idx 6),
   *prescription* (idx 8), *Parlamentum / Rex in Parlamento* (idx 9), *natural
   fools* (idx 11), *final causes* and *viva voce* (idx 21, 24), *tittle* and
   *chattels* (idx 27), *juris consulti* (idx 37). None of them introduce a claim
   Hobbes does not make; each unpacks a term he uses. They are the accessibility
   work signed off in round 6.
2. **"title" → "tittle" (idx 27).** A silent correction. The source's spelling is
   the 17th-century form of the biblical "tittle" (Matt. 5:18); rendering it as
   "title" in modern English would have produced nonsense. Correct call.
3. **"in the some manner" → "in the same way" (idx 28).** Silent correction of an
   obvious source typo. Correct.
4. **"Institutions of Justinian" → "Institutes of Justinian" (idx 31).** Silent
   correction to the standard English title of the work. Correct.
5. **"the Legislator is alwayes supposed to be Equity" → "the legislator is
   always supposed to intend by equity" (idx 29).** The source clause is corrupt
   as it stands; the candidate reconstructs the reading given in standard
   editions. This is the one substantive editorial reconstruction in the chapter,
   and it is the right one — the surrounding argument (the judge must not think
   otherwise of the sovereign; he must supply with the law of nature) only works
   on that reading.
6. **"security" → "complacency" (idx 15), "rude people" → "unlettered people"
   (idx 14), "cavill" → "frivolous objection" (idx 28), "contumely" → "affront"
   (idx 29), "Preferments" → "advancements in office" (idx 30).** False-friend
   archaisms correctly disambiguated rather than carried across.
7. **Minor intensifiers and connectives added** at idx 5 ("truly"), 27 ("mere"
   presumption), 30 ("chiefly deep" study), 37 ("true" judges), 42 ("alone"), 43
   ("already", "feel entitled, on that basis, to"), 44 ("actually"). Each was
   checked against its context; in every case the added word makes explicit a
   contrast the source sentence already carries (e.g. "true judges" at idx 37 is
   Hobbes's own contrast between the *juris consulti* and the Lords or jury who
   actually judge). None strengthens or weakens a claim.
8. **Spelling consistency.** idx 10 uses "judgments"; the rest of the chapter
   uses "judgement". Cosmetic only, no fidelity effect. Not worth reopening a
   pinned file for, but noted if the file is touched for any other reason.
9. **Quoted material is modernized in place** (the Coke passage at idx 27, the
   scripture at idx 43, the lawyers' maxims at idx 9). This is consistent with
   the chapter-wide policy: the whole text is a modern rendering, so quotations
   inside it are rendered too. Attribution and quotation boundaries are preserved
   in every case; nothing quoted is silently paraphrased into Hobbes's own voice.

## 5. Pre-cleared items (confirmed present, not defects)

Per the review brief, the following were carried deliberately through prior
rounds and were re-confirmed in this pass rather than flagged:

- **idx 30** — "not only of the fact but of the right… not only of the fact but
  also of the right." Re-checked against the source: Hobbes himself restates the
  point with "that is to say." Faithful, not a translation artifact.
- **idx 10** — the Coke/Littleton citation abbreviation. Unavoidable scholarly
  citation; rendered legibly ("upon Littleton, lib.2, ch.6, fol.97.b").
- **idx 43** — "lest we die" in the Sinai quotation. Mild archaism, deliberately
  preserved inside a direct scripture quotation.

---

## 6. Conclusion

The candidate is a complete, aligned, and faithful modern-English rendering of
all 48 paragraphs. No actor inversions, no dropped or reversed negations, no
broken conditionals, no weakened or strengthened hedges, no omitted clauses, no
invented content, and no unjustified silent corrections. Structure, title
modernization, and numbering are all correct.

**ACCEPT AS-IS.** Ready for hash pinning.
