# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent
changes={1:[('maniaker','monoman'),('han er ved sine fulde fem, og at hvis han ikke havde været det, ville han have båret sig klogere ad','han netop er ved sine fulde fem, og det er det værste: havde han ikke været det, havde han måske båret sig langt klogere ad'),('hans fikse idé om de tre tusind','hans fikse idé om de tre tusind, som hans far angiveligt skyldte ham')],
2:[('strakte hænder ud','rakte hænderne frem'),('Send mig til Sibirien sammen med ham','Send mig i straffearbejde sammen med ham')],
3:[('denne heltinde','denne heltinde — han har påtaget sig at beskrive hele sagen —'),('trolovet','forlovet'),('Hun blev forsigtig og sparede penge','Hun blev beregnende og samlede sig en kapital'),('sarkastisk og fjendsk','spottende og hævngerrig')],
4:[('trolovede','forlovede'),('hans hjertes genstand','den kvinde, han begærede')],
8:[('havde fuld hensigt om','overlagt og bevidst havde besluttet')],
9:[('blev forelagt retten lige før','blev forelagt retten af frøken Verkhovtseva lige før'),('hele mordets faktum var planlagt','hele mordet var planlagt'),('tage konvolutten med pengesedlerne fra under hans pude, så snart Ivan var rejst. ‚Så snart Ivan var taget af sted\'','tage pengene under hans pude, »i konvolutten med det røde bånd, bare Ivan var rejst«. »Bare Ivan var rejst«')],
10:[('formindsker','mindsker'),('en handelsmand','en købmandsmedhjælper'),('I morgen vil jeg forsøge at låne pengene fra alle','I morgen vil jeg bede alle mennesker om tre tusind'),('vil der flyde blod.\'«','vil der flyde blod.\' Igen skrevet i fuldskab og igen udført i ædru tilstand nøjagtig, som det stod skrevet!«')],
11:[('hans rejse til Ljagavyj.','hans rejse til Ljagavyj, alt sammen ud fra sagens dokumenter.'),('og mistænkte hende','og mistænkte hende'),('hjertets genstand','sin elskede'),('og mistænkte hende for at ville gå','og med mistanke om, at hun ville gå'),('baghold i baghaverne','udkigspost bag haverne'),('det mest skønsomme råd','det fornuftigste råd'),('kneipedrukkenskab','druk på kroerne'),('et afløb for jeres turbulente energi, jeres romantiske karakter, jeres tørst efter eventyr','et afløb for Deres ustyrlige kræfter, Deres romantiske sind og Deres eventyrlyst')],
12:[('hendes herskerinde','hans elskede'),('sin tidligere elsker','sin tidligere, »uomtvistelige« elsker'),('sværge og protestere på sin uvidenhed','sværge ved alt helligt på, at hun ingenting vidste'),('ilede af sted i forfølgelse af sin falske elskede','styrtede hovedkulds af sted efter sin troløse elskede')],
13:[('messingmorterstøder','messingstøder'),('mørke og jalousi','dyb nat, mørke og jalousi'),('bekendte at foragte','gav udtryk for foragt for')]
}
changes[11]=[x for x in changes[11] if x[0]!=x[1]]
new6='»I begyndelsen råber vi bare op på kroerne — hele den måned råber vi op. Åh, vi elsker at have folk omkring os og straks fortælle dem alle vores tanker, selv de mest djævelske og farlige. Vi elsker at dele med andre og kræver af en eller anden grund straks deres fulde sympati: de skal leve sig ind i alle vores bekymringer og ængstelser, give os ret og ikke gå imod vores luner. Ellers bliver vi vrede og smadrer hele kroen. [Her fulgte historien om stabskaptajn Snegirjov.] De, som så og hørte den tiltalte den måned, mærkede til sidst, at det måske ikke blot var råb og trusler mod hans far: med sådan et raseri kunne truslerne meget vel blive til handling.«'
for lang,items in [('da',changes),('en',{
1:[('I say he is sane. If he were not, he would have acted more cleverly.','I say he is precisely in his right mind, and that is the worst of it: if he were not, he might have acted much more cleverly.'),('his fixed idea about the three thousand.','his fixed idea about the three thousand his father supposedly owed him.')],
2:[('Send me to Siberia with him!','Send me to penal servitude with him!')],
9:[('laid before the court a moment ago.','laid before the court a moment ago by Miss Verkhovtsev.'),('the envelope of notes from under his pillow, as soon as Ivan had gone. ‘As soon as Ivan had gone away.’','the money from under his pillow, “in the envelope with the red ribbon, if only Ivan had gone.” “If only Ivan had gone.”')],
10:[('Tomorrow I shall try to borrow the money from everyone','Tomorrow I shall ask everyone for three thousand'),('there will be bloodshed.’”','there will be bloodshed.’ Again written drunk and again carried out sober, exactly as written!”')],
12:[('her mistress was at Mokroe with her former lover','his beloved was at Mokroe with her former, “undisputed” lover')]
})]:
 f=p/f'candidate-brothers-karamazov-modern-{lang}.json';d=json.loads(f.read_text());rf=p/('DANISH-REPAIRS.json' if lang=='da' else 'ENGLISH-REPAIRS.json');r=json.loads(rf.read_text());c=d['chapters'][85]
 for n,pairs in items.items():
  for a,b in pairs:
   t=c['paragraphs'][n-1];assert a in t,(lang,n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=86,paragraph=n,before=a,after=b,reason='Full Russian XII VII page87 source comparison: conditional murder-letter quote, red ribbon, penal servitude, omitted sober-execution refrain, formal address and modern Danish.'))
 if lang=='da':
  a=c['paragraphs'][5];c['paragraphs'][5]=new6;r.append(dict(chapter=86,paragraph=6,before=a,after=new6,reason='Restore Russian rhetorical WE, tavern shouting and staff-captain rank.'))
 else:
  a=c['paragraphs'][5];t='“At first we only shout in taverns—we shout all that month. Oh, we love being among people and immediately telling them everything, even our most infernal and dangerous ideas. We love to share with people, and for some reason we demand their fullest sympathy at once: they must enter into all our worries and anxieties, agree with us, and not thwart our whims. Otherwise we get angry and smash up the whole tavern. [Then followed the anecdote about Staff Captain Snegiryov.] Those who saw and heard the prisoner that month finally sensed that there might be more than shouts and threats against his father: in such a frenzy, threats might well turn into deeds.”';c['paragraphs'][5]=t;r.append(dict(chapter=86,paragraph=6,before=a,after=t,reason='Restore source rhetorical WE and precise rank.'))
 f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');rf.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
