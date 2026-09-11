# Independent review — Meditations, Book III, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer subagent spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-11 |
| Branch | `claude/meditations-modern-en-20260911-v2` (worktree at commit `3026edca8`) |
| Candidate | `book3/candidate-v1.json`, sha256 `7079d32b01a836a672dff6a512822cc881284be10cebfef2bdd28b45337c326a` (recomputed locally with `sha256sum`; matches `provenance.json` and the expected value in `README.md`'s package check; `manifest.json` carries no hash of its own) |
| Source | George Long 1862, `book3/source-book3.json` (sha256 `c417f5bc…`, matches `provenance.json`), byte-identical to chapter 3 of `../meditations-original-en.staged.json`; the three dagger positions confirmed in `source/pg15877-long-1862.txt` (III.3 after "superior:", III.4 after "carries him along with it.", III.11 after "apportionment") |
| Packets reviewed | `review-packets/packet-01.md` … `packet-06.md`, in order, three paragraphs at a time (packet 6: one) with the supplied context; then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md`, `WORKFLOW.md` (Anders's voice rules), `review-instructions.md`, `continuity.md`; `book2/review/findings-v1.md`, `book1/review/findings-v1.md` and both `ACCEPTANCE.md` files read first for calibration |

Mechanical checks from `book3/README.md` were re-run before reading: hash, paragraph count (16 = 16, matching Long's III.1–III.16), numbering, packet coverage (B03-P001…P016 each exactly once, in order), packet text identical to the JSON, readable copy identical to the JSON, and the three dagger clauses present verbatim in source and candidate. All passed. Per-paragraph word ratios 0.94–1.03; nothing is padded and nothing is cut.

Severity: **substantive** = must be fixed before acceptance (review-instructions "Must fix"). **minor** = drafter's discretion ("Worth improving" or "Optional preference", stated in each entry). Every proposed wording stays inside Long's words and the glossary. Confidence is stated where a plausible alternative reading exists.

---

## III.1 — B03-P001

No material issue found.

(Checked specifically, as the instructions ask: "dotage" → "senility" names the same state in the plain current word and adds no diagnosis; the four nouns "perspiration and nutrition and imagination and appetite" are kept as four; "clearly separating all appearances" → "clearly distinguishing all impressions" is the glossary's technical rendering with the recorded verb change; the three-step argument — life shortens; the mind may fail before the body; therefore make haste — is in Long's order with both "not only … but also" pairs intact. Also noted, optional: "the understanding" → "his understanding" supplies a possessive Long does not have; harmless and the obvious reading.)

## III.2 — B03-P002

**Finding 2.1 — glossary rule producing a jingle — minor (optional preference).**
Source: "are beautiful in a manner, and in a peculiar way excite a desire for eating"
Candidate: "are beautiful in a way, and in a peculiar way excite a desire to eat"
The glossary fixes "in a manner" → "in a way" (decided in Book II), and the candidate applies it correctly here and again later in the paragraph ("in a way disposed so as to give pleasure"). But in this one sentence Long's own next phrase is "in a peculiar way", so the rule yields "in a way, and in a peculiar way" — two "way"s three words apart, which a reader hears. No meaning is lost; this is a sound-only point.
Proposed: either leave it, or "are in a way beautiful, and in a peculiar way excite a desire to eat" (moves the hedge in front of the adjective, which is where Long's Greek-derived hedge sits anyway, and separates the two "way"s by a clause). Drafter's discretion; if left, no `continuity.md` note is needed since the glossary is followed.

Also noted, optional: "ears of corn" is Long's British "corn" (grain); the edition's spelling standard is American (glossary), and an American reader pictures maize. "Corn" is nonetheless the word of every English Bible and the image (heads bending under their own weight) survives either reading; `continuity.md` records the choice. No change proposed. Everything else in III.2 is present in Long's order: split bread with both its clauses (contrary to the baker's art; excites a desire to eat), gaping figs, olives near rottenness, ears of corn, lion's eyebrows, boar's foam, "many other things" with its concession and its two effects (adorn / please the mind), the "feeling and deeper insight" conditional, the painters-and-sculptors comparison, old woman and old man, the young with chaste eyes, and the closing restriction "not pleasing to every man, but only to him who…". All images kept as images.

## III.3 — B03-P003

No material issue found.

(The catalogue of the dead is complete and in order: Hippocrates, the Chaldaeans, Alexander and Pompeius and Caius Caesar with "so often", "whole cities" and "many tens of thousands of cavalry and infantry", Heraclitus with the conflagration, the water and the mud, Democritus's lice and Socrates's "other lice". "Get out" kept bare. The disjunction "if indeed to another life … but if to a state without sensation" kept with "not even there". The dagger clause "which is as much inferior as that which serves it is superior" stands verbatim; "intelligence and deity" → "intelligence and the divine" is the glossary's abstract rendering and reads correctly against "earth and corruption".)

## III.4 — B03-P004

**Finding 4.1 — independent clause subordinated (resolved ambiguity of structure) — minor (worth improving).**
Source: "And he remembers also that every rational animal is his kinsman, and that to care for all men is according to man's nature; and a man should hold on to the opinion not of all, but of those only who confessedly live according to nature."
Candidate: "And he remembers also that every rational being is his kinsman, and that to care for all men is according to man's nature; and that a man should hold to the opinion not of all, but only of those who confessedly live according to nature."
Long gives the good man two things he remembers (kinship; care for all men) and then, after the semicolon and without "that", states a rule in his own voice: a man should hold to the opinion of the few who live according to nature. The candidate adds "that", making the rule a third item the good man remembers. That is a possible construal of Long's loose sentence, but it is not what he wrote, and the change matters a little: the two remembered items are about caring for all men, and the rule that follows is the qualification (care for all, but value the opinion of few); Long's shift from "he remembers" to "a man should" marks the turn. Modern English carries Long's shape without cost.
Proposed: "…and that to care for all men is according to man's nature; and a man should hold to the opinion not of all, but only of those who confessedly live according to nature."
Confidence moderate-to-high: the candidate's reading is defensible; the finding is that Long's open form is available at no cost.

**Finding 4.2 — punctuation — minor (optional preference).**
Candidate: "if someone should suddenly ask, What is in your thoughts now?, you could at once answer"
A question mark followed by a comma is not a modern English sequence; Long avoids it ("What hast thou now in thy thoughts? with perfect openness thou mightest…"). The staged original's convention is a bare question mark inside the sentence.
Proposed: "if someone should suddenly ask, What is in your thoughts now? you could at once answer with perfect openness, This or That;" (drop the comma; the reordering of "with perfect openness" is fine).

Everything else in Long's 503 words is present in order: the opening prohibition with its "common good" condition; the five "what is he…" questions; the check on purposeless thoughts with "most of all the over-curious feeling and the malicious"; the sudden question and its answer; the "simple and kind … social being … cares nothing … no rivalry or envy and suspicion … blush" chain; the priest and minister of the gods; the god within with all eight of its effects (uncontaminated by pleasure, unharmed by pain, untouched by insult, feeling no wrong, fighter in the noblest fight, not overpowered by passion, dyed deep with justice, accepting with all his soul); "not often, nor without great necessity and for the common good"; the material of his activity, the sum total, fair acts, portion good; the dagger sentence "For the lot which is assigned to each man is carried along with him and carries him along with it." verbatim; the "at home and away from home, by night and by day" pair; and the closing "not even satisfied with themselves". Bracketed "[deity]" folded to the glossary's "the god within him". "Ruling power" → "ruling part", "social animal" → "social being", "rational animal" → "rational being", "benevolent" → "kind" all per glossary and the Book I family.

## III.5 — B03-P005

**Finding 5.1 — image shifted in a working phrase — minor (optional preference).**
Source: "nor let studied ornament set off thy thoughts"
Candidate: "nor let studied ornament dress up your thoughts"
Long's "set off" is the jeweller's or painter's verb (a setting that shows a stone to advantage); it is current English and it fits "ornament". "Dress up" in current use leans toward disguise (dressing something up as what it is not), which adds a note of deceit Long does not have; his objection is to display, not falsehood.
Proposed: "nor let studied ornament set off your thoughts".
Confidence moderate; low stakes.

Also noted, optional: the guardian's description is one of Long's "and … and … and" chains ("manly and of ripe age, and engaged in matter political, and a Roman, and a ruler"); the candidate drops the "and" before "engaged", so the chain is broken once. "manly and of ripe age, and engaged in political matters, and a Roman, and a ruler" restores it (compare Book I's chapter-level finding 2). The four "nor"s of the first sentence are all present; "many words / too many things" both kept; the signal, the readiness, "neither oath nor any man's testimony", "outside help nor the calm that others give", and "stand upright, not be held upright by others" all present.

## III.6 — B03-P006

**Finding 6.1 — two of Long's words merged into one candidate word — minor (worth improving).**
Source: "thy own mind's self-satisfaction in the things which it enables thee to do" (III.6); "such as gentleness, manliness, truth, fidelity, simplicity, contentment, and the rest" (III.11); "to be pleased and content with what happens" (III.16)
Candidate: "your own mind's contentment with itself in the things it enables you to do" (III.6); "contentment" (III.11); "content" (III.16)
The rendering the instructions ask me to check — "self-satisfaction" → "contentment with itself" — says only what Long's compound says and imposes no modern reading; on that point the candidate is right. The remaining problem is smaller: Long has a distinct word "contentment" in the III.11 virtue list and "content" in III.16, and the candidate now uses the same word for a different Long term in III.6, so a reader who meets "contentment" three times cannot tell that Long wrote two different things. The glossary's rule is to keep Long's distinctions (as with intelligence / understanding / mind). "Satisfaction with itself" keeps Long's noun, avoids the smug sense of "self-satisfaction" exactly as the candidate's phrase does, and leaves "contentment" to III.11.
Proposed: "anything better than your own mind's satisfaction with itself in the things it enables you to do according to right reason".
Confidence moderate; if the drafter keeps "contentment", a line in `continuity.md` should record that III.6 and III.11 share the word.

**Finding 6.2 — Long's emphatic "do thou" left in a form that reads as a question — minor (worth improving).**
Source: "But do thou, I say, simply and freely choose the better, and hold to it."
Candidate: "But do you, I say, simply and freely choose the better, and hold to it."
"Do thou … choose" is the old emphatic imperative. "But do you … choose" is, in modern English, the shape of a question ("do you choose the better?"), and the reader carries that parse to the full stop before recovering the command. The imperative survives in modern English without "do".
Proposed: "But you, I say, simply and freely choose the better, and hold to it." (or "But, I say, simply and freely choose the better, and hold to it." — the first keeps Long's stressed pronoun).
Confidence high on the misparse; either proposal is within Long.

**Finding 6.3 — translator's alternative rendering folded into Marcus's sentence — minor (optional preference).**
Source: "that which is rationally and politically [or, practically] good"
Candidate: "what is rationally and politically, or practically, good"
Long's other brackets in Book III ("[deity]", "[death]", "[to the better things]", "[to other things]", "[from other things]") supply words the sense needs, and folding them is right. This one is different in kind: "[or, practically]" is Long offering a second translation of one Greek adverb, not a supplement to the sense. Folded, it reads as if Marcus named three kinds of good, or glossed "politically" himself. The glossary treats Long's cross-references and citations as apparatus and drops them; an alternative rendering is closer to that class than to a supplement. Against this: without it, "politically good" might be misread as party-political, and `continuity.md` records the fold deliberately. Drafter's choice; the two clean options are "what is rationally and politically good" (drop the apparatus) or the present text with the continuity note it already has.
Confidence moderate; the finding is a classification question, not a fidelity error.

Also noted, optional: "maintain thy judgment" → "hold to your judgment" gives the paragraph three "hold to / keep to" phrases in two lines (hold to it — keep to it — hold to your judgment) where Long varies the third; "maintain" is current English ("and maintain your judgment without arrogance"). Everything else in III.6 is present: the four virtues plus "in a word"; "in the condition assigned to you without your own choice"; "if, I say"; the god within with its five predicates (subjected the appetites; examines the impressions; detached from the persuasions of sense, with Socrates; submitted to the gods; cares for mankind); "smaller and of less value"; "give place to nothing else"; the "once diverge" warning with "without distraction"; the three competitors (praise from the many, power, enjoyment of pleasure); the "in a small degree … all at once" contrast; the dialogue dashes; the rational being / animal distinction (Long's own words, correctly kept per `continuity.md`); "by a sure method".

## III.7 — B03-P007

**Finding 7.1 — archaism left — minor (worth improving).**
Source: "he cares not at all"
Candidate: "he cares not at all"
The candidate modernises Long's verb-plus-"not" negations everywhere else in the book ("cares not for thoughts" → "cares nothing for thoughts" in III.4; "know not" → "do not know" in III.10 and III.15; "knows not" → "does not know" in III.11; "turn not away" → "do not turn away" in this same paragraph), so this one survivor stands out as the only "verb + not" in Book III.
Proposed: "he does not care at all".
Confidence high.

Everything else in III.7 is present: the seven things one must never be compelled to (break a promise, lose self-respect, hate, suspect, curse, act the hypocrite, desire what needs walls and curtains — the image kept); "his own intelligence and the god within, and the worship of its excellence" (glossary; "its" still refers to the god within, as in Long); the three negatives (no tragic part, no groan, neither solitude nor much company); "what is chief of all"; "[death]" folded; "for a longer or a shorter time"; "decency and order"; "this only all through life"; "intelligent being and a member of a community" per glossary.

## III.8 — B03-P008

No material issue found.

(The sore skinned over, the actor leaving the stage before the play ends, and the hiding-place are kept as images; the two folded brackets read naturally; the list "nothing servile, nor affected, nor too closely bound … nor yet detached … nothing worthy of blame, nothing that seeks a hiding-place" is complete. Also noted, optional: "chastened and purified" → "disciplined and purified". "Chastened" is current English (a "chastened" man) and means corrected, humbled by correction; "disciplined" means trained, and it is also Long's own word in III.1 ("a disciplined reason"), so the change creates an echo between III.1 and III.8 that Long does not have. "In the mind of one who is chastened and purified" would keep Long's word; drafter's discretion.)

## III.9 — B03-P009

No material issue found.

(Three sentences kept as three; "the faculty that produces opinion", "your ruling part", "the rational being" per glossary; the three promises — freedom from hasty judgment, friendship toward men, obedience to the gods — in order. "Inconsistent with nature" correctly not converted to the glossary's "against nature", since Long's phrase here is not "contrary to nature".)

## III.10 — B03-P010

No material issue found.

(The opening participle becomes a paired imperative without loss; "the present" and "fame after death" per glossary; "an indivisible point", "either past or uncertain", the three "short / small / short" measures, the succession of poor human beings with both their limits — soon to die, not knowing even themselves — and "much less the man who died long ago" all present.)

## III.11 — B03-P011

**Finding 11.1 — passive made reflexive, inconsistently within the paragraph — minor (optional preference).**
Source: "the thing which is presented to thee … every object which is presented to thee in life"
Candidate: "the thing presented to you … every object that presents itself to you in life"
Long uses the same passive twice in five lines; the candidate keeps it the first time and changes it to "presents itself" the second. The passive is the Stoic frame (impressions are *presented* to the mind, by whatever presents them); "presents itself" gives the object agency Long does not give it. Small, and the sentence is clear either way.
Proposed: "every object that is presented to you in life".

Also noted, optional: "how long it is the nature of this thing to endure that now makes an impression on me" inherits Long's displaced relative ("this thing … which now makes an impression on me" with "to endure" in between); "how long it is the nature of this thing that now makes an impression on me to endure" is the same words in modern order. Drafter's discretion. Everything else is present: "definition or description"; "substance, nakedness, complete entirety"; proper name and component names, "compounded … resolved"; "elevation of mind"; "methodically and truly"; the five things to see at once (what kind of universe; what use everything performs; value with reference to the whole; value with reference to man; the highest city of which all other cities are like families); the six virtues plus "and the rest"; "This comes from god" lowercase as Long has it; the dagger phrase "according to the apportionment and spinning of the thread of destiny" verbatim (with "such-like" → "suchlike" recorded); "the same stock, a kinsman and partner" (Long's extra "and" dropped, harmless); "one who does not know, however"; "But I know"; "the natural law of fellowship, with kindness and justice" (Book I family); "At the same time, however, in things that are indifferent I try to determine the value of each". "Wherefore" → "Therefore" keeps the inference.

## III.12 — B03-P012

No material issue found.

(One conditional sentence kept as one; "right reason", "your divine part" (Long's distinct phrase, correctly not merged with "the god within"), "give it back at once", "expecting nothing, fearing nothing", "according to nature", "heroic truth in every word and sound", "you will live happy" (Long's adjective) and the closing "no man who can prevent this" all present.)

## III.13 — B03-P013

No material issue found.

(The physicians' instruments and knives are kept as the image; "even the smallest"; "the bond that unites the divine and the human to one another"; the two-sided closing "neither … without at the same time referring it to things divine, nor the contrary". Also noted, optional: "have principles ready" → "have your principles ready" supplies a possessive Long does not have; harmless.)

## III.14 — B03-P014

No material issue found.

(The three things he will not read — memoirs, the acts of the ancient Romans and Greeks, the selections saved for old age — are kept as three; "wander at random", "Hasten, then, to the end you have before you", "throwing away idle hopes", "come to your own aid", "if you care at all for yourself", "while it is in your power" all present. "Hellenes" → "Greeks" follows the Book I precedent.)

## III.15 — B03-P015

**Finding 15.1 — modernised verb collides with the phrase before it — minor (worth improving).**
Source: "seeing what ought to be done; for this is not effected by the eyes, but by another kind of vision."
Candidate: "seeing what ought to be done; for this is not done by the eyes, but by another kind of vision."
Long's "this" is the seeing, and "effected" means brought about. The candidate's "done" repeats the "done" four words earlier, so a reader can take "this is not done by the eyes" as "what ought to be done is not done by the eyes" — a different (and odd) claim. The meditation is one sentence and lives on its last clause.
Proposed: "for this is not accomplished by the eyes, but by another kind of vision." ("brought about by the eyes" is the other plain option.)
Confidence high on the ambiguity; either proposal is within Long's sense.

The five words (stealing, sowing, buying, keeping quiet, seeing what ought to be done) are kept as five; the one-sentence meditation stays one sentence.

## III.16 — B03-P016

**Finding 16.1 — Long's plain word replaced by a more concrete one — minor (optional preference).**
Source: "nor does he deviate from the way which leads to the end of life"
Candidate: "nor does he turn aside from the road that leads to the end of life"
"Deviate from the way" is already modern English; "road" is a more concrete picture than Long's "way", and "the way" also carries the sense of manner ("the way one lives") that Long's word keeps in play. `continuity.md` records the change without a reason. Small.
Proposed: "nor does he turn aside from the way that leads to the end of life" (keeps the candidate's good verb, restores Long's noun).

**Finding 16.2 — serial comma dropped, inconsistent with the source convention and with III.6 — minor (optional preference).**
Source: "a simple, modest, and contented life"
Candidate: "a simple, modest and contented life"
The staged original and the candidate elsewhere use the serial comma (III.6 "justice, truth, temperance, fortitude, and, in a word"; III.11 "simplicity, contentment, and the rest"); this is the one list in Book III where it is dropped. The glossary's punctuation rule is "as in the staged original".
Proposed: "a simple, modest, and contented life".

Also noted, optional: "when they have shut the doors" → "once they have shut the doors" adds a shade of "as soon as"; Long's "when" is plain. Everything else in the meditation is present and in order: the three faculties with their three possessions; the three groups (animals; wild beasts, men made into women, a Phalaris and a Nero; the atheists, the traitors, the impure behind shut doors — all kept without gloss); "If, then, everything else is common to all those I have mentioned"; what is peculiar to the good man with both objects (what happens; the thread spun for him — kept as the image); the god within his breast (glossary, with Long's "breast" kept as recorded); "a crowd of images"; "keep it calm" (glossary); "following it obediently as a god"; the truth / justice pair; "if all men refuse to believe"; "neither angry … nor"; and the four closing states (pure, calm, ready to depart, without any compulsion perfectly reconciled).

---

## Summary

| Severity | Count | Paragraphs |
|---|---|---|
| **Substantive** (must fix) | **0** | — |
| **Minor** (drafter's discretion) | **12** | III.2 (2.1), III.4 (4.1, 4.2), III.5 (5.1), III.6 (6.1, 6.2, 6.3), III.7 (7.1), III.11 (11.1), III.15 (15.1), III.16 (16.1, 16.2) |
| No material issue | 8 | III.1, III.3, III.8, III.9, III.10, III.12, III.13, III.14 |

Of the 12 minor findings, 5 are "worth improving" (4.1, 6.1, 6.2, 7.1, 15.1) and 7 are "optional preference" (2.1, 4.2, 5.1, 6.3, 11.1, 16.1, 16.2). Classification, each counted once: dropped clause 0; added content 0 (the only candidates — "his understanding" in III.1, "your principles" in III.13 — are supplied possessives noted as optional, not findings); resolved ambiguity 1 (4.1, structural); expansion 0; voice drift 0; glossary inconsistency 1 (6.1, two Long words merged); imported rendering 0; archaism left 2 (6.2 "do you … choose", 7.1 "cares not"); other 8 (2.1 jingle from the glossary rule, 4.2 and 16.2 punctuation, 5.1 image shift, 6.3 apparatus folded, 11.1 passive made reflexive, 15.1 false echo, 16.1 plain word made concrete). The three dagger clauses (III.3, III.4, III.11) stand verbatim as the instructions require. No short section is expanded (III.9, III.12–III.15 stay at Long's length; III.15 at 38 words for Long's 37). No drift toward advice, moral lesson, or explanation for a modern reader anywhere in the book. No phrase identified as imported from another translation; I did not compare against other translations and claim nothing about them.

### Chapter-level findings (from the continuous read)

1. **Connectives.** The habit the Book II review flagged (dropping Long's "For", "But", "however", "then") is absent here: every inferential connective in Long's Book III is carried ("For if he begins…", "For you lose…", "For the man who is like this…", "For it is only…", "For the lot…", "for the man who has preferred…", "For nothing so produces…", "Therefore, on every occasion…", "But I know; and for this reason…", "For you will neither…", "for you will not read…", "for this is not…"). The one addition ("and for this reason", III.11) is harmless.
2. **Archaic syntax.** Two survivors, both in the second half of the book: "But do you, I say, … choose" (6.2) and "he cares not at all" (7.1). Everything else Long wrote with "thou"-forms, "not"-after-verb or inverted order has been recast. These two should be brought into line.
3. **Terminology.** The glossary is applied consistently for "the god within" (III.4, 5, 6, 7, 16), "your divine part" kept distinct (III.12), "the divine" (III.3), "the ruling part" (III.4, 9), "rational being" (III.4, 6, 9), "social being" (III.4), "the common good" (III.4 twice, III.5), "according to nature" (III.2, 4, 12), "impressions" in the technical sense (III.1, 6, 11) with the recorded III.16 exception, "opinion" (III.4, 9), "principles" (III.13, 16), "indifferent" (III.11), "the present" and "fame after death" (III.10), "calm" (III.5, 16), "kinsman" (III.4, 11), "the highest city" (III.11), "in a way" (III.2), "kind / kindness" (III.4, 11), and Long's intelligence / understanding / mind kept apart. The one inconsistency is 6.1, where the candidate's "contentment" for "self-satisfaction" collides with Long's own "contentment" in III.11.
4. **Long's plain words replaced.** A small pattern of the kind noted in Book I: "set off" → "dress up" (5.1), "chastened" → "disciplined" (III.8, noted), "maintain" → "hold to" (III.6, noted), "way" → "road" (16.1), "effected" → "done" (15.1), "when" → "once" (III.16, noted). Each swaps a word Long has that is already modern for a near-synonym that is slightly less exact; the drafter should prefer Long's word where it works.

### Flow judgement

Read straight through from III.1 to III.16, the candidate is Long's Book III with the archaisms gone and nothing else changed: the two long meditations (III.4 at 493 words, III.6 at 307) carry Long's argument sentence by sentence in Long's order, with the lists intact (the eight effects of the god within, the five virtues and "the rest", the three faculties and three groups), the dialogue dashes kept, and the dagger clauses left exactly as obscure as Long leaves them. The voice is Marcus's own — self-addressed, imperative, unexplained: "get out"; "Throw away everything, then"; "No longer wander at random"; "come to your own aid, if you care at all for yourself, while it is in your power." The images are all still images (split bread, gaping figs, olives near rottenness, the lion's eyebrows, boar's foam, the voyage and the shore, lice and mud, walls and curtains, the sore skinned over, the actor leaving the stage, the physicians' knives, the thread spun for him). The short sections stay short; the one-sentence III.15 stays one sentence. Transitions between meditations are the source's abrupt cuts. The weaknesses are all small and of two kinds: two remaining pieces of old syntax (6.2, 7.1) and a handful of places where Long's already-modern word has been swapped for a near-synonym that says slightly more or slightly less (dress up, road, done, disciplined, contentment). None changes what Marcus says. Apply the five "worth improving" items and the book reads as Long's Book III in modern dress, at the standard the accepted Books I and II set.

### Verdict

**Accept after corrections.** There is no substantive finding. The book can be accepted once the drafter has considered the 12 minor findings; recommended for application: the five "worth improving" items (4.1, 6.1, 6.2, 7.1, 15.1), and among the optional ones 16.2 (a straightforward source-convention match) and 5.1. If the drafter prefers to accept v1 unchanged, the review does not block it, but 6.2 (a sentence that parses as a question) and 15.1 (a one-sentence meditation whose last clause can be misread) should not be left unaddressed without a recorded reason.

### Coverage and limitations

- Every paragraph III.1–III.16 was read source-beside-candidate in packet order with the supplied context, then the whole candidate was read continuously. Every Long clause was checked for presence, including qualifiers, negations, the length and order of every list, and the three dagger clauses against the PG base text.
- The review is against Long's English only, as instructed. Where I note that an alternative reading of Long is available (4.1, 6.1, 6.3), the confidence given reflects that; I did not consult the Greek, and the candidate is not required to match the Greek over Long.
- No other translation was consulted, so "imported rendering" could only have been caught where a phrase departs from Long in a way Long's own words do not explain; none was found. Absence of such a finding is not proof.
- The mechanical checks were re-run and passed; word ratios were used only as a screening signal.
- Errors can remain; this review does not claim otherwise.
