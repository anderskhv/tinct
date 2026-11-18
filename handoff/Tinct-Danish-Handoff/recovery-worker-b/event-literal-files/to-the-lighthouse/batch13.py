from revise import save,load
x=load('modern-da.json')['chapters'][11]['paragraphs'];save(12,12,{
1:x[0].replace('kastede sig ud i emnet gartner Kennedy','begyndte straks at tale om gartneren Kennedy').replace('netop denne bekymring var klaret','netop den bekymring nu var på plads').replace('tage fat på Jasper','tale om Jasper').replace('tog hun, fordi modet svigtede hende, når det gjaldt penge, fat på Jasper','talte hun, fordi modet svigtede hende, når det gjaldt penge, om Jasper'),
2:x[1].replace('lade ham more sig selv','overlade ham til sig selv').replace('hans håbløse dovenskab','hans uhelbredelige dovenskab').replace('få slået et slag','faktisk bestille noget').replace('holdt din tante Camilla frem','fremhævet din tante Camilla'),
3:x[2].replace('var ved at beslutte sig for','besluttede sig for').replace('lige nu, da han gik på terrassen','da han lige før gik på terrassen').replace('til Fyret','til fyret'),
4:x[3].replace('klumper fakkelliljer','grupper af fakkelliljer').replace('var Fyret igen','var fyret igen').replace('Byens lys, havnen og bådene','Lysene fra byen, havnen og bådene').replace('Drengene var hun bange for, men ikke ham','Hun bekymrede sig om drengene, men ikke om ham').replace('en bæst','et bæst'),
7:x[6].replace('hvilken fuldkommen dejlig aften det var','at det var en virkelig dejlig aften'),
9:x[8].replace('hans vane at tale højt','hans vane med at tale højt'),
11:x[10].replace('sprang næsten ud af sit skind','var nær faret ud af sit gode skind').replace('aftenstjernens første pulsslag, den fuldt bankende stjerne','det første pulsslag fra den stærkt bankende stjerne'),
12:x[11].replace('for at gøre hende tilpas','for at glæde hende')
});x=load('modern-da.json')['chapters'][12]['paragraphs'];save(13,3,{
1:x[0].replace('set Rembrandterne','set Rembrandts malerier').replace('Pradoen','Prado-museet').replace('Padova med sine Giottoer','Padova med Giottos billeder').replace('så deres sightseeing var foregået i beskedent omfang','så der var grænser for, hvor meget de havde kunnet tage ud og se'),
2:x[1].replace('et kompliment','en kompliment').replace('og slængte sin lille uoprigtighed ud','og rystede sin lille uoprigtighed af sig').replace('øve gribning','kaste bold til hinanden').replace('af uansvarlighed','af frihed fra ansvar').replace('og kluklo for sig selv, mens han slentrede','og han kluklo for sig selv, mens han slentrede')
})
