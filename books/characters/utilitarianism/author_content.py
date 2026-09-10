"""Manually authored identities for the essay and its four footnotes."""
import json
from pathlib import Path
entities=[]
for id,name,body,aliases,kind in [
 ('socrates','Socrates','The Athenian philosopher represented in Plato’s dialogues.','Socrates','person'),
 ('protagoras','Protagoras','The Greek sophist who debates Socrates in Plato’s dialogue.','Protagoras','person'),
 ('plato','Plato','The Greek philosopher and author of the dialogue featuring Socrates and Protagoras.','Plato','person'),
 ('bentham','Jeremy Bentham','The British philosopher and reformer associated with the greatest-happiness principle.','Bentham','person'),
 ('kant','Immanuel Kant','The German philosopher whose account of moral duty Mill discusses.','Kant','person'),
 ('epicurus','Epicurus','The ancient Greek philosopher who made pleasure and freedom from pain central to a good life.','Epicurus','person'),
 ('carlyle','Thomas Carlyle','The Scottish writer and social critic quoted on the supposed right to happiness.','Carlyle','person'),
 ('novalis','Novalis','The German Romantic poet and thinker cited in the discussion of happiness.','Novalis','person'),
 ('jesus','Jesus of Nazareth','The central figure of Christianity, invoked for the Golden Rule and love of others.','Jesus of Nazareth|Christ','religious-figure'),
 ('galt','John Galt','The Scottish novelist who wrote Annals of the Parish.','Galt','person'),
 ('davis','The Rev. J. Llewellyn Davis','The clergyman who challenges Mill’s example about motives and rescuing a drowning person.','Rev. J. Llewellyn Davis|J. Llewellyn Davis','person'),
 ('comte','Auguste Comte','The French philosopher whose system of positive politics Mill discusses.','Comte','person'),
 ('owen','Robert Owen','The social reformer cited for his view that circumstances shape a person’s character.','Owen','person'),
 ('bain','Alexander Bain','The philosopher and psychologist whose work on the emotions and will Mill cites.','Professor Bain|Bain','person'),
 ('spencer','Herbert Spencer','The philosopher and author of Social Statics who corresponds with Mill about utility.','Herbert Spencer|Spencer','person'),
 ('god','God','The divine being discussed in relation to morality, happiness and religious belief.','God|Deity|Ruler of the Universe|Providence','religious-figure')]:entities.append(dict(id=id,name=name,category='reference',body=body,subtitle='',kind=kind,aliases=aliases.split('|'),snapshots=[]))
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='utilitarianism',contentVersion='2026-09-10.1',coverage='All five chapters and their footnotes in both English editions. Named thinkers, quoted correspondents and religious references; no invented characters for generic moral examples.',entities=entities),ensure_ascii=False,indent=2)+'\n')
