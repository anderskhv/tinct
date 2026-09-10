"""Manually authored recognition identities with the central revelation gated."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',chapters=None,updates=None):
 e=dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=updates or [])
 if chapters:e['chapters']=chapters
 entities.append(e)
C('utterson','Gabriel John Utterson','central','The London lawyer whose friends include Dr. Jekyll and Dr. Lanyon.','Gabriel John Utterson|Mr. Utterson|Utterson')
C('jekyll','Dr. Henry Jekyll','central','A London doctor and longtime friend of Utterson and Lanyon.','Dr. Henry Jekyll|Henry Jekyll|Harry Jekyll|Dr. Jekyll|Jekyll|Harry|H.J.|Dr. J.',updates=[{'after':[9,32],'body':'Utterson’s doctor friend, who transforms into Edward Hyde.'}])
C('hyde','Edward Hyde','major','The man Enfield identifies as having trampled a young girl in the street.','Edward Hyde|Mr. Hyde|Master Hyde|Hyde',updates=[{'after':[2,0],'body':'The man named as Jekyll’s beneficiary in his will, whose background troubles Utterson.'},{'after':[9,32],'body':'The identity and altered physical form assumed by Henry Jekyll.'}])
C('enfield','Richard Enfield','supporting','Utterson’s distant relative and companion on his Sunday walks.','Richard Enfield|Mr. Enfield|Enfield|Richard')
C('lanyon','Dr. Hastie Lanyon','major','A London doctor and old friend of Utterson and Jekyll.','HASTIE LANYON|Hastie Lanyon|Dr. Lanyon|Lanyon')
C('poole','Poole','major','Dr. Jekyll’s butler.','Poole')
C('carew','Sir Danvers Carew','supporting','An elderly Member of Parliament and a client of Utterson.','Sir Danvers Carew|Danvers Carew|Carew')
C('guest','Mr. Guest','supporting','Utterson’s head clerk, skilled at examining handwriting.','Mr. Guest|Guest')
C('newcomen','Inspector Newcomen','supporting','The Scotland Yard inspector working with Utterson on the Carew case.','Inspector Newcomen|Newcomen')
C('bradshaw','Bradshaw','supporting','A footman in Dr. Jekyll’s household.','Bradshaw')
C('denman','Dr. Denman','reference','The surgeon who previously owned the premises now used by Jekyll.','Dr. Denman|Denman')
C('girl','The girl in Enfield’s account','supporting','The young girl in Enfield’s account of his late-night walk.','','unnamed-person',[1])
C('girl-doctor','The doctor in Enfield’s account','supporting','The doctor with an Edinburgh accent who attends the injured girl.','Sawbones','unnamed-person',[1])
C('girl-father','The girl’s father','reference','The father of the injured girl in Enfield’s account.','','unnamed-person',[1])
C('lanyon-butler','Lanyon’s butler','reference','The servant who admits Utterson to Dr. Lanyon’s house.','','unnamed-person',[2])
C('witness-maid','The maid at the window','supporting','The young maid watching the street from an upstairs window.','','unnamed-person',[4])
C('hyde-housekeeper','Hyde’s housekeeper','supporting','The woman who keeps Hyde’s rooms in Soho.','','unnamed-person',[4])
C('jekyll-housemaid','Jekyll’s housemaid','supporting','The maid among the frightened servants in Dr. Jekyll’s house.','housemaid','unnamed-person',[8])
C('jekyll-cook','Jekyll’s cook','supporting','The cook in Dr. Jekyll’s household.','cook','unnamed-person',[8])
C('knife-boy','The knife-boy','supporting','The young servant in Jekyll’s household whose duties include cleaning cutlery.','knife-boy','unnamed-person',[8])
C('locksmith','The locksmith','reference','The tradesman called to open the locked door to Jekyll’s cabinet.','locksmith','unnamed-person',[9])
C('carpenter','The carpenter','reference','The tradesman assisting with the locked door to Jekyll’s cabinet.','carpenter','unnamed-person',[9])
C('cain','Cain','reference','The biblical brother of Abel, invoked in Utterson’s remark about leaving others to their own choices.','Cain','cultural-figure')
C('satan','Satan','reference','The devil of Christian tradition, used in comparisons with Hyde.','Satan','cultural-figure')
C('damon','Damon','reference','One of a legendary pair of devoted friends, alongside Pythias.','Damon','cultural-figure')
C('pythias','Pythias','reference','One of a legendary pair of devoted friends, alongside Damon.','Pythias','cultural-figure')
C('fell','Dr. Fell','reference','The figure in a familiar rhyme about disliking someone without knowing why.','Dr. Fell','cultural-figure')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='jekyll-and-hyde',contentVersion='2026-09-10.1',coverage='Complete novella in both English editions: named people, identifiable household and incident roles, and named personal allusions. Central identity revelation released only after Lanyon explicitly identifies Hyde.',entities=entities),ensure_ascii=False,indent=2)+'\n')
