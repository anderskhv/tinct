# Independent review — Meditations, Book VI, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer subagent spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-11 |
| Branch | `claude/meditations-modern-en-20260911-v2` (worktree at commit `4b21ff15b`) |
| Candidate | `book6/candidate-v1.json`, sha256 `78fbe6190ff8304918d4b29a108c75ad063b2e6d5a85ec414c3275295e029f3e` (recomputed locally with `sha256sum` and again inside the package check; matches `provenance.json` and the expected value in `README.md`) |
| Source | George Long 1862, `book6/source-book6.json` (sha256 `2384b4d0…`, matches `provenance.json`), byte-identical to chapter 6 of `../meditations-original-en.staged.json` (sha256 `b0ecf3da…`, the rebuilt file, matches `provenance.json`); PG #15877 base text `source/pg15877-long-1862.txt` sha256 `6584df7e…` (matches). The three dagger marks were located in the PG text, where Long's dagger is printed `+`: VI.38 before "active movement" (line 4167), VI.41 inside the bracket after "as indifferent" (line 4191), VI.50 after "[not] accomplished." (line 4292). Three marks, three clauses, as `continuity.md` and `review-instructions.md` say. The base-text points were checked at PG lines 4076 (VI.27 "strive After"), 4139 (VI.34 "patricides"), 4187 (VI.41 "wilt not blame"), 4219 (VI.43), 4248 (VI.45), 4278 (VI.49 "dissatisfied. I suppose"), and Long's footnote on VI.41 at lines 4195–4198. |
| Text-state cross-check | Standard Ebooks' Long, Book VI, fetched 2026-09-11 and searched for the exact phrases (text state only, never wording): VI.41 reads "thou wilt blame the gods" (no "not") and keeps the bracket "[because we do not regard these things as indifferent]"; VI.49 has the comma ("dissatisfied, I suppose"); VI.27 has lowercase "strive after"; VI.34 has "patricides"; VI.35 keeps both "[the principles]"; VI.39 runs "truly, sincerely" as text; VI.43 keeps "[the earth]"; VI.45 runs "of the middle kind, neither good nor bad" as text; VI.47 runs "the other kinds of men" as text; VI.6 runs "the wrong doer" as text; VI.50 keeps "[men]", omits "[conditionally]", and reads "are accomplished" without "not". Every text-state claim in `continuity.md` is confirmed. |
| Packets reviewed | `review-packets/packet-01.md` … `packet-20.md`, in order, three paragraphs at a time with the supplied context (each packet carries one CONTEXT ONLY paragraph before and after; coverage B06-P001…P059 each exactly once); then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md` (including the Book VI row and the two extended rows), `WORKFLOW.md` (Anders's voice rules), `review-instructions.md`, `continuity.md`; `book5/review/findings-v1.md` and `README.md` read first for format and calibration; ledger decisions D5, D8, D10, D11, D12 |

Mechanical checks from `book6/README.md` were re-run before reading: hash, paragraph count (59 = 59, VI.1–VI.59), numbering, no `[Illustration` anywhere in the staged file, packet coverage, packet text identical to the JSON, readable copy identical to the JSON, the three named dagger clauses present in source and candidate, no square bracket and no cross-reference left in the candidate. All passed. Per-paragraph word ratios 0.88–1.06; the low end is VI.9's dropped six-token cross-reference and the high end is VI.22's two "do not" for Long's two "not"s; nothing is padded and nothing is cut. A word-level diff of every paragraph was generated and read alongside the packets, so that every token Long has that the candidate does not (and the reverse) was looked at individually.

Severity: **substantive** = must be fixed before acceptance (review-instructions "Must fix"). **minor** = drafter's discretion ("Worth improving" or "Optional preference", stated in each entry). Every proposed wording stays inside Long's words and the glossary, or is the plain current word for a Long word the edition has already treated the same way elsewhere. Confidence is stated where a plausible alternative reading exists. "Also noted" points inside entries are not numbered findings.

---

## VI.1 — B06-P001

No material issue found.

("Which" → "that" is the only change. The chain — no cause for doing evil, no malice, does no evil to anything, nothing harmed by it — and the close "all things are made and perfected according to this reason" are Long's.)

## VI.2 — B06-P002

No material issue found.

(The four "whether … or" pairs are kept as four: cold or warm; drowsy or satisfied with sleep; ill spoken of or praised; dying or doing something else. "For it is one of the acts of life, this act by which we die" is Long's. The cross-reference "(vi. 22, 28)" is apparatus and is listed in `continuity.md`; the diff confirms nothing else went with it.)

## VI.3 — B06-P003

No material issue found.

(Two sentences, 15 words for Long's 15. Also noted, optional: "the peculiar quality of anything" → "the particular quality of anything". Long's "peculiar" means the quality that is a thing's own; "particular" is the ordinary modern substitute and is what the edition used at V.3 for the same idea. "Its own quality" would be closer still, but the difference is a shade, not a sense. No change proposed.)

## VI.4 — B06-P004

No material issue found.

(Word for word Long's; the disjunction "reduced to vapor, if indeed all substance is one, or … dispersed" with its condition is intact.)

## VI.5 — B06-P005

No material issue found.

(The three things the governing reason knows — its own disposition, what it does, on what material it works — are kept as three.)

## VI.6 — B06-P006

No material issue found.

("[The wrong-doer]" is a supplement that completes "not to become like", not a second rendering; folding it is right, and Standard Ebooks prints it as running text. One line, not expanded.)

## VI.7 — B06-P007

No material issue found.

(The colon after "rest in it" makes plain that the passing from social act to social act *is* the one thing; Long's comma allowed the same reading. "God" keeps Long's capital as the glossary directs.)

## VI.8 — B06-P008

No material issue found.

("The ruling principle" → "the ruling part", the glossary row. The two-part claim — it makes itself such as it wills to be, and makes everything that happens appear to itself such as it wills — is intact.)

## VI.9 — B06-P009

**Finding 9.1 — Long's "comprehends / comprehended" now reads as "understands" — minor (worth improving).**
Source: "either a nature which externally comprehends this, or a nature which is comprehended within this nature, or a nature external and independent of this"
Candidate: "either a nature that externally comprehends this, or a nature that is comprehended within this nature, or a nature external to and independent of this"
Long's "comprehends" is the older sense *includes, encloses*: the three alternatives are a nature that contains this one from outside, a nature contained inside it, and a nature outside and independent of it. In current English "comprehend" means "understand" first, and "a nature that externally understands this" stops the reader; the inclusion sense survives only in formal use ("the term comprehends several cases"). The edition has already replaced Long words whose current sense misleads in this very book ("involution" → "entanglement" VI.10; "implicated" → "bound up" VI.38; "rambled" → "strayed" VI.22), and this is the same class. The three-way structure is what the meditation turns on, so the two members should be plain.
Proposed: "either a nature that contains this from outside, or a nature that is contained within this nature, or a nature external to and independent of this" ("encloses / enclosed" would do as well; either keeps Long's part-whole picture).
Confidence moderate-to-high that the current sense misleads; the sense of Long's sentence is not in doubt.

Everything else in VI.9 is in order: "In conformity to the nature of the universe" → "According to the nature of the whole" is both halves of the glossary; "external to and independent of" supplies only the preposition "external" needs; the cross-reference "(xi. 1; vi. 40; viii. 50)" is apparatus and is listed.

## VI.10 — B06-P010

No material issue found.

(The two suppositions are kept as two, each with its three members: confusion, mutual entanglement, dispersion / unity, order, providence. "Involution" → "entanglement" keeps the rolling-together image and imposes nothing; "tarry" → "linger"; "fortuitous" is current and stays. The three questions are separated by capitals rather than run on with Long's lower-case "and why"; the third keeps its own reason ("for the dispersion of my elements will happen whatever I do"). The close "I venerate, and I am firm, and I trust in him who governs" is Long's three verbs. Cross-reference "(iv. 27)" listed.)

## VI.11 — B06-P011

No material issue found.

("In a manner" → "in a way" per glossary; "recurring to it" → "turning back to it" keeps Long's two verbs (return, recur) as two. "Out of tune" and "mastery over the harmony" are Long's images, kept.)

## VI.12 — B06-P012

No material issue found.

(The stepmother and the mother are kept as the pair Long builds the meditation on, in his order: the hypothetical, the assignment (court = stepmother, philosophy = mother), and the two-way close — what you meet with in the court appears tolerable to you, and you appear tolerable in the court. "Repose in her" → "rest in her" keeps Long's "her" for philosophy; V.9's dagger clause is not touched by this.)

## VI.13 — B06-P013

No material issue found.

(The images are all images: the dead body of a fish, of a bird, of a pig; the Falernian "only a little grape juice"; the purple robe "some sheep's wool dyed with the blood of a shellfish". "They reach the things themselves and penetrate them" is Long's. "Just in the same way ought we to act" → "In just the same way we ought to act" is word order only; "approbation" → "approval". The warning keeps its sting — "when you are most sure that you are employed about things worth your pains, it is then that it cheats you most" — and "Consider, then, what Crates says of Xenocrates himself" is left as bare as Long leaves it, correctly.)

## VI.14 — B06-P014

No material issue found.

(The four grades are kept as four in Long's order and with Long's examples: the multitude / cohesion or natural organization / stones, wood, fig trees, vines, olives; men a little more reasonable / a living principle / flocks and herds; men still more instructed / a rational soul, "not, however, a universal soul, but rational so far as it is a soul skilled in some art, or expert in some other way, or simply rational so far as it possesses a number of slaves"; and he who values "a rational soul, a soul universal and fitted for political life", who "regards nothing else except this". The dash before "not, however" makes the qualification easier to hold. "Conformable to reason and social life" → "according to reason and social life" per glossary; "political life" kept as Long has it. The two "which are" dropped before "admired by men" are pure grammar.)

## VI.15 — B06-P015

**Finding 15.1 — "respiration" rendered as inhalation only — minor (optional preference).**
Source: "like the exhalation of the blood and the respiration of the air"
Candidate: "like the exhalation of the blood and the breathing in of the air"
Long's "respiration" covers the whole cycle; the next sentence spells it out in both directions ("to have once drawn in the air and to have given it back"), and the meditation's point is the giving back. "Breathing in" names one half of what Long names whole. The candidate rendered VI.16's "respiration, as in domesticated animals" as plain "breathing", which is the right word there and would be right here too.
Proposed: "like the exhalation of the blood and the breathing of the air" (or keep Long's "respiration", which is a current word).
Confidence moderate; low stakes, since the following sentence restores both directions.

Everything else in VI.15 is present: things hurrying into and out of existence, "of what is coming into existence, part is already extinguished"; motions and changes renewing the world as time renews the ages; the flowing stream "on which nothing stays" (Long's "on which there is no abiding", plain and not weakened); the sparrow, with the dash marking Long's turn "but it has already passed out of sight"; "the whole power of breathing, which you received at your birth yesterday and the day before, to give it back to the element from which you first drew it".

## VI.16 — B06-P016

No material issue found.

(Long's 344 words are carried in order at 344. The opening "Neither … nor … nor … nor … nor … nor" chain is kept as six members (transpiration; breathing; the receiving of impressions; being moved by desires as puppets by strings; gathering in herds; being nourished by food) with its reason ("just like the act of separating and parting with the useless part of our food"). The clapping of hands and the clapping of tongues both stand; "the praise that comes from the many is a clapping of tongues". "This, in my opinion: to move yourself and to restrain yourself according to your proper constitution" — the glossary's "according to" for "in conformity to". The vine planter, the horse breaker and he who trains the dog are all present; the education-and-teaching turn is kept with its odd "aim at something"; the consequences are kept as Long's "neither free, nor sufficient for your own happiness, nor without passion", then "envious, jealous, and suspicious … and plot against"; "in a state of disturbance" per glossary; "he must often find fault with the gods"; and the close's three conditions (content with yourself, in harmony with society, in agreement with the gods) with Long's gloss "that is, praising all that they give and have ordered". "Transpiration" is Long's own word and stays. Not expanded.)

## VI.17 — B06-P017

No material issue found.

(Identical to Long, 39 words; "movements of the elements" and "the motion of virtue" are both physical motion and are rightly left as Long's two words.)

## VI.18 — B06-P018

No material issue found.

("Living with themselves" → "living with them" reads Long's reflexive rightly (the contemporaries live with the men who will not praise them). "Those who have lived before thee" → "those who lived before you". The absurdity is kept as Long puts it — grieved that the dead did not praise you.)

## VI.19 — B06-P019

No material issue found.

("If a thing is difficult to be accomplished by thyself" → "If a thing is difficult for you to accomplish"; "conformable to his nature" → "according to his nature"; colon → semicolon. Two clauses, not expanded.)

## VI.20 — B06-P020

No material issue found.

(The gymnasium image is intact: the nails, the head dashed against, the wound; "we neither show any signs of resentment, nor are we offended, nor do we suspect him afterward as a treacherous fellow" keeps the three-member chain; "not, however, as an enemy, nor yet with suspicion, but we quietly get out of his way". "Something like this let thy behavior be" → "Let your behavior be something like this" is word order. "Antagonists" → "opponents"; "vexation" → "resentment" is the extended glossary row and reads as the ordinary word, imposing nothing. "As I said" kept. The close's "no suspicion nor hatred" kept.)

## VI.21 — B06-P021

No material issue found.

("Abides in his error" → "persists in his error" is the plain current verb. "By which no man was ever injured" is Long's. Three sentences, not expanded.)

## VI.22 — B06-P022

No material issue found.

(The three kinds are kept as three: things without life, things without reason, things that have strayed and do not know the way. "Rambled" → "strayed" is right; Long's "rambled" now means talked at length.)

## VI.23 — B06-P023

No material issue found.

(The two spirits are kept as two — "a generous and liberal spirit" toward animals and things, "a social spirit" toward human beings — with Long's reasons (they have none; they have reason). "Do thou, since thou hast reason … make use of them" → "since you have reason and they have none, make use of them": the imperative carries the address and nothing is lost. "Even three hours so spent are sufficient" is Long's.)

## VI.24 — B06-P024

No material issue found.

("By death were brought" → "were brought by death" is word order; "seminal principles" → "generative principles" is the Book IV glossary row. The two alternatives (received among the same generative principles / alike dispersed among the atoms) are kept as alternatives.)

## VI.25 — B06-P025

No material issue found.

("In the same indivisible time" is moved to the end of its clause, which is where a modern sentence wants it; nothing is lost. "The one and all, which we call Cosmos" is Long's and stays. The inference "and so you will not wonder if …" is kept as an inference.)

## VI.26 — B06-P026

No material issue found.

(Spelling out Antoninus letter by letter: "with a straining of the voice utter each letter", "go on with composure and number every letter" — Long's. "What, then, if they grow angry—will you be angry too?" keeps Long's two questions as two. The application keeps its structure: every duty made up of certain parts; observe them; "without being disturbed or showing anger toward those who are angry with you"; "go on your way and finish what is set before you".)

## VI.27 — B06-P027

No material issue found.

(PG's mid-sentence capital "After" (line 4076) is a printing slip and is rightly lowered; Standard Ebooks has "strive after". "Vexed because they do wrong" → "resentful because they do wrong" is the extended glossary row and reads as the ordinary word. The argument is intact: it is cruel not to allow men to strive after what seems suitable and profitable to them; in a way you do not allow it when you resent their wrongdoing; they are moved toward things because they suppose them suitable and profitable; "But it is not so." kept as its own sentence; "Teach them, then, and show them without being angry.")

## VI.28 — B06-P028

No material issue found.

(The four "and of" clauses are kept as four: impressions through the senses; the pulling of the strings that move the appetites; the discursive movements of the thoughts; the service to the flesh. "Movements" is motion here and rightly stays. Cross-reference "(ii. 12)" listed.)

## VI.29 — B06-P029

No material issue found.

("To be first to give way" → "to be the first to give way" adds the article the idiom needs. One sentence.)

## VI.30 — B06-P030

No material issue found.

(Long's 316 words at 315. "Take care that you are not made into a Caesar, that you are not dyed with this dye" keeps the dye image. The list of what to be is complete and in order: simple, good, pure, serious, free from affectation, a friend of justice, a worshipper of the gods, kind, affectionate, strenuous in all proper acts. "Short is life." kept as Long's bare sentence (an inversion, but a current one, and three words; not an archaism by the edition's standard). "Terrene life" → "earthly life". The portrait of Antoninus is complete, item for item in Long's order: constancy in every act according to reason; evenness in all things; piety; serenity of countenance; sweetness; disregard of empty fame; efforts to understand things; never letting anything pass without examining and understanding it; bearing with those who blamed him unjustly without blaming in return; nothing in a hurry; "did not listen to slander"; exact examiner of manners and actions; not given to reproach, nor timid, nor suspicious, nor a sophist; with how little he was satisfied — lodging, bed, dress, food, servants; laborious and patient; holding out until the evening on his sparing diet, "not even needing to relieve himself by any evacuation except at the usual hour"; firmness and uniformity in friendships; tolerating freedom of speech in those who opposed his opinions; the pleasure he had when any man showed him anything better; religious without superstition. "Imitate all this, so that you may have as good a conscience, when your last hour comes, as he had." Cross-reference "(i. 16)" listed.)

## VI.31 — B06-P031

No material issue found.

(Both supplements are supplements — they say what "these" and "those" are — and both are folded into plain prose: "look at these things about you as you looked at those dreams". The waking image is kept in Long's order: sober senses; call yourself back; roused from sleep; "only dreams that troubled you".)

## VI.32 — B06-P032

No material issue found.

(The distinction is carried step by step: to the little body all things are indifferent, "for it is not able to perceive differences"; to the understanding only those things are indifferent that are not the works of its own activity; whatever is its own activity is in its power; "And of these, however, only those that are done with reference to the present"; even the mind's past and future activities "are for the present indifferent". "Understanding" and "mind" are kept apart as Long has them.)

## VI.33 — B06-P033

No material issue found.

("Contrary to nature" → "against nature" ×3 per glossary. "So then neither to a man as a man is his labor contrary to nature" → "So, then, neither is his labor against nature for a man as a man" is Long's inversion untangled without loss: hand and foot, then man as man, then the conclusion "neither is it an evil to him".)

## VI.34 — B06-P034

No material issue found.

(Identical to Long, 11 words. On "patricides": see the rulings below — Long's word, correctly kept.)

## VI.35 — B06-P035

No material issue found.

(Both "[the principles]" are Long's second word for the one he has just rendered "reason", and D11 drops them; Standard Ebooks keeps both brackets, confirming they are apparatus. "The handicrafts-men" → "craftsmen"; "shall have more respect to the reason … than man to his own reason" → "have more respect for the reason … than man has for his own reason". Also noted, optional: "do not endure to depart from it" is Long's and is stiff but clear; "cannot bear to depart from it" would be the plain phrase, but no change is needed. The closing clause "which is common to him and the gods" is intact.)

## VI.36 — B06-P036

No material issue found.

(The scale is kept: Asia and Europe corners; all the sea a drop; Athos a little clod; all the present time a point in eternity. "From thence" → "from there"; "either directly proceeding or by way of sequence" kept; the lion's jaws, the poisonous, the thorn and the mud "are after-products of the grand and beautiful"; "form a just opinion of the source of all". "Universal ruling power" is Long's adjective and stays. Cross-reference "(vii. 75)" listed.)

## VI.37 — B06-P037

No material issue found.

("Which" → "that" ×2; "of one kin and of one form" kept.)

## VI.38 — B06-P038

No material issue found.

(The dagger clause "by virtue of the active movement and mutual conspiration and the unity of the substance" stands verbatim, "conspiration" included, and the candidate does not try to make it clearer than Long. "Implicated with one another" → "bound up with one another" is right: Long's word meant folded together and now means involved in wrongdoing. "In a manner" → "in a way"; "friendly to one another" kept; "one thing comes in order after another" kept. Cross-reference "(ix. 1)" listed.)

## VI.39 — B06-P039

No material issue found.

("[Sincerely]" is a second rendering of "truly" and is rightly dropped under D11; see the rulings below. "Love them, but do it truly" is clear as it stands. One sentence, not expanded.)

## VI.40 — B06-P040

No material issue found.

("There abides in them the power which made them" → "there remains in them, the power that made them" keeps Long's contrast with the absent maker of the tool. "Wherefore the more is it fit to reverence this power" → "therefore it is all the more fitting to reverence this power" is Long's comparative kept ("the more"). "In conformity to intelligence" → "in conformity with intelligence" ×2 is the current preposition, and the phrase is rightly not collapsed to the nature row. Also noted: "if it does that for which it has been made, is well" keeps Long's "is well" (is in good order); it is slightly dated but the sense is recoverable from the sentence, and any substitute would add a word Long does not have. No change proposed.)

## VI.41 — B06-P041

No material issue found.

(The rendering without PG's "not" is right — see the rulings below — and the argument is now the one Long's own second half requires: suppose external things good or evil, and when a bad thing befalls you or a good thing is lost you *will* blame the gods and hate men; "But if we judge only those things that are in our power to be good or bad, there remains no reason either for finding fault with God or standing in a hostile attitude to man." "Thou shalt suppose" → "you suppose" inside "Whatever of the things …" is the current tense for a general condition. The dagger-bearing bracket is dropped under D11 and the primary clause "and indeed we do much injustice because we make a difference between these things" stands verbatim; see the rulings. "God" keeps Long's capital.)

## VI.42 — B06-P042

No material issue found.

(Heraclitus's sleepers "laborers and cooperators"; "men cooperate in different ways"; the fault-finders and the opposers who "cooperate abundantly"; "the universe had need even of such men as these"; "among what kind of workmen you place yourself"; "he who rules all things will certainly make a right use of you"; and Chrysippus's "mean and ridiculous verse in the play" — all in Long's order. "Conduce" → "contribute"; "after different fashions" → "in different ways"; "co-operate" → "cooperate" is spelling. "But be not thou such a part" → "But do not be such a part".)

## VI.43 — B06-P043

No material issue found.

(The fold "the Fruit-bearer, the earth" is right — see the rulings below. The sun and the rain, Aesculapius and the Fruit-bearer, and the stars "different, and yet they work together to the same end" are all kept. Two sentences, not expanded.)

## VI.44 — B06-P044

No material issue found.

(Long's 246 words at 245. The three-way conditional is kept whole and in order: (1) if the gods have determined about me — they have determined well, "for it is not easy even to imagine a deity without forethought", and as to harm, "For what advantage would result to them from this, or to the whole, which is the special object of their providence?"; (2) if not about me individually, then about the whole at least, and what follows by way of sequence "I ought to accept with pleasure and to be content with"; (3) if about nothing — "which it is wicked to believe, or if we do believe it, let us neither sacrifice nor pray nor swear by them, nor do anything else that we do as if the gods were present and lived with us" (the four-member chain kept) — then "I am able to determine about myself". The em dashes carry Long's long parenthesis better than his ",—". "That is useful to every man which is according to his own constitution and nature" keeps Long's "which"; "conformable" → "according to" per glossary. The close is Long's: rational and social; Rome as Antoninus, the world as a man; "The things, then, that are useful to these cities are alone useful to me." "A deity without forethought" is rightly left as Long's countable noun.)

## VI.45 — B06-P045

No material issue found.

("For the interest of the universal" → "for the interest of the whole" is the glossary row extended for this line; it reads as Long's argument (what happens to each is for the interest of the whole) and imposes nothing. "This might be sufficient. But further …" kept. The fold "things of the middle kind, neither good nor bad" is right — see the rulings below.)

## VI.46 — B06-P046

No material issue found.

(The amphitheatre, "the continual sight of the same things, and the uniformity", "so it is in the whole of life", "all things above, below, are the same and from the same", and the bare "How long, then?" — Long's. "Amphitheatre" as PG spells it.)

## VI.47 — B06-P047

No material issue found.

(The roll of names is complete and in Long's order: Philistion, Phoebus, Origanion; Heraclitus, Pythagoras, Socrates; heroes, generals, tyrants; Eudoxus, Hipparchus, Archimedes; "other men of acute natural talents, great minds, lovers of labor, versatile, confident, mockers even of the perishable and ephemeral life of man, such as Menippus and those like him". "[Of men]" is a supplement and is folded (Standard Ebooks runs it as text). "To that place then we must remove" → "we must go" is the current verb. "A benevolent disposition" → "a kind disposition" is the new glossary row and is Long's own phrase at V.31. The colon after "worth a great deal" introduces the one thing, as Long's comma did.)

## VI.48 — B06-P048

No material issue found.

(The four virtues of one's companions are kept as four in order: activity, modesty, generosity ("liberality"), "some other good quality of a fourth". "Present themselves in abundance, as far as is possible" kept; "Wherefore" → "Therefore".)

## VI.49 — B06-P049

No material issue found.

(PG's full stop in "dissatisfied. I suppose" (line 4278) is a comma — see the rulings. "Dissatisfied" → "discontented" ×2 per glossary; "litrae" is rightly left as the unit Long leaves it. The parallel — weight assigned / time assigned — is Long's: "as you are satisfied with the amount of substance that has been assigned to you, so be content with the time".)

## VI.50 — B06-P050

**Finding 50.1 — a referent supplement dropped as if it were an alternative rendering, leaving "them" without an antecedent — minor (worth improving).**
Source: "Let us try to persuade them [men]."
Candidate: "Let us try to persuade them."
Long's "[men]" says who "them" is. That is the class of VI.6 "[the wrong-doer]", VI.31 "[the things about thee]" / "[the dreams]" and VI.47 "[of men]", all of which the candidate folds; it is not a second rendering of a word already rendered (the D11 class: VI.35 "[the principles]", VI.39 "[sincerely]", VI.50 "[conditionally]"). `continuity.md` calls it a "label" and drops it on the ground that "against their will" and "any man" supply the referent later. They do, but only after the reader has met a new meditation that opens on a pronoun with nothing before it (VI.49 is about litrae and years). Long gave his reader the word; in the candidate the sentence stands alone, and a reader who has just turned from VI.49 asks "persuade whom?" for a clause and a half. Standard Ebooks keeps "[men]" in brackets, which says nothing either way about the class; the class is settled by what the bracket does.
Proposed: "Let us try to persuade men." (Long's supplement folded, as the rule folds supplements). If the drafter prefers to keep "them", the `continuity.md` line should be reclassified as a supplement declined for a stated reason, not as a D11 drop.
Confidence moderate-to-high on the classification; moderate on whether the dangling pronoun troubles a reader enough to act on.

Everything else in VI.50 is in order and the two rulings the drafter asked for are given below: "[conditionally]" is a second rendering of "with a reservation" and is rightly dropped; "[not]" is rightly folded, so the last sentence reads "But you attain your object, if the things to which you were moved are not accomplished." "Betake thyself to contentment and tranquillity" → "turn to contentment and calm" (glossary for "tranquillity"); "employ the hindrance toward the exercise of some other virtue" kept; "that you did not desire to do impossibilities" kept; the dialogue dashes kept ("What, then, did you desire?—Some such effort as this.—But …").

## VI.51 — B06-P051

No material issue found.

(Identical to Long, 36 words; the three lovers — of fame, of pleasure, and he who has understanding — with what each counts his own good.)

## VI.52 — B06-P052

No material issue found.

(Identical to Long, 32 words; "opinion" and "disturbed" as the glossary and Long have them.)

## VI.53 — B06-P053

No material issue found.

("As much as it is possible" → "as much as possible"; "be in the speaker's mind" is Long's and stays.)

## VI.54 — B06-P054

No material issue found.

("That which is not good for the swarm, neither is it good for the bee" → "What is not good for the swarm is not good for the bee either" carries Long's "neither" with "either" and is one clean line; the swarm and the bee are kept as the image, not explained.)

## VI.55 — B06-P055

No material issue found.

(Sailors and helmsman, the sick and the doctor; both questions kept as questions, the second now beginning with a capital.)

## VI.56 — B06-P056

No material issue found.

("How many together with whom I came into the world" → "How many of those who came into the world with me": Long's relative has no head noun in current English and "of those who" supplies grammar only, not a thought. Eighteen words for Long's seventeen; Long's full stop kept.)

## VI.57 — B06-P057

No material issue found.

(The three examples are kept as three — the jaundiced and honey, those bitten by mad dogs and water, little children and the ball — and the question "Why, then, am I angry?" turns on them as Long's does. "Dost thou think that a false opinion has less power than the bile … or the poison …" → "Do you think …"; "false opinion" per glossary.)

## VI.58 — B06-P058

No material issue found.

("Contrary to the reason of the universal nature" → "against the reason of the universal nature" per glossary; "the reason of your own nature" kept; the two halves of the sentence kept as Long's parallel.)

## VI.59 — B06-P059

No material issue found.

(Identical to Long, 36 words; both questions kept, the second with Long's full stop.)

---

## Rulings on the base-text defects and the bracket decisions

Each was checked against `source/pg15877-long-1862.txt` (sha256 `6584df7e…`) at the line given, and against Standard Ebooks' Long for text state only.

| Place | PG reads (line) | Candidate | Ruling |
|---|---|---|---|
| **VI.41 "not"** | "thou wilt not blame the gods, and hate men too, those who are the cause of the misfortune or the loss" (4187) | "you will blame the gods, and hate men too" | **PG's "not" is a base-text error; rendering without it is right.** The meditation's structure requires it: the first half states what *must* follow from supposing externals good or evil (blame of the gods, hatred of men — the "injustice" the next clause names), and the second half, "But if we judge only those things that are in our power to be good or bad, there remains no reason either for finding fault with God or standing in a hostile attitude to man", is the contrast. With "not" the first half says the opposite of what the contrast needs and "it must of necessity be that … thou wilt not blame" makes no argument at all. Standard Ebooks reads "thou wilt blame the gods". A reviewer who read PG's "not" as Long's would have to explain the second sentence; I cannot. Rightly handled and rightly recorded under unresolved source issues. Confidence high. |
| **VI.41 bracket with dagger** | "because we make a difference between these things [because we do not regard these things as indifferent+]" (4190–4191), footnote: "Gataker translates this 'because we strive to get these things' … He may be right in his interpretation, but I doubt." (4195–4198) | primary clause verbatim; bracket dropped | **D11 drop is right.** Long's footnote settles the class: the bracket is a second English rendering of the same Greek clause, offered beside his first, with Gataker's third in the note; that is Long talking to the reader about his choices, the D11 class exactly (as III.6 "[or, practically]", V.8 ×4). The dagger inside the bracket marks Long's doubt about the Greek and goes with the bracket. The primary clause stands verbatim and is intelligible in current English ("make a difference between" = treat as differing in worth). This is the first dagger in the edition whose mark falls inside a dropped bracket; it is consistent with D11 and with the rule that the *clause Long prints as text* stands verbatim, which it does. The candidate is not expected to be clearer than Long here. Rightly handled. |
| **VI.49** | "Thou art not dissatisfied. I suppose, because thou weighest only so many litrae" (4278) | "You are not discontented, I suppose, because you weigh" | **Printing/scan error; the comma is right.** A full stop before "I suppose, because" leaves "I suppose, because …" as a fragment; Standard Ebooks has the comma. Rightly handled. |
| **VI.27** | "to strive After the things which appear" (4076) | "to strive after the things" | **Stray capital; lowered.** Mid-sentence, no sentence break possible; Standard Ebooks has "after". Rightly handled. |
| **VI.34 "patricides"** | "robbers, patricides, tyrants" (4139) | "patricides" | **Long's word; keep.** "Patricide" (one who kills his father) is a real English word and is the exact sense of the Greek; "parricide" is the commoner spelling but not a correction. PG and Standard Ebooks agree. Not emending is right. |
| **VI.43 "[the earth]"** | "or Aesculapius the work of the Fruit-bearer [the earth]?" (4219) | "the work of the Fruit-bearer, the earth?" | **Fold is right.** The bracket is not a second rendering of "Fruit-bearer" (which is Long's rendering of the title); it says who bears the title, which a modern reader cannot know, and without it the second half of the question ("Aesculapius the work of the Fruit-bearer") has no image to set beside the sun and the rain. It is the V.8 "It, necessity or destiny" class — a referent supplied — and folding it as an apposition in Long's own two words is the permitted way of explaining an essential unfamiliar term at the point of need. Standard Ebooks keeps the brackets, which shows only that its editors treated it as Long's addition; it is Long's addition either way, and the rule folds Long's additions that carry plain sense. Confidence moderate-to-high. |
| **VI.45 "[neither good nor bad]"** | "as said of things of the middle kind [neither good nor bad]." (4248) | "as said of things of the middle kind, neither good nor bad." | **Fold is right.** Long's bracket is a gloss of the technical term, not a second rendering of it; it supplies the one thing the reader needs to make "the middle kind" mean anything, in Long's own four words; folded, it reads as Marcus's own qualifier and imposes no modern reading (it is the glossary's own definition of "indifferent", II.11). Standard Ebooks runs it as text, which supports the fold but is not the ground for it: the ground is that the words carry Long's plain sense and the term cannot otherwise be resolved from the paragraph. The candidate's comma before "as said of things of the middle kind" is also right — it separates "in the common sense" from the example. |
| **VI.39 "[sincerely]"** | "love them, but do it truly [sincerely]." | "but do it truly." | **D11 drop is right.** "Sincerely" is Long's second word for the one adverb he has just rendered "truly"; it adds no sense the first does not carry. Standard Ebooks' "truly, sincerely" prints the same two words as a doublet, which is the same thing without the brackets; D11 classifies by kind, as `continuity.md` says. "Do it truly" is clear in current English. |
| **VI.50 "[not]"** | "But thou attainest thy object, if the things to which thou wast moved are [not] accomplished. +" (4291–4292) | "But you attain your object, if the things to which you were moved are not accomplished." | **Fold is right; do not drop.** This is the first thing the drafter asked to have ruled on. The sentence answers "What, then, did you desire?—Some such effort as this." — that is, the attempt itself, made with a reservation. The conclusion Marcus draws is that the object (the attempt) is attained *even when* the things the attempt was moved toward are not accomplished; that is the whole point of acting "with a reservation", and it is why the paragraph begins with a man who "by using force stands in your way". Without "not", "you attain your object if the things … are accomplished" is a truism that contradicts the preceding sentence. Long printed "[not]" as a supplement because the Greek he had did not carry it, and put his dagger after the sentence to say the Greek is doubtful; but the supplement is his translation of the sense, and the rule folds his supplements. Standard Ebooks omits it and reads "are accomplished", which is a different editorial choice about brackets, not evidence about Long's sense. The dagger clause stands verbatim with pronouns modernised and the supplement folded, exactly as the instructions specify. Confidence high on Long's sense; the drafter should keep "if" rather than sharpening to "even if", which Long does not have. |
| **VI.50 "[conditionally]"** | "with a reservation [conditionally]" (4288–4289) | "with a reservation" | **D11 drop is right.** A second rendering of one term; V.20 met the same idea in Long's own text as "acting conditionally". Standard Ebooks omits it too. |
| **VI.50 "[men]"** | "Let us try to persuade them [men]." (4284) | "Let us try to persuade them." | **Misclassified; see finding 50.1.** A referent supplement of the VI.6 / VI.47 class, not a D11 alternative rendering. Recommended: fold ("persuade men"). |

Also confirmed: the two PG footnotes in Book VI — VI.41 [A] (Gataker) and [B] (Cicero, *De Natura Deorum* iii. 32) — are apparatus, were stripped when the staged original was built, and are absent from source and candidate alike, which is correct. The seven cross-references listed in `continuity.md` (VI.2, VI.9, VI.10, VI.28, VI.30, VI.36, VI.38) are each present in the source and absent from the candidate, and the word-level diff confirms that nothing else went with any of them.

A record note, not a finding: `../PROVENANCE.md` §3 says Standard Ebooks' only differences from PG include "removal of Long's square-bracket supplements". For Book VI that is only partly so — Standard Ebooks runs some brackets as text (VI.6, VI.39, VI.45, VI.47), keeps others in brackets (VI.35 ×2, VI.41, VI.43, VI.50 "[men]"), and omits others outright (VI.50 "[conditionally]", "[not]"). `continuity.md` reports each of these correctly for Book VI; the general sentence in PROVENANCE.md is the one that is imprecise, and it is outside this review's scope to edit.

---

## Summary

| Severity | Count | Paragraphs |
|---|---|---|
| **Substantive** (must fix) | **0** | — |
| **Minor** (drafter's discretion) | **3** | VI.9 (9.1), VI.15 (15.1), VI.50 (50.1) |
| No material issue | 56 | VI.1–VI.8, VI.10–VI.14, VI.16–VI.49, VI.51–VI.59 |

Of the 3 minor findings, 2 are "worth improving" (9.1 "comprehends / comprehended", which a modern reader takes as "understands" in a three-way distinction the meditation turns on; 50.1 a referent supplement dropped as if it were a D11 alternative rendering, leaving a new meditation opening on an unanchored "them") and 1 is "optional preference" (15.1 "breathing in" for Long's "respiration"). Classification, each counted once: dropped clause 0; dropped word 1 (50.1); added content 0 (the only added words — "to" in VI.9, "the" in VI.29, "for you" in VI.19, "of those who … with me" in VI.56, "do not" ×3 in VI.22 and VI.42, "such" in VI.36 and VI.47, "either" in VI.54 — are grammar for Long's constructions and carry no thought); resolved ambiguity 0; expansion 0; voice drift 0; glossary inconsistency 0 (every glossary row met in Book VI is applied consistently, including the new "kind" row at VI.47 and the two extended rows at VI.20/VI.27 and VI.45); imported rendering 0; archaism left 0 (VI.30 "Short is life" is an inversion still in use, not a "thou"-form or "not"-after-verb); other 2 (9.1, 15.1). All three dagger clauses stand as the instructions require: VI.38 verbatim, VI.41's primary clause verbatim with the dagger-bearing alternative dropped, VI.50's last sentence verbatim with pronouns modernised and "[not]" folded. No short section is expanded: VI.3 (15/15 words), VI.4, VI.17, VI.34, VI.51, VI.52, VI.59 identical to Long, VI.5, VI.6, VI.7, VI.21, VI.24, VI.37, VI.46 at Long's length; VI.22 (33/31) and VI.56 (18/17) are grammar only. No drift toward advice, moral lesson or explanation for a modern reader anywhere in the book; the imperatives stay bare ("Look within."; "Reverence the gods, and help men."; "Short is life."; "Teach them, then, and show them without being angry."; "How long, then?"). No phrase identified as imported from another translation; I did not compare against other translations for wording and claim nothing about them. The new glossary row reads naturally where it is applied ("with a kind disposition even to liars and unjust men", VI.47); the extended rows read as ordinary words ("signs of resentment", VI.20; "resentful because they do wrong", VI.27; "for the interest of the whole", VI.45) and impose no modern psychological reading; "disturbance" (VI.16), "generative principles" (VI.24), "entanglement" (VI.10) and "bound up" (VI.38), which the instructions asked to be checked for that, are each the plain current word for what Long's word meant.

### Chapter-level findings (from the continuous read)

1. **Connectives.** Long's inferential connectives are carried throughout — "For" in VI.1, VI.2, VI.13, VI.15, VI.16, VI.20, VI.21, VI.22, VI.23, VI.24, VI.27, VI.32, VI.36, VI.38, VI.42, VI.44, VI.48, VI.49, VI.52; "then" wherever Long has it, set between commas in the candidate's own sentences and left unpunctuated inside the verbatim dagger sentence of VI.50; "But" at every turn Long makes (VI.1, VI.10, VI.14, VI.16, VI.17, VI.18, VI.27, VI.32, VI.33, VI.41, VI.42, VI.44 ×3, VI.45 ×2, VI.50 ×2, VI.51). No connective added.
2. **Archaic syntax.** None left. Every "thou"-form, inverted question ("Dost thou", "Wilt thou", "wouldst thou"), "not"-after-verb ("trouble me not", "know not", "listened not", "be not") and "-est/-eth" verb has been recast in Long's order of ideas. Long's already-current words are kept where the glossary does not touch them ("fortuitous", "transpiration", "affectation", "sophist", "after-products", "ephemeral", "litrae", "Cosmos"). "Short is life" (VI.30) is the one inversion left and it is current.
3. **Terminology.** The glossary is applied consistently: "the ruling part" (VI.8); "the reason that governs" (VI.1, VI.5); "the nature of the whole" (VI.9); "the universal nature" and "the universal ruling power" as Long's adjective (VI.36, VI.58); "the whole" for Long's noun "the universal" (VI.45) and for "the whole" itself (VI.44); "according to" for all of Long's "conformable / in conformity to" with "nature", "reason", "constitution" (VI.9, VI.14, VI.16, VI.19, VI.30, VI.44), while "in conformity with intelligence" (VI.40) is rightly kept as Long's distinct phrase; "against nature" (VI.33 ×3, VI.58); "providence" (VI.10, VI.44); "impressions" in the technical sense beside "the appearances of things" (VI.13, VI.16, VI.28); "opinion" (VI.36, VI.52, VI.57); "indifferent" (VI.32, VI.45); "social act / spirit / life", "society" (VI.7, VI.14, VI.16, VI.23, VI.30); "rational and social" (VI.44); "generative principles" (VI.24); "disturbance" beside Long's own verb "disturbed" (VI.16; VI.10, VI.11, VI.26, VI.52); "resentment / resentful" (VI.20, VI.27); "discontented" (VI.49); "calm" (VI.50); "kind" (VI.47); "in a way" (VI.11, VI.27, VI.38); "the elements", "the dispersion of my elements" (VI.10, VI.15, VI.17); "fame", "posterity" (VI.16, VI.18, VI.30, VI.51); "the understanding", "the mind", "intelligence" kept apart (VI.32, VI.40, VI.51); "movement(s)" for motion and never for impulse (VI.17, VI.28, VI.38); "God" / "the gods" / "a deity" as Long has them. The "which" → "that" pattern is applied to restrictive relatives and left in Long's non-restrictive ones and in the dagger clauses; punctuation-level, not a finding.
4. **Long's plain words replaced.** The rate is as low as in Book V. "Involution" → "entanglement", "implicated" → "bound up", "rambled" → "strayed", "abides" → "persists" / "remains", "tarry" → "linger", "calumnies" → "slander", "approbation" → "approval", "antagonists" → "opponents", "handicrafts-men" → "craftsmen", "terrene" → "earthly", "remove" → "go", "conduce" → "contribute", "liberality" → "generosity" are each the plain current word for what Long's word meant, and none changes what Marcus says. The two places where a word choice shades the sense are findings 9.1 (where the candidate *kept* a Long word whose current sense misleads) and 15.1.
5. **Short sections.** VI.3, VI.4, VI.5, VI.6, VI.7, VI.17, VI.19, VI.21, VI.22, VI.24, VI.29, VI.34, VI.37, VI.39, VI.46, VI.51–VI.59 are at Long's length and bare. The abrupt cuts between meditations are the source's own.
6. **Apparatus.** The seven cross-references and five D11 drops are each listed in `continuity.md`, and the word-level diff confirms that nothing beyond the listed brackets and references is absent from the candidate. Of the seven folds, six are Long's plain sense (VI.6, VI.31 ×2, VI.43, VI.45, VI.47) and the seventh (VI.50 "[not]") is the sentence's sense; the one bracket I would move from the drop list to the fold list is VI.50 "[men]" (finding 50.1).

### Flow judgement

Read straight through from VI.1 to VI.59, the candidate is Long's Book VI with the archaisms gone and nothing else changed. The long meditations carry Long's argument sentence by sentence in his order: VI.10's two suppositions and the three questions the first one raises; VI.13's dead fish and Falernian and purple robe, then the rule drawn from them and Crates left hanging; VI.14's four grades of what men admire, each with its examples; VI.15's stream and sparrow and breath; VI.16's six-member chain of what is not worth valuing, the clapping of hands and of tongues, the vine planter and the horse breaker and the dog trainer, and the two futures that follow from valuing the wrong things; VI.30's list of what to be and the portrait of Antoninus item by item down to the sparing diet; VI.41's supposition and its consequence and the contrast; VI.42's cooperators, the fault-finders included, and Chrysippus's verse; VI.44's three-way conditional closing on Rome and the world; VI.47's roll of the dead from Philistion to Menippus; VI.50's reservation. The one- and two-line sayings stay one and two lines and stay bare: "Look within."; "The best way of avenging yourself is not to become like the wrongdoer."; "How many pleasures have been enjoyed by robbers, patricides, tyrants."; "What is not good for the swarm is not good for the bee either."; "How many of those who came into the world with me are already gone out of it." The voice is Marcus's own throughout — self-addressed, imperative, unexplained: "Take care that you are not made into a Caesar"; "Do everything as a disciple of Antoninus."; "Why, then, am I angry?"; "How long, then?" The images are all still images (the dead fish, the bird, the pig; grape juice and shellfish blood; stones, wood, fig trees, vines, olives; flocks and herds; the flowing stream and the sparrow; puppets on strings; the clapping of tongues; the stepmother and the mother; the nails and the wound in the gymnasium; the letters of Antoninus; the dye; Athos as a clod; the lion's jaws, the thorn, the mud; the sun and the rain, Aesculapius and the Fruit-bearer; the amphitheatre; litrae; the swarm and the bee; the helmsman and the doctor; honey to the jaundiced), and the three dagger clauses leave their sentences exactly as obscure as Long leaves them. The new and extended glossary renderings sit unobtrusively in the prose; a reader meeting "a kind disposition", "signs of resentment" and "the interest of the whole" will not notice that a decision was made. The weaknesses are small and of three kinds: one Long word kept whose current sense misleads in a passage built on the distinction it makes (9.1); one referent supplement dropped so that a meditation opens on a bare pronoun (50.1); and one narrowing of "respiration" to inhalation that the next sentence repairs (15.1). None changes what Marcus says. Apply the two "worth improving" items and the book reads as Long's Book VI in modern dress, at the standard the accepted Books I–V set.

### Verdict

**Accept after corrections.** There is no substantive finding. The book can be accepted once the drafter has considered the 3 minor findings; recommended for application: the two "worth improving" items (9.1, 50.1). 15.1 is a preference. All the rulings the drafter asked for go the drafter's way except VI.50 "[men]" (fold, not drop); in particular VI.50 "[not]" is **fold**, VI.43 "[the earth]" is **fold**, VI.45 "[neither good nor bad]" is **fold**, VI.41's PG "not" is a base-text error rightly omitted, VI.41's dagger-bearing bracket and VI.39 "[sincerely]" and VI.50 "[conditionally]" are rightly dropped under D11, VI.49's full stop is rightly a comma, VI.27's capital is rightly lowered, and VI.34 "patricides" is rightly kept. If the drafter prefers to accept v1 unchanged, the review does not block it, but 9.1 (a first-reading misparse of a three-way distinction) should not be left unaddressed without a recorded reason, and the VI.50 "[men]" line in `continuity.md` should in any case be reclassified (rulings above).

### Coverage and limitations

- Every paragraph VI.1–VI.59 was read source-beside-candidate in packet order (20 packets, three paragraphs each, the last two) with the supplied context, then the whole candidate was read continuously. A word-level diff of each paragraph against Long was generated and read alongside, so every token present in one text and absent from the other was inspected individually. Every Long clause was checked for presence, including qualifiers, negations, quantifiers, the "neither … nor" chains (VI.9, VI.16, VI.20, VI.44), and the length and order of every list (VI.2's four pairs; VI.10's two triads; VI.14's four grades; VI.16's six members and three consequences; VI.28's four clauses; VI.30's ten qualities and the portrait's items; VI.44's three conditions and four-member chain; VI.47's roll of names; VI.48's four virtues; VI.57's three examples), and the three dagger marks and six base-text points against the PG file at the lines cited.
- The review is against Long's English only, as instructed. Where I note that an alternative reading of Long is available (VI.3 "peculiar"; VI.40 "is well"), the confidence given reflects that; I did not consult the Greek, and the candidate is not required to match the Greek over Long. My ruling on VI.50 "[not]" rests on the sense of Long's own paragraph, not on the Greek.
- Standard Ebooks' Long was consulted for text state only, by exact-phrase search of the fetched Book VI page, at the points listed in the header; no wording was taken from it. No other translation was consulted, so "imported rendering" could only have been caught where a phrase departs from Long in a way Long's own words do not explain; none was found. Absence of such a finding is not proof.
- The mechanical checks were re-run and passed; word ratios were used only as a screening signal.
- Attention was held to the end: the last packets (VI.49–VI.59) were read at the same pace as the first, and one of the three findings falls in VI.50.
- Errors can remain; this review does not claim otherwise.
