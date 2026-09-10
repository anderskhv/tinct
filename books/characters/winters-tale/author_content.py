"""Manually authored recognition cards for both full English texts of the play."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

for row in [
('leontes','Leontes','The King of Sicilia, Hermione’s husband and Mamillius’s father.','LEONTES|Leontes','central'),
('hermione','Hermione','Leontes’s queen, Mamillius’s mother, and pregnant as the play opens.','HERMIONE|Hermione','central'),
('polixenes','Polixenes','The King of Bohemia, Leontes’s friend since boyhood and Florizel’s father.','POLIXENES|Polixenes','major'),
('paulina','Paulina','A lady of Hermione’s court and Antigonus’s wife, plain-spoken to the King’s face.','PAULINA|Paulina','major'),
('camillo','Camillo','A Sicilian lord in Leontes’s confidence.','CAMILLO|Camillo','major'),
('perdita','Perdita','Leontes and Hermione’s newborn daughter, whom Antigonus names as he leaves her.','PERDITA|Perdita','major'),
('florizel','Florizel','Polixenes’s son, prince of Bohemia.','FLORIZEL|Florizel','major'),
('autolycus','Autolycus','A pedlar, ballad-seller and pickpocket on the Bohemian roads, once in Prince Florizel’s service.','AUTOLYCUS|Autolycus','major'),
('shepherd','The old Shepherd','The Bohemian shepherd who finds the abandoned child on the shore.','SHEPHERD|Shepherd','major'),
('clown','The Clown','The old Shepherd’s son.','CLOWN|Clown','major'),
('antigonus','Antigonus','A Sicilian lord and Paulina’s husband.','ANTIGONUS|Antigonus','major'),
('mamillius','Mamillius','Leontes and Hermione’s young son, prince of Sicilia.','MAMILLIUS|Mamillius'),
('time','Time','Time as Chorus, who carries the play across the sixteen years between its halves.','TIME|Time, the Chorus','major'),
('archidamus','Archidamus','A Bohemian lord attending Polixenes on his visit to Sicilia.','ARCHIDAMUS|Archidamus'),
('cleomenes','Cleomenes','A Sicilian lord sent with Dion to consult Apollo’s oracle at Delphos.','CLEOMENES|Cleomenes'),
('dion','Dion','A Sicilian lord sent with Cleomenes to consult Apollo’s oracle at Delphos.','DION|Dion'),
('emilia','Emilia','A lady attending Hermione.','EMILIA|Emilia'),
('mopsa','Mopsa','A shepherdess at the sheep-shearing, courted by the Clown.','MOPSA|Mopsa'),
('dorcas','Dorcas','A shepherdess at the sheep-shearing, and Mopsa’s rival for the Clown.','DORCAS|Dorcas'),
]:add(*row)

for row in [
('first-lord','The First Lord','A lord of Leontes’s court in Sicilia.','FIRST LORD'),
('lord','The lord','A lord attending Leontes sixteen years later.','LORD'),
('first-lady','The First Lady','A lady attending Hermione and Mamillius.','FIRST LADY'),
('second-lady','The Second Lady','A lady attending Hermione and Mamillius.','SECOND LADY'),
('first-attendant','The First Attendant','An attendant on Leontes.','FIRST ATTENDANT'),
('officer','The officer of the court','The officer who reads the indictment and the oracle at Hermione’s trial.','OFFICER'),
('gaoler','The Gaoler','The keeper of the prison where Hermione is held.','GAOLER'),
('mariner','The Mariner','The seaman who lands Antigonus on the Bohemian coast.','MARINER'),
('leontes-servant','Leontes’s servant','A servant of Leontes’s household in Sicilia.',''),
('trial-servant','The servant at the trial','The servant who brings Leontes word of his son.',''),
('shepherd-servant','The Shepherd’s servant','The servant who announces the pedlar at the sheep-shearing.',''),
('late-servant','The servant at the Sicilian court','A servant of Leontes’s household sixteen years later.',''),
('first-gentleman','The First Gentleman','A gentleman of the Sicilian court who saw the kings meet.','FIRST GENTLEMAN'),
('second-gentleman','Rogero','A gentleman of the Sicilian court, named Rogero.','SECOND GENTLEMAN|Rogero'),
('third-gentleman','The Third Gentleman','Paulina’s steward, who describes the reunion.','THIRD GENTLEMAN'),
]:add(*row,kind='unnamed-role')

for row in [
('lords','The lords','The lords of the Sicilian and Bohemian courts.','LORDS|Lords'),
('ladies','The ladies','The ladies attending Hermione.','Ladies'),
('officers','The officers','The officers of the court at Hermione’s trial.','Officers'),
('guards','The guards','The guards attending the trial.','Guards'),
('attendants','The attendants','The attendants on the two kings.','Attendants|Attendant'),
('shepherds','The shepherds and shepherdesses','The country people at the sheep-shearing feast.','Shepherds|Shepherdesses'),
('satyrs','The satyrs','The twelve herdsmen who dance a satyrs’ dance at the feast.','Satyrs'),
]:add(*row,kind='group')

for row in [
('emperor-of-russia','The Emperor of Russia','Hermione’s father, whom she calls on at her trial; the play gives him no name.','','person'),
('julio-romano','Julio Romano','The Italian master said to have made the statue of Hermione.','Julio Romano','person'),
('taleporter','Mistress Taleporter','The midwife named as a witness in one of Autolycus’s ballads.','Mistress Taleporter|Taleporter','person'),
('smalus','Smalus','The Libyan king Florizel falsely claims as the father of his bride.','Smalus','person'),
('alexander-the-great','Alexander the Great','The Macedonian king, cited by Cleomenes on leaving a crown to the worthiest.','Great Alexander','person'),
('judas','Judas','The disciple who betrayed Christ, named by Polixenes as the worst company for a name.','Judas','religious-figure'),
('deucalion','Deucalion','The survivor of the flood in Greek myth, a byword for the remotest ancestry.','Deucalion','mythological-figure'),
('apollo','Apollo','The god whose oracle at Delphos answers Leontes.','Apollo','mythological-figure'),
('jove','Jove','The Roman king of the gods, also called Jupiter here.','Jove','mythological-figure'),
('jupiter','Jupiter','Jove under his other name, in Florizel’s list of gods who took animal shapes.','Jupiter','mythological-figure'),
('neptune','Neptune','The god of the sea.','Neptune','mythological-figure'),
('phoebus','Phoebus','The sun god.','Phoebus','mythological-figure'),
('mercury','Mercury','The god of thieves, whom Autolycus claims as his birth-star.','Mercury','mythological-figure'),
('juno','Juno','The queen of the gods, invoked for the whiteness of her hands.','Juno','mythological-figure'),
('cytherea','Cytherea','Venus under her island name, in Perdita’s catalogue of flowers.','Cytherea','mythological-figure'),
('flora','Flora','The goddess of flowers, whom Florizel says Perdita resembles at the feast.','Flora','mythological-figure'),
('proserpina','Proserpina','The goddess carried off by Dis, whose scattered flowers Perdita names.','Proserpina','mythological-figure'),
('dis','Dis','The god of the underworld, who carried Proserpina away in his waggon.','Dis','mythological-figure'),
('fates','The Fates','The powers who spin and cut the thread of a life.','Fates','mythological-figure'),
]:add(*row[:4],category='reference',kind=row[4])

# Later cards: identity changes, assumed names and the two reveals.
updates={
 'camillo':[((2,123),'The Sicilian lord who has fled to Bohemia with Polixenes and entered his service.'),
            ((12,10),'Polixenes’s Bohemian counsellor, at the sheep-shearing in disguise beside his king.')],
 'polixenes':[((12,10),'The King of Bohemia, at his son’s sheep-shearing feast in disguise.')],
 'florizel':[((12,30),'Polixenes’s son, courting Perdita at the feast under the name Doricles.'),
             ((12,212),'Polixenes’s son, escaping Bohemia in the clothes he has taken from Autolycus.')],
 'perdita':[((9,1),'Leontes and Hermione’s lost daughter, grown up in Bohemia and taken for the old Shepherd’s child.'),
            ((14,7),'Leontes and Hermione’s daughter, known now at her father’s court in Sicilia.')],
 'hermione':[((15,33),'Leontes’s queen, alive after sixteen years, coming down from the pedestal where she stood as her own statue.')],
 'shepherd':[((14,30),'The Bohemian shepherd who found the child, made a gentleman at the Sicilian court.')],
 'clown':[((14,30),'The old Shepherd’s son, made a gentleman at the Sicilian court.')],
}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='winters-tale',contentVersion='2026-09-10.1',coverage='All fifteen scenes in both original-en and modern-en: named cast, speaking and stage roles, scene-local servants and lords, and the classical and religious figures named in the play.',entities=entities),ensure_ascii=False,indent=2)+'\n')
