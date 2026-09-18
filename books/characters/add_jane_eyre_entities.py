#!/usr/bin/env python3
"""Jane Eyre: clickable-names pass.

Existing 20 cards were bound only under formal forms (Miss Eyre / Jane Eyre,
Mr. Rochester, St. John, Miss Ingram...). Adds the everyday forms (Jane,
Janet, Rochester, Edward, Blanche, Mason/Richard/Dick, Grace, Adela, Die,
Burns, Brocklehurst) and ~85 new cards: the Thornfield and Moor House
servants, the house-party (Eshtons, Lynns, Dents, Ingrams), the Lowood
staff, the Reeds' circle, Bertha and the Rochester family, the animals
(Pilot, Carlo, Mesrour), and the allusions.

Homonyms split by chapter: John Reed vs John the Thornfield/Ferndean
manservant; Mary Rivers vs Mary Ingram vs Mary the servant at Ferndean vs
Mary Ann Wilson; Robert Leaven vs little Robert; Theodore Brocklehurst vs
Theodore (Tedo) Ingram; Grace Poole vs "children of Grace".
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
BOOK = 'jane-eyre'
P = 'person'

_ED = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
_PARAS = [(c['number'], i, p) for c in _ED['chapters'] for i, p in enumerate(c['paragraphs'])]


def chapters(*chs):
    return {(ch, i) for ch, i, p in _PARAS if ch in chs}


def main():
    # ---- specific names first --------------------------------------------
    add_e(BOOK, 'bertha-mason', 'Bertha Mason', "Rochester's wife", "Bertha Antoinetta Mason, the madwoman in the third storey — the Mrs. Rochester of Thornfield.", 'major', P,
          ['Bertha Antoinetta Mason', 'Bertha Mason', 'Mrs. Rochester', 'Bertha', 'Antoinetta'])
    add_e(BOOK, 'rowland-rochester', 'Rowland Rochester', "Rochester's elder brother", "The brother for whom the whole estate was meant; dead before the story opens.", 'reference', P,
          ['Mr. Rowland Rochester', 'Rowland Rochester', 'Mr. Rowland', 'Rowland'])
    add_e(BOOK, 'old-mr-rochester', 'Old Mr. Rochester', "Rochester's father", "Who arranged the West Indies marriage rather than divide the estate.", 'reference', P, ['Old Mr. Rochester', 'old Mr. Rochester'])
    add_e(BOOK, 'old-mr-rivers', 'Old Mr. Rivers', "St. John's father", "The plain gentleman of Marsh End, lately dead when Jane arrives.", 'reference', P, ['Old Mr. Rivers', 'old Mr. Rivers'])
    add_e(BOOK, 'celine-varens', 'Céline Varens', 'French opera-dancer', "Rochester's Parisian mistress, Adèle's mother.", 'supporting', P, ['Céline Varens', 'Céline'])
    add_e(BOOK, 'giacinta', 'Giacinta', "Rochester's Italian mistress", "", 'reference', P, ['Giacinta'])
    add_e(BOOK, 'clara', 'Clara', "Rochester's German mistress", "", 'reference', P, ['Clara'])
    add_e(BOOK, 'mary-ann-wilson', 'Mary Ann Wilson', 'Lowood friend', "Jane's shrewd, story-telling comrade during the typhus spring.", 'reference', P, ['Mary Ann Wilson', 'Mary Ann'])
    add_e(BOOK, 'mary-ingram', 'Mary Ingram', "Blanche's sister", "Milder and more open than Blanche, but deficient in life.", 'supporting', P,
          ['Mary Ingram'])
    add_aliases_restricted(BOOK, 'mary-ingram', ['Mary'], only_paragraphs={(17, 66), (17, 67), (17, 70), (17, 79)})
    add_e(BOOK, 'lady-ingram', 'Lady Ingram', 'The Dowager', "Blanche's mother: fierce, hard eyes and a dictatorial voice.", 'supporting', P, ['Dowager Lady Ingram', 'Lady Ingram'])
    add_e(BOOK, 'lord-ingram', 'Lord Ingram', "Blanche's brother", "Theodore, 'Tedo' — tall, handsome, apathetic.", 'supporting', P, ['Lord Ingram'])
    add_aliases_restricted(BOOK, 'lord-ingram', ['Theodore', 'Tedo'], only_paragraphs=chapters(17))
    add_e(BOOK, 'theodore-brocklehurst', 'Theodore', "Brocklehurst's son", "", 'reference', P, ['Theodore'], only_paragraphs={(4, 68)})
    add_e(BOOK, 'augusta-brocklehurst', 'Augusta', "Brocklehurst's daughter", "Went with her mama to see the Lowood girls' plain dress.", 'reference', P, ['Augusta'])
    add_e(BOOK, 'broughton-brocklehurst', 'Master Broughton Brocklehurst', '', "", 'reference', P, ['Master Broughton Brocklehurst'])
    add_e(BOOK, 'robert-leaven', 'Robert Leaven', "Bessie's husband", "The Gateshead coachman who fetches Jane to Mrs. Reed's deathbed.", 'supporting', P,
          ['Robert Leaven', 'Leaven', 'Robert'], exclude_paragraphs={(29, 107), (21, 103), (21, 110)})
    add_e(BOOK, 'bobby-leaven', 'Bobby', "Bessie's son", "", 'reference', P, ['Bobby'])
    add_aliases_restricted(BOOK, 'bobby-leaven', ['Robert'], only_paragraphs={(21, 103), (21, 110)})
    add_e(BOOK, 'uncle-reed', 'Mr. Reed', "Jane's uncle", "Mrs. Reed's late husband, who took the orphan Jane in and died in the red-room.", 'supporting', P, ['Uncle Reed', 'uncle Reed', 'Mr. Reed'])
    add_e(BOOK, 'john-eyre', 'John Eyre', "Jane's uncle in Madeira", "The wine-merchant uncle whose letter and legacy change everything.", 'supporting', P, ['John Eyre', 'Mr. Eyre'])
    add_e(BOOK, 'miss-wilson', 'Miss Wilson', "The Ingrams' governess", "A poor sickly thing, in Blanche's account.", 'reference', P, ['Miss Wilsons', 'Miss Wilson'])
    add_e(BOOK, 'madame-joubert', 'Madame Joubert', "The Ingrams' governess", "", 'reference', P, ['Madame Joubert'])

    # ---- aliases on existing cards ------------------------------------------
    add_aliases_restricted(BOOK, 'jane', ['Jane Elliott', 'Miss Elliott', 'Miss Jane', 'Janet', 'Jeannette', 'Jane'], exclude_paragraphs={(21, 110)})
    add_aliases_restricted(BOOK, 'jane', ['Joan'], only_paragraphs={(1, 17)})
    add_aliases(BOOK, 'rochester', ['Edward Fairfax Rochester', 'Edward Rochester', 'Mr. Edward', 'Rochester', 'Edward'])
    add_aliases(BOOK, 'mrs-fairfax', ['Madame Fairfax'])
    add_aliases(BOOK, 'adele', ['Adela Varens', 'Miss Adela', 'Adela', 'Miss Varens', 'Varens'])
    add_aliases(BOOK, 'st-john-rivers', ['Mr. St. John', 'St John', 'Mr. Rivers'])
    add_aliases(BOOK, 'diana-rivers', ['Die'])
    add_aliases_restricted(BOOK, 'mary-rivers', ['Mary'], only_paragraphs=chapters(28, 29, 30, 31, 32, 33, 34, 35, 36, 38))
    add_aliases(BOOK, 'helen-burns', ['Burns'])
    add_aliases_restricted(BOOK, 'brocklehurst', ['Rev. Robert Brocklehurst', 'Brocklehurst'], exclude_paragraphs={(4, 68)})
    add_aliases(BOOK, 'mrs-reed', ['Sarah Reed', 'Aunt Reed', 'aunt Reed'])
    add_aliases_restricted(BOOK, 'john-reed', ['Master John', 'Master Reed', 'Mr. John', 'Jack', 'John'], only_paragraphs=chapters(1, 2, 3, 4, 10, 21))
    add_aliases(BOOK, 'eliza-reed', ['Eliza Reed', 'Lizzy'])
    add_aliases(BOOK, 'georgiana-reed', ['Georgy'])
    add_aliases(BOOK, 'bessie', ['Bessie Lee', 'Bessie Leaven', 'Mrs. Leaven'])
    add_aliases_restricted(BOOK, 'grace-poole', ['Mrs. Poole', 'Grace', 'Poole'], exclude_paragraphs={(7, 27)})
    add_aliases(BOOK, 'blanche-ingram', ['Blanche Ingram', 'Blanche'])
    add_aliases(BOOK, 'mason', ['Richard Mason', 'Mason', 'Richard', 'Dick'])
    add_aliases(BOOK, 'rosamond-oliver', ['Rosamond Oliver', 'Miss Rosamond', 'Rosamond'])
    add_aliases(BOOK, 'miss-temple', ['Maria Temple'])

    # ---- Gateshead ------------------------------------------------------------
    add_e(BOOK, 'abbot', 'Miss Abbot', "Mrs. Reed's maid", "The lady's-maid who helps Bessie lock Jane in the red-room.", 'supporting', P, ['Martha Abbot', 'Miss Abbot', 'Abbot'])
    add_e(BOOK, 'sarah-servant', 'Sarah', 'Gateshead servant', "", 'reference', P, ['Sarah'], only_paragraphs={(3, 14), (3, 15)})
    add_e(BOOK, 'mr-lloyd', 'Mr. Lloyd', 'Apothecary', "The kindly apothecary who suggests school for Jane.", 'supporting', P, ['Mr. Lloyd'])
    add_e(BOOK, 'mr-miles', 'Mr. Miles', 'Schoolmaster', "John Reed's master.", 'reference', P, ['Mr. Miles'])
    add_e(BOOK, 'mr-gibson', 'Mr. Gibson', "Georgiana's uncle", "Who at last invites her to town.", 'reference', P, ['Mr. Gibson', 'Gibson'])

    # ---- Lowood ---------------------------------------------------------------
    add_e(BOOK, 'miss-miller', 'Miss Miller', 'Under-teacher', "The ruddy, hurried under-teacher who receives Jane at Lowood.", 'supporting', P, ['Miss Miller'])
    add_e(BOOK, 'miss-smith', 'Miss Smith', 'Lowood teacher', "Attends to the work and cuts out.", 'reference', P, ['Miss Smith'])
    add_e(BOOK, 'madame-pierrot', 'Madame Pierrot', 'French teacher', "From Lisle; teaches Jane her French.", 'reference', P, ['Madame Pierrot'])
    add_e(BOOK, 'miss-gryce', 'Miss Gryce', 'Lowood teacher', "The heavy Welshwoman who snores.", 'reference', P, ['Miss Gryce'])
    add_e(BOOK, 'mrs-harden', 'Mrs. Harden', 'Lowood housekeeper', "A woman after Mr. Brocklehurst's own heart.", 'reference', P, ['Mrs. Harden'])
    add_e(BOOK, 'barbara', 'Barbara', 'Lowood servant', "", 'reference', P, ['Barbara'])
    add_e(BOOK, 'julia-severn', 'Julia Severn', 'Lowood pupil', "Whose naturally curling hair Brocklehurst orders cut off.", 'reference', P, ['Julia Severn', 'Julia'])
    add_e(BOOK, 'catherine-johnstone', 'Catherine Johnstone', 'Lowood pupil', "", 'reference', P, ['Catherine Johnstone'])
    add_e(BOOK, 'mr-bates', 'Mr. Bates', 'Surgeon', "Sent for during the typhus.", 'reference', P, ['Mr. Bates'])
    add_e(BOOK, 'mr-nasmyth', 'Mr. Nasmyth', 'Clergyman', "Marries Miss Temple.", 'reference', P, ['Mr. Nasmyth'])

    # ---- Thornfield -----------------------------------------------------------
    add_e(BOOK, 'leah', 'Leah', 'Housemaid', "", 'supporting', P, ['Leah'])
    add_e(BOOK, 'sophie', 'Sophie', "Adèle's nurse", "", 'supporting', P, ['Sophie'])
    add_e(BOOK, 'john-servant', 'John', 'Manservant', "The old manservant at Thornfield, later at Ferndean with his wife Mary.", 'supporting', P, ['John'], only_paragraphs=chapters(11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 36, 37))
    add_e(BOOK, 'mary-servant', 'Mary', "John's wife", "The cook at Thornfield, later at Ferndean.", 'reference', P, ['Mary'], only_paragraphs=chapters(37))
    add_e(BOOK, 'pilot', 'Pilot', "Rochester's dog", "The great black-and-white Newfoundland.", 'supporting', P, ['Pilot'])
    add_e(BOOK, 'mesrour', 'Mesrour', "Rochester's horse", "", 'reference', P, ['Mesrour'])
    add_e(BOOK, 'mr-carter', 'Mr. Carter', 'Surgeon', "Dresses Mason's wounds in the night.", 'supporting', P, ['Mr. Carter', 'Carter'])
    add_e(BOOK, 'sam', 'Sam', 'Footman', "Ambassador to the gipsy.", 'reference', P, ['Sam'])
    add_e(BOOK, 'mother-bunches', 'Mother Bunches', 'The gipsy', "", 'reference', P, ['Mother Bunches'])
    add_e(BOOK, 'colonel-dent', 'Colonel Dent', 'House guest', "A fine soldierly man.", 'reference', P, ['Colonel Dent'])
    add_e(BOOK, 'mrs-dent', 'Mrs. Dent', 'House guest', "Gentle and ladylike.", 'reference', P, ['Mrs. Colonel Dent', 'Mrs. Dent'])
    add_e(BOOK, 'mr-eshton', 'Mr. Eshton', 'Magistrate', "", 'reference', P, ['Mr. Eshton'])
    add_e(BOOK, 'mrs-eshton', 'Mrs. Eshton', '', "", 'reference', P, ['Mrs. Eshton'])
    add_e(BOOK, 'amy-eshton', 'Amy Eshton', '', "", 'reference', P, ['Amy Eshton', 'Amy'])
    add_e(BOOK, 'louisa-eshton', 'Louisa Eshton', '', "", 'reference', P, ['Louisa Eshton', 'Louisa'])
    add_e(BOOK, 'sir-george-lynn', 'Sir George Lynn', 'Member for Millcote', "", 'reference', P, ['Sir George Lynn'])
    add_e(BOOK, 'lady-lynn', 'Lady Lynn', '', "", 'reference', P, ['Lady Lynn'])
    add_e(BOOK, 'henry-lynn', 'Henry Lynn', '', "", 'reference', P, ['Mr. Henry Lynn', 'Henry Lynn'])
    add_e(BOOK, 'frederick-lynn', 'Frederick Lynn', '', "", 'reference', P, ['Mr. Frederick Lynn', 'Frederick Lynn'])
    add_e(BOOK, 'mr-briggs', 'Mr. Briggs', 'Solicitor', "The London solicitor who stops the wedding.", 'supporting', P, ['Mr. Briggs', 'Briggs'])
    add_e(BOOK, 'mr-wood', 'Mr. Wood', 'Clergyman', "The clergyman at the interrupted wedding.", 'reference', P, ['Mr. Wood', 'Wood'], only_paragraphs=chapters(26))
    add_e(BOOK, 'gytrash', 'Gytrash', 'North-country spirit', "Bessie's tale of a spirit in the form of horse, mule or dog.", 'reference', P, ['Gytrash'])

    # ---- Moor House / Morton --------------------------------------------------
    add_e(BOOK, 'hannah', 'Hannah', 'Servant at Moor House', "The old servant who first refuses Jane at the door.", 'supporting', P, ['Hannah'])
    add_e(BOOK, 'carlo', 'Carlo', "St. John's pointer", "", 'reference', P, ['Carlo'])
    add_e(BOOK, 'mr-oliver', 'Mr. Oliver', 'Needle manufacturer', "The sole rich man in the parish, Rosamond's father.", 'supporting', P, ['Mr. Oliver', 'Bill Oliver'])
    add_e(BOOK, 'alice-wood', 'Alice Wood', "Jane's attendant at Morton", "", 'reference', P, ['Alice Wood'])

    # ---- allusions -----------------------------------------------------------
    add_e(BOOK, 'bewick', 'Bewick', 'Engraver', "His History of British Birds, Jane's refuge in the window-seat.", 'reference', P, ['Bewick'])
    add_e(BOOK, 'gulliver', 'Gulliver', '', "", 'reference', P, ['Gulliver'])
    add_e(BOOK, 'mahomet', 'Mahomet', '', "", 'reference', P, ['Mahomet'])
    add_e(BOOK, 'rizzio', 'Rizzio', '', "Mary Queen of Scots' musician, in Blanche's banter.", 'reference', P, ['Rizzio'])
    add_e(BOOK, 'david', 'David', '', "The fiddler David; Saul's David.", 'reference', P, ['David'])
    add_e(BOOK, 'solomon', 'Solomon', '', "", 'reference', P, ['Solomon'])
    add_e(BOOK, 'macbeth', 'Macbeth', '', "", 'reference', P, ['Macbeth'])
    add_e(BOOK, 'nebuchadnezzar', 'Nebuchadnezzar', '', "", 'reference', P, ['Nebuchadnezzar'])
    add_e(BOOK, 'felix', 'Felix', '', "The governor who put Paul off to a more convenient season.", 'reference', P, ['Felix'])
    add_e(BOOK, 'st-paul', 'St. Paul', '', "", 'reference', P, ['St. Paul', 'Paul'])
    add_e(BOOK, 'silas', 'Silas', '', "", 'reference', P, ['Silas'])


if __name__ == '__main__':
    main()
