import hashlib,json,re,unittest
from build_midsummer import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class MidsummerContractTests(unittest.TestCase):
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
   for (ch,pi),text in ps.items():
    if re.match(r'^[A-Z][A-Z ]+\.',text):self.assertTrue(any(m['chapterNumber']==ch and m['paragraphIndex']==pi and m['startOffset']==0 for m in d['mentions']))
 def test_helens_have_three_identities(self):
  for d in self.asset['editions'].values():
   for ch,pi,id in [(1,51,'helena'),(9,2,'helen-troy'),(9,53,'hero')]:
    self.assertTrue(any(m['chapterNumber']==ch and m['paragraphIndex']==pi and m['characterId']==id for m in d['mentions']))
 def test_robin_starveling_is_not_puck(self):
  for d in self.asset['editions'].values():
   for pi in [23,25]:
    ms=[m for m in d['mentions'] if m['chapterNumber']==2 and m['paragraphIndex']==pi]
    self.assertIn('starveling',{m['characterId'] for m in ms});self.assertNotIn('puck',{m['characterId'] for m in ms})
 def test_transformation_and_love_gates(self):
  for d in self.asset['editions'].values():
   bottom=next(c for c in d['characters'] if c['id']=='bottom')
   self.assertNotIn('ass',bottom['snapshots'][0]['body'])
   self.assertEqual([(s['availableAt']['chapterNumber'],s['availableAt']['paragraphIndex']) for s in bottom['snapshots'][1:]],[(5,40),(7,29)])
   dem=next(c for c in d['characters'] if c['id']=='demetrius')
   self.assertNotIn('Helena',dem['snapshots'][0]['body'])
 def test_roles_are_distinct_from_actors(self):
  for d in self.asset['editions'].values():
   for pi,id in [(38,'wall'),(69,'lion'),(76,'moonshine')]:
    self.assertTrue(any(m['chapterNumber']==9 and m['paragraphIndex']==pi and m['startOffset']==0 and m['characterId']==id for m in d['mentions']))
   self.assertNotIn('lion',{m['characterId'] for m in d['mentions'] if m['chapterNumber']==9 and m['paragraphIndex']==125})
if __name__=='__main__':unittest.main()
