"""Manually authored whole-play identities, with no accusation-as-fact snapshots."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',snapshots=None):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=snapshots or []))
C('othello','Othello','central','The general serving Venice, Desdemona’s husband and the play’s central figure.','OTHELLO|Othello|Moor|Moorship')
C('desdemona','Desdemona','central','Brabantio’s daughter and Othello’s wife.','DESDEMONA|Desdemona|Desdemon')
C('iago','Iago','central','Othello’s ensign and Emilia’s husband.','IAGO|Iago',snapshots=[dict(after=[9,176],body='Emilia’s husband, promoted by Othello from ensign to lieutenant.')])
C('emilia','Emilia','major','Iago’s wife and Desdemona’s attendant.','EMILIA|Emilia')
C('cassio','Michael Cassio','major','The Florentine officer chosen as Othello’s lieutenant.','CASSIO|Michael Cassio|Cassio',snapshots=[dict(after=[6,93],body='The Florentine officer dismissed from Othello’s lieutenancy.'),dict(after=[11,137],body='The Florentine officer appointed to succeed Othello in governing Cyprus.')])
C('roderigo','Roderigo','major','The Venetian gentleman pursuing Desdemona with Iago’s help.','RODERIGO|Roderigo')
C('brabantio','Brabantio','major','Desdemona’s father, a Venetian senator.','BRABANTIO|Brabantio')
C('bianca','Bianca','supporting','Cassio’s lover in Cyprus.','BIANCA|Bianca')
C('montano','Montano','supporting','The governor of Cyprus whom Othello is sent to replace.','MONTANO|Montano')
C('lodovico','Lodovico','supporting','Desdemona’s kinsman, the envoy who comes from Venice.','LODOVICO|Lodovico')
C('gratiano','Gratiano','supporting','Brabantio’s brother and Desdemona’s uncle.','GRATIANO|Gratiano')
C('duke','The Duke of Venice','supporting','The ruler of Venice, presiding over the council.','DUKE|Duke|duke','unnamed-person')
C('senator-first','The first senator','supporting','One of the Venetian senators discussing the military threat.','FIRST SENATOR','unnamed-person')
C('senator-second','The second senator','supporting','Another senator comparing reports about the enemy fleet.','SECOND SENATOR','unnamed-person')
C('sailor','The sailor','supporting','The sailor bringing Angelo’s report to the Venetian council.','SAILOR|Sailor','unnamed-person')
C('venice-messenger','The council messenger','supporting','The messenger bringing Montano’s report to the Venetian council.','','unnamed-person')
C('cyprus-messenger','The Cyprus messenger','supporting','The messenger reporting the crowd’s sighting of a sail off Cyprus.','','unnamed-person')
C('gentleman-first','The first gentleman','supporting','One of Montano’s companions watching the sea from Cyprus.','FIRST GENTLEMAN','unnamed-person')
C('gentleman-second','The second gentleman','supporting','The gentleman helping identify the ships arriving at Cyprus.','SECOND GENTLEMAN|second Gentleman','unnamed-person')
C('gentleman-third','The third gentleman','supporting','The gentleman bringing news of the fleet to Montano in Cyprus.','THIRD GENTLEMAN|third Gentleman','unnamed-person')
C('herald','Othello’s herald','supporting','The official who publicly reads Othello’s proclamation.','HERALD|Herald','unnamed-person')
C('clown','The Clown','supporting','Othello’s household servant, who jokes with the musicians and carries messages.','CLOWN|Clown','unnamed-person')
C('musician','The first musician','supporting','The musician answering the Clown outside Othello’s residence.','FIRST MUSICIAN','unnamed-person')
C('musicians','The musicians','supporting','The players Cassio brings to perform outside Othello’s residence.','Musicians','group')
C('wine-servant','The wine-serving servant','supporting','The attendant bringing wine to the officers’ gathering.','Servant','unnamed-person')
C('senators','The Venetian senators','supporting','The council members overseeing Venice’s public and military affairs.','Senators','group')
C('officers','The officers','supporting','The military and civic officers attending the leading characters.','Officers','group')
for id,name,body,aliases,kind in [
 ('gondolier','The gondolier','The boatman mentioned in Roderigo’s account of Desdemona’s departure.','gondolier','unnamed-person'),
 ('angelo','Signior Angelo','The official whose naval report the sailor brings to Venice.','Signior Angelo|Angelo','person'),
 ('marcus','Marcus Luccicos','The man the duke asks for during the council’s discussion of Cyprus.','Marcus Luccicos','person'),
 ('iago-patrons','Iago’s patrons','The three influential Venetians whom Iago says supported his request for promotion.','','group'),
 ('othello-mother','Othello’s mother','The mother recalled in Othello’s account of the handkerchief.','','unnamed-person'),
 ('othello-father','Othello’s father','The father recalled in Othello’s account of the handkerchief.','','unnamed-person'),
 ('egyptian','The Egyptian woman','The woman who, in Othello’s account, gave his mother the handkerchief and described its powers.','Egyptian','unnamed-person'),
 ('sibyl','The sibyl','The prophetess said by Othello to have sewn the handkerchief.','sibyl','mythological-figure'),
 ('desdemona-mother','Desdemona’s mother','Brabantio’s wife, recalled in Desdemona’s story about her maid.','','unnamed-person'),
 ('barbary','Barbary','Desdemona’s mother’s maid, remembered for her willow song.','','person'),
 ('barbary-lover','Barbary’s lover','The man recalled in Desdemona’s account of Barbary.','','unnamed-person'),
 ('cannibals','The Anthropophagi','The man-eating people in Othello’s traveler’s tales.','Cannibals|Anthropophagi','group'),
 ('headless-men','The men with heads beneath their shoulders','The marvelous people described in Othello’s traveler’s tales.','','group'),
 ('turkish-fleet','The Ottoman forces','The forces threatening Venice’s possessions in the eastern Mediterranean.','Turks|Ottomites|Ottomans|Turkish fleet|Ottoman','group'),
 ('aleppo-turk','The man in Aleppo','The Turkish man in Othello’s account of an incident in Aleppo.','','unnamed-person'),
 ('aleppo-venetian','The Venetian in Aleppo','The Venetian whom Othello recalls seeing attacked in Aleppo.','','unnamed-person'),
 ('judean','The Judean in the comparison','The figure in Othello’s comparison about throwing away a precious pearl; the precise identity is disputed.','Judean','literary-figure')]:C(id,name,'reference',body,aliases,kind)
for id,name,body,aliases,kind in [
 ('janus','Janus','The Roman god associated with beginnings and doorways, traditionally shown with two faces.','Janus','deity'),
 ('cupid','Cupid','The Roman god of love.','Cupid','deity'),
 ('jove','Jove','Jupiter, the Roman king of the gods.','Jove','deity'),
 ('stephen','King Stephen','The English king in Iago’s drinking song.','King Stephen','person'),
 ('caesar','Julius Caesar','The Roman commander used as a comparison for military ability.','Cæsar|Caesar','person'),
 ('hydra','The Hydra','The many-headed monster of Greek myth.','Hydra','mythological-figure'),
 ('diana','Diana','The goddess associated with chastity, invoked here as Dian.','Dian','deity'),
 ('peter','Saint Peter','The apostle traditionally associated with the keys of heaven.','Saint Peter','religious-figure'),
 ('prometheus','Prometheus','The mythical bringer of fire, invoked in Othello’s image of life-giving heat.','Promethean','mythological-figure'),
 ('god','God','The deity invoked in the play’s prayers and exclamations.','God','deity'),
 ('devil','The devil','The supernatural figure invoked in curses and accusations.','Devil|devil|Diablo','religious-figure')]:C(id,name,'reference',body,aliases,kind)
p=Path(__file__).resolve().parent
(p/'editorial.json').write_text(json.dumps(dict(contentVersion='2026-09-10.1',coverage='All fifteen scenes: principal cast, differentiated civic and military speaking roles, family recollections, reported people and named allusions.',entities=entities),ensure_ascii=False,indent=2)+'\n')
