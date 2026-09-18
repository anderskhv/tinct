#!/usr/bin/env python3
"""Divine Comedy (Longfellow): clickable-names pass.

Chapters are cantos numbered straight through (Inferno 1-34, Purgatorio
35-67, Paradiso 68-100).

Corrections to first-generation cards that the capped-names rebind
expanded too far: "Frederick" at Frederick Novello / Tignoso / of Aragon
(40,5)(48,35)(41,39)(87,20) is not Frederick II; "Alexander" in India
(14,10) is the Great, not the tyrant; "Bernard" who first bared his feet
(78,26) is Bernard of Quintavalle, not Clairvaux; "Thomas" whose festival
Buondelmonte's baron keeps (83,42) is the Apostle; "Adam" in canto XXX is
Master Adam the counterfeiter; "Jason" in canto XIX is the high priest;
"Peter" at Peter Lombard, Bernardone, Mangiador, of Spain, Damiano and
the basilica (18,10)(31,19) is not the Apostle; "Mary" who ate her son
(56,47) is Mary of Jerusalem.

Homonyms among the new cards: Guido (Cavalcanti / Bonatti / del Cassero /
of Romena / del Duca / di Carpigna / da Prata / da Castel / Guinicelli /
the Counts Guidi), Charles (of Anjou / of Valois / II of Naples / Martel),
Caesar (Julius only where he is meant; Tiberius as "the third Caesar"),
John (the Evangelist / the Baptist; the Baptistery "Saint John" left),
Mars (the god; the planet and its heaven left), Dionysius (the tyrant /
the Areopagite), William (Marquis of Montferrat / of Orange), Costanza
(the Empress / Manfred's daughter), Giovanna (Buonconte's wife / Nino's
daughter), Buoso (degli Abati / Donati), Zeno (the philosopher; San Zeno
left), Paris (the Trojan; the city left), Dis (Lucifer; the city left),
Gregory, Scipio and Frederick II unified where the same man is meant.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from add_histories_helpers import add_entity_excluding as add_e
from add_aliases import add_aliases
from add_aliases_restricted import add_aliases_restricted
from add_philosophy_sweep_entities import drop_mentions

BOOK = 'divine-comedy'
P, D, G = 'person', 'deity', 'group'


def r(eid, name, subtitle, body, aliases, kind=P, role='reference', **kw):
    kw.setdefault('strict_editions', ())
    add_e(BOOK, eid, name, subtitle, body, role, kind, aliases, **kw)


def simple(kind, *rows):
    for row in rows:
        eid, name = row[0], row[1]
        subtitle = row[2] if len(row) > 2 else ''
        aliases = row[3] if len(row) > 3 else [name]
        r(eid, name, subtitle, "", aliases, kind=kind)


def corrections():
    drop_mentions(BOOK, 'alexander-tyrant', paragraphs={(14, 10)})
    r('alexander-the-great', 'Alexander', 'The Great', "Who in India saw flames fall upon his host.", ['Alexander'], only_paragraphs={(14, 10)})
    drop_mentions(BOOK, 'emperor-frederick-ii', paragraphs={(40, 5), (41, 39), (48, 35), (87, 20)})
    r('frederick-novello', 'Frederick Novello', '', "", ['Frederick Novello'])
    r('frederick-tignoso', 'Frederick Tignoso', '', "", ['Frederick Tignoso'])
    r('frederick-of-aragon', 'Frederick', 'King of Sicily', "Son of Peter of Aragon.", ['Frederick'], only_paragraphs={(41, 39), (87, 20)})
    drop_mentions(BOOK, 'bernard', paragraphs={(78, 26)})
    r('bernard-of-quintavalle', 'Bernard', 'Of Quintavalle', "The first follower of St. Francis.", ['Bernard'], only_paragraphs={(78, 26)})
    drop_mentions(BOOK, 'thomas-aquinas', paragraphs={(83, 42)})
    r('st-thomas-apostle', 'Thomas', 'The Apostle', "", ['Thomas'], only_paragraphs={(83, 42)})
    drop_mentions(BOOK, 'adam', paragraphs={(30, 20), (30, 34)})
    r('master-adam', 'Master Adam', 'The counterfeiter of Brescia', "", ['Master Adam', 'Adam'], only_paragraphs={(30, 14), (30, 20), (30, 34)})
    drop_mentions(BOOK, 'jason-argonaut', paragraphs={(19, 28)})
    r('jason-high-priest', 'Jason', 'The high priest', "", ['Jason'], only_paragraphs={(19, 28)})
    drop_mentions(BOOK, 'saint-peter', paragraphs={(18, 10), (31, 19), (77, 35), (78, 29), (79, 44), (88, 40)})
    r('peter-lombard', 'Peter Lombard', '', "Who offered his treasure to the Church like the poor widow.", ['Peter'], only_paragraphs={(77, 35)})
    r('peter-bernardone', 'Peter Bernardone', "Francis's father", "", ['Peter Bernardone'])
    r('peter-mangiador', 'Peter Mangiador', '', "", ['Peter Mangiador'])
    r('peter-of-spain', 'Peter of Spain', '', "", ['Peter of Spain'])
    r('peter-damiano', 'Peter Damiano', '', "Peter the Sinner in the house of Our Lady on the Adriatic.", ['Peter Damiano', 'Peter the Sinner'])
    drop_mentions(BOOK, 'mary', paragraphs={(56, 47)})
    r('mary-of-jerusalem', 'Mary', 'Of Jerusalem', "Who ate her son in the famine of the siege.", ['Mary'], only_paragraphs={(56, 47)})
    add_aliases_restricted(BOOK, 'lucifer', ['Dis'], only_paragraphs={(11, 21), (12, 12), (34, 6)})


def main():
    corrections()
    # Guido
    r('guido-cavalcanti', 'Guido Cavalcanti', "Cavalcante's son", "", ['Guido'], only_paragraphs={(10, 20)})
    r('guido-bonatti', 'Guido Bonatti', 'Astrologer', "", ['Guido Bonatti'])
    r('guido-del-cassero', 'Messer Guido', 'Of Fano', "Guido del Cassero.", ['Messer Guido'])
    r('guido-of-romena', 'Guido', 'Count of Romena', "", ['Guido'], only_paragraphs={(30, 25)})
    r('alessandro-of-romena', 'Alessandro', 'Count of Romena', "", ['Alessandro'], only_paragraphs={(30, 25)})
    r('guido-del-duca', 'Guido del Duca', '', "", ['Guido del Duca'])
    r('guido-di-carpigna', 'Guido di Carpigna', '', "", ['Guido di Carpigna'])
    r('guido-da-prata', 'Guido da Prata', '', "", ['Guido da Prata'])
    r('guido-da-castel', 'Guido da Castel', '', "", ['Guido da Castel'])
    r('guido-guinicelli', 'Guido Guinicelli', '', "", ['Guido Guinicelli'])
    r('county-guido', 'The County Guido', 'The Counts Guidi', "", ['County Guido'])
    # Charles
    r('charles-of-anjou', 'Charles', 'Of Anjou', "", ['Charles'], only_paragraphs={(19, 32), (39, 22), (45, 45), (54, 22), (75, 23)})
    r('charles-of-valois', 'Charles', 'Of Valois', "Another Charles from France.", ['Charles'], only_paragraphs={(54, 23)})
    r('charles-ii-of-naples', 'Charles', 'II of Naples', "", ['Charles'], only_paragraphs={(73, 35), (87, 20)})
    r('charles-martel', 'Charles Martel', '', "", ['Charles'], only_paragraphs={(76, 0)})
    r('clemence', 'Clemence', '', "", ['Clemence'])
    r('julius-caesar', 'Caesar', '', "", ['Caesar'], only_paragraphs={(4, 40), (13, 21), (28, 32), (52, 33), (60, 25), (73, 18)})
    r('tiberius', 'Tiberius', 'The third Caesar', "", ['Caesar'], only_paragraphs={(73, 28)})
    r('st-john-evangelist', 'John', 'The Evangelist', "", ['John'], only_paragraphs={(63, 34), (66, 25)})
    r('john-the-baptist', 'John', 'The Baptist', "", ['John'], only_paragraphs={(99, 10)})
    r('mars', 'Mars', '', "", ['Mars'], kind=D, exclude_paragraphs={(24, 48), (36, 4), (81, 33)})
    r('dionysius-tyrant', 'Dionysius', 'Tyrant of Syracuse', "", ['Dionysius'], only_paragraphs={(12, 35)})
    r('dionysius-areopagite', 'Dionysius', 'The Areopagite', "", ['Dionysius'], only_paragraphs={(95, 43)})
    r('marquis-william', 'Marquis William', 'Of Montferrat', "", ['Marquis William'])
    r('william-of-orange', 'William', 'Of Orange', "", ['William'], only_paragraphs={(85, 15)})
    r('empress-costanza', 'Costanza', 'The Empress', "Constance, mother of Frederick II.", ['Costanza'], only_paragraphs={(37, 37), (70, 39), (71, 32)})
    r('costanza-of-aragon', 'Costanza', "Manfred's daughter", "", ['Costanza'], only_paragraphs={(37, 47), (41, 42)})
    r('giovanna-buonconte', 'Giovanna', "Buonconte's wife", "", ['Giovanna'], only_paragraphs={(39, 29)})
    r('giovanna-nino', 'Giovanna', "Nino's daughter", "", ['Giovanna'], only_paragraphs={(42, 23)})
    r('buoso-abati', 'Buoso', 'Degli Abati', "", ['Buoso'], only_paragraphs={(25, 46)})
    r('buoso-donati', 'Buoso Donati', '', "", ['Buoso Donati'])
    r('zeno', 'Zeno', '', "", ['Zeno'], only_paragraphs={(4, 45)})
    r('paris', 'Paris', '', "", ['Paris'], only_paragraphs={(5, 22)})
    r('gregory', 'Gregory', 'The Great', "", ['Gregory'])
    r('scipio', 'Scipio', 'Africanus', "", ['Scipio'])
    r('nino', 'Nino', 'Judge Nino Visconti', "", ['Judge Nino', 'Nino'])
    r('anselm', 'Anselm', "Ugolino's son", "", ['Anselm'], only_paragraphs={(33, 16)})
    r('pius', 'Pius', 'Pope', "", ['Pius'], only_paragraphs={(94, 14)})
    r('sixtus', 'Sixtus', 'Pope', "", ['Sixtus'], only_paragraphs={(94, 14)})
    r('urban', 'Urban', 'Pope', "", ['Urban'], only_paragraphs={(94, 14)})
    r('calixtus', 'Calixtus', 'Pope', "", ['Calixtus'], only_paragraphs={(94, 14)})
    r('clement', 'Clement', 'Pope Clement IV', "", ['Clement'], only_paragraphs={(37, 41)})
    r('nicholas', 'Nicholas', 'Saint', "", ['Nicholas'], only_paragraphs={(54, 10)})
    r('richard-of-st-victor', 'Richard', 'Of St. Victor', "", ['Richard'], only_paragraphs={(77, 43)})
    r('conrad', 'Conrad', 'The Emperor', "", ['Conrad'], only_paragraphs={(82, 46)})
    r('felix', 'Felix', "Dominic's father", "", ['Felix'], only_paragraphs={(79, 26)})
    r('joanna', 'Joanna', "Dominic's mother", "", ['Joanna'], only_paragraphs={(79, 26)})
    # Inferno
    simple(P,
           ('ciacco', 'Ciacco'), ('capaneus', 'Capaneus'), ('priscian', 'Priscian'), ('guidoguerra', 'Guidoguerra'),
           ('tegghiaio', 'Tegghiaio Aldobrandi', '', ['Tegghiaio Aldobrandi', 'Tegghiaio']), ('guglielmo-borsiere', 'Guglielmo Borsier', '', ['Guglielmo Borsier']),
           ('geryon', 'Geryon'), ('venedico', 'Venedico Caccianimico'), ('alessio-interminei', 'Alessio Interminei'), ('thais', 'Thais'),
           ('amphiaraus', 'Amphiaraus'), ('tiresias', 'Tiresias'), ('aruns', 'Aruns'), ('manto', 'Manto'), ('eurypylus', 'Eurypylus'),
           ('michael-scott', 'Michael Scott'), ('asdente', 'Asdente'), ('malacoda', 'Malacoda'), ('scarmiglione', 'Scarmiglione'),
           ('alichino', 'Alichino', '', ['Alichino', 'Alichin']), ('calcabrina', 'Calcabrina'), ('libicocco', 'Libicocco'),
           ('draghignazzo', 'Draghignazzo'), ('ciriatto', 'Ciriatto'), ('graffiacane', 'Graffiacane', '', ['Graffiacane', 'Graffiacan']),
           ('farfarello', 'Farfarello'), ('rubicante', 'Rubicante'), ('gomita', 'Gomita', 'Friar Gomita'), ('michel-zanche', 'Michel Zanche'),
           ('catalano', 'Catalano'), ('loderingo', 'Loderingo'), ('caiaphas', 'Caiaphas'), ('annas', 'Annas'), ('vanni-fucci', 'Vanni Fucci'),
           ('cacus', 'Cacus'), ('agnello', 'Agnello'), ('puccio-sciancato', 'Puccio Sciancato'), ('cianfa', 'Cianfa'),
           ('diomed', 'Diomed'), ('deidamia', 'Deidamia'), ('mahomet', 'Mahomet'), ('ali', 'Ali'), ('pier-da-medicina', 'Pier da Medicina'),
           ('curio', 'Curio'), ('bertram-de-born', 'Bertram de Born'), ('geri-del-bello', 'Geri del Bello'), ('griffolino', 'Griffolino'),
           ('capocchio', 'Capocchio'), ('gianni-schicchi', 'Gianni Schicchi'), ('myrrha', 'Myrrha'), ('sinon', 'Sinon'),
           ('athamas', 'Athamas'), ('polyxena', 'Polyxena'), ('polydorus', 'Polydorus'), ('ephialtes', 'Ephialtes'), ('tityus', 'Tityus'),
           ('sassol-mascheroni', 'Sassol Mascheroni'), ('focaccia', 'Focaccia'), ('bocca', 'Bocca', 'Degli Abati'),
           ('gianni-del-soldanier', 'Gianni del Soldanier'), ('ganellon', 'Ganellon'), ('tebaldello', 'Tebaldello'),
           ('ruggieri', 'Ruggieri', 'The Archbishop'), ('gaddo', 'Gaddo'), ('uguccione', 'Uguccione'), ('brigata', 'Brigata'),
           ('alberigo', 'Alberigo', 'Friar Alberigo'), ('cassius', 'Cassius'), ('phlegyas', 'Phlegyas'), ('filippo-argenti', 'Filippo Argenti'),
           ('medusa', 'Medusa'), ('erictho', 'Erictho'), ('megaera', 'Megaera'), ('alecto', 'Alecto'), ('tisiphone', 'Tisiphone'),
           ('minotaur', 'The Minotaur', '', ['Minotaur']), ('nessus', 'Nessus'), ('chiron', 'Chiron'), ('pholus', 'Pholus'),
           ('dejanira', 'Dejanira'), ('azzolino', 'Azzolin'), ('obizzo', 'Obizzo'), ('attila', 'Attila'), ('pyrrhus', 'Pyrrhus'),
           ('sextus', 'Sextus'), ('rinier-da-corneto', 'Rinier da Corneto'), ('rinier-pazzo', 'Rinier Pazzo'), ('lano', 'Lano'),
           ('jacopo-da-sant-andrea', "Jacopo da Sant' Andrea", '', ['Jacopo']), ('semiramis', 'Semiramis'), ('dido', 'Dido'),
           ('sichaeus', 'Sichaeus'), ('helen', 'Helen'), ('achilles', 'Achilles'), ('tristan', 'Tristan'), ('galeotto', 'Galeotto'),
           ('homer', 'Homer'), ('horace', 'Horace'), ('lucan', 'Lucan'), ('aristotle', 'Aristotle'), ('socrates', 'Socrates'), ('plato', 'Plato'),
           ('democritus', 'Democritus'), ('diogenes', 'Diogenes'), ('anaxagoras', 'Anaxagoras'), ('thales', 'Thales'), ('empedocles', 'Empedocles'),
           ('heraclitus', 'Heraclitus'), ('dioscorides', 'Dioscorides'), ('orpheus', 'Orpheus'), ('tully', 'Tully'), ('linus', 'Linus'),
           ('seneca', 'Seneca'), ('euclid', 'Euclid'), ('ptolemy', 'Ptolemy'), ('hippocrates', 'Hippocrates'), ('avicenna', 'Avicenna'),
           ('galen', 'Galen'), ('averroes', 'Averroes'), ('electra', 'Electra'), ('camilla', 'Camilla'), ('penthesilea', 'Penthesilea'),
           ('latinus', 'Latinus'), ('lucretia', 'Lucretia'), ('julia', 'Julia'), ('cornelia', 'Cornelia'), ('saladin', 'Saladin'),
           ('abel', 'Abel'), ('abraham', 'Abraham'), ('moses', 'Moses'), ('silvius', 'Silvius'), ('anchises', 'Anchises'),
           ('cain', 'Cain'), ('theseus', 'Theseus'), ('hercules', 'Hercules', '', ['Hercules', 'Alcides']), ('icarus', 'Icarus'),
           ('daedalus', 'Daedalus'), ('phaeton', 'Phaeton'), ('arachne', 'Arachne'), ('hypsipyle', 'Hypsipyle'), ('hannibal', 'Hannibal'),
           ('tydeus', 'Tydeus'), ('joseph', 'Joseph', "Potiphar's Joseph"), ('constantine', 'Constantine'), ('sylvester', 'Sylvester', 'Pope'),
           ('eve', 'Eve'))
    simple(D, ('plutus', 'Plutus'), ('neptune', 'Neptune'), ('apollo', 'Apollo'), ('proserpina', 'Proserpina'), ('thetis', 'Thetis'),
           ('clotho', 'Clotho'), ('lachesis', 'Lachesis'), ('clio', 'Clio'), ('calliope', 'Calliope'), ('urania', 'Urania'),
           ('aurora', 'Aurora'), ('fortuna', 'Fortuna'), ('quirinus', 'Quirinus'), ('thymbraeus', 'Thymbraeus'))
    # Purgatorio
    simple(P,
           ('casella', 'Casella'), ('belacqua', 'Belacqua'), ('pia', 'Pia'), ('count-orso', 'Count Orso'),
           ('pierre-de-la-brosse', 'Pierre de la Brosse'), ('marzucco', 'Marzucco'), ('montecchi', 'The Montecchi', '', ['Montecchi']),
           ('monaldi', 'The Monaldi', '', ['Monaldi']), ('ottocar', 'Ottocar'), ('winceslaus', 'Winceslaus'), ('jacomo', 'Jacomo'),
           ('margaret', 'Margaret'), ('currado-malaspina', 'Currado Malaspina'), ('omberto', 'Omberto'),
           ('guglielmo-aldobrandeschi', 'Guglielmo Aldobrandeschi'), ('oderisi', 'Oderisi'), ('franco-bolognese', 'Franco Bolognese'),
           ('cimabue', 'Cimabue'), ('giotto', 'Giotto'), ('provenzan-salvani', 'Provenzan Salvani'), ('sapia', 'Sapia'),
           ('lizio', 'Lizio'), ('arrigo-manardi', 'Arrigo Manardi'), ('pier-traversaro', 'Pier Traversaro'), ('ugolin-d-azzo', "Ugolin d' Azzo"),
           ('currado-da-palazzo', 'Currado da Palazzo'), ('gaia', 'Gaia'), ('barbarossa', 'Barbarossa'), ('hugh-capet', 'Hugh Capet'),
           ('nella', 'Nella'), ('bonagiunta', 'Bonagiunta'), ('gentucca', 'Gentucca'), ('ubaldino', 'Ubaldin'), ('marchese', 'Messer Marchese', '', ['Messer Marchese']),
           ('arnaut', 'Arnaut', 'Arnaut Daniel'), ('trajan', 'Trajan'), ('pisistratus', 'Pisistratus'), ('tarpeia', 'Tarpeia'),
           ('niobe', 'Niobe'), ('saul', 'Saul'), ('rehoboam', 'Rehoboam'), ('sennacherib', 'Sennacherib'), ('tomyris', 'Tomyris'),
           ('cyrus', 'Cyrus'), ('holofernes', 'Holofernes'), ('ahasuerus', 'Ahasuerus'), ('esther', 'Esther'), ('pygmalion', 'Pygmalion'),
           ('midas', 'Midas'), ('achan', 'Achan'), ('sapphira', 'Sapphira'), ('heliodorus', 'Heliodorus'), ('polymnestor', 'Polymnestor'),
           ('crassus', 'Crassus'), ('juvenal', 'Juvenal'), ('terentius', 'Terentius'), ('caecilius', 'Caecilius'), ('plautus', 'Plautus'),
           ('varro', 'Varro'), ('persius', 'Persius'), ('euripides', 'Euripides'), ('antiphon', 'Antiphon'), ('simonides', 'Simonides'),
           ('agatho', 'Agatho'), ('antigone', 'Antigone'), ('argia', 'Argia'), ('ismene', 'Ismene'), ('meleager', 'Meleager'),
           ('erisichthon', 'Erisichthon'), ('levi', 'Levi'), ('elias', 'Elias'), ('ezekiel', 'Ezekiel'), ('glaucus', 'Glaucus'),
           ('marsyas', 'Marsyas'), ('lawrence', 'Lawrence', 'Saint'), ('mutius', 'Mutius'), ('samuel', 'Samuel'), ('jephthah', 'Jephthah'))
    simple(D, ('siren', 'The Siren', '', ['Siren']))
    # Paradiso
    simple(P,
           ('romeo', 'Romeo'), ('cunizza', 'Cunizza'), ('folco', 'Folco'), ('rahab', 'Rahab'), ('gratian', 'Gratian'), ('isidore', 'Isidore'),
           ('beda', 'Beda'), ('sigier', 'Sigier'), ('dominic', 'Dominic'), ('bonaventura', 'Bonaventura'), ('illuminato', 'Illuminato'),
           ('hugh-of-saint-victor', 'Hugh of Saint Victor'), ('nathan', 'Nathan'), ('chrysostom', 'Chrysostom'), ('donatus', 'Donatus'),
           ('rabanus', 'Rabanus'), ('joachim', 'Joachim'), ('albertus', 'Albertus', 'Of Cologne'), ('renouard', 'Renouard'), ('godfrey', 'Godfrey', 'The Duke'),
           ('benedict', 'Benedict', 'Saint'), ('macarius', 'Macarius'), ('romualdus', 'Romualdus'), ('james', 'James', 'The Apostle'),
           ('ripheus', 'Ripheus'), ('sarah', 'Sarah'), ('rebecca', 'Rebecca'), ('judith', 'Judith'), ('anna', 'Anna'), ('pompey', 'Pompey'),
           ('juba', 'Juba'), ('decii', 'The Decii', '', ['Decii']), ('honorius', 'Honorius'), ('amyclas', 'Amyclas'), ('parmenides', 'Parmenides'),
           ('melissus', 'Melissus'), ('brissus', 'Brissus'), ('sabellius', 'Sabellius'), ('arius', 'Arius'), ('lapo-salterello', 'Lapo Salterello'),
           ('cianghella', 'Cianghella'), ('moronto', 'Moronto'), ('eliseo', 'Eliseo'), ('buondelmonte', 'Buondelmonte'), ('clymene', 'Clymene'),
           ('cephas', 'Cephas'), ('ananias', 'Ananias'), ('jerome', 'Jerome'), ('timaeus', 'Timaeus'), ('sibyl', 'The Sibyl', '', ['Sibyl']),
           ('hezekiah', 'Hezekiah'), ('bellincione', 'Bellincione'), ('ravignani', 'The Ravignani', '', ['Ravignani']))


if __name__ == '__main__':
    main()
