# War and Peace — Tail Batch C (Ch. 353–365) — INDEPENDENT ADVERSARIAL REVIEW

Reviewer: independent (did not draft this batch).
Source of truth: `tail-batchC-source.json` (Maude).
Candidate: `tail-batchC-candidate.json`.
Drafter's notes: `tail-batchC-notes.md` (verified, not trusted).
Method: full programmatic structural diff + complete human read of all 300 paragraph
pairs, source against candidate, plus cross-batch and whole-book name consistency checks.

---

## 1. Structural verification — PASS

Verified independently (not taken from notes):

| Chapter | Title (src = cand) | Src paras | Cand paras | Claimed | ? src = cand |
|---|---|---|---|---|---|
| 353 | Second Epilogue — Chapter 16 | 46 | 46 | 46 | yes |
| 354 | Second Epilogue — Chapter 1 | 24 | 24 | 24 | yes |
| 355 | Second Epilogue — Chapter 2 | 13 | 13 | 13 | yes |
| 356 | Second Epilogue — Chapter 3 | 9 | 9 | 9 | yes |
| 357 | Second Epilogue — Chapter 4 | 32 | 32 | 32 | yes |
| 358 | Second Epilogue — Chapter 5 | 19 | 19 | 19 | yes |
| 359 | Second Epilogue — Chapter 6 | 20 | 20 | 20 | yes |
| 360 | Second Epilogue — Chapter 7 | 23 | 23 | 23 | yes |
| 361 | Second Epilogue — Chapter 8 | 30 | 30 | 30 | yes |
| 362 | Second Epilogue — Chapter 9 | 27 | 27 | 27 | yes |
| 363 | Second Epilogue — Chapter 10 | 34 | 34 | 34 | yes |
| 364 | Second Epilogue — Chapter 11 | 10 | 10 | 10 | yes |
| 365 | Second Epilogue — Chapter 12 | 13 | 13 | 13 | yes |

- 13 chapters in, 13 out. **300 paragraphs in, 300 out.** No merges, splits, reorderings, drops or inventions.
- Chapter titles byte-identical to source, including the pre-existing "Chapter 16" mislabel on 353.
- **Question marks: 59 source / 59 candidate, matching per individual paragraph** (not merely per chapter). Zero per-paragraph deltas.
- Word-ratio outlier scan (paragraphs ≥15 source words flagged below 0.70× or above 1.60×): **zero hits.** No paragraph is compressed or padded.
- Punctuation house style matches the rest of the book: straight quotes/apostrophes, em dashes (book-wide file: 0 curly apostrophes, 0 curly double quotes). Source's curly quotes correctly converted.

**Notes' structural claims (§1 and §2) are accurate.** Caveat: the paragraph indices cited
in the notes' §3 are 1-based and occasionally off by one against the file's 0-based array;
the content claims themselves check out.

**Important limitation, stated up front:** paragraph-count and question-mark parity are
necessary but nowhere near sufficient. Both of the MAJOR defects found below preserve
paragraph count, word count and question-mark count exactly. The drafter's automated
checks could not have caught either.

---

## 2. The 12 originally-documented defects — verification table

| # | Ch | Documented defect | Status |
|---|---|---|---|
| 1 | 355 | Thiers/Lanfrey historiography contrast dropped | **CONFIRMED FIXED** |
| 2 | 355 | Gervinus/Schlosser example + closing chiasmus dropped | **CONFIRMED FIXED** |
| 3 | 355 | Meaning inversion "they contradict themselves" → "which is precisely what X said" | **CONFIRMED FIXED** |
| 4 | 355 | Two-part satirical explanation of intellectual-history overrating deleted (worst deletion in book) | **CONFIRMED FIXED** |
| 5 | 357 | Inversion "historians reply X" → "historians have no answer" | **CONFIRMED FIXED** |
| 6 | 357 | 50-year power-transfer chronology + conclusion deleted | **CONFIRMED FIXED** |
| 7 | 361 | Whole-paragraph substitution reversing argument's logical role (four-domain sequence) | **CONFIRMED FIXED** |
| 8 | 362 | 7 consecutive illustrative examples deleted + invented replacement | **CONFIRMED FIXED** |
| 9 | 353 | Invented plot event: Pierre "contradicting" Natasha | **CONFIRMED FIXED** |
| 10 | 354 | One severely damaged paragraph | **CONFIRMED FIXED** |
| 11 | 359 | One severely damaged paragraph | **CONFIRMED FIXED** |
| 12 | 365 | One severely damaged paragraph | **CONFIRMED RESTORED — but a NEW inversion was introduced in the same paragraph (F-2 below)** |
| — | 340-adjacent pattern | Moral content stripped (Napoleon's killing softened) | **CONFIRMED FIXED** (354.17) |

### Evidence, defect by defect

**#1 — Ch 355, Thiers/Lanfrey (355.1)**
- Source: "Thiers, a Bonapartist, says that Napoleon's power was based on his virtue and genius. Lanfrey, a Republican, says it was based on his trickery and deception of the people."
- Candidate: "Thiers, a Bonapartist, says Napoleon's power rested on his virtue and his genius. Lanfrey, a Republican, says it rested on his trickery and his deception of the people."
- Present in full, both attributions correct.

**#2 — Ch 355, Gervinus/Schlosser + chiasmus (355.3)**
- Source: "Gervinus, Schlosser, and others, for instance, at one time prove Napoleon to be a product of the Revolution, of the ideas of 1789… The ideas of the Revolution and the general temper of the age produced Napoleon's power. But Napoleon's power suppressed the ideas of the Revolution and the general temper of the age."
- Candidate: "Gervinus, Schlosser, and others, for instance, at one point prove that Napoleon was a product of the Revolution, of the ideas of 1789… The ideas of the Revolution and the general temper of the age produced Napoleon's power. But Napoleon's power suppressed the ideas of the Revolution and the general temper of the age."
- Both named historians present; the closing chiasmus is reproduced verbatim, both limbs, correct order.

**#3 — Ch 355, "contradict themselves" (355.6)**
- Source: "…they not only contradict the specialist historians but contradict themselves."
- Candidate: "…they contradict not only the specialist historians but themselves."
- Correctly un-inverted. No "which is precisely what X said" substitution anywhere in the chapter. The whole Stein/Metternich/Staël/Talleyrand/Fichte/Chateaubriand list is present, and the algebraic argument ("component forces adding up to some quantity A produced a resultant a thousand times greater than A") survives literal.

**#4 — Ch 355, two-part satirical explanation (355.11)**
- Source: "(1) that history is written by learned men, and so it is natural and agreeable for them to think that the activity of their class supplies the basis of the movement of all humanity… and (2) that spiritual activity, enlightenment, civilization, culture, ideas, are all indistinct, indefinite conceptions under whose banner it is very easy to use words having a still less definite meaning, and which can therefore be readily introduced into any theory."
- Candidate: "(1) history is written by learned men, and so it is natural and gratifying for them to think that the activity of their own class provides the basis for the movement of all humanity… and (2) spiritual activity, enlightenment, civilization, culture, ideas — these are all vague, indefinite notions, under whose banner it is very easy to use words with an even less definite meaning, which can therefore be worked into any theory whatsoever."
- **Both numbered points present in full.** The book's single worst documented deletion is genuinely repaired. (One small addition inside point 1 — see F-4.)

**#5 — Ch 357, "historians reply" not inverted (357.25)**
- Source: "Met by this difficulty historians of that class devise some most obscure, impalpable, and general abstraction… The most usual generalizations adopted by almost all the historians are: freedom, equality, enlightenment, progress, civilization, and culture."
- Candidate: "Faced with this difficulty, historians of this class devise some highly obscure, intangible, and general abstraction… The most common generalizations adopted by nearly all historians are: freedom, equality, enlightenment, progress, civilization, culture."
- Historians *devise* — no "have no answer" inversion. All six generalizations present. Also verified at 357.19: "To this, historians answer that Louis XIV's conduct, though it went against the program, reacted on Louis XVI" (source: "To this question historians reply that…"). Correct.

**#6 — Ch 357, 50-year chronology + conclusion (357.19)**
- Source: "…transferred to the Convention, to the Directory, to Napoleon, to Alexander, to Louis XVIII, to Napoleon again, to Charles X, to Louis Philippe, to a Republican government, and to Napoleon III."
- Candidate: "…passes to the Convention, to the Directory, to Napoleon, to Alexander, to Louis XVIII, to Napoleon again, to Charles X, to Louis Philippe, to a Republican government, and to Napoleon III."
- All ten transfers, correct order. The conclusion is present too: "accidents resulting from cunning, from mistakes, from craft, or from the weakness of some diplomat, ruler, or party leader… And so these historians too end up seeing, and admitting, historical events that are exceptions to their own theory." (source: "…exceptions to the theory"). Also intact: the Louis XIV / Ivan the Terrible vs Louis XVI / Charles I setup and the "what is the time limit for such reactions?" move.

**#7 — Ch 361, four-domain sequence (361.22–361.25)**
Each domain keeps its source assignment; no logical-role substitution:
- 361.22 sin → **theology** (src "That is a question for theology." / cand "That is a question for theology.")
- 361.23 responsibility to society → **jurisprudence** (both)
- 361.24 conscience, right and wrong → **ethics** (both)
- 361.25 "How should the past life of nations, and of humanity, be regarded — as the result of man's free activity, or as the result of his constrained activity? That is a question for history." (src identical in substance) → **history**
- Each paragraph also retains its own premise clause (God's creation / statistical laws / innate character and motives / man in connection with the general life of humanity). No paragraph carries another's content.

**#8 — Ch 362, all 7 illustrative examples (362.25)** — all present, in source order, inside the single source paragraph:
1. "That a criminal was raised among criminals lessens his guilt in our eyes." (src: "reared among malefactors")
2. "The self-sacrifice of a father or a mother, or self-sacrifice that comes with some hope of reward, is easier to understand than self-sacrifice with no reward at all…"
3. "The founder of a sect, or of a political party, or an inventor, impresses us less once we know how… the ground was prepared for his work."
4. "The dishonest conduct of the son of a dishonest father,"
5. "the misbehavior of a woman who has fallen in with bad company,"
6. "a drunkard's relapse into drinking, and so on,"
7. "a child, a madman, a simpleton — then… as soon as we know the cause behind the action, we can predict the result."
- No invented replacement sentence. The bridging material ("If we have a large stock of examples…", "If we examined simple actions…") is also intact.

**#9 — Ch 353, no invented plot event** — read all 46 paragraphs. There is no passage in which Pierre contradicts Natasha. The one dispute mentioned is the source's own: Pierre's argument with his brother-in-law Nicholas (353.9, "the memory of his argument with his brother-in-law was unpleasant to him"), which is in Maude. The conversation beats run source-parallel throughout (Mary's praise → Mitya → Nicholas's library → Karataev → "I love you so much" → the honeymoon speech → jealousy → the simultaneous-speaking exchange → Petya → the dream). One small invention found, but it is a speech tag, not an event — see F-3.

**#10 — Ch 354** — the chapter is whole. The densest paragraph, the Louis XIV→St. Helena satirical chronicle (354.17), is rendered as one continuous block with every link intact: Louis XIV → weak descendants → pamphleteers → 1789 → regicide → Napoleon → Egypt/Africa → Italy/Austria/Prussia → Alexander → 1807 → 1811 → 600,000 men → Moscow → Stein → coalition → Elba → Louis XVIII → Hundred Days → defeat → St. Helena → the post-1815 reaction. **Moral content not softened** — the audit's 340-adjacent pattern is addressed here: "he killed a great many people, because he was a great genius", "killed them so thoroughly", "once more began killing large numbers of people", "millions of Christians, who professed a law of love for their fellow men, killed one another" (354.11). No euphemism.

**#11 — Ch 359** — whole. The command/time argument (359.1–359.7, including the stencil image and the England-vs-Russia asymmetry), the cone-of-army passage (359.13–359.17) and the two-condition restoration (359.19) are all present and correctly reasoned.

**#12 — Ch 365** — the chapter's content is restored: the Copernicus parallel, the statistics/geography/political-economy list, the theology-stands-guard move, Voltaire and the law of gravitation, the fixity-of-earth / independence-of-personality pairing, and the two closing quoted "new view" speeches (365.11) are all present and accurate. **However, the first paragraph now contains a new logical inversion — see F-2.** Counted as restored, but the chapter is not clean.

---

## 3. Independent findings (my own read, beyond the original audit's scope)

### MAJOR

**F-1 — Ch 357, para 11 (0-based): agent inversion, Napoleon III / Boulogne**
- Source: "Why was Napoleon III a criminal when he was taken prisoner at Boulogne, and why, later on, **were those criminals whom he arrested**?"
- Candidate: "Why was Napoleon III a criminal when he was captured at Boulogne, and why, later, **were those who arrested him the criminals instead**?"
- The agency is reversed. Tolstoy's point is that the same man is first the criminal (Boulogne, 1840) and later, in power, the one whose *arrests* define who is criminal — the label follows power, not conduct. The candidate turns this into a claim that the people who arrested Napoleon III were later deemed criminals, which is both historically wrong and destroys the rhetorical pivot the whole passage turns on.
- This is the same class of defect the original audit flagged in this very chapter. Question-mark count is preserved, so parity checking cannot detect it.
- **Proposed correction:** "Why was Napoleon III a criminal when he was captured at Boulogne, and why, later, were the people he himself arrested the criminals?"

**F-2 — Ch 365, para 0 (0-based): logical inversion of the Copernicus conditional**
- Source: "**By disproving that law** it might have been possible to retain the old conception of the movements of the bodies, but **without disproving it**, it would seem impossible to continue studying the Ptolemaic worlds."
- Candidate: "**Without disproving that law**, it might in principle have been possible to hold onto the old conception of how the heavenly bodies moved, but it would seem impossible to keep studying the Ptolemaic universe **once the law itself stood unrefuted**."
- The first clause's condition is flipped. The candidate now says the old conception could be held *without* refuting Copernicus — and then, in the second clause, says the opposite. The paragraph contradicts itself.
- Decisive internal evidence that this is an error, not a reading: the candidate renders the exact structural parallel correctly one paragraph-pair later, at 365.2 — "**By refuting these new laws**, the old view of history might have been preserved; but **without refuting them**, it would seem impossible to go on studying historical events as the results of man's free will." Tolstoy builds 365.0 and 365.2 as a matched pair; the candidate breaks the match.
- **Proposed correction:** "By disproving that law, it might have been possible to hold onto the old conception of how the heavenly bodies moved; but without disproving it, it would seem impossible to keep studying the Ptolemaic universe."

### MODERATE

**F-3 — Ch 357, para 28: self-contradicting Crusades clause**
- Source: "that movement of the peoples from west to east, **without leaders**, with a crowd of vagrants, **and with Peter the Hermit**, remains incomprehensible."
- Candidate: "that movement of peoples from west to east, **leaderless**, made up of a crowd of wanderers, **with Peter the Hermit at its head**, remains incomprehensible."
- Source lists Peter the Hermit as one more feature of an unled mass; the candidate promotes him to leader in the same breath as calling the movement leaderless. The sentence now defeats itself, and it damages the argument, whose whole point is that the popular movement had no directing figure (confirmed by the next sentences: the movement *stopped* once leaders defined a goal).
- **Proposed correction:** "…leaderless, made up of a crowd of wanderers, and with Peter the Hermit among them, remains incomprehensible."

### MINOR

**F-4 — Ch 355, para 11: added gloss not in source.** Source: "(if they do not express it, that is merely because traders and soldiers do not write history)". Candidate inserts, before the parenthesis, "**who would think the same of their own activity if they wrote history too**", then keeps the parenthesis — saying the same thing twice. Harmless in sense but it is text the source does not have, in the most closely-audited paragraph in the batch. Proposed: delete the added clause.

**F-5 — Ch 355, para 12: imputed insincerity.** Source: "a power which they **apparently** do not recognize." Candidate: "a power that they **claim** not to recognize." "Apparently" (= seemingly) becomes an accusation of bad faith. Proposed: "a power they apparently do not recognize."

**F-6 — Ch 353, para 38: invented speech tag.** Source: "**"But all the same?"**" (bare). Candidate: ""But still?" **said Pierre.**" The attribution is contextually right but the tag is not in the source — and this is the chapter whose documented defect was an invented event. Proposed: drop "said Pierre."

**F-7 — Ch 361, para 26: softening.** Source: "the crowd of **ignoramuses**". Candidate: "the crowd of **the half-informed**". Tolstoy's contempt is deliberate and load-bearing in a paragraph about "that most powerful engine of ignorance". Proposed: "the crowd of ignoramuses".

**F-8 — Ch 356, para 8: imitation → counterfeit.** Source: "**counters of imitation gold** can be used only among a group of people who agree to accept them as gold". Candidate: "**counterfeit gold coins**". Imitation counters are openly not gold and circulate by agreement; counterfeits are frauds. The source's point is the agreement, not the fraud. Proposed: "tokens of imitation gold".

**F-9 — Ch 360, para 5: substituted image.** Source: "the **broom** fixed in front of a locomotive to clear the snow from the rails". Candidate: "the **plow** fixed to the front of a locomotive". Defensible modernization, but it replaces Tolstoy's chosen object. Proposed: keep "broom" (or "brush").

**F-10 — Ch 364, para 1: analogy restructured.** Source: "the recognition of **a free force moving the heavenly bodies**"; candidate: "treating **some heavenly body's motion as free**". The comparandum shifts from a free *force* to a free *body*. It happens to match Tolstoy's own next sentence, so sense survives, but the parallel with "man's free will as a force" is blunted. Proposed: "as the recognition of a free force moving the heavenly bodies would be for astronomy."

### CONSISTENCY / TRIVIAL

**F-11 — "Bolkonski" vs "Bolkonsky" (353.40).** Candidate writes "little Nicholas **Bolkonski**'s bedroom". The book-wide normalized file uses **Bolkonsky** 117 times against Bolkonski 21 (the Bolkonski instances cluster in early, unrepaired chapters), and the sibling repair batch B candidate uses **Bolkonsky** 5/5. This batch is the outlier. Proposed: "Bolkonsky".

**F-12 — "Sergey" vs "Sergei" (353.15).** Source "Prince Sergéy". Candidate "Prince Sergey"; the book elsewhere uses "Sergei" (Sergei Kuzmich, Vasili Sergeevich). Low stakes, but pick one. Proposed: "Sergei".

### Name / diacritic handling — otherwise PASS

Full non-ASCII scan of the candidate returns only em dashes and "Staël" (French, correctly retained per the source, alongside "Le Contrat Social" kept in French). Every Cyrillic-derived diacritic is stripped, correctly: Natásha→Natasha (20), Pétya→Petya, Mítya→Mitya, Platón Karatáev→Platon Karataev, Iván→Ivan, Kúrbski→Kurbsky (matches the existing book file), Kazán→Kazan, Pugachëv→Pugachev, Arakchéev→Arakcheev, Sergéy→Sergey. Project-standard spellings hold: **Andrew** (2/2), **Nicholas** (13/13), **Mary** (5/5), Pierre, Dessalles (4/4). Kutuzov and Helene do not occur in this range. "les fils de la Vierge" silently corrects the Maude file's "Vièrge" typo — acceptable.

### Chapters flagged clean on independent read

**356, 358, 360, 363** — read paragraph by paragraph against source; no findings beyond F-8 and F-9 above. Specifically verified intact: the locomotive/devil/wheels/smoke trichotomy and the paper-money-and-gold extended analogy (356); the cattle-herd parody of all three historian classes and the "power is power" circular catechism (358); the ship's-wake argument and the two numbered answers on power and the movement of nations (360); the full space/time/cause six-part proof, the "Can I lift my arm?" tense argument kept deliberately circular, and the Reason-says / Consciousness-says triads with the form/content resolution (363). **364** is clean apart from F-10.

---

## 4. Whole-batch coherence

Read end to end as a single argument. It holds.

- **Transition into the essay.** 353 closes the First Epilogue on little Nicholas's dream of Glory and his father's approval; 354 opens "History is the life of nations and of humanity." The seam is unforced and the register shift (intimate → analytic) is handled without either half flattening into the other's voice.
- **The argument's spine survives intact and in order:** what force moves nations (355) → the incommensurate-force critique via the locomotive and the paper-money analogy (356) → jurisprudence's definition of power and its three failing variants (357) → power as a word we don't understand (358) → commands restored into time (359) → power redefined as the inverse relation of commanding to participating (360) → the free-will problem stated (361) → the three considerations and the freedom/necessity inverse ratio (362) → the six-part proof that neither pole is reachable, resolving into form and content (363) → history as a science of infinitesimals, with the Newton parallel (364) → the Copernicus closing (365).
- **Terminology holds across chapter boundaries**, which matters here more than anywhere else in the book: "resultant"/"component forces" carry from 355 into 356; "commensurate" is used consistently; "the law of inevitability", "the essence of life", "form and content" keep stable senses from 361 through 365. The recurring cast (Thiers, Gervinus, Schlosser, Buckle, Stein, Talleyrand) is spelled and characterized consistently.
- **Rhetorical set pieces land.** The peasant and the wind (355.7), the botanist and the two cotyledons (357.20), the plasterers in the church (361.29), the ship's wake (360.8–12) all read as arguments rather than decoration. The satirical chronicle at 354.17 keeps its deadpan.
- **The two MAJOR findings are local, not structural.** F-1 is a single clause inside a rhetorical-question volley; F-2 is a single conditional in the opening paragraph of the final chapter. Both are one-sentence fixes. Neither requires re-rendering a paragraph, and neither propagates. But F-2 sits in the first sentence of the novel's closing chapter and currently makes that sentence contradict itself, so it is not cosmetic.
- **Prose quality.** Genuinely modern and readable without going slack; Tolstoy's long periodic sentences are broken up where they must be but the hinges ("But", "And so", "Just as… so too") are preserved, which is what keeps the argument trackable. No summarizing, no editorializing, no invented connective claims. This reads as a serious rendering of the philosophical essay, not a paraphrase of it.

---

## 5. Verdict

| Severity | Count | Items |
|---|---|---|
| MAJOR | 2 | F-1 (357.11 agent inversion), F-2 (365.0 conditional inversion) |
| MODERATE | 1 | F-3 (357.28 leaderless/Peter the Hermit contradiction) |
| MINOR | 7 | F-4, F-5, F-6, F-7, F-8, F-9, F-10 |
| CONSISTENCY / TRIVIAL | 2 | F-11 (Bolkonski→Bolkonsky), F-12 (Sergey/Sergei) |
| **Total** | **12** | |

**Originally-documented defects: 12 of 12 CONFIRMED FIXED**, plus the 340-adjacent moral-softening pattern confirmed fixed at 354.17. The four worst-documented chapters (355, 357, 361, 362) are genuinely repaired, including the single worst deletion in the book (355.11) and the seven-example sequence (362.25). The drafter's notes are accurate in every claim I could check.

**Verdict: ACCEPT WITH REQUIRED FIXES.**

This is a strong rendering — structurally flawless, argumentatively coherent, and a real repair of the worst-damaged zone in the book. But it is not clean. Two new meaning inversions were introduced, both invisible to paragraph-count and question-mark parity checking, and one of them (F-2) sits in the opening sentence of the novel's last chapter. F-1 is especially notable because it is the same defect class the original audit found in the same chapter — the re-render fixed the documented inversion at 357.25 and introduced a fresh one at 357.11.

**Blocking before commit:** F-1, F-2, F-3 (three single-sentence edits).
**Recommended in the same pass:** F-4 through F-12 (all one-phrase edits).
**Re-verify after fixes:** paragraph counts and per-paragraph question-mark parity (F-1's correction removes no question mark; confirm).

**Process note for the remaining repair work:** this batch is the third consecutive book zone in which additional defects were found beyond the original audit's scope, and the first in which the *new* defects are of exactly the class the audit was built to catch. Count-and-parity automation demonstrably cannot catch agent inversions or flipped conditionals. Every batch needs a full independent paragraph-by-paragraph read before commit; no exceptions on the basis of a clean structural diff.
