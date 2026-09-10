"""Manually authored recognition cards; source context determines ambiguous bindings."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',snapshots=None):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=snapshots or []))
C('fogg','Phileas Fogg','central','The punctilious English gentleman at the center of the novel.','Phileas Fogg|Fogg',snapshots=[dict(after=[37,31],body='The English gentleman at the center of the novel, now Aouda’s husband.')])
C('passepartout','Jean Passepartout','central','Fogg’s French valet, a former acrobat and firefighter.','Jean Passepartout|Passepartout')
C('aouda','Aouda','major','The young Parsi widow, daughter of a Bombay merchant.','Aouda',snapshots=[dict(after=[37,31],body='Fogg’s wife, the Parsi woman he met in India.')])
C('fix','Fix','major','The English detective investigating the Bank of England robbery.','Fix|FIX')
for id,name,body,aliases in [
 ('stuart','Andrew Stuart','The engineer among Fogg’s whist partners at the Reform Club.','Andrew Stuart|Stuart'),
 ('sullivan','John Sullivan','One of the bankers in Fogg’s Reform Club circle.','John Sullivan|Sullivan'),
 ('fallentin','Samuel Fallentin','The banker who plays whist as Fogg’s partner at the Reform Club.','Samuel Fallentin|Fallentin'),
 ('flanagan','Thomas Flanagan','The brewer among Fogg’s Reform Club companions.','Thomas Flanagan|Flanagan'),
 ('ralph','Gauthier Ralph','The Bank of England director in Fogg’s Reform Club circle.','Gauthier Ralph|Ralph'),
 ('james-forster','James Forster','The valet whom Fogg dismisses before hiring Passepartout.','James Forster'),
 ('albemarle','Lord Albemarle','The elderly nobleman who backs Fogg’s attempt to travel around the world.','Lord Albemarle'),
 ('cromarty','Sir Francis Cromarty','The British brigadier-general traveling to his posting at Benares.','Sir Francis Cromarty|Francis Cromarty|Sir Francis'),
 ('obadiah','Judge Obadiah','The Calcutta magistrate hearing the complaint against Fogg and Passepartout.','Judge Obadiah|Obadiah'),
 ('oysterpuff','Mr. Oysterpuff','Judge Obadiah’s clerk.','Oysterpuff'),
 ('bunsby','John Bunsby','The skipper of the pilot-boat Tankadere.','John Bunsby|Bunsby|John Busby'),
 ('batulcar','William Batulcar','The circus manager whose troupe performs in Yokohama.','William Batulcar|Batulcar'),
 ('proctor','Colonel Stamp Proctor','The American colonel Fogg encounters in San Francisco.','Colonel Stamp Proctor|Stamp Proctor|Colonel Proctor|Proctor'),
 ('hitch','Elder William Hitch','The Mormon missionary lecturing on the train.','Elder William Hitch|William Hitch|Elder Hitch|Hitch'),
 ('engineer-forster','Forster','The American locomotive engineer on the transcontinental railway.',''),
 ('mudge','Mudge','The American who owns the sail-powered sledge near Fort Kearney.','Mudge'),
 ('speedy','Andrew Speedy','The captain and owner of the steamer Henrietta.','Andrew Speedy|Captain Speedy|Speedy'),
 ('wilson','The Reverend Samuel Wilson','The clergyman of Marylebone parish whom Fogg asks Passepartout to visit.','Reverend Samuel Wilson|Samuel Wilson'),
 ('decimus','The Reverend Decimus Smith','The clergyman returning to Bombay who plays whist aboard the Mongolia.','Decimus Smith'),
]:C(id,name,'supporting',body,aliases)
C('kiouni','Kiouni','supporting','The elephant used for the journey toward Allahabad.','Kiouni','animal')
for id,name,body in [
 ('suez-consul','The British consul at Suez','The British official who checks Fogg’s passport and talks with Fix.'),
 ('tax-collector','The tax collector','The passenger bound for Goa who joins Fogg’s whist games aboard the Mongolia.'),
 ('guide','The Parsi guide','The young elephant driver guiding Fogg’s party toward Allahabad.'),
 ('elephant-owner','Kiouni’s owner','The man who negotiates the sale of the elephant to Fogg.'),
 ('calcutta-officer','The Calcutta police officer','The officer who takes Fogg and Passepartout to court.'),
 ('bombay-director','The Bombay police director','The police official whom Fix asks for an arrest order.'),
 ('beggar','The woman at Charing Cross','The woman carrying a child who asks Fogg for alms.'),
 ('allahabad-dealer','The Allahabad clothes dealer','The secondhand dealer who sells Passepartout an outfit for Aouda.'),
 ('yokohama-dealer','The Yokohama clothes dealer','The dealer with whom Passepartout exchanges his clothes.'),
 ('conductor-india','The Indian railway conductor','The conductor explaining why the train cannot continue toward Allahabad.'),
 ('conductor-america','The American railway conductor','The conductor on the train carrying Fogg’s party across the United States.'),
 ('signalman','The railway signalman','The man sent ahead from Medicine Bow to warn the train about the bridge.'),
 ('stoker','The American train’s stoker','The railway worker tending the locomotive’s fire.'),
 ('captain-kearney','The Fort Kearney commander','The captain commanding the soldiers at Fort Kearney.'),
 ('sergeant-kearney','The Fort Kearney sergeant','The older sergeant chosen to lead the volunteer soldiers.'),
 ('proctor-second','Proctor’s second','The American who agrees to act for Proctor in the proposed duel.'),
 ('late-mormon','The late-arriving Mormon passenger','The man who runs to catch the train as it leaves Salt Lake City.'),
 ('sioux-chief','The Sioux chief','The leader who climbs onto the locomotive during the attack.'),
 ('hongkong-pilot','The Hong Kong pilot','The pilot who boards the Rangoon and answers Fogg’s questions about the next sailing.'),
 ('carnatic-clerk','The Carnatic’s booking clerk','The clerk who sells Passepartout berths for the voyage to Yokohama.'),
 ('rangoon-captain','The Rangoon’s captain','The captain of the steamer carrying Fogg’s party toward Hong Kong.'),
 ('yokohama-captain','The Yokohama steamer’s captain','The captain whose ship connects Shanghai with Nagasaki and Yokohama.'),
 ('hongkong-broker','The Hong Kong broker','The broker whom Fogg asks about Jeejeeh at the Exchange.'),
 ('liverpool-engineer','The Liverpool train driver','The engineer driving Fogg’s special train toward London.'),
]:C(id,name,'supporting',body,kind='unnamed-person')
for id,name,body,aliases in [
 ('bombay-priests','The Malabar Hill priests','The three priests from the Bombay temple Passepartout enters.',''),
 ('pillaji-priests','The Pillaji priests','The priests taking part in the funeral procession in Bundelcund.',''),
 ('long-noses','The Long Noses','The Japanese acrobats in Batulcar’s troupe, performing with long artificial noses.','Long Noses'),
 ('sioux-attackers','The Sioux attackers','The group attacking the train near Fort Kearney.',''),
 ('kearney-soldiers','The Fort Kearney soldiers','The troops stationed at the fort beside the railway.',''),
 ('tankadere-crew','The Tankadere’s crew','The four sailors working under John Bunsby.',''),
 ('henrietta-crew','The Henrietta’s crew','The sailors and engine-room workers aboard Captain Speedy’s ship.',''),
 ('opium-attendants','The opium-house attendants','The two waiters who attend to Passepartout in the Hong Kong opium house.',''),
]:C(id,name,'supporting',body,aliases,'group')
C('bank-robber','The bank robber','reference','The unidentified thief sought after the Bank of England robbery.',kind='unnamed-person',snapshots=[dict(after=[36,0],name='James Strand',body='The Bank of England robber, identified as James Strand.')])
C('strand','James Strand','reference','The man identified as the Bank of England robber.','James Strand')
for id,name,body,aliases in [
 ('longferry','Lord Longferry','The young member of Parliament who previously employed Passepartout.','Lord Longferry'),
 ('rowan','Rowan','The Scotland Yard commissioner addressed in Fix’s dispatch.','ROWAN|Rowan'),
 ('jeejeebhoy','Sir Jametsee Jeejeebhoy','The wealthy Parsi merchant and baronet related to Aouda.','Sir Jametsee Jeejeebhoy|Jametsee Jeejeebhoy|Jeejeebhoy'),
 ('jeejeeh','Jeejeeh','Aouda’s merchant relative in Hong Kong, a cousin of Sir Jametsee Jeejeebhoy.','Jeejeeh'),
 ('camerfield','Camerfield','One of the rival candidates whose supporters gather in San Francisco.','Camerfield'),
 ('mandiboy','Mandiboy','The other candidate supported by the San Francisco crowd.','Mandiboy'),
 ('sheridan','Richard Brinsley Sheridan','The playwright and politician who formerly lived in Fogg’s house.','Sheridan'),
 ('byron','Lord Byron','The English Romantic poet whose appearance is compared with Fogg’s.','Byron|Byronic'),
 ('leotard','Jules Léotard','The French acrobat invoked as a standard of athletic skill.','Leotard|Léotard'),
 ('blondin','Charles Blondin','The celebrated tightrope walker.','Blondin'),
 ('kauffmann','Angelica Kauffmann','The painter cited in the description of Fogg’s composure.','Angelica Kauffmann'),
 ('lesseps','Ferdinand de Lesseps','The promoter of the Suez Canal project.','Lesseps'),
 ('stephenson','Robert Stephenson','The British engineer who opposed the Suez Canal scheme.','Stephenson'),
 ('zoroaster','Zoroaster','The religious teacher associated with Zoroastrianism, the faith of the Parsis.','Zoroaster'),
 ('aurangzeb','Aurangzeb','The Mughal emperor named here as Aureng-Zeb.','Aureng-Zeb|Aurangzeb'),
 ('feringhea','Feringhea','The Thuggee leader mentioned in the account of central India.','Feringhea'),
 ('poet-king','Ucaf Uddaul','The poet-king to whom the narrator attributes the verse used to describe Aouda.','Ucaf Uddaul'),
 ('muhammad','Muhammad','The prophet of Islam, named here as Mahomet.','Mahomet'),
 ('confucius','Confucius','The Chinese teacher whose followers are mentioned in Yokohama.','Confucius'),
 ('barnum','P. T. Barnum','The American showman used as a comparison for Batulcar.','Barnum'),
 ('smith','Joseph Smith','The founder of the Latter Day Saint movement, discussed by Elder Hitch.','Joe Smith|Joseph Smith'),
 ('hyrum','Hyrum Smith','Joseph Smith’s brother, called Hiram in Hitch’s speech.','Hiram'),
 ('young','Brigham Young','The Mormon leader who succeeded Joseph Smith, discussed by Hitch.','Brigham Young'),
 ('hugo','Victor Hugo','The French writer quoted about the geometry of American cities.','Victor Hugo'),
 ('dodge','General Dodge','The chief engineer associated with the Union Pacific railroad.','General Dodge'),
 ('durant','Thomas C. Durant','The Union Pacific vice-president named among the railway’s inaugural guests.','Thomas C. Durant'),
 ('lincoln','Abraham Lincoln','The American president mentioned in the account of the transcontinental railroad.','President Lincoln'),
]:C(id,name,'reference',body,aliases)
for id,name,body,aliases,kind in [
 ('rajah','The rajah of Bundelcund','Aouda’s deceased husband, whose funeral procession the travelers encounter.','','unnamed-person'),
 ('aouda-father','Aouda’s father','The wealthy Bombay merchant whose daughter is Aouda.','','unnamed-person'),
 ('queen-poem','The queen of Ahmehnagara','The queen praised in the poem the narrator quotes when describing Aouda.','queen of Ahmehnagara','literary-figure'),
 ('mikado','The Mikado','The emperor of Japan, referred to by his imperial title.','Mikado','unnamed-person'),
 ('tycoon','The Tycoon','The Japanese shogun, described in the narrator’s account of Japan’s former government.','Tycoon','unnamed-person'),
 ('joseph-bible','Joseph','The biblical patriarch whose tribe is named in Hitch’s religious history.','','religious-figure'),
 ('mormon-prophet','The prophet in Hitch’s account','The unnamed prophet to whom Hitch attributes the annals of his religion.','','religious-figure'),
 ('mormon-son','Mormon in Hitch’s account','The son said in Hitch’s account to inherit the religious annals.','','religious-figure'),
 ('messenger-smith','The heavenly messenger','The messenger said in Hitch’s account to appear to Joseph Smith.','','religious-figure'),
 ('smith-father','Joseph Smith’s father','The father included in Hitch’s account of the founding of the church.','','unnamed-person'),
 ('mummy-showman','The mummy showman','The seller of papyrus in Hitch’s account of Joseph Smith.','','unnamed-person'),
 ('abraham','Abraham','The biblical patriarch to whom Hitch attributes the writing on the papyrus.','Abraham','religious-figure'),
 ('solomon','Solomon','The biblical king invoked in the narrator’s account of Aden’s ancient cisterns.','Solomon','religious-figure'),
 ('minerva','Minerva','The Roman goddess invoked in the description of Passepartout’s hair.','Minerva','deity'),
 ('kali','Kali','The Hindu goddess whose image appears in the funeral procession.','Kali','deity'),
 ('juggernaut','Juggernaut','Jagannath, the Hindu deity invoked in the narrator’s comparison with ceremonial chariots.','','deity'),
 ('brahma','Brahma','The Hindu creator deity mentioned in the account of Indian religious traditions.','Brahma','deity'),
 ('kama','Kama','The Hindu god of love invoked in the quoted description of beauty.','Kama','deity'),
 ('vishvakarma','Vishvakarma','The divine craftsman invoked in the poem, named here as Vicvarcarma.','Vicvarcarma','deity'),
 ('vishnu','Vishnu','The Hindu deity associated with preserving the world.','Vishnu','deity'),
 ('shiva','Shiva','The Hindu deity associated with destruction and renewal.','Shiva','deity'),
 ('benten','Benten','The Japanese goddess after whom the Yokohama quarter is named.','Benten','deity'),
 ('tingou','Tingou','The supernatural figure invoked as patron of the Long Noses acrobats.','Tingou','mythological-figure'),
 ('amphion','Amphion','The mythical musician whose lyre could move stones to build the walls of Thebes.','Amphion','mythological-figure'),
 ('nizam','The Nizam','The ruler of Hyderabad, referred to by his title in the account of India.','Nizam','unnamed-person'),
 ('john-bull','John Bull','The conventional personification of England, invoked in Proctor’s taunt.','John Bull','personification'),
]:C(id,name,'reference',body,aliases,kind)
p=Path(__file__).resolve().parent
(p/'editorial.json').write_text(json.dumps(dict(contentVersion='2026-09-10.1',coverage='All 37 chapters: principal travelers, club members, local encounters, separated railway and maritime personnel, family references, historical and religious allusions.',entities=entities),ensure_ascii=False,indent=2)+'\n')
