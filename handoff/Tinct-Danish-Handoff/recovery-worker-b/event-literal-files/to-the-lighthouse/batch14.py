from revise import save,load
x=load('modern-da.json')['chapters'][13]['paragraphs'];save(14,10,{
1:x[0].replace('med det stumme blik, hun havde','med et ordløst blik').replace('slippe op på sit loft','slippe op på sit loftsværelse').replace('en spids, en kuppel','et spir, en kuppel').replace('kuplen, spidsen','kuplen, spiret').replace('løb om kap ned ad skråningen','løb ned ad skråningen'),
2:x[1].replace('gik ret godt','var ret god til at gå langt').replace('hvor hensynsløs hun var','hendes vovemod'),
6:x[5].replace('lade tidevandet komme ind','lade vandet stige'),
7:x[6].replace('strømperne ind i dem','strømperne sammen og lagde dem i skoene').replace('sine egne sten','sine egne klipper').replace('sine egne vandpytter','sine egne tidevandsbassiner').replace('vandpytten','det lille bassin').replace('det blege, krydsede sand listede et fantastisk havuhyre, højbenet','det blege sand med dets krydsende spor skred et sælsomt havuhyre med høje skridt'),
8:x[7].replace('at havet kom ind','at vandet steg').replace('denne forfærdelige ubehagelighed skulle ske','det her ubehagelige skulle ske').replace('trak sløjferne ret stramt','strammede sløjferne godt til'),
9:x[8].replace('sat i perler','indfattet i perler').replace('De pillede rundt og kiggede og ledte','De rodede rundt, spejdede og ledte').replace('mellem dette punkt og hint','mellem det her punkt og det der').replace('holdt et kort rådslag','rådslog kort'),
10:x[9].replace('hvor berømt han var','hvor kendt han var').replace('købe hende en ny','købe en ny til hende').replace('hvad han havde været, og hvad han havde gjort','hvad han dog havde gjort').replace('følgende ham overalt','de fulgte ham overalt').replace('lysene hans øjne til at føles fulde','lysene hans øjne til at løbe fulde').replace('mens de kom ind i huset og stirrede rundt omkring sig med et helt stivt ansigt','da de kom ind i huset, mens han stirrede sig omkring med stift ansigt')
});save(15,1,{})
