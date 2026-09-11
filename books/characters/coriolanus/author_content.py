"""Manually authored recognition cards for both full English texts of the play."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

for row in [
('coriolanus','Caius Martius','A Roman patrician and the city’s foremost soldier, hated by the plebeians for his contempt of them.','CORIOLANUS|Coriolanus|MARTIUS|Caius Martius|Martius|Caius','central'),
('menenius','Menenius Agrippa','An old patrician, a friend to Caius Martius and well liked by the people.','MENENIUS|Menenius Agrippa|Menenius','major'),
('sicinius','Sicinius Velutus','One of the two tribunes newly given to the people.','SICINIUS|Sicinius Velutus|Sicinius|Velutus','major'),
('brutus','Junius Brutus','The other of the two tribunes newly given to the people.','BRUTUS|Junius Brutus|Brutus|Junius','major'),
('cominius','Cominius','The Roman general and consul who commands against the Volsces.','COMINIUS|Cominius','major'),
('volumnia','Volumnia','Caius Martius’s mother, who raised him to the wars.','VOLUMNIA|Volumnia','major'),
('aufidius','Tullus Aufidius','The Volscian general, and Caius Martius’s chief enemy in the field.','AUFIDIUS|Tullus Aufidius|Aufidius|Tullus','major'),
('virgilia','Virgilia','Caius Martius’s wife.','VIRGILIA|Virgilia','major'),
('lartius','Titus Lartius','A Roman general who serves with Cominius against the Volsces.','LARTIUS|Titus Lartius|Lartius'),
('valeria','Valeria','A Roman lady, friend to Virgilia and Volumnia, and sister to Publicola.','VALERIA|Valeria'),
('young-martius','Young Martius','Caius Martius and Virgilia’s young son.','young Martius|Young Martius'),
]:add(*row)

for row in [
('first-citizen','The First Citizen','The plebeian who leads the corn riot and speaks for the crowd.','FIRST CITIZEN'),
('second-citizen','The Second Citizen','A plebeian in the corn riot, readier than the first to hear Menenius out.','SECOND CITIZEN'),
('third-citizen','The Third Citizen','A plebeian who speaks in the market-place when the voices are asked for.','THIRD CITIZEN'),
('fourth-citizen','The Fourth Citizen','A plebeian in the market-place crowd.','FOURTH CITIZEN'),
('citizen','The citizen','A plebeian who speaks alone in the crowd.','CITIZEN'),
('first-senator','The First Senator','A senator of Rome, and in the Volscian scenes a senator of Corioles.','FIRST SENATOR'),
('second-senator','The Second Senator','A second senator speaking in council.','SECOND SENATOR'),
('first-servingman','The First Servingman','A servingman in Aufidius’s house at Antium.','FIRST SERVINGMAN'),
('second-servingman','The Second Servingman','A servingman in Aufidius’s house at Antium.','SECOND SERVINGMAN'),
('third-servingman','The Third Servingman','A servingman in Aufidius’s house at Antium.','THIRD SERVINGMAN'),
('first-watch','The First Watch','A Volscian sentry before the camp, who turns Menenius away.','FIRST WATCH'),
('second-watch','The Second Watch','A Volscian sentry before the camp.','SECOND WATCH'),
('nicanor','Nicanor','The Roman who sells his city’s news to the Volsces.','ROMAN'),
('adrian','Adrian','The Volscian agent who meets Nicanor on the road.','VOLSCE|VOLSCIAN'),
('aedile','The Aedile','The tribunes’ officer, who musters the people for them.','AEDILE'),
('first-soldier','The First Soldier','A soldier in the Roman army before Corioles.','FIRST SOLDIER'),
('soldier','The soldier','A soldier who directs Menenius to Aufidius’s camp.','SOLDIER'),
('lieutenant','The Lieutenant','Aufidius’s lieutenant, uneasy at how far Coriolanus has eclipsed him.','LIEUTENANT'),
('first-officer','The First Officer','An officer laying cushions in the Capitol.','FIRST OFFICER'),
('second-officer','The Second Officer','The other officer laying cushions in the Capitol.','SECOND OFFICER'),
('messenger','The messenger','A messenger carrying news between Rome and the field.','MESSENGER'),
('second-messenger','The Second Messenger','A second messenger arriving with news.','SECOND MESSENGER'),
('first-lord','The First Lord','A lord of Corioles at the last hearing.','FIRST LORD'),
('second-lord','The Second Lord','A lord of Corioles at the last hearing.','SECOND LORD'),
('third-lord','The Third Lord','A lord of Corioles at the last hearing.','THIRD LORD'),
('first-conspirator','The First Conspirator','One of the men Aufidius takes into his plot.','FIRST CONSPIRATOR'),
('second-conspirator','The Second Conspirator','One of the men Aufidius takes into his plot.','SECOND CONSPIRATOR'),
('third-conspirator','The Third Conspirator','One of the men Aufidius takes into his plot.','THIRD CONSPIRATOR'),
('herald','The Herald','The herald who proclaims Coriolanus’s new name in Rome.','HERALD'),
('usher','The Usher','The usher attending Valeria.','Usher'),
('virgilia-gentlewoman','Virgilia’s gentlewoman','The gentlewoman who brings Virgilia word that Valeria has come.',''),
('valeria-gentlewoman','Valeria’s gentlewoman','The gentlewoman who comes in attending Valeria.',''),
]:add(*row,kind='unnamed-role')

for row in [
('plebeians','The plebeians','The common people of Rome.','ALL PLEBEIANS|Plebeians|Pebleians'),
('patricians','The patricians','The noble families of Rome.','Patricians'),
('senators','The senators','The senators of Rome, and of Corioles in the Volscian scenes.','Senators'),
('tribunes','The tribunes','Sicinius and Brutus, the two tribunes of the people, speaking together.','BOTH TRIBUNES|Tribunes'),
('aediles','The aediles','The tribunes’ officers.','Aediles'),
('lictors','The lictors','The officers who go before the consul.','Lictors'),
('citizens','The citizens','The citizens of Rome in the streets and the market-place.','Citizens'),
('soldiers','The soldiers','The soldiers of the Roman and Volscian armies.','Soldiers'),
('conspirators','The conspirators','The men who join Aufidius against Coriolanus.','Conspirators'),
('servingmen','The servingmen','The servingmen of Aufidius’s household.','Servingmen'),
('attendants','The attendants','The attendants at the Roman houses and the Capitol.','Attendants'),
('captains','The captains','The captains of the Roman army.','Captains'),
('guard','The guard','The guard at Aufidius’s camp.','Guard'),
('volsces','The Volsces','The Volscian people, Rome’s enemies in this war.','Volsces|Volscians'),
('antiates','The Antiates','The people of Antium, Aufidius’s city.','Antiates'),
('martians-house','The house of the Martians','The Roman family Caius Martius comes of, which the Senate’s praise traces back to the kings.','Martians'),
]:add(*row,kind='group')

for row in [
('cotus','Cotus','A servingman of Aufidius’s house, called for by name but never brought on.','Cotus','person'),
('publicola','Publicola','Valeria’s brother, named once in Coriolanus’s praise of her.','Publicola','person'),
('ancus-martius','Ancus Martius','A king of Rome of the Martian house, Numa’s daughter’s son.','Ancus Martius','person'),
('numa','Numa','An early king of Rome, grandfather of Ancus Martius.','Numa','person'),
('hostilius','Hostilius','An early king of Rome, who reigned after Ancus Martius.','Hostilius','person'),
('publius','Publius','A Roman of the Martian house who brought the city its water.','Publius','person'),
('quintus','Quintus','A Roman of the Martian house who brought the city its water.','Quintus','person'),
('censorinus','Censorinus','A Roman of the Martian house, twice censor, and surnamed for it.','Censorinus','person'),
('marcus-volscian','Marcus','A Volscian killed in the war, named by his cousin in the crowd at Corioles.','','person'),
('hob-and-dick','Hob and Dick','Two common names Coriolanus throws out for ordinary citizens at large, not two men of the play.','Hob|Dick','unresolved-name'),
('tarquin','Tarquin','The last king of Rome, driven out before the play begins.','Tarquin|Tarquins','person'),
('cato','Cato','The Roman byword for the soldier’s virtues, in Titus Lartius’s praise.','Cato','person'),
('alexander','Alexander','Alexander the Great, in the Third Servingman’s picture of Coriolanus enthroned.','Alexander','person'),
('galen','Galen','The Greek physician, whose authority Menenius mocks.','Galen','person'),
('lycurgus','Lycurgus','The Spartan lawgiver; Menenius mocks the tribunes as so many Lycurguses.','Lycurguses','person'),
('ulysses','Ulysses','The Greek hero of Ithaca, whose wife Penelope is named beside him.','Ulysses','literary-figure'),
('penelope','Penelope','Ulysses’ wife, who unwove her web to put off her suitors.','Penelope','literary-figure'),
('hector','Hector','The great defender of Troy.','Hector','literary-figure'),
('hecuba','Hecuba','Hector’s mother, whose breasts Volumnia says were no lovelier than Hector’s forehead bleeding.','Hecuba','literary-figure'),
('hercules','Hercules','The strongest of the Greek heroes.','Hercules','mythological-figure'),
('deucalion','Deucalion','The survivor of the flood in Greek myth, a byword for the remotest ancestry.','Deucalion','mythological-figure'),
('jupiter','Jupiter','The king of the gods, also called Jove.','Jupiter|Jove','mythological-figure'),
('juno','Juno','The queen of the gods.','Juno','mythological-figure'),
('mars','Mars','The god of war, whom Cominius names as Coriolanus’s measure.','Mars','mythological-figure'),
('neptune','Neptune','The god of the sea.','Neptune','mythological-figure'),
('phoebus','Phoebus','The sun god.','Phoebus','mythological-figure'),
('diana','Diana','The chaste goddess and huntress.','Diana|Dian','mythological-figure'),
('pluto','Pluto','The god of the underworld.','Pluto','mythological-figure'),
('triton','Triton','The sea god who blows the horn; Coriolanus calls Sicinius a Triton of the minnows.','Triton','mythological-figure'),
('hydra','Hydra','The many-headed monster, Coriolanus’s figure for the people.','Hydra','mythological-figure'),
('olympus','Olympus','The mountain of the gods, set against a molehill in Coriolanus’s scorn.','Olympus','mythological-figure'),
]:add(*row[:4],category='reference',kind=row[4])

# Later cards: the name he earns, the sentence that takes Rome from him.
updates={
 'coriolanus':[((9,11),'Caius Martius, given the name Coriolanus by the army for taking the town of Corioles single-handed.'),
               ((16,60),'Caius Martius Coriolanus, banished from Rome by the voices of the people.')],
}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='coriolanus',contentVersion='2026-09-10.1',coverage='All twenty-nine scenes in both original-en and modern-en: named cast, speaking and stage roles, the crowd and army groups, the Martian genealogy of the Senate’s praise, and the classical figures named in the play.',entities=entities),ensure_ascii=False,indent=2)+'\n')
