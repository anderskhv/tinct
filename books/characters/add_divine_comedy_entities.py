#!/usr/bin/env python3
"""Add real, previously-uncarded named individuals found in divine-comedy
via spaCy PERSON-NER (see the clickable-names plan). Bodies are minimal,
drawn from first-mention context. "Francis" and "Brutus" were homonym
pairs handled separately (add_histories_helpers-style exclusion, see the
add_e calls run alongside this file). "Charles" and "John" were checked
and skipped: Charles refers to several different historical Charleses
across the poem with no easy single-mention split; "Saint John" at its
one occurrence names the Florence baptistery, not a person appearing in
the narrative. "Iris" (a rainbow simile, "Iris is by Iris") carries no
narrative content and was skipped too. "Mantuan" is Virgil addressed by
epithet -- bound as an alias on the existing virgil card, not a new one.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_entity import add_entity
from add_aliases import add_aliases

BOOK = 'divine-comedy'

ENTITIES = [
    ('christ', 'Christ', "Referred to throughout, and discussed at length in Paradiso.", 'major', ['Christ', 'Jesus']),
    ('jove', 'Jove', "Invoked as the god who once hurled the thunderbolt that struck Dante's guide.", 'reference', ['Jove']),
    ('augustus', 'Augustus', "The Roman emperor under whom Virgil says he lived, \"during the time of false and lying gods.\"", 'reference', ['Augustus']),
    ('lucia', 'Lucia', "One of the three heavenly ladies who intervene on Dante's behalf, entreated by Beatrice.", 'supporting', ['Lucia']),
    ('rachel', 'Rachel', "Seen by Dante among the virtuous pagans in Limbo, seated beside her husband's family.", 'reference', ['Rachel']),
    ('cerberus', 'Cerberus', "The three-throated monster who guards and torments the gluttonous.", 'supporting', ['Cerberus']),
    ('judas', 'Judas', "Namesake of the lowest circle of Hell.", 'reference', ['Judas']),
    ('albert-of-siena', 'Albert of Siena', "The man who had a fellow alchemist burned, as recounted in Hell.", 'reference', ['Albert']),
    ('aeneas', 'Aeneas', "The legendary Trojan hero, invoked by Dante as one whose journey to the afterlife he does not consider himself worthy to follow.", 'reference', ['Aeneas']),
    ('paul', 'Paul', "The Apostle, invoked by Dante as one whose journey to the afterlife he does not consider himself worthy to follow.", 'reference', ['Paul']),
    ('lavinia', 'Lavinia', "Daughter of King Latinus, seen by Dante among the virtuous pagans in Limbo.", 'reference', ['Lavinia']),
    ('marcia', 'Marcia', "Seen by Dante among the virtuous pagans in Limbo, alongside Lucretia, Julia, and Cornelia.", 'reference', ['Marcia']),
    ('archangel-michael', 'Michael', "The archangel who, it is said, wrought vengeance upon the proud adversary.", 'reference', ['Michael']),
    ('barbariccia', 'Barbariccia', "One of the demon guards of the Malebranche, set to lead the others.", 'reference', ['Barbariccia']),
    ('juno', 'Juno', "Invoked in an extended simile describing her enraged persecution of the Theban line.", 'reference', ['Juno']),
    ('gherardo', 'Gherardo', "\"Good Gherardo,\" named among a small number of worthy men from an earlier generation.", 'reference', ['Gherardo']),
    ('joshua', 'Joshua', "The biblical leader whose wrath at Achan's theft is recalled among examples of just punishment.", 'reference', ['Joshua']),
    ('noah', 'Noah', "Named among the souls Christ drew forth from Limbo.", 'reference', ['Noah']),
    ('david', 'David', "The biblical king, named among the souls Christ drew forth from Limbo.", 'reference', ['David']),
    ('ovid', 'Ovid', "One of the four great poets Dante meets in Limbo, alongside Homer, Horace, and Lucan.", 'reference', ['Ovid']),
    ('hector', 'Hector', "The Trojan hero, seen among the virtuous pagans in Limbo.", 'reference', ['Hector']),
    ('livy', 'Livy', "The Roman historian, seen among the virtuous pagans in Limbo.", 'reference', ['Livy']),
    ('cleopatra', 'Cleopatra', "Named among those punished for lust.", 'reference', ['Cleopatra']),
    ('jacopo-rusticucci', 'Jacopo Rusticucci', "A Florentine of good repute whom Dante meets among the souls punished for violence against nature.", 'reference', ['Jacopo Rusticucci']),
    ('mosca', 'Mosca', "A Florentine blamed for having helped provoke the city's factional strife.", 'reference', ['Mosca']),
    ('alexander-tyrant', 'Alexander', "A ruler named among the violent, alongside the tyrant Dionysius of Syracuse.", 'reference', ['Alexander']),
    ('jason-argonaut', 'Jason', "The legendary leader of the Argonauts, whose cunning left the Colchians bereft of the golden ram.", 'reference', ['Jason']),
    ('simon-magus', 'Simon Magus', "Namesake of simony, addressed directly by Dante among the corrupt clergy.", 'reference', ['Simon Magus']),
    ('cagnazzo', 'Cagnazzo', "One of the demon guards of the Malebranche.", 'reference', ['Cagnazzo']),
    ('robert-guiscard', 'Robert Guiscard', "The Norman conqueror, named among those recalled for the agony of the blows they dealt or received in battle.", 'reference', ['Robert Guiscard']),
    ('briareus', 'Briareus', "A measureless giant that Dante wishes he could see.", 'reference', ['Briareus']),
    ('antaeus', 'Antaeus', "A giant, unbound and able to speak, who will set Dante and Virgil down at the bottom of all crime.", 'supporting', ['Antaeus']),
    ('typhoeus', 'Typhoeus', "A giant named alongside Tityus among those Dante's guide asks not to be shown.", 'reference', ['Typhoeus']),
    ('branca-doria', 'Ser Branca d’Oria', "A Genoese man Dante places already among the damned, though still living in the world above.", 'reference', ['Oria']),
    ('buonconte', 'Buonconte', "A soul of Montefeltro whom Dante meets in Purgatory, uncared for by any but Giovanna.", 'supporting', ['Buonconte']),
    ('rudolph', 'Rudolph', "The Emperor who had power to heal Italy's wounds.", 'reference', ['Rudolph']),
    ('michal', 'Michal', "Seen represented in a carving, looking scornfully down upon David.", 'reference', ['Michal']),
    ('nimrod', 'Nimrod', "Blamed for the confusion of languages, encountered among the giants.", 'supporting', ['Nimrod']),
    ('alcmaeon', 'Alcmaeon', "Shown in a carved image, having made a costly ornament fatal to his own mother.", 'reference', ['Alcmaeon']),
    ('diana', 'Diana', "The goddess, invoked in a reference to a legendary spring.", 'reference', ['Diana']),
    ('marco-lombardo', 'Marco', "A Lombard whom Dante meets in Purgatory and questions at length about free will.", 'supporting', ['Marco']),
    ('latona', 'Latona', "The goddess who gave birth to the sun and moon on Delos.", 'reference', ['Latona']),
    ('pyramus', 'Pyramus', "The legendary lover who, dying, opened his eyes at the sound of Thisbe's name.", 'reference', ['Pyramus']),
    ('minerva', 'Minerva', "The goddess, invoked in a description of a carved figure's veil.", 'reference', ['Minerva']),
    ('daniel', 'Daniel', "The biblical prophet, named as one who disparaged food and won understanding.", 'reference', ['Daniel']),
    ('gabriel', 'Gabriel', "The archangel, who together with Michael represents Holy Church.", 'reference', ['Gabriel']),
    ('charlemagne', 'Charlemagne', "Invoked in a comparison of the sorrow at his own defeat to that of Roland's horn.", 'reference', ['Charlemagne']),
    ('augustine', 'Augustine', "Named as one furnished by the rhetoric of another soul in Paradiso.", 'reference', ['Augustine']),
    ('henry-emperor', 'Henry', "The noble Emperor Dante hopes will come to redress Italy.", 'supporting', ['Henry']),
]

if __name__ == '__main__':
    for eid, name, body, role, aliases in ENTITIES:
        add_entity(BOOK, eid, name, '', body, role, 'person', aliases)
    add_aliases(BOOK, 'virgil', ['Mantuan'])
