"""Handwritten cast and reference cards for every scene in both source editions."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))
for row in [
('katherina','Katherina Minola','Baptista’s elder daughter and Bianca’s sister; one of the play’s two central characters.','Katherina Minola|Katherina|Katherine|Kate|KATHERINA','central'),
('petruchio','Petruchio','A gentleman from Verona seeking a wealthy wife; one of the play’s two central characters.','Petruchio|PETRUCHIO','central'),
('bianca','Bianca Minola','Baptista’s younger daughter and Katherina’s sister, courted by several men.','Bianca|BIANCA','major'),
('lucentio','Lucentio','Vincentio’s son, a young gentleman who comes to Padua to study.','Lucentio|LUCENTIO|Cambio','major'),
('tranio','Tranio','Lucentio’s resourceful servant and companion.','Tranio|TRANIO','major'),
('baptista','Baptista Minola','The wealthy Paduan father of Katherina and Bianca.','Baptista Minola|Baptista|Minola|BAPTISTA','major'),
('gremio','Gremio','An elderly, wealthy suitor of Bianca.','Gremio|GREMIO','major'),
('hortensio','Hortensio','A suitor of Bianca and a friend of Petruchio.','Hortensio|HORTENSIO|Licio|Litio','major'),
('grumio','Grumio','Petruchio’s servant, who accompanies him from Verona.','Grumio|GRUMIO','major'),
('biondello','Biondello','One of Lucentio’s servants.','Biondello|BIONDELLO'),
('vincentio','Vincentio','Lucentio’s father, a wealthy merchant from Pisa.','Vincentio|VINCENTIO'),
('antonio','Antonio','Petruchio’s late father.','Antonio'),
('curtis','Curtis','A servant at Petruchio’s country house.','Curtis|CURTIS'),
('pedant','The Pedant','The elderly traveler from Mantua whom Biondello spots; called the Pedant.','Pedant|PEDANT|pedant'),
('widow','The widow','The wealthy widow who is fond of Hortensio.','Widow|WIDOW|widow'),
('sly','Christopher Sly','The tinker watching the play in its framing scene.','Sly|SLY'),
('page','Bartholomew, the page','The page playing Sly’s wife in the framing scene.','PAGE'),
('ferdinand','Ferdinand','Petruchio’s cousin, whom he summons at his country house.','Ferdinand'),
]:add(*row)
for name in ['Nathaniel','Joseph','Nicholas','Philip','Walter','Sugarsop','Gregory','Gabriel','Peter','Adam','Ralph']:
 add(name.lower(),name,'One of the servants in Petruchio’s household.',name+'|'+name.upper())
for row in [
('frame-servant','The servant attending Sly','The servant who reminds Sly to watch the play.',''),
('baptista-servant','Baptista’s servant','A servant in Baptista’s household.',''),
('petruchio-servant','Petruchio’s unnamed servant','One of Petruchio’s household servants.',''),
('tailor','The tailor','The craftsman hired to make Katherina’s gown.','Tailor|TAILOR|tailor'),
('haberdasher','The haberdasher','The craftsman who brings a cap for Katherina.','Haberdasher|HABERDASHER|haberdasher'),
('wedding-priest','The wedding priest','The priest who conducts Katherina and Petruchio’s wedding.',''),
('sexton','The sexton','The church attendant at Katherina and Petruchio’s wedding.','sexton'),
('luke-priest','The priest at Saint Luke’s','The priest whom Biondello arranges to be ready for Lucentio and Bianca.',''),
('officer','The officer','The officer brought into the dispute outside Lucentio’s house.','Officer|OFFICER'),
]:add(*row,kind='unnamed-role')
add('troilus','Troilus','Petruchio’s spaniel.','Troilus',kind='animal')
add('servants','Petruchio’s servants','The household servants at Petruchio’s country house.','',kind='group')
for row in [
('aristotle','Aristotle','The Greek philosopher whom Tranio mentions when discussing Lucentio’s studies.','Aristotle'),
('ovid','Ovid','The Roman poet of love and mythology, contrasted with Aristotle in Tranio’s advice.','Ovid'),
('socrates','Socrates','The Greek philosopher mentioned through his marriage to Xanthippe.','Socrates'),
('xanthippe','Xanthippe','Socrates’s wife, traditionally portrayed as sharp-tempered.','Xanthippe'),
('lucrece','Lucretia','The Roman woman traditionally celebrated for chastity, invoked in Petruchio’s comparison.','Lucrece'),
]:add(*row,category='reference')
for row in [
('minerva','Minerva','The Roman goddess of wisdom and the arts, invoked in praise of Bianca.','Minerva'),
('anna','Anna','Dido’s sister and confidante in Virgil’s Aeneid.','Anna'),
('dido','Dido','The queen of Carthage in Virgil’s Aeneid; Anna’s sister.','Queen of Carthage'),
('agenor','Agenor','The mythological king who is Europa’s father.','Agenor'),
('europa','Europa','Agenor’s daughter, whom Jupiter carries to Crete in Greek myth.',''),
('jove','Jupiter','The Roman king of the gods, called Jove.','Jove'),
('florentius','Florentius','The knight in the medieval tale who promises to marry an apparently ugly old woman.','Florentius'),
('florentius-wife','Florentius’s bride','The apparently ugly woman whom Florentius agrees to marry in the medieval tale.',''),
('sibyl','The Sibyl','The ancient prophetess invoked as an example of extreme age.','Sibyl'),
('leda','Leda','The mythological mother of Helen of Troy.','Leda'),
('helen','Helen of Troy','Leda’s daughter, famed for her beauty and many suitors.',''),
('paris','Paris','The Trojan prince associated with Helen of Troy.','Paris'),
('hercules','Hercules','The mythological hero famed for his twelve labors; also called Alcides.','Hercules|Alcides'),
('diana','Diana','The Roman goddess of the hunt and chastity, called Dian in the original edition.','Dian|Diana'),
('griselda','Griselda','The patient wife of medieval storytelling, called Grissel in Petruchio’s comparison.','Grissel|Griselda'),
('priam','Priam','The king of Troy named in the Latin lesson.','Priami'),
('ajax','Ajax','The Greek warrior at Troy whom Lucentio identifies by the epithet Æacides.','Æacides|Ajax'),
('aeacus','Aeacus','Ajax’s grandfather in Greek myth, the ancestor referred to in the Latin lesson.',''),
('song-jack','Jack in the song','The boy addressed in the song fragment quoted by Grumio.',''),
]:add(*row,category='reference',kind='literary-figure')
for row in [
('god','God','The Christian deity invoked in the characters’ prayers and oaths.','God|Lord'),
('anne','Saint Anne','The saint traditionally identified as the Virgin Mary’s mother, invoked by Sly.','Saint Anne'),
('george','Saint George','The saint invoked in Petruchio’s oath.','Saint George'),
('james','Saint James','The saint invoked as Saint Jamy in Biondello’s oath.','Saint Jamy'),
]:add(*row,category='reference',kind='religious-figure')
add('bentivolii','The Bentivoglio family','The family from which Lucentio says his father Vincentio descends.','Bentivolii',category='reference',kind='group')
for id,name,body in [
('venice-duke','The Duke of Venice','The Venetian ruler named in Tranio’s invented story about a quarrel with Mantua.'),
('mantua-duke','The Duke of Mantua','The Mantuan ruler named in Tranio’s invented story about a quarrel with Venice.'),
('padua-duke','The Duke of Padua','The ruler in whose name Vincentio demands an arrest.'),
]:add(id,name,body,category='reference',kind='unnamed-role')
updates={
'katherina':[((3,0),'Baptista’s elder daughter and Bianca’s sister.'),((5,61),'Petruchio’s wife, Baptista’s elder daughter and Bianca’s sister.')],
'petruchio':[((5,61),'Katherina’s husband, a gentleman from Verona.')],
'lucentio':[((3,37),'Vincentio’s son, courting Bianca while disguised as the tutor Cambio.'),((11,75),'Bianca’s husband and Vincentio’s son; formerly disguised as Cambio.')],
'tranio':[((1,62),'Lucentio’s servant, posing as his master.'),((11,80),'Lucentio’s servant, who impersonated him during the courtship.')],
'hortensio':[((3,27),'Bianca’s suitor, disguised as the music teacher Licio.'),((7,17),'Petruchio’s friend, formerly Bianca’s suitor and the disguised tutor Licio.'),((12,1),'The widow’s husband and Petruchio’s friend; formerly disguised as Licio.')],
'pedant':[((7,55),'The traveler from Mantua whom Tranio recruits to impersonate Vincentio.')],
'widow':[((12,1),'Hortensio’s wealthy new wife.')],
'bianca':[((11,75),'Lucentio’s wife, Baptista’s younger daughter and Katherina’s sister.')],
}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='taming-of-the-shrew',contentVersion='2026-09-10.1',coverage='All twelve available scenes in both English editions, including the surviving Sly-frame interruption, named household servants and references. The source editions omit the opening Induction; its absent cast is not claimed as covered. Disguises and marriage changes are source-gated.',entities=entities),ensure_ascii=False,indent=2)+'\n')
