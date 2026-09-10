"""Reviewed paragraph scopes protect returns, imposture and shared titles."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'candide'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 # In these paragraphs the name labels an unexposed impersonation, not the real woman.
 if ch==22 and 74<=pi<=79:out=[m for m in out if m[2]!='cunegonde']
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch<=4 or (ch,pi)==(24,13):add('baron',r'\bBaron(?: of)?(?: Thunder-ten-Tronckh)?\b')
 elif ch>=14:add('young-baron',r'\bBaron\b')
 if (ch,pi)==(1,2):
  add('young-baron',r'(?<=Baron[’\x27]s )son');add('baroness',r'\b(?:lady|wife)\b')
 if ch==14 and pi>=28:add('young-baron',r'\bCommandant\b')
 if (ch,pi)==(1,6):add('paquette',r'chamber-maid|chambermaid')
 if ch==24:add('giroflee',r'\bTheatin(?:e)?\b')
 if ch in [13,19,22]:add('governor',r'\bGovernor\b')
 if ch==18:add('eldorado-king',r'\bKing\b|\bMajesty\b')
 if ch==26 and pi==27:add('augustus',r'King of Poland')
 if ch==26 and pi==29:add('stanislaus',r'King of Poland')
 if ch==25 and pi==26:add('sin',r'\bSin\b');add('death',r'\bDeath\b')
 # Exact paragraph-specific references. Generic role words outside these scopes stay unbound.
 specs=[
 (1,[0],'candide-mother',r'Baron[’\x27]s sister'),(1,[0],'candide-father',r'(?:good, honest|kind and honest) gentleman'),(1,[1],'curate',r'curate'),
 (2,[0],'recruiters',r'Two men dressed in blue|two men dressed in blue'),(2,[11,17,18],'bulgarian-king',r'King of the Bulgarians'),(2,[18],'abare-king',r'King of the Abares|King of the Abarians'),(2,[18],'army-surgeon',r'surgeon'),
 (3,[4,5,6,7,8,9,10],'orator',r'orator|preacher'),(3,[10],'orator-wife',r'wife'),
 (4,[13],'grey-confessor',r'Grey Friar|Franciscan friar'),(24,[13],'grey-confessor',r'Grey Friar|Franciscan friar'),
 (4,[13],'countess',r'countess'),(4,[13],'cavalry-captain',r'cavalry captain'),(4,[13],'chain-marchioness',r'marchioness'),(4,[13],'page',r'\bpage\b'),(4,[13],'chain-jesuit',r'Jesuit'),(4,[13],'columbus-companion',r'one of the companions|one(?= of Christopher Columbus)'),
 (5,list(range(20)),'sailor',r'\bsailor\b'),(5,[14,19],'familiar',r'Familiar'),(5,[19],'familiar-footman',r'footman'),
 (6,[1],'biscayan',r'Biscayner|Biscayan'),(8,[7],'biscayan',r'Biscayner|Biscayan'),(6,[1],'godmother',r'godmother'),(8,[7],'godmother',r'godmother'),(6,[1],'portuguese-prisoners',r'two Portuguese'),(8,[7],'portuguese-prisoners',r'two Jews'),
 (8,[0],'bulgarian-soldier',r'tall Bulgarian'),(8,[0,1,2,3,5,6,7,8],'bulgarian-captain',r'\bcaptain\b'),
 (10,[1,2,3,4],'friar-thief',r'Grey Friar|Franciscan friar'),(13,[8],'friar-thief',r'Grey Friar|Franciscan friar|\bFriar\b|\bfriar\b'),(10,[6],'prior',r'Benedictine prior'),
 (11,[1],'prince-mistress',r'old marchioness|older marchioness'),(11,[1,3,5],'corsair',r'corsair captain|corsair|\bcaptain\b'),(12,[1,3,5,6,7,9],'eunuch',r'eunuch'),
 (12,[7,9,10],'dey',r'\bDey\b'),(12,[10,11],'aga',r'\bAga\b'),(12,[12,14],'azof-imam',r'Iman|Imam|imam'),(12,[15],'french-surgeon',r'one of them|a very clever one'),(12,[16],'boyar',r'Boyard|Boyar'),
 (13,[7],'alcalde',r'Alcalde|alcalde'),(14,[10,11,12,13],'sergeant',r'sergeant'),(15,[0],'jesuit-general',r'Father-General|Father General'),(28,[1],'jesuit-general',r'General of my Order'),
 (16,list(range(24)),'oreillons',r'Oreillons'),(16,[0,1,2,3,4,5,6,7,8],'girls',r'two girls'),(16,[0,1,2,3,4,5,6,7,8],'monkeys',r'two monkeys'),
 (17,[9,11,13],'schoolchildren',r'\bchildren\b'),(17,[11,13],'schoolmaster',r'schoolmaster|\bmaster\b'),(17,[18,21],'landlord',r'landlord|innkeeper'),(18,[0],'landlord',r'landlord|innkeeper'),(18,list(range(23)),'elder',r'old man'),
 (19,[3,4,5,6,7,8,9,10,11],'enslaved-man',r'\bnegro\b|\bBlack man\b|\bblack man\b'),(19,[7],'enslaved-mother',r'mother'),(19,[12,13,14],'spanish-captain',r'Spanish sea-captain|Spanish sea captain|Spaniard'),(19,[30,31],'dutch-magistrate',r'Dutch magistrate|magistrate'),
 (19,[36],'martin-wife',r'\bwife\b'),(19,[36],'martin-son',r'\bson\b'),(19,[36],'martin-daughter',r'\bdaughter\b'),(19,[36],'daughter-lover',r'Portuguese'),
 (22,[3],'paris-doctors',r'two physicians'),(22,[3,5],'devotees',r'devotees|devout women'),(22,[5],'parson',r'parson|\bpriest\b'),(22,[7],'critic',r'One of these critics|one of these critics|One of the critics'),(22,[14],'clairon',r'actress'),(22,[32],'marquise-daughter',r'\bdaughter\b'),(22,[32],'banker',r'\bbanker\b'),
 (22,[41,44,48,53],'scholar',r'man of taste|\bscholar\b'),(22,[86],'impostor',r'\bcheat\b|\bswindler\b'),(22,[76,78],'impostor-maid',r'servant-maid|\bmaid\b'),(22,list(range(80,96)),'officer',r'\bofficer\b|man with the ivory baton'),(22,[88,94,95],'officer-brother',r'\bbrother\b|\bNorman\b'),
 (23,[4,6],'byng',r'fine man|\bAdmiral\b|\badmiral\b'),(23,[7],'byng',r'Admiral|admiral'),(23,[8,9],'french-admiral',r'French Admiral|French admiral'),(23,[9],'byng',r'English Admiral|English admiral'),(23,[11,12],'dutch-skipper',r'Dutch skipper|\bskipper\b'),
 (24,[13],'paquette-surgeon',r'surgeon|\bdoctor\b'),(24,[13],'surgeon-wife',r'\bwife\b'),(24,[13],'paquette-judge',r'\bjudge\b'),(24,[21],'giroflee-brother',r'elder brother'),(25,[1,2],'pococurante-girls',r'two pretty girls|two girls'),
 (27,[17,27,29],'levatine-captain',r'Levantine captain'),(27,[35],'diamond-buyer',r'\bJew\b|Jewish merchant'),(28,[1,3],'ichoglan',r'Ichoglan|ichoglan'),(28,[1],'baron-cadi',r'\bcadi\b'),
 (28,[3],'pangloss-surgeon',r'surgeon|\bbarber\b'),(28,[3],'pangloss-wife',r'\bwife\b'),(28,[3],'knight-malta',r'knight of Malta'),(28,[3],'venetian-merchant',r'Venetian merchant'),(28,[3],'mosque-imam',r'Iman|Imam|imam'),(28,[3],'devotee',r'young devotee'),(28,[3],'pangloss-cadi',r'\bcadi\b'),
 (30,list(range(18,23)),'farmer',r'old man|honest Mussulman|honest Muslim|\bTurk\b'),(30,[20],'farmer-children',r'two sons and two daughters|two daughters'),(30,[18],'viziers',r'two Viziers|two viziers'),(30,[18],'mufti',r'Mufti|mufti')]
 for chapter,paras,id,pat in specs:
  if ch==chapter and pi in paras:add(id,pat)
 return out

def compile_package():return assemble('candide',bind)
if __name__=='__main__':run('candide','Candide',bind)
