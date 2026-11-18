import pathlib,json,re
p=pathlib.Path(__file__).parent;d=json.loads((p/'candidate-peloponnesian-war-modern-da.json').read_text());edits=[]
words='Peloponneserne Peloponnesere Peloponneser Athenerne Athenere Athener Hellenerne Hellenere Hellener Pelasgernes Danaer Argivere Achaiere Karerne Karere Fønikere Ozoliske Lokrere Aitolerne Akarnanerne Lakedaimonierne Mykenæerne Arkadernes Trojanerne Grækerne Boioter Thessalierne Dorerne Dorernes Korinthierne Korinthiere Samierne Korkyræerne Korkyræer Korkyræernes Ionerne Ionernes Persernes Phokæerne Karthagerne Mederne Taulantierne Dorere Epidamnierne Ambrakioter Leukadiere Illyrernes Theberne Phliasierne Eleerne Eleernes Phaiakerne Aigineterne Samierne Potidæerne Potidæernes Makedonerne Makedonernes Chalkidierne Bottiæerne Sermyliernes'.split()
pat=re.compile(r'\b(?:'+ '|'.join(sorted(words,key=len,reverse=True))+r')\b')
for ci in [0,1]:
 for si,b in enumerate(d['chapters'][ci]['paragraphs']):
  def lower(m):
   prefix=b[:m.start()].rstrip(' \n»“›(—')
   return m.group() if not prefix or prefix[-1] in '.!?:' else m.group().lower()
  a=pat.sub(lower,b)
  a=re.sub(r'\b(vor|vore|vort)\b','vores',a)
  a=re.sub(r'\b(Vor|Vore|Vort)\b','Vores',a)
  a=a.replace('Den Trojanske Krig','den trojanske krig').replace('Den Peloponnesiske Krig','Den peloponnesiske krig')
  if a!=b:edits.append(dict(language='modern-da',chapter=ci+1,slot=si+1,before=b,after=a,reason='Danish lower-case ethnic/common adjectives; modern vores; only chapters already read. Sentence starts retained.'))
(p/'edits-002zz-style.json').write_text(json.dumps(edits,ensure_ascii=False,indent=2)+'\n')
