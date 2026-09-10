"""Manually authored whole-play cast and reference identities."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',snapshots=None):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=snapshots or []))
C('brutus','Marcus Brutus','central','The Roman senator, Portia’s husband and the play’s central figure.','BRUTUS|Marcus Brutus|Lord Brutus|Brutus')
C('caesar','Julius Caesar','central','The Roman leader whose growing power divides Rome, and Calphurnia’s husband.','CAESAR|Julius Caesar|Caesar|Julius')
C('cassius','Caius Cassius','major','The Roman senator who urges Brutus to resist Caesar’s power.','CASSIUS|Caius Cassius|Cassius')
C('antony','Mark Antony','major','Caesar’s close ally, the Roman commander also called Antonius.','ANTONY|Mark Antony|Antony|Antonius')
C('octavius','Octavius Caesar','major','Caesar’s adopted son and heir, the young Roman also called Octavius.','OCTAVIUS|Octavius Caesar|Octavius')
C('portia','Portia','major','Brutus’s wife and Cato’s daughter.','PORTIA|Portia')
C('casca','Casca','major','The Roman who reports Caesar’s reception by the crowd to Brutus and Cassius.','CASCA|Casca')
for id,name,body,aliases in [
 ('calphurnia','Calphurnia','Caesar’s wife.','CALPHURNIA|Calphurnia'),
 ('decius','Decius Brutus','The Roman associate of Cassius, distinct from Marcus Brutus.','DECIUS|Decius Brutus|Decius'),
 ('metellus','Metellus Cimber','The Roman whose brother Publius Cimber is in exile.','METELLUS|Metellus Cimber|Metellus'),
 ('trebonius','Trebonius','One of the Romans in Cassius’s circle.','TREBONIUS|Trebonius'),
 ('cicero','Cicero','The Roman senator and celebrated orator.','CICERO|Cicero'),
 ('ligarius','Caius Ligarius','The ailing Roman whom Brutus summons to his house.','LIGARIUS|Caius Ligarius|Ligarius'),
 ('artemidorus','Artemidorus','The man carrying a written warning for Caesar.','ARTEMIDORUS|Artemidorus'),
 ('lepidus','Lepidus','The Roman political leader associated with Antony and Octavius.','LEPIDUS|Lepidus'),
 ('publius-senator','Publius','The elderly senator accompanying Caesar to the Capitol.','PUBLIUS'),
 ('popilius','Popilius Lena','The senator who speaks to Cassius on the way to the Capitol.','POPILIUS|Popilius Lena|Popilius'),
 ('marullus','Marullus','One of the tribunes challenging the celebrations in Caesar’s honor.','MARULLUS|Marullus'),
 ('flavius-tribune','Flavius, the tribune','The tribune who confronts the workers celebrating Caesar.','FLAVIUS'),
 ('lucius','Lucius','Brutus’s young servant, who also plays music for him.','LUCIUS|Lucius'),
 ('lucilius','Lucilius','An officer serving Brutus.','LUCILIUS|Lucilius'),
 ('titinius','Titinius','The Roman associated with Cassius and Brutus, also named in Cassius’s recollection of Caesar.','TITINIUS|Titinius'),
 ('messala','Messala','The officer who brings military and political news to Brutus.','MESSALA|Messala'),
 ('pindarus','Pindarus','Cassius’s servant, whom Cassius took captive in Parthia.','PINDARUS|Pindarus'),
 ('cato-young','Young Cato','The younger Marcus Cato, Portia’s brother, fighting with Brutus.','CATO|young Cato|Young Cato'),
 ('flavius-officer','Flavius, the officer','An officer in Brutus’s army, distinct from the opening tribune.',''),
 ('labeo','Labeo','The officer whom Brutus orders to arrange his forces.','Labeo'),
 ('clitus','Clitus','One of Brutus’s attendants on the battlefield.','CLITUS|Clitus'),
 ('dardanius','Dardanius','An attendant accompanying Brutus in the final scene.','DARDANIUS|Dardanius'),
 ('strato','Strato','One of Brutus’s attendants.','STRATO|Strato'),
 ('volumnius','Volumnius','Brutus’s former schoolmate and battlefield companion.','VOLUMNIUS|Volumnius'),
 ('varro','Varro','One of Brutus’s servants, stationed in his tent.','VARRO|Varro'),
 ('claudius','Claudius','The servant who shares the watch in Brutus’s tent with Varro.','CLAUDIUS|Claudius'),
 ('statilius','Statilius','The man sent ahead to signal to Brutus with a torch.','Statilius'),
]:C(id,name,'supporting',body,aliases)
C('cinna-conspirator','Cinna','supporting','The Roman meeting with Cassius and his associates.','')
C('cinna-poet','Cinna the poet','supporting','The poet who shares a name with Cinna in Cassius’s circle.','')
for id,name,body,aliases in [
 ('soothsayer','The Soothsayer','The diviner warning Caesar about the Ides of March.','SOOTHSAYER|Soothsayer'),
 ('carpenter','The carpenter','The worker whom the tribunes question in the opening street scene.','CARPENTER|Carpenter'),
 ('cobbler','The cobbler','The shoemaker who answers the tribunes with puns.','COBBLER|Cobbler'),
 ('caesar-servant','Caesar’s servant','The household servant sent to consult the priests.',''),
 ('antony-servant','Antony’s servant','The messenger sent to speak for Antony before he approaches Brutus.',''),
 ('octavius-servant','Octavius’s servant','The messenger reporting Octavius’s movements to Antony.',''),
 ('camp-poet','The poet in the camp','The poet who interrupts Brutus and Cassius in their tent.','POET|Poet'),
 ('battle-messenger','The battlefield messenger','The messenger reporting the enemy’s advance to Antony and Octavius.','MESSENGER|Messenger'),
 ('soldier-camp-1','The first camp soldier','One of the soldiers calling the halt outside Brutus’s tent.',''),
 ('soldier-camp-2','The second camp soldier','Another soldier passing the order to halt in the camp.',''),
 ('soldier-camp-3','The third camp soldier','The third soldier repeating the command to halt.',''),
 ('soldier-antony-1','Antony’s first soldier','The soldier confronting Lucilius on the battlefield.',''),
 ('soldier-antony-2','Antony’s second soldier','The soldier calling for Antony during Lucilius’s capture.',''),
]:C(id,name,'supporting',body,aliases,'unnamed-person')
for n in range(1,5):C(f'citizen-{n}',f'The { ["first","second","third","fourth"][n-1] } citizen','supporting','One of the numbered voices of the Roman crowd in the Forum and street scenes.','',kind='unnamed-person')
C('citizens','The Roman citizens','supporting','The crowd of ordinary Romans addressed by the political leaders.','CITIZENS|Citizens|citizens','group')
C('ghost','Caesar’s ghost','supporting','The apparition of Caesar that appears to Brutus.','Ghost of Caesar|ghost of Caesar|GHOST|Ghost','mythological-figure')
for id,name,body,aliases,kind in [
 ('pompey','Pompey','The Roman commander and political rival of Caesar recalled by the speakers.','Pompey','person'),
 ('brutus-ancestor','Lucius Junius Brutus','The earlier Brutus associated with expelling Rome’s kings.','','person'),
 ('tarquin','Tarquin','The last king of Rome, recalled in Brutus’s account of his ancestors.','Tarquin','person'),
 ('cato-elder','Marcus Cato','Portia’s father and the father of young Cato, the Roman opponent of Caesar.','Marcus Cato','person'),
 ('publius-cimber','Publius Cimber','Metellus Cimber’s exiled brother.','Publius Cimber','person'),
 ('publius-nephew','Publius, Antony’s nephew','The son of Antony’s sister, named in the discussion of proscription.','','person'),
 ('lepidus-brother','Lepidus’s brother','The brother mentioned in the leaders’ discussion of proscription.','','unnamed-person'),
 ('antony-sister','Antony’s sister','Publius’s mother, named through her relationship to Antony.','','unnamed-person'),
 ('pella','Lucius Pella','The Roman whom Brutus has condemned for taking bribes at Sardis.','Lucius Pella','person'),
 ('epicurus','Epicurus','The Greek philosopher whose teachings Cassius discusses.','Epicurus','person'),
 ('aeneas','Aeneas','The Trojan hero who carries his father from burning Troy.','Aeneas','mythological-figure'),
 ('anchises','Anchises','Aeneas’s father, carried to safety in Cassius’s comparison.','Anchises','mythological-figure'),
 ('ate','Ate','The goddess of ruin invoked in Antony’s prediction of vengeance.','Ate','deity'),
 ('plutus','Plutus','The classical god of wealth, invoked by Cassius.','Plutus','deity'),
 ('fates','The Fates','The divine powers associated with the course and end of human lives.','Fates','group'),
 ('gods','The gods','The divine powers invoked in the Romans’ prayers and oaths.','gods','group'),
 ('omen-slave','The slave in Casca’s report','The man whose burning but unharmed hand Casca describes as an omen.','','unnamed-person'),
 ('omen-women','The women in Casca’s report','The frightened women said by Casca to have seen men walking in flames.','','group'),
]:C(id,name,'reference',body,aliases,kind)
p=Path(__file__).resolve().parent
(p/'editorial.json').write_text(json.dumps(dict(contentVersion='2026-09-10.1',coverage='All eighteen scenes: principal cast, differentiated namesakes, household and military speakers, civic crowd, apparition and named references.',entities=entities),ensure_ascii=False,indent=2)+'\n')
