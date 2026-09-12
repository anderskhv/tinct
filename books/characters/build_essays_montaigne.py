"""Reviewed bindings for Montaigne's Essays.

Cotton in both editions, 107 chapters covering the three books, 4,897 paragraphs
per edition. Chapters 1-25 are authored.

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
 'Edward':({(1,1):'edward-black-prince',(3,11):'edward-i'},None),
 # The tyrant of Syracuse, named twice; the later Dionysiuses are not yet read.
 'Dionysius':({(1,4):'dionysius-elder',(2,21):'dionysius-elder',(16,3):'dionysius-elder',
               (23,19):'dionysius-elder'},None),
 # Pompey the Great here; thirty-six later occurrences unread.
 'Pompey':({(1,5):'pompey',(17,6):'pompey',(18,3):'pompey',(18,12):'pompey',
            (23,1):'pompey',(25,25):'pompey-the-dancer'},None),
 # The citizen of Messina, not the founder of the Stoa.
 'Zeno':({(1,5):'zeno-mamertine',(22,49):'zeno-of-citium',(24,55):'zeno-of-citium',
          (25,143):'zeno-of-citium'},None),
 # Alexander the Great in both authored places.
 'Alexander':({(1,6):'alexander',(6,8):'alexander',(18,3):'alexander',
               (19,21):'alexander',(23,7):'alexander',
               (25,81):'alexander',(25,91):'alexander'},None),
 # Conrad III at 1:3; Conrad Marquis of Monteferrat at 86:19.
 'Conrad':({(1,3):'conrad-iii'},None),
 # The Ferdinand of the Buda campaign at 2:9; King Ferdinand of the Indies at
 # 107:9 is another man.
 'Ferdinand':({(2,9):'ferdinand'},None),
 # King John of Hungary at 2:9. Bare "John" elsewhere belongs to John Zisca and
 # to men not yet read, so only the king's own paragraph is keyed.
 'John':({(2,9):'john-of-hungary',(3,11):'john-zisca'},None),
 # The dialectician at 2:21; Diodorus Siculus at 69:532 and 74:18.
 'Diodorus':({(2,21):'diodorus-dialectician'},None),
 # Robert Bruce at 3:11; the King Robert of 33:7 is not identified with him.
 'Robert':({(3,11):'robert-bruce'},None),
 # Philip of Spain at 3:13; Don Philip at 7:0. Philip of Macedon and Alexander's
 # physician Philip wait in later chapters.
 'Philip':({(3,13):'philip-ii-spain',(7,0):'don-philip',(23,7):'philip-physician'},None),
 # Cyrus the Great in both authored places; Cyrus the Younger is not yet read.
 'Cyrus':({(3,13):'cyrus-the-great',(4,9):'cyrus-the-great',(18,3):'cyrus-the-great',
           (24,57):'cyrus-the-great',(24,59):'cyrus-the-great'},None),
 # Socrates's friend at 3:15; the Crito of 69:208 is somebody's brother in
 # another story.
 'Crito':({(3,15):'crito'},None),
 # The King of Macedon, not the son of Danae.
 'Perseus':({(5,0):'perseus-macedon'},None),
 # The King of Epirus; the Pyrrhus of the transmigration list at 69:473 is not
 # him.
 'Pyrrhus':({(5,0):'pyrrhus-epirus'},None),
 # Martin the memoirist at 5:9; Cardinal Jean at 10:3; the poet Joachim in
 # chapters 24, 25 and 74.
 r'[Dd]u Bellay':({(5,9):'martin-du-bellay',(10,3):'jean-du-bellay',
                   (14,1):'martin-du-bellay',(24,0):'joachim-du-bellay',
                   (24,2):'joachim-du-bellay',(25,123):'joachim-du-bellay'},None),
 # Antigonus the besieger of Eumenes; the Antigonus of 37:0, who was displeased
 # at being brought Pyrrhus's head, is another.
 'Antigonus':({(5,10):'antigonus-i'},None),
 # Henry de Vaux at 5:11, spelled Henri in the modern edition; Henry VII at 7:0.
 r'Henr[yi]':({(5,11):'henry-de-vaux',(7,0):'henry-vii'},None),
 # The Spartan who broke the truce with Argos. Later chapters have at least one
 # other Cleomenes.
 'Cleomenes':({(6,2):'cleomenes-i',(25,117):'cleomenes-sparta'},None),
 # Darius III at 6:8; Darius I at 9:2.
 'Darius':({(6,8):'darius-iii',(9,2):'darius-i',(12,2):'darius-i',
            (22,21):'darius-i',(23,7):'darius-iii'},None),
 # Charles V, named to place his father; the later Charleses are unread.
 'Charles':({(7,0):'charles-v',(11,14):'charles-v',(12,3):'charles-v',(16,8):'charles-v',
             (20,22):'charles-iv'},None),
 # The Duke of Alva of the Brussels executions; "the last Duke of Alva" at
 # 74:157 is a later head of the house.
 'Alva':({(7,0):'duke-of-alva'},None),
 # Pliny the Elder; the younger Pliny appears at 38:45 and 39:0.
 'Pliny':({(9,6):'pliny-elder',(20,4):'pliny-elder',(22,2):'pliny-elder'},None),
 # Francis I in all three authored places.
 'Francis':({(9,8):'francis-i',(9,9):'francis-i',(10,3):'francis-i',(11,14):'francis-i',
             (13,1):'francis-i',(24,49):'francis-brittany'},None),
 # Francesco Sforza at 9:8; Ludovico Sforza at 18:3 is another Duke of Milan.
 'Sforza':({(9,8):'francesco-sforza',(18,3):'ludovico-sforza'},None),
 # The bare "Messire Francesco" of 9:8 is Taverna, not his master.
 'Messire Francesco':({(9,8):'francesco-taverna'},None),
 # Severus Cassius; the later Cassiuses are unread.
 'Cassius':({(10,4):'severus-cassius'},None),
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
            (23,1):'augustus',(25,47):'julius-caesar'},None),
 # Pompey's father-in-law at 18:12. Every other Scipio in the Essays belongs to
 # a chapter not yet authored, and the name runs through a whole family.
 'Scipio':({(18,12):'metellus-scipio',(22,49):'publius-scipio-pontifex',
            (23,10):'scipio-africanus',(25,51):'scipio-africanus'},None),
 # P. Crassus the consul in Asia — "Publius Crassus" in the modern edition. The
 # triumvir and his son are not yet read, so only 16:9 is keyed.
 'Crassus':({(16,9):'publius-crassus',(16,10):'publius-crassus'},None),
 # Antiochus inflamed by Stratonice. The Essays name several Antiochuses.
 'Antiochus':({(20,4):'antiochus'},None),
 # Monsieur de Bourbon, who took Rome. The house supplies more men later.
 'Bourbon':({(17,2):'bourbon'},None),
 # Diogenes the Atheist in the temple at Samothrace. Diogenes the Cynic fills
 # chapters 27, 50 and 60, and Diogenes Laertius is cited at 68:61.
 'Diogenes':({(11,31):'diogenes-the-atheist',(25,103):'diogenes-the-cynic'},None),
 # Xenophanes of Colophon, the one philosopher Cicero says tried to root out
 # divination. The later Xenophanes passages have not been read.
 'Xenophanes':({(11,32):'xenophanes-colophon'},None),
 # Guido di Gonzaga's son at 19:24; Ludovico Sforza at 18:3 is bound by his own
 # longer alias, so only the Gonzaga paragraph is keyed here.
 'Ludovico':({(19,24):'ludovico-gonzaga'},None),
 # ------------------------------------------------- added with chapters 21-24
 # Cato of Utica at 22:54. Cato the Censor and the rest are unread.
 'Cato':({(22,54):'cato-the-younger',(25,117):'cato-the-younger'},None),
 # The conspirator in Livia's list. The two Lepiduses already cast are bound by
 # their full names, so the bare surname is free for this one.
 'Lepidus':({(23,1):'lepidus-conspirator'},None),
 # The sophist Socrates rallies. Hippias returns at 103:143, unread.
 'Hippias':({(24,62):'hippias-sophist'},None),
 # -------------------------------------------------- added with chapter 25
 # Augustus's wife at 23:1; Signora Livia, whose petticoats a young traveller
 # should not come home able to describe, at 25:26.
 'Livia':({(23,1):'livia',(25,26):'signora-livia'},None),
 # Aristo the tragedian at 25:152. The Latin dative "Aristoni" in the quotation
 # at 25:151 is left unbound, like every other name inside the Latin.
 'Aristo':({(25,152):'aristo-tragedian'},None),
}
# Aristo of Chios is bound by his full name rather than by a table, because the
# bare "Aristo" is three different men in this book: the Stoic of 24:54, a
# tragedian at 25:152, and — in the older edition only — Ariosto at 27:13, where
# the modern edition prints the poet's name in full. Nothing binds the bare form.

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
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
