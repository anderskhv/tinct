# Confessions Book 3 — independent review of the modern-English candidate

- **Source (ground truth):** `book03-source.json` (Pusey 1838), 21 paragraphs
- **Candidate under review:** `book03-candidate.json`, sha256 `9598b9ba4b1d1fec1f6d1ec2353a486ea244797d5f5d726232ab1d1017860e6e`, 21 paragraphs
- **Alignment:** verified 21 ↔ 21, one-to-one, in order. ✅
- **Length ratios (candidate words / source words):** 0.94 – 1.15, mean ≈ 1.07. No paragraph is a summary or a truncation. ✅
- **Archaism scan:** automated scan for `Thou/Thee/Thy/Thine/hath/doth/verily/whence/thereof/wherein/whither/fain/unto/saith/didst/wast/hast/shalt/ye/nay/naught` returned **zero real hits** (all matches were substrings of modern words: "untouched", "eye", "part", "art", "chaste"). Direct address to God is consistently "you"/"Lord". ✅

Reviewer note on method: I did not read the drafter's notes as authority. Where the notes make a factual claim about the candidate, I checked it — two of those claims are wrong and are called out below (F21, F22).

---

## Packet 1 — paragraphs 0–2

| # | Finding | Sev | Source | Candidate | Proposed correction |
|---|---|---|---|---|---|
| F1 | **Rhetorical question flattened into an exclamation.** | moderate | "My God, my Mercy, with how much gall didst Thou out of Thy great goodness besprinkle for me that sweetness?" | "…with how much bitterness did you, in your great goodness, season that sweetness for me!" | End with "?" — "my God, my mercy, how much bitterness did you, in your great goodness, sprinkle over that sweetness for me?" |
| F2 | **Blunt theological image softened twice in one clause.** "hell" → "darkness"; "lustfulness" → "desire". This is the classic softening error. | moderate | "I beclouded its brightness with the hell of lustfulness" | "clouded its brightness with the darkness of desire" | "clouded its brightness with the hell of lust" |
| F3 | **Bridging clause not in source.** Source juxtaposes a want and self-hatred; the candidate builds a stratified psychology ("beneath that lay…that made me"). | minor | "and out of a deep-seated want, I hated myself for wanting not" | "and beneath that lay a deeper want that made me hate myself for not wanting enough" | "and out of a deep-seated want I hated myself for not wanting" |
| F4 | **General claim personalised.** Source states a rule about objects of love; candidate converts it into a fact about Augustine. | minor | "Yet if these had not a soul, they would not be objects of love." | "if the things I loved had had no soul in them, I could not have loved them" | "if these things had no soul in them, they would not be objects of love" |
| F5 | Object added to an objectless clause. | minor | "yet, through that famine I was not hungered" | "the famine itself didn't make me hungry **for you**" | drop "for you" (the next clause supplies the object) |
| F6 | Agency added: source is passive ("was…fettered"); candidate makes him a willing party. | minor | "and was with joy fettered with sorrow-bringing bonds" | "joyfully **let myself be** shackled with chains" | "and was joyfully shackled with chains that brought sorrow" |
| F7 | "unholy" (theological) → "illicit" (legal); "be fine and courtly" → "**pass for** refined", which imports pretence. | minor | "a cauldron of unholy loves"; "I would fain…be fine and courtly" | "illicit loves"; "wanted to pass for refined and sophisticated" | "unholy loves"; "wanted to be refined and sophisticated" |
| F8 | Number drift: paragraph opens plural ("people…they"), reverts to singular ("him…he") mid-paragraph. Source is singular throughout ("man…he"). | minor | "Why is it, that man desires…" | "Why is it that **people** want…" then "…the more such scenes move **him**" | pick one; singular "a person…he" tracks the source. |
| F9 | Source's mercy/compassion pair collapsed: "mercy" rendered as "compassion", so the following "But what sort of compassion is this…" loses its hook. Para 2 then re-introduces "mercy" ("truer mercy"), so the terms are inconsistent across the two paragraphs. | minor | "when he compassionates others, then it is mercy. But what sort of compassion is this…" | "when he feels for someone else's, we call it **compassion**. But what kind of compassion is this…" | "…we call it mercy. But what kind of mercy is this, for made-up, staged suffering?" |
| F10 | **Clause invented; comparative dropped.** Source says God pities *more incorruptibly than we do* and is wounded by no sorrow. The candidate keeps the "no pain" half, drops the comparative, and adds "though never less than perfect" — an absolute claim the source does not make. | **major** | "who lovest souls far more purely than we, and hast more incorruptibly pity on them, yet are wounded with no sorrowfulness" | "you love souls far more purely than we do, and your pity for them is untouched by any pain, **though never less than perfect**" | "you love souls far more purely than we do, and pity them more incorruptibly, yet you are wounded by no sorrow." |
| F11 | Two source questions merged into one (8 "?" in source, 7 in candidate). The self-interrogation loses one beat but no content. | minor | "is he yet pleased to be merciful? which because it cannot be without passion, for this reason alone are passions loved?" | one sentence: "Or is it that…is that pain loved for that reason alone?" | optional; split back into two questions |

Paragraphs 1 and 2 are otherwise faithful, including the hard bits ("the less free a person is from these feelings, the more such scenes move him" correctly inverts without altering the claim, and the whole chain of rhetorical questions in para 2 stays interrogative).

---

## Packet 2 — paragraphs 3–5

| # | Finding | Sev | Source | Candidate | Proposed correction |
|---|---|---|---|---|---|
| F12 | **Ambiguous referent resolved, and the agent switched.** In the source the Subverters delight in jeering at others *in the same way* the spirits jeer at them; the candidate makes the spirits act **through** the Subverters, which is a different (demonological) claim. | moderate | "themselves subverted and altogether perverted first, the deceiving spirits secretly deriding and seducing them, wherein themselves delight to jeer at and deceive others" | "…secretly mocked and led astray by deceiving spirits, **the very spirits that delight in mocking and deceiving others through them**?" | "…themselves wrecked and thoroughly twisted first, secretly mocked and led astray by deceiving spirits — in the very way they themselves delight in mocking and deceiving others." |
| F13 | "malicious birth" (innate, congenital malice) → "malicious **appetite**" (a desire). The source's point is nature, not hunger. | moderate | "feeding thereon their malicious birth" | "feeding their own malicious appetite on it" | "feeding their inborn malice on it" |
| F14 | **Proper name silently re-translated** and not logged in the notes: Pusey's "Subverters" (Lat. *Eversores*) becomes "Wreckers" throughout. The wordplay ("themselves wrecked") is preserved, so this is defensible — but it is an undeclared editorial decision on a quoted name, and it should be a conscious, logged choice. | minor | "'Subverters' (for this ill-omened and devilish name…)" | "'Wreckers'" | keep, but log it; or revert to "Subverters" for consistency with other translations readers may cross-check |
| F15 | Interrogative scope widened: the source's question ends at "…'Subverters'?", and what follows is an appositive statement. The candidate runs the whole remainder inside the question. | minor | "What then could they be more truly called than 'Subverters'? themselves subverted…" | "…but 'Wreckers' — themselves wrecked…through them?" | close the question after "Wreckers?" and start a new sentence |
| F16 | Purpose imputed to an abstraction. "that…it might bring me" is result/consequence; "was meant to" reads as design. Also "the treacherous abyss" → indefinite "treacherous depths". | minor | "pursuing a sacrilegious curiosity, that having forsaken Thee, it might bring me to the treacherous abyss" | "chasing a sacrilegious curiosity that, having abandoned you, **was meant to** lead me down into treacherous depths" | "…a sacrilegious curiosity that, having abandoned you, led me down into the treacherous abyss" |
| F17 | "vagrant liberty" (wandering) → "fugitive freedom" (fleeing). Small semantic drift. | minor | "loving a vagrant liberty" | "loving a fugitive kind of freedom" | "loving a wandering kind of freedom" |
| F18 | Bridging phrase added ("and from that scratching"); "a putrefied sore" (singular) → "rot". | minor | "upon which, as on envenomed nails, followed inflamed swelling, impostumes, and a putrefied sore" | "and from that scratching, as from poisoned fingernails, came inflamed swelling, festering sores, and rot" | "on which, as from poisoned fingernails, followed inflamed swelling, abscesses, and a putrid sore" |

Paragraph 4 is strong: the two hardest clauses — "a business deserving death for its fruits" and "grievous punishments, though nothing to my fault" — are both rendered correctly, and the blunt content (sacrilege during the liturgy) is not softened.

---

## Packet 3 — paragraphs 6–8

| # | Finding | Sev | Source | Candidate | Proposed correction |
|---|---|---|---|---|---|
| F19 | **Ambiguity resolved into a claim.** "an immortality of wisdom" is deliberately compressed; the candidate turns it into wisdom making a promise — an agent and an assertion the source does not supply. | moderate | "I longed with an incredibly burning desire for an immortality of wisdom" | "I longed…for the immortality **that wisdom promises**" | "I longed…for an immortality of wisdom" |
| F20 | Question flattened into an exclamation (same class as F1). | moderate | "how did I burn to re-mount from earthly things to Thee, nor knew I what Thou wouldest do with me?" | "how I burned to rise up…though I had no idea what you meant to do with me!" | "…and I did not know what you meant to do with me?" (keep the question mark) |
| F21 | Source's vivid present tense ("I see") flattened to past narration. | minor | "But behold, I see a thing not understood by the proud" | "But what I found was a text not understood by the proud" | "But look — I see something not understood by the proud" |
| F22 | Explicit contrast added where the source juxtaposes ("lowly in access, in its recesses lofty"). | minor | "lowly in access, in its recesses lofty" | "humble to approach, **yet** lofty in its depths" | drop "yet" |
| F23 | "little one" → "small", losing the child/Scripture link that the previous sentence sets up ("would grow up in a little one"). | minor | "But I disdained to be a little one" | "But I refused to be small" | "But I refused to be a little child" |

**Positive:** "Tully" → "Cicero" (para 8) is the right call and is consistent with para 6. The *Hortensius* is kept as a title without over-explanation. The Colossians 2:8–9 quotation in para 7 is accurately modernised, kept as a quoted block, and correctly left unattributed as in Pusey.

---

## Packet 4 — paragraphs 9–11

| # | Finding | Sev | Source | Candidate | Proposed correction |
|---|---|---|---|---|---|
| F24 | **Content dropped.** The paradox "in looking for whom I fail, that I may become strong" (I faint in seeking you, so that I may become strong) loses the failing/fainting entirely, leaving a flat "I search for you." | **major** | "But Thou, my soul's Love, in looking for whom I fail, that I may become strong" | "But you, love of my soul, **whom I search for so that I might grow strong**" | "But you, love of my soul, in the search for whom I fail, so that I may grow strong" |
| F25 | Question flattened into an exclamation (same class as F1, F20). | moderate | "how inwardly did even then the marrow of my soul pant after Thee, when they often…echoed of Thee to me, though it was but an echo?" | "…though it was only an echo!" | restore "?" |
| F26 | Object added: "echoed of Thee" → "echoed **your name**". The source says they echoed *you*, not your name. | minor | "in many and huge books, echoed of Thee to me" | "echoed **your name** to me…in book after huge book" | "echoed you to me" |
| F27 | **Term dropped.** "the Paraclete" is deleted. It is glossed by "our Comforter" in the source, but it is a term the reader meets elsewhere and Augustine names it deliberately. | minor | "the Holy Ghost, the Paraclete, our Comforter" | "the Holy Spirit, our Comforter" | "the Holy Spirit, the Paraclete, our Comforter" |
| F28 | **Meaning garbled.** The source (prodigal-son allusion) is: he was shut out from the husks *of the swine he himself was feeding with husks*. The candidate produces an incoherent double: "husks the pigs ate, on which I fed myself with husks." | **major** | "barred from the very husks of the swine, whom with husks I fed" | "shut out even from the very husks the pigs ate, on which I fed myself with husks" | "shut out even from the husks of the pigs I was feeding with husks" |
| F29 | "Woe, woe" → "How miserable, how miserable" — a lament becomes a self-description, and reads oddly as a repeated exclamation. | minor | "Woe, woe, by what steps was I brought down to the depths of hell!" | "How miserable, how miserable — by what steps was I dragged down…" | "Alas, alas — by what steps was I dragged down into the depths of hell!" |
| F30 | Passive → active with a generalising object. | minor | "they are more certain than when we fancy them" | "they're more certain than **anything we merely imagine**" | "they are more certain than when we imagine them" |

Paragraph 11 is clean — the whole Manichee question-chain ("Where does evil come from?" / "hair and fingernails" / "many wives at once") is kept interrogative, blunt, and unresolved, and the *privatio boni* sequence is preserved in the right order (he says he did **not** yet know it). The para 9 decision to break the certainty-ladder into shorter sentences is sound: fantasy < image < body < soul < God survives in order.

---

## Packet 5 — paragraphs 12–14

| # | Finding | Sev | Source | Candidate | Proposed correction |
|---|---|---|---|---|---|
| F31 | **Technical claim altered and made false.** A metrical *foot* is not a syllable. As written, "within a single meter the same syllable couldn't go just anywhere" is not what Augustine's analogy says, and the analogy (one art, many rule-sets) loses its point. | **major** | "I indited verses, in which I might not place every foot every where, but differently in different metres; nor even in any one metre the self-same foot in all places." | "I couldn't put any given **syllable** anywhere I liked…even within a single meter the same **syllable** couldn't go just anywhere." | "I couldn't put any given metrical foot — any given unit of rhythm — just anywhere; different meters demanded different arrangements, and even within one meter the same foot couldn't stand in every position." |
| F32 | Evaluative word added. "things present" (the circumstances of their own time) becomes "what was **appropriate** to their own time", which pre-judges the very thing Augustine says he was wrong about. | minor | "wherein they made use of things present as God commanded and inspired them" | "for making use of **what was appropriate to** their own time, as God commanded and inspired them" | "for making use of the things of their own time, as God commanded and inspired them" |
| F33 | Emphasis added ("exactly as"); "in them" → "through them". | minor | "as God was revealing in them" | "**exactly** as God was revealing those things **through** them" | "as God was revealing in them" |
| F34 | "struck my sight on all sides" (active assault) softened to passive proximity. | minor | "they struck my sight on all sides, and I saw them not" | "they were right in front of my eyes on every side" | "they struck my eyes from every side, and I did not see them" |

Paragraph 12 is the best-handled hard paragraph in the chapter: greaves → "shin guards", the helmet/feet inversion, the afternoon shop closure, the butler/dining-room household rules, "Is justice therefore various or mutable? No…" — all present, all in order, none over-explained. Paragraph 14 is also correct and, importantly, **does not soften** the Sodom passage or the "obey God above kings" argument; the argument's conditional structure ("if it is lawful for a king…how much more…") is intact.

---

## Packet 6 — paragraphs 15–17

| # | Finding | Sev | Source | Candidate | Proposed correction |
|---|---|---|---|---|---|
| F35 | **Meaning inverted.** In the source the *morsel itself* is what would seem condemned to death (the Manichee belief: giving food to a non-Elect kills the divine particles in it). The candidate makes the *act of giving* a crime, which loses the doctrine being mocked and blunts the absurdity. | **major** | "that morsel would seem as it were condemned to capital punishment, which should be given him" | "**giving it to him** would seem, to us, practically a capital crime" | "the morsel given to him would seem as good as condemned to death" |
| F36 | Readability failure — this clause is not accessible modern English; it is source syntax with modern words, and a reader will have to re-read it. | moderate | "or one well thriven in any thing, to him whose being on a par with himself he fears, or grieves at" | "or someone who's done well resents someone **whose equal standing to himself he fears or resents**" | "or someone who has prospered resents a rival he fears may become his equal, or resents that he already is" |
| F37 | "self-willed" rendered as "reckless", which drops the *private-will* sense — and the same paragraph renders "self-willed pride" correctly a sentence later, so the candidate is internally inconsistent. | minor | "they boldly joy in self-willed combinations or divisions" | "boldly delight in forming **reckless** alliances or divisions" | "boldly delight in forming self-willed alliances or divisions" |
| F38 | Addition: "instead of you" is not in the source; "therefrom" is left deliberately loose. Also "for them" added to "the nature you created and ordained". | minor | "any one false thing is selected therefrom and loved" | "some single false thing is picked out from your creation and loved **instead of you**" | "some single false thing is picked out of it and loved" |
| F39 | "heads of iniquity" (chief categories) → "roots of wrongdoing", a different image; the source's point is taxonomy, not origin — and the taxonomy reading is what the rest of the sentence depends on. | minor | "These be the heads of iniquity which spring from the lust of the flesh…" | "These are the **roots** of wrongdoing that spring from…" | "These are the chief categories of wrongdoing that spring from…" |
| F40 | Hedge added. The source reports the Manichee belief deadpan; "supposedly" inserts the narrator's scepticism where he does not mark it (the derision is already carried by "yea" and the exclamation). | minor | "he should breathe out of it angels" | "he would **supposedly** breathe out angels from it" | drop "supposedly" |
| F41 | "Elect" promoted to an earlier occurrence than the source has it, making the later "some 'Elect' saint!" redundant. | minor | "had some Manichaean saint eaten" (…later:) "some 'Elect' saint" | "if some **'Elect'** Manichaean saint had eaten that very fig" | "if some Manichaean holy man had eaten that very fig" |
| F42 | "corn" retained. In British usage this is grain; a contemporary reader (esp. US) will read maize. Minor accessibility point in a text otherwise carefully modernised. | minor | "as in the green blade of growing corn" | "the green blade of growing corn" | "the green blade of growing grain" |
| F43 | Second-person addition to a simile ("the way **you'd praise**"). | minor | "yet the persons commended, upon hope of future fruit, as in the green blade of growing corn" | "even while commending the people themselves, in hope of future fruit, the way you'd praise the green blade…" | "…in hope of future fruit, as one commends the green blade of growing grain" |

Paragraph 16 handles the chapter's hardest fidelity trap correctly: the two genuinely undecidable cases ("we can't tell whether it's out of…greed for possessions" / "…out of a desire to hurt") stay undecidable, and "who could doubt it should be done, since the society that serves you is the just one?" stays a question.

---

## Packet 7 — paragraphs 18–20

| # | Finding | Sev | Source | Candidate | Proposed correction |
|---|---|---|---|---|---|
| F44 | **Third-person editorial gloss inside first-person narration.** "which Augustine belonged to for years" breaks the voice of the entire chapter — Augustine is the narrator and cannot refer to himself in the third person. It also lands inside the *bishop's* reported backstory, so on a first read it appears to be describing the bishop's history, not Augustine's. And the drafter's stated rationale is factually wrong: "Manichaean"/"a Manichaean" first appears in para 17, not para 20, so this gloss arrives two paragraphs after the reader already needed it. | **major** | "had by his seduced mother been consigned over to the Manichees" | "had been handed over to the Manichees — **a heretical sect claiming secret spiritual knowledge, which Augustine belonged to for years** — by his own misguided mother" | Remove the gloss from para 20 entirely. If a gloss is wanted, put a short one in Augustine's own voice at first use in para 17, e.g. "some Manichaean holy man — one of the sect I had joined". Para 20 then reads: "had been handed over to the Manichees by his own misguided mother". |
| F45 | **Juxtaposition turned into causation.** The source is an absolute construction — God pulled him out *while* his mother wept. "through my mother" makes her the instrument of the rescue, a theological claim the source withholds here. | moderate | "and drewest my soul out of that profound darkness, my mother, Thy faithful one, weeping to Thee for me" | "pulled my soul up out of that deep darkness — **through** my mother, your faithful servant, weeping to you for me" | "pulled my soul up out of that deep darkness — my mother, your faithful one, weeping to you for me…" |
| F46 | Question flattened. The source's "Whence was this also, that…?" is a genuine question; the candidate's "How else explain what happened next, when…" is punctuated as a statement and never resolves into a question, leaving a long sentence with no grammatical anchor. | moderate | "Whence was this also, that when she had told me this vision…she presently…replies: '…'?" | "How else explain what happened next, when she told me this vision, and I tried to twist it…— she answered at once…" | "Where else did this come from? When she had told me this vision and I tried to twist it…she replied at once, without any hesitation: '…'" |
| F47 | **Register clash.** "spin" is contemporary media slang and is the only word of its kind in the chapter; it also drops "false" from "my false interpretation". | moderate | "she was not perplexed by the plausibility of my false interpretation" | "she wasn't thrown off by **the plausible spin I put on it**" | "she wasn't thrown off by how plausible my false reading sounded" |
| F48 | "how great its impiety" → "how deep its wrongness goes" — a precise theological term flattened into a vague moral one, in a sentence spoken by a bishop about a heresy. | moderate | "he will of himself by reading find what that error is, and how great its impiety" | "He'll find out for himself, through his own reading, what that error is and **how deep its wrongness goes**" | "…what that error is, and how great its impiety" |
| F49 | Scope shifted. Source: he read **and frequently copied out almost all** their books. Candidate attaches "almost all" to reading only and downgrades copying to "most", dropping "frequently". | minor | "had not only read, but frequently copied out almost all, their books" | "had not only read almost all their books but had copied out **most of them** by hand" | "had not only read but repeatedly copied out almost all of their books" |
| F50 | "seduced" (led astray, doctrinally) softened to "misguided". | minor | "by his seduced mother" | "by his own misguided mother" | "by his mother, who had been led astray herself" |
| F51 | The chapter's most quoted line is softened: "perish" → "be lost". | minor | "it is not possible that the son of these tears should perish" | "It isn't possible that the son of these tears should be lost." | restore "should perish" |
| F52 | Parenthetical promoted to a main clause — contrary to the drafter's own stated method (the notes claim both parentheticals in para 20 were kept subordinate; this one was not). | minor | "Which answer she took (as she often mentioned in her conversations with me) as if it had sounded from heaven." | "**She often mentioned afterward, in conversations with me,** that she took that answer as though it had come down from heaven itself." | "She took that answer — as she often mentioned in conversations with me — as if it had sounded from heaven." |
| F53 | "Thou Good omnipotent" flattened to a generic noun phrase; and the relative clause switches person mid-sentence ("who **cares**…as if **you** cared"). | minor | "O Thou Good omnipotent, who so carest for every one of us…" | "O good and all-powerful one, who cares for each of us as if you cared for him alone" | "O good and all-powerful God, you who care for each of us as if you cared for him alone" |

**Positive, para 18–20:** the dream is reported accurately, including the wooden rule (glossed once, briefly and usefully, as "a kind of wooden rule or measuring rod"), the parenthetical about instructing figures, and — critically — the exact word order of the two versions of the oracle in para 19 ("where he is, you will be too" vs "where you are, he will be too"), on which the whole anecdote turns. "wisely, as I realized only later" is correctly kept as Augustine's retrospective gloss and not attributed to the bishop.

---

## Whole-chapter read

Read straight through as continuous prose, this is a genuinely good modern English rendering, and its problems are local rather than structural.

**Voice.** Consistent, elevated-but-plain, confessional, second-person address to God throughout. The register sits well: not chatty, not pseudo-archaic. Two breaks stand out against that consistency. The first is F44, the third-person "which Augustine belonged to for years" in para 20 — it reads as a footnote that fell into the text and is the single most jarring moment in the chapter. The second is F47's "spin" in para 19, the only piece of contemporary idiom in 5,800 words. Both are isolated and easy to fix.

**Flow.** Sentence-splitting is handled with judgement. Para 9's certainty-ladder and para 12's analogy-chain are the two places the source's syntax is most punishing, and in both the drafter broke long periods into readable units without reordering or losing links — para 12 in particular is a success. Para 15 is the one place where the opposite call (keeping one long enumerated sentence) was made, and the notes' reasoning for that is sound, but the execution leaves F36, a clause a reader will genuinely stumble on.

**Systemic pattern worth naming.** Four rhetorical questions become exclamations or statements (paras 0, 7, 9, 19 — confirmed by punctuation count: source has a "?" in each, candidate has none). Augustine's questions to God are not decorative; they are the chapter's characteristic rhetorical move, and converting them to exclamations gives the prose a declamatory rather than interrogative cast. This is one repeated habit, not four unrelated slips, and should be fixed as a single pass.

**Second systemic pattern.** A low-grade tendency to add a connective or an interpretive word that closes something the source leaves open: "beneath that lay" (F3), "was meant to" (F16), "that wisdom promises" (F19), "yet lofty" (F22), "instead of you" (F38), "through my mother" (F45), "supposedly" (F40), "appropriate to" (F32). Individually these are small; cumulatively they make the candidate slightly more explanatory and slightly less ambiguous than Augustine. Only F19 and F45 rise above minor, but the pattern is worth a dedicated sweep.

**Terminology.** Handled well overall. Cicero/Tully unified to Cicero, *Hortensius* left as a title, "Elect" kept in quotes as the Manichees' own term, "Manichees/Manichaean" kept and consistent, Carthage plain, Sodom plain, greaves glossed as "shin guards" in-image rather than in a note. The one real failure is F44's placement and voice; the one real omission is "the Paraclete" (F27); and F14 (Subverters → Wreckers) is a defensible but undeclared rename.

**Accuracy of the drafter's notes.** Mostly honest and useful, but two claims do not survive checking: (a) the notes say the Manichee gloss was placed at "its one explicit naming in para 20" — "Manichaean"/"a Manichaean" appears twice in para 17, before the gloss; (b) the notes say both parenthetical clauses in para 20 were kept subordinate — the "as she often mentioned" parenthetical was promoted to a main clause (F52). The notes also omit the Subverters → Wreckers rename entirely. Treat the notes as a draft log, not a verification record.

---

## Verdict

**Findings: 53 total — 6 major, 12 moderate, 35 minor.**

Major (6): F10 (invented clause "though never less than perfect", para 2) · F24 (dropped "in looking for whom I fail", para 9) · F28 (husks/swine clause garbled, para 10) · F31 ("foot" → "syllable" makes the metre analogy false, para 13) · F35 (condemned morsel inverted into a condemned act, para 17) · F44 (third-person "Augustine" gloss breaks voice, para 20).

**Recommendation: correction-and-verify, not a re-draft.**

The foundation is sound: 21/21 alignment, no archaism survives, no paragraph is summarised or padded, the hardest passages (paras 9, 12, 14, 16) are handled with real care, and the blunt material (Sodom, the sacrilege during the liturgy, the Manichee fig doctrine) is not softened. The six major findings are all single-clause defects — one invented clause, one dropped clause, one garbled clause, one wrong technical term, one inverted subject, and one misplaced editorial gloss — each fixable in place without disturbing surrounding text. I would fix the six majors, run a single pass restoring the four flattened rhetorical questions (paras 0, 7, 9, 19), fix F36's unreadable clause and F47's register break, then re-verify the corrected file against the source packet by packet before it goes anywhere near `modern-en`.
