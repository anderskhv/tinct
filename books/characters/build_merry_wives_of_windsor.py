"""Reviewed Pages, Fords and assumed names for The Merry Wives of Windsor.

Four people are called Page and two are called Ford, and the original is a
Gutenberg-style setting whose italic underscores and abbreviated cues defeat the
shared exact-alias matcher, exactly as in Measure for Measure. This book binds
with letter/digit boundaries, expands the original's cues, and assigns the two
surnames by default with a reviewed exception list.
"""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'merry-wives-of-windsor'

def spans(alias,text):
 return re.finditer(r'(?<![A-Za-z0-9])'+re.escape(alias)+r'(?![A-Za-z0-9])',text)

# The original's abbreviated speech cues, matched only where a cue can stand:
# the abbreviation followed by a stop and then markup, a comma or a space.
CUES={'falstaff':'Fal','mistress-page':'Mrs Page','ford':'Ford','evans':'Evans',
 'mistress-ford':'Mrs Ford','page':'Page','quickly':'Quick','shallow':'Shal',
 'slender':'Slen','caius':'Caius','host':'Host','pistol':'Pist','simple':'Sim',
 'anne':'Anne','fenton':'Fent','bardolph':'Bard','nym':'Nym','william':'Will',
 'rugby':'Rug','robin':'Rob','first-servant':'First Serv','second-servant':'Sec. Serv',
 'servant':'Serv'}
# Bare "Page" and "Ford" default to the two householders. These are the reviewed
# exceptions, keyed by paragraph and zero-based occurrence within it. The two at
# 1:18 and 23:63 are cases where a printed line number splits "Anne Page", and the
# one at 13:48 splits "Mistress Page", so the surname stands alone in the text.
PAGE_X={(1,18):{0:'anne'},(13,48):{0:'mistress-page'},(23,63):{0:'anne'},(5,17):{1:None}}
FORD_X={(5,15):{0:'mistress-ford'},(14,3):{0:'mistress-ford'},(5,17):{0:None}}

def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  for alias in e['aliases']:
   for m in spans(alias,text):out.append((m.start(),m.end(),e['id'],'reviewed-name'))
 def add(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 if edition=='original-en':
  for id,cue in CUES.items():
   add(r'(?<![A-Za-z0-9])'+re.escape(cue)+r'(?=\.[_,\s])',id,'reviewed-cue')
 def surname(word,default,exceptions):
  ex=exceptions.get((ch,pi),{})
  for i,mo in enumerate(re.finditer(r'(?<![A-Za-z0-9])(?:'+word+'|'+word.upper()+r')(?![A-Za-z0-9])',text)):
   who=ex.get(i,default) if i in ex else default
   if who:out.append((mo.start(),mo.end(),who,'reviewed-context'))
 # Contiguous "Anne Page" is a longer span and wins over the surname default.
 add(r'(?<![A-Za-z0-9])Anne Page(?![A-Za-z0-9])','anne')
 surname('Page','page',PAGE_X);surname('Ford','ford',FORD_X)
 # Ford visits Falstaff as Brook; the reader watches him take the name.
 add(r'(?<![A-Za-z0-9])Brook(?![A-Za-z0-9])','ford')
 # Falstaff escapes in the fat woman of Brentford's gown, and is beaten as her.
 add(r'(?:fat|old) woman of Brentford','fat-woman')
 add(r'witch of Brentford','brainford-witch')
 # The householders' given names, used only by their wives and friends.
 add(r'(?<![A-Za-z0-9])George(?![A-Za-z0-9])','george-page')
 add(r'(?<![A-Za-z0-9])Frank(?![A-Za-z0-9])','frank-ford')
 # Two women called Alice: Ford's wife, and the neighbour Slender lent a book to.
 # "Alice Shortcake" is the longer span and wins; the other is Mistress Ford.
 add(r'(?<!Shortcake)(?<![A-Za-z0-9])Alice(?! Shortcake)(?![A-Za-z0-9])','mistress-ford')
 return out

def compile_package():return assemble('merry-wives-of-windsor',bind)
if __name__=='__main__':run('merry-wives-of-windsor','The Merry Wives of Windsor',bind)
