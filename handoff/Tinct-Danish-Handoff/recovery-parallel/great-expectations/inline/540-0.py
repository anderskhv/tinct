from more import *
d=get(p/'modern-da.json')['chapters'];o=get(src/'original-en.json')['chapters'];e=get(p/'modern-en.json')['chapters']
for c,ca in zip(o,d):
 n=c['number']
 for i,(s,t) in enumerate(zip(c['paragraphs'],ca['paragraphs'])):
  b=t
  if re.search('old chap',s,re.I):b=b.replace('gamle dreng','gamle ven').replace('Gamle dreng','Gamle ven')
  if 'Tickler' in s:b=b.replace('Tickler','Kildestokken')
  if b!=t:setedit(n,i,'da',b)
setedit(1,22,'da','»Ja, sir,« sagde jeg. »Ham også. Fordum af dette sogn.«')
setedit(2,0,'da','Min søster, Mrs. Joe Gargery, var mere end tyve år ældre end jeg og stod højt både i sin egen og i naboernes agtelse, fordi hun havde opfostret mig »med egen hånd«. Det udtryk måtte jeg selv finde ud af hvad betød. Og da jeg vidste, at hun havde en hård og tung hånd, som hun jævnligt lagde på både sin mand og mig, gik jeg ud fra, at Joe Gargery og jeg begge var blevet opfostret med egen hånd.')
for n,i in [(2,1),(2,14),(2,58),(4,17),(4,33),(7,3),(7,43),(7,88),(8,11),(8,94),(12,9),(19,65),(58,19)]:
 t=get(src/'wip-da.json')['chapters'][n-1]['paragraphs'][i] if False else d[n-1]['paragraphs'][i]
 new=t.replace('håndkraft','egen hånd').replace('opdraget','opfostret').replace('opdrage','opfostre').replace('opdrog','opfostrede').replace('opdragelse med egen hånd','opfostring med egen hånd').replace('med mine egne hænder','med egen hånd').replace('gamle dreng','gamle ven')
 # Keep the punchline about beatings separate from the feeding/raising idiom.
 if n==8 and i==94:new=new.replace('opfostre mig med slag','opdrage mig med slag')
 if n==4 and i==33:new=new.replace('opfostrelse','opfostring')
 setedit(n,i,'da',new)
setedit(24,40,'da',d[23]['paragraphs'][40].replace('ejendom og transportabel','ejendom, man kan bære med sig').replace('min ledende grundsætning altid','min ledestjerne altid'))
setedit(24,41,'da','Da jeg havde vist denne ledestjerne min ærbødighed, fortsatte han i en venlig tone.')
setedit(24,41,'en','Once I had paid my respects to this guiding light, he went on in a friendly way.')
setedit(39,79,'en',e[38]['paragraphs'][79].replace('This way I held steady on to my object that I registered in my mind to come back one day','This way I kept my mind fixed on coming back one day').replace('And this way I held steady on to my object that I registered in my mind to come back one day','And this way I kept my mind fixed on coming back one day'))
