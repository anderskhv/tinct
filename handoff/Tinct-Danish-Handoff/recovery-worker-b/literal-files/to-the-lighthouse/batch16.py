from revise import save,load
from eng import change
for c,n,f,t in [(1,2,'Army and Navy Stores, a London department store,','Army and Navy Stores,'),(1,10,'“ablest fellow in Balliol,” the Oxford college.','“ablest fellow in Balliol.”'),(1,13,'the Reform Bill, the great voting reform of 1832','the Reform Bill'),(4,1,'on the heights of Balaclava, like Tennyson’s Light Brigade','on the heights of Balaclava'),(6,3,'“Someone had blundered”—the line from Tennyson’s “The Charge of the Light Brigade.”','“Someone had blundered”—'),(16,5,'Bœuf en Daube, a French beef stew slow-cooked in wine','Bœuf en Daube')]:change(c,n,f,t,'Remove explanatory material absent from independent source; avoid unsupported specificity and restore interior narrative voice. Preserve Woolf’s references themselves.')
x=load('modern-da.json')['chapters'][16]['paragraphs'];save(17,10,{
1:x[0].replace('sunket sammen i en bunke','helt sammensunken').replace('følt nogen som helst følelse, nogen som helst hengivenhed, for ham','følt noget for ham, nogen som helst hengivenhed').replace('en malstrøm','en hvirvelstrøm'),
2:x[1].replace('den malstrøm','den hvirvelstrøm').replace('som om en skygge var sænket sig','som om en skygge havde sænket sig').replace('Intet syntes at have smeltet sammen','Intet syntes at være smeltet sammen').replace('Og så fremdeles og så fremdeles','Og sådan videre og videre').replace('værnede og lokkede den stadig svage puls','værnede om den stadig svage puls og hjalp den på vej'),
5:x[4].replace('skibet var gået over stag','skibet havde vendt sig'),
7:x[6].replace('For noget forbandet vrøvl de snakker','Sikke noget forbandet vrøvl de snakker').replace('som om, det slog Lily','som om, tænkte Lily').replace('at mislike nogen','ikke at kunne lide nogen'),
9:x[8].replace('Fra det ene års ende til det næste','År ud og år ind').replace('Alt, de gjorde, var at snakke','De bestilte ikke andet end at snakke'),
10:x[9].replace('til Fyret','til fyret').replace('manden i nedløbsrøret','manden nede i afløbet')
})
