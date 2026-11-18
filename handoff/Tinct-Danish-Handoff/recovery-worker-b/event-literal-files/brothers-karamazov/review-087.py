# -*- coding: utf-8 -*-
import json,pathlib
p=pathlib.Path(__file__).parent
changes={
1:[('led af hjernebetændelse','var grebet af sindsforvirring og febervildelser'),('dybt involveret i den anklagedes skæbne','dybt berørt af den tiltaltes skæbne')],
2:[('havde afkortet sit liv','havde gjort en ende på sit liv'),('sin fars hus','sin herres hus')],
3:[('ikke en kyllings mod','lige så lidt mod som en høne'),('en epileptisk kylling','en høne med epilepsi'),('lade mig slippe i live','lade mig slippe i live, så jeg kunne angre')],
4:[('de dygtigste læger','de mest indsigtsfulde psykiatere'),('deres ‚ondskab\'','deres »skyld«')],
5:[('indskrænkede sig','holdt sig')],
7:[('spillede et anfald','foregav et anfald'),('en sådan forfalskning','sådan et skuespil')],
8:[('den ulykkelige tossehoved','den ulykkelige idiot')],
9:[('indbyde til samme foretagende en, der ville være ivrig efter at få den konvolut for sig selv','skaffe sig en rival, som måske selv ville ønske at gå ind og tage konvolutten')],
10:[('mord med tyveri som motiv','rovmord'),('fra den myrdedes','fra den myrdedes')],
11:[('har vi ham faldende ned ad trapperne','falder han om'),('afskærmet af en skærm','bag en skillevæg'),('bag skærmen','bag skillevæggen'),('for at han belejligere kunne','for at han nemmere kunne')],
12:[('fremlægge sådanne forslag','fremsætte sådanne formodninger'),('Jeg vil ikke insistere på det punkt, at','Jeg vil slet ikke gå ind på, hvordan')],
13:[('fantasiens flugter','fantasien')],
14:[('Helt så','Javel'),('ligger til side og spiller et anfald','ligger på siden og foregiver et anfald')],
15:[('spille et anfald','foregive et anfald'),('Jeg vil dog give afkald på det punkt.','Men lad mig give jer ret på det punkt.'),('Lad os antage, at han var med på det, ville det stadig følge','Selv hvis vi antager, at han gik med til det, følger det stadig'),('blot en, der gav efter mod sin vilje af rædsel.','blot en, der af frygt og mod sin vilje lod det ske. Det ville retten jo nødvendigvis kunne skelne mellem.')],
16:[('sin medskyldige','hans medskyldige'),('Smerdjakov antydede aldrig deres medvirken','Smerdjakov antydede aldrig, at de var i ledtog')],
17:[('fremlagde frivilligt','oplyste selv'),('Jeg ødelægger mig selv af egen vilje og lyst','Jeg tilintetgør mig selv af egen vilje og lyst')],
18:[('fremkalde den pinlige scene','genkalde den sørgelige scene'),('af anger. Og først','af anger. For uden samvittighedsnag ville han ikke have givet pengene tilbage. Og først')],
19:[('femprocents-kuponer','obligationer med fem procents rente'),('for at få dem vekslet','for at få dem omsat til kontanter')],
20:[('det anfald af hjernebetændelse','det anfald af delirium'),('rørte sig ikke','forholdt sig i ro')],
21:[('den anklagedes brev, skrevet','den tiltaltes brev til frøken Verkhovtseva, skrevet'),('det gik glat','det skete nøjagtig som skrevet'),('hjertets genstand','hans elskede'),('messingmorterstøderen','messingstøderen')],
23:[('messingmorterstøderen','messingstøderen')],
24:[('til Mokroje for at møde sin første elsker','til Mokroje med sin tidligere, »uomtvistelige« elsker')]
}
changes[10]=[x for x in changes[10] if x[0]!=x[1]]
# Replace tangled subordinate clause as a whole.
changes[12][-1]=('Jeg vil ikke insistere på det punkt, at Smerdjakov næppe kunne have regnet med dette på forhånd og have forudset','Jeg vil slet ikke gå ind på, hvordan Smerdjakov på forhånd skulle have kunnet beregne alt dette og forudse')
english={
1:[('in the grip of brain fever','in the grip of mental derangement and fever')],
2:[('his father’s house','his master’s house')],
11:[('tumbling downstairs','collapsing'),('behind a screen','behind a partition'),('behind the screen','behind the partition')],
18:[('out of remorse. And only yesterday','out of remorse. For without remorse he would not have returned the money. And only yesterday')],
19:[('two five per cent. coupons','two bonds bearing five per cent interest'),('to be exchanged','to be turned into cash')],
21:[('the prisoner’s letter, written','the prisoner’s letter to Miss Verkhovtsev, written'),('it went off without a hitch','it happened exactly as written')],
24:[('to Mokroe to meet her first lover','to Mokroe with her former, “undisputed” lover')]
}
for lang,items in [('da',changes),('en',english)]:
 f=p/f'candidate-brothers-karamazov-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][86]
 for n,pairs in items.items():
  for a,b in pairs:
   t=c['paragraphs'][n-1];assert a in t,(lang,n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=87,paragraph=n,before=a,after=b,reason='Russian XII VIII page88 full source comparison: master not father, securities not interest coupons, partition, omitted explanatory sentence, judgment quotation and modern Danish. Historical medical assertions remain prosecutor claims, not editorial endorsement.'))
 f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
