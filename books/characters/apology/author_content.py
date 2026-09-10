"""Manually authored people and references from the complete Apology."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases=None,kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=[name] if aliases is None else aliases,snapshots=[]))
C('socrates','Socrates','central','The Athenian philosopher defending himself at his trial.')
C('meletus','Meletus','major','One of Socrates’ three accusers, whom he questions directly in his defense.')
C('anytus','Anytus','major','One of Socrates’ three accusers, associated with the politicians and craftsmen.')
C('lycon','Lycon','supporting','One of Socrates’ three accusers, associated with the public speakers.')
C('aristophanes','Aristophanes','reference','The Athenian comic playwright whose Clouds caricatures Socrates.',['Aristophanes','Aristoph.'])
C('gorgias','Gorgias','reference','A traveling teacher of rhetoric from Leontini, charging fees for instruction.')
C('prodicus','Prodicus','reference','A traveling teacher from Ceos, charging fees for instruction.')
C('hippias','Hippias','reference','A traveling teacher from Elis, charging fees for instruction.')
C('callias','Callias','reference','A wealthy Athenian who pays for education from the Sophists. Son of Hipponicus.')
C('hipponicus','Hipponicus','reference','Callias’ father.')
C('evenus','Evenus','reference','A teacher from Paros whose fees Socrates discusses with Callias.')
C('chaerephon','Chaerephon','supporting','Socrates’ longtime friend, who consulted the oracle at Delphi.')
C('priestess','The Delphic priestess','reference','The priestess who speaks the oracle’s response at Delphi.',['Pythian prophetess','priestess'],'unnamed-person')
C('chaerephon-brother','Chaerephon’s brother','supporting','The unnamed brother of Chaerephon, present in court.',['his brother'],'unnamed-person')
C('anaxagoras','Anaxagoras','reference','The philosopher from Clazomenae known for his explanations of the natural world.')
C('euripides','Euripides','reference','The Athenian tragic playwright, mentioned in an editorial note about Anaxagoras.')
C('achilles','Achilles','reference','The Greek warrior at Troy, son of the sea goddess Thetis.')
C('thetis','Thetis','reference','The sea goddess who is Achilles’ mother.',kind='cultural-figure')
C('hector','Hector','reference','The Trojan warrior opposed to Achilles in the Iliad.')
C('patroclus','Patroclus','reference','Achilles’ close companion in the Iliad.')
C('zeus','Zeus','reference','The chief god of the Greek pantheon.',kind='cultural-figure')
C('leon','Leon','reference','The man from Salamis whom the Thirty ordered Socrates to arrest.')
C('thirty','The Thirty','reference','The oligarchic rulers who briefly governed Athens after the democracy was overthrown.',['Thirty Tyrants','Thirty'],'group')
C('prytanes','The Prytanes','reference','The presiding members of the Athenian council, among whom Socrates served.',['Prytanes'],'group')
C('eleven','The Eleven','reference','The Athenian magistrates responsible for prisoners.',['Eleven'],'group')
C('crito','Crito','supporting','Socrates’ friend and fellow citizen, father of Critobulus.')
C('critobulus','Critobulus','supporting','Crito’s son, present at Socrates’ trial.')
C('lysanias','Lysanias','reference','Aeschines’ father, from the district of Sphettus.')
C('aeschines','Aeschines','reference','An associate of Socrates and son of Lysanias.')
C('antiphon','Antiphon','reference','Epigenes’ father, from Cephisus. This is the parent named among Socrates’ supporters.')
C('epigenes','Epigenes','reference','An associate of Socrates and son of Antiphon.')
C('nicostratus','Nicostratus','reference','Theodotus’ brother, named among the relatives supporting Socrates.')
C('theosdotides','Theosdotides','reference','The father of Nicostratus and Theodotus.')
C('theodotus','Theodotus','reference','An associate of Socrates and brother of Nicostratus.')
C('paralus','Paralus','reference','Demodocus’ son and Theages’ brother.')
C('demodocus','Demodocus','reference','The father of Paralus and Theages.')
C('theages','Theages','reference','An associate of Socrates, brother of Paralus and son of Demodocus.')
C('adeimantus','Adeimantus','reference','Plato’s brother and son of Ariston.')
C('ariston','Ariston','reference','The father of Adeimantus and Plato.')
C('plato','Plato','supporting','Socrates’ associate, present at the trial; also the author of this account.')
C('aeantodorus','Aeantodorus','reference','Apollodorus’ brother, named among Socrates’ supporters.')
C('apollodorus','Apollodorus','supporting','Socrates’ friend and brother of Aeantodorus, present at the trial.')
for id,name,body in [
 ('minos','Minos','The legendary king of Crete, named as a judge of the dead.'),
 ('rhadamanthus','Rhadamanthus','A legendary figure renowned for justice, named as a judge of the dead.'),
 ('aeacus','Aeacus','A legendary Greek king, named as a judge of the dead.'),
 ('triptolemus','Triptolemus','The legendary figure associated with teaching agriculture, here named among the judges of the dead.'),
 ('orpheus','Orpheus','The legendary Greek singer and poet.'),
 ('musaeus','Musaeus','A legendary Greek poet associated with sacred song.'),
 ('hesiod','Hesiod','The early Greek poet known for Works and Days and the Theogony.'),
 ('homer','Homer','The Greek poet traditionally credited with the Iliad and Odyssey.'),
 ('palamedes','Palamedes','A Greek hero of the Trojan War, cited as a victim of unjust judgment.'),
 ('ajax','Ajax','The Greek warrior at Troy, son of Telamon.'),
 ('telamon','Telamon','Ajax’s father in Greek legend.'),
 ('odysseus','Odysseus','The Greek king of Ithaca and hero of the Odyssey.'),
 ('sisyphus','Sisyphus','The cunning king of Greek legend, whom Socrates imagines questioning.')]:C(id,name,'reference',body)
C('agamemnon','Agamemnon','reference','The commander of the Greek expedition against Troy.',['leader of the great Trojan expedition'])
C('children','Socrates’ children','reference','Socrates’ three sons, whose upbringing he mentions in his defense. They are not named here.',[],'group')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='apology',contentVersion='2026-09-10.1',coverage='Complete defense in both English editions: all named people, identifiable unnamed references, relatives, officials and classical figures; no invented names for generic examples.',entities=entities),ensure_ascii=False,indent=2)+'\n')
