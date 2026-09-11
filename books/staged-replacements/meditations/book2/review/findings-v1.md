# Independent review — Meditations, Book II, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer session (Claude Code, spawned by the Tinct coordinator); did not draft the candidate and did not consult the drafter |
| Date | 2026-09-11 |
| Branch | `claude/meditations-modern-en-20260911-v2` |
| Candidate | `book2/candidate-v1.json`, sha256 `42002ed4b9d7003fba329a8a5f1d91142431b7e24f8f188178868255922ba07f` (recomputed locally; matches `provenance.json`) |
| Source | George Long 1862, `book2/source-book2.json` (sha256 `0e112cf2…`), byte-identical to chapter 2 of `../meditations-original-en.staged.json`; dagger positions confirmed in `source/pg15877-long-1862.txt` (II.6 after "sufficient", II.12 after "disposed", II.14 after "not the same;") |
| Packets reviewed | `review-packets/packet-01.md` … `packet-06.md`, in order, three paragraphs at a time with the supplied context; then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md`, `WORKFLOW.md` (Anders's voice rules), `review-instructions.md`, `continuity.md` |

Mechanical checks from `book2/README.md` were re-run before reading: hash, paragraph count (17 = 17), packet coverage (B02-P001…P017 each exactly once, in order), and packet text identical to the JSON. All passed.

Severity: **substantive** = must be fixed before acceptance (review-instructions "Must fix"). **minor** = drafter's discretion ("Worth improving" or "Optional preference", stated in each entry). Every proposed wording stays inside Long's words and the glossary. Confidence is stated where a plausible alternative reading exists.

---

## II.1 — B02-P001

**Finding 1.1 — dropped connective and tense shift — minor (worth improving).**
Source: "For we are made for co-operation, like feet, like hands…"
Candidate: "We were made for cooperation, like feet, like hands…"
Long's "For" gives the reason for the preceding claim (I cannot be angry with my kinsman *because* we are made for cooperation); the candidate breaks the inference into a free-standing statement. "Are made" is present-tense constitution (this is how we are built); "were made" points to a past act of creation, which Long does not say. Both words are already modern.
Proposed: "For we are made for cooperation, like feet, like hands, like eyelids, like the upper and lower rows of teeth."

**Finding 1.2 — glossary inconsistency — minor (worth improving).**
Source: "[the same] portion of the divinity"
Candidate: "the same portion of the divine"
`GLOSSARY.md` fixes "a portion of the divinity" → "**a share of the divine**". `continuity.md` lists "portion of the divine" in its table but does not record it as an exception or give a reason, so the glossary rule stands. Either wording reads well; the pilot should follow the glossary it fixed, or record the exception explicitly.
Proposed: "but sharing the same intelligence and the same share of the divine" reads badly because of "sharing … share"; so either "but partaking in the same intelligence and the same share of the divine", or keep "portion" and add a one-line exception to `continuity.md` ("portion" kept in II.1 to avoid "sharing … share"). Drafter's choice; the finding is the unrecorded departure, not the word.

**Finding 1.3 — added content (objects supplied) — minor (optional preference).**
Source: "and it is acting against one another to be vexed and to turn away."
Candidate: "and to resent someone and turn away from him is acting against one another."
Long's two infinitives have no object; the candidate supplies "someone … him". The addition is small and the sense is the obvious one, but it is not in Long, and the glossary offers "resentful" as the adjective form, which avoids the need for an object. Also "the nature of the wrongdoer himself" adds "himself", which Long does not have ("the nature of him who does wrong").
Proposed: "and to be resentful and to turn away is acting against one another." and "the nature of the wrongdoer, that he is akin to me".

Everything else in II.1 is accounted for: the six types, the ignorance clause, the three "nature of" clauses, both "neither/nor" branches with their reason, the four body-part comparisons, and the closing inference in Long's order. Bracket supplements folded correctly.

## II.2 — B02-P002

**Finding 2.1 — resolved quantity / certainty — substantive.**
Source: "air, and not always the same, but every moment sent out and again sucked in."
Candidate: "air, and never the same air, but every moment breathed out and sucked in again."
"Not always the same" is a limited claim; "never the same" is a universal one. Marcus's point (the breath changes moment to moment) survives either way, but the candidate strengthens what Long states, and Long's phrase is already plain modern English. The repeated "air" is also an addition.
Proposed: "air, and not always the same, but every moment breathed out and sucked in again."
Confidence high; no alternative reading of Long supports "never".

**Finding 2.2 — resolved ambiguity (grammatical subject of the last three clauses) — minor (worth improving).**
Source: "Thou art an old man; no longer let this be a slave, no longer be pulled by the strings like a puppet to unsocial movements, no longer be either dissatisfied with thy present lot, or shrink from the future."
Candidate: "you are an old man. No longer let this part be a slave; no longer let it be pulled by strings, like a puppet, toward unsocial impulses; no longer let it either resent your present lot or shrink from the future."
In Long's English the first clause is "let this [the ruling part] be a slave" and the second and third are bare imperatives whose grammatical subject is "thou" (the old man): *you* are not to be pulled like a puppet, *you* are not to be dissatisfied. The candidate makes the ruling part the subject of all three ("let it … let it"). That is a possible reading of Long if "let" is taken to distribute across all three clauses, and it is a coherent one, but Long leaves it open and the candidate closes it. Marcus's slide between addressing himself and addressing his ruling part is part of the texture of II.2.
Proposed (keeps Long's shape): "No longer let this part be a slave; no longer be pulled by strings, like a puppet, toward unsocial impulses; no longer be either discontented with your present lot or shrink from the future."
Confidence moderate: the candidate's reading is defensible from Long's own sentence; the finding is that the open form is available in modern English at no cost to clarity.

**Finding 2.3 — glossary inconsistency (Long's "dissatisfied" family rendered two ways) — minor (worth improving).**
Source: "dissatisfied with thy present lot" (II.2); "dissatisfaction with what comes from gods and men" (II.13)
Candidate: "resent your present lot" (II.2); "discontent with what comes from gods and men" (II.13)
The glossary maps "vexed" → "resent" and "discontent(ed)" → "discontented". Long's "dissatisfied/dissatisfaction" is neither, and the candidate renders the same Long word one way in II.2 and another in II.13. "Resent" is also stronger than "dissatisfied" (active grievance rather than lack of contentment). The II.13 choice ("discontent") is the better fit and matches II.5's "discontent".
Proposed: "no longer let it either be discontented with your present lot or shrink from the future" (or, with 2.2, "no longer be either discontented with your present lot or shrink from the future").

Also noted, optional: "as if you were dying right now" — "right now" is a colloquial intensifier; Long's "now" suffices ("as if you were dying now"). Everything else in II.2 is present: the three components, "it is not allowed" kept bare, both anatomical images kept as two, the puppet image kept as an image.

## II.3 — B02-P003

**Finding 3.1 — dropped connective — minor (worth improving).**
Source: "But that is good for every part of nature which the nature of the whole brings, and what serves to maintain this nature."
Candidate: "Whatever the nature of the whole brings, and whatever serves to maintain that nature, is good for every part of nature."
The inversion into modern order is right and clear. But Long's "But" is the hinge of the meditation: having said that fortune's gifts are interwoven with providence and that necessity and the whole's advantage are in play, Marcus turns to the assertion that *what the whole brings is good for the part*. Without the connective the sentence reads as a fresh axiom rather than the answer to the worry the previous sentences set up.
Proposed: "But whatever the nature of the whole brings, and whatever serves to maintain that nature, is good for every part of nature."

Also noted, optional: "let them always be your fixed opinions" adds "your" (Long: "let them always be fixed opinions"). Harmless; drafter's discretion. Every other clause is present, including "of which you are a part", the two-sided preservation by elements and compounds, and the closing four-part manner of dying.

## II.4 — B02-P004

No material issue found.

## II.5 — B02-P005

**Finding 5.1 — memorable wording replaced without need — minor (optional preference).**
Source: "with perfect and simple dignity"
Candidate: "with complete and simple dignity"
"Perfect" is current English and is the memorable half of the phrase; "complete" shifts the sense toward thoroughness rather than flawlessness. The brief asks that concise language that already works be retained.
Proposed: "with perfect and simple dignity".

**Finding 5.2 — awkward modal — minor (optional preference).**
Source: "the which if a man lays hold of, he is able to live a life which flows in quiet"
Candidate: "which, if a man lays hold of them, let him live a life that flows in quiet"
"Let him live" reads as permission granted by the things; Long says the man *is able* to live so. "Can" is the plain modern equivalent.
Proposed: "which, if a man lays hold of them, he can live a life that flows in quiet and is like the existence of the gods".

Accounted for and accepted: "feeling of affection" → "affection" (the four-item list is intact: dignity, affection, freedom, justice); "as if it were the last" → "as if it were your last"; the five things set aside, all present.

## II.6 — B02-P006

**Finding 6.1 — added content that changes the temporal claim — substantive.**
Source: "but thou wilt no longer have the opportunity of honoring thyself."
Candidate: "but you will not have the chance to honor yourself much longer."
Long says the opportunity *will no longer exist*; the candidate says it *still exists for a short while*. "Much" is not in Long and "not … much longer" is an interpretation of why the opportunity is closing, not what Long states. The passage is Marcus's bleakest self-reproach in the book and the candidate softens it. Long's own words are already modern.
Proposed: "but you will no longer have the chance to honor yourself."
Confidence high.

Everything else in II.6 is right: the doubled address kept doubled; the dagger sentence "Every man's life is sufficient." kept exactly as Long has it, unrepaired; "though thy soul reverences not itself" → "and still your soul does not reverence itself" keeps the concession; "felicity" → "happiness" per glossary.

## II.7 — B02-P007

**Finding 7.1 — pronoun without antecedent — minor (worth improving).**
Source: "for those too are triflers who have wearied themselves in life by their activity"
Candidate: "for they too are triflers who have worn themselves out in life with activity"
Long's "those … who" introduces a class ("those people are triflers too, who…"); the candidate's "they" has no referent in the paragraph and a reader looks back for one. The relative construction is still natural in modern English.
Proposed: "for those too are triflers who have worn themselves out in life with activity, and yet have no object toward which to direct every impulse and, in a word, all their thoughts."

"Movement" → "impulse" is per glossary and `continuity.md`. Both halves of the warning (whirled around; carried the other way) and the question opening are intact.

## II.8 — B02-P008

No material issue found.

## II.9 — B02-P009

No material issue found.

## II.10 — B02-P010

**Finding 10.1 — semantic shift in a plain word — minor (worth improving).**
Source: "with a certain pain and unconscious contraction"
Candidate: "with a certain pain and an involuntary contraction"
"Unconscious" (Long) means the angry man is not aware of the contraction; "involuntary" means it is not willed. These are different claims, and Long's word is not archaic. If the drafter changed it to avoid the modern psychological sense of "the unconscious", note that Long's adjectival use ("an unconscious contraction") does not carry that sense.
Proposed: "with a certain pain and an unconscious contraction".

**Finding 10.2 — "in a manner" mis-modernised — minor (worth improving).**
Source: "seems to be in a manner more intemperate and more womanish"
Candidate: "seems somehow more intemperate and more womanish"
Long's "in a manner" means "in a way / in a sense"; "somehow" means "by some unknown means" and adds a puzzled tone Long does not have. The same Long phrase in II.13 is rendered correctly as "in a way".
Proposed: "seems in a way more intemperate and more womanish in his offenses".

**Finding 10.3 — indefinite made definite — minor (optional preference).**
Source: "being carried towards doing something by desire"
Candidate: "carried toward the act by desire"
Long is indefinite ("doing something"); "the act" presupposes a specific act already identified. Small, but "doing something" is plain English.
Proposed: "carried toward doing something by desire".

The argument's structure (Theophrastus's ranking, the two psychological pictures, the restatement, the "on the whole" contrast) is intact and in order. "Womanish" kept per `continuity.md`; "blamable" → "blameworthy" is fine.

## II.11 — B02-P011

No material issue found.

(The long negative sentence is restructured into the same three branches as Long's: overlooked through ignorance; known but lacking power to guard or correct; a mistake through want of power or skill. The three conditional positions on the gods, the "what is it to me", the "as to the rest" provision, the rhetorical question, the list of indifferents and the closing inference are all present in order. "The nature of the universe" → "the nature of the whole" and "devoid" → "empty", both with the repetition kept, are per glossary and continuity.)

## II.12 — B02-P012

**Finding 12.1 — image replaced by an abstraction; internal echo lost — substantive.**
Source: "or are noised abroad by vapory fame"
Candidate: "or are trumpeted about by empty fame"
"Vapory" is an image, and Long uses the same image again five sections later: II.17 "what belongs to the soul is a dream and vapor", where the candidate rightly keeps "vapor". Replacing the image here with the abstract "empty" both drops a concrete picture the brief says to keep and breaks the echo between II.12 and II.17 that Long's vocabulary carries. "Vaporous" is current English.
Proposed: "or are trumpeted about by vaporous fame". (I did not verify "trumpeted about" against any other translation and make no claim that it is imported; it is a fair modernisation of "noised abroad".)
Confidence high on the image loss; the echo with II.17 is verifiable in Long alone.

**Finding 12.2 — dagger-marked clause altered, not preserved — substantive.**
Source: "To observe too how man comes near to the Deity, and by what part of him, and when this part of man is so disposed (vi. 28)."
Candidate: "To observe, too, how man comes near to the divine, and through what part of himself, and how that part of him is disposed when it does."
Long marks this clause as corrupt. His English asks *when* the part is *so* disposed (i.e., disposed in the way that brings man near the divine). The candidate changes the question from "when" to "how", drops "so", and adds "when it does", producing a new clause ("how that part of him is disposed when it comes near") that Long does not have. `review-instructions.md` says the candidate need not be clearer than Long here; it also must not say something different. Long's clause is intelligible modern English as it stands once "thou"-forms are gone.
Proposed: "To observe, too, how man comes near to the divine, and through what part of himself, and when that part of him is so disposed."
Confidence high. The cross-reference "(vi. 28)" is correctly dropped as apparatus per glossary.

**Finding 12.3 — dropped connective and resolved referent — minor (worth improving).**
Source: "This, however, is not only an operation of nature, but it is also a thing which conduces to the purposes of nature."
Candidate: "And death is not only an operation of nature, but a thing that serves nature's purposes."
"However" marks the turn from "he is a child" to the positive point; "And" flattens it. "This" → "death" fixes the referent; that is the plain reading and low-risk, but Long's "This" is equally clear in modern English and costs nothing to keep.
Proposed: "This, however, is not only an operation of nature, but also a thing that serves nature's purposes."

Also noted, optional: "What the nature is of all the things the senses perceive, especially those…" is a strained word order (the subject and its complement are split by a long modifier). One alternative within Long: "The nature of all the things the senses perceive, especially those that lure with the bait of pleasure or terrify with pain, or are trumpeted about by vaporous fame; how worthless, contemptible, sordid, perishable and dead they are—all this it is the task of the intellectual faculty to observe." Drafter's discretion. "Sensible things" → "the things the senses perceive" is a necessary and correctly recorded gloss.

## II.13 — B02-P013

No material issue found.

## II.14 — B02-P014

**Finding 14.1 — certainty resolved — substantive.**
Source: "and so that which is lost appears to be a mere moment."
Candidate: "and so what is lost turns out to be a mere moment."
"Appears" leaves open whether Marcus means "is seen to be" or "seems to be"; "turns out" asserts the fact. This sentence sits immediately after the dagger-marked "though that which perish is not the same", which the candidate correctly leaves obscure; resolving the next clause while leaving the previous one open changes the balance of the argument. "Appears" is plain modern English.
Proposed: "and so what is lost appears to be a mere moment."
Confidence high.

**Finding 14.2 — conjunction changed ("and" → "or") — minor (worth improving).**
Source: "Though thou shouldest be going to live three thousand years and as many times ten thousand years"
Candidate: "Even if you were going to live three thousand years, or ten thousand times as many"
Long's hyperbole is cumulative: three thousand years *and* thirty million on top. The candidate offers them as alternatives. The arithmetic ("ten thousand times as many" = 3,000 × 10,000) is correctly preserved, as `continuity.md` intends.
Proposed: "Even if you were going to live three thousand years, and ten thousand times as many,".

All other clauses present: the chiasmus (loses only the life he lives / lives only the life he loses), "the present is the same to all", the past/future argument, the two numbered points, and the closing conditional.

## II.15 — B02-P015

**Finding 15.1 — dropped connective and added hedge — minor (worth improving).**
Source: "Remember that all is opinion. For what was said by the Cynic Monimus is manifest: and manifest too is the use of what was said, if a man receives what may be got out of it as far as it is true."
Candidate: "Remember that everything is opinion. What the Cynic Monimus said is plain enough, and so is the use of it, if a man takes what can be got out of it, as far as it is true."
Long's "For" tells the reader that "all is opinion" *is* Monimus's saying; without it the second sentence floats free of the first. "Plain enough" adds a concessive shrug ("enough") that Long's "manifest" does not have. The glossary explicitly endorses "Everything is opinion".
Proposed: "Remember that everything is opinion. For what the Cynic Monimus said is plain, and so is the use of it, if a man takes what can be got out of it, as far as it is true."

The four-line section stays four lines; nothing is added about what Monimus said.

## II.16 — B02-P016

**Finding 16.1 — Long's first person replaced by second — minor (worth improving).**
Source: "For to be vexed at anything which happens is a separation of ourselves from nature"
Candidate: "For to resent anything that happens is to separate yourself from nature"
`continuity.md` records the change deliberately (Marcus's self-address). But the glossary rule runs the other way ("No 'we' is introduced where Long has 'thou'"); nothing licenses removing Long's "we" where he has it, and the candidate keeps Long's first-person plural elsewhere in this book (II.11 "make us neither better nor worse", II.13 "dear to us", "our pity"). Long's "ourselves" is a general statement about anyone who resents, inside a list whose grammatical subject is "the soul", not "you".
Proposed: "For to resent anything that happens is to separate ourselves from nature, which contains, in some part of itself, the natures of all other things."
Confidence moderate: the drafter's reasoning is stated and coherent; the finding is that it departs from Long without a rule requiring it.

**Finding 16.2 — resolved ambiguity — minor (optional preference).**
Source: "and does anything thoughtlessly and without considering what it is"
Candidate: "and does anything thoughtlessly and without considering what it is doing"
Long's "what it is" can mean "what the act is" or "what it [the soul] is doing"; the candidate picks the second. "Without considering what it is" is natural modern English.
Proposed: "and does anything thoughtlessly and without considering what it is".

Also noted, optional: "moves towards him with the intention of injuring" → "moves against him meaning to injure him" changes the direction word; Long's picture is approach with hostile intent. "moves toward him meaning to injure him" keeps it. The five ways are five, in order, with Long's pattern of repeating "the soul does violence to itself" for the first three and not the last two reproduced exactly; the abscess/tumor image kept as image; "rational animals" and "most ancient city and polity" rendered per glossary.

## II.17 — B02-P017

**Finding 17.1 — dropped connective — minor (worth improving).**
Source: "For it is according to nature, and nothing is evil which is according to nature."
Candidate: "It is according to nature, and nothing that is according to nature is evil."
The "For" answers the rhetorical question just asked ("why should a man have any fear…?"): *because* it is according to nature. Without it the last sentence is a bare assertion rather than the answer.
Proposed: "For it is according to nature, and nothing that is according to nature is evil."

**Finding 17.2 — modifier moved — minor (optional preference).**
Source: "the composition of the whole body subject to putrefaction"
Candidate: "the whole composition of the body liable to rot"
Long: the body as a whole is a compound liable to rot. Candidate: the body's entire composition is liable to rot. Near-equivalent, but the move is unforced.
Proposed: "the composition of the whole body liable to rot".

**Finding 17.3 — flat rendering of a working phrase — minor (optional preference).**
Source: "life is a warfare and a stranger's sojourn"
Candidate: "life is a war and a stranger's stay"
"A stranger's stay" is not quite idiomatic (a "stay" is a visit; the point is living as a foreigner). "Sojourn" is literary but current and the general reader knows it; the brief says to keep concise language that already works.
Proposed: "life is a war and a stranger's sojourn".

Everything else is present: all seven predicates in order, the four "in a word" summaries, the question and one-word answer, the six things philosophy consists in (unharmed; above pains and pleasures; nothing without purpose; nothing false or hypocritical; needing nothing from another; accepting what happens as from the same source; awaiting death cheerfully), the elements argument, and the manuscript note rendered "Written at Carnuntum." per glossary.

---

## Summary

| Severity | Count | Paragraphs |
|---|---|---|
| **Substantive** (must fix) | **5** | II.2 (2.1), II.6 (6.1), II.12 (12.1, 12.2), II.14 (14.1) |
| **Minor** (drafter's discretion) | **20** | II.1 (1.1, 1.2, 1.3), II.2 (2.2, 2.3), II.3 (3.1), II.5 (5.1, 5.2), II.7 (7.1), II.10 (10.1, 10.2, 10.3), II.12 (12.3), II.14 (14.2), II.15 (15.1), II.16 (16.1, 16.2), II.17 (17.1, 17.2, 17.3) |
| No material issue | 5 | II.4, II.8, II.9, II.11, II.13 |

Classification of the 25 findings, each counted once: resolved ambiguity / certainty / quantity 7 (2.1, 2.2, 6.1, 10.3, 12.2, 14.1, 16.2); dropped connective 5 (1.1, 3.1, 12.3, 15.1, 17.1); added content 1 (1.3); glossary inconsistency 2 (1.2, 2.3); imagery replaced 1 (12.1); voice 1 (16.1); other wording 8 (5.1, 5.2, 7.1, 10.1, 10.2, 14.2, 17.2, 17.3). No expansions (per-paragraph word ratios 0.88–1.06; the two above 1.0, II.2 and II.6, are from sentence-splitting and the added "much longer", not from explanation). No archaism left that obstructs a general reader. No drift into advice, moral lesson or explanation addressed to a modern audience anywhere in the book. No phrase identified as imported from another translation; I did not compare against copyrighted translations and claim nothing about them.

### Chapter-level findings (from the continuous read)

1. **Connectives.** The one systematic habit in the draft is dropping Long's "For", "But" and "however" at sentence starts (II.1, II.3, II.11, II.12, II.14, II.15, II.17). Each drop is small; together they turn Marcus's chains of inference into sequences of assertions, which is a voice change as much as a fidelity one: his reflections argue with himself. The drafter should restore the connective wherever it carries an inference (the five listed as findings), and may leave it out where it is merely Long's Victorian sentence-linking (II.11 "But neither…", II.14 "For a man cannot lose…").
2. **Terminology.** Three consistency points: the glossary's "share of the divine" (1.2); Long's "dissatisfied/dissatisfaction" rendered "resent" in II.2 but "discontent" in II.13 (2.3); and the II.12/II.17 "vapor" echo (12.1). All else in the glossary table is applied consistently: "the ruling part", "the god within", "the nature of the whole", "providence", "according to nature / against nature", "unsocial", "impulse", "opinion", "principles", "rational beings", "the oldest city and commonwealth", "kinsman/kinship", "the elements / dissolution", "fame after death".
3. **Dagger passages.** II.6 and II.14 are left as obscure as Long has them, correctly. II.12 is not (12.2).

### Flow judgement

Read straight through, the candidate sounds like one voice, and it is Marcus's: compact, self-addressed, imperative, with the lists and the hard images (puppet strings, teeth, abscess, stream, vapor) left as images. The short sections stay short; nothing is padded; no sentence explains Marcus to a reader or turns him into a coach. Sentence order is modernised where Long's periods tangle (II.8, II.11) without altering what follows from what, and the transitions between meditations feel like the source's abrupt cuts, not smoothed. The weaknesses are of one kind: small quiet decisions that make Long slightly more definite than he is (never / much longer / turns out / how…when it does) and slightly less argued than he is (the dropped "For"s). Fix the five substantive items and the flow is unaffected; apply the connective restorations and the book reads as a sequence of reasonings rather than of maxims, which is closer to Long.

### Verdict

**Accept after corrections.** The five substantive findings must be applied in `candidate-v2.json`; the minor findings are at the drafter's discretion, with 1.2, 2.3, 3.1, 7.1, 10.1, 10.2, 15.1, 16.1 and 17.1 recommended.

### Coverage and limitations

- Every paragraph II.1–II.17 was read source-beside-candidate in packet order with the supplied context, then the whole candidate was read continuously. Every Long clause was checked for presence, including qualifiers, negations and list lengths.
- The review is against Long's English only, as instructed. Where I note that an alternative reading of Long is available (2.2, 16.1), the confidence given reflects that; I did not consult the Greek to adjudicate, and the candidate is not required to match the Greek over Long.
- No other translation was consulted, so "imported rendering" could only have been caught where a phrase departs from Long in a way Long's own words do not explain; none was found. Absence of such a finding is not proof.
- The mechanical checks were re-run and passed; word ratios were used only as a screening signal.
- Errors can remain; this review does not claim otherwise.
