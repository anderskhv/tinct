# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][66]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=67,paragraph=n,before=a,after=b,reason='Russian X V page68 full source comparison, slots1–50: modern Danish, calques, specific source actions and distinctions.'))
changes={1:[('fåreagtig sentimentalitet','sentimentalt pjat'),('tyngede tungt på','tyngede'),('lappede det sammen med','sluttede fred med'),('blevet beboet','blevet beboet'),('Det var en stor trøst','Det gav en stor trøst')],
2:[('besvære ham','plage ham'),('besøge Iljusja den morgen','besøge Iljusja den dag'),('kigge ind tilfældigt','komme uventet'),('ord, Kolja havde tabt','en henkastet bemærkning fra Kolja'),('vogtende på en lejlighed','efter at have ventet på det rette øjeblik'),('fløj Krassotkin i et voldsomt raseri','blev Krassotkin pludselig rasende'),('min egen hund','min egen Perezvon'),('Fåreagtig sentimentalitet','Sentimentalt pjat')],
3:[('havde Iljusja ikke forladt sin lille seng','havde Iljusja næsten ikke forladt sin lille seng'),('ført ham rundt i værelset på sin arm','ført ham rundt i værelset under armen'),('ville han løbe','løb han'),('trykke hovedet','trykkede hovedet'),('og bryde i anfald af voldsom gråd, idet han kvalte sine hulken','og brast i voldsom, krampagtig gråd, mens han kvalte sine hulk')],
4:[('ville han normalt begynde','begyndte han som regel'),('narre rundt og spille bajads','gøre sig til og spille klovn'),('hvor meget han mislykkede det','hvor ondt det gjorde ham'),('var en genstand for foragt','blev ydmyget blandt folk'),('»blårtot«','»Skurekluden«')],
5:[('bajaseri','klovnerier'),('for at studere på universitetet','for at følge kurser'),('den halv-gale mor','den halvforrykte mor'),('kunne morer sig','kunne muntres op'),('adsprede hende','underholde hende')],
6:[('Hvad angik kaptajnen, fyldte tilstedeværelsen i hans værelse af de børn, der kom for at muntre Iljusja op, fra første færd hans hjerte med ekstatisk glæde','For kaptajnen havde børnenes besøg for at muntre Iljusja op fra første færd været en kilde til overstrømmende glæde'),('ryste sin nedslående stemning af sig','komme ud af sin tristhed')],
7:[('deres omstændigheder','deres forhold'),('fået kendskab til familien og lykkedes med at charmere den halv-gale mor','lært hele familien at kende og endda charmeret den halvforrykte mor')],
8:[('havde doktor Herzenstube, sendt bud efter af Katerina Ivanovna, kommet punktligt hver anden dag','var doktor Herzenstube på Katerina Ivanovnas opfordring kommet regelmæssigt hver anden dag'),('doserede den invalide nådesløst','fyldte den syge dreng med frygtelige mængder medicin'),('med store omkostninger','for en stor sum penge'),('på det rette sted','på rette sted i fortællingen'),('forvente ham','vente ham')],
9:[('mastiff-hvalp','mastiffhvalp'),('Kaptajnen havde talt om den en uge tidligere','Kaptajnen havde bestilt den allerede en uge tidligere'),('en stamtavle-mastiff','en ægte mastiff'),('af følelsesfin delikatesse','af hensynsfuldhed'),('og han, smilende sørgmodigt, strøg den med sin tynde, blege, magre hånd','og han strøg den med et smertefuldt smil med sin tynde, blege, udtærede hånd')],
11:[('indtræden forårsagede en generel uro','ankomst vakte synlig uro'),('få fuld udsigt over','se hele')],
13:[('demonstrerede øjeblikkeligt sit fuldstændige greb om det høflige selskabs manerer','viste straks, hvor godt han kendte selskabslivets omgangsformer'),('der sad i sin lænestol — der var i dårligt humør netop da og brokkede sig','der sad i sin lænestol og netop da var i et forfærdeligt humør og brokkede sig'),('hvilket holdt hende fra at se','så hun ikke kunne se'),('som den eneste anden tilstedeværende dame','der jo også var en dame'),('lavede han for hende','gav han hende'),('ekstremt favorabelt','overordentlig gunstigt')],
14:[('Der, De kan straks se','Der kan man straks se'),('oven på hinanden','ridende på hinanden')],
15:[('oven på hinanden','ridende på hinanden')],
16:[('kommer trippende ind på en respektabel familie','rider ind til en respektabel familie')],
18:[('kom ind ridende på hans ryg','red ind på den drengs ryg i dag')],
19:[('blev slået ved synet af ham','stod helt rystet ved synet af ham'),('trådte tæt på','trådte hen til ham')],
20:[('Tja, gamle mand','Nå, gamle ven'),('han kunne ikke helt få lagt en let manér på det','han kunne ikke finde den ubesværede tone frem'),('et ynkeligt lille smil','et smertefuldt smil')],
21:[('Et minut var de tavse igen','De tav igen et øjeblik')],
24:[('vild, en god vagthund','arrig, en lænkehund'),('stoisk','bestemt'),('kontrollere sine følelser','beherske sine følelser')],
27:[('en af de vildeste racer; hans forældre er enorme og meget vilde','en rigtig arrig en; hans forældre er også enorme og meget arrige')],
28:[('mistede han nu fuldstændigt sin tråd','tabte han nu fuldstændig tråden')],
29:[('gamle mand','gamle ven')],
32:[('Åh nuvel, min dreng, din Sjutjka er fortabt og borte!','Nå, min ven, din Sjutjka — pist væk! Din Sjutjka er borte!')],
34:[('Hun var dømt til at dø efter et sådant måltid','Hvordan skulle hun kunne overleve sådan en godbid')],
36:[('fru Snegirjov','fru Snegirjova'),('med uforklarlig ophidselse i sin manér','med en helt ubegribelig ophidselse')],
37:[('en sørgmodig brist i stemmen','en stemme, der var ved at briste af sorg')],
38:[('startede op fra kisten','for op fra kisten'),('Åbn døren','Smurov, åbn døren')],
39:[('råbte Kolja, springende op','råbte Kolja og sprang op'),('tog alle på sengen','overraskede alle'),('mat af spænding','som lammet')],
40:[('en stemme brudt af glæde og lidelse','en stemme, der knækkede af lykke og smerte')],
42:[('gamle mand','gamle ven'),('det venstre øre revet','en flænge i det venstre øre'),('havde gjort hjem dér','havde slået sig ned dér'),('mundskind er så ømt ... ømmere end hos et menneske, meget ømmere','hud i munden er så sart ... mere sart end hos et menneske, meget mere sart'),('hans ansigt glødende og strålende af glæde','med blussende ansigt og strålende af begejstring'),('hans store øjne næsten bulende ud af hans hoved','med store øjne, der næsten stod ud af hovedet'),('katastrofal og fatal virkning','pinefuld og ødelæggende virkning'),('trække et sådant nummer på ham','udsætte ham for sådan et nummer')],
43:[('med saligheds stemme','med salig stemme')],
44:[('beklagende','ærgerligt')],
46:[('Krassotkin er en mester!','Godt gået, Krassotkin!')],
47:[('Han er en mester, han er en mester!','Godt gået, godt gået!')],
48:[('»Vent, vent,« gjorde Krassotkin sit bedste for at råbe over dem alle','»Vent, vent,« råbte Krassotkin og forsøgte at overdøve dem alle'),('forsikrede ham, at','forsikrede ham om, at'),('gamle mand','gamle ven'),('Har du ikke et stykke kød?','Har I ikke et stykke oksekød?'),('Et stykke kød — har du noget?','Et stykke oksekød — har I ikke noget?')],
49:[('hvor deres madlavning blev gjort','hvor også familiens mad blev lavet'),('mest henrykte over hundens forestilling','mest henrykte over, at hunden spillede død')],
50:[('vinjede','hvinede')]}
for n,pairs in changes.items():
 for a,b in pairs:
  if a!=b:fix(n,a,b)
for n in range(1,51):
 if 'Krassotkin' in c['paragraphs'][n-1]:fix(n,'Krassotkin','Krasotkin')
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');g=json.loads((p/'PROGRESS.json').read_text());g.update(danish_repairs=len(r),partial_chapter={'chapter':67,'danish_paragraphs_reviewed':'1–50','english_followup':'pending','remaining_paragraphs':'51–123'});(p/'PROGRESS.json').write_text(json.dumps(g,indent=2)+'\n');print(len(r))
