import json,pathlib,ast,re
p=pathlib.Path(__file__).parent/'reconstructed/leviathan';rows=json.loads((p.parent.parent.parent/'recovery-worker-b/event-commands-evidence.json').read_text());heads={};gaps={}
for x in rows:
 if 'leviathan'not in x['cmd']+x['cwd']:continue
 cs=re.findall(r"\['section'\]\s*==\s*(\d+)",x['cmd']);c=int(cs[-1])if cs else None
 if c is None:
  z=re.search(r'(?:^|[;\n])c=(\d+)',x['cmd']);c=int(z[1])if z else None
 for line in x.get('output','').split('\n'):
  if x['call']==333 and '01a1a716-41e8' in x['log']:
   z=re.match(r'(48) (\d+) (.+)',line)
   if z:heads.setdefault(int(z[1]),[]).append({'section':int(z[1]),'slot':int(z[2]),'heading':z[3]})
  try:v=ast.literal_eval(line)
  except:continue
  if not isinstance(v,list)or not v:continue
  if isinstance(v[0],tuple)and len(v[0])==2 and isinstance(v[0][0],int)and isinstance(v[0][1],str) and c and 'molesworth-heading-map'in x['cmd']:
   heads[c]=[{'section':c,'slot':a,'heading':b}for a,b in v]
  elif isinstance(v[0],dict):
   if 'heading'in v[0]and'section'in v[0]:
    for z in v:heads.setdefault(z['section'],[]).append(z)
   elif 'molesworthSpan'in v[0]:
    for z in v:gaps.setdefault(z['section'],[]).append(z)
(p/'molesworth-heading-map.json').write_text(json.dumps([z for c in sorted(heads)for z in heads[c]],ensure_ascii=False,indent=2)+'\n');(p/'molesworth-body-gap-candidates.json').write_text(json.dumps([z for c in sorted(gaps)for z in gaps[c]],ensure_ascii=False,indent=2)+'\n');print('headsections',sorted(heads));print('gapsections',sorted(gaps))
