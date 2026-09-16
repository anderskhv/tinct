"""Reviewed bindings for Ulysses.

Joyce in both editions, 18 episodes, 7,148 paragraphs per edition. Episodes 1 to
12 are authored; episodes 13-18 are not.

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
           (7,258):'stephen',(7,497):'stephen',(8,9):'simon-dedalus',(9,136):'stephen',(9,181):'stephen',(9,224):'stephen',(9,355):'stephen',(10,504):'stephen',(11,120):'simon-dedalus',(11,136):'simon-dedalus',(11,143):'simon-dedalus',(11,152):'simon-dedalus',(11,176):'simon-dedalus',(11,178):'simon-dedalus',(11,182):'simon-dedalus',(11,188):'simon-dedalus',(11,196):'simon-dedalus',(11,290):'simon-dedalus',(11,293):'simon-dedalus',(11,299):'simon-dedalus',(11,303):'simon-dedalus',(11,306):'simon-dedalus',(11,314):'simon-dedalus',(11,316):'simon-dedalus',(11,327):'simon-dedalus',(11,343):'simon-dedalus',(11,356):'simon-dedalus',(11,366):'simon-dedalus',(11,384):'simon-dedalus',(11,397):'simon-dedalus',(11,439):'simon-dedalus',(11,440):'simon-dedalus',(11,443):'simon-dedalus',(11,460):'simon-dedalus',(11,506):'simon-dedalus',(11,566):'simon-dedalus',(11,575):'simon-dedalus',(11,595):'simon-dedalus',(11,607):'simon-dedalus',(11,619):'simon-dedalus'},None),
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
              (7,168):'simon-dedalus',(9,136):'stephen',(9,181):'stephen',(9,355):'stephen',(10,300):'simon-dedalus',(10,302):'simon-dedalus',(10,307):'simon-dedalus',(10,309):'simon-dedalus',(10,311):'simon-dedalus',(10,314):'simon-dedalus',(10,318):'simon-dedalus',(10,323):'simon-dedalus',(10,326):'simon-dedalus',(10,329):'simon-dedalus',(10,332):'simon-dedalus',(10,335):'simon-dedalus',(10,340):'simon-dedalus',(10,348):'simon-dedalus',(10,405):'simon-dedalus',(10,407):'simon-dedalus',(10,409):'simon-dedalus',(10,411):'simon-dedalus',(10,414):'simon-dedalus',(10,418):'simon-dedalus',(10,421):'simon-dedalus',(10,424):'simon-dedalus',(10,431):'simon-dedalus',(10,446):'simon-dedalus',(10,303):'simon-dedalus',(11,136):'simon-dedalus',(11,143):'simon-dedalus',(11,152):'simon-dedalus',(11,176):'simon-dedalus',(11,178):'simon-dedalus',(11,182):'simon-dedalus',(11,188):'simon-dedalus',(11,196):'simon-dedalus',(11,290):'simon-dedalus',(11,293):'simon-dedalus',(11,299):'simon-dedalus',(11,303):'simon-dedalus',(11,306):'simon-dedalus',(11,314):'simon-dedalus',(11,316):'simon-dedalus',(11,327):'simon-dedalus',(11,343):'simon-dedalus',(11,356):'simon-dedalus',(11,366):'simon-dedalus',(11,460):'simon-dedalus',(11,506):'simon-dedalus',(11,575):'simon-dedalus',(11,595):'simon-dedalus',(11,607):'simon-dedalus'},None),
 # 12:513 is S. Ursula of the eleven thousand virgins, a different woman.
 'Ursula':({(1,59):'ursula',(12,513):'saint-ursula'},None),
 # 9:294 is Aubrey the theatre owner in the Shakespeare argument.
 'Aubrey':({(1,70):'aubrey-oxford',(9,294):'john-aubrey'},None),
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
                 (6,168):'shakespeare',(6,333):'shakespeare',(8,16):'shakespeare',(9,18):'shakespeare',(9,19):'shakespeare',(9,44):'shakespeare',(9,46):'shakespeare',(9,64):'shakespeare',(9,66):'shakespeare',(9,98):'shakespeare',(9,103):'shakespeare',(9,154):'shakespeare',(9,163):'shakespeare',(9,171):'shakespeare',(9,181):'shakespeare',(9,198):'shakespeare',(9,201):'shakespeare',(9,256):'shakespeare',(9,287):'shakespeare',(9,364):'shakespeare',(9,381):'shakespeare',(9,383):'shakespeare',(9,390):'shakespeare',(9,69):['shakespeare',None,None],(9,184):'shakespeare',(9,328):'shakespeare',(9,423):'shakespeare',(10,506):'shakespeare',(11,474):'shakespeare',(12,50):'shakespeare'},None),
 'Hamlet':({(1,232):'hamlet',(1,269):'hamlet',(1,275):'hamlet',(2,74):'hamlet',
           (3,79):'hamlet',(5,65):'hamlet',(6,333):'hamlet',(7,154):'hamlet',(8,17):'hamlet',(9,18):'hamlet',(9,19):['hamlet', 'hamlet'],(9,28):'hamlet',(9,42):[None, None],(9,59):'king-hamlet',(9,67):'hamlet',(9,68):'hamlet',(9,69):'hamlet',(9,154):'hamlet',(9,159):'hamlet',(9,186):'king-hamlet',(9,207):'hamlet',(9,333):'hamlet',(9,391):['king-hamlet', 'hamlet', 'hamlet'],(9,427):'hamlet',(9,51):'hamlet'},None),
 # Joseph is Joseph the Joiner at 1:288 and 1:295 and eleven other men elsewhere.
 'Joseph':({(1,288):'joseph-the-joiner',(1,295):'joseph-the-joiner',
            (3,43):'joseph-the-joiner',(5,107):'joseph-the-joiner',(12,513):'joseph-the-joiner'},None),
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
 'Curran':({(2,123):'curran',(12,172):'curran'},None),
 # 10:235 is Temple bar. 3:35 is the same man, in an episode not yet read.
 'Temple':({(2,123):'temple',(3,35):'temple'},None),
 # 8:111 and 8:144 name him in full: the eminent poet A. E., Mr Geo. Russell.
 'Russell':({(2,123):'russell',(8,111):'russell',(8,144):'russell',(9,19):'russell',(9,40):'russell',(9,70):'russell',(9,121):'russell',(9,129):'russell',(9,144):'russell',(9,314):'russell'},None),
 # 7:42 is Phil Blake's weekly Pat and Bull story.
 # 7:42 is Phil Blake of the weekly Pat and Bull story.
 'Blake':({(2,6):'blake',(7,42):'phil-blake',(9,32):'blake'},None),
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
             (6,374):'parnell',(8,134):'parnell',(8,141):'parnell',(10,496):'parnell',(12,57):'parnell'},None),
 'Helen':({(2,174):'helen',(7,276):'helen',(7,519):'helen',(9,256):'helen'},None),
 'Albert Edward':({(2,128):'albert-edward'},None),
 # 4:29 to 4:33 are Larry O'Rourke the publican on the corner of Dorset
 # street, a different man entirely.
 'O[’\']Rourke':({(2,174):'orourke',(7,276):'orourke',(4,29):'larry-orourke',(4,30):'larry-orourke',
                 (4,31):'larry-orourke',(4,33):'larry-orourke',(11,494):'larry-orourke'},None),

 # --- episode 3. Same rule: every one of these is somebody else somewhere in
 # the book, or would be if the name were let loose, so each is keyed.
 # Richie Goulding is Stephen's uncle here; at 9:375 and 9:391 "nuncle Richie"
 # is Richard Shakespeare, in the argument about the brothers.
 'Richie':({(3,17):'richie-goulding',(3,21):'richie-goulding',(3,24):'richie-goulding',
            (3,25):'richie-goulding',(3,26):'richie-goulding',
            (6,24):'richie-goulding',(9,375):'richard-shakespeare',(9,391):'richard-shakespeare',(11,228):'richie-goulding',(11,237):'richie-goulding',(11,292):'richie-goulding',(11,307):'richie-goulding',(11,334):'richie-goulding',(11,373):'richie-goulding',(11,375):'richie-goulding',(11,376):'richie-goulding',(11,380):'richie-goulding',(11,383):'richie-goulding',(11,385):'richie-goulding',(11,396):'richie-goulding',(11,400):'richie-goulding',(11,414):'richie-goulding',(11,434):'richie-goulding',(11,438):'richie-goulding',(11,440):'richie-goulding',(11,468):'richie-goulding',(11,512):'richie-goulding',(11,521):'richie-goulding',(11,537):'richie-goulding',(11,578):'richie-goulding',(11,627):'richie-goulding'},None),
 # 12:172 is Sara Curran of the Tommy Moore song and 14:57 is the Sara of a lay.
 'Sara':({(3,11):'aunt-sara',(3,41):'aunt-sara',(12,172):'curran'},None),
 # 6:22 is the same woman, in an episode not yet read.
 'Sally':({(3,11):'aunt-sara',(6,22):'aunt-sara'},None),
 # 8:140 is Walter Sexton, 9:256 and 15:394 are Sir Walter Raleigh, 11:483 is
 # Walter Bapty; 11:385 is this Walter, crosseyed, in an unread episode.
 'Walter':({(3,11):'walter-goulding',(3,15):'walter-goulding',(3,19):'walter-goulding',
            (3,28):'walter-goulding',(11,385):'walter-goulding'},None),
 'Crissie':({(3,22):'crissie-goulding',(6,22):'crissie-goulding'},None),
 # 7:479 names the same two midwives again, in an episode not yet read.
 'Mrs Florence MacCabe':({(3,6):'florence-maccabe'},None),
 '(?:Patk|Patrick) MacCabe':({(3,6):'patk-maccabe'},None),
 # Simon Dedalus is named Si five times in episode 11; here he is only a voice.
 'Si':({(3,11):'simon-dedalus',(11,397):'simon-dedalus',(11,438):'simon-dedalus',(11,439):'simon-dedalus',(11,440):'simon-dedalus',(11,441):'simon-dedalus',(11,526):'simon-dedalus',(11,619):'simon-dedalus',(11,627):'simon-dedalus'},None),
 # 16:105 is another Egan, the one Cunningham would work a pass through.
 'Egan':({(3,59):'kevin-egan'},None),
 # Pat is bald Pat the waiter through the whole of episode 11, Pat Dignam in
 # four episodes, Pat Farrell, Pat Claffey, Pat Kinsella, Pat Tobin. Here twice
 # it is Kevin Egan's son: tell Pat you saw me; I wanted to get poor Pat a job.
 'Pat':({(3,59):'patrice',(8,160):'pat-kinsella',(11,28):'bald-pat',(11,200):'bald-pat',(11,212):'bald-pat',(11,258):'bald-pat',(11,292):'bald-pat',(11,296):'bald-pat',(11,307):'bald-pat',(11,318):'bald-pat',(11,334):'bald-pat',(11,352):'bald-pat',(11,398):'bald-pat',(11,414):'bald-pat',(11,431):'bald-pat',(11,453):'bald-pat',(11,459):'bald-pat',(11,464):'bald-pat',(11,471):'bald-pat',(11,476):'bald-pat',(11,477):'bald-pat',(11,478):'bald-pat',(11,508):'bald-pat',(11,521):'bald-pat',(11,560):'bald-pat',(11,578):'bald-pat',(11,627):'bald-pat'},None),
 # Eleven other Burkes: O'Madden Burke of the newspaper office, Pisser Burke,
 # Edmund Burke, Burke's public house.
 'Burke':({(3,59):'richard-burke'},None),
 # 14:49 is Victoria Frances, a child of the Purefoy family.
 'Victoria':({(3,57):'queen-victoria',(3,94):'queen-victoria',
              (6,247):'queen-victoria',(8,116):'queen-victoria',(12,85):'queen-victoria',(12,442):'queen-victoria'},None),
 # Modern edition only: it prints the king where Joyce wrote his people. 6:205
 # is the Brian Boru House pub.
 'Brian Boru':({(3,57):'brian-boru'},None),
 # A E is George Russell, already cast from Stephen's list of debts at 2:123.
 # The older edition spells it A E and the modern one A.E., as it does in five
 # later episodes that have not been read.
 # 7:407 is George Russell again, signing himself A. E.
 '(?:A E|A\\.\s?E\\.)':({(3,57):'russell',(7,407):'russell',(8,111):'russell',(8,144):'russell',(9,20):'russell',(9,25):'russell',(9,171):'russell'},None),
 # The high king, not Buck Mulligan and not Saint Malachy: the alias is dropped
 # at 3:67 by SUPPRESS below and the key carries it. 12:50 names him the ardri.
 'Malachi':({(3,67):'king-malachi',(12,50):'king-malachi',(12,513):'saint-malachy'},None),
 # Adam and Eve's is a church and a tavern in five episodes; Adam Findlater,
 # Villiers de l'Isle-Adam and an Adam's apple are three more.
 'Adam':({(3,7):'adam',(3,77):'adam',(12,50):'adam'},None),
 'Eve':({(3,7):'eve',(9,218):'eve',(12,50):'eve'},None),
 # 12:360 is the church of Saint Fiacre in Horto.
 'Fiacre':({(3,51):'fiacre',(12,360):'fiacre',(12,513):'fiacre'},None),
 # 15:991 is a match: STEPHEN: Lucifer. Thanks.
 'Lucifer':({(3,93):'lucifer'},None),
 # 12:177 is Pan Poleaxe Paddyrisky, one of the mock foreign delegates.
 'Pan':({(3,85):'pan'},None),

 # --- episode 4. Bloom arrives, and with him the hardest table in the book:
 # the surname belongs to five people. Leopold, Marion, Milly, Rudolph and
 # Rudy are all Bloom, and 4:38 is Slieve Bloom, a mountain range in Offaly,
 # which is why there is no bare 'Bloom' key at all.
 'Mr Leopold Bloom':({(4,0):'leopold',(11,617):'leopold'},None),
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
         (7,498):'leopold',(7,501):'leopold',(7,314):'molly',(8,204):'leopold',(8,288):'leopold',(10,241):'leopold',(10,252):'leopold',(10,255):'leopold',(10,259):'leopold',(10,263):'leopold',(10,459):'leopold',(11,46):'leopold',(11,88):'leopold',(11,109):'leopold',(11,120):'leopold',(11,130):'leopold',(11,134):'leopold',(11,159):'leopold',(11,203):'leopold',(11,208):'leopold',(11,228):'leopold',(11,237):'leopold',(11,258):'leopold',(11,292):'leopold',(11,298):'leopold',(11,306):'leopold',(11,334):'leopold',(11,335):'leopold',(11,348):'leopold',(11,352):'leopold',(11,372):'leopold',(11,374):'leopold',(11,378):'leopold',(11,381):'leopold',(11,382):'leopold',(11,385):'leopold',(11,398):'leopold',(11,401):'leopold',(11,409):'leopold',(11,410):'leopold',(11,414):'leopold',(11,434):'leopold',(11,436):'leopold',(11,439):'leopold',(11,440):'leopold',(11,443):'leopold',(11,444):'leopold',(11,454):'leopold',(11,456):'leopold',(11,462):'leopold',(11,463):'leopold',(11,464):'leopold',(11,468):'leopold',(11,469):'leopold',(11,470):'leopold',(11,486):'leopold',(11,512):'leopold',(11,521):'leopold',(11,537):'leopold',(11,541):'leopold',(11,559):'leopold',(11,560):'leopold',(11,562):'leopold',(11,565):'leopold',(11,594):'leopold',(11,608):'leopold',(11,611):'leopold',(11,616):'leopold',(11,617):'leopold',(11,621):'leopold',(11,628):'leopold',(12,56):'leopold',(12,120):'leopold',(12,136):'leopold',(12,138):'leopold',(12,152):'leopold',(12,153):'leopold',(12,159):'leopold',(12,166):'leopold',(12,172):'leopold',(12,173):'leopold',(12,175):'leopold',(12,180):'leopold',(12,195):'leopold',(12,197):'leopold',(12,199):'leopold',(12,201):'leopold',(12,217):'leopold',(12,220):'leopold',(12,222):'leopold',(12,238):'leopold',(12,239):'leopold',(12,240):'leopold',(12,246):'leopold',(12,251):'leopold',(12,257):'leopold',(12,259):'leopold',(12,286):'leopold',(12,288):'leopold',(12,292):'leopold',(12,314):'leopold',(12,315):'leopold',(12,318):'leopold',(12,320):'leopold',(12,323):'leopold',(12,334):'leopold',(12,354):'leopold',(12,355):'leopold',(12,381):'leopold',(12,384):'leopold',(12,402):'leopold',(12,405):'leopold',(12,407):'leopold',(12,409):'leopold',(12,413):'leopold',(12,420):'leopold',(12,424):'leopold',(12,429):'leopold',(12,454):'leopold',(12,456):'leopold',(12,479):'leopold',(12,481):'leopold',(12,497):'leopold',(12,565):'leopold',(12,461):['leopold','leopold','rudolph-bloom'],(12,491):'bloom-the-dentist'},None),
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
              (7,494):'leopold',(7,498):'leopold',(7,501):'leopold',(8,1):'leopold',(8,33):'leopold',(8,34):'leopold',(8,43):'leopold',(8,46):'leopold',(8,52):'leopold',(8,56):'leopold',(8,63):'leopold',(8,67):'leopold',(8,72):'leopold',(8,75):'leopold',(8,77):'leopold',(8,85):'leopold',(8,90):'leopold',(8,92):'leopold',(8,97):'leopold',(8,100):'leopold',(8,102):'leopold',(8,106):'leopold',(8,109):'leopold',(8,143):'leopold',(8,158):'leopold',(8,190):'leopold',(8,223):'leopold',(8,229):'leopold',(8,243):'leopold',(8,253):'leopold',(8,315):'leopold',(8,322):'leopold',(8,323):'leopold',(8,336):'leopold',(8,338):'leopold',(8,340):'leopold',(8,341):'leopold',(8,342):'leopold',(8,344):'leopold',(8,354):'leopold',(8,366):'leopold',(10,265):'leopold',(10,272):'leopold',(10,284):'leopold',(10,289):'leopold',(11,159):'leopold',(11,439):'leopold',(11,440):'leopold',(11,454):'leopold',(11,469):'leopold',(11,616):'leopold',(12,461):'leopold'},None),
 'Mrs Marion Bloom':({(4,63):'molly',(5,50):'molly',(11,316):'molly'},None),
 'Mrs Marion':({(4,63):'molly',(4,146):'molly',(11,316):'molly',(11,319):'molly'},None),
 'Marion':({(4,63):'molly',(4,94):'molly',(4,146):'molly',(5,50):'molly',
            (6,305):'molly',(10,161):'marion-woman-in-white',(11,316):'molly',(11,319):'molly',(11,320):'molly',(12,261):'molly',(12,513):'marion-calpensis'},None),
 'Milly Bloom':({(4,86):'milly'},None),
 'Mr and Mrs L\\. M\\. Bloom':({(4,164):'leopold'},None),
 # Poldy is hers for him. Molly is his for her, except where the book uses the
 # name otherwise: the Molly Maguires at 12:364, Molly bawn at 18:3, the songs
 # at 15:10 and 18:4.
 'Poldy':({(4,64):'leopold',(4,80):'leopold',(6,28):'leopold',(10,259):'leopold',(11,307):'leopold',(11,400):'leopold',(11,414):'leopold',(11,590):'leopold'},None),
 'Molly':({(4,27):'molly',(4,57):'molly',(4,87):'molly',
           (5,81):'molly',(5,95):'molly',(5,99):'molly',(5,102):'molly',
           (6,6):'molly',(6,28):'molly',(6,32):'molly',(6,103):'molly',
           (6,266):'molly',(6,330):'molly',(6,388):'molly',(8,33):'molly',(8,35):'molly',(8,36):'molly',(8,45):'molly',(8,81):'molly',(8,105):'molly',(8,116):'molly',(8,118):'molly',(8,162):'molly',(8,253):'molly',(8,333):'molly',(8,356):'molly',(11,330):'molly',(11,348):'molly',(11,499):'molly',(11,528):'molly',(11,545):'molly',(11,614):'molly',(11,616):'molly'},None),
 'Milly':({(4,67):'milly',(4,68):'milly',(4,85):'milly',(4,87):'milly',
           (4,135):'milly',(4,136):'milly',(4,146):'milly',
           (6,32):'milly',(6,56):'milly',(6,204):'milly',(6,376):'milly',(8,36):'milly',(8,37):'milly',(8,42):'milly',(8,46):'milly',(8,211):'milly',(8,255):'milly',(8,349):'milly',(11,458):'milly',(11,534):'milly'},None),
 # 16:19 and 16:23 are Boylan the billsticker, whom nobody in the book connects
 # with this one, and 12:260 is a Mr Boylan in the citizen's deaf-man story.
 'Boylan':({(4,84):'blazes-boylan',(4,95):'blazes-boylan',(4,135):'blazes-boylan',
            (4,165):'blazes-boylan',(6,86):'blazes-boylan',(8,35):'blazes-boylan',(8,255):'blazes-boylan',(10,117):'blazes-boylan',(10,120):'blazes-boylan',(10,122):'blazes-boylan',(10,128):'blazes-boylan',(10,131):'blazes-boylan',(10,134):'blazes-boylan',(10,137):'blazes-boylan',(10,142):'blazes-boylan',(10,170):'blazes-boylan',(10,218):'blazes-boylan',(10,468):'blazes-boylan',(10,542):'blazes-boylan',(10,543):'blazes-boylan',(11,162):'blazes-boylan',(11,164):'blazes-boylan',(11,201):'blazes-boylan',(11,226):'blazes-boylan',(11,230):'blazes-boylan',(11,232):'blazes-boylan',(11,241):'blazes-boylan',(11,250):'blazes-boylan',(11,253):'blazes-boylan',(11,254):'blazes-boylan',(11,256):'blazes-boylan',(11,263):'blazes-boylan',(11,276):'blazes-boylan',(11,278):'blazes-boylan',(11,281):'blazes-boylan',(11,284):'blazes-boylan',(11,336):'blazes-boylan',(11,432):'blazes-boylan',(11,494):'blazes-boylan',(11,500):'blazes-boylan',(12,260):'blazes-boylan',(12,348):'blazes-boylan'},None),
 # Master Patrick Aloysius Dignam is his son, in episodes 10 and 15.
 'Dignam':({(4,31):'paddy-dignam',(4,117):'paddy-dignam',(4,172):'paddy-dignam',
            (5,19):'paddy-dignam',(5,28):'paddy-dignam',(5,34):'paddy-dignam',
            (6,74):'paddy-dignam',(6,197):'paddy-dignam',(6,204):'paddy-dignam',
            (6,271):'paddy-dignam',(6,339):'paddy-dignam',(6,385):'paddy-dignam',
            (6,388):'paddy-dignam',(7,39):'paddy-dignam',(7,99):'paddy-dignam',(8,56):'paddy-dignam',(8,135):'paddy-dignam',(8,208):'paddy-dignam',(10,0):'paddy-dignam',(10,356):'paddy-dignam',(10,480):'paddy-dignam',(10,487):'paddy-dignam',(10,246):'dignam-son',(10,532):'dignam-son',(10,533):'dignam-son',(10,534):'dignam-son',(10,535):'dignam-son',(10,537):'dignam-son',(10,545):'dignam-son',(10,539):'paddy-dignam',(11,444):'paddy-dignam',(11,462):'paddy-dignam',(11,595):'paddy-dignam',(11,614):'paddy-dignam',(12,96):'paddy-dignam',(12,98):'paddy-dignam',(12,102):'paddy-dignam',(12,107):'paddy-dignam',(12,108):'paddy-dignam',(12,117):'paddy-dignam',(12,127):'paddy-dignam',(12,130):'paddy-dignam',(12,131):'paddy-dignam',(12,134):'paddy-dignam',(12,195):'paddy-dignam',(12,200):'paddy-dignam',(12,201):'paddy-dignam'},None),
 'Paddy Dignam':({(6,197):'paddy-dignam',(6,204):'paddy-dignam',(5,28):'paddy-dignam',(5,34):'paddy-dignam',(11,595):'paddy-dignam',(12,96):'paddy-dignam',(12,102):'paddy-dignam',(12,131):'paddy-dignam',(12,134):'paddy-dignam'},None),
 # 6:103 is Molly's namesake Tweedy, crown solicitor for Waterford; from episode
 # 16 on, Madam Marion Tweedy is Molly herself.
 # 6:103 is Molly's namesake, the crown solicitor for Waterford, and 6:305 is
 # Molly herself: Madame Marion Tweedy that was.
 'Tweedy':({(4,24):'major-tweedy',(4,27):'major-tweedy',(5,9):'major-tweedy',
            (6,103):'waterford-tweedy',(6,305):'molly',(11,321):'molly',(12,261):'major-tweedy'},None),
 'Larry':({(4,29):'larry-orourke',(4,30):'larry-orourke',(11,494):'larry-orourke'},None),
 'Larry O[’\']Rourke':({(4,29):'larry-orourke',(11,494):'larry-orourke'},None),
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
 'Matcham':({(4,162):'matcham',(4,163):'matcham',(8,87):'matcham',(11,473):'matcham'},None),
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
 'James Stephens':({(9,126):'james-stephens-writer',(4,159):'head-centre',(8,133):'head-centre',
                    (12,234):'head-centre',(15,433):'head-centre'},None),

 # --- episode 5. Bloom alone for a second morning, and the names he thinks
 # with. Paddy Dignam's name has three forms in one conversation.
 # 6:65 is Paddy Leonard, who has his own full-name alias.
 'Paddy':({(5,28):'paddy-dignam',(5,34):'paddy-dignam',
           (6,143):'paddy-dignam',(6,144):'paddy-dignam',(6,197):'paddy-dignam',
           (6,204):'paddy-dignam',(6,257):'paddy-dignam',(11,595):'paddy-dignam',(12,96):'paddy-dignam',(12,99):'paddy-dignam',(12,102):'paddy-dignam',(12,111):'paddy-dignam',(12,131):'paddy-dignam',(12,134):'paddy-dignam',(12,205):'paddy-leonard'},None),
 # Leopold is Bloom at 5:67 and the queen's son at 5:121, twelve lines after
 # Bloom notices that the duke of Albany had his own name.
 'Leopold':({(5,67):'leopold',(5,121):'duke-of-albany',
             (6,56):'leopold',(6,171):'leopold',(6,354):'leopold',(8,255):'archduke-leopold',(11,334):'leopold',(11,378):'leopold',(11,382):'leopold',(11,434):'leopold',(11,617):'leopold',(12,261):'leopold',(12,513):'saint-leopold'},None),
 # Henry is Bloom's pen name here; John Henry Menton, Henry Campbell and Henry
 # Blackwood Price are three other men.
 # 6:75 is the mourning-card verse -- dear Henry fled to his home up above --
 # and is not bound; 6:76 is Bloom turning the same words on his own pen name.
 'Henry':({(5,76):'henry-flower',(5,77):'henry-flower',(6,76):'henry-flower',(11,203):'henry-flower',(11,463):'henry-flower',(11,470):'henry-flower',(11,471):'henry-flower',(11,541):'henry-flower',(11,590):'henry-flower',(11,617):'henry-flower'},None),
 # 15:1235 is Mrs Bob Doran, his wife.
 'Doran':({(5,26):'bob-doran',(5,27):'bob-doran',(8,159):'bob-doran',(12,67):'bob-doran',(12,78):'bob-doran',(12,81):'bob-doran',(12,93):'bob-doran',(12,105):'bob-doran',(12,108):'bob-doran',(12,124):'bob-doran',(12,127):'bob-doran',(12,129):'bob-doran',(12,131):'bob-doran',(12,169):'bob-doran',(12,201):'bob-doran',(12,351):'bob-doran'},None),
 'Bob Doran':({(5,26):'bob-doran',(8,159):'bob-doran',(12,67):'bob-doran',(12,78):'bob-doran',(12,81):'bob-doran',(12,93):'bob-doran',(12,105):'bob-doran',(12,108):'bob-doran',(12,124):'bob-doran',(12,127):'bob-doran',(12,129):'bob-doran',(12,131):'bob-doran',(12,169):'bob-doran',(12,201):'bob-doran',(12,351):'bob-doran'},None),
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
 'Michael':({(1,318):'saint-michael',(5,109):'saint-michael',(11,531):'michael-gunn'},None),
 'Satan':({(5,109):'satan',(9,13):'satan',(9,274):'satan'},None),
 # Saint Patrick is named in nine episodes and only this one is read.
 'Saint Patrick':({(5,95):'saint-patrick',(8,179):'saint-patrick',(12,509):'saint-patrick'},None),
 # 12:513 and 15:78 are the patriarch; this is the blind father of the play.
 'Abraham':({(5,65):'leah-abraham'},None),
 # The modern edition spells her Mary, which is also the gospel sister at 5:87.
 '(?:Mairy|Mary)':({(5,84):'mairy',(11,465):'mairy'},None),
 'Martha':({(5,78):'martha-clifford',(5,80):'martha-clifford',
            (5,87):'martha-and-mary',
            (6,330):'martha-clifford',(6,386):'martha-clifford',
            (7,24):'martha-and-mary',(11,25):'martha-opera',(11,159):'martha-clifford',(11,413):['martha-opera','martha-clifford'],(11,420):'martha-opera',(11,424):'martha-opera',(11,457):'martha-opera',(11,472):'martha-clifford',(12,513):'martha-and-mary'},None),
 'Mary':({(5,87):'martha-and-mary',(7,24):'martha-and-mary',(8,128):'mary-slavey',(8,130):'mary-slavey',(9,271):'mary-arden',(10,45):'mary-rochfort'},None),
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
            (7,538):'myles-crawford',(12,314):'myles-crawford',(12,463):'crofton',(12,521):'crofton'},None),
 'Ned':({(7,105):'ned-lambert',(7,109):'ned-lambert',(7,111):'ned-lambert',
       (7,114):'ned-lambert',(7,119):'ned-lambert',(7,120):'ned-lambert',
       (7,128):'ned-lambert',(7,148):'ned-lambert',(7,150):'ned-lambert',
       (7,156):'ned-lambert',(7,158):'ned-lambert',(7,166):'ned-lambert',
       (7,168):'ned-lambert',(7,169):'ned-lambert',(7,170):'ned-lambert',
       (7,173):'ned-lambert',(7,175):'ned-lambert',(11,438):'ned-lambert',(11,439):'ned-lambert',(11,440):'ned-lambert',(12,263):'ned-lambert',(12,268):'ned-lambert',(12,269):'ned-lambert',(12,272):'ned-lambert',(12,273):'ned-lambert',(12,277):'ned-lambert',(12,295):'ned-lambert',(12,296):'ned-lambert',(12,304):'ned-lambert',(12,306):'ned-lambert',(12,370):'ned-lambert',(12,385):'ned-lambert',(12,408):'ned-lambert',(12,443):'ned-lambert',(12,487):'ned-lambert',(12,497):'ned-lambert',(12,506):'ned-lambert',(12,522):'ned-lambert',(12,554):'ned-lambert'},None),
 'Monks':({(7,88):'monks',(7,89):'monks',(7,90):'monks',(7,93):'monks',
           (7,97):'monks'},None),
 # 7:232 is Jack Hall; the rest are J. J. O'Molloy, whom they call Jack.
 'Jack':({(6,279):'jack-power',(7,134):'jj-omolloy',(7,187):'jj-omolloy',
          (7,503):'jj-omolloy',(10,175):'jj-omolloy',(10,178):'jj-omolloy',(10,200):'jj-omolloy',(12,265):'jj-omolloy',(12,295):'jj-omolloy',(12,508):'jack-power',(12,520):'jack-power'},None),
 'Moses':({(7,390):'moses',(7,423):'moses',(7,434):'moses',(7,531):'moses',(10,371):'moses',(12,302):'moses',(12,560):'moses'},None),
 'Isis':({(7,432):'isis'},None),
 'Michelangelo':({(7,390):'michelangelo'},None),
 'Chatterton':({(7,119):'chatterton'},None),
 'Healy':({(7,412):'tim-healy'},None),
 'Fitzgibbon':({(7,409):'fitzgibbon',(7,411):'fitzgibbon',(7,420):'fitzgibbon'},None),
 # 5:112 has 'the year of the Flood' in the modern edition.
 'Flood':({(7,378):'flood',(7,380):'flood'},None),
 'Kavanagh':({(7,330):'kavanagh'},None),
 # 7:520 is two women in one line: poor Penelope, then Penelope Rich.
 'Penelope':({(7,519):'penelope',(7,520):['penelope','penelope-rich'],(9,255):'penelope',(9,256):['penelope',None],(9,261):'ann-hathaway'},None),
 'Gallaher':({(7,326):'ignatius-gallaher',(7,336):'ignatius-gallaher',
              (7,358):'ignatius-gallaher',(7,378):'ignatius-gallaher'},None),
 'Long John':({(7,45):'long-john-fanning',(11,496):'long-john-fanning',(11,614):'long-john-fanning'},None),
 'Long John Fanning':({(7,45):'long-john-fanning',(10,412):'long-john-fanning',(10,472):'long-john-fanning',(10,473):'long-john-fanning',(10,475):'long-john-fanning',(10,478):'long-john-fanning',(10,480):'long-john-fanning',(10,483):'long-john-fanning',(10,486):'long-john-fanning',(10,488):'long-john-fanning'},None),
 # Modern edition only: it gives him the surname here.
 'Fanning':({(7,45):'long-john-fanning'},None),
 'Madam Bloom':({(7,314):'molly'},None),
 'Patrick Dignam':({(7,39):'paddy-dignam',(7,99):'paddy-dignam'},None),
 'MacCabe':({(7,479):'florence-maccabe'},None),
 # --- episode 6. The funeral, and the largest named cast in the book so far.
 # Stephen is in this episode and is never named in it: he is seen once from
 # the carriage as a lithe young man clad in mourning.
 'Simon Dedalus':({(4,30):'simon-dedalus',(7,21):'simon-dedalus',(8,141):'simon-dedalus',(10,542):'simon-dedalus',(11,443):'simon-dedalus',(11,566):'simon-dedalus'},None),
 'Simon':({(6,1):'simon-dedalus',(6,66):'simon-dedalus',
         (6,248):'simon-dedalus',(6,278):'simon-dedalus',
         (6,318):'simon-dedalus',(7,21):'simon-dedalus',
         (7,112):'simon-dedalus',(10,347):'simon-dedalus',(10,404):'simon-dedalus',(10,408):'simon-dedalus',(10,412):'simon-dedalus',(11,147):'simon-dedalus',(11,291):'simon-dedalus',(11,328):'simon-dedalus',(11,359):'simon-dedalus',(11,364):'simon-dedalus',(11,367):'simon-dedalus',(11,370):'simon-dedalus',(11,388):'simon-dedalus',(11,389):'simon-dedalus',(11,391):'simon-dedalus',(11,431):'simon-dedalus',(11,435):'simon-dedalus',(11,436):'simon-dedalus',(11,443):'simon-dedalus',(11,566):'simon-dedalus',(11,572):'simon-dedalus',(11,577):'simon-dedalus'},None),
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
            (6,315):'jack-power',(6,370):'jack-power',(6,371):'jack-power',(10,454):'jack-power',(10,461):'jack-power',(10,466):'jack-power',(10,470):'jack-power',(10,485):'jack-power',(10,486):'jack-power',(10,469):'jack-power'},None),
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
          (6,396):'martin-cunningham',(6,399):'martin-cunningham',(10,459):'martin-cunningham',(12,138):'martin-cunningham',(12,195):'martin-cunningham',(12,429):'martin-cunningham',(12,462):'martin-cunningham',(12,463):'martin-cunningham',(12,479):'martin-cunningham',(12,482):'martin-cunningham',(12,490):'martin-cunningham',(12,492):'martin-cunningham',(12,494):'martin-cunningham',(12,504):'martin-cunningham',(12,506):'martin-cunningham',(12,507):'martin-cunningham',(12,510):'martin-cunningham',(12,525):'martin-cunningham',(12,529):'martin-cunningham',(12,532):'martin-cunningham',(12,534):'martin-cunningham',(12,541):'martin-cunningham'},None),
 'Kernan':({(6,226):'tom-kernan',(6,240):'tom-kernan',(6,244):'tom-kernan',
          (6,284):'tom-kernan',(6,286):'tom-kernan',(6,288):'tom-kernan',
          (6,290):'tom-kernan',(6,293):'tom-kernan',(6,300):'tom-kernan',
          (6,302):'tom-kernan',(10,312):'tom-kernan',(10,343):'tom-kernan',(10,349):'tom-kernan',(10,352):'tom-kernan',(10,357):'tom-kernan',(10,359):'tom-kernan',(10,365):'tom-kernan',(10,542):'tom-kernan',(11,436):'tom-kernan',(11,443):'tom-kernan',(11,483):'tom-kernan',(11,505):'tom-kernan',(11,526):'tom-kernan',(11,567):'tom-kernan',(11,619):'tom-kernan'},None),
 'Menton':({(6,256):'john-henry-menton',(6,303):'john-henry-menton',
          (6,306):'john-henry-menton',(6,311):'john-henry-menton',
          (6,313):'john-henry-menton',(6,319):'john-henry-menton',
          (6,388):'john-henry-menton',(6,393):'john-henry-menton',
          (6,395):'john-henry-menton',(6,397):'john-henry-menton',(8,79):'john-henry-menton',(8,110):'john-henry-menton',(10,358):'john-henry-menton',(10,437):'john-henry-menton',(10,487):'john-henry-menton',(10,542):'john-henry-menton',(12,76):'john-henry-menton'},None),
 'John Henry':({(6,257):'john-henry-menton',(10,358):'john-henry-menton',(10,437):'john-henry-menton',(10,542):'john-henry-menton',(12,76):'john-henry-menton'},None),
 'Corny':({(6,34):'corny-kelleher',(6,190):'corny-kelleher',(12,277):'corny-kelleher',(12,299):'corny-kelleher',(12,327):'corny-kelleher'},None),
 # 6:24 names Richie first and then the firm: Goulding, Collis and Ward.
 'Goulding':({(6,24):['richie-goulding',None],(8,110):'richie-goulding',(11,228):'richie-goulding',(11,236):'richie-goulding',(11,258):'richie-goulding',(11,334):'richie-goulding',(11,335):'richie-goulding',(11,352):'richie-goulding',(11,372):'richie-goulding',(11,383):'richie-goulding',(11,434):'richie-goulding',(11,439):'richie-goulding',(11,440):'richie-goulding',(11,443):'richie-goulding',(11,455):'richie-goulding',(11,521):'richie-goulding',(11,537):'richie-goulding',(11,578):'richie-goulding',(11,611):'richie-goulding'},None),
 # Reuben J Dodd, and Mr Dedalus calling him Barabbas.
 'Reuben':({(6,108):'reuben-j',(6,118):'reuben-j',(6,129):'reuben-j',
            (6,133):'reuben-j',(8,364):'reuben-j',(10,412):'reuben-j',(10,542):'reuben-j',(11,587):'reuben-j',(12,307):'reuben-j'},None),
 'Barabbas':({(6,125):'reuben-j',(10,444):'reuben-j'},None),
 # 8:336 is Gray's confectioner's window and 6:330 is a grey sprouting beard.
 # The modern edition spells the knight Grey.
 # 7:358 is Gregor Grey, who made the design, and has his own alias.
 'Gr[ae]y':({(6,113):'john-gray',(7,535):'john-gray',(11,432):'john-gray'},None),
 # 13:93 is Cuffe street.
 'Cuffe':({(6,184):'joe-cuffe',(12,26):'joe-cuffe',(12,217):'joe-cuffe'},None),
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
 'C(?:\u00e6|ae)sar':({(6,337):'julius-caesar',(9,147):'julius-caesar'},None),
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
            (7,294):'may-dedalus',(8,9):'may-dedalus',(9,69):'ann-hathaway',(9,318):'mary-arden',(9,333):'mary-arden',(10,318):'may-dedalus',(12,133):'mrs-mooney',(12,205):'mrs-mooney'},None),
 # ---- episode 8. Every name below was listed across all 18 episodes before
 # being keyed; the comment says what the other occurrences are.
 # The prophet on Dowie's handbill, and again on the ball of paper thrown to
 # the gulls. 12:565 is Christ's cry from the cross and 15:608 is Dowie in
 # person, so the name is keyed and not aliased.
 'Elijah':({(8,5):'elijah',(8,14):'elijah',(10,115):'elijah',(10,351):'elijah',(10,522):'elijah',(10,526):'elijah',(11,465):'elijah',(12,513):'elijah',(12,565):'elijah'},None),
 # The second half of "Torry and Alexander". Every other Alexander in the book
 # is Alexander Keyes, Alexander J Dowie or archbishop William Alexander.
 'Alexander':({(8,7):'alexander-evangelist'},None),
 # 12:240 is the Irish Caruso-Garibaldi, where the hyphen defeats the guard.
 'Garibaldi':({(8,133):'garibaldi',(12,240):'garibaldi'},None),
 # The king who choked at Sletty. 12:312 is the tribe of Cormac and 17:7 is
 # the same king again, under his full name Cormac MacArt.
 'Cormac':({(8,179):'cormac'},None),
 # Noah's son, in the pun on the potted meats. 4:16 is ham and eggs.
 'Ham':({(8,208):'ham'},None),
 # The goddesses in the round hall. Venus is a statue, a planet and half a
 # dozen epithets elsewhere in the book; Juno is Juno's eyes in episode 9.
 'Venus':({(8,260):'venus',(9,254):'venus',(9,313):'venus',(9,333):'venus'},None),
 'Juno':({(8,260):'juno',(9,262):'juno'},None),
 # The archduke Otto of the Habsburg story. 17:108 is Thomas Otto, harlequin.
 'Otto':({(8,255):'archduke-otto'},None),
 # The owner of the filly. Elsewhere the name is the banking house.
 'Rothschild':({(8,250):'rothschild'},None),
 # Old Harris the optician, whose shop it is. 9:181 is Frank Harris on
 # Shakespeare, 15:869 is Harris Rosenberg, 17:463 is Harris tweed.
 'Harris':({(8,148):'harris'},None),
 # The park ranger. 12:274 is Stubbs's, the trade gazette.
 'Stubbs':({(8,112):'stubbs',(12,274):'stubbs'},None),
 # Whelan of the Express. 15:617 and 17:108 are other Whelans.
 'Whelan':({(8,112):'whelan'},None),
 # Coffey the butcher, who has the right to venison. Father Coffey of episode
 # 6 carries his own alias and is a different man.
 'Coffey':({(8,255):'coffey-butcher'},None),
 'Dubedat':({(8,255):'dubedat'},None),
 # Rock the head bailiff at the Burton bar. The other occurrences are Maiden's
 # Rock, Three Rock mountain and the pineapple rock of the first sentence.
 # The modern edition sets the throwaway's headline in capitals, which the
 # case-sensitive key cannot reach.
 # 14:47 is Malachi Roland St John Mulligan, which an alias would have taken.
 'John Mulligan':({(10,349):'john-mulligan'},None),
 'ELIJAH':({(10,115):'elijah',(10,351):'elijah'},None),
 'Rock':({(8,189):'rock',(10,437):'rock'},None),
 # Tommy Moore over the urinal. 8:255 is Moore street and episode 9 is George
 # Moore the novelist, so the surname is keyed to this one paragraph.
 'Moore':({(8,121):'tom-moore',(9,115):'george-moore',(9,126):'george-moore',(9,382):'george-moore',(9,416):'george-moore',(9,418):'george-moore',(12,172):'tom-moore'},None),
 # The song's chief, whose name sits inside Gutenberg italics in the older
 # edition, where the trailing underscore defeats the alias guard.
 'MacTrigger':({(8,208):'mactrigger',(8,223):'mactrigger'},None),
 'Don Giovanni':({(8,325):'don-giovanni',(8,330):'don-giovanni',(9,184):'don-giovanni',(11,497):'don-giovanni'},None),
 # Nosey Flynn by his bare surname. The guard lets "Flynn" through inside
 # "O'Flynn", so the name can never be aliased: 8:198, 12:513 and 15:1340 are
 # Father O'Flynn, and 13:88 and 12:349 are outside the read episodes.
 'Flynn':({(8,205):'nosey-flynn',(8,241):'nosey-flynn',
           (8,260):'nosey-flynn',(8,323):'nosey-flynn',(12,349):'nosey-flynn'},None),
 'Father O[’\']Flynn':({(8,198):'father-oflynn',(12,513):'father-oflynn'},None),
 'Jack Power':({(8,122):'jack-power',(10,329):'jack-power',(12,463):'jack-power',(12,491):'jack-power',(12,501):'jack-power',(12,533):'jack-power',(12,541):'jack-power'},None),
 # Denis Breen by his first name, in his wife's mouth.
 'Denis':({(8,103):'denis-breen',(12,513):'saint-denis'},None),
 # Theodore Purefoy, named only by his first name and his cousin in the castle.
 'Theodore':({(8,113):'theodore-purefoy'},None),
 'Blazes Boylan':({(8,228):'blazes-boylan',(10,117):'blazes-boylan',(10,120):'blazes-boylan',(10,122):'blazes-boylan',(10,128):'blazes-boylan',(10,131):'blazes-boylan',(10,134):'blazes-boylan',(10,137):'blazes-boylan',(10,142):'blazes-boylan',(10,468):'blazes-boylan',(10,542):'blazes-boylan',(10,543):'blazes-boylan',(11,226):'blazes-boylan',(11,230):'blazes-boylan',(11,241):'blazes-boylan',(11,254):'blazes-boylan',(11,256):'blazes-boylan',(11,263):'blazes-boylan',(11,284):'blazes-boylan',(11,336):'blazes-boylan',(11,432):'blazes-boylan'},None),
 'Blazes':({(8,238):'blazes-boylan',(11,226):'blazes-boylan',(11,230):'blazes-boylan',(11,241):'blazes-boylan',(11,245):'blazes-boylan',(11,254):'blazes-boylan',(11,256):'blazes-boylan',(11,263):'blazes-boylan',(11,284):'blazes-boylan',(11,317):'blazes-boylan',(11,336):'blazes-boylan',(11,432):'blazes-boylan',(12,245):'blazes-boylan',(12,248):'blazes-boylan',(12,260):'blazes-boylan'},None),
 'Richie Goulding':({(8,110):'richie-goulding',(10,211):'richie-goulding',(10,542):'richie-goulding',(11,228):'richie-goulding',(11,334):'richie-goulding',(11,383):'richie-goulding',(11,434):'richie-goulding',(11,440):'richie-goulding',(11,521):'richie-goulding',(11,537):'richie-goulding'},None),
 # ---- episode 9. The library argument, where a first name is almost never a
 # first name. Every table was listed across all 18 episodes before being keyed.
 # The bare surname Best is the adjective everywhere else in the book, so only
 # the three paragraphs where it is the man are keyed; "Mr Best" is an alias.
 'Best':({(9,280):'mr-best',(9,290):'mr-best',(9,365):['mr-best','mr-best'],(9,286):'mr-best'},None),
 # Ann Hathaway by her first name. Every other Ann in the book is the Mary Ann
 # of Mulligan's ballad or queen Ann's pudding at 13:24.
 'Ann':({(9,105):'ann-hathaway',(9,269):'ann-hathaway',(9,271):'ann-hathaway',
         (9,310):'ann-hathaway',(9,381):'ann-hathaway'},None),
 'Ann Shakespeare':({(9,69):'ann-hathaway'},None),
 'Hamnet Shakespeare':({(9,68):'hamnet',(9,69):'hamnet',(9,333):'hamnet'},None),
 'William Shakespeare':({(9,287):'shakespeare'},None),
 # Will is the auxiliary verb five times in this episode and the man four times.
 'Will':({(9,308):'shakespeare',(9,310):'shakespeare',(9,349):'shakespeare',
          (9,382):'shakespeare',(9,309):'shakespeare',(9,340):'shakespeare'},None),
 # 9:181 and 9:258 are William Herbert and sir William Davenant, whose full
 # names are aliases; 9:237 is Master William Silence, which is a book.
 'William':({(9,210):'shakespeare',(9,256):'shakespeare',
             (9,287):[None,'shakespeare'],(9,340):'shakespeare',
             (9,349):'shakespeare',(9,381):'shakespeare'},None),
 # Three Richards in ten paragraphs: the king in the play, the brother, and
 # Mr Best's own name, which is the joke he makes of it.
 'Richard':({(9,256):['richard-iii','richard-iii'],
             (9,340):['richard-shakespeare','richard-shakespeare'],
             (9,342):['mr-best','richard-shakespeare'],
             (9,346):'richard-shakespeare',(9,374):'richard-shakespeare',
             (9,381):['richard-iii','richard-shakespeare','richard-iii'],(12,513):'saint-richard'},None),
 # Two Edmunds: the bastard in King Lear and the brother dying in Southwark.
 # 7:378 is Edmund Burke, 8:144 is Arthur Edmund, 12:513 Edmund Ignatius Rice.
 'Edmund':({(9,340):['edmund-shakespeare','edmund-shakespeare'],
            (9,345):['edmund-lear','edmund-shakespeare'],
            (9,346):'edmund-shakespeare',(9,374):'edmund-shakespeare',
            (9,375):'edmund-shakespeare',(9,381):'edmund-lear'},None),
 'Gilbert':({(9,340):['gilbert-shakespeare','gilbert-shakespeare']},None),
 # 9:105 names the poem first and the boy second; 9:349 is the planet Venus.
 'Adonis':({(9,105):[None,'adonis']},None),
 'Griselda':({(9,255):'griselda'},None),
 # The Shakespeare women, each named once in the roll of widows at 9:271.
 'Joan':({(9,271):'joan-shakespeare'},None),
 'Susan':({(9,271):'susanna',(9,383):'susanna'},None),
 'Judith':({(9,271):'judith'},None),
 # 9:271 is Susan's daughter; 9:294 is the queen; the modern edition writes
 # Queen Elizabeth at 9:256 where Joyce writes Eliza Tudor.
 'Elizabeth':({(9,256):'elizabeth-i',(9,271):'elizabeth-hall',
               (9,294):'elizabeth-i'},None),
 'Eliza Tudor':({(9,256):'elizabeth-i'},None),
 'Bess':({(9,294):'elizabeth-i'},None),
 'Lizzie':({(9,391):'elizabeth-hall'},None),
 # 9:271 is Shakespeare's father; every other John in this episode is Eglinton.
 'John':({(9,271):'john-shakespeare',(9,291):'john-eglinton',
          (9,403):'john-eglinton',(9,435):[None,'john-eglinton'],(11,467):'john-plasto'},None),
 # Lir's loneliest daughter in the older edition, Lear's in the modern one.
 # Every other Lear in the book is the title of the play.
 'Lir':({(9,127):'lir'},None),
 'Lear':({(9,127):'lir'},None),
 'Cordelia':({(9,127):'cordelia'},None),
 # 9:19 is the earl; every other Essex in the book is Essex bridge or gate.
 'Essex':({(9,19):'essex'},None),
 # 9:25 is William Quan Judge the theosophist; 9:207 and 9:385 are Judge Barton
 # and Judge Eglinton, both of whom have their own spans.
 'Judge':({(9,25):'judge-theosophist'},None),
 # 16:15 is friar Bacon and 16:160 is the authorship theory again.
 'Bacon':({(9,171):'francis-bacon',(9,328):'francis-bacon'},None),
 # The poet of the Arcadia. 9:174 is Mr Sidney Lee and 12:50 is Sidney Parade.
 'Sidney':({(9,294):'philip-sidney',(9,381):'philip-sidney'},None),
 'Shylock':({(9,294):'shylock',(12,196):'shylock'},None),
 'Lopez':({(9,294):'lopez'},None),
 # 12:356 is the fair of Carmen and 15:743 is the opera.
 'Carmen':({(9,387):'carmen'},None),
 # 15:689 is Judas Iacchia, who is somebody else entirely.
 'Judas':({(9,391):'judas',(9,467):'judas',(11,289):'judas'},None),
 # Everywhere else in the book the name is only the exclamation, by Jove.
 'Jove':({(9,217):'jove'},None),
 'Sheba':({(9,256):'sheba',(12,50):'sheba'},None),
 # 16:189, 16:252 and 16:269 are the Achilles heel as an idiom.
 'Achilles':({(9,147):'achilles'},None),
 'Cleopatra':({(9,333):'cleopatra',(12,50):'cleopatra'},None),
 'Volumnia':({(9,333):'volumnia'},None),
 # 12:513 is S. Richard among the saints; this Arthur is the boy in King John.
 'Arthur':({(9,333):'young-arthur'},None),
 # 17:11 is Synge street, which the alias guard would have taken.
 'Synge':({(9,133):'synge',(9,203):'synge',(9,231):'synge',(9,448):'synge'},None),
 # 1:55 is Connolly Norman of Dottyville.
 'Norman':({(9,129):'norman-editor'},None),
 # 14:56 is the novelist again and 15:900 is Master Jack Meredith.
 'Meredith':({(9,382):'george-meredith'},None),
 # 12:513 is S. Lucy.
 'Lucy':({(9,439):'lucy',(12,513):'saint-lucy'},None),
 # 10:510 is Mulligan calling Farrell Wandering Ængus; 12:50 is Angus the Culdee.
 'Ængus':({(9,412):'aengus',(9,472):'aengus',(10,510):'aengus'},None),
 'Aengus':({(9,412):'aengus',(9,472):'aengus',(10,510):'aengus'},None),
 # ---- episode 10. Wandering Rocks walks the whole city and names almost
 # everyone in the book, so the shared tables get their longest run of keys.
 # Mr Dedalus is Simon all through this episode; 10:504 is his son, whom
 # Mulligan says Haines missed on Hamlet; 10:71 and 10:84 are the surname of
 # the four sisters and carry no card, each of whom has her own first name.
 'Katey':({(10,71):'katey-dedalus',(10,84):'katey-dedalus',(10,93):'katey-dedalus',
           (10,98):'katey-dedalus',(10,102):'katey-dedalus',(10,108):'katey-dedalus',
           (10,113):'katey-dedalus'},None),
 'Boody':({(10,71):'boody-dedalus',(10,85):'boody-dedalus',(10,89):'boody-dedalus',
           (10,91):'boody-dedalus',(10,96):'boody-dedalus',(10,106):'boody-dedalus',
           (10,108):'boody-dedalus',(10,111):'boody-dedalus',(10,114):'boody-dedalus'},None),
 'Maggy':({(10,86):'maggy-dedalus',(10,95):'maggy-dedalus',(10,101):'maggy-dedalus',
           (10,103):'maggy-dedalus',(10,108):'maggy-dedalus',(10,110):'maggy-dedalus',
           (10,113):'maggy-dedalus',(10,397):'maggy-dedalus'},None),
 # Mr Kernan walks four sections of this episode and is never given his first
 # name until the cavalcade, where he is Mr Thomas Kernan.
 # Father Bob Cowley all through, except on the steps of the City hall, where
 # Councillor Nannetti hails Alderman Cowley, who is somebody else.
 'Cowley':({(10,347):'bob-cowley',(10,404):'bob-cowley',(10,406):'bob-cowley',
            (10,408):'bob-cowley',(10,410):'bob-cowley',(10,412):'bob-cowley',
            (10,421):'bob-cowley',(10,427):'bob-cowley',(10,434):'bob-cowley',
            (10,438):'bob-cowley',(10,441):'bob-cowley',(10,443):'bob-cowley',
            (10,445):'bob-cowley',(11,235):'bob-cowley',(11,289):'bob-cowley',(11,301):'bob-cowley',(11,307):'bob-cowley',(11,310):'bob-cowley',(11,340):'bob-cowley',(11,345):'bob-cowley',(11,348):'bob-cowley',(11,353):'bob-cowley',(11,359):'bob-cowley',(11,361):'bob-cowley',(11,363):'bob-cowley',(11,367):'bob-cowley',(11,369):'bob-cowley',(11,387):'bob-cowley',(11,431):'bob-cowley',(11,433):'bob-cowley',(11,436):'bob-cowley',(11,443):'bob-cowley',(11,483):'bob-cowley',(11,496):'bob-cowley',(11,504):'bob-cowley',(11,511):'bob-cowley',(11,568):'bob-cowley',(11,592):'bob-cowley',(11,603):'bob-cowley',(11,619):'bob-cowley'},None),
 # 10:383 is Amor me solo in the charm, and 10:435 and 10:542 carry the full
 # name; these two are the landlord who has distrained on Father Cowley.
 'Love':({(10,442):'hugh-c-love',(10,443):'hugh-c-love',(11,341):'hugh-c-love'},None),
 # Boylan in the fruit shop, on the telephone, outside la Maison Claire and by
 # the provost's wall. 10:218 is Tom Rochford's joke: I'm Boylan with impatience.
 # Paddy Dignam is dead and buried this morning; every Master Dignam is his son.
 # 10:161 is the one in The Woman in White that Miss Dunne cannot get on with.
 # 10:287 is a litigant in the court of appeal, not the informer of episode 8.
 'Harvey':({(10,287):'harvey-litigant'},None),
 # --- episode 11
 # Gold behind the Ormond bar all through episode 11. The surname is not hers
 # alone: 10:349 is Peter Kennedy, hairdresser, and 10:435 James and Charles
 # Kennedy, rectifiers, two shopfronts on the cavalcade's route.
 'Kennedy':({(11,60):'miss-kennedy',(11,61):'miss-kennedy',(11,63):'miss-kennedy',(11,75):'miss-kennedy',(11,81):'miss-kennedy',(11,92):'miss-kennedy',(11,97):'miss-kennedy',(11,100):'miss-kennedy',(11,103):'miss-kennedy',(11,106):'miss-kennedy',(11,112):'miss-kennedy',(11,116):'miss-kennedy',(11,117):'miss-kennedy',(11,123):'miss-kennedy',(11,125):'miss-kennedy',(11,132):'miss-kennedy',(11,164):'miss-kennedy',(11,165):'miss-kennedy',(11,167):'miss-kennedy',(11,169):'miss-kennedy',(11,195):'miss-kennedy',(11,231):'miss-kennedy',(11,252):'miss-kennedy',(11,333):'miss-kennedy',(11,346):'miss-kennedy',(11,431):'miss-kennedy',(11,434):'miss-kennedy',(11,436):'miss-kennedy',(11,451):'miss-kennedy',(11,526):'miss-kennedy',(11,580):'miss-kennedy'},None),
 # Mina is Miss Kennedy here and Mina Purefoy in labour in Holles street
 # everywhere else in the book: 8:86, 8:135, 14:49, 15:1235, 15:1340, 17:571, 18:0.
 'Mina':({(11,333):'miss-kennedy',(11,393):'miss-kennedy',(11,431):'miss-kennedy',(11,436):'miss-kennedy',(11,450):'miss-kennedy',(11,451):'miss-kennedy',(11,495):'miss-kennedy',(11,580):'miss-kennedy',(11,585):'miss-kennedy'},None),
 # Ben is Ben Dollard in every paragraph of episode 11 except 11:355 and 11:587,
 # where Ben Howth is the head above Dublin bay and the rhododendrons on it.
 'Ben':({(11,36):'ben-dollard',(11,289):'ben-dollard',(11,291):'ben-dollard',(11,294):'ben-dollard',(11,299):'ben-dollard',(11,304):'ben-dollard',(11,308):'ben-dollard',(11,309):'ben-dollard',(11,312):'ben-dollard',(11,341):'ben-dollard',(11,345):'ben-dollard',(11,348):'ben-dollard',(11,358):'ben-dollard',(11,365):'ben-dollard',(11,431):'ben-dollard',(11,435):'ben-dollard',(11,443):'ben-dollard',(11,460):'ben-dollard',(11,496):'ben-dollard',(11,504):'ben-dollard',(11,505):'ben-dollard',(11,506):'ben-dollard',(11,510):'ben-dollard',(11,516):'ben-dollard',(11,523):'ben-dollard',(11,537):'ben-dollard',(11,566):'ben-dollard',(11,569):'ben-dollard',(11,572):'ben-dollard',(11,575):'ben-dollard',(11,577):'ben-dollard',(11,602):'ben-dollard',(11,619):'ben-dollard',(11,623):'ben-dollard',(11,627):'ben-dollard'},None),
 # Bob is Father Bob Cowley at the Ormond piano.
 'Bob':({(11,289):'bob-cowley',(11,294):'bob-cowley',(11,309):'bob-cowley',(11,436):'bob-cowley',(11,483):'bob-cowley',(11,496):'bob-cowley',(11,511):'bob-cowley',(11,619):'bob-cowley',(11,627):'bob-cowley',(12,67):'bob-doran',(12,78):'bob-doran',(12,81):'bob-doran',(12,93):'bob-doran',(12,94):'bob-doran',(12,105):'bob-doran',(12,108):'bob-doran',(12,124):'bob-doran',(12,127):'bob-doran',(12,129):'bob-doran',(12,131):'bob-doran',(12,169):'bob-doran',(12,201):'bob-doran',(12,351):'bob-doran'},None),
 # 11:483 is "sir Tom", Tom Kernan, and 11:627 is Kernan again in the blind
 # man's list of who he did not see. 11:283 is Tom Rochford, carried by his
 # own alias.
 'Tom':({(11,483):'tom-kernan',(11,627):'tom-kernan'},None),
 # George is George Lidwell, who is bound by alias everywhere he is named in
 # full; the bare George at 11:627 is his. 11:467 is George Robert Mesias.
 'George':({(11,627):'george-lidwell'},None),
 # The clergyman calls him Mr Lambert in episode 10 and Richie Goulding calls
 # him plain Lambert in episode 11. 3:68 is Lambert Simnel, a scullion crowned.
 'Lambert':({(10,73):'ned-lambert',(10,186):'ned-lambert',(10,188):'ned-lambert',
           (11,438):'ned-lambert',(11,439):'ned-lambert',(11,440):'ned-lambert',(12,262):'ned-lambert',(12,521):'ned-lambert'},None),
 # 6:74 is a name in the deaths column of the Freeman, and Bloom himself asks
 # what Peake is that; it is not shown to be the man Richie was at the old
 # Royal with.
 'Peake':({(11,375):'little-peake'},None),
 # 4:25 and 6:82 are the maker's legend sweated into the crown of Bloom's hat,
 # not the hatter; 11:467 names the man, his trade and his address.
 'Plasto':({(11,467):'john-plasto'},None),
 # The tenor of Flotow's Martha, the name the episode gives Simon Dedalus while
 # he sings it and Bloom while he listens. The first Lionel at 11:617 and the
 # only one at 11:621 are Lionel Marks, in whose saleshop window Bloom reads
 # Robert Emmet's last words; 15:232 and 16:274 are in unread episodes.
 '[Ll]ionel':({(11,413):'lionel',(11,414):'lionel',(11,421):'lionel',
           (11,436):'lionel',(11,617):[None,'lionel']},None),
 # 6:66 and 11:505 name the ballad rather than the boy, and 11:565 is the
 # Ormond boots, croppy bootsboy, eavesdropping in the hallway.
 '[Cc]roppy':({(11,527):'croppy-boy',(11,539):'croppy-boy',
           (11,553):'croppy-boy',(11,564):'croppy-boy'},None),
 # 13:5 is Flora MacFlimsy and 18:4 and 18:7 are Don Miguel and Don Poldo de la Flora.
 'Flora':({(11,261):'flora'},None),
 # Si Dedalus is what the Ormond calls him; keyed so the two words take one
 # span instead of one for Si and another for Dedalus.
 'Si Dedalus':({(11,397):'simon-dedalus',(11,440):'simon-dedalus',(11,619):'simon-dedalus'},None),
 # 4:0 and 11:617 are Mr Leopold Bloom and carry the longer key; 13, 15 and 17
 # are unread.
 'Leopold Bloom':({(11,378):'leopold',(11,434):'leopold'},None),
 # --- episode 12
 # Old Troy of the D. M. P. at the corner of Arbour hill. The name is the city
 # of Troy at 2:174, 7:459 and 9:256, troy measure at 6:296, "solemn as Troy"
 # at 8:364, and Inspector Troy in the unread crowd of 15:1235.
 'Troy':({(12,0):'old-troy',(12,3):'old-troy',(12,5):'old-troy'},None),
 # The citizen's dog. 13:24 and 15:206 are the same animal, but 15:1326 is the
 # tune the massed bands blare, so the name is keyed rather than aliased.
 'Garry(?:owen)?':({(12,27):'garryowen',(12,47):'garryowen',(12,136):'garryowen',(12,185):'garryowen',(12,187):'garryowen',(12,563):'garryowen'},None),
 # Terry the barman. 6:323 is Terence Mulcahy on the headstone.
 'Ter(?:ry|ence)':({(12,46):'terry-oryan',(12,79):'terry-oryan',(12,82):'terry-oryan',(12,83):'terry-oryan',(12,84):'terry-oryan',(12,131):'terry-oryan',(12,138):'terry-oryan',(12,154):'terry-oryan',(12,171):'terry-oryan',(12,189):'terry-oryan',(12,194):'terry-oryan',(12,325):'terry-oryan',(12,327):'terry-oryan',(12,367):'terry-oryan',(12,368):'terry-oryan',(12,459):'terry-oryan',(12,508):'terry-oryan'},None),
 # The publican, cursed by name in the dog's verse. Everywhere else in the book
 # -- 11:476, 13:116, 16:251, 16:278 -- Barney Kiernan's is the premises.
 'Barney Kiernan':({(12,188):'barney-kiernan'},None),
 # Whose dog it is. 13:20 is the Giltrap family, 13:24 and 13:37 grandpapa.
 'Giltrap':({(12,191):'giltrap'},None),
 # 17:119 is Mrs Riordan, called Dante; 16:176 is the poet again.
 'Dante':({(12,50):'dante-alighieri'},None),
 # 3:44 is the bar MacMahon in Paris.
 'MacMahon':({(12,50):'marshal-macmahon'},None),
 # 15:699 is Ben Jumbo Dollard.
 'Jumbo':({(12,434):'jumbo-elephant'},None),
 # 2:132 is sir John Blackwood and 2:151 and 2:152 Blackwood Price.
 'Blackwood':({(12,360):'arabella-blackwood'},None),
 # 17:7 is pope Celestine I, who sent Patrick.
 'Celestine':({(12,513):'saint-celestine'},None),
 # 17:475 is James Fintan Lalor.
 'Fintan':({(12,513):'saint-fintan'},None),
 # Saint Brigid is in this procession twice, as Bride among the Irish saints
 # and as Brigid among the virgins. 3:6 is Bride Street, and so is 12:205.
 'Bri(?:de|gid)':({(12,513):'saint-brigid'},None),
 # 13:71 is Miss Cummins, author of The Lamplighter.
 'Cummins':({(12,274):'cummins-of-francis-street'},None),
 # John Wyse Nolan is John Wyse for most of this episode.
 'John Wyse':({(12,338):'john-wyse-nolan',(12,357):'john-wyse-nolan',(12,365):'john-wyse-nolan',(12,367):'john-wyse-nolan',(12,374):'john-wyse-nolan',(12,386):'john-wyse-nolan',(12,404):'john-wyse-nolan',(12,406):'john-wyse-nolan',(12,425):'john-wyse-nolan',(12,432):'john-wyse-nolan',(12,445):'john-wyse-nolan',(12,461):'john-wyse-nolan',(12,462):'john-wyse-nolan',(12,481):'john-wyse-nolan',(12,485):'john-wyse-nolan'},None),
 # The boatclub swell Molly remembers. 12:26 and 12:356 are the river, and
 # 16:252 is Carrick-on-Shannon.
 'Shannon':({(10,166):'shannon'},None),
 # The citizen is never named. 9:256 in the modern edition is Manningham's
 # story of the citizen's wife, which is why the words are keyed and not aliased.
 # Bloom's father is Virag at 12:492 and 12:505 and Lipoti Virag at 12:551.
 # Circe makes a Lipoti Virag of its own, so the name is keyed here.
 'Virag':({(12,492):'rudolph-bloom',(12,505):'rudolph-bloom',(12,551):'rudolph-bloom'},None),
 'the [Cc]itizen':({(12,17):'citizen',(12,21):'citizen',(12,27):'citizen',(12,37):'citizen',(12,57):'citizen',(12,73):'citizen',(12,86):'citizen',(12,118):'citizen',(12,137):'citizen',(12,151):'citizen',(12,169):'citizen',(12,172):'citizen',(12,173):'citizen',(12,176):'citizen',(12,180):'citizen',(12,182):'citizen',(12,216):'citizen',(12,217):'citizen',(12,235):'citizen',(12,249):'citizen',(12,267):'citizen',(12,287):'citizen',(12,289):'citizen',(12,291):'citizen',(12,313):'citizen',(12,317):'citizen',(12,321):'citizen',(12,323):'citizen',(12,324):'citizen',(12,331):'citizen',(12,333):'citizen',(12,335):'citizen',(12,337):'citizen',(12,354):'citizen',(12,356):'citizen',(12,358):'citizen',(12,361):'citizen',(12,363):'citizen',(12,371):'citizen',(12,373):'citizen',(12,377):'citizen',(12,379):'citizen',(12,383):'citizen',(12,387):'citizen',(12,392):'citizen',(12,412):'citizen',(12,423):'citizen',(12,431):'citizen',(12,433):'citizen',(12,437):'citizen',(12,441):'citizen',(12,446):'citizen',(12,448):'citizen',(12,450):'citizen',(12,455):'citizen',(12,481):'citizen',(12,493):'citizen',(12,499):'citizen',(12,502):'citizen',(12,505):'citizen',(12,509):'citizen',(12,511):'citizen',(12,527):'citizen',(12,530):'citizen',(12,536):'citizen',(12,541):'citizen',(12,546):'citizen',(12,548):'citizen',(12,560):'citizen'},None),
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
 # ---- episode 9
 (9,0):[(r'[Qq]uaker librarian','lyster')],
 (9,3):[(r'A noiseless attendant','library-attendant')],
 (9,5):[(r'attendant','library-attendant')],
 (9,25):[(r'H\.\s?P\.\s?B\.','blavatsky'),(r'K\.\s?H\.','koot-hoomi'),
          (r'repentant [sS]ophia','sophia')],
 (9,32):[(r'very peripatetic','aristotle'),(r'the roaming philosopher','aristotle')],
 (9,40):[(r'the auric egg of','russell'),(r'the golden aura of','russell')],
 (9,59):[(r'the ghost from _?limbo patrum_?','king-hamlet'),(r'the ghost from limbo','king-hamlet')],
 (9,66):[(r'It is the ghost, the king','king-hamlet')],
 (9,100):[(r'[Qq]uaker librarian','lyster')],
 (9,105):[(r'The greyeyed goddess','venus'),(r'The grey-eyed goddess','venus'),(r'Kath[ae]rine','katharine')],
 (9,112):[(r'A tall figure in bearded homespun','russell')],
 (9,119):[(r'Buddh(?![a-z])','buddha')],
 (9,121):[(r'[Qq]uaker librarian','lyster')],
 (9,135):[(r'[Qq]uaker librarian','lyster')],
 (9,144):[(r'the outgoer','russell')],
 # The Egyptian highpriest of John F Taylor's speech in episode 7, whose voice
 # Stephen hears again in the silence of the library.
 (7,423):[(r'some high ?priest','egyptian-highpriest')],
 (7,425):[(r'that Egyptian high ?priest','egyptian-highpriest')],
 (9,148):[(r'that Egyptian high ?priest','egyptian-highpriest')],
 (9,164):[(r'[Qq]uaker librarian','lyster')],
 (9,180):[(r'[Qq]uaker librarian','lyster')],
 (9,194):[(r'pseudomalachi','mulligan'),(r'false Malachi','mulligan')],
 (9,198):[(r'[Qq]uaker librarian','lyster')],
 # Joyce writes saint Patrick lowercase at 9:207 and drops the saint entirely
 # at 9:235, where the modern edition supplies it.
 (9,207):[(r'[Ss]aint Patrick','saint-patrick')],
 (9,235):[(r'(?:[Ss]aint )?Patrick','saint-patrick')],
 (9,209):[(r'[Qq]uaker librarian','lyster')],
 (9,219):[(r'[Qq]uaker librarian','lyster')],
 (9,236):[(r'an attendant','library-attendant')],
 (9,238):[(r'the attendant','library-attendant'),(r'a gentleman here','leopold')],
 (9,244):[(r'A patient silhouette','leopold')],
 (9,246):[(r'a bowing dark figure','leopold')],
 (9,250):[(r'Bloom','leopold')],
 (9,283):[(r'that Stagyrite schoolurchin','aristotle')],
 # Joyce runs the two names together; the modern edition hyphenates them and
 # the alias and the key reach both halves there.
 (9,286):[(r'Best(?=eglinton)','mr-best'),(r'(?<=Best)eglinton','john-eglinton')],
 (9,294):[(r'a Scotch philosophaster','james-i'),(r'a Scottish pseudo-philosopher','james-i')],
 (9,301):[(r'Saint Thomas','thomas-aquinas')],
 (9,306):[(r'Saint Thomas','thomas-aquinas')],
 (9,314):[(r'Eglintonus','john-eglinton'),(r'John Eglinton the Chronicler','john-eglinton')],
 (9,318):[(r'the madonna','blessed-virgin'),(r'the Madonna','blessed-virgin')],
 (9,328):[(r'bulldog of Aquin(?:as)?','thomas-aquinas')],
 (9,329):[(r'Eglintoneyes','john-eglinton')],
 (9,331):[(r'Sonmulligan','mulligan'),(r'Son-Mulligan','mulligan')],
 (9,335):[(r'[Qq]uaker librarian','lyster')],
 (9,340):[(r'STEPHEN','stephen')],
 (9,341):[(r'MAGEEGLINJOHN','john-eglinton'),(r'JOHN MAGEE-EGLINTON','john-eglinton')],
 (9,342):[(r'BEST','mr-best')],
 (9,343):[(r'BUCKMULLIGAN','mulligan'),(r'BUCK MULLIGAN','mulligan')],
 (9,345):[(r'STEPHEN','stephen')],
 (9,346):[(r'BEST','mr-best')],
 (9,348):[(r'QUAKERLYSTER','lyster'),(r'QUAKER LYSTER','lyster')],
 (9,349):[(r'STEPHEN','stephen')],
 (9,355):[(r'[Qq]uaker librarian','lyster')],
 (9,366):[(r'[Qq]uaker librarian','lyster')],
 (9,369):[(r'An attendant','library-attendant')],
 (9,387):[(r'the moor in him','othello'),(r'the Moor in him','othello')],
 (9,407):[(r'Fraidrine','fred-ryan')],
 (9,427):[(r'[Qq]uaker’s pate','lyster'),(r"[Qq]uaker's bald pate",'lyster')],
 (9,441):[(r'The dour recluse','john-eglinton'),
          (r'the douce youngling','mr-best'),(r'the gentle young man','mr-best')],
 (9,462):[(r'MOTHER GROGAN','mother-grogan')],
 (9,469):[(r'A man passed out between them','leopold')],
 (9,476):[(r'A dark back','leopold')],
 (9,7):[(r'de [lL][aA] Palice','de-la-palice')],
 (9,18):[(r'old Ben(?! Jonson)','ben-jonson')],
 (9,55):[(r'[Ff]at [Bb]oy','pickwick-fat-boy')],
 (9,147):[(r'the soothsayer','soothsayer')],
 (9,157):[(r'mother Dana','dana-goddess')],
 (9,167):[(r'another Ulysses','odysseus')],
 (9,174):[(r'Simon Lazarus','sidney-lee')],
 (9,184):[(r'dongiovannism','don-giovanni')],
 (9,181):[(r'[Dd]ark [Ll]ady','dark-lady')],
 (9,255):[(r'Mrs Shakespeare','ann-hathaway')],
 (9,260):[(r'Margaret Mary','margaret-mary')],
 (9,261):[(r'H(?:arry|enry) of six wives','henry-viii')],
 (9,315):[(r'Magee the Elder','magee-mor')],
 (9,377):[(r'your brother','stephen-brother')],
 (9,382):[(r'makes Ulysses','odysseus')],
 (9,390):[(r'Dumas _fils_','dumas-fils'),(r'Dumas _p[èe]re','dumas-pere')],
 (9,404):[(r'the present duke','duke-of-rutland')],
 (9,473):[(r'[Ww]andering [Jj]ew','wandering-jew'),(r'[Aa]ncient [Mm]ariner','ancient-mariner')],
 (9,480):[(r'Cymbeline','cymbeline')],
 # ---- episode 10
 (10,1):[(r'A one-?legged sailor','onelegged-sailor')],
 (10,11):[(r'[Ff]ather [Pp]rovincial','father-provincial')],
 (10,12):[(r'Ger\.? ?Gallaher','ger-gallaher')],
 (10,18):[(r'[Ff]ather [Pp]rovincial','father-provincial')],
 (10,19):[(r'[Ll]ady Maxwell','lady-maxwell')],
 (10,30):[(r'A constable on his beat','constable-57c')],
 (10,31):[(r'a bargeman','turf-bargeman')],
 (10,36):[(r'The gentleman with the glasses','tram-gentleman'),
          (r'His wife','tram-gentlemans-wife')],
 (10,37):[(r'the awkward man','awkward-man')],
 (10,38):[(r'the awkward old man','awkward-man')],
 (10,39):[(r'an old woman','tram-old-woman')],
 (10,41):[(r'the Belgian [jJ]esuit','belgian-jesuit')],
 (10,44):[(r'[Ll]ord Molesworth','lord-molesworth')],
 (10,45):[(r'the jealous [Ll]ord Belvedere','lord-belvedere'),
          (r'her husband’s brother','belvedere-brother'),
          (r"her husband's brother",'belvedere-brother')],
 (10,52):[(r'[Ll]ady Maxwell','lady-maxwell')],
 (10,55):[(r'A flushed young man','flushed-young-man'),
          (r'a young woman with wild nodding daisies','young-woman-daisies')],
 (10,61):[(r'Constable 57C','constable-57c')],
 (10,74):[(r'A stout lady','stout-lady')],
 (10,77):[(r'Two barefoot urchins','barefoot-urchins')],
 (10,81):[(r'One of the urchins','barefoot-urchins')],
 (10,117):[(r'The blond girl in Thornton’s','thornton-blond-girl'),
           (r"The blond girl in Thornton's",'thornton-blond-girl')],
 (10,119):[(r'the blond girl','thornton-blond-girl')],
 (10,129):[(r'The blond girl','thornton-blond-girl')],
 (10,136):[(r'The blond girl','thornton-blond-girl')],
 (10,139):[(r'The blond girl','thornton-blond-girl')],
 (10,161):[(r'Marion','marion-woman-in-white')],
 (10,178):[(r'[Ss]ilken Thomas','silken-thomas')],
 (10,193):[(r'The young woman','young-woman-daisies')],
 (10,196):[(r'the [eE]arl of Kildare','earl-of-kildare'),(r'the archbishop','cashel-archbishop')],
 (10,211):[(r'an elderly (?:female|woman)','elderly-female-courts')],
 (10,259):[(r'the jarvey','glencree-jarvey'),(r'the driver','glencree-jarvey')],
 (10,268):[(r'The shopman','bookshop-man')],
 (10,283):[(r'The beautiful woman','sweets-of-sin-woman')],
 (10,287):[(r'An elderly (?:female|woman)','elderly-female-courts')],
 (10,288):[(r'The shopman','bookshop-man')],
 (10,292):[(r'The shopman','bookshop-man')],
 (10,104):[(r'The (?:lacquey|footman)','lacquey')],
 (10,295):[(r'The (?:lacquey|footman)','lacquey')],
 (10,297):[(r'The (?:lacquey|footman)','lacquey')],
 (10,299):[(r'J\.\s?A\.\s?Jackson.*?Gahan','halfmile-wheelmen')],
 (10,302):[(r'your [Uu]ncle John','goulding-cornet-brother')],
 (10,321):[(r'The (?:lacquey|footman)','lacquey')],
 (10,324):[(r'The (?:lacquey|footman)','lacquey')],
 (10,339):[(r'The (?:lacquey|footman)','lacquey')],
 (10,341):[(r'little [Ss]ister Monica','sister-monica')],
 (10,352):[(r'Ned Lambert’s brother over the way, Sam','sam-lambert'),
           (r"Ned Lambert's brother across the way — Sam",'sam-lambert')],
 (10,360):[(r'[Mm]ajor Sirr','major-sirr')],
 (10,362):[(r'that sham squire','sham-squire')],
 (10,371):[(r'Old Russell','russell-lapidary')],
 (10,373):[(r'Two old women','two-old-women')],
 (10,378):[(r'the huckster','bookcart-huckster'),(r'the old bookseller','bookcart-huckster')],
 (10,389):[(r'nonesuch Charles','charles-stuart'),(r'like King Charles','charles-stuart')],
 (10,449):[(r'The policeman','castle-policeman')],
 (10,499):[(r'John Howard,','john-howard-parnell')],
 (10,501):[(r'the waitress','dbc-waitress')],
 (10,515):[(r'the waitress','dbc-waitress')],
 (10,507):[(r'The one-?legged sailor','onelegged-sailor')],
 (10,533):[(r'Stoer smokes','stoer-boy')],
 (10,545):[(r'M\.\s?C\.\s?Green.*?Huggard','quartermile-handicappers'),
           (r'two sand(?:ed|-gritted) women','two-old-women'),
           (r'[Mm]ack?intosh','macintosh'),
           (r'the late [Qq]ueen','queen-victoria'),
           (r'the [Pp]rince [Cc]onsort','prince-albert')],
 (10,542):[(r'an elderly (?:female|woman)','elderly-female-courts'),
           (r'her father who was laid up','gerty-father')],
 (10,69):[(r'A one-?legged sailor','onelegged-sailor')],
 (10,252):[(r'the wife','molly')],
 (10,255):[(r'the wife','molly')],
 (10,532):[(r'[Uu]ncle Barney','dignam-brother-in-law')],
 (10,537):[(r'[Uu]ncle Barney','dignam-brother-in-law')],
 (10,539):[(r'[Uu]ncle Barney','dignam-brother-in-law')],
 # --- episode 11
 (11,17):[(r'Bloo(?![A-Za-z])','leopold')],
 (11,45):[(r'(?<=Bronze)lydia','miss-douce'),(r'Mina(?=gold)','miss-kennedy')],
 (11,50):[(r'Benaben','ben-dollard'),(r'Benben','ben-dollard')],
 (11,51):[(r'(?<![A-Za-z])bloom(?![A-Za-z])','leopold')],
 (11,53):[(r'(?<![A-Za-z])Lid(?![A-Za-z])','george-lidwell'),(r'(?<![A-Za-z])Ker(?![A-Za-z])','tom-kernan'),(r'(?<![A-Za-z])Cow(?![A-Za-z])','bob-cowley'),(r'(?<![A-Za-z])De(?![A-Za-z])','simon-dedalus'),(r'(?<![A-Za-z])Doll(?![A-Za-z])','ben-dollard')],
 (11,78):[(r'Bloowho','leopold')],
 (11,79):[(r'The boots','ormond-boots')],
 (11,82):[(r'loud boots unmannerly','ormond-boots')],
 (11,87):[(r'bootssnout','ormond-boots')],
 (11,90):[(r'that young brat','ormond-boots')],
 (11,102):[(r'that old fogey in Boyd[’\']s','boyds-fogey')],
 (11,110):[(r'snuffy fogey[’\']s tone','boyds-fogey')],
 (11,113):[(r'The hideous old wretch','boyds-fogey')],
 (11,120):[(r'Bloowhose','leopold'),(r'(?<=Dedalus[’\'] )son','stephen')],
 (11,125):[(r'Kennygiggles','miss-kennedy')],
 (11,128):[(r'the greasy nose','boyds-fogey')],
 (11,130):[(r'[Gg]reaseabloom','leopold')],
 (11,134):[(r'[Gg]reaseabloom','leopold'),(r'(?<=[’\']s )father','nannetti-father')],
 (11,177):[(r'the famous son','stephen'),(r'a famous father','simon-dedalus')],
 (11,193):[(r'The tuner','blind-stripling')],
 (11,205):[(r'the shopgirl','daly-shopgirl')],
 (11,208):[(r'Bloohimwhom','leopold'),(r'Bloo(?![A-Za-z])','leopold')],
 (11,211):[(r'the tuner','blind-stripling')],
 (11,259):[(r'Blazure','blazes-boylan')],
 (11,263):[(r'Bronzedouce','miss-douce')],
 (11,269):[(r'[Mm]iss Kenn(?![A-Za-z])','miss-kennedy')],
 (11,289):[(r'the long fellow','long-john-fanning')],
 (11,311):[(r'The wife','molly'),(r'the chap in Keogh[’\']s','keoghs-chap')],
 (11,326):[(r'the old drummajor','major-tweedy')],
 (11,339):[(r'Bensoulbenjamin','ben-dollard')],
 (11,341):[(r'your landlord','hugh-c-love')],
 (11,346):[(r'two gentlemen with tankards','tankard-gentlemen'),(r'first gentleman','tankard-gentlemen')],
 (11,406):[(r'his wife','may-dedalus')],
 (11,415):[(r'the barber in Drago[’\']s','dragos-barber')],
 (11,428):[(r'Si(?=opold)','simon-dedalus'),(r'(?<=Si)opold','leopold')],
 (11,431):[(r'two gentlemen with two tankards','tankard-gentlemen'),(r'first gent with tank','tankard-gentlemen')],
 (11,434):[(r'second gentleman','tankard-gentlemen')],
 (11,436):[(r'Second gentleman','tankard-gentlemen')],
 (11,450):[(r'First gentleman','tankard-gentlemen'),(r'second tankard','tankard-gentlemen')],
 (11,451):[(r'Lid(?=lydiawell)','george-lidwell'),(r'(?<=Lid)lydia(?=well)','miss-douce'),(r'[Mm]iss Dou(?![A-Za-z])','miss-douce'),(r'[Mm]iss Kenn(?![A-Za-z])','miss-kennedy'),(r'gent with the tank','tankard-gentlemen')],
 (11,496):[(r'The landlord','hugh-c-love')],
 (11,517):[(r'A false priest','yeoman-captain')],
 (11,519):[(r'the vested priest','yeoman-captain')],
 (11,526):[(r'Tankards','tankard-gentlemen')],
 (11,542):[(r'The false priest','yeoman-captain'),(r'A yeoman captain','yeoman-captain')],
 (11,548):[(r'the yeoman','yeoman-captain')],
 (11,565):[(r'bootsboy','ormond-boots')],
 (11,567):[(r'Tomgin','tom-kernan')],
 (11,570):[(r'Benaben','ben-dollard'),(r'Benben','ben-dollard')],
 (11,580):[(r'tankard one','tankard-gentlemen')],
 (11,583):[(r'Tank one','tankard-gentlemen')],
 (11,586):[(r'(?<![A-Za-z])dollard(?![A-Za-z])','ben-dollard'),(r'(?<![A-Za-z])bloom(?![A-Za-z])','leopold')],
 (11,590):[(r'Lionel(?=leopold)','lionel'),(r'(?<=Lionel)leopold','leopold')],
 (11,599):[(r'The wife','molly')],
 (11,600):[(r'Simon(?=lionel)','simon-dedalus'),(r'(?<=Simon)lionel','lionel'),(r'the tuner','blind-stripling')],
 (11,613):[(r'A stripling, blind','blind-stripling')],
 (11,615):[(r'a yeoman cap(?![A-Za-z])','yeoman-captain'),(r'the whore of the lane','whore-of-the-lane')],
 (11,616):[(r'A frowsy whore','whore-of-the-lane')],
 (11,619):[(r'(?<![A-Za-z])Lid(?![A-Za-z])','george-lidwell'),(r'(?<![A-Za-z])Ker(?![A-Za-z])','tom-kernan'),(r'(?<![A-Za-z])Cow(?![A-Za-z])','bob-cowley'),(r'(?<![A-Za-z])De(?![A-Za-z])','simon-dedalus'),(r'(?<![A-Za-z])Doll(?![A-Za-z])','ben-dollard')],
 (11,627):[(r'An unseeing stripling','blind-stripling')],
 (11,628):[(r'Seabloom','leopold'),(r'[Gg]reaseabloom','leopold')],
 (11,414):[(r'Gould(?![A-Za-z])','richie-goulding')],
 # --- episode 12
 (12,9):[(r'Collector of bad and doubtful debts','narrator-12')],
 (12,77):[(r'long John','long-john-fanning')],
 (12,79):[(r'long John','long-john-fanning')],
 (12,27):[(r'the citizen','citizen'),(r'the Citizen','citizen')],
 (12,172):[(r'an old one there','city-arms-old-one'),(r'a cracked loodheramaun of a nephew','city-arms-nephew'),(r'the lout','city-arms-nephew'),(r'Sara Curran','curran')],
 (12,150):[(r'H\. Rumbold','h-rumbold')],
 (12,463):[(r'Crofter','crofton')],
 (12,489):[(r'Crofter','crofton')],
 (12,178):[(r'_Sheila, my own_','sheila'),(r'Sheila, my own','sheila'),(r'a handsome young Oxford graduate','oxford-graduate')],
 (12,205):[(r'Jack Mooney[’\']s sister','bob-doran-wife'),(r'the old prostitute of a mother','mrs-mooney')],
 (12,274):[(r'Dunne, says he','dunne-pawnshop')],
 (12,312):[(r'the twelve tribes of Iar','tribe-of-iar'),(r'those twelve of Iar','tribe-of-iar'),(r'Livingstone','livingstone')],
 (12,327):[(r'officer Taylor','officer-taylor')],
 (12,328):[(r'Jenny','jenny-12')],
 (12,385):[(r'the poor old woman','poor-old-woman')],
 (12,434):[(r'officer Taylor','officer-taylor'),(r'Alice, the elephant','alice-elephant'),(r'Constable 14A','constable-14a')],
 (12,513):[(r'the daughters of Clara','saint-clara'),(r'the sons of Dominic','saint-dominic'),(r'the sons of Vincent','saint-vincent-founder'),(r'Ignatius his children','saint-ignatius'),(r'of Viterbo','rose-of-viterbo'),(r'S\. Alfred','saint-alfred'),(r'S\. Cornelius','saint-cornelius'),(r'S\. Bernard','saint-bernard'),(r'S\. Terence','saint-terence'),(r'S\. Edward','saint-edward'),(r'S\. Kevin','saint-kevin'),(r'S\. Barbara','saint-barbara')],
 (12,551):[(r'Jacob _agus_ Jacob','jacob-agus-jacob')],
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
 # 9:117 is Peter Piper pecking a peck of pickled pepper, not the man who is
 # back from Berlin and coming to Moore's tonight.
 ('Piper',9,117),
 # 12:513 is S. Stephen Protomartyr in the procession of saints, not Stephen
 # Dedalus, and 12:26 and 12:356 are the river Shannon.
 ('Stephen',12,513),
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
