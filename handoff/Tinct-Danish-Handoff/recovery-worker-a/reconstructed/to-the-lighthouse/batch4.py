from revise import save,load
x=load('modern-da.json')['chapters'][1]['paragraphs']
save(2,2,{1:'»Ingen tur til fyret, James,« sagde han, mens han stod ved vinduet og talte kejtet, men af hensyn til fru Ramsay forsøgte at lægge i det mindste et skær af hjertelighed i stemmen.'})
x=load('modern-da.json')['chapters'][2]['paragraphs']
save(3,9,{
1:'''»Måske vågner du op til solskin og fuglesang,« sagde hun medfølende og glattede den lille drengs hår, for hun kunne se, at hendes mand havde taget modet fra ham med sin bidske bemærkning om, at det ikke ville blive godt vejr. Han længtes lidenskabeligt efter at komme til fyret, så hun. Og som om hendes mand ikke havde sagt nok med sin bidske bemærkning om, at det ikke ville blive godt vejr i morgen, kom denne modbydelige lille mand og gned salt i såret igen.''',
3:x[2].replace('at rose køleskabet','at beundre køleskabet'),
4:x[3].replace('Der havde lydt en grov mumlen','Der havde lydt en brummende mumlen').replace('den ene hurtige hverv','den ene hurtige opgave').replace('det ene hurtige hverv','den ene hurtige opgave'),
5:x[4].replace('ligesom for at betale hende tilbage for den følelse, hun havde spildt','som for at godtgøre hende det unødige forbrug af følelser').replace('Det betød lidt for hende','Det tog hun sig ikke synderligt af').replace('og det havde han i sandhed','og det havde han faktisk').replace('som havde afvist hendes lille dreng','som havde givet hendes lille dreng en kold afvisning'),
6:x[5].replace('en vanemæssig lyd','en velkendt lyd').replace('som kun kunne klippes ud, hvis James var meget forsigtig','som James kun kunne klippe ud, hvis han var meget omhyggelig'),
9:x[8].replace('råbt ud med den vildeste heftighed','sunget ud med den største intensitet').replace('for at se, om nogen havde hørt ham','for at undersøge, om nogen hørte ham').replace('fru Ramsay brød sig om hende for det','det holdt fru Ramsay af hende for')
})
