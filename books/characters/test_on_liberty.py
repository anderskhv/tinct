import hashlib,json,re,unittest
from build_on_liberty import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class OnLibertyContractTests(unittest.TestCase):
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
 def test_antoninus_is_marcus_not_another_emperor(self):
  for d in self.asset['editions'].values():
   self.assertTrue(any(m['text']=='Antoninus' and m['characterId']=='marcus' for m in d['mentions']))
 def test_incarnate_references_identify_christ(self):
  for d in self.asset['editions'].values():
   for pi,text in [(12,'Almighty'),(13,'God'),(36,'Master')]:
    self.assertTrue(any(m['chapterNumber']==2 and m['paragraphIndex']==pi and m['text']==text and m['characterId']=='jesus' for m in d['mentions']))
 def test_complete_reference_scope_and_literary_barnwell(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],[]);self.assertEqual(len(d['characters']),33)
   for c in d['characters']:self.assertEqual(c['storyRole'],'reference')
   self.assertEqual(next(c['kind'] for c in d['characters'] if c['id']=='barnwell'),'literary-figure')
if __name__=='__main__':unittest.main()
