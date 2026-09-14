"""Reviewed bindings for Ulysses.

Joyce in both editions, 18 episodes, 7,148 paragraphs per edition. Episode 1 is
authored; episodes 2-18 are not.

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
 'Dedalus':({(1,23):'stephen',(1,35):'stephen',(1,85):'stephen',(1,120):'stephen',
             (1,137):'stephen',(1,219):'stephen',(1,281):'stephen'},None),
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
 'Lily':({(1,335):'lily-carlisle'},None),
 # 12:1 and 17:x are other men called Valentine; this is the heresiarch.
 'Valentine':({(1,318):'valentine'},None),
 # mother Grogan is the folk figure of episode 1; 10, 14 and 15 use the name
 # again in company that has not been read.
 'Grogan':({(1,155):'mother-grogan',(1,162):'mother-grogan',(1,165):'mother-grogan'},None),
 'Mary Ann':({(1,165):'mary-ann',(1,169):'mary-ann'},None),
 # Seymour is named in five episodes; only episode 1 says who he is.
 'Seymour':({(1,69):'seymour',(1,333):'seymour',(1,339):'seymour',(1,340):'seymour'},None),
 # Bannon reappears in 4, 14 and 15, where he is with Milly Bloom.
 'Bannon':({(1,329):'bannon'},None),
 'Bannons':({(1,328):'the-bannons'},None),
 # Fergus is the song in episode 1; 12 and 15 use the name otherwise.
 'Fergus':({(1,105):'fergus',(1,107):'fergus'},None),
 # Shakespeare and Hamlet are argued over for the whole of episode 9 and named
 # in eleven episodes; only the two mentions of episode 1 are keyed here.
 'Shakespeare':({(1,275):'shakespeare'},None),
 'Hamlet':({(1,232):'hamlet',(1,269):'hamlet',(1,275):'hamlet'},None),
 # Joseph is Joseph the Joiner at 1:288 and 1:295 and eleven other men elsewhere.
 'Joseph':({(1,288):'joseph-the-joiner',(1,295):'joseph-the-joiner'},None),
 # The mother is unnamed in episode 1 and is bound where the text makes her the
 # subject: the dream, the deathbed, the bowl of bile, the ghostcandle.
 'mother':({(1,39):'may-dedalus',(1,41):'may-dedalus',(1,52):'may-dedalus',
            (1,80):'may-dedalus',(1,85):'may-dedalus',(1,89):'may-dedalus',
            (1,91):'may-dedalus',(1,117):'may-dedalus'},None),
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
