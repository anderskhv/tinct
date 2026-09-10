import hashlib,json,re,unittest
from build_communist_manifesto import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class ManifestoContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_exact_spans_hashes_and_speakers(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_opening_titles_are_historical_identities(self):
  for d in self.asset['editions'].values():
   chars={c['id']:c['snapshots'][0] for c in d['characters']}
   self.assertEqual(chars['pius']['name'],'Pope Pius IX');self.assertEqual(chars['nicholas']['name'],'Nicholas I')
 def test_movements_not_mistaken_for_people(self):
  for d in self.asset['editions'].values():
   self.assertFalse(any(m['chapterNumber']==4 and m['paragraphIndex']==61 for m in d['mentions']))
 def test_complete_reference_scope(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],[]);self.assertEqual(len(d['characters']),10)
   for c in d['characters']:self.assertEqual(c['storyRole'],'reference');self.assertEqual(len(c['snapshots']),1)
if __name__=='__main__':unittest.main()
