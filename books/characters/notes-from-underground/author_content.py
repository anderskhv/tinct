"""Manual full-novella recognition copy, including the edition's literary allusions."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('underground-man','The Underground Man','central','The unnamed narrator: a retired civil servant living in Petersburg.','paradoxalist','unnamed-person')
C('liza','Liza','major','The young Russian woman from Riga working in the brothel the narrator visits.','Liza')
C('apollon','Apollon','major','The narrator’s servant during his younger years, who also works as a tailor.','Apollon')
C('zverkov','Zverkov','major','The narrator’s former schoolmate, now an army officer.','Zverkov')
C('simonov','Simonov','supporting','The former schoolmate with whom the narrator still occasionally associates.','Simonov')
C('ferfitchkin','Ferfitchkin','supporting','The narrator’s former schoolmate and an admirer of Zverkov.','Ferfitchkin')
C('trudolyubov','Trudolyubov','supporting','The army officer among the former schoolmates, a distant relation of Zverkov.','Trudolyubov')
C('anton','Anton Antonitch Syetotchkin','supporting','The narrator’s superior at the office and occasional social host.','Anton Antonitch Syetotchkin|Anton Antonitch|Syetotchkin')
C('office-officer','The officer at the government office','supporting','The officer whose clanking sword irritates the narrator during his government service.','','unnamed-person')
C('tavern-officer','The officer from the tavern','supporting','The tall officer the narrator encounters at the billiard table and on Nevsky Prospect.','','unnamed-person')
C('country-servant','The narrator’s later servant','supporting','The older country woman employed by the narrator when he writes his notes.','','unnamed-person')
C('madam','The brothel’s madam','supporting','The woman running the brothel where Liza and Olympia work.','madam','unnamed-person')
C('olympia','Olympia','supporting','A woman at the brothel, known to Zverkov and the narrator.','Olympia')
C('driver','The sledge-driver','supporting','The driver hired by the narrator after the dinner.','sledge-driver','unnamed-person')
C('waiters','The restaurant waiters','supporting','The staff serving the farewell dinner at the Hôtel de Paris.','waiter|waiters','group')
for id,name,body,aliases,kind in [
 ('benefactor','The narrator’s benefactor','The distant relative whose inheritance allows the narrator to retire.','','unnamed-person'),
 ('childhood-relations','The narrator’s childhood relations','The relatives responsible for sending the narrator to school.','','group'),
 ('school-friend','The narrator’s school friend','The unnamed boy whom the narrator recalls befriending at school.','','unnamed-person'),
 ('clerk','The other clerk','The office colleague whose appearance the young narrator compares with his own.','','unnamed-person'),
 ('dirty-clerk','The clerk in the dirty uniform','The second office colleague described by the young narrator, remembered for his old uniform.','','unnamed-person'),
 ('wine-connoisseur','The wine connoisseur','The narrator’s acquaintance who prides himself on his knowledge of Lafitte wine.','','unnamed-person'),
 ('thrown-man','The man thrown from the tavern','The man the narrator sees thrown out during a fight with billiard cues.','','unnamed-person'),
 ('porter','The officer’s porter','The porter who gives the narrator information about the tall officer’s lodgings.','','unnamed-person'),
 ('job-patron','The narrator’s patron','The influential person who recommended the narrator for his job.','','unnamed-person'),
 ('countess','The countess','The unnamed aristocratic woman whom the narrator imagines among Nevsky Prospect’s fashionable public.','Countess','unnamed-person'),
 ('prince-d','Prince D.','The aristocrat mentioned among the fashionable people on Nevsky Prospect.','Prince D.' ,'person'),
 ('anton-daughters','Anton Antonitch’s daughters','The two teenage daughters in Anton Antonitch’s household.','','group'),
 ('aunt','The daughters’ aunt','The aunt who pours tea at Anton Antonitch’s gatherings.','','unnamed-person'),
 ('official-visitors','Anton Antonitch’s visitors','The officials who gather to discuss work, pay and promotion at Anton Antonitch’s home.','','group'),
 ('excellency','His Excellency','The senior official discussed by Anton Antonitch’s visitors.','His Excellency','unnamed-person'),
 ('general','The elderly general','The father of the young women whom Zverkov approaches at the theater.','','unnamed-person'),
 ('general-daughters','The general’s daughters','The young women whom Zverkov approaches at the theater.','','group'),
 ('kolya','Prince Kolya','The wealthy hussar whom Zverkov describes as his friend.','Prince Kolya|Kolya','person'),
 ('zverkov-lady','The woman in Zverkov’s story','The unnamed woman whose affection Zverkov boasts of winning.','','unnamed-person'),
 ('podharzhevsky','Podharzhevsky','The hussar whose large income the dinner guests discuss.','Podharzhevsky','person'),
 ('princess-d','Princess D.','The princess whose beauty the dinner guests discuss without having met her.','Princess D.','person'),
 ('liza-parents','Liza’s parents','The tradespeople in Riga with whom Liza grew up.','','group'),
 ('dead-woman','The woman in the coffin','The dead woman described by the narrator in his story to Liza.','','unnamed-person'),
 ('other-madam','The other madam','The brothel keeper in the narrator’s account of the dead woman’s debts.','','unnamed-person'),
 ('loving-father','The affectionate father','The father whose devotion to his daughter the narrator describes to Liza.','','unnamed-person'),
 ('loved-daughter','The affectionate father’s daughter','The daughter in the narrator’s example of paternal devotion.','','unnamed-person'),
 ('salt-fish-woman','The woman with the salt fish','The woman the narrator describes seeing outside a brothel on New Year’s Day.','','unnamed-person'),
 ('student','Liza’s correspondent','The young man from Riga whose affectionate letter Liza keeps; the narrator thinks he is a medical student.','','unnamed-person'),
 ('liza-friend','Liza’s friend','The friend who accompanies Liza to a dance and passes on the young man’s letter.','','unnamed-person'),
 ('dance-hosts','The hosts of the dance','The family at whose house Liza meets her childhood acquaintance again.','','group'),
 ('vanuha','Vanuha','The gravedigger named in the narrator’s imagined burial scene.','Vanuha','literary-figure')]:C(id,name,'reference',body,aliases,kind)
for id,name,body,aliases,kind in [
 ('dostoevsky','Fyodor Dostoevsky','The author of the novella, distinct from the fictional writer of the notes.','','person'),
 ('wagenheims','The Wagenheims','The Petersburg dentists whose name the narrator invokes in his discussion of toothache.','Wagenheims','group'),
 ('ge','Nikolai Ge','The Russian painter whose surname this translation renders as Gay.','Gay','person'),
 ('saltykov','Mikhail Saltykov-Shchedrin','The Russian satirist alluded to as the author of As You Will.','','person'),
 ('buckle','Henry Thomas Buckle','The English historian cited for his theory of civilization and violence.','Buckle','person'),
 ('napoleon-i','Napoleon I','The French emperor referred to as Napoleon the Great.','','person'),
 ('napoleon-iii','Napoleon III','The later French emperor, called the present Napoleon in the narrator’s historical comparison.','','person'),
 ('attila','Attila','The ruler of the Huns, invoked as an example of a violent conqueror.','Attilas','person'),
 ('razin','Stenka Razin','The Cossack leader of a major rebellion in seventeenth-century Russia.','Stenka Razins','person'),
 ('cleopatra','Cleopatra','The Egyptian queen cited in the narrator’s account of cruelty in history.','Cleopatra','person'),
 ('anaevsky','Anaevsky','The Russian writer mockingly cited on the Colossus of Rhodes.','Anaevsky','person'),
 ('colossus','The Colossus of Rhodes','The ancient giant statue at Rhodes mentioned in the narrator’s historical digression.','Colossus of Rhodes','object'),
 ('heine','Heinrich Heine','The German poet cited on the difficulty of writing a truthful autobiography.','Heine','person'),
 ('rousseau','Jean-Jacques Rousseau','The author of the Confessions, discussed as an example of autobiographical self-presentation.','Rousseau','person'),
 ('nekrasov','Nikolai Nekrasov','The Russian poet whose verse introduces the second part.','NEKRASSOV','person'),
 ('soskice','Juliet Soskice','The translator credited for the poem introducing the second part.','Juliet Soskice','person'),
 ('kostanzhoglo','Kostanzhoglo','The efficient landowner in Gogol’s Dead Souls, invoked as a practical ideal.','Kostanzhoglos','literary-figure'),
 ('pyotr','Uncle Pyotr Ivanitch','The pragmatic uncle in Goncharov’s A Common Story, invoked as a model of worldly success.','Uncle Pyotr Ivanitchs','literary-figure'),
 ('spain-king','The imagined King of Spain','The royal identity used as an example of delusion, recalling Gogol’s Diary of a Madman.','King of Spain','literary-figure'),
 ('gogol','Nikolai Gogol','The Russian writer whose comic officer Pirogov is recalled.','Gogol','person'),
 ('pirogov','Lieutenant Pirogov','The officer in Gogol’s Nevsky Prospect used as a comparison for the narrator’s adversary.','Lieutenant Pirogov|Pirogov','literary-figure'),
 ('tchurkin','Tchurkin','The shopkeeper whose establishment supplies the narrator’s gloves and hat.','Tchurkin','person'),
 ('manfred','Manfred','Byron’s tormented dramatic hero, invoked as a model for the narrator’s fantasies.','Manfred','literary-figure'),
 ('pope','The pope','The head of the Catholic Church as a figure in the narrator’s fantasy.','Pope','unnamed-person'),
 ('shakespeare','William Shakespeare','The English playwright whose lasting fame the dinner guests discuss.','Shakespeare','person'),
 ('pushkin','Alexander Pushkin','The Russian writer whose fictional duelist Silvio supplies a model for the narrator’s fantasy.','Pushkin','person'),
 ('silvio','Silvio','The duelist in Pushkin’s The Shot, recalled during the narrator’s revenge fantasy.','Silvio','literary-figure'),
 ('lermontov','Mikhail Lermontov','The Russian writer of Masquerade, mentioned as another source of the narrator’s fantasy.','Lermontov','person'),
 ('lovelace','Lovelace','The seducer in Richardson’s Clarissa, used as a comparison in the narrator’s description of Zverkov.','Lovelace','literary-figure'),
 ('sand','George Sand','The French novelist invoked as a model for the narrator’s sentimental imaginings.','George Sand','person'),
 ('alexander','Alexander the Great','The Macedonian conqueror invoked in the narrator’s comparison of Apollon’s vanity.','Alexander of Macedon','person'),
 ('god','God','The deity invoked in the narrator’s prayers, exclamations and moral language.','God|Almighty|Providence','deity'),
 ('devil','The devil','The supernatural figure invoked in the narrator’s exclamations.','Devil|devil','religious-figure')]:C(id,name,'reference',body,aliases,kind)
p=Path(__file__).resolve().parent
(p/'editorial.json').write_text(json.dumps(dict(contentVersion='2026-09-10.1',coverage='Both parts and all 21 local chapters: principal participants, recalled family and social figures, imagined roles and named literary/historical allusions.',entities=entities),ensure_ascii=False,indent=2)+'\n')
