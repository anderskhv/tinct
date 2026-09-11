"""Historical references and the explicitly hypothetical deceiver."""
import json
from pathlib import Path
entities=[]
for id,name,body,aliases,kind in [
 ('god','God','The divine creator whose existence and nature Descartes examines.','God|Deity|Creator','religious-figure'),
 ('leo','Pope Leo X','The pope under whom the Lateran Council made the ruling on the soul cited in the dedication.','Leo X','person'),
 ('archimedes','Archimedes','The ancient Greek mathematician, invoked for his geometrical proofs and the image of a fixed point.','Archimedes','person'),
 ('apollonius','Apollonius of Perga','The ancient Greek geometer whose demonstrations Descartes mentions.','Apollonius','person'),
 ('pappus','Pappus of Alexandria','The ancient Greek mathematician named among the masters of geometrical proof.','Pappus','person'),
 ('demon','The malignant demon','The powerful deceiver Descartes imagines as a thought experiment in radical doubt.','','hypothetical-person')]:entities.append(dict(id=id,name=name,category='reference',body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='descartes-meditations',contentVersion='2026-09-10.1',coverage='All nine source units in both English editions, including dedication, preface, synopsis and six meditations. Named references and the distinctive hypothetical deceiver, without invented identities for generic examples or unnamed objectors.',entities=entities),ensure_ascii=False,indent=2)+'\n')
