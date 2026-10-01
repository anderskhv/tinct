"""Alice recognition copy and reviewed bindings; no network or model calls."""
BOOK_ID = 'alice-in-wonderland'
CONTENT_VERSION = "2026-10-01.1"
EDITIONS = ["original-en", "modern-en"]

ENTITIES = [{'id': 'alice',
  'kind': 'person',
  'storyRole': 'central',
  'displayName': 'Alice',
  'aliases': ['Alice'],
  'subtitle': 'The girl at the centre of the story',
  'body': 'Alice is sitting beside her sister on a bank. The story follows her thoughts and what '
          'she notices.'},
 {'id': 'sister',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Alice’s sister',
  'aliases': ['her sister', 'Her sister', 'my sister'],
  'subtitle': 'Alice’s companion on the bank',
  'body': 'Alice’s unnamed sister is reading beside her on the bank.'},
 {'id': 'white-rabbit',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'The White Rabbit',
  'aliases': ['White Rabbit', 'the Rabbit', 'The Rabbit', 'W. RABBIT'],
  'subtitle': 'The rabbit Alice notices',
  'body': 'A White Rabbit with pink eyes runs close past Alice as she sits on the bank.'},
 {'id': 'dinah',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Dinah',
  'aliases': ['Dinah'],
  'subtitle': 'Remembered from home',
  'body': 'Alice thinks of Dinah while falling down the rabbit-hole and wonders whether she will '
          'be missed at home.'},
 {'id': 'mouse',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Mouse',
  'aliases': ['the Mouse', 'The Mouse', 'O Mouse'],
  'subtitle': 'Another swimmer in the pool',
  'body': 'Alice notices a mouse swimming in the pool of tears. She has become small enough to '
          'share the water with it.'},
 {'id': 'dodo',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Dodo',
  'aliases': ['Dodo'],
  'subtitle': 'One of the creatures in the pool',
  'body': 'The Dodo is among the birds and animals that have fallen into the pool with Alice.'},
 {'id': 'duck',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Duck',
  'aliases': ['Duck'],
  'subtitle': 'One of the birds in the pool',
  'body': 'The Duck is one of the birds Alice encounters in the pool of tears.'},
 {'id': 'lory',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Lory',
  'aliases': ['Lory'],
  'subtitle': 'One of the birds in the pool',
  'body': 'The Lory belongs to the company of birds and animals in the pool of tears.'},
 {'id': 'eaglet',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Eaglet',
  'aliases': ['Eaglet'],
  'subtitle': 'One of the birds in the pool',
  'body': 'The Eaglet is among the creatures sharing the pool with Alice.'},
 {'id': 'pat',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Pat',
  'aliases': ['Pat'],
  'subtitle': 'Called by the White Rabbit',
  'body': 'The White Rabbit calls angrily for Pat while Alice is trapped inside the house.'},
 {'id': 'bill',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Bill',
  'aliases': ['Bill', 'the Lizard'],
  'subtitle': 'A helper outside the Rabbit’s house',
  'body': 'Bill is named among the helpers gathering outside the house where Alice is trapped.'},
 {'id': 'caterpillar',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'The Caterpillar',
  'aliases': ['Caterpillar', 'blue caterpillar'],
  'subtitle': 'The creature on the mushroom',
  'body': 'Alice finds a large blue caterpillar on top of a mushroom as she looks for a way to '
          'change her size.'},
 {'id': 'pigeon',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Pigeon',
  'aliases': ['Pigeon'],
  'subtitle': 'A bird among the treetops',
  'body': 'A pigeon confronts Alice among the leaves after her neck has grown high above the '
          'trees.'},
 {'id': 'fish-footman',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Fish-Footman',
  'aliases': ['Fish-Footman'],
  'subtitle': 'The visitor at the door',
  'body': 'A footman comes out of the wood towards the house Alice is watching.'},
 {'id': 'frog-footman',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Frog-Footman',
  'aliases': ['Frog-Footman', 'the Footman', 'The Footman'],
  'subtitle': 'The attendant at the door',
  'body': 'A second footman opens the door of the house Alice is watching.'},
 {'id': 'duchess',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'The Duchess',
  'aliases': ['Duchess'],
  'subtitle': 'Named by the anxious Rabbit',
  'body': 'The White Rabbit mentions the Duchess while hurrying past Alice. Alice has not yet met '
          'her.'},
 {'id': 'cook',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Duchess’s cook',
  'aliases': ['the cook', 'The cook', 'Duchess’s cook'],
  'subtitle': 'The cook in the kitchen',
  'body': 'The cook is in the smoky kitchen where Alice finds the Duchess holding a baby.'},
 {'id': 'baby',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Duchess’s baby',
  'aliases': ['the baby', 'The baby', 'the child', 'this child', 'a baby'],
  'subtitle': 'The baby in the kitchen',
  'body': 'The Duchess is holding a baby when Alice enters the kitchen.'},
 {'id': 'cheshire-cat',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'The cat in the kitchen',
  'aliases': ['Cheshire Cat', 'Cheshire cat', 'Cheshire Puss', 'the Cat', 'The Cat'],
  'subtitle': 'The cat Alice notices',
  'body': 'A large cat sits in the Duchess’s kitchen among the cook and the sneezing household.'},
 {'id': 'hatter',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'The Hatter',
  'aliases': ['Hatter'],
  'subtitle': 'A neighbour named by the Cat',
  'body': 'The Cat names a Hatter while giving Alice directions. Alice has not yet met him.'},
 {'id': 'march-hare',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'The March Hare',
  'aliases': ['March Hare'],
  'subtitle': 'A neighbour named by the Cat',
  'body': 'The Cat names the March Hare while giving Alice directions. Alice has not yet met him.'},
 {'id': 'dormouse',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Dormouse',
  'aliases': ['Dormouse'],
  'subtitle': 'A companion at the tea-table',
  'body': 'The Dormouse sits between the March Hare and the Hatter at their outdoor tea-table.'},
 {'id': 'two',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Two',
  'aliases': ['Two'],
  'subtitle': 'One of the rose-painting gardeners',
  'body': 'Two is one of the three gardeners painting the white roses red near the garden '
          'entrance.'},
 {'id': 'five',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Five',
  'aliases': ['Five'],
  'subtitle': 'One of the rose-painting gardeners',
  'body': 'Five is one of the three gardeners Alice sees painting white roses red.'},
 {'id': 'seven',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'Seven',
  'aliases': ['Seven'],
  'subtitle': 'One of the rose-painting gardeners',
  'body': 'Seven is a fellow gardener named by Five during the argument over splashed paint.'},
 {'id': 'queen-of-hearts',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'The Queen',
  'aliases': ['Queen of Hearts', 'QUEEN OF HEARTS', 'the Queen', 'The Queen'],
  'subtitle': 'The sender of an invitation',
  'body': 'The Queen is named in an invitation delivered to the Duchess. Alice has not yet met '
          'her.'},
 {'id': 'king-of-hearts',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The King of Hearts',
  'aliases': ['King of Hearts', 'the King', 'The King'],
  'subtitle': 'The king in the royal procession',
  'body': 'The King belongs to the royal procession Alice encounters in the garden.'},
 {'id': 'knave-of-hearts',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Knave of Hearts',
  'aliases': ['Knave of Hearts', 'the Knave', 'The Knave'],
  'subtitle': 'A member of the royal procession',
  'body': 'The Knave of Hearts is part of the procession Alice watches in the garden.'},
 {'id': 'gryphon',
  'kind': 'person',
  'storyRole': 'supporting',
  'displayName': 'The Gryphon',
  'aliases': ['Gryphon'],
  'subtitle': 'A creature encountered with the Queen',
  'body': 'Alice comes upon the Gryphon while accompanying the Queen.'},
 {'id': 'mock-turtle',
  'kind': 'person',
  'storyRole': 'major',
  'displayName': 'The Mock Turtle',
  'aliases': ['Mock Turtle'],
  'subtitle': 'A creature named by the Queen',
  'body': 'The Queen asks Alice whether she has met the Mock Turtle. Alice has not yet done so.'},
 {'id': 'tortoise',
  'kind': 'person',
  'storyRole': 'reference',
  'displayName': 'Tortoise',
  'aliases': ['Tortoise'],
  'subtitle': 'The Mock Turtle’s old teacher',
  'body': 'Tortoise is the name the Mock Turtle gives to his old schoolteacher, an old Turtle from '
          'his school in the sea.'}]


def bind(edition, chapter, paragraph_index, text, entities):
    """Case-sensitive names plus source-reviewed, narrowly scoped descriptions.

    Rebuild the final package with build_reviewed.compile_package(BOOK_ID, bind).
    Generic compilation is only the baseline; it cannot apply contextual gates.
    """
    import re
    paragraph = paragraph_index + 1
    candidates = []

    def add(alias, identity):
        for match in re.finditer(r'(?<!\w)' + re.escape(alias) + r'(?!\w)', text):
            candidates.append((match.start(), match.end(), identity, 'reviewed-name'))

    for entity in entities:
        identity = entity['id']
        if identity in {'two', 'five', 'seven'} and chapter != 8:
            continue
        if identity == 'sister' and not (chapter == 1 or chapter == 12 and 64 <= paragraph <= 67):
            continue
        if identity == 'cook' and chapter not in {6, 11}:
            continue  # The royal cook at 8:7 is not established as this cook.
        if identity == 'baby' and not (chapter == 6 and paragraph >= 19 or chapter == 12 and paragraph == 70):
            continue
        for alias in entity['aliases']:
            if identity == 'frog-footman' and alias in {'the Footman', 'The Footman'} and not (chapter == 6 and 4 <= paragraph <= 18):
                continue
            add(alias, identity)

    # Unnamed first appearances: never promote generic species globally.
    opening = {
        (2, 18): [('a mouse', 'mouse')],
        (5, 56): [('pigeon', 'pigeon')],
        (6, 1): [('a footman', 'fish-footman'),
                 ('another footman', 'frog-footman'),
                 ('Another uniformed footman', 'frog-footman')],
        (6, 21): [('a large cat', 'cheshire-cat')],
        (8, 11): [('KING', 'king-of-hearts')],
    }
    for alias, identity in opening.get((chapter, paragraph), []):
        add(alias, identity)
    # Delayed aliases start only after the identifying paragraph has ended.
    if chapter == 6 and paragraph in {49, 73}:
        add('pig', 'baby')
    if chapter >= 11 and (chapter, paragraph) > (11, 3):
        add('the judge', 'king-of-hearts')
        add('The judge', 'king-of-hearts')
    if chapter >= 11 and (chapter, paragraph) > (11, 12):
        add('the prisoner', 'knave-of-hearts')
        add('The prisoner', 'knave-of-hearts')
    return candidates
