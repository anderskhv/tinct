"""Manually reviewed people in the charter; no invented narrative protagonist."""
import json
from pathlib import Path
entities=[]
def C(id,name,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category='reference',body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('john','King John','The king of England issuing this charter in 1215.','JOHN')
C('stephen','Stephen, archbishop of Canterbury','The archbishop of Canterbury, named among the king’s advisers and involved in enforcing the settlement.','Stephen')
C('henry-dublin','Henry, archbishop of Dublin','The archbishop of Dublin, one of the ecclesiastical advisers named in the charter.','')
for id,name,place in [('william-london','William','London'),('peter-winchester','Peter','Winchester'),('jocelin','Jocelin','Bath and Glastonbury'),('hugh-lincoln','Hugh','Lincoln'),('walter','Walter','Worcester'),('william-coventry','William','Coventry'),('benedict','Benedict','Rochester')]:C(id,f'{name}, bishop of {place}',f'The bishop of {place}, named among the king’s advisers.')
C('pandulf','Master Pandulf','The papal representative named among the king’s advisers.','Master Pandulf')
C('aymeric','Brother Aymeric','The master of the Knights Templar in England.','Brother Aymeric')
C('william-marshal','William Marshal','The earl of Pembroke, one of the king’s advisers.','William Marshal')
for id,place in [('william-salisbury','Salisbury'),('william-warren','Warren'),('william-arundel','Arundel')]:C(id,f'William, earl of {place}',f'The earl of {place}, named among the king’s advisers.')
for id,name,body in [
 ('alan-galloway','Alan de Galloway','The constable of Scotland, named among the king’s advisers.'),
 ('warin','Warin Fitz Gerald','One of the royal supporters named in the charter’s opening.'),
 ('peter-herbert','Peter Fitz Herbert','One of the royal supporters named in the charter’s opening.'),
 ('hubert','Hubert de Burgh','The king’s seneschal, or chief administrator, of Poitou.'),
 ('hugh-neville','Hugh de Neville','One of the royal supporters named in the charter’s opening.'),
 ('matthew','Matthew Fitz Herbert','One of the royal supporters named in the charter’s opening.'),
 ('thomas-basset','Thomas Basset','One of the royal supporters named in the charter’s opening.'),
 ('alan-basset','Alan Basset','One of the royal supporters named in the charter’s opening.'),
 ('philip-daubeny','Philip Daubeny','One of the royal supporters named in the charter’s opening.'),
 ('robert','Robert de Roppeley','One of the royal supporters named in the charter’s opening.'),
 ('john-marshal','John Marshal','The royal supporter listed separately from William Marshal.'),
 ('john-hugh','John Fitz Hugh','One of the royal supporters named in the charter’s opening.')]:C(id,name,body,name)
C('innocent','Pope Innocent III','The pope who confirmed the freedom of English church elections mentioned in the charter.','Pope Innocent III')
C('gerard','Gerard de Athée','The royal servant whose kinsmen are singled out in the clause removing officials.','Gerard de Ath|Gerard de Athée')
C('engelard','Engelard de Cigogné','One of the men named in the clause removing royal officials.','Engelard de Cigogn|Engelard de Cigogné')
C('peter-chanceaux','Peter de Chanceaux','One of the three men of Chanceaux named in the removal clause.')
C('guy-chanceaux','Guy de Chanceaux','One of the three men of Chanceaux named in the removal clause.')
C('andrew','Andrew de Chanceaux','One of the three men of Chanceaux named in the removal clause.','Andrew de Chanceaux')
C('guy-cigogne','Guy de Cigogne','The man of Cigogne named separately from Guy de Chanceaux in the removal clause.','Guy de Cigogne')
C('geoffrey-martigny','Geoffrey de Martigny','The man named with his brothers in the removal clause.','Geoffrey de Martigny')
C('philip-marc','Philip Marc','The man named with his brothers in the removal clause.','Philip Marc')
C('geoffrey-nephew','Geoffrey, the nephew','The nephew named in the removal clause, distinct from Geoffrey de Martigny.')
C('henry-king','King Henry II','John’s father and an earlier king of England.','King Henry')
C('richard','King Richard I','John’s brother and predecessor as king of England.','King Richard|Richard')
C('llywelyn','Llywelyn','The Welsh ruler whose son is to be returned under the charter.','Llywelyn')
C('welsh-son','Llywelyn’s son','The son of the Welsh ruler Llywelyn, held as a hostage.','','unnamed-person')
C('alexander','Alexander, king of Scotland','The Scottish king whose sisters, hostages and rights are addressed in the charter.','Alexander')
C('william-scotland','William, king of Scotland','Alexander’s father and the former king of Scotland.')
C('sisters','Alexander’s sisters','The Scottish king’s sisters, whose return is addressed in the charter.','','group')
C('barons','The twenty-five barons','The elected group charged with enforcing the charter’s peace and liberties.','twenty-five barons','group')
C('god','God','The Christian God invoked as the source of royal authority and the witness to these promises.','God|GOD','religious-figure')
C('martigny-brothers','Geoffrey de Martigny’s brothers','The brothers named alongside Geoffrey de Martigny in the removal clause.','','group')
C('marc-brothers','Philip Marc’s brothers','The brothers named alongside Philip Marc in the removal clause.','','group')
C('queen','John’s queen','The king’s wife, whose person is protected in the enforcement clause.','','unnamed-person')
C('royal-children','John’s children','The king’s children, protected alongside their parents in the enforcement clause.','','group')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='magna-carta',contentVersion='2026-09-10.1',coverage='Whole charter in both English editions: named people, distinguishable hostages and the twenty-five-barons enforcement group. Historical reference cards, not an invented narrative cast.',entities=entities),ensure_ascii=False,indent=2)+'\n')
