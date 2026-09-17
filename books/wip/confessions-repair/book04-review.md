# Confessions Book 4 — independent adversarial review of modern-en candidate

- Source (ground truth): `book04-source.json`, Pusey 1838, 31 paragraphs.
- Candidate reviewed: `book04-candidate.json`, sha256 `e5dd88538342b951d5b3493d7f6f1919e2adbfd1f9ab32d9f617d5aecb37eb05`, 31 paragraphs, one-to-one alignment confirmed.
- Reviewer: independent pass. Drafter's notes read, then verified against source rather than trusted.

## Mechanical checks (run first)

- Paragraph count: 31 / 31. One-to-one. PASS.
- Archaism sweep (`thou|thee|thy|thine|verily|doth|didst|hast|hath|whence|whither|wherefore|unto|nay|yea|shalt`): **0 hits**. PASS.
- Word-count ratio candidate/source, per paragraph: min 1.02 (para 12), max 1.18 (para 1). No paragraph below 1.00 — no evidence of bulk clause-dropping anywhere. PASS.
- Question-mark count per paragraph, source vs candidate: matches in 28/31. Mismatches at **para 9 (6→5)**, **para 20 (2→1)**, **para 30 (2→3)**. All three investigated below. The drafter's notes claim in §4 that "All source questions remain questions… None were silently converted to statements" — **this claim is false for paras 9 and 20.**

---

## Packet 1 — paragraphs 0–2

**Para 0 — minor (×2).**

1. Source: "feeding upon Thee, **the food that perisheth not**?"
   Candidate: "feeding on you, **the food that never runs out**?"
   "Perisheth not" is imperishability (it does not spoil/decay), not inexhaustible quantity. The candidate converts a claim about the food's nature into a claim about its supply.
   → Correction: "the food that never perishes".

2. Source: "by carrying food to those who were called 'elect' and 'holy,' **out of which**, in the workhouse of their stomachs, they should forge for us Angels and Gods".
   Candidate: "by carrying food to the men they called 'the elect' and 'the holy,' **so that** in the factory of their stomachs they could manufacture for us angels and gods".
   The source says the angels and gods are forged *out of the food*. The candidate drops the material relation and replaces it with a purpose clause.
   → Correction: "…carrying food to the men they called 'the elect' and 'the holy' — food out of which, in the factory of their stomachs, they would manufacture for us angels and gods who would cleanse us."

Otherwise clean. "divers lusts" → "every kind of desire" is acceptable. Rhetorical questions ("what am I to myself without you…?", "what kind of man is any man…?") preserved as questions.

**Para 1 — no issues.** Checked specifically for pattern 7 (softening of the concubine passage): not softened. "whom I had found out in a wayward passion, void of understanding" → "one I had found through a wandering passion empty of sense"; "the bargain of a lustful love, where children are born against their parents' will" fully retained. "sought after leasing" correctly read as "chased after lies."

**Para 2 — minor (×2).**

1. Source: "And doth not a soul, sighing after such fictions, **commit fornication against Thee**…?"
   Candidate: "…**commit a kind of adultery** against you…?"
   Two changes at once: the biblical "fornication" is softened to "adultery," and a hedge ("a kind of") is added that the source does not have. This is exactly risk pattern 7 plus a small invented qualifier.
   → Correction: "commit fornication against you".

2. Internal inconsistency: source uses "feed the wind" twice. Candidate renders the first as "**feed on wind**" and the second as "**feed the wind**" — which breaks the deliberate callback ("For what else is it to feed the wind, but to feed them…?"). The second use only works if the first is identical.
   → Correction: make the first "feed the wind".

Note (not a finding): "Still, I would not have had sacrifices offered to demons on my behalf — **even while** I was sacrificing myself to those same demons" adds a concessive where the source uses a relative clause, but the irony is the source's own. Acceptable.

---

## Packet 2 — paragraphs 3–5

**Para 3 — minor (×2).**

1. Source: "which art, however, **Christian and true piety** consistently rejects and condemns."
   Candidate: "Yet **Christian and true religion** consistently rejects and condemns that art."
   *Pietas* is not *religio*; and the candidate itself keeps "piety" in para 30 ("the teaching that concerns piety"), so this is also an internal inconsistency.
   → Correction: "Christian and true piety".

2. Source: "and **a broken and contrite heart** wilt Thou not despise."
   Candidate: "will not despise **a broken and humbled heart**".
   "Contrite" (repentant) is the Psalm 51 term and is not a synonym for "humbled" — the candidate has already used "humbled" for *humilis* in para 0.
   → Correction: "a broken and contrite heart".

Handling of *mathematici* is defensible. The gloss does invert the source's framing (source: they were *called* Mathematicians; candidate: people *call* them astrologers and they were *known as* "mathematicians"), but the result is legible and does not mislead. No finding.

Structural note (no finding): the candidate folds "the very sweetness and well-spring of righteousness… and a broken and contrite heart wilt Thou not despise" into the preceding question. Content preserved; the question is preserved as a question.

**Para 4 — minor (×2).**

1. Source: "and he, **a grave man**, would not get his living by deluding people."
   Candidate: "and **as a man of some standing** he would not make his living deceiving people."
   *Gravis* here is seriousness/moral weight, not social rank. The candidate substitutes a status claim for a character claim.
   → Correction: "and, being a serious man, he would not make his living deceiving people".

2. Source: "he answered me (as he could) 'that **the force of chance**, diffused throughout the whole order of things, brought this about.'"
   Candidate: "…that **chance**, spread throughout the whole order of things, brought this about."
   *Vis* (force/power) is dropped; it matters, because the physician's whole explanation is that chance has a real causal force distributed through nature.
   → Correction: "that the force of chance, spread throughout the whole order of things, brought this about".

Also present but below finding threshold: "though not as a physician **that time**" adds two words not in source; harmless clarification.

**Para 5 — minor (×1).**

Source: "my dearest Nebridius, a youth singularly good and **of a holy fear**, who derided the whole body of divination".
Candidate: "a young man of unusual goodness and **holy caution**".
"Holy fear" is reverent fear of God — a standing religious concept. "Holy caution" reads as ordinary prudence and loses the referent.
→ Correction: "a young man of unusual goodness and holy fear".

---

## Packet 3 — paragraphs 6–8

**Para 6 — no issues.** The false-friendship argument, the Holy Spirit clause, the admission that Augustine corrupted the friend's faith, the mother's grief, and the "scarce one whole year" all present and correctly attached.

**Para 7 — minor (×1).**

Source: "and with **a wonderful and sudden freedom** bade me, as I would continue his friend, forbear such language to him."
Candidate: "and with **a startling, sudden independence**, told me, if I wanted to remain his friend, to stop talking to him that way."
*Libertas* here is frankness/boldness of speech — the dying friend speaks freely to Augustine. "Independence" turns it into a claim about the friend's autonomy from Augustine, which is a different (and more modern-psychological) idea.
→ Correction: "with a startling, sudden boldness".

Also: "I essayed to jest with him, **as though he would jest with me**" → "assuming he would joke back" imports an attitude ("assuming"). Borderline; not counted.

**Para 8 — moderate (×1, consistency).**

Source: "that **phantasm** she was bid to trust in."
Candidate: "the **shadow-thing** she was being told to trust in."
*Phantasma* is the load-bearing Manichean term for Augustine's materialist false image of God, and it recurs in para 11 ("For Thou wert not Thyself, but **a mere phantom**"), where the candidate renders it **"phantom."** The same term in the same argumentative thread gets two different English words nine lines apart, and "shadow-thing" is an invented coinage that reads as fantasy vocabulary.
→ Correction: "the phantom she was being told to trust in" (matching para 11).

Minor within para 8, not counted separately: "but he was not granted them" → "but he was not to be found" loses the sense that the eyes were *denied* him.

---

## Packet 4 — paragraphs 9–11 (core grief meditation)

**Para 9 — MODERATE. Flattened rhetorical question (risk pattern 1).**

Source: "May I learn from Thee, who art Truth, and approach the ear of my heart unto Thy mouth, **that Thou mayest tell me why weeping is sweet to the miserable?**"
Candidate: "Let me learn from you, who are Truth, and put the ear of my heart close to your mouth, **so that you can tell me why weeping is sweet to the miserable.**" — ends on a period.

This is the question that *opens and governs the entire meditation*; the five questions that follow are its unfolding. Converting it to a statement turns an inquiry into an assertion of intent and flattens the paragraph's architecture. It is also the exact failure documented in Book 3, and the drafter's notes assert it did not happen here.
→ Correction: "…and put the ear of my heart close to your mouth — will you tell me why weeping is sweet to the miserable?" (or keep the petition form but end on "?").

The remaining five questions are correctly preserved as questions, and the three open questions the notes flag are genuinely left unresolved. Good.

**Para 10 — no issues.** Long paragraph (368→399 words); checked clause by clause. Pylades/Orestes with its "if not feigned" hedge, "half of my soul," "one soul in two bodies," "I would not live halved," and the closing "lest he whom I had much loved should die wholly" are all present and correctly related. Quotation marks around "one soul in two bodies" are dropped in the candidate (source has them) — cosmetic, not counted.

**Para 11 — minor (×1).**

Source: "I fretted then, sighed, wept, was distracted; **had neither rest nor counsel**."
Candidate: "I fretted, sighed, wept, fell apart; I had neither **rest nor sense**."
*Consilium* is counsel/plan/resolve — he had no course of action. "Sense" reads as sanity or good judgment, a different claim (and one already covered by "fell apart").
→ Correction: "I had neither rest nor counsel."

All three closing questions ("Where could my heart flee from my heart? Where could I flee from myself? Where would I not still be following myself?") preserved. The catalogue of failed consolations (groves, games, music, fragrant places, banquets, bed and couch, books, poetry) is complete.

---

## Packet 5 — paragraphs 12–14

**Para 12 — minor (×1).**

Source: "And yet there succeeded, not indeed other griefs, yet **the causes of** other griefs."
Candidate: "…but **the seeds of** other griefs."
"Causes" is the claim; "seeds" is a metaphor the source does not use and it softens the point (seeds may not germinate; causes produce). Lowest word-ratio paragraph in the book (1.02) — but checked item by item and nothing is dropped: the full friendship catalogue (talking, joking, mutual kindnesses, books, foolery and seriousness, disagreement without discontent seasoning agreement, teaching and learning, longing and welcome) is intact, as is "our soul, which lay itching in our ears."
→ Correction: "but the causes of other griefs."

The drafter's note about preserving the flat "instead of you" juxtaposition checks out — no added explanation.

**Para 13 — MAJOR. Inverted referents (risk pattern 4).**

Source: "Thee none loseth, but who leaveth. And who leaveth Thee, whither goeth or whither fleeth he, **but from Thee well-pleased, to Thee displeased?**"
Candidate: "And whoever leaves you — where does he go, where does he flee, **except from you when you please him, to you when you displease him?**"

The source's "well-pleased" and "displeased" describe **God** (Latin *a te placido ad te iratum* — from you in your kindness to you in your anger). The candidate makes **the man** the one pleased or displeased, and God the one doing the pleasing. That reverses the agency and destroys the sentence's whole point: you cannot escape God, you only move from his favour into his wrath. As written, the candidate says something close to nonsense — a person flees *toward* God at the moment God displeases him.

This is the single most serious finding in the book, and it sits in a paragraph the drafter's notes do not flag.
→ Correction: "except from you in your kindness to you in your anger?"

Also minor, same paragraph: "For where doth he not find Thy law **in** his own punishment?" → "your law **waiting in** his own punishment" adds "waiting," an image not in source. Counted as minor.

**Para 14 — no issues.** The hardest paragraph in the book and the notes flag it. Verified in full: rise/set, begin-to-be, grow-to-be-perfected, age and wither, "all grow not old, but all wither" correctly rendered as "while not all of them grow old, all of them wither" (the quantifier is right here), "the more quickly they grow… the more quickly they also rush toward not existing," the speech/syllable analogy, "the glue of love," "pestilent longings," the two questions about the senses of the flesh both preserved as questions, and "hence and hitherto" → "from here to there." Nothing compressed, nothing added. Source ratio 1.11 with no invented content.

---

## Packet 6 — paragraphs 15–17

**Para 15 — no issues.** "But do I depart any whither? saith the Word of God" preserved as a quoted question.

**Para 16 — MODERATE (×2).**

1. **Imperative absorbed into an added comparative (risk pattern 2).**
   Source: "Why then be perverted and follow thy flesh? **Be it converted and follow thee.**"
   Candidate: "Why then be turned inside-out and follow your flesh — **rather than have it turned around to follow you?**"
   The source is a question followed by a *separate imperative*: let the flesh be converted and follow you. The candidate dissolves the imperative into a "rather than" clause governed by the question, which both adds a connective the source does not have and removes a command. The perverted/converted wordplay also goes.
   → Correction: "Why then be perverted and follow your flesh? Let it be converted instead, and follow you."

2. **Quantifier error.**
   Source: "when any one thing is made up of many, **all of which do not exist together**, all collectively would please more than they do severally".
   Candidate: "when any one thing is made up of many parts, **none of which exist all at once**, the whole together would please more…"
   "All of which do not exist together" = not all of them exist simultaneously. The candidate's "none of which exist all at once" says something else entirely — that each individual part fails to exist all at once. That is not Augustine's premise and it breaks the syllable analogy he just gave.
   → Correction: "made up of many parts that do not all exist at the same time".

**Para 17 — minor (×1).**

Source: "Go back into your heart, **ye transgressors**, and cleave fast to Him that made you."
Candidate: "Go back into your heart, **you who have turned away**, and cling fast to the one who made you."
"Transgressors" is a moral/legal charge; "you who have turned away" is descriptive and notably gentler, and it also pre-empts the "Where are you going?" that follows. Mild softening.
→ Correction: "you transgressors".

Everything else here is faithful: the doubled "Where are you going… Where are you going?", "Seek what you are seeking — but it is not there," and "how could there be a blessed life where there is no life at all?" all preserved as questions. The shifting address inside the quoted Word is handled cleanly.

---

## Packet 7 — paragraphs 18–20

**Para 18 — no issues of substance.** Full allegorical chain verified: descent, bearing and slaying death, the thunder, the hidden place, the Virgin's womb, the bridegroom, the giant running his course, the list "words, deeds, death, life, descent, ascension," the departure-and-presence paradox, "Descend, that ye may ascend," "you have fallen by ascending against him," and the closing instruction to the reader with "burning with the fire of charity" → "of love." Both closing questions preserved.

Sub-threshold note: "wherein He **espoused** the human creation" → "where he **was joined to** our human nature" loses the marriage verb that sets up the bridegroom image four clauses later. Worth restoring ("where he took our human nature as his bride") but not counted as a finding.

**Para 19 — no issues.** All four of Augustine's questions to his friends preserved as questions. The two kinds of beauty (whole-forming vs. apt correspondence), the shoe/foot example, and the two-or-three-books hedge are all intact. Title rendered "On the Fair and the Fitting," consistent with paras 22, 23, 26.

**Para 20 — MODERATE. Flattened rhetorical question (risk pattern 1).**

Source: "**But what moved me, O Lord my God, to dedicate these books unto Hierius**, an orator of Rome, whom I knew not by face, but loved for the fame of his learning which was eminent in him, **and some words of his I had heard, which pleased me?**"
Candidate: "But what moved me, Lord my God, to dedicate those books to Hierius, an orator of Rome, whom I did not know by sight, but loved for the fame of his learning, which was outstanding in him — **and I had heard some of his words, which pleased me.**" — ends on a period.

The paragraph is built as a self-interrogation: Augustine asks *what moved him*, and the rest of the paragraph is the answer he works out ("A man is praised, and, unseen, he is loved: does this love enter…? No — rather…"). Converting the governing question into a flat statement removes the frame the paragraph answers. Second instance of the documented Book 3 failure mode.
→ Correction: restructure so the question closes properly, e.g. "But what moved me, Lord my God, to dedicate those books to Hierius — an orator of Rome I did not know by sight, but loved for the fame of his learning, which was outstanding in him, and for some words of his I had heard that pleased me?"

The second question in this paragraph ("does this love enter the hearer's heart out of the praiser's mouth?") is correctly preserved.

---

## Packet 8 — paragraphs 21–23

**Para 21 — minor (×1).**

Source: "like those of a famous charioteer, or fighter with beasts **in the theatre**".
Candidate: "or a beast-fighter **in the arena**".
Small, but the source says theatre, and Augustine's theatre vocabulary is consistent across Book 4 (para 2's "theatrical prize," para 21's actors). "Arena" imports a different venue.
→ Correction: "in the theatre".

All four questions preserved, including the horse/actor argument and "Do I then love in a man what I hate to be, when I myself am a man?" The notes' claim that the puzzle is left unanswered checks out. "whose very hairs you count… not one of them falls to the ground without you" intact.

**Para 22 — MODERATE (×1).**

Source: "that I had loved him more **for the love of his commenders**, than for the very things for which he was commended".
Candidate: "that I had loved him more **for the sake of the men who praised him** than for the very qualities he was praised for".
The load-bearing word is *love*: Augustine's claim, spelled out at the end of para 20 ("when one that loves him, praises him"), is that what kindled his love was **the love in the praisers**, not the praisers as persons. "For the sake of the men who praised him" is a different and weaker claim — it reads as social deference — and it cuts the thread back to para 20's conclusion.
→ Correction: "that I had loved him more because of the love of the men who praised him than for the very qualities he was praised for".

Minor, same paragraph (counted): "the gales of tongues blow from the breast of **the opinionative**" → "gusts of talk blow out of the chests of **people with opinions**." *Opinionative* here means those who trade in mere opinion rather than truth; "people with opinions" is nearly contentless and collides with the sentence's own point about the solidity of truth.
→ Correction: "out of the chests of people who deal only in opinion".

The pronoun-referent risk the notes flag is handled correctly — "he," "those same men," "the facts," and "the soul" all stay attached to the right antecedents, and "the facts would not have been any different" is a clean flat juxtaposition, not converted into causation. Good.

**Para 23 — no issues.** Monad/Duad kept untranslated with the source's own inline gloss, as the notes claim. The fair/fit definitions, the turn to the mind, the "panting soul" → "gasping soul," the lineaments/colours/magnitudes triad, and the closing double denial ("neither was evil a substance, nor our soul that chief and unchangeable good") are all present and correctly paired.

---

## Packet 9 — paragraphs 24–26

**Para 24 — no issues.** The three-part parallel (violent deeds from corrupted vehemence; lusts from ungoverned appetite; errors from a corrupted rational soul) is preserved with its structure intact, and "defile the conversation" is correctly read as conduct/manner of life rather than speech — a real trap, correctly navigated.

**Para 25 — no issues.** Both paired questions preserved and left unbridged, exactly as the notes claim. The pride argument ("I chose instead to imagine you as subject to change, rather than admit that I myself was not what you are") is correctly oriented — easy to invert, and it isn't. "A wind that blows past and vanishes" and the exile-from-fellow-citizens aside are intact.

**Para 26 — minor (×1).**

Source: "nor did the bones exult **which were not yet humbled**."
Candidate: "and my bones did not yet exult, **since they had not yet been humbled**."
The source has a relative clause; the candidate converts it into an explicit causal ("since"). The causal reading is correct theology (Ps. 51), but supplying the connective is precisely risk pattern 2, and the source leaves it as an attribute rather than an argument. "The bones" also becomes "my bones."
→ Correction: "and the bones that had not yet been humbled did not exult."

---

## Packet 10 — paragraphs 27–30

**Para 27 — no issues.** "Predicaments" → "Categories" is the right call and is applied consistently (title, "nine Categories," "chief Category of Substance"). The full Aristotelian list — substance, shape/quality, height/quantity, relation, place, time, posture, state (shod or armed), action and passion — is complete and correctly mapped, including "or does, or suffers anything" → "whether he does something or has something done to him," which is the correct rendering of *agit aut patitur*.

**Para 28 — no issues.** The subject/inherence argument is correctly preserved, including the difficult "whereas Thou Thyself art Thy greatness and beauty" and the counter-case about bodies. "Fictions of my misery" and the briars/thorns/sweat closing are intact.

**Para 29 — minor (×1).**

Source: "since I went about to get **so good a portion of my substance** into my own keeping; and I kept not my strength for Thee, but wandered from Thee into a far country, to spend it upon harlotries."
Candidate: "since I went about trying to keep **so fine a portion of my own being** under my own control".
This is the prodigal son (Luke 15) — *substantia* is the inheritance/portion of goods, and the allusion is confirmed three clauses later by "far country" and "prostitutes," both of which the candidate keeps. Rendering it "my own being" breaks the allusion at exactly the word that carries it.
→ Correction: "so good a portion of my inheritance".

Not softened: "to spend it upon harlotries" → "to spend it on prostitutes" is correctly direct. The back-to-the-light image and the closing observation about teaching are faithful.

**Para 30 — minor (×3).**

1. Source: "**Perverseness too great!**" Candidate: "**A perversity too great to measure!**" — "to measure" is invented. → "Too great a perversity!"
2. Source: "Our good ever lives with Thee; from which when we turn away, we are turned aside." Candidate: "…and when we turn away from it, **we ourselves are the ones** turned aside." The added emphasis is not in the source. → "…and when we turn away from it, we are turned aside."
3. Question-count mismatch (2→3): the candidate adds a question mark to "Or what hindrance was a far slower wit to your little ones…?", which Pusey punctuates as a statement. This is interrogative in form, so it is defensible and is the *opposite* of the documented failure mode — flagged only for completeness. No correction required.

The rest of the paragraph — the shadow of the wings, carrying us to grey hairs, firmness vs. infirmity, and the closing "our home did not fall: your eternity" — is faithful and lands well.

---

## Whole-chapter read

Read straight through, end to end, ignoring the source.

**Voice.** Consistent and genuinely modern. No archaism survives anywhere. The register holds a single line — plain, direct, capable of rising into the apostrophes without going purple. The second-person address to God reads naturally rather than as a translation artifact, which is the hardest thing to get right in Confessions and is the candidate's strongest achievement.

**The grief meditation (paras 8–12).** This is the passage most at risk of reading as disjointed fixes, and it does not. It runs as sustained prose: the darkening in para 8, the self-interrogation in para 9, the Pylades/Orestes turn and the "living halved" image in para 10, the collapse and flight to Carthage in para 11, and the slow scarring-over in para 12 all follow one another with real momentum. Two things degrade it and both are listed above: the flattened opening question in para 9 (which makes the meditation start on an assertion rather than a question), and the "shadow-thing"/"phantom" inconsistency across paras 8 and 11, which breaks a recurring image the reader is meant to recognise. Fixing those two would make this passage very good.

**The philosophical stretch (paras 14–18, 23–28).** Holds up better than expected. Para 14 and para 27 are the two densest paragraphs in the book and both survive intact. The sustained hortatory voice of the quoted Word across paras 15–18 reads as one continuous speech rather than four separate paragraphs, which is correct. Para 16's two errors are the only places where the argument becomes locally incoherent to a reader who is paying attention — the "none of which exist all at once" line in particular will stop a careful reader, because it contradicts the syllable example given a sentence earlier.

**Cross-paragraph consistency.** Checked deliberately:
- "On the Fair and the Fitting" — consistent across 19, 22, 23, 26. Good.
- Categories / Predicaments — consistent across 27, 28. Good.
- "demons" (never "devils") — consistent in para 2. Good.
- "charity" → "love" — consistent in 18, 30. Good.
- Hierius, Nebridius, Pylades and Orestes, Thagaste, Carthage, Hippocrates, Aristotle — all preserved, none glossed unnecessarily. Good.
- *phantasma* — **inconsistent** (para 8 "shadow-thing" vs para 11 "phantom"). Only real consistency defect in the book.
- "piety" — **inconsistent** (para 3 "religion" vs para 30 "piety").
- "feed the wind" — **inconsistent within para 2**.

**Invented content.** No paragraph contains a motive, cause, example or conclusion absent from the source. The one systematic pressure point is small added connectives and intensifiers ("since" in 26, "waiting" in 13, "to measure" in 30, "we ourselves are the ones" in 30, "rather than" in 16, "a kind of" in 2) — individually trivial, collectively a pattern the corrector should watch.

**Dropped content.** None found. Every paragraph is longer than its source; the catalogues (para 11's consolations, para 12's friendship list, para 27's Aristotelian categories, para 29's liberal arts) were checked item by item and are all complete.

**Softening.** One instance ("fornication" → "a kind of adultery", para 2) and one mild instance ("transgressors" → "you who have turned away", para 17). The passages that were most at risk under risk pattern 7 — the concubine in para 1, "the pleasures of the bed and the couch" in para 11, "harlotries" in para 29 — are all rendered directly and are not softened at all.

---

## Summary verdict

**Findings by severity**

| Severity | Count | Paragraphs |
|---|---|---|
| Major | 1 | 13 |
| Moderate | 6 | 8, 9, 16 (×2), 20, 22 |
| Minor | 18 | 0 (×2), 2 (×2), 3 (×2), 4 (×2), 5, 7, 11, 12, 13, 17, 21, 22, 26, 29, 30 (×2) |
| **Total** | **25** | |

**Recommendation: correction-and-verify. Do not re-draft.**

The candidate is structurally sound: 31/31 alignment, zero archaisms, zero dropped clauses, zero invented content of substance, and a genuinely readable modern voice that sustains itself through the grief meditation and the dense philosophical paragraphs alike. That is a materially better result than Book 3.

The defects are localised and individually correctable. One is serious — para 13 inverts "from Thee well-pleased, to Thee displeased" so that the sentence no longer means what Augustine wrote — and must be fixed. Two more are the exact documented Book 3 failure mode (rhetorical questions flattened at paras 9 and 20), which matters both because the paragraphs are built on those questions and because the drafter's notes explicitly and incorrectly certify that this did not occur; treat that section of the notes as unreliable and do not use it to skip verification on the corrected draft. Para 16's quantifier error and para 22's loss of "the love of his commenders" break local arguments. Everything else is word-level.

Apply the 25 corrections above, then re-run the mechanical checks (paragraph count, archaism sweep, per-paragraph question-mark parity against source, word-ratio floor) on the corrected file before acceptance.
