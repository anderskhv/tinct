"""Manual recognition identities for every scene, preserving minor cast and allusions."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',snapshots=None):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=snapshots or []))
C('romeo','Romeo','central','Lord and Lady Montague’s son, one of the play’s two central lovers.','ROMEO|Romeo',snapshots=[dict(after=[14,22],body='The young Montague, now Juliet’s husband.')])
C('juliet','Juliet','central','Lord and Lady Capulet’s daughter, the play’s other central lover.','JULIET|Juliet|Jule|Julie',snapshots=[dict(after=[14,22],body='The young Capulet, now Romeo’s wife.')])
C('nurse','The Nurse','major','Juliet’s nurse and longtime companion, also called Angelica.','NURSE|Nurse|Angelica')
C('lawrence','Friar Lawrence','major','The Franciscan friar to whom Romeo turns for advice.','FRIAR LAWRENCE|Friar Lawrence|Lawrence')
C('mercutio','Mercutio','major','Romeo’s friend and a relative of Prince Escalus.','MERCUTIO|Mercutio')
C('benvolio','Benvolio','major','Romeo’s cousin and friend, a member of the Montague family.','BENVOLIO|Benvolio')
C('tybalt','Tybalt','major','Juliet’s cousin, Lady Capulet’s nephew.','TYBALT|Tybalt|Tybalts|Prince of cats|Prince of Cats|King of Cats')
C('capulet','Lord Capulet','major','Juliet’s father and head of the Capulet household.','CAPULET|Capulet')
C('lady-capulet','Lady Capulet','major','Juliet’s mother and Lord Capulet’s wife.','LADY CAPULET|Lady Capulet')
C('montague','Lord Montague','supporting','Romeo’s father and head of the Montague household.','MONTAGUE|Montague')
C('lady-montague','Lady Montague','supporting','Romeo’s mother and Lord Montague’s wife.','LADY MONTAGUE|Lady Montague')
C('paris','Paris','major','The young nobleman seeking to marry Juliet, a relative of the prince.','PARIS|Paris|County Paris|Count Paris')
C('prince','Prince Escalus','supporting','The ruler of Verona.','PRINCE|Prince Escalus|Escalus|Prince|prince')
C('rosaline','Rosaline','supporting','Capulet’s niece, the young woman Romeo admires at the start of the play.','Rosaline')
C('sampson','Sampson','supporting','A servant of the Capulet household, companion of Gregory.','SAMPSON|Sampson')
C('gregory','Gregory','supporting','A servant of the Capulet household, companion of Sampson.','GREGORY|Gregory')
C('abram','Abram','supporting','A servant of the Montague household.','ABRAM|Abram')
C('balthasar','Balthasar','supporting','Romeo’s servant.','BALTHASAR|Balthasar')
C('peter','Peter','supporting','The Capulet servant who accompanies the Nurse.','PETER|Peter')
C('john','Friar John','supporting','A Franciscan friar associated with Friar Lawrence.','FRIAR JOHN|Friar John')
C('apothecary','The apothecary','supporting','The impoverished seller of medicines in Mantua.','APOTHECARY|Apothecary|apothecary','unnamed-person')
C('page','Paris’s page','supporting','The young attendant accompanying Paris.','PAGE|Page','unnamed-person')
C('cousin-capulet','Capulet’s cousin','supporting','The older kinsman talking with Capulet at the feast.','CAPULET’S COUSIN|CAPULET\'S COUSIN|cousin Capulet','unnamed-person')
C('chorus','The Chorus','supporting','The speaker who introduces the play and its second act.','CHORUS|Chorus','unnamed-person')
C('capulets','The Capulets','supporting','Juliet’s family and household, rivals of the Montagues.','Capulets|Capels|house of Capulet','group')
C('montagues','The Montagues','supporting','Romeo’s family and household, rivals of the Capulets.','Montagues|house of Montague','group')
C('musicians','The musicians','supporting','The musicians engaged for the Capulet household’s festivities.','Musicians|musicians','group')
C('citizens','The citizens of Verona','supporting','The townspeople drawn into the public disturbances.','Citizens','group')
C('watch','The watch','supporting','The officers responsible for keeping order in Verona.','Watch','group')
C('gods','The gods','reference','The divine powers invoked in the saying about lovers’ promises.','gods','group')
for id,name,body,aliases in [
 ('invitation-servant','The invitation-bearing servant','The Capulet servant sent to find the guests named on a list.',''),
 ('dinner-servant','The dinner-announcing servant','The servant who tells Lady Capulet that supper is ready.',''),
 ('feast-first','The first feast servant','The servant organizing the clearing and service at Capulet’s feast.',''),
 ('feast-second','The second feast servant','The servant answering his colleague during preparations at Capulet’s feast.',''),
 ('torch-servant','The servant by Romeo','The servant whom Romeo asks about Juliet at the feast.',''),
 ('wedding-first','The wedding invitation servant','The servant sent out with Capulet’s wedding invitations.',''),
 ('wedding-second','The servant hiring cooks','The servant whom Capulet sends to hire cooks.',''),
 ('kitchen-first','The servant carrying supplies','The servant carrying provisions for the wedding cook.',''),
 ('kitchen-second','The servant finding logs','The servant sent for firewood during the wedding preparations.',''),
 ('citizen','The first citizen','The Verona citizen speaking when the street fights draw the townspeople.','FIRST CITIZEN'),
 ('watch-first','The first watchman','The watchman directing the search in the churchyard.','FIRST WATCH'),
 ('watch-second','The second watchman','One of the officers searching the churchyard.','SECOND WATCH'),
 ('watch-third','The third watchman','Another officer searching the churchyard.','THIRD WATCH'),
 ('musician-first','Simon Catling','The first musician, whom Peter addresses as Simon Catling.','FIRST MUSICIAN|Simon Catling'),
 ('musician-second','Hugh Rebeck','The second musician, whom Peter addresses as Hugh Rebeck.','SECOND MUSICIAN|Hugh Rebeck'),
 ('musician-third','James Soundpost','The third musician and singer, whom Peter addresses as James Soundpost.','THIRD MUSICIAN|James Soundpost')]:C(id,name,'supporting',body,aliases,'unnamed-person' if not aliases else 'person')
for id,name,body,aliases,kind in [
 ('susan-child','Susan','The Nurse’s daughter, who was the same age as Juliet.','Susan','person'),
 ('nurse-husband','The Nurse’s husband','The Nurse’s late husband, recalled in her story about Juliet’s childhood.','','unnamed-person'),
 ('susan-grindstone','Susan Grindstone','The woman whom a servant wants admitted to Capulet’s feast.','Susan Grindstone','person'),
 ('nell','Nell','The woman named with Susan Grindstone at the feast.','Nell','person'),
 ('antony','Antony','One of the Capulet household servants called during the feast.','Antony','person'),
 ('potpan','Potpan','The Capulet servant called for during preparations at the feast.','Potpan','person'),
 ('lucentio','Lucentio','The man whose wedding Capulet recalls while talking with his older kinsman.','Lucentio','person'),
 ('lucentio-son','Lucentio’s son','The son whose age Capulet’s cousin uses to date Lucentio’s wedding.','','unnamed-person'),
 ('tiberio','Tiberio','The father of one of the young men at Capulet’s feast.','Tiberio','person'),
 ('tiberio-son','Tiberio’s son','The young guest identified by the Nurse as Tiberio’s son and heir.','','unnamed-person'),
 ('petruchio','Petruchio','The young man whom the Nurse identifies among the departing guests.','Petruchio','person'),
 ('martino','Signior Martino','One of the people named on Capulet’s guest list.','Signior Martino|Martino','person'),
 ('martino-wife','Martino’s wife','The wife invited with Signior Martino and their daughters.','','unnamed-person'),
 ('martino-daughters','Martino’s daughters','The daughters invited with Signior Martino and his wife.','','group'),
 ('anselmo','Count Anselmo','The count named on Capulet’s guest list.','County Anselmo|Count Anselmo|Anselmo','person'),
 ('anselmo-sisters','Anselmo’s sisters','The sisters included with Count Anselmo on the guest list.','','group'),
 ('utruvio','Utruvio','The deceased husband of a woman on Capulet’s guest list.','Utruvio','person'),
 ('utruvio-widow','Utruvio’s widow','The widowed woman invited to Capulet’s feast.','','unnamed-person'),
 ('placentio','Signior Placentio','One of the men on Capulet’s guest list.','Signior Placentio|Placentio','person'),
 ('placentio-nieces','Placentio’s nieces','The nieces invited with Signior Placentio.','','group'),
 ('valentine','Valentine','Mercutio’s brother, included on Capulet’s guest list.','Valentine','person'),
 ('uncle-capulet','Capulet’s uncle','The uncle listed among Capulet’s invited guests.','uncle Capulet','unnamed-person'),
 ('uncle-wife','The uncle’s wife','The wife invited with Capulet’s uncle and their daughters.','','unnamed-person'),
 ('uncle-daughters','The uncle’s daughters','The daughters invited with Capulet’s uncle and his wife.','','group'),
 ('livia','Livia','The woman named alongside Rosaline on the guest list.','Livia','person'),
 ('valentio','Signior Valentio','Tybalt’s cousin, named on Capulet’s guest list.','Signior Valentio|Valentio','person'),
 ('lucio','Lucio','The guest named alongside Helena.','Lucio','person'),
 ('helena','Helena','The woman named alongside Lucio on Capulet’s guest list.','Helena','person'),
 ('friar-companion','Friar John’s companion','The fellow friar whom John seeks out to accompany him.','','unnamed-person'),
 ('health-officials','The health officials','The town officials responsible for restrictions around plague-infected houses.','','group')]:C(id,name,'reference',body,aliases,kind)
for id,name,body,aliases,kind in [
 ('aurora','Aurora','The Roman goddess of dawn.','Aurora','deity'),
 ('cupid','Cupid','The winged god of love, son of Venus.','Young Abraham Cupid|Cupid','deity'),
 ('diana','Diana','The goddess associated with chastity and the moon, also called Cynthia.','Dian|Diana|Cynthia','deity'),
 ('mab','Queen Mab','The tiny fairy queen in Mercutio’s speech about dreams.','Queen Mab|Mab','mythological-figure'),
 ('venus','Venus','The goddess of love and mother of Cupid.','Venus','deity'),
 ('cophetua','King Cophetua','The legendary king who falls in love with a beggar maid.','King Cophetua|Cophetua','literary-figure'),
 ('beggar-maid','Cophetua’s beggar maid','The poor young woman loved by King Cophetua in the ballad.','beggar-maid|beggar maid|beggar girl','literary-figure'),
 ('jove','Jove','Jupiter, the Roman king of the gods.','Jove','deity'),
 ('echo','Echo','The nymph whose voice repeats other people’s words.','Echo','mythological-figure'),
 ('sun-god','The sun god','The divine charioteer of the sun, invoked as Titan and Phoebus.','Titan|Phoebus','deity'),
 ('phaeton','Phaeton','The youth who tries to drive the sun’s chariot in Greek myth.','Phaeton','mythological-figure'),
 ('francis','Saint Francis','Francis of Assisi, the saint associated with the friars’ order.','Saint Francis','religious-figure'),
 ('jesus','Jesus','The Christian figure invoked as Jesu or Jesus.','Jesu|Jesus','religious-figure'),
 ('mary','Mary','The mother of Jesus, invoked as Maria or Our Lady.','Maria|Our Lady','religious-figure'),
 ('petrarch','Petrarch','The Italian poet celebrated for his love poetry about Laura.','Petrarch','person'),
 ('laura','Laura','The woman addressed in Petrarch’s love poetry.','Laura','literary-figure'),
 ('dido','Dido','The queen of Carthage and lover of Aeneas in the Aeneid.','Dido','mythological-figure'),
 ('cleopatra','Cleopatra','The Egyptian queen, invoked among famous women celebrated in love stories.','Cleopatra','person'),
 ('helen','Helen','The famed beauty associated with the Trojan War.','Helen','mythological-figure'),
 ('hero','Hero','Leander’s beloved in the classical love story.','Hero','mythological-figure'),
 ('thisbe','Thisbe','Pyramus’s beloved in the classical love story.','Thisbe','mythological-figure'),
 ('god','God','The deity invoked in prayers and exclamations throughout the play.','God','deity'),
 ('fortune','Fortune','Luck imagined as a power governing human lives.','Fortune','personification'),
 ('death','Death','Death personified in the characters’ imagery, sometimes as a rival lover.','Death','personification')]:C(id,name,'reference',body,aliases,kind)
p=Path(__file__).resolve().parent
(p/'editorial.json').write_text(json.dumps(dict(contentVersion='2026-09-10.1',coverage='The prologues and all 24 scenes: main cast, differentiated servants, guest-list people and relatives, musicians, watchmen and named allusions.',entities=entities),ensure_ascii=False,indent=2)+'\n')
