# Confessions Book 5 — Modern English Candidate — Editorial Notes

## Question-mark count (verified programmatically, paragraph-by-paragraph)

Source total: **18** question marks. Output total: **18** question marks. Matched paragraph-by-paragraph — every paragraph's source "?" count equals the output's "?" count (script run against both files; see table below).

| Para | Source ? | Output ? |
|---|---|---|
| 1 | 1 | 1 |
| 2 | 5 | 5 |
| 3 | 0 | 0 |
| 4 | 0 | 0 |
| 5 | 0 | 0 |
| 6 | 0 | 0 |
| 7 | 1 | 1 |
| 8 | 1 | 1 |
| 9 | 1 | 1 |
| 10 | 1 | 1 |
| 11 | 1 | 1 |
| 12 | 0 | 0 |
| 13 | 1 | 1 |
| 14 | 0 | 0 |
| 15 | 1 | 1 |
| 16 | 2 | 2 |
| 17 | 3 | 3 |
| 18–25 | 0 | 0 |

Every source rhetorical question ("Does it please you...?", "Who told Manichaeus to write...?", "Could you have despised and rejected the aid she sought...?", etc.) was rendered as a genuine interrogative in the output, not flattened into a statement or exclamation. This was checked specifically per the project's known failure mode from Books 3/4.

## Technical/proper terms kept and why

- **Faustus** — Manichee bishop's name, kept exactly; never generalized to "the bishop" or "the teacher."
- **Manichees / Manichaeus** — kept the sect name "Manichees" (adjective "Manichaean" where source uses it) and the founder's proper name "Manichaeus" distinct from each other, consistently, as in source.
- **Academics / Academici** — rendered "the Academics" (para 19 and 25), matching source's use of the proper philosophical-school name (skeptics who held that nothing can be known with certainty), not softened to "skeptics" generically.
- **Catechumen** — kept as the technical term (a person under instruction preparing for baptism, not yet a full member) rather than paraphrased as "student" or "trainee," since Tinct's onboarding assumes no theological background but this is a precise institutional status the paragraph is specifically about.
- **Ambrose** — kept as proper name throughout, with "Bishop Ambrose" on first mention per source.
- **The Elect** — kept capitalized and quoted as a Manichee technical term (the top rank of Manichee membership, distinct from ordinary "hearers"/disciples), matching source's use of quotation marks around "holy ones" and "The Elect."
- **Helpidius, Symmachus, Cyprian** — proper names kept unchanged.
- **Academics' "doubting everything"** — rendered literally as "doubting everything" / "no truth can be grasped by human beings" rather than summarized, since this is the specific philosophical claim Augustine is reporting.

## Hardest paragraphs and tradeoffs

- **Paragraph 1** — the opening invocation is dense, addressed directly to God in second person throughout ("Thou" → "you," "Thy" → "your"). Some clauses (e.g., "seeing a closed heart closes not out Thy eye") had to be re-ordered for modern syntax while keeping every clause's content — rendered as "a closed heart does not shut out your eye" to preserve the logical structure (closed heart / God's eye / can't shut it out) without adding connectives not in source.
- **Paragraph 17** — has three consecutive rhetorical questions stacked with embedded subordinate clauses (about Monica's devotions — daily almsgiving, twice-daily church attendance, "not for idle tattlings and old wives' fables"). Kept all three as questions and kept the embedded clauses inside each question rather than breaking them into separate declarative sentences, which was the path of least resistance but would have lost the rhetorical build.
- **Paragraph 19 (harbor/deception scene)** — deliberately did not soften "I deceived her," "I lied to my mother, and such a mother, and escaped," or Monica's grief ("frantic with sorrow," "filled Thine ears... which didst then disregard them"). Kept "she on the morrow was there, frantic with sorrow" and the flat statement that God "disregarded" her weeping in the moment — did not add any softening qualifier or foreshadowing comfort not present in the source sentence itself (the comfort/reversal is stated by Augustine only afterward, in the following clause about "hurrying me to end all desire").
- **Paragraph 20 (illness in Rome)** — "For how should He, by the crucifixion of a phantasm, which I believed Him to be?" is a compressed, elliptical rhetorical question (Augustine at this stage held the Manichee view that Christ's body was illusory, so a "phantom" couldn't really have died to reconcile anyone to God). Rendered as "For how could he, through the crucifixion of a phantom — which is what I believed him to be?" — kept as a question, kept "phantom" (not paraphrased to "illusion" or "apparition," which would blur the specific Manichee doctrinal claim), and did not add explanatory text spelling out the theological logic beyond what the source states.
- **Paragraph 24 (Ambrose's sermons)** — "these things also had now begun to appear to me capable of defence" and "the Catholic faith... I now thought might be maintained without shamelessness" — kept the qualified, provisional phrasing ("began to," "without shamelessness/embarrassment") rather than upgrading to a stronger claim like "I now believed" — Augustine at this point is still only conceding intellectual respectability, not belief, and the paragraph 25 explicitly says the Catholic cause seemed "not vanquished... not as yet victorious," which the ending of 24 must set up accurately.

## Ambiguity preserved

- Paragraph 9: "who would not judge that such madness... deserved to be despised and utterly rejected?" is left as Augustine's own rhetorical question, not resolved into "everyone would judge" — the source itself keeps it as a question inviting the reader's agreement, not a flat assertion.
- Paragraph 13: "Or how else could we obtain salvation, except from your hand, remaking what it made?" — kept as an open rhetorical question rather than converted to "we can only obtain salvation from your hand," which would remove the interrogative form the source specifically uses at this emotional turning point (recognizing providence in the Faustus disappointment).
- Paragraph 17: "some of which I have mentioned, some I have not mentioned" (visions/answers to Monica) is kept ambiguous/unspecified, as in source — did not invent examples of what those visions were.
- No causal connectives were added beyond what source states. E.g., paragraph 14 (move to Rome) keeps "my main, almost my only, reason was..." as Augustine's own stated ranking of motives, without adding "because" clauses explaining why quieter students mattered more to him than money/status — the source states the ranking but not further justification, and the output does not supply one.

## Self-assessment

All 25 paragraphs render one-to-one with the source, preserve every question as a genuine interrogative (18/18 matched), and keep technical/proper terms (Faustus, Manichees/Manichaeus, Academics, catechumen, Ambrose, The Elect) consistent throughout. The hardest material — Monica's grief at the harbor and Augustine's guilt over deceiving her, and the illness/near-death passage in Rome — was rendered without softening ("I deceived her," "I lied to my mother, and such a mother," Monica "frantic with sorrow," God's disregard of her weeping "in that order" left intact as stated). One honest limitation: a few long periodic sentences (paragraphs 1, 9, 14, 20) were restructured for modern readability more heavily than the shorter paragraphs, and while every clause is present, a close side-by-side reader may find the exact clause order shifted in two or three places — worth a second editorial pass focused specifically on clause-order fidelity in those four paragraphs before this is accepted.
