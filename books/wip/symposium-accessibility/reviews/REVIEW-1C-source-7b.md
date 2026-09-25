# Review 1C: source fidelity, Symposium 7.45–7.68 (Diotima)

- **Reviewer role:** independent source-fidelity reviewer. I did not write the text under review.
- **Packet:** `source-packet-C.md`, the 24 changed paragraphs 7.45–7.68 (Socrates's account of Diotima's teaching).
- **Candidate:** `cand/symposium-modern-en.json`, sha256 `46fa34ea4821eb2fa5e713915acb40bbf10fe224d79682adde9f68feb2b0113e`. I recomputed the hash and it matches the packet header.
- **Source:** `base-original-en.json` (Jowett), sha256 `3521a12d…95a6`. It matches STYLE.md §1.
- **Standard:** STYLE.md. Each candidate paragraph was compared with the Jowett source sentence by sentence. The Greek is cited only to explain where a candidate reading came from. Jowett remains the pinned source.

## Overall verdict: ACCEPT WITH CHANGES

The candidate renders the philosophical core carefully, and it is far easier to follow than the baseline. These points are all present and correctly scoped:

- the intermediate status of Love (between mortal and immortal, wise and ignorant, beautiful and ugly);
- correct opinion, with its definition in full;
- the distinction between love and the beloved;
- love as love of possessing the good forever;
- birth in beauty, in body and in soul, including pregnancy and procreation;
- the lesser and greater mysteries;
- the order of the ascent (one body, all bodies, souls, institutions and laws, branches of knowledge, beauty itself);
- every attribute of absolute beauty;
- "if any mortal can".

The multi-paragraph quotation convention is applied without error. House style is clean. The glossary is followed with one exception (finding 6).

Five points change what Jowett says. Each needs only a phrase-level fix before acceptance:

- a narrative fact (7.48);
- a speaker attribution (7.54);
- an image lost in the lover/beloved context (7.60);
- an age term together with a softened verb (7.63);
- a lost "enabled to" in the climax (7.66).

Several of these come from one systematic habit. In more than two dozen places the candidate follows Plato's Greek, or a modern translation based on it, instead of Jowett (finding 28). Most of these changes are harmless. However, the book workflow pins one English baseline and forbids silently mixing readings, so the editors should either revert them or record them as deliberate source variants. If such variants are already documented elsewhere, findings 1 and 2 reduce to a documentation check.

**Counts:** 5 BLOCKING, 11 SHOULD-FIX, 12 OPTIONAL.

## Findings

| # | Coordinate | Severity | Finding | Source wording | Candidate wording | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | 7.48 | BLOCKING | A narrative fact is changed. Jowett says Love was *born* on Aphrodite's birthday; the candidate says *conceived*. This follows the Greek *gennetheis* (203c) and modern translations, not the pinned source. The candidate also changed 7.47 to "On the day Aphrodite was born" (see 28). Restoring "born" gives Jowett's own sequence. | `and also because he was born on her birthday, is her follower and attendant` | `and partly because he was conceived on her birthday` | `and partly because he was born on her birthday`. Alternatively, record "conceived" as a documented source variant. |
| 2 | 7.54 | BLOCKING | The speaker attribution is changed. In Jowett, "But why of generation?" has its own quotation marks and the answer is tagged "she replied", so the question reads as Socrates's. The candidate merges question and answer into Diotima's speech and drops "she replied". The Greek (206e) gives both lines to Diotima, but that is not the pinned source. | `'Yes, indeed,' she replied. 'But why of generation?' 'Because to the mortal creature, generation is a sort of eternity and immortality,' she replied;` | `'Yes, indeed,' she said. 'But why of procreation? Because for a mortal creature, procreation is a kind of eternity and immortality.` | `'Yes, indeed,' she said. 'But why of procreation?' 'Because for a mortal creature, procreation is a kind of eternity and immortality,' she replied. 'And if, as we have already agreed, …` If the editors still find the untagged question ambiguous, `I asked` is the smallest tag (in the spirit of §3.5). Otherwise, document the variant. |
| 3 | 7.60 | BLOCKING | An image is lost where the text must not be softened. Jowett says the two men "are married by a far nearer tie". The candidate's "joined" removes the marriage image in the male lover/beloved context that STYLE §2 protects. The completeness criterion requires every image to be kept. (The Greek *koinonia*, 209c, is closer to "joined", but Jowett is the source.) | `and they are married by a far nearer tie and have a closer friendship than those who beget mortal children` | `Such people are joined by a far closer tie, and a firmer friendship, than those who have ordinary children` | `Such people are wedded by a far closer tie, and share a firmer friendship, than those who have mortal children`. This also fixes 12. |
| 4 | 7.63 | BLOCKING | An age term and an erotic verb are changed. STYLE §2 says ages ("youths", "boys") stay as the source states them. Jowett has "youth"; the candidate has "boy", which follows the Greek *paidariou* (210d). Jowett's "in love with" is also softened to "devoted to". | `being not like a servant in love with the beauty of one youth or man or institution` | `He will no longer be like a servant devoted to the beauty of one boy or one man or one institution` | `He will no longer be like a servant in love with the beauty of one youth or one man or one institution` |
| 5 | 7.66 | BLOCKING | A qualification (modality) is lost in the climax. In Jowett, "will be enabled" governs both "to bring forth … realities" and "to become the friend of God and be immortal". The candidate keeps "will he be able to" for the first. The second becomes a plain prediction, which strengthens the claim. "If any mortal can be" is correctly kept. | `he will be enabled to bring forth` … `and bringing forth and nourishing true virtue to become the friend of God and be immortal, if mortal man may.` | `And by bringing forth true virtue and nourishing it, he will become a friend of the gods, and immortal, if any mortal can be.` | `And by bringing forth true virtue and nourishing it, he will be able to become a friend of the gods, and immortal, if any mortal can be.` |
| 6 | 7.47 | SHOULD-FIX | Glossary inconsistency plus a softening. Here "vulgar" means low or menial. §4 renders that sense as "crude" or "base". "Commonplace" means merely ordinary, which weakens Diotima's disparagement of craft wisdom. | `all other wisdom, such as that of arts and handicrafts, is mean and vulgar` | `every other kind of wisdom, such as skill in the arts or in handicrafts, is lowly and commonplace` | `is lowly and base` |
| 7 | 7.48 | SHOULD-FIX | The scope of the negation is ambiguous, carried over from Jowett. A listener can hear "as most people imagine him" as applying to "far from tender and beautiful", which reverses the sense. People imagine him tender and beautiful, as Agathon did. | `and anything but tender and fair, as the many imagine him` | `and far from tender and beautiful, as most people imagine him` | `and far from being the tender and beautiful creature most people imagine;` |
| 8 | 7.51 | SHOULD-FIX | Jowett's definition is silently replaced with the Greek *aitia* (205b–c). Jowett calls the creation, the passage itself, "poetry or making". The candidate calls every *cause* of the passage "poetry". This changes the subject of the definition, and the phrase is hard to follow on first hearing. | `All creation or passage of non-being into being is poetry or making` | `Every cause of anything passing from not being into being is "poetry," that is, making` | `All creation — every passage from not being into being — is "poetry," that is, making` |
| 9 | 7.55 | SHOULD-FIX | Idiom misparse. In modern English, "Don't be surprised if you believe …" means "you may well come to believe …". The intended sense is "If you believe …, there is nothing surprising here." | `'Marvel not,' she said, 'if you believe that love is of the immortal, as we have several times acknowledged;` | `'Don't be surprised,' she said, 'if you believe that love is love of immortality, as we have agreed several times.` | `'There is nothing to be surprised at,' she said, 'if you believe that love is love of immortality, as we have agreed several times.` |
| 10 | 7.56 | SHOULD-FIX | A small omission. "To us mortals" is dropped. The phrase frames the passage's mortal/divine contrast. | `and what is still more surprising to us mortals` | `and what is even more surprising:` | `and, what is even more surprising to us mortals,` |
| 11 | 7.60 | SHOULD-FIX | The physical image is softened. Jowett's "at the touch of" becomes the modern idiom "in touch with", which means staying in contact or communication. The following words, "even when they are apart", reinforce that reading. | `and at the touch of the beautiful which is ever present to his memory, even when absent` | `In touch with someone beautiful, whom he keeps in mind even when they are apart` | `At the touch of someone beautiful, whom he keeps in mind even when they are apart` |
| 12 | 7.60 | SHOULD-FIX | A word is substituted and another moved. "Mortal children" becomes "ordinary children", which loses the explicit mortal / "more immortal" contrast (7.61 keeps "mortal children"). Jowett's "ordinary" is then dropped from the next sentence. | `than those who beget mortal children` / `would not rather have their children than ordinary human ones` | `than those who have ordinary children` / `would not rather have children like theirs than human ones` | `than those who have mortal children` / `than ordinary human ones` |
| 13 | 7.61 | SHOULD-FIX | A term for other peoples is changed, inconsistently with the rest of the book. §2 says views of other peoples stay as the source states them. The candidate keeps "barbarians" at 3.3 but changes it to "non-Greeks" here. The sense here is neutral to positive, so "barbarians" is not a harmful choice. | `both among Hellenes and barbarians` | `among Greeks and non-Greeks alike` | `among Greeks and barbarians alike` |
| 14 | 7.63 | SHOULD-FIX | Two shifts in the ascent's logic. (a) Jowett's temporal "until he is compelled" becomes a causal claim, "This will compel him". (b) He understands that personal beauty *is* a trifle; the candidate has it merely *seem* trifling, as a consequence. Both follow the Greek purpose clauses (210c), not Jowett. | `until he is compelled to contemplate and see the beauty of institutions and laws, and to understand that the beauty of them all is of one family, and that personal beauty is a trifle` | `This will compel him in turn to contemplate the beauty of institutions and laws, and to see that all this beauty is of one family, so that bodily beauty seems a trifling thing.` | `He does this until he is compelled in turn to contemplate the beauty of institutions and laws, and to see that all this beauty is of one family, and that bodily beauty is a trifling thing.` |
| 15 | 7.64 | SHOULD-FIX | The description of absolute beauty shifts from what beauty *is* to how it *appears*. Jowett's verbless list states what beauty is not, including "existing in any other being". The candidate supplies "Nor will it appear to him", which comes from the Greek (211a). The claims become claims about appearance. | `or in the likeness of a face or hands or any other part of the bodily frame, or in any form of speech or knowledge, or existing in any other being` | `Nor will it appear to him in the likeness of a face or hands or any other part of the body, or in any form of speech or knowledge, or as existing in any other being` | `Nor is it in the likeness of a face or hands or any other part of the body, or in any form of speech or knowledge; nor does it exist in any other being` |
| 16 | 7.65 | SHOULD-FIX | Negation scope, with a possible reversal. After the comma, "with all the colors and vanities of human life" can attach to "divine beauty", so divine beauty would *have* them. In Jowett they are among the things it is *not* clogged with. The trailing appositive is also awkward aloud. | `not clogged with the pollutions of mortality and all the colours and vanities of human life--thither looking, and holding converse with the true beauty simple and divine?` | `not tainted by mortality, with all the colors and vanities of human life — and could look at it and be in its company, the true beauty, simple and divine?` | `not tainted by mortality or by all the colors and vanities of human life — and could look at the true beauty, simple and divine, and be in its company?` |
| 17 | 7.45 | OPTIONAL | The verb is left out and has to be carried across a change of speaker. The source sentence is complete. | `'And is that which is not wise, ignorant?` | `'And whatever is not wise, ignorant?` | `'And must whatever is not wise be ignorant?` |
| 18 | 7.45–7.46 | OPTIONAL | Capitalization is inconsistent within one exchange. Both source instances are lowercase. The candidate capitalizes 7.46 (justified by "he") but not 7.45, although both refer to the god just called "a great god". | `'is love then evil and foul?'` / `because love is not fair and good he is therefore foul and evil` | `'Is love, then, bad and ugly?'` / `because Love is not beautiful and good, he must be ugly and bad` | `'Is Love, then, bad and ugly?'` |
| 19 | 7.46 | OPTIONAL | Jowett's "or" becomes "and" in the definition of the happy. The Greek has "and", but Jowett does not. The argument survives either way. | `those who are the possessors of things good or fair` | `those who possess good and beautiful things` | `those who possess good or beautiful things` |
| 20 | 7.47 | OPTIONAL | "Mysteries" becomes "rites". This loses the lexical thread to 7.55 ("the other mysteries of love") and 7.62 ("lesser" and "greater mysteries"). | `their sacrifices and mysteries and charms` | `their sacrifices, rites and spells` | `their sacrifices, mysteries and spells` |
| 21 | 7.48 | OPTIONAL | (a) "always" is added. (b) "dead" is softened to "dying" ("comes back to life" does keep the implication). (c) "what is beautiful and good" settles Jowett's ambiguity between persons and things. | `on the bare earth exposed he lies under the open heaven` / `and dead at another moment` / `he is always plotting against the fair and good` | `He always lies on the bare ground under the open sky` / `at another he is dying` / `he is always scheming to win what is beautiful and good` | `He lies on the bare ground …` / `at another he dies` / `scheming to win the beautiful and the good` |
| 22 | 7.49 | OPTIONAL | (a) "completely" is an added hedge. (b) "perfectly" is an added intensifier. (c) The source's "he" (the ignorant man) is generalized to "no one", and the explanatory colon becomes "and". | `he is never in want and never in wealth` / `is nevertheless satisfied with himself: he has no desire for that of which he feels no want` | `he is never completely destitute and never rich` / `is nevertheless perfectly satisfied with himself, and no one desires what he does not feel the lack of` | `never without resources and never rich` / `is nevertheless satisfied with himself: he does not desire what he does not feel he lacks` |
| 23 | 7.53 | OPTIONAL | The question is awkward. "When … is called love" is not really about time, and the verb "is" is singular after two nouns. | `what are they doing who show all this eagerness and heat which is called love?` | `What are they doing when all their eagerness and intensity is called love?` | `What are people doing when they show all the eagerness and intensity that is called love?` |
| 24 | 7.59 | OPTIONAL | "Men" becomes "people" in a passage that contrasts men who turn to women with men pregnant in soul. This slightly blurs the historically male framing, although the candidate keeps "he" and "him" afterwards. | `for there certainly are men who are more creative in their souls than in their bodies` | `for there certainly are people who are more creative in their souls than in their bodies` | `for there certainly are men who …` |
| 25 | 7.62 | OPTIONAL | (a) Jowett's "in general" is dropped from an ascent step. (b) "in its company" (the body's company) is odd for "out of that". (c) The front-loaded "whether …" clause with a long dash insertion is hard to follow aloud. | `if beauty of form in general is his pursuit` / `out of that he should create fair thoughts` / `I know not whether you will be able to attain` | `if it is beauty of form he is pursuing` / `and in its company give birth to beautiful thoughts` / `But whether you could attain the greater and more hidden mysteries` … `I do not know.` | `if it is beauty of form in general that he is pursuing` / `and out of that love give birth to beautiful thoughts` / `But I do not know whether you could attain the greater and more hidden mysteries, which are the crown of these, and to which these lead if one pursues them in the right spirit.` |
| 26 | 7.66 | OPTIONAL | (a) "In that communion" becomes "there", which follows the Greek and loses Jowett's image. (b) "Has hold of" weakens to "in touch with". | `Remember how in that communion only` / `for he has hold not of an image but of a reality` | `Remember that only there` / `because he is in touch not with an image but with reality` | `Remember that only in that communion` / `because what he has hold of is not an image but reality` |
| 27 | 7.54, 7.60, 7.61 | OPTIONAL | Small additions and one awkward phrase aloud: "every" is added, "all" is added, and "Athens's" is clumsy to say. | `who presides at birth` / `but of Hellas, as one may say` / `the revered father of Athenian laws` | `who presides over every birth` / `one might say, of all Greece` / `the father of Athens's laws` | `presides at birth` / `of Greece` / `the father of Athenian laws` |
| 28 | Systemic (see list below) | OPTIONAL | Jowett's wording is replaced with Greek-derived readings that change little or no meaning. Individually harmless, but the book workflow says "do not silently mix their readings; document substantive source variants". Not every departure goes toward the Greek: 7.64 rightly keeps Jowett's "under the influence of true love", where the Greek has "correct pederasty" (211b). One consistent policy is needed. | See list | See list | Either accept these as within the pass's latitude and note them in the release packet, or revert them to Jowett. |

### Finding 28: Greek-derived departures from Jowett (meaning essentially unchanged)

- 7.47 `On the day Aphrodite was born` for `On the birthday of Aphrodite`. This interacts with finding 1.
- 7.48 `there was no wine yet in those days` adds "yet".
- 7.49 `For wisdom is one of the most beautiful things` for `For wisdom is a most beautiful thing`; `but what loves is of a different nature` for `but the principle of love is of another nature`.
- 7.51 `so the work done in every art is a kind of making` for `and the processes of all art are creative`; `and given the name of the whole` is added.
- 7.52 `are not said to be in love or called lovers` for `are not called lovers`.
- 7.53 `If that is what love always is` for `Then if this be the nature of love`.
- 7.54 `'Very well,' I said.` for `'Yes,' I said.`; `So love is also love of immortality.` for `Wherefore love is of immortality.`
- 7.55 `What do you think, Socrates, is the cause of this love` for `What is the cause, Socrates, of love`.
- 7.59 `for all time to come` for `in the future`; `from his youth` for `in youth`.
- 7.60 `He goes around looking for beauty in which to beget` for `He wanders about seeking beauty that he may beget offspring`; `what a good man should be and what he should pursue` for `the nature and pursuits of a good man`.
- 7.61 `honored among you` for `revered`.
- 7.62 `if one pursues them in the right spirit` for `if you pursue them in a right spirit`. Jowett's "forms" becomes "bodies" throughout except `beauty of form`. This is a helpful split, since it avoids confusion with Platonic Forms.
- 7.63 `He will no longer be` for `being not`.
- 7.64 `something wonderfully beautiful by nature` for `a nature of wondrous beauty`; `it does not come into being or pass away, grow or shrink` for `not growing and decaying, or waxing and waning`; `All other beautiful things, which are always coming into being and perishing, share in it` for `is imparted to the ever-growing and perishing beauties of all other things`.
- 7.65 `This is the right way to approach the things of love` for `And the true order of going` (Jowett's "order" is lost); `climb ever upward` for `mount upwards`.

## Glosses checked (item 2)

- **7.47 `A great spirit — a daimon —`**: the gloss comes from Jowett's own "(daimon)" and is used once. It matches the §4 note, with dashes in place of parentheses per §6. Accurate, minimal, neutral. **Accept.**
- **7.47 `Metis, or Prudence`**: the §4 rendering. Accurate for Metis in the sense of practical intelligence, and neutral. **Accept.**
- **7.58 `your own Athenian king Codrus`**: Codrus was the legendary king of Athens who died for the city. The gloss explains "your own" (Diotima, a foreigner, speaking to an Athenian), adds two words and makes no judgment. **Accept.**
- **7.60 `— his laws —`**: accurate. It is the standard reading, and 7.61 makes the same point about Solon as "the father of Athens's laws". It is minimal and neutral. It makes Diotima's figure explicit one sentence early, which §5 allows. **Accept.**
- **7.68 `an encomium — a speech in praise of Love —`**: the one retained use of "encomium" that §4 prescribes, with its meaning given. **Accept.**
- Not glosses, but checked: `Mantinea` is the standard modern form and is used consistently (7.45, 7.65). `Sparta` and `Greece` follow §4. Jowett's bracketed notes ("compare 1 Alcibiades", "compare Gorgias", "supra") are omitted by convention.

## Mechanical checks run

- **Structure:** 24 paragraphs, one for each source paragraph. Chapter 7 has 69 paragraphs in both editions. No paragraph is merged, split or reordered. Candidate/source word ratio is 0.88–1.08 for every paragraph.
- **Quotation levels:**
  - Socrates narrates without enclosing quotes (7.45, 7.50, 7.55, 7.58, 7.67, 7.68). Diotima's words and Socrates's past replies are in single quotes, with doubles for nested quotations (7.50, 7.51, 7.56).
  - The continuing speech reopens its quote at each new paragraph and closes only at its end: 7.47→7.49, 7.51→7.52, 7.53→7.54, 7.55→7.57, and 7.58→7.66.
  - Set-speech tag: 6.12 introduces Socrates's set speech, so the untagged return to unquoted narration at 7.45 follows §3.1 and §3.5.
  - The only attribution error is finding 2.
- **House style:** no non-ASCII character other than the em dash, and every em dash is spaced. Only straight quotes are used. No British spellings.
- **Glossary terms:** "lack" (7.46, 7.49), "correct opinion", "self-control" and "Prudence" all conform. "Fair" and "foul" are fully replaced. "The gods" is used for divinity in general (7.47, 7.66). Love/love capitalization departs from the source only where "he/him" or the god is meant; the one inconsistency is finding 18.
- **Quotations:** all 121 quoted snippets in this report were verified by script as exact substrings of the relevant paragraphs.

## Out-of-packet observations (for the relevant reviewers; not scored here)

- 3.3 keeps `subject to the barbarians`. This is the context for finding 13.
- 6.12 ends `Socrates then proceeded as follows:—` with an unspaced colon-dash. Whoever reviews chapter 6 may want to check it against §6.

## Coverage

- 7.45 — 17, 18. The intermediate term between wisdom and ignorance is introduced correctly.
- 7.46 — 18, 19. Correct opinion is defined in full. "Lacks" follows §4.
- 7.47 — 6, 20, 28. Love is intermediate between mortal and immortal. The daimon and Metis glosses are accepted.
- 7.48 — 1, 7, 21, 28.
- 7.49 — 22, 28. The love/beloved distinction is intact.
- 7.50 — OK.
- 7.51 — 8, 28.
- 7.52 — 28. "Love of possessing the good forever" is intact.
- 7.53 — 23, 28. "Giving birth in beauty, in body or soul" and "all human beings are pregnant" are intact.
- 7.54 — 2, 27, 28.
- 7.55 — 9, 28.
- 7.56 — 10.
- 7.57 — OK.
- 7.58 — OK. The Codrus gloss is accepted.
- 7.59 — 24, 28.
- 7.60 — 3, 11, 12, 27, 28. The Lycurgus gloss is accepted.
- 7.61 — 13, 27, 28.
- 7.62 — 25, 28. The lesser and greater mysteries and the first ascent steps are in the correct order.
- 7.63 — 4, 14, 28. The order soul → institutions and laws → branches of knowledge → sea of beauty is correct.
- 7.64 — 15, 28. All attributes of absolute beauty are present.
- 7.65 — 16, 28. The ascent summary is in the correct order. "Beautiful boys and youths" is kept.
- 7.66 — 5, 26. "If any mortal can be" is kept.
- 7.67 — OK.
- 7.68 — OK. The encomium gloss is accepted.
