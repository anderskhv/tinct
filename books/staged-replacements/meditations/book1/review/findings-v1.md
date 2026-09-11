# Independent review — Meditations, Book I, candidate v1

| | |
|---|---|
| Reviewer | Independent reviewer subagent spawned by the Tinct coordinator; did not draft the candidate and did not consult the drafter |
| Date | 2026-09-11 |
| Branch | `claude/meditations-modern-en-20260911-v2` |
| Candidate | `book1/candidate-v1.json`, sha256 `e1d816d39c5eba0d38f3f6adf7e7f511866290119fb812958eb5e4a6f57ff597` (recomputed locally with `sha256sum`; matches `manifest.json`'s package check and `provenance.json`) |
| Source | George Long 1862, `book1/source-book1.json`, byte-identical to chapter 1 of `../meditations-original-en.staged.json`; dagger positions confirmed in `source/pg15877-long-1862.txt` (I.9 after "form opinions without consideration:", I.14 before "consistency and undeviating steadiness", I.15 after "humorous in an agreeable way."); the I.17 ellipsis after "giddiness" sits at Long's footnote [C] |
| Packets reviewed | `review-packets/packet-01.md` … `packet-06.md`, in order, three paragraphs at a time (packet 6: two) with the supplied context; then `candidate-v1-readable.md` read straight through |
| Standard | `GLOSSARY.md`, `WORKFLOW.md` (Anders's voice rules), `review-instructions.md`, `continuity.md`; `book2/review/findings-v1.md` and `book2/ACCEPTANCE.md` read first for calibration |

Mechanical checks from `book1/README.md` were re-run before reading: hash, paragraph count (17 = 17, matching Long's I.1–I.17), packet coverage (B01-P001…P017 each exactly once, in order), packet text identical to the JSON. All passed. Per-paragraph word ratios 0.92–1.07 (I.4's 1.07 is two words on a 30-word section; nothing is padded).

Severity: **substantive** = must be fixed before acceptance (review-instructions "Must fix"). **minor** = drafter's discretion ("Worth improving" or "Optional preference", stated in each entry). Every proposed wording stays inside Long's words and the glossary. Confidence is stated where a plausible alternative reading exists.

---

## I.1 — B01-P001

No material issue found.

(Long's bracketed "[I learned]" folded into prose per glossary and `continuity.md`; "government of my temper" → "the governing of my temper" keeps Long's verb. "To govern my temper" would be a shade more natural, but the gerund is not wrong and the drafter's reason for avoiding "control" is sound.)

## I.2 — B01-P002

No material issue found.

## I.3 — B01-P003

**Finding 3.1 — glossary-style inconsistency (Long's "beneficence / benevolent" family rendered four ways) — minor (worth improving).**
Source: "piety and beneficence" (I.3); "does benevolent acts" (I.7); "a benevolent disposition" (I.9); "acts of beneficence" (I.15)
Candidate: "piety and generosity" (I.3); "does good deeds" (I.7); "a kindly disposition" (I.9); "doing kindnesses" (I.15)
`GLOSSARY.md` does not fix this family, and `continuity.md` records "generosity; kindnesses" for I.3 and I.15, so the departure is recorded; the finding is the spread. Long uses one word-family four times in a book that is a catalogue of the same virtues seen in different people; the candidate gives it four different words, and "generosity" in I.3 narrows Long's "beneficence" (doing good in general) toward giving. "Kindness" is the modern word closest to Long's sense and is already the candidate's choice in I.9 and I.15.
Proposed: I.3 "piety and kindness"; I.7 "or as one who does kind acts for display" (or keep "good deeds"; it is the I.3 narrowing that matters most). Drafter's discretion on I.7 and I.9.

Everything else in I.3 is present: both negations ("not only from evil deeds but even from evil thoughts"), "and further", "simplicity in my way of living", "far removed from the habits of the rich". "Abstinence" → "to abstain" is a noun-to-infinitive change of the kind Long's own lists make.

## I.4 — B01-P004

No material issue found.

## I.5 — B01-P005

**Finding 5.1 — added specificity — minor (worth improving).**
Source: "at the games in the Circus"
Candidate: "at the races in the Circus"
Long says "games"; the candidate says which games. The Green and Blue were chariot factions, so "races" is not false, but it is a fact supplied by the drafter, not by Long, and "games" is plain modern English. The sentence already places the Parmularius and Scutarius "at the gladiators' fights", so the pairing "games in the Circus / gladiators' fights" carries the contrast Long makes.
Proposed: "at the games in the Circus".
Confidence high that the word is added; low stakes.

Accepted: "my governor" → "my tutor" (recorded in `continuity.md`, one word, within Long's sense); "endurance of labor" → "to endure hard work" ("hard" is a small intensifier Long does not have, but "to endure work" is not English and "labor" already means toil; drafter's discretion); "not to be ready to listen to slander" → "not to be quick to listen to slander". All five items of the second chain are present in order.

## I.6 — B01-P006

**Finding 6.1 — added content / resolved ambiguity — minor (worth improving).**
Source: "to have desired a plank bed and skin"
Candidate: "to have wanted a plank bed and a skin to lie on"
`continuity.md` flags "to lie on" as the one deliberate expansion in the book, with the reason that Long's following clause ("whatever else of the kind belongs to the Grecian discipline") implies it. It does not: the clause says the skin belongs to the ascetic kit, not what it is for. A skin can be lain on or slept under, and Long leaves that open; the candidate closes it. Long's phrase is intelligible modern English as it stands (the reader knows a skin is an animal hide and that it goes with a plank bed).
Proposed: "to have wanted a plank bed and a skin, and whatever else of that kind belongs to the Greek discipline".
Confidence high that the words are added; moderate that the reader needs nothing in their place.

**Finding 6.2 — tense shift — minor (optional preference).**
Source: "not to give credit to what was said by miracle-workers and jugglers about incantations"
Candidate: "not to believe what miracle-workers and conjurers say about incantations"
Long's past tense reports what was said in Marcus's youth; the candidate's present makes it a general statement about what such people say. Small, and the general reading is natural.
Proposed: "not to believe what was said by miracle-workers and conjurers about incantations".

Accepted: "daemons" → "spirits" (the recorded exception to the glossary's "the god within" is right: these are the beings charlatans claim to expel); "[for fighting]" folded; "to endure freedom of speech" → "to put up with frank speech"; "to have been a hearer, first of Bacchius" → "to have heard first Bacchius" (Long's "hearer" means pupil, and "heard" still carries that in a philosophical context). All nine items present in order.

## I.7 — B01-P007

**Finding 7.1 — idiom shift in the opening verb — minor (worth improving).**
Source: "From Rusticus I received the impression that my character required improvement and discipline"
Candidate: "From Rusticus I got the impression that my character needed improvement and discipline"
In current English "I got the impression that…" means "I vaguely inferred that…", a hunch; Long's "received the impression" means the idea was impressed on him, which is what the rest of the section shows Rusticus doing. The candidate's verb makes the opening of the longest debt to a teacher sound casual. "Received the impression" is not archaic.
Proposed: "From Rusticus I received the impression that my character needed improvement and discipline".
Confidence moderate: the candidate's reading is available in Long's English; the finding is the tonal drift.

Also noted, optional: "to be easily disposed to be pacified and reconciled" → "to be easily appeased and reconciled" drops Long's "disposed" (a disposition to be pacified, not the fact of being pacified). Near-equivalent; drafter's discretion. Everything else is present in Long's order: the four "nor into…" items, the three things to keep away from, the house/outdoor clothes item, the Sinuessa letter, the reconciliation clause with its condition ("as soon as they show a readiness"), reading carefully, assent, and the Epictetus debt. The one-sentence shape is kept, as `continuity.md` intends.

## I.8 — B01-P008

No material issue found.

(All eight items present in order; "not even for a moment" kept; the three occasions of sameness kept as three; "both most resolute and yielding" kept; "the smallest of his merits" → "the least of his merits"; the closing "either humbled by them or letting them pass unnoticed" intact. "Undeviating" → "unwavering" here is a plain synonym in a clause Long does not mark; see I.14 for the marked one.)

## I.9 — B01-P009

**Finding 9.1 — dagger-marked clause reworded — minor (worth improving).**
Source: "and those who form opinions without consideration:" (Long's dagger follows)
Candidate: "and of those who form opinions without thought."
Long marks this clause as textually uncertain, and `review-instructions.md` says to preserve it as Long has it. The candidate changes "consideration" to "thought". The sense is nearly the same and the change adds no clarity, so the word swap is gratuitous; "consideration" is current English. The Book II round treated the dagger clauses as fixed text (II.6, II.14 left verbatim; II.12 restored), and Book I should follow the same rule.
Proposed: "and tolerance of ignorant people and of those who form opinions without consideration."
Confidence high that the word changed; the meaning risk is low, which is why this is minor.

**Finding 9.2 — repetition introduced — minor (optional preference).**
Source: "and at the same time he was most highly venerated … but was entirely free from passion, and also most affectionate"
Candidate: "and at the same time he was held in the highest veneration … but was entirely free from passion and at the same time most affectionate"
Long has "at the same time" once; the candidate has it twice in consecutive sentences, and the second changes Long's plain "and also" into a contrastive hinge. "Also" is fine modern English.
Proposed: "but was entirely free from passion, and also most affectionate".

Also noted, optional: "the example of a family governed in a fatherly manner" → "a household governed in a fatherly way". Long's "family" is plain modern English; "household" widens it (servants, dependants) in a way Long does not state. "The example of a family governed in a fatherly way" keeps Long's word. Drafter's discretion.

Accepted: Long's one sentence split into three at his own colons, nothing reordered; "living conformably to nature" → "living according to nature" (glossary); "gravity" → "seriousness"; "intercourse with him" → "his company"; "approbation" → "approval". All items present, including "in an intelligent and methodical way" and "without noisy display / without ostentation".

## I.10 — B01-P010

No material issue found.

(Long's structure — refrain from fault-finding; not chide reproachfully; introduce the right expression by answer, by confirmation, by joining an inquiry into the thing not the word, or by another apt suggestion — is kept with all four routes. "In confirming what was said" supplies an object for Long's bare "giving confirmation"; it is the only object the sentence allows, so it is not a resolved ambiguity.)

## I.11 — B01-P011

**Finding 11.1 — polysyndeton flattened — minor (optional preference).**
Source: "what envy and duplicity and hypocrisy are in a tyrant"
Candidate: "what envy, duplicity and hypocrisy are in a tyrant"
The "and … and" chain is the form of Book I and the brief asks that it be kept. In a section of one sentence the three "and"s are the section's only rhythm.
Proposed: "what envy and duplicity and hypocrisy are in a tyrant".

Everything else is present: "generally" → "in general", "those among us who are called Patricians", "rather lacking in fatherly affection".

## I.12 — B01-P012

**Finding 12.1 — qualifier compressed away — minor (worth improving).**
Source: "the neglect of duties required by our relation to those with whom we live"
Candidate: "the neglect of the duties we owe to those we live with"
Long says where the duties come from: they are required by the relation. "We owe" states the obligation but drops its ground, which is the point of the section (the duties are not optional because they follow from living with people). The clause can be modernised without losing it.
Proposed: "the neglect of the duties our relation to those we live with requires" or "the neglect of the duties that living with people lays on us" — the first is closer to Long.
Confidence moderate: "we owe" is a fair summary; the finding is a dropped clause, not a changed meaning.

Accepted: "Alexander the Platonic" → "Alexander the Platonist" (recorded); "I have no leisure" → "I have no time"; "nor continually to excuse" → "nor to keep excusing"; "alleging urgent occupations" → "pleading urgent business". Both negations and "nor without necessity" kept.

## I.13 — B01-P013

No material issue found.

## I.14 — B01-P014

**Finding 14.1 — dagger-marked clause reworded — minor (optional preference).**
Source: "I learned from him also [dagger] consistency and undeviating steadiness in my regard for philosophy"
Candidate: "I learned from him also consistency and unwavering steadiness in my regard for philosophy"
Same rule as 9.1: Long marks this clause; "undeviating" → "unwavering" changes a word in it without gain. Here the swap is at least consistent with I.8 and I.16, where the same Long word is unmarked, so this is optional; if the drafter keeps "unwavering" for consistency across the three uses, record in `continuity.md` that the dagger clause was touched and why.
Proposed: either "consistency and undeviating steadiness in my regard for philosophy" here only, or leave as is with the note.

**Finding 14.2 — connective changed (contrast to cause) and catalogue verb changed — minor (optional preference).**
Source: "and in him I observed no concealment of his opinions with respect to those whom he condemned, and that his friends had no need to conjecture what he wished or did not wish, but it was quite plain."
Candidate: "and in him I saw no concealment of his opinions about those he condemned, and that his friends never had to guess what he wished or did not wish, for it was quite plain."
Two small things. Long's "but" is contrastive (not guessed at; rather, plain); "for" makes it causal. Both are true of Severus, but Long's is the one in the source. And "I observed" is the verb Long uses for the catalogue of things seen in a person (I.14, I.15 twice, I.16 three times); the candidate keeps it everywhere except here.
Proposed: "and in him I observed no concealment of his opinions about those he condemned, and that his friends never had to guess what he wished or did not wish, but it was quite plain."

Accepted: "polity" → "commonwealth" (glossary), with Long's repeated "a polity … a polity" collapsed into one noun phrase and nothing lost; "kingly government" → "kingly rule"; "learned to know" → "came to know"; all five names in order; the four-item chain "do good / give readily / cherish good hopes / believe I am loved" intact; Long's sentence split once at his semicolon.

## I.15 — B01-P015

**Finding 15.1 — glossary inconsistency ("appearance" in the outward-looks sense) — minor (worth improving).**
Source: "he presented the appearance of a man who could not be diverted from right"
Candidate: "he gave the impression of a man who could not be turned from the right"
`GLOSSARY.md` reserves "impressions" for Long's technical *phantasiai* and says "'Appearances' is kept only where Long means outward looks (I.15, I.16)". This is the I.15 instance the glossary names, and the candidate replaces it with "impression". Two sections later (I.17) "impressions" is used in the technical sense ("clear and frequent impressions of living according to nature"), so the same word now does both jobs within the book. `continuity.md` records the change but not as a glossary exception.
Proposed: "he had the appearance of a man who could not be turned from the right, rather than of a man who had been improved." ("Presented the appearance" is also fine; "had" is the smaller modernisation.)
Confidence high: the glossary text is explicit.

**Finding 15.2 — "and … and … nor" chain flattened — minor (optional preference).**
Source: "and he never showed amazement and surprise, and was never in a hurry, and never put off doing a thing, nor was perplexed nor dejected, nor did he ever laugh to disguise his vexation, nor, on the other hand, was he ever passionate or suspicious."
Candidate: "and he never showed astonishment or surprise, was never in a hurry, never put off doing a thing, was never perplexed or dejected, never laughed to cover his annoyance, and, on the other hand, was never passionate or suspicious."
All seven items survive in order, so this is form, not content. Long's chain of "and … nor … nor" is the catalogue rhythm the brief asks to keep; the candidate's asyndeton reads as a modern list. The candidate keeps the chain in I.16 and I.17, so this section stands out.
Proposed: "and he never showed astonishment or surprise, and was never in a hurry, and never put off doing a thing, nor was he perplexed or dejected, nor did he ever laugh to cover his annoyance, nor, on the other hand, was he ever passionate or suspicious."

**Finding 15.3 — glossary family ("vexation") — minor (optional preference).**
Source: "laugh to disguise his vexation"
Candidate: "laugh to cover his annoyance"
The glossary maps Long's "vexed" to "resent / resentful". The noun "vexation" here is the everyday sense (irritation), where "resentment" would be heavier than Long, so "annoyance" is defensible; but the departure from a glossary family should be recorded as such in `continuity.md`, which at present lists it only as a wording change. No change to the text required if the note is added.

Accepted: "self-government" → "self-mastery"; "as well as in illness" → "illness included"; "admixture" → "blend"; "acts of beneficence" → "kindnesses" (see 3.1); "think himself a better man" → "the better man"; the dagger sentence "He also had the art of being humorous in an agreeable way." kept as Long has it.

## I.16 — B01-P016

**Finding 16.1 — archaism left that now misleads, and a dropped qualifier — minor (worth improving).**
Source: "he released his friends from all obligation to sup with him or to attend him of necessity when he went abroad"
Candidate: "he released his friends from any obligation to dine with him or to attend him when he went abroad"
In Long's English "went abroad" means went out, away from home; a modern reader hears foreign travel, and the clause is about friends attending him on his outings, with the next clause about those "kept from accompanying him". The candidate modernised "sup" in the same clause but left "abroad". Also dropped: Long's "of necessity", which is what the friends were released from (attending him as a duty).
Proposed: "he released his friends from any obligation to dine with him or to attend him as a matter of course when he went out, and that those who had been kept from accompanying him by urgent circumstances always found him the same." ("As a matter of course" for "of necessity"; or "to attend him of necessity" left as is — it is intelligible.)
Confidence moderate on "abroad" (Long's word can bear the foreign sense; the context makes the outings reading the natural one); high on "of necessity" being dropped.

**Finding 16.2 — resolved ambiguity — minor (worth improving).**
Source: "and when he had them not, he did not want them"
Candidate: "and when he did not have them he did not miss them"
Long's "want" here can be "desire", "need" or "feel the lack of"; the candidate picks the third. "He did not want them" is plain modern English (it reads as "did not desire them", which is at least as close to Long as "miss" is) and keeps the ambiguity.
Proposed: "and when he did not have them he did not want them."

**Finding 16.3 — internal echo lost — minor (worth improving).**
Source: "a man ripe, perfect, above flattery" … "a man who has a perfect and invincible soul"
Candidate: "a man mature, complete, above flattery" … "a man who has a perfect and invincible soul"
Long uses "perfect" twice in the section, first of the man and last of his soul; the closing sentence answers the earlier verdict. The candidate keeps "perfect" at the close but changes the first to "complete", breaking the echo. "Perfect" is current.
Proposed: "a man mature, perfect, above flattery, and able to manage his own affairs and other men's."

Also noted, optional: "he loved to stay in the same places" → "he liked to stay" weakens Long's verb without need. "The occasions for vigorous action and for remission" → "when to act vigorously and when to relax" is a fair modernisation of "remission" ("ease off" would be a shade closer). "Provide for the smallest matter" supplies "matter" for Long's bare "the smallest"; harmless.

Everything else in Long's 881 words is present, in Long's order, sentence by sentence: the seven opening observations; passion for boys / no more than any citizen / friends released; careful inquiry, persistence, not stopping at first appearances ("appearances" correctly kept per glossary); keeping friends with both limits; content and cheerful; foresight; checking applause; watchfulness over the empire, expenditure, and the blame; neither superstitious nor courting men by the three routes; sobriety, firmness, no meanness, no love of novelty; the comforts of life with both halves of the conditional; sophist / flippant home-bred slave / pedant, and the four-part acknowledgement; the three attitudes to philosophers; easy in conversation; the body's health with its three "not"s and the three medical resources; giving without envy to those with abilities (the open object correctly left open); the institutions of his country; not fond of change; headaches; secrets; prudence and economy in the three public expenditures with the reason; baths, houses, food, clothes, slaves; Lorium and Lanuvium; the toll-collector at Tusculum left bare; the four "nor"s including "the sweating point"; the Socrates comparison with both halves; the closing sentence with the illness of Maximus. "[home-bred]" folded; "common weal" → "the common good" (glossary).

## I.17 — B01-P017

**Finding 17.1 — certainty doubled — minor (worth improving).**
Source: "in which I should perhaps have been completely engaged, if I had seen that I was making progress in them"
Candidate: "in which I might perhaps have been completely absorbed if I had seen that I was making progress in them"
Long's "should … have been" is the ordinary conditional ("would have been"), hedged once by "perhaps". The candidate's "might" adds a second hedge, so the sentence now doubts twice what Long doubts once. The plain modern equivalent is "would".
Proposed: "in which I would perhaps have been completely absorbed if I had seen that I was making progress in them".
Confidence high.

**Finding 17.2 — unidiomatic verb — minor (optional preference).**
Source: "when I had an inclination to philosophy"
Candidate: "when I took an inclination to philosophy"
"Took an inclination" is not an English idiom ("took a liking", "had an inclination"); Long's phrase is plain modern English.
Proposed: "when I had an inclination to philosophy".

Also noted, optional: the ellipsis after "dizziness" is the single character "…" where the staged source has "..."; the glossary's punctuation rule ("as in the staged original") suggests keeping the three-dot form so the two files match. Either way the gap is kept, correctly.

Everything else in Long's 663 words is present in order: the seven "good" items; the offence against the gods with its concession ("though I had a disposition which…") and its cause ("through their favor"); the concubine; the flower of youth and the deferred proof of manhood; the ruler and father, the palace without the four kinds of show, the private person's way "without on that account" the two failings, the common good (glossary) and "in a manner that befits a ruler"; the brother with both effects; the children; the studies with their condition; those who brought him up, placed in honor without delay, with the reason; the three teachers; the impressions (glossary, technical sense) of living according to nature with the whole "so that … though I still fall short" clause including "I might almost say, their direct instructions"; the body; Benedicta and Theodotus; passions of love and the cure; Rusticus; the mother; the two halves of the means clause; the wife's three adjectives; teachers for the children; the dream remedies with the gap; philosophy without sophist, histories, syllogisms or heavenly appearances ("appearances in the heavens" correctly kept as Long has it); the closing reason; "Written among the Quadi, at the Granua." per glossary.

---

## Summary

| Severity | Count | Paragraphs |
|---|---|---|
| **Substantive** (must fix) | **0** | — |
| **Minor** (drafter's discretion) | **19** | I.3 (3.1), I.5 (5.1), I.6 (6.1, 6.2), I.7 (7.1), I.9 (9.1, 9.2), I.11 (11.1), I.12 (12.1), I.14 (14.1, 14.2), I.15 (15.1, 15.2, 15.3), I.16 (16.1, 16.2, 16.3), I.17 (17.1, 17.2) |
| No material issue | 6 | I.1, I.2, I.4, I.8, I.10, I.13 |

Of the 19 minor findings, 11 are "worth improving" (3.1, 5.1, 6.1, 7.1, 9.1, 12.1, 15.1, 16.1, 16.2, 16.3, 17.1) and 8 are "optional preference" (6.2, 9.2, 11.1, 14.1, 14.2, 15.2, 15.3, 17.2). Classification, each counted once: dropped clause 2 (12.1, 16.1 "of necessity"); added content 2 (5.1, 6.1); resolved ambiguity / certainty 2 (16.2, 17.1); glossary inconsistency 3 (3.1, 15.1, 15.3); dagger clause altered 2 (9.1, 14.1); archaism left 1 (16.1 "abroad", counted with the same entry); form / chain flattened 2 (11.1, 15.2); voice / idiom 3 (7.1, 9.2, 17.2); imagery / echo lost 1 (16.3); other wording 2 (6.2, 14.2). No expansion of a short section (I.1–I.4 stay one line each; the only deliberate addition, 6.1, is four words). No voice drift: nothing in the book turns toward praise addressed to a reader, a moral lesson, or an explanation of who these people were; the "From X:" catalogue is kept as a catalogue and Long's own verbs ("I learned", "I received the impression", "I observed", "I owe it", "I am thankful") are kept where he has them, with the two exceptions noted (7.1, 14.2). No phrase identified as imported from another translation; I did not compare against other translations and claim nothing about them.

### Chapter-level findings (from the continuous read)

1. **Dagger clauses.** Long marks three clauses in Book I as uncertain (I.9, I.14, I.15). The candidate leaves I.15 verbatim and changes one word in each of I.9 and I.14. Neither change alters the sense, but the Book II round established that marked clauses are left as Long has them; Book I should apply the same rule (9.1, 14.1), or record the touch in `continuity.md`.
2. **The "and … and … nor" chain.** Kept almost everywhere, including through the whole of I.16 and I.17, which is the hard part and is done well. It is flattened in two places (I.11, I.15) where the candidate switches to comma lists. Restoring it costs nothing and makes the book sound like one list rather than a list with two modern paragraphs in it.
3. **Terminology.** The glossary is applied consistently for "according to nature", "the common good", "commonwealth", "principles", "assent", "reason", "philosophy", "the gods", and "impressions" in its technical sense (I.17). The one explicit glossary instruction for this book that is not followed is I.15 "appearance" (15.1). Long's "beneficence / benevolent" family is spread over four renderings (3.1). "Undeviating" is rendered "unwavering" consistently across I.8, I.14, I.16.
4. **Long's own plain phrases replaced without need.** A small pattern: "received the impression" → "got the impression" (7.1), "family" → "household" (I.9), "loved" → "liked" (I.16), "had an inclination" → "took an inclination" (17.2), "did not want them" → "did not miss them" (16.2), "should perhaps" → "might perhaps" (17.1). Each is a word Long has that is already modern; the drafter should prefer Long's word where it works.

### Flow judgement

Read straight through from I.1 to I.17, the candidate is Long's Book I in modern dress and nothing else: a ledger of debts, short entries first, the two long entries for the father and the gods at the end, each name followed by its list. The voice is Marcus's — first person, unembellished, never explaining to anyone who Rusticus or Maximus was, never drawing a moral from the list. The short sections stay short; the colon-for-ellipsis convention in the verbless sections reads naturally and does not invent a verb. The two long sections are the test of the draft and they pass it: I.16's 881 words and I.17's 663 are carried in Long's order, sentence by sentence, with the chains intact, the anecdotes left bare (the toll-collector, Benedicta and Theodotus), the concessions kept ("though I still fall short of it through my own fault"), and the manuscript note at the close. The transitions between sections are the source's abrupt cuts. The weaknesses are all small and of one kind: a handful of places where Long's already-modern word is swapped for a near-synonym that is slightly less exact (got / household / liked / miss / might / took), two flattened chains, two touched dagger clauses, and one four-word addition. None changes what Marcus says he owes to whom. Apply the recommended minor corrections and the book reads as Long's list with only the archaisms gone.

### Verdict

**Accept after corrections.** There is no substantive finding. The book can be accepted once the drafter has considered the 19 minor findings; recommended for application: the eleven "worth improving" items (3.1 at least for I.3, 5.1, 6.1, 7.1, 9.1, 12.1, 15.1, 16.1, 16.2, 16.3, 17.1) and the two chain restorations 11.1 and 15.2. If the drafter prefers to accept v1 unchanged, the review does not block it, but 15.1 (an explicit glossary instruction for this section) and 6.1 (the only invented content in the book) should not be left unaddressed without a recorded reason.

### Coverage and limitations

- Every paragraph I.1–I.17 was read source-beside-candidate in packet order with the supplied context, then the whole candidate was read continuously. Every Long clause was checked for presence, including qualifiers, negations, the length and order of every list, and the three dagger clauses and the I.17 ellipsis against the PG base text.
- The review is against Long's English only, as instructed. Where I note that an alternative reading of Long is available (7.1, 12.1, 16.1), the confidence given reflects that; I did not consult the Greek and the candidate is not required to match the Greek over Long.
- No other translation was consulted, so "imported rendering" could only have been caught where a phrase departs from Long in a way Long's own words do not explain; none was found. Absence of such a finding is not proof.
- The mechanical checks were re-run and passed; word ratios were used only as a screening signal.
- Errors can remain; this review does not claim otherwise.
