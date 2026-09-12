"""Reviewed bindings for the Republic.

Ten books, 4,308 paragraphs per edition, aligned paragraph for paragraph.

A dialogue has no speaker tags, so nothing here is inferred from position: every
binding is a name the text actually prints. Two names need a table. Glaucon the
interlocutor and Glaucus the sea-god are one letter apart and the translations
do not always agree on which. Diomedes the hero and the proverbial "necessity of
Diomede" are the same man under two spellings, and are carried as one entity.
"""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'the-republic'

# Jowett spells Hera "Here", which cannot be an alias — it is one of the
# commonest words in English. It is bound at the one paragraph where it is
# the goddess.
SPLIT={
 'Here':({(2,245):'hera',(2,309):'hera',(3,92):'hera'},None),
}

# Jowett writes "idea" where the modern edition writes "Form". Lowercase "idea"
# is far too common to bind on sight, so the Forms are bound in the verse
# translation only at the passages that define them. Each pattern is written so
# that it cannot match the modern edition's wording, which the alias covers.
CIRCUMSTANCE={
 (6,330):[(r'a single idea','the-forms')],
 (6,332):[(r'the ideas are known','the-forms')],
 (6,396):[(r'the ideas themselves','the-forms')],
 (10,14):[(r'idea or form','the-forms')],
}

def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def word(w):return r'(?<![A-Za-z])'+w+r'(?![A-Za-z])'
 for name,(table,default) in SPLIT.items():
  entry=table.get((ch,pi),default)
  if entry is None:continue
  for m in re.finditer(word(name),text):out.append((m.start(),m.end(),entry,'reviewed-context'))
 for pat,who in CIRCUMSTANCE.get((ch,pi),[]):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),who,'reviewed-context'))
 return out

def compile_package():return assemble('the-republic',bind)
if __name__=='__main__':run('the-republic','The Republic',bind)
