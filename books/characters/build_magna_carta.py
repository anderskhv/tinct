"""Titles distinguish repeated first names; coordinated list names are local."""
import re
from pathlib import Path
from build_reviewed import compile_package as assemble,main as run
BASE=Path(__file__).resolve().parent/'magna-carta'
def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  for a in e['aliases']:
   for m in re.finditer(r'(?<!\w)'+re.escape(a)+r'(?!\w)',text):out.append((m.start(),m.end(),e['id'],'reviewed-name'))
 scoped=[]
 if pi in {0,70}:
  scoped.append((r'Henry,? archbishop of Dublin','henry-dublin'))
 if pi==0:
  for id,name,place in [('william-london','William','London'),('peter-winchester','Peter','Winchester'),('jocelin','Jocelin','Bath and Glastonbury'),('hugh-lincoln','Hugh','Lincoln'),('walter','Walter','Worcester'),('william-coventry','William','Coventry'),('benedict','Benedict','Rochester')]:scoped.append((name+r',? [Bb]ishop of '+place,id))
  for id,place in [('william-salisbury','Salisbury'),('william-warren','Warren'),('william-arundel','Arundel')]:scoped.append((r'William,? earl of '+place,id))
 if pi==50:scoped.extend([(r'Peter(?=, Guy)','peter-chanceaux'),(r'Guy(?=, and Andrew)','guy-chanceaux'),(r'Geoffrey his nephew','geoffrey-nephew')])
 if pi==53:scoped.append((r'\bHenry\b','henry-king'))
 if pi==58:scoped.append((r'the son of Llywelyn','welsh-son'))
 if pi==59:scoped.extend([(r'William','william-scotland'),(r'sisters','sisters')])
 for pat,id in scoped:
  for m in re.finditer(pat,text):
   a,b=m.span()
   if id=='welsh-son':b=a+len('the son')
   out.append((a,b,id,'reviewed-title-or-list'))
 if pi==50:
  for pat,id in [(r'Geoffrey de Martigny and (his brothers)','martigny-brothers'),(r'Philip Marc and (his brothers)','marc-brothers')]:
   for m in re.finditer(pat,text):out.append((*m.span(1),id,'reviewed-family'))
 if pi==63:
  for pat,id in [(r'the queen','queen'),(r'our children','royal-children')]:
   for m in re.finditer(pat,text):out.append((*m.span(),id,'reviewed-family'))
 return out
def compile_package():return assemble('magna-carta',bind)
if __name__=='__main__':run('magna-carta','Magna Carta',bind)
