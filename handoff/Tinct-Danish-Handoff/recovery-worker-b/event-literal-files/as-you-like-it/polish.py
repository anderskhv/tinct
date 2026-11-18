from prep import *
from collections import defaultdict
d=rd('modern-da.json')['chapters'];changes=defaultdict(dict)
def fix(c,i,a,b):
 s=changes[c].get(i,d[c-1]['paragraphs'][i-1]);assert a in s,(c,i,a);changes[c][i]=s.replace(a,b)
for c,i,a,b in [
(1,3,'hvordan jeg skal slippe ud af det med forstanden i behold','hvilken fornuftig vej der er ud af det'),
(2,54,'Tre velvoksne, prægtige unge mænd, et helt dokument i sig selv.','Tre høje, ranke unge mænd der præsenterede sig godt.'),
(2,65,d[1]['paragraphs'][64],'[Fanfare. Hertug Frederick, nogle herremænd, Orlando, Charles og deres følge kommer ind.]'),
(2,94,'                                          [De brydes]',' [De brydes.]'),(4,1,'ACT II. ',''),(11,1,'ACT III. ',''),
(7,19,'hendes banketræ i vasken','hendes banketræ til vasketøjet'),
(10,41,'så hård er ej dit sind','så hårdt er ej dit sind'),(10,41,'Her lever vi glad.','Her lever vi glade.'),
(10,42,'du bitre sky','du hårde himmel'),(12,26,'en klokkefårsvædder','vædderen med klokken'),
(12,32,'Søg den søde rose! Find\nelskovspikken og Rosalind.','Pluk en rose, mærk dens stik.\nSådan stikker Rosalind.'),
(13,34,'gå din vej og tag fred','gå din vej, af sted'),
(15,8,'Naturen laver folk som dig på samlebånd.','Din slags laver naturen i bunkevis.'),
(15,25,'Det går lige op.','Men lad nu det ligge.'),
(16,14,'al min lykke til dig','al lykke følge dig'),
(17,9,'Dens skind om sin krop og på hovedet dens horn.','Dens skind om sin krop og dens horn på sin hat.'),
(18,15,'som har en piges hjerte i din magt og sat det i brand?','der satte ild til hjertet på en pige?'),
(18,38,'udmattet af at die sine unger og sulten','sulten efter at ungerne havde diet'),
(22,18,'Onklen siger han\ner en mægtig troldmand','Onklen er, siger han,\nen mægtig troldmand'),
(22,28,'parreløse par på landet','folk fra landet der vil danne par'),
(22,48,'Jer to slår hjertet ét i brystet på.','I to har jeres hjerter i hinandens bryst.'),
(22,49,'det bånd der deler bord og seng','det bånd der lader to dele bord og seng')]:fix(c,i,a,b)
for i in [11,12,13,14]:
 fix(21,i,'i vårens tid, den skønne ringetid','i forårets tid, når man giver ring')
 fix(21,i,'To kærester elsker den vår.','To kærester elsker forår.')
for c,v in changes.items():save(c,v,len(en[c-1]['paragraphs']))
