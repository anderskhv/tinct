# The Comedy of Errors · Forvekslingernes komedie

**Complete Danish review draft. Native-language sign-off is pending with the designated reviewer. Claude owns any release.**

## Files and coverage

- `modern-da.json` contains the complete Danish play in the project’s 11-scene, 690-paragraph structure. Speaker cues identify the two sets of twins by city. The substantial editorial pass reached 314 individual dialogue or direction slots. The before/after ledger records 549 changed slots overall, including speaker localization and address normalization.
- `modern-en.json` is the complete corrected English draft. `edits-en.json` provides the exact before/after text for its 32 proposed changes. `edits-da.json` uses the same one-based chapter and paragraph coordinates.
- The three `source-*.json` files are the Tinct sources from upstream revision `225979e36743d21502ebbace6c253fbc5ce09bfa`. `independent-witness.txt` is the complete Gutenberg witness, including its preliminaries and end matter. The Tinct editions represent the dramatic text, from the entrance of the Duke to the Dromios’ final exit. A Danish cast guide follows below.
- Each chapter was matched to the corresponding witness scene. All 16,094 word tokens of the original scene bodies matched in order after normalizing case and ignoring formatting. Verification also checked paragraph counts and speaker identities in both drafts and bracketed cues in all 74 direction-bearing paragraphs. Three of these carry offstage dialogue in the same slot. The token comparison checks the English source; the Danish reading and wordplay decisions are editorial. See `verification.json` for counts and source/draft fingerprints. [Gutenberg witness](https://www.gutenberg.org/cache/epub/1504/pg1504.txt) · [Folger reading edition](https://www.folger.edu/explore/shakespeares-works/the-comedy-of-errors/read/)
- The play has no performed lyric or song cue. The siren invitation and later reference to her song in 3.2 remain spoken. The parrot’s proverbial warning in 4.4, the peacock’s maxim in 4.3 and the cry from within in 5.1 remain present.

## Scene record

| Scene | Slots | Directions¹ | Decisions for the reviewer |
|---|---:|---:|---|
| 1.1 | 14 | 2 | The death penalty is one thousand marks. Egeon bought the other twins as servants. Both pairs cling to one spare mast, which splits before either rescuing ship reaches them. Kept the father’s uncertainty about which ship took whom. |
| 1.2 | 31 | 6 | Linked money and bruises through “mark/mærker” and repayment in the same coin. Dromio’s “post” becomes an errand and a message beaten into its bearer. The clock strikes twelve and the mistress strikes one on his cheek. |
| 2.1 | 43 | 4 | Luciana says the husband holds the reins. Her “man” entering is a servant. Double hands and two ears, the cuckold's horns, a cross on the skull, and the football of leather remain available to the actors. Adriana’s dark view of fidelity follows her own argument, including the wearing of gold by touch. |
| 2.2 | 87 | 5 | The Syracuse Dromio takes the beating. Danish “smørelse” carries the cooking and beating senses into the dry roast and dry beating. Kept the wig, the legal recovery of hair and bald Father Time. The water drop recalls 1.2. The husband is an elm, the wife a vine. |
| 3.1 | 69 | 7 | Three disembodied voices are labelled from inside. Luce and Adriana enter out of sight of the men outside. The wind from words becomes bodily wind. Replaced the crow/crowbar with a Danish play on the actual tool “koben,” an animal’s leg and a bone to fight over. Balthasar's separate speaking turn survives the missing full stop after his name in the original. |
| 3.2 | 69 | 7 | Preserved Luciana’s troubling advice to conceal infidelity and Antipholus’s erotic siren image. Gave “Nell/ell” a brief performable explanation. Preserved the succession joke in the hairline, the salt passage, Spanish fleets, and the Low Countries at the bottom. The kitchen dog runs the wheel turning the spit. Angelo hands the chain to the Syracuse twin. |
| 4.1 | 47 | 6 | Traced the creditor, goldsmith, officer and Ephesian Antipholus separately through the arrests. “Svare for gælden” supports the next speaker’s misunderstanding. The Ephesian Dromio buys rope. The Syracuse Dromio reports about a ship and receives a key. The desk has a textile cover. |
| 4.2 | 39 | 5 | Corrected the mythological underworld and distinguished the creditor from the leather-clad arresting officer. Preserved the bond/chain/clock pivot and the comic reversal of the hours. The money is fetched from the desk. |
| 4.3 | 32 | 5 | Checked old Adam, the prodigal’s calf, bass viol, arrest/rest, the two named ships and gold angels. The courtesan asks for a forty-ducat ring or the chain. The cookery proverb calls for a long spoon. |
| 4.4 | 99 | 10 | Repaired the rope’s “end,” including the Latin and the parrot’s line. The Ephesian Antipholus uses the rope; Pinch and his assistants bind the Ephesian pair. It is the Syracuse pair who next enter with a drawn blade. Adriana says her husband never received the chain. |
| 5.1 | 160 | 17 | Clarified sword drawing, sanctuary, Pinch’s beard and haircut, and the Duke's wartime rescue. Adriana sees two husbands. The two rescuing groups in Emilia’s account remain distinct. Kept the source’s differing spans of years, the birthing metaphor and the final exit hand in hand. |

¹ Direction-bearing paragraphs include within-cues embedded at the beginning of a line of dialogue.

## English decisions and native review points

- In 1.1, “nature” is read as affection for family. The counterfactual about Egeon’s marriage now allows for happiness with his wife if fortune had favoured them. The object that splits on the rock is the spare mast keeping the family afloat.
- In 2.1, the crosswise split makes the following blessing intelligible. The jewel passage is textually difficult. The proposal reads the chain as the token Adriana would willingly forgo in exchange for fidelity. Native reader to check the transition from gold to honour.
- In 2.2, Adriana calls her husband’s estrangement the wrong she suffers. The previous English had her imply that she herself had wronged him. In 3.2, Dromio distinguishes his being treated as a beast from the woman’s “beastly” claim.
- In 4.2, Tartarus, debt and a chain govern the arrest speech. In 4.3, “spoon-meat” means food eaten with a spoon. In 4.4, withholding the purse is the accusation, and failure to receive the chain is Adriana's understanding. The changes retain the contradictory claims that drive the action.
- In 5.1, “bestrid” means standing over a fallen comrade in battle to protect him. “Harlots” in the insult can designate male rogues. The officer defending the Duke did not ride alongside him in this account. The Duke’s invitation concerns the family’s shared day of mistakes, and the final question concerns joining the gathering, rather than watching an actual baptism.
- For a read-aloud pass, try the beat of “koben” in 3.1 and Nell/ell in 3.2. Shakespeare’s “hair/heir” in 3.2 compresses a French succession joke into one sound. “Arvekrig ... hårgrænsen” distributes the two meanings across the line. The English “dam/damn/light” cascade in 4.3 loses its first sound match in Danish; the draft retains the mother, oath, light and fire. These are adaptations for the reviewer to hear in context.
- The two exclamations about a thousand pounds a year and a rope in 4.1 admit different readings. The Danish keeps the abrupt juxtaposition. The English wording remains the supplied reading. The text’s five, seven, twenty and thirty-three years remain as the speakers give them. The reader may assess whether “barselsgilde” and the Duke offering to stand godfather carry enough of the mock second birth.

## Persongalleri til læsningen

**I Efesos** møder vi hertug Solinus, købmanden Antipholus og hans tjener Dromio. Adriana er gift med Antipholus. Luciana er hendes søster, og Luce er i huset hos dem. Angelo er guldsmed. Balthasar er købmand. Desuden optræder en kurtisane, skolemesteren og åndemaneren Pinch, købmænd, betjente, en fangevogter, en bøddel, et bud, tjenestefolk og følge.

**Fra Syrakus** kommer købmanden Egeon, hans søn Antipholus og dennes tjener Dromio. Antipholus og Dromio leder hver især efter en tvillingebror. Emilia, Egeons kone og mor til de to Antipholus-brødre, er abbedisse i Efesos.
