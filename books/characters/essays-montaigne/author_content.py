"""Manually authored recognition cards for both full English texts of Montaigne's
Essays.

Cotton's translation in both editions, 107 chapters covering Montaigne's three
books, 4,897 paragraphs per edition, aligned paragraph for paragraph. The modern
edition rewrites the sentence rhythm, resolves pronouns to names, and — unlike
the Peloponnesian War package — **modernises the transliterations**: Wicliffe
becomes Wycliffe, Zisca becomes Zizka, Trivulcio becomes Trivulzio, Fabricio
becomes Fabrizio, Juliano becomes Giuliano, Fregosa becomes Fregoso, Sylla
becomes Sulla, AEneid becomes Aeneid. Both spellings are carried on one card.

Chapters 1-40 are authored. The rest are not.

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
('sophocles','Sophocles','The Athenian tragedian, and one of Montaigne’s examples of men who died of joy.','Sophocles'),
('thalna','Thalna','The Roman who died in Corsica reading the news of the honours the Senate had decreed him.','Thalna'),
('leo-x','Pope Leo X','Who had so ardently desired the taking of Milan that the news of it threw him into a fever, of which he died.','Leo X'),
('diodorus-dialectician','Diodorus the Dialectician','Who died on the spot of shame at not being able, in his own school and before a great auditory, to disengage himself from an argument put to him. Not Diodorus Siculus the historian.'),
]:add(*row)


# ============================= CHAPTER 3 — affections beyond ourselves
for row in [
('plato','Plato','The Athenian philosopher, Socrates’s pupil, and with Cicero the writer Montaigne quotes most. He is an authority and an adversary in the same breath: Montaigne takes “Do thine own work, and know thyself” from him and calls a good deal of the rest of him poetry.','Plato','major'),
('epicurus','Epicurus','The Greek philosopher of pleasure rightly understood, whom Montaigne quotes often and defends against the coarse reading of him. He dispenses his sages from all foresight and care of the future.','Epicurus','supporting'),
('livy','Livy','The Roman historian of the city from its foundation.','Livy','supporting'),
('nero','Nero','The emperor, Montaigne’s standing example of a prince whose reputation is fair game once he is dead: two of his own soldiers told him to his face why they hated him and why they had tried to kill him.','Nero','supporting'),
('aristotle','Aristotle','The philosopher of the schools, whom Montaigne calls the god of scholastic learning and who, he says, will still have a hand in everything.','Aristotle','major'),
('solon','Solon','The Athenian lawgiver, and the author of the saying that no man can be called happy until he is dead — which Montaigne would rather put as that man is never happy, because never so till he is no more.','Solon','supporting'),
('lucretius','Lucretius','The Latin poet of On the Nature of Things, quoted throughout the Essays.','Lucretius','supporting'),
('bertrand-du-guesclin','Bertrand de Guesclin','The French general who died at the siege of the Castle of Rancon, and on whose corpse the besieged were made to lay down the keys of the place when they surrendered.','Bertrand de Guesclin|Bertrand du Guesclin|Guesclin'),
('bartolommeo-alviano','Bartolommeo d’Alviano','The Venetian general who died in the Republic’s service at Brescia, and whose body had to be carried home through enemy territory.','Bartolommeo d’Alviano|Bartolomeo d’Alviano|Alviano'),
('theodoro-trivulzio','Theodoro Trivulzio','Who would not have safe-conduct asked of the Veronese for Alviano’s corpse, saying it was not fit that a man never afraid of his enemies in life should seem to fear them dead. Not the Alessandro Trivulcio killed at Reggio.','Theodoro Trivulzio|Theodoro Trivulcio'),
('nicias','Nicias','The Athenian commander who lost the advantage he had visibly won over the Corinthians by suing for his dead — which under Greek law was to renounce the victory.','Nicias'),
('agesilaus','Agesilaus','The Spartan king, one of Montaigne’s standing examples of plain living and hard command.','Agesilaus','supporting'),
('edward-i','Edward I, King of England','Who had found in his long wars with Robert of Scotland that his own presence decided everything, and made his son swear to boil his body, bury the flesh, and carry the bones with the army whenever it marched against the Scots.'),
('robert-bruce','Robert, King of Scotland','Edward I’s adversary in the long wars between England and Scotland.'),
('john-zisca','John Zisca','The Bohemian captain who fought for Wycliffe’s doctrines and left orders that they should flay him after death and make a drum of his skin to carry against his enemies.','John Zisca|John Zizka|Zisca|Zizka'),
('wycliffe','Wycliffe','The English reformer whose heresies, in Montaigne’s phrase, John Zisca took up arms to vindicate.','Wicliffe|Wycliffe'),
('bayard','Captain Bayard','Mortally wounded by a harquebuss shot and urged to retire, he answered that he would not begin at the last gasp to turn his back on the enemy, and had himself set down at the foot of a tree with his face to them.','Bayard'),
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
('xerxes','Xerxes','The Persian king who invaded Greece, and who whipped the sea and sent a written challenge to Mount Athos.','Xerxes','supporting'),
('caligula','Caligula','The emperor, Montaigne’s example of a fury that destroys a thing for what happened in it: he demolished a very beautiful palace because his mother had once been happy there.','Caligula'),
('augustus','Augustus','The first Roman emperor, Julius Caesar’s heir. Among Montaigne’s examples of him: he defied Neptune after a storm at sea and had the god’s statue taken down from among the deities at the games, and after losing the legions under Quintilius Varus in Germany he ran his head against the wall crying “O Varus! give me back my legions!”','Augustus Caesar|Augustus','supporting'),
('neptune','Neptune','The sea-god whose statue Augustus deposed from among the deities in revenge for a storm.','Neptune','reference','deity'),
('quintilius-varus','Quintilius Varus','The commander under whom Augustus lost his legions in Germany.','Quintilius Varus|Varus'),
]:add(*row)


# ============================ CHAPTER 5 — going out to parley
for row in [
('quintus-marcius','Quintus Marcius','The Roman legate against Perseus of Macedon, who opened sham overtures of accommodation to gain time to reinforce, and was condemned for it by the elder senators as degenerating from the Roman practice of fighting by valour and not by artifice.','Quintus Marcius'),
('perseus-macedon','Perseus, King of Macedon','Lulled asleep by Quintus Marcius’s overtures into granting a truce, and so giving his enemy the leisure to recruit that ruined him in the end.'),
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
('severus-cassius','Severus Cassius','Who spoke best extempore and owed more to fortune than to diligence: it was an advantage to him to be interrupted, and his adversaries were afraid to nettle him for fear his anger should redouble his eloquence.','Severus Cassius'),
]:add(*row)


# ========================================= CHAPTER 11 — of prognostications
for row in [
('jesus-christ','Jesus Christ','Whose coming Montaigne uses to date the decay of the oracles, and whose thirty-three years he sets beside Alexander’s as the measure of a life that was long enough.','Jesus Christ','supporting','religious-figure'),
('pacuvius','Pacuvius','The early Latin tragedian, quoted through Cicero for the wisest word in the chapter: as for those who understand the language of birds, I had rather hear them than attend to them.','Pacuvius|Pacuvio'),
('francesco-saluzzo','Francesco, Marquis of Saluzzo','Lieutenant to Francis I in the army beyond the mountains, holding the marquisate by the king’s gift, with no provocation to turn and his own affection against it — and frightened into revolt, it was said, by the prognostics that everyone was spreading in Charles V’s favour. Montaigne notes that with towns and troops in his hands he could have done far more harm than he did.'),
('antonio-de-leyva','Antonio de Leyva','Whose army lay close by Saluzzo when he revolted.','Antonio de Leyva'),
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
('montmorency','The Constable Monsieur de Montmorenci','Who at the siege of Pavia hanged every man in the tower that had held up his crossing of the Ticino, and later trussed up the governor and ensign of the Castle of Villano for the same reason — the custom Montaigne is explaining, that a place not tenable by the rules of war may be defended only at the defenders’ own risk.','Montmorenci|Montmorency'),
]:add(*row)

# ============================ CHAPTER 15 — the punishment of cowardice
for row in [
('vervins','Monsieur de Vervins','Sentenced to death for surrendering Boulogne to the English — the case that prompted a great captain to maintain, at table, that no soldier can justly be put to death for want of courage.','Vervins'),
('charondas','Charondas','The legislator who, Montaigne says, brought in ignominy instead of death for cowardice: before him Greek law killed the man who fled a battle, and he ordained instead that he be exposed three days in public in woman’s clothes, in hope of getting some service out of him afterwards.','Charondas'),
('tertullian','Tertullian','Quoted from the Apologetics for the maxim behind Charondas’s law: rather bring the blood into a man’s cheek than let it out of his body.','Tertullian'),
('ammianus-marcellinus','Ammianus Marcellinus','The late Roman historian, cited for the Emperor Julian’s degrading and then executing ten soldiers who turned their backs on the Parthians.','Ammianus Marcellinus'),
('julian','The Emperor Julian','Who put ten of his own soldiers to death for flight according to the ancient laws, and elsewhere, for the same offence, only sent men to live among the prisoners under the baggage ensign.','Emperor Julian'),
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
('archidamus','Archidamus','The Spartan king who told Periander that he had given up the glory of being an excellent physician to gain the repute of a very bad poet.','Archidamus'),
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
('croesus','Croesus','The King of Lydia, taken by Cyrus and led out to execution crying “O Solon, Solon!” — because he had found what Solon told him true to his cost: that no man can be called happy until he has been seen to pass over the last day of his life.','Croesus','supporting'),
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
('speusippus','Speusippus','A Platonic philosopher, and of worse example, Montaigne says, than the rest of that list.','Speusippus'),
('bebius','Bebius','The judge who gave a case eight days’ adjournment and was himself condemned by death within them, his own stay of life expiring first.','Bebius'),
('caius-julius','Caius Julius','The physician whose own eyes death closed while he was anointing a patient’s.','Caius Julius'),
('captain-st-martin','Captain St. Martin','Montaigne’s brother, twenty-three years old and already proved in the field, who took a tennis ball a little above the right ear, felt no wound, did not even sit down — and died of an apoplexy five or six hours later.','Captain St. Martin'),
('paulus-aemilius','Paulus Aemilius','The Roman who conquered Macedon, and who answered the prisoner king’s request not to be led in the triumph with: let him make that request to himself.','Paulus Emilius|Paulus Aemilius'),
('lycurgus','Lycurgus','The Spartan lawgiver, cited for putting the burying-places among the churches and the busiest parts of the city, so that the sight of bones and funerals should keep people in mind of their frail condition.','Lycurgus','supporting'),
('silius-italicus','Silius Italicus','The Latin epic poet, quoted for the old custom of enlivening a banquet with men killing each other over the cups.','Silius Italicus'),
('dicaearchus','Dicaearchus','Who compiled a register of the deaths of men — the book Montaigne says he would write himself, except that Dicaearchus meant it for a less profitable end. The older edition prints him Dicarchus.','Dicarchus|Dicaearchus'),
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
('st-augustine','St Augustine','The Father Montaigne cites more than any other, here for the man who fell into a swoon at any doleful cry and could be pinched or burned without feeling it, and for the man who could command his rear at will.','St. Augustine|St. Augustin','supporting','religious-figure'),
('jacques-pelletier','Jacques Pelletier','Who lived in Montaigne’s house and gave him the graven gold plate against sunstroke that Montaigne then used, with some private instructions and his own nightgown, to cure a bridegroom of an imagined impotence.','Jaques Pelletier|Jacques Pelletier'),
('amasis','Amasis, King of Egypt','Who married the beautiful Greek Laodice, found himself quite another man with her, threatened to kill her for a witch — and after vows to Venus was divinely restored the first night after his sacrifices.','Amasis'),
('laodice','Laodice','The Greek virgin Amasis married and at first could not enjoy.','Laodice'),
('venus','Venus','The goddess to whom Amasis made his vows, and was restored — and in whose avenues, Montaigne says in the chapter on education, the gods have planted more toil and sweat than in Minerva’s.','Venus','reference','deity'),
('pythagoras','Pythagoras','The philosopher, cited here for his daughter-in-law’s saying that a woman must put off her modesty with her petticoat and put it on again with the same.','Pythagoras','supporting'),
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
('thucydides','Thucydides','The historian of the Peloponnesian war, cited for what happens to language in a civil war: the parties give the public vices new and more plausible names to excuse them.','Thucydides','supporting'),
('terence','Terence','The Latin comic poet. The older edition abbreviates him Ter.','Ter|Terence'),
('octavius','Octavius','Who with Cato is still reproached for having let his country go to the last extremity rather than relieve his fellow citizens at the expense of its laws.','Octavius'),
('cato-the-younger','Cato','Cato of Utica, who would rather see the Republic ruined than saved by an innovation. Montaigne devotes a whole chapter to him later.'),
('aratus','Aratus','Made admiral of Sparta in name, because an edict forbade choosing the same man twice — while Lysander went out as general of the navy and commanded in fact.','Aratus'),
('pericles','Pericles','The Athenian, who told a Spartan envoy that a law once engrossed on the tablet could not be taken away — and was advised to turn the tablet round instead, that being not forbidden.','Pericles','supporting'),
('philopoemen','Philopoemen','Whom Plutarch commends for knowing how to command not only according to the laws but over them, when the public necessity required it.','Philopoemen'),
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
('parmenio','Parmenio','Whose letter warned Alexander that his physician Philip had been bribed by Darius to poison him.','Parmenio'),
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
('rabelais','Rabelais','In whose Gargantua Montaigne found the proverb that the greatest clerks are not the wisest men.','Rabelais'),
('aulus-gellius','Aulus Gellius','The compiler of the Attic Nights, through whom Pacuvius’s line about men who jabber philosophy and do nothing reaches the Essays. The older edition prints the citation in the accusative, Gellium.','Gellium|Gellius'),
('hercules','Hercules','From whom, the philosophers say, you might be the fiftieth descendant and still have nothing but a gift of fortune to boast of.','Hercules','reference','mythological-figure'),
('crates','Crates','Asked how long it was necessary to philosophise, he answered: till our armies are no more commanded by fools.','Crates'),
('heraclitus','Heraclitus','Who resigned the royalty to his brother, and told the Ephesians who reproached him with playing with children before the temple that it was better than sitting at the helm of affairs in their company.','Heraclitus','supporting'),
('empedocles','Empedocles','Who refused the royalty the Agrigentines offered him.','Empedocles','supporting'),
('anaxagoras','Anaxagoras','One of the philosophers Aristotle reports were called wise but not prudent, for not applying their study to more profitable things.','Anaxagoras','supporting'),
('lucullus','Lucullus','Whom letters alone, without any experience, made so great a captain — and who did not learn it, Montaigne says, in the perfunctory way we learn.','Lucullus','supporting'),
('euripides','Euripides','The tragedian, quoted through Cicero for the line that he hates the wise man who is not wise in his own concern.','Euripides','supporting'),
('juvenal','Juvenal','The Latin satirist.','Juvenal','supporting'),
('persius','Persius','The Latin satirist of the crabbed style.','Persius','supporting'),
('protagoras','Protagoras','The sophist who let his pupils either pay his demand or swear in the temple what they thought the teaching had been worth — a rule under which, Montaigne says, his own pedagogues would be sorely gravelled.','Protagoras','supporting'),
('galen','Galen','The physician the pedants know thoroughly, Montaigne says, and the patient’s disease not at all.','Galen','supporting'),
('adrian-turnebus','Adrian Turnebus','The one man of pure learning Montaigne exempts from the charge of pedantry, and in his opinion the greatest of the last thousand years: nothing of the pedant about him but the gown, and within, not a more polished soul upon earth. Montaigne says he put him on arguments far outside his profession and found him as quick as if he had spent his life in arms or affairs of state.','Adrian Turnebus|Turnebus','supporting'),
('prometheus','Prometheus','The Titan of Juvenal’s line, who framed the great natures of better clay.','Prometheus','reference','mythological-figure'),
('stobaeus','Stobaeus','The anthologist through whom the Greek verse about learning without understanding reaches the Essays.','Stobaeus'),
('francis-brittany','Francis, Duke of Brittany','John V’s son, who was told that Isabella of Scotland was homely bred and without learning, and answered that he liked her the better: a woman is wise enough if she can tell her husband’s shirt from his doublet.'),
('john-v-brittany','John V','Duke of Brittany and father of the Francis who said he liked his bride the better for having been homely bred and without any manner of learning.','John V'),
('isabella-of-scotland','Isabella of Scotland','Whose want of learning recommended her to Francis of Brittany.','Isabella'),
('aristo-of-chios','Aristo of Chios','The Stoic who said that philosophers did their hearers harm, because most of them were incapable of turning the instruction to good and would certainly turn it to ill. Not the Aristo who is a tragedian at 25:152, nor the Ariosto the older edition spells Aristo at 27:13.','Aristo of Chios'),
('aristippus','Aristippus','The founder of the Cyrenaic school, out of whose school, Cicero says, came effeminate debauchees as cynics came out of Zeno’s.','Aristippus','supporting'),
('astyages','Astyages','Cyrus’s grandfather in Xenophon, who asked him for an account of his last lesson and got the story of the two cassocks and the whipping.','Astyages'),
('mandane','Mandane','Cyrus’s mother, who in Cotton’s version of the story asks him how he would learn justice among the Medes with all his masters left behind in Persia.','Mandane'),
('antipater','Antipater','Who demanded fifty children of the Spartans for hostages and was told they would rather give him twice as many grown men, so much did they value the loss of their country’s education.','Antipater'),
('hippias-sophist','Hippias','The sophist Socrates rallies for having made a great deal of money teaching school in the villages of Sicily and never a penny at Sparta — where, Socrates says, they are so stupid as to make no account of grammar or poetry and study only the genealogies of their kings and the rise and fall of states.'),
('tamerlane','Tamerlane','One of Montaigne’s proofs that the most warlike nations are the most rude and ignorant.','Tamerlane','supporting'),
('charles-viii','King Charles VIII','Who saw himself possessed of Naples and a good part of Tuscany almost without striking a blow — which the nobles about him put down to the princes of Italy having studied to be ingenious and learned rather than vigorous and warlike.','Charles VIII'),
]:add(*row)


# ============================ CHAPTER 25 — of the education of children
for row in [
('diane-de-foix','Madame Diane de Foix, Comtesse de Gurson','The chapter’s dedicatee, expecting a child. Montaigne had a hand in making her marriage and writes her his one particular fancy about how the boy should be brought up. The dedication prints her name in capitals.','DIANE DE FOIX|Diane de Foix'),
('danaides','The Danaides','Who eternally fill and whose vessels eternally run out — Montaigne’s figure for his own reading of Plutarch and Seneca. The modern edition spells them Danaids.','Danaides|Danaids','reference','mythological-figure'),
('apollodorus','Apollodorus','Who said that if a man picked out of Chrysippus’s writings everything that was none of his, he would leave him nothing but blank paper.','Apollodorus'),
('capilupus','Capilupus','A composer of centos Montaigne knew of, and one of the writers he exempts from the charge of stitching other men’s work into their own under their own name — because such men declare themselves for what they are.','Capilupus'),
('lipsius','Lipsius','Whose Politics Montaigne calls a learned and laborious contexture, and another honest example of the same declared borrowing.','Lipsius'),
('cimon','Cimon','With Themistocles, one of the thousand men who very much deceived the expectation others had of them — Montaigne’s warning against reading a child’s promise too early.','Cimon'),
('themistocles','Themistocles','With Cimon, one of the men Montaigne names as having very much deceived the expectation others had formed of them as children — a warning against reading the promises of that tender age.','Themistocles','supporting'),
('candale','Monsieur de Candale','Diane de Foix’s uncle, who every day obliges the world with writings of his own.','Candale'),
('arcesilaus','Arcesilaus','Who, like Socrates before him, made his scholars speak first and then spoke to them.','Arcesilaus','supporting'),
('dante','Dante','Quoted for the line Montaigne makes his pupil’s rule: I love to doubt as well as to know.','Dante'),
('epicharmus','Epicharmus','Who said it is the understanding that sees and hears, the understanding that orders and rules everything, and that all the other faculties are blind and deaf and without soul.','Epicharmus'),
('paluel','Paluel','One of the two noted dancers of Montaigne’s time who could not teach a man to cut capers by being watched — his figure for the pedants who mean to inform the understanding without setting it to work.','Paluel'),
('pompey-the-dancer','Pompey','The other of the two noted dancers. Not Pompey the Great.'),
('signora-livia','Signora Livia','Whose petticoats are one of the things Montaigne says a young traveller ought not to come home able to describe. Not the Livia who was Augustus’s wife.'),
('marcellus','Marcellus','Whose death, Montaigne says, the pupil should be taught to judge rather than to locate: not so much where he died as why it was unworthy of his duty that he died there.','Marcellus'),
('la-boetie','La Boetie','Étienne de La Boétie, Montaigne’s friend, whose “Voluntary Servitude” may have been prompted by a single sentence of Plutarch’s — that the people of Asia became the vassals of one man for not having been able to pronounce a single syllable, which is No. The modern edition spells him La Boétie.','Estienne de la Boetie|Estienne de la Boétie|La Boetie|La Boétie','major'),
('alexandridas','Alexandridas','Who reproached a man for making very good but too long speeches to the Ephori: thou speakest the things thou shouldst speak, but not as thou shouldst speak them.','Alexandridas'),
('anaximenes','Anaximenes','Who asked Pythagoras what purpose there was in searching out the secrets of the stars with death or slavery continually before his eyes — the kings of Persia being at that moment preparing to invade his country.','Anaximenes'),
('theodorus-gaza','Gaza','The grammarian whose method Montaigne sets against his own: precepts so intricate and harsh, and words so vain and lean, that there is no hold to be taken of them.','Gaza'),
('demetrius-grammarian','Demetrius the grammarian','Who found a knot of philosophers chatting in the temple at Delphos and told them that by their cheerful faces they could not be engaged in very deep discourse.','Demetrius the grammarian'),
('heracleon','Heracleon the Megarean','Who answered him: it is for men puzzling over how a future tense is spelt to knit their brows; philosophical discourse always cheers those who entertain it and never makes them sad.','Heracleon'),
('minerva','Minerva','The goddess of wisdom, set against Venus in that comparison, and one of the three to whom Plato gives the patronage of the young’s sports.','Minerva','reference','deity'),
('bradamante','Bradamante','One of the two mistresses Montaigne would have the tutor hold up to the boy: a natural, active, generous, manly beauty in a glittering helmet, against Angelica tricked up in curls and ribbons.','Bradamante','reference','literary-figure'),
('angelica','Angelica','Set against Bradamante when a tutor first shows his pupil a mistress: the soft, delicate, artificial, simpering and affected form, tricked up in curls and ribbons like a wanton minx, against the manly beauty in a glittering helmet.','Angelica','reference','literary-figure'),
('flora','Flora','With the Graces, one of the figures Speusippus painted his school with — and which Montaigne would paint a school with instead of birch and willow.','Flora','reference','deity'),
('demophoon-steward','Demophoon','Alexander the Great’s steward, who sweated in the shade and shivered in the sun. The modern edition spells him Demophoön.','Demophoon|Demophoön'),
('callisthenes','Callisthenes','Who forfeited Alexander’s favour by refusing to pledge him a cup of wine — and whom, Montaigne notes, not even the philosophers justify for it.','Callisthenes'),
('alcibiades','Alcibiades','Whose constitution Montaigne admires with wonder: he could transform himself to any fashion without hurting his health, outdoing Persian luxury one while and Lacedaemonian austerity the next — as reformed in Sparta as he was voluptuous in Ionia.','Alcibiades','supporting'),
('carneades','Carneades','The philosopher Montaigne gives as his instance of a man brutified by an immoderate thirst after knowledge: so besotted with it that he would not find time so much as to comb his head or pare his nails.','Carneades','supporting'),
('quintilian','Quintilian','The Roman teacher of rhetoric, cited for the observation that an imperious authority in a schoolmaster is often attended by dangerous consequences.','Quintilian','supporting'),
('boccaccio','Boccaccio','Whose novels, Montaigne says, are harder to understand than the plain philosophical discourses he would put into a child’s hands.','Boccaccio','supporting'),
('menoeceus','Meniceus','The correspondent of the letter in which Epicurus says that neither the youngest should refuse to philosophise nor the oldest grow weary of it. The modern edition spells him Menoeceus.','Meniceus|Menoeceus'),
('leo-of-phlius','Leo, prince of the Phliasians','Who asked Heraclides Ponticus what art or science he professed, and was told: neither art nor science, but I am a philosopher.','Leo, prince of the Phliasians'),
('heraclides-ponticus','Heraclides Ponticus','Asked by Leo, prince of the Phliasians, what art or science he professed, he answered that he knew neither art nor science, but that he was a philosopher.','Heraclides Ponticus'),
('diogenes-the-cynic','Diogenes','The Cynic, who when reproached that being ignorant he should pretend to philosophy answered that he pretended to it with so much the more reason. Not Diogenes the Atheist of 11:31.'),
('hegesias','Hegesias','Who asked Diogenes to read him a book, and was asked in return why, since he chose figs that were true and natural rather than painted ones, he did not choose exercises that were naturally true rather than written.','Hegesias'),
('zeuxidamus','Zeuxidamus','Who, asked why the Lacedaemonians did not write their rules of chivalry down for their young men to read, answered that it was to inure them to action and not amuse them with words.','Zeuxidamus'),
('la-rochefoucauld','The Comte de la Rochefoucauld','At the head of the troop of horse behind the two pedants on the road to Orleans — one of whom, asked who the gentleman was, and thinking his companion meant, answered that he was no gentleman but a grammarian, and that he himself was a logician.','Comte de la Rochefoucauld|Rochefoucauld'),
('aper','Aper','Who demonstrates in Tacitus how easily the fine decoration of painted speech is effaced by the lustre of a simple and blunt truth.','Aper','reference','literary-figure'),
('tacitus','Tacitus','The Roman historian, in whose dialogue Aper makes that case.','Tacitus','supporting'),
('cleomenes-sparta','Cleomenes, king of Sparta','Who heard out the long and elegant oration of the ambassadors of Samos and then answered: as to the exordium I remember it not, nor the middle of your speech; and as for your conclusion, I will not do what you desire.'),
('polycrates','Polycrates','The tyrant the ambassadors of Samos wanted Cleomenes to make war on.','Polycrates'),
('menander','Menander','Who, reproved for not having begun the comedy he had promised, answered that it was made and ready, all but the verses: having contrived the subject and disposed the scenes, he took little care for the rest.','Menander','supporting'),
('ronsard','Ronsard','Who with Joachim du Bellay gave French poetry its reputation — since when, Montaigne says, every little dabbler swells his words as high and makes his cadences nearly as harmonious, and falls infinitely short of the rich descriptions of the one and the delicate invention of the other.','Ronsard','supporting'),
('anacreon','Anacreon','The Greek lyric poet, quoted for the line: what care I about the Pleiades or the stars of Taurus?','Anacreon'),
('suetonius','Suetonius','Who calls Julius Caesar’s style soldier-like — a judgment Montaigne repeats and says he cannot see the reason for.','Suetonius','supporting'),
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
('aurelius-bishop','Aurelius','One of the two holy bishops St Augustine calls as witnesses to those miracles.','Aurelius'),
('maximinus-bishop','Maximinus','With Aurelius, one of the two holy bishops St Augustine calls as witnesses to the miracles he reports — men Montaigne says no one living is impudent enough to think himself comparable to.','Maximinus'),
]:add(*row)

# ============================================== CHAPTER 27 — of friendship
for row in [
('laelius','Laelius','Who asked Caius Blosius, in front of the Roman consuls prosecuting everyone who had been familiar with Tiberius Gracchus, how much he would have done for him — and got the answer: all things.','Laelius'),
('tiberius-gracchus','Tiberius Gracchus','Whose friends the consuls prosecuted after sentencing him, and whose will Blosius says he had in his sleeve.','Tiberius Gracchus|Gracchus'),
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
('thomas-aquinas','St Thomas Aquinas','Who condemns marriage within the forbidden degrees partly for fear the friendship should be immoderate: a conjugal affection surcharged with the affection of kindred will carry a husband beyond the bounds of reason.','St. Thomas Aquinas','reference','religious-figure'),
('zenobia','Zenobia','Who would admit her husband for one encounter only and then left him to himself for the whole time of her conception — a brave and generous example, Montaigne says, of conjugal continence.','Zenobia'),
('aelius-verus','AElius Verus','The emperor who answered his wife’s reproaches about other women by saying that marriage was a name of honour and dignity, not of wanton desire. The modern edition spells him Aelius.','AElius Verus|Aelius Verus'),
('gallio','Gallio','Exiled to Lesbos and found to be living there as merry as the day was long, so that the Senate recalled him and confined him to his own house with his wife and family — to fit the punishment to his feeling.','Gallio'),
('amurath','Amurath','Who at the taking of the Isthmus immolated six hundred young Greeks to his father’s soul as a propitiatory sacrifice for his sins.','Amurath'),
('fernando-cortez','Fernando Cortez','To whom the king of Mexico’s ambassadors boasted that their master was obliged to offer the gods fifty thousand men a year — and for whose welcome, at another town, they sacrificed fifty at once.','Fernando Cortez|Cortez'),
]:add(*row)

# ============================================== CHAPTER 30 — of cannibals
for row in [
('flaminius','Flaminius','Whose army the Greeks said the same of as Pyrrhus said of the Romans: that whatever these barbarians might be, the order of the army had nothing of barbarism in it.','Flaminius'),
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
('varro','Varro','Who thinks the rule that we go bare before the gods and the magistrate was made for health and to inure us to the weather rather than out of reverence.','Varro','supporting'),
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
('publius-syrus','Publius Syrus','The Latin writer of maxims, quoted for the line that the heir’s tears behind the mask are smiles. The citation at 40:67 prints him P. Syrus.','Publius Syrus|P. Syrus'),
('artabanus','Artabanus','Who came on his nephew Xerxes by surprise and chid him for the sudden change in his face.','Artabanus'),
]:add(*row)

# ============================================== CHAPTER 38 — of solitude
for row in [
('stilpo','Stilpo','Who escaped the burning of his town having lost wife, children and goods, and told Demetrius Poliorcetes that he had received no loss, since fortune had nothing of his.','Stilpo'),
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
('scipio-aemilianus','Scipio','The Scipio who with Laelius is said to have resigned the honour of his comedies to an African — and who would never have done it, Montaigne says, if eloquence had added a lustre suitable to a great person. Not the Africanus who crossed to Syphax, nor Pompey’s father-in-law, nor the high priest.'),
('demosthenes','Demosthenes','Whose companions in the embassy praised Philip as handsome, eloquent and a stout drinker — commendations, Demosthenes said, more proper for a woman, an advocate and a sponge than for a king.','Demosthenes','supporting'),
('philip-ii-macedon','Philip','Philip of Macedon, who asked his son Alexander whether he was not ashamed to sing so well, and whom Demosthenes’s fellow ambassadors praised for the wrong qualities.'),
]:add(*row)

# ============ CHAPTER 40 — good and evil depend on the opinion we have of them
for row in [
('theodorus','Theodorus','Who answered Lysimachus’s threat to kill him: thou wilt do a brave feat, to attain the force of a cantharides.','Theodorus'),
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

print(len(entities),'entities authored: chapters 1-40')
Path(__file__).parent.joinpath('editorial.json').write_text(json.dumps(dict(
 contentVersion='2026-09-12.6',
 coverage='Both full English editions, chapters 1-40 of 107. Named persons and the gods Montaigne treats as agents. Peoples, places, schools of philosophy and book titles are not cast.',
 entities=[e for e in entities if e['name']!='unused']),ensure_ascii=False,indent=2)+'\n')
