BOOK_ID = 'don-quixote'
CONTENT_VERSION = '2026-09-12.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'don-quixote', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Don Quixote'],
        'subtitle': 'An aging country gentleman turned self-made knight errant',
        'body': "Having read himself half out of his wits on old romances of chivalry, he decides he is destined to revive knight errantry in his own person, dons a suit of rusty armor, and rides out to right the world's wrongs. Almost no one he meets sees the world quite the way he does.",
    },
    {
        'id': 'sancho', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Sancho Panza', 'Sancho'],
        'subtitle': 'A poor farmer who becomes his squire',
        'body': "Practical, hungry for the governorship he has been promised, and full of homely proverbs, he agrees to accompany Don Quixote on the strength of vague promises of an island to govern. His plain good sense is a constant, comic counterweight to his master's fancies.",
    },
    {
        'id': 'dulcinea', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Dulcinea del Toboso'],
        'subtitle': "Don Quixote's imagined lady",
        'body': "In reality a robust farm girl from a neighboring village whom Don Quixote has never properly courted, he has elevated her in his own mind into a peerless lady worthy of a knight's devotion. Every feat he attempts is dedicated, at least in his own account, to her honor.",
    },
    {
        'id': 'rocinante', 'kind': 'creature', 'storyRole': 'supporting',
        'aliases': ['Rocinante'],
        'subtitle': "Don Quixote's aged, bony horse",
        'body': "Once an ordinary farm hack, he is renamed and elevated by Don Quixote to a status he cannot possibly live up to as a knight's noble steed. He carries his master through every misadventure with more patience than speed.",
    },
    {
        'id': 'the-curate', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['the curate'],
        'subtitle': "The village priest, Don Quixote's friend",
        'body': "Concerned for Don Quixote's sanity, he helps examine and burn the dangerous romances from his library and later joins schemes to lure the wandering knight safely home. His plain sense makes him one of the more level heads among Don Quixote's acquaintance.",
    },
    {
        'id': 'nicholas', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Master Nicholas'],
        'subtitle': 'The village barber, a friend of the curate',
        'body': "He joins the curate in condemning Don Quixote's library of chivalric romances and later takes part in disguises meant to bring the knight back home. His barber's basin becomes, in Don Quixote's eyes, an enchanted helmet.",
    },
    {
        'id': 'cardenio', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Cardenio'],
        'subtitle': 'A distraught young man living wild in the mountains',
        'body': "Driven half mad by a betrayal in love, he is discovered by Don Quixote and Sancho living among the crags of the Sierra Morena. His tangled story of a broken engagement turns out to connect to several other characters before long.",
    },
    {
        'id': 'luscinda', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Luscinda'],
        'subtitle': "Cardenio's intended bride",
        'body': "Promised to Cardenio before another man's interference disrupted the match, she is at the center of the story he tells in his wild mountain grief. Her own fate proves less settled than Cardenio fears.",
    },
    {
        'id': 'dorothea', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Dorothea'],
        'subtitle': 'A resourceful young woman with her own grievance',
        'body': "Disguised and traveling alone after a broken promise of marriage, she falls in with the curate's party and cleverly plays the part of a distressed princess to help lure Don Quixote home. Her real story turns out to be tied to Cardenio's as closely as anyone's.",
    },
    {
        'id': 'don-fernando', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Don Fernando'],
        'subtitle': 'A wellborn young man at the center of both broken engagements',
        'body': "His interference in Cardenio's betrothal to Luscinda, and his own earlier promise to Dorothea, have left several people's lives in disarray. An unlikely reunion at a country inn forces a reckoning nobody quite expected.",
    },
    {
        'id': 'teresa-panza', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Teresa Panza'],
        'subtitle': "Sancho's wife",
        'body': "Skeptical of her husband's talk of islands and governorships, she nonetheless enjoys imagining what his new position might mean for the family back home. Her letters to Sancho are as practical as she is.",
    },
    {
        'id': 'samson-carrasco', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Samson Carrasco'],
        'subtitle': "A university-educated young man from Don Quixote's village",
        'body': "Clever and a little mischievous, he has read the published account of Don Quixote's first sally and takes a close, teasing interest in his neighbor's further adventures. His later schemes to bring the old knight home take a considerably more elaborate turn than the curate's.",
    },
    {
        'id': 'the-duke-and-duchess', 'kind': 'group', 'storyRole': 'major',
        'aliases': ['the duke', 'the duchess'],
        'subtitle': 'A wealthy noble couple who host Don Quixote and Sancho',
        'body': "Having read the published account of Don Quixote's earlier adventures, they welcome the knight and his squire to their country estate purely for their own amusement. Their elaborate, costly pranks give Don Quixote the grandest hospitality of his travels, and Sancho his long-promised governorship.",
    },
    {
        'id': 'altisidora', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Altisidora'],
        'subtitle': "One of the duchess's waiting-women",
        'body': "Playing along with her mistress's elaborate joke, she pretends to be lovesick for Don Quixote, much to his flustered, chivalrous discomfort. The prank is carried on with more commitment than Don Quixote ever suspects.",
    },
    {
        'id': 'maritornes', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Maritornes'],
        'subtitle': 'A rough-mannered servant girl at a country inn',
        'body': "Working at an inn Don Quixote mistakes for a castle, she becomes tangled in one of his most farcical misadventures, mistaken in the dark for a noble lady come to visit him. The inn's other guests find the whole scene considerably funnier than she does.",
    },
    {
        'id': 'gines-de-pasamonte', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Gines de Pasamonte'],
        'subtitle': 'A hardened galley slave freed by Don Quixote',
        'body': "One of a chain of convicts Don Quixote frees on the theory that no one should be forced into anything against his will, he repays the favor with considerably less gratitude than the knight expects. He resurfaces later under a different guise entirely.",
    },
    {
        'id': 'basilio', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Basilio'],
        'subtitle': 'A poor young man in love with Quiteria',
        'body': "Athletic and inventive, he has loved Quiteria since childhood but watches her promised instead to a wealthier suitor, Camacho. His plan for the wedding day is considerably more dramatic than a simple protest.",
    },
    {
        'id': 'quiteria', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Quiteria'],
        'subtitle': 'A beautiful village girl about to be married',
        'body': "Caught between her family's preference for the wealthy Camacho and her own long attachment to Basilio, she is the center of a wedding that does not go entirely to her father's plan. Don Quixote and Sancho arrive just in time to witness it.",
    },
    {
        'id': 'camacho', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Camacho'],
        'subtitle': 'A wealthy suitor throwing an extravagant wedding',
        'body': "Confident in his fortune and his claim on Quiteria, he spares no expense preparing a wedding feast famous throughout the district. Don Quixote and Sancho happen to be passing through on the very day of the ceremony.",
    },
    {
        'id': 'niece', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['the niece'],
        'subtitle': "Don Quixote's niece",
        'body': "Living in his household, she is as alarmed as anyone by her uncle's obsession with chivalric romances and takes an active hand in the plan to burn his library. She worries constantly over what his wandering will do to the family's reputation.",
    },
    {
        'id': 'housekeeper', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['the housekeeper'],
        'subtitle': "Don Quixote's housekeeper",
        'body': "Long in his service and thoroughly exasperated by his fixation on knight errantry, she is just as eager as the niece to see his library and his armor disappear for good. Her complaints to the curate help set the book-burning in motion.",
    },
]
