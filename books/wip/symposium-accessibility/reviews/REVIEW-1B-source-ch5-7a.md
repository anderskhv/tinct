# Review 1B: source fidelity, Symposium modern-en accessibility pass (chapters 5, 6 and 7.0-7.44)

- **Reviewer role:** independent source-fidelity reviewer (did not write the text under review).
- **Packet reviewed:** source-packet-B: Aristophanes's speech (5.0-5.17), Agathon's speech (6.0-6.11) and Socrates questioning Agathon (7.0-7.44). 45 changed paragraphs.
- **Candidate sha256:** `46fa34ea4821eb2fa5e713915acb40bbf10fe224d79682adde9f68feb2b0113e`. This matches the packet header. The source (`3521a12d…95a6`) and baseline (`1e970b7b…374f`) files also match STYLE.md §1.
- **Method:** every CANDIDATE was compared with SOURCE (Jowett) sentence by sentence against STYLE.md. Neighboring unchanged paragraphs (5.14, 6.1, 6.5, 6.12 and 7.1-7.43) were read from the full JSON editions to check continuity, quotation levels and the argument chain.

## Overall verdict: ACCEPT WITH CHANGES

No BLOCKING error was found. No argument step, example, image, proper name or number is missing, and no speech is framed as Plato's own verdict.

- **Socrates questioning Agathon (7.0-7.44):** the argument is exact. Every "want", "wanting" or "in want of" that means lacking is rendered "lack". "Want" survives only as desire (7.0, 7.20). Each question and answer keeps its logical force, including the correct "lack" reading at 7.18 and the conditional at 7.42. The lover/beloved and lack/desire distinctions hold throughout.
- **Aristophanes:** his account keeps the three sexes, the attractions of each kind of half, the adultery remark and the pederastic relations. There is no euphemism and no modern identity label: "genitals" and "women who are attracted to women" are used per §4.
- **Agathon:** his ornament (anaphora, balanced antitheses, the closing hymn) is kept in intelligible form.

The 11 SHOULD-FIX items are small restorations. Most have one shared cause: in places where Jowett reads differently, the candidate silently follows Plato's Greek (or a modern translation). Examples are "shares in" (5.1), "at least" and "boys" (5.3), "welcome" (5.4), "so, as I asked" (5.7) and "my dear" (7.44). Several of these follow the original correctly. But STYLE.md makes Jowett the source and permits only §5 glosses and §3.5 tags. These departures should therefore be reverted, or adopted under an explicit, documented source-variant policy. The remaining SHOULD-FIX items are clarity fixes (5.1, 5.2, 5.6), a glossary point (6.4) and a cross-paragraph coherence fix (6.11).

**Counts:** BLOCKING 0 · SHOULD-FIX 11 · OPTIONAL 11.

## Findings

| # | Coordinate | Severity | Finding | Source wording | Candidate wording | Suggested fix |
|---|---|---|---|---|---|---|
| 1 | 5.0 | OPTIONAL | Number agreement shifts from singular "has" to plural "they" within one sentence. | "Mankind, he said, judging by their neglect of him, have never, as I think, at all understood the power of Love." | "Mankind, I think, has never understood the power of Love at all, judging by how they neglect him." | "Human beings, I think, have never understood the power of Love at all, judging by how they neglect him." |
| 2 | 5.1 | SHOULD-FIX | The claim is weakened: Jowett says the moon "is made up of" sun and earth, and "shares in" is weaker and more abstract. The dropped verb also causes a misreading on first hearing ("both male and female of the moon"). | "and the man-woman of the moon, which is made up of sun and earth" | "and the one that was both male and female of the moon, which shares in both sun and earth." | "and the one that was both male and female was the child of the moon, which is made up of sun and earth." |
| 3 | 5.1, 6.4 | OPTIONAL | Names are left in Jowett's spelling. §4 adopts standard modern forms (Heraclitus, Diomedes), and the candidate itself changes "Mantineia" to "Mantinea" at 7.45. | "Otys and Ephialtes"; "the weaving of Athene" | "Otys and Ephialtes"; "the weaving of Athene" | "Otus"; "Athena" (or add both to §4 as deliberate keeps). |
| 4 | 5.2 | SHOULD-FIX | Hard to follow on first hearing. Only one half gets the gloss ("which we now call a woman"), and the relative clause can attach to "a whole woman". Jowett's symmetrical "man or woman as we call them" is lost. | "the survivor sought another mate, man or woman as we call them,--being the sections of entire men or women,--and clung to that." | "the survivor went looking for another partner — whether the half of a whole woman, which we now call a woman, or the half of a whole man — and clung to it." | "the survivor went looking for another partner — a man or a woman, as we now call them, being halves of whole men or whole women — and clung to it." |
| 5 | 5.3 | SHOULD-FIX | Unlicensed addition. "at least" is not in Jowett. It ranks the male-male outcome as a consolation, which adds an evaluative note to a sensitive passage. It matches the Greek *goun*, so if kept it must be a documented source-variant decision, not a silent change. | "or if man came to man they might be satisfied, and rest, and go their ways to the business of life" | "and when a man came together with a man, they would at least be satisfied, and rest, and go back to the business of life." | Delete "at least". |
| 6 | 5.3 | SHOULD-FIX | Age term changed. §2 keeps ages "as the source states them". Jowett says "young"; the candidate narrows this to "boys" in a sentence about embracing men. The Greek supports "boys", but it is not the source's wording. | "and while they are young, being slices of the original man, they hang about men and embrace them" | "While they are boys, being slices of the original male, they seek out men's company and embrace them" | "While they are young, being slices of the original male, ..." |
| 7 | 5.4 | SHOULD-FIX | Softening. Jowett's "embrace" (used twice) keeps the physical sense of the behavior Aristophanes is defending (compare 5.3 "embrace them"). "Welcome" keeps only the social sense. | "and they embrace that which is like them" / "always embracing that which is akin to him" | "and they welcome what is like themselves" / "always welcoming what is akin to him" | "and they embrace what is like themselves" / "always embracing what is akin to him" |
| 8 | 5.4 | OPTIONAL | The hedge "as I may say" (the "so to speak" type that §2 keeps) is turned into "hardly". The effect is similar, but the listed qualifier is not kept as such. | "and one will not be out of the other's sight, as I may say, even for a moment" | "and will hardly let each other out of sight even for a moment" | "and will not, so to speak, let each other out of sight even for a moment" |
| 9 | 5.6 | SHOULD-FIX | Unclear, and it drifts from the source. "escape the one fate" is obscure on first hearing: which fate? "the one" can also be heard as "the only". It replaces Jowett's general "avoid evil". | "that we may avoid evil, and obtain the good, of which Love is to us the lord and minister" | "so that we may escape the one fate and win the good things that Love, our lord and guide, leads us to." | "so that we may avoid evil and win the good things that Love, our lord and guide, leads us to." |
| 10 | 5.6 | OPTIONAL | "monuments" is narrowed to "gravestones", a specific funereal image that is not in the source. | "which are sculptured on monuments" | "carved in low relief on gravestones" | "carved in low relief on monuments" |
| 11 | 5.7 | SHOULD-FIX | Logical connective changed. Jowett's concessive "although" (different from yours, yet spare it) becomes a consequential "so" (different, therefore spare it). | "which, although different to yours, I must beg you to leave unassailed by the shafts of your ridicule" | "It is different from yours; so, as I asked, please don't make it a target for your jokes" | "It is different from yours, but, as I asked, please do not make it a target for your jokes" |
| 12 | 5.7, 6.4 | OPTIONAL | Contractions inside set speeches. §6 keeps set speeches in a fuller register, although the accepted 3.0 also contracts, so this is for consistency only. | "I must beg you to leave [it] unassailed"; "do we not know that he only of them whom love inspires has the light of fame?" | "please don't make it a target"; "don't we know that only those whom love inspires win the light of fame" | "please do not make it"; "do we not know that" |
| 13 | 5.13 | SHOULD-FIX | Omission: "foolish" is dropped, which weakens Socrates's ironic adoption of Agathon's "fools" (5.12). | "having been a part of the foolish many in the theatre" | "since we were there in the theater, part of the crowd" | "since we were there in the theater, part of the foolish crowd" |
| 14 | 5.13 | OPTIONAL | "I know" is dropped. The tag question survives, but Socrates's own claim to know is gone. | "though I know that if you chanced to be in the presence ... of some really wise man, you would be ashamed" | "Still, if you found yourself in front of some truly wise man, rather than one of us, you would be ashamed" | "Still, I know that if you found yourself ..." |
| 15 | 5.15 | OPTIONAL | "even" is added, which sharpens a plain conditional. "in their presence" is dropped. | "But before the many you would not be ashamed, if you thought that you were doing something disgraceful in their presence?" | "'But in front of the crowd you would not be ashamed, even if you thought you were doing something disgraceful?'" | "'But in front of the crowd you would not be ashamed, if you thought you were doing something disgraceful in front of them?'" |
| 16 | 5.16 | OPTIONAL | "no longer care" (he will stop caring) becomes "won't care in the least". | "he will no longer care about the completion of our plan" | "he won't care in the least about finishing what we set out to do" | "he'll no longer care about finishing what we set out to do" |
| 17 | 6.2 | OPTIONAL | The scope widens: "a proof" becomes "the proof". | "And a proof of his flexibility and symmetry of form is his grace" | "The proof of his suppleness and his well-proportioned form is his grace" | "A proof of his suppleness ..." |
| 18 | 6.3 | OPTIONAL | Agathon's ornament is flattened: the personified "laws which are the lords of the city" become plain "laws that rule the city". | "as the laws which are the lords of the city say" | "as the laws that rule the city declare" | "as the laws, the lords of the city, declare" |
| 19 | 6.4 | SHOULD-FIX | Glossary (§4 says capitalization is "kept as the source distinguishes them"). Earlier in this paragraph Jowett writes lowercase "the love of beauty"; here he capitalizes "the Love of the beautiful". The candidate lowercases both. The Greek (*tou eran*) supports lowercase; if that is kept, record it as a deliberate exception. | "and from the Love of the beautiful, has sprung every good in heaven and earth" | "every good thing in heaven and on earth has come from the love of beauty" | "every good thing in heaven and on earth has come from the Love of the beautiful" |
| 20 | 6.11 | SHOULD-FIX | "permission" is dropped, so the unchanged next paragraph (6.12 "'I grant the permission,' said Phaedrus") no longer has anything to refer back to. | "let me have your permission first to ask Agathon a few more questions" | "'let me first ask Agathon a few more questions" | "'with your permission, let me first ask Agathon a few more questions" |
| 21 | 7.0 | OPTIONAL | The "love of a father / of a mother" remark still needs decoding on first hearing. The candidate also makes the question ridiculous rather than the answer ("I am not asking whether" instead of Jowett's "I do not want you to say"). That matches the sense and is acceptable, but the sentence stays opaque. | "I do not want you to say that love is the love of a father or the love of a mother--that would be ridiculous" | "I am not asking whether love is the love of a father or the love of a mother — that would be ridiculous." | No change required. Making the joke intelligible would need a gloss beyond Jowett's wording, so that needs an explicit editorial decision. |
| 22 | 7.44 | SHOULD-FIX | The address is softened. "beloved Agathon" is the source's only "beloved" vocative, distinct from "my dear Agathon" at 5.16 and 7.0. Making it "my dear" loses a charged address in a dialogue about love. The causal "for" is also dropped. | "Say rather, beloved Agathon, that you cannot refute the truth; for Socrates is easily refuted." | "'Say instead, my dear Agathon, that it is the truth you cannot refute; Socrates is easily refuted.'" | "'Say instead, my beloved Agathon, that it is the truth you cannot refute; for Socrates is easily refuted.'" |

## Coverage

| Coordinate | Result |
|---|---|
| 5.0 | 1 |
| 5.1 | 2, 3 |
| 5.2 | 4 |
| 5.3 | 5, 6 |
| 5.4 | 7, 8 |
| 5.5 | OK |
| 5.6 | 9, 10 |
| 5.7 | 11, 12 |
| 5.8 | OK |
| 5.9 | OK |
| 5.10 | OK |
| 5.11 | OK |
| 5.12 | OK |
| 5.13 | 13, 14 |
| 5.15 | 15 |
| 5.16 | 16 |
| 5.17 | OK |
| 6.0 | OK (Ate gloss accurate and minimal; "Old Age" personification clarified) |
| 6.2 | 17 |
| 6.3 | 18 |
| 6.4 | 3, 12, 19 (Euripides fragment correctly marked as a quotation) |
| 6.6 | OK (hymn's anaphora and antitheses kept) |
| 6.7 | OK |
| 6.8 | OK |
| 6.9 | OK (Gorgias/Gorgon pun glossed accurately) |
| 6.10 | OK |
| 6.11 | 20 |
| 7.0 | 21 |
| 7.4 | OK |
| 7.10 | OK |
| 7.14 | OK |
| 7.16 | OK |
| 7.18 | OK ("lack" is the correct reading of the premise) |
| 7.20 | OK |
| 7.22 | OK |
| 7.24 | OK |
| 7.26 | OK |
| 7.28 | OK (matches 6.4 "brought order to the affairs of the gods") |
| 7.30 | OK |
| 7.32 | OK |
| 7.34 | OK |
| 7.36 | OK |
| 7.40 | OK |
| 7.42 | OK |
| 7.44 | 22 |

45 of 45 coordinates checked.

## Checks that passed

- **Packet integrity:** the packet texts are identical to the JSON files. The changed paragraphs in chapters 5, 6 and 7.0-7.44 are exactly the packet's 45 coordinates.
- **Typography:** no curly quotes, no non-ASCII character other than the em-dash, every em-dash spaced, no leftover "--", and American spelling throughout.
- **Glossary §4:** applied correctly:
  - fair → beautiful
  - temperance → self-control
  - God → the god
  - Lacedaemonians → Spartans
  - want (meaning lack) → lack
  - privy members / parts of generation → genitals
  - female companions → women who are attracted to women
  - lover's intercourse → sex
  - encomium → speech in praise
  - No residual archaisms (Nay, Methinks, fain, Wherefore, hitherto).
- **Glosses §5:** these are accurate, minimal and neutral:
  - 5.3 token image (STYLE's own example)
  - 5.6 "low relief", "halves of a broken token"
  - 5.2 "drawstring purse"
  - 6.0 "Ate, the goddess of folly and ruin"
  - 6.9 "the head of Gorgias — a Gorgon's head, as in Homer"
- **Quotation and speaker tags §3:**
  - Aristophanes's and Agathon's speeches are unquoted set speeches, and 5.0 has its tag ("He began:").
  - Zeus's words (5.1-5.2, reopened at 5.2) and Hephaestus's words (5.5) are single-quoted inside the set speech.
  - Nesting is correct at 6.10, 7.14 and 7.20.
  - Pronouns are replaced with names only where "he/him" could be misread: 5.2 Apollo, 6.3 the God of War, 6.11 Socrates.

## Notes (not findings)

1. **Policy question behind most findings.** Several other Greek-tracking departures are harmless or improvements, and I accepted them:
   - 5.2 "toward the cut side"
   - 5.3 "pursue males"
   - 5.5 "never apart"
   - 6.6 "partly playful and partly, in a modest way, serious"
   - 6.10 "competing with your speeches"
   - 7.14 "rather than 'probably'"
   - 7.40 "what is good also beautiful"

   The team should decide once whether Greek-based corrections are allowed and record that decision in STYLE.md.
2. **7.0 quotation convention.** 7.0 is unquoted while Socrates's next questions (7.2, 7.4 ...) are single-quoted. This existed before the pass and STYLE §3.1 cites 7.0 as a model, so it is not a finding here. It may still look inconsistent to readers.
3. **Out of scope.** The unchanged 6.12 ends "as follows:—" with an unspaced em-dash, which conflicts with §6.
4. **Inherited from Jowett, deliberately kept.** 7.26 and 7.32 say "something that a man lacks", and then 7.34 says "Love lacks beauty". The candidate faithfully keeps this step as Jowett has it. No change is recommended.
