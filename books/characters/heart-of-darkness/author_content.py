"""Manually authored recognition identities; no plot/outcome recaps."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('marlow','Charlie Marlow','central','The seaman whose journey into Central Africa forms the main story.','Charlie Marlow|Marlow|Charlie')
C('kurtz','Mr. Kurtz','major','The Company’s leading ivory agent, based at the Inner Station.','Mr. Kurtz|Kurtz')
C('narrator','The frame narrator','supporting','One of the men aboard the Nellie, listening to and recounting Marlow’s story.','','unnamed-person')
C('host','The Director of Companies','supporting','The captain and host of the gathering aboard the Nellie.','Director of Companies','unnamed-role')
C('lawyer','The lawyer','supporting','One of Marlow’s companions aboard the Nellie.','Lawyer','unnamed-role')
C('frame-accountant','The Nellie’s accountant guest','supporting','The accountant listening to Marlow aboard the Nellie.','','unnamed-role')
C('aunt','Marlow’s aunt','supporting','Marlow’s aunt, who uses her connections to help him obtain the river command.','aunt','unnamed-person')
C('fresleven','Fresleven','supporting','The Danish steamboat captain whom Marlow replaces.','Fresleven')
C('chief','The village chief','supporting','The village leader involved in Fresleven’s dispute over hens.','','unnamed-person')
C('chief-son','The chief’s son','supporting','The son of the village chief in the account of Fresleven’s quarrel.','','unnamed-person')
C('older-knitter','The older knitting woman','supporting','The older woman at the Company’s European office, watching the visitors.','','unnamed-person')
C('younger-knitter','The younger knitting woman','supporting','The woman at the Company’s European office who guides visitors into the waiting room.','','unnamed-person')
C('secretary','The secretary','supporting','The secretary who handles Marlow’s visit and paperwork at the Company’s European office.','secretary','unnamed-role')
C('company-head','The Company’s head','supporting','The senior Company official who receives Marlow at the European headquarters.','','unnamed-role')
C('clerk','The young clerk','supporting','The Company employee who escorts Marlow to his medical examination.','','unnamed-role')
C('doctor','The Company doctor','supporting','The doctor who examines recruits before they leave for Africa.','doctor','unnamed-role')
C('swedish-captain','The Swedish captain','supporting','The captain of the small coastal steamer that carries Marlow to the Company station.','','unnamed-person')
C('swedish-traveler','The Swedish traveler','reference','The man mentioned by the Swedish captain in his account of the journey inland.','','unnamed-person')
C('chain-gang','The chained laborers','supporting','The African workers forced to carry loads while chained together near the station.','','group')
C('guard','The guard','supporting','The armed African guard accompanying the chained laborers.','','unnamed-role')
C('young-worker','The young worker in the grove','supporting','The severely weakened young African worker whom Marlow approaches under the trees.','','unnamed-person')
C('chief-accountant','The Company’s chief accountant','supporting','The Company bookkeeper at the first station Marlow visits.','chief accountant','unnamed-role')
C('laundry-worker','The accountant’s laundry worker','reference','The African woman who maintains the accountant’s linen.','','unnamed-person')
C('sick-agent','The sick agent','supporting','The ill Company agent placed in the accountant’s office.','','unnamed-person')
C('road-official','The road official','supporting','The European official Marlow meets on the overland route, claiming responsibility for the road.','','unnamed-person')
C('walking-companion','Marlow’s traveling companion','supporting','The European man accompanying Marlow on the overland journey to the Central Station.','','unnamed-person')
C('manager','The Central Station manager','major','The Company official in charge of the Central Station, overseeing the upriver expedition.','manager','unnamed-role')
C('manager-boy','The manager’s young servant','supporting','The young African servant employed by the Central Station manager.','','unnamed-person')
C('beaten-worker','The man blamed for the fire','supporting','The African man accused of causing the fire at the Central Station.','','unnamed-person')
C('brickmaker','The brickmaker','supporting','The Central Station agent assigned to make bricks, closely aligned with the manager.','brickmaker','unnamed-role')
C('mechanic','The boilermaker','supporting','The mechanics’ foreman who works with Marlow on repairing the steamboat.','foreman|boiler-maker|boilermaker','unnamed-role')
C('uncle','The manager’s uncle','supporting','The leader of the Eldorado Exploring Expedition and uncle of the Central Station manager.','uncle','unnamed-person')
C('eldorado','The Eldorado Exploring Expedition','supporting','The expedition led by the manager’s uncle in search of wealth in the interior.','Eldorado Exploring Expedition|Eldorado Expedition','group')
C('pilgrims','The pilgrims','supporting','Marlow’s ironic name for the European Company agents.','pilgrims','group')
C('crew','The African crew','supporting','The African men hired to work aboard Marlow’s steamboat, whom he calls cannibals.','cannibals','group')
C('headman','The crew’s headman','supporting','The leader of the African crew working aboard Marlow’s steamboat.','headman','unnamed-role')
C('fireman','The fireman','supporting','The African crewman tending the steamboat’s boiler.','fireman','unnamed-role')
C('helmsman','The helmsman','supporting','The African crewman who steers Marlow’s steamboat.','helmsman','unnamed-role')
C('poleman','The poleman','supporting','The crewman measuring the depth of the river from the steamboat’s bow.','poleman','unnamed-role')
C('towson','Towson or Towser','reference','The author of the seamanship manual Marlow finds; Marlow is unsure of the surname.','Towson|Towser')
C('russian','The Russian trader','major','The young independent trader in patched clothes, an admirer of Kurtz.','man of patches','unnamed-person')
C('archpriest','The Russian trader’s father','reference','The arch-priest from the Tambov region whose son is the young trader.','arch-priest','unnamed-person')
C('van-shuyten','Van Shuyten','reference','The Dutch trader who supplied the young Russian for his journey.','Van Shuyten')
C('intended','Kurtz’s Intended','supporting','Kurtz’s fiancée, living in Europe.','Intended','unnamed-person')
C('kurtz-mother','Kurtz’s mother','reference','Kurtz’s mother, described as half-English.','','unnamed-person')
C('kurtz-father','Kurtz’s father','reference','Kurtz’s father, described as half-French.','','unnamed-person')
C('african-woman','Kurtz’s African companion','supporting','The African woman closely associated with Kurtz at the Inner Station.','','unnamed-person')
C('company-representative','The Company’s representative','supporting','The official who visits Marlow in Europe to claim Kurtz’s papers for the Company.','','unnamed-person')
C('cousin','Kurtz’s cousin','supporting','The man who identifies himself as Kurtz’s cousin and describes his musical gifts.','','unnamed-person')
C('journalist','The journalist','supporting','The journalist who knew Kurtz and discusses his public speaking with Marlow.','','unnamed-person')
for id,name,body,aliases in [
 ('drake','Sir Francis Drake','The English seafarer associated with the Golden Hind.','Sir Francis Drake'),
 ('franklin','Sir John Franklin','The British naval explorer associated with the Erebus and Terror.','Sir John Franklin'),
 ('elizabeth','Elizabeth I','The English queen who visited Drake’s Golden Hind.','Queen’s Highness|Queen\'s Highness'),
 ('buddha','The Buddha','The Buddhist spiritual teacher invoked in comparisons with Marlow’s seated pose.','Buddha'),
 ('plato','Plato','The ancient Greek philosopher named in the young clerk’s remark.','Plato'),
 ('mars','Mars','The Roman god of war, invoked in Marlow’s ironic imagery.','Mars'),
 ('mephistopheles','Mephistopheles','The devil figure of the Faust story, used in Marlow’s comparison of the brickmaker.','Mephistopheles'),
 ('jove','Jove','Another name for Jupiter, the Roman chief god, invoked in oaths and imagery.','Jove|Jupiter'),
 ('god','God','The divine being invoked in religious expressions and oaths.','God')]:C(id,name,'reference',body,aliases,'cultural-figure')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='heart-of-darkness',contentVersion='2026-09-10.1',coverage='All three parts, both English editions: named cast, distinct recognizable unnamed roles and communities, family references, the book author and cultural allusions. Exact selected references, not blanket pronoun/ethnic-label matching.',entities=entities),ensure_ascii=False,indent=2)+'\n')
