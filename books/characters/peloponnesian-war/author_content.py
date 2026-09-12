"""Manually authored recognition cards for both full English texts of the History
of the Peloponnesian War.

Crawley's translation in both editions, 26 chapters covering Thucydides's eight
books, 998 paragraphs per edition, aligned paragraph for paragraph. The modern
edition modernises the sentence rhythm; the transliterations are almost entirely
the same, which is unusual in this library and means most of the work here is
namesakes rather than spelling variants.

AUTHORING IS IN PROGRESS. Book 1 (chapters 1-5) is authored. Chapters 6-26 are
not yet done and the package must not be integrated until they are.

Scope: named people and named peoples. Cities, rivers, mountains, seas and
countries are not cast, even where Thucydides treats them as actors.
"""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person',updates=None):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=updates or []))

# ============================================ BOOK 1, CHAPTER 1 — the archaeology
for row in [
('thucydides','Thucydides','The Athenian who wrote this. He began at the moment the war broke out, judging it would be greater than any before, and he says plainly what he did about the speeches: he made the speakers say what the occasion called for, keeping as close as he could to the general sense of what was really said. The narrative he tested by the most severe scrutiny he could manage, since eye-witnesses of the same event do not agree. He wrote it, he says, not as an essay to win the applause of the moment but as a possession for all time.','','central'),
('thucydides-samos','Thucydides','One of the three commanders of the forty ships that reinforced the siege of Samos. He is named without a patronymic, and the history never says whether the author means himself.','','reference'),
('hellen','Hellen','Deucalion’s son, whose strength in Phthiotis gave the country its name — though a long time passed, Thucydides says, before Hellenes meant all of it.','Hellen','reference','mythological-figure'),
('deucalion','Deucalion','Hellen’s father.','Deucalion','reference','mythological-figure'),
('homer','Homer','Thucydides’s chief witness for the age before the war, and his chief problem with it. Homer never calls the Greeks Hellenes except for Achilles’s men, never uses the word barbarian, and puts the fleet at twelve hundred ships — evidence to be used, with the exaggeration a poet is licensed to use discounted out of it.','Homer','major'),
('achilles','Achilles','Whose followers out of Phthiotis are the only men Homer calls Hellenes.','Achilles','reference','mythological-figure'),
('minos','Minos','The first man tradition names as having built a navy. He took what is now the Hellenic sea, ruled the Cyclades, expelled the Carians and installed his own sons, and put down piracy — a necessary step, Thucydides notes, to secure the revenues for himself.','Minos','supporting','mythological-figure'),
('agamemnon','Agamemnon','Who raised the force against Troy — by superiority of strength rather than by Tyndareus’s oaths, and by fear as much as goodwill, in Thucydides’s reading. His own contingent was the largest and he supplied the Arcadians’ ships; Homer calls him king of many an isle and of all Argos, which he could not have been without a fleet.','Agamemnon','supporting','mythological-figure'),
('tyndareus','Tyndareus','Whose oaths bound Helen’s suitors to follow Agamemnon — not, Thucydides thinks, the real reason they went.','Tyndareus','reference','mythological-figure'),
('pelops','Pelops','Who arrived from Asia among a needy population with vast wealth and acquired such power that, foreigner though he was, the country was named after him.','Pelops','supporting','mythological-figure'),
('eurystheus','Eurystheus','Killed in Attica by the Heraclids. He had entrusted Mycenae and the government to his mother’s brother Atreus when he set out, and did not return.','Eurystheus','supporting','mythological-figure'),
('atreus','Atreus','Eurystheus’s mother’s brother, who had left his father after the death of Chrysippus, and who took up the sceptre of Mycenae at the wish of the Mycenaeans when Eurystheus did not come back — so putting the line of Pelops above the line of Perseus.','Atreus','supporting','mythological-figure'),
('chrysippus','Chrysippus','Whose death had driven Atreus from his father.','Chrysippus','reference','mythological-figure'),
('perseus','Perseus','Whose descendants the descendants of Pelops came to surpass.','Perseus','reference','mythological-figure'),
('philoctetes','Philoctetes','Whose ships in Homer’s catalogue carry fifty men each, all of them rowers and bowmen — the minimum against the Boeotian hundred and twenty.','Philoctetes','reference','mythological-figure'),
('ameinocles','Ameinocles','The Corinthian shipwright who built four ships for the Samians, nearly three hundred years before the end of this war — Thucydides’s earliest date.','Ameinocles','reference'),
('cyrus','Cyrus','First king of the Persians, under whom the Ionians built up their naval strength; he dethroned Croesus, overran everything between the Halys and the sea, and did not stop until he had taken the cities of the coast.','','supporting'),
('cambyses','Cambyses','Cyrus’s son, in whose reign Polycrates held Samos.','Cambyses','reference'),
('polycrates','Polycrates','Tyrant of Samos, whose navy reduced many of the islands; he took Rhenea and consecrated it to the Delian Apollo.','Polycrates','supporting'),
('darius','Darius','Cambyses’s successor, who reduced the islands with the Phoenician navy; the Sicilian tyrants and the Corcyraeans got their galleys only shortly before his death.','','supporting'),
('xerxes','Xerxes','Whose expedition closes Thucydides’s naval history: after it there were no fleets of consequence in Hellas until the war with Aegina and the prospect of invasion let Themistocles build the one that fought at Salamis.','Xerxes','major'),
('croesus','Croesus','Dethroned by Cyrus.','Croesus','reference'),
('hipparchus','Hipparchus','Hippias’s brother, killed by Harmodius and Aristogiton near the temple of the daughters of Leos while he was arranging the Panathenaic procession. The Athenian public imagines he was tyrant when he died; Thucydides puts the correction in his chapter on how carelessly men take the traditions even of their own country.','Hipparchus','major'),
('harmodius','Harmodius','Who with Aristogiton suspected on the day itself that they had been betrayed, concluded that Hippias had been warned, and — unwilling to be arrested and lose their lives for nothing — fell on the brother instead of the tyrant.','Harmodius','major'),
('aristogiton','Aristogiton','Harmodius’s fellow conspirator.','Aristogiton','major'),
('hippias','Hippias','The eldest of Pisistratus’s sons and the man who actually held supreme power — the one the conspirators meant to kill, and the one their accomplices had warned.','','major'),
('pisistratus','Pisistratus','Whose sons were Hippias, Hipparchus and Thessalus.','','supporting'),
('thessalus','Thessalus','The third of Pisistratus’s sons.','Thessalus','reference'),
('leos','Leos','Whose daughters’ temple stood where Hipparchus was killed.','Leos','reference','mythological-figure'),
]:add(*row)

# ================================ BOOK 1, CHAPTER 2 — Epidamnus, Corcyra, Potidaea
for row in [
('phalius','Phalius','Eratocleides’s son, of the Heraclid family, summoned from Corinth as ancient custom required to found Epidamnus for Corcyra.','Phalius','reference'),
('eratocleides','Eratocleides','Phalius’s father.','Eratocleides','reference'),
('aristeus-pellichas','Aristeus','Pellichas’s son, first-named of the three admirals of the seventy-five ships Corinth sent to Epidamnus — and beaten off Leukimme with fifteen ships lost. Not the Aristeus who commanded at Potidaea.','','supporting'),
('pellichas','Pellichas','Aristeus the admiral’s father.','Pellichas','reference'),
('callicrates','Callicrates','Callias’s son, the second of the three Corinthian admirals.','Callicrates','reference'),
('callias-father-of-callicrates','Callias','Callicrates the Corinthian admiral’s father. Not the Athenian general killed at Potidaea.','','reference'),
('timanor','Timanor','Timanthes’s son, the third Corinthian admiral.','Timanor','reference'),
('timanthes','Timanthes','Timanor’s father.','Timanthes','reference'),
('archetimus','Archetimus','Eurytimus’s son, who commanded the Corinthian troops with Isarchidas.','Archetimus','reference'),
('eurytimus','Eurytimus','Archetimus’s father.','Eurytimus','reference'),
('isarchidas','Isarchidas','Isarchus’s son, the other commander of the Corinthian troops.','Isarchidas','reference'),
('isarchus','Isarchus','Isarchidas’s father.','Isarchus','reference'),
('meikiades','Meikiades','First-named of the three admirals of the hundred and ten Corcyraean ships at Sybota, each commanding one squadron of the line.','Meikiades','reference'),
('aisimides','Aisimides','The second Corcyraean admiral.','Aisimides','reference'),
('eurybatus','Eurybatus','The third Corcyraean admiral.','Eurybatus','reference'),
('xenoclides','Xenoclides','Euthycles’s son, the Corinthian commander of the hundred and fifty ships, with four colleagues.','Xenoclides','reference'),
('euthycles','Euthycles','Xenoclides’s father.','','reference'),
('lacedaemonius','Lacedaemonius','Cimon’s son, first-named of the three commanders of the ten Athenian ships sent to Corcyra under orders not to collide with the Corinthian fleet — orders they kept until the rout made them impossible.','Lacedaemonius','reference'),
('cimon','Cimon','Miltiades’s son. He took Eion on the Strymon from the Medes and enslaved it, enslaved Scyros, won both battles at the Eurymedon on the same day and destroyed two hundred Phoenician ships, brought the Athenians to Ithome when Sparta asked for their siege-craft, and died at the siege of Kitium in Cyprus. Lacedaemonius was his son.','Cimon','major'),
('miltiades','Miltiades','Cimon’s father.','Miltiades','reference'),
('diotimus','Diotimus','Strombichus’s son, the second of the three commanders of the ten ships.','','reference'),
('strombichus','Strombichus','Diotimus’s father.','Strombichus','reference'),
('proteas','Proteas','Epicles’s son, the third commander of the ten ships.','','reference'),
('epicles','Epicles','Proteas’s father.','','reference'),
('glaucon','Glaucon','Leagrus’s son, who brought the twenty Athenian reinforcing ships up through the corpses and the wrecks to the Corcyraean camp at Leukimme after dark — and was very nearly taken for the enemy.','Glaucon','reference'),
('leagrus','Leagrus','Glaucon’s father.','Leagrus','reference'),
('andocides','Andocides','Leogoras’s son, the other commander of the twenty ships.','Andocides','reference'),
('leogoras','Leogoras','Andocides’s father.','Leogoras','reference'),
('perdiccas','Perdiccas','Alexander’s son and king of the Macedonians, turned from an old Athenian friend and ally into an enemy because Athens allied with his brother Philip and with Derdas. He worked on Lacedaemon and on Corinth to get Potidaea into revolt, persuaded the Chalcidians to demolish their seaboard towns and settle inland at Olynthus on land he gave them round Lake Bolbe, and changed sides twice in one campaign — deputing Iolaus to command the cavalry he had just brought back to the Potidaean side.','Perdiccas','major'),
('alexander-macedon','Alexander','Perdiccas’s father, king of the Macedonians. Pydna was in his dominions.','','supporting'),
('philip-macedon','Philip','Perdiccas’s brother, leagued with Derdas against him and allied with Athens; the six hundred Macedonian horse that rode with the Athenians to Potidaea were his followers and Pausanias’s.','','supporting'),
('derdas','Derdas','Leagued with Philip against Perdiccas; his brothers invaded Macedonia from the interior alongside the Athenians.','Derdas','supporting'),
('pausanias-macedon','Pausanias','The Macedonian whose horsemen rode with Philip’s on the Athenian side to Potidaea. Thucydides says nothing else about him, and he is not the Spartan regent.','','reference'),
('archestratus','Archestratus','Lycomedes’s son, in command of the thirty ships and thousand infantry first sent to Macedonia, with orders to take hostages from the Potidaeans, raze the wall, and watch the neighbouring cities.','','supporting'),
('lycomedes','Lycomedes','Archestratus’s father.','','reference'),
('aristeus-adimantus','Aristeus','Adimantus’s son, always a steady friend of the Potidaeans — most of the Corinthian volunteers went out of love for him. Made general of all the infantry, he won with his own wing and lost with the rest, and got most of his men into Potidaea at a run along the breakwater through the sea. When the investment closed he advised all but five hundred to sail out so the provisions would last, offered to stay himself, could not persuade them, and slipped past the guardships alone to carry on the war from Chalcidice. Not the admiral beaten at Epidamnus.','','major'),
('adimantus','Adimantus','Aristeus of Potidaea’s father.','Adimantus','reference'),
('callias-calliades','Callias','Calliades’s son, the Athenian general of the two thousand infantry and forty ships sent against the revolted towns, and one of the hundred and fifty Athenian dead in the victory at Potidaea. Not the Corinthian admiral’s father.','','supporting'),
('calliades','Calliades','Callias the Athenian general’s father.','Calliades','reference'),
('iolaus','Iolaus','Perdiccas’s deputy in command of the cavalry at Potidaea.','Iolaus','reference'),
('phormio','Phormio','Asopius’s son, who brought sixteen hundred Athenian infantry round to the Pallene side of Potidaea, fixed his headquarters at Aphytis, and raised the works nobody had dared to raise — closing the investment on both sides. He then used the same force to ravage Chalcidice and Bottica and take some of the towns.','Phormio','major'),
('asopius','Asopius','Phormio’s father.','','reference'),
]:add(*row)

# ================================= BOOK 1, CHAPTER 3 — the congress at Lacedaemon
for row in [
('archidamus','Archidamus','The Lacedaemonian king with the reputation of being wise and moderate, who told the assembly what a war against a distant people with money, ships, horses and tributary allies would cost: they were inferior at sea, far worse off for money, and could not end it by burning fields. He asked for embassies and two or three years of preparation, said he feared they would leave the war as a legacy to their children, and was voted down.','Archidamus','major'),
('sthenelaidas','Sthenelaidas','The ephor who answered Archidamus — the Athenians had said a great deal in praise of themselves and nowhere denied the wrong, so they deserved double punishment, for having ceased to be good and for having become bad. He then refused to judge the shouting and made the assembly divide by walking to two sides of the room, so that they would have to declare themselves and their ardour for war would rise.','','supporting'),
]:add(*row)

# ============================ BOOK 1, CHAPTER 4 — from the Median War to this one
for row in [
('leotychides','Leotychides','King of the Lacedaemonians and commander of the Hellenes at Mycale, who went home with the Peloponnesian allies while the Athenians and the Ionians stayed to take Sestos.','Leotychides','supporting'),
('themistocles','Themistocles','The commander at Salamis, whom Thucydides calls the ablest judge of a sudden crisis and the best prophet of a distant future that ever was — genius by native ability, neither shaped nor supplemented by study. He got Athens walled by going to Sparta himself and stalling there while the whole city, women and children included, tore down buildings for materials; he finished Piraeus, told Athens to stick to the sea, and laid the foundations of the empire.','Themistocles','central','person',
 [{'after':[5,21],'body':'The commander at Salamis and the ablest man of his time, in Thucydides’s judgement, at meeting an emergency. Implicated in the inquiry into Pausanias’s Medism, already ostracised and living at Argos, he was hunted through the Peloponnese, refused by Corcyra, and took sanctuary at the hearth of Admetus the Molossian with the king’s child in his arms. He reached Artaxerxes by letter, asked a year’s grace to learn Persian, and ended governor of Magnesia — fifty talents a year for bread, Lampsacus for wine, Myos for the rest. Disease killed him, though there is a story of poison; his bones were brought home secretly, since it is against the law to bury a traitor in Attica.'}]),
('abronichus','Abronichus','Lysicles’s son, one of the two colleagues Themistocles had kept back in Athens until the wall was high enough to defend.','Abronichus','reference'),
('lysicles','Lysicles','Abronichus’s father.','','reference'),
('aristides','Aristides','Lysimachus’s son, Themistocles’s other colleague on the embassy that told Sparta the wall was up.','','supporting'),
('lysimachus','Lysimachus','Aristides’s father.','','reference'),
('pausanias-sparta','Pausanias','Cleombrotus’s son, sent out as commander-in-chief of the Hellenes, who took Cyprus and Byzantium and then lost the command by playing the autocrat: the Ionians and the newly liberated went over to the Athenians to be rid of him, and Sparta recalled him on charges of which Medism was the best founded and acquitted him of it.','','major','person',
 [{'after':[5,17],'body':'The hero of Plataea, and the reason the confederacy changed hands. Sent the King his captured kinsmen with a cover story and a letter offering to marry his daughter and make Sparta and Hellas subject to him; came back from Byzantium in Median dress with a Persian table and a bodyguard of Medes and Egyptians. He had put his own couplet on the tripod at Delphi and had it erased, was intriguing with the Helots with promises of freedom and citizenship, and was undone by his own courier, who counterfeited the seal and found the order for his death. He ran for the temple of the goddess of the Brazen House, was walled in, and was carried out to die on the threshold; Delphi made Sparta move the tomb and give the goddess two bronze statues for the one body.'}]),
('cleombrotus','Cleombrotus','Pausanias the regent’s father, and Nicomedes’s.','','reference'),
('dorkis','Dorkis','Sent out with a few others and a small force to replace Pausanias, and found the allies no longer willing to grant Lacedaemon the supremacy. He left, and Sparta sent no one after him.','Dorkis','reference'),
('hellanicus','Hellanicus','Who touched on the fifty years between the wars in his Athenian history — briefly, and not accurately in his dates. The only predecessor Thucydides names.','Hellanicus','reference'),
('inaros','Inaros','Psammetichus’s son, a Libyan king of the Libyans on the Egyptian border with his headquarters at Marea, who raised almost all Egypt against Artaxerxes and called in the Athenians — and who was betrayed, captured and crucified.','Inaros','supporting'),
('psammetichus','Psammetichus','Inaros’s father.','Psammetichus','reference'),
('artaxerxes','Artaxerxes','Xerxes’s son, newly come to the throne when Themistocles wrote to him; the king Egypt revolted from.','Artaxerxes','supporting'),
('amyrtaeus','Amyrtaeus','The king in the marshes, whom the Persians could not take because of the size of the marsh and because the marshmen are the most warlike of the Egyptians — and who afterwards got sixty of Cimon’s ships.','Amyrtaeus','reference'),
('leocrates','Leocrates','Stroebus’s son, who commanded the landing and the siege after the great sea-battle off Aegina.','Leocrates','reference'),
('stroebus','Stroebus','Leocrates’s father.','Stroebus','reference'),
('myronides','Myronides','Who marched into the Megarid with the old men and the boys left in the city, fought the Corinthians to a draw, and when they came back twelve days later to set up their own trophy cut off the party setting it up and stoned a whole detachment to death in a walled field. Sixty-two days after Tanagra he beat the Boeotians at Oenophyta.','Myronides','supporting'),
('nicomedes','Nicomedes','Cleombrotus’s son, acting for the boy king Pleistoanax, who brought fifteen hundred Lacedaemonians and ten thousand allies to the help of Doris and then had to sit in Boeotia deciding which way home — encouraged by a party in Athens that wanted the democracy and the Long Walls stopped.','Nicomedes','supporting'),
('pleistoanax','Pleistoanax','Pausanias’s son, king of the Lacedaemonians: a minor when Nicomedes acted for him, and in command himself of the invasion that reached Eleusis and Thrius and went no further.','Pleistoanax','supporting'),
('tolmides','Tolmides','Tolmaeus’s son, who sailed round the Peloponnese, burnt the Lacedaemonian dockyard, took Chalcis and beat the Sicyonians — and who was caught at Coronea on the way home from Chaeronea by the Boeotian exiles, and lost Boeotia with the battle.','','supporting'),
('tolmaeus','Tolmaeus','Tolmides’s father.','','reference'),
('megabazus','Megabazus','The Persian sent to Lacedaemon with money to buy an invasion of Attica and draw the Athenians out of Egypt, and recalled with what was left of it when the money was simply being wasted. Not Megabuzus.','Megabazus','reference'),
('megabuzus','Megabuzus','Zopyrus’s son, sent into Egypt with a large army instead: he beat the Egyptians in the field, drove the Hellenes out of Memphis, penned them on Prosopitis for a year and a half, and then drained the canal, left their ships dry, and marched across on foot. Not Megabazus.','Megabuzus','supporting'),
('zopyrus','Zopyrus','Megabuzus’s father.','Zopyrus','reference'),
('orestes','Orestes','Echecratidas’s son, the Thessalian king in exile who persuaded Athens to restore him — and went home with them again, the expedition having accomplished nothing because of the Thessalian cavalry.','Orestes','reference'),
('echecratidas','Echecratidas','Orestes’s father.','Echecratidas','reference'),
('pericles','Pericles','Xanthippus’s son, who took a thousand men from Pegae to Sicyon and Acarnania, brought the army back from Euboea when Megara revolted and then subdued Euboea outright, and commanded the forty-four ships that beat the Samians off Tragia.','Pericles','central','person',
 [{'after':[5,29],'body':'Xanthippus’s son, the most powerful man of his time and the foremost Athenian statesman, ablest alike in counsel and in action. He was connected with the Cylonian curse on his mother’s side, which is why Sparta’s first embassy demanded the accursed be driven out — not expecting to succeed, but to make his countrymen think the war his bad luck. He answered the ultimatum with no concession: the trifle of the Megara decree, he said, contains the whole trial of their resolve; Athens should think of herself as an island, guard the sea and the city, and mourn the loss of men rather than of houses and land, because men gain houses and land and not the reverse. What he feared, he said, was Athenian blunders rather than the enemy’s designs.'}]),
('xanthippus','Xanthippus','Pericles’s father.','Xanthippus','reference'),
('pissuthnes','Pissuthnes','Hystaspes’s son, satrap of Sardis, who took the Athenian garrison and its commanders off the Samian rebels.','Pissuthnes','supporting'),
('hystaspes','Hystaspes','Pissuthnes’s father.','Hystaspes','reference'),
('stesagoras','Stesagoras','Who left Samos with five ships to bring up the Phoenician fleet — which is why Pericles was off Caria when the Samians broke out and held their own waters for fourteen days.','Stesagoras','reference'),
('hagnon','Hagnon','One of the three commanders of the forty ships that reinforced the siege of Samos.','','supporting'),
('tlepolemus','Tlepolemus','Who brought twenty more ships to Samos with Anticles.','Tlepolemus','reference'),
('anticles','Anticles','Tlepolemus’s colleague.','Anticles','reference'),
]:add(*row)

# =================== BOOK 1, CHAPTER 5 — Cylon, Pausanias, Themistocles, Pericles
for row in [
('cylon','Cylon','An Olympic victor of good birth and powerful position, married to a daughter of Theagenes of Megara, who asked at Delphi and was told to seize the Acropolis at the grand festival of Zeus. He took it during the Olympic festival in the Peloponnese, never asking which festival the god meant and never being told — the Athenians have a grand festival of Zeus Meilichios of their own, the Diasia. He and his brother got away; the rest starved at the altar, were raised on a promise of no harm, and were killed. The men who killed them were the accursed, they and their descendants, and driving them out was the first thing Sparta demanded of Athens before the war.','Cylon','major'),
('theagenes','Theagenes','Tyrant of Megara, whose daughter Cylon married and whose force he used.','','supporting'),
('cleomenes','Cleomenes','Of Lacedaemon, who with an Athenian faction drove the accursed out a second time: the living expelled, the bones of the dead taken up.','','supporting'),
('gongylus','Gongylus','The Eretrian whom Pausanias put in charge of Byzantium and the captured kinsmen of the King, and who carried the letter offering to make Sparta and Hellas subject to Persia.','','supporting'),
('artabazus','Artabazus','Pharnaces’s son, sent down to the sea to replace Megabates in the satrapy of Daskylion, to show Pausanias the royal seal, and to carry the King’s business with him with all care and fidelity.','','supporting'),
('pharnaces','Pharnaces','Artabazus’s father.','','reference'),
('megabates','Megabates','The governor of the satrapy of Daskylion whom Artabazus was sent to replace.','Megabates','reference'),
('pleistarchus','Pleistarchus','Leonidas’s son, the boy king Pausanias was regent for, and his first cousin.','Pleistarchus','reference'),
('leonidas','Leonidas','Pleistarchus’s father.','Leonidas','reference'),
('admetus','Admetus','The Molossian king, not on friendly terms with Themistocles, who was out when Themistocles arrived; his wife told the suppliant to take their child in his arms and sit by the hearth. He raised him up with the boy still in his arms, refused the Lacedaemonians whatever they said, and sent him overland to the other sea.','Admetus','supporting'),
('ramphias','Ramphias','First-named of the three ambassadors who brought the Lacedaemonian ultimatum: not a word on any of the old subjects, only that Lacedaemon wished the peace to continue and there was no reason it should not, if Athens would leave the Hellenes independent.','','supporting'),
('melesippus','Melesippus','The second of the three ambassadors.','','supporting'),
('agesander','Agesander','The third of the three ambassadors.','','reference'),
]:add(*row)

# ------------------------------------------------------------------------- gods
for row in [
('zeus','Zeus','Whose grand festival Cylon was told to wait for and did not identify — the Athenians have one of their own, to Zeus Meilichios the Gracious, kept outside the city at the Diasia with bloodless offerings. It is his suppliant at Ithome that an old oracle told Lacedaemon to release.','Zeus','supporting','deity'),
('hera','Hera','In whose temple at Corcyra the Epidamnian ambassadors sat as suppliants and were dismissed empty-handed.','Hera','supporting','deity'),
('apollo','Apollo','The god at Delphi, who told Epidamnus to hand the city to Corinth, told Cylon to take the Acropolis at the grand festival of Zeus without saying which, told Lacedaemon that if they put their whole strength into the war victory would be theirs and that he himself would be with them invoked or not, and ordered Pausanias’s tomb moved to the place of his death. His temple stands at Actium, and Polycrates gave him Rhenea.','Apollo|Phœbus|Phoebus','major','deity'),
('poseidon','Poseidon','From whose temple at Taenarus the Lacedaemonians raised the Helot suppliants and led them away and killed them — for which they believe the great earthquake at Sparta was retribution, and which the Athenians told them to drive out as a curse of their own.','Poseidon','supporting','deity'),
]:add(*row)

# ---------------------------------------------------------------------- peoples
for row in [
('athenians','The Athenians','Whose growth in power, and the alarm it inspired in Lacedaemon, Thucydides gives as the real cause of the war — the cause most kept out of sight in formal speech. Never displaced from Attica because the soil was poor, they laid aside their arms first, took to the sea after the Mede, and turned the confederacy into an empire.','Athenians|Athenian','central','group'),
('lacedaemonians','The Lacedaemonians','Slow to go to war except under necessity, with the same form of government for more than four hundred years and no tyrants; they put down the tyrannies of the rest of Hellas, led the alliance against the Mede, and exacted no tribute from their allies, only oligarchies. The Corinthians tell them to their faces that they are the only Hellenes who are inactive, and who defend themselves not by doing anything but by looking as though they might.','Lacedaemonians|Lacedaemonian|Spartans|Spartan','central','group'),
('peloponnesians','The Peloponnesians','Farmers without funds private or public, without experience of long wars overseas, and without the single council-chamber that prompt action needs — a diet of many peoples in which each state has an equal vote and pushes its own ends, so that nothing is done. That is Pericles’s account of them; their own is that they have numbers, experience, obedience, and the temple funds at Olympia and Delphi to hire away Athenian sailors with.','Peloponnesians','major','group'),
('corinthians','The Corinthians','Set on an isthmus and a commercial hub from time immemorial, the first to build galleys in Hellas and the first Hellenes to fight a sea-battle. They took over Epidamnus from a colony that despised them, lost at Leukimme, claimed the victory at Sybota, and canvassed the Peloponnese city by city for the war — speaking last at both congresses, after letting the other speakers inflame the room.','Corinthians|Corinthian','major','group'),
('corcyraeans','The Corcyraeans','Wealthy enough to stand comparison with the richest in Hellas, proud of a naval reputation they trace to the Phaeacians, and so placed that foreign ships must put in at them while they need not sail to anyone. They refused their own colonists, refused their mother city arbitration only after the siege was laid, and came to Athens with the offer of a hundred and twenty galleys and an argument about where the coming war would be fought.','Corcyraeans|Corcyraean','major','group'),
('hellenes','The Hellenes','Thucydides’s word for the Greeks as one people: the name did not exist before Hellen, Homer never uses it of all of them, and it was long in attaching itself to the whole. All of them were drawn into this war sooner or later, though some at first stayed neutral.','Hellenes|Hellene|Greeks','major','group'),
('potidaeans','The Potidaeans','A Corinthian colony on the isthmus of Pallene and tributary allies of Athens, ordered to raze the wall facing Pallene, give hostages and dismiss the Corinthian magistrates — and who revolted instead, with the Chalcidians and Bottiaeans, on a Lacedaemonian promise to invade Attica.','Potidæans|Potidaeans|Potidæan|Potidaean','major','group'),
('epidamnians','The Epidamnians','Whose city on the Ionic gulf grew large and then tore itself apart: the commons expelled the nobles, the nobles joined the barbarians and plundered them by sea and land, and their embassy to Corcyra was dismissed empty-handed from the temple of Hera. Delphi told them to give the city to Corinth.','Epidamnians|Epidamnian','supporting','group'),
('taulantians','The Taulantians','An Illyrian people, the barbarian neighbours of Epidamnus.','Taulantians','reference','group'),
('illyrians','The Illyrians','Whose help the Corcyraeans enlisted for the siege of Epidamnus.','Illyrians','reference','group'),
('ambraciots','The Ambraciots','Who sent volunteer settlers and troops to Epidamnus, eight ships for the convoy and twenty-seven for the fleet, and held the right wing with the Megarians at Sybota.','Ambraciots|Ambraciot','supporting','group'),
('leucadians','The Leucadians','Whose city was a Corinthian colony: they sent settlers to Epidamnus and ten ships twice, and had their territory ravaged by the Corcyraeans for it.','Leucadians','supporting','group'),
('megarians','The Megarians','Who left the Lacedaemonian alliance over a boundary war Corinth forced on them, were given long walls and an Athenian garrison, revolted and cut the garrison off — and who came to the congress with a long list of grievances, chief of them exclusion from the ports of the empire and the market of Athens. The decree excluding them was the one thing that could still have averted the war.','Megarians|Megarian','major','group'),
('aeginetans','The Aeginetans','Who sent no formal representatives to the congress for fear of Athens and were in private among the most insistent advocates for war, claiming Athens had denied them the independence the treaty guaranteed.','Aeginetans|Aeginetan|Eginetans|Eginetan','supporting','group'),
('samians','The Samians','For whom Ameinocles built the first four ships, and who went to war with Miletus over Priene, were given a democracy, stole back their hostages from Lemnos, revolted, and held their own waters for fourteen days before a nine-month siege ended it.','Samians|Samian','major','group'),
('milesians','The Milesians','Beaten by Samos over Priene, and the complainants who brought Athens into the Samian war.','Milesians|Milesian','supporting','group'),
('thebans','The Thebans','Asked for money toward the Epidamnus convoy; and the people whose city had given the Mede his base of operations, which is the argument Sparta used against walls.','Thebans','supporting','group'),
('phliasians','The Phliasians','Asked for money toward the convoy.','Phliasians','reference','group'),
('eleans','The Eleans','Asked for hulls as well as money; the Corcyraeans burnt Cyllene, their harbour, for it.','Eleans|Elean','supporting','group'),
('sicyonians','The Sicyonians','Whose envoys went with the Corcyraeans to Corinth, who were beaten by Pericles at Sicyon and by Tolmides before him, and who were let into Megara before the revolt.','Sicyonians','supporting','group'),
('chalcidians','The Chalcidians','Of the Thracian seaboard, who joined the Potidaean revolt and, at Perdiccas’s urging, demolished their own towns and moved inland to Olynthus.','Chalcidians','supporting','group'),
('bottiaeans','The Bottiaeans','Who joined the revolt with the Chalcidians and the Potidaeans.','Bottiæans|Bottiaeans','reference','group'),
('macedonians','The Macedonians','Perdiccas’s people, whose six hundred horse followed Philip and Pausanias on the Athenian side at Potidaea and then rode back to the Athenians when the battle was decided.','Macedonians|Macedonian','supporting','group'),
('thracians','The Thracians','Who cut the ten thousand Athenian settlers off at Drabescus, taking the settlement at Nine Ways for an act of war.','Thracians','supporting','group'),
('carians','The Carians','Great pirates who colonized most of the islands, expelled from the Cyclades by Minos; more than half the graves opened when Athens purified Delos were theirs, known by the weapons and the manner of burial they still use.','Carians|Carian','supporting','group'),
('phoenicians','The Phoenicians','Islanders and pirates with the Carians; afterwards the King’s navy, which reduced the islands for Darius, lost two hundred ships at the Eurymedon, and was always expected and sometimes never came.','Phoenicians|Phoenician','supporting','group'),
('pelasgians','The Pelasgians','The name the country chiefly went by before Hellen, and the stock the Greek language branched off from.','Pelasgians|Pelasgian','reference','group'),
('boeotians','The Boeotians','Driven out of Arne by the Thessalians sixty years after Ilium and settled in the Cadmeis; beaten at Oenophyta and masters again after Coronea. Homer gives their ships a hundred and twenty men each, the maximum in the catalogue.','Boeotians|Boeotian','major','group'),
('thessalians','The Thessalians','Who drove the Boeotians out of Arne; whose cavalry went over to the Lacedaemonians during the battle at Tanagra; and whose horse kept the Athenians inside their camp at Pharsalus.','Thessalians|Thessalian','supporting','group'),
('dorians','The Dorians','Who with the Heraclids became masters of the Peloponnese twenty years after the Boeotian resettlement, and whose settlement in Lacedaemon was followed by faction for an unparalleled length of time.','Dorians|Dorian','supporting','group'),
('ionians','The Ionians','The colonies Athens sent out when Attica grew too small, whose golden grasshoppers and linen came from Athens; they built naval strength under Cyrus, were the first to ask Athens to take the lead against Pausanias, and are the people a Dorian city is being besieged by, which the Corinthians call a complete reversal of the natural order.','Ionians|Ionian','major','group'),
('heraclids','The Heraclids','Who killed Eurystheus in Attica and, with the Dorians, became masters of the Peloponnese; Phalius the founder of Epidamnus was of the family.','Heraclids|Heraclid|Heracleids','supporting','group'),
('mycenaeans','The Mycenaeans','Who feared the Heraclids and wanted Atreus to take the sceptre.','Mycenæans|Mycenaeans','reference','group'),
('trojans','The Trojans','Who held the field for ten years because the invaders were always dispersed for piracy and farming, and were always a match for the detachment left on duty.','Trojans','supporting','group'),
('medes','The Medes','The invader of the two invasions, and the measure Thucydides sets this war against: the Median War was the greatest event of past times and was settled in two sea-battles and two land-battles. The rock the barbarian was wrecked on, the Corinthians tell Sparta, was himself.','Medes|Mede|Median','major','group'),
('persians','The Persians','Whose grandees’ quarters were the few houses left standing in Athens, and who held the White Castle at Memphis and Sestos and Byzantium until they were taken.','Persians|Persian','supporting','group'),
('phocians','The Phocians','Who made an expedition against Doris, the original homeland of the Lacedaemonians, and were made to give the town back; Athens put the temple at Delphi into their hands.','Phocians','supporting','group'),
('locrians','The Locrians','The Ozolian Locrians, who still carry weapons in the old piratical way and from whom Athens took Naupactus; and the Opuntian Locrians, a hundred of whose richest men were taken as hostages after Oenophyta.','Locrians','supporting','group'),
('aetolians','The Aetolians','Who still live in the old way, with the custom of carrying arms kept up.','Aetolians','reference','group'),
('acarnanians','The Acarnanians','Who still live in the old way, like the Aetolians and the Ozolian Locrians.','Acarnanians','reference','group'),
('carthaginians','The Carthaginians','Beaten in a sea-fight by the Phocaeans while they were founding Marseilles.','Carthaginians','reference','group'),
('phocaeans','The Phocaeans','Who beat the Carthaginians at sea while founding Marseilles.','Phocaeans','reference','group'),
('egyptians','The Egyptians','Most of whom revolted from Artaxerxes under Inaros and were beaten back into subjection — except the marshmen, who are the most warlike of them and whose king in the marshes could not be taken.','Egyptians','supporting','group'),
('libyans','The Libyans','Inaros’s people, on the Egyptian border.','Libyans','reference','group'),
('helots','The Helots','Most of them descendants of the old Messenians enslaved in the famous war, which is why they all came to be called Messenians. They seceded to Ithome after the earthquake; Pausanias promised them freedom and citizenship to join him; and the suppliants raised from the temple of Poseidon at Taenarus and killed were Helots.','Helots|Helot','major','group'),
('perioeci','The Perioeci','The Thuriats and Aethaeans among them seceded to Ithome with the Helots.','Perioeci','reference','group'),
('messenians','The Messenians','The name all the Helots came to carry, because most of them descended from the Messenians enslaved in the famous war; the rebels at Ithome held out ten years and were let out of the Peloponnese on condition of never setting foot in it again.','Messenians','supporting','group'),
('thuriats','The Thuriats','Of the Perioeci, who seceded to Ithome.','Thuriats','reference','group'),
('aethaeans','The Aethaeans','Of the Perioeci, who seceded to Ithome with the Thuriats.','Æthæans|Aethaeans|Æthaeans','reference','group'),
('edonians','The Edonians','From whom Athens took Nine Ways, and at whose town of Drabescus the settlers were cut off.','Edonians','reference','group'),
('thasians','The Thasians','Who revolted over the trading posts on the Thracian coast and the mine, were beaten at sea and besieged, appealed to Lacedaemon, and gave up walls, ships, mainland possessions and the mine in the third year.','Thasians','supporting','group'),
('dolopians','The Dolopians','The population of Scyros, enslaved by Cimon.','Dolopian|Dolopians','reference','group'),
('cyprians','The Cyprians','Beaten with the Phoenicians and Cilicians off Salamis in Cyprus.','Cyprians','reference','group'),
('cilicians','The Cilicians','Beaten with the Phoenicians and Cyprians off Salamis in Cyprus.','Cilicians','reference','group'),
('argives','The Argives','Sparta’s enemy, whom the Athenians allied with the moment they were sent home from Ithome, and a thousand of whom marched with them to Tanagra. Themistocles in exile lived among them and kept secret hoards there.','Argives','supporting','group'),
('achaeans','The Achaeans','One of Homer’s names for the Greeks; and the people Pericles picked up on the way from Sicyon to Acarnania.','Achaeans','supporting','group'),
('danaans','The Danaans','One of Homer’s three names for the Greeks, with the Argives and the Achaeans.','Danaans','reference','group'),
('delphians','The Delphians','Into whose hands Lacedaemon put the temple in the sacred war, and out of whose hands Athens took it again.','Delphians','reference','group'),
('histiaeans','The Histiaeans','Alone of Euboea not settled by agreement: Athens expelled them from their homes and took the territory.','Histiaeans','reference','group'),
('byzantines','The Byzantines','Who revolted with the Samians and agreed to be subjects again, as before.','Byzantines','reference','group'),
('sermylians','The Sermylians','Many of whom Aristeus cut off in an ambush near their city.','Sermylians','reference','group'),
('zacynthians','The Zacynthians','A thousand of whose heavy infantry came to help the Corcyraeans and were posted on Point Leukimme.','Zacynthians','reference','group'),
('molossians','The Molossians','Admetus’s people, with whom Themistocles took sanctuary.','Molossian|Molossians','reference','group'),
('eretrians','The Eretrians','Whose old war with Chalcis was the nearest thing to a coalition in Hellas before the Median War; and Gongylus was one of them.','Eretrians|Eretrian','reference','group'),
('arcadians','The Arcadians','Whose part of the Peloponnese was poor enough to be left alone by the changes of masters, and whose ships at Troy were supplied by Agamemnon.','Arcadians','reference','group'),
('epidaurians','The Epidaurians','Who sent five ships for the Epidamnus convoy, beat the Athenians with the Corinthians at Haliae, and were let into Megara before the revolt.','Epidaurians','supporting','group'),
('hermionians','The Hermionians','Who sent one ship for the convoy; Pausanias took a galley of theirs on his own responsibility for his second voyage out.','Hermionians','reference','group'),
('troezenians','The Troezenians','Who sent two ships for the convoy.','Troezenians','reference','group'),
('chians','The Chians','Who with the Lesbians alone were never deprived of their ships and made to pay money instead, and who sent twenty-five ships to the siege of Samos.','Chians|Chian','supporting','group'),
('lesbians','The Lesbians','Who with the Chians alone kept their ships.','Lesbians|Lesbian','supporting','group'),
('phaeacians','The Phaeacians','Corcyra’s old inhabitants, from whom the Corcyraeans date the naval reputation they were at times openly proud of.','Phaeacians','reference','group'),
('tanagraeans','The Tanagraeans','Whose walls the Athenians dismantled after Oenophyta.','Tanagraeans','reference','group'),
('argilians','The Argilians','One of them was Pausanias’s favourite and most trusted servant, and the courier who counterfeited the seal, found the postscript ordering his own death, and turned informer.','Argilian|Argilians','reference','group'),
]:add(*row)

print(len(entities),'entities after Book 1')
Path(__file__).parent.joinpath('editorial.json').write_text(json.dumps(dict(
 contentVersion='2026-09-12.1',
 coverage='Both full English editions. BOOK 1 (chapters 1-5) is authored; chapters 6-26 are in progress. Named people and named peoples. Cities, rivers, mountains, seas and countries are not cast.',
 entities=[e for e in entities if e['name']!='unused']),ensure_ascii=False,indent=2)+'\n')
