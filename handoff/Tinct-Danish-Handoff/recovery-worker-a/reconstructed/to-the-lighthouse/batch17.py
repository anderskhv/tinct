from revise import save,load
x=load('modern-da.json')['chapters'][16]['paragraphs'];save(17,22,{
11:x[10].replace('Så hvorfor brød hun sig om, hvad han sagde?','Hvorfor gik hun så op i, hvad han sagde?').replace('som hvede i vinden','som korn i vinden'),
12:x[11].replace('til Fyret','til fyret').replace('Det ville jeg elske så højt','Det ville jeg så gerne'),
13:x[12].replace('til Fyret','til fyret').replace('havet ville være for hårdt','der ville være for høj sø'),
14:x[13].replace('en øre','en penny').replace('hjulpet hjemmet fra sine opsparede penge','hjulpet dem derhjemme med sin opsparing'),
16:x[15].replace('anlægger et nyt billardværelse','bygger en ny billardstue').replace('Et billardværelse!','En billardstue!').replace('For hende forekom det umuligt','Det forekom hende umuligt'),
18:x[17].replace('med sit nye billardværelse','der byggede en ny billardstue').replace('Det var ekstraordinært','Det var forbløffende'),
19:x[18].replace('med omhyggelig akkuratesse','med pinlig omhu').replace('han lod sig aldrig falde ned i et hjulspor','han lod sig aldrig føre ind i en fast rille').replace('han tog et hurtigt fugleperspektiv over sit arbejde','i et glimt så han sit arbejde i fugleperspektiv').replace('betød hendes nærvær ham intet som helst','betød hendes nærvær intet som helst for ham').replace('Hendes skønhed betød ham intet','Hendes skønhed betød intet for ham'),
20:x[19].replace('ikke brød sig to strå om hende','var bedøvende ligeglad med hende'),
21:x[20].replace('Fransken kan være dårlig','Det franske kan være dårligt').replace('den kan mangle ordene','sproget kan mangle ordene').replace('den vrøvl','det vrøvl').replace('skære ind i deres samtale','bryde ind i deres samtale'),
22:x[21].replace('ribbenene og lårbenene af den unge mands higen efter at imponere, liggende mørke inde i tågen af hans kød','ribbenene og lårbenene i den unge mands trang til at gøre indtryk, mørke inde i det tågeslør, hans krop dannede').replace('hjælpe ham til at få lettelse','hjælpe ham med at få afløb for det')})
