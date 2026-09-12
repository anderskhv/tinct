BOOK_ID = 'pride-and-prejudice'
CONTENT_VERSION = '2026-09-12.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'elizabeth', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Elizabeth Bennet', 'Miss Elizabeth Bennet', 'Miss Elizabeth', 'Elizabeth', 'Eliza', 'Lizzy'],
        'subtitle': 'The second Bennet daughter',
        'body': "Quick-witted and independent-minded, she is her father's favorite among five sisters with no brother to inherit the family estate. Her sharp first impressions of the people around her, especially one new neighbor, will not all hold up.",
    },
    {
        'id': 'darcy', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Fitzwilliam Darcy', 'Mr. Darcy', 'Darcy'],
        'subtitle': 'A wealthy, reserved gentleman from Derbyshire',
        'body': "Master of the great estate of Pemberley and friend to Mr. Bingley, he arrives in the neighborhood with a fortune that impresses everyone and a manner that impresses almost no one. His pride at the local assembly gives Elizabeth an opinion of him she is slow to give up.",
    },
    {
        'id': 'jane', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Jane Bennet', 'Miss Bennet', 'Jane'],
        'subtitle': 'The eldest Bennet daughter',
        'body': "Gentle and lovely, and inclined to think well of everyone, she is the sister Elizabeth is closest to. Mr. Bingley's evident admiration of her at their first meeting is the talk of the family within the hour.",
    },
    {
        'id': 'bingley', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Charles Bingley', 'Mr. Bingley', 'Bingley'],
        'subtitle': 'An amiable young man newly renting Netherfield',
        'body': "Cheerful, easygoing, and considerably richer than most of his new neighbors, he takes Netherfield Park and is delighted with the local society, particularly Jane Bennet. His good nature makes him easily led by those closest to him, Darcy included.",
    },
    {
        'id': 'mr-bennet', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Mr. Bennet'],
        'subtitle': "Elizabeth's father",
        'body': "A gentleman of modest income whose estate, entailed away from his daughters, must pass to a distant male relation. He retreats from his wife's nerves and his younger daughters' foolishness into his library and a dry, often unhelpful, wit.",
    },
    {
        'id': 'mrs-bennet', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Mrs. Bennet'],
        'subtitle': "Elizabeth's mother",
        'body': "A woman of little sense and considerable nerves, whose life's business is getting her five daughters married. News of a rich new bachelor at Netherfield throws her into transports of scheming and social calls.",
    },
    {
        'id': 'mary', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Mary Bennet', 'Mary'],
        'subtitle': 'The third Bennet daughter',
        'body': "The plainest and most bookish of the sisters, she works hard at accomplishments without much natural gift for them and is fond of moralizing at family gatherings. She keeps largely to her music and her extracts while her younger sisters chase officers.",
    },
    {
        'id': 'kitty', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Kitty Bennet', 'Kitty'],
        'subtitle': 'The fourth Bennet daughter',
        'body': "Easily led and easily offended, she follows her youngest sister Lydia's enthusiasm for the militia officers stationed nearby. She is often caught between childish complaint and a wish to be included in the grown-up excitement.",
    },
    {
        'id': 'lydia', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Lydia Bennet', 'Lydia'],
        'subtitle': 'The youngest Bennet daughter',
        'body': "Tall, high-spirited, and her mother's particular favorite, she is fifteen and entirely absorbed in flirtation with the officers of the local militia. Her boldness has already begun to embarrass her more careful sisters.",
    },
    {
        'id': 'charlotte', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Charlotte Lucas', 'Charlotte'],
        'subtitle': "Elizabeth's close friend and neighbor",
        'body': "Sensible, plain by her own account, and twenty-seven, she is Elizabeth's confidante and the eldest daughter of Sir William Lucas. She takes a far more practical view of marriage than her friend does.",
    },
    {
        'id': 'wickham', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['George Wickham', 'Mr. Wickham', 'Wickham'],
        'subtitle': 'A charming officer newly arrived with the militia',
        'body': "Handsome and easy in conversation, he quickly becomes a favorite in Meryton and tells Elizabeth a story of ill-usage at Darcy's hands that she has no reason yet to doubt. He grew up on the Pemberley estate, the son of old Mr. Darcy's steward.",
    },
    {
        'id': 'caroline-bingley', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Caroline Bingley', 'Miss Bingley'],
        'subtitle': "Mr. Bingley's sister",
        'body': "Elegant, well-dowered, and openly hoping to secure Darcy for herself, she treats the Bennets with a thin civility that barely covers her contempt. She is quick to point out Elizabeth's inferior connections whenever the chance arises.",
    },
    {
        'id': 'mrs-hurst', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Mrs. Hurst'],
        'subtitle': "Mr. Bingley's married sister",
        'body': "Caroline's elder sister, married to a gentleman of more fashion than fortune. She generally echoes Caroline's opinions in company.",
    },
    {
        'id': 'mr-hurst', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Mr. Hurst'],
        'subtitle': "Mrs. Hurst's husband",
        'body': "An indolent gentleman more interested in cards and his dinner than in conversation. He appears mainly as background at Netherfield gatherings.",
    },
    {
        'id': 'collins', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Mr. Collins', 'William Collins'],
        'subtitle': "A clergyman and cousin who will inherit Longbourn",
        'body': "Pompous, obsequious, and immensely proud of his patroness, he arrives at Longbourn intending, with an eye to family harmony, to marry one of his cousins. His letters and his conversation are equally full of himself.",
    },
    {
        'id': 'lady-catherine', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Lady Catherine de Bourgh', 'Lady Catherine'],
        'subtitle': "Mr. Collins's noble patroness, Darcy's aunt",
        'body': "Wealthy, imperious, and accustomed to being obeyed in her own parish and well beyond it, she rules Rosings Park and takes a proprietary interest in Darcy's future. Mr. Collins speaks of her condescension with something close to awe.",
    },
    {
        'id': 'sir-william-lucas', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Sir William Lucas'],
        'subtitle': "Charlotte's father, a former tradesman knighted in office",
        'body': "Once in trade, now retired on the strength of his knighthood, he is a fixture of easy, formal courtesy at every local gathering. He talks readily of his presentation at court.",
    },
    {
        'id': 'lady-lucas', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Lady Lucas'],
        'subtitle': "Charlotte's mother and Mrs. Bennet's friend and rival",
        'body': "A good, unpretentious neighbor to the Bennets, and a valuable one to Mrs. Bennet, who trades news and grievances with her constantly. Her chief concern is seeing her own children settled.",
    },
    {
        'id': 'georgiana', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Georgiana Darcy', 'Miss Darcy'],
        'subtitle': "Darcy's much younger sister",
        'body': "Shy and accomplished, she is under her brother's guardianship and, by reputation among Darcy's acquaintance, exceedingly proud, though those who actually meet her generally find otherwise. Wickham's history with her is not something Darcy speaks of lightly.",
    },
    {
        'id': 'mrs-gardiner', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Mrs. Gardiner'],
        'subtitle': "Mrs. Bennet's sister-in-law",
        'body': "Sensible and affectionate, she is a favorite aunt to the elder Bennet girls and a far steadier presence than their own mother. She and her husband often take Jane or Elizabeth along on their travels.",
    },
    {
        'id': 'mr-gardiner', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Mr. Gardiner'],
        'subtitle': "Mrs. Bennet's brother, a London tradesman",
        'body': "A gentlemanly, well-informed man whose trade is beneath the notice of some of his relations but who is worth more, in Elizabeth's eyes, than most of them. He and his wife invite Elizabeth to travel with them one summer.",
    },
    {
        'id': 'colonel-fitzwilliam', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Colonel Fitzwilliam'],
        'subtitle': "Darcy's cousin, a younger son of an earl",
        'body': "Agreeable and well-bred, without his cousin's fortune, he visits Rosings alongside Darcy and finds Elizabeth easy company during her stay there. He speaks more freely than Darcy about the family's affairs.",
    },
    {
        'id': 'phillips-household', 'kind': 'group', 'storyRole': 'reference',
        'aliases': ['Mr. Philips', 'Mrs. Philips'],
        'subtitle': "Mrs. Bennet's sister and brother-in-law in Meryton",
        'body': "An attorney's household in the nearby town, a regular stop for the Bennet girls and a useful source of local gossip about the officers. Their dinners are where much of the militia news first travels.",
    },
]
