"""Manually authored recognition cards for the complete local play."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('oedipus','Oedipus','central','The blind former king of Thebes, now an exile traveling with his daughter Antigone.','OEDIPUS|Oedipus')
C('antigone','Antigone','major','Oedipus’s daughter and guide during his exile.','ANTIGONE|Antigone')
C('ismene','Ismene','major','Oedipus’s daughter and Antigone’s sister.','ISMENE|Ismene')
C('theseus','Theseus','major','The king of Athens, son of Aegeus.','THESEUS|Theseus')
C('creon','Creon','major','The Theban statesman, Jocasta’s brother and uncle of Oedipus’s children.','CREON|Creon')
C('polyneices','Polyneices','major','Oedipus’s elder son and brother of Eteocles, Antigone and Ismene.','POLYNEICES|Polyneices')
C('chorus','The elders of Colonus','major','The local elders who speak for the community at Colonus.','CHORUS','group')
C('stranger','The local stranger','supporting','The resident of Colonus who first explains the sacred ground to Oedipus.','STRANGER','unnamed-role')
C('messenger','The messenger','supporting','An attendant of Theseus who reports what happens away from the stage.','MESSENGER','unnamed-role')
C('furies','The Eumenides','supporting','The avenging goddesses whose sacred grove is at Colonus, respectfully called the Gracious Ones.','Gracious Ones','group')
C('creon-men','Creon’s men','supporting','The attendants who accompany Creon from Thebes.','','group')
C('theseus-men','Theseus’s men','supporting','The Athenian attendants and fighters serving Theseus.','','group')
C('jocasta','Jocasta','reference','Oedipus’s mother and wife, the mother of his children and sister of Creon.','','person')
C('laius','Laius','reference','Oedipus’s father, an earlier king of Thebes.','Laius')
C('labdacus','Labdacus','reference','Laius’s father and Oedipus’s grandfather.','Labdacus')
C('eteocles','Eteocles','reference','Oedipus’s younger son, Polyneices’s rival for the throne of Thebes. Printed Etocles in the original.','Eteocles|Etocles')
C('adrastus','Adrastus','reference','The king of Argos and father-in-law of Polyneices.','Adrastus')
C('polyneices-wife','Polyneices’s wife','reference','The daughter of Adrastus whom Polyneices marries in Argos.','','unnamed-person')
for id,name,body,aliases,kind in [
 ('amphiaraus','Amphiaraus','The warrior and seer among the champions marching with Polyneices. Printed Amphiaraiis in the original.','Amphiaraus|Amphiaraiis','person'),
 ('tydeus','Tydeus','The Aetolian champion, son of Oeneus, allied with Polyneices.','Tydeus','person'),
 ('oeneus','Oeneus','Tydeus’s father.','Oeneus','person'),
 ('eteoclus','Eteoclus','The Argive champion allied with Polyneices; distinct from Oedipus’s son Eteocles.','Eteoclus','person'),
 ('hippomedon','Hippomedon','One of the Argive champions marching with Polyneices.','Hippomedon','person'),
 ('talaos','Talaos','The father of Hippomedon in the genealogy given here.','Talaos','person'),
 ('capaneus','Capaneus','The champion who boasts of burning Thebes.','Capaneus','person'),
 ('parthenopaeus','Parthenopaeus','The Arcadian champion, son of Atalanta, allied with Polyneices.','Parthenopaeus','person'),
 ('atalanta','Atalanta','The legendary huntress and mother of Parthenopaeus.','Atalanta','person'),
 ('aegeus','Aegeus','Theseus’s father and former king of Athens.','Aegeus','person'),
 ('pelops','Pelops','The legendary hero whose name is associated with the Peloponnese.','Pelops','person'),
 ('peirithous','Peirithous','The hero and companion of Theseus, recalled through their pact.','Peirithous','person'),
 ('colonus','Colonus','The local hero and patron from whom the district takes its name.','','person'),
 ('poseidon','Poseidon','The god of the sea and horses, worshipped at Colonus.','Poseidon|Ocean-king','deity'),
 ('prometheus','Prometheus','The fire-bearing Titan honored near the sacred grove.','Prometheus','deity'),
 ('apollo','Apollo','The god of prophecy, also called Phoebus.','Apollo|Phoebus','deity'),
 ('athena','Athena','The patron goddess of Athens, also called Pallas and Athene.','Pallas|Athene','deity'),
 ('zeus','Zeus','The chief Olympian god, associated with thunder and the protection of suppliants.','Zeus','deity'),
 ('dionysus','Dionysus','The god of wine and ecstatic worship, celebrated here as the Bacchic god.','Bacchic god','deity'),
 ('nymphs','The nymphs','The nature spirits who cared for the young Dionysus.','nymphs','group'),
 ('muses','The Muses','The goddesses of song and the arts.','Muses','group'),
 ('aphrodite','Aphrodite','The goddess of love, called the Cyprian here.','Cyprian','deity'),
 ('kronos','Kronos','The Titan who is father of Poseidon and Zeus.','Kronos','deity'),
 ('nereids','The Nereids','The sea nymphs whose dancing feet appear in the chorus’s image of swift oars.','Nereids','group'),
 ('ares','Ares','The god of war, associated with the Athenian hill called the Areopagus.','Ares','deity'),
 ('rhea','Rhea','The mother of Poseidon and other Olympian gods.','Rhea','deity'),
 ('artemis','Artemis','The hunting goddess and sister of Apollo.','Huntress','deity'),
 ('demeter','Demeter','The mother goddess worshipped with her daughter Persephone in the Eleusinian mysteries.','','deity'),
 ('persephone','Persephone','The queen of the underworld and daughter of Demeter, also called Persephassa.','Persephassa','deity'),
 ('eumolpidae','The Eumolpidae','The priestly family associated with the secret rites at Eleusis.','Eumolpidae','group'),
 ('hermes','Hermes','The god who guides the souls of the dead.','Hermes','deity'),
 ('hades','Hades','The ruler of the underworld, addressed as Aidoneus.','Aidoneus','deity'),
 ('cerberus','Cerberus','The watchdog guarding the entrance to the underworld.','','mythical-being'),
 ('death','Death','The divine power of death addressed as the giver of eternal sleep.','','personification'),
 ('earth','Earth','The primordial divine Earth, named in the genealogy of the sacred powers.','','personification'),
 ('night','Night','The primordial power of darkness associated with the avenging goddesses.','','personification')]:C(id,name,'reference',body,aliases,kind)
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='oedipus-at-colonus',contentVersion='2026-09-10.1',coverage='All eleven local sections and both English editions: complete named cast and references, speaking roles, scoped groups and divine titles. No generic pronoun or place-name inference.',entities=entities),ensure_ascii=False,indent=2)+'\n')
