"""Manually authored recognition cards for both full English texts of the play."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

# Principals and named speaking cast. Aliases are case-sensitive; the original's
# abbreviated italic cues are added per edition by the builder, not here.
for row in [
('duke','The Duke of Vienna','The ruler of Vienna, who puts his authority into Angelo’s hands as the play opens.','DUKE|Duke|duke|Lodowick','central'),
('angelo','Angelo','A magistrate of strict reputation, left as the Duke’s deputy to govern Vienna.','ANGELO|Angelo|Deputy|deputy','central'),
('isabella','Isabella','Claudio’s sister, a novice entering the sisterhood of Saint Clare; she has not yet taken her vows.','ISABELLA|Isabella|Isabel','central'),
('claudio','Claudio','A young gentleman of Vienna, Isabella’s brother, arrested for getting Juliet with child.','CLAUDIO|Claudio','major'),
('lucio','Lucio','A gentleman of Vienna and a friend of Claudio’s, at home in the city’s brothels.','LUCIO|Lucio','major'),
('escalus','Escalus','An experienced counsellor of Vienna, placed second to Angelo in the Duke’s absence.','ESCALUS|Escalus','major'),
('mariana','Mariana','The sister of Frederick, a soldier lost at sea.','MARIANA|Mariana','major'),
('provost','The Provost','The officer in charge of the Vienna prison.','PROVOST|Provost|provost','major'),
('pompey','Pompey Bum','Tapster to Mistress Overdone and a bawd in her house.','POMPEY|Pompey|Bum','major'),
('juliet','Juliet','The woman Claudio has got with child.','JULIET|Juliet|Julietta'),
('mistress-overdone','Mistress Overdone','The keeper of a house of prostitution in the Vienna suburbs.','MISTRESS OVERDONE|Mistress Overdone|Overdone'),
('elbow','Elbow','A constable of Vienna, given to mangling the words he reaches for.','ELBOW|Elbow'),
('froth','Master Froth','A gentleman of eighty pounds a year, brought in as a customer of Mistress Overdone’s house.','FROTH|Froth'),
('abhorson','Abhorson','The executioner of the Vienna prison.','ABHORSON|Abhorson'),
('barnardine','Barnardine','A prisoner in the Vienna jail, set to die on the same morning as Claudio.','BARNARDINE|Barnardine'),
('francisca','Francisca','A nun of the sisterhood Isabella is entering.','FRANCISCA|Francisca'),
('friar-thomas','Friar Thomas','The friar from whom the Duke asks a friar’s habit and instruction.','FRIAR THOMAS|Friar Thomas'),
('friar-peter','Friar Peter','A friar of the Duke’s acquaintance, sent for to carry out his instructions.','FRIAR PETER|Friar Peter'),
('varrius','Varrius','A friend who meets the Duke outside the city on his return.','VARRIUS|Varrius'),
]:add(*row)

# Speaking and stage roles named only by function.
for row in [
('first-gentleman','The First Gentleman','One of two gentlemen trading jokes with Lucio in the street.','FIRST GENTLEMAN'),
('second-gentleman','The Second Gentleman','The other of the two gentlemen with Lucio in the street.','SECOND GENTLEMAN'),
('justice','The Justice','A magistrate who sits with Escalus at the hearing.','JUSTICE'),
('angelo-servant','Angelo’s servant','A servant in Angelo’s house who carries word of callers to him.','SERVANT|Servant'),
('messenger','Angelo’s messenger','Angelo’s man, sent to the prison with his sealed order.','MESSENGER|Messenger'),
('boy','The boy','The boy who sings for Mariana.','BOY|Boy'),
]:add(*row,kind='unnamed-role')

for row in [
('officers','The officers','The officers who make the arrests and guard the prisoners.','OFFICERS|Officers'),
('attendants','The attendants','The attendants who wait on the Duke and are sent on his errands.','Attendants|Attendant'),
('lords','The lords','The lords of the Duke’s court.','LORDS|Lords'),
('citizens','The citizens','The citizens who gather at the gate for the Duke’s return.','CITIZENS|Citizens'),
]:add(*row,kind='group')

# People discussed but never present, and cited figures.
for row in [
('frederick','Frederick','Mariana’s brother, a soldier lost at sea with his sister’s dowry aboard.','Frederick','person'),
('ragozine','Ragozine','A pirate who died of a fever in the Vienna prison.','Ragozine','person'),
('kate-keepdown','Mistress Kate Keepdown','A woman Lucio promised to marry after getting her with child.','Mistress Kate Keepdown|Kate Keepdown','person'),
('bridget','Bridget','A woman of Mistress Overdone’s house, named in Lucio’s teasing of Pompey.','Bridget','person'),
('elbow-wife','Mistress Elbow','Elbow’s wife, who is with child; the hearing turns on what happened to her, but she never appears.','Mistress Elbow','person'),
('flavius','Flavius','A man in Vienna whom the Duke calls on first as he prepares to re-enter the city.','Flavius','person'),
('valentius','Valentius','One of the men in Vienna the Duke sends word to before entering.','Valentius','person'),
('rowland','Rowland','One of the men in Vienna the Duke sends word to before entering.','Rowland','person'),
('crassus','Crassus','One of the men in Vienna the Duke sends word to before entering; not the Roman of that name.','Crassus','person'),
('rash','Master Rash','A young man imprisoned over a debt run up on brown paper and old ginger.','Rash','person'),
('caper','Master Caper','A young man imprisoned at the suit of Three-pile the mercer.','Caper','person'),
('three-pile','Master Three-pile','A mercer, and the creditor who has had Caper imprisoned.','Three-pile','person'),
('dizy','Dizy','A young man among the prisoners Pompey recognises from the house he worked in.','Dizy','person'),
('deep-vow','Master Deep-vow','One of the prisoners Pompey recognises as an old customer.','Deep-vow','person'),
('copper-spur','Master Copper-spur','One of the prisoners Pompey recognises as an old customer.','Copper-spur','person'),
('starve-lackey','Master Starve-lackey','A prisoner Pompey names as a rapier and dagger man.','Starve-lackey','person'),
('drop-heir','Drop-heir','A young prisoner who killed Pudding.','Drop-heir','person'),
('pudding','Pudding','The man Drop-heir killed.','Pudding','person'),
('forthlight','Master Forthlight','A prisoner Pompey names as a tilter.','Forthlight','person'),
('shooty','Master Shooty','A prisoner Pompey names as a great traveller.','Shooty','person'),
('half-can','Half-can','A prisoner who stabbed Pots.','Half-can','person'),
('pots','Pots','The man Half-can stabbed.','Pots','person'),
('caesar','Julius Caesar','The Roman general and ruler whose triumphs Escalus and Lucio invoke when teasing Pompey about his name.','Caesar|Cæsar','person'),
('hannibal','Hannibal','The Carthaginian general who marched on Rome; Elbow reaches for “cannibal” and lands on this name instead.','Hannibal','person'),
('pygmalion','Pygmalion','The sculptor of Greek myth whose statue was brought to life as a woman.','Pygmalion','mythological-figure'),
('jove','Jove','The Roman king of the gods, also called Jupiter.','Jove','mythological-figure'),
('iniquity','Iniquity','The Vice of the old morality plays, a stock figure of mischief set against Justice.','Iniquity','literary-figure'),
('saint-clare','Saint Clare','Clare of Assisi, founder of the order of nuns Isabella is entering.','Saint Clare','religious-figure'),
('philip-and-jacob','Saints Philip and Jacob','The apostles Philip and James, whose shared feast day fixes how old the child is.','Philip|Jacob','religious-figure'),
]:add(*row[:4],category='reference',kind=row[4])

# Reference entities with no reliable exact alias; the builder binds them by context.
for row in [
('prioress','The Mother','The superior of the convent Isabella is entering.','unnamed-role'),
('king-of-hungary','The King of Hungary','The king whose war with the dukes the gentlemen joke about; he is never named.','unnamed-role'),
('emperor-of-russia','The Emperor of Russia','The Russian emperor, named only by title in a rumour about where the Duke has gone.','unnamed-role'),
('pope','The Pope','The Pope, named only as “his Holiness” in the errand the disguised Duke claims to be on.','unnamed-role'),
('lucio-child','Lucio’s child','Lucio’s child by Kate Keepdown, a year and a quarter old and kept by Mistress Overdone.','unnamed-role'),
('claudio-father','The father of Claudio and Isabella','Their late father, remembered by Escalus as a noble man and by Isabella at his grave.','unnamed-role'),
('froth-father','Froth’s father','Froth’s father, who died at Hallowmas and left him his eighty pounds a year.','unnamed-role'),
]:add(row[0],row[1],row[2],'',category='reference',kind=row[3])

# Later cards: only where identity itself changes or confusion is likely.
updates={
 'duke':[((3,7),'Vienna’s Duke, who means to stay in the city disguised as a friar rather than travel abroad.'),
         ((17,42),'Vienna’s Duke, who has moved through the city as a friar under the name Lodowick.')],
 'angelo':[((17,145),'The Duke’s deputy, now married to Mariana.')],
 'mariana':[((9,69),'Angelo’s former betrothed, left by him when her dowry was lost at sea with her brother.'),
            ((17,145),'Angelo’s wife, married to him at the Duke’s order.')],
 'juliet':[((2,79),'Claudio’s partner, bound to him by a private contract but lacking a formal wedding.'),
           ((4,20),'Claudio’s partner; Isabella calls her cousin, though the tie is a schoolgirl adoption rather than blood.')],
 'pompey':[((12,4),'Mistress Overdone’s tapster, now taken on to assist the prison executioner.')],
 'barnardine':[((12,62),'A Bohemian-born prisoner of nine years’ standing, condemned for a murder he does not deny.')],
}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='measure-for-measure',contentVersion='2026-09-10.1',coverage='All seventeen scenes in both original-en and modern-en: named cast, speaking and stage roles, contextual unnamed relatives, prison-list names, and named classical and religious references.',entities=entities),ensure_ascii=False,indent=2)+'\n')
