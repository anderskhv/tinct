#!/usr/bin/env python3
"""Add real, previously-uncarded named individuals found in moby-dick via
spaCy PERSON-NER (see the clickable-names plan). Bodies are minimal,
drawn from first-mention context. "Gabriel" was a homonym pair (one
incidental archangel reference vs. 18 mentions of the Jeroboam's
self-proclaimed prophet) handled separately in add_histories_helpers-style
exclusion, run alongside this file. "Yarman" is Stubb's nickname for
Derick De Deer ("the German") -- bound as an alias, not a new character.
Skipped as not people: "Jeroboam" and "Rachel" name ships, not the
biblical figures; "Mark" is the imperative "mark ye" (pay attention), a
false-positive NER tag; "Dan Coopman" is the title of a fictional Dutch
book (Melville's joke -- Dutch for "the cooper"), not a person; "Woebegone"
and "Savesoul" are rhetorical invented names in a satirical passage, not
characters; "Jenny" is too ambiguous in Pip's delirious dialogue to
identify safely.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity
from add_aliases import add_aliases

BOOK = 'moby-dick'

ENTITIES = [
    ('hosea-hussey', 'Hosea Hussey', "Proprietor of the Try Pots inn in Nantucket, famous for his chowders, and cousin to the Spouter-Inn's landlord.", 'supporting', ['Hussey', 'Hosea Hussey']),
    ('the-manxman', 'the Manxman', "An old, grey sailor from the Isle of Man who has never before sailed out of Nantucket.", 'supporting', ['Manxman']),
    ('dough-boy', 'Dough-Boy', "The Pequod's steward.", 'supporting', ['Dough-Boy']),
    ('yojo', 'Yojo', "Queequeg's small black idol, whom he consults for guidance.", 'reference', ['Yojo']),
    ('scoresby', 'Captain Scoresby', "A cited authority on Cetology, quoted for his remark that no branch of zoology is so confused.", 'reference', ['Scoresby']),
    ('don-sebastian', 'Don Sebastian', "A listener in the Golden Inn who questions the sailor telling the Town-Ho's story.", 'reference', ['Don Sebastian']),
    ('mayhew', 'Mayhew', "Captain of the Jeroboam, fearful of spreading a malignant epidemic aboard his ship to the Pequod.", 'supporting', ['Mayhew']),
    ('captain-sleet', 'Captain Sleet', "Author of a fireside narrative about a voyage among the icebergs in quest of the Greenland whale.", 'reference', ['Sleet']),
    ('steelkilt', 'Steelkilt', "A Lakeman and desperado from Buffalo whose vengeance against a brutal mate drives the Town-Ho's story.", 'supporting', ['Steelkilt']),
    ('radney', 'Radney', "The Town-Ho's overbearing mate, a Vineyarder, whose brutality toward Steelkilt sets the story's events in motion.", 'supporting', ['Radney', 'Rad']),
    ('the-carpenter', 'the Carpenter', "The Pequod's ship's carpenter, who fashions Ahab's new ivory leg.", 'supporting', ['Carpenter']),
    ('bulkington', 'Bulkington', "A sailor at the Spouter-Inn, missed and sought after by his shipmates, who seems a great favourite among them.", 'reference', ['Bulkington']),
    ('archy', 'Archy', "A sailor stationed near the after-hatches who whispers to his neighbor during a moment of quiet.", 'reference', ['Archy']),
    ('derick-de-deer', 'Derick De Deer', "Master of the ship Jungfrau, of Bremen, met by the Pequod.", 'supporting', ['Derick De Deer', 'Derick']),
    ('owen-naturalist', 'Owen', "A naturalist cited among the authorities on Cetology.", 'reference', ['Owen']),
    ('belshazzar', 'Belshazzar', "King of Babylon, invoked as an image of mundane grandeur.", 'reference', ['Belshazzar']),
    ('don-pedro', 'Don Pedro', "A listener in the Golden Inn during the Town-Ho's story, who questions the meaning of “Canallers.”", 'reference', ['Don Pedro']),
    ('dr-bunger', 'Dr. Bunger', "Ship's surgeon of the Samuel Enderby.", 'supporting', ['Bunger']),
    ('admiral-nelson', 'Nelson', "Invoked in a comparison to the silver plate marking where he fell aboard the Victory.", 'reference', ['Nelson']),
    ('abraham', 'Abraham', "Invoked in a comparison to bowing before the angels.", 'reference', ['Abraham']),
    ('prometheus', 'Prometheus', "Invoked as a figure whose heart is eternally fed upon by a vulture, in a description of Ahab's tormented thought.", 'reference', ['Prometheus']),
    ('captain-pollard', 'Captain Pollard', "Captain of the ship Essex, which in 1820 was attacked and sunk by a whale.", 'reference', ['Pollard']),
    ('procopius', 'Procopius', "A Christian magistrate of Constantinople who wrote the history of his own times, in the days of Justinian.", 'reference', ['Procopius']),
    ('dr-johnson', 'Dr. Johnson', "Invoked as never having attained the erudition needed to define the word “gam.”", 'reference', ['Johnson']),
    ('perseus-md', 'Perseus', "Invoked in a comparison to Cellini's cast statue, describing a harpooner's bronze-like form.", 'reference', ['Perseus']),
    ('mounttop', 'Mounttop', "First mate of the Samuel Enderby.", 'reference', ['Mounttop']),
    ('captain-boomer', 'Captain Boomer', "Captain of the Samuel Enderby, who lost an arm to a whale and tells the tale over drinks with Ahab.", 'supporting', ['Boomer']),
    ('dr-snodhead', 'Dr. Snodhead', "A learned professor of Low Dutch and High German enlisted to translate an old whaling volume.", 'reference', ['Snodhead']),
    ('king-tranquo', 'King Tranquo', "The narrator's late royal friend, king of Tranque in the Arsacides, source of his knowledge of a whale's full skeleton.", 'reference', ['Tranquo']),
    ('sir-clifford-constable', 'Sir Clifford Constable', "An English landowner in Yorkshire who possesses the skeleton of a Sperm Whale.", 'reference', ['Clifford']),
    ('mary-folger', 'Mary Folger', "Benjamin Franklin's grandmother, an early Nantucket settler and ancestress of the Folgers and their line of harpooneers.", 'reference', ['Mary Morrel', 'Mary Folger']),
    ('sam-md', 'Sam', "A child mentioned in passing by the innkeeper's wife.", 'reference', ['Sam']),
    ('peter-coffin', 'Peter Coffin', "The landlord of the Spouter-Inn, named on its sign.", 'supporting', ['Peter Coffin']),
    ('tistig', 'Tistig', "An old squaw of Gay Head who declared that Pip's name would prove prophetic.", 'reference', ['Tistig']),
    ('john-hunter', 'John Hunter', "A naturalist and anatomist cited among the authorities on Cetology.", 'reference', ['John Hunter']),
    ('frederick-cuvier', 'Frederick Cuvier', "A naturalist cited among the authorities on Cetology.", 'reference', ['Frederick Cuvier']),
    ('bennett-author', 'Bennett', "An author cited among the authorities on Cetology.", 'reference', ['Bennett']),
    ('j-ross-browne', 'J. Ross Browne', "An author cited among the authorities on Cetology.", 'reference', ['J. Ross Browne']),
    ('charley-coffin', 'Charley Coffin', "A Nantucket messmate consulted, along with Simeon Macey, on a point of whaling lore.", 'reference', ['Charley Coffin']),
    ('captain-davis', 'Captain Davis', "Thrown from his cabin by a shock at sea, in a quoted account.", 'reference', ['Davis']),
    ('colnett', 'Captain Colnett', "A Post Captain in the English navy, author of an account of a voyage round Cape Horn for the whale fisheries.", 'reference', ['Colnett']),
    ('john-leo', 'John Leo', "“The old Barbary traveller,” cited as an authority attesting to the antiquity of the whale.", 'reference', ['John Leo']),
    ('captain-gardiner', 'Captain Gardiner', "Captain of the Rachel, searching for his own lost son and refused help by Ahab.", 'supporting', ['Gardiner']),
    ('solomon-md', 'Solomon', "Invoked for his saying that there is nothing new under the sun.", 'reference', ['Solomon']),
    ('lazarus', 'Lazarus', "Invoked as an image of a poor man shivering at a curbstone.", 'reference', ['Lazarus']),
]

if __name__ == '__main__':
    for eid, name, body, role, aliases in ENTITIES:
        add_entity(BOOK, eid, name, '', body, role, 'person', aliases)
    add_aliases(BOOK, 'derick-de-deer', ['Yarman'])
