"""Reviewed cue expansion, italic markup boundaries and scene-specific context rules.

The original text is a Gutenberg-style setting: speech cues are abbreviated and
wrapped in italic underscores (``_Mrs Ov._``), stage names are italicised
(``_Officers_``), and printed line numbers sit inside the prose. Underscore is a
word character, so the shared exact-alias matcher in ``reviewed_aliases`` cannot
see either end of ``_Duke._``; this book therefore binds with letter/digit
boundaries instead. The modern text expands every cue to capitals and carries no
abbreviations, so the two editions need separate alias sets.
"""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'measure-for-measure'

# Underscore and printed line numbers are markup, not letters: treat only
# letters and digits as name characters when testing an alias boundary.
def spans(alias,text):
 return re.finditer(r'(?<![A-Za-z0-9])'+re.escape(alias)+r'(?![A-Za-z0-9])',text)

# Abbreviated speech cues exist only in the original setting. 'Just' is excluded:
# it also occurs as an ordinary word at 13:33 ("Just of his colour").
CUES={'duke':'Duke','isabella':'Isab','angelo':'Ang','escalus':'Escal','provost':'Prov',
 'pompey':'Pom','claudio':'Claud','elbow':'Elb','mariana':'Mari','mistress-overdone':'Mrs Ov',
 'abhorson':'Abhor','froth':'Froth','juliet':'Jul','barnardine':'Bar','francisca':'Fran',
 'angelo-servant':'Serv','messenger':'Mes','friar-peter':'Fri. P','friar-thomas':'Fri. T',
 'first-gentleman':'First Gent','second-gentleman':'Sec. Gent'}
# Compositor errors kept as printed; the modern setting spells both correctly.
TYPOS={'claudio':'Clandio','angelo':'Angclo'}

def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  for alias in e['aliases']:
   for m in spans(alias,text):out.append((m.start(),m.end(),e['id'],'reviewed-name'))
 def add(pat,id,how='reviewed-context'):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,how))
 if edition=='original-en':
  for id,cue in CUES.items():add(r'(?<![A-Za-z0-9])'+re.escape(cue)+r'(?=\._)',id,'reviewed-cue')
  for id,typo in TYPOS.items():add(r'(?<![A-Za-z0-9])'+re.escape(typo)+r'(?![A-Za-z0-9])',id,'reviewed-source-typo')
  if (ch,pi)==(5,118) or (ch,pi)==(5,120) or (ch,pi)==(5,122):add(r'(?<![A-Za-z0-9])Just(?=\._)','justice','reviewed-cue')
 # The magistrate is named only in the scene-5 entry direction. Justice at 5:70 is
 # the morality-play figure paired with Iniquity, at 10:86 is Angelo, and at 17:8
 # is Isabella's abstract plea: none of those is this character.
 if (ch,pi)==(5,0):add(r'(?<![A-Za-z0-9])Justice(?![A-Za-z0-9])','justice')
 # Mistress Overdone's trade name, and the tapster she is addressing. "Thomas" here
 # is Pompey, not Friar Thomas; the play never confirms it as his given name.
 if (ch,pi)==(2,21):add(r'Madam Mitigation','mistress-overdone')
 if (ch,pi)==(2,61):add(r'Thomas (?:tapster|barman)','pompey')
 # The convent superior: the original prints "the Mother", the modern "the Mother
 # Superior". Francisca names her office two paragraphs earlier.
 if (ch,pi)==(4,6):add(r'prioress','prioress')
 if (ch,pi)==(4,32):add(r'Mother Superior|Mother','prioress')
 # Lucio's opening joke: "the king" is the King of Hungary just named; "the other
 # dukes" and "all the dukes" are rulers at large and stay unbound.
 if (ch,pi)==(2,1):add(r'the king','king-of-hungary')
 if (ch,pi)==(10,34):add(r'Emperor of Russia','emperor-of-russia')
 if (ch,pi)==(10,73):add(r'His child|his child','lucio-child')
 if (ch,pi)==(10,79):add(r'his Holiness','pope')
 if (ch,pi)==(5,2):add(r'(?<=a most noble )father','claudio-father')
 if (ch,pi)==(9,28):add(r'(?<=there my )father(?=[’\x27]s)','claudio-father')
 if (ch,pi)==(5,45):add(r'(?<=whose )father','froth-father')
 # Elbow's wife is discussed, never present. "Elbow's wife" is the longer span and
 # wins over the bare surname. The original prints a line number inside "the
 # constable's 150 wife" at 5:64, so that phrase is not contiguous and is not bound.
 if ch==5:add(r'Elbow[’\x27]s wife','elbow-wife')
 return out

def compile_package():return assemble('measure-for-measure',bind)
if __name__=='__main__':run('measure-for-measure','Measure for Measure',bind)
