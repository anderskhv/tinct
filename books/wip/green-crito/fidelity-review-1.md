# Fidelity Review 1 — *Crito* (Plato), modern-en candidate

**Reviewer:** Reviewer B (independent fidelity pass), per `books/prompts/fidelity-review-prompt.md`
**Date:** 2026-09-21
**Locked source (sole fidelity anchor):** `books/wip/green-crito/source.json` (Jowett translation as locked; 3 chapters, 95 paragraphs)
**Candidate:** `books/wip/green-crito/candidate.json` (3 chapters, 95 paragraphs)
**Prior reviews:** none — this is the first independent fidelity review of this text.

---

## 1. Coverage

Complete, not sampled. Every paragraph of all three chapters was read individually,
source against candidate, in aligned pairs, in packets of 5–10 with one paragraph of
context on each side of each packet boundary:

| Chapter | Title | Paragraphs | Coverage |
|---|---|---|---|
| 1 | The Visit at Dawn | 25 (1.0–1.24) | 1.0–1.24, all read individually |
| 2 | The Plea and the Argument | 61 (2.0–2.60) | 2.0–2.60, all read individually |
| 3 | The Laws of Athens Speak | 9 (3.0–3.8) | 3.0–3.8, all read individually |

Total 95/95 paragraphs certified. No paragraph was skimmed. After the packet passes,
a whole-book re-read was done in one sweep for cross-boundary issues (recurring terms,
the argument chain from 2.1 through 2.59, the Laws' speech spanning 3.0–3.6).

### Structural integrity check (explicit, per instruction)

The Apology failure mode (dropped/duplicated paragraph) was checked directly, not
spot-checked:

- Chapter count matches (3 vs 3); chapter numbers and titles match exactly.
- Per-chapter paragraph counts match exactly: 25/61/9 in both files.
- For every index N in every chapter, candidate paragraph N was compared to source
  paragraph N. **The speaker tag matches at all 95 positions** (no off-by-one drift —
  an off-by-one shift in this dialogue would immediately desynchronize the strictly
  alternating SOCRATES/CRITO tags, and it does not).
- No candidate paragraph is a verbatim duplicate of another.
- No source paragraph is missing and no paragraph was invented.

**Conclusion: no structural drop, duplication, merge, split, or reordering.**
However, there is one *content-level* substitution at a single index where the
candidate paragraph does not render the source paragraph at that position and instead
pre-states the content of a later paragraph — see D1. That is the same family of defect
as the Apology finding, caught at the content level rather than the count level.

---

## 2. Blocking defects

### D1 — 2.9: source claim replaced by a duplicate of 2.11 (dropped step + added claim)

- **Source (2.9):** `SOCRATES. The good are to be regarded, and not the bad?`
- **Candidate (2.9):** `SOCRATES. And the good opinions are those of the wise, while the bad opinions are those of the unwise?`
- **Source (2.11):** `SOCRATES. And the opinions of the wise are good, and the opinions of the unwise are evil?`
- **Candidate (2.11):** `SOCRATES. The opinions of the wise are good, and the opinions of the unwise are bad?`

**What's wrong.** The candidate's 2.9 is not a rendering of source 2.9 at all; it is a
restatement of source/candidate 2.11, moved two paragraphs earlier. Two consequences:

1. **Omission.** The source's 2.9 step — the *normative* link (good opinions are the
   ones to be **regarded**, bad ones not) — disappears from the dialogue entirely. That
   step is what the rest of the chapter rests on: 2.15 ("he ought to fear the censure
   and welcome the praise of that one only"), 2.23, and 2.33 ("we must not regard what
   the many say") all pay off the "to be regarded" premise established at 2.9. In the
   candidate the premise is never laid down, so the payoff at 2.33 is unlicensed by
   anything earlier.
2. **Addition / redundancy artifact.** The candidate now asks essentially the same
   question twice in a row (2.9 and 2.11), with Crito answering "Yes" (2.10) and
   "Certainly" (2.12) to what reads as one question. This is visible to a reader as a
   textual fault.

**Fix.** Restore 2.9 as a rendering of the source's own question, and leave 2.11 as the
wise/unwise identification:

> `SOCRATES. The good opinions are the ones to be respected, and not the bad?`

(2.11 stays as currently drafted.)

### D2 — 2.6: dropped conditional and flipped certainty in the orphans reproach

- **Source (2.6):** `...instead of which you go away and leave them, and they will have to take their chance; and if they do not meet with the usual fate of orphans, there will be small thanks to you.`
- **Candidate (2.6):** `Instead you are leaving them to fend for themselves, and they will probably end up like other orphans.`

**What's wrong.** Three defects in one clause:
- The **condition** (`if they do not meet with the usual fate of orphans`) is gone.
- The **reproach** that is the whole point of the clause (`there will be small thanks to
  you` — i.e. if they turn out all right, Socrates gets no credit) is simply **omitted**.
- **Certainty is flipped**: the source makes no prediction about what will happen to the
  children; the candidate asserts they will *probably* end up like other orphans. The
  source says the opposite in structure — it entertains the possibility that they
  *escape* that fate, and denies Socrates credit for it.

**Fix.**

> `Instead you are going away and leaving them to take their chances; and if they escape the usual fate of orphans, it will be no thanks to you.`

---

## 3. Non-blocking fidelity defects (should be fixed before pin)

### D3 — 2.7: dropped attribution clause and weakened hedge

- **Source:** `That argument, which, as I believe, is maintained by many persons of authority, was to the effect, as I was saying, that the opinions of some men are to be regarded...`
- **Candidate:** `The argument, as I recall, held that the opinions of some people should be valued and others should not.`
- **Wrong:** the clause `which, as I believe, is maintained by many persons of authority`
  is dropped; Socrates' hedge `as I believe` (about who holds the view) is converted into
  `as I recall` (about his own memory) — a different hedge attached to a different claim.
- **Fix:** `The argument — which I believe many authorities maintain — held, as I was saying, that the opinions of some people should be valued and others should not.`

### D4 — 3.4: dropped "by the liberty which we allow him"

- **Source:** `we further proclaim to any Athenian by the liberty which we allow him, that if he does not like us...`
- **Candidate:** `We further proclaim to any Athenian that, if he doesn't like us...`
- **Wrong:** the clause is load-bearing for the Laws' argument — the right of departure
  is presented as a liberty *granted by the Laws*, which is exactly what makes staying an
  implied contract two sentences later. Dropping it weakens the inference the paragraph
  then draws.
- **Fix:** `By the liberty we allow him, we further proclaim to any Athenian that, if he doesn't like us...`

### D5 — 3.4: hedge strengthened into an assertion

- **Source:** `Of all Athenians you have been the most constant resident in the city, which, as you never leave, you may be supposed to love (compare Phaedr.).`
- **Candidate:** `Of all Athenians you have been the most consistent resident. You never left, so you must have loved it.`
- **Wrong:** `you may be supposed to love` (an inference the Laws offer) becomes `you must
  have loved it` (asserted fact). Certainty shift.
- **Fix:** `...the most consistent resident — and since you never leave it, you may be presumed to love it.`

### D6 — 2.55: past tense of the claim dropped

- **Source:** `For this opinion has never been held, and never will be held, by any considerable number of persons`
- **Candidate:** `Most people will never hold this opinion.`
- **Wrong:** the source makes a claim about both past and future (`has never been held,
  and never will be held`); the candidate keeps only the future.
- **Fix:** `This opinion has never been held, and never will be held, by any large number of people.`

### D7 — 3.2: "slave" softened to "servant", breaking the slave/master pairing

- **Source:** `can you deny in the first place that you are our child and slave, as your fathers were before you?` ... `Would you have any right to strike or revile or do any other evil to your father or your master, if you had one...`
- **Candidate:** `can you deny that you are our child and servant, as your forefathers were before you?` ... `strike or insult or harm your father, or your master if you had one`
- **Wrong:** the candidate softens `slave` to `servant` while keeping `master` in the
  matching clause, and keeps `slave` elsewhere (3.4 `only a wretched slave would do`). The
  source's analogy is father:son and master:slave; with `servant` the second limb no
  longer pairs, and the term is rendered inconsistently across the chapter.
- **Fix:** `...that you are our child and slave, as your forefathers were before you`.

### D8 — 3.0: dropped "and not be overthrown"

- **Source:** `Do you imagine that a state can subsist and not be overthrown, in which the decisions of law have no power...`
- **Candidate:** `Do you imagine a state can survive in which the decisions of law have no force...`
- **Fix:** `Do you imagine a state can survive and not be overthrown, in which...`

### D9 — 1.16: claim shifted from the delay to the ship, pre-empting 1.20

- **Source (1.16):** `if such is the will of God, I am willing; but my belief is that there will be a delay of a day.`
- **Candidate (1.16):** `If that is the will of God, I am ready. But I do not think it will arrive today.`
- **Wrong:** the source's statement is about a **day's delay** (of the death); the
  candidate makes it about the ship's arrival, which is what Socrates only says at 1.20
  (`I do not think that the ship will be here until to-morrow`). Result: 1.16 and 1.20
  now state the same thing, and Crito's `Why do you think that?` (1.17) answers a question
  that has already been half-answered.
- **Fix:** `If that is the will of God, I am ready. But I believe there will be a day's delay.`

### D10 — 2.22: "the evil" replaced with an interpretive "bad choices"

- **Source:** `Clearly, affecting the body; that is what is destroyed by the evil.`
- **Candidate:** `Clearly the body — that is what is destroyed by such bad choices.`
- **Wrong:** `the evil` is the running technical term of this stretch of argument (2.19
  `will he not suffer evil?`, 2.21 `what will the evil be`). `bad choices` is an added
  gloss not licensed by the source, and it breaks the term chain — the candidate has
  already rendered 2.19/2.21 as `harm`, so this paragraph introduces a third term.
- **Fix:** `Clearly the body — that is what the harm destroys.` (matching the candidate's
  own rendering of 2.19/2.21).

### D11 — 3.6: `Lacedaemon` silently changed to `Sparta`

- **Source:** `might have gone either to Lacedaemon or Crete`
- **Candidate:** `You could have gone to Sparta or Crete`
- **Wrong:** proper nouns are to be preserved per the translation rules; this is a silent
  substitution of the standard modern name for the name the source actually uses. Flagged
  per the "silent corrections" criterion even though the substitution is factually right.
- **Fix:** `You could have gone to Lacedaemon or Crete` (if a gloss is wanted:
  `Lacedaemon (Sparta)`). Note `Hellenic → Greek` in the same sentence is fine — that is
  vocabulary, not a proper noun.

### D12 — 2.6: `strangers` rendered as `foreigners`

- **Source:** `here are strangers who will give you the use of theirs`
- **Candidate:** `foreigners will lend you theirs`
- **Wrong:** a silent correction toward the Greek sense (*xenoi*) rather than what the
  locked source says. Low-severity, but it is an interpretive change, and `foreigners`
  reads oddly two sentences before `Simmias of Thebes` and `Cebes` are named.
- **Fix:** `there are strangers here who will let you use theirs`.

### D13 — 1.5: added qualifier

- **Source:** `moreover. I have done him a kindness.`
- **Candidate:** `And I've done him a small kindness.`
- **Fix:** delete `small` — the source does not size the kindness.

### D14 — Editorial cross-references dropped inconsistently

Five of the source's parenthetical cross-references are dropped, while a sixth
parenthetical attribution is kept:

| Para | Source parenthetical | Candidate |
|---|---|---|
| 1.22 | `(Homer, Il.)` | kept as `(Homer, Iliad)` |
| 2.6 | `(compare Apol.)` | dropped |
| 2.7 | `(compare Apol.)` | dropped |
| 2.47 | `(E.g. compare Rep.)` | dropped |
| 3.4 | `(compare Phaedr.)` | dropped |
| 3.4 | `(compare Apol.)` | dropped |

Dropping Jowett's editorial cross-references is a defensible editorial policy (they are
apparatus, not Plato), but the policy must be applied consistently and decided
deliberately, not left as a silent per-paragraph omission. Either (a) keep them all,
modernized (`compare *Apology*`), or (b) drop them all and keep only the source
attribution at 1.22. Recommend (b), stated as the policy. **This is a policy call, not a
re-draft item.**

---

## 4. Stylistic notes (non-blocking, no fix required)

- `the many` is rendered consistently as `the crowd` throughout Chapter 2 — checked at
  2.0, 2.1, 2.2, 2.3, 2.15, 2.19, 2.33, 2.39, 2.43, 2.47, 2.51. Consistent; good.
- `the laws` is capitalized as `the Laws` when the Laws speak as characters (3.0, 3.2,
  3.4, 3.6) and lowercase for ordinary laws. Consistent and helpful to the reader.
- 2.31 `More honourable than the body?` → `More valuable than the body?` while 2.37 keeps
  `honorable`. Minor term drift; `More honorable than the body?` would keep the chain.
- 2.21 drops `whither tending` from `what will the evil be, whither tending and what
  affecting` — redundant with `what affecting` in modern English; acceptable.
- 3.2 `because we think right to destroy you` → `because we think it right to put you to
  death` loses the echo with `destroy us in return` in the same sentence. Acceptable but
  `destroy you` would preserve the reciprocity.
- 3.4 `once when you went to the Isthmus` → `once to the Isthmus games` folds the games
  clause into the exception. Meaning preserved.
- Quotations: 1.22's Homer line is fully modernized (`'Socrates — on the third day from
  now you shall arrive in fertile Phthia.'`) rather than left as archaic `shalt thou go`.
  Correct per the modernization mandate; no archaic islands found anywhere in the text.
  The long speeches of the Laws (3.0, 3.2, 3.4, 3.6), which are quoted matter, are
  modernized to the same level as the surrounding prose — checked specifically.

## 5. Whole-book re-read (cross-boundary pass)

Read end to end after the packet passes. Findings:

- **Argument chain 2.1 → 2.59.** The chain (some opinions count / the expert analogy /
  the higher part of us / good life = just life / never do wrong / never retaliate /
  do what you admit is right / therefore escaping wrongs someone) survives intact **except**
  for the missing "to be regarded" step at 2.9 (D1). That is the only break in the chain.
- **Recurring terms.** `the many/crowd`, `the Laws`, `covenants and agreements`,
  `well-governed/well-ordered`, `Thessaly` — all used consistently across chapters.
  Exceptions noted at D7 (slave/servant), D10 (evil/harm/bad choices), 2.31 (honourable/valuable).
- **Set-ups and payoffs.** The Delos ship (1.14–1.20) and the dream (1.22–1.24 → 2.0)
  carry across the chapter 1/2 boundary correctly. Crito's list of objections at 2.6
  (money, reputation, children) is correctly recalled by Socrates at 2.39. The escape-to-
  Thessaly offer at 2.6 is correctly picked up by the Laws at 3.6 as `Crito's friends in
  Thessaly`. The `you pretended that you preferred death to exile` callback at 3.4 is
  intact. No claim was found moved across a packet or chapter boundary.
- No further defects surfaced in the re-read beyond those listed above.

---

## 6. Verdict

**ACCEPT WITH FIXES REQUIRED.**

The rendering is a genuine modern-English translation, not a summary or a mechanical
cleanup; structure is sound at all 95 positions; the long rhetorical set-pieces of the
Laws are handled well and no archaic islands remain. A re-draft is not warranted — every
defect is a localized patch.

Required before pin:

- **Blocking:** D1 (2.9 — restore the dropped step, remove the duplicated question),
  D2 (2.6 — restore the orphans conditional and the reproach).
- **Should fix:** D3 (2.7), D4 (3.4), D5 (3.4), D6 (2.55), D7 (3.2), D8 (3.0), D9 (1.16),
  D10 (2.22), D11 (3.6), D12 (2.6), D13 (1.5).
- **Policy decision:** D14 (editorial cross-references — apply one rule consistently).

After the fixes, re-verify that paragraph counts remain 25/61/9 and that the speaker tags
still alternate as in the source.
