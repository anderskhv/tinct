"""Reviewed namesakes, italicized citations and the staged Section XI dialogue."""
import re
from pathlib import Path
from reviewed_aliases import bind as exact
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'hume-enquiry'
def bind(edition,ch,pi,text,entities):
 out=exact(edition,ch,pi,text,entities)
 def add(pat,id):
  for m in re.finditer(pat,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch==11 or (ch,pi)==(15,11):add(r'\bAlexander\b','alexander-great')
 if ch==15 and pi in (8,9):add(r'\bAlexander\b','alexander-prophet')
 if (ch,pi)==(7,9):add('Cicero','cicero')
 if (ch,pi)==(14,8):add(r'(?<![A-Za-z])Cato(?![A-Za-z])','cato-younger')
 if (ch,pi)==(15,16):
  add(r'Abbe_ Paris|Abbé_ Paris|Abbé Paris|Abbe\b|Abbé\b','paris')
 if (ch,pi)==(15,11):
  add(r'\bblind man\b','blind-man');add(r'\blame man\b','lame-man');add(r'\bEmperor\b','vespasian')
 if (ch,pi)==(15,13):
  add(r'door-keeper|doorkeeper','doorkeeper');add(r'\bcardinal\b','retz')
 if (ch,pi)==(15,18):add(r'\bsuccessor\b','noailles-successor')
 if (ch,pi)==(15,23):add(r'\bking\b','king-france')
 if (ch,pi)==(15,24):
  for pat,id in [(r'\bservant\b','chatillon-servant'),(r'\bniece\b','marguerite'),(r'bishop of Tournay|bishop of Tournai','tournay'),(r'queen-regent of France','queen-regent'),(r'own physician','queen-physician')]:add(pat,id)
 if (ch,pi)==(16,1):add(r'wisest of all the Roman emperors','marcus')
 if ch==16:
  # This is the staged interlocutor, never a generic friend elsewhere in the essay.
  if pi in (0,5):add(r'\bfriend\b','friend')
  # First-person author outside the friend's imagined Epicurean speech only.
  if pi in (0,1,6,8,26,31,32,33):add(r'\bI\b','hume-dialogue')
 return out
def compile_package():return assemble('hume-enquiry',bind)
if __name__=='__main__':run('hume-enquiry','An Enquiry Concerning Human Understanding',bind)
