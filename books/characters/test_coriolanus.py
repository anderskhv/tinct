import hashlib,json,unittest
from build_coriolanus import compile_package,BASE
from build_pilot import ROOT,normalized,u16
from lookup_reference import resolve
class CoriolanusTests(unittest.TestCase):
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
 def test_martian_namesakes(self):
  for d in self.asset['editions'].values():
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   # The Senate's genealogy is a family, not the man standing in front of them.
   self.assertIn('ancus-martius',at(13,97));self.assertNotIn('coriolanus',at(13,97))
   self.assertTrue(any(m['text']=='Ancus Martius' and m['characterId']=='ancus-martius' for m in d['mentions']))
   self.assertTrue(any(m['text']=='Martians' and m['characterId']=='martians-house' for m in d['mentions']))
   # A Volscian's dead cousin Marcus is not the Roman the crowd is shouting at.
   self.assertEqual(at(29,45),{'marcus-volscian'})
   # Young Martius wins the longer span from his father's name.
   young=[m for m in d['mentions'] if m['characterId']=='young-martius']
   self.assertEqual(len(young),3);self.assertTrue(all('Martius' in m['text'] and m['text']!='Martius' for m in young))
   # Every bare Martius otherwise is the central figure.
   self.assertTrue(all(m['characterId']=='coriolanus' for m in d['mentions'] if m['text']=='Martius'))
 def test_earned_name_and_banishment(self):
  for d in self.asset['editions'].values():
   c={x['id']:x for x in d['characters']}
   # Both cues, MARTIUS before the name is given and CORIOLANUS after, are one man.
   self.assertTrue(any(m['text']=='MARTIUS' and m['characterId']=='coriolanus' for m in d['mentions']))
   self.assertTrue(any(m['text']=='CORIOLANUS' and m['characterId']=='coriolanus' for m in d['mentions']))
   # His first card does not carry the name he has not yet earned.
   self.assertNotIn('Coriolanus',c['coriolanus']['snapshots'][0]['body'])
   self.assertNotIn('banish',c['coriolanus']['snapshots'][0]['body'])
   self.assertEqual([(s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex']) for s in c['coriolanus']['snapshots'][1:]],[(9,11),(16,60)])
 def test_scene_local_roles_and_the_two_agents(self):
  for ed,d in self.asset['editions'].items():
   at=lambda ch,pi:{m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   # Two gentlewomen in one scene, each bound where she belongs.
   self.assertEqual(at(3,4),{'virgilia-gentlewoman'});self.assertIn('valeria-gentlewoman',at(3,13))
   # The Roman cue is Nicanor and the Volscian cue is Adrian; each names the other.
   self.assertIn('nicanor',at(19,1));self.assertIn('adrian',at(19,1))
   cue='VOLSCE' if ed=='original-en' else 'VOLSCIAN'
   self.assertTrue(any(m['text']==cue and m['characterId']=='adrian' for m in d['mentions']))
   self.assertTrue(any(m['text']=='ROMAN' and m['characterId']=='nicanor' for m in d['mentions']))
   # Cotus is called for by name and never brought on; he is not merged into a cue.
   self.assertEqual({(m['chapterNumber'],m['paragraphIndex']) for m in d['mentions'] if m['characterId']=='cotus'},{(21,4)})
 def test_stock_names_and_edition_spelling(self):
  o,m=self.asset['editions']['original-en'],self.asset['editions']['modern-en']
  for d in (o,m):
   c={x['id']:x for x in d['characters']}
   self.assertEqual(c['hob-and-dick']['kind'],'unresolved-name')
   self.assertIn('not two men of the play',c['hob-and-dick']['snapshots'][0]['body'])
   self.assertEqual({m2['text'] for m2 in d['mentions'] if m2['characterId']=='hob-and-dick'},{'Hob','Dick'})
  # The huntress is Dian in the original and Diana in the modern at 26:24.
  self.assertTrue(any(x['text']=='Dian' and x['characterId']=='diana' for x in o['mentions']))
  self.assertTrue(any(x['text']=='Diana' and x['characterId']=='diana' for x in m['mentions']))
 def test_full_coverage_and_gate_offsets(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual((d['chapterCount'],d['paragraphCount']),(29,1379));self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   ps={(c['number'],i):normalized(p) for c in json.loads((ROOT/d['sourcePath']).read_bytes())['chapters'] for i,p in enumerate(c['paragraphs'])}
   for c in d['characters']:
    self.assertIn(c['storyRole'],['central','major','supporting','reference'])
    for s in c['snapshots'][1:]:
     p=s['availableAt'];self.assertEqual(p['offset'],u16(ps[p['chapterNumber'],p['paragraphIndex']]))
if __name__=='__main__':unittest.main()
