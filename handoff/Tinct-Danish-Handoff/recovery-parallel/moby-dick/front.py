from pathlib import Path
import json
from bs4 import BeautifulSoup
def get(p):return json.loads(Path(p).read_text())
def save(p,v):Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
ex=get('source/extracts-15.json')
da=Path('extracts-da.txt').read_text().splitlines();cr=Path('credits-da.txt').read_text().splitlines()
assert len(ex)==len(da)==len(cr)==76
# The US typography places some credits inline. Split those into independent extracts.
qq=[]
for i,(v,k) in enumerate(zip(da,cr),1):
 v=v.replace('\\n','\n')
 if i in (58,65):
  groups=v.split('\n\n')
  for t in groups[:-1]:qq.append(t)
  v=groups[-1]
 if i not in (58,61,62,65,74):v='»'+v+'«'
 if i==58:v='»'+v+'«'
 qq.append(v+' — '+k+'.')
da_front=[
{'title':'Tilegnelse','paragraphs':['Som tegn på min beundring for hans geni tilegner jeg Nathaniel Hawthorne denne bog.']},
{'title':'Etymologi','paragraphs':['(Meddelt af en nu afdød, brystsyg hjælpelærer ved en latinskole.)','Den blege hjælpelærer – luvslidt på frakken, i hjertet, på kroppen og i hjernen. Jeg ser ham for mig endnu. Evig og altid støvede han sine gamle ordbøger og grammatikker af med et besynderligt lommetørklæde, der som til hån var pyntet med alverdens kendte nationers glade flag. Han elskede at støve sine gamle grammatikker af. På en eller anden måde mindede det ham så mildt om hans egen dødelighed.','»Når du tager dig for at belære andre og lære dem, hvad en hvalfisk kaldes på vort mål, og af uvidenhed udelader bogstavet H, som næsten ene og alene bærer ordets betydning, så siger du noget usandt.« — Hackluyt.','»WHALE. * * * Svensk og dansk hval. Dyret har navn efter det runde eller det rullende, thi på dansk betyder hvalt buet eller hvælvet.« — Websters ordbog.','»WHALE. * * * Mere umiddelbart af nederlandsk og tysk wallen, angelsaksisk walw-ian, at rulle, at vælte sig.« — Richardsons ordbog.',*[' — '.join(x) for x in zip('חו ϰητος CETUS WHŒL HVALT WAL HWAL HVALUR WHALE BALEINE BALLENA PEKEE-NUEE-NUEE PEHEE-NUEE-NUEE'.split(),'hebraisk græsk latin angelsaksisk dansk nederlandsk svensk islandsk engelsk fransk spansk fijiansk erromangansk'.split())]]},
{'title':'Uddrag','paragraphs':['(Meddelt af en under-underbibliotekar.)','Man vil se, at denne flittigt gravende bogorm, denne stakkels djævel af en under-underbibliotekar, tydeligvis har været hele jordens vidtløftige vatikaner og gadeboder igennem og samlet op, hvad han hvor som helst i en hvilken som helst bog, hellig eller verdslig, kunne finde af tilfældige hentydninger til hvaler. Man må derfor vogte sig for at tage hele dette hulter til bulter af hvaludsagn, hvor ægte de end er, for hvalkundskabens skinbarlige evangelium. Langtfra! Hvad de gamle forfattere i almindelighed og de her optrædende digtere angår, har uddragene kun den værdi eller fornøjelse at byde, at man i et flygtigt blik fra fuglehøjde kan se, hvad alverdens folk gennem slægt efter slægt, vor egen medregnet, i broget blanding har sagt, tænkt, indbildt sig og sunget om Leviatan.','Så far da vel, stakkels djævel af en under-under, hvis kommentator jeg er. Du hører til den håbløse, gustne slægt, som ingen vin i denne verden nogensinde vil varme, og for hvem selv en bleg sherry ville være for blussende stærk. Og dog holder man somme tider af at sidde hos de arme djævle og selv føle sig som én af dem, drikke sig selskabelig i tårer og sige rent ud, med fulde øjne og tomme glas og i en sorg, der ikke er ganske uden behag: Giv op, I under-undere! Jo mere umage I gør jer for at være verden til behag, jo mere utak skal I høste til evig tid! Gid jeg kunne rømme Hampton Court og Tuilerierne for jer! Men synk gråden og send hjertet helt op til røjlet. Jeres venner, der er gået forud, er i færd med at rydde den syvetagers himmel og jage de længe forkælede Gabriel, Mikael og Rafael på flugt, til I kommer. Her skåler I kun med splintrede hjerter. Dér skal I skåle med glas, der aldrig kan splintres!','Uddrag',*qq]}]
save('front-matter-da.json',da_front)
# Modern English supplies the missing authorial apparatus from the American-text witness.
s=BeautifulSoup(Path('source/gutenberg-15.html').read_bytes(),'html.parser')
p=s.select('h3')[0]
head=[]
for t in p.find_next_siblings():
 if t.name=='h3' and 'EXTRACTS' in t.get_text():break
 if t.name=='h3' or t.name=='hr':continue
 if t.name=='table':
  head.extend(' '.join(tr.get_text(' ',strip=True).split()) for tr in t.select('tr'))
 elif 'right' in t.get('class',[]):head[-1]+=' — '+' '.join(t.get_text(' ',strip=True).split())
 else:head.append(' '.join(t.get_text(' ',strip=True).split()))
p=s.select('h3')[2];intro=[t for t in p.find_next_siblings() if t.name in ('div','p')][:3]
eng_front=[{'title':'Dedication','paragraphs':['In token of my admiration for his genius, this book is inscribed to Nathaniel Hawthorne.']},{'title':'Etymology','paragraphs':head},{'title':'Extracts','paragraphs':[*[' '.join(t.get_text(' ',strip=True).split()) for t in intro],'Extracts',*[e['en']+' — '+e['credit'] for e in ex]]}]
save('front-matter-en.json',eng_front)
