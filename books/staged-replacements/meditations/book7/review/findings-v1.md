# Independent review — Meditations, Book VII, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer subagent spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-12 |
| Branch | `claude/meditations-modern-en-20260911-v2` (worktree at commit `736e29ff3`) |
| Candidate | `book7/candidate-v1.json`, sha256 `1823989f9a35a00490041cd5600bddb01f59f1f6a2b3ed367d4d3ddd87e0e6fe` (recomputed locally with `sha256sum` and again inside the package check; matches `provenance.json` and `README.md`) |
| Source | George Long 1862, `book7/source-book7.json` sha256 `67e7bfd3bd57a4dbaa1bcd089acfb8166cceaeffa5a682cdff5de2db0be74b41` (matches `provenance.json`), byte-identical to chapter 7 of `../meditations-original-en.staged.json` sha256 `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830` (the twice-rebuilt file; matches); PG #15877 base text `source/pg15877-long-1862.txt` sha256 `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b` (matches) |
| Staged-original rebuild | **Verified independently, clean.** The pre-rebuild file was recovered from git (`git show 0c7126d04^:…/meditations-original-en.staged.json`) and its sha256 is `b0ecf3da6984c95a54ca36e1c60d20a01ad95fc6bb6e7544740e9c82717cf67f`, the value `PROVENANCE.md` §4 records. Diffed structurally against the current file: 12 chapters both sides, paragraph counts identical (17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, 36 = **487**), and **exactly one** paragraph differs in the whole file — Book 7 §45, which loses the trailing "See Aristophanes, Acharnenses, v. 661. From the Apologia, c. 16. From the Apologia, c. 16." and now ends at "…before the baseness [of deserting his post]." **Chapters 1–6 are byte-identical** (and so are 8–12), so no accepted book is reopened. The three sentences were checked in the PG text at lines 4600, 4602 and 4604: each is printed flush left in the form `[A] See Aristophanes…`, `[B] From the Apologia, c. 16.`, `[C] From the Apologia, c. 16.`, immediately after §45 and before §46, and §45 itself opens `45. [C]For thus it is, men of Athens…` — i.e. they are Long's footnotes carrying the reference letters of §44 and §45, not translation. Standard Ebooks' Long prints §45 ending "before the baseness of deserting his post." and carries all three as endnotes. The rebuild is right and I would not reverse it. |
| Text-state cross-check | Standard Ebooks' Long, fetched 2026-09-12, searched for exact phrases (text state only, never wording): VII.5 reads **"whatsoever"** (PG's "what-soever" is a line-break hyphen, as `continuity.md` says); VII.58 ends **"and remember⁠ …"**, broken exactly as PG has it; VII.45 runs "[of deserting his post]" as plain text; VII.13 keeps "[using the letter r]" and prints the Greek in Greek type (μέλος / μέρος) where PG transliterates; VII.9 keeps "[order]" and "[one]", VII.10 "[causal]", VII.17 "[happiness]", VII.29 "[formal]", VII.67 "[the intelligence]", VII.68 "[reality]", VII.72 "[social]" — every bracket the drafter lists is Long's. Two base-text variants found and reported below (VII.9, finding 9.1). |
| Packets reviewed | `review-packets/packet-01.md` … `packet-25.md`, in order, three paragraphs at a time with the supplied CONTEXT ONLY paragraphs (coverage B07-P001…P075, each exactly once); then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md` (including the new "imagination" row and the extended "the causal" and "vex ourselves at" rows), `WORKFLOW.md` (Anders's voice rules), `book7/review-instructions.md`, `book7/continuity.md`, `PROVENANCE.md`, ledger decisions D5, D8, D10, D11, D12; `book6/review/findings-v1.md` read first for format and calibration |

Mechanical checks from `book7/README.md` were re-run before reading and all passed: both hashes; 75 paragraphs one-to-one; every paragraph numbered "n. "; no `[Illustration` and no footnote opener, `Acharnenses` or `From the Apologia` anywhere in the staged file; packet coverage exactly B07-P001…P075; packet text identical to the JSON; readable copy identical to the JSON; the seven named dagger clauses present in both source and candidate; VII.45 ending at "deserting his post"; VII.58's ellipsis kept; no square bracket and no cross-reference left in the candidate; "(melos)" and "(meros)" present. In addition, a word-level diff of all 75 paragraphs was generated and read beside the packets, so every token Long has that the candidate does not (and the reverse) was inspected individually. Per-paragraph ratios run 0.70–1.12.

**Ruling on the word ratio.** The recorded 0.995 is consistent with what the diff shows: no clause, qualification or image is missing anywhere in the book. VII.12's 0.70 is fully explained — Long's ten tokens are "Be thou erect, or be made erect (iii. 5)."; four of them are the cross-reference, dropped under D5, and "Be thou erect" becomes "Stand upright". Seven words for six words of text is not a shortening. The next lowest, VII.38 (0.88) and VII.75 (0.89), are likewise the reflexive "vex ourselves at" → "resent" and the dropped "[continuity]" plus "(vi. 44; ix. 28)". The high end, VII.41 (1.12), is two grammatical words in a sixteen-word verse line. Nothing is padded and nothing is cut.

Severity: **substantive** = must be fixed before acceptance. **minor** = worth improving, drafter's discretion. **optional** = preference, no defect. Every proposed wording stays inside Long's words and the glossary. "Also noted" remarks inside an entry are not numbered findings.

---

## VII.1 — B07-P001

No material issue found.

("On the occasion of everything which happens" → "when anything happens" is Long's sense in current English; the doubled "it is what you have often seen" is kept doubled, which is the meditation's whole shape. The added "and" before "those of the middle ages" makes Long's three-member list explicit without adding a member. "There is nothing new: all things are both familiar and short-lived" is Long's, untouched.)

## VII.2 — B07-P002

**Finding 2.1 — minor (worth improving).** Long: "it is in thy power **continuously** to fan these thoughts into a flame." Candidate: "it is in your power to fan these thoughts **continually** into a flame." "Continuously" (without a break) and "continually" (again and again) are not the same word, and Long chose the first; the meditation is about keeping a fire alight, not relighting it. Both are current English, so the change buys nothing. **Proposed:** "But it is in your power to fan these thoughts continuously into a flame." Confidence high; the alternative reading (that Marcus means a repeated act) is available but is not what Long wrote.

Also noted, and **ruled on** (flag 1 of 6): the fold of "[thoughts]". Long has "unless the impressions [thoughts] which correspond to them are extinguished? But it is in thy power … to fan **these thoughts** into a flame." **The fold is right and the drop would be wrong.** The test D11 sets is whether the bracket is Long glossing his own word choice to the reader, or supplying something the sentence needs; here the *following sentence* refers back to "these thoughts", and with the bracket dropped that demonstrative has no antecedent — the same defect the Book VI review found at VI.50 "[men]". That "thoughts" also happens to be a second English word for *phantasiai* does not make it apparatus, because Long has put it to work. The apposition "the impressions—the thoughts—which correspond to them" reads naturally and is the V.8 / VI.43 pattern. It should be moved in `continuity.md` from "flagged" to a settled fold, as VI.50 was.

Also noted, optional: "the state of your feelings" for Long's "thy affects" is the glossary row and reads as plain English; it imposes no modern psychology.

## VII.3 — B07-P003

No material issue found.

(The list is kept item for item and in order: show, plays on the stage, flocks of sheep, herds, exercises with spears, the bone thrown to little dogs, the bit of bread into fishponds, the labors of ants, the runnings about of frightened little mice, the puppets pulled by strings — ten items, then "all alike". "Their carrying of burdens" attaches Long's "burden-carrying" to the ants; the list's syntax supports that and no other item is disturbed. "[All alike]" is a supplement completing the list, not a second rendering; folding it is right. The close — every man worth what the things are worth that he busies himself with — is Long's.)

## VII.4 — B07-P004

No material issue found.

("Discourse" → "conversation" is Long's sense (speech between people) and avoids the circularity "in speech attend to what is said". "Movement" → "impulse" is the glossary row and is right here: the pair is what is *said* and what is *done*. The two halves keep their different objects — the end a thing refers to, and the thing signified.)

## VII.5 — B07-P005

No material issue found.

(**Ruling on base-text defect 1 of 2.** PG prints "For what-soever either by myself or with another I can do"; Standard Ebooks reads "whatsoever". The hyphen is a line-break artifact of the printed original and "whatever" is the right rendering — this is rightly handled, and rightly recorded as a defect rather than a reading.

The three-way choice survives whole and in order: use it; or withdraw and give way to the man who can do it better, **unless there is some reason why I ought not**; or do it as well as I can with help. The exception clause is the one most easily lost and it is intact. "The general good" → "the common good" is the glossary row. The recast of the last sentence — "For whatever I can do, either by myself or with another, ought to be directed to this only" — moves Long's clause without changing what is said. Also noted, optional: "give way to him who" → "give way to the man who" adds a noun; it is licensed by the generic-"man" row and avoids "him who", which is no longer current.)

## VII.6 — B07-P006

No material issue found.

(Both halves kept, and the contrast — those celebrated and those who did the celebrating, both gone — is Long's. Dropping the second "have" is grammar.)

## VII.7 — B07-P007

No material issue found.

("Mount up on the battlements" → "climb the battlements" keeps the soldier and the assault. "How then" → "What then" is Long's idiom in current English. The meditation stays four lines and stays a question; nothing is added to explain the lame soldier.)

## VII.8 — B07-P008

**Finding 8.1 — optional (preference).** Long: "**having with thee** the same reason which now thou usest for present things." Candidate: "**carrying with you** the same reason". "Having with you" is ordinary current English and needs no replacement; "carrying" introduces a faint physical image (reason as baggage) that Long does not have. **Proposed:** "having with you the same reason which you now use for present things." Low stakes; the drafter may reasonably keep "carrying".

## VII.9 — B07-P009

**Finding 9.1 — minor (record only; no change to the candidate).** Two base-text points in this paragraph are not recorded anywhere in `continuity.md`, and both should be, on the precedent of the II.14 variant in `PROVENANCE.md` §3:
1. PG ends the paragraph "…and **participate in the reason**" (line 4395); Standard Ebooks' Long reads "participate in the **same** reason". The candidate follows PG ("share in the reason"), which is correct under the package's rule that PG is the base text — but a reader collating against SE will find a word missing, and the omission slightly weakens the run of "one … one … one".
2. PG reads "one **god** who pervades all things" (lowercase, line 4391); SE capitalises "one God". The candidate follows PG and the glossary row ("as Long has them"), which is right.

**Proposed:** no change to `candidate-v1.json`; add both to `continuity.md` under unresolved source issues. Confidence high on the facts (both checked in the PG file at the cited lines and by exact-phrase search of the fetched SE page); the judgement that PG governs is the package's own settled rule.

Also noted: "implicated" → "bound up" is the rendering Book VI fixed at VI.38 and is right. "[Order]" is Long glossing *kosmos* after his own "universe" and is rightly dropped under D11; "[one]" is rightly folded, since the sentence's whole force is the repeated "one". Extending the rational-being row to "intelligent animals" and to the bare "animals which are of the same stock" is correct — Long's "animal" is a living creature, and leaving "animals" here beside "rational being" elsewhere would have been the inconsistency. The closing conditional ("if indeed there is also one perfection…") is kept as a conditional.

## VII.10 — B07-P010

No material issue found.

("Everything formal [causal]" is Long offering two words for one thing and the drop is right under D11; the row extension covering "the causal" was made before drafting and is applied here and at VII.29 consistently. "Everything that is matter" / "everything that is form" is three words where Long has one, but it keeps his parallel intact, and "everything formal" would not be readable on its own. "Overwhelmed in time" is kept, rightly — it is current and it is his.)

## VII.11 — B07-P011

No material issue found.

(Sixteen words for sixteen. "Rational animal" → "rational being" is the glossary row.)

## VII.12 — B07-P012

No material issue found.

("Be thou erect, or be made erect" → "Stand upright, or be made upright" keeps the passive second limb, which is the whole point of the line, and keeps it to one line. The cross-reference "(iii. 5)" is apparatus (D5) and its drop is listed. This is the ratio outlier and it is fully accounted for; see the ruling in the header.)

## VII.13 — B07-P013

No material issue found.

(**Ruling on flag 2 of 6: keep the transliterated Greek.** Long's "(Greek: melos)" and "(Greek: meros)" are **rightly kept** as "(melos)" and "(meros)". The meditation is an argument that turns on one letter — *melos*, a limb, against *meros*, a piece — and Long himself keeps the Greek in the body of his text rather than in a note, because the sentence is unintelligible without it: "if, using the letter r, you say that you are a part" says nothing at all unless the two words are visible. Dropping them would not be a modernisation but the deletion of the argument. `GLOSSARY.md`'s note that "the candidate never uses the Greek" governs the glossary's own Greek column, which exists only to show which of Long's English variants belong together; it was never a rule about words Long prints in his translation. The drafter's reading is correct and I would record it in the glossary as an explicit exception so the question does not reopen at VIII.57, where PG has two more `[Greek: …]` spans.

Also noted: rendering the bodily "members" as "limbs" so that "I am a member (melos)" keeps its force is a real gain and is applied again at VII.68. "[Using the letter r]" is a supplement, not an alternative rendering, and is rightly folded. "Beneficence" → "kindness" is the Book VI row.)

## VII.14 — B07-P014

**Finding 14.1 — minor (worth improving).** Long: "For those parts **which have felt** will complain, if they choose." Candidate: "For those parts **which have felt it** will complain, if they choose." The inserted "it" supplies an object Long leaves out, and in doing so creates a garden path: "those parts which have felt it will complain" invites a first reading in which "it will complain" is the complement of "felt" ("have felt that it will complain"), and the reader has to back up. Long's absolute "have felt" is grammatical modern English and carries the sense without the ambiguity. **Proposed:** "For those parts which have felt will complain, if they choose." (If the object is wanted, "those parts which have felt the fall will complain" is unambiguous, at the cost of one added word.) Confidence high on the misparse; the addition itself is a fair reading of Long and changes no thought.

Also noted: "Let there fall externally what will" → "Let there fall from outside what will" keeps Long's odd but deliberate construction; the conclusion — unless I judge it an evil I am not injured, and that judgement is in my power — is intact.

## VII.15 — B07-P015

No material issue found.

(The change of Long's full stop to a colon before the repeated sentence is right and is the only real editorial act in the paragraph: with a full stop, "Whatever anyone does or says, I must be emerald and keep my color" reads as Marcus's own second sentence, when it is what the gold, the emerald and the purple are saying. The colon recovers Long's sense without a word added. The three substances are kept as three.)

## VII.16 — B07-P016

No material issue found.

(**Ruling on flag 3 of 6: glossary terms inside the dagger-marked clauses.** The drafter is **right**. The daggers mark Long's uncertainty about the Greek he was translating; they say nothing about which English words carry his result into this edition. A dagger clause must not be *rewritten* — its obscurity is the source's and must survive — but replacing "ruling faculty" with "the ruling part" and "perturbation" with "disturbance" changes no sense at all and does not make the clause any clearer than Long left it. Both dagger clauses are here verbatim: "does not frighten itself or cause itself pain" and "for it will never deviate into such a judgment". This is the reading Book VI took at VI.50 when it modernised that clause's pronouns, and refusing it would produce the worse result D10 already rejected — the same Long word rendered two ways inside one book, since "the ruling faculty" and "the leading principle" are one thing in this very paragraph and Long uses both.

Also noted: rendering Long's "leading principle" as "The ruling part" collapses two of his phrases into one, which is exactly what the glossary row directs, and the paragraph is the clearest case for it — the same faculty is named three times in ten lines. Body and soul are kept separate, in Long's order, with the soul's clause and its "which has completely the power of forming an opinion about these things" intact.)

## VII.17 — B07-P017

No material issue found; but see the ruling.

(**Ruling on flag 4 of 6: "Eudaemonia, happiness, is a good god within".** I would keep it. The paragraph cannot be rendered at all without the transliteration — Long's "Eudaemonia [happiness] is a good daemon" is an etymology, and an etymology with the foreign word removed is nothing — so the decision to keep "Eudaemonia" is forced, and is the same decision as VII.13. Given that, "daemon" has to be an English phrase the reader has already met, and the glossary's "the god within" is that phrase; "a good daemon" would leave an untranslated word in the predicate and send the reader to a dictionary.

The cost, which should be recorded rather than argued away, is that "within" is not in *eu-daimonia*: the reader who tries to match the Greek word to the English finds one element unaccounted for. Two alternatives were considered and are, I think, worse: "is a good daemon" (leaves the key word untranslated, which is what the edition exists to avoid) and "is a good god" (drops the glossary's settled rendering and, unqualified, suggests a deity out in the world rather than Marcus's *daimōn*). A third — "Eudaemonia, happiness, is a good god within—a good thing" — changes Long's "or" and is worse still. **Verdict: the drafter's route is the best of the available ones; keep it, and record in `continuity.md` that the "within" is the glossary's and not the etymology's.** Confidence moderate; a reviewer who ranked etymological transparency above glossary consistency could defend "a good daemon", and that reading is not unreasonable.

Also noted: dropping the vocative "O" is right — the address survives in "What then are you doing here, imagination?" — and the "imagination" row, added for this book, is what lets the address land. "I entreat thee" → "I beg you" and "thy old fashion" → "your old habit" are plain and keep the tone, which is exasperated, not solemn.)

## VII.18 — B07-P018

No material issue found.

(The chain is intact and in order: the bath needs the wood to change, food needs the food to change, nothing useful happens without change — and then the turn onto himself. "For thyself also to change" → "for you also to change" keeps the "also". Long's four questions stay four questions.)

## VII.19 — B07-P019

No material issue found.

(The torrent, the bodies carried in it, the parts of our body — all kept; the three names in Long's order with his "How many a …" repeated three times. The cross-reference is apparatus and its drop is listed. The added commas around "as through a furious torrent" help a long sentence and change nothing.)

## VII.20 — B07-P020

**Finding 20.1 — minor (worth improving).** Long: "One thing only troubles me, **lest I should do** something which the constitution of man does not allow…" Candidate: "One thing only troubles me: **that I should do** something which the constitution of man does not allow…" Long's "lest" is the archaism and does need replacing, but "that I should do" after a colon is read first as obligation — "the thing that troubles me is that I ought to do something the constitution does not allow" — which reverses the meditation. The fear-of-a-possibility sense needs a modal that is not "should". **Proposed:** "One thing only troubles me: that I may do something which the constitution of man does not allow, or in the way which it does not allow, or what it does not allow now." ("that I might do" is equally good.) The three-member "or … or …" chain is untouched by the fix. Confidence high.

## VII.21 — B07-P021

No material issue found.

(Sixteen words for sixteen; both directions of the forgetting kept, and kept in one line.)

## VII.22 — B07-P022

No material issue found.

(The four reasons are kept as four and in Long's order: they are kinsmen; they do wrong through ignorance and unintentionally; both of you will soon die; and above all, he has done you no harm, because your ruling part is not worse than it was. The "and above all" ranking survives. Repunctuating "this happens if, when they do wrong," is grammar.)

## VII.23 — B07-P023

No material issue found.

(Wax → horse → broken up → tree → man → something else, in order, with "each of these things lasts for a very short time" and the vessel that is no worse for being broken up than it was for being fastened together. "Subsists" → "lasts" and "moulds" → "molds" (the base text's spelling) are right.)

## VII.24 — B07-P024

No material issue found.

("Altogether unnatural" → "altogether against nature" is the glossary family and is correct; "contrary to reason" → "against reason" likewise. "Comeliness" → "grace" is the plain current word for what Long meant and imposes nothing. The closing question — if even the perception of doing wrong departs, what reason is there for living? — is left as a question, unexplained.)

## VII.25 — B07-P025

No material issue found.

(Adding "The" before "nature which governs the whole" is grammar, not a term change. "In order that the world may be ever new" is kept as the purpose clause it is. Cross-reference dropped and listed.)

## VII.26 — B07-P026

No material issue found.

(**The two branches are kept and kept distinct**: either you yourself think the same thing good that he does, or another thing of the same kind — and then the duty to pardon; and then the separate case, if you do *not* think such things good or evil, where you will more readily be well disposed. The conditional structure is exactly Long's and is the thing most at risk in this paragraph. "Immediately consider" → "consider at once" is word order only.)

## VII.27 — B07-P027

No material issue found.

(Both halves kept, including the warning that closes the second — being so pleased with them as to overvalue them, and so to be disturbed if you should not have them. "Think not so much of" is kept as Long's inversion, which is still current in this idiom.)

## VII.28 — B07-P028

No material issue found.

("Retire into yourself" is kept as the bare imperative. "The rational principle which rules" → "The rational part which rules" applies the row to "principle" only and leaves Long's adjective, which is the right minimum here — the phrase is not his "ruling faculty". "Tranquillity" → "calm" is the row.)

## VII.29 — B07-P029

No material issue found.

(Six imperatives in, six imperatives out, in Long's order, each still bare: wipe out the imagination; stop the pulling of the strings; confine yourself to the present; understand well what happens; divide and distribute every object into cause and matter; think of your last hour; and the closing sentence about leaving the wrong where it was done. "The causal [formal] and the material" → "cause and matter" is the extended row with the D11 drop, consistent with VII.10. "Wipe out the imagination" is Long's own phrase and is kept, not replaced by any familiar modern version of it.)

## VII.30 — B07-P030

No material issue found.

("The things that are doing" → "the things that are being done" is Long's passive in current English, and the distinction he draws — the things being done, and the things that do them — is kept as two. Cross-reference dropped and listed.)

## VII.31 — B07-P031

No material issue found.

(Only "thyself" changes. Both dagger-marked clauses stand verbatim, including the trailing dash of "The poet says that law rules all—" and the repetition in the next sentence, which is the mark of the corruption and must not be tidied. "Indifference towards the things which lie between virtue and vice" is kept in full — the technical sense is carried by Long's own gloss. "Follow God" keeps Long's capital, as the row directs.)

## VII.32 — B07-P032

No material issue found.

(Identical to Long, twenty-one words. The three-member disjunction — dispersion, resolution into atoms, annihilation — and the two-member conclusion — extinction or change — are both intact.)

## VII.33 — B07-P033

No material issue found.

(The two limbs of the pain argument are kept with their quantifiers — intolerable pain carries us off, long-lasting pain is tolerable — and so is the concession to the parts that are harmed. Only the two glossary words change.)

## VII.34 — B07-P034

No material issue found.

("[Of those who seek fame]" is a supplement Long's "the minds" cannot do without, and folding it is right. "Hide the former sands" → "hide the sands before them": "former" here means earlier in the heap, which a modern reader takes as "previous, now gone", so the change is a repair, not a preference; "the sands before them" keeps the spatial sense the image needs. The image and the moral drawn from it are kept in Long's order.)

## VII.35 — B07-P035

No material issue found.

(Long's dialogue dashes survive, and with them the two voices — "It is not possible, he said." / "Certainly not." The elevated mind, all time and all substance, and the inference to death, are in Long's order. Only the thou-form changes. Nothing here echoes any familiar English Plato: the sentence is Long's own laboured relative clause, kept as such.)

## VII.36 — B07-P036

No material issue found.

(Identical to Long. Thirteen words, unexpanded and unexplained.)

## VII.37 — B07-P037

No material issue found.

("Base" → "shameful" and "countenance" → "face" are both right; Long's moral "base" is now chiefly literary, and the same decision is taken consistently at VII.45. The chiasmus — the face obedient to the mind, the mind not composed by itself — is kept intact, which is the whole of the meditation.)

## VII.38 — B07-P038

No material issue found.

("It is not right to vex ourselves at things" → "It is not right to resent things" applies the extended row, and the extension is correct: Long's reflexive here is his "be vexed at" in another shape, not the transitive "vex" the row excludes. The verse line "For they care nothing about it" keeps Long's capital and his sequence — the reason follows the statement — and "nought" → "nothing" is the plain word. Two lines, two lines.)

## VII.39 — B07-P039

No material issue found. (Identical to Long.)

## VII.40 — B07-P040

No material issue found.

(Identical to Long, including the abrupt second sentence. The corn image is left as an image.)
