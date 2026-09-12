BOOK_ID = 'frankenstein'
CONTENT_VERSION = '2026-09-12.1'
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'victor', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Victor Frankenstein', 'Victor'],
        'subtitle': 'A young Genevan natural philosopher',
        'body': 'The narrator of the central story, obsessed since boyhood with the secrets of life and death. He leaves his family in Geneva to study at Ingolstadt, where his research takes a direction he will not fully explain even to the friend he is writing to.',
    },
    {
        'id': 'creature', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['the creature', 'the daemon', 'the monster', 'the wretch', 'the fiend'],
        'subtitle': 'The being Victor makes',
        'body': "Assembled by Victor from collected remains and given life in his workshop. He is abandoned by his creator within moments of opening his eyes, before either of them has any idea what he is capable of.",
    },
    {
        'id': 'walton', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Robert Walton', 'Walton'],
        'subtitle': 'An English captain bound for the North Pole',
        'body': "Writing letters home to his sister as his ship pushes into arctic ice, he pulls a half-frozen stranger aboard and becomes the outer frame through which the whole account reaches the reader. His own hunger for glory mirrors the story he is about to hear.",
    },
    {
        'id': 'margaret-saville', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Mrs. Saville', 'Margaret'],
        'subtitle': "Walton's sister in England",
        'body': "The unseen addressee of Walton's letters, which open and close the novel. She never appears directly; everything the reader learns of her comes through her brother's writing.",
    },
    {
        'id': 'alphonse-frankenstein', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Alphonse Frankenstein', 'M. Frankenstein'],
        'subtitle': "Victor's father",
        'body': "A respected Genevan syndic who raised his children with affection and encouraged Victor's education without grasping where his son's private studies were leading. He writes to Victor with family news and worry when letters from home stop coming.",
    },
    {
        'id': 'caroline-beaufort', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Caroline Beaufort', 'Caroline Frankenstein'],
        'subtitle': "Victor's mother",
        'body': "Daughter of a ruined friend of Alphonse's, taken in and later married by him after her father's death. Her own death, from scarlet fever caught nursing Elizabeth, falls on Victor just before he leaves for university.",
    },
    {
        'id': 'elizabeth', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Elizabeth Lavenza', 'Elizabeth'],
        'subtitle': "An orphan raised as Victor's cousin and intended bride",
        'body': "Brought into the Frankenstein household as a small child and raised alongside Victor, who from early on regards her as more than a sister. She stays close to the family through every absence and misfortune that follows.",
    },
    {
        'id': 'henry-clerval', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Henry Clerval', 'Clerval', 'Henry'],
        'subtitle': "Victor's closest friend from childhood",
        'body': "A merchant's son with a taste for poetry and adventure rather than the family business, he follows Victor to Ingolstadt and nurses him through a long illness there. His warmth is a steady contrast to Victor's growing secrecy.",
    },
    {
        'id': 'william', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['William Frankenstein', 'little William'],
        'subtitle': "Victor's youngest brother",
        'body': "A cherished child in the Frankenstein family, still young enough to be spoiled by everyone around him. News concerning him is what finally calls Victor back home from his travels with Clerval.",
    },
    {
        'id': 'justine', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Justine Moritz', 'Justine'],
        'subtitle': 'A servant raised almost as a member of the family',
        'body': "Taken in by Caroline Frankenstein as a girl after trouble at her own home, she becomes devoted to the family, especially to William. She returns to Geneva to visit her mother on the night William goes missing.",
    },
    {
        'id': 'ernest', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Ernest Frankenstein', 'Ernest'],
        'subtitle': "Victor's middle brother",
        'body': "The second Frankenstein son, mentioned in family letters as being intended for a soldier's career against his father's preference for the law. He remains in Geneva through the family's troubles.",
    },
    {
        'id': 'de-lacey', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['De Lacey', 'the old man', 'the old De Lacey'],
        'subtitle': 'A blind old man living in exile in a cottage',
        'body': "Once a comfortable Parisian, now reduced to a simple rural cottage with his two children, supported by a son's labor and a daughter's care. His blindness makes him the one person the creature can approach without being fled from on sight.",
    },
    {
        'id': 'felix', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Felix'],
        'subtitle': "De Lacey's son",
        'body': "A young man carrying his family's poverty and a private grief the creature slowly pieces together by watching the cottage. He works the land and teaches his father's household through hardships that once knew better days.",
    },
    {
        'id': 'agatha', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Agatha'],
        'subtitle': "De Lacey's daughter",
        'body': "Felix's sister, who shares the daily work and quiet sorrow of the cottage. Her gentleness toward her blind father is part of what teaches the creature what a family can be.",
    },
    {
        'id': 'safie', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Safie'],
        'subtitle': 'An Arabian woman who joins the De Lacey household',
        'body': "The daughter of a Turkish merchant, she arrives at the cottage seeking Felix, to whom she is devoted, and stays to learn the family's language. Her lessons, overheard by the creature in hiding, become his own education in speech and history.",
    },
    {
        'id': 'krempe', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['M. Krempe', 'Krempe'],
        'subtitle': 'A professor of natural philosophy at Ingolstadt',
        'body': "A blunt, unimpressive-looking professor who dismisses Victor's early reading in old alchemical writers as useless. His scorn stings Victor without turning him from science itself.",
    },
    {
        'id': 'waldman', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['M. Waldman', 'Waldman'],
        'subtitle': 'A professor of chemistry at Ingolstadt',
        'body': "Kind where Krempe was dismissive, he reframes the old alchemists as flawed pioneers of real modern science and encourages Victor's fascination rather than mocking it. His lectures are what finally set Victor's private research in motion.",
    },
]
