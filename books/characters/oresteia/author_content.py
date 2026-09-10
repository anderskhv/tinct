"""Manually authored recognition copy for all three plays."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',roleAfter=None):
 e=dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[])
 if roleAfter:e['roleAfter']=roleAfter
 entities.append(e)
C('agamemnon','Agamemnon','central','The king of Argos, commander of the Greek expedition to Troy, and husband of Clytemnestra.','AGAMEMNON|Agamemnon|VOICE OF AGAMEMNON')
C('clytemnestra','Clytemnestra','central','Agamemnon’s wife and queen of Argos, mother of Orestes, Electra and Iphigenia.','CLYTEMNESTRA|CLYTEMNESTSA|Clytemnestra|GHOST OF CLYTEMNESTRA|GHOST')
C('orestes','Orestes','central','The son of Agamemnon and Clytemnestra, and brother of Electra.','ORESTES|OSESTES|Orestes',roleAfter=[11,0])
C('cassandra','Cassandra','major','The Trojan princess and prophetess brought back as Agamemnon’s captive.','CASSANDRA|Cassandra')
C('aegisthus','Aegisthus','major','Clytemnestra’s lover and the son of Thyestes, from the rival branch of Agamemnon’s family.','AEGISTHUS|Aegisthus|AEgisthus|VOICE OF AEGISTHUS')
C('electra','Electra','major','The daughter of Agamemnon and Clytemnestra, and sister of Orestes.','ELECTRA|Electra')
C('apollo','Apollo','major','The god of prophecy, worshipped at Delphi and also called Loxias or Phoebus.','APOLLO|Apollo|Loxias|Phoebus','deity',roleAfter=[19,5])
C('athena','Athena','major','The patron goddess of Athens, daughter of Zeus, also called Pallas.','ATHENA|Athena|Pallas','deity',roleAfter=[22,0])
C('furies','The Furies','major','The ancient avenging goddesses who punish violations of family bonds.','THE FURIES|Furies','group',roleAfter=[17,100])
C('argive-chorus','The Argive elders','major','The elders of Argos who form the chorus in Agamemnon.','','group')
C('libation-chorus','The libation bearers','major','The enslaved women of the palace who accompany Electra and form the second play’s chorus.','','group')
C('watchman','The watchman','supporting','The palace watchman waiting for the beacon that will signal news from Troy.','A WATCHMAN','unnamed-role')
C('herald','The herald','supporting','The messenger returning from the Greek expedition to Troy.','HERALD|Herald','unnamed-role')
C('argive-leader','The leader of the Argive elders','supporting','The spokesman for the elders of Argos.','LEADER OF THE CHORUS','unnamed-role')
for n in range(1,12):C(f'elder-{n}',f'Argive elder {n}','supporting','One of the elders separately voicing advice during the palace crisis.','','unnamed-role')
C('pylades','Pylades','supporting','Orestes’s companion, son of Strophius of Phocis.','PYLADES|Pylades')
C('kilissa','Kilissa','supporting','Orestes’s old nurse in the palace of Argos.','Kilissa|A NURSE')
C('doorkeeper','The palace doorkeeper','supporting','The servant who answers the travelers’ knock at the palace.','','unnamed-role')
C('aegisthus-servant','Aegisthus’s servant','supporting','The palace servant who calls for help from Clytemnestra’s quarters.','','unnamed-role')
C('pythia','The Pythian priestess','supporting','Apollo’s priestess at the oracle of Delphi.','THE PYTHIAN PRIESTESS','unnamed-role')
C('first-fury','The first Fury','supporting','One of the avenging goddesses, speaking separately as they wake.','FIRST FURY','deity')
C('jurors','The Athenian jurors','supporting','The twelve Athenian citizens assembled by Athena to hear the case.','','group')
C('escort','The Athenian escort','supporting','The women and children who form the ceremonial procession at the end of the trilogy.','CHANT','group')
C('robe-maidens','The palace maidens','supporting','Clytemnestra’s attendants carrying the purple robes for Agamemnon’s reception.','','group')
for id,name,body,aliases,kind in [
 ('atreus','Atreus','The father of Agamemnon and Menelaus, and brother of Thyestes.','Atreus','person'),
 ('thyestes','Thyestes','Atreus’s brother and rival, and father of Aegisthus.','Thyestes','person'),
 ('thyestes-children','Thyestes’s children','The children of Thyestes recalled in the account of the family’s older crimes.','','group'),
 ('menelaus','Menelaus','Agamemnon’s brother and Helen’s husband, a leader of the Greek expedition.','Menelaus','person'),
 ('helen','Helen','Menelaus’s wife, whose departure with Paris lies behind the Trojan War.','Helen','person'),
 ('paris','Paris','The Trojan prince who takes Helen from Menelaus, also called Alexander.','Paris|Alexander','person'),
 ('priam','Priam','The king of Troy and father of Paris and Cassandra.','Priam','person'),
 ('tyndareus','Tyndareus','Clytemnestra’s father.','Tyndareus','person'),
 ('leda','Leda','Clytemnestra’s mother.','Leda','person'),
 ('calchas','Calchas','The seer who interprets signs for the Greek army at Troy.','Calchas','person'),
 ('iphigenia','Iphigenia','The daughter of Agamemnon and Clytemnestra recalled in the account of the expedition’s departure.','Iphigenia','person'),
 ('odysseus','Odysseus','The Greek commander praised by Agamemnon for his loyalty during the war.','Odysseus','person'),
 ('geryon','Geryon','The three-bodied mythical figure used in Clytemnestra’s comparison.','Geryon','mythical-being'),
 ('strophius','Strophius','The ruler in Phocis who is caring for Orestes, and father of Pylades.','Strophius','person'),
 ('asclepius','Asclepius','The divine healer famed for restoring the dead to life.','Asclepius','deity'),
 ('heracles','Heracles','The hero, son of Alcmena, cited as someone who endured servitude.','','person'),
 ('alcmena','Alcmena','The mother of Heracles.','Alcmena','person'),
 ('itys','Itys','The child mourned in the mythical nightingale’s song.','Itys','person'),
 ('scylla-monster','Scylla, the sea monster','The monster feared by sailors, used in Cassandra’s comparison.','','mythical-being'),
 ('scylla-daughter','Scylla, the king’s daughter','The daughter who betrays her father for Minos in the chorus’s story.','','person'),
 ('chryseis','Chryseis','The Trojan captive associated with Agamemnon, invoked as a type of his wartime lovers.','Chryseis','person'),
 ('tantalus','Tantalus','An ancestor of the royal house of Atreus.','Tantalus','person'),
 ('pleisthenes','Pleisthenes','An ancestral name used for the royal family of Agamemnon.','Pleisthenes','person'),
 ('pelops','Pelops','The father of Atreus and Thyestes, an ancestor of the royal house.','Pelops','person'),
 ('orpheus','Orpheus','The legendary musician whose song charms its listeners.','Orpheus','person'),
 ('althea','Althea','The mother in the story of a son’s life bound to a burning brand.','Althea','person'),
 ('althea-son','Althea’s son','The son whose life is bound to a piece of wood in the chorus’s story.','','unnamed-person'),
 ('minos','Minos','The Cretan king for whom Scylla betrays her father.','Minos','person'),
 ('scylla-father','Scylla’s father','The king whose magical lock of hair is cut by his daughter Scylla.','','unnamed-person'),
 ('perseus','Perseus','The mythical hero invoked as a model of resolve.','Perseus','person'),
 ('delphos','Delphos','The legendary king who welcomes Apollo to Delphi.','Delphos','person'),
 ('pentheus','Pentheus','The king associated with opposition to Dionysus, recalled by the priestess.','Pentheus','person'),
 ('phineus','Phineus','The king whose food is seized by the Harpies in the mythical comparison.','Phineus','person'),
 ('ixion','Ixion','The mythical figure whose purification is recalled as a precedent.','Ixion','person'),
 ('theseus','Theseus','The legendary Athenian king associated with the conflict against the Amazons.','Theseus','person'),
 ('aegeus','Aegeus','Theseus’s father.','Aegeus','person'),
 ('pheres','Pheres','The king whose household is recalled in the story of Apollo and the Fates.','Pheres','person'),
 ('erechtheus','Erechtheus','An ancient king and hero of Athens.','Erechtheus','person'),
 ('cranaos','Cranaos','A legendary early king whose descendants stand for the Athenians.','Cranaos','person'),
 ('zeus','Zeus','The chief Olympian god, invoked as guardian of justice and hospitality.','Zeus','deity'),
 ('pan','Pan','The god of shepherds and wild places.','Pan','deity'),
 ('artemis','Artemis','The goddess of the hunt, invoked in the account of the Greek fleet.','Artemis','deity'),
 ('hephaestus','Hephaestus','The god of fire, named in the description of the beacon signal.','Hephaestus','deity'),
 ('hermes','Hermes','The messenger god, son of Zeus and Maia, who also guides souls.','Hermes','deity'),
 ('ares','Ares','The god of war.','Ares','deity'),
 ('persephone','Persephone','The queen of the underworld.','Persephone','deity'),
 ('maia','Maia','Hermes’s mother.','Maia','deity'),
 ('themis','Themis','The goddess of divine order, named among the early holders of Delphi’s oracle.','Themis','deity'),
 ('phoebe','Phoebe','The Titan goddess who passes the Delphic oracle to Apollo.','Phoebe','deity'),
 ('earth','Earth','The primordial goddess named as Delphi’s first prophetic power.','','deity'),
 ('dionysus','Dionysus','The god of wine and ecstatic worship, called Bacchus here.','Bacchus','deity'),
 ('poseidon','Poseidon','The god of the sea.','Poseidon','deity'),
 ('hera','Hera','Zeus’s wife, invoked as a guardian of marriage.','Hera','deity'),
 ('aphrodite','Aphrodite','The goddess of love.','Aphrodite','deity'),
 ('leto','Leto','Apollo’s mother.','Leto','deity'),
 ('cronos','Cronos','The Titan who is Zeus’s father.','Cronos','deity'),
 ('sun','The Sun','The all-seeing sun invoked as a divine witness.','','deity'),
 ('night','Night','The primordial goddess, mother of the Furies.','','deity'),
 ('justice','Justice','Justice personified as a daughter of Zeus.','','personification'),
 ('persuasion','Persuasion','The divine power of persuasion invoked by Athena.','Persuasion','personification'),
 ('fates','The Fates','The goddesses who determine the allotted course of lives.','Fates','group'),
 ('gorgons','The Gorgons','The terrifying mythical beings used in comparisons with the avenging goddesses.','Gorgons|Gorgon','group'),
 ('harpies','The Harpies','The winged creatures who snatch Phineus’s food in the myth.','Harpies','group'),
 ('nymphs','The nymphs','The nature spirits worshipped at the Corycian cave.','Nymphs','group'),
 ('amazons','The Amazons','The women warriors recalled in the account of Athens’s past.','Amazons','group')]:C(id,name,'reference',body,aliases,kind)
C('inachus','Inachus','reference','The river god to whom Orestes dedicates a lock of hair.','Inachus','deity')
C('admetus','Admetus','reference','The son of Pheres whose escape from death is recalled in the exchange about Apollo and the Fates.','','person')
C('ate','Ate','reference','The divine personification of ruin and destructive delusion.','Atè|Ate','personification')
C('zephyr','Zephyr','reference','The west wind, named in the account of Helen’s voyage.','Zephyr|West Wind','deity')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='oresteia',contentVersion='2026-09-10.1',coverage='All three plays and 26 local sections in both English editions: named cast, separate choruses, individual elders, speaking roles, family and mythological references. Exact reviewed aliases and selected contextual references.',entities=entities),ensure_ascii=False,indent=2)+'\n')
