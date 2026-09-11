# Independent review — Meditations, Book V, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer subagent spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-11 |
| Branch | `claude/meditations-modern-en-20260911-v2` (worktree at commit `ff5d9772b`) |
| Candidate | `book5/candidate-v1.json`, sha256 `9b0619745ac72991d4680e5e88c7eae9e590aa3ad116e3308884c7f37efc5caf` (recomputed locally with `sha256sum` and again inside the package check; matches `provenance.json` and the expected value in `README.md`) |
| Source | George Long 1862, `book5/source-book5.json` (sha256 `284c37be…`, matches `provenance.json`), byte-identical to chapter 5 of `../meditations-original-en.staged.json` (sha256 `b0ecf3da…`, the rebuilt file, matches `provenance.json`); PG #15877 base text `source/pg15877-long-1862.txt` sha256 `6584df7e…` (matches). The dagger positions were confirmed in the PG text, where Long's dagger is printed `+`: seven marks in Book V — V.9 after "fail to" (line 3589), V.12 ×4 (after "anything", after "really good.", before "Thus", after "difference.", lines 3630–3634), V.28 ×2 (inside the brackets, "[+ Neither tragic actor nor whore. +]", line 3769). Seven marks, four clauses, as `continuity.md` and `review-instructions.md` say. The five base-text defects were checked at PG lines 3470, 3495, 3665, 3779, 3813. |
| Packets reviewed | `review-packets/packet-01.md` … `packet-12.md`, in order, three paragraphs at a time with the supplied context (each packet carries one CONTEXT ONLY paragraph before and after; coverage B05-P001…P036 each exactly once); then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md` (including the two Book V rows and the two extended rows), `WORKFLOW.md` (Anders's voice rules), `review-instructions.md`, `continuity.md`; `book1/`…`book4/` `review/findings-v1.md` and `ACCEPTANCE.md` read first for calibration; ledger decisions D8, D10, D11, D12 |

Mechanical checks from `book5/README.md` were re-run before reading: hash, paragraph count (36 = 36, V.1–V.36), numbering, no `[Illustration` anywhere in the staged file, packet coverage, packet text identical to the JSON, readable copy identical to the JSON, the four named dagger clauses present verbatim in source and candidate, and the V.29 ellipsis present in both. All passed. Per-paragraph word ratios 0.95–1.02; nothing is padded and nothing is cut. A word-level diff of every paragraph was also generated and read alongside the packets, so that every token Long has that the candidate does not (and the reverse) was looked at individually.

Severity: **substantive** = must be fixed before acceptance (review-instructions "Must fix"). **minor** = drafter's discretion ("Worth improving" or "Optional preference", stated in each entry). Every proposed wording stays inside Long's words and the glossary. Confidence is stated where a plausible alternative reading exists. "Also noted" points inside entries are not numbered findings.

---

## V.1 — B05-P001

**Finding 1.1 — the fourth of Long's four cognate pairs broken — minor (worth improving).**
Source: "the turner values the turning art, or the dancer the dancing art, or the lover of money values his money, or the vain-glorious man his little glory"
Candidate: "the turner values the turning art, or the dancer the dancing art, or the lover of money values his money, or the vain man his little glory"
Long's list is built on four pairs in which the person and the thing loved share a root: turner / turning art, dancer / dancing art, lover of money / money, vain-glorious man / glory. The candidate keeps the first three and breaks the fourth, so the closing member, which should land hardest, is the one that no longer rhymes with its object. "Vainglorious" is formal but current and is Long's own word (spelled solid in modern usage). Book I rendered Long's noun "vain-glory" as "vanity", which was right there (I.16 has no paired object); D10 concerns one word within a book, and Book V has only this occurrence, so nothing is disturbed.
Proposed: "or the vainglorious man his little glory".
Confidence moderate-to-high that the pairing is deliberate in Long; the sense survives either way.

Also noted, optional: "make haste" → "hurry": Long's phrase is still current and carries eagerness rather than rush; "hurry" is not wrong. No change proposed. Everything else in Long's 308 words is present in his order: the two openings ("I am rising to the work of a human being"; "for which I exist and for which I was brought into the world"), the bedclothes, the three dialogue dashes, the five creatures (plants, birds, ants, spiders, bees) and "their several parts of the universe", "action or exertion", the concession about rest with its answer, nature's bounds applied to eating and drinking and then reversed for acts ("you stop short of what you can do"), "So you do not love yourself … you would love your nature and her will", the unwashed and unfed lovers of their arts, the four pairs, "violent passion", the "rather than perfect" sentence (see the base-text rulings below: not a defect), and the closing question with "more vile in your eyes and less worthy of your labor". The PG stray comma in "that which, is" is rightly dropped. "Dissatisfied" → "discontented" per glossary.

## V.2 — B05-P002

No material issue found.

(One sentence, 24 words for Long's 25; "in all tranquillity" → "in complete calm" is the glossary's "calm" with Long's "all" as "complete". Not expanded.)

## V.3 — B05-P003

No material issue found.

("Their peculiar leading principle" → "their own ruling part" and "their peculiar movement" → "their own impulse" are the two glossary rows (the extended ruling-part row; the *hormē* sense of "movement", as IV.22 and the Book IV acceptance anticipated for this very line). "Which things do not thou regard" → "do not regard these things". The three-part close — your own nature, the common nature, "and the way of both is one" — is intact, as is the "do not be diverted by the blame … nor by their words" pair.)

## V.4 — B05-P004

No material issue found.

(The three "out of which" → "from which" are the only change beyond pronouns and "shall"; the four sources — father's seed, mother's blood, nurse's milk, and the earth's food and drink — are in order, and "which bears me when I tread on it and abuse it for so many purposes" is Long's.)

## V.5 — B05-P005

No material issue found.

(The ten qualities are present, in Long's order and Long's words with one glossary change: sincerity, gravity, endurance of labor, aversion to pleasure, contentment with your portion and with few things, kindness [benevolence], frankness, no love of superfluity, freedom from trifling, magnanimity. The seven faults are also complete: grumble, be stingy, flatter, find fault with your poor body, try to please men, make a great display, be so restless in your mind. "Immediately able to exhibit" → "able to show at once" keeps "immediately" as time, which is its sense here. "Formed from them" → "formed for them": see the base-text rulings; rightly handled. The closing concession about slowness of comprehension, with both "not neglecting it nor yet taking pleasure in your dullness", is intact.)

## V.6 — B05-P006

No material issue found.

(The three men are kept as three with their distinguishing marks — sets it to account; does not, but thinks of the man as debtor and knows; in a way does not even know; the vine "seeks for nothing more after it has once produced its proper fruit"; the horse, the dog "when he has tackled the game", the bee; "does not call out for others to come and see"; the vine "in season". The objection-and-reply chain keeps all five dialogue dashes and every step: "Must a man, then, be one of these …?—Yes.—But this very thing is necessary, the observation …—What you say is true, but you do not rightly understand … even they are misled by a certain show of reason. But if you choose to understand … do not fear that for this reason you will omit any social act." "Social animal" → "social being", "in a social manner" → "in a social way", "in a manner" → "in a way" ×2, all per glossary.)

## V.7 — B05-P007

No material issue found.

(Word for word Long's, "fashion" → "way" excepted; the prayer kept as a prayer; "ploughed" as PG spells it.)

## V.8 — B05-P008

No material issue found.

(Long's 499 words are carried in order: the Aesculapius parallel with its three prescriptions (riding, cold bathing, going without shoes) and the nature of the whole's three (disease, mutilation, loss); the two senses of "Prescribed"; the squared stones "in walls or in the pyramids" fitted "in some kind of connection"; "one fitness"; the universe made up of all bodies and necessity made up of all causes; the ignorant who say "It … brought this"; "This, then, was brought, and this was prescribed to him"; the disagreeable prescriptions accepted "in the hope of health"; the perfecting of what the common nature judges good "of the same kind as your health"; "the health of the universe and … the prosperity and happiness of Zeus"; "not useful for the whole"; the two reasons for being content, each with its clauses (done for you, prescribed for you, in a way had reference to you, from the most ancient causes spun with your destiny; a cause of happiness and perfection and even of its very continuance); the mutilated integrity of the whole; and the closing "you do cut off, as far as it is in your power, when you are discontented, and in a way try to put anything out of the way".

Three interpretive decisions checked and endorsed. (a) The four D11 drops — "[or suits]", "[harmony]", "[destiny]" after "necessity", "[the universe]" after "Zeus" — are each Long naming a second English word for one Greek one, and each is the class D11 drops; the first is the pun the PG footnote points to ("a play on the meaning of sumbainein"), and dropping it costs nothing here because Long's "suitably … suitable … suitable" carries the wordplay into the next sentence anyway. (b) "[necessity, destiny]" after "It" folded as an apposition is the one bracket in the paragraph that supplies a referent the argument needs, and the fold is Long's two words with "or". (c) "Let us, then, receive these things, as well as those which Aesculapius prescribes" → "as we receive those that Aesculapius prescribes": Long's "as well as" is ambiguous on the page between "also" and "in the same way as"; the sentence before ("this was prescribed to him") and the sentence after ("many even of his prescriptions are disagreeable, but we accept them in the hope of health") both make the comparison the point, and a modern reader would take the unchanged phrase in the additive sense, which is the reading Long is less likely to have meant. Resolving it is defensible and is recorded in `continuity.md`; I note it as a decision, not a finding. Confidence moderate; a drafter who prefers to keep Long's ambiguity could write "as well as we receive those that Aesculapius prescribes", which keeps both readings open at the cost of one word.)

## V.9 — B05-P009

No material issue found.

(The "not … nor … nor" opening is kept as three; "return back again" is Long's own redundancy and stays; "and love this to which you return" and "do not return to philosophy as if she were a master" keep Long's "she"; the three eye remedies (sponge and egg; a plaster; a drenching with water) are all present; the dagger clause "For thus you will not fail to obey reason, and you will repose in it" stands with pronouns modernised only; "philosophy requires only the things that your nature requires" against "something else that is not according to nature"; the objection with "[which I am doing]" folded; "is not this the very reason why pleasure deceives us?"; the five nouns magnanimity, freedom, simplicity, equanimity, piety in order; and the closing "security and the happy course of all things that depend on the faculty of understanding and knowledge".)

## V.10 — B05-P010

**Finding 10.1 — Long's noun replaced by a phrasal verb with a competing idiomatic sense — minor (optional preference).**
Source: "Things are in such a kind of envelopment that they have seemed to philosophers … altogether unintelligible"
Candidate: "Things are so wrapped up that they have seemed to philosophers … altogether unintelligible"
Long's "envelopment" means that things are wrapped in obscurity. "Wrapped up" is the plain verb for that, but in current English "so wrapped up" is first heard as the idiom for being absorbed or engrossed ("so wrapped up in his work"), and for a beat the reader has things preoccupied rather than concealed. The argument is not touched and the reader recovers at "unintelligible". Long's root is available as a current adjective.
Proposed: "Things are so enveloped that they have seemed to philosophers …" (Long's own root; "enveloped" is current and has no competing idiom).
Confidence moderate; low stakes.

Everything else in V.10 is in order: "not a few of them and not the common ones", "even to the Stoics themselves"; "all our assent is changeable; for where is the man who never changes?"; the objects short-lived and worthless, possessed by "a filthy wretch or a whore or a robber"; the morals of those who live with you, "to say nothing of a man being hardly able to endure himself"; darkness, dirt, and the four-fold flux (substance, time, motion, things moved); "I cannot imagine"; "comfort himself … wait for the natural dissolution … not resent the delay" (glossary); the two principles kept as two, with "the nature of the whole" and "my god and the god within" per glossary and III.7 precedent, and "for there is no man who will compel me to this".

## V.11 — B05-P011

No material issue found.

(The six souls are present in order: child, young man, feeble woman, tyrant, domestic animal, wild beast. "The ruling principle" → "the ruling part". "About what" → "On what" is the natural preposition for "employ … on".)

## V.12 — B05-P012

No material issue found.

(Both dagger clauses stand verbatim: "anything which should not be in harmony with what is really good" and "Thus even the many perceive the difference." The four cardinal virtues are in Long's order (prudence, temperance, justice, fortitude); the two-way conditional (really good first conceived / things that appear good to the many first conceived) is kept with its consequences; "[in the first case]" folded; "of wealth, and of the means that further luxury and fame, as said fitly and wittily"; and the comic writer's line "has not a place to ease himself in" is left as bare as Long leaves it.)

## V.13 — B05-P013

No material issue found.

("The formal and the material" → "form and matter" is the new glossary row and reads as plain current English without imposing anything; "neither of them will perish into non-existence, as neither of them came into existence out of non-existence" keeps the symmetry; the two "and so on forever" directions are both present; "[of revolution]" is correctly a supplement, folded.)

## V.14 — B05-P014

No material issue found.

("[philosophy]" after "the reasoning art" is Long's label for what the phrase names, the same class as IV.21 "[the formal]", dropped under D11 and listed. "Catorthoseis, or right acts, which word signifies that they proceed by the right road" is kept whole: the transliteration, Long's inline gloss and the etymology are all Marcus's sentence, not apparatus.)

## V.15 — B05-P015

No material issue found.

(PG "snowed" → "showed": see the base-text rulings; rightly handled. The "not … nor … nor" chain of the second sentence is kept as three (not required; nor does man's nature promise; nor are they the means); "Neither, then, … nor yet …" kept; the conditional "if any of these things did belong to man" with its three consequences (not right to despise them; not praiseworthy to show he did not want them; not good to stint himself) kept, with the closing "if indeed these things were good"; and the last sentence's two cases (deprives himself / is deprived) and its measure ("in just the same degree he is a better man") kept. The semicolon inserted before "and what aids toward this end is what is good" is a fair way of showing that this clause is Long's own gloss and not a third member of the "nor" chain.)

## V.16 — B05-P016

No material issue found.

("Such as your habitual thoughts are, such also will be the character of your mind; for the soul is dyed by the thoughts. Dye it, then, with a continuous series of such thoughts as these" — the dyeing image kept twice as Long has it. The palace example with its objection and reply; the chain purpose → constituted → carried → end → advantage and good; "the good for the rational being is society" (glossary); "has been shown above" kept (the PG footnote "ii. 1" was already stripped in the staged original, correctly, as a cross-reference); the two-step superiority argument closes it.)

## V.17 — B05-P017

No material issue found.

(Identical to Long, 22 words. Not expanded.)

## V.18 — B05-P018

No material issue found.

("Because he would show a great spirit" → "because he wants to show a great spirit" reads Long's "would" as volition, which is its sense here; the two alternative reasons (does not see; wants to show) are kept as alternatives; "ignorance and conceit … stronger than wisdom" is Long's. Three sentences, not expanded.)

## V.19 — B05-P019

No material issue found.

(The "not … nor … nor" chain is kept as three (do not touch; nor have admission; nor can they turn or move); "the soul turns and moves itself alone". Also noted, optional: Long's last clause, "such it makes for itself the things which present themselves to it", is kept in his construction; it is compressed to the point of difficulty, but the candidate is not required to be clearer than Long, and any recasting would resolve how "for itself" attaches. No change proposed.)

## V.20 — B05-P020

No material issue found.

("Affects" → "feelings" is the new glossary row; "my feelings and disposition, which have the power of acting conditionally and changing" imposes nothing. The two respects (nearest thing to me / one of the things that are indifferent) are kept as two; "no less than the sun or wind or a wild beast"; the hindrance turned to an aid, and both closing clauses ("what is a hindrance is made a furtherance to an act; and what is an obstacle on the road helps us on this road") are Long's.)

## V.21 — B05-P021

No material issue found.

(The parallel "what is best in the universe … what is best in yourself" kept; "of the same kind as that" kept; "that which makes use of everything else is this" kept, correctly, so that "this" stays the predicate.)

## V.22 — B05-P022

No material issue found.

(The rule, its application and the exception with "Show him where his error is." — all Long's.)

## V.23 — B05-P023

No material issue found.

(Both things that pass — "the things that are and the things that are produced"; the river; the four-part flux (substance, activities, causes, hardly anything stands still); "this boundless abyss of the past and of the future"; "puffed up … or plagued … and makes himself miserable"; "only for a time, and a short time". "Vex" kept as Long's transitive verb, consistent with IV.44 v2.)

## V.24 — B05-P024

No material issue found.

(The three magnitudes kept as three: universal substance, universal time, what is fixed by destiny; "a short and indivisible interval" kept. Not expanded.)

## V.25 — B05-P025

No material issue found.

(Word for word Long's; the contrast "the universal nature … my nature" kept. Not expanded.)

## V.26 — B05-P026

**Finding 26.1 — "not" placed so that it reads as attaching to "of itself" — minor (worth improving).**
Source: "but let not the ruling part of itself add to the sensation the opinion that it is either good or bad"
Candidate: "but let the ruling part not of itself add to the sensation the opinion that it is either good or bad"
Long's "let not the ruling part of itself add" is a prohibition (the ruling part must not add the opinion) with "of itself" meaning "on its own account". Moving "not" after "the ruling part" and directly before "of itself" produces "not of itself add", which a reader first parses as "not by itself" — as if the ruling part might add the opinion together with something else, or as if "not of itself" were a unit. The instructions single out this clause ("what the ruling part must not add"), and it is the paragraph's conclusion. The prohibition survives on a second reading, but the sentence should not need one.
Proposed: "but do not let the ruling part, of itself, add to the sensation the opinion that it is either good or bad" (Long's words; "do not let" is the modern form of "let not"; the commas keep "of itself" as the aside it is). Alternatively "but let the ruling part not add, of itself, the opinion to the sensation that it is either good or bad" — the first is cleaner.
Confidence high that the placement is the problem; moderate that commas alone would be enough.

Everything else in V.26 is intact: "the part of your soul that leads and governs" (Long's descriptive phrase, not the term, and correctly left descriptive); the movements in the flesh "whether of pleasure or of pain"; "let it not unite with them, but let it confine itself and limit those feelings to their parts"; "that other sympathy that naturally exists in a body which is all one"; "you must not strive to resist the sensation, for it is natural". "Affects" → "feelings" ×2 per the new row; "circumscribe" → "confine" as IV.3.

## V.27 — B05-P027

No material issue found.

(The glossary's "the god within" carried into "which Zeus has given to every man as his guardian and guide, a portion of himself. And this is every man's understanding and reason." "For his guardian" → "as his guardian" is the current preposition.)

## V.28 — B05-P028

No material issue found.

(Both questions kept as questions; "He has such a mouth, he has such armpits: it is necessary that such an emanation must come from such things" keeps Long's doubled necessity; the imagined objection "but the man has reason, it will be said"; "Well, then, you too have reason" reads Long's "and thou hast reason" correctly as "also"; the three imperatives (stir up, show, admonish); "if he listens, you will cure him, and there is no need of anger". The bracketed fragment stands verbatim as the last sentence, "Neither tragic actor nor whore." — see the rulings below on the brackets. Also noted, optional: "I wish you well of your discovery" is Long's ironic idiom ("much good may it do you"); it is still parseable and the irony is recoverable from "What good will this anger do you?", so it is left, but it is the one phrase in the paragraph a general reader may take straight. No change proposed within Long's words.)

## V.29 — B05-P029

No material issue found.

("As you intend to live when you have gone out,... so it is in your power to live here" — PG "them art" → "you have": see the rulings; nothing is supplied at the ellipsis. "The house is smoky, and I leave it." kept as the bare image; the PG footnote to Epictetus was already stripped in the staged original, correctly. "Get away out of life" is Long's own phrase and is left; "yet so as if you were suffering no harm" kept; "I remain, am free, and no man shall hinder me" kept; "the rational and social being" per glossary.)

## V.30 — B05-P030

No material issue found.

(The three verbs subordinated, coordinated, assigned kept as three; "the intelligence of the universe" keeps Long's "intelligence" apart from "understanding" and "mind".)

## V.31 — B05-P031

No material issue found.

(The reckoning is complete: gods, parents, brothers, children, teachers, those who looked after your infancy, friends, kinsfolk, slaves; the quoted verse line kept in Long's quotation marks with its missing subject; then the seven "how many" items in order — passed through; been able to endure; the history complete and service ended; beautiful things seen; pleasures and pains despised; things called honorable spurned; ill-minded folk shown a kind disposition. "Hitherto" → "until now" ×2, "brethren" → "brothers", "call to recollection" → "call to mind" (as IV.3).)

## V.32 — B05-P032

No material issue found.

(PG "though all time" → "through all time": see the rulings; rightly handled. "[revolutions]" is Long's second word for "periods" and is dropped under D11, correctly distinguished from V.13's "[of revolution]", which completes a phrase and is folded. The three marks of the knowing soul kept: beginning and end; the reason that pervades all substance; administers the universe through all time by fixed periods.)

## V.33 — B05-P033

**Finding 33.1 — article added to Long's bare abstract noun — minor (optional preference).**
Source: "and either a name or not even a name; but name is sound and echo"
Candidate: "and either a name or not even a name; but a name is sound and echo"
Long moves from the countable "a name … not even a name" to the bare "name" — name as such, renown in the abstract — and it is that abstraction he calls "sound and echo". The candidate's "a name" is clearer at first sight but repeats the countable noun a third time, so the sentence now says that a particular name is sound and echo, and the small shift from "a name" to "name" that Long makes is lost. Bare "name" in this sense ("a man of name") is still English, if slightly formal, and it is what Long wrote.
Proposed: "but name is sound and echo" (Long's own), or leave as is; drafter's discretion.
Confidence moderate; low stakes.

Everything else in V.33 is present: ashes or a skeleton; the things much valued "empty and rotten and trifling"; the little dogs and the little children "quarreling, laughing, and then at once weeping" ("[like]" folded); the Hesiod line run on as prose with Long's words — "fidelity and modesty and justice and truth have fled up to Olympus from the widespread earth" — and only the citation "HESIOD, Works, etc. v. 197." dropped (checked word by word in the diff: nothing else went with it); the three reasons for not being detained (objects of sense easily changed; organs of perception dull; the poor soul an exhalation from blood); "good repute … an empty thing"; "extinction or removal to another state"; and the closing four-part sufficiency (venerate and bless the gods; do good to men; practice tolerance and self-restraint; remember that what is beyond flesh and breath is neither yours nor in your power). "Tranquillity" → "calm" per glossary; "practise" → "practice" per the spelling rule.

## V.34 — B05-P034

No material issue found.

("Equable" → "even" is the plain current word; "the soul of God" keeps Long's capital as the glossary directs; the two things "common both to the soul of God and to the soul of man, and to the soul of every rational being" are kept as two, with "let your desire find its termination" retained (the continuity note is right that "end" would read as "cease").)

## V.35 — B05-P035

No material issue found.

("The common weal" → "the common good" ×2, the extended glossary row. One sentence; not expanded.)

## V.36 — B05-P036

**Finding 36.1 — one archaic inversion left standing — minor (worth improving).**
Source: "I was once a fortunate man, but I lost it, I know not how."
Candidate: "I was once a fortunate man, but I lost it, I know not how."
"I know not how" is Long's "not"-after-verb form, the construction the edition has recast everywhere else in Books I–V ("touch not" → "do not touch" in V.19 of this very book; "lovest not thyself" → "do not love yourself" in V.1; Book IV's "mingles not", "look not", "say not", "Bread I have not"). It is the only such form left in Book V. It survives as a set phrase in literary English, which is presumably why it slipped through, but a general reader hears it as period diction, and it sits inside a speech the paragraph is quoting ironically, where the reader should hear an ordinary man's complaint.
Proposed: "I was once a fortunate man, but I lost it, I do not know how."
Confidence high that it is an archaism by the edition's own standard; the drafter may judge the set phrase acceptable, in which case a `continuity.md` line should say so.

Everything else in V.36 is in order: "carried along rashly by the appearance of things"; "give help to all according to your ability and their fitness" ("[to all]" folded); the loss "in matters that are indifferent" not a damage, "for it is a bad habit"; the old man asking back the foster child's top "remembering that it was a top"; the Rostra kept as a proper name; the four-beat exchange (have you forgotten, man — Yes; but they are objects of great concern to these people — will you too, then, be made a fool); and the definition of "fortunate" with its three parts (a good disposition of the soul, good emotions, good actions), "emotions" correctly kept as Long's own distinct word beside the glossary's "feelings".

---

## Rulings on the base-text defects and the V.28 bracket

Each was checked against `source/pg15877-long-1862.txt` (sha256 `6584df7e…`, the file `provenance.json` names) at the line given.

| Place | PG reads (line) | Candidate | Ruling |
|---|---|---|---|
| **V.15** | "who snowed that he did not want these things" (3665) | "showed" | **Scan error; the evident word is right.** "Snowed" is a one-letter OCR substitution (h → n) in a sentence whose sense requires "showed"; "showed" is Long's ordinary spelling throughout the PG file (lines 189, 904, 2246, 2315, 2356). No alternative reading exists. Rightly handled and rightly recorded. |
| **V.29** | "As thou intendest to live when them art gone out, ..." (3779) | "when you have gone out,..." | **Printing/scan error; the evident word is right.** "Them art" is a misprint for "thou art" (an objective form cannot take "art"); Long's own footnote on the passage quotes Gataker's "as if thou wast about to quit life", confirming the second person. "Thou art gone out" → "you have gone out" is the standard modernisation of the perfect with "be". The ellipsis is Long's own mark for the lacuna he says he "left imperfect" and is kept in the same three-dot form as the staged original; nothing is supplied. Rightly handled. |
| **V.32** | "and though all time by fixed periods [revolutions] administers the universe" (3813) | "through all time" | **Scan error; the evident word is right.** "Though" cannot govern "all time by fixed periods"; "through" is the only word that fits the syntax and the sense (the reason pervades all substance and administers the universe through all time). One-letter drop. Rightly handled. |
| **V.1** | "choose neither to eat nor to sleep rather than to perfect the things which they care for" (3470) | "choose neither to eat nor to sleep rather than perfect the things they care for" | **Not a defect; keeping it as Long has it is right, and the continuity note should be corrected.** There is no letter-level corruption here, and the sentence does not lack a negative once "choose X rather than Y" is read as "prefer X to Y": such men *prefer neither eating nor sleeping to* perfecting the things they care for — that is, they do not put eating or sleeping ahead of their work. Long's "neither … nor" scopes over the whole preference, and the sentence is complete and coherent under that parse; the reading `continuity.md` proposes ("they would rather not eat or sleep than *fail to* perfect") is the same claim arrived at by supposing an ellipsis Long did not make. The candidate's wording ("rather than perfect", the second "to" dropped) preserves Long's construction exactly and nothing is supplied, which is the right outcome. Recommendation: amend the V.1 line and the "unresolved source issues" line in `continuity.md` to say that the sentence reads correctly as "prefer neither X nor Y to Z" and is not defective, rather than that it "seems to want a negative". Confidence high. |
| **V.5** | "of which thou canst not say, I am not formed from them by nature" (3495) | "I am not formed for them by nature" | **Right call; the nature of the error is open.** "Formed from them by nature" is not English in the sense the sentence needs (the qualities that follow are things nature *has* fitted him for; "from" would make them his raw material). "Formed … for" is Long's own construction elsewhere in the PG file ("formed for a particular purpose", line 5851) beside his frequent "formed by nature to …" (lines 3692, 4691, 5853, 5899, 5904, 6284, 6641). Whether "from" is a scan error or a slip in the 1862 printing I could not establish offline (no second printing of Long is in the package), so unlike V.15 and V.32 it is not *plainly* a scan error; but the emendation is the only reading that makes the clause say what its context requires, it changes one preposition, and it is recorded. I read Long's "from" as not deliberate. Rightly handled; the continuity note's request for a reviewer's view is answered: keep "for". |
| **V.28 bracket** | "[+ Neither tragic actor nor whore. +][A]" (3769) with Long's footnote: "This is imperfect or corrupt, or both. … I have translated it literally and left it imperfect." | "Neither tragic actor nor whore." as the last sentence, without brackets | **Kept as text is right; D11 does not apply.** Long's footnote settles the classification: the bracketed words are his literal translation of a corrupt Greek fragment, not a supplement of his own and not a second rendering of a word already rendered. The brackets, with the two daggers inside them, mark the text as corrupt; they are Long's apparatus for signalling the state of the Greek, and the glossary's rule that his brackets are not reproduced applies. Dropping the fragment would have been a D11 misclassification and a loss of Marcus's text; folding it into the preceding sentence would have supplied a connection Long says he could not make. The candidate does neither: the fragment stands alone, verbatim, unconnected, as Long prints it. Consistent with the treatment of III.3 and IV.19's broken ending. Rightly handled. |

Also confirmed: the three PG footnotes in Book V — V.8 (the *sumbainein* pun), V.16 ("ii. 1"), V.29 (Epictetus i. 25, 18) — are apparatus, were stripped when the staged original was built, and are absent from source and candidate alike, which is correct. The V.8 illustration caption is gone from the rebuilt file (D12), verified by the package check.

---

## Summary

| Severity | Count | Paragraphs |
|---|---|---|
| **Substantive** (must fix) | **0** | — |
| **Minor** (drafter's discretion) | **5** | V.1 (1.1), V.10 (10.1), V.26 (26.1), V.33 (33.1), V.36 (36.1) |
| No material issue | 31 | V.2–V.9, V.11–V.25, V.27–V.32, V.34, V.35 |

Of the 5 minor findings, 3 are "worth improving" (1.1 the broken fourth cognate pair; 26.1 the misplaced "not" in the paragraph's concluding prohibition; 36.1 the one archaic inversion left in the book) and 2 are "optional preference" (10.1 "wrapped up"; 33.1 "a name"). Classification, each counted once: dropped clause 0; dropped word 0; added content 0 (the only added words — "a" in V.33, "the" in V.9, "it" and "in" in V.8, "a" in V.9, V.5 and V.36 — are articles and function words; V.33's is finding 33.1, the rest harmless); resolved ambiguity 0 as a finding (V.8 "as we receive" is a recorded interpretive decision I endorse, noted in the entry); expansion 0; voice drift 0; glossary inconsistency 0 (every glossary row met in Book V is applied consistently, including the two new rows and the two extended rows); imported rendering 0; archaism left 1 (36.1); other 3 (1.1, 10.1, 26.1). All four named dagger clauses (seven dagger marks) stand verbatim as the instructions require. No short section is expanded: V.2 (24/25 words), V.7 (42/42), V.17 (identical), V.18 (61/60), V.24 (46/47), V.25 (identical), V.35 (identical) are at Long's length. No drift toward advice, moral lesson or explanation for a modern reader anywhere in the book; the imperatives stay bare ("Live with the gods."; "Show him where his error is."; "Reverence what is best in the universe"; "Do not be carried along rashly"). No phrase identified as imported from another translation; I did not compare against other translations and claim nothing about them. The two new glossary rows read naturally in every place they are applied — "feelings" (V.20 "my feelings and disposition"; V.26 "limit those feelings to their parts", "when these feelings rise up to the mind") and "form and matter" (V.13) — and neither imposes a modern reading; "emotions" in V.36 is correctly left as Long's separate word. The two extended rows are applied at their occurrences ("their own ruling part" V.3; "the common good" ×2 V.35) and nowhere else.

### Chapter-level findings (from the continuous read)

1. **Connectives.** Long's inferential connectives are carried throughout — "For" opens V.3's second sentence, V.8's "For in the first case", "For this is what we mean", "For there is altogether one fitness", "For he would not have brought", "For the integrity of the whole", V.9's "For thus", "For what is more agreeable", V.10's "for where is the man", V.15's "Besides", V.16's "for the soul is dyed", V.23's "For substance is like a river", "For they vex him", V.27's "And he does live", V.28's "For if he listens", V.36's "for it is a bad habit". "Then" is kept everywhere Long has it, set between commas in the candidate's own sentences and unpunctuated inside the verbatim dagger sentences (V.12). No connective added.
2. **Archaic syntax.** One left, V.36 "I know not how" (finding 36.1). Every other "thou"-form, inverted question ("Dost thou", "Art thou", "hast thou", "wilt thou"), "not"-after-verb ("touch not", "lovest not", "let not") and "-est/-eth" verb has been recast, each in Long's order of ideas. Long's already-current words are kept where the glossary does not touch them ("emanation", "magnanimity", "superfluity", "equanimity", "furtherance", "termination", "vile", "stinted", "Rostra", "Catorthoseis").
3. **Terminology.** The glossary is applied consistently: "the ruling part" (V.3, V.11, V.26), "rational being" (V.16, V.34), "social being / in a social way" (V.6, V.29), "the god within" (V.10, V.27), "the common good" (V.35), "the nature of the whole" (V.8, V.10 — the same merge Book IV v2 made in IV.36), "the common nature" (V.3, V.8), "the universal nature" (V.25), "opinion" (V.26), "impression(s)" (V.2, V.33) against "appearance" for outward looks (V.22, V.36), "principles" (V.9, V.10), "assent" (V.10), "impulse" for *hormē* "movement" (V.3) against "movements in the flesh" for motion (V.26), "indifferent" (V.20, V.36), "dissolution" (V.10), "discontented" (V.1, V.8, V.9), "calm" (V.2, V.33), "in a way" (V.6 ×2, V.8 ×3), "happiness" (V.8 ×2, V.34), "kindness" (V.5), "resent" (V.10) beside Long's transitive "vex" (V.23), "flesh and breath" (V.33), and Long's intelligence / understanding / mind kept apart (V.9, V.20, V.27, V.30). The one same-word question is "which" — kept in the V.12 dagger clause by rule and in a few of Long's non-adjacent or non-restrictive relatives (V.11, V.15, V.23, V.26 "a body which is all one", V.27), converted to "that" elsewhere; this is punctuation-level and not a finding.
4. **Long's plain words replaced.** The low-rate pattern the Book I, III and IV reviews noted is lower still here: "envelopment" → "wrapped up" (10.1) and "vain-glorious" → "vain" (1.1) are the only two places where a Long word has been swapped for a near-equivalent that says slightly else; "make haste" → "hurry" and "murmur" → "grumble" (Long's own word in IV.32) are neutral. Nothing changes what Marcus says.
5. **Short sections.** V.2, V.7, V.17, V.18, V.24, V.25 and V.35 are at Long's length and bare; V.17, V.25 and V.35 are Long's words with only pronouns changed or unchanged. The abrupt cuts between meditations are the source's own.
6. **Apparatus.** The six D11 drops and the Hesiod citation are each listed in `continuity.md`, and the word-level diff confirms that nothing beyond the listed brackets and citation is absent from the candidate. The six folds are each Long's plain sense. V.28's bracket is correctly *not* in either list (rulings above).

### Flow judgement

Read straight through from V.1 to V.36, the candidate is Long's Book V with the archaisms gone and nothing else changed. The long meditations carry Long's argument sentence by sentence in his order: V.1's dialogue with itself, objections answered in turn until the closing question; V.6's three men and the vine, and the objection about the social being answered without conceding it; V.8's Aesculapius, the squared stones, the two senses of "prescribed", and the two reasons for contentment closing on the mutilated whole; V.9's return to philosophy with the sponge and egg; V.10's darkness and dirt resolved into two principles; V.12's comic writer; V.15's "as man"; V.16's chain from purpose to society; V.20's hindrance turned to an aid; V.26's feelings rising from the flesh; V.31's reckoning; V.33's sound and echo, dogs and children, and Hesiod; V.36's top and Rostra. The one- and two-line sayings stay one and two lines and stay bare. The voice is Marcus's own throughout — self-addressed, imperative, unexplained: "Do you exist, then, to take your pleasure, and not at all for action or exertion?"; "Live with the gods."; "The house is smoky, and I leave it."; "Are you angry with him whose armpits stink?"; "have you forgotten, man, what these things are?" The images are all still images (the little plants and the bees; the turner and the dancer; the vine, the horse, the dog and the bee; rain on the ploughed fields; squared stones in walls and pyramids; sponge and egg; the soul dyed; the river; the smoky house; the armpits and the mouth; little dogs and little children; the top), and the seven dagger marks leave their clauses exactly as obscure as Long leaves them, V.28's fragment included. The two new glossary renderings sit unobtrusively in the prose; a reader meeting "feelings" and "form and matter" will not notice that a decision was made. The weaknesses are small and of three kinds: one misplaced "not" that makes V.26's conclusion parse wrong on first reading (26.1); one archaic set phrase left in V.36 (36.1); and three places where a Long word was swapped or an article added at the cost of a small pattern or shade (1.1, 10.1, 33.1). None changes what Marcus says. Apply the three "worth improving" items and the book reads as Long's Book V in modern dress, at the standard the accepted Books I–IV set.

### Verdict

**Accept after corrections.** There is no substantive finding. The book can be accepted once the drafter has considered the 5 minor findings; recommended for application: the three "worth improving" items (1.1, 26.1, 36.1), and among the optional ones 33.1 (restores Long's own word at no cost). 10.1 is a preference. The `continuity.md` correction on V.1 (rulings above) is a record change, not a text change, and should be made. If the drafter prefers to accept v1 unchanged, the review does not block it, but 26.1 (a first-reading misparse of a concluding prohibition) should not be left unaddressed without a recorded reason.

### Coverage and limitations

- Every paragraph V.1–V.36 was read source-beside-candidate in packet order (12 packets, three paragraphs each) with the supplied context, then the whole candidate was read continuously. A word-level diff of each paragraph against Long was generated and read alongside, so every token present in one text and absent from the other was inspected individually. Every Long clause was checked for presence, including qualifiers, negations, quantifiers, the "not … nor … nor" chains (V.9, V.15, V.19), and the length and order of every list (V.1's five creatures and four pairs; V.5's ten qualities and seven faults; V.6's three men and four creatures; V.8's two triads of prescriptions and two reasons; V.9's three remedies and five nouns; V.10's four-fold flux and two principles; V.11's six souls; V.12's four virtues; V.24's three magnitudes; V.30's three verbs; V.31's nine relations and seven reckonings; V.33's three reasons and four sufficiencies; V.36's three parts of good fortune), and the seven dagger marks and five base-text defects against the PG file at the lines cited.
- The review is against Long's English only, as instructed. Where I note that an alternative reading of Long is available (V.8 "as well as"; V.19's last clause; 33.1), the confidence given reflects that; I did not consult the Greek, and the candidate is not required to match the Greek over Long. On V.5 "formed from them" I could not determine offline whether PG's "from" is a scan error or Long's own slip; the ruling rests on Long's usage elsewhere in the same file and on the sense the context requires.
- No other translation was consulted, so "imported rendering" could only have been caught where a phrase departs from Long in a way Long's own words do not explain; none was found. Absence of such a finding is not proof.
- The mechanical checks were re-run and passed; word ratios were used only as a screening signal.
- Attention was held to the end: the last packets (V.28–V.36) were read at the same pace as the first, and two of the five findings fall in the last four paragraphs.
- Errors can remain; this review does not claim otherwise.
