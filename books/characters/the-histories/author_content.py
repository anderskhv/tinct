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
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

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
('adrastus','Adrastus','A Phrygian prince who had killed his own brother by accident, was purified by Croesus, was given charge of Croesus’s son, killed him by accident too, and cut his own throat on the grave.','Adrastus|Adrastos','major'),
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
('magians','The Magians','One of the Median tribes, and the interpreters of dreams and portents at the Persian court; their reading of Astyages’s dream is what sets the whole story going.','Magians|Magian','supporting','group'),
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

print(len(entities),'entities after Book 1')
Path(__file__).parent.joinpath('editorial.json').write_text(json.dumps(dict(
 contentVersion='2026-09-12.1',
 coverage='Both full English editions. BOOK 1 (Clio, sections 1-215) is authored; Books 2-9 are in progress. Named people and named peoples. Cities, rivers, mountains, seas and countries are not cast.',
 entities=entities),ensure_ascii=False,indent=2)+'\n')
