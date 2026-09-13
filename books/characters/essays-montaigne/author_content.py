"""Manually authored recognition cards for both full English texts of Montaigne's
Essays.

Cotton's translation in both editions, 107 chapters covering Montaigne's three
books, 4,897 paragraphs per edition, aligned paragraph for paragraph. The modern
edition rewrites the sentence rhythm, resolves pronouns to names, and — unlike
the Peloponnesian War package — **modernises the transliterations**: Wicliffe
becomes Wycliffe, Zisca becomes Zizka, Trivulcio becomes Trivulzio, Fabricio
becomes Fabrizio, Juliano becomes Giuliano, Fregosa becomes Fregoso, Sylla
becomes Sulla, AEneid becomes Aeneid. Both spellings are carried on one card.

Chapters 1-69 are authored. The rest are not.

Scope: named persons — historical, literary, mythological and scriptural — and
the gods Montaigne treats as agents. Peoples, places, schools of philosophy and
book titles are not cast, which in the Essays excludes a great deal: the Stoics,
the Pythagoreans, the Romans, the Lacedaemonians, Rome, Athens, and the works
named in the citations (AEneid, Met., Tusc., Epist., Nat. Hist., De Arte
Poetica, Sonetto, Epig.). An author named in a citation is cast, because the
citation is a reference to the man.
"""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='reference',kind='person',updates=None):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',
                      snapshots=sorted(updates or [],key=lambda u:tuple(u['after']))))

# =============================================================== the author
for row in [
('montaigne','Montaigne','The author, who says his book and he are one thing, that he is himself the matter of it, and that he wants to be seen here in his simple, natural, ordinary fashion. He names himself rarely and late — twenty-odd times in a hundred and seven chapters — and the first occurrence of his name in either edition is not his own: it is in an editor’s note at 28:2, about the sonnets of La Boétie that the editions no longer print.','Montaigne','central'),
]:add(*row)

# =============================================== CHAPTER 1 — the same end
for row in [
('edward-black-prince','Edward, Prince of Wales','Edward III’s eldest son, called the Black Prince, who governed Guienne for the English crown. He stormed the city of the Limousins and would not be stopped by the cries of the people or the tears of the women and children — and then spared three French gentlemen who were holding off his whole army alone, and after them the rest of the town.','Black Prince'),
('scanderbeg','Scanderbeg','The prince of Epirus, famous for prodigious force and valour. Chasing one of his own soldiers to kill him, he was stopped by the man turning to face him sword in hand, and pardoned him for the resolution.','Scanderbeg'),
('conrad-iii','The Emperor Conrad III','Who besieged Guelph of Bavaria and would concede nothing but that the women in the town might walk out on foot with what they could carry — and wept for joy when they carried out their husbands, their children and the duke himself, and gave up the hatred he had conceived against him.'),
('guelph','Guelph, Duke of Bavaria','Besieged by Conrad III and carried out of his own town on the shoulders of the women, whose stratagem made the emperor his friend.'),
('pelopidas','Pelopidas','The Theban general, Epaminondas’s colleague, tried for his life with him for keeping arms past the term of their commission. He bowed under the charge, offered nothing but prayers and supplications, and was only just pardoned.','Pelopidas'),
('epaminondas','Epaminondas','The Theban general who broke Sparta at Leuctra, and one of the three men Montaigne names as the most excellent he knows of. Tried for his life with Pelopidas for keeping arms past the term of his commission, he answered by reciting what he had done for Thebes and reproaching his judges with ingratitude — and the court broke up rather than go on.','Epaminondas'),
('dionysius-elder','Dionysius the Elder','The tyrant of Syracuse. He took Reggio and its governor Phyton, told him his son and kindred had been drowned the day before, and had him whipped naked through the streets — and when he read in his own soldiers’ faces that they admired the man and were ready to rescue him, stopped the torture and had him drowned in private. Montaigne returns to him among the men who died of joy.','','supporting'),
('phyton','Phyton','The governor of Reggio, whose defence was unyielding and whose answer to the news that his son had been drowned was that they were by one day happier than he. Dragged through the streets and whipped, he declared the cause of his death aloud the whole way: that he would not surrender his country to a tyrant.','Phyton'),
('pompey','Pompey','Pompey the Great, who pardoned the whole city of the Mamertines, though furiously incensed at it, on the strength of one citizen’s magnanimity — and who excused himself to Posidonius for visiting him at an unseasonable hour, and got a lecture against pain for his politeness. The older edition prints his name Pompeius in that story.','','supporting'),
('zeno-mamertine','Zeno of Messina','The citizen who took his city’s whole fault on himself and asked no favour but to be punished alone for all of them, which got the Mamertines their pardon from Pompey. Not the Zeno of the Stoics.'),
('sylla','Sylla','Sulla, the Roman dictator. His host at Perugia showed the same magnanimity as Zeno of Messina and got nothing by it, for himself or for his fellow citizens.','Sylla|Sulla','supporting'),
('alexander','Alexander','Alexander the Great, whom Montaigne calls the bravest of all men and who was reputed gracious to those he overcame — and who had Betis of Gaza’s heels bored through and the man dragged to death at a cart’s tail for refusing to speak. Montaigne asks whether valour was so familiar to him that he respected it the less, or so peculiarly his own that he could not endure it in another.','','major'),
('betis','Betis','The commander of Gaza, found alone when the city fell, abandoned by his soldiers, his armour hacked to pieces and still fighting. He answered Alexander’s threat of every torment with a fierce and disdainful look and no word at all, and was tortured to death for the silence.','Betis'),
]:add(*row)

# ===================================================== CHAPTER 2 — of sorrow
for row in [
('psammenitus','Psammenitus','The King of Egypt taken prisoner by Cambyses, who watched his daughter go by as a slave and his son led to execution without a word or a change of face, and broke down only at the sight of one of his own household among the captives — because, he said, that grief alone was small enough to be shown by tears.','Psammenitus'),
('cambyses','Cambyses','The King of Persia who defeated and took Psammenitus, and who asked him why the ruin of his children moved him less than the misfortune of a friend.','Cambyses'),
('iphigenia','Iphigenia','Agamemnon’s daughter, whose sacrifice the ancient painter painted by laying out all his art on the grief of the onlookers and then drawing her father with a veil over his face, no countenance being capable of that degree of sorrow.','Iphigenia','reference','mythological-figure'),
('niobe','Niobe','The mother of the poets’ story who lost seven sons and then as many daughters and was turned at last into a rock — Montaigne’s image for the dumb, deaf stupefaction of a grief too great to bear.','Niobe','reference','mythological-figure'),
('ovid','Ovid','The Latin poet of the Metamorphoses and the love poems. The older edition abbreviates the citations to “Met.”','Ovid','supporting'),
('ferdinand','Ferdinand','Who made war about Buda on the widow of King John of Hungary — the campaign in which Raisciac lost his son.'),
('john-of-hungary','King John of Hungary','Whose widow Ferdinand made war on about Buda.'),
('raisciac','Raisciac','The German lord who had admired an unknown man-at-arms’ gallantry in the field and lamented him when he was left dead. When the armour came off he knew the body for his own son, and stood fixed on it without a word until sorrow overcame his vital spirits and he fell down dead.','Raisciac'),
('petrarca','Petrarca','The Italian poet of the sonnets to Laura.','Petrarca|Petrarch'),
('lesbia','Lesbia','The woman Catullus addresses, at the sight of whom, he says, his tongue grows torpid, his ears ring and his eyes are veiled in darkness.','Lesbia','reference','literary-figure'),
('catullus','Catullus','The Latin poet of the Lesbia poems.','Catullus'),
('seneca','Seneca','The Stoic philosopher and tragedian, Nero’s tutor. With Plutarch, one of the two writers Montaigne says he resorts to most.','Seneca','major'),
('sophocles','Sophocles','The Athenian tragedian, and one of Montaigne’s examples of men who died of joy. Montaigne cannot acquiesce in the judgment of the man who, against the accusation of Sophocles’s son, concluded him capable of managing his domestic affairs from having read one of his tragedies.','Sophocles'),
('thalna','Thalna','The Roman who died in Corsica reading the news of the honours the Senate had decreed him.','Thalna'),
('leo-x','Pope Leo X','Who had so ardently desired the taking of Milan that the news of it threw him into a fever, of which he died.','Leo X'),
('diodorus-dialectician','Diodorus the Dialectician','Who died on the spot of shame at not being able, in his own school and before a great auditory, to disengage himself from an argument put to him. Not Diodorus Siculus the historian.'),
]:add(*row)


# ============================= CHAPTER 3 — affections beyond ourselves
for row in [
('plato','Plato','The Athenian philosopher, Socrates’s pupil, and with Cicero the writer Montaigne quotes most. He is an authority and an adversary in the same breath: Montaigne takes “Do thine own work, and know thyself” from him and calls a good deal of the rest of him poetry.','Plato','major'),
('epicurus','Epicurus','The Greek philosopher of pleasure rightly understood, whom Montaigne quotes often and defends against the coarse reading of him. He dispenses his sages from all foresight and care of the future.','Epicurus|EPICURUS|EPICUYUS','supporting'),
('livy','Livy','The Roman historian of the city from its foundation. The older edition writes him Titus Livius at 66:0 and 73:70, and misprints him Titius Livius at 62:18, where the modern edition has the name right.','Livy|Titus Livius|Titius Livius','supporting'),
('nero','Nero','The emperor, Montaigne’s standing example of a prince whose reputation is fair game once he is dead: two of his own soldiers told him to his face why they hated him and why they had tried to kill him. He is also the perfect image of all cruelty who, brought the sentence of a condemned man to sign, cried out that he wished he had never been taught to write — and the man whose pardon Granius Silvanus and Statius Proximus would not live under.','Nero','supporting'),
('aristotle','Aristotle','The philosopher of the schools, whom Montaigne calls the god of scholastic learning and who, he says, will still have a hand in everything.','Aristotle','major'),
('solon','Solon','The Athenian lawgiver, and the author of the saying that no man can be called happy until he is dead — which Montaigne would rather put as that man is never happy, because never so till he is no more. With Lycurgus and Minos, one of the three whom Plato says their immortal children immortalise and deify.','Solon','supporting'),
('lucretius','Lucretius','The Latin poet of On the Nature of Things, quoted throughout the Essays.','Lucretius','supporting'),
('bertrand-du-guesclin','Bertrand de Guesclin','The French general who died at the siege of the Castle of Rancon, and on whose corpse the besieged were made to lay down the keys of the place when they surrendered.','Bertrand de Guesclin|Bertrand du Guesclin|Guesclin'),
('bartolommeo-alviano','Bartolommeo d’Alviano','The Venetian general who died in the Republic’s service at Brescia, and whose body had to be carried home through enemy territory.','Bartolommeo d’Alviano|Bartolomeo d’Alviano|Alviano'),
('theodoro-trivulzio','Theodoro Trivulzio','Who would not have safe-conduct asked of the Veronese for Alviano’s corpse, saying it was not fit that a man never afraid of his enemies in life should seem to fear them dead. Not the Alessandro Trivulcio killed at Reggio.','Theodoro Trivulzio|Theodoro Trivulcio'),
('nicias','Nicias','The Athenian commander who lost the advantage he had visibly won over the Corinthians by suing for his dead — which under Greek law was to renounce the victory.','Nicias'),
('agesilaus','Agesilaus','The Spartan king, one of Montaigne’s standing examples of plain living and hard command — into a decrepit old age he wore the same clothes in winter that he wore in summer, and he fought obscurely armed, without imperial distinction. In the bloody battle against the Boeotians, the sharpest Xenophon says he ever saw, he waived the advantage fortune offered him of letting their battalions pass and charging the rear, judging that an effect of conduct rather than valour; he charged the front instead, was well beaten and well wounded for it, and was constrained at last to take the course he had neglected.','Agesilaus','supporting'),
('edward-i','Edward I, King of England','Who had found in his long wars with Robert of Scotland that his own presence decided everything, and made his son swear to boil his body, bury the flesh, and carry the bones with the army whenever it marched against the Scots.'),
('robert-bruce','Robert, King of Scotland','Edward I’s adversary in the long wars between England and Scotland.'),
('john-zisca','John Zisca','The Bohemian captain who fought for Wycliffe’s doctrines and left orders that they should flay him after death and make a drum of his skin to carry against his enemies.','John Zisca|John Zizka|Zisca|Zizka'),
('wycliffe','Wycliffe','The English reformer whose heresies, in Montaigne’s phrase, John Zisca took up arms to vindicate.','Wicliffe|Wycliffe'),
('bayard','Captain Bayard','Mortally wounded by a harquebuss shot and urged to retire, he answered that he would not begin at the last gasp to turn his back on the enemy, and had himself set down at the foot of a tree with his face to them. Montaigne asks in the chapter on names who would believe that Captain Bayard should have no honour but what he derives from the deeds of Peter Terrail — the two names being one man.','Bayard|Peter Terrail'),
('maximilian-i','The Emperor Maximilian','A prince of great qualities and singular beauty of person, and so modest about his body that he would let nobody see him at the close-stool, and gave orders in his will that they should put drawers on him as soon as he was dead. Great-grandfather to King Philip of Spain, and father to Don Philip.','Maximilian','supporting'),
('philip-ii-spain','King Philip','Philip of Spain, reigning as Montaigne writes, and Maximilian’s great-grandson.'),
('cyrus-the-great','Cyrus','The founder of the Persian empire, who charged his children that neither they nor anyone else should see or touch his body once the soul had left it — a superstition, Montaigne thinks, of a piece with the reverence for religion that marks his whole life and his historian’s. Montaigne also grants that agriculture was an honour to him, as a commendation that suited his condition.','','supporting'),
('marcus-aemilius-lepidus','Marcus Aemilius Lepidus','Who forbade his heirs to spend on his hearse even the ceremonies customary at a funeral.','Marcus. Emilius Lepidus|Marcus Aemilius Lepidus'),
('lycon','Lycon','The philosopher who told his friends to put his body where they thought fit and to make his funeral neither too superfluous nor too mean.','Lycon'),
('socrates','Socrates','The Athenian whose life and death Montaigne treats as the model of a human measure kept without system and without pretension. He wrote nothing; he reaches the Essays through Plato and Xenophon.','Socrates','major'),
('crito','Crito','Socrates’s friend, who asked him at his death how he wished to be buried.'),
('diomedon','Diomedon','One of the Athenian captains condemned after the victory at the Arginusae for not staying to bury their dead. Allowed to speak at last, he said nothing of his own cause or of the cruelty of the sentence, but asked the gods to turn it to his judges’ good and prayed that their neglect of the vows he and his companions had made might not be visited on the city; and went to his death.','Diomedon'),
('chabrias','Chabrias','The Athenian captain-general who, beating Pollis of Sparta at Naxos, threw away the whole fruit of the victory rather than risk Diomedon’s fate, and stopped to pick up a few floating bodies while a world of living enemies sailed away.','Chabrias'),
('pollis','Pollis','The Spartan admiral beaten by Chabrias off the Isle of Naxos.','Pollis'),
('ennius','Ennius','The early Latin poet, who reaches the Essays almost entirely through Cicero’s quotations of him.','Ennius'),
('cicero','Cicero','The Roman orator and philosopher, the most quoted writer in the Essays. Montaigne borrows his Latin constantly and thinks little of him as a man; he gives his reasons in “A consideration upon Cicero.”','Cicero','major'),
]:add(*row)

# ================================ CHAPTER 4 — passions on false objects
for row in [
('lucan','Lucan','The Latin poet of the Pharsalia, on the civil war between Caesar and Pompey.','Lucan','supporting'),
('plutarch','Plutarch','The Greek biographer and moralist, and the book Montaigne says he always has at hand. Most of the ancient examples in the Essays come through him, and Montaigne defends him by name against the charge of credulity.','Plutarch','major'),
('bion','Bion','The philosopher of the ready retort — it is he who asked of a king tearing his hair out for sorrow whether the man thought baldness a remedy for grief.','Bion'),
('xerxes','Xerxes','The Persian king who invaded Greece, and who whipped the sea and sent a written challenge to Mount Athos. Boges kept Eion for him, and would not survive the loss of it.','Xerxes','supporting'),
('caligula','Caligula','The emperor, Montaigne’s example of a fury that destroys a thing for what happened in it: he demolished a very beautiful palace because his mother had once been happy there. It is he who condemned Julius Canus to die, and whom Montaigne calls a worthless fellow for it.','Caligula'),
('augustus','Augustus','The first Roman emperor, Julius Caesar’s heir. Among Montaigne’s examples of him: he defied Neptune after a storm at sea and had the god’s statue taken down from among the deities at the games, and after losing the legions under Quintilius Varus in Germany he ran his head against the wall crying “O Varus! give me back my legions!”','Augustus Caesar|Augustus','supporting'),
('neptune','Neptune','The sea-god whose statue Augustus deposed from among the deities in revenge for a storm.','Neptune','reference','deity'),
('quintilius-varus','Quintilius Varus','The commander under whom Augustus lost his legions in Germany.','Quintilius Varus|Varus'),
]:add(*row)


# ============================ CHAPTER 5 — going out to parley
for row in [
('quintus-marcius','Quintus Marcius','The Roman legate against Perseus of Macedon, who opened sham overtures of accommodation to gain time to reinforce, and was condemned for it by the elder senators as degenerating from the Roman practice of fighting by valour and not by artifice.','Quintus Marcius'),
('perseus-macedon','Perseus, King of Macedon','Lulled asleep by Quintus Marcius’s overtures into granting a truce, and so giving his enemy the leisure to recruit that ruined him in the end. A prisoner at Rome afterwards, he was killed by being kept from sleep — which is why Montaigne turns to the physicians to ask whether our lives depend upon it.','Perseus, King of Macedon|Perseus of Macedon'),
('pyrrhus-epirus','Pyrrhus','The King of Epirus, to whom the Romans handed back his own treacherous physician rather than win by fraud.'),
('polybius','Polybius','The Greek historian of Rome’s rise, cited for the Achaeans, who counted no victory won unless the enemy’s courage was fairly subdued.','Polybius'),
('lysander','Lysander','The Spartan admiral, whose maxim Montaigne quotes for his own countrymen: where the lion’s skin is too short, eke it out with a piece of the fox’s.','Lysander','supporting'),
('montmord','The Seigneur de Montmord','Who with de l’Assigni defended Mousson against the Count of Nassau, and was highly censured for going out to parley.','Montmord'),
('assigni','The Seigneur de l’Assigni','Montmord’s fellow defender of Mousson, censured with him.','Assigni|Assigny'),
('nassau','The Count of Nassau','Who besieged Mousson, which the Seigneurs de Montmord and de l’Assigni were highly censured for going out of to parley with him.'),
('guido-rangone','Count Guido di Rangone','Who went out to parley at Reggio but stepped so little from his fort that when the parley fell into disorder it was l’Escut’s party, not his, that was the weaker — if Du Bellay is to be believed, for Guicciardini says he did it himself.','Guido di Rangone|Rangone'),
('lescut','The Seigneur de l’Escut','Who came up to parley at Reggio and found himself the weaker when the parley broke down, and relied on Rangone’s honour to get him within the walls.','Escut'),
('martin-du-bellay','Martin du Bellay','The soldier and memoirist whose account of the French wars Montaigne uses and sometimes doubts. Not the Cardinal du Bellay, nor the poet.','Martin du Bellay','supporting'),
('guicciardini','Guicciardini','The Florentine historian, who tells the Reggio story against Du Bellay’s version.','Guicciardini','supporting'),
('alessandro-trivulcio','Alessandro Trivulcio','Killed in the disorder at the Reggio parley. Not Theodoro Trivulzio.','Alessandro Trivulcio|Alessandro Trivulzio'),
('eumenes','Eumenes','The Greek secretary and general of Alexander’s successors, shut up in Nora by Antigonus. Summoned out on the ground that Antigonus was the greater man, he answered that he would never think any man greater than himself while he had his sword in his hand.','Eumenes','supporting'),
('antigonus-i','Antigonus','Who besieged Eumenes in Nora and had to give up his nephew Ptolomeus in hostage before Eumenes would come out to him.'),
('ptolomeus-nephew','Ptolomeus','Antigonus’s nephew, given to Eumenes as a hostage.','Ptolomeus'),
('henry-de-vaux','Henry de Vaux','The cavalier of Champagne besieged in the Castle of Commercy, who went out on the word of his enemy, was shown the mine that would have buried him, and thought himself so obliged that he surrendered himself and his garrison.','Henri de Vaux'),
('bartholomew-de-brunes','Bartholomew de Brunes','Who commanded the siege of Commercy, sapped the castle to the props, and called Henry de Vaux out to show him what waited for him.','Bartholomew de Brunes|Bartholomew de Brunes'),
]:add(*row)

# =========================== CHAPTER 6 — the hour of parley is dangerous
for row in [
('lucius-aemilius-regillus','Lucius Aemilius Regillus','The Roman praetor who, unable to take Phocaea by force, received the town as a confederate with every assurance of peace — and then brought his whole army in for the pomp of it and could not stop them sacking it before his face.','Lucius AEmilius Regillus|Lucius Aemilius Regillus'),
('cleomenes-i','Cleomenes','The Spartan king who held that any mischief done an enemy in war was above justice, and who, having made a seven days’ truce with Argos, fell on the Argives asleep on the third night on the ground that nights had not been mentioned.'),
('xenophon','Xenophon','Socrates’s disciple and a soldier — both a great captain and a philosopher of the first form, as Montaigne puts it. His licence about stratagems in war is more than Montaigne will follow.','Xenophon','supporting'),
('aubigny','Monsieur d’Aubigny','Who was battering Capua when his soldiers, slack in their guard during a parley, let the French into the place unawares.','Aubigny'),
('fabrizio-colonna','Signor Fabricio Colonna','Governor of Capua, who began to parley from a bastion and lost the town while he was doing it.','Fabricio Colonna|Fabrizio Colonna|Colonna'),
('juliano-romero','Signor Juliano Romero','Who played the novice at Yvoy by going out to parley with the Constable, and came back to find his place taken.','Juliano Romero|Giuliano Romero|Romero'),
('pescara','The Marquess of Pescara','Who besieged Genoa and took it by the Spaniards slipping in while the articles were as good as concluded.','Pescara'),
('ottaviano-fregoso','Duke Ottaviano Fregosa','Who commanded Genoa under French protection and lost it in the middle of a treaty.','Ottaviano Fregosa|Ottaviano Fregoso|Fregosa|Fregoso'),
('brienne','The Count de Brienne','Who commanded at Ligny in Barrois when the emperor beleaguered it in person.','Brienne'),
('bertheville','Bertheville','Brienne’s lieutenant, who went out to parley at Ligny and lost the town while he was capitulating.','Bertheville'),
('ariosto','Ariosto','The Italian poet of the Orlando Furioso, quoted for the line that victory is ever worthy of praise whether won by fortune or by wit, and again for the hunter who cares nothing for the hare once he sees it taken. The older edition prints his name Aristo in the second citation — which is also the name of a Stoic and of a tragedian in this book.','Ariosto'),
('chrysippus','Chrysippus','The Stoic philosopher who held that a runner should use every force he has, but may not lay a hand on his adversary to stop him or set a leg before him to throw him down. Montaigne agrees.','Chrysippus'),
('polypercon','Polypercon','Who urged Alexander to use the cover of night against Darius, and was told that it was not for such a man as he to steal a victory.','Polypercon'),
('darius-iii','Darius','The Persian king Alexander refused to attack by night.'),
]:add(*row)


# ========================= CHAPTER 7 — the intention judges the action
for row in [
('henry-vii','Henry VII, King of England','Who got the Duke of Suffolk delivered into his hands on condition that he attempt nothing against the man’s life, and then commanded his son in his will to put him to death as soon as he himself was dead. Montaigne will not allow that death excused the broken faith.'),
('don-philip','Don Philip','Maximilian’s son and the Emperor Charles V’s father, who gave up the Duke of Suffolk to Henry VII on condition that his life be spared.'),
('charles-v','The Emperor Charles V','Don Philip’s son, named here to place his father more honourably.'),
('duke-of-suffolk','The Duke of Suffolk of the White Rose','Henry VII’s enemy, who had fled to the Low Countries and was handed over on a promise that his life would be spared.','Duke of Suffolk|Suffolk'),
('duke-of-alva','The Duke of Alva','Who staged the executions of the Counts Horn and Egmont at Brussels.'),
('count-egmont','Count Egmont','On whose word and faith Count Horn had surrendered himself to the Duke of Alva, and who begged to mount the scaffold first so that death might discharge him of the obligation. Montaigne’s verdict is that death did not acquit him and that he was already discharged without dying, since no man can be bound beyond what he is able to perform.','Egmont'),
('count-horn','Count Horn','Who surrendered himself to the Duke of Alva on Count Egmont’s security, and was executed with him at Brussels.','Horn'),
('herodotus','Herodotus','The Greek historian, the earliest of Montaigne’s sources for Egypt, Persia and the customs of distant nations.','Herodotus','supporting'),
]:add(*row)

# =========================================== CHAPTER 8 — of idleness
for row in [
('horace','Horace','The Latin poet of the Odes and the Art of Poetry, and the verse Montaigne quotes most often. The older edition abbreviates the citations to “Hor.”','Hor|Horace','supporting'),
('martial','Martial','The Latin epigrammatist.','Martial','supporting'),
]:add(*row)

# ============================================== CHAPTER 9 — of liars
for row in [
('pliny-elder','Pliny','Pliny the Elder of the Natural History, cited for the saying that a foreigner cannot supply us the place of a man. Not the younger Pliny of the letters.'),
('darius-i','Darius','The Persian king who kept a prompter for his injuries: so often as he sat down to dinner, a page was to say three times in his ear, “Sir, remember the Athenians.”'),
('francis-i','King Francis','Francis I of France, a prince, Montaigne says, of so delicate a nostril that he caught Francesco Taverna out in a single question, and who was still keeping a secret agent in Milan when Merveille was beheaded there.','','supporting'),
('francesco-taverna','Francesco Taverna','Ambassador of the Duke of Milan and famous in his day for his science in talking, sent to excuse his master over Merveille’s execution. Asked by King Francis why then the thing had been done at night and as it were by stealth, he answered that the Duke would have been loth, out of respect to his Majesty, to have it done by day — and was, Montaigne guesses, well rated for it when he got home.','Francesco Taverna|Taverna'),
('francesco-sforza','Francesco Sforza, Duke of Milan','Taverna’s master, who depended on the Emperor and could not own any dealing with France.','Francesco Sforza'),
('merveille','Merveille','The Milanese gentleman and equerry to King Francis, sent to Milan as an ambassador in all but name and beheaded in prison at night on a pretence of murder, once the Emperor had got wind of what he was really doing there.','Merveille'),
('julius-ii','Pope Julius II','Who sent an ambassador to the King of England to set him against King Francis — and whose ambassador argued himself out of his own errand by agreeing that the war would be hard to mount.','Julius II'),
]:add(*row)

# ================================ CHAPTER 10 — of quick or slow speech
for row in [
('la-brebis','La Brebis','The poet whose sonnet supplies the line that all graces were never yet given to any one man. The note gives no more than the name.','La Brebis'),
('clement-vii','Pope Clement','Who at the interview with King Francis at Marseilles sent word of the argument he thought suitable, and so wasted the harangue Poyet had been preparing since Paris.','Pope Clement'),
('poyet','Monsieur Poyet','A man bred all his life at the bar and in the highest repute for eloquence, who had his speech to the Pope ready made and carried from Paris — and, the subject being changed on the day, could not contrive another.','Poyet'),
('jean-du-bellay','Cardinal du Bellay','Who had to make the harangue to the Pope at Marseilles when Poyet could not. Not Martin du Bellay the memoirist, nor the poet.','','supporting'),
('severus-cassius','Severus Cassius','Who spoke best extempore and owed more to fortune than to diligence: it was an advantage to him to be interrupted, and his adversaries were afraid to nettle him for fear his anger should redouble his eloquence. He is also the intimate friend who, seeing Labienus’s books burned, cried out that they would have to burn him too, since he carried them by heart. The older edition prints his name both ways round, Severus Cassius at 10:4 and Cassius Severus at 65:39.','Severus Cassius|Cassius Severus'),
]:add(*row)


# ========================================= CHAPTER 11 — of prognostications
for row in [
('jesus-christ','Jesus Christ','Whose coming Montaigne uses to date the decay of the oracles, and whose thirty-three years he sets beside Alexander’s as the measure of a life that was long enough.','Jesus Christ','supporting','religious-figure'),
('pacuvius','Pacuvius','The early Latin tragedian, quoted through Cicero for the wisest word in the chapter: as for those who understand the language of birds, I had rather hear them than attend to them.','Pacuvius|Pacuvio'),
('francesco-saluzzo','Francesco, Marquis of Saluzzo','Lieutenant to Francis I in the army beyond the mountains, holding the marquisate by the king’s gift, with no provocation to turn and his own affection against it — and frightened into revolt, it was said, by the prognostics that everyone was spreading in Charles V’s favour. Montaigne notes that with towns and troops in his hands he could have done far more harm than he did.'),
('antonio-de-leyva','Antonio de Leyva','Whose army lay close by Saluzzo when he revolted.','Antonio de Leyva|Antonio de Leva'),
('tages','Tages','The demigod who rose out of a furrow with an infant’s face and an old man’s wisdom, and dictated the principles of Tuscan divination to the people who came running to look at him. Montaigne says the birth suits the art.','Tages','reference','mythological-figure'),
('diogenes-the-atheist','Diogenes the Atheist','Shown, in the temple at Samothrace, the offerings and painted stories of men saved from shipwreck by the gods’ especial favour, he answered that the pictures of those who were cast away are not here, and they are by much the greater number.'),
('xenophanes-colophon','Xenophanes of Colophon','The only philosopher who acknowledged a deity and still tried to root out divination altogether — as Cicero observes, and Montaigne with him.'),
('joachim-of-calabria','Joachim the Calabrian Abbot','Whose book, Montaigne says he would have given anything to see, foretold all the future popes with their names and qualities.','Joachim'),
('leo-the-emperor','The Emperor Leo','Whose book prophesied all the emperors and patriarchs of Greece. Not Pope Leo X.','Emperor Leo'),
]:add(*row)

# =============================================== CHAPTER 12 — of constancy
for row in [
('laches','Laches','Who defined fortitude in Plato as standing firm in the ranks, and was laughed out of it by Socrates: would it be cowardice, then, to beat the enemy by giving ground?','Laches','reference','literary-figure'),
('homer','Homer','The poet Montaigne names among the three most excellent men the world has produced, and cites here for commending in Aeneas the science of flight.','Homer','major'),
('aeneas','Aeneas','Whose science of flight Homer commends — Socrates’s authority against Laches.','AEneas|Aeneas','reference','mythological-figure'),
('idanthyrses','Idanthyrses','The Scythian king who told Darius that he did not retire out of fear but because his nation had neither fields nor cities to lose, and that if Darius wanted a battle he had only to come and look at their ancient places of sepulture.','Idanthyrses'),
('guast','The Marquis de Guast','Who went to reconnoitre Arles from behind a windmill and was spotted; the culverin was so exactly levelled at him that only his seeing the fire given and slipping aside saved him.','Guast|Guasto'),
('bonneval','The Seigneur de Bonneval','Who with the Seneschal of Agenois saw Guast from the theatre and pointed him out.','Bonneval'),
('villiers','The Sieur de Villiers','Commissary of the artillery, who levelled the culverin at Guast.','Villiers'),
('lorenzo-de-medici-urbino','Lorenzo de’ Medici, Duke of Urbino','The queen-mother’s father, who at the siege of Mondolfo saw the cannoneer give fire at him and ducked, and was only grazed on the top of the head.',"Lorenzo de’ Medici|Lorenzo de' Medici"),
('virgil','Virgil','The Latin poet of the Aeneid, the Georgics and the Eclogues. The citations run under the poem’s name as often as his own, spelled AEneid in the older edition and Aeneid in the modern.','Virgil','major'),
]:add(*row)

# ============================== CHAPTER 13 — the interview of princes
for row in [
('margaret-of-navarre','Queen Margaret of Navarre','Who held that a gentleman is rude to go out and meet a visitor, and that it is more civil to stay at home and receive him at the door.','Margaret of Navarre'),
]:add(*row)

# ================================= CHAPTER 14 — obstinate defence of a fort
for row in [
('montmorency','The Constable Monsieur de Montmorenci','General of the army at Dreux, where he was racked through and through with the enemy’s artillery, his battalion routed and himself taken prisoner, while the Duc de Guise halted with the forces he commanded; and who at the siege of Pavia hanged every man in the tower that had held up his crossing of the Ticino, and later trussed up the governor and ensign of the Castle of Villano for the same reason — the custom Montaigne is explaining, that a place not tenable by the rules of war may be defended only at the defenders’ own risk.','Montmorenci|Montmorency'),
]:add(*row)

# ============================ CHAPTER 15 — the punishment of cowardice
for row in [
('vervins','Monsieur de Vervins','Sentenced to death for surrendering Boulogne to the English — the case that prompted a great captain to maintain, at table, that no soldier can justly be put to death for want of courage.','Vervins'),
('charondas','Charondas','The legislator who, Montaigne says, brought in ignominy instead of death for cowardice: before him Greek law killed the man who fled a battle, and he ordained instead that he be exposed three days in public in woman’s clothes, in hope of getting some service out of him afterwards.','Charondas'),
('tertullian','Tertullian','Quoted from the Apologetics for the maxim behind Charondas’s law: rather bring the blood into a man’s cheek than let it out of his body.','Tertullian'),
('ammianus-marcellinus','Ammianus Marcellinus','The historian, who says the Emperor Julian had ten soldiers that turned their backs against the Parthians first degraded and then put to death, and who observes the manner of the Parthians’ arming so curiously because it was so different from the Roman. Not the Tullius Marcellinus of chapter 70.','Ammianus Marcellinus','supporting'),
('julian','The Emperor Julian','Who put ten of his own soldiers to death for flight according to the ancient laws, and elsewhere, for the same offence, only sent men to live among the prisoners under the baggage ensign. Applauded one day by his courtiers for his exact justice, he said he should be proud of the praise if it came from persons that durst condemn or disapprove the contrary in case he did it.','Emperor Julian'),
('cnaeus-fulvius','Cnaeus Fulvius','Whose men ran away at his defeat and were punished, like those who fled at Cannae, with something short of death. The older edition prints him Aeneius Fulvius.','Aeneius Fulvius|Cnaeus Fulvius'),
('frauget','The Seigneur de Frauget','Lieutenant to the Mareschal de Chatillon’s company and put in command of Fuentarabia, who surrendered it to the Spaniard and was degraded from all nobility — himself and his posterity declared ignoble, taxable and for ever incapable of bearing arms, a sentence executed at Lyons.','Frauget|Franget'),
('chatillon','The Mareschal de Chatillon','Whose company Frauget was lieutenant of.','Chatillon|Châtillon'),
('chabannes','The Mareschal de Chabannes','Who put Frauget into Fuentarabia in place of Monsieur de Lude.','Chabannes'),
('lude','Monsieur de Lude','Whom Frauget replaced at Fuentarabia.','Lude'),
('nassau-guise','The Count of Nassau','Who entered Guise, after which all the gentlemen who had been in the town were degraded like Frauget. The Essays do not say whether he is the Count of Nassau who besieged Mousson.'),
]:add(*row)

# ========================= CHAPTER 16 — a proceeding of some ambassadors
for row in [
('propertius','Propertius','The Latin elegiac poet. The older edition prints him Propertious in one citation and Propertius in another.','Propertius|Propertious'),
('archidamus','Archidamus','The Spartan king who told Periander that he had given up the glory of being an excellent physician to gain the repute of a very bad poet — and who was a little surprised, Montaigne fancies, at Thucydides’s answer when he asked which was the better wrestler, Pericles or himself: that it was hard to affirm, for when he had thrown him Pericles always persuaded the spectators he had had no fall, and carried away the prize.','Archidamus'),
('periander','Periander','Who left an excellent physician’s reputation for a bad poet’s. The older edition prints him Pertander.','Pertander|Periander'),
('julius-caesar','Caesar','Julius Caesar, whose Commentaries Montaigne reads as a soldier’s book with a vanity in it: large and ample about his bridges and engines, succinct and reserved about his own valour and generalship, because the generalship was not in doubt and the engineering was.','Julius Caesar','major'),
('langey','Monsieur de Langey','The historian of the French wars whose account of Charles V’s speech in the Consistory at Rome Montaigne dwells on, because the ambassadors who heard it sent home a despatch with the worst of it left out.','Langey'),
('macon','The Bishop of Macon','One of the two French ambassadors present at Charles V’s speech in the Consistory.','Bishop of Macon'),
('velly','Monsieur du Velly','The other French ambassador present, and with the Bishop of Macon the one who concealed the greatest part of what the Emperor said.','Velly'),
('publius-crassus','P. Crassus','Whom the Romans reputed five times happy. Consul in Asia, he sent a Greek engineer for the greater of two ships’ masts, and had the man whipped for bringing the lesser — which was, by the rules of art, the fitter of the two. Montaigne sets discipline against the work in hand and then, at the end of the chapter, wonders whether Crassus had not invited the man’s judgment after all.','P. Crassus|Publius Crassus'),
]:add(*row)


# ==================================================== CHAPTER 17 — of fear
for row in [
('bourbon','Monsieur de Bourbon','Who took Rome — the sack in which an ensign on guard at Borgo San Pietro ran three hundred paces the wrong way in a fright, colours on his shoulder, and had to run back through the same breach.','','supporting'),
('giulio','Captain Giulio','Whose ensign threw himself, colours and all, out of a porthole when St Paul was taken, and was cut to pieces for it.','Captain Giulio'),
('bures','The Comte de Bures','Who with Monsieur de Reu took St Paul from the French.','Bures'),
('reu','Monsieur de Reu','Who with the Comte de Bures took St Paul.','Reu'),
('germanicus','Germanicus','In one of whose encounters with the Germans two great parties were so amazed with fear that each ran to the place the other had fled from.','Germanicus'),
('theophilus','The Emperor Theophilus','Who lost a battle to the Agarenes and was so stupefied that he had no power to fly, until Manuel shook him out of it with an offer to kill him.','Theophilus'),
('manuel','Manuel','One of Theophilus’s principal commanders, who told his stupefied emperor that it was better to lose his life than, by being taken, to lose his empire.','Manuel'),
('quintus-curtius','Quintus Curtius','The historian of Alexander, quoted for the line that fear dreads even the means of safety. The older edition abbreviates him Quint. Curt.','Quint. Curt|Quintus Curtius'),
('hannibal','Hannibal','The Carthaginian general, in the first pitched battle against whom ten thousand Roman foot took fright, saw no other escape for their cowardice, and charged straight through the enemy’s great battalion — buying an ignominious flight at the price a glorious victory would have cost.','Hannibal','supporting'),
('sempronius','The Consul Sempronius','The consul commanding in the first pitched battle the Romans lost against Hannibal, where ten thousand foot took fright and, seeing no other escape for their cowardice, threw themselves headlong on the enemy’s great battalion and routed it with great slaughter.','Sempronius'),
]:add(*row)

# ============ CHAPTER 18 — not to judge of our happiness till after death
for row in [
('croesus','Croesus','The King of Lydia, taken by Cyrus and led out to execution crying “O Solon, Solon!” — because he had found what Solon told him true to his cost: that no man can be called happy until he has been seen to pass over the last day of his life. Marching his army through the waste lands near Sardis he met an infinite number of serpents, which his horses devoured with great appetite; Herodotus calls it a prodigy of ominous portent to his affairs.','Croesus','supporting'),
('priam','Priam','The King of Troy, and Agesilaus’s answer to the man who called the young King of Persia happy: neither was Priam unhappy at his years.','Priam','reference','mythological-figure'),
('ludovico-sforza','Ludovico Sforza, the tenth Duke of Milan','Whom all Italy had truckled under, and who died a prisoner at Loches — but not till he had lived ten years in captivity, which Montaigne calls the worst part of his fortune. Not Francesco Sforza.','Ludovico Sforza'),
('laberius','Laberius','The Roman playwright whose line Montaigne gives to Fortune’s victims: I have lived longer by this one day than I should have done.','Laberius'),
('macrobius','Macrobius','The late Latin compiler, cited for Laberius’s line.','Macrobius'),
('metellus-scipio','Scipio','Pompey’s father-in-law, who by the manner of his dying removed the ill opinion everyone had held of him until then.'),
('iphicrates','Iphicrates','One of the three captains Epaminondas was asked to rank — himself, Chabrias and Iphicrates. “You must first see us die,” he said.','Iphicrates'),
]:add(*row)

# ================= CHAPTER 19 — to study philosophy is to learn to die
for row in [
('xenophilus','Xenophilus','The musician who lived a hundred and six years in perfect and continual health — Montaigne’s example that poverty and sickness can be escaped, and death cannot.','Xenophilus'),
('tantalus','Tantalus','Over whom the stone hangs for ever, in Cicero’s figure for death.','Tantalus','reference','mythological-figure'),
('claudianus','Claudianus','The late Latin poet, quoted for the condemned man who measures his life by the length of the road to the place of execution.','Claudianus'),
('methuselah','Methuselah','Whose years are the reason, Montaigne says, that no man is so old and decrepit that he does not think he has twenty good ones left.','Methuselah','reference','religious-figure'),
('aeschylus','Aeschylus','Who took care to avoid the house that was threatening to fall on him, and was killed by a tortoise dropped out of an eagle’s talons.','AEschylus|Aeschylus'),
('aemilius-lepidus-threshold','Aemilius Lepidus','Who died of a stumble at his own threshold. Not the Marcus Aemilius Lepidus who forbade his heirs to pay for his hearse.','AEmilius Lepidus|Aemilius Lepidus'),
('aufidius','Aufidius','Who died of a jostle against the door as he entered the council-chamber.','Aufidius'),
('cornelius-gallus','Cornelius Gallus','The proctor, one of the men Montaigne lists as having died between the thighs of women.','Cornelius Gallus'),
('tigillinus','Tigillinus','Captain of the watch at Rome, and one of the men Montaigne lists as having died between the thighs of women.','Tigillinus'),
('ludovico-gonzaga','Ludovico','Guido di Gonzaga’s son, one of the men Montaigne lists as having died between the thighs of women.'),
('guido-di-gonzaga','Guido di Gonzaga, Marquis of Mantua','Whose son Ludovico is one of the men Montaigne lists as having died between the thighs of women.','Guido di Gonzaga'),
('speusippus','Speusippus','A Platonic philosopher, and of worse example, Montaigne says, than the rest of that list — and whom Diogenes met so blown up with an inveterate dropsy that he had to be carried, and who, weary of so languishing a state of life, not long after found a means to die.','Speusippus'),
('bebius','Bebius','The judge who gave a case eight days’ adjournment and was himself condemned by death within them, his own stay of life expiring first.','Bebius'),
('caius-julius','Caius Julius','The physician whose own eyes death closed while he was anointing a patient’s.','Caius Julius'),
('captain-st-martin','Captain St. Martin','Montaigne’s brother, twenty-three years old and already proved in the field, who took a tennis ball a little above the right ear, felt no wound, did not even sit down — and died of an apoplexy five or six hours later.','Captain St. Martin'),
('paulus-aemilius','Paulus Aemilius','The Roman who conquered Macedon, and who answered the prisoner king’s request not to be led in the triumph with: let him make that request to himself.','Paulus Emilius|Paulus Aemilius|Paulus AEmilius|Paulus Æmilius'),
('lycurgus','Lycurgus','The Spartan lawgiver, cited for putting the burying-places among the churches and the busiest parts of the city, so that the sight of bones and funerals should keep people in mind of their frail condition.','Lycurgus|Lucurgus','supporting'),
('silius-italicus','Silius Italicus','The Latin epic poet, quoted for the old custom of enlivening a banquet with men killing each other over the cups.','Silius Italicus'),
('dicaearchus','Dicaearchus','Who compiled a register of the deaths of men — the book Montaigne says he would write himself, except that Dicaearchus meant it for a less profitable end. The older edition prints him Dicarchus.','Dicarchus|Dicaearchus|Dicæarchus'),
('maximian','Maximian','The late Latin elegist, quoted for the line: alas, to old men what portion of life remains.','Maximian'),
('jove','Jupiter','Whose strong thundering hand, in Horace’s ode, does not move a well-settled soul — and who, in the story Montaigne says Plato borrowed from some lascivious poet, had not the patience to reach the couch and forgot in the pleasure of it the resolutions he had just taken with the rest of the gods.','Jove|Jupiter','supporting','deity'),
('manilius','Manilius','The Latin poet of the Astronomica, quoted twice in Nature’s speech: as we are born we die, and your grandsires saw no other thing than you.','Manilius'),
('thales','Thales','The most eminent of the sages, whom Nature taught that living and dying were indifferent — which is why, asked why then he did not die, he answered: because it is indifferent.','Thales'),
('chiron','Chiron','Who refused to be immortal once his father Saturn, the god of time and its duration, had told him the conditions.','Chiron','reference','mythological-figure'),
('saturn','Saturn','The god of time and its duration, and Chiron’s father, who told him what immortality would cost.','Saturn','reference','deity'),
]:add(*row)

# ============================== CHAPTER 20 — of the force of imagination
for row in [
('simon-thomas','Simon Thomas','A great physician of his time, who prescribed Montaigne’s company to a rich old man with weak lungs — that the sight of a fresh complexion and the imagination of a young man’s vigour might mend his habit of body. He forgot to add, Montaigne says, that it might make the young man’s worse.','Simon Thomas'),
('gallus-vibius','Gallus Vibius','Who bent his mind so hard on finding out the essence and motions of madness that he went out of his wits and never recovered his judgment — and might brag, Montaigne says, of having become a fool by too much wisdom.','Gallus Vibius'),
('cippus','Cippus, King of Italy','Who watched a bullfight with delight, dreamed all night that he had horns on his head, and by the force of imagination grew them.','Cippus'),
('antiochus','Antiochus','Who fell into a fever, inflamed with the beauty of Stratonice too deeply imprinted in his soul.'),
('stratonice','Stratonice','Whose beauty gave Antiochus his fever.'),
('lucius-cossitius','Lucius Cossitius','Whom Pliny claims to have seen turned from a woman into a man on her wedding day.','Lucius Cossitius'),
('pontanus','Pontanus','Who reports a girl turning into a boy in Italy in more recent times, as Pliny reports of Lucius Cossitius.','Pontanus'),
('iphis','Iphis','The boy who paid the vow a girl had made, in the line Montaigne quotes for such changes.','Iphis','reference','mythological-figure'),
('mary-germain','Mary Germain','The man the Bishop of Soissons confirmed as Germain, whom the whole town had known as a girl called Mary until she was twenty-two. Montaigne saw him at Vitry le François, full of beard, old and unmarried; he said his male organs came out when he strained himself in a leap, and the girls of the place still have a song warning each other against taking too great strides.','Mary Germain|Germain'),
('dagobert','King Dagobert','Whose scars, with St Francis’s, some attribute to the force of imagination.','Dagobert'),
('st-francis','St Francis','Whose stigmata, with King Dagobert’s scars, some attribute to imagination.','St. Francis|St Francis','reference','religious-figure'),
('celsus','Celsus','Who tells of a priest whose soul would be ravished into an ecstasy that left his body a long while without sense or breath.','Celsus'),
('st-augustine','St Augustine','The Father Montaigne cites more than any other, here for the man who fell into a swoon at any doleful cry and could be pinched or burned without feeling it, and for the man who could command his rear at will.','St. Augustine|St. Augustin|St Augustine|St Augustin|Saint Augustine|St. Austin','supporting','religious-figure'),
('jacques-pelletier','Jacques Pelletier','Who lived in Montaigne’s house and gave him the graven gold plate against sunstroke that Montaigne then used, with some private instructions and his own nightgown, to cure a bridegroom of an imagined impotence.','Jaques Pelletier|Jacques Pelletier'),
('amasis','Amasis, King of Egypt','Who married the beautiful Greek Laodice, found himself quite another man with her, threatened to kill her for a witch — and after vows to Venus was divinely restored the first night after his sacrifices.','Amasis'),
('laodice','Laodice','The Greek virgin Amasis married and at first could not enjoy.','Laodice'),
('venus','Venus','The goddess to whom Amasis made his vows, and was restored — and in whose avenues, Montaigne says in the chapter on education, the gods have planted more toil and sweat than in Minerva’s.','Venus','reference','deity'),
('pythagoras','Pythagoras','The philosopher, cited here for his daughter-in-law’s saying that a woman must put off her modesty with her petticoat and put it on again with the same.','Pythagoras|Pytagoras','supporting'),
('vives','Vives','St Augustine’s commentator, who fortified his master’s example of the man who could command his rear with another, of a man who could break wind in tune.','Vives'),
('charles-iv','Charles, the Emperor and King of Bohemia','To whom a girl from near Pisa was presented, rough and covered with hair all over — conceived so, her mother said, because a picture of St John the Baptist hung inside her bed-curtains.'),
('john-the-baptist','St John the Baptist','Whose picture, hanging in the bed-curtains, the mother blamed for her hairy daughter.','St. John the Baptist|St John the Baptist','reference','religious-figure'),
('jacob','Jacob','Whose sheep are Montaigne’s scriptural instance that a mother’s fancy marks what she carries.','Jacob','reference','religious-figure'),
('sallust','Sallust','The Roman historian, whose glory Montaigne says he would not take the trouble to earn.','Sallust'),
]:add(*row)


# ============================ CHAPTER 21 — one man's profit, another's damage
for row in [
('demades','Demades the Athenian','Who condemned a fellow citizen for selling funeral necessaries at an unreasonable profit, on the ground that the profit could only come by the death of a great many people. Montaigne thinks the judgment ill grounded, since no gain whatever is made but at somebody’s expense.','Demades'),
]:add(*row)

# ================================================ CHAPTER 22 — of custom
for row in [
('albertus','Albertus','Who reports the maid that lived upon spiders — one of Montaigne’s instances that custom can carry the stomach anywhere.','Albertus'),
('pindar','Pindar','The Greek lyric poet, who calls custom the ruler of the world.','Pindar'),
('isocrates','Isocrates','The Athenian rhetorician, who counselled his king to make his subjects’ trade free and their lawsuits expensive, and who says that defect is nearer allied to moderation than excess.','Isocrates'),
('charlemagne','Charlemagne','Whom a Gascon gentleman, Montaigne’s countryman, was the first to oppose when he tried to impose Latin and imperial law on France — a thing Montaigne says he is obliged to fortune for.','Charlemagne'),
('phrynis','Phrynis','The musician who added two strings to his instrument, and whose strings an ephor cut without stopping to ask whether they made better harmony: it was enough that they were new.','Phrynis'),
('thyestes','Thyestes','One of the three fables — with Oedipus and Macareus — by which, Montaigne says following Plato, the poets put a wholesome horror of incest into children’s heads.','Thyestes','reference','mythological-figure'),
('oedipus','Oedipus','One of the same three fables. The older edition prints him OEdipus, and Seneca’s play under the same spelling.','OEdipus|Oedipus','reference','mythological-figure'),
('macareus','Macareus','With Thyestes and Oedipus, one of the three whose fables the poets have sung to children, and so infused into their tender brains the belief that makes incest horrible.','Macareus','reference','mythological-figure'),
('cotta','Cotta','The speaker in Cicero whose rule Montaigne adopts: in a question of religion, follow the high priests and not the philosophers.','Cotta','reference','literary-figure'),
('coruncanius','T. Coruncanius','One of the three high priests Cotta says he follows rather than the Stoics.','Coruncanius'),
('publius-scipio-pontifex','P. Scipio','Another of the three high priests in Cotta’s list. Not Scipio Africanus, nor Pompey’s father-in-law.'),
('scaevola','P. Scaevola','The third of the three high priests. Not the Scaevola who slipped into Porsenna’s camp.'),
('zeno-of-citium','Zeno','The founder of the Stoa, and one of the three philosophers Cotta refuses to follow in a question of religion. Not the Zeno of Messina who took his city’s fault on himself.'),
('cleanthes','Cleanthes','Zeno’s successor at the head of the Stoa, and the second of Cotta’s three philosophers.','Cleanthes'),
('thucydides','Thucydides','The historian of the Peloponnesian war, cited for what happens to language in a civil war: the parties give the public vices new and more plausible names to excuse them. It is he who told Archidamus that when he had thrown Pericles the man always persuaded the spectators he had had no fall.','Thucydides','supporting'),
('terence','Terence','The Latin comic poet. The older edition abbreviates him Ter.','Ter|Terence'),
('octavius','Octavius','Who with Cato is still reproached for having let his country go to the last extremity rather than relieve his fellow citizens at the expense of its laws.','Octavius'),
('cato-the-younger','Cato','Cato of Utica, who would rather see the Republic ruined than saved by an innovation. Montaigne devotes a whole chapter to him later.'),
('aratus','Aratus','Made admiral of Sparta in name, because an edict forbade choosing the same man twice — while Lysander went out as general of the navy and commanded in fact.','Aratus'),
('pericles','Pericles','The Athenian, who told a Spartan envoy that a law once engrossed on the tablet could not be taken away — and was advised to turn the tablet round instead, that being not forbidden. Montaigne’s instance of what rhetoric is for: thrown in the wrestling, he could still persuade the spectators he had had no fall and carry away the prize.','Pericles','supporting'),
('philopoemen','Philopoemen','Whom Plutarch commends for knowing how to command not only according to the laws but over them, when the public necessity required it. Against Machanidas he let his own archers and slingers be chased and cut in pieces before his face rather than leave his post, and charged the enemy’s foot only once their horse had gone off in the pursuit — the case Montaigne sets beside the Duc de Guise’s at Dreux; and he is one of the captains who held that rich accoutrement inflames a soldier’s courage. The older edition misprints his name Philopcemen in that second place.','Philopoemen|Philopcemen'),
('apollo','Apollo','The god of the Delphic oracle, who told the people of Delphos, afraid of the Persians, to stir nothing of his treasure and to look to themselves — he was sufficient to look after what was his.','Apollo','supporting','deity'),
]:add(*row)

# ==================================== CHAPTER 23 — various events, same counsel
for row in [
('jacques-amyot','Jacques Amyot','Grand almoner of France, who told Montaigne the story of the prince who forgave the gentleman sent to murder him at the siege of Rouen. The older edition spells him Amiot.','Jacques Amiot|Jacques Amyot'),
('l-cinna','L. Cinna','Pompey’s nephew, of an illustrious family, who conspired to kill Augustus at sacrifice — and was told the whole plot back to his face, place, day and company, and then given his life a second time. He was made consul afterwards, was Augustus’s great friend, and left him his whole estate.','Cinna'),
('livia','Livia','Augustus’s wife, who asked whether he would take a woman’s counsel and then gave the advice that ended the conspiracies: severity has got you nothing — Lepidus followed Salvidienus, Murena Lepidus, Caepio Murena, Egnatius Caepio — now try clemency.','','supporting'),
('lepidus-conspirator','Lepidus','One of the conspirators in Livia’s list, punished before Cinna and followed by another. Neither the Marcus Aemilius Lepidus of 3:15 nor the Aemilius Lepidus who died of a stumble.'),
('salvidienus','Salvidienus','The first name in Livia’s list of conspirators punished to no purpose.','Salvidienus'),
('murena','Murena','The third name in Livia’s list of the conspirators severity had not stopped, after Salvidienus and Lepidus and before Caepio and Egnatius.','Murena'),
('caepio','Caepio','The fourth name in Livia’s list of the conspirators severity had not stopped: Lepidus had followed Salvidienus, Murena Lepidus, Caepio Murena, and Egnatius Caepio.','Caepio'),
('egnatius','Egnatius','The last name in Livia’s list of the conspirators severity had not stopped, and so her proof to Augustus that clemency was worth trying instead.','Egnatius'),
('paulli','The Paulli','One of the great Roman houses Augustus names to Cinna as men who would never endure him. The older edition prints the family in the singular, Paulus, and the modern in the plural.','Paulli','reference','group'),
('fabii','The Fabii','One of the great Roman houses Augustus names to Cinna as men who would never endure him. The older edition prints the name Fabius, the modern Fabii.','Fabius|Fabii','reference','group'),
('cossii','The Cossii','One of the great Roman houses Augustus names to Cinna as men who would never endure him.','Cossii','reference','group'),
('servilii','The Servilii','The last of the four houses in Augustus’s list.','Servilii','reference','group'),
('dion','Dion','Warned that Callippus was watching for a chance to kill him, he would not inquire any further into it: he had rather die than live having to stand guard against his friends as well as his enemies.','Dion'),
('callippus','Callippus','Who watched for the chance to kill Dion.','Callippus'),
('parmenio','Parmenio','Whose letter warned Alexander that his physician Philip had been bribed by Darius to poison him; and who, on the morning of the furious battle against Darius, was forced to enter the sleeping king’s chamber and call him several times by name, the time to go and fight compelling him to it.','Parmenio'),
('philip-physician','Philip','Alexander’s most beloved physician, accused by Parmenio of taking Darius’s money to poison him — to whom Alexander handed the letter to read and then drank the potion he had brought. Montaigne knows nothing else in that life with so much firm courage in it.'),
('scipio-africanus','Scipio','Who to sound Syphax’s intentions left his army and his unsettled conquest in Spain and crossed to Africa in two small ships, into an enemy country and a barbarian king’s power, with no hostage and no security but his own courage.'),
('syphax','Syphax','The African king whose intentions Scipio crossed the sea in two ships to sound.','Syphax'),
('duke-of-athens','The Duke of Athens','Who did a great many foolish things in setting up his tyranny over Florence, and this the most notable: told of the conspiracy by one of the conspirators, he put the informer to death at once, so that nobody should think the city disliked his government.','Duke of Athens'),
('matteo-di-morozzo','Matteo di Morozzo','The conspirator who brought the Duke of Athens the first news of the plot, and was executed for it.','Matteo di Morozzo'),
]:add(*row)


# ============================================== CHAPTER 24 — of pedantry
for row in [
('joachim-du-bellay','Du Bellay','Joachim du Bellay the poet, whom Montaigne calls our famous poet and quotes for the line that of all things he hates pedantic learning. Not Martin the memoirist, nor the cardinal.'),
('ulysses','Ulysses','Whose miseries the grammarians inquire into, Dionysius said, while they know nothing of their own.','Ulysses','supporting','mythological-figure'),
('rabelais','Rabelais','In whose Gargantua Montaigne found the proverb that the greatest clerks are not the wisest men, and whom he reckons with the Decameron and the Basia of Johannes Secundus among the books worth reading for amusement.','Rabelais'),
('aulus-gellius','Aulus Gellius','The compiler of the Attic Nights, through whom Pacuvius’s line about men who jabber philosophy and do nothing reaches the Essays. The older edition prints the citation in the accusative, Gellium.','Gellium|Gellius'),
('hercules','Hercules','From whom, the philosophers say, you might be the fiftieth descendant and still have nothing but a gift of fortune to boast of.','Hercules','reference','mythological-figure'),
('crates','Crates','Asked how long it was necessary to philosophise, he answered: till our armies are no more commanded by fools. He is also named to place his brother Pasicles, the philosopher who laid his hand in the wrong place in petitioning a great man.','Crates'),
('heraclitus','Heraclitus','Who resigned the royalty to his brother, and told the Ephesians who reproached him with playing with children before the temple that it was better than sitting at the helm of affairs in their company. Commiserating the human condition, he appeared always with a sorrowful look and tears in his eyes, where Democritus found the same condition ridiculous and never appeared abroad but laughing. Montaigne is clearly for the laughing humour — not because laughing is pleasanter, but because it expresses the more contempt.','Heraclitus','supporting'),
('empedocles','Empedocles','Who refused the royalty the Agrigentines offered him, and who observed the discrepancy in them of giving themselves up to delights as if every day were their last and building as if they were to live for ever.','Empedocles','supporting'),
('anaxagoras','Anaxagoras','One of the philosophers Aristotle reports were called wise but not prudent, for not applying their study to more profitable things.','Anaxagoras','supporting'),
('lucullus','Lucullus','Whom letters alone, without any experience, made so great a captain — and who did not learn it, Montaigne says, in the perfunctory way we learn.','Lucullus','supporting'),
('euripides','Euripides','The tragedian, quoted through Cicero for the line that he hates the wise man who is not wise in his own concern.','Euripides','supporting'),
('juvenal','Juvenal','The Latin satirist.','Juvenal','supporting'),
('persius','Persius','The Latin satirist of the crabbed style.','Persius','supporting'),
('protagoras','Protagoras','The sophist who let his pupils either pay his demand or swear in the temple what they thought the teaching had been worth — a rule under which, Montaigne says, his own pedagogues would be sorely gravelled.','Protagoras|Proctagoras','supporting'),
('galen','Galen','The physician the pedants know thoroughly, Montaigne says, and the patient’s disease not at all.','Galen','supporting'),
('adrian-turnebus','Adrian Turnebus','The one man of pure learning Montaigne exempts from the charge of pedantry, and in his opinion the greatest of the last thousand years: nothing of the pedant about him but the gown, and within, not a more polished soul upon earth. Montaigne says he put him on arguments far outside his profession and found him as quick as if he had spent his life in arms or affairs of state.','Adrian Turnebus|Turnebus|Turnèbe','supporting'),
('prometheus','Prometheus','The Titan of Juvenal’s line, who framed the great natures of better clay.','Prometheus','reference','mythological-figure'),
('stobaeus','Stobaeus','The anthologist through whom the Greek verse about learning without understanding reaches the Essays.','Stobaeus'),
('francis-brittany','Francis, Duke of Brittany','John V’s son, who was told that Isabella of Scotland was homely bred and without learning, and answered that he liked her the better: a woman is wise enough if she can tell her husband’s shirt from his doublet.'),
('john-v-brittany','John V','Duke of Brittany and father of the Francis who said he liked his bride the better for having been homely bred and without any manner of learning.','John V'),
('isabella-of-scotland','Isabella of Scotland','Whose want of learning recommended her to Francis of Brittany.','Isabella'),
('aristo-of-chios','Aristo of Chios','The Stoic who said that philosophers did their hearers harm, because most of them were incapable of turning the instruction to good and would certainly turn it to ill. Not the Aristo who is a tragedian at 25:152, nor the Ariosto the older edition spells Aristo at 27:13.','Aristo of Chios'),
('aristippus','Aristippus','The founder of the Cyrenaic school, out of whose school, Cicero says, came effeminate debauchees as cynics came out of Zeno’s.','Aristippus','supporting'),
('astyages','Astyages','Cyrus’s grandfather in Xenophon, who asked him for an account of his last lesson and got the story of the two cassocks and the whipping.','Astyages'),
('mandane','Mandane','Cyrus’s mother, who in Cotton’s version of the story asks him how he would learn justice among the Medes with all his masters left behind in Persia.','Mandane'),
('antipater','Antipater','Who demanded fifty children of the Spartans for hostages and was told they would rather give him twice as many grown men, so much did they value the loss of their country’s education — and who, threatening them severely to bring them to a certain demand, was answered that if he threatened them with more than death they would die the more willingly.','Antipater'),
('hippias-sophist','Hippias','The sophist Socrates rallies for having made a great deal of money teaching school in the villages of Sicily and never a penny at Sparta — where, Socrates says, they are so stupid as to make no account of grammar or poetry and study only the genealogies of their kings and the rise and fall of states.'),
('tamerlane','Tamerlane','One of Montaigne’s proofs that the most warlike nations are the most rude and ignorant, and the man who overthrew Bajazet in the furious battle after which Bajazet nearly escaped on an Arabian mare.','Tamerlane','supporting'),
('charles-viii','King Charles VIII','Who saw himself possessed of Naples and a good part of Tuscany almost without striking a blow — which the nobles about him put down to the princes of Italy having studied to be ingenious and learned rather than vigorous and warlike.','Charles VIII'),
]:add(*row)


# ============================ CHAPTER 25 — of the education of children
for row in [
('diane-de-foix','Madame Diane de Foix, Comtesse de Gurson','The chapter’s dedicatee, expecting a child. Montaigne had a hand in making her marriage and writes her his one particular fancy about how the boy should be brought up. The dedication prints her name in capitals.','DIANE DE FOIX|Diane de Foix'),
('danaides','The Danaides','Who eternally fill and whose vessels eternally run out — Montaigne’s figure for his own reading of Plutarch and Seneca. The modern edition spells them Danaids.','Danaides|Danaids','reference','mythological-figure'),
('apollodorus','Apollodorus','Who said that if a man picked out of Chrysippus’s writings everything that was none of his, he would leave him nothing but blank paper. Not the Apollodorus whose heart spoke to him in the dream of being flayed and boiled.'),
('capilupus','Capilupus','A composer of centos Montaigne knew of, and one of the writers he exempts from the charge of stitching other men’s work into their own under their own name — because such men declare themselves for what they are.','Capilupus'),
('lipsius','Lipsius','Whose Politics Montaigne calls a learned and laborious contexture, and another honest example of the same declared borrowing.','Lipsius'),
('cimon','Cimon','With Themistocles, one of the thousand men who very much deceived the expectation others had of them — Montaigne’s warning against reading a child’s promise too early. It is he who besieged Boges in Eion and offered him a safe return into Asia with all his wealth.','Cimon'),
('themistocles','Themistocles','With Cimon, one of the men Montaigne names as having very much deceived the expectation others had formed of them as children — a warning against reading the promises of that tender age.','Themistocles','supporting'),
('candale','Monsieur de Candale','Diane de Foix’s uncle, who every day obliges the world with writings of his own.','Candale'),
('arcesilaus','Arcesilaus','Who, like Socrates before him, made his scholars speak first and then spoke to them — and whom pure wine despatched as it did Stilpo, though in his case not by design. The older edition prints him Arcesilas in the Apology.','Arcesilaus|Arcesilas','supporting'),
('dante','Dante','Quoted for the line Montaigne makes his pupil’s rule: I love to doubt as well as to know.','Dante'),
('epicharmus','Epicharmus','Who said it is the understanding that sees and hears, the understanding that orders and rules everything, and that all the other faculties are blind and deaf and without soul.','Epicharmus|Epichar-mus'),
('paluel','Paluel','One of the two noted dancers of Montaigne’s time who could not teach a man to cut capers by being watched — his figure for the pedants who mean to inform the understanding without setting it to work.','Paluel'),
('pompey-the-dancer','Pompey','The other of the two noted dancers. Not Pompey the Great.'),
('signora-livia','Signora Livia','Whose petticoats are one of the things Montaigne says a young traveller ought not to come home able to describe. Not the Livia who was Augustus’s wife.'),
('marcellus','Marcellus','Whose death, Montaigne says, the pupil should be taught to judge rather than to locate: not so much where he died as why it was unworthy of his duty that he died there.','Marcellus'),
('la-boetie','La Boetie','Étienne de La Boétie, Montaigne’s friend, whose “Voluntary Servitude” may have been prompted by a single sentence of Plutarch’s — that the people of Asia became the vassals of one man for not having been able to pronounce a single syllable, which is No. The modern edition spells him La Boétie.','Estienne de la Boetie|Estienne de la Boétie|Etienne De la Boetie|Etienne de la Boétie|La Boetie|La Boétie','major'),
('alexandridas','Alexandridas','Who reproached a man for making very good but too long speeches to the Ephori: thou speakest the things thou shouldst speak, but not as thou shouldst speak them. The Essays do not identify him with the Anexandridas who was Cleomenes’s father, and spell the two names differently.','Alexandridas'),
('anaximenes','Anaximenes','Who asked Pythagoras what purpose there was in searching out the secrets of the stars with death or slavery continually before his eyes — the kings of Persia being at that moment preparing to invade his country; and who held that the air was God, procreate and immense, always moving. The older edition spells him Anaximines in the Apology.','Anaximenes|Anaximines'),
('theodorus-gaza','Gaza','The grammarian whose method Montaigne sets against his own: precepts so intricate and harsh, and words so vain and lean, that there is no hold to be taken of them.','Gaza'),
('demetrius-grammarian','Demetrius the grammarian','Who found a knot of philosophers chatting in the temple at Delphos and told them that by their cheerful faces they could not be engaged in very deep discourse.','Demetrius the grammarian'),
('heracleon','Heracleon the Megarean','Who answered him: it is for men puzzling over how a future tense is spelt to knit their brows; philosophical discourse always cheers those who entertain it and never makes them sad.','Heracleon'),
('minerva','Minerva','The goddess of wisdom, set against Venus in that comparison, and one of the three to whom Plato gives the patronage of the young’s sports. Under her Greek name Pallas she is the goddess the Athenians adore, and the one who issued from her father’s head to communicate herself to the world — which the older edition misprints Balias. Draco and Solon gave out their laws under her name. She is not the Pallas of 69:302, who is a dead man.','Minerva','reference','deity'),
('bradamante','Bradamante','One of the two mistresses Montaigne would have the tutor hold up to the boy: a natural, active, generous, manly beauty in a glittering helmet, against Angelica tricked up in curls and ribbons.','Bradamante','reference','literary-figure'),
('angelica','Angelica','Set against Bradamante when a tutor first shows his pupil a mistress: the soft, delicate, artificial, simpering and affected form, tricked up in curls and ribbons like a wanton minx, against the manly beauty in a glittering helmet.','Angelica','reference','literary-figure'),
('flora','Flora','With the Graces, one of the figures Speusippus painted his school with — and which Montaigne would paint a school with instead of birch and willow. Not the courtesan of 72:14 and 97:38, whose name she was taking until the census of the unkeyed table names ran over chapter 72.','','reference','deity'),
('demophoon-steward','Demophoon','Alexander the Great’s steward, who sweated in the shade and shivered in the sun. The modern edition spells him Demophoön.','Demophoon|Demophoön'),
('callisthenes','Callisthenes','Who forfeited Alexander’s favour by refusing to pledge him a cup of wine — and whom, Montaigne notes, not even the philosophers justify for it.','Callisthenes'),
('alcibiades','Alcibiades','Whose constitution Montaigne admires with wonder: he could transform himself to any fashion without hurting his health, outdoing Persian luxury one while and Lacedaemonian austerity the next — as reformed in Sparta as he was voluptuous in Ionia.','Alcibiades','supporting'),
('carneades','Carneades','The philosopher Montaigne gives as his instance of a man brutified by an immoderate thirst after knowledge: so besotted with it that he would not find time so much as to comb his head or pare his nails.','Carneades|Cameades|Car-neades','supporting'),
('quintilian','Quintilian','The Roman teacher of rhetoric, cited for the observation that an imperious authority in a schoolmaster is often attended by dangerous consequences.','Quintilian','supporting'),
('boccaccio','Boccaccio','Whose novels, Montaigne says, are harder to understand than the plain philosophical discourses he would put into a child’s hands.','Boccaccio','supporting'),
('menoeceus','Meniceus','The correspondent of the letter in which Epicurus says that neither the youngest should refuse to philosophise nor the oldest grow weary of it. The modern edition spells him Menoeceus.','Meniceus|Menoeceus'),
('leo-of-phlius','Leo, prince of the Phliasians','Who asked Heraclides Ponticus what art or science he professed, and was told: neither art nor science, but I am a philosopher.','Leo, prince of the Phliasians'),
('heraclides-ponticus','Heraclides Ponticus','Asked by Leo, prince of the Phliasians, what art or science he professed, he answered that he knew neither art nor science, but that he was a philosopher.','Heraclides Ponticus'),
('diogenes-the-cynic','Diogenes','The Cynic, who when reproached that being ignorant he should pretend to philosophy answered that he pretended to it with so much the more reason. Not Diogenes the Atheist of 11:31.'),
('hegesias','Hegesias','Who asked Diogenes to read him a book, and was asked in return why, since he chose figs that were true and natural rather than painted ones, he did not choose exercises that were naturally true rather than written. His doctrine, which Montaigne sets beside Theodorus’s, was that a wise man ought to do nothing but for himself, forasmuch as he only was worthy of it.','Hegesias'),
('zeuxidamus','Zeuxidamus','Who, asked why the Lacedaemonians did not write their rules of chivalry down for their young men to read, answered that it was to inure them to action and not amuse them with words.','Zeuxidamus'),
('la-rochefoucauld','The Comte de la Rochefoucauld','At the head of the troop of horse behind the two pedants on the road to Orleans — one of whom, asked who the gentleman was, and thinking his companion meant, answered that he was no gentleman but a grammarian, and that he himself was a logician.','Comte de la Rochefoucauld|Rochefoucauld'),
('aper','Aper','Who demonstrates in Tacitus how easily the fine decoration of painted speech is effaced by the lustre of a simple and blunt truth.','Aper','reference','literary-figure'),
('tacitus','Tacitus','The Roman historian, in whose dialogue Aper makes that case.','Tacitus','supporting'),
('cleomenes-sparta','Cleomenes, king of Sparta','Who heard out the long and elegant oration of the ambassadors of Samos and then answered: as to the exordium I remember it not, nor the middle of your speech; and as for your conclusion, I will not do what you desire.'),
('polycrates','Polycrates','The tyrant the ambassadors of Samos wanted Cleomenes to make war on.','Polycrates'),
('menander','Menander','Who, reproved for not having begun the comedy he had promised, answered that it was made and ready, all but the verses: having contrived the subject and disposed the scenes, he took little care for the rest.','Menander','supporting'),
('ronsard','Ronsard','Who with Joachim du Bellay gave French poetry its reputation — since when, Montaigne says, every little dabbler swells his words as high and makes his cadences nearly as harmonious, and falls infinitely short of the rich descriptions of the one and the delicate invention of the other.','Ronsard','supporting'),
('anacreon','Anacreon','The Greek lyric poet, quoted for the line: what care I about the Pleiades or the stars of Taurus?','Anacreon'),
('suetonius','Suetonius','Who calls Julius Caesar’s style soldier-like — a judgment Montaigne repeats and says he cannot see the reason for.','Suetonius|Tranquillus','supporting'),
('aristophanes-grammarian','Aristophanes the grammarian','Who was quite out, Montaigne says, in reproving Epicurus for his plain way of delivering himself and for an oratory whose whole design was to be understood.','Aristophanes the grammarian'),
('nicolas-grouchy','Nicolas Grouchy','Who wrote De Comitiis Romanorum, and one of the domestic tutors who told Montaigne that his infant Latin was so fluent they were afraid to enter into discourse with him.','Nicolas Grouchy|Grouchy'),
('guillaume-guerente','Guillaume Guerente','Who wrote a comment upon Aristotle, another of those tutors, and one of the three whose Latin tragedies Montaigne acted in at the College of Guienne. The modern edition spells him Guérente.','Guillaume Guerente|Guillaume Guérente|Guerente|Guérente'),
('george-buchanan','George Buchanan','The great Scottish poet, another of them, who told Montaigne he was about to write a treatise of education and meant to take his example from Montaigne’s own — being then tutor to the Comte de Brissac.','George Buchanan|Buchanan'),
('marc-antoine-muret','Marc Antoine Muret','Whom both France and Italy acknowledged for the best orator of his time, the fourth of those tutors.','Marc Antoine Muret|Marc-Antoine Muret|Muret'),
('brissac-mareschal','The Mareschal de Brissac','On whom Buchanan was attending when Montaigne saw him again.','Mareschal de Brissac'),
('brissac-comte','The Comte de Brissac','Buchanan’s pupil, who afterwards proved so valiant and brave a gentleman.','Comte de Brissac'),
('counts-of-foix','The Counts of Foix','The house Diane de Foix and her husband are both descended from, and whose writings Montaigne cites as evidence that learning runs in the family.','Counts of Foix','reference','group'),
('the-graces','The Graces','With Flora, the figures Speusippus painted his school with.','the Graces','reference','deity'),
('plautus','Plautus','The Latin comic poet, one of the books the boy Montaigne ran through by stealth after Ovid and Terence, allured by the sweetness of the subject.','Plautus'),
('andreas-goveanus','Andreas Goveanus','Principal of the College of Guienne, and without comparison the best man in that employment in France.','Andreas Goveanus|Goveanus'),
('aristo-tragedian','Aristo the tragedian','A man of good family and fortune, neither of which the profession blemished, nothing of the kind being a disparagement in Greece. Not Aristo of Chios.'),
]:add(*row)


# ============= CHAPTER 26 — folly to measure truth by our own capacity
for row in [
('chilo','Chilo','Who enjoined the rule Ne quid nimis — nothing too much — and who said: love him as if you were one day to hate him, and hate him as if you were one day to love him.','Chilo'),
('froissart','Froissart','In whom Montaigne finds the Comte de Foix knowing in Bearn, the day after it happened, the defeat of John of Castile.','Froissart'),
('comte-de-foix','The Comte de Foix','Who knew in Bearn the day after it happened of John of Castile’s defeat at Aljubarrota, and told Froissart the means by which he came to know it.','Comte de Foix'),
('john-of-castile','John, king of Castile','Defeated at the battle the older edition calls Jubera and the modern Aljubarrota.'),
('pope-honorius','Pope Honorius','Who performed King Philip Augustus’s public obsequies at Rome on the very day the king died at Mantes, and commanded the like throughout Italy.','Pope Honorius'),
('philip-augustus','King Philip Augustus','Who died at Mantes on the day Pope Honorius buried him at Rome. His name has to be bound whole, or the emperor Augustus takes the second half of it.','Philip Augustus'),
('domitian','Domitian','In whose time, Plutarch says he knows of certain knowledge, the news of a battle lost in Germany was published at Rome the same day it was fought.','Domitian'),
('antony-germany','Antony','Who lost the battle in Germany whose news reached Rome, Plutarch says, on the day it was fought. Not Mark Antony.'),
('bouchet','Bouchet','Whose miracles of St Hilary’s relics Montaigne would wave away — while refusing to condemn all such stories out of hand, which he calls a singular impudence.','Bouchet'),
('st-hilary','St Hilary','Bishop of Poictiers and the famous enemy of the Arian heresy, whose relics Bouchet records the miracles of. Hearing in Syria that his only daughter Abra was being sought in marriage, he wrote telling her to put worldly pleasures aside for a greater husband — and then prayed without ceasing that God would take her out of the world, which soon happened, to his singular joy. His wife, hearing how it had been done, begged the same for herself and got it.','St. Hilary','supporting','religious-figure'),
('st-gervasius','St Gervasius','On whose relics, with St Protasius’s, St Augustine testifies to having seen a blind child recover its sight at Milan.','St. Gervasius','reference','religious-figure'),
('st-protasius','St Protasius','With St Gervasius, one of the two saints whose relics at Milan St Augustine says he saw a blind child recover sight upon.','St. Protasius','reference','religious-figure'),
('hesperius','Hesperius','St Augustine’s familiar friend, who drove the spirits out of his house with a little earth from the sepulchre of our Lord.','Hesperius'),
('st-stephen','St Stephen','Whose shrine a woman in a procession touched with a nosegay, and rubbing her eyes with it recovered the sight she had lost many years before.','St. Stephen','reference','religious-figure'),
('aurelius-bishop','Aurelius','With Maximinus, one of the two holy bishops St Augustine calls as witnesses to the miracles he reports at Milan and Carthage.'),
('maximinus-bishop','Maximinus','With Aurelius, one of the two holy bishops St Augustine calls as witnesses to the miracles he reports — men Montaigne says no one living is impudent enough to think himself comparable to.','Maximinus'),
]:add(*row)

# ============================================== CHAPTER 27 — of friendship
for row in [
('laelius','Laelius','Who asked Caius Blosius, in front of the Roman consuls prosecuting everyone who had been familiar with Tiberius Gracchus, how much he would have done for him — and got the answer: all things. Many at Rome thought and would usually say that the greatest of Scipio’s acts were in part due to him, his constant practice being to advance and support Scipio’s grandeur and renown without any care of his own; and with Fabricius he is one of the two ancients whose countenance and behaviour Montaigne says our people would think barbarous.','Laelius'),
('tiberius-gracchus','Tiberius Gracchus','Whose friends the consuls prosecuted after sentencing him, and whose will Blosius says he had in his sleeve. Montaigne’s last instance of ancient parsimony: he was allowed but fivepence halfpenny a day when employed about the public affairs, and was at that time the greatest man of Rome.','Tiberius Gracchus|Gracchus'),
('suidas','Suidas','The Greek lexicographer, cited for what he reports of some people of the East who drink only outside their meals.','Suidas'),
('caius-blosius','Caius Blosius','Gracchus’s chiefest friend, who told Laelius he would have obeyed him even in firing the temples — because Gracchus would never have commanded it. Montaigne defends the answer: they were more friends to one another than either enemies or friends to their country.','Caius Blosius|Blosius'),
('achilles','Achilles','To whom Aeschylus gave the lover’s part in the loves of Achilles and Patroclus — for which the Academy very much blames him, Achilles being in the first and beardless flower of his adolescence and the handsomest of all the Greeks.','Achilles','reference','mythological-figure'),
('patroclus','Patroclus','Achilles’s friend. The Greeks blamed Aeschylus for giving the lover’s part in their loves to Achilles, who was in the first and beardless flower of his adolescence and the handsomest of them all.','Patroclus','reference','mythological-figure'),
('harmodius','Harmodius','Whose healthy love with Aristogiton is the Academy’s instance of the public good such friendship did — and which Montaigne has already told from the other end, in the story of the tyrannicides.','Harmodius'),
('aristogiton-friend','Aristogiton','With Harmodius, one of the pair whose love the Greeks gave as an instance of the healthy kind, from which they said great utility came to private and public concerns alike.','Aristogiton'),
('eudamidas','Eudamidas','A Corinthian who died poor with two rich friends, and left his mother’s maintenance to Areteus and his daughter’s marriage to Charixenus — a will everyone laughed at and the legatees accepted with content. Montaigne says the force of friendship shows more in leaving them the chance of the benefit than in their discharging it.','Eudamidas'),
('charixenus','Charixenus','A Sicyonian, one of the two legatees, who died within five days and left the whole charge on his fellow.','Charixenus'),
('areteus','Areteus','The other, a Corinthian, who nurtured the old woman with great tenderness and married both his own daughter and Eudamidas’s out of the five talents he had, on one and the same day.','Areteus'),
]:add(*row)

# ============= CHAPTER 28 — nine and twenty sonnets of Estienne de la Boitie
for row in [
('madame-de-grammont','Madame de Grammont, Comtesse de Guissen','The dedicatee of La Boétie’s sonnets, which the editions no longer print. The dedication line is all that is left of them here, and it is printed in capitals.','MADAME DE GRAMMONT|Madame de Grammont'),
]:add(*row)


# ============================================= CHAPTER 29 — of moderation
for row in [
('pausanias-sparta','Pausanias','Whose own mother was the first instructor of his process and threw the first stone towards his death — a virtue Montaigne finds not so much just as strange.'),
('postumius','Posthumius the dictator','Who put his own son to death for having pushed upon the enemy a little in advance of his squadron, and successfully. The modern edition spells him Postumius.','Posthumius|Postumius'),
('callicles','Callicles','Who says in Plato that the extremity of philosophy is hurtful, and that taken beyond the limits of profit it renders a man brutish, a contemner of religion and the laws, and unfit for any public administration. Montaigne says he says true.','Callicles','reference','literary-figure'),
('thomas-aquinas','St Thomas Aquinas','Who condemns marriage within the forbidden degrees partly for fear the friendship should be immoderate: a conjugal affection surcharged with the affection of kindred will carry a husband beyond the bounds of reason.','St. Thomas Aquinas|St Thomas Aquinas|St. Thomas d’Aquin','reference','religious-figure'),
('zenobia','Zenobia','Who would admit her husband for one encounter only and then left him to himself for the whole time of her conception — a brave and generous example, Montaigne says, of conjugal continence.','Zenobia'),
('aelius-verus','AElius Verus','The emperor who answered his wife’s reproaches about other women by saying that marriage was a name of honour and dignity, not of wanton desire. The modern edition spells him Aelius.','AElius Verus|Aelius Verus'),
('gallio','Gallio','Exiled to Lesbos and found to be living there as merry as the day was long, so that the Senate recalled him and confined him to his own house with his wife and family — to fit the punishment to his feeling.','Gallio'),
('amurath','Amurath','Who at the taking of the Isthmus immolated six hundred young Greeks to his father’s soul as a propitiatory sacrifice for his sins. Not the Amurath III of 78:1.','Amurath'),
('fernando-cortez','Fernando Cortez','To whom the king of Mexico’s ambassadors boasted that their master was obliged to offer the gods fifty thousand men a year — and for whose welcome, at another town, they sacrificed fifty at once.','Fernando Cortez|Cortez'),
]:add(*row)

# ============================================== CHAPTER 30 — of cannibals
for row in [
('flaminius','Flaminius','Whose army the Greeks said the same of as Pyrrhus said of the Romans: that whatever these barbarians might be, the order of the army had nothing of barbarism in it. Montaigne takes a passage from his life in the French Plutarch as his instance that the ancients made nothing of the order of names: the jealousy of honour between the AEtolians and the Romans over a battle their joined forces had won is made to turn on the AEtolians being put before the Romans in the Greek songs — if, Montaigne adds, there is no amphibology in the words of the French translation.','Flaminius'),
('philip-v-macedon','Philip','Philip of Macedon, who looked down from a height on the Roman camp Publius Sulpicius Galba had formed in his kingdom and spoke to the same effect.'),
('sulpicius-galba','Publius Sulpicius Galba','Who formed the Roman camp in Philip’s own kingdom, whose order and distribution Philip looked down on from a height and found nothing of barbarism in.','Publius Sulpicius Galba'),
('villegaignon','Villegaignon','Who landed in the part of the New World he called Antarctic France — where the man Montaigne kept in his house had lived ten or twelve years.','Villegaignon'),
('arsac','The Sieur d’Arsac','Montaigne’s brother, who watches an estate of his in Medoc being buried under the sand the sea drives before it, the tops of some houses still showing and his rents turned to barren pasture.','Sieur d’Arsac|Arsac'),
('claudian','Claudian','The late Latin poet, quoted for the line that no victory is complete which the conquered do not admit to be so. The older edition prints him Claudius.','Claudian'),
('leonidas','King Leonidas','Whose discomfiture at the pass of Thermopylae, Montaigne says, outweighs the four sister victories of Salamis, Plataea, Mycale and Sicily put together.','Leonidas'),
('iscolas','Captain Iscolas','Set to hold a pass of Peloponnesus against the Arcadians with no possibility of doing it, he sent the youngest and most active of his men home for their country’s service and held the pass with the rest until every one of them was cut to pieces. Montaigne asks whether the trophy was not more due to the conquered.','Iscolas'),
('sarah','Sarah','Who with Leah and Rachel gave the most beautiful of her handmaids to her husband — Montaigne’s scriptural parallel to the cannibal wives who seek out companions for their husbands.','Sarah','reference','religious-figure'),
('leah','Leah','With Rachel, one of the two wives of Jacob who in the Bible gave the most beautiful of their handmaids to their husband.','Leah','reference','religious-figure'),
('rachel','Rachel','With Leah, one of the two wives of Jacob who in the Bible gave the most beautiful of their handmaids to their husband — which Montaigne calls a truly matrimonial virtue of the highest form.','Rachel','reference','religious-figure'),
('deiotarus','King Deiotarus','Whose wife Stratonice gave up a fair young maid of her own to his embraces and then brought up the children carefully and helped them to the succession.','Deiotarus'),
('stratonice-deiotarus','Stratonice','King Deiotarus’s wife. Not the Stratonice whose beauty gave Antiochus his fever.'),
('charles-ix','King Charles IX','At Rouen when three of the cannibals were brought there, and who talked with them a good while. They said it was strange that so many tall bearded armed men should submit to obey a child.'),
]:add(*row)


# ================== CHAPTER 31 — soberly judging the divine ordinances
for row in [
('don-john-of-austria','Don John of Austria','Under whose command the fine naval battle against the Turks was won a few months before Montaigne wrote — a victory he will not let anyone use as proof of a cause, since God has let us see as great ones at our own expense.','Don John of Austria'),
('arius','Arius','The principal head of the Arian heresy, who was withdrawn from the disputation by a griping in the bowels and gave up the ghost upon the stool.','Arius'),
('pope-leo-arian','Pope Leo','Arius’s fellow head of the Arian heresy, who died the same strange death at another time. Not Pope Leo X, nor the Emperor Leo.'),
('heliogabalus','Heliogabalus','Also slain in a house of office — which Montaigne adds to show how little such coincidences prove.','Heliogabalus'),
('irenaeus','Irenaeus','Involved in the same fortune, and the last of Montaigne’s examples that the place of a man’s death is no evidence of divine vengeance.','Irenaeus'),
]:add(*row)

# ============== CHAPTER 32 — avoiding pleasures at the expense of life
for row in [
('lucilius','Lucilius','The man of power about the emperor whom Seneca advises either to leave that life of his or life itself: better once to fall than to be always falling.','Lucilius'),
('idomeneus','Idomeneus','To whom Epicurus writes the same counsel on the like occasion — which is why Montaigne finds it stranger in Seneca, the Stoic having borrowed it from the Epicurean.','Idomeneus'),
('abra','Abra','St Hilary’s only daughter, left at home under her mother’s eye, sought in marriage by the greatest noblemen of the country, and prayed out of the world by her father.','Abra'),
]:add(*row)

# ================ CHAPTER 33 — fortune acting by the rule of reason
for row in [
('duc-de-valentinois','The Duc de Valentinois','Who sent a bottle of poisoned wine ahead to the Vatican for Cardinal Adrian, and whose butler, thinking it had been recommended only for its excellency, served it to the Pope — and then to the duke himself.','Duc de Valentinois|Duke of Valentinois'),
('cardinal-adrian','Adrian, Cardinal of Corneto','The intended victim, who was to sup with the Pope and his son.','Adrian, Cardinal of Corneto'),
('alexander-vi','Pope Alexander VI','Who drank the wine meant for the cardinal and died on the spot.','Pope Alexander VI|Alexander VI'),
('destrees','Monsieur d’Estrees','Ensign to Monsieur de Vendome, who took his rival prisoner on the day of the man’s wedding and before he had gone to bed to his wife — and gave him up when the bride asked it of him as a courtesy, the gentlemen of France never denying anything to ladies.','Monsieur d’Estrees|Sieur d’Estrees|Monsieur d\'Estrees|Sieur d\'Estrees'),
('vendome','Monsieur de Vendome','Monsieur d’Estrees’s captain — he is named to place the ensign who was one of the two pretenders to the Sieur de Fougueselles’ sister.','Monsieur de Vendome'),
('licques','Monsieur de Licques','Lieutenant in the Duc d’Ascot’s company, who carried the Sieur de Fougueselles’ sister and then went out to break a lance in her honour near St Omer and was taken prisoner before the wedding night.','Monsieur de Licques|Sieur de Licques'),
('duc-dascot','The Duc d’Ascot','In whose company Licques was lieutenant.','Duc d’Ascot|Duc d\'Ascot'),
('fougueselles','The Sieur de Fougueselles','The Sieur de Fougueselles, whose sister Monsieur d’Estrees and Monsieur de Licques were both pretenders to.','Sieur de Fougueselles'),
('constantine-founder','Constantine, son of Helena','Who founded the empire of Constantinople.'),
('constantine-last','Constantine, son of Helen','Who so many ages later put an end to the empire the first Constantine founded — the same name and the same mother’s name at both ends of it, which Montaigne calls Fortune playing the artist.'),
('helena','Helena','The first Constantine’s mother, whose name the last Constantine’s mother also carried.','Helena|Helen'),
('clovis','King Clovis','Before whose siege of Angouleme the walls fell down of themselves by divine favour.','Clovis'),
('king-robert','King Robert','Who left his siege to keep the feast of St Aignan at Orleans, and at a certain part of the Mass the walls of the besieged city fell down of themselves. Bouchet has it from some author; the Essays do not identify him with Robert of Scotland.'),
('st-aignan','St Aignan','Whose feast King Robert left the siege to keep at Orleans.','St. Aignan','reference','religious-figure'),
('capitaine-rense','Le Capitaine Rense','Who carried a mine under the wall of Arona for the French; the wall was lifted off its base and dropped back whole and exactly upon its foundation, and the besieged suffered nothing by it.','Capitaine Rense|Rense'),
('jason-of-pheres','Jason of Pheres','Given over by the physicians for an imposthume in his breast, he threw himself into the thickest of the enemy to be rid of the pain by death at least — and was so fortunately wounded through the body that the imposthume broke and he was cured.','Jason of Pheres|Jason'),
('protogenes','Protogenes','The painter who could not get the foam right on his tired dog, threw his colour-soaked sponge at the picture in a rage, and found that fortune’s throw had done what all his art could not.','Protogenes'),
('isabel-of-england','Isabel, Queen of England','Sailing from Zealand with an army for her son against her husband, she would have been lost had she made the port she intended, where the enemy lay in wait; fortune threw her against her will into another haven and she landed safe.','Isabel'),
('icetes','Icetes','Who contracted with two soldiers to kill Timoleon at Adrana in Sicily.','Icetes'),
('timoleon','Timoleon','Whose assassins were interrupted by a third man cutting one of them down — for his own father’s murder, as it turned out — so that the plot came out and the killer was awarded ten Attic minae for preserving the common father of Sicily. Montaigne returns to him for the tears he shed over his own brother.','Timoleon','supporting'),
('ignatius-father','Ignatius the father','Who with his son, proscribed by the triumvirs, ran on his son’s sword as the son ran on his, so that the two mortal wounds were equal and the executioner cut off both heads at once, the bodies still locked together.','Ignatius the father'),
('ignatius-son','Ignatius the son','Proscribed with his father by the triumvirs of Rome, and resolved with him to fall by one another’s hands and so defeat the cruelty of the tyrants.','Ignatius the son'),
]:add(*row)

# ==================== CHAPTER 34 — one defect in our government
for row in [
('giraldus','Lilius Gregorius Giraldus','Who died in Italy so poor he had scarce bread to put in his mouth — one of the two most excellent men for learning whose want Montaigne says the age should be ashamed of.','Lilius Gregorius Giraldus|Giraldus'),
('castalio','Sebastianus Castalio','Sebastianus Castalio, who with Lilius Gregorius Giraldus in Italy makes Montaigne’s pair of most excellent men for learning who died, in our very sight and to the shame of the age, so poor they had scarce bread to put in their mouths. Castalio died so in Germany.','Sebastianus Castalio|Castalio'),
]:add(*row)


# ==================== CHAPTER 35 — the custom of wearing clothes
for row in [
('massinissa','King Massinissa','Who to an extreme old age could never be prevailed on to cover his head, in whatever weather.','Massinissa'),
('emperor-severus','The Emperor Severus','Of whom the same bare-headedness is reported as of Massinissa: neither could be prevailed on to cover his head, however cold or stormy the weather.','Emperor Severus'),
('varro','Varro','Who thinks the rule that we go bare before the gods and the magistrate was made for health and to inure us to the weather rather than out of reverence.','Varro|Yarro','supporting'),
('mithridates','Mithridates','Whose lieutenant beat the enemy dry-foot at the mouth of Lake Maeotis in a frost so sharp, and beat them again in a naval battle on the same water the summer after.','Mithridates','supporting'),
]:add(*row)

# ======================================== CHAPTER 36 — of Cato the Younger
for row in [
('pausanias-plataea','Pausanias','The Spartan who commanded at Plataea. Montaigne has already told how his own mother threw the first stone towards his death.'),
('mardonius','Mardonius','Whose Persians Pausanias beat at Plataea.','Mardonius'),
('aristodemus','Aristodemus','Who of all the Spartans at Plataea had hazarded his person most bravely, and was allowed no prize for it — because his virtue had been incited by a wish to clear his name of the reproach of Thermopylae, and to die bravely to wipe off that blemish.','Aristodemus'),
]:add(*row)

# ===================== CHAPTER 37 — laughing and crying for the same thing
for row in [
('antigonus-gonatas','Antigonus','Who was much displeased with his son for bringing him the head of King Pyrrhus his enemy, newly slain fighting against him, and wept to see it. Not the Antigonus who besieged Eumenes in Nora.'),
('rene-of-lorraine','Rene, Duke of Lorraine','Who lamented the death of Charles of Burgundy, whom he had himself defeated, and appeared in mourning at his funeral. The modern edition spells him René.','Rene, Duke of Lorraine|René, Duke of Lorraine'),
('charles-of-burgundy','Charles, Duke of Burgundy','Charles the Duke of Burgundy, defeated by Rene of Lorraine, who then lamented his death and appeared in mourning at his funeral.','Charles, Duke of Burgundy'),
('count-montfort','Count Montfort','Who won the battle of D’Auray over his competitor for the duchy of Brittany and was much afflicted at meeting his dead body.','Count Montfort|Montfort'),
('charles-de-blois','Charles de Blois','The competitor, whose body Montfort grieved over.','Charles de Blois'),
('publius-syrus','Publius Syrus','The Latin writer of maxims, quoted for the line that the heir’s tears behind the mask are smiles, and again, as the player Publius, for the famous verse that it is evil counsel which will admit no change. The citation at 40:67 prints him P. Syrus and the one at 58:2 Pub. Mim.','Publius Syrus|P. Syrus'),
('artabanus','Artabanus','Who came on his nephew Xerxes by surprise and chid him for the sudden change in his face.','Artabanus'),
]:add(*row)

# ============================================== CHAPTER 38 — of solitude
for row in [
('stilpo','Stilpo','Who escaped the burning of his town having lost wife, children and goods, and told Demetrius Poliorcetes that he had received no loss, since fortune had nothing of his — and who, oppressed with age, is said to have purposely hastened his end by drinking pure wine.','Stilpo'),
('demetrius-poliorcetes','Demetrius Poliorcetes','Seeing Stilpo appear with an undisturbed countenance in the ruin of his country, he asked whether the man had received no loss — and was told that nothing of his was lost.','Demetrius Poliorcetes'),
('tibullus','Tibullus','The Latin elegiac poet, quoted for the line: in solitude, be company for thyself.','Tibullus'),
('pliny-the-younger','The younger Pliny','Whose letter advises Caninius Rufus to leave his husbandry to his hinds and take up something of his own that will last. Montaigne rejects both the means and the end of that advice: book-employment is as painful as any other, and the glory Pliny and Cicero hold out is infinitely wide of his account, ambition being the humour most contrary to solitude. Not the elder Pliny of the Natural History, and, Montaigne says, not much like his uncle in his humours.'),
('caninius-rufus','Caninius Rufus','The friend the younger Pliny’s letter is written to, advising him to leave his husbandry to his hinds and take up something of his own that will last.','Caninius Rufus'),
('phocion','Phocion','With Cato and Aristides, one of the three a man in solitude should keep continually before his imagination, in whose presence even fools hide their faults — the counsel Montaigne compounds out of two philosophers of different sects, one writing to Idomeneus and the other to Lucilius.','Phocion','supporting'),
('aristides','Aristides','With Cato and Phocion, one of the three a man in solitude should keep continually before his imagination and set up as the controllers of all his intentions, in whose presence even fools hide their faults.','Aristides','supporting'),
('antisthenes','Antisthenes','The Cynic, who thought it a poor sort of commendation that Ismenias played excellently well on the flute.','Antisthenes','supporting'),
('bias','Bias','One of the sages, cited in the chapter on solitude.','Bias'),
('albuquerque','Albuquerque','Viceroy in the Indies for Emmanuel of Portugal, who in an extreme peril of shipwreck took a young boy on his shoulders for no other end than that the child’s innocence might recommend him to God’s favour and save them both.','Albuquerque'),
('paulinus-of-nola','Paulinus','Bishop of Nola, who when the barbarians ruined the city lost everything he had and was taken prisoner, and prayed only to be kept from feeling the loss — they had touched nothing that was his.','Paulinus'),
('democritus','Democritus','The philosopher of Abdera. Montaigne quotes Horace’s epistle on him: his cattle eat his corn and spoil his fields while his soaring mind ranges abroad without the body.','Democritus'),
]:add(*row)


# =================================== CHAPTER 39 — a consideration upon Cicero
for row in [
('eros-slave','Eros','Cicero’s slave, who brought him word that the audience was put off till the next day — at which, Montaigne notes, his master was so ravished with joy that it laid his nature open.','Eros'),
('annibale-caro','Annibale Caro','Whose printed letters Montaigne thinks the best of the hundred volumes of them he owns.','Annibale Caro'),
('ismenias','Ismenias','Commended for playing excellently well upon the flute, which Antisthenes took for an argument of little value.','Ismenias'),
('scipio-aemilianus','Scipio Aemilianus','The Scipio who with Laelius is said to have resigned the honour of his comedies to an African — and who would never have done it, Montaigne says, if eloquence had added a lustre suitable to a great person. Not the Africanus who crossed to Syphax, nor Pompey’s father-in-law, nor the high priest. After two triumphs and two consulships he went an embassy with no more than seven servants in his train.','Scipio AEmilianus|Scipio Aemilianus'),
('demosthenes','Demosthenes','Whose companions in the embassy praised Philip as handsome, eloquent and a stout drinker — commendations, Demosthenes said, more proper for a woman, an advocate and a sponge than for a king.','Demosthenes','supporting'),
('philip-ii-macedon','Philip','Philip of Macedon, who asked his son Alexander whether he was not ashamed to sing so well, and whom Demosthenes’s fellow ambassadors praised for the wrong qualities.'),
]:add(*row)

# ============ CHAPTER 40 — good and evil depend on the opinion we have of them
for row in [
('theodorus','Theodorus','Who answered Lysimachus’s threat to kill him: thou wilt do a brave feat, to attain the force of a cantharides. His saying, set beside Hegesias’s, is that it is not reasonable a wise man should hazard himself for his country and endanger wisdom for a company of fools. He is the Theodorus whose atheism Bion caught, and who with Diagoras flatly denied that there were any gods at all.','Theodorus|Theodoras'),
('lysimachus','Lysimachus','Who threatened to kill Theodorus, and was told he would be doing a brave feat — attaining the force of a cantharides.','Lysimachus'),
('pyrrho','Pyrrho','The philosopher who, in a boat in a great tempest, pointed to a hog aboard as the pattern of the assurance the most frightened men lacked.','Pyrrho','supporting'),
('brutus-xanthus','Brutus','Who besieged the Xanthians, and whose siege drove them — men, women and children — into such an appetite of dying that nothing he could do would save them.'),
('john-of-portugal','John, King of Portugal','Who sold the Jews banished from Castile a retreat in his dominions for eight crowns a head and a fixed term, and after the term made slaves of those who stayed.'),
('emmanuel-of-portugal','Emmanuel','John’s successor, who first set them at liberty and then changed his mind again.','Emmanuel'),
('bishop-osorius','Bishop Osorius','No contemptible Latin historian of these later times, and Montaigne’s source for what the kings of Portugal did to the Jews.','Bishop Osorius|Osorius'),

('posidonius','Posidonius','Extremely tormented with a sharp and painful disease, he received Pompeius with a lecture against pain and would not admit that it was an evil.','Posidonius','supporting'),
('hieronimus','Hieronimus','With Aristippus and most of the sages, he reputed pain the worst of evils. The modern edition spells him Hieronymus.','Hieronimus|Hieronymus'),
('cardinal-borromeo','Cardinal Borromeo','Who died lately at Milan, and who amid all the jollity of Italy, youth, birth and riches kept so austere a way of life that Montaigne counts him among those who have hugged their own privation.','Cardinal Borromeo|Borromeo'),
('foulke-of-anjou','Foulke, Count of Anjou','Who went to Jerusalem to have himself whipped by two of his servants, with a cord about his neck, before the sepulchre.','Foulke'),
('william-of-guienne','William, Duke of Guienne','Montaigne’s last Duke of Guienne, who for the last ten or twelve years of his life wore a suit of armour under a religious habit by way of penance.','William, our last Duke of Guienne'),
('eleanor-of-guienne','Eleanor','William’s daughter, who transmitted the duchy of Guienne to the houses of France and England.','Eleanor'),
('louis-xi','Louis XI','At whose taking of Arras a great many of the inhabitants let themselves be hanged rather than say “God save the King.”','Louis XI'),
('st-louis','King St. Louis','Louis IX, whom Montaigne calls our good St Louis: he wore a hair-shirt until his confessor gave him a dispensation to leave it off in his old age, and every Friday had his shoulders drubbed by his priest with five small iron chains carried about among his night things.','St. Louis|St Louis|Saint Louis'),
('sabinus','Sabinus','A patrician of Rome, whose fair and noble wife bore two children alone and without crying out, for another’s interest.','Sabinus'),
('mucius-scaevola','Scaevola','Who slipped into the enemy camp to kill their general, missed his blow, and repaired the fault by telling Porsenna to his face not only what he had meant to do but that many more were sworn to do it. Not the P. Scaevola of Cotta’s list of high priests.'),
('porsenna','Porsenna','The king Scaevola had meant to kill, and who heard the whole confession — and who, conceiving horror at the sight of the burning arm, had the pan of coals taken away.','Porsenna'),
('fabius-maximus','Q. Maximus','Who buried his son when the son was consul, with a countenance that expressed no manner of grief.','Q. Maximus'),
('cato-the-censor','M. Cato','Who buried his son when the son was praetor elect with a countenance that expressed no manner of grief; and who, as consul, forbade the inhabitants of some Spanish cities to wear arms, whereupon a great many of them killed themselves. Not the Cato of Utica to whom Montaigne gives a chapter.'),
('feraulez','Feraulez','Who had run through both fortunes and found that increase of substance was no increase of appetite, and gave away the great estate he had got by Cyrus’s liberality and the war, on condition only that he be handsomely maintained.','Feraulez'),
('dionysius-the-younger','Dionysius','Dionysius the son, who heard that a Syracusan had hidden a treasure, sent for it, and afterwards gave it back when he found the man had learned to live without it.'),
('teres','Teres','Sitalces’s father, who used to say that when he had no wars he fancied there was no difference between him and his groom.','Teres'),
('sitalces','Sitalces','Son of Teres, the king who used to say that when he had no wars he fancied there was no difference between him and his groom. He is named only to place his father.','Sitalces'),
]:add(*row)


# ==================== CHAPTER 41 — not to communicate a man's honour
for row in [
('tasso','Tasso','The Italian poet of the Jerusalem Delivered, quoted for the line that fame, which charms proud mortals with so alluring a sound and seems so fair, is an echo, a dream, nay the shadow of a dream, that vanishes at every breath.','Tasso'),
('catulus-luctatius','Catulus Luctatius','Who in the Cimbrian war, having done all that lay in him to make his flying soldiers face about, ran away with the rest and counterfeited the coward, so that his men might seem to follow their captain rather than to fly from the enemy — abandoning his own reputation to cover the shame of others.','Catulus Luctatius'),
('archileonida','Archileonida','Brasidas’s mother. When the Thracian ambassadors came to comfort her for her son’s death and commended him so far as to say he had left no one like him behind, she put the private commendation aside: the city of Sparta, she said, had many citizens both greater and of greater worth than he.','Archileonida'),
('brasidas','Brasidas','The Spartan whose death the Thracian ambassadors came to condole with his mother Archileonida over, and whom they praised above all his countrymen.','Brasidas'),
('edward-iii','King Edward','Edward III, who at Crecy had the vanguard committed to his young son the Prince of Wales, and when the lords with him sent for relief and he heard the boy was alive and on horseback, would neither go nor send: he knew that whatever is last added seems to have accomplished the whole affair, and would not deprive his son of the honour of a battle he had so long and so bravely sustained.'),
('theopompus','Theopompus','King of Sparta, who answered the man who told him the republic could not miscarry since he knew so well how to command: it is rather because the people know so well how to obey.','Theopompus'),
('bishop-of-beauvais','The Bishop of Beauvais','Who was with Philip Augustus at Bouvines and had a notable share in the action, but did not think it fit for a churchman to share the fruit and glory of that bloody trade: he reduced several of the enemy with his own hand and delivered each to the first gentleman he met, to kill or to spare, referring the whole execution to another hand, and by the same subtlety of conscience fought always with a mace, so that he might kill but not wound.','Bishop of Beauvais'),
('william-of-salisbury','William, Earl of Salisbury','One of the men the Bishop of Beauvais reduced to his mercy at Bouvines with his own hand, and gave up to Messire Jehan de Nesle rather than take the credit of taking him. The modern edition inverts his name, printing the Earl of Salisbury, William.','William, Earl of Salisbury|Earl of Salisbury, William'),
('jehan-de-nesle','Messire Jehan de Nesle','The gentleman to whom the Bishop of Beauvais gave up the Earl of Salisbury at Bouvines.','Messire Jehan de Nesle'),
]:add(*row)

# ============================ CHAPTER 42 — of the inequality amongst us
for row in [
('mercury','Mercury','The god the king of Thrace kept to himself, having a religion by himself and a god all his own which his subjects were not to presume to adore.','Mercury','reference','deity'),
('mars','Mars','With Bacchus and Diana, one of the gods of the Thracian people, whom their king disdained to have anything to do with.','Mars','reference','deity'),
('bacchus','Bacchus','The second of the three gods of the Thracian people that their king would have nothing to do with — and, under his other names, the good deity whose influence Plato would have men over forty mix liberally in their feasts, which restores gaiety to younger men and youth to old ones, and mollifies the passions of the soul as iron is softened by fire. The two editions spell his other names differently: the older one has Dionysos and Lyacus, the modern Dionysus and Lyaeus, and both carry the note that Lyaeus is a name given to Bacchus. The Latin ablative Lyaeo of the quotations is left unbound, like every other inflection.','Bacchus|Dionysos|Dionysus|Lyacus|Lyaeus','reference','deity'),
('diana','Diana','The third of the gods of the Thracian people, with Bacchus and Mars; and, under her Greek name Cynthia, the goddess Crete adores in Ovid’s list of the gods each nation worships.','Diana|Cynthia','reference','deity'),
('hermodorus','Hermodorus','The poet who wrote a poem in honour of Antigonus calling him the son of the sun, and was told that the man who has the emptying of the king’s close-stool knows the contrary.','Hermodorus'),
('seleucus','Seleucus','The king of whose opinion Montaigne thinks a man of parts would be: that he who knew the weight of a sceptre would not stoop to pick it up if he saw it lying before him, so great and painful are the duties of a good king.','Seleucus'),
('hiero','Hiero','The king in Xenophon’s dialogue, who complains of his own royalty: that princes are worse off than private men even in the fruition of pleasure, since commanding a thing at will takes off the delight of it; that he cannot look abroad or travel at liberty, being a prisoner in the bounds of his own dominion and evermore surrounded with an importunate crowd; and, what he is most concerned at, that he is stripped of all friendship, since nothing done for him is freely done.'),
('diocletian','Diocletian','Who wore a crown so fortunate and revered and resigned it for a private life; and who, when public affairs required him to take it up again, answered that they would not have offered to persuade him had they seen the fine order of the trees he had planted in his orchard and the fair melons he had sown in his garden.','Diocletian'),
('anacharsis','Anacharsis','Whose opinion Montaigne reports of the happiest state of government: one where, all other things being equal, precedence is measured out by the virtues of men and repulses by their vices.','Anacharsis'),
('cyneas','Cyneas','Pyrrhus’s wise counsellor, who asked him what he meant to do after Italy, and after Gaul and Spain, and after Africa; and when the king said he would then sit down and rest content at his own ease, asked for God’s sake what hindered him from being in that condition now.','Cyneas'),
('cornelius-nepos','Cornelius Nepos','The Roman biographer, quoted for the old versicle that every man frames his own fortune.','Cornelius Nepos'),
('alfonso-of-the-asses','King Alfonso','Who used to say that in this asses were in a better condition than kings, their masters permitting them to feed at their own ease and pleasure, a favour that kings cannot obtain of their servants. The Essays do not identify him with the King Alfonso who instituted the Order of the Band.'),
]:add(*row)

# ================================= CHAPTER 43 — of sumptuary laws
for row in [
('zeleucus','Zeleucus','Who reclaimed the corrupted manners of the Locrians by an invention of exceptions: no free woman might have a second maid, go out by night, wear gold or an embroidered robe unless she were a public prostitute, and no man a gold ring or an effeminate Milesian robe unless he were a bravo. By those infamous exceptions he diverted his citizens from superfluity, and drew them to their duty by honour and ambition.','Zeleucus'),
('henry-ii-france','Henry II','The King of France for whose mourning the court wore cloth a year, so that silk fell into such contempt that a man so clad was concluded a citizen; whom Montaigne himself saw unable for his heart to hit on a Gascon gentleman’s name, and obliged to call one of the queen’s maids of honour by the general name of her race because her own was so hard to pronounce; and whom Monsieur de Carnavalet served. Not the Henry II of England whose son kept the feast of the hundred and ten Williams.'),
]:add(*row)

# ======================================== CHAPTER 44 — of sleep
for row in [
('otho','The Emperor Otho','Who, resolved to kill himself that night, settled his domestic affairs, divided his money among his servants, set a good edge on the sword he had chosen, waited only to be satisfied that his friends had got away safe, and then fell into so sound a sleep that the gentlemen of his chamber heard him snore. Vitellius’s insults to his soldiers afterwards did what their own captains could not, and made them fall upon the man who had offered them.','Otho'),
('metellus-tribune','Metellus','The tribune who attempted to publish a decree calling Pompey and his army into the city at the time of Catiline’s conspiracy, and was opposed by Cato alone, stoutly and with very sharp language on both sides, the day before the controversy was to be decided.'),
('catiline','Catiline','Whose conspiracy was the occasion of the tribune Metellus’s decree, and so of the night Cato slept through while his friends went without sleep, food or drink for the danger they saw him running into.','Catiline'),
('sextus-pompeius','Sextus Pompeius','Whom Augustus beat in the naval engagement in Sicily that Augustus slept through, until his friends woke him to give the signal of battle.','Sextus Pompeius'),
('mark-antony','Mark Antony','Who took that sleep as an occasion to reproach Augustus afterwards that he had not the courage so much as to behold the order of his own squadrons with open eyes, nor dared present himself to the soldiers until Agrippa had brought him news of the victory.','Mark Antony'),
('agrippa','Agrippa','Pomponius Atticus’s son-in-law, called to his bedside with two or three friends to be told he had resolved to end his life and his pain together. Also the man who brought Augustus the news of the victory over Sextus Pompeius while the emperor was still out of sight of his own soldiers.'),
('marius-younger','The young Marius','Who did much worse: on the day of his last battle against Sylla, having marshalled his army and given the word and signal, he lay down in the shade of a tree to repose himself and fell so fast asleep that the rout and flight of his men could hardly waken him, having seen nothing of the fight. He was said to be so spent with labour and want of sleep that nature could hold out no longer.'),
('epimenides','Epimenides','The sage whose biographers affirm that he slept seven-and-fifty years together.','Epimenides'),
]:add(*row)

# ============================== CHAPTER 45 — of the battle of Dreux
for row in [
('duc-de-guise','The Duc de Guise','Who commanded at Dreux with the Constable, and whom those with no great kindness for him will have thought to blame for halting and delaying with his forces while the Constable was racked through with the enemy’s artillery, his battalion routed and himself taken. Montaigne answers that the aim of a captain, and of every private soldier, ought to regard the victory in general, and sets Philopoemen’s case beside his.'),
('constable-montmorency-note','unused','placeholder'),
('prince-de-conde','The Prince de Conde','Who commanded the Protestants at Dreux against the Duc de Guise and the Constable. He is named only in the editor’s dated note that both editions print as the chapter’s first paragraph.','Prince de Conde'),
('machanidas','Machanidas','Whom Philopoemen fought, and who let his own horse run off in pursuit past the battalion where Philopoemen stood: Philopoemen suffered his archers and slingers to be chased and cut in pieces before his face rather than leave his post, then charged the enemy’s foot when the horse had left it unprotected, and afterwards put himself in pursuit of Machanidas.','Machanidas'),
]:add(*row)

# ========================================= CHAPTER 46 — of names
for row in [
('geta','The Emperor Geta','Who distinguished the several courses of his meat by the first letters of the meats themselves, so that everything beginning with B was served up together — brawn, beef, bream, bustards, becca-ficos.','Emperor Geta'),
('henry-duke-of-normandy','Henry, Duke of Normandy','Son of Henry II of England. An eyewitness records that at a great feast he made in France the concourse of nobility was so great that, the company being divided for sport into troops according to their names, a hundred and ten knights called William sat at the table of that name, without reckoning the ordinary gentlemen and servants.'),
('henry-ii-england','Henry II','The King of England whose son the Duke of Normandy made that feast. Not the Henry II of France whose mourning put silk out of fashion.'),
('du-guesclin','Guesquin','The famous constable, to whom belong so many sieges, battles, wounds, imprisonments and services done to the crown of France — and whose name Montaigne spells three ways over, to ask which of the letters is to be rewarded for them.','Guesquin|Glesquin|Gueaquin'),
('lucian','Lucian','Whose dialogue has Sigma serve Tau with a process over a stolen letter. The question which spelling of a constable’s name earns his victories is of greater moment than that, Montaigne says, since there the chase is in very good earnest.','Lucian'),
('nicholas-denisot','Nicholas Denisot','Who altered the whole contexture of the letters of his own name to build up the Count d’Alsinois by anagram, and then handsomely endowed that figure with the glory of his poetry and his painting.',"Nicholas Denisot|Count d’Alsinois|Count d'Alsinois"),
('antonio-iscalin','Antonio Iscalin','One man under three names, who suffered himself to his face to be robbed of the honour of so many navigations and commands at sea and land by Captain Paulin and the Baron de la Garde — which are his own other names.','Antonio Iscalin|Captain Paulin|Baron de la Garde'),
]:add(*row)

# ======================= CHAPTER 47 — of the uncertainty of our judgment
for row in [
('monsieur-de-foix','Monsieur de Foix','Whose ardour transported him so furiously in pursuit of the remains of the victory of Ravenna that he obscured it by his own death.','Monsieur de Foix'),
('monsieur-danguien','Monsieur d’Anguien','Whom the recent memory of that example preserved from the same misfortune at the battle of Serisoles.',"Monsieur d’Anguien|Monsieur d'Anguien"),
('portius-latro','Portius Latro','Cited for the line that irritated necessity bites deepest.','Portius Latro'),
('pharax','Pharax','Who withheld the King of Lacedaemon, after his victory over the Mantineans, from charging the thousand Argians who had escaped the defeat in an entire body, and let them steal off at liberty rather than have him encounter valour whetted and enraged by mischance.','Pharax'),
('clodomir','Clodomir','King of Aquitaine, who after his victory pursued the beaten Gondemar so hard that he compelled him to face about and make head, and whose obstinacy deprived him of the fruit of his conquest and of his life.','Clodomir'),
('gondemar','Gondemar','King of Burgundy, beaten and making off as fast as he could for safety, whom Clodomir’s pursuit forced to turn and fight.','Gondemar'),
('sertorius','Sertorius','One of the captains of the opinion that a soldier richly and sumptuously accoutred is the more inflamed with courage and the more obstinate in fight, having his arms, which are in a manner his whole inheritance, to defend.','Sertorius|Sertorious'),
('antiochus-iii','Antiochus','Who showed Hannibal the army he had raised, wonderfully splendid and rich in all sorts of equipage, and asked whether the Romans would be satisfied with it — satisfied, said Hannibal, yes doubtless, were their avarice never so great. Not the Antiochus whose fever Stratonice’s beauty gave him.'),
('vitellius','Vitellius','Who so nettled Otho’s soldiers with injurious language, reproaching them with cowardice and with the mistresses and entertainments they had left behind at Rome, that he inspired them with a resolution no exhortation had had the power to give them, and made them fall upon himself.','Vitellius'),
('levinus','Levinus','The consul against whom Pyrrhus fought in Italy on the day the king shrouded his person in Megacles’s armour.','Levinus'),
('megacles','Megacles','Whose armour Pyrrhus wore in that battle while Megacles wore the king’s own — which undoubtedly preserved Pyrrhus’s life and came very near losing him the battle, his men taking their leader for dead.','Megacles'),
('agis','Agis','With Agesilaus and the great Gilippus, one of the Spartans who fought obscurely armed, without any imperial attendance or distinction, where Alexander, Caesar and Lucullus loved to be known in a battle by rich accoutrements and armour of a particular lustre. The text gives him no other mark, and Sparta had more than one king of the name; this card claims no more than the text does.'),
('gilippus','Gilippus','The third of those Spartans, whom Montaigne calls that great Gilippus.','Gilippus'),
('clearchus','Clearchus','The Lacedaemonian who commanded the Greeks of Cyrus’s party in the unnatural battle between the two Persian brothers, and led them on softly and without precipitation until they came within fifty paces, and then hurried them full speed — hoping in so short a career to keep their order, husband their breath, and still give the advantage of impetuosity to their persons and their missile arms.','Clearchus'),
('cyrus-the-younger','Cyrus','The younger of the two Persian brothers of that unnatural battle, whose Greeks Clearchus led. Not the Cyrus who founded the Persian empire.'),
('agathocles','Agathocles','King of Syracuse, who found fortune favourable to him when he went over into Africa and left the war at home — where the Athenians, leaving the enemy in their own dominions to go over into Sicily, were not favoured in their design.','Agathocles'),
('timaeus','Timaeus','The speaker in Plato who says that we argue rashly and adventurously, by reason that our discourses, as well as ourselves, have great participation in the temerity of chance.','Timaeus'),
('marius-elder','Marius','Who with Sylla in the social war, having defeated the Marsians and seeing a body of reserve still coming on like enraged brutes prompted by despair, thought it not convenient to stand their charge. Not the young Marius who slept through his own rout.'),
]:add(*row)

# ============================== CHAPTER 48 — of war horses, or destriers
for row in [
('artybius','Artybius','General of the Persian army, whose horse was trained to rear and fall with mouth and heels on whoever fronted it. Fighting man to man with Onesilus, that training was the occasion of his death, for it gave Onesilus’s squire the chance to cleave the horse down between the shoulders with a scythe as it reared over his master.','Artybius'),
('onesilus','Onesilus','King of Salamis, whose squire did that.','Onesilus'),
('savoy-the-horse','Savoy','Charles VIII’s horse at Fornova, and the most beautiful horse Commines had ever seen. When the king was personally attacked with nobody near him but a small and ill-armed valet de chambre, Commines says it was having the best horse in the world under him that let him stand his ground until his men arrived at the critical minute.','','reference','animal'),
('commines','Commines','Philip de Commines, who was present at Fornova and whose narrative of the battle the editor’s bracketed note quotes for the king’s horse.','Philip de Commines|Philippe de Commines'),
('bucephalus','Bucephalus','Alexander’s horse, with a head inclining to the shape of a bull, who would suffer himself to be mounted and governed by none but his master, and was so honoured after his death as to have a city erected to his name.','Bucephalus','reference','animal'),
('trogus-pompeius','Trogus Pompeius','Who with Justin says the Parthians performed all offices and ceremonies on horseback, war and private business alike, made bargains, conferred and took the air so, and that the greatest distinction between their freemen and their slaves was that the one rode and the other went on foot.','Trogus Pompeius'),
('justin','Justin','Who says the same of the Parthians as Trogus Pompeius does.','Justin'),
('chrysanthes','Chrysanthes','Whose argument in Xenophon Montaigne sets aside: that a man on horseback stakes his own valour and fortune upon his horse’s, since the beast’s wounds bring his person into the same danger and its fear or fury will have him reputed rash or cowardly.','Chrysanthes'),
('pierre-pol','Maistre Pierre Pol','A doctor of divinity whom Monstrelet reports always to have ridden sideways through the streets of Paris on his mule, like a woman.','Maistre Pierre Pol'),
('monstrelet','Monstrelet','The chronicler who reports that, and who says the Gascons had terrible horses that would wheel at their full speed, which the French, Picards, Flemings and Brabanters looked on as a miracle, having never seen the like before.','Monstrelet'),
('alfonso-of-the-band','King Alfonso','He who first instituted the Order of the Band or Scarf in Spain, and gave the order this rule among others: that they should never ride mule or mulet, upon penalty of a mark of silver. The Essays do not identify him with the King Alfonso of the asses.'),
('guevara','Guevara','Whose Letters Montaigne had that rule of the Order of the Band out of, and whoever gave them the title of Golden Epistles had another kind of opinion of them than he has.','Guevara'),
('prester-john','Prester John','In whose presence the Abyssinians, contrary to the custom elsewhere, love the more to be mounted upon large mules the nearer they come, for the greatest dignity and grandeur.','Prester John'),
('metellus-crete','Metellus','Who besieged those of Crete, and reduced them to so great a necessity for drink that they were fain to quench their thirst with their horses’ urine.'),
('bajazet','Bajazet','Whose army in Russia was overwhelmed by so dreadful a tempest of snow that many killed and embowelled their horses to creep into their bellies for the vital heat; and who, after the furious battle in which Tamerlane overthrew him, was in a hopeful way of escaping on an Arabian mare, had he not been constrained to let her drink her fill at a ford, which made her so heavy that his pursuers easily overtook him.','Bajazet'),
('fabius-maximus-rullianus','Quintus Fabius Maximus Rullianus','Who, his horse having failed after three or four charges to break into the Samnite battalion, made them unbridle all their horses and spur their hardest, so that having nothing to check their career they opened a way through weapons and men for his foot, and gave the enemy a bloody defeat. Not the Q. Maximus who buried his consul son dry-eyed.','Quintus Fabius Maximus Rullianus'),
('fulvius-flaccus','Quintus Fulvius Flaccus','Who gave the same command against the Celtiberians.','Quintus Fulvius Flaccus'),
('carnavalet','Monsieur de Carnavalet','Of all the horsemen Montaigne ever saw, the most knowing in that art, with the best seat and the best method in breaking horses. He served King Henry II.','Monsieur de Carnavalet'),
]:add(*row)

# ===================================== CHAPTER 49 — of ancient customs
for row in [
('fabricius-luscinus','Fabricius','The Roman whose countenance and behaviour our people, seeing him neither clothed nor fashioned according to our mode, would look upon as barbarous — which Montaigne can pardon them, since it is a common vice to walk in the beaten road their ancestors trod. Not the bibliographer of the epitaph on Lucan.'),
('pasicles','Pasicles','Crates’s brother, the philosopher who, where the custom in petitioning a great man was to lay a hand on his knee, laid his upon another part; and when he was roughly repulsed for it, asked whether that part was not the man’s own as well as the other.','Pasicles'),
('sidonius-apollinaris','Sidonius Apollinaris','Who says the ancient Gauls wore their hair long before and shaved the hinder part of the head — a fashion, Montaigne notes, that begins to revive in this vicious and effeminate age.','Sidonius Apollinaris'),
('nicomedes','Nicomedes','The king whose bed the Romans called Caesar, the women using to lie on the side of the bed next the wall.'),
('janus','Janus','The god Persius addresses as the one at whose back no crooked fingers simulate a stork, no quick hands imitate the white ears of an ass, and no mocking tongue is thrust out as the tongue of the thirsty Apulian dog.','Janus','reference','deity'),
]:add(*row)

# ============================ CHAPTER 50 — of Democritus and Heraclitus
for row in [
('timon','Timon','Surnamed the Man-hater: an enemy to all mankind, who passionately desired our ruin and avoided our conversation as dangerous. Montaigne makes him a duller judge than Diogenes, who valued us so little that we could neither trouble nor infect him — for what a man hates he lays to heart.'),
('statilius','Statilius','Who answered Brutus, courting him into the conspiracy against Caesar, that he was satisfied the enterprise was just, but did not think mankind worthy of a wise man’s concern.','Statilius'),
('marcus-brutus','Brutus','The Brutus who courted Statilius into the conspiracy against Caesar.'),
]:add(*row)


# =================================== CHAPTER 51 — of the vanity of words
for row in [
('lentulus','Lentulus','One of the six Romans Montaigne names as having taken their chiefest spring from eloquence, and mounted by it to authority — making it of greater use to them than arms, contrary to the opinion of better times.','Lentulus'),
('volumnius','L. Volumnius','Who spoke publicly for the election of Q. Fabius and Publius Decius to the consulship: men born for war and great in execution, in the combat of the tongue altogether wanting, spirits truly consular — the subtle and eloquent being good only for the city, to make praetors of.','L. Volumnius'),
('decius','Publius Decius','The other of the two men Volumnius commended for being no orators.','Pub. Decius|Publius Decius'),
('cardinal-caraffa','Cardinal Caraffa','Whose clerk of the kitchen, taken into Montaigne’s service after his master’s death, discoursed of the palate-science with such settled gravity, and in such lofty and magnificent words, as men use when they talk of the government of an empire.','Cardinal Caraffa'),
('apollidon','Apollidon','Whose palace is what Montaigne’s imagination is possessed with when he hears architects thunder out their pilasters, architraves and cornices — until he finds that what they are naming is the paltry woodwork of his own kitchen door.','Apollidon','reference','literary-figure'),
('demea','Demea','The man addressed in the lines from Terence that Montaigne’s kitchen-clerk brought to his mind: this is too salt, that is burnt, remember to do so another time — and last of all, look into every dish as if it were a mirror.','Demea','reference','literary-figure'),
('aretin','Aretin','On whom the Italians have lately bestowed the surname of Divine, which Plato carried by so universal a consent that nobody ever repined at it. Montaigne finds in him nothing above the ordinary writers of his time but tumid phrases set out with smart periods, ingenious and far-fetched, and no approach at all to the ancient divinity. The modern edition prints his name Aretino.','Aretin|Aretino'),
]:add(*row)

# ============================= CHAPTER 52 — of the parsimony of the ancients
for row in [
('attilius-regulus','Attilius Regulus','General of the Roman army in Africa, who in the height of his glory over the Carthaginians wrote home that the hind he had left in charge of his seven acres had run off with the instruments of husbandry, and asked leave to come and see to it lest his wife and children suffer — whereupon the Senate appointed another to manage his affairs, made his losses good, and maintained his family at the public charge. Montaigne finds more evidence of fortitude in his suffering the chain he was tied to than in Cato’s breaking it.','Attilius Regulus'),
]:add(*row)

# ====================================== CHAPTER 54 — of vain subtleties
for row in [
('sancho-xii','Sancho XII','King of Navarre, surnamed Trembling. Being armed for a fight and shaking, and being told by way of comfort that the danger was less than he thought: you understand me ill, he said — could my flesh know the danger my courage will presently carry it into, it would sink to the ground.','Sancho XII'),
]:add(*row)

# ============================================= CHAPTER 55 — of smells
for row in [
('coracinus','Coracinus','The man Martial answers in the epigram Montaigne quotes: you laugh at us because we are not scented; I would rather not smell at all than smell well.','Coracinus','reference','literary-figure'),
('posthumus','Posthumus','The man of the other epigram: he who ever smells well does not smell well.','Posthumus','reference','literary-figure'),
]:add(*row)

# ============================================ CHAPTER 56 — of prayers
for row in [
('king-david','King David','With whose holy and divine Psalms the Holy Ghost inspired him, and whose promiscuous and irreverent use Montaigne thinks the Church does well to interdict: that poesy is too holy to be put to the exercising of the lungs.','King David'),
('theodosius','Theodosius','The emperor whom an adviser told that disputation did not rock the schisms of the Church asleep but roused and animated heresies, and that men should acquiesce in the formulas of faith the ancients had established.','Theodosius'),
('andronicus','Andronicus','The emperor who, overhearing some great men at high words in his palace with Lapodius about a point of theology, checked them so severely as to threaten to have them thrown into the river if they did not desist.','Andronicus'),
('lapodius','Lapodius','The man they were at high words with.','Lapodius'),
('st-chrysostom','St Chrysostom','Who says that philosophy has long been banished the holy schools as a handmaid altogether useless, and thought unworthy to look so much as in passing by the door into the sanctuary of the celestial doctrine.','St. Chrysostom'),
('staius','Staius','The man Persius tells you to address the prayer to, if you dare: say to Staius what you whisper into Jupiter’s ear, and see whether Jupiter himself would not cry out upon it.','Staius','reference','literary-figure'),
('marguerite-navarre','Marguerite, Queen of Navarre','Not the Margaret de Valois to whom the Apology is addressed. Who tells of a young prince — easily enough known by his great qualities, though she does not name him — who on his way to an amorous assignation always knelt to pray in the church he passed through, and instances it for a testimony of singular devotion. Which is not the only proof, Montaigne says, that women are not very fit to treat of theological affairs.','Marguerite'),
('laverna','Laverna','The goddess of thieves, to whom the man in Horace prays under his breath after saying Apollo out loud: grant me the talent to deceive, grant me to appear holy and just, shroud my sins with night.','Laverna','reference','deity'),
]:add(*row)

# ============================================== CHAPTER 57 — of age
for row in [
('servius-tullius','Servius Tullius','Who superseded the knights above seven-and-forty years of age from the fatigues of war, where Augustus dismissed them at forty-five.','Servius Tullius'),
]:add(*row)

# =========================== CHAPTER 58 — of the inconstancy of our actions
for row in [
('boniface-viii','Pope Boniface VIII','Who entered into his Papacy like a fox, it is said, behaved himself in it like a lion, and died like a dog.','Pope Boniface VIII|Boniface VIII'),
('lucretia','Lucretia','The Roman whom the maid of Montaigne’s neighbourhood appeared another of, having thrown herself from a window and then at her own throat to escape a soldier — until Montaigne was very well assured that both before and after she was not so difficult a piece.','Lucretia'),
('mahomet','Mahomet','Who so furiously rated Chasan for having let the Hungarians break into his squadrons, and behaved ill himself in the business.','Mahomet'),
('chasan','Chasan','Bassa of the Janissaries, who instead of any other answer to that rating rushed alone, scimitar in hand, into the first body of the enemy, and was presently cut to pieces — not so much natural valour, Montaigne thinks, as a sudden despite.','Chasan'),
('clytus','Clytus','Whose murder Alexander’s excess of penitence for is one of Montaigne’s testimonies to the unevenness of that great courage.','Clytus'),
('talebot','Talebot','Whose motto, "Avau le dent," Montaigne borrows for the man who runs before the wind because the variety of occurrences makes him alter his path.','Talebot'),
]:add(*row)

# ========================================= CHAPTER 59 — of drunkenness
for row in [
('josephus','Josephus','Who wormed an ambassador’s secrets out of him by giving him his full dose of liquor; who, a whole people being violently bent against him and no visible means of escape left, was counselled by a friend to despatch himself and did well to keep his hope instead, fortune diverting the accident beyond all human expectation; and in whom Montaigne read of the child torn piecemeal with pincers who defied Antiochus.','Josephus'),
('lucius-piso','Lucius Piso','Who conquered Thrace, and to whom Augustus committed the most inward secrets of his affairs and never found him faulty in the least — though he was so given to drink that they were often fain to carry him drunk out of the Senate.','Lucius Piso'),
('tiberius-emperor','Tiberius','The emperor, who trusted his whole counsels to Cossus as Augustus did his to Lucius Piso, and with as little cause for complaint. In his reign the condemned who would live to be executed forfeited their goods and were denied the rites of sepulture, while those who anticipated it by killing themselves were interred and could dispose of their estates by will. The older edition misprints his name Tiberias. At 79:1 he is Tiberius Nero, before the adoption, and the emperor Nero’s alias was taking the second half of that name.','Tiberius Nero'),
('cossus','Cossus','The man he trusted them to, who was as hard a drinker as Piso.','Cossus'),
('cimber','Cimber','To whom the design of killing Caesar was as safely communicated as to Cassius, though he would often be drunk.','Cimber'),
('cassius-conspirator','Cassius','Who drank nothing but water, and pleasantly said: what, shall I bear a tyrant, I who cannot bear wine? With Brutus he threw away the remains of the Roman liberty, of which the two of them were the sole protectors, by killing himself before the due time and a just occasion.'),
('attalus','Attalus','Who, to put a notable affront upon Pausanias, invited him to supper and made him drink to such a pitch that he could afterwards abandon his beauty, as of a hedge strumpet, to the muleteers and servants of the basest office in the house.','Attalus'),
('pausanias-assassin','Pausanias','Who suffered that affront at Attalus’s supper, and upon the very same occasion afterwards killed Philip of Macedon. Not the Pausanias of Sparta, nor the Pausanias who beat Mardonius at Plataea.'),
('cornelius-gallus-poet','Cornelius Gallus','The Latin elegist, quoted for the line that in this trial of power the great Socrates deserved the palm. The older edition abbreviates him Cornet. Gallus, which is a misprint; the modern edition prints the name in full, where it collides with the Cornelius Gallus of 19:24, a proctor and another man.'),
('artaxerxes','Artaxerxes','The brother before whom the younger Cyrus claimed to be preferred, urging among his other excellences that he could drink a great deal more than he.'),
('silvius','Silvius','An excellent physician of Paris, who said that lest the digestive faculties of the stomach should grow idle it were not amiss once a month to rouse them by this excess, and spur them lest they grow dull and rusty.','Silvius'),
('brutus-consul','Brutus','The Brutus who killed his own children, and over whom Plutarch — seeing him and Torquatus do it — begins to doubt whether virtue could proceed so far, and to question whether they had not rather been stimulated by some other passion.'),
('torquatus','Torquatus','The other of that pair, whose killing of his own son Plutarch doubts along with Brutus’s.','Torquatus'),
('metrodorus','Metrodorus','Whose rhodomontade Montaigne quotes from the sect reputed the quietest and gentlest: Fortune, I have got the better of thee, and have made all thy avenues so sure thou canst not come at me.','Metrodorus'),
('anaxarchus','Anaxarchus','Who, put into a stone mortar by command of Nicocreon and laid upon with mauls of iron, did not cease to say: strike, batter, break — it is not Anaxarchus, it is but his sheath that you pound and bray so.','Anaxarchus'),
('nicocreon','Nicocreon','The tyrant of Cyprus who gave that command.','Nicocreon'),
('antiochus-iv','Antiochus','The tyrant whom the child in Josephus defied while being torn piecemeal with pincers: thou losest thy labour, I am still at ease; my constancy torments thee more than thy cruelty does me. Neither the Antiochus of Stratonice’s beauty nor the one who showed Hannibal his splendid army.'),
('sextius','Sextius','Who says he had rather be fettered with affliction than with pleasure.','Sextius'),
]:add(*row)

# ================================ CHAPTER 60 — a custom of the isle of Cea
for row in [
('damidas','Damidas','To whom someone said that the Lacedaemonians were likely to suffer much if they did not reconcile themselves to Philip in time: why, you pitiful fellow, he replied, what can they suffer who do not fear to die?','Damidas'),
('agis-on-freedom','Agis','The Spartan asked which way a man might live free, who answered: by despising death. The Essays do not identify him with the Agis who fought obscurely armed, and give neither of them a numeral.'),
('boiocalus','Boiocalus','Who answered the Romans, as Montaigne has it, that an occasion sufficient to die upon can never be wanting.','Boiocalus'),
('therykion','Therykion','Who tried to persuade Cleomenes to despatch himself after the battle he had lost, rather than give the conquerors leisure to make him undergo an ignominious death or an infamous life — and, his counsel being rejected as unmanly and mean, went and did his own business.','Therykion'),
('cleomenes-therykion','Cleomenes','Who rejected that counsel with a courage truly Stoic and Lacedaemonian: it is a remedy that can never be wanting, but which a man is never to use whilst there is an inch of hope remaining; it is sometimes constancy and valour to live. He did the same thing in the end, but not till he had first tried the utmost malevolence of fortune. The Essays do not identify him with either of the other two Spartans of the name.'),
('pentadius','Pentadius','Cited for the line that the gladiator conquered in the lists hopes on, though the spectators turn their thumbs and order him to die.','Pentadius'),
('democritus-aetolian','Democritus','General of the AEtolians, brought prisoner to Rome, who escaped by night and, closely pursued by his keepers, fell upon his own sword rather than be retaken. Not the philosopher of Abdera.'),
('antinous','Antinous','Who with Theodotus, their city of Epirus being reduced by the Romans to the last extremity, counselled the people to kill themselves universally — and, the people preferring to give themselves up, went with his colleague to seek the death they desired, rushing on the enemy with intention to strike home but not to ward a blow.','Antinous'),
('theodotus','Theodotus','The other of the two chiefs of Epirus who did that.','Theodotus'),
('scribonia','Scribonia','Who advised her nephew Libo to kill himself rather than await the stroke of justice: to preserve his life was to do other people’s business, since within three or four days they would fetch him to execution, and to keep his blood was to serve his enemies’ malice.','Scribonia'),
('libo','Libo','The nephew she advised.','Libo'),
('nicanor','Nicanor','The persecutor of the law of God who sent his soldiers to seize Razis.','Nicanor'),
('razis','Razis','Surnamed in honour of his virtue the father of the Jews. His gates burned down and the enemy ready to seize him, he stabbed himself; the blow not going home, he threw himself headlong from a wall among them; and feeling still some remains of life, started up all bloody, made his way to a precipitous rock, drew his bowels out through one of his wounds and threw them among his pursuers, invoking the divine vengeance on their cruelty.','Razis'),
('pelagia','Pelagia','Canonised, who precipitated herself with her mother and sisters into the river to avoid being forced by some soldiers.','Pelagia'),
('sophronia','Sophronia','Canonised with her, who killed herself to avoid being ravished by the Emperor Maxentius.','Sophronia'),
('maxentius','Maxentius','The emperor she killed herself to escape.','Maxentius'),
('marot','Marot','The good Marot, whose rule Montaigne says our air is well purged by: a sweet no, with a sweet smile, is so very honest.','Marot'),
('lucius-aruntius','Lucius Aruntius','Who killed himself to fly, he said, both the future and the past.','Lucius Aruntius'),
('granius-silvanus','Granius Silvanus','Who with Statius Proximus, having been pardoned by Nero, killed himself all the same — either disdaining to live by the favour of so wicked a man, or not caring to be troubled another time to obtain a second pardon.','Granius Silvanus'),
('statius-proximus','Statius Proximus','The other of the two pardoned men who did that.','Statius Proximus'),
('spargapises','Spargapises','Son of Queen Tomyris, and a prisoner of war to Cyrus, who used the first favour Cyrus showed him — an order to unbind him — to kill himself, having pretended to no other benefit of liberty than to be revenged on himself for the disgrace of being taken.','Spargapises'),
('tomyris','Queen Tomyris','His mother.','Queen Tomyris|Tomyris'),
('boges','Boges','Governor in Eion for Xerxes. Besieged by Cimon and offered a safe return into Asia with all his wealth, he was too impatient of surviving the loss of a place his master had given him to keep: he defended the city to the last crust, threw the gold into the Strymon, cut the throats of all the women, children, concubines and servants and threw them on a pile he had set burning, and leapt into it himself.','Boges'),
('ninachetuen','Ninachetuen','An Indian lord who, hearing the first whisper that the Portuguese Viceroy meant to take his command in Malacca from him without apparent cause and give it to the King of Campar, built a scaffold hung with tapestry and strewn with flowers, came out in cloth of gold set with jewels, set out from it how much he had obliged the Portuguese nation and with how unspotted a fidelity, said that fortune denying him all means of opposing the affront his courage at least enjoined him to free himself from the sense of it, and leapt into the fire he had lighted at one corner.','Ninachetuen'),
('sextilia','Sextilia','Wife of Scaurus, who with Paxaea voluntarily sacrificed her own life to encourage her husband to avoid the dangers pressing upon him, in which she had no other share than conjugal affection.','Sextilia'),
('scaurus','Scaurus','Sextilia’s husband, who with Labeo was pressed by dangers their wives had no share in but conjugal affection. Keyed rather than aliased, because the Scaurus of Tacitus’s pair of self-biographers at 74:7 is another man.','',),
('paxaea','Paxaea','Wife of Labeo, who did the same for him.','Paxaea'),
('labeo','Labeo','Her husband.','Labeo'),
('cocceius-nerva','Cocceius Nerva','A great lawyer, flourishing in health, riches, reputation and favour with the emperor, who killed himself for no other cause than the sole compassion of the miserable state of the Roman Republic — doing for his country, with less utility though with equal affection, what Sextilia and Paxaea did for their husbands.','Cocceius Nerva'),
('fulvius-favourite','Fulvius','A familiar favourite of Augustus, who vented an important secret entrusted to him, was received coldly and frowned upon one morning, and came home resolved to kill himself — to which his wife roundly replied that it was but reason he should, seeing he had so often experienced the incontinence of her tongue and would not take warning, but that she would kill herself first, and ran herself through the body with a sword without any more saying.'),
('vibius-virrius','Vibius Virrius','Who told the senate of his besieged city that the noblest means of escaping fortune was by their own hands, and invited those who approved to a good supper with a beverage prepared after it. Seven-and-twenty senators followed him; the vapour of the wine deferred the poison so long that some of them were within an hour of seeing the enemy inside the walls of Capua.','Vibius Virrius'),
('jubellius-taurea','Jubellius Taurea','Who called the Consul Fulvius back by name after the butchery of two hundred and twenty-five senators and asked him to give the word for his own despatch, that he might boast of having killed a much more valiant man than himself; and when the consul disdained him as a man out of his wits, ran a concealed short sword through his own bosom and expired at his feet.','Jubellius Taurea|Jubellius'),
('fulvius-consul','The Consul Fulvius','Who made that butchery, and whose hands were tied by letters from Rome censuring the inhumanity of his execution.'),
('cleombrotus','Cleombrotus of Ambracia','Who, having read Plato’s Phaedo, entered into so great a desire of the life to come that without any other occasion he threw himself into the sea — which is why Montaigne says we call this voluntary dissolution despair improperly, the eagerness of hope often inclining us to it.','Cleombrotus of Ambracia'),
('jacques-du-chastel','Jacques du Chastel','Bishop of Soissons, who in St Louis’s foreign expedition, seeing the king and the whole army on the point of returning into France and leaving the affairs of religion imperfect, took a resolution rather to go into Paradise: he took solemn leave of his friends and charged alone, in the sight of everyone, into the enemy’s army, where he was presently cut to pieces.','Jacques du Chastel'),
('st-paul','St Paul','The apostle, quoted for: I desire to be with Christ, and who shall rid me of these bands? The St Paul of 17:2 is a town in the Low Countries and not the apostle.'),
]:add(*row)


# ================================= CHAPTER 61 — to-morrow's a new day
for row in [
('rusticus','Rusticus','Who, present at a declamation of Plutarch’s at Rome, received a packet from the emperor and deferred opening it till the whole was done, for which the company highly applauded his gravity. Montaigne allows him the civility of not interrupting the declamation, but doubts whether anyone can commend his prudence: deferring an emperor’s letters might have cost him dear.','Rusticus'),
('boutieres','Monsieur de Boutieres','Who had like to have lost Turin from delaying, while engaged in good company at supper, to read the information sent him of the treason plotted against the city he commanded. The modern edition spells him Boutières.','Monsieur de Boutieres|Monsieur de Boutières'),
('archias-thebes','Archias','The tyrant of Thebes, who the night before Pelopidas’s plot against his life had the whole conspiracy sent him in writing by another Archias, an Athenian, and deferred opening the packet because he was at supper — saying what afterwards turned to a proverb in Greece: business to-morrow.'),
('archias-athenian','Archias','The Athenian who sent him that warning.'),
]:add(*row)

# ========================================== CHAPTER 62 — of conscience
for row in [
('la-brousse','The Sieur de la Brousse','Montaigne’s brother, travelling with him one day during the civil wars when they met the gentleman whose half-dead fear at every passing horse Montaigne at last discovered to be alarms of conscience.','The Sieur de la Brousse'),
('bessus','Bessus','The Paeonian, reproached for pulling down a nest of young sparrows and killing them, who replied that he had reason, seeing those little birds never ceased falsely to accuse him of the murder of his father — and so gave up a parricide that had till then been unknown.','Bessus'),
('hesiod','Hesiod','Who corrects Plato’s saying that punishment closely follows sin: it is, Hesiod says, born at the same time with it.','Hesiod'),
('apollodorus-dreamer','Apollodorus','Who dreamed that he saw himself flayed by the Scythians and afterwards boiled in a cauldron, and that his heart muttered: I am the cause of all these mischiefs that have befallen thee. Not the Apollodorus who said Chrysippus’s writings would be blank paper without their borrowings.'),
('petilius','Petilius','Whom Cato set on to demand an account of the money that had passed through Scipio’s hands in the province of Antioch.','Petilius'),
('philotas','Philotas','Whom Montaigne places among the thousands who have charged their own heads by false confession, considering the circumstances of the trial Alexander put upon him and the progress of his torture.','Philotas'),
]:add(*row)

# ======================================= CHAPTER 63 — use makes perfect
for row in [
('julius-canus','Julius Canus','A noble Roman condemned to die by Caligula who, going to the stroke, was asked by a philosopher friend what his soul was doing, and answered that he was keeping his mind settled and fixed to try whether in that short and quick instant he could perceive the motion of the soul as she parted from the body — and come back, if he could, to tell his friends of it.','Julius Canus'),
('hortensius','Hortensius','The orator whose eloquence Montaigne asks why Cicero does not prefer to his own, if it is vainglory for a man to publish his own virtues — and why Hortensius does not prefer Cicero’s.','Hortensius'),
('pluto','Pluto','The god to whom Iris says she offers the lock of hair, in the line from the AEneid Montaigne quotes for the gods the poets feign to favour the deliverance of those who suffer a languishing death.','Pluto','reference','deity'),
]:add(*row)

# ====================== CHAPTER 65 — of the affection of fathers to their children
for row in [
('madame-destissac','Madame D’Estissac','The dedicatee of the chapter on the affection of fathers to their children, and a widow young enough that everyone who knows at what age her husband left her, and the offers made to her, can see how well she has employed her widowhood.',"Madame D’Estissac|Madame d'Estissac"),
('monsieur-destissac-husband','Monsieur D’Estissac','Her husband, who left her a widow young.'),
('monsieur-destissac-son','Monsieur D’Estissac','Her son, whose great hopes of himself render the account of her widowhood sufficient.'),
('muley-hassam','Muley Hassam','King of Tunis, whom the Emperor Charles restored, and Montaigne’s instance in that chapter. The modern edition spells him Hassan.','Muley Hassam|Muley Hassan'),
('iccus','Iccus','The Tarentine, of whom the Greek history observes, with Chryso, Astyllus and Diopompos, that to keep their bodies in order for the Olympic games they abstained from all acts of love.','Iccus'),
('chryso','Chryso','The second of those four athletes.','Chryso'),
('astyllus','Astyllus','The third of them.','Astyllus'),
('diopompos','Diopompos','The fourth.','Diopompos'),
('minos','Minos','With Lycurgus and Solon, one of the lawgivers whom Plato says their immortal children — the issue of the understanding rather than of the body — immortalise and deify.','Minos'),
('heliodorus','Heliodorus','That good bishop of Trikka, who rather chose to lose the dignity, profit and devotion of so venerable a prelacy than to lose his daughter — a daughter, Montaigne adds, a little too curiously tricked and too amorous for an ecclesiastical one.','Heliodorus'),
('labienus-orator','Labienus','A man of great worth and authority at Rome, excellent in all sorts of literature, whose enemies prosecuted his published books before the magistrates and got them condemned to the fire. In him began the new punishment of putting writings to death, and he could not survive the loss: he had himself carried into his ancestors’ monument and walled up there alive.'),
('labienus-father','Labienus','That great Labienus, the chief of Caesar’s captains in the wars of Gaul, who afterwards sided with Pompey the Great and maintained his cause valiantly until Caesar defeated him in Spain. Montaigne takes the orator to be his son.'),
('cremutius-cordus','Cremutius Cordus','To whom the like accident befell: accused of having praised Brutus and Cassius in his books, he was condemned with them and starved himself to death.','Cremutius Cordus'),
('phidias','Phidias','The sculptor. Montaigne makes a great question whether he, or any other excellent sculptor, would be so solicitous of the preservation of his natural children as of a supremely beautiful statue finished with long study and care.','Phidias'),
('pygmalion','Pygmalion','Who, having made the statue of a woman of singular beauty, fell so desperately in love with his own work that the gods had to bring it to life for him — Montaigne’s instance of that other sort of parentage.','Pygmalion','reference','mythological-figure'),
]:add(*row)

# =============================== CHAPTER 66 — of the arms of the Parthians
for row in [
('caracalla','Caracalla','The emperor who was wont to march on foot, completely armed, at the head of his troops.','Caracalla'),
('alcimus','Alcimus','A captain of the greatest note and authority about Demetrius, for whom, with himself, Demetrius had two complete suits of armour made of six score pounds weight each, where the ordinary suits weighed half as much.','Alcimus'),
]:add(*row)

# =========================================== CHAPTER 67 — of books
for row in [
('johannes-secundus','Johannes Secundus','Whose Basia, with the Decameron and Rabelais, Montaigne reckons among the books worth reading for amusement — if, he adds, they may be ranged under that title.','Johannes Secundus'),
('cicero-the-younger','The younger Cicero','Who resembled his father in nothing but the name. Commanding in Asia, he had Cestius at the lower end of his table, was told who the man was, and had him whipped on the spot — a proceeding, Montaigne notes, of a host and a judge at once.','The younger Cicero'),
('cestius','Cestius','Who intruded on the great man’s open table, was pointed out to the younger Cicero as one who made no more account of the father’s eloquence than of his own, and was seized and whipped for it.','Cestius'),
('asinius-pollio','Asinius Pollio','Who found mistakes in Caesar’s own histories, into which Caesar had fallen either because he could not have his eye in all parts of his army at once, or because he trusted the particular reports of others.','Asinius Pollio'),
('bodin','Bodin','Who has sufficiently handled the question Montaigne leaves aside there, and with whose sentiment Montaigne agrees.','Bodin'),
('eginhard','Eginhard','Chancellor to Charlemagne, and with the Sire de Joinville and Philip de Commines one of the elder historians in whom the freedom and liberty of writing shines — by comparison with which Montaigne finds a manifest decadence in the two lords of his own subject.','Eginhard'),
('biron','Biron','Whose proceedings, with Monsieur de Montmorency’s, are among the things Montaigne complains are omitted from the memoirs he is discussing — as are actions that did not succeed, and speeches and countenances the writer durst not report.','Biron'),
]:add(*row)

# ========================================== CHAPTER 68 — of cruelty
for row in [
('philemon','Philemon','Julius Caesar’s secretary, who had attempted to poison him, and whom Caesar punished with no greater severity than a simple death — which Montaigne gives among the testimonies to that clemency.','Philemon'),
('euphorbus','Euphorbus','Son of Pantheus, and the man Pythagoras remembered having been in the days of the Trojan war, in the line from the Metamorphoses that the editor glosses with a reference to Diogenes Laertius.','Euphorbus','reference','mythological-figure'),
('pantheus','Pantheus','Euphorbus’s father, named in the gloss on the line from the Metamorphoses. The modern edition prints him Panthus.','Pantheus|Panthus'),
('cupid','Cupid','The god over whose torch and shafts Diana triumphs, in the verses Montaigne quotes.','Cupid','reference','deity'),
('diogenes-laertius','Diogenes Laertius','The biographer of the philosophers, whose Life of Pythagoras the editor’s note sends the reader to for the transmigration through Euphorbus. Not Diogenes the Cynic, nor Diogenes the Atheist.','Diogenes Laertius'),
]:add(*row)


# ------------------------------------------------ found by the table audit
for row in [
('metellus-numidicus','Metellus','Who alone of all the Roman senators attempted, by the power of virtue, to withstand the violence of Saturninus — and who, told that to do ill was easy and to do well where there was no danger common, answered that to do well where there was danger was the proper office of a man of virtue. Montaigne makes his the type of the exotic difficulty that virtue seeks out.'),
('saturninus','Saturninus','The tribune whose violence Metellus alone withstood.'),
('artaxerxes-lawgiver','Artaxerxes','Who moderated the severity of the ancient laws of Persia, ordaining that the nobility who had failed in their duty should be laid on the ground and their clothes beaten instead of their bodies. The Essays do not identify him with the Artaxerxes whose brother claimed to outdrink him.'),
]:add(*row)


# ======================= CHAPTER 69 — apology for Raimond Sebond
# The longest chapter in the book, 660 paragraphs, and the one that cites most
# widely: almost every philosopher of antiquity is named in it somewhere.
for row in [
('raimond-sebond','Raimond Sebond','The Spaniard, practising physic at Toulouse two hundred years before, whose Theologia naturalis Peter Bunel gave Montaigne’s father and Montaigne translated at his father’s command. He undertakes to establish every article of the Christian religion against the atheists by human and natural reason, and Montaigne, who thinks nobody has done better on that subject, gives the whole chapter to answering the two objections made to him. The older edition prints his name Sehond once, and the Latin title has him as Raimondi de Sebonde.','Sebond|Sebonde|Sehond|Raimondi de Sebonde','central'),
('peter-bunel','Peter Bunel','A man of great reputation for knowledge in his time, who stayed some days at Montaigne in the father’s company and at his departure presented him with Sebond’s book — wisely, Montaigne thinks, foreseeing that the new doctrines would run into an execrable atheism.','Peter Bunel'),
('luther','Luther','Whose novel doctrines were beginning to be in vogue, and in many places to stagger the ancient belief, when Bunel gave the book.','Luther'),
('herillus','Herillus','The philosopher who placed the sovereign good in learning, and maintained that it was only in her to render us wise and contented — which Montaigne does not believe.','Herillus'),
('orpheus','Orpheus','In whose mysteries Antisthenes was being initiated when the priest told him that those who professed that religion were certain of perfect and eternal felicity after death, and was asked why, believing it, he did not die himself.','Orpheus'),
('apollonius-tyanaus','Apollonius Tyanaus','With Melampus, Tiresias and Thales, one of those who have boasted that they understood the speech of beasts.','Apollonius Tyanaus|Apollonius of Tyana'),
('melampus','Melampus','The second of them.','Melampus'),
('tiresias','Tiresias','The third.','Tiresias'),
('lactantius','Lactantius','Who seems to attribute to beasts not only speech but laughter, and who with Seneca and most of the Dogmatists confessed that the soul was a thing they did not understand. The older edition misprints him Lactantms at 74:156.','Lactantius|Lactantms'),
('king-porus','King Porus','Whose elephant, Montaigne’s instance among the beasts that physic themselves, drew the darts and javelins out of its own body and out of its master’s. Alexander defeated him.','King Porus'),
('trapezuntius','Trapezuntius','The logician from whom the dog does not need to learn the use of propositions divided and conjoined, since he uses them of himself.','Trapezuntius'),
('vespasian','Vespasian','The emperor in whose company at the theatre of Marcellus Plutarch says he saw the dog that counterfeited death.','Vespasian'),
('arrian','Arrian','Who reports the elephant with a cymbal hung at each leg and another on his trunk, at whose sound the others danced round about him, rising and bending at certain cadences.','Arrian'),
('juba','Juba','A king of their nation, who relates of the elephants that they pull the darts out of one another.','Juba'),
('androdus','Androdus','The runaway slave who drew a thorn from a lion’s foot in an African cave and lived with the beast three years on the game it brought him; and who, condemned long afterwards to the beasts at Rome, was recognised by that same lion and spared, and afterwards led him about the taverns on a small leash while the people threw flowers on him.','Androdus'),
('apion','Apion','Who says he saw that, and tells the story of Androdus and the lion.','Apion'),
('surena','Surena','Against whom the same fine arms served that Sertorius was beaten with in Spain and Eumenes used against Antigonus — and who used them against Crassus.','Surena'),
('epictetus','Epictetus','Who says that man has nothing properly his own but the use of his opinion.','Epictetus'),
('memmius','Memmius','The great Memmius whom Lucretius addresses in the verses on the god who first found out the reason now called wisdom. The older edition prints the name Memmus; the Latin vocative Memmi of the quotation is left unbound like every other inflection.','Memmus|Memmius'),
('eusebius','Eusebius','Whose Chronicon Montaigne cites for the account of the philosopher whose order afforded him only a few lucid intervals, in which he composed his book, and who at last killed himself.','Eusebius'),
('dionysius-heracleotes','Dionysius Heracleotes','Who, afflicted with a vehement smarting in his eyes, was reduced to quit his Stoical resolutions.','Dionysius Heracleotes'),
('crantor','Crantor','Who had very good reason, Montaigne thinks, to controvert the insensibility of Epicurus, if it were founded so deep that the first attack and birth of evils were not to be perceived.','Crantor'),
('thrasylaus','Thrasylaus','The son of Pythodorus, who made himself believe that all the ships weighing anchor from the Piraeus and coming into the haven made their voyages only for his profit — and who was very sorry when his brother cured him of it.','Thrasylaus'),
('pythodorus','Pythodorus','His father.','Pythodorus'),
('tyrtaeus','Tyrtaeus','The poet upon whose saying Chrysippus alleged what Montaigne quotes.','Tyrtæus|Tyrtaeus'),
('valentinian','Valentinian','A professed enemy to all learning and letters, and with Licinius one of the two Roman emperors who called them the poison and pest of all political government. Montaigne says he is swayed by neither.','Valentinian'),
('licinius','Licinius','The other of them.','Licinius'),
('velleius','Velleius','Who reproaches Cotta and Cicero with having learned of Philo that they had learned nothing.','Velleius'),
('philo','Philo','From whom they had learned it.','Philo'),
('pherecydes','Pherecydes','One of the seven sages, who wrote to Thales on his death-bed to have his books given to his friends, and to be buried if they approved them; and, on Cicero’s testimony, the first to introduce the immortality of the soul, in the time of King Tullus. The older edition calls him Syrius where the modern says of Syros — the epithet, not another man, though the sentence is broken across the paragraph boundary at 69:468 and reads like one.','Pherecydes|Pherecides|Syrius'),
('clitomachus','Clitomachus','Who with Carneades and the Academics despaired in the search for truth, and concluded that it could not be conceived by our understandings.','Clitomachus'),
('anaximander','Anaximander','Who held that the gods were always dying and entering into life again; and, with Hesiod, that the soul was a thing composed of earth and water.','Anaximander'),
('parmenides','Parmenides','Who made God a circle surrounding the heaven and supporting the world by the ardour of light; and who, alone of all the philosophers before Heraclitus, would not allow things to have motion.','Parmenides'),
('theophrastus','Theophrastus','Who says the ears are the most dangerous instruments about us for receiving violent impressions, and who attributes to Nicetas of Syracuse the opinion that it is the earth that moves.','Theophrastus'),
('diogenes-apolloniates','Diogenes Apolloniates','Who held that God is air. Not the Cynic, nor the Atheist, nor the biographer.','Diogenes Apolloniates|Diogenes of Apollonia'),
('isis','Isis','With Serapis, one of the gods the Egyptians forbade anyone, on pain of hanging, to say had formerly been men.','Isis','reference','deity'),
('serapis','Serapis','The other of them — and the god in whose arms Paulina thought she lay when she was in her lover’s, through the panderism of the priests of his temple.','Serapis','reference','deity'),
('tiberius-sempronius','Tiberius Sempronius','Who burnt the rich spoils and arms he had gained from the enemy in Sardinia as a sacrifice to Vulcan, Montaigne’s first instance of flattering divine justice with the ruin of the things it made.','Tiberius Sempronius'),
('zamolxis','Zamolxis','The god of the Getae, who hold themselves immortal and their death nothing but a journey to him; and, at 73:90, the legislator of the Scythians, who gave out his laws under the name of Vesta. The older edition spells him Xamolxis there.','Zamolxis|Xamolxis','reference','deity'),
('amestris','Amestris','Xerxes’s mother, who being grown old caused fourteen young men of the best families of Persia to be buried alive at once, according to the religion of the country, to gratify some infernal deity.','Amestris'),
('trismegistus','Trismegistus','Whom Montaigne bids us hear in praise of our sufficiency, as the extreme of the presumption he is putting down.','Trismegistus'),
('paulina','Paulina','The wife of Saturninus, a matron of great reputation at Rome, who thought she lay with the god Serapis and found herself in the arms of an amoroso of hers.','Paulina'),
('saturninus-husband','Saturninus','Paulina’s husband. Not the tribune whose violence Metellus withstood. The older edition misprints the name Satuminus.'),
('taruncius','Taruncius','The rich young man who won the temple-servant’s wench at dice from Hercules, took her home, and in time left her his inheritrix.','Taruncius'),
('nausiphanes','Nausiphanes','Who held that of things which seem to be, nothing is more than it is not.','Nausiphanes'),
('hippocrates','Hippocrates','Who made the soul a spirit diffused all over the body.','Hippocrates'),
('erasistratus','Erasistratus','Who lodged the soul adjoining the membrane of the epicranium.','Erasistratus'),
('moses','Moses','Who, like the Stoics, seated the soul in the blood — which Montaigne gives as the reason he interdicted eating the blood of beasts.','Moses'),
('st-bernard','St Bernard','Who asks how he should comprehend how incomprehensible God is, seeing he cannot comprehend the parts of his own being.','St Bernard|St. Bernard'),
('archelaus','Archelaus','The physician whose disciple and favourite Socrates was, according to Aristoxenus, and who said that both men and beasts were made of a lacteous slime expressed by the heat of the earth.','Archelaus'),
('aristoxenus','Aristoxenus','Who reports that Socrates was his disciple.','Aristoxenus'),
('alcmeon','Alcmeon','Who held the seed to be part of the substance of the brain, and proved it, he said, by the weakness of the eyes in those immoderate in that exercise. The editions spell him Alcmæon, Alcmeon and Alcmaeon between them.','Alcmæon|Alcmeon|Alcmaeon'),
('aethalides','Aethalides','The first of the men Pythagoras remembered having been, before Euphorbus, Hermotimus and Pyrrhus.','Ætha-lides|Aethalides|Æthalides'),
('hermotimus','Hermotimus','The third of them.','Hermotimus'),
('gobrias','Gobrias','Who, closely grappled in combat with a lord of Persia and seeing Darius come up sword in hand and fear to strike lest he kill him, called out boldly to fall on though he ran them both through. Montaigne tells his reader not to die to be revenged, as he did.','Gobrias'),
('margaret-de-valois','Margaret de Valois','The reader the chapter is addressed to, whom Montaigne charges not to refuse to support her Sebond by the ordinary forms of arguing she is every day instructed in — named only in an editor’s note. Not the Marguerite, Queen of Navarre, of the Heptameron, who is another woman and an earlier one. The modern edition spells her Marguerite de Valois.','Margaret de Valois|Marguerite de Valois'),
('nicetas','Nicetas','Of Syracuse, who according to Theophrastus took it into his head to maintain that it was the earth that moved, turning about its axis by the oblique circle of the zodiac — where Cleanthes the Samian is the other name given for it.','Nicetas'),
('anexandridas','Anexandridas','Cleomenes’s father, named to place the Cleomenes whose friends reproached him with new and unaccustomed humours when he was sick. The Essays do not identify him with the Alexandridas of the long speeches to the Ephori. The modern edition spells him Anaxandridas.','Anexandridas|Anaxandridas'),
('tyridates','Tyridates','The king Montaigne says he does not care what northern clime reveres, in the verses on indifference to what is far off. The modern edition spells him Tiridates, and the Latin accusative Tyridatem of the quotation is left unbound.','Tyridates|Tiridates'),
('king-tullus','King Tullus','In whose time Pherecydes is said to have first introduced the immortality of the soul — though some attribute it to Thales and some to others.','King Tullus'),
('king-midas','King Midas','Whose inconvenience the poet feigns, and into which Montaigne says Christians would fall if their prayers were granted as they ask them.','King Midas'),
('thrasymachus','Thrasymachus','Who in Plato is of opinion that there is no other right but the convenience of the superior.','Thrasymachus'),
('bartolus','Bartolus','With Aldus, one of the two authorities between whom a judge found a sharp conflict and many contrarieties, and wrote in the margin of his book: a question for a friend.','Bartolus'),
('aldus','Aldus','The other of them.','Aldus'),
('hipparchia','Hipparchia','Who was not received into Crates’s society but upon condition that she should in all things follow the practice and customs of his rule.','Hipparchia'),
('thetis','Thetis','The sea-goddess in whose honour Alexander, arriving at the Indian Ocean, threw several great vessels of gold into the sea; and who, in Aristotle’s instance of flattery, flatters Jupiter. The older edition spells her Thetes at the Indian Ocean and Thetis in Aristotle.','Thetis|Thetes','reference','deity'),
('tethys','Tethys','Whom Homer made, with the Ocean, father and mother of the gods — Plato’s evidence, in Montaigne’s report of him, that bodies never had any existence but only birth, and that all things are in perpetual fluctuation, motion and variation. The older edition prints her as Thetis, which is the sea-goddess’s name and not hers.','Tethys','reference','deity'),
]:add(*row)


# ------------------------------- chapter 69, found by the table audit
for row in [
('zeno-of-elea','Zeno','Who held, in the doxography Montaigne runs through, that one same is not and that there is nothing — the Eleatic thesis, beside Parmenides’s that there is but one thing. Not the founder of the Stoa, whose opinions fill the rest of the chapter, nor the citizen of Messina.'),
('ariston-plato-father','Aristo','Plato’s father, who having a mind to enjoy the fair Perictione could not, and was warned by Apollo in a dream to leave her untouched until she had been delivered — which is how it came to be believed at Athens that Plato was of divine generation. Not Aristo of Chios, nor the tragedian, nor Ariosto.'),
('pyrrhus-transmigration','Pyrrhus','The man Pythagoras remembered having been last, after Aethalides, Euphorbus and Hermotimus, before passing into Pythagoras himself. Not the King of Epirus.'),
('crassus-triumvir','Crassus','Whom Surena beat with the same fine arms — the Parthian bow — that had beaten Sertorius in Spain and served Eumenes against Antigonus.'),
('crassus-orator','Crassus','Whose lamprey knew his voice and came when he called it — Montaigne’s instance, with the eels of the lake Arethusa, of beasts that suffer themselves to be governed by our voices. Not the Crassus whom Surena beat, nor the P. Crassus of the Asian consulship.'),
('crito-brother','Crito','Thrasylaus’s brother, who restored him to his better understanding — for which Thrasylaus was very sorry, having infinitely enjoyed believing that every ship that came into the Piraeus sailed for his profit. Not Socrates’s friend.'),
('agis-king-of-sparta','Agis, King of Sparta','Who, after a long conference with an ambassador of Abdera, was asked what answer he should return to his fellow-citizens, and said: that thou hast said all thou wouldst and as long as thou wouldst, without my saying one word. The Essays do not join him to either of the other two Agises, and give none of the three a numeral.'),
('timon-of-phlius','Timon','Who calls Plato, insultingly, a monstrous forger of miracles. Not Timon surnamed the Man-hater.'),
('diodorus-siculus','Diodorus','Diodorus Siculus, who with Cicero says that in their time the Chaldees kept a register of four hundred thousand and odd years. Not the dialectician who died of shame.'),
('persaeus','Perseus','Zeno’s disciple, who was of opinion that men have given the title of gods to such as have been useful to human life. Neither the King of Macedon nor the Gorgon-slayer — and this, not 44:1, is the 69:268 the earlier passes of this package were pointing at.'),
('hyrcanus','Hyrcanus','King Lysimachus’s dog, who when his master was dead lay on his bed refusing either to eat or drink, and on the day the body was burnt took a run and leaped into the fire and was consumed — Montaigne’s instance, with the dog of one Pyrrhus, of a friendship in beasts more lively and constant than men have.','Hyrcanus','reference','animal'),
]:add(*row)

# ------------------- chapter 69, found by the census of the named gods
for row in [
('vulcan','Vulcan','The god to whom Tiberius Sempronius burnt the rich spoils and arms he had gained in Sardinia; whose arms stand in the Latin for fortitude — if thou art naked, present thy throat, if covered with Vulcan’s arms, resist; and who, in the line Montaigne quotes, stood against Troy where Apollo stood for it.','Vulcan','reference','deity'),
('juno','Juno','One of the accustomed gods Zeno takes away, with Jupiter and Vesta; the cruel Juno who stands in arms full in the Scæan gate while Neptune heaves the city from its base; and the goddess whose altars, in the list of the gods each nation adores, the Spartans feed.','','reference','deity'),
('vesta','Vesta','One of the accustomed gods Zeno takes away, with Jupiter and Juno; and the goddess under whose name Zamolxis gave out his laws to the Scythians.','Vesta','reference','deity'),
('faunus','Faunus','The god the Arcadians worship, in the list of the gods each nation adores.','Faunus','reference','deity'),
('pallas-evander','Pallas','The dead man to whose ghost the four sons of Sulmo and four more that Ufens bred were led as living victims, to expire in sacrifice before his funeral pyre. Evander’s son in the Aeneid, and not the goddess of 69:358 and 69:391.','','reference','mythological-figure'),
('numa','Numa','Numa Pompilius, who fed his people with the foppery that the nymph Egeria brought him all his counsels from the gods, and gave his laws the title of her patronage; and who attempted to conform the devotion of his people to a religion purely mental, without any prefixed object or material mixture — which Montaigne says was to undertake a thing of no use.','Numa','supporting'),
('zoroaster','Zoroaster','Legislator of the Bactrians and Persians, who gave his laws the authority of the God Oromazis as Numa gave his the patronage of Egeria; and whom Aristotle, Pliny and others say flourished six thousand years before Plato’s time.','Zoroaster','supporting'),
]:add(*row)

# ============================= CHAPTER 70 — of judging of the death of another
for row in [
('lucius-domitius','Lucius Domitius','Taken in the Abruzzi in Caesar’s civil wars, who poisoned himself upon it and afterwards repented.','Lucius Domitius'),
('plautius-silvanus','Plautius Silvanus','Whose grandmother sent him a poniard while he was upon his trial; not being able to kill himself with it, he made his servants cut his veins.','Plautius Silvanus'),
('urgulania','Urgulania','Plautius Silvanus’s grandmother, who sent him the poniard.','Urgulania'),
('albucilla','Albucilla','One of the Romans Montaigne lists as having botched their own deaths: the blow was struck with too much tenderness, which gave the adversaries opportunity to imprison and put to death their own way.','Albucilla'),
('demosthenes-general','Demosthenes','The great leader who did the same after his rout in Sicily — the Athenian general of the Syracusan expedition, not the orator, whose alias was taking this paragraph until it was suppressed here.','','reference'),
('fimbria','Fimbria','Who, having struck himself too weakly, entreated his servant to despatch him.','Fimbria'),
('ostorius','Ostorius','Who could not make use of his own arm, and disdained to employ his servant’s to any other use than to hold the poniard straight and firm.','Ostorius'),
('pomponius-atticus','Pomponius Atticus','Cicero’s correspondent, who being sick called Agrippa his son-in-law and two or three friends to tell them that since every means practised for his recovery was in vain, and all he did to prolong his life prolonged his pain, he had resolved to put an end to both. Having chosen abstinence as the means, he was cured by it — and refused to alter his purpose, saying that as he must one day die, and was now so far on his way, he would save himself the labour of beginning another time.','Pomponius Atticus','supporting'),
('tullius-marcellinus','Tullius Marcellinus','A young man of Rome who had a mind to anticipate the hour of his destiny, to be rid of a disease that troubled him more than he was willing to endure, though his physicians assured him of a certain cure. He called a council of friends; some advised out of unmanliness, some out of flattery, and a Stoic told him it was no great matter to live, since his servants and his beasts lived, but a great thing to die handsomely, wisely and firmly. He divided a sum of money among his servants, forsook all nourishment, and on the third day, having caused himself to be sprinkled with warm water, fainted by degrees and not without some kind of pleasure, as he declared himself.','Tullius Marcellinus','supporting'),
]:add(*row)

# ================ CHAPTER 72 — that our desires are augmented by difficulty
for row in [
('danae','Danae','Whom a brazen tower held: had it not, Ovid says, she would never have been made a mother by Jove.','','reference','mythological-figure'),
('galla','Galla','Martial’s mistress, told to refuse him — love is glutted with joys that are not attended with trouble.','','reference','literary-figure'),
('st-james','St James','The saint to whom the people of the march of Ancona more readily make their vows, while those of Galicia vow to Our Lady of Loreto: Montaigne’s instance that difficulty gives all things their estimation, and that what is near at hand is despised.','St. James|St James','reference','religious-figure'),
('poppaea','Poppaea','Who invented the use of a mask to hide the beauties of her face — to enhance it, Montaigne says, to her lovers.','Poppea|Poppaea'),
('flora-courtesan','Flora','The courtesan who said she never lay with Pompey but that she made him wear the prints of her teeth — Montaigne’s instance that pleasure is much sweeter when it smarts. At 97:38 she is the one who never lent herself to less than a dictator, a consul or a censor, and took pleasure in the dignity of her lovers. Not the Flora of the school walls at 25:90.','','reference'),
('rutilius-poet','Rutilius','The author of the Itinerarium, quoted for the plague-sore that spreads the further for being lanced. Not the Rutilius of Tacitus’s Agricola at 74:7, nor the consul Publius Rutilius at 84:21.','','reference'),
]:add(*row)

# ==================================================== CHAPTER 73 — of glory
for row in [
('amynomachus','Amynomachus','One of Epicurus’s two heirs, ordered by the will to defray every January the expense of the celebration of his birthday, as Hermachus should appoint, and the expense of entertaining the philosophers on the twentieth of every moon.','Amynomachus'),
('timocrates','Timocrates','Epicurus’s other heir, under the same charge.','Timocrates'),
('hermachus','Hermachus','The friend to whom Epicurus wrote on the happy and last day of his life, afflicted with such pain in the bladder and bowels that nothing could be greater, and recompensed by the pleasure the remembrance of his own inventions brought his soul; he asks him to take upon him the protection of Metrodorus’s children, and the will leaves him to appoint how the birthday should be kept. The older edition misprints the salutation HEYMACHUS.','Hermachus|HERMACHUS|HEYMACHUS'),
('sextus-peduceus','Sextus Peduceus','Who faithfully restored the treasure C. Plotius had committed to his sole secrecy and trust — which Montaigne says he does not find so commendable, having often done it himself, as he would think it an execrable baseness to have done otherwise.','Sextus Peduceus'),
('plotius','C. Plotius','Who committed the treasure to Sextus Peduceus’s sole secrecy and trust.','C. Plotius|Plotius'),
('sextilius-rufus','Sextilius Rufus','Whom Cicero accuses of having entered upon an inheritance against his conscience — not only not against law, but even by the determination of the laws themselves.','Sextilius Rufus'),
('herostratus','Herostratus','Of whom Trogus Pompeius says that he was more ambitious of a great reputation than of a good one.','Herostratus'),
('manlius-capitolinus','Manlius Capitolinus','Of whom Titus Livius says the same.','Manlius Capitolinus'),
('trajan','Trajan','Whose memory the world blesses where it abominates Nero’s — the one use Montaigne allows the false opinion of glory, if it keeps princes and people in their duty.','Trajan','supporting'),
('egeria','Egeria','The nymph who, Numa gave out, brought him all his counsels from the gods, as Sertorius gave out of his white hind.','Egeria','reference','mythological-figure'),
('oromazis','Oromazis','The god under whose name Zoroaster gave out his laws to the Bactrians and Persians. The modern edition writes him Oromasdes.','Oromazis|Oromasdes','reference','deity'),
('draco','Draco','With Solon, legislator of the Athenians, who gave out his laws under the name of Minerva.','Draco'),
('sire-de-joinville','The Sire de Joinville','St Louis’s familiar companion, and with Eginhard and Philip de Commines one of the elder historians Montaigne trusts. He reports that the religion of the Bedouins enjoined a belief that the soul of him among them who died for his prince went into another body more happy, more beautiful and more robust than the former, by which means they much more willingly ventured their lives.','Sire de Joinville|Joinville','supporting'),
('orlando','Orlando','Ariosto’s hero, who was more bent to do great acts than to boast of them, so that no deeds of his were ever known but those that had witnesses. The bare name at 67:15 and in the citations is the title of the poem and not the man.','','reference','literary-figure'),
]:add(*row)

# --------------- chapters 1-73, found by a later census of the collectives
for row in [
('the-muses','The Muses','The goddesses to whom antiquity gave the ordering and patronage of the young\u2019s sports, with Apollo and Minerva; whose sacred inspiration stirs the poet up in the theatre; to whom the Lacedaemonians sacrificed as they entered battle, so that their actions might be well and worthily written; and by society with whom Montaigne says he would rather have begotten a very beautiful child than by lying with his wife.','the Muses','reference','deity'),
('the-sirens','The Sirens','Whose first charm to allure Ulysses was to wheedle and entertain him with his own praises \u2014 Montaigne\u2019s instance that no panderism is so apt to corrupt as praise. The older edition spells them Syrens.','Syrens|Sirens','reference','mythological-figure'),
('xenocrates','Xenocrates','Plato\u2019s successor at the Academy, who makes eight gods \u2014 five named among the planets, a sixth composed of all the fixed stars as of so many members, the seventh and eighth the sun and moon \u2014 and who with the Egyptians makes the soul a mobile number; and whose lecture, walked into by chance, reformed the debauched Polemon on the spot. The older edition prints him Zenocrates in the Apology, on the same misprint as Zenophanes for Xenophanes.','Xenocrates|Zenocrates','supporting'),
]:add(*row)

# ========================================= CHAPTER 74 \u2014 of presumption
for row in [
('rutilius-rufus','Rutilius','With Scaurus, one of the two Romans Tacitus says wrote their own lives without its being thought a breach of good faith or a disparagement. Not the author of the Itinerarium at 72:43, nor the consul Publius Rutilius at 84:21.','','reference'),
('aemilius-scaurus','Scaurus','The other of the two. Not the Scaurus whose wife Sextilia died with him at 60:52; the Essays do not join them.','','reference'),
('constantius','The Emperor Constantius','Who always in public held his head upright and stiff, without bending or turning to either side, not so much as to look on those who saluted him \u2014 Montaigne\u2019s instance of a haughty irregularity of deportment. Also Julian the Apostate\u2019s predecessor, against whose party Julian was severe at the beginning of his reign.','Constantius','supporting'),
('amafanius','Amafanius','With Rabirius, the pattern of the inform and irregular way of speaking Montaigne owns to: a popular jargon, proceeding without definition, division or conclusion.','Amafanius'),
('rabirius','Rabirius','The other of that pair.','',),
('messalla','Messalla','Who complains in Tacitus of the straitness of some garments in his time, and of the fashion of the benches where the orators were to declaim, as a disadvantage to their eloquence. Not Messala Corvinus of 74:99.','Messalla'),
('messala-corvinus','Messala Corvinus','Who was two years without any trace of memory \u2014 which Montaigne sets beside his own bad one, and beside Georgius Trapezuntius. Not the Messalla of Tacitus\u2019s dialogue at 74:30.','Messala Corvinus'),
('turnus','Turnus','Who marches in the first rank brandishing his weapon, taller by a head than all the rest \u2014 the height Montaigne says is the only beauty of men.','','reference','literary-figure'),
('chancellor-olivier','Chancellor Olivier','Author of the saying Montaigne calls to mind when he judges his own strength: that the French are like monkeys that swarm up a tree from branch to branch and never stop till they come to the highest, and there show their breech. One of the two Chancellors of France Montaigne names for great ability and no common virtue.','Olivier','supporting'),
('de-lhospital','De l\u2019Hospital','The other of those two Chancellors, and one of the good artificers of poetry in Montaigne\u2019s age.','De l\u2019Hospital|de l\'Hospital|L\u2019Hospital|L\'Hospital','supporting'),
('metellus-macedonicus','Metellus of Macedon','Author of the saying some of our princes have bragged of since: that they would burn their shirts if they knew their true intentions. The older edition prints him Metellius.','','reference'),
('soliman','Soliman','Of the Ottoman race, a race not very solicitous of keeping their words or compacts \u2014 and yet, being told that Mercurino de\u2019 Gattinara and the inhabitants of Castro were held prisoner against the articles of their capitulation, he took it ill. Also the Soliman who said that victories obtained without the master are never complete. The modern edition writes him Suleiman.','Soliman|Suleiman','supporting'),
('mercurino-de-gattinara','Mercurino de\u2019 Gattinara','Held prisoner with the inhabitants of Castro after they had surrendered the place, contrary to the articles of their capitulation. The older edition prints him Gratinare.','Mercurino de\u2019 Gratinare|Mercurino de\'Gattinara|Mercurino de\' Gattinara'),
('latinus','Latinus','The scoffer Martial\u2019s epigram asks whether the critic could excel \u2014 quoted by Montaigne against those who would carp at his book.','Latinus','reference','literary-figure'),
('atlas','Atlas','Who, in the same epigram, would refuse to bear a nose so great.','','reference','mythological-figure'),
('francis-ii','King Francis II','In whose presence at Barleduc Montaigne saw a self-portrait of Rene, king of Sicily, presented as a memorial \u2014 which is Montaigne\u2019s warrant for drawing himself with a pen.','Francis II','supporting'),
('rene-of-sicily','Rene, king of Sicily','Who had drawn the portrait of himself. Not the Rene, Duke of Lorraine, of 37:0.','','reference'),
('machiavelli','Machiavelli','Whose writings Montaigne calls solid enough for their subject and yet easy enough to be controverted \u2014 and those who controverted them no less easy to controvert.','Machiavelli','supporting'),
('matthias','Matthias','Upon whom the lot fell, in the verse of the Acts Montaigne quotes for the ancient way of leaving a doubtful choice to chance. The older edition\u2019s English version misprints him Matthew.','Matthias','reference','religious-figure'),
('polemon','Polemon','A lewd and debauched young Greek who, going by chance to hear one of Xenocrates\u2019s lectures, brought away not only the knowledge of some fine matter but a sudden reformation of his life \u2014 the instance Montaigne takes of an effect of philosophy that outlasts the hearing of it.','Polemon','supporting'),
('ulpian','Ulpian','One of the four names Montaigne says the pedants honour alike, at the expense of their own understandings \u2014 with Cicero, Galen and St Jerome.','Ulpian'),
('st-jerome','St Jerome','The fourth of them.','St. Jerome|St Jerome','reference','religious-figure'),
('marshal-strozzi','Marshal Strozzi','With the Duc de Guise who died at Orleans, the most remarkable man Montaigne judged by outward appearance for soldiership and military conduct.','Marshal Strozzi|Strozzi','supporting'),
('daurat','D\u2019Aurat','One of the good artificers of poetry Montaigne names in his own age, with Beza, Buchanan, L\u2019Hospital, Montdore and Turnebus.','D\u2019Aurat|D\'Aurat'),
('beza','Beza','Another of them.','Beza'),
('montdore','Montdore','Another of them. The modern edition writes him Mondor\u00e9.','Montdore|Mondor\u00e9'),
('monsieur-de-la-noue','Monsieur de la Noue','Whose constant goodness, sweetness of manners and conscientious facility, in so great an injustice of armed parties \u2014 the true school of treason, inhumanity and robbery \u2014 kept up the reputation of a great and experienced captain.','Monsieur de la Noue|la Noue','supporting'),
('marie-de-gournay','Marie de Gournay le Jars','Whose judgment of Montaigne\u2019s first Essays, being a woman, so young, and alone in her own country, he has taken delight to publish his hopes of in several places.','Marie de Gournay le Jars|Gournay','supporting'),
]:add(*row)

# ====================================== CHAPTER 75 \u2014 of giving the lie
for row in [
('sagoin','Sagoin','The butt of the verses Montaigne quotes for the way a lie should be answered \u2014 a slap on his eye, a slap on his snout, a slap on Sagoin\u2019s back.','Sagoin','reference','literary-figure'),
('fripelippes','Fripelippes','Marot\u2019s valet, in whose name the verses against Sagoin are written.','Fripelippes','reference','literary-figure'),
('salvianus','Salvianus','Of Marseilles, who lived in the time of the Emperor Valentinian, and says that lying and forswearing themselves is with the French not a vice but a way of speaking.','Salvianus'),
]:add(*row)

# ================================ CHAPTER 76 \u2014 of liberty of conscience
for row in [
('emperor-tacitus','The Emperor Tacitus','Cornelius Tacitus\u2019s kinsman, who by express order furnished all the libraries in the world with the history \u2014 and not one entire copy escaped those who wanted it abolished for five or six idle clauses contrary to our belief. Not the historian.','','supporting'),
('maris','Maris','Bishop of Chalcedon, in the story Montaigne\u2019s own people tell of Julian the Apostate.','Maris','reference','religious-figure'),
('eutropius','Eutropius','Montaigne\u2019s other witness for Julian: an enemy to Christianity, but without putting his hand to blood.','Eutropius'),
]:add(*row)

# ============================ CHAPTER 77 \u2014 that we taste nothing pure
for row in [
('simonides','Simonides','Whose imagination, on the question King Hiero had put to him, suggested so many sharp and subtle considerations that, doubting which was likeliest, he totally despaired of the truth.','Simonides','supporting'),
]:add(*row)

# ==================================== CHAPTER 78 \u2014 against idleness
for row in [
('bajazet-ii','Bajazet II','Who with his son swerved from the Ottoman opinion that a prince should lead his own wars, spending their time in science and other retired employments, and gave great blows to their empire. Not the Bajazet of the snow tempest at 48:53.','Bajazet II','supporting'),
('charles-v-france','Charles V','King Charles V of France, of whom Edward III of England said that there never was a king who so seldom put on his armour, and yet never a king who gave him so much to do. Not the Emperor Charles V.','','supporting'),
('amurath-iii','Amurath III','Now reigning, who follows Bajazet II’s example and begins to find the same effect: an Ottoman prince who does not lead his own wars. The modern edition writes him Murad III. Not the Amurath of 48:53.','Amurath III|Murad III','supporting'),
('marcus-fabius','Marcus Fabius','To whom the Roman legionary swore he would return a conqueror from the fight, invoking Father Jove, Mars Gradivus and the other angry gods if he failed. Not the house of the Fabii.','Marcus Fabius'),
('philistus','Philistus','General of the naval army of Dionysius the younger against the Syracusans, who, when they drew about his galley to environ him and he could hope for no relief, took away with his own hand the life he had so liberally and in vain exposed to the enemy.','Philistus','supporting'),
('mule-moloch','Mule Moloch','King of Fez, who won against Sebastian of Portugal the battle famous for the death of three kings, being mortally sick throughout: he managed the continuance of his sickness in consuming the enemy, reserved the last day of his life for the battle, arranged his battalions in a circle, and dying had himself carried along the files to encourage the captains one after another. The modern edition writes him Moulay Mohammed.','Mule Moloch|Moulay Mohammed','supporting'),
('sebastian-of-portugal','Sebastian, king of Portugal','The young invading king whose valour made the conflict very sharp, and whose death in it passed that great kingdom to the crown of Castile.','Sebastian','supporting'),
]:add(*row)

# ======================================== CHAPTER 79 \u2014 of posting
for row in [
('lucius-vibullius-rufus','Lucius Vibullius Rufus','Who, being in great haste to carry intelligence to Pompey, rode night and day, still taking fresh horses for the greater speed.','Lucius Vibullius Rufus|Vibullius'),
('drusus','Drusus','Tiberius Nero\u2019s brother, sick in Germany, whom Tiberius travelled two hundred miles in four-and-twenty hours to see.','',),
('sempronius-gracchus-courier','T. Sempronius Gracchus','Who, Livy says, came by pre-arranged relays of horses from Amphissa to Pella in three days, with an almost incredible speed. The Essays do not join him to the Tiberius Sempronius of 69:300 who burnt the Sardinian spoils, and give neither a numeral.','T. Sempronius Gracchus'),
('decimus-brutus','Brutus','Who used the same device — swallows carrying news — when besieged in Modena. A fifth Brutus, and none of the other four.','',),
('caecina','Cecina','Whose invention for sending news home was quicker than posting: he took swallows with him and turned them out towards their nests when he had anything to send back.','Cecina'),
]:add(*row)

# ================= CHAPTER 80 \u2014 of ill means employed to a good end
for row in [
('brennus','Brennus','Under whose conduct, with others, that infinite deluge of men came into Italy \u2014 one of Montaigne\u2019s instances of a state purging its own repletion by sending its excess abroad.','Brennus','supporting'),
('nemesis','Nemesis','The Rhamnusian virgin of Catullus\u2019s prayer: let nothing ever so greatly please me which is taken without justice from the unwilling owners.','','reference','deity'),
('prudentius','Prudentius','The Christian poet of the Contra Symmachum, quoted against the gladiators: what other end does the impious art propose to itself, what the slaughter of young men, what pleasure fed with blood.','Prudentius','supporting'),
('statius','Statius','The Latin poet of the Silvae, quoted for the tender sex, unskilled in arms, immodestly engaged in manly fights amidst those tumults and new sports.','Statius','supporting'),
]:add(*row)

print(len(entities),'entities authored: chapters 1-80')
Path(__file__).parent.joinpath('editorial.json').write_text(json.dumps(dict(
 contentVersion='2026-09-13.5',
 coverage='Both full English editions, chapters 1-80 of 107. Named persons, named animals, and the named classical gods; the Christian God, Nature and Fortune are deliberately not cast. Peoples, places, schools of philosophy, book titles and names used as names rather than as men are not cast.',
 entities=[e for e in entities if e['name']!='unused']),ensure_ascii=False,indent=2)+'\n')
