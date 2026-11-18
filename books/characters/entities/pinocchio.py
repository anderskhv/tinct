BOOK_ID = 'pinocchio'
CONTENT_VERSION = '2026-11-10.1'
# Tinct has no English original for this book; the only English edition is Tinct Modern English.
EDITIONS = ['modern-en']

# Aliases are matched exactly (word-bounded) against the modern-en edition by books/characters/build_generic.py.
# Cards are first-encounter identity only: no later plot development and no ending.
ENTITIES = [
    {
        'id': 'pinocchio', 'kind': 'person', 'storyRole': 'central', 'displayName': 'Pinocchio',
        'aliases': ['Pinocchio'],
        'subtitle': 'A wooden puppet',
        'body': "A puppet Geppetto carves from a log that could already talk and cry. He is quick, cheeky and easily led, makes good resolutions and forgets them, and when he lies his nose grows.",
    },
    {
        'id': 'geppetto', 'kind': 'person', 'storyRole': 'central', 'displayName': 'Geppetto',
        'aliases': ['Geppetto', 'Polendina'],
        'subtitle': "A poor old woodcarver, Pinocchio's maker",
        'body': "A lively, quick-tempered old man in a yellow wig, whom the neighbourhood boys tease by calling him Polendina, after a yellow cornmeal porridge. He carves the puppet to earn a living with him and treats him as his son.",
    },
    {
        'id': 'master-cherry', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Master Cherry',
        'aliases': ['Master Cherry', 'Master Antonio'],
        'subtitle': 'An old carpenter',
        'body': "A carpenter whose real name is Master Antonio, nicknamed for the shiny red tip of his nose. The talking piece of wood turns up in his workshop first, and it frightens him so badly that he gives it away.",
    },
    {
        'id': 'talking-cricket', 'kind': 'creature', 'storyRole': 'major', 'displayName': 'The Talking Cricket',
        'aliases': ['Talking Cricket', 'Cricket'],
        'subtitle': "A cricket who lives in Geppetto's room",
        'body': "An old cricket who says he has lived in Geppetto's room for more than a hundred years. He tells Pinocchio plainly what happens to boys who disobey and run away, which the puppet does not want to hear.",
    },
    {
        'id': 'fairy', 'kind': 'person', 'storyRole': 'central', 'displayName': 'The Fairy with the blue hair',
        'aliases': ['Fairy', 'Fairy with the blue hair', 'Girl', 'Girl with the blue hair', 'blue-haired Girl'],
        'subtitle': 'A Fairy who lives in a little white house in the wood',
        'body': "A pale girl with blue hair at the window of a house in the wood, who is in fact a good Fairy. She takes the puppet in when he is in danger and treats him with both kindness and firmness.",
    },
    {
        'id': 'fox', 'kind': 'creature', 'storyRole': 'major', 'displayName': 'The Fox',
        'aliases': ['Fox'],
        'subtitle': 'A Fox who limps along the road',
        'body': "A Fox who appears to be lame in one foot and travels with a Cat. He is friendly, flattering and very interested in the gold coins Pinocchio is carrying home.",
    },
    {
        'id': 'cat', 'kind': 'creature', 'storyRole': 'major', 'displayName': 'The Cat',
        'aliases': ['Cat'],
        'subtitle': "The Fox's companion",
        'body': "A Cat who appears to be blind in both eyes and leans on the Fox as they walk. She mostly repeats whatever the Fox says.",
    },
    {
        'id': 'fire-eater', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Fire-Eater',
        'aliases': ['Fire-Eater'],
        'subtitle': 'The owner of the puppet theatre',
        'body': "The puppet master who runs the theatre, with a huge black beard that covers his chest and legs like an apron. He looks terrifying, but he is not really a bad man, and when he is moved he sneezes.",
    },
    {
        'id': 'harlequin', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Harlequin',
        'aliases': ['Harlequin'],
        'subtitle': 'A puppet in the travelling theatre',
        'body': "One of the stock comic characters of the puppet theatre, who recognises Pinocchio from the stage and greets him as a brother.",
    },
    {
        'id': 'punchinello', 'kind': 'person', 'storyRole': 'supporting', 'displayName': 'Punchinello',
        'aliases': ['Punchinello'],
        'subtitle': 'A puppet in the travelling theatre',
        'body': "Harlequin's quarrelsome partner on the stage of the puppet theatre.",
    },
    {
        'id': 'medoro', 'kind': 'creature', 'storyRole': 'supporting', 'displayName': 'Medoro',
        'aliases': ['Medoro'],
        'subtitle': "The Fairy's Poodle",
        'body': "A magnificent Poodle in a coachman's uniform who serves the Fairy and walks upright on his hind legs, exactly like a man.",
    },
    {
        'id': 'melampo', 'kind': 'creature', 'storyRole': 'reference', 'displayName': 'Melampo',
        'aliases': ['Melampo'],
        'subtitle': "A farmer's watchdog",
        'body': "The dog who used to guard a farmer's henhouse at night.",
    },
    {
        'id': 'pigeon', 'kind': 'creature', 'storyRole': 'supporting', 'displayName': 'The Pigeon',
        'aliases': ['Pigeon'],
        'subtitle': 'A large Pigeon who has seen Geppetto',
        'body': "A large Pigeon who calls down to Pinocchio from the sky, with news of an old man making himself a little boat to cross the ocean.",
    },
    {
        'id': 'snail', 'kind': 'creature', 'storyRole': 'supporting', 'displayName': 'The Snail',
        'aliases': ['Snail'],
        'subtitle': "A Snail in the Fairy's service",
        'body': "A large Snail with a little lamp on her head who answers the door of the Fairy's house, very slowly.",
    },
    {
        'id': 'candlewick', 'kind': 'person', 'storyRole': 'major', 'displayName': 'Candlewick',
        'aliases': ['Candlewick', 'Romeo'],
        'subtitle': "Pinocchio's favourite schoolmate",
        'body': "A thin, dry, lanky boy whose real name is Romeo, called Candlewick because he looks like a new wick. He is the laziest and naughtiest boy in the whole school, and Pinocchio's dearest friend.",
    },
    {
        'id': 'alidoro', 'kind': 'creature', 'storyRole': 'supporting', 'displayName': 'Alidoro',
        'aliases': ['Alidoro'],
        'subtitle': 'A police mastiff',
        'body': "A large mastiff who has won first prize in every dog race, set on Pinocchio's trail by the police.",
    },
    {
        'id': 'tuna', 'kind': 'creature', 'storyRole': 'supporting', 'displayName': 'The Tuna',
        'aliases': ['Tuna'],
        'subtitle': 'A Tuna swallowed by the Shark',
        'body': "A Tuna who has been swallowed by the Shark and tries to take it calmly, consoling himself that a Tuna dying in water is more honourable than one dying in oil.",
    },
    {
        'id': 'shark', 'kind': 'creature', 'storyRole': 'supporting', 'displayName': 'The Shark',
        'aliases': ['Shark'],
        'subtitle': 'A sea monster',
        'body': "A terrible Shark, said to be as big as a five-storey house, who has come to the coast to spread death and misery through the waters.",
    },
]
