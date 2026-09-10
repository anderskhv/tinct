"""Names and local epithets in the Hall-based Beowulf sources."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'beowulf'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 # This late source Scyldings is disputed, not an unquestioned Danish binding.
 out=[m for m in out if not(m[2]=='danes' and (ch,pi)==(41,8) and m[3]=='reviewed-name')]
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 add('scyld-son' if ch<=2 else 'beowulf',r'\bBeowulf\b')
 if ch==4 and pi==1:add('beowulf',r'\bliegeman\b|\bretainer\b')
 if ch==6 and pi==2:add('wulfgar',r'proud-mooded hero|proud-spirited warrior|proud-minded hero')
 if ch==4 and pi==2:add('pilot',r'sea-crafty man|seafaring man')
 if ch in [4,5,6,28]:add('coastguard',r'guard of the Scyldings|strand-guard|strand-watchman|coast-guard|coastguard|coast-watchman|coast watchman|shore-guard|shore guard')
 if ch==7 and pi==0:add('beowulf-mother',r'[Oo]ne only daughter|only daughter')
 if ch==12 and pi==5:add('hondscio',r'[Aa] soldier asleep|a soldier in his sleep')
 if ch==14 and pi==6:add('poet',r'[Aa] man of celebrity|[Aa] celebrated man|[Tt]he bard|[Tt]he poet')
 if ch==17 and pi==0:add('hall-singer',r'singer of Hrothgar|bard of Hrothgar|Hrothgar[’\x27]s singer')
 if ch==2 and pi==5:add('creation-singer',r'\bsinger\b')
 if ch==14:add('sigmund-dragon',r'\bdragon\b|\bdrake\b|\bworm\b')
 if ch>=31:add('dragon',r'\b[Dd]ragon\b|\bworm\b|\bfire-drake\b|\bhoard-warden\b|\bhoard-ward\b|ward of the barrow|guardian of the gold-hoard')
 if ch==20 and pi==4:add('aeschere',r'one of the athelings|one of the nobles')
 if ch==17 and pi==8:add('hildeburg-son',r'[Tt]he bairn of her bosom|[Tt]he child of her body|her own son|son of her own body')
 if ch==10:add('unferth-brothers',r'\bbrothers\b')
 if ch==30 and pi==0:
  add('old-heathobard',r'[Aa]n ancient ash-warrior|[Aa]n old spear-warrior|[Aa]n old ash-warrior')
  add('young-heathobard',r'[Tt]hane-champion|young warrior|young champion')
  add('heathobard-father',r'thy father|your father')
  add('danish-attendant',r'noble-born Daneman|noble-born Dane|woman[’\x27]s thane|woman[’\x27]s attendant')
 if ch==31 and pi==8:add('thief',r'Some one of earthmen|Someone of mankind|One of mankind|one of mankind|Some man')
 if ch==32 and pi==0:add('thief',r'\bservant\b')
 if ch==32 and pi==1:add('last-survivor',r'friend-mourning warder|keeper of rings|grieving guardian|keeper of the rings')
 if ch==32 and pi in [4,5]:add('thief-master',r'\bchieftain\b|\bliegelord\b|[Hh]is lord')
 if ch==34 and pi in [2,3]:add('thief',r'\binformer\b|[Cc]aptive|informant')
 if ch==34 and pi==8:
  add('grieving-father',r'hoar-headed hero|gray-haired man|grey-haired man')
  add('hanged-son',r'his son|his young son')
 if ch==40 and pi==0:add('messenger',r'who the ness-cliff did travel|who traveled the headland|who went to the headland|who traveled the ness-cliff')
 if ch==40 and pi==4:add('ongentheow-wife',r'queen-mother|queen mother')
 if ch==41 and pi==8:add('hygelac-daughter',r'one only daughter|only daughter')
 if ch==43 and pi==1:add('mourning-woman',r'much-grieving widow')
 # God titles are distinct from the human Lord of the Scyldings/Weders.
 if (ch,pi) not in [(7,5),(24,4)]:add('god',r'\bLord\b')
 if (ch,pi)==(24,4):add('god',r'\bFather\b')
 if ch in [1,2,3,5,11,17,20,25]:add('god',r'\bFather\b')
 if (ch,pi)!=(41,10):add('god',r'\bWielder\b')
 if (ch,pi) in [(23,11),(37,7),(38,3)]:add('god',r'\bRuler\b')
 add('fate',r'\b(?:Weird|Wyrd|Fate)\b(?!-)')
 return out

def compile_package():return assemble('beowulf',bind)
if __name__=='__main__':run('beowulf','Beowulf',bind)
