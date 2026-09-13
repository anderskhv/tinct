"""Reviewed bindings for Montaigne's Essays.

Cotton in both editions, 107 chapters covering the three books, 4,897 paragraphs
per edition. Chapters 1-69 are authored.

Two things make this book hard, and it has both of them at once. The first is
spelling: the modern edition modernises the transliterations, so one man is
Wicliffe and Wycliffe, Zisca and Zizka, Trivulcio and Trivulzio, Fabricio and
Fabrizio, Juliano and Giuliano, Fregosa and Fregoso, Sylla and Sulla. Both
spellings sit on one card. The second is namesakes, and an essayist who cites
for eleven hundred pages has a great many: two Plinys, two Diodoruses, two kings
called Darius, two dukes called Alva, two men called Trivulzio, three called du
Bellay, a Zeno who is a citizen of Messina and not the Stoic, a Perseus who is a
king of Macedon and not the Gorgon-slayer, and an Edward who is the Black Prince
in one chapter and Edward I in another.

A name that belongs to a person a later chapter will introduce is left unbound
rather than defaulted to the man of chapters 1-10. That is why the tables below
have no defaults.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'essays-montaigne'

# pattern -> ({(chapter, paragraph): id or [ids by occurrence] or None}, default or None)
SPLIT={
 # Edward III's son at 1:1; Edward I at 3:11. Three more Edwards wait in
 # chapters 41, 78 and 80.
 'Edward':({(1,1):'edward-black-prince',(3,11):'edward-i',(41,7):'edward-iii'},None),
 # The tyrant of Syracuse, named twice; the later Dionysiuses are not yet read.
 'Dionysius':({(1,4):'dionysius-elder',(2,21):'dionysius-elder',(16,3):'dionysius-elder',
               (23,19):'dionysius-elder',(40,75):'dionysius-the-younger',
               (48,34):'dionysius-elder'},None),
 # Pompey the Great here; thirty-six later occurrences unread. 40:13 is keyed
 # for the modern edition alone, which modernises the older text's "Pompeius".
 'Pompey':({(1,5):'pompey',(17,6):'pompey',(18,3):'pompey',(18,12):'pompey',
            (23,1):'pompey',(25,25):'pompey-the-dancer',(36,22):'pompey',
            (37,3):'pompey',(40,13):'pompey',(44,0):'pompey',
            (46,12):[None,'pompey'],(47,7):'pompey',(47,17):'pompey',
            (48,5):'pompey',(51,1):'pompey',(65,39):'pompey',
            (69,126):'pompey'},None),
 # The citizen of Messina, not the founder of the Stoa.
 'Zeno':({(1,5):'zeno-mamertine',(22,49):'zeno-of-citium',(24,55):'zeno-of-citium',
          (25,143):'zeno-of-citium',(30,28):'zeno-of-citium',
          (52,2):'zeno-of-citium',(69,327):'zeno-of-elea',
          (69,238):'zeno-of-citium',(69,246):'zeno-of-citium',(69,268):'zeno-of-citium',(69,370):'zeno-of-citium',(69,401):'zeno-of-citium',(69,414):'zeno-of-citium',(69,465):'zeno-of-citium',(69,613):'zeno-of-citium'},None),
 # Alexander the Great in both authored places.
 'Alexander':({(1,6):'alexander',(6,8):'alexander',(18,3):'alexander',
               (19,21):'alexander',(23,7):'alexander',
               (25,81):'alexander',(25,91):'alexander',(35,11):'alexander',
               (39,7):'alexander',(40,55):'alexander',(42,33):'alexander',
               (44,0):'alexander',(47,16):'alexander',(48,5):'alexander',
               (48,55):'alexander',(50,2):'alexander',(50,7):'alexander',
               (54,1):'alexander',(55,0):'alexander',(58,28):'alexander',
               (60,53):'alexander',(62,21):'alexander',(65,40):'alexander',
               (66,6):'alexander',(68,55):'alexander',(69,78):'alexander',
               (69,139):'alexander',(69,300):'alexander',
               (69,532):'alexander'},None),
 # Conrad III at 1:3; Conrad Marquis of Monteferrat at 86:19.
 'Conrad':({(1,3):'conrad-iii'},None),
 # The Ferdinand of the Buda campaign at 2:9; King Ferdinand of the Indies at
 # 107:9 is another man.
 'Ferdinand':({(2,9):'ferdinand'},None),
 # King John of Hungary at 2:9. Bare "John" elsewhere belongs to John Zisca and
 # to men not yet read, so only the king's own paragraph is keyed.
 'John':({(2,9):'john-of-hungary',(3,11):'john-zisca',(26,18):'john-of-castile',
          (40,8):'john-of-portugal'},None),
 # The dialectician at 2:21; Diodorus Siculus at 69:532 and 74:18.
 'Diodorus':({(2,21):'diodorus-dialectician',(69,532):'diodorus-siculus'},None),
 # Robert Bruce at 3:11; the King Robert of 33:7 is not identified with him.
 'Robert':({(3,11):'robert-bruce'},None),
 # Philip of Spain at 3:13; Don Philip at 7:0. Philip of Macedon and Alexander's
 # physician Philip wait in later chapters.
 'Philip':({(3,13):'philip-ii-spain',(7,0):'don-philip',(23,7):'philip-physician',
            (26,18):'philip-augustus',(30,0):'philip-v-macedon',
            (39,1):'philip-ii-macedon',(39,7):'philip-ii-macedon',
            (59,21):'philip-ii-macedon',(60,3):'philip-ii-macedon',
            (60,55):'philip-v-macedon'},None),
 # Cyrus the Great in both authored places; Cyrus the Younger is not yet read.
 'Cyrus':({(3,13):'cyrus-the-great',(4,9):'cyrus-the-great',(18,3):'cyrus-the-great',
           (24,57):'cyrus-the-great',(24,59):'cyrus-the-great',
           (27,29):'cyrus-the-great',(38,42):'cyrus-the-great',
           (39,1):'cyrus-the-great',(40,83):'cyrus-the-great',
           (42,50):'cyrus-the-great',(47,17):'cyrus-the-younger',
           (48,7):'cyrus-the-great',(48,44):'cyrus-the-great',
           (59,28):'cyrus-the-younger',(60,50):'cyrus-the-great',
           (69,535):'cyrus-the-great'},None),
 # Socrates's friend at 3:15; the Crito of 69:208 is somebody's brother in
 # another story.
 'Crito':({(3,15):'crito',(69,208):'crito-brother'},None),
 # The King of Macedon, not the son of Danae.
 'Perseus':({(5,0):'perseus-macedon',(69,268):'persaeus'},None),
 # The King of Epirus; the Pyrrhus of the transmigration list at 69:473 is not
 # him.
 'Pyrrhus':({(5,0):'pyrrhus-epirus',(30,0):'pyrrhus-epirus',(37,0):'pyrrhus-epirus',
             (42,67):'pyrrhus-epirus',(47,16):'pyrrhus-epirus',
             (69,85):'pyrrhus-epirus',(69,131):'pyrrhus-epirus',
             (69,473):'pyrrhus-transmigration'},None),
 # Martin the memoirist at 5:9; Cardinal Jean at 10:3; the poet Joachim in
 # chapters 24, 25 and 74.
 r'[Dd]u Bellay':({(67,31):'martin-du-bellay',(5,9):'martin-du-bellay',(10,3):'jean-du-bellay',
                   (14,1):'martin-du-bellay',(24,0):'joachim-du-bellay',
                   (24,2):'joachim-du-bellay',(25,123):'joachim-du-bellay',
                   (35,6):'martin-du-bellay'},None),
 # Antigonus the besieger of Eumenes; the Antigonus of 37:0, who was displeased
 # at being brought Pyrrhus's head, is another.
 'Antigonus':({(5,10):'antigonus-i',(37,0):'antigonus-gonatas',
               (69,126):'antigonus-i'},None),
 # Henry de Vaux at 5:11, spelled Henri in the modern edition; Henry VII at 7:0.
 # Then two kings called Henry II within seven paragraphs of each other, one of
 # France and one of England, and the English one's son: 46:2 names the son and
 # then the father in that order, so that paragraph is keyed by occurrence.
 r'Henr[yi]':({(5,11):'henry-de-vaux',(7,0):'henry-vii',(43,0):'henry-ii-france',
               (46,2):['henry-duke-of-normandy','henry-ii-england'],
               (46,3):'henry-ii-france',(48,56):'henry-ii-france'},None),
 # The Spartan who broke the truce with Argos. Later chapters have at least one
 # other Cleomenes.
 'Cleomenes':({(6,2):'cleomenes-i',(25,117):'cleomenes-sparta',
               (60,35):'cleomenes-therykion',(69,506):'cleomenes-i'},None),
 # Darius III at 6:8; Darius I at 9:2.
 'Darius':({(6,8):'darius-iii',(9,2):'darius-i',(12,2):'darius-i',
            (22,21):'darius-i',(23,7):'darius-iii',(44,0):'darius-iii',
            (69,483):'darius-i'},None),
 # Charles V, named to place his father; the later Charleses are unread.
 'Charles':({(7,0):'charles-v',(11,14):'charles-v',(12,3):'charles-v',(16,8):'charles-v',
             (20,22):'charles-iv',(30,43):'charles-ix',(41,7):'charles-v',
             (47,18):'charles-v',(55,14):'charles-v',(65,17):'charles-v',
             (65,18):'charles-v',(67,31):'charles-v'},None),
 # The Duke of Alva of the Brussels executions; "the last Duke of Alva" at
 # 74:157 is a later head of the house.
 'Alva':({(7,0):'duke-of-alva'},None),
 # Pliny the Elder; the younger Pliny holds 38:45, 38:60 and 39:0, and the
 # modern edition names him once more at 38:50 where the older text says only
 # "this advice".
 'Pliny':({(9,6):'pliny-elder',(20,4):'pliny-elder',(22,2):'pliny-elder',
           (26,18):'pliny-elder',(38,45):'pliny-the-younger',
           (38,50):'pliny-the-younger',(38,60):'pliny-the-younger',
           (39,0):'pliny-the-younger',(44,1):'pliny-elder',
           (48,6):'pliny-elder',(60,0):'pliny-elder',
           (60,43):'pliny-elder',(60,44):'pliny-elder',
           (60,60):'pliny-elder',(69,47):'pliny-elder',(69,153):'pliny-elder',
           (69,326):'pliny-elder',(69,388):'pliny-elder',
           (69,532):'pliny-elder',(69,638):'pliny-elder'},None),
 # Francis I in all three authored places.
 'Francis':({(9,8):'francis-i',(9,9):'francis-i',(10,3):'francis-i',(11,14):'francis-i',
             (13,1):'francis-i',(24,49):'francis-brittany',(47,18):'francis-i',
             (67,31):'francis-i',(69,0):'francis-i'},None),
 # Francesco Sforza at 9:8; Ludovico Sforza at 18:3 is another Duke of Milan.
 'Sforza':({(9,8):'francesco-sforza',(18,3):'ludovico-sforza'},None),
 # The bare "Messire Francesco" of 9:8 is Taverna, not his master.
 'Messire Francesco':({(9,8):'francesco-taverna'},None),
 # Severus Cassius; the later Cassiuses are unread.
 'Cassius':({(10,4):'severus-cassius',(59,16):'cassius-conspirator',
             (59,17):'cassius-conspirator',(60,38):'cassius-conspirator',
             (65,39):[None,'cassius-conspirator']},None),
 # Duke Guelph of Bavaria at 1:3. At 106:51 Guelph is the faction against the
 # Ghibellines, not a man, and the alias had been binding it to the duke.
 'Guelph':({(1,3):'guelph'},None),
 # The Count of Nassau who besieged Mousson. The Count of Nassau who entered
 # Guise at 15:5 is not said to be the same man.
 'Nassau':({(5,9):'nassau',(15,5):'nassau-guise'},None),
 # ------------------------------------------------- added with chapters 11-20
 # The Marquis of Saluzzo at 11:14; "Messire Francesco" at 9:8 is Taverna. Both
 # are keyed, so no bare Francesco is bound by accident.
 'Francesco':({(11,14):'francesco-saluzzo'},None),
 # Julius Caesar's Commentaries at 16:3 and his two sayings at 19:67 and 19:71.
 # "Augustus Caesar" at 4:10 is bound by the longer alias, not by this table.
 'Caesar':({(16,3):'julius-caesar',(19,67):'julius-caesar',(19,71):'julius-caesar',
            (22,54):'julius-caesar',(23,13):'julius-caesar',(23,18):'julius-caesar',
            (23,1):'augustus',(25,47):'julius-caesar',(30,28):'julius-caesar',
            (26,18):'julius-caesar',(35,3):'julius-caesar',(36,12):'julius-caesar',
            (36,18):'julius-caesar',(36,22):'julius-caesar',(36,25):'julius-caesar',
            (37,3):'julius-caesar',(39,0):'julius-caesar',
            (40,45):'julius-caesar',(40,55):'julius-caesar',
            (40,62):'julius-caesar',(42,57):'julius-caesar',
            (44,0):'julius-caesar',(47,7):'julius-caesar',
            (47,14):'julius-caesar',(47,16):'julius-caesar',
            (47,17):'julius-caesar',(48,5):'julius-caesar',
            (48,8):'julius-caesar',(48,11):'julius-caesar',
            (48,36):'julius-caesar',(49,5):'julius-caesar',
            (49,36):'julius-caesar',(50,1):'julius-caesar',
            (50,8):'julius-caesar',(51,1):'julius-caesar',
            (53,6):'julius-caesar',(59,16):'julius-caesar',
            (61,3):'julius-caesar',(65,39):'julius-caesar',
            (68,37):'julius-caesar',(65,32):'julius-caesar',(69,287):'julius-caesar',
            (65,40):'julius-caesar',(67,19):'julius-caesar',
            (67,26):'julius-caesar',(67,28):'julius-caesar'},None),
 # Pompey's father-in-law at 18:12. Every other Scipio in the Essays belongs to
 # a chapter not yet authored, and the name runs through a whole family.
 'Scipio':({(18,12):'metellus-scipio',(22,49):'publius-scipio-pontifex',
            (23,10):'scipio-africanus',(25,51):'scipio-africanus',
            (39,0):'scipio-aemilianus',(47,19):'scipio-africanus',
            (57,7):'scipio-africanus',(62,18):'scipio-africanus',
            (66,7):'scipio-aemilianus',(66,14):'scipio-aemilianus'},None),
 # P. Crassus the consul in Asia — "Publius Crassus" in the modern edition. The
 # triumvir and his son are not yet read, so only 16:9 is keyed.
 'Crassus':({(16,9):'publius-crassus',(16,10):'publius-crassus',
             (69,87):'crassus-orator',(69,126):'crassus-triumvir'},None),
 # Antiochus inflamed by Stratonice. The Essays name several Antiochuses.
 'Antiochus':({(20,4):'antiochus',(47,14):'antiochus-iii',(59,51):'antiochus-iv'},None),
 # Monsieur de Bourbon, who took Rome. The house supplies more men later.
 'Bourbon':({(17,2):'bourbon'},None),
 # Diogenes the Atheist in the temple at Samothrace. Diogenes the Cynic fills
 # chapters 27, 50 and 60, and Diogenes Laertius is cited at 68:61.
 'Diogenes':({(11,31):'diogenes-the-atheist',(25,103):'diogenes-the-cynic',
              (27,28):'diogenes-the-cynic',(50,7):'diogenes-the-cynic',
              (60,6):'diogenes-the-cynic',(69,15):'diogenes-the-cynic',
              (69,74):'diogenes-the-cynic',(69,565):'diogenes-the-cynic',
              (69,579):'diogenes-the-cynic',(69,388):'diogenes-apolloniates'},None),
 # Xenophanes of Colophon, the one philosopher Cicero says tried to root out
 # divination. The later Xenophanes passages have not been read.
 'Xenophanes':({(11,32):'xenophanes-colophon',(69,235):'xenophanes-colophon',
                (69,249):'xenophanes-colophon',(69,268):'xenophanes-colophon',
                (69,346):'xenophanes-colophon'},None),
 # Guido di Gonzaga's son at 19:24; Ludovico Sforza at 18:3 is bound by his own
 # longer alias, so only the Gonzaga paragraph is keyed here.
 'Ludovico':({(19,24):'ludovico-gonzaga'},None),
 # ------------------------------------------------- added with chapters 21-24
 # Cato of Utica: the prose of his own chapter, the nominative "Cato" in
 # Martial's Latin at 36:17, and each of the five bracketed English versions of
 # the five poets' verses (36:18, 21, 24, 27, 30). The Latin accusatives and
 # genitives that carry him through 36:20-29 -- Catonem, Catoni, Catonis -- are
 # left unbound like every other inflection in this book. The "M. Cato" of
 # 40:52 and the "Cato the consul" who disarmed the Spanish cities at 40:55 are
 # the Censor.
 'Cato':({(22,54):'cato-the-younger',(25,117):'cato-the-younger',
          (36,12):'cato-the-younger',(36,13):'cato-the-younger',
          (36,17):'cato-the-younger',(36,18):'cato-the-younger',
          (36,21):'cato-the-younger',(36,24):'cato-the-younger',
          (36,27):'cato-the-younger',(36,30):'cato-the-younger',
          (38,66):'cato-the-younger',
          (40,52):'cato-the-censor',(40,55):'cato-the-censor',
          (44,0):'cato-the-younger',(49,15):'cato-the-younger',
          (50,2):'cato-the-younger',(52,1):'cato-the-censor',
          (57,0):'cato-the-younger',(58,15):'cato-the-younger',
          (59,25):'cato-the-censor',(59,27):'cato-the-censor',
          (60,11):'cato-the-younger',(62,18):'cato-the-censor',
          (65,28):'cato-the-censor',(69,22):'cato-the-younger',
          (69,452):'cato-the-younger',(68,8):'cato-the-younger',
          (68,14):'cato-the-younger',(68,16):'cato-the-younger',
          (68,17):'cato-the-younger'},None),
 # The conspirator in Livia's list. The two Lepiduses already cast are bound by
 # their full names, so the bare surname is free for this one.
 'Lepidus':({(23,1):'lepidus-conspirator'},None),
 # The sophist Socrates rallies. Hippias returns at 103:143, unread.
 'Hippias':({(24,62):'hippias-sophist'},None),
 # -------------------------------------------------- added with chapter 25
 # Augustus's wife at 23:1; Signora Livia, whose petticoats a young traveller
 # should not come home able to describe, at 25:26.
 'Livia':({(23,1):'livia',(25,26):'signora-livia',(30,39):'livia'},None),
 # Aristo the tragedian at 25:152. The Latin dative "Aristoni" in the quotation
 # at 25:151 is left unbound, like every other name inside the Latin.
 'Aristo':({(25,152):'aristo-tragedian',(27,13):'ariosto',
            (69,268):'aristo-of-chios',(69,345):'ariston-plato-father',
            (69,558):'aristo-of-chios'},None),
 # ---------------------------------------------- added with chapters 26-30
 # Antony who lost a battle in Germany under Domitian, not Mark Antony.
 'Antony':({(26,18):'antony-germany',(69,89):'mark-antony'},None),
 # King Deiotarus's wife at 30:39; the Stratonice whose beauty gave Antiochus
 # his fever at 20:4.
 'Stratonice':({(20,4):'stratonice',(30,39):'stratonice-deiotarus'},None),
 # ---------------------------------------------- added with chapters 31-40
 # Arius's fellow heresiarch at 31:4. At 2:21 the same two words open "Pope Leo
 # X.", so that position is deliberately unkeyed and the shorter alias binds
 # there instead.
 'Pope Leo':({(31,4):'pope-leo-arian'},None),
 # The Spartan commander at Plataea, whose mother threw the first stone towards
 # his death in the chapter on moderation.
 'Pausanias':({(29,5):'pausanias-sparta',(36,10):'pausanias-plataea',
               (59,21):'pausanias-assassin'},None),
 # Mucius Scaevola in the enemy camp at 40:45; P. Scaevola the high priest in
 # Cotta's list at 22:49.
 'Scaevola':({(22,49):'scaevola',(40,45):'mucius-scaevola',(69,370):'scaevola'},None),
 # The older edition prints the high priest's name with the ligature at 69:370.
 r'Sc\u00e6vola':({(69,370):'scaevola'},None),
 # The Brutus who besieged the Xanthians. The Essays have more than one.
 'Brutus':({(40,6):'brutus-xanthus',(50,8):'marcus-brutus',
            (59,47):'brutus-consul',(60,38):'marcus-brutus',
            (65,39):'marcus-brutus',(67,20):'marcus-brutus',
            (67,21):'marcus-brutus'},None),
 # Cotton prints Pompey's name Pompeius in the Posidonius story.
 'Pompeius':({(40,13):'pompey'},None),
 # Two Constantines in one sentence at 33:7, the founder of the empire and the
 # man who lost it, so that paragraph is keyed by occurrence.
 'Constantine':({(33,7):['constantine-founder','constantine-last']},None),
 # King Robert of the falling walls, whom the Essays do not identify with Robert
 # of Scotland.
 'King Robert':({(33,7):'king-robert'},None),
 # The Paulli of Augustus's list at 23:1 -- the older edition prints the house in
 # the singular, "Paulus" -- and the L. Paulus who buried both his sons at 40:52,
 # who is the Paulus Aemilius of 19:37 under his shorter name. The family alias
 # had been binding that man to the house. Chapters 51, 69 and 73 name a Paulus
 # who has not been read, so the table defaults to nothing.
 'Paulus':({(23,1):'paulli',(40,52):'paulus-aemilius'},None),
 # ---------------------------------------------- added with chapters 41-50
 # Two Metelluses: the tribune who would have called Pompey into the city, and
 # the besieger of Crete. Metellus Scipio at 18:12 is bound by his longer name,
 # and chapters 51, 68 and 103 name a Metellus who has not been read.
 'Metellus':({(44,0):'metellus-tribune',(48,47):'metellus-crete',
              (68,7):'metellus-numidicus'},None),
 # The young Marius who slept through his own rout at 44:1, and his father in the
 # social war at 47:8. Six later occurrences are unread.
 'Marius':({(44,1):'marius-younger',(47,8):'marius-elder',
            (58,0):'marius-younger',(66,13):'marius-elder'},None),
 # Two kings called Alfonso, whom the Essays do not identify with each other: the
 # one who preferred the condition of asses, and the founder of the Order of the
 # Band. Neither passage says anything that would join them.
 'Alfonso':({(42,57):'alfonso-of-the-asses',(48,43):'alfonso-of-the-band'},None),
 # Xenophon's Hiero, in the three paragraphs of chapter 42 that quote him. Three
 # later occurrences are unread, and Syracuse had two kings of the name.
 'Hiero':({(42,50):'hiero',(42,57):'hiero',(42,60):'hiero'},None),
 # The Duc de Guise of Dreux. 15:5's Guise is the town the Count of Nassau
 # entered, and 74:157 and 104:60 name a Duc de Guise who has not been read --
 # the house supplied more than one.
 'Guise':({(45,0):'duc-de-guise',(45,1):'duc-de-guise'},None),
 # Scipio Africanus under his cognomen, in the epitaph Cicero quotes. Scipio
 # Aemilianus carried the same cognomen, and 91:0 and 104:111 are unread.
 'Africanus':({(46,18):'scipio-africanus'},None),
 # One of the Spartans who fought obscurely armed. Four later occurrences are
 # unread and Sparta had more than one king of the name.
 'Agis':({(47,16):'agis',(60,3):'agis-on-freedom',(69,47):'agis-king-of-sparta'},None),
 # Philip de Commines, in the editor's bracketed note on the battle of Fornova,
 # which names him twice. Four later occurrences are unread.
 'Commines':({(48,4):'commines'},None),
 # Charles VIII's horse. At 25:52 Savoy is the duchy.
 'Savoy':({(48,4):'savoy-the-horse'},None),
 # The Roman whose plainness our people would think barbarous. The Fabricius of
 # 25:137 is the bibliographer of the epitaph on Lucan, who is apparatus and
 # carries no card, and 95:38 is unread.
 'Fabricius':({(49,0):'fabricius-luscinus'},None),
 # The king whose bed the Romans called Caesar. 90:3 is unread.
 'Nicomedes':({(49,38):'nicomedes'},None),
 # The man-hater. Timon of Phlius the sceptic is another man, and 69:378 and
 # 73:90 are unread.
 'Timon':({(50,7):'timon',(69,378):'timon-of-phlius'},None),
 # Who brought Augustus the news of the victory. 70:33 is unread, and the Essays
 # name more than one Agrippa.
 'Agrippa':({(44,1):'agrippa'},None),
 # ---------------------------------------------- added with chapters 51-60
 # The player of the famous verse at 58:0. Bare "Publius" elsewhere belongs to
 # Publius Sulpicius Galba and Publius Crassus, both bound by their longer names.
 'Publius':({(58,0):'publius-syrus',(58,2):'publius-syrus'},None),
 # Attilius Regulus under his surname at 60:11, where Montaigne finds more
 # fortitude in his suffering than in Cato's breaking out. 101:2-3 are unread.
 'Regulus':({(60,11):'attilius-regulus'},None),
 # The emperor Tiberius, whom the older edition misprints Tiberias at 59:13. Every
 # other Tiberius in the read chapters is Tiberius Gracchus, bound by his longer
 # name, and the later ones are unread.
 'Tiberias':({(59,13):'tiberius-emperor'},None),
 'Tiberius':({(59,13):'tiberius-emperor',(60,56):'tiberius-emperor',
              (65,39):'tiberius-emperor'},None),
 # The older edition misprints Pliny "Piny" at 60:43; the modern edition prints it
 # correctly, and the Pliny table carries that paragraph for the modern text.
 'Piny':({(60,43):'pliny-elder'},None),
 # The Latin elegist of the citation at 59:24, bound by his surname alone. The
 # older edition abbreviates him "Cornet." and the modern prints "Cornelius
 # Gallus" in full, where the proctor of 19:24 carries that exact alias -- so the
 # alias binding is suppressed there and the surname is keyed instead. 19:70, 20:2
 # and the chapter 99 occurrences have not been read.
 'Gallus':({(59,24):'cornelius-gallus-poet'},None),
 # Two men called Fulvius in one paragraph: Augustus's favourite, whose wife ran
 # herself through first, and the consul of the butchery at Capua, who is named
 # twice after him. Cnaeus Fulvius at 15:4 and Quintus Fulvius Flaccus at 48:51
 # are bound by their longer names.
 'Fulvius':({(60,52):['fulvius-favourite','fulvius-consul','fulvius-consul']},None),
 # The apostle at 60:57. The St Paul of 17:2 is a town in the Low Countries that
 # the Comte de Bures took, and carries no card.
 r'St\.? Paul':({(60,57):'st-paul',(69,20):'st-paul',(69,219):'st-paul',
                 (69,261):'st-paul',(69,281):'st-paul',(69,335):'st-paul'},None),
 # The tribune whose violence Metellus withstood. 103:255 is unread.
 'Saturninus':({(68,7):'saturninus',(69,345):'saturninus-husband'},None),
 # The older edition misprints Paulina's husband Satuminus, with rn run together.
 'Satuminus':({(69,345):'saturninus-husband'},None),
 # Two men called Archias in one sentence at 61:3: the tyrant of Thebes who put
 # the warning by till to-morrow, and the Athenian who sent it. Keyed by occurrence.
 'Archias':({(61,3):['archias-thebes','archias-athenian']},None),
 # The Apollodorus of the dream at 62:12 is not the one who said Chrysippus's
 # writings would be blank paper without their borrowings, at 25:3. Neither is
 # alias-bound any more, and the later occurrences are unread.
 'Apollodorus':({(25,3):'apollodorus',(62,12):'apollodorus-dreamer'},None),
 # Demetrius Poliorcetes under his bare given name at 66:18, where Plutarch has
 # him and Alcimus in armour of six score pounds. The Essays count twenty
 # Demetrii at 46:12, and every other occurrence is unread.
 'Demetrius':({(66,18):'demetrius-poliorcetes'},None),
 # Three people under one designation in the dedication of chapter 65: the widow
 # it is addressed to, and, in one sentence, her husband and her son. The modern
 # edition writes the name with a small d and a straight apostrophe.
 r'(?:Madame|Monsieur) [Dd][\u2019\']Estissac':(
     {(65,0):'madame-destissac',
      (65,2):['monsieur-destissac-husband','monsieur-destissac-son']},None),
 # Two men called Labienus in one paragraph, and the orator is named four times
 # to his father's once: the orator, then the father, then the orator twice more.
 'Labienus':({(65,39):['labienus-orator','labienus-father',
                       'labienus-orator','labienus-orator']},None),
 # The father and the son in one paragraph at 67:21, the father named once before
 # the son takes over the rest of it. Cicero is alias-bound everywhere else in the
 # work, so the alias is suppressed here and the paragraph keyed by occurrence.
 'Cicero':({(67,21):['cicero','cicero-the-younger',
                     'cicero-the-younger','cicero-the-younger']},None),
 # The brother the younger Cyrus claimed to be preferred before. Persia had three
 # kings of the name and 68:42 has not been read, so only 59:28 is keyed.
 'Artaxerxes':({(59,28):'artaxerxes',(68,42):'artaxerxes-lawgiver'},None),
 # The bishop of 26:18. At 59:32 the same seven letters end "he whom they called
 # Marcus Aurelius" -- the Spanish book Montaigne's father had always in his
 # mouth, which is Guevara's and is called by the emperor's name; the bishop's
 # alias was taking it, and the referent there is neither the bishop nor, plainly,
 # the emperor, so nothing is bound.
 'Aurelius':({(26,18):'aurelius-bishop'},None),
 # Vibius Virrius under his surname, in the two places the paragraph repeats it.
 # Gallus Vibius the rhetorician at 20:2 is another man, bound by his own longer
 # name, and the bare surname is kept off him by keying rather than aliasing.
 'Vibius':({(60,52):'vibius-virrius'},None),
 # The Aetolian general of 60:45, once the philosopher's alias has been suppressed
 # there. Every other Democritus in the work is the philosopher of Abdera.
 'Democritus':({(60,45):'democritus-aetolian'},None),
 # The Titaness of 69:656, whom the older edition prints as Thetis. Homer's
 # Ocean and Tethys, father and mother of the gods, are not the sea-goddess of
 # the Indian Ocean sacrifice; the modern edition corrects the name and the
 # sea-goddess's alias is suppressed in that one paragraph.
 'Thetis':({(69,656):'tethys'},None),
 # Aristo of Chios under the modern edition's fuller spelling. 99:56 and
 # 103:239 print the same seven letters in chapters not yet read.
 'Ariston':({(69,558):'aristo-of-chios'},None),
 # The apostle at 69:20, where the modern edition writes the title out and the
 # older edition abbreviates it.
 'Saint Paul':({(69,20):'st-paul'},None),
 # Julius Caesar under the older edition's ligature, in the metempsychosis
 # paragraph where all three occurrences are his. The bare "Caesar" is a table
 # everywhere else in the work because the name belongs to several emperors.
 'Cæsar':({(69,287):'julius-caesar'},None),
 # Xenophanes of Colophon, whom the older edition prints Zenophanes in the
 # doxography. He is keyed rather than aliased everywhere else, so he is keyed here.
 'Zenophanes':({(69,268):'xenophanes-colophon'},None),
 # The speaker in Plato at 69:243, under the older edition's ligature. At 69:267
 # the same letters are the title of the dialogue, and titles are not cast --
 # both editions italicise it there, which the alias matcher happens to refuse
 # because an underscore is a word character, but the man is keyed rather than
 # aliased so that nothing depends on the markup.
 'Timæus':({(69,243):'timaeus'},None),
}
# A name that is the subject of the sentence rather than its referent. In the
# chapter on names Montaigne counts "three of the name of Socrates" among the
# proofs that a name is three or four dashes with a pen; the Athenian is not in
# that sentence, and his alias would otherwise take it. (pattern, chapter, paragraph)
SUPPRESS={('Socrates',46,12),
          # 67:21 sets Cicero the orator beside "the younger Cicero, who
          # resembled his father in nothing but in name", and then means the son
          # for the rest of the paragraph. The father's alias would take all four.
          ('Cicero',67,21),
          # 60:45 is "Democritus, general of the AEtolians", brought prisoner to
          # Rome and dead on his own sword -- not the philosopher of Abdera, whose
          # alias is single-referent everywhere else in the work and would
          # otherwise take this one too.
          ('Democritus',60,45),
          # The modern edition prints "Cornelius Gallus" in full at 59:24, where
          # the citation means the elegist; that exact alias belongs to the
          # proctor of 19:24. The surname alone is keyed to the poet instead.
          ('Cornelius Gallus',59,24),
          # 69:656 is Homer's Ocean and Tethys, father and mother of the gods. The
          # older edition prints Tethys as Thetis, and the sea-goddess's alias would
          # take it; the Titaness is keyed there instead.
          ('Thetis',69,656),
          # 65:22 is "a dean of St. Hilary of Poitiers", which is the collegiate
          # church and not the bishop of 26:18 and 32:3. The modern edition writes it
          # Saint-Hilaire in Poitiers, which is how the place shows itself.
          ('St. Hilary',65,22)}
# Aristo of Chios is bound by his full name rather than by a table, because the
# bare "Aristo" is three different men in this book: the Stoic of 24:54, a
# tragedian at 25:152, and — in the older edition only — Ariosto at 27:13, where
# the modern edition prints the poet's name in full. Nothing binds the bare form.

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 drop={w for w,c,p in SUPPRESS if (c,p)==(ch,pi)}
 if drop:out=[o for o in out if text[o[0]:o[1]] not in drop]
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 for name,(table,default) in SPLIT.items():
  entry=table.get((ch,pi),default)
  if entry is None:continue
  if isinstance(entry,list):
   for i,m in enumerate(re.finditer(word(name),text)):
    who=entry[i] if i<len(entry) else None
    if who:out.append((m.start(),m.end(),who,'reviewed-context'))
  else:
   for m in re.finditer(word(name),text):out.append((m.start(),m.end(),entry,'reviewed-context'))
 return out

def compile_package():return assemble('essays-montaigne',bind)
if __name__=='__main__':run('essays-montaigne','Essays',bind)
