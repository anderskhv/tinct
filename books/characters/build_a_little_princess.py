"""Reviewed aliases, family names, and the neighbor's concealed connection."""
import re
from pathlib import Path
from reviewed_aliases import bind as names
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'a-little-princess'
def bind(edition,ch,pi,text,entities):
 out=names(edition,ch,pi,text,entities)
 # Generic cook/monkey and a namesake are not blanket identities.
 out=[m for m in out if not(m[2]=='cook' and re.match(r'[- ]shop',text[m[1]:])) and not(m[2]=='monkey' and ch<11)]
 def add(id,pattern):
  for m in re.finditer(pattern,text):out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch==12 and pi in [33,35,44,45,49] or (ch,pi)==(17,45):add('captain-crewe',r'\bCrewe\b')
 if ch==1 and pi in [0,1]:add('captain-crewe',r'\bfather\b')
 if ch==1 and pi==0:add('sara',r'odd-looking little girl')
 if ch==1 and pi==9:add('sara-mother',r'\bmother\b')
 if (ch,pi)==(2,21):add('sara-mother',r'\bmother\b')
 if ch==1:add('ayah',r'\bayah\b')
 if ch==1 and pi==33:add('meredith-daughters',r'two little girls')
 if ch==4 and pi==14:
  add('lottie-father',r'(?:flighty young|rather flighty young) papa')
  add('lottie-mother',r'\bmother\b')
 if ch==4 and pi==15:add('lottie-mother',r'\bmother\b')
 if ch==12 and pi==2:
  add('ermengarde-aunts',r'two aunts');add('ermengarde-uncle',r'\buncle\b')
 if ch==15 and pi==31:add('amelia-aunt',r'old aunt')
 if ch==15 and pi in [112,204]:add('kind-aunt',r'(?:nicest )?aunt')
 if ch==10 and pi==1:
  add('grandmother',r'\bgrandmother\b');add('carmichael',r'\bfather\b');add('mrs-carmichael',r'\bmother\b')
 if ch>=10:
  add('carmichael',r'father of the Large Family|head of the Large Family')
 if ch==10 and pi==55:
  add('doctor',r'\bdoctor\b');add('nurse',r'\bnurse\b');add('men-servants',r'two men-servants|two manservants|two male servants');add('footman',r'\bfootman\b')
 if ch>=11:add('doctor',r'\bdoctor\b')
 if ch>=12:add('carrisford',r'Uncle Tom|\bTom\b|Sahib Carrisford')
 if ch>=12 and ch!=14:add('carrisford',r'\bSahib\b')
 if ch==14:
  for n,m in enumerate(re.finditer(r'\bSahib\b',text)):
   id='secretary' if pi in [4,7,12] or pi==22 and n==0 else 'carrisford'
   out.append((m.start(),m.end(),id,'reviewed-context'))
 if ch==11:add('ram-dass',r'Indian man-servant|Indian manservant')
 if ch==12 and pi==20:
  add('emily-carew',r'child at Madame Pascal[’\x27]s school');add('russian-couple',r'\bRussians\b');add('russian-daughter',r'little daughter')
 if ch==12 and pi==25:add('carew-father',r'English officer')
 if ch==17 and pi==33:
  add('emily-carew',r'Emily Carew');add('russian-couple',r'\bRussians\b')
 if ch==13:
  if pi==15:add('baker',r'(?:cheerful, stout, motherly |warm, stout, motherly )?woman')
  if pi in [18,34,36,39,41,44,47,49,61,65,73,75,77]:add('baker',r'(?:baker[- ]|baker )?woman')
  if pi==19:add('anne',r'little figure')
  if pi in [22,25,33,49,50,53,60,62,63,64,70,76,78,80]:add('anne',r'beggar[- ](?:child|girl)|\bchild\b')
 if ch==19:
  if pi>=25:add('baker',r'\bwoman\b')
  if pi in [15,28,39]:add('anne',r'beggar[- ](?:child|girl)|\bchild\b')
  if pi>=40:add('anne',r'\bAnne\b')
 if ch==9 and pi==67:add('rat-family',r'\bchildren\b')
 if ch>=9:add('sparrows',r'\bsparrows\b')
 if ch in [1,2,3,7]:add('pony',r'\bpony\b')
 if ch==11 and pi==26:add('neatherd-wife',r'wife of the neat-herd|wife of the cowherd')
 if ch==5 and pi in [6,7]:add('story-princess',r'\b(?:princess|Princess)\b')
 if ch==5 and pi==71:add('merman',r'\bPrince\b')
 # This nickname identifies Sara only when it is actually about her.
 if (ch,pi) in [(6,60),(12,47),(12,52),(12,56),(18,24)]:add('sara',r'Little Missus|little missus')
 return out

def compile_package():return assemble('a-little-princess',bind)
if __name__=='__main__':run('a-little-princess','A Little Princess',bind)
