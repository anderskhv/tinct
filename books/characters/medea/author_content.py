"""Manually authored recognition cards for Medea, without future outcomes."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('medea','Medea','central','The woman from Colchis, wife of Jason and mother of their two sons.','Medea')
C('jason','Jason','major','The Greek hero of the Argo’s quest, husband of Medea and father of their sons.','Jason')
C('creon','Creon','major','King of Corinth and father of Jason’s new bride.','Creon')
C('bride','Creon’s daughter','supporting','The princess of Corinth, Jason’s new bride. She is not named in this text.','','unnamed-person')
C('nurse','The nurse','supporting','Medea’s elderly servant and confidante.','Nurse','unnamed-role')
C('attendant','The children’s attendant','supporting','The elderly servant who looks after Medea and Jason’s sons.','Attendant','unnamed-role')
C('children','Medea and Jason’s sons','major','The two young sons of Medea and Jason. Their personal names are not given.','Children','group')
C('first-child','The first child','supporting','One of Medea and Jason’s two sons, distinguished by his speaker label.','A CHILD WITHIN|A CHILD','unnamed-role')
C('second-child','The other child','supporting','The other of Medea and Jason’s two sons, distinguished by his speaker label.','THE OTHER CHILD','unnamed-role')
C('chorus','The women of Corinth','major','The local women who speak and sing as the chorus.','Chorus|OTHER WOMEN|OTHERS|SOME WOMEN|THE OTHER WOMEN|WOMEN AT THE DOOR','group')
C('leader','The chorus leader','supporting','The spokeswoman for the women of Corinth.','Leader','unnamed-role')
C('woman','A woman of the chorus','supporting','An individual woman speaking from the chorus.','A WOMAN','unnamed-role')
C('another-woman','Another woman of the chorus','supporting','A second woman speaking from the chorus.','ANOTHER','unnamed-role')
C('aegeus','Aegeus','supporting','King of Athens and an old friend of Medea.','Aegeus')
C('messenger','The messenger','supporting','A servant from the royal household who brings news to Medea.','Messenger','unnamed-role')
C('pelias','Pelias','reference','The king of Iolcus who sent Jason in search of the Golden Fleece.','Pelias')
C('peliads','The daughters of Pelias','reference','The daughters of King Pelias, also called the Peliads.','Peliad maids','group')
C('pittheus','Pittheus','reference','The king of Troezen, son of Pelops, whom Aegeus plans to consult.','Pittheus')
C('pelops','Pelops','reference','Pittheus’s father, a king of Greek legend.','Pelops')
C('pandion','Pandion','reference','Aegeus’s father in the Athenian royal line.','Pandion')
C('erechtheus','Erechtheus','reference','A legendary king and ancestor associated with Athens.','Erechtheus')
for id,name,body,aliases in [
 ('zeus','Zeus','The chief god of the Greek pantheon.','Zeus'),
 ('themis','Themis','The goddess associated with divine order, justice and sacred obligations.','Themis'),
 ('hecate','Hecate','The goddess of magic whom Medea invokes as her special protector.','Hecate'),
 ('aphrodite','Aphrodite','The goddess of love, here called the Cyprian.','Cyprian'),
 ('orpheus','Orpheus','The legendary Greek singer and musician.','Orpheus'),
 ('apollo','Apollo','The god whose oracle Aegeus consults at Delphi, also called Phoebus.','Apollo|Phoebus'),
 ('maia','Maia','The mother of Hermes in Greek mythology.','Maia'),
 ('hermes','Hermes','The divine messenger and protector of travelers, son of Maia.','guiding Son|guiding son'),
 ('muses','The Muses','The nine goddesses of poetry, music and the arts.','Muses|Nine'),
 ('ino','Ino','A woman of Greek legend whom the chorus recalls as a mother driven mad by Hera.','Ino'),
 ('hera','Hera','The queen of the gods and goddess of marriage.','Hera|Queen of Heaven'),
 ('skylla','Skylla','The sea monster of Greek legend, also called Scylla.','Skylla'),
 ('athena','Athena','The goddess of wisdom and protector of Athens, here called Pallas.','Pallas'),
 ('pan','Pan','The rustic god whose influence was associated with sudden terror and frenzy.','Pan'),
 ('helios','Helios','The sun god, Medea’s divine grandfather.','Sun')]:C(id,name,'reference',body,aliases,'cultural-figure')
C('old-handmaid','The old handmaid','reference','The elderly woman among the princess’s attendants in the messenger’s account.','','unnamed-person')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='medea',contentVersion='2026-09-10.1',coverage='Complete play in both English editions: named cast, individual and collective speaker roles, the unnamed princess, mythic references and identifiable attendants. No invented names for the sons or princess.',entities=entities),ensure_ascii=False,indent=2)+'\n')
