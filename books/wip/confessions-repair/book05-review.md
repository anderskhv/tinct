# Confessions Book 5 — Independent Adversarial Review

Reviewer: independent reviewer (did not draft).
Candidate reviewed: `book05-candidate.json`, sha256 `810b5a38410ea7684bf4bb3e17abab3de05fee38a70e69d99625a38d1960c67c` — **hash verified against the frozen file**.
Source of truth: `book05-source.json` (Pusey 1838), `paragraphs` array.
Structure: source 25 paragraphs / candidate 25 paragraphs, **one-to-one, confirmed**. `number: 5`, `title: "Book 5"` both match source.

Paragraph indexing in this document is **0-based (array index)**, with the 1-based number in parentheses, because the drafter's notes numbering is unreliable (see "Notes-file reliability" below).

---

## 1. Question-mark parity — independently counted

Counted mechanically by script over both JSON files, not taken from the notes.

| idx (1-based) | source `?` | candidate `?` | match |
|---|---|---|---|
| 0 (1) | 1 | 1 | OK |
| 1 (2) | 5 | 5 | OK |
| 2 (3) | 0 | 0 | OK |
| 3 (4) | 0 | 0 | OK |
| 4 (5) | 0 | 0 | OK |
| 5 (6) | 0 | 0 | OK |
| 6 (7) | 1 | 1 | OK |
| 7 (8) | 1 | 1 | OK |
| 8 (9) | 1 | 1 | OK |
| 9 (10) | 1 | 1 | OK |
| 10 (11) | 1 | 1 | OK |
| 11 (12) | 0 | 0 | OK |
| 12 (13) | 1 | 1 | OK |
| 13 (14) | 0 | 0 | OK |
| 14 (15) | 1 | 1 | OK |
| 15 (16) | 2 | 2 | OK |
| 16 (17) | 3 | 3 | OK |
| 17 (18) | 0 | 0 | OK |
| 18 (19) | 0 | 0 | OK |
| 19 (20) | 0 | 0 | OK |
| 20 (21) | 0 | 0 | OK |
| 21 (22) | 0 | 0 | OK |
| 22 (23) | 0 | 0 | OK |
| 23 (24) | 0 | 0 | OK |
| 24 (25) | 0 | 0 | OK |
| **TOTAL** | **18** | **18** | **PASS** |

**Gate result: PASS.** 18/18, exact per-paragraph parity. The Book 3/4 flattening failure mode does not recur here at the count level. Every source interrogative is realised as a genuine interrogative, not an exclamation or a declarative. One distribution nuance inside para 16 (17) is logged as finding m10 — the count is right, but the question boundaries were moved.

**Notes-file reliability.** The drafter's `?` table is correct and my independent count confirms it. However, the notes' *prose* paragraph numbers are inconsistent: "Paragraph 19 (harbor/deception scene)" is actually 1-based 15; "Paragraph 20 (illness in Rome)" is actually 1-based 16 (and the notes' own table gives paragraph 20 a `?` count of 0 while the prose describes its rhetorical question — an internal contradiction); "paragraph 25 explicitly says the Catholic cause seemed not vanquished" is actually 1-based 24. Paragraphs 17 and 24 are cited correctly. Consequence: **the drafter's self-flag of "paragraphs 1, 9, 14, 20" cannot be trusted to point at the paragraphs they meant.** I therefore gave extra scrutiny to both readings — indices 0, 1, 8, 9, 13, 14, 19, 20 — covering 1-based 1/2/9/10/14/15/20/21.

Word-count ratios (candidate/source) run 1.00–1.25, mean ~1.07. No paragraph is under the 75% floor; nothing looks summarised.

---

## 2. Packet-by-packet findings

### Packet A — idx 0–2 (1-based 1–3)

**idx 0 (1) — flagged paragraph. Finding m1, minor — softened term.**
Source: "for Thou dissolvest it at Thy will **in pity or in vengeance**".
Candidate: "you dissolve it at your will, whether in pity or **in judgment**".
"Vengeance" (*in vindicta*) is the harder of the pair and is what makes the antithesis bite; "judgment" is the neutral churchy default. Proposed: "in pity or in vengeance".
Otherwise this paragraph is clean: "seeing a closed heart closes not out Thy eye" → "a closed heart does not shut out your eye" preserves the clause structure without inventing a connective; "creation animate or inanimate" → "creation, living or lifeless" ✓; "leaning on those things which Thou hast created, and passing on to Thyself" ✓ (the added "through them" is a licit reading of "passing on to"). The drafter's worry about clause-order drift here is not borne out.

**idx 1 (2) — flagged paragraph. No issues.**
All five questions intact and in source order. "dividest the darkness" → "split the darkness" ✓; "because Thou forsakest nothing Thou hast made" kept as parenthetical ✓; "not as they have forsaken their Creator, hast Thou forsaken Thy creation" correctly un-inverted ✓; "nor did I find myself, how much less Thee!" ✓. No dropped clause found.

**idx 2 (3) — Finding m2, minor — added hedge.**
Source: "the science which this Faustus, so praised among them, **set before me to feed upon**".
Candidate: "the knowledge that this Faustus, so celebrated among them, **was said to offer** as food".
"Was said to" inserts a reported-speech hedge the source does not have; Pusey states it flatly. Proposed: "the knowledge that this Faustus, so celebrated among them, set before me to feed on".
Otherwise clean: "nine-and-twentieth year" → "twenty-ninth year" ✓; the concessive "which though I did commend, yet could I separate from the truth" is correctly rendered and not collapsed; "number the stars and the sand" ✓.

### Packet B — idx 3–5 (1-based 4–6)

**idx 3 (4) — no issues.** The long eclipse period survives intact, including "how many digits" → "to what degree" (acceptable modernisation of the technical term), "they foresee a failure of the sun's light, which shall be... but see not their own, which is" → "an eclipse... that is going to happen — but they do not see their own, which is already happening" ✓, and the full birds/fish/beasts triad with the consuming-fire close ✓.

**idx 4 (5) — Finding m3, minor — broken parallel, added valence.**
Source: "**attributing** to themselves what is Thine; and thereby with most perverse blindness, study to **impute** to Thee what is their own".
Candidate: "they **claim for themselves** what is yours; and by this most perverse blindness they labor to **blame on you** what is really their own doing".
The source's force is a symmetrical double misattribution (attribute/impute). "Blame on you" adds an accusatory valence and breaks the symmetry. Proposed: "...and by this most perverse blindness they labor to attribute to you what is their own."
Rest of paragraph clean; the Rom. 1 chain (glory of the incorruptible God → image → birds, four-footed animals, creeping things → truth for a lie → creature rather than Creator) is complete and in order.

**idx 5 (6) — Findings m4 and m5, both minor.**
m4: source "the succession of **times**" → candidate "the succession of **the seasons**". "Times" is left unspecified in Pusey; "seasons" narrows it. Proposed: "the succession of time periods".
m5: source "**But I was commanded to believe**" → candidate "I was commanded, **instead, simply** to believe". Two emphasis words added that the source does not carry. Proposed: "But I was commanded to believe."
Note this is the highest-expansion paragraph in the file (ratio 1.25), and both findings are in it. Content is otherwise complete (solstices, equinoxes, eclipses of the greater lights, secular philosophy, Manichaeus' frenzy/madness).

### Packet C — idx 6–8 (1-based 7–9)

**idx 6 (7) — Finding m15, minor.**
Source "though he know not even **the circles** of the Great Bear" → candidate "**the paths** of the Great Bear". Minor astronomical-term drift; "circles" is the figure Augustine uses. Low priority. Otherwise the tree analogy and the "having nothing, yet possesseth all things" clause are complete, and the opening question is a real question ✓.

**idx 7 (8) — Finding M1, MAJOR — the claim is inverted.**
Source: "For Thou hast said to man, Behold piety and wisdom; **of which he might be ignorant, though he had perfect knowledge of these things**".
Candidate: "You have told man, Look here — piety and wisdom; **of these other things a man could be ignorant and still have perfect knowledge of piety and wisdom.**"
The source says: a man could be ignorant **of piety/wisdom** while having perfect knowledge **of these (astronomical) things**. The candidate reverses subject and object and asserts the opposite proposition: that a man could be ignorant of astronomy and still know piety perfectly. Both statements are things Augustine believes elsewhere, but they are not the same statement, and only the source's version does the argumentative work here — the whole paragraph is building the case that Manichaeus' astronomical pretension proves nothing about his piety, and that he failed even at the astronomy. The candidate's version knocks the premise out from under the conclusion that immediately follows ("since he did not know them, yet had the shameless nerve to teach them..."). Chadwick's rendering confirms the direction ("Of that a man could be ignorant even if he had perfect knowledge of these matters").
Proposed correction: "You have told man, Look here — piety and wisdom; **of that a man could be ignorant even if he had perfect knowledge of these other things.**"
Secondary, same paragraph, not separately counted: the source sets the Holy-Ghost claim inside quotation marks as a reported doctrine; the candidate drops the quotes (see Mo4).

**idx 8 (9) — flagged paragraph (1-based reading). No issues.**
"form of the doctrine of piety" → "substance of the doctrine of piety" is a defensible reading. The long final conditional about longer/shorter days, eclipses, and suspended judgment on his authority is complete, with the suspension ("it should still remain a question to me whether it were so or no") intact. The rhetorical question is preserved as a question and, correctly, is **not** resolved into an assertion. "detested" → "despised" is within tolerance.

### Packet D — idx 9–11 (1-based 10–12)

**idx 9 (10) — flagged paragraph (0-based reading). No issues.**
This is the longest early paragraph and the drafter's own suspected weak point; it holds up. Full inventory present: nine years, the sect deferring his objections to Faustus, the cup-bearer image, "cloyed" → "glutted", the four-way eloquent/true–clumsy/false–plain/true–rich/false chiasm rendered complete and in order, the wisdom-and-folly as wholesome/unwholesome food, the courtly/country vessels, and "either kind of meats may be served up in either kind of dishes" ✓. No dropped clause. No added causation.

**idx 10 (11) — no issues.** "Tully's Orations" correctly identified as Cicero's speeches ✓. Seneca, the poets, the Latin sect-volumes, daily speaking practice all present. The closing address to God as "judge of my conscience" and the providence clause are intact.

**idx 11 (12) — Findings m6 and m7, both minor.**
m6: source "he, **so far modestly**, shrunk from the burthen" → candidate "he, **to his credit**, shrank modestly from the burden". "So far" is a scope-limiter ("in that respect"); "to his credit" is an added editorial endorsement. Proposed: "he, in that respect modestly, shrank from the burden".
m7: source "fairer is the **modesty** of a candid mind" → candidate "the **honesty** of a candid mind". Modesty is the specific virtue the paragraph has just illustrated (shrinking from a burden he could not carry). Proposed: "the modesty of a candid mind". The parenthetical "of which indeed however ignorant, he might have held the truths of piety, had he not been a Manichee" is preserved correctly, which is the hard part of this paragraph.

### Packet E — idx 12–14 (1-based 13–15)

**idx 12 (13) — no issues.** "rhetoric-reader" → "professor of rhetoric" ✓. The closing rhetorical question is kept as a question and not resolved ✓. Monica's "heart's blood... tears night and day" preserved at full weight ✓.

**idx 13 (14) — flagged paragraph (1-based reading). No issues.**
Every element of the long Carthage/Rome comparison is present and in order: higher gains and dignities (with the concession that they did influence him), the stated ranking "my main, almost my only, reason", the quieter Roman students, the *eversores* bursting in, the law/custom clause, the double punishment by blindness, the student-then-teacher reversal, the refuge-and-portion address, goading at Carthage / enticement at Rome, "the one doing frantic, the other promising vain, things", the use of their perversity and his own, and "I, who here detested real misery, was there seeking unreal happiness" ✓. No causal connective supplied beyond the source. Only softening noted: "suffer **incomparably** worse" → "suffer **far** worse" (finding m16, minor).

**idx 14 (15) — flagged paragraph (0-based reading). The harbor scene. Findings Mo2 (moderate) and m8 (minor).**

Emotional weight first, since this is the paragraph most at risk: it is **not** softened. "I deceived her" is present as "I deceived her"; "I lied to my mother, and such a mother, and escaped" survives as "I lied to my mother — to such a mother — and got away"; "frantic with sorrow" is "frantic with grief"; and the hard theological statement that God "didst then disregard them" is rendered flatly as "which you then disregarded", with no comforting qualifier smuggled in ahead of the source's own reversal. The inheritance of Eve, "with sorrow seeking what in sorrow she had brought forth", and the closing "after accusing my treachery and hardheartedness" are all intact. This passage passes.

**Mo2, moderate — garbled idiom producing a spatial contradiction.**
Source: "That night I privily departed, but **she was not behind in weeping and prayer**."
Candidate: "That night I secretly left, and **she was not left behind in her weeping and praying**."
"Was not behind in" is the idiom "did not fall short in / was not slack in". The candidate converts it to a passive spatial phrase, which lands one clause after "I secretly left" — so the sentence reads as though she was *not* physically left behind, which is precisely the opposite of what happened and contradicts the next sentences. This is the Book 3/4 "locally plausible, incoherent against the referent" failure mode. Proposed: "That night I secretly left, but she did not slacken in her weeping and praying."

**m8, minor — added action.**
Source: "preserving me, thus full of execrable defilements, from the waters of the sea, **for** the water of Thy Grace".
Candidate: "keeping me... safe from the waters of the sea, **and bringing me to** the water of your grace".
"For" states purpose; "bringing me to" asserts an accomplished action at this point in the narrative, which Augustine has not yet reached. Proposed: "...safe from the waters of the sea, for the water of your grace".

### Packet F — idx 15–17 (1-based 16–18)

**idx 15 (16) — no issues.** The illness/near-death passage. Both questions preserved, including the elliptical "For how could he, through the crucifixion of a phantom — which is what I believed him to be?" — the Manichee docetic term "phantom" is correctly kept and not blurred to "illusion". The difficult double comparison ("So true, then, was the death of my soul, as that of His flesh seemed to me false; and how true the death of His body, so false was the life of my soul") is rendered correctly in both directions, which is the trap in this paragraph. The unrequested baptism, the boyhood contrast, the "double death", and the wound that could never be healed are all present at weight.

**idx 16 (17) — Findings m9, m10, m11, all minor.**
m9: source "so **frequent** in almsdeeds" → candidate "so **generous** in almsgiving". Frequency is what the source measures (and it pairs with the "twice a day, morning and evening" that follows). Proposed: "so constant in almsgiving".
m10: question distribution. Source punctuates "But wouldest Thou... in her prayers." with a **period** and gives "Thou, by whose gift she was such?" as a standalone question. The candidate turns the first into a question and folds the second into the preceding sentence as a trailing clause. Net count is 3 = 3, so the gate holds, and the first change is defensible (the sentence is interrogative in form), but the source's third rhetorical beat is lost as an independent stroke. Low priority; flagging for the record since the drafter's notes claim the three questions were kept "as questions" with their build, and the build is in fact re-phrased.
m11: source "urged upon Thee, **as Thine own handwriting**" → candidate "pressed upon you **as though they were your own signed promise**". The *chirographum* is a bond/IOU, so "signed promise" is a reasonable gloss, but "as though they were" adds a hedge that weakens Monica's claim from a bond she holds to a mere comparison. Proposed: "pressed upon you as your own signed bond".
Not a finding, but worth recording as a positive: "not for idle tattlings and old wives' fables" is preserved, and "Never, Lord" is kept as a flat, unqualified answer.

**idx 17 (18) — no issues.** The Manichee excuse ("it is not we who sin, but some other nature") is preserved with its epistemic shrug ("I knew not what") twice, as in source. The self-indictment "it was wholly I" and the extraordinary "I had rather have Thee... overcome in me to my destruction, than myself of Thee to salvation" is rendered correctly, with the ellipsis of the second clause supplied accurately. "Handmaid" → "servant" is acceptable. "The Elect" kept as a technical term ✓ (quote style: see Mo4).

### Packet G — idx 18–20 (1-based 19–21)

**idx 18 (19) — no issues.** "the Academics" kept as the proper school name ✓; their doctrine reported literally as "a person ought to doubt everything" and "no truth can be grasped by human beings" ✓, with Augustine's own caveat that he did not yet understand their real meaning ✓. Rome secretly sheltering Manichees, the anthropomorphism problem, and "a mass of bodies" as the "greatest, and almost only cause" are all present.

**idx 19 (20) — flagged paragraph (0-based reading). Finding m12, minor.**
m12: source "my God (**to whom Thy mercies confess** out of my mouth)" → candidate "to whom your mercies **give thanks** out of my mouth". "Confess" is the book's title word and its governing verb; replacing it with "give thanks" costs a keyword for no readability gain (the modern reader handles "confess"). Proposed: "to whom your mercies confess out of my mouth".
Everything else in this dense paragraph checks out: the two unbounded masses with the evil one narrower; the "pestilent beginning"; being driven back from a Catholic faith that was not the Catholic faith; the preference for a God bounded on one side over one bounded on all sides by a human body; the parenthesis about not conceiving mind except as a subtle body diffused in definite spaces; the Only Begotten "reached forth... out of the mass of Thy most lucid substance"; the Virgin Mary / mingling / defilement chain; and the closing "Now will Thy spiritual ones mildly and lovingly smile upon me... Yet such was I." No clause dropped. The drafter's flag is again not borne out here.

**idx 20 (21) — flagged paragraph (0-based reading). No issues.**
Helpidius is kept by name and correctly positioned (Carthage, face-to-face against the Manichees) ✓. The Manichee private-only answer — New Testament corrupted by persons unknown wanting to graft the Jewish law onto Christian faith — is preserved with its rebuttal ("yet they themselves never produced any uncorrupted copies") ✓. The suffocating "masses" and the gasping-for-breath image close correctly.

### Packet H — idx 21–24 (1-based 22–25)

**idx 21 (22) — Finding Mo3, moderate — ambiguous/reversed referent.**
Source: "when lo, I found other offences committed **in Rome**, to which I was not exposed in Africa. True, those 'subvertings' by profligate young men were **not here practised**, as was told me".
Candidate: "I found other, different offenses being committed in Rome, ones I had not been exposed to in Africa. It was true that the 'wreckings' carried out by wild young men were **not practiced there**, as I had been told".
"Here" in the source is unambiguously Rome (Augustine is narrating from Rome). The candidate's "there" has two live antecedents in the immediately preceding sentence — Rome and Africa — and the nearer contrastive one for an English reader after "not exposed to in Africa" is Africa. Read that way the sentence asserts the *eversores* were not a Carthage practice, which contradicts Book 3. Proposed: "the 'wreckings' carried out by wild young men were not practiced in Rome, as I had been told".
Rest of the paragraph is faithful, including the honest self-indictment "I hated them more because I was the one about to suffer from them than because they were doing something utterly wrong" and the closing "I disliked their wickedness more for my own sake than I wished them well for yours" ✓.

**idx 22 (23) — Findings m13 and m14, both minor.** The Ambrose arrival.
m13: source "whose eloquent discourse did then **plentifully** dispense" → candidate "whose eloquent preaching **regularly** served out". "Plentifully" is a quantity word that belongs with the flour/oil/wine abundance figure; "regularly" substitutes frequency. Proposed: "generously served out".
m14: source "To him was I **unknowing** led by Thee, that by him I might **knowingly** be led to Thee." → candidate "I was led to him without knowing it was you leading me, so that through him I might come to know you and be led to you." The source's chiasm turns on one adverb pair modifying the same verb; the candidate splits "knowingly be led" into "come to know you **and** be led to you", making the knowing a separate outcome rather than the manner of the leading. Proposed: "Without knowing it, I was led to him by you, so that through him I might knowingly be led to you."
Everything else is right: Symmachus named and correctly titled prefect; the irony that the Manichees he was to be freed from got him the post ("neither of us however knowing it") preserved; "Ambrose the Bishop" → "Bishop Ambrose" on first mention ✓; the "sober inebriation of Thy wine" kept as the oxymoron; the honest admission that he came for the oratory and was a "careless and scornful looker-on" of the content; the Faustus comparison ("more recondite, yet in manner less winning") kept in both directions; and the close "salvation is far from sinners, such as I then stood before him; and yet was I drawing nearer by little and little, and unconsciously" ✓.

**idx 23 (24) — Finding Mo1, moderate — inverted relative clause.**
Source: "and the Catholic faith, **for which** I had thought nothing could be said against the Manichees' objections, I now thought might be maintained without shamelessness".
Candidate: "and the Catholic faith, **against which** I had thought nothing could be said in answer to the Manichees' objections, I now thought could be maintained without embarrassment".
"For which" = on whose behalf. The candidate's "against which... nothing could be said" states, on a plain reading, that he thought the faith was unassailable — the opposite of his position at this stage, and the opposite of what the sentence's own "but now I thought it could be maintained" presupposes. The trailing "in answer to the Manichees' objections" then sits ungrammatically against "against which". Proposed: "and the Catholic faith, in whose defense I had thought nothing could be said against the Manichees' objections, I now thought could be maintained without embarrassment".
The rest of the paragraph is well handled and correctly *not* over-claimed: "began to seem to me defensible", "without embarrassment", the figurative reading of the Old Testament, "which, when I had understood them literally, had killed me spiritually", and the final balance "did not, to me, seem defeated — only not yet victorious" ✓. The drafter's stated care about keeping this provisional is justified and delivered.

**idx 24 (25) — no issues.** "catechumen" kept as the technical term ✓; "the Academics" consistent with idx 18 ✓; the reasoning chain is complete and its qualifications intact — could not conceive a spiritual substance, therefore their strongholds stood; philosophers judged more probable on physical nature only; abandon the Manichees while still doubting; refuse the philosophers the cure of his soul because they lack the saving name of Christ; remain a catechumen in the Church his parents commended him to until something certain dawns. Nothing added, nothing resolved that the source leaves open.

---

## 3. Whole-chapter read

Read straight through as a reader would.

**Voice and archaism.** Zero archaism. A regex sweep for Thou/Thee/Thy/Thine/doth/dost/didst/hast/hath/wert/shalt/wouldest/couldest/ye/verily/whither/hence/thence/betook/fain/perchance/ofttimes/unto/whereof/wherein/whereby/thereof/therein/amongst/nay/behold returned **no matches**. The register is consistent: plain modern English that stays formal enough for the prayer-address without going bland. The second-person address to God is steady across all 25 paragraphs and never drifts into third person.

**Technical-term consistency (checked mechanically).** Faustus ×6, Manichee(s) ×9, Manichaean ×2, Manichaeus ×5, Academics ×2, catechumen ×1, Ambrose ×1, the Elect ×2, Helpidius ×1, Symmachus ×1, Cyprian ×1, Milan ×2, Rome ×9, Carthage ×6. Sect name vs founder name are held distinct throughout, which is the specific thing that goes wrong in Manichee passages. "Academics" is not softened to "skeptics". "Phantom" is used for the docetic Christ and nowhere else. No term wanders.

**Flow.** The chapter reads well end to end. The arc is legible: astronomy-vs-Manichee fables → Faustus anticipated → Faustus met and found charming and empty → collapse of zeal → Rome → harbor → illness → Manichee relapse → Academics → Milan → Ambrose → provisional catechumen. Cross-paragraph reference holds: the "masses" of idx 19/20 connect properly to the "mass of bodies" of idx 18; Faustus in idx 22 is recognisably the same man as in idx 9–12; Monica's grief in idx 14 and the near-death in idx 15–16 are wired together correctly by "And of this she knew nothing, yet even so, while absent, she prayed for me."

**The harbor-deception scene specifically.** Lands at full weight. The lie is named as a lie three times over (deceived / pretended / lied), the mother is not excused, God's non-answer is stated flatly, and no consoling foreshadowing is inserted before the source supplies it. The one defect is Mo2, which is a mechanical idiom slip rather than a softening.

**The Ambrose passages specifically.** The distinction the chapter turns on — he came for the style and the substance got in anyway — is preserved precisely, including the two separate "as for the substance" beats and the admission that he was an "indifferent and scornful onlooker". The provisionality of idx 23–24 is not upgraded to belief anywhere. This is the strongest stretch of the candidate.

**Readability nit (not counted as a finding).** 108 em-dashes across 25 paragraphs (4.3/para) versus 108 across 31 in accepted Book 4 (3.5/para). A few paragraphs — idx 12, 18, 22 — stack three or four dashed asides in a row and would read better with one or two converted to commas or a full stop. Within the range of the accepted books, so not a blocker.

---

## 4. Summary verdict

### Finding counts

| Severity | Count | IDs |
|---|---|---|
| Major | **1** | M1 (idx 7) |
| Moderate | **4** | Mo1 (idx 23), Mo2 (idx 14), Mo3 (idx 21), Mo4 (whole file) |
| Minor | **16** | m1 (0), m2 (2), m3 (4), m4 (5), m5 (5), m6 (11), m7 (11), m8 (14), m9 (16), m10 (16), m11 (16), m12 (19), m13 (22), m14 (22), m15 (6), m16 (13) |
| **Total** | **21** | |

Arithmetic check: 1 + 4 + 16 = 21. Minor IDs enumerated: m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16 = 16 items. Confirmed.

**Mo4 (moderate, whole file) — series quote-style inconsistency.** The candidate uses single quotes for every quoted term: `'holy ones'`, `'the Elect.'`, `'masses'`, `'wreckings'`, `'in a figure,'` — and drops the quotes entirely around the two reported doctrines that the source quotes (the Holy-Ghost claim in idx 7, the "it is not we that sin" claim in idx 17). Accepted Book 3 uses 36 double quotes and accepted Book 4 uses 47; neither uses paired single quotes. Shipping Book 5 this way makes the quote convention change mid-work. Proposed: convert all five to double quotes and restore double quotes around the two reported doctrines.

### Risk-pattern scorecard

1. Rhetorical questions flattened — **not found.** 18/18 parity independently confirmed; every question is a real question. One boundary shift (m10).
2. Added interpretive connectives / supplied causation — **minor only.** m2, m5, m6, m8. No paragraph has an invented "because" chain; the idx 13 motive-ranking the drafter singled out is clean.
3. Dropped clauses in dense paragraphs — **not found.** Both readings of the drafter's flags (0-based and 1-based) were checked clause by clause; idx 0, 1, 8, 9, 13, 19, 20 are complete, and idx 14's only defect is Mo2. The drafter's self-flagged worry was misdirected — the real errors are in unflagged paragraphs 7, 21 and 23.
4. Garbled restructuring against actual referents — **found twice:** Mo2 (idx 14) and Mo3 (idx 21).
5. Wrong/inconsistent technical terms — **not found.** Clean across all named terms.
6. Invented content — **not found.** No paragraph contains material without a source warrant; expansion ratios are explanatory, not additive.
7. Softened emotional content — **not found** in the load-bearing places (harbor, guilt, illness, Monica's prayers, the "overcome in me to my destruction" passage). Only diffuse intensity softening: m1, m16.

### Recommendation

**Accept after correction. Do not accept as-is.**

This is a materially better candidate than the Book 3 and Book 4 first passes. The question-mark regression is genuinely fixed, there is no invented content, no dropped clause, no softened grief, and the terminology is airtight. But it is not shippable in its current state: **M1 (idx 7) reverses a claim** and breaks the argument of its paragraph, and **Mo1 (idx 23) inverts a relative clause** so that the sentence says the opposite of Augustine's stated position. Both are the same species of error — subject/object or direction inversion inside a compressed Latinate period — and both sit in paragraphs the drafter did **not** flag, which is the more important lesson for the next book: the drafter's self-flags pointed at the paragraphs that were hardest to *restructure*, not the ones easiest to get *backwards*.

Required before acceptance: fix M1, Mo1, Mo2, Mo3, and normalise quotes per Mo4. The 16 minor findings are recommended but individually non-blocking; m1, m7, m12 and m13 are the four worth taking because each costs a keyword the book uses deliberately (vengeance, modesty, confess, plentifully). After those corrections I would expect this to pass verification without a further round.
