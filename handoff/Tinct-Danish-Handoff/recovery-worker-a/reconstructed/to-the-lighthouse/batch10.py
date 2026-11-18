from revise import save,load
x=load('modern-da.json')['chapters'][8]['paragraphs'];save(9,16,{
1:x[0].replace('Ja, var hr. Bankes enig, mens hans øjne fulgte hr. Ramsay, som han gik','Ja, sagde hr. Bankes og så efter ham').replace('ikke kunne klare at opføre sig','ikke kunne opføre sig').replace('hvorfor skulle han holde foredrag for os','hvorfor skulle han prædike for os'),
2:x[1].replace('som også så efter hr. Ramsays bortgående ryg','der også så efter hr. Ramsay, mens han gik'),
3:x[2].replace('ekkoede hun','gentog hun').replace('ligeglad, uvidende, langt væk','ubekymret, uopmærksom, fjern').replace('en snor af små adskilte hændelser','en række små adskilte hændelser').replace('dér, brydende på stranden','dér, med et plask på stranden'),
4:x[3].replace('en hvid videnskabsmandskittel','en hvid laboratoriekittel').replace('og tilføje til det, menneskeheden havde vundet','og blive en del af det, menneskeheden havde vundet').replace('Og det gjorde den da også','Ja, sådan var det virkelig').replace('kaos\' herredømme','kaossets herredømme'),
5:x[4].replace('intet lettede hende så for livets forvirring','intet befriede hende så fuldstændigt for livets forvirring'),
6:x[5].replace('på en klud af gammelt klæde','på en gammel klud').replace('kigge lidt hemmeligt på sit maleri','i smug kaste et blik på sit maleri'),
7:x[6].replace('lyset fra en sommerfugls vinge hvilende på en katedrals buer','lyset fra en sommerfuglevinge, der hvilede på en katedrals buer'),
8:x[7].replace('en ubetydelighed, boende ved Brompton Road','et ubetydeligt menneske, der bor ved Brompton Road').replace('Hun smækkede soveværelsesvinduer op','Hun åbnede soveværelsesvinduer').replace('spille det op igen','spille det ud igen').replace('grøntsagssaltene er tabt','saltene i grøntsagerne går tabt').replace('en ugift kvinde har gået glip','en ugift kvinde er gået glip'),
9:x[8].replace('ville hun mande en desperat tapperhed op','ville hun samle alt sit fortvivlede mod').replace('stadig præsiderende','stadig tronende dér'),
10:x[9].replace('Ikke alle kunne være så planløse, så fra hånden og i munden, som hun var','Ikke alle kunne leve så planløst, så fra hånden og i munden, som hun gjorde').replace('tavler hugget med hellige indskrifter','tavler med hellige indskrifter').replace('stave dem ud','tyde dem').replace('intimitet selv','selve nærheden'),
11:x[10].replace('mumlen og rørelser','summen og bevægelser').replace('kuppelens skikkelse','en kuppels form'),
12:x[11].replace('indsnævret sine klare blå øjne en smule','knebet sine klare blå øjne en smule sammen').replace('Hun hærdede sig til den frygtelige prøvelse','Hun tog sig sammen til den frygtelige prøvelse'),
13:x[12].replace('Intet kunne have været roligere eller stillere','Det hele gik så roligt og stilfærdigt til, som man kunne tænke sig'),
14:x[13].replace('sat dem ind overhovedet','overhovedet taget dem med').replace('Ja, hvorfor? — undtagen at, eftersom der var lyst derovre i det hjørne, følte hun, at hun havde brug for noget mørkt her i dette','Ja, hvorfor? Bortset fra at når der var lyst derovre i det hjørne, havde hun brug for noget mørkt i det her'),
15:x[14].replace('underkuede alle sine indtryk som kvinde til noget langt mere generelt','lod alle sine indtryk som kvinde træde i baggrunden for noget langt mere alment').replace('med hin til venstre','med den derovre til venstre'),
16:x[15].replace('gå væk ned ad det lange galleri ikke længere alene','gå ned gennem det lange galleri, ikke længere alene')
})
