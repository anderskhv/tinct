#!/usr/bin/env python3
"""Treasure Island: clickable-names pass.

Aliases: Hawkins/Mr. Hawkins -> Jim; Livesey, Trelawney, Smollett, Hands,
Gunn, Merry, Flint, Bones/Bill/Billy, Long John / John / John Silver ->
the existing cards. New cards: the squire's servants (Hunter, Joyce,
Redruth is carded), Mr. Dance and Dogger, Mr. Arrow, Job Anderson,
Abraham Gray, Tom Morgan, Dick Johnson, O'Brien, Tom and Alan (the
honest hands killed ashore), Blandly, Darby M'Graw, Jim's mother, Mrs.
Crossley, the pirate captains (Kidd, England, Roberts, Davis), Admiral
Hawke, and the rest.

"John" (35 bare) is Silver everywhere except "John Trelawney" (7,17);
"Ben" is Ben Gunn except the tavern boy Ben in ch. 8; "George" is Merry
in the later chapters but King George / the Royal George early.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'treasure-island'
P = 'person'
_ED = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
_PARAS = [(c['number'], i, p) for c in _ED['chapters'] for i, p in enumerate(c['paragraphs'])]


def chapters(*chs):
    return {(ch, i) for ch, i, p in _PARAS if ch in chs}


def r(eid, name, subtitle, body, aliases, role='reference', **kw):
    add_e(BOOK, eid, name, subtitle, body, role, P, aliases, **kw)


def main():
    # specific forms first
    r('tom-morgan', 'Tom Morgan', 'Pirate', "The old grey-haired sailor Silver dresses down at the Spy-glass; one of the last marooned.", ['Tom Morgan', 'Morgan'], role='supporting')
    r('job-anderson', 'Job Anderson', 'Boatswain', "Leads the assault on the stockade and is killed there.", ['Job Anderson', 'Anderson', 'Job'], role='supporting')
    r('abraham-gray', 'Abraham Gray', 'Ship\'s carpenter\'s mate', "The one hand who answers the captain's call and comes over to the honest party.", ['Abraham Gray', 'Abe Gray', 'Gray'], role='supporting')
    r('dick-johnson', 'Dick', 'Young pirate', "The lad Silver recruits in the apple barrel; his Bible is cut for the black spot.", ['Dick Johnson', 'Dick'], role='supporting')
    r('darby-mgraw', "Darby M'Graw", "Flint's last words", "'Fetch aft the rum, Darby!' — the cry Ben Gunn uses to terrify the pirates.", ['Darby M’Graw', 'Darby'])
    r('captain-kidd', 'Captain Kidd', '', "Capt. Kidd's Anchorage.", ['Capt. Kidd', 'Captain Kidd', 'Kidd'])
    r('captain-england', "Cap'n England", 'Pirate', "The pirate Silver and the parrot sailed with.", ['Cap’n England'])
    add_aliases_restricted(BOOK, 'captain-england', ['England'], only_paragraphs={(10, 21), (11, 0), (11, 2)})
    r('admiral-hawke', 'Admiral Hawke', '', "Under whom Silver claims to have lost his leg.", ['Admiral Hawke', 'Hawke'])
    r('mrs-crossley', 'Mrs. Crossley', '', "", ['Mrs. Crossley'])
    r('john-trelawney', 'John Trelawney', '', "", ['John Trelawney'], strict_editions=())

    # aliases on existing cards
    add_aliases(BOOK, 'jim', ['Jim Hawkins', 'Mr. Hawkins', 'Hawkins'])
    add_aliases(BOOK, 'dr-livesey', ['Livesey'])
    add_aliases(BOOK, 'squire-trelawney', ['Trelawney'])
    add_aliases(BOOK, 'captain-smollett', ['Mr. Smollett', 'Smollett'])
    add_aliases(BOOK, 'israel-hands', ['Hands', 'Israel'])
    add_aliases(BOOK, 'ben-gunn', ['Gunn'])
    add_aliases_restricted(BOOK, 'ben-gunn', ['Ben'], exclude_paragraphs=chapters(8))
    add_aliases(BOOK, 'george-merry', ['Merry'])
    add_aliases_restricted(BOOK, 'george-merry', ['George'], only_paragraphs=chapters(29, 30, 31, 32, 33))
    add_aliases(BOOK, 'captain-flint', ['Flint'])
    add_aliases(BOOK, 'billy-bones', ['Bill Bones', 'Billy', 'Bones', 'Bill'])
    add_aliases(BOOK, 'long-john-silver', ['Long John', 'John'])
    add_aliases(BOOK, 'blind-pew', ['Blind Pew'])
    add_aliases(BOOK, 'tom-redruth', ['Tom Redruth'])

    # new cards
    r('hunter', 'Hunter', "The squire's servant", "One of the three the squire brings from Hall; dies of his wounds at the stockade.", ['Hunter'], role='supporting')
    r('joyce', 'Joyce', "The squire's servant", "Killed defending the stockade.", ['Richard Joyce', 'Joyce'], role='supporting')
    r('mr-dance', 'Mr. Dance', 'Supervisor of revenue', "Rides down the smugglers and carries Jim to the squire's.", ['Supervisor Dance', 'Mr. Dance'], role='supporting')
    r('dogger', 'Dogger', 'Revenue officer', "Jim rides behind him to the Hall.", ['Dogger'])
    r('mr-arrow', 'Mr. Arrow', 'Mate of the Hispaniola', "A brown old sailor with earrings, always drunk; lost overboard.", ['Mr. Arrow', 'Arrow'], role='supporting')
    r('blandly', 'Blandly', "The squire's friend at Bristol", "Found the Hispaniola.", ['Mr. Blandly', 'Blandly'])
    r('obrien', "O'Brien", 'Pirate', "The rank Irelander whom Hands kills; his body Jim tips overboard.", ['O’Brien'])
    r('tom-hand', 'Tom', 'Honest hand', "The seaman who refuses Silver ashore and is murdered before Jim's eyes.", ['Tom'], only_paragraphs=chapters(14))
    r('alan', 'Alan', 'Honest hand', "Killed ashore; his death-cry is the first murder Jim hears.", ['Alan'])
    r('jims-mother', "Jim's mother", '', "Who counts out the captain's dues to the last farthing.", ['Mrs. Hawkins'])
    r('harry', 'Harry', 'Tavern hand', "", ['Harry'], only_paragraphs=chapters(8))
    r('ben-tavern', 'Ben', 'Tavern hand', "", ['Ben'], only_paragraphs=chapters(8))
    r('taylor', 'Taylor', 'Gardener', "", ['Taylor'])
    r('roberts', 'Roberts', 'Pirate captain', "", ['Roberts'])
    r('davis', 'Davis', 'Pirate captain', "", ['Davis'])
    r('noah', 'Noah', '', "", ['Noah'])


if __name__ == '__main__':
    main()
