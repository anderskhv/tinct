"""Only standalone three-or-more-asterisk scene ornaments are non-spoken."""
import re

def is_scene_separator(text):
 return isinstance(text,str) and re.fullmatch(r'\s*\*(?:\s*\*){2,}\s*',text) is not None

def validate_map(entry):
 spoken=[p['index'] for p in entry['paragraphs']]
 silent=entry.get('nonspoken',[])
 if any(not is_scene_separator(p['text']) for p in silent):return False
 indexes=spoken+[p['index'] for p in silent]
 return sorted(indexes)==list(range(entry['text_paragraph_count'])) and len(set(indexes))==len(indexes)
