Model: opus

# Verification — ch355 round two (Second Epilogue, Chapter 2)

Independent verification. I did not draft, review or correct this chapter, and I
was not the round-one verifier. All diffs were computed directly from the JSON
files with Python; the round-two corrections log was read only afterwards, to be
checked against the computed diff.

Files verified:
- source: `ch355-source.json` — sha256 `5df224e3ecf07e4b21464d4a26a729e3176bfdb0d632bc1e59e2e5eaa4795f34`
- pre-round-two: `ch355-corrected.json` — sha256 `166550adf3c9fcd271f8d19bcb84573b9c11251798fabb81147630d9973e40b5`
- round-two: `ch355-corrected-r2.json` — sha256 `c820d8c25d8ccf2f702db64d8aba449acc32bebbc28fe878d900b1e250148b37`
- log: `ch355-corrections-log-r2.md`
- context: `ch355-verification.md` (round one)

The pre-round-two file's hash matches the hash the round-one verification signed,
so round two was built on the exact file that was sent back. Confirmed.

## 1. Diff vs. log

Computed paragraph-level diff of `ch355-corrected.json` → `ch355-corrected-r2.json`
(0-based indices, matching the log's `¶N` headings):

| ¶ | changed | logged |
|---|---------|--------|
| 0 | no | — |
| 1 | yes | yes |
| 2 | no | — |
| 3 | yes | yes |
| 4 | no | — |
| 5 | yes | yes |
| 6 | yes | yes |
| 7–12 | no | — |

Four paragraphs changed; four log entries. **One-to-one — no mismatch.** The
remaining nine paragraphs are byte-identical to round one, as the log claims.
`number` (355) and `title` ("Second Epilogue — Chapter 2") are unchanged.

Six discrete edits inside those four paragraphs, all six logged:
¶1 two insertions, ¶3 one replacement + one insertion, ¶5 one insertion,
¶6 two insertions. No sub-paragraph edit escaped the log — the class of defect
round one flagged as V-3 does not recur.

**Log hygiene:** every "Before" and "After" excerpt in the round-two log was
checked for byte-exactness against the corresponding file. All ten pass. Round
one's V-4 (non-byte-exact log excerpts) is also cleared.

## 2. Per-change verdicts (re-derived from source, not from the log)

| ¶ | change | source | verdict |
|---|--------|--------|---------|
| 1 | `Thiers,` → `The historian Thiers,`; `Lanfrey,` → `The historian Lanfrey,` | "Thiers, a Bonapartist, says…"; "Lanfrey, a Republican, says…" | **Correct.** Tags only; the Bonapartist/Republican appositives, the virtue-and-genius / trickery-and-deception contrast and the sentence structure are untouched. See §3. |
| 3 | `turns into a force producing events` → `is itself a force producing events` | "…and then his power **is itself** a force producing events." | **Correct and complete.** Restores the source phrase verbatim. This is round one's V-2, fully discharged — the source's "itself", not a paraphrase of it, is now on the page, and the self-contradiction Tolstoy is staging (product of forces → producer of events) reads at full strength. |
| 3 | `Gervinus, Schlosser,` → `The historians Gervinus, Schlosser,` | "Gervinus, Schlosser, and others, for instance…" | **Correct.** First mention in the chapter; ¶6's later "the universal historian Gervinus" is untouched, so no double tag. See §3. |
| 5 | `resultant force,` → `resultant force (as in mechanics),` | "To find component forces equal to the composite or resultant force, the sum of the components must equal the resultant." | **Correct.** Single insertion, nothing else in the paragraph touched. See §3. |
| 6 | `Chateaubriand and others` → `Chateaubriand, and others` | "…Fichte, **Chateaubriand, and** others." | **Correct.** Matches the source's serial comma. Round one's V-3 discharged, and this time logged. |
| 6 | `is forced to fall back` → `is again forced to fall back` | "…the historian is **again** obliged to fall back on power…" | **Correct and complete.** This is round one's blocking V-1. The source word is back, in the source's own position (immediately before the verb phrase), by the smallest possible insertion. The argument is restored to a relapse rather than a move: the historian who has just dismissed power is driven back to it. Nothing else in the sentence changed; "very" and "just", which were genuine added emphasis, remain correctly removed. |

All three round-one findings (V-1 blocking, V-2, V-3) are discharged. No fourth
edit was smuggled in alongside them: ¶10's Frenchmen-drowning allusion is
untouched, as the log states.

## 3. Ruling on the three added tags

The test: each must state only a category or a fact, and add no claim to
Tolstoy's argument.

**¶1 — "The historian Thiers" / "The historian Lanfrey."**

Category only. Adolphe Thiers and Pierre Lanfrey were historians, and the source
itself already predicates it of them: the sentence they answer is "historians of
that kind contradict each other even in their statement as to the force on which
the authority of some particular person was based," and Thiers and Lanfrey are
produced as its two instances. The tag therefore adds no fact the source does not
already assert — it only moves an entailment of the frame sentence down into the
apposition where a reader who does not recognize the names can see it. It says
nothing about their dates, nationality, quality, or influence, and nothing about
whether either man is right. Tolstoy's argument here is that the two accounts
cancel each other; the tag makes both men equally historians, which is exactly the
symmetry the argument needs and does not tilt it toward either. **Passes.**

**¶3 — "The historians Gervinus, Schlosser, and others."**

Category only. Gervinus and Schlosser were historians, and the source frames them
as instances of the universal historians under discussion ("Yet in most cases
universal historians still employ the conception of power… Gervinus, Schlosser,
and others, for instance"). Note the tag is *weaker* than the frame: it says
"historians," not "universal historians," so it under-claims rather than
over-claims and cannot be read as assigning them to a school on the verifier's
authority. It carries no nationality, period, or doctrine. The argumentative work
of the paragraph — that the same writers derive Napoleon from the Revolution and
then derive the Revolution's arrest from Napoleon — is done by the two "at one
point / at another point" clauses, which are untouched. **Passes.**

**¶5 — "(as in mechanics)."**

Fact only. The word "mechanics" does not appear in the source chapter; this is
the least textually anchored of the three and deserves the closest look. It
survives it. The vocabulary of the sentence — "component forces," "composite or
resultant force," components summing to a resultant — is the vocabulary of
composition of forces, and the rule as stated is the rule as it holds in
mechanics. The gloss names the domain the rule is borrowed from. It does not
assert that history *is* mechanics, does not endorse the analogy, and does not
strengthen the requirement: the source already states the condition flatly and
without hedge ("the sum of the components **must** equal the resultant"), so the
gloss adds no force to the standard the universal historians are then said to
fail. Under either available parse — "(as one does in mechanics)" attaching to the
rule, or "(in the mechanical sense)" attaching to "resultant force" — the content
is a terminological identification. It adds no proposition Tolstoy would have to
defend; the proposition was already his. **Passes.**

All three stay inside the "identify, do not interpret" line. Consistent with the
round-one rulings on the ¶6 statesmen-and-writers tag and the ¶10 Rousseau gloss,
which remain in place and unchanged.

## 4. Whole-chapter read against source

Final read of `ch355-corrected-r2.json` end to end against `ch355-source.json`,
not restricted to the changed paragraphs.

- **Named historians and figures — all present at identical counts:** Thiers (1),
  Lanfrey (1), Gervinus (2), Schlosser (1), Napoleon (11), Alexander (5),
  Stein (1), Metternich (1), Madame de Staël (3), Talleyrand (3), Fichte (1),
  Chateaubriand (4), Bourbons (3), Bonapartist (1), Republican (1),
  Le Contrat Social (1), Revolution (4). Rousseau (1) is the only proper noun
  added — the round-one gloss, re-ruled sound above. Nothing dropped, nothing
  else added.
- **Dates intact:** 1789 (2), 1812 (2), 1813 (2), all at source counts.
- **Examples intact, all eight:** Thiers's virtue-and-genius against Lanfrey's
  trickery; Gervinus and Schlosser deriving Napoleon from the Revolution and then
  the Revolution's arrest from Napoleon; Gervinus decomposing Alexander's power
  into Stein, Metternich, de Staël, Talleyrand, Fichte, Chateaubriand; the
  A-versus-a-thousand-times-A arithmetic; the peasants and the wind; the cruel
  murders of the French Revolution out of the doctrine of equality and the cruel
  wars and executions out of the preaching of love; Le Contrat Social and the
  drownings; the campaign of 1812 as the event the culture-historians cannot
  narrate without power.
- **Both numbered considerations intact:** "(1)" and "(2)" each once, each with
  full content — history written by learned men, with the traders/agriculturists/
  soldiers parallel and the parenthetical about who does not write history; and
  the vague-conceptions argument, including "and which can therefore be worked
  into any theory," whose restored "and" keeps the antecedent open.
- **Negations and polarity:** checked clause by clause. "not an accident," "do not
  treat it," "can no longer… be treated," "never observe this condition," "does
  not add up to the resultant," "does not account for the submission of millions,"
  "why not explain them," "only with a considerable stretch," "one can never
  admit," "is not confirmed by," "cannot be understood without," "still goes
  unanswered," "If they do not say so," "do not write history," "does not account
  for," "a power they apparently do not recognize." No polarity flips, no double
  negation collapsed. ¶9's "in no case can one admit" → "one can never admit" is
  a faithful rendering, not a strengthening.
- **Conditionals intact:** "if historical events can be explained… why not explain
  them" (¶9); the twinned "even granting… even granting" concession (¶10); "If
  they do not say so" (¶11).
- **Irony intact:** the peasants blaming the wind either way (¶7); "writers and
  society ladies as forces producing events" (¶8); the parenthetical "(If they do
  not say so, it is simply because merchants and soldiers do not write history.)"
  (¶11); "(which may perhaps even be useful to someone, for something)" (¶12);
  Frenchmen drowning one another over a book (¶10). None flattened into
  straight statement.
- **Hedges intact:** "it would seem," "in effect," "apparently," "perhaps,"
  "involuntarily," "unwittingly."
- **No added intensifiers or connectives.** Programmatic scan of thirty-two
  intensifiers and thirteen connectives, source against round two: every count is
  equal or lower in round two. "very" 4→2 (both losses are "very cruel" →
  "extremely cruel," equivalent), "quite" 3→2, "only" 9→7, "therefore" 2→1,
  "consequently" 1→0. The two tokens that rise — "never" 1→2 and "simply" 1→2 —
  are renderings of existing source material, not additions ("in no case can one
  admit" → "one can never admit"; "that is merely because" → "it is simply
  because"). No "however," "moreover," "furthermore," "thus," "nevertheless," "in
  fact," "after all" or "in other words" anywhere in the file.

## 5. Structure

- Paragraph count 13 in source, 13 in round one, 13 in round two. Order unchanged.
- No empty or whitespace-only paragraphs.
- Question-mark parity with source in every paragraph (¶0 1/1, ¶9 1/1, all others
  0/0). Exclamation marks 0 in source, 0 in round two.
- Per-paragraph word-count ratio against source ranges 0.95–1.11; no paragraph
  near a condensation threshold. ¶6 rises from 1.05 with the restored "again",
  correctly.
- Em dashes: 20 unspaced, 0 spaced. Conforms to `draft.md`.
- JSON valid (`python3 -m json.tool`). `number` and `title` identical across
  source, round one and round two.

## 6. New findings

No blocking findings.

**W-1 (non-blocking, pre-existing, ¶8).** Source: "again take that force to be
something **quite different**." Round two: "take that force to be something else
again." The "again" survives, but the source's "quite" is softened out. Inherited
from candidate A — round one touched only the em dashes in this paragraph — so it
is outside the scope of both correction rounds. Meaning survives; noted for the
record, not a reason to reopen.

**W-2 (non-blocking, pre-existing, ¶8).** Source "writers and ladies"; round two
"writers and society ladies." A one-word narrowing, accurate in context (Madame
de Staël) and helpful to a modern reader, but it is a gloss that was never logged
or ruled on, since it too predates round one. It does not touch the sting of the
phrase — the point is that these are counted as forces producing events, and that
is intact. Flag only.

Neither finding arises from a round-two edit, and neither changes a claim, an
example, a negation or a name.

## 7. Verdict

All four changed paragraphs are logged, all six discrete edits are logged, and no
paragraph changed that the log does not name. Every edit re-derives correctly
from the source, and in four of the six cases restores a source word or mark
verbatim. Round one's blocking finding V-1 is fixed with the source's own "again",
in the source's own position; V-2 is fixed beyond what was asked, with the source's
"is itself" restored word for word; V-3 is fixed and logged; V-4's log-hygiene
defect does not recur — every excerpt in the round-two log is byte-exact. The
three added tags are categorial or factual, add no proposition to Tolstoy's
argument, and do not double up on the existing ¶6 tag. The whole-chapter read
finds every named historian, every example, both numbered considerations, every
negation, conditional and ironic turn intact, with no added intensifier or
connective anywhere in the file. Structure and punctuation parity hold.

Acceptance applies to the hash below and to no other file.

sha256: c820d8c25d8ccf2f702db64d8aba449acc32bebbc28fe878d900b1e250148b37

Verification: ACCEPT
