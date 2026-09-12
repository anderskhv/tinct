# -*- coding: utf-8 -*-
BOOK_ID = 'ulysses'
CONTENT_VERSION = '2026-09-12.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'stephen', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Stephen Dedalus', 'Stephen'],
        'subtitle': 'A young teacher and aspiring writer',
        'body': "Living in a rented tower outside Dublin with an acquaintance he does not entirely trust, he is still mourning his mother and unsettled about his future. His morning begins with a shave, a swim invitation he declines, and a walk into the city to teach a history lesson he can barely bring himself to care about.",
    },
    {
        'id': 'bloom', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Leopold Bloom', 'Bloom'],
        'subtitle': 'A Dublin advertising canvasser',
        'body': "Methodical, curious, and quietly out of step with the men around him, he spends his day moving through the city on ordinary errands while larger private worries sit just beneath the surface. His wife has an appointment that afternoon he would rather not think about too closely.",
    },
    {
        'id': 'molly', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Molly Bloom', 'Molly', 'Marion Bloom'],
        'subtitle': "Leopold Bloom's wife, a singer",
        'body': "Still in bed as the day begins, she is preparing for a concert tour and expecting a visit that afternoon from the man managing it. Her own thoughts on her marriage, her past, and the day ahead run through much of the novel from a distance before they finally take center stage.",
    },
    {
        'id': 'mulligan', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Buck Mulligan', 'Malachi Mulligan', 'Mulligan'],
        'subtitle': "A medical student sharing Stephen's tower",
        'body': "Boisterous, mocking, and irreverent about nearly everything Stephen holds seriously, he opens the novel shaving on the tower's roof and needling his companion about his dead mother. His friendship with Stephen is real but plainly strained.",
    },
    {
        'id': 'haines', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Haines'],
        'subtitle': 'An English visitor staying in the tower',
        'body': "Collecting local color and folklore with an outsider's polite curiosity, he is Mulligan's guest and an unwelcome complication in Stephen's already crowded morning. His interest in Ireland is more scholarly than the two Irishmen he is staying with entirely trust.",
    },
    {
        'id': 'boylan', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Blazes Boylan', 'Boylan'],
        'subtitle': "A confident concert promoter",
        'body': "Well dressed and pleased with himself, he is arranging Molly Bloom's upcoming singing tour and has an appointment at the Blooms' house that afternoon. Leopold Bloom's day is shadowed by exactly what that visit is likely to involve.",
    },
    {
        'id': 'simon-dedalus', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Simon Dedalus'],
        'subtitle': "Stephen's father",
        'body': "Witty, improvident, and given to singing and reminiscing in Dublin's pubs rather than managing the family's finances, he moves through his own circuit of the city on the same day as his son. His affection for Stephen does not translate into much practical help.",
    },
    {
        'id': 'martin-cunningham', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Martin Cunningham'],
        'subtitle': "A sympathetic colleague of Bloom's",
        'body': "Tactful and well-liked, he organizes a funeral party that Bloom joins that morning and generally smooths over the small frictions among the men in the carriage. He is one of the few in the group who treats Bloom with unaffected kindness.",
    },
    {
        'id': 'dignam', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Paddy Dignam', 'Dignam'],
        'subtitle': 'A Dublin acquaintance who has just died',
        'body': "His funeral, which Bloom and several others attend that morning, gives the day one of its few fixed appointments. He never appears alive in the story, only in the talk and memories of the men who knew him.",
    },
    {
        'id': 'gerty', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Gerty MacDowell', 'Gerty'],
        'subtitle': 'A young woman on Sandymount strand',
        'body': "Romantic and self-conscious about her appearance, she sits on the beach with friends in the evening, aware of a man watching her from a distance without knowing anything else about him. Her private daydreams take up a long stretch of the day's later hours.",
    },
    {
        'id': 'milly', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Milly Bloom', 'Milly'],
        'subtitle': "Leopold and Molly Bloom's teenage daughter",
        'body': "Away from home working at a photographer's shop in another town, she is present in the novel mainly through a letter and her parents' thoughts of her. Her absence is quietly felt in the Bloom household.",
    },
    {
        'id': 'mrs-breen', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Mrs Breen', 'Josie Breen'],
        'subtitle': 'An old acquaintance of Bloom\'s, married to Denis Breen',
        'body': "Bloom runs into her on the street and they exchange news, including some concern about her husband's odd behavior lately. She was, briefly, someone Bloom might have courted in his younger days.",
    },
    {
        'id': 'denis-breen', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Denis Breen'],
        'subtitle': "Mrs Breen's husband, unsettled by an anonymous postcard",
        'body': "Convinced he has been insulted by a cryptic message someone sent him, he wanders Dublin trying to bring a legal case over it, much to his wife's embarrassment. His obsession becomes a running joke among the men who see him pass.",
    },
    {
        'id': 'lenehan', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Lenehan'],
        'subtitle': 'A hanger-on in the newspaper and pub crowd',
        'body': "Quick with a pun and a racing tip, he circulates through the same Dublin haunts as Bloom and Stephen on their overlapping day. His company is entertaining company more often than it is trustworthy.",
    },
    {
        'id': 'omolloy', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['O’Molloy', "O'Molloy"],
        'subtitle': 'A once-promising barrister fallen on hard times',
        'body': "Charming and eloquent, he still moves easily through the newspaper offices and courts of Dublin despite finances that no longer match his manner. He is one of several men Bloom encounters over money that afternoon.",
    },
    {
        'id': 'myles-crawford', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Myles Crawford'],
        'subtitle': 'The blustering editor of a Dublin newspaper',
        'body': "Loud, unpredictable, and quick to make and unmake decisions about the paper, he presides over the newspaper office Bloom visits on business that morning. Stephen also passes through the same office later in the day.",
    },
    {
        'id': 'mr-deasy', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Garrett Deasy', 'Mr Deasy'],
        'subtitle': 'The headmaster where Stephen teaches',
        'body': "Opinionated and pleased with his own theories of history and money, he pays Stephen's wages and gives him a letter he wants placed in the newspapers. Stephen listens to his views with visible, private impatience.",
    },
    {
        'id': 'nosey-flynn', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Nosey Flynn'],
        'subtitle': 'A pub regular fond of gossip',
        'body': "Encountered by Bloom over a midday drink, he trades local news and idle speculation about other Dubliners' business. His conversation is as unhurried as his lunchtime company expects.",
    },
    {
        'id': 'almidano-artifoni', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Almidano Artifoni'],
        'subtitle': "A singing teacher, an acquaintance of Stephen's family",
        'body': "An Italian voice instructor who encourages Stephen, in a brief street encounter, to think again about a singing career rather than the uncertain path he is currently on. Their conversation is warm but does not change Stephen's course.",
    },
]
