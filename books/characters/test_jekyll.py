import hashlib,json,unittest
from build_jekyll import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,reminder,gallery
class JekyllContractTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.asset,cls.report,_=compile_package()
 def test_saved_package_current(self):self.assertEqual(self.asset,json.loads((BASE/'characters.v1.json').read_text()))
 def test_spans_and_hashes(self):
  for d in self.asset['editions'].values():
   raw=(ROOT/d['sourcePath']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),d['sourceSha256']);seen=set()
   ps={(c['number'],i):normalized(p) for c in json.loads(raw)['chapters'] for i,p in enumerate(c['paragraphs'])}
   for m in d['mentions']:
    k=(m['chapterNumber'],m['paragraphIndex'],m['startOffset'],m['endOffset']);self.assertNotIn(k,seen);seen.add(k);text=ps[k[:2]]
    self.assertEqual(text.encode('utf-16-le')[2*k[2]:2*k[3]].decode('utf-16-le'),m['text']);self.assertEqual(resolve(d,*k,text)['id'],m['characterId'])
 def test_transformation_withheld_until_explicit_identification(self):
  for d in self.asset['editions'].values():
   for id in ['jekyll','hyde']:
    c=next(c for c in d['characters'] if c['id']==id);s=c['snapshots'][-1];at=s['availableAt'];self.assertEqual((at['chapterNumber'],at['paragraphIndex']),(9,32))
    before=reminder(d,id,{**at,'offset':at['offset']-1});self.assertNotIn('transform',before['body']);self.assertNotIn('altered physical',before['body'])
    self.assertEqual(reminder(d,id,at)['body'],s['body']);self.assertEqual(reminder(d,id,c['firstMention'])['body'],c['snapshots'][0]['body'])
 def test_distinct_maids_and_doctors(self):
  for d in self.asset['editions'].values():
   def owners(ch,pi):return {m['characterId'] for m in d['mentions'] if (m['chapterNumber'],m['paragraphIndex'])==(ch,pi)}
   self.assertIn('witness-maid',owners(4,0));self.assertNotIn('jekyll-housemaid',owners(4,0));self.assertIn('jekyll-housemaid',owners(8,18))
   self.assertIn('girl-doctor',owners(1,7));self.assertNotIn('lanyon',owners(1,7));self.assertNotIn('jekyll',owners(1,7))
 def test_children_not_revealed_as_victims_at_first_selection(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='girl');self.assertNotIn('trampled',c['snapshots'][0]['body'])
 def test_minor_references_preserved(self):
  for d in self.asset['editions'].values():
   self.assertTrue({'fell','damon','pythias','denman','locksmith','carpenter','knife-boy'}<={c['id'] for c in d['characters']})
   self.assertNotIn('denman',{c['id'] for c in gallery(d,point(1,27,99999))})
if __name__=='__main__':unittest.main()
