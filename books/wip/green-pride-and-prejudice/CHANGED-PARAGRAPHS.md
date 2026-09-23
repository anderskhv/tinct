# Changed paragraphs: Pride and Prejudice, modern-en

223 of 2060 paragraphs differ from the live baseline (`baseline-live-modern-en.json`, sha256 `d914bb2dc33dfb525d7c21b142cc1ae4ea85dcfdd84378c2a839c90d90c250e1`).

Coordinates are `chapter.paragraphIndex`, with the paragraph index 0-based. Hashes are the first 16 hex characters of the sha256 of the paragraph text. Each paragraph lists every edit applied to it in the order of the rounds. Later entries can refine earlier ones, and the final text is what `candidate.json` holds.

Round key: round0 = lead opening fix; round1 = source-based fidelity review; round2 = candidate-only accessibility review, re-verification defects and consistency edits; round3 = re-verification of round 2; round4 = final changed-paragraph verification.

## 1.0  `f6d803861c743ece` → `fcbb3f77de111b26`
- [round0/irony/meaning] “that a single man with a large fortune must be looking for a wife.” → “that a single man in possession of a good fortune must be in need of a wife.”: Source: 'must be in want of a wife'. 'In want of' means lacking/needing, not actively seeking. The irony is that the neighbourhood's 'truth' projects its own wish (a husband for its daughters) onto the man, who need not be seeking anything; paragraph 1 ('rightful property of some one or other of their daughters') pays this off. 'Looking for' made the man the seeker and flattened the joke. 'In need of' restores the meaning without explaining it. 'In possession of a good fortune' is restored verbatim: it is clear today, keeps the famous cadence, and 'good fortune' keeps its double sense (wealth / luck) that 'a large fortune' lost.

## 2.8  `23e0805fd8001fa7` → `56f7628da6c18b6f`
- [round2/accessibility] “"Kitty has no sense of timing with her coughs," said her father.” → “"Kitty has no discretion in her coughs," said her father.”: The second sentence merely repeats the first, so Mr. Bennet's quip goes flat and reads like two drafts stitched together. (Lead: Restores the source's 'discretion', removing the doubled joke)

## 3.3  `84df7a74edad9061` → `257541118249dbf2`
- [round1/omission] “could not accept their kind invitation.” → “could not accept the honor of their invitation, and so on.”: Austen's 'etc.' mocks the formulaic note of regret by cutting it short; 'kind invitation' drops the joke and the formula ('the honour of').

## 3.5  `fa284a5da6f5b2c3` → `8ed14fc7a21e2819`
- [round1/irony] “from being considered the most forbidding, disagreeable man present, and utterly unworthy” → “from having a most forbidding, disagreeable face and being utterly unworthy”: The irony is that the man just judged handsomer than Bingley suddenly acquires a forbidding face once his manners offend; the candidate turns 'countenance' into a general judgment of the man and inflates 'a most' into a superlative ('the most ... present'). (Lead: Defect accepted; span widened so the following clause stays grammatical ("having ... face and being ... unworthy").)

## 3.13  `d857edeefc45cc31` → `8ce71da6ee9b1a3c`
- [round1/omission] “She is passable” → “She is tolerable”: Set-up/pay-off: Charlotte quotes the word back in 5.8 ('to be only just _tolerable_'), and the candidate keeps 'tolerable' there, so Darcy must say it here; 'passable' breaks the famous echo.

## 4.4  `91487873c81605ef` → `6b81b0d56ccb54ce`
- [round1/qualification] “many a more foolish man” → “many a stupider person”: Elizabeth's joke is about Jane liking everyone (continued in 4.6 'people in general'); narrowing 'person' to 'man' implies romantic attachments to previous men.

## 4.10  `974d4186c5305461` → `37333fe458aaf87f`
- [round1/qualification] “had not been designed to please anyone in particular” → “had not been calculated to please people in general”: 'Not calculated to please in general' means their conduct was not such as would please most people; 'anyone in particular' reverses the scope and makes it sound as if they were pleasant generally.
- [round1/irony] “They therefore felt entitled, in every respect, to think” → “They were therefore, in every respect, entitled to think”: Austen's narrator ironically asserts, in mock-logical form, that expensive schooling, fortune and overspending 'entitled' them to contempt; 'felt entitled' flattens the irony into a plain report of their attitude.

## 4.11  `f810ea93a3e592d2` → `670dffc0fb8b6350`
- [round1/qualification] “the freedom to enjoy a gentleman's life” → “the hunting and shooting rights of a manor”: 'The liberty of a manor' is the right to hunt and shoot over its land, the main amenity of owning an estate; the vague gloss loses why renting Netherfield might make buying an estate seem unnecessary. (Lead: Defect accepted; "sporting rights" could be misread today, so the rights are named.)
- [round2/accessibility] “many who knew his easygoing nature doubted whether he might not spend the rest of his days at Netherfield” → “many who knew his easygoing nature suspected he might spend the rest of his days at Netherfield”: 'Doubted whether he might not' is an old double-negative construction. Modern readers are likely to take it the wrong way, as though people doubted he would stay, when the meaning is that they suspected he would. (Lead: Old construction meant they suspected he would stay; the fix keeps the meaning)

## 5.0  `602ce1b3fecac57c` → `bc4477337a802a1a`
- [round2/accessibility] “By nature harmless, friendly, and obliging, his presentation at the royal court had made him courteous.” → “Harmless, friendly, and obliging by nature, he had been made courteous by his presentation at the royal court.”: This is a dangling modifier: grammatically it is his 'presentation' that is harmless, friendly and obliging. Readers can recover the meaning, but the sentence trips them. (Lead: Dangling modifier fixed; same meaning)

## 6.1  `dd327d88819aca60` → `50fa48ed7b355a3c`
- [round1/qualification] “have the courage to truly fall in love” → “have heart enough to truly fall in love”: 'Heart enough' is chiefly about depth of feeling (few love strongly enough to persist unencouraged), not bravery; 'courage' narrows it to one reading that the source doesn't commit to.

## 6.8  `1cfec6aa58e852c2` → `954a3c492cf3b0a2`
- [round1/obstruction] “they both prefer Vingt-un to Commerce” → “they both prefer the card game Vingt-un to Commerce”: Modern readers won't recognize the two names as card games, and the joke depends on it; a two-word in-line gloss is enough.

## 6.9  `c9539a657eaa280f` → `00b3b20bad93faf4`
- [round1/qualification] “their share of misery” → “their share of irritation”: Charlotte's cynicism is cool understatement: 'vexation' means annoyance, not misery. The inflation makes her view of marriage bleaker than the source.

## 6.15  `220be7e180d3f3e1` → `ad4b7eed67d1c516`
- [round1/tone] “if I don't take the offensive first” → “if I don't begin by being impertinent myself”: Elizabeth plans playful cheek, not aggression. 'Impertinent' is still clear today and is a key word for her manner that comes back later in the novel (Darcy admiring her 'impertinence').

## 6.21  `aa2d3b99aaf16b1d` → `f4bd0ed6a9c0f93f`
- [round2/accessibility] “save mine to power my song” → “save mine to swell my song”: 'Power' is a mechanical, modern-sounding verb, and it muddies the joke on the proverb about saving breath. (Lead: Restores the source's verb 'swell')

## 6.35  `1596bf74d19abd9d` → `4e4db6f4eb8f758c`
- [round1/qualification] “as I am fond of good company” → “as I am fond of superior society”: Sir William's 'superior society' is about rank, and it is the point of his social climbing next to Darcy; 'good company' just means pleasant companions.

## 7.0  `573c33b3da3980f2` → `24558a325cb888f9`
- [round1/obstruction] “was entailed—in the absence of male heirs—to a distant relation” → “was entailed—legally bound to pass, in the absence of male heirs, to a distant relation”: This is the reader's first meeting with the entail, which drives the plot; most modern readers don't know the term, and a short in-line gloss removes the obstacle.

## 8.0  `8e053a58c4cf479f` → `a2e9facc4cfa150d`
- [round1/irony] “brought back all of Elizabeth's original dislike” → “let Elizabeth enjoy all her original dislike once more”: The ironic 'enjoyment' of dislike (Elizabeth relishing her justified prejudice) is dropped, leaving flat narration.

## 8.15  `f906ddef9bad4156` → `59c342b596edecd0`
- [round2/accessibility] “they have another one who lives somewhere near Cheapside” → “they have another one who lives somewhere near Cheapside, in the merchants' part of London”: The sneer rests on knowing that Cheapside was an unfashionable commercial district of London, full of merchants and trade. Without that, the sisters' laughter in the next line makes no sense. (Lead: Short gloss; the sneer depends on it)

## 8.42  `2a757c212e36ddd8` → `83161a3e5d5fe761`
- [round1/qualification] “as they all seem to be” → “as they all are”: Added hedge: Bingley flatly asserts they all are accomplished, which is what provokes Caroline's 'All young ladies accomplished!' and his 'Yes, all of them, I think.'

## 8.58  `3446177a414b60a4` → `b3d72d6b1f6f93b2`
- [round2/accessibility] “recommended sending an express to London” → “recommended sending an urgent messenger to London”: Few readers will know 'an express' as an urgent courier or messenger, so the noun reads as though it is missing something. (Lead: 'Express' glossed as an urgent messenger)

## 9.0  `2a2b894be7306fa5` → `632653727d854e2d`
- [round2/accessibility] “the two elegant ladies who attended his sisters” → “the two elegant ladies who waited on his sisters”: These are the sisters' ladies' maids, but 'elegant ladies who attended his sisters' can be read as companions or guests, which is confusing because no such guests exist. (Lead: Keeps Austen's joke (the maids called 'elegant ladies'); the source's 'waited on' makes clear they are servants)

## 9.1  `72ed267565781c7a` → `b14a351845ff6c9a`
- [round2/accessibility] “After sitting a while with Jane, on Miss Bingley's appearance and invitation, the mother and three daughters all followed her into the breakfast room.” → “After they had sat a while with Jane, Miss Bingley appeared and invited them down, and the mother and three daughters all followed her into the breakfast room.”: The sentence is overloaded and 'her' is unclear: it could be Jane, who is ill in bed, or Miss Bingley. The word order also makes the invitation hard to parse. (Lead: Referent clarified; same sequence as the source)

## 9.28  `39354439fc3e6814` → `ec46710843e575f0`
- [round1/omission] “she was needed for the baking” → “she was needed to help with the mince pies”: Drops the concrete detail that makes Mrs. Bennet's jab specific (Charlotte doing kitchen work, set against 'I always keep servants').

## 9.35  `0c299a553f718778` → `4595567886a64826`
- [round1/tone] “a sturdy, well-developed girl of fifteen” → “a sturdy, well-grown girl of fifteen”: 'Well-grown' refers to her size and height (she is 'the tallest', 2.25); 'well-developed' adds a modern sexualized implication that the source doesn't have.

## 10.14  `02debf6592e6faa5` → `091863cf4bf82ce6`
- [round1/tone] “I am absolutely in love with her beautiful little design” → “I am quite in raptures over her beautiful little design”: Darcy's reply in 10.15 ('save your raptures') picks up her word; with 'absolutely in love' the set-up for his dry retort is lost.

## 10.45  `11d7286f09b42c48` → `47630443df806d5c`
- [round1/qualification] “object of admiration to such a man” → “object of admiration to so great a man”: 'great' (his rank and consequence) is the point of her disbelief; 'such a man' drops it and reads as distaste.

## 10.52  `9f52377cce4174cf` → `e5efd0a22ae46564`
- [round1/irony] “was considerably helped along by her desire” → “received some assistance from her desire”: Austen's ironic understatement ('some assistance') is inflated to 'considerably helped along', blunting the joke.

## 11.6  `3b954e4847f0eadf` → `9b7ba972cd4d8323`
- [round1/omission] “as soon as the cook has made enough white soup” → “as soon as Nicholls has made enough white soup”: Named servant (Nicholls, the Netherfield housekeeper) replaced with an invented generic 'the cook'.
- [round2/accessibility] “as soon as Nicholls has made enough white soup” → “as soon as Nicholls, the housekeeper, has made enough white soup”: Readers are not told who Nicholls is, and 'white soup', a traditional dish served at balls, is unfamiliar. The line is readable, but the reference is lost. (Lead: Identifies Nicholls (Mrs. Nicholls, housekeeper at Netherfield, ch. 53). 'White soup' is left as it is.)

## 11.11  `1f9a55ef0acd8e2d` → `aedb7526acb24c86`
- [round2/accessibility] “What could he mean? She was desperate to know—and asked Elizabeth whether she could make any sense of it.” → “What could he mean? Miss Bingley was desperate to know, and asked Elizabeth whether she could make any sense of it.”: 'She' here is Miss Bingley, but the nearest female antecedent is Elizabeth, the subject earlier in the paragraph, and the sentence then has two different 'she's. (Lead: Referent clarified)

## 11.27  `73037899d773444d` → `f248240622a7eb92`
- [round1/qualification] “It is, I believe, too unforgiving—certainly too much so for the world's liking.” → “It is, I believe, too unyielding—certainly too much so for the world's convenience.”: 'too little yielding' means inflexible, not 'unforgiving'; the candidate pre-empts the resentment he confesses a few sentences later, and 'liking' changes 'convenience'.
- [round1/addition] “every attempt to manipulate them” → “every attempt to move them”: 'move' means emotionally sway; 'manipulate' adds a sinister motive Darcy does not attribute to others.

## 12.0  `b1ef04555e3e432d` → `38e744174ce99ce1`
- [round1/qualification] “Her reply, therefore, was not what Elizabeth had hoped for, though Elizabeth was eager to get home.” → “Her reply, therefore, was not favorable—at least not to Elizabeth's wishes, for she was eager to get home.”: 'though' reverses the causal 'for'; Elizabeth's eagerness to go home is why the answer disappointed her.

## 12.1  `7f64bf2c16fac7a0` → `ed791735ad735671`
- [round2/accessibility] “enough was said about wishing them to stay at least until the next day to work on Jane, so their departure was postponed by a day” → “enough was said about wishing them to stay at least until the next day to persuade Jane, and their departure was put off until then”: This is a tangled chain: 'enough was said ... to work on Jane' is hard to parse, and 'work on' is informal. (Lead: Untangled; 'to work on Jane' becomes 'to persuade Jane' and nothing is added)

## 12.2  `3f4ec852d9f7c289` → `b4846b55ed30d69b`
- [round1/qualification] “when she knew she was right” → “when she felt she was right”: Certainty upgraded: source says she felt herself right, not that she knew it.

## 12.5  `c2961eedb100d11a` → `2cffe85d81a1981e`
- [round1/qualification] “was sure Jane would catch cold again” → “was sure Jane would have caught cold again”: Mrs. Bennet is sure Jane already has caught cold again (her typical alarm), not predicting a future cold.

## 13.7  `b95dd818c3497f71` → `ef611f5994a24f0c`
- [round1/qualification] “I think it is the most unjust thing in the world that your estate should be taken away from your own children.” → “I do think it is the hardest thing in the world that your estate should be entailed away from your own children.”: 'taken away' misstates the legal mechanism (the entail, explained in the next paragraph); 'hardest' is Mrs. Bennet's word, which Mr. Bennet's ironic 'most iniquitous' then escalates.

## 13.11  `1ce3fe9888d32c89` → `fa76e01458a98098`
- [round1/qualification] “some family scruples on that point” → “some scruples as a dutiful son on that point”: 'filial' means as a son toward his father (Collins's worry about disrespect to his father's memory); 'family' loses that.

## 13.14  `ac3211bbcbb1b4a6` → `f65cedb5996a4760`
- [round2/accessibility] “until the following Saturday week” → “until Saturday of the following week”: "Saturday week" (a week from Saturday) is a British/period idiom many readers will not parse; the length of the visit matters later (he leaves on a Saturday). (Lead: 'Saturday week' explained; same date)

## 13.17  `b57cdd9922af5720` → `66c9425fde39d87d`
- [round2/accessibility] “"There is some sense in what he says about the girls, though, and if he is willing to make them some kind of amends, I shall not be the one to discourage him."” → “"There is some sense in what he says about the girls, though," said Mrs. Bennet, "and if he is willing to make them some kind of amends, I shall not be the one to discourage him."”: No speech tag, and it directly follows Mr. Bennet's speech, so it reads as his continuation; it is Mrs. Bennet softening (13.23 confirms). A listener cannot tell the speaker changed. (Lead: Adds only a speaker tag; the source paragraph is Mrs. Bennet's (confirmed by 13.23))

## 13.25  `a72d58d9d6e77090` → `60f3d51692a89d2d`
- [round1/tone] “otherwise they will be left with very little” → “otherwise they will be destitute enough”: Mrs. Bennet's characteristic exaggeration ('destitute') is softened into a measured statement.

## 14.13  `fd65f8ad5e105481` → `a885d434803911cc`
- [round1/qualification] “Lydia's mouth fell open as he opened the volume” → “Lydia yawned as he opened the volume”: In Austen's usage 'gaped' here means yawned (boredom at Fordyce), not astonishment; the candidate reads it as surprise.

## 15.0  `5b7f64da04aef915` → `24d0eb534e1aaec0`
- [round1/qualification] “Mr. Collins was not a clever man” → “Mr. Collins was not a sensible man”: 'sensible' (good sense/judgment) is not 'clever'; it answers Elizabeth's 'Can he be a sensible man, sir?' in 13.20 and Mr. Bennet's reply.
- [round1/qualification] “A fortunate recommendation had brought him” → “A fortunate chance had brought him”: Source attributes his preferment to luck ('chance'); the candidate invents a recommendation, removing the jab.

## 15.10  `b7258b974aed96bb` → `7d57b2f408e607c2`
- [round2/accessibility] “She was eagerly expressing her surprise at their sudden return home—which, since their own carriage had not come for them, she would have known nothing about, had she not happened to see Mr. Jones's shop boy in the street, who told her they were not to send any more medicine to Netherfield because the Miss Bennets had left—when her attention was claimed for Mr. Collins, whom Jane introduced to her.” → “She was eagerly expressing her surprise at their sudden return home. Since their own carriage had not come for them, she would have known nothing about it had she not happened to see Mr. Jones's shop boy in the street, who told her they were not to send any more medicine to Netherfield because the Miss Bennets had left. Then her attention was claimed for Mr. Collins, whom Jane introduced to her.”: The main clause is suspended across a long dash-interruption with a nested conditional and reported speech; readers lose the thread before 'when her attention was claimed'. (Lead: Long sentence split; all content kept)
- [round2/accessibility] “a nice comfortable noisy game of lottery tickets” → “a nice comfortable noisy card game of lottery tickets”: 'Lottery tickets' here is a card game, not actual lottery tickets; readers will picture a raffle. It recurs in 16.7 and 16.59 (bets, prizes, counters). (Lead: One-word gloss: 'lottery tickets' is a card game)

## 16.1  `1474bb79ea086ee8` → `77daea084e2dd4f4`
- [round1/qualification] “a comparison that did not at first mean much to anyone” → “a comparison that did not at first seem much of a compliment”: The source point is that Mrs. Philips was not at first pleased (her drawing room likened to a small breakfast parlour), not that it meant nothing; this sets up 'she felt all the force of the compliment'.

## 16.2  `b84947c3dce1b84c` → `02d7e0416b1e306f`
- [round2/accessibility] “Elizabeth felt that she had neither been looking at him before nor thinking of him since with the slightest degree of unreasonable admiration” → “Elizabeth felt that none of her admiration for him, at their first meeting or in thinking of him since, had been unreasonable”: The double negative with 'unreasonable' is hard to parse and easily read as her admiring him not at all. The intended sense is that her high opinion of him was fully justified. (Lead: Clarified double negative; the source's sense (none of her admiration was unreasonable) is kept)

## 16.15  `34226dfca0362fe8` → `a68c5f2da181728b`
- [round2/accessibility] “"I cannot pretend to be sorry," said Wickham after a brief pause, "that he or any man should not be valued beyond what he deserves. But with _him_ I believe it rarely happens.” → “"I cannot pretend to be sorry," said Wickham after a brief pause, "when any man is valued no higher than he deserves. But with _him_ I believe that rarely happens.”: Negative-within-negative ('cannot ... sorry ... not be valued beyond') and an unclear 'it' make readers re-read to work out that 'it' means Darcy being judged at his true worth. (Lead: Nested negative untangled; same sense as the source ('should not be estimated beyond their deserts'))
- [round3/reverify-defect] “when any man is valued no higher than he deserves” → “when he or any man is valued no higher than he deserves”: Dropped the source's pointed 'he or' ("that he or that any man should not be estimated beyond their deserts"). Wickham's jab at Darcy comes before the general point; the candidate keeps only the general point.

## 16.20  `ee33cb9a83eaeea7` → `46ceae85edbb795f`
- [round1/qualification] “rather than his betrayal of his father's wishes and disgrace to his father's memory” → “rather than his disappointing his father's hopes and disgracing his memory”: 'betrayal of his father's wishes' intensifies 'disappointing the hopes'.
- [round4/final-verify-defect] “disappointing his father's hopes and disgracing his memory” → “disappointing the hopes and disgracing the memory of his father”: Final verifier 1: 'his memory' could read as Darcy's own; Austen's own construction restores the clear referent.

## 16.25  `1dbbde7827b1fccd` → `0615ca65875f4004`
- [round2/accessibility] “the late Mr. Darcy left me the next appointment to the best parish in his gift” → “the late Mr. Darcy left me the next appointment to the best parish that was his to give”: 'In his gift' (a parish whose clergyman he had the right to appoint) is a period term, and the whole grievance depends on understanding it. (Lead: 'In his gift' glossed in plain words)

## 16.32  `1d43deb53bc01dc1` → `2c61f5815f34126d`
- [round1/qualification] “a dislike that I can only attribute in part to jealousy” → “a dislike that I cannot help attributing in part to jealousy”: 'can only attribute in part' reads as limiting (only partly jealousy); the source means he cannot help ascribing it partly to jealousy.

## 16.36  `94d201162a55f3d3` → `092855ceea36841b`
- [round1/qualification] “whose very face is proof of being good” → “whose very face might vouch for your good nature”: Hedge 'may vouch' turned into flat 'is proof'; the modal is part of the irony of Elizabeth judging by looks.

## 16.39  `d5d14c55cebb6e5a` → `a3395d4278c9120a`
- [round1/irony] “pride has often been his best quality” → “pride has often been his best friend”: 'best friend' is Wickham's barbed idiom (pride has served him); 'best quality' turns it into a sincere compliment.

## 16.55  `375b11d4641c44a4` → `74c7e03cd0a62387`
- [round1/addition] “it is widely believed” → “it is believed”: 'widely' adds a degree of public certainty to Wickham's report that the source does not claim.

## 16.56  `3a0dc003672e5a67` → `8e434c4343d7d5a3`
- [round1/qualification] “if he was already destined for another” → “if he had already destined himself for another”: 'self-destined' = Darcy's own choice; 'destined for' makes it an external arrangement.
- [round2/accessibility] “useless her affection for his sister and her praise of himself—if he had already destined himself for another” → “useless her affection for Darcy's sister and her praise of Darcy himself—if he had already destined himself for another”: The only man named in the sentence is implied by 'Miss Bingley', so 'his sister' and 'he' can be taken as Bingley; they mean Darcy. (Lead: Referent made explicit (Darcy); matches the source)

## 16.58  `5a233fc6041d818d` → `0b7ef9cd8bfbde08`
- [round1/qualification] “should be considered first-rate” → “should have a first-rate mind”: 'understanding' (intellect) is the point: Lady Catherine's reputation for cleverness; 'considered first-rate' is too general.

## 16.59  `3b8e4649492bbf95` → `9d0d370fc823d162`
- [round1/qualification] “about the money she had lost and won” → “about the counters she had lost and won”: The 'fish' were game counters, not money; 'money' is a factual change.

## 17.0  `89e242c760b53f20` → `4ec6fb833f52f532`
- [round1/tone] “he had really suffered such cruelty” → “he had really endured such unkindness”: 'cruelty' inflates Jane's gentle 'unkindness', out of keeping with her character.

## 18.13  `c58ee2a9ff0528a4` → `5e109fe8db51884f`
- [round1/qualification] “"Are you speaking for your own feelings in this case” → “"Are you consulting your own feelings in this case”: 'Consulting your own feelings' means serving your own preference (for saying little); 'speaking for your own feelings' reads as expressing them, which blurs Darcy's counter-jab. (Lead: Defect accepted; the source verb "consulting" is clear today and more exact than "considering".)

## 18.49  `30615c58670afd16` → `3e8e5126bfcb1916`
- [round2/accessibility] “is perfectly convinced that Mr. Wickham has deserved much less attention from Mr. Darcy than he has received” → “is perfectly convinced that Mr. Wickham has received far more kindness from Mr. Darcy than he deserved”: Modern readers will take 'attention' as Darcy's hostility, reversing the sense; it means kindness or favour Wickham received and did not deserve. (Lead: 'Attention' here means favor; the source's sense is kept)

## 18.58  `7aa4eb286a5862d0` → `30457d806654778c`
- [round1/qualification] “quite well a week ago Saturday” → “quite well a week ago yesterday”: 'Yesterday se'nnight' = a week before yesterday; the candidate invents a specific weekday (Saturday) not in the source.

## 18.62  `83813e756c6e63f4` → `9960a460df4809a2`
- [round1/omission] “that placed them within earshot of each other. She was deeply upset to find that her mother was talking freely and openly to Lady Lucas” → “that placed them with only one person between them. She was deeply upset to find that her mother was talking freely and openly to that very person, Lady Lucas,”: Source seats them with one person between them and says that person is Lady Lucas; the candidate loses the seating detail and the point that Mrs. Bennet's listener sits right beside Elizabeth. (Lead: Defect accepted; "one seat apart" is ambiguous, and the parenthesis reads more smoothly as an appositive.)

## 18.66  `6c3a6684ccdfea8b` → `c481671b64be12bc`
- [round2/accessibility] “for though he was not always looking at her mother, she was sure his attention was invariably fixed on her” → “for though he was not always looking at her mother, she was sure he was always listening to her”: 'Her' at the end can mean Elizabeth or her mother; the point is that he is always listening to her mother. (Lead: Referent clarified; the source says his attention was 'fixed by her' (the mother))

## 18.74  `4cf9057003c2427d` → `2bcae952d1c97034`
- [round1/tone] “"God, I'm so tired!"” → “"Lord, I'm so tired!"”: Source has 'Lord'; 'God' is coarser than Lydia's period exclamation and needlessly changes her register.

## 19.21  `44eb085f73a8cc0c` → `d57ecea284ed3329`
- [round1/omission] “could not be mistaken for the flirtation of a sophisticated woman” → “could not be mistaken for the affectation and flirtation of a sophisticated woman”: 'Affectation' dropped; Elizabeth's point is that her father's refusal could not be read as pretense, which is the heart of her complaint about Collins.

## 20.0  `a61bc1cbf7a553fc` → `9fa93bd532c4eca3`
- [round1/irony] “with the result of which he had every reason to be satisfied” → “with the result of which he trusted he had every reason to be satisfied”: Dropping 'he trusted' turns Collins's self-deception into narrator fact; the 'since...' clause must remain his reasoning, not the narrator's.

## 20.29  `5d7c2968b8f3133a` → `331e8b1a25ea177c`
- [round1/omission] “than if we were a hundred miles away” → “than if we were in York”: Mrs. Bennet's named place is replaced with an invented distance; 'York' is clear to a modern reader and keeps her voice.

## 21.2  `d853ebf96c494396` → `40a4e014483eaabc`
- [round1/qualification] “he privately admitted that his absence had been his own decision” → “he volunteered that his absence _had_ been his own decision”: Source stresses that Wickham offered this unasked ('voluntarily'), a detail that matters to his later exposure; 'privately' replaces it, and the source's emphasis on _had_ is lost.

## 21.25  `5cf6b713bdb7e2dd` → `a0ab3a2e8f8e1b38`
- [round1/addition] “the product of Caroline's self-interested scheming” → “the product of Caroline's self-interested wishes”: 'Scheming' adds deliberate plotting not in the source and leaves the next clause's 'those wishes' without an antecedent.

## 22.1  `fbd48c3b6c3edd6b` → `79a973cbbbbbf637`
- [round1/addition] “meet him "accidentally" in the lane” → “meet him accidentally in the lane”: Scare quotes spell out Austen's deadpan irony; the source leaves the reader to catch it.

## 22.2  `d76d9cc4eb168050` → `c7e683f89af7ef2a`
- [round1/irony] “purely from the practical and clear-headed desire for a stable home, did not care how soon that home was secured” → “solely from the pure and disinterested desire for an establishment of her own, did not care how soon that establishment was gained”: 'Pure and disinterested' is ironic (the motive is plainly material); 'practical and clear-headed' turns the irony into sincere praise, and 'stable home' softens 'establishment' (a household and income of one's own).
- [round2/accessibility] “the pure and disinterested desire for an establishment of her own, did not care how soon that establishment was gained” → “the pure and unselfish desire for a home and income of her own, did not care how soon she gained them”: 'Disinterested' is widely read as 'uninterested', and 'establishment' as a business; the irony (she wants a home and security, not love) is lost if either is misread. (Lead: Keeps the irony ('pure and unselfish') and avoids the likely misreadings of 'disinterested' and 'establishment')

## 22.4  `f63ebd709bc67e0a` → `d865b7c0e1239022`
- [round1/qualification] “and however unlikely to bring happiness, it was their best protection against poverty” → “and although it might not bring happiness, it must be their pleasantest protection against poverty”: 'Uncertain' becomes 'unlikely' (Charlotte's view hardened into pessimism) and 'pleasantest' becomes 'best', losing Austen's wry calibration. (Lead: Defect accepted; the proposed "uncertain to bring" is unidiomatic. "Might not" keeps the source's uncertainty without hardening it into pessimism.)
- [round1/qualification] “but it could hardly be kept” → “but it was not easily kept”: 'Could hardly be kept' implies he failed; the source says he kept it, with difficulty.
- [round2/consistency] “neither clever nor pleasant” → “neither sensible nor agreeable”: Source 'neither sensible nor agreeable'; round 1 restored 'sensible' at 15.0 (the book's key word for judgment), noted by re-verifier 1.

## 22.12  `0eb871b39ac553c5` → `4edbc1601e33b31c`
- [round2/accessibility] “and though by no means as clever as herself, she thought that if encouraged to read and improve himself by her example” → “and though he was by no means as clever as herself, she thought that if encouraged to read and improve himself by her example”: The opening phrase grammatically attaches to 'she' (Mary), so it reads as Mary being less clever than herself; it means Mr. Collins. (Lead: Dangling phrase attached to Mr. Collins, as in the source)

## 23.3  `3e21d8f3a4c61c90` → `b8493db1eb19a2d8`
- [round1/qualification] “the happiness the match would bring” → “the happiness that might be expected from the match”: Elizabeth's polite remarks are hedged ('might be expected'); the candidate makes her assert happiness outright, which contradicts her private conviction in 22.19.

## 23.15  `a48a9ce785cb079b` → `2720ed4bfed0a411`
- [round2/accessibility] “Whenever Charlotte came to visit, she assumed she was counting the hours until she took possession.” → “Whenever Charlotte came to visit, Mrs. Bennet assumed she was counting the hours until she took possession.”: Three 'she's in one sentence refer to Mrs. Bennet, then Charlotte, then Charlotte; readers have to sort them out. (Lead: Referent made explicit; matches the source ('she concluded her to be anticipating'))

## 24.2  `04dcb1cd96936eac` → `ff9c75e93a0d3463`
- [round2/accessibility] “She could think of nothing else—and yet whether Bingley's feelings had truly faded, or were being suppressed by his friends' interference, whether he had known of Jane's attachment or it had escaped his notice—whichever was the case, though her opinion of him would be greatly affected by which it was, her sister's situation was the same, her peace equally damaged.” → “She could think of nothing else. Yet whether Bingley's feelings had truly faded or were being suppressed by his friends, and whether he had known of Jane's attachment or not, her sister's situation was the same, her peace equally damaged—however much the answer would affect her own opinion of him.”: Stacked alternatives, a dash, a resumptive 'whichever', and an embedded concession before the main clause; 'and yet' also sets up a contrast that does not come. (Lead: Untangled; all the alternatives and the concession are kept)

## 24.14  `a538f02c446007fa` → `ce0df33ccba6d4e0`
- [round1/attribution] “men make sure that it should” → “men make sure that they do”: Source 'they' = women (men ensure women fancy admiration means more). Candidate's 'it' makes men responsible for admiration itself meaning more, blurring Elizabeth's retort.

## 24.22  `acfcadbe39c0fb4d` → `790be894eca69340`
- [round1/qualification] “and social standing.” → “and pride.”: Elizabeth's pointed word is 'pride' (a barb at the Bingley/Darcy set and a key thematic term); 'social standing' duplicates 'connections' and loses the jab.

## 24.23  `5f725d2513c1bd17` → `b05eb8c40e9a0903`
- [round2/accessibility] “I am not ashamed of having been mistaken—or at least, it is slight” → “I am not ashamed of having been mistaken—or if I am, it is slight”: 'It' has no antecedent (the shame was just denied), so the self-correction does not parse. (Lead: Jane's self-correction made to parse; the source's anacoluthon is kept in spirit)

## 26.29  `15a90e448e4c34d9` → `c4c28458c4df30c2`
- [round1/omission] “just like everyone else” → “just as plain ones do”: The joke rests on the handsome/plain contrast; 'everyone else' drops it.

## 27.22  `046c49cc51f7e01a` → `efe0b198ca6e2aff`
- [round1/qualification] “_our_ first impressions” → “_our_ first outpourings”: 'Effusions' are the gushing accounts travellers pour out on return (the subject of the whole speech); 'impressions' are private perceptions and cannot be 'unbearable' to listeners.

## 28.6  `951ebfe2367bc26f` → `c67f42e00648ffa6`
- [round1/irony] “all friendliness and graciousness” → “all friendliness and gracious condescension”: Collins's catchphrase 'affability and condescension' (rendered 'friendliness and gracious condescension' in ch. 14) is the ironic keyword the narrator echoes in ch. 29; dropping 'condescension' flattens his voice and the running joke.

## 29.9  `f036074f959b03cf` → `7e7ae3899fd827f6`
- [round1/irony] “Her Ladyship rose graciously to receive them.” → “Her Ladyship, with great condescension, rose to receive them.”: Narrator ironically borrows Collins's word; 'graciously' turns it into sincere narrator praise. The candidate keeps 'condescension' in 29.0, so this also restores consistency.

## 29.14  `cc6506c7f547bf2d` → `d410fbe29427bd9e`
- [round1/qualification] “about whom she knew the least” → “whose connections she knew least about”: Lady Catherine's interest is specifically in Elizabeth's family and social connections (which her questions then probe); 'about whom' loses that social implication.

## 29.37  `1cce68b656a835b3` → `81f5617304d0b1d2`
- [round2/accessibility] “Elizabeth suspected she was the first person who had ever dared to trifle with such grand impertinence.” → “Elizabeth suspected she was the first person who had ever dared to trifle with so much dignified rudeness.”: 'Such grand impertinence' reads as if Elizabeth is the impertinent one; the point is that Lady Catherine's own lofty rudeness has never been teased before. (Lead: Source 'dignified impertinence'; the rudeness is clearly Lady Catherine's)
- [round3/reverify-defect] “so much dignified rudeness” → “so much dignified impertinence”: Source reads 'dignified impertinence'. 'Impertinence' (intrusive questioning, usually a fault of inferiors) is the ironic point when it is turned on Lady Catherine. 'Rudeness' flattens this. The change 'grand' -> 'dignified' is good, so keep it.

## 29.40  `5835cf63f483a534` → `aebd9a651542acb2`
- [round2/accessibility] “Lady Catherine, Sir William, and Mr. and Mrs. Collins sat down to quadrille. Since Miss de Bourgh chose to play casino,” → “Lady Catherine, Sir William, and Mr. and Mrs. Collins sat down to the card game quadrille. Since Miss de Bourgh chose to play casino, another card game,”: Quadrille and casino are period card games; 'play casino' in particular now suggests gambling at a casino. (Lead: Brief glosses; 'casino' would otherwise suggest a gambling house)

## 30.2  `f9755f1c41f6399a` → `47c950eb9c958e1e`
- [round1/qualification] “other parish appointments to be gained” → “that the family might have other church posts to hand out”: 'Family livings' are clergy posts in the de Bourgh family's gift; the irony is that the Collinses court Lady Catherine for her patronage. 'Parish appointments to be gained' drops who controls them. (Lead: Accept the defect (who controls the livings). Shorter wording in the edition's plain style; avoids the period phrase "in the family's gift".)
- [round2/reverify-defect] “that there might be that the family might have other church posts to hand out” → “that Lady Catherine's family might have other church posts to hand out”: Botched splice: 'that there might be that the family might have' duplicates the clause and is ungrammatical. Source: 'there might be other family livings to be disposed of' (livings in the gift of Lady Catherine's family). Fix names the referent so 'the family' is not ambiguous.

## 30.5  `3297a64b51a7d285` → `9c662ebe2a329ff0`
- [round2/accessibility] “And though there were not many of her acquaintances she did not prefer to him,” → “And though she preferred most of her acquaintances to him,”: Stacked negatives ('not many ... she did not prefer') make readers stop to work out that she dislikes him. (Lead: Stacked negative resolved; the source means she preferred most of them)
- [round3/reverify-defect] “she preferred most of her acquaintances to him” → “she preferred nearly all of her acquaintances to him”: Source: 'there were not many of her acquaintance whom she did not prefer' means she preferred nearly all of them to him. 'Most' understates this.

## 30.7  `4e6144d1960d4282` → `6e3f093880d74d8e`
- [round2/accessibility] “There were two nephews of Lady Catherine requiring them,” → “There were two nephews of Lady Catherine to whom he owed his respects,”: 'Them' refers back to 'his respects' in the previous sentence, which is too far away and too abstract; the clause reads as if the nephews need something. (Lead: Referent clarified; the source says 'to require them' (his respects))

## 31.2  `36f462b89cbb25de` → `7efd82b5add07bd9`
- [round2/accessibility] “_His_ eyes had been quickly and repeatedly turned toward them with a look of curiosity, and that her Ladyship eventually shared the feeling was more openly shown, for she did not hesitate to call out:” → “_His_ eyes had quickly and repeatedly turned toward them with a look of curiosity, and her Ladyship soon showed the same curiosity more openly, for she did not hesitate to call out:”: A 'that'-clause as subject ('that her Ladyship ... shared the feeling was more openly shown') has to be re-read. (Lead: Subject clause untangled; same content)
- [round3/reverify-defect] “and her Ladyship soon showed the same curiosity more openly” → “and her Ladyship, after a while, showed the same curiosity more openly”: Source contrasts Darcy's eyes turning 'soon' with Lady Catherine sharing the curiosity 'after a while'. 'Soon' reverses that timing. The rest of the untangling is good.

## 31.11  `f01340375b40ac16` → `a10881ab701e1664`
- [round1/omission] “the performer's face” → “the lovely performer's face”: 'Fair' is a quiet signal (tinted by Darcy's gaze) of his admiration; dropping it removes a set-up for his proposal.

## 31.12  `6af8da689393e362` → `4f4f653447398bf1`
- [round2/accessibility] “by coming over in such state to listen” → “by coming over with such ceremony to listen”: 'In such state' (meaning with such ceremony or grandeur) is no longer understood and may read as 'in such a state' (agitated). (Lead: 'In such state' means with ceremony)

## 31.28  `062dfb5eae42dd33` → `bb2d93fe23cb53d7`
- [round2/accessibility] “that he might just as easily have married _her_, had she been his relative.” → “that he might just as well have married Miss Bingley, had she been his relative.”: The sentence mentions Miss de Bourgh just before, so '_her_' seems to mean Miss de Bourgh; it actually means Miss Bingley. That reverses the joke. (Lead: Restores the source's order: in the source Miss Bingley is the antecedent of _her_)
- [round3/reverify-defect] “that he might just as well have married Miss Bingley, had she been his relative.” → “that he might have been just as likely to marry _Miss Bingley_, had she been his relative.”: Replacing the pronoun is fine, but it drops the source's emphasis (_her_) and changes 'just as likely to marry' into 'might just as well have married', which reads as 'there'd be no reason not to'. Keep the likelihood sense and the italics.

## 32.23  `b59916c932f2ba3c` → `74ec06f64e223dc4`
- [round1/qualification] “The gentleman seemed to experience some change of feeling” → “The gentleman experienced some change of feeling”: The narrator states the change as fact; the candidate adds a hedge ('seemed to'), weakening the narrator's direct report of Darcy's feeling.

## 33.0  `2e9daa4473c5c64c` → `2aefac049f6b41ba`
- [round1/irony] “It seemed like deliberate bad luck or voluntary penance” → “It seemed like deliberate spite, or a voluntary penance”: 'Ill-nature' means malice, not luck; Elizabeth's joke is that Darcy seems to be doing it on purpose, either to spite her or to punish himself. 'Deliberate bad luck' makes no sense.

## 34.1  `1e995a5bc9860f0c` → `6df10382cbe7316b`
- [round2/accessibility] “Colonel Fitzwilliam had made it clear that he had no intentions at all,” → “Colonel Fitzwilliam had made it clear that he had no intentions toward her at all,”: 'No intentions at all' is too bare now; it means he has no intention of courting or marrying her. (Lead: 'Intentions' in the period's marriage sense, made clear)

## 34.3  `3f7e1a358314c08e` → `141ebe7447176386`
- [round1/tone] “how deeply I admire and love you” → “how ardently I admire and love you”: 'Ardently' is still plain modern English and gives the passion of Darcy's famous declaration; 'deeply' flattens it.

## 34.4  `b2eebe58f07ce044` → `482a5f7686f57e8e`
- [round2/accessibility] “His sense of her inferiority, of it being beneath him,” → “His sense of her inferiority, of such a match being beneath him,”: 'It' has no antecedent (it means the match, or marrying her). (Lead: Referent clarified)

## 34.6  `b0feef03298c93cb` → `a8563a35f99ab389`
- [round1/qualification] “and if I _could_ feel grateful, I would now thank you” → “and if I could _feel_ gratitude, I would now thank you”: Austen stresses _feel_, contrasting actually feeling gratitude with the 'established mode' of expressing it. Moving the stress to _could_ changes the point.

## 34.15  `c4883ae726f8d0ce` → `12525205a352d8e1`
- [round1/irony] “Elizabeth refused to dignify this self-serving remark with a response” → “Elizabeth disdained even to appear to notice this civil remark”: 'Civil reflection' is ironic: the remark is polite in form and insulting in meaning. 'Self-serving' replaces the irony with a flat judgment, and 'refused to dignify it with a response' is a modern cliché. (Lead: Defect accepted; "scorned to show" is an archaic construction, so this keeps the source verb (disdained) in a modern pattern.)

## 34.21  `ca74ceeceb9b4b22` → `e119eeebda05167d`
- [round1/qualification] “But dishonesty of every kind is hateful to me.” → “But disguise of every kind is hateful to me.”: Darcy means concealing his feelings, not lying. 'Disguise' also sets up his admission in the letter (35.4, 'this concealment, this disguise, was beneath me'), and 'dishonesty' breaks that link.

## 34.27  `f9438dca2b39bbee` → `2a0d90d68c165568`
- [round1/qualification] “built such an unshakeable dislike that I had not known you a month before” → “built so unshakeable a dislike; and I had not known you a month before”: The candidate's 'such... that' makes the one-month verdict a result of the later events. In the source these are two separate claims joined by 'and', and within a month comes before the 'succeeding events'.

## 34.29  `d762678a024af60f` → `692b37e437105e1b`
- [round1/attribution] “whose cruel treatment he had not even tried to deny” → “his cruelty toward whom he had not even tried to deny”: 'Whose cruel treatment' can be read as Wickham's cruelty. The source means Darcy's cruelty toward Wickham.

## 35.1  `299f32ede80f4dd0` → `997863805db9542e`
- [round2/accessibility] “But the approaching figure was now close enough to see her, and stepping forward eagerly, called her name.” → “But he was now close enough to see her, and, stepping forward eagerly, he called her name.”: The second clause has no subject. As written, 'the approaching figure' does the calling, which is awkward, and the 'and' clause is missing 'he'. (Lead: Missing subject supplied)

## 35.3  `9636551a51d4b0f8` → `e7bf3c5920dbf74d`
- [round1/tone] “forgive the liberty I take in asking for your attention; your feelings, I know, will give it reluctantly, but I ask it in the name of fairness.” → “forgive the freedom with which I demand your attention; your feelings, I know, will give it reluctantly, but I demand it of your sense of justice.”: Darcy 'demands' twice. Changing this to 'asking' softens his haughty stiffness at the start of the letter, which Elizabeth then reacts to ('his style was not penitent, but haughty').

## 35.4  `8b604866fe2b16c1` → `f5b362c2c0d90d52`
- [round1/addition] “That I _wanted_ to believe her indifferent is certain” → “That I wanted to believe her indifferent is certain”: The emphasis on 'wanted' is not in the source and adds a stress that Darcy's even admission does not have.
- [round1/tone] “though not ideal, was nothing compared” → “though objectionable, was nothing compared”: 'Not ideal' is a modern softener that makes Darcy more tactful than he is. The source says 'objectionable'.
- [round1/qualification] “was hardly the work of a moment” → “took scarcely a moment”: Today 'hardly the work of a moment' reads as 'took real effort', which reverses the meaning. Darcy means that persuading Bingley was almost instant.
- [round1/omission] “Perhaps this concealment was beneath me.” → “Perhaps this concealment, this disguise, was beneath me.”: This drops 'this disguise', Darcy's own word from the proposal scene ('disguise of every sort is my abhorrence'). Here he admits to the very thing he claimed to abhor.
- [round2/accessibility] “who had chances to observe him in unguarded moments that Mr. Darcy never had.” → “who had chances to observe him in unguarded moments that my father never had.”: Darcy is the letter-writer, so 'Mr. Darcy' here reads as Darcy referring to himself in the third person. It actually means his father. (Lead: In the letter Darcy calls his father 'Mr. Darcy'; 'my father' removes the confusion)

## 36.0  `5a6d7f1cc1470603` → `05dee97b9731808b`
- [round1/qualification] “The regret he expressed for what he'd done didn't satisfy her;” → “He expressed no regret for what he had done that satisfied her;”: The candidate says outright that Darcy expressed regret. The source only says that no regret he expressed satisfied her, and leaves open whether he expressed any.

## 36.2  `405b287c8e20dce2` → `9b3970f819f92292`
- [round1/obstruction] “What Wickham had said about the living” → “What Wickham had said about the parish”: The edition calls the 'living' a 'parish' everywhere else, including the letter just before (35.4) and Wickham's account (16.23-27). 'The living' here reads as a new, unexplained term.
- [round1/obstruction] “Wickham's giving up all claim to the living” → “Wickham's giving up all claim to the parish”: This keeps the term consistent with the letter's 'parish', as in the previous proposal.
- [round1/qualification] “she flattered herself that her own judgment wasn't wrong” → “she flattered herself that her wishes weren't wrong”: The irony is that she trusts her wishes (to believe Wickham), not her judgment. Saying 'judgment' removes the self-deception the chapter goes on to expose.

## 36.4  `4213f4574a01349d` → `aeb8125eef0e9845`
- [round1/omission] “But the story that followed, of his designs” → “But, alas, the story that followed, of his designs”: This drops the narrator's 'alas!', which gives Elizabeth's rueful reluctance at a key turn.
- [round2/accessibility] “make up for those minor failings she would try to classify Mr. Darcy's description of years of idleness and vice as being.” → “make up for those casual errors—which was how she would try to class what Mr. Darcy had described as years of idleness and vice.”: Tangled clause ending in a stranded 'as being'. Readers have to reverse-engineer it. (Lead: Untangled, and brought closer to the source ('casual errors, under which she would endeavour to class'))

## 36.6  `e36ef6e72168907a` → `2543ac69c5fc5d98`
- [round1/qualification] “to prove him capable of genuine feeling” → “to prove him capable of some kindly feeling”: The candidate drops Elizabeth's grudging 'some' and the kind of feeling ('amiable'), which inflates what she concedes.
- [round2/accessibility] “had long ago confirmed his blamelessness in the affair” → “had long ago confirmed Darcy's blamelessness in the affair”: One very long chain of 'that ...' clauses joined by dashes, with 'his' switching between Bingley and Darcy. A listener loses the thread; 'his blamelessness' seems to mean Bingley's. (Lead: Only the referent is fixed; Austen's long chain of admissions is kept as it is)

## 36.8  `622c946bd907c6c2` → `f3e4e0f15cee897d`
- [round2/accessibility] “satisfied my vanity with useless or pointless suspicion” → “satisfied my vanity with useless suspicion, or suspicion of the blameless”: 'Useless or pointless' is redundant and flat, which weakens the climax of the self-reproach. (Lead: Fidelity: the source's 'useless or blameless distrust' was flattened to 'useless or pointless'. The fix restores 'blameless'.)

## 36.11  `ee6f5dd5dfc5fa63` → `121779abf6859291`
- [round1/attribution] “the contempt their behavior had brought upon the rest of her family” → “the contempt the rest of her family had thus brought upon themselves”: 'Their behavior' can be read as the behavior of Elizabeth and Jane, the subject of the previous clause. The source says the rest of the family drew the contempt on themselves.

## 37.3  `5c5777052beb52f1` → `2a7babeb34ef3904`
- [round1/addition] “a compliment and a subtle reference to offer here” → “a compliment and an allusion to offer here”: 'Subtle' is invented, and it goes against the comedy of Mr. Collins, who is never subtle.

## 37.9  `c37360cbd266c7a5` → `04f80ac5f1c76ad0`
- [round2/accessibility] “And since Dawson doesn't mind riding on top” → “And since my maid Dawson doesn't mind riding up on the coachman's box”: Dawson has not been introduced; readers will not know this is Lady Catherine's maid, or what 'riding on top' of the carriage means. (Lead: Identifies Dawson and the barouche-box briefly, in Lady Catherine's voice)

## 37.11  `ecad2e76cf8e55be` → `b54d9138b22a2c64`
- [round1/obstruction] “traveling by post alone” → “traveling alone in hired carriages”: 'By post' now suggests the mail. Traveling post meant traveling in hired carriages with horses changed at inns, which is what Lady Catherine objects to without a servant. (Lead: Defect accepted; the proposed wording was awkward. This keeps the meaning of traveling post (hired carriages, no servant) without the misleading "by post".)
- [round1/qualification] “it would really be a discredit to you to let them go alone” → “it would really be a discredit to _you_ to let them go alone”: The candidate drops Austen's emphasis. Lady Catherine pointedly turns the impropriety into Charlotte's own discredit.

## 37.16  `9378d4bcd36614f3` → `455dda8c2b61204a`
- [round2/accessibility] “by restoring Bingley to all her former good opinion” → “by restoring Bingley to all of Elizabeth's former good opinion”: The sentence is about Jane, so 'her' reads as Jane's good opinion, but it means Elizabeth's. (Lead: Referent made explicit; the source's 'her' means Elizabeth)

## 38.2  `acd0625c2a38848a` → `5ea9945d3b5d17d9`
- [round2/accessibility] “must make her feel the grateful one” → “must make _her_ the one who felt obliged”: Stitched-together phrasing; the clause does not clearly say that it is Elizabeth who ought to be thanking the Collinses. (Lead: Restores the source's emphasis (_her_) and 'obliged' in grammatical form)

## 38.6  `8b6f151dfe823980` → `c49d549e4f0adce2`
- [round1/irony] “the entrance of the lady who was its subject” → “the entrance of the lady from whom those comforts sprang”: The irony is that Charlotte is the source of Mr. Collins's domestic comforts. 'Its subject' loses that and makes the referent vague.

## 38.16  `22755c5214c60287` → `740ad50642fd397a`
- [round1/qualification] “must at the same time gratify whatever” → “must at the same time so highly gratify whatever”: This drops the degree ('so highly'), which weakens the admitted pull of Elizabeth's vanity, the temptation the sentence is about.

## 39.0  `a25d48fa2c6bacea` → `6f6644dfb38d505e`
- [round1/omission] “they quickly spotted both Kitty and Lydia” → “they quickly spotted, as proof of the coachman's punctuality, both Kitty and Lydia”: The narrator's dry aside (the girls' presence proves the coachman is on time) is dropped entirely.

## 39.13  `30efee47f41c6a7e` → `4bc36b04c4cd77d7`
- [round1/tone] “such a plain little freckled thing” → “such a nasty little freckled thing”: "Plain" softens Lydia's insult, yet the next paragraph turns on Elizabeth being shocked by the coarseness of exactly this expression.

## 39.14  `57e83fbb957ba22b` → `fd96e08c9456a4cf`
- [round1/qualification] “considered perfectly reasonable!” → “flattered herself was broad-minded!”: "Fancied liberal" means she had congratulated herself on being generous/broad-minded about Wickham's mercenary match; "perfectly reasonable" loses the self-flattery that makes the reproach sting.

## 39.18  `b0eb039276f380fb` → `8106424377c71a1a`
- [round2/accessibility] “Mr. Bennet said voluntarily to Elizabeth” → “Mr. Bennet said to Elizabeth, quite unprompted”: 'Voluntarily' in this sense is dated and reads oddly; the point is that the undemonstrative Mr. Bennet said it unprompted. (Lead: 'Voluntarily' means unprompted, as the source intends)

## 39.21  `d05b65955b1d0da7` → `a4d4b1987802442b`
- [round2/accessibility] “if Kitty hadn't gotten carsick” → “if Kitty hadn't been sick”: 'Carsick' is a motor-age word and jars in a horse-drawn carriage. (Lead: Removes the anachronism; this is the source's own wording)

## 39.24  `bdeb36a340799fad` → `782c3b7d7c454d87`
- [round1/omission] “The comfort of the regiment's approaching departure” → “For her, the comfort of the regiment's approaching departure”: The emphatic "to her" contrasts Elizabeth's relief with her sisters' misery; without it the sentence reads as a general statement.

## 40.5  `43dc58f7559058fd` → `93e7749ec5e9d526`
- [round1/qualification] “for speaking so harshly about Wickham?” → “for having spoken so warmly in Wickham's favor?”: "Warmly of" means in his favor (she had championed Wickham against Darcy); "harshly about" reverses the meaning.

## 40.18  `1993d7bcfae72630` → `ece5dde1c8eb62fa`
- [round1/omission] “quite so vain and foolish and absurd” → “quite so weak and vain and absurd”: Elizabeth's self-accusation of weakness is dropped ("foolish and absurd" double up on "nonsensical").

## 40.34  `87c9b8dedd84de6c` → `16d9b4be20d95a7d`
- [round1/irony] “isn't rightfully theirs” → “isn't lawfully theirs”: The joke is Mrs. Bennet calling the estate not "lawfully" theirs in the same breath as admitting it is entailed on them by law; "rightfully" blurs the absurdity.

## 41.13  `446f815106fa81ec` → `9c74fc7f1cd6c80b`
- [round1/qualification] “as deplorable as such a step would make her look,” → “as detestable as such a step would make her look if it were known,”: The condition "were it known" (which explains "secretly") is lost, and "detestable" is weakened to "deplorable".

## 41.15  `7be7ece5b311172c` → `c5840b1e26847c4b`
- [round1/omission] “harm to us all that must come from Lydia's reckless and imprudent behavior” → “harm to us all that must come from the public notice of Lydia's reckless and imprudent behavior”: Elizabeth's point is about reputation—the harm comes from Lydia's conduct being publicly noticed; that qualification is dropped.

## 41.21  `60f78cd15c288cae` → `925ab279f45df8bf`
- [round1/irony] “their outrage would have been hard to contain” → “their outrage would have been more than even their combined chatter could express”: Austen's joke is that even Lydia and Mrs. Bennet talking together could not have voiced their indignation; "hard to contain" flattens it into a cliché.

## 41.24  `8d6a2991917b4d5a` → `8420b96cc0b37b61`
- [round1/qualification] “in the very charm that had first delighted her” → “in the very gentleness that had first delighted her”: "Gentleness" is the specific quality (echoing Jane's praise of his gentleness in ch. 40) now exposed as affected; "charm" loses it.

## 41.25  `0adc3d671b6cb729` → `89ff77603e4a6b46`
- [round1/omission] “good terms that she mentioned” → “good terms that, when he asked how she had spent her time at Hunsford, she mentioned”: Wickham's inquiry about Hunsford, which prompts her pointed mention of Fitzwilliam and Darcy, is dropped.

## 42.0  `98b7d5e7a9503ded` → `0373a39a52e0e605`
- [round1/omission] “to seek comfort for his own poor judgment in the pleasures” → “to seek comfort for the disappointment his own poor judgment had brought on in the pleasures”: He seeks comfort for the disappointment, not for his judgment; the compression loses the causal link.
- [round2/reverify-defect] “seek comfort for the disappointment his own poor judgment had brought on in the pleasures” → “seek comfort, for the disappointment his own poor judgment had brought on, in the pleasures”: Restoring 'the disappointment ... had brought on' is correct to the source, but the new relative clause runs straight into 'in the pleasures', giving a garden-path reading ('brought on in the pleasures'). Commas set off the clause and make the sentence parse.

## 42.1  `0a9f53e694e5b545` → `7836a3b645fc0265`
- [round1/qualification] “blind to the problems in her father's behavior” → “blind to the impropriety of her father's behavior”: "Impropriety" is a moral and social judgment; "problems" is vaguer and softens Elizabeth's view of her father.

## 42.14  `d25cbd72f4229792` → `9c255987bb2ddee3`
- [round1/addition] “Mrs. Gardiner dismissed her excuse.” → “Mrs. Gardiner scolded her for being so silly.”: Mrs. Gardiner teasingly calls the objection stupid; "dismissed her excuse" implies she sees through it as an excuse, which the source does not say.

## 43.53  `b68198446eab1481` → `c67fb0051a7734a0`
- [round1/qualification] “In what an unflattering light it might strike so proud a man!” → “In what a disgraceful light it might strike so vain a man!”: Austen keeps vain and proud distinct (Mary's ch. 5 definition); Elizabeth fears his vanity will read her visit as a pursuit of him. "Unflattering" also softens "disgraceful".
- [round1/qualification] “they would have been beyond his reach;” → “they would have been out of his sight;”: "Discrimination" means perception/notice: they would have been gone before he could see them. "Beyond his reach" suggests pursuit.
- [round2/accessibility] “Never in her life had she seen his manners so little dignified” → “Never in her life had she seen his manners so unassuming”: To a modern reader 'so little dignified' sounds like a criticism (undignified), whereas the point is that he was far less stiff and lofty than usual. (Lead: 'So little dignified' meant so little lofty; the fix avoids a modern misreading as criticism)

## 43.57  `a3535759b6b8fbe5` → `9f85cb36c35a3992`
- [round1/addition] “the very people whose existence his pride had rejected when he proposed to her” → “the very people his pride had revolted against when he proposed to her”: "Whose existence his pride had rejected" is an invented formulation; his pride revolted against the connection with them.

## 43.58  `d99856440062f50c` → `206189ad3a9fafa6`
- [round1/irony] “but he bore it well,” → “he bore it, however, with fortitude,”: The mock-heroic "with fortitude" (as if meeting a tradesman uncle were an ordeal) is Elizabeth's sly irony; "bore it well" flattens it.

## 43.60  `ebaaf1e62e1d2875` → `3ad5b8e9b1f029d7`
- [round1/qualification] “we understood you weren't expected in the area at all” → “we understood you weren't expected in the area just yet”: "Not immediately expected" becomes "not expected at all", which overstates and contradicts the housekeeper's "tomorrow".
- [round1/omission] “had brought him ahead of the rest of his party” → “had brought him a few hours ahead of the rest of his party”: The "few hours" detail (explaining why he is there a day early) is dropped.

## 43.64  `486a4aa5bcd72613` → `02dd38abaeb603e0`
- [round1/omission] “were still a good distance behind” → “were an eighth of a mile behind”: The specific distance is replaced by a vague phrase; the source's precise, slightly comic measure is dropped.

## 43.73  `911be8d9ed2d6099` → `a2a95e677308a58c`
- [round1/qualification] “"But he may just be putting on a show of civility," replied her uncle. "Important men often do that.” → “"But perhaps he's a little unpredictable in his civilities," replied her uncle. "Great men often are.”: "Whimsical" means changeable, which is why Mr. Gardiner fears being warned off later; "putting on a show" makes him accuse Darcy of insincerity.

## 44.0  `b90fdefd3906d84b` → `1ee2bacd5a6be183`
- [round2/accessibility] “Elizabeth had assumed that Mr. Darcy would bring his sister to visit her the day after she arrived at Pemberley” → “Elizabeth had assumed that Mr. Darcy would bring his sister to visit her the day after Miss Darcy reached Pemberley”: 'She' reads as Elizabeth, who has not arrived at Pemberley; it means Miss Darcy (confirmed in 44.16). The opening sentence of the chapter thus misleads. (Lead: Referent made explicit (Miss Darcy); matches the source's 'her reaching Pemberley')
- [round2/accessibility] “While these newly formed ideas were forming in their heads” → “While these new ideas were taking shape in their minds”: Redundant 'newly formed ... forming' reads like an editing slip. (Lead: Redundancy slip removed)

## 44.7  `4ff84785a1a94844` → `83e6ebca7d62eadf`
- [round1/obstruction] “two or three small incidents before they parted,” → “two or three small incidents occurred before they parted,”: The main verb was dropped, so the sentence is a fragment.
- [round2/accessibility] “Nothing passed between them that could justify his sister's hopes.” → “Nothing passed between them that could justify Miss Bingley's hopes.”: In a sentence about Bingley and Miss Darcy, 'his sister' could be read as Darcy's sister (Miss Darcy herself); it means Miss Bingley. (Lead: Referent made explicit (Miss Bingley))

## 44.9  `3827c6b0558a2011` → `78c8e4ad453e430e`
- [round1/attribution] “free of the arrogance or disdain of his companions” → “free of arrogance or of disdain toward his companions”: "Disdain of his companions" is Darcy's disdain for the Gardiners; the candidate makes the arrogance belong to the companions.

## 44.10  `b78710fcc2e87c4d` → `8d7190f23a804c1d`
- [round1/qualification] “she ventured to say yes for all of them” → “she ventured to accept on her niece's behalf”: Mrs. Gardiner commits Elizabeth specifically (whose feelings she could not read), not the party in general.
- [round2/reverify-defect] “ventured to accept on her niece's behalf” → “ventured to promise her niece's attendance”: 'engage for her attendance' is now correctly given as Mrs. Gardiner committing Elizabeth, but 'ventured to accept' repeats 'accept' for the third time in two lines ('felt about accepting', 'willingness to accept, she ventured to accept'). 'promise her niece's attendance' is closer to the source and removes the clumsy repetition.

## 44.13  `608818204a427953` → `47808d69d498b67d`
- [round1/attribution] “it was now a matter of some importance to Elizabeth to think well of him” → “it was now a matter of anxiety to them to think well of him”: The whole paragraph is the Gardiners' view ("their acquaintance", "They could not be untouched"); the candidate shifts the anxiety to Elizabeth. (Lead: Defect accepted; "some" dropped because it is not in the source.)

## 44.15  `f905158f7c52b64c` → `bf2a8db536d7cf27`
- [round2/accessibility] “and it was now heightened into something friendlier by the testimony so strongly in his favor, casting his character in such a good light, that yesterday had produced” → “and it was now warmed into something friendlier by yesterday's testimony, which had shown his character in so good a light”: The relative clause 'that yesterday had produced' is separated from 'testimony' by a long interruption, so the reader has to re-read to connect them. (Lead: Relative clause reattached; same content)
- [round3/reverify-defect] “warmed into something friendlier by yesterday's testimony, which had shown” → “heightened into something friendlier by yesterday's testimony, so strongly in his favor, which had shown”: Repair of the broken baseline sentence is right, but 'heightened' became 'warmed' (preference) and the source's 'testimony so highly in his favour' was dropped. Restore both.

## 45.0  `3a46356e70937766` → `7332a0202235d6fa`
- [round1/omission] “she couldn't help wondering how coldly or civilly that lady would treat her now.” → “she couldn't help feeling how very unwelcome her appearance at Pemberley must be to Miss Bingley, and was curious to see how much civility that lady would show in renewing their acquaintance.”: The candidate drops Elizabeth's awareness that her visit must be very unwelcome to Miss Bingley, and turns her curiosity about the degree of civility into 'coldly or civilly', which the source doesn't say.

## 45.7  `bfbea7cea67d849f` → `d256bafeebf430b0`
- [round1/omission] “a resolution all the more necessary because she could see that every eye in the room was watching his behavior.” → “a resolution all the more necessary to make, though perhaps not the easier to keep, because she could see that the whole party's suspicions had been aroused about the two of them, and that there was scarcely an eye that did not watch his behavior when he first came into the room.”: The candidate drops the ironic 'but perhaps not the more easily kept' and the key point that everyone's suspicions about Darcy and Elizabeth had been aroused. It also turns 'scarcely an eye' into 'every eye'.
- [round1/attribution] “whenever she spoke to either Darcy or his sister” → “whenever she spoke to either of them”: The 'objects' of Miss Bingley's curiosity are Darcy and Elizabeth, the pair being watched, not Darcy and Georgiana. The candidate changes who she smiles at.

## 45.9  `b00971832943826c` → `9f603df1a36a1cc2`
- [round1/attribution] “because of his very hope that those connections might one day become his own.” → “because of the very wish Elizabeth had long ago attributed to him: that they might one day become his sister's own.”: 'Her own' means Georgiana's: Darcy hoped his sister would marry into the Bingley family. The candidate says Darcy wanted the connections for himself, and it drops 'which Elizabeth had long ago attributed to him'.
- [round2/accessibility] “because of the very wish Elizabeth had long ago attributed to him: that they might one day become his sister's own” → “because of the very wish Elizabeth had long ago attributed to him: that his sister might one day marry into that family”: 'That they might one day become his sister's own' is opaque; readers must work out that it means Georgiana marrying into Bingley's family. (Lead: The source's 'their becoming hereafter her own' made clear)

## 45.14  `ed5228e048b64553` → `b98c4df8b7a357ad`
- [round1/qualification] “sharp, shrewd look” → “sharp, shrewish look”: 'Shrewish' means bad-tempered and scolding. 'Shrewd' means clever, which is close to a compliment and blunts Miss Bingley's spite.

## 46.0  `6c3d716f156c8c65` → `c60253e3c40aa189`
- [round1/omission] “But on the third day her patience was rewarded by the arrival of two letters at once” → “But on the third day her complaining was over and her sister was vindicated by the arrival of two letters at once”: Elizabeth had been fretting, not waiting patiently, and the letters clear Jane of neglect. The candidate turns the fretting into 'patience' and drops 'her sister justified'.

## 46.2  `9e43ccb6a551435f` → `69fee61d0eca4f7a`
- [round2/accessibility] “His choice is at least disinterested” → “His choice is at least not mercenary”: Many readers take 'disinterested' to mean 'uninterested'; here it means he is not marrying for money, which is the point of the sentence. (Lead: 'Disinterested' here means not marrying for money; clarified)

## 46.4  `a59b6a9d7cc39ac6` → `95ad90881a9ee024`
- [round1/addition] “and sent the first one back to Epsom” → “and dismissed the one that had brought them from Epsom”: The source says only that the chaise that brought them from Epsom was dismissed. Sending it back to Epsom is invented; Epsom is where it came from.
- [round1/omission] “checking at every turnpike and inn along the way” → “anxiously repeating them at all the turnpikes and at the inns in Barnet and Hatfield”: The candidate drops the place names Barnet and Hatfield. Elizabeth refers back to 'the Barnet road' in 47.5.
- [round1/attribution] “Poor Kitty is furious at having been sworn to secrecy about their attachment, but since it was told in confidence, one can't blame her.” → “Poor Kitty has been scolded for having concealed their attachment; but since it was told her in confidence, one can't wonder at it.”: The anger is aimed at Kitty for hiding the attachment; 47.40 refers to 'the anger which she had herself incurred'. The candidate makes Kitty the angry one and invents 'sworn to secrecy'.
- [round1/qualification] “My father has gone to London with Colonel Forster” → “My father is going to London with Colonel Forster at once”: Jane writes that her father is about to leave, not that he has already gone. The candidate changes the timeline.
- [round2/accessibility] “for there they switched from their hired carriage to a hackney coach” → “for there they switched from their hired carriage to a hackney coach—a London cab—”: 'Hackney coach' is unfamiliar, and the distinction matters to the plot (it signals London, not Scotland); 'turnpikes' in the same letter is also opaque. (Lead: Brief gloss; the plot depends on it)
- [round2/lead-mechanical] “hackney coach—a London cab— and dismissed” → “hackney coach—a London cab—and dismissed”: The mechanical check found a stray space left after the closing em dash of the round-2 gloss.
- [round4/final-verify-defect] “anxiously repeating them at all the turnpikes” → “anxiously repeating his inquiries at all the turnpikes”: Final verifier 3: after round-1 restoration 'them' had no plural antecedent in the candidate's sentence.

## 46.21  `5dd0de18b32f86a9` → `b37411e071be15a2`
- [round1/addition] “But self-pity, though it intruded, couldn't dominate.” → “But thoughts of herself, though they would intrude, couldn't absorb her.”: 'Self' here means Elizabeth's own concerns (what she has just realized about Darcy). Calling it 'self-pity' adds a judgment the source doesn't make.

## 46.24  `d36336b6413b5b75` → `f07816275fb27b8b`
- [round1/omission] “and—with only one serious, lingering look—left the room.” → “and, leaving his compliments for her relations, with only one serious parting look, went away.”: The candidate drops Darcy leaving his compliments for her relations, a telling courtesy toward the Gardiners. 'Lingering' is also added.

## 46.26  `c8634d5b224634c5` → `8b460c0399904546`
- [round1/qualification] “might reasonably lead her to try the less dramatic approach” → “might perhaps entitle her to try the other, less interesting kind of attachment”: The narrator's ironic defense is hedged ('perhaps') and wry ('less interesting'). 'Reasonably' drops the hedge, and 'less dramatic approach' flattens the joke.

## 46.30  `c772476344201c76` → `9128ca786b269985`
- [round1/attribution] “repeated her aunt as she ran to her room to pack.” → “repeated her aunt, as Elizabeth ran to her room to get ready.”: Elizabeth is the one who runs off; Mrs. Gardiner then speaks of 'her' in the third person. The candidate's 'she' reads as the aunt.

## 46.31  `017ca6a2693ef4ed` → `fab9839dc6e72ccb`
- [round2/accessibility] “and Mr. Gardiner, having settled the account at the inn, there was nothing left but to go” → “and once Mr. Gardiner had settled the account at the inn, there was nothing left but to go”: The sentence switches subject midway and is ungrammatical. (Lead: Grammar fixed)

## 47.2  `10e8861b59cd82a8` → `58cdf0954b19b914`
- [round1/addition] “"I do, indeed," said Mrs. Gardiner. "I'm coming around to your uncle's view.” → “"Upon my word," said Mrs. Gardiner, "I'm beginning to come around to your uncle's view.”: Elizabeth's question was put to her uncle. 'I do, indeed' has Mrs. Gardiner answer it with a firm belief the source doesn't give her. She is only beginning to agree.

## 47.8  `600262f35e7966e9` → `60b5736d94a9b120`
- [round2/accessibility] “"But can you believe Lydia is so lost to everything but her feelings for him” → “"But can you believe," said her aunt, "that Lydia is so lost to everything but her feelings for him”: Unattributed; it follows a long speech by Elizabeth and precedes 'replied Elizabeth', so it must be Mrs. Gardiner, but the reader has to infer that. (Lead: Speaker tag added; the alternation makes it Mrs. Gardiner (the next line is 'replied Elizabeth'))
- [round3/reverify-defect] “"But can you believe," said her aunt, "that Lydia” → “"But can you believe that Lydia”: Added speaker tag 'said her aunt' settles an attribution the source leaves open. Austen gives no tag, and either Gardiner could be speaking (Mr. Gardiner has carried the argument in 47.4 and 47.6). Remove the tag.

## 47.9  `22130fe4ba8adc52` → `14bde5871742aa30`
- [round1/omission] “for the last year or more,” → “for the last six months—no, for a whole year—”: The candidate loses Elizabeth's self-correction, which shows her agitation as she speaks and is not the same as 'a year or more'.
- [round2/reverify-defect] “for a whole year— she's” → “for a whole year—she's”: Restored 'for the last half year, nay, for a twelvemonth' correctly, but the closing em dash has a stray space after it ('year— she's'); the edition uses closed em dashes.

## 47.11  `fc853899881e9125` → `ae5cd1bacaa0be2c`
- [round1/qualification] “he's been dishonest in every sense of the word” → “he's been dissolute in every sense of the word”: 'Profligate' means dissolute and wasteful: sexual misconduct and spending, which is why the charge matters here. 'Dishonest' changes the charge and repeats the next clause.

## 47.15  `3bb3d9c97b1c5b83` → `892df96284adfc4a`
- [round2/accessibility] “for what good would it apparently do anyone” → “for what good could it do anyone”: 'Apparently' makes no sense here and reads as a slip. (Lead: Slip removed; source 'what good could it do')
- [round3/reverify-defect] “for what good could it do anyone to destroy” → “for what good could it do anyone, as far as we could see, to destroy”: Deleting 'apparently' (rather than fixing its placement) drops Elizabeth's hedge 'of what use could it apparently be': it only seemed useless at the time. Restore the qualification.

## 47.47  `af8e8ddb77cc4e32` → `76b0be80ca5a1578`
- [round1/omission] “but when questioned, Denny” → “but when questioned by him, Denny”: The emphasis contrasts what Denny let slip to others with what he told the Colonel. Without 'by him', the reason for Jane's hope is lost.

## 47.49  `76ddcfe0d1cadec8` → `dd1c653751b1d892`
- [round1/tone] “with obvious triumph” → “with a very natural triumph”: Jane charitably calls Kitty's triumph 'very natural'. 'Obvious' removes the excuse she makes for Kitty and flattens Jane's voice.
- [round2/accessibility] “that in Lydia's last letter she had been prepared for something like this” → “that Lydia's last letter had prepared her for something like this”: 'She' reads as Lydia; it means Kitty, who had been prepared by Lydia's letter. (Lead: Referent fixed (Kitty); matches the source)

## 47.68  `27ebfd34a761437d` → `6dc7947f4f074285`
- [round1/qualification] “"I don't know; I hope not.” → “"I don't know; I hope there was.”: Elizabeth asks whether any servant did NOT know the story. Jane hopes there was one. The candidate's 'I hope not' reverses her meaning. (Lead: Defect accepted; source wording used, since "I hope so" leaves the referent unclear.)

## 47.73  `3718e12babde5420` → `5d1c5f95c9e47af2`
- [round2/accessibility] “If he could somehow discover which house the coachman had previously dropped off his fare at, he intended to investigate there, hoping he might find the stand and number of the coach.” → “If he could find out where the coachman had set down his earlier passenger, he meant to ask there, in the hope of learning the coach's number and the cab rank it worked from.”: The chain of reasoning (which fare, which house, 'stand and number') is hard to follow, and 'stand' (cab rank) is unfamiliar. (Lead: Untangled; 'stand' glossed as the cab rank)

## 48.19  `8b86ebe5f5402967` → `b5d6be9a7d557e0a`
- [round1/obstruction] “nothing, therefore, could be accurately guessed on that subject. Though Elizabeth” → “nothing, therefore, could fairly be inferred from them, though Elizabeth”: The candidate breaks the sentence and leaves 'Though Elizabeth ... was perfectly aware ...' as a fragment. 'On that subject' also blurs the point: nothing could be read into her low spirits. (Lead: Defect accepted; a comma replaces the dash because an em-dash parenthesis follows straight after.)

## 48.31  `defeb24b3153c745` → `46ec0bd87faa4e39`
- [round1/tone] “said Kitty, hurt.” → “said Kitty peevishly.”: Kitty is fretful (peevish, irritable), as in 47.40. 'Hurt' makes her more sympathetic than Austen does.

## 48.32  `c81395b2238b4779` → `511cd3129226162d`
- [round1/omission] “I wouldn't trust you within fifty miles of it!” → “I wouldn't trust you as near to it as Eastbourne—not for fifty pounds!”: The candidate drops Eastbourne (a nearby resort that is still at a safe distance) and changes 'for fifty pounds' (not even for a large sum) into a distance. Mr. Bennet's joke is altered. (Lead: Defect accepted; "not for fifty pounds" makes it clear to a modern reader that this is a sum refused, not a distance.)

## 49.3  `c91577b0bd3987f8` → `b6ad66e6fc50772f`
- [round1/omission] “they were about to look for him upstairs when” → “they were about to look for him upstairs with their mother when”: The candidate drops where they expected to find him.

## 49.17  `f444a46108cbd870` → `89be702c4ceeeef0`
- [round1/qualification] “there will be some money remaining” → “there will be a little money remaining”: Gardiner deliberately plays the sum down as 'some little money'. The size of the settlement is what the Bennets go on to puzzle over.

## 49.41  `b438b4aef7370cfc` → `d92218576357a03e`
- [round1/qualification] “proof, I want to believe,” → “proof, I will believe,”: Jane chooses to believe it. 'I want to believe' adds doubt that isn't in the source and is out of character for Jane.

## 50.3  `5970035e49f5673a` → `3abe46a7d22f402c`
- [round2/accessibility] “In terms of grateful acknowledgment for his brother's kindness, though expressed as briefly as possible, he then set down on paper” → “In a brief note of grateful thanks for his brother's kindness, he then set down on paper”: 'In terms of' is used where 'in' or 'with' is meant, so the opening clause doesn't attach to anything and the sentence has to be re-read. (Lead: 'In terms of' (old sense: in words of) untangled)
- [round2/accessibility] “He would be scarcely ten pounds a year worse off by the hundred that was to be paid them” → “Paying them the hundred a year would leave him scarcely ten pounds a year worse off than before”: The arithmetic (paying out £100 a year costs him barely £10 more than Lydia already cost him) is packed into a compressed phrase that listeners will lose. (Lead: Arithmetic made explicit; same claim)

## 50.8  `c30cf347e8c816b1` → `ba514f4c94836201`
- [round1/qualification] “They will never be admitted into any house in this neighborhood.” → “There is _one_ house in this neighborhood they will never be admitted into.”: Candidate bans them from every house in the neighborhood; the source bars them from one house only (Longbourn), which is the point of Mr. Bennet's dry emphasis and of the next sentence. (Lead: Defect accepted; keeps the source's italic emphasis on _one_, which carries Mr. Bennet's dry meaning (Longbourn).)

## 50.9  `16a00cc8b0c0c365` → `9a70cdb8c3e5881a`
- [round1/qualification] “unimaginable stubbornness” → “unimaginable resentment”: Mrs. Bennet reads his refusal as resentment (anger at Lydia), not stubbornness; the candidate changes the motive she attributes to him.
- [round1/omission] “the weeks of living with Wickham” → “the two weeks of living with Wickham”: The source specifies a fortnight; 'the weeks' drops the number.
- [round2/accessibility] “That his anger could reach such a point of unimaginable resentment as to deny his daughter a privilege without which her marriage would hardly seem real exceeded everything she thought possible.” → “It exceeded everything she thought possible that his anger could reach such a point of unimaginable resentment as to deny his daughter a privilege without which her marriage would hardly seem real.”: A long noun-clause subject ('That his anger ... real') holds the verb back to the very end; readers lose the thread before 'exceeded' arrives. (Lead: Main verb moved forward; every element of the source is kept (including 'resentment', restored in round 1))

## 50.11  `9daee5cb47f3d28d` → `55c9cac5992a9ee9`
- [round2/accessibility] “Not, however, from any fear of personal harm to herself” → “Not, however, from any fear of disadvantage to herself”: 'Personal harm' suggests physical danger; what is meant is that she had nothing to lose, since her hopes of Darcy were already gone. (Lead: The source's 'disadvantage' replaces the misleading 'personal harm')
- [round2/accessibility] “a family to whose existing objections would now be added an alliance with the man he most justly despised” → “a family that already had its drawbacks and would now also be related to the man he most justly despised”: The inverted relative clause ('to whose existing objections would now be added') is hard to parse aloud. (Lead: Inverted relative clause untangled)

## 50.18  `e7824c49bab0edd4` → `c77afade5d7c2ad6`
- [round1/attribution] “to ask him to settle Wickham's various debts in and near Brighton, for which I have pledged myself” → “to ask him to assure Wickham's various creditors in and near Brighton of speedy payment, for which I have pledged myself”: Colonel Forster is asked only to reassure the creditors that Gardiner (i.e. Darcy) will pay; the candidate has Forster settling the debts himself.

## 50.22  `81279c16a598572f` → `1510aee4e62fb46f`
- [round2/accessibility] “His daughter's request—for such it might be considered—to be welcomed back into the family before heading north was initially met with a flat refusal.” → “Lydia's request—for such it might be considered—to be welcomed back into the family before heading north was at first flatly refused by her father.”: The paragraph before is Mrs. Bennet speaking, so 'His' has no near antecedent; Mr. Bennet is only identified later by 'urged him'. (Lead: Referent made explicit; Mr. Bennet's refusal, as in the source)

## 51.3  `838ae8253537a283` → `dd3fe9b6a0e51dd0`
- [round1/irony] “was not nearly as warm” → “was not quite so warm”: Austen's understatement ('not quite so cordial') is inflated to 'not nearly as warm', losing the dry irony.

## 51.35  `5b7e02ed164fbec2` → `14eff07428164207`
- [round1/omission] “by walking away” → “by running away”: Source says she ran away; 'walking' changes the comic haste and her agitation.
- [round2/accessibility] “Elizabeth was forced to put it out of her power by running away” → “Elizabeth was forced to make asking impossible by running away”: 'Put it out of her power' (to ask) is a period construction, and 'it' has no clear referent. (Lead: Keeps the irony of the source ('put it out of her power') in plain words)

## 52.3  `0ec0473591dab06a` → `a27b7f9bb63e2185`
- [round1/qualification] “If you genuinely don't understand me, forgive my frankness.” → “If you choose not to understand me, forgive my impertinence.”: Mrs. Gardiner suggests Elizabeth may be pretending not to understand; 'genuinely don't understand' removes that teasing suspicion.
- [round1/omission] “His stated reason was his conviction that Wickham's worthlessness had not been made known widely enough to prevent any young woman of good character from trusting him.” → “His stated reason was his conviction that it was his own fault that Wickham's worthlessness had not been made known widely enough to prevent any young woman of good character from loving or trusting him.”: Drops 'owing to himself' (Darcy's self-blame, the core of his professed motive) and 'love'.
- [round1/qualification] “a problem he had helped to create” → “a wrong he had brought about himself”: Darcy takes the whole blame ('brought on by himself', 'imputed the whole'); 'helped to create' dilutes it to partial responsibility.
- [round1/omission] “and return to her family, offering” → “and return to her family as soon as they could be persuaded to take her back, offering”: Drops the condition that her family would first have to be persuaded to receive her, a real social implication of her disgrace.
- [round1/qualification] “but I won't tell you how little I was satisfied with her behavior while she stayed with us, except that I saw from Jane's letter last Wednesday that her conduct since returning home has been equally bad, so” → “but I wouldn't tell you how little I was satisfied with her behavior while she stayed with us if I hadn't seen from Jane's letter last Wednesday that her conduct since returning home has been just the same, and therefore”: Candidate garbles the conditional into 'I won't tell you ... except that', which is self-contradictory; the source says she tells it only because Jane's letter shows Elizabeth already knows.
- [round1/irony] “I thought him very reserved; he hardly ever mentioned your name. But reserve seems to be the fashion.” → “I thought him very sly; he hardly ever mentioned your name. But slyness seems to be the fashion.”: 'Sly' is Mrs. Gardiner's tease that Darcy is hiding his feelings for Elizabeth (and that Elizabeth is too); 'reserved' flattens the joke into a neutral character note.
- [round2/accessibility] “he'd been forced to leave the regiment because of pressing debts of honor” → “because of pressing debts of honor from gambling”: 'Debts of honor' (gambling debts, not legally enforceable) will be misread as something honorable; the meaning matters to Wickham's character. (Lead: Keeps the period term and makes clear these are gambling debts)
- [round3/reverify-defect] “Wickham admitted because of pressing debts of honor from gambling” → “Wickham admitted he'd been forced to leave the regiment because of pressing debts of honor from gambling”: Grammar broken: the repair deleted "he'd been forced to leave the regiment" while adding the gloss, leaving 'Wickham admitted because of pressing debts...'. The source says he was obliged to leave the regiment. The gloss 'from gambling' is accurate.

## 52.14  `d54f2d96d883a427` → `2b9dfc1942730d68`
- [round1/qualification] “—though I could take it in on my way to Newcastle” → “—otherwise I could take it in on my way to Newcastle”: 'Or else' = otherwise: he won't go because it would be too much for him; 'though' suggests he still might.

## 52.29  `64dfd7c68c7dc716` → `3b82e6cc811ff15d`
- [round2/accessibility] “that's the living I ought to have had” → “that's the parish I ought to have had”: 'Living' in the sense of a church post with its income is unfamiliar to most modern readers; 'rectory' helps, but only after the fact. (Lead: Edition-wide convention: 'living' is rendered 'parish' (also applied at 52.32))

## 52.32  `c0cfc3b187f7e439` → `4ddceed8290553ee`
- [round2/consistency] “that the living was left to you” → “that the parish was left to you”: Edition-wide convention renders 'living' as 'parish'; aligned with 52.29.

## 52.35  `95343ddeb9b97eaf` → `04df002b8316102e`
- [round1/obstruction] “And there was not no truth in that.” → “And it wasn't entirely without foundation.”: The double negative 'not no truth' reads as an error and obstructs; also loses 'wholly'.

## 53.17  `7d13e5aba3d92306` → `680be46ce8caa214`
- [round2/accessibility] “Had she not seen him in Derbyshire, she might have supposed he was coming with no intention beyond what was openly stated” → “Had she not seen Bingley in Derbyshire, she might have supposed he was coming with no intention beyond what was openly stated”: The previous paragraph is Jane speaking of Bingley, but Darcy is the man most associated with Derbyshire, so 'him' is briefly ambiguous until 'his friend's permission'. (Lead: Referent made explicit (Bingley))

## 53.26  `084a8e97cbf75f19` → `147f6a395d8146cd`
- [round1/omission] “her neighbors might all see Mr. Bingley before they did” → “her neighbors might all see Mr. Bingley before they did because of it”: Drops the causal link: the neighbors will see him first because of Mr. Bennet's refusal to call, which is why it mortifies her.
- [round2/reverify-defect] “her neighbors might all see Mr. Bingley before they did because of it.” → “her neighbors might all, because of it, see Mr. Bingley before they did.”: 'in consequence of it' moved to the end ('see Mr. Bingley before they did because of it') now reads as if the Bennets' own seeing were caused by it; the phrase should attach to the neighbours' seeing him first, as in the source.

## 53.39  `66370f228ce4d44e` → `de1b07aa81f8e4a7`
- [round1/qualification] “in her mother's house” → “in her mother's presence”: The constraint is Mrs. Bennet's presence (the contrast is with the uncle and aunt as company), not the house.

## 53.48  `7ca086c74e0468e5` → `18bd0933daf45bf7`
- [round2/accessibility] “People did say you meant to leave the place entirely at Michaelmas” → “People did say you meant to leave the place entirely at Michaelmas, in the autumn”: Michaelmas (late September, a quarter-day when leases ended) is unfamiliar; the meaning is recoverable but a gloss helps. (Lead: Minimal gloss of Michaelmas)

## 54.10  `16f2c075aae04e94` → `2f69be261457ec44`
- [round1/irony] “Her calculating mother had the same idea and refrained” → “Her prudent mother, occupied by the same idea, refrained”: Austen's ironic 'prudent' is turned into an explicit narrator judgment ('calculating'), making the irony overt and harsher.

## 54.11  `35ee5fdf0237d4a4` → `022ce58c29623ecd`
- [round2/accessibility] “He appeared nobly indifferent; and she would have imagined Bingley had received Darcy's blessing to be happy, had she not seen his eyes also turn toward Mr. Darcy with an expression of half-amused alarm.” → “He appeared nobly indifferent; and she would have imagined Bingley had received Darcy's blessing to be happy, had she not seen Bingley's own eyes turn toward Mr. Darcy with an expression of half-amused alarm.”: 'He' is Darcy, then 'his eyes' switch to Bingley without warning, so for a moment Darcy seems to be looking at himself. (Lead: Referent made explicit (Bingley's eyes), as in the source)

## 54.13  `fc1b0e0e12f05a4d` → `b3de593c043c56b2`
- [round2/accessibility] “Anxious and restless, the period in the drawing room before the gentlemen arrived was tedious and dull to a degree that almost made her rude.” → “Anxious and restless, she found the time in the drawing room before the gentlemen arrived so tedious and dull that it almost made her rude.”: Dangling modifier: 'Anxious and restless' grammatically describes 'the period', not Elizabeth. (Lead: Dangling modifier fixed (the source dangles as well, but in modern English the modifier attaches to the wrong noun))

## 54.18  `99968a5fdab593ed` → `57362cf0fb888ab0`
- [round1/qualification] “expect a renewed proposal” → “expect a renewal of his love”: Elizabeth doubts that his love could revive, not merely that he would propose again; the next sentence handles the proposal separately.

## 55.17  `3c99b2926fe92df7` → `f6aa6d6ea7ab0f9b`
- [round2/accessibility] “with a patience and composure particularly grateful to the daughter” → “with a patience and composure that the daughter particularly appreciated”: 'Grateful' in the old sense of 'pleasing' reads as though the daughter's gratitude were being described in the wrong place. (Lead: 'Grateful' in the old sense of pleasing)

## 55.19  `f4f5936c9445e1a3` → `c611d866092aaeed`
- [round1/irony] “unless Mr. Darcy returned later than planned” → “unless Mr. Darcy returned before the time he had given”: Inverted: Elizabeth's joke is that all will be settled unless Darcy comes back within his ten days to interfere again; the candidate has it reversed.
- [round1/qualification] “She did seriously believe, however,” → “Seriously, however, she felt fairly sure”: Loses the hedge 'tolerably persuaded' and the 'Seriously' marker that signals the previous sentence was a joke.

## 55.20  `ed0a8630167cfec0` → `a472b2ce6f30b302`
- [round2/accessibility] “The latter was much more agreeable than his companion had expected. There was nothing foolish or presumptuous about Bingley to provoke his ridicule or put him off; and he was more talkative and less eccentric than Mr. Bennet had ever seen him.” → “Mr. Bennet was much more agreeable than Bingley had expected. There was nothing foolish or presumptuous about Bingley to provoke his ridicule or put him off; and Mr. Bennet was more talkative and less eccentric than Bingley had ever seen him.”: 'The latter' is Mr. Bennet (more agreeable than Bingley expected), but the last clause says Bingley was more talkative and 'less eccentric' than Mr. Bennet had seen him, which reverses the logic; 'eccentric' only fits Mr. Bennet. The passage contradicts itself. (Lead: FIDELITY: the baseline reversed the source ('he was more communicative, and less eccentric, than the other had ever seen him': he is Mr. Bennet, the other is Bingley))
- [round2/accessibility] “she wouldn't be missed to counteract her mother's plots” → “she wasn't needed to counteract her mother's plots”: 'Wouldn't be missed to counteract' is not idiomatic. The meaning is that her presence wasn't needed to counter her mother's schemes. (Lead: Idiom fixed; the source says she 'was not wanted to counteract her mother's schemes')

## 55.21  `e03f45d547305f04` → `53f19d15aa6e444c`
- [round1/irony] “that there was reason to fear her mother had been too clever for her own good” → “that there was reason to fear her mother had been too clever for her”: Source: her mother outwitted Elizabeth; 'too clever for her own good' says the scheme backfired on Mrs. Bennet, the opposite of what happened.
- [round1/qualification] “clearly in the middle of an earnest conversation” → “as if in earnest conversation”: Drops the 'as if' hedge; Elizabeth infers the conversation, she does not know it.
- [round1/attribution] “who like the others had sat down” → “who like Jane had sat down”: 'The other' is Jane; only two people are in the room, so 'the others' misstates who sat down.

## 55.46  `cc4d9b77c88bba5f` → `ef85fe2099d86429`
- [round1/qualification] “he could have chosen so much more advantageously.” → “he could have chosen so much more advantageously in many ways.”: Drops Jane's qualification 'in many respects', making her self-deprecation absolute.

## 56.1  `5b3356419b88d985` → `3b816a8841e63997`
- [round1/attribution] “it was even greater than Elizabeth's” → “it still fell short of Elizabeth's”: Source says Mrs. Bennet's and Kitty's astonishment was even inferior to (less than) Elizabeth's; the candidate inverts the comparison.

## 56.12  `2207341346e89b52` → `165152de30974adf`
- [round1/tone] “May I ask whether you left” → “May I take the liberty of asking your Ladyship whether you left”: Drops Mrs. Bennet's deferential formula and the form of address 'your Ladyship', flattening her awed obsequiousness toward rank.

## 56.16  `0f43af0a9ff57d98` → `d4e3a8d30d849c0f`
- [round2/accessibility] “there seemed to be a rather pretty little wilderness on one side of your lawn” → “there seemed to be a rather pretty little wilderness—a planted grove—on one side of your lawn”: 'Wilderness' as a planted, deliberately informal area of garden is a period term; modern readers picture wild land. (The 'hermitage' in 56.17 raises the same issue.) (Lead: Gloss added, and the period word kept)

## 56.45  `fec6ff710f5a0706` → `500bef09cb71cee2`
- [round1/irony] “extraordinary advantages” → “extraordinary sources of happiness”: 'Advantages' makes Elizabeth's reply sound mercenary; source says 'sources of happiness', keeping her ironic ambiguity.
- [round4/pre-existing-fidelity] “These are heavy punishments,” → “These are heavy misfortunes,”: Noted by two independent verifiers (reverify-r1-3, final-verify-3). Source 'heavy misfortunes': Elizabeth's ironic reply does not accept Lady Catherine's framing of them as punishments.

## 56.47  `3b43d5be86e3713e` → `034e53dc8e8bd2b1`
- [round1/tone] “all the more unpleasant” → “all the more pitiable”: Elizabeth's barb is that Lady Catherine will be pitiable; 'unpleasant' blunts the insult.

## 56.50  `f7ffeb8377327206` → `4e450ef853a7c6c0`
- [round1/qualification] “But who was your mother?” → “But what was your mother?”: 'What' asks about her mother's social station (an attorney's daughter); 'who' loses the class sneer.

## 56.61  `667dfad0a2db3768` → `817cbf998ccc95f9`
- [round2/accessibility] “"You can now have nothing further to say," she answered angrily.” → “"You can now have nothing further to say," Elizabeth answered angrily.”: The previous paragraph is Lady Catherine's speech, so 'she' could be either woman on first hearing, especially aloud. (Lead: Speaker made explicit (Elizabeth))

## 56.73  `d339ddc25ed20061` → `4bbd1e7514dee47e`
- [round1/qualification] “She had to go.” → “She insisted on going.”: 'She would go' means she insisted on leaving; 'had to go' implies an external obligation.

## 57.4  `32411813eebbc1ff` → `ba03dde1b78e039c`
- [round1/irony] “they satisfied their curiosity” → “they obligingly satisfied their curiosity”: Narrator's ironic 'obligingly' (the family conveniently explains it away themselves) is dropped.

## 57.13  `94f8e6c6080acd61` → `c228dcc79feae3f7`
- [round1/qualification] “and powerful connections” → “and wide powers of patronage”: Patronage (the power to bestow livings and posts) is exactly what Collins, a clergyman owing his living to a patron, values; 'connections' changes the meaning.

## 57.19  `b50c9a7867fc86b1` → `02b437a3bfbb42bb`
- [round1/qualification] “I almost prefer him to Wickham” → “I can't help preferring him even to Wickham”: Candidate adds a hedge ('almost'); Mr. Bennet says he does prefer Collins even to Wickham.

## 58.0  `1cae72788d73adb3` → `2a0742e7cd12f324`
- [round1/attribution] “Instead of receiving the expected excuses from his friend,” → “Instead of receiving the letter of excuse from his friend that Elizabeth half expected,”: Loses that the expectation was Elizabeth's, and only a half-expectation; 'the expected excuses' makes it general and certain.

## 58.8  `110e43b99463ad53` → `7ac3dcda3fe5aa8e`
- [round2/accessibility] “dwelling on every word of the latter which, in her Ladyship's view, showed particular defiance and audacity, in the belief that such a report would help her obtain from her nephew the promise Elizabeth had refused to give” → “She had dwelt on every word of Elizabeth's that seemed to her particularly defiant and audacious, believing this would help her get from her nephew the promise Elizabeth had refused to give.”: A long sentence already carries two clauses when 'the latter' and a trailing 'in the belief that' clause are added; the chain of referents is hard to follow. (Lead: Split, with referents clarified; same content)
- [round3/reverify-defect] “Longbourn—its purpose and the substance of her conversation with Elizabeth—She had dwelt on every word of Elizabeth's that seemed to her particularly defiant and audacious, believing this would help her get from her nephew the promise Elizabeth had refused to give..” → “Longbourn, its purpose, and the substance of her conversation with Elizabeth. She had dwelt on every word of Elizabeth's that seemed to her particularly defiant and audacious, believing this would help her get from her nephew the promise Elizabeth had refused to give.”: Punctuation broken: the sentence split leaves a capital 'She' after an em dash (so the dash after 'Longbourn' is unbalanced) and a double period 'give..'. Content ('Elizabeth had refused'; defiant/audacious as Lady Catherine's view) is faithful.

## 58.12  `30e908089b064219` → `4375f55d04625392`
- [round1/irony] “behaved well” → “behaved beyond reproach”: Elizabeth's understatement (not irreproachable) is inflated into flatly 'did not behave well'.

## 58.13  `dab061729365c8b9` → `b59be95e706a193f`
- [round1/omission] “has been, and remains, unbearably painful” → “is now, and has been for many months, unbearably painful”: Drops 'many months', the duration of Darcy's remorse.

## 58.23  `d7245dad2041f136` → `34899f42ec3948ee`
- [round1/irony] “from innocence” → “from ignorance”: Darcy's teasing paradox is 'ignorance' (of anything to reproach herself with); 'innocence' is a softened interpretation that removes the joke.

## 59.10  `228c6d2994462c82` → `f1db99acfd8bfded`
- [round1/qualification] “But we had considered it impossible—we had even discussed it.” → “But we had considered it—had talked of it—as impossible.”: 'We had even discussed it' suggests they discussed it as a possibility; source says they talked of it as impossible.

## 59.26  `1f3dfeba06a41495` → `bb26fa70fe345d3d`
- [round1/qualification] “Elizabeth reserved her mother's reaction for herself.” → “Elizabeth kept for herself the task of asking for her mother's consent.”: Source means Elizabeth kept to herself the job of asking her mother's consent; 'reserved her mother's reaction' is garbled. (Lead: Defect accepted; the elliptical "asking her mother's" is spelled out so the sentence is clear on its own.)
- [round1/omission] “equally unsuitable” → “equally unlikely to do credit to her good sense”: Drops what the manner would be unsuitable for: showing Mrs. Bennet's sense.

## 59.34  `92fcc10e08781f3b` → `34c21fc453b18502`
- [round1/irony] “anything he asked” → “anything he condescended to ask”: Drops 'condescended', Mr. Bennet's dry irony about Darcy's hauteur.
- [round1/qualification] “think carefully” → “think better of it”: 'Think better of it' urges her to change her mind; 'think carefully' softens the advice.

## 60.27  `2dc78418eac68d95` → `1569f9c882defc31`
- [round2/accessibility] “seeing Mr. Darcy subjected to all the fawning and obsequious politeness of her husband” → “seeing Mr. Darcy subjected to all the fawning and obsequious politeness of Charlotte's husband”: The subject of the sentence is Elizabeth, so 'her husband' reads at first as Elizabeth's husband (Darcy), not Charlotte's (Mr. Collins). (Lead: Referent made explicit (Charlotte's husband))

## 61.4  `cb53dd22bab87f86` → `1f2defb2634b262b`
- [round1/qualification] “drawn away from her books” → “drawn away from the pursuit of accomplishments”: Mary's accomplishments include music as well as reading; 'her books' narrows the source.

## 61.5  `9bd5faff27ff511b` → `27b04db39d96233e`
- [round1/qualification] “to advance his career” → “to make his fortune for him”: Source is about Darcy making Wickham rich (as Lydia's begging letter shows), not merely career advancement.

## 61.9  `417f50b8cb5f64f4` → `1b5b4a613d1068d6`
- [round2/accessibility] “even after peace was restored” → “even after the war ended and they were settled in a home”: This means the end of the war, which frees Wickham from the army, but it reads as peace within the family. (Lead: The source's 'restoration of peace' means the end of the war (discharge from the militia))
- [round3/reverify-defect] “and they were settled in a home and they were settled in a home,” → “and they were settled in a home,”: Duplicated phrase: 'after the war ended and they were settled in a home and they were settled in a home'. The gloss itself ('restoration of peace dismissed them to a home') is accurate.
- [round3/reverify-defect (pre-existing)] “Lydia was an occasional visitor when” → “Lydia was an occasional visitor at Pemberley when”: Pre-existing omission: source 'Lydia was occasionally a visitor there' (at Pemberley); candidate drops 'there', so where she visited is lost.

## 61.11  `1c2ecc61dda16c02` → `af5a72c061911129`
- [round1/omission] “from a much younger sister” → “from a sister more than ten years younger than himself”: Drops the specific age gap.

## 61.12  `73704034cd31f6d7` → `4ac288cd9ccbac76`
- [round2/accessibility] “from the visits of her uncle and aunt from the city” → “from the visits of Elizabeth's uncle and aunt from the city”: The sentence's subject is Lady Catherine, so 'her uncle and aunt' reads as hers rather than Elizabeth's. 'From the city' (London trade) also carries the snobbery and needs to land. (Lead: Only the referent is fixed; 'from the city' (trade) is kept as the snub)

Edited and then reverted to the baseline wording (net unchanged): 10.10.
