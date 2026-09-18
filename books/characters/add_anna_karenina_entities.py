#!/usr/bin/env python3
"""Add named figures to anna-karenina (Garnett). Bodies minimal, from
first-mention context. Every ambiguous first name was read in full:

- Kostya -> Levin, Vassenka -> Veslovsky, Katya -> Kitty (Nikolay's name
  for her), Pierre -> Petritsky, Varvara Andreevna -> Varenka, Mihail
  Vassilievitch -> Sludin: aliases on existing cards.
- "Alexander": Vronsky's brother (chapter 58) vs. Kitty's father Prince
  Alexander Shtcherbatsky vs. the order of Alexander Nevsky -- bound by
  full forms only. Kitty's father (never carded!) gets a card; the
  "young Prince Shtcherbatsky" drowned in the Baltic is a separate one.
- "Ivan": Ivan Parmenov the peasant (chapters 80-81) bound; the other
  Ivans (a cowherd, a servant, two "Ivan Petrovitch"es) left unbound.
- "Pyotr": Pyotr Dmitrievitch the doctor vs. Anna's footman Pyotr
  (chapters 216-219) -- split; Pyotr Oblonsky and Bol skipped.
- "Philip": Levin's servant, excluding Philip Ivanitch Nikitin and
  St. Philip's day. "John": Sir John (chapter 41) vs. the John in
  Mihailov's painting -- split. "Liza": Liza Merkalova, excluding a
  different Liza at 222. "Marie"/"Masha"/"Vassily"/"Mihail" bare:
  too many referents, only their full-name forms bound.
- Animals get cards like Rocinante did: Laska, Krak, Frou-Frou, Diana,
  Pava.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity
from add_aliases import add_aliases
from add_histories_helpers import add_entity_excluding as add_e

BOOK = 'anna-karenina'
P = 'person'

E = [
    ('golenishtchev', 'Golenishtchev', "An old acquaintance Vronsky meets in Italy.", 'supporting', ['Golenishtchev']),
    ('grisha', 'Grisha', "Stepan Arkadyevitch's youngest boy.", 'supporting', ['Grisha']),
    ('tanya', 'Tanya', "Stepan Arkadyevitch's eldest girl.", 'supporting', ['Tanya']),
    ('lily', 'Lily', "The smallest of Dolly's children.", 'reference', ['Lily']),
    ('laska', 'Laska', "Levin's setter bitch.", 'supporting', ['Laska']),
    ('krak', 'Krak', "Stepan Arkadyevitch's spot-and-tan pointer.", 'reference', ['Krak']),
    ('frou-frou', 'Frou-Frou', "Vronsky's mare.", 'supporting', ['Frou-Frou']),
    ('diana-mare', 'Diana', "The dainty mare bearing Kuzovlev in the race.", 'reference', ['Diana']),
    ('pava', 'Pava', "Levin's cow, who has calved.", 'reference', ['Pava']),
    ('petritsky', 'Petritsky', "Vronsky's friend and favourite comrade, left his rooms in Petersburg.", 'supporting', ['Petritsky']),
    ('lizaveta-petrovna', 'Lizaveta Petrovna', "The midwife sent for at Kitty's confinement.", 'supporting', ['Lizaveta Petrovna']),
    ('tit', 'Tit', "Levin's preceptor in the art of mowing.", 'supporting', ['Tit']),
    ('stremov', 'Stremov', "Old Stremov, an admirer in Liza Merkalova's set.", 'reference', ['Stremov']),
    ('ryabinin', 'Ryabinin', "A merchant who comes to buy Oblonsky's forest.", 'supporting', ['Ryabinin']),
    ('marya-nikolaevna', 'Marya Nikolaevna', "The partner of Nikolay Levin's life, whom he took out of a bad house.", 'supporting', ['Marya Nikolaevna']),
    ('landau', 'Landau', "A Frenchman thick with Lidia Ivanovna, later Count Bezzubov.", 'supporting', ['Landau', 'Jules Landau', 'Bezzubov']),
    ('tushkevitch', 'Tushkevitch', "A handsome, fair-haired young man in Betsy's set.", 'reference', ['Tushkevitch']),
    ('lvov', 'Lvov', "The diplomat who married Natalia Shtcherbatskaya.", 'reference', ['Lvov']),
    ('natalia-lvova', 'Natalia Lvova', "Kitty's and Dolly's sister, married to the diplomat Lvov.", 'reference', ['Lvova', 'Madame Lvova']),
    ('nevyedovsky', 'Nevyedovsky', "A former university professor proposed as marshal of the province.", 'reference', ['Nevyedovsky']),
    ('myakaya', 'Princess Myakaya', "Noted for her simplicity and rough manners, nicknamed enfant terrible.", 'supporting', ['Myakaya']),
    ('vassily-lukitch', 'Vassily Lukitch', "Seryozha's tutor.", 'supporting', ['Vassily Lukitch']),
    ('vassily-fedorovitch', 'Vassily Fedorovitch', "Levin's bailiff.", 'reference', ['Vassily Fedorovitch']),
    ('metrov', 'Metrov', "A distinguished scientific man from Petersburg.", 'reference', ['Metrov']),
    ('mahotin', 'Mahotin', "Vronsky's most dangerous rival in the race.", 'reference', ['Mahotin']),
    ('mihailov', 'Mihailov', "A Russian artist living in Italy.", 'supporting', ['Mihailov']),
    ('snetkov', 'Snetkov', "Marshal of the province, a nobleman of the old school.", 'reference', ['Snetkov']),
    ('annushka', 'Annushka', "Anna's maid.", 'supporting', ['Annushka']),
    ('kapitonitch', 'Kapitonitch', "The Karenins' porter.", 'reference', ['Kapitonitch']),
    ('mitya', 'Mitya', "Kitty and Levin's baby son.", 'supporting', ['Mitya']),
    ('kritsky', 'Kritsky', "Nikolay Levin's friend from Kiev, persecuted by the police.", 'reference', ['Kritsky']),
    ('korney', 'Korney', "Anna's old servant.", 'reference', ['Korney']),
    ('sorokina', 'Princess Sorokina', "A young princess seen with Varya at the theatre.", 'reference', ['Sorokina']),
    ('vorkuev', 'Vorkuev', "A publisher and author.", 'reference', ['Vorkuev']),
    ('bryansky', 'Bryansky', "A man Vronsky must see about the horses.", 'reference', ['Bryansky']),
    ('sappho-shtoltz', 'Sappho Shtoltz', "A blonde of a new type in Betsy's set.", 'reference', ['Sappho Shtoltz', 'Sappho']),
    ('tchirikov', 'Tchirikov', "Levin's best man, a Moscow judge and bear-hunting companion.", 'reference', ['Tchirikov']),
    ('yegor', 'Yegor', "A good-hearted hotel servant Levin talks with.", 'reference', ['Yegor']),
    ('sludin', 'Sludin', "Secretary of Karenin's department.", 'reference', ['Sludin', 'Mihail Vassilievitch']),
    ('pestsov', 'Pestsov', "A Moscow celebrity invited to dinner.", 'reference', ['Pestsov']),
    ('grinevitch', 'Grinevitch', "A Kammerjunker on Oblonsky's board.", 'reference', ['Grinevitch']),
    ('nikitin', 'Nikitin', "The old veteran on Oblonsky's board.", 'reference', ['Nikitin']),
    ('kamerovsky', 'Kamerovsky', "A cavalry captain of Vronsky's regiment.", 'reference', ['Kamerovsky']),
    ('mishka', 'Mishka', "A peasant sent to sow.", 'reference', ['Mishka']),
    ('vaska', 'Vaska', "A young mower, once Levin's coachman.", 'reference', ['Vaska']),
    ('patti', 'Patti', "The singer everyone is going to hear.", 'reference', ['Patti']),
    ('annie', 'Annie', "Anna's baby girl.", 'supporting', ['Annie']),
    ('miss-hoole', 'Miss Hoole', "The Oblonsky children's English governess.", 'reference', ['Hoole']),
    ('spencer', 'Spencer', "The philosopher Levin dislikes.", 'reference', ['Spencer']),
    ('ryezunov', 'Fyodor Ryezunov', "A clever carpenter who takes land in partnership.", 'reference', ['Ryezunov']),
    ('shuraev', 'Shuraev', "A peasant who takes over the vegetable gardens.", 'reference', ['Shuraev']),
    ('kouzma', 'Kouzma', "Levin's servant.", 'supporting', ['Kouzma']),
    ('marya-borissovna', 'Countess Marya Borissovna', "Named in a joke about women running the war.", 'reference', ['Marya Borissovna']),
    ('tchetchensky', 'Prince Tchetchensky', "The subject of the old prince's funny story.", 'reference', ['Tchetchensky']),
    ('krivin', 'Krivin', "A bald head always found where the best people are.", 'reference', ['Krivin']),
    ('venden', 'Venden', "A government clerk with a complaint against the officers.", 'reference', ['Venden']),
    ('madame-vrede', 'Madame Vrede', "An old lady Anna claims to be visiting.", 'reference', ['Vrede']),
    ('venovsky', 'Venovsky', "A young comrade for whom Vronsky stood surety.", 'reference', ['Venovsky']),
    ('dunyasha', 'Dunyasha', "Kitty's maid.", 'reference', ['Dunyasha']),
    ('homiakov', 'Homiakov', "A theologian Levin reads.", 'reference', ['Homiakov']),
    ('matrona-philimonovna', 'Matrona Philimonovna', "The Oblonskys' nurse.", 'supporting', ['Matrona Philimonovna', 'Marya Philimonovna', 'Matrona']),
    ('fomin', 'Fomin', "A sharp fellow in a case before the board.", 'reference', ['Fomin']),
    ('korsunsky', 'Korsunsky', "A renowned director of dances.", 'reference', ['Korsunsky']),
    ('tyndall', 'Tyndall', "Author of a treatise on heat that Levin reads.", 'reference', ['Tyndall']),
    ('buzulukov', 'Buzulukov', "An officer asked after.", 'reference', ['Buzulukov']),
    ('kaulbach', 'Kaulbach', "A painter an actress is said to have studied.", 'reference', ['Kaulbach']),
    ('vlassieva', 'the Vlassieva girl', "Said to be in love with Sir John.", 'reference', ['Vlassieva']),
    ('michelli', 'Michelli', "An authority Levin is told he hasn't read.", 'reference', ['Michelli']),
    ('pryatchnikov', 'Pryatchnikov', "Subject of a story at dinner.", 'reference', ['Pryatchnikov']),
    ('komissarov', 'Komissarov', "One of Lidia Ivanovna's past passions.", 'reference', ['Komissarov']),
    ('kartasova', 'Madame Kartasova', "A thin little woman who turns her back on Anna at the theatre.", 'reference', ['Kartasova']),
    ('sventitsky', 'Sventitsky', "A deputy prosecutor a valet is said to resemble.", 'reference', ['Sventitsky']),
    ('hannah', 'Hannah', "Anna's English protégée.", 'reference', ['Hannah']),
    ('schopenhauer', 'Schopenhauer', "Among the philosophers Levin reads.", 'reference', ['Schopenhauer']),
    ('malthus', 'Malthus', "Host of a delightful shooting party.", 'reference', ['Malthus']),
    ('shakespeare', 'Shakespeare', "Among the subjects Vronsky's comrade likes to talk about.", 'reference', ['Shakespeare']),
    ('raphael', 'Raphael', "Among the subjects Vronsky's comrade likes to talk about.", 'reference', ['Raphael']),
    ('marie-sanina', 'Marie Sanina', "A woman who lost her only child and found comfort in faith.", 'reference', ['Marie Sanina']),
    ('mihail-petrovitch', 'Mihail Petrovitch', "A landowner in the discussion of farming.", 'reference', ['Mihail Petrovitch']),
    ('enoch', 'Enoch', "The one patriarch Seryozha remembers.", 'reference', ['Enoch']),
    ('isaac', 'Isaac', "Named in the wedding liturgy.", 'reference', ['Isaac']),
    ('masha-tchibisova', 'Masha Tchibisova', "A dancer Stepan Arkadyevitch thinks of.", 'reference', ['Masha Tchibisova']),
    ('varya', 'Varya', "Princess Varya Tchirkova, wife of Vronsky's elder brother.", 'supporting', ['Varya']),
    ('ivan-parmenov', 'Ivan Parmenov', "A young peasant loading hay with his wife.", 'reference', ['Ivan Parmenov']),
    ('pyotr-dmitrievitch', 'Pyotr Dmitrievitch', "The doctor at Kitty's confinement.", 'reference', ['Pyotr Dmitrievitch']),
    ('alexander-vronsky', 'Alexander Vronsky', "Vronsky's elder brother, a colonel.", 'reference', ['Alexander Vronsky']),
]

if __name__ == '__main__':
    add_aliases(BOOK, 'levin', ['Kostya'])
    add_aliases(BOOK, 'veslovsky', ['Vassenka'])
    add_aliases(BOOK, 'kitty', ['Katya'])
    add_aliases(BOOK, 'varenka', ['Varvara Andreevna'])
    for eid, name, body, role, aliases in E:
        add_entity(BOOK, eid, name, '', body, role, P, aliases)
    add_aliases(BOOK, 'petritsky', ['Pierre'])
    add_e(BOOK, 'princess-varvara', 'Princess Varvara', '', "Anna's aunt, staying with her in the country.", 'supporting', P,
          ['Princess Varvara', 'Varvara'], exclude_paragraphs={(158, 13)})
    add_e(BOOK, 'prince-shtcherbatsky', 'Prince Shtcherbatsky', '', "Kitty's father, Prince Alexander Dmitrievitch Shtcherbatsky.", 'supporting', P,
          ['Alexander Dmitrievitch Shtcherbatsky', 'Prince Alexander Shtcherbatsky', 'Prince Shtcherbatsky'], exclude_paragraphs={(6, 1)})
    add_e(BOOK, 'young-shtcherbatsky', 'young Prince Shtcherbatsky', '', "Kitty and Dolly's brother, who went into the navy and was drowned in the Baltic.", 'reference', P,
          ['Prince Shtcherbatsky', 'Young Shtcherbatsky'], only_paragraphs={(6, 1), (6, 2)})
    add_e(BOOK, 'philip', 'Philip', '', "A servant at Levin's Pokrovskoe.", 'reference', P, ['Philip'], exclude_paragraphs={(5, 28), (80, 11)})
    add_e(BOOK, 'sir-john', 'Sir John', '', "A preacher talked of in Betsy's drawing-room.", 'reference', P, ['Sir John', 'John'], only_paragraphs={(41, 2), (41, 6)})
    add_e(BOOK, 'john-in-the-picture', 'John', '', "The figure of John in Mihailov's painting of Pilate.", 'reference', P, ['John'], only_paragraphs={(135, 3), (136, 10)})
    add_e(BOOK, 'liza-merkalova', 'Liza Merkalova', '', "A thin brunette of Betsy's set, with old Stremov as her admirer.", 'supporting', P,
          ['Liza Merkalova', 'Liza'], exclude_paragraphs={(222, 22)})
    add_e(BOOK, 'pyotr-footman', 'Pyotr', '', "Anna's footman.", 'reference', P, ['Pyotr'], only_paragraphs={(216, 26), (218, 13), (219, 3)})
