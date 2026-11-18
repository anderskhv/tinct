"""Pass F: independent editorial review fixes (2026-10-02). LIVE unit, 0-based paragraph.
One-shot: every old substring is asserted to occur exactly once."""
from edits import apply

EDITS = [
    # BLOCKING 1: Caleb Garth's "deuce"
    (25, 51, 'It’s a hundred and ten pounds, damn it!', 'It’s a hundred and ten pounds, the deuce take it!'),
    (25, 67, '“Damn the bill! I wish', '“Deuce take the bill! I wish'),
    (41, 90, '“The devil knows,” Caleb replied. He never referred knowledge of discreditable conduct to any higher authority than the devil.',
             '“Deuce knows,” Caleb replied. He never referred knowledge of discreditable conduct to any higher authority than the deuce.'),
    (57, 32, 'But—damn it—this', 'But—deuce take it—this'),
    (57, 98, '“Damn it!” he growled.', '“The deuce!” he growled.'),
    # BLOCKING 2
    (25, 2, 'The large Mrs. Garth family', 'The large Garth family'),
    # SHOULD-FIX 3: original mild oaths
    (9, 12, '“Damn you handsome young fellows!', '“Confound you handsome young fellows!'),
    (9, 12, 'They admire you half as much as you admire yourselves.', 'They don’t admire you half as much as you admire yourselves.'),
    (15, 43, '“Damn John Waule!', '“Confound John Waule!'),
    (17, 9, '“Damn your reforms!”', '“Hang your reforms!”'),
    (19, 3, '“Damn their petty politics!”', '“Confound their petty politics!”'),
    (19, 22, 'a damned sight better', 'a devilish deal better'),
    (20, 13, '“Damn it, Naumann!', '“Confound you, Naumann!'),
    (23, 39, 'a damned bloodless, pedantic fool', 'a cursed bloodless, pedantic fool'),
    (38, 6, 'a damned old miser', 'a cursed old miser'),
    (44, 16, 'Damn Casaubon!', 'Confound Casaubon!'),
    (47, 19, 'has damned good reasons', 'has devilish good reasons'),
    (52, 32, '“Damn your ideas!', '“Blast your ideas!'),
    (52, 33, '“Damn your ideas!', '“Blast your ideas!'),
    (54, 44, 'New York treated me damned badly.', 'New York treated me confoundedly badly.'),
    (54, 54, 'Then, damn it, I lost', 'Then, hang it, I lost'),
    (54, 54, 'a damned tax form', 'a confounded tax form'),
    (57, 24, 'you damned fools?', 'you confounded fools?'),
    (57, 114, '“Board be damned!”', '“Board be hanged!”'),
    (61, 14, 'such damned stuff', 'such blasted stuff'),
    (64, 9, 'Damn it, you can’t help', 'Hang it, you can’t help'),
    (72, 19, 'Any damned foreign blood', 'Any cursed foreign blood'),
    # 4-6, 8
    (88, 24, 'the many who lived faithfully out of sight and now rest in graves no one visits.',
             'the many who lived faithfully a hidden life, and rest in unvisited tombs.'),
    (41, 93, 'and no eye can discover where the seed came from.”', 'and no eye can see whence came the seed thereof.”'),
    (33, 44, '“Almost four centuries have passed since the events described in the following chapters occurred on the Continent.”',
             '“The course of four centuries has well-nigh elapsed since the series of events which are related in the following chapters took place on the Continent.”'),
    (57, 58, 'No forever saying,', 'Don’t be forever saying,'),
    # 7: ALL-CAPS emphasis -> italic
    (15, 3, 'say you ARE a young', 'say you _are_ a young'),
    (15, 29, 'HE won’t', '_He_ won’t'),
    (15, 29, 'even if you ARE the eldest', 'even if you _are_ the eldest'),
    (15, 47, '“ROSY!”', '“_Rosy!_”'),
    (15, 67, 'he COULD be better', 'he _could_ be better'),
    (17, 8, 'if HE had his way', 'if he had _his_ way'),
    (18, 7, 'impression of ME.', 'impression of _me_.'),
    (19, 42, 'too strong for ME,', 'too strong for _me_,'),
    (20, 15, 'I DON’T believe', 'I _don’t_ believe'),
    (21, 13, 'do YOU care', 'do _you_ care'),
    (21, 31, 'My judgment WAS superficial', 'My judgment _was_ superficial'),
    (23, 82, '“You ARE a poem.', '“You _are_ a poem.'),
    (25, 16, 'Let ME tell it', 'Let _me_ tell it'),
    (25, 63, 'I HAD scraped', 'I _had_ scraped'),
    (26, 27, 'You MUST see him', 'You _must_ see him'),
    # Nits
    (2, 4, 'unsound opinions', 'feeble opinions'),
    (2, 7, 'remained very childish', 'remained very childlike'),
    (4, 41, 'carry out all her ideas.', 'carry out all her notions.'),
    (4, 41, 'I can’t bear ideas.', 'I can’t bear notions.'),
    (49, 53, 'the imagined bond of marriage, not its actual requirements.', 'the ideal and not the real yoke of marriage.'),
    (41, 51, 'Mr. Farebrother once called her “Mary,” but his tact now led him',
             'Mr. Farebrother used to call her “Mary” rather than “Miss Garth,” but his tact led him'),
    (2, 13, 'marvellous', 'marvelous'),
    (5, 31, 'marvellous', 'marvelous'),
    (41, 75, 'marvellous', 'marvelous'),
    (46, 36, 'marvellous', 'marvelous'),
    (4, 45, 'wilful', 'willful'),
    (42, 6, 'travellers’', 'travelers’'),
    (57, 41, '“Aye!”', '“Aw!”'),
]

if __name__ == '__main__':
    apply(EDITS)
