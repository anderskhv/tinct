"""Manually authored recognition cards for both full English texts of the Histories.

Nine books, 1,525 numbered sections, 1,626 paragraphs per edition, aligned
paragraph for paragraph. Both editions are English renderings of the same
translation; the modern one modernises the sentence rhythm and normalises some
transliterations.

This is the largest named cast in the library. Herodotus names several hundred
people and nearly as many nations, almost never explains who they are, and reuses
the same names across generations and empires — there are two men called Atys in
the first ten sections, and the Alexander who carries off Helen is not the
Alexander who rules Macedon.

AUTHORING IS IN PROGRESS. Book 1 (Clio, sections 1-215) is authored. Books 2-9
are not yet done and the package must not be integrated until they are.

Scope: named people and named peoples. Cities, rivers, mountains, seas and
countries are not cast, even where Herodotus treats them as actors.
"""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person',updates=None):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=updates or []))

# ==================================================== BOOK 1 — CLIO (1-215)
# ------------------------------------------------------------- the Lydian kings
for row in [
('croesus','Croesus','King of Lydia, the first barbarian Herodotus knows of to subdue Greeks. He asks Solon who is the happiest of men, loses his son, attacks Persia on a misread oracle, loses his kingdom, and ends as Cyrus’s adviser.','Croesus','central'),
('candaules','Candaules','The last Heraclid king of Sardis, so convinced of his wife’s beauty that he made his bodyguard look at her naked — and was killed for it. The Greeks call him Myrsilus.','Candaules|Myrsilus|Myrsilos','major'),
('gyges','Gyges','Candaules’s favourite spearman, forced by the queen to choose between dying and killing his king. He took the kingdom, and the Delphic oracle confirmed it — adding that the Heraclids would be avenged in the fifth generation.','Gyges','major'),
('ardys','Ardys','Gyges’s son and successor, who took Priene and attacked Miletus, and in whose reign the Cimmerians took Sardis.','Ardys','supporting'),
('sadyattes','Sadyattes','Ardys’s son, who began the long war against Miletus.','Sadyattes','supporting'),
('alyattes','Alyattes','Croesus’s father, who inherited the Milesian war, burnt the temple of Athena of Assesos by accident, fell ill, and made peace on the oracle’s terms.','Alyattes','major'),
('atys-son-of-croesus','Atys','Croesus’s able son, whom Croesus dreamed would die by an iron point — and who died on a boar hunt, by the spear of the guest he had been given as a guard.','','major'),
('atys-son-of-manes','Atys','The ancient king from whose son Lydus the Lydian people took their name — a different man from Croesus’s son, five hundred years earlier.','','reference'),
('pantaleon','Pantaleon','Croesus’s half-brother by a different mother, whom one faction tried to make king; Croesus had the man who tried it dragged over a carding-comb.','Pantaleon','reference'),
('heraclids','The Heraclids','The line descended from Heracles that ruled Sardis for twenty-two generations before Gyges.','Heraclids|Heracleidai','reference','group'),
('mermnadae','The Mermnadae','The family of Gyges and Croesus, which took the Lydian throne from the Heraclids.','Mermnadae|Mermnadai','reference','group'),
('alcaeus','Alcaeus','Son of Heracles, and the ancestor the Heraclid kings of Sardis traced themselves to.','Alcaeus|Alcaios','reference','mythological-figure'),
('agron','Agron','Son of Ninus, the first of the Heraclids to become king of Sardis.','Agron','reference'),
('ninus','Ninus','Agron’s father, in the Heraclid genealogy.','','reference'),
('belus','Belus','Ninus’s father in the same genealogy; the older translation spells him Belos.','Belus|Belos','reference'),
('myrsus','Myrsus','Candaules’s father.','Myrsus|Myrsos','reference'),
('lydus','Lydus','Son of Atys, from whom the Lydians took their name; they had been called Meonians.','Lydus|Lydos','reference'),
('adrastus','Adrastus','A Phrygian prince who had killed his own brother by accident, was purified by Croesus, was given charge of Croesus’s son, killed him by accident too, and cut his own throat on the grave.','','major'),
('hyroeades','Hyroeades','The Mardian soldier who watched a Lydian climb down the unguarded cliff after a fallen helmet, and so found the way into Sardis.','Hyroeades|Hyroiades','supporting'),
('pactyas','Pactyas','The Lydian left in charge of Croesus’s gold, who used it to raise a revolt against Cyrus and then fled from city to city until the Chians sold him for a stretch of land.','Pactyas','major'),
]:add(*row)

# ------------------------------------------------------- the Medes and the Persians
for row in [
('cyrus','Cyrus','Cyrus the Great: the grandson Astyages tried to have killed, raised by a herdsman, who overthrew the Medes, took Sardis and Babylon, and died fighting Tomyris beyond the Araxes.','Cyrus','central'),
('astyages','Astyages','The last king of the Medes, who dreamed twice about his daughter, ordered his grandson killed, served Harpagos his own son at dinner, and lost his kingdom to the grandson who survived.','Astyages','major'),
('harpagos','Harpagos','Astyages’s kinsman, ordered to expose the infant Cyrus and unable to do it. Astyages fed him his own son for it; Harpagos waited years and then handed Astyages’s army to Cyrus. He afterwards conquered Ionia for Persia. The two editions spell him Harpagos and Harpagus.','Harpagos|Harpagus','major'),
('deioces','Deioces','The Mede who made himself indispensable as a judge, was elected king, built Agbatana with its seven coloured walls, and made himself invisible to his subjects on purpose.','Deioces|Deïokes','major'),
('phraortes','Phraortes','Deioces’s son, who subdued the Persians and died attacking the Assyrians of Nineveh.','Phraortes','supporting'),
('cyaxares','Cyaxares','Phraortes’s son, who first organised the Median army into companies, besieged Nineveh, and was interrupted by the Scythians for twenty-eight years.','Cyaxares|Kyaxares','major'),
('mandane','Mandane','Astyages’s daughter and Cyrus’s mother, married off to a quiet Persian because of what her father dreamed about her.','Mandane','supporting'),
('cambyses-i','Cambyses','Cyrus’s father — a Persian of good family whom Astyages judged harmless. Not the Cambyses who succeeds Cyrus.','','supporting'),
('cambyses-ii','Cambyses','Cyrus’s son, to whom Cyrus handed Croesus and the kingdom before riding against the Massagetai. Book 3 is largely his.','','major'),
('mitradates','Mitradates','The herdsman ordered to expose the infant Cyrus, whose own newborn son had just died; his wife asked for the living child instead.','Mitradates','supporting'),
('kyno','Kyno','The herdsman’s wife, called Spako in Median and Kyno in Greek — both meaning "dog", which is how the story of the infant Cyrus being suckled by a bitch got started.','Kyno|Spako','supporting'),
('artembares-mede','Artembares','The Mede whose son was whipped by the boy Cyrus playing at being king — the complaint that made Astyages look at the boy’s face.','','supporting'),
('mazares','Mazares','The Mede sent to put down Pactyas and reduce the Ionians; he died in the middle of it.','Mazares','supporting'),
('tabalos','Tabalos','The Persian left as governor of Sardis, besieged in the acropolis by Pactyas.','Tabalos','reference'),
('darius','Darius','Darius son of Hystaspes, later king of Persia, who appears in Book 1 only as the young man in Cyrus’s dream and as the future plunderer of a Babylonian statue. The two editions spell him Darius and Dareios.','Darius|Dareios','major'),
('hystaspes','Hystaspes','Darius’s father, a Persian in Cyrus’s army whom Cyrus sent home to watch his son after the dream.','Hystaspes','supporting'),
('tomyris','Tomyris','Queen of the Massagetai, who refused Cyrus’s offer of marriage, warned him to keep to his own country, lost her son to his trick with the wine, and put his head in a skin of blood so that he could drink his fill.','Tomyris','major'),
('spargapises','Spargapises','Tomyris’s son, taken by Cyrus’s stratagem with the feast and the unmixed wine, who asked to be unbound and killed himself.','Spargapises','supporting'),
('labynetus','Labynetus','The king of Babylon, named twice — as one of the two mediators of the peace between Lydia and Media, and as the ruler Cyrus’s canals were dug against.','Labynetus|Labynetos','supporting'),
('syennesis','Syennesis','The Cilician, who with Labynetus mediated the peace between Alyattes and Cyaxares.','Syennesis','reference'),
('magians','The Magians','One of the Median tribes, and the caste that reads dreams and portents and performs the Persian sacrifices; their reading of Astyages’s dream is what sets the whole story going.','','supporting','group'),
('chaldeans','The Chaldeans','The priests of Bel at Babylon, who told Herodotus what stood in the temple and what had been taken from it.','Chaldeans','reference','group'),
]:add(*row)

# --------------------------------------------------------------- the Greek world
for row in [
('solon','Solon','The Athenian lawgiver, who left Athens for ten years so that his laws could not be unmade, came to Sardis, and refused to call Croesus happy while he was still alive.','Solon','major'),
('tellus','Tellus','The Athenian Solon names as the happiest of men: he lived well, saw his children’s children, and died fighting at Eleusis and was buried where he fell.','Tellus|Tellos','supporting'),
('cleobis','Cleobis','One of two Argive brothers who pulled their mother’s ox-cart to the temple of Hera; she prayed for the best thing a man can have, and they died in their sleep.','Cleobis','supporting'),
('biton','Biton','Cleobis’s brother, named with him as second happiest.','Biton','supporting'),
('peisistratus','Peisistratus','Tyrant of Athens three times over: once by wounding himself and getting a bodyguard, once with a tall woman dressed as Athena riding into the city beside him, and once by force and mercenaries.','Peisistratus|Peisistratos','major'),
('megacles','Megacles','Son of Alcmaeon and leader of the faction of the shore, who brought Peisistratus back to Athens by marrying him to his daughter, and drove him out again when the marriage displeased him.','Megacles','supporting'),
('lycurgus-athenian','Lycurgus','Son of Aristolaides and leader of the faction of the plain — the Athenian rival of Megacles and Peisistratus, not the Spartan lawgiver of the next few pages.','','supporting'),
('alcmaeon','Alcmaeon','Megacles’s father, named in the Athenian faction fighting.','Alcmaeon|Alcmaion','reference'),
('hippocrates','Hippocrates','Peisistratus’s father.','Hippocrates','reference'),
('lygdamis','Lygdamis','The Naxian who gave Peisistratus money and men for his third return, and was set up as tyrant of Naxos for it.','Lygdamis','supporting'),
('lycurgus-spartan','Lycurgus','The lawgiver who gave Sparta its whole constitution — brought from Crete, or given by the Pythia, depending on who is telling it — and turned the worst-governed Greeks into the best.','','major'),
('leon','Leon','A king of Sparta in the generation before Anaxandrides, under whom the Spartans beat everyone except Tegea.','','reference'),
('hegesicles','Hegesicles','Leon’s fellow-king at Sparta.','Hegesicles','reference'),
('anaxandrides','Anaxandrides','King of Sparta at the time of Croesus’s embassy.','Anaxandrides','supporting'),
('ariston-spartan','Ariston','Anaxandrides’s fellow-king at Sparta when Croesus sent for an alliance.','','supporting'),
('lichas','Lichas','One of the Spartan "Well-doers", who found the bones of Orestes under a blacksmith’s forge at Tegea by taking the smith’s talk about a seven-foot coffin literally.','Lichas','supporting'),
('orestes','Orestes','Son of Agamemnon, whose bones the oracle told Sparta to fetch home from Tegea before they could beat the Tegeans.','Orestes','supporting','mythological-figure'),
('agamemnon','Agamemnon','Orestes’s father, named in the oracle.','Agamemnon','reference','mythological-figure'),
('othryades','Othryades','The one Spartan left standing after the Battle of the Champions at Thyrea, who stripped the Argive dead and stayed on the field — and afterwards killed himself for shame at outliving his three hundred.','Othryades','supporting'),
('chilon','Chilon','The Spartan sage who warned Hippocrates, after the cauldron boiled over without a fire, not to have a son.','Chilon','supporting'),
('periander','Periander','Tyrant of Corinth, son of Cypselus, who tortured the crew that had thrown Arion overboard, and who took his lesson in government from Thrasybulus’s walk through a cornfield.','Periander','supporting'),
('cypselus','Cypselus','Periander’s father and tyrant of Corinth before him; the treasury at Delphi that bears the Corinthian name is really his.','Cypselus|Kypselos','reference'),
('thrasybulus','Thrasybulus','Tyrant of Miletus and Periander’s guest-friend, who got wind of Alyattes’s intentions and had the city’s last grain heaped in the marketplace for the herald to see.','Thrasybulus|Thrasybulos','supporting'),
('arion','Arion','The lyre-player of Methymna, robbed by his own crew, who asked to sing once more in full costume, jumped overboard, and was carried to Taenarum on a dolphin’s back.','Arion','supporting'),
('thales','Thales','Thales of Miletus, who foretold the year of the eclipse that stopped the battle between the Medes and the Lydians, and who is said to have diverted the Halys so Croesus could cross.','Thales','supporting'),
('bias','Bias','Bias of Priene, who talked Croesus out of building a fleet by telling him the islanders were buying horses — and who advised the Ionians, too late, to sail away and found one city in Sardinia.','','supporting'),
('pittacus','Pittacus','Pittacus of Mytilene, named as the other candidate for the sage who gave Croesus the advice about the islanders and their horses.','Pittacus|Pittacos','reference'),
('aristodicos','Aristodicos','The man of Kyme who, told by the oracle to give up the suppliant Pactyas, walked round the temple pulling nests down from the eaves until the god objected — and then asked the god the obvious question.','Aristodicos','supporting'),
('arganthonios','Arganthonios','King of Tartessos, who reigned eighty years and lived a hundred and twenty, and offered the Phocaeans his whole country to settle in.','Arganthonios','supporting'),
('amasis','Amasis','King of Egypt, named in Book 1 as one of Croesus’s allies and as the man Solon visited.','Amasis','supporting'),
('minos','Minos','Son of Europa, who ruled the sea in the old time and whose subjects the Carians were before they came to the mainland.','Minos','supporting','mythological-figure'),
('sarpedon','Sarpedon','Minos’s brother, driven out of Crete, who led the Termilai into the land that became Lycia.','Sarpedon','reference','mythological-figure'),
('lycos','Lycos','Son of Pandion, exiled from Athens by his brother Aegeus, from whom the Lycians took their name.','Lycos','reference','mythological-figure'),
('pandion','Pandion','Lycos’s father.','Pandion','reference','mythological-figure'),
('europa','Europa','The king’s daughter carried off from Tyre — the second of the four abductions with which Herodotus opens the quarrel between Europe and Asia.','Europa','supporting','mythological-figure'),
('io','Io','Daughter of Inachus, carried off from Argos by Phoenician traders — the first abduction, and the beginning of the whole business.','Io','supporting','mythological-figure'),
('inachus','Inachus','Io’s father, king of Argos.','Inachus|Inachos','reference','mythological-figure'),
('medea','Medea','The king of Colchis’s daughter, carried off by Greeks in a warship up the Phasis — the third abduction.','Medea','supporting','mythological-figure'),
('helen','Helen','Carried off by Alexander, which the Persians say was the fourth abduction and the one the Greeks made a war of, for a single woman.','Helen','supporting','mythological-figure'),
('alexander-paris','Alexander','The son of Priam — Paris — who carried off Helen because earlier abductions had gone unpunished. Not the Alexander who rules Macedon later in the Histories.','','major','mythological-figure'),
('priam','Priam','Alexander’s father, king of Troy.','Priam','reference','mythological-figure'),
('midas','Midas','King of Phrygia, son of Gordias, the only barbarian before Gyges to dedicate offerings at Delphi — his throne.','Midas','reference'),
('gordias','Gordias','Midas’s father, and also the father of the Adrastus who killed Croesus’s son.','Gordias','reference'),
('amphiaraus','Amphiaraus','The seer whose oracle Croesus tested along with the others, and to whose shrine he sent a shield and spear of solid gold. The two editions spell him Amphiaraus and Amphiaraos.','Amphiaraus|Amphiaraos','supporting','mythological-figure'),
]:add(*row)

# ----------------------------------------------------------------------- the gods
for row in [
('zeus','Zeus','Invoked in Book 1 as the Purifier, the Protector of Suppliants and the Guardian of Friendship, all three by Adrastus over the body of Croesus’s son.','Zeus','supporting','deity'),
('apollo','Apollo','The god of Delphi, called Loxias where he speaks in oracles and Ismenian where Croesus sends him a tripod at Thebes. He gave Croesus three years’ grace and could not do more.','Apollo|Loxias','major','deity'),
('the-pythia','The Pythian prophetess','The priestess through whom Apollo answers at Delphi — who told Gyges the Heraclids would be avenged, told Croesus he would destroy a great empire, and told Sparta to fetch the bones of Orestes.','Pythian','major','religious-figure'),
('athena','Athena','Athena of Assesos, whose temple Alyattes burnt by accident and had to rebuild twice before he could be cured.','Athena|Athene','supporting','deity'),
('hera','Hera','At whose Argive festival Cleobis and Biton pulled the cart, and whose priestess prayed for the best thing a man can have.','Hera','supporting','deity'),
('aphrodite','Aphrodite','Worshipped as Aphrodite Urania, whose temple at Ascalon the Scythians plundered and were punished with a lasting disease; the Assyrians call her Mylitta.','Aphrodite|Urania|Mylitta','supporting','deity'),
('heracles','Heracles','Ancestor, through Alcaeus, of the old kings of Sardis.','Heracles','reference','deity'),
]:add(*row)

# --------------------------------------------------------------- the named peoples
for row in [
('persians','The Persians','Herodotus’s subject: the people whose learned men give him his opening account of the quarrel, and who under Cyrus go from subjects of the Medes to masters of Asia.','Persians|Persian','central','group'),
('lydians','The Lydians','Croesus’s people, the first to strike coin and to keep retail shops, and the first barbarians the Greeks paid tribute to.','Lydians|Lydian','major','group'),
('medes','The Medes','The empire Cyrus overthrew, first to revolt from Assyria and first to be organised into a kingdom.','Medes|Mede|Median','major','group'),
('ionians','The Ionians','The twelve cities on the Asian coast that Croesus subdued and Cyrus took, and whose refusal to help Cyrus first cost them their liberty.','Ionians|Ionian','major','group'),
('aeolians','The Aeolians','The Greeks of the coast north of Ionia, subdued with them. The two editions spell them Aeolians and Aiolians.','Aeolians|Aeolian|Aiolians','supporting','group'),
('dorians','The Dorians','The third of the three Greek divisions, of whom the five cities of the Triopian temple are the Asian branch.','Dorians|Dorian','supporting','group'),
('hellenes','The Hellenes','Herodotus’s word for the Greeks as one people, set against the barbarians from the first sentence of the work.','Hellenes|Hellenic|Greeks|Greek|Hellas','central','group'),
('athenians','The Athenians','Of Pelasgian stock and never moved from their land; under Peisistratus in Croesus’s day, and the people Croesus judged the first among the Ionians.','Athenians|Athenian|Attic','major','group'),
('lacedaemonians','The Lacedaemonians','The Spartans, whom Croesus chose as allies because they were the first of the Dorians — worst-governed of the Greeks once, and best-governed since Lycurgus.','Lacedaemonians|Lacedemonians|Lacedaemonian|Spartans|Spartan','major','group'),
('scythians','The Scythians','The nomads who drove the Cimmerians out of their homes, followed them into Asia, and held the upper country for twenty-eight years before the Medes got them drunk and killed them.','Scythians|Scythian','major','group'),
('cimmerians','The Cimmerians','Driven from their own land by the Scythians, they took Sardis in the reign of Ardys — all of it but the citadel.','Cimmerians|Cimmerian|Kimmerians','supporting','group'),
('massagetai','The Massagetai','Tomyris’s people, beyond the Araxes: a great and warlike nation who share their wives, eat their old, and killed Cyrus.','Massagetai|Massagetae','major','group'),
('babylonians','The Babylonians','The people of the greatest city Herodotus knows, taken by Cyrus when he drew off the Euphrates and walked in along the riverbed while they were at a festival.','Babylonians|Babylonian','supporting','group'),
('assyrians','The Assyrians','Rulers of Upper Asia for five hundred and twenty years before the Medes revolted.','Assyrians|Assyrian','supporting','group'),
('phoenicians','The Phoenicians','The traders who, in the Persian account, began the whole quarrel by carrying off Io from Argos.','Phoenicians|Phoenician|Phenicians|Phenician','supporting','group'),
('egyptians','The Egyptians','Croesus’s allies through Amasis, and a people Herodotus will spend his entire second book on.','Egyptians|Egyptian','supporting','group'),
('milesians','The Milesians','Of Miletus: at war with Lydia for eleven years, then the only Ionians to make terms with Cyrus on the old footing.','Milesians|Milesian','supporting','group'),
('samians','The Samians','Who seized the great bronze bowl the Lacedaemonians were sending to Croesus — or bought it from the men who did, depending on which side is telling it.','Samians','supporting','group'),
('chians','The Chians','Who alone helped the Milesians in the Lydian war, and who afterwards dragged Pactyas out of the temple of Athena and handed him over for a piece of land.','Chians','supporting','group'),
('phocaeans','The Phocaeans','The first Greeks to make long sea voyages, who sailed away from Ionia rather than submit, sank half their own fleet’s worth of enemies off Corsica, and dropped an iron bar in the sea to swear by. The two editions spell them Phocaeans and Phocaians.','Phocaeans|Phocaians','supporting','group'),
('carians','The Carians','Once islanders and subjects of Minos, called Leleges then; they claim to be native to the mainland, and gave the Greeks the crest, the shield-grip and the blazon.','Carians|Carian','supporting','group'),
('caunians','The Caunians','Neighbours of the Carians who say they came from Crete, and who once drove out foreign gods by beating the air with their spears as far as the border.','Caunians|Caunian','reference','group'),
('lycians','The Lycians','Sarpedon’s people, the Termilai renamed after Lycos; they reckon descent by the mother, and burnt their own women and treasure before dying on Harpagos’s swords. The two editions spell them Lycians and Lykians.','Lycians|Lykians','supporting','group'),
('pedasians','The Pedasians','The only people of the Halicarnassus region who gave Harpagos trouble; their priestess of Athena grows a beard when disaster is coming.','Pedasians','reference','group'),
('pelasgians','The Pelasgians','The people the Greeks were before they were Greeks — whose language Herodotus cannot determine except by what their descendants still speak.','Pelasgians|Pelasgian','supporting','group'),
('argives','The Argives','Cleobis and Biton’s people, and the losers of the Battle of the Champions at Thyrea.','Argives|Argive','supporting','group'),
('corinthians','The Corinthians','In whose treasury at Delphi Gyges’s gold stands — though it belongs properly to Cypselus — and who tell the story of Arion.','Corinthians|Corinthian','supporting','group'),
('lesbians','The Lesbians','Who agree with the Corinthians about Arion and the dolphin.','Lesbians','reference','group'),
('tegeans','The Tegeans','The Arcadians who beat Sparta and made the prisoners work their own fields in the fetters they had brought, until the bones of Orestes changed the war.','Tegeans','supporting','group'),
('arcadians','The Arcadians','Acorn-eaters, whose land the Spartans asked the oracle for and did not get.','Arcadians','reference','group'),
('delphians','The Delphians','Keepers of the oracle, who tell Herodotus which offerings are whose and gave the Lydians precedence in consulting the god.','Delphians','supporting','group'),
('cretans','The Cretans','Whom Herodotus supposes to have been the crew that carried off Europa.','Cretans','reference','group'),
('phrygians','The Phrygians','Adrastus’s people, and one of the nations inside the Halys that Croesus ruled.','Phrygians|Phrygian','reference','group'),
('mysians','The Mysians','Of Mysian Olympus, whose boar ruined the fields and cost Croesus his son.','Mysians|Mysian','supporting','group'),
('paphlagonians','The Paphlagonians','One of the peoples inside the Halys ruled by Croesus.','Paphlagonians','reference','group'),
('thracians','The Thracians','The Thynian and Bithynian Thracians of Asia, among Croesus’s subjects.','Thracians','reference','group'),
('syrians','The Syrians','The people on the Cappadocian side of the Halys, whom the Greeks call Cappadocians.','Syrians|Syrian','reference','group'),
('armenians','The Armenians','From whose mountains the Halys and the Tigris come down.','Armenians','reference','group'),
('matienians','The Matienians','From whose mountains the Gyndes rises — the river Cyrus punished by splitting it into three hundred and sixty channels.','Matienians','reference','group'),
('arabians','The Arabians','Who call Aphrodite Alilat, and from whom, with the Assyrians, the Persians learned to worship her.','Arabians','reference','group'),
('achaeans','The Achaeans','Who drove the Ionians out of the Peloponnese, and whose twelve districts the Ionians copied.','Achaeans|Achaians','reference','group'),
('tyrsenians','The Tyrsenians','The Etruscans, said by the Lydians to be their own emigrants, sent out under Tyrsenus when the famine had lasted eighteen years.','Tyrsenians|Tyrsenian','supporting','group'),
('carthaginians','The Carthaginians','Who joined the Etruscans against the Phocaean settlers on Corsica.','Carthaginians','reference','group'),
('tartessians','The Tartessians','Arganthonios’s people, beyond the Pillars, with whom the Phocaeans became friends.','Tartessians','reference','group'),
('ephesians','The Ephesians','The first Greeks Croesus attacked, who ran a rope from their walls to the temple of Artemis and dedicated the city to her.','Ephesians','reference','group'),
('smyrnaeans','The Smyrnaeans','Who took in the exiles from Colophon and lost their city to them at a festival outside the walls. The older translation says only “the men of Smyrna”.','Smyrnaeans','reference','group'),
('cymeans','The Cymeans','Of Kyme, who would neither give up the suppliant Pactyas nor keep him, and sent him to Mytilene instead. The older translation calls them only “the men of Kyme”.','Cymeans','reference','group'),
('telmessians','The Telmessians','The interpreters of portents whom Croesus consulted about the snakes in the suburb of Sardis, and whose answer came too late.','Telmessians','reference','group'),
('leleges','The Leleges','The name the Carians went by while they were islanders and subjects of Minos.','Leleges','reference','group'),
]:add(*row)

# ================================================ BOOK 2 — EUTERPE (216-397)
# ------------------------------------------------------------ the kings of Egypt
for row in [
('min','Min','The first man to be king of Egypt, who dammed the Nile away from Memphis and founded the city on the reclaimed ground. The older translation spells him Men.','Min|Men','supporting'),
('nitocris','Nitocris','The one queen in the priests’ list of three hundred and thirty kings, who avenged her murdered brother by drowning his killers at a feast and then threw herself into a room full of ashes.','Nitocris','supporting'),
('moeris-king','Moeris','The king before whose reign the Nile needed only eight cubits to flood Egypt, and whose name the great lake carries. The two editions spell the lake Moeris and Moiris.','','supporting'),
('sesostris','Sesostris','The conqueror who set out with a fleet from the Arabian gulf, marched through Asia into Europe, and left carved pillars behind him — with a woman’s parts cut on them where the people gave in without a fight.','Sesostris','major'),
('pheros','Pheros','Sesostris’s son, blinded for throwing a spear into the flooding Nile, and cured after ten years by a remedy that cost the lives of a great many women.','Pheros','supporting'),
('proteus-egypt','Proteus','The king of Memphis who held Helen and the stolen treasure in Egypt for the whole length of the Trojan war, and sent Alexander away — the story Herodotus believes over Homer’s.','Proteus','major'),
('thonis','Thonis','The warden of the Canobic mouth who arrested Alexander’s servants and reported him to Proteus.','Thonis','supporting'),
('rhampsinitos','Rhampsinitos','The rich king whose treasury a mason’s two sons robbed through a movable stone — the best story in Book 2 — and who ended by marrying his daughter to the thief.','Rhampsinitos','major'),
('cheops','Cheops','The king who shut the temples, set the whole people to work on his pyramid for twenty years, and sold his own daughter’s favours to pay for it.','Cheops','major'),
('chephren','Chephren','Cheops’s brother and successor, who ruled in the same manner for fifty-six years; the Egyptians will not willingly say either brother’s name.','Chephren','supporting'),
('mykerinos','Mykerinos','Cheops’s son, who opened the temples again and gave the people back their lives — and was told by the oracle that he had six years to live because Egypt was meant to suffer a hundred and fifty. He answered by lighting lamps and living the nights as well.','Mykerinos','major'),
('asychis','Asychis','The king who made a law that a man might borrow on his father’s corpse, and built a pyramid of brick with an inscription telling it not to compare itself with the stone ones.','Asychis','supporting'),
('anysis','Anysis','The blind king of the city of the same name, who fled into the marshes when the Ethiopians came and hid there fifty years on a floating island of ash and earth.','Anysis','supporting'),
('sabacos','Sabacos','The Ethiopian who ruled Egypt for fifty years without putting anyone to death, and left because of a dream rather than wait for it to come true.','Sabacos','supporting'),
('sethos','Sethos','The priest of Hephaistos who despised the warrior class and was saved from Sennacherib by field-mice that ate the Assyrians’ bowstrings overnight.','Sethos','supporting'),
('psammetichos','Psammetichos','One of the twelve kings, driven out and returned with the bronze men the oracle promised; he reunited Egypt, opened it to Greek traders, and shut two children away with a mute shepherd to find out which language came first. The two editions spell him Psammetichos and Psammetichus.','Psammetichos|Psammetichus','major'),
('necos','Necos','Psammetichos’s son, who began the canal to the Red Sea, gave it up when the oracle warned him, and sent Phoenicians to sail round Libya. The older translation spells him Necos; he is also the father Sabacos killed.','Necos','major'),
('psammis','Psammis','Necos’s son, who reigned six years, invaded Ethiopia, and gave the Eleians the obvious answer about their own games.','Psammis','supporting'),
('apries','Apries','Psammis’s son, the most prosperous king but one until his army went over to Amasis; he was kept alive in his own palace and then handed to the Egyptians, who strangled him.','Apries','major'),
('patarbemis','Patarbemis','The man of reputation Apries sent to fetch Amasis back, and whose ears and nose Apries cut off when he came back without him — which lost Apries the rest of his subjects.','Patarbemis','supporting'),
('ladice','Ladice','The Cyrenaean woman Amasis married, who prayed to Aphrodite when he could not come to her and afterwards sent the goddess a statue.','Ladice|Ladike','supporting'),
('amyrtaios','Amyrtaios','The only man in seven hundred years to find the floating island in the marshes where Anysis had hidden.','Amyrtaios','reference'),
('rhodopis','Rhodopis','The Thracian courtesan the Greeks credit with the third pyramid — wrongly, Herodotus says, since she lived generations later. She spent a tenth of her fortune on iron roasting-spits at Delphi.','Rhodopis','supporting'),
('iadmon','Iadmon','The Samian who owned Rhodopis, and Aesop before her.','Iadmon','reference'),
('aesop','Aesop','The fable-maker, named here as Rhodopis’s fellow-slave, for whose killing the Delphians had to pay compensation.','Aesop|Esop','reference'),
('charaxos','Charaxos','The man of Mytilene who bought Rhodopis’s freedom at great expense, and was mocked for it in his sister’s poetry.','Charaxos','supporting'),
('sappho','Sappho','Charaxos’s sister, named as the lyric poet who made a song about what her brother had spent his money on.','Sappho','reference'),
('etearchus','Etearchus','King of the Ammonians, who told the Nasamonians’ story of the five young men who crossed the desert and came to a city of small black men beside a river full of crocodiles.','','supporting'),
('archander','Archander','Son-in-law of Danaus, after whom a city in the Delta is named; Herodotus doubts the name is Egyptian at all.','Archander','reference'),
('hecataeus','Hecataeus','The historian who traced his own descent to a god in the sixteenth generation, and was shown three hundred and forty-five wooden statues at Thebes to correct him.','Hecataeus|Hecataios','supporting'),
]:add(*row)

# ------------------------------------------------------------- the Greek references
for row in [
('menelaus','Menelaus','Helen’s husband, who came to Egypt for her after Troy fell, got her back from Proteus, and repaid the Egyptians by sacrificing two of their children for a wind.','Menelaus|Menelaos','supporting','mythological-figure'),
('hector','Hector','Priam’s elder and abler son, whose existence Herodotus uses as the proof that Troy would have given Helen up if it had had her.','Hector','supporting','mythological-figure'),
('homer','Homer','Whom Herodotus supposes to have invented the river Ocean, to have known the Egyptian version of Helen and set it aside as less suitable for poetry, and to have lived four hundred years before his own day.','Homer','major','literary-figure'),
('hesiod','Hesiod','Named with Homer as the pair who made the Greeks their theogony, gave the gods their titles and described their forms.','Hesiod','supporting','literary-figure'),
('perseus','Perseus','Whose watchtower stands on the Egyptian coast and whose sandal turns up at Chemmis; the people there say he was theirs, being descended from Danaus.','Perseus','supporting','mythological-figure'),
('danaus','Danaus','Of Chemmis, from whom the people there trace Perseus; his daughters brought the rite of the Thesmophoria out of Egypt. The two editions spell him Danaus and Danaos.','Danaus|Danaos','supporting','mythological-figure'),
('lynceus','Lynceus','Named with Danaus as a man of Chemmis who sailed to Greece.','Lynceus|Lynkeus','reference','mythological-figure'),
('amphitryon','Amphitryon','Heracles’s mortal father — of Egyptian descent, the Egyptians say, which is why the Greeks are wrong about which Heracles is older.','Amphitryon','reference','mythological-figure'),
('alcmene','Alcmene','Heracles’s mother, named with Amphitryon in the same argument.','Alcmene','reference','mythological-figure'),
('melampus','Melampus','Son of Amytheon, who Herodotus thinks brought the rite of Dionysus into Greece from Egypt, having learned it from Cadmus and the Phoenicians.','Melampus','supporting','mythological-figure'),
('amytheon','Amytheon','Melampus’s father.','Amytheon','reference','mythological-figure'),
('cadmus','Cadmus','The Phoenician from whom Melampus is supposed to have learned the Egyptian rites. The two editions spell him Cadmus and Cadmos.','Cadmus|Cadmos','supporting','mythological-figure'),
('semele','Semele','Cadmus’s daughter, the mother of the Greek Dionysus — sixteen hundred years after the Egyptian one, on Herodotus’s reckoning.','Semele','reference','mythological-figure'),
('penelope','Penelope','Of whom the Greeks say Pan was born, and Hermes — eight hundred years after the Egyptian Pan.','Penelope','reference','mythological-figure'),
('linus','Linus','The song the Egyptians call Maneros, sung in Phoenicia and Cyprus under other names, and the one song the Egyptians have.','Linus|Linos','reference','mythological-figure'),
('danae','Danae','Perseus’s mother, named in the Chemmite genealogy.','Danae','reference','mythological-figure'),
]:add(*row)

# ------------------------------------------------------------- the gods of Egypt
for row in [
('hephaestus','Hephaestus','The god the Greeks call Hephaestus and the Egyptians Ptah, whose priests at Memphis are Herodotus’s main informants; his temple is the one every king adds to. The two editions spell him Hephaestus and Hephaistos.','Hephaestus|Hephaistos','major','deity'),
('isis','Isis','Whose figure is a woman with cow’s horns, and who is Demeter in Greek. Cows are sacred to her and are never sacrificed.','Isis','major','deity'),
('osiris','Osiris','Isis’s fellow — Dionysus in Greek — whose sufferings are represented at Saïs on the night the Egyptians call the Lamps.','Osiris','major','deity'),
('dionysus','Dionysus','Osiris under his Greek name, whose rites Melampus is supposed to have brought to Greece, and who with Demeter rules the world below in the Egyptian account. The two editions spell him Dionysus and Dionysos.','Dionysus|Dionysos','major','deity'),
('demeter','Demeter','Isis under her Greek name, ruler with Dionysus of the world below.','Demeter','supporting','deity'),
('leto','Leto','Honoured at Buto, where the floating island is and where the oracle spoke; in the Egyptian story she was Apollo’s nurse, not his mother.','Leto','supporting','deity'),
('artemis','Artemis','Honoured at Bubastis with the greatest festival in Egypt; in the Egyptian account she is the daughter of Dionysus and Isis.','Artemis','supporting','deity'),
('ares','Ares','Honoured at Papremis, where the festival is a real fight with clubs at the temple gate.','Ares','supporting','deity'),
('pan','Pan','One of the eight oldest gods in the Egyptian reckoning, painted and carved with a goat’s face and a he-goat’s legs; the Mendesians will not sacrifice goats because of him.','Pan','supporting','deity'),
('hermes','Hermes','Whose images the Greeks make as they do because they learned it from the Pelasgians, not from the Egyptians; and whom the Greeks call Pan’s father.','Hermes','supporting','deity'),
('poseidon','Poseidon','A god the Egyptians say they do not know, and who came to the Greeks from the Libyans.','Poseidon','reference','deity'),
('dioscuri','The Dioscuri','Named with Poseidon among the gods the Egyptians say they have never heard of.','Dioscuri|Dioscuroi','reference','deity'),
('ammon','Ammon','The god of the oracle in the Libyan desert, whose name is the Egyptian name for Zeus; his image is a ram, and that is why the Thebans will not sacrifice sheep.','Ammon','supporting','deity'),
('helios','Helios','The Sun, honoured at Heliopolis; the Egyptians say he once rose where he now sets, twice over, within written memory.','Helios','reference','deity'),
('typhon','Typhon','Set under his Greek name, whom Horus deposed to become the last divine king of Egypt.','Typhon','reference','deity'),
]:add(*row)

# ------------------------------------------------------------ peoples of Book 2
for row in [
('ethiopians','The Ethiopians','Egypt’s neighbours up the Nile, whose king Sabacos held Egypt for fifty years, and among whom the Deserters settled beyond Meroe.','Ethiopians|Ethiopian','major','group'),
('libyans','The Libyans','Whose land runs west from Egypt; the Marea and Apis people claimed to be Libyans and not Egyptians so as to eat cow’s flesh, and were told by the oracle that all the Nile waters is Egypt.','Libyans','supporting','group'),
('colchians','The Colchians','Whom Herodotus judges to be Egyptian by descent on three grounds — their skin, their hair, and the fact that they circumcise.','Colchians','supporting','group'),
('nasamonians','The Nasamonians','The Libyan people of the Syrtis whose five adventurous young men crossed the desert and found a city of small dark men by a great river running east; Book 4 calls them the Nasamones and describes their year — inland for the dates, the coast for the summer.','Nasamonians|Nasamones','supporting','group'),
('ammonians','The Ammonians','Etearchus’s people, at the oracle of Ammon; colonists, Herodotus says, from both Egypt and Ethiopia.','Ammonians','reference','group'),
('mendesians','The Mendesians','Who count Pan among the eight oldest gods, keep goats sacred, and have the story about the he-goat that is not to be repeated.','Mendesians','reference','group'),
('samothracians','The Samothracians','Who perform the mysteries of the Cabeiri, learned from the Pelasgians who used to live on the island.','Samothracians|Samothrakians','reference','group'),
('eleians','The Eleians','Who came to Psammis boasting that their arrangement of the Olympic games was the justest in the world, and were told to let strangers compete if they meant it.','Eleians','reference','group'),
('calasirians','The Calasirians','One of the two Egyptian warrior classes, with their own districts and their twelve aruras of tax-free land.','Calasirians','reference','group'),
('hermotybians','The Hermotybians','The other Egyptian warrior class, named with the Calasirians.','Hermotybians','reference','group'),
('celts','The Celts','Beyond the Pillars of Heracles, at whose country the Ister begins.','Celts|Keltoi','reference','group'),
('trojans','The Trojans','Who, Herodotus argues, would have given Helen back if they had had her, since they were losing their lives for her by the day.','Trojans|Teucrian','supporting','group'),
('cilicians','The Cilicians','Named as the people whose land Cilicia is, in the argument about what makes a country.','Cilicians|Kilikians','reference','group'),
]:add(*row)

print(len(entities),'entities after Book 2')


# ================================================== BOOK 3 — THALIA (398-557)
# The book turns on one deception, so the two men at its centre are two entities.
# Herodotus is careful: every literal "Smerdis" in the text is Cyrus’s son. The
# impostor is never given the name in narration — he is always "the Magian" —
# so he is bound on that word, by position, and the caste of the same name is
# bound by position too.
for row in [
('smerdis-son-of-cyrus','Smerdis','Cyrus’s younger son, whom Cambyses had Prexaspes kill in secret after dreaming that he would sit on the throne. Almost nobody in Persia knew he was dead, which is what made the impersonation possible.','Smerdis','major',
 'person',[{'after':[427,0],'body':'Cyrus’s younger son, killed in secret on Cambyses’s orders by Prexaspes — a death so few Persians knew of that a stranger could later take his name.'}]),
('smerdis-the-magian','The Magian','The brother left in charge of Cambyses’s household, who seized the throne because he knew the real Smerdis was dead and that almost nobody else did. He was his namesake, and he reigned seven months and did his subjects good; the Persians killed him when Otanes found out, through his own daughter, that the man in the bed had no ears.','','major',
 'person',[{'after':[464,0],'name':'The Magian','body':'The usurper who reigned as Smerdis for seven months, remitted military service and tribute for three years, and was mourned by every nation in Asia except the Persians.'},{'after':[477,0],'name':'The Magian','body':'The usurper, killed in his own chamber by Darius and Gobryas wrestling in the dark — and commemorated afterwards by the Magophonia, the one day in the year a Magian may not walk out of doors.'}]),
('magian-brothers','The two Magians','The usurper and Patizeithes his brother, who between them held Persia for seven months: one on the throne, the other managing everything for him.','','major','group'),
('patizeithes','Patizeithes','The Magian left as caretaker of Cambyses’s household, who put his brother on the throne and ran the kingdom for him. He is named once.','Patizeithes','supporting'),
]:add(*row)

# ------------------------------------------------------------- Cambyses in Egypt
for row in [
('nitetis','Nitetis','Apries’s daughter, whom Amasis sent to Cambyses in place of his own — and who told Cambyses whose daughter she really was. That, in the Egyptian telling, is why Persia invaded.','Nitetis','supporting'),
('cassandane','Cassandane','Cyrus’s wife and Cambyses’s mother, whom the Persian account says Cambyses avenged on Egypt because Cyrus had slighted her.','Cassandane','supporting'),
('pharnaspes','Pharnaspes','Cassandane’s father, and Otanes’s, of the Achaemenid family.','Pharnaspes','reference'),
('phanes','Phanes','The Halicarnassian mercenary who quarrelled with Apries, fled to Cambyses, and told the Persians how to cross the waterless desert. The Greeks in Egyptian service cut his sons’ throats in front of him before the battle and drank the blood.','Phanes','major'),
('psammenitos','Psammenitos','Amasis’s son, king of Egypt for six months, who did not weep to see his daughter carrying water or his son led out to die, and wept at the sight of an old drinking-companion begging. Cambyses spared him and then killed him for plotting.','Psammenitos','major'),
('prexaspes','Prexaspes','Cambyses’s most trusted Persian, who killed Smerdis for him, told him the truth about what the Persians said of him, watched Cambyses shoot his own son through the heart to prove his hand was steady, and finally threw himself off a tower after telling Persia the truth.','Prexaspes','major'),
('apis','Apis','The sacred calf of Memphis, whom the Greeks call Epaphos: black with a white diamond, a double hair in its tail, the marks of an eagle and a beetle. Cambyses stabbed it in the thigh and it died in the temple, which the Egyptians say is why he went mad.','Apis|Epaphos','major','animal'),
('ichthyophagoi','The Ichthyophagoi','The Fish-eaters of Elephantine, who knew the Ethiopian tongue and were sent ahead of Cambyses’s army as spies with gifts.','Ichthyophagoi','supporting','group'),
('achaimenes','Achaimenes','Darius’s son, killed with his army in Egypt by Inaros the Libyan — Herodotus looking forward out of his own narrative.','Achaimenes|Achaemenes','reference'),
('inaros','Inaros','The Libyan who destroyed Achaimenes and his Persians in Egypt.','Inaros','reference'),
]:add(*row)

# ------------------------------------------------------------------- Samos
for row in [
('polycrates','Polycrates','Tyrant of Samos, who took the island with fifteen men, made himself the first Greek since Minos to aim at ruling the sea, and was crucified at Magnesia by a Persian governor he had never fought. Herodotus will not repeat what was done to his body.','Polycrates','major'),
('aiakes','Aiakes','Polycrates’s father.','Aiakes','reference'),
('syloson','Syloson','Polycrates’s brother, exiled — and the man who gave Darius a red cloak in Egypt for nothing, years before Darius was king, and afterwards asked for Samos and got it.','Syloson','major'),
('pantagnotos','Pantagnotos','Polycrates’s other brother, killed when Polycrates took sole power.','Pantagnotos','reference'),
('maiandrios','Maiandrios','Polycrates’s secretary, left in charge of Samos, who tried to hand the island over to a free constitution and was refused; he ended by opening the treasury to the Persians and escaping through a tunnel.','Maiandrios','major'),
('charilaos','Charilaos','Maiandrios’s half-mad brother, who was let out of the cells, saw the Persians sitting unarmed, took the mercenaries and killed them — and so brought the massacre of Samos on the island.','Charilaos','supporting'),
('archias-samos','Archias','One of the two Lacedaemonians who broke into Samos and died inside it; Herodotus met his grandson, also Archias, at Pitana.','','supporting'),
('archias-grandson','Archias','The grandson of the Archias who died at Samos, whom Herodotus met and who honoured the Samians above all strangers because they had buried his grandfather at public cost.','','supporting'),
('lycopas','Lycopas','The other Lacedaemonian who followed the routed Samians inside the walls and was cut off there with Archias.','Lycopas','supporting'),
('samios','Samios','The son the first Archias named for Samos, and the father of the Archias Herodotus met.','Samios','reference'),
('eupalinos','Eupalinos','The Megarian engineer of the Samian tunnel, seven furlongs through a mountain and open at both ends — the first of the three greatest Greek works Herodotus knows.','Eupalinos','supporting'),
('naustrophos','Naustrophos','Eupalinos’s father.','Naustrophos','reference'),
('oroetes','Oroetes','The Persian governor of Sardis who had Polycrates crucified out of nothing but pique at a slight he had imagined, and murdered Mitrobates and his son as well. Darius had him killed by a letter read out to his own guards.','Oroetes|Oroites','major'),
('mitrobates','Mitrobates','Governor of Daskyleion, who taunted Oroetes at the king’s door with not having taken Samos, and was killed for it with his son.','Mitrobates','supporting'),
('bagaios','Bagaios','The son of Artontes who drew the lot, went to Sardis with a bundle of letters, and had Oroetes’s own bodyguard kill him by reading the last one aloud.','Bagaios','supporting'),
('artontes','Artontes','Bagaios’s father.','Artontes','reference'),
]:add(*row)

# ------------------------------------------------- Corinth, Corcyra and the boys
for row in [
('melissa','Melissa','Periander’s wife, whom he killed, and whose ghost would not name the hiding-place of a deposit until he had burnt real clothes for her in the pit at Corinth.','Melissa','supporting'),
('procles','Procles','Despot of Epidauros and Melissa’s father, who asked his two grandsons whether they knew who had killed their mother — and ruined the younger one.','Procles','supporting'),
('lycophron','Lycophron','Periander’s younger son, who would not speak to his father after his grandfather’s question, was driven to Corcyra, refused the throne on any terms that meant returning, and was killed by the Corcyreans to stop Periander coming.','Lycophron','major'),
('corcyreans','The Corcyreans','Periander’s enemies, who killed his son to keep him out and whose three hundred boys he sent to Sardis to be made eunuchs; the Samians saved them.','Corcyreans|Corcyrean','supporting','group'),
('siphnians','The Siphnians','At the height of their wealth from gold and silver mines, who refused the exiled Samians a loan and lost a hundred talents and their fields for it — as their oracle about the white council-house had warned them.','Siphnians','supporting','group'),
('aeginetans','The Aeginetans','Who with the Cretans defeated the Samian settlers at Kydonia and dedicated the ships’ boar-prows in the temple of Athena on Aegina.','Aeginetans|Eginetans|Eginetan','supporting','group'),
]:add(*row)

# ------------------------------------------------------- the seven, and Darius
for row in [
('otanes','Otanes','Son of Pharnaspes, the first to suspect that the man on the throne was not Smerdis, and the one who proved it through his own daughter. He argued for democracy against the other six, withdrew from the contest for the throne on condition that his house be free, and it still was in Herodotus’s day.','','major'),
('phaidyme','Phaidyme','Otanes’s daughter, married to the king; her father asked her to feel for the ears of the man asleep beside her, knowing Cyrus had cut the Magian’s off. She did it, and there were none.','Phaidyme','major'),
('atossa','Atossa','Cyrus’s daughter, wife of her brother Cambyses, then of the Magian, then of Darius — and the woman who, prompted in bed by a Greek physician, set Darius on Greece.','Atossa','major'),
('intaphrenes','Intaphrenes','One of the seven, whom Otanes brought in; he later forced the palace gates believing the law let him, and Darius destroyed his whole family but for the brother and son his wife chose. The two editions spell him Intaphrenes and Intaphernes.','Intaphrenes|Intaphernes','major'),
('gobryas','Gobryas','One of the seven, who grappled with the Magian in the dark and told Darius to strike through both of them rather than let go.','Gobryas','major'),
('megabyzos','Megabyzos','One of the seven, who argued for oligarchy: nothing is more foolish or more insolent, he said, than a useless crowd.','Megabyzos|Megabyxos','major'),
('aspathines','Aspathines','One of the seven, who brought in Hydarnes.','Aspathines','supporting'),
('hydarnes','Hydarnes','One of the seven, brought in by Aspathines.','Hydarnes','supporting'),
('oibares','Oibares','Darius’s groom, who won him the kingdom before sunrise with a mare, a hand and a horse that neighed first.','Oibares','supporting'),
('parmys','Parmys','Smerdis’s daughter, one of the wives Darius took to fasten the succession to Cyrus’s line.','Parmys','reference'),
('artystone','Artystone','Cyrus’s other daughter, a virgin, whom Darius married with Atossa.','Artystone','reference'),
('zopyros','Zopyros','Megabyzos’s son, to whom a mule foaled; he cut off his own nose and ears, had himself whipped, deserted to Babylon as a mutilated man with a grievance, was given the city’s army, and handed the walls to Darius. Darius said he would rather have one Zopyros unmutilated than twenty Babylons.','Zopyros','major'),
('demokedes','Demokedes','The physician of Croton, sold into Persia as Polycrates’s slave, who cured Darius’s ankle and Atossa’s breast, got everything he asked for except his freedom, and talked his way home by way of a reconnaissance of Greece. The two editions spell him Demokedes and Democedes.','Demokedes|Democedes','major'),
('calliphon','Calliphon','Demokedes’s father, at Croton.','Calliphon','reference'),
('milon','Milon','The wrestler of Croton, whose daughter Demokedes bought himself a betrothal to, in name, because Darius had heard of him.','Milon','reference'),
('aristophilides','Aristophilides','King of the Tarentines, who unshipped the Persian ships’ steering-oars and locked up the crews so that Demokedes could get away to Croton.','Aristophilides','supporting'),
('gillos','Gillos','The Tarentine exile who rescued the stranded Persians and brought them back to the king, and asked in payment only to be restored — which the Cnidians could not manage.','Gillos','supporting'),
('tarentines','The Tarentines','Aristophilides’s people, in Italy.','Tarentines','reference','group'),
('indians','The Indians','The most numerous nation Herodotus knows, whose Callatians eat their dead and who pay their tribute in gold dust.','Indians','major','group'),
('tribute-nations','The tribute nations','Darius’s twenty provinces, named in a roll of some forty peoples — Chorasmians, Sogdians, Bactrians, Caspians, Parthians, Sarangians, Paricanians and the rest — each with its assessment in talents. The list is Herodotus’s proof of what the empire actually was: not a conquest story but an accounts book.','Chorasmians|Sogdians|Bactrians|Caspians|Parthians|Sarangians|Thamanaians|Paricanians|Pausicans|Pantimathoi|Dareitai|Orthocorybantians|Utians|Mycans|Aigloi|Areians','major','group'),
]:add(*row)

print(len(entities),'entities after Book 3')

# ============================================== BOOK 4 — MELPOMENE (558-761)
# Scythia and Libya: the book with the fewest individuals and the most nations.
# Its one hard namesake cluster is the royal house of Cyrene, where the oracle
# itself says there will be "four named Battus and four named Arcesilaus".
for row in [
('targitaos','Targitaos','The first man in the Scythian account of themselves, born of Zeus and a daughter of the Borysthenes; his three sons divided the kingdom by which of them could pick up the golden plough, yoke, axe and cup without being burnt.','Targitaos','major'),
('lipoxais','Lipoxaïs','The eldest of Targitaos’s three sons, from whom the Auchatai are descended.','Lipoxaïs|Lipoxais','supporting'),
('arpoxais','Arpoxaïs','The middle son, from whom the Catiaroi and Traspians come.','Arpoxaïs|Arpoxais','supporting'),
('colaxais','Colaxaïs','The youngest, who alone could take up the burning gold, and from whom the Royal tribe descends.','Colaxaïs|Colaxais','supporting'),
('agathyrsos','Agathyrsos','One of the three sons Heracles begot on the snake-woman in Hylaia, in the Pontic Greeks’ version of the Scythian origin.','Agathyrsos','supporting'),
('gelonos','Gelonos','The second of those three sons.','Gelonos','supporting'),
('skythes','Skythes','The youngest of the three, the only one who could draw the bow and put on the belt, and the ancestor of all the Scythian kings.','Skythes','supporting'),
('aristeas','Aristeas','The poet of Proconnesos who wrote the Arimaspeia, died in a fuller’s shop, was seen the same day on the road to Kyzicos, and turned up again two hundred and forty years later at Metapontion telling them to set up an altar to Apollo.','Aristeas','major'),
('caystrobios','Caÿstrobios','Aristeas’s father.','Caÿstrobios|Caystrobios','reference'),
('anacharsis-scythian','Anacharsis','The one Scythian the Greeks admire, killed by his own king for keeping a Greek festival — Herodotus’s single exception, with Skyles, to the rule that Scythians want nothing Greek.','','major'),
('saulios','Saulios','King of the Scythians, who shot his brother Anacharsis with an arrow for celebrating the rites of the Mother of the Gods.','Saulios','supporting'),
('skyles','Skyles','A Scythian king by a Greek mother, who kept a house at Borysthenes and was initiated into the rites of Bacchus; his own people made his brother king instead and cut off his head.','Skyles','major'),
('ariapeithes','Ariapeithes','Skyles’s father, a Scythian king with a Greek wife from Istria.','Ariapeithes','supporting'),
('tymnes','Tymnes','Ariapeithes’s steward, and one of Herodotus’s named sources for Scythian genealogy.','Tymnes','supporting'),
('idanthyrsos','Idanthyrsos','King of the Scythians in Darius’s invasion, who would not fight, sent back a mouse, a frog, a bird and five arrows, and told Darius to weep when he found the tombs of his fathers.','Idanthyrsos','major'),
('octamasades','Octamasades','Skyles’s brother, made king in his place, who cut off Skyles’s head — and who traded a hostage uncle with Sitalkes rather than fight him.','Octamasades','supporting'),
('sitalkes','Sitalkes','The Thracian king who offered Octamasades his own brother in exchange for the one Octamasades held, so that neither had to give battle.','Sitalkes','supporting'),
('salmoxis','Salmoxis','The divinity of the Getai, whom some of them call Gebeleizis, and whom the Greeks say was a man — a freed slave of Pythagoras who built an underground chamber, disappeared into it for three years, and came back to prove immortality.','Salmoxis|Gebeleizis','major','deity'),
('pythagoras-samos','Pythagoras','Son of Mnesarchos, named as the master whose slave Salmoxis is supposed to have been — a story Herodotus reports and does not believe.','','supporting'),
('mnesarchos','Mnesarchos','Pythagoras’s father.','Mnesarchos','reference'),
('mandrocles','Mandrocles','The Samian who built the bridge of boats across the Bosphorus, was richly rewarded, and spent the money on a painting of the crossing dedicated in the temple of Hera.','Mandrocles','supporting'),
('sataspes','Sataspes','The Achaemenid sent to sail round Libya instead of being impaled, who turned back in fear and was impaled after all; his eunuch ran off to Samos with a great sum.','Sataspes','supporting'),
('teaspis','Teaspis','Sataspes’s father.','Teaspis','reference'),
('megabazos','Megabazos','The Persian Darius left to command in Europe — the man whose praise Darius rated above a pomegranate’s seeds; he subdued the Hellespont and told the Persians the Chalcedonians must have been blind.','Megabazos|Megabazus','major'),
('histiaeus','Histiaeus','Tyrant of Miletus, who talked the Ionians out of breaking Darius’s bridge over the Ister on the argument that their own tyrannies depended on him. The two editions spell him Histiaeus and Histiaios.','Histiaeus|Histiaios','major'),
('amazons','The Amazons','Whom the Scythians call Oiorpata, man-slayers; the ones taken at the Thermodon killed their crews, drifted to the Maeotian lake, and became the Sauromatai by marrying Scythian youths on terms.','Amazons|Oiorpata','major','group'),
('theras','Theras','The Spartan regent who would not be a subject when his nephews came of age, and led the colony to Callista, which took his name — Thera.','Theras','major'),
('autesion','Autesion','Theras’s father.','Autesion','reference'),
('tisamenus','Tisamenus','Autesion’s father, in the descent from Cadmus.','Tisamenus|Tisamenos','reference'),
('membliarus','Membliarus','The Phoenician left on Callista by Cadmus, whose descendants Theras found there eight generations later.','Membliarus|Membliaros','reference'),
('poikiles','Poikiles','Membliarus’s father.','Poikiles|Poikilos','reference'),
('minyae','The Minyae','The children of the Argonauts, driven from Lemnos, who camped on Taÿgetus, were taken in by Sparta, plotted, and were saved by their Spartan wives smuggling them out in their own clothes.','Minyae|Minyai','supporting','group'),
('grinnus','Grinnus','King of Thera, who went to Delphi about something else and was told to found a city in Libya, and answered that he was too old — pointing at Battus.','Grinnus|Grinnos','supporting'),
('aesanius','Aesanius','Grinnus’s father.','Aesanius|Aisanios','reference'),
('etearchus-oaxos','Etearchus','King of Oaxus in Crete, who let his second wife persuade him to swear away his own daughter Phronime — and handed her to a merchant to be drowned. A different man from the Etearchus of the Ammonians in Book 2.','','major'),
('phronime','Phronime','Etearchus’s daughter, sworn away by her father, saved at sea by the Theraean who had contracted to drown her, and the mother of Battus.','Phronime','major'),
('themison','Themison','The Theraean merchant who took the oath to throw Phronime into the sea, kept it to the letter by lowering her over the side and pulling her straight back up, and then kept her.','Themison','supporting'),
('polymnestus','Polymnestus','A Theraean of good family, Phronime’s husband and Battus’s father.','Polymnestus|Polymnestos','supporting'),
('corobius','Corobius','The murex-fisher of Crete who had once been blown to Platea and could pilot the Theraeans there; they left him on the island with rations and forgot him for longer than the rations lasted.','Corobius|Corobios','supporting'),
('battus-i','Battus','The founder of Cyrene, who went to Delphi about his stammer and was told to found a city in Libya instead. He reigned forty years. The older translation spells him Battos throughout.','','major'),
('battus-ii','Battus the Fortunate','The third king of Cyrene, in whose reign the oracle invited all Greeks to come and share out Libyan land.','','supporting'),
('battus-iii','Battus the Lame','Arcesilaus’s son, lame and unsound in his feet, in whose reign Cyrene sent to Delphi for a constitution and got Demonax of Mantineia. Pheretime was his wife.','','major'),
('arcesilaus-i','Arcesilaus','Battus the founder’s son, who reigned sixteen years.','','supporting'),
('arcesilaus-ii','Arcesilaus','Battus the Fortunate’s son, who quarrelled with his brothers until they founded Barca, lost seven thousand hoplites at Leucon, and was strangled by his own brother Haliarchus while sick.','','major'),
('arcesilaus-iii','Arcesilaus','Battus the Lame’s son by Pheretime, who would not keep Demonax’s constitution, was exiled to Samos, came back on a promise of land, burnt his opponents alive in a tower, and was murdered at Barca with his father-in-law.','','major'),
('battiadae','The house of Battus','The royal line of Cyrene. The oracle told Arcesilaus that Loxias granted his family four named Battus and four named Arcesilaus, eight generations, and no more — which is exactly how many there were.','','major','group'),
('haliarchus','Haliarchus','Arcesilaus’s brother, who strangled him while he was sick from a potion, and was himself killed by treachery by Arcesilaus’s wife.','Haliarchus|Haliarchos','supporting'),
('eryxo','Eryxo','Arcesilaus’s wife, who had Haliarchus killed for murdering her husband.','Eryxo','supporting'),
('demonax','Demonax','The most respected man in Mantineia, sent to Cyrene to write it a constitution; he divided the people into three tribes, left the king his estates and priesthoods, and gave everything else to the people.','Demonax','major'),
('pheretime','Pheretime','Battus the Lame’s wife and Arcesilaus’s mother, who sat as a suppliant of one Persian governor after another until she got an army, took Barca, impaled the men on the wall and cut off their wives’ breasts to nail up beside them — and then died eaten by worms.','Pheretime','major'),
('euelthon','Euelthon','Ruler of Salamis in Cyprus, who gave Pheretime every fine gift except the army she kept asking for, and observed that a spindle was a more suitable present for a woman.','Euelthon','supporting'),
('aglomachus','Aglomachus','The private citizen whose tower Arcesilaus’s enemies took refuge in, and which Arcesilaus burnt down around them.','Aglomachus|Aglomachos','reference'),
('alazeir','Alazeir','Arcesilaus’s father-in-law, the ruler of Barca, killed in the marketplace along with him.','Alazeir','supporting'),
('aryandes','Aryandes','The Persian governor of Egypt who gave Pheretime her army, and who was afterwards put to death by Darius for coining silver as pure as the king’s gold.','Aryandes','supporting'),
('jason','Jason','Whose ship, driven to Libya by a gale, is one of the origins Herodotus gives for the lake Tritonis story.','Jason','supporting','mythological-figure'),
('hyperoche','Hyperoche','One of the two Hyperborean maidens who brought the sacred offerings to Delos and died there.','Hyperoche','reference','mythological-figure'),
('laodike','Laodike','The other Hyperborean maiden, buried with Hyperoche on Delos.','Laodike','reference','mythological-figure'),
('arge','Arge','One of two earlier Hyperborean maidens who came to Delos with the gods themselves.','Arge','reference','mythological-figure'),
('opis','Opis','Arge’s companion, named with her in Olen’s hymn.','Opis','reference','mythological-figure'),
('olen','Olen','The Lycian who composed the Delian hymn in which the Hyperborean maidens are named.','Olen','reference','literary-figure'),
]:add(*row)

# ------------------------------------------------- the nations of Scythia and Libya
for row in [
('sauromatai','The Sauromatai','Descended, the story says, from the Amazons and the Scythian youths; their women ride, shoot and hunt, and no woman marries until she has killed an enemy.','Sauromatai|Sauromatae','major','group'),
('budinoi','The Budinoi','A great and numerous nation with grey eyes and red hair, in a country wholly of forest, whose city Gelonos is built of wood.','Budinoi','supporting','group'),
('gelonians','The Gelonians','Greeks by descent who left the trading stations and settled among the Budinoi, speaking half Scythian and half Greek.','Gelonians|Gelonoi','supporting','group'),
('neuroi','The Neuroi','Who left their country because of snakes, and who are said by their neighbours — and by themselves — to become wolves once a year.','Neuroi','supporting','group'),
('androphagoi','The Androphagoi','The man-eaters, the most savage manners of all men, with no law and no justice and a language of their own.','Androphagoi','supporting','group'),
('melanchlainoi','The Melanchlainoi','The Black-cloaks, who wear black and follow Scythian customs without being Scythian.','Melanchlainoi','supporting','group'),
('agathyrsians','The Agathyrsians','A most delicate people, great wearers of gold, who hold their women in common so that they may all be brothers.','Agathyrsians|Agathyrsoi','supporting','group'),
('issedonians','The Issedonians','Beyond the Argippaioi, who eat their dead fathers at a feast and gild the skull to sacrifice at yearly; their women have equal power with the men.','Issedonians','supporting','group'),
('arimaspians','The Arimaspians','The one-eyed men beyond the Issedonians who fight the gold-guarding griffins for it — a story Herodotus repeats from Aristeas and does not vouch for.','Arimaspians','supporting','group'),
('hyperboreans','The Hyperboreans','Beyond the griffins, extending to the sea; they send the sacred offerings wrapped in wheat-straw on from nation to nation until they reach Delos.','Hyperboreans','supporting','group'),
('alazonians','The Alazonians','Above the Callipidai on the Hypanis, who sow and eat grain, onions, leeks, lentils and millet.','Alazonians','reference','group'),
('callipidai','The Callipidai','Greek Scythians on the Hypanis, above the trading station of the Borysthenites.','Callipidai','reference','group'),
('tauroi','The Tauroi','Who sacrifice shipwrecked men and any Greek they catch to the Maiden, and nail the heads up over their houses.','Tauroi','supporting','group'),
('getai','The Getai','The bravest and most law-abiding of the Thracians, who believe they do not die but go to Salmoxis, and who shoot arrows at the sky when it thunders.','Getai','supporting','group'),
('garamantes','The Garamantes','Who flee from every man, own no weapon of war, and hunt the Cave-dwelling Ethiopians in four-horse chariots.','Garamantes|Garamantians|Garmantians','supporting','group'),
('lotus-eaters','The Lotus-eaters','Who live entirely on the fruit of the lotus, about the size of a mastich-berry and as sweet as a date, and make wine of it.','Lotus|Lotophagoi','supporting','group'),
('machlyes','The Machlyes','Who use the lotus too, though less, and who live round Lake Tritonis and hold the yearly festival of Athene where the maidens fight.','Machlyes|Machlyans','supporting','group'),
('auseans','The Auseans','Neighbours of the Machlyes, who have no marriage but couple like cattle, and bring up a child in whichever house the man it resembles lives in.','Auseans','supporting','group'),
('atlanteans','The Atlanteans','Named after their mountain, who are said to eat nothing that has life and never to dream.','Atlanteans|Atlantians','reference','group'),
('gindanes','The Gindanes','Whose women wear an anklet of hide for every man they have lain with, and the one with the most is thought best.','Gindanes','reference','group'),
('asbystae','The Asbystae','Above Cyrene, the greatest drivers of four-horse chariots in Libya.','Asbystae|Asbystai','reference','group'),
('auschisae','The Auschisae','Above Barca, reaching down to the sea at Euesperides.','Auschisae|Auschisai|Auchisai','reference','group'),
('giligamae','The Giligamae','Westward from the Adyrmachidae as far as the island of Aphrodisias, where the silphium begins.','Giligamae|Giligamai','reference','group'),
('adyrmachidae','The Adyrmachidae','The Libyans nearest Egypt, who follow Egyptian customs but dress like the rest, and whose brides are shown first to the king.','Adyrmachidae|Adyrmachidai','reference','group'),
('cyrenaeans','The Cyrenaeans','Battus’s colony and the richest Greek city in Libya, who invited the whole of Greece to come and take a share of land.','Cyrenaeans|Kyrenians','major','group'),
('theraeans','The Theraeans','Theras’s colonists on Callista, who sent Battus to Libya because the oracle would not let them alone, and whose own account of him differs from the Cyrenaean one.','Theraeans|Theraians','major','group'),
('barcaeans','The Barcaeans','The Cyrenaean breakaways who founded Barca, killed Arcesilaus, and were besieged nine months by the Persians and tricked out of the city by a covered pit and an oath sworn over it.','Barcaeans|Barcaians','major','group'),
('delians','The Delians','Who tell more than anyone about the Hyperborean offerings and the graves of the maidens.','Delians','supporting','group'),
('borysthenites','The Borysthenites','The Greeks of the trading station at the Borysthenes, who call themselves Milesians and among whom Skyles kept a house.','Borysthenites','supporting','group'),
('royal-scythians','The Royal Scythians','The bravest and most numerous Scythians, who hold the rest for slaves, and whose kings are buried at Gerros with a strangled concubine, a cup-bearer, a cook and a horse.','Royal','supporting','group'),
('saspeirians','The Saspeirians','Above the Medes, in Herodotus’s reckoning of the four nations that fill Asia northward.','Saspeirians','reference','group'),
('hellespontians','The Hellespontians','Named with the Ionians and Aeolians in the fleet Darius took up the Ister.','Hellespontians','reference','group'),
]:add(*row)

print(len(entities),'entities after Book 4')

# =========================================== BOOK 5 — TERPSICHORE (762-886)
# The Ionian revolt. Two men called Aristagoras, two called Cleisthenes, a third
# Otanes and — at last — the Macedonian Alexander, who has been left unbound
# since section 3 so that Paris could have the name to himself.
for row in [
('alexander-macedon','Alexander','Amyntas’s son, who had the seven Persian envoys killed at his father’s table by beardless men dressed as women, bought off the search with money and his own sister, and afterwards proved himself a Hellene at Olympia. A different man from the Alexander who carried off Helen.','','major'),
('amyntas','Amyntas','King of Macedonia, who gave Darius earth and water and let the envoys insult his women rather than risk the Persians.','Amyntas','major'),
('bubares','Bubares','The Persian to whom Alexander gave his sister Gygaea, and a great deal of money, to stop the inquiry into the missing envoys.','Bubares','supporting'),
('gygaea','Gygaea','Alexander’s sister, married to Bubares as part of the price of silence.','Gygaea|Gygaia','supporting'),
('pigres','Pigres','One of two Paeonian brothers who set out to make themselves despots of Paeonia and showed Darius a woman carrying water, spinning and leading a horse at once — which cost their whole nation its home.','Pigres','supporting'),
('mantyes','Mantyes','Pigres’s brother, in the same scheme.','Mantyes|Mantyas','supporting'),
('artaphrenes','Artaphrenes','Darius’s brother, governor of Sardis, who heard Aristagoras out about Naxos and sent five hundred ships. The two editions spell him Artaphrenes and Artaphernes.','Artaphrenes|Artaphernes','major'),
('otanes-sisamnes','Otanes','Son of Sisamnes, made commander on the coast after Megabazus and given the seat his father was flayed for — he took Byzantion, Chalcedon, Antandros and Lamponion. Not the Otanes of the seven.','','major'),
('sisamnes','Sisamnes','A royal judge who took a bribe; Cambyses cut his throat, flayed him, and had the seat of judgement covered with his skin, then appointed his son to sit in it.','Sisamnes','supporting'),
('aristagoras-miletus','Aristagoras','Son of Molpagoras, deputy tyrant of Miletus, who talked Artaphrenes into the Naxos expedition, lost it, started the Ionian revolt to save himself, was refused by Sparta and promised twenty ships by Athens, and ran away twice — the second time to his death among the Thracians. Herodotus does not admire him.','','central'),
('molpagoras','Molpagoras','Aristagoras’s father.','Molpagoras','reference'),
('aristagoras-cyme','Aristagoras','Son of Heracleides, tyrant of Cyme, deposed with the rest — named once, in the same sentence as the Milesian.','','supporting'),
('heracleides-cyme','Heracleides','Aristagoras of Cyme’s father.','','reference'),
('aristagoras-kyzikos','Aristagoras','Tyrant of Cyzicus, one of the Hellespontine despots in Darius’s fleet at the Ister — named once, in the roll of tyrants, and not the Milesian.','','supporting'),
('coes','Coës','The Mytilenian who advised Darius to leave the bridge over the Ister standing, was given Mytilene for it, and was stoned to death by the Mytilenians when Aristagoras deposed him.','Coës|Coes','supporting'),
('erxander','Erxander','Coës’s father.','Erxander','reference'),
('megabates','Megabates','The Achaemenid cousin of Darius who commanded the Naxos fleet, quarrelled with Aristagoras over a Myndian captain tied head-out through a hawse-hole, and warned the Naxians himself.','Megabates','major'),
('skylax','Skylax','The Myndian captain whom Megabates had bound and pushed through a hole in his own ship, and Aristagoras untied.','Skylax','supporting'),
('cleomenes','Cleomenes','King of Sparta, son of Anaxandrides by the second wife, who sent Aristagoras out of the city for saying the sea was three months from the Persian king, expelled Cleisthenes from Athens, was besieged on the Acropolis, and lost his army at Eleusis when the Corinthians went home.','Cleomenes','major'),
('dorieus','Dorieus','Anaxandrides’s second son, who would not be ruled by his brother, failed to found a colony in Libya, tried again at Heraclea in Sicily against the oracle’s advice, and was killed there.','Dorieus|Dorieos','major'),
('leonidas','Leonidas','Anaxandrides’s third son, named here only in the list of brothers — the man of Thermopylae.','Leonidas','supporting'),
('cleombrotus-sparta','Cleombrotus','Anaxandrides’s youngest son, named with Leonidas; Pausanias was his son.','','supporting'),
('telys','Telys','King of the Sybarites, against whom Dorieus is said to have helped Croton — the claim Herodotus reports and then queries.','Telys','supporting'),
('callias','Callias','The diviner of Elis, of the Iamidae, who read the sacrifices for Croton against Sybaris and was given land for it — Herodotus’s evidence that the Crotoniats are telling the truth.','Callias','supporting'),
('hippias','Hippias','Peisistratus’s son and tyrant of Athens, driven out by the Lacedaemonians and the Alcmaeonidae to Sigeum; the one man, Herodotus says, who understood the oracles about Attica.','Hippias','major'),
('hipparchus','Hipparchus','Peisistratus’s other son, killed by Aristogeiton and Harmodius after a dream that warned him plainly and that he took no notice of.','Hipparchus|Hipparchos','major'),
('aristogeiton','Aristogeiton','With Harmodius, the killer of Hipparchus; both were Gephyraeans by descent.','Aristogeiton','supporting'),
('harmodius','Harmodius','Aristogeiton’s companion in the killing.','Harmodius|Harmodios','supporting'),
('gephyraeans','The Gephyraeans','The family Aristogeiton and Harmodius came from, driven out of Tanagra by the Boeotians and received at Athens on conditions, with rites of their own that other Athenians may not attend.','Gephyraeans|Gephyraians|Gephrynians','supporting','group'),
('anchimolius','Anchimolius','The Spartan of repute sent by sea against the Peisistratidae, beaten by the Thessalian horse at Phalerum and buried at Alopekai.','Anchimolius|Anchimolios','supporting'),
('aster','Aster','Anchimolius’s father.','Aster','reference'),
('alcmaeonidae','The Alcmaeonidae','The Athenian family in exile who, Herodotus says, bribed the Pythian priestess to tell every Spartan who came that Athens must be set free — and so brought down the tyranny.','Alcmaeonidae|Alcmaionidai','major','group'),
('cleisthenes-athens','Cleisthenes','The Alcmaeonid who beat Isagoras by taking the people into his party, made ten tribes out of four, and was expelled by Cleomenes as one of the accursed — and sent for again.','','major'),
('cleisthenes-sicyon','Cleisthenes','Tyrant of Sicyon and the Athenian Cleisthenes’s mother’s father, who renamed the Dorian tribes after a pig, an ass and a swine and called his own the Rulers, and tried to turn Adrastus out of his own hero-shrine by importing Melanippus.','','major'),
('isagoras','Isagoras','Son of Tisander, Cleisthenes’s rival, who called in Cleomenes and was driven out with him.','Isagoras','major'),
('tisander','Tisander','Isagoras’s father, of a family Herodotus cannot trace beyond its sacrifices to Carian Zeus.','Tisander','reference'),
('adrastus-argos','Adrastus','Son of Talaus, the Argive hero whose shrine stood in the marketplace of Sicyon and whose worship Cleisthenes tried to starve out. A different man from the Phrygian Adrastus of Book 1.','','major','mythological-figure'),
('talaus','Talaus','Adrastus’s father. The older translation spells him Talaos.','Talaus|Talaos','reference','mythological-figure'),
('melanippus','Melanippus','Son of Astacus, Adrastus’s bitterest enemy, whom Cleisthenes fetched from Thebes and installed in the town hall of Sicyon so that Adrastus’s festivals could be transferred to him.','Melanippus|Melanippos','supporting','mythological-figure'),
('astacus','Astacus','Melanippus’s father. The older translation spells him Astacos.','Astacus|Astacos','reference','mythological-figure'),
('polybus','Polybus','The earlier king of the land of Sicyon, whose daughter’s son Adrastus was and whose kingdom he inherited.','Polybus|Polybos','reference','mythological-figure'),
('aeacus','Aeacus','Whose sons the Aeginetans sent to the Thebans instead of an army — and afterwards sent the army too, which is what the Athenians never forgave.','Aeacus|Aiacos','supporting','mythological-figure'),
('socles','Socles','The Corinthian who talked the allies out of restoring Hippias by telling them, at length, what a tyrant had actually been like at Corinth.','Socles','major'),
('aetion','Aëtion','Son of Echecrates, of the deme of Petra and a Lapith by descent, who married the lame Labda when no Bacchiad would, and to whom the oracle said his wife would bear a rolling stone.','Aëtion|Aetion|Eetion','supporting'),
('echecrates','Echecrates','Aëtion’s father.','Echecrates','reference'),
('labda','Labda','The lame daughter of Amphion, whom no Bacchiad would marry, and the mother of Cypselus — whom ten men came to kill and none of them could, because she handed him to them and he smiled.','Labda','supporting'),
('bacchiadae','The Bacchiadae','The oligarchy of Corinth, who married only among themselves and tried to kill the child the oracles warned them of. The older translation spells them Bacchiadai.','Bacchiadae|Bacchiadai','supporting','group'),
('onesilus','Onesilus','Gorgus’s younger brother, who shut him out of Salamis and led the Cyprian revolt; his head was hung over the gate of Amathus and a swarm of bees filled it, which made him a hero with an annual sacrifice.','Onesilus|Onesilos','major'),
('gorgus','Gorgus','King of Salamis in Cyprus, shut out of his own city by his brother and restored when the revolt failed.','Gorgus|Gorgos','supporting'),
('chersis','Chersis','Gorgus and Onesilus’s father.','Chersis','reference'),
('siromus','Siromus','Chersis’s father.','Siromus|Siromos','reference'),
('artybius','Artybius','The Persian commander in Cyprus whose horse was trained to rear against a man, and which Onesilus’s Carian groom cut the legs from.','Artybius|Artybios','major'),
('stesenor','Stesenor','The despot of Curium who deserted in the middle of the Cyprian battle and took the war with him.','Stesenor|Stesanor','supporting'),
('daurises','Daurises','A son-in-law of Darius, who took the towns of the Hellespont and then was drawn off to Caria and killed in a night ambush at Pedasos.','Daurises','major'),
('hymaees','Hymaees','Another son-in-law of Darius and a commander in the same campaign, who took Kios and the Aeolian towns and died of illness in the Troad. The two editions spell him Hymaees and Hymaies.','Hymaees|Hymaies','supporting'),
('pixodarus','Pixodarus','The Carian who advised crossing the Maeander and fighting with the river at their backs so that the Carians could not run — advice they did not take.','Pixodarus|Pixodaros','supporting'),
('heracleides-mylasa','Heracleides','Of Mylasa, whose plan of a night ambush on the road to Pedasos destroyed Daurises and his generals.','','supporting'),
]:add(*row)

# --------------------------------------------------------- the peoples of Book 5
for row in [
('paeonians','The Paeonians','Whose two brothers’ scheme brought Darius’s order to move the whole nation to Asia; those round Lake Prasias, living on platforms over the water, were never taken.','Paeonians|Paionians','major','group'),
('perinthians','The Perinthians','Who had once lost to the Paeonians on a paean and a single combat of man, horse and dog, and who fought Megabazus bravely and lost to numbers.','Perinthians','supporting','group'),
('macedonians','The Macedonians','Amyntas’s and Alexander’s people, whose royal house Herodotus is at pains to prove Hellenic.','Macedonians','supporting','group'),
('boeotians','The Boeotians','Who drove the Gephyraeans out of Tanagra, and who invaded Attica with the Chalcidians while Cleomenes was at Eleusis.','Boeotians','major','group'),
('chalcidians','The Chalcidians','Who invaded Attica from the other side and were beaten on the same day as the Boeotians; seven hundred of them were ransomed and their fetters hung in the Acropolis.','Chalcidians|Chalkidians','supporting','group'),
('thebans','The Thebans','Who gave Cleisthenes leave to take Melanippus away, and who asked the oracle how to punish Athens and were told to ask their nearest kin.','Thebans','major','group'),
('epidaurians','The Epidaurians','Who were told by Delphi to make images of Damia and Auxesia out of Athenian olive-wood, and whose Aeginetan colonists later stole them.','Epidaurians','supporting','group'),
('sicyonians','The Sicyonians','Cleisthenes’s people, in whose marketplace Adrastus’s shrine stood and whose Dorian tribes he renamed after animals.','Sicyonians|Sikyonians','supporting','group'),
('cyprians','The Cyprians','Who joined the Ionian revolt under Onesilus, all but Amathus, and were beaten in a year when their own contingents deserted in the field.','Cyprians|Cypriots','major','group'),
('curians','The Curians','Of Curium, said to be colonists from Argos, whose desertion turned the Cyprian battle.','Curians','supporting','group'),
('amathusians','The Amathusians','The one Cyprian city that would not join the revolt, and which hung Onesilus’s head over its gate.','Amathusians','supporting','group'),
('sybarites','The Sybarites','Whose city Croton took, and who claim Dorieus helped do it.','Sybarites','supporting','group'),
('crotoniats','The Crotoniats','Who say no stranger helped them except Callias the diviner — the version Herodotus prefers, and gives his reasons for. The older translation calls them only “the men of Croton”.','Crotoniats','supporting','group'),
('mytilenians','The Mytilenians','Who stoned Coës to death as soon as Aristagoras deposed him.','Mytilenians','supporting','group'),
('thessalians','The Thessalians','Whose thousand horse beat Anchimolius at Phalerum for the Peisistratidae, and were beaten in turn.','Thessalians','supporting','group'),
('naxians','The Naxians','Whose exiles brought the Persians down on Ionia, and who were warned in time by Megabates and stood a four-month siege.','Naxians','supporting','group'),
('eretrians','The Eretrians','Who sent five triremes to the Ionian revolt to repay Miletus for an older debt.','Eretrians','supporting','group'),
('parians','The Parians','Who were called in to reform the constitution of Miletus and did it by finding the men who kept their own farms in good order.','Parians','supporting','group'),
]:add(*row)

print(len(entities),'entities after Book 5')
Path(__file__).parent.joinpath('editorial.json').write_text(json.dumps(dict(
 contentVersion='2026-09-12.1',
 coverage='Both full English editions. BOOKS 1-4 (Clio, Euterpe, Thalia and Melpomene, sections 1-761) are authored; Books 5-9 are in progress. Named people and named peoples. Cities, rivers, mountains, seas and countries are not cast.',
 entities=[e for e in entities if e['name']!='unused']),ensure_ascii=False,indent=2)+'\n')
