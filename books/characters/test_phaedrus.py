import hashlib,json,unittest
from build_phaedrus import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve,reminder
class PhaedrusContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_hashes_and_resolution(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_categories_and_present_speakers(self):
  for d in self.asset['editions'].values():
   cs={c['id']:reminder(d,c['id'],c['firstMention']) for c in d['characters']}
   for id in ['socrates','phaedrus']:self.assertEqual(cs[id]['role'],'central')
   self.assertEqual(cs['lysias']['role'],'major');self.assertIn('speechwriter',cs['lysias']['body']);self.assertNotIn('young',cs['phaedrus']['body'])
   self.assertTrue(all(c['role']=='reference' for id,c in cs.items() if id not in ['socrates','phaedrus','lysias']))
 def test_here_is_hera_only_in_two_contexts(self):
  for ed,d in self.asset['editions'].items():
   ms=[m for m in d['mentions'] if m['characterId']=='hera'];self.assertEqual([(m['chapterNumber'],m['paragraphIndex']) for m in ms],[(1,32),(4,21)])
   self.assertTrue(all(m['text']==('Here' if ed=='original-en' else 'Hera') for m in ms))
 def test_eleatic_palamedes_and_other_comparisons(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if m['chapterNumber']==5 and m['paragraphIndex']==58]
   self.assertTrue(any(m['text']=='Eleatic Palamedes' and m['characterId']=='zeno' for m in ms));self.assertFalse(any(m['characterId']=='palamedes' for m in ms))
   self.assertTrue(any(m['characterId']=='palamedes' and m['paragraphIndex']==48 for m in d['mentions']))
   ms=[m for m in d['mentions'] if m['chapterNumber']==5 and m['paragraphIndex']==49]
   self.assertEqual(set(m['characterId'] for m in ms),{'phaedrus','nestor','odysseus','gorgias','thrasymachus','theodorus'})
 def test_fathers_doctors_and_egyptian_names(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c['snapshots'][0] for c in d['characters']}
   self.assertIn('Phaedrus’s father',cs['pythocles']['body']);self.assertIn('Stesichorus’s father',cs['euphemus']['body']);self.assertIn('Eryximachus’s father',cs['acumenus']['body']);self.assertIn('Acumenus’s son',cs['eryximachus']['body'])
   self.assertTrue(any(m['text']=='Ammon' and m['characterId']=='thamus' for m in d['mentions']));self.assertIn('Thoth',cs['theuth']['body'])
 def test_imagined_speakers_and_allegories(self):
  for d in self.asset['editions'].values():
   for id,ch,pi in [('lysias-youth',1,9),('nonlover',1,9),('socrates-youth',3,27),('cunning-lover',3,27),('bronze-maiden',5,115)]:
    c=next(c for c in d['characters'] if c['id']==id);self.assertEqual((c['firstMention']['chapterNumber'],c['firstMention']['paragraphIndex']),(ch,pi))
   self.assertFalse(any(m['text'] in ['Cratylus','Charmides','Anteros','Modesty','Destiny'] for m in d['mentions']))
 def test_source_specific_coverage_without_recaps(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),89 if ed=='original-en' else 88);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[] if ed=='original-en' else ['cicero'])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1)
if __name__=='__main__':unittest.main()
