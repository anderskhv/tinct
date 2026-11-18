from revise import save,load
x=load('modern-da.json')['chapters'][3]['paragraphs'];save(4,19,{11:x[10].replace('strandkarse','biblommer')})
x=load('modern-da.json')['chapters'][4]['paragraphs']
save(5,12,{
1:x[0].replace('krøllede ansigt','sammenknebne ansigt').replace('tage til Fyret','komme ud til fyret'),
2:x[1].replace('den hedefarvede strømpe','den lyngfarvede, melerede strømpe').replace('Jamess','James’'),
3:x[2].replace('Kære, stå stille','Stå nu stille, skat').replace('For James, i sin jalousi, brød sig ikke om at tjene som målestok','James var jaloux og brød sig ikke om at stå model til strømpen'),
4:x[3].replace('tre tusind mil','tre tusind engelske mil').replace('Ak! Selv dem','Og tænk, selv dem').replace('Vor tids','Vores tids').replace('Croom om Sindet','Croom om sindet').replace('»Kære, stå stille,«','»Stå nu stille, skat,«').replace('til Fyret','til fyret').replace('Jamess','James’').replace('Alligevel er ting nødt til at forgå','Men det går jo ud over tingene').replace('pigernes soveværelser','tjenestepigernes værelser').replace('al fru Ramsays skænderi og demonstrationer','alle fru Ramsays formaninger og anvisninger').replace('hendes hænder lukkende og spredende sig som en franskkvindes','med hænder, der lukkede og åbnede sig som en fransk kvindes').replace('blåt på dens fjer skifter fra lys stål til blød lilla','det blå i dens fjerdragt skifter fra blankt stål til blød violet'),
5:'»Stå stille. Lad nu være med at være besværlig.« Han vidste straks, at hun mente det alvorligt, og strakte benet, og hun målte det.',
6:x[5].replace(', fyrvogterens søn,',''),
8:x[7].replace('formedes måske','dannede der sig måske'),
9:x[8].replace('hvis rygter nåede én','som man havde hørt rygter om').replace('om besejret kærlighed','om kærlighed, der blev forpurret').replace('om forpurret ærgerrighed','om ambitioner, der blev knust').replace('Hendes enfoldige sind','Hendes udelt opmærksomme sind').replace('svup og fald af ånden ned på sandheden','åndens dyk og nedslag på sandheden'),
10:x[9].replace('på asfodelosenge','på enge med asfodeler').replace('tage 10.30 fra Euston','tage toget klokken 10.30 fra Euston'),
11:x[10].replace('hvordan arbejderne klarede sig med et hotel','hvor langt arbejderne var nået med det hotel').replace('uafsluttede mure','ufærdige mure').replace('hente et barn ud af fortræd','rive et barn væk fra ulykker').replace('kaste sin formens kongelighed af sig','lægge sin kongelige fremtoning fra sig'),
12:x[11].replace('det autentificerede mesterværk','det bevisligt ægte mesterværk').replace('Hun udglattede, hvad der end havde været hårdt i hendes væsen et øjeblik tidligere','Hårdheden fra et øjeblik før gled ud af hendes væsen')
})
