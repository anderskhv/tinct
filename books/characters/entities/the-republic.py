"""The Republic — entity declarations for build_generic.py.

Existing bodies (socrates through niceratus, the-guardians, the-den,
philosopher-kings) are carried over verbatim from the previously released
13-card package. New entries close gaps found in a full-text name audit:
named interlocutors and relatives in the Book I household scene, the
Leontius anecdote (Book IV), the Er myth cast (Book X), and a corrected
split of the person Gyges from the ring/thought-experiment object he is
attached to (previously conflated under one 'ring-of-gyges' personification
card, which caused the Gyges name in Book II to render ring-thought-
experiment copy before the ring is even introduced in the same paragraph).
"""

BOOK_ID = 'the-republic'
LANGUAGE = 'en'
CONTENT_VERSION = 2
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'socrates', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Socrates'],
        'subtitle': '',
        'body': "The philosopher who narrates and drives the entire dialogue, drawn into a discussion of justice at the house of the elderly Cephalus. His questioning method gradually pushes the conversation from a simple definition of justice toward the design of an ideal city.",
    },
    {
        'id': 'glaucon', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Glaucon'],
        'subtitle': '',
        'body': "Plato's brother, an ambitious and combative young man who presses Socrates to defend justice against the strongest possible case for injustice. Much of the dialogue's construction of the ideal city is addressed directly to him.",
    },
    {
        'id': 'adeimantus', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Adeimantus'],
        'subtitle': '',
        'body': "Another of Plato's brothers, more measured than Glaucon but no less serious about the challenge he poses to Socrates. He reinforces Glaucon's demand that justice be shown worth choosing for its own sake.",
    },
    {
        'id': 'thrasymachus', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Thrasymachus'],
        'subtitle': '',
        'body': "A sophist from Chalcedon who bursts into the conversation to argue, forcefully and with open contempt for his companions, that justice is simply whatever serves the interest of the stronger. His confrontation with Socrates sets the terms the rest of the dialogue must answer.",
    },
    {
        'id': 'polemarchus', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Polemarchus'],
        'subtitle': '',
        'body': "Son of Cephalus and host of the household where the conversation takes place. He inherits his father's argument about justice once the older man withdraws from the discussion.",
    },
    {
        'id': 'cephalus', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Cephalus'],
        'subtitle': '',
        'body': "A wealthy elderly resident of the Piraeus, in whose house the dialogue opens. His own reflections on old age and honesty give the conversation its first, simple definition of justice before he retires from the discussion.",
    },
    {
        'id': 'cleitophon', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Cleitophon'],
        'subtitle': '',
        'body': "A companion of Thrasymachus who briefly speaks up in his support during the argument over justice's definition. He appears only in passing before the sophist takes over the argument himself.",
    },
    {
        'id': 'lysias', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Lysias'],
        'subtitle': '',
        'body': "An orator and one of Cephalus's sons, mentioned as present in the house at the dialogue's opening. He does not take part in the philosophical discussion himself.",
    },
    {
        'id': 'niceratus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Niceratus'],
        'subtitle': '',
        'body': "Son of the Athenian general Nicias, named among the young men gathered at Cephalus's house for the conversation. Like several others present, he is a listener rather than a speaker in the recorded dialogue.",
    },
    {
        'id': 'the-guardians', 'kind': 'personification', 'storyRole': 'major',
        'aliases': ['guardians'],
        'subtitle': '',
        'body': "The class of rulers and defenders Socrates proposes for his ideal city, bred and educated from youth for wisdom, courage, and complete devotion to the common good. Their strict upbringing and shared way of life are meant to keep private interest from ever overriding the city's.",
    },
    {
        'id': 'the-den', 'kind': 'personification', 'storyRole': 'major',
        'aliases': ['den'],
        'subtitle': '',
        'body': "Socrates's image of prisoners chained since childhood in an underground cave, mistaking shadows on a wall for the whole of reality. Their difficult ascent toward the light outside stands for the philosopher's own long education toward the truth.",
    },
    {
        'id': 'philosopher-kings', 'kind': 'personification', 'storyRole': 'major',
        'aliases': ['philosopher kings', 'philosophers become kings'],
        'subtitle': '',
        'body': "Socrates's proposal that the ideal city can only be realized if philosophers become its rulers, or its rulers take up philosophy in earnest. The idea is presented as a paradox even Socrates expects his listeners to resist.",
    },
    # -- New: Book I household scene --
    {
        'id': 'euthydemus-brother', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Euthydemus'],
        'subtitle': '',
        'body': "Another of Cephalus's sons and a brother of Polemarchus and Lysias, named among those present when the conversation begins. He is not recorded speaking in the dialogue.",
    },
    {
        'id': 'charmantides', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Charmantides'],
        'subtitle': '',
        'body': "A guest from Paeania named among the company gathered at Cephalus's house at the start of the dialogue. He takes no recorded part in the discussion.",
    },
    {
        'id': 'aristonymus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Aristonymus'],
        'subtitle': '',
        'body': "Named only as the father of Cleitophon in the roll call of guests at Cephalus's house. He does not appear in the dialogue himself.",
    },
    {
        'id': 'ariston', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Ariston'],
        'subtitle': '',
        'body': "The father of Glaucon and Adeimantus (and, historically, of Plato himself), named in the dialogue only through the patronymic used to introduce his sons. He does not appear as a speaker.",
    },
    {
        'id': 'lysanias', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Lysanias'],
        'subtitle': '',
        'body': "Cephalus's father, mentioned when Cephalus contrasts his own management of the family estate with his father's and grandfather's. He does not appear as a speaker.",
    },
    # -- New: Leontius anecdote (Book IV) --
    {
        'id': 'leontius', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Leontius'],
        'subtitle': '',
        'body': "An Athenian whose experience Socrates recalls as a story: coming up from the Piraeus, he passed some bodies lying by the executioner's wall. He is used as an example while Socrates discusses the parts of the soul.",
    },
    {
        'id': 'aglaion', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Aglaion'],
        'subtitle': '',
        'body': "Named only as the father of Leontius in the anecdote Socrates recounts about a struggle between appetite and reason.",
    },
    # -- New: Gyges split from the ring object --
    {
        'id': 'gyges', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Gyges'],
        'subtitle': '',
        'body': "A legendary shepherd in the service of the king of Lydia, said to be an ancestor of King Croesus. Glaucon invokes him by name to open a thought experiment about whether anyone would still choose to act justly if they could act without ever facing consequences.",
    },
    {
        'id': 'ring-of-gyges', 'kind': 'object', 'storyRole': 'supporting',
        'aliases': ['ring of Gyges'],
        'subtitle': '',
        'body': "A ring that grants its wearer invisibility, the centerpiece of a thought experiment Glaucon poses about whether anyone would stay just if they could commit any wrong without ever being caught. The story asks whether justice is valued for itself or only for its reputation.",
    },
    # -- New: Myth of Er cast (Book X) --
    {
        'id': 'er', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Er'],
        'subtitle': '',
        'body': "A Pamphylian soldier whose body is found intact ten days after he was killed in battle. Socrates presents his account of what he witnessed as the closing story of the dialogue, offered as a vision of what happens to souls after death rather than a philosophical argument.",
    },
    {
        'id': 'armenius', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Armenius'],
        'subtitle': '',
        'body': "Named only as Er's father in Socrates's introduction of the closing story.",
    },
    {
        'id': 'ardiaeus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Ardiaeus'],
        'subtitle': '',
        'body': "A tyrant of a city in Pamphylia named within Er's account as a byword among the souls Er observes, said to have lived long before Er's own time.",
    },
    {
        'id': 'necessity', 'kind': 'deity', 'storyRole': 'supporting',
        'aliases': ['Necessity'],
        'subtitle': '',
        'body': "The figure on whose spindle, in Er's account, the revolutions of the heavens turn. The Fates are described as her daughters, attending the spindle she holds on her knees.",
    },
    {
        'id': 'lachesis', 'kind': 'deity', 'storyRole': 'supporting',
        'aliases': ['Lachesis'],
        'subtitle': '',
        'body': "One of the three Fates in Er's account, daughters of Necessity, described singing of the past as the souls Er observes make their choices.",
    },
    {
        'id': 'clotho', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Clotho'],
        'subtitle': '',
        'body': "One of the three Fates in Er's account, daughters of Necessity, described singing of the present and touching the outer circle of the spindle.",
    },
    {
        'id': 'atropos', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Atropos'],
        'subtitle': '',
        'body': "One of the three Fates in Er's account, daughters of Necessity, described singing of the future and guiding the inner circles of the spindle.",
    },
]
