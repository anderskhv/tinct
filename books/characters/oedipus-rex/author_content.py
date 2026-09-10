"""Manually authored identities; family revelations gated to the text."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',updates=None):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=updates or []))
C('oedipus','Oedipus','central','King of Thebes and husband of Jocasta.','Oedipus',updates=[{'after':[9,145],'body':'The king of Thebes, now revealed as the son of Laius and of his own wife, Jocasta.'}])
C('jocasta','Jocasta','major','Queen of Thebes, wife of Oedipus and sister of Creon. Formerly married to Laius.','Jocasta',updates=[{'after':[9,145],'body':'Oedipus’s wife and mother, formerly married to Laius; Creon’s sister.'}])
C('creon','Creon','major','Jocasta’s brother and an influential member of the Theban royal household.','Creon')
C('teiresias','Teiresias','major','The blind prophet consulted by Thebes.','Teiresias')
C('laius','Laius','major','The former king of Thebes and Jocasta’s previous husband.','Laius',updates=[{'after':[9,145],'body':'The former king of Thebes, husband of Jocasta and father of Oedipus.'}])
C('polybus','Polybus','reference','King of Corinth and Oedipus’s father.','Polybus',updates=[{'after':[9,46],'body':'The king of Corinth who raised Oedipus as his son, though they were not related by blood.'}])
C('merope','Merope','reference','Queen of Corinth, wife of Polybus and mother of Oedipus.','Merope',updates=[{'after':[9,145],'body':'Polybus’s wife, who raised Oedipus in Corinth as her son.'}])
C('priest','The priest of Zeus','supporting','The elderly priest speaking for the people gathered outside Oedipus’s palace.','Priest of Zeus|Priest','unnamed-role')
C('chorus','The Theban elders','major','The elders of Thebes who speak and sing as the chorus.','Chorus','group')
C('messenger','The Corinthian messenger','supporting','The messenger bringing news from Corinth.','','unnamed-person',updates=[{'after':[9,54],'body':'The messenger from Corinth, a former shepherd who brought the infant Oedipus to Polybus.'}])
C('herdsman','Laius’s herdsman','supporting','The old shepherd who served King Laius.','Herdsman','unnamed-person')
C('second-messenger','The palace messenger','supporting','The servant reporting events inside the Theban palace.','Second Messenger','unnamed-person')
C('antigone','Antigone','supporting','A daughter of Oedipus and Jocasta, and Ismene’s sister.','Antigone')
C('ismene','Ismene','supporting','A daughter of Oedipus and Jocasta, and Antigone’s sister.','Ismene')
C('menoeceus','Menoeceus','reference','The father of Creon and Jocasta.','Menoeceus')
C('labdacus','Labdacus','reference','Laius’s father, an ancestor of the Theban royal line.','Labdacus')
C('polydorus','Polydorus','reference','Cadmus’s son and Labdacus’s father in the Theban royal ancestry.','Polydore|Polydorus')
C('cadmus','Cadmus','reference','The legendary founder of Thebes.','Cadmus')
C('agenor','Agenor','reference','Cadmus’s father in the royal ancestry recited by Oedipus.','Agenor')
C('sphinx','The Sphinx','reference','The riddling monster that once threatened Thebes.','Sphinx|fell songstress|winged songstress','mythical-creature')
for id,name,body,aliases in [
 ('zeus','Zeus','The chief god of the Greek pantheon.','Zeus'),
 ('athena','Athena','The Greek goddess of wisdom and protector of cities, also called Pallas.','Athene|Athena|Pallas'),
 ('apollo','Apollo','The god of prophecy whose oracle at Delphi guides the inquiry. Also called Phoebus and Loxias.','Apollo|Phoebus|Loxias|Lycean King|Lord Lycean'),
 ('artemis','Artemis','The Greek goddess of the hunt, Apollo’s sister.','Artemis'),
 ('ares','Ares','The Greek god of war, invoked here as a destructive power afflicting the city.','Ares'),
 ('amphitrite','Amphitrite','The sea goddess, whose domain is invoked as a distant place of banishment.','Amphitrite'),
 ('pluto','Pluto','The ruler of the underworld, also known as Hades.','Pluto'),
 ('bacchus','Bacchus','Dionysus, the god of wine and ecstatic worship, closely associated with Thebes.','Bacchus'),
 ('pan','Pan','The rustic god of shepherds and wild mountain places.','Pan'),
 ('hermes','Hermes','The messenger god associated with Mount Cyllene.','Cyllene’s lord|lord of Cyllene'),
 ('pythia','The Pythia','The priestess who speaks Apollo’s oracle at Delphi.','Pythia'),
 ('fates','The Fates','The divine powers governing destiny in Greek tradition.','Fates')]:C(id,name,'reference',body,aliases,'cultural-figure')
C('maenads','The Maenads','reference','The ecstatic female followers of Bacchus.','Maenads','mythical-group')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='oedipus-rex',contentVersion='2026-09-10.1',coverage='Both complete English editions: named cast including final silent daughters, all speaker roles, named ancestors and divine references. Parentage is not explained before the play establishes it.',entities=entities),ensure_ascii=False,indent=2)+'\n')
