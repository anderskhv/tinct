"""Exact aliases for reviewed packages with no ambiguous contextual names.

Use only after manual whole-source alias review; shared-name works need their
own binder. This module does not infer identities from capitalization.
"""
import re
def bind(edition,ch,pi,text,entities):
 out=[]
 for e in entities:
  for alias in e['aliases']:
   for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text):out.append((m.start(),m.end(),e['id'],'reviewed-name'))
 return out
