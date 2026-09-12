"""Manually authored recognition cards for both full English texts of the History
of the Peloponnesian War.

Crawley's translation in both editions, 26 chapters covering Thucydides's eight
books, 998 paragraphs per edition, aligned paragraph for paragraph. The modern
edition modernises the sentence rhythm; the transliterations are almost entirely
the same, which is unusual in this library and means most of the work here is
namesakes rather than spelling variants.

AUTHORING IS IN PROGRESS. Books 1-6 (chapters 1-20) are authored. Chapters
21-26 are not yet done and the package must not be integrated until they are.

Scope: named people and named peoples. Cities, rivers, mountains, seas and
countries are not cast, even where Thucydides treats them as actors.
"""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person',updates=None):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',
                      snapshots=sorted(updates or [],key=lambda u:tuple(u['after']))))

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
('xenoclides','Xenoclides','Euthycles’s son, the Corinthian commander of the hundred and fifty ships at Sybota, with four colleagues — and, twenty years later, of the three hundred Corinthians who reached Ambracia by a hard march overland. The text spells him Xenoclides once and Xenocleides once.','Xenoclides|Xenocleides','supporting'),
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
('perdiccas','Perdiccas','Alexander’s son and king of the Macedonians, turned from an old Athenian friend and ally into an enemy because Athens allied with his brother Philip and with Derdas. He worked on Lacedaemon and on Corinth to get Potidaea into revolt, persuaded the Chalcidians to demolish their seaboard towns and settle inland at Olynthus on land he gave them round Lake Bolbe, and changed sides twice in one campaign — deputing Iolaus to command the cavalry he had just brought back to the Potidaean side.','Perdiccas','major','person',[{'after':[8,31],'body':'King of the Macedonians and nobody’s reliable ally. Reconciled to Athens and given Therme back, he at once joined Phormio against the Chalcidians; he had promised Sitalces something for the reconciliation and never paid it, and Sitalces came down with a hundred and fifty thousand men and the pretender Amyntas in his baggage. Perdiccas bought the retreat by promising his sister to Sitalces’s nephew — and gave Stratonice to Seuthes as promised. He also sent a thousand Macedonians to Cnemus in Acarnania without the Athenians knowing, and they arrived too late.'}]),
('alexander-macedon','Alexander','Perdiccas’s father, king of the Macedonians. Pydna was in his dominions.','','supporting'),
('philip-macedon','Philip','Perdiccas’s brother, leagued with Derdas against him and allied with Athens; the six hundred Macedonian horse that rode with the Athenians to Potidaea were his followers and Pausanias’s.','','supporting'),
('derdas','Derdas','Leagued with Philip against Perdiccas; his brothers invaded Macedonia from the interior alongside the Athenians.','Derdas','supporting'),
('pausanias-macedon','Pausanias','The Macedonian whose horsemen rode with Philip’s on the Athenian side to Potidaea. Thucydides says nothing else about him, and he is not the Spartan regent.','','reference'),
('archestratus','Archestratus','Lycomedes’s son, in command of the thirty ships and thousand infantry first sent to Macedonia, with orders to take hostages from the Potidaeans, raze the wall, and watch the neighbouring cities.','','supporting'),
('lycomedes','Lycomedes','Archestratus’s father.','','reference'),
('aristeus-adimantus','Aristeus','Adimantus’s son, always a steady friend of the Potidaeans — most of the Corinthian volunteers went out of love for him. Made general of all the infantry, he won with his own wing and lost with the rest, and got most of his men into Potidaea at a run along the breakwater through the sea. When the investment closed he advised all but five hundred to sail out so the provisions would last, offered to stay himself, could not persuade them, and slipped past the guardships alone to carry on the war from Chalcidice. Not the admiral beaten at Epidamnus.','','major','person',[{'after':[7,22],'body':'Adimantus’s son, the prime mover at Potidaea and in the Thracian towns, who went with the Lacedaemonian envoys to the King to ask for money. Sadocus seized them in Thrace and handed them over, and the Athenians killed them all the same day without a trial and threw the bodies into a pit — afraid that if Aristeus got away he would do them still more harm.'}]),
('adimantus','Adimantus','Aristeus of Potidaea’s father.','Adimantus','reference'),
('callias-calliades','Callias','Calliades’s son, the Athenian general of the two thousand infantry and forty ships sent against the revolted towns, and one of the hundred and fifty Athenian dead in the victory at Potidaea. Not the Corinthian admiral’s father.','','supporting'),
('calliades','Calliades','Callias the Athenian general’s father.','Calliades','reference'),
('iolaus','Iolaus','Perdiccas’s deputy in command of the cavalry at Potidaea.','Iolaus','reference'),
('phormio','Phormio','Asopius’s son, who brought sixteen hundred Athenian infantry round to the Pallene side of Potidaea, fixed his headquarters at Aphytis, and raised the works nobody had dared to raise — closing the investment on both sides. He then used the same force to ravage Chalcidice and Bottica and take some of the towns.','Phormio','major','person',[{'after':[8,21],'body':'Asopius’s son, with twenty ships at Naupactus against forty-seven. He sailed round the Peloponnesian circle until the morning wind came down the gulf and their oars fouled, then gave the signal and took twelve ships. Six days later, with seventy-seven against his twenty, he was forced along the shore and lost nine of them — until one Athenian ship rounded a moored merchantman, rammed the Leucadian chasing her, and turned the day. He told his men beforehand that the Peloponnesians feared their irrational audacity more than they would have feared a proportionate force.'}]),
('asopius','Asopius','Phormio’s father.','','reference'),
]:add(*row)

# ================================= BOOK 1, CHAPTER 3 — the congress at Lacedaemon
for row in [
('archidamus','Archidamus','The Lacedaemonian king with the reputation of being wise and moderate, who told the assembly what a war against a distant people with money, ships, horses and tributary allies would cost: they were inferior at sea, far worse off for money, and could not end it by burning fields. He asked for embassies and two or three years of preparation, said he feared they would leave the war as a legacy to their children, and was voted down.','Archidamus','major','person',[{'after':[8,3],'body':'Zeuxidamus’s son, king of Lacedaemon and leader of the invasions. He told the assembled generals that confidence in an army of invasion must be matched by caution, wasted the first campaign in front of Oenoe hoping Athens would submit while her land was untouched — for which the army blamed him — and then sat at Acharnae to see whether three thousand Acharnian hoplites would force a battle on the rest of the city. At Plataea he heard the envoys out, offered them neutrality or a receipt for their land, and when they refused called the gods and heroes of their own country to witness that he had made many fair proposals and had not succeeded.'}]),
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
('pleistoanax','Pleistoanax','Pausanias’s son, king of the Lacedaemonians: a minor when Nicomedes acted for him, and in command himself of the invasion that reached Eleusis and Thrius and went no further.','Pleistoanax','supporting','person',[{'after':[6,23],'body':'Pausanias’s son and king of Lacedaemon, whose invasion fourteen years earlier had turned back at Eleusis and Thria — which cost him his exile, since it was thought he had been bribed to retreat. While Archidamus’s army was on the same ground, the Athenians remembered it and still hoped he would go no further.'}]),
('tolmides','Tolmides','Tolmaeus’s son, who sailed round the Peloponnese, burnt the Lacedaemonian dockyard, took Chalcis and beat the Sicyonians — and who was caught at Coronea on the way home from Chaeronea by the Boeotian exiles, and lost Boeotia with the battle.','','supporting'),
('tolmaeus','Tolmaeus','Tolmides’s father.','','reference'),
('megabazus','Megabazus','The Persian sent to Lacedaemon with money to buy an invasion of Attica and draw the Athenians out of Egypt, and recalled with what was left of it when the money was simply being wasted. Not Megabuzus.','Megabazus','reference'),
('megabuzus','Megabuzus','Zopyrus’s son, sent into Egypt with a large army instead: he beat the Egyptians in the field, drove the Hellenes out of Memphis, penned them on Prosopitis for a year and a half, and then drained the canal, left their ships dry, and marched across on foot. Not Megabazus.','Megabuzus','supporting'),
('zopyrus','Zopyrus','Megabuzus’s father.','Zopyrus','reference'),
('orestes','Orestes','Echecratidas’s son, the Thessalian king in exile who persuaded Athens to restore him — and went home with them again, the expedition having accomplished nothing because of the Thessalian cavalry.','Orestes','reference'),
('echecratidas','Echecratidas','Orestes’s father.','Echecratidas','reference'),
('pericles','Pericles','Xanthippus’s son, who took a thousand men from Pegae to Sicyon and Acarnania, brought the army back from Euboea when Megara revolted and then subdued Euboea outright, and commanded the forty-four ships that beat the Samians off Tragia.','Pericles','central','person',
 [{'after':[7,20],'body':'The first citizen of Athens, whose funeral speech for the first of the war’s dead calls the city the school of Hellas and says that heroes have the whole earth for their tomb. He would not let the army out while Archidamus burned Acharnae, would not call an assembly while anger was in the ascendant, and handed over his own estate to the state in case Archidamus spared it out of friendship. They fined him, and then elected him general again. He outlived the outbreak by two years and six months, and told them to wait quietly, attend to the navy, attempt no new conquests and risk nothing — advice they did the opposite of. What was nominally a democracy became in his hands government by the first citizen.'},{'after':[5,29],'body':'Xanthippus’s son, the most powerful man of his time and the foremost Athenian statesman, ablest alike in counsel and in action. He was connected with the Cylonian curse on his mother’s side, which is why Sparta’s first embassy demanded the accursed be driven out — not expecting to succeed, but to make his countrymen think the war his bad luck. He answered the ultimatum with no concession: the trifle of the Megara decree, he said, contains the whole trial of their resolve; Athens should think of herself as an island, guard the sea and the city, and mourn the loss of men rather than of houses and land, because men gain houses and land and not the reverse. What he feared, he said, was Athenian blunders rather than the enemy’s designs.'}]),
('xanthippus','Xanthippus','Pericles’s father.','Xanthippus','reference'),
('pissuthnes','Pissuthnes','Hystaspes’s son, satrap of Sardis, who took the Athenian garrison and its commanders off the Samian rebels.','Pissuthnes','supporting'),
('hystaspes','Hystaspes','Pissuthnes’s father.','Hystaspes','reference'),
('stesagoras','Stesagoras','Who left Samos with five ships to bring up the Phoenician fleet — which is why Pericles was off Caria when the Samians broke out and held their own waters for fourteen days.','Stesagoras','reference'),
('hagnon','Hagnon','One of the three commanders of the forty ships that reinforced the siege of Samos.','','supporting','person',[{'after':[7,13],'body':'Nicias’s son, who took Pericles’s own force to the Chalcidians and Potidaea and brought the plague with him: he lost one thousand and fifty out of four thousand heavy infantry in about forty days, achieved nothing worthy of his preparations, and took his ships home. He went out again with Sitalces’s expedition as the Athenian general — for a fleet that never came.'}]),
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
('athenians','The Athenians','Whose growth in power, and the alarm it inspired in Lacedaemon, Thucydides gives as the real cause of the war — the cause most kept out of sight in formal speech. Never displaced from Attica because the soil was poor, they laid aside their arms first, took to the sea after the Mede, and turned the confederacy into an empire.','Athenians|Athenian','central','group',[{'after':[7,9],'body':'Whose country population came into the city and camped in the temples and the towers, and among whom the plague then broke out — fever, thirst, and a despair that took away the power of resistance the moment a man felt himself sickening. The doctors died thickest, because they visited the sick most. Men who had nothing succeeded to the property of men who had everything, and spent it quickly; burial rites collapsed; and nobody expected to live to be tried for anything. An old verse said a Dorian war would come and a plague with it, and they argued about whether the word had been plague or dearth.'}]),
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
('aeginetans','The Aeginetans','Who sent no formal representatives to the congress for fear of Athens and were in private among the most insistent advocates for war, claiming Athens had denied them the independence the treaty guaranteed.','Aeginetans|Aeginetan|Eginetans|Eginetan','supporting','group',[{'after':[6,29],'body':'Expelled from Aegina with their wives and children in the first summer of the war, as the chief agents in bringing it on — and because the island lay too close to the Peloponnese to be left in their hands. Lacedaemon gave them Thyrea, partly out of the obligation they had put her under at the time of the earthquake and the Helot revolt; the rest scattered over Hellas.'}]),
('samians','The Samians','For whom Ameinocles built the first four ships, and who went to war with Miletus over Priene, were given a democracy, stole back their hostages from Lemnos, revolted, and held their own waters for fourteen days before a nine-month siege ended it.','Samians|Samian','major','group'),
('milesians','The Milesians','Beaten by Samos over Priene, and the complainants who brought Athens into the Samian war.','Milesians|Milesian','supporting','group'),
('thebans','The Thebans','Asked for money toward the Epidamnus convoy; and the people whose city had given the Mede his base of operations, which is the argument Sparta used against walls.','Thebans','major','group',[{'after':[6,4],'body':'Whose Boeotarchs took three hundred men into Plataea in peacetime, because they foresaw the war and wanted to surprise an old enemy before it began. They would not kill the opposite faction as the traitors wanted, made a conciliatory proclamation instead, and lost the whole party. The relieving force was held up by a river swollen with the night’s rain and arrived to find them dead.'}]),
('phliasians','The Phliasians','Asked for money toward the convoy.','Phliasians','reference','group'),
('eleans','The Eleans','Asked for hulls as well as money; the Corcyraeans burnt Cyllene, their harbour, for it.','Eleans|Elean','supporting','group'),
('sicyonians','The Sicyonians','Whose envoys went with the Corcyraeans to Corinth, who were beaten by Pericles at Sicyon and by Tolmides before him, and who were let into Megara before the revolt.','Sicyonians|Sicyonian','supporting','group'),
('chalcidians','The Chalcidians','Of the Thracian seaboard, who joined the Potidaean revolt and, at Perdiccas’s urging, demolished their own towns and moved inland to Olynthus.','','supporting','group'),
('bottiaeans','The Bottiaeans','Who joined the revolt with the Chalcidians and the Potidaeans.','Bottiæans|Bottiaeans','reference','group'),
('macedonians','The Macedonians','Perdiccas’s people, whose six hundred horse followed Philip and Pausanias on the Athenian side at Potidaea and then rode back to the Athenians when the battle was decided.','Macedonians|Macedonian','supporting','group'),
('thracians','The Thracians','Who cut the ten thousand Athenian settlers off at Drabescus, taking the settlement at Nine Ways for an act of war.','Thracians','supporting','group'),
('carians','The Carians','Great pirates who colonized most of the islands, expelled from the Cyclades by Minos; more than half the graves opened when Athens purified Delos were theirs, known by the weapons and the manner of burial they still use.','Carians|Carian','supporting','group'),
('phoenicians','The Phoenicians','Islanders and pirates with the Carians; afterwards the King’s navy, which reduced the islands for Darius, lost two hundred ships at the Eurymedon, and was always expected and sometimes never came.','Phoenicians|Phoenician','supporting','group'),
('pelasgians','The Pelasgians','The name the country chiefly went by before Hellen, and the stock the Greek language branched off from.','Pelasgians|Pelasgian','reference','group'),
('boeotians','The Boeotians','Driven out of Arne by the Thessalians sixty years after Ilium and settled in the Cadmeis; beaten at Oenophyta and masters again after Coronea. Homer gives their ships a hundred and twenty men each, the maximum in the catalogue.','Boeotians|Boeotian','major','group'),
('thessalians','The Thessalians','Who drove the Boeotians out of Arne; whose cavalry went over to the Lacedaemonians during the battle at Tanagra; and whose horse kept the Athenians inside their camp at Pharsalus.','Thessalians|Thessalian','supporting','group'),
('dorians','The Dorians','Who with the Heraclids became masters of the Peloponnese twenty years after the Boeotian resettlement, and whose settlement in Lacedaemon was followed by faction for an unparalleled length of time.','Dorians|Dorian','supporting','group'),
('ionians','The Ionians','The colonies Athens sent out when Attica grew too small, whose golden grasshoppers and linen came from Athens; they built naval strength under Cyrus, were the first to ask Athens to take the lead against Pausanias, and are the people a Dorian city is being besieged by, which the Corinthians call a complete reversal of the natural order.','Ionians','major','group'),
('heraclids','The Heraclids','Who killed Eurystheus in Attica and, with the Dorians, became masters of the Peloponnese; Phalius the founder of Epidamnus was of the family.','Heraclids|Heraclid|Heracleids','supporting','group'),
('mycenaeans','The Mycenaeans','Who feared the Heraclids and wanted Atreus to take the sceptre.','Mycenæans|Mycenaeans','reference','group'),
('trojans','The Trojans','Who held the field for ten years because the invaders were always dispersed for piracy and farming, and were always a match for the detachment left on duty.','Trojans','supporting','group'),
('medes','The Medes','The invader of the two invasions, and the measure Thucydides sets this war against: the Median War was the greatest event of past times and was settled in two sea-battles and two land-battles. The rock the barbarian was wrecked on, the Corinthians tell Sparta, was himself.','Medes|Mede|Median','major','group'),
('persians','The Persians','Whose grandees’ quarters were the few houses left standing in Athens, and who held the White Castle at Memphis and Sestos and Byzantium until they were taken.','Persians|Persian','supporting','group'),
('phocians','The Phocians','Who made an expedition against Doris, the original homeland of the Lacedaemonians, and were made to give the town back; Athens put the temple at Delphi into their hands.','Phocians','supporting','group'),
('locrians','The Locrians','The Ozolian Locrians, who still carry weapons in the old piratical way and from whom Athens took Naupactus; and the Opuntian Locrians, a hundred of whose richest men were taken as hostages after Oenophyta.','','supporting','group'),
('aetolians','The Aetolians','Who still live in the old way, with the custom of carrying arms kept up.','Aetolians','reference','group'),
('acarnanians','The Acarnanians','Who still live in the old way, like the Aetolians and the Ozolian Locrians.','Acarnanians','supporting','group',[{'after':[8,11],'body':'Invaded by land and threatened by sea, they made no combined resistance but stayed to defend their own homes — and the Stratians alone broke the Chaonians with ambushes and then slung at the Hellenic divisions from a distance, which is the kind of warfare Thucydides says they excel at.'}]),
('carthaginians','The Carthaginians','Beaten in a sea-fight by the Phocaeans while they were founding Marseilles.','Carthaginians','reference','group'),
('phocaeans','The Phocaeans','Who beat the Carthaginians at sea while founding Marseilles.','Phocaeans','reference','group'),
('egyptians','The Egyptians','Most of whom revolted from Artaxerxes under Inaros and were beaten back into subjection — except the marshmen, who are the most warlike of them and whose king in the marshes could not be taken.','Egyptians','supporting','group'),
('libyans','The Libyans','Inaros’s people, on the Egyptian border.','Libyans','reference','group'),
('helots','The Helots','Most of them descendants of the old Messenians enslaved in the famous war, which is why they all came to be called Messenians. They seceded to Ithome after the earthquake; Pausanias promised them freedom and citizenship to join him; and the suppliants raised from the temple of Poseidon at Taenarus and killed were Helots.','Helots|Helot','major','group'),
('perioeci','The Perioeci','The Thuriats and Aethaeans among them seceded to Ithome with the Helots.','Perioeci','reference','group'),
('messenians','The Messenians','The name all the Helots came to carry, because most of them descended from the Messenians enslaved in the famous war; the rebels at Ithome held out ten years and were let out of the Peloponnese on condition of never setting foot in it again.','Messenians','supporting','group',[{'after':[8,19],'body':'Settled by Athens at Naupactus after Ithome, and now the garrison that marched along the shore beside Phormio’s ships — and that waded into the sea in armour to board the disabled Athenian hulls the Peloponnesians were towing away, and took them back.'}]),
('thuriats','The Thuriats','Of the Perioeci, who seceded to Ithome.','Thuriats','reference','group'),
('aethaeans','The Aethaeans','Of the Perioeci, who seceded to Ithome with the Thuriats.','Æthæans|Aethaeans|Æthaeans','reference','group'),
('edonians','The Edonians','From whom Athens took Nine Ways, and at whose town of Drabescus the settlers were cut off.','Edonians|Edonian','reference','group'),
('thasians','The Thasians','Who revolted over the trading posts on the Thracian coast and the mine, were beaten at sea and besieged, appealed to Lacedaemon, and gave up walls, ships, mainland possessions and the mine in the third year.','Thasians|Thasian','supporting','group'),
('dolopians','The Dolopians','The population of Scyros, enslaved by Cimon.','Dolopian|Dolopians','reference','group'),
('cyprians','The Cyprians','Beaten with the Phoenicians and Cilicians off Salamis in Cyprus.','Cyprians','reference','group'),
('cilicians','The Cilicians','Beaten with the Phoenicians and Cyprians off Salamis in Cyprus.','Cilicians','reference','group'),
('argives','The Argives','Sparta’s enemy, whom the Athenians allied with the moment they were sent home from Ithome, and a thousand of whom marched with them to Tanagra. Themistocles in exile lived among them and kept secret hoards there.','Argives|Argive','supporting','group'),
('achaeans','The Achaeans','One of Homer’s names for the Greeks; and the people Pericles picked up on the way from Sicyon to Acarnania.','Achaeans','supporting','group'),
('danaans','The Danaans','One of Homer’s three names for the Greeks, with the Argives and the Achaeans.','Danaans','reference','group'),
('delphians','The Delphians','Into whose hands Lacedaemon put the temple in the sacred war, and out of whose hands Athens took it again.','Delphians','reference','group'),
('histiaeans','The Histiaeans','Alone of Euboea not settled by agreement: Athens expelled them from their homes and took the territory.','Histiaeans','reference','group'),
('byzantines','The Byzantines','Who revolted with the Samians and agreed to be subjects again, as before.','Byzantines','reference','group'),
('sermylians','The Sermylians','Many of whom Aristeus cut off in an ambush near their city.','Sermylians','reference','group'),
('zacynthians','The Zacynthians','A thousand of whose heavy infantry came to help the Corcyraeans and were posted on Point Leukimme.','Zacynthians','reference','group'),
('molossians','The Molossians','Admetus’s people, with whom Themistocles took sanctuary.','Molossian|Molossians','reference','group'),
('eretrians','The Eretrians','Whose old war with Chalcis was the nearest thing to a coalition in Hellas before the Median War; and Gongylus was one of them.','Eretrians|Eretrian','reference','group'),
('arcadians','The Arcadians','Whose part of the Peloponnese was poor enough to be left alone by the changes of masters, and whose ships at Troy were supplied by Agamemnon.','Arcadians|Arcadian','reference','group'),
('epidaurians','The Epidaurians','Who sent five ships for the Epidamnus convoy, beat the Athenians with the Corinthians at Haliae, and were let into Megara before the revolt.','Epidaurians|Epidaurian','supporting','group'),
('hermionians','The Hermionians','Who sent one ship for the convoy; Pausanias took a galley of theirs on his own responsibility for his second voyage out.','Hermionians','reference','group'),
('troezenians','The Troezenians','Who sent two ships for the convoy.','Troezenians','reference','group'),
('chians','The Chians','Who with the Lesbians alone were never deprived of their ships and made to pay money instead, and who sent twenty-five ships to the siege of Samos.','Chians|Chian','supporting','group'),
('lesbians','The Lesbians','Who with the Chians alone kept their ships.','Lesbians|Lesbian','supporting','group'),
('phaeacians','The Phaeacians','Corcyra’s old inhabitants, from whom the Corcyraeans date the naval reputation they were at times openly proud of.','Phaeacians','reference','group'),
('tanagraeans','The Tanagraeans','Whose walls the Athenians dismantled after Oenophyta.','Tanagraeans','reference','group'),
('argilians','The Argilians','One of them was Pausanias’s favourite and most trusted servant, and the courier who counterfeited the seal, found the postscript ordering his own death, and turned informer.','Argilian|Argilians','reference','group'),
]:add(*row)


# ======================================== BOOK 2, CHAPTER 6 — the war really begins
for row in [
('chrysis-argos','Chrysis','The priestess of Hera at Argos, in the forty-eighth year of whose office the war began. Thucydides dates the outbreak by her, by the ephor at Sparta and by the archon at Athens, because there was no common calendar. Not Eumachus’s father.','','supporting'),
('aenesias','Aenesias','The ephor at Sparta in whose year the war began.','Aenesias','reference'),
('pythodorus','Pythodorus','The archon at Athens in the last month but two of whose year the war began.','','reference'),
('pythangelus','Pythangelus','Phyleides’s son, one of the two Boeotarchs who led the three hundred Thebans into Plataea in the first watch of the night.','Pythangelus','supporting'),
('phyleides','Phyleides','Pythangelus’s father.','Phyleides','reference'),
('diemporus','Diemporus','Onetorides’s son, the other Boeotarch of the night attack.','Diemporus','supporting'),
('onetorides','Onetorides','Diemporus’s father.','Onetorides','reference'),
('naucleides','Naucleides','The Plataean who opened the gates to the Thebans, meaning to kill the opposite faction, hand the city to Thebes and hold power in it.','Naucleides','supporting'),
('eurymachus','Eurymachus','Leontiades’s son, a man of great influence at Thebes, through whom the traitors in Plataea had made their arrangements — and one of the hundred and eighty prisoners the Plataeans put to death.','Eurymachus','supporting'),
('leontiades','Leontiades','Eurymachus’s father.','Leontiades','reference'),
('diacritus','Diacritus','Melesippus’s father.','Diacritus','reference'),
('zeuxidamus','Zeuxidamus','Archidamus’s father. The text calls him Zeuxis once and Zeuxidamus twice.','Zeuxidamus|Zeuxis','reference'),
('cecrops','Cecrops','Under whom, and the first kings after him, Attica was a country of independent townships.','Cecrops','reference','mythological-figure'),
('theseus','Theseus','The king of equal intelligence and power who abolished the council-chambers and magistrates of the smaller Attic cities and merged them into one council-chamber and town hall at Athens, leaving a great state behind him. The Synoecia, the Feast of Union, is still kept at public expense for it.','Theseus','major','mythological-figure'),
('eumolpus','Eumolpus','Who led the Eleusinians against Erechtheus — one of the wars the Attic townships fought against their own king.','Eumolpus','reference','mythological-figure'),
('erechtheus','Erechtheus','The king of Athens the Eleusinians went to war with under Eumolpus.','Erechtheus','reference','mythological-figure'),
('polymedes','Polymedes','One of the two party leaders in Larisa who commanded the Larisaean horse that came to Athens under the old alliance.','Polymedes','reference'),
('aristonus','Aristonus','The other Larisaean party leader and commander.','Aristonus','reference'),
('menon','Menon','The Pharsalian general of the Thessalian contingent.','Menon','reference'),
('carcinus','Carcinus','Xenotimus’s son, one of the three commanders of the hundred ships sent round the Peloponnese in the first summer of the war.','Carcinus','supporting'),
('xenotimus','Xenotimus','Carcinus’s father.','Xenotimus','reference'),
('socrates-antigenes','Socrates','Antigenes’s son, the third commander of the hundred ships.','Socrates','reference'),
('antigenes','Antigenes','Socrates’s father.','Antigenes','reference'),
('brasidas','Brasidas','Tellis’s son. In command of a guard in Laconia when the Athenians assaulted Methone, he ran a hundred heavy infantry straight through an army scattered over the country, lost a few men getting in, and saved the place — the first officer in the war to be publicly commended at Sparta. He was sent out afterwards as one of the three commissioners to stiffen Cnemus’s fleet, and was in the party that talked itself out of the raid on Piraeus. The older translation misprints him Bradidas once.','Brasidas|Bradidas','major'),
('tellis','Tellis','Brasidas’s father.','','reference'),
('cleopompus','Cleopompus','Clinias’s son, who took thirty ships round Locris and Euboea, sacked places on the coast, took hostages from Thronium and beat the Locrians at Alope — and afterwards went with Hagnon to Potidaea and the Chalcidians.','Cleopompus','supporting'),
('clinias','Clinias','Cleopompus’s father.','','reference'),
('nymphodorus','Nymphodorus','Pythes’s son, an Abderite whose sister was married to Sitalces. Athens had counted him an enemy and now made him her proxenus and sent for him: he brought in the Thracian alliance, got Sitalces’s son Sadocus made an Athenian citizen, and reconciled Athens with Perdiccas.','Nymphodorus','supporting'),
('pythes','Pythes','Nymphodorus’s father.','Pythes','reference'),
('sitalces','Sitalces','Teres’s son and king of the Thracians, whose alliance Athens bought with a citizenship for his son and the return of Therme to Perdiccas. He came down into Macedonia with a hundred and fifty thousand men, a third of them horse, and frightened every people between Thermopylae and the Danube — and then, with no provisions and bad weather, took his nephew’s advice and went home after thirty days, having achieved none of it.','Sitalces','major'),
('teres','Teres','Sitalces’s father, the first to build the great Odrysian kingdom out of a Thrace that was mostly independent. Thucydides is at pains to say he is in no way related to the Tereus of the nightingale story: different part of Thrace, different name.','Teres','supporting'),
('tereus','Tereus','Who married Pandion’s daughter Procne and lived at Daulis in what is now Phocis. It was there that the women did the deed on Itys, which is why the poets call the nightingale the Daulian bird. Not Teres.','Tereus','supporting','mythological-figure'),
('pandion','Pandion','Procne’s father, who would have weighed the advantages of mutual help in marrying her — an argument Thucydides uses to keep Tereus out of Odrysian Thrace.','Pandion','reference','mythological-figure'),
('procne','Procne','Pandion’s daughter, whom Tereus married out of Athens.','Procne','reference','mythological-figure'),
('itys','Itys','On whom the women of Daulis perpetrated the outrage.','Itys','reference','mythological-figure'),
('sadocus','Sadocus','Sitalces’s son, made an Athenian citizen — and who repaid it by seizing the Lacedaemonian envoys on their way to the King and handing them to the Athenians, who killed them the same day.','Sadocus','supporting'),
('evarchus','Evarchus','Tyrant of Astacus, expelled by the hundred ships and put back by forty Corinthian ones the following winter, partly with mercenaries he hired himself.','','supporting'),
('euphamidas','Euphamidas','Aristonymus’s son, first-named of the three commanders of the forty Corinthian ships that restored Evarchus.','','supporting'),
('aristonymus','Aristonymus','Euphamidas’s father.','','reference'),
('timoxenus','Timoxenus','Timocrates’s son, the second commander of the forty ships.','Timoxenus','reference'),
('timocrates-corinth','Timocrates','Timoxenus’s father. Not the Lacedaemonian commissioner who killed himself off Naupactus.','','reference'),
('eumachus','Eumachus','Chrysis’s son, the third commander of the forty ships.','Eumachus','reference'),
('chrysis-father-of-eumachus','Chrysis','Eumachus the Corinthian’s father. Not the priestess of Hera at Argos.','','reference'),
('acharnians','The Acharnians','Of the largest of the Athenian demes, three thousand heavy infantry of them — which is why Archidamus camped on their land and waited, reckoning they would force a battle on the rest of the city; and they were the loudest in pressing for the sortie.','Acharnians','supporting','group'),
('oropians','The Oropians','Who hold Graea from Athens, and whose territory the Peloponnesians ravaged on the way home.','Oropians','reference','group'),
('cranians','The Cranians','Of Crane in Cephallenia, who agreed to terms with the Corinthians and then fell on them suddenly.','Cranians','reference','group'),
('pellenians','The Pellenians','Of the one Achaean city that joined the war from the start, the rest following her lead later.','Pellenians','reference','group'),
]:add(*row)

# ================================== BOOK 2, CHAPTER 7 — the plague, and Potidaea falls
for row in [
('nicias-father-of-hagnon','Nicias','Hagnon’s father. Neither the Cretan of Gortys nor the Athenian general of the later books.','','reference'),
('aneristus','Aneristus','One of the envoys Lacedaemon sent to the King for money, seized in Thrace by Sadocus and killed at Athens the same day without a trial.','Aneristus','reference'),
('nicolaus','Nicolaus','A second of the Lacedaemonian envoys to the King, killed with the rest.','Nicolaus','reference'),
('stratodemus','Stratodemus','A third of the Lacedaemonian envoys, killed with the rest.','Stratodemus','reference'),
('timagoras-tegea','Timagoras','A Tegean travelling with the Lacedaemonian envoys to the King, and killed with them.','','reference'),
('pollis','Pollis','A private individual from Argos travelling with the envoys, and killed with them.','Pollis','reference'),
('pharnabazus','Pharnabazus','The Persian to whom the envoys were to be conveyed across the Hellespont, and who would have sent them up country to the King.','','reference'),
('learchus','Learchus','Callimachus’s son, one of the two Athenian ambassadors at Sitalces’s court who talked his son into handing over the Lacedaemonian envoys, and who escorted them to Athens.','Learchus','supporting'),
('callimachus-father-of-learchus','Callimachus','Learchus’s father. Not Phanomachus’s father.','','reference'),
('ameiniades','Ameiniades','Philemon’s son, the other Athenian ambassador at Sitalces’s court.','Ameiniades','supporting'),
('philemon','Philemon','Ameiniades’s father.','Philemon','reference'),
('amphilochus','Amphilochus','Amphiaraus’s son, who came home from Troy dissatisfied with the state of affairs, built a city in the Ambracian gulf and named it Argos after his own country.','Amphilochus','supporting','mythological-figure'),
('amphiaraus','Amphiaraus','Amphilochus’s father, and Alcmaeon’s. The older translation misprints him Amphiraus once.','Amphiaraus|Amphiraus','reference','mythological-figure'),
('melesander','Melesander','Who took six ships to Caria and Lycia to collect tribute and keep the Peloponnesian privateers from setting up there — and was defeated and killed going up country into Lycia.','Melesander','supporting'),
('xenophon-euripides','Xenophon','Euripides’s son, first-named of the three Athenian generals who took Potidaea’s capitulation, and afterwards the commander beaten and killed at Spartolus.','Xenophon','supporting'),
('euripides-father-of-xenophon','Euripides','Xenophon the general’s father.','Euripides','reference'),
('hestiodorus','Hestiodorus','Aristocleides’s son, the second of the three generals at Potidaea.','Hestiodorus','reference'),
('aristocleides','Aristocleides','Hestiodorus’s father.','Aristocleides','reference'),
('phanomachus','Phanomachus','Callimachus’s son, the third of the three generals at Potidaea — blamed at home, with his colleagues, for granting terms without instructions.','Phanomachus','reference'),
('callimachus-father-of-phanomachus','Callimachus','Phanomachus’s father. Not Learchus’s father.','','reference'),
('cnemus','Cnemus','The Spartan high admiral: he ravaged Zacynthus and got nowhere, slipped past Phormio into the gulf with a thousand heavy infantry and a barbarian army, lost the Chaonians to an ambush at Stratus, and had three commissioners sent out in anger to stiffen him after his fleet was beaten in the Crissaean gulf.','Cnemus','major'),
]:add(*row)

# ============== BOOK 2, CHAPTER 8 — Plataea invested, Phormio in the Gulf, Sitalces
for row in [
('photys','Photys','One of the two members of the Chaonian royal family entrusted with the chieftainship for the year; the Chaonians have no king.','Photys','reference'),
('nicanor','Nicanor','The other Chaonian chieftain of the year.','Nicanor','reference'),
('sabylinthus','Sabylinthus','Guardian of the boy king Tharyps, who led the Molossians and Atintanians into Acarnania.','Sabylinthus','reference'),
('tharyps','Tharyps','The Molossian king, still a minor, for whom Sabylinthus acted.','Tharyps','reference'),
('oroedus','Oroedus','King of the Paravaei, who brought them into Acarnania and was given the thousand Orestians to command as well.','Oroedus','reference'),
('antiochus-orestians','Antiochus','King of the Orestians, who sent a thousand of them under Oroedus rather than lead them himself. The older translation misprints him Antichus.','Antiochus|Antichus','reference'),
('machaon','Machaon','One of the three Corinthian commanders of the forty-seven ships Phormio broke in the mouth of the Crissaean gulf.','Machaon','reference'),
('isocrates','Isocrates','The second Corinthian commander.','Isocrates','reference'),
('agatharchidas','Agatharchidas','The third Corinthian commander.','Agatharchidas','reference'),
('timocrates-sparta','Timocrates','One of the three Lacedaemonian commissioners sent out in anger after the first defeat. He was aboard the Leucadian that an Athenian ship sank off a merchantman at Naupactus, killed himself when she went down, and was washed up in the harbour. Not Timoxenus’s father.','','supporting'),
('lycophron','Lycophron','The third of the three Lacedaemonian commissioners, with Timocrates and Brasidas.','','reference'),
('nicias-gortys','Nicias','A Cretan of Gortys and the Athenians’ proxenus, who talked twenty ships out of joining Phormio and into attacking Cydonia — really to oblige the Polichnitans next door. Bad weather kept them in Crete through the battle.','','supporting'),
('amyntas','Amyntas','Philip’s son, whom Sitalces brought with him and intended for the throne of Macedonia; Idomene, Gortynia and Atalanta came over out of attachment to him.','Amyntas','supporting'),
('seuthes','Seuthes','Spardacus’s son, Sitalces’s nephew and highest officer, and afterwards his successor, who raised the Odrysian tribute to four hundred talents. Perdiccas secretly bought him with the promise of his sister, and he advised the retreat; Perdiccas gave him Stratonice as promised.','Seuthes','supporting'),
('spardacus','Spardacus','Seuthes’s father. The history spells him Spardacus in Book 2 and Sparadocus in Book 4.','Spardacus|Sparadocus','reference'),
('stratonice','Stratonice','Perdiccas’s sister, promised to Seuthes with a rich dowry for the advice that ended Sitalces’s invasion, and given to him afterwards.','Stratonice','supporting'),
('archelaus','Archelaus','Perdiccas’s son, who on his accession built most of the strongholds the country has, cut straight roads, and did more for the kingdom’s horses and heavy infantry than the eight kings before him together.','Archelaus','supporting'),
('cynes','Cynes','Theolytus’s son, whom Phormio restored to Coronta.','Cynes','reference'),
('theolytus','Theolytus','Cynes’s father.','Theolytus','reference'),
('alcmaeon','Alcmaeon','Amphiaraus’s son, told by Apollo in his wanderings after killing his mother that he would have no release until he found land that had not been seen by the sun at the time of the murder. He settled on the Achelous’s new deposits by Oeniadae and named the country after his son Acarnan.','Alcmaeon','supporting','mythological-figure'),
('acarnan','Acarnan','Alcmaeon’s son, from whom Acarnania is named.','Acarnan','reference','mythological-figure'),
# ------------------------------------------------------- the peoples of the north
('odrysians','The Odrysians','Teres’s kingdom and Sitalces’s, whose empire ran from Abdera to the Danube and inland thirteen days’ journey, and whose custom was the opposite of the Persian one: more disgrace in refusing a present than in asking for one and being refused. Nothing could be done among them without a present.','Odrysians|Odrysian','major','group'),
('chaonians','The Chaonians','A nation with no king, led by two of the royal family for a year at a time, and with the highest reputation for courage on that part of the mainland. They would not wait to make camp at Stratus, rushed the town for the sole glory of it, and were cut to pieces from the city and the ambushes.','Chaonians','major','group'),
('thesprotians','The Thesprotians','Who came with the Chaonians into Acarnania and, like them, have no king.','Thesprotians','reference','group'),
('atintanians','The Atintanians','Whom Sabylinthus led into Acarnania with the Molossians.','Atintanians','reference','group'),
('paravaeans','The Paravaeans','Who came under their own king Oroedus.','Paravaeans','reference','group'),
('orestians','The Orestians','A thousand of them, subjects of King Antiochus, who put them under Oroedus’s command.','Orestians','reference','group'),
('amphilochians','The Amphilochians','Whose Argos was founded by Amphilochus and who learned their Hellenic speech from the Ambraciots they invited in — and were then expelled by them, upon which they joined the Acarnanians, called in Athens, and got the town back.','Amphilochians|Amphilochian','supporting','group'),
('agraeans','The Agraeans','Through whose country the Achelous runs on its way to the Acarnanian plain.','Agraeans','reference','group'),
('stratians','The Stratians','Of the Acarnanian capital, who saw how the invading divisions had strung out, set ambushes round the town, broke the Chaonians between the city and the ambushes, and then slung at the Hellenes from a distance — which, Thucydides says, is the kind of warfare the Acarnanians excel at.','Stratians','supporting','group'),
('getae','The Getae','Beyond Haemus, who border on the Scythians and are armed like them, all mounted archers; they supplied more of Sitalces’s cavalry than anyone but the Odrysians.','Getae','supporting','group'),
('dii','The Dii','The independent hill Thracian swordsmen of Mount Rhodope, the most warlike of Sitalces’s infantry, some of whom came as mercenaries and some as volunteers.','Dii','supporting','group'),
('agrianes','The Agrianes','One of the Paeonian tribes in Sitalces’s empire, on its edge, with the Strymon running through their country.','Agrianes','reference','group'),
('laeaeans','The Laeaeans','The Paeonian tribe at the inland limit of the Odrysian empire, where it ends and the independent Paeonians begin.','Laeaeans|Laeaean','reference','group'),
('paeonians','The Paeonians','Some of them in the Odrysian empire and some independent; Sitalces cut his road to Macedonia through their timber on an earlier campaign against them.','Paeonians|Paeonian','supporting','group'),
('triballi','The Triballi','Independent, and the neighbours of the Treres and Tilataeans.','Triballi','reference','group'),
('treres','The Treres','Who live north of Mount Scombrus and extend west as far as the Oskius.','Treres','reference','group'),
('tilataeans','The Tilataeans','Who live with the Treres north of Mount Scombrus.','Tilataeans','reference','group'),
('sintians','The Sintians','Divided from the Paeonians by the desolate range of Cercine, which Sitalces crossed by a road he had cut himself.','Sintians','reference','group'),
('maedians','The Maedians','On Sitalces’s left as he crossed the mountains into Paeonia.','Maedians','reference','group'),
('lyncestae','The Lyncestae','Macedonians by blood and allies and dependants of their kindred, but with their own separate government.','Lyncestae|Lyncestians|Lyncestian','reference','group'),
('elimiots','The Elimiots','Like the Lyncestae, Macedonians by blood with a government of their own.','Elimiots','reference','group'),
('pierians','The Pierians','Expelled from Pieria by Alexander’s ancestors and settled at Phagres beyond the Strymon; the coast they left is still called the Pierian gulf.','Pierians','reference','group'),
('eordians','The Eordians','Driven out of Eordia, most of them killed, a few still living around Physca.','Eordians','reference','group'),
('almopians','The Almopians','Driven out of Almopia by the same kings.','Almopians','reference','group'),
('temenids','The Temenids','From Argos, the stock the kings of Macedonia came from.','Temenids','reference','group'),
('magnetes','The Magnetes','Subject to the Thessalians, and among the peoples who made their preparations when they heard how large Sitalces’s army was.','Magnetes','reference','group'),
('panaeans','The Panaeans','One of the independent Thracian peoples of the plains beyond the Strymon who feared Sitalces might be invited against them.','Panaeans','reference','group'),
('odomanti','The Odomanti','Independent Thracians of the plains beyond the Strymon.','Odomanti|Odomantians','reference','group'),
('droi','The Droi','Independent Thracians of the plains beyond the Strymon.','Droi','reference','group'),
('dersaeans','The Dersaeans','Independent Thracians of the plains beyond the Strymon.','Dersaeans','reference','group'),
('scythians','The Scythians','With whom, Thucydides says, no people in Europe can be compared, and no single nation in Asia is a match for them united — though they are not on a level with other races in general intelligence and the arts of civilized life.','Scythians','supporting','group'),
('polichnitans','The Polichnitans','Neighbours of the Cydonians, to oblige whom Nicias of Gortys got twenty Athenian ships diverted to Crete.','Polichnitans','reference','group'),
('cydonians','The Cydonians','Whose land the twenty ships and the Polichnitans laid waste instead of joining Phormio.','Cydonians','reference','group'),
('anactorians','The Anactorians','Whose one ship joined the hundred and fifty at Sybota, and who marched into Acarnania with Cnemus and held the right with the Leucadians.','Anactorians','reference','group'),
('tegeans','The Tegeans','Of Tegea in Arcadia. Timagoras, who travelled with the Lacedaemonian envoys to the King and was killed with them at Athens, was one of them.','Tegeans|Tegean','supporting','group'),
('sicilians','The Sicilians','Whose tyrants had galleys before the Persian war; whose cities Lacedaemon ordered to build five hundred ships between them and to stay neutral meanwhile; and who in the end joined the enemies of Athens against her.','Sicilians','supporting','group'),
('abderites','The Abderites','Nymphodorus, whose sister married Sitalces and who brought Athens the Thracian alliance, was one of them.','Abderite|Abderites','reference','group'),
('plataeans','The Plataeans','Thebes’s old enemy and Athens’s oldest ally. Three hundred Thebans came into their town in the first watch of a rainy night; they dug through their own party walls to join up unseen, barricaded the streets with wagons, drove the Thebans into the mud and the dark, and killed a hundred and eighty of them. Besieged two years later, they answered the mound with a wooden wall, tunnelled out its footings, built a crescent behind it, snapped the battering rams with beams hung on chains, and came within a wind of being burnt alive. The siege closed on four hundred of their own citizens, eighty Athenians, and a hundred and ten women to bake the bread.','Plataeans|Plataians','major','group'),
# ------------------------------------------------------------------------ gods
('athene','Athene','On whose statue there were forty talents of pure gold, all of it removable — which Pericles counted among the city’s resources for a last extremity, to be used and paid back. The other deities’ temples are in the citadel with hers.','Athene','supporting','deity'),
('demeter','Demeter','Whose Eleusinian temple was one of the few places kept closed when the country population camped in the city.','Demeter','supporting','deity'),
('dionysus','Dionysus','Of the Marshes, in whose honour the older Dionysia are still held in Anthesterion — by the Athenians and by their Ionian descendants.','Dionysus','supporting','deity'),
]:add(*row)


# ============================================ BOOK 3, CHAPTER 9 — Mytilene revolts
for row in [
('cleippides','Cleippides','Deinias’s son, in command of the forty ships sent to catch the Mitylenians at the festival of the Malean Apollo outside the town — and, if that failed, to order them to give up their ships and pull down their walls.','Cleippides','supporting'),
('deinias','Deinias','Cleippides’s father.','Deinias','reference'),
('meleas','Meleas','A Laconian who slipped into Mitylene by galley after the first battle and advised them to send more envoys to Lacedaemon.','Meleas','reference'),
('hermaeondas','Hermaeondas','A Theban, sent with Meleas before the insurrection and unable to get there before the Athenians.','Hermaeondas','reference'),
('asopius-son-of-phormio','Asopius','Phormio’s son, whom the Acarnanians insisted on having because they would take no commander who was not some son or relative of Phormio — and who was cut off with most of his troops in the retreat from Nericus.','','supporting'),
('dorieus','Dorieus','The Rhodian, in whose Olympiad — his second victory — the Mitylenian envoys made their case to the allies.','','reference'),
('alcidas','Alcidas','The Lacedaemonian high admiral, and the most cautious man in the war. He took the relief fleet to Lesbos so slowly that Mitylene had fallen seven days before he heard of it; refused Teutiaplus’s advice to fall on Paches at night, refused the Ionian exiles’ advice to raise Ionia, butchered his prisoners at Myonnesus until Samian envoys told him this was no way to free Hellas, and fled home across the open sea. At Corcyra he would not attack the town even when Brasidas urged it. He was afterwards one of the three founders of Heraclea in Trachis.','Alcidas','major'),
('paches','Paches','Epicurus’s son, who walled Mitylene in and took its surrender on terms — promising not to kill anyone until Athens had answered, and keeping it. He chased Alcidas as far as Patmos, trapped Hippias the Arcadian by a safe-conduct and shot him down inside his own fortification, and had the decree for the massacre in his hand when the second galley came into port.','Paches','major'),
('epicurus','Epicurus','Paches’s father.','Epicurus','reference'),
('lysicles-general','Lysicles','One of the five commanders of the twelve ships sent to levy subsidies from the allies, who went up country from Myus across the Meander plain to the hill of Sandius and was killed there with many of his men by the Carians and the people of Anaia. Not Abronichus’s father.','','supporting'),
('theaenetus','Theaenetus','Tolmides’s son, a soothsayer, who with Eupompides thought of the escape over the Peloponnesian wall at Plataea.','Theaenetus','supporting'),
('tolmides-soothsayer','Tolmides','Theaenetus the soothsayer’s father. Not Tolmaeus’s son.','','reference'),
('eupompides','Eupompides','Daimachus’s son, one of the Plataean generals and joint author of the escape.','Eupompides','supporting'),
('daimachus','Daimachus','Eupompides’s father.','Daimachus','reference'),
('ammias','Ammias','Coroebus’s son, first up the ladder and first on the Peloponnesian wall, at the head of twelve light-armed men with a dagger and a breastplate each.','Ammias','supporting'),
('coroebus','Coroebus','Ammias’s father.','Coroebus','reference'),
('androcrates','Androcrates','The hero whose chapel the escaping Plataeans kept on their right, taking the Thebes road because it was the last one the pursuers would think of.','Androcrates','reference','mythological-figure'),
('salaethus','Salaethus','The Lacedaemonian who got into Mitylene along a torrent bed, told them the fleet was coming, and stopped them treating with Athens — then armed the commons for a sortie, and lost the city the moment they had weapons in their hands. Found in hiding, sent to Athens and killed at once, though he offered to get the Peloponnesians away from Plataea.','Salaethus','major'),
('cleomenes-commander','Cleomenes','Who led the invasion of Attica in place of King Pausanias, his nephew, who was still a minor. Not the Cleomenes who drove the accursed out of Athens.','','supporting'),
('pausanias-king','Pausanias','Pleistoanax’s son and king of Lacedaemon, a minor when Cleomenes invaded Attica for him. Neither the regent nor the Macedonian.','','reference'),
('teutiaplus','Teutiaplus','An Elean, who told Alcidas to sail straight for Mitylene and fall on it at night, since men who have just taken a city are as careless as any in war, and that detecting the moment when an enemy is at this disadvantage is what makes a successful general. Alcidas was not moved.','Teutiaplus','supporting'),
('itamenes','Itamenes','Who took the upper town of Colophon with the barbarians, having been called in by one party in a quarrel.','Itamenes','reference'),
('hippias-arcadia','Hippias','Commander of the Arcadians in the fortified quarter at Notium, invited out to a parley by Paches on a promise of safe return, kept in custody, put back inside once the quarter had been stormed — as promised — and shot down as soon as he was in. Not the tyrant.','','supporting'),
('cleon','Cleon','Cleaenetus’s son, the most violent man at Athens and at that time by far the most powerful with the commons, who carried the decree to kill every adult male in Mitylene and enslave the rest, and defended it the next day: a democracy is incapable of empire, your empire is a despotism, pity and sentiment and indulgence are the three failings most fatal to it, and the penalty of rebellion must be death. He lost the second vote by a show of hands that was almost equal, and got the thousand prisoners killed instead.','Cleon','central'),
('cleaenetus','Cleaenetus','Cleon’s father.','Cleaenetus','reference'),
('diodotus','Diodotus','Eucrates’s son, who answered Cleon by refusing to argue about guilt at all: the question is not justice but the interest of Athens, and no penalty yet invented has ever stopped men from taking a risk they have set their minds on — so killing the Mitylenian commons, who had surrendered the town the moment they got arms, would only teach every future rebel to hold out to the last. His motion carried, and the second galley beat the first by the length of a meal eaten at the oar.','Diodotus','major'),
('eucrates','Eucrates','Diodotus’s father.','Eucrates','reference'),
('mitylenians','The Mitylenians','Who wanted to revolt before the war and were refused, and then had to do it before their walls and moles and archers were ready. They told the allies at Olympia that fear, not friendship, had kept them in the Athenian alliance, and that the liberty of attacking being always Athens’s, the liberty of defending should be theirs. Starved out, they were sentenced to death in one assembly and reprieved in the next by a handful of votes.','Mitylenians|Mitylenian','major','group'),
('methymnians','The Methymnians','The one city in Lesbos that did not revolt: they informed Athens of the preparations, fought on her side, and afterwards kept their land when the rest of the island was divided into three thousand allotments.','Methymnians','supporting','group'),
('tenedians','The Tenedians','At enmity with Mitylene, and among the first to tell Athens what was being prepared there.','Tenedians','reference','group'),
('imbrians','The Imbrians','Who came to the aid of Athens at Mitylene with the Lemnians.','Imbrians','reference','group'),
('lemnians','The Lemnians','Who came to the aid of Athens at Mitylene with the Imbrians.','Lemnians','reference','group'),
('antissians','The Antissians','Who beat the Methymnians in a sortie with their mercenaries, and were reduced by Paches afterwards.','Antissians','reference','group'),
('colophonians','The Colophonians','Whose upper town was taken by Itamenes and the barbarians in a party quarrel, and who then split again at Notium; Paches gave the place to the party that had not Medized, and Athens sent out settlers and collected the rest of them from wherever they had gone.','Colophonians','supporting','group'),
]:add(*row)

# ================== BOOK 3, CHAPTER 10 — Plataea destroyed, and Corcyra tears itself apart
for row in [
('nicias-niceratus','Nicias','Niceratus’s son, who took Minoa off Megara so that the blockade could be kept from a nearer station, and led sixty ships against Melos and the Locrian seaboard.','','central'),
('niceratus','Niceratus','Nicias’s father.','Niceratus','reference'),
('astymachus','Astymachus','Asopolaus’s son, one of the two Plataeans deputed to answer the five Lacedaemonian judges — who put one question and no charge, and asked it again of each man before taking him out and killing him.','Astymachus','supporting'),
('asopolaus','Asopolaus','Astymachus’s father.','Asopolaus','reference'),
('lacon','Lacon','Aeimnestus’s son and proxenus of the Lacedaemonians, the other Plataean speaker.','Lacon','supporting'),
('aeimnestus','Aeimnestus','Lacon’s father.','Aeimnestus','reference'),
('peithias','Peithias','A volunteer proxenus of Athens and leader of the commons at Corcyra, acquitted on a charge of enslaving the city and answering it by prosecuting five rich men for cutting stakes in the ground sacred to Zeus and Alcinous. They came into the senate house with daggers and killed him and sixty others.','Peithias','major'),
('alcinous','Alcinous','In whose sacred ground, with Zeus’s, the stakes were cut — a stater a stake.','Alcinous','reference','mythological-figure'),
('nicostratus','Nicostratus','Diitrephes’s son, who came up from Naupactus with twelve ships and five hundred Messenians and very nearly settled Corcyra: he got both parties to agree to try ten ringleaders, stopped the commons from killing men in the street, and persuaded four hundred suppliants out of the temple of Hera — and then sailed on.','Nicostratus','major'),
('diitrephes','Diitrephes','Nicostratus’s father, spelled Diotrephes at the taking of Cythera. Not the commander who leads the Thracians home in the later books.','Diotrephes','reference'),
('eurymedon','Eurymedon','Thucles’s son, who came to Corcyra with sixty ships — and during the seven days he lay there the Corcyraeans went on butchering their fellow citizens, some for supposed conspiracy and some for money owed.','','major'),
('thucles','Thucles','Eurymedon’s father.','','reference'),
('laches','Laches','Melanopus’s son, who took twenty ships to Sicily with Charoeades, was left in sole command when Charoeades was killed, took Mylae and Messina, and was relieved by Pythodorus.','Laches','major'),
('melanopus','Melanopus','Laches’s father.','Melanopus','reference'),
('charoeades','Charoeades','Euphiletus’s son, Laches’s colleague in Sicily, killed by the Syracusans in battle.','Charoeades','supporting'),
('euphiletus','Euphiletus','Charoeades’s father.','Euphiletus','reference'),
('dioscuri','The Dioscuri','In whose temple at Corcyra the men enrolled for the ships sat down as suppliants, fearing they were to be sent to Athens.','Dioscuri','reference','deity'),
('syracusans','The Syracusans','At war with Leontini, with all the Dorian cities of Sicily except Camarina for allies, and blockading the Leontines by land and sea when Athens first sent ships west.','Syracusans|Syracusan','major','group'),
('leontines','The Leontines','Who had Camarina and the Chalcidian cities, and who appealed to Athens on their ancient alliance and their Ionian origin.','Leontines|Leontine','supporting','group'),
('camarinaeans','The Camarinaeans','The one Dorian city of Sicily that took the Leontine side.','Camarinaeans|Camarinaean','reference','group'),
('rhegians','The Rhegians','Of Italy, who were for their Leontine kinsmen, and whose town the Athenians made their base.','Rhegians|Rhegian','supporting','group'),
('locrians-italy','The Locrians of Italy','Who were for the Syracusans, beat the Athenians at their fort on the Halex and again under Pythodorus, and were beaten on the Caicinus. Not the Ozolian or Opuntian Locrians of Greece.','','supporting','group'),
]:add(*row)

# ================= BOOK 3, CHAPTER 11 — Heraclea, Aetolia, and the ruin of Ambracia
for row in [
('agis','Agis','Archidamus’s son, who brought the army as far as the Isthmus and turned back without invading because of the earthquakes.','Agis','major'),
('demosthenes','Demosthenes','Alcisthenes’s son. Talked by the Messenians into invading Aetolia against the Acarnanians’ advice, he pushed on without waiting for his Locrian darters, lost his archers’ captain and then his guide, and watched a hundred and twenty Athenian hoplites — by far the best men of the city to fall in the war — die in trackless gullies and in a wood the Aetolians burned around them. He stayed at Naupactus afraid to face Athens; and then saved Naupactus, hid four hundred men in a hollow road at Olpae, broke Eurylochus’s wing from behind, and destroyed the Ambraciot relief at Idomene at dawn by putting Messenians in front to speak Doric to the sentries.','Demosthenes','central'),
('alcisthenes','Alcisthenes','Demosthenes’s father.','Alcisthenes','reference'),
('procles','Procles','Theodorus’s son, Demosthenes’s colleague in the thirty ships, and among the slain in Aetolia.','','supporting'),
('theodorus','Theodorus','Procles’s father.','Theodorus','reference'),
('hipponicus','Hipponicus','Callias’s son, who brought the whole levy from Athens to meet the fleet at Tanagra by prearranged signal.','Hipponicus','supporting'),
('callias-father-of-hipponicus','Callias','Hipponicus’s father. Neither the Corinthian admiral’s father nor the Athenian general killed at Potidaea.','','reference'),
('tisamenus','Tisamenus','The ambassador the Trachinians chose to ask Lacedaemon for a colony, after suffering severely in a war with the Oetaeans.','Tisamenus','reference'),
('leon-heraclea','Leon','One of the three Lacedaemonians who led out the colony to Heraclea in Trachis.','','reference'),
('damagon','Damagon','The third founder of Heraclea, with Leon and Alcidas.','Damagon','reference'),
('hesiod','Hesiod','The poet, said to have been killed by the people of the country in the precinct of Nemean Zeus, in fulfilment of an oracle that he would die at Nemea — where Demosthenes’s army bivouacked on its way into Aetolia.','Hesiod','reference'),
('chromon','Chromon','The Messenian who guided the army in Aetolia, and whose death left it in trackless country.','Chromon','supporting'),
('tolophus','Tolophus','An Ophionian, one of the three Aetolian envoys who got an army out of Corinth and Lacedaemon against Naupactus.','Tolophus','reference'),
('boriades','Boriades','A Eurytanian, the second of the three Aetolian envoys.','Boriades','reference'),
('tisander','Tisander','An Apodotian, the third of the three Aetolian envoys.','Tisander','reference'),
('eurylochus','Eurylochus','The Spartan who brought three thousand heavy infantry against Naupactus, took hostages from most of Ozolian Locris on the way, missed the town by a thousand men Demosthenes had got in, and then waited in Aetolia for the Ambraciots. At Olpae his own wing and his best troops were broken from behind by men out of a hollow road, and he was killed with them.','Eurylochus','major'),
('macarius','Macarius','A Spartan, one of Eurylochus’s two colleagues, and killed with him at Olpae.','Macarius','supporting'),
('menedaius','Menedaius','The surviving Spartan commander at Olpae, who could neither stand a siege nor retreat, asked for a truce to take up the dead — and was quietly given leave to slip away with the Mantineans and the other leaders, which is exactly what Demosthenes wanted the Hellenes of those parts to hear about.','Menedaius','major'),
('proxenus','Proxenus','Capaton’s son, who led the Italian Locrians against the Athenians on the river Caicinus.','Proxenus','reference'),
('capaton','Capaton','Proxenus’s father.','Capaton','reference'),
('aristotle','Aristotle','Timocrates’s son, one of the two commanders of the twenty Athenian ships the Acarnanians sent for.','Aristotle','reference'),
('timocrates-father-of-aristotle','Timocrates','Aristotle the commander’s father. Neither Timoxenus’s father nor the Lacedaemonian who killed himself off Naupactus.','','reference'),
('hierophon','Hierophon','Antimnestus’s son, the other commander of the twenty ships.','Hierophon','reference'),
('antimnestus','Antimnestus','Hierophon’s father.','Antimnestus','reference'),
('salynthius','Salynthius','The friendly king of the Agraeans, with whom the Ambraciots and Peloponnesians who got away from Olpae took refuge.','Salynthius','supporting'),
('pythodorus-isolochus','Pythodorus','Isolochus’s son, sent out to relieve Laches in Sicily, and beaten by the Locrians at the fort Laches had taken. Not the archon of the year the war began.','','supporting'),
('isolochus','Isolochus','Pythodorus the general’s father.','Isolochus','reference'),
('sophocles','Sophocles','Sostratides’s son, who was to follow Pythodorus to Sicily with the main body.','Sophocles','supporting'),
('sostratides','Sostratides','Sophocles’s father.','Sostratides','reference'),
('hephaestus','Hephaestus','Whose forge the people of those parts believe to be on Hiera, from the flame the island sends out by night and the smoke by day.','Hephaestus','reference','deity'),
# ----------------------------------------------------------- peoples of Book 3
('melians','The Melians','Islanders who refused to be subjects of Athens or even to join her confederacy, and whose land was devastated without bringing them to terms.','Melians','supporting','group'),
('malians','The Malians','Three tribes in all — the Paralians, the Hiereans and the Trachinians.','Malians','reference','group'),
('paralians','The Paralians','One of the three Malian tribes.','Paralians','reference','group'),
('hiereans','The Hiereans','One of the three Malian tribes.','Hiereans','reference','group'),
('trachinians','The Trachinians','The Malian tribe that had suffered severely from the Oetaeans, thought of putting themselves under Athens, and asked Lacedaemon for a colony instead — which became Heraclea, and which the Thessalians and Lacedaemon’s own governors between them wore down.','Trachinians','supporting','group'),
('oetaeans','The Oetaeans','The neighbours whose war on the Trachinians brought Heraclea into existence.','Oetaeans','reference','group'),
('apodotians','The Apodotians','The Aetolian tribe the Messenians told Demosthenes to attack first.','Apodotians','reference','group'),
('ophionians','The Ophionians','The Aetolian tribe to be attacked second; the most remote of them, the Bomiensians and Calliensians, came down to the rescue with the rest.','Ophionians','reference','group'),
('eurytanians','The Eurytanians','The largest tribe in Aetolia, who speak, it is said, an extremely difficult language and eat their flesh raw.','Eurytanians','supporting','group'),
('bomiensians','The Bomiensians','The most remote of the Ophionians, who extend toward the Malian gulf.','Bomiensians','reference','group'),
('calliensians','The Calliensians','The other remote Ophionian tribe, who came down against Demosthenes with the rest.','Calliensians','reference','group'),
('amphissians','The Amphissians','Eurylochus’s chief supporters in Ozolian Locris, alarmed at the hostility of the Phocians, who gave hostages first and talked the rest into it.','Amphissians','reference','group'),
('myonians','The Myonians','Who held the most difficult of the passes into Locris, and gave hostages after the Amphissians.','Myonians','reference','group'),
('ipnians','The Ipnians','One of the Ozolian Locrian towns that gave hostages and joined the expedition.','Ipnians','reference','group'),
('messapians','The Messapians','One of the Ozolian Locrian towns that gave hostages and joined the expedition.','Messapians','reference','group'),
('tritaeans','The Tritaeans','One of the Ozolian Locrian towns that gave hostages and joined the expedition.','Tritaeans','reference','group'),
('chalaeans','The Chalaeans','One of the Ozolian Locrian towns that gave hostages and joined the expedition.','Chalaeans','reference','group'),
('tolophonians','The Tolophonians','One of the Ozolian Locrian towns that gave hostages and joined the expedition.','Tolophonians','reference','group'),
('hessians','The Hessians','One of the Ozolian Locrian towns that gave hostages and joined the expedition.','Hessians','reference','group'),
('oeanthians','The Oeanthians','The last of the Ozolian Locrian towns to give hostages and join the expedition.','Oeanthians','reference','group'),
('olpaeans','The Olpaeans','Who gave hostages but would not join the invasion.','Olpaeans','reference','group'),
('hyaeans','The Hyaeans','Who would do neither, until Eurylochus took one of their villages.','Hyaeans','reference','group'),
('mantineans','The Mantineans','Massed on the left at Olpae, and the only unit that kept its ranks in the retreat — which is why Demosthenes and the Acarnanians quietly let them go, to discredit the Lacedaemonians with the Hellenes of those parts as traitors and self-seekers.','Mantineans|Mantinean','supporting','group'),
('liparaeans','The Liparaeans','A Cnidian colony holding the islands of Aeolus from Lipara, and allies of Syracuse.','Liparaeans','reference','group'),
('sicels','The Sicels','Some of them subjects or allies of Syracuse and some in revolt from her; they invaded Himera from the interior while the Athenians landed on the coast.','Sicels|Sicel','supporting','group'),
('catanians','The Catanians','Who live on Etna, the largest mountain in Sicily, and lost some of their land to the stream of fire.','Catanians','reference','group'),
('cephallenians','The Cephallenians','Whose four states — Pale, Crane, Same and Pronae — came over to Athens without force, and who joined the levy against Leucas and went with Demosthenes into Aetolia.','Cephallenians','supporting','group'),
]:add(*row)


# ==================== BOOK 4, CHAPTER 12 — Pylos, Sphacteria, and the surrender
for row in [
('epitadas','Epitadas','Molobrus’s son, who commanded the four hundred and twenty heavy infantry drafted by lot onto Sphacteria. He kept them on half rations while Helots ran corn and wine in by night for the promise of freedom, held the level middle of the island where the water was, closed ranks when the outpost was cut off, and could neither reach the light troops nor be let alone by them. He was killed before the surrender.','Epitadas','major'),
('molobrus','Molobrus','Epitadas’s father.','Molobrus','reference'),
('thrasymelidas','Thrasymelidas','Cratesicles’s son, a Spartan, and admiral of the forty-three ships that attacked the new fort from the sea at exactly the point Demosthenes had expected.','Thrasymelidas','supporting'),
('cratesicles','Cratesicles','Thrasymelidas’s father.','Cratesicles','reference'),
('simonides','Simonides','The Athenian general who gathered a few men from the garrisons and some allies of those parts and took Eion in Thrace by treachery — and was beaten out of it again by the Chalcidians and Bottiaeans with the loss of many of his soldiers.','Simonides','reference'),
('demoteles','Demoteles','Who commanded the garrison left in Messina after the disaster at Naxos, and led the sally that broke most of the Leontine army.','Demoteles','reference'),
('archias-camarina','Archias','Whose party was about to betray Camarina to Syracuse when the Athenians got warning and sailed there. Not the Corinthian who founded Syracuse.','','reference'),
('styphon','Styphon','Pharax’s son, and third in the Spartan line of command on the island: Epitadas was dead and Hippagretas left for dead among the slain, so by law it fell to him. He asked the mainland what to do, and after the question had gone back and forth two or three times was told to decide for himself, so long as he did nothing dishonourable.','Styphon','supporting'),
('pharax','Pharax','Styphon’s father.','Pharax','reference'),
('hippagretas','Hippagretas','The Spartan next in command after Epitadas, left for dead among the slain and still alive.','Hippagretas','reference'),
('theagenes-athens','Theagenes','Chosen with Cleon to go and see for himself whether the reports from Pylos were true — a commission Cleon talked the assembly out of before it could sail. Not the tyrant of Megara.','','reference'),
('ulysses','Ulysses','Whom the story makes sail through the Charybdis: the strait between Rhegium and Messina, where Sicily comes nearest the continent, and where the current out of the Tyrrhenian and Sicilian mains has rightly given the narrows a bad name.','Ulysses','reference','mythological-figure'),
# ------------------------------------------------------ peoples of Chapter 12
('messinese','The Messinese','The people of Messina in Sicily, who let in the Syracusan and Locrian ships and revolted from Athens, then attacked Chalcidian Naxos and lost more than a thousand men to a sally and most of the rest to the barbarians on the road home — and who still had a sally left in them that broke the Leontine army.','Messinese|Messinian','supporting','group'),
('naxians','The Naxians','The Chalcidian people of Naxos in Sicily, kept inside their walls on the first day and out of their gates on the second: they saw the Sicels coming down from the high country, believed the Leontines were coming too, and routed the Messinese.','Naxians','supporting','group'),
]:add(*row)

# ============= BOOK 4, CHAPTER 13 — Corcyra ends, Sicily makes peace, Nisaea falls
for row in [
('battus','Battus','One of the two Corinthian generals at Solygia, who took a company to hold the unwalled village while Lycophron gave battle with the rest.','Battus','reference'),
('lycophron-corinth','Lycophron','The Corinthian general at Solygia, who held the right wing against the Athenian left for a long time and was among the dead when the Athenian cavalry — the Corinthians had none — finally turned it. Not the Lacedaemonian commissioner sent to Cnemus.','','supporting'),
('aristides-archippus','Aristides','Archippus’s son, one of the commanders of the squadron sent round to collect money from the allies. He arrested Artaphernes at Eion with the King’s dispatches on him, and afterwards helped Demodocus retake Antandrus from the Mitylenian exiles. Not Lysimachus’s son.','','supporting'),
('archippus','Archippus','Aristides the commander’s father.','Archippus','reference'),
('artaphernes','Artaphernes','The Persian taken at Eion on his way from the King to Lacedaemon. His dispatches, translated at Athens out of the Assyrian script, said that the King could not make out what the Lacedaemonians wanted, since of the many ambassadors they had sent him no two ever told the same story: let them send plain men with this Persian and say so. The Athenians sent him back to Ephesus with envoys of their own.','Artaphernes','supporting'),
('hermocrates','Hermocrates','Hermon’s son, a Syracusan, and the most influential man at the congress of Gela. He told the Sicilians that the question before them was not their several grievances but whether there was still time to save the island; that no one should think the Dorians alone were the enemy while Chalcidian blood protected the rest, since the attack was aimed not at a nationality but at what was in Sicily, the common property of them all; and that the quickest way to be rid of the guests was to stop giving them a reason to stay. They took his advice and kept what they had.','Hermocrates','major'),
('hermon','Hermon','Hermocrates’s father.','','reference'),
('autocles','Autocles','Tolmaeus’s son, third in the command that took Cythera, and one of the three Athenian generals who swore to the year’s armistice.','Autocles','supporting'),
('tolmaeus-father-of-autocles','Tolmaeus','Autocles’s father. The history never says whether he is the Tolmaeus whose son Tolmides sailed round the Peloponnese.','','reference'),
('tantalus','Tantalus','Patrocles’s son, the Lacedaemonian commanding at Thyrea, wounded and taken alive when the Athenians burnt the town, and sent to share the imprisonment of the men from the island.','Tantalus','reference'),
('patrocles','Patrocles','Tantalus’s father.','Patrocles','reference'),
('hippocrates-ariphron','Hippocrates','Ariphron’s son. With Demosthenes he took the long walls of Megara by an ambush at a gate that was opened every night for a smuggler’s boat on a cart; and then designed the double stroke on Boeotia — Siphae and Chaeronea handed over on an appointed day while he fortified Delium, so that the Boeotians could not unite against any of it. The days were mistaken and the plot was betrayed, and he was left to fortify the sanctuary of Apollo alone and to fight Pagondas with a mass levy that had mostly gone home. He fell in the rout with nearly a thousand Athenians. Not the Lacedaemonian of the later books.','','major'),
('ariphron','Ariphron','Hippocrates the general’s father.','Ariphron','reference'),
('enyalius','Enyalius','In whose precinct, nearer Megara than the quarry, Demosthenes lay in ambush with the Plataean light troops and the Peripoli.','Enyalius','reference','deity'),
# ------------------------------------------------------ peoples of Chapter 13
('andrians','The Andrians','Whose contingent served under Nicias against Corinth; and whose colonies — Acanthus, Stagirus, Argilus, Sane — stand in the Thracian country Brasidas was about to walk through.','Andrians|Andrian','supporting','group'),
('carystians','The Carystians','Placed at the end of the Athenian line at Solygia, where with the Athenian right they took the first Corinthian charge, gave ground, and twice drove it back.','Carystians','supporting','group'),
('cytherians','The Cytherians','Lacedaemonians of the Perioeci class, on the island that took the merchantmen from Egypt and Libya and kept privateers off the one assailable stretch of the Laconian coast. A judge went over to them from Sparta every year. They held their ground a little while, capitulated to Nicias — with whom some of them had been in correspondence — and kept their lands at four talents tribute.','Cytherians','supporting','group'),
('peripoli','The Peripoli','The Athenian frontier patrol, who ran in at the Megarian gates with Demosthenes and the Plataeans, just where the trophy now stands.','Peripoli','reference','group'),
]:add(*row)

# ============ BOOK 4, CHAPTER 14 — Delium, Amphipolis, and Brasidas in Thrace
for row in [
('demodocus','Demodocus','One of the two commanders of the Athenian money-collecting squadron, who heard on the Hellespont what was being done at Antandrus and retook the place before it could become a second Anaia.','Demodocus','reference'),
('lamachus','Lamachus','Their third colleague, who took ten ships into the Pontus and lost them at anchor in the Calex when rain inland brought a flood down on them, and marched his men overland through the Bithynian Thracians to Chalcedon.','Lamachus','supporting'),
('ptoeodorus','Ptoeodorus','A Theban exile, and the chief mover in the plot to change the constitutions of the Boeotian cities and bring in democracy as at Athens.','Ptoeodorus','reference'),
('panaerus','Panaerus','One of the Thessalians who came to Melitia to escort Brasidas through a country whose people had always sympathised with Athens — and which, Thucydides says, he could never have crossed at all if it had not been governed by a close oligarchy.','Panaerus','reference'),
('dorus','Dorus','One of Brasidas’s Thessalian escort.','Dorus','reference'),
('hippolochidas','Hippolochidas','One of Brasidas’s Thessalian escort.','Hippolochidas','reference'),
('torylaus','Torylaus','One of Brasidas’s Thessalian escort.','Torylaus','reference'),
('strophacus','Strophacus','The Chalcidian proxenus among Brasidas’s Thessalian escort.','Strophacus','reference'),
('niconidas','Niconidas','Of Larissa, a friend of Perdiccas, and one of the other Thessalians who went along.','Niconidas','reference'),
('arrhabaeus','Arrhabaeus','Bromerus’s son and king of the Lyncestian Macedonians — the neighbour Perdiccas most wanted put down, and the reason he had paid for a Peloponnesian army. Brasidas parleyed with him instead of invading, and Perdiccas cut his contribution from half the army’s keep to a third. On the second expedition the Lyncestians were beaten in the field and took to the heights; then the Illyrian mercenaries hired for Perdiccas came over to Arrhabaeus instead, and it was the Peloponnesians who had to fight their way home.','Arrhabaeus','major'),
('bromerus','Bromerus','Arrhabaeus’s father.','Bromerus','reference'),
('nicomachus','Nicomachus','A Phocian of Phanotis, who betrayed the plot on Siphae and Chaeronea to the Lacedaemonians, and they to the Boeotians.','Nicomachus','reference'),
('pagondas','Pagondas','Aeolidas’s son, Boeotarch of Thebes and commander-in-chief at Delium, and the one of the eleven who wanted to fight after the Athenians had already crossed back over the border. He told them that with a neighbour like this there is no frontier to argue about, since conquest would mean one frontier for the whole country; massed the Thebans twenty-five shields deep on the right; and when his left was breaking sent two squadrons of horse round the hill where they could not be seen, whose sudden appearance panicked the winning Athenian wing into thinking a second army had come.','Pagondas','major'),
('aeolidas','Aeolidas','Pagondas’s father.','Aeolidas','reference'),
('arianthides','Arianthides','Lysimachidas’s son, and the other Boeotarch of Thebes.','Arianthides','reference'),
('lysimachidas','Lysimachidas','Arianthides’s father.','Lysimachidas','reference'),
('aristagoras','Aristagoras','The Milesian who first tried to settle the spot that became Amphipolis, when he fled from King Darius, and was dislodged by the Edonians.','Aristagoras','reference'),
('eucles','Eucles','The general sent from Athens to defend Amphipolis. He could not get the gates held, sent down the coast for Thucydides, and watched the town accept Brasidas’s terms while the citizens stopped listening to him.','','supporting'),
('olorus','Olorus','Thucydides’s father.','Olorus','reference'),
('pittacus','Pittacus','King of the Edonians, killed by the sons of Goaxis and by his own wife Brauro — after which his town of Myrcinus came over to Brasidas.','Pittacus','reference'),
('goaxis','Goaxis','Whose sons killed the Edonian king.','Goaxis','reference'),
('brauro','Brauro','Pittacus’s wife, and one of his killers.','Brauro','reference'),
('lysistratus','Lysistratus','An Olynthian, who commanded the seven light-armed men with daggers — the only ones of twenty ordered on the service who dared go in — that passed through the sea wall at Torone and cut down the guard of the highest post in the town.','Lysistratus','reference'),
('phoenippus','Phoenippus','Secretary when the Athenians voted the year’s armistice.','Phoenippus','reference'),
('niciades','Niciades','Chairman when the Athenians voted the year’s armistice.','Niciades','reference'),
('taurus','Taurus','Echetimides’s son, one of the three Lacedaemonians who concluded the armistice and poured the libation.','Taurus','reference'),
('echetimides','Echetimides','Taurus’s father.','Echetimides','reference'),
('athenaeus','Athenaeus','Pericleidas’s son, a Lacedaemonian signatory to the armistice, and the commissioner who carried it round to Brasidas in Thrace.','Athenaeus','supporting'),
('pericleidas','Pericleidas','Athenaeus’s father.','Pericleidas','reference'),
('philocharidas','Philocharidas','Eryxidaidas’s son, the third of the Lacedaemonian signatories.','Philocharidas','supporting'),
('eryxidaidas','Eryxidaidas','Philocharidas’s father.','Eryxidaidas','reference'),
('aeneas','Aeneas','Ocytus’s son, one of the two Corinthian signatories.','Aeneas','reference'),
('ocytus','Ocytus','Aeneas’s father.','Ocytus','reference'),
('damotimus','Damotimus','Naucrates’s son, one of the two Sicyonian signatories.','Damotimus','reference'),
('naucrates','Naucrates','Damotimus’s father.','Naucrates','reference'),
('onasimus','Onasimus','Megacles’s son, the other Sicyonian signatory.','Onasimus','reference'),
('megacles','Megacles','Onasimus’s father.','Megacles','reference'),
('nicasus','Nicasus','Cecalus’s son, one of the two Megarian signatories.','Nicasus','reference'),
('cecalus','Cecalus','Nicasus’s father.','Cecalus','reference'),
('menecrates','Menecrates','Amphidorus’s son, the other Megarian signatory.','Menecrates','reference'),
('amphidorus','Amphidorus','Menecrates’s father.','Amphidorus','reference'),
('amphias','Amphias','Eupaidas’s son, an Epidaurian, and the last of the signatories before the three Athenian generals.','Amphias','reference'),
('eupaidas','Eupaidas','Amphias’s father.','Eupaidas','reference'),
('aristonymus-athens','Aristonymus','The Athenian commissioner who carried the armistice round the Thracian towns. He made no difficulty about the rest, but counted the days, found that Scione had gone over after the convention, and refused to include it — on which Brasidas said flatly that the revolt had come first and would not give the town up. The facts were rather as the Athenians contended. Not Euphamidas’s father.','','supporting'),
('polydamidas','Polydamidas','The commander Brasidas sent over to Scione and Mende with five hundred Peloponnesian heavy infantry and three hundred Chalcidian targeteers. Inside Mende he drew up the piled arms for a sortie, was answered factiously by one of the popular party, and dragged the man by the arm and knocked him about — which put the commons into their arms and lost him the town in an afternoon.','Polydamidas','supporting'),
('ischagoras','Ischagoras','The Lacedaemonian whose overland army for Brasidas was stopped before it started, by Perdiccas setting his friends in Thessaly in motion. He got through himself with Ameinias and Aristeus to see how matters stood, and brought out from Sparta — in violation of all precedent — young men to be put in command of the towns, rather than leave them to persons on the spot.','Ischagoras','supporting'),
('ameinias','Ameinias','One of the two who reached Brasidas with Ischagoras.','Ameinias','reference'),
('aristeus-lacedaemon','Aristeus','The third of the Lacedaemonians who reached Brasidas to inspect the state of affairs. Neither of the two Corinthians of that name.','','reference'),
('clearidas','Clearidas','Cleonymus’s son, one of the young Spartans brought out against precedent to command the towns, and placed by Brasidas in Amphipolis.','Clearidas','supporting'),
('cleonymus','Cleonymus','Clearidas’s father.','Cleonymus','reference'),
('pasitelidas','Pasitelidas','Hegesander’s son, the other of the young Spartans, and placed in Torone.','Pasitelidas','supporting'),
('hegesander','Hegesander','Pasitelidas’s father.','','reference'),
('phaeinis','Phaeinis','The priestess the Argives appointed in Chrysis’s place, agreeably to the law in such a case, after the temple of Hera burned.','Phaeinis','reference'),
('nisus','Nisus','Whose temple at Nisaea marks one end of the road that the armistice forbade either side to cross.','Nisus','reference','mythological-figure'),
# ------------------------------------------------------ peoples of Chapter 14
('acanthians','The Acanthians','Divided over whether to admit Brasidas, they let him in alone to speak and then voted in secret — swayed, Thucydides says, as much by fear for a vintage still out on the vines as by his seductive arguments. They would not admit the army until he had given his personal security for the oaths sworn at home.','Acanthians','supporting','group'),
('toronaeans','The Toronaeans','Whose few partisans broke down the postern from within, cut through the bar of the market gates, and let the targeteers in; and whose other party fled to Lecythus with the Athenians and were invited home again without fear for their rights or persons.','Toronaeans','supporting','group'),
('scionaeans','The Scionaeans','Who say they are Pallenians from the Peloponnese, carried in to the spot by the storm that caught the Achaeans on the voyage from Troy. They revolted while the armistice was being carried round, crowned Brasidas with a crown of gold as the liberator of Hellas and garlanded him privately like an athlete — and had a decree passed at Athens, on Cleon’s motion, to reduce them and put them to death.','Scionaeans','major','group'),
('mendaeans','The Mendaeans','An Eretrian colony in Pallene, brought over by a few conspirators who had carried on their practices too long not to fear detection; and the commons who turned on Polydamidas, let the Athenians in without any convention, and were told afterwards that they might keep their civil rights and judge the authors of the revolt themselves.','Mendaeans|Mendaean','supporting','group'),
('perrhaebians','The Perrhaebians','Subjects of Thessaly, who took Brasidas on from the border and set him down at Dium in Perdiccas’s country, under Mount Olympus.','Perrhaebians','reference','group'),
('thespians','The Thespians','Who stood where the Boeotian left was worsted at Delium, and when the troops beside them gave way were surrounded in a narrow space and cut down fighting hand to hand. That same summer the Thebans pulled down their wall on the charge of Atticism, having always wished to, and finding it easy now that the flower of the Thespian youth was gone.','Thespians|Thespian','supporting','group'),
('orchomenians-boeotia','The Orchomenians','Of the Boeotian Orchomenus — formerly the Minyan — on the left at Delium. Not the Arcadians of the same name.','','reference','group'),
('haliartians','The Haliartians','One of the peoples about the lake, in the Boeotian centre at Delium.','Haliartians','reference','group'),
('coronaeans','The Coronaeans','One of the peoples about the lake, in the Boeotian centre at Delium.','Coronaeans','reference','group'),
('copaeans','The Copaeans','One of the peoples about the lake, in the Boeotian centre at Delium.','Copaeans','reference','group'),
('bisaltians','The Bisaltians','One of the stocks in the small mixed towns of Acte, under Athos, where two languages are spoken.','Bisaltians','reference','group'),
('crestonians','The Crestonians','Another of the stocks in the small towns of Acte.','Crestonians','reference','group'),
('methonaeans','The Methonaeans','A hundred and twenty of their light-armed went up the path outside Mende with Nicias and the archers.','Methonaeans','reference','group'),
('amphipolitans','The Amphipolitans','Who had houses all over the quarter outside the wall, and of whom only a small number were Athenians — which is why Brasidas’s moderate proclamation looked fair to them compared with what their fear had suggested.','Amphipolitans','supporting','group'),
('pallenians','The Pallenians','From the Peloponnese, whom the Scionaeans claim as their first founders.','Pallenians','reference','group'),
('euboeans','The Euboeans','At whose condition, and at most of the rest of Hellas, Pagondas told the Boeotians to look and be convinced.','Euboeans','reference','group'),
('acamantis','Acamantis','The Athenian tribe that held the prytany when the armistice was voted.','Acamantis','reference','group'),
('chalcidians-sicily','The Chalcidian Race','Chalcidians out of Euboea and the cities they made in Sicily — Naxos first, then Leontini, Catana, Zancle and Himera — Ionian by blood, which Hermocrates told the congress at Gela would not save them, since the attack was not inspired by hatred of one of two nationalities but by a desire for the good things in Sicily. He said the same thing at Camarina from the other side: Athens cherishes the Chalcidians of Leontini and keeps the Chalcidians of Euboea in servitude. Not the Chalcidians of the Thracian seaboard.','','supporting','group'),
]:add(*row)

# ---------------------------------------------------------------- Book 4 snapshots
# Cards that change once the reader has been through chapters 12-14. The gate is
# the paragraph at which the episode described is finished.
def snap(eid,after,body):
 e=next(x for x in entities if x['id']==eid)
 e['snapshots'].append(dict(after=after,body=body))
 e['snapshots'].sort(key=lambda u:tuple(u['after']))

snap('brasidas',[12,11],'Tellis’s son, and captain of a galley in the assault on Pylos. Seeing the captains and steersmen hang back for fear of wrecking their ships on that coast, he shouted that they must not spare timber while an enemy fortified himself in their country, forced his own steersman to run the ship ashore, and was cut down on the gangway. His shield slipped into the sea, washed ashore, and went into the Athenian trophy.')
snap('brasidas',[14,63],'Tellis’s son, and the best advertisement Lacedaemon had. He relieved Megara by standing in order of battle and not fighting; walked seventeen hundred men through hostile Thessaly by keeping just ahead of the news; and then took the Thracian towns by speech and moderation rather than by siege — Acanthus with an argument and a threat to the vintage, Amphipolis with terms so fair that the townsmen stopped listening to their own general, Torone through a postern, Scione by crossing at night in a small boat behind a galley. Scione crowned him with gold as the liberator of Hellas. Thucydides says he was the first to go out and show himself so good a man at all points that he left behind the conviction that the rest were like him, and that this was what afterwards made the allies of Athens want the Lacedaemonians. Sparta sent him no reinforcements: partly envy among the chief men, partly a fixed wish to get the prisoners back and end the war.')
snap('cleon',[12,47],'Cleaenetus’s son, who talked Athens out of the peace the Lacedaemonians offered for the men on the island, and then had to live with it. Accused of blocking the treaty, he called the reports from Pylos lies; offered the command of an expedition as a taunt to Nicias; found the offer taken seriously; and could not get out of his own words. He asked for no Athenian troops, promised to bring the Lacedaemonians back alive or kill them there within twenty days, and — crazy as the promise was — kept it, having chosen Demosthenes, who had already planned the landing, as his colleague.')
snap('demosthenes',[12,47],'Alcisthenes’s son, who asked for nothing but leave to use the fleet on the Peloponnesian coast, was carried into Pylos by a squall, and could not persuade the generals or the soldiers to fortify it — until the soldiers, with no iron tools, did it themselves in six days with stones that happened to fit and mortar carried on their backs. He was left with five ships, armed his sailors with osier shields off a Messenian privateer, and held the one landing place he had judged the enemy would choose. Afterwards, with the island burnt bare by an accidental fire, he planned the descent that surrounded four hundred and twenty Lacedaemonians with light troops who could conquer in flight, and would not let the killing finish.')
snap('nicias-niceratus',[14,65],'Niceratus’s son, and the general Cleon taunted into losing his command at Pylos — he resigned it in the assembly and called the Athenians to witness that he had. He beat the Corinthians at Solygia, took Cythera by a mixture of battle and private correspondence, burnt Thyrea, and was wounded on the hill outside Mende; and it was to him that Perdiccas had to prove his change of side.')
snap('perdiccas',[14,67],'King of the Macedonians, who procured a Peloponnesian army and then quarrelled with it. He had brought Brasidas out chiefly to put down Arrhabaeus, and when Brasidas parleyed with Arrhabaeus instead he cut his contribution from a half to a third. On the second expedition his Illyrian mercenaries went over to the enemy, his own troops broke in a night panic and went home, and Brasidas’s soldiers cut down the oxen they found on the road. From that moment he made peace with Athens, and set his friends in Thessaly to stop the next Lacedaemonian army before it could start.')
snap('thucydides',[14,33],'The Athenian who wrote this, and who appears in it once as a commander. He held the right to work the gold mines of that part of Thrace and had great influence on the mainland, and was at Thasos, half a day’s sail off, when Eucles sent for him. He sailed at once with seven ships. Brasidas, who knew exactly who was coming, offered Amphipolis terms good enough to be taken that same day; Thucydides reached Eion the same evening, within a night of losing that too, and secured it instead.')
snap('helots',[14,4],'Whose numbers and stubbornness governed Lacedaemonian policy at all times. With Pylos held against them, the Spartans invited the Helots to pick out those who claimed to have distinguished themselves most against the enemy, in order to receive their freedom — really to find out which of them were high-spirited enough to rebel. Two thousand were chosen, crowned themselves and went round the temples; they were done away with soon afterwards, and no one ever knew how each of them perished. Seven hundred more were sent safely out of the country as heavy infantry with Brasidas.')
snap('lacedaemonians',[13,13],'Who lost four hundred and twenty men on an island and were never the same in this war. Nothing in it surprised the Hellenes so much: the opinion had been that no force or famine would make them give up their arms. With Pylos and Cythera held against them and descents possible anywhere, they stood on the defensive everywhere, raised four hundred horse and a force of archers for the first time, and grew afraid to take the field at all — new to adversity, and convinced they could not stir without making a blunder.')
snap('megarians',[13,32],'Ground between two Athenian invasions a year and their own exiles at Pegae, the city was on the point of taking the exiles back when the popular leaders offered the town to Athens instead. The long walls were lost in a night; the upper town was saved by one man denouncing the plot and by Brasidas arriving and standing in order of battle. The exiles came home under oaths to take no vengeance, held a review of the heavy infantry, picked out about a hundred of their enemies, compelled an open vote, and executed them — and set up an oligarchy that lasted a very long time, made by very few partisans.')
snap('boeotians',[14,25],'Who would not have fought at Delium at all if Pagondas had not argued the other ten Boeotarchs down. Seven thousand heavy infantry, the Thebans twenty-five shields deep, the peoples of the lake in the centre, the Thespians and Tanagraeans and Orchomenians on the left. They lost the left and won with the right, and two squadrons of horse sent unseen round a hill finished it. Afterwards they refused the Athenian dead until the sanctuary was evacuated, argued the law of the Hellenes with heralds for seventeen days, and burnt the fort down with a cauldron of coals and pitch blown through a hollowed beam.')
snap('corcyraeans',[13,6],'Whose revolution ended when the commons, afraid the Athenian generals would take the prisoners off to Athens alive, tempted a few of them into a boat to void the treaty — and then led the whole body out in twenties between two lines of heavy infantry to be beaten and stabbed. When the rest understood, they killed themselves inside the building with the arrows shot down at them through the roof, with bed-cords and strips of clothing. The women taken in the stronghold were sold. Of one party, Thucydides says, there was practically nothing left.')
snap('messenians',[12,49],'Whose old country Pylos had once been, and who supplied the forty heavy infantry, the thirty-oared privateer and the shields that held it. Their commander found the path round the Lacedaemonian rear on Sphacteria when the struggle seemed endless. Afterwards Naupactus sent the likeliest of them back to the old country to raid Laconia, which their common dialect made all the more destructive.')
snap('aeginetans',[13,15],'Who had been given Thyrea by Lacedaemon and were still there when the Athenians came round from Cythera. They abandoned the fort they were building on the coast; the Lacedaemonian garrison helping them would not shut itself up inside the walls with them. The town was burnt, and all the Aeginetans not killed in the action were taken to Athens and put to death on account of the old inveterate feud.')
snap('sitalces',[14,27],'Teres’s son and king of the Odrysians, who died about the time of Delium, defeated in battle in a campaign against the Triballi.')
snap('seuthes',[14,27],'Spardacus’s son and Sitalces’s nephew, who succeeded to the kingdom of the Odrysians and to the rest of Thrace that Sitalces had ruled.')
snap('hagnon',[14,28],'Nicias’s son, and the founder of Amphipolis — twenty-nine years after the ten thousand settlers sent to the same spot were cut off at Drabescus. He started from Eion, drove out the Edonians, and named the place for the Strymon running round it on two sides, running a long wall from river to river and building it to be conspicuous from sea and land alike.')


# ============ BOOK 5, CHAPTER 15 — Amphipolis kills both war leaders, and peace
for row in [
('phaeax','Phaeax','Erasistratus’s son, sent with two colleagues to Italy and Sicily to talk the Sicilians into a general coalition against Syracuse and so save the commons of Leontini. He succeeded at Camarina and Agrigentum, was rebuffed at Gela, and gave the rest up rather than be refused again; on the way home he made terms with the Locrian settlers he met, who were the only allies that had not come into the Sicilian peace.','Phaeax','supporting'),
('erasistratus','Erasistratus','Phaeax’s father.','Erasistratus','reference'),
('polles','Polles','King of the Odomantians, whom Cleon asked for as many Thracian mercenaries as he could bring. Cleon was still waiting for them at Eion when his own soldiers’ grumbling forced him up to Amphipolis.','Polles','reference'),
('autocharidas','Autocharidas','One of the three Lacedaemonians who took nine hundred heavy infantry toward Thrace, got as far as Pierium in Thessaly, and turned back when they heard Brasidas was dead.','Autocharidas','reference'),
('epicydidas','Epicydidas','The third of them.','Epicydidas','reference'),
('aristocles-brother-of-pleistoanax','Aristocles','Pleistoanax’s brother, accused with him of bribing the prophetess at Delphi to tell every Lacedaemonian deputation that arrived to bring home the seed of the demigod son of Zeus, or else plough with a silver ploughshare. Not the polemarch who would not move his company at Mantinea.','','reference'),
('pleistolas','Pleistolas','The ephor at Lacedaemon by whose year the Peace of Nicias is dated, and one of the seventeen who swore to it.','Pleistolas','supporting'),
('alcaeus','Alcaeus','The archon at Athens by whose year the peace is dated.','Alcaeus','reference'),
('damagetus','Damagetus','One of the seventeen Lacedaemonians who swore to the peace and to the alliance. The two lists spell him Damagetis and Damagetus.','Damagetis|Damagetus','reference'),
('chionis','Chionis','One of the seventeen Lacedaemonian signatories.','Chionis','reference'),
('metagenes','Metagenes','One of the seventeen Lacedaemonian signatories.','Metagenes','reference'),
('acanthus-signatory','Acanthus','One of the seventeen Lacedaemonian signatories, who shares his name with the Andrian colony Brasidas talked into revolt.','','reference'),
('daithus','Daithus','One of the seventeen Lacedaemonian signatories.','Daithus','reference'),
('zeuxidas','Zeuxidas','One of the seventeen Lacedaemonian signatories.','Zeuxidas','reference'),
('antippus','Antippus','One of the seventeen Lacedaemonian signatories.','Antippus','reference'),
('alcinadas','Alcinadas','One of the seventeen Lacedaemonian signatories.','Alcinadas','reference'),
('empedias','Empedias','One of the seventeen Lacedaemonian signatories.','Empedias','reference'),
('menas','Menas','A Lacedaemonian signatory, and one of the three envoys sent to Thrace with orders to Clearidas to hand Amphipolis over — which he did not.','Menas','reference'),
('laphilus','Laphilus','One of the seventeen Lacedaemonian signatories.','Laphilus','reference'),
('tellis-signatory','Tellis','One of the seventeen Lacedaemonian signatories. He is given no patronymic and the history does not say whether he is Brasidas’s father.','','reference'),
('lampon','Lampon','One of the seventeen Athenians who swore to the peace and to the alliance, and first on both lists.','Lampon','reference'),
('isthmonicus','Isthmonicus','One of the seventeen Athenian signatories. The two lists spell him Isthmonicus and Isthmionicus.','Isthmonicus|Isthmionicus','reference'),
('euthydemus-signatory','Euthydemus','One of the seventeen Athenian signatories. He is given no patronymic and the history does not say whether he is the Euthydemus who commanded in Sicily.','','reference'),
('procles-signatory','Procles','One of the seventeen Athenian signatories. Not Theodorus’s son, who was killed in Aetolia.','','reference'),
('pythodorus-signatory','Pythodorus','One of the seventeen Athenian signatories. He is given no patronymic, and the history does not say which of the two Pythodoruses it is.','','reference'),
('myrtilus','Myrtilus','One of the seventeen Athenian signatories.','Myrtilus','reference'),
('thrasycles-signatory','Thrasycles','One of the seventeen Athenian signatories. He is given no patronymic and the history does not say whether he is the commander of Book 8.','','reference'),
('aristocrates-signatory','Aristocrates','One of the seventeen Athenian signatories. He is given no patronymic and the history does not say whether he is either of the later Aristocrateses.','','reference'),
('iolcius','Iolcius','One of the seventeen Athenian signatories.','Iolcius','reference'),
('timocrates-athens','Timocrates','One of the seventeen Athenian signatories. Neither the Corinthian, the Lacedaemonian who killed himself off Naupactus, nor Aristotle’s father.','','reference'),
('leon-athens','Leon','One of the seventeen Athenian signatories.','','reference'),
('ampelidas','Ampelidas','One of the two Lacedaemonians whose application to renew the thirty years’ truce Argos refused, which is what made Lacedaemon turn to the Athenian alliance instead.','Ampelidas','reference'),
('lichas','Lichas','Arcesilaus’s son, a Lacedaemonian, and Argos’s proxenus at Sparta. He was scourged on the course at Olympia by the umpires for coming forward and crowning his own charioteer after his horses had been proclaimed a Boeotian victory — Lacedaemon being excluded from the games that year — and afterwards carried to Argos the two proposals, war or peace, that broke the Argive league.','Lichas','major'),
('arcesilaus','Arcesilaus','Lichas’s father.','Arcesilaus','reference'),
('pharnaces-satrap','Pharnaces','Who gave the Delians Atramyttium in Asia to live in when Athens expelled them from their island. The history does not say whether he is the Pharnaces whose son Artabazus carried Pausanias’s letters.','','reference'),
# ------------------------------------------------------ peoples of Chapter 15
('delians','The Delians','Expelled from their own island by Athens, which had concluded that some old offence at the time of their consecration was the flaw in the purification; they were given Atramyttium in Asia by Pharnaces, and brought back two years later on the command of the god at Delphi.','Delians','supporting','group'),
('olynthians','The Olynthians','With whom the Athenians exchanged the prisoners from Torone, and who took Mecyberna and its Athenian garrison during the peace.','Olynthians|Olynthian','supporting','group'),
('hipponians','The Hipponians','Colonists of the Locrians of Italy, and at war with them on their border — which is why the Locrians came into the treaty with Athens at last.','Hipponians','reference','group'),
('medmaeans','The Medmaeans','The other Locrian colony at war with its mother city.','Medmaeans','reference','group'),
('mecybernaeans','The Mecybernaeans','One of the three Chalcidian peoples the peace left in their own cities.','Mecybernaeans','reference','group'),
('sanaeans','The Sanaeans','One of the three.','Sanaeans','reference','group'),
('singaeans','The Singaeans','The third.','Singaeans','reference','group'),
('myrcinians','The Myrcinians','Of the Edonian town that came over to Brasidas. One of their targeteers overtook and killed Cleon; their horse and the Chalcidians’ finished the Athenian right.','Myrcinian','supporting','group'),
]:add(*row)

# ========== BOOK 5, CHAPTER 16 — the Argive league, and the battle of Mantinea
for row in [
('alcibiades','Alcibiades','Clinias’s son, still young for high office in any other Hellenic city but distinguished by the splendour of his ancestry — and offended that Lacedaemon had made the peace through Nicias and Laches and passed him over. He sent privately to Argos to bring the Argives, Mantineans and Eleans to Athens; trapped the Lacedaemonian envoys into denying in the assembly the full powers they had claimed in the senate, by promising privately to give Pylos back for them; and carried the hundred years’ alliance. Afterwards he marched about the Peloponnese settling the league’s affairs, had the Athenians write on the Laconian pillar that Lacedaemon had not kept her oaths, and when Argos went over at last carried off three hundred suspected men and lodged them in the islands.','Alcibiades','central'),
('clinias-father-of-alcibiades','Clinias','Alcibiades’s father. Not Cleopompus’s father.','','reference'),
('cleobulus','Cleobulus','One of the two ephors most anxious to break the treaty off, who took the Boeotians and Corinthians aside and told them to get themselves into alliance with Argos first and with Lacedaemon afterwards.','Cleobulus','supporting'),
('xenares','Xenares','The other, and the one whose party carried the vote that kept the Boeotian alliance when Nicias came to ask for it to be given up.','','supporting'),
('xenares-cnidis','Xenares','Cnidis’s son, the Lacedaemonian commanding at Heraclea in Trachis, and among the slain when the neighbouring tribes beat the Heracleots. The history does not say whether he is the ephor.','','reference'),
('cnidis','Cnidis','Xenares the commander’s father.','Cnidis','reference'),
('eustrophus','Eustrophus','One of the two Argives sent to Lacedaemon as the men most likely to be acceptable, to get the best treaty they could and be left in peace. They came back with a fifty years’ truce that left the Cynurian land to be settled, if either side chose, by a formal challenge and a battle.','Eustrophus','reference'),
('aeson','Aeson','The other of the two.','Aeson','reference'),
('andromedes','Andromedes','One of the three Lacedaemonians sent to take Panactum and the Athenian prisoners from the Boeotians and hand them back. They found Panactum razed, brought the prisoners to Athens, and announced the demolition as though it were as good as restitution.','Andromedes','reference'),
('phaedimus','Phaedimus','The second of the three.','Phaedimus','reference'),
('antimenidas','Antimenidas','The third.','Antimenidas','reference'),
('androsthenes','Androsthenes','An Arcadian, victor for the first time in the wrestling and boxing at the Olympic games from which Lacedaemon was excluded.','Androsthenes','reference'),
('agesippidas','Agesippidas','The Lacedaemonian whom the Boeotians sent away from Heraclea for misgovernment, having occupied the place themselves; and the commander of the three hundred men slipped into Epidaurus by sea under the Athenians’ noses.','Agesippidas','reference'),
('thrasylus','Thrasylus','One of the five Argive generals, who with Alciphron and on nobody’s authority but their own went out between the armies and got Agis to grant a four-month truce — throwing away the best field Argos would ever have. The Argives began to stone him in the bed of the Charadrus; he reached the altar and saved his life, and lost his property.','Thrasylus','supporting'),
('alciphron','Alciphron','The Lacedaemonian proxenus at Argos, and the other man who went out to parley with Agis.','Alciphron','reference'),
('hipponoidas','Hipponoidas','One of the two polemarchs ordered, in the moment of the onset at Mantinea, to fill the gap Agis had just opened on his own left. He would not move over, and was banished from Sparta afterwards on the charge of cowardice.','Hipponoidas','supporting'),
('aristocles-polemarch','Aristocles','The other polemarch who would not move over, and was banished with him. Not Pleistoanax’s brother.','','supporting'),
('endius','Endius','One of the three Lacedaemonians reputed well disposed toward Athens, sent in haste to keep the Argive alliance from being made — and made to look insincere in the assembly by Alcibiades.','Endius','supporting'),
('leon-sparta','Leon','Another of the three.','','reference'),
('heracles','Heracles','By whose temple outside Mantinea the Lacedaemonians camped, and to whose temple they came back from diverting the water on the morning the Argives appeared in front of them in order of battle.','Heracles','reference','mythological-figure'),
# ------------------------------------------------------ peoples of Chapter 16
('lepreans','The Lepreans','Who gave the Eleans half their land for ending a war with the Arcadians, paid the talent to Olympian Zeus until the Attic war gave them an excuse to stop, and appealed to Lacedaemon when Elis used force. Lacedaemon declared them independent and put a garrison in, and Elis went over to Argos.','Lepreans|Leprean','supporting','group'),
('parrhasians','The Parrhasians','Subjects of Mantinea, a faction among whom asked Lacedaemon in. Their country was laid waste, the Mantinean fort at Cypsela razed, and they themselves declared independent.','Parrhasians|Parrhasian','reference','group'),
('maenalians','The Maenalians','Arcadians in the Lacedaemonian line at Mantinea, and whose men the Argives were to give back under the terms Lichas brought.','Maenalians','reference','group'),
('sciritae','The Sciritae','Who in a Lacedaemonian army always hold the left wing to themselves alone; six hundred of them at Mantinea, ordered out of the line to stretch it and broken in the gap that order made.','Sciritae','supporting','group'),
('neodamodes','The Neodamodes','Enfranchised Helots, settled with Brasidas’s men at Lepreum on the Elean border and drawn up beside them at Mantinea.','Neodamodes','supporting','group'),
('brasideans','The Brasideans','The Helots who had gone to Thrace with Brasidas, freed by decree and allowed to live where they liked; at Mantinea they stood next to the Sciritae and were broken with them.','Brasideans','supporting','group'),
('heracleots','The Heracleots','Of Heraclea in Trachis, harassed from its foundation by every neighbour it threatened, and beaten at last by the Aenianians, Dolopians, Malians and some of the Thessalians.','Heracleots','supporting','group'),
('aenianians','The Aenianians','One of the tribes bordering Heraclea that combined to defeat it.','Aenianians','reference','group'),
('cleonaeans','The Cleonaeans','Argive allies, next to the Orneans in the line at Mantinea, and among the seven hundred dead counted with the Argives.','Cleonaeans','reference','group'),
('orneans','The Orneans','The other small Argive ally in that line. Lacedaemon settled the Argive exiles among them, and Argos razed the town.','Orneans|Orneatae','reference','group'),
('dians','The Dians','Of Dium on Athos, who took Thyssus from the Athenian alliance, and who revolted to the Chalcidians themselves two years later.','Dians','reference','group'),
('patrians','The Patrians','Whom Alcibiades induced to carry their walls down to the sea.','Patrians','reference','group'),
('orchomenians-arcadia','The Orchomenians','Of Orchomenos in Arcadia, where Lacedaemon had lodged her Arcadian hostages. Alarmed by a weak wall and a large army, they joined the league, gave hostages of their own to Mantinea, and gave up the ones they were holding. Not the Boeotians of the same name.','','reference','group'),
]:add(*row)

# ================== BOOK 5, CHAPTER 17 — the Melian dialogue and the fate of Melos
for row in [
('cleomedes','Cleomedes','Lycomedes’s son, one of the two Athenian generals who camped on Melos and sent envoys in before doing any damage to the land. The Melians would not let them speak before the people.','Cleomedes','supporting'),
('lycomedes-father-of-cleomedes','Lycomedes','Cleomedes’s father. The history does not say whether he is the Lycomedes whose son Archestratus went to Potidaea.','','reference'),
('tisias','Tisias','Tisimachus’s son, the other general at Melos.','Tisias','supporting'),
('tisimachus','Tisimachus','Tisias’s father.','Tisimachus','reference'),
('philocrates','Philocrates','Demeas’s son, who brought the reinforcements that pressed the siege of Melos to its end.','Philocrates','reference'),
('demeas','Demeas','Philocrates’s father.','Demeas','reference'),
]:add(*row)

# ---------------------------------------------------------------- Book 5 snapshots
snap('thucydides',[16,1],'The Athenian who wrote this, and who says plainly here how he came to be able to. He lived through the whole twenty-seven years, of an age to understand them and giving his attention to them in order to know the exact truth; and after his command at Amphipolis he was in exile from his country for twenty years, which put him with both sides and especially with the Peloponnesians, and gave him the leisure to observe. He insists that the ten years’ peace was no peace — neither side gave back or received what was agreed — and counts the whole thing as one war, by summers and winters, because the names of magistrates cannot date anything accurately.')
snap('brasidas',[15,9],'Tellis’s son, killed in the victory that made him a hero. He would not march out in order against the flower of the Athenian army, but picked a hundred and fifty men, left the rest with Clearidas at the Thracian gates, and told them that the enemy’s spears and heads were bobbing — troops that do that seldom stand a charge. He ran out at the palisade gate, broke the Athenian centre, was wounded going on to the right, and was carried into the town alive long enough to hear that he had won. The Amphipolitans buried him in front of what is now their marketplace, fenced his tomb, sacrifice to him as a hero with games and yearly offerings, made him their founder, and pulled down everything that recorded Hagnon.')
snap('cleon',[15,8],'Cleaenetus’s son, whose luck at Pylos killed him at Amphipolis. He took Torone before Brasidas could relieve it, then sat at Eion waiting for Perdiccas and for Thracian mercenaries until his own soldiers’ contempt forced him up the road. He posted the army on a hill to look at the place, thought nobody would come out, and was sounding the retreat — wheeling his right and exposing its unarmed side — when Brasidas came out of two gates at once. He had never had any thought of fighting, fled first, and was overtaken and killed by a Myrcinian targeteer. About six hundred Athenians fell, and seven of the enemy.')
snap('nicias-niceratus',[16,22],'Niceratus’s son, the most successful general of his time and the author of the peace that carries his name. He wanted to secure his good fortune while it lasted, keep out of the way of chance, and leave behind the name of a statesman who never failed — and thought only peace made that possible. He got the treaty and then spent years watching it come apart: overlooked by Lacedaemon in favour of nobody, outmanoeuvred by Alcibiades in front of the assembly, and sent to Sparta himself to ask for Panactum standing and the Boeotian alliance given up. He came back with nothing but the oaths renewed, and was blamed for the treaty he had made.')
snap('pleistoanax',[15,14],'Pausanias’s son and king of Lacedaemon, who wanted peace because peace was the only thing that could stop his enemies using him. He had been nineteen years in exile at Lycaeum, with half his house built inside the sacred precinct of Zeus for fear of his countrymen, and was restored — his accusers said — because he and his brother Aristocles had bribed the prophetess at Delphi to tell every deputation to bring home the seed of the demigod son of Zeus. Every reverse after that was laid at the door of his unjust restoration.')
snap('agis',[16,60],'Archidamus’s son, king of Lacedaemon, who nearly lost the Peloponnese and then saved it in an afternoon. He had the Argives surrounded before their own walls and granted them a four-month truce instead, on the word of two men who had no authority to give it — for which Sparta came within a vote of razing his house and fining him ten thousand drachmae, and did pass a law attaching ten counsellors to him without whose consent he could not lead an army out. At Mantinea he ordered his left extended in the moment of the onset, two polemarchs refused to fill the gap, and the Mantineans poured through it; he turned the whole army on the broken wing and won the greatest Hellenic battle for a very long time.')
snap('lacedaemonians',[16,60],'Whose name had been ruined by the island and was restored by one battle. In the years of the peace they gave back nothing they had promised, made a separate alliance with the Boeotians, were excluded from Olympia for a fine they would not pay, and were thought slow and faint-hearted by all Hellas. At Mantinea they were caught wholly unprepared — a shock such as they do not remember experiencing — fell into their ranks at a word passed from king to polemarch to lochage to pentecoster to enomotarch, advanced slowly to the flutes so as not to break their order, were completely outdone in generalship and won anyway. Fortune, it was thought, might have humbled them; the men were the same as ever.')
snap('argives',[16,80],'Who came out of the ten years’ war rich and neutral, meant to have the Peloponnese, and ended with a Lacedaemonian oligarchy in the city. They took Mantinea, Elis and Corinth into a league, then Athens; threw away the finest field they would ever have because two men made a truce nobody had authorised; lost seven hundred at Mantinea; and were talked by their own Lacedaemonian party into a fifty years’ alliance with the enemy. The commons came back at the Gymnopaediae, killed and banished the oligarchs, and began long walls to the sea with the whole city at the work, women and slaves included, and masons sent from Athens.')
snap('melians',[17,33],'A colony of Lacedaemon that would not be subjects like the other islanders. Told by the Athenian envoys that right is only in question between equals in power, while the strong do what they can and the weak suffer what they must, they answered that they would not in a moment give up the freedom of a city seven hundred years old, and trusted to fortune, to the gods, and to the Lacedaemonians. They broke the lines twice by night. Then treachery inside ended it: the Athenians killed all the grown men they took, sold the women and children, and sent out five hundred colonists of their own.')
snap('scionaeans',[16,7],'Who had crowned Brasidas as the liberator of Hellas. Athens reduced the town, put the adult males to death, made slaves of the women and children, and gave the land to the Plataeans to live in.')
snap('helots',[16,9],'Whose service in Thrace bought some of them their freedom and cost Lacedaemon nothing she valued. Those who had gone out with Brasidas were freed by decree and allowed to live where they liked, and were settled with the Neodamodes at Lepreum on the Elean border. The Spartans taken on the island were disfranchised instead — barred from office and from buying or selling — for fear that men who had surrendered their arms would start a revolution if left with their full rights; after some time the rights were given back.')
snap('messenians',[16,10],'Whose raids out of Pylos were the thing Lacedaemon most wanted stopped, and the first concession Athens made in the peace. They were withdrawn and settled at Cranii in Cephallenia — and put back into Pylos to plunder Laconia again as soon as Alcibiades wanted a grievance made visible.')
snap('corinthians',[16,34],'Who would not accept the peace, went straight from Lacedaemon to Argos to build a coalition against it, and then would not join the coalition either. She told Lacedaemon that her oaths to her Thracian friends stood in the way, and that the formula allowed for it — the gods stood in the way. She was content, she said, with the first defensive alliance, which bound her to help nobody in an attack; and having stood aloof from her own allies, turned her thoughts to Lacedaemon again.')
snap('eleans',[16,36],'Who excluded Lacedaemon from Olympia. They had fined her two thousand minae for sending heavy infantry into Lepreum during the sacred truce, offered to forgive their own share if Lepreum were restored, then offered to settle for an oath sworn on the altar of Olympian Zeus, and were refused both times. Lacedaemon sacrificed at home; the Eleans kept watch over the festival with armed young men and a thousand Argives, and scourged a Lacedaemonian on the course for crowning his own charioteer.')
snap('mantineans',[16,80],'Who had used the Attic war to bring much of Arcadia under them and went over to Argos for fear Lacedaemon would take it back. They held the right at the battle fought in their own country, broke the Sciritae and Brasideans and poured into the gap Agis had opened, and then had to run when the rest of the line collapsed behind them. When Argos changed sides they found they could do nothing alone, came to terms, and gave up their sovereignty over the towns.')
snap('clearidas',[15,28],'Cleonymus’s son, left in command at Amphipolis with the bulk of the force, who came out of the Thracian gates on Brasidas’s signal and finished the battle after Brasidas fell. Ordered by the peace to hand the town over to Athens, he would not — obliging the Chalcidians, and pleading that he could not do it against their will — and went to Lacedaemon in person to see whether the agreement could still be changed. It could not, and he was sent back to hand it over if he could and in any case to bring the Peloponnesians out.')
snap('perdiccas',[16,79],'King of the Macedonians, who joined the Argive and Lacedaemonian league when it was offered — Argos being the original home of his family — without at once breaking with Athens, and who then failed Athens over the expedition against the Chalcidians and Amphipolis so completely that it had to be broken up. Athens blockaded Macedonia and proclaimed him an enemy.')


# ============ BOOK 6, CHAPTER 18 — how Sicily was settled, and the great armament
for row in [
('thucles-founder','Thucles','Who brought the first Hellenes to Sicily — Chalcidians out of Euboea — and founded Naxos and the altar of Apollo Archegetes on which the deputies for the games still sacrifice before sailing; and who five years after Syracuse was founded drove the Sicels out and founded Leontini and Catana. Not Eurymedon’s father.','','supporting'),
('archias-corinth','Archias','One of the Heraclids from Corinth, who founded Syracuse the year after Naxos by driving the Sicels off the island the inner city stands on. Not the Camarinaean who was going to betray his town.','','supporting'),
('evarchus-catana','Evarchus','Whom the Catanians chose as their founder, though Thucles and the Chalcidians settled the place. Not the tyrant of Astacus.','','reference'),
('lamis','Lamis','Who brought a colony from Megara, founded Trotilus and then Thapsus, and died before his companions were driven out and given Hyblaean Megara.','Lamis','reference'),
('hyblon','Hyblon','A Sicel king, who gave up the place and invited the Megarians there.','Hyblon','reference'),
('gelo','Gelo','The Syracusan tyrant who expelled the Megarians of Sicily from their city and country after two hundred and forty-five years, and depopulated Camarina.','Gelo','supporting'),
('pamillus','Pamillus','Who came from the mother city Megara to help found Selinus.','Pamillus','reference'),
('antiphemus','Antiphemus','From Rhodes, who with Entimus of Crete led the colony that founded Gela in the forty-fifth year after Syracuse.','Antiphemus','reference'),
('entimus','Entimus','From Crete, the other founder of Gela.','Entimus','reference'),
('aristonous','Aristonous','One of the two founders the Geloans gave to Acragas.','Aristonous','reference'),
('pystilus','Pystilus','The other founder of Acragas.','Pystilus','reference'),
('perieres','Perieres','From Cuma, one of the two founders of Zancle — which the Sicels named for its shape, zanclon being their word for a sickle.','Perieres','reference'),
('crataemenes','Crataemenes','From Chalcis, the other founder of Zancle.','Crataemenes','reference'),
('anaxilas','Anaxilas','Tyrant of Rhegium, who drove out the Samians who had driven out the first settlers of Zancle, peopled the town with a mixed population, and renamed it Messina after his own old country.','Anaxilas','supporting'),
('euclides','Euclides','One of the three who founded Himera from Zancle, where the language came out a mixture of Chalcidian and Doric and the institutions Chalcidian.','Euclides','reference'),
('simus','Simus','The second of the three founders of Himera.','Simus','reference'),
('sacon','Sacon','The third.','Sacon','reference'),
('daxon','Daxon','One of the two Syracusan founders of Camarina.','Daxon','reference'),
('menecolus','Menecolus','The other.','Menecolus','reference'),
('hippocrates-gela','Hippocrates','Tyrant of Gela, who took the land of Camarina in ransom for Syracusan prisoners and resettled the place as its founder. Not Ariphron’s son, and not the Lacedaemonian of Book 8.','','reference'),
('italus','Italus','A king of the Sicels, from whom Italy took its name.','Italus','reference'),
('xenophanes','Xenophanes','Lamachus’s father.','Xenophanes','reference'),
# ------------------------------------------------------ peoples of Chapter 18
('cyclopes','The Cyclopes','With the Laestrygones, the earliest inhabitants spoken of in any part of Sicily. Thucydides says he cannot tell what race they were, where they came from or where they went, and leaves his readers to the poets.','Cyclopes','reference','group'),
('laestrygones','The Laestrygones','The other people of that first account, and equally unknown.','Laestrygones','reference','group'),
('sicanians','The Sicanians','Who claim to be the first of all and aboriginal, but who the facts show were Iberians driven by the Ligurians from the river Sicanus. They gave the island the name Sicania, were beaten by the Sicels and pushed into the south and west, and hold it still.','Sicanians|Sicanian','supporting','group'),
('ligurians','The Ligurians','Who drove the Sicanians out of Iberia.','Ligurians','reference','group'),
('iberians','The Iberians','What the Sicanians really were; and, Alcibiades told the Lacedaemonians, among the barbarians Athens meant to hire — confessedly the most warlike known.','Iberians','reference','group'),
('elymi','The Elymi','Trojans who escaped the Achaeans at the fall of Ilium and settled next to the Sicanians, with some Phocians storm-carried from Troy by way of Libya; their towns are Eryx and Egesta.','Elymi','supporting','group'),
('opicans','The Opicans','Whom the Sicels were fleeing when they crossed from Italy on rafts, watching for the wind down the strait.','Opicans','reference','group'),
('myletidae','The Myletidae','Syracusan exiles beaten in a civil war, who joined the Chalcidians in settling Himera.','Myletidae','reference','group'),
('egestaeans','The Egestaeans','At war with their Selinuntine neighbours over marriages and a border, and the people who talked Athens into Sicily — reminding her of the alliance made in Laches’s time, warning that Dorians would one day come to the help of Dorians, and promising money. They showed the first Athenian envoys the treasures at the temple of Aphrodite on Eryx, and privately lent one another the same gold and silver plate from banquet to banquet until the sailors went home talking of riches. What could actually be produced was thirty talents.','Egestaeans|Egestaean','major','group'),
('selinuntines','The Selinuntines','Who had the Syracusans for allies and were pressing Egesta hard by land and sea, and whose contingent was the strongest of the Syracusan allies in the first battle.','Selinuntines','supporting','group'),
('siceliots','The Siceliots','Thucydides’s word for the Hellenes settled in Sicily, as against the Sicels and the other barbarians of the island. Hermocrates told them their quarrel was with an appetite, not with a nationality; Alcibiades told Athens they were mixed rabbles with no feeling of patriotism, who would come over one by one as they got a fair offer.','Siceliots','major','group'),
('geloans','The Geloans','Who founded Acragas, resettled Camarina for the third time, and sent two hundred horse to the Syracusan line in the first battle.','Geloans','supporting','group'),
]:add(*row)

# ========= BOOK 6, CHAPTER 19 — Syracuse will not believe it, and Athens hunts informers
for row in [
('athenagoras','Athenagoras','The leader of the people at Syracuse and very powerful with the masses, who answered Hermocrates by saying the reports were concocted by men who wanted the city frightened into their hands; that no shrewd people would start a second war before finishing the first; and that democracy means the whole state while oligarchy means a part. He was wrong about the expedition and, on his own account of the young men of Syracuse, not wrong about much else.','','major'),
('myrrhine','Myrrhine','Callias’s daughter, by whom Hippias had the five children named on the pillar on the Acropolis — which is part of how Thucydides knows that Hippias, not Hipparchus, was the elder and the tyrant.','Myrrhine','reference'),
('callias-father-of-myrrhine','Callias','Hyperechides’s son, and Myrrhine’s father. None of the other three men of the name.','','reference'),
('hyperechides','Hyperechides','Callias’s father.','Hyperechides','reference'),
('pisistratus-archon','Pisistratus','Hippias’s son, named for his grandfather, who held the yearly archonship and dedicated the altar of the twelve gods in the marketplace and the altar of Apollo in the Pythian precinct. The Athenians lengthened the first altar and rubbed out his inscription; the second one is still there in faded letters.','','reference'),
('archedice','Archedice','Hippias’s daughter, married off to a Lampsacene because the family had influence with Darius; her tomb at Lampsacus says that pride was never known to her, though she was daughter, wife and sister to the throne.','Archedice','reference'),
('aeantides','Aeantides','Son of the tyrant of Lampsacus, who married Archedice and gave the exiled Hippias his first refuge.','Aeantides','reference'),
# ------------------------------------------------------ peoples of Chapter 19
('artemis','Artemis','In whose precinct outside Rhegium the armament camped when the town would not let it inside the walls, and where a market was provided for it.','Artemis','reference','deity'),
('aphrodite','Aphrodite','To whose temple on Eryx the Egestaeans took the first Athenian envoys, to show them silver plate that gave an impression of wealth quite out of proportion to its value.','Aphrodite','reference','deity'),
('alcmaeonidae','The Alcmaeonidae','The banished family who with the Lacedaemonians put the tyranny down — not, Thucydides insists, Harmodius and the Athenians themselves, which is exactly what the commons had been told.','Alcmaeonidae','reference','group'),
('thetes','The Thetes','The lowest of the Athenian property classes; seven hundred of them were shipped as marines in the first Sicilian armament.','Thetes','reference','group'),
('italiots','The Italiots','The Hellenes of Italy, whose decision the Rhegians said they would wait for; the Syracusan envoys tried on their way to Corinth to convince them the expedition threatened Italy as much as Sicily.','Italiots','supporting','group'),
('cretans','The Cretans','Eighty of the four hundred and eighty archers with the first armament.','Cretans','reference','group'),
]:add(*row)

# ========== BOOK 6, CHAPTER 20 — the first battle, Alcibiades at Sparta, the walls
for row in [
('heraclides','Heraclides','Lysimachus’s son, one of the three generals with full powers elected on Hermocrates’s advice — and elected again, under the same name, when the generals of the investment were deposed and blamed.','Heraclides','supporting'),
('lysimachus-father-of-heraclides','Lysimachus','Heraclides the Syracusan’s father. Not Aristides’s father.','','reference'),
('sicanus','Sicanus','Execestes’s son, the third of the three Syracusan generals. He shares his name with the river in Iberia the Sicanians were driven from, which carries no card.','','supporting'),
('execestes','Execestes','Sicanus’s father.','Execestes','reference'),
('euphemus','Euphemus','The Athenian ambassador at Camarina, who answered Hermocrates by conceding everything and claiming it as a right: that fear holds the empire together, that no one can be quarrelled with for providing for his own safety, and that for an imperial city nothing is unreasonable if it is expedient and nobody is a kinsman unless he is sure.','Euphemus','major'),
('gylippus','Gylippus','Cleandridas’s son, named by Lacedaemon to command for the Syracusans on Alcibiades’s advice. Hearing on the way that Syracuse was already invested — which was false — he gave the island up for lost and crossed to Tarentum to save Italy instead, tried to claim at Thurii the citizenship his father had held, was blown out to sea off the Terinaean gulf, and put back to refit. Nicias heard he was coming, counted his four ships, and set the voyage down as piracy.','Gylippus','major'),
('cleandridas','Cleandridas','Gylippus’s father, whose citizenship at Thurii his son tried to claim.','Cleandridas','reference'),
('diomilus','Diomilus','An exile from Andros, given six hundred picked men to hold Epipolae. The Athenians landed at Leon and went up at a run by Euryelus while the Syracusans were still at a review three miles away; he came on in disorder and was killed with about three hundred of them.','Diomilus','supporting'),
('pythen','Pythen','The Corinthian who crossed with Gylippus to Tarentum.','Pythen','supporting'),
('eucles-syracuse','Eucles','One of the three generals elected at Syracuse when the generals of the investment were deposed. Not the Athenian who lost Amphipolis.','','reference'),
('tellias','Tellias','The third of them.','Tellias','reference'),
('phytodorus','Phytodorus','One of the three commanders of the thirty ships that landed in Laconia itself and so gave Lacedaemon her open pretext. Both editions spell him so, and neither gives him a patronymic or connects him with either Pythodorus.','Phytodorus','reference'),
('laespodius','Laespodius','The second of the three.','Laespodius','reference'),
('demaratus','Demaratus','The third.','Demaratus','reference'),
('hermae','The Hermae','The square stone figures of Hermes that stood in doorways all over Athens, and whose faces were nearly all mutilated in a single night while the expedition was fitting out. Nobody ever found out who did it. The city took it for an omen and for the beginning of a conspiracy against the democracy, offered rewards, invited informers of any status, and executed or outlawed on the word of a prisoner who bought his own impunity — after which, Thucydides says, it was still not clear whether the sufferers had been punished unjustly.','Hermae','major','deity'),
# ------------------------------------------------------ peoples of Chapter 20
('inessaeans','The Inessaeans','Whose corn the Athenians burnt on the way back to Catana.','Inessaeans','reference','group'),
('hybleans','The Hybleans','Whose corn was burnt with it; the Athenians had already failed to storm their town.','Hybleans','reference','group'),
('thurians','The Thurians','Who would not give Gylippus back his father’s citizenship, and who like Nicias thought four ships could only mean piracy.','Thurians','reference','group'),
('hellespontines','The Hellespontines','Named by Hermocrates with the Ionians and the islanders as peoples who change continually but always serve a master — against free Dorians dwelling in Sicily.','Hellespontines','reference','group'),
]:add(*row)

# ---------------------------------------------------------------- Book 6 snapshots
snap('nicias-niceratus',[20,44],'Niceratus’s son, chosen against his will to command an expedition he had argued twice against. He told the assembly they were leaving many enemies behind to go and fetch more, and that the treaty was nominal; then, hoping to frighten them off with the size of the bill, asked for a hundred galleys and five thousand heavy infantry — and was thanked for good advice and given everything. In Sicily he sailed round the island collecting thirty talents instead of the promised fortune, argued for a show of force and a voyage home, and took the army to Syracuse only after Alcibiades had been recalled. He was in the Circle, sick, when the Syracusans came for it, and saved it by burning the engines and timber in front of the wall. The death of Lamachus left him sole commander of the siege.')
snap('alcibiades',[20,33],'Clinias’s son, who talked Athens into Sicily and then talked Sparta into Decelea. He answered Nicias with his seven chariots at Olympia and the argument that a city not inactive by nature ruins itself fastest by suddenly becoming so — and that an empire cannot fix the point at which it stops. Recalled on the charge of profaning the Mysteries, he sailed as far as Thurii with the Salaminia and disappeared; sentenced to death in absence, he crossed to the Peloponnese and was invited to Lacedaemon. There he set out the whole plan of the expedition — Sicily, then Italy, then Carthage, then the Peloponnese — asked for a Spartan commander for Syracuse and a fort at Decelea, and told them that love of country is not what a man feels when he is wronged.')
snap('lamachus',[20,42],'Xenophanes’s son, the third general, who wanted to sail straight for Syracuse and fight under the walls while the panic was at its height, since every armament is most terrible at first. He was overruled, and supported Alcibiades. Going to the help of a broken Athenian tribe at the counterwall, he crossed a ditch with a few men, was cut off on the far side, and was killed with five or six of them; the Syracusans carried the bodies off and gave them back under truce.')
snap('hermocrates',[20,40],'Hermon’s son, who told an assembly that would not believe him that the Athenians were already on the voyage, and that the way to stop them was to meet them at Tarentum before they ever reached Sicily. After the first defeat he told the Syracusans that their spirit had not been beaten, only their discipline — fifteen generals and too many orders — and had them elect three with full powers and an oath to leave them alone; he was one. It was his idea to stop fighting pitched battles and build counterworks across the line the Athenian wall had to take.')
snap('syracusans',[20,44],'Who would not believe the expedition was coming, made fun of the men who said so, and were still arguing when the fleet reached Rhegium. Beaten in the first battle by troops they outnumbered, they were told by Hermocrates that courage was not their problem and elected three generals instead of fifteen. They built counterwork after counterwork across the Athenian lines, lost each of them, and were walled in by a double wall to the sea — at which point they began to discuss terms with Nicias, deposed their generals, and blamed them for the ill fortune.')
snap('hippias',[19,30],'The eldest of Pisistratus’s sons and the tyrant in fact, which Thucydides establishes against the common Athenian belief from the altar his son dedicated, from the pillar on the Acropolis that names five children of his and none of his brothers’, and from the ease with which he held power on the day Hipparchus was killed. After the murder the tyranny pressed harder: he killed many citizens and married his daughter to a Lampsacene with influence at the Persian court. Deposed in the fourth year by the Lacedaemonians and the Alcmaeonidae, he went to Sigeum, to Lampsacus, and to King Darius — and came back twenty years later, an old man, with the Medes to Marathon.')
snap('harmodius',[19,26],'In the flower of youthful beauty, and solicited twice by Hipparchus without success. Hipparchus took his revenge by inviting Harmodius’s young sister to carry a basket in a procession and then turning her away as unworthy. At the Panathenaea — the one day citizens in the procession could carry arms without suspicion — he and Aristogiton saw one of their accomplices talking easily with Hippias, took fright, and ran back inside the gates to kill the man who had wronged them rather than the tyrant. He was cut down on the spot. Thucydides tells the story at length to show that the Athenians are no more accurate than anyone else about their own history.')
snap('aristogiton',[19,26],'A citizen of the middle rank, Harmodius’s lover, and the man whose fear that the powerful Hipparchus would simply take Harmodius by force set the whole design going. He got away through the crowd at the moment and was taken later and dispatched in no merciful way.')
snap('athenians',[19,31],'Who fell in love with an expedition most of them could not have placed on a map. The older men thought a force that size could not come to grief, the young wanted to see foreign sights, and the crowd wanted the pay; the few who disliked it kept quiet rather than look unpatriotic. Then the Hermae were mutilated in one night, and the city that had just sent out the most splendid armament a single Hellenic state had ever launched spent the summer arresting its best citizens on the word of informers it never tested, executing some and outlawing others, and sleeping one night under arms in the temple of Theseus.')
snap('sicels',[20,44],'Who came over to the Athenians once there was something to come over to. Those in the lowlands and subject to Syracuse mostly held aloof; the peoples of the interior, who had never been anything but independent, joined almost at once and brought down corn and sometimes money — and more of them came when the double wall began to reach the sea.')
snap('camarinaeans',[20,26],'Who heard Hermocrates and Euphemus in the same assembly and answered both alike. They liked the Athenians and had always been at enmity with Syracuse; but Syracuse was next door and might win without them, so they had already sent a few horsemen that way and meant to go on helping as sparingly as possible — and told both embassies that their oaths made it most consistent to side with neither.')
snap('rhegians',[19,12],'Chalcidians and kinsmen of the Leontines, and the people Athens had most reason to count on. They would not take the armament inside their walls, gave it a market outside the city in the precinct of Artemis, and said they would side with neither party but wait and do whatever the rest of the Italiots did.')

print(len(entities),'entities after Book 6')
Path(__file__).parent.joinpath('editorial.json').write_text(json.dumps(dict(
 contentVersion='2026-09-12.6',
 coverage='Both full English editions. BOOKS 1-6 (chapters 1-20) are authored; chapters 21-26 are in progress. Named people and named peoples. Cities, rivers, mountains, seas and countries are not cast.',
 entities=[e for e in entities if e['name']!='unused']),ensure_ascii=False,indent=2)+'\n')
