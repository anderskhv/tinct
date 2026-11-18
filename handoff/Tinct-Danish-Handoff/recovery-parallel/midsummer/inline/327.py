from prep import *
D=rd('modern-da.json')
changes={(2,13):{'de knusende døn':'de knusende drøn'},(2,36):{'Hvad slags':'Hvilket slags'},(5,34):{'En mærkeligere Pyramus end nogensinde set her!':'En særere Pyramus har aldrig spillet her!'},(6,15):{'hans krop':'hans lig'},(6,43):{'Ingen har nogensinde spildt mere luft på en vittighed.':'Ingen spottefugle har spildt mere luft end jer.'},(6,58):{'Hør mig ud!':'Hør hvad jeg har at sige til mit forsvar!'},(6,90):{'ikke engang med dig til at forsvare hende':'heller ikke hvis du tager hendes parti'},(6,111):{'Tal op!':'Svar mig nu!'},(7,6):{'Kradse mig i hovedet':'Klø mig i hovedet'},(7,11):{'Hvad ønsker I?':'Hvad ønsker De?'},(7,19):{'Sådan slynger vedbenden som en kvinde\nsig om elmens barkede fingre.':'Sådan tager vedbenden som en kvinde\nfat om elmens barkede fingre.'},(9,37):{'også har replikker.':'også har replikker?'},(9,126):{'åbner sit gab på vidt klem':'gaber vidt og bredt'}}
for (n,i),x in changes.items():
 for a,b in x.items():v=D['chapters'][n-1]['paragraphs'];assert a in v[i-1];v[i-1]=v[i-1].replace(a,b)
wr('modern-da.json',D)
