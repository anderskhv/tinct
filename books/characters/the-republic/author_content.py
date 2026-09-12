"""Manually authored recognition cards for both full English texts of the Republic.

Ten books, 4,308 paragraphs per edition, aligned paragraph for paragraph. The
original is Jowett's translation; the modern edition is a contemporary rendering
of the same text.

A dialogue has no speaker tags. Socrates narrates in the first person and the
others are "he said", so a reader can lose track of who is arguing within a page
of Book 1. The cards exist mostly for two groups: the eleven men in Cephalus's
house, and the enormous cast of poets, lawgivers, tyrants and Homeric heroes
that Socrates quotes, praises and proposes to censor.

Scope: the speakers, the people the dialogue names, gods, heroes, named peoples,
and the personified powers of the myth of Er. Places, planets, festivals and the
titles of poems are not cast.
"""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

# ------------------------------------------------------- the men in the house
for row in [
('socrates','Socrates','The narrator: the whole dialogue is Socrates telling someone, the next day, what was said at the Piraeus. He asks the questions, takes the argument wherever it goes, and builds a city in speech to find out what justice is.','Socrates','central'),
('glaucon','Glaucon','Plato’s elder brother, and Socrates’s main partner from Book 2 onward. He revives Thrasymachus’s case in its strongest form — the ring of Gyges, the perfectly unjust man honoured and the perfectly just man crucified — precisely because he wants it refuted.','Glaucon','central'),
('adeimantus','Adeimantus','Plato’s other brother, who takes over the challenge from Glaucon: it is not the gods or justice people believe in, he says, but the reputation of justice. He is the more sceptical of the two and the harder to satisfy.','Adeimantus','major'),
('polemarchus','Polemarchus','Cephalus’s son, who stops Socrates in the road and will not let him leave. He inherits his father’s argument and defines justice as helping friends and harming enemies — the position Socrates takes apart first.','Polemarchus','major'),
('thrasymachus','Thrasymachus','The sophist from Chalcedon who breaks into the conversation "like a wild beast", declares that justice is nothing but the interest of the stronger, and is the only man in the dialogue who loses his temper. He stays to the end.','Thrasymachus','major'),
('cephalus','Cephalus','The old man whose house this is, rich, courteous and cheerful about dying. He opens the question of justice almost by accident and then leaves to see to the sacrifice, which is the last anyone sees of him.','Cephalus','major'),
('cleitophon','Cleitophon','The son of Aristonymus, who intervenes once to defend Thrasymachus’s definition against Socrates’s correction, and is ignored by both.','Cleitophon','supporting'),
('charmantides','Charmantides','Of the deme of Paeania; present in the room and silent throughout.','Charmantides','reference'),
('euthydemus','Euthydemus','Polemarchus’s brother, present and silent. Not the sophist of the dialogue that bears the name.','Euthydemus','reference'),
('lysias','Lysias','Polemarchus’s brother — the orator whose speeches survive — present and silent throughout.','Lysias','reference'),
('niceratus','Niceratus','The son of Nicias, who comes along with Polemarchus and says nothing.','Niceratus','reference'),
('nicias','Nicias','The Athenian general, named here only as Niceratus’s father.','Nicias','reference'),
('ariston','Ariston','The father of Glaucon and Adeimantus — and of Plato, who never appears in his own dialogue.','Ariston','reference'),
('aristonymus','Aristonymus','Cleitophon’s father.','Aristonymus','reference'),
('lysanias','Lysanias','Cephalus’s father, who reduced the family fortune that his own father had multiplied.','Lysanias','reference'),
]:add(*row)

# ------------------------------------------------- poets, sages and philosophers
for row in [
('homer','Homer','The educator of Greece, quoted more than anyone else here and then banished from the city in Book 10 — with real regret, and an invitation to poetry to argue back.','Homer','major','literary-figure'),
('hesiod','Hesiod','Named beside Homer as the other teacher of the Greeks, and censored for the same reason: the stories he tells about the gods.','Hesiod','supporting','literary-figure'),
('simonides','Simonides','The poet whose definition of justice — rendering to each what is owed — Polemarchus inherits and Socrates dismantles.','Simonides','supporting','literary-figure'),
('pindar','Pindar','Quoted by Cephalus for the line about hope, the nurse of old age, that cherishes the soul of the just man.','Pindar','reference','literary-figure'),
('aeschylus','Aeschylus','Quoted for the line about the just man who wishes to be and not to seem — and censored elsewhere for what he makes the gods say.','Aeschylus','supporting','literary-figure'),
('sophocles','Sophocles','Remembered by Cephalus for his answer about old age and desire: he was glad to have escaped a mad and savage master.','Sophocles','reference','literary-figure'),
('euripides','Euripides','Named once, dryly, for the line that makes tyrants wise.','Euripides','reference','literary-figure'),
('archilochus','Archilochus','The satirist, named for the fable of the fox — the model for the man who wants the reputation of justice without the thing.','Archilochus','reference','literary-figure'),
('phocylides','Phocylides','Quoted for the maxim that a man should practise virtue once he has enough to live on.','Phocylides','reference','literary-figure'),
('stesichorus','Stesichorus','The poet who said that only the shadow of Helen went to Troy — Socrates’s figure for what men fight over.','Stesichorus','reference','literary-figure'),
('musaeus','Musaeus','With Orpheus, the source of the books of rituals that promise the just a drunken eternity and the unjust a bath in mud.','Musaeus','supporting','literary-figure'),
('orpheus','Orpheus','Named with Musaeus for the same books — and again in the myth of Er, where his soul chooses to be born a swan because he will not be born of a woman.','Orpheus','supporting','mythological-figure'),
('thamyras','Thamyras','The singer whose soul chooses the life of a nightingale in the myth of Er.','Thamyras','reference','mythological-figure'),
('bias','Bias','One of the seven sages, named with Pittacus as the kind of man who might have said what Simonides is accused of saying.','Bias','reference'),
('pittacus','Pittacus','One of the seven sages, named beside Bias.','Pittacus','reference'),
('solon','Solon','The Athenian lawgiver, named among the men who actually improved a state — unlike Homer.','Solon','reference'),
('lycurgus','Lycurgus','The lawgiver to whom the good order of Sparta is credited, in the same comparison.','Lycurgus','reference'),
('charondas','Charondas','The lawgiver of Italy and Sicily, named in the same list.','Charondas','reference'),
('thales','Thales','Thales of Miletus, named as a man who left the world practical wisdom, which is what Homer is asked for and cannot supply.','Thales','reference'),
('anacharsis','Anacharsis','The Scythian, named beside Thales for the same reason.','Anacharsis','reference'),
('pythagoras','Pythagoras','Named as the founder of a way of life his followers still keep — the thing Homer never managed.','Pythagoras','supporting'),
('protagoras','Protagoras','The sophist of Abdera, named with Prodicus as a teacher men actually followed.','Protagoras','reference'),
('prodicus','Prodicus','The sophist of Ceos, named beside Protagoras.','Prodicus','reference'),
('creophylus','Creophylus','Homer’s companion, whose name means "flesh-child"; Socrates cannot resist the joke.','Creophylus','reference'),
('damon','Damon','The musical theorist whose counsel Socrates says they must take on rhythm and mode.','Damon','supporting'),
('herodicus','Herodicus','The trainer who invented valetudinarianism and made a long dying out of it — Socrates’s example of medicine gone wrong.','Herodicus','supporting'),
('heraclitus','Heraclitus','Named for the doctrine of a sun new every day, used against the sophists who are snuffed out faster.','Heraclitus','reference'),
('theages','Theages','Whose "bridle" — chronic ill health — kept him in philosophy when politics would have taken him.','Theages','reference'),
('asclepius','Asclepius','The physician-god, whose sons treat wounds and let the incurable die; Socrates approves, and refuses to believe the story that he took a bribe.','Asclepius','supporting','deity'),
('asclepiads','The Asclepiads','The guild of physicians descended from Asclepius, named for the medicine they practised before Herodicus spoiled it.','Asclepiads','reference','group'),
]:add(*row)

# ------------------------------------------------------- rulers, tyrants and men
for row in [
('themistocles','Themistocles','The Athenian, remembered by Cephalus for his answer to the man from Seriphos: neither of us would have been famous in the other’s city.','Themistocles','reference'),
('periander','Periander','The tyrant of Corinth, named with Perdiccas and Xerxes as the sort of man to whom Thrasymachus’s doctrine really belongs.','Periander','reference'),
('perdiccas','Perdiccas','The king of Macedon, named in the same list of tyrants.','Perdiccas','reference'),
('xerxes','Xerxes','The Persian king, named in the same list.','Xerxes','reference'),
('ismenias','Ismenias','The Theban, named last in the list — a man notorious for taking Persian money.','Ismenias','reference'),
('gyges','Gyges','The shepherd who found the ring that made him invisible, murdered his king and took the kingdom. Glaucon’s question is what any of us would do with two such rings.','Gyges','major','literary-figure'),
('croesus','Croesus','The Lydian king, named as Gyges’s descendant.','Croesus','reference'),
('midas','Midas','Named for wealth: even as rich as Midas, the Asclepiads would not treat a man not worth curing.','Midas','reference','mythological-figure'),
('polydamas','Polydamas','The wrestler, whose strength makes beef good for him — Socrates’s test of whether "the interest of the stronger" means anything.','Polydamas','reference'),
('leontius','Leontius','The son of Aglaion, who could not stop himself looking at the corpses by the execution ground and cursed his own eyes for it — Plato’s evidence that the soul has parts at war.','Leontius','supporting'),
('aglaion','Aglaion','Leontius’s father.','Aglaion','reference'),
('arion','Arion','The poet carried to shore by a dolphin; Socrates hopes for the same luck as he starts the argument about women.','Arion','reference','mythological-figure'),
('palamedes','Palamedes','The inventor who, whenever he appears in tragedy, makes Agamemnon look ridiculous by claiming to have invented number.','Palamedes','reference','mythological-figure'),
('er','Er','The son of Armenius, a Pamphylian, killed in battle and alive again on the twelfth day, who tells what he saw between the two worlds. The last three pages of the Republic are his.','Er','major','literary-figure'),
('armenius','Armenius','Er’s father.','Armenius','reference'),
('ardiaeus','Ardiaeus','Ardiaeus the Great, the tyrant of a city in Pamphylia who murdered his father and elder brother, and whom the mouth of the underworld refuses to release.','Ardiaeus','supporting','literary-figure'),
]:add(*row)

# ------------------------------------------------------------------ the gods
for row in [
('zeus','Zeus','The greatest of the gods, and the one most slandered by the poets: the two jars at his threshold, the dream sent to deceive Agamemnon, the grief over Sarpedon. Book 2 forbids all of it.','Zeus','major','deity'),
('cronus','Cronus','Whose retaliation against Uranus is the story Socrates says must not be told even if it were true.','Cronus','reference','deity'),
('uranus','Uranus','Whose treatment at his son’s hands is the greatest of the lies in the highest of quarters.','Uranus','reference','deity'),
('hera','Hera','Bound by her son Hephaestus in one of the stories to be banned.','Hera','reference','deity'),
('hephaestus','Hephaestus','The smith-god, thrown out of heaven for taking his mother’s part, and the one who binds Ares and Aphrodite — two more stories for the censor.','Hephaestus','supporting','deity'),
('apollo','Apollo','The god of Delphi, called Phoebus, whose oracle is left to legislate all religious matters — and who is nevertheless charged with lying to Thetis at her wedding.','Apollo|Phoebus','supporting','deity'),
('artemis','Artemis','Named for Bendis, the Thracian goddess whose new festival brings Socrates down to the Piraeus in the first sentence.','Artemis','reference','deity'),
('bendis','Bendis','The Thracian goddess whose festival, the Bendidea, is the occasion of the whole dialogue.','Bendis|Bendidea','supporting','deity'),
('athena','Athena','Named with Zeus as the supposed instigator of the broken truce at Troy — a thing Socrates will not have said in his city.','Athena|Athene','reference','deity'),
('themis','Themis','Named with Zeus for the same alleged mischief among the gods.','Themis','reference','deity'),
('poseidon','Poseidon','Theseus’s father in the story Socrates refuses to allow.','Poseidon','reference','deity'),
('pluto','Pluto','The lord of the underworld, whose fear of the earth splitting open is one of the lines to be struck out so that the guardians will not fear death.','Pluto','reference','deity'),
('hades','Hades','The underworld itself and its terrors — the names that must be taken out of the poems, and the place the myth of Er describes from the inside.','Hades','supporting','deity'),
('persephone','Persephone','Who granted Tiresias alone his reason after death.','Persephone','reference','deity'),
('ares','Ares','Bound in chains with Aphrodite by Hephaestus, in another story the guardians are not to hear.','Ares','reference','deity'),
('aphrodite','Aphrodite','Bound with Ares in the same story.','Aphrodite','reference','deity'),
('nemesis','Nemesis','Whom Socrates prays not to visit him for what he is about to say about women and children.','Nemesis','reference','deity'),
('eros','Eros','Love as a tyrant: the drone with wings, who takes command of the soul in Book 9 with madness for a bodyguard.','Eros|Love','supporting','deity'),
('the-muses','The Muses','Invoked mockingly in Book 8 to explain, in high style, how the perfect city falls — and the mothers, with the Moon, of the books of Musaeus and Orpheus.','Muses','supporting','deity'),
('necessity','Necessity','On whose spindle the whole universe turns in the myth of Er, with the Fates her daughters singing beside it.','Necessity','supporting','personification'),
('lachesis','Lachesis','Daughter of Necessity, who sings of what has been and lets each soul choose its next life. The blame is the chooser’s; God is blameless.','Lachesis','major','deity'),
('clotho','Clotho','Daughter of Necessity, who sings of the present and ratifies each choice.','Clotho','supporting','deity'),
('atropos','Atropos','Daughter of Necessity, who sings of what is to be and makes the thread irreversible.','Atropos','supporting','deity'),
('the-fates','The Fates','Lachesis, Clotho and Atropos together, robed in white and crowned, sitting round the spindle.','Fates','supporting','deity'),
('the-interpreter','The Interpreter','The prophet of Lachesis who casts the lots and sets out the lives for the souls to choose from.','Interpreter','supporting','mythical-being'),
('glaucus-sea-god','Glaucus','The sea-god so encrusted with shells and seaweed that he no longer looks like himself — Socrates’s image for the soul as we see it, disfigured by the body.','Glaucus','supporting','deity'),
('proteus','Proteus','The shape-changer, whom the poets are not to accuse of deceiving mortals.','Proteus','reference','deity'),
('thetis','Thetis','Achilles’s mother, at whose wedding Apollo is said to have prophesied falsely about her son.','Thetis','supporting','deity'),
('chiron','Chiron','The wise centaur who taught Achilles, and whose teaching makes the poets’ Achilles impossible.','Chiron|Cheiron','reference','mythical-being'),
('inachus','Inachus','The river of Argos, invoked in a fragment of tragedy quoted and rejected.','Inachus','reference','deity'),
('daedalus','Daedalus','Named for the excellence of his workmanship, as a standard of made things.','Daedalus','reference','mythological-figure'),
('marsyas','Marsyas','The satyr, whose instruments the city rejects in favour of Apollo’s — which is to say the lyre and not the flute.','Marsyas','reference','mythological-figure'),
]:add(*row)

# ------------------------------------------------ Homer's people, quoted and judged
for row in [
('achilles','Achilles','The son of a goddess, whom the poets show weeping, raging, dragging Hector round the walls and taking ransom for a corpse. Socrates will not have any of it read to the young.','Achilles','major','literary-figure'),
('peleus','Peleus','Achilles’s father, the gentlest of men, whose son the poets make ungovernable.','Peleus','reference','literary-figure'),
('patroclus','Patroclus','Achilles’s friend, over whose body Achilles cuts off the hair he had vowed to the river Spercheius.','Patroclus','supporting','literary-figure'),
('menoetius','Menoetius','Patroclus’s father.','Menoetius','reference','literary-figure'),
('sarpedon','Sarpedon','Zeus’s son, over whose fated death Zeus is made to lament — a lament Book 3 forbids.','Sarpedon','reference','literary-figure'),
('hector','Hector','Whose body Achilles drags round the tomb and sells back for gold.','Hector','supporting','literary-figure'),
('priam','Priam','Hector’s father, a man related to the gods, shown rolling in the dung and calling on every man by name.','Priam','supporting','literary-figure'),
('agamemnon','Agamemnon','The leader of the Greeks, deceived by Zeus’s lying dream, insulting the priest Chryses — and made ridiculous by Palamedes in every tragedy.','Agamemnon','supporting','literary-figure'),
('menelaus','Menelaus','Wounded by Pandarus and treated by the physicians in the old, plain way that Socrates approves.','Menelaus','reference','literary-figure'),
('atreus','Atreus','Father of the two leaders of the host, named where Chryses appeals to them.','Atreus','reference','literary-figure'),
('chryses','Chryses','The priest of Apollo whose appeal to Agamemnon opens the Iliad, and whose prayer brings the plague — Socrates’s worked example of the difference between narration and impersonation.','Chryses','supporting','literary-figure'),
('odysseus','Odysseus','Whose grandfather Autolycus taught him to steal, and whose soul, last to choose in the myth of Er, picks the life of a private man and says it would have done the same first.','Odysseus','supporting','literary-figure'),
('autolycus','Autolycus','Odysseus’s maternal grandfather, who surpassed all men in theft and perjury — and whom Homer, Socrates notes, admires for it.','Autolycus','reference','literary-figure'),
('alcinous','Alcinous','The king to whom Odysseus tells his tales; the myth of Er is expressly not one of them.','Alcinous','reference','literary-figure'),
('diomedes','Diomedes','Whose self-command Homer records approvingly — one of the few passages Book 3 keeps. The "necessity of Diomede" is a separate proverb for compulsion.','Diomedes|Diomede','supporting','literary-figure'),
('phoenix','Phoenix','Achilles’s tutor, whose advice — that gifts can move the gods — is not to be approved.','Phoenix','reference','literary-figure'),
('ajax','Ajax','Honoured with the long chine at the feast; in the myth of Er his soul, still bitter about the arms of Achilles, chooses to be a lion.','Ajax','supporting','literary-figure'),
('telamon','Telamon','Ajax’s father.','Telamon','reference','literary-figure'),
('eurypylus','Eurypylus','The wounded hero given a posset of Pramnian wine — evidence, Socrates says, of how medicine was practised before it was spoiled.','Eurypylus','reference','literary-figure'),
('pandarus','Pandarus','Whose arrow broke the truce, and who wounded Menelaus.','Pandarus','reference','literary-figure'),
('tiresias','Tiresias','The seer who alone keeps his reason among the dead.','Tiresias','reference','literary-figure'),
('niobe','Niobe','Whose sufferings the tragedians are not to stage as though a god had caused them.','Niobe','reference','mythological-figure'),
('pelops','Pelops','Whose house is named with Niobe and Troy among the subjects the poets must handle differently.','Pelops','reference','mythological-figure'),
('theseus','Theseus','Poseidon’s son, whose rape of Persephone with Peirithous Socrates refuses to believe of a god’s child.','Theseus','reference','mythological-figure'),
('peirithous','Peirithous','Zeus’s son, Theseus’s companion in the same story.','Peirithous','reference','mythological-figure'),
('helen','Helen','Or rather the shadow of Helen at Troy, over which men fought because they did not know the truth.','Helen','reference','literary-figure'),
('atalanta','Atalanta','Whose soul, in the myth of Er, cannot resist the glory of being born a male athlete.','Atalanta','reference','mythological-figure'),
('epeus','Epeus','The son of Panopeus, builder of the wooden horse, whose soul chooses to be born a craftswoman.','Epeus','reference','mythological-figure'),
('panopeus','Panopeus','Epeus’s father.','Panopeus','reference','mythological-figure'),
('thersites','Thersites','The buffoon of the Iliad, who in the myth of Er takes the last lot and puts on the form of an ape.','Thersites','reference','literary-figure'),
('chimera','The Chimera','Named with Scylla and Cerberus as the composite monsters of myth — Socrates’s model for the picture of the soul as lion, many-headed beast and man.','Chimera','reference','mythical-being'),
('scylla','Scylla','Named with the Chimera and Cerberus in the same list.','Scylla','reference','mythical-being'),
('cerberus','Cerberus','Named last in the same list.','Cerberus','reference','mythical-being'),
]:add(*row)

# -------------------------------------------------------------- named peoples
for row in [
('greeks','The Greeks','Called Hellenes: one people, who should never enslave one another, never strip their dead, and never burn one another’s land. War between them is not war but faction.','Greeks|Greek|Hellenes|Hellene|Hellenic|Hellas','supporting','group'),
('thracians','The Thracians','Whose procession at the Piraeus was as fine as the Athenians’, and who, with the Scythians, are the example of a spirited people.','Thracians|Thracian','reference','group'),
('athenians','The Athenians','Themistocles’s city, and the one Socrates is always measuring the city in speech against.','Athenian','reference','group'),
('spartans','The Spartans','Called Lacedaemonians: the model for the timocratic city of Book 8, and the first with the Cretans to exercise naked.','Spartans|Spartan|Lacedaemon','supporting','group'),
('cretans','The Cretans','Named with the Spartans for the same two things — the gymnasium, and the constitution Book 8 puts first among the four defective kinds.','Cretans|Cretan','reference','group'),
('scythians','The Scythians','Named with the Thracians for spiritedness, and as the people Anacharsis came from.','Scythians|Scythian','reference','group'),
('phoenicians','The Phoenicians','Named with the Egyptians for love of money — and the source of the "Phoenician tale", the noble lie of the metals in the soul.','Phoenicians|Phoenician','supporting','group'),
('egyptians','The Egyptians','Named beside the Phoenicians for the same trait.','Egyptians|Egyptian','reference','group'),
('achaeans','The Achaeans','Homer’s Greeks, against whom Apollo’s anger is invoked at the opening of the Iliad.','Achaeans','reference','group'),
('trojans','The Trojans','Named for the war that the poets are to treat differently.','Trojan','reference','group'),
('sophists','The Sophists','Blamed for corrupting the young — wrongly, Socrates says: the great sophist is the assembled public itself, and the teachers only sell back its opinions.','Sophists|Sophist','supporting','group'),
('pythagoreans','The Pythagoreans','Who say that astronomy and harmonics are sister sciences — a view Socrates accepts and then makes stranger.','Pythagoreans|Pythagorean','reference','group'),
]:add(*row)

# --------------------------------------------------------- the powers of Book 8
for row in [
('insolence','Insolence','One of the four false powers escorted into the young man’s soul with garlands, under the names of good breeding, freedom, magnificence and courage.','Insolence','supporting','personification'),
('anarchy','Anarchy','Brought in with Insolence, and renamed liberty.','Anarchy','reference','personification'),
('waste','Waste','Brought in with them, and renamed magnificence.','Waste','reference','personification'),
('shamelessness','Shamelessness','The fourth, renamed courage.','Shamelessness','reference','personification'),
('the-forms','The Forms','The things themselves — absolute beauty, absolute good, the bed no carpenter made — which are known but not seen, while the many things are seen but not known. Everything in Books 5 to 7 turns on them.','Forms|Form','major','concept'),
]:add(*row)

print(len(entities),'entities')
Path(__file__).parent.joinpath('editorial.json').write_text(json.dumps(dict(
 contentVersion='2026-09-12.1',
 coverage='Both full English editions, 10 books and 4,308 paragraphs. The speakers, the people the dialogue names, gods, heroes, named peoples, and the personified powers of the myth of Er. Places, planets, festivals and the titles of poems are not cast.',
 entities=entities),ensure_ascii=False,indent=2)+'\n')
