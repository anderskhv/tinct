# Romeo og Juliet · review draft

**For the Danish reviewer.** Read `modern-da.json` for the complete Danish play. `modern-en.json` contains the separately corrected English edition. Both keep the project’s 25 chapter numbers and all 1,062 paragraph positions, including the opening Prologue and the second Chorus at the head of chapter 7. The three `source-*.json` files preserve the inputs from Tinct commit `225979e36743d21502ebbace6c253fbc5ce09bfa`. Native approval belongs to the reviewer. Claude owns any subsequent release.

## What was checked

The full project Shakespeare text was matched, in order, against the dramatic text of the [Project Gutenberg edition, ebook 1513](https://www.gutenberg.org/ebooks/1513). The independent copy in this folder includes its original line breaks and its notice. `witness-concordance.tsv` indexes every project paragraph to lines in that copy. After case, punctuation and line-break normalization, 26,334 of the 26,383 project tokens matched in order. The differences were scene headings, speaker labels, the second Chorus entrance, and the placement of an aside. No block of spoken text was missing from the original edition. In the modern editions, several lines had lost their speaker or a significant piece of their sense.

Each source paragraph was aligned with both target paragraphs and compared locally using multilingual sentence embeddings. Long speeches were covered in successive windows. `semantic-screen.json` records the three comparisons for each slot. Similarity checks bring anomalies to attention and can miss a fluent mistranslation. The editorial pass concentrated on suspect readings, songs, verse, wordplay, scene continuity, entrances, exits and inline actions. Every stage-direction slot was inspected separately. The draft is a revision of the project Danish, with the existing names Juliet, Lady Capulet and broder Lorenzo. The native reviewer has the final read for speech rhythm, social register and literary choices throughout.

## Scene notes

| Chapter | Scene | Checks and decisions |
|---|---|---|
| 1 | Prologue | Restored the 14-line shape, the lovers’ hostile stars, the citizens’ blood, the parents’ feud, and the two-hour address to the audience. |
| 2 | I.1 | Coal carriers, angry heat and the noose lead into the wall-side joke and the sexual threat. Restored the language of flesh and dried fish. The prince leaves with his party. The citizens and servants follow in a separate cue, instead of being called out by a prince who has already left. |
| 3 | I.2 | The illiterate servant swaps tools between the trades. The remedy for a bruised shin is a plantain leaf, Danish *vejbred*. The women at Capulet’s party light up the dark sky. Benvolio predicts that Rosaline will lose the comparison. |
| 4 | I.3 | Retained the weaning story, the lost Susan and the husband’s recurring joke. Restored the wormwood and the cockerel’s testicle, the book’s binding and margins, and the Nurse’s joke about women growing larger. |
| 5 | I.4 | The torchbearers enter with the maskers. Mercutio visibly puts on his mask. The light-hearted dancers, soles and soul, lying dreamers, Mab’s carriage, tithe-pig and double-edged lesson in bearing children all have corresponding Danish imagery. |
| 6 | I.5 | Restored Capulet’s missing reminiscence about whispering to a lady at a masked ball. The dialogue in which Romeo and Juliet meet forms a shared 14-line sonnet up to the answer to his prayer. Their next exchange carries the sin from his lips to hers. |
| 7 | II, Chorus and II.1 | Restored the Chorus entrance and 14 lines. Passion gives strength and time gives opportunity. The medlar-tree joke names the fruit’s obscene nickname and the pear that answers it. |
| 8 | II.2 | *Wherefore* asks why Romeo has that name. The window, orchard wall, offstage Nurse and returns above are retained. The Nurse now owns both interrupted calls. Juliet’s words resume across those interruptions. |
| 9 | II.3 | The flower bears medicine and poison. The friar distinguishes infatuation from love. Romeo answers that Juliet loves him back. |
| 10 | II.4 | Restored counterfeiting and slipping away, the shoe and worn sole, the upright hand of the dial, the Nurse’s malapropism, bawd, hare and *hoar/whore*. The hare song is printed as verse before Mercutio returns to prose. The afternoon confession, the cords and the R in Romeo and rosemary remain in the scene. |
| 11 | II.5 | Juliet sends the Nurse’s attendant Peter away. The joke depends on a woman who claims to be out of breath but goes on talking. The meeting is at Lorenzo’s cell. |
| 12 | II.6 | The friar’s warning keeps gunpowder, fire, the kiss that consumes them, and the too-sweet honey. He leads both lovers away for the marriage. |
| 13 | III.1 | Restored fee simple, the accusation of keeping musical company, the two distinct sword draws, the repeated curse of plague, and Mercutio’s *grave man* as *gravalvorlig*. Lady Capulet calls Tybalt her brother’s child. |
| 14 | III.2 | Juliet stakes both lovers’ virginity in her imagined game. Her *ay/I/eye* panic becomes *ja/jeg/øjne*. A tongue that only says Romeo’s name already speaks wonderfully. The Nurse’s first death report remains ambiguous. |
| 15 | III.3 | Repeated knocks come from outside the cell. The offstage visitor is the Nurse. The desperate sword draw and the plan for departure before the watch are retained. |
| 16 | III.4 | Capulet starts to promise Wednesday, interrupts himself to ask the day and settles on Thursday. The Danish follows his interruption and Lady Capulet’s promise to speak to Juliet in the morning. |
| 17 | III.5 | Restored the gallery over the garden and Lady Capulet’s offstage call. Kept nightingale and lark distinct. Juliet’s words about seeing Romeo dead must still allow two meanings when spoken. |
| 18 | IV.1 | Paris believes company may ease Juliet’s tears. The friar speaks his first thought aside and then addresses Paris. The false death lasts 42 hours. |
| 19 | IV.2 | The finger-licking test precedes Juliet’s ostensible obedience. Capulet advances the actual wedding to tomorrow morning. |
| 20 | IV.3 | Juliet requests solitude, keeps her dagger as a last resort, imagines the noises and smells of the vault, drinks to Romeo, and throws herself on the bed. The drinking is conveyed in speech in this witness. |
| 21 | IV.4 | The kitchen prepares meat pies. Capulet’s nocturnal past is sexual teasing, hence his wife’s jealous vigilance. The servant with a head for finding logs becomes a *træhoved*. The music precedes the Nurse’s return. |
| 22 | IV.5 | Juliet is already on the bed before the Nurse enters. Death acts as groom and heir. The Nurse and the musician play on *case*. Peter asks for a merry lament, threatens musical notes, and quotes the song interrupted at *silver sound*, which he then finishes. The musicians’ personal names are retained. |
| 23 | V.1 | The apothecary sells under pressure of poverty. Romeo pays his poverty, calls gold the more dangerous poison, and takes the mixture with him to the tomb. |
| 24 | V.2 | Restored the barefoot friar. The plague quarantine prevents delivery. John returns with the actual letter. Juliet is a *levende lig*, and Lorenzo must go to the tomb alone. |
| 25 | V.3 | Paris’s page has the flowers and torch. Romeo dies before Lorenzo’s entrance. The First Watch speaks offstage, the Third Watch brings in Lorenzo, and Balthasar is alive to testify. The dead person named in the watchman’s report is Romeo. Restored the morning delivery instruction, the offered hand, gold statues and closing verse. |

## Native read

- Read the opening coal jokes and the successive *hjerte/smerte*, *hare/hore*, *gravalvorlig* and *ja/jeg/øjne* choices out loud. The Danish substitutes audible associations in places where the English sounds cannot all be carried across. The hare song makes the obscene reading audible. Check how sharply Mercutio should direct it at the Nurse.
- The two choruses and the long shared exchange of pilgrims and saints have verse lines. They use modern phrasing and do not consistently rhyme or scan in strict pentameter. Read both voices together before setting the final rhythm.
- At IV.5, try Peter’s two halves of the song together, then try the interruption in between. The trade and instrument associations in *Catling*, *Rebeck* and *Soundpost* remain in the English names. A production might decide to use Danish comic names.
- Read Juliet’s III.5 reply about seeing Romeo “dead” twice, once as heard by her mother and once as meant by Juliet. A performer’s pause is part of the double meaning.

Exact Danish and English before/after passages are in `edits.json`. Chapter totals, source pins and checksums are in `verification.json`. The [Folger II.4 edition](https://www.folger.edu/explore/shakespeares-works/romeo-and-juliet/read/2/4/) is a second reference for Mercutio’s encounter with the Nurse.
