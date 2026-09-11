"""Manually authored recognition cards for both full English texts of Paradise Lost.

The original is Milton's blank verse; the modern edition is prose. Both run to
12 books and 1,188 paragraphs and align paragraph for paragraph.

Milton's cast is angels and devils, and almost none of them is introduced. Book 1
alone names eighteen fallen angels by the pagan gods they later became, on the
argument that the gods of Canaan, Egypt and Greece were the devils of Hell under
other names — which is why Moloch is both a rebel angel and the idol of Rabba
in the same card.

Scope: named people, gods, angels, devils, personified powers, named monsters
and named peoples. Places, rivers, mountains and constellations are not cast.
"""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

# --------------------------------------------------------------- the principals
for row in [
('satan','Satan','The rebel archangel, once Lucifer, who leads a third of Heaven into war, is thrown into Hell, and crosses Chaos alone to ruin the new world. Milton gives him the poem’s best speeches and then shows what they cost.','Satan|Lucifer|Adversary|Apostate|Tempter|Fiend','central','angel'),
('god','God','The Father, who foresees the fall, declares that Man fell by his own free will, and accepts the Son’s offer to die for him.','God|Jehovah|Almighty|Omnipotent|Omniscient|Creator|Maker','central','deity'),
('son','The Son','The Son of God, who volunteers to become Man and die for him, drives the rebel angels out of Heaven in his chariot, makes the world in six days, and comes down to judge Adam and Eve and clothe them.','Messiah|Saviour|Savior|Redeemer|Vicegerent|Mediator|Intercessor|Restorer','central','deity'),
('adam','Adam','The first man, made in God’s image and given everything except one tree. He eats knowing exactly what he is doing, because he will not be left without Eve.','Adam','central'),
('eve','Eve','The first woman, made from Adam’s rib, who wants to work apart from him and meets the serpent alone. She eats first, and she is also the first of the two to ask for forgiveness.','Eve','central'),
]:add(*row)

# ------------------------------------------------------- the devils of Pandemonium
for row in [
('beelzebub','Beelzebub','Satan’s second, the first to answer him on the burning lake; he puts Satan’s own plan to the council as if it were his own.','Beelzebub','major','angel'),
('moloch','Moloch','The fiercest of the devils, who argues for open war — and, on earth, the horrid king smeared with the blood of children passed through fire in the valley of Hinnom.','Moloch','major','angel'),
('belial','Belial','The devil who counsels ignoble ease in words that sound like reason; on earth, the spirit of the sons of Belial who fill the streets with riot.','Belial','major','angel'),
('mammon','Mammon','The devil who proposes that Hell be mined and made comfortable; the least erected spirit that fell, who kept his eyes on the golden pavement even in Heaven.','Mammon','major','angel'),
('mulciber','Mulciber','The architect of Pandemonium, thrown out of Heaven and remembered by the Greeks as the smith-god who fell all day and landed on Lemnos.','Mulciber','supporting','angel'),
('azazel','Azazel','The tall cherub who unfurls Satan’s standard over the fallen host.','Azazel','supporting','angel'),
('nisroch','Nisroch','Chief of the Principalities, who stands up in the rebel assembly to complain that pain has unmanned them.','Nisroch','supporting','angel'),
('adramelech','Adramelech','A rebel angel beaten down in the war in Heaven.','Adramelech','reference','angel'),
('asmadai','Asmadai','A rebel angel overthrown beside Adramelech.','Asmadai','reference','angel'),
('ariel-rebel','Ariel','A rebel angel scorched and overthrown by Abdiel on the second day of battle.','Ariel','reference','angel'),
('arioch','Arioch','A rebel angel overthrown beside Ariel.','Arioch','reference','angel'),
('ramiel','Ramiel','A rebel angel whose violence Abdiel blasted.','Ramiel','reference','angel'),
('asmodeus','Asmodeus','The demon of the Book of Tobit, driven off by a fish’s smoke; Milton uses him for a spirit less pleased with Eden’s scents than Satan was.','Asmodeus','reference','angel'),
]:add(*row)

# ------------------------------------------------------------ the angels of Heaven
for row in [
('michael','Michael','The archangel who leads Heaven’s armies on the first day of the war and wounds Satan; afterwards he drives Adam and Eve out of Paradise and shows Adam the future first.','Michael','major','angel'),
('gabriel','Gabriel','Chief of the angelic guard at the gate of Paradise, who catches Satan squatting at Eve’s ear and faces him down.','Gabriel','major','angel'),
('raphael','Raphael','The affable archangel sent to warn Adam; he tells the whole story of the war in Heaven and the Creation over an afternoon meal, and answers Adam’s questions about astronomy and about love.','Raphael','major','angel'),
('uriel','Uriel','Regent of the sun and the sharpest-sighted spirit in Heaven, who is nevertheless deceived by Satan disguised as a young cherub — hypocrisy, Milton says, is the one evil that walks invisible.','Uriel','major','angel'),
('uzziel','Uzziel','Gabriel’s next in power, sent to sweep the south of the garden.','Uzziel','reference','angel'),
('ithuriel','Ithuriel','One of the two cherubs who find Satan at Eve’s ear and make him resume his own shape with a touch of the spear.','Ithuriel','supporting','angel'),
('zephon','Zephon','Ithuriel’s companion, who tells Satan to his face that he is no longer recognisable as an angel.','Zephon','supporting','angel'),
('zophiel','Zophiel','The swiftest-winged of the cherubim, who brings warning that the rebel host is coming on again.','Zophiel','reference','angel'),
('abdiel','Abdiel','The one seraph in Satan’s whole province who refuses him and walks out alone — faithful only he among the faithless — and who strikes the first blow of the war.','Abdiel','major','angel'),
]:add(*row)

# ---------------------------------------------------------- the powers of the abyss
for row in [
('sin','Sin','Satan’s daughter, who sprang fully formed from his head in Heaven, bore him Death, and keeps the key of Hell-gate. Woman to the waist and serpent below, she is both the personage and the thing itself.','','major','personification'),
('death','Death','Satan’s son by his own daughter, and her rapist; a shape that is not a shape, black as night and crowned. Milton never lets the reader separate the figure at the gate from the sentence passed on Adam.','Death','major','personification'),
('chaos','Chaos','The Anarch old, who rules the abyss between Hell and Heaven and cheers Satan on because every new world costs him territory. Milton uses the one word for the ruler and for the region he rules.','Chaos|Anarch','major','personification'),
('night','Night','Chaos’s sable-vested consort, eldest of things, whose standard Satan promises to raise again over the new world.','','supporting','personification'),
('demogorgon','Demogorgon','A dreaded name among the powers of the abyss, spoken and not explained.','Demogorgon','reference','personification'),
('orcus','Orcus','One of the powers standing by the throne of Chaos.','Orcus','reference','personification'),
('ades','Ades','One of the powers standing by the throne of Chaos; Hades under an older spelling.','Ades','reference','personification'),
('discord','Discord','Daughter of Sin, who brings death among the animals by setting them against each other.','Discord','supporting','personification'),
('rumour','Rumour','One of the courtiers of Chaos, named with Chance, Tumult and Confusion.','Rumour|Rumor','reference','personification'),
('tumult','Tumult','One of the courtiers of Chaos.','Tumult','reference','personification'),
('confusion','Confusion','One of the courtiers of Chaos, all of them embroiled together.','Confusion','reference','personification'),
]:add(*row)

# ------------------------------------- Book I: the fallen angels under their idols
# Milton's argument is that the gods of Canaan, Egypt and Greece were these same
# devils, worshipped later under other names. The cards say so.
for row in [
('chemos','Chemos','The obscene dread of Moab’s sons, worshipped from Aroar to Nebo; Peor was his other name, when he enticed Israel at Sittim.','Chemos|Peor','supporting','deity'),
('baalim','Baalim','The general name of the male gods worshipped between the Euphrates and the brook of Egypt — spirits who can take either sex, or both.','Baalim','reference','deity'),
('ashtaroth','Ashtaroth','The general name of the female gods of the same coast, for whose sake Israel often forsook its living strength.','Ashtaroth','reference','deity'),
('astoreth','Astoreth','Queen of heaven with the crescent horns, called Astarte by the Phoenicians, to whom Sidonian virgins paid their vows by moonlight — and for whom Solomon built a temple.','Astoreth|Astarte','supporting','deity'),
('thammuz','Thammuz','The god whose annual wound ran the river of Lebanon purple, and whose Syrian women wailed for him — the idolatry Ezekiel saw in the porch of the Temple.','Thammuz','supporting','deity'),
('dagon','Dagon','The sea-monster god of the Philistines, man above and fish below, whose own image fell headlong before the Ark in his own temple.','Dagon','supporting','deity'),
('rimmon','Rimmon','The god of Damascus, who lost a leper and won a king in the same day.','Rimmon','reference','deity'),
('osiris','Osiris','The chief of the Egyptian gods, worshipped in brutish forms — and remembered by Milton as the calf the Israelites made in Oreb.','Osiris','reference','deity'),
('isis','Isis','One of the Egyptian gods named with Osiris and Orus.','Isis','reference','deity'),
('orus','Orus','One of the Egyptian gods named with Osiris and Isis; Horus under an older spelling.','Orus','reference','deity'),
('belus','Belus','A Babylonian god, named with Serapis for the magnificence Egypt and Assyria built for their idols.','Belus','reference','deity'),
('serapis','Serapis','An Egyptian god, named with Belus in the same comparison.','Serapis','reference','deity'),
('titan','Titan','Heaven’s first-born, whose birthright his younger brother Saturn seized — the first of the three usurpations Milton uses to make the Greek gods a family of rebels.','Titan','reference','deity'),
('saturn','Saturn','The god who took the birthright from Titan and lost it in turn to his own son by Rhea; he fled over the Adriatic to Italy and the Celtic west.','Saturn','reference','deity'),
('jove','Jove','The youngest usurper, who drove out his father Saturn and reigned — a god by conquest, which is exactly Milton’s point. Called Jupiter and, in Libya, Ammon.','Jove|Jupiter|Ammon','supporting','deity'),
('rhea','Rhea','Saturn’s consort and Jove’s mother.','Rhea','reference','deity'),
('ops','Ops','Saturn’s consort under her Latin name, named in Eve’s catalogue of the gods who ruled Olympus before Jove.','Ops','reference','deity'),
('javan','Javan','The son of Japheth, from whose offspring the Ionian gods were held to descend.','Javan','reference','religious-figure'),
]:add(*row)

# -------------------------------------------- the classical gods of the similes
for row in [
('bacchus','Bacchus','The florid son whom Ammon hid with Amalthea from his stepdame’s eye; his revellers tore Orpheus apart, which is why Milton fears for his own voice.','Bacchus','reference','deity'),
('pan','Pan','The god of field and grove, whose dance with the Graces and the Hours led on the eternal Spring — a Paradise the real one still beats.','Pan','reference','deity'),
('sylvanus','Sylvanus','A woodland god named with Pan for the bowers that never matched Eve’s.','Sylvanus','reference','deity'),
('faunus','Faunus','A woodland spirit named with the nymphs who never haunted Eden’s inner bower.','Faunus','reference','deity'),
('proserpine','Proserpine','The girl gathering flowers in the field of Enna when gloomy Dis gathered her — herself a fairer flower, and the cost of her was all her mother’s pain.','Proserpine','supporting','mythological-figure'),
('ceres','Ceres','Proserpine’s mother, who sought her through the whole world; Milton uses that search for the price of Eden.','Ceres','reference','deity'),
('dis','Dis','The lord of the underworld who carried Proserpine off.','Dis','reference','deity'),
('juno','Juno','The wife on whom Jupiter smiles when he impregnates the clouds that shed May flowers.','Juno','reference','deity'),
('neptune','Neptune','The sea god whose grudge, with Juno’s, troubled the Greeks and Aeneas in the older epics Milton means to outdo.','Neptune','reference','deity'),
('aphrodite','Aphrodite','Aeneas’s mother, named once when Milton lists the quarrels of the classical epics.','Aphrodite|Cytherea','reference','deity'),
('hermes','Hermes','The messenger god, whose charmed pipe put the hundred eyes of Argus to sleep and who brought Pandora to Japhet’s unwiser son; Milton also uses his name for quicksilver.','Hermes','reference','deity'),
('maia','Maia','Hermes’s mother; Raphael descends in the likeness of her son.','Maia','reference','deity'),
('flora','Flora','The goddess of flowers, on whom Zephyrus breathes; Adam wakes Eve as gently.','Flora','reference','deity'),
('zephyrus','Zephyrus','The west wind, whose breath on Flora is Milton’s measure of a gentle voice.','Zephyrus|Zephyr','reference','deity'),
('pomona','Pomona','The goddess of orchards, whose arbour Eve’s bower resembles, and who fled from Vertumnus.','Pomona','reference','deity'),
('vertumnus','Vertumnus','The god who pursued Pomona through every shape he could take.','Vertumnus','reference','deity'),
('pales','Pales','The goddess of pastures, named with Pomona for what Eve most resembled.','Pales','reference','deity'),
('diana','Diana','The huntress goddess, whose train of nymphs Eve resembles at her gardening.','Diana|Delia','reference','deity'),
('bellona','Bellona','The goddess of war, whose engines storm cities — a small thing, Milton says, beside the artillery of the angels.','Bellona','reference','deity'),
('urania','Urania','The Heavenly Muse Milton calls on from the first line, and names only in Book 7 — insisting even then that he means the meaning and not the name. She conversed with eternal Wisdom before the hills were made, which is why she and not one of the nine can tell him what happened in Heaven.','Urania','supporting','deity'),
('muses','The Muses','The nine of Olympus, whose haunts Milton still wanders even though his own Muse is not one of them; the one who was Orpheus’s mother could not save him.','Muses','supporting','deity'),
('graces','The Graces','Attendants of beauty, knit with the Hours in Pan’s dance and waiting on Eve as on a queen.','Graces','reference','deity'),
('hours','The Hours','The circling Hours who wake the morning and unbar the gates of light.','Hours','reference','deity'),
('eurynome','Eurynome','With Ophion, the first ruler of Olympus in the older story, driven out by Saturn and Ops; Milton offers her as a rumour of Eve.','Eurynome','reference','deity'),
('ophion','Ophion','The serpent the Greeks say ruled Olympus first — Milton’s hint that they were remembering Satan.','Ophion','reference','deity'),
('hymen','Hymen','The god of marriage, whose torches were lit for the first weddings Adam sees in his vision of the future.','Hymen','reference','deity'),
('leucothea','Leucothea','The sea goddess of the dawn, who wakes and sheds her dew on the earth.','Leucothea','reference','deity'),
('themis','Themis','The goddess at whose shrine Deucalion and Pyrrha prayed to restore the human race after the flood.','Themis','reference','deity'),
]:add(*row)

# ---------------------------------------------------- monsters, and men of legend
for row in [
('argus','Argus','The herdsman covered with eyes, all of which Hermes charmed asleep; the cherubim of the gate have more, and stay awake.','Argus','reference','mythological-figure'),
('medusa','Medusa','The Gorgon set to guard the ford of Lethe, so that no damned soul can reach the water that would let it forget.','Medusa','supporting','mythical-being'),
('gorgons','Gorgons','Named with Hydras and Chimeras among the shapes that haunt the frozen continent of Hell — worse, Milton says, than fables ever invented.','Gorgons','reference','mythical-being'),
('hydras','Hydras','Named with Gorgons and Chimeras in the same catalogue.','Hydras','reference','mythical-being'),
('chimeras','Chimeras','Named last in the same catalogue: Gorgons, and Hydras, and Chimeras dire.','Chimeras','reference','mythical-being'),
('furies','The Furies','The harpy-footed powers who haul the damned from fire to ice and back; Death stands as fierce as ten of them.','Furies','reference','mythical-being'),
('scylla','Scylla','The monster of the strait between Calabria and Sicily, whose hell-hounds Milton says were less abhorred than Sin’s.','Scylla','reference','mythical-being'),
('charybdis','Charybdis','The whirlpool Ulysses steered away from, at the cost of the other side.','Charybdis','reference','mythical-being'),
('typhon','Typhon','One of the giants who warred on Jove, kept in a den near Tarsus; Milton uses him to size Satan.','Typhon','reference','mythical-being'),
('briareos','Briareos','The hundred-handed giant, named with Typhon in the same measurement.','Briareos','reference','mythical-being'),
('leviathan','Leviathan','The hugest of living creatures, which a night-bound pilot mistakes for an island and moors to — Milton’s last and best image for the size of Satan.','Leviathan','supporting','mythical-being'),
('behemoth','Behemoth','The biggest of earth-born creatures, heaving himself out of the ground on the sixth day.','Behemoth','reference','mythical-being'),
('python','Python','The huge serpent bred out of the mud after the flood, which Satan outgrows in the hall of Pandemonium.','Python','reference','mythical-being'),
('pegasus','Pegasus','The winged horse whose flight Milton claims to have passed, and off whose rider he begs not to fall.','Pegasus|Pegasean','reference','mythical-being'),
('bellerophon','Bellerophon','The rider thrown from the winged horse for aiming too high, who wandered the Aleian field alone — Milton’s warning to himself.','Bellerophon','reference','mythological-figure'),
('hercules','Hercules','Called Alcides; crowned with conquest, he felt the poisoned robe and threw the man who brought it into the sea.','Hercules|Alcides','reference','mythological-figure'),
('lichas','Lichas','The messenger Hercules hurled from the top of Oeta into the sea for bringing him the robe.','Lichas','reference','mythological-figure'),
('orpheus','Orpheus','The Thracian poet torn apart by Bacchus’s revellers while his Muse-mother could not defend him; Milton, blind and out of favour, asks not to end the same way.','Orpheus|Orphean','supporting','mythological-figure'),
('pandora','Pandora','The woman the gods adorned and sent to Japhet’s unwiser son, to the ruin of mankind — a story Milton lays beside Eve’s and does not soften.','Pandora','reference','mythological-figure'),
('japhet','Japhet','The father of the unwiser son who accepted Pandora.','Japhet','reference','mythological-figure'),
('deucalion','Deucalion','With Pyrrha, the survivor of the flood who prayed at the shrine of Themis to restore mankind; Adam and Eve praying together are the older pair.','Deucalion','reference','mythological-figure'),
('pyrrha','Pyrrha','Deucalion’s wife, named with him for the same prayer.','Pyrrha','reference','mythological-figure'),
('circe','Circe','The enchantress whose beasts came at her call; the animals of Eden came at Eve’s more readily.','Circe|Circean','reference','mythological-figure'),
('cadmus','Cadmus','Turned into a serpent in Illyria with Hermione — one of the shapes Milton says was less lovely than the one Satan chose.','Cadmus','reference','mythological-figure'),
('hermione','Hermione','Cadmus’s wife, transformed with him.','Hermione','reference','mythological-figure'),
('cham','Cham','Ham under his old name, whom the Gentiles called Ammon and the Libyans Jove.','Cham','reference','religious-figure'),
('amalthea','Amalthea','Hidden by Ammon from his wife’s eye, with her son Bacchus, on the Nyseian isle.','Amalthea','reference','mythological-figure'),
('achilles','Achilles','The hero whose wrath Milton names as the old epic subject his own exceeds.','Achilles','reference','literary-figure'),
('turnus','Turnus','The rival whose fury over Lavinia Milton names in the same breath as Achilles’s wrath.','Turnus','reference','literary-figure'),
('lavinia','Lavinia','The bride Turnus lost.','Lavinia','reference','literary-figure'),
('aeneas','Aeneas','Aphrodite’s son, whom Neptune and Juno hounded through the older epic.','Aeneas','reference','literary-figure'),
('alcinous','Alcinous','The king whose gardens hosted Odysseus, and which Milton says were fabled where Eden was real.','Alcinous','reference','literary-figure'),
('odysseus','Odysseus','The guest of Alcinous, and the sailor who shunned Charybdis; Milton names him under both his Greek and Latin names.','Odysseus|Ulysses','reference','literary-figure'),
('tantalus','Tantalus','The man from whose lips the water always fled — as the water of Lethe flees the damned.','Tantalus','reference','mythological-figure'),
('arthur','Arthur','Uther’s son, girt with British and Armoric knights; Milton names the romances he had once meant to write about and did not.','Arthur','reference','literary-figure'),
('uther','Uther','Arthur’s father, named for him.','Uther','reference','literary-figure'),
('charlemagne','Charlemagne','The emperor who fell with all his peerage at Fontarabbia — the last of the romance names Milton lays aside.','Charlemagne|Charlemain','reference'),
('thamyris','Thamyris','A blind poet of legend, named among the company Milton hopes to join.','Thamyris','reference','literary-figure'),
('maeonides','Maeonides','Homer under the name of his supposed birthplace, named among the blind.','Maeonides','reference','literary-figure'),
('tiresias','Tiresias','The blind prophet of Thebes, named with Phineus among the blind who saw.','Tiresias','reference','mythological-figure'),
('phineus','Phineus','A blind prophet of the Argonaut story, named last in Milton’s list of the blind.','Phineus','reference','mythological-figure'),
]:add(*row)

# ------------------------------------------------- scripture, named and remembered
for row in [
('amram','Amram','Moses’s father; the potent rod of Amram’s son is Milton’s figure for Satan’s spear calling up the fallen host like locusts.','Amram','reference','religious-figure'),
('moses','Moses','The shepherd on Oreb who first taught the chosen how the heavens and earth rose out of Chaos, and one of the two brothers sent to bring Israel out of Egypt.','Moses','supporting','religious-figure'),
('aaron','Aaron','Moses’s brother, sent with him to Pharaoh; the twelve stones of his breastplate are Milton’s measure for the light of Heaven.','Aaron','reference','religious-figure'),
('pharaoh','Pharaoh','The impious king over whose realm the locusts hung like night, and whose army the sea swallowed.','Pharaoh','reference','religious-figure'),
('busiris','Busiris','The Egyptian king whom the Red Sea overthrew with his chivalry while he pursued the sojourners of Goshen.','Busiris','reference','religious-figure'),
('solomon','Solomon','The wisest heart in Israel, led by fraud to build a temple to Astoreth on the hill of scandal; later, the king who enshrined the Ark.','Solomon','supporting','religious-figure'),
('josiah','Josiah','The good king who drove the idols from their shrines and threw them into hell.','Josiah','reference','religious-figure'),
('eli','Eli','The priest whose sons turned atheist and filled the house of God with violence.','Eli','reference','religious-figure'),
('ezekiel','Ezekiel','The prophet who was led by vision to see the dark idolatries of alienated Judah in the sacred porch.','Ezekiel','reference','religious-figure'),
('samson','Samson','The champion who rose from the treacherous lap of Delilah shorn of his strength — Milton’s image for Adam and Eve waking after the fall.','Samson','supporting','religious-figure'),
('delilah','Delilah','The Philistine woman in whose lap Samson lost his hair and his strength.','Delilah|Dalilah','reference','religious-figure'),
('tobit','Tobit','The blind man of the apocryphal book whose son Raphael travelled with.','Tobit','reference','religious-figure'),
('tobias','Tobias','Tobit’s son, whose marriage Raphael secured against the demon Asmodeus.','Tobias','reference','religious-figure'),
('abraham','Abraham','The patriarch who leaves Ur and his gods on nothing but a call, and in whose seed all nations are to be blessed — the first of the figures Michael shows Adam.','Abraham','supporting','religious-figure'),
('isaac','Isaac','Abraham’s son, named in the line that runs down to Joshua.','Isaac','reference','religious-figure'),
('jacob','Jacob','The grandson who saw the ladder of angels at Luz while fleeing from Esau, and whom the angels met again at Mahanaim.','Jacob','supporting','religious-figure'),
('esau','Esau','The brother Jacob was fleeing when he dreamed of the ladder.','Esau','reference','religious-figure'),
('joshua','Joshua','The commander who leads Israel into Canaan and at whose word the sun stands still over Gibeon; Michael points out that his name is the name of Jesus.','Joshua','supporting','religious-figure'),
('david','David','The shepherd king of the royal house from which the Messiah is promised to come.','David','supporting','religious-figure'),
('noah','Noah','The one just man, who builds the ark and rides out the flood; Michael shows Adam the whole of it.','Noah','supporting','religious-figure'),
('mary','Mary','The second Eve, hailed with the same word the angel used to the first; the Virgin Mother of the promised seed.','Mary','supporting','religious-figure'),
('peter','Peter','The keeper of the keys at Heaven’s wicket, seen in vision above the Paradise of Fools.','Peter','reference','religious-figure'),
('john','John','The evangelist who saw the angel standing in the sun.','John','reference','religious-figure'),
('dominic','Dominic','The founder whose habit the dying put on to be sure of Paradise — a fraud, Milton says, that blows into the Limbo of Vanity with the Franciscan robes.','Dominick|Dominic','reference','religious-figure'),
]:add(*row)

# ------------------------------------------------------ the nations and the peoples
for row in [
('israel','Israel','The chosen race, who forsook their living strength for Baalim and Ashtaroth and fell before despicable enemies.','Israel|Israelites','supporting','group'),
('ammonites','The Ammonites','Moloch’s worshippers in Rabba and the watery plain.','Ammonites|Ammonite','reference','group'),
('phoenicians','The Phoenicians','Who called Astoreth by the name Astarte.','Phoenicians','reference','group'),
('canaanites','The Canaanites','The nation Israel skirts on the march out of Egypt, to avoid a war that might frighten them back into slavery.','Canaanites|Canaanite','reference','group'),
('chaldeans','The Chaldeans','The people of Ur, whose gods Abraham left behind.','Chaldeans','reference','group'),
('philistines','The Philistines','Dagon’s people, in Gath and Ascalon and Accaron and Gaza.','Philistine|Philistines|Philistean','reference','group'),
('gentiles','The Gentiles','Milton’s word for the nations who kept the fallen angels’ names alive as gods.','Gentiles','reference','group'),
('greeks','The Greeks','Who honoured Mulciber as their smith-god, and whom Neptune and Juno hounded in the older epic.','Greeks|Grecian','reference','group'),
('apostles','The Apostles','On whom the Spirit was first poured, and who confounded their proudest persecutors.','Apostles','reference','group'),
('americans','The Americans','Whom Columbus found girt with feathers — Milton’s comparison for Adam and Eve in their first clothing.','Americans|American','reference','group'),
('named-winds','The named winds','Milton gives the winds their old names and lets them loose on the world after the fall: Boreas, Caecias, Argestes and Thrascias out of the north, Notus and Afer from the south, Eurus and Zephyr from east and west, with Sirocco and Libecchio. Before the fall, no wind blew hard.','Boreas|Caecias|Argestes|Thrascias|Notus|Afer|Eurus|Sirocco|Libecchio','supporting','personification'),
]:add(*row)

# -------------------------------------------------- the moderns, for comparison only
for row in [
('galileo','Galileo','The Tuscan artist with the optic glass, viewing the moon from Fesole — the only living person Milton names in the whole poem, and he names him twice.','Galileo','supporting'),
('empedocles','Empedocles','Who leapt into Etna’s flames to be thought a god, and blows about the Limbo of Vanity for it.','Empedocles','reference'),
('cleombrotus','Cleombrotus','Who leapt into the sea to reach the afterlife Plato had described, and ended in the same Limbo.','Cleombrotus','reference'),
('plato','Plato','Whose Elysium Cleombrotus drowned himself to reach.','Plato','reference'),
('xerxes','Xerxes','Who bridged the Hellespont to yoke the freedom of Greece and whipped the sea for breaking it — Milton’s comparison for Sin and Death bridging Chaos.','Xerxes','reference'),
('scipio','Scipio','Rome at its height, born of a woman a god was said to have visited.','Scipio','reference'),
('olympias','Olympias','Alexander’s mother, visited in the same way; both stories are serpents, which is the point.','Olympias','reference'),
('columbus','Columbus','Who found the Americans naked and feathered.','Columbus','reference'),
('montezuma','Montezuma','Whose seat at Mexico is one of the kingdoms Michael shows Adam from the hill.','Montezuma|Montezume','reference'),
('atahualpa','Atahualpa','Whose richer seat at Cusco is named beside Montezuma’s.','Atahualpa|Atabalipa','reference'),
('tamerlane','Tamerlane','Whose throne at Samarkand is another of the empires in Adam’s view.','Tamerlane|Temir','reference'),
]:add(*row)

print(len(entities),'entities')
Path(__file__).parent.joinpath('editorial.json').write_text(json.dumps(dict(
 contentVersion='2026-09-11.1',
 coverage='Both full English editions, all 12 books and 1,188 paragraphs. Named people, gods, angels, devils, personified powers, named monsters and named peoples. Places, rivers, mountains and constellations are not cast.',
 entities=entities),ensure_ascii=False,indent=2)+'\n')
