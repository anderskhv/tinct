"""Manually authored identities for the complete dialogue."""
import json
from pathlib import Path
entities=[]
def C(id,name,category,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=category,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('socrates','Socrates','central','The Athenian philosopher, imprisoned after his trial and awaiting execution.','Socrates')
C('crito','Crito','major','Socrates’ close friend, visiting him in prison.','Crito')
C('simmias','Simmias','reference','A friend of Socrates from Thebes.','Simmias')
C('cebes','Cebes','reference','A friend of Socrates, mentioned alongside Simmias.','Cebes')
C('homer','Homer','reference','The Greek poet traditionally credited with the Iliad and Odyssey. The dream quotes a line from the Iliad.','Homer')
C('keeper','The prison keeper','supporting','The prison attendant who admits Crito to see Socrates.','','unnamed-person')
C('dream-woman','The woman in the dream','reference','The unnamed woman who addresses Socrates in his dream.','','dream-figure')
C('laws','The Laws of Athens','major','Athens’ laws imagined as speakers in Socrates’ argument, rather than people physically present.','','personification')
C('children','Socrates’ children','reference','Socrates’ children, whose upbringing concerns Crito. They are not named in this dialogue.','','group')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='crito',contentVersion='2026-09-10.1',coverage='Complete dialogue in both English editions: both speakers, all named people, prison keeper, dream woman, Socrates’ children and personified Laws. Hypothetical examples and generic groups excluded.',entities=entities),ensure_ascii=False,indent=2)+'\n')
