# Independent review — Meditations, Book IV, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer subagent spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-11 |
| Branch | `claude/meditations-modern-en-20260911-v2` (worktree at commit `549b06085`) |
| Candidate | `book4/candidate-v1.json`, sha256 `d85924d15db06abeee303c86e0cc9530c832f6c82561dc31fd0ce89ad5720648` (recomputed locally with `sha256sum` and again inside the package check; matches `provenance.json` and the expected value in `README.md`) |
| Source | George Long 1862, `book4/source-book4.json` (sha256 `eeef63f6…`, matches `provenance.json`), byte-identical to chapter 4 of `../meditations-original-en.staged.json` (sha256 `b0ecf3da…`, the rebuilt file, matches `provenance.json`). The dagger positions were confirmed in `source/pg15877-long-1862.txt`, where Long's dagger is printed `+`: ten marks in Book IV — IV.18 after "Agathon", IV.19 ×3 (after "except", after "has", and at the broken ending "else ... +."), IV.30 after "learning,", IV.34 after "thread", IV.46 ×2 (after "and that", and at the end), IV.50 after "value.", IV.51 after "trouble,". (`continuity.md` counts nine; the PG text has three in IV.19, not two. The clauses the instructions name cover all ten.) |
| Packets reviewed | `review-packets/packet-01.md` … `packet-17.md`, in order, three paragraphs at a time with the supplied context; then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md` (including the five Book IV rows), `WORKFLOW.md` (Anders's voice rules), `review-instructions.md`, `continuity.md`; `book2/`, `book1/` and `book3/` `review/findings-v1.md` and `ACCEPTANCE.md` read first for calibration; ledger decisions D8, D10, D11, D12 |

Mechanical checks from `book4/README.md` were re-run before reading: hash, paragraph count (51 = 51, IV.1–IV.51), numbering, no `[Illustration` anywhere in the staged file, packet coverage (B04-P001…P051 each exactly once, in order), packet text identical to the JSON, readable copy identical to the JSON, and the nine named dagger clauses present verbatim in source and candidate. All passed. Per-paragraph word ratios 0.83–1.10; the two lowest (IV.41 0.83, IV.45 0.91) are dropped cross-references, the highest (IV.27 1.10) is the recorded "in sympathy with one another"; nothing is padded and nothing is cut.

Severity: **substantive** = must be fixed before acceptance (review-instructions "Must fix"). **minor** = drafter's discretion ("Worth improving" or "Optional preference", stated in each entry). Every proposed wording stays inside Long's words and the glossary. Confidence is stated where a plausible alternative reading exists. "Also noted" points inside entries are not numbered findings.

---

## IV.1 — B04-P001

**Finding 1.1 — Long's plain verb replaced by one with a different current sense — minor (optional preference).**
Source: "it soon appropriates to itself the matter which is heaped on it, and consumes it"
Candidate: "it soon takes over the matter heaped on it, and consumes it"
"Appropriates to itself" means makes its own, absorbs into itself, which is what fire does to fuel and what the sentence needs ("makes a material for itself out of what opposes it"). "Takes over" in current English means assumes control of (a company, a job), and for a moment the reader has fire managing the fuel rather than absorbing it. Nothing is lost in the argument; the image wobbles for one phrase.
Proposed: "it soon makes the matter heaped on it its own, and consumes it" (Long's sense in Long's register; "makes … its own" is the plain equivalent of "appropriates to itself").
Confidence moderate; low stakes.

Also noted: the tense decision `continuity.md` asks a reviewer to rule on — Long's "the events which happened" beside "always … adapts" — is correctly taken as the general present ("the events that happen"); Long's past tense is not doing work, and the PG footnote he attaches to this sentence concerns "towards its purpose", not the tense. "Extinguished" → "put out" and "that which is possible and is presented to it" kept; "under certain conditions, however" kept; the whole fire image (a small light put out; a strong fire consuming what is heaped on it and rising higher) is intact.

## IV.2 — B04-P002

No material issue found.

(Word for word Long's, which is already modern; not expanded.)

## IV.3 — B04-P003

**Finding 3.1 — two Long verbs collapsed into one, producing a repeat within the sentence — minor (optional preference).**
Source: "which, as soon as thou shalt recur to them, will be sufficient to cleanse the soul completely, and to send thee back free from all discontent with the things to which thou returnest"
Candidate: "which, as soon as you return to them, will be enough to cleanse the soul completely, and to send you back free from all discontent with the things you return to"
Long has two verbs: you *recur to* your principles, and are sent back to the things you *return to*. The candidate uses "return" for both, so the sentence now says "return to them … send you back … the things you return to", three homing movements with the same word in one clause, and the distinction between going back to the principles and going back to daily things is flattened. "Recur to" is dated; "turn to" is not, and it is the verb the candidate itself uses at the end of the paragraph ("readiest to your hand to turn to").
Proposed: "which, as soon as you turn to them, will be enough to cleanse the soul completely, and to send you back free from all discontent with the things you return to".
Confidence moderate; the meaning survives either way.

Everything else in Long's 557 words is present in his order: the retreats (houses in the country, seashores, mountains) and "you too"; "the most common sort of men"; "nowhere … with more quiet or more freedom from trouble"; "perfect calm" and "calm is nothing else than the good ordering of the mind" (glossary); "brief and fundamental"; the three "But perhaps" objections each with its answer and each closed by "and be quiet at last" (Long's three bracketed ones folded to match his unbracketed fourth, exactly as `continuity.md` records); the three-part answer to the badness of men (rational beings exist for one another; to endure is a part of justice; men do wrong involuntarily) and the dead reduced to ashes; "providence or atoms, a chance concurrence of things" with Long's gloss kept as a gloss; the world as "a kind of political community"; the mind not mingling with the breath "whether it moves gently or violently" (the "it" attaches to the breath, as Long's participle does); pain and pleasure; the chaos of infinite time on each side of the present, the emptiness of applause, the changeableness and lack of judgment of those who praise, the narrowness of the space; the earth a point, the corner, the few, "what kind of people"; "as a man, as a human being, as a citizen, as a mortal"; the two things to keep ready, in Long's order and with his reasons (things external and immovable; our disturbances from the opinion within — glossary "perturbations → disturbances", checked as the instructions ask, and it imposes no modern reading; all things change and will no longer be); "The universe is transformation: life is opinion." verbatim. The four dialogue dashes are kept. "Recall to your mind" now appears twice where Long varies ("mind" / "recollection"); `continuity.md` records the reason and the repeat is Long's own first phrase, so no finding. "These, which are two" → "these two" drops nothing.

## IV.4 — B04-P004

**Finding 4.1 — added article makes a mass noun countable — minor (optional preference).**
Source: "a portion given to me from certain earth"
Candidate: "a portion given to me from a certain earth"
Long's "certain earth" (no article) means some earth, a particular quantity of the element; the parallel members are "from another element" and "from some peculiar source". "A certain earth" makes "earth" a countable thing — a reader can hear "a particular planet" — and the sentence is about the four elements. Long's phrase is old-fashioned but not obscure.
Proposed: "a portion given to me from certain earth" (Long's own), or "from some earth" (the same sense; "some" is Long's word two members later).
Confidence moderate; low stakes.

The "if this is so" chain is kept as six links in Long's order (intellectual part common → reason common → the commanding reason common → common law → fellow citizens → members of some political community → the world in a way a state; "in a way" per the glossary); the rhetorical question "of what other common political community"; "from there, from this common political community, come also our very intellectual faculty and reasoning faculty and our capacity for law" (the three faculties kept as three; Long's singular verb correctly made plural); "or where else do they come from?"; the parenthesis "(for nothing comes out of what is nothing, as nothing also returns to non-existence)" kept as a parenthesis; the conclusion "so also the intellectual part comes from some source". Argument intact.

## IV.5 — B04-P005

No material issue found.

(Two-part definition kept: "a composition out of the same elements, and a decomposition into the same"; "not a thing of which any man should be ashamed"; both halves of the closing pair rendered with the glossary's "against" so Long's parallel stays parallel, as `continuity.md` records; "[the nature of]" folded; "rational being" per glossary. Also noted: "generation" → "birth" narrows Long's word slightly — "generation" is coming-into-being generally — but "birth" is the plain reading of a sentence about a body composed out of the elements, and `continuity.md` records the choice. No change proposed.)

## IV.6 — B04-P006

No material issue found.

(The fig tree's juice kept as the image; "if a man will not have it so" kept; "both you and he will be dead; and soon not even your names will be left behind" — Long's plural "your" kept. Long's comma splice made a semicolon.)

## IV.7 — B04-P007

No material issue found.

(The two-step argument kept in Long's order — take away the opinion, the complaint goes; take away the complaint, the harm goes — with the complaint "I have been harmed" quoted both times in Long's double quotation marks. Not expanded.)

## IV.8 — B04-P008

No material issue found.

(One sentence; "either from without or from within" kept as the pair.)

## IV.9 — B04-P009

No material issue found.

(One line, 14 words for Long's 15; "[universally]" folded as the glossary allows. Not expanded and not explained: "compelled to do this" stays as bare as Long leaves it.)

## IV.10 — B04-P010

No material issue found.

(The "I do not say only … but" qualification kept; "as if it were done by one who assigns to each thing its value" kept; "do it together with this, being good, and in the sense in which a man is properly understood to be good" carries Long's "in conjunction with this, the being good" with the "and in the sense in which" clause intact; "Keep to this in every action" bare.)

## IV.11 — B04-P011

No material issue found.

(The three-way contrast — the wrongdoer's opinion, the opinion he wishes you to have, things as they are in truth — kept.)

## IV.12 — B04-P012

No material issue found.

(Two rules kept as two, with Long's shift from "A man should" to "your opinion" preserved; "the ruling and legislating part" and "for the common good" per glossary and `continuity.md`; the closing restriction "only from a certain persuasion … not because it appears pleasant or brings reputation" kept. Also noted, optional: "whatever … may suggest" → "what … suggests" drops Long's modal; in modern idiom "whatever the reason … suggests" is the same generic statement, so nothing is lost.)

## IV.13 — B04-P013

No material issue found.

(Three short questions and the answer "I have." kept with Long's dash; "what else do you want?" for "what else dost thou wish?" is the plain equivalent. Not expanded.)

## IV.14 — B04-P014

No material issue found.

(Three sentences kept as three; "generative principle" and "transformation" per the new glossary rows, checked as the instructions ask — neither imposes a modern reading, and "generative" says what "seminal" said. "But rather" → "or rather" is the current form of Long's self-correction.)

## IV.15 — B04-P015

No material issue found.

(Word for word Long's; the grains of frankincense on the altar kept as the image; not expanded.)

## IV.16 — B04-P016

No material issue found.

(One sentence; the beast and the ape kept; "the worship of reason" kept; the condition "if you return to your principles" kept as a condition.)

## IV.17 — B04-P017

No material issue found.

(Three sentences of Long's, pronouns only changed. "While you live, while it is in your power, be good." — the one-line saying is not expanded or softened.)

## IV.18 — B04-P018

No material issue found.

(The dagger clause "as Agathon says" stands verbatim; "look not round" → "do not look round" modernises only the negation; "the depraved morals of others" and "run straight along the line without deviating from it" kept. The "not … but only" structure of the first half kept.)

## IV.19 — B04-P019

**Finding 19.1 — Long's "also" dropped from the second link of the chain — minor (worth improving).**
Source: "every one of those who remember him will himself also die very soon; then again also they who have succeeded them, until the whole remembrance shall have been extinguished"
Candidate: "every one of those who remember him will himself also die very soon; then again those who succeeded them, until the whole remembrance has been extinguished"
Long's chain is: the rememberers will themselves also die; then their successors also; until the memory is gone. The second "also" is what carries the elided verb — "then again also they who have succeeded them [will die]" — and marks the successors as the next link in the same series. Without it, "then again those who succeeded them" hangs: a reader has to supply both the verb and the point (that they, too, die). The candidate's tense change ("have succeeded" → "succeeded") is fine.
Proposed: "then again also those who succeeded them, until the whole remembrance has been extinguished" (Long's "also" in Long's place; or "then again those also who succeeded them").
Confidence moderate-to-high: the sentence is not wrong without "also", but it is harder than Long's.

The rest is complete: "vehement desire" kept, "fame after death" per glossary, "passed on through men who foolishly admire and perish", the "But suppose … even immortal" concession with both its clauses (the rememberers immortal; the remembrance immortal), "what then is this to you?", "And I do not say what is it to the dead, but what is it to the living?" (Long's dead/living distinction intact). The two dagger clauses stand verbatim: "What is praise, except indeed so far as it has a certain utility?" and "clinging to something else...." with Long's four dots; nothing is supplied at the lacuna.

## IV.20 — B04-P020

No material issue found.

(The argument kept in Long's steps: beautiful in itself and ending in itself, praise not part of it; therefore neither worse nor better by being praised; the same affirmed of the things "called beautiful by the common sort of men" (new glossary row; "material things and works of art" kept as the examples); "has no need of anything; no more than law, no more than truth, no more than kindness or modesty" — Long's "not more than" correctly rendered as the comparative "no more than", and the four terms kept; the two questions; the emerald, and the list gold, ivory, purple, a lyre, a little knife, a flower, a shrub, all seven in order. "Benevolence" → "kindness" per the Book I family. The PG caption is gone at source, as `continuity.md` records.)

## IV.21 — B04-P021

No material issue found.

(The reply to "how does the air contain the souls" is kept as Long builds it: the counter-question about the earth and the buried bodies; the analogy — as bodies change and dissolve and make room, so souls removed into the air, after existing for some time, are transformed and diffused and take on a fiery nature by being received into the generative intelligence of the universe, and so make room for fresh souls; "And this is the answer a man might give on the hypothesis that souls continue to exist"; then the extension to the animals eaten daily by us and the other animals — "we must think not only of … but also of" kept as the pair — with the exclamation "what a number is consumed, and so in a way buried in the bodies of those who feed on them!"; the earth receiving them through changes into blood and transformations into the aerial or the fiery element; and the closing method question with its answer "The division into that which is material and that which is the cause of form." New glossary rows applied ("change", "transformed", "generative intelligence") and checked as the instructions ask; none imposes a modern reading. "[of these bodies]" folded; "[the formal]" dropped under D11 as an alternative label, and "(vii. 29.)" dropped as apparatus, both listed in `continuity.md`. "Their transformations" adds a possessive Long implies; harmless.)

## IV.22 — B04-P022

**Finding 22.1 — one Long word rendered two ways within the book, and the whirl image loosened — minor (optional preference).**
Source: "Do not be whirled about, but in every movement have respect to justice"
Candidate: "Do not be whirled about, but in every impulse have regard to justice"
The glossary licenses "movement (in the sense of impulse) → impulse", and `continuity.md` records that the choice was made here because the meditation is about action. The reading is the natural one. Two things count the other way. First, Long opens with a motion image — "whirled about" — and "in every movement" continues it; "in every impulse" breaks the link between the two halves of the sentence. Second, Long's "movement" occurs twice in Book IV and the candidate renders it "impulse" here but "movement" in IV.40 ("all things act with one movement"), where `continuity.md` deliberately leaves the sense open. Ledger D10 prefers one rendering for one Long word within a book. Keeping "movement" here would leave IV.22 exactly as open as Long leaves it and as IV.40 is left, at no cost to the reader, who has just been told not to be whirled about.
Proposed: either leave as is (glossary-conformant and recorded), or "but in every movement have regard to justice" with a `continuity.md` note that IV.22 and IV.40 both keep Long's word.
Confidence moderate; this is a classification question, not a fidelity error.

Otherwise complete: "on the occasion of every impression maintain the faculty of comprehension" kept ("impression" per glossary; Long's "maintain" kept); "[or understanding]" dropped under D11 and listed.

## IV.23 — B04-P023

No material issue found.

(Four sentences kept as four; the three "O Universe / O Nature" addresses kept without added quotation marks; "from you are all things, in you are all things, to you all things return" kept as the triad; "The poet says, Dear city of Cecrops; and will you not say, Dear city of Zeus?" kept. "Everything harmonizes with me that is in harmony with you" carries Long's "harmonious to thee" in current English.)

## IV.24 — B04-P024

No material issue found.

(The saying of "the philosopher" kept and then questioned with Long's dash; "Do what is necessary, and whatever the reason of the being that is naturally social requires, and as it requires" — glossary "social being", and Long's "and as it requires" kept; "not only the calm that comes from doing well, but also the calm that comes from doing few things" — the noun repeated for Long's "that which", recorded in `continuity.md`, and the "not only … but also" pair intact; "more leisure and less uneasiness"; the self-question "Is this one of the unnecessary things?"; and the second "not only … but also" (acts / thoughts) with its consequence "for then superfluous acts will not follow after". "Tranquil / tranquillity" → "calm" per glossary, three times.)

## IV.25 — B04-P025

No material issue found.

(One sentence; "satisfied with his portion out of the whole, and satisfied with his own just acts and kind disposition" — Long's two "satisfied"s kept, "the whole" kept, "benevolent" → "kind" per the Book I family.)

## IV.26 — B04-P026

No material issue found.

(Long's run of short sentences kept sentence for sentence, in order, none merged and none expanded: the two questions, "Do not disturb yourself." (Long's own verb, the basis of the new "disturbance" row), "Make yourself all simplicity.", the wrongdoer harming himself, "apportioned and spun out to you" (the thread image kept), "In a word, your life is short.", "You must turn the present to profit with the aid of reason and justice." (word order only), "Be sober in your relaxation.")

## IV.27 — B04-P027

No material issue found.

(The disjunction "a well-arranged universe or a chaos huddled together, but still a universe" kept; "the All" → "the whole" per the new glossary row; "sympathetic" → "in sympathy with one another", checked as the instructions ask: the three added words restore the Stoic sense Long's adjective had in 1862 and the modern adjective no longer has (feeling for someone), and impose no psychological reading; `continuity.md` records the addition and the word ratio it causes. "So separated and diffused and in sympathy with one another" keeps Long's three-adjective rhythm.)

## IV.28 — B04-P028

No material issue found.

(Long's twelve-word list of characters kept word for word, in order: black, womanish, stubborn, bestial, childish, animal, stupid, counterfeit, scurrilous, fraudulent, tyrannical — with "character" repeated three times as Long has it. Not expanded, not softened.)

## IV.29 — B04-P029

No material issue found.

(Every member of Long's catalogue kept in order: the two strangers (what is in the universe / what is going on in it); the runaway from social reason; the blind man who shuts the eyes of the understanding; the poor man who has need of another; the abscess on the universe, with the cause "through being displeased with the things that happen" and the reason "for the same nature produces this, and has produced you too" (Long's singular kept, as recorded); the piece torn off from the state who tears his own soul away from that of rational beings, "which is one". "Rent asunder" → "torn off", "flies" → "flees"; the PG stray comma dropped. Also noted: "the eyes of understanding" → "the eyes of the understanding" adds an article; harmless.)

## IV.30 — B04-P030

No material issue found.

(The three figures kept — without a tunic, without a book, half naked — with Long's two colons; "I have no bread, he says, and I abide by reason" (word order only); Long's dash; the dagger clause "I do not get the means of living out of my learning" stands verbatim; "[by my reason]" folded to "and I abide by my reason". Nothing is made clearer than Long leaves it.)

## IV.31 — B04-P031

No material issue found.

(One sentence; "poor as it may be" kept; "entrusted to the gods with his whole soul all that he has"; "neither the tyrant nor the slave of any man" kept as the pair.)

## IV.32 — B04-P032

No material issue found.

(Long's list of what people are doing in the times of Vespasian kept at the same length and in the same order — marrying, bringing up children, sick, dying, making war, feasting, trading, cultivating the ground, flattering, obstinately arrogant, suspecting, plotting, wishing for some to die, grumbling about the present, loving, heaping up treasure, desiring the consulship, kingly power — eighteen items; "that life of these people no longer exists at all"; the move to Trajan with "Again, all is the same. Their life too is gone."; the other epochs and whole nations "resolved into the elements"; "But chiefly … those you have yourself known" with all three of their failings (distracting themselves over idle things; neglecting what was in accordance with their proper constitution; failing to hold firmly to this and be content with it); "the attention given to everything has its proper value and proportion"; "For then you will not be discontented" (glossary) "if you apply yourself to smaller matters no further than is fitting". "Warring" → "making war", "trafficking" → "trading", "remove to" → "move on to" are the recorded modernisations and lose nothing.)

## IV.33 — B04-P033

**Finding 33.1 — Long's current verb replaced by a non-idiomatic one — minor (worth improving).**
Source: "What then is that about which we ought to employ our serious pains?"
Candidate: "What, then, is that on which we ought to spend our serious pains?"
"Employ … pains" is Long's phrase and is still current English (one employs one's efforts on something). "Spend … pains" is not an English collocation — pains are taken, spared or employed, not spent — and the reader hears a small wrongness at the one point in the paragraph where Marcus turns from the vanished names to the one thing worth effort. The reordered preposition ("on which") is fine.
Proposed: "What, then, is that on which we ought to employ our serious pains?"
Confidence high on the collocation; the alternative "take serious pains over" would also be idiomatic but departs further from Long.

The rest is complete: the antiquated words and names, the nine names in Long's spellings and grouping (Camillus, Caeso, Volesus, Leonnatus; "a little after also" Scipio and Cato; "then" Augustus; "then also" Hadrianus and Antoninus); "a mere tale", "complete oblivion soon buries them"; "And I say this of those who have shone in a wondrous way"; "For the rest … no man speaks of them"; "what is even an eternal remembrance? A mere nothing."; and the closing four-part answer — thoughts just, acts social, words that never lie, a disposition that gladly accepts all that happens — with Long's three "as" phrases ("as necessary, as usual, as flowing from a principle and source of the same kind"). "In a manner" → "in a way" per glossary.

## IV.34 — B04-P034

No material issue found.

(One sentence; Clotho kept, "[one of the fates]" folded with Long's lowercase; the dagger clause "into whatever things she pleases" stands verbatim with "thy thread" → "your thread" before it, exactly as the instructions specify.)

## IV.35 — B04-P035

No material issue found.

(One line, 14 words for Long's 16; "both what remembers and what is remembered" keeps the pair. Not expanded.)

## IV.36 — B04-P036

No material issue found.

(The argument kept: all things by change; the nature of the universe (Long's phrase here, correctly not converted to "the nature of the whole", as `continuity.md` records) loves nothing so much as to change the things that are and to make new things like them; "everything that exists is in a way the seed of what will be" (glossary "in a way"; "seed" itself kept, as the glossary row specifies); the correction "But you are thinking only of seeds that are cast into the earth or into a womb: but this is a very commonplace notion" (new glossary row). Long's two "but"s kept.)

## IV.37 — B04-P037

No material issue found.

(One sentence with all five "nor" members kept in order — not yet simple; nor free from disturbances (new glossary row); nor without suspicion of being hurt by external things; nor kindly disposed toward all; nor placing wisdom only in acting justly. "You will soon die" first, as Long has it.)

## IV.38 — B04-P038

No material issue found.

(One sentence; "ruling principles" → "ruling parts" per the glossary's single rendering; "even those of the wise" kept; "what kind of things they avoid, and what kind they pursue" kept as the pair.)

## IV.39 — B04-P039

No material issue found.

(The argument about where evil is and is not is kept step by step: not in the ruling part of another; not in any turning and change of your bodily covering (new glossary row "mutation → change"); "Where is it, then?"; in the part that forms opinions about evils; "Let this power, then, not form such opinions, and all is well" ("[such]" folded); the body "cut, burnt, filled with matter and rottenness" kept as the concrete detail; "let the part that forms opinions about these things be quiet"; the definition "that is, let it judge that nothing is either bad or good which can happen equally to the bad man and the good"; and the closing principle with its four "nature" phrases, "against nature" per glossary in all three places. "Subsist" → "exist" twice.)

## IV.40 — B04-P040

**Finding 40.1 — a structure noun rendered as a process noun — minor (optional preference).**
Source: "observe too the continuous spinning of the thread and the contexture of the web"
Candidate: "observe too the continuous spinning of the thread and the weaving of the web"
Long's pair is a process and its product: the spinning (ongoing) and the contexture (the woven structure that results — how the threads are interlaced). "Weaving" makes both halves processes, and the closing image loses its second term. "Contexture" is obscure; "weave" as a noun ("the weave of the web") says what "contexture" says in a current word.
Proposed: "observe too the continuous spinning of the thread and the weave of the web".
Confidence moderate; the image is recognisable either way.

Otherwise complete: one living being, one substance and one soul; all things referred to one perception; "all things act with one movement" (kept as Long has it, left open between motion and impulse — see 22.1); "the cooperating causes of all things that exist"; the thread and the web.

## IV.41 — B04-P041

No material issue found.

(The one-line saying is not expanded: "You are a little soul carrying about a corpse, as Epictetus used to say." The attribution to Epictetus — the citation as Marcus makes it — is kept in full; only Long's bracketed reference "(i. c. 19)" is dropped, which is apparatus under the glossary's rule and is listed in `continuity.md`, consistent with the accepted Books I–III. "Bearing about" → "carrying about" is the current verb for the same act.)

## IV.42 — B04-P042

No material issue found.

(One line, the same length as Long's; the two halves ("no evil … no good") kept as the pair; "subsist in consequence of change" → "exist as a result of change" says the same thing.)

## IV.43 — B04-P043

No material issue found.

(Time as a river kept as the image with all its parts: made up of the events that happen; a violent stream; seen, carried away, another in its place, that too carried away. Not expanded.)

## IV.44 — B04-P044

**Finding 44.1 — Long's current verb weakened — minor (optional preference).**
Source: "and whatever else delights fools or vexes them"
Candidate: "and whatever else delights fools or annoys them"
The list this closes is disease, death, slander and treachery, and the pair "delights … or vexes" spans the whole range of what befalls fools. "Vexes" is current English and covers real distress; "annoys" is the word for small irritations, and after "death" it understates. The glossary's "vexed → resent" row is for Marcus being vexed *at* what happens (resentment), which is why `continuity.md` reaches instead for the Book I "annoy" family here; but Long's transitive "vexes" needs no replacement at all.
Proposed: "and whatever else delights fools or vexes them" (Long's own word, current).
Confidence moderate; drafter's discretion, and if "annoys" is kept for cross-book consistency no continuity change is needed.

Otherwise complete: "as familiar and well known as the rose in spring and the fruit in summer" kept as the image; the four nouns kept in order; "calumny" → "slander".

## IV.45 — B04-P045

No material issue found.

(The argument kept with its two contrasts: not "a mere enumeration of disjointed things, which has only a necessary sequence" but "a rational connection"; and "no mere succession, but a certain wonderful relationship" — sequence and cause kept apart as Long keeps them; "aptly fitted"; "arranged together harmoniously". The cross-references "(vi. 38; vii. 9; vii. 75, note)" dropped as apparatus and listed. "Exhibit" → "show".)

## IV.46 — B04-P046

No material issue found.

(Heraclitus's chain kept in order — earth → water → air → fire — "and the reverse" for "and reversely"; "him who forgets where the way leads"; "men quarrel with that with which they are most constantly in communion, the reason that governs the universe"; "the things they meet with daily seem to them strange". Both dagger clauses stand verbatim: "we ought not to act and speak as if we were asleep, for even in sleep we seem to act and speak" and "like children who learn from their parents, simply to act and speak as we have been taught". Nothing made clearer than Long.)

## IV.47 — B04-P047

No material issue found.

(The god's two-day announcement, "the third day or tomorrow", "unless you were mean-spirited in the highest degree" (word order only), "for how small the difference is!", and the conclusion "no great thing to die after as many years as you can name rather than tomorrow" — all present; "to-morrow" and "the morrow" both → "tomorrow".)

## IV.48 — B04-P048

No material issue found.

(The catalogue of the dead kept complete and in order: physicians "after often contracting their eyebrows over the sick" (Long's image kept), astrologers "with great pretensions", philosophers "after endless discourses on death or immortality", heroes "after killing thousands", tyrants "with terrible insolence, as if they were immortal", cities "entirely dead, so to speak" — Helice and Pompeii and Herculaneum, "and others innumerable"; "Add to the reckoning all whom you have known, one after another"; the burial chain "and all this in a short time"; "how ephemeral and worthless human things are"; "what was yesterday a little mucus will tomorrow be a mummy or ashes" (Long's clause order only); "according to nature" per glossary; the olive falling ripe, "blessing nature who produced it, and thanking the tree on which it grew", with Long's "who" kept.)

## IV.49 — B04-P049

No material issue found.

(The promontory kept as the image with "tames the fury of the water around it"; the self-question and answer "Am I unhappy … ? Not so; rather, I am happy" (word order only); "because I continue free from pain, neither crushed by the present nor fearing the future"; the key quantifier correctly modernised — Long's "every man would not have continued" now reads as "no man", and "not every man would have continued" is what Long means — so the reason why what happened is not a misfortune (it could have happened to anyone; not everyone would have borne it) is intact; "Why, then, is that rather a misfortune than this a good fortune?"; the two "deviation from man's nature" questions with "not contrary to the will of man's nature" kept (Long's phrase, correctly not converted); "Well, you know the will of nature."; the virtues in Long's order — just, magnanimous, temperate, prudent, secure against rash opinions and falsehood ("inconsiderate" → "rash", the right current word for opinions formed without consideration), modesty, freedom, "and everything else by the presence of which man's nature obtains all that is its own"; and the closing principle "not that this is a misfortune, but that to bear it nobly is good fortune", with "vexation" → "resentment" per the glossary family.)

## IV.50 — B04-P050

No material issue found.

(The argument on the interval kept in Long's steps: the "commonplace, but still a useful help" (new glossary row); those who "clung tenaciously to life"; "What more, then, have they gained than those who died early?"; the four names in Long's spellings, "who carried out many to be buried, and then were carried out themselves"; "the interval between birth and death is small" ("[between birth and death]" folded); the three "with how much trouble, and in company with what sort of people, and in what a feeble body"; the dagger sentence "Do not then consider life a thing of any value." verbatim; the immensity of time behind and the boundless space before; and the closing question "three days … three generations". Also noted: the verbatim dagger sentence keeps Long's "Do not then" without commas while the candidate elsewhere writes "then" between commas ("What more, then,"; "In this infinity, then,"); this is the price of the verbatim rule and needs no action.)

## IV.51 — B04-P051

No material issue found.

(Three clauses of Long's kept: the short way; "the short way is the natural one"; "say and do everything in conformity with the soundest reason"; and the dagger sentence "For such a purpose frees a man from trouble, and warfare, and all artifice and ostentatious display." verbatim. Also noted, optional: "Always run to the short way" → "Always run by the short way" changes Long's preposition — his "to" is choose the short road, the candidate's "by" is travel along it; the same road is taken either way, and "run by the short way" is the more natural modern phrase. No change proposed.)

---

## Summary

| Severity | Count | Paragraphs |
|---|---|---|
| **Substantive** (must fix) | **0** | — |
| **Minor** (drafter's discretion) | **8** | IV.1 (1.1), IV.3 (3.1), IV.4 (4.1), IV.19 (19.1), IV.22 (22.1), IV.33 (33.1), IV.40 (40.1), IV.44 (44.1) |
| No material issue | 43 | IV.2, IV.5–IV.18, IV.20, IV.21, IV.23–IV.32, IV.34–IV.39, IV.41–IV.43, IV.45–IV.51 |

Of the 8 minor findings, 2 are "worth improving" (19.1 a dropped "also" that carried the elided verb; 33.1 "spend our serious pains", not an English collocation) and 6 are "optional preference" (1.1 "takes over", 3.1 return/return, 4.1 "a certain earth", 22.1 impulse/movement, 40.1 weaving/contexture, 44.1 annoys/vexes). Classification, each counted once: dropped clause 0; dropped word 1 (19.1, an "also"); added content 0 (the only added words — "with one another" in IV.27, "the" in IV.29, "their" in IV.21, "a" in IV.4 — are glosses or articles, all but 4.1 harmless and 4.1 counted under "other"); resolved ambiguity 1 (22.1, and only relative to IV.40 within the same book); expansion 0; voice drift 0; glossary inconsistency 0 (every glossary row met in Book IV is applied consistently, including the five new rows; the one same-word-two-ways case, 22.1, is licensed by the glossary's sense distinction); imported rendering 0; archaism left 0; other 6 (1.1, 3.1, 4.1, 33.1, 40.1, 44.1 — each a place where Long's already-current word was swapped for a near-synonym that says slightly less or slightly else). All nine named dagger clauses (ten dagger marks) stand verbatim as the instructions require. No short section is expanded: IV.2, IV.9, IV.15, IV.17, IV.35, IV.41, IV.42 are at or under Long's length. No drift toward advice, moral lesson, or explanation for a modern reader anywhere in the book; the imperatives stay bare ("be good"; "Do not disturb yourself"; "Be sober in your relaxation"; "Always run by the short way"). No phrase identified as imported from another translation; I did not compare against other translations and claim nothing about them. The five new glossary rows read naturally in every place they are applied: "disturbances" (IV.3, IV.37), "generative principle / intelligence" (IV.14, IV.21), "change / transformation / transformed" beside Long's own uses of the same words (IV.3, IV.14, IV.21, IV.36, IV.39, IV.42), "the common sort of men / commonplace" (IV.3, IV.20, IV.36, IV.50), "the whole" for "the All" (IV.27) beside Long's own "the whole" (IV.25).

### Chapter-level findings (from the continuous read)

1. **Connectives.** Long's inferential connectives are carried throughout: "For" opens IV.1's second sentence, the fire comparison, IV.3's "For nowhere", "For what are you discontented with?", "For the whole earth is a point", IV.4's "For of what other", IV.13's "For if this does its own work", IV.21's "For as here", IV.24's "For this brings", "For since", IV.29's "for the same nature", IV.33's "For all things soon pass away", IV.36's "For everything that exists", IV.39's "For what happens equally", IV.47's "for how small", IV.50's "For look at", IV.51's "For such a purpose". "Then" is kept everywhere Long has it, set between commas in the candidate's own sentences and unpunctuated in the two verbatim dagger sentences (IV.50; and "Do not then" is Long's). No connective added.
2. **Archaic syntax.** None left. Every "thou"-form, "not"-after-verb ("mingles not", "look not", "say not", "Bread I have not"), inverted question ("Hast thou", "dost not thou", "wilt not thou", "Unhappy am I") and "-est/-eth" verb has been recast, and each recasting keeps Long's order of ideas. Long's already-current words that the glossary does not touch are mostly kept ("vehement", "unseasonably", "magnanimous", "promontory", "insolence", "ephemeral", "abscess", "scurrilous").
3. **Terminology.** The glossary is applied consistently: "the ruling part" (IV.1, IV.12, IV.38, IV.39), "rational being(s)" (IV.3, IV.4, IV.5, IV.29), "social being / social reason" (IV.24, IV.29), "the common good" (IV.12), "opinion" (IV.3, IV.7, IV.11, IV.12, IV.26, IV.39, IV.49), "impression" (IV.22), "principles" (IV.3, IV.16, IV.49), "calm" (IV.3, IV.24), "discontent(ed)" for both "discontent" and "dissatisfied" (IV.3, IV.32), "in a way" (IV.4, IV.21, IV.33, IV.36), "according to / against nature" (IV.1, IV.5, IV.39, IV.48), "fame after death" (IV.19), "the present", "the elements", "dissolution", "kind / kindness / kindly disposed" (IV.20, IV.25, IV.37), "the whole" and "the universe" as Long has them, and Long's intelligence / understanding / mind / intellectual part kept apart (IV.3, IV.4, IV.21, IV.29). Long's phrases that are not glossary phrases are correctly left alone: "the nature of the universe" (IV.36), "not contrary to the will of man's nature" (IV.49), "the reason of our common nature" (IV.29). The five new rows are applied at every occurrence and nowhere else. The one same-word case is 22.1 (movement → impulse in IV.22, movement in IV.40), which the glossary's sense distinction permits.
4. **Long's plain words replaced.** The small pattern the Book I and Book III reviews noted recurs at the same low rate: "appropriates to itself" → "takes over" (1.1), "employ" → "spend" (33.1), "contexture" → "weaving" (40.1), "vexes" → "annoys" (44.1), "run to" → "run by" (IV.51, noted), "generation" → "birth" (IV.5, noted). Each swaps a word Long has, most of them still current, for a near-synonym that is slightly less exact; the drafter should prefer Long's word where it works. None changes what Marcus says.
5. **Short sections.** Book IV's one-liners are the book's test, and the candidate passes it: IV.2 (Long's words unchanged), IV.9 (14 words / 15), IV.15 (unchanged), IV.17 (pronouns only), IV.35 (14 / 16), IV.41 (15 / 18, the difference being the dropped reference), IV.42 (same length). Nothing is padded, glossed or softened, and the abrupt cuts between meditations are the source's own.

### Flow judgement

Read straight through from IV.1 to IV.51, the candidate is Long's Book IV with the archaisms gone and nothing else changed. The long meditations carry Long's argument sentence by sentence in Long's order: IV.3's retreat with its three "But perhaps" objections each answered and closed by "and be quiet at last", and the two things to keep ready; IV.4's six-link chain to the world as a state; IV.21's reply about the air and the souls, with its extension to the animals eaten; IV.32's eighteen-item picture of the age of Vespasian; IV.39's placing of evil; IV.48's catalogue of the dead; IV.49's promontory and the exact quantifier ("not every man would have continued") that makes its argument work; IV.50's interval. The one-line sayings stay one line and stay bare. The voice is Marcus's own throughout — self-addressed, imperative, unexplained: "Do you have reason? I have.—Why, then, do you not use it?"; "While you live, while it is in your power, be good."; "Make yourself all simplicity."; "You are a little soul carrying about a corpse." The images are all still images (fire feeding on what is thrown into it; retreats in the country and by the sea; the fig tree's juice; grains of frankincense on the altar; the beast and the ape; the emerald and the lyre; the little soul and the corpse; time as a river; the rose in spring; the olive falling ripe; the promontory and the waves; the thread and the web; Clotho spinning), and the ten dagger marks leave their clauses exactly as obscure as Long leaves them. The five new glossary renderings sit unobtrusively in the prose; a reader meeting "disturbances", "generative principle", "commonplace" and "the whole" will not notice that a decision was made. The weaknesses are all small and of one kind: a handful of places where Long's already-current word has been swapped for a near-synonym that says slightly less ("takes over", "spend our serious pains", "weaving", "annoys"), plus one dropped "also" in IV.19 that makes the chain of rememberers harder to follow than Long's. None changes what Marcus says. Apply the two "worth improving" items and the book reads as Long's Book IV in modern dress, at the standard the accepted Books I–III set.

### Verdict

**Accept after corrections.** There is no substantive finding. The book can be accepted once the drafter has considered the 8 minor findings; recommended for application: the two "worth improving" items (19.1, 33.1), and among the optional ones 44.1 and 1.1 (each restores Long's own current word). 22.1 is a classification question the drafter may settle either way with a `continuity.md` line. If the drafter prefers to accept v1 unchanged, the review does not block it, but 33.1 (a non-English collocation) should not be left unaddressed without a recorded reason.

### Coverage and limitations

- Every paragraph IV.1–IV.51 was read source-beside-candidate in packet order (17 packets, three paragraphs each) with the supplied context, then the whole candidate was read continuously. Every Long clause was checked for presence, including qualifiers, negations, quantifiers ("some" / "all" / "every" / "not every"), the "not only … but also" pairs (IV.10, IV.21, IV.24 ×2), the length and order of every list (IV.3's three objections, IV.4's six links, IV.20's seven objects, IV.28's twelve characters, IV.32's eighteen doings, IV.33's nine names, IV.37's five "nor"s, IV.48's catalogue, IV.49's virtues, IV.50's four names), and the ten dagger marks against the PG base text.
- The review is against Long's English only, as instructed. Where I note that an alternative reading of Long is available (1.1, 22.1, 40.1), the confidence given reflects that; I did not consult the Greek, and the candidate is not required to match the Greek over Long.
- No other translation was consulted, so "imported rendering" could only have been caught where a phrase departs from Long in a way Long's own words do not explain; none was found. Absence of such a finding is not proof.
- The mechanical checks were re-run and passed; word ratios were used only as a screening signal.
- Attention was held to the end: the last packets (IV.43–IV.51) were read at the same pace as the first, and three of the eight findings fall in the second half of the book.
- Errors can remain; this review does not claim otherwise.
