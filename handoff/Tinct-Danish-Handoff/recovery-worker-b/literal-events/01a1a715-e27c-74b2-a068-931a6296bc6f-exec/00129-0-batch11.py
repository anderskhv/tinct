from revise import save,load
x=load('modern-da.json')['chapters'][9]['paragraphs'];save(10,18,{
1:x[0].replace('Cam havde misset staffeliet med en hårsbredde','For Cam strøg forbi staffeliet med en tommes afstand').replace('som hun også missede med en hårsbredde','som hun også strøg forbi med en tommes afstand').replace('kom slæbende på fødderne tilbage','slæbte sig tilbage'),
2:x[1].replace('gå ind og spørg Mildred','spørg Mildred').replace('rydde af efter te','rydde tebordet'),
3:x[2].replace('tage imod ham','sige ja til ham').replace('At gå en tur efter frokost som den her, selv med Andrew med','At gå sådan en tur efter frokost, selv om Andrew var med').replace('tage imod den gode fyr','sige ja til den gode fyr').replace('uendelig meget dumrianer frem for','langt hellere ville have en dumrian end'),
4:x[3].replace('Det var lige daggry','Det var lige ved at blive lyst'),
5:x[4].replace('undret sig over, hvad vejret ville gøre','spekuleret på, hvordan vejret ville blive'),
6:x[5].replace('som var luntet ud efter dem, fnisende','der var fulgt med dem ud, fnise').replace('Hvad angik, om Nancy havde været der, kunne hun ikke være sikker','Om Nancy havde været der, var hun ikke sikker på'),
8:x[7].replace('begynde at pjatte','begynde at blive urolig'),
10:'›Flynder, flynder, du i hav,\nkom herhen, det ber jeg om;\nfor min kone, gode Ilsabil,\nvil ikke det, jeg gerne vil.‹',
11:x[10].replace('Ildjernet','Ildrageren').replace('deres ryg gå ned ad stien','dem bagfra, på vej ned ad stien').replace('Hendes øgenavne til dem blinkede op i hende','Øgenavnene dukkede op i hendes tanker').replace('denne tankes filtrede nøgle','det virvar af tanker').replace('at hun så ud »sådan«','at hun så »sådan« ud').replace('hvor lasket hun så ud','hvor slidt hendes tøj var').replace('Om den slags følte hun virkelig lidenskabeligt','Den slags gik hun virkelig op i'),
12:x[11].replace('Dem to ville hun have villet beholde','De to ville hun gerne beholde').replace('en absolut engel','en sand engel').replace('Hun ville altid gerne have haft en baby','Hun ville ønske, at hun altid havde et spædbarn').replace('nogle gange holdt de samtaler','undertiden forhandlede de'),
13:x[12].replace('skubbet til Minta','lagt pres på Minta'),
15:x[14].replace('selv om sengetid var overskredet','selv om det var forbi sengetid'),
17:x[16].replace('Fyrets lys','fyrets lys'),18:x[17].replace('til Fyret','til fyret')
})
