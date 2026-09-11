"""Manually authored philosophical references, including footnotes."""
import json
from pathlib import Path
entities=[]
for id,name,body,aliases,kind in [
 ('wolff','Christian Wolff','The German philosopher whose general practical philosophy Kant distinguishes from his own project.','Wolf|Wolff','person'),
 ('socrates','Socrates','The ancient Athenian philosopher known for drawing out people’s understanding through questioning.','Socrates','person'),
 ('jesus','Jesus Christ','The central figure of Christianity, here called the Holy One of the Gospels.','Holy One of the Gospels','religious-figure'),
 ('god','God','The divine being considered in Kant’s discussion of moral perfection and the will.','God','religious-figure'),
 ('sulzer','Johann Georg Sulzer','The Swiss philosopher who corresponded with Kant about moral education.','Sulzer','person'),
 ('juno','Juno','The Roman goddess invoked in the mythical image of mistaking a cloud for a goddess.','Juno','cultural-figure'),
 ('hutcheson','Francis Hutcheson','The philosopher associated with the moral-sense theory Kant discusses.','Hutcheson','person')]:entities.append(dict(id=id,name=name,category='reference',body=body,subtitle='',kind=kind,aliases=aliases.split('|'),snapshots=[]))
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='kant-groundwork',contentVersion='2026-09-10.1',coverage='Preface and all three sections in both English editions, including named footnote references. Hypothetical moral agents and philosophical concepts are not invented cast members.',entities=entities),ensure_ascii=False,indent=2)+'\n')
