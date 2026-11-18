# coding: utf-8
from review_helpers import *
d=rd('modern-da.json');d['chapters'][29]['title']='Om kannibaler';wr('modern-da.json',d)
setslot('da',30,1,'Da kong Pyrrhus drog ind i Italien og havde undersøgt opstillingen af den romerske hær, som rykkede ham i møde, sagde han: »Jeg ved ikke, hvad det er for barbarer« — sådan kaldte grækerne jo alle fremmede folkeslag — »men den hær, jeg ser her, er bestemt ikke opstillet på barbarisk vis.« Det samme sagde grækerne om den hær, Flaminius førte ind i deres land, og Filip, da han fra en høj så den romerske lejr, som Publius Sulpicius Galba havde anlagt i hans rige. Sådan bør vi vogte os for at holde fast ved den gængse opfattelse og i stedet bedømme tingene med fornuften, ikke efter hvad folk siger.')
setslot('da',30,2,'Jeg havde længe en mand hos mig, som havde boet ti eller tolv år i den nye verden, der er opdaget i vores århundrede, på det sted, hvor Villegaignon gik i land og gav landet navnet France Antarctique, »det sydlige Frankrig«. Opdagelsen af et så umådeligt land fortjener eftertanke. Jeg ved ikke, om jeg kan være sikker på, at der ikke kommer endnu en opdagelse, når så mange større ånder end os tog fejl med hensyn til denne. Jeg frygter, at vores øjne er større end maven, og vores nysgerrighed større end vores evner. Vi favner alt, men holder kun om vind.')
fixes('da',30,3,[('oversvømmede de hele Spanien','drog de gennem hele Spanien')])
setslot('da',30,4,'Det er meget sandsynligt, at denne voldsomme vandkatastrofe har ændret jordens beboede egne på mærkelige måder. Man mener jo, at havet har skilt Sicilien fra Italien:')
setslot('da',30,6,'[»Disse egne, siger man, blev engang revet fra hinanden af vældige kræfter og ødelæggelse, skønt de før havde været ét land.« — _Æneiden_, iii. 414.]')
fixes('en',30,6,[('These lands, they say, formerly with violence and vast desolation convulsed, burst asunder, where erewhile were.','These lands, they say, were once torn apart by force and vast destruction, though before they had been one.')])
ledger()
d=rd('review-progress.json');d.update(reviewedSlots=765,throughChapter=30,throughSlot=6,nextChapter=30,nextSlot=7,englishAuditCheckpoint={'chapter':30,'throughSlot':6},danishChangedSlots=len(rd('working-da-changes.json')),englishChangedSlots=len(rd('working-en-changes.json')));wr('review-progress.json',d)
wr('chapter30-source-check-01.json',{'coverage':'slots1–6','source':'https://fr.wikisource.org/wiki/Essais/Livre_I/Chapitre_31','decisions':['1 military disposition translated naturally.','2 France Antarctique historical Brazil colony name kept with southern gloss, not misleading modern Antarctic continent.','3 traversed country not water-flooding.','6 truncated English Virgil gloss restored final one-land clause.'],'nativeReview':'pending-user-arranged'})
a=rd('source-modern-da.json');b=rd('modern-da.json');e=rd('modern-en.json')
assert len(a['chapters'])==len(b['chapters'])==len(e['chapters'])==107
for ac,bc,ec in zip(a['chapters'],b['chapters'],e['chapters']):
 assert len(ac['paragraphs'])==len(bc['paragraphs'])==len(ec['paragraphs'])
 assert all(isinstance(s,str) and s.strip() for s in bc['paragraphs']+ec['paragraphs'])
wr('checkpoint-validation.json',{'chapters':107,'slots':4897,'reviewedSlots':765,'through':'30/6','chapterAndParagraphCountsPreserved':True,'emptyParagraphs':0,'fullBookComplete':False,'nativeReview':'pending-user-arranged'})
print(d['danishChangedSlots'],d['englishChangedSlots'])
