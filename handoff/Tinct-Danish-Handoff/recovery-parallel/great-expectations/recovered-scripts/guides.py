from prepare import *
da=get(src/'onboarding-da.json'); en=get(src/'onboarding-en.json')
en['about']="""On a raw afternoon in the Kent marshes, Pip meets an escaped convict who demands a file and food. Home means his sister, her husband Joe and the forge where Pip hopes to work beside him. At Miss Havisham’s house, Estella takes one look at his coarse hands and thick boots. From then on he sees them whenever he looks at himself. When the London lawyer Jaggers announces that Pip has come into expectations, it takes the boy very little time to decide who must be paying to make a gentleman of him, and why.

Dickens published Great Expectations in weekly instalments in All the Year Round in 1860–61. The reader of one week’s episode had time to share Pip’s guesses before the next arrived. What the boy knows and what the man telling the story now knows are often two quite different things.

This edition follows the published ending at the ruins of Satis House. Dickens also wrote an earlier ending in which Pip and Estella meet elsewhere. Listen to the exact words Pip gives his final impression here."""
da['about']="""En råkold eftermiddag møder Pip en undsluppen straffefange ude i marsken i Kent. Manden forlanger en fil og noget at spise. Hjemme har Pip sin søster, hendes mand Joe og smedjen, hvor han håber en dag at få lov til at arbejde ved Joes side. Så kommer han på besøg hos Miss Havisham. Estella kaster ét blik på hans grove hænder og tykke støvler. Fra nu af er det dét, han ser, når han ser på sig selv. Da advokaten Jaggers kommer fra London og stiller ham en formue i udsigt, er drengen ikke længe om at gætte, hvem der vil bekoste hans opdragelse til gentleman, og hvorfor.

Dickens udgav Store forventninger i ugentlige afsnit i sit tidsskrift All the Year Round i 1860–61. Fra uge til uge havde læserne tid til at gætte med Pip. Det, drengen ved, og det, den voksne fortæller nu ved, er tit to vidt forskellige ting.

Denne udgave følger den trykte slutning, hvor Pip og Estella mødes ved ruinerne af Satis House. I en tidligere slutning, Dickens skrev, finder mødet sted et andet sted. Lyt til de ord, Pip vælger, da han til sidst fortæller, hvad han så."""
en['angleCards'][3]['text']="Someone has been paying for Pip’s new life. I want to keep track of the reasons he thinks he knows who it is, and listen for the moments when someone lets him think so."
en['angleCards'][3]['angleObjective']="I want to examine Pip’s guesses about his benefactor and revisit the clues as he learns more."
da['angleCards'][3]['text']="Der er nogen, der betaler for Pips nye liv. Jeg vil lægge mærke til, hvorfor han føler sig så sikker på, hvem det er, og hvornår andre lader ham blive i troen."
da['angleCards'][3]['angleObjective']="Jeg vil følge Pips gæt om velgøreren og se på sporene igen, efterhånden som han selv får mere at vide."
en['cast'][2]['description']="A wealthy woman who received a letter on her wedding morning while she was still dressing. Her watch and the clock in her room show twenty minutes to nine. At Satis House Pip finds her still in her wedding dress, with the cake on the table. She brings Pip and Estella together and watches the effect with delight. Her desire to be loved sits uneasily beside the lessons she gives her ward."
da['cast'][2]['description']="En velhavende kvinde, der fik et brev på sin bryllupsmorgen, mens hun endnu var ved at klæde sig på. Hendes ur og uret i værelset viser tyve minutter i ni. Da Pip kommer på Satis House, har hun stadig brudekjolen på, og kagen står på bordet. Hun fører Pip og Estella sammen og nyder at iagttage virkningen. Selv længes hun efter den hengivenhed, hun har lært sin plejedatter at afvise."
en['cast'][3]['description']="The escaped convict Pip meets in the churchyard, hungry, frightened and wearing an iron on his leg. He orders the boy to bring him a file and food. Pip returns with both, including a pork pie taken from home. The memory of that meal stays with Magwitch long after he leaves the marshes."
da['cast'][3]['description']="Den undslupne straffefange, Pip møder på kirkegården, sulten og bange og med jern om benet. Han befaler drengen at komme med en fil og noget at spise. Pip kommer tilbage med begge dele, blandt andet en flæskepostej, han har taget derhjemme. Det måltid husker Magwitch længe efter, at han har forladt marsken."
en['cast'][4]['description']="Pip’s brother-in-law, a big, gentle blacksmith who has largely missed out on schooling. He and Pip quietly look out for one another in Mrs. Joe’s kitchen. In London their old ease deserts them. When Pip falls ill there, Joe comes to nurse him, without a word of reproach."
da['cast'][4]['description']="Pips svoger, en stor, mild smed, der næsten ingen skolegang har fået. Han og Pip holder i al stilhed hånden over hinanden i Mrs. Joes køkken. Da de ses i London, har de pludselig svært ved at tale sammen. Da Pip bliver syg dér, kommer Joe og plejer ham uden et ord til bebrejdelse."
en['cast'][5]['description']="Pip’s London roommate, first glimpsed as the pale young gentleman in Miss Havisham’s garden. He has little money and grand ideas about trade. His friendship with Pip brings them both into the firm of Clarriker and Co. Only many years later, when Pip himself becomes a partner, does Clarriker let Herbert in on Pip’s part in financing his career."
da['cast'][5]['description']="Pips bofælle i London er den blege unge gentleman, han først mødte i Miss Havishams have. Herbert har få penge og store planer om at gøre forretning. Venskabet med Pip fører dem begge til firmaet Clarriker og Co. Først da Pip selv bliver kompagnon mange år senere, røber Clarriker for Herbert, hvilken andel Pip havde i at hjælpe ham i gang."
en['whyItMatters'][0]['body']="Pip can recall the precise instant when he began to be ashamed of Joe. He can also recall the kindness that made that shame so painful to live with. Dickens gives both memories to the same speaker. The boy has a strong sense of how things look. The man who remembers him knows what those looks cost."
da['whyItMatters'][0]['body']="Pip kan huske det øjeblik, da han begyndte at skamme sig over Joe. Han husker også den godhed, der gjorde skammen så svær at leve med. Dickens giver begge minder til den samme stemme. Drengen har blik for, hvordan tingene tager sig ud. Den voksne mand husker, hvad det blik kom til at koste."
for guide,ver,lang in [(da,'modern-da','da'),(en,'original-en','en')]:
 guide['openingText']=get((p if lang=='da' else src)/(ver+'.json'))['chapters'][0]['paragraphs'][0]
 put(p/('onboarding-'+lang+'.json'),guide)
for lang in ['da','en']:
 g=get(src/f'primer-{lang}.json')
 if lang=='da':
  g['structure'][1]['text']=g['structure'][1]['text'].replace('En apanage','Et fast underhold')
  g['notice'][0]['why']="Se på Pips hænder med Estellas øjne, og se så på Jaggers, der vasker klienterne af sig, hver gang han forlader retten. Hvad er det ved et menneskes arbejde, man kan få øje på, selv når dagens arbejde er gjort?"
  g['notice'][0]['passages'][0]['quote']='Og så grove hænder, han har!'
 else:
  g['notice'][0]['why']="Look at Pip’s hands through Estella’s eyes, then watch Jaggers washing the clients off his hands after a day in court. What traces of a person’s work remain visible once the work is done?"
 e=get((p/'modern-da.json') if lang=='da' else (src/'original-en.json'))
 for x in g['notice']:
  for a in x.get('passages',[]):assert a['quote'] in e['chapters'][a['chapterNumber']-1]['paragraphs'][a['paragraphIndex']]
 put(p/f'primer-{lang}.json',g)
def delta(a,b,path=()):
 if isinstance(a,dict):
  for k in a:yield from delta(a[k],b[k],path+(k,))
 elif isinstance(a,list):
  for i,t in enumerate(a):yield from delta(t,b[i],path+(i,))
 elif a!=b:yield dict(path=list(path),before=a,after=b)
put(p/'guide-changes.json',{f:list(delta(get(src/f),get(p/f))) for f in ('primer-en.json','primer-da.json','onboarding-da.json','onboarding-en.json')})
