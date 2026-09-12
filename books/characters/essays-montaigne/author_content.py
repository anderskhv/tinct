"""Manually authored recognition cards for both full English texts of Montaigne's
Essays.

Cotton's translation in both editions, 107 chapters covering Montaigne's three
books, 4,897 paragraphs per edition, aligned paragraph for paragraph. The modern
edition rewrites the sentence rhythm, resolves pronouns to names, and — unlike
the Peloponnesian War package — **modernises the transliterations**: Wicliffe
becomes Wycliffe, Zisca becomes Zizka, Trivulcio becomes Trivulzio, Fabricio
becomes Fabrizio, Juliano becomes Giuliano, Fregosa becomes Fregoso, Sylla
becomes Sulla, AEneid becomes Aeneid. Both spellings are carried on one card.

Chapters 1-24 are authored. The rest are not.

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
('montaigne','Montaigne','The author, who says his book and he are one thing, that he is himself the matter of it, and that he wants to be seen here in his simple, natural, ordinary fashion. He names himself rarely and late; where he does, it is usually because someone else has said something about him.','Montaigne','central'),
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
('pompey','Pompey','Pompey the Great, who pardoned the whole city of the Mamertines, though furiously incensed at it, on the strength of one citizen’s magnanimity.','','supporting'),
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
('cyrus-the-great','Cyrus','The founder of the Persian empire, who charged his children that neither they nor anyone else should see or touch his body once the soul had left it — a superstition, Montaigne thinks, of a piece with the reverence for religion that marks his whole life and his historian’s.','','supporting'),
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
('nassau','The Count of Nassau','Who besieged Mousson.'),
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
('ariosto','Ariosto','The Italian poet of the Orlando Furioso.','Ariosto'),
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
('sempronius','The Consul Sempronius','Who commanded in that first defeat by Hannibal.','Sempronius'),
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
('tigillinus','Tigillinus','Captain of the watch at Rome, another of them.','Tigillinus'),
('ludovico-gonzaga','Ludovico','Guido di Gonzaga’s son, another of them.'),
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
('jove','Jove','Jupiter, whose strong thundering hand, in Horace’s ode, does not move a well-settled soul.','Jove','reference','deity'),
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
('stratonice','Stratonice','Whose beauty gave Antiochus his fever.','Stratonice'),
('lucius-cossitius','Lucius Cossitius','Whom Pliny claims to have seen turned from a woman into a man on her wedding day.','Lucius Cossitius'),
('pontanus','Pontanus','Who reports the like change in Italy in more recent times.','Pontanus'),
('iphis','Iphis','The boy who paid the vow a girl had made, in the line Montaigne quotes for such changes.','Iphis','reference','mythological-figure'),
('mary-germain','Mary Germain','The man the Bishop of Soissons confirmed as Germain, whom the whole town had known as a girl called Mary until she was twenty-two. Montaigne saw him at Vitry le François, full of beard, old and unmarried; he said his male organs came out when he strained himself in a leap, and the girls of the place still have a song warning each other against taking too great strides.','Mary Germain|Germain'),
('dagobert','King Dagobert','Whose scars, with St Francis’s, some attribute to the force of imagination.','Dagobert'),
('st-francis','St Francis','Whose stigmata, with King Dagobert’s scars, some attribute to imagination.','St. Francis|St Francis','reference','religious-figure'),
('celsus','Celsus','Who tells of a priest whose soul would be ravished into an ecstasy that left his body a long while without sense or breath.','Celsus'),
('st-augustine','St Augustine','The Father Montaigne cites more than any other, here for the man who fell into a swoon at any doleful cry and could be pinched or burned without feeling it, and for the man who could command his rear at will.','St. Augustine|St. Augustin','supporting','religious-figure'),
('jacques-pelletier','Jacques Pelletier','Who lived in Montaigne’s house and gave him the graven gold plate against sunstroke that Montaigne then used, with some private instructions and his own nightgown, to cure a bridegroom of an imagined impotence.','Jaques Pelletier|Jacques Pelletier'),
('amasis','Amasis, King of Egypt','Who married the beautiful Greek Laodice, found himself quite another man with her, threatened to kill her for a witch — and after vows to Venus was divinely restored the first night after his sacrifices.','Amasis'),
('laodice','Laodice','The Greek virgin Amasis married and at first could not enjoy.','Laodice'),
('venus','Venus','The goddess to whom Amasis made his vows, and was restored.','Venus','reference','deity'),
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
('macareus','Macareus','The third of them.','Macareus','reference','mythological-figure'),
('cotta','Cotta','The speaker in Cicero whose rule Montaigne adopts: in a question of religion, follow the high priests and not the philosophers.','Cotta','reference','literary-figure'),
('coruncanius','T. Coruncanius','One of the three high priests Cotta says he follows rather than the Stoics.','Coruncanius'),
('publius-scipio-pontifex','P. Scipio','Another of the three high priests in Cotta’s list. Not Scipio Africanus, nor Pompey’s father-in-law.'),
('scaevola','P. Scaevola','The third of the three high priests.','Scaevola'),
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
('livia','Livia','Augustus’s wife, who asked whether he would take a woman’s counsel and then gave the advice that ended the conspiracies: severity has got you nothing — Lepidus followed Salvidienus, Murena Lepidus, Caepio Murena, Egnatius Caepio — now try clemency.','Livia','supporting'),
('lepidus-conspirator','Lepidus','One of the conspirators in Livia’s list, punished before Cinna and followed by another. Neither the Marcus Aemilius Lepidus of 3:15 nor the Aemilius Lepidus who died of a stumble.'),
('salvidienus','Salvidienus','The first name in Livia’s list of conspirators punished to no purpose.','Salvidienus'),
('murena','Murena','The third name in it.','Murena'),
('caepio','Caepio','The fourth.','Caepio'),
('egnatius','Egnatius','The last, and the proof that severity had settled nothing.','Egnatius'),
('paulli','The Paulli','One of the great Roman houses Augustus names to Cinna as men who would never endure him. The older edition prints the family in the singular, Paulus, and the modern in the plural.','Paulus|Paulli','reference','group'),
('fabii','The Fabii','Another of them — Fabius in the older edition, Fabii in the modern.','Fabius|Fabii','reference','group'),
('cossii','The Cossii','Another.','Cossii','reference','group'),
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
('john-v-brittany','John V','Francis of Brittany’s father.','John V'),
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

print(len(entities),'entities authored: chapters 1-24')
Path(__file__).parent.joinpath('editorial.json').write_text(json.dumps(dict(
 contentVersion='2026-09-12.3',
 coverage='Both full English editions, chapters 1-24 of 107. Named persons and the gods Montaigne treats as agents. Peoples, places, schools of philosophy and book titles are not cast.',
 entities=[e for e in entities if e['name']!='unused']),ensure_ascii=False,indent=2)+'\n')
