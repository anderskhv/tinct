#!/usr/bin/env python3
"""Ulysses: clickable-names pass, first sweep.

Joyce's Dublin has ~2,900 distinct capitalised surface forms; this pass
takes every name that recurs (NER count >= 3) plus the well-known cast,
with the ambiguous bare first names read in context and bound only where
they are one person:

- "Joe" is Joe Hynes only in the Cyclops chapter (12); elsewhere Joe
  Brady, Joe Chamberlain, Joe Maas, Joe Cuffe.
- "Martin" is Martin Cunningham except the litany of saints (12,513).
- "Simon" is Simon Dedalus except "Simon Lazarus" (9,174).
- "Mr Dedalus" is Simon; bare "Dedalus" is Stephen (Mulligan's address).
- "Ben" is Ben Dollard except Ben Howth and old Ben Jonson (9,18).
- "Martha" is Martha Clifford except the Bethany sisters (5,87),(7,24).
- "Bob" bare in Sirens/Wandering Rocks is Father Bob Cowley.
- "Virag" in Circe (15) is Lipoti Virag, elsewhere Rudolph Virag/Bloom.
- "Pat" is bald Pat the waiter only in Sirens (11).
- "Tommy" is Tommy Caffrey in Nausicaa (13); Tommy Moore is carded apart.
- "Bella"/"Bello", "Kitty", "Florry", "Zoe" are the Circe women (15).
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
BOOK = 'ulysses'
P = 'person'
_ED = json.loads((ROOT / f'app/public/data/editions/{BOOK}-original-en.json').read_text())
_PARAS = [(c['number'], i, p) for c in _ED['chapters'] for i, p in enumerate(c['paragraphs'])]


def chapters(*chs):
    return {(ch, i) for ch, i, p in _PARAS if ch in chs}


def paras_with(pattern, chs=None):
    rx = re.compile(pattern)
    return {(ch, i) for ch, i, p in _PARAS if (chs is None or ch in chs) and rx.search(p)}


def r(eid, name, subtitle, body, aliases, role='reference', loose=False, **kw):
    if loose:
        kw.setdefault('strict_editions', ())
    add_e(BOOK, eid, name, subtitle, body, role, P, aliases, **kw)


def main():
    SAINTS = {(12, 513)}

    # ---- specific multi-word forms and homonym splits first --------------
    r('john-howard-parnell', 'John Howard Parnell', 'City marshal', "Parnell's brother, playing chess in the D.B.C.", ['John Howard Parnell'])
    r('parnell', 'Parnell', 'Charles Stewart Parnell', "The dead Chief, whose fall haunts the day.", ['Charles Stewart Parnell', 'Parnell'], role='supporting')
    r('gordon-bennett', 'Gordon Bennett', 'The motor race', "", ['Gordon Bennett'])
    r('sergeant-major-bennett', 'Bennett', 'Sergeant-major', "Whom Myler Keogh beat.", ['Bennett'])
    r('nicholas-dudley', 'Reverend Nicholas Dudley', '', "", ['Nicholas Dudley'])
    r('earl-of-dudley', 'The Earl of Dudley', 'Lord Lieutenant', "William Humble, whose cavalcade closes Wandering Rocks.", ['William Humble', 'Dudley'], role='supporting')
    r('pat-farrell', 'Pat Farrell', 'Newsboy', "", ['Pat Farrell'])
    r('cashel-boyle-farrell', "Cashel Boyle O'Connor Fitzmaurice Tisdall Farrell", 'Dublin eccentric', "Who walks outside the lampposts.", ['Cashel Boyle O’Connor Fitzmaurice Tisdall Farrell', 'Fitzmaurice Tisdall Farrell', 'Cashel Boyle', 'Farrell'])
    r('lipoti-virag', 'Lipoti Virag', "Bloom's grandfather", "The basilicogrammate of Circe.", ['Virag'], only_paragraphs=chapters(15))
    r('rudolph-virag', 'Rudolph Virag', "Bloom's father", "Who changed his name to Bloom and died at Ennis.", ['Rudolf Virag', 'Rudolph Virag', 'Rudolph', 'Virag'], exclude_paragraphs=chapters(15), role='supporting')
    r('tommy-moore', 'Tommy Moore', 'Poet', "Whose statue points over the meeting of the waters.", ['Tommy Moore', 'Thomas Moore'])
    r('ben-jonson', 'Ben Jonson', '', "", ['Ben'], only_paragraphs={(9, 18)})
    r('simon-lazarus', 'Simon Lazarus', '', "", ['Simon Lazarus'])
    r('john-henry-menton', 'John Henry Menton', 'Solicitor', "Who once beat Bloom at bowls and never forgave him.", ['John Henry Menton', 'John Henry', 'Menton'], role='supporting')
    r('willy-dignam', 'Willy Dignam', '', "", ['Willy Dignam'])
    r('willy-murray', 'Willy Murray', '', "", ['Willy Murray'])
    r('patsy-dignam', 'Patsy Dignam', "Paddy Dignam's son", "Master Patrick Aloysius Dignam, with the porksteaks.", ['Master Patrick Aloysius Dignam', 'Patsy Dignam', 'Patsy'])
    r('joe-brady', 'Joe Brady', 'Invincible', "", ['Joe Brady'])
    r('joe-chamberlain', 'Joe Chamberlain', '', "", ['Joe Chamberlain'])
    r('joe-maas', 'Joe Maas', 'Tenor', "", ['Joe Maas'])
    r('joseph-cuffe', 'Joseph Cuffe', 'Cattle dealer', "Bloom's former employer.", ['Joseph Cuffe', 'Joe Cuffe', 'Cuffe'])
    r('mrs-dandrade', 'Mrs Miriam Dandrade', '', "Who sold Bloom her old wraps.", ['Mrs Miriam Dandrade', 'Mrs Dandrade', 'Miriam'])
    r('martha-clifford', 'Martha Clifford', "Henry Flower's correspondent", "", ['Martha Clifford', 'Martha'], exclude_paragraphs={(5, 87), (7, 24)}, role='supporting')

    # ---- aliases on existing cards ---------------------------------------
    add_aliases(BOOK, 'bloom', ['Leopold Bloom', 'Henry Flower', 'Leopold', 'Poldy'])
    add_aliases(BOOK, 'molly', ['Mrs Marion Bloom', 'Marion Bloom', 'Mrs Marion', 'Mrs Bloom', 'Marion'])
    add_aliases(BOOK, 'milly', ['Millicent'])
    add_aliases(BOOK, 'stephen', ['Kinch', 'Steve'])
    add_aliases(BOOK, 'mulligan', ['Malachi', 'Buck'])
    add_aliases(BOOK, 'boylan', ['Hugh Boylan', 'Blazes'])
    add_aliases(BOOK, 'simon-dedalus', ['Mr Dedalus'])
    add_aliases_restricted(BOOK, 'simon-dedalus', ['Simon'], exclude_paragraphs={(9, 174)})
    add_aliases(BOOK, 'stephen', ['Dedalus'])
    add_aliases(BOOK, 'dignam', ['Mr Dignam', 'Patrick Dignam'])
    add_aliases_restricted(BOOK, 'joe-hynes', ['Joe'], only_paragraphs=chapters(12))
    add_aliases(BOOK, 'omolloy', ['J. J.'])
    add_aliases(BOOK, 'jack-power', ['Mr Power'])
    add_aliases(BOOK, 'tom-kernan', ['Mr Kernan', 'Kernan'])
    add_aliases(BOOK, 'ned-lambert', ['Lambert', 'Ned'])
    add_aliases(BOOK, 'martin-cunningham', ['Cunningham'])
    add_aliases_restricted(BOOK, 'martin-cunningham', ['Martin'], exclude_paragraphs=SAINTS)
    add_aliases(BOOK, 'gerty', ['MacDowell'])
    add_aliases(BOOK, 'mr-deasy', ['Deasy'])
    add_aliases(BOOK, 'corny-kelleher', ['Kelleher', 'Corny'])
    add_aliases(BOOK, 'nosey-flynn', ['Flynn', 'Nosey'])
    add_aliases(BOOK, 'mrs-breen', ['Mrs Josie Breen', 'Josie Breen', 'Josie Powell', 'Josie'])
    add_aliases(BOOK, 'denis-breen', ['Breen'])
    add_aliases(BOOK, 'alf-bergan', ['Bergan', 'Alf'])
    add_aliases(BOOK, 'myles-crawford', ['Crawford', 'Myles'])
    add_aliases(BOOK, 'almidano-artifoni', ['Artifoni'])

    # ---- the Dubliners -----------------------------------------------------
    r('father-cowley', 'Father Cowley', 'Bob Cowley', "The unfrocked priest dodging his creditors; sings in the Ormond.", ['Father Cowley', 'Bob Cowley', 'Cowley'], role='supporting')
    add_aliases_restricted(BOOK, 'father-cowley', ['Bob'], only_paragraphs=chapters(10, 11))
    r('ben-dollard', 'Ben Dollard', 'Bass barreltone', "Sings The Croppy Boy in the Ormond.", ['Ben Dollard', 'Benjamin Dollard', 'Dollard'], role='supporting')
    add_aliases_restricted(BOOK, 'ben-dollard', ['Ben'], exclude_paragraphs=paras_with(r'Ben Howth') | {(9, 18)})
    r('miss-douce', 'Miss Douce', 'Lydia, barmaid of the Ormond', "Bronze by gold.", ['Miss Douce', 'Lydia Douce', 'Douce'], role='supporting')
    r('miss-kennedy', 'Miss Kennedy', 'Mina, barmaid of the Ormond', "Gold by bronze.", ['Miss Kennedy', 'Mina Kennedy', 'Kennedy'], role='supporting')
    r('professor-machugh', 'Professor MacHugh', '', "In the newspaper office.", ['Professor MacHugh', 'MacHugh'], role='supporting')
    r('dixon', 'Dixon', 'Medical student', "Who once dressed Bloom's bee sting.", ['Dixon', 'Mr Dixon'], role='supporting')
    r('cissy-caffrey', 'Cissy Caffrey', '', "", ['Cissy Caffrey', 'Cissy', 'Ciss'], role='supporting')
    r('edy-boardman', 'Edy Boardman', '', "", ['Edy Boardman', 'Edy'], role='supporting')
    r('tommy-caffrey', 'Tommy Caffrey', '', "", ['Tommy Caffrey'])
    add_aliases_restricted(BOOK, 'tommy-caffrey', ['Tommy'], only_paragraphs=chapters(13))
    r('jacky-caffrey', 'Jacky Caffrey', '', "", ['Jacky Caffrey', 'Jacky'])
    r('john-wyse-nolan', 'John Wyse Nolan', '', "", ['John Wyse Nolan', 'John Wyse'], role='supporting')
    r('bella-cohen', 'Bella Cohen', 'Brothel-keeper', "Bella, who becomes Bello.", ['Bella Cohen', 'BELLA', 'BELLO', 'Bella', 'Bello'], only_paragraphs=chapters(15), role='supporting')
    r('zoe-higgins', 'Zoe Higgins', '', "", ['Zoe Higgins', 'ZOE', 'Zoe'], role='supporting')
    r('kitty-ricketts', 'Kitty Ricketts', '', "", ['Kitty Ricketts', 'KITTY', 'Kitty'], only_paragraphs=chapters(15))
    r('florry-talbot', 'Florry Talbot', '', "", ['Florry Talbot', 'FLORRY', 'Florry'])
    r('bob-doran', 'Bob Doran', '', "On one of his periodicals.", ['Bob Doran', 'Doran'], role='supporting')
    r('goodwin', 'Goodwin', 'Professor', "Molly's old accompanist.", ['Goodwin'])
    r('bantam-lyons', 'Bantam Lyons', '', "Who takes Bloom's throwaway for a tip.", ['Bantam Lyons', 'Lyons', 'Bantam'], role='supporting')
    r('davy-byrne', 'Davy Byrne', 'Publican', "The moral pub.", ['Davy Byrne'], role='supporting')
    add_aliases_restricted(BOOK, 'davy-byrne', ['Byrne'], only_paragraphs=chapters(8))
    r('george-russell', 'George Russell', 'A. E.', "The poet-editor Stephen owes a guinea.", ['George Russell', 'Russell', 'A. E.'], role='supporting')
    r('dilly-dedalus', 'Dilly Dedalus', "Stephen's sister", "Buying a French primer with her penny.", ['Dilly Dedalus', 'Dilly'], role='supporting')
    r('maggy-dedalus', 'Maggy Dedalus', "Stephen's sister", "", ['Maggy'])
    r('katey-dedalus', 'Katey Dedalus', "Stephen's sister", "", ['Katey'])
    r('boody-dedalus', 'Boody Dedalus', "Stephen's sister", "", ['Boody'], loose=True)
    r('george-lidwell', 'George Lidwell', 'Solicitor', "", ['George Lidwell', 'Lidwell'])
    r('nannetti', 'Nannetti', 'Councillor and foreman', "", ['Councillor Nannetti', 'Nannetti'])
    r('madden', 'Madden', 'Medical student', "", ['Madden'])
    r('long-john-fanning', 'Long John Fanning', 'Subsheriff', "", ['Long John Fanning', 'John Fanning', 'Fanning'])
    r('rudy-bloom', 'Rudy', "Bloom's dead son", "Eleven days old.", ['Rudy'], role='supporting')
    r('bald-pat', 'Pat', 'Waiter of the Ormond', "Bald deaf Pat.", ['Bald Pat', 'bald Pat', 'Pat'], only_paragraphs=chapters(11))
    r('garryowen', 'Garryowen', "The citizen's dog", "", ['Garryowen'])
    r('alexander-keyes', 'Alexander Keyes', 'Tea merchant', "Whose ad Bloom is chasing.", ['Alexander Keyes', 'Keyes'], role='supporting')
    r('sceptre', 'Sceptre', 'Racehorse', "", ['Sceptre'])
    r('throwaway', 'Throwaway', 'Racehorse', "The Gold Cup outsider.", ['Throwaway'])
    r('zinfandel', 'Zinfandel', 'Racehorse', "", ['Zinfandel'])
    r('jimmy-henry', 'Jimmy Henry', 'Assistant town clerk', "", ['Jimmy Henry'])
    r('private-carr', 'Private Carr', '', "Who knocks Stephen down.", ['Private Carr', 'Carr'], role='supporting')
    r('private-compton', 'Private Compton', '', "", ['Private Compton', 'Compton'])
    r('myler-keogh', 'Myler Keogh', 'Boxer', "", ['Myler Keogh', 'Myler'])
    r('costello', 'Punch Costello', 'Medical student', "Frank Costello.", ['Punch Costello', 'Frank Costello', 'Costello'])
    r('mary-driscoll', 'Mary Driscoll', 'Former servant', "", ['Mary Driscoll', 'MARY DRISCOLL'])
    r('kevin-egan', 'Kevin Egan', 'Wild goose in Paris', "", ['Kevin Egan'])
    r('james-stephens', 'James Stephens', 'Fenian', "", ['James Stephens'])
    r('father-conmee', 'Father Conmee', 'John Conmee S.J.', "Who opens Wandering Rocks.", ['Father Conmee', 'John Conmee', 'Conmee'], role='supporting')
    r('chris-callinan', 'Chris Callinan', '', "", ['Chris Callinan'])
    r('philip-beaufoy', 'Philip Beaufoy', 'Prize titbit author', "", ['Philip Beaufoy', 'Beaufoy'])
    r('marie-kendall', 'Marie Kendall', 'Music-hall artiste', "", ['Marie Kendall'])
    r('crimmins', 'Crimmins', 'Publican', "", ['Crimmins'])
    r('michael-gunn', 'Michael Gunn', 'Theatre manager', "", ['Michael Gunn'])
    r('bertha-supple', 'Bertha Supple', '', "", ['Bertha Supple'])
    r('lynch', 'Lynch', 'Medical student', "Stephen's companion in Nighttown.", ['Lynch'], role='supporting')
    add_aliases_restricted(BOOK, 'lynch', ['Mr Vincent', 'Vincent'], only_paragraphs=chapters(14))
    r('percy-apjohn', 'Percy Apjohn', "Bloom's boyhood friend", "", ['Percy Apjohn'])
    r('michael-davitt', 'Michael Davitt', '', "", ['Michael Davitt'])
    r('corley', 'Corley', '', "Lord John Corley, touching Stephen for a shilling.", ['Corley'])
    r('mother-grogan', 'Mother Grogan', '', "", ['Mother Grogan'])
    r('comyn', 'Comyn', 'Schoolboy', "", ['Comyn'])
    r('florence-maccabe', 'Florence MacCabe', '', "", ['Florence MacCabe'])
    r('richie-goulding', 'Richie Goulding', "Stephen's uncle", "Dining with Bloom in the Ormond.", ['Richie Goulding', 'Richie', 'Goulding'], role='supporting')
    r('major-tweedy', 'Major Tweedy', "Molly's father", "", ['Major Tweedy', 'Brian Tweedy', 'Tweedy'], role='supporting')
    r('arthur-griffith', 'Arthur Griffith', '', "", ['Arthur Griffith'])
    r('matcham', 'Matcham', '', "Matcham's Masterstroke.", ['Matcham'])
    r('mcoy', "M'Coy", 'C. P. M’Coy', "Always after a valise.", ['C. P. M’Coy', 'M’Coy'], role='supporting')
    r('hornblower', 'Hornblower', 'Porter at Trinity', "", ['Hornblower'])
    r('father-coffey', 'Father Coffey', '', "", ['Father Coffey', 'Coffey'])
    r('wetherup', 'Wetherup', '', "", ['Wetherup'])
    r('howard-de-walden', 'Howard de Walden', '', "", ['Howard de Walden'])
    r('rothschild', 'Rothschild', '', "", ['Rothschild'])
    r('frederick-falkiner', 'Sir Frederick Falkiner', 'Recorder', "", ['Sir Frederick Falkiner', 'Frederick Falkiner', 'Falkiner'])
    r('richard-best', 'Mr Best', 'Richard Best', "In the library.", ['Mr Best', 'Best'], only_paragraphs=chapters(9), role='supporting')
    r('john-eglinton', 'John Eglinton', '', "In the library.", ['John Eglinton', 'Eglinton'], role='supporting')
    r('lyster', 'Lyster', 'Quaker librarian', "", ['Lyster'])
    r('brunny-lynam', 'Brunny Lynam', '', "", ['Brunny Lynam'])
    r('eugene-stratton', 'Eugene Stratton', '', "", ['Eugene Stratton'])
    r('hugh-c-love', 'Hugh C. Love', 'Reverend', "", ['Hugh C. Love'])
    r('val-dillon', 'Val Dillon', '', "", ['Val Dillon'])
    r('moses-herzog', 'Moses Herzog', '', "", ['Moses Herzog'])
    r('callan', 'Callan', '', "", ['Callan'])
    r('johnny-lever', 'Johnny Lever', '', "", ['Johnny Lever'])
    r('bernard-corrigan', 'Bernard Corrigan', '', "", ['Bernard Corrigan'])
    r('harry-hughes', 'Harry Hughes', '', "", ['Harry Hughes'])
    r('john-hooper', 'John Hooper', 'Alderman', "", ['John Hooper'])
    r('terry', 'Terry', 'Barman at Kiernan\'s', "", ['Terry'])
    r('skin-the-goat', 'Skin-the-Goat', '', "Fitzharris, keeper of the cabman's shelter.", ['Skin-the-Goat'])
    r('murphy', 'Murphy', 'The sailor', "In the cabman's shelter.", ['Murphy'], only_paragraphs=chapters(16))
    r('mina-purefoy', 'Mina Purefoy', '', "Three days in labour at Holles street.", ['Mina Purefoy', 'Mrs Purefoy', 'Purefoy'], role='supporting')
    r('mrs-riordan', 'Mrs Riordan', '', "", ['Mrs Riordan'])
    r('mulvey', 'Mulvey', "Molly's first love", "", ['Mulvey'])
    r('bartell-darcy', "Bartell d'Arcy", 'Tenor', "", ['Bartell d’Arcy'])
    r('sweny', 'Sweny', 'Chemist', "", ['Sweny'])
    r('larry-orourke', "Larry O'Rourke", 'Publican', "", ['Larry O’Rourke', 'O’Rourke'])
    add_aliases_restricted(BOOK, 'larry-orourke', ['Larry'], only_paragraphs=chapters(4, 10, 11))
    r('dlugacz', 'Dlugacz', 'Pork butcher', "", ['Dlugacz'])
    r('man-in-the-macintosh', "M'Intosh", 'The man in the macintosh', "", ['M’Intosh', 'Macintosh'])
    r('paddy-leonard', 'Paddy Leonard', '', "", ['Paddy Leonard'])
    r('tom-rochford', 'Tom Rochford', '', "", ['Tom Rochford', 'Rochford'])
    r('wisdom-hely', 'Wisdom Hely', '', "Bloom's former employer, the stationer.", ['Wisdom Hely', 'Hely'])
    r('antonio', 'Antonio', "The sailor's tattoo", "", ['Antonio'], only_paragraphs=chapters(16))
    r('gerald-ward', 'Gerald Ward', 'A.D.C.', "", ['Gerald Ward'])
    r('george-bernard-shaw', 'George Bernard Shaw', '', "", ['George Bernard Shaw'])
    r('frank-harris', 'Frank Harris', '', "", ['Frank Harris'])
    r('david-sheehy', 'David Sheehy M.P.', '', "", ['David Sheehy'])
    r('albert-edward', 'Albert Edward', 'Prince of Wales', "", ['Albert Edward'])
    r('lord-edward-fitzgerald', 'Lord Edward Fitzgerald', '', "", ['Edward Fitzgerald'])
    r('mary-ann', 'Mary Ann', '', "", ['Mary Ann'])
    r('dick-tivy', 'Dick Tivy', '', "", ['Dick Tivy'])
    r('dick-adams', 'Dick Adams', '', "", ['Dick Adams'])
    r('gerard', 'Gerard', 'Herbalist of Fetter lane', "", ['Gerard'])
    r('ann-hathaway', 'Ann Hathaway', '', "", ['Ann Hathaway', 'Ann Shakespeare'])
    add_aliases_restricted(BOOK, 'ann-hathaway', ['Ann'], only_paragraphs=chapters(9))

    # ---- allusions ---------------------------------------------------------
    r('shakespeare', 'Shakespeare', '', "", ['William Shakespeare', 'Shakespeare'], role='supporting')
    r('jesus', 'Jesus', '', "", ['Jesus'])
    r('moses', 'Moses', '', "", ['Moses'])
    r('mendelssohn', 'Mendelssohn', '', "", ['Mendelssohn'])
    r('maimonides', 'Maimonides', '', "", ['Maimonides'])
    r('rip-van-winkle', 'Rip van Winkle', '', "", ['Rip van Winkle'])
    r('robinson-crusoe', 'Robinson Crusoe', '', "", ['Robinson Crusoe'])
    r('don-giovanni', 'Don Giovanni', '', "", ['Don Giovanni'])
    r('plato', 'Plato', '', "", ['Plato'])
    r('aristotle', 'Aristotle', '', "", ['Aristotle'])
    r('cleopatra', 'Cleopatra', '', "", ['Cleopatra'])
    r('venus', 'Venus', '', "", ['Venus'])
    r('juno', 'Juno', '', "", ['Juno'])
    r('jove', 'Jove', '', "", ['Jove'])
    r('judas', 'Judas', '', "", ['Judas'])
    r('noah', 'Noah', '', "", ['Noah'])
    r('adam', 'Adam', '', "", ['Adam'])
    r('abraham', 'Abraham', '', "", ['Abraham'])
    r('jacob', 'Jacob', '', "", ['Jacob'])
    r('saint-patrick', 'Saint Patrick', '', "", ['Saint Patrick', 'saint Patrick'])
    r('nelson', 'Nelson', '', "The onehandled adulterer on his pillar.", ['Nelson'])
    r('everyman', 'Everyman', '', "", ['Everyman'])
    r('paul-de-kock', 'Paul de Kock', '', "", ['Paul de Kock'])
    r('sir-walter-raleigh', 'Sir Walter Raleigh', '', "", ['Sir Walter Raleigh', 'Sir Walter Ralegh'])
    r('richard-burbage', 'Dick Burbage', '', "", ['Dick Burbage'])
    r('dowland', 'Dowland', '', "", ['Dowland'])


if __name__ == '__main__':
    main()
