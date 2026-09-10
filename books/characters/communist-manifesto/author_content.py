"""Manually authored identities for the manifesto's named historical references."""
import json
from pathlib import Path
entities=[]
for id,name,body,aliases in [
 ('pius','Pope Pius IX','The pope at the time of the Manifesto’s publication in 1848.','Pope'),
 ('nicholas','Nicholas I','The Russian emperor referred to as the Czar in the opening.','Czar'),
 ('metternich','Klemens von Metternich','The Austrian statesman associated with the conservative European order.','Metternich'),
 ('guizot','François Guizot','The French statesman and historian prominent under the July Monarchy.','Guizot'),
 ('sismondi','Jean Charles Léonard de Sismondi','The economist and critic of industrial capitalism discussed under petty-bourgeois socialism.','Sismondi'),
 ('proudhon','Pierre-Joseph Proudhon','The French socialist thinker whose Philosophy of Poverty is cited.','Proudhon'),
 ('babeuf','Gracchus Babeuf','The French revolutionary associated with radical economic equality.','Babeuf'),
 ('saint-simon','Henri de Saint-Simon','The French social thinker grouped here with Fourier and Owen.','Saint-Simon'),
 ('fourier','Charles Fourier','The French socialist thinker known for planned cooperative communities.','Fourier'),
 ('owen','Robert Owen','The social reformer associated with cooperative communities and improved working conditions.','Owen')]:entities.append(dict(id=id,name=name,category='reference',body=body,subtitle='',kind='person',aliases=aliases.split('|'),snapshots=[]))
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='communist-manifesto',contentVersion='2026-09-10.1',coverage='Opening and all four parts in both English editions: every named individual and the historically identifiable opening Pope/Czar. Political classes, movements and institutions are not invented personal characters.',entities=entities),ensure_ascii=False,indent=2)+'\n')
