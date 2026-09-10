"""Story-scoped family, animal roles, homonyms and earned-title bindings."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'jungle-book'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 def add(id,pat):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 def word(id,pat):add(id,r'\b(?:'+pat+r')\b')
 if ch==1:
  if pi==1:word('wolf-cubs','four tumbling, squealing cubs')
  if pi in [27,28,29]:word('mowgli',r'man[’\x27]s cub|naked brown baby')
  if pi==83:word('bagheera-mother','my mother')
 if ch==3:
  word('village-priest','priest')
  if pi==8:word('messua-husband','richest villager')
  if pi==25:
   word('messua-husband',r'Messua[’\x27]s husband');word('potter','potter');word('potter-donkey',r'donkey')
   word('village-headman','head-man|headman');word('village-watchman','watchman');word('village-barber','barber')
 if ch==4:
  # Sea Lion's Neck is a place, not the individual Kotick consults.
  word('sea-lion',r'Sea Lion(?![’\x27]s Neck)')
  if pi==45:word('sea-lion','a sea lion')
  if pi==2:word('narrator','I')
  if pi==63:word('burgomaster-gull','Burgomaster gull')
  if pi==68:word('albatross','albatross')
  if pi in [70,71]:word('old-seal','old, old seal|old seal')
  if pi==74:word('kotick-mate','another seal')
  if pi==92:word('rival-seal','a young seal')
 if ch==5:
  word('teddy-father','big man|Englishman')
  word('darzee-wife',r'Darzee[’\x27]s wife')
  if pi==4:word('teddy','small boy');word('rikki-mother','mother');word('rikki-father','father')
  if pi==5:word('alice','his mother')
  if pi==20:word('darzee-wife','his wife')
 if ch==6:
  word('old-toomai' if pi==7 else 'little-toomai','Toomai of the Elephants')
  if pi==22:word('clerk','clerk')
  if pi==49:word('toomai-mother','his mother');word('toomai-brother','small brother|little brother|younger brother')
  if pi>=84:word('grasshopper','grasshopper|Grasshopper|Least of Little Things')
 if ch==7:
  word('troop-horse','troop-horse|troop horse|Australian horse')
  if pi==2:word('narrator','I')
  if pi==4:word('billy','a mule')
  if 6<=pi<=17:word('camp-camel','camel')
  if pi>=18:word('young-mule','young mule|another battery mule')
  if 18<=pi<140:word('gun-bullocks','gun-bullocks|gun bullocks|bullocks')
  if pi==143:word('asian-chief','Central Asian chief');word('indian-officer','native officer|Indian officer')
  if pi in [145,146,148]:word('indian-officer','officer');word('asian-chief','chief')
 return out
def compile_package():return assemble('jungle-book',bind)
if __name__=='__main__':run('jungle-book','The Jungle Book',bind)
