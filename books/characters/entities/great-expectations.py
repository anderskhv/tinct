BOOK_ID = 'great-expectations'
CONTENT_VERSION = '2026-09-12.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'pip', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Pip', 'Philip Pirrip'],
        'subtitle': 'An orphan being raised by hand by his sister',
        'body': "Narrating his own story from childhood, he is a blacksmith's apprentice-to-be on the Kentish marshes with no reason to expect anything unusual from life. A chance encounter in a churchyard, followed by an unexpected piece of fortune, changes that entirely.",
    },
    {
        'id': 'joe', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Joe Gargery', 'Joe'],
        'subtitle': "Pip's brother-in-law, a village blacksmith",
        'body': "Gentle, plain-spoken, and married to Pip's much harsher sister, he is the closest thing to a real friend Pip has at home. He plans for Pip to be his apprentice at the forge, a future Pip will come to see very differently.",
    },
    {
        'id': 'mrs-joe', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Mrs. Joe', "Mrs. Joe Gargery"],
        'subtitle': "Pip's much older sister, who raised him",
        'body': "Married to Joe Gargery, she never lets Pip forget the trouble of raising him \"by hand\" and keeps a household run on sharp words and a cane called Tickler. Her temper dominates the forge kitchen more than her husband's mildness ever could.",
    },
    {
        'id': 'magwitch', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Abel Magwitch', 'Magwitch'],
        'subtitle': 'An escaped convict Pip meets on the marshes',
        'body': "Starving and shackled when Pip stumbles on him among the graves, he terrifies the boy into bringing him food and a file. He is recaptured before long, but the encounter does not end there.",
    },
    {
        'id': 'compeyson', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Compeyson'],
        'subtitle': 'Another escaped convict, Magwitch\'s old enemy',
        'body': "A gentlemanly swindler recaptured on the same marshes the same night as Magwitch, whose hatred of him runs far deeper than a shared prison sentence would explain. His and Magwitch's history predates the churchyard by years.",
    },
    {
        'id': 'miss-havisham', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Miss Havisham'],
        'subtitle': 'A wealthy, reclusive woman at Satis House',
        'body': "Still wearing a decaying wedding dress from a marriage that never happened, she has stopped every clock in her house at the moment she learned she had been jilted. She pays for Pip to come and play at Satis House, ostensibly for her own amusement.",
    },
    {
        'id': 'estella', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Estella'],
        'subtitle': "Miss Havisham's beautiful, cold ward",
        'body': "Raised at Satis House to be as unfeeling as she is lovely, she treats Pip with an offhand contempt from their first meeting that only deepens his fascination with her. Neither of them knows yet where she actually came from.",
    },
    {
        'id': 'jaggers', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Mr. Jaggers', 'Jaggers'],
        'subtitle': 'A formidable London lawyer',
        'body': "Brisk, guarded, and famous for washing his hands of every client's business the moment it is settled, he arrives in the village to tell Pip he has great expectations from an anonymous benefactor. His instructions come with a strict condition: Pip is never to ask who is providing for him.",
    },
    {
        'id': 'wemmick', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Wemmick', 'Mr. Wemmick'],
        'subtitle': "Jaggers's clerk",
        'body': "Dry and businesslike at the office, he turns out to keep an entirely separate, cheerful domestic life at home with his elderly father, whom he calls the Aged. Pip finds him one of the few genuinely warm people in the legal world of London.",
    },
    {
        'id': 'herbert-pocket', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Herbert Pocket', 'Herbert'],
        'subtitle': "Pip's roommate and closest friend in London",
        'body': "A cheerful, perpetually broke young gentleman whom Pip first met years earlier as \"the pale young gentleman\" in Miss Havisham's garden. He shares lodgings with Pip once Pip comes into his fortune and remains loyal to him throughout it.",
    },
    {
        'id': 'matthew-pocket', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Matthew Pocket', 'Mr. Pocket'],
        'subtitle': "Herbert's father, Pip's tutor in London",
        'body': "A well-meaning, somewhat distracted gentleman who takes in young men to educate as gentlemen, Pip among them. His own household runs on chaos despite his best efforts.",
    },
    {
        'id': 'biddy', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Biddy'],
        'subtitle': 'A girl from the village who teaches Pip his letters',
        'body': "Sensible and unpretentious, she helps run the evening school Pip attends before his change of fortune and later comes to look after Mrs. Joe. Pip does not always appreciate her plain good sense as much as he should.",
    },
    {
        'id': 'orlick', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Orlick', 'Dolge Orlick'],
        'subtitle': "A journeyman at Joe's forge",
        'body': "Sullen and resentful, he works alongside Pip and Joe at the forge and nurses a grudge against nearly everyone around him, Pip especially. His temper is the kind that tends to surface at the worst possible moments.",
    },
    {
        'id': 'pumblechook', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Uncle Pumblechook', 'Mr. Pumblechook', 'Pumblechook'],
        'subtitle': "Joe's pompous uncle, a corn-chandler",
        'body': "A blustering, self-important tradesman who takes credit for introducing Pip to Miss Havisham and never lets anyone forget it once Pip's fortune arrives. His manner toward Pip changes markedly with Pip's circumstances.",
    },
    {
        'id': 'bentley-drummle', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Bentley Drummle', 'Drummle'],
        'subtitle': "A sullen, wealthy fellow student in London",
        'body': "Coarse, entitled, and generally disliked among Pip's London acquaintance, he becomes a rival for Estella's attention despite having little to recommend him besides his prospects. Pip cannot understand what she sees in him.",
    },
    {
        'id': 'mr-wopsle', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Mr. Wopsle'],
        'subtitle': "The parish clerk, with theatrical ambitions",
        'body': "A fixture at village readings who eventually leaves for London to try his hand at acting under a stage name. Pip runs into him again, with mixed results, after his own fortunes change.",
    },
    {
        'id': 'startop', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Startop'],
        'subtitle': 'A fellow student of Mr. Pocket\'s',
        'body': "Gentle and a little delicate, he studies alongside Pip and Herbert and later joins them on a river expedition that matters more than it first appears to. He is easy company where Drummle is not.",
    },
    {
        'id': 'mr-wemmicks-father', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['the Aged P.', 'Aged Parent'],
        'subtitle': "Wemmick's elderly, deaf father",
        'body': "Living contentedly with his son in a cottage got up like a tiny fortress, complete with a drawbridge and a nightly gun, he is delighted by any visitor Wemmick brings home. His deafness makes conversation with him mostly a matter of nodding and shouting.",
    },
]
