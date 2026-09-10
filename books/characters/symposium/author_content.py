"""Manual recognition copy for the locally excerpted Symposium."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('socrates','Socrates','central','The Athenian philosopher attending Agathon’s banquet.','Socrates')
C('apollodorus','Apollodorus','supporting','The narrator retelling the banquet conversation from Aristodemus’s account.','APOLLODORUS|Apollodorus')
C('aristodemus','Aristodemus','major','Socrates’ companion at the banquet, whose eyewitness account Apollodorus retells.','Aristodemus')
C('agathon','Agathon','major','The tragic playwright hosting the banquet to celebrate his victory.','Agathon')
C('phaedrus','Phaedrus','major','The guest whose wish to hear Love praised inspires the evening’s speeches.','Phaedrus')
C('pausanias','Pausanias','major','Agathon’s lover and one of the guests giving a speech about love.','Pausanias')
C('eryximachus','Eryximachus','major','The physician at the banquet, son of Acumenus, who proposes the order of speeches.','Eryximachus')
C('aristophanes','Aristophanes','major','The comic playwright attending Agathon’s banquet.','Aristophanes|Aristoph.')
C('diotima','Diotima','major','The wise woman from Mantineia whose teaching about love Socrates recounts.','Diotima')
C('alcibiades','Alcibiades','major','The Athenian statesman and commander, an admirer of Socrates, who joins the banquet.','Alcibiades')
C('listener','Apollodorus’s listener','supporting','The unnamed companion asking Apollodorus to retell the banquet conversation.','COMPANION','unnamed-person')
for id,name,body,aliases in [
 ('acumenus','Acumenus','Eryximachus’s father, also a physician.','Acumenus'),
 ('homer','Homer','The ancient Greek epic poet repeatedly cited by the speakers.','Homer'),
 ('euripides','Euripides','The Athenian tragic playwright quoted by the guests.','Euripides|Eurip.'),
 ('prodicus','Prodicus','The sophist recalled for his prose treatment of Heracles.','Prodicus'),
 ('hesiod','Hesiod','The Greek poet whose account of the gods’ beginnings is cited.','Hesiod'),
 ('parmenides','Parmenides','The Greek philosopher and poet cited on the origins of Love.','Parmenides'),
 ('acusilaus','Acusilaus','The early Greek prose writer who recorded myths and genealogies.','Acusilaus'),
 ('aeschylus','Aeschylus','The Athenian tragic playwright whose depiction of Achilles and Patroclus is disputed by Phaedrus.','Aeschylus'),
 ('aristogeiton','Aristogeiton','The Athenian associated with Harmodius in the opposition to tyranny.','Aristogeiton'),
 ('harmodius','Harmodius','The Athenian associated with Aristogeiton in the opposition to tyranny.','Harmodius'),
 ('heracleitus','Heraclitus','The Greek philosopher cited for harmony arising from opposing forces.','Heracleitus|Heraclitus'),
 ('gorgias','Gorgias','The celebrated teacher of rhetoric invoked in Socrates’ wordplay about Agathon’s speech.','Gorgias|Gorginian'),
 ('lycurgus','Lycurgus','The traditional Spartan lawgiver, cited for the lasting value of his laws.','Lycurgus'),
 ('solon','Solon','The Athenian lawgiver cited among creators of lasting civic achievements.','Solon'),
 ('olympus','Olympus','The legendary flute musician associated with Marsyas, whose melodies Alcibiades discusses.','Olympus'),
 ('pericles','Pericles','The Athenian statesman and orator whom Alcibiades compares with Socrates.','Pericles'),
 ('laches','Laches','The Athenian soldier and commander who retreats beside Socrates at Delium in Alcibiades’ account.','Laches'),
 ('brasidas','Brasidas','The Spartan commander used as an example of heroic courage.','Brasidas'),
 ('charmides','Charmides','The son of Glaucon whom Alcibiades names among those drawn to Socrates.','Charmides'),
 ('glaucon','Glaucon','Charmides’ father, named in Alcibiades’ account.','Glaucon'),
 ('euthydemus','Euthydemus','The son of Diocles whom Alcibiades names among Socrates’ admirers.','Euthydemus'),
 ('diocles','Diocles','The father of Euthydemus.','Diocles'),
 ('aristotle','Aristotle','The Greek philosopher cited in the translator’s references to the Politics.','Arist.'),
 ('pope','Alexander Pope','The English poet whose translation of Homer supplies the quoted line.','Pope')]:C(id,name,'reference',body,aliases)
for id,name,body,aliases,kind in [
 ('agamemnon','Agamemnon','The commander of the Greek army at Troy, Menelaus’s brother.','Agamemnon','mythological-figure'),
 ('menelaus','Menelaus','The Greek king of Sparta and brother of Agamemnon in the Homeric comparison.','Menelaus','mythological-figure'),
 ('dionysus','Dionysus','The Greek god of wine and theater, invoked as judge of the poets’ and speakers’ contest.','Dionysus','deity'),
 ('melanippe','Melanippe','The mythological heroine whose words in a play by Euripides Eryximachus borrows.','Melanippe','literary-figure'),
 ('eros','Eros (Love)','The figure of Love whose nature and power the guests debate.','Love|Loves','personification'),
 ('heracles','Heracles','The Greek hero recalled in Prodicus’s moral tale and in Alcibiades’ exclamation.','Heracles','mythological-figure'),
 ('aphrodite','Aphrodite','The Greek goddess of love and beauty.','Aphrodite','deity'),
 ('chaos','Chaos','The primordial void in Hesiod’s account of the beginnings of the gods.','Chaos','mythological-figure'),
 ('earth','Earth','The primordial Earth, or Gaia, in the quoted account of the gods’ beginnings.','','deity'),
 ('alcestis','Alcestis','The wife of Admetus and daughter of Pelias, offered as an example of devoted love.','Alcestis','mythological-figure'),
 ('pelias','Pelias','Alcestis’s father, a king in Greek myth.','Pelias','mythological-figure'),
 ('admetus','Admetus','Alcestis’s husband in the myth recalled by the speakers.','Admetus','mythological-figure'),
 ('orpheus','Orpheus','The mythical singer who seeks his wife in the underworld.','Orpheus','mythological-figure'),
 ('oeagrus','Oeagrus','Orpheus’s father.','Oeagrus','mythological-figure'),
 ('eurydice','Eurydice','Orpheus’s wife, whom he seeks in the underworld.','','mythological-figure'),
 ('achilles','Achilles','The Greek hero of the Iliad, companion of Patroclus.','Achilles','mythological-figure'),
 ('patroclus','Patroclus','Achilles’ companion in the Iliad, whom Phaedrus describes as his lover.','Patroclus','mythological-figure'),
 ('thetis','Thetis','Achilles’ mother, the sea goddess who tells him of his possible fates.','','deity'),
 ('hector','Hector','The Trojan hero opposed to Achilles in the Iliad.','Hector','mythological-figure'),
 ('uranus','Uranus','The primordial sky god, father of the heavenly Aphrodite in Pausanias’s account.','Uranus','deity'),
 ('zeus','Zeus','The chief Olympian god in the stories and comparisons told by the guests.','Zeus','deity'),
 ('dione','Dione','The goddess named with Zeus as the parent of the common Aphrodite.','Dione','deity'),
 ('asclepius','Asclepius','The Greek god of healing, whom Eryximachus credits with founding medicine.','Asclepius','deity'),
 ('urania','Urania','The heavenly Muse in Eryximachus’s comparison of kinds of musical love.','Urania','deity'),
 ('polyhymnia','Polyhymnia','The Muse contrasted with Urania in Eryximachus’s account of music and love.','Polyhymnia','deity'),
 ('otys','Otus','The giant called Otys, who with Ephialtes attempts to reach the gods.','Otys','mythological-figure'),
 ('ephialtes','Ephialtes','The giant paired with Otus in the assault on heaven.','Ephialtes','mythological-figure'),
 ('apollo','Apollo','The Greek god who helps reshape humans in Aristophanes’ myth, also associated with healing and prophecy.','Apollo','deity'),
 ('hephaestus','Hephaestus','The divine smith whom Aristophanes imagines offering to join lovers permanently.','Hephaestus','deity'),
 ('iapetus','Iapetus','The Titan invoked as an example of a very ancient god.','Iapetus','deity'),
 ('kronos','Kronos','The Titan who is Zeus’s father, invoked in the account of the older gods.','Kronos','deity'),
 ('necessity','Necessity','The personified force to which Agathon attributes the old conflicts among the gods.','Necessity','personification'),
 ('ate','Ate','The goddess of delusion and ruin, quoted as an example of delicacy in Homer.','Ate','deity'),
 ('ares','Ares','The Greek god of war, described as mastered by love for Aphrodite.','God of War','deity'),
 ('muses','The Muses','The goddesses of music and poetry.','Muses','group'),
 ('athena','Athena','The Greek goddess associated with weaving, called Athene here.','Athene','deity'),
 ('gorgon','The Gorgon','The petrifying monster evoked by Socrates’ joke about Gorgias’s rhetoric.','Gorgonian','mythological-figure'),
 ('poros','Poros (Plenty)','The personification of resourcefulness, son of Metis, in Diotima’s story of Love’s birth.','Poros|Plenty','personification'),
 ('metis','Metis (Discretion)','The personification of wisdom and resourceful thought, Poros’s mother in Diotima’s story.','Metis|Discretion','personification'),
 ('penia','Penia (Poverty)','The personification of poverty in Diotima’s story of Love’s birth.','Penia|Poverty','personification'),
 ('codrus','Codrus','The legendary Athenian king cited as an example of self-sacrifice for lasting fame.','Codrus','mythological-figure'),
 ('poseidon','Poseidon','The Greek god of the sea, invoked by Alcibiades.','Poseidon','deity'),
 ('silenus','Silenus','The satyr-like figure whose hollow statuettes Alcibiades compares with Socrates.','Silenus','mythological-figure'),
 ('marsyas','Marsyas','The mythical satyr and flute-player whose musical power is compared with Socrates’ speech.','Marsyas','mythological-figure'),
 ('diomedes','Diomedes','The Greek hero called Diomede, recalled for exchanging bronze armor for gold in the Iliad.','Diomede','mythological-figure'),
 ('ajax','Ajax','The mighty Greek hero of the Trojan War, used as a comparison for resistance to injury.','Ajax','mythological-figure'),
 ('nestor','Nestor','The elderly Greek king renowned for wise speech in Homer.','Nestor','mythological-figure'),
 ('antenor','Antenor','The Trojan elder and counselor compared with Pericles for his eloquence.','Antenor','mythological-figure'),
 ('divinity','The divine','A general reference to gods and divine power in the speakers’ discussion.','','deity')]:C(id,name,'reference',body,aliases,kind)
for id,name,role,body,kind in [
 ('welcoming-servant','Agathon’s welcoming servant','supporting','The household servant who brings Aristodemus into the banquet.','unnamed-person'),
 ('reporting-servant','The servant sent for Socrates','supporting','The attendant who reports Socrates standing absorbed in the neighboring portico.','unnamed-person'),
 ('servants','Agathon’s servants','supporting','The household attendants serving the banquet.','group'),
 ('first-flute-girl','The banquet flute-player','supporting','The female musician present before the guests begin their speeches.','unnamed-person'),
 ('second-flute-girl','Alcibiades’ flute-player','supporting','The female musician accompanying Alcibiades on his arrival.','unnamed-person'),
 ('alcibiades-attendants','Alcibiades’ attendants','supporting','The companions helping Alcibiades into the banquet.','group'),
 ('late-revellers','The late revelers','supporting','The group that enters Agathon’s house near the end of the night.','group'),
 ('admetus-parents','Admetus’s parents','reference','The father and mother contrasted with Alcestis in Phaedrus’s example of devotion.','group'),
 ('original-humans','The original humans','reference','The double-bodied ancestors in Aristophanes’ invented account of human love.','group')]:C(id,name,role,body,'',kind)
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='symposium',contentVersion='2026-09-10.1',coverage='All eight local sections: banquet and framing speakers, named cultural and family references, explicit servant roles and imagined figures; exclusions for translator titles and missing opening frame.',entities=entities),ensure_ascii=False,indent=2)+'\n')
