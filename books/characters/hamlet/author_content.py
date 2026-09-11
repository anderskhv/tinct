"""Manually authored recognition copy and reviewed identity rules. Offline only."""
import json
from pathlib import Path
BASE=Path(__file__).resolve().parent
cards=json.loads((BASE/'recognition-draft.json').read_text())['cards']
for e in cards:
    e['kind']=e.get('kind','person')
    e['subtitle']=''
    e['aliases']=[]
    e['snapshots']=[]
by={e['id']:e for e in cards}
by['saviour']['body']='Jesus Christ, the central figure of Christianity, also called the Saviour.'
by['horatio']['body']='Hamlet’s friend and a scholar from Wittenberg.'
by['barnardo']['body']='A soldier keeping watch at Elsinore, alongside Marcellus.'
by['francisco']['body']='The soldier whose watch Barnardo takes over at the opening.'
by['voltemand']['body']='A Danish courtier, paired with Cornelius as an envoy.'
by['cornelius']['body']='A Danish courtier, paired with Voltemand as an envoy.'
by['player-king'].update(kind='dramatic-role',body='The ruler in the play performed at court, also called Gonzago. A different figure from Claudius and Hamlet’s father.')
by['player-queen'].update(kind='dramatic-role',body='The ruler’s wife in the play performed at court, also called Baptista. A different figure from Gertrude.')
by['lucianus']['kind']='dramatic-role'
by['ghost'].update(kind='apparition',roleAfter=[5,10],snapshots=[
 {'after':[1,36],'body':'The apparition seen by the watchmen at Elsinore, resembling Denmark’s dead king.'},
 {'after':[5,10],'body':'The apparition that identifies itself to Hamlet as his father’s spirit.'}])
# No murder allegation, motive, or outcome is included in these recognition cards.
# Literal alias matches use exact casing and boundaries. Speakers/stage labels
# and the father/son exceptions are handled separately by the compiler.
aliases={
'hamlet':['Hamlet','Prince Hamlet'], 'claudius':['Claudius'], 'gertrude':['Gertrude'],
'ophelia':['Ophelia'], 'polonius':['Polonius'], 'horatio':['Horatio'], 'laertes':['Laertes'],
'ghost':['Ghost','ghost'], 'king-hamlet':[], 'rosencrantz':['Rosencrantz'], 'guildenstern':['Guildenstern'],
'fortinbras':['Fortinbras'],'elder-fortinbras':[],'norway':['old Norway'],
'barnardo':['Barnardo'],'francisco':['Francisco'],'marcellus':['Marcellus'],
'voltemand':['Voltemand'],'cornelius':['Cornelius'],'reynaldo':['Reynaldo'],
'first-player':['First Player'],'player-king':['Player King','Gonzago'],'player-queen':['Player Queen','Baptista'],
'lucianus':['Lucianus'],'gravedigger':['First Clown'],'second-gravedigger':['Second Clown'],
'osric':['Osric'],'yorick':['Yorick'],
'julius-caesar':['Julius Caesar','Julius','Caesar'],'neptune':['Neptune'],'saviour':['Saviour','Jesus']}
for id,words in aliases.items():by[id]['aliases']=words
for id in ['julius-caesar','neptune','saviour']:by[id]['kind']='cultural-figure'

def add(id,name,role,body,aliases,kind='person'):
    e=dict(id=id,name=name,category=role,body=body,aliases=aliases.split('|'),kind=kind,subtitle='',snapshots=[])
    cards.append(e);by[id]=e
add('captain','The Norwegian captain','supporting','An officer in Fortinbras’s army, whom Hamlet questions about the campaign.','Captain')
add('gentleman','The court gentleman','supporting','An unnamed courtier who brings news to the Danish royal household.','Gentleman')
add('lord','The court lord','supporting','An unnamed courtier who carries a message between the king and Hamlet.','Lord',kind='unnamed-person')
add('sailor','The sailor','supporting','One of the sailors who bring Horatio a letter from Hamlet.','First Sailor|Sailors|Sailor',kind='unnamed-person')
add('messenger','The messenger','supporting','An unnamed messenger carrying letters to the king.','Messenger',kind='unnamed-person')
add('servant','Horatio’s attendant','supporting','The servant who announces visitors to Horatio.','Servant',kind='unnamed-person')
add('priest','The priest','supporting','The clergyman conducting the burial service.','Priest|PRIEST',kind='unnamed-person')
add('ambassador','The English ambassador','supporting','The spokesman for the ambassadors arriving from England.','First Ambassador|Ambassadors',kind='unnamed-person')
add('prologue','The Prologue','supporting','The speaker who introduces the performance at court.','Prologue',kind='dramatic-role')
add('claudio','Claudio','reference','A man who passes on the letters delivered to the king. The play gives little other information about him.','Claudio')
add('lamord','Lamord','reference','A gentleman from Normandy, praised as a horseman and acquainted with Laertes.','Lamord')
add('yaughan','Yaughan','reference','The person to whom the gravedigger sends his companion to fetch a drink. His identity is not explained.','Yaughan',kind='unresolved-figure')
references='''hyperion|Hyperion|Hyperion|A sun god in Greek mythology, used in Hamlet’s comparison of his father and uncle.
niobe|Niobe|Niobe|A grieving mother from Greek mythology, remembered for her tears.
hercules|Hercules|Hercules|The hero of classical mythology famed for his strength.
nemean-lion|The Nemean lion|Nemean lion|The formidable lion from the labors of Hercules.
patrick|Saint Patrick|Saint Patrick|The patron saint of Ireland, invoked in Hamlet’s oath.
roscius|Roscius|Roscius|A celebrated actor of ancient Rome.
seneca|Seneca|Seneca|The Roman writer of tragedies whom Polonius names while discussing theater.
plautus|Plautus|Plautus|A Roman writer of comedies, paired with Seneca in Polonius’s account of the actors.
jephthah|Jephthah|Jephthah|A biblical judge of Israel, the father in the ballad Hamlet quotes to Polonius.
aeneas|Aeneas|Aeneas|A Trojan hero who tells Dido about the fall of Troy in the speech Hamlet recalls.
dido|Dido|Dido|The queen of Carthage, listening to Aeneas’s account of Troy.
priam|Priam|Priam|The elderly king of Troy in the speech recited by the visiting actor.
pyrrhus|Pyrrhus|Pyrrhus|A Greek warrior attacking Troy in the speech Hamlet asks the actor to recite.
hecuba|Hecuba|Hecuba|The queen of Troy and Priam’s wife, portrayed in the actor’s speech.
cyclops|The Cyclopes|Cyclops|The one-eyed giants of classical mythology, pictured here forging armor.
mars|Mars|Mars|The Roman god of war.
fortune|Fortune|Fortune|Luck imagined as a goddess who turns a wheel, raising people up and casting them down.
termagant|Termagant|Termagant|A blustering figure from older popular drama, invoked as an example of overacting.
herod|Herod|Herod|The biblical king as portrayed in older religious drama, notorious onstage for ranting.
vulcan|Vulcan|Vulcan|The Roman god of fire and metalworking, imagined at his forge.
brutus|Brutus|Brutus|The Roman conspirator associated with the killing of Julius Caesar.
phoebus|Phoebus|Phoebus|A classical name for the sun god, imagined driving a chariot across the sky.
tellus|Tellus|Tellus|The Roman goddess who personifies the earth.
hymen|Hymen|Hymen|The classical god of marriage.
hecate|Hecate|Hecate|A goddess associated with magic and witchcraft, invoked in the performed play.
damon|Damon|Damon|A name Hamlet borrows from verse when addressing his friend Horatio.
nero|Nero|Nero|The Roman emperor notorious for cruelty, including having his mother killed.
jove|Jove|Jove|Another name for Jupiter, king of the Roman gods.
mercury|Mercury|Mercury|The messenger of the Roman gods.
valentine|Saint Valentine|Saint Valentine|The saint whose feast day appears in Ophelia’s song about lovers.
robin|Robin|Robin|The beloved named in a song Ophelia sings; not a separately introduced courtier.
adam|Adam|Adam|The first man in the biblical creation story, invoked in the gravediggers’ joke about digging.
cain|Cain|Cain|The biblical son of Adam who killed his brother Abel.
alexander|Alexander the Great|Alexander the Great~Alexander|The ancient Macedonian king and conqueror mentioned in Hamlet’s reflections on mortality.'''
for line in references.splitlines():
    id,name,alias,body=line.split('|')
    add(id,name,'reference',body,alias.replace('~','|'),'cultural-figure')
# Do not mistake the English grammatical title "Lord" for this specific courtier.
# Only its speaker label / stage direction gets a binding.
by['lord']['aliases']=[]
# Additional anonymous characters are resolved only in their reviewed scenes.
scene_scopes={'captain':[15], 'gentleman':[16], 'lord':[20], 'sailor':[17], 'messenger':[18], 'servant':[17], 'priest':[19], 'ambassador':[20], 'prologue':[9]}
for id,scope in scene_scopes.items():by[id]['chapters']=scope
# Distinguish a company from its unnamed spokesman.
by['sailor']['aliases']=['First Sailor']
by['ambassador']['aliases']=['First Ambassador']
add('sailors','The sailors','supporting','The sailors who carry Hamlet’s letter to Horatio.','Sailors','group')
by['sailors']['chapters']=[17,18]
add('ambassadors','The English ambassadors','supporting','The envoys arriving from England at the Danish court.','Ambassadors','group')
by['ambassadors']['chapters']=[20]
add('players','The players','supporting','The visiting company of actors welcomed by Hamlet.','Players','group')
out={'schemaVersion':1,'bookId':'hamlet','language':'en','contentVersion':'2026-09-10.1','reviewStatus':'authored-source-reviewed','coverage':'All 20 scenes: named cast, speaking minor roles, and named cultural references. Generic pronouns, unnamed crowds, ordinary oaths, places, and adjectival allusions are excluded.','entities':cards}
(BASE/'editorial.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(len(cards),'authored entries')
