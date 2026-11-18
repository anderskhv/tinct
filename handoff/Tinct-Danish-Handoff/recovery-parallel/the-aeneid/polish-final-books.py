from pathlib import Path
import json
p=Path('/tmp/tinct-da-prep-20261104/the-aeneid');log=json.loads((p/'DANISH-POLISH.json').read_text())
fixes={10:[('Men at lade sit ry leve længere gennem det, man gør, det er moddets værk.','Men at lade sit ry leve længere gennem sine gerninger, det er modets værk.'),('Jeg frygter ikke døden og skåner ingen gud.','Jeg frygter ikke døden og tager intet hensyn til guderne.'),('Sådan samlede al dine mænds styrke sig til ét, Pallas, og glædede dig.','Sådan samlede dine mænd alle deres kræfter til én indsats, Pallas, og glædede dig.')],11:[('Børstede svin','Svin med stride børster'),('den stenrige Latinus’ by','Latinus’ store, befæstede by'),('Han malkede det utæmmede dyrs yver lige ind mellem hendes spæde læber.','Han lagde det utæmmede dyrs patte til hendes spæde læber.'),('En jagtspydspids væbnede hans grove hånd.','I sin grove hånd bar han et jagtspyd.'),('hun tog den indvendige svingning','hun tog den indvendige bue'),('Her har du alene stadig plads til en bedrift og mulighed for lykke.','Kun her kan du endnu gøre noget stort og bringe mig en smule lykke.')],12:[('og også af mine sår følger der blod.','og også de sår, jeg giver, får blodet til at flyde.'),('en børstet grisunge','en grisunge med stride børster'),('og smagte med sit sår det yderste af kroppen.','og gav kroppen et overfladisk sår.'),('Mere end','Mere end'),('Med hvilken kunst kan jeg forlænge dit lys?','Hvad kan jeg gøre for at forlænge dit liv?')]}
for b,pairs in fixes.items():
 f=p/f'{b:02}.draft';s=f.read_text()
 for a,z in pairs:
  if a==z:continue
  assert a in s,a
  s=s.replace(a,z);log.append(dict(book=b,before=a,after=z,reason='Full follow-up reading IX–XII: idiom and concrete action clarity; Camilla feeding checked XI.571–572.'))
 f.write_text(s)
(p/'DANISH-POLISH.json').write_text(json.dumps(log,ensure_ascii=False,indent=2)+'\n')
print('Polish ledger entries',len(log))
