"""Reviewed namesakes for Paradise Lost.

Milton's blank verse and the modern prose align paragraph for paragraph across
all 12 books. The verse capitalises every line-opening, so a capital is not
evidence of a proper noun there; the entity inventory was built from the prose
and checked back against the verse.

Three words in this poem are both a person and a thing, and Milton means them
to be: Sin is Satan's daughter and the act; Death is her son and the sentence;
Chaos is the Anarch old and the abyss he rules. They are bound as the persons,
which is what the poem makes of them — except at the few places where the word
is plainly the common noun, which the tables below skip.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'paradise-lost'

# name -> ({(book, paragraph): id or None to skip}, default or None)
SPLIT={
 # "Sin-bred" is a compound, and Book 12's Sin is the act, not the daughter.
 'Sin':  ({(4,36):None,(12,36):None},'sin'),
 # The Son of God everywhere, except where Raphael addresses Adam and where
 # Sin addresses Death.
 'Son':  ({(5,55):'adam',(10,30):'death'},'son'),
 # Chaos's consort, not the time of day. Every other Night in the poem is
 # nightfall, and none of them is cast.
 # Milton's Heavenly Muse is Urania, named only in Book VII; the Muse who
 # could not defend her son is Calliope, whom he does not name.
 'Muse': ({(7,3):'muses'},'urania'),
 # "Joshua, whom the Gentiles Jesus call" names Joshua, not Christ — which is
 # Milton's whole point about the type and the thing typified.
 'Jesus':({(12,39):'joshua'},'son'),
 # "It was the infernal Serpent" is Satan and the poem says so in its fourth
 # paragraph. Every other Serpent in the poem is the animal he borrows, and
 # none of those is bound.
 'Serpent':({(1,4):'satan'},None),
 'Night':({(1,54):'night',(2,10):'night',(2,11):'night',(2,32):'night',
          (2,76):'night',(2,79):'night',(2,80):'night',(2,81):'night',
          (2,83):'night',(2,87):'night',(3,2):'night',(3,8):'night',
          (3,54):'night',(10,55):'night',(10,56):'night'},None),
}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 for name,(table,default) in SPLIT.items():
  entry=table.get((ch,pi),default)
  if entry is None:continue
  for m in re.finditer(word(name),text):out.append((m.start(),m.end(),entry,'reviewed-context'))
 return out

def compile_package():return assemble('paradise-lost',bind)
if __name__=='__main__':run('paradise-lost','Paradise Lost',bind)
