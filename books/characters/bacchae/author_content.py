"""Manually authored recognition copy; the prologue makes the god's identity explicit."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('dionysus','Dionysus','central','The god of wine and ecstatic worship, son of Zeus and Semele, appearing in human form.','DIONYSUS|Dionysus|Dionyse|Bromios|Bromius|Bacchios|Bacchus|Iacchos|Iacchus|THE VOICE|Stranger','deity')
C('pentheus','Pentheus','central','The king of Thebes, son of Agave and Echion, and grandson of Cadmus.','PENTHEUS|Pentheus')
C('cadmus','Cadmus','major','The founder and former king of Thebes, grandfather of Pentheus and Dionysus.','CADMUS|Cadmus')
C('agave','Agave','major','Pentheus’s mother, daughter of Cadmus and sister of Semele.','AGAVE|Agave')
C('chorus','The chorus of Asian Bacchants','major','The women from Asia who accompany Dionysus and worship him.','CHORUS MAIDENS|CHORUS|Chorus|Eastern Women','group')
C('chorus-leader','The chorus leader','supporting','The spokeswoman for the Asian women who follow Dionysus.','LEADER OF THE CHORUS|LEADER','unnamed-role')
C('theban-women','The Theban Bacchants','major','The women of Thebes gathered on the mountain under Dionysus’s influence.','','group')
C('teiresias','Teiresias','supporting','The blind prophet of Thebes and old friend of Cadmus. Also spelled Tiresias.','TEIRESIAS|TIRESIAS|Teiresias|Tiresias')
C('autonoe','Autonoe','supporting','Agave’s sister and Actaeon’s mother, one of the daughters of Cadmus.','Autonoe')
C('ino','Ino','supporting','Agave’s sister, one of the daughters of Cadmus.','Ino')
C('soldier','The soldier','supporting','The officer commanding Pentheus’s guards.','SOLDIER','unnamed-role')
C('guards','Pentheus’s guards','supporting','The soldiers serving the king of Thebes.','guards|soldiers|bodyguard','group')
C('first-messenger','The herdsman messenger','supporting','The herdsman who reports on the women’s activities on the mountain.','','unnamed-role')
C('second-messenger','Pentheus’s attendant','supporting','The servant who accompanies Pentheus to the mountain and returns as a messenger.','','unnamed-role')
C('townsman','The townsman among the herdsmen','supporting','The town-experienced man who proposes capturing Agave in the herdsman’s account.','','unnamed-person')
C('semele','Semele','reference','Dionysus’s mother, a daughter of Cadmus and sister of Agave.','Semele|Lightning’s Bride|Lightning\'s Bride')
C('echion','Echion','reference','Pentheus’s father and Agave’s husband, one of the earth-born warriors of Thebes.','Echion')
C('harmonia','Harmonia','reference','Cadmus’s wife, a daughter of Ares.','Harmonia')
C('agenor','Agenor','reference','Cadmus’s father, associated with the family’s origins in Phoenicia.','Agenor')
C('actaeon','Actaeon','reference','The hunter, son of Autonoe and nephew of Agave, recalled as a warning.','Actaeon')
C('actaeon-father','Actaeon’s father','reference','The father of the hunter Actaeon, recalled by Cadmus at the end of the play.','','unnamed-person')
for id,name,body,aliases,kind in [
 ('zeus','Zeus','The chief Olympian god and father of Dionysus.','Zeus|All-Father','deity'),
 ('hera','Hera','Zeus’s wife, whose hostility to Semele is recalled in the play.','Hera','deity'),
 ('rhea','Rhea','The mother goddess associated here with the invention of the ritual drum.','Rhea','deity'),
 ('cybele','Cybele','The Phrygian mother goddess whose mountain rites are celebrated by the chorus.','Cybele','deity'),
 ('aphrodite','Aphrodite','The goddess of love, also called the Cyprian.','Aphrodite|Cyprian','deity'),
 ('demeter','Demeter','The goddess of grain and the earth’s nourishment.','Demeter','deity'),
 ('ares','Ares','The god of war and father of Harmonia.','Ares|Lord of War','deity'),
 ('apollo','Apollo','The god of prophecy, also called Phoebus.','Apollo|Phoebus','deity'),
 ('artemis','Artemis','The goddess of the hunt, invoked in the warning about Actaeon.','Artemis','deity'),
 ('orpheus','Orpheus','The legendary musician whose song charms trees and wild animals.','Orpheus','person'),
 ('pan','Pan','The god of shepherds and wild places.','Pan','deity'),
 ('nymphs','The nymphs','The female nature spirits invoked in the mountain setting.','Nymphs','group'),
 ('muses','The Muses','The goddesses of song and the arts.','Muses','group'),
 ('satyrs','The satyrs','The wild companion spirits of Dionysus, associated with dancing and revelry.','Satyrs','group'),
 ('corybant','The Corybant','One of the armed ritual dancers associated with the mother goddess.','Corybant','mythical-being'),
 ('achelous','Achelous','The river god named as Dirce’s father. Also spelled Acheloues.','Achelous|Acheloues','deity'),
 ('dirce','Dirce','The sacred Theban water personified as a daughter of Achelous.','','deity'),
 ('purity','Purity','The divine power of holiness addressed by the chorus.','Recording Purity','personification'),
 ('peace','Peace','Peace personified as the nurturer of children, beloved by Dionysus.','Feeder of Children, Peace','personification'),
 ('justice','Justice','Justice personified and invoked by the chorus.','Justice','personification'),
 ('earthquake','The spirit of earthquake','The power of earthquake summoned by Dionysus.','Spirit of the Chained Earthquake','personification')]:C(id,name,'reference',body,aliases,kind)
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='bacchae',contentVersion='2026-09-10.1',coverage='All eleven local sections of both English editions: named cast, two messengers, distinct worshipper groups, recognizable unnamed roles and named mythological or personified references.',entities=entities),ensure_ascii=False,indent=2)+'\n')
