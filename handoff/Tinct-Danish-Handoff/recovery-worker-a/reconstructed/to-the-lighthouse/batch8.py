from revise import save,load
x=load('modern-da.json')['chapters'][5]['paragraphs']
save(6,28,{
3:x[2].replace('Hun for sammen af sin dagdrøm','Hun fór op af sine tanker').replace(' — linjen fra Tennysons »Lette kavaleris angreb«. Hun rettede',' — hun rettede').replace('remsen parrede sig selv op i hendes hoved','remsens to led fandt sammen i hendes hoved').replace('hun kunne ikke i verden begribe hvad','hun kunne for sit liv ikke komme i tanker om hvad'),
4:x[3].replace('Beskudt af kugle og granat, red vi dristigt og vel, blinkede gennem dødens dal, brølede og tordnede — blot for at køre hovedkulds','Beskudt med kugler og granater, dristigt red vi og vel, lynede gennem dødens dal, salver og torden — lige'),
5:x[4].replace('hele hans person','hele hans krop').replace('den hvide herreskjorte på en herre','en herres hvide selskabsskjorte').replace('da turen kom rundt igen','næste gang han kom forbi').replace("James' bare lægge",'James’ bare læg').replace('skændte hun let på ham','drillede hun ham med'),
8:x[7].replace('ulyksalige','besværlige'),9:x[8].replace('til Fyret','til fyret'),
11:x[10].replace('det ufattelige i det, hun lige havde sagt, det kvindelige sinds dårskab','hvor utrolig ufornuftig hendes bemærkning var, hvor tåbeligt kvinder tænkte').replace('sagde i realiteten usandheder','løj, ganske enkelt'),
12:x[11].replace('vind fra vest','vind fra stik vest'),
13:x[12].replace('som lod hun en piskende regn af skarp hagl','som om hun lod en byge af skarpkantede hagl').replace('strømme ned over sig uden et ord til bebrejdelse','sprøjte ned over sig uden at protestere'),
16:x[15].replace('tage hans ord for gode varer','tro ham på hans ord').replace('en ville have dette, og en anden ville have hint','én ville have det ene, en anden det andet'),
18:x[17].replace('strøg af sted','gik af sted med lange skridt'),
19:x[18].replace('Hvor ekstraordinært hans tonefald dog havde ændret sig','Hvor havde hans tonefald dog forandret sig').replace('en frase, der passede til et nyt stemningsleje','en vending, der passede til hans nye stemning').replace('i en messende tone','melodisk'),
20:x[19].replace('hans uforstyrrethed var givet ham tilbage','han kunne igen være sig selv i fred'),
21:x[20].replace('uden nogen besvær','uden noget besvær').replace('Om Q var han sikker','På Q var han sikker').replace('urnens hanke','urnens hank').replace('Han skærpede sig','Han tog sig sammen'),
22:x[21].replace('et skibs mandskab','en skibsbesætning').replace('seks skibskiks','seks beskøjter').replace('Nå, så er R','Altså er R'),
23:x[22].replace('at R var hinsides ham','at R lå uden for hans rækkevidde'),
24:x[23].replace('på en øde ekspedition over polaregnenes frosne ødemarker','på en ensom ekspedition gennem polaregnenes iskolde ødemarker'),
25:x[24].replace('Geni besad han ikke; det gjorde han ingen krav på','Genial var han ikke; det gjorde han heller ikke krav på').replace('Så længe sad han','Foreløbig sad han'),
26:x[25].replace('véd','ved').replace('et bleget, skrumpet alderdomsudseende','en udlevet oldings blege ansigt'),
27:x[26].replace('stod stille som en støtte','stod helt stille').replace('af tusind millioner mennesker, hvor mange når da nogensinde til Z','hvor mange ud af en milliard mennesker når egentlig til Z').replace('en håbløs forpost, en dømt fortrop','en dødsdømt fortrop').replace('Skal han så dadles','Skal det så bebrejdes ham').replace('den håbløse forpost','det dødsdømte hold').replace('om han, før døden','at han, før døden').replace('en flot skikkelse af en soldat','en prægtig soldaterskikkelse'),
28:x[27].replace('over hans ben','over hans knogler').replace('og sovet ind uden større omsorg for','og var faldet i søvn uden at bekymre sig stort om').replace('efter hans isolations intensitet','efter den intense ensomhed')
})
