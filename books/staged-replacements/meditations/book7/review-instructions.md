# Independent Review Instructions — Meditations, Book VII

Give this exact text to the independent reviewer, unmodified.

---

You are independently reviewing a proposed modern-English reading edition of Marcus Aurelius, Meditations, Book VII, against its supplied source: George Long's 1862 translation, one paragraph per numbered meditation (VII.1–VII.75). Read `GLOSSARY.md` first: it fixes the renderings of recurring concepts (nature, the nature of the whole, the universal nature, reason, rational being, social being, the ruling part, the god within, the divine, providence, the common good, opinion, impressions, impulse, disturbance, calm, resent, kindness, and others), including one row added for Book VII (imagination → imagination, Long's second English word for *phantasia*, kept distinct from "impressions" as II.12 and III.1 already have it) and two rows extended (form / matter now covers Long's paired noun "the causal", VII.10 and VII.29; resent now covers his reflexive "vex ourselves at", VII.38). A glossary rendering used consistently is not a finding; a departure from it is. Read `book7/continuity.md` next: it records the per-paragraph decisions, the places where Long's bracketed supplements were folded into prose, the apparatus dropped (seven cross-references and six bracketed alternative renderings), the base-text defects, and six decisions the drafter has explicitly flagged for your ruling.

**One thing to check before anything else.** The staged Long original was rebuilt at Book VII step 1 (sha256 `b0ecf3da…` → `7798607d…`). Three of Long's footnotes are printed flush left in the PG text ("See Aristophanes, Acharnenses, v. 661." and "From the Apologia, c. 16." twice, PG lines 4600, 4602, 4604), and the build's footnote filter had missed them and appended all three to VII.45 as if they were Long's translation. VII.45 is the only paragraph in the whole file that changed; chapters 1–6 are byte-identical, so Books I–VI stand. Please verify this independently against `source/pg15877-long-1862.txt` and confirm that VII.45's source paragraph should end at "deserting his post." If you disagree, say so — the rebuild is recorded in `PROVENANCE.md` §4 and the ledger under D12 and can be reversed.

Review each packet carefully. Neighboring context is supplied to help interpret the assigned paragraphs. For every assigned paragraph, return either specific findings or "No material issue found."

Check:

- The argument: each step, its order, and what follows from what. Book VII argues (VII.2 how principles die and how they are revived; VII.5 the three-way choice when one's understanding is not sufficient; VII.9 the one universe, one god, one substance, one law, one reason, one truth, with its closing conditional; VII.13 why "member" and not "part"; VII.16 what can and cannot disturb the ruling part, body and soul taken separately; VII.18 the chain of changes — the bath, the food — and the conclusion drawn about oneself; VII.26 the two branches of what you may think good; VII.55 the three things in man's constitution, in order, with the second's reason; VII.64 why pain neither dishonors nor damages, and the list of things that are not pain; VII.66 what would actually settle Socrates against Telauges; VII.68 the judgment's speech and the use's speech; VII.75 the disjunction about consequence and the ruling power).
- Qualifications, conditions, negation, certainty, quantity, sequence vs. cause, "some" vs. "all", and Long's "neither … nor … nor" chains (VII.26, VII.52, VII.55, VII.66, VII.69).
- Imagery and concrete detail (the show, the flocks, the spears, the bone thrown to little dogs, the bread into fishponds, the ants, the frightened mice, the puppets on strings; the soldier lame on the battlements; the gold, the emerald and the purple; wax molded into a horse, then a tree, then a man; the scowling look; the heaps of sand; the courses of the stars; Plato's view from a higher place with its whole list, item for item; the ripe ears of corn; the wrestler and the dancer; the fountain that bubbles up if you dig; the wild beasts and the kneaded matter) kept as images, not replaced by explanations.
- Marcus's voice: compact, personal, self-addressed. Flag any turn toward advice for a reader, moral lesson, motivational tone, or explanation addressed to a modern audience. Book VII has a long run of very short meditations (VII.6, VII.7, VII.8, VII.11, VII.12, VII.14, VII.15, VII.20, VII.21, VII.28, VII.30, VII.32, VII.36–VII.43, VII.56, VII.57, VII.59, VII.61, VII.65, VII.71–VII.74): check that none is expanded.
- The long quotation cluster VII.35–VII.51 (Plato, Antisthenes, and unattributed verse). These are Long quoting other authors. Check that the candidate modernises **Long's English** and does not drift toward any familiar published translation of Homer, Hesiod, Euripides or the Apology, and that Long's verse capitals and his dialogue dashes (VII.35, VII.50) survive.
- Meaningful repetition and lists kept: the list of trivia in VII.3; the roll in VII.48; the three constitutional things in VII.55; the non-pains in VII.64; Socrates' achievements in VII.66.
- Missing content and unsupported additions, including glosses not licensed by `GLOSSARY.md` or `continuity.md`.
- Any modern psychological interpretation imposed on Marcus's terms (in particular VII.38, VII.58, VII.66 and VII.70 "vexed", rendered "resent" / "resentful"; VII.16 "perturbation", rendered "disturbance"; VII.9 "implicated", rendered "bound up"; VII.50 "involution", rendered "entanglement"; VII.2 and VII.66 "affects", rendered "feelings").
- The base-text defects `continuity.md` records: VII.5 "what-soever" (a line-break hyphen; rendered "whatever"); VII.58's broken ending "and remember…" (the ellipsis kept, on the V.29 precedent). Say whether each is rightly handled.
- **Six flagged decisions, on which a ruling is specifically requested:**
  1. **VII.2 "[thoughts]"** — folded as an apposition ("the impressions—the thoughts—which correspond to them") rather than dropped under D11, because Long's next sentence says "fan these thoughts into a flame" and needs the antecedent. This is the class VI.50 "[men]" settled. But "thoughts" is also arguably a second rendering of *phantasiai*. Fold or drop?
  2. **VII.13, the Greek.** Long's "(Greek: melos)" and "(Greek: meros)" are **kept** as "(melos)" and "(meros)", and "[using the letter r]" is folded, because the meditation is a pun on two Greek words differing by one letter. `GLOSSARY.md` says the candidate never uses Greek — that note governs the glossary's own Greek column, not Long's in-text words, but a ruling is wanted.
  3. **VII.16, glossary terms inside dagger clauses.** The two dagger-marked clauses keep Long's wording but take the glossary's "the ruling part" for his "ruling faculty" / "leading principle" and "disturbance" for "perturbation", on the reading that the daggers mark uncertain **Greek** — a question about what Long was translating, not about how his English is carried over (the reading VI.50 took when it modernised that clause's pronouns). Right or wrong?
  4. **VII.17, the hardest paragraph in the book.** "Eudaemonia [happiness] is a good daemon" → "Eudaemonia, happiness, is a good god within": the bracket folded as an apposition, the transliterated Greek kept, and "daemon" taking the glossary's "the god within" so that Marcus's etymology (*eu-daimonia*) is legible. Is there a better route?
  5. **VII.50 "the unsentient elements"** → "the elements that have no sensation". The one place in the book where the candidate uses more words than Long for a single term. "Unsentient" is not current, "insentient" is rare and formal, "unfeeling" now means callous. Better option?
  6. **VII.55 "for both are animal"** — kept exactly as Long has it, because he uses "animal" adjectivally against "intelligent" and every unpacking ("belong to the animal part", "are animal movements") adds a noun he does not have. Is the no-expansion rule right to win here?
- Remaining vocabulary or syntax that obstructs a general modern reader.
- Whether suggested corrections preserve natural prose and Long's meaning.

For each finding, provide:

- Stable paragraph ID (B07-P001 … B07-P075).
- Short exact source and candidate quotations.
- The precise difference and why it matters.
- Severity: Must fix / Worth improving / Optional preference.
- The smallest proposed correction.
- Confidence and any plausible alternative reading.

Do not invent objections to fill a quota. Do not equate different wording with an error. Do not claim an addition or a phrase came from another translation unless verified against that translation. Preserve deliberate ambiguity, including the passages Long marks as textually uncertain (**seven dagger marks in Book VII of the PG text, in four sections**: VII.16 ×2, VII.31 ×2, VII.46 ×2, VII.67 ×1), which the candidate keeps as Long has them, with pronouns modernised and glossary renderings applied, and is not expected to make clearer than Long:

- VII.16, mark 1 (PG line 4433): "The ruling part does not disturb itself; I mean, does not frighten itself or cause itself pain."
- VII.16, mark 2 (PG line 4439): "for it will never deviate into such a judgment".
- VII.31, mark 1 (PG line 4529): "The poet says that law rules all—".
- VII.31, mark 2 (PG line 4530): "And it is enough to remember that law rules all."
- VII.46, mark 1 (PG line 4607): the "for" joining "saving and being saved" to "as to a man living such or such a time".
- VII.46, mark 2 (PG line 4609): "consider if this is not—a thing to be dismissed from the thoughts:".
- VII.67, mark 1 (PG line 4788): "Nature has not so mingled the intelligence with the composition of the body" (the dagger sits immediately before Long's "[the intelligence]", which is folded).

Word and paragraph counts do not prove semantic completeness.

Save findings by paragraph ID under `book7/review/`. Make no changes to `candidate-v1.json`.

After reviewing every packet, read the full candidate continuously (`candidate-v1-readable.md`) for voice, pacing, repetition, terminology, and transitions. Report any additional chapter-level findings.

Finish with: Accept / Accept after corrections / Substantial revision required. State review coverage and limitations. Do not assign a numerical score or claim that no errors can remain.
