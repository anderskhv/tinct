from revise import save,load
x=load('modern-da.json')['chapters'][15]['paragraphs'];save(16,12,{
1:x[0].replace('og råbte »Kom ind«','og sagde »Kom ind«'),
5:x[4].replace('Bœuf en Daube, en fransk oksegryde, langsomt kogt i vin','bœuf en daube').replace('Bœuf en Daube ville','deres bœuf en daube ville').replace('hver en detalje skulle være tilberedt til perfektion','alt skulle netop have fået nok'),
6:x[5].replace('havde et meget besværligt og vanskeligt temperament','var en besværlig fugl, vanskelig at omgås'),
7:x[6].replace('Hvorom alting var, op fløj de alle sammen igen','Under alle omstændigheder fløj de alle sammen op igen').replace('udsøgte seglformer','smukke krumsabler'),
8:x[7].replace('alle smykkeskrinets bakker','alle bakkerne i smykkeskrinet').replace('eller opalen','eller opalhalskæden'),
10:x[9].replace('en hemmelig grund af sin egen','sin egen hemmelige grund').replace('mens hun stod stille, medens Rose lukkede låsen','og stod stille, mens Rose lukkede låsen').replace('følte, stod ikke i noget forhold til noget, hun virkelig var','følte for hende, var ude af proportion med, hvem hun faktisk var').replace('på dette tidspunkt holdt hun pludselig op med at give ham den mindste opmærksomhed','her holdt hun pludselig helt op med at lytte til ham'),
11:x[10].replace('stiger ned iblandt dem','går ned iblandt dem').replace('deres bukken for hende','at de kaster sig ned foran hende'),
12:x[11].replace('Der brændte noget på','Der lugtede brændt').replace('Bœuf en Daube koge','deres bœuf en daube koge').replace('Og så meddelte den store gongong højtideligt og med autoritet','Så forkyndte gongongens rungende slag højtideligt og myndigt').replace('på små siddepinde af deres egne, læsende, skrivende','i hver sin lille afkrog, optaget af at læse eller skrive')
})
