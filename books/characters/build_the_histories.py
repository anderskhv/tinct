"""Reviewed bindings for the Histories.

Nine books, 1,525 sections, 1,626 paragraphs per edition, aligned paragraph for
paragraph. AUTHORING IS IN PROGRESS: Books 1-7 (sections 1-1260) are authored.

Herodotus reuses names across generations and empires, so most of the work here
is position tables rather than aliases. In Book 1 alone there are two men called
Atys, two called Lycurgus and two called Cambyses, and the Alexander who carries
off Helen is not the Alexander who will rule Macedon in Book 5.

Names that belong to a person Herodotus has not yet been authored for are left
unbound rather than defaulted to the Book 1 man of the same name. That is why
the tables below have no defaults.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'the-histories'

# name -> ({(section, paragraph): id}, default or None)
SPLIT={
 # The Athenian faction leader, then the Spartan lawgiver, six sections apart.
 'Lycurg(?:us|os)':({(58,0):'lycurgus-athenian',(59,0):'lycurgus-athenian',
              (64,0):'lycurgus-spartan',(64,1):'lycurgus-spartan',
              (65,0):'lycurgus-spartan',
              (1013,0):'lycurgus-arcadia'},None),
 # Croesus's son, and the ancient king from whom the Lydians are named.
 'Atys':    ({(7,0):'atys-son-of-manes',(93,0):'atys-son-of-manes',
              (34,0):'atys-son-of-croesus',(1053,0):'atys-father-of-pythius',(1097,0):'atys-son-of-manes'},None),
 # Cyrus's father everywhere in Book 1 except the handover at the end, where
 # it is Cyrus's son.
 'Cambyses':({(45,0):'cambyses-i',(72,0):'cambyses-i',(106,0):'cambyses-i',
              (107,0):'cambyses-i',(110,0):'cambyses-i',(121,0):'cambyses-i',
              (123,0):'cambyses-i',(206,0):'cambyses-i',
              (207,0):'cambyses-ii',(1027,0):'cambyses-ii',(1034,0):'cambyses-ii',(1044,0):'cambyses-ii',
             (1037,0):'cambyses-i',(1075,0):'cambyses-i'},None),
 # The Mede whose son the boy Cyrus whipped. A different Artembares appears in
 # the last section of Book 9 and is not yet authored.
 'Artembares':({(113,0):'artembares-mede',(114,0):'artembares-mede',
                (115,0):'artembares-mede'},None),
 # The Spartan king of Croesus's day.
 'Ariston': ({(66,0):'ariston-spartan',(836,0):'ariston-spartan',
              **{(n,0):'ariston-spartan' for n in [937,947,948,949,950,951,952,954,955,1029,1123,1231,1260]},
              (694,0):'ariston-byzantium'},None),
 # Leon king of Sparta, Leonidas's grandfather. The Leon sacrificed by the
 # Persians in Book 8 is a different man and is not yet authored.
 'Leon':    ({(64,0):'leon',(800,0):'leon',(1226,0):'leon',(1202,0):'leon-troezen'},None),
 # Agron's grandfather. The Ninos who fathered Sardanapallos is another man.
 'Nin(?:us|os)':({(7,0):'ninus'},None),
 # Bias of Priene. The Bias of Book 9 is Melampus's brother at Argos.
 'Bias':    ({(27,0):'bias',(169,0):'bias'},None),
 # Book 2. The king Moeris, not the lake that carries his name; the lake is a
 # place and is not cast.
 'Mo(?:e|i)ris':({(221,0):'moeris-king',(228,0):'moeris-king',
                 (316,0):'moeris-king'},None),
 # Paris again, in Egypt with Helen and the stolen goods.
 # Two men called Heracleides: Aristagoras of Cyme's father, and the Mylasan
 # who planned the ambush that destroyed Daurises.
 'Heracl(?:e)?ides':({(798,0):'heracleides-cyme',(881,0):'heracleides-mylasa'},None),
 # Anaxandrides's youngest son, named once as Pausanias's father and once in
 # the list of brothers.
 'Cleombrot(?:us|os)':({(793,0):'cleombrotus-sparta',(802,0):'cleombrotus-sparta',(1227,0):'cleombrotus-sparta'},None),
 # BOOK 5. Two men called Aristagoras, two called Cleisthenes, a third Otanes,
 # a second Adrastus, and the Macedonian Alexander, who has been left unbound
 # since section 3 so that Paris could have the name to himself.
 # The Milesian is the default, but not every Aristagoras is him: the tyrant of
 # Cyzicus in Darius's fleet (694) is another man, and the Samian father of
 # Hegesistratos (1493) belongs to Book 9, which is not yet authored.
 'Aristagoras':({(694,0):'aristagoras-kyzikos',(798,0):['aristagoras-cyme','aristagoras-miletus'],
                 (1493,0):None},'aristagoras-miletus'),
 'Cleisthenes':({(827,0):'cleisthenes-athens',(829,0):'cleisthenes-sicyon',
                 (831,0):'cleisthenes-athens',(833,0):'cleisthenes-athens',
                 (834,0):'cleisthenes-athens',
                 # Book 6: the whole suitor-contest is the Sicyonian, and the
                 # last section runs the grandson and the grandfather together.
                 (1012,0):'cleisthenes-sicyon',(1014,0):'cleisthenes-sicyon',
                 (1015,0):'cleisthenes-sicyon',(1016,0):'cleisthenes-sicyon',
                 (1017,0):['cleisthenes-athens','cleisthenes-sicyon',
                           'cleisthenes-sicyon']},None),
 # Otanes son of Pharnaspes, of the seven. The Otanes of Book 5 is Sisamnes's
 # son; the Otanes of 877, 883 and Books 7-9 are other men again, and unbound.
 'Otanes':({(465,0):'otanes',(466,0):'otanes',(467,0):'otanes',(468,0):'otanes',(469,0):'otanes',(473,0):'otanes',(477,0):'otanes',(478,0):'otanes',(480,0):'otanes',(481,0):'otanes',(485,0):'otanes',(538,0):'otanes',(541,0):'otanes',(544,0):'otanes',(546,0):'otanes',(929,0):'otanes',
            (786,0):'otanes-sisamnes',(787,0):'otanes-sisamnes',
            (789,0):'otanes-sisamnes',(1085,0):'otanes-father-of-amestris',(1104,0):'otanes-brother-of-darius'},None),
 # The Phrygian suppliant of Book 1; the Argive hero of Sicyon in Book 5.
 'Adrast(?:us|os)':({(35,0):'adrastus',(36,0):'adrastus',(37,0):'adrastus',(38,0):'adrastus',(39,0):'adrastus',(40,0):'adrastus',(41,0):'adrastus',(42,0):'adrastus',(43,0):'adrastus',(44,0):'adrastus',(45,0):'adrastus',
                     (828,0):'adrastus-argos',(829,0):'adrastus-argos'},None),
 # BOOK 4. The royal house of Cyrene, where the oracle itself says there will
 # be "four named Battus and four named Arcesilaus". The founder, his grandson
 # the Fortunate, and his great-great-grandson the Lame are three men; so are
 # the three Arcesilauses. Where the name stands for the dynasty rather than a
 # man — the oracle at 719, the spared kinsmen at 758 — it goes to the house.
 'Batt(?:us|os)':({(706,0):'battus-i',(709,0):'battus-i',(710,0):'battus-i',(711,0):'battus-i',(711,1):'battus-i',(711,2):'battus-i',(712,0):'battus-i',(713,2):'battus-i',
              (715,0):['battus-i','battus-ii'],
              (716,0):'battus-ii',
              (717,0):'battus-iii',(718,0):'battus-iii',(761,0):'battus-iii',
              (719,0):'battiadae',(758,0):'battiadae'},None),
 'Ar(?:cesilaus|kesilaos)':({(715,0):'arcesilaus-i',
              (716,0):'arcesilaus-ii',(717,0):'arcesilaus-ii',
              (718,0):'arcesilaus-iii',(720,0):'arcesilaus-iii',
              (721,0):'arcesilaus-iii',(723,0):'arcesilaus-iii',
              (756,0):'arcesilaus-iii',(758,0):'arcesilaus-iii'},None),
 # Two kings called Etearchus: the Ammonian of Book 2, and the Cretan of Oaxus
 # who swore his own daughter away.
 'Etearch(?:us|os)':({(247,0):'etearchus',(248,0):'etearchus',
                      (710,0):'etearchus-oaxos'},None),
 # Anacharsis the Scythian, killed by his brother the king; Book 10 of the
 # Republic's Anacharsis is the same man but belongs to another book entirely.
 'Anacharsis':({(602,0):'anacharsis-scythian',(632,0):'anacharsis-scythian',
                (633,0):'anacharsis-scythian'},None),
 # Pythagoras named only as the master Salmoxis is supposed to have served.
 'Pythagoras':({(651,0):'pythagoras-samos'},None),
 # Two men called Archias in one paragraph: the Lacedaemonian who died inside
 # Samos, and his grandson of the same name, whom Herodotus met at Pitane. Only
 # the fourth occurrence is the grandson.
 'Archias':({(452,0):['archias-samos','archias-samos','archias-samos',
                      'archias-grandson','archias-samos','archias-samos']},None),
 # BOOK 3. The impostor is never given the name Smerdis in narration — every
 # literal "Smerdis" in the text is Cyrus's son — so he is bound on the word
 # "Magian", which the caste of the same name also answers to. Position
 # separates the three: the usurper (singular, Book 3 and the four later
 # backward glances), the two brothers (plural, Book 3), and the priestly caste
 # (everywhere else).
 'Magian': ({(458,0):'smerdis-the-magian',(459,0):'smerdis-the-magian',(460,0):'smerdis-the-magian',(461,0):'smerdis-the-magian',(462,0):'smerdis-the-magian',(464,0):'smerdis-the-magian',(465,0):'smerdis-the-magian',(466,0):'smerdis-the-magian',(468,0):'smerdis-the-magian',(470,0):'smerdis-the-magian',(475,0):'smerdis-the-magian',(476,0):'magians',(477,0):'smerdis-the-magian',(485,0):'smerdis-the-magian',(515,0):'smerdis-the-magian',(537,0):'smerdis-the-magian',(547,0):'smerdis-the-magian',(550,0):'smerdis-the-magian',(106,0):'magians',(107,0):'magians',(127,0):'magians',(131,0):'magians',(688,0):'magians'},None),
 'Magians':({(458,0):'magian-brothers',(460,0):'magian-brothers',(462,0):'magian-brothers',(463,0):'magian-brothers',(471,0):'magian-brothers',(472,0):'magian-brothers',(473,0):'magian-brothers',(475,0):'magian-brothers',(476,0):'magian-brothers',(477,0):'magian-brothers',(523,0):'magian-brothers',(100,0):'magians',(119,0):'magians',(139,0):'magians',(1045,0):'magians',(1062,0):'magians',(1067,0):'magians',(1135,0):'magians',(1213,0):'magians'},None),
 'Alexander':({(3,0):'alexander-paris',(327,0):'alexander-paris',
               (331,1):'alexander-paris',(331,6):'alexander-paris',
               (328,0):'alexander-paris',(329,0):'alexander-paris',
               (330,0):'alexander-paris',(331,0):'alexander-paris',
               (332,0):'alexander-paris',(333,0):'alexander-paris',
               (334,0):'alexander-paris',(335,0):'alexander-paris',
               (778,0):'alexander-macedon',(780,0):'alexander-macedon',
               (781,0):'alexander-macedon',(782,0):'alexander-macedon',
               (783,0):'alexander-macedon',
               **{(n,0):'alexander-macedon' for n in
                  [1195,1197,1294,1380,1395,1396,1398,1399,1400,1401,1402,1403,
                   1404,1407,1411,1447,1448,1449]}},None),
 # BOOK 6. The worst namesake book in the Histories. Two men called Miltiades
 # in one family, two called Cimon, two called Stesagoras, four called
 # Hippocrates, three called Megacles, two called Agariste, and a Cypselus, a
 # Harpagus, an Oebares, a Procles, a Chilon, a Callias, a Tisander and an
 # Aeaces who each share a name with a man cast from an earlier book.
 'Miltiades':({(920,0):['miltiades','miltiades-cypselus'],
               (921,0):'miltiades-cypselus',(922,0):'miltiades-cypselus',
               (923,0):'miltiades-cypselus',
               (989,0):['miltiades','miltiades-cypselus','miltiades-cypselus',
                        'miltiades','miltiades-cypselus']},'miltiades'),
 '(?:Kimon|Cimon)':({(1022,0):'cimon-son-of-miltiades',
                     (1129,0):'cimon-son-of-miltiades'},'cimon'),
 'Stesagoras':({(920,0):'stesagoras-elder',(924,0):'stesagoras',(925,0):'stesagoras',
                (989,0):['stesagoras-elder','stesagoras']},None),
 '(?:Kypselos|Cypselus)':({(920,0):'cypselus-athens',(921,0):'cypselus-athens',
                           (922,0):'cypselus-athens'},'cypselus'),
 'Harpag(?:us|os)':({(914,0):'harpagus-persian',(916,0):'harpagus-persian'},'harpagos'),
 'O[ei]bares':({(919,0):'oebares-dascyleium'},'oibares'),
 # Three generations of the Samian house answer to the same name; only the last
 # occurrence of section 899 is the grandfather.
 'A(?:iakes|eaces)':({(397,0):'aiakes',(436,0):'aiakes',(536,0):'aiakes',
                      (899,0):['aeaces-samos','aeaces-samos','aeaces-samos',
                               'aiakes']},'aeaces-samos'),
 '(?:Procles|Prokles)':({(703,0):'procles-sparta',(938,0):'procles-sparta',
                         (1390,0):'procles-sparta'},'procles'),
 'Chilon':({(951,0):'chilon-demarmenos'},'chilon'),
 # The Athenian Callias and his grandson; the Elean diviner is the default.
 'Callias':({(1007,0):'callias-athens',(1008,0):'callias-athens',
             (1173,0):None},'callias'),
 'Tisander':({(1013,0):'tisander-athens',(1014,0):'tisander-athens',
              (1015,0):'tisander-athens'},'tisander'),
 '(?:Hippocrates|Hippokrates)':({(909,0):'hippocrates-gela',(1176,0):'hippocrates-gela',
                                 (1177,0):'hippocrates-gela',
                                 (1013,0):'hippocrates-sybaris',
                                 (1017,0):'hippocrates-alcmaeonid'},'hippocrates'),
 '(?:Megacles|Megakles)':({(1011,0):['megacles','megacles-elder']},'megacles'),
 'Agariste':({},'agariste'),
 '(?:Artaphrenes|Artaphernes)':({(980,0):['artaphrenes-son','artaphrenes'],
                                 (1005,0):'artaphrenes-son',(1034,0):'artaphrenes-son',
                                 (1036,0):'artaphrenes-son',
                                 (1097,0):['artaphrenes-son','artaphrenes']},'artaphrenes'),
 # The text does not say whether the Hydarnes who heard the denunciation is the
 # conspirator of Book 3 or his son. Left unbound.
 'Hydarnes':({(1019,0):None,(1090,0):None,
             (1105,0):['hydarnes-son','hydarnes'],
             **{(n,0):'hydarnes-son' for n in [1157,1158,1233,1237,1239,1372,1377]}},'hydarnes'),
 '(?:Skythes|Scythes)':({(909,0):'scythes-zancle',(910,0):'scythes-zancle',
                         (1185,0):'scythes-cos'},'skythes'),
 'Cleander':({(969,0):'cleander',(1176,0):'cleander-gela',
             (1177,0):['cleander-gela','cleander-son-of-hippocrates']},None),
 # Cynegirus's father and the Arcadian who kept open house. The Euphorion of
 # Book 2 is Aeschylus's father and is not bound to either.
 'Euphorion':({(1000,0):'euphorion-athens',(1013,0):'euphorion-arcadia'},None),
 '(?:Diactorides|Diaktorides)':({(957,0):'diactorides-sparta',
                                 (1013,0):'diactorides-crannon'},None),
 # The hero whose grove Cleomenes burned, in the same paragraphs as the city.
 'Argos':({(961,0):'argos-hero',(964,0):'argos-hero',(966,0):['argos-hero'],
           (968,0):[None,'argos-hero']},None),
 'Thas(?:os|us)':({(933,0):['thasus','thasus']},None),
 '(?:Anaxilaus|Anaxilaos)':({(909,0):'anaxilaus',(1187,0):'anaxilaus',
                             (1192,0):'anaxilaus'},None),
 '(?:Archidamus|Archidemos)':({(957,0):'archidamus'},None),
 'Agis':({(951,0):'agis',(1226,0):'agis-agiad'},None),
 '(?:Demarmenos|Demarmenus)':({(951,0):'demarmenos'},None),
 'Leoprepes':({(971,0):'leoprepes',(1249,6):'leoprepes-ceos'},None),
 # The Glaucus story is four paragraphs, oracle included; the Glaucus of
 # Book 1 is the Chian who made the iron stand and is not cast.
 '(?:Glaucus|Glaucos)':({(972,1):'glaucus',(972,2):'glaucus',(972,3):'glaucus'},None),
 '(?:Polycritus|Polycritos)':({(936,0):'polycritus',(959,0):'polycritus'},None),
 'Thersander':({(703,0):'thersander',(938,0):'thersander'},None),
 'Aristodem(?:us|os)':({(703,0):'aristodemus',(938,0):'aristodemus',
                        (1226,0):'aristodemus',(1390,0):'aristodemus',
                        **{(n,0):'aristodemus-thermopylae' for n in [1250,1251,1252,1474]}},None),
 'Laodamas':({(694,0):'laodamas'},None),
 'Lysagoras':({(1019,0):'lysagoras',(791,0):'lysagoras-miletus'},None),
 # BOOK 7. The army catalogue reuses names without distinguishing them, and
 # eight of its men share a name with somebody cast from an earlier book.
 'Arsames':({(1092,0):'arsames-son-of-darius',
             (1093,0):'arsames-son-of-darius'},'arsames'),
 'Artacha(?:ees|ies)':({(1048,0):'artachaees',(1139,0):'artachaees',
                        (1140,0):'artachaees',
                        (1087,0):'artachaees-father-of-otaspes'},None),
 'Hystaspes':({(1088,0):'hystaspes-son-of-darius'},'hystaspes'),
 'Sisamnes':({(1090,0):'sisamnes-son-of-hydarnes'},'sisamnes'),
 'Artabaz(?:us|os)':({(191,0):'artabazus-babylon'},'artabazus'),
 'Tritanta(?:ec|ic)hmes':({(191,0):'tritantaechmes-babylon'},'tritantaechmes'),
 'Ariomard(?:us|os)':({(1090,0):'ariomardus-caspians',
                       (1100,0):'ariomardus-son-of-darius'},None),
 # The ancestor at the head of the line, against Xerxes's brother.
 'Acha(?:e|i)menes':({(472,0):'achaemenes-ancestor',
                      (1037,0):'achaemenes-ancestor'},'achaimenes'),
 'Gobryas':({(1095,0):'gobryas-son-of-darius'},'gobryas'),
 'Prexaspes':({(1119,0):'prexaspes-son-of-aspathines'},'prexaspes'),
 'Megabyz(?:us|os)':({(1104,0):'megabyzus-son-of-zopyrus',
                      (1143,0):'megabyzus-son-of-zopyrus'},'megabyzos'),
 'Megabaz(?:us|os)':({(1119,0):'megabazus-son-of-megabates'},'megabazos'),
 # Histiaeus of Termera and his father, against Histiaeus of Miletus and the
 # Scythian steward Tymnes. Sections 798 and 1120 are the Carian pair.
 'Tymnes':({(632,0):'tymnes',(798,0):'tymnes-termera',
            (1120,0):'tymnes-termera'},None),
 '(?:Histiaeus|Histiaios)':({(1120,0):'histiaeus-termera'},'histiaeus'),
 'Pigres':({(773,0):'pigres',(1120,0):'pigres-caria'},None),
 'Candaules':({(1120,0):'candaules-caria'},'candaules'),
 'Lygdamis':({(1121,0):'lygdamis-halicarnassus'},'lygdamis'),
 'Siromu?(?:s|os)':({(1120,0):'siromus-tyre'},'siromus'),
 'Cadm(?:us|os)':({(1185,0):'cadmus-cos',(1186,0):'cadmus-cos'},'cadmus'),
 'Aristeas':({(1159,0):'aristeas-corinth'},'aristeas'),
 'Adeimant(?:us|os)':({(1159,0):'adeimantus'},None),
 # Lycus son of Pandion; the rivers of the same name are not cast.
 'Lyc(?:us|os)':({(172,0):'lycos',(1114,0):'lycos'},None),
 # The Silenus, not the river of Book 5.
 'Marsyas':({(1052,0):'marsyas'},None),
 'Arta(?:y|ÿ)ntes':({(1090,0):'artayntes'},None),
 'O(?:eobazus|iobazos)':({(1091,0):'oeobazus'},None),
 'Badres':({(1099,0):'badres'},None),
 'Polydoros':({(1226,0):'polydorus-sparta'},None),
 'Hegesilaos':({(1226,0):'hegesilaus'},None),
 'Artanes':({(1245,0):'artanes'},None),
 'Cretines':({(1187,0):'cretines-rhegium',(1212,0):'cretines-magnesia'},None),
 # Perses in the older translation where the modern one writes Perseus.
 'Perses':({(1085,0):'perses',(1172,0):'perses',(1241,1):'perses'},None),
 # The ancestor in Xerxes's genealogy; the Ariaramnes of Book 8 is another man.
 'Ariaramnes':({(1037,0):'ariaramnes'},None),
 # Thyia's father, not the river of Phocis.
 'Kephisos|Cephisus':({(1200,0):'cephisus'},None),
 'Winds':({(1200,0):'the-winds',(1201,0):'the-winds'},None),
}

# Section 476 mixes the two usurpers with the caste being massacred, and the two
# translations distribute the plural differently inside the paragraph, so this
# one paragraph needs a list per edition.
EDITION_SPLIT={
 ('modern-en','Cleisthenes'):{(828,0):['cleisthenes-athens']+['cleisthenes-sicyon']*7,
                              (830,0):['cleisthenes-sicyon','cleisthenes-athens']},
 ('original-en','Cleisthenes'):{(828,0):['cleisthenes-athens']+['cleisthenes-sicyon']*6,
                                (830,0):['cleisthenes-sicyon','cleisthenes-athens','cleisthenes-sicyon']},
 ('modern-en','Ar(?:cesilaus|kesilaos)'):{(719,0):['arcesilaus-iii','battiadae']},
 ('original-en','Ar(?:cesilaus|kesilaos)'):{(719,0):['arcesilaus-iii','arcesilaus-iii','battiadae']},
 ('modern-en','Magians'):{(476,0):['magian-brothers','magian-brothers','magian-brothers',
                                   'magians','magians']},
 ('original-en','Magians'):{(476,0):['magian-brothers','magian-brothers','magians',
                                     'magian-brothers','magians','magians','magians']},
 # Section 1017 runs three generations of Alcmaeonidae together, and the prose
 # repeats both names once more than the verse does.
 ('original-en','(?:Megacles|Megakles)'):{(1017,0):['megacles','megacles-younger']},
 ('modern-en','(?:Megacles|Megakles)'):{(1017,0):['megacles','megacles','megacles-younger']},
 ('original-en','Agariste'):{(1017,0):['agariste-younger','agariste']},
 ('modern-en','Agariste'):{(1017,0):['agariste-younger','agariste','agariste-younger']},
}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 for name,(table,default) in SPLIT.items():
  entry=EDITION_SPLIT.get((edition,name),{}).get((ch,pi))
  if entry is None:entry=table.get((ch,pi),default)
  if entry is None:continue
  if isinstance(entry,list):
   # one id per occurrence, in order; None skips that occurrence
   for i,m in enumerate(re.finditer(word(name),text)):
    who=entry[i] if i<len(entry) else None
    if who:out.append((m.start(),m.end(),who,'reviewed-context'))
  else:
   for m in re.finditer(word(name),text):out.append((m.start(),m.end(),entry,'reviewed-context'))
 return out

def compile_package():return assemble('the-histories',bind)
if __name__=='__main__':run('the-histories','The Histories',bind)
