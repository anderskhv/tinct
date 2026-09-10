"""Hand-authored recognition copy; deterministic offline assembly only."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
def S(id,ch,pi,body,name=None):
 s=dict(after=[ch,pi],body=body)
 if name:s['name']=name
 next(e for e in entities if e['id']==id)['snapshots'].append(s)
C('sara','Sara Crewe','central','The story’s main character, Captain Crewe’s daughter.','Sara Crewe|Princess Sara|Miss Sara|Miss Crewe|Sara|Missee Sahib')
C('captain-crewe','Captain Crewe','major','Sara’s father, a British army officer serving in India.','Captain Crewe|Ralph Crewe')
C('miss-minchin','Miss Minchin','major','The headmistress of Sara’s London boarding school.','Miss Minchin|Maria Minchin')
C('amelia','Miss Amelia','supporting','Miss Minchin’s younger sister, who helps her run the school.','Miss Amelia|Amelia|Miss Meliar|Miss \'Meliar|Meliar')
C('ermengarde','Ermengarde St. John','major','The good-natured pupil at Miss Minchin’s school who struggles with her lessons.','Ermengarde St. John|Miss St. John|Ermengarde|Ermie')
S('ermengarde',3,67,'Sara’s loyal school friend, who struggles with her lessons.')
C('becky','Becky','major','The young scullery maid at Miss Minchin’s school.','Becky|Rebecca')
S('becky',6,58,'Sara’s friend, the young scullery maid at Miss Minchin’s school.')
S('becky',19,23,'Sara’s maid and friend, formerly the scullery maid at Miss Minchin’s school.')
C('lottie','Lottie Legh','supporting','One of the youngest pupils at Miss Minchin’s school, whose mother has died.','Lottie Legh|Miss Legh|Lottie')
S('lottie',4,55,'The little schoolgirl who treats Sara as an adoptive mother.')
C('lavinia','Lavinia Herbert','supporting','The older pupil at Miss Minchin’s school who resents Sara’s special treatment.','Lavinia Herbert|Lavinia|Lavvie|Lavvy')
C('jessie','Jessie','supporting','Lavinia’s school friend and frequent companion.','Jessie')
C('gertrude','Gertrude','supporting','One of the girls at Miss Minchin’s school.','Gertrude')
C('mariette','Mariette','supporting','The French maid hired to look after Sara at school.','Mariette')
C('dufarge','Monsieur Dufarge','supporting','The French teacher at Miss Minchin’s school.','Monsieur Dufarge|Dufarge|Frenchman')
C('barrow','Mr. Barrow','supporting','One of the London solicitors handling Captain Crewe’s affairs.','Mr. Barrow|Barrow')
C('skipworth','Mr. Skipworth','reference','Barrow’s partner in the firm handling Captain Crewe’s affairs.','Skipworth')
C('carrisford','Mr. Carrisford','major','The unwell English gentleman who moves into the house next to Sara’s school.','Mr. Carrisford|Carrisford|Carrrisford|Indian gentleman|Nindian gentleman')
S('carrisford',12,26,'Captain Crewe’s old school friend and business partner, the unwell gentleman living next door to Sara’s school.')
S('carrisford',18,55,'Sara’s guardian, formerly her father’s school friend and business partner.')
C('secretary','Mr. Carrisford’s secretary','supporting','The young man who works as Mr. Carrisford’s secretary.','secretary')
C('ram-dass','Ram Dass','major','The Indian servant in the house next door to Miss Minchin’s school.','Ram Dass|Lascar')
C('carmichael','Mr. Carmichael','supporting','The solicitor who is the father of the Large Family, Sara’s neighbors.','Mr. Carmichael|Carmichael|Mr. Montmorency')
C('mrs-carmichael','Mrs. Carmichael','supporting','The mother of the Large Family, whom Sara imagines as Mrs. Montmorency.','Mrs. Carmichael|Mrs. Montmorency')
C('large-family','The Large Family','supporting','The lively neighboring family whom Sara calls the Montmorencys.','Large Family|Montmorencys','group')
C('janet','Janet Carmichael','supporting','The eldest of the Large Family’s children, whom Sara calls Veronica Eustacia.','Janet|Veronica Eustacia')
C('nora','Nora Carmichael','supporting','One of the Large Family’s daughters, whom Sara calls Rosalind Gladys.','Nora|Rosalind Gladys')
C('donald','Donald Carmichael','supporting','One of the Large Family’s sons, whom Sara calls Guy Clarence.','Donald|Guy Clarence')
for id,name,body in [
 ('ethelberta','Ethelberta Beauchamp Montmorency','Sara’s imagined name for the youngest baby in the Large Family.'),
 ('violet','Violet Cholmondeley Montmorency','Sara’s imagined name for the next-youngest baby in the Large Family.'),
 ('sydney','Sydney Cecil Vivian Montmorency','Sara’s imagined name for the little boy in the Large Family who is just learning to walk.'),
 ('lilian','Lilian Evangeline Maud Marion','Sara’s imagined name for one of the Large Family’s children.'),
 ('claude','Claude Harold Hector','Sara’s imagined name for one of the Large Family’s children.')]:C(id,name,'supporting',body,name)
C('emily-doll','Emily','supporting','Sara’s much-loved doll and imaginary confidante.','Emily','object')
C('last-doll','The Last Doll','supporting','The new doll Captain Crewe gives Sara for her eleventh birthday, distinct from Emily.','Last Doll|last doll','object')
C('melchisedec','Melchisedec','supporting','The rat whom Sara befriends in the attic.','Melchisedec|Melchy','animal')
C('mrs-melchisedec','Mrs. Melchisedec','supporting','The female rat Sara regards as Melchisedec’s wife.','Mrs. Melchisedec','animal')
C('monkey','The monkey','supporting','The pet monkey in the house next door, cared for by Ram Dass.','monkey|Monkey','animal')
C('boris','Boris','supporting','Sara’s Russian boarhound, a gift from Mr. Carrisford.','Boris','animal')
C('baker','Mrs. Brown','supporting','The woman who runs the bakery where Sara buys buns.','Mrs. Brown')
C('anne','The hungry girl','supporting','The hungry child Sara encounters outside the bakery.')
S('anne',19,40,'The girl Sara met outside the bakery, now living and helping in Mrs. Brown’s shop.','Anne')
C('pascal','Madame Pascal','reference','The headmistress of the Paris school Mr. Carmichael investigates.','Madame Pascal|Pascal')
C('emily-carew','The girl at the Paris school','reference','The pupil from Madame Pascal’s school whom Mr. Carmichael is investigating.')
S('emily-carew',17,33,'The girl adopted by a Russian family, whom Mr. Carmichael confirms is not Sara.','Emily Carew')
for id,name,role,body,aliases in [
 ('st-john','Mr. St. John','reference','Ermengarde’s scholarly and demanding father.','Mr. St. John'),
 ('eliza','Aunt Eliza','reference','Ermengarde’s aunt, whom her father considers slow at learning.','Aunt Eliza'),
 ('meredith','Lady Meredith','reference','Captain Crewe’s acquaintance whose daughters attended Miss Minchin’s school.','Lady Meredith'),
 ('colonel-grange','Colonel Grange','reference','The army officer whose daughter Isobel is admired for her beauty.','Colonel Grange'),
 ('isobel','Isobel Grange','reference','Colonel Grange’s daughter, the girl Sara thinks of as conventionally beautiful.','Isobel Grange|Isobel'),
 ('musgrave','Mrs. Musgrave','reference','An acquaintance whom Sara has heard speaking French in India.','Mrs. Musgrave'),
 ('pitkin','Lady Pitkin','reference','An acquaintance whom Sara has heard speaking French.','Lady Pitkin'),
 ('james','James','supporting','One of the school’s servants, helping carry Sara’s birthday presents.','James'),
 ('emma','Emma','supporting','One of the school’s servants, helping carry Sara’s birthday presents.','Emma'),
 ('cook','The cook','supporting','The school’s harsh-tempered cook, who supervises Becky’s kitchen work.','cook|Cook')]:C(id,name,role,body,aliases)
for id,name,role,body,kind in [
 ('sara-mother','Sara’s mother','reference','Captain Crewe’s French wife and Sara’s mother.','unnamed-person'),
 ('ayah','Sara’s ayah','reference','The nurse who cared for Sara in India.','unnamed-person'),
 ('meredith-daughters','Lady Meredith’s daughters','reference','The two girls whose experience led Captain Crewe to choose Miss Minchin’s school.','group'),
 ('lottie-father','Lottie’s father','reference','The young widower who sends Lottie to Miss Minchin’s school.','unnamed-person'),
 ('lottie-mother','Lottie’s mother','reference','Lottie’s mother, who died when her daughter was very young.','unnamed-person'),
 ('ermengarde-aunts','Ermengarde’s two aunts','reference','The relatives who criticize Ermengarde’s weight.','group'),
 ('ermengarde-uncle','Ermengarde’s uncle','reference','The relative who quizzes Ermengarde on English history.','unnamed-person'),
 ('kind-aunt','Ermengarde’s kind aunt','reference','The aunt who sends Ermengarde a hamper of treats.','unnamed-person'),
 ('amelia-aunt','Miss Amelia’s aunt','reference','The elderly aunt with whom Miss Amelia spends a night.','unnamed-person'),
 ('grandmother','The Large Family’s grandmother','supporting','The grandmother in the lively neighboring family Sara watches.','unnamed-person'),
 ('doctor','Mr. Carrisford’s doctor','supporting','The physician attending the unwell gentleman next door.','unnamed-person'),
 ('nurse','Mr. Carrisford’s nurse','supporting','The nurse accompanying Mr. Carrisford on his arrival at the house.','unnamed-person'),
 ('men-servants','Mr. Carrisford’s attendants','supporting','The two male servants helping the unwell gentleman into his new home.','group'),
 ('footman','The footman','supporting','The carriage attendant at the unwell gentleman’s arrival.','unnamed-person'),
 ('russian-couple','The Russian couple','reference','The wealthy couple who adopt the girl from Madame Pascal’s school.','group'),
 ('russian-daughter','The Russian couple’s daughter','reference','The couple’s late daughter, whose school friend they adopt.','unnamed-person'),
 ('carew-father','The officer in the Paris school’s account','reference','The English officer whose daughter was placed at Madame Pascal’s school.','unnamed-person'),
 ('rat-family','Melchisedec’s children','supporting','The young rats in the attic whom Sara regards as Melchisedec’s family.','group'),
 ('sparrows','The sparrows','supporting','The birds Sara feeds outside her attic window.','group'),
 ('pony','Sara’s pony','supporting','The pony Captain Crewe provides for Sara while she is at school.','animal')]:C(id,name,role,body,'',kind)
for id,name,body,aliases,kind in [
 ('watts','Isaac Watts','The English hymn writer and poet, known for verses for children.','Watts','person'),
 ('coleridge','Samuel Taylor Coleridge','The English poet whom Sara uses as a standard for poetry.','Coleridge','person'),
 ('shakespeare','William Shakespeare','The English playwright and poet.','Shakespeare','person'),
 ('henry8','Henry VIII','The Tudor king of England in Sara’s history lesson.','Henry the Eighth','person'),
 ('monte-cristo','The Count of Monte Cristo','The imprisoned hero of Alexandre Dumas’s novel whom Sara uses in her imaginings.','Count of Monte Cristo','literary-figure'),
 ('sleeping-beauty','Sleeping Beauty','The fairy-tale princess who sleeps under an enchantment.','Sleeping Beauty','literary-figure'),
 ('buddha','The Buddha','The Buddhist spiritual teacher represented by the statue in the furniture van.','Buddha','religious-figure'),
 ('marie','Marie Antoinette','The French queen, called the Widow Capet during the Revolution.','Marie Antoinette|Widow Capet','person'),
 ('alfred','Alfred the Great','The Anglo-Saxon king in the story about burning cakes while in disguise.','Alfred the Great|King Alfred|Alfred','person'),
 ('neatherd-wife','The cowherd’s wife','The woman in the story who scolds the disguised King Alfred for burning her cakes.','','literary-figure'),
 ('edward3','Edward III','The medieval English king in Ermengarde’s uncle’s history question.','Edward the Third','person'),
 ('carlyle','Thomas Carlyle','The Scottish author of The French Revolution, one of Ermengarde’s books.','Carlyle','person'),
 ('robespierre','Maximilien Robespierre','The French Revolutionary leader in Sara’s account of the period.','Robespierre','person'),
 ('lamballe','The Princesse de Lamballe','The French princess and companion of Marie Antoinette in Sara’s historical reading.','Princesse de Lamballe','person'),
 ('god','God','The divine being invoked in prayers and expressions of hope.','God','deity'),
 ('merman','Prince Merman','The underwater prince in a story Sara tells the other girls.','Prince Merman','literary-figure'),
 ('story-princess','The princess in Sara’s story','The princess loved by Prince Merman in Sara’s invented tale.','','literary-figure'),
 ('mermaids','The mermaids','The underwater beings in Sara’s invented stories.','Mermaids|Mer-babies','group')]:C(id,name,'reference',body,aliases,kind)
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='a-little-princess',contentVersion='2026-09-10.1',coverage='All nineteen chapters in both local English editions: named cast and references, reviewed unnamed roles, pets, dolls, and imagined-name aliases; concealed business connection gated to reader knowledge.',entities=entities),ensure_ascii=False,indent=2)+'\n')
