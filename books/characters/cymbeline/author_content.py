"""Manually authored recognition cards for both full English texts of the play."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

for row in [
('imogen','Imogen','Cymbeline’s daughter, who has married Posthumus against her father’s will.','IMOGEN|Imogen','central'),
('posthumus','Posthumus Leonatus','A gentleman raised at Cymbeline’s court and married to Imogen; his surname is Leonatus.','LEONATUS POSTHUMUS|POSTHUMUS|Posthumus|LEONATUS|Leonatus|Leo-natus','central'),
('cymbeline','Cymbeline','The King of Britain, Imogen’s father.','CYMBELINE|Cymbeline','major'),
('queen','The Queen','Cymbeline’s second wife and Cloten’s mother; the play gives her no name.','QUEEN|Queen','major'),
('cloten','Cloten','The Queen’s son by an earlier husband, and Cymbeline’s stepson.','CLOTEN|Cloten','major'),
('iachimo','Iachimo','An Italian gentleman at Philario’s house in Rome, brother to the Duke of Siena.','IACHIMO|Iachimo','major'),
('pisanio','Pisanio','Posthumus’s servant, left behind in Britain in Imogen’s household.','PISANIO|Pisanio','major'),
('belarius','Belarius','An old man living in a cave in the Welsh mountains, who goes by the name Morgan.','BELARIUS|Belarius','major'),
('guiderius','Guiderius','A young man raised in the Welsh cave, called Polydore by the old man who brought him up.','GUIDERIUS|Guiderius','major'),
('arviragus','Arviragus','The younger of the two young men raised in the Welsh cave, called Cadwal.','ARVIRAGUS|Arviragus','major'),
('lucius','Caius Lucius','The Roman general sent as ambassador to Britain to demand the tribute.','LUCIUS|Lucius|Caius Lucius','major'),
('philario','Philario','Posthumus’s host in Rome, a friend of his father’s.','PHILARIO|Philario'),
('cornelius','Cornelius','A physician at Cymbeline’s court.','CORNELIUS|Cornelius'),
('soothsayer','The Soothsayer','The Roman soothsayer who reads the omens for Lucius; Lucius calls him Philarmonus.','SOOTHSAYER|Soothsayer|Philarmonus'),
('sicilius','Sicilius Leonatus','Posthumus’s father, who fought beside Cassibelan and died before his son was born; he appears in the prison as an apparition.','SICILIUS|Sicilius'),
('jupiter','Jupiter','The king of the gods, also called Jove and the Thunderer, who descends in the prison.','JUPITER|Jupiter|Jove|Thunderer','major'),
]:add(*row)

for row in [
('first-lord','The First Lord','A lord attending Cloten, who flatters him.','FIRST LORD'),
('second-lord','The Second Lord','A lord attending Cloten, who mocks him in asides.','SECOND LORD'),
('helen','Helen','The lady who attends Imogen; Imogen calls her by name at her bedside.','LADY'),
('queen-lady','The Queen’s lady','One of the ladies gathering flowers for the Queen.',''),
('court-lord','The lord at court','A lord attending Cymbeline as the Roman war begins.',''),
('battle-lord','The lord in the field','The British lord who runs from the battle and meets Posthumus.',''),
('gaoler','The Gaoler','The gaoler who keeps Posthumus in the British prison and talks with him about dying.','FIRST GAOLER|GAOLER'),
('second-gaoler','The Second Gaoler','The second gaoler in the British prison, who calls Posthumus out.','SECOND GAOLER'),
('second-senator','The Second Senator','A Roman senator who assents to the commission.','SECOND SENATOR'),
('attendant','The attendant','An attendant at Cymbeline’s court.','ATTENDANT'),
('captain','The Roman captain','The captain who takes the disguised Imogen into Lucius’s service.','CAPTAIN'),
('first-captain','The First Captain','A British captain in the field after the battle.','FIRST CAPTAIN'),
('second-captain','The Second Captain','A British captain in the field after the battle.','SECOND CAPTAIN'),
('tribune','The Tribune','A Roman tribune ordered to levy troops for Britain.','TRIBUNE'),
('first-senator','The First Senator','A Roman senator who reads out the Senate’s commission.','FIRST SENATOR'),
('court-messenger','The messenger at court','The messenger who announces the Roman ambassadors.',''),
('prison-messenger','The messenger at the prison','The messenger who calls Posthumus before the King.',''),
('first-gentleman','The First Gentleman','A gentleman of Cymbeline’s court who explains the marriage to a newcomer.','FIRST GENTLEMAN'),
('second-gentleman','The Second Gentleman','The gentleman to whom the court’s story is explained.','SECOND GENTLEMAN'),
('frenchman','The Frenchman','A French gentleman at Philario’s house who has met Posthumus before in Orleans.','FRENCHMAN|Frenchman'),
('dutchman','The Dutchman','A Dutch gentleman among the company at Philario’s house.','Dutchman'),
('spaniard','The Spaniard','A Spanish gentleman among the company at Philario’s house.','Spaniard'),
('mother-ghost','Posthumus’s mother','Posthumus’s mother, who died in giving birth to him; she appears in the prison as an apparition.','MOTHER'),
('first-brother','The First Brother','The elder of Posthumus’s two brothers, killed in the wars; he appears in the prison as an apparition.','FIRST BROTHER'),
('second-brother','The Second Brother','The younger of Posthumus’s two brothers, killed in the wars; he appears in the prison as an apparition.','SECOND BROTHER'),
]:add(*row,kind='unnamed-role')

for row in [
('lords','The lords','The lords of Cymbeline’s court.','Lords'),
('ladies','The ladies','The ladies attending the Queen.','Ladies'),
('attendants','The attendants','The attendants at Cymbeline’s court.','Attendants|Attendant'),
('musicians','The musicians','The musicians Cloten brings to play beneath Imogen’s window.','Musicians'),
('senators','The Roman senators','The senators who commission the levy for Britain.','Senators'),
('tribunes','The Roman tribunes','The tribunes given the Senate’s commission.','Tribunes|tribunes'),
('gaolers','The gaolers','The gaolers who bring Posthumus in irons.','Gaolers'),
('captains','The captains','The captains of the two armies.','Captains'),
('leonati','The Leonati','Posthumus’s family, the Leonati of Britain.','Leonati'),
]:add(*row,kind='group')

for row in [
('augustus','Augustus Caesar','The Roman emperor who demands the tribute from Britain.','Augustus','person'),
('julius-caesar','Julius Caesar','The Roman general who conquered Britain in Cassibelan’s time.','','person'),
('cassibelan','Cassibelan','The British king who resisted Julius Caesar; Cymbeline’s uncle.','Cassibelan','person'),
('tenantius','Tenantius','The British king from whom Sicilius had his titles; Cymbeline’s father.','Tenantius','person'),
('mulmutius','Mulmutius','The ancestor who ordained Britain’s laws and first wore the golden crown.','Mulmutius','person'),
('lud','Lud','The British king whose town the play calls Lud’s Town.','Lud','person'),
('euriphile','Euriphile','The nurse who stole Cymbeline’s sons and whom the boys take for their mother.','Euriphile','person'),
('dorothy','Dorothy','One of Imogen’s women, named once when Imogen sends word to her.','Dorothy','person'),
('siena','The Duke of Siena','Iachimo’s brother, named only as the leader whose men serve under Lucius.','','person'),
('richard-du-champ','Richard du Champ','A name Imogen invents on the spot for the master she claims to have lost; no such man exists in the play.','Richard du Champ','unresolved-name'),
('cleopatra','Cleopatra','The Egyptian queen worked into the tapestry in Imogen’s bedchamber, meeting Antony on the Cydnus.','Cleopatra','person'),
('tarquin','Tarquin','The Roman who crept upon the sleeping Lucrece, whom Iachimo names as he steps from the trunk.','Tarquin','person'),
('sinon','Sinon','The Greek whose false weeping opened Troy to the wooden horse.','Sinon','literary-figure'),
('aeneas','Aeneas','The Trojan whose faithlessness to Dido made honest men doubted.','Æneas|Aeneas','literary-figure'),
('hecuba','Hecuba','The queen of Troy, whose curses on the Greeks Imogen calls down on Pisanio.','Hecuba','literary-figure'),
('thersites','Thersites','The most contemptible of the Greeks at Troy, whose dead body Guiderius says is as good as Ajax’s.','Thersites','literary-figure'),
('ajax','Ajax','The great Greek warrior at Troy, set against Thersites in Guiderius’s comparison.','Ajax','literary-figure'),
('hercules','Hercules','The strongest of the Greek heroes, who could not knock brains out of a head that had none.','Hercules','mythological-figure'),
('philomel','Philomel','The woman of the Ovid story Imogen has been reading, turned into a nightingale.','Philomel','mythological-figure'),
('tereus','Tereus','The king of the same story, who violated Philomel.','Tereus','mythological-figure'),
('diana','Diana','The chaste goddess and huntress, whose bathing is carved on Imogen’s chimneypiece.','Diana|Dian','mythological-figure'),
('juno','Juno','The queen of the gods.','Juno','mythological-figure'),
('venus','Venus','The goddess of love, also called Cytherea.','Venus|Cytherea','mythological-figure'),
('minerva','Minerva','The goddess of wisdom, set beside Venus in Iachimo’s praise.','Minerva','mythological-figure'),
('lucina','Lucina','The goddess of childbirth, who failed Posthumus’s mother.','Lucina','mythological-figure'),
('mars','Mars','The god of war.','Mars','mythological-figure'),
('saturn','Saturn','The cold planet-god, set against the fire of Iachimo’s account.','Saturn','mythological-figure'),
('neptune','Neptune','The god of the sea, whose park Britain is called.','Neptune','mythological-figure'),
('phoebus','Phoebus','The sun god, whose horses drink at the springs in the song.','Phoebus','mythological-figure'),
('cupid','Cupid','The god of love.','Cupid|Cupids','mythological-figure'),
('titan','Titan','The sun, under his other name.','Titan','mythological-figure'),
]:add(*row[:4],category='reference',kind=row[4])

# Later cards. The two great concealments in the play are released where the
# reader — not the court — is let into them.
updates={
 'imogen':[((16,38),'Cymbeline’s daughter, leaving Britain in a boy’s clothes at Pisanio’s advice.'),
           ((19,18),'Cymbeline’s daughter, travelling as a boy under the name Fidele.'),
           ((29,90),'Cymbeline’s daughter, known again at her father’s court.')],
 'belarius':[((15,11),'The banished lord Belarius, who stole Cymbeline’s two sons in revenge and has raised them in Wales under the name Morgan.')],
 'guiderius':[((15,11),'Cymbeline’s elder son, stolen in infancy and raised in Wales as Polydore.')],
 'arviragus':[((15,11),'Cymbeline’s younger son, stolen in infancy and raised in Wales as Cadwal.')],
 'posthumus':[((25,1),'Imogen’s husband, come back to Britain in the Roman army but meaning to fight for Britain as a peasant.'),
              ((27,19),'Imogen’s husband, giving himself out as a Roman so as to be taken prisoner.')],
}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='cymbeline',contentVersion='2026-09-10.1',coverage='All twenty-nine scenes in both original-en and modern-en: named cast, speaking and stage roles, scene-local lords, ladies and messengers, the British and Roman figures of the tribute argument, and the classical figures named in the play.',entities=entities),ensure_ascii=False,indent=2)+'\n')
