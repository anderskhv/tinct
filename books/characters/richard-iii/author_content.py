"""Manually authored recognition cards for both full English texts of the play."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

for row in [
('richard-iii','Richard, Duke of Gloucester','The youngest of the three York brothers, and the King’s brother.','KING RICHARD','central'),
('queen-elizabeth','Queen Elizabeth','King Edward the Fourth’s queen, mother of the two young princes.','QUEEN ELIZABETH','major'),
('buckingham','The Duke of Buckingham','A nobleman who becomes Richard’s closest ally.','BUCKINGHAM|Buckingham','major'),
('anne','Lady Anne','Widow of Edward, Prince of Wales, the son of Henry the Sixth.','ANNE|Anne','major'),
('duchess','The Duchess of York','Mother of King Edward, Clarence and Richard.','DUCHESS|Duchess','major'),
('hastings','Lord Hastings','The Lord Chamberlain, lately released from the Tower.','HASTINGS|Hastings','major'),
('stanley','Lord Stanley, Earl of Derby','A nobleman of the court, and Richmond’s stepfather.','STANLEY|Stanley|Derby','major'),
('clarence','George, Duke of Clarence','The middle York brother, sent to the Tower as the play opens.','CLARENCE|Clarence','major'),
('catesby','Sir William Catesby','One of Richard’s agents at court.','CATESBY|Catesby','major'),
('margaret','Queen Margaret','Widow of Henry the Sixth, and the only Lancastrian left at court.','QUEEN MARGARET|Margaret','major'),
('york-boy','Richard, Duke of York','King Edward’s younger son, and the Prince’s brother.','','major'),
('rivers','Earl Rivers','Queen Elizabeth’s brother, whose name is Antony Woodville.','RIVERS|Rivers','major'),
('prince-edward','Prince Edward','King Edward’s elder son and heir.','PRINCE','major'),
('ratcliffe','Sir Richard Ratcliffe','One of Richard’s agents.','RATCLIFFE|Ratcliffe|Sir Richard Ratcliffe','major'),
('richmond','The Earl of Richmond','The Lancastrian claimant, raising an army abroad.','RICHMOND|Richmond','major'),
('edward-iv','King Edward the Fourth','The eldest York brother, and the reigning king.','KING EDWARD','major'),
('brakenbury','Sir Robert Brakenbury','The Lieutenant of the Tower.','BRAKENBURY|Brakenbury'),
('tyrrel','Sir James Tyrrel','The gentleman Richard employs for the murder in the Tower.','TYRREL|Tyrrel'),
('dorset','The Marquess of Dorset','Queen Elizabeth’s son by her first marriage.','DORSET|Dorset'),
('mayor','The Lord Mayor','The Lord Mayor of London.','MAYOR'),
('norfolk','The Duke of Norfolk','A nobleman who commands for Richard in the field.','NORFOLK|Norfolk'),
('grey','Lord Grey','Queen Elizabeth’s son by her first marriage.','GREY'),
('ely','The Bishop of Ely','John Morton, Bishop of Ely.','ELY|Morton'),
('archbishop','The Archbishop of York','The archbishop who attends the Queen and the young Duke of York.','ARCHBISHOP|Archbishop'),
('cardinal','Cardinal Bourchier','The cardinal who fetches the young Duke of York out of sanctuary.','CARDINAL|Bourchier'),
('lovell','Lord Lovell','One of Richard’s followers.','LOVELL|Lovell'),
('blunt','Sir James Blunt','A follower of Richmond’s.','BLUNT|Blunt'),
('christopher','Sir Christopher Urswick','A priest who carries messages between Stanley and Richmond.','CHRISTOPHER|Urswick'),
('surrey','The Earl of Surrey','Norfolk’s son, in the field with Richard.','Surrey'),
('oxford','The Earl of Oxford','A follower of Richmond’s.','Oxford'),
('herbert','Sir Walter Herbert','A follower of Richmond’s.','Herbert'),
('brandon','Sir William Brandon','A follower of Richmond’s, who bears his standard.','Brandon'),
('george-stanley','George Stanley','Lord Stanley’s son, held hostage by Richard.','George Stanley'),
('boy','The Boy','Clarence’s young son, Edward Plantagenet.','BOY'),
('girl','The Girl','Clarence’s young daughter.','GIRL'),
]:add(*row)

for row in [
('first-murderer','The First Murderer','One of the two men Richard sends to the Tower for Clarence.','FIRST MURDERER'),
('second-murderer','The Second Murderer','The other of the two men sent to the Tower, and the one who repents.','SECOND MURDERER'),
('both-murderers','The murderers','The two men sent to the Tower, speaking together.','BOTH MURDERERS'),
('first-citizen','The First Citizen','A London citizen talking over the King’s death.','FIRST CITIZEN'),
('second-citizen','The Second Citizen','A London citizen talking over the King’s death.','SECOND CITIZEN'),
('third-citizen','The Third Citizen','The Londoner who reads the danger in the news most clearly.','THIRD CITIZEN'),
('keeper','The Keeper','The keeper of the Tower who hears Clarence’s dream.','KEEPER'),
('messenger','The messenger','A messenger bringing news to the court and the camps.','MESSENGER'),
('third-messenger','The Third Messenger','A third messenger with news of the risings.','THIRD MESSENGER'),
('second-messenger','The Second Messenger','A second messenger with news of the risings.','SECOND MESSENGER'),
('pursuivant','The Pursuivant','The officer Hastings meets on his way to the Tower.','PURSUIVANT'),
('priest','The Priest','The priest Hastings greets in the street.','PRIEST'),
('sheriff','The Sheriff','The sheriff who leads Buckingham to execution.','SHERIFF'),
('page','The Page','Richard’s page, who names Tyrrel to him.','PAGE'),
('gentleman','The Gentleman','A gentleman attending the corpse of Henry the Sixth.','GENTLEMAN'),
('scrivener','The Scrivener','The clerk who has engrossed the indictment of Hastings.','SCRIVENER'),
('tressel','Tressel','A gentleman attending Lady Anne at the funeral.','Tressel'),
('berkeley','Berkeley','A gentleman attending Lady Anne at the funeral.','Berkeley'),
]:add(*row,kind='unnamed-role')

for row in [
('children','The children of Clarence','Clarence’s son and daughter, speaking together.','CHILDREN|Children'),
('lords','The lords','The lords of the council and the court.','LORDS|Lords'),
('halberds','The halberdiers','The guard carrying the corpse of Henry the Sixth and the prisoners to Pomfret.','Halberds|halberdiers'),
('citizens','The citizens','The citizens of London.','CITIZENS|Citizens'),
('gentlemen','The gentlemen','The gentlemen attending the funeral.','Gentlemen'),
('soldiers','The soldiers','The soldiers of the two armies at Bosworth.','Soldiers'),
('attendants','The attendants','The attendants at court.','Attendants|attendants'),
('bishops','The bishops','The two bishops Richard shows himself between at Baynard’s Castle.','BISHOPS|Bishops'),
('house-of-york','The house of York','The royal house Richard and his brothers belong to.',''),
('house-of-lancaster','The house of Lancaster','The rival royal house, of Henry the Sixth and Richmond.','Lancaster'),
('plantagenets','The Plantagenets','The royal family both houses descend from.','Plantagenets'),
('guilfords','The Guilfords','The Kentish family in arms against Richard.','Guilfords'),
]:add(*row,kind='group')

for row in [
('henry-vi','King Henry the Sixth','The Lancastrian king, whose corpse opens the second scene.','HENRY|Henry|Harry','person'),
('edward-lancaster','Edward, Prince of Wales','Henry the Sixth’s son and Lady Anne’s husband, killed at Tewksbury.','','person'),
('edward-clarence','Edward Plantagenet','Clarence’s young son, called Ned.','Ned Plantagenet','person'),
('richard-york-father','Richard, Duke of York','Father of the three York brothers, killed by Margaret’s party.','','person'),
('richard-ii','King Richard the Second','The king hacked to death at Pomfret, whose castle Rivers names.','Richard the Second','person'),
('warwick','The Earl of Warwick','Lady Anne’s father, who changed sides in the wars.','Warwick','person'),
('rutland','Rutland','The Duchess of York’s young son, killed by Clifford.','Rutland','person'),
('clifford','Clifford','The Lancastrian who killed the boy Rutland.','Clifford','person'),
('jane-shore','Mistress Shore','The King’s mistress, and afterwards Hastings’s.','Mistress Shore|Shore','person'),
('lady-lucy','Lady Lucy','A woman Buckingham says King Edward was contracted to before his marriage.','Lady Lucy','person'),
('bona','Lady Bona','The French king’s sister, whom King Edward was to have married.','Lady Bona|Bona','person'),
('edward-courtney','Sir Edward Courtney','A Devonshire gentleman risen against Richard.','Sir Edward Courtney','person'),
('bishop-exeter','The Bishop of Exeter','Courtney’s brother, risen with him in Devonshire.','','person'),
('gilbert-talbot','Sir Gilbert Talbot','A follower of Richmond’s.','Gilbert Talbot','person'),
('william-stanley','Sir William Stanley','A follower of Richmond’s, and a kinsman of Lord Stanley’s.','William Stanley','person'),
('pembroke','The Earl of Pembroke','A follower of Richmond’s.','Pembroke','person'),
('rice-ap-thomas','Rice ap Thomas','A Welsh captain who joins Richmond.','Rice ap Thomas','person'),
('vaughan','Sir Thomas Vaughan','A follower of the Queen’s kindred, executed at Pomfret.','Vaughan','person'),
('dighton','Dighton','One of the two men Tyrrel suborned for the murder in the Tower.','Dighton','person'),
('forrest','Forrest','One of the two men Tyrrel suborned for the murder in the Tower.','Forrest','person'),
('julius-caesar','Julius Caesar','The Roman said to have built the Tower of London.','Julius Caesar','person'),
('humphrey-hower','Humphrey Hower','A name Richard invents to put his mother off; no such man exists in the play.','Humphrey Hower','unresolved-name'),
('jockey','Jockey of Norfolk','The name in the rhyme left in Norfolk’s tent, meaning Norfolk himself.','Jockey of Norfolk','unresolved-name'),
('dickon','Dickon','The name in the same rhyme, meaning Richard himself.','Dickon','unresolved-name'),
('saint-george','Saint George','The patron saint of England, worn as the Garter badge and cried as a battle word.','Saint George','religious-figure'),
('saint-paul','Saint Paul','The apostle Richard swears by, and the London church that bears his name.','Saint Paul','religious-figure'),
('abraham','Abraham','The patriarch in whose bosom Tyrrel says the princes sleep.','Abraham','religious-figure'),
('jesus','Jesus','Named in the oaths of the play.','Jesu|Jesus','religious-figure'),
('saint-john','Saint John','Named in Hastings’s oath.','Saint John','religious-figure'),
]:add(*row[:4],category='reference',kind=row[4])

# Later cards: the crown, the two marriages, and the fall of Buckingham.
updates={
 'richard-iii':[((15,52),'The youngest York brother, now proclaimed King Richard the Third.')],
 'anne':[((2,91),'Widow of Edward, Prince of Wales, and now wearing Richard of Gloucester’s ring.'),
         ((16,19),'Richard’s wife, going to be crowned his queen.')],
 'buckingham':[((17,76),'Richard’s ally at court, now leaving him and making for Brecknock.')],
 'queen-elizabeth':[((6,17),'Widow of King Edward the Fourth, and mother of the two young princes.')],
 'stanley':[((23,32),'Richmond’s stepfather, holding his men back with his son in Richard’s hands.')],
}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='richard-iii',contentVersion='2026-09-10.1',coverage='All twenty-five scenes in both original-en and modern-en: named cast, speaking and stage roles, the two royal houses and their dead, the followers of both armies, and the religious and historical figures named in the play.',entities=entities),ensure_ascii=False,indent=2)+'\n')
