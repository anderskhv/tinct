# coding: utf-8
import pathlib,json
p=pathlib.Path('/tmp/tinct-da-prep-20261104/brothers-karamazov');f=p/'candidate-brothers-karamazov-modern-en.json';d=json.loads(f.read_text());r=json.loads((p/'ENGLISH-REPAIRS.json').read_text());c=d['chapters'][35]
def fix(n,a,b,why):
 assert a in c['paragraphs'][n-1],(n,a);c['paragraphs'][n-1]=c['paragraphs'][n-1].replace(a,b);r.append(dict(chapter=36,paragraph=n,before=a,after=b,reason=why))
fix(1,'until Trinity Day','until Pentecost, the feast of the Holy Trinity','Russian троицын день in Orthodox context is Pentecost, not Western Trinity Sunday one week later. Verified primary church calendar https://goarchdiocese.ca/holy-pentecost-trinity-sunday/ and https://www.oca.org/orthodoxy/the-orthodox-faith/worship/the-church-year/pentecost-the-descent-of-the-holy-spirit .')
fix(2,c['paragraphs'][1],'Trust what your heart tells you;\nno signs are given from heaven.','Independent translation of two embedded Russian verse lines restores first-line imperative.')
fix(4,c['paragraphs'][3],'Burdened by the weight of the cross,\nthe King of Heaven, in a slave’s form,\nwalked through all of you, my native land,\nbestowing His blessing.','Four-line independent translation of embedded Tyutchev from Russian; preserve cross burden, slave form, homeland and blessing.')
fix(7,'‘Maiden, arise!’','‘Talitha kum!’—‘Little girl, arise!’','Restore Aramaic utterance present in Russian Талифа куми with English gloss.')
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'ENGLISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
g=json.loads((p/'PROGRESS.json').read_text());g['english_repairs']=len(r);(p/'PROGRESS.json').write_text(json.dumps(g,indent=2)+'\n');(p/'CHECKPOINT.txt').write_text(f'Chapters 1–36 reviewed; {g["slots_reviewed"]}/5836 slots; {g["danish_repairs"]} Danish repair entries; {len(r)} English repair entries. Chapters 37–96 unreviewed. Both guides drafted. Native review pending. No releases.\n');print(g)
