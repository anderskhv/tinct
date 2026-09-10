"""Manually authored full-play recognition copy; no Threads summaries imported."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',snapshots=None):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=snapshots or []))
C('antipholus-syracuse','Antipholus of Syracuse','central','Egeon’s son, the visiting twin searching for his mother and brother.','ANTIPHOLUS OF SYRACUSE|Antipholus of Syracuse')
C('antipholus-ephesus','Antipholus of Ephesus','central','The twin established in Ephesus, married to Adriana.','ANTIPHOLUS OF EPHESUS|Antipholus of Ephesus|Antipholus (of Ephesus)')
C('dromio-syracuse','Dromio of Syracuse','central','The servant travelling with Antipholus of Syracuse; he too has a twin brother.','DROMIO OF SYRACUSE|Dromio of Syracuse')
C('dromio-ephesus','Dromio of Ephesus','central','The servant of Antipholus of Ephesus and twin brother of the other Dromio.','DROMIO OF EPHESUS|Dromio of Ephesus')
C('egeon','Egeon','major','The merchant from Syracuse and father of the Antipholus twins.','EGEON|Egeon')
C('adriana','Adriana','major','Antipholus of Ephesus’s wife and Luciana’s sister.','ADRIANA|Adriana')
C('luciana','Luciana','major','Adriana’s unmarried sister.','LUCIANA|Luciana')
C('solinus','Solinus','supporting','The Duke of Ephesus.','DUKE|Solinus')
C('egeon-wife','Egeon’s wife','supporting','The mother of Egeon’s twin sons, separated from him in the shipwreck.','',snapshots=[dict(after=[11,119],name='Emilia',body='Egeon’s wife and the twins’ mother, now identified as the abbess.')])
C('abbess','The abbess','supporting','The woman who heads the religious house in Ephesus.','ABBESS|Abbess|abbess|Emilia',snapshots=[dict(after=[11,119],name='Emilia, the abbess',body='The abbess of Ephesus, Egeon’s wife and the twins’ mother.')])
C('angelo','Angelo','major','The goldsmith making a chain for Antipholus of Ephesus.','ANGELO|Angelo|goldsmith')
C('balthasar','Balthasar','supporting','The merchant accompanying Antipholus of Ephesus to dinner.','BALTHASAR|Balthasar')
C('first-merchant','The first merchant','supporting','The merchant who knows Antipholus of Syracuse and warns him about the city’s laws.','','unnamed-person')
C('second-merchant','The second merchant','supporting','The merchant to whom Angelo owes money.','','unnamed-person')
C('courtesan','The courtesan','supporting','The courtesan at the Porpentine, an acquaintance of Antipholus of Ephesus.','COURTESAN|Courtesan','unnamed-person')
C('luce','Luce','supporting','A maid in Adriana’s household who speaks from inside the house.','LUCE|Luce')
C('nell','Nell','supporting','The kitchen maid promised to Dromio of Ephesus, also jokingly called Dowsabel.','Nell|Dowsabel')
C('pinch','Doctor Pinch','supporting','The schoolmaster called in as an exorcist.','PINCH|Doctor Pinch|Pinch')
C('jailer','Egeon’s jailer','supporting','The jailer charged with holding Egeon.','JAILER|Jailer','unnamed-person')
C('officer','The arresting officer','supporting','The officer enforcing the debt claims involving Angelo and Antipholus of Ephesus.','OFFICER','unnamed-person')
C('messenger','Adriana’s messenger','supporting','A servant from Adriana’s household who brings her news.','MESSENGER|Messenger','unnamed-person')
C('headsman','The headsman','supporting','The executioner attending Egeon.','Headsman','unnamed-person')
C('ducal-officers','The duke’s officers and attendants','supporting','The officials and attendants accompanying the Duke of Ephesus.','Officers|Attendants','group')
C('pinch-assistants','Pinch’s assistants','supporting','The helpers brought in to restrain the men Pinch is treating.','Assistants','group')
for id,name,body,aliases in [
 ('menaphon','Duke Menaphon','Solinus’s uncle, the warrior who brought Antipholus of Ephesus to the city.','Duke Menaphon|Menaphon'),
 ('syracuse-duke','The Duke of Syracuse','The ruler whose treatment of Ephesian merchants Solinus describes.',''),
 ('factor','Egeon’s factor','Egeon’s commercial agent at Epidamnum.',''),
 ('dromio-mother','The Dromios’ mother','The poor woman who gave birth to the twin servants at the same inn as Egeon’s sons.',''),
 ('saddler','The saddler','The tradesman paid for Adriana’s riding equipment.','saddler'),
 ('innkeeper','The Centaur’s innkeeper','The host at the inn where Antipholus of Syracuse is staying.',''),
 ('tailor','The tailor','The tradesman who takes Antipholus of Syracuse’s measurements.','tailor'),
 ('rope-maker','The rope-maker','The tradesman from whom Dromio of Ephesus buys a rope.','rope-maker|ropemaker')]:C(id,name,'reference',body,aliases)
for name in ['Maud','Bridget','Marian','Cicely','Gillian','Ginn']:
 C(name.lower(),name,'reference',f'One of the women Dromio of Ephesus calls for at his master’s door.',name)
C('sailors','The ship’s sailors','reference','The crew in Egeon’s account of the family’s voyage.','','group')
C('corinth-fishermen','The Corinthian fishermen','reference','The fishermen involved in the separation of Egeon’s family.','fishermen of Corinth','group')
C('epidamnum-men','The men of Epidamnum','reference','The men whom the abbess recalls from the shipwreck.','men of Epidamnum','group')
C('rescuing-crew','Egeon’s rescuers','reference','The crew of the ship that takes Egeon and the children with him aboard.','','group')
for id,name,body,aliases,kind in [
 ('god','God','The deity invoked in the play’s prayers and exclamations.','God','deity'),
 ('gods','The gods','The divine powers invoked by Egeon.','gods','group'),
 ('fortune','Fortune','Chance imagined as a power dividing Egeon’s family.','Fortune','personification'),
 ('time','Father Time','Time personified in the servants’ jokes.','Father Time','personification'),
 ('noah','Noah','The biblical figure associated with the great flood.','Noah','religious-figure'),
 ('adam','Adam','The first man in Genesis, invoked in Dromio’s joke about the officer’s leather clothes.','','religious-figure'),
 ('prodigal','The Prodigal Son','The returning son welcomed with a feast in Jesus’ parable.','Prodigal Son|Prodigal','religious-figure'),
 ('satan','Satan','The devil invoked in the characters’ accusations of demonic activity.','Satan','religious-figure'),
 ('circe','Circe','The sorceress of Greek myth whose cup transforms men into animals.','Circe','mythological-figure')]:C(id,name,'reference',body,aliases,kind)
p=Path(__file__).resolve().parent
(p/'editorial.json').write_text(json.dumps(dict(contentVersion='2026-09-10.1',coverage='All eleven scenes: both pairs of twins, family and city participants, minor tradespeople and named allusions; contextual names and the abbess identity gate.',entities=entities),ensure_ascii=False,indent=2)+'\n')
