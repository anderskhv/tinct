"""Manually authored recognition cards for both full English texts of the play."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

for row in [
('falstaff','Sir John Falstaff','A fat old knight lodging at the Garter, short of money.','FALSTAFF|Falstaff|Sir John|Jack Falstaff','central'),
('mistress-page','Mistress Page','A Windsor wife, called Meg; Master Page’s wife and Anne’s mother.','MISTRESS PAGE|Mrs Page|Mistress Page|Meg','central'),
('mistress-ford','Mistress Ford','A Windsor wife, called Alice; Master Ford’s wife.','MISTRESS FORD|Mrs Ford|Mistress Ford','central'),
('ford','Master Ford','A Windsor householder, and a jealous husband.','MASTER FORD|Master Ford','major'),
('page','Master Page','A Windsor householder, Anne’s and William’s father.','MASTER PAGE|Master Page','major'),
('evans','Sir Hugh Evans','A Welsh parson and schoolmaster in Windsor.','EVANS|Evans|Sir Hugh|Hugh','major'),
('quickly','Mistress Quickly','Doctor Caius’s housekeeper, and go-between for everyone in the town.','QUICKLY|Quickly|Mistress Quickly','major'),
('shallow','Justice Shallow','A country justice, come to Windsor with a grievance against Falstaff.','SHALLOW|Shallow','major'),
('slender','Abraham Slender','Shallow’s foolish young cousin, and a suitor for Anne Page.','SLENDER|Slender|Abraham Slender','major'),
('caius','Doctor Caius','A French physician of Windsor, and a suitor for Anne Page.','CAIUS|Caius','major'),
('host','The Host of the Garter','The landlord of the Garter Inn.','HOST|Host','major'),
('pistol','Pistol','One of Falstaff’s followers.','PISTOL|Pistol','major'),
('simple','Peter Simple','Slender’s servant.','SIMPLE|Simple|Peter Simple','major'),
('anne','Anne Page','Master Page’s daughter, sought by three suitors.','ANNE|Anne|Nan','major'),
('fenton','Fenton','A young gentleman in love with Anne Page.','FENTON|Fenton','major'),
('bardolph','Bardolph','One of Falstaff’s followers, taken on as a drawer at the Garter.','BARDOLPH|Bardolph'),
('nym','Nym','One of Falstaff’s followers.','NYM|Nym'),
('william','William Page','Master Page’s young son, taken through his Latin by Sir Hugh.','WILLIAM|William Page'),
('rugby','John Rugby','Doctor Caius’s servant.','RUGBY|Rugby'),
('robin','Robin','Falstaff’s page, lent to Mistress Page.','ROBIN|Robin'),
]:add(*row)

for row in [
('first-servant','The First Servant','One of Ford’s servants, who carries the buck-basket.','FIRST SERVANT'),
('second-servant','The Second Servant','One of Ford’s servants, who carries the buck-basket.','SECOND SERVANT'),
('servant','The servant','A servant in Master Page’s house.','SERVANT'),
]:add(*row,kind='unnamed-role')

for row in [
('servants','The servants','Ford’s servants, who carry the buck-basket to Datchet Mead.','SERVANTS|Servants'),
('fairies','The fairies','The children and neighbours dressed as fairies at Herne’s oak.','Fairies|fairies'),
]:add(*row,kind='group')

for row in [
('herne','Herne the Hunter','The keeper of Windsor legend, said to walk the forest with great ragg’d horns.','Herne','literary-figure'),
('fat-woman','The fat woman of Brentford','A wise woman of Brentford whom Ford has forbidden his house; Falstaff escapes in her gown.','','person'),
('mother-prat','Mother Prat','The name Mistress Ford gives the fat woman’s gown when Falstaff is wearing it.','Prat','unresolved-name'),
('thomas-page','Master Thomas Page','Anne Page’s father under his given name, as Sir Hugh states it.','Master Thomas Page','person'),
('george-page','George','Master Page under his given name, as his wife uses it.','','person'),
('frank-ford','Frank','Master Ford under his given name.','','person'),
('sackerson','Sackerson','The bear Slender boasts of having led about.','Sackerson','person'),
('brainford-witch','The witch of Brentford','The woman Ford believes he is beating, being Falstaff in her gown.','','unresolved-name'),
('jove','Jove','The king of the gods, who took a bull’s shape for Europa and a swan’s for Leda.','Jove','mythological-figure'),
('europa','Europa','The woman Jove carried off in the shape of a bull.','Europa','mythological-figure'),
('leda','Leda','The woman Jove came to in the shape of a swan.','Leda','mythological-figure'),
('actaeon','Actaeon','The hunter turned to a stag, a byword here for the horned cuckold.','Actæon|Actaeon','mythological-figure'),
('alice-shortcake','Alice Shortcake','A Windsor woman Slender lent his Book of Riddles to.','Alice Shortcake','person'),
('ringwood','Ringwood','One of Actaeon’s hounds, in Pistol’s warning to Ford.','Ringwood','literary-figure'),
('hercules','Hercules','The strongest of the Greek heroes.','Hercules','mythological-figure'),
('pandarus','Pandarus','The go-between of the Troy story, in Pistol’s refusal.','Pandarus','literary-figure'),
('hobgoblin','Hobgoblin','The goblin of country belief, one of the parts in the fairy masque.','Hobgoblin','mythological-figure'),
('mephostophilus','Mephostophilus','The devil of the Faustus play, in Pistol’s abuse of Simple.','Mephostophilus','literary-figure'),
('lucifer','Lucifer','The chief of the fallen angels.','Lucifer','religious-figure'),
('barbason','Barbason','A demon whose name Ford will not answer to.','Barbason','mythological-figure'),
('machiavel','Machiavel','The byword for cunning statecraft the Host claims for himself.','Machiavel','person'),
('cataian','Cataian','A Cathayan, meaning a sharper; Page’s word for a man he will not believe.','Cataian','unresolved-name'),
]:add(*row[:4],category='reference',kind=row[4])

# Later cards: the two assumed names, and the marriages at Herne's oak.
updates={
 'ford':[((6,60),'A Windsor householder, visiting Falstaff under the name Brook to draw him out.')],
 'falstaff':[((19,7),'The old knight, escaped from Ford’s house in the fat woman of Brentford’s gown.')],
 'anne':[((23,80),'Master Page’s daughter, married to Fenton at the church by Eton.')],
 'fenton':[((23,80),'The young gentleman who has married Anne Page.')],
}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='merry-wives-of-windsor',contentVersion='2026-09-10.1',coverage='All twenty-three scenes in both original-en and modern-en: named cast, speaking and stage roles, the assumed names, and the legendary and classical figures named in the play.',entities=entities),ensure_ascii=False,indent=2)+'\n')
