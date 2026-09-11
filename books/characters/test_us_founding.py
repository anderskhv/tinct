import hashlib,json,re,unittest
from build_us_founding import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class USFoundingContractTests(unittest.TestCase):
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
 def test_only_attested_individuals(self):
  for d in self.asset['editions'].values():
   self.assertEqual({c['id'] for c in d['characters']},{'george-iii','god','jesus'})
   self.assertEqual(len(d['mentions']),7)
 def test_place_name_and_generic_prince_are_not_people(self):
  for d in self.asset['editions'].values():
   self.assertFalse(any(m['chapterNumber']==2 and m['paragraphIndex'] in {5,51} for m in d['mentions']))
   self.assertFalse(any(m['chapterNumber'] in {3,4} for m in d['mentions']))
 def test_reference_categories_and_no_phantom_signers(self):
  for d in self.asset['editions'].values():
   for c in d['characters']:self.assertEqual(c['storyRole'],'reference')
   self.assertFalse({'washington','jefferson','franklin','madison'} & {c['id'] for c in d['characters']})
if __name__=='__main__':unittest.main()
