#!/usr/bin/env python3
"""Residual sweep of the three early-batch books the library-wide scan
still flagged: The Histories (no deity cards at all; Alexander = Paris of
Troy in Book II vs Alexander I of Macedon from Book V), War and Peace
(the marshals Murat/Davout/Lannes/Weyrother/Barclay/Mack, the two Tikhons
— the old prince's valet through ch. 277, Tikhon Shcherbaty from ch. 301
—, "Uncle" of the hunting chapters, Karáy the borzoi, the Rhetor,
Emperor Paul / Catherine the Great / Frederick the Great, Denísov's
"Wostóv") and Moby-Dick (Perth, the Lakeman = Steelkilt, Tash / Quohog,
Samuel Enderby the merchant, Czar Peter, the biblical and classical
allusions).
Usage: add_residual_sweep_entities.py [histories|wap|moby ...]
"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted
ROOT = Path(__file__).resolve().parents[2]
P, D, G = 'person', 'deity', 'group'

def chapters(book, lo, hi):
    ed = json.loads((ROOT / f'app/public/data/editions/{book}-original-en.json').read_text())
    return {(c['number'], i) for c in ed['chapters'] if lo <= c['number'] <= hi for i, _ in enumerate(c['paragraphs'])}

def maker(book):
    def r(eid, name, subtitle, body, aliases, kind=P, role='reference', **kw):
        pkg = json.loads((ROOT / f'app/public/data/characters/{book}.v1.json').read_text())
        present = tuple(ek for ek in ('original-en', 'modern-en') if eid in {c['id'] for c in pkg['editions'][ek]['characters']})
        absent = tuple(ek for ek in ('original-en', 'modern-en') if ek not in present)
        if present:  # existing card: bind the new forms onto it (re-runnable)
            add_aliases_restricted(book, eid, aliases, exclude_paragraphs=kw.get('exclude_paragraphs', frozenset()), only_paragraphs=kw.get('only_paragraphs'), editions=present)
        if absent:
            kw.setdefault('strict_editions', ())
            add_e(book, eid, name, subtitle, body, role, kind, aliases, editions=absent, **kw)
    return r

def histories():
    B = 'the-histories'; r = maker(B)
    r('alexander-paris', 'Alexander', 'Son of Priam — Paris of Troy', "", ['Alexander'], only_paragraphs=chapters(B, 1, 400), role='supporting')
    r('alexander-of-macedon', 'Alexander', 'Son of Amyntas, king of Macedon', "", ['Alexander'], only_paragraphs=chapters(B, 700, 1500), role='supporting')
    for eid, name, al in [('zeus', 'Zeus', ['Zeus']), ('apollo', 'Apollo', ['Apollo']), ('athene', 'Athene', ['Athene']), ('poseidon', 'Poseidon', ['Poseidon']), ('hera', 'Hera', ['Hera']), ('dionysos', 'Dionysos', ['Dionysos', 'Bacchus']), ('hermes', 'Hermes', ['Hermes']), ('aphrodite', 'Aphrodite', ['Aphrodite']), ('ares', 'Ares', ['Ares']), ('hephaistos', 'Hephaistos', ['Hephaistos']), ('artemis', 'Artemis', ['Artemis']), ('demeter', 'Demeter', ['Demeter']), ('pan', 'Pan', ['Pan']), ('isis', 'Isis', ['Isis']), ('osiris', 'Osiris', ['Osiris']), ('ammon', 'Ammon', ['Ammon'])]:
        r(eid, name, '', "", al, kind=D)
    for eid, name, sub, al in [('heracles', 'Heracles', '', ['Heracles']), ('helen', 'Helen', 'Daughter of Tyndareus', ['Helen']), ('perseus', 'Perseus', '', ['Perseus']), ('priam', 'Priam', '', ['Priam']), ('menelaos', 'Menelaos', '', ['Menelaos']), ('agamemnon', 'Agamemnon', '', ['Agamemnon']), ('achilles', 'Achilles', '', ['Achilles']), ('minos', 'Minos', '', ['Minos']), ('jason', 'Jason', '', ['Jason']), ('medea', 'Medea', '', ['Medea']), ('io', 'Io', '', ['Io']), ('europa', 'Europa', '', ['Europa']), ('danae', 'Danae', '', ['Danae']), ('semele', 'Semele', '', ['Semele']), ('amphitryon', 'Amphitryon', '', ['Amphitryon']), ('ajax', 'Ajax', '', ['Ajax']), ('orestes', 'Orestes', '', ['Orestes']), ('theseus', 'Theseus', '', ['Theseus']), ('pelops', 'Pelops', '', ['Pelops']), ('nestor', 'Nestor', '', ['Nestor']), ('homer', 'Homer', '', ['Homer']), ('hesiod', 'Hesiod', '', ['Hesiod']), ('sappho', 'Sappho', '', ['Sappho']), ('pythagoras', 'Pythagoras', '', ['Pythagoras']), ('thales', 'Thales', '', ['Thales']), ('anacharsis', 'Anacharsis', '', ['Anacharsis']), ('pittacos', 'Pittacos', '', ['Pittacos']), ('pindar', 'Pindar', '', ['Pindar']), ('simonides', 'Simonides', '', ['Simonides']), ('phrynichos', 'Phrynichos', '', ['Phrynichos']), ('aeschylus', 'Aeschylus', '', ['Aeschylus'])]:
        r(eid, name, sub, "", al)

def wap():
    B = 'war-and-peace'; r = maker(B)
    add_aliases(B, 'nicholas-rostov', ['Wostóv'])
    r('tikhon-valet', 'Tíkhon', "The old prince's valet", "", ['Tíkhon'], only_paragraphs=chapters(B, 1, 277), role='supporting')
    r('tikhon-shcherbaty', 'Tíkhon Shcherbáty', "Denísov's partisan", "", ['Tíkhon Shcherbáty', 'Tíkhon'], only_paragraphs=chapters(B, 301, 400), role='supporting')
    r('uncle', '"Uncle"', "The Rostóvs' kinsman of the hunt", "", ['Uncle'], only_paragraphs=chapters(B, 136, 142), role='supporting')
    r('karay', 'Karáy', "Nicholas's old borzoi", "", ['Karáy'])
    r('general-mack', 'General Mack', '', "The Austrian who surrendered at Ulm.", ['General Mack', 'Mack'])
    r('rhetor', 'The Rhetor', 'Smolyanínov', "The Mason who prepares Pierre for initiation.", ['Rhetor', 'Smolyanínov'])
    r('karagins', 'The Karágins', '', "", ['Karágins'], kind=G)
    r('murat', 'Murat', '', "", ['Murat'])
    r('davout', 'Davout', '', "", ['Davout'])
    r('lannes', 'Lannes', '', "", ['Lannes'])
    r('weyrother', 'Weyrother', '', "", ['Weyrother'])
    r('barclay-de-tolly', 'Barclay de Tolly', '', "", ['Barclay de Tolly', 'Barclay'])
    r('talleyrand', 'Talleyrand', '', "", ['Talleyrand'])
    r('caulaincourt', 'Caulaincourt', '', "", ['Caulaincourt'])
    r('metternich', 'Metternich', '', "", ['Metternich'])
    r('potemkin', 'Potëmkin', '', "", ['Potëmkin'])
    r('catherine-the-great', 'Catherine the Great', '', "", ['Catherine the Great', 'Catherine'], exclude_paragraphs={(21, 40), (21, 57), (239, 13), (267, 15), (267, 20), (268, 20)})
    r('catherine-semenovna', 'Princess Catherine Semënovna', "Count Bezúkhov's niece", "", ['Catherine Semënovna', 'Catherine'], only_paragraphs={(21, 40), (21, 57)})
    r('emperor-paul', 'Emperor Paul', 'Paul I', "", ['Emperor Paul', 'Tsar Paul', 'Paul I of Russia', 'Paul'], only_paragraphs={(25, 0), (52, 4), (189, 2), (199, 1), (340, 10)})
    r('paul-ivanovich-kutuzov', 'Paul Ivánovich Kutúzov', 'The poet', "", ['Paul Ivánovich Kutúzov', 'Paul Ivánovich'])
    r('paul-timofeevich', 'Paul Timoféevich', '', "", ['Paul Timoféevich'])
    r('st-paul', 'Saint Paul', '', "", ['Saint Paul'])
    r('frederick-the-great', 'Frederick the Great', '', "", ['Frederick the Great', 'Frederick'])

def moby():
    B = 'moby-dick'; r = maker(B)
    add_aliases(B, 'steelkilt', ['Lakeman'])
    add_aliases(B, 'tashtego', ['Tash'])
    add_aliases(B, 'queequeg', ['Quohog'])
    add_aliases_restricted(B, 'peter-coffin', ['Peter'], only_paragraphs={(2, 7)})
    r('perth', 'Perth', 'The blacksmith', "", ['Perth'], role='supporting')
    r('czar-peter', 'Czar Peter', '', "", ['Czar Peter'])
    r('samuel-enderby', 'Samuel Enderby', 'Merchant of London', "", ['Samuel'], only_paragraphs={(101, 0), (101, 1), (101, 2)})
    r('st-paul', 'St. Paul', '', "", ['St. Paul', 'Pilot Paul', 'Paul'])
    r('adam', 'Adam', '', "", ['Adam'])
    r('noah', 'Noah', '', "", ['Noah'], exclude_paragraphs={(53, 6), (110, 0)})
    r('job', 'Job', '', "", ['Job'])
    for eid, name, al in [('jove', 'Jove', ['Jove', 'Jupiter']), ('vishnoo', 'Vishnoo', ['Vishnoo', 'Vishnu']), ('brahma', 'Brahma', ['Brahma']), ('dagon', 'Dagon', ['Dagon'])]:
        r(eid, name, '', "", al, kind=D)
    for eid, name in [('cain', 'Cain'), ('abel', 'Abel'), ('moses', 'Moses'), ('saul', 'Saul'), ('daniel', 'Daniel'), ('ezekiel', 'Ezekiel'), ('herod', 'Herod'), ('jesus', 'Jesus'), ('christ', 'Christ'), ('nathan', 'Nathan'), ('xerxes', 'Xerxes'), ('alexander', 'Alexander'), ('cato', 'Cato'), ('seneca', 'Seneca'), ('plato', 'Plato'), ('aristotle', 'Aristotle'), ('locke', 'Locke'), ('kant', 'Kant'), ('pythagoras', 'Pythagoras'), ('hercules', 'Hercules'), ('cleopatra', 'Cleopatra'), ('napoleon', 'Napoleon'), ('coleridge', 'Coleridge'), ('rabelais', 'Rabelais'), ('bunyan', 'Bunyan'), ('cervantes', 'Cervantes'), ('shakespeare', 'Shakespeare'), ('goethe', 'Goethe'), ('phidias', 'Phidias')]:
        r(eid, name, '', "", [name])

if __name__ == '__main__':
    for k in (sys.argv[1:] or ['histories', 'wap', 'moby']):
        {'histories': histories, 'wap': wap, 'moby': moby}[k]()
