#!/usr/bin/env python3
"""Essays of Montaigne (Cotton/Hazlitt): second clickable-names sweep.

The first sweep took the recurring ancients. This pass takes the long
tail: the Renaissance Italians and Frenchmen of the anecdotes, the
Ottoman sultans, the emperors and consuls named once, the translator's
notes' authorities (Florio, Nodier, Sismondi, Voltaire, Hobbes) and the
rest of the classical walk-ons. Latin quotation fragments the NER scan
capitalises (Quaes, Tusc, Heu, Sæpe) are noise and are left alone, as
are generic name examples ("Peter or William", "John, William,
Benedict") and place names.

Homonyms, each occurrence read: Aristodemus (the Spartan at Thermopylae
/ the Messenian king), Alfonso (of Aragon / XI of Castile), Menander
(the comic poet / Alexander's officer), Amurath (I / II / III), Conrad
(III / of Montferrat), Archelaus (the physician / the king of Macedon),
Diodorus (the dialectician / Siculus), Timon (the Man-hater / of
Phlius), Drusus (Tiberius's brother / Julius Drusus), Pacuvius (the poet
/ Calavius), René (of Lorraine / of Sicily), Edward (the Black Prince /
I / III), William (of Guienne / of Salisbury), Rutilius (the consul
only; two others are citations), Lepidus (four men; left).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases

BOOK = 'essays-montaigne'
P, D = 'person', 'deity'


def r(eid, name, subtitle, body, aliases, kind=P, role='reference', **kw):
    kw.setdefault('strict_editions', ())
    add_e(BOOK, eid, name, subtitle, body, role, kind, aliases, **kw)


def simple(*rows, kind=P):
    for row in rows:
        eid, name = row[0], row[1]
        subtitle = row[2] if len(row) > 2 else ''
        aliases = row[3] if len(row) > 3 else [name]
        r(eid, name, subtitle, "", aliases, kind=kind)


def main():
    add_aliases(BOOK, 'montaigne-himself', ['Michel de Montaigne'])
    # --- homonyms
    r('aristodemus-spartan', 'Aristodemus', 'The Spartan', "", ['Aristodemus'], only_paragraphs={(36, 10)})
    r('aristodemus-messenian', 'Aristodemus', 'King of the Messenians', "", ['Aristodemus'], only_paragraphs={(98, 49)})
    r('alfonso-of-aragon', 'King Alfonso', 'Of Aragon', "", ['King Alfonso', 'Alfonso'], only_paragraphs={(42, 57)})
    r('alfonso-xi', 'King Alfonso', 'Of Castile, founder of the Order of the Band', "", ['King Alfonso', 'Alfonso'], only_paragraphs={(48, 43)})
    r('menander', 'Menander', 'The comic poet', "", ['Menander'], exclude_paragraphs={(93, 21)})
    r('menander-officer', 'Menander', "Alexander's officer", "", ['Menander'], only_paragraphs={(93, 21)})
    r('amurath-i', 'Amurath I', '', "", ['Amurath I.', 'Amurath'], only_paragraphs={(95, 45)})
    r('amurath-ii', 'Amurath II', '', "", ['Amurath'], only_paragraphs={(29, 17), (86, 13)})
    r('amurath-iii', 'Amurath III', '', "", ['Amurath III.', 'Amurath'], only_paragraphs={(78, 1)})
    r('conrad-iii', 'Conrad III', 'The Emperor', "", ['Conrad III.', 'Conrad'], only_paragraphs={(1, 3)})
    r('conrad-of-montferrat', 'Conrad', 'Marquis of Montferrat', "", ['Conrad'], only_paragraphs={(86, 19)})
    r('archelaus-physician', 'Archelaus', 'The physician', "", ['Archelaus'], only_paragraphs={(69, 481)})
    r('archelaus-king', 'Archelaus', 'King of Macedon', "", ['Archelaus'], only_paragraphs={(99, 57)})
    r('diodorus-dialectician', 'Diodorus', 'The dialectician', "", ['Diodorus'], only_paragraphs={(2, 21)})
    r('diodorus-siculus', 'Diodorus Siculus', '', "", ['Diodorus Siculus', 'Diodorus'], only_paragraphs={(69, 532), (74, 18)})
    r('timon-man-hater', 'Timon', 'The Man-hater', "", ['Timon'], only_paragraphs={(50, 7)})
    r('timon-of-phlius', 'Timon', 'Of Phlius', "", ['Timon'], only_paragraphs={(69, 378), (73, 90)})
    r('drusus', 'Drusus', "Tiberius's brother", "", ['Drusus'], only_paragraphs={(79, 1)})
    r('julius-drusus', 'Julius Drusus', '', "", ['Julius Drusus'])
    r('pacuvius', 'Pacuvius', 'The poet', "", ['Pacuvius'], only_paragraphs={(11, 24), (24, 10)})
    r('pacuvius-calavius', 'Pacuvius Calavius', '', "", ['Pacuvius Calavius', 'Pacuvius'], only_paragraphs={(103, 84)})
    r('rene-of-lorraine', 'Rene', 'Duke of Lorraine', "", ['Rene'], only_paragraphs={(37, 0)})
    r('rene-of-sicily', 'Rene', 'King of Sicily', "", ['Rene'], only_paragraphs={(74, 112)})
    r('edward-black-prince', 'Edward', 'Prince of Wales', "", ['Edward'], only_paragraphs={(1, 1)})
    r('edward-i', 'Edward I', 'King of England', "", ['Edward I.', 'Edward'], only_paragraphs={(3, 11)})
    r('edward-iii', 'Edward III', 'King of England', "", ['Edward III.', 'King Edward', 'Edward'], only_paragraphs={(41, 7), (78, 1), (80, 4)})
    r('william-of-guienne', 'William', 'Duke of Guienne', "", ['William'], only_paragraphs={(40, 52)})
    r('william-of-salisbury', 'William', 'Earl of Salisbury', "", ['William'], only_paragraphs={(41, 10)})
    r('publius-rutilius', 'Publius Rutilius', 'The consul', "", ['Publius Rutilius'])
    r('fulvius', 'Fulvius', "Augustus's favourite", "", ['Fulvius'], only_paragraphs={(60, 52)})
    r('quintus-fulvius-flaccus', 'Quintus Fulvius Flaccus', '', "", ['Quintus Fulvius Flaccus'])
    r('aeneius-fulvius', 'Aeneius Fulvius', '', "", ['Aeneius Fulvius'])
    r('eros', 'Eros', "Antony's slave", "", ['Eros'], only_paragraphs={(39, 14)})
    r('clinias', 'Clinias', '', "", ['Clinias'], only_paragraphs={(103, 239)})
    r('agamemnon', 'Agamemnon', '', "", ['Agamemnon'], only_paragraphs={(100, 47)})
    r('guelph', 'Guelph', 'Duke of Bavaria', "", ['Guelph'], only_paragraphs={(1, 3)})
    r('mary-germain', 'Mary Germain', '', "Who became a man.", ['Mary Germain', 'Mary'], only_paragraphs={(20, 6)})
    # --- the rest
    simple(('xenophanes', 'Xenophanes'), ('hippias', 'Hippias', 'Of Elis'), ('agrippa', 'Agrippa'), ('anaxarchus', 'Anaxarchus'),
           ('nicocreon', 'Nicocreon', 'Tyrant of Cyprus'), ('luther', 'Luther'), ('valentinian', 'Valentinian'), ('gobrias', 'Gobrias'),
           ('paracelsus', 'Paracelsus'), ('fioravanti', 'Fioravanti'), ('argentier', 'Argentier'), ('constantius', 'Constantius'),
           ('voltaire', 'Voltaire'), ('suleiman', 'Solyman', 'Suleiman the Magnificent', ['Solyman', 'Soliman I.', 'Soliman']),
           ('epimenides', 'Epimenides'), ('mohammed-ii', 'Mohammed', 'Mehmed II', ['Mohammed II.', 'Mohammed']), ('andragoras', 'Andragoras'),
           ('jaropelk', 'Jaropelk', 'Duke of Russia'), ('lysias', 'Lysias'), ('maecenas', 'Maecenas'), ('menon', 'Menon'),
           ('psammenitus', 'Psammenitus', 'King of Egypt'), ('nicias', 'Nicias'), ('wicliffe', 'Wicliffe'),
           ('zisca', 'Zisca'), ('chabrias', 'Chabrias'), ('iphicrates', 'Iphicrates'), ('bion', 'Bion'), ('polypercon', 'Polypercon'),
           ('nodier', 'Nodier'), ('celsus', 'Celsus'), ('callippus', 'Callippus'), ('isabella', 'Isabella', 'Daughter of Scotland'),
           ('mandane', 'Mandane'), ('capilupus', 'Capilupus'), ('epicharmus', 'Epicharmus'), ('paluel', 'Paluel', 'Dancer'),
           ('alexandridas', 'Alexandridas'), ('posthumius', 'Posthumius', 'The dictator'), ('zenobia', 'Zenobia'), ('irenaeus', 'Irenaeus'),
           ('ismenias', 'Ismenias'), ('emmanuel', 'Emmanuel', 'King of Portugal'), ('albuquerque', 'Albuquerque'), ('eleanor', 'Eleanor', 'Of Aquitaine'),
           ('sitalces', 'Sitalces'), ('teres', 'Teres'), ('diocletian', 'Diocletian'), ('parmenio', 'Parmenio'), ('sismondi', 'Sismondi'),
           ('geta', 'Geta', 'The Emperor'), ('captain-paulin', 'Captain Paulin', '', ['Captain Paulin']), ('clodomir', 'Clodomir', 'King of Aquitaine'),
           ('gondemar', 'Gondemar', 'King of Burgundy'), ('gilippus', 'Gilippus'), ('agathocles', 'Agathocles', 'King of Syracuse'),
           ('timaeus', 'Timaeus', 'In Plato'), ('onesilus', 'Onesilus', 'King of Salamis'), ('florio', 'Florio', 'Translator'),
           ('artaxerxes', 'Artaxerxes'), ('silvius', 'Silvius', 'Physician of Paris'), ('pelagia', 'Pelagia'), ('sophronia', 'Sophronia'),
           ('petilius', 'Petilius'), ('leonora', 'Leonora', "Montaigne's daughter"), ('phidias', 'Phidias'), ('caracalla', 'Caracalla'),
           ('eginhard', 'Eginhard'), ('philemon', 'Philemon', 'Secretary'), ('xantippus', 'Xantippus'), ('lactantius', 'Lactantius'),
           ('arrian', 'Arrian'), ('glaucia', 'Glaucia'), ('surena', 'Surena'), ('androdus', 'Androdus'), ('apion', 'Apion'),
           ('euripides', 'Euripides'), ('anaximander', 'Anaximander'), ('diagoras', 'Diagoras'), ('theodorus', 'Theodoras', '', ['Theodoras']),
           ('zamolxis', 'Zamolxis'), ('amestris', 'Amestris'), ('hierophilus', 'Hierophilus'), ('hermotimus', 'Hermotimus'), ('euphorbus', 'Euphorbus'),
           ('alcmeon', 'Alcmeon'), ('sappho', 'Sappho'), ('solomon', 'Solomon'), ('isaiah', 'Isaiah'), ('vegetius', 'Vegetius'),
           ('agarista', 'Agarista'), ('hippoclides', 'Hippoclides'), ('hipparchia', 'Hipparchia'), ('timagoras', 'Timagoras'), ('ostorius', 'Ostorius'),
           ('idomeneus', 'Idomeneus'), ('timocrates', 'Timocrates'), ('amynomachus', 'Amynomachus'), ('messalla', 'Messalla'),
           ('olivier', 'Olivier', 'Chancellor'), ('de-l-hospital', "De l’Hospital", 'Chancellor', ["De l’Hospital"]), ('metellius', 'Metellius'),
           ('eutropius', 'Eutropius'), ('simonides', 'Simonides'), ('sebastian', 'Sebastian', 'King of Portugal'), ('popilius', 'Popilius', '', ['C. Popilius', 'Popilius']),
           ('harpaste', 'Harpaste'), ('antaeus', 'Antaeus'), ('cercyo', 'Cercyo'), ('mauricius', 'Mauricius', 'The Emperor'),
           ('chalcondylas', 'Chalcondylas'), ('pantaleon', 'Pantaleon'), ('huniades', 'Huniades'), ('balthazar-gerard', 'Balthazar Gerard'),
           ('epicharis', 'Epicharis'), ('lollia', 'Lollia'), ('ladislaus', 'Ladislaus', 'King of Naples'), ('comines', 'Comines', '', ['Philip’de Comines', 'Comines']),
           ('lucullus', 'Lucullus'), ('thrasea', 'Thrasea', 'Thrasea Paetus', ['Thrasea Paetus', 'Thrasea']), ('anaxandridas', 'Anaxandridas'),
           ('diocles', 'Diocles'), ('musa', 'Musa'), ('themiso', 'Themiso'), ('crinas', 'Crinas'), ('gelo', 'Gelo'), ('eumenes', 'Eumenes'),
           ('witold', 'Witold'), ('hippomachus', 'Hippomachus'), ('gryllus', 'Gryllus'), ('ariston', 'Ariston'), ('boleslas', 'Boleslas'),
           ('kinge', 'Kinge'), ('sphaereus', 'Sphaereus'), ('melissa', 'Melissa'), ('thalestris', 'Thalestris'), ('joanna', 'Joanna', 'Queen of Naples'),
           ('panetius', 'Panetius'), ('cytheris', 'Cytheris'), ('firmus', 'Firmus'), ('brisson', 'Brisson'),
           ('asinius-pollio', 'Asinius Pollio', '', ['Asinius Pollio', 'Asnius Pollio', 'Pollio']), ('hobbes', 'Hobbes'), ('megabyzus', 'Megabyzus'),
           ('apelles', 'Apelles'), ('didymus', 'Didymus'), ('portia', 'Portia'), ('sidonius-apollinaris', 'Sidonius Apollinaris', '', ['Sidonius Apollinaris', 'Apollinaris']),
           ('lefevre', 'Lefevre'), ('clitomachus', 'Clitomachus'), ('selim', 'Selim'), ('favonius', 'Favonius'),
           ('scaliger', 'Scaliger'), ('fernel', 'Fernel'), ('chilo', 'Chilo'), ('euxodus', 'Euxodus'), ('minos', 'Minos'), ('amadis', 'Amadis', 'Of Gaul'),
           ('leo-x', 'Leo X', '', ['Leo X.']), ('emilius-lepidus', 'Emilius Lepidus', '', ['Emilius Lepidus', 'AEmilius Lepidus']),
           ('alessandro-trivulcio', 'Alessandro Trivulcio'), ('fabricio-colonna', 'Fabricio Colonna', '', ['Signor Fabricio Colonna']),
           ('juliano-romero', 'Juliano Romero', '', ['Signor Juliano Romero']), ('ottaviano-fregosa', 'Ottaviano Fregosa', '', ['Duke Ottaviano Fregosa']),
           ('francesco-taverna', 'Francesco Taverna'), ('francesco-sforza', 'Francesco Sforza'), ('ludovico-sforza', 'Ludovico Sforza'),
           ('cornelius-gallus', 'Cornelius Gallus'), ('simon-thomas', 'Simon Thomas'), ('gallus-vibius', 'Gallus Vibius'), ('lucius-cossitius', 'Lucius Cossitius'),
           ('jacques-pelletier', 'Jacques Pelletier', '', ['Jacques Pelletier', 'Jaques Pelletier']), ('scaevola', 'P. Scaevola', '', ['P. Scaevola']),
           ('jacques-amiot', 'Jacques Amiot'), ('nicolas-grouchy', 'Nicolas Grouchy'), ('guillaume-guerente', 'Guillaume Guerente', '', ['Guillaume Guerente', 'Guerente']),
           ('caius-blosius', 'Caius Blosius'), ('aelius-verus', 'AElius Verus'), ('fernando-cortez', 'Fernando Cortez'), ('annibale-caro', 'Annibale Caro'),
           ('bishop-osorius', 'Bishop Osorius'), ('l-paulus', 'L. Paulus'), ('p-syrus', 'P. Syrus'), ('nicholas-denisot', 'Nicholas Denisot'),
           ('antonio-iscalin', 'Antonio Iscalin'), ('pierre-pol', 'Pierre Pol'), ('l-volumnius', 'L. Volumnius'), ('cardinal-caraffa', 'Cardinal Caraffa'),
           ('sancho-xii', 'Sancho XII', '', ['Sancho XII.']), ('lucius-aruntius', 'Lucius Aruntius'), ('cocceius-nerva', 'Cocceius Nerva'),
           ('vibius-virrius', 'Vibius Virrius'), ('jubellius-taurea', 'Jubellius Taurea', '', ['Jubellius Taurea', 'Jubellius']), ('muley-hassam', 'Muley Hassam'),
           ('cremutius-cordus', 'Cremutius Cordus'), ('titus-livius', 'Titus Livius'), ('apollonius-tyanaus', 'Apollonius Tyanaus'),
           ('paulus-aemilius', 'Paulus Æmilius', '', ['Paulus Æmilius']), ('justus-lipsius', 'Justus Lipsius'), ('lucius-domitius', 'Lucius Domitius'),
           ('c-fimbria', 'C. Fimbria'), ('messala-corvinus', 'Messala Corvinus'), ('george-sechel', 'George Sechel'), ('caius-rabirius', 'Caius Rabirius'),
           ('servius-sulpitius', 'Servius Sulpitius'), ('caius-calvus', 'Caius Calvus'), ('marshal-strozzi', 'Marshal Strozzi'), ('vectius-valens', 'Vectius Valens'),
           ('p-sulpicius', 'P. Sulpicius'), ('subrius-flavius', 'Subrius Flavius'), ('priest-martin', 'Priest Martin'), ('gregory-xiii', 'Gregory XIII', '', ['Gregory XIII.']),
           ('caius-julius', 'Caius Julius'), ('lucius-paulus', 'Lucius Paulus'))
    simple(('priapus', 'Priapus'), ('thetis', 'Thetis'), ('iris', 'Iris'), ('thaumas', 'Thaumas'), kind=D)


if __name__ == '__main__':
    main()
