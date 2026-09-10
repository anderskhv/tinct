"""Manually authored recognition identities for the local novel; no API generation."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('candide','Candide','central','The young Westphalian man whose travels the novel follows, raised in the baron’s household.','Candide')
C('cunegonde','Cunegonde','major','The baron’s daughter and Candide’s beloved.','Miss Cunegonde|Cunegonde')
entities[-1]['snapshots']=[dict(after=[30,1],body='Candide’s wife, the baron’s daughter he has long loved.')]
C('pangloss','Pangloss','major','Candide’s tutor, who teaches that this is the best of all possible worlds.','Dr. Pangloss|Doctor Pangloss|Pangloss')
C('cacambo','Cacambo','major','Candide’s resourceful valet and traveling companion.','Cacambo')
C('martin','Martin','major','The pessimistic scholar whom Candide chooses as a traveling companion.','Martin')
C('old-woman','The old woman','major','The elderly servant who helps Candide in Lisbon.','old woman')
entities[-1]['snapshots']=[dict(after=[7,11],body='Cunegonde’s elderly servant and traveling companion.'),dict(after=[11,0],body='Cunegonde’s elderly companion, the daughter of Pope Urban X and the Princess of Palestrina.')]
C('young-baron','Cunegonde’s brother','major','The baron’s son and Cunegonde’s brother, raised in the same household as Candide.')
entities[-1]['roleAfter']=[14,28]
entities[-1]['snapshots']=[dict(after=[14,28],body='Cunegonde’s brother, the young baron who became a Jesuit.')]
C('baron','The Baron of Thunder-ten-Tronckh','supporting','The Westphalian nobleman in whose household Candide grows up, father of Cunegonde and her brother.')
C('baroness','The baroness','supporting','The baron’s wife and mother of Cunegonde and her brother.','Baroness')
C('james','James the Anabaptist','supporting','The kindly Anabaptist businessman who helps Candide in Holland.','James|Anabaptist')
C('paquette','Paquette','supporting','The baroness’s chambermaid, known to Candide from his childhood household.','Paquette')
C('giroflee','Friar Giroflee','supporting','The Theatine friar whom Candide meets in Venice.','Friar Giroflee|Friar Giroflée|Giroflee|Giroflée')
C('issachar','Don Issachar','supporting','The merchant in Lisbon who keeps Cunegonde in his household.','Don Issachar|Issachar')
C('inquisitor','The Grand Inquisitor','supporting','The senior Inquisition official in Lisbon who shares access to Cunegonde with Don Issachar.','Grand Inquisitor|Inquisitor')
C('governor','Don Fernando','supporting','The governor of Buenos Aires, who receives Candide and Cunegonde.','Don Fernando')
C('vanderdendur','Vanderdendur','supporting','The Dutch merchant and shipowner in Surinam.','Mynheer Vanderdendur|Vanderdendur')
C('abbe','The abbé of Périgord','supporting','The cleric who acts as Candide’s guide to Parisian society.','Abbe|Abbé|Perigordian|Périgordian')
C('marquise','The Marchioness of Parolignac','supporting','The Parisian hostess who runs the card-playing gathering Candide attends.','Marchioness of Parolignac|Marquise of Parolignac|Marchioness|Marquise')
C('pococurante','Senator Pococurante','supporting','The wealthy Venetian senator and collector whom Candide and Martin visit.','Pococurante|Senator')
C('achmet','Ahmed III','supporting','The former Ottoman sultan, called Achmet here, dining at the Venice inn.','Achmet')
C('ivan','Ivan VI','supporting','The Russian emperor deposed in infancy, portrayed as a diner at the Venice inn.','Ivan')
C('charles-edward','Charles Edward Stuart','supporting','The Stuart claimant to the British throne, one of the royal diners in Venice.','Charles Edward')
C('augustus','Augustus III','supporting','The king of Poland and elector of Saxony, the fourth royal diner in Venice.')
C('stanislaus','Stanisław Leszczyński','supporting','The former king of Poland and duke of Lorraine, the fifth royal diner in Venice.')
C('theodore','Theodore of Corsica','supporting','The former elected king of Corsica, one of the royal diners in Venice.','Theodore')
C('ragotsky','Prince Ragotsky','supporting','The exiled Transylvanian prince whose household holds Cunegonde and the old woman as slaves.','Ragotsky|Ragotski|Transylvanian prince')
C('dervish','The dervish','supporting','The Muslim religious sage whom Candide and his companions consult near Constantinople.','Dervish|dervish')
C('farmer','The Turkish farmer','supporting','The old man near Constantinople who cultivates his small farm with his children.')
for id,name,body,aliases in [
 ('dioscorides','Dioscorides','The ancient physician cited for his remedies.','Dioscorides'),
 ('columbus','Christopher Columbus','The Atlantic explorer named in Pangloss’s account.','Christopher Columbus|Columbus'),
 ('urban','Pope Urban X','The invented pope identified as the old woman’s father.','Pope Urban X|Urban X'),
 ('palestrina','The Princess of Palestrina','The old woman’s mother.','Princess of Palestrina'),
 ('massa','The Prince of Massa Carara','The Italian prince to whom the old woman was betrothed in her youth.','Prince of Massa Carara|Prince of Massa Carrara'),
 ('muley','Muley-Ismael','The Moroccan ruler whose sons fight for power in the old woman’s account.','Muley-Ismael'),
 ('robek','Robek','The writer cited in the old woman’s discussion of suicide, also spelled Robeck.','Robek|Robeck'),
 ('didrie','Father Didrie','The Jesuit who helps Cunegonde’s brother after the attack on the family’s castle.','Didrie'),
 ('raleigh','Sir Walter Raleigh','The English explorer named in the account of Europeans searching for El Dorado.','Walter Raleigh'),
 ('freron','Élie Fréron','The French critic used as a byword for hostile literary journalism.','Freron|Fréron'),
 ('clairon','Clairon','The celebrated French actress whom Candide wants to meet.','Clairon'),
 ('monime','Adrienne Lecouvreur','The French actress referred to as Miss Monime, after one of her stage roles.','Miss Monime|Monime'),
 ('elizabeth','Elizabeth I','The English queen represented in the play Candide watches in Paris.','Queen Elizabeth'),
 ('gauchat','Gabriel Gauchat','The French religious writer discussed at the Parisian supper.','Gauchat'),
 ('trublet','Nicolas Trublet','The French cleric and writer discussed at the Parisian supper.','Trublet'),
 ('raphael','Raphael','The Italian Renaissance painter whose works Pococurante owns.','Raphael'),
 ('caesar','Julius Caesar','The Roman commander and ruler invoked in the conversation.','Caesar'),
 ('cato','Cato','The Roman statesman invoked as an example of grave public virtue.','Cato'),
 ('homer','Homer','The ancient Greek epic poet, author of the Iliad and Odyssey.','Homer'),
 ('helen','Helen of Troy','The woman at the center of the Trojan War story discussed by Pococurante.','Helen'),
 ('virgil','Virgil','The Roman poet who wrote the Aeneid.','Virgil'),
 ('aeneas','Aeneas','The Trojan hero of Virgil’s Aeneid.','AEneas|Aeneas'),
 ('cloanthus','Cloanthus','One of Aeneas’s Trojan companions in the Aeneid.','Cloanthus'),
 ('achates','Achates','Aeneas’s faithful companion in the Aeneid.','Achates'),
 ('ascanius','Ascanius','Aeneas’s young son in the Aeneid.','Ascanius'),
 ('latinus','Latinus','The Italian king and father of Lavinia in the Aeneid.','Latinus'),
 ('amata','Amata','Latinus’s wife and Lavinia’s mother in the Aeneid.','Amata'),
 ('lavinia','Lavinia','The daughter of Latinus and Amata in the Aeneid.','Lavinia'),
 ('tasso','Torquato Tasso','The Italian poet compared with Virgil and Milton.','Tasso'),
 ('ariosto','Ludovico Ariosto','The Italian poet whose fantastic epic is discussed by Pococurante.','Ariosto'),
 ('horace','Horace','The Roman poet whose satires and odes Pococurante criticizes.','Horace'),
 ('rupilius','Rupilius','The figure mocked in the quarrel from Horace’s satire.','Rupilius'),
 ('maecenas','Maecenas','Horace’s wealthy Roman patron.','Maecenas'),
 ('cicero','Cicero','The Roman orator and philosopher discussed in Pococurante’s library.','Cicero'),
 ('rabirius','Rabirius','The Roman defendant named in a speech by Cicero.','Rabirius'),
 ('cluentius','Cluentius','The Roman defendant defended by Cicero.','Cluentius'),
 ('seneca','Seneca','The Roman Stoic philosopher and author.','Seneca'),
 ('milton','John Milton','The English poet who wrote Paradise Lost.','Milton'),
 ('plato','Plato','The ancient Greek philosopher.','Plato'),
 ('mahmoud','Mahmud I','The Ottoman sultan whom Achmet identifies as his nephew and successor.','Sultan Mahmoud|Mahmoud'),
 ('leibniz','Gottfried Wilhelm Leibniz','The German philosopher named in the discussion of optimism.','Leibnitz|Leibniz')]:C(id,name,'reference',body,aliases)
for id,name,body,aliases,kind in [
 ('god','God','The divine creator invoked in religious expressions and philosophical debate.','God|Eternal','deity'),
 ('antichrist','The Antichrist','The religious adversary of Christ invoked in the argument about the pope.','Anti-Christ|Antichrist','religious-figure'),
 ('mary','The Virgin Mary','The mother of Jesus, invoked as Our Lady of Atocha and the Holy Virgin.','our lady of Atocha|Our Lady of Atocha|Holy Virgin','religious-figure'),
 ('anthony','Saint Anthony of Padua','The Christian saint invoked by the old woman.','St. Anthony of Padua|Saint Anthony of Padua','religious-figure'),
 ('saint-james','Saint James of Compostela','The apostle associated with the shrine at Compostela, invoked by the old woman.','St. James of Compostella|Saint James of Compostela|St. James of Compostela','religious-figure'),
 ('ignatius','Saint Ignatius of Loyola','The founder of the Jesuit order.','St. Ignatius|Saint Ignatius','religious-figure'),
 ('venus','Venus','The goddess of love represented by the Medici statue.','Venus','deity'),
 ('muhammad','Muhammad','The prophet of Islam, called Mahomet in the original edition.','Mahomet|Muhammad','religious-figure'),
 ('centaurs','The centaurs','The half-human, half-horse creatures of classical mythology.','Centaurs','group'),
 ('fauns','The fauns','The woodland beings of classical mythology.','Fauns','group'),
 ('satyrs','The satyrs','The part-human wild beings of classical mythology.','Satyrs','group'),
 ('adam','Adam','The first man in the biblical creation story.','Adam','religious-figure'),
 ('moses','Moses','The biblical lawgiver traditionally associated with the account in Genesis.','Moses','religious-figure'),
 ('messiah','The Messiah','The Son of God as represented in Milton’s Paradise Lost.','Messiah','religious-figure'),
 ('satan','Lucifer','The devil as represented in Milton’s Paradise Lost.','Lucifer','literary-figure'),
 ('sin','Sin','The personified figure in Paradise Lost discussed by Pococurante.','','literary-figure'),
 ('death','Death','The personified figure in Paradise Lost discussed by Pococurante.','','literary-figure'),
 ('abraham','Abraham','The biblical patriarch invoked by the diamond buyer.','Abraham','religious-figure')]:C(id,name,'reference',body,aliases,kind)
for id,name,body,aliases in [
 ('eglon','Eglon','The Moabite king in Pangloss’s list of rulers.','Eglon'),('ehud','Ehud','The biblical judge named with Eglon.','Ehud'),
 ('absalom','Absalom','The biblical prince, son of David.','Absalom'),('nadab','Nadab','The king of Israel, son of Jeroboam.','Nadab'),
 ('jeroboam','Jeroboam','The king of Israel and father of Nadab.','Jeroboam'),('baasha','Baasha','The king of Israel called Baasa in the original.','Baasa|Baasha'),
 ('elah','Elah','The Israelite king called Ela in the original.','Ela|Elah'),('zimri','Zimri','The king of Israel named in the catalogue.','Zimri'),
 ('ahaziah','Ahaziah','The king of Judah named with Jehu in the catalogue.','Ahaziah'),('jehu','Jehu','The Israelite king named in Pangloss’s catalogue.','Jehu'),
 ('athaliah','Athaliah','The queen who ruled Judah.','Athaliah'),('jehoiada','Jehoiada','The high priest named with Athaliah.','Jehoiada'),
 ('jehoiakim','Jehoiakim','The king of Judah named in the catalogue.','Jehoiakim'),('jeconiah','Jeconiah','The king of Judah also known as Jehoiachin.','Jeconiah'),
 ('zedekiah','Zedekiah','The last king of Judah before the Babylonian conquest.','Zedekiah'),('croesus','Croesus','The king of Lydia famous for his wealth.','Croesus'),
 ('astyages','Astyages','The last king of the Median Empire.','Astyages'),('darius','Darius III','The Persian king recalled among rulers brought low.','Darius'),
 ('dionysius','Dionysius of Syracuse','The Syracusan tyrant recalled in the list of fallen rulers.','Dionysius'),('pyrrhus','Pyrrhus','The king of Epirus and military commander.','Pyrrhus'),
 ('perseus','Perseus of Macedon','The Macedonian king, distinct from the mythical hero of the same name.','Perseus'),('hannibal','Hannibal','The Carthaginian commander.','Hannibal'),
 ('jugurtha','Jugurtha','The Numidian king who fought Rome.','Jugurtha'),('ariovistus','Ariovistus','The Germanic leader who fought Julius Caesar.','Ariovistus'),
 ('pompey','Pompey','The Roman commander and rival of Julius Caesar.','Pompey'),('nero','Nero','The Roman emperor.','Nero'),
 ('otho','Otho','The Roman emperor of the year 69.','Otho'),('vitellius','Vitellius','The Roman emperor of the year 69.','Vitellius'),
 ('domitian','Domitian','The Roman emperor named in the catalogue.','Domitian'),('mary-stuart','Mary Stuart','Mary, Queen of Scots, named among unfortunate rulers.','Mary Stuart')]:C(id,name,'reference',body,aliases)

# Explicitly reviewed minor roles, including family and backstory references.
for id,name,role,body in [
 ('candide-mother','The baron’s sister','reference','The woman whom the household suspects to be Candide’s mother.'),
 ('candide-father','The neighboring gentleman','reference','The gentleman whom the household suspects to be Candide’s father.'),
 ('curate','The village curate','reference','The priest serving as the baron’s household chaplain.'),
 ('recruiters','The Bulgarian recruiters','supporting','The two men in blue who approach Candide at the inn.'),
 ('bulgarian-king','The king of the Bulgarians','supporting','The ruler of the army into which Candide is recruited.'),
 ('abare-king','The king of the Abares','supporting','The ruler opposing the Bulgarian army.'),
 ('army-surgeon','The army surgeon','supporting','The surgeon who treats Candide after his punishment in the regiment.'),
 ('orator','The Dutch orator','supporting','The preacher whom Candide asks for help in Holland.'),
 ('orator-wife','The orator’s wife','supporting','The preacher’s wife in the encounter in Holland.'),
 ('grey-confessor','Paquette’s confessor','reference','The Franciscan friar involved with Paquette in her account of life at the castle.'),
 ('countess','The old countess','reference','The countess in Pangloss’s account of the chain of infection.'),
 ('cavalry-captain','The cavalry captain','reference','The cavalry officer in Pangloss’s chain of infection.'),
 ('chain-marchioness','The marchioness in Pangloss’s account','reference','The noblewoman in Pangloss’s chain of infection.'),
 ('page','The page','reference','The young attendant in Pangloss’s chain of infection.'),
 ('chain-jesuit','The Jesuit in Pangloss’s account','reference','The Jesuit in Pangloss’s chain of infection.'),
 ('columbus-companion','Columbus’s companion','reference','The unnamed companion of Columbus in Pangloss’s account.'),
 ('sailor','The sailor at Lisbon','supporting','The sailor traveling on the ship with Candide, Pangloss and James.'),
 ('familiar','The Inquisition agent','supporting','The official who questions Pangloss at the meal in Lisbon.'),
 ('familiar-footman','The agent’s footman','supporting','The servant attending the Inquisition agent at the meal.'),
 ('biscayan','The Biscayan prisoner','supporting','The man prosecuted for marrying his godmother.'),
 ('godmother','The Biscayan’s godmother','reference','The woman whom the Biscayan prisoner has married.'),
 ('portuguese-prisoners','The two Portuguese prisoners','supporting','The men prosecuted for rejecting the bacon in their meal.'),
 ('bulgarian-soldier','The soldier at the castle','reference','The Bulgarian soldier in Cunegonde’s account of the attack on her home.'),
 ('bulgarian-captain','Cunegonde’s Bulgarian captain','reference','The Bulgarian officer who takes charge of Cunegonde after the attack on the castle.'),
 ('friar-thief','The friar at Badajos','supporting','The Franciscan friar encountered at the inn during the flight from Lisbon.'),
 ('prior','The Benedictine prior','supporting','The monk who buys one of the travelers’ horses.'),
 ('prince-mistress','The prince’s former mistress','reference','The older marchioness who invites the Prince of Massa Carara to drink chocolate.'),
 ('corsair','The corsair captain','reference','The pirate captain in the old woman’s account of her voyage from Italy.'),
 ('eunuch','The Italian eunuch','reference','The former chapel musician of the Princess of Palestrina whom the old woman encounters in Africa.'),
 ('dey','The Dey of Algiers','reference','The ruler of Algiers in the old woman’s account.'),
 ('aga','The Janissary officer','reference','The officer who takes the old woman and his household to Azof.'),
 ('azof-imam','The imam at Azof','reference','The religious teacher with the besieged Janissaries in the old woman’s account.'),
 ('french-surgeon','The French surgeon','reference','The surgeon who treats the women after the siege of Azof.'),
 ('boyar','The Russian boyar','reference','The nobleman who employs the old woman as a gardener.'),
 ('alcalde','The alcalde','supporting','The magistrate arriving at Buenos Aires in pursuit of the fugitives.'),
 ('sergeant','The Jesuit guard sergeant','supporting','The soldier who reports Candide’s arrival to the commandant in Paraguay.'),
 ('jesuit-general','The Jesuit general','reference','The head of the Jesuit order in Rome, mentioned in the young baron’s story.'),
 ('oreillons','The Oreillons','supporting','The community encountered by Candide and Cacambo after leaving the Jesuit territory.'),
 ('girls','The two girls in the wilderness','supporting','The young women whom Candide and Cacambo encounter with two monkeys.'),
 ('monkeys','The two monkeys','supporting','The animals accompanying the two girls in the wilderness.'),
 ('schoolchildren','The children of El Dorado','supporting','The village children playing with precious stones.'),
 ('schoolmaster','The schoolmaster','supporting','The teacher who calls the children of El Dorado to school.'),
 ('landlord','The innkeeper in El Dorado','supporting','The host who welcomes the travelers at the village inn.'),
 ('elder','The elder of El Dorado','supporting','The old resident who explains his country’s customs to Candide and Cacambo.'),
 ('eldorado-king','The king of El Dorado','supporting','The hospitable ruler of El Dorado.'),
 ('enslaved-man','The enslaved man at Surinam','supporting','The man enslaved by Vanderdendur whom Candide meets outside Surinam.'),
 ('enslaved-mother','The enslaved man’s mother','reference','The mother remembered by the man Candide meets at Surinam.'),
 ('spanish-captain','The Spanish sea captain','supporting','The captain at Surinam who knows about Cunegonde in Buenos Aires.'),
 ('dutch-magistrate','The Dutch magistrate','supporting','The official who receives Candide’s complaint at Surinam.'),
 ('martin-wife','Martin’s wife','reference','The wife mentioned in Martin’s account of his misfortunes.'),
 ('martin-son','Martin’s son','reference','The son mentioned in Martin’s account of his misfortunes.'),
 ('martin-daughter','Martin’s daughter','reference','The daughter mentioned in Martin’s account of his misfortunes.'),
 ('daughter-lover','The Portuguese man','reference','The man with whom Martin’s daughter runs away.'),
 ('paris-doctors','The Paris physicians','supporting','The two doctors who attend Candide at his inn in Paris.'),
 ('devotees','The Paris devotees','supporting','The two religious attendants who tend to Candide at the Paris inn.'),
 ('parson','The Paris parson','supporting','The cleric who asks the sick Candide for a signed religious undertaking.'),
 ('critic','The theater critic','supporting','The hostile critic seated near Candide at the theater.'),
 ('marquise-daughter','The marchioness’s daughter','supporting','The fifteen-year-old daughter at the Parolignac card table.'),
 ('banker','The card-table banker','supporting','The man running the game at the marchioness’s gathering.'),
 ('scholar','The scholar at supper','supporting','The literary scholar who discusses plays and philosophy at the marchioness’s table.'),
 ('impostor','The false Cunegonde','supporting','The woman in Paris who impersonates Cunegonde.'),
 ('impostor-maid','The maid in the Paris hotel','supporting','The servant attending the woman presented to Candide at the Paris hotel.'),
 ('officer','The Paris officer','supporting','The officer who arrives at the hotel with the abbé.'),
 ('officer-brother','The officer’s brother','supporting','The officer’s brother in Dieppe, who arranges the onward voyage.'),
 ('byng','Admiral John Byng','supporting','The British naval officer shown at Portsmouth.'),
 ('french-admiral','The French admiral','reference','The opposing commander discussed in the explanation at Portsmouth.'),
 ('dutch-skipper','The Dutch skipper','supporting','The captain carrying Candide and Martin from France to England and then Venice.'),
 ('paquette-surgeon','Paquette’s surgeon','reference','The doctor who treats Paquette and takes her as his mistress.'),
 ('surgeon-wife','The surgeon’s wife','reference','The wife of Paquette’s doctor.'),
 ('paquette-judge','The judge in Paquette’s story','reference','The official who arranges Paquette’s release from jail.'),
 ('giroflee-brother','Giroflee’s elder brother','reference','The brother whose inheritance is favored when Giroflee is sent into the church.'),
 ('pococurante-girls','Pococurante’s attendants','supporting','The two young women serving at the senator’s house.'),
 ('levatine-captain','The Levantine captain','supporting','The galley captain with whom Candide negotiates for the enslaved rowers.'),
 ('diamond-buyer','The diamond buyer','supporting','The Jewish merchant who buys Candide’s diamond at Constantinople.'),
 ('ichoglan','The young ichoglan','reference','The young Ottoman page in the baron’s account of Constantinople.'),
 ('baron-cadi','The baron’s judge','reference','The Ottoman judge in the baron’s account of his imprisonment.'),
 ('pangloss-surgeon','The Portuguese surgeon','reference','The surgeon and barber in Pangloss’s account of surviving the hanging.'),
 ('pangloss-wife','The Portuguese surgeon’s wife','reference','The wife of the surgeon who treats Pangloss.'),
 ('knight-malta','The knight of Malta','reference','Pangloss’s employer during part of his travels.'),
 ('venetian-merchant','The Venetian merchant','reference','The merchant who employs Pangloss and takes him to Constantinople.'),
 ('mosque-imam','The imam at the mosque','reference','The religious official in Pangloss’s account of the mosque at Constantinople.'),
 ('devotee','The young woman at the mosque','reference','The worshipper whose bouquet Pangloss picks up.'),
 ('pangloss-cadi','Pangloss’s judge','reference','The Ottoman judge in Pangloss’s account of his imprisonment.'),
 ('farmer-children','The farmer’s children','supporting','The Turkish farmer’s two sons and two daughters, who work with him.'),
 ('viziers','The two viziers','reference','The Ottoman ministers whose fate is reported near the end of the novel.'),
 ('mufti','The mufti','reference','The Ottoman religious official mentioned in the news from Constantinople.'),
]:C(id,name,role,body,'','group' if id in {'recruiters','portuguese-prisoners','oreillons','girls','monkeys','schoolchildren','paris-doctors','devotees','pococurante-girls','farmer-children','viziers'} else 'unnamed-person')
for id,name,body,aliases in [
 ('richard2','Richard II','The English king named in Pangloss’s catalogue.','Richard II'),
 ('edward2','Edward II','The English king named in Pangloss’s catalogue.','Edward II'),
 ('henry6','Henry VI','The English king named in Pangloss’s catalogue.','Henry VI'),
 ('richard3','Richard III','The English king named in Pangloss’s catalogue.','Richard III'),
 ('charles1','Charles I','The British king named in Pangloss’s catalogue.','Charles I'),
 ('henry-emperor','Emperor Henry IV','The Holy Roman emperor, distinct from the French kings named alongside him.','Emperor Henry IV'),
]:C(id,name,'reference',body,aliases)
C('french-henrys','The three Henrys of France','reference','Henry II, Henry III and Henry IV, the French kings grouped together in Pangloss’s catalogue.','three Henrys of France','group')
# The actress is encountered in the narrative, not merely cited as an author.
next(e for e in entities if e['id']=='clairon')['category']='supporting'
next(e for e in entities if e['id']=='paquette')['snapshots']=[dict(after=[24,13],body='The baroness’s former chambermaid, now earning her living through sex work.')]
next(e for e in entities if e['id']=='giroflee')['snapshots']=[dict(after=[30,5],body='The former Theatine friar whom Candide met in Venice.')]
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='candide',contentVersion='2026-09-10.1',coverage='Complete novel in both English editions: named cast and references, reviewed recognizable unnamed roles, historical diners, and source-gated returns and imposture exclusions.',entities=entities),ensure_ascii=False,indent=2)+'\n')
