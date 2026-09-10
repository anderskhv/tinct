"""Manually authored identities, with reader-visible marriage and disguise gates."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',snapshots=None):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=snapshots or []))
C('antonio','Antonio','central','The Venetian merchant of the title and Bassanio’s close friend.','ANTONIO|Antonio')
C('portia','Portia','central','The wealthy heiress of Belmont whom Bassanio hopes to marry.','PORTIA|Portia',snapshots=[dict(after=[16,1],body='The heiress of Belmont and Bassanio’s wife.'),dict(after=[18,42],body='Bassanio’s wife and the heiress of Belmont; Balthazar is her courtroom disguise.')])
C('shylock','Shylock','central','The Jewish moneylender in Venice, Jessica’s father.','SHYLOCK|Shylock')
C('bassanio','Bassanio','major','Antonio’s friend, the Venetian gentleman courting Portia.','BASSANIO|Bassanio',snapshots=[dict(after=[16,1],body='Antonio’s friend and Portia’s husband.')])
C('nerissa','Nerissa','major','Portia’s waiting-woman and confidante.','NERISSA|Nerissa',snapshots=[dict(after=[16,12],body='Portia’s waiting-woman and Gratiano’s wife.'),dict(after=[18,26],body='Portia’s waiting-woman and Gratiano’s wife; the lawyer’s clerk is her courtroom disguise.')])
C('gratiano','Gratiano','major','The outspoken friend of Antonio and Bassanio.','GRATIANO|Gratiano',snapshots=[dict(after=[16,12],body='Nerissa’s husband and the outspoken friend of Antonio and Bassanio.')])
C('jessica','Jessica','major','Shylock’s daughter and Lorenzo’s beloved.','JESSICA|Jessica',snapshots=[dict(after=[17,6],body='Shylock’s daughter and Lorenzo’s wife.')])
C('lorenzo','Lorenzo','major','Bassanio’s friend and Jessica’s lover.','LORENZO|Lorenzo',snapshots=[dict(after=[17,6],body='Bassanio’s friend and Jessica’s husband.')])
C('launcelet','Launcelet Gobbo','major','Shylock’s servant, the son of Old Gobbo and Margery.','LAUNCELET|Launcelet Gobbo|Launcelet',snapshots=[dict(after=[5,50],body='Bassanio’s servant, formerly employed by Shylock; Old Gobbo is his father.')])
for id,name,body,aliases in [
 ('salarino','Salarino','One of the Venetian friends of Antonio and Bassanio.','SALARINO|Salarino'),
 ('solanio','Solanio','The Venetian companion who exchanges news with Salarino.','SOLANIO|Solanio'),
 ('salerio','Salerio','The Venetian messenger bringing Antonio’s letter to Belmont.','SALERIO|Salerio'),
 ('gobbo','Old Gobbo','Launcelet’s father and Margery’s husband.','GOBBO|Old Gobbo'),
 ('tubal','Tubal','The Jewish moneylender and associate of Shylock.','TUBAL|Tubal'),
 ('leonardo','Leonardo','Bassanio’s servant, helping prepare his departure.','LEONARDO|Leonardo'),
 ('balthazar-servant','Balthazar','Portia’s servant, sent to her cousin Bellario.','BALTHAZAR'),
 ('stephano','Stephano','Portia’s servant, who brings news of her return.','STEPHANO|Stephano'),
 ('bellario','Doctor Bellario','Portia’s cousin, a learned lawyer in Padua.','Doctor Bellario|Bellario'),
 ('morocco','The Prince of Morocco','The Moroccan prince courting Portia.','PRINCE OF MOROCCO|Prince of Morocco'),
 ('arragon','The Prince of Arragon','The prince who comes to Belmont to seek Portia’s hand.','ARRAGON|Prince of Arragon|Arragon'),
]:C(id,name,'supporting',body,aliases)
C('duke','The Duke of Venice','supporting','The ruler of Venice who presides over the court.','DUKE OF VENICE|DUKE|Duke','unnamed-person')
C('balthazar-lawyer','Balthazar, the lawyer','supporting','The young legal scholar recommended in Bellario’s letter.',kind='unnamed-person',snapshots=[dict(after=[18,42],name='Portia as Balthazar',body='Portia’s assumed identity as the lawyer at the trial.')])
C('court-messenger','Bellario’s messenger','supporting','The messenger arriving with letters from Bellario.',kind='unnamed-person',snapshots=[dict(after=[18,26],name='Nerissa as the clerk',body='Nerissa’s assumed identity as the lawyer’s clerk.')])
for id,name,body,aliases in [
 ('gaoler','The jailer','The officer holding Antonio in custody.','Gaoler|GAOLER|gaoler|jailer|Jailer'),
 ('servingman','Portia’s servingman','The servant announcing the departure of the suitors.','SERVINGMAN|Servingman'),
 ('servitor','The Belmont servitor','The servant helping arrange the Prince of Arragon’s audience.','SERVITOR|Servitor'),
 ('belmont-messenger','The Belmont messenger','The servant announcing the arrival of a Venetian visitor.','MESSENGER|Messenger'),
 ('antonio-servant','Antonio’s servant','The servant sent to summon Salarino and Solanio.',''),
 ('bassanio-servant','Bassanio’s unnamed servant','The attendant receiving Bassanio’s household instructions.',''),
 ('morocco-forerunner','Morocco’s forerunner','The messenger sent ahead to announce the Prince of Morocco.',''),
 ('bassanio-forerunner','Bassanio’s forerunner','The young Venetian sent ahead with gifts for Portia.',''),
]:C(id,name,'supporting',body,aliases,'unnamed-person')
for id,name,body,aliases in [
 ('musicians','The musicians','The players performing at Belmont.','Musicians|musicians'),
 ('magnificoes','The Venetian magnificoes','The dignitaries attending the court.','Magnificoes|magnificoes'),
]:C(id,name,'supporting',body,aliases,'group')
for id,name,body,aliases,kind in [
 ('portia-father','Portia’s father','The deceased father whose will sets the conditions for Portia’s marriage.','','unnamed-person'),
 ('neapolitan','The Neapolitan prince','One of Portia’s suitors, described by her as absorbed in horses.','Neapolitan prince|Neapolitan','unnamed-person'),
 ('palatine','The Count Palatine','The solemn German suitor discussed by Portia and Nerissa.','County Palatine|Count Palatine','unnamed-person'),
 ('lebon','Monsieur Le Bon','The French lord among Portia’s suitors.','Monsieur Le Bon|Le Bon','person'),
 ('falconbridge','Falconbridge','The young English baron courting Portia.','Falconbridge','person'),
 ('scottish','The Scottish lord','The Scottish suitor discussed by Portia and Nerissa.','Scottish lord','unnamed-person'),
 ('saxony-nephew','The Duke of Saxony’s nephew','The young German suitor whom Portia describes as a heavy drinker.','','unnamed-person'),
 ('saxony','The Duke of Saxony','The uncle of the German suitor discussed at Belmont.','Duke of Saxony','unnamed-person'),
 ('montferrat','The Marquis of Montferrat','The nobleman who accompanied Bassanio on an earlier visit to Belmont.','Marquis of Montferrat','unnamed-person'),
 ('margery','Margery','Old Gobbo’s wife and Launcelet’s mother.','Margery','person'),
 ('dobbin','Dobbin','Old Gobbo’s horse.','Dobbin','animal'),
 ('leah','Leah','Shylock’s wife, remembered through the turquoise ring she gave him.','Leah','person'),
 ('chus','Chus','One of Shylock’s Jewish associates, named by Jessica.','Chus','person'),
 ('moor-woman','The Moorish woman','The woman whom Lorenzo says is pregnant by Launcelet.','','unnamed-person'),
 ('sophy','The Sophy','The Persian ruler invoked in the Prince of Morocco’s martial boast.','Sophy','unnamed-person'),
 ('persian-prince','The Persian prince','The prince mentioned alongside the Sophy in Morocco’s account of his sword.','Persian prince','unnamed-person'),
 ('solyman','Sultan Solyman','The Ottoman ruler mentioned in Morocco’s martial boast.','Sultan Solyman','person'),
 ('heraclitus','Heraclitus','The Greek thinker traditionally known as the weeping philosopher.','weeping philosopher','person'),
 ('portia-roman','Portia, Brutus’s wife','The Roman Portia, daughter of Cato and wife of Brutus, used as a comparison for the heiress.','','person'),
 ('cato','Cato','The Roman statesman whose daughter Portia married Brutus.','Cato','person'),
 ('brutus','Brutus','The Roman statesman married to Cato’s daughter Portia.','Brutus','person'),
 ('pythagoras','Pythagoras','The ancient Greek philosopher associated here with the transmigration of souls.','Pythagoras','person'),
 ('jacob','Jacob','The biblical patriarch whose dealings with Laban Shylock discusses.','Jacob','religious-figure'),
 ('laban','Laban','Jacob’s uncle and employer in the biblical story.','Laban','religious-figure'),
 ('abraham','Abraham','The biblical patriarch, called Abram in Shylock’s speech.','Abram|Abraham','religious-figure'),
 ('rebecca','Rebecca','Jacob’s mother, referred to in Shylock’s account of the patriarchs.','','religious-figure'),
 ('jesus','Jesus','Jesus of Nazareth, referred to in Shylock’s account of the possessed swine.','Nazarite|Nazarene','religious-figure'),
 ('hagar','Hagar','The biblical woman whose descendants Shylock invokes in his insult to Launcelet.','Hagar','religious-figure'),
 ('daniel','Daniel','The biblical figure famed for wise judgment, invoked as a comparison in court.','Daniel','religious-figure'),
 ('barabbas','Barabbas','The prisoner released instead of Jesus in the Gospel account.','Barabbas','religious-figure'),
 ('janus','Janus','The Roman god traditionally represented with two faces.','Janus','deity'),
 ('nestor','Nestor','The aged Greek king renowned for wisdom in the Trojan stories.','Nestor','mythological-figure'),
 ('jason','Jason','The Greek hero who sought the Golden Fleece, used as a comparison for the suitors.','Jasons|Jason','mythological-figure'),
 ('sibyl','The Sibyl','The long-lived prophetess of classical legend.','Sibylla|Sibyl','mythological-figure'),
 ('diana','Diana','The goddess associated with chastity and the moon.','Diana','deity'),
 ('hercules','Hercules','The classical hero also called Alcides.','Hercules|Alcides','mythological-figure'),
 ('lichas','Lichas','Hercules’s servant in classical myth.','Lichas','mythological-figure'),
 ('fortune','Fortune','The personified power governing luck and changes of worldly circumstances.','Fortune','personification'),
 ('fates','The Fates','The three supernatural sisters governing human destiny.','Fates|Destinies|Sisters Three','group'),
 ('venus','Venus','The goddess of love.','Venus','deity'),
 ('cupid','Cupid','The god of love.','Cupid','deity'),
 ('hesione','Hesione','The Trojan princess offered to a sea monster and rescued by Hercules in the comparison.','','mythological-figure'),
 ('mars','Mars','The Roman god of war.','Mars','deity'),
 ('midas','Midas','The mythical king whose touch turned things to gold.','Midas','mythological-figure'),
 ('scylla','Scylla','The sea monster paired with Charybdis as an image of unavoidable danger.','Scylla','mythological-figure'),
 ('charybdis','Charybdis','The monstrous whirlpool paired with Scylla in classical myth.','Charybdis','mythological-figure'),
 ('troilus','Troilus','The Trojan lover of Cressida.','Troilus','literary-figure'),
 ('cressida','Cressida','Troilus’s beloved, called Cressid here.','Cressid|Cressida','literary-figure'),
 ('thisbe','Thisbe','The lover of Pyramus in the classical story.','Thisbe','mythological-figure'),
 ('dido','Dido','The queen of Carthage who loved Aeneas.','Dido','mythological-figure'),
 ('medea','Medea','The sorceress associated with Jason, invoked for her rejuvenating magic.','Medea','mythological-figure'),
 ('aeson','Aeson','Jason’s father, restored to youth by Medea in the myth.','Æson|Aeson','mythological-figure'),
 ('orpheus','Orpheus','The mythical musician whose music could move animals, trees and stones.','Orpheus','mythological-figure'),
 ('endymion','Endymion','The beautiful sleeper loved by the moon goddess in classical myth.','Endymion','mythological-figure'),
 ('argus','Argus','The many-eyed watcher of classical myth.','Argus','mythological-figure'),
 ('god','God','The deity invoked in the characters’ prayers and oaths.','God','deity'),
 ('devil','The devil','The supernatural tempter invoked in religious references and curses.','devil|Devil|Fiend','religious-figure'),
]:C(id,name,'reference',body,aliases,kind)
p=Path(__file__).resolve().parent
(p/'editorial.json').write_text(json.dumps(dict(contentVersion='2026-09-10.1',coverage='All twenty scenes: main cast, local speaking roles, differentiated court disguises and namesakes, suitors, family references and classical/biblical allusions.',entities=entities),ensure_ascii=False,indent=2)+'\n')
