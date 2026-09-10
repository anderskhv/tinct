"""Manually authored recognition identities. No model or network calls."""
import json
from pathlib import Path
BASE=Path(__file__).resolve().parent
entities=[]
def C(id,name,role,body,aliases='',kind='person',chapters=None,updates=None,role_after=None):
 e=dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=updates or [])
 if chapters:e['chapters']=chapters
 if role_after:e['roleAfter']=role_after
 entities.append(e);return e
C('macbeth','Macbeth','central','A Scottish nobleman and soldier, known as the Thane of Glamis. Lady Macbeth’s husband.','Macbeth|Thane of Glamis|Glamis',updates=[{'after':[2,18],'body':'A Scottish nobleman holding the titles Thane of Glamis and Thane of Cawdor. Lady Macbeth’s husband.'},{'after':[11,14],'body':'King of Scotland and Lady Macbeth’s husband.'}])
C('lady-macbeth','Lady Macbeth','major','Macbeth’s wife.','Lady Macbeth')
C('banquo','Banquo','major','A Scottish commander and Macbeth’s fellow soldier. Father of Fleance.','Banquo')
C('fleance','Fleance','supporting','Banquo’s young son.','Fleance')
C('macduff','Macduff','major','A Scottish nobleman, the Thane of Fife. Lady Macduff’s husband.','Macduff|Thane of Fife|Duff')
C('duncan','Duncan','major','King of Scotland and father of Malcolm and Donalbain.','Duncan',updates=[{'after':[11,14],'body':'Scotland’s former king; father of Malcolm and Donalbain.'}])
C('malcolm','Malcolm','major','Duncan’s elder son and Donalbain’s brother.','Malcolm|Prince of Cumberland',updates=[{'after':[28,26],'body':'Duncan’s elder son, now acclaimed king of Scotland. Donalbain’s brother.'}])
C('donalbain','Donalbain','supporting','Duncan’s younger son and Malcolm’s brother.','Donalbain')
C('witches','The three witches','major','The three supernatural women, also called the Weird Sisters.','Witches|Weird Sisters|Weird Women','group')
for n in ['First','Second','Third']:
 C(n.lower()+'-witch',n+' Witch','supporting','One of the three witches, distinguished by her numbered speaker label rather than a personal name.',n+' Witch','unnamed-role')
C('ross','Ross','supporting','A Scottish nobleman who carries news between the other characters.','Ross')
C('angus','Angus','supporting','A Scottish nobleman, accompanying Ross when he brings news to Macbeth.','Angus')
C('lennox','Lennox','supporting','A Scottish nobleman at the royal court.','Lennox')
C('menteith','Menteith','supporting','A Scottish nobleman among the commanders opposing Macbeth.','Menteith')
C('caithness','Caithness','supporting','A Scottish nobleman among the commanders opposing Macbeth.','Caithness')
C('lady-macduff','Lady Macduff','supporting','Macduff’s wife and the mother of the boy in the scene at their home.','Lady Macduff')
C('macduff-son','Macduff’s son','supporting','The young son of Macduff and Lady Macduff.','Son','unnamed-person',[19])
C('siward','Siward','supporting','An English commander and the earl of Northumberland. Father of Young Siward.','Siward|Northumberland')
C('young-siward','Young Siward','supporting','Siward’s son, a young soldier in the army opposing Macbeth.','Young Siward')
C('seyton','Seyton','supporting','An attendant serving Macbeth at Dunsinane.','Seyton')
C('porter','The porter','supporting','The gatekeeper at Macbeth’s castle.','Porter','unnamed-person',[10])
C('soldier','The wounded soldier','supporting','The wounded soldier who reports the battle to Duncan. Also addressed as Captain.','Soldier|Captain','unnamed-person',[2])
C('old-man','The old man','supporting','The elderly man speaking with Ross outside Macbeth’s castle.','Old Man','unnamed-person',[11])
C('gentlewoman','The gentlewoman','supporting','An attendant to Lady Macbeth.','Gentlewoman|Waiting-Gentlewoman','unnamed-person',[21])
C('scottish-doctor','The Scottish doctor','supporting','The physician attending Lady Macbeth at Dunsinane.','Doctor|Doctor of Physic','unnamed-person',[21,23])
C('english-doctor','The English doctor','supporting','The physician at the English king’s court. A different doctor from the one at Dunsinane.','Doctor','unnamed-person',[20])
C('cawdor','The Thane of Cawdor','supporting','A Scottish nobleman who holds the title Thane of Cawdor.','',updates=[{'after':[2,18],'name':'The former Thane of Cawdor','body':'The Scottish nobleman whose title of Thane of Cawdor is transferred to Macbeth.'}])
C('macdonwald','Macdonwald','reference','A rebel leader fighting against King Duncan.','Macdonwald')
C('sweno','Sweno','reference','The Norwegian king whose army fights Duncan’s forces.','Sweno')
C('sinel','Sinel','reference','Macbeth’s father, from whom he inherited the title Thane of Glamis.','Sinel')
C('edward','King Edward','reference','The English king, Edward the Confessor, at whose court Malcolm finds refuge.','Edward')
C('graymalkin','Graymalkin','reference','The First Witch’s familiar spirit, taking the form of a cat.','Graymalkin|Greymalkin','supernatural-creature')
C('paddock','Paddock','reference','The Second Witch’s familiar spirit, taking the form of a toad.','Paddock','supernatural-creature')
C('harpier','Harpier','reference','The familiar spirit called by the Third Witch. The passage does not describe its form.','Harpier','supernatural-creature')
C('hecate','Hecate','supporting','A goddess associated with witchcraft.','Hecate','cultural-figure',updates=[{'after':[16,2],'body':'The goddess who presides over the witches and their magic.'}],role_after=[16,2])
for id,name,body,aliases in [
 ('bellona','Bellona','The Roman goddess of war.','Bellona'),
 ('neptune','Neptune','The Roman god of the sea.','Neptune'),
 ('belzebub','Belzebub','A name for the devil, invoked in the porter’s joke about keeping the gates of hell.','Belzebub|Beelzebub'),
 ('gorgon','The Gorgon','A monster of Greek mythology whose face turns those who look at it to stone.','Gorgon'),
 ('fortune','Fortune','Luck imagined as a female power favoring one side or another.','Fortune')]:C(id,name,'reference',body,aliases,'cultural-figure')
C('banquo-ghost','Banquo’s ghost','supporting','The apparition of Banquo seen by Macbeth at the banquet.','Ghost of Banquo|Ghost','apparition',[15])
C('armed-head','The armed head','reference','The first apparition called up by the witches: a head wearing armor.','','apparition',[18])
C('bloody-child','The bloody child','reference','The second apparition called up by the witches: a child covered in blood.','','apparition',[18])
C('crowned-child','The crowned child','reference','The third apparition called up by the witches: a crowned child carrying a tree.','','apparition',[18])
C('kings-vision','The eight kings','reference','The line of crowned figures shown to Macbeth by the witches.','eight kings','apparition-group',[18])
C('banquo-vision','The vision of Banquo','reference','The figure of Banquo accompanying the line of kings in the witches’ vision.','','apparition',[18])
for n in ['First','Second','Third']:
 C(n.lower()+'-murderer',n+' Murderer','supporting','One of the men Macbeth engages for a secret task.',n+' Murderer','unnamed-role',[12,14,15])
C('murderers','The murderers','supporting','The men whom Macbeth engages for a secret task.','Murderers|Both Murderers','group',[12,14,15])
C('macduff-murderer','The intruder at Macduff’s home','supporting','One of the men who enter Lady Macduff’s home.','First Murderer','unnamed-role',[19])
C('macduff-murderers','The intruders at Macduff’s home','supporting','The group of men who enter Lady Macduff’s home.','Murderers','group',[19])
C('lord','The Scottish lord','supporting','The unnamed nobleman speaking with Lennox about Scotland.','','unnamed-role',[17])
C('lords','The court lords','supporting','The noblemen gathered at the Scottish court.','Lords','group',[12,15])
for id,name,body,chapter in [
 ('messenger-inverness','The messenger at Inverness','The messenger speaking to Lady Macbeth at Inverness.',5),
 ('messenger-fife','The messenger at Fife','The unnamed messenger who comes to Lady Macduff.',19),
 ('messenger-dunsinane','The lookout at Dunsinane','The lookout who reports to Macbeth at Dunsinane.',25),
 ('servant-torch','The torch-bearing servant','The servant accompanying Macbeth with a torch.',8),
 ('servant-palace','The palace servant','The servant attending Macbeth at the palace.',12),
 ('servant-lady','Lady Macbeth’s servant','The servant attending Lady Macbeth in this scene.',13),
 ('servant-dunsinane','The servant at Dunsinane','The servant who brings Macbeth news of the approaching army.',23)]:C(id,name,'supporting',body,'Messenger' if id.startswith('messenger') else 'Servant','unnamed-role',[chapter])
# The scene has an unnamed nursing child in Lady Macbeth's recollection, not an
# identified living child of the couple; no invented family member is added.
out=dict(schemaVersion=1,bookId='macbeth',language='en',contentVersion='2026-09-10.1',reviewStatus='authoring-agent-reviewed',coverage='All 28 scenes: named cast, speaking minor roles, supernatural figures, named cultural references and relevant groups. Generic crowds, pronouns, places and unnamed hypothetical figures are excluded.',entities=entities)
(BASE/'editorial.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(len(entities),'authored entries')
