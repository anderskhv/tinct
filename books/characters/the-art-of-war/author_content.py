"""Manually authored references from the complete Art of War."""
import json
from pathlib import Path
entities=[]
def C(id,name,body,aliases,kind='person'):
 entities.append(dict(id=id,name=name,category='reference',body=body,subtitle='',kind=kind,aliases=aliases,snapshots=[]))
C('sun-tzu','Sun Tzu','The military thinker traditionally credited with The Art of War.',['Sun Tzŭ','Sun Tzu'])
C('yellow-emperor','The Yellow Emperor','Huangdi, a legendary ruler of ancient China.',['Yellow Emperor'])
C('chu','Chu','Chuan Chu, also called Zhuan Zhu: a figure from ancient Wu renowned for daring.',['Chu'])
C('kuei','Kuei','Ts’ao Kuei, also called Cao Gui: an ancient warrior cited as an example of courage.',['Kuei'])
C('yi-zhi','I Chih / Yi Zhi','An adviser associated with the rise of the Yin dynasty, also known as Yi Yin.',['I Chih','Yi Zhi'])
C('lu-ya','Lü Ya / Lu Ya','The adviser also known as Jiang Ziya, associated with the rise of the Zhou dynasty.',['Lü Ya','Lu Ya'])
C('shuai-jan','The shuai-jan','The snake used to illustrate coordinated defense: striking one part brings the others to its aid.',['shuai-jan'],'creature-reference')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='the-art-of-war',contentVersion='2026-09-10.1',coverage='Complete treatise in both English editions: named authorial figure, historical/legendary references and the specifically named illustrative snake. Generic commanders and dynasties excluded.',entities=entities),ensure_ascii=False,indent=2)+'\n')
