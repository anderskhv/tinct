#!/usr/bin/env python3
"""Add real, previously-uncarded named individuals found in don-quixote via
spaCy PERSON-NER (see the clickable-names plan). Bodies are minimal, drawn
from first-mention context, and written to stay spoiler-safe at that point
(Master Pedro and the Countess Trifaldi are both later unmasked; their
cards describe only what the reader knows when they first appear).

Homonyms checked by reading every occurrence:
- "Pedro" (91): Master Pedro the puppeteer (~65, bound on the two-word
  form) vs. the goatherd Pedro of the Chrysostom story (bare "Pedro" in
  chapters 12-13 only) vs. a dozen one-off "Pedro X" names -- of which only
  Don Pedro de Aguilar (the captive's tale) and Pedro Alonso (the
  neighbour who brings Don Quixote home) get cards.
- "Corchuelo": Lorenzo Corchuelo, Aldonza's father, vs. the bachelor
  Corchuelo of the fencing bout -- different people, split.
- "Clara": Dona Clara de Viedma throughout, except one "Clara Perlerina"
  (excluded).
- "Sancha"/"Mari-Sancha": Sancho's daughter (= Sanchica), except a pun on
  Sancho's name and a ballad's "Dona Sancha" (both excluded).
- "Maria": the Christian name Zoraida takes (aliased to her), except
  Teresa's "our Maria" for the daughter (excluded).
- "Amadis": Amadis of Gaul, except the paragraph naming the separate
  romance "Amadis of Greece" (excluded).
Skipped: bare "Peter" (the proverb "difference between Peter and Peter"),
"Diana" (a book title in one place, the goddess in another), "Aurora"
(dawn personified), "Jesus" as an exclamation, "Kandy" (a kingdom), and
"Pedro Perez" is NOT the curate but a wool-farmer named once (added as such).
Aliases folded onto existing cards: Aldonza Lorenzo -> dulcinea, Alonso
Quixano -> don-quixote, Antonia Quixana -> niece, Mari Gutierrez ->
teresa-panza, Chloris (Lothario's poetic name for her) -> camilla.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity
from add_aliases import add_aliases
from add_histories_helpers import add_entity_excluding as add_e

BOOK = 'don-quixote'
P = 'person'

ENTITIES = [
    ('leonela', 'Leonela', "Camilla's handmaid, brought up with her from childhood and kept in her service after her marriage to Anselmo.", 'supporting', ['Leonela']),
    ('ricote', 'Ricote', "The Morisco shopkeeper of Sancho's village, met again disguised as a pilgrim.", 'supporting', ['Ricote']),
    ('tosilos', 'Tosilos', "A Gascon lackey of the duke's, put forward as a substitute opponent for Don Quixote on the field of battle.", 'supporting', ['Tosilos']),
    ('chrysostom', 'Chrysostom', "A famous student-shepherd, said to have died of love for a village girl who wanders the wolds dressed as a shepherdess.", 'supporting', ['Chrysostom']),
    ('marcela', 'Marcela', "The daughter of Guillermo the Rich, who lives as a shepherdess and for whom Chrysostom is said to have died.", 'supporting', ['Marcela']),
    ('leandra', 'Leandra', "A rich damsel over whom the goatherd Eugenio and his rival both sued, left by her father to choose between them.", 'supporting', ['Leandra']),
    ('melisendra', 'Melisendra', "The heroine of Master Pedro's puppet show, “the Release of Melisendra.”", 'reference', ['Melisendra']),
    ('tom-cecial', 'Tom Cecial', "Sancho's neighbour and gossip, recognised with amazement in an unexpected place.", 'supporting', ['Tom Cecial']),
    ('cide-hamete-benengeli', 'Cide Hamete Benengeli', "The Arab historian to whom the history of Don Quixote is attributed.", 'major', ['Cide Hamete Benengeli', 'Cid Hamete Benengeli', 'Cide Hamete', 'Cid Hamete', 'Hamete Benengeli', 'Benengeli']),
    ('lela-marien', 'Lela Marien', "The name by which Zoraida's letters refer to the Virgin Mary.", 'reference', ['Lela Marien', 'Marien']),
    ('andres', 'Andres', "A boy whose master owes him wages, on whose behalf Don Quixote intervenes.", 'supporting', ['Andres']),
    ('ambrosio', 'Ambrosio', "Chrysostom's great friend, a student who also dresses as a shepherd, charged with carrying out his last directions.", 'supporting', ['Ambrosio']),
    ('pedro-recio', 'Doctor Pedro Recio', "Doctor Pedro Recio de Aguero of Tirteafuera, physician to the governor of the island.", 'supporting', ['Pedro Recio', 'Recio']),
    ('ana-felix', 'Ana Felix', "Ricote's daughter.", 'supporting', ['Ana Felix']),
    ('trifaldi', 'Countess Trifaldi', "The Countess Trifaldi, called the Distressed Duenna, who sends her squire ahead to beg an audience at the duke's castle.", 'supporting', ['Trifaldi', 'Lobuna']),
    ('barabbas', 'Barabbas', "Invoked in oaths and curses.", 'reference', ['Barabbas']),
    ('pierres', 'Pierres', "Pierres Papin, lord of the baronies of Utrique, a French novice knight in the army Don Quixote sees in the dust of the sheep.", 'reference', ['Pierres']),
    ('montesinos', 'Montesinos', "The legendary knight whose cave Don Quixote resolves to explore.", 'supporting', ['Montesinos']),
    ('roland', 'Roland', "The paladin of Roncesvalles, also called Orlando and Rotolando.", 'reference', ['Roland', 'Rotolando']),
    ('alexander-the-great', 'Alexander', "Alexander the Great, whose horse Bucephalus is recalled.", 'reference', ['Alexander']),
    ('felixmarte', 'Felixmarte of Hircania', "A knight of romance, named among the famous knights-errant.", 'reference', ['Felixmarte']),
    ('belerma', 'Belerma', "The lady lamented in the cave of Montesinos.", 'reference', ['Belerma']),
    ('saint-peter', 'Saint Peter', "Invoked in proverbs and blessings throughout.", 'reference', ['Saint Peter', 'St. Peter']),
    ('baldwin', 'Baldwin', "A figure from the ballad of the Marquis of Mantua, left wounded on the mountainside.", 'reference', ['Baldwin']),
    ('ovid', 'Ovid', "The Roman poet, whose fables a Spanish poet is praised for translating.", 'reference', ['Ovid']),
    ('lancelot', 'Lancelot', "The knight of the old ballad Don Quixote adapts to his own case.", 'reference', ['Lancelot']),
    ('pentapolin', 'Pentapolin of the Bare Arm', "King of the Garamantas, so called because he goes into battle with his right arm bare, in the army Don Quixote sees.", 'reference', ['Pentapolin']),
    ('dapple', 'Dapple', "Sancho Panza's ass.", 'supporting', ['Dapple']),
    ('agramante', 'Agramante', "The Moorish king whose page Medoro won Angelica.", 'reference', ['Agramante']),
    ('adam', 'Adam', "The first man, recalled from Scripture.", 'reference', ['Adam']),
    ('bireno', 'Bireno', "A faithless lover named in a reproachful song.", 'reference', ['Bireno']),
    ('reinaldos', 'Reinaldos of Montalban', "A knight of romance Don Quixote admires above all.", 'reference', ['Reinaldos']),
    ('friston', 'Friston', "The sage enchanter Don Quixote blames for the disappearance of his library.", 'reference', ['Friston']),
    ('fierabras', 'Fierabras', "Namesake of a balsam Don Quixote believes cures any wound.", 'reference', ['Fierabras']),
    ('oriana', 'Princess Oriana', "The princess for whose pique Amadis did penance.", 'reference', ['Oriana']),
    ('judas', 'Judas', "Named among the traitors of history in a lament.", 'reference', ['Judas']),
    ('hadji-morato', 'Hadji Morato', "A rich Moor of high position, formerly alcaide of La Pata.", 'supporting', ['Hadji Morato']),
    ('julius-caesar', 'Julius Cæsar', "Named as the boldest of captains, yet charged with ambition.", 'reference', ['Julius Cæsar']),
    ('merlin', 'Merlin', "The French enchanter, said to be the devil's son, who holds Montesinos and others enchanted.", 'reference', ['Merlin']),
    ('king-marsilio', 'King Marsilio', "The Moorish king of Sansueña in Master Pedro's puppet show.", 'reference', ['Marsilio']),
    ('roque-guinart', 'Roque Guinart', "A bandit chief whose hands, he says, are more merciful than cruel.", 'supporting', ['Roque Guinart']),
    ('morgante', 'Morgante', "A giant of romance, affable and well-bred unlike the rest of his breed.", 'reference', ['Morgante']),
    ('tirante-el-blanco', 'Tirante el Blanco', "The famous knight of a romance saved from the fire.", 'reference', ['Tirante el Blanco']),
    ('olalla', 'Olalla', "The beloved addressed in a goatherd's song.", 'reference', ['Olalla']),
    ('guillermo-the-rich', 'Guillermo the Rich', "Marcela's father.", 'reference', ['Guillermo']),
    ('queen-madasima', 'Queen Madasima', "A queen of romance whose honour Don Quixote defends.", 'reference', ['Madasima']),
    ('helen-of-troy', 'Helen', "Helen of Troy, whose beauty Don Quixote says his Dulcinea would eclipse.", 'reference', ['Helen']),
    ('charles-v', 'Charles V', "The emperor who captured the Goletta.", 'reference', ['Charles V']),
    ('charlemagne', 'Charlemagne', "Named among the kings of old in a discussion of plays.", 'reference', ['Charlemagne']),
    ('eugenio', 'Eugenio', "A goatherd who tells his own story of rivalry for Leandra.", 'supporting', ['Eugenio']),
    ('vicente-de-la-roca', 'Vicente de la Roca', "A poor peasant's son returned from soldiering in Italy.", 'supporting', ['Vicente']),
    ('ruggiero', 'Ruggiero', "A knight of romance from whom the dukes of Ferrara are said to descend.", 'reference', ['Ruggiero']),
    ('orbaneja', 'Orbaneja', "A painter of Úbeda who, asked what he was painting, answered “What it may turn out.”", 'reference', ['Orbaneja']),
    ('brunello', 'Brunello', "The famous thief who stole a horse from between its rider's legs.", 'reference', ['Brunello']),
    ('dona-christina', 'Doña Christina', "A lady who receives Don Quixote with courtesy.", 'reference', ['Doña Christina']),
    ('pyramus', 'Pyramus', "The lover of the fable of Pyramus and Thisbe, subject of a sonnet.", 'reference', ['Pyramus']),
    ('queen-guinevere', 'Queen Guinevere', "The queen loved by Lancelot of the Lake.", 'reference', ['Guinevere']),
    ('polydore-vergil', 'Polydore Vergil', "Author of a work on the invention of things, to which a cousin claims to have written a supplement.", 'reference', ['Vergil']),
    ('durandarte', 'Durandarte', "The sore-wounded knight lamented in the cave of Montesinos.", 'reference', ['Durandarte']),
    ('apelles', 'Apelles', "The painter of antiquity, named among those whose art alone could do Dulcinea justice.", 'reference', ['Apelles']),
    ('antonomasia', 'Princess Antonomasia', "Heiress of the kingdom of Kandy, reared under the Distressed Duenna's care.", 'reference', ['Antonomasia']),
    ('emerencia', 'Emerencia', "A damsel of the duchess's household, urged to sing.", 'reference', ['Emerencia']),
    ('pedro-perez-mazorca', 'Pedro Perez Mazorca', "A wool-farmer of the island, named by a damsel who comes before the governor.", 'reference', ['Pedro Perez']),
    ('garcilasso', 'Garcilasso', "The famous poet, one of whose eclogues is to be performed.", 'reference', ['Garcilasso']),
    ('the-biscayan', 'the Biscayan', "A squire attending a coach, who fights Don Quixote when he tries to stop it.", 'supporting', ['Biscayan']),
    ('la-cava', 'La Cava', "The woman through whom, tradition says, Spain was lost.", 'reference', ['La Cava']),
    ('malambruno', 'Malambruno', "A giant and enchanter, cousin to a queen, who comes mounted on a wooden horse to avenge her.", 'reference', ['Malambruno']),
    ('don-manuel-de-leon', 'Don Manuel de Leon', "A knight of Seville famed for valiant deeds.", 'reference', ['Manuel de Leon']),
    ('don-pedro-de-aguilar', 'Don Pedro de Aguilar', "A captive taken in the fort, whose brother hears of him in the captive's tale.", 'reference', ['Pedro de Aguilar']),
    ('pedro-alonso', 'Pedro Alonso', "Don Quixote's neighbour, who finds him after his first sally.", 'reference', ['Pedro Alonso']),
    ('christ', 'Christ', "Referred to in oaths and in the captive's tale.", 'reference', ['Jesus Christ', 'Christ']),
]

if __name__ == '__main__':
    for eid, name, body, role, aliases in ENTITIES:
        add_entity(BOOK, eid, name, '', body, role, P, aliases)

    add_e(BOOK, 'master-pedro', 'Master Pedro',
          '', "A travelling showman with a divining ape and a puppet show of the Release of Melisendra, welcomed at the inn.",
          'supporting', P, ['Master Pedro'])
    add_e(BOOK, 'pedro-goatherd', 'Pedro', '',
          "A goatherd who tells Don Quixote the story of the dead student-shepherd Chrysostom.",
          'supporting', P, ['Pedro'],
          only_paragraphs={(12, i) for i in range(0, 40)} | {(13, 4)})
    add_e(BOOK, 'lorenzo-corchuelo', 'Lorenzo Corchuelo', '',
          "Aldonza Lorenzo's father.", 'reference', P, ['Lorenzo Corchuelo'])
    add_e(BOOK, 'corchuelo-bachelor', 'Corchuelo', '',
          "A bachelor who disputes the science of fencing with a licentiate and puts it to the test.",
          'reference', P, ['Corchuelo'], exclude_paragraphs={(25, 41), (25, 42), (26, 13)})
    add_e(BOOK, 'dona-clara', 'Doña Clara de Viedma', '',
          "The Judge's daughter, travelling with her father.", 'supporting', P,
          ['Doña Clara', 'Clara'], exclude_paragraphs={(99, 38)})
    add_e(BOOK, 'sanchica', 'Sanchica', '',
          "Sancho Panza's daughter.", 'supporting', P,
          ['Sanchica', 'Mari-Sancha', 'Sancha'], exclude_paragraphs={(102, 48), (112, 10)})
    add_e(BOOK, 'zoraida', 'Zoraida', '',
          "A Moorish lady who arrives with the captive, and asks to be called Maria.",
          'supporting', P, ['Zoraida', 'Lela Zoraida', 'Maria'], exclude_paragraphs={(57, 14)})
    add_e(BOOK, 'amadis-of-gaul', 'Amadis of Gaul', '',
          "The knight of romance Don Quixote takes as his model.", 'reference', P,
          ['Amadis of Gaul', 'Amadis'], exclude_paragraphs={(6, 11)})
    add_e(BOOK, 'dona-rodriguez', 'Doña Rodriguez', '',
          "Doña Rodriguez de Grijalba, a duenna in the duchess's household.", 'supporting', P,
          ['Doña Rodriguez', 'Señora Rodriguez', 'Rodriguez de Grijalba'])

    add_aliases(BOOK, 'dulcinea', ['Aldonza Lorenzo'])
    add_aliases(BOOK, 'don-quixote', ['Alonso Quixano'])
    add_aliases(BOOK, 'niece', ['Antonia Quixana'])
    add_aliases(BOOK, 'teresa-panza', ['Mari Gutierrez'])
    add_aliases(BOOK, 'camilla', ['Chloris'])
