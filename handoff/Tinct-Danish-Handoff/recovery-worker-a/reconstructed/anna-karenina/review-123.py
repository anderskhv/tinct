# coding: utf-8
import pathlib,json
p=pathlib.Path(__file__).parent
DA={1:[('med sin kone','med Karenins hustru')],3:[('uden varme','modvilligt')],8:[('sit udtryk af viljeløs ofring','sit udtryk som et underkastet offer')],9:[('den uvante tvang','den uvante generthed')],13:[('dig','Dem'),('du','De'),('din','Deres'),('dine','Deres')],17:[('jeg forstår dig','jeg forstår Dem')],23:[('Hvis du nu er overbevist','Hvis du nu bliver overbevist')],30:[('knytte nye bånd','gifte sig igen'),('mens hans tvang gled længere væk','mens han blev stadig mere fri for sin forlegenhed')],31:[('tusind gange','tusinder og atter tusinder af gange'),('blive grebet på fersk gerning og offentligt vanæret','få sin utroskab bevist og blive vanæret')],32:[('ikke ville være god','efter al sandsynlighed ville være dårlig'),('rettens vej','det godes vej')],36:[('Slår nogen dig på din højre kind, så vend ham også den anden til; og vil nogen tage din kjortel fra dig, så lad ham også få kappen','Slår nogen dig på højre kind, så vend den venstre til, og tager nogen din kaftan, så giv ham din skjorte')],40:[('Alexej Alexandrovitj, tro mig, hun værdsætter','Aleksej, tro mig, hun vil værdsætte')]}
# Whole formal letter replacement to avoid pronoun substring collisions.
DA[13]=[]
EN={1:[('discussing with his wife','discussing with Karenin’s wife')],3:[('without warmth','reluctantly')],8:[('its expression of unresisting sacrifice','its expression of a submissive victim')],23:[('If you are now convinced','If you now become convinced')],30:[('form new ties','marry again')],31:[('a thousand times','thousands upon thousands of times'),('be caught in the act and publicly disgraced','have her adultery proved and be disgraced')],32:[('would not be good','would in all likelihood be bad'),('the path of right','the path of goodness')],36:[('Whosoever shall smite thee on thy right cheek, turn to him the other also; and if any man take away thy coat, let him have thy cloak also','To whoever strikes you on the right cheek, offer the left; to whoever takes your caftan, give your shirt')],40:[('Alexey Alexandrovitch, believe me, she values','Alexey, believe me, she will value')],42:[('as a done thing','as an accomplished fact')]}
pack=[]
for lang,changes in [('da',DA),('en',EN)]:
 f=p/f'candidate-anna-karenina-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][122]
 if lang=='da':
  a=c['paragraphs'][12];b=a
  import re
  for x,y in [('dig','Dem'),('du','De'),('dine','Deres'),('din','Deres')]:b=re.sub(r'\b'+x+r'\b',y,b)
  changes[13]=[(a,b)]
  a='Til denne tilfredshed kom det, at en idé netop var slået ned i ham til en gåde, der spillede på hans vellykkede bedrift — en, han ville stille sin kone og sine nærmeste venner, når sagen var afsluttet. Han vendte gåden om i to-tre forskellige former. »Men jeg skal nok finpudse den bedre end som så,«'
  b='Til denne tilfredshed kom tanken om, at han, når sagen var afsluttet, ville stille sin kone og sine nærmeste venner en gåde: »Hvad er forskellen på mig og zaren? Zaren holder vagtparade, og ingen får det bedre af det; jeg ordnede en skilsmisse, og tre fik det bedre … Eller: Hvad er ligheden mellem mig og zaren? Når … Nå, jeg finder på noget bedre,«'
  changes[43]=[(a,b)]
  for sn,t in enumerate(c['paragraphs'],1):
   for a,b in [('Alexej','Aleksej'),('Alexandrovitj','Aleksandrovitj'),('Alexandrovna','Aleksandrovna')]:
    if a in t and sn!=40:changes.setdefault(sn,[]).append((a,b))
 else:
  a='To this satisfaction was added the fact that an idea had just struck him for a riddle turning on his successful achievement — one he would ask his wife and his closest friends once the affair was finished. He turned the riddle over in two or three different forms. "But I\'ll polish it better than that,"'
  b='Added to this satisfaction was the thought that, once the affair was finished, he would ask his wife and close friends a riddle: "What is the difference between me and the tsar? The tsar holds a guard parade, and nobody is any better off; I arranged a divorce, and three people are better off... Or: what is the resemblance between me and the tsar? When... Well, I\'ll think of something better,"'
  changes[43]=[(a,b)]
 for sn,pairs in changes.items():
  for a,b in pairs:
   t=c['paragraphs'][sn-1];assert a in t,(lang,sn,a);c['paragraphs'][sn-1]=t.replace(a,b);r.append(dict(chapter=123,paragraph=sn,before=a,after=b,reason='Russian IV.XXII full comparison: formal letter, wife referent, remarriage, no invented caught-in-act condition, conditional child outcome, source-specific biblical allusion, future appreciation, restored omitted tsar/guard-parade/divorce riddle (razvod pun needs guide).'))
 pack.append((f,d,rf,r))
for f,d,rf,r in pack:f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
