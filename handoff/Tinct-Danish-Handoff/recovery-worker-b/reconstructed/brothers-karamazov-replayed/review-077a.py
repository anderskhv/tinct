# -*- coding: utf-8 -*-
import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-da.json';d=json.loads(f.read_text());r=json.loads((p/'DANISH-REPAIRS.json').read_text());c=d['chapters'][76]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=77,paragraph=n,before=a,after=b,reason='Russian XI VIII page78 first55 slots: song line breaks, narrator descriptions, character meaning and modern Danish.'))
changes={1:[('rejste den skarpe, tørre vind, der havde blæst tidligt om morgenen, sig igen','tog den skarpe, tørre vind til, ligesom tidligt samme morgen'),('Den lå ikke på jorden','Den faldt på jorden uden at blive liggende'),('skred alene','gik'),('uden bevidsthed om stormen','uden at bemærke snestormen'),('siksak','zigzag'),('Så ville han pludselig begynde','Så holdt han pludselig op med at bande og begyndte')],
2:[('»Ach, Vanka er rejst til Petersburg; jeg venter ikke, til han kommer tilbage.«','»Åh, Vanka er rejst til Petersborg,\njeg vil ikke vente på ham!«')],
3:[('så ville han begynde','så begyndte han'),('med et voldsomt slingre lige imod Ivan','i en voldsom slingren lige ind i Ivan'),('trådte op til ham','trådte hen til ham')],
4:[('at Smerdjakov var meget syg','at Pavel Fjodorovitj — altså Smerdjakov — var meget syg'),('Det er ikke fordi han har sengeleje, men han virker ikke som sig selv','Han ligger ikke ligefrem i sengen, men det er næsten, som om han er fra forstanden')],
5:[('laver han larm','slår han sig løs')],
6:[('Bare tal ikke for længe med ham','De må bare ikke tale for længe med ham')],
7:[('en stor gammel mahognisofa med læderbetræk','en stor gammel lædersofa med træværk malet som mahogni'),('Han syntes at sidde og foretage sig intet','Han syntes bare at sidde uden at foretage sig noget'),('blå mærker under dem','blålige skygger under dem')],
8:[('Jo, du er virkelig syg?','Er du virkelig syg?')],
11:[('Pludselig vendte han med en håndbevægelse ansigtet bort','Pludselig slog han med hånden og vendte ansigtet bort')],
15:[('Det vedkommer ikke Dem','Det kan vel være Dem det samme')],
19:[('sig mig, hvad jeg spørger dig om','svar på det, jeg spørger om')],
20:[('foragteligt','foragtfuldt')],
26:[('»Hvorfor er De så urolig?« stirrede Smerdjakov på ham','»Hvorfor er De hele tiden så urolig?« Smerdjakov stirrede på ham')],
27:[('et koldt frygtens pust','et koldt pust af frygt')],
28:[('»De forstår ikke?« trak han bebrejdende på det','»De for-står ikke?« trak han bebrejdende ordene ud'),('vil opføre sådan en farce','gider spille sådan en komedie')],
30:[('ingen bevis','ingen beviser'),('Hør — hvor','Se — hvor')],
33:[('»Ved De det?« fangede Smerdjakov ham igen','»Ved De det?« greb Smerdjakov atter ordet')],
37:[('Nå, det var Dem, der myrdede ham, hvis det er det','Jamen, så var det Dem, der myrdede ham')],
39:[('Du mener, at jeg rejste væk. Det vi talte om sidste gang?','Du taler stadig om det dengang? Om det samme som sidst?')],
41:[('Alt jeg forstår','Det eneste, jeg forstår')],
42:[('fortsætte med at opretholde farcen over for hinanden','blive ved med at narre hinanden og spille komedie'),('Deres instrument, Deres trofaste tjener','Deres håndlanger, Deres trofaste tjener Litjarda')],
44:[('briste i hans hjerne','ryste i hans hjerne'),('ægtheden af Ivans rædsel','Ivans oprigtige rædsel')],
46:[('Ach, Vanka er rejst til Petersburg; jeg venter ikke, til han kommer tilbage —','Åh, Vanka er rejst til Petersborg,\njeg vil ikke vente på ham! —')],
47:[('lød pludselig som genlyd','ringede det pludselig')],
54:[('sin strømpebånd','sit strømpebånd'),('famlede ned til bunden af strømpen','stak fingrene dybt ned i strømpen')],
55:[('en rulle af papirer','et bundt papirer')]
}
for n,items in changes.items():
 for a,b in items:fix(n,a,b)
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'DANISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
q=json.loads((p/'PROGRESS.json').read_text());q['danish_repairs']=len(r);q['partial_chapter']={'chapter':77,'danish_paragraphs_reviewed':'1–55','english_followup':'pending','remaining_paragraphs':'56–152'};(p/'PROGRESS.json').write_text(json.dumps(q,ensure_ascii=False,indent=2)+'\n');print(len(r))
