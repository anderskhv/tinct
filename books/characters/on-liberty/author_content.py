"""Manually reviewed historical and literary references in Mill's essay."""
import json
from pathlib import Path
entities=[]
for id,name,body,aliases in [
 ('akbar','Akbar','The Mughal emperor cited as an example of a capable absolute ruler.','Akbar'),
 ('charlemagne','Charlemagne','The Frankish king and emperor cited alongside Akbar.','Charlemagne'),
 ('comte','Auguste Comte','The French philosopher whose system of social organization Mill criticizes.','Comte'),
 ('socrates','Socrates','The Athenian philosopher used as a leading example in the discussion of free inquiry.','Socrates'),
 ('plato','Plato','The Greek philosopher and pupil of Socrates.','Plato'),
 ('aristotle','Aristotle','The Greek philosopher and pupil of Plato.','Aristotle'),
 ('paul','Saint Paul','The early Christian apostle, formerly a persecutor of Christians.','Saint Paul'),
 ('marcus','Marcus Aurelius','The Roman emperor and Stoic thinker, also called Antoninus here.','Emperor Marcus Aurelius|Marcus Aurelius|Antoninus'),
 ('constantine','Constantine','The Roman emperor associated with Christianity’s adoption by the imperial state.','Constantine'),
 ('johnson','Samuel Johnson','The English writer and critic quoted on religious persecution.','Dr. Johnson|Johnson'),
 ('luther','Martin Luther','The German religious reformer associated with the Protestant Reformation.','Luther'),
 ('arnold','Arnold of Brescia','The medieval religious reformer cited among those suppressed before Luther.','Arnold of Brescia'),
 ('dolcino','Fra Dolcino','The Italian religious dissenter cited among the predecessors of the Reformation.','Fra Dolcino'),
 ('savonarola','Girolamo Savonarola','The Florentine preacher and reformer cited in the discussion of persecution.','Savonarola'),
 ('mary','Mary I','The English queen whose reign is discussed in relation to Protestantism.','Queen Mary'),
 ('elizabeth','Elizabeth I','The English queen who succeeded Mary I.','Queen Elizabeth'),
 ('cicero','Cicero','The Roman orator and statesman, cited for studying both sides of an argument.','Cicero'),
 ('calvin','John Calvin','The Protestant reformer whose religious teaching Mill discusses.','Calvin'),
 ('knox','John Knox','The Scottish Protestant reformer.','John Knox|Knox'),
 ('rousseau','Jean-Jacques Rousseau','The philosopher whose criticism of modern civilization challenged prevailing opinion.','Rousseau'),
 ('humboldt','Wilhelm von Humboldt','The German scholar and statesman whose writing on individual development Mill draws on.','Baron Wilhelm von Humboldt|Wilhelm von Humboldt|Von Humboldt|Humboldt'),
 ('alcibiades','Alcibiades','The Athenian statesman and general, cited as an example of forceful individuality.','Alcibiades'),
 ('pericles','Pericles','The Athenian statesman whom Mill invokes as a model of developed character.','Pericles'),
 ('tocqueville','Alexis de Tocqueville','The French political thinker cited on growing social uniformity.','Tocqueville'),
 ('charles','Charles II','The English king whose reign followed the Puritan Commonwealth.','Charles II'),
 ('stanley','Lord Stanley','Edward Henry Stanley, the British politician discussed in the correspondence on temperance restrictions.','Lord Stanley'),
 ('bentham','Jeremy Bentham','The British philosopher and legal reformer cited on evidence.','Bentham'),
 ('locke','John Locke','The English philosopher named as a subject for the study of philosophy.','Locke'),
 ('kant','Immanuel Kant','The German philosopher named alongside Locke in the education example.','Kant')]:entities.append(dict(id=id,name=name,category='reference',body=body,subtitle='',kind='person',aliases=aliases.split('|'),snapshots=[]))
for id,name,body,aliases,kind in [
 ('jesus','Jesus Christ','The central figure of Christianity, whose teachings and treatment Mill discusses.','Christ|Founder of Christianity','religious-figure'),
 ('god','God','The divine being invoked in the discussion of belief, morality and religious authority.','God|Maker|Deity','religious-figure'),
 ('barnwell','George Barnwell','The young apprentice from the ballad and dramatic story used in Mill’s example about motives.','George Barnwell','literary-figure'),
 ('czar','The Czar','The Russian emperor, used here to illustrate a ruler’s dependence on bureaucracy.','Czar','unnamed-role')]:entities.append(dict(id=id,name=name,category='reference',body=body,subtitle='',kind=kind,aliases=aliases.split('|'),snapshots=[]))
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='on-liberty',contentVersion='2026-09-10.1',coverage='All five chapters in both English editions: named individuals and historically identifiable titles, with literary and religious references distinguished. Unnamed legal-case examples, institutions and philosophical-school adjectives are not assigned conjectural personal identities.',entities=entities),ensure_ascii=False,indent=2)+'\n')
