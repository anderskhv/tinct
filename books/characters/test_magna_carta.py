import hashlib,json,re,unittest
from build_magna_carta import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class MagnaCartaContractTests(unittest.TestCase):
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
 def test_duplicate_first_names_are_distinct(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if m['paragraphIndex']==0]
   ids={m['characterId'] for m in ms}
   self.assertTrue({'william-london','william-coventry','william-salisbury','william-warren','william-arundel','william-marshal'}.issubset(ids))
   self.assertNotIn('william-scotland',ids)
 def test_geoffreys_and_peters_not_merged(self):
  for d in self.asset['editions'].values():
   ids={m['characterId'] for m in d['mentions'] if m['paragraphIndex']==50}
   self.assertTrue({'geoffrey-martigny','geoffrey-nephew','peter-chanceaux'}.issubset(ids))
   self.assertNotIn('peter-winchester',ids);self.assertNotIn('peter-herbert',ids)
 def test_complete_reference_coverage_without_future_history(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:
    self.assertEqual(c['storyRole'],'reference');self.assertEqual(len(c['snapshots']),1)
   self.assertEqual(next(m['paragraphIndex'] for m in d['mentions'] if m['characterId']=='barons'),52)
if __name__=='__main__':unittest.main()
