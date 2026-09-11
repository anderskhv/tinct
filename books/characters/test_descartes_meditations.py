import hashlib,json,re,unittest
from build_descartes_meditations import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class DescartesContractTests(unittest.TestCase):
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
 def test_deceiver_context_not_every_use(self):
  for d in self.asset['editions'].values():
   demon=[m for m in d['mentions'] if m['characterId']=='demon']
   self.assertEqual(len(demon),4)
   self.assertEqual({(m['chapterNumber'],m['paragraphIndex']) for m in demon},{(4,11),(5,2),(5,5)})
   c=next(c for c in d['characters'] if c['id']=='demon');self.assertIn('thought experiment',c['snapshots'][0]['body'])
 def test_reference_scope_and_mathematicians(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],[]);self.assertEqual(len(d['characters']),6)
   for c in d['characters']:self.assertEqual(c['storyRole'],'reference');self.assertEqual(len(c['snapshots']),1)
   self.assertTrue({'archimedes','apollonius','pappus'}.issubset({m['characterId'] for m in d['mentions'] if m['chapterNumber']==1 and m['paragraphIndex']==5}))
if __name__=='__main__':unittest.main()
