import hashlib,json,re,unittest
from build_medea import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class MedeaContractTests(unittest.TestCase):
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
 def test_children_are_distinct_without_invented_names(self):
  for d in self.asset['editions'].values():
   for pi,id in [(14,'first-child'),(15,'second-child'),(17,'first-child'),(18,'second-child')]:
    self.assertTrue(any(m['chapterNumber']==7 and m['paragraphIndex']==pi and m['characterId']==id for m in d['mentions']))
   self.assertNotIn('first-child',{c['id'] for c in gallery(d,point(1,19,99999))})
 def test_this_creon_is_king_of_corinth(self):
  for d in self.asset['editions'].values():
   c=next(c for c in d['characters'] if c['id']=='creon');self.assertIn('Corinth',c['snapshots'][0]['body']);self.assertNotIn('Thebes',c['snapshots'][0]['body'])
 def test_no_omissions_or_outcome_recaps(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],[])
   for c in d['characters']:self.assertEqual(len(c['snapshots']),1)
   self.assertEqual(len([m for m in d['mentions'] if m['characterId']=='helios']),5)
if __name__=='__main__':unittest.main()
