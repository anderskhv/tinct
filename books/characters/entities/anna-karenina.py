BOOK_ID = 'anna-karenina'
CONTENT_VERSION = '2026-09-12.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'anna', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Anna Arkadyevna Karenina', 'Anna Arkadyevna', 'Anna Karenina'],
        'subtitle': "Stepan Oblonsky's sister, wife of a senior official",
        'body': "Married young to a much older, prominent government official, she is summoned from St. Petersburg to Moscow to help patch up her brother's troubled marriage. Her arrival there, and a meeting on the same platform, will unsettle her own life far more than she expects.",
    },
    {
        'id': 'karenin', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Alexey Alexandrovitch Karenin', 'Alexey Alexandrovitch', 'Karenin'],
        'subtitle': "Anna's husband, a high government official",
        'body': "Precise, dutiful, and considerably older than his wife, he has built a career on careful, controlled competence in St. Petersburg. He is not a man given to noticing what is happening under his own roof until it can no longer be avoided.",
    },
    {
        'id': 'vronsky', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Alexey Kirillovitch Vronsky', 'Count Vronsky', 'Vronsky'],
        'subtitle': 'A wealthy, fashionable cavalry officer',
        'body': "Handsome, charming, and used to getting what he wants without much effort, he has been paying attentions to young Kitty Shtcherbatskaya before a chance meeting at a Moscow railway station changes the direction of his interest entirely. His mother is on the same train Anna arrives by.",
    },
    {
        'id': 'stiva', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Stepan Arkadyevitch Oblonsky', 'Stepan Arkadyevitch', 'Stiva', 'Oblonsky'],
        'subtitle': "Anna's brother",
        'body': "Easygoing, likable, and chronically unfaithful, he has just been caught by his wife Dolly in an affair with the family's former governess. His sister Anna is sent for from St. Petersburg to help smooth things over.",
    },
    {
        'id': 'dolly', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Darya Alexandrovna Oblonskaya', 'Darya Alexandrovna', 'Dolly'],
        'subtitle': "Stiva's wife, worn down by domestic life",
        'body': "Devoted to her children and exhausted by years of managing a household on limited means, she has just discovered her husband's infidelity when the novel opens. Her sister Kitty and sister-in-law Anna both lean on her for a kind of plain good sense neither of their own lives has much room for.",
    },
    {
        'id': 'kitty', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Princess Katerina Shtcherbatskaya', 'Kitty'],
        'subtitle': "Dolly's younger sister",
        'body': "Young, pretty, and just out in society, she is expecting a proposal from Vronsky and has already refused one from Konstantin Levin, an old family friend. Both men's futures turn out to hinge more on her than either expected.",
    },
    {
        'id': 'levin', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Konstantin Dmitrievitch Levin', 'Konstantin Levin', 'Levin'],
        'subtitle': "A landowner devoted to his estate",
        'body': "Awkward in society and most at home working alongside his own peasants in the country, he comes to Moscow specifically to propose to Kitty, whom he has loved for years. Her answer sends him back to his estate to think through rather more than farming.",
    },
    {
        'id': 'nikolay-levin', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Nikolay Dmitrievitch Levin', 'Nikolay Levin'],
        'subtitle': "Konstantin Levin's elder brother",
        'body': "Once brilliant and promising, he has since ruined his health and his prospects living with a former prostitute he calls his wife, estranged from most of the family. His brother Konstantin cannot quite bring himself to give up on him.",
    },
    {
        'id': 'koznishev', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Sergey Ivanovitch Koznishev', 'Sergey Ivanovitch'],
        'subtitle': "Konstantin Levin's half brother, a well-known writer",
        'body': "Distinguished, intellectual, and considerably more comfortable in society than Konstantin, he has made a public name for himself in Moscow that his younger brother regards with a mix of pride and impatience. His own private life turns out to be less settled than his public reputation.",
    },
    {
        'id': 'seryozha', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Seryozha'],
        'subtitle': "Anna and Karenin's young son",
        'body': "Still a small boy, adored by his mother, who is torn between her feelings for him and the rest of her life once it grows complicated. He does not understand the tension building around him.",
    },
    {
        'id': 'countess-vronskaya', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Countess Vronskaya'],
        'subtitle': "Vronsky's mother",
        'body': "A fashionable older woman traveling on the same train Anna takes to Moscow, glad of the company for the journey. Her opinion of her son's romantic entanglements shifts considerably over the course of the story.",
    },
    {
        'id': 'betsy', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Princess Betsy Tverskaya', 'Betsy Tverskaya', 'Betsy'],
        'subtitle': "A fashionable St. Petersburg cousin of Vronsky's",
        'body': "Worldly and entirely unbothered by the private arrangements of her social circle, she is one of the first in St. Petersburg society to notice, and to encourage, the direction of Anna and Vronsky's acquaintance. Her own set operates by rules quite different from Karenin's.",
    },
    {
        'id': 'lidia-ivanovna', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Countess Lidia Ivanovna', 'Lidia Ivanovna'],
        'subtitle': "A pious countess close to Karenin",
        'body': "Devoted to religious enthusiasm and to Karenin's cause once his marriage begins to unravel, she becomes an increasingly important influence on his household and his opinions. Anna finds her interference in the family's affairs hard to bear.",
    },
    {
        'id': 'yashvin', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Yashvin'],
        'subtitle': "A cavalry officer, Vronsky's friend",
        'body': "A hardened gambler and duelist among Vronsky's regimental circle, blunt and unsentimental in his judgments of other people. He remains one of the few friends who sticks by Vronsky once his situation with Anna becomes public.",
    },
    {
        'id': 'veslovsky', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Vasenka Veslovsky', 'Veslovsky'],
        'subtitle': "A cheerful young society acquaintance",
        'body': "Easy, flirtatious, and entirely unaware of the offense he causes, he is a distant relation of Stiva's who joins a country house party at Levin's estate. His attentions to Kitty provoke a reaction from Levin well out of proportion to anything Veslovsky intends.",
    },
    {
        'id': 'sviazhsky', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Sviazhsky'],
        'subtitle': "A neighboring landowner and marshal of nobility",
        'body': "Hospitable and politically active in provincial affairs, he hosts Levin and other landowners for discussions of agriculture and local government that Levin finds by turns fascinating and frustrating. He represents a kind of practical, sociable landowning Levin cannot quite manage himself.",
    },
    {
        'id': 'katavasov', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Katavasov'],
        'subtitle': "A university professor, Levin's old friend",
        'body': "An academic acquaintance from Levin's student days who visits the estate and brings news and opinions from intellectual Moscow circles. He and Levin's brother Koznishev share a taste for public debate that Levin himself does not.",
    },
    {
        'id': 'agafea', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Agafea Mihalovna'],
        'subtitle': "An old servant in the Levin household",
        'body': "Having looked after Levin's mother before him, she now runs his household with old-fashioned devotion and firm opinions about how things ought to be done. She stays on even as the household around her changes.",
    },
    {
        'id': 'princess-shtcherbatskaya', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Princess Shtcherbatskaya'],
        'subtitle': "Kitty and Dolly's mother",
        'body': "Anxious over her youngest daughter's marriage prospects, she weighs Vronsky's more brilliant match against Levin's steadier, less fashionable one. Her worry shapes much of Kitty's early hesitation.",
    },
]
