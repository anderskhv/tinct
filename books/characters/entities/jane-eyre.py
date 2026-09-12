BOOK_ID = 'jane-eyre'
CONTENT_VERSION = '2026-09-12.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'jane', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Jane Eyre', 'Miss Eyre'],
        'subtitle': 'An orphan raised by unloving relatives',
        'body': "Plain, poor, and passionately protective of her own sense of justice, she narrates her own life from a friendless childhood at Gateshead onward. Her quiet self-possession unsettles almost everyone who tries to make her feel small.",
    },
    {
        'id': 'mrs-reed', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Mrs. Reed'],
        'subtitle': "Jane's aunt by marriage",
        'body': "Widow of Jane's uncle, who on his deathbed asked her to raise Jane as her own. She resents the obligation and makes her feelings plain, favoring her own three children over her orphaned niece.",
    },
    {
        'id': 'john-reed', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['John Reed'],
        'subtitle': "Jane's bullying cousin",
        'body': "The Reed's spoiled only son, some years older than Jane, who torments her regularly with his mother's tacit approval. A violent scene between them is what finally gets Jane sent away from Gateshead.",
    },
    {
        'id': 'eliza-reed', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Eliza Reed', 'Eliza'],
        'subtitle': "Jane's eldest Reed cousin",
        'body': "Cold and methodical, she keeps strictly to her own rigid daily schedule and her own interests. She and Jane are reunited briefly years later at Gateshead.",
    },
    {
        'id': 'georgiana-reed', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Georgiana Reed', 'Georgiana'],
        'subtitle': "Jane's pretty, spoiled Reed cousin",
        'body': "Vain and self-pitying, she is used to being admired for her looks and resents any attention paid elsewhere. She and Jane get on no better as adults than as children.",
    },
    {
        'id': 'bessie', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Bessie'],
        'subtitle': "The Reeds' nursemaid",
        'body': "Sharp-tempered but not without real kindness, she is one of the few people at Gateshead who ever shows Jane any tenderness, in her rough way. Years later she comes to see Jane off when she leaves for school.",
    },
    {
        'id': 'brocklehurst', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Mr. Brocklehurst'],
        'subtitle': 'The treasurer and manager of Lowood school',
        'body': "A clergyman who preaches austerity and self-denial for the girls in his charge while his own family lives in comfort. Mrs. Reed's warning to him about Jane's supposed deceitfulness follows her to Lowood.",
    },
    {
        'id': 'helen-burns', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Helen Burns', 'Helen'],
        'subtitle': "Jane's friend at Lowood school",
        'body': "An older girl at Lowood whose patient, almost saintly forbearance under unjust punishment baffles and moves Jane. Her frail health makes her a fixture of the infirmary as much as the classroom.",
    },
    {
        'id': 'miss-temple', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Miss Temple'],
        'subtitle': 'The superintendent of Lowood school',
        'body': "Kind and dignified, she does what she can to soften the harshness of Brocklehurst's regime for the girls under her care. She is the closest thing to a protector Jane finds at Lowood.",
    },
    {
        'id': 'miss-scatcherd', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Miss Scatcherd'],
        'subtitle': 'A harsh teacher at Lowood',
        'body': "Quick to punish Helen Burns for small lapses in front of the whole class. Her severity is part of what Jane cannot forgive on her friend's behalf.",
    },
    {
        'id': 'rochester', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Mr. Rochester', 'Edward Rochester', 'Edward Fairfax Rochester'],
        'subtitle': 'The master of Thornfield Hall',
        'body': "Blunt, moody, and considerably Jane's senior, he owns the house where she takes a position as governess. He has traveled widely and returned to Thornfield carrying more history than he is willing to explain.",
    },
    {
        'id': 'adele', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Adele Varens', 'Adèle'],
        'subtitle': "Jane's young pupil at Thornfield",
        'body': "A lively French girl under Rochester's guardianship, whom Jane is engaged to teach. Her parentage is a subject Rochester speaks of only reluctantly.",
    },
    {
        'id': 'mrs-fairfax', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Mrs. Fairfax'],
        'subtitle': 'The housekeeper at Thornfield Hall',
        'body': "A widowed, genteel old lady who manages the household and first welcomes Jane when she arrives. She knows the house and its master's habits better than almost anyone, though not necessarily his secrets.",
    },
    {
        'id': 'grace-poole', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Grace Poole'],
        'subtitle': 'A quiet servant with a room on the third floor',
        'body': "Solitary and given to strong drink, she is blamed for a series of strange occurrences at Thornfield that Rochester never fully explains. Jane cannot make the official account of her quite fit what she has seen and heard.",
    },
    {
        'id': 'blanche-ingram', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Blanche Ingram', 'Miss Ingram'],
        'subtitle': 'A beautiful, well-born society woman',
        'body': "Widely expected to make a brilliant match with Rochester, she treats Jane and other dependents with careless disdain during a house party at Thornfield. Her confidence that the match is settled unsettles Jane more than she admits.",
    },
    {
        'id': 'mason', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Richard Mason', 'Mr. Mason'],
        'subtitle': 'A visitor from the West Indies',
        'body': "His unexpected arrival at Thornfield during the house party visibly shakes Rochester, and an attack he suffers in the night is hushed up rather than explained. He clearly knows something about the house that no one else present does.",
    },
    {
        'id': 'st-john-rivers', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['St. John Rivers', 'St. John'],
        'subtitle': 'A clergyman who takes Jane in',
        'body': "Cold, driven, and set on a missionary life abroad, he and his sisters shelter Jane after she flees Thornfield with nothing. His interest in Jane turns out to run deeper than simple charity, though not in the way she might have expected.",
    },
    {
        'id': 'diana-rivers', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Diana Rivers', 'Diana'],
        'subtitle': "St. John's sister",
        'body': "Warm and intelligent, she and her sister Mary work as governesses and treat Jane with real kindness once she recovers under their roof. She is far less severe than her brother.",
    },
    {
        'id': 'mary-rivers', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Mary Rivers'],
        'subtitle': "St. John's other sister",
        'body': "Gentle and studious like Diana, she shares her sister's household and, eventually, an unexpected piece of family news with Jane. The two sisters quickly become the closest thing to family Jane has known.",
    },
    {
        'id': 'rosamond-oliver', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Rosamond Oliver', 'Miss Oliver'],
        'subtitle': 'A wealthy young heiress in Morton',
        'body': "Pretty and good-natured, she takes a lively interest in the village school Jane comes to teach and, more quietly, in St. John Rivers himself. Whether he will let himself return her feelings is another matter.",
    },
]
