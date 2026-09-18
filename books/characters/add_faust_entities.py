#!/usr/bin/env python3
"""Faust Part 1: clickable-names pass.

Run AFTER bind_speaker_labels.py faust-part-1 (existing cards' ALL-CAPS
labels) — this script adds the uncarded speakers of the Prelude, the
Walpurgis-Night scenes and the Intermezzo, the one-off allusions, and a
few aliases on existing cards (Henry -> Faust, Marcaret/Margarete ->
Margaret, Voland/Mephisto -> Mephistopheles, Sibyl -> the Witch, Lord ->
The Lord in the Prologue only).

The original-en edition is an OCR'd text: several German passages and
misreadings ("Marcaret", "Tam" for "I am") sit inside it. Bindings
follow the text as shipped; nothing is edited here.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted

BOOK = 'faust-part-1'
P = 'person'
D = 'deity'
CH2 = {(2, i) for i in range(0, 12)}
CH4 = {(4, i) for i in range(2, 12)}
CH24 = {(24, i) for i in range(0, 46)}
CH25 = {(25, i) for i in range(0, 32)}
CH9 = {(9, i) for i in range(0, 70)}


def main():
    # ---- aliases on existing cards ------------------------------------
    add_aliases(BOOK, 'faust', ['Henry', 'HENRY'])
    add_aliases(BOOK, 'margaret', ['Marcaret', 'MARGARETE', 'Margarete', 'Gretchen', 'GRETCHEN'])
    add_aliases(BOOK, 'martha', ['MARTHE', 'Marthe'])
    add_aliases(BOOK, 'mephistopheles', ['Mephisto', 'MEPHISTO', 'Voland'])
    add_aliases_restricted(BOOK, 'witch', ['Sibyl'], only_paragraphs=CH9)
    add_aliases_restricted(BOOK, 'the-lord', ['Lord'], only_paragraphs={(3, 2), (3, 4), (3, 6)})

    # ---- Prelude on the Stage ------------------------------------------
    add_e(BOOK, 'manager', 'The Manager', 'Theatre director', "Runs the theatre; wants a crowd-pleasing show, whatever the poet thinks.", 'supporting', P,
          ['MANAGER', 'Manager', 'Director', 'DIRECTOR'], only_paragraphs=CH2)
    add_e(BOOK, 'theatre-poet', 'The Poet', 'Playwright', "The theatre's poet, who wants art for posterity rather than for the motley crowd.", 'supporting', P,
          ['THEATRE-POET', 'POET', 'Poet'], only_paragraphs=CH2)
    add_e(BOOK, 'merryman', 'The Merryman', 'Comic actor', "The company's clown, who argues for giving the audience folly and fun.", 'supporting', P,
          ['MERRYMAN', 'Merryman', 'Merry-Andrew', 'MERRY-ANDREW'], only_paragraphs=CH2)

    # ---- Night / Before the Gate --------------------------------------
    add_e(BOOK, 'earth-spirit', 'The Earth-Spirit', 'Spirit of the Earth', "The spirit Faust conjures from Nostradamus's book; it appears in flame and rejects him as unlike itself.", 'supporting', P,
          ['Spirit of the Earth', 'SPIRIT OF THE EARTH', 'Earth-Spirit', 'EARTH-SPIRIT', 'SPIRIT', 'Spirit'], only_paragraphs=CH4)
    add_e(BOOK, 'nostradamus', 'Nostradamus', 'Renaissance seer', "The prophet whose mystical book Faust opens in his study.", 'reference', P, ['Nostradamus', 'NOSTRADAMUS'])
    add_e(BOOK, 'christ', 'Christ', '', "Named in the Easter chorus of angels that stops Faust from drinking the poison.", 'reference', D, ['Christ'])
    add_e(BOOK, 'old-peasant', 'The Old Peasant', 'Villager', "Thanks Faust, on the Easter walk, for his father's help during the plague.", 'reference', P, ['OLD PEASANT', 'Old Peasant'])
    add_e(BOOK, 'solomon', 'Solomon', 'Biblical king', "His 'key' is the book of spells Faust uses against the spirit in the poodle.", 'reference', P, ['Solomon', 'SOLOMON'])

    # ---- Auerbach's Cellar / Witch's Kitchen ---------------------------
    add_e(BOOK, 'luther', 'Doctor Luther', 'Reformer', "Named in Brander's rat song: the poisoned rat had a paunch 'like Doctor Luther'.", 'reference', P, ['Doctor Luther', 'Luther'])
    add_e(BOOK, 'hans-of-rippach', 'Mr. Hans', 'Rippach joke', "'Mr. Hans of Rippach' — a stock joke name the students use to test the strangers.", 'reference', P, ['Mr. Hans', 'Hans'], only_paragraphs={(8, 36)})
    add_e(BOOK, 'satan', 'Satan', "The devil's name", "The Witch greets Mephistopheles as 'Squire Satan'; he tells her the name is out of fashion.", 'reference', D, ['Satan', 'SATAN'])
    add_e(BOOK, 'cupid', 'Cupid', 'God of love', "Named by Mephistopheles after Faust drinks the witch's potion.", 'reference', D, ['Cupid'])
    add_e(BOOK, 'helen', 'Helen', 'Helen of Troy', "'You will soon see a Helen in every woman' — the potion's promise.", 'reference', P, ['Helen'], only_paragraphs=CH9)

    # ---- At the Well ---------------------------------------------------
    add_e(BOOK, 'bessy', 'Bessy', 'Lieschen', "Margaret's neighbour at the well, who gossips about Barbara's disgrace.", 'supporting', P, ['BESSY', 'Bessy', 'Lieschen', 'LIESCHEN'])
    add_e(BOOK, 'barbara', 'Barbara', 'The seduced girl', "The girl Bessy gossips about at the well: pregnant and abandoned, a mirror of Margaret's own fate.", 'reference', P, ['Barbara', 'Bärbelchen'])

    # ---- Cathedral -----------------------------------------------------
    add_e(BOOK, 'evil-spirit', 'The Evil Spirit', '', "The voice that torments Margaret in the cathedral during the requiem.", 'supporting', P, ['EVIL SPIRIT', 'Evil Spirit'])

    # ---- Walpurgis-Night -----------------------------------------------
    add_e(BOOK, 'will-o-the-wisp', "Will-o'-the-Wisp", 'Guide', "The flickering light Mephistopheles presses into service to lead them up the Brocken.", 'reference', P,
          ["Will-o'-the-Wisp", "WILL-O'-THE-WISP", 'Will-o’-the-Wisp', 'Will-o’-the- Wisp', 'WILL-0’-THE-WISP', 'WILL-O’-THE-WISP'], only_paragraphs=CH24)
    add_e(BOOK, 'mammon', 'Mammon', 'Wealth personified', "The demon of riches, whose palace glows inside the mountain on Walpurgis-Night.", 'reference', D, ['Mammon', 'MAMMON'])
    add_e(BOOK, 'demi-witch', 'The Demi-Witch', '', "A half-witch straggling up the mountain behind the others.", 'reference', P, ['Demi-Witch', 'DEMI-WITCH'])
    add_e(BOOK, 'general', 'The General', 'Old gentleman', "One of the old men by the dying embers, complaining that the people no longer trust him.", 'reference', P, ['General', 'GENERAL'], only_paragraphs={(24, 23)})
    add_e(BOOK, 'minister', 'The Minister', 'Old gentleman', "Another of the old men by the embers, longing for the good old days.", 'reference', P, ['Minister', 'MINISTER'], only_paragraphs={(24, 23)})
    add_e(BOOK, 'lilith', 'Lilith', "Adam's first wife", "Pointed out by Mephistopheles in the dance; beware her beautiful hair.", 'reference', P, ['Lilith', 'LILITH'])
    add_e(BOOK, 'adam', 'Adam', 'First man', "Named as Lilith's first husband.", 'reference', P, ['Adam'], only_paragraphs={(24, 28)})
    add_e(BOOK, 'the-fair-one', 'The Fair One', 'Young witch', "The young witch Faust dances with, trading apple-tree verses.", 'reference', P,
          ['The Fair One', 'THE FAIR ONE', 'THE YOUNG ONE', 'the Young One'], only_paragraphs=CH24)
    add_e(BOOK, 'the-old-one', 'The Old One', 'Old witch', "The old witch Mephistopheles dances with.", 'reference', P, ['The Old One', 'THE OLD ONE'], only_paragraphs=CH24)
    add_e(BOOK, 'procktophantasmist', 'Procktophantasmist', 'Enlightened critic', "A rationalist who protests that spirits should not exist; Goethe's caricature of the critic Nicolai.", 'reference', P,
          ['Procktophantasmist', 'PROCKTOPHANTASMIST', 'Proctophantasmist', 'PROCTOPHANTASMIST'])
    add_e(BOOK, 'medusa', 'Medusa', 'Gorgon', "Mephistopheles's name for the pale girl-shape that petrifies whoever meets her look.", 'reference', P, ['Medusa', 'MEDUSA'])
    add_e(BOOK, 'perseus', 'Perseus', 'Hero', "Cut off Medusa's head — hence the red line on the phantom's neck.", 'reference', P, ['Perseus'])
    add_e(BOOK, 'servibilis', 'Servibilis', 'Theatre helper', "The amateur who raises the curtain for the play on the Blocksberg.", 'reference', P, ['Servibilis', 'SERVIBILIS'])

    # ---- Walpurgis-Night's Dream ---------------------------------------
    add_e(BOOK, 'stage-manager', 'The Stage-Manager', '', "Opens the Intermezzo: today the sons of Mieding rest.", 'reference', P, ['STAGE-MANAGER', 'Stage-Manager', 'STAGE MANAGER'], only_paragraphs=CH25)
    add_e(BOOK, 'mieding', 'Mieding', 'Weimar stage machinist', "Johann Martin Mieding, the Weimar theatre's stage builder, whose 'sons' are the scene-shifters.", 'reference', P, ['Mieding'])
    add_e(BOOK, 'herald', 'The Herald', '', "Announces the golden wedding of Oberon and Titania.", 'reference', P, ['HERALD', 'Herald'], only_paragraphs=CH25)
    add_e(BOOK, 'oberon', 'Oberon', 'King of the fairies', "Celebrates his golden wedding with Titania in the Intermezzo.", 'supporting', P, ['Oberon', 'OBERON'])
    add_e(BOOK, 'titania', 'Titania', 'Queen of the fairies', "Oberon's queen, whose golden wedding the Intermezzo celebrates.", 'reference', P, ['Titania', 'TITANIA'])
    add_e(BOOK, 'puck', 'Puck', 'Fairy', "Whirls into the dance and draws hundreds after him.", 'reference', P, ['Puck', 'PUCK'])
    add_e(BOOK, 'ariel', 'Ariel', 'Spirit of the air', "Wakes the song in tones of heavenly purity and leads the way to the hill of roses.", 'reference', P, ['Ariel', 'ARIEL'])
    add_e(BOOK, 'inquisitive-traveller', 'The Inquisitive Traveller', '', "Cannot believe his eyes at the masquerade.", 'reference', P, ['INQUISITIVE TRAVELLER', 'Inquisitive Traveller'])
    add_e(BOOK, 'orthodox', 'The Orthodox', '', "Sees no claws or tail, but is sure Oberon is a devil like the Greek gods.", 'reference', P, ['Orthodox', 'ORTHODOX'], only_paragraphs=CH25)
    add_e(BOOK, 'purist', 'The Purist', '', "Deplores the rioting: of all the witches, only two are powdered.", 'reference', P, ['PURIST', 'Purist'], only_paragraphs=CH25)
    add_e(BOOK, 'young-witch', 'The Young Witch', '', "Rides her he-goat naked and mocks the powdered old women.", 'reference', P, ['YOUNG WITCH', 'Young Witch'], only_paragraphs=CH25)
    add_e(BOOK, 'matron', 'The Matron', '', "Too well-bred to squabble, she hopes the young witch will rot.", 'reference', P, ['MATRON', 'Matron'], only_paragraphs=CH25)
    add_e(BOOK, 'leader-of-the-band', 'The Leader of the Band', 'Conductor', "Keeps the insect orchestra in time.", 'reference', P, ['LEADER OF THE BAND', 'Leader of the Band'], only_paragraphs=CH25)
    add_e(BOOK, 'weathercock', 'The Weathercock', '', "Praises the company facing one way and damns it facing the other.", 'reference', P, ['WEATHERCOCK', 'Weathercock'], only_paragraphs=CH25)
    add_e(BOOK, 'xenien', 'The Xenien', 'Satirical epigrams', "Goethe and Schiller's epigrams, here as insects with sharp nippers honouring Satan.", 'reference', P, ['XENIEN', 'Xenien'], only_paragraphs=CH25)
    add_e(BOOK, 'hennings', 'Hennings', 'Critic', "August von Hennings, a critic of the Xenien, mocking the naive jokers.", 'reference', P, ['HENNINGS', 'Hennings'], only_paragraphs=CH25)
    add_e(BOOK, 'musaget', 'Musaget', "Hennings's journal", "'Leader of the Muses', the title of Hennings's periodical, here as a figure who prefers witches to Muses.", 'reference', P, ['MUSAGET', 'Musaget'], only_paragraphs=CH25)
    add_e(BOOK, 'ci-devant-genius', 'Ci-devant Genius of the Age', 'Former genius', "Hennings's other journal personified; the Blocksberg is his German Parnassus.", 'reference', P,
          ['Ci-devant Genius of the Age', 'CI-DEVANT GENIUS OF THE AGE'], only_paragraphs=CH25)
    add_e(BOOK, 'the-crane', 'The Crane', 'Pious gentleman', "The stiff man who fishes in clear and troubled waters alike; a jab at Lavater.", 'reference', P, ['The Crane', 'THE CRANE'], only_paragraphs=CH25)
    add_e(BOOK, 'worldling', 'The Worldling', '', "Observes that for the pious anything becomes a vehicle.", 'reference', P, ['Worldling', 'WORLDLING'], only_paragraphs=CH25)
    add_e(BOOK, 'dancer', 'The Dancer', '', "Hears distant drums — only bitterns among the reeds.", 'reference', P, ['Dancer', 'DANCER'], only_paragraphs={(25, 20)})
    add_e(BOOK, 'dancing-master', 'The Dancing Master', '', "Watches the crooked jump and the clumsy hop.", 'reference', P, ['Dancing Master', 'DANCING MASTER'], only_paragraphs=CH25)
    add_e(BOOK, 'fiddler', 'The Fiddler', '', "The bagpipe unites this hateful pack as Orpheus's lyre did the beasts.", 'reference', P, ['FIDDLER', 'Fiddler'], only_paragraphs=CH25)
    add_e(BOOK, 'orpheus', 'Orpheus', 'Mythical musician', "His lyre tamed the beasts, says the Fiddler.", 'reference', P, ['Orpheus', 'ORPHEUS'])
    add_e(BOOK, 'dogmatist', 'The Dogmatist', 'Philosopher', "The devil must be something, or how could there be devils?", 'reference', P, ['DOGMATIST', 'Dogmatist'], only_paragraphs=CH25)
    add_e(BOOK, 'idealist', 'The Idealist', 'Philosopher', "If all this is his own fancy, he must be beside himself tonight.", 'reference', P, ['IDEALIST', 'Idealist'], only_paragraphs=CH25)
    add_e(BOOK, 'realist', 'The Realist', 'Philosopher', "Finds being itself a plague and, for once, cannot stand firm.", 'reference', P, ['REALIST', 'Realist'], only_paragraphs=CH25)
    add_e(BOOK, 'supernaturalist', 'The Supernaturalist', 'Philosopher', "Delighted: from devils he can infer good spirits.", 'reference', P, ['SUPERNATURALIST', 'Supernaturalist'], only_paragraphs=CH25)
    add_e(BOOK, 'sceptic', 'The Sceptic', 'Philosopher', "Doubt rhymes with devil; he is quite at home here.", 'reference', P, ['Sceptic', 'SCEPTIC', 'Skeptic', 'SKEPTIC'], only_paragraphs=CH25)
    add_e(BOOK, 'the-adroit', 'The Adroit', '', "Sansouci's merry band, who walk on their heads.", 'reference', P, ['The Adroit', 'THE ADROIT'], only_paragraphs=CH25)
    add_e(BOOK, 'the-awkward', 'The Awkward', '', "Their shoes danced through, they run on bare soles.", 'reference', P, ['The Awkward', 'THE AWKWARD'], only_paragraphs=CH25)
    add_e(BOOK, 'shooting-star', 'The Shooting Star', '', "Fell from the sky and lies crooked in the grass.", 'reference', P, ['SHOOTING STAR', 'Shooting Star'], only_paragraphs=CH25)


if __name__ == '__main__':
    main()
