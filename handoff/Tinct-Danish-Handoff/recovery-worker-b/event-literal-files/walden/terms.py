import json,re
from pathlib import Path
def load(f):return json.loads(Path(f).read_text())
def save(f,d):Path(f).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
d=load('walden-modern-da.partial.json')
sub={
'indiansk mel':'majsmel','indiansk majs':'majs','tønder land':'acres','tønde land':'acre','ferskvandsulke':'dværgmaller','ferskvandsulkene':'dværgmallerne','sølvkarudser':'sølvblanke småkarper','Sølvkarudserne':'De sølvblanke småkarper','en sølvkaruds':'en sølvblank småkarpe','en kvart mile':'en kvart engelsk mil','en halv mile':'en halv engelsk mil','en halv mil':'en halv engelsk mil','en mile':'en engelsk mil','en mil':'en engelsk mil','halvanden mile':'halvanden engelsk mil','halvanden mil':'halvanden engelsk mil','en ottendedel mile':'en ottendedel engelsk mil','en tredjedel mile':'en tredjedel engelsk mil','halv mils':'halv engelsk mils','kvadratmile':'engelsk kvadratmil','en halv snes mil':'en halv snes engelske mil','miles plantning':'engelske mil med bønner','miles':'engelske mil','nogle få mil':'nogle få engelske mil','par mil':'par engelske mil','ti mil':'ti engelske mil','tredive mil':'tredive engelske mil','tyve mil':'tyve engelske mil','fem mil':'fem engelske mil','to mil':'to engelske mil','fire mile':'fire engelske mil','halvtreds mile':'halvtreds engelske mil','ti mile':'ti engelske mil','tusinde mile':'tusinde engelske mil','hundrede mil':'hundrede engelske mil','dusin mil':'dusin engelske mil','de mil af rum':'det antal engelske mil','mile i omkreds':'engelske mil i omkreds','skingrende mil omkring':'skingert milevidt omkring','to og en halv engelsk mil':'to og en halv engelske mil','fiskehøg':'fiskeørn','Højst tolererer den én årlig lommen.':'Højst tåler den en enkelt lom om året.','Det specifikke navn':'Artsnavnet','peppret på siderne':'på siderne oversået','lø d-agtig':'strømskallelignende','noget lød-agtig i sin karakter':'lidt som en strømskalle','rudskaller (_Leuciscus pulchellus_)':'små karpefisk, som her kaldes chivin eller roach (_Leuciscus pulchellus_)','hvidbugede svaler (_Hirundo bicolor_)':'træsvaler (_Hirundo bicolor_)','mudderklirerne (_Totanus macularius_) »teter«':'de plettede mudderklirer (_Totanus macularius_) vipper med halen','en skrig':'en skrig'}
rx=re.compile(r'(?<!\w)(?:'+'|'.join(re.escape(s) for s in sorted(sub,key=len,reverse=True))+r')(?!\w)')
for ci,c in enumerate(d['chapters'],1):
 for j,p in enumerate(c['paragraphs']):
  p=rx.sub(lambda m:sub[m[0]],p)
  if '°' in p and ci in [9,17]: p=re.sub(r'(\d[½¼¾]?°)(?!\s*F)',r'\1 F',p)
  if (ci,j+1)==(5,2):p=p.replace('seksti rods','tres rods (omkring 300 meter)')
  if (ci,j+1)==(1,4):p=p.replace('tres acres','tres acres, godt 24 hektar,')
  if (ci,j+1)==(1,84):p=p.replace('to og en halv acres','to og en halv acres (godt en hektar)')
  if (ci,j+1)==(7,15):p=p.replace('tolv quarts bønner','tolv quarts bønner')
  c['paragraphs'][j]=p
save('walden-modern-da.partial.json',d)
