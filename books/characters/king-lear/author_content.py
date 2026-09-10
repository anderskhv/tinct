"""Manually authored recognition cards for both full English play texts."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))
for row in [
('lear','King Lear','The aging king of Britain and father of Goneril, Regan and Cordelia; the play’s central character.','LEAR|Lear','central'),
('kent','The Earl of Kent','A nobleman in Lear’s service.','KENT|Kent|Caius','major'),
('gloucester','The Earl of Gloucester','A nobleman at Lear’s court, father of Edgar and Edmund.','GLOUCESTER|Gloucester','major'),
('edmund','Edmund','Gloucester’s younger son, born outside marriage, and Edgar’s half-brother.','EDMUND|Edmund','major'),
('edgar','Edgar','Gloucester’s elder son and heir, Edmund’s half-brother.','EDGAR|Edgar|Turlygod','major'),
('goneril','Goneril','Lear’s eldest daughter and the Duke of Albany’s wife.','GONERIL|Goneril','major'),
('regan','Regan','Lear’s second daughter and the Duke of Cornwall’s wife.','REGAN|Regan','major'),
('cordelia','Cordelia','Lear’s youngest daughter, sister to Goneril and Regan.','CORDELIA|Cordelia','major'),
('albany','The Duke of Albany','Goneril’s husband and Lear’s son-in-law.','ALBANY|Albany','major'),
('cornwall','The Duke of Cornwall','Regan’s husband and Lear’s son-in-law.','CORNWALL|Cornwall','major'),
('france','The King of France','The French king, one of Cordelia’s two suitors.','FRANCE'),
('burgundy','The Duke of Burgundy','One of Cordelia’s two suitors at Lear’s court.','BURGUNDY'),
('fool','Lear’s Fool','Lear’s court jester and companion.','FOOL|Fool','major'),
('oswald','Oswald','Goneril’s steward.','OSWALD|Oswald'),
('curan','Curan','A gentleman of Gloucester’s household.','CURAN|Curan'),
('la-far','Monsieur La Far','The marshal left in command of the French army.','Monsieur La Far|La Far'),
]:add(*row)
for row in [
('edmund-mother','Edmund’s mother','The unnamed woman with whom Gloucester had Edmund.',''),
('edgar-mother','Edgar’s mother','Gloucester’s wife, contrasted with Edmund’s mother in Edmund’s speech.',''),
('knight','Lear’s knight','A knight in Lear’s service.','KNIGHT|Knight'),
('lear-gentleman','The gentleman attending Lear','A gentleman in Lear’s company.',''),
('heath-gentleman','The gentleman on the heath','The gentleman whom Kent meets while searching for Lear.',''),
('cordelia-gentleman','Cordelia’s gentleman','The gentleman attending Cordelia in the French camp.',''),
('final-gentleman','The gentleman with the knife','The messenger who arrives at the British camp carrying a bloody knife.',''),
('old-man','The old man','An elderly tenant who has long served Gloucester and his father.','OLD MAN|Old Man'),
('first-servant','Cornwall’s first servant','A servant who has attended Cornwall since childhood.','FIRST SERVANT'),
('second-servant','Cornwall’s second servant','One of the servants attending Cornwall and Regan.','SECOND SERVANT'),
('third-servant','Cornwall’s third servant','One of the servants attending Cornwall and Regan.','THIRD SERVANT'),
('physician','The physician','The doctor attending Cordelia and caring for Lear.','PHYSICIAN|Physician'),
('cornwall-messenger','The messenger from Cornwall’s household','The messenger bringing Albany news from Cornwall’s household.',''),
('army-messenger','The messenger to Cordelia','The messenger bringing Cordelia news of the British army.',''),
('captain','Edmund’s captain','The officer whom Edmund entrusts with a written order concerning his prisoners.','CAPTAIN'),
('herald','The herald','The herald summoned to announce the challenge at the British camp.','HERALD|Herald'),
('french-officer','Cordelia’s officer','The officer sent out with Cordelia’s orders to search for Lear.',''),
('british-officer','The British officer','An officer serving the British commanders.',''),
]:add(*row,kind='unnamed-role')
add('attendants','Lear’s attendants','The attendants sent on errands while Lear stays in Goneril’s household.','',kind='group')
for row in [
('hecate','Hecate','The classical goddess associated with night and magic.','Hecate','mythological-figure'),
('apollo','Apollo','The classical god associated with light and the sun, also called Phoebus.','Apollo|Phoebus','mythological-figure'),
('jupiter','Jupiter','The Roman king of the gods, also called Jove.','Jupiter|Jove','mythological-figure'),
('juno','Juno','The Roman queen of the gods.','Juno','mythological-figure'),
('ajax','Ajax','The warrior of Trojan legend invoked in Kent’s insult.','Ajax','literary-figure'),
('merlin','Merlin','The magician and prophet of Arthurian legend.','Merlin','literary-figure'),
('cupid','Cupid','The classical god of love.','Cupid','mythological-figure'),
('nature','Nature','Nature personified as the goddess whom Edmund chooses to serve.','','mythological-figure'),
('fortune','Fortune','Fortune personified as a power that raises and lowers people’s circumstances.','Fortune','mythological-figure'),
('gods','The gods','The divine powers invoked by the characters in this ancient British setting.','gods|Gods','group'),
('god','God','The deity invoked in conventional expressions and oaths.','God','religious-figure'),
('tom-bedlam','Tom o’ Bedlam','The stock figure of a wandering mad beggar whom Edmund invokes.','','literary-figure'),
('jug','Jug','The woman addressed in the Fool’s song fragment.','Jug','literary-figure'),
('pillicock','Pillicock','The figure named in Poor Tom’s bawdy rhyme.','','literary-figure'),
('dolphin','Dolphin','The boy addressed in Poor Tom’s song fragment.','Dolphin|Dauphin','literary-figure'),
('withold','Saint Withold','The saint in Poor Tom’s charm against nightmares.','Swithold|Saint Withold','religious-figure'),
('nightmare','The nightmare in the charm','The night spirit confronted by Saint Withold in Poor Tom’s charm.','','mythological-figure'),
('rowland','Child Rowland','The young knight in the tale fragment recited by Poor Tom.','Child Rowland','literary-figure'),
('nero','Nero','The Roman emperor whom Poor Tom imagines fishing in darkness.','Nero','person'),
('bessy','Bessy','The woman addressed in Poor Tom’s song about crossing the stream.','Bessy','literary-figure'),
('turk','The Turk','The stereotyped Turkish ruler invoked in Poor Tom’s boast about women.','','unnamed-role'),
]:add(*row[:4],category='reference',kind=row[4])
for id,name in [('flibbertigibbet','Flibbertigibbet'),('smulkin','Smulkin'),('modo','Modo'),('mahu','Mahu'),('frateretto','Frateretto'),('hoppedance','Hoppedance'),('obidicut','Obidicut'),('hobbididence','Hobbididence')]:
 add(id,name,'One of the fiends named by Edgar while playing Poor Tom.',name,category='reference',kind='mythological-figure')
for id,name in [('trey','Trey'),('blanch','Blanch'),('sweetheart','Sweetheart')]:
 add(id,name,'One of the little dogs Lear imagines barking at him.',name,kind='animal')
updates={
'lear':[((4,0),'The aging king and father of Goneril, Regan and Cordelia.')],
'kent':[((1,58),'Lear’s loyal nobleman, banished for defending Cordelia.'),((4,0),'The banished earl serving Lear in disguise.'),((26,128),'The Earl of Kent, who served Lear in disguise as Caius.')],
'edgar':[((8,1),'Gloucester’s elder son, hiding as the beggar Poor Tom.'),((22,0),'Gloucester’s elder son, now dressed as a peasant after his disguise as Poor Tom.'),((26,75),'Gloucester’s elder son, who has revealed himself after fighting Edmund.')],
'edmund':[((14,7),'Gloucester’s younger son, now given his father’s earldom by Cornwall.')],
'cordelia':[((1,82),'Lear’s youngest daughter, chosen as wife by the King of France.'),((19,0),'Lear’s youngest daughter and the Queen of France.')],
'france':[((1,82),'The French king, who chooses Cordelia despite the loss of her dowry.'),((19,0),'Cordelia’s husband, the King of France.')],
'regan':[((18,23),'Lear’s second daughter and Cornwall’s widow.')],
'gloucester':[((16,61),'Edgar and Edmund’s father, now blinded.')],
}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='king-lear',contentVersion='2026-09-10.1',coverage='All twenty-six scenes in both original-en and modern-en: named cast, speaking roles, contextual unnamed relatives, and named mythical, religious and song references.',entities=entities),ensure_ascii=False,indent=2)+'\n')
