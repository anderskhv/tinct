import hashlib,json,unittest
from build_henry_v import compile_package,BASE
from build_pilot import ROOT,normalized,u16
from lookup_reference import resolve
class HenryVTests(unittest.TestCase):
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
 def test_repeated_given_names_stay_apart(self):
  for d in self.asset['editions'].values():
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   # Alexander Court is a private soldier; the Macedonian belongs to Fluellen's argument.
   self.assertIn('court',at(14,45));self.assertNotIn('alexander-the-great',at(14,45))
   self.assertIn('alexander-the-great',at(20,4))
   # Four Edwards, four Johns, three Richards, two Thomases.
   self.assertIn('york',at(21,39));self.assertIn('ketly',at(21,39));self.assertIn('davy-gam',at(21,39))
   self.assertIn('bar',at(21,37));self.assertIn('alencon',at(21,37));self.assertIn('brabant',at(21,37))
   self.assertIn('bates',at(14,46));self.assertIn('falstaff',at(5,4))
   self.assertIn('richard-second',at(14,91));self.assertNotIn('cambridge',at(14,91))
   self.assertIn('cambridge',at(4,27));self.assertIn('scroop',at(4,27));self.assertIn('grey',at(4,27))
   # Sir Guichard Dauphin is a surname in the roll of the dead, not the king's son.
   self.assertIn('guichard-dauphin',at(21,37));self.assertNotIn('dauphin',at(21,37))
   # The pedigree's Queen Isabel is not the queen who comes to the peace meeting.
   self.assertIn('isabel-grandmother',at(2,9));self.assertNotIn('queen-isabel',at(2,9))
   self.assertIn('queen-isabel',at(23,0));self.assertNotIn('isabel-grandmother',at(23,0))
   # Charlemagne and Charlemain are two figures in the same speech.
   self.assertIn('charles-the-great',at(2,9));self.assertIn('charlemain',at(2,9));self.assertIn('charles-lorraine',at(2,9))
 def test_bar_the_verb_is_not_the_duke(self):
  o=self.asset['editions']['original-en']
  bars=[m for m in o['mentions'] if m['characterId']=='bar' and (m['chapterNumber'],m['paragraphIndex'])==(11,8)]
  self.assertEqual(len(bars),1)
  ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/o['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
  text=ps[11,8];m=bars[0]
  self.assertTrue(text[m['startOffset']:].startswith('Bar, and Burgundy'))
 def test_two_heralds_and_two_embassies(self):
  for d in self.asset['editions'].values():
   who=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   # King Henry sends his own herald out at 20:14, before Montjoy enters at 20:15.
   self.assertIn('english-herald',who(20,14));self.assertNotIn('montjoy',who(20,14))
   for ch,pi in [(11,8),(12,42),(16,24),(16,25),(20,16),(20,18),(20,20)]:
    self.assertIn('montjoy',who(ch,pi),(ch,pi));self.assertNotIn('english-herald',who(ch,pi),(ch,pi))
   self.assertIn('english-herald',who(21,32))
   # France's embassy to England in scene 2; England's to France in scene 6.
   self.assertIn('french-ambassadors',who(2,26));self.assertIn('english-ambassadors',who(6,7))
   self.assertNotIn('english-ambassadors',who(2,26));self.assertNotIn('french-ambassadors',who(6,7))
   # Scene-local messengers are not merged across the court and the camp.
   self.assertIn('french-court-messenger',who(6,7));self.assertIn('french-camp-messenger',who(13,64))
 def test_edition_spellings_and_omissions(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  for d,cue in [(o,'KING HENRY'),(m,'KING HENRY V')]:
   self.assertTrue(any(x['text']==cue and x['characterId']=='king-henry' for x in d['mentions']))
  for d,name in [(o,'Katharine'),(m,'Katherine')]:
   self.assertTrue(any(x['text']==name and x['characterId']=='katharine' for x in d['mentions']))
  for d,name in [(o,'Charles the Great'),(m,'Charlemagne')]:
   self.assertTrue(any(x['text']==name and x['characterId']=='charles-the-great' for x in d['mentions']))
  # The Welsh saint keeps three spellings in the original and one in the modern,
  # and is never confused with the esquire Davy Gam in the roll of the dead.
  self.assertEqual({x['text'] for x in o['mentions'] if x['characterId']=='saint-david'},{'Saint Davy','Saint Tavy'})
  self.assertEqual({x['text'] for x in m['mentions'] if x['characterId']=='saint-david'},{'Saint David'})
  for d in (o,m):self.assertTrue(any(x['text']=='Davy Gam' and x['characterId']=='davy-gam' for x in d['mentions']))
  # Two figures survive only in the original: the modern replaces them with common nouns.
  self.assertEqual(sorted(self.report['editions']['modern-en']['omittedEntities']),['barbason','parca'])
  self.assertEqual(self.report['editions']['original-en']['omittedEntities'],[])
 def test_ordinary_identity_and_gates(self):
  for d in self.asset['editions'].values():
   c={x['id']:x for x in d['characters']}
   self.assertIn('brother',c['gloucester']['snapshots'][0]['body'])
   self.assertIn('Katharine’s father',c['french-king']['snapshots'][0]['body'])
   # The King's assumed name is released where he gives it, not before.
   self.assertNotIn('Le Roy',c['king-henry']['snapshots'][0]['body'])
   for id,ch,pi in [('king-henry',14,22),('king-henry',21,22),('pistol',3,11),('hostess',3,11),('falstaff',5,2),('katharine',23,13),('bardolph',12,32)]:
    self.assertTrue(any((s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex'])==(ch,pi) for s in c[id]['snapshots'][1:]),(id,ch,pi))
   # Falstaff's death is not written into his first card; Agincourt is not named early.
   self.assertNotIn('died',c['falstaff']['snapshots'][0]['body'])
   self.assertNotIn('Agincourt',c['king-henry']['snapshots'][0]['body'])
   # The marriage is agreed at the end but never performed on stage.
   for s in c['katharine']['snapshots']:self.assertNotIn('wife',s['body'])
 def test_full_coverage_and_gate_offsets(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual((d['chapterCount'],d['paragraphCount']),(23,883))
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   for c in d['characters']:
    self.assertIn(c['storyRole'],['central','major','supporting','reference'])
    for s in c['snapshots'][1:]:
     p=s['availableAt'];self.assertEqual(p['offset'],u16(ps[p['chapterNumber'],p['paragraphIndex']]))
if __name__=='__main__':unittest.main()
