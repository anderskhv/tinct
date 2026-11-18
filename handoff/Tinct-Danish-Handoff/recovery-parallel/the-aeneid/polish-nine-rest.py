from pathlib import Path
import json
p=Path('/tmp/tinct-da-prep-20261104/the-aeneid');f=p/'09.draft';s=f.read_text();log=json.loads((p/'DANISH-POLISH.json').read_text())
pairs=[
('jeg var med til at underlægge dig Olympos!','nu da du har undertvunget Olympos!'),
('mørk af fyrretræer og tætte, sorte ahorn.','mørk af sort gran og ahornstammer.'),
('Deres skibe kunne ikke holde stand\nmod rutulernes ild og sværd.','Deres skibe ventede ikke\npå rutulernes ild og sværd.'),
('foran sig har de endnu at bringe mange mænd døden før det er dem selv der dør.','de skal bringe mange mænd døden, før de selv må dø.'),
('stridsvogne vippet op på bredden','stridsvogne rejst på højkant ved bredden'),
('Nu kalder omstændighederne selv.','Nu er øjeblikket kommet.'),
('trak søvnen dybt ind i brystet.','lå og sov med dybe åndedrag.'),
('hvis han dér natten lige til lyset var blevet ved med at spille.','hvis han var blevet ved med at spille, til det blev lyst.'),
('Han trak det ud i rød overflod;','Han trak det ud, dækket af blod;'),
('I hemmelig iver for at stjæle sig ind er Nisus allerede på vej mod Messapus\' mænd.','I sin iver efter flere drab er Euryalus allerede på vej mod Messapus\' mænd.'),
('Kort siger han til Euryalus, for han mærkede ham revet med af for vild en lyst til drab:','Nisus siger kort til ham, for han mærker hans voldsomme lyst til drab:'),
('Det blev taget op som mere end et tilfælde.','Det gik ikke rytterne forbi.'),
('Hvor stammer jeres rejse fra?','Hvor kommer I fra?'),
('Intet modspil fra de to.','De to svarer ikke.'),
('Det knækker dér, træet går splintret gennem hans hjerte.','Det brækker i ham, og det splintrede træ går gennem hans hjerte.'),
('og udsender en varm strøm af sine lunger, kulden griber ham, lange stød får flankerne til at slå.','og kaster en varm strøm af blod op fra lungerne. Kulden griber ham, og kroppen ryster i lange stød.'),
('Al svigen er min;','Hele anslaget er mit;'),
('kun efter Volscens står hans hu.','kun Volscens vil han ramme.'),
('indtil han fik\nsin fjende råbende til ansigt og begravede sværdet i hans mund,\nselv døende tog sin fjendes liv.','indtil han møder\nsin råbende fjende ansigt til ansigt og begraver sværdet i hans mund.\nSelv døende tager han sin fjendes liv.'),
]
for a,b in pairs:
 assert a in s,a
 s=s.replace(a,b);log.append(dict(book=9,before=a,after=b,reason='Follow-up fluency; IX.354 onward retains Euryalus as killer checked against Latin.'))
f.write_text(s);(p/'DANISH-POLISH.json').write_text(json.dumps(log,ensure_ascii=False,indent=2)+'\n')
