"""Manually reviewed cast for the surviving play text, excluding source footers."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))
for row in [
('rosalind','Rosalind','Duke Senior’s daughter and Celia’s cousin; the play’s central heroine.','ROSALIND|Rosalind|Rosalinde|Rosalinda|GANYMEDE|Ganymede','central'),
('orlando','Orlando','Sir Rowland de Boys’s youngest son and Oliver’s brother.','ORLANDO|Orlando','central'),
('celia','Celia','Duke Frederick’s daughter and Rosalind’s close friend and cousin.','CELIA|Celia|ALIENA|Aliena','major'),
('senior','Duke Senior','Rosalind’s father, driven into exile by his younger brother Frederick.','DUKE SENIOR|Duke Senior','major'),
('frederick','Duke Frederick','Celia’s father and Duke Senior’s younger brother, who has taken over the dukedom.','DUKE FREDERICK|Duke Frederick|FREDERICK|Frederick','major'),
('touchstone','Touchstone','The court fool who is close to Celia and Rosalind.','TOUCHSTONE|Touchstone|CLOWN','major'),
('le-beau','Le Beau','A courtier in Duke Frederick’s household.','LE BEAU|Le Beau'),
('charles','Charles','Duke Frederick’s wrestler.','CHARLES|Charles'),
('rowland','Sir Rowland de Boys','The late father of Oliver, Jaques de Boys and Orlando.','Sir Rowland de Boys|Sir Rowland'),
('jaques','Jaques','The melancholy courtier living in exile with Duke Senior.','JAQUES|Jaques','major'),
('jaques-brother','Jaques de Boys','Sir Rowland’s second son, brother to Oliver and Orlando.','JAQUES de BOYS|JAQUES DE BOYS'),
('amiens','Amiens','A courtier and singer among Duke Senior’s companions in exile.','AMIENS|Amiens'),
('hisperia','Hisperia','An attendant of Celia at Duke Frederick’s court.','Hisperia'),
('adam','Adam','The elderly servant of the de Boys family, devoted to Orlando.','ADAM|Adam'),
('oliver','Oliver','Sir Rowland de Boys’s eldest son and Orlando’s elder brother.','OLIVER|Oliver','major'),
('corin','Corin','An elderly shepherd in the Forest of Arden.','CORIN|Corin'),
('silvius','Silvius','The young shepherd in love with Phebe.','SILVIUS|Silvius','major'),
('phebe','Phebe','The shepherdess loved by Silvius.','PHEBE|Phebe|Phebes','major'),
('jane','Jane Smile','The countrywoman whom Touchstone recalls as an old love.','Jane Smile'),
('audrey','Audrey','The countrywoman courted by Touchstone.','AUDREY|Audrey'),
('martext','Sir Oliver Martext','The village vicar whom Touchstone asks to marry him to Audrey.','SIR OLIVER MARTEXT|Sir Oliver Martext|Sir Oliver|MARTEXT|Martext'),
('william','William','The young countryman who is in love with Audrey.','WILLIAM|William'),
]:add(*row)
for row in [
('forest-first-lord','The first exiled lord','One of Duke Senior’s companions in the Forest of Arden.',''),
('forest-second-lord','The second exiled lord','One of Duke Senior’s companions in the Forest of Arden.',''),
('court-first-lord','The first court lord','A lord attending Duke Frederick at his court.',''),
('court-second-lord','The second court lord','A lord attending Duke Frederick at his court.',''),
('hunting-lord','The lord returning from the hunt','One of the forest lords whom Jaques meets after the deer hunt.',''),
('first-page','The first page','One of the Duke’s pages who sings for Touchstone and Audrey.','FIRST PAGE'),
('second-page','The second page','One of the Duke’s pages who sings for Touchstone and Audrey.','SECOND PAGE'),
('corin-master','Corin’s employer','The owner of the cottage, pasture and flock that are offered for sale.',''),
('religious-man','The old religious man','The religious man whom Frederick meets at the edge of the forest.',''),
('rosalind-uncle','The uncle in Ganymede’s story','The religious uncle whom Rosalind, as Ganymede, credits with teaching her about love.',''),
('magician','The magician in Rosalind’s story','The magician whom Rosalind claims to have known since childhood.',''),
('cured-lover','The lover in Ganymede’s story','The man whom Rosalind, as Ganymede, claims to have cured of love.',''),
]:add(*row,kind='unnamed-role')
add('hymen','Hymen','The figure of the god of marriage who presides over the couples’ union.','HYMEN|Hymen',kind='mythological-figure')
for row in [
('ovid','Ovid','The Roman poet whose exile is invoked by Touchstone.','Ovid'),
('pythagoras','Pythagoras','The Greek philosopher associated with the transmigration of souls, invoked in Rosalind’s joke.','Pythagoras'),
('cleopatra','Cleopatra','The queen of Egypt invoked as an example of majesty in the poem about Rosalind.','Cleopatra'),
('lucretia','Lucretia','The Roman woman traditionally celebrated for chastity, invoked in the poem about Rosalind.','Lucretia'),
('marlowe','Christopher Marlowe','The poet of Hero and Leander, addressed as the dead shepherd when Phebe quotes him.',''),
('caesar','Julius Caesar','The Roman general whose boast about coming, seeing and conquering Rosalind quotes.','Caesar'),
]:add(*row[:4],category='reference',kind=row[4] if len(row)>4 else 'person')
for row in [
('fortune','Fortune','Luck personified as a woman distributing gifts from her wheel.','Lady Fortune|Fortune','mythological-figure'),
('nature','Nature','Nature personified as the giver of physical qualities, contrasted with Fortune.','Nature','mythological-figure'),
('fates','The Fates','The classical powers governing destiny, called the Destinies.','Destinies','group'),
('hercules','Hercules','The mythological hero of extraordinary strength, invoked at the wrestling match.','Hercules','mythological-figure'),
('cupid','Cupid','The classical god of love.','Cupid','mythological-figure'),
('juno','Juno','The Roman goddess of marriage, associated with Jupiter.','Juno','mythological-figure'),
('jove','Jupiter','The Roman king of the gods, also called Jove.','Jove|Jupiter','mythological-figure'),
('ganymede-myth','Ganymede in mythology','The Trojan youth who serves as Jupiter’s cupbearer.','','mythological-figure'),
('adam-bible','Adam in the Bible','The first man in the biblical creation story, invoked in Duke Senior’s reflection on exile.','','religious-figure'),
('diana','Diana','The classical goddess of hunting and chastity, also invoked as the moon.','Diana|Queen of Night','mythological-figure'),
('helen','Helen of Troy','The woman celebrated for beauty in Trojan legend, invoked in the poem about Rosalind.','Helen','literary-figure'),
('atalanta','Atalanta','The swift runner and huntress of Greek myth, invoked in comparisons with Rosalind and Orlando.','Atalanta','mythological-figure'),
('gargantua','Gargantua','The giant in Rabelais’s stories, invoked for the size of his mouth.','Gargantua','literary-figure'),
('judas','Judas Iscariot','The biblical betrayer of Jesus, invoked in Celia’s jokes about hair and kisses.','Judas','religious-figure'),
('troilus','Troilus','The Trojan lover invoked in Rosalind’s argument about dying for love.','Troilus','literary-figure'),
('leander','Leander','The mythological lover who swims the Hellespont to visit Hero.','Leander','literary-figure'),
('hero','Hero','The priestess at Sestos loved by Leander in classical legend.','Hero of Sestos|Hero','literary-figure'),
('venus','Venus','The Roman goddess of love.','Venus','mythological-figure'),
('phoenix','The phoenix','The legendary bird evoked as an emblem of rarity in Rosalind’s teasing.','Phoenix','mythological-figure'),
('god','God','The Christian deity invoked in prayers and oaths.','God|Goddild','religious-figure'),
]:add(*row[:4],category='reference',kind=row[4] if len(row)>4 else 'person')
add('wrestlers-father','The wrestlers’ father','The elderly father of the three young men who wrestle Charles.','',kind='unnamed-role')
add('three-wrestlers','The three brothers','The three brothers who take on Charles in the wrestling match.','',kind='group')
add('song-oliver','Oliver in the song','The Oliver addressed in the song fragment Touchstone quotes to the vicar.','',category='reference',kind='literary-figure')
updates={
'rosalind':[((2,47),'Duke Senior’s daughter, disguised as the young man Ganymede.'),((17,47),'Orlando’s bride and Duke Senior’s daughter; formerly disguised as Ganymede.')],
'celia':[((2,48),'Rosalind’s cousin, traveling in disguise as Aliena.'),((17,47),'Oliver’s bride and Rosalind’s cousin; formerly disguised as Aliena.')],
'orlando':[((17,47),'Rosalind’s bridegroom, Sir Rowland de Boys’s youngest son.')],
'oliver':[((17,47),'Celia’s bridegroom and Orlando’s elder brother.')],
'senior':[((17,52),'Rosalind’s father, restored to his dukedom after exile.')],
'frederick':[((17,52),'Celia’s father and Duke Senior’s brother, who has renounced his rule for a religious life.')],
'silvius':[((17,50),'The shepherd paired with Phebe at the wedding.')],
'phebe':[((17,50),'The shepherdess who agrees to marry Silvius.')],
'audrey':[((17,47),'Touchstone’s bride, a countrywoman of Arden.')],
'touchstone':[((17,47),'The court fool and Audrey’s bridegroom.')],
}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='as-you-like-it',contentVersion='2026-09-10.1',coverage='All surviving play text and epilogue across the seventeen source reading units in original-en and modern-en. Opening Act 1 scene 1 is absent; several later scenes share units and titles are wrong. Publishing footer text is excluded. Coverage is not claimed for absent text.',entities=entities),ensure_ascii=False,indent=2)+'\n')
