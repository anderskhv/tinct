#!/usr/bin/env python3
"""Pride and Prejudice: clickable-names pass.

Aliases for the existing 23 cards (Miss Lucas -> Charlotte, Catherine ->
Kitty, bare Fitzwilliam -> the Colonel, Charles -> Bingley, Louisa ->
Mrs. Hurst, Lizzie, Miss Eliza, Miss Lydia, brother/sister Gardiner) and
the rest of the named cast: the Forsters, Mrs. Long, Maria Lucas, Denny,
Mrs. Jenkinson, Mrs. Reynolds, Hill, Mr. Jones, Captain Carter, Mrs.
Younge, Mrs. Annesley, Anne de Bourgh, Lady Anne Darcy, Sir Lewis, Mary
King, and the one-line names (Pratt, Chamberlayne, Haggerston, Dawson...).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'pride-and-prejudice'
P = 'person'
_ED = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
_PARAS = [(c['number'], i, p) for c in _ED['chapters'] for i, p in enumerate(c['paragraphs'])]


def chapters(*chs):
    return {(ch, i) for ch, i, p in _PARAS if ch in chs}


def r(eid, name, subtitle, body, aliases, role='reference', **kw):
    add_e(BOOK, eid, name, subtitle, body, role, P, aliases, **kw)


def main():
    # ---- specific forms first -------------------------------------------
    r('lady-anne-darcy', 'Lady Anne Darcy', "Darcy's mother", "Lady Catherine's sister.", ['Lady Anne Darcy', 'Lady Anne'])
    r('anne-de-bourgh', 'Miss de Bourgh', "Lady Catherine's daughter", "Sickly and cross; intended from the cradle for Darcy.", ['Miss de Bourgh', 'Anne de Bourgh', 'Anne'], role='supporting')
    r('sir-lewis-de-bourgh', 'Sir Lewis de Bourgh', '', "Lady Catherine's late husband.", ['Sir Lewis de Bourgh', 'Sir Lewis'])
    r('mary-king', 'Mary King', 'Heiress', "The freckled girl with ten thousand pounds Wickham briefly courts.", ['Mary King', 'Miss King'], role='supporting')
    r('maria-lucas', 'Maria Lucas', "Charlotte's sister", "A good-humoured girl, but as empty-headed as her father.", ['Maria Lucas', 'Maria'], role='supporting')
    r('colonel-forster', 'Colonel Forster', 'Of the militia', "Whose regiment goes to Brighton, taking Lydia with it.", ['Colonel Forster'], role='supporting')
    r('mrs-forster', 'Mrs. Forster', "The Colonel's young wife", "Harriet, Lydia's particular friend, who invites her to Brighton.", ['Mrs. Forster', 'Harriet'], role='supporting')
    r('mrs-long', 'Mrs. Long', 'Neighbour', "", ['Mrs. Long'])
    r('mr-denny', 'Denny', 'Officer', "Wickham's friend, who brings him from London.", ['Mr. Denny', 'Denny'])
    r('mrs-jenkinson', 'Mrs. Jenkinson', "Miss de Bourgh's companion", "", ['Mrs. Jenkinson'])
    r('mrs-reynolds', 'Mrs. Reynolds', 'Housekeeper at Pemberley', "Whose praise of her master turns Elizabeth's opinion.", ['Mrs. Reynolds'], role='supporting')
    r('hill', 'Hill', 'Housekeeper at Longbourn', "", ['Mrs. Hill', 'Hill'], only_paragraphs=chapters(13, 49))
    r('mr-jones', 'Mr. Jones', 'Apothecary', "", ['Mr. Jones'])
    r('captain-carter', 'Captain Carter', 'Officer', "", ['Captain Carter'])
    r('mrs-younge', 'Mrs. Younge', "Georgiana's former governess", "Wickham's confederate.", ['Mrs. Younge'])
    r('mr-robinson', 'Mr. Robinson', '', "", ['Mr. Robinson'])
    r('mrs-annesley', 'Mrs. Annesley', "Georgiana's companion", "", ['Mrs. Annesley'])
    r('john-servant', 'John', 'Servant', "", ['John'])
    r('pratt', 'Pratt', 'Officer', "", ['Pratt'])
    r('mr-morris', 'Mr. Morris', '', "", ['Mr. Morris'])
    r('miss-watson', 'Miss Watson', '', "", ['Miss Watson'])
    r('richard', 'Richard', "The Philipses' servant", "", ['Richard'])
    r('colonel-miller', 'Colonel Miller', '', "", ['Colonel Miller'])
    r('sally', 'Sally', 'Servant', "", ['Sally'])
    r('sarah', 'Sarah', 'Servant', "", ['Sarah'])
    r('the-miss-webbs', 'The Miss Webbs', '', "", ['Miss Webbs'])
    r('miss-pope', 'Miss Pope', 'Governess', "", ['Miss Pope'])
    r('lady-metcalfe', 'Lady Metcalfe', '', "", ['Lady Metcalfe'])
    r('miss-grantley', 'Miss Grantley', '', "", ['Miss Grantley'])
    r('haggerston', 'Haggerston', "Mr. Gardiner's attorney", "", ['Haggerston'])
    r('mr-stone', 'Mr. Stone', '', "", ['Mr. Stone'])
    r('mrs-nichols', 'Mrs. Nichols', '', "", ['Mrs. Nichols', 'Nicholls'])
    r('chamberlayne', 'Chamberlayne', 'Officer', "Dressed up in woman's clothes for a lark.", ['Chamberlayne'])
    r('william-goulding', 'William Goulding', '', "", ['William Goulding'])
    r('dawson', 'Dawson', "Lady Catherine's maid", "", ['Dawson'])
    r('fordyce', 'Fordyce', 'Sermons', "", ['Fordyce'])
    r('the-harringtons', 'The Harringtons', '', "", ['Harringtons', 'Pen'])
    r('ashworth', 'Ashworth', 'A house', "", ['Ashworth'])

    # ---- aliases on existing cards --------------------------------------
    add_aliases(BOOK, 'charlotte', ['Miss Lucas'])
    add_aliases_restricted(BOOK, 'kitty', ['Catherine'], exclude_paragraphs=set())
    add_aliases(BOOK, 'colonel-fitzwilliam', ['Fitzwilliam'])
    add_aliases(BOOK, 'bingley', ['Charles'])
    add_aliases(BOOK, 'mrs-hurst', ['Louisa'])
    add_aliases(BOOK, 'elizabeth', ['Miss Eliza Bennet', 'Eliza Bennet', 'Elizabeth Bennet', 'Miss Eliza', 'Lizzie'])
    add_aliases(BOOK, 'lydia', ['Miss Lydia'])
    add_aliases(BOOK, 'mr-gardiner', ['brother Gardiner'])
    add_aliases(BOOK, 'mrs-gardiner', ['sister Gardiner'])
    add_aliases(BOOK, 'mr-hurst', ['Hurst'])
    add_aliases(BOOK, 'sir-william-lucas', ['Sir William'])
    add_aliases(BOOK, 'darcy', ['Mr. Fitzwilliam Darcy'])
    add_aliases(BOOK, 'georgiana', ['Georgiana'])


if __name__ == '__main__':
    main()
