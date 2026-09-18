#!/usr/bin/env python3
"""Ulysses: second clickable-names sweep.

The first sweep (add_ulysses_entities.py) took the recurring Dubliners.
This pass takes the long tail: every multi-token proper name the NER scan
left uncarded (the Cyclops saints' litany, the Aeolus barristers, the
Ithaca inventories, the Oxen and Circe walk-ons) and the single-token
surnames whose every occurrence was read in context. Shops, streets,
pubs and hotels that carry a surname (Gardiner street, Mooney's, Burke's,
Gill's, Harrison's, Boyd's, Andrews, Meade's yard) are left alone;
so are song lines ("Lal the ral"), idioms ("Robbing Peter to pay Paul")
and the Circe pun-genealogy.

Homonyms: Richard = Shakespeare's brother / Richard Best / Richard III
/ Richie Goulding; Peter = Claver / Carey / Teazle / the Apostle …;
Thomas = Aquinas / Silken Thomas / Deane / Kernan …; Charley = Kavanagh
/ Gerty's brother / the Purefoy child; Taylor = John F. Taylor / officer
Taylor; Elizabeth = Elizabeth Hall / the Queen / Elizabeth O'Dowd;
Owen = Goldberg / Roe / Garry; Leo = Bloom (not the zodiac sign).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted

ROOT = Path(__file__).resolve().parents[2]
BOOK = 'ulysses'
P, D, G = 'person', 'deity', 'group'


def _pkg():
    return json.loads((ROOT / f'app/public/data/characters/{BOOK}.v1.json').read_text())


def cid_by_name(fragment):
    hits = sorted({c['id'] for c in _pkg()['editions']['original-en']['characters'] if fragment.lower() in c['snapshots'][0]['name'].lower()})
    assert len(hits) == 1, f'{fragment!r} -> {hits}'
    return hits[0]


def chapters(*chs):
    ed = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
    return {(c['number'], i) for c in ed['chapters'] if c['number'] in chs for i, _ in enumerate(c['paragraphs'])}


def r(eid, name, subtitle, body, aliases, kind=P, role='reference', **kw):
    pkg = _pkg()
    present = tuple(ek for ek in ('original-en', 'modern-en') if eid in {c['id'] for c in pkg['editions'][ek]['characters']})
    absent = tuple(ek for ek in ('original-en', 'modern-en') if ek not in present)
    if present:
        if kw.get('only_paragraphs') is not None or kw.get('exclude_paragraphs'):
            add_aliases_restricted(BOOK, eid, aliases, exclude_paragraphs=kw.get('exclude_paragraphs', frozenset()), only_paragraphs=kw.get('only_paragraphs'), editions=present)
        else:
            add_aliases(BOOK, eid, aliases, editions=present)
    if absent:
        kw.setdefault('strict_editions', ())
        add_e(BOOK, eid, name, subtitle, body, role, kind, aliases, editions=absent, **kw)


def alias(eid, aliases, only_paragraphs=None, exclude_paragraphs=frozenset()):
    pkg = _pkg()
    present = tuple(ek for ek in ('original-en', 'modern-en') if eid in {c['id'] for c in pkg['editions'][ek]['characters']})
    assert present, f'{eid}: no such card'
    if only_paragraphs is not None or exclude_paragraphs:
        add_aliases_restricted(BOOK, eid, aliases, exclude_paragraphs=exclude_paragraphs, only_paragraphs=only_paragraphs, editions=present)
    else:
        add_aliases(BOOK, eid, aliases, editions=present)


def multi(*names, kind=P):
    """Cards for unambiguous multi-token names; id derived from the name."""
    for n in names:
        eid = ''.join(ch if ch.isalnum() else '-' for ch in n.lower().replace('’', '').replace("'", '')).strip('-')
        while '--' in eid:
            eid = eid.replace('--', '-')
        r(eid, n, '', "", [n], kind=kind)


def drop(cid, pred):
    path = ROOT / f'app/public/data/characters/{BOOK}.v1.json'
    pkg = json.loads(path.read_text())
    for ek, ed in pkg['editions'].items():
        data = json.loads((ROOT / f'app/public/data/editions/{BOOK}-{ek}.json').read_text())
        paras = {(c['number'], i): p.replace('\n', ' ') for c in data['chapters'] for i, p in enumerate(c['paragraphs'])}
        before = len(ed['mentions'])
        ed['mentions'] = [m for m in ed['mentions'] if not (m['characterId'] == cid and pred(m, paras[(m['chapterNumber'], m['paragraphIndex'])]))]
        print(BOOK, ek, cid, 'dropped', before - len(ed['mentions']))
    path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')


def fixups():
    # "O’Madden Burke" x20 was bound to the Oxen student Madden's card
    drop('madden', lambda m, t: 'O’Madden' in t[max(0, m['startOffset'] - 2):m['endOffset']])
    r('o-madden-burke', 'O’Madden Burke', '', "", ['Mr O’Madden Burke', 'O’Madden Burke'])
    # Kendal Bushe / Peter Kennedy sit inside spans bound to Seymour Bushe / Miss Kennedy
    drop('seymour-bushe', lambda m, t: (m['chapterNumber'], m['paragraphIndex']) == (7, 382) and t[max(0, m['startOffset'] - 7):m['startOffset']] == 'Kendal ')
    r('kendal-bushe', 'Kendal Bushe', '', "", ['Kendal Bushe'])
    drop('miss-kennedy', lambda m, t: (m['chapterNumber'], m['paragraphIndex']) == (10, 349))
    r('peter-kennedy', 'Peter Kennedy', 'Hairdresser', "", ['Peter Kennedy'])


def main():
    fixups()
    # --- existing cards: new forms
    bloom = 'bloom'
    alias(bloom, ['Leo'], exclude_paragraphs={(17, 348)})
    alias('richard-best', ['Richard'], only_paragraphs={(9, 342), (9, 346)})
    alias('richie-goulding', ['Richard'], only_paragraphs={(17, 39)})
    alias('john-eglinton', ['Mr Magee', 'Magee'], exclude_paragraphs={(9, 315)})
    alias('tom-kernan', ['Thomas Kernan'])
    alias('mrs-riordan', ['Dante'], only_paragraphs={(17, 119)})
    # --- Richard / Peter / Thomas / Charley / Taylor / Elizabeth / Owen
    r('richard-shakespeare', 'Richard Shakespeare', "Shakespeare's brother", "", ['Richard'], only_paragraphs={(9, 340), (9, 374), (9, 381)})
    r('gilbert-shakespeare', 'Gilbert Shakespeare', "Shakespeare's brother", "", ['Gilbert'], only_paragraphs={(9, 340)})
    r('edmund-shakespeare', 'Edmund Shakespeare', "Shakespeare's brother", "", ['Edmund'], only_paragraphs={(9, 340), (9, 346), (9, 374)})
    r('joan-shakespeare', 'Joan Shakespeare', "Shakespeare's sister", "", ['Joan'], only_paragraphs={(9, 271)})
    r('susan-shakespeare', 'Susan', "Shakespeare's daughter", "", ['Susan'], only_paragraphs={(9, 271), (9, 383)})
    r('elizabeth-hall', 'Elizabeth', "Shakespeare's granddaughter", "", ['Elizabeth'], only_paragraphs={(9, 271)})
    r('queen-elizabeth', 'Queen Elizabeth', 'Carrotty Bess', "", ['Elizabeth'], only_paragraphs={(9, 294)})
    r('richard-iii', 'Richard III', 'Richard Crookback', "", ['Richard III', 'Richard Crookback'])
    r('richard-burke', 'Colonel Richard Burke', '', "", ['Richard Burke'])
    r('edmund-burke', 'Edmund Burke', '', "", ['Edmund Burke'])
    r('pisser-burke', 'Pisser Burke', '', "", ['Andrew (Pisser) Burke', 'Pisser Burke', 'pisser Burke'])
    alias('pisser-burke', ['Burke'], only_paragraphs={(18, 5)})
    multi('Peter Teazle', 'Peter Claver', 'Peter Carey', 'Peter Paul M’Swiney', 'Peter Kennedy', 'Peter Salanka', 'Peter the Hermit', 'Peter the Packer', 'Peter Fagan', 'Peter Nolasco', 'Peter O’Brien')
    r('st-peter', 'Peter', 'The Apostle', "", ['Peter'], only_paragraphs={(5, 107), (6, 264), (14, 19)})
    r('st-paul', 'Paul', 'The Apostle', "", ['Paul'], only_paragraphs={(5, 107)})
    r('uncle-peter', 'Uncle Peter', "Cissy Caffrey's uncle", "", ['uncle Peter'])
    r('thomas-aquinas', 'Thomas Aquinas', '', "", ['Thomas Aquinas', 'Saint Thomas', 'Aquinas', 'Aquin'])
    r('silken-thomas', 'Silken Thomas', 'Thomas Fitzgerald', "", ['Thomas Fitzgerald', 'Silken Thomas', 'silken Thomas'])
    multi('Thomas Campbell', 'Thomas Connellan', 'Thomas Conneff', 'Thomas Lipton', 'Thomas Cook', 'Thomas Osborne Davis', 'Thomas Otto', 'Thomas Pile')
    r('thomas-deane', 'Sir Thomas Deane', 'Architect', "", ['Sir Thomas Deane', 'Thomas Deane'])
    r('charley-kavanagh', 'Charley Kavanagh', '', "", ['Charley Kavanagh'])
    r('charley-macdowell', 'Charley', "Gerty's brother", "", ['Charley'], only_paragraphs={(13, 36)})
    r('charley-purefoy', 'Charley', 'Purefoy child', "", ['Charley'], only_paragraphs={(14, 49)})
    r('mary-alice-purefoy', 'Mary Alice', 'Purefoy child', "", ['Mary Alice'], only_paragraphs={(14, 49)})
    r('frederick-albert-purefoy', 'Frederick Albert', 'Purefoy child', "", ['Frederick Albert'], only_paragraphs={(14, 49)})
    r('john-f-taylor', 'John F. Taylor', 'Orator', "", ['John F. Taylor', 'John F Taylor'])
    alias('john-f-taylor', ['Taylor'], only_paragraphs={(7, 418)})
    r('officer-taylor', 'Officer Taylor', '', "", ['officer Taylor'])
    r('owen-goldberg', 'Owen Goldberg', '', "", ['Owen Goldberg'])
    r('owen-roe', 'Owen Roe', '', "", ['Owen Roe'])
    r('owen-garry', 'Owen Garry', '', "", ['Owen Garry'])
    alias('owen-garry', ['Owen'], only_paragraphs={(12, 187)})
    # --- single-token surnames read in context
    r('seymour-bushe', 'Seymour Bushe', 'K.C.', "", ['Seymour Bushe', 'Bushe'], exclude_paragraphs=set())
    r('kendal-bushe', 'Kendal Bushe', '', "", ['Kendal Bushe'])
    r('gumley', 'Gumley', '', "The municipal supernumerary minding stones.", ['Gumley'])
    r('magee-mor-matthew', 'Magee Mor Matthew', "John Eglinton's father", "", ['Magee Mor Matthew'])
    r('seymour', 'Seymour', "Mulligan's friend", "", ['Seymour'], only_paragraphs=chapters(1))
    r('miss-dunne', 'Miss Dunne', "Boylan's secretary", "", ['Miss Dunne'])
    r('boyd', 'Boyd', '', "", ['Boyd'], only_paragraphs={(10, 455)})
    r('miss-kenn', 'Miss Kenn', '', "", ['Miss Kenn', 'miss Kenn'])
    r('andrew-horne', 'Andrew Horne', 'Of Holles street hospital', "", ['Andrew Horne', 'lord Andrew'])
    r('gardner', 'Lieutenant Gardner', "Molly's Gardner", "", ['Gardner'], only_paragraphs=chapters(18))
    r('aubrey', 'Aubrey', 'John Aubrey', "", ['Aubrey'], only_paragraphs={(9, 294)})
    r('cochrane', 'Cochrane', 'Pupil', "", ['Cochrane'], only_paragraphs=chapters(2))
    r('helen-of-troy', 'Helen', 'Of Troy', "", ['Argive Helen', 'Helen'], exclude_paragraphs={(12, 61), (12, 360)})
    r('aunt-sally', 'Aunt Sally', 'Sally Goulding', "", ['aunt Sally'])
    r('justice-andrews', 'Justice Andrews', '', "", ['Justice Andrews'])
    r('mr-coghlan', 'Mr Coghlan', '', "", ['Mr Coghlan'])
    multi('George Roberts', 'Lord Roberts', 'Hoppy Holohan', 'Michael Meade', 'Professor Magennis', 'Kate Collins', 'Wilkie Collins', 'Dr Collins', 'Robert Emery', 'Robert Emmet', 'Robert O’Reilly', 'Robert Greene', 'George Robert Mesias', 'Reggy Wylie', 'Gwendolen Dubedat', 'Gretta Conroy', 'Gabriel Conroy', 'Father Conroy', 'Atty Dillon', 'Floey Dillon', 'Grissel Steevens', 'Maria Monk', 'Mrs Bellingham', 'Miss Ferguson', 'Captain Dalton', 'Luke Doyle', 'Caroline Doyle', 'Jack Mooney', 'Owen Goldberg', 'Solomon of Droma', 'Miss Cummins', 'Dante Alighieri', 'Finn MacCool', 'M’Curdy Atkinson', 'Michael Meade')
    alias('hoppy-holohan', ['Holohan'])
    alias('professor-magennis', ['Magennis'])
    alias('reggy-wylie', ['Reggy'], only_paragraphs=chapters(13))
    alias('atty-dillon', ['Atty'])
    alias('floey-dillon', ['Floey'])
    alias('miss-ferguson', ['Ferguson'], only_paragraphs={(15, 1436)})
    alias('luke-doyle', ['Luke'], only_paragraphs={(17, 393), (17, 395)})
    alias('mcurdy-atkinson', ['Atkinson'])
    alias('dante-alighieri', ['Dante'], only_paragraphs={(16, 176)})
    alias('finn-maccool', ['Finn'], only_paragraphs={(12, 312)})
    r('robert-ball', 'Sir Robert Ball', 'Astronomer royal', "", ['Sir Robert Ball', 'sir Robert Ball', 'Robert Ball', 'sir Robert'])
    r('justice-fitzgibbon', 'Mr Justice Fitzgibbon', '', "", ['Gerald Fitzgibbon', 'Justice Fitzgibbon', 'Fitzgibbon'], exclude_paragraphs={(10, 13), (17, 39)})
    r('st-augustine', 'Saint Augustine', '', "", ['Augustine'])
    r('mosenthal', 'Mosenthal', 'Playwright', "", ['Mosenthal'])
    r('glynn', 'Old Glynn', 'Organist', "", ['Joseph Glynn', 'Glynn'])
    r('rossini', 'Rossini', '', "", ['Rossini'])
    r('mozart', 'Mozart', '', "", ['Mozart'])
    r('mercadante', 'Mercadante', '', "", ['Mercadante'])
    r('meyerbeer', 'Meyerbeer', '', "", ['Meyerbeer'])
    r('peake', 'Peake', '', "", ['Peake'])
    r('mario', 'Mario', 'The tenor', "", ['Mario'])
    r('whelan', 'Whelan', 'Of the Express', "", ['Whelan'], only_paragraphs={(8, 112), (15, 617)})
    r('garibaldi', 'Garibaldi', '', "", ['Garibaldi'], only_paragraphs={(8, 133)})
    r('miss-dubedat', 'Miss Dubedat', '', "", ['miss Dubedat'])
    r('shelley', 'Shelley', '', "", ['Shelley'])
    r('douglas-hyde', 'Hyde', 'Douglas Hyde', "", ['Hyde'])
    r('romeo', 'Romeo', '', "", ['Romeo'])
    r('juliet', 'Juliet', '', "", ['Juliet'])
    r('dumas', 'Dumas', '', "", ['Dumas'])
    r('socrates', 'Socrates', '', "", ['Socrates'])
    r('xanthippe', 'Xanthippe', '', "", ['Xanthippe'])
    r('myrto', 'Myrto', '', "", ['Myrto'])
    r('yeats', 'Yeats', '', "", ['Yeats'])
    r('keats', 'Keats', '', "", ['Keats'])
    r('swinburne', 'Swinburne', '', "", ['Swinburne'])
    r('king-solomon', 'Solomon', '', "", ['Solomon'], only_paragraphs={(11, 545)})
    r('lilith', 'Lilith', '', "", ['Lilith'], kind=D)
    r('phyllis', 'Phyllis', '', "", ['Phyllis'], only_paragraphs={(14, 45)})
    r('omar-khayyam', 'Omar', 'Omar Khayyam', "", ['Omar'], only_paragraphs={(15, 35)})
    r('maria-theresa', 'Maria Theresa', '', "", ['Maria Teresa', 'Maria Theresia'])
    r('princess-selene', 'Princess Selene', '', "", ['princess Selene', 'Selene'])
    r('philippe', 'Philippe', '', "", ['Philippe'])
    r('aunt-hegarty', 'Aunt Hegarty', '', "", ['aunt Hegarty'])
    r('danny-murphy', 'Danny', "The sailor's son", "", ['Danny'])
    r('theodore-purefoy', 'Theodore Purefoy', 'Doady', "Mina Purefoy's husband.", ['Doady'], only_paragraphs={(14, 49)})
    r('hozier', 'Hozier', '', "", ['Hozier'])
    r('narcissus', 'Narcissus', '', "", ['Narcissus'])
    r('hester-stanhope', 'Hester', 'Hester Stanhope', "", ['Hester'])
    # --- Molly's Gibraltar people and the Ithaca lists
    multi('Mrs Stanhope', 'Mr Stanhope', 'Captain Groves', 'Lunita Laredo', 'Kathleen Kearney', 'Nancy Blake', 'Bill Bailey', 'Conny Connolly', 'Warden Daly', 'Billy Prescott', 'Newcastle Williams', 'Fanny MCoys', 'Henny Doyle', 'Katty Lanner', 'Ulysses Grant', 'Garnet Wolseley', 'Eliza Tudor', 'Nell Gwynn', 'Peg Woffington', 'Lady Godiva', 'Kate Bateman', 'Jenny Lind', 'Antoinette Sterling', 'Minnie Hauck', 'Ristori')
    multi('Daniel Magrane', 'Francis Wade', 'Francis Froedman', 'Francis Dennehy', 'Francis Brady', 'Francis Xavier', 'Francis Beaumont', 'John Fletcher', 'Cecil Turnbull', 'Abraham Chatterton', 'Jack Meredith', 'Percy Apjohn', 'Luke and Caroline Doyle', 'Matthew F. Kane', 'Julius Mastiansky', 'Daniel Tallon', 'Laurence Bloomfield', 'Gustav Freytag', 'Wisdom Hely', 'Alderman John Hooper', 'Joseph Cuffe', 'Benjamin Dollard', 'Michael Corley', 'Patrick Michael Corley', 'Christina Goulding', 'Kate Morkan', 'Julia Morkan', 'Edmund Ignatius Rice', 'Ignatius Rice', 'Fanny Higgins', 'Rudolph Bloom', 'Ellen Higgins', 'Thomas Otto', 'Jessie Noir', 'Nelly Bouverist', 'Cecil Hicks', 'Spencer Harty', 'Sir Robert Ball', 'Robert Ball', 'Herschel', 'Galle', 'Bode', 'Kepler', 'Walsingham', 'G. Clifton Bingham', 'Arnold Dolmetsch', 'Farnaby', 'Byrd', 'Jans Pieter Sweelinck', 'Doulandus', 'Ivan St Austell', 'Hilton St Just', 'Osmond Tearle', 'Elsa Potter', 'Herr Hauptmann Hainau', 'Epiphanius Monachus', 'Fenius Farsaigh', 'Ferdinand Lassalle', 'Ephraim Marks', 'Thomas Pile', 'Dunbar Plunket Barton', 'Karl Marx', 'Jean Jacques Rousseau', 'Timothy Harrington', 'Maurice Butterly', 'Lewy Lawson', 'Norman W. Tupper', 'Louis Werner', 'Terence Mulcahy', 'Mervyn Browne', 'H. Dennany', 'Thomas Campbell', 'Robert Emery', 'Napper Tandy', 'Shapland Tandy', 'Perkin Warbeck', 'Louis Veuillot', 'Maud Gonne', 'Foxy Campbell', 'Joachim Abbas', 'Dan Occam', 'Connolly Norman', 'Billy Pitt', 'Blackwood Price', 'Bathing Crissie', 'Gustave Moreau', 'Robert Greene', 'Sidney Lee', 'Walt Whitman', 'Johann Most', 'Hughie Wills', 'T. Caulfield Irwin', 'Louis H. Victory', 'Herr Bleibtreu', 'Sancho Panza', 'Dulcinea', 'Lawn Tennyson', 'Nell Gwynn Herpyllis', 'Eyre Chatterton', 'Gregor Grey', 'Ignatius Gallaher', 'Tim Healy', 'Tim Kelly', 'Michelangelo Hayes', 'Harvey Duff', 'Morny Cannon', 'Lady Mountcashel', 'Dr Horne', 'Charley Kavanagh', 'Jubainville', 'Brandes', 'Dowden', 'Fred Ryan', 'Isaac Butt', 'Anne Kearns', 'Lizzie Twigg', 'Thomas Deane', 'Robert Emmet', 'Peter Carey', 'Bridie Kelly', 'Winny Rippingham', 'Lady Cairns', 'Hy Franks', 'Dusty Rhodes', 'Lotty Clarke', 'Georgina Johnson', 'Nurse Quigley', 'Alec Bannon', 'Austin Meldon', 'Samuel Childs', 'Hairy Iopas', 'Owen Garry', 'Jem Corbet', 'Lundy Foot', 'H. G. Heseltine', 'G. N. Morphy', 'Theobald Mathew', 'Horace Wheatley', 'Thomas Conneff', 'Christopher Columbus', 'Napoleon Bonaparte', 'Patricio Velasquez', 'Valentine Greatrakes', 'Gautama Buddha', 'Paracelsus', 'Muhammad', 'Julius Caesar', 'William Tell', 'Captain Moonlight', 'Captain Boycott', 'Shane O’Neill', 'Father John Murphy', 'Patrick Sarsfield', 'Red Hugh O’Donnell', 'Dark Rosaleen', 'Patrick W. Shakespeare', 'Brian Confucius', 'Murtagh Gutenberg', 'Art MacMurragh', 'Jim MacDermott', 'Ditto MacAnaspey', 'Manus Tomaltach', 'Sara Curran', 'Mabel Vaughan', 'Jemina Brown', 'Roygbiv Vance', 'Barney Kiernan', 'Dan Dawson', 'Superintendent Laracy', 'Sam Bohee', 'Irving Bishop', 'Signor Maffei', 'Peggy Griffin', 'Jim Bludso', 'Katherine Brophy', 'Carl Rosa', 'Bags Comisky', 'Enoch Arden', 'Jake Crane', 'Abe Kirschner', 'Ally Sloper', 'Minnie Watchman', 'Donald Turnbull', 'Handy Andy', 'Haroun Al Raschid', 'Louis Quinze', 'Rufus Isaacs', 'Ponchielli', 'Palestrina', 'Liszt', 'Spinoza', 'Darwin', 'Ibsen', 'Edison', 'Leonardo', 'Michelangelo', 'Menelaus', 'Achilles', 'Cassandra', 'Cressida', 'Griselda', 'Prospero', 'Macbeth', 'Macduff', 'Shylock', 'Wolsey', 'Sirr', 'Barabbas', 'Goliath', 'Zarathustra', 'Thor', 'Thoth', 'Demeter', 'Lir', 'Mananaan', 'Oisin', 'Ossian', 'Caolte', 'Strongbow')
    # --- the Cyclops saints' litany (12,513)
    litany = ['S. Cyr', 'S. Isidore Arator', 'S. James the Less', 'S. Phocas of Sinope', 'S. Julian Hospitator', 'S. Felix de Cantalice', 'S. Simon Stylites', 'S. Stephen Protomartyr', 'S. John of God', 'S. Ferreol', 'S. Leugarde', 'S. Theodotus', 'S. Vulmar', 'S. Richard', 'S. Vincent de Paul', 'S. Martin of Todi', 'S. Martin of Tours', 'S. Alfred', 'S. Joseph', 'S. Denis', 'S. Cornelius', 'S. Leopold', 'S. Bernard', 'S. Terence', 'S. Edward', 'S. Owen Caniculus', 'S. Anonymous', 'S. Eponymous', 'S. Pseudonymous', 'S. Homonymous', 'S. Paronymous', 'S. Synonymous', 'S. Laurence O’Toole', 'S. James of Dingle and Compostella', 'S. Columcille', 'S. Columba', 'S. Celestine', 'S. Colman', 'S. Kevin', 'S. Brendan', 'S. Frigidian', 'S. Senan', 'S. Fachtna', 'S. Columbanus', 'S. Gall', 'S. Fursey', 'S. Fintan', 'S. Fiacre', 'S. John Nepomuc', 'S. Thomas Aquinas', 'S. Ives of Brittany', 'S. Michan', 'S. Herman-Joseph', 'S. Aloysius Gonzaga', 'S. Stanislaus Kostka', 'S. John Berchmans', 'S. Gervasius', 'S. Servasius', 'S. Bonifacius', 'S. Bride', 'S. Kieran', 'S. Canice of Kilkenny', 'S. Jarlath of Tuam', 'S. Finbarr', 'S. Pappin of Ballymun', 'S. Lucy', 'S. Brigid', 'S. Attracta', 'S. Dympna', 'S. Ita', 'S. Marion Calpensis', 'S. Barbara', 'S. Scholastica', 'S. Ursula', 'S. Wolstan']
    for n in litany:
        eid = 'saint-' + ''.join(ch if ch.isalnum() else '-' for ch in n[3:].lower().replace('’', '')).strip('-')
        while '--' in eid:
            eid = eid.replace('--', '-')
        r(eid, n.replace('S. ', 'Saint '), '', "", [n, n.replace('S. ', 'Saint ')], only_paragraphs={(12, 513)})


if __name__ == '__main__':
    main()
