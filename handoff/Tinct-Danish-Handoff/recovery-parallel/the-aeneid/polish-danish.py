from pathlib import Path
import json
root=Path(__file__).parent
log=[]
def fix(book,before,after,reason='Danish phrasing and clarity'):
 p=root/f'{book:02}.draft';s=p.read_text();assert before in s,(book,before);p.write_text(s.replace(before,after));log.append(dict(book=book,before=before,after=after,reason=reason))
fix(1,'Han genkendte sig selv i kamp i grækernes forreste rækker,','Han genkendte sig selv i kamp mod grækernes forreste mænd,','I.488 prevents suggesting Aeneas fought on the Greek side.')
fix(1,'Aeolus','Æolus','Consistent Danish spelling')
fix(4,'De sætter de støvede skarer over bjergene. Men drengen Ascanius\nfryder sig på sin raske hest midt mellem dalene, og snart rider han forbi de ene,\nsnart de andre.','I støvede flokke sætter de over bjergene. Men drengen Ascanius\nfryder sig på sin raske hest midt i dalene og overhaler snart den ene flok,\nsnart den anden.')
fix(4,'Imens begynder himlen at blive uhyggeligt urolig. Det følger brat:\nregn blandet med hagl.','Imens kommer himlen i uhyggeligt oprør. Pludselig følger\nregn blandet med hagl.')
fix(6,'Men den bistre færgemand tager snart de ene, snart de andre med,','Men den bistre færgemand tager nogle med,')
for b in (5,8):fix(b,'Kythereas gudinde','gudinden fra Kythera','Geographic epithet made grammatical')
fix(4,'Kythereas dronning','dronningen fra Kythera','Geographic epithet')
fix(8,'i hænderne','i hænderne') if False else None
fix(8,'allerede afrundet en del af vejen – sådan et som Fader fra hele himlen\nkaster ned på jorden i stort antal – men en del stod endnu og ventede.','halvt færdigt, sådan et som faderen sender i mængde fra himlen\nned over jorden. Resten af arbejdet stod endnu tilbage.')
fix(8,'stålets hårde masse hvæser dybt i ovnens bo og ildens sug pruster hele vejen igennem.','det hårde stål hvæser dybt i ovnen, og ildens sug brøler gennem hulen.')
fix(8,'Der skal gøres våben til en skarp kriger. Nu behøves al jeres kraft,\nnu skal jeres rappe hænder til, nu al den kunst som har herredømme hos jer.','Der skal laves våben til en tapper kriger. Nu behøves al jeres kraft,\njeres hurtige hænder og al den kunst, I mestrer.')
fix(8,'Ryst jeres tøven af jer!« Mere siger han ikke. Alle skød til ved samme tid','Lad tøven fare!« Mere sagde han ikke. Alle tog fat på én gang')
fix(8,'Hulen stønner når ambolte er lagt til rette. Med stor kraft løfter de armene\nmod hinanden i takt og vender massen med deres tænger der bider fast.','Hulen stønner under amboltenes slag. Med stor kraft løfter de armene\npå skift i takt og vender metallet med deres faste tænger.')
fix(8,'Til ham kommer fra hans øverste dørtrin to hunde som løber i forvejen\nog ledsager deres herres skridt. Helten søger til sin gæst Æneas\' logi\nog afkrog, husker hvad han har sagt og den hjælp han lovede.','Fra dørtrinnet følger to hunde deres herre og løber foran ham.\nHan søger til det afsides rum, hvor hans gæst Æneas sover,\nmed tankerne ved deres samtale og den hjælp, han lovede.')
fix(8,'Sides om side','Side om side')
fix(11,'»Nu vender jeg mig til dig, far, og dit alvorlige forslag.','Nu vender jeg mig til dig, far, og dit alvorlige forslag.','Speech continues from preceding slot')
fix(11,'»Han ville svømme over, men kærligheden til spædbarnet holdt ham tilbage.','Han ville svømme over, men kærligheden til spædbarnet holdt ham tilbage.','Diana’s speech continues from preceding slot')
fix(12,'Corænæus','Corynaeus','Consistent with name elsewhere in book')
(root/'DANISH-POLISH.json').write_text(json.dumps(log,ensure_ascii=False,indent=2)+'\n')
print(len(log))
