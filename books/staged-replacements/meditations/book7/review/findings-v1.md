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

## VII.41 — B07-P041

No material issue found.

(The conditional and its bare conclusion — "There is a reason for it" — are kept, and kept as two verse lines with Long's capital at "There". Also noted, optional: "If gods care not for me" → "If the gods do not care for me" adds a definite article Long's verse line does without. The glossary directs "the gods; god — as Long has them", and "If gods do not care for me and my children" is perfectly current, so the article could be dropped; but the line scans awkwardly without it and nothing turns on it. No change proposed.)

## VII.42 — B07-P042

No material issue found. (Identical to Long. "The good … and the just" kept as two.)

## VII.43 — B07-P043

No material issue found.

(Identical to Long, including "emotion", which the glossary leaves as Long's own word. Two prohibitions, kept as two.)

## VII.44 — B07-P044

No material issue found.

(Long's whole conditional survives: a man good for anything at all ought not to compute the hazard of life or death, but should look only to whether what he does is just or unjust, and the works of a good or a bad man. "Thou sayest not well" → "You do not speak well" keeps the rebuke's flatness. The added "a" in "a good or a bad man" is grammar. Nothing here echoes a familiar English *Apology*; the sentence keeps Long's "compute the hazard", which no modern version has.)

## VII.45 — B07-P045

No material issue found.

(This is the paragraph the step-1 rebuild fixed, and the candidate is drafted from the corrected source: it ends at "deserting his post" with the three footnotes gone, as it should. See the header for the independent verification. "[Of deserting his post]" is a supplement completing "the baseness", not a second rendering, and folding it is right — Standard Ebooks prints it as running text. "Baseness" → "disgrace" follows VII.37 and is consistent. The soldier-at-his-post argument keeps both its cases, self-chosen and commander-given, and its "taking nothing into the reckoning, either death or anything else".)

## VII.46 — B07-P046

No material issue found.

(Both dagger-marked places stand as Long has them, including the unusual "consider if this is not—a thing to be dismissed from the thoughts:" with its dash and colon, which a tidier hand would have smoothed and which must not be smoothed. Only "intrust" → "entrust" and "the Deity" → "the divine" change. Also noted, optional: "a man must entrust them to the divine" is a slightly abstract recipient for an act of entrusting, and "the Deity" is the one place in Book VII where Long's capitalised abstract noun reads almost personally; but the glossary row is settled across six accepted books and consistency rightly wins. The women, the destiny no man escapes, and the closing inquiry are all kept.)

## VII.47 — B07-P047

No material issue found.

("Terrene" → "earthly" is the rendering Book VI fixed at VI.30 and is applied consistently. The stars, the going along with them, and the changes of the elements are kept as images; "purge away the filth" is Long's and is not softened.)

## VII.48 — B07-P048

No material issue found.

(Plato's list is kept item for item and in order — assemblies, armies, agricultural labors, marriages, treaties, births, deaths, the noise of the courts of justice, desert places, various nations of barbarians, feasts, lamentations, markets — thirteen items, closing on "a mixture of all things and an orderly combination of contraries", which is the point of the list and survives intact. "Discoursing" → "talking" is the plain word; the added "the" before "noise" is grammar. The view from a higher place is left as a view, not explained.)

## VII.49 — B07-P049

No material issue found.

(Long's dash after "Consider the past," is kept. The argument's steps are all there: they will be of like form; they cannot deviate from the present order; therefore forty years contemplated is ten thousand contemplated; "For what more will you see?" Also noted, optional: "such great changes of political supremacies" → "of political power". Long's countable plural is not current and had to go, but "changes of political power" can be read as ordinary transfers of office, where Long means whole dominations rising and falling; "such great changes of political supremacy" or "such great changes of ruling powers" would keep more of that. The next sentence ("they will certainly be of like form") repairs the reading, so I do not press it.)

## VII.50 — B07-P050

No material issue found; the flagged expansion is upheld.

(**Ruling on flag 5 of 6: "the unsentient elements" → "the elements that have no sensation".** **Upheld.** "Unsentient" is not current English; "insentient" is rare and formal and would fail the accessibility standard as squarely as the word it replaces; "unfeeling" now means callous, which inverts the sense — these are the elements that cannot feel, not elements indifferent to suffering. "Non-sentient" is jargon. That leaves a relative clause, and "the elements that have no sensation" is the shortest one available; it adds three words but not one idea, and the no-expansion rule is a rule against *explaining*, not against English needing more words than Greek-derived Latinate compounds. Standard Ebooks' Long confirms "unsentient" is Long's own word and not a PG corruption. **Keep it, and record it in `continuity.md` as the book's one licensed expansion**, so that a later book does not cite it as precedent for expansions that do carry an added idea. Confidence high.

Also noted: the three verse lines keep Long's capitals ("That which has grown from the earth to the earth, But that which has sprung from heavenly seed, Back to the heavenly realms returns") and nothing in them drifts toward a familiar English Euripides. "Involution" → "entanglement" is the Book VI rendering at VI.10, applied consistently. The two-branch disjunction — dissolution of the atoms, or dispersion of the elements — is kept as two.)

## VII.51 — B07-P051

No material issue found.

("'Scape" → "escape" is the only change; the two quotations stay two, with Long's capitals and his line starts. The magic arts, the channel's course and the breeze heaven sent are all kept as images.)

## VII.52 — B07-P052

No material issue found.

("More expert in casting his opponent" → "more expert at throwing his opponent": Long's wrestling sense of "cast" is now opaque, and "throw" is the current wrestling word and the one VII.61's wrestler implies. The four-member "nor … nor … nor …" chain is kept as four and in order — social, modest, better disciplined to meet all that happens, more considerate about his neighbors' faults.)

## VII.53 — B07-P053

No material issue found.

("Conformably to the reason" → "according to the reason" is the glossary family. Both halves of Long's argument, and his "for", are kept; "there no harm is to be suspected" is left as the understatement it is.)

## VII.54 — B07-P054

No material issue found.

("Piously to acquiesce in" → "piously to accept" is right: "acquiesce in" is stiff and now carries reluctant consent, which "piously" contradicts. The three things that are always in your power — accept your condition, behave justly to those about you, work on your present thoughts so nothing steals in unexamined — are kept as three and in order. Long's stray comma after "behave" is a base-text slip and is rightly not reproduced; worth a line in `continuity.md`.)

## VII.55 — B07-P055

No material issue found; the flagged decision is upheld, with an optional alternative.

(**Ruling on flag 6 of 6: "for both are animal".** **Upheld — keep it.** Long is using "animal" adjectivally against "intelligent", and the contrast is what the sentence is for; every unpacking the drafter names ("belong to the animal part", "are animal movements") supplies a noun Long does not have and nudges the reader toward a faculty psychology Marcus has not set up here. The reading is recoverable from the immediate context, which names "the motion of the senses or of the appetites" one clause earlier.

**Optional alternative, offered and not pressed:** "for both are animal motions". English resists a bare predicative "are animal", and "motion" is Long's own noun, used twice in this same sentence ("the rational and intelligent motion", "the motion of the senses"); supplying it as the elided head is arguably restoring Long's ellipsis rather than expanding him. Standard Ebooks punctuates the clause "for both are animal;" with a semicolon rather than PG's colon, which does not affect the question. If the drafter takes it, it should be recorded as a fold of an ellipsis, not as an expansion. Confidence moderate: both routes are defensible and the no-expansion rule is a sound tie-breaker.

Also noted: the three things in man's constitution are kept as three, in order, and the second keeps its reason ("for it is the peculiar office of the rational and intelligent motion to circumscribe itself…" and "And with good reason, for it is formed by nature to use all of them"). Long's "motion" is rightly kept as "motion" throughout and not swept into the glossary's "impulse" row, which covers his "movement" only. "Ruling principles" → "ruling parts" and the final "ruling principle" → "the ruling part" are the row. The subordination — irrational things for the sake of the superior, the rational for the sake of one another — survives whole.)

## VII.56 — B07-P056

No material issue found.

(Twenty-eight words for twenty-eight; the two imperatives and "the remainder which is allowed you" are Long's, unexpanded.)

## VII.57 — B07-P057

No material issue found.

(The thread of destiny is kept as an image and the closing question is kept as a question. Only the thou-forms change.)

## VII.58 — B07-P058

No material issue found.

(**Ruling on base-text defect 2 of 2: the broken ending.** **Rightly handled.** Long's section stops mid-sentence at "and remember…"; Standard Ebooks' Long ends it the same way ("and remember⁠ …"), so this is Long's text and not a PG corruption. Keeping the ellipsis, on the V.29 precedent, is correct; completing the sentence would be inventing Marcus, and cutting the clause would hide a fact about the text. The candidate keeps it exactly.

"How they were vexed" → "how they resented them" applies the row; the added object is required by the verb and its antecedent is unmistakable one clause back. "[To work on]" is a supplement the sentence needs and is rightly folded. The chain of questions — why choose to act the same way; why not leave the agitations to those who cause them; why not be intent on the right use — is kept as three, in order, with Long's "and why … and why".)

## VII.59 — B07-P059

No material issue found.

("Look within. Within is the fountain of good, and it will ever bubble up, if you will ever dig." Twenty words for twenty, Long's repetition of "within" and his two "ever"s intact, and no drift toward the familiar shorter modern versions of this sentence.)

## VII.60 — B07-P060

No material issue found. (Identical to Long, fifty-four words; already current.)

## VII.61 — B07-P061

No material issue found.

("In respect of this, that" → "in this respect, that" is word order only. The wrestler and the dancer are kept as the contrast, and the reason given — ready and firm against sudden and unexpected onsets — is Long's.)

## VII.62 — B07-P062

No material issue found.

("Approbation" → "approval" follows VI.13 and is applied to both occurrences. The two consequences are kept as two ("neither blame … nor will you want their approval") and the condition that produces them — looking to the sources of their opinions and appetites — is kept last, where Long has it.)

## VII.63 — B07-P063

No material issue found.

("Benevolence" → "kindness" is the Book VI row and sits naturally in the list. The inference — involuntarily deprived of truth, therefore of justice and temperance and kindness — is kept as an inference, with "consequently" and "in the same way" both present, and the conclusion drawn for oneself ("you will be more gentle towards all") is kept as Marcus's own.)

## VII.64 — B07-P064

No material issue found.

(The reasoning is intact in order: no dishonor in pain; it does not make the governing intelligence worse; it does not damage the intelligence as rational or as social; then Epicurus's remark with both of its conditions ("if you bear in mind that it has its limits, and if you add nothing to it in imagination"); then the three non-pains — excessive drowsiness, being scorched by heat, having no appetite — kept as three; then the turn back on himself. "In imagination" is the row added for this book, and this is the paragraph that most needs it: "in impressions" would be unreadable here. Dropping the articles from "the being scorched", "the having no appetite" is grammar. "Aid thee" → "help you" is the plain word.)

## VII.65 — B07-P065

No material issue found. (Identical to Long, fourteen words. The bite of "as they feel towards men" is kept.)

## VII.66 — B07-P066

**Finding 66.1 — minor (worth improving).** Long: "How do we know **if** Telauges was not superior in character to Socrates?" Candidate: "How do we know **that** Telauges was not superior in character to Socrates?" Long's "if" is "whether", and the meditation is an open question — we are not in a position to know how the two men compared, which is why the rest of the paragraph asks what we would have to know. "How do we know *that* X was not superior" is read in current English as a challenge to someone who has asserted the contrary, which puts Marcus in a debate he is not having and makes the following "For it is not enough that…" read as a rebuttal rather than as the reason the question is open. The plain fix keeps every other word. **Proposed:** "How do we know whether Telauges was not superior in character to Socrates?" Confidence high; Standard Ebooks' Long has the same "if", so this is Long's word and not a PG variant.

Also noted: Socrates' achievements are kept as a list and in order — the nobler death, the more skillful disputing with the sophists, the night in the cold, the refusal to arrest Leon of Salamis, the swaggering walk — with Long's own doubt about the last one attached to it. The five-member "neither … nor … nor … nor … nor" chain that closes the paragraph is kept as five. "Bid" → "ordered", "skilfully" → "skillfully" (base-text spelling), "idly vexed" → "idly resentful" (row), "out of the universal" → "out of the whole" (row as extended at VI.45) and "affects" → "feelings" (row) are each right, and none of them imports a psychological reading: "idly resentful on account of men's villainy" says what Long says.

## VII.67 — B07-P067

No material issue found.

(The dagger sits immediately before "[the intelligence]", and the bracket is a supplement without which "has not so mingled … with the composition of the body" has no object; folding it is right and leaves the dagger-marked clause otherwise verbatim. Long's comma after "body" is dropped, which tightens "so … as not to" and changes nothing. The two things to bear in mind are kept as two, and the closing list — free and modest and social and obedient to God — keeps all four members and Long's capital. "Because you have despaired of becoming a dialectician" keeps the concession Long makes, which is easy to soften and is not softened.)

## VII.68 — B07-P068

No material issue found.

("[Reality]" is Long glossing his own "substance" and is rightly dropped under D11 — "This you are in substance" stands unaided, and the contrast with "in men's opinion" carries it. "Members of this kneaded matter" → "limbs", consistently with VII.13. The two speeches are kept distinct and in Long's order — the judgment's, addressed to what falls under observation; the use's, addressed to what falls under the hand — and each keeps its own opening. "Tranquillity" → "calm" twice, per the row. The close — everything has a relationship to God or man, neither new nor difficult to handle, but usual and apt matter to work on — is Long's, with his capitals kept.)

## VII.69 — B07-P069

No material issue found.

("Torpid" → "sluggish" is the plain current word; the three-member "neither … nor … nor" chain is kept as three, and "passing every day as the last" is left unexplained.)

## VII.70 — B07-P070

No material issue found.

("Are not vexed because" → "do not resent that" applies the row and keeps the causal force. The gods' two acts are kept as two — they tolerate men as they are, and besides that they take care of them in all ways — and so is the double sting of the turn: "you, who are destined to end so soon" and "when you are one of them". Long's comma before "and this too" becomes a dash, which carries the turn better and adds nothing.)

## VII.71 — B07-P071

No material issue found.

("Fly" → "flee" twice: Long's verb now reads as the other one, and the repetition is preserved, which matters because the sentence is built on the same verb with two objects. The possible/impossible contrast is kept.)

## VII.72 — B07-P072

No material issue found.

("[Social]" is Long's second word for "political" and is rightly dropped under D11 — the sentence already ends on "neither intelligent nor social", so folding it would have produced "the rational and political social faculty" against "nor social" four words later. "Faculty" is rightly kept: this is not Long's *ruling* faculty and the word is current.)

## VII.73 — B07-P073

No material issue found.

(Both of the third things fools look for — the reputation and the return — are kept as two, and the question stays a question.)

## VII.74 — B07-P074

No material issue found.

(Thirty-four words for thirty-four. The three steps — no man tires of receiving what is useful; acting according to nature is useful; therefore do not tire of receiving what is useful by doing it to others — are kept as three, and the last one keeps its slightly knotted form, which is the meditation's point and not a defect to smooth.)

## VII.75 — B07-P075

No material issue found.

("The nature of the All" → "The nature of the whole" is the row as fixed at IV.27. "[Continuity]" is Long's second word for "consequence" and is rightly dropped under D11; the real disjunction is the outer "either … or", and it is kept whole, with both branches intact — everything comes by way of consequence, or even the chief things the ruling power aims at are governed by no rational principle. "It will make thee more tranquil" → "it will make you calmer" is the row. Cross-reference dropped and listed.)

---

## Summary

| Severity | Count | Paragraphs |
|---|---|---|
| **Substantive** (must fix) | **0** | — |
| **Minor** (worth improving, drafter's discretion) | **5** | VII.2 (2.1), VII.9 (9.1 — documentation only, no change to the candidate), VII.14 (14.1), VII.20 (20.1), VII.66 (66.1) |
| **Optional** (preference) | **1** | VII.8 (8.1) |
| No material issue | 69 | VII.1, VII.3–VII.7, VII.10–VII.13, VII.15–VII.19, VII.21–VII.65 apart from those listed above, VII.67–VII.75 |

Counted strictly: 6 numbered findings across 6 paragraphs (2.1, 8.1, 9.1, 14.1, 20.1, 66.1); of these 4 propose a wording change to the candidate (2.1, 14.1, 20.1, 66.1), 1 proposes a documentation change only (9.1), and 1 is a preference the drafter may decline (8.1). Classification, each counted once: dropped clause 0; dropped word 0; added content 1 (14.1, the inserted "it"); resolved ambiguity 0; expansion 0 beyond the one licensed and upheld at VII.50; voice drift 0; glossary inconsistency 0; imported rendering 0; archaism left 0; other 4 (2.1 word precision, 8.1 preference, 9.1 base-text record, 20.1 modal, 66.1 "if"/"that"). Nothing in Book VII rises to a must-fix.

**Apparatus.** The word-level diff confirms that the only material absent from the candidate is the apparatus `continuity.md` lists and nothing else: 7 cross-references (VII.12, VII.19, VII.23, VII.25, VII.29, VII.30, VII.75), 6 D11 drops (VII.9 "[order]", VII.10 "[causal]", VII.29 "[formal]", VII.68 "[reality]", VII.72 "[social]", VII.75 "[continuity]") and 9 folds (VII.2, VII.3, VII.9, VII.13, VII.17, VII.34, VII.45, VII.58, VII.67). Fifteen brackets, all accounted for, and every one of them confirmed as Long's by Standard Ebooks. Each of the six drops is genuinely a second English word for the word beside it; each of the nine folds supplies something the sentence or the next sentence needs. I would move VII.2's "[thoughts]" and VII.17's "[happiness]" out of the flagged column and into the settled fold list (rulings above).

**Dagger marks.** Seven, in four sections, located independently in the PG file at lines 4433, 4439 (VII.16), 4529, 4530 (VII.31), 4607, 4609 (VII.46) and 4788 (VII.67) — matching `PROVENANCE.md` §4, `provenance.json` and `review-instructions.md` exactly. All seven clauses stand in the candidate as Long has them, with pronouns modernised and glossary renderings applied; none is made clearer than the source, and none is smoothed (VII.31's dash and repetition, VII.46's dash-and-colon, and VII.67's "so mingled … as not to" all survive).

**Short sections.** None is expanded. VII.32, VII.36, VII.39, VII.40, VII.42, VII.43, VII.60, VII.65 are identical to Long; VII.6, VII.7, VII.8, VII.11, VII.12, VII.14, VII.15, VII.20, VII.21, VII.28, VII.30, VII.37, VII.38, VII.41, VII.56, VII.57, VII.59, VII.61, VII.69, VII.71–VII.74 are at Long's length, within a word or two of grammar. The long run of one- and two-line meditations reads as bare as it does in Long.

**Nothing imported.** No phrase in the candidate departs from Long in a way Long's own words do not explain, and the passages most at risk — VII.1 "There is nothing new", VII.15 the emerald, VII.29 "Wipe out the imagination", VII.47 the courses of the stars, VII.48 Plato's view from a higher place, VII.59 "Look within", VII.61 the wrestler and the dancer, VII.69 passing every day as the last, and the whole quotation cluster VII.35–VII.51 — each keeps a Long-specific turn that the familiar modern versions do not have ("the idle business of show", "compute the hazard", "abide the hazard", "the filth of the earthly life", "an orderly combination of contraries", "onsets which are sudden and unexpected"). I did not compare against other translations for wording and claim nothing about them; absence of such a finding is not proof.

### Chapter-level findings (from the continuous read)

1. **Voice.** Marcus is addressing himself from VII.1 to VII.75, and no sentence in the book turns outward. The imperatives stay bare and unexplained ("Stand upright, or be made upright."; "Retire into yourself."; "Wipe out the imagination."; "Look within."; "Love mankind. Follow God."; "Take care not to feel towards the inhuman as they feel towards men."), the questions stay questions ("Is any man afraid of change?"; "For what more will you see?"; "Why, then, am I disturbed?"), and the reproaches keep their edge ("are you wearied of enduring the bad—and this too when you are one of them?"). Not one motivational cadence, moral lesson, or explanation addressed to a modern reader anywhere in the book.
2. **Connectives.** Long's inferential joints are carried throughout — "For" at VII.2, VII.5, VII.7, VII.11, VII.14, VII.16, VII.19, VII.22, VII.26, VII.44, VII.46, VII.49, VII.53, VII.55, VII.58, VII.63, VII.64, VII.67, VII.68, VII.74; "But" at every turn he makes (VII.2, VII.5, VII.14, VII.16, VII.26, VII.27, VII.33, VII.46, VII.50, VII.55, VII.66, VII.70); "then" wherever he has it, set between commas in the candidate's own sentences and left unpunctuated inside the verbatim dagger sentences. No connective is added and none is dropped.
3. **Archaic syntax.** None left. Every thou-form, inverted question ("Dost thou", "canst thou", "wilt thou", "art thou"), "-est/-eth" verb and "not"-after-verb ("want thee not", "care not", "Be not ashamed", "Let not future things") is recast in Long's order of ideas. The inversions that remain are ones still current in the idiom ("Think not so much of what you do not have"; "Near is your forgetfulness of all things"). Long's already-current words are left alone where the glossary does not touch them ("propriety", "affectation", "circumscribe", "swaggering", "sophists", "dialectician", "hypocrite", "onsets", "kneaded matter").
4. **Terminology.** The glossary is applied consistently across all 75 paragraphs: "the ruling part" for all three of Long's phrases (VII.16 ×2, VII.22, VII.33, VII.55 ×2, VII.62), with "the rational part which rules" at VII.28 rightly distinguished and "the rational and political faculty" at VII.72 rightly left alone; "the universal nature" (VII.5, VII.18 ×2, VII.23, VII.55) beside "the nature of the whole" (VII.75) and "the whole" (VII.9, VII.10, VII.19, VII.25, VII.66); "rational being" and its extensions to "intelligent beings" and "beings of the same stock" (VII.9, VII.11, VII.13, VII.55); "according to nature" / "against nature" / "against reason" (VII.11, VII.24 ×2, VII.53, VII.56, VII.74); "calm" for every "tranquillity" (VII.28, VII.33, VII.68 ×2, VII.75); "disturbance" at VII.16 beside Long's own verb "disturb" in the same paragraph; "resent / resentful" (VII.38, VII.58, VII.66, VII.70) beside "discontented" (VII.64), which is kept separate; "feelings" (VII.2, VII.66); "kindness" (VII.13, VII.63); "impressions" (VII.2) beside "imagination" (VII.17, VII.29, VII.64), kept apart as Long keeps them; "impulse" at VII.4 for his "movement", while "motion" stays "motion" at VII.55 and VII.60 and "movement" stays "movement" at VII.75. The three new/extended rows carry their weight: "imagination" is what makes VII.17 and VII.64 readable; "cause and matter" is consistent between VII.10 and VII.29; "resent" reads as an ordinary word in all four places and imposes no clinical sense.
5. **Long's plain words replaced.** The rate is low and each replacement is the current word for what Long's word meant: "implicated" → "bound up", "involution" → "entanglement", "terrene" → "earthly", "comeliness" → "grace", "base/baseness" → "shameful/disgrace", "approbation" → "approval", "benevolence/beneficence" → "kindness", "torpid" → "sluggish", "fly" → "flee", "casting" → "throwing", "subsists" → "lasts", "acquiesce in" → "accept", "bid" → "ordered", "discoursing" → "talking", "'scape" → "escape", "intrust" → "entrust", "supremacies" → "power". Only two shade the sense at all, and both are noted above as optional (VII.49 "supremacies", VII.46 "the Deity").
6. **The quotation cluster VII.35–VII.51.** Read as a run, it keeps the character of Long's commonplace book: attributions where Long has them ("From Plato", "From Antisthenes") and none where he has none, verse capitals at the head of every line he capitalises (VII.38, VII.40, VII.41, VII.42, VII.50, VII.51), and dialogue dashes at VII.35. The verse reads as verse set as prose, which is what the staged original makes of it, and no line has been smoothed into a sentence.

### Flow judgement

Read straight through, the candidate is Long's Book VII with the archaisms gone and nothing else changed. The long meditations carry his argument sentence by sentence in his order: VII.5's three-way choice with its exception intact; VII.9's chain of "one … one … one" closing on its conditional; VII.13's pun, which survives only because the Greek does; VII.16's separation of ruling part, body and soul; VII.18's bath and food and the turn onto himself; VII.26's two branches and the duty that follows from each; VII.48's thirteen-item view from a higher place; VII.55's three constitutional things with the second's reason; VII.64's argument from dishonor to damage to Epicurus to the three non-pains; VII.66's Socrates weighed item by item against a name we know nothing about; VII.68's two speeches; VII.75's disjunction. Between them, the short meditations land as hard as they do in Long — "There is nothing new: all things are both familiar and short-lived."; "Stand upright, or be made upright."; "Near is your forgetfulness of all things; and near the forgetfulness of you by all."; "It is royal to do good and to be abused."; "Look within."; "It is a ridiculous thing for a man not to flee from his own badness, which is indeed possible, but to flee from other men's badness, which is impossible." The images are all still images and none has been replaced by an explanation: the bone thrown to little dogs and the bread into fishponds; the ants and the frightened mice and the puppets on strings; the gold, the emerald and the purple; the wax molded into a horse and then a tree and then a man; the lame soldier on the battlements; the heaps of sand; the courses of the stars; the ripe ears of corn; the wrestler against the dancer; the fountain that bubbles up if you dig; the wild beasts tearing the limbs of this kneaded matter. The dagger clauses leave their sentences exactly as obscure as Long leaves them, and the one broken section stops where his stops.

The weaknesses are four, and all small: one adverb narrowed where Long's was exact (2.1); one supplied object that sends a clause down a garden path (14.1); one modal that lets a fear be read as an obligation (20.1); and one "whether" turned into a "that", which converts an open question into a challenge (66.1). None removes a clause, an image or a qualification, and none changes what Marcus says. Apply the four and the book reads as Long's Book VII in modern dress, at the standard the accepted Books I–VI set.

### Verdict

**Accept after corrections.** There is no substantive finding. The book can be accepted once the drafter has applied or answered the 4 wording findings (2.1, 14.1, 20.1, 66.1) and added the two base-text records at 9.1; 8.1 is a preference the drafter may decline. Under D8 the pattern is to apply minor findings unless `continuity.md` already records a considered reason not to, and it records none for these four.

**All six flagged decisions go the drafter's way**, and three of them should now be recorded as settled rather than open: VII.2 "[thoughts]" is a **fold**, not a D11 drop (the following sentence needs the antecedent — the VI.50 "[men]" ruling); VII.13's transliterated Greek is **kept** (the argument does not exist without it, and the glossary's no-Greek note governs its own Greek column, not Long's in-text words — worth writing into `GLOSSARY.md` as an explicit exception before VIII.57); VII.16's glossary renderings inside the dagger clauses are **right** (the daggers mark uncertain Greek, not uncertain English, and D10 would otherwise force the same Long word two ways in one book); VII.17's "Eudaemonia, happiness, is a good god within" is the **best of the available routes**, with the cost — "within" belongs to the glossary, not to the etymology — to be recorded in `continuity.md`; VII.50's "the elements that have no sensation" is **upheld** as the book's one licensed expansion, to be recorded as such so it is not cited as precedent for expansions that add an idea; VII.55's "for both are animal" is **rightly kept**, with "for both are animal motions" offered as an optional fold of Long's ellipsis and not pressed.

**Both base-text defects are rightly handled**: VII.5's "what-soever" is a line-break hyphen (Standard Ebooks reads "whatsoever") and "whatever" is correct; VII.58's broken ending is Long's own (Standard Ebooks breaks off identically) and keeping the ellipsis on the V.29 precedent is correct.

**The staged-original rebuild (D12) verifies clean** and should stand: 487 paragraphs before and after, VII.45 the only paragraph in the file that changed, chapters 1–6 (and 8–12) byte-identical, and the three removed sentences confirmed in the PG text at lines 4600, 4602 and 4604 as Long's flush-left footnotes carrying the reference letters of §44 and §45 — not translation. No accepted book is reopened.

### Coverage and limitations

- Every paragraph VII.1–VII.75 was read source-beside-candidate in packet order (25 packets, three paragraphs each) with the supplied context, then the whole candidate was read continuously. A word-level diff of each paragraph against Long was generated and read alongside, so every token present in one text and absent from the other was inspected individually. Every Long clause was checked for presence, including qualifiers, negations, quantifiers, the "neither … nor" chains (VII.26, VII.52, VII.55, VII.66, VII.69), and the length and order of every list (VII.3's ten items, VII.5's three choices, VII.9's six "one"s, VII.22's four reasons, VII.29's six imperatives, VII.48's thirteen items, VII.55's three constitutional things, VII.64's three non-pains, VII.66's five achievements and five-member chain, VII.67's four qualities).
- The staged-original rebuild was verified independently, against the pre-rebuild file recovered from git and against the PG text at the cited lines; it was not taken on the drafter's word.
- The review is against Long's English only, as instructed. I did not consult the Greek, and the candidate is not required to match the Greek over Long; where an alternative reading of Long exists (VII.17's etymology, VII.55's elided noun, VII.66's "if"), the confidence given reflects that.
- Standard Ebooks' Long was consulted for text state only, by exact-phrase search of the fetched single-page edition, at VII.5, VII.9, VII.13, VII.17, VII.45, VII.50, VII.55, VII.58, VII.66, VII.67, VII.68, VII.72 and at each bracket the drafter lists; no wording was taken from it. No other translation was consulted.
- The mechanical checks were re-run and passed; word ratios were used only as a screening signal and are not evidence of semantic completeness.
- Attention was held to the end: the last packets (VII.64–VII.75) were read at the same pace as the first, and one of the findings falls in VII.66.
- Errors can remain; this review does not claim otherwise, and it assigns no numerical score.
