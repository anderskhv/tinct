"""Manually authored speaker and reference identities for Phaedo."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('socrates','Socrates','central','The Athenian philosopher whose final conversation in prison Phaedo recounts.','SOCRATES|Socrates')
C('phaedo','Phaedo','central','Socrates’ companion who narrates his final day to Echecrates.','PHAEDO|Phaedo')
C('echecrates','Echecrates','supporting','The man in Phlius asking Phaedo to recount Socrates’ final hours.','ECHECRATES|Echecrates')
C('simmias','Simmias','major','The Theban friend of Socrates who, with Cebes, questions him about the soul.','SIMMIAS|Simmias')
C('cebes','Cebes','major','The Theban friend of Socrates who, with Simmias, examines his arguments about the soul.','CEBES|Cebes')
C('crito','Crito','major','Socrates’ longtime friend, attending to his practical needs in prison; father of Critobulus.','CRITO|Crito')
C('apollodorus','Apollodorus','supporting','The intensely emotional friend of Socrates present in the prison.','Apollodorus')
C('xanthippe','Xanthippe','supporting','Socrates’ wife, visiting him in prison with their young child.','Xanthippe')
for id,name,body,aliases in [
 ('critobulus','Critobulus','Crito’s son, one of the friends present with Socrates.','Critobulus'),
 ('hermogenes','Hermogenes','One of Socrates’ Athenian companions present in the prison.','Hermogenes'),
 ('epigenes','Epigenes','One of Socrates’ Athenian companions present in the prison.','Epigenes'),
 ('aeschines','Aeschines','The follower of Socrates present in the prison, distinct from the later Athenian orator.','Aeschines'),
 ('antisthenes','Antisthenes','The philosopher and follower of Socrates present in the prison.','Antisthenes'),
 ('ctesippus','Ctesippus','The Athenian from Paeania listed among Socrates’ companions in prison.','Ctesippus'),
 ('menexenus','Menexenus','One of Socrates’ companions present in the prison.','Menexenus'),
 ('phaedondes','Phaedondes','The Theban visitor listed with Simmias and Cebes.','Phaedondes'),
 ('euclid','Euclid of Megara','The philosopher visiting Socrates from Megara, distinct from the later mathematician.','Euclid'),
 ('terpison','Terpison','Euclid’s fellow visitor from Megara, also known as Terpsion.','Terpison|Terpsion')]:C(id,name,'supporting',body,aliases)
for id,name,body,aliases in [
 ('plato','Plato','The philosopher who wrote this dialogue, mentioned among Socrates’ absent friends.','Plato'),
 ('aristippus','Aristippus','The follower of Socrates whom Echecrates asks about, reported to be in Aegina.','Aristippus'),
 ('cleombrotus','Cleombrotus','The acquaintance of Socrates reported to be in Aegina with Aristippus.','Cleombrotus'),
 ('aesop','Aesop','The traditional Greek storyteller whose fables Socrates turns into verse.','Aesop'),
 ('evenus','Evenus','The poet and philosopher who asks about Socrates’ new verses.','Evenus'),
 ('philolaus','Philolaus','The Pythagorean thinker whom Simmias and Cebes have heard teaching in Thebes.','Philolaus'),
 ('anaxagoras','Anaxagoras','The Greek philosopher whose account of mind and nature Socrates discusses.','Anaxagoras'),
 ('milton','John Milton','The English poet cited in a translator’s comparison with Comus.','Milton'),
 ('homer','Homer','The ancient Greek epic poet whose Odyssey is quoted.','Homer'),
 ('aeschylus','Aeschylus','The Greek tragic poet whose play Telephus is cited.','Aeschylus'),
 ('glaucus','Glaucus','The craftsman whose art is invoked as proverbial for extraordinary skill.','Glaucus')]:C(id,name,'reference',body,aliases)
for id,name,body,aliases,kind in [
 ('theseus','Theseus','The Athenian hero whose voyage to Crete is commemorated by the sacred ship.','Theseus','mythological-figure'),
 ('apollo','Apollo','The Greek god honored by the mission to Delos and by Socrates’ hymn.','Apollo','deity'),
 ('endymion','Endymion','The figure of Greek myth famous for his unending sleep.','Endymion','mythological-figure'),
 ('penelope','Penelope','Odysseus’ wife in the Odyssey, recalled for weaving and unweaving her web.','Penelope','literary-figure'),
 ('heracles','Heracles','The Greek hero invoked in the comparison about needing help against two opponents.','Heracles','mythological-figure'),
 ('iolaus','Iolaus','Heracles’ companion and helper, invoked in the exchange between Socrates and Phaedo.','Iolaus','mythological-figure'),
 ('odysseus','Odysseus','The hero of Homer’s Odyssey, quoted speaking sternly to his own heart.','Odysseus','literary-figure'),
 ('harmonia','Harmonia','The Theban goddess and wife of Cadmus; her name supplies a joke about Simmias’s harmony argument.','Harmonia','deity'),
 ('cadmus','Cadmus','The legendary founder of Thebes and husband of Harmonia, used as a playful name for Cebes’s argument.','Cadmus','mythological-figure'),
 ('atlas','Atlas','The mythological bearer of the heavens, used in Socrates’ discussion of what supports the world.','Atlas','mythological-figure'),
 ('asclepius','Asclepius','The Greek god of healing to whom Socrates says a cock is owed.','Asclepius','deity'),
 ('god','God','The divine power invoked by Socrates and his companions in their discussion of the soul.','God','deity')]:C(id,name,'reference',body,aliases,kind)
for id,name,role,body,aliases,kind in [
 ('eleven','The Eleven','supporting','The Athenian officials responsible for prisoners and executions.','Eleven','group'),
 ('doorkeeper','The prison doorkeeper','supporting','The prison official who admits Socrates’ friends on the final morning.','','unnamed-person'),
 ('prison-officer','The prison officer','supporting','The servant of the Eleven who comes to announce that it is time for Socrates to drink the poison.','','unnamed-person'),
 ('poison-attendant','The poison attendant','supporting','The prison attendant who prepares and administers the poison.','','unnamed-person'),
 ('crito-servant','Crito’s servant','supporting','The servant whom Crito sends to fetch the poison attendant.','','unnamed-person'),
 ('crito-people','Crito’s attendants','supporting','The members of Crito’s household who escort Xanthippe home.','','group'),
 ('young-child','Socrates’ young child','supporting','The child whom Xanthippe holds during her prison visit.','','unnamed-person'),
 ('sons','Socrates’ sons','supporting','The three sons of Socrates, two young and one older.','','group'),
 ('women','The women of Socrates’ family','supporting','The female relatives who visit Socrates after his bath.','','group'),
 ('apollo-priest','The priest of Apollo','reference','The priest who crowns the sacred ship before its voyage to Delos.','','unnamed-person'),
 ('fourteen','The fourteen young Athenians','reference','The young people whom Theseus brings safely back from Crete in the recalled tradition.','','group'),
 ('guiding-spirit','The guiding spirit','reference','The personal guardian who leads a soul after death in Socrates’ account.','','religious-figure'),
 ('weaver','The weaver in Cebes’s comparison','reference','The imagined weaver used to compare the soul’s endurance with the body’s.','','unnamed-person')]:C(id,name,role,body,aliases,kind)
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='phaedo',contentVersion='2026-09-10.1',coverage='Complete dialogue in both English editions: framing and prison speakers, named visitors and references, reviewed family/official roles and the weaver analogy; stable recognition copy.',entities=entities),ensure_ascii=False,indent=2)+'\n')
