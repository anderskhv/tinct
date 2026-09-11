import hashlib,json,unittest
from build_richard_iii import compile_package,BASE
from build_pilot import ROOT,normalized,u16
from lookup_reference import resolve
class RichardIIITests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_and_sources(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_every_repeated_name_is_assigned(self):
  # No occurrence of the five repeated names may be left unbound in either edition.
  import re
  for ed,d in self.asset['editions'].items():
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   bound={(m['chapterNumber'],m['paragraphIndex'],m['startOffset']) for m in d['mentions']}
   for word in ['Edward','Richard','York','George','Plantagenet']:
    pat=re.compile(r'(?<![A-Za-z0-9])(?:'+word+'|'+word.upper()+r')(?![A-Za-z0-9])')
    for (ch,pi),text in ps.items():
     for mo in pat.finditer(text):
      off=u16(text[:mo.start()])
      if (ch,pi,word) in [(19,10,'Plantagenet'),(19,11,'Edward')]:
       self.assertFalse(any(m['chapterNumber']==ch and m['paragraphIndex']==pi and m['startOffset']<=off<m['endOffset'] for m in d['mentions']))
       continue
      self.assertTrue(any(m['chapterNumber']==ch and m['paragraphIndex']==pi and m['startOffset']<=off<m['endOffset'] for m in d['mentions']),(ed,word,ch,pi,mo.group(0)))
 def test_five_edwards(self):
  for ed,d in self.asset['editions'].items():
   at=lambda ch,pi:[m['characterId'] for m in sorted(d['mentions'],key=lambda x:x['startOffset']) if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) and m['characterId'].startswith('edward') or (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) and m['characterId']=='prince-edward']
   # Margaret's Edward is the Lancastrian prince; the Queen's is her son.
   self.assertEqual(at(19,23),['edward-lancaster','prince-edward'])
   # Four different Edwards inside one speech of Margaret's.
   self.assertEqual(at(19,27),['edward-iv','edward-lancaster','prince-edward','edward-lancaster','edward-lancaster'])
   # "Dead Edward's grave" is the King; "living Edward's throne" is his heir.
   self.assertEqual(at(6,31),['edward-iv','prince-edward'])
   # Buckingham's proof of bastardy: the son is a bastard, the father is the King.
   self.assertEqual(at(15,39),['prince-edward','edward-iv','prince-edward'])
   # Sir Edward Courtney is a Devonshire gentleman, not any of the princes.
   self.assertEqual(at(19,201),['edward-courtney'])
   self.assertEqual(at(23,52),['edward-lancaster'])
 def test_four_richards_and_four_yorks(self):
  for d in self.asset['editions'].values():
   who=lambda ch,pi,pref:[m['characterId'] for m in sorted(d['mentions'],key=lambda x:x['startOffset']) if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) and m['characterId'] in pref]
   R={'richard-iii','york-boy','richard-york-father','richard-ii','ratcliffe'}
   # "Thou hadst a Richard, till a Richard killed him": the boy, then the uncle.
   self.assertEqual(who(19,23,R),['richard-iii','richard-iii','richard-iii','york-boy','richard-iii'])
   # The Duchess's Richard is her husband, killed by Margaret's party.
   self.assertEqual(set(who(19,24,R)),{'richard-york-father'})
   # The Pomfret Richard is the second king of that name.
   self.assertEqual(set(who(11,5,R)),{'richard-ii'})
   Y={'york-boy','duchess','archbishop','richard-york-father','house-of-york'}
   # One line names the Archbishop, the boy duke and the Duchess in that order:
   # the three "York" spans go to three different people.
   yorks=[m['characterId'] for m in sorted(d['mentions'],key=lambda x:x['startOffset'])
          if (m['chapterNumber'],m['paragraphIndex'])==(8,0) and m['text'] in ('York','YORK')]
   self.assertEqual(yorks,['archbishop','york-boy','duchess'])
   self.assertEqual(set(who(4,87,Y)),{'richard-york-father'})
   self.assertEqual(who(19,187,Y),['house-of-york','house-of-york'])
 def test_three_georges_and_the_plantagenets(self):
  for d in self.asset['editions'].values():
   who=lambda ch,pi,pref:[m['characterId'] for m in sorted(d['mentions'],key=lambda x:x['startOffset']) if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi) and m['characterId'] in pref]
   G={'clarence','george-stanley','saint-george'}
   self.assertEqual(set(who(1,6,G)),{'clarence'})
   # "By my George, my Garter" is the Garter badge, not either man.
   self.assertEqual(set(who(19,133,G)),{'saint-george'});self.assertEqual(set(who(23,163,G)),{'george-stanley'})
   P={'richard-iii','edward-lancaster','girl','prince-edward','edward-clarence'}
   self.assertEqual(set(who(16,1,P)),{'girl'})
   self.assertEqual(set(who(4,80,P)),{'edward-lancaster'})
 def test_lady_grey_is_the_queen(self):
  for d in self.asset['editions'].values():
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   # "My Lady Grey his wife" is Queen Elizabeth under her first husband's name,
   # not either of the Lord Greys at court; and Rivers' own name is Woodville.
   self.assertIn('queen-elizabeth',at(1,9));self.assertNotIn('grey',at(1,9))
   self.assertIn('rivers',at(1,9))
   self.assertTrue(any(m['text']=='Antony Woodville' and m['characterId']=='rivers' for m in d['mentions']))
 def test_gates_and_invented_names(self):
  for d in self.asset['editions'].values():
   c={x['id']:x for x in d['characters']}
   self.assertNotIn('King Richard',c['richard-iii']['snapshots'][0]['body'])
   for id,ch,pi in [('richard-iii',15,52),('anne',2,91),('anne',16,19),('buckingham',17,76),('queen-elizabeth',6,17),('stanley',23,32)]:
    self.assertTrue(any((s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex'])==(ch,pi) for s in c[id]['snapshots'][1:]),(id,ch,pi))
   for id in ['humphrey-hower','jockey','dickon']:self.assertEqual(c[id]['kind'],'unresolved-name')
   self.assertIn('no such man exists',c['humphrey-hower']['snapshots'][0]['body'])
 def test_full_coverage_and_gate_offsets(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual((d['chapterCount'],d['paragraphCount']),(25,1420));self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   for c in d['characters']:
    self.assertIn(c['storyRole'],['central','major','supporting','reference'])
    for s in c['snapshots'][1:]:
     p=s['availableAt'];self.assertEqual(p['offset'],u16(ps[p['chapterNumber'],p['paragraphIndex']]))
if __name__=='__main__':unittest.main()
