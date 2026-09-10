"""Manually authored recognition cards for Antigone."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('antigone','Antigone','central','Oedipus’s daughter, sister of Ismene, Eteocles and Polyneices.','Antigone')
C('creon','Creon','central','King of Thebes, Antigone and Ismene’s uncle, and Haemon’s father.','Creon')
C('ismene','Ismene','major','Antigone’s sister, another daughter of Oedipus.','Ismene')
C('haemon','Haemon','major','Creon and Eurydice’s son, betrothed to Antigone.','Haemon')
C('teiresias','Teiresias','supporting','The blind prophet of Thebes.','Teiresias')
C('eurydice','Eurydice','supporting','Creon’s wife and Haemon’s mother.','Eurydice')
C('chorus','The Theban elders','major','The elders of Thebes who speak and sing as the chorus.','Chorus','group')
C('guard','The guard','supporting','The sentry posted to watch Polyneices’ body.','','unnamed-person')
C('messenger','The messenger','supporting','The attendant who reports events outside the palace.','','unnamed-person')
C('second-messenger','The palace messenger','supporting','The second messenger, reporting from inside Creon’s palace.','Second Messenger','unnamed-person')
C('eteocles','Eteocles','reference','Oedipus’s son and brother of Polyneices, Antigone and Ismene.','Eteocles')
C('polyneices','Polyneices','major','Oedipus’s son and brother of Eteocles, Antigone and Ismene.','Polyneices')
C('oedipus','Oedipus','reference','The former king of Thebes and father of Antigone, Ismene, Eteocles and Polyneices.','Oedipus')
C('laius','Laius','reference','An earlier king of Thebes, Oedipus’s father.','Laius')
C('menoeceus','Menoeceus','reference','Creon’s father.','Menoeceus')
C('megareus','Megareus','reference','A son of Creon and Eurydice, and Haemon’s brother.','Megareus')
C('labdacus','Labdacus','reference','Laius’s father, an ancestor of the Theban royal family.','Labdacus')
C('cadmus','Cadmus','reference','The legendary founder of Thebes.','Cadmus')
C('amphion','Amphion','reference','The legendary king and musician associated with building Thebes’ walls.','Amphion')
for id,name,body,aliases in [
 ('zeus','Zeus','The chief god of the Greek pantheon.','Zeus'),
 ('ares','Ares','The Greek god of war.','Ares'),
 ('bacchus','Bacchus / Dionysus','The god of wine and ecstatic worship, closely associated with Thebes.','Bacchus|Dionysus'),
 ('athena','Athena','The goddess of wisdom and protector of cities, here called Pallas.','Pallas'),
 ('persephone','Persephone','The queen of the underworld, here called Persephassa.','Persephassa'),
 ('pluto','Pluto','The ruler of the underworld, also known as Hades.','Pluto'),
 ('tantalus','Tantalus','Niobe’s father in Greek legend.','Tantalus'),
 ('niobe','Niobe','The legendary daughter of Tantalus, associated with a weeping rock on Mount Sipylus.','doomed child'),
 ('danae','Danae','The mother of Perseus in Greek legend, confined by her father in a bronze chamber.','Danae'),
 ('dryas','Dryas','The father of Lycurgus, the Thracian king who opposed Bacchus.','Dryas'),
 ('lycurgus','Lycurgus','The Thracian king, son of Dryas, who opposed the worship of Bacchus.','Edonian King|Edonian king'),
 ('muses','The Muses','The goddesses who inspire poetry, music and the arts.','tuneful Nine|Muses'),
 ('boreas','Boreas','The god of the north wind, father of Cleopatra in the legend recalled by the chorus.','Boreas'),
 ('erechtheus','Erechtheus','A legendary king of Athens, an ancestor in the family of Boreas’s daughter.','Erecththeus|Erechtheus'),
 ('demeter','Demeter','The goddess of agriculture, associated with the rites at Eleusis.','Eleusinian Queen'),
 ('hecate','Hecate','The goddess associated with crossroads and the underworld.','goddess of cross-ways|goddess of the crossroads')]:C(id,name,'reference',body,aliases,'cultural-figure')
C('maenads','The Maenads','reference','The ecstatic female followers of Bacchus, also called Bacchanals or Thyiads.','Maenads|Maenad|Bacchanals|Thyiads','mythical-group')
C('cleopatra','Cleopatra','reference','The daughter of Boreas and wife of Phineus in the legend recalled by the chorus.','','cultural-figure')
C('phineus-sons','The sons of Phineus','reference','The two sons of Phineus and Cleopatra in the chorus’s legend.','','mythical-group')
C('stepmother','The stepmother in the legend','reference','Phineus’s second wife, stepmother of his sons by Cleopatra.','','cultural-figure')
C('semele','Semele','reference','The Theban princess who is Dionysus’s mother.','Theban bride','cultural-figure')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='antigone',contentVersion='2026-09-10.1',coverage='Complete English editions: named cast, both messenger roles, guard, named ancestors and identifiable mythic references. Ordinary family and betrothal identities are immediate; no later outcomes in cards.',entities=entities),ensure_ascii=False,indent=2)+'\n')
