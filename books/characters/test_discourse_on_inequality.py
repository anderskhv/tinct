import hashlib,json,unittest
from build_discourse_on_inequality import compile_package,BASE
from build_pilot import ROOT,normalized
from lookup_reference import resolve
class InequalityTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_and_fingerprints(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_two_plinys(self):
  for d in self.asset['editions'].values():
   for ch,pi,word,id in [(2,4,'Plinys','pliny-elder'),(4,42,'Pliny','pliny-younger')]:self.assertTrue(any((m['chapterNumber'],m['paragraphIndex'],m['text'],m['characterId'])==(ch,pi,word,id) for m in d['mentions']))
 def test_implicit_references_and_tyrant(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']}
   for id,ch,pi in [('isaac',1,16),('adam',2,22),('montesquieu',3,5),('mandeville',3,33),('alexander',3,34)]:self.assertEqual((cs[id]['firstMention']['chapterNumber'],cs[id]['firstMention']['paragraphIndex']),(ch,pi))
   self.assertIn('Thessalian tyrant',cs['alexander']['snapshots'][0]['body'])
 def test_attributed_history_not_conjectural_identity(self):
  for d in self.asset['editions'].values():
   cs={c['id']:c for c in d['characters']};self.assertIn('attributes',cs['brasidas']['snapshots'][0]['body']);self.assertEqual(cs['satrap']['kind'],'unnamed-role');self.assertIn('sea god',cs['glaucus']['snapshots'][0]['body'])
 def test_whole_scope_and_reference_categories(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(len(d['characters']),45);self.assertEqual(d['paragraphCount'],170);self.assertEqual(d['chapterCount'],4);self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:self.assertEqual(c['storyRole'],'reference');self.assertEqual(len(c['snapshots']),1)
if __name__=='__main__':unittest.main()
