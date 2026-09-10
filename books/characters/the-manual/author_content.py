"""Manually authored references from Epictetus' complete Manual."""
import json
from pathlib import Path
entities=[]
def C(id,name,body,aliases=None,kind='person'):
 entities.append(dict(id=id,name=name,category='reference',body=body,subtitle='',kind=kind,aliases=aliases or [name],snapshots=[]))
C('socrates','Socrates','The Athenian philosopher, used as an example of living by reason.')
C('diogenes','Diogenes','Diogenes of Sinope, the Cynic philosopher known for rejecting conventional comforts.')
C('heraclitus','Heraclitus','The Greek philosopher from Ephesus, cited alongside Diogenes.',['Heracleitus','Heraclitus'])
C('euphrates','Euphrates','A philosopher from Syria admired for his eloquent teaching.')
C('caesar','Caesar','A title for the Roman emperor; this example does not identify a particular ruler.',['Cæsar','Caesar'],'title-reference')
C('polynices','Polynices','Eteocles’ brother, one of the rival sons of Oedipus in Greek legend.')
C('eteocles','Eteocles','Polynices’ brother, one of the rival sons of Oedipus in Greek legend.')
C('apollo','Apollo','The Greek god whose oracle speaks at Delphi.',['Pythian god','god at Delphi'],'cultural-figure')
C('zeno','Zeno','Zeno of Citium, the founder of the Stoic school of philosophy.')
C('chrysippus','Chrysippus','An early Stoic philosopher whose writings helped develop the school’s teachings.')
C('homer','Homer','The Greek poet traditionally credited with the Iliad and Odyssey.')
C('zeus','Zeus','The chief Greek god, invoked in the closing verses.',kind='cultural-figure')
C('destiny','Destiny','Fate addressed as a guiding power in the closing verses.',kind='personification')
C('crito','Crito','Socrates’ friend, addressed in the quotation from Plato’s Crito.')
C('anytus','Anytus','One of Socrates’ accusers at his trial in Athens.')
C('meletus','Melitus / Meletus','One of Socrates’ accusers at his trial in Athens.',['Melitus','Meletus'])
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='the-manual',contentVersion='2026-09-10.1',coverage='All named people and identifiable divine references in both English editions, including Caesar as a title rather than an invented individual. Hypothetical examples excluded.',entities=entities),ensure_ascii=False,indent=2)+'\n')
