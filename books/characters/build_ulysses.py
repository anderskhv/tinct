"""Reviewed bindings for Ulysses.

Joyce in both editions, 18 episodes, 7,148 paragraphs per edition. Episodes 1 to
8 are authored; episodes 9-18 are not.

Every table below has `None` for its default, so a name that an unread episode
will give to somebody else carries no card at all outside the paragraphs keyed
here. That matters more in this book than in any other in the library, because a
surname in Ulysses is almost never one man: `Dedalus` is Stephen in episode 1,
his father from episode 6 and his sisters in episode 10, and `Bloom` will be
five people. A name is given an alias only when every one of its occurrences in
the whole book has been read and found to be the same person.

The names below were checked against all 18 episodes before being keyed rather
than aliased, and each comment says what the other occurrences turned out to be.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'ulysses'

# name -> ({(episode, paragraph): id or [ids by occurrence] or None}, default or None)
SPLIT={
 # Stephen in episode 1; his father Simon from episode 6; "the Dedalus girls"
 # in episode 10; "Mr Dedalus" throughout the middle of the book is the father.
 # From episode 6 every Dedalus and every Mr Dedalus in the book is his
 # father Simon, who sits in the funeral carriage all morning.
 'Dedalus':({(1,23):'stephen',(1,35):'stephen',(1,85):'stephen',
           (1,120):'stephen',(1,137):'stephen',(1,219):'stephen',
           (1,281):'stephen',(2,137):'stephen',(2,154):'stephen',
           (2,195):'stephen',(6,3):'simon-dedalus',(6,12):'simon-dedalus',
           (6,15):'simon-dedalus',(6,18):'simon-dedalus',
           (6,19):'simon-dedalus',(6,22):'simon-dedalus',
           (6,25):'simon-dedalus',(6,35):'simon-dedalus',
           (6,39):'simon-dedalus',(6,43):'simon-dedalus',
           (6,61):'simon-dedalus',(6,70):'simon-dedalus',
           (6,73):'simon-dedalus',(6,85):'simon-dedalus',
           (6,88):'simon-dedalus',(6,111):'simon-dedalus',
           (6,121):'simon-dedalus',(6,123):'simon-dedalus',
           (6,125):'simon-dedalus',(6,130):'simon-dedalus',
           (6,137):'simon-dedalus',(6,142):'simon-dedalus',
           (6,145):'simon-dedalus',(6,159):'simon-dedalus',
           (6,166):'simon-dedalus',(6,168):'simon-dedalus',
           (6,177):'simon-dedalus',(6,189):'simon-dedalus',
           (6,191):'simon-dedalus',(6,192):'simon-dedalus',
           (6,195):'simon-dedalus',(6,207):'simon-dedalus',
           (6,209):'simon-dedalus',(6,217):'simon-dedalus',
           (6,223):'simon-dedalus',(6,253):'simon-dedalus',
           (6,255):'simon-dedalus',(6,257):'simon-dedalus',
           (6,259):'simon-dedalus',(6,264):'simon-dedalus',
           (6,276):'simon-dedalus',(6,279):'simon-dedalus',
           (6,282):'simon-dedalus',(6,316):'simon-dedalus',
           (7,21):'simon-dedalus',(7,109):'simon-dedalus',
           (7,113):'simon-dedalus',(7,116):'simon-dedalus',
           (7,126):'simon-dedalus',(7,137):'simon-dedalus',
           (7,151):'simon-dedalus',(7,156):'simon-dedalus',
           (7,166):'simon-dedalus',(7,168):'simon-dedalus',
           (7,258):'stephen',(7,497):'stephen',(8,9):'simon-dedalus'},None),
 # Deasy calls him Mr Dedalus; from episode 6 the same two words are his father.
 'Mr Dedalus':({(2,137):'stephen',(2,154):'stephen',(2,195):'stephen',
              (6,3):'simon-dedalus',(6,12):'simon-dedalus',
              (6,18):'simon-dedalus',(6,19):'simon-dedalus',
              (6,22):'simon-dedalus',(6,25):'simon-dedalus',
              (6,35):'simon-dedalus',(6,39):'simon-dedalus',
              (6,43):'simon-dedalus',(6,61):'simon-dedalus',
              (6,70):'simon-dedalus',(6,73):'simon-dedalus',
              (6,85):'simon-dedalus',(6,88):'simon-dedalus',
              (6,111):'simon-dedalus',(6,121):'simon-dedalus',
              (6,123):'simon-dedalus',(6,125):'simon-dedalus',
              (6,130):'simon-dedalus',(6,137):'simon-dedalus',
              (6,142):'simon-dedalus',(6,145):'simon-dedalus',
              (6,159):'simon-dedalus',(6,166):'simon-dedalus',
              (6,177):'simon-dedalus',(6,189):'simon-dedalus',
              (6,191):'simon-dedalus',(6,192):'simon-dedalus',
              (6,195):'simon-dedalus',(6,207):'simon-dedalus',
              (6,209):'simon-dedalus',(6,217):'simon-dedalus',
              (6,223):'simon-dedalus',(6,253):'simon-dedalus',
              (6,255):'simon-dedalus',(6,257):'simon-dedalus',
              (6,259):'simon-dedalus',(6,276):'simon-dedalus',
              (6,279):'simon-dedalus',(6,282):'simon-dedalus',
              (6,316):'simon-dedalus',(7,109):'simon-dedalus',
              (7,113):'simon-dedalus',(7,116):'simon-dedalus',
              (7,126):'simon-dedalus',(7,151):'simon-dedalus',
              (7,156):'simon-dedalus',(7,166):'simon-dedalus',
              (7,168):'simon-dedalus'},None),
 # 12:513 is S. Ursula of the eleven thousand virgins, a different woman.
 'Ursula':({(1,59):'ursula'},None),
 # 9:294 is Aubrey the theatre owner in the Shakespeare argument.
 'Aubrey':({(1,70):'aubrey-oxford'},None),
 # 10:542 is Cahill's corner, a place.
 'Mrs Cahill':({(1,158):'mrs-cahill'},None),
 # 15:513 is one of the gold-and-silver names of the Circe masque.
 'Chrysostomos':({(1,9):'chrysostomos'},None),
 # 15:449 is Maurice Butterly, farmer, a person in Circe.
 'Butterly':({(1,255):'butterly'},None),
 # Six women called Lily in the book; this is the red Carlisle girl.
 'Lily':({(1,335):'lily-carlisle',(2,20):'school-lily'},None),
 # 12:1 and 17:x are other men called Valentine; this is the heresiarch.
 'Valentine':({(1,318):'valentine'},None),
 # mother Grogan is the folk figure of episode 1; 10, 14 and 15 use the name
 # again in company that has not been read.
 'Grogan':({(1,155):'mother-grogan',(1,162):'mother-grogan',(1,165):'mother-grogan'},None),
 'Mary Ann':({(1,165):'mary-ann',(1,169):'mary-ann'},None),
 # Seymour is named in five episodes; only episode 1 says who he is.
 'Seymour':({(1,69):'seymour',(1,333):'seymour',(1,339):'seymour',(1,340):'seymour'},None),
 # Bannon reappears in 4, 14 and 15, where he is with Milly Bloom.
 # 4:135 is the same young student: Milly writes home about him from
 # Mullingar, which is the other end of the card he sent in episode 1.
 'Bannon':({(1,329):'bannon',(4,135):'bannon'},None),
 'Bannons':({(1,328):'the-bannons'},None),
 # Fergus is the song in episode 1; 12 and 15 use the name otherwise.
 'Fergus':({(1,105):'fergus',(1,107):'fergus'},None),
 # Shakespeare and Hamlet are argued over for the whole of episode 9 and named
 # in eleven episodes; only the two mentions of episode 1 are keyed here.
 'Shakespeare':({(1,275):'shakespeare',(2,74):'shakespeare',(2,113):'shakespeare',
                 (6,168):'shakespeare',(6,333):'shakespeare',(8,16):'shakespeare'},None),
 'Hamlet':({(1,232):'hamlet',(1,269):'hamlet',(1,275):'hamlet',(2,74):'hamlet',
           (3,79):'hamlet',(5,65):'hamlet',(6,333):'hamlet',(7,154):'hamlet',(8,17):'hamlet'},None),
 # Joseph is Joseph the Joiner at 1:288 and 1:295 and eleven other men elsewhere.
 'Joseph':({(1,288):'joseph-the-joiner',(1,295):'joseph-the-joiner',
            (3,43):'joseph-the-joiner',(5,107):'joseph-the-joiner'},None),
 # --- episode 2. Every one of these names belongs to somebody else elsewhere in
 # the book, which is why none of them is an alias. The comments say who.
 # 5:65 and 5:101 are Cantrell and Cochrane's ginger ale.
 'Cochrane':({(2,0):'cochrane',(2,57):'cochrane',(2,91):'cochrane'},None),
 # 10:43 and 14:33 are lord Talbot de Malahide.
 'Talbot':({(2,30):'talbot',(2,32):'talbot',(2,36):'talbot',(2,40):'talbot',
            (2,43):'talbot'},None),
 # 12:312 is Jacob Halliday, vintner, of the mock legal report.
 'Halliday':({(2,91):'halliday'},None),
 # 7:380 is John Philpot Curran and 12:172 is Sara Curran.
 'Curran':({(2,123):'curran'},None),
 # 10:235 is Temple bar. 3:35 is the same man, in an episode not yet read.
 'Temple':({(2,123):'temple',(3,35):'temple'},None),
 # 8:111 and 8:144 name him in full: the eminent poet A. E., Mr Geo. Russell.
 'Russell':({(2,123):'russell',(8,111):'russell',(8,144):'russell'},None),
 # 7:42 is Phil Blake's weekly Pat and Bull story.
 # 7:42 is Phil Blake of the weekly Pat and Bull story.
 'Blake':({(2,6):'blake',(7,42):'phil-blake'},None),
 # 17:587 is Henry Price, basket and fancy goods.
 'Price':({(2,151):'henry-blackwood-price',(2,152):'henry-blackwood-price'},None),
 # Both dukes' horses gallop again in Circe at 15:1115.
 'Westminster':({(2,141):'duke-of-westminster'},None),
 'Beaufort':({(2,141):'duke-of-beaufort'},None),
 # Gerty MacDowell has episode 13 to herself; this is a schoolgirl of Stephen's.
 'Gerty':({(2,20):'school-gerty'},None),
 # Named in nine episodes, and in eight of them nobody has read him yet.
 # Two O'Connells in one episode: Daniel, whose circle and monument the
 # funeral passes, and John, the caretaker. 6:330 names both, four lines
 # apart, and is keyed by occurrence.
 'O[\u2019\']Connell':({(2,129):'oconnell',(6,106):'oconnell',(6,276):'oconnell',
                 (6,277):'oconnell',(6,278):'oconnell',
                 (6,315):'john-oconnell',(6,316):'john-oconnell',
                 (6,330):['john-oconnell','oconnell']},None),
 'Parnell':({(2,174):'parnell',(6,155):'parnell',(6,346):'parnell',
             (6,374):'parnell',(8,134):'parnell',(8,141):'parnell'},None),
 'Helen':({(2,174):'helen',(7,276):'helen',(7,519):'helen'},None),
 'Albert Edward':({(2,128):'albert-edward'},None),
 # 4:29 to 4:33 are Larry O'Rourke the publican on the corner of Dorset
 # street, a different man entirely.
 'O[’\']Rourke':({(2,174):'orourke',(7,276):'orourke',(4,29):'larry-orourke',(4,30):'larry-orourke',
                 (4,31):'larry-orourke',(4,33):'larry-orourke'},None),

 # --- episode 3. Same rule: every one of these is somebody else somewhere in
 # the book, or would be if the name were let loose, so each is keyed.
 # Richie Goulding is Stephen's uncle here; at 9:375 and 9:391 "nuncle Richie"
 # is Richard Shakespeare, in the argument about the brothers.
 'Richie':({(3,17):'richie-goulding',(3,21):'richie-goulding',(3,24):'richie-goulding',
            (3,25):'richie-goulding',(3,26):'richie-goulding',
            (6,24):'richie-goulding'},None),
 # 12:172 is Sara Curran of the Tommy Moore song and 14:57 is the Sara of a lay.
 'Sara':({(3,11):'aunt-sara',(3,41):'aunt-sara'},None),
 # 6:22 is the same woman, in an episode not yet read.
 'Sally':({(3,11):'aunt-sara',(6,22):'aunt-sara'},None),
 # 8:140 is Walter Sexton, 9:256 and 15:394 are Sir Walter Raleigh, 11:483 is
 # Walter Bapty; 11:385 is this Walter, crosseyed, in an unread episode.
 'Walter':({(3,11):'walter-goulding',(3,15):'walter-goulding',(3,19):'walter-goulding',
            (3,28):'walter-goulding'},None),
 'Crissie':({(3,22):'crissie-goulding',(6,22):'crissie-goulding'},None),
 # 7:479 names the same two midwives again, in an episode not yet read.
 'Mrs Florence MacCabe':({(3,6):'florence-maccabe'},None),
 '(?:Patk|Patrick) MacCabe':({(3,6):'patk-maccabe'},None),
 # Simon Dedalus is named Si five times in episode 11; here he is only a voice.
 'Si':({(3,11):'simon-dedalus'},None),
 # 16:105 is another Egan, the one Cunningham would work a pass through.
 'Egan':({(3,59):'kevin-egan'},None),
 # Pat is bald Pat the waiter through the whole of episode 11, Pat Dignam in
 # four episodes, Pat Farrell, Pat Claffey, Pat Kinsella, Pat Tobin. Here twice
 # it is Kevin Egan's son: tell Pat you saw me; I wanted to get poor Pat a job.
 'Pat':({(3,59):'patrice',(8,160):'pat-kinsella'},None),
 # Eleven other Burkes: O'Madden Burke of the newspaper office, Pisser Burke,
 # Edmund Burke, Burke's public house.
 'Burke':({(3,59):'richard-burke'},None),
 # 14:49 is Victoria Frances, a child of the Purefoy family.
 'Victoria':({(3,57):'queen-victoria',(3,94):'queen-victoria',
              (6,247):'queen-victoria',(8,116):'queen-victoria'},None),
 # Modern edition only: it prints the king where Joyce wrote his people. 6:205
 # is the Brian Boru House pub.
 'Brian Boru':({(3,57):'brian-boru'},None),
 # A E is George Russell, already cast from Stephen's list of debts at 2:123.
 # The older edition spells it A E and the modern one A.E., as it does in five
 # later episodes that have not been read.
 # 7:407 is George Russell again, signing himself A. E.
 '(?:A E|A\\.\s?E\\.)':({(3,57):'russell',(7,407):'russell',(8,111):'russell',(8,144):'russell'},None),
 # The high king, not Buck Mulligan and not Saint Malachy: the alias is dropped
 # at 3:67 by SUPPRESS below and the key carries it. 12:50 names him the ardri.
 'Malachi':({(3,67):'king-malachi',(12,50):'king-malachi'},None),
 # Adam and Eve's is a church and a tavern in five episodes; Adam Findlater,
 # Villiers de l'Isle-Adam and an Adam's apple are three more.
 'Adam':({(3,7):'adam',(3,77):'adam'},None),
 'Eve':({(3,7):'eve'},None),
 # 12:360 is the church of Saint Fiacre in Horto.
 'Fiacre':({(3,51):'fiacre'},None),
 # 15:991 is a match: STEPHEN: Lucifer. Thanks.
 'Lucifer':({(3,93):'lucifer'},None),
 # 12:177 is Pan Poleaxe Paddyrisky, one of the mock foreign delegates.
 'Pan':({(3,85):'pan'},None),

 # --- episode 4. Bloom arrives, and with him the hardest table in the book:
 # the surname belongs to five people. Leopold, Marion, Milly, Rudolph and
 # Rudy are all Bloom, and 4:38 is Slieve Bloom, a mountain range in Offaly,
 # which is why there is no bare 'Bloom' key at all.
 'Mr Leopold Bloom':({(4,0):'leopold'},None),
 # The bare surname is keyed only where somebody says it to his face, and
 # 4:38 -- Slieve Bloom, the mountains in Offaly -- is deliberately not a key.
 'Bloom':({(5,12):'leopold',(5,131):'leopold',(6,2):'leopold',
         (6,5):'leopold',(6,6):'leopold',(6,14):'leopold',(6,21):'leopold',
         (6,23):'leopold',(6,28):'leopold',(6,42):'leopold',
         (6,46):'leopold',(6,49):'leopold',(6,54):'leopold',
         (6,72):'leopold',(6,74):'leopold',(6,78):'leopold',
         (6,89):'leopold',(6,92):'leopold',(6,93):'leopold',
         (6,95):'leopold',(6,98):'leopold',(6,100):'leopold',
         (6,104):'leopold',(6,115):'leopold',(6,117):'leopold',
         (6,122):'leopold',(6,124):'leopold',(6,127):'leopold',
         (6,132):'leopold',(6,136):'leopold',(6,151):'leopold',
         (6,168):'leopold',(6,186):'leopold',(6,188):'leopold',
         (6,191):'leopold',(6,224):'leopold',(6,234):'leopold',
         (6,239):'leopold',(6,243):'leopold',(6,245):'leopold',
         (6,260):'leopold',(6,261):'leopold',(6,274):'leopold',
         (6,285):'leopold',(6,289):'leopold',(6,292):'leopold',
         (6,295):'leopold',(6,305):'leopold',(6,330):'leopold',
         (6,340):'leopold',(6,346):'leopold',(6,349):'leopold',
         (6,351):'leopold',(6,354):'leopold',(6,359):'leopold',
         (6,362):'leopold',(6,364):'leopold',(6,375):'leopold',
         (6,390):'leopold',(6,392):'leopold',(6,399):'leopold',
         (7,11):'leopold',(7,14):'leopold',(7,16):'leopold',
         (7,19):'leopold',(7,21):'leopold',(7,25):'leopold',
         (7,34):'leopold',(7,41):'leopold',(7,48):'leopold',
         (7,51):'leopold',(7,56):'leopold',(7,59):'leopold',
         (7,61):'leopold',(7,64):'leopold',(7,66):'leopold',
         (7,67):'leopold',(7,73):'leopold',(7,76):'leopold',
         (7,79):'leopold',(7,91):'leopold',(7,100):'leopold',
         (7,121):'leopold',(7,124):'leopold',(7,127):'leopold',
         (7,130):'leopold',(7,132):'leopold',(7,169):'leopold',
         (7,183):'leopold',(7,208):'leopold',(7,212):'leopold',
         (7,216):'leopold',(7,220):'leopold',(7,223):'leopold',
         (7,228):'leopold',(7,313):'leopold',(7,349):'leopold',
         (7,487):'leopold',(7,491):'leopold',(7,494):'leopold',
         (7,498):'leopold',(7,501):'leopold',(7,314):'molly',(8,204):'leopold',(8,288):'leopold'},None),
 'Mr Bloom':({(4,5):'leopold',(4,7):'leopold',(4,47):'leopold',
              (5,0):'leopold',(5,19):'leopold',(5,22):'leopold',
              (5,25):'leopold',(5,32):'leopold',(5,38):'leopold',
              (5,42):'leopold',(5,47):'leopold',(5,52):'leopold',
              (5,57):'leopold',(5,59):'leopold',(5,61):'leopold',
              (5,63):'leopold',(5,65):'leopold',(5,69):'leopold',
              (5,102):'leopold',(5,105):'leopold',(5,107):'leopold',
              (5,116):'leopold',(5,118):'leopold',(5,123):'leopold',
              (5,125):'leopold',(5,128):'leopold',(5,136):'leopold',
              (5,138):'leopold',(5,141):'leopold',(5,142):'leopold',
              (5,145):'leopold',(6,2):'leopold',(6,6):'leopold',
              (6,14):'leopold',(6,21):'leopold',(6,23):'leopold',
              (6,28):'leopold',(6,42):'leopold',(6,46):'leopold',
              (6,49):'leopold',(6,54):'leopold',(6,72):'leopold',
              (6,74):'leopold',(6,78):'leopold',(6,89):'leopold',
              (6,93):'leopold',(6,95):'leopold',(6,98):'leopold',
              (6,100):'leopold',(6,115):'leopold',(6,117):'leopold',
              (6,122):'leopold',(6,124):'leopold',(6,127):'leopold',
              (6,132):'leopold',(6,136):'leopold',(6,151):'leopold',
              (6,168):'leopold',(6,186):'leopold',(6,188):'leopold',
              (6,191):'leopold',(6,224):'leopold',(6,239):'leopold',
              (6,243):'leopold',(6,245):'leopold',(6,260):'leopold',
              (6,261):'leopold',(6,274):'leopold',(6,285):'leopold',
              (6,289):'leopold',(6,292):'leopold',(6,295):'leopold',
              (6,330):'leopold',(6,340):'leopold',(6,346):'leopold',
              (6,349):'leopold',(6,351):'leopold',(6,354):'leopold',
              (6,359):'leopold',(6,362):'leopold',(6,364):'leopold',
              (6,375):'leopold',(6,390):'leopold',(6,392):'leopold',
              (6,399):'leopold',(7,11):'leopold',(7,14):'leopold',
              (7,16):'leopold',(7,19):'leopold',(7,21):'leopold',
              (7,25):'leopold',(7,34):'leopold',(7,41):'leopold',
              (7,48):'leopold',(7,51):'leopold',(7,56):'leopold',
              (7,59):'leopold',(7,61):'leopold',(7,64):'leopold',
              (7,66):'leopold',(7,73):'leopold',(7,76):'leopold',
              (7,79):'leopold',(7,91):'leopold',(7,100):'leopold',
              (7,121):'leopold',(7,124):'leopold',(7,127):'leopold',
              (7,130):'leopold',(7,132):'leopold',(7,169):'leopold',
              (7,183):'leopold',(7,208):'leopold',(7,212):'leopold',
              (7,216):'leopold',(7,220):'leopold',(7,223):'leopold',
              (7,228):'leopold',(7,487):'leopold',(7,491):'leopold',
              (7,494):'leopold',(7,498):'leopold',(7,501):'leopold',(8,1):'leopold',(8,33):'leopold',(8,34):'leopold',(8,43):'leopold',(8,46):'leopold',(8,52):'leopold',(8,56):'leopold',(8,63):'leopold',(8,67):'leopold',(8,72):'leopold',(8,75):'leopold',(8,77):'leopold',(8,85):'leopold',(8,90):'leopold',(8,92):'leopold',(8,97):'leopold',(8,100):'leopold',(8,102):'leopold',(8,106):'leopold',(8,109):'leopold',(8,143):'leopold',(8,158):'leopold',(8,190):'leopold',(8,223):'leopold',(8,229):'leopold',(8,243):'leopold',(8,253):'leopold',(8,315):'leopold',(8,322):'leopold',(8,323):'leopold',(8,336):'leopold',(8,338):'leopold',(8,340):'leopold',(8,341):'leopold',(8,342):'leopold',(8,344):'leopold',(8,354):'leopold',(8,366):'leopold'},None),
 'Mrs Marion Bloom':({(4,63):'molly',(5,50):'molly'},None),
 'Mrs Marion':({(4,63):'molly',(4,146):'molly'},None),
 'Marion':({(4,63):'molly',(4,94):'molly',(4,146):'molly',(5,50):'molly',
            (6,305):'molly'},None),
 'Milly Bloom':({(4,86):'milly'},None),
 'Mr and Mrs L\\. M\\. Bloom':({(4,164):'leopold'},None),
 # Poldy is hers for him. Molly is his for her, except where the book uses the
 # name otherwise: the Molly Maguires at 12:364, Molly bawn at 18:3, the songs
 # at 15:10 and 18:4.
 'Poldy':({(4,64):'leopold',(4,80):'leopold',(6,28):'leopold'},None),
 'Molly':({(4,27):'molly',(4,57):'molly',(4,87):'molly',
           (5,81):'molly',(5,95):'molly',(5,99):'molly',(5,102):'molly',
           (6,6):'molly',(6,28):'molly',(6,32):'molly',(6,103):'molly',
           (6,266):'molly',(6,330):'molly',(6,388):'molly',(8,33):'molly',(8,35):'molly',(8,36):'molly',(8,45):'molly',(8,81):'molly',(8,105):'molly',(8,116):'molly',(8,118):'molly',(8,162):'molly',(8,253):'molly',(8,333):'molly',(8,356):'molly'},None),
 'Milly':({(4,67):'milly',(4,68):'milly',(4,85):'milly',(4,87):'milly',
           (4,135):'milly',(4,136):'milly',(4,146):'milly',
           (6,32):'milly',(6,56):'milly',(6,204):'milly',(6,376):'milly',(8,36):'milly',(8,37):'milly',(8,42):'milly',(8,46):'milly',(8,211):'milly',(8,255):'milly',(8,349):'milly'},None),
 # 16:19 and 16:23 are Boylan the billsticker, whom nobody in the book connects
 # with this one, and 12:260 is a Mr Boylan in the citizen's deaf-man story.
 'Boylan':({(4,84):'blazes-boylan',(4,95):'blazes-boylan',(4,135):'blazes-boylan',
            (4,165):'blazes-boylan',(6,86):'blazes-boylan',(8,35):'blazes-boylan',(8,255):'blazes-boylan'},None),
 # Master Patrick Aloysius Dignam is his son, in episodes 10 and 15.
 'Dignam':({(4,31):'paddy-dignam',(4,117):'paddy-dignam',(4,172):'paddy-dignam',
            (5,19):'paddy-dignam',(5,28):'paddy-dignam',(5,34):'paddy-dignam',
            (6,74):'paddy-dignam',(6,197):'paddy-dignam',(6,204):'paddy-dignam',
            (6,271):'paddy-dignam',(6,339):'paddy-dignam',(6,385):'paddy-dignam',
            (6,388):'paddy-dignam',(7,39):'paddy-dignam',(7,99):'paddy-dignam',(8,56):'paddy-dignam',(8,135):'paddy-dignam',(8,208):'paddy-dignam'},None),
 'Paddy Dignam':({(6,197):'paddy-dignam',(6,204):'paddy-dignam',(5,28):'paddy-dignam',(5,34):'paddy-dignam'},None),
 # 6:103 is Molly's namesake Tweedy, crown solicitor for Waterford; from episode
 # 16 on, Madam Marion Tweedy is Molly herself.
 # 6:103 is Molly's namesake, the crown solicitor for Waterford, and 6:305 is
 # Molly herself: Madame Marion Tweedy that was.
 'Tweedy':({(4,24):'major-tweedy',(4,27):'major-tweedy',(5,9):'major-tweedy',
            (6,103):'waterford-tweedy',(6,305):'molly'},None),
 'Larry':({(4,29):'larry-orourke',(4,30):'larry-orourke'},None),
 'Larry O[’\']Rourke':({(4,29):'larry-orourke'},None),
 # 18:5 is Williams and Woods, the jam makers.
 'Woods':({(4,40):'woods'},None),
 # 8:85, 13:98 and 15:203 are Mrs Beaufoy, who is Mrs Purefoy under a slip.
 'Beaufoy':({(4,162):'philip-beaufoy',(4,163):'philip-beaufoy',(8,85):'mina-purefoy',(8,87):'philip-beaufoy'},None),
 'Philip Beaufoy':({(4,162):'philip-beaufoy',(8,87):'philip-beaufoy'},None),
 # Two occurrences in the paragraph, and the first is the title of the book.
 'Ruby':({(4,117):[None,'ruby']},None),
 # Matcham's Masterstroke is set in Gutenberg italic underscores at 4:162 and
 # 4:163, where the alias binder's \\w guard cannot reach it: the same trap as
 # Los Demiurgos at 3:1. Keyed for that reason.
 'Matcham':({(4,162):'matcham',(4,163):'matcham',(8,87):'matcham'},None),
 # 18:1 is Mrs Mastiansky, and 8:118 is Mrs Moisel.
 'Mastiansky':({(4,57):'mastiansky',(6,331):'mastiansky'},None),
 'Moisel':({(4,57):'moisel'},None),
 # 18:1 and 18:4 are Kathleen Kearney.
 'Kearney':({(4,123):'kearney'},None),
 # 17:485 lists a Montefiore among financiers; only this one is read.
 'Moses Montefiore':({(4,42):'moses-montefiore'},None),
 # The modern edition deletes both names from this paragraph.
 'Adam Findlaters':({(4,37):'adam-findlater'},None),
 'Dan Tallons':({(4,37):'dan-tallon'},None),
 'Daniel Tallon':({(17,109):'dan-tallon'},None),
 # Simon Dedalus named in full for the first time; from episode 6 he is present.
 # The head centre of episode 3 gets his name here. 9:126 is the other James
 # Stephens, the writer doing some clever sketches.
 'James Stephens':({(4,159):'head-centre',(8,133):'head-centre',
                    (12,234):'head-centre',(15,433):'head-centre'},None),

 # --- episode 5. Bloom alone for a second morning, and the names he thinks
 # with. Paddy Dignam's name has three forms in one conversation.
 # 6:65 is Paddy Leonard, who has his own full-name alias.
 'Paddy':({(5,28):'paddy-dignam',(5,34):'paddy-dignam',
           (6,143):'paddy-dignam',(6,144):'paddy-dignam',(6,197):'paddy-dignam',
           (6,204):'paddy-dignam',(6,257):'paddy-dignam'},None),
 # Leopold is Bloom at 5:67 and the queen's son at 5:121, twelve lines after
 # Bloom notices that the duke of Albany had his own name.
 'Leopold':({(5,67):'leopold',(5,121):'duke-of-albany',
             (6,56):'leopold',(6,171):'leopold',(6,354):'leopold',(8,255):'archduke-leopold'},None),
 # Henry is Bloom's pen name here; John Henry Menton, Henry Campbell and Henry
 # Blackwood Price are three other men.
 # 6:75 is the mourning-card verse -- dear Henry fled to his home up above --
 # and is not bound; 6:76 is Bloom turning the same words on his own pen name.
 'Henry':({(5,76):'henry-flower',(5,77):'henry-flower',(6,76):'henry-flower'},None),
 # 15:1235 is Mrs Bob Doran, his wife.
 'Doran':({(5,26):'bob-doran',(5,27):'bob-doran',(8,159):'bob-doran'},None),
 'Bob Doran':({(5,26):'bob-doran',(8,159):'bob-doran'},None),
 # 10:457 is Councillor Abraham Lyon.
 'Lyons':({(5,26):'bantam-lyons',(5,27):'bantam-lyons',(5,130):'bantam-lyons',
           (5,133):'bantam-lyons',(5,134):'bantam-lyons',(5,137):'bantam-lyons',
           (5,139):'bantam-lyons',(5,142):'bantam-lyons'},None),
 # The informer, whose first name Bloom cannot fix: Carey, Peter Carey, Denis
 # Carey, all three in the same paragraph and all the same man. Peter Claver in
 # the middle of them is the saint of the sermon on the door.
 'Carey':({(5,100):'carey',(8,127):'carey'},None),
 'Peter Carey':({(5,100):'carey'},None),
 'Denis Carey':({(5,100):'carey'},None),
 # Peter is the apostle only at 5:107; at 5:95 and 5:100 he is Peter Claver and
 # Peter Carey, both of whom have their own span.
 'Peter':({(5,107):'saint-peter',(6,264):'saint-peter',(6,333):'saint-peter'},None),
 'Paul':({(5,107):'saint-paul'},None),
 # 1:318 is Michael's host, the embattled angels of the church, in an episode
 # that had already been signed off without him.
 'Michael':({(1,318):'saint-michael',(5,109):'saint-michael'},None),
 'Satan':({(5,109):'satan'},None),
 # Saint Patrick is named in nine episodes and only this one is read.
 'Saint Patrick':({(5,95):'saint-patrick',(8,179):'saint-patrick'},None),
 # 12:513 and 15:78 are the patriarch; this is the blind father of the play.
 'Abraham':({(5,65):'leah-abraham'},None),
 # The modern edition spells her Mary, which is also the gospel sister at 5:87.
 '(?:Mairy|Mary)':({(5,84):'mairy'},None),
 'Martha':({(5,78):'martha-clifford',(5,80):'martha-clifford',
            (5,87):'martha-and-mary',
            (6,330):'martha-clifford',(6,386):'martha-clifford',
            (7,24):'martha-and-mary'},None),
 'Mary':({(5,87):'martha-and-mary',(7,24):'martha-and-mary',(8,128):'mary-slavey',(8,130):'mary-slavey'},None),
 # 11:516 is the Iveagh home, a hostel named after him.
 'Iveagh':({(5,91):'lord-iveagh'},None),
 # --- episode 7. The newspaper office: Stephen and Bloom in the same room for
 # the first time, and never in it together. 7:21 and 7:112 are Simon; 7:258
 # and 7:497 are his son.
 'Myles':({(7,147):'myles-crawford',(7,170):'myles-crawford',
         (7,173):'myles-crawford',(7,187):'myles-crawford',
         (7,188):'myles-crawford',(7,231):'myles-crawford',
         (7,233):'myles-crawford',(7,243):'myles-crawford',
         (7,247):'myles-crawford',(7,275):'myles-crawford',
         (7,278):'myles-crawford',(7,282):'myles-crawford',
         (7,295):'myles-crawford',(7,310):'myles-crawford',
         (7,326):'myles-crawford',(7,332):'myles-crawford',
         (7,336):'myles-crawford',(7,353):'myles-crawford',
         (7,358):'myles-crawford',(7,368):'myles-crawford',
         (7,378):'myles-crawford',(7,401):'myles-crawford',
         (7,404):'myles-crawford',(7,410):'myles-crawford',
         (7,413):'myles-crawford',(7,457):'myles-crawford',
         (7,482):'myles-crawford',(7,490):'myles-crawford',
         (7,496):'myles-crawford',(7,500):'myles-crawford',
         (7,506):'myles-crawford',(7,508):'myles-crawford',
         (7,511):'myles-crawford',(7,517):'myles-crawford',
         (7,525):'myles-crawford',(7,538):'myles-crawford'},None),
 'Crawford':({(7,147):'myles-crawford',(7,184):'myles-crawford',
            (7,187):'myles-crawford',(7,231):'myles-crawford',
            (7,233):'myles-crawford',(7,243):'myles-crawford',
            (7,247):'myles-crawford',(7,275):'myles-crawford',
            (7,278):'myles-crawford',(7,282):'myles-crawford',
            (7,295):'myles-crawford',(7,310):'myles-crawford',
            (7,326):'myles-crawford',(7,332):'myles-crawford',
            (7,336):'myles-crawford',(7,353):'myles-crawford',
            (7,358):'myles-crawford',(7,368):'myles-crawford',
            (7,401):'myles-crawford',(7,404):'myles-crawford',
            (7,410):'myles-crawford',(7,413):'myles-crawford',
            (7,465):'myles-crawford',(7,482):'myles-crawford',
            (7,488):'myles-crawford',(7,490):'myles-crawford',
            (7,494):'myles-crawford',(7,496):'myles-crawford',
            (7,500):'myles-crawford',(7,506):'myles-crawford',
            (7,508):'myles-crawford',(7,511):'myles-crawford',
            (7,517):'myles-crawford',(7,525):'myles-crawford',
            (7,538):'myles-crawford'},None),
 'Ned':({(7,105):'ned-lambert',(7,109):'ned-lambert',(7,111):'ned-lambert',
       (7,114):'ned-lambert',(7,119):'ned-lambert',(7,120):'ned-lambert',
       (7,128):'ned-lambert',(7,148):'ned-lambert',(7,150):'ned-lambert',
       (7,156):'ned-lambert',(7,158):'ned-lambert',(7,166):'ned-lambert',
       (7,168):'ned-lambert',(7,169):'ned-lambert',(7,170):'ned-lambert',
       (7,173):'ned-lambert',(7,175):'ned-lambert'},None),
 'Monks':({(7,88):'monks',(7,89):'monks',(7,90):'monks',(7,93):'monks',
           (7,97):'monks'},None),
 # 7:232 is Jack Hall; the rest are J. J. O'Molloy, whom they call Jack.
 'Jack':({(6,279):'jack-power',(7,134):'jj-omolloy',(7,187):'jj-omolloy',
          (7,503):'jj-omolloy'},None),
 'Moses':({(7,390):'moses',(7,423):'moses',(7,434):'moses',(7,531):'moses'},None),
 'Isis':({(7,432):'isis'},None),
 'Michelangelo':({(7,390):'michelangelo'},None),
 'Chatterton':({(7,119):'chatterton'},None),
 'Healy':({(7,412):'tim-healy'},None),
 'Fitzgibbon':({(7,409):'fitzgibbon',(7,411):'fitzgibbon',(7,420):'fitzgibbon'},None),
 # 5:112 has 'the year of the Flood' in the modern edition.
 'Flood':({(7,378):'flood',(7,380):'flood'},None),
 'Kavanagh':({(7,330):'kavanagh'},None),
 # 7:520 is two women in one line: poor Penelope, then Penelope Rich.
 'Penelope':({(7,519):'penelope',(7,520):['penelope','penelope-rich']},None),
 'Gallaher':({(7,326):'ignatius-gallaher',(7,336):'ignatius-gallaher',
              (7,358):'ignatius-gallaher',(7,378):'ignatius-gallaher'},None),
 'Long John':({(7,45):'long-john-fanning'},None),
 'Long John Fanning':({(7,45):'long-john-fanning'},None),
 # Modern edition only: it gives him the surname here.
 'Fanning':({(7,45):'long-john-fanning'},None),
 'Madam Bloom':({(7,314):'molly'},None),
 'Patrick Dignam':({(7,39):'paddy-dignam',(7,99):'paddy-dignam'},None),
 'MacCabe':({(7,479):'florence-maccabe'},None),
 # --- episode 6. The funeral, and the largest named cast in the book so far.
 # Stephen is in this episode and is never named in it: he is seen once from
 # the carriage as a lithe young man clad in mourning.
 'Simon Dedalus':({(4,30):'simon-dedalus',(7,21):'simon-dedalus',(8,141):'simon-dedalus'},None),
 'Simon':({(6,1):'simon-dedalus',(6,66):'simon-dedalus',
         (6,248):'simon-dedalus',(6,278):'simon-dedalus',
         (6,318):'simon-dedalus',(7,21):'simon-dedalus',
         (7,112):'simon-dedalus'},None),
 # The bare surname Power is Power's whiskey in episode 11, so only the full
 # form is keyed. Mr Dedalus calls him Jack at the graveside.
 'Mr Power':({(6,0):'jack-power',(6,10):'jack-power',(6,28):'jack-power',
            (6,30):'jack-power',(6,34):'jack-power',(6,38):'jack-power',
            (6,47):'jack-power',(6,60):'jack-power',(6,66):'jack-power',
            (6,68):'jack-power',(6,84):'jack-power',(6,86):'jack-power',
            (6,91):'jack-power',(6,99):'jack-power',(6,105):'jack-power',
            (6,107):'jack-power',(6,110):'jack-power',(6,113):'jack-power',
            (6,119):'jack-power',(6,126):'jack-power',(6,134):'jack-power',
            (6,138):'jack-power',(6,144):'jack-power',(6,149):'jack-power',
            (6,162):'jack-power',(6,164):'jack-power',(6,175):'jack-power',
            (6,182):'jack-power',(6,190):'jack-power',(6,194):'jack-power',
            (6,198):'jack-power',(6,206):'jack-power',(6,215):'jack-power',
            (6,218):'jack-power',(6,223):'jack-power',(6,235):'jack-power',
            (6,237):'jack-power',(6,277):'jack-power',(6,280):'jack-power',
            (6,315):'jack-power',(6,370):'jack-power',(6,371):'jack-power'},None),
 'Martin':({(6,0):'martin-cunningham',(6,5):'martin-cunningham',
          (6,11):'martin-cunningham',(6,28):'martin-cunningham',
          (6,31):'martin-cunningham',(6,36):'martin-cunningham',
          (6,40):'martin-cunningham',(6,41):'martin-cunningham',
          (6,45):'martin-cunningham',(6,48):'martin-cunningham',
          (6,59):'martin-cunningham',(6,64):'martin-cunningham',
          (6,66):'martin-cunningham',(6,67):'martin-cunningham',
          (6,69):'martin-cunningham',(6,80):'martin-cunningham',
          (6,83):'martin-cunningham',(6,96):'martin-cunningham',
          (6,107):'martin-cunningham',(6,114):'martin-cunningham',
          (6,128):'martin-cunningham',(6,131):'martin-cunningham',
          (6,133):'martin-cunningham',(6,135):'martin-cunningham',
          (6,141):'martin-cunningham',(6,146):'martin-cunningham',
          (6,157):'martin-cunningham',(6,161):'martin-cunningham',
          (6,163):'martin-cunningham',(6,165):'martin-cunningham',
          (6,167):'martin-cunningham',(6,168):'martin-cunningham',
          (6,174):'martin-cunningham',(6,176):'martin-cunningham',
          (6,187):'martin-cunningham',(6,193):'martin-cunningham',
          (6,196):'martin-cunningham',(6,208):'martin-cunningham',
          (6,219):'martin-cunningham',(6,223):'martin-cunningham',
          (6,233):'martin-cunningham',(6,236):'martin-cunningham',
          (6,240):'martin-cunningham',(6,254):'martin-cunningham',
          (6,319):'martin-cunningham',(6,321):'martin-cunningham',
          (6,327):'martin-cunningham',(6,329):'martin-cunningham',
          (6,387):'martin-cunningham',(6,394):'martin-cunningham',
          (6,396):'martin-cunningham',(6,399):'martin-cunningham'},None),
 'Kernan':({(6,226):'tom-kernan',(6,240):'tom-kernan',(6,244):'tom-kernan',
          (6,284):'tom-kernan',(6,286):'tom-kernan',(6,288):'tom-kernan',
          (6,290):'tom-kernan',(6,293):'tom-kernan',(6,300):'tom-kernan',
          (6,302):'tom-kernan'},None),
 'Menton':({(6,256):'john-henry-menton',(6,303):'john-henry-menton',
          (6,306):'john-henry-menton',(6,311):'john-henry-menton',
          (6,313):'john-henry-menton',(6,319):'john-henry-menton',
          (6,388):'john-henry-menton',(6,393):'john-henry-menton',
          (6,395):'john-henry-menton',(6,397):'john-henry-menton',(8,79):'john-henry-menton',(8,110):'john-henry-menton'},None),
 'John Henry':({(6,257):'john-henry-menton'},None),
 'Corny':({(6,34):'corny-kelleher',(6,190):'corny-kelleher'},None),
 # 6:24 names Richie first and then the firm: Goulding, Collis and Ward.
 'Goulding':({(6,24):['richie-goulding',None],(8,110):'richie-goulding'},None),
 # Reuben J Dodd, and Mr Dedalus calling him Barabbas.
 'Reuben':({(6,108):'reuben-j',(6,118):'reuben-j',(6,129):'reuben-j',
            (6,133):'reuben-j',(8,364):'reuben-j'},None),
 'Barabbas':({(6,125):'reuben-j'},None),
 # 8:336 is Gray's confectioner's window and 6:330 is a grey sprouting beard.
 # The modern edition spells the knight Grey.
 # 7:358 is Gregor Grey, who made the design, and has his own alias.
 'Gr[ae]y':({(6,113):'john-gray',(7,535):'john-gray'},None),
 # 13:93 is Cuffe street.
 'Cuffe':({(6,184):'joe-cuffe'},None),
 # 9:174 is Mr Simon Lazarus, as some aver Sidney Lee's name is.
 'Lazarus':({(6,296):'lazarus'},None),
 # 2:128 and 8:144 are Albert Edward, prince of Wales.
 'Albert':({(6,247):'prince-albert'},None),
 # 7:232 and 7:358 are Paddy Hooper of the newspaper office.
 'Hooper':({(6,376):'alderman-hooper',(7,232):'paddy-hooper',
            (7,358):'paddy-hooper'},None),
 # The second Friday in the sentence is the day of the week.
 'Friday':({(6,337):['crusoe-friday',None]},None),
 # Bloom says the word for the coat; Hynes writes it down as a name. The modern
 # edition spells the garment Mackintosh.
 'Mac[k]?intosh':({(6,359):'macintosh'},None),
 'M[\u2019\']Intosh':({(6,360):'macintosh'},None),
 # The italic setting of "That's not Mulcahy" hides 6:325 from the alias.
 'Mulcahy':({(6,325):'terence-mulcahy'},None),
 'C(?:\u00e6|ae)sar':({(6,337):'julius-caesar'},None),
 'Charley':({(6,355):'mccoy',(6,356):'mccoy'},None),
 # 5:148 is the man of the song; four other M'Carthys are four other men.
 'M[’\']Carthy':({(5,148):'mccarthy-of-the-song'},None),

 # The mother is unnamed in episode 1 and is bound where the text makes her the
 # subject: the dream, the deathbed, the bowl of bile, the ghostcandle.
 'mother':({(1,39):'may-dedalus',(1,41):'may-dedalus',(1,52):'may-dedalus',
            (1,80):'may-dedalus',(1,85):'may-dedalus',(1,89):'may-dedalus',
            (1,91):'may-dedalus',(1,117):'may-dedalus',
            # 3:21 is Walter's mother, who is aunt Sara; 3:50 is Stephen's own,
            # sending him eight shillings by money order in Paris.
            # 3:53 is the aunt's charge: you killed your mother.
            (3,21):'aunt-sara',(3,50):'may-dedalus',(3,53):'may-dedalus',
            # 6:25 is 'the help of God and His blessed mother'.
            (6,25):'blessed-virgin',
            # 7:294 is Mulligan's jibe again: whose mother is beastly dead.
            (7,294):'may-dedalus',(8,9):'may-dedalus'},None),
 # ---- episode 8. Every name below was listed across all 18 episodes before
 # being keyed; the comment says what the other occurrences are.
 # The prophet on Dowie's handbill, and again on the ball of paper thrown to
 # the gulls. 12:565 is Christ's cry from the cross and 15:608 is Dowie in
 # person, so the name is keyed and not aliased.
 'Elijah':({(8,5):'elijah',(8,14):'elijah'},None),
 # The second half of "Torry and Alexander". Every other Alexander in the book
 # is Alexander Keyes, Alexander J Dowie or archbishop William Alexander.
 'Alexander':({(8,7):'alexander-evangelist'},None),
 # 12:240 is the Irish Caruso-Garibaldi, where the hyphen defeats the guard.
 'Garibaldi':({(8,133):'garibaldi'},None),
 # The king who choked at Sletty. 12:312 is the tribe of Cormac and 17:7 is
 # the same king again, under his full name Cormac MacArt.
 'Cormac':({(8,179):'cormac'},None),
 # Noah's son, in the pun on the potted meats. 4:16 is ham and eggs.
 'Ham':({(8,208):'ham'},None),
 # The goddesses in the round hall. Venus is a statue, a planet and half a
 # dozen epithets elsewhere in the book; Juno is Juno's eyes in episode 9.
 'Venus':({(8,260):'venus'},None),
 'Juno':({(8,260):'juno'},None),
 # The archduke Otto of the Habsburg story. 17:108 is Thomas Otto, harlequin.
 'Otto':({(8,255):'archduke-otto'},None),
 # The owner of the filly. Elsewhere the name is the banking house.
 'Rothschild':({(8,250):'rothschild'},None),
 # Old Harris the optician, whose shop it is. 9:181 is Frank Harris on
 # Shakespeare, 15:869 is Harris Rosenberg, 17:463 is Harris tweed.
 'Harris':({(8,148):'harris'},None),
 # The park ranger. 12:274 is Stubbs's, the trade gazette.
 'Stubbs':({(8,112):'stubbs'},None),
 # Whelan of the Express. 15:617 and 17:108 are other Whelans.
 'Whelan':({(8,112):'whelan'},None),
 # Coffey the butcher, who has the right to venison. Father Coffey of episode
 # 6 carries his own alias and is a different man.
 'Coffey':({(8,255):'coffey-butcher'},None),
 'Dubedat':({(8,255):'dubedat'},None),
 # Rock the head bailiff at the Burton bar. The other occurrences are Maiden's
 # Rock, Three Rock mountain and the pineapple rock of the first sentence.
 'Rock':({(8,189):'rock'},None),
 # Tommy Moore over the urinal. 8:255 is Moore street and episode 9 is George
 # Moore the novelist, so the surname is keyed to this one paragraph.
 'Moore':({(8,121):'tom-moore'},None),
 # The song's chief, whose name sits inside Gutenberg italics in the older
 # edition, where the trailing underscore defeats the alias guard.
 'MacTrigger':({(8,208):'mactrigger',(8,223):'mactrigger'},None),
 'Don Giovanni':({(8,325):'don-giovanni',(8,330):'don-giovanni'},None),
 # Nosey Flynn by his bare surname. The guard lets "Flynn" through inside
 # "O'Flynn", so the name can never be aliased: 8:198, 12:513 and 15:1340 are
 # Father O'Flynn, and 13:88 and 12:349 are outside the read episodes.
 'Flynn':({(8,205):'nosey-flynn',(8,241):'nosey-flynn',
           (8,260):'nosey-flynn',(8,323):'nosey-flynn'},None),
 'Father O[’\']Flynn':({(8,198):'father-oflynn'},None),
 'Jack Power':({(8,122):'jack-power'},None),
 # Denis Breen by his first name, in his wife's mouth.
 'Denis':({(8,103):'denis-breen'},None),
 # Theodore Purefoy, named only by his first name and his cousin in the castle.
 'Theodore':({(8,113):'theodore-purefoy'},None),
 'Blazes Boylan':({(8,228):'blazes-boylan'},None),
 'Blazes':({(8,238):'blazes-boylan'},None),
 'Richie Goulding':({(8,110):'richie-goulding'},None),
}

# Figures the text names only by a description. (episode, paragraph) -> [(pattern, id)]
PHRASE={
 (1,15):[(r'the aunt','mulligan-aunt')],
 (1,39):[(r'The aunt','mulligan-aunt')],
 (1,59):[(r'The aunt','mulligan-aunt')],
 (1,83):[(r'Your mother','mulligan-mother')],
 (1,173):[(r'an entering form','milkwoman')],
 (1,176):[(r'An old woman','milkwoman')],
 (1,181):[(r'the old woman','milkwoman')],
 (1,188):[(r'the old woman','milkwoman')],
 (1,193):[(r'the old woman','milkwoman')],
 (1,199):[(r'the old woman','milkwoman')],
 (1,201):[(r'the old woman','milkwoman')],
 (1,210):[(r'the old woman','milkwoman')],
 (1,239):[(r'milkwoman|milk woman','milkwoman')],
 # episode 2: the boy's full name on the copybook, his mother, and Deasy's
 # ancestor, who is called sir John only in Stephen's vision of the squire.
 (2,66):[(r'Cyril Sargent','sargent')],
 (2,73):[(r'someone','sargent-mother')],
 (2,136):[(r'[Ss]ir John','sir-john-blackwood')],
 # The ashplant calling his name down the path: his own name, drawn out, and the
 # only mention of Stephen in the book that no alias can match.
 (1,306):[(r'Ste+phen','stephen')],
 (1,321):[(r'businessman','cliff-businessman'),(r'boatman','cliff-boatman')],
 (1,323):[(r'The boatman','cliff-boatman')],
 (1,325):[(r'The man that was drowned','drowned-man'),(r'The man who drowned','drowned-man')],
 (1,326):[(r'A young man','creek-young-man')],
 (1,327):[(r'the brother','mulligan-brother')],
 (1,331):[(r'An elderly man','creek-elderly-man')],
 (1,333):[(r'the young man','creek-young-man')],
 (1,348):[(r'The young man','creek-young-man')],
 # episode 3: the people the text gives only a description, and the places
 # where the two editions describe the same person in different words.
 (3,1):[(r'Los Demiurgos','demiurge'),(r'God the Creator','demiurge')],
 (3,11):[(r'My consubstantial father','simon-dedalus'),(r'My father','simon-dedalus'),
         (r'The drunken little costdrawer','richie-goulding'),
         (r'The drunken little penny-pincher','richie-goulding'),
         (r'his brother,? the cornet player','goulding-cornet-brother'),
         (r'his father','richie-goulding')],
 (3,53):[(r'The aunt','mulligan-aunt')],
 (3,54):[("Mulligan['’]s aunt",'mulligan-aunt')],
 (3,56):[(r'A handsome man','belluomo')],
 (3,57):[(r'The froeken','the-froeken'),(r'The Scandinavian girl','the-froeken')],
 (3,58):[(r'the head centre','head-centre'),(r'the rebel leader','head-centre')],
 (3,59):[('madame in rue Gît-le-Cœur','egan-wife'),
         (r'the madam on the Street of the Lying Heart','egan-wife')],
 (3,63):[(r'the panthersahib','haines'),(r'the panther-dreaming Englishman','haines'),
         (r'his pointer','mulligan'),(r'his gun dog','mulligan')],
 (3,65):[(r'Some giant','sir-lout')],
 (3,66):[(r'The two maries','two-maries'),(r'The two Marys','two-maries')],
 (3,68):[("The Bruce['’]s brother",'bruce-brother'),
         (r'The man that was drowned','drowned-man'),(r'The man who drowned','drowned-man')],
 (3,69):[(r'A woman','cocklepicker-woman'),(r'a man','cocklepicker-man')],
 (3,73):[(r'his master','cocklepicker-man')],
 (3,75):[(r'the ruffian','cocklepicker-man'),(r'the rogue','cocklepicker-man'),
         (r'his strolling mort','cocklepicker-woman'),
         (r'his wandering woman','cocklepicker-woman')],
 (3,82):[(r'bishop of Cloyne','berkeley'),(r'Bishop Berkeley','berkeley')],
 (3,83):[(r'The virgin at Hodges Figgis','bookshop-woman'),
         (r'The young woman at the bookshop','bookshop-woman')],
 # episode 4
 (4,13):[('Hanlon[’\']s milkman','hanlon-milkman'),(r'the milkman','hanlon-milkman')],
 (4,24):[(r'her father','major-tweedy')],
 (4,40):[(r'the next-?door girl','nextdoor-girl')],
 (4,41):[(r'The ferreteyed porkbutcher','dlugacz'),(r'The sharp-eyed pork butcher','dlugacz')],
 (4,43):[(r'The porkbutcher','dlugacz'),(r'The pork butcher','dlugacz')],
 (4,44):[(r'my miss','nextdoor-girl')],
 (4,46):[(r'my miss','nextdoor-girl')],
 (4,57):[(r'that Norwegian captain','norwegian-captain')],
 (4,134):[(r'Papli','leopold'),(r'Daddy','leopold')],
 (4,135):[(r'mummy','molly')],
 (4,157):[(r'The maid','nextdoor-girl')],
 (4,160):[(r'my miss','nextdoor-girl')],
 # episode 5
 (5,0):[(r'a boy for the skins','skins-boy'),
        (r'a boy employed to collect animal skins','skins-boy'),
        (r'A smaller girl','caskhoop-girl')],
 (5,6):[(r'the postmistress','the-postmistress')],
 (5,7):[(r'The postmistress','the-postmistress')],
 # The modern edition writes 'My wife' where M'Coy says 'My missus'. Two
 # paragraphs later Bloom answers with 'My wife too', which is Molly.
 (5,45):[(r'My missus','mccoy-wife'),(r'My wife','mccoy-wife')],
 (5,48):[(r'My wife','molly')],
 (5,63):[(r'My missus','mccoy-wife'),(r'My wife','mccoy-wife')],
 (5,65):[(r'Poor papa','rudolph-bloom'),(r'Poor Papa','rudolph-bloom')],
 (5,68):[(r'Poor papa','rudolph-bloom'),(r'Poor Papa','rudolph-bloom')],
 (5,83):[(r'Those two sluts','coombe-sluts'),(r'Those two rough girls','coombe-sluts')],
 (5,87):[(r'the two sluts','coombe-sluts'),(r'The two rough girls','coombe-sluts')],
 # Bloom's inventory of the mass: the virgin twice under two names.
 (5,107):[(r'Glorious and immaculate virgin','blessed-virgin'),
          (r'Hail Mary','blessed-virgin'),(r'Holy Mary','blessed-virgin')],
 (5,114):[(r'The chemist','the-chemist')],
 (5,121):[(r'the old queen','queen-victoria'),(r'the old Queen','queen-victoria')],
 (5,122):[(r'the chemist','the-chemist')],
 (5,127):[(r'the chemist','the-chemist')],
 # episode 6
 (6,6):[(r'an old woman peeping','peeping-woman')],
 (6,14):[(r'a lithe young man','stephen'),(r'a slim young man','stephen')],
 (6,17):[(r'Your son and heir','stephen')],
 (6,101):[(r'a dullgarbed old man','ocallaghan'),
          (r'a shabbily dressed old man','ocallaghan')],
 (6,106):[(r'the [Ll]iberator','oconnell')],
 (6,118):[(r'the son','reuben-son')],
 (6,127):[(r'the son himself','reuben-son')],
 (6,129):[(r'the young chiseller','reuben-son'),(r'the young rascal','reuben-son')],
 (6,131):[(r'A boatman','liffey-boatman')],
 (6,133):[(r'his son','reuben-son'),(r'the boatman','liffey-boatman')],
 (6,171):[(r'For my son Leopold','rudolph-bloom')],
 (6,226):[(r'the boy','dignam-son')],
 (6,231):[(r'the brother-in-law','dignam-brother-in-law')],
 (6,236):[(r'His father','rudolph-bloom')],
 (6,244):[(r'the poor wife','mrs-dignam')],
 (6,255):[(r'the eldest boy','dignam-son')],
 (6,260):[(r'the boy with the wreath','dignam-son')],
 (6,262):[(r'A server','mortuary-server'),(r'An altar server','mortuary-server')],
 (6,270):[(r'The server','mortuary-server')],
 (6,274):[(r'the boy','dignam-son'),(r'the brother-in-law','dignam-brother-in-law'),
          (r'the server','mortuary-server')],
 (6,318):[(r'the caretaker','john-oconnell')],
 (6,322):[(r'The caretaker','john-oconnell')],
 (6,323):[(r'the widow','mulcahy-widow')],
 (6,324):[(r'The caretaker','john-oconnell')],
 (6,334):[(r'the caretaker','john-oconnell')],
 (6,336):[(r'The caretaker','john-oconnell')],
 (6,345):[(r'poor [Pp]apa','rudolph-bloom')],
 (6,346):[(r'The boy','dignam-son'),(r'the portly kindly caretaker','john-oconnell'),
          (r'the portly, kindly caretaker','john-oconnell')],
 (6,348):[(r'poor [Mm]amma','ellen-bloom')],
 (6,351):[(r'The caretaker','john-oconnell')],
 (6,367):[(r'The boy','dignam-son'),(r'the brother-in-law','dignam-brother-in-law')],
 (6,386):[(r'Poor [Pp]apa','rudolph-bloom')],
 # episode 7
 (7,99):[(r'Poor [Pp]apa','rudolph-bloom')],
 (7,197):[(r'the cringing urchin','the-newsboy')],
 (7,201):[(r'the newsboy','the-newsboy')],
 (7,205):[(r'the boy','the-newsboy')],
 # ---- episode 8
 (8,0):[(r'A sugarsticky girl','sweetshop-girl'),(r'A sugar-sticky girl','sweetshop-girl'),
        (r'[Cc]hristian [Bb]rother','christian-brother')],
 (8,1):[(r'A sombre Y\.\s?M\.\s?C\.\s?A\.\s?young man','ymca-young-man')],
 (8,9):[(r'daughter','dedalus-daughter'),(r'the father','simon-dedalus')],
 (8,10):[(r'that poor child','dedalus-daughter')],
 # The older edition writes Reuben J's son; the modern edition supplies the
 # surname and writes Reuben J. Dodd's son.
 (8,12):[(r'Reuben J’s son','reuben-son'),(r"Reuben J\. Dodd's son",'reuben-son')],
 (8,21):[(r'the old apple ?woman','applewoman')],
 (8,34):[(r'[Bb]ig Ben','ben-dollard')],
 # Lot's wife is named in the modern edition only; the older text has just
 # the two words Pillar of salt.
 (8,35):[(r'Y lagging behind','sandwichman-y'),(r'The Y man, lagging behind','sandwichman-y'),
         (r'a nice nun','tranquilla-nun'),(r"Lot's wife",'lots-wife')],
 (8,37):[(r'[Pp]apa','rudolph-bloom')],
 (8,39):[(r'the dayfather','monks'),(r'the day-shift man','monks')],
 (8,63):[(r'A barefoot arab','barefoot-arab'),(r'A barefoot street urchin','barefoot-arab')],
 (8,99):[(r'A bony form','farrell'),(r'A bony figure','farrell')],
 (8,112):[(r'That one at the Grosvenor','grosvenor-woman'),
          (r'pug ?-?nosed driver','pugnosed-driver')],
 (8,113):[(r'Methodist husband','theodore-purefoy')],
 (8,116):[(r'[Oo]ld woman that lived in a shoe','old-woman-in-a-shoe'),
          (r'old woman who lived in a shoe','old-woman-in-a-shoe')],
 (8,118):[(r'(?<=’s )son','tom-wall-son'),(r"(?<='s )son",'tom-wall-son')],
 (8,122):[(r'father a G man','power-father'),
          (r'his father was a plainclothes detective','power-father'),
          (r'That horsepoliceman','horsepoliceman'),(r'That mounted policeman','horsepoliceman')],
 (8,127):[(r'Peeping Tom','peeping-tom')],
 (8,133):[(r'[Tt]urnkey[’\']s daughter','turnkey-daughter')],
 (8,141):[(r'the brother','john-howard-parnell')],
 (8,143):[(r'Beard and bicycle','russell')],
 (8,145):[(r'the high figure in homespun','russell'),(r'the tall figure in homespun','russell')],
 (8,148):[(r'that farmer[’\']s daughter','farmers-daughter')],
 (8,189):[(r'An illgirt server','burton-server'),(r'A dishevelled waiter','burton-server')],
 (8,220):[(r'The curate','davy-byrne-curate'),(r'The barman','davy-byrne-curate')],
 (8,236):[(r'that soldier in the Portobello [Bb]arracks','portobello-soldier'),
          (r'the little kipper','myler-keogh'),(r'the little fighter','myler-keogh')],
 (8,270):[(r'(?<=Nolan’s )wife','nolan-wife'),(r"(?<=Nolan's )wife",'nolan-wife')],
 (8,283):[(r'one of the saint Legers of Doneraile','saint-leger-woman'),
          (r'one of the St Legers of Doneraile','saint-leger-woman')],
 (8,335):[(r'a drowsing loafer','drowsing-loafer'),(r'a drowsy loafer','drowsing-loafer')],
 (8,336):[(r'[Pp]apa','rudolph-bloom')],
 (8,337):[(r'A blind stripling','blind-stripling'),(r'A blind young man','blind-stripling')],
 (8,339):[(r'The blind stripling','blind-stripling'),(r'The blind young man','blind-stripling')],
 (8,343):[(r'the stripling','blind-stripling'),(r'the young man','blind-stripling')],
 (8,353):[(r'The blind stripling','blind-stripling'),(r'The blind young man','blind-stripling')],
 (8,360):[(r'the blind man','blind-stripling')],
 (8,365):[(r'His Excellency the [Ll]ord [Ll]ieutenant','lord-lieutenant')],
}

# (matched text, episode, paragraph) -> the alias hit is dropped there
SUPPRESS={
 # 1:35 and 1:37 are the sea, called a great sweet mother and our mighty mother,
 # not Stephen's; 1:83 is Mulligan's mother, who has her own card.
 ('mother',1,35),('mother',1,37),('mother',1,83),
 # Two places outside episode 1 where the alias "Stephen" is not the man, found
 # by listing every occurrence in the book before trusting the alias: 17:39 is
 # 16 Stephen's Green, the Dublin square, and 15:407 is Saint Stephen's day in
 # the wren-boys' song. Both editions agree in both places.
 ('Stephen',17,39),('Stephen',15,407),
 # And three where the alias is not Buck Mulligan: 10:349 is John Mulligan, the
 # manager of the Hibernian bank, who gave Bloom a sharp eye on Carlisle bridge;
 # 12:50 is the ardri Malachi, the high king, in the list of Irish heroes; and
 # 12:513 is Saint Malachy walking with Saint Patrick in the procession.
 ('Mulligan',10,349),('Malachi',12,50),('Malachi',12,513),
 # 1:45 is the sea again, hailed as a great sweet mother by the wellfed voice;
 # 1:155 and 1:162 are "mother Grogan", where the word is part of her name and
 # the Grogan key carries the span; 1:288 is the jew mother of Mulligan's ballad.
 ('mother',1,45),('mother',1,155),('mother',1,162),('mother',1,288),
 # 3:67 is the high king Malachi who wore the collar of gold, not Buck.
 ('Malachi',3,67),
 # 11:465 is the money Bloom spent in the pub -- Seven Davy Byrne's -- in a
 # column of the day's expenses, not the publican himself.
 ('Davy Byrne',11,465),
}

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
 for pat,id in PHRASE.get((ch,pi),()):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 return out

def compile_package():return assemble('ulysses',bind)
if __name__=='__main__':run('ulysses','Ulysses',bind)
