import hashlib,json,re,unittest
from build_poetics import compile_package,BASE
from build_pilot import ROOT,normalized,point
from lookup_reference import resolve,gallery
class PoeticsContractTests(unittest.TestCase):
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
 def test_reference_roles_in_this_book(self):
  for ed,d in self.asset['editions'].items():
   self.assertEqual(self.report['editions'][ed]['omittedEntities'],[]);self.assertEqual(len(d['characters']),105)
   for c in d['characters']:self.assertEqual(c['storyRole'],'reference');self.assertEqual(len(c['snapshots']),1)
 def test_cleon_father_and_son(self):
  for d in self.asset['editions'].values():
   ms=[m for m in d['mentions'] if m['chapterNumber']==20 and m['paragraphIndex']==7 and m['text']=='Cleon']
   self.assertEqual([m['characterId'] for m in ms],['cleon','cleon-father'])
 def test_actors_and_critic_not_unrelated_namesakes(self):
  for d in self.asset['editions'].values():
   chars={c['id']:c['snapshots'][0]['body'] for c in d['characters']}
   self.assertIn('performer',chars['pindarus']);self.assertIn('critic',chars['glaucon']);self.assertIn('Thasian',chars['hegemon'])
   self.assertTrue(any(m['characterId']=='sosistratus' for m in d['mentions']))
if __name__=='__main__':unittest.main()
