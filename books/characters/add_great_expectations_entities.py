#!/usr/bin/env python3
"""Great Expectations: clickable-names pass.

Aliases for the existing 18 cards (Handel/Philip/Wolf -> Pip, Joseph ->
Joe, Waldengarver -> Wopsle, the Aged -> Wemmick's father, John -> Wemmick,
Campbell -> Magwitch, Jaggerth -> Jaggers, Mum -> Mrs. Joe / Mrs. Pocket)
and ~60 new minimal cards for the Pockets, the Hubbles, Trabb and his boy,
Miss Skiffins, the nurses, Old Barley, Pepper the Avenger, Molly, Mike,
the toadies at Satis House, and the allusions (George Barnwell, Richard
the Third, Hamlet, Collins's Ode...).

"Philip Pirrip, late of this parish" is Pip's FATHER (the tombstone), and
was bound to Pip: those three mentions are moved to a new card.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'great-expectations'
P = 'person'

_ED = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
_PARAS = [(c['number'], i, p) for c in _ED['chapters'] for i, p in enumerate(c['paragraphs'])]


def paras_with(pattern, chs=None):
    rx = re.compile(pattern)
    return {(ch, i) for ch, i, p in _PARAS if (chs is None or ch in chs) and rx.search(p)}


def chapters(*chs):
    return {(ch, i) for ch, i, p in _PARAS if ch in chs}


def remove_mentions(char_id, text_pred):
    path = ROOT / f'app/public/data/characters/{BOOK}.v1.json'
    pkg = json.loads(path.read_text())
    for ek, ed in pkg['editions'].items():
        before = len(ed['mentions'])
        ed['mentions'] = [m for m in ed['mentions'] if not (m['characterId'] == char_id and text_pred(m['text']))]
        print(BOOK, ek, char_id, 'removed', before - len(ed['mentions']), 'mentions')
    path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


TOMB = paras_with(r'Philip Pirrip')


def main():
    # ---- the tombstone: Pip's parents and brothers ----------------------
    remove_mentions('pip', lambda t: t == 'Philip Pirrip')
    add_e(BOOK, 'philip-pirrip-senior', 'Philip Pirrip', "Pip's father", "'Late of this parish' — known to Pip only from the shape of the letters on his tombstone.", 'reference', P, ['Philip Pirrip'])
    add_e(BOOK, 'georgiana-pirrip', 'Georgiana', "Pip's mother", "'Also Georgiana, Wife of the Above' — freckled and sickly, Pip decides, from the inscription.", 'reference', P, ['Georgiana'], only_paragraphs=TOMB | {(1, 20), (58, 19)})
    add_e(BOOK, 'pips-brothers', "Pip's five brothers", 'Alexander, Bartholomew, Abraham, Tobias and Roger', "Five little stone lozenges in a row beside their parents' graves.", 'reference', P,
          ['Alexander', 'Bartholomew', 'Abraham', 'Tobias', 'Roger'], only_paragraphs={(1, 2)})

    # ---- specific names before bare names ------------------------------
    add_e(BOOK, 'handel-composer', 'Handel', 'Composer', "Herbert's reason for the nickname: Handel's Harmonious Blacksmith.", 'reference', P, ['Handel'], only_paragraphs={(22, 34)})
    add_e(BOOK, 'mrs-hubble', 'Mrs. Hubble', "The wheelwright's wife", "A little curly sharp-edged person in sky-blue, who married Mr. Hubble when much younger than he.", 'supporting', P, ['Mrs. Hubble'])
    add_e(BOOK, 'mr-hubble', 'Mr. Hubble', 'Wheelwright', "A tough, high-shouldered, stooping old man who smells of sawdust; 'Naterally wicious.'", 'supporting', P, ['Mr. Hubble', 'Mr Hubble', 'Hubble'])
    add_e(BOOK, 'trabbs-boy', "Trabb's boy", 'The most audacious boy in the county', "The tailor's boy who mocks Pip's new gentility in the street — and later leads him to the sluice-house.", 'supporting', P, ["Mr. Trabb’s boy", "Trabb’s boy", "Trabb's boy"])
    add_e(BOOK, 'trabb', 'Mr. Trabb', 'Tailor and undertaker', "The village tailor who fits out Pip's expectations and buries his sister.", 'supporting', P, ['Mr. Trabb', 'Trabb'])
    add_e(BOOK, 'skiffins-brother', 'Skiffins', 'Accountant', "Miss Skiffins's brother, the accountant who arranges Herbert's partnership.", 'reference', P, ['Skiffins'], only_paragraphs={(37, 19)})
    add_e(BOOK, 'miss-skiffins', 'Miss Skiffins', "Wemmick's intended", "A lady of wooden appearance and orange gloves, who marries Wemmick at Walworth.", 'supporting', P, ['Miss Skiffins'])
    add_e(BOOK, 'mr-camilla', 'Mr. Camilla', '', "Cousin Raymond, Camilla's husband.", 'reference', P, ['Mr. Camilla'])
    add_e(BOOK, 'camilla', 'Camilla', "Matthew Pocket's sister", "A toady at Satis House who suffers loudly on Miss Havisham's account.", 'supporting', P, ['Mrs. Camilla', 'Camilla', 'Mistress Camilla'])
    add_e(BOOK, 'raymond', 'Cousin Raymond', "Camilla's husband", "Witness to Camilla's nervous jerkings.", 'supporting', P, ['Cousin Raymond', 'Raymond'])
    add_e(BOOK, 'sarah-pocket', 'Sarah Pocket', 'Satis House toady', "A little dry brown corrugated old woman with a face like a walnut shell; keeps the gate.", 'supporting', P,
          ['Miss Sarah Pocket', 'Sarah Pocket', 'Miss Sarah', 'Miss Pocket', 'Sarah'])
    add_e(BOOK, 'georgiana-pocket', 'Georgiana', 'Satis House toady', "The Pocket relation who contends with Sarah for the last word at Miss Havisham's.", 'reference', P,
          ['Miss Georgiana', 'Georgiana'], exclude_paragraphs=TOMB | {(1, 20), (58, 19)})
    add_e(BOOK, 'mrs-pocket', 'Mrs. Pocket', 'Belinda', "Herbert's mother, who reads a book about titles while the babies tumble.", 'supporting', P, ['Mrs. Pocket', 'Belinda'])
    add_e(BOOK, 'flopson', 'Flopson', 'Nurse', "One of the Pocket nurses.", 'reference', P, ['Flopson'])
    add_e(BOOK, 'millers', 'Millers', 'Nurse', "The other Pocket nurse.", 'reference', P, ['Millers'])
    add_e(BOOK, 'jane-pocket', 'Jane Pocket', "Herbert's sister", "The little girl who protects the baby from the nut-crackers.", 'reference', P, ['Miss Jane', 'Jane Pocket', 'Jane'])
    add_e(BOOK, 'alick-pocket', 'Alick', "Herbert's brother", "", 'reference', P, ['Master Alick', 'Alick'])
    add_e(BOOK, 'fanny-pocket', 'Fanny', "Herbert's sister", "", 'reference', P, ['Fanny'])
    add_e(BOOK, 'charlotte-pocket', 'Charlotte', "Herbert's sister", "Died before she was fourteen.", 'reference', P, ['Charlotte'])
    add_e(BOOK, 'sophia', 'Sophia', 'Housemaid', "The servant Mrs. Pocket blames for the cook's misconduct.", 'reference', P, ['Sophia'])
    add_e(BOOK, 'mrs-coiler', 'Mrs. Coiler', 'Toady neighbour', "A widow with a serpentine way of coming close.", 'reference', P, ['Mrs. Coiler'])
    add_e(BOOK, 'clara', 'Clara Barley', "Herbert's fiancée", "A captive fairy in Old Barley's house at Mill Pond Bank.", 'supporting', P, ['Miss Clara Barley', 'Clara Barley', 'Clara'])
    add_e(BOOK, 'bill-barley', 'Old Barley', "Clara's father", "A bedridden former ship's purser who growls in the beam and lives on rum and pepper; 'Gruffandgrim'.", 'supporting', P,
          ['Bill Barley', 'Old Barley', 'old Barley', 'Mr. Barley', 'Barley', 'Gruffandgrim'])
    add_e(BOOK, 'mrs-whimple', 'Mrs. Whimple', 'Landlady', "The motherly landlady at Mill Pond Bank.", 'reference', P, ['Mrs. Whimple'])
    add_e(BOOK, 'pepper', 'Pepper', 'The Avenger', "Pip's serving-boy in a canary-breasted livery, who has nothing to do.", 'supporting', P, ['Pepper', 'The Avenger', 'the Avenger', 'Avenger'])
    add_e(BOOK, 'mrs-brandley', 'Mrs. Brandley', "Estella's chaperone", "The widow at Richmond with whom Estella is placed.", 'reference', P, ['Mrs. Brandley'])
    add_e(BOOK, 'clarriker', 'Clarriker', 'Shipping merchant', "The young merchant whose house Herbert quietly buys into with Pip's money.", 'supporting', P, ['Clarriker'])
    add_e(BOOK, 'mike', 'Mike', "Jaggers's client", "The client in the fur cap who always has a witness ready.", 'reference', P, ['Mike'])
    add_e(BOOK, 'molly', 'Molly', "Jaggers's housekeeper", "The housekeeper with the scarred wrists — Estella's mother.", 'supporting', P, ['Molly'])
    add_e(BOOK, 'arthur-havisham', 'Arthur', "Miss Havisham's half-brother", "Compeyson's confederate in the plot against her; died raving of her in white.", 'supporting', P, ['Arthur'])
    add_e(BOOK, 'sally', 'Sally', "Compeyson's wife", "", 'reference', P, ['Sally'])
    add_e(BOOK, 'jack', 'The Jack', 'Of the causeway', "The slimy creature at the riverside inn who has drowned men's clothes on.", 'reference', P, ['Jack'], only_paragraphs=chapters(54))
    add_e(BOOK, 'the-crying-womans-bill', 'Bill', "A client's son", "The man whose mother pleads with Jaggers in Bartholomew Close.", 'reference', P, ['Bill'], only_paragraphs={(20, 35), (20, 36)})
    add_e(BOOK, 'black-bill', 'Black Bill', '', "Named by Wemmick among the prisoners in Newgate.", 'reference', P, ['Black Bill'])
    add_e(BOOK, 'captain-tom', 'Captain Tom', '', "Named by Wemmick among the prisoners in Newgate.", 'reference', P, ['Captain Tom'])
    add_e(BOOK, 'amelia', 'Amelia', "Jaggers's client", "", 'reference', P, ['Amelia'])
    add_e(BOOK, 'habraham-latharuth', 'Habraham Latharuth', 'Client on suspicion of plate', "", 'reference', P, ['Habraham Latharuth'])
    add_e(BOOK, 'william', 'William', 'Waiter at the Boar', "Whose father's name was Potkins.", 'reference', P, ['William', 'Potkins'])
    add_e(BOOK, 'squires', 'Squires', 'Landlord of the Boar', "", 'reference', P, ['Squires'])
    add_e(BOOK, 'mary-anne', 'Mary Anne', "Wemmick's little servant", "", 'reference', P, ['Mary Anne'])
    add_e(BOOK, 'dunstable', 'Dunstable', 'Butcher', "", 'reference', P, ['Dunstable'])
    add_e(BOOK, 'wopsles-great-aunt', "Mr. Wopsle's great-aunt", 'Schoolmistress', "Keeps the evening school where Pip learns his letters; Biddy's grandmother.", 'reference', P, ['Mr. Wopsle’s great-aunt', 'great-aunt'])
    add_e(BOOK, 'george-barnwell', 'George Barnwell', 'The London Merchant', "The apprentice-murderer of Lillo's tragedy, which Wopsle reads at Pip.", 'reference', P, ['George Barnwell', 'Barnwell'], exclude_paragraphs={(19, 52)})
    add_e(BOOK, 'richard-the-third', 'Richard the Third', '', "", 'reference', P, ['Richard the Third'])
    add_e(BOOK, 'hamlet', 'Hamlet', '', "The part Wopsle plays in London.", 'reference', P, ['Hamlet'])
    add_e(BOOK, 'claudius', 'Claudius', '', "", 'reference', P, ['Claudius'])
    add_e(BOOK, 'ophelia', 'Ophelia', '', "", 'reference', P, ['Ophelia'])
    add_e(BOOK, 'mark-antony', 'Mark Antony', '', "", 'reference', P, ['Mark Antony'])
    add_e(BOOK, 'collins', 'Collins', 'Poet', "Whose Ode on the Passions Wopsle declaims.", 'reference', P, ['Collins'])

    # ---- aliases on existing cards --------------------------------------
    add_aliases_restricted(BOOK, 'pip', ['Handel'], exclude_paragraphs={(22, 34)})
    add_aliases_restricted(BOOK, 'pip', ['Philip Pip', 'Philip'], exclude_paragraphs=TOMB)
    add_aliases_restricted(BOOK, 'pip', ['Wolf'], only_paragraphs=chapters(53))
    add_aliases(BOOK, 'joe', ['Joseph Gargery', 'Mr. Gargery', 'Joseph', 'Gargery'])
    add_aliases_restricted(BOOK, 'mrs-joe', ['Mum'], exclude_paragraphs=chapters(22, 23))
    add_aliases_restricted(BOOK, 'mrs-pocket', ['Mum'], only_paragraphs=chapters(22, 23))
    add_aliases(BOOK, 'mr-wopsle', ['Mr. Waldengarver', 'Waldengarver', 'Wopsle'])
    add_aliases(BOOK, 'magwitch', ['Mr. Campbell', 'Campbell'])
    add_aliases(BOOK, 'jaggers', ['Jaggerth'])
    add_aliases(BOOK, 'mr-wemmicks-father', ['Aged P.', 'Aged P', 'Aged'])
    add_aliases(BOOK, 'wemmick', ['John'])
    add_aliases(BOOK, 'bentley-drummle', ['Bentley'])
    add_aliases(BOOK, 'matthew-pocket', ['Matthew'])


if __name__ == '__main__':
    main()
