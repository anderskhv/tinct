from revise import save,load
x=load('modern-da.json')['chapters'][6]['paragraphs']
save(7,9,{
1:x[0].replace('give agt på ham','rette opmærksomheden mod ham').replace('den måde, tingene var på mellem ham og hans mor','hans forhold til sin mor').replace('den, som, vidste han med vrede, vaklede','som han til sin vrede vidste vaklede'),
2:x[1].replace('med sin søn foldet ind i armen','med armen om sin søn').replace('denne lækre frugtbarhed','denne vidunderlige frugtbarhed').replace('bart og nøgent','goldt og nøgent').replace('hinsides dem','bag dem'),
3:x[2].replace('tryllede hun stue og køkken og fik dem alle','tryllede hun stue og køkken frem og fik rummene'),
4:x[3].replace('kastende blikke rundt','og med blikket flakkende omkring').replace('sin duelighed','sin sikre kunnen').replace('en sygeplejerske','en barnepige').replace('et urolegt barn','et vrantent barn').replace('tykt af blade','tæt af blade'),
5:x[4].replace('kricket','cricket'),
6:x[5].replace('ét kronblad lukkende sig inde i et andet','det ene kronblad lukkede sig om det andet').replace('hele væven faldt sammen over sig selv','hele hendes skikkelse sank sammen').replace('hendes vellykkede skabelses henrykkelse','fryden over at have skabt noget, der lykkedes'),
7:x[6].replace('hendes legemlige træthed var også tilsat en svagt ubehagelig følelse med en anden kilde','hendes kropslige træthed var også farvet af et svagt ubehag, som kom et andet sted fra').replace('læste højt historien om Fiskeren og hans kone','læste historien om fiskerens kone højt').replace('ved sidevendingen','da hun vendte siden').replace('og hinsides det kunne hun ikke udstå','og desuden kunne hun ikke udstå').replace('Alt dette tog fra helheden, den rene glæde','Alt dette gjorde glæden mindre, den fulde, rene glæde'),
8:x[7].replace('der slæbte forbi','der kom sjokkende forbi').replace('mens hun så uædelt fortvivlede i kølvandet på sin ophøjelse','mens så smålige bekymringer gnavede i hende efter den ophøjede følelse'),
9:x[8].replace('Går De indenfor','Skal De ind')
})
x=load('modern-da.json')['chapters'][7]['paragraphs'];save(8,7,{
1:x[0].replace('Kan jeg hente frimærker, papir, tobak til dig?','Skal jeg tage frimærker, papir eller tobak med til Dem?').replace('En halv krone?','En halv crown?').replace('Vil du have frimærker, vil du have tobak? Her er en bog, du måske kunne lide','Vil De have frimærker, vil De have tobak? Her er en bog, De måske kunne lide').replace('uden at være sig det bevidst','uden selv at lægge mærke til det').replace('Udslidt og lasket','Slidt og medtaget').replace('historien om Fiskeren og hans kone og således berolige det knippe af følsomhed, hendes søn James','eventyret om fiskeren og hans kone og på den måde berolige sin søn James, det lille bundt følsomhed'),
2:x[1].replace('Det er ikke ret','Det er ikke rigtigt'),
3:x[2].replace('få kunsten sat på plads','sætte kunstens forrang på plads').replace('mens han spadserer behageligt af sted gennem de veje og marker i landskabet','mens han roligt rider gennem de små veje og marker i et landskab').replace('dette sving, hint led','det ene sving, det andet gærde').replace('historien om hint felttog derovre, denne statsmands liv her','historien om et felttog dér, en statsmands liv her').replace('denne tænker, hin soldat','en tænker her, en soldat dér').replace('det yderligere sving','svinget længere fremme'),
4:x[3].replace('en øde havfugl','en ensom havfugl').replace('under vore fødder','under vores fødder').replace('enhver gestus og ethvert nusseri','alle sine fagter og alt sit pynt').replace('feststemte folk','glade mennesker'),
5:x[4].replace('om seks uger havde han lovet at fortælle','han havde lovet om seks uger at fortælle').replace('gøres let af','bagatelliseres').replace('sådanne skjul','den slags fortielser'),
6:x[5].replace('Lily mistænkte, at','Lily havde på fornemmelsen, at')
})
