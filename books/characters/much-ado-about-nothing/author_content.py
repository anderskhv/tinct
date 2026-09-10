"""Manual cast and reference copy, reviewed across all seventeen scenes."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))
for row in [
('beatrice','Beatrice','Leonato’s niece and Hero’s cousin, known for her sharp exchanges with Benedick.','Beatrice|BEATRICE|Lady Disdain','central'),
('benedick','Benedick','A gentleman and soldier from Padua, and Beatrice’s sparring partner.','Signior Mountanto|Benedick|BENEDICK','central'),
('hero','Hero','Leonato’s daughter and Beatrice’s cousin.','Hero|HERO','central'),
('claudio','Count Claudio','The young Florentine soldier returning from war with Don Pedro.','Count Claudio|Claudio|CLAUDIO|Count Comfect|Count','central'),
('leonato','Leonato','The governor of Messina, Hero’s father and Beatrice’s uncle.','Leonato|LEONATO','major'),
('pedro','Don Pedro','The Prince of Aragon and Don John’s brother, returning from war with Claudio and Benedick.','Don Pedro|DON PEDRO|Prince','major'),
('john','Don John','Don Pedro’s illegitimate half-brother.','Don John|DON JOHN','major'),
('antonio','Antonio','Leonato’s brother and uncle to Hero and Beatrice.','Antonio|ANTONIO|Anthony'),
('borachio','Borachio','A follower of Don John.','Borachio|BORACHIO','major'),
('conrade','Conrade','A companion and follower of Don John.','Conrade|CONRADE'),
('margaret','Margaret','Hero’s waiting gentlewoman, also called Meg.','Margaret|MARGARET|Meg'),
('ursula','Ursula','An attendant and companion of Hero.','Ursula|Ursala|URSULA'),
('balthasar','Balthasar','Don Pedro’s attendant and a singer.','Balthasar|BALTHASAR'),
('dogberry','Dogberry','The constable in charge of Messina’s watch.','Dogberry|DOGBERRY|Constable','major'),
('verges','Verges','The elderly officer who assists Dogberry.','Verges|VERGES'),
('george','George Seacoal','The watchman whom Dogberry chooses to lead the night patrol.','George Seacoal|Seacoal|SECOND WATCH'),
('hugh','Hugh Oatcake','One of the men proposed to lead the watch because he can read and write.','Hugh Oatcake'),
('francis-seacoal','Francis Seacoal, the sexton','The parish clerk whom Dogberry summons to record the examination of the prisoners.','Francis Seacoal|Sexton|SEXTON|sexton'),
('friar','Friar Francis','The priest who attends Hero and Claudio’s wedding ceremony.','Friar Francis|Friar|FRIAR|friar','major'),
]:add(*row)
for row in [
('army-messenger','Don Pedro’s messenger','The messenger who brings Leonato news of Don Pedro’s returning army.',''),
('wedding-messenger','The wedding messenger','The messenger who calls Leonato to the wedding.',''),
('capture-messenger','The final messenger','The messenger who brings Don Pedro news of his brother.',''),
('claudio-uncle','Claudio’s uncle','Claudio’s uncle in Messina, to whom news of his military success is sent.',''),
('hero-mother','Hero’s mother','Leonato’s wife and Hero’s mother, mentioned in the opening exchange.',''),
('fool','Leonato’s fool','The household fool whom Beatrice recalls answering Benedick’s archery challenge.',''),
('antonio-son','Antonio’s son','Leonato’s nephew, who is arranging music for the festivities.',''),
('antonio-servant','Antonio’s servant','The servant who overhears Don Pedro and Claudio in the orchard.',''),
('boy','Benedick’s boy','The young servant whom Benedick sends to fetch a book.','BOY|Boy'),
('first-watch','The first watchman','One of the members of Messina’s night watch.','FIRST WATCH'),
('watch','The watch','Messina’s night watch, supervised by Dogberry and Verges.','WATCH|Watch'),
('lord','The lord at the tomb','A lord attending Don Pedro and Claudio at the tomb.','A LORD'),
('pedro-father','Don Pedro’s father','The father of Don Pedro and Don John, mentioned in Beatrice’s banter.',''),
]:add(*row,kind='group' if row[0]=='watch' else 'unnamed-role')
for row in [
('adam-bell','Adam Bell','The legendary English archer invoked in Benedick’s joke about being shot at.',''),
('adam','Adam','The first man in the biblical creation story, invoked in Beatrice and Benedick’s banter.',''),
('cupid','Cupid','The god of love, frequently invoked in the jokes about courtship.','Cupid'),
('vulcan','Vulcan','The Roman smith god, contrasted with Cupid in Benedick’s joke.','Vulcan'),
('peter','Saint Peter','The apostle imagined by Beatrice as admitting her to heaven.','Saint Peter'),
('philemon','Philemon','The humble host who welcomes Jupiter in classical myth.','Philemon'),
('jove','Jupiter','The Roman king of the gods, called Jove.','Jove'),
('hercules','Hercules','The mythological hero famed for strength and his twelve labors.','Hercules'),
('ate','Ate','The classical spirit of ruin and discord, invoked in Benedick’s complaint about Beatrice.','Ate'),
('prester','Prester John','The legendary Christian priest-king of a distant eastern kingdom.','Prester John'),
('hector','Hector','The Trojan warrior invoked as a model of courage.','Hector'),
('pharaoh','Pharaoh','The biblical Egyptian ruler evoked through a painting of his soldiers.','Pharaoh'),
('bel','Bel','The Babylonian deity invoked through an image of his priests.','Bel'),
('diana','Diana','The Roman goddess associated with chastity, called Dian in the original edition.','Dian|Diana'),
('venus','Venus','The Roman goddess of love.','Venus'),
('leander','Leander','The legendary lover who swims across the Hellespont.','Leander'),
('troilus','Troilus','The Trojan lover from the story of Troilus and Cressida.','Troilus'),
('phoebus','Phoebus','Apollo as the sun god, invoked at daybreak.','Phoebus'),
('hymen','Hymen','The classical god of marriage, invoked by Claudio.','Hymen'),
('europa','Europa','The mythological woman carried away by Jupiter in the form of a bull.',''),
]:add(*row,category='reference',kind='religious-figure' if row[0] in ['adam','peter','pharaoh','bel'] else 'literary-figure')
add('god','God','The Christian deity invoked in the characters’ prayers and oaths.','God',category='reference',kind='religious-figure')
add('devil','The Devil','The infernal figure in Beatrice’s imagined account of the afterlife.','Devil',category='reference',kind='religious-figure')
add('cham','The Great Cham','The title of a powerful Asian ruler invoked in Benedick’s extravagant offer to travel to distant lands.','Great Cham|Great Khan',category='reference',kind='unnamed-role')
add('pygmies','The Pygmies','The legendary people of small stature named in Benedick’s fanciful catalogue of distant journeys.','Pygmies',category='reference',kind='group')
add('duchess','The Duchess of Milan','The duchess whose fashionable gown Margaret recalls seeing.','Duchess of Milan',category='reference',kind='unnamed-role')
add('duke','The duke','The unnamed ruler invoked as the authority behind Messina’s officers.','Duke',category='reference',kind='unnamed-role')
add('deformed','Deformed','The imaginary thief whom the watch thinks Borachio has named, misunderstanding his complaint about fashion.','Deformed',kind='literary-figure')
add('prisoners','Borachio and Conrade','Don John’s two followers, answering together during the examination.','BOTH',kind='group')
updates={
'claudio':[((4,123),'Hero’s intended husband, a young Florentine count and soldier.'),((12,48),'The Florentine count who has broken off his wedding to Hero.'),((17,40),'Hero’s intended husband, now reconciled with her.')],
'hero':[((4,123),'Claudio’s intended bride, Leonato’s daughter and Beatrice’s cousin.'),((12,74),'Leonato’s daughter and Beatrice’s cousin, secretly alive while her death is announced.'),((17,40),'Claudio’s intended bride, reunited with him after her innocence is established.')],
'beatrice':[((17,63),'Benedick’s intended wife, Hero’s cousin and Leonato’s niece.')],
'benedick':[((17,63),'Beatrice’s intended husband, a gentleman and soldier from Padua.')],
}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='much-ado-about-nothing',contentVersion='2026-09-10.1',coverage='All seventeen scenes in both English editions: named cast, servants, civic officers, framing messengers, religious and literary references. Masked and assumed names are scoped; accusations and reported deaths do not become facts. Formal final marriages remain pending.',entities=entities),ensure_ascii=False,indent=2)+'\n')
